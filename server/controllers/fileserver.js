//load environment variables
var env = require('node-env-file');
var fs = require('fs');
var path = require('path');
var envFilePath  = path.join(path.dirname(fs.realpathSync(__filename)), '../../.env');
console.log(envFilePath)
try {
	if (fs.existsSync(envFilePath)) {
		env(envFilePath);
	} else {
		console.error("Error occurred in loading ENVIRONMENT VARIABLES, .env file is missing! ");
	}
} catch (ex) {
	console.error("Error occurred in loading ENVIRONMENT VARIABLES");
	console.error(ex);
}
// Module Dependencies
var expressWinston = require('express-winston');
var nginxEnabled = process.env.NGINX_ON.toLowerCase().trim() == "true";
var hostFamilyType = (nginxEnabled) ? '127.0.0.1' : '0.0.0.0';

var server_port = process.env.FILE_SERVER_PORT || 5100;
var host_path = process.env.HOST_PATH
var logger = require('../../logger');

var express = require('express');
var app = express();
const http = require('http');


if (process.env.EXPRESSLOGS.toLowerCase() != 'on') logger.info("Express logs are disabled");
		else {
			app.use(expressWinston.logger({
				winstonInstance: logger,
				requestWhitelist: ['url'],
				colorize: true
			}));
		}

try {
	console.log('Files are hosted over the location : ', host_path);
	logger.debug('Files are hosted over the location : ', host_path);
	app.use(express.static(host_path)); //Serves resources from public folder, path should be abs path to the folder
	console.log('Server internal port : ', server_port)
	logger.debug('Server internal port : ', server_port)
	app.listen(server_port, hostFamilyType); //Https Server
	logger.debug('!!!!!File Server is up!!!!!')
	console.log('!!!!!File Server is up!!!!!')
	app.get('/', (req, res) => res.send('!!!!!File Server is up!!!!!'))
	
} catch (e) {
	logger.error("Please provide valid values in .env file, Unable to setup File Server");
	console.log("Please provide valid values in .env file, Unable to setup File Server");
	logger.error(e);
	console.log(e);
}