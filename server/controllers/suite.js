var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');
var smartPartitions = require('../lib/smartPartitions')
var scheduler = require('../lib/execution/scheduler')

var queue = require('../lib/execution/executionQueue')
var cache = require('../lib/cache').getClient(2);
if (process.env.REPORT_SIZE_LIMIT) require('follow-redirects').maxBodyLength = parseInt(process.env.REPORT_SIZE_LIMIT) * 1024 * 1024;
const constants = require('../lib/execution/executionConstants');
const scheduleJobMap = {};
/** This service reads the testsuite and scenario information for the testsuites */
exports.readTestSuite_ICE = async (req, res) => {
	const fnName = "readTestSuite_ICE";
	logger.info("Inside UI service " + fnName);
	const batchData = req.body.readTestSuite;
	const fromFlg = req.body.fromFlag;
	const userInfo = { "userid": req.session.userid, "role": req.session.activeRoleId };
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
			"apptypes": testscenarioDetails.apptypes,
			"testsuitename": testsuite.name,
			"moduleid": moduleId,
			"testsuiteid": testsuite.testsuiteid,
			"versionnumber": suite.versionnumber
		};
		responsedata[moduleId] = finalSuite;
	}
	if (fromFlg == "scheduling") {
		const ice_status = await getICEList(req.body.readTestSuite[0].projectidts);
		const ice_list = Object.keys(ice_status);
		logger.debug("IP\'s connected : %s", ice_list.join());
		const schedulingDetails = {
			"connectedICE": ice_status["ice_list"],
			"connectedICE_status": ice_status,
			"testSuiteDetails": responsedata
		};
		responsedata = schedulingDetails
	}
	res.send(responsedata);
};

exports.getICE_list = async (req,res) => {
	projectid = req.body.projectid;
	const ice_status = await getICEList(projectid,req.session.userid);
	if(!ice_status || !ice_status['ice_list']){
		res.send("fail");
	}
	res.send(ice_status)
}

async function getICEList (projectids,userid){
	const fnName = "getICEList";
	var ice_list = [];
	var ice_status = {}
	var unallocatedICE = {}
	var result = {ice_ids:{}}
	result["ice_list"] = []
	result["unallocatedICE"] = {}
	try {
		const pool_req =  {
			"projectids":[projectids],
			"poolid": ""
		}
		let pool_list = await utils.fetchData(pool_req,"admin/getPools",fnName);
		unallocatedICE = await utils.fetchData({}, "admin/getAvailable_ICE");
		ice_status = await cache.get("ICE_status");
		unallocatedICE = unallocatedICE["available_ice"];
		if(!unallocatedICE || unallocatedICE === "fail") unallocatedICE = {}
		if(!ice_status )ice_status = {}
		for(let id in unallocatedICE){
			var ice = unallocatedICE[id];
			var ice_name = ice["icename"]
			ice_list.push(ice_name);
			result.unallocatedICE[id] = {}
			if(!ice_status )ice_status = {}
			if(ice_name in ice_status){
				result.unallocatedICE[id]["icename"] = ice_name;
				result.unallocatedICE[id]["status"] = ice_status[ice_name]["status"];
				result.unallocatedICE[id]["mode"] = ice_status[ice_name]["mode"];
				result.unallocatedICE[id]["connected"] = ice_status[ice_name]["connected"];
			}else{
				result.unallocatedICE[id]["icename"] = ice_name
				result.unallocatedICE[id]["status"] = false;
				result.unallocatedICE[id]["mode"] = false;
				result.unallocatedICE[id]["connected"] = false;
			}
		}
		for(let index in pool_list){
			pool = pool_list[index];
			const ice_req = {
				poolids: [pool["_id"]]
			}
			ice_in_pool = await utils.fetchData(ice_req,"admin/getICE_pools",fnName);
			if(!ice_in_pool )ice_in_pool = {}
			for(id in ice_in_pool){
				var ice = ice_in_pool[id];
				var ice_name = ice["icename"]
				result.ice_ids[id] = {};
				result.ice_ids[id]["icename"] = ice_name
				ice_list.push(ice_name)
				if(ice_name in ice_status){
					result.ice_ids[id]["status"] = ice_status[ice_name]["status"];
					result.ice_ids[id]["mode"] = ice_status[ice_name]["mode"];
					result.ice_ids[id]["connected"] = ice_status[ice_name]["connected"];
				}else{
					result.ice_ids[id]["status"] = false;
					result.ice_ids[id]["mode"] = false;
					result.ice_ids[id]["connected"] = false;
				}
			}
			result["ice_list"] = ice_list;
		}
	}catch(e){
		logger.error("Error occurred in getICEList, Error: %s",e);
	}
	return result;
}

/** This service updates the testsuite and scenario information for the loaded testsuite */
exports.updateTestSuite_ICE = async (req, res) => {
	logger.info("Inside UI service: updateTestSuite_ICE");
	const userInfo = { "userid": req.session.userid, "username": req.session.username, "role": req.session.activeRoleId };
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
	logger.debug("ICE Socket requesting Address: %s", user);
	const sockmode = await utils.channelStatus(user);
	if (!sockmode.normal) {
		logger.error(err + SOCK_NA_MSG + ".");
		return SOCK_NA;
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
const fetchScenarioDetails = async (scenarioid, userid, integrationType) => {
	const fnName = "fetchScenarioDetails";
	const scenario = {};
	const allTestcaseSteps = [];
	const qcDetailsList = [];
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
				"userid": userid,
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
			"testcasename": allTestcaseObj[tc._id].name,
			"screenid": tc.screenid,
			"screenname":tc.screenname,
			"datatables": tc.datatables
		});
	});

	scenario.testcase = JSON.stringify(allTestcaseSteps);
	// Step 3: Get qcdetails
	scenario.qcdetails = [];
	for(var k =0; k<integrationType.length; ++k) {
		inputs = {
			"testscenarioid": scenarioid
		};
		const integ = integrationType[k];
		if (integ == 'qTest') inputs.query = "qtestdetails";
		else if (integ == 'ALM') inputs.query = "qcdetails";
		else if (integ == 'Zephyr') inputs.query = "zephyrdetails";
		if (inputs.query) {
			const qcdetails = await utils.fetchData(inputs, "qualityCenter/viewIntegrationMappedList_ICE", fnName);
			if(integ == 'ALM' && Array.isArray(qcdetails)) {
				for (let i=0; i < qcdetails.length; ++i) {
					if (qcdetails[i] != "fail") qcDetailsList.push(JSON.parse(JSON.stringify(qcdetails[i])));
				}
				if (qcDetailsList.length > 0) scenario.qcdetails.push(qcDetailsList);
			} else {
				if (qcdetails != "fail" && qcdetails.length > 0) scenario.qcdetails.push(JSON.parse(JSON.stringify(qcdetails[0])));
			}
		}
	}
	return scenario;
};

/** Function responsible for creating execution request json that will be consumed by ICE */
const prepareExecutionRequest = async (batchData, userInfo) => {
	if(!batchData.executionEnv || batchData.executionEnv === ""){
		batchData.executionEnv = "default";
	}
	const execReq = {
		"exec_mode": batchData.exectionMode,
		"exec_env" : batchData.executionEnv,
		"apptype": batchData.batchInfo[0].appType,
		"integration": batchData.integration,
		"batchId": "",
		"executionIds": [],
		"testsuiteIds": [],
		"suitedetails": [],
		"reportType": "functionalTesting"
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
			"scenarioIds": [],
			"accessibilityMap":{}
		};
		const suiteDetails = suite.suiteDetails;
		for (const tsco of suiteDetails) {
			var integrationType = [];
			if(batchData.integration && batchData.integration.alm.url) {
				integrationType.push("ALM");
			} 
			if (batchData.integration && batchData.integration.qtest.url){
				integrationType.push("qTest");
			} 
			if (batchData.integration && batchData.integration.zephyr.url) {
				integrationType.push("Zephyr");
			}
			var scenario = await fetchScenarioDetails(tsco.scenarioId, userInfo.userid, integrationType);
			if (scenario == "fail") return "fail";
			scenario = Object.assign(scenario, tsco);
			suiteObj.accessibilityMap[scenario.scenarioId] = tsco.accessibilityParameters;
			suiteObj.condition.push(scenario.condition);
			suiteObj.dataparampath.push(scenario.dataparam[0]);
			suiteObj.scenarioNames.push(scenario.scenarioName);
			suiteObj.scenarioIds.push(scenario.scenarioId);
			const scenarioObj = {};
			scenarioObj[scenario.scenarioId] = scenario.testcase;
			scenarioObj.qcdetails = scenario.qcdetails;
			scenarioList.push(scenarioObj);
		}
		if (suite.scenarioTaskType == "exclusive") execReq.reportType = "accessiblityTestingOnly";
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
	const newExecIds = await utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", "generateExecutionIds");
	if (newExecIds == "fail") return "fail";
	execIds.batchid = newExecIds.batchid;
	execIds.execid = newExecIds.execids;
	return newExecIds;
};

/** Function responsible for inserting reports */
const insertReport = async (executionid, scenarioId, browserType, userInfo, reportData) => {
	const inputs = {
		"executionid": executionid,
		"testscenarioid": scenarioId,
		"browser": browserType,
		"status": reportData.overallstatus[0].overallstatus,
		"report": JSON.stringify(reportData),
		"modifiedby": userInfo.invokinguser,
		"modifiedbyrole": userInfo.invokinguserrole,
		"query": "insertreportquery"
	};
	const result = utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", "insertReport");
	return result;
};

/** Function responsible for updating execution status/starttime/endtime before/after execution */
const updateExecutionStatus = async (execIds, data) => {
	const fnName = "updateExecutionStatus";
	logger.info("Calling function " + fnName + " from executionFunction");
	const inputs = {
		"query": "updateintoexecution",
		"executionids": execIds,
		...data
	};
	const response = await utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", fnName);
	return response;
};

/** Function responsible for updating execution status and insert reports for the skipped scenarios. */
const updateSkippedExecutionStatus = async (batchData, userInfo, status, msg) => {
	const dt = new Date();
	const currtime = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds() + '.' + dt.getMilliseconds();
	//const currtime = new Date(dt.getTime()-dt.getTimezoneOffset()*60000).toISOString().replace('T',' ').replace('Z','');
	const reportData = {
		'rows': [{ 'id': '1', 'Keyword': '', 'parentId': '', 'status': status, 'Step ': '', 'Comments': null, 'StepDescription': msg, "screenshot_path": null, "EllapsedTime": "0:00:00.000000", "Remark": "", "testcase_details": "" }],
		'overallstatus': [{ 'EllapsedTime': '0:00:00.000000', 'EndTime': currtime, 'browserVersion': 'NA', 'StartTime': currtime, 'overallstatus': status, 'browserType': 'NA' }],
		'commentsLength': []
	}
	const executionIds = batchData.executionIds;
	for (let i = 0; i < batchData.suitedetails.length; i++) {
		const suite = batchData.suitedetails[i];
		if (!suite.reportData) suite.reportData = [];
		for (let idx = 0; idx < suite.scenarioIds.length; idx++) {
			const scid = suite.scenarioIds[idx];
			const scenarioname = suite.scenarioNames[idx];
			const reportid = await insertReport(executionIds[i], scid, "N/A", userInfo, reportData);
			const reportItem = {reportid, scenarioname, status, terminated: 'N/A'};
			if (reportid == "fail") {
				logger.error("Failed to insert report data for scenario (id: "+scid+") with executionid "+executionIds[i]);
				reportItem[reportid] = '';
			} else {
				logger.info("Successfully inserted report data");
				logger.debug("Successfully inserted report data for scenario (id: "+scid+") with executionid "+executionIds[i]);
			}
			suite.reportData.push(reportItem);
		};
		notifications.notify("report", {...suite, user: userInfo, status, suiteStatus: "fail"});
	}
	await updateExecutionStatus(executionIds, {status: "fail"});
};

/** Function responsible for sending execution request to ICE and reciving reports and status */
const executionRequestToICE = async (execReq, execType, userInfo) => {
	const fnName = "executionRequestToICE";
	logger.info("Inside " + fnName + " function");
	const username = userInfo.username;
	const invokinguser = userInfo.invokingusername;
	const icename = userInfo.icename;
	const channel = "normal";
	var reportType = "accessiblityTestingOnly";
	logger.info("Sending request to ICE for executeTestSuite");
	const dataToIce = {"emitAction" : "executeTestSuite","username" : icename, "executionRequest": execReq};
	redisServer.redisPubICE.publish('ICE1_' + channel + '_' + icename, JSON.stringify(dataToIce));

	const exePromise = async (resSent) => (new Promise((rsv, rej) => {
		var d2R = {};
		async function executeTestSuite_listener(channel, message) {
			const data = JSON.parse(message);
			const event = data.onAction;
			const resultData = data.value;
			const batchId = (resultData)? resultData.batchId : "";
			const executionid = (resultData)? resultData.executionId : "";
			if (!(icename == data.username && (event == SOCK_NA || (event != SOCK_NA && execReq.batchId == batchId)))) return false;
			const status = resultData.status;
			if (event == SOCK_NA) {
				redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
				logger.error("Error occurred in " + fnName + ": Socket Disconnected");
				if (resSent && notifySocMap[invokinguser]) {
					notifySocMap[invokinguser].emit("ICEnotAvailable");
					rsv(DO_NOT_PROCESS);
				} else rsv(SOCK_NA);
			} else if (event == "return_status_executeTestSuite") {
				if (status === "success") {
					if (execType == "SCHEDULE") await updateScheduleStatus(execReq.scheduleId, "Inprogress", batchId);
				} else if (status === "skipped") {
					const execStatus = "Skipped";
					var errMsg = (execType == "SCHEDULE") ? "due to conflicting schedules" :
						"because another execution is running in ICE";
					redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
					logger.error("Error occurred in " + fnName + ": Execution is skipped " + errMsg);
					errMsg = "This scenario was skipped " + errMsg;
					let report_result = {};
					report_result["status"] = execStatus
					report_result["testSuiteDetails"] = execReq["suitedetails"]
					await updateSkippedExecutionStatus(execReq, userInfo, execStatus, errMsg);
					if (resSent && notifySocMap[invokinguser] && notifySocMap[invokinguser].connected) {
						notifySocMap[invokinguser].emit(execStatus);
						rsv(DO_NOT_PROCESS);
					}else if(resSent){
						queue.Execution_Queue.add_pending_notification("",report_result,username);
						rsv(DO_NOT_PROCESS);
					} else rsv(execStatus);
				} else if (status === "started") {
					await updateExecutionStatus([executionid], {starttime: resultData.startTime});
				} else if (status === "finished") {
					const testsuiteIndex = execReq.testsuiteIds.indexOf(resultData.testsuiteId);
					const testsuite = execReq.suitedetails[testsuiteIndex];
					const exeStatus = resultData.executionStatus? "pass":"fail";
					await updateExecutionStatus([executionid], {endtime: resultData.endTime, status: exeStatus});
					if (reportType != "accessiblityTestingOnly")
						notifications.notify("report", {...testsuite, user: userInfo, status, suiteStatus: exeStatus});
				}
			} else if (event == "result_executeTestSuite") {
				if (!status) { // This block is for report data
					if("accessibility_reports" in resultData){	
						const accessibility_reports = resultData.accessibility_reports
						accessibility_testing.saveAccessibilityReports(accessibility_reports);
					}
					if (resultData.report_type != "accessiblityTestingOnly") reportType = "functionalTesting";
					const scenarioid = resultData.scenarioId;
					const testsuiteid = resultData.testsuiteId;
					const testsuiteIndex = execReq.testsuiteIds.indexOf(testsuiteid);
					const testsuite = execReq.suitedetails[testsuiteIndex];
					const scenarioIndex = testsuite.scenarioIds.indexOf(scenarioid);
					const scenarioname = testsuite.scenarioNames[scenarioIndex];
					if (!testsuite.reportData) testsuite.reportData = [];//Array.from({length: testsuite.scenarioIds.length}, () => {});
					try {
						const reportData = JSON.parse(JSON.stringify(resultData.reportData).replace(/'/g, "''"));
						if (execType == "API") {
							if (d2R[testsuiteid] === undefined) d2R[testsuiteid] = {"testsuiteName": testsuite.testsuitename, "testsuiteId": testsuiteid, "scenarios": {}};
							if (d2R[testsuiteid].scenarios[scenarioid] === undefined) d2R[testsuiteid].scenarios[scenarioid] = [];
							d2R[testsuiteid].scenarios[scenarioid].push({ scenarioname, scenarioid, "overallstatus": "Not Executed" });
						}
						if (reportData.overallstatus.length !== 0) {
							const appTypes = ["OEBS", "MobileApp", "System", "Webservice", "Mainframe", "SAP", "Desktop"];
							const browserType = (appTypes.indexOf(execReq.apptype) > -1) ? execReq.apptype : reportData.overallstatus[0].browserType;
							reportData.overallstatus[0].browserType = browserType;
							if (execType == "API") {
								const cidx = d2R[testsuiteid].scenarios[scenarioid].length - 1;
								d2R[testsuiteid].scenarios[scenarioid][cidx] = {...d2R[testsuiteid].scenarios[scenarioid][cidx], ...reportData.overallstatus[0]};
							}
							const reportStatus = reportData.overallstatus[0].overallstatus;
							const reportid = await insertReport(executionid, scenarioid, browserType, userInfo, reportData);
							const reportItem =  {reportid, scenarioname, status: reportStatus, terminated: reportData.overallstatus[0].terminatedBy};
							if (reportid == "fail") {
								logger.error("Failed to insert report data for scenario (id: "+scenarioid+") with executionid "+executionid);
								reportItem[reportid] = '';
							} else {
								logger.info("Successfully inserted report data");
								logger.debug("Successfully inserted report data for scenario (id: "+scenarioid+") with executionid "+executionid);
							}
							// testsuite.reportData[scenarioIndex] = reportItem;
							testsuite.reportData.push(reportItem);
						}
					} catch (ex) {
						logger.error("Exception in the function " + fnName + ": insertreportquery: %s", ex);
						if(reportType != "accessiblityTestingOnly") notifications.notify("report", {...testsuite, user: userInfo, status, suiteStatus: "fail"});
						await updateExecutionStatus([executionid], {status: "fail"});
					}
				} else { // This block will trigger when resultData.status has "success or "Terminate"
					redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
					try {
						let result = status;
						let report_result = {};
						report_result["status"] = status
						if (reportType == 'accessiblityTestingOnly' && status == 'success') report_result["status"] = 'accessibilityTestingSuccess';
						if (reportType == 'accessiblityTestingOnly' && status == 'Terminate') report_result["status"] = 'accessibilityTestingTerminate';
						report_result["testSuiteDetails"] = execReq["suitedetails"]
						if (resultData.userTerminated) result = "UserTerminate";
						if (execType == "API") result = [d2R, status];
						if (resSent && notifySocMap[invokinguser] && notifySocMap[invokinguser].connected) { // This block is only for active mode
							notifySocMap[invokinguser].emit("result_ExecutionDataInfo", report_result);
							rsv(DO_NOT_PROCESS);
						} else if(resSent){
							queue.Execution_Queue.add_pending_notification("",report_result,username);
							rsv(DO_NOT_PROCESS);
						}else {
							rsv(result);
						}
					} catch (ex) {
						logger.error("Exception while returning execution status from function " + fnName + ": %s", ex);
						rej("fail");
					}
				}
			}
		}
		redisServer.redisSubServer.on("message", executeTestSuite_listener);
	}));

	const notifySocMap = myserver.socketMapNotify; 
	if (execType == "ACTIVE" && notifySocMap && notifySocMap[invokinguser]) {
		exePromise(true);
		return "begin";
	} else return await exePromise(false);
};

/** Function responsible for Orchestrating execution flow. Invokes series of functions to achive the results */
module.exports.executionFunction = async (batchExecutionData, execIds, userInfo, execType) => {
	//const icename = (execType=='API')? userInfo.icename : myserver.allSocketsICEUser[userInfo.username];
	var icename = userInfo.icename;
	//userInfo.icename=icename;
	redisServer.redisSubServer.subscribe('ICE2_' + icename);
	//var iceStatus = await checkForICEstatus(icename, execType);
	//if (iceStatus != null) return iceStatus;
	const taskApproval = await utils.approvalStatusCheck(batchExecutionData.batchInfo);
	if (taskApproval.res !== "pass") return taskApproval.res;
	/*const countStatus =*/ await counterUpdater(batchExecutionData.batchInfo.length, userInfo.invokinguser);
	// if (countStatus == "fail") return "fail";
	const executionRequest = await prepareExecutionRequest(batchExecutionData, userInfo);
	if (executionRequest == "fail") return "fail";
	const currExecIds = await generateExecutionIds(execIds, executionRequest.testsuiteIds, userInfo.invokinguser);
	if (currExecIds == "fail") return "fail";
	executionRequest.batchId = currExecIds.batchid;
	executionRequest.executionIds = executionRequest.testsuiteIds.map(i => currExecIds.execids[i]);
	if(execType == "SCHEDULE") executionRequest.scheduleId = batchExecutionData.scheduleId;
	const result = await executionRequestToICE(executionRequest, execType, userInfo);
	return result;
};

/** This service executes the testsuite(s) for request from Avo Assure */
exports.ExecuteTestSuite_ICE = async (req, res) => {
	const fnName = "ExecuteTestSuite_ICE"
	logger.info("Inside UI service: ExecuteTestSuite_ICE");
	const batchExecutionData = req.body.executionData;
	var targetUser = batchExecutionData.targetUser;
	const type = batchExecutionData.type;
	const poolid = batchExecutionData.poolid;
	var result = {status:"fail",error:"Failed to execute",message:""}
	var userInfo = {"invokinguser":req.session.userid,"invokingusername":req.session.username,"invokinguserrole":req.session.activeRoleId,"userid": "", "username": "", "role": ""}
	//Check if execution is normal or smart
	if(type.toLowerCase().includes('smart')){
		//Check if users are present in target user
		if(targetUser && Array.isArray(targetUser) && targetUser.length > 0){
			var batchInfo = JSON.parse(JSON.stringify(batchExecutionData.batchInfo));
			batchInfo[0]["iceList"] = targetUser;
			//Get partitions
			const partitionResult = await smartPartitions.smartSchedule(batchInfo, type, "Now", batchExecutionData.browserType.length)
			if (partitionResult["status"] == "fail") {
				result['error'] = "Smart execution Failed";
			}else{
				try{
					var batchInfo = partitionResult["batchInfo"];
					var userBatchMap = clubBatches(batchInfo);
					//Make batch request for each partition
					for(let targetUser in userBatchMap){
						let user = JSON.parse(JSON.stringify(userInfo));
						user.icename = targetUser;
						var executionData = JSON.parse(JSON.stringify(batchExecutionData));
						executionData.batchInfo = userBatchMap[targetUser]
						executionData.targetUser = targetUser;
						//Get profile data and add to queue
						var makeReq = await makeRequestAndAddToQueue(executionData, targetUser, user, poolid);
						result["message"] = makeReq["message"] + "\n" + result["message"];
					}
					result["status"] = "Success";
				}catch (e){
					logger.error("Exception in the function ExecuteTestSuite_ICE: %s", e);
					result["Error"] = "Smart Execution Failed"
				}
			}
		}else{
			result["error"] = "Please select available Target ICE";
		}
	}else{
		userInfo.icename = targetUser;
		if (Array.isArray(targetUser)) targetUser = "";
		var makeReq = await makeRequestAndAddToQueue(batchExecutionData,targetUser,userInfo,poolid);
		Object.assign(result,makeReq);
	}
	return res.send(result);
};

async function makeRequestAndAddToQueue(batchExecutionData, targetUser, userInfo, poolid, invoker) {
	const fnName = "makeRequestAndAddToQueue";
	//get profile data if target user was provided
	if(targetUser && targetUser != ""){
		let inputs = { "icename": targetUser };
		var profile = await utils.fetchData(inputs, "login/fetchICEUser", fnName);
		profile = {userid:profile.userid,username:profile.name,role:profile.role};
	}else{
		userInfo.targetUser = constants.EMPTYUSER
		var profile = {userid:constants.EMPTYUSER,role:"N/A",username:constants.EMPTYUSER}
	}
	Object.assign(userInfo,profile);
	const execIds = { "batchid": "generate", "execid": {} };
	//add to test queue
	var result = await queue.Execution_Queue.addTestSuiteToQueue(batchExecutionData,execIds,userInfo,"ACTIVE",poolid);
	delete userInfo;
	delete profile;
	return result;
}

function clubBatches(batchInfo){
	userBatchMap = {};
	for(let index in batchInfo){
		let targetUser = batchInfo[index].targetUser;
		if(targetUser && targetUser in userBatchMap){
			userBatchMap[targetUser].push(batchInfo[index])
		}else if(targetUser && !(targetUser in userBatchMap)){
			userBatchMap[targetUser] = [batchInfo[index]]
		}else{
			throw "Target User not found";
		}
	}
	return userBatchMap;
}

/** This service executes the testsuite(s) for request from API */
exports.ExecuteTestSuite_ICE_API = async (req, res) => {
	// Several client apps do not send TCP Keep-Alive. Hence this is handled in applicaton side.
	req && req.socket && req.socket.setKeepAlive && req.socket.setKeepAlive(true, +(process.env.KEEP_ALIVE || "30000"));
	logger.info("Inside UI service: ExecuteTestSuite_ICE_API");
	var userInfo = getUserInfoFromHeaders(req.headers);
	if (!userInfo) {
		res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['400'])
		return res.status('400').send({ "error": "Invalid or missing user info in request headers." })
	}
	await queue.Execution_Queue.addAPITestSuiteToQueue(req, res, userInfo);
};

const getUserInfoFromHeaders = (headers) => {
	if (headers['x-token_hash'] && headers['x-token_name'] && headers['x-icename']) {
		return { 'tokenhash': headers['x-token_hash'], "tokenname": headers['x-token_name'], 'icename': headers['x-icename'], 'poolname': ''}
	}
	return false;
}
/** this service imports the data from git repo and invoke execution */
exports.importFromGit_ICE = async (req, res) => {
	const actionName = 'importFromGit'
	logger.info("Inside API importFromGit_ICE");
	try {
		// Several client apps do not send TCP Keep-Alive. Hence this is handled in applicaton side.
		req && req.socket && req.socket.setKeepAlive && req.socket.setKeepAlive(true, +(process.env.KEEP_ALIVE || "30000"));
		const userInfo = await utils.tokenValidation(req.body.userInfo);
		if(userInfo['inputs']['tokenValidation'] =='passed'){
			const data = req.body;
			const gitVersionName = data.gitVersionName;
			const gitbranch = data.gitbranch;
			var folderPath = data.folderPath;
			if(!folderPath.startsWith("avoassuretest_artifacts")){
				folderPath="avoassuretest_artifacts/"+folderPath
			}
			const inputs = {
				"gitbranch":gitbranch,
				"gitVersionName":gitVersionName,
				"folderPath":folderPath.toLowerCase(),
				"createdBy":userInfo.userid,
				"source":data.source,
				"exectionMode":data.exectionMode,
				"executionEnv":data.executionEnv,
				"browserType":data.browserType,
				"integration":data.integration
			};
			const module_data = await utils.fetchData(inputs, "git/importFromGit_ICE", actionName);
			if(module_data=="fail") return res.status(500).send({"error":"Failed to import from Git."})
			if(module_data=="empty") return res.status(500).send({"error":"Module does not exists in Git. Please check your inputs!!"})
			userInfo['invokingusername'] = userInfo.username
			userInfo['invokinguser'] = userInfo.userid;
			userInfo['invokinguserrole'] = userInfo.role;
			redisServer.redisSubServer.subscribe('ICE2_' + userInfo.icename);
			const result = await executionRequestToICE(module_data, 'API', userInfo);

			executionResult=[]
			delete userInfo.inputs.error_message;
			executionResult.push(userInfo.inputs)
			var execResponse = executionResult[0]
			if (result == constants.SOCK_NA) execResponse.error_message = constants.SOCK_NA_MSG;
			else if (result == constants.SOCK_SCHD) execResponse.error_message = constants.SOCK_SCHD_MSG;
			else if (result == "NotApproved") execResponse.error_message = "All the dependent tasks (design, scrape) needs to be approved before execution";
			else if (result == "NoTask") execResponse.error_message = "Task does not exist for child node";
			else if (result == "Modified") execResponse.error_message = "Task has been modified, Please approve the task";
			else if (result == "Skipped") execResponse.error_message = "Execution is skipped because another execution is running in ICE";
			else if (result == "fail") execResponse.error_message = "Internal error occurred during execution";
			else {
				execResponse.status = result[1];
				const execResult = [];
				for (let tsuid in result[0]) {
					const tsu = result[0][tsuid];
					const scenarios = [];
					tsu.executionId = tsu['testsuiteId'];
					for (let tscid in tsu.scenarios) scenarios.push(...tsu.scenarios[tscid]);
					delete tsu.scenarios;
					tsu.suiteDetails = scenarios;
					execResult.push(tsu);
				}
				execResponse.batchInfo = execResult;
			}

			const finalResult = { "executionStatus": executionResult };
			return res.send(finalResult);
		}else if(!userInfo.icename){
			return res.send({"error":"ICE name not provided."})
		} else{
			return res.send({"error":userInfo.icename + " not connected to server!"})
		}
	} catch (ex) {
		logger.error("Exception in the service importFromGit: %s", ex);
		return res.status(500).send("fail");
	}
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
	try{
		var result = await scheduler.prepareSchedulingRequest(req.session, req.body);
		return res.send(result);
	}catch(e){
		logger.error("Exception in the service testSuitesScheduler_ICE");
		logger.debug("Exception occurred in testSuitesScheduler_ICE: %s",e)
		return res.status('500').send(result);
	}
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
	var userprofile = {}
	const fnName = "cancelScheduledJob_ICE";
	logger.info("Inside UI service " + fnName);
	const userid = req.session.userid;
	const username = req.session.username;
	const scheduleid = req.body.schDetails.scheduleid;
	const schedHost = req.body.host;
	const schedUserid = JSON.parse(req.body.schedUserid);
	let inputs = { "icename": schedHost };
	if(schedHost != constants.EMPTYUSER){
		userprofile = await utils.fetchData(inputs, "login/fetchICEUser", fnName);
		if (userprofile == "fail" || userprofile == null) return res.send("fail");
	}
	if (!(schedUserid["invokinguser"] == userid || userprofile.name == username)) {
		logger.info("Sending response 'not authorised' from " + fnName + " service");
		return res.send("not authorised");
	}
	inputs = {
		"query": "getscheduledata",
		"scheduleid": scheduleid
	};
	const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
	if (result == "fail") return res.send("fail");
	const status = result[0].status;
	if (status != "scheduled") {
		logger.info("Sending response 'inprogress' from " + fnName + " service");
		return res.send("inprogress");
	}
	if (scheduleJobMap[scheduleid] && scheduleJobMap[scheduleid].cancel) scheduleJobMap[scheduleid].cancel();
	const result2 = await scheduler.updateScheduleStatus(scheduleid, "cancelled");
	return res.send(result2);
}

