var uuid = require('uuid-random');
var schedule = require('node-schedule');
var myserver = require('../lib/socket');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');
if (process.env.REPORT_SIZE_LIMIT) require('follow-redirects').maxBodyLength = parseInt(process.env.REPORT_SIZE_LIMIT)*1024*1024;
const scheduleJobMap = {};
const SOCK_NORM = "normalModeOn";
const SOCK_SCHD = "scheduleModeOn";
const SOCK_NA = "unavailableLocalServer";
const SOCK_NORM_MSG = "ICE is connected in Non-Scheduling mode";
const SOCK_SCHD_MSG = "ICE is connected in Scheduling mode";
const SOCK_NA_MSG = "ICE is not Available";
const DO_NOT_PROCESS = "do_not_process_response";

/** This service reads the testsuite and scenario information for the testsuites */
exports.readTestSuite_ICE = async (req, res) => {
	const fnName = "readTestSuite_ICE";
	logger.info("Inside UI service " + fnName);
	const batchData = req.body.readTestSuite;
	const fromFlg = req.body.fromFlag;
	const userInfo = {"userid": req.session.userid, "role": req.session.activeRoleId};
	var responsedata = {};
	var inputs = {};

	for (const suite of batchData) {
		const moduleId = suite.testsuiteid;
		inputs = {
			"query": "gettestsuite",
			"mindmapid": moduleId,
			"cycleid": suite.cycleid,
			"createdby": userInfo.userid,
			"createdbyrole": userInfo.role
		};
		const testsuite = await utils.fetchData(inputs, "suite/readTestSuite_ICE", fnName);
		if (testsuite == "fail") return res.send("fail");
		inputs = {
			"query": "gettestscenario",
			"testscenarioids": testsuite.testscenarioids
		};
		const testscenarioDetails = await utils.fetchData(inputs, "suite/readTestSuite_ICE", fnName);
		if (testscenarioDetails == "fail") return res.send("fail");
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

/** This service updates the testsuite and scenario information for the loaded testsuite */
exports.updateTestSuite_ICE = async (req, res) => {
    logger.info("Inside UI service: updateTestSuite_ICE");
	const userInfo = {"userid": req.session.userid, "username": req.session.username, "role": req.session.activeRoleId};
	var batchDetails = req.body.batchDetails;
	var overallstatusflag = "success";
	for (const testsuite of batchDetails) {
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

/** Function responsible for returning ICE connection status */
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

/** Function responsible for updating execution counter for licensing */
const counterUpdater = async (count, userid) => {
	const updateinp = {
		"query": "testsuites",
		"count": count,
		"userid": userid
	};
	return utils.fetchData(updateinp, "utility/dataUpdator_ICE", "counterUpdater");
};

/** Function responsible for fetching testcase and qcdetails for given scenarioid */
const fetchScenarioDetails = async (scenarioid, userid) => {
	const fnName = "fetchScenarioDetails";
	const scenario = {};
	const allTestcaseSteps = [];
	const allTestcaseObj = {};
	var inputs = null;

	// Step 1: Get Testcase details
	inputs = {
		"query": "testcasedetails",
		"id": scenarioid,
		"userid": userid
	};
	var testcases = await utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", fnName);
	if (testcases == "fail") return "fail";

	// Step 2: Get Testcasesteps
	for (const tc of testcases) {
		if (allTestcaseObj[tc._id] === undefined) {
			inputs = {
				"testcaseid": tc._id,
				"screenid": tc.screenid,
				"versionnumber": tc.versionnumber,
				"query": "readtestcase"
			};
			const testcasedata = await utils.fetchData(inputs, "design/readTestCase_ICE", fnName);
			if (testcasedata == "fail") return "fail";
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
	if (qcdetails != "fail" && qcdetails.length > 0) scenario.qcdetails = JSON.parse(JSON.stringify(qcdetails[0]));
	else scenario.qcdetails = {};
	return scenario;
};

/** Function responsible for creating execution request json that will be consumed by ICE */
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
	for (const suite of batchInfo) {
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
		for (const tsco of suiteDetails) {
			var scenario = await fetchScenarioDetails(tsco.scenarioId, userInfo.userid);
			if (scenario == "fail") return "fail";
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

/** Function responsible for generating batchid and executionid dfor given list of testsuiteid */
const generateExecutionIds = async (execIds, tsuIds, userid) => {
	for (const tsuid of tsuIds) {
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
	if (newExecIds == "fail") return "fail";
	execIds.batchid = newExecIds.batchid;
	execIds.execid = newExecIds.execids;
	return newExecIds;
};

/** Function responsible for inserting report into NDAC */
const insertReport = async (executionid, scenarioId, browserType, userInfo, reportData) => {
	const inputs = {
		"executionid": executionid,
		"testscenarioid": scenarioId,
		"browser": browserType,
		"status": reportData.overallstatus[0].overallstatus,
		"report": JSON.stringify(reportData),
		"modifiedby": userInfo.userid,
		"modifiedbyrole": userInfo.role,
		"query": "insertreportquery"
	};
	const result = utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", "insertReport");
	return result;
};

/** Function responsible for updating execution status after execution */
const updateExecutionStatus = async (execIds, status) => {
	const fnName = "updateExecutionStatus";
	logger.info("Calling function " + fnName + " from executionFunction");
	const inputs = {
		"query": "updateintoexecution",
		"executionids": execIds,
		"status": status
	};
	const response = await utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", fnName);
	return response;
};

/** Function responsible for updating execution status and insert reports for the skipped scenarios. */
const updateSkippedExecutionStatus = async (batchData, userInfo, status, msg) => {
	const dt = new Date();
	const currtime = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+dt.getDate()+' '+dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds()+'.'+dt.getMilliseconds();
	//const currtime = new Date(dt.getTime()-dt.getTimezoneOffset()*60000).toISOString().replace('T',' ').replace('Z','');
	const reportData = {
		'rows': [{ 'id': '1', 'Keyword': '', 'parentId': '', 'status': status, 'Step ': '', 'Comments': null, 'StepDescription': msg, "screenshot_path" : null, "EllapsedTime" : "0:00:00.000000", "Remark" : "", "testcase_details" : "" } ],
		'overallstatus': [{ 'EllapsedTime': '0:00:00.000000', 'EndTime': currtime, 'browserVersion': 'NA', 'StartTime': currtime, 'overallstatus': status, 'browserType': 'NA' } ], 
		'commentsLength': []
	}
	const executionIds = batchData.executionIds;
	for (let i = 0; i < batchData.suitedetails.length; i++) {
		const suite = batchData.suitedetails[i];
		for (const scid of suite.scenarioIds) {
			await insertReport(executionIds[i], scid, "N/A", userInfo, reportData);
		}
	}
	await updateExecutionStatus(executionIds, "fail");
};

/** Function responsible for sending execution request to ICE and reciving reports and status */
const executionRequestToICE = async (execReq, execType, userInfo) => {
	const fnName = "executionRequestToICE";
	logger.info("Inside " + fnName + " function");
	const name = userInfo.username;
	const channel = (execType == "SCHEDULE")? "scheduling":"normal";
	var completedSceCount = 0;
	var statusPass = 0;

	logger.info("Sending request to ICE for executeTestSuite");
	const dataToIce = {"emitAction" : "executeTestSuite","username" : name, "executionRequest": execReq};
	redisServer.redisPubICE.publish('ICE1_' + channel + '_' + name, JSON.stringify(dataToIce));

	const exePromise = async (resSent) => (new Promise((rsv, rej) => {
		var d2R = {};
		async function executeTestSuite_listener(channel, message) {
			const data = JSON.parse(message);
			const event = data.onAction;
			const resultData = data.value;
			const batchId = (resultData)? resultData.batchId : "";
			if (!(name == data.username && (event == SOCK_NA || (event != SOCK_NA  && execReq.batchId == batchId)))) return false;
			const status = resultData.status;
			if (event == SOCK_NA) {
				redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
				logger.error("Error occurred in " + fnName + ": Socket Disconnected");
				if (resSent && notifySocMap[name]) {
					notifySocMap[name].emit("ICEnotAvailable");
					rsv(DO_NOT_PROCESS);
				} else rsv(SOCK_NA);
			} else if (event == "return_status_executeTestSuite") {
				if (status == "success") {
					if (execType == "SCHEDULE") await updateScheduleStatus(execReq.scheduleId, "Inprogress", batchId);
				} else if (status == "skipped") {
					const execStatus = "Skipped";
					var errMsg = (execType == "SCHEDULE")? "due to conflicting schedules":
						"because another execution is running in ICE";
					redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
					logger.error("Error occurred in " + fnName + ": Execution is skipped " + errMsg);
					errMsg = "This scenario was skipped " + errMsg;
					await updateSkippedExecutionStatus(execReq, userInfo, execStatus, errMsg);
					if (resSent && notifySocMap[name]) {
						notifySocMap[name].emit(execStatus);
						rsv(DO_NOT_PROCESS);
					} else rsv(execStatus);
				}
			} else if (event == "result_executeTestSuite") {
				if (!status) { // This block is for report data
					const executionid = resultData.executionId;
					const scenarioid = resultData.scenarioId;
					const testsuiteid = resultData.testsuiteId;
					const testsuiteIndex = execReq.testsuiteIds.indexOf(testsuiteid);
					const testsuite = execReq.suitedetails[testsuiteIndex];
					try {
						completedSceCount++;
						const reportData = JSON.parse(JSON.stringify(resultData.reportData).replace(/'/g, "''"));
						var scenarioCount = testsuite.scenarioIds.length * testsuite.browserType.length;
						if (execType == "API") {
							if (d2R[testsuiteid] === undefined) d2R[testsuiteid] = {"testsuiteName": testsuite.testsuitename, "testsuiteId": testsuiteid, "scenarios": {}};
							if (d2R[testsuiteid].scenarios[scenarioid] === undefined) d2R[testsuiteid].scenarios[scenarioid] = [];
							d2R[testsuiteid].scenarios[scenarioid].push({
								"scenarioname": testsuite.scenarioNames[testsuite.scenarioIds.indexOf(scenarioid)],
								"scenarioid": scenarioid,
								"overallstatus": "Not Executed"
							});
						}
						if (reportData.overallstatus.length == 0) {
							completedSceCount++;
							scenarioCount = testsuite.scenarioIds.length;
							if (completedSceCount == scenarioCount) {
								completedSceCount = statusPass = 0;
								await updateExecutionStatus([executionid], "fail");
							}
						} else {
							const appTypes = ["OEBS", "MobileApp", "System", "Webservice", "Mainframe", "SAP", "Desktop"];
							const browserType = (appTypes.indexOf(execReq.apptype) > -1)? execReq.apptype:reportData.overallstatus[0].browserType;
							reportData.overallstatus[0].browserType = browserType;
							if (execType == "API") {
								const cidx = d2R[testsuiteid].scenarios[scenarioid].length - 1;
								d2R[testsuiteid].scenarios[scenarioid][cidx] = {...d2R[testsuiteid].scenarios[scenarioid][cidx], ...reportData.overallstatus[0]};
							}
							if (reportData.overallstatus[0].overallstatus == "Pass") statusPass++;
							const insRepStatus =  await insertReport(executionid, scenarioid, browserType, userInfo, reportData);
							if (insRepStatus != "fail") logger.info("Successfully inserted report data");
							else logger.error("Failed to insert report data");
							if (completedSceCount == scenarioCount) {
								const suiteStatus = (statusPass == scenarioCount)? "pass" : "fail";
								completedSceCount = statusPass = 0;
								await updateExecutionStatus([executionid], suiteStatus);
							}
						}
					} catch (ex) {
						logger.error("Exception in the function " + fnName + ": insertreportquery: %s", ex);
						await updateExecutionStatus([executionid], "fail");
					}
				} else { // This block will trigger when resultData.status has "success or "Terminate"
					redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
					try {
						if (resSent && notifySocMap[name]) { // This block is only for active mode
							notifySocMap[name].emit("result_ExecutionDataInfo", status);
							rsv(DO_NOT_PROCESS);
						} else {
							if (execType == "API") d2R = [d2R, status];
							else d2R = status;
							rsv(d2R);
						}
					} catch (ex) {
						logger.error("Exception while returning execution status from function " + fnName + ": %s", ex);
						rej("fail");
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

/** Function responsible for Orchestrating execution flow. Invokes series of functions to achive the results */
const executionFunction = async (batchExecutionData, execIds, userInfo, execType) => {
	redisServer.redisSubServer.subscribe('ICE2_' + userInfo.username);
	var iceStatus = await checkForICEstatus(userInfo.username, execType);
	if (iceStatus != null) return iceStatus;
	const taskApproval = await utils.approvalStatusCheck(batchExecutionData.batchInfo);
	if (taskApproval.res !== "pass") return taskApproval.res;
	/*const countStatus =*/ await counterUpdater(batchExecutionData.batchInfo.length, userInfo.userid);
	// if (countStatus == "fail") return "fail";
	const executionRequest = await prepareExecutionRequest(batchExecutionData, userInfo);
	if (executionRequest == "fail") return "fail";
	const currExecIds = await generateExecutionIds(execIds, executionRequest.testsuiteIds, userInfo.userid);
	if (currExecIds == "fail") return "fail";
	executionRequest.batchId = currExecIds.batchid;
	executionRequest.executionIds = executionRequest.testsuiteIds.map(i => currExecIds.execids[i]);
	if (execType == "SCHEDULE") executionRequest.scheduleId = batchExecutionData.scheduleId;
	const result = await executionRequestToICE(executionRequest, execType, userInfo);
	return result;
};

/** This service executes the testsuite(s) for request from Nineteen68 */
exports.ExecuteTestSuite_ICE = async (req, res) => {
	logger.info("Inside UI service: ExecuteTestSuite_ICE");
	const userInfo = {"userid": req.session.userid, "username": req.session.username, "role": req.session.activeRoleId};
	const batchExecutionData = req.body.executionData;
	const execIds = {"batchid": "generate", "execid": {}};
	var result;
	try {
		result = await executionFunction(batchExecutionData, execIds, userInfo, "ACTIVE");
	} catch (ex) {
		result = "fail";
		logger.error("Error in ExecuteTestSuite_ICE service. Error: %s", ex)
	}
	if (result == DO_NOT_PROCESS) return true;
	return res.send(result);
};

/** This service executes the testsuite(s) for request from API */
exports.ExecuteTestSuite_ICE_API = async (req, res) => {
	logger.info("Inside UI service: ExecuteTestSuite_ICE_API");
	const hdrs = req.headers;
	let reqFromADO = false;
	// Check if request came from Azure DevOps. If yes, then send the acknowledgement
	if (hdrs["user-agent"].startsWith("VSTS") && hdrs.planurl && hdrs.projectid) {
		reqFromADO = true;
		res.send("Request Received");
	}
	const multiBatchExecutionData = req.body.executionData;
	const userRequestMap = {};
	const userInfoList = [];
	const executionResult = [];
	for (let i = 0; i < multiBatchExecutionData.length; i++) {
		const executionData = multiBatchExecutionData[i];
		const userInfo = await utils.tokenValidation(executionData.userInfo || {});
		userInfoList.push(userInfo);
		const execResponse = userInfo.inputs;
		if (execResponse.tokenValidation == "passed") {
			delete execResponse.error_message;
			const username = userInfo.username;
			if (userRequestMap[username] == undefined) userRequestMap[username] = [i];
			else userRequestMap[username].push(i);
		}
		executionResult.push(execResponse);
	}
	const executionIndicesList = Object.values(userRequestMap);
	const batchExecutionPromiseList = executionIndicesList.map(executionIndices => (async () => {
		try {
			for (const exi of executionIndices) {
				const batchExecutionData = multiBatchExecutionData[exi];
				const execResponse = executionResult[exi];
				const userInfo = userInfoList[exi];
				const execIds = {"batchid": "generate", "execid": {}};
				var result;
				try {
					result = await executionFunction(batchExecutionData, execIds, userInfo, "API");
				} catch (ex) {
					result = "fail";
					logger.error("Error in ExecuteTestSuite_ICE_API service. Error: %s", ex)
				}
				if (result == SOCK_NA) execResponse.error_message = SOCK_NA_MSG;
				else if (result == SOCK_SCHD) execResponse.error_message = SOCK_SCHD_MSG;
				else if (result == "NotApproved") execResponse.error_message = "All the dependent tasks (design, scrape) needs to be approved before execution";
				else if (result == "NoTask") execResponse.error_message = "Task does not exist for child node";
				else if (result == "Modified") execResponse.error_message = "Task has been modified, Please approve the task";
				else if (result == "Skipped") execResponse.error_message = "Execution is skipped because another execution is running in ICE";
				else if (result == "fail") execResponse.error_message = "Internal error occurred during execution";
				else {
					execResponse.status = result[1];
					const execResult = [];
					for (tsuid in result[0]) {
						const tsu = result[0][tsuid];
						const scenarios = [];
						tsu.executionId = execIds.execid[tsuid];
						for (tscid in tsu.scenarios) scenarios.push(...tsu.scenarios[tscid]);
						delete tsu.scenarios;
						tsu.suiteDetails = scenarios;
						execResult.push(tsu);
					}
					execResponse.batchInfo = execResult;
				}
			}
		} catch (e) {
			return false;
		}
	})());
	await Promise.all(batchExecutionPromiseList)
	const finalResult = {"executionStatus": executionResult};
	if (!reqFromADO) return res.send(finalResult);
	// This code only executes when request comes from Azure DevOps
	let adoStatus = finalResult.executionStatus.every(e => e.status == "success");
	const args = {
		data: { "name": "TaskCompleted", "taskId": hdrs.taskinstanceid, "jobId": hdrs.jobid, "result": (adoStatus? "succeeded":"failed") },
		headers: {
			"Authorization": 'Basic ' + Buffer.from(':' + hdrs.authtoken).toString('base64'),
			"Content-Type": "application/json"
		}
	};
	const adourl = hdrs.planurl+'/'+hdrs.projectid+'/_apis/distributedtask/hubs/'+hdrs.hubname+'/plans/'+hdrs.planid+'/events?api-version=2.0-preview.1';
	logger.info("Sending response to Azure DevOps");
	const promiseData = (new Promise((rsv, rej) => {
		const apiReq = client.post(adourl, args, (result, response) => {
			if (response.statusCode < 200 && response.statusCode >= 400) {
				logger.error("Error occurred while sending response to Azure DevOps");
				const toLog = ((typeof(result)  == "object") && !(result instanceof Buffer))? JSON.stringify(result):result.toString();
				logger.debug("Response code is %s and content is %s", response.statusCode, toLog);
				rsv("fail");
			} else {
				rsv(result);
			}
		});
		apiReq.on('error', function(err) {
			logger.error("Error occurred while sending response to Azure DevOps, Error: %s", err);
			rsv("fail");
		});
	}));
	try { return await promiseData; }
	catch (e) { logger.error(e); }
};

/** Service to fetch all the testcase, screen and project names for provided scenarioid */
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
	if (data != "fail") for (const e of data) {
		testcasenamelist.push(e["name"]);
		testcaseidlist.push(e["_id"]);
		screenidlist.push(e["screenid"]);
	}
	inputs = { "screenids": screenidlist };
	if (data != "fail") data = await utils.fetchData(inputs, "suite/getTestcaseDetailsForScenario_ICE", fnName);
	if (data == "fail") {
		data = {};
		logger.error("In function " + fnName + ": Fail to fetch scenario details");
	}
	const resultdata = {
		testcasenames: testcasenamelist,
		testcaseids: testcaseidlist,
		screennames: data.screennames || [],
		screenids: screenidlist,
		projectnames: data.projectnames || [],
		projectids: data.projectids || []
	};
	return res.send(resultdata);
};

/***********************Scheduling jobs***************************/
/** This service executes the testsuite(s) at a given schedule date and time */
exports.testSuitesScheduler_ICE = async (req, res) => {
	logger.info("Inside UI service testSuitesScheduler_ICE");
	const fnName = "testSuitesScheduler_ICE";
	const userInfo = {"userid": req.session.userid, "username": req.session.username, "role": req.session.activeRoleId};
	const multiExecutionData = req.body.executionData;
	const batchInfo = multiExecutionData.batchInfo;
	const taskApproval = await utils.approvalStatusCheck(batchInfo);
	if (taskApproval.res !== "pass") return res.send(taskApproval.res);
	const dateTimeList = batchInfo.map(u => {
		const dt = u.date.split("-");
		const tm = u.time.split(":");
		return new Date(dt[2], dt[1] - 1, dt[0], tm[0], tm[1], 0).valueOf().toString();
	});
	const addressList = batchInfo.map(u => u.targetUser);
	var inputs = {
		"query": "checkscheduleddetails",
		"scheduledatetime": dateTimeList,
		"targetaddress": addressList
	};
	const chkResult = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
	if (chkResult != -1) return res.send((chkResult == "fail")? "fail": {"status": "booked", "user": addressList[chkResult]});
	/** Add if else for smart schedule below this **/
	// smartScheduleId = uuid(); Pass it to args as smartid
	const userTimeMap = {};
	const multiBatchExecutionData = [];
	for (let i = 0; i < addressList.length; i++) {
		let key = addressList[i] + '_' + dateTimeList[i];
		if (userTimeMap[key] === undefined) userTimeMap[key] = [i];
		else userTimeMap[key].push(i);
	}
	for (const userTime in userTimeMap) {
		const batchIdx = userTimeMap[userTime]
		const timestamp = parseInt(userTime.split('_').pop());
		const targetUser = batchInfo[batchIdx[0]].targetUser;
		const batchObj = JSON.parse(JSON.stringify(multiExecutionData));
		delete batchObj.batchInfo;
		batchObj.targetUser = targetUser;
		batchObj.timestamp = timestamp;
		batchObj.scheduleId = undefined;
		batchObj.batchInfo = [];
		inputs = {
			"timestamp": timestamp.toString(),
			"executeon": multiExecutionData.browserType,
			"executemode": multiExecutionData.exectionMode,
			"targetaddress": targetUser,
			"userid": userInfo.userid,
			"scenarios": [],
			"testsuiteIds": [],
			"query": "insertscheduledata"
		};
		for (let i = 0; i < batchIdx.length; i++) {
			let suite = batchInfo[batchIdx[i]];
			inputs.testsuiteIds.push(suite.testsuiteId);
			inputs.scenarios.push(suite.suiteDetails);
			delete suite.targetUser;
			delete suite.date;
			delete suite.time;
			batchObj.batchInfo.push(suite);
		}
		const insResult = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
		if (insResult == "fail") return res.send("fail");
		else batchObj.scheduleId = insResult.id;
		multiBatchExecutionData.push(batchObj);
	}
	/** Add if else for smart schedule above this **/
	const schResult = await scheduleTestSuite(multiBatchExecutionData);
	return res.send(schResult);
};

/** Function responsible for scheduling Jobs. Returns: success/few/fail */
const scheduleTestSuite = async (multiBatchExecutionData) => {
	const fnName = "scheduleTestSuite";
	logger.info("Inside " + fnName + " function");
	const userInfoMap = {};
	const execIdsMap = {};
	var schedFlag = "success";
	var inputs = {};

	const userList = multiBatchExecutionData.map(u => u.targetUser);
	for (const user of userList) {
		if (!userInfoMap[user]) {
			inputs = { "username": user };
			const profile = await utils.fetchData(inputs, "login/loadUser_Nineteen68", fnName);
			if (profile == "fail" || profile == null) return "fail";
			userInfoMap[user] = {"userid": profile._id, "username": profile.name, "role": profile.defaultrole};
		}
	}

	for (const batchExecutionData of multiBatchExecutionData) {
		let execIds = {"batchid": "generate", "execid": {}};
		const userInfo = userInfoMap[batchExecutionData.targetUser];
		const scheduleTime = batchExecutionData.timestamp;
		const scheduleId = batchExecutionData.scheduleId;
		const smartId = batchExecutionData.smartScheduleId;
		if (smartId !== undefined) {
			if (execIdsMap[smartId] === undefined) execIdsMap[smartId] = execIds;
			else execIds = execIdsMap[smartId];
		}
		try {
			const scheduledjob = schedule.scheduleJob(scheduleId, scheduleTime, async function () {
				let result;
				try {
					result = await executionFunction(batchExecutionData, execIds, userInfo, "SCHEDULE");
				} catch (ex) {
					result = "fail";
					logger.error("Error in " + fnName + " service. Error: %s", ex)
				}
				result = (result == "success")? "Completed" : result;
				let schedStatus = result;
				if (["Completed", "Terminate", "Skipped", "fail"].indexOf(result) == -1) {
					let msg = "This scenario was skipped ";
					if ([SOCK_NA, SOCK_NORM, "NotApproved", "NoTask", "Modified"].indexOf(result) > -1) {
						if (result == SOCK_NA) msg += "due to unavailability of ICE";
						else if (result == SOCK_NORM) msg += "due to unavailability of ICE in schedule mode";
						else if (result == "Skipped") msg = "due to conflicting schedules";
						else if (result == "NotApproved") msg += "because all the dependent tasks (design, scrape) needs to be approved before execution";
						else if (result == "NoTask") msg = "because task does not exist for child node";
						else if (result == "Modified") msg = "because task has been modified, Please approve the task";
						schedStatus = result = "Skipped";
					} else {
						schedStatus = "Failed";
						msg = "Scenario execution failed due to an error encountered during execution";
					}
					const tsuIds = batchExecutionData.batchInfo.map(u => u.testsuiteId);
					const currExecIds = await generateExecutionIds(execIds, tsuIds, userInfo.userid);
					if (currExecIds != "fail") {
						const executionIds = tsuIds.map(i => currExecIds.execids[i]);
						const batchObj = {
							"executionIds": executionIds,
							"suitedetails": batchExecutionData.batchInfo.map(t => ({"scenarioIds": t.suiteDetails.map(s => s.scenarioId)}))
						};
						await updateSkippedExecutionStatus(batchObj, userInfo, result, msg);
					}
				}
				await updateScheduleStatus(scheduleId, schedStatus, execIds.batchid);
			});
			scheduleJobMap[scheduleId] = scheduledjob;
		} catch (ex) {
			logger.error("Exception in the function executeScheduling from scheduleTestSuite: reshedule: %s", ex);
			schedFlag = "few";
			await updateScheduleStatus(scheduleId, "Failed");
		}
	}
	return schedFlag;
}

/** Update schedule status of current scheduled job and insert report for the skipped scenarios.
Possible status options are: "Skipped", "Terminate", "Completed", "Inprogress", "Failed", "Missed", "cancelled", "scheduled" */
const updateScheduleStatus = async (scheduleid, status, batchid) => {
	const fnName = "updateScheduleStatus";
	logger.info("Inside " + fnName + " function");
	var inputs = {};
	inputs = {
		"schedulestatus": status,
		"scheduleid": scheduleid,
		"query": "updatescheduledstatus"
	};
	if (batchid) inputs.batchid = batchid;
	const result2 = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
	return result2;
};

/** This service fetches all the schedule jobs */
exports.getScheduledDetails_ICE = async (req, res) => {
	logger.info("Inside UI service getScheduledDetails_ICE");
	const inputs = { "query": "getallscheduledata" };
	const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", "getScheduledDetails_ICE");
	return res.send(result);
}

/** This service cancels the specified scheduled job */
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
	if (scheduleJobMap[scheduleid] && scheduleJobMap[scheduleid].cancel) scheduleJobMap[scheduleid].cancel();
	const result2 = await updateScheduleStatus(scheduleid, "cancelled");
	return res.send(result2);
};

/** This service reschedules the schedule jobs after a server restart */
exports.reScheduleTestsuite = async () => {
	const fnName = "reScheduleTestsuite";
	logger.info("Inside UI service " + fnName);
	var inputs = {};
	try {
		// Mark inprogress schedules as failed since server restarted
		inputs = {
			"query": "getscheduledata",
			"status": "Inprogress"
		};
		const eipResult = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
		if (eipResult != "fail") {
			for (var i = 0; i < eipResult.length; i++) {
				const eipSchd = eipResult[i];
				await updateScheduleStatus(eipSchd._id, "Failed");
			}
		}

		// Reschedule pending schedules since server restarted
		inputs = {
			"query": "getscheduledata",
			"status": "scheduled"
		};
		const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
		if (result == "fail") return logger.error("Status from the function "+fnName+": Jobs are not rescheduled");
		const multiBatchExecutionData = [];
		for (var i = 0; i < result.length; i++) {
			const schd = result[i];
			const scheduleTime = new Date(result[i].scheduledon);
			if (scheduleTime < new Date()) {
				await updateScheduleStatus(schd._id, "Missed");
			} else {
				// Create entire multiBatchExecutionData object;
				const tsuIds = schd.testsuiteids;
				const batchObj = {
					"exectionMode": schd.executemode,
					"browserType": schd.executeon,
					"qccredentials": { "qcurl": "", "qcusername": "", "qcpassword": "" },
					"targetUser": schd.target,
					"timestamp": scheduleTime.valueOf(),
					"scheduleId": schd._id,
					"batchInfo": []
				};
				inputs = {
					"query": "gettestsuiteproject",
					"testsuiteids": tsuIds
				};
				const details = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
				if (details == "fail") {
					await updateScheduleStatus(schd._id, "Failed");
					continue;
				}
				const prjObj = details.project;
				for (var j = 0; j < tsuIds.length; j++) {
					const tsuObj = details.suitemap[tsuIds[j]];
					const suiteObj = {
						"testsuiteName": tsuObj.name,
						"testsuiteId": tsuObj._id,
						"versionNumber": tsuObj.versionnumber,
						"appType": prjObj.type,
						"domainName": prjObj.domain,
						"projectName": prjObj.name,
						"projectId": prjObj._id,
						"releaseId": prjObj.releaseid,
						"cycleName": prjObj.cyclename,
						"cycleId": prjObj.cycleid,
						"suiteDetails": schd.scenariodetails[j]
					};
					batchObj.batchInfo.push(suiteObj);
				}
				multiBatchExecutionData.push(batchObj);
			}
		}
		const status = await scheduleTestSuite(multiBatchExecutionData);
		if (status == "fail") logger.error("Status from the function "+fnName+": Jobs are not rescheduled");
		else if (status == "few") logger.warn("Status from the function "+fnName+": All except few jobs are rescheduled");
		else logger.info("Status from the function "+fnName+": Jobs successfully rescheduled");
	} catch (ex) {
		logger.error("Exception in the function " + fnName + ": %s", ex);
	}
};
