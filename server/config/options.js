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
	if (!numCheck.test(parsed.pingTimer)) throw "Ping Timer config values should be Integer";
	if (parseInt(parsed.pingTimer) > 120000) logger.warn("Large values of ping timer may cause a delay in executions and ICE status refresh");
	if (parseInt(parsed.pingTimer) < 30000) logger.warn("Small values of ping timer may cause too much traffic for sockets, please increase the value of ping timer");
	else {
		parsed.socketio.pingTimeout = parseInt(parsed.socketio.pingTimeout);
		parsed.socketio.pingInterval = parseInt(parsed.socketio.pingInterval);
	}
	if(!["DD-MM-YYYY", "YYYY-MM-DD", "MM-DD-YYYY"].includes(parsed.dateFormat)) {
		throw "Invalid date format";
	}
} catch (e) {
	logger.error(e);
	throw "Please provide valid values in config.json file";
}
module.exports = parsed;
