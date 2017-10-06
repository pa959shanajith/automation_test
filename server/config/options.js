var fs = require('fs'),
configPath = __dirname + '/config.json'
var parsed,screenShotPath,scrShot_path_exists;
try{
	parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
	screenShotPath=parsed.screenShotPath;
	scrShot_path_exists=fs.existsSync(screenShotPath);
} catch(e){
	console.error('\nPlease provide valid values in config.json file\n');
	throw e;
}
if(!scrShot_path_exists){
	//throw ("\nScreenshot path \""+screenShotPath+"\" does not exists or server machine doesn't have sufficient permissions\n");
	console.log("\nScreenshot path \""+screenShotPath+"\" does not exists or server machine doesn't have sufficient permissions\n");
}

exports.storageConfig =  parsed;