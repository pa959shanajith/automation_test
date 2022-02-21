let authRouter = require("express").Router();
let passport = require("passport");
const bcrypt = require('bcryptjs');
const activeDirectory = require('activedirectory');
const LocalStrategy = require("passport-local").Strategy;
const SamlStrategy = require("passport-saml").Strategy;
const OpenIdClientStrategy = require('openid-client').Strategy;
const OpenIdClientIssuer = require('openid-client').Issuer;
const Negotiator = require('negotiator');
const uidsafe = require('uid-safe');
const logger = require("../../logger");
const utils = require('./utils');
const notifications = require('../notifications');
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
			let forgotPass = false;
			let inputs = { username };
			const user = await utils.fetchData(inputs, "login/loadUser", fnName);
			if (user == "fail") flag = "fail";
			else if (!user || !user.auth) flag = "invalid_username_password";
			else if (user.invalidCredCount == 5) {
				flag = "userLocked";
				userInfo = { username, type: user.auth.type };
			}
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
					if (!validAuth && user.auth.defaultpassword && user.auth.defaultpassword != "") {
						forgotPass = true;
						var defPassword = bcrypt.compareSync(password, user.auth.defaultpassword);
						if (defPassword) {
							inputs = {
								"username": username,
								"action": "forgotPass"
							}
							const usertime = await utils.fetchData(inputs, "login/passtimeout", fnName);
							if (usertime == "fail") flag = "fail";
							else if(usertime == "timeout") flag = "timeout";
							else {
								flag = "changePwd";
								userInfo = { username, type: user.auth.type };
							}
						}
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
						if (config.secure !== "false") adConfig.tlsOptions = { 
							ca: config.cert,
							rejectUnauthorized: (config.secure === "secure")
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
					inputs = {"username": username, "action": "clear"}
					const invalidCredCounter = await utils.fetchData(inputs, "login/invalidCredCounter", fnName);
					if (invalidCredCounter == "fail") flag = "fail";
					else {
						flag = "validCredential";
						userInfo = { username, type };
					}
				} else if(flag == "inValidCredential"){
					inputs = {"username": username, "action": "increment"}
					const invalidCredCounter = await utils.fetchData(inputs, "login/invalidCredCounter", fnName);
					if (invalidCredCounter == "fail") flag = "fail";
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
			callbackUrl: opts.hostUri + opts.callbackPath,
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

const routeUtil = {
	"inhouse": async opts => {
		authRouter.get(opts.route.login, async (req, res) => {
			res.setHeader('X-Frame-Options', 'SAMEORIGIN');
			if (req.session.uniqueId) await utils.cloneSession(req);
			return res.sendFile("index.html", { root: __dirname + "/../../public/" });
		});
		authRouter.post(opts.route.login, (req, res, next) => {
			logger.info("Inside UI service: login");
			res.setHeader('X-Frame-Options', 'SAMEORIGIN');
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
	passport.deserializeUser((user, done) => done(null, user));
	passport.verifySession = req => {
		const sessFlag = req.isAuthenticated && req.isAuthenticated()
		const cookies = req.signedCookies || {};
		const cookieFlag = (cookies["connect.sid"]!==undefined) && (cookies["maintain.sid"]!==undefined);
		if (sessFlag && cookieFlag) return true;
		return false;
	};
	passport.protect = async (req, res, next) => {
		if (passport.verifySession(req)) {
			const allow = await userAccess(req);
			if (allow) return next();
			else return res.send("Invalid Session");
			// else return res.status(403).send("Invalid Session");
		}
		if (new Negotiator(req).mediaType() === 'text/html') return res.redirect(options.route.login);
		else return res.send("Invalid Session");
		// else return res.status(401).send("Invalid Session");
	};
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

const userAccess = async req => {
	const roleid = req.session.activeRoleId || "blank";
	// if (!roleid) return true;
	const servicename = req.url.replace("/", "");
	const updateinp = { roleid, servicename };
	try {
		const allowed = await utils.fetchData(updateinp, "utility/userAccess", "userAccess");
		if (allowed == "off") {
			res.status(500).send("fail");
			// httpsServer.close();
			logger.error("License Expired!!");
			logger.error("Please run the Service API and Restart the Server");
		} else if (allowed == "fail") return false;
		else if (allowed === true) return true;
		else {
			req.clearSession();
			return false;
		}
	} catch (e) {
		logger.error("Error occured in userAccess");
		return false;
	}
}

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
		const inputs = 	{ "username": req.body.username.toLowerCase() };
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
			else if (uType === "ldap") result.ldapuser = true;
		}
		return res.send(result);
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

// send email when forgot password
module.exports.forgotPasswordEmail = async (req, res) => {
	const fnName = "forgotPasswordEmail";
	try {
		logger.info("Inside UI Service: " + fnName);
		const inputs = 	{ "username": req.body.username };
		var userInfo = await utils.fetchData(inputs, "login/loadUser", fnName);
		let result = { "proceed": true };
		if (userInfo == "fail") return result = "fail";
		else if (!userInfo || !userInfo.auth) result = "invalid_username_password";
		else if (userInfo.invalidCredCount == 5) result = "userLocked";
		else if (userInfo && userInfo.auth) {
			//create a temporary password here
			const default_password = utils.generateDefPassword();
			const password = bcrypt.hashSync(default_password, bcrypt.genSaltSync(10));
			//password created
			const inputsFor = {
				"username": req.body.username,
				"defaultpassword": password
			};
			const userUpd = await utils.fetchData(inputsFor, "login/forgotPasswordEmail", fnName);
			if (userUpd == "fail") return result = "fail";
			else {
				userInfo.defaultpassword = default_password
				notifications.notify("forgotPassword", {field: "password", user: userInfo});
				result = "success";
			}
		}
		return res.send(result);
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

//unlock user account
module.exports.unlock = async (req, res) => {
	const fnName = "unlock";
	try {
		logger.info("Inside UI Service: " + fnName);
		const username = req.user.username;
		const inputs = 	{ "username": username };
		var userInfo = await utils.fetchData(inputs, "login/loadUser", fnName);
		let result = { "proceed": true };
		if (userInfo == "fail") return result = "fail";
		else if (!userInfo || !userInfo.auth) result = "invalid_username_password";
		else if (userInfo.invalidCredCount != 5) result = "userUnlocked";
		else if (userInfo.auth.verificationpassword != "") {
			var defPassword = bcrypt.compareSync(req.body.password, userInfo.auth.verificationpassword);
			if (defPassword) {
				//unlock the account
				const inputsunlock = {"username":username, "action":"unlock"}
				const user = await utils.fetchData(inputsunlock, "login/passtimeout", "unlock");
				if (user == "fail") result = "fail";
				else if(user == "timeout") result = "timeout";
				else result = "success";
			} else {
				result = "invalid_username_password";
			}
		}
		return res.send(result);
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

//send email for unlock account
module.exports.unlockAccountEmail = async (req, res) => {
	const fnName = "unlockAccountEmail";
	try {
		logger.info("Inside UI Service: " + fnName);
		const inputs = 	{ "username": req.user.username };
		var userInfo = await utils.fetchData(inputs, "login/loadUser", fnName);
		let result = { "proceed": true };
		if (userInfo == "fail") return result = "fail";
		else if (!userInfo || !userInfo.auth) result = "invalid_username_password";
		else if (userInfo.invalidCredCount != 5) result = "userUnlocked";
		else if (userInfo && userInfo.auth) {
			//create a verification password here
			const default_password = utils.generateDefPassword();
			const password = bcrypt.hashSync(default_password, bcrypt.genSaltSync(10));
			//password created
			const inputsFor = {
				"username": req.user.username,
				"verificationpassword": password
			};
			const userUpd = await utils.fetchData(inputsFor, "login/unlockAccountEmail", fnName);
			if (userUpd == "fail") return result = "fail";
			else {
				userInfo.verificationpassword = default_password
				notifications.notify("unlockAccount", {field: "password", user: userInfo});
				result = "success";
			}
		}
		return res.send(result);
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

// Function to check whether projects are assigned for user
const checkAssignedProjects = async (username, usertype) => {
	const fnName = "checkAssignedProjects";
	logger.info("Inside " + fnName + " function");
	let assignedProjects = false;
	// Get user profile by username
	let inputs = { username };
	const userInfo = await utils.fetchData(inputs, "login/loadUser", fnName);
	if (userInfo == "fail") return { err: 'fail' };
	else if (!userInfo) {
		let flag = "invalid_username_password";
		if (["saml","oidc"].includes(usertype)) flag = "nouser";
		return { err: flag };
	}
	const userid = userInfo._id;
	const roleid = userInfo.defaultrole;
	if (userInfo.projects != null) assignedProjects = userInfo.projects.length !== 0;
	// Get Rolename by role id
	inputs = {
		"roleid": roleid,
		"query": "permissionInfoByRoleID"
	};
	const userRole = await utils.fetchData(inputs, "login/loadPermission", fnName);
	if (userRole == "fail") return { err: 'fail' };
	else if (userRole === null) return { err: 'invalid_username_password'};
	else return { err: null, userid, role: userRole.rolename, assignedProjects };
}

// Check User login State - Avo Assure
module.exports.validateUserState = async (req, res) => {
	try {
		logger.info("Inside UI Service: validateUserState");
		const sess = req.session;
		if (!sess) {
			logger.error("Invalid Session");
			req.clearSession();
			return res.send("Invalid Session");
		}
		let emsg = sess.emsg;
		const dndsess = sess.dndSess || (!emsg && sess.logged);
		if (emsg || dndsess) {
			if (dndsess) {
				logger.error(`User ${sess.username} is already logged in`);
				await utils.cloneSession(req);
				emsg = "reload";
			} else req.clearSession();
			return res.send(emsg);
		}

		if (!req.isAuthenticated()) {
			logger.rewriters[0] = function(level, msg, meta) {
				meta.username = null;
				meta.userid = null;
				meta.userip = req.headers['client-ip'] != undefined ? req.headers['client-ip'] : req.ip;
				return meta;
			};
			req.clearSession();
			return res.send('redirect');
		}

		emsg = "fail";
		const user = req.user;
		const username = (user.username || "").toLowerCase();
		if (username.length === 0) {
			logger.error(`User ${username} does not have a valid login session`);
			emsg = "invalid_username_password";
		} else {
			try {
				const sessid = await utils.findSessID(username);
				if (sessid.length !== 0) {
					logger.info(`User ${username} is already logged in`);
					emsg = "userLogged";
				} else {
					const { err, userid, role, assignedProjects } = await checkAssignedProjects(username, user.type);
					const ip = (!req.headers['client-ip'])? req.headers['client-ip'] : req.ip;
					if (err) {
						logger.error("Error occurred in validateUserState. Cause: "+ err);
						emsg = err;
					} else if (role != "Admin" && !assignedProjects) {
						logger.info(`User ${username} has not been assigned any projects`);
						emsg = "noProjectsAssigned";
					} else {
						emsg = "ok";
						res.cookie('maintain.sid', uidsafe.sync(24), {path: '/', httpOnly: true, secure: true, signed: true, sameSite: true});
						req.session.userid = userid;
						req.session.ip = ip;
						req.session.loggedin = (new Date()).toISOString();
						req.session.username = username;
						req.session.uniqueId = req.session.id;;
						req.session.usertype = user.type;
						logger.rewriters[0] = function(level, msg, meta) {
							meta.username = username;
							meta.userid = userid;
							meta.userip = ip;
							return meta;
						};
					}
				}
			} catch (err) {
				logger.error("User Authentication failed. Error: ", err);
				emsg = "fail";
			}
		}
		req.session.logged = true;
		if (emsg != "ok") req.clearSession();
		return res.send(emsg);
	} catch (exception) {
		logger.error(exception.message);
		req.clearSession();
		res.send("fail");
	}
};
