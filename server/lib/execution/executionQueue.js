const utils = require('../utils');
var uuidV4 = require('uuid-random');
const cache = require("../cache.js").getClient(2);
const executionListCache = require("../cache.js").getClient(4)
var logger = require('../../../logger.js');
const EMPTYUSER = process.env.nulluser;
var testSuiteInvoker = require('../execution/executionInvoker')
const constants = require('./executionConstants');
const tokenAuth = require('../tokenAuth')
const scheduler = require('./scheduler');
const { default: async } = require('async');
const { timestamp } = require('winston/lib/winston/common');
const { info } = require('winston');
const { update } = require('../../notifications');
const suitFunctions = require('../../controllers/suite');
const reportFunctions = require('../../controllers/report');
const screenshotpath = require('../../config/config');
const { deleteConfigureKey } = require('../../controllers/devOps');
const notifications = require('../../notifications');
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
    static poolname_ice_map = {}
    static res_map = {}
    static key_list = {}
    static synchronous_execution_report = {}
    static agent_list = {}
    // executon queue initialisation
    static queue_init() {
        logger.info("Initializing Execution Queues")
        let _this = this
        let fnName = 'instantiateQueue'
        let inputs = {
            "projectids": [],
            "poolid": "all"
        }
        this.setUpPool(inputs);
        this.executionInvoker = new testSuiteInvoker.ExecutionInvoker();
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
    }

    static updatePools = async (action, poolinfo) => {
        let result = "fail"
        let inputs = {
            "projectids": [],
            "poolid": "all"
        }
        try {
            switch (action) {
                case "delete":
                    delete this.poolname_ice_map[this.queue_list[poolinfo.poolid].name]
                    delete this.queue_list[poolinfo.poolid];
                    cache.set("execution_queue", this.queue_list);
                    this.setUpPool(inputs);
                    result = "success";
                    break;
                case "create":
                    this.setUpPool(inputs);
                    result = "success";
                    break;
                case "update":
                    inputs["poolid"] = poolinfo._id
                    this.setUpPool(inputs);
                    result = "success";
                    break;
                case "clear_queue":
                    if (poolinfo.type && poolinfo.type == "all") {
                        this.queue_list = {}
                        await cache.set("execution_queue", this.queue_list);
                        this.setUpPool(inputs);
                    } else {
                        for (let index in poolinfo.poolids) {
                            if (poolinfo.poolids[index] in this.queue_list) {
                                this.queue_list[poolinfo.poolids[index]]["execution_list"] = []
                            }
                        }
                        cache.set("execution_queue", this.queue_list);
                    }
                    result = "success";
                    break;
            }
        } catch (e) {
            logger.error("Error occured in execution queue, action: " + action + " Error: %s", e);
        }
        return result;
    }

    static add_pending_notification(execIds, report_result, username) {
        logger.info("Adding pending notification for user: " + username)
        if (!(username in this.executionInvoker.notification_dict)) {
            this.executionInvoker.notification_dict[username] = [];
        }
        this.executionInvoker.notification_dict[username].push(report_result)
        cache.set("pending_notification", this.executionInvoker.notification_dict)
    }


    /** 
        * @param {} batchExecutionData 
        * @param {} execIds
        * @param {dictionary} userInfo
        * @param {String} type
        * Adds normal / scheduling test suites to queue
        * Executes normal / scheduling test suites if the target ICE is in DND mode
    */
    static addTestSuiteToQueue = async (batchExecutionData, execIds, userInfo, type, poolid) => {
        let targetICE = EMPTYUSER;
        let projectid = "";
        let response = {}
        const steps = await utils.fetchData({'host':batchExecutionData.host,'executionData':batchExecutionData},"/hooks/validateExecutionSteps")
        if(steps.status == "fail") return {status:"fail",error:steps.message};
        response['status'] = "fail";
        response["message"] = "N/A"
        response['error'] = "None"
        try {
            //check if target ICE was specified or not
            if (userInfo && userInfo.icename && userInfo.icename != EMPTYUSER) {
                targetICE = userInfo.icename;
                var fnName = 'execAutomation';
                const storeInExecutionList =  await utils.fetchData({"executionData": batchExecutionData}, "devops/executionList", fnName);
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
                let iceStatus = this.ice_list[targetICE]
                let queueLenght = this.queue_list[iceStatus.poolid].execution_list.length
                //if ICE is connected and available execute directly if queue lenght is 0 or ice in dnd and owner is the invoker
                if (iceStatus.connected && !iceStatus.status && ((queueLenght == 0) || (this.ice_list[targetICE]["mode"] && userInfo.userid === userInfo.invokinguser))){               
                    if (type == "ACTIVE") {
                        this.executionInvoker.executeActiveTestSuite(batchExecutionData, execIds, userInfo, type);
                    } else {
                        this.executionInvoker.executeScheduleTestSuite(batchExecutionData, execIds, userInfo, type);
                    }
                    response['status'] = "pass";
                    response["message"] = "Execution Started on " + targetICE;
                    response['variant'] = "success"
                } else {
                    //get pool in which the target ICE present
                    let pool = this.queue_list[this.ice_list[targetICE]["poolid"]];
                    pool["execution_list"].push(testSuite);
                    //save execution queue to redis
                    await cache.set("execution_queue", this.queue_list);
                    logger.info("Adding Test Suite to Pool: " + pool['name'] + " to be Executed on ICE: " + targetICE);
                    //create response message
                    response['status'] = "pass";
                    if (this.ice_list[targetICE]["mode"] && userInfo.userid === userInfo.invokinguser && this.ice_list[targetICE]["status"]) {
                        response["message"] = "ICE busy, queuing execution" + "\nExecution queued on " + targetICE + "\nQueue Length: " + pool["execution_list"].length.toString();
                        response['variant'] = "info";
                    } else {
                        response["message"] = "Execution queued on " + targetICE + "\nQueue Length: " + pool["execution_list"].length.toString();
                        response['variant'] = "success";
                    }
                }

            } else if (poolid && poolid in this.queue_list) {
                //if target ICE was not specified fetch the appropriate pool and push
                pool = this.queue_list[poolid];
                pool["execution_list"].push(testSuite);
                await cache.set("execution_queue", this.queue_list);
                response['status'] = "pass";
                logger.info("Adding Test Suite to Pool: " + pool['name'] + " to be Executed on any availble ICE");
                response["message"] = "Execution queued on pool: " + pool["name"] + "\nQueue Length: " + pool["execution_list"].length.toString();
                response['variant'] = "success";
            } else {
                //check if target ice is connected but not preset in any pool, execute directly if true
                if (this.ice_list[targetICE] && this.ice_list[targetICE]["connected"]) {
                    // if (this.ice_list[targetICE]['status']) {
                    //     response["status"] = "pass";
                    //     response["message"] = "Execution or Termination already in progress on ICE: " + targetICE;
                    //     response['variant'] = "info";
                    //     if (type && type == "SCHEDULE"){
                    //         scheduler.updateScheduleStatus(batchExecutionData.scheduleId,'Skipped')
                    //     }
                    //     return response;
                    // }
                    if ((this.ice_list[targetICE]["mode"] && userInfo.userid === userInfo.invokinguser) || !this.ice_list[targetICE]["mode"]) {
                        if (type == "ACTIVE") {
                            this.executionInvoker.executeActiveTestSuite(batchExecutionData, execIds, userInfo, type);
                        } else {
                            this.executionInvoker.executeScheduleTestSuite(batchExecutionData, execIds, userInfo, type);
                        }
                        response["message"] = "Execution Started on " + targetICE;
                        response['variant'] = "success";
                    } else if (this.ice_list[targetICE]["mode"] && userInfo.userid != userInfo.invokinguser) {
                        response['variant'] = "info";
                        response["message"] = "ICE: " + targetICE + " is on DND mode, please disable from DND to proceed.";
                    }
                    response['status'] = "pass";
                } else if (targetICE && targetICE != EMPTYUSER) {
                    //the target ice is neither part of a pool nor is connected to server, queuing not possible
                    if (type && type == "SCHEDULE") {
                        scheduler.updateScheduleStatus(batchExecutionData.scheduleId,'Missed');
                    }
                    response['status'] = "pass";
                    response['variant'] = "error";
                    response["message"] = targetICE + " not connected to server and not part of any pool, connect ICE to server or add ICE to a pool to proceed."
                } else {
                    let executionRequest = '' 
                    if(batchExecutionData['configurekey'] && batchExecutionData['configurekey'] != '' && batchExecutionData['configurename'] && batchExecutionData['configurename'] != '' ){
                        if (batchExecutionData['scheduleId'] && batchExecutionData['scheduleId'] != '' && batchExecutionData['execType'] && batchExecutionData['execType'] != '') {
                            type = batchExecutionData['execType'];
                        }
                        executionRequest = await this.executionInvoker.executeActiveTestSuite(batchExecutionData, execIds, userInfo, type);
                        return executionRequest;
                    }

                    response['status'] = "pass";
                    response["message"] = "Avo Client not selected."
                    response['variant'] = "info";
                }
            }
        } catch (e) {
            response["error"] = "Error while adding test suite to queue";
            response['variant'] = "error";
            logger.error("Error in addTestSuiteToQueue. Error: %s", e);
        }

        return response;
    }

    static addAPITestSuiteToQueue = async (testSuiteRequest, res, headerUserInfo) => {
        let targetICE = EMPTYUSER;
        let request_pool_name = EMPTYUSER;
        let poolid = "";
        const hdrs = testSuiteRequest.headers;
        const batchExecutionData = testSuiteRequest.body.executionData;
        try {
            if (headerUserInfo) {
                //Check wether poolname or icename provided (Execution on pool name not supported in this implementation)
                var userInfo = await tokenAuth.tokenValidation(headerUserInfo);
                userInfo.invokinguser = userInfo.userid;
                userInfo.invokingusername = userInfo.username;
                userInfo.invokinguserrole = userInfo.role;
                if (userInfo.inputs.tokenValidation != "passed") {
                    res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['401']);
                    return res.status('401').send({"error": userInfo.inputs.error_message});
                } 
                delete userInfo.inputs.error_message;
                targetICE = headerUserInfo.icename || EMPTYUSER;
                userInfo.icename = targetICE;
                poolid = headerUserInfo.poolid;
            }
            if (!batchExecutionData) {
                res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES["400"])
                return res.status("400").send({ "error": "Empty or Invalid Batch Data" });
            }
            // Check if request came from Azure DevOps. If yes, then send the acknowledgement
            if (hdrs["user-agent"].startsWith("VSTS") && hdrs.planurl && hdrs.projectid) {
                res.setHeader(constants.X_EXECUTION_MESSAGE, "Request Recieved")
                res.status("200").send("Request Recieved");
            }
            let suiteRequest = { "executionData": testSuiteRequest.body.executionData, "headers": testSuiteRequest.headers, "resId": uuid()}
            let testSuite = { "testSuiteRequest": suiteRequest, "type": "API", "userInfo": userInfo }
            if(targetICE && targetICE != "" && targetICE != EMPTYUSER){
                //ice name sent and is not empty
                if (targetICE in this.ice_list && this.ice_list[targetICE]["poolid"] in this.queue_list) {
                    //ice set is part of pool
                    if (this.ice_list[targetICE]["mode"] && userInfo.owner && !this.ice_list[targetICE]["status"]) {
                        //ice sent is on DND and owned by the person and is free
                        testSuite['res'] = res;
                        this.executionInvoker.executeAPI(testSuite);
                    }else{
                        let pool = this.queue_list[this.ice_list[targetICE]["poolid"]];
                        pool["execution_list"].push(testSuite);
                        //save execution queue to redis
                        await cache.set("execution_queue", this.queue_list);
                        logger.info("Adding Test Suite to Pool: " + pool['name'] + " to be Executed on ICE: " + targetICE);
                        this.res_map[testSuite['resId']] = res;
                    }
                    
                } else if (this.ice_list[targetICE] && this.ice_list[targetICE]["connected"]) {
                    //ICE sent is not part of pool but is connected
                    if (this.ice_list[targetICE]['status']) {
                        // ICE is busy
                        res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['409'])
                        return res.status("409").send({ "error": "Execution or Termination already in progress on ICE: " + targetICE})
                    } else{
                        // ICE is Free
                        testSuite['res'] = res;
                        this.executionInvoker.executeAPI(testSuite);
                    }
                } else{
                    // ice sent is not part of pool and not connected to server
                    res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['461'])
                    return res.status("461").send({ "error": "Can't establish connection with ICE: " + targetICE });
                }
            } else if(poolid && poolid != ""){
                //ice name not sent, pool name sent
                let pool = this.queue_list[poolid];
                pool["execution_list"].push(testSuite);
                //save execution queue to redis
                await cache.set("execution_queue", this.queue_list);
                logger.info("Adding Test Suite to Pool: " + pool['name'] + " to be Executed on any ICE");
                this.res_map[testSuite['resId']] = res;
            } else if ((targetICE === EMPTYUSER || targetICE == "")  && (!poolid || poolid === "")) {
                //ice name not sent, pool name not sent
                res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['400'])
                return res.status("400").send({ "error": "ICE name and Pool Id not provided." })
            } else {
                //Unforseen use case
                res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES["500"])
                return res.status('500').send({ "error": "Error while adding test suite to queue" })
            }
        } catch (e) {
            logger.error("Error in addAPITestSuiteToQueue. Error: %s", e);
            res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES["500"])
            return res.status('500').send({ "error": "Error while adding test suite to queue" });
        }
        return;
    }

    /** 
    * @param {string} channel 
    * @param {dictionary} ice_data
    * Function responsible to update ICE status when it changes and execute a test suite from queue when required
    */
    static triggerExecution = async (ice_data) => {
        let data = JSON.parse(ice_data);
        let result = false;
        //check if the triggered request id for ice status change and check if the request is duplicate or not 
        //if (channel != "ICE_STATUS_" + data.username || data.onAction != 'ice_status_change' || data["reqID"] in this.request_ids) return result;
        let ice_name = data.username
        this.registred_ICE[ice_name] = true;
        //register this request so that dupliacte requests can be ignored
        this.request_ids[data["reqID"]] = 1;
        //check if target ice is in this.ice_list or not, refer init method of queues for contents this.ice_list
        if (!ice_name in this.ice_list) {
            return result;
        }
        if (!this.ice_list[ice_name]) this.ice_list[ice_name] = { "connected": true, "poolid": "", "_id": "" };
        //update ice mode and status in this.ice_list
        this.ice_list[ice_name]["mode"] = data.value.mode;
        this.ice_list[ice_name]["status"] = data.value.status;
        //check if socket connection is available or not
        //if ice is busy or not connected return 
        let poolid = this.ice_list[ice_name]["poolid"];
        if (!poolid) {
            logger.debug(ice_name + " does not belong to any pool.")
            return;
        }
        if (!this.queue_list[poolid]){
            this.ice_list[ice_name]["poolid"] = ''
            return
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
                if (data.value.mode && ((testSuite.userInfo.userid != testSuite.userInfo.invokinguser) || (testSuite.userInfo.owner != null && !testSuite.userInfo.owner))) {
                    logger.debug("ICE:" + ice_name + " on DND mode, can not execute.")
                    return result;
                }
                //commence execution
                logger.info("Sending Execution Request to: " + ice_name + " queue lenght for poolid: " + poolid.toString() + " is: " + queue.length);
                try {
                    switch (testSuite.type) {
                        case 'ACTIVE':
                            this.executionInvoker.executeActiveTestSuite(testSuite.batchExecutionData, testSuite.execIds, testSuite.userInfo, testSuite.type)
                            break;
                        case 'API':
                            testSuite['res'] = this.res_map[testSuite['resId']];
                            delete this.res_map[testSuite['resId']];
                            this.executionInvoker.executeAPI(testSuite);
                            break;
                        case 'SCHEDULE':
                            this.executionInvoker.executeScheduleTestSuite(testSuite.batchExecutionData, testSuite.execIds, testSuite.userInfo, testSuite.type);
                            break;
                    }
                    //remove execution from queue
                    queue.splice(i, 1);
                    logger.debug("Removing Test Suite from queue");
                    cache.set("execution_queue", this.queue_list);
                } catch (e) {
                    if (testSuite.type == "API"){
                        let res = this.res_map[testSuite['resId']];
                        delete this.res_map[testSuite['resId']];
                        res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['500']);
                        return res.status['500'].send({'error':'Internal Server Error'})
                    }
                    logger.error("Error in triggerExecution.");
                    logger.debug("Error in triggerExecution. Error: %s", e);
                }
                break;
            }
        }
        return result;
    }
    /** 
    * @param {dictionary} inputs (which pools to fetch and update)
    * Function responsible to setup/update pool variables in execution queue (queue_list)
    */
    static async setUpPool(inputs) {
        const fnName = "setUpPool"
        try {
            //get existing queue from redis
            this.queue_list = await cache.get("execution_queue");
            this.executionInvoker.notification_dict = await cache.get("pending_notification");
            //if queue not present in redis initialize a new queue
            if (!this.executionInvoker.notification_dict) this.executionInvoker.notification_dict = {}
            if (!this.queue_list) this.queue_list = {}
            //get all the pools from DB, iterate and add to queue
            var pools = await utils.fetchData(inputs, "admin/getPools", fnName);
            for (let index in pools) {
                let pool = pools[index]
                let poolid = pool["_id"];
                //check if pool already present in queue
                if (!(poolid in this.queue_list)) {
                    this.queue_list[poolid] = {};
                }
                if (!(pool['poolname'] in this.poolname_ice_map)) this.poolname_ice_map[pool['poolname']] = {}
                //Except the ID all other fields of pool can be updated hence re initialise are pool variables
                this.queue_list[poolid]["name"] = pool["poolname"];
                //Map projects to poolid key == projecid value = poolid
                this.project_list = this.setUpProjectList(pool["projectids"], poolid);
                this.queue_list[poolid]["ice_list"] = pool["ice_list"];
                //Map ice to pool key = ICE_name value = {poolid,mode,status,connected,_id}
                this.ice_list = this.setUpICEList(pool["ice_list"], poolid);
                this.poolname_ice_map[pool['poolname']] = pool["ice_list"]
                //Initialise execution queue for pool if it dosent exist
                if (!this.queue_list[poolid]["execution_list"]) {
                    this.queue_list[poolid]["execution_list"] = []
                }
            }
            //Redundant code, DO NOT EDIT, checks if a pool has been deleted from DB but still persists in Redis, deletes such pools if found
            //This code blocks triggers only if "all" the pools were fetched
            if (inputs["poolid"] === "all" && Array.isArray(pools)) {
                for (let index in this.queue_list) {
                    if (!(index in pools)) {
                        delete this.queue_list[index]
                    }
                }
            }
            //Store queue to redis 
            cache.set("execution_queue", this.queue_list);
        } catch (exception) {
            logger.error("Error in setUpPool. Error: %s", exception);
        }
    }
    /** 
    * @param {string} poolid
    * @param {list} projectids
    * Function responsible to map projectids with poolid for O(1) searching
    */
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
    /** 
    * @param {string} poolid
    * @param {dictionary} list_of_ICE
    * Function responsible to map ice with pool and status data 
    */
    static setUpICEList(list, poolid) {
        if (!list || !poolid) {
            return this.ice_list;
        }
        //Iterate over all the ICE in a pool
        for (let ice in list) {
            let ice_name = list[ice]["icename"];
            //If ICE name not in ICE pool mapping, add a new ice and intialise values
            //If ICE is in ICE pool mapping, just change the pool id to current pool and add ice id for good measure (un allocated ice are in ice poolmapping without a poolid and ice id)
            if (this.ice_list[ice_name]) {
                this.ice_list[ice_name]["poolid"] = poolid;
                this.ice_list[ice_name]["_id"] = list[ice]["_id"];
            }
            else this.ice_list[ice_name] = { "poolid": poolid, "mode": false, "status": false, "connected": false, "_id": list[ice]["_id"] };
        }
        //Redundant code DO NOT EDIT, check if there are ice in the map which used to belong to this pool but have been removed and deletes these ICE
        for (let ice in this.ice_list) {
            if (this.ice_list[ice]["poolid"] === poolid) {
                if (!(this.ice_list[ice]['_id'] in list)) {
                    this.ice_list[ice]['poolid'] = "";
                }
            }
        }
        return this.ice_list;
    }

    /** 
    * @param {string} ice_name
    * Function responsible to connect unallocated ice and add to ice - pool/status data map
    */
    static async connect_ice(ice_name) {
        //Add unallocated ICE to ice pool mapping (the pool id and ice id will be blank for such ICE)
        this.queue_list = await cache.get("execution_queue")
        this.ice_list[ice_name] = { "connected": true, "status": true, "mode": false, "poolid": "", "_id": "" };
    }

    static checkForCompletion = (configureKey,executionListId) => {
        const timestamp = Date.parse(new Date);
        return new Promise((rsv,rej) => {
            const configureTime = 1000,response = false;
            try{
                const startChecking = setInterval(()=> {
                let executionCompleted = true;

                if(configureKey in this.key_list) {
                    for(let executionQueues of this.key_list[configureKey]){
                        if(executionQueues[0]['executionListId'] == executionListId){
                            executionCompleted = false;
                        }
                    }
                }
                if(executionCompleted) {
                    clearInterval(startChecking);
                    rsv(true);
                }
            },configureTime);
    
        } catch (error) {
            console.info(error);
            logger.error("Error in execAutomation. Error: %s", error);
            rej(false);
        }
        })
    }
    //if avogridid present add an array of agents or directly agent specified add that.
    static execAutomation = async (req, res) => {
        var fnName = 'execAutomation';
        let response = {};
        let synchronousFlag = false;
        let execType = 'moduleParallel'
        response['status'] = "fail";
        response["message"] = "N/A";
        response['error'] = "None";
        try {

        // New IMPLementation. - genrates executionRequest when Ice-client asks for it.
        const inputs = {
            'key': req.body.key,
            'query': 'fetchExecutionData'
        }
        const executionData = await utils.fetchData(inputs, "devops/configurekey", fnName);

        //Checking for "executiontype" in the request
        if("executionType" in req.body) {
            executionData.executionData.executiontype = req.body.executionType;
        }

        // check for execType is scheduling or not
        if ('execType' in req.body && 'scheduleId' in req.body) {
            executionData.executionData.execType = req.body.execType;
            executionData.executionData.scheduleId = req.body.scheduleId;
            response["message"] = "Execution will be started on " + executionData.executionData.avoagents[0];
        }

        // Checking for executionLevel 
        if(executionData.executionData.execType) {
            execType = 'scenarioParallel'
        }
        const newExecutionListId = uuidV4()
        executionData['executionData']['executionListId'] = newExecutionListId;
        executionData['executionData']['executionThrough'] = req.body.executionThrough || "Pipeline";
        const gettingTestSuiteIds = await suitFunctions.ExecuteTestSuite_ICE({
            'body': executionData,
            'session':executionData.session,
            'query':'fetchingTestSuiteIds'
        });

        //Storing the data in executionlist
        const storeInExecutionList =  await utils.fetchData(gettingTestSuiteIds, "devops/executionList", fnName);

        //To get the data from cache if key list is empty
        if(this.key_list && Object.keys(this.key_list).length === 0 && Object.getPrototypeOf(this.key_list) === Object.prototype) {
            //check whether cache data is present
            // let cacheData = await cache.get('execution_list')
            
            //New Cache Implementation - deviding into clients
            let cacheData = await executionListCache.gethmap(req.hostname)
            if(cacheData === null || Object.keys(cacheData).length === 0 && cacheData.constructor === Object) {
                this.key_list = {};
            } else {
                this.key_list = JSON.parse(cacheData['execution_list']);
            }
        }
        if(!(req.body.key in this.key_list))
            this.key_list[req.body.key] = [];

        let keyQueue = this.key_list[req.body.key];
        let testSuiteInfo = gettingTestSuiteIds.executionData.batchInfo;

        let newExecutionList = []
        for (let ids of testSuiteInfo){
            if(execType == 'scenarioParallel') {
                for (let scId of ids.suiteDetails) {
                    newExecutionList.push({
                        executionListId:newExecutionListId,
                        configurename: gettingTestSuiteIds.executionData.configurename,
                        modulename:ids.testsuiteName,
                        moduleid:ids.testsuiteId,status: 'QUEUED',
                        avoagentList:gettingTestSuiteIds.executionData.avoagents,
                        startTime: new Date().toLocaleString(),
                        isExecuteNow: req.body.isExecuteNow,
                        scenarioIds:scId.scenarioId,
                        scenarioName:scId.scenarioName,
                        execType:execType
                    });
                }
            } else {
                newExecutionList.push({
                    executionListId:newExecutionListId,
                    configurename: gettingTestSuiteIds.executionData.configurename,
                    modulename:ids.testsuiteName,
                    moduleid:ids.testsuiteId,status: 'QUEUED',
                    avoagentList:gettingTestSuiteIds.executionData.avoagents,
                    startTime: new Date().toLocaleString(),
                    isExecuteNow: req.body.isExecuteNow
                });
            }
        }

        keyQueue.push(newExecutionList);

        // Update the execution_list
        // await cache.set("execution_list", this.key_list);

        // New cache implementation - Dividing into clients
        await executionListCache.sethmap("execution_list", this.key_list,req.hostname);

        // let execution_Queue = await cache.get('execution_list');

        //Adding the reportLink in the response
        response['reportLink'] = req.protocol + "://" + (req.hostname) + "/devOpsReport?" + "configurekey=" + req.body.key + "&" + "executionListId="+newExecutionListId
        
        // Adding the Running Status Link in the response 
        response['runningStatusLink'] = req.protocol + "://" + (req.hostname) + "/runningStatus?" + "configurekey=" + req.body.key + "&" + "executionListId="+newExecutionListId
        if(gettingTestSuiteIds.executionData.executiontype == 'asynchronous'){
            response['status'] = "pass";
            return response;
        }
        synchronousFlag = await this.checkForCompletion(req.body.key,gettingTestSuiteIds.executionData.executionListId);

        let synchronous_report = await cache.get('synchronous_report');
        // console.log(synchronous_report);
        //Below code is to generate synchronous report.
        let responseFromGetReportApi = [];
        for(let executions of synchronous_report[newExecutionListId]) {
            const data = await reportFunctions.getDevopsReport_API({
                'body':executions,
                'req': req
            });
            responseFromGetReportApi.push(data);
        }
        // Deleting the cacheData once that execution is completed 
        delete synchronous_report[newExecutionListId]
        await cache.set('synchronous_report',synchronous_report)

        if(synchronousFlag) response['status'] = responseFromGetReportApi;
        } catch (error) {
            console.info(error);
            logger.error("Error in execAutomation. Error: %s", error);
        }

        return response;
    }

    static getAgentTask = async (req, res) => {
        var fnName = 'getAgentTask';
        let response = {
            'status': 'fail',
            'message': "N/A",
            'error': "None",
            'tasktype': "EXECUTE",
            'maxicecount': "1",
            'key': "",
            'executionListId': '',
            'screenshotpath': screenshotpath.screenShotPath
        };

        try {
            let agent = req.body.Hostname;
            
            //Add agent in the agent Collection and fetch its status
            let agentDetails = {
                Hostname: agent,
                "icecount": 1,
                createdon: new Date().toLocaleString(),
                status: "inactive",
                recentCall: new Date().toLocaleString(),
                //updated to use icecount value from agent
                currentIceCount: 'icecount' in req.body ? req.body.icecount : 0
            }
            const agentStatus = await utils.fetchData(agentDetails, "devops/agentDetails", fnName);
            //Update the maxicecount for the agent
            response['maxicecount'] = agentStatus['icecount']

            // To fetch the data from cache if key_list is empty
            if(this.key_list && Object.keys(this.key_list).length === 0 && Object.getPrototypeOf(this.key_list) === Object.prototype) {
                //check whether cache data is present
                // let cacheData = await cache.get('execution_list')

                //New Cache Implementation - dividing into clients
                let cacheData = await executionListCache.gethmap(req.hostname)
                if(cacheData === null || Object.keys(cacheData).length === 0 && cacheData.constructor === Object) {
                    this.key_list = {};
                } else {
                    this.key_list = JSON.parse(cacheData['execution_list']);
                }
            }
            if(agentStatus['status'] != 'inactive') {
                let executionList = this.key_list;
                for(let [key, value] of Object.entries(executionList)){
                    let executionQueue = value;
                    for(let entries of executionQueue) {
                        let checkForAgentName = (entries[0]['avoagentList'] instanceof Array ? entries[0]['avoagentList'].length == 0 || entries[0]['avoagentList'].includes(agent) : 
                        agent in entries[0]['avoagentList'])

                        if(checkForAgentName){
                            for(let testSuites of entries) {
                                if(testSuites['status'] == 'QUEUED') {
                                    response['status'] = 'Pass';
                                    response['key'] = key;
                                    response['executionListId'] = testSuites['executionListId'];
                                    // response['maxicecount'] = agentStatus['icecount'];
                                    response['maxicecount'] = (entries[0]['avoagentList'] instanceof Array ? agentStatus['icecount'] : entries[0]['avoagentList'][agent]);
                                    return response;
                                }
                            }
                        }
                    }
                }

            }

            //TO-DO set Agent Status..

        } catch (error) {
            console.info(error);
            logger.error("Error in getAgentTask. Error: %s", error);
        }

        return response;
    }

    static getExecScenario = async (req, res) => {
        var fnName = 'getExecScenario';
        let response = {};
        response['status'] = "fail";
        response["message"] = "N/A";
        response['error'] = "None";
        try {
            const configKey = req.body.configkey;
            const agentName = 'agentName' in req.body ? req.body.agentName : '';
            const executionListId = req.body.executionListId;

            // To store the data from cache if key_list is empty
            if(this.key_list && Object.keys(this.key_list).length === 0 && Object.getPrototypeOf(this.key_list) === Object.prototype) {
                //check whether cache data is present
                // let cacheData = await cache.get('execution_list')
                //New Cache Implementation - dividing into clients
                let cacheData = await executionListCache.gethmap(req.hostname)
                if(cacheData === null || Object.keys(cacheData).length === 0 && cacheData.constructor === Object) {
                    this.key_list = {};
                } else {
                    this.key_list = JSON.parse(cacheData['execution_list']);
                }
            }
            if(configKey in this.key_list) {

                const executionQueue = this.key_list[configKey];
                let executionData = '';
                let listIndex = -1,executionId = '',batchId = '';
                for(let entries of executionQueue) {
                    listIndex++;
                    if(entries[0]['executionListId'] == executionListId) {
                        let moduleIndex = -1,scenarioIndex = -1, currModuleId = '';
                        for(let testSuites of entries) {
                            moduleIndex++;
                            if (testSuites['execType'] == 'scenarioParallel' && testSuites.moduleid != currModuleId) {
                                scenarioIndex = -1;
                                currModuleId = testSuites.moduleid;
                                executionId = 'executionId' in this.key_list[configKey][listIndex][moduleIndex] ? this.key_list[configKey][listIndex][moduleIndex]['executionId'] : ''
                                batchId = 'batchId' in this.key_list[configKey][listIndex][moduleIndex] ? this.key_list[configKey][listIndex][moduleIndex]['batchId'] : ''
                            }
                            scenarioIndex++;
                            if(testSuites['status'] == 'QUEUED') {
                                this.key_list[configKey][listIndex][moduleIndex]['status'] = 'IN_PROGRESS'
                                const inputs = {'key':configKey,'agentName':agentName,'testSuiteId':testSuites.moduleid,'executionListId':testSuites['executionListId']}
                                // changes to support scenarioParallel to include scenarioindex in input
                                if (testSuites['execType'] == 'scenarioParallel'){
                                    inputs['scenarioIndex'] = scenarioIndex;
                                }
                                executionData = await utils.fetchData(inputs, "devops/getExecScenario", fnName);
                                executionData[0]['executionData']['executingOn'] = "Agent"
                                // changes to support scenarioParallel
                                if (testSuites['execType'] == 'scenarioParallel'){
                                    executionData[0]['executionData']['scenarioParallelExec'] = true;
                                    if(executionId != '') {
                                        executionData[0]['executionData']['scenarioParallelExecutionId'] = executionId;
                                        executionData[0]['executionData']['scenarioParallelBatchId'] = batchId;
                                    }
                                }
                                // const executionRequest = await suitFunctions.ExecuteTestSuite_ICE({
                                //     'body': executionData[0],
                                //     'session':executionData[0].session,
                                //     'req':req
                                // });
                                let updatedReq = {};
                                updatedReq = {...req};
                                updatedReq['body'] = executionData[0];
                                updatedReq['session'] = executionData[0].session;
                                const executionRequest = await suitFunctions.ExecuteTestSuite_ICE(updatedReq);
                                if (executionData == "fail" || executionData == "forbidden") {
                                    response['status'] = "fail";
                                    return response;
                                }
                                executionData = [executionRequest];
                                // to support scenaratioParallel execution
                                if (testSuites['execType'] == 'scenarioParallel'){
                                    executionData[0]['executionRequest']['scenarioParallelExec'] = true;
                                    if (scenarioIndex == 0) {
                                        executionId = executionRequest.executionRequest.executionIds[0];
                                        batchId = executionRequest.executionRequest.batchId
                                        this.key_list[configKey][listIndex][moduleIndex]['executionId'] = executionId;
                                        this.key_list[configKey][listIndex][moduleIndex]['batchId'] = batchId;
                                    }
                                }

                                //Updating the status to IN_Progress
                                // Old cache Implementation
                                // await cache.set("execution_list", this.key_list);

                                // New cache implementation - Dividing into clients
                                await executionListCache.sethmap("execution_list", this.key_list,req.hostname);
                                break;
                            }
                        }
                        if(executionData != '') break;
                    }
                }

                if(executionData != '')
                    response['status'] = executionData;

            }
            // response['status'] = "fail";
        } catch (error) {
            console.info(error);
            logger.error("Error in getExecScenario. Error: %s", error);
        }
        
        return response;
    }
    // static insertReport = async (executionid, scenarioId, browserType, userInfo, reportData) => {
    //     const inputs = {
    //         "executionid": executionid,
    //         "testscenarioid": scenarioId,
    //         "browser": browserType,
    //         "status": reportData.overallstatus.overallstatus,
    //         "overallstatus": reportData.overallstatus,
    //         "report": JSON.stringify(reportData),
    //         "modifiedby": userInfo.invokinguser,
    //         "modifiedbyrole": userInfo.invokinguserrole,
    //         // "configkey": configkey,
    //         // "executionListId": executionListId,
    //         "query": "insertreportquery"
    //     };
    //     const result = utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", "insertReport");
    //     return result;
    // };
    static setExecStatus = async (req, res) => {
        let fnName = 'setExecStatus'
        try {
            let dataFromIce = req.body,checkInCache = false;
            let resultData = 'exce_data' in dataFromIce ? dataFromIce.exce_data : dataFromIce;

            // set host in dataFromIce
            dataFromIce["hostName"] = req.headers.host;
            
            // To store the data from cache if key list is empty.
            if(this.key_list && Object.keys(this.key_list).length === 0 && Object.getPrototypeOf(this.key_list) === Object.prototype) {
                //check whether cache data is present
                // let cacheData = await cache.get('execution_list')

                //New Cache Implementation - deviding into clients
                let cacheData = await executionListCache.gethmap(req.hostname)
                if(cacheData === null || Object.keys(cacheData).length === 0 && cacheData.constructor === Object) {
                    this.key_list = {};
                } else {
                    this.key_list = JSON.parse(cacheData['execution_list']);
                }
            }
            let keyQueue = this.key_list[resultData.configkey] || [];
            // console.log(keyQueue);
            let statusCount = 0;
            let updatedKeyQueue = [];
            if (dataFromIce.status == 'finished')
            {
                //Changing the status to completed in the cache.
                let listIndex = -1;
                for(let executionList of keyQueue) {
                    listIndex++;
                    
                    if(executionList[0]['executionListId'] == resultData.executionListId)
                    {
                        checkInCache = true;
                        let moduleIndex = -1;
                        for (let testSuite of executionList){
                            moduleIndex++;
                            let checkForScenarioParallel = true
                            if(testSuite.execType == 'scenarioParallel' && testSuite.scenarioIds != resultData.execReq.suitedetails[0].scenarioIds[0]){
                                checkForScenarioParallel = false
                            }
                            if(checkForScenarioParallel && testSuite.moduleid == resultData.testsuiteId){
                                this.key_list[resultData.configkey][listIndex][moduleIndex]['status'] = 'COMPLETED';
                                this.key_list[resultData.configkey][listIndex][moduleIndex]['executionId'] = resultData.executionId;

                                // check all the execution are completed for a configkey in cache
                                const dataFromCache = this.key_list[resultData.configkey][listIndex];
                                const isCompleted = dataFromCache.map((executionListItem) => {
                                    return executionListItem.status === "COMPLETED"
                                })
                                const isAllExecutionCompleted = isCompleted.every((element) => element === true);
                                if (isAllExecutionCompleted === true) {
                                    // call the API to get the data and prepare the data from report
                                    const fnName = "getExecutionListDetails";
                                    const inputs = {
                                        "executionListId": this.key_list[resultData.configkey][listIndex][moduleIndex]['executionListId'],
                                        "key": resultData.configkey
                                    };
                                    const dataFromCache = this.key_list[resultData.configkey][listIndex];
                                    const executionData = await utils.fetchData(inputs, "devops/getExecutionListDetails", fnName);

                                    const excutionIds = dataFromCache.map((data) => data.executionId);
                                    console.log(excutionIds)
                                    const fnName1 = "reportStatusScenario";
                                    const inputs1 = {
                                        "query": "executiondetails",
                                        "executionId": excutionIds
                                    };
                                    const statusList = await utils.fetchData(inputs1, "reports/reportStatusScenario", fnName1);

                                    const reportExecutionData = {};
                                    reportExecutionData.reportData = [];
                                    executionData[0].executionData.batchInfo.forEach((suiteDetails, index) => {
                                        const suiteDetailsInfo = [];
                                        suiteDetails.suiteDetails.forEach((scenarioName, suiteIndex) => {
                                            const reportData = {
                                                reportId: statusList[index][suiteIndex]["reportId"],
                                                scenarioName: scenarioName.scenarioName,
                                                testsuiteName: suiteDetails.testsuiteName,
                                                status: statusList[index][suiteIndex]["status"],
                                                projectName: suiteDetails.projectName,
                                                cycleName: suiteDetails.cycleName,
                                                releaseId: suiteDetails.releaseId,
                                                timeEllapsed: statusList[index][suiteIndex]["timeEllapsed"]
                                            }
                                            suiteDetailsInfo.push(reportData);
                                        })
                                        reportExecutionData.reportData.push({ suiteDetails: suiteDetailsInfo });
                                    })
                                    if (executionData[0].executionData.isEmailNotificationEnabled === true) {
                                        notifications.notify("reportOnCICDExecution", { reportExecutionData, recieverEmailAddress: executionData[0].executionData.emailNotificationReciever, profileName: executionData[0].executionData.configurename, configKey: executionData[0].executionData.configurekey, executionThrough: executionData[0].executionData.executionThrough, hostName: req.headers.host });
                                    }
                                }
                                
                                //Adding details for synchronous report
                                if(resultData.execReq.executiontype != 'asynchronous') {
                                    if(!(resultData['executionListId'] in this.synchronous_execution_report))
                                        this.synchronous_execution_report[[resultData['executionListId']]] = [];

                                    this.synchronous_execution_report[resultData['executionListId']].push({
                                        "execution_data": {
                                            "executionId": resultData.executionId,
                                            "scenarioIds": resultData.execReq.suitedetails[0].scenarioIds
                                        }
                                    })
                                    await cache.set("synchronous_report", this.synchronous_execution_report);
                                    let synchronous_report = await cache.get('synchronous_report');
                                    console.log(synchronous_report);
                                }

                                // Old cache implementation
                                // await cache.set("execution_list", this.key_list);
                                
                                // New cache implementation - Dividing into clients
                                await executionListCache.sethmap("execution_list", this.key_list,req.hostname);

                            }
                            statusCount+=(testSuite.status == 'COMPLETED');
                            if(statusCount == executionList.length) {
                                statusCount = -1;
                            }
                        }
                    } else {
                        updatedKeyQueue.push(executionList);
                    }
                }
                //To delete the execution from the cache
                // if(statusCount == -1){
                //     this.key_list[resultData.configkey] = updatedKeyQueue
                //     await cache.set("execution_list", this.key_list);
                // }

                //User Manually deleted from cache
                if(!checkInCache) {
                    dataFromIce.executionStatus = false;
                }
            }
            //To check whether executionListId present in cache data.
            for(let execution of keyQueue) {
                if(execution[0].executionListId == resultData.executionListId) {
                    // newConfigureKeyExecution.push(execution);
                    checkInCache = true
                }
            }

            if(!checkInCache && 'reportData' in resultData && 'overallstatus' in resultData.reportData) {
                resultData.reportData.overallstatus.overallstatus = 'Terminated';
            }
            let responseFromExecutionInvoker =  await this.executionInvoker.setExecStatus(dataFromIce);

            // To delete the list from the cache
            if(statusCount == -1 && dataFromIce.status == 'finished'){
                this.key_list[resultData.configkey] = updatedKeyQueue
                // Old cache implementation
                // await cache.set("execution_list", this.key_list);
                
                // New cache implementation - Dividing into clients
                await executionListCache.sethmap("execution_list", this.key_list,req.hostname);
            }
            if(dataFromIce.event == 'result_executeTestSuite' && dataFromIce.status) {
                //Check if profile is being executed using the execute now button.
                // and that can be deducted using the projectname + configure kye as the configurename
                if(dataFromIce.exce_data.execReq.suitedetails[0].projectname+'_'+dataFromIce.exce_data.execReq.configurekey == dataFromIce.exce_data.execReq.configurename){
                    // await deleteConfigureKey(dataFromIce.exce_data.execReq.configurekey);
                    const inputs = {
                        "key": dataFromIce.exce_data.execReq.configurekey,
                        "query": "deleteConfigureKey"
                    };
                    const status = await utils.fetchData(inputs, "devops/deleteConfigureKey", fnName);
                }
            }

            return responseFromExecutionInvoker;

        } catch (error) {
            console.info(error);
            logger.error("Error in setExecStatus. Error: %s", error);
            return 'fail';
        }

    }


    static getQueueState = async (req, res) => {
        let fnName = 'getQueueState'
        let response = {}
        try{
            //to add the keylist if its empty,, from the cache
            if(this.key_list && Object.keys(this.key_list).length === 0 && Object.getPrototypeOf(this.key_list) === Object.prototype) {
                //check whether cache data is present
                // let cacheData = await cache.get('execution_list')

                //New Cache Implementation - deviding into clients
                let cacheData = await executionListCache.gethmap(req.hostname)
                if(cacheData === null || Object.keys(cacheData).length === 0 && cacheData.constructor === Object) {
                    this.key_list = {};
                } else {
                    this.key_list = JSON.parse(cacheData['execution_list']);
                }
            }

            for(let configKeys in this.key_list) {
                if(this.key_list[configKeys].length && this.key_list[configKeys][0].length && this.key_list[configKeys][0][0]['isExecuteNow'] != true){
                    response[configKeys] = this.key_list[configKeys]
                }
            }
        } catch (error) {
                console.info(error);
                logger.error("Error in getQueueState. Error: %s", error);
                return 'fail';
        }

        return response;
    }

    static deleteExecutionListId = async (req, res) => {
        var fnName = 'deleteExecutionListId';
        let response = {};
        let synchronousFlag = false;
        response['status'] = "fail";
        response["message"] = "N/A";
        response['error'] = "None";
        try {

            const configurekey = req.body.configurekey;
            const executionListId = req.body.executionListId;

            //to add the key list if its empty,, from the cache
            if(this.key_list && Object.keys(this.key_list).length === 0 && Object.getPrototypeOf(this.key_list) === Object.prototype) {
                //check whether cache data is present
                // let cacheData = await cache.get('execution_list')
                
                //New Cache Implementation - deviding into clients
                let cacheData = await executionListCache.gethmap(req.hostname)
                if(cacheData === null || Object.keys(cacheData).length === 0 && cacheData.constructor === Object) {
                    this.key_list = {};
                } else {
                    this.key_list = JSON.parse(cacheData['execution_list']);
                }
            }
            const configureKeyExecution = configurekey in this.key_list ? this.key_list[configurekey] : [];
            let newConfigureKeyExecution = [];
            for(let execution of configureKeyExecution) {
                if(execution[0].executionListId != executionListId) {
                    newConfigureKeyExecution.push(execution);
                }
            }
            this.key_list[configurekey] = newConfigureKeyExecution;
            if(newConfigureKeyExecution.length === 0)
                delete this.key_list[configurekey]



            // await cache.set("execution_list", this.key_list);
            // New cache implementation - Dividing into clients
            await executionListCache.sethmap("execution_list", this.key_list,req.hostname);
            response['status'] = 'pass';
            console.log(this.key_list);
            return response;

        } catch (error) {
            console.info(error);
            logger.error("Error in deleteExecutionListId. Error: %s", error);
        }

        return response;
    }

    
    static runningStatus = async(req, res)=>{
        let fnName = 'runningStatus'
        let response = {}
        try {
            //to add the key list if its empty,, from the cache
            if(this.key_list && Object.keys(this.key_list).length === 0 && Object.getPrototypeOf(this.key_list) === Object.prototype) {
                //check whether cache data is present
                // let cacheData = await cache.get('execution_list')
                
                //New Cache Implementation - deviding into clients
                let cacheData = await executionListCache.gethmap(req.hostname)
                if(cacheData === null || Object.keys(cacheData).length === 0 && cacheData.constructor === Object) {
                    this.key_list = {};
                } else {
                    this.key_list = JSON.parse(cacheData['execution_list']);
                }
            }
            let configureKey = req.query.configurekey,executionListId = req.query.executionListId;

            if(this.key_list[configureKey]) {
                let cnt = 0,total = 0,ip = 0;
                for(let executions of this.key_list[configureKey]) {
                        if(executions.length && executions[0]['executionListId'] == executionListId)
                            {
                                total = executions.length;
                                for(let modules of executions) {
                                    cnt+=(modules['status'] == 'COMPLETED');
                                    ip+=(modules['status'] == 'IN_PROGRESS');
                                }
                            }
                }
                if(total){
                    response['Completed'] = `${cnt} / ${total}` ;response['status'] = 'Inprogress';
                    return response;
                }
                else {
                    // Generate Report
                    let inputs = {
                        'configureKey':configureKey,
                        'executionListId': executionListId
                    }
                    let executionIds = await utils.fetchData(inputs, "devops/getExecutionAndScenarioDetails", fnName)
                    let responseFromGetReportApi = {};
                    responseFromGetReportApi['Modules'] = [];
                    responseFromGetReportApi['status'] = 'Completed';
                    for(let executions of executionIds) {
                        const data = await reportFunctions.getDevopsReport_API({
                            'body':executions,
                            'req': req
                        });
                        responseFromGetReportApi['Modules'].push(data);
                    }
                    if(req.query.eventType && req.query.eventType === "CALM"){
                        return responseFromGetReportApi;
                    }
                    res.send(responseFromGetReportApi)
                }
            } else {
                if(req.query.eventType && req.query.eventType === "CALM"){
                    return 'Some Error Occured';
                }
                res.send('Some Error Occured');
            }

        } catch (error) {
            logger.error("Error occurred in runningStatus: "+error)
            if(req.query.eventType && req.query.eventType === "CALM"){
                return error;
            }
            return res.send("fail")
        }
    }
}

