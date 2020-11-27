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
const EMPTYUSER = process.env.nulluser;
module.exports.Execution_Queue = class Execution_Queue {
    /*
        this.queue_list: main execution queue, it stores all the queue's corresponding to pools
        this.project_list: dictionary of projects as key pool as value, useful for searching purpose
        this.ice_list: dictionary contains ice_name as key and poolid/status/mode/connected as values, 
                  maintains the status of all ice (includes ICE which are not part of any pool but connected to ICE, poolid marked as 'orphan')
        this.registred_ICE: dictionary to maintain ice whose callbacks have been registred
        this.request_ids: dictionary conatining all the requests recieved
    */
    static queue_list = {}
    static project_list = {}
    static ice_list = {}
    static registred_ICE = {}
    static request_ids = {}
    static notification_dict = {}
    // executon queue initialisation
    static queue_init() {
        logger.info("Initialisign Execution Queues")
        let _this = this
        let fnName = 'instantiateQueue'
        let inputs = {
            "projectids": [],
            "poolid": "all"
        }
        this.setUpPool(inputs)
    }

    /** 
        * @param {string} ice_name 
        * Register callback for ICE when the status of ICE changes
    */
    static register_execution_trigger_ICE(ice_name) {
        //check if ice is already present in this.ice_list
        if (ice_name in this.ice_list) {
            this.ice_list[ice_name]["connected"] = true
        } else {
            this.connect_ice(ice_name);
        }
        //check if callback for ICE has already been registred
        if (!(ice_name in this.registred_ICE)) {
            logger.info("Registering execution call back for ICE: " + ice_name);
            redisServer.redisSubServer.subscribe('ICE_STATUS_' + ice_name);
            redisServer.redisSubServer.on("message", this.triggerExecution);
            this.registred_ICE[ice_name] = true;
        }
    }

    static updatePools(action, poolinfo) {
        let inputs = {
            "projectids": [],
            "poolid": "all"
        }
        switch(action){
            case "delete":
                delete this.queue_list[poolinfo.poolid];
                cache.set("execution_queue", this.queue_list);
                break;
            case "create":
                this.setUpPool(inputs);
                break;
            case "update":
                inputs["poolid"] = poolinfo._id
                this.setUpPool(inputs);
                break;
        }
    }

    static add_pending_notification(execIds, report_result, username) {
        logger.info("Adding pending notification for user: " + username)
        if (!(username in this.notification_dict)) {
            this.notification_dict[username] = [];
        }
        this.notification_dict[username].push(report_result)
        cache.set("pending_notification", this.notification_dict)
    }


    /** 
        * @param {} batchExecutionData 
        * @param {} execIds
        * @param {dictionary} userInfo
        * @param {String} type
        * Adds normal / scheduling test suites to queue
        * Executes normal / scheduling test suites if the target ICE is in DND mode
    */
    static addTestSuiteToQueue(batchExecutionData, execIds, userInfo, type,poolid) {
        let targetICE = EMPTYUSER;
        let projectid = "";
        let response = {}
        response['status'] = "fail";
        response["message"] = "N/A"
        response['error'] = "None"
        try {
            //check if target ICE was specified or not
            if (userInfo && userInfo.icename && userInfo.icename != EMPTYUSER) {
                targetICE = userInfo.icename;
            } else {
                userInfo.icename = EMPTYUSER
            }
            //get project id of the test suite in the case targeICE was not specified
            if (batchExecutionData && batchExecutionData.batchInfo[0] && batchExecutionData.batchInfo[0].projectid) {
                projectid = batchExecutionData.batchInfo[0].projectid;
            }
            let testSuite = { "batchExecutionData": batchExecutionData, "execIds": execIds, "userInfo": userInfo, "type": type }
            //check if target ICE is present in any pool 
            if (targetICE && targetICE in this.ice_list && this.ice_list[targetICE]["poolid"] in this.queue_list) {
                //check if target ICE is in DND mode, if true check wether the ice owner is has invoked execution
                if (this.ice_list[targetICE]["mode"] && userInfo.userid === userInfo.invokinguser) {
                    if (type == "ACTIVE") {
                        this.executeActiveTestSuite(batchExecutionData, execIds, userInfo, type);
                    } else {
                        this.executeScheduleTestSuite(batchExecutionData, execIds, userInfo, type);
                    }
                    response['status'] = "pass";
                    response["message"] = "Execution Started on " + targetICE + " ICE mode: DND"
                }
                else {
                    //get pool in which the target ICE present
                    let pool = this.queue_list[this.ice_list[targetICE]["poolid"]];
                    pool["execution_list"].push(testSuite);
                    //save execution queue to redis
                    cache.set("execution_queue", this.queue_list);
                    //create response message
                    response['status'] = "pass";
                    let msg = " ICE status: Not Connected"
                    if (this.ice_list[targetICE]["connected"]) {
                        msg = " ICE status: connected"
                    } if (this.ice_list[targetICE]["mode"]) {
                        msg = msg + " ICE mode: DND";
                    } else {
                        msg = msg + " ICE mode: Available";
                    }
                    response["message"] = "Execution queued on " + targetICE + " " + msg;
                }

            } else if (poolid && poolid in this.queue_list) {
                //if target ICE was not specified fetch the appropriate pool and push
                pool = this.queue_list[poolid];
                pool["execution_list"].push(testSuite);
                cache.set("execution_queue", this.queue_list);
                response['status'] = "pass";
                response["message"] = "Execution queued on pool: " + pool["name"];
            } else {
                //check if target ice is connected but not preset in any pool, execute directly if true
                if (this.ice_list[targetICE] && this.ice_list[targetICE]["connected"]) {
                    if ((this.ice_list[targetICE]["mode"] && userInfo.userid === userInfo.invokinguser) || !this.ice_list[targetICE]["mode"]) {
                        if (type == "ACTIVE") {
                            this.executeActiveTestSuite(batchExecutionData, execIds, userInfo, type);
                        } else {
                            this.executeScheduleTestSuite(batchExecutionData, execIds, userInfo, type);
                        }
                    }
                    response['status'] = "pass";
                    response["message"] = "Execution Started on " + targetICE;
                } else {
                    //the target ice is neither part of a pool nor is connected to server, queuing not possible
                    response['status'] = "pass";
                    response["message"] = targetICE + " not connected to server and not part of any pool, connect ICE to server or add ICE to a pool to proceed."
                }
            }
        } catch (e) {
            response["error"] = "Error while adding test suite to queue";
            logger.error("Error in addTestSuiteToQueue. Error: %s", e);
        }

        return response;
    }

    static addAPITestSuiteToQueue(testSuiteRequest) {
        // TODO get target ICE and project ID
        let projectid = "";
        let targetICE = EMPTYUSER;
        let request_pool_name = EMPTYUSER;
        let poolid = "";
        let response = {};
        const hdrs = testSuiteRequest.headers;
        const multiBatchExecutionData = testSuiteRequest.body.executionData;
        response['status'] = "fail";
        response["message"] = "N/A"
        response['error'] = "None"
        response['acknowledgement'] = "N/A"
        try {
            if (testSuiteRequest.body && testSuiteRequest.body.executionData && testSuiteRequest.body.executionData[0] && testSuiteRequest.body.executionData[0].userInfo ) {
                let suite = testSuiteRequest.body.executionData[0].userInfo
                var invokinguser = {
                    invokinguser: testSuiteRequest.session.userid,
                    invokingusername: testSuiteRequest.session.username,
                    invokinguserrole: testSuiteRequest.session.activeRoleId
                }
                Object.assign(suite, invokinguser);
                if(suite.icename) targetICE = testSuiteRequest.body.executionData[0].userInfo.icename;
                if(suite.poolname){
                    request_pool_name = suite.poolname;
                    for(let id in this.queue_list){
                        if(this.queue_list[id].name ===  request_pool_name){
                            poolid = id;
                            suite.icename = EMPTYUSER;
                            break;
                        }
                    }
                }
            }

            // Check if request came from Azure DevOps. If yes, then send the acknowledgement
            if (hdrs["user-agent"].startsWith("VSTS") && hdrs.planurl && hdrs.projectid) {
                reqFromADO = true;
                response["acknowledgement"] = "Request Recieved";
            }
            if (!multiBatchExecutionData || multiBatchExecutionData.constructor !== Array || multiBatchExecutionData.length === 0) {
                response["error"] = "Empty or Invalid Batch Data";
                return response;
            }
            let suiteRequest = {"executionData":testSuiteRequest.body.executionData,"headers":testSuiteRequest.headers}
            let userInfo = testSuiteRequest.body.executionData[0].userInfo;
            let testSuite = { "testSuiteRequest": suiteRequest, "type": "API", "userInfo": userInfo }
            if (targetICE && targetICE in this.ice_list && this.ice_list[targetICE]["poolid"] in this.queue_list) {
                if (this.ice_list[ice_name]["mode"]) {
                    //result = executeTestSuite(batchExecutionData, execIds, userInfo, type);
                    response['status'] = "pass";
                    response["message"] = "Selected ICE on DND mode, API execution not possible.";
                } else {
                    let pool = this.queue_list[this.ice_list[targetICE]["poolid"]];
                    pool["execution_list"].push(testSuite);
                    //save execution queue to redis
                    cache.set("execution_queue", this.queue_list);
                    //create response message
                    response['status'] = "pass";
                    let msg = " ICE status: Not Connected"
                    if (this.ice_list[targetICE]["connected"]) {
                        msg = " ICE status: connected"
                    } if (this.ice_list[targetICE]["mode"]) {
                        msg = msg + " ICE mode: DND";
                    } else {
                        msg = msg + " ICE mode: Available";
                    }
                    response["message"] = "Execution queued on " + targetICE + " " + msg;
                }

            } else if (poolid && poolid in this.queue_list) {
                let pool = this.queue_list[poolid];
                pool["execution_list"].push(testSuite);
                //save execution queue to redis
                cache.set("execution_queue", this.queue_list);
                //create response message
                response['status'] = "pass";
                response["message"] = "Execution queued on pool: " + request_pool_name;

            } else{
                response["message"] = "ICE name / Poolid not provided"
            }

        } catch (e) {
            response["error"] = "Error while adding test suite to queue";
            logger.error("Error in addAPITestSuiteToQueue. Error: %s", e);
        }

        return response;
    }
    /** 
        * @param {list} batchExecutionData 
        * Of all the pools avialble for a project returns the one with the smallest queue
    */
    getLeastLoadedICE(poolQueues) {
        //increase the value of min if number of execution request in queue exceed 9007199254740991
        let min = Number.MAX_SAFE_INTEGER
        let index = "";
        for (let poolid in poolQueues) {
            if (this.queue_list[poolQueues[poolid]]["execution_list"].size() < min) {
                min = this.queue_list[poolQueues[poolid]]["execution_list"].size();
                index = poolid;
            }
        }
        return index;
    }


    /** 
    * @param {string} channel 
    * @param {dictionary} ice_data
    * Function responsible to update ICE status when it changes and execute a test suite from queue when required
*/  
    static triggerExecution = async (channel, ice_data) => {
        let data = JSON.parse(ice_data);
        let result = false;
        //check if the triggered request id for ice status change and check if the request is duplicate or not 
        if (channel != "ICE_STATUS_" + data.username || data.onAction != 'ice_status_change' || data["reqID"] in this.request_ids) return result;
        let ice_name = data.username
        //register this request so that dupliacte requests can be ignored
        this.request_ids[data["reqID"]] = 1;
        //check if target ice is in this.ice_list or not, refer init method of queues for contents this.ice_list
        if (!ice_name in this.ice_list) {
            return result;
        }
        //update ice mode and status in this.ice_list
        this.ice_list[ice_name]["mode"] = data.value.mode;
        this.ice_list[ice_name]["status"] = data.value.status;
        //check if socket connection is available or not
        const sockmode = await utils.channelStatus(ice_name);
        //if ice is busy or not connected return 
        if (data.value.status || (!sockmode.normal && !sockmode.schedule)) {
            logger.info("Could not execute on: " + ice_name + " ICE is either Executing a test suite or Server not connected to ice");
            return result;
        }
        let poolid = this.ice_list[ice_name]["poolid"];
        if(!poolid){
            logger.debug(ice_name + " does not belong to any pool.")
            return;
        }
        let pool = this.queue_list[poolid];
        var queue = pool["execution_list"];
        //iterate over execution queue 
        for (let i = 0; i < queue.length; i++) {
            let testSuite = queue[i];
            //check if target ice for testsuite and the actual ice which has communicated it's status is same or not, accept if ice_name matches or is "any"
            if (testSuite.userInfo.icename === ice_name || testSuite.userInfo.icename === EMPTYUSER) {
                testSuite.userInfo.icename = ice_name;
                //check if the ice is in dnd or not, if in dnd check wether the ICE asignee and the invoking user are same 
                if (data.value.mode && testSuite.userInfo.userid != testSuite.userInfo.invokinguser) {
                    return result;
                }
                //commence execution
                logger.info("Sending Execution Request to: " + ice_name + " queue lenght for poolid: " + poolid.toString() + " is: " + queue.length);
                try {
                    switch (testSuite.type) {
                        case 'ACTIVE':
                            this.executeActiveTestSuite(testSuite.batchExecutionData, testSuite.execIds, testSuite.userInfo, testSuite.type)
                            break;
                        case 'API':
                            this.executeAPI(testSuite);
                            break;
                        case 'SCHEDULE':
                            this.executeScheduleTestSuite(testSuite.batchExecutionData, testSuite.execIds, testSuite.userInfo, testSuite.type);
                            break;
                    }
                    //remove execution from queue
                    queue.splice(i, 1);
                    logger.info("Removing Test Suite from queue");
                    cache.set("execution_queue", this.queue_list);
                } catch (e) {
                    logger.error("Error in triggerExecution. Error: %s", e);
                }
                break;
            }
        }
        return result;
    }

    static async setUpPool(inputs) {
        const fnName = "setUpPool"
        try {
            this.queue_list = await cache.get("execution_queue");
            this.notification_dict = await cache.get("pending_notification");
            if (!this.notification_dict) this.notification_dict = {}
            if (!this.queue_list) this.queue_list = {}
            var pools = await utils.fetchData(inputs, "admin/getPools", fnName);
            for (let index in pools) {
                let pool = pools[index]
                let poolid = pool["_id"];
                if (!(poolid in this.queue_list)) {
                    this.queue_list[poolid] = {};
                    
                }
                this.queue_list[poolid]["name"] = pool["poolname"];
                this.project_list = this.setUpProjectList(pool["projectids"], poolid);
                inputs = {
                    "poolids": [poolid]
                }
                this.queue_list[poolid]["ice_list"] = await utils.fetchData(inputs, "/admin/getICE_pools", fnName);
                this.ice_list = this.setUpICEList(this.queue_list[poolid]["ice_list"], poolid);
                if (!this.queue_list[poolid]["execution_list"]) {
                    this.queue_list[poolid]["execution_list"] = []
                }
            }
            cache.set("execution_queue", this.queue_list);
        } catch (exception) {
            logger.error("Error in setUpPool. Error: %s", exception);
        }
    }

    static setUpProjectList(projectids, poolid) {
        if (!projectids || !poolid) {
            return this.project_list;
        }
        for (let project in projectids) {
            var projectid = projectids[project];
            if (projectid in this.project_list) {
                this.project_list[projectid].push(poolid);
            } else {
                this.project_list[projectid] = [poolid];
            }
        }
        return this.project_list
    }

    static setUpICEList(list, poolid) {
        if (!list || !poolid) {
            return this.ice_list;
        }
        for (let ice in list) {
            let ice_name = list[ice]["icename"];
            this.ice_list[ice_name] = {}
            this.ice_list[ice_name]["poolid"] = poolid;
            this.ice_list[ice_name]["mode"] = false
            this.ice_list[ice_name]["status"] = false
            this.ice_list[ice_name]["connected"] = false
        }
        return this.ice_list;
    }

    static async executeActiveTestSuite(batchExecutionData, execIds, userInfo, type) {
        try {
            var result = await suite.executionFunction(batchExecutionData, execIds, userInfo, type);
        } catch (ex) {
            var result = "fail";
            logger.error("Error in executeTestSuite. Error: %s", ex)
        }
        let reportResult = {};
        batchExecutionData.batchInfo[0]["testsuitename"] = batchExecutionData.batchInfo[0]["testsuiteName"];

        reportResult["testSuiteIds"] = batchExecutionData.batchInfo;
        reportResult["status"] = result;
        let username = userInfo.username;
        const notifySocMap = myserver.socketMapNotify;
        if (notifySocMap && notifySocMap[username] && notifySocMap[username].connected) {
            notifySocMap[username].emit("display_execution_popup", [reportResult]);
        } else {
            if (!(username in this.notification_dict)) {
                this.notification_dict[username] = [];
            }
            this.notification_dict[username].push(reportResult)
            cache.set("pending_notification", this.notification_dict)
        }

        return result;
    }

    static async executeScheduleTestSuite(batchExecutionData, execIds, userInfo, type) {
        const scheduleId = execIds["scheduleId"];
        try {

            result = await suite.executionFunction(batchExecutionData, execIds, userInfo, "SCHEDULE");
        } catch (ex) {
            result = "fail";
            logger.error("Error in " + fnName + " service. Error: %s", ex)
        }
        result = (result == "success") ? "Completed" : ((result == "UserTerminate") ? "Terminate" : result);
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
        let reportResult = {};
        batchExecutionData.batchInfo[0]["testsuitename"] = batchExecutionData.batchInfo[0]["testsuiteName"];
        reportResult["testSuiteIds"] = batchExecutionData.batchInfo;
        reportResult["status"] = schedStatus;
        let username = userInfo.username;
        const notifySocMap = myserver.socketMapNotify;
        if (notifySocMap && notifySocMap[username] && notifySocMap[username].connected) {
            notifySocMap[username].emit("display_execution_popup", [reportResult]);
        } else {
            if (!(username in this.notification_dict)) {
                this.notification_dict[username] = [];
            }
            this.notification_dict[username].push(reportResult)
            cache.set("pending_notification", this.notification_dict)
        }
    }

    static async executeAPI(testSuite) {
        const req = testSuite.testSuiteRequest;
        const hdrs = req.headers;
        let username = testSuite.userInfo.username;
        const notifySocMap = myserver.socketMapNotify;
        let reportResult = {}
        reportResult["testSuiteIds"] = "";
        reportResult["status"] = "fail";

        let reqFromADO = false;
        if (hdrs["user-agent"].startsWith("VSTS") && hdrs.planurl && hdrs.projectid) {
            reqFromADO = true;
        }
        const multiBatchExecutionData = req.executionData;
        const userRequestMap = {};
        const userInfoList = [];
        const executionResult = [];

        for (let i = 0; i < multiBatchExecutionData.length; i++) {
            const executionData = multiBatchExecutionData[i];
            var userInfo = await utils.tokenValidation(executionData.userInfo || {});
            userInfo.invokinguser = userInfo.userid;
            userInfo.invokingusername = userInfo.username;
            userInfo.invokinguserrole = userInfo.role;
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
                    let result;
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
                        for (let tsuid in result[0]) {
                            const tsu = result[0][tsuid];
                            const scenarios = [];
                            tsu.executionId = execIds.execid[tsuid];
                            for (let tscid in tsu.scenarios) scenarios.push(...tsu.scenarios[tscid]);
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
        const finalResult = { "executionStatus": executionResult };
        reportResult["testSuiteIds"] = multiBatchExecutionData[0].batchInfo;
        reportResult["testSuiteIds"][0]["testsuitename"]  = reportResult["testSuiteIds"][0]["testsuiteName"];
        if(finalResult.executionStatus[0].status) reportResult["status"] = "API Execution Completed";
        else reportResult["status"] = "API Execution Failed";
        if (!reqFromADO) {
            if (notifySocMap && notifySocMap[username] && notifySocMap[username].connected) {
                notifySocMap[username].emit("display_execution_popup", [reportResult]);
            } else {
                if (!(username in this.notification_dict)) {
                    this.notification_dict[username] = [];
                }
                this.notification_dict[username].push(reportResult)
                cache.set("pending_notification", this.notification_dict)
            }
            return reportResult;
        }
        // This code only executes when request comes from Azure DevOps
        let adoStatus = finalResult.executionStatus.every(e => e.status == "success");
        const args = {
            data: { "name": "TaskCompleted", "taskId": hdrs.taskinstanceid, "jobId": hdrs.jobid, "result": (adoStatus ? "succeeded" : "failed") },
            headers: {
                "Authorization": 'Basic ' + Buffer.from(':' + hdrs.authtoken).toString('base64'),
                "Content-Type": "application/json"
            }
        };
        const adourl = hdrs.planurl + '/' + hdrs.projectid + '/_apis/distributedtask/hubs/' + hdrs.hubname + '/plans/' + hdrs.planid + '/events?api-version=2.0-preview.1';
        logger.info("Sending response to Azure DevOps");
        const promiseData = (new Promise((rsv, rej) => {
            const apiReq = client.post(adourl, args, (result, response) => {
                if (response.statusCode < 200 && response.statusCode >= 400) {
                    logger.error("Error occurred while sending response to Azure DevOps");
                    const toLog = ((typeof (result) == "object") && !(result instanceof Buffer)) ? JSON.stringify(result) : result.toString();
                    logger.debug("Response code is %s and content is %s", response.statusCode, toLog);
                    rsv("fail");
                } else {
                    rsv(result);
                }
            });
            apiReq.on('error', function (err) {
                logger.error("Error occurred while sending response to Azure DevOps, Error: %s", err);
                rsv("fail");
            });
        }));
        try { return await promiseData; }
        catch (e) { logger.error(e); }

    }

    static async connect_ice(ice_name) {
        this.queue_list = await cache.get("execution_queue")
        this.ice_list[ice_name] = {}
        this.ice_list[ice_name]["connected"] = true;
        this.ice_list[ice_name]["status"] = false;
        this.ice_list[ice_name]["mode"] = false;
    }

}



