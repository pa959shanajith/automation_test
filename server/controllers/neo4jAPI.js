var configJson = require('../../server/config/options');
var Client = require("node-rest-client").Client;
var client = new Client();
var neoConfig=configJson.storageConfig;
var neoHost=neoConfig.n4jhost.split(':');
var neoURL="http://"+neoConfig.n4jhost+"/db/data/transaction/commit";
var requestHeaders={
	'Authorization': 'Basic '+new Buffer(neoConfig.n4jusername+':'+neoConfig.n4jpassword).toString('base64'),
	'Accept': 'application/json,text/plain',
	'Content-Type': 'application/json',
};

exports.executeQueries = function executeQueries(req,res){
	var args={
		"data":req.body.data,
		"headers": requestHeaders
	};
	client.post(neoURL,args,function(result,resp){
		if (resp.statusCode != 200) res.status(400).send("fail");
		else if (result.errors.length!==0) res.status(400).send(result.errors);
		else {
			res.setHeader('Content-Type','application/json');
			res.status(200).send(JSON.stringify(result.results));
		}
	});
};
