var fs = require('fs'),
    logger = require('../../logger'),
configPath = __dirname + '/config.json'
var parsed,screenShotPath,scrShot_path_exists;
try{
	parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
	screenShotPath=parsed.screenShotPath;
	scrShot_path_exists=fs.existsSync(screenShotPath);
} catch(e){
	logger.error('Please provide valid values in config.json file');
	throw e;
}
if(!scrShot_path_exists){
	//throw ("\nScreenshot path \""+screenShotPath+"\" does not exists or server machine doesn't have sufficient permissions\n");
	logger.warn("Screenshot path \""+screenShotPath+"\" does not exists or server machine doesn't have sufficient permissions");
}

exports.storageConfig =  parsed;