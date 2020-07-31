let authRouter = require("express").Router();
let passport = require("passport");
const bcrypt = require('bcryptjs');
const activeDirectory = require('activedirectory');
const LocalStrategy = require("passport-local").Strategy;
const SamlStrategy = require("passport-saml").Strategy;
const OpenIdClientStrategy = require('openid-client').Strategy;
const OpenIdClientIssuer = require('openid-client').Issuer;
const Negotiator = require('negotiator');
const logger = require("../../logger");
const utils = require('./utils');
const strategies = []; // Store all registered strategies

const strategyUtil = {
	"inhouse": async () => {
		const localStrategy = new LocalStrategy(async (username, password, done) => {
			const fnName = "setupInhouseStrategy";
			if (!(username && password)) return done(null, null, "invalid_username_password");
			let flag = 'inValidCredential';
			let userInfo = null;
			const inputs = 	{ username };
			const user = await utils.fetchData(inputs, "login/loadUser", fnName);
			if (user == "fail") flag = "fail";
			else if (!user) flag = "invalid_username_password";
			else {
				const dbHashedPassword = user.auth.password;
				try {
					const authResult = bcrypt.compareSync(password, dbHashedPassword);
					if (authResult) {
						flag = "validCredential";
						userInfo = {
							username,
							"type": "inhouse"
						};
					}
				} catch (exception) {
					logger.error("Error occurred in user authentication: " + exception.message.toString());
					flag = "fail";
				}
			}
			return done(null, userInfo, flag);
		});
		return localStrategy;
	},
	"ldap": async opts => {
		const adConfig = {
			url: opts.url,
			baseDN: opts.basedn,
		};
		if (opts.auth == "simple") {
			adConfig.bindDN = opts.binddn;
			adConfig.bindCredentials = opts.bindcredentials;
		}
		const ad = new activeDirectory(adConfig);
		const ldapStrategy = new LocalStrategy(async (username, password, done) => {
			const fnName = "setupLDAPStrategy";
			if (!(username && password)) return done(null, null, "invalid_username_password");
			let flag = 'inValidCredential';
			let userInfo = null;
			const inputs = 	{ username };
			const user = await utils.fetchData(inputs, "login/loadUser", fnName);
			if (user == "fail") flag = "fail";
			else if (!user) flag = "invalid_username_password";
			else if (!user.auth.user) flag = "invalidUserConf";
			else {
				const userdn = user.auth.user;
				const authResult = await (new Promise((rsv, rej) => {
					ad.authenticate(userdn, password, (err, auth) => {
						if (err) {
							const errm = err.lde_message;
							if (errm && (errm.includes("DSID-0C0903A9") || errm.includes("DSID-0C090400") || errm.includes("DSID-0C090442")))
								return rsv("inValidCredential");
							logger.debug("Error occurred in ldap authentication : " + JSON.stringify(err));
							rsv("fail");
						} else if (auth) rsv("pass");
						else rsv("inValidCredential"); // rsv("fail");
					});
				}));
				if (authResult == "fail") flag = "inValidLDAPServer";
				else if (authResult != "pass") flag = authResult;
				else if (authResult == "pass") {
					flag = "validCredential";
					userInfo = {
						username,
						"type": "ldap"
					};
				}
			}
			return done(null, userInfo, flag);
		});
		return ldapStrategy;
	},
	"oidc": async opts => {
		let userAgent = OpenIdClientIssuer.defaultHttpOptions.headers['User-Agent'];
		userAgent = (userAgent && typeof userAgent === 'string')? userAgent.split(' ')[0]:'';
		userAgent = "Avo Assure Webserver "+userAgent+" node/"+process.versions.node;
		OpenIdClientIssuer.defaultHttpOptions.headers['User-Agent'] = userAgent;
		OpenIdClientIssuer.defaultHttpOptions.timeout = 10000;
		let issuerUri = opts.url;
		if (!issuerUri.includes('/.well-known/')) {
			if (issuerUri.endsWith('/')) issuerUri = issuerUri.slice(0,-1);
			issuerUri += "/.well-known/openid-configuration";
		}
		//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		const issuer = await OpenIdClientIssuer.discover(issuerUri);
		const oidcClient = new issuer.Client({
			client_id: opts.clientid,
			client_secret: opts.secret,
			redirect_uris: [ opts.callbackPath ]
		});
		oidcClient.CLOCK_TOLERANCE = 120;
		const oidcStrategy = new OpenIdClientStrategy({
			params: { scope: "openid profile email" },
			sessionKey: "oidc:"+issuerUri,
			client: oidcClient
		}, (tokenSet, userinfo, done) => {
			if (tokenSet && userinfo && userinfo[opts.username]) {
				userinfo.username = userinfo[opts.username];
				userinfo.type = "oidc";
				return done(null, userinfo);
			}
			else return done(null, null, "invalid_username_password");
		});
		return oidcStrategy;
		return (new Promise((rsv, rej) => {
			OpenIdClientIssuer.discover(issuerUri).then(issuer => {
				var oidcClient = new issuer.Client({
					client_id: opts.clientid,
					client_secret: opts.secret,
					redirect_uris: [ opts.callbackPath ]
				});
				oidcClient.CLOCK_TOLERANCE = 120;
				return oidcClient;
			}).then(oidcClient => {
				var oidcStrategy = new OpenIdClientStrategy({
					params: { scope: "openid profile email" },
					sessionKey: "oidc:"+issuerUri,
					client: oidcClient
				}, (tokenSet, userinfo, done) => {
					if (tokenSet && userinfo && userinfo[opts.username]) {
						userinfo.username = userinfo[opts.username];
						return done(null, userinfo);
					}
					else return done(null, false, "invalid_username_password");
				});
				rsv(oidcStrategy);
			}).catch(err => rej(err));
		}));
	},
	"saml": async opts => {
		const BEGIN_CERT = "-----BEGIN CERTIFICATE-----\n";
		const END_CERT = "-----END CERTIFICATE-----\n";
		opts.cert = opts.cert.replace(BEGIN_CERT,'').replace(END_CERT,'').replace('\r','');
		const samlStrategy = new SamlStrategy({
			issuer: opts.idp || "Avo Assure Webserver",
			callbackUrl: opts.callbackPath,
			entryPoint: opts.url,
			cert: opts.cert, //privateCert, decryptionPvk,
			acceptedClockSkewMs: 120
		}, (profile, done) => {
			if (profile && profile[opts.username]) {
				profile.username = profile[opts.username];
				profile.type = "oidc";
				return done(null, profile);
			}
			else return done(null, null, "invalid_username_password");
		});
		return samlStrategy;
	}
};

var routeUtil = {
	"inhouse": async opts => {
		authRouter.get(opts.route.login, async (req, res) => {
			if (req.session.uniqueId) await utils.cloneSession(req);
			return res.sendFile("app.html", { root: __dirname + "/../../public/" });
		});
		authRouter.post(opts.route.login, (req, res, next) => {
			logger.info("Inside UI service: login");
			// Credentials for service user that can restart services
			if (req.body.username == "restartservice" && req.body.password == "r3Start@3") return res.send("restart");
			return passport.authenticate("inhouse", {
				successRedirect: opts.route.success, failureRedirect: opts.route.failure, failureMessage: true
			}, (err, user, info) => {
				if (!user || req.body.query == "api") res.send(info);
				else req.logIn(user, err => {
					if (err) return next(err);
					return res.send(info);
				});
			})(req, res, next);
		});
		return authRouter;
	},
	"oidc": async opts => {
		var callbackHandler = passport.authenticate("oidc", {
			successRedirect: opts.route.success, failureRedirect: opts.route.failure, failureMessage: true
		});
		authRouter.use(opts.route.login, callbackHandler);
		authRouter.use(opts.callbackPath, callbackHandler);
		return authRouter;
	},
	"saml": async opts => {
		var callbackHandler = passport.authenticate("saml", {
			successRedirect: opts.route.success, failureRedirect: opts.route.failure, failureMessage: true
		});
		authRouter.get(opts.route.login, callbackHandler);
		authRouter.post(opts.callbackPath, callbackHandler);
		return authRouter;
	}
};

module.exports = options => {
	passport.serializeUser((user, done) => done(null, user));
	passport.protect = (req, res, next) => {
		if (req.isAuthenticated && req.isAuthenticated()) return next();
		var negotiator = new Negotiator(req);
		if (negotiator.mediaType() === 'text/html') return res.redirect(options.route.login);
		else return res.send("Invalid Session");
	};
	passport.deserializeUser((user, done) => done(null, user));
	// Initialize inhouse login method
	const ih = "inhouse";
	passport.use(ih, strategyUtil[ih](options));
	authRouter.use(passport.initialize({ userProperty: "user" }));
	authRouter.use(passport.session());
	routeUtil[ih](options);
	authRouter.use((err, req, res, next) => {
		res.status(401);
		next(err);
	});
	return {
		auth: passport,
		router: authRouter
	};
};

const registerAuthStrategy = async (strategyType, name, strategyName) => {
	const fnName = "registerAuthStrategy";
	logger.info("Inside " + fnName + " for " + strategyName);
	const inputs = { name };
	const config = await utils.fetchData(inputs, "admin/get"+strategyType.toUpperCase()+"Config", fnName);
	if (config == "fail") return "fail";
	else if (config.length == 0) return "invalid";
	config.callbackPath = "/login/callback/" + strategyName;
	config.username = "username";
	try {
		const strategy = await strategyUtil[strategyType](config);
		passport.use(strategyName, strategy);
		// Add routes util here
		strategies.push(strategyName);
	} catch (e) {
		logger.error("Error while setting up "+uType+" authentication server '"+name+"'. Error Stacktrace: " + err.toString());
		return "invalid";
	}
};

// Check User login State
module.exports.checkUser = async (req, res) => {
	const fnName = "checkUser";
	try {
		logger.info("Inside UI Service: " + fnName);
		const inputs = 	{ "username": req.body.username };
		const userInfo = await utils.fetchData(inputs, "login/loadUser", fnName);
		let result = { "proceed": true };
		if (userInfo == "fail") return res.send("fail");
		else if (userInfo && userInfo.auth) {
			const uType = userInfo.auth.type;
			const serverName = userInfo.auth.server || '';
			const strategyName = uType + '/' + serverName;
			if (["saml","oidc"].indexOf(uType) > -1) result.redirect = "/login/" + strategyName;
			if (uType != "inhouse") {
				if (serverName.length === 0) result = "invalidServerConf";
				else if (strategies.indexOf(strategyName) == -1) {
					const status = await registerAuthStrategy(uType, serverName, strategyName);
					if (status == "fail") result = "fail";
					else if (status == "invalid") result = "invalidServerConf";
				}
			}
		}
		return res.send(result);
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};
