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