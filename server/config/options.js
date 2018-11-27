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
	if (process.env.ENABLE_SSO.toLowerCase() == "true") {
		if (parsed.sso_config.identitity_provider_url.trim()=='' || parsed.sso_config.client_id.trim()=='' || parsed.sso_config.client_secret.trim()=='') {
			throw "Invalid values in SSO configuration options";
		}
	}
} catch (e) {
	logger.error(e);
	throw "Please provide valid values in config.json file";
}
module.exports = parsed;
