/**
 * Dependencies.
 */
var Joi = require('joi');
var cassandra = require('cassandra-driver');
var async = require('async');
var myserver = require('../../server.js');
var uuid = require('uuid-random');
var dbConnICE = require('../../server/config/icetestautomation');


//ReadTestSuite Functionality
exports.readTestSuite_ICE = function (req, res) {

var outexecutestatus=[];
		var outcondition=[];
		var outdataparam=[];
		var outscenarioids=[];
		var outscenarionames = [];
		/*
		 * base request elements
		 */
		var requiredtestsuiteid=req.body.testsuiteid;
		var requiredcycleid=req.body.cycleid;
		/*var requiredtestsuiteid="13bbacaf-82c7-4c4a-9f91-0933462b10d4";
		var requiredcycleid="e6e5b473-34cd-4963-9bda-cb78c727e413";*/
		/*
		 * complete response data
		 */
		var responsedata={
				executestatus: [],
				condition: [],
				dataparam:[],
				scenarioids:[],
				scenarionames:[]
		};

		/*
		 * Query 1 fetching the donotexecute,conditioncheck,getparampaths,testscenarioids
		 * based on testsuiteid,testsuitename and cycleid
		 */
		async.series(
			{	
				testsuitesdata: function(callback){
									var getTestSuites="select donotexecute,conditioncheck,getparampaths,testscenarioids from testsuites where testsuiteid= "+requiredtestsuiteid+" and cycleid="+requiredcycleid;
						//var getTestSuites="select donotexecute,condtitioncheck,getparampaths,testscenarioids from testsuites where testsuiteid= 13bbacaf-82c7-4c4a-9f91-0933462b10d4 AND cycleid=e6e5b473-34cd-4963-9bda-cb78c727e413 and testsuitename='Dev Suite 1'"; 
						dbConnICE.execute(getTestSuites, function (err, result) {
							if (err) {
								var flag = "Error in readTestSuite_ICE : Fail";
								cb(null, flag);
							}else {
								//for (var i = 0; i < result.rows.length; i++) {
									

					async.forEachSeries(result.rows, function(quest, callback2) {
						outexecutestatus=quest.donotexecute;
						outcondition=quest.conditioncheck;
						outdataparam=quest.getparampaths;
						outscenarioids=quest.testscenarioids;
						//var responsedata={template: "",testcase:[],testcasename:""};

						async.forEachSeries(outscenarioids,function(quest1,callback3){
						var testcasestepsquery = "SELECT testscenarioname FROM testscenarios where testscenarioid="+quest1;
								dbConnICE.execute(testcasestepsquery, function(err, answers) {
								if(err){
									console.log(err);
								}else{
									outscenarionames.push(answers.rows[0].testscenarioname);
								}
								callback3(); 
							});
						}, callback2);
						},callback);
						
						
								responsedata.executestatus=outexecutestatus;
								responsedata.condition=outcondition;
								responsedata.dataparam=outdataparam;
								responsedata.scenarioids=outscenarioids;
								responsedata.scenarionames = outscenarionames;
								//cb(null, responsedata);
							}
						});
				},
				
				},
				function(err,results){
					//data.setHeader('Content-Type','application/json');
					if(err){
						res.send(err);
					} 
					else{
						console.log(responsedata);
						res.send(JSON.stringify(responsedata));
					} 
				})
};
//ReadTestSuite Functionality


//UpdateTestSuite Functionality
exports.updateTestSuite_ICE = function (req, res) {
	/*
	 * internal variables
	 */
	var hasrow = false;
	/*
	 * base request elements
	 */
	var userinfo = req.body.userinfo;
	var requestedtestscycleid = req.body.testscycleid;
	var requestedtestsuitename = req.body.requestedtestsuitename;
	var requestedtestsuiteid = req.body.requestedtestsuiteid;
	var requestedtestscenarioids = req.body.testscenarioids;
	//		var requestedskucodetestcase = req.payload.skucodetestcase;
	//		var requestedtags = req.payload.tags;
	var requestedcondtioncheck = req.body.condtioncheck;
	var requesteddonotexecute = req.body.donotexecute;
	var requestedgetparampaths = req.body.getparampaths;
	//		var requestedexecutionids = req.payload.executionids;
	//		var requestedversionnumber = req.payload.versionnumber;
	//		var requesthistorydetails="update testcase action by "+userinfo.username+" having role:"+userinfo.role+""+
	//		" skucodetestcase='"+requestedskucodetestcase+"', tags="+requestedtags+","+
	//		" testscenarioids="+requestedtestscenarioids+" versionnumber="+requestedversionnumber;
	//		var requestedhistory={date:new Date().getTime(), historydetails:requesthistorydetails};

	// var requestedskucodetestcase="";
	// var requestedtags=[];
	// var requestedversionnumber=2;
	// var requestedtestscycleid="e6e5b473-34cd-4963-9bda-cb78c727e413";
	// var requestedtestsuiteid="13bbacaf-82c7-4c4a-9f91-0933462b10d4";
	/*
	 * Query 1 checking whether the requestedtestsuiteid belongs to the same requestedtestscycleid
	 * based on requested cycleid,suiteid 
	 */
	// requestedtestsuiteid="123";
	var checksuiteexists = "";
	var deleteTestSuiteData = "";
	var updateTestSuiteData = "";
	async.waterfall([
		function (callback1) {
			//check exists
			checksuiteexists = "select testsuiteid from testsuites where cycleid=" + requestedtestscycleid;
			dbConnICE.execute(checksuiteexists, function (err, checksuiteexistsresult) {
				if (err) {
					var flag = "Error in Query 1 checksuiteexists: Fail";
					res.send(flag);
				} else {
					async.forEachSeries(checksuiteexistsresult.rows, function (row, forEachSeriescallback) {
						if (row.testsuiteid == requestedtestsuiteid) {
							hasrow = true;
						}
						forEachSeriescallback(null, hasrow);
					});
				}
				callback1(null, hasrow);
				//res.send(hasrow);
			});
		},
		function (actualExecutioncallback) {
			if (hasrow) {
				async.waterfall([
					function (deletecallback) {
						deleteTestSuiteData = "DELETE conditioncheck,donotexecute,getparampaths,testscenarioids FROM testsuites " +
							"where cycleid=" + requestedtestscycleid +
							" and testsuitename='" + requestedtestsuitename + "'" +
							" and testsuiteid=" + requestedtestsuiteid;
						dbConnICE.execute(deleteTestSuiteData, function (err, deleteQueryresults) {
							if (err) {
								flag = "failed to execute update query: Fail";
								//cb(err, flag);
								res.send(flag);
							} else {
								flag = "success";
							}
						});
						deletecallback(null, "query1success");
					},
					function (value, waterfallquery2callback) {
						for (var scenarioidindex = 0; scenarioidindex < requestedtestscenarioids.length; scenarioidindex++) {
							updateTestSuiteData = "update testsuites set" +
								" conditioncheck=conditioncheck+[" + requestedcondtioncheck[scenarioidindex] + "], " +
								"donotexecute=donotexecute+[" + requesteddonotexecute[scenarioidindex] + "], " +
								"getparampaths=getparampaths+[" + requestedgetparampaths[scenarioidindex] + "], " +
								"testscenarioids=testscenarioids+[" + requestedtestscenarioids[scenarioidindex] + "], " +
								"modifiedby='" + userinfo.username + "', modifiedbyrole='" + userinfo.role + "' " +
								"where cycleid=" + requestedtestscycleid + " and testsuiteid=" + requestedtestsuiteid +
								" and testsuitename='" + requestedtestsuitename + "';";
							dbConnICE.execute(updateTestSuiteData, function (err, updateQueryresults) {
								if (err) {
									flag = "fail";
									//cb(err, flag);
									res.send(flag);
								} else {
									flag = "success";
								}
							});
						}
						waterfallquery2callback(null, "success");
					}
				],
					function (err, finalcallback) {
						//cb(null, "success");
						res.send("success");
					});
			}
		}
	]);
}
//UpdateTestSuite Functionality


//UpdateTestSscnario Functionality
exports.updateTestScenario_ICE = function (req, res) {

	/*
	 * internal variables
	 */

	/*
	 * base request elements
	 */

	// var userinfo = req.payload.userinfo;
	var requestedtestscycleId = req.body.cycleId;
	var requestedtestscenarioid = req.body.testscenarioid;
	var requestedtestscenarioname = req.body.testscenarioname;
	var requestedmodifiedby = req.body.modifiedby;
	var requestedmodifiedbyrole = req.body.modifiedbyrole;
	var requestedmodifiedon = req.body.modifiedon;
	var requestedskucodetestcase = req.body.skucodetestcase;
	var requestedtags = req.body.tags;
	var requestedetestcaseids = req.body.testcaseids;
	var requestedprojectid = req.body.projectid;
	requestedprojectid = '9120ed16-0822-4fad-8979-27cc16975ea6';
	requestedetestcaseids = ['634068fc-b459-4a7e-b4cb-2e25c0af2f2c', 'd4f13d90-a53f-4dcd-8513-f883d7742da7'];
	requestedtestscenarioid = 'f432bd8c-ccc3-462f-9281-40fded159eeb';
	requestedtestscenarioname = "Dev Scenario1";
	requestedmodifiedon = new Date().getTime();
	requestedmodifiedby = "Shreeram";
	console.log(requestedetestcaseids)
	var delettestcaseids = "delete testcaseids from  testscenarios where projectid=" + requestedprojectid + " and testscenarioid=" + requestedtestscenarioid + " and testscenarioname ='" + requestedtestscenarioname + "';";
	dbConnICE.execute(delettestcaseids, function (err, result) {
		if (err) {
			var flag = "Error in Query 1 delettestcaseids: Fail";
			console.log(err);
			//cb(null, flag);
			res.send(flag);
		} else {
			var flag = "TestcaseIds Deletion : Success";
			console.log(flag);
			//cb(null,flag);
			res.send(flag);
		}
	});

	for (var i = 0; i < requestedetestcaseids.length; i++) {
		var updateTestScenarioData = "update testscenarios set testcaseids=testcaseids+[" + requestedetestcaseids[i] + "] ,modifiedby ='" + requestedmodifiedby +
			"' , modifiedon = " + requestedmodifiedon + " where projectid =" + requestedprojectid + " and testscenarioid = " + requestedtestscenarioid + " and testscenarioname = '" + requestedtestscenarioname + "';";

		dbConnICE.execute(updateTestScenarioData, function (err, result) {
			if (err) {
				var flag = "Error in Query 1 updateTestScenarioData: Fail";
				console.log(err);
				//cb(null, flag);
				res.send(flag);
			} else {
				var flag = "updateTestScenarioData updation : Success";
				console.log(flag);
				//cb(null,flag);
				res.send(flag);
			}
		});
	}
}
//UpdateTestSscnario Functionality


//ExecuteTestSuite Functionality
exports.ExecuteTestSuite_ICE = function (req, res) {
	var scenarioIdList = [];
				var scenarioIdList = [];
				var dataparamlist = [];
				var conditionchecklist = [];
				var browserType = req.body.browserType;
				var testsuiteid = req.body.testsuiteId
				var scenarioIdinfor = '';
				var scenariotestcaseobj = {};
				var listofscenarioandtestcases = [];
				var testsuitedetailslist = [];
				var testsuiteidslist = [];
				var testsuitedetails = { "suitedetails": "", "testsuiteIds": "" };
				var json = req.body.jsonData;
				var executionjson = { "scenarioIds": [], "browserType": [] };
				//var json = "[{ 	\"scenarioname\": \"Scenario Name1\", 	\"scenarioid\": \"72bcc08e-15a7-4de6-ad59-389aee2230cb\", 	\"conditon\": [\"false\"], 	\"dataParam\": \"http://10.41.31.92:3000/execute\", 	\"executeStatus\": [\"1\"] }]";

				var json1 = JSON.parse(json);
				var executionId = uuid();
				var starttime = new Date().getTime();
		async.forEachSeries(json1, function (itr, callback3) {
					scenarioIdList.push(itr.scenarioids);
					dataparamlist.push(itr.dataParam);
					conditionchecklist.push(itr.condition);
					scenarioIdinfor = itr.scenarioids;
					TestCaseDetails_Suite_ICE(scenarioIdinfor,function(err,data){
						
						if(err){
							console.log(err);
						}else{
							scenariotestcaseobj[scenarioIdinfor] = data;
							listofscenarioandtestcases.push(scenariotestcaseobj);
							
						}
						callback3(); 
					})
		}, function (callback3) {
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
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var mySocket = myserver.allSocketsMap[ip];
		mySocket._events.result_executeTestSuite = [];
		mySocket.emit('executeTestSuite', testsuitedetails);
		mySocket.on('result_executeTestSuite', function (resultData) {

			if(resultData !="success" && resultData != "terminate"){
					var scenarioid =resultData.scenarioId;
					var executionid = resultData.executionId;
					var reportdata = resultData.reportData; 
					var req_report = resultData.reportdata;
					var req_reportStepsArray = reportdata.rows;
					var req_overAllStatus = reportdata.overallstatus
					var req_browser = reportdata.overallstatus.browserType;

					var insertReport = "INSERT INTO reports (reportid,executionid,testsuiteid,testscenarioid,browser,modifiedon,status,report) VALUES (" + uuid() + "," + executionid + "," + testsuiteid + ","
						+ scenarioid + ",'" + req_browser + "'," + new Date().getTime() + ",'" + resultData.reportData.overallstatus[0].overallstatus + "','" + JSON.stringify(reportdata)  +"')";
					var dbquery =	dbConnICE.execute(insertReport, function (err, result) {if (err) {flag ="fail";}else {flag = "success";}});

					var insertIntoExecution = "INSERT INTO execution (testsuiteid,executionid,starttime,endtime) VALUES ("
					+testsuiteid+","+executionid+","+starttime+","+new Date().getTime()+");"
					var dbqueryexecution =	dbConnICE.execute(insertIntoExecution, function (err, resultexecution) {if (err) {flag ="fail";}else {flag = "success";}});
					//console.log("this is the value:",resultData);

					}
					if(resultData =="success" || resultData == "terminate")
					res.send(resultData);
			
			//}
		});
	});
}


	function TestCaseDetails_Suite_ICE(req,cb,data){
		var requestedtestscenarioid = req;
		var testscenarioslist = "select testcaseids from testscenarios where testscenarioid="+requestedtestscenarioid+";";
		var resultstring = [];
		var data = [];
		var resultdata ='';

		var listoftestcasedata = [];
		async.series(
				{	testcaseid: function(callback){
					dbConnICE.execute(testscenarioslist,function(err,result){
						if(err){
							console.log(err);
						}else{
							data = JSON.parse(JSON.stringify(result.rows[0].testcaseids));
							resultdata = data;
							console.log(data);
							callback(err,resultdata);
						}
					});
				},
				testcasesteps : function(callback){

					async.forEachSeries(resultdata, function(quest, callback2) {
						var responsedata={template: "",testcase:[],testcasename:""};

						var testcasestepsquery = "select testcasesteps,testcasename from testcases where testcaseid = "+quest;
						dbConnICE.execute(testcasestepsquery, function(err, answers) {
							if(err){
								console.log(err);
							}else{
								responsedata.template = "";
								responsedata.testcasename = answers.rows[0].testcasename;
								responsedata.testcase = answers.rows[0].testcasesteps;

								listoftestcasedata.push(responsedata);
							}
							callback2(); 
						});
					}, callback);

				}
				},
				function(err,results){
					//data.setHeader('Content-Type','application/json');
					if(err){
						cb(err);
					} 
					else{
						cb(null,JSON.stringify(listoftestcasedata));
					} 
				}

		);
	}


//ExecuteTestSuite Functionality