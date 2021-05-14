var uuid = require('uuid-random');
var schedule = require('node-schedule');
var Client = require("node-rest-client").Client;
var client = new Client();
var myserver = require('../lib/socket');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');
const accessibility_testing = require("./accessibilityTesting")
const notifications = require('../notifications');
var smartPartitions = require('../lib/smartPartitions')
var scheduler = require('../lib/execution/scheduler')

var queue = require('../lib/execution/executionQueue')
var cache = require('../lib/cache').getClient(2);
if (process.env.REPORT_SIZE_LIMIT) require('follow-redirects').maxBodyLength = parseInt(process.env.REPORT_SIZE_LIMIT) * 1024 * 1024;
const scheduleJobMap = {};
const SOCK_NORM = "normalModeOn";
const SOCK_SCHD = "scheduleModeOn";
const SOCK_NA = "unavailableLocalServer";
const SOCK_NORM_MSG = "ICE is connected in Non-Scheduling mode";
const SOCK_SCHD_MSG = "ICE is connected in Scheduling mode";
const SOCK_NA_MSG = "ICE is not Available";
const DO_NOT_PROCESS = "do_not_process_response";
const EMPTYUSER = process.env.nulluser;
const EMPTYPOOL = process.env.nullpool;
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
			var batchInfo =JSON.parse(JSON.stringify(batchExecutionData.batchInfo));
			batchInfo[0]["iceList"] = targetUser;
			//Get partitions
			const partitionResult = await smartSchedule(batchInfo, type, "Now", batchExecutionData.browserType.length)
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
		userInfo.targetUser = EMPTYUSER
		var profile = {userid:EMPTYUSER,role:"N/A",username:EMPTYUSER}
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
	await queue.Execution_Queue.addAPITestSuiteToQueue(req,res);
};

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
		return res.send(result);
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
	if(schedHost != EMPTYUSER){
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

