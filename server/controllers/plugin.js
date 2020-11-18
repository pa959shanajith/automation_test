var create_ice = require('../controllers/create_ice');
var logger = require('../../logger');
var utils = require('../lib/utils');
var epurl = process.env.DAS_URL;
var Client = require("node-rest-client").Client;
var client = new Client();
// var fingerprint = require('browser-fingerprint')()
// logger.info("fingerprint: " + fingerprint);

//getProjectIds
exports.getProjectIDs = function (req, res) {
	logger.info("Inside UI service: getProjectIDs");
	if (utils.isSessionActive(req)) {
		logger.info("Calling UI Service getProjectIDs from create_ice");
		var obj = req.body;
		obj.userid = req.session.userid;
		create_ice.getProjectIDs(obj, function (err, data) {
			if (err) {
				logger.info("Error in getProjectIDs from create_ice");
				logger.error(err);
				res.send('fail');
			} else {
				logger.info("Project details fetched successfully");
				res.send(data);
			}
		});
	} else {
		logger.info("Invalid Session");
		res.send("Invalid Session");
	}
};

// exports.storeUserDetails = function (req, res)  {
// 	const fnName = "storeUserDetails";
// 	try {
// 		logger.info("Inside UI service: storeUserDetails");
// 		var userDetails = req.body.userDetails;
// 		var flag = true;
// 		if (userDetails.length > 0) {
// 			flag = true;
// 		} else {
// 			flag = false;
// 		}
// 		async.forEachSeries(userDetails, function (itr, callback) {
// 			var username = itr.username;
// 			var fullname = itr.fullname;
// 			var email = itr.emailaddress;
// 			var acceptance = itr.acceptance;
// 			var inputs = {
// 				"testscenarioid": username,
// 				"qcdetailsid": fullname,
// 				"qcdomain": email,
// 				"qcfolderpath": acceptance,
// 				"query": "checkTandC"
// 			};
// 			var args = {
// 				data: inputs,
// 				headers: {
// 					"Content-Type": "application/json"
// 				}
// 			};
// 			logger.info("Calling DAS Service: /login/checkTandC");
// 			client.post(epurl + "/login/checkTandC", args,
// 				function (qcdetailsows, response) {
// 				if (response.statusCode != 200 || qcdetailsows.rows == "fail") {
// 					logger.error("Error occurred in checkTandC Error Code : ERRDAS");
// 					flag = false;
// 				}
// 				callback();
// 			});
// 		}, function () {
// 			if (flag) {
// 				try {
// 					if (utils.isSessionActive(req)) {
// 						res.send("success");
// 					} else {
// 						logger.info("Invalid Session");
// 						res.send("Invalid Session");
// 					}
// 				} catch (exception) {
// 					logger.error(exception.message);
// 					utils.getChannelNum('ICE1_scheduling_' + name, function(found){
// 						var flag="";
// 						if (found) flag = "scheduleModeOn";
// 						else flag = "unavailableLocalServer";
// 						res.send(flag);
// 					});
// 				}
// 			} else {
// 				res.send("fail");
// 			}
// 		});
// 	}catch (exception) {
// 		logger.error(exception.message);
// 		return res.send("fail");
// 	}
// };

// import getBrowserFingerprint from 'get-browser-fingerprint';


exports.storeUserDetails = function (req, res) {
	const fnName = "storeUserDetails";
	// const fingerprint = gbfp.getBrowserFingerprint();
	// console.log(fingerprint);
	try {
		logger.info("Inside UI Service: " + fnName);
		var userDetails = req.body.userDetails;
		var flag = true;
		if (userDetails.length > 0) {
			flag = true;
		} else {
			flag = false;
		}
		var username = userDetails[0].username;
		var fullname = userDetails[0].fullname;
		var email = userDetails[0].emailaddress;
		var acceptance = userDetails[0].acceptance;
		var timestamp = userDetails[0].timestamp;
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var inputs = {
			"username": username,
			"fullname": fullname,
			"email": email,
			"acceptance": acceptance,
			"timestamp" : timestamp,
			"ip" : ip,
			"query": "checkTandC"
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling DAS Service: /login/checkTandC");
		client.post(epurl + "/login/checkTandC", args,
			function (userInsert, response) {
			if (userInsert.rows == "success" && flag==true){
				res.send("success");
			}
			if (response.statusCode != 200 || userInsert.rows == "fail") {
				logger.error("Error occurred in checkTandC Error Code : ERRDAS");
				flag = false;
			}
			// return res.send("success");
		});
		// return rpns
	} catch (exception) {
		logger.error(exception.message);
		return res.send("fail");
	}
	// return rpns
};