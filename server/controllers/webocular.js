var myserver = require('../lib/socket');
var validator = require('validator');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');

exports.getCrawlResults = function (req, res) {
	try {
		logger.info("Inside UI service: getCrawlResults");
		if (utils.isSessionActive(req.session)) {
			var name = req.session.username;
			redisServer.redisSubServer.subscribe('ICE2_' + name ,1);	
			var input_url = req.body.url;
			var level = req.body.level;
			var agent = req.body.agent;
			validateWebocular();
			function validateWebocular() {
				logger.info("Inside function: validateWebocular");
				var check_url = validator.isURL(req.body.url);
				var validate_url,validate_level,validate_agent;
				if (check_url == true) {
					validate_url = true;
				}
				var check_level = validator.isEmpty(req.body.level.toString());
				if (check_level == false) {
					validate_level = true;
				}
				var check_agent = validator.isAlpha(req.body.agent);
				if (check_agent == true) {
					validate_agent = true;
				}
			}
			if (validate_url == true && validate_level == true && check_agent == true) {
				logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
				logger.info("ICE Socket requesting Address: %s", name);
				redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
					if (redisres[1]>0) {
						logger.info("Sending socket request for webCrawlerGo to redis");
						dataToIce = {"emitAction" : "webCrawlerGo","username" : name, "input_url":input_url, "level" : level, "agent" :agent};
						redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
						var updateSessionExpiry = utils.resetSession(req.session);
						function webCrawlerGo_listener(channel,message) {
							var data = JSON.parse(message);
							if(name == data.username){
								var value = data.value;
								if (data.onAction == "unavailableLocalServer") {
									redisServer.redisSubServer.removeListener('message',webCrawlerGo_listener);	
									logger.error("Error occured in getCrawlResults: Socket Disconnected");
									res.send("unavailableLocalServer");
								} else if (data.onAction == "result_web_crawler") {
									try {
										var mySocketUI = myserver.allSocketsMapUI[name];
										mySocketUI.emit("newdata", value);
									} catch (exception) {
										logger.error(exception.message);
									}
								} else if (data.onAction == "result_web_crawler_finished") {
									redisServer.redisSubServer.removeListener('message',webCrawlerGo_listener);	
									try {
										clearInterval(updateSessionExpiry);
										var mySocketUI = myserver.allSocketsMapUI[name];
										mySocketUI.emit("endData", value);
										res.status(200).json({success: true});
									} catch (exception) {
										logger.error(exception.message);
										res.status(500).json({success: false, data: exception});
									}
								}
							}
						};
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
				utils.getChannelNum('ICE1_scheduling_' + name, function(found){
					var flag="";
					if (found) flag = "scheduleModeOn";
					else flag = "unavailableLocalServer";
					res.send(flag);
				});
			}
		} else {
			logger.info("Error occured in the service getCrawlResults: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
	}
};