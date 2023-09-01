var logger = require('../../logger');
var utils = require('../lib/utils');
var smartPartitions = require('../lib/smartPartitions')
var scheduler = require('../lib/execution/scheduler')

var queue = require('../lib/execution/executionQueue')
var cache = require('../lib/cache').getClient(2);
if (process.env.REPORT_SIZE_LIMIT) require('follow-redirects').maxBodyLength = parseInt(process.env.REPORT_SIZE_LIMIT) * 1024 * 1024;
const constants = require('../lib/execution/executionConstants');
const { default: async } = require('async');
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
			"batchname": testsuite.batchname,
			"testsuiteid": testsuite.testsuiteid,
			"versionnumber": suite.versionnumber,
			"accessibilityParameters": testsuite.accessibilityParameters
		};
		responsedata[moduleId] = finalSuite;
	}
	if (fromFlg == "scheduling") {
		const ice_status = await getICEList(req.body.readTestSuite[0].projectidts,req.headers.host);
		const ice_list = Object.keys(ice_status);
		logger.debug("IP\'s connected : %s", ice_list.join());
		const schedulingDetails = {
			"connectedICE": ice_status["ice_list"],
			"connectedICE_status": ice_status,
			"testSuiteDetails": responsedata
		};
		responsedata = schedulingDetails
	}
	if(req.body.key) return responsedata;
	res.send(responsedata);
};

exports.getICE_list = async (req,res) => {
	projectid = req.body.projectid;
	const ice_status = await getICEList(projectid,req.session.userid,req.headers.host);
	if(!ice_status || !ice_status['ice_list']){
		res.send("fail");
	}
	res.send(ice_status)
}

async function getICEList (projectids,userid,host){
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
		ice_status = await cache.gethmap(host);
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
				result.unallocatedICE[id]["status"] = JSON.parse(ice_status[ice_name])["status"];
				result.unallocatedICE[id]["mode"] = JSON.parse(ice_status[ice_name])["mode"];
				result.unallocatedICE[id]["connected"] = JSON.parse(ice_status[ice_name])["connected"];
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
			"accessibilityParameters": testsuite.accessibilityParameters
		};
		const result = await utils.fetchData(inputs, "suite/updateTestSuite_ICE", "updateTestSuite_ICE")
		if (result == "fail") overallstatusflag = "fail";
	}
	return res.send(overallstatusflag);
};


/** This service executes the testsuite(s) for request from Avo Assure */
exports.ExecuteTestSuite_ICE = async (req, res) => {
	const fnName = "ExecuteTestSuite_ICE"
	logger.info("Inside UI service: ExecuteTestSuite_ICE");
	const batchExecutionData = req.body.executionData;
	if(batchExecutionData.executionEnv == 'saucelabs') {
		batchExecutionData.sauce_username = batchExecutionData.saucelabDetails.SaucelabsUsername;
		batchExecutionData.sauce_access_key = batchExecutionData.saucelabDetails.Saucelabskey;
		batchExecutionData.remote_url = batchExecutionData.saucelabDetails.SaucelabsURL;
		delete batchExecutionData.saucelabDetails;
	}
	if(batchExecutionData['configurekey'] && req.query == 'fetchingTestSuiteIds') {
		let index = -1;
		for (let testSuiteData of batchExecutionData.batchInfo){
			index++;
			const body = {
				'key': batchExecutionData['configurekey'],
				'fromFlag': 'execution',
				'param': 'readTestSuite_ICE',
				'readTestSuite': [{
						'assignedTestScenarioIds': "",
						'assignedTime': "",
						'cycleid': testSuiteData['cycleId'],
						'projectidts':testSuiteData['projectId'],
						'releaseid': testSuiteData['releaseId'],
						'subTaskId': "",
						'testsuiteid': testSuiteData['testsuiteId'],
						'testsuitename':testSuiteData['testsuiteName'],
						'versionnumber': testSuiteData['versionnumber'],
					}]
			}
			const session = req.session;
			const response = await this.readTestSuite_ICE({body,session});
			const mindmapid = batchExecutionData['batchInfo'][index]['testsuiteId'];
			batchExecutionData['batchInfo'][index]['testsuiteId'] = response[mindmapid].testsuiteid;
		}
		return {
			'executionData': batchExecutionData,
            'session':req.session,
		};
	}
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
	if(batchExecutionData['configurekey']) {
		
		return makeReq;
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
	if ('scenarioParallelExecutionId' in batchExecutionData) {
			execIds['batchid'] = batchExecutionData['scenarioParallelBatchId'];
			execIds['execid'][batchExecutionData.batchInfo[0]['testsuiteId']] = batchExecutionData['scenarioParallelExecutionId']
	}
	//add to test queue
	var result = await queue.Execution_Queue.addTestSuiteToQueue(batchExecutionData,execIds,userInfo,"ACTIVE",poolid);
	delete userInfo;
	delete profile;
	return result;
}

function clubBatches(batchInfo){
	userBatchMap = {};
	for(let index in batchInfo){
		batchInfo[index].smart = true;
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
	var userInfo = utils.getUserInfoFromHeaders(req.headers);
	if (!userInfo) {
		res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['400'])
		return res.status('400').send({ "error": "Invalid or missing user info in request headers." })
	}
	await queue.Execution_Queue.addAPITestSuiteToQueue(req, res, userInfo);
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
	const inputs = { "query": "getallscheduledata", "configKey": req.body.configKey, "configName": req.body.configName };
	const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", "getScheduledDetails_ICE");
	return res.send(result);
}

/** This service cancels the specified scheduled job */
exports.cancelScheduledJob_ICE = async (req, res) => {
	const fnName = "cancelScheduledJob_ICE";
	logger.info("Inside UI service " + fnName);
	let result = await scheduler.cancelJob(req)
	return res.send(result);
}

/** This service executes the testsuite(s) at a given recurring pattern */
exports.testSuitesSchedulerRecurring_ICE = async (req, res) => {
	logger.info("Inside UI service testSuitesSchedulerRecurring_ICE");
	const fnName = "testSuitesSchedulerRecurring_ICE";
	try{
			var result = await scheduler.scheduleRecurringTestSuite(req.session, req.body);
			return res.send(result);
		
	}catch(e){
		logger.error("Exception in the service testSuitesSchedulerRecurring_ICE");
		logger.debug("Exception occurred in testSuitesSchedulerRecurring_ICE: %s",e)
		return res.status('500').send(result);
	}
};
exports.execAutomation = async(req,res) => {
	let result = await queue.Execution_Queue.execAutomation(req, res);
	if(req.body.isExecuteNow) return result;
	return res.send(result);
}

exports.getAgentTask = async(req,res) => {
	let result = await queue.Execution_Queue.getAgentTask(req, res);
	return res.send(result);
}

exports.getExecScenario = async(req,res) => {
	let result = await queue.Execution_Queue.getExecScenario(req, res);
	return res.send(result);
}
exports.setExecStatus = async(req,res) => {
	let result = await queue.Execution_Queue.setExecStatus(req, res);
	return res.send(result);
}

exports.getQueueState = async(req,res) => {
	let result = await queue.Execution_Queue.getQueueState(req, res);
	return res.send(result);
}

exports.deleteExecutionListId = async(req,res) => {
	let result = await queue.Execution_Queue.deleteExecutionListId(req, res);
	return res.send(result);
}

// TODO:
exports.getScheduledDetailsOnDate_ICE = async (req, res) => {
	logger.info("Inside UI service getScheduledDetailsOnDate_ICE");
	let scheduledDate = req.body.scheduledDate;
	let dateString = scheduledDate.split(' ');
    let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[2]) / 3;
	let timeValue = dateString[4];
    let timestamp = + new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[1]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));
	const inputs = { "query": "getallscheduledataondate", "scheduledDate": timestamp, "configKey": req.body.configKey, "configName": req.body.configName };
	const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", "getScheduledDetails_ICE");
	return res.send(result);
}

exports.getScheduledCount = async(req, res) => {
	logger.info("Inside UI service getScheduledCount");

	const inputs = {
		"configKey": req.body.configKey
	};
	const result = await utils.fetchData(inputs, "suite/getScheduledCount", "getScheduledCount");
	return res.send(result);
}
