var logger = require("../../logger");
const { ExpressOIDC } = require("@okta/oidc-middleware");
var authRouter = require("express").Router();
//var connect = require("connect");
var passport = require("passport");
var SamlStrategy = require("passport-saml").Strategy;
var fs = require("fs");
var config = require("../config/config.json");
var ssoEnabled = process.env.ENABLE_SSO.toLowerCase().trim() == "true";
var strategy = (ssoEnabled)? process.env.SSO_PROTOCOL.toLowerCase().trim():"inhouse";
config = config[strategy];

var strategyUtil = {
	"inhouse": function inhouse(opts){
		authRouter.get(opts.route.login, function(req, res) {
			req.clearSession();
			return res.sendFile("app.html", { root: __dirname + "/../../public/" });
		});
		return [null,null,null];
	},
	"okta-oidc": function openid_connect(opts){
		var callbackPath = config.redirectURI.replace("http://",'').replace("https://",'');
		callbackPath = callbackPath.replace(callbackPath.split('/')[0],'');
		var oidcConf = new ExpressOIDC({
			issuer: config.identitityProviderURL,
			client_id: config.clientId,
			client_secret: config.clientSecret,
			redirect_uri: config.redirectURI,
			routes: {
				login: { path: opts.route.login },
				callback: { path: callbackPath, defaultRedirect: opts.route.success, failureRedirect: opts.route.failure }
			},
			scope: "openid profile email"
		});
		authRouter.use(oidcConf.router);
		oidcConf.on("error", err => {
			logger.error("Unable to configure OIDC Protocol", err);
		});
		return [null,oidcConf,null];
	},
	"oidc": function openid_connect(opts){
		var callbackPath = config.redirectURI.replace("http://",'').replace("https://",'');
		callbackPath = callbackPath.replace(callbackPath.split('/')[0],'');
		var oidcConf = new ExpressOIDC({
			issuer: config.identitityProviderURL,
			client_id: config.clientId,
			client_secret: config.clientSecret,
			redirect_uri: config.redirectURI,
			routes: {
				login: { path: opts.route.login },
				callback: { path: callbackPath, defaultRedirect: opts.route.success, failureRedirect: opts.route.failure }
			},
			scope: "openid profile email"
		});
		authRouter.use(oidcConf.router);
		oidcConf.on("error", err => {
			logger.error("Unable to configure OIDC Protocol", err);
		});
		return [null,oidcConf,null];
	},
	"saml": function saml_2(opts){
		var BEGIN_CERT = "-----BEGIN CERTIFICATE-----\n";
		var END_CERT = "-----END CERTIFICATE-----\n";
		config.cert=fs.readFileSync(config.cert, 'utf-8').replace(BEGIN_CERT,'').replace(END_CERT,'');

		passport.serializeUser(function(user, done) {done(null, user);});
		passport.deserializeUser(function(user, done) {done(null, user);});

		var callbackPath = config.redirectURI.replace("http://",'').replace("https://",'');
		callbackPath = callbackPath.replace(callbackPath.split('/')[0],'');
		var samlStrategy = new SamlStrategy({
			issuer: config.issuer || "SLK Nineteen68 Webserver",
			callbackUrl: config.redirectURI,
			entryPoint: config.acsURL,
			cert: config.cert
		},	function (profile, done) {
			if (profile && profile.nineteen68_usernames) return done(null, profile);
			else return done(null, null, "invalid_username");
		});
		passport.use(samlStrategy);
		passport.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
			if (req.isAuthenticated && req.isAuthenticated()) return next();
			return res.redirect(opts.route.login);
		};

		var callbackHandler = passport.authenticate("saml", {
			successReturnToOrRedirect: opts.route.success, failureRedirect: opts.route.failure, failureMessage: true
		});

		authRouter.use(passport.initialize({ userProperty: opts.user }));
		authRouter.use(passport.session());
		authRouter.use(opts.route.login, callbackHandler);
		authRouter.use(callbackPath, callbackHandler);
		authRouter.use(function(err, req, res, next){
			res.status(401);
			next(err);
		});
		return [null,null,passport];
	}
};

module.exports = function auth(app, options){
	var result = strategyUtil[strategy](options);
	result.unshift(strategy);
	app.use(authRouter);
	return result;
};
