var fs = require('fs');
var logger = require('../../logger');
var configPath = __dirname + '/config.json';
var parsed;
try {
	parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
	parsed.certificate.key = fs.readFileSync(parsed.certificate.key, 'utf-8');
	parsed.certificate.cert = fs.readFileSync(parsed.certificate.cert, 'utf-8');
	var numCheck = /^\d+$/;
	if (!numCheck.test(parsed.socketio.pingTimeout) || !numCheck.test(parsed.socketio.pingInterval)) throw "SocketIO config values should be Integer";
	else {
		parsed.socketio.pingTimeout = parseInt(parsed.socketio.pingTimeout);
		parsed.socketio.pingInterval = parseInt(parsed.socketio.pingInterval);
	}
} catch (e) {
	logger.error(e);
	throw "Please provide valid values in config.json file";
}
module.exports = parsed;
