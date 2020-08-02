var logger = require('../../logger');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.DAS_URL;
var utils = require('../lib/utils');

exports.getGraphData = function(req, res){
	logger.info("Inside UI service: getGraphData");
	try{
		if (utils.isSessionActive(req)) {
			var inputs={
				"user_id":req.session.userid
			}
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "/neurongraphs/getData", args,
				function (result, response) {
				if(response.statusCode != 200 || result.rows == "fail"){
					//console.log("Status:",status,"\nResponse: ",result);
					res.status(response.statusCode).send("Error while generating Graph!");
				}
				else{
					if(result.nodes.length==0) res.status(response.statusCode).send({"err":true,"ecode":"DB_NOT_FOUND","msg":"Neuron Graphs DB not found!"});
					else{
						var rootIndex=0;
						var nodeTypes={"DOMAINS_NG":"Domain","PROJECTS_NG":"Project","RELEASES_NG":"Release","CYCLES_NG":"Cycle","TESTSUITES_NG":"TestSuite","TESTSCENARIOS_NG":"TestScenario","TESTCASES_NG":"TestCase","SCREENS_NG":"Screen"};
						pData={"nodes":result.nodes,"links":result.links,"type":nodeTypes,"root":rootIndex};
						res.status(response.statusCode).send(pData);
					}
				}
			});
		}
		else{
			res.send({"err":true,"ecode":"INVALID_SESSION","msg":"Your session has been expired. Please login again"});
		}
	}
	catch(exception){
		logger.info("Exception in the service getGraphData: ", exception);
		res.send({"err":true,"ecode":"FAIL","msg":"Internal Error! Please contact admin"});
	}
};