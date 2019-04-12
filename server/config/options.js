var fs = require('fs');
var logger = require('../../logger');
var configPath = __dirname + '/config.json';
var parsed;
try {
	parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
	parsed.username = Buffer.from(parsed.username, "base64").toString();
	parsed.password = Buffer.from(parsed.password, "base64").toString();
	parsed.certificate.key = fs.readFileSync(parsed.certificate.key, 'utf-8');
	parsed.certificate.cert = fs.readFileSync(parsed.certificate.cert, 'utf-8');
	var ssoEnabled = process.env.ENABLE_SSO.toLowerCase()=="true";
	if (ssoEnabled) {
		var strategy = process.env.SSO_PROTOCOL.toLowerCase().trim();
		var conf = parsed[strategy];
		if (strategy=='oidc' && (conf.identitityProviderURL.trim()=='' || conf.clientId.trim()=='' || conf.clientSecret.trim()=='' || conf.redirectURI.trim()=='')) {
			throw "Invalid values in SSO configuration";
		} else if (strategy=='saml' && (conf.acsURL.trim()=='' || conf.cert.trim()=='' || !fs.existsSync(conf.cert) || conf.redirectURI.trim()=='')) {
			throw "Invalid values in SSO configuration";
		}
	}
	var taskwflow=parsed.taskworkflow.toString().toLowerCase();
	if( !(taskwflow=='default' || taskwflow =='strict')){
		throw "taskworkflow field must have default or strict as value";
	}
} catch (e) {
	logger.error(e);
	throw "Please provide valid values in config.json file";
}
module.exports = parsed;
