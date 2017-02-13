/**
 * Dependencies.
 */
var Joi = require('joi');
var dbConn = require('../../server/config/icetestautomation');
var cassandra = require('cassandra-driver');
var cb = require('callback');
var suiteDAO = require('../dao/suiteDAO');
var async = require('async');
var myserver = require('../../server.js');


module.exports = {
		readTestSuite_ICE: {
			handler: function (req, reply) {
				suiteDAO.readTestSuite_ICE(req, function (err, data) {
					if (err) { console.log(err); }
					return reply(data);
				});
			},
			app: {
				name: 'readTestSuite_ICE'
			}
		},
		readTestScenarios_ICE: {
			handler: function (req, reply) {
				suiteDAO.readTestScenarios_ICE(req, function (err, data) {
					if (err) { console.log(err); }
					return reply(data);
				});
			},
			app: {
				name: 'readTestScenarios_ICE'
			}
		},
		updateTestSuite_ICE: {
			handler: function (req, reply) {
				suiteDAO.updateTestSuite_ICE(req, function (err, data) {
					if (err) { console.log(err); }
					return reply(data);
				});
			},
			app: {
				name: 'updateTestSuite_ICE'
			}
		},
		updateTestScenario_ICE :{
			handler : function(req, reply){
				console.log("--------------------coming here----------------------");
				suiteDAO.updateTestScenario_ICE(req, function(err, data){
					if(err){
						Console.log(err);
					}
				});
			}
		},
		ExecuteTestSuite_ICE :{
			handler : function(req,reply){
				var scenarioIdList = [];
				var browserType = req.payload.browserType;
				var testsuiteid = req.payload.testsuiteId
				var scenarioIdinfor = '';
				var scenariotestcaseobj = {};
				var listofscenarioandtestcases = [];
				var testsuitedetailslist = [];
				var testsuiteidslist = [];
				var testsuitedetails = {"suitedetails":"","testsuiteIds" :""};
				var json = req.payload.jsonData;
				var executionjson = {"scenarioIds":[],"browserType":[]};
				//var json = "[{ 	\"scenarioname\": \"Scenario Name1\", 	\"scenarioid\": \"72bcc08e-15a7-4de6-ad59-389aee2230cb\", 	\"conditon\": [\"false\"], 	\"dataParam\": \"http://10.41.31.92:3000/execute\", 	\"executeStatus\": [\"1\"] }]";
				
				var json1 = JSON.parse(json);

				async.forEachSeries(json1,function(itr,callback3){
					scenarioIdList.push(itr.scenarioids);
					scenarioIdinfor = itr.scenarioids;
					suiteDAO.ExecuteTestSuite_ICE(scenarioIdinfor,function(err,data){
						
						if(err){
							console.log(err);
						}else{
							scenariotestcaseobj[scenarioIdinfor] = data;
							listofscenarioandtestcases.push(scenariotestcaseobj);
							
						}
						callback3(); 
					})
				},function(callback3){
					executionjson[testsuiteid] = listofscenarioandtestcases;
					executionjson.scenarioIds = scenarioIdList;
					executionjson.browserType = browserType;
					testsuitedetailslist.push(executionjson)

					testsuiteidslist.push(testsuiteid);
					testsuitedetails.suitedetails = testsuitedetailslist;
					testsuitedetails.testsuiteIds = testsuiteidslist;
					var ip = req.headers['x-forwarded-for'] || req.info.remoteAddress;
					var mySocket =  myserver.allSocketsMap[ip];

					mySocket.emit('executeTestSuite',testsuitedetails);
					mySocket.on('result_executeTestSuite', function(resultData){

						console.log("this is the value:",resultData);
						return reply("success");
					});

				});
			}
		}

};