var logger = require('../../logger');
var redisServer = require('./redisSocketHandler');
//SOCKET CONNECTION USING SOCKET.IO
var socketMap = {};
var socketMapUI = {};
var sokcetMapScheduling = {};
var socketMapNotify = {};

var myserver = require('./../../server');
var httpsServer = myserver.httpsServer;
// var io = require('socket.io')(httpsServer);
var io = require('socket.io').listen(httpsServer,{ cookie: false });
var notificationMsg = require('./../notifications/notifyMessages');
var epurl = "http://"+process.env.NDAC_IP+":"+process.env.NDAC_PORT+"/";
var Client = require("node-rest-client").Client;
var apiclient = new Client();

var uiConfig = require('./../config/options');
var screenShotPath = uiConfig.storageConfig.screenShotPath;

io.on('connection', function (socket) {
	logger.info("Inside Socket connection");
	var address = socket.handshake.query.username;
	logger.info("Socket connecting address %s", address);
	if (socket.request._query.check == "true") {
		logger.info("Socket request from UI");
		address = socket.request._query.username;
		socketMapUI[address] = socket;
		socket.emit("connectionAck", "Success");
	} else if (socket.request._query.check == "notify") {
		 //address = Base64.decode(socket.request._query.username);
		 //socketMapNotify[address] = socket;
		socket.on('key',function(data) {
			address = Base64.decode(data);
			socketMapNotify[address] = socket;
		  });
		//Broadcast Message
		var broadcastTo = ['/admin', '/plugin', '/design', '/designTestCase', '/execute', '/scheduling', '/specificreports', '/mindmap', '/p_Utility', '/p_Reports', 'p_Weboccular', '/neuronGraphs2D', '/p_ALM'];
		notificationMsg.to = broadcastTo;
		notificationMsg.notifyMsg = 'Server Maintenance Scheduled';
		// var soc = socketMapNotify[address];
		// soc.emit("notify",notificationMsg);
	} else {
		logger.info("Socket request from ICE");
		address = socket.handshake.query.username;
		var icesession = socket.handshake.query.icesession;
		var inputs = {
			"icesession": icesession,
			"query": 'connect'
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling NDAC Service: updateActiveIceSessions");
		apiclient.post(epurl+"server/updateActiveIceSessions", args,
		function (result, response) {
			if (response.statusCode != 200) {
				logger.error("Error occurred in updateActiveIceSessions Error Code: ERRNDAC");
			} else {
				socket.send('checkConnection', result.ice_check);
				if (result.node_check === "allow") {
					if (!(address in socketMap)) {
						socketMap[address] = socket;
						socket.send('connected');
						logger.debug("%s is connected", address);
						logger.debug("No. of clients connected for Normal mode: %d", Object.keys(socketMap).length);
						socket.emit('update_screenshot_path', screenShotPath);
						redisServer.redisSub1.unsubscribe('ICE1_normal_' + address);
						redisServer.redisSub1.unsubscribe('ICE1_scheduling_' + address);
						redisServer.redisSub1.subscribe('ICE1_normal_' + address);
					}
				} else {
					if (result.node_check === "userNotValid") {
						logger.error("%s is not authorized to connect", address);
					}
					socket.disconnect(false);
				}
			}
		});
	}
	module.exports.allSocketsMap = socketMap;
	module.exports.allSocketsMapUI = socketMapUI;
	module.exports.allSchedulingSocketsMap = sokcetMapScheduling;
	module.exports.socketMapNotify = socketMapNotify;
	httpsServer.setTimeout();

	socket.on('disconnect', function () {
		logger.info("Inside Socket disconnect");
		var address;
		// var ip = socket.request.connection.remoteAddress || socket.request.headers['x-forwarded-for'];
		if (socket.request._query.check == "true") {
			address = socket.request._query.username;
			logger.info("Disconnecting from UI socket: %s", address);
		} else if (socket.request._query.check == "notify") {
			// address = socket.handshake.query.username;
			address = Base64.decode(socket.request._query.username);
			logger.info("Disconnecting from Notification socket: %s", address);
		} else {
			var connect_flag = false;
			logger.info("Inside ICE Socket disconnection");
			address = socket.handshake.query.username;
			if (socketMap[address] != undefined) {
				connect_flag = true;
				logger.info('Disconnecting from ICE socket : %s', address);
				redisServer.redisSub1.unsubscribe('ICE1_normal_' + address);
				delete socketMap[address];
				module.exports.allSocketsMap = socketMap;
				logger.debug("No. of clients connected for Normal mode: %d", Object.keys(socketMap).length);
				logger.debug("Clients connected for Normal mode : %s", Object.keys(socketMap).join());
			} else if (sokcetMapScheduling[address] != undefined) {
				connect_flag = true;
				logger.info('Disconnecting from Scheduling socket : %s', address);
				redisServer.redisSub1.unsubscribe('ICE1_scheduling_' + address);
				delete sokcetMapScheduling[address];
				module.exports.allSchedulingSocketsMap = sokcetMapScheduling;
				logger.debug("No. of clients connected for Scheduling mode: %d", Object.keys(sokcetMapScheduling).length);
				logger.debug("Clients connected for Scheduling mode : %s", Object.keys(sokcetMapScheduling).join());
			}
			if (connect_flag) {
				var inputs = {
					"username": address,
					"query": 'disconnect'
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service: updateActiveIceSessions");
				apiclient.post(epurl+"server/updateActiveIceSessions", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in updateActiveIceSessions Error Code: ERRNDAC");
					} else {
						logger.info("%s is disconnected", address);
					}
				});
			}
		}
	});

	socket.on('toggle_schedule', function (data) {
		logger.info("Inside Socket toggle_schedule: Reconnecting for scheduling socket");
		var address = socket.handshake.query.username;
		if (data && socketMap[address] != undefined) {
			redisServer.redisSub1.unsubscribe('ICE1_normal_' + address);
			redisServer.redisSub1.subscribe('ICE1_scheduling_' + address);
			logger.info('Disconnecting socket connection for Normal Mode: %s', address);
			delete socketMap[address];
			module.exports.allSocketsMap = socketMap;
			logger.debug("No. of clients connected for Normal mode: %d", Object.keys(socketMap).length);
			logger.debug("Clients connected for Normal mode : %s", Object.keys(socketMap).join());
			sokcetMapScheduling[address] = socket;
			module.exports.allSchedulingSocketsMap = sokcetMapScheduling;
			socket.send('schedulingEnabled');
			logger.debug("No. of clients connected for Scheduling mode: %d", Object.keys(sokcetMapScheduling).length);
			logger.debug("Clients connected for Scheduling mode : %s", Object.keys(sokcetMapScheduling).join());
		} else if (!data && sokcetMapScheduling != undefined) {
			redisServer.redisSub1.unsubscribe('ICE1_scheduling_' + address);
			redisServer.redisSub1.subscribe('ICE1_normal_' + address);
			logger.info('Disconnecting socket connection for Scheduling mode: %s', address);
			delete sokcetMapScheduling[address];
			module.exports.allSchedulingSocketsMap = sokcetMapScheduling;
			logger.debug("No. of clients connected for Scheduling mode: %d", Object.keys(sokcetMapScheduling).length);
			logger.debug("Clients connected for Scheduling mode : %s", Object.keys(sokcetMapScheduling).join());
			socketMap[address] = socket;
			module.exports.allSocketsMap = socketMap;
			socket.send('schedulingDisabled');
			logger.debug("No. of clients connected for Normal mode: %d", Object.keys(socketMap).length);
			logger.debug("Clients connected for Normal mode : %s", Object.keys(socketMap).join());
		}
	});

	socket.on('connect_failed', function () {
		logger.error("Error occurred in connecting socket");
	});
});
//SOCKET CONNECTION USING SOCKET.IO

var Base64 = {
	_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	decode: function (input) {
		if(input != undefined) {
			var output = "";
			var chr1,chr2,chr3;
			var enc1,enc2,enc3,enc4;
			var i = 0;
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			while (i < input.length) {
				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
				output = output + String.fromCharCode(chr1);
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}
			output = Base64._utf8_decode(output);
			return output;
		}
	},

	_utf8_decode: function (utftext) {
		var string = "";
		var i = 0;
		var c, c2, c3;
		while (i < utftext.length) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
};

module.exports = io;