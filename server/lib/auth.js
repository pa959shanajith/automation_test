var authRouter = require("express").Router();
var passport = require("passport");
var activeDirectory = require('activedirectory');
var LocalStrategy = require("passport-local").Strategy;
var SamlStrategy = require("passport-saml").Strategy;
var OpenIdClientStrategy = require('openid-client').Strategy;
var OpenIdClientIssuer = require('openid-client').Issuer;
var Negotiator = require('negotiator');
var fs = require("fs");
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.NDAC_URL;
var logger = require("../../logger");
var utils = require('./utils');
var ssoEnabled = process.env.ENABLE_SSO.toLowerCase().trim() == "true";
var strategy = (ssoEnabled)? process.env.SSO_PROTOCOL.toLowerCase().trim():"inhouse";
var config = require("../config/config.json");
var callbackPath = "/login/callback";
config = (config[strategy])? config[strategy]:config;
if (config.redirectURI) {
	callbackPath = config.redirectURI.replace("http://",'').replace("https://",'');
	callbackPath = callbackPath.replace(callbackPath.split('/')[0],'');
}

function authenticateLDAP(ldapdata, cb) {
	logger.info("Inside authenticateLDAP function");
	var args = {
		data: { "name": ldapdata.server },
		headers: { "Content-Type": "application/json" }
	};
	client.post(epurl + "admin/getLDAPConfig", args,
		function (result, response) {
		if (result.rows.length === 0) cb("empty");
		else if (response.statusCode != 200 || result.rows == "fail") {
			logger.error("Error occurred in admin/getLDAPConfig Error Code : ERRNDAC");
			cb("fail");
		} else {
			result = result.rows;
			var ad_config = {
				url: result.url,
				baseDN: result.basedn,
			};
			if (result.auth == "simple") {
				ad_config.bindDN = result.binddn;
				ad_config.bindCredentials = result.bindcredentials;
			}
			var ad = new activeDirectory(ad_config);
			ad.authenticate(ldapdata.user, ldapdata.password, function (err, auth) {
				if (err) {
					logger.error("Error occurred in ldap authentication");
					logger.debug("Error occurred in ldap authentication : " + JSON.stringify(err));
					cb("fail");
				}
				else if (auth) cb("pass");
				else cb("fail");
			});
		}
	});
}

var strategyUtil = {
	"inhouse": function inhouse(opts){
		var async = require('async');
		var bcrypt = require('bcryptjs');
		var validator = require('validator');

		var localStrategy = new LocalStrategy(function (username, password, done) {
			var valid_username = validator.isLength(username, 1, 100);
			var valid_password = validator.isLength(password, 1, 100);
			if (!(valid_username && valid_password)) return done(null, null, "invalid_username_password");
			var flag = 'inValidCredential';
			var validUser = false;
			var ldap_flag = false;
			async.waterfall([
				function authenticateUser(callback){
					logger.info("Inside function authenticateUser");
					var args = {
						data: { "username": username },
						headers: { "Content-Type": "application/json" }
					};
					logger.info("Calling NDAC Service : loadUser_Nineteen68");
					client.post(epurl + "login/loadUser_Nineteen68", args, function (result, response) {
						if (response.statusCode != 200 || result.rows == "fail") {
							logger.error("Error occurred in loadUser_Nineteen68 Error Code : ERRNDAC");
							callback('fail')
						}else if (result.rows == null) return callback("invalid_username_password");
						else if (result.rows.ldapuser.server != undefined) {    // LDAP Authentication
							var resp = result.rows.ldapuser;
							logger.info("Calling In-House Authentication");
							resp.password = password;
							authenticateLDAP(resp, function (ldapdata) {
								if (ldapdata == "empty" || ldapdata == "fail") callback("inValidLDAPServer");
								else if (ldapdata == "pass") {
									validUser = true;
									ldap_flag = true;
									callback(null);
								}
							});
						} else {    // In-House Authentication
							logger.info("Calling In-House Authentication");
							try {
								var dbHashedPassword = result.rows.password;
								validUser = bcrypt.compareSync(password, dbHashedPassword); // true
								callback(null);
							} catch (exception) {
								logger.error(exception.message);
								callback("fail");
							}
						}
					});
				}
			], function(err) {
				if (err) flag = err;
				if (!validUser) return done(null, null, flag);
				else return done(null, {"username": username, "ldap_flag": ldap_flag}, "validCredential");
			});
		});
		passport.use('local', localStrategy);
		passport.isReady = true;
		return passport;
	},
	"oidc": function openid_connect(opts){
		var userAgent = OpenIdClientIssuer.defaultHttpOptions.headers['User-Agent'];
		userAgent = (userAgent && typeof userAgent === 'string')? userAgent.split(' ')[0]:'';
		userAgent = "Nineteen68 Webserver "+userAgent+" node/"+process.versions.node;
		OpenIdClientIssuer.defaultHttpOptions.headers['User-Agent'] = userAgent;
		OpenIdClientIssuer.defaultHttpOptions.timeout = 10000;
		var issuer = config.identitityProviderURL;
		//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		OpenIdClientIssuer.discover(issuer).then(function(iss) {
			var client = new iss.Client({
				client_id: config.clientId,
				client_secret: config.clientSecret,
				redirect_uris: [ config.redirectURI ]
			});
			client.CLOCK_TOLERANCE = 120;
			return client;
		}).then(function(client){
			var oidcStrategy = new OpenIdClientStrategy({
				params: {
					scope: "openid profile email"
				},
				sessionKey: "oidc:"+issuer,
				client: client
			}, function(tokenSet, userinfo, done) {
				if (tokenSet && userinfo && userinfo[opts.username]) {
					userinfo.username = userinfo[opts.username];
					return done(null, userinfo);
				}
				else return done(null, false, "invalid_username_password");
			});

			passport.use("oidc", oidcStrategy);
			passport.isReady = true;
			if (passport.onReadyCallback) passport.onReadyCallback.apply(this);
		}).catch(function(err){
			logger.error(err);
			//throw "Invalid values in SSO configuration. Please provide valid values in config.json file";
			logger.error("Invalid values in SSO configuration. Please provide valid values in config.json file");
		});
		return passport;
	},
	"saml": function saml_2(opts){
		var BEGIN_CERT = "-----BEGIN CERTIFICATE-----\n";
		var END_CERT = "-----END CERTIFICATE-----\n";
		config.cert=fs.readFileSync(config.cert, 'utf-8').replace(BEGIN_CERT,'').replace(END_CERT,'');
		var samlStrategy = new SamlStrategy({
			issuer: config.issuer || "SLK Nineteen68 Webserver",
			callbackUrl: config.redirectURI,
			entryPoint: config.acsURL,
			cert: config.cert, //privateCert, decryptionPvk,
			acceptedClockSkewMs: 120
		}, function (profile, done) {
			if (profile && profile[opts.username]) {
				profile.username = profile[opts.username];
				return done(null, profile);
			}
			else return done(null, null, "invalid_username_password");
		});
		passport.use("saml", samlStrategy);
		passport.isReady = true;
		return passport;
	}
};

var routeUtil = {
	"inhouse": function inhouse(opts){
		authRouter.get(opts.route.login, function(req, res) {
			if (req.session.uniqueId) utils.cloneSession(req, function(err){
				return res.sendFile("app.html", { root: __dirname + "/../../public/" });
			});
			else return res.sendFile("app.html", { root: __dirname + "/../../public/" });
		});
		authRouter.post(opts.route.login, function (req, res, next){
			logger.info("Inside UI service: login");
			// Credentials for service user that can restart services
			if (req.body.username == "restartservice" && req.body.password == "r3Start@3") return res.send("restart");
			return passport.authenticate("local", {
				successRedirect: opts.route.success, failureRedirect: opts.route.failure, failureMessage: true
			}, function(err, user, info){
				if (!user || req.body.query == "api") res.send(info);
				else req.logIn(user, function(err) {
					if (err) return next(err);
					return res.send(info);
				});
			})(req, res, next);
		});
		return authRouter;
	},
	"oidc": function openid_connect(opts){
		var callbackHandler = passport.authenticate("oidc", {
			successRedirect: opts.route.success, failureRedirect: opts.route.failure, failureMessage: true
		});
		authRouter.use(opts.route.login, callbackHandler);
		authRouter.use(callbackPath, callbackHandler);
		return authRouter;
	},
	"saml": function saml_2(opts){
		var callbackHandler = passport.authenticate("saml", {
			successRedirect: opts.route.success, failureRedirect: opts.route.failure, failureMessage: true
		});
		authRouter.get(opts.route.login, callbackHandler);
		authRouter.post(callbackPath, callbackHandler);
		return authRouter;
	}
};

module.exports = function auth(options){
	passport.serializeUser(function(user, done) {done(null, user);});
	passport.protect = function protect(req, res, next) {
		if (req.isAuthenticated && req.isAuthenticated()) return next();
		var negotiator = new Negotiator(req);
		if (negotiator.mediaType() === 'text/html') return res.redirect(options.route.login);
		else return res.send("Invalid Session");
	};
	passport.deserializeUser(function(user, done) {done(null, user);});
	passport = strategyUtil[strategy](options);
	authRouter.use(passport.initialize({ userProperty: "user" }));
	authRouter.use(passport.session());
	authRouter = routeUtil[strategy](options);
	authRouter.use(function(err, req, res, next){
		res.status(401);
		next(err);
	});
	return {
		strategy: strategy,
		util: passport,
		router: authRouter
	};
};