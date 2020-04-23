const redis = require("redis");
const validator =  require('validator');
const logger = require("../../logger");
const redisConfig = {"host": process.env.REDIS_IP, "port": parseInt(process.env.REDIS_PORT),"password" : process.env.REDIS_AUTH};
const default_sub = redis.createClient(redisConfig);
const default_pub = redis.createClient(redisConfig);
const server_sub = redis.createClient(redisConfig);
// const cache = redis.createClient(redisConfig);
// cache.select(2);
const server_pub = default_pub;
default_pub.pubsubPromise =  async (cmd, ...channel) => (new Promise((rsv, rej) => default_pub.pubsub(cmd, channel, (e,d) => ((e)? rej(e):rsv(d)))));

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
		mySocket.emit("LAUNCH_MOBILE_WEB", data.mobileSerial, data.androidVersion);
		break;

	case "PDF_SCRAPE":
		mySocket.emit("PDF_SCRAPE", data.browsertype);
		break;

	case "webscrape":
		mySocket.emit("webscrape", data.data);
		break;

	case "focus":
		mySocket.emit("focus", data.focusParam, data.elementURL, data.appType);
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
		mySocket.emit("jiralogin", data.action, data.inputs);
		break;

	case "executeTestSuite":
		mySocket.emit("executeTestSuite", data.executionRequest);
		break;

	case "qclogin":
		mySocket.emit("qclogin", data.responsedata);
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
		mySocket.emit("killSession", data.cmdBy);
		break;
	
	case "irisOperations":
		mySocket.emit("irisOperations", data.image_data, data.param);
		break
		
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
//module.exports.cache = cache;

module.exports.initListeners = mySocket => {
	const username = mySocket.handshake.query.username;
	logger.debug("Initializing ICE Engine connection for %s",username);
	mySocket.evdata = {};
	mySocket.pckts = [];

	mySocket.use((args, cb) => {
		const ev = args[0];
		const fullPcktId = args.splice(1,1)[0];
		const pcktId = fullPcktId.split('_')[0];
		const index = fullPcktId.split('_')[1];
		mySocket.emit("data_ack", fullPcktId);
		if (mySocket.pckts.indexOf(pcktId) !== -1) { // Check if packet has already been consumed by server
			if (index == 'eof') mySocket.emit("data_ack", pcktId); // If this was EOF packet, send 2nd ACK
			return null;  // Do nothing as packet has already been consumed
		}
		if (index === undefined) {  // Normal packet
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
			const d2p = [parseInt(comps[0])].concat(Array.apply(null, Array(parseInt(comps[1]))));
			mySocket.evdata[ev] = {id: subPackId, data: d2p, jsonify: comps[2] === "True"};
		} else if (ev_data && ev_data.id == subPackId) {
			if (index == 'eof') {
				const payloadlength = mySocket.evdata[ev].data.shift();
				const fpayload = mySocket.evdata[ev].data.join('');
				if (fpayload.length != payloadlength) {
					mySocket.emit("data_ack", pcktId, "paginate_fail");
					const blocks = mySocket.evdata[ev].data.length;
					delete mySocket.evdata[ev].data;
					mySocket.evdata[ev].data = [payloadlength].concat(Array.apply(null, Array(blocks)));
				} else {
					mySocket.pckts.push(pcktId);
					mySocket.emit("data_ack", pcktId);
					args[1] = ev_data.jsonify? JSON.parse(fpayload):fpayload;
					delete mySocket.evdata[ev]
					cb();
				}
			} else {
				mySocket.evdata[ev].data[parseInt(index)] = payload;
			}
		} else if (validator.isUUID(subPackId)) {
			logger.info("Unknown packet received! Restarting pagination. Event: "+args[0]+", ID: "+fullPcktId);
			mySocket.emit("data_ack", pcktId, "paginate_fail");
		} else cb();
	});

	mySocket.on("message", value => {
		if (value == "unavailableLocalServer") {
			const dataToNode = JSON.stringify({"username": username, "onAction": value, "value": {}});
			server_pub.publish("ICE2_" + username, dataToNode);
		} else console.log("\n\nOn Message:", value);
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
};