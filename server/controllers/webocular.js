var myserver = require('../lib/socket');
var validator = require('validator');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');
var async = require('async');
var Client = require("node-rest-client").Client;
var client = new Client();

var epurl = process.env.DAS_URL;
exports.getCrawlResults = async function (req, res) {
	try {
		logger.info("Inside UI service: getCrawlResults");
		if (utils.isSessionActive(req)) {
			var username = req.session.username;
			var icename = undefined
			if (myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0) icename = myserver.allSocketsICEUser[username][0];
			redisServer.redisSubServer.subscribe('ICE2_' + icename, 1);
			var url = req.body.url;
			var level = req.body.level;
			var agent = req.body.agent;
			var proxy = req.body.proxy;
			var searchData = req.body.searchData;
			var validate_agent = validator.isAlpha(agent);
			var validate_level = !(validator.isEmpty(level.toString()));
			//var validate_url = validator.isURL(req.body.url);
			var validate_proxy = (!proxy.enable) ? true : validator.isURL(proxy.url) && ((proxy.username.length == 0 && proxy.password.length == 0) || (proxy.username.length > 0 && proxy.password.length > 0));
			var validate_url = url.toLowerCase().startsWith("http://") ? (url.length > 7) : (url.toLowerCase().startsWith("https://") && url.length > 8);
			if (!(validate_url && validate_level && validate_agent && validate_proxy)) {
				logger.error("Error occurred in the service getCrawlResults: Invalid URL or Agent or Proxy");
				return res.send("invalidParams");
			}
			logger.info("ICE Socket requesting Address: %s", icename);
			redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function (err, redisres) {
				if (redisres[1] > 0) {
					logger.info("Sending socket request for webCrawlerGo to cachedb");
					var dataToIce = { "emitAction": "webCrawlerGo", "username": icename, "input_url": url, "level": level, "agent": agent, "proxy": proxy, "searchData": searchData };
					redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
					var notifySocMap = myserver.socketMapNotify;
					var mySocketUIMap = myserver.allSocketsMapUI;
					var resSent = false;
					if (notifySocMap && notifySocMap[username]) {
						resSent = true;
						res.end('begin');
					}
					function webCrawlerGo_listener(channel, message) {
						var data = JSON.parse(message);
						if (icename == data.username && ["unavailableLocalServer", "result_web_crawler", "result_web_crawler_finished"].includes(data.onAction)) {
							var value = data.value;
							if (data.onAction == "unavailableLocalServer") {
								redisServer.redisSubServer.removeListener('message', webCrawlerGo_listener);
								logger.error("Error occurred in getCrawlResults: Socket Disconnected");
								if (notifySocMap[username]) notifySocMap[username].emit("ICEnotAvailable");
								else if (!resSent) res.send("unavailableLocalServer");
							} else if (data.onAction == "result_web_crawler") {
								try {
									mySocketUIMap[username].emit("newdata", value);
								} catch (exception) {
									logger.error(exception.message);
								}
							} else if (data.onAction == "result_web_crawler_finished") {
								redisServer.redisSubServer.removeListener('message', webCrawlerGo_listener);
								try {
									var resultData = null;
									if (value.progress == "fail") {
										resultData = { success: false, data: "Error While Crawling" }
									} else {
										resultData = { success: true };
										mySocketUIMap[username].emit("endData", value);
										logger.info("Crawl completed successfully!");
									}
									if (notifySocMap[username]) notifySocMap[username].emit("result_WebcrawlerFinished", resultData);
									else if (!resSent) res.json(resultData);
								} catch (exception) {
									var resultData = { success: false, data: exception };
									logger.error("Error occurred in getCrawlResults: " + exception.message);
									if (notifySocMap[username]) notifySocMap[username].emit("result_WebcrawlerFinished", resultData);
									else if (!resSent) res.status(500).json(resultData);
								}
							}
						}
					}
					redisServer.redisSubServer.on("message", webCrawlerGo_listener);
				} else {
					utils.getChannelNum('ICE1_scheduling_' + username, function (found) {
						var flag = "";
						if (found) flag = "scheduleModeOn";
						else {
							flag = "unavailableLocalServer";
							logger.info("ICE socket not available for Address : %s", username);
						}
						res.send(flag);
					});
				}
			});
		} else {
			logger.info("Error occurred in the service getCrawlResults: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
	}
};
exports.saveResults = async function (req, res) {
	try {
		const fnName = "saveResults"
		var report = {
			"url": req.body.url,
			"level": req.body.level,
			"agent": req.body.agent,
			"proxy": req.body.proxy,
			"data": req.body.crawdata,
			"modulename": req.body.modulename,
			"searchData": req.body.searchData
		}
		var inputs = {
			"query": "insertdata",
			"data": report
		}
		const result = await utils.fetchData(inputs, "reports/getWebocularData_ICE", fnName);
		if (result == "fail") res.status(500).send("fail");
		else res.send("success")
	} catch (exception) {
		logger.error(exception.message);
		res.status(500).send("fail");
	}

}
exports.getWebocularModule_ICE = async function (req, res) {
	try {
		const fnName = "getWebocularModule_ICE"
		var inputs = {
			"query": "moduledata"
		};
		const result = await utils.fetchData(inputs, "reports/getWebocularData_ICE", fnName);
		if (result == "fail") res.status(500).send("fail");
		else res.send(result)
	} catch (exception) {
		logger.error(exception.message);
		res.status(500).send("fail");
	}
};

exports.getWebocularData_ICE = async function(req, res) {
    try {
		const fnName = "getWebocularData_ICE"
		var inputs = {
			"query": "reportdata"
		};
		const result = await utils.fetchData(inputs, "reports/getWebocularData_ICE", fnName);
		if (result == "fail") res.status(500).send("fail");
		else res.send(result)
	} catch(e){
		logger.error(e.message);
		res.status(500).send("fail");
	}
};

exports.saveAccessibilityReports = async function (reports){
	try {
		const fnName = "getWebocularData_ICE"
		var inputs = {
			"query": "insertdata",
			"reports": reports
		}
		const result = await utils.fetchData(inputs, "reports/getWebocularData_ICE", fnName);
	} catch(e){
		logger.error(e.message);
	}
}