var redis = require("redis");
var logger = require("../../logger");
var redisConfig = {"host": process.env.REDIS_IP, "port": parseInt(process.env.REDIS_PORT),"password" : process.env.REDIS_AUTH};
var sub1 = redis.createClient(redisConfig);
var pub1 = redis.createClient(redisConfig);
var sub2 = redis.createClient(redisConfig);
var pub2 = redis.createClient(redisConfig);

sub1.on("message", function (channel, message) {
	logger.debug("In redisSocketHandler: Channel is %s", channel);
	var data = JSON.parse(message);
	var socketchannel = channel.split('_')[1];
	var sockets = require("./socket");
	var mySocket;
	if (socketchannel === "scheduling")
		mySocket = sockets.allSchedulingSocketsMap[data.username];
	else
		mySocket = sockets.allSocketsMap[data.username];
	switch (data.emitAction) {
	case "webCrawlerGo":
		mySocket.emit("webCrawlerGo", data.input_url, data.level, data.agent);
		break;

	case "LAUNCH_DESKTOP":
		mySocket.emit("LAUNCH_DESKTOP", data.applicationPath);
		break;

	case "LAUNCH_SAP":
		mySocket.emit("LAUNCH_SAP", data.applicationPath);
		break;

	case "LAUNCH_OEBS":
		mySocket.emit("LAUNCH_OEBS", data.applicationPath);
		break;

	case "LAUNCH_MOBILE":
		mySocket.emit("LAUNCH_MOBILE", data.apkPath, data.serial, data.mobileDeviceName, data.mobileIosVersion, data.mobileUDID);
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

	default:
		var dataToNode = JSON.stringify({"username": data.username, "onAction": "fail", "value": "fail"});
		pub2.publish("ICE2_" + data.username, dataToNode);
		break;
	}
});

function redisErrorHandler(err) {
	/* Error Handler function */
}

sub1.on("error",redisErrorHandler);
pub1.on("error",redisErrorHandler);
sub2.on("error",redisErrorHandler);
pub2.on("error",redisErrorHandler);

module.exports.redisSub1 = sub1;
module.exports.redisPub1 = pub1;
module.exports.redisSub2 = sub2;
module.exports.redisPub2 = pub2;

module.exports.initListeners = function(mySocket){
	var username = mySocket.handshake.query.username;
	logger.debug("Initializing ICE Engine connection for %s",username);

	mySocket.on("unavailableLocalServer", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "unavailableLocalServer", "value": value});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_web_crawler", function (value) {
		var dataToNode = JSON.stringify({"username" : username,"onAction" : "result_web_crawler","value":JSON.parse(value)});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_web_crawler_finished", function (value) {
		var dataToNode = JSON.stringify({"type" : "res","username" : username,"onAction" : "result_web_crawler_finished","value":JSON.parse(value)});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("scrape", function (value) {
		var dataToNode = JSON.stringify({"username" : username,"onAction" : "scrape","value":value});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_debugTestCase", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "result_debugTestCase", "value": value});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_debugTestCaseWS", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "result_debugTestCaseWS", "value": value});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_wsdl_listOfOperation", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "result_wsdl_listOfOperation", "value": value});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_wsdl_ServiceGenerator", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "result_wsdl_ServiceGenerator", "value": value});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("render_screenshot", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "render_screenshot", "value": value});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("auto_populate", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "auto_populate", "value": value});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("issue_id", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "issue_id", "value": value});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("result_executeTestSuite", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "result_executeTestSuite", "value": value});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("return_status_executeTestSuite", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "return_status_executeTestSuite", "value": value});
		pub2.publish("ICE2_" + username, dataToNode);
	});

	mySocket.on("qcresponse", function (value) {
		var dataToNode = JSON.stringify({"username": username, "onAction": "qcresponse", "value": value});
		pub2.publish("ICE2_" + username, dataToNode);
	});

};