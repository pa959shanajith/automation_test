const myserver = require('../lib/socket');
const validator = require('validator');
const logger = require('../../logger');
const redisServer = require('../lib/redisSocketHandler');
const utils = require('../lib/utils');

exports.getCrawlResults = function (req, res) {
	const fnName = "getCrawlResults";
	logger.info("Inside UI service: " + fnName);
	try {
		var username=req.session.username;
		var icename = undefined
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + icename ,1);
		var url = req.body.url;
		var level = req.body.level;
		var agent = req.body.agent;
		var proxy = req.body.proxy;
		var searchData = req.body.searchData;
		var validate_agent = validator.isAlpha(agent);
		var validate_level = !(validator.isEmpty(level.toString()));
		//var validate_url = validator.isURL(req.body.url);
		var validate_proxy = (!proxy.enable)? true : validator.isURL(proxy.url) && ((proxy.username.length==0 && proxy.password.length==0) || (proxy.username.length>0 && proxy.password.length>0));
		var validate_url = url.toLowerCase().startsWith("http://")? (url.length>7): (url.toLowerCase().startsWith("https://") && url.length>8);
		if (!(validate_url && validate_level && validate_agent && validate_proxy)) {
			logger.error("Error occurred in the service getCrawlResults: Invalid URL or Agent or Proxy");
			return res.send("invalidParams");
		}
		logger.info("ICE Socket requesting Address: %s", icename);
		redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + icename,function(err,redisres) {
			if (redisres[1]>0) {
				logger.info("Sending socket request for webCrawlerGo to cachedb");
				var dataToIce = {"emitAction": "webCrawlerGo", "username": icename, "input_url": url, "level": level, "agent":agent, "proxy": proxy,"searchData":searchData};
				redisServer.redisPubICE.publish('ICE1_normal_' + icename,JSON.stringify(dataToIce));
				var notifySocMap = myserver.socketMapNotify;
				var mySocketUIMap = myserver.allSocketsMapUI;
				var resSent = false;
				if(notifySocMap && notifySocMap[username]) {
					resSent = true;
					res.end('begin');
				}
				function webCrawlerGo_listener(channel,message) {
					var data = JSON.parse(message);
					if (icename == data.username && ["unavailableLocalServer", "result_web_crawler", "result_web_crawler_finished"].includes(data.onAction)) {
						var value = data.value;
						if (data.onAction == "unavailableLocalServer") {
							redisServer.redisSubServer.removeListener('message',webCrawlerGo_listener);
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
							redisServer.redisSubServer.removeListener('message',webCrawlerGo_listener);
							try {
								var resultData = null;
								if (value.progress == "fail") {
									resultData = {success: false, data: "Error While Crawling"}
								} else {
									resultData = {success: true};
									mySocketUIMap[username].emit("endData", value);
									logger.info("Crawl completed successfully!");
								}
								if (notifySocMap[username]) notifySocMap[username].emit("result_WebcrawlerFinished", resultData);
								else if (!resSent) res.json(resultData);
							} catch (exception) {
								var resultData = {success: false, data: exception};
								logger.error("Error occurred in getCrawlResults: "+exception.message);
								if (notifySocMap[name]) notifySocMap[name].emit("result_WebcrawlerFinished", resultData);
								else if (!resSent) res.status(500).json(resultData);
							}
						}
					}
				}
				redisServer.redisSubServer.on("message",webCrawlerGo_listener);
			} else {
				utils.getChannelNum('ICE1_scheduling_' + name, function(found){
					var flag="";
					if (found) flag = "scheduleModeOn";
					else {
						flag = "unavailableLocalServer";
						logger.info("ICE socket not available for Address : %s", name);
					}
					res.send(flag);
				});
			}
		});
	} catch (exception) {
		logger.error("Error occurred in webocular/"+fnName+":", exception);
		res.send("fail");
	}
};
exports.saveResults = async (req, res) => {
	const fnName = "saveResults";
	logger.info("Inside UI service: " + fnName);
	try {
		const inputs={ 
			"query": "insertdata",
			"data": {
				"url": req.body.url,
				"level": req.body.level,
				"agent": req.body.agent,
				"proxy": req.body.proxy,
				"data": req.body.crawdata,
				"modulename": req.body.modulename,
				"searchData":req.body.searchData
			}
		};
		const result = await utils.fetchData(inputs, "reports/getWebocularData_ICE", fnName);
		if (result == "fail") return res.send("fail");
		res.send("success");
	} catch (exception) {
		logger.error("Error occurred in webocular/"+fnName+":", exception);
		res.send("fail");
	}
}

exports.getWebocularModule_ICE = async (req, res) => {
	const fnName = "getWebocularModule_ICE";
	logger.info("Inside UI service: " + fnName);
    try {
        const inputs = { "query": "moduledata" };
		const result = await utils.fetchData(inputs, "reports/getWebocularData_ICE", fnName);
		if (result == "fail") return res.send("fail");
		res.send(result);
	} catch (exception) {
		logger.error("Error occurred in webocular/"+fnName+":", exception);
        res.status(500).send("fail");
    }
};