
var async = require('async');
var myserver = require('../lib/socket');
var epurl = process.env.DAS_URL;
var Client = require("node-rest-client").Client;
var client = new Client();
var validator = require('validator');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');
var xlsx = require('xlsx');
var xl = require('excel4node');

let headers
module.exports.setReq = async (req) =>
{
	headers=req;
}


exports.saveSauceLabData = function (req, res) {
	try {
		logger.info("Inside UI service: saveSauceLabData");
		var username = req.session.username;
		var name = undefined;
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) name = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		logger.debug("ICE Socket requesting Address: %s" , name);
		const reqData = req.body;
		var check_SauceLabURL =(req.body.SauceLabPayload.SaucelabsURL);
		var check_SauceLabusername =(req.body.SauceLabPayload.SaucelabsUsername);
		var check_SauceLabAccessKey =(req.body.SauceLabPayload.Saucelabskey); 	
		if(!check_SauceLabURL) {
			logger.info("Error occurred in saveSauceLabData: Invalid SauceLab URL");
			return res.send("invalidurl");
		}
		if(check_SauceLabURL) {
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]>0) {
					var SauceLabDetails = {
						"SauceLabURL": check_SauceLabURL,
						"SauceLabusername" : check_SauceLabusername,
						"SauceLabAccessKey": check_SauceLabAccessKey
					};
					logger.info("Sending socket request for SauceLablogin to redis");
					dataToIce = {"emitAction" : "SauceLablogin","username" : name, "responsedata":SauceLabDetails};
					redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					function SauceLablogin_listener(channel,message) {
						var data = JSON.parse(message);
						if(name == data.username && ["unavailableLocalServer", "qcresponse"].includes(data.onAction)){
							redisServer.redisSubServer.removeListener('message',SauceLablogin_listener);
							if (data.onAction == "unavailableLocalServer") {
								logger.error("Error occurred in loginSauceLabServer_ICE: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}
							} else if (data.onAction == "qcresponse") {
								data = data.value;
								res.send(data);
							}
						}
					}
					redisServer.redisSubServer.on("message",SauceLablogin_listener);
				} else {
					utils.getChannelNum('ICE1_scheduling_' + name, function(found){
						var flag="";
						if (found) flag = "scheduleModeOn";
						else {
							flag = "unavailableLocalServer";
							logger.info("ICE Socket not Available");
						}
						res.send(flag);
					});
				}
			});
		} else {
			logger.info("Error occurred in loginSauceLabServer_ICE: Invalid SauceLab Credentials");
			res.send("invalidcredentials");
		}
	} catch (exception) {
		logger.error("Error occurred in loginSauceLabServer_ICE:", exception.message);
		res.send("fail");
	}
};