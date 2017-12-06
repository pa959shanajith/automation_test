var myserver = require('../lib/socket.js');
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
			redisServer.redisSub2[name].removeAllListeners('message');
			redisServer.redisSub2[name].subscribe('ICE2_' + req.session.username ,1);	
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
				//var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
				//logger.info("IP:",ip);
				logger.info("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
				logger.info("ICE Socket requesting Address: %s", name);
				redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + req.session.username,function(err,redisres){
					if (redisres[1]==1) {
						/* Commented for LB
						if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
						var mySocket = myserver.allSocketsMap[name];
						mySocket.emit("webCrawlerGo", input_url, level, agent);
						mySocket.on("unavailableLocalServer", function () {
							logger.error("Error occured in getCrawlResults: Socket Disconnected");
							if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
								var soc = myserver.socketMapNotify[name];
								soc.emit("ICEnotAvailable");
							}
						});
						mySocket.on('result_web_crawler', function (value) {
							try {
								var mySocketUI = myserver.allSocketsMapUI[name];
								mySocketUI.emit("newdata", JSON.parse(value));
							} catch (exception) {
								logger.error(exception);
							}
						});
						mySocket.on('result_web_crawler_finished', function (value) {
							try {
								var mySocketUI = myserver.allSocketsMapUI[name];
								mySocketUI.emit("endData", value);
								mySocket._events.result_web_crawler = [];
								mySocket._events.result_web_crawler_finished = [];
								res.status(200).json({success: true});
							} catch (exception) {
								logger.error(exception);
								res.status(500).json({success: false, data: exception});
							}
						});
						*/
						logger.info("Sending socket request for webCrawlerGo to redis");
						dataToIce = {"emitAction" : "webCrawlerGo","username" : req.session.username, "input_url":input_url, "level" : level, "agent" :agent};
						redisServer.redisPub1.publish('ICE1_normal_' + req.session.username,JSON.stringify(dataToIce));
						redisServer.redisSub2[name].on("message",function (channel,message) {
							data = JSON.parse(message);
							if(req.session.username == data.username){
								var value = data.value;
								if (data.onAction == "unavailableLocalServer") {
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
						});
					} else {
						logger.info("ICE socket not available for Address : %s", name);
						res.send("unavailableLocalServer");
					}
				});
			} else {
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
