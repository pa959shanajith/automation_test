var logger = require('../../logger');
var redisServer = require('./redisSocketHandler');
//SOCKET CONNECTION USING SOCKET.IO
var socketMap = {};
var socketMapUI = {};
var socketMapScheduling = {};
var socketMapNotify = {};

var myserver = require('./../../server');
var httpsServer = myserver.httpsServer;
var io = require('socket.io').listen(httpsServer, { cookie: false });
var notificationMsg = require('./../notifications/notifyMessages');
var epurl = process.env.NDAC_URL;
var Client = require("node-rest-client").Client;
var apiclient = new Client();

var uiConfig = require('./../config/options');
var screenShotPath = uiConfig.screenShotPath;

io.on('connection', function (socket) {
	logger.info("Inside Socket connection");
	var address;
	if (socket.request._query.check == "true") {
		logger.info("Socket request from UI");
		address = socket.request._query.username;
		logger.info("Socket connecting address %s", address);
		socketMapUI[address] = socket;
		socket.emit("connectionAck", "Success");
	} else if (socket.request._query.check == "notify") {
		socket.on('key', function (data) {
			if (typeof(data) == "string") {
				address = Buffer.from(data, "base64").toString();
				logger.info("Socket connecting address %s", address);
				socketMapNotify[address] = socket;
				redisServer.redisSubClient.subscribe('UI_notify_' + address, 1);
				//Broadcast Message
				var broadcastTo = ['/admin', '/plugin', '/design', '/designTestCase', '/execute', '/scheduling', '/specificreports', '/mindmap', '/p_Utility', '/p_Reports', 'p_Weboccular', '/neuronGraphs2D', '/p_ALM', '/p_APG'];
				notificationMsg.to = broadcastTo;
				notificationMsg.notifyMsg = 'Server Maintenance Scheduled';
				// var soc = socketMapNotify[address];
				// soc.emit("notify",notificationMsg);
			}
		});
	} else {
		logger.info("Socket request from ICE");
		address = socket.handshake.query.username;
		logger.info("Socket connecting address %s", address);
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
		var apireq = apiclient.post(epurl + "server/updateActiveIceSessions", args,
			function (result, response) {
			if (response.statusCode != 200) {
				logger.error("Error occurred in updateActiveIceSessions Error Code: ERRNDAC");
			} else {
				socket.send('checkConnection', result.ice_check);
				if (result.node_check === "allow") {
					socketMap[address] = socket;
					socket.send('connected');
					logger.debug("%s is connected", address);
					logger.debug("No. of clients connected for Normal mode: %d", Object.keys(socketMap).length);
					socket.emit('update_screenshot_path', screenShotPath);
					redisServer.redisSubClient.unsubscribe('ICE1_normal_' + address);
					redisServer.redisSubClient.unsubscribe('ICE1_scheduling_' + address);
					redisServer.redisSubClient.subscribe('ICE1_normal_' + address);
					redisServer.initListeners(socket);
				} else {
					if (result.node_check === "userNotValid") {
						logger.error("%s is not authorized to connect", address);
					}
					socket.disconnect(false);
				}
			}
		});
		apireq.on('error', function(err) {
			socket.send("fail", "conn");
			io.close();
			httpsServer.close()
			logger.error("Please run the Service API and Restart the Server");
		});
	}
	module.exports.allSocketsMap = socketMap;
	module.exports.allSocketsMapUI = socketMapUI;
	module.exports.allSchedulingSocketsMap = socketMapScheduling;
	module.exports.socketMapNotify = socketMapNotify;
	httpsServer.setTimeout();

	socket.on('disconnect', function (reason) {
		logger.info("Inside Socket disconnect");
		var address;
		// var ip = socket.request.connection.remoteAddress || socket.request.headers['x-forwarded-for'];
		if (socket.request._query.check == "true") {
			address = socket.request._query.username;
			logger.info("Disconnecting from UI socket: %s", address);
		} else if (socket.request._query.check == "notify") {
			// logger.info("Disconnecting from Notification socket: %s", address);
			//address = Buffer.from(socket.request._query.username, "base64").toString();
			//redisServer.redisSubClient.unsubscribe('UI_notify_' + address, 1);
		} else {
			var connect_flag = false;
			logger.info("Inside ICE Socket disconnection");
			address = socket.handshake.query.username;
			if (socketMap[address] != undefined) {
				connect_flag = true;
				logger.info('Disconnecting from ICE socket : %s', address);
				redisServer.redisSubClient.unsubscribe('ICE1_normal_' + address);
				delete socketMap[address];
				module.exports.allSocketsMap = socketMap;
				logger.debug("No. of clients connected for Normal mode: %d", Object.keys(socketMap).length);
				logger.debug("Clients connected for Normal mode : %s", Object.keys(socketMap).join());
			} else if (socketMapScheduling[address] != undefined) {
				connect_flag = true;
				logger.info('Disconnecting from Scheduling socket : %s', address);
				redisServer.redisSubClient.unsubscribe('ICE1_scheduling_' + address);
				delete socketMapScheduling[address];
				module.exports.allSchedulingSocketsMap = socketMapScheduling;
				logger.debug("No. of clients connected for Scheduling mode: %d", Object.keys(socketMapScheduling).length);
				logger.debug("Clients connected for Scheduling mode : %s", Object.keys(socketMapScheduling).join());
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
				var apireq = apiclient.post(epurl + "server/updateActiveIceSessions", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in updateActiveIceSessions Error Code: ERRNDAC");
					} else {
						logger.info("%s is disconnected", address);
					}
				});
				apireq.on('error', function(err) {
					socket.send("fail", "disconn");
					io.close();
					httpsServer.close()
					logger.error("Please run the Service API and Restart the Server");
				});
			}
		}
	});

	socket.on('toggle_schedule', function (data) {
		logger.info("Inside Socket toggle_schedule: Reconnecting for scheduling socket");
		var address = socket.handshake.query.username;
		if (data && socketMap[address] != undefined) {
			redisServer.redisSubClient.unsubscribe('ICE1_normal_' + address);
			redisServer.redisSubClient.subscribe('ICE1_scheduling_' + address);
			logger.info('Disconnecting socket connection for Normal Mode: %s', address);
			delete socketMap[address];
			module.exports.allSocketsMap = socketMap;
			logger.debug("No. of clients connected for Normal mode: %d", Object.keys(socketMap).length);
			logger.debug("Clients connected for Normal mode : %s", Object.keys(socketMap).join());
			socketMapScheduling[address] = socket;
			module.exports.allSchedulingSocketsMap = socketMapScheduling;
			socket.send('schedulingEnabled');
			logger.debug("No. of clients connected for Scheduling mode: %d", Object.keys(socketMapScheduling).length);
			logger.debug("Clients connected for Scheduling mode : %s", Object.keys(socketMapScheduling).join());
		} else if (!data && socketMapScheduling != undefined) {
			redisServer.redisSubClient.unsubscribe('ICE1_scheduling_' + address);
			redisServer.redisSubClient.subscribe('ICE1_normal_' + address);
			logger.info('Disconnecting socket connection for Scheduling mode: %s', address);
			delete socketMapScheduling[address];
			module.exports.allSchedulingSocketsMap = socketMapScheduling;
			logger.debug("No. of clients connected for Scheduling mode: %d", Object.keys(socketMapScheduling).length);
			logger.debug("Clients connected for Scheduling mode : %s", Object.keys(socketMapScheduling).join());
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

module.exports = io;