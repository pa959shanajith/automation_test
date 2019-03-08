var redis = require("redis");
var logger = require("../../logger");
var redisConfig = {"host": process.env.REDIS_IP, "port": parseInt(process.env.REDIS_PORT),"password" : process.env.REDIS_AUTH};
var default_sub = redis.createClient(redisConfig);
var default_pub = redis.createClient(redisConfig);
var server_sub = redis.createClient(redisConfig);
var server_pub = redis.createClient(redisConfig);

default_sub.on("message", function (channel, message) {
	logger.debug("In redisSocketHandler: Channel is %s", channel);
	var data = JSON.parse(message);
	var socketchannel = channel.split('_')[1];
	var sockets = require("./socket");
	var mySocket;
	if (socketchannel === "notify")
		mySocket = sockets.socketMapNotify[data.username];
	else if (socketchannel === "scheduling")
		mySocket = sockets.allSchedulingSocketsMap[data.username];
	else
		mySocket = sockets.allSocketsMap[data.username];
	switch (data.emitAction) {
	case "webCrawlerGo":
		mySocket.emit("webCrawlerGo", data.input_url, data.level, data.agent);
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
		if(data.param == "ios")
		{
			mySocket.emit("LAUNCH_MOBILE", data.deviceName, data.versionNumber, data.bundleId, data.ipAddress, data.param);
		}
		else{
			mySocket.emit("LAUNCH_MOBILE", data.apkPath, data.serial, data.mobileDeviceName, data.mobileIosVersion, data.mobileUDID);
		}
		break;

	case "LAUNCH_MOBILE_WEB":
		mySocket.emit("LAUNCH_MOBILE_WEB", data.mobileSerial, data.androidVersion);
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

	case "getSocketInfo":
		var data_packet = {"username": data.username, "value": "fail"};
		if (mySocket) data_packet.value = mySocket.handshake.address;
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

function redisErrorHandler(err) {
	/* Error Handler function */
}

default_sub.on("error",redisErrorHandler);
default_pub.on("error",redisErrorHandler);
server_sub.on("error",redisErrorHandler);
server_pub.on("error",redisErrorHandler);

module.exports.redisSubClient = default_sub;
module.exports.redisPubICE = default_pub;
module.exports.redisSubServer = server_sub;
//module.exports.redisPubServer = server_pub;

module.exports.initListeners = function(mySocket){
	var username = mySocket.handshake.query.username;
	logger.debug("Initializing ICE Engine connection for %s",username);

	mySocket.on("unavailableLocalServer", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "unavailableLocalServer", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_web_crawler", function (value) {
		var dataToNode = JSON.stringify({"username" : username,"onAction" : "result_web_crawler","value":JSON.parse(value)});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_web_crawler_finished", function (value) {
		var dataToNode = JSON.stringify({"type" : "res","username" : username,"onAction" : "result_web_crawler_finished","value":JSON.parse(value)});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("scrape", function (value) {
		var dataToNode = JSON.stringify({"username" : username,"onAction" : "scrape","value":value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_debugTestCase", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "result_debugTestCase", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_debugTestCaseWS", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "result_debugTestCaseWS", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_wsdl_listOfOperation", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "result_wsdl_listOfOperation", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_wsdl_ServiceGenerator", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "result_wsdl_ServiceGenerator", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("render_screenshot", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "render_screenshot", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("auto_populate", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "auto_populate", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("issue_id", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "issue_id", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_executeTestSuite", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "result_executeTestSuite", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("return_status_executeTestSuite", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "return_status_executeTestSuite", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("qcresponse", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "qcresponse", "value": value});
		server_pub.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on('open_file_in_editor_result', function (value) {
		var dataToNode = JSON.stringify({"type" : "res","username" : username,"onAction" : "open_file_in_editor_result","value":JSON.parse(value)});
		server_pub.publish('ICE2_' + username, dataToNode);
	});
	
	mySocket.on('flowgraph_result', function (value) {
		var dataToNode = JSON.stringify({"username" : username,"onAction" : "flowgraph_result","value":JSON.parse(value)});
		server_pub.publish('ICE2_' + username, dataToNode);
	});

	mySocket.on('result_flow_graph_finished', function (value) {
		var dataToNode = JSON.stringify({"type" : "res","username" : username,"onAction" : "result_flow_graph_finished","value":JSON.parse(value)});
		server_pub.publish('ICE2_' + username, dataToNode);
	});

	mySocket.on('iris_operations_result', function (value) {
		var dataToNode = JSON.stringify({"type" : "res","username" : username,"onAction" : "iris_operations_result","value":JSON.parse(value)});
		server_pub.publish('ICE2_' + username, dataToNode);
	});
};