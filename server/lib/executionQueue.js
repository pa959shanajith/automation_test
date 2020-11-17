const utils = require('../lib/utils');
const suite = require('../controllers/suite')
const redisServer = require('./redisSocketHandler');
const cache = require("./cache")
var logger = require('../../logger');


class Execution_Queue{
    static queue_list = {}
    static project_list = {}
    static ice_list = {}
    
    static queue_init(){
        var _this = this
        var fnName = 'instantiateQueue'
        var inputs = {
            "projectids": [],
            "poolid": "all"
        }
        _this.queue_list, _this.project_list, _this.ice_list = setUpPool(inputs)
    }

    static register_execution_trigger_ICE(ice_name){
        ice_list[ice_name]["status"] = true
        redisServer.redisSubServer.subscribe('ICE2_'+ice_name);
        redisServer.redisSubServer.on("message",triggerExecution);
    }
    
    static addTestSuiteToQueue(batchExecutionData, execIds, userInfo,type){
        var targetICE = "";
        var projectid = "";
        if (userInfo.icename){
            targetICE = userInfo.icename;
        }
        if( batchExecutionData.batchInfo[0] && batchExecutionData.batchInfo[0].projectid){
            projectid = batchExecutionData.batchInfo[0].projectid;
        }
        var testSuite = {"batchExecutionData":batchExecutionData,"execIds": execIds, "userInfo": userInfo,"type":type}
        if(targetICE && targetICE in ice_list && ice_list[targetICE]["poolid"] in queue_list){
            if(ice_list[ice_name]["mode"]){
                result = executeTestSuite(batchExecutionData, execIds, userInfo, type);
                cache.set("execution_queue",queue_list);
                return true;
            }
            pool = queue_list[ice_list[targetICE]["poolid"]];
            pool["execution_list"].push(testSuite);
            cache.set("execution_queue",queue_list);
            return true;
        }else if(projectid && projectid in project_list){
            pools = project_list[projectid];
            poolid = getLeastLoadedPool(pools);
            pool = queue_list[poolid];
            pool["execution_list"].push(testSuite);
            cache.set("execution_queue",queue_list);
            return true;
        }else{
            result = executeTestSuite(batchExecutionData, execIds, userInfo, type)
            return true;
        }
        return false;
    }
    static addAPITestSuiteToQueue(testSuiteRequest){
        // TODO get target ICE and project ID
        var projectid = "";
        var targetICE = "";
        var testSuite = {"testSuiteRequest":testSuiteRequest,"type":"API"}
        if(targetICE && targetICE in ice_list && ice_list[targetICE]["poolid"] in queue_list){
            if(ice_list[ice_name]["mode"]){
                result = executeTestSuite(batchExecutionData, execIds, userInfo, type);
                return true;
            }
            pool = queue_list[ice_list[targetICE]["poolid"]];
            pool["execution_list"].push(testSuite);
            return true;
        }else if(projectid && projectid in project_list){
            pools = project_list[projectid];
            poolid = getLeastLoadedPool(pools);
            pool = queue_list[poolid];
            pool["execution_list"].push(testSuite);
            return true;
        }else{
            result = executeTestSuite(batchExecutionData, execIds, userInfo, type)
            return true;
        }
        return false;
    }
      
    getLeastLoadedICE(poolQueues){
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

async function triggerExecution(channel, ice_data){
    var data = JSON.parse(ice_data)
    var result = false
    if (channel != "ICE2_" + data.username && data.onAction != 'ice_status_change') return;
    var ice_name = data.username
    if(!ice_name in ice_list){
        return result;
    }
    ice_list[ice_name]["mode"] = data.mode
    if(data.mode || data.status){
        return result;
    } 
    poolid = ice_list[ice_name]["poolid"]
    pool = queue_list[poolid]
    queue = pool["execution_list"] 
    for(i = 0; i < queue.length; i++){
        testSuite = queue[i];
        if(testSuite.userInfo.icename === ice_name || testSuite === "any"){
            console.log("---------------- Sending Execution request -----------------");
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
    projectid = {}
    ice_list = {}
    queue_list = {}
    try{
        queue_list = await cache.get("execution_queue")
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
        return queue_list,project_list,ice_list
    }catch(exception){
        logger.error("Error in setUpPool. Error: %s",exception);
    }
    return queue_list,project_list,ice_list
}

function setUpProjectList(projectids,poolid){
    project_list = {}
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
    ice_list = {}
    for (ice in list){
        ice_name = list[ice];
        ice_list[ice_name] = {}
        ice_list[ice_name]["poolid"] = poolid;
        ice_list[ice_name]["mode"] = false
        ice_list[ice_name]["status"] = false
    }
    return ice_list;
}

async function executeActiveTestSuite(batchExecutionData, execIds, userInfo,type){
    try {
		result = await suite.executionFunction(batchExecutionData, execIds, userInfo, type);
	} catch (ex) {
		result = "fail";
		logger.error("Error in executeTestSuite. Error: %s", ex)
    }
    if (result == DO_NOT_PROCESS) return true;
	return result;
}

async function executeScheduleTestSuite(batchExecutionData, execIds, userInfo,type){
    const fhName = "executeScheduleTestSuite";
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
}

async function executeAPI(testSuite){
    const req = testSuite.testSuiteRequest;
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
	if (!multiBatchExecutionData || multiBatchExecutionData.constructor !== Array || multiBatchExecutionData.length === 0 ) {
		return res.status(400).send({"executionStatus": [{"status": "fail", "error": "Empty or Invalid Batch Data"}]});
	}
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
			for (const exi of executionIndices) {
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
    
}


module.exports.Execution_Queue = Execution_Queue