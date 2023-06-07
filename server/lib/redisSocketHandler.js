const redis = require("redis");
const validator =  require('validator');
const logger = require("../../logger");
const dbAuthStore = require('./dbAuthStore');
const redisConfig = {"host": process.env.CACHEDB_IP, "port": parseInt(process.env.CACHEDB_PORT), "password": dbAuthStore.getCachedbAuth()};
const default_sub = redis.createClient(redisConfig);
const default_pub = redis.createClient(redisConfig);
const server_sub = redis.createClient(redisConfig);
var cache = require('./cache').getClient(2);
var options = require('../config/options');
var pulse_ICE = {}
const server_pub = default_pub;
default_pub.pubsubPromise =  async (cmd, ...channel) => (new Promise((rsv, rej) => default_pub.pubsub(cmd, channel, (e,d) => ((e)? rej(e):rsv(d)))));
const utils = require("./utils");
const queue = require("./execution/executionQueue")
default_sub.on("message", (channel, message) => {
	logger.debug("In redisSocketHandler: Channel is %s", channel);
	const data = JSON.parse(message);
	const socketchannel = channel.split('_')[1];
	const sockets = require("./socket");
	var mySocket;
	if (socketchannel === "notify")
		mySocket = sockets.socketMapNotify[data.username];
	else if (socketchannel === "scheduling")
		mySocket = sockets.allSchedulingSocketsMap[data.username];
	else
		mySocket = sockets.allSocketsMap[data.username];
	if (mySocket === undefined) {
		const dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": {}});
		server_pub.publish("ICE2_" + data.username, dataToNode);
		return false;
	}
	switch (data.emitAction) {
	case "webCrawlerGo":
		mySocket.emit("webCrawlerGo", data.input_url, data.level, data.agent, data.proxy,data.searchData);
		break;

	case "LAUNCH_DESKTOP":
		mySocket.emit("LAUNCH_DESKTOP", data.applicationPath, data.processID, data.scrapeMethod);
		break;

	case "LAUNCH_SAP":
		mySocket.emit("LAUNCH_SAP", data.applicationPath);
		break;

	case "LAUNCH_OEBS":
		mySocket.emit("LAUNCH_OEBS", data.applicationPath);
		break;

	case "LAUNCH_MOBILE":
		if(data.param == "ios") mySocket.emit("LAUNCH_MOBILE", data.deviceName, data.versionNumber, data.bundleId, data.ipAddress, data.param);
		else mySocket.emit("LAUNCH_MOBILE", data.apkPath, data.serial, data.mobileDeviceName, data.mobileIosVersion, data.mobileUDID);
		break;

	case "LAUNCH_MOBILE_WEB":
		mySocket.emit("LAUNCH_MOBILE_WEB", data.mobileSerial, data.androidVersion, data.data);
		break;

	case "PDF_SCRAPE":
		mySocket.emit("PDF_SCRAPE", data.browsertype);
		break;

	case "webscrape":
		mySocket.emit("webscrape", data.data);
		break;
	
	case "LAUNCH_DESKTOP_iris":
		mySocket.emit("LAUNCH_DESKTOP", data.data);
		break;
	
	case "LAUNCH_OEBS_iris":
		mySocket.emit("LAUNCH_OEBS", data.data);
		break;
		
	case "LAUNCH_SAP_iris":
		mySocket.emit("LAUNCH_SAP", data.data);
		break;

	case "focus":
		mySocket.emit("focus", data.focusParam, data.elementURL, data.appType, data.top, data.left, data.width, data.height);
		break;

	case "debugTestCase":
		mySocket.emit("debugTestCase", data.responsedata);
		break;

	case "wsdl_listOfOperation":
		mySocket.emit("wsdl_listOfOperation", data.wsdlurl);
		break;

	case "wsdl_ServiceGenerator":
		mySocket.emit("wsdl_ServiceGenerator", data.serviceGenRequest);
		break;

	case "render_screenshot":
		mySocket.emit("render_screenshot", data.path);
		break;

	case "jiralogin":
		mySocket.emit("jiralogin", data.action, data.inputs, data.project_selected, data.itemType);
		break;

	case "azureLogin":
		mySocket.emit("azurelogin", data.action, data.inputs);
		break;

	case "azureUserStories":
		mySocket.emit("azureUserStories", data.action, data.inputs);
		break;

	// case "getJiraTestcases":
	// 	mySocket.emit("getJiraTestcases", data.action, data.inputs);
	// 	break;

	case "executeTestSuite":
		mySocket.emit("executeTestSuite", data.executionRequest);
		break;

	case "qclogin":
		mySocket.emit("qclogin", data.responsedata);
		break;

	case "qtestlogin":
		mySocket.emit("qtestlogin", data.responsedata);
		break;
	
	case "zephyrlogin":
		mySocket.emit("zephyrlogin", data.responsedata);
		break;

	case "apgOpenFileInEditor":
		mySocket.emit("apgOpenFileInEditor", data.editorName, data.filePath, data.lineNumber);
		break;

	case "generateFlowGraph":
		mySocket.emit("generateFlowGraph", data.version, data.path);
		break;
	
	case "runDeadcodeIdentifier":
		mySocket.emit("runDeadcodeIdentifier", data.version, data.path);
		break;

	case "getSocketInfo":
		const data_packet = {"username": data.username, "value": mySocket? mySocket.handshake.address:"fail"};
		server_pub.publish("ICE2_" + data.username, JSON.stringify(data_packet));
		break;

	case "killSession":
		mySocket.emit("killSession", data.cmdBy, data.reason);
		break;

	case "irisOperations":
		mySocket.emit("irisOperations", data.image_data, data.param);
		break

	case "SauceLablogin":
		mySocket.emit("saucelablogin", data.responsedata);
		break;

	case "getSerialNumber":
		mySocket.emit("getSerialNumber");
		break;

	default:
		var dataToNode = JSON.stringify({"username": data.username, "onAction": "fail", "value": "fail"});
		server_pub.publish("ICE2_" + data.username, dataToNode);
		break;
	}
});

const redisErrorHandler = err => { /* Error Handler */ }

default_sub.on("error",redisErrorHandler);
default_pub.on("error",redisErrorHandler);
server_sub.on("error",redisErrorHandler);
//server_pub.on("error",redisErrorHandler);

module.exports.redisSubClient = default_sub;
module.exports.redisPubICE = default_pub;
module.exports.redisSubServer = server_sub;
//module.exports.redisPubServer = server_pub;
setInterval(check_pulse,options.pingTimer);

module.exports.initListeners = mySocket => {
	const username = mySocket.handshake.query.icename;
	logger.debug("Initializing ICE Engine connection for %s",username);
	mySocket.evdata = {};
	mySocket.pckts = [];
	pulse_ICE[username] = {}
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

	mySocket.on("message", (value) => {
		if (value == "unavailableLocalServer") {
			const dataToNode = JSON.stringify({"username": username, "onAction": value, "value": {}});
			server_pub.publish("ICE2_" + username, dataToNode);
		} else {
			console.log("\n\nOn Message:", value);
		}
	});

	mySocket.on("test_conn", value => {
		logger.info("Socket Connection Test Successful. Packet Size: " + (value || "").length);
	});

	mySocket.on("result_web_crawler", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "result_web_crawler", "value": JSON.parse(value)});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_web_crawler_finished", value => {
		const dataToNode = JSON.stringify({"username" : username,"onAction" : "result_web_crawler_finished","value":JSON.parse(value)});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("scrape", value => {
		const dataToNode = JSON.stringify({"username" : username,"onAction" : "scrape","value":value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_debugTestCase", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "result_debugTestCase", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_debugTestCaseWS", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "result_debugTestCaseWS", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_wsdl_listOfOperation", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "result_wsdl_listOfOperation", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_wsdl_ServiceGenerator", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "result_wsdl_ServiceGenerator", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("render_screenshot", value => {
		var dataToNode = {"username": username, "onAction": "render_screenshot"};
		if (value.length > 25) {
			for (var i = 0; i <= parseInt((value.length)/500); i++) {
				dataToNode.value = value.slice(i*500, (i+1)*500);
				server_pub.publish("ICE2_" + username, JSON.stringify(dataToNode));
			}
		} else {
			dataToNode.value = value;
			server_pub.publish("ICE2_" + username, JSON.stringify(dataToNode));
		}
		dataToNode.onAction = "render_screenshot_finished";
		dataToNode.value = (typeof(value) === "string")? value: "";
		server_pub.publish("ICE2_" + username, JSON.stringify(dataToNode));
	});

	mySocket.on("auto_populate", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "auto_populate", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("issue_id", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "issue_id", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("configure_field", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "configure_field", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("Jira_details", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "Jira_details", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});
	mySocket.on("Azure_details", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "Azure_details", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("Jira_testcases", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "Jira_testcases", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_executeTestSuite", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "result_executeTestSuite", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("return_status_executeTestSuite", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "return_status_executeTestSuite", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("qcresponse", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "qcresponse", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});
	mySocket.on("sauceconfresponse", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "sauceconfresponse", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on('open_file_in_editor_result', value => {
		const dataToNode = JSON.stringify({"username" : username,"onAction" : "open_file_in_editor_result","value":JSON.parse(value)});
		server_pub.publish('ICE2_' + username, dataToNode);
	});

	mySocket.on('flowgraph_result', value => {
		const dataToNode = JSON.stringify({"username" : username,"onAction" : "flowgraph_result","value":JSON.parse(value)});
		server_pub.publish('ICE2_' + username, dataToNode);
	});

	mySocket.on('result_flow_graph_finished', value => {
		const dataToNode = JSON.stringify({"username" : username,"onAction" : "result_flow_graph_finished","value":JSON.parse(value)});
		server_pub.publish('ICE2_' + username, dataToNode);
	});

	mySocket.on('deadcode_identifier', value => {
		const dataToNode = JSON.stringify({"username" : username,"onAction" : "deadcode_identifier","value":value});
		server_pub.publish('ICE2_' + username, dataToNode);
	});

	mySocket.on('iris_operations_result', value => {
		const dataToNode = JSON.stringify({"username" : username,"onAction" : "iris_operations_result","value":JSON.parse(value)});
		server_pub.publish('ICE2_' + username, dataToNode);
	});
	mySocket.on('benchmark_ping', async value => {
		const result = await utils.fetchData(value, "benchmark/store", "benchmark_ping");
		if (result == "fail") logger.error("Error occurred in storing benchmark");
	});
	mySocket.on('ICE_status_change', async value => {
		pulse_ICE = await cache.get("ICE_status")
		pulse_ICE[username] = value;
		if (value.connected){
			const dataToExecute = JSON.stringify({"username" : username,"onAction" : "ice_status_change","value":value,"reqID":new Date().toUTCString()});
			server_pub.publish('ICE_STATUS_' + username, dataToExecute);
		}else{
			logger.info("ICE: " + username + " disconnected, deleting callbacks")
			pulse_ICE[username]["time"] = null;
			pulse_ICE[username]["connected"] = false;
			delete queue.Execution_Queue.registred_ICE[username]
			queue.Execution_Queue.ice_list[username]["connected"] = false
			server_sub.unsubscribe('ICE_STATUS_' + username);
		}
		cache.set("ICE_status",pulse_ICE)
	});
	mySocket.on("get_serial_number", value => {
		const dataToNode = JSON.stringify({"username": username, "onAction": "get_serial_number", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});
};

async function check_pulse(){
	var time = new Date().toUTCString()
	var writeStr = "None"
	var pulse_ICE = await cache.get("ICE_status")
	logger.silly("Checking ICE pulse")
	for (var ice in pulse_ICE) {
		if(pulse_ICE[ice]["time"]){
			var iceTime = pulse_ICE[ice]["time"] + "+0"
			var writeStr = "";
			if(Math.abs(Date.parse(time) - Date.parse(iceTime)) >= 100000){
				var writeStr = time.toString() + " " + ice + " Disconnected pulse last recieved at: " + iceTime.toString();
				logger.info(writeStr)
				pulse_ICE[ice]["time"] = null;
				pulse_ICE[ice]["connected"] = false;
				cache.set("ICE_status",pulse_ICE)
				var value = pulse_ICE[ice];
				const dataToExecute = JSON.stringify({"username" : ice,"onAction" : "ice_status_change","value":value});
				server_pub.publish('ICE2_' + ice, dataToExecute);
				delete queue.Execution_Queue.registred_ICE[ice]
				if (queue.Execution_Queue.ice_list[ice]) queue.Execution_Queue.ice_list[ice]['connected'] = false
				server_sub.unsubscribe('ICE_STATUS_' + ice);
			}else{
				writeStr = time.toString() + " " + ice + " status: " + pulse_ICE[ice]["status"] + " ICE mode: " + pulse_ICE[ice]["mode"]; 
				logger.silly(writeStr)
			}
		}
	}
}

check_pulse()