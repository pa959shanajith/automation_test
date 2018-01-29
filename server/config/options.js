var fs = require('fs'),
    logger = require('../../logger'),
configPath = __dirname + '/config.json'
var parsed;
try{
	parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
    parsed.certificate.key = fs.readFileSync(parsed.certificate.key, 'utf-8');
    parsed.certificate.cert = fs.readFileSync(parsed.certificate.cert, 'utf-8');
	screenShotPath=parsed.screenShotPath.default;
	if (screenShotPath.length > 0){
		scrShot_path_exists=fs.existsSync(screenShotPath);
		if(!scrShot_path_exists){
			throw "Screenshot path \""+screenShotPath+"\" does not exists or server machine doesn't have sufficient permissions";
		}
	}
} catch(e){
	logger.error(e);
	throw "Please provide valid values in config.json file";
}
exports.storageConfig =  parsed;