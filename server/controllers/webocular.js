var myserver = require('../lib/socket');
var validator = require('validator');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');

exports.getCrawlResults = function (req, res) {
	try {
		logger.info("Inside UI service: getCrawlResults");
		if (utils.isSessionActive(req)) {
			var name = req.session.username;
			redisServer.redisSubServer.subscribe('ICE2_' + name ,1);
			var input_url = req.body.url;
			var level = req.body.level;
			var agent = req.body.agent;
			var validate_url = validator.isURL(req.body.url);
			var validate_level = !(validator.isEmpty(req.body.level.toString()));
			var validate_agent = validator.isAlpha(req.body.agent);
			if (!(validate_url && validate_level && validate_agent)) {
				logger.error("Error occurred in the service getCrawlResults: Invalid URL or Agent");
				return res.send("invalidParams");
			}
			logger.info("ICE Socket requesting Address: %s", name);
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres) {
				if (redisres[1]>0) {
					logger.info("Sending socket request for webCrawlerGo to redis");
					var dataToIce = {"emitAction" : "webCrawlerGo","username" : name, "input_url":input_url, "level" : level, "agent" :agent};
					redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					var notifySocMap = myserver.socketMapNotify;
					var mySocketUIMap = myserver.allSocketsMapUI;
					var resSent = false;
					if(notifySocMap && notifySocMap[name]) {
						resSent = true;
						res.end('begin');
					}
					function webCrawlerGo_listener(channel,message) {
						var data = JSON.parse(message);
						if (name == data.username) {
							var value = data.value;
							if (data.onAction == "unavailableLocalServer") {
								redisServer.redisSubServer.removeListener('message',webCrawlerGo_listener);	
								logger.error("Error occurred in getCrawlResults: Socket Disconnected");
								if (notifySocMap[name]) notifySocMap[name].emit("ICEnotAvailable");
								else if (!resSent) res.send("unavailableLocalServer");
							} else if (data.onAction == "result_web_crawler") {
								try {
									mySocketUIMap[name].emit("newdata", value);
								} catch (exception) {
									logger.error(exception.message);
								}
							} else if (data.onAction == "result_web_crawler_finished") {
								redisServer.redisSubServer.removeListener('message',webCrawlerGo_listener);	
								try {
									mySocketUIMap[name].emit("endData", value);
									logger.info("Crawl completed successfully!");
									var resultData = {success: true};
									if (notifySocMap[name]) notifySocMap[name].emit("result_WebcrawlerFinished", resultData);
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
		} else {
			logger.info("Error occurred in the service getCrawlResults: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
	}
};