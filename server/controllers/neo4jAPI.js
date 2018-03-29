var config = require('../../server/config/config');
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
	var args = {
		"data": {"statements": d},
		"headers": requestHeaders
	};
	client.post(neoURL, args, function (result, resp) {
		if (resp.statusCode != 200) cb(500, "fail");
		else if (result.errors.length !== 0) cb(400, result.errors);
		else cb(200, result.results);
	});
};
