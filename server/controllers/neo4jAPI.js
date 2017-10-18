var configJson = require('../../server/config/options');
var Client = require("node-rest-client").Client;
var client = new Client();
var neoConfig = configJson.storageConfig;
var neoURL = "http://" + neoConfig.n4jhost + "/db/data/transaction/commit";
var requestHeaders = {
	'Authorization': 'Basic ' + new Buffer(neoConfig.n4jusername + ':' + neoConfig.n4jpassword).toString('base64'),
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
		else cb(200, result.results);
	});
};
