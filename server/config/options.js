var fs = require('fs'),
    logger = require('../../logger'),
configPath = __dirname + '/config.json'
var parsed;
try{
	parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
    parsed.certificate.key = fs.readFileSync(parsed.certificate.key, 'utf-8');
    parsed.certificate.cert = fs.readFileSync(parsed.certificate.cert, 'utf-8');
} catch(e){
	logger.error(e);
	throw "Please provide valid values in config.json file";
}
exports.storageConfig =  parsed;