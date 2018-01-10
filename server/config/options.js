var fs = require('fs'),
    logger = require('../../logger'),
configPath = __dirname + '/config.json'
var parsed;
try{
	parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
} catch(e){
	logger.error('Please provide valid values in config.json file');
	throw e;
}
exports.storageConfig =  parsed;