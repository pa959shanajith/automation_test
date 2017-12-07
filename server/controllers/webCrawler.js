var myserver = require('../lib/socket');
var validator = require('validator');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');

exports.getCrawlResults = function (req, res) {
	try {
		logger.info("Inside UI service: getCrawlResults");
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var name = req.session.username;
			redisServer.redisSub2.subscribe('ICE2_' + name ,1);	
			var input_url = req.body.url;
			var level = req.body.level;
			var agent = req.body.agent;
			validateWeboccular();
			function validateWeboccular() {
				logger.info("Inside function: validateWeboccular");
				check_url = validator.isURL(req.body.url);
				if (check_url == true) {
					validate_url = true;
				}
				check_level = validator.isEmpty(req.body.level.toString());
				if (check_level == false) {
					validate_level = true;
				}
				check_agent = validator.isAlpha(req.body.agent);
				if (check_agent == true) {
					validate_agent = true;
				}
			}
			if (validate_url == true && validate_level == true && check_agent == true) {
				logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
				logger.info("ICE Socket requesting Address: %s", name);
				redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
					if (redisres[1]==1) {
						logger.info("Sending socket request for webCrawlerGo to redis");
						dataToIce = {"emitAction" : "webCrawlerGo","username" : name, "input_url":input_url, "level" : level, "agent" :agent};
						redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
						function webCrawlerGo_listener(channel,message) {
							data = JSON.parse(message);
							if(name == data.username){
								var value = data.value;
								if (data.onAction == "unavailableLocalServer") {
									redisServer.redisSub2.removeListener('message',webCrawlerGo_listener);	
									logger.error("Error occured in getCrawlResults: Socket Disconnected");
									if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
										var soc = myserver.socketMapNotify[name];
										soc.emit("ICEnotAvailable");
									}
								} else if (data.onAction == "result_web_crawler") {
									try {
										var mySocketUI = myserver.allSocketsMapUI[name];
										mySocketUI.emit("newdata", value);
									} catch (exception) {
										logger.error(exception);
									}
								} else if (data.onAction == "result_web_crawler_finished") {
									redisServer.redisSub2.removeListener('message',webCrawlerGo_listener);	
									try {
										var mySocketUI = myserver.allSocketsMapUI[name];
										mySocketUI.emit("endData", value);
										res.status(200).json({success: true});
									} catch (exception) {
										logger.error(exception);
										res.status(500).json({success: false, data: exception});
									}
								}
							}
						};
						redisServer.redisSub2.on("message",webCrawlerGo_listener);
					} else {
						logger.info("ICE socket not available for Address : %s", name);
						res.send("unavailableLocalServer");
					}
				});
			} 
			else {
				res.send('unavailableLocalServer');
			}
		} else {
			logger.info("Error occured in the service getCrawlResults: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception);
	}
};
