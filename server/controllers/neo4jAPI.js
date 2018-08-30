var config = require('../config/options').storageConfig;
var Client = require("node-rest-client").Client;
var logger = require('../../logger');
var client = new Client();
var neoURL = "http://" + config.host + "/db/data/transaction/commit";
var requestHeaders = {
	'Authorization': 'Basic ' + Buffer.from(config.username + ':' + config.password).toString('base64'),
	'Accept': 'application/json,text/plain',
	'Content-Type': 'application/json',
};

exports.executeQueries = function (d, cb) {
	logger.info("Inside UI service: executeQueries");
	var st=Date.now();
	var args = {
		"data": {"statements": d},
		"headers": requestHeaders
	};
	var apireq = client.post(neoURL, args, function (result, resp) {
		if (resp.statusCode != 200) cb(500, "fail");
		else if (result.errors.length !== 0) cb(400, result.errors);
		else {
			logger.debug("Time taken by Mindmap DB: ",(Date.now()-st));
			cb(200, result.results);
		}
	});
	apireq.on('error', function(err) {
		logger.error("Please run the Mindmap DB");
		cb(500, "mm_db_na");
	});
};
