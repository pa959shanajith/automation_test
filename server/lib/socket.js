const uiConfig = require('./../config/options');
const screenShotPath = uiConfig.screenShotPath;
const objectPredictionPath = uiConfig.objectPredictionPath;
const benchmarkRunTimes = uiConfig.benchmarkRuntimes;
const pingTimer = uiConfig.pingTimer;
const eula = uiConfig.showEULA;
const httpsServer = require('./../../server').httpsServer;

//SOCKET CONNECTION USING SOCKET.IO
const io = require('socket.io')(httpsServer, {
	cookie: false,
	pingInterval: uiConfig.socketio.pingInterval,
	pingTimeout: uiConfig.socketio.pingTimeout,
	allowEIO3: true,
	maxHttpBufferSize: 1e8  // approx. 100 MB, default is 1 MB
});

let socketMap = {};
let userICEMap={};
let socketMapUI = {};
let socketMapScheduling = {};
let socketMapNotify = {};
let iceUserMap = {};
module.exports = io;
module.exports.allSocketsMap = socketMap;
module.exports.allSocketsICEUser=userICEMap;
module.exports.allSocketsMapUI = socketMapUI;
module.exports.allSchedulingSocketsMap = socketMapScheduling;
module.exports.socketMapNotify = socketMapNotify;

var logger = require('../../logger');
var redisServer = require('./redisSocketHandler');
var utils = require('./utils');
var notificationMsg = require('./../notifications').broadcast;
const cache = require("./cache").getClient(2);

io.on('connection', async socket => {
	logger.info("Inside Socket connection");
	var address;
	if (socket.request._query.check == "true") {
		logger.info("Socket request from UI");
		address = socket.request._query.username;
		logger.info("Socket connecting address %s", address);
		socketMapUI[address] = socket;
		socket.emit("connectionAck", "Success");
	} else if (socket.request._query.check == "notify") {
		address = socket.request._query.key && Buffer.from(socket.request._query.key, "base64").toString() || "-";
		logger.info("Notification Socket connecting address %s", address);
		socketMapNotify[address] = socket;
		sendPendingNotifications(socket,address);
		redisServer.redisSubClient.subscribe('UI_notify_' + address);
		//Broadcast Message
		var broadcastTo = ['/admin', '/plugin', '/design', '/designTestCase', '/execute', '/scheduling', '/specificreports', '/mindmap', '/p_Utility', '/p_Reports', '/p_ALM', '/p_Integration', '/p_qTest', '/p_Zephyr'];
		notificationMsg.to = broadcastTo;
		notificationMsg.notifyMsg = 'Server Maintenance Scheduled';
		// var soc = socketMapNotify[address];
		// soc.emit("notify",notificationMsg);
	} else {
		const ice_info = socket.handshake.query;
		const icename = ice_info.icename;
		logger.info("ICE Socket connecting address: %s", icename);
		const icesession = ice_info.icesession;
		let eulaFlag = !eula;
		if (eula) {
			const inputseula = {
				"icename": icename,
				"query": "loadUserInfo"
			};
			const eulaResult = await utils.fetchData(inputseula, "login/checkTandC", "socketio");
			eulaFlag = (eulaResult == "success" || eulaResult == "nouser");
			if (!eulaFlag) {
				logger.error("ICE connection %s rejected because user has not accepted Avo Assure Terms and Conditions", icename);
				socket.send("decline");
				socket.disconnect(false);
			}
		}

		if (eulaFlag) {
			const inputs = {
				"icesession": icesession,
				"query": 'connect'
			};
			const result = await utils.fetchData(inputs, "server/updateActiveIceSessions", "updateActiveIceSessions");
			if (result == 'fail') {
				socket.send('fail', "conn");
			} else {
				socket.send('connected', result.ice_check);
				if (result.node_check === "allow") {
					host = JSON.parse(icesession).host;
					let clientName="avoassure";
					if(host != null && host != undefined)
					{
						if(!(host.includes("localhost") || require('net').isIP(host)>0)){
							clientName=host.split('.')[0]
						}
					}
					if(socketMap[clientName] == undefined) socketMap[clientName] = {};
					socketMap[clientName][icename] = socket;
					if(!userICEMap[result.username]) userICEMap[result.username] = []
					iceUserMap[icename] = result.username;
					if(!userICEMap[result.username].includes(icename)) userICEMap[result.username].push(icename);
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
		}
	}

	httpsServer.setTimeout();

	socket.on('getconstants', async () => socket.emit('update_screenshot_path', screenShotPath, benchmarkRunTimes, pingTimer, objectPredictionPath));

	socket.on('disconnect', async reason => {
		logger.info("Inside Socket disconnect");
		var address;
		// var ip = socket.request.connection.remoteAddress || socket.request.headers['x-forwarded-for'];
		if (socket.request._query.check == "true") {
			address = socket.request._query.username;
			logger.info("Disconnecting from UI socket: %s", address);
		} else if (socket.request._query.check == "notify") {
			address = socket.request._query.key && Buffer.from(socket.request._query.key, "base64").toString() || "-";
			logger.info("Disconnecting from Notification socket: %s", address);
			redisServer.redisSubClient.unsubscribe('UI_notify_' + address);
			if (socketMapNotify[address]) delete socketMapNotify[address];
		} else {
			var connect_flag = false;
			logger.info("Inside ICE Socket disconnection");
			address = socket.handshake.query.icename;
			const icesession = socket.handshake.query.icesession;
			if (socketMap[address] != undefined) {
				connect_flag = true;
				logger.info('Disconnecting from ICE socket (%s) : %s', reason, address);
				redisServer.redisSubClient.unsubscribe('ICE1_normal_' + address);
				delete socketMap[address];
				if(address in iceUserMap){
					let user = iceUserMap[address];
					let index = userICEMap[user].indexOf(address);
					userICEMap[user].splice(index,1);
					delete iceUserMap[address];
				}
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
				inputs = {
					"icename": address,
					"query": 'disconnect',
					"icesession": icesession
				};
				const disConnResult = await utils.fetchData(inputs, "server/updateActiveIceSessions", "updateActiveIceSessions");
				if (disConnResult == "fail") {
					socket.send("fail", "disconn");
				} else {
					logger.info("%s is disconnected", address);
				}
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
		var address = socket.handshake && socket.handshake.query.icename || socket.request._query.username;
		logger.error("Error occurred in connecting to socket address %s", address);
	});
});
//SOCKET CONNECTION USING SOCKET.IO

const registerICE = async (req, res) => {
	logger.info("Inside ICE Registration");
	const icename = req.body.icename;
	logger.info("Registration request from ICE address: %s", icename);
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

const getUserICE = (req,res) => {
	let username = req.session.username;
	var result = "fail"
	if(userICEMap[username]){
		result = {"ice_list":userICEMap[username]}
	}
	res.send(result)
}

const setDefaultUserICE = (req,res) => {
	var result = "fail"
	try{
		let user = req.session.username;
		let defaultICE = req.body.defaultICE;
		if(userICEMap[user] && userICEMap[user].indexOf(defaultICE) >= 0){
			let index = userICEMap[user].indexOf(defaultICE);
			userICEMap[user].splice(index,1);
			userICEMap[user].splice(0,0,defaultICE);
		}
		result = "success"
	}catch{
		result = "fail"
	}
	res.send(result)
}

async function sendPendingNotifications(socket,address){
	var pending_notification = await cache.get("pending_notification")
		if(pending_notification && Object.keys(pending_notification).length > 0){
			for(user in pending_notification){
				if(address == user){
					socket.emit("display_execution_popup",pending_notification[user])
					delete pending_notification[user]
					await cache.set("pending_notification",pending_notification)
				}
			}
		}
}
module.exports.registerICE = registerICE;
module.exports.getUserICE = getUserICE;
module.exports.setDefaultUserICE = setDefaultUserICE;