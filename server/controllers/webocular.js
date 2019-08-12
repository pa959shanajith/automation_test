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
			logger.info("ICE Socket requesting Address: %s", name);
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres) {
				if (redisres[1]>0) {
					logger.info("Sending socket request for webCrawlerGo to redis");
					var dataToIce = {"emitAction": "webCrawlerGo", "username": name, "input_url": url, "level": level, "agent":agent, "proxy": proxy,"searchData":searchData};
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
									var resultData = null;
									if (value.progress == "fail") {
										resultData = {success: false, data: "Error While Crawling"}										
									} else {
										resultData = {success: true};
										mySocketUIMap[name].emit("endData", value);
										logger.info("Crawl completed successfully!");
									}
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