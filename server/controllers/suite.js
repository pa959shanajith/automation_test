/**
 * Dependencies.
 */
var async = require('async');
var myserver = require('../lib/socket');
var uuid = require('uuid-random');
var bcrypt = require('bcrypt');
var epurl = "http://"+process.env.NDAC_IP+":"+process.env.NDAC_PORT+"/";
var Client = require("node-rest-client").Client;
var neo4jAPI = require('../controllers/neo4jAPI');
var client = new Client();
var schedule = require('node-schedule');
var scheduleStatus = "";
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');
var qList = [];

/**
 * @author vishvas.a
 * @modifiedauthor shree.p (fetching the scenario names from the scenarios table)
 * @author vishvas.a changes on 21/June/2017 with regard to Batch Execution
 * this reads the scenario information from the testsuites
 * and testsuites table of the icetestautomation keyspace
 */
exports.readTestSuite_ICE = function (req, res) {
	logger.info("Inside UI service: readTestSuite_ICE");
	qList = [];
	if (utils.isSessionActive(req.session)) {
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
			eachSuite.userInfo = {"username": req.session.username, "role": req.session.activeRole};
			logger.info("Calling function TestSuiteDetails_Module_ICE from readTestSuite_ICE");
			TestSuiteDetails_Module_ICE(eachSuite, function (TestSuiteDetailserror, TestSuiteDetailsCallback) {
				if (TestSuiteDetailserror) {
					logger.error("Error in the function TestSuiteDetails_Module_ICE from readTestSuite_ICE: %s",TestSuiteDetailserror);
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
					logger.info("Calling NDAC Service from readTestSuite_ICE: suite/readTestSuite_ICE");
					client.post(epurl + "suite/readTestSuite_ICE", args,
						function (result, response) {
						if (response.statusCode != 200 || result.rows == "fail") {
							logger.error("Error occured in suite/readTestSuite_ICE from readTestSuite_ICE Error Code : ERRNDAC");
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
								respeachscenario.testsuitename = eachSuite.testsuitename;
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
														});
													}
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
		},function(){
			logger.info("Inside final function of the service readTestSuite_ICE");
			logger.info("Calling function executeQueries from final function of the service readTestSuite_ICE");
			neo4jAPI.executeQueries(qList,function(status,result){
				if(status!=200){
					logger.error("Status:",status,"\nResponse: ",result);
				}
				else{
					logger.info('Success');
				}
				logger.info("Sending Testsuite details from the service readTestSuite_ICE");
				res.send(responsedata);
			});
		});
	} else {
		logger.error('Error in the service readTestSuite_ICE: Invalid Session');
		res.send("Invalid Session");
	}
};

/*
@ SVN function 
  Purpose : Creating testsuites
*/

function readTestSuite_ICE_SVN(req,callback) {
	qList = [];
	logger.info("Inside UI service: readTestSuite_ICE_SVN");
	if (req.data) {
		var requiredreadTestSuite = req.data.readTestSuite;
		var fromFlg = req.data.fromFlag;
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
			logger.info("Calling function TestSuiteDetails_Module_ICE from readTestSuite_ICE_SVN");
			TestSuiteDetails_Module_ICE(eachSuite, function (TestSuiteDetailserror, TestSuiteDetailsCallback) {
				if (TestSuiteDetailserror) {
					logger.error("Error in the function TestSuiteDetails_Module_ICE from readTestSuite_ICE_SVN: %s",TestSuiteDetailserror);
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
					logger.info("Calling NDAC Service from readTestSuite_ICE_SVN: suite/readTestSuite_ICE");
					client.post(epurl + "suite/readTestSuite_ICE", args,
						function (result, response) {
							if (response.statusCode != 200 || result.rows == "fail") {
								logger.error("Error occured in suite/readTestSuite_ICE_SVN from readTestSuite_ICE Error Code : ERRNDAC");
								var flag = "Error in readTestSuite_ICE : Fail";
								callback(false);
								//res(400, flag);
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
									var scenarioidindex = 0;
									async.forEachSeries(outscenarioids, function (eachoutscenarioid, outscenarioidcallback) {
										scenarioidindex = scenarioidindex + 1;
										/**
										 *  Projectnametestcasename_ICE is a function to fetch testscenario name and project name
										 * 	modified shreeram p on 15th mar 2017
										 * */
										logger.info("Calling function Projectnametestcasename_ICE from readTestSuite_ICE_SVN");
										Projectnametestcasename_ICE(eachoutscenarioid, function (eachoutscenarioiderr, eachoutscenarioiddata) {
											if (eachoutscenarioiderr) {
												logger.error("Error in the function Projectnametestcasename_ICE from readTestSuite_ICE_SVN: %s",eachoutscenarioiderr);
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
													responsedata[eachSuite.testsuitename] = respeachscenario;
													if (testsuitesindex == requiredreadTestSuite.length) {
														if (fromFlg == "scheduling") {
															utils.getSocketList("schedule", function(connectusers){
																logger.debug("IP\'s connected : %s", connectusers.join());
																var schedulingDetails = {
																	"connectedUsers": connectusers,
																	"testSuiteDetails": responsedata
																};
																callback(true);
															});
														} else
															callback(true);
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
		}, function () {
			logger.info("Inside final function of the service readTestSuite_ICE");
			logger.info("Calling function executeQueries from final function of the service readTestSuite_ICE");
			neo4jAPI.executeQueries(qList,function(status,result){
				if(status!=200){
					logger.error("Status:",status,"\nResponse: ",result);
				}
				else{
					logger.info('Success');
				}
	
			});
		});
	} else {
		logger.error('Error in the service readTestSuite_ICE: Invalid Session');
		callback(false);
	}
}

/**
 * Projectnametestcasename_ICE function is to fetch projectname and testscenario
 * created by shreeram p on 15th mar 2017
 *  */
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
				"testscenarioid": req,
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
					logger.error("Error occured in the function testcasename of Projectnametestcasename_ICE: suite/readTestSuite_ICE - fail");
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
			logger.info("Calling NDAC Service from Projectnametestcasename_ICE - projectname: suite/readTestSuite_ICE");
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in the function projectname of Projectnametestcasename_ICE: suite/readTestSuite_ICE - fail");
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
	logger.info("Inside UI service: updateTestSuite_ICE");
    qList = [];
	if (utils.isSessionActive(req.session)) {
		var userinfo = {"username": req.session.username, "role": req.session.activeRole};
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
				logger.info("Calling function deleteSuite (deletetestsuitequery) from updateTestSuite_ICE");
				deleteSuite(inputs, function (err, response) {
					if (response == "success") {
						logger.info("Calling function saveSuite (deletetestsuitequery) from updateTestSuite_ICE");
						saveSuite(function (err, response) {
							if (err) {
								logger.error("Error occured in the function saveSuite (deletetestsuitequery) from updateTestSuite_ICE");
								flag = "fail";
								res.send(flag);
							} else {
								flag = "success";
								index = index + 1;
								if (index == testscenarioids.length) {
									logger.info("Delete completed - calling next Suite. In the function saveSuite (deletetestsuitequery) from updateTestSuite_ICE");
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
					logger.info("Inside deleteSuite function");
					var args = {
						data: inputs,
						headers: {
							"Content-Type": "application/json"
						}
					};
					logger.info("Calling NDAC Service from the function deleteSuite of updateTestSuite_ICE: suite/updateTestSuite_ICE");
					client.post(epurl + "suite/updateTestSuite_ICE", args,
						function (data, response) {
						if (response.statusCode != 200 || data.rows == "fail") {
							logger.error("Error occured in suite/updateTestSuite_ICE from updateTestSuite_ICE: deleteSuite function - Error Code : ERRNDAC");
						} else {
							//Execute neo4j query!!
							//var qList=[];
							/*qList.push({"statement":"MATCH (n:TESTSUITES_NG {cycleid:'"+inputs.cycleid
									+"',testsuitename:'"+inputs.testsuitename+",'testsuiteid:'"+inputs.testsuiteid
									+"',versionnumber:["+inputs.versionnumber+"]}) set n.testscenarioids=[], n.donotexecute='null' return n"});*/

							//Relationships
							/*qList.push({"statement":"MATCH (a:TESTSUITES_NG{testsuiteid:'"+inputs.testsuiteid+"',cycleid:'"+inputs.cycleid
									+"'})-[r]->(b:TESTSCENARIOS_NG) delete r"});*/

							flag = "success";
							deleteSuitecallback(null, flag);
						}
					});
				}

				function saveSuite(saveSuite) {
					logger.info("Inside saveSuite function");
					for (var scenarioidindex = 0; scenarioidindex < testscenarioids.length; scenarioidindex++) {
						var inputs2 = {
							"query": "updatetestsuitedataquery",
							"conditioncheck": conditioncheck[scenarioidindex],
							"donotexecute": donotexecute[scenarioidindex],
							"getparampaths": getparampaths[scenarioidindex],
							"testscenarioids": testscenarioids[scenarioidindex],
							"modifiedby": userinfo.username,
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
						logger.info("Calling NDAC Service from the function saveSuite of updateTestSuite_ICE: suite/updateTestSuite_ICE");
						client.post(epurl + "suite/updateTestSuite_ICE", args,
							function (data, response) {
							if (response.statusCode != 200 || data.rows == "fail") {
								logger.error("Error occured in suite/updateTestSuite_ICE from updateTestSuite_ICE: saveSuite function - Error Code : ERRNDAC");
							} else {
								//Execute neo4j query!!
								//var qList=[];
								/*qList.push({"statement":"MATCH (n:TESTSUITES_NG {cycleid:'"+inputs2.cycleid
											+"',testsuiteid:'"+inputs2.testsuiteid+"',testsuitename:'"+inputs2.testsuitename
											+"',versionnumber:["+inputs2.versionnumber+"]}) set n.testscenarioids=n.testscenarioids+["
											+inputs2.testscenarioids+"], n.donotexecute='"+inputs2.donotexecute+"'"});*/
								//Relationship
								/*qList.push({"statement":"MATCH (a:TESTSUITES_NG{cycleid:'"+inputs2.cycleid
									+"',testsuiteid:'"+inputs2.testsuiteid+"',testsuitename:'"+inputs2.testsuitename
									+"',versionnumber:["+inputs2.versionnumber+"]})),(b:TESTSCENARIOS_NG{testscenarioid:'"+inputs2.testscenarioids+"'}) MERGE (a)-[r:FTSUTTSC_NG{id:'"+inputs2.testscenarioids+"'}]->(b)RETURN a,b,r"});*/

								//reqToAPI(qList,urlData);
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
		logger.error("Error occured in the service updateTestSuite_ICE: Invalid Session");
		res.send("Invalid Session");
	}
};

//Update execution table on completion of suite execution
function updateExecutionStatus(testsuiteid, executionid, starttime, suiteStatus) {
	logger.info("Inside updateExecutionStatus function");
	var inputs = {
		"testsuiteid": testsuiteid,
		"executionid": executionid,
		"starttime": starttime.toString(),
		"status": suiteStatus,
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
			logger.error("Error occured in updateExecutionStatus: suite/ExecuteTestSuite_ICE, Error Code : ERRNDAC");
			flag = "fail";
		} else {
			logger.info("Execution status updated successfully from updateExecutionStatus: suite/ExecuteTestSuite_ICE");
			flag = "success";
		}
	});
}

/**
 * @author shree.p
 * @author vishvas.a changes on 21/June/2017 with regard to Batch Execution
 */
exports.ExecuteTestSuite_ICE = function (req, res) {
	logger.info("Inside UI service: ExecuteTestSuite_ICE");
	if (utils.isSessionActive(req.session)) {
		var name = req.session.username;
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		var batchExecutionData = req.body.moduleInfo;
		var userInfo = {"user_id": req.session.userid, "role": req.session.activeRole};
		var testsuitedetailslist = [],testsuiteidcycmap = {};
		var scenariodescriptionobject = {};
		var testsuiteIds = [];
		var executionRequest = {
			"executionId": "",
			"suitedetails": [],
			"testsuiteIds": [],
			"apptype": ""
		};
		var executionId = uuid();
		var starttime = new Date().getTime();
		//updating number of executions happened
		var batchlength = batchExecutionData.length;
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
		logger.info("Calling NDAC Service: utility/dataUpdator_ICE from ExecuteTestSuite_ICE");
		client.post(epurl + "utility/dataUpdator_ICE", args,
			function (result, response) {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occured in utility/dataUpdator_ICE service from ExecuteTestSuite_ICE: Data Updator Fail");
			} else {
				logger.info("Data Updator Success");
			}
		});
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
				logger.info("Calling function TestCaseDetails_Suite_ICE from ExecuteTestSuite_ICE");
				TestCaseDetails_Suite_ICE(currentscenarioid, userInfo.user_id, function (currentscenarioidError, currentscenarioidResponse) {
					var scenariotestcaseobj = {};
					if (currentscenarioidError) {
						logger.error("Error occured in the function TestCaseDetails_Suite_ICE: %s",currentscenarioidError);
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
							updateData();
							batchExecutionDataCallback();
							if (testsuitedetailslist.length == batchExecutionData.length) {
								logger.info("Calling function executionFunction from TestCaseDetails_Suite_ICE function");
								var a = executionFunction(executionRequest);
							}
						}
					}
				});
				function updateData() {
					logger.info("Inside updateData function");
					executionjson[testsuiteid] = listofscenarioandtestcases;
					executionjson.scenarioIds = scenarioIdList;
					executionjson.browserType = browserType;
					executionjson.condition = conditionchecklist;
					executionjson.dataparampath = dataparamlist;
					executionjson.testsuiteid = testsuiteid;
					executionjson.testsuitename = testsuitename;
					executionjson.scenariodescriptionobject = scenariodescriptionobject;
					testsuitedetailslist.push(executionjson);
					if (testsuitedetailslist.length == batchExecutionData.length) {
						logger.info("Calling function excutionObjectBuilding from updateData function");
						excutionObjectBuilding(testsuitedetailslist,apptype);
					}
				}
			});
		});

		function excutionObjectBuilding(testsuitedetailslist,apptype) {
			logger.info("Inside excutionObjectBuilding function");
			executionRequest.executionId = executionId;
			executionRequest.suitedetails = testsuitedetailslist;
			executionRequest.testsuiteIds = testsuiteIds;
			executionRequest.apptype = apptype;
		}

		function executionFunction(executionRequest) {
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
					var updateSessionExpiry = utils.resetSession(req.session);
					function executeTestSuite_listener(channel,message) {
						data = JSON.parse(message);
						if(name == data.username){
							if (data.onAction == "unavailableLocalServer") {
								clearInterval(updateSessionExpiry);
								redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
								logger.error("Error occured in ExecuteTestSuite_ICE: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}
							} else if (data.onAction == "result_executeTestSuite") {
								var resultData = data.value;
								if (resultData != "success" && resultData != "Terminate") {
									// completedSceCount++;
									// scenarioCount = executionRequest.suitedetails[testsuitecount].scenarioIds.length;
									try {
										completedSceCount++;
										scenarioCount = executionRequest.suitedetails[testsuitecount].scenarioIds.length * executionRequest.suitedetails[testsuitecount].browserType.length;
										var scenarioid = resultData.scenarioId;
										var executionid = resultData.executionId;
										var reportdata = resultData.reportData;
										var testsuiteid = resultData.testsuiteId;
										var req_report = resultData.reportdata;
										var req_reportStepsArray = reportdata.rows;
										if (reportdata.overallstatus.length != 0) {
											var req_overAllStatus = reportdata.overallstatus;
											var req_browser = reportdata.overallstatus[0].browserType;
											reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
											reportdata = JSON.parse(reportdata);
											var reportId = uuid();
											if (resultData.reportData.overallstatus[0].overallstatus == "Pass") {
												statusPass++;
											}
											var inputs = {
												"reportid": reportId,
												"executionid": executionid,
												"testsuiteid": testsuiteid,
												"testscenarioid": scenarioid,
												"browser": req_browser,
												"cycleid": testsuiteidcycmap[testsuiteid],
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
											logger.info("Calling NDAC Service from executionFunction: suite/ExecuteTestSuite_ICE");
											client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
												function (result, response) {
												if (response.statusCode != 200 || result.rows == "fail") {
													logger.error("Error occured in suite/ExecuteTestSuite_ICE from executionFunction Error Code : ERRNDAC");
													flag = "fail";
												} else {
													logger.info("Successfully inserted report data");
													flag = "success";
												}
											});
											var inputs = {
												"reportid": reportId,
												"reportmap": JSON.stringify(executionRequest.suitedetails[testsuitecount].scenariodescriptionobject[scenarioid]),
												"query": "insertmapquery",
												"executionid": executionid,
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
													logger.error("Error occured in suite/ExecuteTestSuite_ICE from executionFunction Error Code : ERRNDAC");
													flag = "fail";
												} else {
													logger.info("Successfully inserted report data");
													flag = "success";
												}
											});

											if (completedSceCount == scenarioCount) {
												if (statusPass == scenarioCount) {
													suiteStatus = "Pass";
												} else {
													suiteStatus = "Fail";
												}
												completedSceCount = 0;
												testsuitecount++;
												logger.info("Calling function updateExecutionStatus from executionFunction");
												updateExecutionStatus(testsuiteid, executionid, starttime, suiteStatus);
											}
										} else {
											completedSceCount++;
											scenarioCount = executionRequest.suitedetails[testsuitecount].scenarioIds.length;
											if (completedSceCount == scenarioCount) {
												completedSceCount = 0;
												testsuitecount++;
												suiteStatus = "Fail";
												logger.info("Calling function updateExecutionStatus from executionFunction");
												updateExecutionStatus(testsuiteid, executionid, starttime, suiteStatus);
											}
										}
									} catch (ex) {
										logger.error("Exception in the function executionFunction: insertreportquery: %s", ex);
									}
								}
								if (resultData == "success" || resultData == "Terminate") {
									clearInterval(updateSessionExpiry);
									redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
									try {
										logger.info("Sending execution status from function executionFunction");
										res.send(resultData);
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
							logger.error("Error occured in the function executionFunction: Socket not Available");
						}
						res.send(flag);
					});
				}
			});
		}
	} else {
		logger.error("Error occured in the function executionFunction: Invalid Session");
		res.send("Invalid Session");
	}
};

/*
@SVN Service
  return : Scheduled ICE Socket Map
*/
exports.getListofScheduledSocketMap = function (req, res) {
	logger.info("Inside UI service: getListofScheduledSocketMap");
	args = {
		data: { username: req.body.username }, headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from the node service getListofScheduledSocketMap to: login/authenticateUser_Nineteen68");
	client.post(epurl + "login/authenticateUser_Nineteen68", args, function (result, response) {
		if (response.statusCode != 200 || result.rows == "fail") {
			logger.error("Error occured in getListofScheduledSocketMap service from login/authenticateUser_Nineteen68 Error Code : ERRNDAC");
			res.send({ "status": "fail", "username": "", "tokenValidation": "failed" });
		}
		else {
			validUser = false;
			for (var i = 0; i < result.rows.length; i++) {
				validUser = bcrypt.compareSync(req.body.token_id, result.rows[i].password);
				if (validUser) {
					break;
				}
			}
			if(validUser){
				logger.info("Inside UI service: getListofScheduledSocketMap authentication pass");
				utils.getSocketList("schedule", function(connectusers){
					res.send({ "status": "success", "username": connectusers,"tokenValidation": "Passed"});
				});
			}else{
				logger.info("Inside UI service: getListofScheduledSocketMap authentication failed");
				res.send({ "status": "fail", "username": "", "tokenValidation": "failed" });
			}
		}
	});
};

/*
@SVN Service
  return : return Cycle and release id based on Project id
*/

exports.getCRId = function (req, res) {
	logger.info("Inside UI service: getCRId");
	var final_data = { 'row': { 'cycleid': '', 'releaseid': '' } };
	var args = {
		data: { projectid: req.projectid }, headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from the node service getCRId to: create_ice/getReleaseIDs_nineteen68");
	client.post(epurl + "create_ice/getReleaseIDs_Nineteen68", args,
		function (result, response) {
			if (response.statusCode != 200 || result.status == "fail") {
				logger.error("Error occured in getCRId service from create_ice/getReleaseIDs_nineteen68 Error Code : ERRNDAC");
				res(400, result);
			} else {
				if (result.rows.length === 0) {
					res(400, final_data);
				} else {
					final_data.row.releaseid = result.rows[0].releaseid;
					args = {
						data: { releaseid: final_data.row.releaseid },
						headers: {
							"Content-Type": "application/json"
						}
					};
					client.post(epurl + "create_ice/getCycleIDs_Nineteen68", args, function (result1, response1) {
						if (response1.statusCode != 200 || result1.status == "fail") {
							logger.error("Error occured in getCRId service from create_ice/getCycleIDs_nineteen68 Error Code : ERRNDAC");
							res(400, result1);
						} else {
							if (result1.rows.length === 0) {
								res(400, final_data);
							} else {
								final_data.row.cycleid = result1.rows[0].cycleid;
								res(200, final_data);
							}
						}
					});
				}
			}
	});
};

/*
@SVN Service
  return : Execution Result
*/

exports.ExecuteTestSuite_ICE_SVN = function (req, res) {
	logger.info("Inside UI service: ExecuteTestSuite_ICE_SVN");
	var final_data = {};
	var sc_map = {};
	var module_data = {};
	var valid_userdata = [];
	var testsuite_creation_data = {};
	var result_to_send = { "execution_status": [] };
	async.eachSeries(req.body.execution_data, function (uservalidation_iterator, cb_validation) {
		uservalidation_iterator.userInfo.ice_username = uservalidation_iterator.userInfo.ice_username.toLowerCase();
		uservalidation_iterator.userInfo.username = uservalidation_iterator.userInfo.username.toLowerCase();
		result_status = {
			"userName": uservalidation_iterator.userInfo.username,
			"ice_userName": uservalidation_iterator.userInfo.ice_username,
			"moduleInfo": [],
			"tokenValidation": "failed"
		};
		args_validation = {
			data: { 'username': result_status.userName },
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling NDAC Service from ExecuteTestSuite_ICE_SVN: login/authenticateUser_Nineteen68");
		client.post(epurl + "login/authenticateUser_Nineteen68", args_validation, function (result, response) {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occured in ExecuteTestSuite_ICE_SVN service from login/authenticateUser_Nineteen68 Error Code : ERRNDAC");
				cb_validation('err');
			} else {
				var validUser = false;
				for (var i = 0; i < result.rows.length; i++) {
					validUser = bcrypt.compareSync(uservalidation_iterator.userInfo.token_id, result.rows[i].password);
					if (validUser) {
						uservalidation_iterator.userInfo.user_id = result.rows[i].userid;
						uservalidation_iterator.userInfo.userrole = "CI";  // Since it's a CI_User, so it has execute only permissions. Hence role is CI.
						break;
					}
				}
				if (validUser) {
					valid_userdata.push(uservalidation_iterator);
					result_status.tokenValidation = "passed";
					final_data[uservalidation_iterator.userInfo.ice_username] = result_status;
				}
				else {
					final_data[uservalidation_iterator.userInfo.ice_username] = result_status;
					result_to_send.execution_status.push(final_data);
					logger.info("Inside UI service: ExecuteTestSuite_ICE_SVN Token authentication failed for username:",uservalidation_iterator.userInfo.ice_username);
				}
				cb_validation();
			}
		});
	}, function (err) {
		if (err || valid_userdata.length == 0){
			logger.error("Error occured in ExecuteTestSuite_ICE_SVN service token validation");
			res.send('failed in validation');
		}
		else {
			async.each(valid_userdata, function (userdata_iterator, cb) {
				module_data[userdata_iterator.userInfo.ice_username] = [];
				testsuite_creation_data[userdata_iterator.userInfo.ice_username] = { "fromFlag": "", "param": "readTestSuite", "readTestSuite": [] };
				for (var i = 0; i < userdata_iterator.moduleInfo.length; i++) {
					module_info_data = {
						"browserType": userdata_iterator.browserType,
						"suiteDetails": [],
						"testsuiteid": userdata_iterator.moduleInfo[i].moduleId,
						"testsuitename": userdata_iterator.moduleInfo[i].moduleName,
						"appType": userdata_iterator.moduleInfo[i].appType
					};
					module_data[userdata_iterator.userInfo.ice_username].push(module_info_data);

				}
				async.eachSeries(userdata_iterator.moduleInfo, function (moduleinfo_iterator, cb1) {
					testsuite_args = {
						data: {
							"query": 'testsuitecheck',
							"cycleid": moduleinfo_iterator.cycleId,
							"testsuiteid": moduleinfo_iterator.moduleId
						}, headers: {
							"Content-Type": "application/json"
						}
					};
					logger.info("Calling NDAC Service from ExecuteTestSuite_ICE_SVN:suite/readTestSuite_ICE");
					client.post(epurl + "suite/readTestSuite_ICE", testsuite_args,
						function (result_details, response) {
							if (response.statusCode != 200 || result_details.rows == "fail") {
								logger.error("Error occured in ExecuteTestSuite_ICE_SVN service from suite/readTestSuite_ICE Error Code : ERRNDAC");
							}
							else {
								var module_index = userdata_iterator.moduleInfo.indexOf(moduleinfo_iterator);
								var moduleResult = { "moduleName": "", "moduleId": "", "suiteDetails": [] };
								var readTestSuite = {
									"assignedTestScenarioIds": "",
									"cycleid": moduleinfo_iterator.cycleId,
									"projectidts": moduleinfo_iterator.projectId,
									"releaseid": moduleinfo_iterator.releaseId,
									"testsuiteid": moduleinfo_iterator.moduleId,
									"testsuitename": moduleinfo_iterator.moduleName,
									"versionnumber": moduleinfo_iterator.versionNumber,
									"userInfo": userdata_iterator.userInfo
								};
								for (var j = 0; j < moduleinfo_iterator.suiteDetails.length; j++) {
									var testsuite_data = {
										"condition": "", "dataparam": "", "executestatus": "", "scenarioids":
										"", "qccredentials": { "qcpassword": "", "qcurl": "", "qcusername": "" }
									};
									if (result_details.rows.length != 0) {
										testsuite_data["condition"] = result_details.rows[0].conditioncheck;
										testsuite_data["executestatus"] = result_details.rows[0].donotexecute;
										testsuite_data["dataparam"] = result_details.rows[0].getparampaths;
									}
									testsuite_data["scenarioids"] = moduleinfo_iterator.suiteDetails[j].scenarios_id;
									sc_map[testsuite_data["scenarioids"]] = moduleinfo_iterator.suiteDetails[j].scenarios_name;
									module_data[userdata_iterator.userInfo.ice_username][module_index].suiteDetails.push(testsuite_data);
								}
								testsuite_creation_data[userdata_iterator.userInfo.ice_username].readTestSuite.push(readTestSuite);
								moduleResult.moduleName = moduleinfo_iterator.moduleName;
								moduleResult.moduleId = moduleinfo_iterator.moduleId;
								final_data[userdata_iterator.userInfo.ice_username].moduleInfo.push(moduleResult);
							}
							cb1();
						});
				}, function (err) {
					if (err) {
						logger.error("Error occured in ExecuteTestSuite_ICE_SVN service:",err);
						cb();
					}
					else {
						data_to_send = { "data": testsuite_creation_data[userdata_iterator.userInfo.ice_username] };
						readTestSuite_ICE_SVN(data_to_send, function (suite_status) {
							if (!suite_status) {
								logger.error("Error occured in ExecuteTestSuite_ICE_SVN service in creating testsuites");
								res.send('Secnarios creation failed');
							}
							else {
								var batchExecutionData = module_data[userdata_iterator.userInfo.ice_username];
								var userInfo = userdata_iterator.userInfo;
								var testsuitedetailslist = [];
								var testsuiteIds = [];
								var executionRequest = {
									"executionId": "",
									"suitedetails": [],
									"testsuiteIds": [],
									"apptype": ""
								};
								var executionId = uuid();
								var starttime = new Date().getTime();
								//updating number of executions happened
								var batchlength = batchExecutionData.length;
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
								logger.info("Calling NDAC Service from ExecuteTestSuite_ICE_SVN:utility/dataUpdator_ICE");
								client.post(epurl + "utility/dataUpdator_ICE", args,
									function (result, response) {
										if (response.statusCode != 200 || result.rows == "fail") {
											logger.error("Error occured in ExecuteTestSuite_ICE_SVN service from utility/dataUpdator_ICE Error Code : ERRNDAC");
										} else {
											logger.info("Inside ExecuteTestSuite_ICE_SVN service from utility/dataUpdator_ICE:Data updator Success");
										}
									});
								async.forEachSeries(batchExecutionData, function (eachbatchExecutionData, batchExecutionDataCallback) {
									var suiteDetails = eachbatchExecutionData.suiteDetails;
									var testsuitename = eachbatchExecutionData.testsuitename;
									var testsuiteid = eachbatchExecutionData.testsuiteid;
									var browserType = eachbatchExecutionData.browserType;
									var apptype = eachbatchExecutionData.appType;
									var listofscenarioandtestcases = [];
									var scenarioIdList = [];
									var dataparamlist = [];
									var conditionchecklist = [];
									var browserTypelist = [];
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
											if (currentscenarioidError) {
												logger.error("Error occured in ExecuteTestSuite_ICE_SVN service");
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
														var a = executionFunction(executionRequest, userInfo.ice_username);
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
												excutionObjectBuilding(testsuitedetailslist, apptype);
											}
										}
									});
								});

								function excutionObjectBuilding(testsuitedetailslist, apptype) {
									executionRequest.executionId = executionId;
									executionRequest.suitedetails = testsuitedetailslist;
									executionRequest.testsuiteIds = testsuiteIds;
									executionRequest.apptype = apptype;
								}

								function executionFunction(executionRequest, username) {
									// var name = req.session.username;
									var name = username;
									redisServer.redisSubServer.subscribe('ICE2_' + name);
									var scenarioCount = executionRequest.suitedetails[0].scenarioIds.length;
									var completedSceCount = 0;
									var statusPass = 0;
									var suiteStatus;
									redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
										if (redisres[1]>0) {
											logger.info("Sending socket request for executeTestSuite to redis");
											dataToIce = {"emitAction" : "executeTestSuite","username" : name, "executionRequest": executionRequest};
											redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
											// var updateSessionExpiry = utils.resetSession(req.session);
											function executeTestSuite_listener(channel,message) {
												data = JSON.parse(message);
												if(name == data.username){
													if (data.onAction == "unavailableLocalServer") {
														// clearInterval(updateSessionExpiry);
														redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
														logger.error("Error occured in ExecuteTestSuite_ICE_SVN: Socket Disconnected");
														if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
															var soc = myserver.socketMapNotify[name];
															soc.emit("ICEnotAvailable");
														}
													} else if (data.onAction == "result_executeTestSuite") {
														var resultData = data.value;
														completedSceCount++;
														if (resultData != "success" && resultData != "Terminate") {
															try {
																var scenarioid = resultData.scenarioId;
																var executionid = resultData.executionId;
																var reportdata = resultData.reportData;
																var testsuiteid = resultData.testsuiteId;
																var req_report = resultData.reportdata;
																var req_reportStepsArray = reportdata.rows;
																if (reportdata.overallstatus.length != 0) {
																	var req_overAllStatus = reportdata.overallstatus;
																	var req_browser = reportdata.overallstatus[0].browserType;
																	reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
																	reportdata = JSON.parse(reportdata);
																	if (scenarioid in sc_map)
																		reportdata.overallstatus[0]["secnarios_name"] = sc_map[scenarioid];
																	reportdata.overallstatus[0]["secnarios_id"] = scenarioid;
																	for (var k = 0; k < final_data[username].moduleInfo.length; k++) {
																		if (final_data[username].moduleInfo[k].moduleId == testsuiteid)
																			final_data[username].moduleInfo[k].suiteDetails.push(reportdata.overallstatus[0]);
																	}
																	var reportId = uuid();
																	if (resultData.reportData.overallstatus[0].overallstatus == "Pass") {
																		statusPass++;
																	}
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
																	logger.info("Calling NDAC Service from ExecuteTestSuite_ICE_SVN:suite/ExecuteTestSuite_ICE");
																	client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
																		function (result, response) {
																			if (response.statusCode != 200 || result.rows == "fail") {
																				logger.error("Error occured in ExecuteTestSuite_ICE_SVN service from suite/ExecuteTestSuite_ICE Error Code : ERRNDAC");
																				flag = "fail";
																			} else {
																				flag = "success";
																			}
																		});
																	if (completedSceCount == scenarioCount) {
																		if (statusPass == scenarioCount) {
																			suiteStatus = "Pass";
																		} else {
																			suiteStatus = "Fail";
																		}
																		updateExecutionStatus(testsuiteid, executionid, starttime, suiteStatus);
																	}
																} else {
																	if (completedSceCount == scenarioCount) {
																		suiteStatus = "Fail";
																		updateExecutionStatus(testsuiteid, executionid, starttime, suiteStatus);
																	}
																}
															} catch (ex) {
																logger.error("Error occured in ExecuteTestSuite_ICE_SVN service:",ex);
															}
														}
														if (resultData == "success" || resultData == "Terminate") {
															// clearInterval(updateSessionExpiry);
															redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
															try {
																result_to_send.execution_status.push(final_data[username]);
																cb();
															} catch (ex) {
																//	cb();
																logger.error("Error occured in ExecuteTestSuite_ICE_SVN service:",ex);
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
													logger.error("Error occured in ExecuteTestSuite_ICE_SVN service: Socket not Available");
												}
												res.send(flag);
											});
										}
									});
								}
							}
						});
					}
				});
			}, function (err) {
				if (err) {
					res.send('failed');
					logger.error("Error occured in ExecuteTestSuite_ICE_SVN service:",err);
				}
				else {
					res.send(result_to_send);
					logger.info('Completed_Successfully...!!');
				}
			});
		}
	});
};

/**
 * @author shree.p
 * @see function to execute test suites from jenkins
 */
exports.ExecuteTestSuite_ICE_CI = function (req, res) {
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
			"userid": name
		};
		var args = {
			data: updateinp,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling NDAC Service from ExecuteTestSuite_ICE_CI: utility/dataUpdator_ICE");
		client.post(epurl + "utility/dataUpdator_ICE", args,
			function (result, response) {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occured in utility/dataUpdator_ICE service from ExecuteTestSuite_ICE_CI: Data Updator Fail");
			} else {
				logger.info("Data Updator Success");
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
				logger.info("Calling function TestCaseDetails_Suite_ICE from ExecuteTestSuite_ICE_CI");
				TestCaseDetails_Suite_ICE(currentscenarioid, name, function (currentscenarioidError, currentscenarioidResponse) {
					var scenariotestcaseobj = {};
					if (currentscenarioidError) {
						logger.error("Error occured in the function TestCaseDetails_Suite_ICE from ExecuteTestSuite_ICE_CI: %s",currentscenarioidError);
					} else {
						if (currentscenarioidResponse != null || currentscenarioidResponse != undefined) {
							scenariotestcaseobj[currentscenarioid] = currentscenarioidResponse;
							listofscenarioandtestcases.push(scenariotestcaseobj);
							eachsuiteDetailscallback();
						}
						if (listofscenarioandtestcases.length == suiteDetails.length) {
							logger.info("Calling function updateData from TestCaseDetails_Suite_ICE from ExecuteTestSuite_ICE_CI");
							updateData();
							batchExecutionDataCallback();
							if (testsuitedetailslist.length == batchExecutionData.length) {
								logger.info("Calling function executionFunction from TestCaseDetails_Suite_ICE from ExecuteTestSuite_ICE_CI");
								var a = executionFunction(executionRequest);
							}
						}
					}
				});
				function updateData() {
					logger.info("Inside updateData function in ExecuteTestSuite_ICE_CI");
					executionjson[testsuiteid] = listofscenarioandtestcases;
					executionjson.scenarioIds = scenarioIdList;
					executionjson.browserType = browserType;
					executionjson.condition = conditionchecklist;
					executionjson.dataparampath = dataparamlist;
					executionjson.testsuiteid = testsuiteid;
					executionjson.testsuitename = testsuitename;
					testsuitedetailslist.push(executionjson);
					if (testsuitedetailslist.length == batchExecutionData.length) {
						logger.info("Calling function excutionObjectBuilding from updateData in ExecuteTestSuite_ICE_CI");
						excutionObjectBuilding(testsuitedetailslist);
					}
				}
			});

		});

		function excutionObjectBuilding(testsuitedetailslist) {
			logger.info("Inside excutionObjectBuilding function in ExecuteTestSuite_ICE_CI");
			executionRequest.executionId = executionId;
			executionRequest.suitedetails = testsuitedetailslist;
			executionRequest.testsuiteIds = testsuiteIds;
		}

		function executionFunction(executionRequest) {
			logger.info("Inside executionFunction function in ExecuteTestSuite_ICE_CI");
			//var scenarioCount = executionRequest.suitedetails[0].scenarioIds.length;
			var completedSceCount = 0;
			var testsuitecount=0;
			var statusPass = 0;
			var suiteStatus;
			logger.info("ICE Socket requesting Address: %s" , name);
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]>0) {
					logger.info("Sending socket request for executeTestSuite to redis");
					dataToIce = {"emitAction" : "executeTestSuite","username" : name, "executionRequest": executionRequest};
					redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					var updateSessionExpiry = utils.resetSession(req.session);
					function executeTestSuite_listener(channel,message) {
						data = JSON.parse(message);
						if(name == data.username){
							if (data.onAction == "unavailableLocalServer") {
								clearInterval(updateSessionExpiry);
								redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
								logger.error("Error occured in ExecuteTestSuite_ICE_CI: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}
							} else if (data.onAction == "result_executeTestSuite") {
								var resultData = data.value;
								if (resultData != "success" && resultData != "Terminate") {
									completedSceCount++;
									scenarioCount = executionRequest.suitedetails[testsuitecount].scenarioIds.length;
									try {
										var scenarioid = resultData.scenarioId;
										var executionid = resultData.executionId;
										var reportdata = resultData.reportData;
										var testsuiteid = resultData.testsuiteId;
										var req_report = resultData.reportdata;
										var req_reportStepsArray = reportdata.rows;
										if (reportdata.overallstatus.length != 0) {
											var req_overAllStatus = reportdata.overallstatus;
											var req_browser = reportdata.overallstatus[0].browserType;
											reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
											reportdata = JSON.parse(reportdata);
											var reportId = uuid();
											if (resultData.reportData.overallstatus[0].overallstatus == "Pass") {
												statusPass++;
											}
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
											logger.info("Calling NDAC Service from executionFunction in ExecuteTestSuite_ICE_CI: suite/ExecuteTestSuite_ICE");
											client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
												function (result, response) {
												if (response.statusCode != 200 || result.rows == "fail") {
													logger.error("Error occured in suite/ExecuteTestSuite_ICE from executionFunction in ExecuteTestSuite_ICE_CI Error Code : ERRNDAC");
													flag = "fail";
												} else {
													logger.info("Successfully inserted report data");
													flag = "success";
												}
											});
											if (completedSceCount == scenarioCount) {
												if (statusPass == scenarioCount) {
													suiteStatus = "Pass";
												} else {
													suiteStatus = "Fail";
												}
												completedSceCount = 0;
												testsuitecount++;
												logger.info("Calling function updateExecutionStatus from executionFunction in ExecuteTestSuite_ICE_CI");
												updateExecutionStatus(testsuiteid, executionid, starttime, suiteStatus);
											}
										} else {
											if (completedSceCount == scenarioCount) {
												suiteStatus = "Fail";
												completedSceCount = 0;
												testsuitecount++;
												logger.info("Calling function updateExecutionStatus from executionFunction in ExecuteTestSuite_ICE_CI");
												updateExecutionStatus(testsuiteid, executionid, starttime, suiteStatus);
											}
										}
									} catch (ex) {
										logger.error("Exception in the function executionFunction in ExecuteTestSuite_ICE_CI: insertreportquery: %s", ex);
									}
								}
								if (resultData == "success" || resultData == "Terminate") {
									clearInterval(updateSessionExpiry);
									redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
									try {
										logger.info("Sending execution status from function executionFunction in ExecuteTestSuite_ICE_CI");
										res.send(resultData);
									} catch (ex) {
										logger.error("Exception While sending execution status from the function executionFunction in ExecuteTestSuite_ICE_CI: %s", ex);
										res.send("fail");
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
							logger.error("Error occured in the function executionFunction in ExecuteTestSuite_ICE_CI: Socket not Available");
						}
						res.send(flag);
					});
				}
			});
		}
	} else {
		logger.error("Error occured in the function executionFunction in ExecuteTestSuite_ICE_CI: Invalid Session");
		res.send("Invalid Session");
	}
};

function TestCaseDetails_Suite_ICE(req, userid, cb, data) {
	logger.info("Inside TestCaseDetails_Suite_ICE function");
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
			logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcaseid");
			client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcaseid, Error Code : ERRNDAC");
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
				logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasesteps");
				client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
					function (screenidresponse, response) {
					if (response.statusCode != 200 || screenidresponse.rows == "fail") {
						logger.error("Error occured in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasesteps, Error Code : ERRNDAC");
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
								logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - getscreendataquery");
								client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
									function (screendataresponse, response) {
									if (response.statusCode != 200 || screendataresponse.rows == "fail") {
										logger.error("Error occured in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - getscreendataquery, Error Code : ERRNDAC");
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
													logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery");
													client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
														function (answers, response) {
														if (response.statusCode != 200 || answers.rows == "fail") {
															logger.error("Error occured in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery, Error Code : ERRNDAC");
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
													logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery");
													client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
														function (answers, response) {
														if (response.statusCode != 200 || answers.rows == "fail") {
															logger.error("Error occured in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery, Error Code : ERRNDAC");
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
												logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery");
												client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
													function (answers, response) {
													if (response.statusCode != 200 || answers.rows == "fail") {
														logger.error("Error occured in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery, Error Code : ERRNDAC");
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
											logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery");
											client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
												function (answers, response) {
												if (response.statusCode != 200 || answers.rows == "fail") {
													logger.error("Error occured in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery, Error Code : ERRNDAC");
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
								logger.info("Calling NDAC Service: suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery");
								client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
									function (answers, response) {
									if (response.statusCode != 200 || answers.rows == "fail") {
										logger.error("Error occured in suite/ExecuteTestSuite_ICE from TestCaseDetails_Suite_ICE - testcasestepsquery, Error Code : ERRNDAC");
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
							logger.error("Exception occured in TestCaseDetails_Suite_ICE : %s", exception);
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
			client.post(epurl + "qualityCenter/viewQcMappedList_ICE", args,
				function (qcdetailsows, response) {
				if (response.statusCode != 200 || qcdetailsows.rows == "fail") {
					logger.error("Error occured in qualityCenter/viewQcMappedList_ICE from qcscenariodetails Error Code : ERRNDAC");
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
		logger.info("Inside final function of TestCaseDetails_Suite_ICE");
		var obj = {
			"listoftestcasedata": JSON.stringify(listoftestcasedata),
			"qcdetails": qcdetails
		};
		if (err) {
			logger.error("Error occured in the final function of TestCaseDetails_Suite_ICE");
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
	if (utils.isSessionActive(req.session)) {
		var requiredtestscenarioid = req.body.testScenarioId;
		logger.info("Calling function testcasedetails_testscenarios from getTestcaseDetailsForScenario_ICE");
		testcasedetails_testscenarios(requiredtestscenarioid, function (err, data) {
			if (err) {
				logger.error("Error occured in the testcasedetails_testscenarios function of getTestcaseDetailsForScenario_ICE");
				res.send("fail");
			} else {
				try {
					logger.info("Sending response data from testcasedetails_testscenarios function of getTestcaseDetailsForScenario_ICE");
					res.send(JSON.stringify(data));
				} catch (ex) {
					logger.error("Exception occured in getTestcaseDetailsForScenario_ICE: %s", ex);
				}
			}
		});
	} else {
		logger.error("Error occured in the testcasedetails_testscenarios: Invalid Session");
		res.send("Invalid Session");
	}
};

//Function to fetch all the testcase,screen and project names for provided scenarioid
function testcasedetails_testscenarios(req, cb, data) {
	logger.info("Inside testcasedetails_testscenarios function");
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
			logger.info("Calling NDAC Service from testcasedetails_testscenarios - testscenariotable: suite/getTestcaseDetailsForScenario_ICE");
			client.post(epurl + "suite/getTestcaseDetailsForScenario_ICE", args,
				function (testscenarioresult, response) {
				if (response.statusCode != 200 || testscenarioresult.rows == "fail") {
					logger.error("Error occured in suite/getTestcaseDetailsForScenario_ICE from testcasedetails_testscenarios - testscenariotable, Error Code : ERRNDAC");
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
				logger.info("Calling NDAC Service from testcasedetails_testscenarios - testcasetable: suite/getTestcaseDetailsForScenario_ICE");
				client.post(epurl + "suite/getTestcaseDetailsForScenario_ICE", args,
					function (testcaseresult, response) {
					if (response.statusCode != 200 || testcaseresult.rows == "fail") {
						logger.error("Error occured in suite/getTestcaseDetailsForScenario_ICE from testcasedetails_testscenarios - testcasetable, Error Code : ERRNDAC");
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
				logger.info("Calling NDAC Service from testcasedetails_testscenarios - screentable: suite/getTestcaseDetailsForScenario_ICE");
				client.post(epurl + "suite/getTestcaseDetailsForScenario_ICE", args,
					function (screenresult, response) {
					if (response.statusCode != 200 || screenresult.rows == "fail") {
						logger.error("Error occured in suite/getTestcaseDetailsForScenario_ICE from testcasedetails_testscenarios - screentable, Error Code : ERRNDAC");
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
				logger.info("Calling NDAC Service from testcasedetails_testscenarios - projecttable: suite/getTestcaseDetailsForScenario_ICE");
				client.post(epurl + "suite/getTestcaseDetailsForScenario_ICE", args,
					function (projectresult, response) {
					if (response.statusCode != 200 || projectresult.rows == "fail") {
						logger.error("Error occured in suite/getTestcaseDetailsForScenario_ICE from testcasedetails_testscenarios - projecttable, Error Code : ERRNDAC");
					} else {
						if (projectresult.rows.length != 0)
							projectnamelist.push(projectresult.rows[0].projectname);
					}
					callback4();
				});
			}, callback);
		}
	}, function (err, data) {
		logger.info("Inside final function of testcasedetails_testscenarios");
		if (err) {
			logger.error("Error occured in final function of testcasedetails_testscenarios: %s", err);
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

function TestSuiteDetails_Module_ICE(req, cb1, data) {
	logger.info("Inside TestSuiteDetails_Module_ICE function");
	var requiredcycleid = req.cycleid;
	var requiredtestsuiteid = req.testsuiteid;
	var requiredtestsuitename = req.testsuitename;
	var userInfo = req.userInfo;
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
			logger.info("Calling NDAC Service from TestSuiteDetails_Module_ICE - testsuitecheck: suite/readTestSuite_ICE");
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in suite/readTestSuite_ICE from TestSuiteDetails_Module_ICE - testsuitecheck, Error Code : ERRNDAC");
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
			logger.info("Calling NDAC Service from TestSuiteDetails_Module_ICE - selectmodule: suite/readTestSuite_ICE");
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in suite/readTestSuite_ICE from TestSuiteDetails_Module_ICE - selectmodule, Error Code : ERRNDAC");
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
			if (testscenarioids == null) {
				testscenarioids = [];
			}
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
					"createdby": userInfo.username,
					"createdthrough": "Mindmaps Creation",
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
				logger.info("Calling NDAC Service from TestSuiteDetails_Module_ICE - testcasesteps: suite/readTestSuite_ICE");
				client.post(epurl + "suite/readTestSuite_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in suite/readTestSuite_ICE from TestSuiteDetails_Module_ICE - testcasesteps, Error Code : ERRNDAC");
						cb1(null, flag);
					} else {
						for(var te=0;te<inputs.testscenarioids.length;te++){inputs.testscenarioids[te]='"'+inputs.testscenarioids[te]+'"';}
						/*qList.push({"statement":"MERGE (n:TESTSUITES_NG {cycleid:'"+inputs.cycleid
									+"',testsuitename:'"+inputs.testsuitename+"',testsuiteid:'"+inputs.testsuiteid+"',testscenarioids:["
									+inputs.testscenarioids+"],donotexecute:'["
									+inputs.donotexecute+"]',versionnumber:["+inputs.versionnumber
									+"]}) SET n.deleted='"+inputs.deleted+"'"});*/
									//Relationships
									//for(i=0; i<inputs.testscenarioids.length;i++){
										/*qList.push({"statement":"MATCH (a:TESTSUITES_NG{testsuiteid:'"+inputs.testsuiteid+"',cycleid:'"+inputs.cycleid
									+"'}),(b:TESTSCENARIOS_NG{testscenarioid:"+inputs.testscenarioids[i]+"}) MERGE (a)-[r:FTSUTTSC_NG{id:"+inputs.testscenarioids[i]+"}]->(b)RETURN r"});*/
									//}
									//qList.push({"statement":"MATCH (a:CYCLES_NG{cycleid:'"+inputs.cycleid+"'}),(b:TESTSUITES_NG{testsuiteid:'"+inputs.testsuiteid+"',cycleid:'"+inputs.cycleid+"'}) MERGE (a)-[r:FCYCTTSU_NG{id:'"+inputs.testsuiteid+"'}]->(b)RETURN r"});
						//reqToAPI(qList,urlData);
						callback(null, flag);
					}
				});
			} else {
				var jsondata = {
					"testsuiteid": requiredtestsuiteid,
					"cycleid": requiredcycleid,
					"testsuitename": requiredtestsuitename,
					"versionnumber": versionnumber,
					"testscenarioids": testscenarioids,
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
	var suiterowdetails = {};
	var getparampath1 = [];
	var conditioncheck1 = [];
	var donotexecute1 = [];
	async.series({
		fetchdata: function (simplecallback) {
			logger.info("Inside fetchdata function of updatescenariodetailsinsuite()");
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
			logger.info("Calling NDAC Service from updatescenariodetailsinsuite - fetchdata: suite/readTestSuite_ICE");
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in suite/readTestSuite_ICE from updatescenariodetailsinsuite - fetchdata, Error Code: ERRNDAC");
				} else {
					if (result.rows.length != 0)
						suiterowdetails = result.rows[0];
				}
				simplecallback();
			});
		},
		validatedata: function (simplecallback) {
			logger.info("Inside validatedata function of updatescenariodetailsinsuite()");
			var scenarioidstocheck = suiterowdetails.testscenarioids;
			var verifyscenarioid = req.testscenarioids;
			var getparampath = suiterowdetails.getparampaths;
			var conditioncheck = suiterowdetails.conditioncheck;
			var donotexecute = suiterowdetails.donotexecute;
			if (scenarioidstocheck != null) {
				scenarioidstocheck = JSON.parse(JSON.stringify(scenarioidstocheck));
			} else {
				scenarioidstocheck = [];
			}
			for (var i = 0; i < verifyscenarioid.length; i++) {
				var index = scenarioidstocheck.indexOf(verifyscenarioid[i]);
				if (index != -1) {
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
			logger.info("Inside delete function of updatescenariodetailsinsuite()");
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
			logger.info("Calling NDAC Service from updatescenariodetailsinsuite - delete: suite/readTestSuite_ICE");
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in suite/readTestSuite_ICE from updatescenariodetailsinsuite - delete, Error Code: ERRNDAC");
				} //else {
					//Execute neo4j query!!
					//var qList=[];
					/*qList.push({"statement":"MATCH (n:TESTSUITES_NG {cycleid:'"+inputs.cycleid
					+"',testsuitename:'"+inputs.testsuitename+"',testsuiteid:'"+inputs.testsuiteid+"'}) DETACH DELETE n"});*/
				//}
				simplecallback();
			});
		},
		updatescenarioinnsuite: function (simplecallback) {
			logger.info("Inside updatescenarioinnsuite function of updatescenariodetailsinsuite()");
			var inputs = {
				"cycleid": req.cycleid,
				"testsuitename": req.testsuitename,
				"testsuiteid": req.testsuiteid,
				"versionnumber": suiterowdetails.versionnumber,
				"conditioncheck": conditioncheck1,
				"createdby": suiterowdetails.createdby,
				"createdon": new Date(suiterowdetails.createdon).getTime().toString(),
				"createdthrough": suiterowdetails.createdthrough,
				"deleted": false,
				"donotexecute": donotexecute1,
				"getparampaths": getparampath1,
				"modifiedby": req.userInfo.username,
				"modifiedbyrole": req.userInfo.userrole,
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
			logger.info("Calling NDAC Service from updatescenariodetailsinsuite - updatescenarioinnsuite: suite/readTestSuite_ICE");
			client.post(epurl + "suite/readTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in suite/readTestSuite_ICE from updatescenariodetailsinsuite - updatescenarioinnsuite, Error Code: ERRNDAC");
					cb(null, "fail");
				} else {
					//Execute neo4j query!!
					//var qList=[];
					for(var te=0;te<inputs.testscenarioids.length;te++){inputs.testscenarioids[te]='"'+inputs.testscenarioids[te]+'"';}
					for(var te=0;te<inputs.donotexecute.length;te++){inputs.donotexecute[te]='"'+inputs.donotexecute[te]+'"';}
					inputs.donotexecute1 = inputs.donotexecute.join(',');
					inputs.testscenarioids1 = inputs.testscenarioids.join(',');
					/*qList.push({"statement":"MERGE (n:TESTSUITES_NG {cycleid:'"+inputs.cycleid
								+"',testsuitename:'"+inputs.testsuitename+"',testsuiteid:'"+inputs.testsuiteid+"',deleted:'"+inputs.deleted
								+"',versionnumber:["+inputs.versionnumber+"]}) set n.testscenarioids=["
								+inputs.testscenarioids1+"], n.donotexecute=["+inputs.donotexecute1+"]"});*/

					//Relationships
					/*qList.push({"statement":"MATCH (a:TESTSUITES_NG{testsuiteid:'"+inputs.testsuiteid+"',cycleid:'"+inputs.cycleid
									+"'})-[r]->(b:TESTSCENARIOS_NG) delete r"});*/
					//for(var te=0;te<inputs.testscenarioids.length;te++){
						/*qList.push({"statement":"MATCH (a:TESTSUITES_NG{testsuiteid:'"+inputs.testsuiteid+"',cycleid:'"+inputs.cycleid
									+"'}),(b:TESTSCENARIOS_NG) WHERE b.testscenarioid IN a.testscenarioids MERGE (a)-[r:FTSUTTSC_NG{id:'"+inputs.testscenarioids[te]+"'}]->(b)RETURN r"});*/
					//}
					//qList.push({"statement":"MATCH (a:CYCLES_NG{cycleid:'"+inputs.cycleid+"'}),(b:TESTSUITES_NG{testsuiteid:'"+inputs.testsuiteid+"',cycleid:'"+inputs.cycleid+"'}) MERGE (a)-[r:FCYCTTSU_NG{id:'"+inputs.testsuiteid+"'}]->(b)RETURN r"});
					//reqToAPI(qList,urlData);

					simplecallback(null, result);
				}
			});
		}
	}, function (err, data) {
		logger.info("Inside final function of updatescenariodetailsinsuite");
		if (err) {
			logger.error("Error occured in the final function of updatescenariodetailsinsuite: %s", err);
			cb(null, err);
		} else {
			try {
				cb(null, 'Successsssssss');
			} catch (ex) {
				logger.error("Exception occured in the updating scenarios in the final function of updatescenariodetailsinsuite: %s", ex);
			}
		}
	});
}

/***********************Scheduling jobs***************************/
exports.testSuitesScheduler_ICE = function (req, res) {
	logger.info("Inside UI service testSuitesScheduler_ICE");
	if (utils.isSessionActive(req.session)) {
		if(req.body.chkType == "schedule"){			
			var modInfo = req.body.moduleInfo;
			logger.info("Calling function scheduleTestSuite from testSuitesScheduler_ICE");
			scheduleTestSuite(modInfo, req, function (err, schedulecallback) {
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
			var data = req.body.moduleInfo;
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
						logger.error("Error occured in suite/ScheduleTestSuite_ICE from testSuitesScheduler_ICE service, Error Code : ERRNDAC");
						res.send("fail");
					} else {
						res.send(result.rows);
					}
			});
		}
	} else {
		logger.error("Error in the service testSuitesScheduler_ICE: Invalid Session");
		res.send("Invalid Session");
	}
};

//Schedule Testsuite normal and when server restart
function scheduleTestSuite(modInfo, req, schedcallback) {
	logger.info("Inside scheduleTestSuite function");
	var schedulingData = modInfo;
	var schDate, schTime, cycleId, scheduleId, clientIp, scenarioDetails;
	var browserList, testSuiteId, testsuitename;
	var doneFlag = 0;
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
		cycleId = itr.cycleid;		
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
				"cycleid": cycleId,
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
						logger.error("Error occured in suite/ScheduleTestSuite_ICE from scheduleTestSuite Error Code : ERRNDAC");
						schedFlag = "fail";
						schedcallback(null, schedFlag);
					} else {
						var obj = new Date(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1]);
						try {
							var scheduledjob = schedule.scheduleJob(sessObj, obj, function () {
								logger.info("Calling function executeScheduling from scheduleTestSuite");
								executeScheduling(sessObj, schedulingData, req);
							});
							counter++;
							Callback();
						} catch (ex) {
							logger.error("Exception in the function executeScheduling from scheduleTestSuite: %s", ex);
							scheduleStatus = "Failed 02";
							logger.info("Calling function updateStatus from scheduleTestSuite");
							updateStatus(sessObj, function (err, data) {
								if (!err) {
									logger.info("Scheduling status updated successfully", data);
								}
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
			sessObj = cycleId + ";" + scheduleId + ";" + dateTime.valueOf().toString();
			var obj = new Date(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1], 0); //new Date(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1], 0);
			try {
				var scheduledjob = schedule.scheduleJob(sessObj, obj, function () {
					logger.info("Calling function executeScheduling from scheduleTestSuite: reshedule");
					executeScheduling(sessObj, schedulingData, req);
				});
				counter++;
				Callback();
			} catch (ex) {
				logger.error("Exception in the function executeScheduling from scheduleTestSuite: reshedule: %s", ex);
				scheduleStatus = "Failed 02";
				updateStatus(sessObj, function (err, data) {
					if (!err) {
						logger.info("Scheduling status updated successfully", data);
					}
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
	function executeScheduling(sessObj, schedulingData, req) {
		logger.info("Inside executeScheduling function");
		var inputs = {
			"cycleid": sessObj.split(";")[0],
			"scheduledatetime": sessObj.split(";")[2],
			"scheduleid": sessObj.split(";")[1],
			"query": "getscheduledata"
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		try {
			logger.info("Calling NDAC Service from executeScheduling: suite/ScheduleTestSuite_ICE");
			client.post(epurl + "suite/ScheduleTestSuite_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in suite/ScheduleTestSuite_ICE from executeScheduling Error Code : ERRNDAC");
					scheduleStatus = "Failed 02";
					logger.info("Calling function updateStatus from executeScheduling");
					updateStatus(sessObj, function (err, data) {
						if (!err) {
							logger.info("Scheduling status updated successfully", data);
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
						var appType;
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
							appType = eachsuiteDetails.appType;
							logger.info("Calling function TestCaseDetails_Suite_ICE from executeScheduling");
							var uid = rescheduleflag != true ? schedulingData[0].userInfo.user_id : schedulingData[0].userid;
							TestCaseDetails_Suite_ICE(currentscenarioid, uid, function (currentscenarioidError, currentscenarioidResponse) {
								var scenariotestcaseobj = {};
								if (currentscenarioidError) {
									logger.error("Error occured in the function TestCaseDetails_Suite_ICE from executeScheduling Error Code - ERRNDAC: %s", currentscenarioidError);
								} else {
									if (currentscenarioidResponse != null || currentscenarioidResponse != undefined) {
										scenariotestcaseobj[currentscenarioid] = currentscenarioidResponse.listoftestcasedata;
										scenariotestcaseobj.qccredentials = eachsuiteDetails.qccredentials;
										scenariotestcaseobj.qcdetails = currentscenarioidResponse.qcdetails;
										listofscenarioandtestcases.push(scenariotestcaseobj);
										eachsuiteDetailscallback();
									}
									if (listofscenarioandtestcases.length == suiteDetails.length) {
										logger.info("Calling updateData function TestCaseDetails_Suite_ICE from executeScheduling");
										updateData();
										//batchExecutionDataCallback();
										logger.info("Calling scheduleFunction function TestCaseDetails_Suite_ICE from executeScheduling");
										var a = scheduleFunction(executionRequest);
									}
								}
							});
							function updateData() {
								logger.info("Inside updateData function of executeScheduling");
								executionjson[testsuiteid] = listofscenarioandtestcases;
								executionjson.scenarioIds = scenarioIdList;
								executionjson.browserType = browserTypelist;
								executionjson.condition = conditionchecklist;
								executionjson.dataparampath = dataparamlist;
								executionjson.testsuiteid = testsuiteid;
								executionjson.testsuitename = testsuitenm;
								testsuitedetailslist.push(executionjson);
								//if (testsuitedetailslist.length == batchExecutionData.length) {
								logger.info("Calling excutionObjectBuilding function from TestCaseDetails_Suite_ICE");
								excutionObjectBuilding(testsuitedetailslist);
								//}
							}
						});
						function excutionObjectBuilding(testsuitedetailslist) {
							logger.info("Inside excutionObjectBuilding function of executeScheduling");
							executionRequest.executionId = JSON.parse(JSON.stringify(result.rows[0].scheduleid));
							executionRequest.suitedetails = testsuitedetailslist;
							executionRequest.testsuiteIds.push(testsuiteid);
							executionRequest.apptype = appType;
						}
						function scheduleFunction(executionRequest) {
							logger.info("Inside scheduleFunction function of executeScheduling");
							var name = ipAdd;
							redisServer.redisSubServer.subscribe('ICE2_' + name);	
							//var scenarioCount_s = executionRequest.suitedetails[0].scenarioIds.length;
							var completedSceCount_s = 0;
							var testsuitecount_s = 0;
							var statusPass_s = 0;
							var suiteStatus_s;
							logger.debug("ICE Socket requesting Address: %s" , name);
							redisServer.redisPubICE.pubsub('numsub','ICE1_scheduling_' + name,function(err,redisres){
								if (redisres[1]>0) {
									logger.info("Sending socket request for executeTestSuite:scheduling to redis");
									dataToIce = {"emitAction" : "executeTestSuite","username" : name, "executionRequest": executionRequest};
									redisServer.redisPubICE.publish('ICE1_scheduling_' + name,JSON.stringify(dataToIce));
									var starttime = new Date().getTime();
									var updateSessionExpiry = utils.resetSession(req.session);
									function executeTestSuite_listener(channel,message) {
										data = JSON.parse(message);
										if(name == data.username){
											if (data.onAction == "return_status_executeTestSuite") {
												var response = data.value;
												if(response.status == "success"){
													scheduleStatus = "Inprogress";
													logger.info("Calling function updateStatus from scheduleFunction");
													updateStatus(sessObj, function (err, data) {
														if (!err) {
															logger.info("Sending response data from scheduleFunction");
														}
													});
												}
												else if(response.status == "skipped"){
													scheduleStatus = "Inprogress";
													logger.info("Calling function updateSkippedScheduleStatus from scheduleFunction");
													var sessobj_new = sessObj + ';Skipped;' +  JSON.stringify(result.rows[0]) + ';' +JSON.stringify(response.data);
													var msg = "The scenario was skippped due to conflicting schedules.";
													updateSkippedScheduleStatus(sessobj_new, msg, function (err, data){
														if(!err){
															logger.info("Sending response data from scheduleFunction");
														}
													});
												}
											} else if (data.onAction == "result_executeTestSuite") {
												var resultData = data.value;
												if (resultData != "success" && resultData != "Terminate") {
													//completedSceCount_s++;
													//scenarioCount_s = executionRequest.suitedetails[testsuitecount_s].scenarioIds.length;
													try {
														completedSceCount_s++;
														scenarioCount_s = executionRequest.suitedetails[testsuitecount_s].scenarioIds.length  * executionRequest.suitedetails[testsuitecount_s].browserType.length;
														var scenarioid = resultData.scenarioId;
														var executionid = resultData.executionId;
														var reportdata = resultData.reportData;
														var testsuiteid = resultData.testsuiteId;
														var req_report = resultData.reportdata;
														var req_reportStepsArray = reportdata.rows;
														if (reportdata.overallstatus.length != 0) {
															var req_overAllStatus = reportdata.overallstatus;
															var req_browser = reportdata.overallstatus[0].browserType;
															reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
															reportdata = JSON.parse(reportdata);
															var reportId = uuid();
															if (resultData.reportData.overallstatus[0].overallstatus == "Pass") {
																statusPass_s++;
															}
															var inputs = {
																"reportid": reportId,
																"executionid": executionid,
																"testsuiteid": testsuiteid,
																"testscenarioid": scenarioid,
																"browser": req_browser,
																"cycleid":result.rows[0].cycleid,
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
															logger.info("Calling NDAC Service from scheduleFunction: suite/ExecuteTestSuite_ICE");
															client.post(epurl + "suite/ExecuteTestSuite_ICE", args,
																function (result, response) {
																if (response.statusCode != 200 || result.rows == "fail") {
																	logger.error("Error occured in suite/ExecuteTestSuite_ICE from scheduleFunction, Error Code : ERRNDAC");
																	flag = "fail";
																} else {
																	flag = "success";
																}
															});
															if (completedSceCount_s == scenarioCount_s) {
																if (statusPass_s == scenarioCount_s) {
																	suiteStatus_s = "Pass";
																} else {
																	suiteStatus_s = "Fail";
																}
																completedSceCount_s = 0;
																testsuitecount_s++;
																logger.info("Calling function updateSchedulingStatus from scheduleFunction");
																updateSchedulingStatus(testsuiteid, executionid, starttime, suiteStatus_s);
															}
														} else {
															completedSceCount_s++;
															scenarioCount_s = executionRequest.suitedetails[testsuitecount_s].scenarioIds.length;
															if (completedSceCount_s == scenarioCount_s) {
																suiteStatus_s = "Fail";
																completedSceCount_s = 0;
																testsuitecount_s++;
																logger.info("Calling function updateExecutionStatus from scheduleFunction");
																updateExecutionStatus(testsuiteid, executionid, starttime, suiteStatus_s);
															}
														}
													} catch (ex) {
														logger.error("Exception occured in the scheduleFunction: %s", ex);
													}
												}
												else if (resultData) {
													if (typeof(resultData) == "string") {
														clearInterval(updateSessionExpiry);
														redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
														scheduleStatus = resultData == "success" ? "Completed" : resultData;
													} 
													// else if (typeof(resultData) == "object") {
													// 	var stat = resultData.reportData.overallstatus[0].overallstatus;
													// 	scheduleStatus = stat == "success" ? "Completed" : stat;
													// }
													try {
														logger.info("Calling function updateStatus from scheduleFunction");
														updateStatus(sessObj, function (err, data) {
															if (!err) {
																logger.info("Sending response data from scheduleFunction");
															}
														});
														//res.send(resultData);
														//console.log(resultData);
													} catch (ex) {
														logger.error("Exception occured in the updateStatus function of scheduleFunction: %s", ex);
													}
												}
											}
										}
									}
									redisServer.redisSubServer.on("message",executeTestSuite_listener);
								} else {
									logger.error("Error occured in the function scheduleFunction: Socket not Available");
									// deleteFlag = true;
									// deleteScheduledData(deleteFlag, sessObj)
									var testsuiteid = JSON.parse(JSON.stringify(result.rows[0].testsuiteids))[0];
									var scheduleid = JSON.parse(JSON.stringify(result.rows[0].scheduleid));
									var d = {};
									d[testsuiteid]=[];
									var scenariodetails = JSON.parse(result.rows[0].scenariodetails);
									for(var i=0;i<scenariodetails.length;i++){
										(d[testsuiteid]).push(scenariodetails[i].scenarioids);
									}
									var datetime = new Date();
									datetime = datetime.getFullYear()+'-'+(datetime.getMonth()+1)+'-'+datetime.getDate()+' '+datetime.getHours()+':'+datetime.getMinutes()+':'+datetime.getSeconds()+'0';
									var data = {'scenario_ids':d,'execution_id':scheduleid,'time':String(datetime)};
									var sessobj_new = sessObj + ';Skipped;' +  JSON.stringify(result.rows[0]) + ';' +JSON.stringify(data);
									var msg = "The scenario was skipped due to unavailability of schedule mode/ICE.";
									logger.info("Calling function updateSkippedScheduleStatus from scheduleFunction");
									updateSkippedScheduleStatus(sessobj_new, msg, function (err, data) {
										if (!err) {
											logger.info("Sending response data from scheduleFunction");
										}
									});
								}
							});
						}
					} //only jobs with scheduled status executes
				}
			});
		} catch (exception) {
			logger.error("Exception occured in the executeScheduling function: %s", ex);
			// deleteFlag = true;
			// deleteScheduledData(deleteFlag, sessObj)
			scheduleStatus = "Failed 02";
			logger.info("Calling function updateStatus from executeScheduling");
			updateStatus(sessObj, function (err, data) {
				if (!err) {
					logger.info("Sending response data from executeScheduling");
				}
			});
		}
	}

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
				logger.error("Error occured in suite/ExecuteTestSuite_ICE from updateSchedulingStatus, Error Code : ERRNDAC");
				flag = "fail";
			} else {
				flag = "success";
			}
		});
	}
}

//Update status of current scheduled job
function updateStatus(sessObj, updateStatuscallback) {
	logger.info("Inside updateStatus function");
	try {
		if (scheduleStatus != "") {
			var inputs = {
				"cycleid": sessObj.split(";")[0],
				"scheduledatetime": sessObj.split(";")[2],
				"scheduleid": sessObj.split(";")[1],
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
						logger.error("Error occured in suite/ScheduleTestSuite_ICE from executeScheduling Error Code : ERRNDAC");
					} else {
						if (result.rows[0].schedulestatus != "Skipped"){
							var inputs = {
								"schedulestatus": scheduleStatus,
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
								logger.info("Calling NDAC Service from updateStatus: suite/ScheduleTestSuite_ICE");
								client.post(epurl + "suite/ScheduleTestSuite_ICE", args,
									function (result, response) {
									if (response.statusCode != 200 || result.rows == "fail") {
										logger.error("Error occured in suite/ScheduleTestSuite_ICE from updateStatus, Error Code : ERRNDAC");
										updateStatuscallback(null, "fail");
									} else {
										updateStatuscallback(null, "success");
									}
								});
							} catch (exception) {
								logger.error("Exception occured in suite/ScheduleTestSuite_ICE from updateStatus: %s",exception);
								updateStatuscallback(null, "fail");
							}
						}
					}
				});
		}
	} catch (exception) {
		logger.error("Exception occured in updateStatus: %s",exception);
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
						logger.error("Error occured in suite/ScheduleTestSuite_ICE from updateSkippedScheduleStatus, Error Code : ERRNDAC");
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
								logger.error("Error occured in suite/ExecuteTestSuite_ICE from scheduleFunction, Error Code : ERRNDAC");
								updateStatuscallback(null, "fail");
							} else {
								updateStatuscallback(null, "success");
							}
						});
					}
				}
			} catch (exception) {
				logger.error("Exception occured in suite/ScheduleTestSuite_ICE from updateSkippedScheduleStatus: %s",exception);
				updateStatuscallback(null, "fail");
			} 
		}
	} catch (exception) {
		logger.error("Exception occured in updateSkippedScheduleStatus: %s",exception);
		updateStatuscallback(null, "fail");
	}
}

exports.getScheduledDetails_ICE = function (req, res) {
	logger.info("Inside UI service getScheduledDetails_ICE");
	if (utils.isSessionActive(req.session)) {
		logger.info("Calling function getScheduledDetails from getScheduledDetails_ICE");
		getScheduledDetails("getallscheduledata", function (err, getSchedcallback) {
			if (err) {
				logger.error("Error occured in getScheduledDetails from getScheduledDetails_ICE: %s",err);
				res.send("fail");
			} else {
				try {
					res.send(getSchedcallback);
				} catch (exception) {
					logger.error("Exception occured while sending response getSchedcallback: %s",exception);
					res.send("fail");
				}
			}
		});
	} else {
		logger.error("Error occured in getScheduledDetails_ICE: Invalid Session");
		res.send("Invalid Session");
	}
};

//cancel scheduled Jobs
exports.cancelScheduledJob_ICE = function (req, res) {
	logger.info("Inside UI service cancelScheduledJob_ICE");
	if (utils.isSessionActive(req.session)) {
		var cycleid = req.body.suiteDetails.cycleid;
		var scheduleid = req.body.suiteDetails.scheduleid;
		var schedStatus = req.body.schedStatus;
		var schedHost = req.body.host;
		var schedUserid = req.body.schedUserid;
		var userid = req.body.userInfo;
		if(userid == schedUserid || schedHost == req.session.username){
			var scheduledatetime = new Date(req.body.suiteDetails.scheduledatetime).valueOf().toString();
			var scheduledatetimeINT = parseInt(scheduledatetime);
			try {
				var upDate = new Date(scheduledatetimeINT).getFullYear() + "-" + ("0" + (new Date(scheduledatetimeINT).getMonth() + 1)).slice(-2) + "-" + ("0" + new Date(scheduledatetimeINT).getDate()).slice(-2) + " " + ("0" + new Date(scheduledatetimeINT).getHours()).slice(-2) + ":" + ("0" + new Date(scheduledatetimeINT).getMinutes()).slice(-2) + ":00+0000";
				var inputs = {
					"cycleid": cycleid,
					"scheduledatetime": upDate,
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
						logger.error("Error occured in suite/ScheduleTestSuite_ICE from cancelScheduledJob_ICE service, Error Code : ERRNDAC");
						res.send("fail");
					} else {
						var status = result.rows[0].schedulestatus;
						if (status == "scheduled") {
							var objectD = cycleid + ";" + scheduleid + ";" + upDate.valueOf().toString();
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
				logger.error("Error occured in suite/ScheduleTestSuite_ICE from getScheduledDetails, Error Code : ERRNDAC");
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
				logger.error("Error occured in getScheduledDetails from reScheduleTestsuite service: %s", err);
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
							var str,dd,dt;
							var tempDD,tempDT;
							str = new Date(reSchedcallback[i].scheduledatetime).getFullYear() + "-" + ("0" + (new Date(reSchedcallback[i].scheduledatetime).getMonth() + 1)).slice(-2) + "-" + ("0" + new Date(reSchedcallback[i].scheduledatetime).getDate()).slice(-2) + " " + ("0" + new Date(reSchedcallback[i].scheduledatetime).getUTCHours()).slice(-2) + ":" + ("0" + new Date(reSchedcallback[i].scheduledatetime).getUTCMinutes()).slice(-2);
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
							str = new Date(itrSchData.scheduledatetime).getFullYear() + "-" + ("0" + (new Date(itrSchData.scheduledatetime).getMonth() + 1)).slice(-2) + "-" + ("0" + new Date(itrSchData.scheduledatetime).getUTCDate()).slice(-2) + " " + ("0" + new Date(itrSchData.scheduledatetime).getUTCHours()).slice(-2) + ":" + ("0" + new Date(itrSchData.scheduledatetime).getUTCMinutes()).slice(-2);
							tempDD = str.split(" ")[0];
							tempDT = str.split(" ")[1];
							dd = tempDD.split("-");
							dt = tempDT.split(":");
							if (new Date(dd[0], dd[1] - 1, dd[2], dt[0], dt[1]) > new Date()) {
								modInfo.suiteDetails = itrSchData.scenariodetails;
								modInfo.testsuitename = itrSchData.testsuitename;
								modInfo.testsuiteid = itrSchData.testsuiteids[0].valueOf().toString();
								modInfo.Ip = itrSchData.clientipaddress;
								modInfo.date = dd[2] + "-" + dd[1] + "-" + dd[0];
								modInfo.time = str.split(" ")[1];
								modInfo.browserType = itrSchData.browserlist;
								modInfo.cycleid = itrSchData.cycleid.valueOf().toString();
								modInfo.reschedule = true;
								modInfo.scheduleid = itrSchData.scheduleid.valueOf().toString();
								modInfo.versionnumber = 1;
								modInfo.userid = itrSchData.userid;
								modInformation.push(modInfo);
								logger.info("Calling function scheduleTestSuite from reScheduleTestsuite service");
								scheduleTestSuite(modInformation, req, function (err, schedulecallback) {
									try {
										logger.info("Status of the function scheduleTestSuite from reScheduleTestsuite service");
									} catch (exception) {
										logger.error("Exception in the function scheduleTestSuite from reScheduleTestsuite service: %s", exception);
									}
								});
							} else {
								scheduleStatus = "Failed 01";
								var objectD = itrSchData.cycleid.valueOf().toString() + ";" + itrSchData.scheduleid.valueOf().toString() + ";" + new Date(Date.UTC(dd[0], dd[1] - 1, dd[2], dt[0], dt[1])).valueOf().toString();
								logger.info("Calling function updateStatus from reScheduleTestsuite service");
								updateStatus(objectD, function (err, data) {
									if (!err) {
										logger.info("Sending response data from the function updateStatus of reScheduleTestsuite service");
									}
								});
							}
							getscheduleDataCallback();
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
