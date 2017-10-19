/**
 * Dependencies.
 */
var async = require('async');
var myserver = require('../../server.js');
var uuid = require('uuid-random');
var dbConnICE = require('../../server/config/icetestautomation');
var epurl = "http://127.0.0.1:1990/";
var Client = require("node-rest-client").Client;
var client = new Client();
var schedule = require('node-schedule');
var sessionExtend = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
var sessionTime = 30 * 60 * 1000;
var updateSessionTimeEvery = 20 * 60 * 1000;

/**
 * @author vishvas.a
 * @modifiedauthor shree.p (fetching the scenario names from the scenarios table)
 * @author vishvas.a changes on 21/June/2017 with regard to Batch Execution
 * this reads the scenario information from the testsuites
 * and testsuites table of the icetestautomation keyspace
 */
exports.readTestSuite_ICE = function (req, res) {
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
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
			TestSuiteDetails_Module_ICE(eachSuite, function (TestSuiteDetailserror, TestSuiteDetailsCallback) {
				if (TestSuiteDetailserror) {
					console.log(TestSuiteDetailserror);
				} else {
					var inputs = {
						"testsuiteid": eachSuite.testsuiteid,
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
					client.post(epurl + "suite/readTestSuite_ICE", args,
						function (result, response) {
						if (response.statusCode != 200 || result.rows == "fail") {
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
								scenarioidindex = 0;
								async.forEachSeries(outscenarioids, function (eachoutscenarioid, outscenarioidcallback) {
									scenarioidindex = scenarioidindex + 1;
									/**
									 *  Projectnametestcasename_ICE is a function to fetch testscenario name and project name
									 * 	modified shreeram p on 15th mar 2017
									 * */
									Projectnametestcasename_ICE(eachoutscenarioid, function (eachoutscenarioiderr, eachoutscenarioiddata) {
										if (eachoutscenarioiderr) {
											console.log(eachoutscenarioiderr);
										} else {
											if (eachoutscenarioiddata != null || eachoutscenarioiddata != undefined) {
												outscenarionames.push(eachoutscenarioiddata.testcasename);
												outprojectnames.push(eachoutscenarioiddata.projectname);
											}
											respeachscenario.scenarionames = outscenarionames;
											respeachscenario.projectnames = outprojectnames;
											respeachscenario.testsuiteid = eachSuite.testsuiteid;
											if (scenarioidindex == outscenarioids.length) {
												responsedata[eachSuite.testsuitename] = respeachscenario;
												if (testsuitesindex == requiredreadTestSuite.length) {
													if (fromFlg == "scheduling") {
														var connectusers = [];
														if (myserver.allSchedulingSocketsMap != undefined) {
															connectusers = Object.keys(myserver.allSchedulingSocketsMap);
														}
														var schedulingDetails = {
															"connectedUsers": connectusers,
															"testSuiteDetails": responsedata
														};
														res.send(schedulingDetails);
													} else
														res.send(responsedata);
												}
											}
											outscenarioidcallback();
										}
									}, eachSuitecallback);

								}, readSuiteDatacallback);
							});
						}
					});
				}
			});
		});
	} else {
		res.send("Invalid Session");
	}
};

/**
 * Projectnametestcasename_ICE function is to fetch projectname and testscenario
 * created by shreeram p on 15th mar 2017
 *  */
function Projectnametestcasename_ICE(req, cb, data) {
	var projectid = '';
	var testcaseNproject = {
		testcasename: "",
		projectname: ""
	};
	async.series({
		testcasename: function (callback_name) {
			var inputs = {
				"testscenarioid": req,
				"query": "testcasename"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log("Error occured in Projectnametestcasename_ICE : fail");
				} else {
					if (result.rows.length != 0) {
						projectid = result.rows[0].projectid;
						testcaseNproject.testcasename = result.rows[0].testscenarioname;
					}
					callback_name(null, projectid);
				}
			});
		},
		projectname: function (callback_name) {
			var inputs = {
				"projectid": projectid,
				"query": "projectname"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log("Error occured in Projectnametestcasename_ICE : fail");
				} else {
					if (result.rows.length != 0)
						testcaseNproject.projectname = result.rows[0].projectname;
					callback_name(null, testcaseNproject);
				}
			});
		}
	}, function (err, data) {
		cb(null, testcaseNproject);
	});
}

/**
 * @author vishvas.a
 * @author vishvas.a modified on 08/03/2017
 * @author vishvas.a changes on 23/June/2017 with regard to Batch Execution
 * this block of code is used for updating the testsuite details
 * to the testsuites table of icetestautomation keyspace
 */
exports.updateTestSuite_ICE = function (req, res) {
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
		var userinfo = req.body.batchDetails.userinfo;
		var batchDetails = req.body.batchDetails.suiteDetails;
		var batchDetailslength = batchDetails.length;
		var batchindex = 0;
		var totalnumberofsuites = 0;
		var suiteindex = 0;
		async.forEachSeries(batchDetails, function (eachbatchDetails, batchDetailscallback) {
			batchindex = batchindex + 1;
			var allsuitenames = Object.keys(eachbatchDetails);
			totalnumberofsuites = totalnumberofsuites + allsuitenames.length;
			async.forEachSeries(allsuitenames, function (eachsuitename, eachsuitenamecallback) {
				var requestedtestsuitename = eachbatchDetails[eachsuitename].requestedtestsuitename;
				var requestedtestsuiteid = eachbatchDetails[eachsuitename].requestedtestsuiteid;
				var conditioncheck = eachbatchDetails[eachsuitename].conditioncheck;
				var donotexecute = eachbatchDetails[eachsuitename].donotexecute;
				var getparampaths = eachbatchDetails[eachsuitename].getparampaths;
				var testscenarioids = eachbatchDetails[eachsuitename].testscenarioids;
				var testscycleid = eachbatchDetails[eachsuitename].testscycleid;
				var versionnumber = eachbatchDetails[eachsuitename].versionnumber;
				console.log(requestedtestsuitename);
				var index = 0;
				/*
				 * Query 1 checking whether the requestedtestsuiteid belongs to the same requestedtestscycleid
				 * based on requested cycleid,suiteid
				 */
				var flag = "";
				var inputs = {
					"query": "deletetestsuitequery",
					"cycleid": testscycleid,
					"testsuitename": requestedtestsuitename,
					"testsuiteid": requestedtestsuiteid,
					"versionnumber": versionnumber
				};
				deleteSuite(inputs, function (err, response) {
					if (response == "success") {
						saveSuite(function (err, response) {
							if (err) {
								flag = "fail";
								res.send(flag);
							} else {
								flag = "success";
								index = index + 1;
								if (index == testscenarioids.length) {
									console.log("delete completed --- calling next Suite");
									suiteindex = suiteindex + 1;
									if (batchindex == batchDetailslength && suiteindex == totalnumberofsuites) {
										res.send("success");
									} else {
										eachsuitenamecallback();
									}
								}
							}
						});
					}
				});

				function deleteSuite(inputs, deleteSuitecallback) {
					var args = {
						data: inputs,
						headers: {
							"Content-Type": "application/json"
						}
					};
					client.post(epurl + "suite/updateTestSuite_ICE", args,
						function (data, response) {
						if (response.statusCode != 200 || data.rows == "fail") {
							console.log(response.statusCode);
						} else {
							flag = "success";
							deleteSuitecallback(null, flag);
						}
					});
				}

				function saveSuite(saveSuite) {
					for (var scenarioidindex = 0; scenarioidindex < testscenarioids.length; scenarioidindex++) {
						var inputs2 = {
							"query": "updatetestsuitedataquery",
							"conditioncheck": conditioncheck[scenarioidindex],
							"donotexecute": donotexecute[scenarioidindex],
							"getparampaths": getparampaths[scenarioidindex],
							"testscenarioids": testscenarioids[scenarioidindex],
							"modifiedby": userinfo.username.toLowerCase(),
							"modifiedbyrole": userinfo.role,
							"cycleid": testscycleid,
							"testsuiteid": requestedtestsuiteid,
							"testsuitename": requestedtestsuitename,
							"versionnumber": versionnumber,
							"skucodetestsuite": "skucodetestsuite",
							"tags": "tags"
						};
						var args = {
							data: inputs2,
							headers: {
								"Content-Type": "application/json"
							}
						};
						client.post(epurl + "suite/updateTestSuite_ICE", args,
							function (data, response) {
							if (response.statusCode != 200 || data.rows == "fail") {
								console.log(response.statusCode);
							} else {
								flag = "success";
								saveSuite(null, flag);
							}
						});
					}
				}
			});
			batchDetailscallback();
		});
	} else {
		res.send("Invalid Session");
	}
};

/**
 * @author shree.p
 * @author vishvas.a changes on 21/June/2017 with regard to Batch Execution
 */
exports.ExecuteTestSuite_ICE = function (req, res) {
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
		var batchExecutionData = req.body.moduleInfo;
		var userInfo = req.body.userInfo;
		var testsuitedetailslist = [];
		var testsuiteIds = [];
		var executionRequest = {
			"executionId": "",
			"suitedetails": [],
			"testsuiteIds": []
		};
		var executionId = uuid();
		var starttime = new Date().getTime();
		//updating number of executions happened
		batchlength = batchExecutionData.length;
		var updateinp = {
			"query": "testsuites",
			"count": batchlength,
			"userid": userInfo.user_id
		};
		var args = {
			data: updateinp,
			headers: {
				"Content-Type": "application/json"
			}
		};
		client.post(epurl + "utility/dataUpdator_ICE", args,
			function (result, response) {
			if (response.statusCode != 200 || result.rows == "fail") {
				console.log("Data Updator Fail");
			} else {
				console.log("Data Updator Success");
			}
		});
		async.forEachSeries(batchExecutionData, function (eachbatchExecutionData, batchExecutionDataCallback) {
			var suiteDetails = eachbatchExecutionData.suiteDetails;
			var testsuitename = eachbatchExecutionData.testsuitename;
			var testsuiteid = eachbatchExecutionData.testsuiteid;
			var browserType = eachbatchExecutionData.browserType;
			var listofscenarioandtestcases = [];
			var scenarioIdList = [];
			var dataparamlist = [];
			var conditionchecklist = [];
			var browserTypelist = [];
			var scenarioindex = 0;
			testsuiteIds.push(testsuiteid);
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
				TestCaseDetails_Suite_ICE(currentscenarioid, userInfo.user_id, function (currentscenarioidError, currentscenarioidResponse) {
					var scenariotestcaseobj = {};
					// scenarioindex=scenarioindex + 1;
					if (currentscenarioidError) {
						console.log(currentscenarioidError);
					} else {
						if (currentscenarioidResponse != null || currentscenarioidResponse != undefined) {
							scenariotestcaseobj[currentscenarioid] = currentscenarioidResponse.listoftestcasedata;
							scenariotestcaseobj.qccredentials = eachsuiteDetails.qccredentials;
							scenariotestcaseobj.qcdetails = currentscenarioidResponse.qcdetails;
							listofscenarioandtestcases.push(scenariotestcaseobj);
							eachsuiteDetailscallback();
						}
						if (listofscenarioandtestcases.length == suiteDetails.length) {
							updateData();
							batchExecutionDataCallback();
							if (testsuitedetailslist.length == batchExecutionData.length) {
								var a = executionFunction(executionRequest);
								console.log(a);
							}
						}
					}
				});
				function updateData() {
					executionjson[testsuiteid] = listofscenarioandtestcases;
					executionjson.scenarioIds = scenarioIdList;
					executionjson.browserType = browserType;
					executionjson.condition = conditionchecklist;
					executionjson.dataparampath = dataparamlist;
					executionjson.testsuiteid = testsuiteid;
					executionjson.testsuitename = testsuitename;
					testsuitedetailslist.push(executionjson);
					if (testsuitedetailslist.length == batchExecutionData.length) {
						excutionObjectBuilding(testsuitedetailslist);
					}
				}
			});

		});

		function excutionObjectBuilding(testsuitedetailslist) {
			executionRequest.executionId = executionId;
			executionRequest.suitedetails = testsuitedetailslist;
			executionRequest.testsuiteIds = testsuiteIds;
		}

		function executionFunction(executionRequest) {
			console.log(executionRequest);
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			var name = req.session.username;
			console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", name);
			if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
				var mySocket = myserver.allSocketsMap[name];
				mySocket._events.result_executeTestSuite = [];
				mySocket.emit('executeTestSuite', executionRequest);
				var updateSessionExpiry = setInterval(function () {
						req.session.cookie.maxAge = sessionTime;
					}, updateSessionTimeEvery);
				mySocket.on('result_executeTestSuite', function (resultData) {
					//req.session.cookie.expires = new Date(Date.now() + 30 * 60 * 1000); 
					clearInterval(updateSessionExpiry);
					if (resultData != "success" && resultData != "Terminate") {
						try {
							var scenarioid = resultData.scenarioId;
							var executionid = resultData.executionId;
							var reportdata = resultData.reportData;
							var testsuiteid = resultData.testsuiteId;
							var req_report = resultData.reportdata;
							var req_reportStepsArray = reportdata.rows;
							var req_overAllStatus = reportdata.overallstatus;
							var req_browser = reportdata.overallstatus[0].browserType;
							reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
							reportdata = JSON.parse(reportdata);
							var reportId = uuid();
							var inputs = {
								"reportid": reportId,
								"executionid": executionid,
								"testsuiteid": testsuiteid,
								"testscenarioid": scenarioid,
								"browser": req_browser,
								"status": resultData.reportData.overallstatus[0].overallstatus,
								"report": JSON.stringify(reportdata),
								"query": "insertreportquery"
							};
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
								function (result, response) {
								if (response.statusCode != 200 || result.rows == "fail") {
									console.log("Error occured in TestCaseDetails_Suite_ICE : fail , insertreportquery");
									flag = "fail";
								} else {
									flag = "success";
								}
							});
							var inputs = {
								"testsuiteid": testsuiteid,
								"executionid": executionid,
								"starttime": starttime.toString(),
								"status": resultData.reportData.overallstatus[0].overallstatus,
								"query": "inserintotexecutionquery"
							};
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							var dbqueryexecution = client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
									function (result, response) {
									if (response.statusCode != 200 || result.rows == "fail") {
										console.log("Error occured in TestCaseDetails_Suite_ICE : fail , insertIntoExecution");
										flag = "fail";
									} else {
										flag = "success";
									}
								});
						} catch (ex) {
							console.log(ex);
						}
					}
					if (resultData == "success" || resultData == "Terminate") {
						try {
							res.send(resultData);
						} catch (ex) {
							console.log(ex);
						}
					}

				});
			} else {
				console.log("Socket not Available");
				res.send("unavailableLocalServer");
			}
		}
	} else {
		res.send("Invalid Session");
	}
};

/**
 * @author shree.p
 * @see function to execute test suites from jenkins
 */
exports.ExecuteTestSuite_ICE_CI = function (req, res) {
	if (req.sessionStore.sessions != undefined) {
		session_list = req.sessionStore.sessions;
		if (Object.keys(session_list).length != 0) {
			var sessionCookie = session_list[req.body.session_id];
			var sessionToken = JSON.parse(sessionCookie).uniqueId;
			sessionToken = Object.keys(session_list)[Object.keys(session_list).length - 1];
		}
	}
	if (sessionToken != undefined && req.body.session_id == sessionToken) {
		var batchExecutionData = req.body.moduleInfo;
		var userInfo = req.body.userInfo;
		var testsuitedetailslist = [];
		var testsuiteIds = [];
		var executionRequest = {
			"executionId": "",
			"suitedetails": [],
			"testsuiteIds": []
		};
		var executionId = uuid();
		var starttime = new Date().getTime();
		//updating number of executions happened
		batchlength = batchExecutionData.length;
		var updateinp = {
			"query": "testsuites",
			"count": batchlength,
			"userid": userInfo.user_id
		};
		var args = {
			data: updateinp,
			headers: {
				"Content-Type": "application/json"
			}
		};
		client.post(epurl + "utility/dataUpdator_ICE", args,
			function (result, response) {
			if (response.statusCode != 200 || result.rows == "fail") {
				console.log("Data Updator Fail");
			} else {
				console.log("Data Updator Success");
			}
		});
		async.forEachSeries(batchExecutionData, function (eachbatchExecutionData, batchExecutionDataCallback) {
			var suiteDetails = eachbatchExecutionData.suiteDetails;
			var testsuitename = eachbatchExecutionData.testsuitename;
			var testsuiteid = eachbatchExecutionData.testsuiteid;
			var browserType = eachbatchExecutionData.browserType;
			var listofscenarioandtestcases = [];
			var scenarioIdList = [];
			var dataparamlist = [];
			var conditionchecklist = [];
			var browserTypelist = [];
			var scenarioindex = 0;
			testsuiteIds.push(testsuiteid);
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
				TestCaseDetails_Suite_ICE(currentscenarioid, userInfo.user_id, function (currentscenarioidError, currentscenarioidResponse) {
					var scenariotestcaseobj = {};
					// scenarioindex=scenarioindex + 1;
					if (currentscenarioidError) {
						console.log(currentscenarioidError);
					} else {
						if (currentscenarioidResponse != null || currentscenarioidResponse != undefined) {
							scenariotestcaseobj[currentscenarioid] = currentscenarioidResponse;
							listofscenarioandtestcases.push(scenariotestcaseobj);
							eachsuiteDetailscallback();
						}
						if (listofscenarioandtestcases.length == suiteDetails.length) {
							updateData();
							batchExecutionDataCallback();
							if (testsuitedetailslist.length == batchExecutionData.length) {
								var a = executionFunction(executionRequest);
								console.log(a);
							}
						}
					}
				});
				function updateData() {
					executionjson[testsuiteid] = listofscenarioandtestcases;
					executionjson.scenarioIds = scenarioIdList;
					executionjson.browserType = browserType;
					executionjson.condition = conditionchecklist;
					executionjson.dataparampath = dataparamlist;
					executionjson.testsuiteid = testsuiteid;
					executionjson.testsuitename = testsuitename;
					testsuitedetailslist.push(executionjson);
					if (testsuitedetailslist.length == batchExecutionData.length) {
						excutionObjectBuilding(testsuitedetailslist);
					}
				}
			});

		});

		function excutionObjectBuilding(testsuitedetailslist) {
			executionRequest.executionId = executionId;
			executionRequest.suitedetails = testsuitedetailslist;
			executionRequest.testsuiteIds = testsuiteIds;
		}

		function executionFunction(executionRequest) {
			console.log(executionRequest);
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			console.log("IP:", ip);
			var name = req.session.username;
			console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", name);
			if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
				var mySocket = myserver.allSocketsMap[name];
				mySocket._events.result_executeTestSuite = [];
				mySocket.emit('executeTestSuite', executionRequest);
				var updateSessionExpiry = setInterval(function () {
						req.session.cookie.maxAge = sessionTime;
					}, updateSessionTimeEvery);
				mySocket.on('result_executeTestSuite', function (resultData) {
					//req.session.cookie.expires = sessionExtend;
					clearInterval(updateSessionExpiry);
					if (resultData != "success" && resultData != "Terminate") {
						try {
							var scenarioid = resultData.scenarioId;
							var executionid = resultData.executionId;
							var reportdata = resultData.reportData;
							var testsuiteid = resultData.testsuiteId;
							var req_report = resultData.reportdata;
							var req_reportStepsArray = reportdata.rows;
							var req_overAllStatus = reportdata.overallstatus;
							var req_browser = reportdata.overallstatus[0].browserType;
							reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
							reportdata = JSON.parse(reportdata);
							var inputs = {
								"reportid": reportId,
								"executionid": executionid,
								"testsuiteid": testsuiteid,
								"testscenarioid": scenarioid,
								"browser": req_browser,
								"status": resultData.reportData.overallstatus[0].overallstatus,
								"report": JSON.stringify(reportdata),
								"query": "insertreportquery"
							};
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							var dbquery = client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
									function (result, response) {
									if (response.statusCode != 200 || result.rows == "fail") {
										console.log("Error occured in TestCaseDetails_Suite_ICE : fail , insertreportquery");
										flag = "fail";
									} else {
										flag = "success";
									}
								});
							var inputs = {
								"testsuiteid": testsuiteid,
								"executionid": executionid,
								"starttime": starttime.toString(),
								"query": "inserintotexecutionquery"
							};
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							var dbqueryexecution = client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
									function (result, response) {
									if (response.statusCode != 200 || result.rows == "fail") {
										console.log("Error occured in TestCaseDetails_Suite_ICE : fail , insertIntoExecution");
										flag = "fail";
									} else {
										flag = "success";
									}
								});
						} catch (ex) {
							console.log(ex);
						}
					}
					if (resultData == "success" || resultData == "Terminate") {
						try {
							res.send(resultData);
						} catch (ex) {
							console.log(ex);
							res.send("fail");
						}
					}
				});
			} else {
				console.log("Socket not Available");
				res.send("unavailableLocalServer");
			}
		}
	} else {
		res.send("Invalid Session");
	}
};

function TestCaseDetails_Suite_ICE(req, userid, cb, data) {
	var requestedtestscenarioid = req;
	var resultstring = [];
	var data = [];
	var resultdata = '';
	var qcdetails = {};
	var listoftestcasedata = [];
	async.series({
		testcaseid: function (callback) {
			var inputs = {
				"testscenarioid": requestedtestscenarioid,
				"query": "testcaseid",
				"userid": userid
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcaseid");
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
					"testcaseid": quest,
					"query": "testcasesteps",
					"userid": userid
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
					function (screenidresponse, response) {
					if (response.statusCode != 200 || screenidresponse.rows == "fail") {
						console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
					} else {
						try {
							if (screenidresponse.rows.length != 0) {
								var inputs = {
									"screenid": screenidresponse.rows[0].screenid,
									"query": "getscreendataquery"
								};
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
									function (screendataresponse, response) {
									if (response.statusCode != 200 || screendataresponse.rows == "fail") {
										console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
									} else {
										try {
											try {
												screendataresponse = JSON.parse(screendataresponse.rows[0].screendata);
											} catch (exception) {
												screendataresponse = JSON.parse("{}");
											}

											if (screendataresponse != null && screendataresponse != "") {
												if ('body' in screendataresponse) {
													var wsscreentemplate = screendataresponse.body[0];
													var inputs = {
														"testcaseid": quest,
														"query": "testcasestepsquery"
													};
													var args = {
														data: inputs,
														headers: {
															"Content-Type": "application/json"
														}
													};
													client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
														function (answers, response) {
														if (response.statusCode != 200 || answers.rows == "fail") {
															console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
														} else {
															responsedata.template = wsscreentemplate;
															if (answers.rows.length != 0) {
																responsedata.testcasename = answers.rows[0].testcasename;
																responsedata.testcase = answers.rows[0].testcasesteps;
															}
															listoftestcasedata.push(responsedata);
														}
														callback2();
													});
												} else {
													var inputs = {
														"testcaseid": quest,
														"query": "testcasestepsquery"
													};
													var args = {
														data: inputs,
														headers: {
															"Content-Type": "application/json"
														}
													};
													client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
														function (answers, response) {
														if (response.statusCode != 200 || answers.rows == "fail") {
															console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
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
											} else {
												var inputs = {
													"testcaseid": quest,
													"query": "testcasestepsquery"
												};
												var args = {
													data: inputs,
													headers: {
														"Content-Type": "application/json"
													}
												};
												client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
													function (answers, response) {
													if (response.statusCode != 200 || answers.rows == "fail") {
														console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
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
											var inputs = {
												"testcaseid": quest,
												"query": "testcasestepsquery"
											};
											var args = {
												data: inputs,
												headers: {
													"Content-Type": "application/json"
												}
											};
											client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
												function (answers, response) {
												if (response.statusCode != 200 || answers.rows == "fail") {
													console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
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
									"query": "testcasestepsquery"
								};
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
									function (answers, response) {
									if (response.statusCode != 200 || answers.rows == "fail") {
										console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
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
							console.log("Exception occured in TestCaseDetails_Suite_ICE : ", exception);
						}
					}
				});
			}, callback);
		},

		qcscenariodetails: function (callback) {
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
			client.post(epurl + "qualityCenter/viewQcMappedList_ICE", args,
				function (qcdetailsows, response) {
				if (response.statusCode != 200 || qcdetailsows.rows == "fail") {
					console.log("Exception occured in TestCaseDetails_Suite_ICE : fail, qcscenariodetails ");
				} else {

					if (qcdetailsows.rows.length != 0) {
						flagtocheckifexists = true;
						qcdetails = JSON.parse(JSON.stringify(qcdetailsows.rows[0]));
					}
				}
				callback(null, qcdetails);
			});
		}
	},
		function (err, results) {
		var obj = {
			"listoftestcasedata": JSON.stringify(listoftestcasedata),
			"qcdetails": qcdetails
		};
		if (err) {
			cb(err);
		} else {
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
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
		var requiredtestscenarioid = req.body.testScenarioId;
		testcasedetails_testscenarios(requiredtestscenarioid, function (err, data) {
			if (err) {
				res.send("fail");
			} else {
				try {
					//console.log(data);
					res.send(JSON.stringify(data));
				} catch (ex) {
					console.log("Exception occured in getTestcaseDetailsForScenario_ICE : ", ex);
				}
			}
		});
	} else {
		res.send("Invalid Session");
	}
};

//Function to fetch all the testcase,screen and project names for provided scenarioid
function testcasedetails_testscenarios(req, cb, data) {
	var testcasedetails = {
		testcasename: "",
		screenname: "",
		projectname: ""
	};
	var testcaseids = [];
	var screenidlist = [];
	var testcasenamelist = [];
	var screennamelist = [];
	var projectidlist = [];
	var projectnamelist = [];
	async.series({
		testscenariotable: function (callback) {
			var inputs = {
				"query": "testscenariotable",
				"testscenarioid": req
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "suite/getTestcaseDetailsForScenario_ICE", args,
				function (testscenarioresult, response) {
				if (response.statusCode != 200 || testscenarioresult.rows == "fail") {
					console.log(response.statusCode);
				} else {
					if (testscenarioresult.rows.length != 0)
						testcaseids = testscenarioresult.rows[0].testcaseids;
				}
				callback(null, testcaseids);
			});
		},
		testcasetable: function (callback) {
			var testcasename = '';
			async.forEachSeries(testcaseids, function (itr, callback2) {
				var inputs = {
					"query": "testcasetable",
					"testcaseid": itr
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				client.post(epurl + "suite/getTestcaseDetailsForScenario_ICE", args,
					function (testcaseresult, response) {
					if (response.statusCode != 200 || testcaseresult.rows == "fail") {
						console.log(response.statusCode);
					} else {
						if (testcaseresult.rows.length != 0) {
							testcasenamelist.push(testcaseresult.rows[0].testcasename);
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
				client.post(epurl + "suite/getTestcaseDetailsForScenario_ICE", args,
					function (screenresult, response) {
					if (response.statusCode != 200 || screenresult.rows == "fail") {
						console.log(response.statusCode);
					} else {
						if (screenresult.rows.length != 0) {
							screennamelist.push(screenresult.rows[0].screenname);
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
				client.post(epurl + "suite/getTestcaseDetailsForScenario_ICE", args,
					function (projectresult, response) {
					if (response.statusCode != 200 || projectresult.rows == "fail") {
						console.log(response.statusCode);
					} else {
						if (projectresult.rows.length != 0)
							projectnamelist.push(projectresult.rows[0].projectname);
					}
					callback4();
				});
			}, callback);
		}
	}, function (err, data) {
		if (err) {
			console.log(err);
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
			cb(err, resultdata);
		}
	});
}

function TestSuiteDetails_Module_ICE(req, cb1, data) {
	var requiredcycleid = req.cycleid;
	var requiredtestsuiteid = req.testsuiteid;
	var requiredtestsuitename = req.testsuitename;
	var resultstring = [];
	var data = [];
	var resultdata = '';
	var flag = false;
	var listoftestcasedata = [];
	async.series({
		testsuitecheck: function (callback) {
			var inputs = {
				"testsuiteid": requiredtestsuiteid,
				"cycleid": requiredcycleid,
				"query": "testsuitecheck"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log("Error occured in TestSuiteDetails_Module_ICE : fail , testsuitecheck");
				} else {
					if (result.rows.length != 0) {
						flag = true;
					}
					callback();
				}
			});
		},
		selectmodule: function (callback) {
			var inputs = {
				"moduleid": requiredtestsuiteid,
				"modulename": requiredtestsuitename,
				"query": "selectmodule"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log("Error occured in TestSuiteDetails_Module_ICE : fail, selectmodule");
				} else {
					if (result.rows.length != 0) {
						data = JSON.parse(JSON.stringify(result.rows[0]));
						resultdata = data;
					}
					callback(null, resultdata);
				}
			});
		},
		testcasesteps: function (callback) {
			var testscenarioids = resultdata.testscenarioids;
			var versionnumber = resultdata.versionnumber;
			if (!flag) {
				var conditioncheckvalues = [];
				var donotexecutevalues = [];
				var getparampathvalues = [];
				if (testscenarioids != null && testscenarioids != undefined) {
					for (var i = 0; i < testscenarioids.length; i++) {
						conditioncheckvalues.push('0');
						donotexecutevalues.push('1');
						getparampathvalues.push('');
					}
				}
				var inputs = {
					"cycleid": requiredcycleid,
					"testsuitename": requiredtestsuitename,
					"testsuiteid": requiredtestsuiteid,
					"versionnumber": versionnumber,
					"conditioncheck": conditioncheckvalues,
					"createdby": "Ninteen68_admin",
					"createdthrough": "createdthrough",
					"deleted": false,
					"donotexecute": donotexecutevalues,
					"getparampaths": getparampathvalues,
					"skucodetestsuite": "skucodetestsuite",
					"tags": "tags",
					"testscenarioids": testscenarioids,
					"query": "testcasesteps"
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				client.post(epurl + "suite/readTestSuite_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log("Error occured in TestSuiteDetails_Module_ICE : fail, testcasesteps");
						cb1(null, flag);
					} else {
						callback(null, flag);
					}
				});
			} else {
				var jsondata = {
					"testsuiteid": requiredtestsuiteid,
					"testscenarioid": testscenarioids,
					"cycleid": requiredcycleid,
					"testsuitename": requiredtestsuitename,
					"versionnumber": versionnumber,
					"testscenarioids": testscenarioids
				};
				updatescenariodetailsinsuite(jsondata, function (err, data) {
					if (err) {
						console.log(err);
						cb1(null, flag);
					} else {
						callback(null, flag);
					}
				});
			}
		}
	}, function (err, results) {
		if (err) {
			cb1(null, flag);
		} else {
			cb1(null, flag);
		}
	});
}

function updatescenariodetailsinsuite(req, cb, data) {
	var suiterowdetails = {};
	var getparampath1 = [];
	var conditioncheck1 = [];
	var donotexecute1 = [];
	async.series({
		fetchdata: function (simplecallback) {
			var inputs = {
				"testsuiteid": req.testsuiteid,
				"cycleid": req.cycleid,
				"query": "fetchdata"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log("Error occured in TestSuiteDetails_Module_ICE : fail, fetchdata");
				} else {
					if (result.rows.length != 0)
						suiterowdetails = result.rows[0];
				}
				simplecallback();
			});
		},
		validatedata: function (simplecallback) {
			var scenarioidstocheck = suiterowdetails.testscenarioids;
			var verifyscenarioid = req.testscenarioid;
			var getparampath = suiterowdetails.getparampaths;
			var conditioncheck = suiterowdetails.conditioncheck;
			var donotexecute = suiterowdetails.donotexecute;
			for (var i = 0; i < verifyscenarioid.length; i++) {
				var temp = verifyscenarioid[i];
				var index;
				if (scenarioidstocheck != null)
					index = JSON.parse(JSON.stringify(scenarioidstocheck)).indexOf(temp);
				if (index != null && index != undefined && index != -1) {
					if (getparampath != null) {
						if (getparampath[index] == '' || getparampath[index] == ' ') {
							getparampath1.push('\' \'');
						} else {
							getparampath1.push("\'" + getparampath[index] + "\'");
						}
					}
					if (conditioncheck != null) {
						conditioncheck1.push(conditioncheck[index].toString());
					}
					if (donotexecute != null) {
						donotexecute1.push(donotexecute[index]);
					}
				} else {
					getparampath1.push('\' \'');
					conditioncheck1.push('0');
					donotexecute1.push('1');
				}
			}
			simplecallback();
		},
		delete : function (simplecallback) {
			var inputs = {
				"testsuiteid": req.testsuiteid,
				"cycleid": req.cycleid,
				"testsuitename": suiterowdetails.testsuitename,
				"versionnumber": suiterowdetails.versionnumber,
				"query": "delete"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log("Error occured in TestSuiteDetails_Module_ICE : fail, delete");
				} else {}

				simplecallback();
			});
		},
		updatescenarioinnsuite: function (simplecallback) {
			var inputs = {
				"cycleid": req.cycleid,
				"testsuitename": req.testsuitename,
				"testsuiteid": req.testsuiteid,
				"versionnumber": suiterowdetails.versionnumber,
				"conditioncheck": conditioncheck1,
				"createdby": suiterowdetails.createdby,
				"createdon": new Date(suiterowdetails.createdon).getTime().toString(),
				"createdthrough": "createdthrough",
				"deleted": false,
				"donotexecute": donotexecute1,
				"getparampaths": getparampath1,
				"modifiedby": "Ninteen68_admin",
				"skucodetestsuite": "skucodetestsuite",
				"tags": "tags",
				"testscenarioids": req.testscenarioids,
				"query": "updatescenarioinnsuite"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					cb(null, "fail");
				} else {
					simplecallback(null, result);
				}
			});
		}
	}, function (err, data) {
		if (err) {
			console.log(err);
			cb(null, err);
		} else {
			try {
				cb(null, 'Successsssssss');
			} catch (ex) {
				console.log("Exception occured in the updating scenarios", ex);
			}
		}
	});
}

/***********************Scheduling jobs***************************/
var scheduleStatus = "";
// var deleteFlag = false;
exports.testSuitesScheduler_ICE = function (req, res) {
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
		var modInfo = req.body.moduleInfo;
		scheduleTestSuite(modInfo, req, function (err, schedulecallback) {
			try {
				res.send(schedulecallback);
			} catch (exception) {
				console.log(exception);
				res.send("fail");
			}
		});
	} else {
		res.send("Invalid Session");
	}
};

//Schedule Testsuite normal and when server restart
function scheduleTestSuite(modInfo, req, schedcallback) {
	var schedulingData = modInfo;
	var schDate,
	schTime,
	cycleId,
	scheduleId,
	clientIp,
	scenarioDetails;
	var browserList,
	testSuiteId,
	testsuitename;
	var doneFlag = 0;
	var schedFlag,
	rescheduleflag;
	var counter = 0;
	async.forEachSeries(schedulingData, function (itr, Callback) {
		schDate = itr.date;
		schDate = schDate.split("-");
		schTime = itr.time;
		schTime = schTime.split(":");
		var dateTime = new Date(Date.UTC(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1], 0));
		cycleId = itr.cycleid;
		rescheduleflag = itr.reschedule;
		browserList = itr.browserType;
		clientIp = itr.Ip;
		scheduleStatus = "scheduled";
		testSuiteId = itr.testsuiteid;
		testSuitename = itr.testsuitename;
		scenarioDetails = JSON.stringify(itr.suiteDetails);
		var sessObj;
		//Normal scheduling
		if (rescheduleflag != true) {
			scheduleId = uuid();
			sessObj = cycleId + ";" + scheduleId + ";" + dateTime.valueOf().toString();
			var dbquery = "INSERT INTO scheduledexecution (cycleid,scheduledatetime,scheduleid,browserlist,clientipaddress,clientport,scenariodetails,schedulestatus,testsuiteids,testsuitename) VALUES (" + cycleId + "," + dateTime.valueOf().toString() + "," + scheduleId + ",'[" + browserList + "]','" + clientIp + "',9494,'" + scenarioDetails + "','" + scheduleStatus + "',[" + testSuiteId + "], '" + testSuitename + "');";
			try {
				dbConnICE.execute(dbquery, function (err, result) {
					if (err) {
						console.log(err);
						schedFlag = "fail";
						schedcallback(null, schedFlag);
					} else {
						var obj = new Date(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1]);
						try {
							var scheduledjob = schedule.scheduleJob(sessObj, obj, function () {
									executeScheduling(sessObj, schedulingData, req);
								});
							counter++;
							Callback();
						} catch (ex) {
							console.log(ex);
							scheduleStatus = "Failed 02";
							updateStatus(sessObj, function (err, data) {
								if (!err) {
									console.log(data);
								}
							});
							// deleteFlag = true;
							// deleteScheduledData(deleteFlag, sessObj)
						}
					}
				});
			} catch (exception) {
				console.log(exception);
				schedFlag = "fail";
				schedcallback(null, schedFlag);
			}
		} else {
			//Rescheduling jobs on server restart
			scheduleId = itr.scheduleid;
			sessObj = cycleId + ";" + scheduleId + ";" + dateTime.valueOf().toString();
			var obj = new Date(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1]);
			try {
				var scheduledjob = schedule.scheduleJob(sessObj, obj, function () {
						executeScheduling(sessObj, schedulingData, req);
					});
				Callback();
			} catch (ex) {
				console.log(ex);
				scheduleStatus = "Failed 02";
				updateStatus(sessObj, function (err, data) {
					if (!err) {
						console.log(data);
					}
				});
				// deleteFlag = true;
				// deleteScheduledData(deleteFlag, sessObj)
			}
			// var dbquery = "UPDATE scheduledexecution SET schedulestatus = '" + scheduleStatus + "' WHERE cycleid=" + cycleId + " AND scheduledatetime=" + dateTime.valueOf().toString() + " AND scheduleid=" + scheduleId + ";";
		}
	}, function () {
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
	function executeScheduling(sessObj, schedulingData, req) {
		var dbQuery = "SELECT * from scheduledexecution WHERE cycleid=" + sessObj.split(";")[0] + " AND scheduledatetime=" + sessObj.split(";")[2] + " AND scheduleid=" + sessObj.split(";")[1] + " ALLOW FILTERING;";
		console.log(dbQuery);
		try {
			dbConnICE.execute(dbQuery, function (err, result) {
				if (err) {
					console.log(err);
					scheduleStatus = "Failed 02";
					updateStatus(sessObj, function (err, data) {
						if (!err) {
							console.log(data);
						}
					});
					// deleteFlag = true;
					// deleteScheduledData(deleteFlag, sessObj)
				} else {
					if (result.rows[0].schedulestatus == "scheduled") {
						var suiteDetails = JSON.parse(result.rows[0].scenariodetails);
						var testsuitedetailslist = [];
						var testsuiteid = JSON.parse(JSON.stringify(result.rows[0].testsuiteids))[0];
						var testsuitenm = result.rows[0].testsuitename;
						var browserType = JSON.parse(result.rows[0].browserlist);
						var ipAdd = result.rows[0].clientipaddress;
						var scenarioIdList = [];
						var dataparamlist = [];
						var conditionchecklist = [];
						var browserTypelist = [];
						var listofscenarioandtestcases = [];
						var executionRequest = {
							"executionId": "",
							"suitedetails": [],
							"testsuiteIds": []
						};
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
							browserTypelist = browserType;
							currentscenarioid = eachsuiteDetails.scenarioids;
							TestCaseDetails_Suite_ICE(currentscenarioid, schedulingData[0].userInfo.user_id, function (currentscenarioidError, currentscenarioidResponse) {
								var scenariotestcaseobj = {};
								// scenarioindex=scenarioindex + 1;
								if (currentscenarioidError) {
									console.log(currentscenarioidError);
								} else {
									if (currentscenarioidResponse != null || currentscenarioidResponse != undefined) {
										scenariotestcaseobj[currentscenarioid] = currentscenarioidResponse.listoftestcasedata;
										scenariotestcaseobj.qccredentials = eachsuiteDetails.qccredentials;
										scenariotestcaseobj.qcdetails = currentscenarioidResponse.qcdetails;
										listofscenarioandtestcases.push(scenariotestcaseobj);
										eachsuiteDetailscallback();
									}
									if (listofscenarioandtestcases.length == suiteDetails.length) {
										updateData();
										//batchExecutionDataCallback();
										scheduleStatus = "Inprogress";
										updateStatus(sessObj, function (err, data) {
											if (!err) {
												console.log(data);
											}
										});
										var a = scheduleFunction(executionRequest);
										console.log(a);
									}
								}
							});

							function updateData() {
								executionjson[testsuiteid] = listofscenarioandtestcases;
								executionjson.scenarioIds = scenarioIdList;
								executionjson.browserType = browserTypelist;
								executionjson.condition = conditionchecklist;
								executionjson.dataparampath = dataparamlist;
								executionjson.testsuiteid = testsuiteid;
								executionjson.testsuitename = testsuitenm;
								testsuitedetailslist.push(executionjson);
								//if (testsuitedetailslist.length == batchExecutionData.length) {
								excutionObjectBuilding(testsuitedetailslist);
								//}
							}
						});

						function excutionObjectBuilding(testsuitedetailslist) {
							executionRequest.executionId = JSON.parse(JSON.stringify(result.rows[0].scheduleid));
							executionRequest.suitedetails = testsuitedetailslist;
							executionRequest.testsuiteIds.push(testsuiteid);
						}

						function scheduleFunction(executionRequest) {
							console.log(executionRequest);
							// var ip = ipAdd; //req.headers['x-forwarded-for'] || req.connection.remoteAddress;
							// console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", ip);
							// if ('allSocketsMap' in myserver && ip in myserver.allSocketsMap) {
							//     var mySocket = myserver.allSocketsMap[ip];
							var name = ipAdd;
							console.log(Object.keys(myserver.allSchedulingSocketsMap), "<<all people, asking person:", name);
							if ('allSchedulingSocketsMap' in myserver && name in myserver.allSchedulingSocketsMap) {
								var mySocket = myserver.allSchedulingSocketsMap[name];
								mySocket._events.result_executeTestSuite = [];
								var starttime = new Date().getTime();
								mySocket.emit('executeTestSuite', executionRequest);
								var updateSessionExpiry = setInterval(function () {
										req.session.cookie.maxAge = sessionTime;
									}, updateSessionTimeEvery);
								mySocket.on('result_executeTestSuite', function (resultData) {
									clearInterval(updateSessionExpiry);
									if (resultData != "success" && resultData != "Terminate") {
										try {
											var scenarioid = resultData.scenarioId;
											var executionid = resultData.executionId;
											var reportdata = resultData.reportData;
											var testsuiteid = resultData.testsuiteId;
											var req_report = resultData.reportdata;
											var req_reportStepsArray = reportdata.rows;
											var req_overAllStatus = reportdata.overallstatus;
											var req_browser = reportdata.overallstatus[0].browserType;
											reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
											reportdata = JSON.parse(reportdata);
											var reportId = uuid();

											var insertReport = "INSERT INTO reports (reportid,executionid,testsuiteid,testscenarioid,executedtime,browser,modifiedon,status,report) VALUES (" + reportId + "," + executionid + "," + testsuiteid + "," + scenarioid + "," + new Date().getTime() + ",'" + req_browser + "'," + new Date().getTime() + ",'" + resultData.reportData.overallstatus[0].overallstatus + "','" + JSON.stringify(reportdata) + "')";
											var dbquery = dbConnICE.execute(insertReport, function (err, result) {
													if (err) {
														flag = "fail";
													} else {
														flag = "success";
													}
												});

											var insertIntoExecution = "INSERT INTO execution (testsuiteid,executionid,starttime,endtime) VALUES (" + testsuiteid + "," + executionid + "," + starttime + "," + new Date().getTime() + ");";
											var dbqueryexecution = dbConnICE.execute(insertIntoExecution, function (err, resultexecution) {
													if (err) {
														flag = "fail";
													} else {
														flag = "success";
													}
												});
											//console.log("this is the value:",resultData);
										} catch (ex) {
											console.log(ex);
										}
									}
									if (resultData) {
										if (typeof(resultData) == "string") {
											scheduleStatus = resultData;
										} else if (typeof(resultData) == "object") {
											scheduleStatus = resultData.reportData.overallstatus[0].overallstatus;
										}
										try {
											updateStatus(sessObj, function (err, data) {
												if (!err) {
													console.log(data);
												}
											});
											//res.send(resultData);
											console.log(resultData);
										} catch (ex) {
											console.log(ex);
										}
									}
								});
							} else {
								console.log("Socket not Available");
								// deleteFlag = true;
								// deleteScheduledData(deleteFlag, sessObj)
								scheduleStatus = "Failed 00";
								updateStatus(sessObj, function (err, data) {
									if (!err) {
										console.log(data);
									}
								});
							}
						}
					} //only jobs with scheduled status executes
				}
			});
		} catch (exception) {
			console.log(exception);
			// deleteFlag = true;
			// deleteScheduledData(deleteFlag, sessObj)
			scheduleStatus = "Failed 02";
			updateStatus(sessObj, function (err, data) {
				if (!err) {
					console.log(data);
				}
			});
		}
	}

	//Delete the scheduled job on failure of execution
	// function deleteScheduledData(delFlag, sessObj){
	//     if (delFlag == true) {
	//         var deleteQuery = "DELETE from scheduledexecution WHERE cycleid=" + sessObj.split(";")[0] + " AND scheduledatetime=" + sessObj.split(";")[2] + " AND scheduleid=" + sessObj.split(";")[1] + ";";
	//         try {
	//             dbConnICE.execute(deleteQuery, function(err, result) {
	//                 if (err) {
	//                     console.log(err);
	//                 } else {
	//                     console.log("Deletion Success");;
	//                 }
	//             });
	//         } catch (ex) {
	//             console.log(ex);
	//         }
	//     }
	// }
}

//Update status of current scheduled job
function updateStatus(sessObj, updateStatuscallback) {
	try {
		if (scheduleStatus != "") {
			var statusQuery = "UPDATE scheduledexecution SET schedulestatus = '" + scheduleStatus + "' WHERE cycleid=" + sessObj.split(";")[0] + " AND scheduledatetime=" + sessObj.split(";")[2] + " AND scheduleid=" + sessObj.split(";")[1] + ";";
			try {
				dbConnICE.execute(statusQuery, function (err, result) {
					if (err) {
						console.log(err);
						updateStatuscallback(null, "fail");
					} else {
						//console.log("Status updated successfully----", scheduleStatus);
						updateStatuscallback(null, "success");
					}
				});
			} catch (exception) {
				console.log(exception);
				updateStatuscallback(null, "fail");
			}
		}
	} catch (exception) {
		console.log(exception);
		updateStatuscallback(null, "fail");
	}
}

exports.getScheduledDetails_ICE = function (req, res) {
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
		var dbquery = "SELECT * from scheduledexecution;";
		getScheduledDetails(dbquery, function (err, getSchedcallback) {
			if (err) {
				console.log(err);
				res.send("fail");
			} else {
				try {
					res.send(getSchedcallback);
				} catch (exception) {
					console.log(exception);
					res.send("fail");
				}
			}
		});
	} else {
		res.send("Invalid Session");
	}
};

//cancel scheduled Jobs
exports.cancelScheduledJob_ICE = function (req, res) {
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
		var cycleid = req.body.suiteDetails.cycleid;
		var scheduleid = req.body.suiteDetails.scheduleid;
		var scheduledatetime = new Date(req.body.suiteDetails.scheduledatetime).valueOf().toString();
		try {
			var checkQuery = "SELECT schedulestatus FROM scheduledexecution WHERE cycleid=" + cycleid + " and scheduledatetime=" + scheduledatetime + " and scheduleid=" + scheduleid + "";
			dbConnICE.execute(checkQuery, function (err, result) {
				if (!err && result.rows.length > 0) {
					var status = result.rows[0].schedulestatus;
					if (status == "scheduled") {
						var objectD = cycleid + ";" + scheduleid + ";" + scheduledatetime.valueOf().toString();
						scheduleStatus = "cancelled";
						updateStatus(objectD, function (err, data) {
							if (!err) {
								res.send(data);
							} else
								res.send(data);
						});
					} else {
						res.send("inprogress");
					}
				} else {
					console.log(err);
					res.send("fail");
				}
			});
		} catch (exception) {
			console.log(exception);
			res.send("fail");
		}
	} else {
		res.send("Invalid Session");
	}
};

//Fetch Scheduled data
function getScheduledDetails(dbquery, schedDetailscallback) {
	try {
		dbConnICE.execute(dbquery, function (err, result) {
			if (err) {
				console.log(err);
				schedDetailscallback(null, "fail");
			} else {
				schedDetailscallback(null, result.rows);
			}
		});
	} catch (exception) {
		console.log(exception);
		schedDetailscallback(null, "fail");
	}
}

//Re-Scheduling the tasks
exports.reScheduleTestsuite = function (req, res) {
	var dbquery = "SELECT * from scheduledexecution where schedulestatus='scheduled' allow filtering;";
	var getscheduleData = [];
	try {
		getScheduledDetails(dbquery, function (err, reSchedcallback) {
			if (err) {
				console.log(err);
			} else {
				if (reSchedcallback != "fail") {
					var status;
					for (var i = 0; i < reSchedcallback.length; i++) {
						status = reSchedcallback[i].schedulestatus;
						if (status != "success" && status != "Terminate" && status != "Inprogress") {
							getscheduleData.push(reSchedcallback[i]);
						}
						if (status == "Inprogress") {
							scheduleStatus = "Failed 01";
							var objectD = reSchedcallback[i].cycleid.valueOf().toString() + ";" + reSchedcallback[i].scheduleid.valueOf().toString() + ";" + reSchedcallback[i].scheduledatetime.valueOf().toString();
							updateStatus(objectD, function (err, data) {
								if (!err) {
									console.log(data);
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
							str = JSON.stringify(itrSchData.scheduledatetime).replace(/[\\[\]\~`!@#$%^&*()+={}|;"',<>?/\s]/g, "");
							tempDD = (str.split("T")[0]).split("-");
							tempDT = (str.split("T")[1]).split(":");
							if (new Date(Date.UTC(tempDD[0], (tempDD[1] - 1), tempDD[2], tempDT[0], tempDT[1])) > new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes()))) {
								dd = tempDD[2] + "-" + tempDD[1] + "-" + tempDD[0];
								dt = tempDT[0] + ":" + tempDT[1];
								modInfo.suiteDetails = itrSchData.scenariodetails;
								modInfo.testsuitename = itrSchData.testsuitename;
								modInfo.testsuiteid = itrSchData.testsuiteids[0].valueOf().toString();
								modInfo.Ip = itrSchData.clientipaddress;
								modInfo.date = dd;
								modInfo.time = dt;
								modInfo.browserType = itrSchData.browserlist;
								modInfo.cycleid = itrSchData.cycleid.valueOf().toString();
								modInfo.reschedule = true;
								modInfo.scheduleid = itrSchData.scheduleid.valueOf().toString();
								modInformation.push(modInfo);
								scheduleTestSuite(modInformation, req, function (err, schedulecallback) {
									try {
										console.log(schedulecallback);
									} catch (exception) {
										console.log(exception);
									}
								});
							} else {
								scheduleStatus = "Failed 01";
								var objectD = itrSchData.cycleid.valueOf().toString() + ";" + itrSchData.scheduleid.valueOf().toString() + ";" + itrSchData.scheduledatetime.valueOf().toString();
								updateStatus(objectD, function (err, data) {
									if (!err) {
										console.log(data);
									}
								});
							}
							getscheduleDataCallback();
						});
					}
				} else {
					console.log("Jobs are not rescheduled");
				}
			}
		});
	} catch (ex) {
		console.log(ex);
	}
};
