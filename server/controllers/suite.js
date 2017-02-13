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
var uuid = require('uuid-random');
var dbConnICE = require('../../server/config/icetestautomation');


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
				var scenarioIdList = [];
				var dataparamlist = [];
				var conditionchecklist = [];
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
				var executionId = uuid();
				async.forEachSeries(json1,function(itr,callback3){
					scenarioIdList.push(itr.scenarioids);
					dataparamlist.push(itr.dataParam);
					conditionchecklist.push(itr.condition);
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
					executionjson.condition = conditionchecklist;
					executionjson.dataparampath = dataparamlist;
					testsuitedetailslist.push(executionjson)

					testsuiteidslist.push(testsuiteid);
					testsuitedetails.suitedetails = testsuitedetailslist;
					testsuitedetails.testsuiteIds = testsuiteidslist;
					testsuitedetails.executionId = executionId;
//					console.log(JSON.stringfy(testsuitedetails));
					var ip = req.headers['x-forwarded-for'] || req.info.remoteAddress;
					var mySocket =  myserver.allSocketsMap[ip];

					mySocket.emit('executeTestSuite',testsuitedetails);
					mySocket.on('result_executeTestSuite', function(resultData){

						console.log(resultData);
						//if(resultData !="success"){
							var scenarioid =resultData.scenarioId;
						var executionid = resultData.executionId;
						var reportdata = resultData.reportData; 
						var req_report = resultData.reportdata;
								var req_reportStepsArray = reportdata.rows;
        						var req_overAllStatus = reportdata.overallstatus
								var req_browser = reportdata.overallstatus.browserType;

						var insertReport = "INSERT INTO reports (reportid,executionid,testsuiteid,testscenarioid,browser,modifiedon,status,report) VALUES (" + uuid() + "," + executionid + "," + testsuiteid + ","
               			 + scenarioid + ",'" + req_browser + "'," + new Date().getTime() + ",'" + resultData.reportData.overallstatus[0].overallstatus + "','" + JSON.stringify(reportdata)  +"')";
						var dbquery =		dbConnICE.execute(insertReport, function (err, result) {if (err) {flag ="fail"; callback3(null, flag);}else {flag = "success";callback3(null, flag);}});

						console.log("this is the value:",resultData);
						return reply("success");
						//}
						
					});

				});
			}
		}

};