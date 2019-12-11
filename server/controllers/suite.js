/**
 * Dependencies.
 */
var async = require('async');
var myserver = require('../lib/socket');
var uuid = require('uuid-random');
var bcrypt = require('bcryptjs');
var epurl = process.env.NDAC_URL;
var Client = require("node-rest-client").Client;
var client = new Client();
var schedule = require('node-schedule');	
var scheduleStatus = "";
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');
var taskflow = require('../config/options').strictTaskWorkflow;
if (process.env.REPORT_SIZE_LIMIT) require('follow-redirects').maxBodyLength = parseInt(process.env.REPORT_SIZE_LIMIT)*1024*1024;

/**
 * @author vishvas.a
 * @modifiedauthor shree.p (fetching the scenario names from the scenarios table)
 * @author vishvas.a changes on 21/June/2017 with regard to Batch Execution
 * this reads the scenario information from the testsuites
 * and testsuites table of the icetestautomation keyspace
 */
exports.readTestSuite_ICE = function (req, res) {
	logger.info("Inside UI service: readTestSuite_ICE");
	 if (utils.isSessionActive(req)) {
		var requiredreadTestSuite = req.body.readTestSuite;
		var fromFlg = req.body.fromFlag;
		var responsedata = {};
		var testsuitesindex = 0;
		async.forEachSeries(requiredreadTestSuite, function (eachSuite, readSuiteDatacallback) {
			//internal variables
			var outexecutestatus = [];
			var outcondition = [];
			var outdataparam = [];
			var outscenarioids = [];
			var outscenarionames = [];
			var outprojectnames = [];
			testsuitesindex = testsuitesindex + 1;
			eachSuite.userInfo = {"userid": req.session.userid, "role": req.session.activeRoleId};
			logger.info("Calling function TestSuiteDetails_Module_ICE from readTestSuite_ICE");
			TestSuiteDetails_Module_ICE(eachSuite, function (TestSuiteDetailserror, TestSuiteDetailsCallback) {
				if (TestSuiteDetailserror) {
					logger.error("Error in the function TestSuiteDetails_Module_ICE from readTestSuite_ICE: %s",TestSuiteDetailserror);
				} else {
					var inputs = {
						"mindmapid": eachSuite.testsuiteid,
						"cycleid": eachSuite.cycleid,
						"testsuitename": eachSuite.testsuitename,
						"versionnumber": eachSuite.versionnumber,
						"query": "readTestSuite_ICE"
					};
					var args = {
						data: inputs,
						headers: {
							"Content-Type": "application/json"
						}
					};
					logger.info("Calling NDAC Service from readTestSuite_ICE: suite/readTestSuite_ICE");
					client.post(epurl + "suite/readTestSuite_ICE", args,
						function (result, response) {
						if (response.statusCode != 200 || result.rows == "fail") {
							logger.error("Error occurred in suite/readTestSuite_ICE from readTestSuite_ICE Error Code : ERRNDAC");
							var flag = "Error in readTestSuite_ICE : Fail";
							res.send(flag);
						} else {
							//complete each response scenario object
							var respeachscenario = {
								executestatus: [],
								condition: [],
								dataparam: [],
								scenarioids: [],
								scenarionames: [],
								projectnames: []
							};
							async.forEachSeries(result.rows, function (eachSuiterow, eachSuitecallback) {
								outscenarioids = eachSuiterow.testscenarioids;
								//for (i =0; i<eachSuiterow.testscenarioids.length;i++) {outscenarioids=[]; outscenarioids.push(eachSuiterow.testscenarioids[i].$oid);}
								if (outscenarioids == null) {
									outscenarioids = [];
								}
								respeachscenario.scenarioids = outscenarioids;
								if (eachSuiterow.donotexecute == null) {
									var arrTemp = [];
									for (var i = 0; i < outscenarioids.length; i++) {
										arrTemp.push(1);
									}
									outexecutestatus = arrTemp;
								} else {
									outexecutestatus = eachSuiterow.donotexecute;
								}
								respeachscenario.executestatus = outexecutestatus;
								if (eachSuiterow.conditioncheck == null) {
									var arrTemp = [];
									for (var i = 0; i < outscenarioids.length; i++) {
										arrTemp.push(0);
									}
									outcondition = arrTemp;
								} else {
									outcondition = eachSuiterow.conditioncheck;
								}
								respeachscenario.condition = outcondition;
								if (eachSuiterow.getparampaths == null) {
									var arrTemp = [];
									for (var i = 0; i < outscenarioids.length; i++) {
										arrTemp.push('');
									}
									outdataparam = arrTemp;
								} else {
									outdataparam = eachSuiterow.getparampaths;
								}
								respeachscenario.dataparam = outdataparam;
								respeachscenario.testsuitename = eachSuiterow.name;
								var scenarioidindex = 0;
								responsedata[eachSuite.testsuiteid] = respeachscenario;
								async.forEachSeries(outscenarioids, function (eachoutscenarioid, outscenarioidcallback) {
									scenarioidindex = scenarioidindex + 1;
									/**
									 *  Projectnametestcasename_ICE is a function to fetch testscenario name and project name
									 * 	modified shreeram p on 15th mar 2017
									 * */
									logger.info("Calling function Projectnametestcasename_ICE from readTestSuite_ICE");
									Projectnametestcasename_ICE(eachoutscenarioid, function (eachoutscenarioiderr, eachoutscenarioiddata) {
										if (eachoutscenarioiderr) {
											logger.error("Error in the function Projectnametestcasename_ICE from readTestSuite_ICE: %s",eachoutscenarioiderr);
										} else {
											if (eachoutscenarioiddata != null || eachoutscenarioiddata != undefined) {
												outscenarionames.push(eachoutscenarioiddata.testcasename);
												outprojectnames.push(eachoutscenarioiddata.projectname);
											}
											respeachscenario.scenarionames = outscenarionames;
											respeachscenario.projectnames = outprojectnames;
											respeachscenario.testsuiteid = eachSuite.testsuiteid;
											respeachscenario.versionnumber = eachSuite.versionnumber;
											if (scenarioidindex == outscenarioids.length) {
												responsedata[eachSuite.testsuiteid] = respeachscenario;
												if (testsuitesindex == requiredreadTestSuite.length) {
													if (fromFlg == "scheduling") {
														utils.getSocketList("schedule", function(connectusers){
															logger.debug("IP\'s connected : %s", connectusers.join());
															var schedulingDetails = {
																"connectedUsers": connectusers,
																"testSuiteDetails": responsedata
															};
															responsedata=schedulingDetails;
															outscenarioidcallback();
														});
													}else outscenarioidcallback();
												}else outscenarioidcallback();
											}else outscenarioidcallback();
											
										}
									}, eachSuitecallback);

								}, readSuiteDatacallback);
							});
						}
					});
				}
			});
		},function(){
			logger.info("Inside final function of the service readTestSuite_ICE");
			logger.info("Calling function executeQueries from final function of the service readTestSuite_ICE");
			res.send(responsedata);
		});
	} 
	else {
		logger.error('Error in the service readTestSuite_ICE: Invalid Session');
		res.send("Invalid Session");
	}
};

function TestSuiteDetails_Module_ICE(req, cb1, data) {
	logger.info("Inside TestSuiteDetails_Module_ICE function");
	var requiredcycleid = req.cycleid;
	var requiredtestsuiteid = req.testsuiteid;
	var requiredtestsuitename = req.testsuitename;
	var userInfo = req.userInfo;
	var flag = false;
	async.series({
		testsuitecheck: function (callback) {
			var inputs = {
				"mindmapid": requiredtestsuiteid,
				"cycleid": requiredcycleid,
				"query": "testsuitecheck"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from TestSuiteDetails_Module_ICE - testsuitecheck: suite/readTestSuite_ICE");
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail" ) {
					logger.error("Error occurred in suite/readTestSuite_ICE from TestSuiteDetails_Module_ICE - testsuitecheck, Error Code : ERRNDAC");
				} else {
					if (result.rows.length != 0) {
						flag = true;
					}
					callback();
				}
			});
		},
		testcasesteps: function (callback) {
			if (!flag) {
				var inputs = {
					"cycleid": requiredcycleid,
					"name": requiredtestsuitename,
					"mindmapid": requiredtestsuiteid,
					"createdby": userInfo.userid,
					"createdthrough": "Mindmaps Creation",
					"deleted": false,
					"query": "testcasesteps"
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from TestSuiteDetails_Module_ICE - testcasesteps: suite/readTestSuite_ICE");
				client.post(epurl + "suite/readTestSuite_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || (result.rows == "fail" && result.rows != undefined)) {
						logger.error("Error occurred in suite/readTestSuite_ICE from TestSuiteDetails_Module_ICE - testcasesteps, Error Code : ERRNDAC");
						cb1(null, flag);
					} else {
						callback(null, flag);
					}
				});
			} else {
				var jsondata = {
					"testsuiteid": requiredtestsuiteid,
					"cycleid": requiredcycleid,
					"testsuitename": requiredtestsuitename,
					"userInfo": userInfo
				};
				logger.info("Calling function updatescenariodetailsinsuite from TestSuiteDetails_Module_ICE - testcasesteps");
				updatescenariodetailsinsuite(jsondata, function (err, data) {
					if (err) {
						logger.error("Error in the function updatescenariodetailsinsuite from TestSuiteDetails_Module_ICE - testcasesteps: %s", err);
						cb1(null, flag);
					} else {
						callback(null, flag);
					}
				});
			}
		}
	}, function (err, results) {
		logger.info("Inside final function of TestSuiteDetails_Module_ICE");
		if (err) {
			logger.error("Error in the final function of updatescenariodetailsinsuite from TestSuiteDetails_Module_ICE - testcasesteps: %s",err);
			cb1(null, flag);
		} else {
			cb1(null, flag);
		}
	});
}

function updatescenariodetailsinsuite(req, cb, data) {
	logger.info("Inside updatescenariodetailsinsuite function");
	var inputs = {
		"cycleid": req.cycleid,
		"name": req.testsuitename,
		"mindmapid": req.testsuiteid,
		"modifiedby": req.userInfo.userid,
		"modifiedbyrole": req.userInfo.role,
		"testscenarioids": req.testscenarioids,
		"query": "updatescenarioinnsuite"
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from updatescenariodetailsinsuite - updatescenarioinnsuite: suite/readTestSuite_ICE");
	client.post(epurl + "suite/readTestSuite_ICE", args,
		function (result, response) {
		if (response.statusCode != 200 || result.rows == "fail") {
			logger.error("Error occurred in suite/readTestSuite_ICE from updatescenariodetailsinsuite - updatescenarioinnsuite, Error Code: ERRNDAC");
			cb(null, "fail");
		} else {
			cb(null, 'Success');
		}
	});

}

function Projectnametestcasename_ICE(req, cb, data) {
	logger.info("Inside function Projectnametestcasename_ICE of the service readTestSuite_ICE");
	var projectid = '';
	var testcaseNproject = {
		testcasename: "",
		projectname: ""
	};
	async.series({
		testcasename: function (callback_name) {
			var inputs = {
				"id": req,
				"query": "testcasename"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from Projectnametestcasename_ICE - testcasename: suite/readTestSuite_ICE");
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in the function testcasename of Projectnametestcasename_ICE: suite/readTestSuite_ICE - fail");
				} else {
					if (result.rows.length != 0) {
						projectid = result.rows[0].projectid;
						testcaseNproject.testcasename = result.rows[0].name;
					}
					callback_name(null, projectid);
				}
			});
		},
		projectname: function (callback_name) {
			var inputs = {
				"id": projectid,
				"query": "projectname"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from Projectnametestcasename_ICE - projectname: suite/readTestSuite_ICE");
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in the function projectname of Projectnametestcasename_ICE: suite/readTestSuite_ICE - fail");
				} else {
					if (result.rows.length != 0)
						testcaseNproject.projectname = result.rows[0].name;
					callback_name(null, testcaseNproject);
				}
			});
		}
	}, function (err, data) {
		cb(null, testcaseNproject);
	});
}



exports.updateTestSuite_ICE = function (req, res) {
    logger.info("Inside UI service: updateTestSuite_ICE");
    if (utils.isSessionActive(req)) {
        //var userinfo = {"username": req.session.username, "role": req.session.activeRole};
        var batchDetails = req.body.batchDetails.suiteDetails;
		var overallstatusflag = "success";
        var totalnumberofsuites = 0;
        async.forEachSeries(batchDetails, function (eachbatchDetails, batchDetailscallback) {
            var testSuitename = Object.keys(eachbatchDetails)[0];
            totalnumberofsuites = totalnumberofsuites + 1;
            // async.forEachSeries(allsuitenames, function (eachsuitename, eachsuitenamecallback) {
                var requestedtestsuitename = eachbatchDetails[testSuitename].requestedtestsuitename;
                var id = eachbatchDetails[testSuitename].requestedtestsuiteid;
                var conditioncheck = eachbatchDetails[testSuitename].conditioncheck;
                var donotexecute = eachbatchDetails[testSuitename].donotexecute;
                var getparampaths = eachbatchDetails[testSuitename].getparampaths;
                var testscenarioids = eachbatchDetails[testSuitename].testscenarioids;
                var testscycleid = eachbatchDetails[testSuitename].testscycleid;
                var versionnumber = eachbatchDetails[testSuitename].versionnumber;
                /*
                 * Query to update test suite details in in test suite tabel
                 * based on requested cycleid,suiteid
                 */

                logger.info("Calling function updatetestsuitedataqueryrom updateTestSuite_ICE");
                var inputs2 = {
                    "query": "updatetestsuitedataquery",
                    "conditioncheck": conditioncheck,
                    "donotexecute": donotexecute,
                    "getparampaths": getparampaths,
                    "testscenarioids": testscenarioids,
                    "modifiedby": req.session.userid,
                    "modifiedbyrole": req.session.activeRoleId,
                    "cycleid": testscycleid,
                    "mindmapid": id,
                    "name": requestedtestsuitename,
                    "versionnumber": versionnumber
                };
                // scenarioidindex+=1;
                var args = {
                    data: inputs2,
                    headers: {
                        "Content-Type": "application/json"
                    }
                };
                client.post(epurl + "suite/updateTestSuite_ICE", args,
                    function (data, response) {
                    if (response.statusCode != 200 || data.rows == "fail") {
                        overallstatusflag = "fail";
                        logger.error("Error occurred in suite/updateTestSuite_ICE from updateTestSuite_ICE: saveSuite function - Error Code : ERRNDAC");
                    } else {
                        batchDetailscallback();
                    }
                });
            
        },function(){
            res.send(overallstatusflag);
        });
    } else {
        logger.error("Error occurred in the service updateTestSuite_ICE: Invalid Session");
        res.send("Invalid Session");
    }
};



exports.ExecuteTestSuite_ICE = function (req, res) {
    if (utils.isSessionActive(req)) {		
		var userInfo = {"userid": req.session.userid, "role": req.session.activeRoleId};
        var name = req.session.username;
		redisServer.redisSubServer.subscribe('ICE2_' + name);
        var batchExecutionData = req.body.moduleInfo;
        var scenariodescriptionobject = {};
        var testsuitedetailslist = [],testsuiteidcycmap = {};
        var testsuiteIds = [];
		var exc_action  = req.body.action;
		var executionRequest = {
			"executionId": "",
			"suitedetails": [],
			"testsuiteIds": [],
			"apptype": "",
			"exec_mode":exc_action
        };				
        var executionId = '';						
        async.series({
            approval_check:function(callback_E){
				// if (!taskflow) return callback_E();
				// utils.approval_status_check(batchExecutionData, function (err, approved_status) {
				// 	if (approved_status) callback_E();
				// 	else res.status(err.status).send(err.res);
                // });
                callback_E();
            },
			counter_updater:function(callback_E){

				//updating number of executions happened
				var batchlength = batchExecutionData.length;
				var updateinp = {
					"query": "testsuites",
					"count": batchlength,
					"userid": userInfo.userid
				};
				var args = {
					data: updateinp,
					headers: {
						"Content-Type": "application/json"
					}
                };
                logger.info("Calling NDAC Service: utility/dataUpdator_ICE from ExecuteTestSuite_ICE");
				// client.post(epurl + "utility/dataUpdator_ICE", args,
				// 	function (result, response) {
				// 	if (response.statusCode != 200 || result.rows == "fail") {
				// 		logger.error("Error occurred in utility/dataUpdator_ICE service from ExecuteTestSuite_ICE: Data Updator Fail");
				// 	} else {
				// 		logger.info("Data Updator Success");
                //     }
                    callback_E();
				// });
            },
            suite_execution:function(callback_E){
                async.forEachSeries(batchExecutionData, function (eachbatchExecutionData, batchExecutionDataCallback) {
                    var suiteDetails = eachbatchExecutionData.suiteDetails;
					var testsuitename = eachbatchExecutionData.testsuitename;
					var testsuiteid = eachbatchExecutionData.testsuiteid;
					var releaseid = eachbatchExecutionData.releaseid;
					var cycleid = eachbatchExecutionData.cycleid;			
					var browserType = eachbatchExecutionData.browserType;
					var apptype = eachbatchExecutionData.appType;
					var listofscenarioandtestcases = [];
					var scenarioIdList = [];
					var dataparamlist = [];
					var conditionchecklist = [];
                    var browserTypelist = [];
                    testsuiteIds.push(testsuiteid);
                    testsuiteidcycmap[testsuiteid] = cycleid;
                    async.forEachSeries(suiteDetails, function (eachsuiteDetails, eachsuiteDetailscallback) {
                        var executionjson = {
							"scenarioIds": [],
							"browserType": [],
							"dataparampath": [],
							"condition": [],
							"testsuitename": ""
                        };
                        var currentscenarioid = "";
						scenarioIdList.push(eachsuiteDetails.scenarioids);
						dataparamlist.push(eachsuiteDetails.dataparam[0]);
						conditionchecklist.push(eachsuiteDetails.condition);
						browserTypelist.push(eachsuiteDetails.browserType);
						currentscenarioid = eachsuiteDetails.scenarioids;
						executionjson.releaseid = releaseid;
                        executionjson.cycleid = cycleid;
                        scenariodescriptionobject[eachsuiteDetails.scenarioids] = eachsuiteDetails.scenariodescription;
                        TestCaseDetails_Suite_ICE(currentscenarioid, userInfo.userid, function (currentscenarioidError, currentscenarioidResponse) {
                            var scenariotestcaseobj = {};
							if (currentscenarioidError) {
								logger.error("Error occurred in the function TestCaseDetails_Suite_ICE: %s",currentscenarioidError);
							} else {
								if (currentscenarioidResponse != null || currentscenarioidResponse != undefined) {
									scenariotestcaseobj[currentscenarioid] = currentscenarioidResponse.listoftestcasedata;
									scenariotestcaseobj.qccredentials = eachsuiteDetails.qccredentials;
									scenariotestcaseobj.qcdetails = currentscenarioidResponse.qcdetails;
									listofscenarioandtestcases.push(scenariotestcaseobj);
									eachsuiteDetailscallback();
								}
								if (listofscenarioandtestcases.length == suiteDetails.length) {
									logger.info("Calling function updateData from TestCaseDetails_Suite_ICE function");
									executionjson[testsuiteid] = listofscenarioandtestcases;
                                    executionjson.scenarioIds = scenarioIdList;
                                    executionjson.browserType = browserType;
                                    executionjson.condition = conditionchecklist;
                                    executionjson.dataparampath = dataparamlist;
                                    executionjson.testsuiteid = testsuiteid;
                                    executionjson.testsuitename = testsuitename;
                                    executionjson.scenariodescriptionobject = scenariodescriptionobject;
                                    testsuitedetailslist.push(executionjson);
									batchExecutionDataCallback();
									if (testsuitedetailslist.length == batchExecutionData.length) {
                                        executionRequest.executionId = executionId;
                                        executionRequest.suitedetails = testsuitedetailslist;
                                        executionRequest.testsuiteIds = testsuiteIds;
                                        executionRequest.apptype = apptype;
										logger.info("Calling function executionFunction from TestCaseDetails_Suite_ICE function");
										callback_E();
									}
								}
							}
                        });
                    });

                }); 
            },
            execution_insertion:function(callback_E){ 
                 insertExecutionStatus(req.session.userid,function(res){
                    if(res == 'fail'){
						executionId = '';
                    }else{
						executionRequest.executionId = res;
                    }
                    callback_E();
				});
            },
            execute_function:function(callback_E){
                logger.info("Inside executionFunction function");
				var completedSceCount = 0;
				var testsuitecount=0;
				var statusPass = 0;
				var suiteStatus;
				logger.debug("ICE Socket requesting Address: %s" , name);
				
                redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
                    if (redisres[1]>0) {
                        logger.info("Sending socket request for executeTestSuite to redis");
                        dataToIce = {"emitAction" : "executeTestSuite","username" : name, "executionRequest": executionRequest};
                        redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
                        var notifySocMap = myserver.socketMapNotify;
                        var resSent = false;
                        if(notifySocMap && notifySocMap[name]) {
                            resSent = true;
                            res.end('begin');
                        }
                        function executeTestSuite_listener(channel,message) {
                            data = JSON.parse(message);
                            if(name == data.username){
                                if (data.onAction == "unavailableLocalServer") {
                                    redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
                                    logger.error("Error occurred in ExecuteTestSuite_ICE: Socket Disconnected");
                                    if (notifySocMap[name]) notifySocMap[name].emit("ICEnotAvailable");
                                    else if (!resSent) res.send("unavailableLocalServer");
                                } else if (data.onAction == "result_executeTestSuite") {
                                    var resultData = data.value;
                                    if (resultData != "success" && resultData != "Terminate") {
                                        try {
                                            completedSceCount++;
                                            scenarioCount = executionRequest.suitedetails[testsuitecount].scenarioIds.length * executionRequest.suitedetails[testsuitecount].browserType.length;
                                            var scenarioid = resultData.scenarioId;
                                            var executionid = resultData.executionId;
                                            var reportdata = resultData.reportData;
                                            var testsuiteid = resultData.testsuiteId;
                                            if (reportdata.overallstatus.length != 0) {
                                                reportdata.overallstatus[0].browserType = (executionRequest.apptype=="MobileApp")?"MobileApp":reportdata.overallstatus[0].browserType;
                                                var req_browser = reportdata.overallstatus[0].browserType;
                                                reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
                                                reportdata = JSON.parse(reportdata);
												var cycleid = testsuiteidcycmap[testsuiteid]
                                                if (resultData.reportData.overallstatus[0].overallstatus == "Pass") {
                                                    statusPass++;
                                                }
                                                var inputs = {
                                                    //"reportid": reportId,
                                                    "executionid": executionid,
                                                    "testsuiteid": testsuiteid,
                                                    "testscenarioid": scenarioid,
                                                    "browser": req_browser,
                                                    "cycleid": testsuiteidcycmap[testsuiteid],
                                                    "status": resultData.reportData.overallstatus[0].overallstatus,
                                                    "report": JSON.stringify(reportdata),
													"query": "insertreportquery",
													"modifiedby":userInfo.userid
                                                };
                                                var args = {
                                                    data: inputs,
                                                    headers: {
                                                        "Content-Type": "application/json"
                                                    }
                                                };
                                                logger.info("Calling NDAC Service from executionFunction: suite/ExecuteTestSuite_ICE");
                                                client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
                                                    function (result, response) {
                                                    if (response.statusCode != 200 || result.rows == "fail") {
                                                        logger.error("Error occurred in suite/ExecuteTestSuite_ICE from executionFunction Error Code : ERRNDAC");
                                                        flag = "fail";
                                                    } else {
                                                        logger.info("Successfully inserted report data");
                                                        flag = "success";
                                                    }
                                                });
                                                if (completedSceCount == scenarioCount) {
                                                    if (statusPass == scenarioCount) {
                                                        suiteStatus = "pass";
                                                    } else {
                                                        suiteStatus = "fail";
                                                    }
                                                    completedSceCount = 0;
                                                    testsuitecount++;
                                                    logger.info("Calling function updateExecutionStatus from executionFunction");
                                                    updateExecutionStatus(testsuiteid, executionid, suiteStatus,cycleid);
                                                }
                                            } else {
                                                completedSceCount++;
                                                scenarioCount = executionRequest.suitedetails[testsuitecount].scenarioIds.length;
                                                if (completedSceCount == scenarioCount) {
                                                    completedSceCount = 0;
                                                    testsuitecount++;
                                                    suiteStatus = "fail";
                                                    logger.info("Calling function updateExecutionStatus from executionFunction");
                                                    updateExecutionStatus(testsuiteid, executionid, suiteStatus,cycleid);
                                                }
                                            }
                                        } catch (ex) {
                                            logger.error("Exception in the function executionFunction: insertreportquery: %s", ex);
                                        }
                                    }
                                    if (resultData == "success" || resultData == "Terminate") {
                                        redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
                                        try {
                                            logger.info("Sending execution status from function executionFunction");
                                            if (notifySocMap[name]) notifySocMap[name].emit("result_ExecutionDataInfo", resultData);
                                            else if (!resSent) res.send(resultData);
                                        } catch (ex) {
                                            logger.error("Exception While sending execution status from the function executionFunction: %s", ex);
                                        }
                                    }
                                }
                            }
                        }
                        redisServer.redisSubServer.on("message",executeTestSuite_listener);
                    } else {
                        utils.getChannelNum('ICE1_scheduling_' + name, function(found){
                            var flag="";
                            if (found) flag = "scheduleModeOn";
                            else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the function executionFunction: Socket not Available");
                            }
                            res.send(flag);
                        });
                    }
                });
                    
            }

        });

    } else {
        logger.error("Error occurred in the function executionFunction: Invalid Session");
        res.send("Invalid Session");
    }
}

exports.ExecuteTestSuite_ICE_SVN = function (req, res) {
	logger.info("Inside UI service: ExecuteTestSuite_ICE_CI");
	if (req.sessionStore.sessions != undefined) {
		session_list = req.sessionStore.sessions;
		if (Object.keys(session_list).length != 0) {
			var sessionCookie = session_list[req.body.session_id];
			var sessionToken = JSON.parse(sessionCookie).uniqueId;
			sessionToken = Object.keys(session_list)[Object.keys(session_list).length - 1];
		}
	}
	if (sessionToken != undefined && req.body.session_id == sessionToken) {
		var name = req.session.username;
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		var batchExecutionData = req.body.moduleInfo;
        var scenariodescriptionobject = {};
        var testsuitedetailslist = [],testsuiteidcycmap = {};
		var testsuitedetailslist = [];
		var testsuiteIds = [];
		var exc_action  = req.body.action;
		var executionRequest = {
			"executionId": "",
			"suitedetails": [],
			"testsuiteIds": [],
			"apptype": "",
			"exec_mode":exc_action
		};
		//updating number of executions happened
		var executionId = '';						
        async.series({
            approval_check:function(callback_E){
				// if (!taskflow) return callback_E();
				// utils.approval_status_check(batchExecutionData, function (err, approved_status) {
				// 	if (approved_status) callback_E();
				// 	else res.status(err.status).send(err.res);
                // });
                callback_E();
            },
			counter_updater:function(callback_E){

				//updating number of executions happened
				var batchlength = batchExecutionData.length;
				var updateinp = {
					"query": "testsuites",
					"count": batchlength,
					"userid": userInfo.userid
				};
				var args = {
					data: updateinp,
					headers: {
						"Content-Type": "application/json"
					}
                };
                logger.info("Calling NDAC Service: utility/dataUpdator_ICE from ExecuteTestSuite_ICE");
				// client.post(epurl + "utility/dataUpdator_ICE", args,
				// 	function (result, response) {
				// 	if (response.statusCode != 200 || result.rows == "fail") {
				// 		logger.error("Error occurred in utility/dataUpdator_ICE service from ExecuteTestSuite_ICE: Data Updator Fail");
				// 	} else {
				// 		logger.info("Data Updator Success");
                //     }
                    callback_E();
				// });
            },
            suite_execution:function(callback_E){
                async.forEachSeries(batchExecutionData, function (eachbatchExecutionData, batchExecutionDataCallback) {
                    var suiteDetails = eachbatchExecutionData.suiteDetails;
					var testsuitename = eachbatchExecutionData.testsuitename;
					var testsuiteid = eachbatchExecutionData.testsuiteid;
					var releaseid = eachbatchExecutionData.releaseid;
					var cycleid = eachbatchExecutionData.cycleid;			
					var browserType = eachbatchExecutionData.browserType;
					var apptype = eachbatchExecutionData.appType;
					var listofscenarioandtestcases = [];
					var scenarioIdList = [];
					var dataparamlist = [];
					var conditionchecklist = [];
                    var browserTypelist = [];
                    testsuiteIds.push(testsuiteid);
                    testsuiteidcycmap[testsuiteid] = cycleid;
                    async.forEachSeries(suiteDetails, function (eachsuiteDetails, eachsuiteDetailscallback) {
                        var executionjson = {
							"scenarioIds": [],
							"browserType": [],
							"dataparampath": [],
							"condition": [],
							"testsuitename": ""
                        };
                        var currentscenarioid = "";
						scenarioIdList.push(eachsuiteDetails.scenarioids);
						dataparamlist.push(eachsuiteDetails.dataparam[0]);
						conditionchecklist.push(eachsuiteDetails.condition);
						browserTypelist.push(eachsuiteDetails.browserType);
						currentscenarioid = eachsuiteDetails.scenarioids;
						executionjson.releaseid = releaseid;
                        executionjson.cycleid = cycleid;
                        scenariodescriptionobject[eachsuiteDetails.scenarioids] = eachsuiteDetails.scenariodescription;
                        TestCaseDetails_Suite_ICE(currentscenarioid, userInfo.userid, function (currentscenarioidError, currentscenarioidResponse) {
                            var scenariotestcaseobj = {};
							if (currentscenarioidError) {
								logger.error("Error occurred in the function TestCaseDetails_Suite_ICE: %s",currentscenarioidError);
							} else {
								if (currentscenarioidResponse != null || currentscenarioidResponse != undefined) {
									scenariotestcaseobj[currentscenarioid] = currentscenarioidResponse.listoftestcasedata;
									scenariotestcaseobj.qccredentials = eachsuiteDetails.qccredentials;
									scenariotestcaseobj.qcdetails = currentscenarioidResponse.qcdetails;
									listofscenarioandtestcases.push(scenariotestcaseobj);
									eachsuiteDetailscallback();
								}
								if (listofscenarioandtestcases.length == suiteDetails.length) {
									logger.info("Calling function updateData from TestCaseDetails_Suite_ICE function");
									executionjson[testsuiteid] = listofscenarioandtestcases;
                                    executionjson.scenarioIds = scenarioIdList;
                                    executionjson.browserType = browserType;
                                    executionjson.condition = conditionchecklist;
                                    executionjson.dataparampath = dataparamlist;
                                    executionjson.testsuiteid = testsuiteid;
                                    executionjson.testsuitename = testsuitename;
                                    executionjson.scenariodescriptionobject = scenariodescriptionobject;
                                    testsuitedetailslist.push(executionjson);
									batchExecutionDataCallback();
									if (testsuitedetailslist.length == batchExecutionData.length) {
                                        executionRequest.executionId = executionId;
                                        executionRequest.suitedetails = testsuitedetailslist;
                                        executionRequest.testsuiteIds = testsuiteIds;
                                        executionRequest.apptype = apptype;
										logger.info("Calling function executionFunction from TestCaseDetails_Suite_ICE function");
										callback_E();
									}
								}
							}
                        });
                    });

                }); 
            },
            execution_insertion:function(callback_E){
                 insertExecutionStatus(req.session.userid,function(res){
                    if(res == 'fail'){
						executionId = '';
                    }else{
						executionRequest.executionId = res;
                    }
                    callback_E();
				});
            },
            execute_function:function(callback_E){
                logger.info("Inside executionFunction function");
				var completedSceCount = 0;
				var testsuitecount=0;
				var statusPass = 0;
				var suiteStatus;
				logger.debug("ICE Socket requesting Address: %s" , name);
				
                redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
                    if (redisres[1]>0) {
                        logger.info("Sending socket request for executeTestSuite to redis");
                        dataToIce = {"emitAction" : "executeTestSuite","username" : name, "executionRequest": executionRequest};
                        redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
                        var notifySocMap = myserver.socketMapNotify;
                        var resSent = false;
                        if(notifySocMap && notifySocMap[name]) {
                            resSent = true;
                            res.end('begin');
                        }
                        function executeTestSuite_listener(channel,message) {
                            data = JSON.parse(message);
                            if(name == data.username){
                                if (data.onAction == "unavailableLocalServer") {
                                    redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
                                    logger.error("Error occurred in ExecuteTestSuite_ICE: Socket Disconnected");
                                    if (notifySocMap[name]) notifySocMap[name].emit("ICEnotAvailable");
                                    else if (!resSent) res.send("unavailableLocalServer");
                                } else if (data.onAction == "result_executeTestSuite") {
                                    var resultData = data.value;
                                    if (resultData != "success" && resultData != "Terminate") {
                                        try {
                                            completedSceCount++;
                                            scenarioCount = executionRequest.suitedetails[testsuitecount].scenarioIds.length * executionRequest.suitedetails[testsuitecount].browserType.length;
                                            var scenarioid = resultData.scenarioId;
                                            var executionid = resultData.executionId;
                                            var reportdata = resultData.reportData;
                                            var testsuiteid = resultData.testsuiteId;
                                            if (reportdata.overallstatus.length != 0) {
                                                reportdata.overallstatus[0].browserType = (executionRequest.apptype=="MobileApp")?"MobileApp":reportdata.overallstatus[0].browserType;
                                                var req_browser = reportdata.overallstatus[0].browserType;
                                                reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
												reportdata = JSON.parse(reportdata);
												var cycleid = testsuiteidcycmap[testsuiteid];
                                                if (resultData.reportData.overallstatus[0].overallstatus == "Pass") {
                                                    statusPass++;
                                                }
                                                var inputs = {
                                                    //"reportid": reportId,
                                                    "executionid": executionid,
                                                    "testsuiteid": testsuiteid,
                                                    "testscenarioid": scenarioid,
                                                    "browser": req_browser,
                                                    "cycleid": testsuiteidcycmap[testsuiteid],
                                                    "status": resultData.reportData.overallstatus[0].overallstatus,
                                                    "report": JSON.stringify(reportdata),
													"query": "insertreportquery",
													"modifiedby":userInfo.userid
                                                };
                                                var args = {
                                                    data: inputs,
                                                    headers: {
                                                        "Content-Type": "application/json"
                                                    }
                                                };
                                                logger.info("Calling NDAC Service from executionFunction: suite/ExecuteTestSuite_ICE");
                                                client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
                                                    function (result, response) {
                                                    if (response.statusCode != 200 || result.rows == "fail") {
                                                        logger.error("Error occurred in suite/ExecuteTestSuite_ICE from executionFunction Error Code : ERRNDAC");
                                                        flag = "fail";
                                                    } else {
                                                        logger.info("Successfully inserted report data");
                                                        flag = "success";
                                                    }
                                                });
                                                if (completedSceCount == scenarioCount) {
                                                    if (statusPass == scenarioCount) {
                                                        suiteStatus = "pass";
                                                    } else {
                                                        suiteStatus = "fail";
                                                    }
                                                    completedSceCount = 0;
                                                    testsuitecount++;
                                                    logger.info("Calling function updateExecutionStatus from executionFunction");
                                                    updateExecutionStatus(testsuiteid, executionid, suiteStatus,cycleid);
                                                }
                                            } else {
                                                completedSceCount++;
                                                scenarioCount = executionRequest.suitedetails[testsuitecount].scenarioIds.length;
                                                if (completedSceCount == scenarioCount) {
                                                    completedSceCount = 0;
                                                    testsuitecount++;
                                                    suiteStatus = "Fail";
                                                    logger.info("Calling function updateExecutionStatus from executionFunction");
                                                    updateExecutionStatus(testsuiteid, executionid, suiteStatus,cycleid);
                                                }
                                            }
                                        } catch (ex) {
                                            logger.error("Exception in the function executionFunction: insertreportquery: %s", ex);
                                        }
                                    }
                                    if (resultData == "success" || resultData == "Terminate") {
                                        redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
                                        try {
                                            logger.info("Sending execution status from function executionFunction");
                                            if (notifySocMap[name]) notifySocMap[name].emit("result_ExecutionDataInfo", resultData);
                                            else if (!resSent) res.send(resultData);
                                        } catch (ex) {
                                            logger.error("Exception While sending execution status from the function executionFunction: %s", ex);
                                        }
                                    }
                                }
                            }
                        }
                        redisServer.redisSubServer.on("message",executeTestSuite_listener);
                    } else {
                        utils.getChannelNum('ICE1_scheduling_' + name, function(found){
                            var flag="";
                            if (found) flag = "scheduleModeOn";
                            else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the function executionFunction: Socket not Available");
                            }
                            res.send(flag);
                        });
                    }
                });
                    
            }

        });
	} else {
		logger.error("Error occurred in the function executionFunction in ExecuteTestSuite_ICE_CI: Invalid Session");
		res.send("Invalid Session");
	}
};


function  insertExecutionStatus(executedby,callback) {
	logger.info("Inside updateExecutionStatus function");
	var inputs = {
		"executedby": executedby, 
		"status": "inprogress",
		"query": "inserintotexecutionquery"
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from updateExecutionStatus function");
	client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
		function (result, response) {
		if (response.statusCode != 200 || result.rows == "fail") {
			logger.error("Error occurred in updateExecutionStatus: suite/ExecuteTestSuite_ICE, Error Code : ERRNDAC");
            flag = "fail";
            callback(flag);
		} else {
			logger.info("Execution status updated successfully from updateExecutionStatus: suite/ExecuteTestSuite_ICE");
            flag = result.rows;
            callback(flag);
		}
	});
}

//Update execution table on completion of suite execution
function updateExecutionStatus(testsuiteid, executionid, suiteStatus,cycleid) {
	logger.info("Inside insertExecutionStatus function");
	var inputs = {
		"status": suiteStatus,
		"testsuiteid":testsuiteid,
		"executionid":executionid,
		"cycleid":cycleid,
		"query": "updateintotexecutionquery"
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from updateExecutionStatus function");
	client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
		function (result, response) {
		if (response.statusCode != 200 || result.rows == "fail") {
			logger.error("Error occurred in updateExecutionStatus: suite/ExecuteTestSuite_ICE, Error Code : ERRNDAC");
            flag = "fail";
		} else {
			logger.info("Execution status updated successfully from updateExecutionStatus: suite/ExecuteTestSuite_ICE");
            flag = "success";
		}
	});
}

function TestCaseDetails_Suite_ICE(req, userid, cb, data) {
	logger.info("Inside TestCaseDetails_Suite_ICE function");
	var requestedtestscenarioid = req;
	var data = [];
	var resultdata = '';
	var qcdetails = {};
	var listoftestcasedata = [];
	async.series({
		testcaseid: function (callback) {
			var inputs = {
				"id": requestedtestscenarioid,
				"query": "testcaseid",
				"userid": userid
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcaseid");
			client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcaseid, Error Code : ERRNDAC");
				} else {
					if (result.rows.length != 0) {
						data = JSON.parse(JSON.stringify(result.rows[0].testcaseids));
					}
					resultdata = data;
					callback(null, resultdata);
				}
			});
		},
		testcasesteps: function (callback) {
			async.forEachSeries(resultdata, function (quest, callback2) {
				var responsedata = {
					template: "",
					testcase: [],
					testcasename: ""
				};
				var inputs = {
					"id": quest,
					"query": "testcasesteps",
					"userid": userid
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasesteps");
				client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
					function (screenidresponse, response) {
					if (response.statusCode != 200 || screenidresponse.rows == "fail") {
						logger.error("Error occurred in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasesteps, Error Code : ERRNDAC");
					} else {
						try {
							if (screenidresponse.rows.length != 0) {
								var screenid = screenidresponse.rows[0].screenid;
								var versionnumber = screenidresponse.rows[0].versionnumber;
								var inputs = {
									"screenid": screenidresponse.rows[0].screenid,
									"query": "getscrapedata"
								};
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - getscreendataquery");
								client.post(epurl + "design/getScrapeDataScreenLevel_ICE", args,
									function (screendataresponse, response) {
									if (response.statusCode != 200 || screendataresponse.rows == "fail") {
										logger.error("Error occurred in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - getscreendataquery, Error Code : ERRNDAC");
									} else {
										try {
											try {
												screendataresponse = JSON.parse(screendataresponse.rows);
											} catch (exception) {
												screendataresponse = JSON.parse("{}");
											}
											if (screendataresponse != null && screendataresponse != "") {
												if ('body' in screendataresponse) {
													var wsscreentemplate = screendataresponse.body[0];
													var inputs = {
														"testcaseid": quest,
														"screenid":screenid,
														"versionnumber":versionnumber,
														"query": "testcasestepsquery"
													};
													var args = {
														data: inputs,
														headers: {
															"Content-Type": "application/json"
														}
													};
													logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery");
													client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
														function (answers, response) {
														if (response.statusCode != 200 || answers.rows == "fail") {
															logger.error("Error occurred in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery, Error Code : ERRNDAC");
														} else {
															responsedata.template = wsscreentemplate;
															if (answers.rows.length != 0) {
																responsedata.testcasename = answers.rows[0].name;
																responsedata.testcase = answers.rows[0].steps;
															}
															listoftestcasedata.push(responsedata);
														}
														callback2();
													});
												} else {
													var inputs = {
														"testcaseid": quest,
														"screenid":screenid,
														"versionnumber":versionnumber,
														"query": "readtestcase"
													};
													var args = {
														data: inputs,
														headers: {
															"Content-Type": "application/json"
														}
													};
													logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery");
													client.post(epurl + "design/readTestCase_ICE", args,
														function (answers, response) {
														if (response.statusCode != 200 || answers.rows == "fail") {
															logger.error("Error occurred in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery, Error Code : ERRNDAC");
														} else {
															responsedata.template = "";
															if (answers.rows.length != 0) {
																responsedata.testcasename = answers.rows[0].name;
																responsedata.testcase = answers.rows[0].steps;
															}
															listoftestcasedata.push(responsedata);
														}
														callback2();
													});
												}
											} else {
												var inputs = {
													"screenid":screenid,
													"testcaseid": quest,
													"versionnumber":versionnumber,
													"query": "readtestcase"
												};
												var args = {
													data: inputs,
													headers: {
														"Content-Type": "application/json"
													}
												};
												logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery");
												client.post(epurl + "suite/design/readTestCase_ICE", args,
													function (answers, response) {
													if (response.statusCode != 200 || answers.rows == "fail") {
														logger.error("Error occurred in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery, Error Code : ERRNDAC");
													} else {
														responsedata.template = "";
														if (answers.rows.length != 0) {
															responsedata.testcasename = answers.rows[0].name;
															responsedata.testcase = answers.rows[0].steps;
														}
														listoftestcasedata.push(responsedata);
													}
													callback2();
												});
											}
										} catch (exception) {
											var inputs = {
												"testcaseid": quest,
												"query": "readtestcase"
											};
											var args = {
												data: inputs,
												headers: {
													"Content-Type": "application/json"
												}
											};
											logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery");
											client.post(epurl + "design/readTestCase_ICE", args,
												function (answers, response) {
												if (response.statusCode != 200 || answers.rows == "fail") {
													logger.error("Error occurred in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery, Error Code : ERRNDAC");
												} else {
													responsedata.template = "";
													if (answers.rows.length != 0) {
														responsedata.testcasename = answers.rows[0].testcasename;
														responsedata.testcase = answers.rows[0].testcasesteps;
													}
													listoftestcasedata.push(responsedata);
												}
												callback2();
											});
										}
									}
								});

							} else {
								var inputs = {
									"testcaseid": quest,
									"query": "readtestcase"
								};
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery");
								client.post(epurl + "design/readTestCase_ICE", args,
									function (answers, response) {
									if (response.statusCode != 200 || answers.rows == "fail") {
										logger.error("Error occurred in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery, Error Code : ERRNDAC");
									} else {
										responsedata.template = "";
										if (answers.rows.length != 0) {
											responsedata.testcasename = answers.rows[0].testcasename;
											responsedata.testcase = answers.rows[0].testcasesteps;
										}
										listoftestcasedata.push(responsedata);
									}
									callback2();
								});
							}
						} catch (exception) {
							logger.error("Exception occurred in TestCaseDetails_Suite_ICE : %s", exception);
						}
					}
				});
			}, callback);
		},

		qcscenariodetails: function (callback) {
			logger.info("Inside qcscenariodetails function");
			var inputs = {
				"testscenarioid": requestedtestscenarioid,
				"query": "qcdetails"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service: qualityCenter/viewQcMappedList_ICE from qcscenariodetails");
			// client.post(epurl + "qualityCenter/viewQcMappedList_ICE", args,
			// 	function (qcdetailsows, response) {
			// 	if (response.statusCode != 200 || qcdetailsows.rows == "fail") {
			// 		logger.error("Error occurred in qualityCenter/viewQcMappedList_ICE from qcscenariodetails Error Code : ERRNDAC");
			// 	} else {

			// 		if (qcdetailsows.rows.length != 0) {
			// 			flagtocheckifexists = true;
			// 			qcdetails = JSON.parse(JSON.stringify(qcdetailsows.rows[0]));
			// 		}
			// 	}
				callback(null, qcdetails);
			// });
		}
	},
	function (err, results) {
		logger.info("Inside final function of TestCaseDetails_Suite_ICE");
		var obj = {
			"listoftestcasedata": JSON.stringify(listoftestcasedata),
			"qcdetails": qcdetails
		};
		if (err) {
			logger.error("Error occurred in the final function of TestCaseDetails_Suite_ICE");
			cb(err);
		} else {
			logger.info("Sending testcase data and QC details from final function of TestCaseDetails_Suite_ICE");
			cb(null, obj);
		}
	});
}

//ExecuteTestSuite Functionality
/**
 * Service to fetch all the testcase,screen and project names for provided scenarioid
 * @author Shreeram
 */
exports.getTestcaseDetailsForScenario_ICE = function (req, res) {
	logger.info("Inside Ui service getTestcaseDetailsForScenario_ICE");
	// if (utils.isSessionActive(req)) {
		var requiredtestscenarioid={
			"requiredtestscenarioid":req.body.testScenarioId,
			"userid":req.session.userid
		}
		logger.info("Calling function testcasedetails_testscenarios from getTestcaseDetailsForScenario_ICE");
		testcasedetails_testscenarios(requiredtestscenarioid, function (err, data) {
			if (err) {
				logger.error("Error occurred in the testcasedetails_testscenarios function of getTestcaseDetailsForScenario_ICE");
				res.send("fail");
			} else {
				try {
					logger.info("Sending response data from testcasedetails_testscenarios function of getTestcaseDetailsForScenario_ICE");
					res.send(JSON.stringify(data));
				} catch (ex) {
					logger.error("Exception occurred in getTestcaseDetailsForScenario_ICE: %s", ex);
				}
			}
		});
	// } else {
	// 	logger.error("Error occurred in the testcasedetails_testscenarios: Invalid Session");
	// 	res.send("Invalid Session");
	// }
};

//Function to fetch all the testcase,screen and project names for provided scenarioid
function testcasedetails_testscenarios(req, cb) {
	logger.info("Inside testcasedetails_testscenarios function");
	var userid =req.userid;
	var testcaseids = [];
	var screenidlist = [];
	var testcasenamelist = [];
	var screennamelist = [];
	var projectidlist = [];
	var projectnamelist = [];
	async.series({
		testcaseid: function (callback) {
			var inputs = {
				"id": req.requiredtestscenarioid,
				"query": "testcaseid",
				"userid": userid
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcaseid");
			client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcaseid, Error Code : ERRNDAC");
				} else {
					if (result.rows.length != 0) {
						testcaseids = JSON.parse(JSON.stringify(result.rows[0].testcaseids));
					}
					callback(null, testcaseids);
				}
			});
		},
		testcasetable: function (callback) {
			async.forEachSeries(testcaseids, function (itr, callback2) {
				var inputs = {
					"query": "testcasesteps",
					"id": itr
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from testcasedetails_testscenarios - testcasetable: suite/getTestcaseDetailsForScenario_ICE");
				client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
					function (testcaseresult, response) {
					if (response.statusCode != 200 || testcaseresult.rows == "fail") {
						logger.error("Error occurred in suite/getTestcaseDetailsForScenario_ICE from testcasedetails_testscenarios - testcasesteps, Error Code : ERRNDAC");
					} else {
						if (testcaseresult.rows.length != 0) {
							testcasenamelist.push(testcaseresult.rows[0].name);
							screenidlist.push(testcaseresult.rows[0].screenid);
						}
					}
					callback2();
				});
			}, callback);
		},
		screentable: function (callback) {
			async.forEachSeries(screenidlist, function (screenitr, callback3) {
				var inputs = {
					"query": "screentable",
					"screenid": screenitr
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from testcasedetails_testscenarios - screentable: suite/getTestcaseDetailsForScenario_ICE");
				client.post(epurl + "suite/getTestcaseDetailsForScenario_ICE", args,
					function (screenresult, response) {
					if (response.statusCode != 200 || screenresult.rows == "fail") {
						logger.error("Error occurred in suite/getTestcaseDetailsForScenario_ICE from testcasedetails_testscenarios - screentable, Error Code : ERRNDAC");
					} else {
						if (screenresult.rows.length != 0) {
							screennamelist.push(screenresult.rows[0].name);
							projectidlist.push(screenresult.rows[0].projectid);
						}
					}
					callback3();
				});
			}, callback);
		},
		projecttable: function (callback) {
			async.forEachSeries(projectidlist, function (projectitr, callback4) {
				var inputs = {
					"query": "projecttable",
					"projectid": projectitr
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from testcasedetails_testscenarios - projecttable: suite/getTestcaseDetailsForScenario_ICE");
				client.post(epurl + "suite/getTestcaseDetailsForScenario_ICE", args,
					function (projectresult, response) {
					if (response.statusCode != 200 || projectresult.rows == "fail") {
						logger.error("Error occurred in suite/getTestcaseDetailsForScenario_ICE from testcasedetails_testscenarios - projecttable, Error Code : ERRNDAC");
					} else {
						if (projectresult.rows.length != 0)
							projectnamelist.push(projectresult.rows[0].name);
					}
					callback4();
				});
			}, callback);
		}
	}, function (err) {
		logger.info("Inside final function of testcasedetails_testscenarios");
		if (err) {
			logger.error("Error occurred in final function of testcasedetails_testscenarios: %s", err);
			cb(err, "fail");
		} else {
			var resultdata = {
				testcasenames: [],
				testcaseids: [],
				screennames: [],
				screenids: [],
				projectnames: [],
				projectids: []
			};
			resultdata.testcasenames = testcasenamelist;
			resultdata.testcaseids = testcaseids;
			resultdata.screennames = screennamelist;
			resultdata.screenids = screenidlist;
			resultdata.projectnames = projectnamelist;
			resultdata.projectids = projectidlist;
			logger.info("Sending response data from final function of testcasedetails_testscenarios");
			cb(err, resultdata);
		}
	});
}



/***********************Scheduling jobs***************************/
exports.testSuitesScheduler_ICE = function (req, res) {
	logger.info("Inside UI service testSuitesScheduler_ICE");
	if (utils.isSessionActive(req)) {
		var ExecutionData=req.body.moduleInfo;
		if(taskflow){
			// utils.approval_status_check(ExecutionData, function (err, approved) {
			// 	if (approved) testSuitesScheduler_ICE_cb(req,res);
			// 	else {
			// 		res.status(err.status).send(err.res);
			// 	}
			// });
		}else{
			testSuitesScheduler_ICE_cb(req,res);
		}
	} else {
		logger.error("Error in the service testSuitesScheduler_ICE: Invalid Session");
		res.send("Invalid Session");
	}
};
		
function testSuitesScheduler_ICE_cb (req, res) {
	if(req.body.chkType == "schedule"){			
		var modInfo = req.body.moduleInfo;
		var exc_action = req.body.action;
		logger.info("Calling function scheduleTestSuite from testSuitesScheduler_ICE");
		scheduleTestSuite(modInfo,exc_action, req, function (err, schedulecallback) {
			try {
				logger.info("TestSuite Scheduled successfully");
				res.send(schedulecallback);
			} catch (exception) {
				logger.error("Exception in the service testSuitesScheduler_ICE: %s",exception);
				res.send("fail");
			}
		});
	}
	else{
		var data = req.body.details;
		var inputs = {
			"scheduledatetime": data.curDate,
			"clientipaddress": data.clientipaddress,
			"scheduledetails": "checkscheduleddetails",
			"query": "getallscheduledetails"
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling NDAC Service from testSuitesScheduler_ICE: suite/ScheduleTestSuite_ICE");
		client.post(epurl + "suite/ScheduleTestSuite_ICE", args,
			function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in suite/ScheduleTestSuite_ICE from testSuitesScheduler_ICE service, Error Code : ERRNDAC");
					res.send("fail");
				} else {
					res.send(result.rows);
				}
		});
	}
};

//Schedule Testsuite normal and when server restart
function  scheduleTestSuite  (modInfo, exc_action, req, schedcallback) {
	logger.info("Inside scheduleTestSuite function");
	var schedulingData = modInfo;
	var action = exc_action;
	var schDate, schTime, cycleId, scheduleId, clientIp, scenarioDetails;
	var browserList, testSuiteId;

	var schedFlag,rescheduleflag;
	var counter = 0;
	async.forEachSeries(schedulingData, function (itr, Callback) {
		schDate = itr.date;
		schDate = schDate.split("-");
		schTime = itr.time;
		schTime = schTime.split(":");
		rescheduleflag = itr.reschedule;
		//var dateTime = rescheduleflag != true ? new Date(Date.UTC(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1], 0)) : new Date(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1], 0);
		var dateTime = new Date(Date.UTC(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1], 0));
		//cycleId = itr.cycleid;		
		browserList = itr.browserType;
		clientIp = itr.Ip;
		scheduleStatus = "scheduled";
		testSuiteId = itr.testsuiteid;
		testSuitename = itr.testsuitename;
		versionnumber = itr.versionnumber;
		scenarioDetails = itr.suiteDetails;
		var sessObj;
		//Normal scheduling
		if (rescheduleflag != true) {
			scheduleId = uuid();
			sessObj = cycleId + ";" + scheduleId + ";" + dateTime.valueOf().toString();
			var inputs = {
				//"cycleid": cycleId,
				"scheduledatetime": dateTime.valueOf().toString(),
				"scheduleid": scheduleId,
				"browserlist": browserList,
				"clientipaddress": clientIp,
				"userid": schedulingData[0].userInfo.user_id,
				"scenariodetails": JSON.stringify(scenarioDetails),
				"schedulestatus": scheduleStatus,
				"testsuiteids": [testSuiteId],
				"testsuitename": testSuitename,
				"query": "insertscheduledata"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			try {
				logger.info("Calling NDAC Service from scheduleTestSuite: suite/ScheduleTestSuite_ICE");
				client.post(epurl + "suite/ScheduleTestSuite_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in suite/ScheduleTestSuite_ICE from scheduleTestSuite Error Code : ERRNDAC");
						schedFlag = "fail";
						schedcallback(null, schedFlag);
					} else {
						var obj = new Date(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1]);
						try {
							var scheduledjob = schedule.scheduleJob(sessObj, obj, function () {
								logger.info("Calling function executeScheduling from scheduleTestSuite");
								executeScheduling(sessObj, action, schedulingData, req);
								Callback();
							});
							counter++;
							//Callback();
						} catch (ex) {
							logger.error("Exception in the function executeScheduling from scheduleTestSuite: %s", ex);
							scheduleStatus = "Failed 02";
							logger.info("Calling function updateStatus from scheduleTestSuite");
							updateStatus(sessObj, function (err, data) {
								if (!err) {
									logger.info("Scheduling status updated successfully", data);
								}
								Callback();
							});
						}
					}
				});
			} catch (exception) {
				logger.error("Exception in the function executeScheduling from scheduleTestSuite: Normal scheduling: %s", exception);
				schedFlag = "fail";
				schedcallback(null, schedFlag);
			}
		} else {
			//Rescheduling jobs on server restart
			scheduleId = itr.scheduleid;
			sessObj = scheduleId + ";" + dateTime.valueOf().toString();
			var obj = new Date(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1], 0); //new Date(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1], 0);
			try {
				var scheduledjob = schedule.scheduleJob(sessObj, obj, function () {
					logger.info("Calling function executeScheduling from scheduleTestSuite: reshedule");
					executeScheduling(sessObj, schedulingData, req);
					Callback();
				});
				counter++;
			} catch (ex) {
				logger.error("Exception in the function executeScheduling from scheduleTestSuite: reshedule: %s", ex);
				scheduleStatus = "Failed 02";
				updateStatus(sessObj, function (err, data) {
					if (!err) {
						logger.info("Scheduling status updated successfully", data);
						
					}
					Callback();
				});
			}
		}
	}, function () {
		logger.info("Inside final function of executeScheduling");
		// if (deleteFlag != true) doneFlag = 1;
		// if (doneFlag == 1) {
		if (schedulingData.length == counter) {
			schedFlag = "success";
			schedcallback(null, schedFlag);
		} else if (counter > 0) {
			schedFlag = "few";
			schedcallback(null, schedFlag);
		} else if (counter == 0) {
			schedFlag = "fail";
			schedcallback(null, schedFlag);
		}
		// }
	});

	//Executing test suites on scheduled time
	// function executeScheduling(sessObj, action, schedulingData, req) {
	// 	logger.info("Inside executeScheduling function");
	// 	var inputs = {
	// 		"cycleid": sessObj.split(";")[0],
	// 		"scheduledatetime": sessObj.split(";")[2],
	// 		"scheduleid": sessObj.split(";")[1],
	// 		"query": "getscheduledata"
	// 	};
	// 	var args = {
	// 		data: inputs,
	// 		headers: {
	// 			"Content-Type": "application/json"
	// 		}
	// 	};
	// 	var executionRequest = {
	// 		"exec_mode" : action,
	// 		"executionId": "",
	// 		"suitedetails": [],
	// 		"testsuiteIds": []
	// 	};
	// 	var result = ''
	// 	async.series({
	// 		schedule_suite:function(callback_E){
	// 			logger.info("Calling NDAC Service from executeScheduling: suite/ScheduleTestSuite_ICE");
	// 			client.post(epurl + "suite/ScheduleTestSuite_ICE", args,
	// 				function (result, response) {
	// 				if (response.statusCode != 200 || result.rows == "fail") {
	// 					logger.error("Error occurred in suite/ScheduleTestSuite_ICE from executeScheduling Error Code : ERRNDAC");
	// 					scheduleStatus = "Failed 02";
	// 					logger.info("Calling function updateStatus from executeScheduling");
	// 					updateStatus(sessObj, function (err, data) {
	// 						if (!err) {
	// 							logger.info("Scheduling status updated successfully", data);
	// 						}
	// 					});
	// 					// deleteFlag = true;
	// 					// deleteScheduledData(deleteFlag, sessObj)
						
	// 					callback_E();
	// 				}else{
	// 					result = result;
	// 					callback_E()
	// 				}
	// 			})
	// 		},suite_execution:function(callback_E){
	// 			if (result.rows[0].schedulestatus == "scheduled") {
	// 				var suiteDetails = JSON.parse(result.rows[0].scenariodetails);
	// 				var testsuitedetailslist = [];
	// 				var testsuiteid = JSON.parse(JSON.stringify(result.rows[0].testsuiteids))[0];
	// 				var testsuitenm = result.rows[0].testsuitename;
	// 				var browserType = JSON.parse(result.rows[0].browserlist);
	// 				var scenarioIdList = [];
	// 				var dataparamlist = [];
	// 				var conditionchecklist = [];
	// 				var browserTypelist = [];
	// 				var listofscenarioandtestcases = [];
	// 				var appType;
					
	// 				async.forEachSeries(suiteDetails, function (eachsuiteDetails, eachsuiteDetailscallback) {
	// 					var executionjson = {
	// 						"scenarioIds": [],
	// 						"browserType": [],
	// 						"dataparampath": [],
	// 						"condition": [],
	// 						"testsuitename": ""
	// 					};
	// 					var currentscenarioid = "";
	// 					scenarioIdList.push(eachsuiteDetails.scenarioids);
	// 					dataparamlist.push(eachsuiteDetails.dataparam[0]);
	// 					conditionchecklist.push(eachsuiteDetails.condition);
	// 					browserTypelist = browserType;
	// 					currentscenarioid = eachsuiteDetails.scenarioids;
	// 					appType = eachsuiteDetails.appType;
	// 					logger.info("Calling function TestCaseDetails_Suite_ICE from executeScheduling");
	// 					var uid = rescheduleflag != true ? schedulingData[0].userInfo.user_id : schedulingData[0].userid;
	// 					TestCaseDetails_Suite_ICE(currentscenarioid, uid, function (currentscenarioidError, currentscenarioidResponse) {
	// 						var scenariotestcaseobj = {};
	// 						if (currentscenarioidError) {
	// 							logger.error("Error occurred in the function TestCaseDetails_Suite_ICE from executeScheduling Error Code - ERRNDAC: %s", currentscenarioidError);
	// 						} else {
	// 							if (currentscenarioidResponse != null || currentscenarioidResponse != undefined) {
	// 								scenariotestcaseobj[currentscenarioid] = currentscenarioidResponse.listoftestcasedata;
	// 								scenariotestcaseobj.qccredentials = eachsuiteDetails.qccredentials;
	// 								scenariotestcaseobj.qcdetails = currentscenarioidResponse.qcdetails;
	// 								listofscenarioandtestcases.push(scenariotestcaseobj);
	// 								eachsuiteDetailscallback();
	// 							}
	// 							if (listofscenarioandtestcases.length == suiteDetails.length) {
	// 								logger.info("Calling updateData function TestCaseDetails_Suite_ICE from executeScheduling");
	// 								executionjson[testsuiteid] = listofscenarioandtestcases;
	// 								executionjson.scenarioIds = scenarioIdList;
	// 								executionjson.browserType = browserTypelist;
	// 								executionjson.condition = conditionchecklist;
	// 								executionjson.dataparampath = dataparamlist;
	// 								executionjson.testsuiteid = testsuiteid;
	// 								executionjson.testsuitename = testsuitenm;
	// 								testsuitedetailslist.push(executionjson);
	// 								executionRequest.executionId = JSON.parse(JSON.stringify(result.rows[0].scheduleid));
	// 								executionRequest.suitedetails = testsuitedetailslist;
	// 								executionRequest.testsuiteIds.push(testsuiteid);
	// 								executionRequest.apptype = appType;
	// 								//batchExecutionDataCallback();
	// 								logger.info("Calling scheduleFunction function TestCaseDetails_Suite_ICE from executeScheduling");
	// 								callback_E()
	// 							}
	// 						}
	// 					});
						
	// 				});
					
					
	// 			}


	// 		},
	// 		execution_insertion:function(callback_E){ 
	// 			insertExecutionStatus(req.session.userid,function(res){
	// 			   if(res == 'fail'){
	// 				   executionId = '';
	// 			   }else{
	// 				   executionRequest.executionId = res;
	// 			   }
	// 			   callback_E();
	// 		   });
	// 	   },execute_function:function(callback_E){
	// 		// function scheduleFunction(executionRequest) {
	// 			logger.info("Inside scheduleFunction function of executeScheduling");
	// 			var name = ipAdd;
	// 			redisServer.redisSubServer.subscribe('ICE2_' + name);	
	// 			//var scenarioCount_s = executionRequest.suitedetails[0].scenarioIds.length;
	// 			var completedSceCount_s = 0;
	// 			var testsuitecount_s = 0;
	// 			var statusPass_s = 0;
	// 			var suiteStatus_s;
	// 			logger.debug("ICE Socket requesting Address: %s" , name);
	// 			redisServer.redisPubICE.pubsub('numsub','ICE1_scheduling_' + name,function(err,redisres){
	// 				if (redisres[1]>0) {
	// 					logger.info("Sending socket request for executeTestSuite:scheduling to redis");
	// 					dataToIce = {"emitAction" : "executeTestSuite","username" : name, "executionRequest": executionRequest};
	// 					redisServer.redisPubICE.publish('ICE1_scheduling_' + name,JSON.stringify(dataToIce));
	// 					var starttime = new Date().getTime();
	// 					function executeTestSuite_listener(channel,message) {
	// 						data = JSON.parse(message);
	// 						if(name == data.username){
	// 							if (data.onAction == "return_status_executeTestSuite") {
	// 								var response = data.value;
	// 								if(response.status == "success"){
	// 									scheduleStatus = "Inprogress";
	// 									logger.info("Calling function updateStatus from scheduleFunction");
	// 									updateStatus(sessObj, function (err, data) {
	// 										if (!err) {
	// 											logger.info("Sending response data from scheduleFunction");
	// 										}
	// 									});
	// 								}
	// 								else if(response.status == "skipped"){
	// 									scheduleStatus = "Inprogress";
	// 									logger.info("Calling function updateSkippedScheduleStatus from scheduleFunction");
	// 									var sessobj_new = sessObj + ';Skipped;' +  JSON.stringify(result.rows[0]) + ';' +JSON.stringify(response.data);
	// 									var msg = "The scenario was skippped due to conflicting schedules.";
	// 									updateSkippedScheduleStatus(sessobj_new, msg, function (err, data){
	// 										if(!err){
	// 											logger.info("Sending response data from scheduleFunction");
	// 										}
	// 									});
	// 								}
	// 							} else if (data.onAction == "result_executeTestSuite") {
	// 								var resultData = data.value;
	// 								if (resultData != "success" && resultData != "Terminate") {
	// 									//completedSceCount_s++;
	// 									//scenarioCount_s = executionRequest.suitedetails[testsuitecount_s].scenarioIds.length;
	// 									try {
	// 										completedSceCount_s++;
	// 										scenarioCount_s = executionRequest.suitedetails[testsuitecount_s].scenarioIds.length  * executionRequest.suitedetails[testsuitecount_s].browserType.length;
	// 										var scenarioid = resultData.scenarioId;
	// 										var executionid = resultData.executionId;
	// 										var reportdata = resultData.reportData;
	// 										var testsuiteid = resultData.testsuiteId;
	// 										var req_report = resultData.reportdata;
	// 										var req_reportStepsArray = reportdata.rows;
	// 										if (reportdata.overallstatus.length != 0) {
	// 											var req_overAllStatus = reportdata.overallstatus;
	// 											var req_browser = reportdata.overallstatus[0].browserType;
	// 											reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
	// 											reportdata = JSON.parse(reportdata);
	// 											var reportId = uuid();
	// 											if (resultData.reportData.overallstatus[0].overallstatus == "Pass") {
	// 												statusPass_s++;
	// 											}
	// 											var inputs = {
	// 												"reportid": reportId,
	// 												"executionid": executionid,
	// 												"testsuiteid": testsuiteid,
	// 												"testscenarioid": scenarioid,
	// 												"browser": req_browser,
	// 												"cycleid":result.rows[0].cycleid,
	// 												"status": resultData.reportData.overallstatus[0].overallstatus,
	// 												"report": JSON.stringify(reportdata),
	// 												"query": "insertreportquery"
	// 											};
	// 											var args = {
	// 												data: inputs,
	// 												headers: {
	// 													"Content-Type": "application/json"
	// 												}
	// 											};
	// 											logger.info("Calling NDAC Service from scheduleFunction: suite/ExecuteTestSuite_ICE");
	// 											client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
	// 												function (result, response) {
	// 												if (response.statusCode != 200 || result.rows == "fail") {
	// 													logger.error("Error occurred in suite/ExecuteTestSuite_ICE from scheduleFunction, Error Code : ERRNDAC");
	// 													flag = "fail";
	// 												} else {
	// 													flag = "success";
	// 												}
	// 											});
	// 											if (completedSceCount_s == scenarioCount_s) {
	// 												if (statusPass_s == scenarioCount_s) {
	// 													suiteStatus_s = "pass";
	// 												} else {
	// 													suiteStatus_s = "fail";
	// 												}
	// 												completedSceCount_s = 0;
	// 												testsuitecount_s++;
	// 												logger.info("Calling function updateSchedulingStatus from scheduleFunction");
	// 												updateSchedulingStatus(testsuiteid, executionid, starttime, suiteStatus_s);
	// 											}
	// 										} else {
	// 											completedSceCount_s++;
	// 											scenarioCount_s = executionRequest.suitedetails[testsuitecount_s].scenarioIds.length;
	// 											if (completedSceCount_s == scenarioCount_s) {
	// 												suiteStatus_s = "Fail";
	// 												completedSceCount_s = 0;
	// 												testsuitecount_s++;
	// 												logger.info("Calling function updateExecutionStatus from scheduleFunction");
	// 												updateExecutionStatus(testsuiteid, executionid, starttime, suiteStatus_s);
	// 											}
	// 										}
	// 									} catch (ex) {
	// 										logger.error("Exception occurred in the scheduleFunction: %s", ex);
	// 									}
	// 								}
	// 								else if (resultData) {
	// 									if (typeof(resultData) == "string") {
	// 										redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
	// 										scheduleStatus = resultData == "success" ? "Completed" : resultData;
	// 									} 
	// 									// else if (typeof(resultData) == "object") {
	// 									// 	var stat = resultData.reportData.overallstatus[0].overallstatus;
	// 									// 	scheduleStatus = stat == "success" ? "Completed" : stat;
	// 									// }
	// 									try {
	// 										logger.info("Calling function updateStatus from scheduleFunction");
	// 										updateStatus(sessObj, function (err, data) {
	// 											if (!err) {
	// 												logger.info("Sending response data from scheduleFunction");
	// 											}
	// 										});
	// 										//res.send(resultData);
	// 									} catch (ex) {
	// 										logger.error("Exception occurred in the updateStatus function of scheduleFunction: %s", ex);
	// 									}
	// 								}
	// 							}
	// 						}
	// 					}
	// 					redisServer.redisSubServer.on("message",executeTestSuite_listener);
	// 				} else {
	// 					logger.error("Error occurred in the function scheduleFunction: Socket not Available");
	// 					// deleteFlag = true;
	// 					// deleteScheduledData(deleteFlag, sessObj)
	// 					var testsuiteid = JSON.parse(JSON.stringify(result.rows[0].testsuiteids))[0];
	// 					var scheduleid = JSON.parse(JSON.stringify(result.rows[0].scheduleid));
	// 					var d = {};
	// 					d[testsuiteid]=[];
	// 					var scenariodetails = JSON.parse(result.rows[0].scenariodetails);
	// 					for(var i=0;i<scenariodetails.length;i++){
	// 						(d[testsuiteid]).push(scenariodetails[i].scenarioids);
	// 					}
	// 					var datetime = new Date();
	// 					datetime = datetime.getFullYear()+'-'+(datetime.getMonth()+1)+'-'+datetime.getDate()+' '+datetime.getHours()+':'+datetime.getMinutes()+':'+datetime.getSeconds()+'0';
	// 					var data = {'scenario_ids':d,'execution_id':scheduleid,'time':String(datetime)};
	// 					var sessobj_new = sessObj + ';Skipped;' +  JSON.stringify(result.rows[0]) + ';' +JSON.stringify(data);
	// 					var msg = "The scenario was skipped due to unavailability of schedule mode/ICE.";
	// 					logger.info("Calling function updateSkippedScheduleStatus from scheduleFunction");
	// 					updateSkippedScheduleStatus(sessobj_new, msg, function (err, data) {
	// 						if (!err) {
	// 							logger.info("Sending response data from scheduleFunction");
	// 						}
	// 					});
	// 				}
	// 			});
	// 		}
	// 	//    }
	// 	})
	// 	try {
			
	// 	} catch (exception) {
	// 		logger.error("Exception occurred in the executeScheduling function: %s", ex);
	// 		// deleteFlag = true;
	// 		// deleteScheduledData(deleteFlag, sessObj)
	// 		scheduleStatus = "Failed 02";
	// 		logger.info("Calling function updateStatus from executeScheduling");
	// 		updateStatus(sessObj, function (err, data) {
	// 			if (!err) {
	// 				logger.info("Sending response data from executeScheduling");
	// 			}
	// 		});
	// 	}
	// }

	//Update execution table on completion of suite execution
	function updateSchedulingStatus(testsuiteid, executionid, starttime, suiteStatus_s) {
		logger.info("Inside updateSchedulingStatus function");
		var inputs = {
			"testsuiteid": testsuiteid,
			"executionid": executionid,
			"starttime": starttime.toString(),
			"status": suiteStatus_s,
			"query": "inserintotexecutionquery"
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling NDAC Service from updateSchedulingStatus: suite/ExecuteTestSuite_ICE");
		client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
			function (result, response) {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occurred in suite/ExecuteTestSuite_ICE from updateSchedulingStatus, Error Code : ERRNDAC");
				flag = "fail";
			} else {
				flag = "success";
			}
		});
	}
}

//Update status of current scheduled job
function   updateStatus(sessObj, updateStatuscallback) {
	logger.info("Inside updateStatus function");
	try {
		if (scheduleStatus != "") {
			var inputs = {
				//"cycleid": sessObj.split(";")[0],
				"scheduledatetime": sessObj.split(";")[1],
				"scheduleid": sessObj.split(";")[0],
				"query": "getscheduledata"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from executeScheduling: suite/ScheduleTestSuite_ICE");
			client.post(epurl + "suite/ScheduleTestSuite_ICE", args,
				function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in suite/ScheduleTestSuite_ICE from executeScheduling Error Code : ERRNDAC");
					} else {
						if (result.rows[0].status != "Skipped"){
							var inputs = {
								"schedulestatus": scheduleStatus,
								//"cycleid": sessObj.split(";")[0],
								"scheduledatetime": sessObj.split(";")[1],
								"scheduleid": sessObj.split(";")[0],
								"query": "updatescheduledstatus"
							};
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							try {
								logger.info("Calling NDAC Service from updateStatus: suite/ScheduleTestSuite_ICE");
								client.post(epurl + "suite/ScheduleTestSuite_ICE", args,
									function (result, response) {
									if (response.statusCode != 200 || result.rows == "fail") {
										logger.error("Error occurred in suite/ScheduleTestSuite_ICE from updateStatus, Error Code : ERRNDAC");
										updateStatuscallback(null, "fail");
									} else {
										updateStatuscallback(null, "success");
									}
								});
							} catch (exception) {
								logger.error("Exception occurred in suite/ScheduleTestSuite_ICE from updateStatus: %s",exception);
								updateStatuscallback(null, "fail");
							}
						}
					}
				});
		}
	} catch (exception) {
		logger.error("Exception occurred in updateStatus: %s",exception);
		updateStatuscallback(null, "fail");
	}
}

//Update status and insert report for the skipped execution.
function updateSkippedScheduleStatus(sessObj, msg, updateStatuscallback){
	logger.info("Inside updateSkippedScheduleStatus function");
	try {
		var data = JSON.parse(sessObj.split(';')[5]);
		if(data['execution_id'] == sessObj.split(";")[1]){
			var inputs = {
				"schedulestatus": "Skipped",
				"cycleid": sessObj.split(";")[0],
				"scheduledatetime": sessObj.split(";")[2],
				"scheduleid": sessObj.split(";")[1],
				"query": "updatescheduledstatus"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			try {
				logger.info("Calling NDAC Service from updateSkippedScheduleStatus: suite/ScheduleTestSuite_ICE");
				client.post(epurl + "suite/ScheduleTestSuite_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in suite/ScheduleTestSuite_ICE from updateSkippedScheduleStatus, Error Code : ERRNDAC");
						updateStatuscallback(null, "fail");
					}
				});
				var obj = data['scenario_ids'];
				for(var i=0;i<(Object.keys(obj)).length;i++){
					var suite=(Object.keys(obj))[i];
					for(var j=0;j<obj[suite].length;j++){
						var reportId = uuid();
						var report_data = JSON.parse(sessObj.split(';')[4]);
						var scenario = obj[suite][j];
						var executionid = report_data.scheduleid;
						var testsuiteid = report_data.testsuiteids[0];
						var req_browser = 'NA';
						var reportData = {
											'rows': [{
													'status': 'Skipped',
													'Keyword': '',
													'Step ': 'Skipped',
													'Comments': '',
													'StepDescription': msg,
													'parentId': '',
													'id': '1'
												}
											],
											'overallstatus': [{
													'browserVersion': 'NA',
													'EllapsedTime': '0:00:00',
													'browserType': 'NA',
													'StartTime': data['time'],
													'EndTime': data['time'],
													'overallstatus': 'Skipped'
												}
											]
										}
						var inputs = {
							"reportid": reportId,
							"executionid": executionid,
							"testsuiteid": testsuiteid,
							"testscenarioid": scenario,
							"browser": req_browser,
							"cycleid":sessObj.split(";")[0],
							"status": reportData.overallstatus[0].overallstatus,
							"report": JSON.stringify(reportData),
							"query": "insertreportquery"
						};
						var args = {
							data: inputs,
							headers: {
								"Content-Type": "application/json"
							}
						};
						logger.info("Calling NDAC Service from scheduleFunction: suite/ExecuteTestSuite_ICE");
						client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
							function (result, response) {
							if (response.statusCode != 200 || result.rows == "fail") {
								logger.error("Error occurred in suite/ExecuteTestSuite_ICE from scheduleFunction, Error Code : ERRNDAC");
								updateStatuscallback(null, "fail");
							} else {
								updateStatuscallback(null, "success");
							}
						});
					}
				}
			} catch (exception) {
				logger.error("Exception occurred in suite/ScheduleTestSuite_ICE from updateSkippedScheduleStatus: %s",exception);
				updateStatuscallback(null, "fail");
			} 
		}
	} catch (exception) {
		logger.error("Exception occurred in updateSkippedScheduleStatus: %s",exception);
		updateStatuscallback(null, "fail");
	}
}

exports.getScheduledDetails_ICE = function (req, res) {
	logger.info("Inside UI service getScheduledDetails_ICE");
	if (utils.isSessionActive(req)) {
		logger.info("Calling function getScheduledDetails from getScheduledDetails_ICE");
		getScheduledDetails("getallscheduledata", function (err, getSchedcallback) {
			if (err) {
				logger.error("Error occurred in getScheduledDetails from getScheduledDetails_ICE: %s",err);
				res.send("fail");
			} else {
				try {
					res.send(getSchedcallback);
				} catch (exception) {
					logger.error("Exception occurred while sending response getSchedcallback: %s",exception);
					res.send("fail");
				}
			}
		});
	} else {
		logger.error("Error occurred in getScheduledDetails_ICE: Invalid Session");
		res.send("Invalid Session");
	}
};

//cancel scheduled Jobs
exports.cancelScheduledJob_ICE = function (req, res) {
	logger.info("Inside UI service cancelScheduledJob_ICE");
	if (utils.isSessionActive(req)) {
		var cycleid = req.body.suiteDetails.cycleid;
		var scheduleid = req.body.suiteDetails.scheduleid;
		var schedStatus = req.body.schedStatus;
		var schedHost = req.body.host;
		var schedUserid = req.body.schedUserid;0
		var userid = req.body.userInfo;
		if(userid == schedUserid || schedHost == req.session.username){
			var scheduledatetime = new Date(req.body.suiteDetails.scheduledatetime).valueOf().toString();
			var scheduledatetimeINT = parseInt(scheduledatetime);
			try {
				var upDate = new Date(scheduledatetimeINT).getFullYear() + "-" + ("0" + (new Date(scheduledatetimeINT).getMonth() + 1)).slice(-2) + "-" + ("0" + new Date(scheduledatetimeINT).getDate()).slice(-2) + " " + ("0" + new Date(scheduledatetimeINT).getHours()).slice(-2) + ":" + ("0" + new Date(scheduledatetimeINT).getMinutes()).slice(-2) + ":00+0000";
				var inputs = {
					"scheduledatetime": scheduledatetimeINT,
					"scheduleid": scheduleid,
					"query": "getscheduledstatus"
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from cancelScheduledJob_ICE: suite/ScheduleTestSuite_ICE");
				client.post(epurl + "suite/ScheduleTestSuite_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in suite/ScheduleTestSuite_ICE from cancelScheduledJob_ICE service, Error Code : ERRNDAC");
						res.send("fail");
					} else {
						var status = result.rows[0].status;
						if (status == "scheduled") {
							var objectD =scheduleid + ";" + upDate.valueOf().toString();
							scheduleStatus = schedStatus;
							logger.info("Calling function updateStatus from cancelScheduledJob_ICE service");
							updateStatus(objectD, function (err, data) {
								if (!err) {
									logger.info("Sending response data from cancelScheduledJob_ICE service on success");
									res.send(data);
								} else{
									logger.error("Error in the function updateStatus from cancelScheduledJob_ICE service");
									res.send(data);
								}
							});
						} else {
							logger.info("Sending response 'inprogress' from cancelScheduledJob_ICE service");
							res.send("inprogress");
						}
					}
				});
			} catch (exception) {
				logger.error("Exception in the service cancelScheduledJob_ICE: %s",exception);
				res.send("fail");
			}
		}
		else{
			logger.info("Sending response 'not authorised' from cancelScheduledJob_ICE service");
			res.send("not authorised");
		}		
	} else {
		logger.error("Error in the service cancelScheduledJob_ICE: Invalid Session");
		res.send("Invalid Session");
	}
};

//Fetch Scheduled data
function getScheduledDetails(dbquery, schedDetailscallback) {
	try {
		logger.info("Inside getScheduledDetails function");
		var inputs = {
			"scheduledetails": dbquery,
			"query": "getallscheduledetails"
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling NDAC Service from getScheduledDetails: suite/ScheduleTestSuite_ICE");
		client.post(epurl + "suite/ScheduleTestSuite_ICE", args,
			function (result, response) {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occurred in suite/ScheduleTestSuite_ICE from getScheduledDetails, Error Code : ERRNDAC");
				schedDetailscallback(null, "fail");
			} else {
				schedDetailscallback(null, result.rows);
			}
		});
	} catch (exception) {
		logger.error("Exception in the function getScheduledDetails: %s",exception);
		schedDetailscallback(null, "fail");
	}
}

//Re-Scheduling the tasks
exports.reScheduleTestsuite = function (req, res) {
	logger.info("Inside UI service reScheduleTestsuite");
	var getscheduleData = [];
	try {
		logger.info("Calling function getScheduledDetails from reScheduleTestsuite service");
		getScheduledDetails("getallscheduleddetails", function (err, reSchedcallback) {
			if (err) {
				logger.error("Error occurred in getScheduledDetails from reScheduleTestsuite service: %s", err);
			} else {
				if (reSchedcallback != "fail") {
					var status;
					for (var i = 0; i < reSchedcallback.length; i++) {
						status = reSchedcallback[i].status;
						if (status != "success" && status != "Terminate" && status != "Inprogress") {
							getscheduleData.push(reSchedcallback[i]);
						}
						if (status == "Inprogress") {
							scheduleStatus = "Failed 01";
							var str,dd,dt;
							var tempDD,tempDT;
							str = new Date(reSchedcallback[i].scheduledon).getFullYear() + "-" + ("0" + (new Date(reSchedcallback[i].scheduledon).getMonth() + 1)).slice(-2) + "-" + ("0" + new Date(reSchedcallback[i].scheduledon).getDate()).slice(-2) + " " + ("0" + new Date(reSchedcallback[i].scheduledon).getUTCHours()).slice(-2) + ":" + ("0" + new Date(reSchedcallback[i].scheduledon).getUTCMinutes()).slice(-2);
							tempDD = str.split(" ")[0];
							tempDT = str.split(" ")[1];
							dd = tempDD.split("-");
							dt = tempDT.split(":");
							var objectD = reSchedcallback[i].cycleid.valueOf().toString() + ";" + reSchedcallback[i].scheduleid.valueOf().toString() + ";" + new Date(Date.UTC(dd[0], dd[1] - 1, dd[2], dt[0], dt[1])).valueOf().toString();
							logger.info("Calling function updateStatus from reScheduleTestsuite service");
							updateStatus(objectD, function (err, data) {
								if (!err) {
									logger.info("Sending response data from the function updateStatus of reScheduleTestsuite service");
								}
							});
						}
					}
					if (getscheduleData.length > 0) {
						var modInfo = {};
						var dd,dt,str;
						var tempDD,tempDT;
						var modInformation = [];
						async.forEachSeries(getscheduleData, function (itrSchData, getscheduleDataCallback) {
							str = new Date(itrSchData.scheduledon).getFullYear() + "-" + ("0" + (new Date(itrSchData.scheduledon).getMonth() + 1)).slice(-2) + "-" + ("0" + new Date(itrSchData.scheduledon).getUTCDate()).slice(-2) + " " + ("0" + new Date(itrSchData.scheduledon).getUTCHours()).slice(-2) + ":" + ("0" + new Date(itrSchData.scheduledon).getUTCMinutes()).slice(-2);
							tempDD = str.split(" ")[0];
							tempDT = str.split(" ")[1];
							dd = tempDD.split("-");
							dt = tempDT.split(":");
							if (new Date(dd[0], dd[1] - 1, dd[2], dt[0], dt[1]) > new Date()) {
								modInfo.suiteDetails = itrSchData.scenariodetails;
								modInfo.testsuitename = itrSchData.testsuitename;
								modInfo.testsuiteid = itrSchData.testsuiteids[0].valueOf().toString();
								modInfo.Ip = itrSchData.target;
								modInfo.date = dd[2] + "-" + dd[1] + "-" + dd[0];
								modInfo.time = str.split(" ")[1];
								modInfo.browserType = itrSchData.browserlist;
								//modInfo.cycleid = itrSchData.cycleid.valueOf().toString();
								modInfo.reschedule = true;
								modInfo.scheduleid = itrSchData._id.valueOf().toString();
								modInfo.versionnumber = 1;
								modInfo.userid = itrSchData.scheduledby;
								modInformation.push(modInfo);
								logger.info("Calling function scheduleTestSuite from reScheduleTestsuite service");
								scheduleTestSuite(modInformation, req, function (err, schedulecallback) {
									try {
										logger.info("Status of the function scheduleTestSuite from reScheduleTestsuite service");
									} catch (exception) {
										logger.error("Exception in the function scheduleTestSuite from reScheduleTestsuite service: %s", exception);
									}
									getscheduleDataCallback();
								});
							} else {
								scheduleStatus = "Failed 01";
								var objectD = itrSchData._id.valueOf().toString() + ";" + new Date(Date.UTC(dd[0], dd[1] - 1, dd[2], dt[0], dt[1])).valueOf().toString();
								logger.info("Calling function updateStatus from reScheduleTestsuite service");
								updateStatus(objectD, function (err, data) {
									if (!err) {
										logger.info("Sending response data from the function updateStatus of reScheduleTestsuite service");
									}
									getscheduleDataCallback();
								});
							}
							
						});
					}
				} else {
					logger.info("Status from the function reScheduleTestsuite: Jobs are not rescheduled");
				}
			}
		});
	} catch (ex) {
		logger.error("Exception in the function reScheduleTestsuite: %s", ex);
	}
};
