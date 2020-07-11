var logger = require('../../logger');
var redisServer = require('./redisSocketHandler');
var utils = require('./utils');
//SOCKET CONNECTION USING SOCKET.IO
var socketMap = {};
var userICEMap={};
var socketMapUI = {};
var socketMapScheduling = {};
var socketMapNotify = {};

var uiConfig = require('./../config/options');
var screenShotPath = uiConfig.screenShotPath;
var benchmarkRunTimes = uiConfig.benchmarkRuntimes;
var myserver = require('./../../server');
var httpsServer = myserver.httpsServer;
var io = require('socket.io').listen(httpsServer, { cookie: false, pingInterval: uiConfig.socketio.pingInterval, pingTimeout: uiConfig.socketio.pingTimeout });
var notificationMsg = require('./../notifications/notifyMessages');
var epurl = process.env.NDAC_URL;
var Client = require("node-rest-client").Client;
var apiclient = new Client();

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
		var ice_info=socket.handshake.query;
		var icename=ice_info.icename;
		logger.info("ICE Socket connecting address %s : %s", icename);
		var icesession = ice_info.icesession;
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
				socket.send('fail', "conn");
			} else {
				socket.send('checkConnection', result.ice_check);
				if (result.node_check === "allow") {
					socketMap[icename] = socket;
					userICEMap[result.username]=icename;
					setTimeout(()=> {
						socket.send('connected', result.ice_check);
						socket.emit('update_screenshot_path', screenShotPath, benchmarkRunTimes);
					}, 300);
					logger.debug("%s is connected", icename);
					logger.debug("No. of clients connected for Normal mode: %d", Object.keys(socketMap).length);
					redisServer.redisSubClient.unsubscribe('ICE1_normal_' + icename);
					redisServer.redisSubClient.unsubscribe('ICE1_scheduling_' + icename);
					redisServer.redisSubClient.subscribe('ICE1_normal_' + icename);
					redisServer.initListeners(socket);
				} else {
					if (result.node_check === "InvalidToken" || result.node_check === "InvalidICE") {
						logger.error("%s is not authorized to connect", icename);
					} else if(result.node_check === "validICE"){
						logger.info("%s Registered Successfully", icename)
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
	module.exports.allSocketsICEUser=userICEMap;
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
			address = socket.handshake.query.icename;
			if (socketMap[address] != undefined) {
				connect_flag = true;
				logger.info('Disconnecting from ICE socket (%s) : %s', reason, address);
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
					"icename": address,
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
		var address = socket.handshake.query.icename;
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

const registerICE = async (req, res) => {
	logger.info("Inside ICE Registration");
	const icename = req.body.icename;
	logger.info("Registration request from ICE %s : %s", icename);
	const inputs = { "query": "connect", "icesession": req.body.icesession };
	var data = {};
	try {
		data = await utils.fetchData(inputs, "server/updateActiveIceSessions", "registerICE");
		if (data.node_check === "InvalidToken" || result.node_check === "InvalidICE") {
			logger.error("%s is not authorized to connect", icename);
		} else if(result.node_check === "validICE"){
			logger.info("%s Registered Successfully", icename)
		} else {
			logger.info("Failed to register %s", icename)
		}
	} catch (ex) {
		logger.info("Failed to register %s", icename)
		data = "fail";
	}
	res.send(data.ice_check);
};

module.exports = io;
module.exports.registerICE = registerICE;
