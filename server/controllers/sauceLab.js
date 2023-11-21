
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
		var check_SauceLabUploadApk =(req.body.SauceLabPayload.uploadApkValues);
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
						"SauceLabAccessKey": check_SauceLabAccessKey,
						"SauceLabUploadApk": check_SauceLabUploadApk
					};
					logger.info("Sending socket request for SauceLablogin to redis");
					dataToIce = {"emitAction" : "saucelablogin","username" : icename, "responsedata":SauceLabDetails};
					mySocket.emit(dataToIce["emitAction"], dataToIce.responsedata);
					function SauceLablogin_listener(message) {
						var data = message;
							mySocket.removeListener('sauceconfresponse',SauceLablogin_listener);
							if (dataToIce.responsedata.action == "sauceMobileUploadDetails" && "name" in data && "activity" in data) {
								const fName = "saveAppActivityData"
								const input = {
									"name": data.name,
									"activity": data.activity
								}
								const result = utils.fetchData (input, "qualityCenter/saveAppActivityData", fName)							
								// data = data;
								res.send(data);
							}
							else  {
								// data = data.value;
								res.send(data);
							} 										
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