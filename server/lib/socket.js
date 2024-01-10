const uiConfig = require('./../config/options');
const screenShotPath = uiConfig.screenShotPath;
const objectPredictionPath = uiConfig.objectPredictionPath;
const benchmarkRunTimes = uiConfig.benchmarkRuntimes;
const pingTimer = uiConfig.pingTimer;
const eula = uiConfig.showEULA;
const httpsServer = require('./../../server').httpsServer;
const validator = require('validator');

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
let iceIPMap = {};
module.exports = io;
module.exports.allSocketsMap = socketMap;
module.exports.allSocketsICEUser=userICEMap;
module.exports.allSocketsMapUI = socketMapUI;
module.exports.allSchedulingSocketsMap = socketMapScheduling;
module.exports.socketMapNotify = socketMapNotify;
module.exports.allICEIPMap = iceIPMap;

var logger = require('../../logger');
var utils = require('./utils');
var notificationMsg = require('./../notifications').broadcast;
const cache = require("./cache").getClient(2);

io.on('connection', async socket => {
	logger.info("Inside Socket connection");
	var address;
	var username;
	var clientName=utils.getClientName(socket.request.headers.host);
	if (socket.request._query.check == "true") {
		logger.info("Socket request from UI");
		address = socket.request._query.username;
		logger.info("Socket connecting address %s", address);
		socketMapUI[address] = socket;
		socket.emit("connectionAck", "Success");
	} else if (socket.request._query.check == "notify") {
		address = socket.request._query.key && Buffer.from(socket.request._query.key, "base64").toString() || "-";
		logger.info("Notification Socket connecting address %s", address);
		if(socketMapNotify[clientName] == undefined) socketMapNotify[clientName] = {};
		socketMapNotify[clientName][address] = socket;
		sendPendingNotifications(socket,address);
		//Broadcast Message
		var broadcastTo = ['/admin', '/plugin', '/design', '/designTestCase', '/execute', '/scheduling', '/specificreports', '/mindmap', '/p_Utility', '/p_Reports', '/p_ALM', '/p_Integration', '/p_qTest', '/p_Zephyr'];
		notificationMsg.to = broadcastTo;
		notificationMsg.notifyMsg = 'Server Maintenance Scheduled';
		// var soc = socketMapNotify[address];
		// soc.emit("notify",notificationMsg);
	} else {
		const ice_info = socket.handshake.query;
		const icename = ice_info.icename;
		username = icename;
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
				"query": 'connect',
				"host":socket.request.headers.host
			};
			const result = await utils.fetchData(inputs, "server/updateActiveIceSessions", "updateActiveIceSessions");
			if (result == 'fail') {
				socket.send('fail', "conn");
			} else {
				socket.send('connected', result.ice_check);
				if (result.node_check === "allow") {
					if(socketMap[clientName] == undefined) socketMap[clientName] = {};
					socketMap[clientName][icename] = socket;
					if(userICEMap[clientName] == undefined) userICEMap[clientName] = {};
					if(!userICEMap[clientName][result.username]) userICEMap[clientName][result.username] = []
					iceUserMap[icename] = result.username;
					if(!userICEMap[clientName][result.username].includes(icename)) userICEMap[clientName][result.username][0] = icename;
					initListeners(socket);
					logger.debug("%s is connected", icename);
					logger.debug("No. of clients connected for Normal mode: %d", Object.keys(socketMap).length);
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

	// httpsServer.setTimeout();

	socket.on('getconstants', async () => socket.emit('update_screenshot_path', screenShotPath, benchmarkRunTimes, pingTimer, objectPredictionPath));

	socket.on('disconnect', async reason => {
		logger.info("Inside Socket disconnect");
		var address;
		const icesession = socket.handshake.query.icesession;
		address = socket.handshake.query.icename;
		var clientName=utils.getClientName(socket.request.headers.host);
		// var ip = socket.request.connection.remoteAddress || socket.request.headers['x-forwarded-for'];
		try{
		if (socket.request._query.check == "true") {
			address = socket.request._query.username;
			logger.info("Disconnecting from UI socket: %s", address);
		} else if (socket.request._query.check == "notify") {
			address = socket.request._query.key && Buffer.from(socket.request._query.key, "base64").toString() || "-";
			logger.info("Disconnecting from Notification socket: %s", address);
			if (socketMapNotify[clientName][address]) delete socketMapNotify[clientName][address];
		} else {
			var connect_flag = false;
			logger.info("Inside ICE Socket disconnection");
			host = JSON.parse(icesession).host;
			let clientName="avoassure";
			if(host != null && host != undefined)
			{
				if(!(host.includes("localhost") || require('net').isIP(host)>0)){
					clientName=host.split('.')[0]
				}
			}
			if (socketMap[clientName][address] != undefined) {
				connect_flag = true;
				logger.info('Disconnecting from ICE socket (%s) : %s', reason, address);
				delete socketMap[clientName][address];
				module.exports.allSocketsMap = socketMap;
				logger.debug("No. of clients connected for Normal mode: %d", Object.keys(socketMap).length);
				logger.debug("Clients connected for Normal mode : %s", Object.keys(socketMap).join());
			} else if (socketMapScheduling[address] != undefined) {
				connect_flag = true;
				logger.info('Disconnecting from Scheduling socket : %s', address);
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
		}
		catch(err){
			logger.error("Error occurred in disconnecting to socket address");
			const disConnResult = await utils.fetchData({"icename": address,"query": 'disconnect',"icesession": icesession}, "server/updateActiveIceSessions", "updateActiveIceSessions");
		}});

	socket.on('toggle_schedule', function (data) {
		logger.info("Inside Socket toggle_schedule: Reconnecting for scheduling socket");
		var address = socket.handshake.query.icename;
		if (data && socketMap[address] != undefined) {
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
	socket.on('ICE_status_change', async value => {
		let queue = require("./execution/executionQueue")
		var clientName= utils.getClientName(value.host);
		username = value.icename ? 	value.icename : username;
		if (value.connected){
			const dataToExecute = JSON.stringify({"username" : username,"onAction" : "ice_status_change","value":value,"reqID":new Date().toUTCString()});
			queue.Execution_Queue.triggerExecution(dataToExecute);
		}else{
			logger.info("ICE: " + username + " disconnected, deleting callbacks")
			delete queue.Execution_Queue.registred_ICE[username]
			queue.Execution_Queue.ice_list[username]["connected"] = false
		}
		if(iceIPMap[clientName] == undefined) iceIPMap[clientName] = {};
		iceIPMap[clientName][username] = value.hostip;
		if(socketMap[clientName][username] != socket){
			socketMap[clientName][username] = socket;
		}
		cache.sethmap(username,value)
	});

	socket.on("result_executeTestSuite", async (message)=>{
		let socketUtils = require("./socketUtils")
		let executor = require("./execution/executor");
		const data = message;
		const resultData = data;
		const status = resultData.status;
		const execReq=resultData.execReq;
		const execType = resultData.execType;
		const userInfo=execReq?resultData.execReq.userInfo:undefined;
		const invokinguser =userInfo? userInfo.invokingusername:undefined;
		const host = invokinguser ?userInfo.host:{};
		var clientName=utils.getClientName(host);
		const notifySocMap = socketMapNotify[clientName];
		if(execReq) socketUtils.result_executeTestSuite(resultData,status,execReq,execType,userInfo,invokinguser,executor.insertReport,notifySocMap);
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
	var clientName=utils.getClientName(req.headers.host);
	var result = "fail"
	if(userICEMap[clientName][username]){
		result = {"ice_list":userICEMap[clientName][username]}
	}
	res.send(result)
}

const setDefaultUserICE = (req,res) => {
	var result = "fail"
	try{
		let user = req.session.username;
		let defaultICE = req.body.defaultICE;
		var clientName=utils.getClientName(req.headers.host);
		if(userICEMap[clientName][user] && userICEMap[clientName][user].indexOf(defaultICE) >= 0){
			let index = userICEMap[clientName][user].indexOf(defaultICE);
			userICEMap[clientName][user].splice(index,1);
			userICEMap[clientName][user].splice(0,0,defaultICE);
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

initListeners = mySocket => {
	let queue = require("./execution/executionQueue");
	const username = mySocket.handshake.query.icename;
	logger.debug("Initializing ICE Engine connection for %s",username);
	mySocket.evdata = {};
	mySocket.pckts = [];
	queue.Execution_Queue.register_execution_trigger_ICE(username);
	mySocket.use((args, cb) => {
		const ev = args[0];
		const ack = (typeof  args[args.length-1] === 'function')? args.pop():() => {};
		const fullPcktId = args.splice(1,1)[0];
		const pcktId = fullPcktId.split('_')[0];
		const index = fullPcktId.split('_')[1];

		// ACK for Paginated Packets will be sent later after processing
		if (index === undefined) ack(fullPcktId);
		// Check if packet has already been consumed by server
		if (mySocket.pckts.indexOf(pcktId) !== -1) {
			if (index !== undefined) ack(fullPcktId); // If this was Paginated packet, send ACK
			return null;  // Do nothing as packet has already been consumed
		}
		// Normal packet - Do not apply pagination logic
		if (index === undefined) {
			mySocket.pckts.push(pcktId);
			return cb();
		}
		/* Paginated packets processing starts */
		const data = args[1];
		const ev_data = mySocket.evdata[ev];
		const comps = data.split(';');
		const subPackId = comps.shift();
		const payload = comps.join(';');
		if (index == "p@gIn8" && comps.length == 3) {
			ack(fullPcktId);
			const d2p = [parseInt(comps[0])].concat(Array.apply(null, Array(parseInt(comps[1]))));
			mySocket.evdata[ev] = {id: subPackId, data: d2p, jsonify: comps[2] === "True"};
		} else if (ev_data && ev_data.id == subPackId) {
			if (index == 'eof') {
				const payloadlength = mySocket.evdata[ev].data.shift();
				const fpayload = mySocket.evdata[ev].data.join('');
				if (fpayload.length != payloadlength) {
					ack(fullPcktId, "paginate_fail");
					const blocks = mySocket.evdata[ev].data.length;
					delete mySocket.evdata[ev].data;
					mySocket.evdata[ev].data = [payloadlength].concat(Array.apply(null, Array(blocks)));
				} else {
					ack(fullPcktId);
					mySocket.pckts.push(pcktId);
					args[1] = ev_data.jsonify? JSON.parse(fpayload):fpayload;
					delete mySocket.evdata[ev]
					cb();
				}
			} else {
				ack(fullPcktId);
				mySocket.evdata[ev].data[parseInt(index)] = payload;
			}
		} else if (validator.isUUID(subPackId)) {
			ack(fullPcktId, "paginate_fail");
			logger.info("Unknown packet received! Restarting pagination. Event: "+args[0]+", ID: "+fullPcktId);
		} else {
			ack(fullPcktId);
			cb();
		}
	});
}

module.exports.registerICE = registerICE;
module.exports.getUserICE = getUserICE;
module.exports.setDefaultUserICE = setDefaultUserICE;