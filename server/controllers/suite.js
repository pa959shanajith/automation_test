/**
 * Dependencies.
 */
var async = require('async');
var myserver = require('../lib/socket');
var uuid = require('uuid-random');
var epurl = process.env.NDAC_URL;
var Client = require("node-rest-client").Client;
var client = new Client();
var schedule = require('node-schedule');	
var scheduleStatus = "";
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');
if (process.env.REPORT_SIZE_LIMIT) require('follow-redirects').maxBodyLength = parseInt(process.env.REPORT_SIZE_LIMIT)*1024*1024;
const SOCK_NORM = "normalModeOn";
const SOCK_SCHD = "scheduleModeOn";
const SOCK_NA = "unavailableLocalServer";
const SOCK_NORM_MSG = "ICE is connected in Non-Scheduling mode";
const SOCK_SCHD_MSG = "ICE is connected in Scheduling mode";
const SOCK_NA_MSG = "ICE is not Available";
const DO_NOT_PROCESS = "do_not_process_response";

/**
 * This service reads the testsuite and scenario information for the testsuites
 */
exports.readTestSuite_ICE = async (req, res) => {
	logger.info("Inside UI service: readTestSuite_ICE");
	const batchData = req.body.readTestSuite;
	const fromFlg = req.body.fromFlag;
	const userInfo = {"userid": req.session.userid, "role": req.session.activeRoleId};
	const fnName = "readTestSuite_ICE";
	var responsedata = {};
	var inputs = {};

	for (let i = 0; i < batchData.length; i++) {
		const suite = batchData[i];
		const moduleId = suite.testsuiteid;
		inputs = {
			"query": "gettestsuite",
			"mindmapid": moduleId,
			"cycleid": suite.cycleid,
			"createdby": userInfo.userid,
			"createdbyrole": userInfo.role
		};
		const testsuite = await utils.fetchData(inputs, "suite/readTestSuite_ICE", fnName);
		inputs = {
			"query": "gettestscenario",
			"testscenarioids": testsuite.testscenarioids
		};
		const testscenarioDetails = await utils.fetchData(inputs, "suite/readTestSuite_ICE", fnName);
		const finalSuite = {
			"executestatus": testsuite.donotexecute,
			"condition": testsuite.conditioncheck,
			"dataparam": testsuite.getparampaths,
			"scenarioids": testsuite.testscenarioids,
			"scenarionames": testscenarioDetails.testscenarionames,
			"projectnames": testscenarioDetails.projectnames,
			"testsuitename": suite.testsuitename,
			"moduleid": moduleId,
			"testsuiteid": testsuite.testsuiteid,
			"versionnumber": suite.versionnumber
		};
		responsedata[moduleId] = finalSuite;
	}
	if (fromFlg == "scheduling") {
		const connectusers = await utils.getSocketList("schedule");
		logger.debug("IP\'s connected : %s", connectusers.join());
		const schedulingDetails = {
			"connectedUsers": connectusers,
			"testSuiteDetails": responsedata
		};
		responsedata = schedulingDetails
	}
	res.send(responsedata);
};

exports.updateTestSuite_ICE = async (req, res) => {
    logger.info("Inside UI service: updateTestSuite_ICE");
	const userInfo = {"userid": req.session.userid, "username": req.session.username, "role": req.session.activeRoleId};
	var batchDetails = req.body.batchDetails;
	var overallstatusflag = "success";
	for (let i = 0; i < batchDetails.length; i++) {
		var testsuite = batchDetails[i];
		var inputs = {
			"query": "updatetestsuitedataquery",
			"conditioncheck": testsuite.conditioncheck,
			"donotexecute": testsuite.donotexecute,
			"getparampaths": testsuite.getparampaths,
			"testscenarioids": testsuite.testscenarioids,	
			"modifiedby": userInfo.userid,
			"modifiedbyrole": userInfo.role,
			"testsuiteid": testsuite.testsuiteid,
			"name": testsuite.testsuitename,
		};
		const result = await utils.fetchData(inputs, "suite/updateTestSuite_ICE", "updateTestSuite_ICE")
		if (result == "fail") overallstatusflag = "fail";
	}
	return res.send(overallstatusflag);
};

const checkForICEstatus = async (user, execType) => {
	const err = "Error occurred in the function checkForICEstatus: ";
	logger.debug("ICE Socket requesting Address: %s" , user);
	const sockmode = await utils.channelStatus(user);
	if (!sockmode.schedule && !sockmode.normal) {
		logger.error(err + SOCK_NA_MSG + ".");
		return SOCK_NA;
	} else if (execType != "SCHEDULE" && sockmode.schedule) {
		logger.error(err + SOCK_SCHD_MSG + ".");
		return SOCK_SCHD;
	} else if (execType == "SCHEDULE" && sockmode.normal) {
		logger.error(err + SOCK_NORM_MSG + ".");
		return SOCK_NORM;
	} else {
		return null;
	}
};

const counterUpdater = async (count, userid) => {
	const updateinp = {
		"query": "testsuites",
		"count": count,
		"userid": userid
	};
	return utils.fetchData(updateinp, "utility/dataUpdator_ICE", "counterUpdater");
};

const fetchScenarioDetails = async (scenarioid) => {
	const fnName = "fetchScenarioDetails";
	const scenario = {};
	const allTestcaseSteps = [];
	const allTestcaseObj = {};
	var inputs = null;

	// Step 1: Get Testcase details
	inputs = {
		"query": "testcasedetails",
		"id": scenarioid
	};
	var testcases = await utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", fnName);
	if (testcases == "fail") testcases = [];

	// Step 2: Get Testcasesteps
	for (let i = 0; i < testcases.length; i++) {
		const tc = testcases[i];
		if (allTestcaseObj[tc._id] === undefined) {
			inputs = {
				"testcaseid": tc._id,
				"screenid": tc.screenid,
				"versionnumber": tc.versionnumber,
				"query": "readtestcase"
			};
			const testcasedata = await utils.fetchData(inputs, "design/readTestCase_ICE", fnName);
			allTestcaseObj[tc._id] = testcasedata[0];
		}
	}

	testcases.forEach(async (tc) => {
		allTestcaseSteps.push({
			"template": "",
			"testcase": allTestcaseObj[tc._id].steps,
			"testcasename": allTestcaseObj[tc._id].name
		});
	});

	scenario.testcase = JSON.stringify(allTestcaseSteps);

	// Step 3: Get qcdetails
	inputs = {
		"query": "qcdetails",
		"testscenarioid": scenarioid
	};
	const qcdetails = await utils.fetchData(inputs, "qualityCenter/viewQcMappedList_ICE", fnName);
	if (qcdetails.length > 0) scenario.qcdetails = JSON.parse(JSON.stringify(qcdetails[0]));
	else scenario.qcdetails = {};
	return scenario;
};

const prepareExecutionRequest = async (batchData, userInfo) => {
	const execReq = {
		"exec_mode": batchData.exectionMode,
		"apptype": batchData.batchInfo[0].appType,
		"qccredentials": batchData.qccredentials,
		"batchId": "",
		"executionIds": [],
		"testsuiteIds": [],
		"suitedetails": []
	};
	const batchInfo = batchData.batchInfo;
	for (let i = 0; i < batchInfo.length; i++) {
		const suite = batchInfo[i];
		const testsuiteid = suite.testsuiteId;
		const scenarioList = [];
		const suiteObj = {
			"browserType": batchData.browserType,
			"testsuitename": suite.testsuiteName,
			"testsuiteid": suite.testsuiteId,
			"domainname": suite.domainName,
			"projectid": suite.projectId,
			"projectname": suite.projectName,
			"releaseid": suite.releaseId,
			"cyclename": suite.cycleName,
			"cycleid": suite.cycleId,
			"condition": [],
			"dataparampath": [],
			"scenarioNames": [],
			"scenarioIds": []
		};
		const suiteDetails = suite.suiteDetails;
		for (let j = 0; j < suiteDetails.length; j++) {
			const tsco = suiteDetails[j];
			var scenario = await fetchScenarioDetails(tsco.scenarioId);
			scenario = Object.assign(scenario, tsco);
			suiteObj.condition.push(scenario.condition);
			suiteObj.dataparampath.push(scenario.dataparam[0]);
			suiteObj.scenarioNames.push(scenario.scenarioName);
			suiteObj.scenarioIds.push(scenario.scenarioId);
			const scenarioObj = {};
			scenarioObj[scenario.scenarioId] = scenario.testcase;
			scenarioObj.qcdetails = scenario.qcdetails;
			scenarioList.push(scenarioObj);
		}
		suiteObj[testsuiteid] = scenarioList;
		execReq.testsuiteIds.push(testsuiteid);
		execReq.suitedetails.push(suiteObj);
	}
	return execReq;
};

const generateExecutionIds = async (execIds, tsuIds, userid) => {
	for (let i = 0; i < tsuIds.length; i++) {
		const tsuid = tsuIds[i];
		if (execIds.execid[tsuid] == undefined) execIds.execid[tsuid] = null;
	}
	const inputs = {
		"query": "insertintoexecution",
		"executedby": userid,
		"testsuiteids": tsuIds,
		"executionids": execIds.execid,
		"batchid": execIds.batchid
	};
	const newExecIds = await utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", "prepareExecutionRequest");
	execIds.batchid = newExecIds.batchid;
	execIds.execid = newExecIds.execids;
	return newExecIds;
};

const updateExecutionStatus = async (execIds, status) => {
	logger.info("Calling function updateExecutionStatus from executionFunction");
	const inputs = {
		"query": "updateintoexecution",
		"executionids": execIds,
		"status": status
	};
	const response = await utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", "updateExecutionStatus");
	return response;
};

const executionRequestToICE = async (execReq, execType, userInfo) => {
	logger.info("Inside executionRequestToICE function");
	const name = userInfo.username;
	var completedSceCount = 0;
	var statusPass = 0;

	logger.info("Sending request to ICE for executeTestSuite");
	const dataToIce = {"emitAction" : "executeTestSuite","username" : name, "executionRequest": execReq};
	redisServer.redisPubICE.publish('ICE1_normal_' + name, JSON.stringify(dataToIce));

	const exePromise = async (resSent) => (new Promise((rsv, rej) => {
		var d2R = {};
		async function executeTestSuite_listener(channel, message) {
			const data = JSON.parse(message);
			if(name == data.username && execReq.batchId == data.value.batchId) {
				if (data.onAction == SOCK_NA) {
					redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
					logger.error("Error occurred in ExecuteTestSuite_ICE: Socket Disconnected");
					if (resSent && notifySocMap[name]) notifySocMap[name].emit("ICEnotAvailable");
					rsv(SOCK_NA);
				} else if (data.onAction == "result_executeTestSuite") {
					const resultData = data.value;
					const status = resultData.status;
					if (!status) { // This block is for report data
						try {
							completedSceCount++;
							const executionid = resultData.executionId;
							const scenarioid = resultData.scenarioId;
							const testsuiteid = resultData.testsuiteId;
							const testsuiteIndex = execReq.testsuiteIds.indexOf(testsuiteid);
							const testsuite = execReq.suitedetails[testsuiteIndex];
							const reportdata = JSON.parse(JSON.stringify(resultData.reportData).replace(/'/g, "''"));
							var scenarioCount = testsuite.scenarioIds.length * testsuite.browserType.length;
							if (execType == "API") {
								if (d2R[testsuiteid] === undefined) d2R[testsuiteid] = {"testsuiteName": testsuite.testsuitename, "testsuiteId": testsuiteid, "scenarios": {}};
								const scenarioIndex = testsuite.scenarioIds.indexOf(scenarioid);
								d2R[testsuiteid].scenarios[scenarioid] = {"scenarioname": testsuite.scenarioNames[scenarioIndex], "scenarioid": scenarioid, "overallstatus": "Not Executed"};
							}
							if (reportdata.overallstatus.length == 0) {
								completedSceCount++;
								scenarioCount = testsuite.scenarioIds.length;
								if (completedSceCount == scenarioCount) {
									completedSceCount = 0;
									const suiteStatus = "fail";
									await updateExecutionStatus(execReq.executionIds, suiteStatus);
								}
							} else {
								const browserType = (execReq.apptype == "MobileApp")? "MobileApp":reportdata.overallstatus[0].browserType;
								reportdata.overallstatus[0].browserType = browserType;
								if (execType == "API") d2R[testsuiteid].scenarios[scenarioid] = {...d2R[testsuiteid].scenarios[scenarioid], ...reportdata.overallstatus[0]};
								if (resultData.reportData.overallstatus[0].overallstatus == "Pass") statusPass++;
								const inputs = {
									"executionid": executionid,
									"testsuiteid": testsuiteid,
									"testscenarioid": resultData.scenarioId,
									"browser": browserType,
									"cycleid": testsuite.cycleid,
									"status": resultData.reportData.overallstatus[0].overallstatus,
									"report": JSON.stringify(reportdata),
									"query": "insertreportquery",
									"modifiedby": userInfo.userid
								};
								const args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								logger.info("Calling NDAC Service from executionFunction: suite/ExecuteTestSuite_ICE");
								client.post(epurl + "suite/ExecuteTestSuite_ICE1", args,
									function (result, response) {
									if (response.statusCode != 200 || result.rows == "fail") logger.error("Error occurred in suite/ExecuteTestSuite_ICE from executionFunction Error Code : ERRNDAC");
									else logger.info("Successfully inserted report data");
								});
								if (completedSceCount == scenarioCount) {
									completedSceCount = 0;
									const suiteStatus = (statusPass == scenarioCount)? "pass" : "fail";
									await updateExecutionStatus(execReq.executionIds, suiteStatus);
								}
							}
						} catch (ex) {
							logger.error("Exception in the function executionFunction: insertreportquery: %s", ex);
						}
					} else { // This block will trigger when resultData.status has "success or "Terminate"
						redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
						try {
							if (resSent && notifySocMap[name]) { // This block is only for active mode
								notifySocMap[name].emit("result_ExecutionDataInfo", status);
								rsv(DO_NOT_PROCESS);
							} else {
								if (execType == "ACTIVE") d2R = status;
								else if (execType == "API") d2R = [d2R, status];
								rsv(d2R);
							}
						} catch (ex) {
							logger.error("Exception while sending execution status from the function executionFunction: %s", ex);
							rej(ex);
						}
					}
				}
			}
		}
		redisServer.redisSubServer.on("message",executeTestSuite_listener);
	}));

	const notifySocMap = myserver.socketMapNotify; 
	if (execType == "ACTIVE" && notifySocMap && notifySocMap[name]) {
		exePromise(true);
		return "begin";
	} else return await exePromise(false);
};

const executionFunction = async (batchExecutionData, execIds, userInfo, execType) => {
	redisServer.redisSubServer.subscribe('ICE2_' + userInfo.username);
	var iceStatus = await checkForICEstatus(userInfo.username, execType);
	if (iceStatus != null) return iceStatus;
	const taskApproval = await utils.approvalStatusCheck(batchExecutionData.batchInfo);
	if (taskApproval.res !== "pass") return taskApproval.res;
	/*const countStatus =*/ await counterUpdater(batchExecutionData.batchInfo.length, userInfo.userid);
	const executionRequest = await prepareExecutionRequest(batchExecutionData, userInfo);
	const currExecIds = await generateExecutionIds(execIds, executionRequest.testsuiteIds, userInfo.userid);
	executionRequest.batchId = currExecIds.batchid;
	executionRequest.executionIds = executionRequest.testsuiteIds.map(i => currExecIds.execids[i]);
	const result = await executionRequestToICE(executionRequest, execType, userInfo);
	return result;
};

exports.ExecuteTestSuite_ICE = async (req, res) => {
	logger.info("Inside UI service: ExecuteTestSuite_ICE");
	const userInfo = {"userid": req.session.userid, "username": req.session.username, "role": req.session.activeRoleId};
	const batchExecutionData = req.body.executionData;
	const execIds = {"batchid": "generate", "execid": {}};
	const result = await executionFunction(batchExecutionData, execIds, userInfo, "ACTIVE");
	if (result == DO_NOT_PROCESS) return true;
	return res.send(result);
};

exports.ExecuteTestSuite_ICE_SVN = async (req, res) => {
	logger.info("Inside UI service: ExecuteTestSuite_ICE_SVN");
	const multiBatchExecutionData = req.body.executionData;
	const executionResult = [];
	for (let i = 0; i < multiBatchExecutionData.length; i++) {
		const batchExecutionData = multiBatchExecutionData[i];
		const userInfo = await utils.tokenValidation(batchExecutionData.userInfo);
		const execResponse = userInfo.inputs;
		executionResult.push(execResponse);
		if (execResponse.tokenValidation != "passed") continue;
		else delete execResponse.err;
		const execIds = {"batchid": "generate", "execid": {}};
		const result = await executionFunction(batchExecutionData, execIds, userInfo, "API");
		if (result == SOCK_NA) execResponse.err = SOCK_NA_MSG;
		else if (result == SOCK_SCHD) execResponse.err = SOCK_SCHD_MSG;
		else if (result == "NotApproved") execResponse.err = "All the dependent tasks (design, scrape) needs to be approved before execution";
		else if (result == "NoTask") execResponse.err = "Task doesnot exist for child node";
		else if (result == "Modified") execResponse.err = "Task has been modified, Please approve the task";
		else {
			execResponse.status = result[1];
			const execResult = [];
			for (tsuid in result[0]) {
				const tsu = result[0][tsuid];
				const scenarios = [];
				for (tscid in tsu.scenarios) scenarios.push(tsu.scenarios[tscid]);
				delete tsu.scenarios;
				tsu.suiteDetails = scenarios;
				execResult.push(tsu);
			}
			execResponse.batchInfo = execResult;
		}
	}
	return res.send({"executionStatus": executionResult});
};

// Service to fetch all the testcase,screen and project names for provided scenarioid
exports.getTestcaseDetailsForScenario_ICE = async (req, res) => {
	logger.info("Inside Ui service getTestcaseDetailsForScenario_ICE");
	const fnName = "getTestcaseDetailsForScenario_ICE";
	var inputs = {};
	var data = {};
	const testcasenamelist = [];
	const testcaseidlist = [];
	const screenidlist = [];

	inputs = {
		"query": "testcasedetails",
		"id": req.body.testScenarioId
	};
	data = await utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", fnName);
	if (data != "fail") for (let i = 0; i < data.length; i++) {
		const e = data[i];
		testcasenamelist.push(e["name"]);
		testcaseidlist.push(e["_id"]);
		screenidlist.push(e["screenid"]);
	}
	inputs = { "screenids": screenidlist };
	data = await utils.fetchData(inputs, "suite/getTestcaseDetailsForScenario_ICE", fnName);
	const resultdata = {
		testcasenames: testcasenamelist,
		testcaseids: testcaseidlist,
		screennames: data.screennames || [],
		screenids: screenidlist,
		projectnames: data.projectnames || [],
		projectids: data.projectids || []
	};
	res.send(resultdata);
};


function insertExecutionStatus(executedby,testsuiteids,cycleid,callback) {
	logger.info("Inside updateExecutionStatus function");
	var inputs = {
		"executedby": executedby, 
		"status": "inprogress",
		"testsuiteids":testsuiteids,
		"cycleid":cycleid,
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
function updateExecutionStatus1(testsuiteid, executionid, suiteStatus,cycleid) {
	logger.info("Inside updateExecutionStatus function");
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
			client.post(epurl + "suite/ExecuteTestSuite_ICE1", args,
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
				client.post(epurl + "suite/ExecuteTestSuite_ICE1", args,
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
													client.post(epurl + "suite/ExecuteTestSuite_ICE1", args,
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
			client.post(epurl + "qualityCenter/viewQcMappedList_ICE", args,
				function (qcdetailsows, response) {
				if (response.statusCode != 200 || qcdetailsows.rows == "fail") {
					logger.error("Error occurred in qualityCenter/viewQcMappedList_ICE from qcscenariodetails Error Code : ERRNDAC");
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
			logger.error("Error occurred in the final function of TestCaseDetails_Suite_ICE");
			cb(err);
		} else {
			logger.info("Sending testcase data and QC details from final function of TestCaseDetails_Suite_ICE");
			cb(null, obj);
		}
	});
}

/***********************Scheduling jobs***************************/
exports.testSuitesScheduleCheck_ICE = async (req, res) => {
	logger.info("Inside UI service testSuitesScheduleCheck_ICE");
	var batchInfo = req.body.moduleInfo;
	const taskApproval = await utils.approvalStatusCheck(batchInfo);
	if (taskApproval.res !== "pass") return res.send(taskApproval.res);
	const timestamp = batchInfo.map(u => (u.date + " " + u.time));
	const address = batchInfo.map(u => u.targetUser);
	var inputs = {
		"query": "checkscheduleddetails",
		"scheduledatetime": timestamp,
		"targetaddress": address
	};
	const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", "testSuitesScheduleCheck_ICE");
	const data = (result == "fail")? "fail":((result == -1)? "available": {"status": "booked", "user": address[result]});
	return res.send(data);
};


exports.testSuitesScheduler_ICE = async function (req, res) {
	logger.info("Inside UI service testSuitesScheduler_ICE");
	const batchExecutionData = req.body.executionData;
	const userInfo = {"userid": req.session.userid, "username": req.session.username, "role": req.session.activeRoleId};
	logger.info("Calling function scheduleTestSuite from testSuitesScheduler_ICE");
	scheduleTestSuite(batchExecutionData, exectionMode, userInfo, function (err, schedulecallback) {
		logger.info("TestSuite Scheduled successfully");
		res.send(schedulecallback);
	});
};

//Schedule Testsuite normal and when server restart
function scheduleTestSuite (modInfo, exectionMode, userInfo, schedcallback) {
	logger.info("Inside scheduleTestSuite function");
	var schedulingData = modInfo;
	var action = exectionMode;
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
		cycleId = itr.cycleid;		
		browserList = itr.browserType;
		clientIp = itr.Ip;
		scheduleStatus = "scheduled";
		testSuiteId = itr.testsuiteid;
		testSuitename = itr.testsuitename;
		versionnumber = itr.versionnumber;
		scenarioDetails = itr.suiteDetails;
		scheduleId= itr.scheduleid;
		releaseId= itr.releaseid;
		domainName= itr.domainname;
		projectName= itr.projectname;
		cycleName= itr.cyclename;
		scenarionames= itr.scenarionames;
		var sessObj;
		//Normal scheduling
		if (rescheduleflag != true) {
			//scheduleId = uuid();
			sessObj = scheduleId + ";" + dateTime.valueOf().toString();
			var inputs = {
				"cycleid": cycleId,
				"scheduledatetime": dateTime.valueOf().toString(),
				//"scheduleid": scheduleId,
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
							sessObj = result.rows+ ";" + dateTime.valueOf().toString()+";"+cycleId;
							var scheduledjob = schedule.scheduleJob(sessObj, obj, function () {
								logger.info("Calling function executeScheduling from scheduleTestSuite");
								executeScheduling(sessObj, action, schedulingData, userInfo);
								//Callback();
							});
							counter++;
							Callback();
						} catch (ex) {
							logger.error("Exception in the function executeScheduling from scheduleTestSuite: %s", ex);
							scheduleStatus = "Failed 02";
							logger.info("Calling function updateStatus from scheduleTestSuite");
							updateStatus1(sessObj, function (err, data) {
								if (!err) {
									logger.info("Scheduling status updated successfully", data);
								}
								//Callback();
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
			sessObj = scheduleId + ";" + dateTime.valueOf().toString()+";"+cycleId;
			var obj = new Date(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1], 0); //new Date(schDate[2], (schDate[1] - 1), schDate[0], schTime[0], schTime[1], 0);
			try {
				var scheduledjob = schedule.scheduleJob(sessObj, obj, function () {
					logger.info("Calling function executeScheduling from scheduleTestSuite: reshedule");
					executeScheduling(sessObj, schedulingData, userInfo);
					//Callback();
				});
				counter++;
				//Callback()
				
			} catch (ex) {
				logger.error("Exception in the function executeScheduling from scheduleTestSuite: reshedule: %s", ex);
				scheduleStatus = "Failed 02";
				updateStatus1(sessObj, function (err, data) {
					if (!err) {
						logger.info("Scheduling status updated successfully", data);
						
					}
					//Callback();
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
	function executeScheduling(sessObj, action, schedulingData, userInfo) {
		logger.info("Inside executeScheduling function");
		var cycleid =  sessObj.split(";")[2];
		//var inputs = { "query": "getscheduledata", "scheduleid": sessObj.split(";")[0] };
		//const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", "getScheduledDetails_ICE");
		var inputs = {
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
		var executionRequest = {
			"exec_mode" : action,
			"executionId": "",
			"suitedetails": [],
			"testsuiteIds": []
		};
		result1 = '';
		var ipAdd;
		async.series({
			schedule_suite:function(callback_E){
				logger.info("Calling NDAC Service from executeScheduling: suite/ScheduleTestSuite_ICE");
				client.post(epurl + "suite/ScheduleTestSuite_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in suite/ScheduleTestSuite_ICE from executeScheduling Error Code : ERRNDAC");
						scheduleStatus = "Failed 02";
						logger.info("Calling function updateStatus from executeScheduling");
						updateStatus1(sessObj, function (err, data) {
							if (!err) {
								logger.info("Scheduling status updated successfully", data);
							}
							callback_E();
						});
						// deleteFlag = true;
						// deleteScheduledData(deleteFlag, sessObj)
						
						
					}else{
						result1 = result;
						callback_E();
					}
				})
			},suite_execution:function(callback_E){
				if (result1.rows[0].status == "scheduled") {
					var suiteDetails = result1.rows[0].scenariodetails;
					var testsuitedetailslist = [];
					var testsuiteid = JSON.parse(JSON.stringify(result1.rows[0].testsuiteids))[0];
					var testsuitenm = result1.rows[0].testsuitename;
					var browserType = result1.rows[0].executeon;
					ipAdd = result1.rows[0].target;
					var scenarioIdList = [];
					var dataparamlist = [];
					var conditionchecklist = [];
					var browserTypelist = [];
					var listofscenarioandtestcases = [];
					var appType;
					
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
								logger.error("Error occurred in the function TestCaseDetails_Suite_ICE from executeScheduling Error Code - ERRNDAC: %s", currentscenarioidError);
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
									executionjson[testsuiteid] = listofscenarioandtestcases;
									executionjson.scenarioIds = scenarioIdList;
									executionjson.browserType = browserTypelist;
									executionjson.condition = conditionchecklist;
									executionjson.dataparampath = dataparamlist;
									executionjson.testsuiteid = testsuiteid;
									executionjson.testsuitename = testsuitenm;
									executionjson.releaseid = releaseId;
									executionjson.cyclename = cycleName;
									executionjson.projectname = projectName;
									executionjson.domainname = domainName;
									executionjson.scenarioNames = scenarionames;
									testsuitedetailslist.push(executionjson);
									//executionRequest.executionId = JSON.parse(JSON.stringify(result1.rows[0].scheduleid));
									executionRequest.suitedetails = testsuitedetailslist;
									executionRequest.testsuiteIds.push(testsuiteid);
									executionRequest.apptype = appType;
									//batchExecutionDataCallback();
									logger.info("Calling scheduleFunction function TestCaseDetails_Suite_ICE from executeScheduling");
									callback_E()
								}
							}
						});
						
					});
					
					
				}


			},
			execution_insertion:function(callback_E){ 
				insertExecutionStatus(userInfo.userid,executionRequest.testsuiteIds,cycleid,function(res){
				   if(res == 'fail'){
					   executionId = '';
				   }else{
					   executionRequest.executionId = res;
				   }
				   callback_E();
			   });
		   },execute_function:function(callback_E){
			// function scheduleFunction(executionRequest) {
				logger.info("Inside scheduleFunction function of executeScheduling");
				var name = ipAdd;
				redisServer.redisSubServer.subscribe('ICE2_' + name);	
				//var scenarioCount_s = executionRequest.suitedetails[0].scenarioIds.length;
				var completedSceCount_s = 0;
				var testsuitecount_s = 0;
				var statusPass_s = 0;
				var suiteStatus_s;
				var scenarioIds = {};
				scenarioIds[testsuiteid]=[];
				var scnDetail = result1.rows[0].scenariodetails;
				for(let i = 0; i < scnDetail.length; i++) {
					scenarioIds[testsuiteid].push(scnDetail[i].scenarioids);
				}
				logger.debug("ICE Socket requesting Address: %s" , name);
				redisServer.redisPubICE.pubsub('numsub','ICE1_scheduling_' + name,function(err,redisres){
					if (redisres[1]>0) {
						logger.info("Sending socket request for executeTestSuite:scheduling to redis");
						dataToIce = {"emitAction" : "executeTestSuite","username" : name, "executionRequest": executionRequest};
						redisServer.redisPubICE.publish('ICE1_scheduling_' + name,JSON.stringify(dataToIce));
						var starttime = new Date().getTime();
						function executeTestSuite_listener(channel,message) {
							var data = JSON.parse(message);
							if(name == data.username && executionRequest.executionId == data.value.executionId) {
								if (data.onAction == "return_status_executeTestSuite") {
									var response = data.value;
									if(response.status == "success"){
										scheduleStatus = "Inprogress";
										logger.info("Calling function updateStatus from scheduleFunction");
										updateStatus1(sessObj, function (err, data) {
											if (!err) {
												logger.info("Sending response data from scheduleFunction");
											}
										});
									}
									else if(response.status == "skipped"){
										scheduleStatus = "Inprogress";
										logger.info("Calling function updateSkippedScheduleStatus from scheduleFunction");
										response.data.scenario_ids = scenarioIds;
										var sessobj_new = sessObj + ';Skipped;' +  JSON.stringify(result1.rows[0]) + ';' +JSON.stringify(response.data);
										var msg = "The scenario was skippped due to conflicting schedules.";
										updateSkippedScheduleStatus(sessobj_new, msg, function (err, data){
											if(!err){
												logger.info("Sending response data from scheduleFunction");
											}
										});
									}
								} else if (data.onAction == "result_executeTestSuite") {
									var resultData = data.value;
									if (!resultData.status) { // This block is for report data
										try {
											completedSceCount_s++;
											var scenarioCount_s = executionRequest.suitedetails[testsuitecount_s].scenarioIds.length  * executionRequest.suitedetails[testsuitecount_s].browserType.length;
											var scenarioid = resultData.scenarioId;
											var executionid = resultData.executionId;
											var reportdata = resultData.reportData;
											var testsuiteid = resultData.testsuiteId;
											if (reportdata.overallstatus.length != 0) {
												var req_overAllStatus = reportdata.overallstatus[0];
												var req_browser = req_overAllStatus.browserType;
												reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
												reportdata = JSON.parse(reportdata);
												//var reportId = uuid();
												if (req_overAllStatus.overallstatus == "Pass") {
													statusPass_s++;
												}
												var inputs = {
													//"reportid": reportId,
													"executionid": executionid,
													"testsuiteid": testsuiteid,
													"testscenarioid": scenarioid,
													"browser": req_browser,
													"cycleid":cycleid,
													"status": req_overAllStatus.overallstatus,
													"report": JSON.stringify(reportdata),
													"modifiedby":userInfo.userid,
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
														flag = "fail";
													} else {
														flag = "success";
													}
												});
												if (completedSceCount_s == scenarioCount_s) {
													if (statusPass_s == scenarioCount_s) {
														suiteStatus_s = "pass";
													} else {
														suiteStatus_s = "fail";
													}
													completedSceCount_s = 0;
													testsuitecount_s++;
													logger.info("Calling function updateSchedulingStatus from scheduleFunction");
													updateSchedulingStatus(testsuiteid, executionid, starttime, suiteStatus_s,cycleid);
												}
											} else {
												completedSceCount_s++;
												scenarioCount_s = executionRequest.suitedetails[testsuitecount_s].scenarioIds.length;
												if (completedSceCount_s == scenarioCount_s) {
													suiteStatus_s = "Fail";
													completedSceCount_s = 0;
													testsuitecount_s++;
													logger.info("Calling function updateExecutionStatus from scheduleFunction");
													updateExecutionStatus1(testsuiteid, executionid, starttime, suiteStatus_s,cycleid);
												}
											}
										} catch (ex) {
											logger.error("Exception occurred in the scheduleFunction: %s", ex);
										}
									} else { // This block will trigger when resultData.status has "success or "Terminate"
										if (typeof(resultData.status) == "string") {
											redisServer.redisSubServer.removeListener("message",executeTestSuite_listener);
											scheduleStatus = resultData.status == "success" ? "Completed" : resultData.status;
										}
										try {
											logger.info("Calling function updateStatus from scheduleFunction");
											updateStatus1(sessObj, function (err, data) {
												if (!err) {
													logger.info("Sending response data from scheduleFunction");
												}
											});
											//res.send(resultData);
										} catch (ex) {
											logger.error("Exception occurred in the updateStatus function of scheduleFunction: %s", ex);
										}
									}
								}
							}
						}
						redisServer.redisSubServer.on("message",executeTestSuite_listener);
					} else {
						logger.error("Error occurred in the function scheduleFunction: Socket not Available");
						var scheduleid = result1.rows[0]._id;
						var datetime = new Date();
						datetime = datetime.getFullYear()+'-'+(datetime.getMonth()+1)+'-'+datetime.getDate()+' '+datetime.getHours()+':'+datetime.getMinutes()+':'+datetime.getSeconds()+'0';
						var data = {'scenario_ids':scenarioIds,'execution_id':scheduleid,'time':String(datetime)};
						var sessobj_new = sessObj + ';Skipped;' +  JSON.stringify(result1.rows[0]) + ';' +JSON.stringify(data);
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
		});
	}

	//Update execution table on completion of suite execution
	function updateSchedulingStatus(testsuiteid, executionid, starttime, suiteStatus_s,cycleid) {
		logger.info("Inside updateSchedulingStatus function");
		var inputs = {
			"testsuiteid": testsuiteid,
			"executionid": executionid,
			//"starttime": starttime.toString(),
			"cycleid":cycleid,
			"status": suiteStatus_s,
			"query": "updateintotexecutionquery"
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
function updateStatus1(sessObj, updateStatuscallback) {
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
		if (sessObj.split(';')[4].split(',')[5].replace(/"/g,"").split(':')[1]!="[]"){
			data=JSON.parse(sessObj.split(';')[4]+';'+sessObj.split(';')[5])
			var executionid = JSON.parse(sessObj.split(';')[6]).execution_id;
			var time = JSON.parse(sessObj.split(';')[6]).time;
		} else{
			var data = JSON.parse(sessObj.split(';')[4]);
			var executionid = JSON.parse(sessObj.split(';')[5]).execution_id;
			var time = JSON.parse(sessObj.split(';')[5]).time
		}
		if(data['_id'] == sessObj.split(";")[0]){
			var inputs = {
				"schedulestatus": "Skipped",
				"cycleid": sessObj.split(";")[2],
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
				logger.info("Calling NDAC Service from updateSkippedScheduleStatus: suite/ScheduleTestSuite_ICE");
				client.post(epurl + "suite/ScheduleTestSuite_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in suite/ScheduleTestSuite_ICE from updateSkippedScheduleStatus, Error Code : ERRNDAC");
						updateStatuscallback(null, "fail");
					}
				});
				var obj = data['scenariodetails'];
				for(var i=0;i<(Object.keys(obj)).length;i++){
					var report_data = data;
					var scenario = obj[i].scenarioids;
					var testsuiteid = report_data.testsuiteids[0];
					var req_browser = 'NA';
					var sheduledby = data.scheduledby;
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
												'StartTime': time,
												'EndTime': time,
												'overallstatus': 'Skipped'
											}
										]
									}
					var inputs = {
						//"reportid": reportId,
						"executionid": executionid,
						"testsuiteid": testsuiteid,
						"testscenarioid": scenario,
						"browser": req_browser,
						"cycleid":sessObj.split(";")[2],
						"status": reportData.overallstatus[0].overallstatus,
						"report": JSON.stringify(reportData),
						"modifiedby": sheduledby,
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

//Update Schedule status of current scheduled job
const updateScheduleStatus = async (scheduleid, newstatus, currentstatus) => {
	logger.info("Inside updateScheduleStatus function");
	if (currentstatus === undefined) {
		const inputs = {
			"query": "getscheduledata",
			"scheduleid": scheduleid
		};
		const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", "getScheduledDetails_ICE");
		if (result == "fail") return "fail";
		currentstatus = result[0].status;
	}
	if (currentstatus != "Skipped"){
		var inputs = {
			"schedulestatus": newstatus,
			"scheduleid": scheduleid,
			"query": "updatescheduledstatus"
		};
		const result2 = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", "updateScheduleStatus");
		return result2;
	} else return "fail";
};

exports.getScheduledDetails_ICE = async (req, res) => {
	logger.info("Inside UI service getScheduledDetails_ICE");
	const inputs = { "query": "getscheduledata" };
	const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", "getScheduledDetails_ICE");
	return res.send(result);
}

//cancel scheduled Jobs
exports.cancelScheduledJob_ICE = async (req, res) => {
	logger.info("Inside UI service cancelScheduledJob_ICE");
	const userid = req.session.userid;
	const username = req.session.username;
	const scheduleid = req.body.schDetails.scheduleid;
	const schedHost = req.body.host;
	const schedUserid = req.body.schedUserid;
	if(!(schedUserid == userid || schedHost == username)) {
		logger.info("Sending response 'not authorised' from cancelScheduledJob_ICE service");
		return res.send("not authorised");
	}
	const inputs = {
		"query": "getscheduledata",
		"scheduleid": scheduleid
	};
	const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", "getScheduledDetails_ICE");
	if (result == "fail") return res.send("fail");
	const status = result[0].status;
	if (status != "scheduled") {
		logger.info("Sending response 'inprogress' from cancelScheduledJob_ICE service");
		return res.send("inprogress");
	}
	const result2 = await updateScheduleStatus(scheduleid, "cancelled", status);
	return res.send(result2);
};

//Re-Scheduling the tasks
exports.reScheduleTestsuite = async () => {
	logger.info("Inside UI service reScheduleTestsuite");
	const fnName = "reScheduleTestsuite";
	try {
		var inputs = {
			"query": "getscheduledata",
			"status": "scheduled"
		};
		const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
		if (result == "fail") return logger.info("Status from the function "+fnName+": Jobs are not rescheduled");
		return logger.warn("Status from the function "+fnName+": Jobs are not rescheduled due to WIP");
		var getscheduleData = [];
		var status;
		for (var i = 0; i < result.length; i++) {
			status = result[i].status;
			if (status != "success" && status != "Terminate" && status != "Inprogress") {
				getscheduleData.push(result[i]);
			}
			if (status == "Inprogress") {
				scheduleStatus = "Failed 01";
				var str,dd,dt;
				var tempDD,tempDT;
				str = new Date(result[i].scheduledon).getFullYear() + "-" + ("0" + (new Date(result[i].scheduledon).getMonth() + 1)).slice(-2) + "-" + ("0" + new Date(result[i].scheduledon).getDate()).slice(-2) + " " + ("0" + new Date(result[i].scheduledon).getUTCHours()).slice(-2) + ":" + ("0" + new Date(result[i].scheduledon).getUTCMinutes()).slice(-2);
				tempDD = str.split(" ")[0];
				tempDT = str.split(" ")[1];
				dd = tempDD.split("-");
				dt = tempDT.split(":");
				var objectD = result[i].cycleid.valueOf().toString() + ";" + result[i].scheduleid.valueOf().toString() + ";" + new Date(Date.UTC(dd[0], dd[1] - 1, dd[2], dt[0], dt[1])).valueOf().toString();
				logger.info("Calling function updateStatus from reScheduleTestsuite service");
				updateStatus1(objectD, function (err, data) {
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
					modInfo.browserType = itrSchData.executeon;
					modInfo.cycleid = itrSchData.cycleid.valueOf().toString();
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
					updateStatus1(objectD, function (err, data) {
						if (!err) {
							logger.info("Sending response data from the function updateStatus of reScheduleTestsuite service");
						}
						getscheduleDataCallback();
					});
				}
				
			});
		}
	} catch (ex) {
		logger.error("Exception in the function reScheduleTestsuite: %s", ex);
	}
};
