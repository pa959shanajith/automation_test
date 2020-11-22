const utils = require('../lib/utils');
const suite = require('../controllers/suite')
const redisServer = require('./redisSocketHandler');
const cache = require("./cache")
var Client = require("node-rest-client").Client;
var client = new Client();
var logger = require('../../logger');
var myserver = require('./socket');
const notifications = require('../notifications');
const SOCK_NORM = "normalModeOn";
const SOCK_SCHD = "scheduleModeOn";
const SOCK_NA = "unavailableLocalServer";
const SOCK_NORM_MSG = "ICE is connected in Non-Scheduling mode";
const SOCK_SCHD_MSG = "ICE is connected in Scheduling mode";
const SOCK_NA_MSG = "ICE is not Available";
const DO_NOT_PROCESS = "do_not_process_response";

class Execution_Queue{
    /*
        queue_list: main execution queue, it stores all the queue's corresponding to pools
        project_list: dictionary of projects as key pool as value, useful for searching purpose
        ice_list: dictionary contains ice_name as key and poolid/status/mode/connected as values, 
                  maintains the status of all ice (includes ICE which are not part of any pool but connected to ICE, poolid marked as 'orphan')
        registred_ice: dictionary to maintain ice whose callbacks have been registred
        request_ids: dictionary conatining all the requests recieved
    */
    static queue_list = {}
    static project_list = {}
    static ice_list = {}
    static registred_ice = {}
    static request_ids = {}
    static notification_dict = {}
    // executon queue initialisation
    static queue_init(){
        var _this = this
        var fnName = 'instantiateQueue'
        var inputs = {
            "projectids": [],
            "poolid": "all"
        }
        _this.queue_list, _this.project_list, _this.ice_list, _this.request_ids, _this.notification_dict = setUpPool(inputs)
        
    }

    /** 
        * @param {string} ice_name 
        * Register callback for ICE when the status of ICE changes
    */
    static register_execution_trigger_ICE(ice_name){
        //check if ice is already present in ice_list
        if(ice_name in ice_list){
            ice_list[ice_name]["connected"] = true
        }else{
            connect_ice(ice_name);
        }
        //check if callback for ICE has already been registred
        if(!(ice_name in this.registred_ice)){
            redisServer.redisSubServer.subscribe('ICE2_'+ice_name);
            redisServer.redisSubServer.on("message",triggerExecution);
            this.registred_ice[ice_name] = true;
        }   
    }
    
    static add_pending_notification(execIds, report_result, username){
        if(!(username in notification_dict)){
            notification_dict[username] = []; 
        }
        notification_dict[username].push(report_result)
        cache.set("pending_notification",notification_dict)
    }

    /** 
        * @param {} batchExecutionData 
        * @param {} execIds
        * @param {dictionary} userInfo
        * @param {String} type
        * Adds normal / scheduling test suites to queue
        * Executes normal / scheduling test suites if the target ICE is in DND mode
    */
    static addTestSuiteToQueue(batchExecutionData, execIds, userInfo,type){
        var targetICE = "";
        var projectid = "";
        var response = {}
        response['status'] = "fail";
        response["message"] = "N/A"
        response['error'] = "None"
        try{
            //check if target ICE was specified or not
            if (userInfo && userInfo.icename){
                targetICE = userInfo.icename;
            }else{
                userInfo.icename = "any"
            }
            //get project id of the test suite in the case targeICE was not specified
            if(batchExecutionData && batchExecutionData.batchInfo[0] && batchExecutionData.batchInfo[0].projectid){
                projectid = batchExecutionData.batchInfo[0].projectid;
            }
            var testSuite = {"batchExecutionData":batchExecutionData,"execIds": execIds, "userInfo": userInfo,"type":type}
            //check if target ICE is present in any pool 
            if(targetICE && targetICE in ice_list && ice_list[targetICE]["poolid"] in queue_list){
                //check if target ICE is in DND mode, if true check wether the ice owner is has invoked execution
                if(ice_list[targetICE]["mode"] && userInfo.userid === userInfo.invokingUser ){
                    if(type == "ACTIVE"){
                         executeActiveTestSuite(batchExecutionData, execIds, userInfo, type);
                    }else{
                        executeScheduleTestSuite(batchExecutionData, execIds, userInfo, type);
                    }
                        response['status'] = "pass";
                        response["message"] = "Execution Started on " + ice_name + " ICE mode: DND" 
                }
                else{
                    //get pool in which the target ICE present
                    pool = queue_list[ice_list[targetICE]["poolid"]];
                    pool["execution_list"].push(testSuite);
                    //save execution queue to redis
                    cache.set("execution_queue",queue_list);
                    //create response message
                    response['status'] = "pass";
                    var msg = " ICE status: Not Connected"
                    if(ice_list[targetICE]["connected"]){
                        msg = " ICE status: connected"
                    }if(ice_list[targetICE]["mode"]){
                        msg = msg + " ICE mode: DND";
                    }else{
                        msg = msg + " ICE mode: Avaialble";
                    }
                    response["message"] = "Execution queued on " + targetICE + " " +  msg ;
                }
                
            }else if(projectid && projectid in project_list){
                //if target ICE was not specified fetch the appropriate pool and push
                pools = project_list[projectid];
                poolid = getLeastLoadedPool(pools);
                pool = queue_list[poolid];
                pool["execution_list"].push(testSuite);
                cache.set("execution_queue",queue_list);
                response['status'] = "pass";
                response["message"] = "Execution queued on pool" + pool["poolname"];
            }else{
                //check if target ice is connected but not preset in any pool, execute directly if true
                if(ice_list[targetICE] && ice_list[targetICE]["connected"]){
                    if(ice_list[targetICE]["mode"] && userInfo.userid === userInfo.invokingUser ){
                        if(type == "ACTIVE"){
                             executeActiveTestSuite(batchExecutionData, execIds, userInfo, type);
                        }else{
                            executeScheduleTestSuite(batchExecutionData, execIds, userInfo, type);
                        }
                    }
                    response['status'] = "pass";
                    response["message"] = "Execution Started on " + ice_name + " ICE mode: DND" 
                }else{
                    //the target ice is neither part of a pool nor is connected to server, queuing not possible
                    response['status'] = "pass";
                    response["message"] = targetICE +" not connected to server and not part of any pool, connect ICE to server or add ICE to a pool to proceed."
                }
                
            }
        }catch(e){
            response["error"] = "Error while adding test suite to queue";
            logger.error("Error in addTestSuiteToQueue. Error: %s",e);
        }
        
        return response;
    }
    static addAPITestSuiteToQueue(testSuiteRequest){
        // TODO get target ICE and project ID
        var projectid = "";
        var targetICE = "any";
        var response = {};
        const hdrs = testSuiteRequest.headers;
        const multiBatchExecutionData = testSuiteRequest.body.executionData;
        response['status'] = "fail";
        response["message"] = "N/A"
        response['error'] = "None"
        response['acknowledgement'] = "N/A"
        try {
            if(testSuiteRequest.body && testSuiteRequest.body.executionData && testSuiteRequest.body.executionData[0] && testSuiteRequest.body.executionData[0].userInfo && testSuiteRequest.body.executionData[0].userInfo.icename){
                targetICE = testSuiteRequest.body.executionData[0].userInfo.icename
            }

            // Check if request came from Azure DevOps. If yes, then send the acknowledgement
            if (hdrs["user-agent"].startsWith("VSTS") && hdrs.planurl && hdrs.projectid) {
                reqFromADO = true;
                response["acknowledgement"] = "Request Recieved";
            }
            if (!multiBatchExecutionData || multiBatchExecutionData.constructor !== Array || multiBatchExecutionData.length === 0 ) {
                response["error"] = "Empty or Invalid Batch Data";
                return response;
            }

            var testSuite = {"testSuiteRequest":testSuiteRequest,"type":"API","userInfo":testSuiteRequest.body.executionData[0].userInfo}
            if(targetICE && targetICE in ice_list && ice_list[targetICE]["poolid"] in queue_list){
                if(ice_list[ice_name]["mode"]){
                    //result = executeTestSuite(batchExecutionData, execIds, userInfo, type);
                    response['status'] = "pass";
                    response["message"] = "Selected ICE on DND mode, API execution not possible." ; 
                }else{
                    pool = queue_list[ice_list[targetICE]["poolid"]];
                    pool["execution_list"].push(testSuite);
                    //save execution queue to redis
                    cache.set("execution_queue",queue_list);
                    //create response message
                    response['status'] = "pass";
                    var msg = "ICE status: Not Connected"
                    if(ice_list[targetICE]["connected"]){
                        msg = "ICE status: connected"
                    }if(ice_list[targetICE]["mode"]){
                        msg = msg + " ICE mode: DND";
                    }else{
                        msg = msg + "ICE mode: Avaialble";
                    }
                    response["message"] = "Execution queued on " + targetICE + msg + " Queue lenght: " + pool["execution_list"].length.toString();
                }
                
            }else if(targetICE == "any"){
                response["message"] = "Taget ICE not defined"
            }
            
        } catch (e) {
            response["error"] = "Error while adding test suite to queue";
            logger.error("Error in addTestSuiteToQueue. Error: %s",e);
        }
       
        return response;
    }
    /** 
        * @param {list} batchExecutionData 
        * Of all the pools avialble for a project returns the one with the smallest queue
    */      
    getLeastLoadedICE(poolQueues){
        //increase the value of min if number of execution request in queue exceed 9007199254740991
        var min =  Number.MAX_SAFE_INTEGER
        var index = "";
        for (poolid in poolQueues){
            if (queue_list[poolQueues[poolid]]["execution_list"].size() < min){
                min = queue_list[poolQueues[poolid]]["execution_list"].size();
                index = poolid;
            }
        }
        return index;
    }   
}
/** 
    * @param {string} channel 
    * @param {dictionary} ice_data
    * Function responsible to update ICE status when it changes and execute a test suite from queue when required
*/  
async function triggerExecution(channel, ice_data){
    var data = JSON.parse(ice_data);
    var result = false;
    //check if the triggered request id for ice status change and check if the request is duplicate or not 
    if (channel != "ICE2_" + data.username || data.onAction != 'ice_status_change' || data["reqID"] in request_ids) return result;
    var ice_name = data.username
    //register this request so that dupliacte requests can be ignored
    request_ids[data["reqID"]] = 1;
    //check if target ice is in ice_list or not, refer init method of queues for contents ice_list
    if(!ice_name in ice_list){
        return result;
    }
    //update ice mode and status in ice_list
    ice_list[ice_name]["mode"] = data.value.mode;
    ice_list[ice_name]["status"] = data.value.status;
    //check if socket connection is available or not
    const sockmode = await utils.channelStatus(ice_name);
    //if ice is busy or not connected return 
    if(data.value.status || (!sockmode.normal && !sockmode.schedule)){
        return result;
    } 
    poolid = ice_list[ice_name]["poolid"];
    pool = queue_list[poolid];
    queue = pool["execution_list"];
    //iterate over execution queue 
    for(i = 0; i < queue.length; i++){
        testSuite = queue[i];
        //check if target ice for testsuite and the actual ice which has communicated it's status is same or not, accept if ice_name matches or is "any"
        if(testSuite.userInfo.icename === ice_name || testSuite.userInfo.icename === "any"){
            //check if the ice is in dnd or not, if in dnd check wether the ICE asignee and the invoking user are same 
            if(data.value.mode && testSuite.userInfo.userid != testSuite.userInfo.invokingUser){
                return result;
            }
            //commence execution
            logger.info("Sending Execution Request to: " + ice_name + " queue lenght for poolid: " + poolid.toString() + " is: " + queue.length);
            try{
                switch(testSuite.type){
                    case 'ACTIVE': 
                                executeActiveTestSuite(testSuite.batchExecutionData, testSuite.execIds, testSuite.userInfo, testSuite.type)
                                break;
                    case 'API': 
                                executeAPI(testSuite);
                                break;
                    case 'SCHEDULE': 
                                executeScheduleTestSuite(testSuite.batchExecutionData, testSuite.execIds, testSuite.userInfo, testSuite.type);
                                break;
                }
                //remove execution from queue
                queue.splice(i,1);
                cache.set("execution_queue",queue_list);
            }catch(e){
                logger.error("Error in triggerExecution. Error: %s",e);
            }
            break;
        }
    }
    return result;
} 

// TODO update pools regularly

async function setUpPool(inputs){
    const fnName = "setUpPool"
    projectid = {};
    ice_list = {};
    queue_list = {};
    request_ids ={};
    notification_dict = {}
    try{
        queue_list = await cache.get("execution_queue");
        notification_dict = await cache.get("pending_notifciation");
        if(!notification_dict) notification_dict = {}
        if(!queue_list) queue_list = {} 
        pools = await utils.fetchData(inputs, "admin/getPools", fnName);
        for(index in pools){
            pool = pools[index]
            var poolid = pool["_id"];
            if (!(poolid in queue_list)){
                queue_list[poolid] = {};
                queue_list[poolid]["name"] = pool["poolname"];
            }
            
            project_list = setUpProjectList(pool["projectids"],poolid);
            inputs = {
                "poolids" : [poolid]
            }
            queue_list[poolid]["ice_list"] = await utils.fetchData(inputs, "/admin/getICE_pools", fnName);
            ice_list = setUpICEList(queue_list[poolid]["ice_list"],poolid);
            if(!queue_list[poolid]["execution_list"]){
                queue_list[poolid]["execution_list"] = []
            }    
        }
        
        cache.set("execution_queue",queue_list);
        return queue_list,project_list,ice_list,request_ids,notification_dict
    }catch(exception){
        logger.error("Error in setUpPool. Error: %s",exception);
    }
    return queue_list,project_list,ice_list,request_ids,notification_dict
}

function setUpProjectList(projectids,poolid){
    var project_list = {}
    if(!projectids || !poolid){
        return project_list;
    }
    for (project in projectids){
        projectid = projectids[project];
        if (projectid in project_list){
            project_list[projectid].push(poolid);
        }else{
            project_list[projectid] = [poolid];
        }
    }
    return project_list
}

function setUpICEList(list,poolid){
    if(!ice_list){
        ice_list = {}
    }

    if(!list || !poolid){
        return ice_list;
    }
    for (ice in list){
        ice_name = list[ice]["icename"];
        ice_list[ice_name] = {}
        ice_list[ice_name]["poolid"] = poolid;
        ice_list[ice_name]["mode"] = false
        ice_list[ice_name]["status"] = false
        ice_list[ice_name]["connected"] = false
    }
    return ice_list;
}

async function executeActiveTestSuite(batchExecutionData, execIds, userInfo,type){
    var soc = myserver.socketMapNotify[userInfo.username];
    try {
		result = await suite.executionFunction(batchExecutionData, execIds, userInfo, type);
	} catch (ex) {
		result = "fail";
		logger.error("Error in executeTestSuite. Error: %s", ex)
    }
    var reportResult = {};
    batchExecutionData.batchInfo[0]["testsuitename"] =  batchExecutionData.batchInfo[0]["testsuiteName"];

    reportResult["testSuiteIds"] = batchExecutionData.batchInfo;
    reportResult["status"] = result;
    var username = userInfo.username;
    const notifySocMap = myserver.socketMapNotify; 
    if(notifySocMap && notifySocMap[username] && notifySocMap[username].connected){
        notifySocMap[username].emit("display_execution_popup",[reportResult]);
    }else{
        if(!(username in notification_dict)){
            notification_dict[username] = []; 
        }
        notification_dict[username].push(reportResult)
        cache.set("pending_notification",notification_dict)
    }
    
	return result;
}

async function executeScheduleTestSuite(batchExecutionData, execIds, userInfo,type){
    const fhName = "executeScheduleTestSuite";
    var soc = myserver.socketMapNotify[userInfo.username];
    const scheduleId = execIds["scheduleId"];
    try {

       result = await suite.executionFunction(batchExecutionData, execIds, userInfo, "SCHEDULE");
   } catch (ex) {
       result = "fail";
       logger.error("Error in " + fnName + " service. Error: %s", ex)
   }
   result = (result == "success")? "Completed" : ((result == "UserTerminate")? "Terminate" : result);
   let schedStatus = result;
   if (!["Completed", "Terminate", "Skipped", "fail"].includes(result)) {
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
           const batchObj = {
               "executionIds": tsuIds.map(i => currExecIds.execids[i]),
               "suitedetails": batchExecutionData.batchInfo.map(t => ({
                   "testsuitename": t.testsuiteName,
                   "testsuiteid": t.testsuiteId,
                   "projectname": t.projectName,
                   "releaseid": t.releaseId,
                   "cyclename": t.cycleName,
                   "scenarioIds": t.suiteDetails.map(s => s.scenarioId),
                   "scenarioNames": t.suiteDetails.map(s => s.scenarioName)
               }))
           };
           await suite.updateSkippedExecutionStatus(batchObj, userInfo, result, msg);
       }
   }
   await suite.updateScheduleStatus(scheduleId, schedStatus, execIds.batchid);
   var reportResult = {};
   batchExecutionData.batchInfo[0]["testsuitename"] =  batchExecutionData.batchInfo[0]["testsuiteName"];
   reportResult["testSuiteIds"] = batchExecutionData.batchInfo;
   reportResult["status"] = schedStatus;
   var username = userInfo.username;
   const notifySocMap = myserver.socketMapNotify; 
   if(notifySocMap && notifySocMap[username] && notifySocMap[username].connected){
        notifySocMap[username].emit("display_execution_popup",[reportResult]);
    }else{
        if(!(username in notification_dict)){
            notification_dict[username] = []; 
        }
        notification_dict[username].push(reportResult)
        cache.set("pending_notification",notification_dict)
    }
}

async function executeAPI(testSuite){
    const req = testSuite.testSuiteRequest;
    const hdrs = req.headers;
    var icename = testSuite.userInfo.icename;
    var username = testSuite.userInfo.username;
    const notifySocMap = myserver.socketMapNotify;
    var reportResult = {}
    reportResult["testSuiteIds"] = "";
    reportResult["status"] = "fail"; 
    
	let reqFromADO = false;
	if (hdrs["user-agent"].startsWith("VSTS") && hdrs.planurl && hdrs.projectid) {
        reqFromADO = true;
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
			const icename = userInfo.icename;
			if (userRequestMap[icename] == undefined) userRequestMap[icename] = [i];
			else userRequestMap[icename].push(i);
		}
		executionResult.push(execResponse);
	}
	const executionIndicesList = Object.values(userRequestMap);
    const batchExecutionPromiseList = executionIndicesList.map(executionIndices => (async () => {
		try {
			for (let exi of executionIndices) {
				const batchExecutionData = multiBatchExecutionData[exi];
				const execResponse = executionResult[exi];
				const userInfo = userInfoList[exi];
				const execIds = { "batchid": "generate", "execid": {} };
				var result;
				try {
					result = await suite.executionFunction(batchExecutionData, execIds, userInfo, "API");
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
    reportResult["status"] = finalResult;

	if (!reqFromADO){
        console.log("not for azure")
        if(notifySocMap && notifySocMap[username] && notifySocMap[username].connected){
            notifySocMap[username].emit("display_execution_popup",[reportResult]);
        }else{
            if(!(username in notification_dict)){
                notification_dict[username] = []; 
            }
            notification_dict[username].push(reportResult)
            cache.set("pending_notification",notification_dict)
        }
        return reportResult;
    } 
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
    
}

async function connect_ice(ice_name){
    queue_list = await cache.get("execution_queue")
    ice_list[ice_name] = {}
    ice_list[ice_name]["connected"] = true;
    ice_list[ice_name]["status"] = false;
    ice_list[ice_name]["mode"] = false;
}

module.exports.Execution_Queue = Execution_Queue