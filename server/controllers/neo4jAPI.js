var config = require('../../server/config/config');
var Client = require("node-rest-client").Client;
var client = new Client();
var neoURL = "http://" + config.host + "/db/data/transaction/commit";
var requestHeaders = {
	'Authorization': 'Basic ' + new Buffer(config.username + ':' + config.password).toString('base64'),
	'Accept': 'application/json,text/plain',
	'Content-Type': 'application/json',
};

exports.executeQueriesOverRestAPI = function (req, res) {
	var args = {
		"data": req.body.data,
		"headers": requestHeaders
	};
	client.post(neoURL, args, function (result, resp) {
		if (resp.statusCode != 200) res.status(400).send("fail");
		else if (result.errors.length !== 0) res.status(400).send(result.errors);
		else {
			res.setHeader('Content-Type', 'application/json');
			res.status(200).send(JSON.stringify(result.results));
		}
	});
};

exports.executeQueries = function (d, cb) {
	var args = {
		"data": {"statements": d},
		"headers": requestHeaders
	};
	client.post(neoURL, args, function (result, resp) {
		if (resp.statusCode != 200) cb(500, "fail");
		else if (result.errors.length !== 0) cb(400, result.errors);
		else cb(200, JSON.stringify(result.results));
	});
};
