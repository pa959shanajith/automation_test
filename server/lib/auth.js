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
const options = {
	route: {
		login: "/login",
		success: "/",
		failure: "/error?e=403"
	}
};


const strategyUtil = {
	"inhouse": async opts => {
		const localStrategy = new LocalStrategy(async (username, password, done) => {
			const fnName = "setupInhouseStrategy";
			if (!(username && password)) return done(null, null, "invalid_username_password");
			let flag = 'inValidCredential';
			let userInfo = null;
			let validAuth = false;
			let inputs = { username };
			const user = await utils.fetchData(inputs, "login/loadUser", fnName);
			if (user == "fail") flag = "fail";
			else if (!user || !user.auth) flag = "invalid_username_password";
			else {
				const type = user.auth.type;
				if (type != "ldap") {
					const dbHashedPassword = user.auth.password;
					try {
						validAuth = bcrypt.compareSync(password, dbHashedPassword);
					} catch (exception) {
						logger.error("Error occurred in user authentication: " + exception.message.toString());
						flag = "fail";
					}
				}
				// LDAP auth starts
				else if (!user.auth.user) flag = "invalidUserConf";
				else {
					inputs = { name: user.auth.server };
					const config = await utils.fetchData(inputs, "admin/getLDAPConfig", fnName);
					if (config == "fail") flag  = "fail";
					else if (config.length == 0) flag = "inValidLDAPServer";
					else {
						const adConfig = {
							url: config.url,
							baseDN: config.basedn,
						};
						if (config.auth == "simple") {
							adConfig.bindDN = config.binddn;
							adConfig.bindCredentials = config.bindcredentials;
						}
						const ad = new activeDirectory(adConfig);
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
						else if (authResult == "pass") validAuth = true;
					}
				}
				if (validAuth) {
					flag = "validCredential";
					userInfo = { username, type };
				}
			}
			return done(null, userInfo, flag);
		});
		return localStrategy;
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
			redirect_uris: [ opts.hostUri + opts.callbackPath ]
		});
		oidcClient.CLOCK_TOLERANCE = 120;
		const oidcStrategy = new OpenIdClientStrategy({
			params: { scope: "openid profile email" },
			sessionKey: "oidc:"+issuerUri,
			client: oidcClient
		}, (tokenSet, userinfo, done) => {
			if (tokenSet && userinfo && userinfo.preferred_username) {
				userinfo.username = userinfo.preferred_username;
				userinfo.type = "oidc";
				return done(null, userinfo);
			}
			else return done(null, null, "nouserprofile");
		});
		return oidcStrategy;
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
			if (profile && profile.nameID) {
				profile.username = profile.nameID;
				profile.type = "saml";
				return done(null, profile);
			}
			else return done(null, null, "nouserprofile");
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
	},
	"oidc": async opts => {
		var callbackHandler = passport.authenticate(opts.strategy, {
			successRedirect: opts.route.success, failureRedirect: opts.route.failure, failureMessage: true
		});
		authRouter.use(opts.route.login, callbackHandler);
		authRouter.use(opts.callbackPath, callbackHandler);
	},
	"saml": async opts => {
		var callbackHandler = passport.authenticate(opts.strategy, {
			successRedirect: opts.route.success, failureRedirect: opts.route.failure, failureMessage: true
		});
		authRouter.get(opts.route.login, callbackHandler);
		authRouter.post(opts.callbackPath, callbackHandler);
	}
};

module.exports = () => {
	passport.serializeUser((user, done) => done(null, user));
	passport.protect = (req, res, next) => {
		if (req.isAuthenticated && req.isAuthenticated()) return next();
		var negotiator = new Negotiator(req);
		if (negotiator.mediaType() === 'text/html') return res.redirect(options.route.login);
		else return res.send("Invalid Session");
	};
	passport.deserializeUser((user, done) => done(null, user));
	authRouter.use(passport.initialize({ userProperty: "user" }));
	authRouter.use(passport.session());
	// Initialize inhouse & ldap login method
	const ih = "inhouse";
	strategyUtil[ih](options).then(ihStrategy => passport.use(ih, ihStrategy), err => {});
	routeUtil[ih](options);
	return {
		auth: passport,
		router: authRouter
	};
};

const registerAuthStrategy = async (opts) => {
	const fnName = "registerAuthStrategy";
	const strategyName = opts.strategy;
	const name = opts.name;
	const strategyType = opts.type;
	logger.info("Inside " + fnName + " for " + strategyName);
	const inputs = { name };
	const config = await utils.fetchData(inputs, "admin/get"+strategyType.toUpperCase()+"Config", fnName);
	if (config == "fail") return "fail";
	else if (config.length == 0) return "invalid";
	Object.assign(config, opts);
	try {
		const strategy = await strategyUtil[strategyType](config);
		passport.use(strategyName, strategy);
		routeUtil[strategyType](config);
		strategies.push(strategyName);
	} catch (e) {
		logger.error("Error while setting up "+strategyType+" authentication server '"+name+"'. Error Stacktrace: " + err.toString());
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
			const uType = userInfo.auth.type || "inhouse";
			const serverName = userInfo.auth.server || '';
			const strategyName = uType + '/' + serverName;
			if (uType != "inhouse" && serverName.length === 0) result = "invalidServerConf";
			else if (["saml","oidc"].includes(uType)) {
				result.redirect = "/login/" + strategyName;
				if (!strategies.includes(strategyName)) {
					const config = {
						type: uType,
						name: serverName,
						strategy: strategyName,
						callbackPath: "/login/callback/" + strategyName,
						route: Object.assign({}, options.route),
						hostUri: utils.originalURL(req).replace('/checkUser', '')
					};
					config.route.login = result.redirect;
					const status = await registerAuthStrategy(config);
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
