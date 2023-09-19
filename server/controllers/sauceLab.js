
var async = require('async');
var myserver = require('../lib/socket');
var epurl = process.env.DAS_URL;
var Client = require("node-rest-client").Client;
var client = new Client();
var validator = require('validator');
var logger = require('../../logger');
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
		var icename = undefined;
		let mySocket;
		let clientName=utils.getClientName(req.headers.host);
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][icename];
		logger.debug("ICE Socket requesting Address: %s" , icename);
		const reqData = req.body;
		var check_SauceLabURL =(req.body.SauceLabPayload.SaucelabsURL);
		var check_SauceLabusername =(req.body.SauceLabPayload.SaucelabsUsername);
		var check_SauceLabAccessKey =(req.body.SauceLabPayload.Saucelabskey);
		if(!check_SauceLabURL) {
			logger.info("Error occurred in saveSauceLabData: Invalid SauceLab URL");
			return res.send("invalidurl");
		}
		if(check_SauceLabURL) {
			if(mySocket != undefined) {
					var SauceLabDetails = {
						"action":req.body.SauceLabPayload.query,
						"SauceLabURL": check_SauceLabURL,
						"SauceLabusername" : check_SauceLabusername,
						"SauceLabAccessKey": check_SauceLabAccessKey
					};
					logger.info("Sending socket request for SauceLablogin to redis");
					dataToIce = {"emitAction" : "SauceLablogin","username" : icename, "responsedata":SauceLabDetails};
					mySocket.emit(dataToIce["emitAction"], dataToIce.data);
					function SauceLablogin_listener(message) {
						var data = message;
							mySocket.removeListener('sauceconfresponse',SauceLablogin_listener);
							data = data.value;
							res.send(data);	
					}
					mySocket.on("sauceconfresponse",SauceLablogin_listener);
				} else {
					logger.error("Error occurred in the service saveSauceLabData: Socket not Available");
					flag = "unavailableLocalServer";
					logger.info("ICE Socket not Available");
					res.send(flag);
				}
			
		} else {
			logger.info("Error occurred in loginSauceLabServer_ICE: Invalid SauceLab Credentials");
			res.send("invalidcredentials");
		}
	} catch (exception) {
		logger.error("Error occurred in loginSauceLabServer_ICE:", exception.message);
		res.send("fail");
	}
};