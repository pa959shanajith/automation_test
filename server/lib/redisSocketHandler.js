var redis = require("redis");
var globalConfig = require('../config/options').storageConfig;
var logger = require('../../logger');
var redisConfig = globalConfig.redis.split(':');
redisConfig = {	"host": redisConfig[0],	"port": parseInt(redisConfig[1]) };
var sub1 = redis.createClient(redisConfig);
var pub1 = redis.createClient(redisConfig);
var sub2 = {};
var pub2 = redis.createClient(redisConfig);

sub1.on("message", function (channel, message) {
	logger.debug("channel is %s", channel);
	var data = JSON.parse(message);
	var socketchannel = channel.split('_')[1];
	var sockets = require('./socket.js');
	var mySocket, dataToNode;
	if (socketchannel === "scheduling")
		mySocket = sockets.allSchedulingSocketsMap[data.username];
	else
		mySocket = sockets.allSocketsMap[data.username];
	if (!mySocket) {
		logger.info("This server dosen't have the requested %s ICE socket", data.username);
		/*dataToNode = JSON.stringify({"username": data.username, "onAction": "fail", "value": "unavailableLocalServer"});
		pub2.publish('ICE2_' + data.username ,dataToNode);*/
	} else {
		switch (data.emitAction) {
			case 'webCrawlerGo':
				mySocket._events.result_web_crawler = [];
				mySocket._events.result_web_crawler_finished = [];
				mySocket.emit("webCrawlerGo", data.input_url, data.level, data.agent);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('result_web_crawler', function (value) {
					dataToNode = JSON.stringify({"username" : data.username,"onAction" : "result_web_crawler","value":JSON.parse(value)});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('result_web_crawler_finished', function (value) {
					dataToNode = JSON.stringify({"type" : "res","username" : data.username,"onAction" : "result_web_crawler_finished","value":JSON.parse(value)});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;
			case 'LAUNCH_DESKTOP':
				mySocket._events.scrape = [];
				mySocket.emit("LAUNCH_DESKTOP", data.applicationPath);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('scrape', function (value) {
					dataToNode = JSON.stringify({"username" : data.username,"onAction" : "scrape","value":value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;
			case 'LAUNCH_SAP':
				mySocket._events.scrape = [];
				mySocket.emit("LAUNCH_SAP", data.applicationPath);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('scrape', function (value) {
					dataToNode = JSON.stringify({"username" : data.username,"onAction" : "scrape","value":value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;
			case 'LAUNCH_OEBS':
				mySocket._events.scrape = [];
				mySocket.emit("LAUNCH_OEBS", data.applicationPath);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('scrape', function (value) {
					dataToNode = JSON.stringify({"username" : data.username,"onAction" : "scrape","value":value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;
			case 'LAUNCH_MOBILE':
				mySocket._events.scrape = [];
				mySocket.emit("LAUNCH_MOBILE", data.apkPath, data.serial, data.mobileDeviceName, data.mobileIosVersion, data.mobileUDID);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('scrape', function (value) {
					dataToNode = JSON.stringify({"username" : data.username,"onAction" : "scrape","value":value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;
			case 'LAUNCH_MOBILE_WEB':
				mySocket._events.scrape = [];
				mySocket.emit("LAUNCH_MOBILE_WEB", data.mobileSerial, data.androidVersion);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('scrape', function (value) {
					dataToNode = JSON.stringify({"username" : data.username,"onAction" : "scrape","value":value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;
			case 'webscrape':
				mySocket._events.scrape = [];
				mySocket.emit("webscrape", data.data);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('scrape', function (value) {
					logger.debug("data.username is %s \n\n",data.username);
					dataToNode = JSON.stringify({"username" : data.username,"onAction" : "scrape","value":value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;
			case 'focus':
				mySocket.emit("focus", data.focusParam, data.elementURL, data.appType);
				break;
			case 'debugTestCase':
				mySocket._events.result_debugTestCase = [];
				mySocket._events.result_debugTestCaseWS = [];
				mySocket._events.result_wsdl_listOfOperation = [];
				mySocket._events.result_wsdl_ServiceGenerator = [];
				mySocket.emit("debugTestCase", data.responsedata);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('result_debugTestCase', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "result_debugTestCase", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('result_debugTestCaseWS', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "result_debugTestCaseWS", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;
			case 'wsdl_listOfOperation':
				mySocket._events.result_wsdl_listOfOperation = [];
				mySocket.emit('wsdl_listOfOperation', data.wsdlurl);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('result_wsdl_listOfOperation', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "result_wsdl_listOfOperation", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;
			case 'wsdlServiceGenerator_ICE':
				mySocket._events.result_wsdl_ServiceGenerator = [];
				mySocket.emit('wsdlServiceGenerator_ICE', data.serviceGenRequest);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('result_wsdl_ServiceGenerator', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "result_wsdl_ServiceGenerator", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;
			case 'render_screenshot':
				mySocket._events.render_screenshot = [];
				mySocket.emit('render_screenshot', data.path);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('render_screenshot', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "render_screenshot", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;

			case 'jiralogin':
				mySocket._events.jiralogin = [];
				mySocket._events.issue_id = [];
				mySocket.emit('jiralogin', data.action, data.inputs);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('auto_populate', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "auto_populate", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('issue_id', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "issue_id", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;

			case 'executeTestSuite':
				mySocket._events.result_executeTestSuite = [];
				mySocket._events.return_status_executeTestSuite = [];
				mySocket.emit('executeTestSuite', data.executionRequest);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('result_executeTestSuite', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "result_executeTestSuite", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('return_status_executeTestSuite', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "return_status_executeTestSuite", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;

			case 'qclogin':
				mySocket._events.qcresponse = [];
				mySocket.emit('qclogin', data.responsedata);

				mySocket.on('unavailableLocalServer', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "unavailableLocalServer", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});

				mySocket.on('qcresponse', function (value) {
					dataToNode = JSON.stringify({"username": data.username, "onAction": "qcresponse", "value": value});
					pub2.publish('ICE2_' + data.username, dataToNode);
				});
				break;

			default:
				dataToNode = JSON.stringify({"username": data.username, "onAction": "fail", "value": "fail"});
				pub2.publish('ICE2_' + data.username, dataToNode);
				break;
		}
	}
});

module.exports.redisSub1 = sub1;
module.exports.redisPub1 = pub1;
module.exports.redisSub2 = sub2;
module.exports.redisPub2 = pub2;
module.exports.redisConfig = redisConfig;
