const utils = require('../utils');
var uuid = require('uuid-random');
const redisServer = require('../redisSocketHandler');
const cache = require("../cache.js").getClient(2);
var logger = require('../../../logger.js');
const EMPTYUSER = process.env.nulluser;
var testSuiteInvoker = require('../execution/executionInvoker')
const constants = require('./executionConstants');
const tokenAuth = require('../tokenAuth')
const scheduler = require('./scheduler');
const { default: async } = require('async');
const { timestamp } = require('winston/lib/winston/common');
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
    static task_list = []
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
        //check if callback for ICE has already been registred
        if (!(ice_name in this.registred_ICE)) {
            logger.info("Registering execution call back for ICE: " + ice_name);
            redisServer.redisSubServer.subscribe('ICE_STATUS_' + ice_name);
            redisServer.redisSubServer.on("message", this.triggerExecution);
            this.registred_ICE[ice_name] = true;
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
                    const sockmode = await utils.channelStatus(targetICE);
                    if ((!sockmode.normal && !sockmode.schedule)) {
                        response["status"] = "pass";
                        response["message"] = "Can't establish connection with ICE: " + targetICE + " Re-Connect to server!";
                        response['variant'] = "error";
                        return response;
                    }
                    if (this.ice_list[targetICE]['status']) {
                        response["status"] = "pass";
                        response["message"] = "Execution or Termination already in progress on ICE: " + targetICE;
                        response['variant'] = "info";
                        if (type && type == "SCHEDULE"){
                            scheduler.updateScheduleStatus(batchExecutionData.scheduleId,'Skipped')
                        }
                        return response;
                    }
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
                    response['status'] = "pass";
                    response['variant'] = "error";
                    response["message"] = targetICE + " not connected to server and not part of any pool, connect ICE to server or add ICE to a pool to proceed."
                } else {
                    response['status'] = "pass";
                    response["message"] = "ICE not selected."
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
                    const sockmode = await utils.channelStatus(targetICE);
                    if ((!sockmode.normal && !sockmode.schedule)) {
                        // ICE is not available
                        res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['461'])
                        return res.status("461").send({ "error": "Can't establish connection with ICE Re-Connect to server!" })
                    }
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
            const sockmode = await utils.channelStatus(ice_name);
            if (data.value.status || (!sockmode.normal && !sockmode.schedule)) {
                // TODO shift below queue check
                logger.info("Could not execute on: " + ice_name + " ICE is either Executing a test suite or Server not connected to ice");
                return result;
            }
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

    //if avogridid present add an array of agents or directly agent specified add that.
    static execAutomation = async (req, res) => {
        var fnName = 'execAutomation';
        let response = {};
        response['status'] = "fail";
        response["message"] = "N/A";
        response['error'] = "None";
        try {
            //TO-DO Apply a check whether such key exists or not.

            if(!(req.body.key in this.key_list))
                this.key_list[req.body.key] = [];

            let keyQueue = this.key_list[req.body.key];
            // testSuiteInfo = await utils.fetchData(key,'/',);
            let Info = await utils.fetchData(req.body, "devops/getTestSuite", fnName);
            let testSuiteInfo = Info.testSuiteInfo;
            let avogridid = Info.avogridid;
            console.info(testSuiteInfo);

            for (let ids of testSuiteInfo)
                keyQueue.push({moduleid:ids,status: 'QUEUED'});

            // this.key_list = [];
            await cache.set("execution_list", this.key_list);
            let execution_Queue = await cache.get('execution_list');
            console.info(execution_Queue);

            //Fetching the Agents for Task List
            // let taskList = this.task_list;
            // // testSuiteInfo = await utils.fetchData(key,'/',);
            // //TO-DO Apply check whether directly agent is mentioned.
            // let agents = await utils.fetchData({'avogridid':avogridid}, "devops/getAgents", fnName);
            // console.info(agents);

            // for (let ids of agents)
            //     taskList.push({'avogentid':ids.avoagentid,'key': req.body.key});

            // // this.key_list = [];
            // await cache.set("task_list", this.task_list);
            // let task_queue = await cache.get('task_list');
            // console.info(task_queue);

            response['status'] = "pass";
        } catch (error) {
            console.info(error);
            logger.error("Error in execAutomation. Error: %s", error);
        }
        
        // logger.info("Adding Test Suite to Pool: " + pool['name'] + " to be Executed on any availble ICE");
        // response["message"] = "Execution queued on pool: " + pool["name"] + "\nQueue Length: " + pool["execution_list"].length.toString();
        // response['variant'] = "success";
        return response;
    }

    static getAgentTask = async (req, res) => {
        var fnName = 'getAgentTask';
        let response = {};
        response['status'] = "fail";
        response["message"] = "N/A";
        response['error'] = "None";
        try {
            let agent = req.body.Hostname;

            //Add agent in the agent List
            if(!(agent in this.agent_list) ) {
                let timestamp = new Date().toLocaleString();
                this.agent_list[agent] = {
                "icecount": req.body.icecount,
                "timestamp": timestamp,
                "status": "active"
            };
                let agentDetails = this.agent_list[agent];
                agentDetails['name'] = agent;
                const status = await utils.fetchData(agentDetails, "devops/agentDetails", fnName);
                if (status == "fail" || status == "forbidden") return "fail";

                //Storing in Cache
                await cache.set("agent_list", this.agent_list);
                console.info(await cache.get('agent_list'));
            }

            // corner cases needed to be added
            //Doubt - If we find a task after sending the key should remove from task list or wait
            // Exactly when to remove from the task list.
            // let agentAssignedToKey = ''
            // for(let task of this.task_list) {
            //     if(task.avoagentid === agent) {
            //         agentAssignedToKey = task.key;
            //         break;
            //     }
            // }

            //Search in all keys whether Agent is present in its execution queue.
            let agentAssignedToKey = '';
            const keysToBeSearched = await utils.fetchData({avoagents: agent}, "devops/keysList", fnName);
            console.info(keysToBeSearched);
            for(let key of keysToBeSearched) {
                if(key in this.key_list)
               {
                    let testSuiteList = this.key_list[key]
                    for(let testsuite of testSuiteList) {
                    if(testsuite.status == "QUEUED"){
                        agentAssignedToKey = key;
                            break;
                        }
                    }
                }
                if(agentAssignedToKey != '') break;
            }

            //TO-DO set Agent Status..

            response['status'] = 'Pass';
            response['message'] = agentAssignedToKey;

        } catch (error) {
            console.info(error);
            logger.error("Error in getAgentTask. Error: %s", error);
        }
        
        // logger.info("Adding Test Suite to Pool: " + pool['name'] + " to be Executed on any availble ICE");
        // response["message"] = "Execution queued on pool: " + pool["name"] + "\nQueue Length: " + pool["execution_list"].length.toString();
        // response['variant'] = "success";
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
            if(configKey in this.key_list) {

                const testSuiteList = this.key_list[configKey];
                let executionData = '';
                for(let testSuite of testSuiteList) {
                    if(testSuite.status === 'QUEUED') {
                        executionData = await utils.fetchData({'key':configKey,'testSuiteId':testSuite.moduleid}, "devops/getExecScenario", fnName);
                        if (executionData == "fail" || executionData == "forbidden") {
                            response['status'] = "fail";
                            return response;
                        }
                        //TO_DO-->Update that item to IN_PROGRESS
                        break;
                    }
                }

            if(executionData != '')
                response['status'] = executionData;
            else 
                response['status'] = "fail";
                
                return response;
            }
            response['status'] = "fail";

        } catch (error) {
            console.info(error);
            logger.error("Error in execAutomation. Error: %s", error);
        }
        
        // logger.info("Adding Test Suite to Pool: " + pool['name'] + " to be Executed on any availble ICE");
        // response["message"] = "Execution queued on pool: " + pool["name"] + "\nQueue Length: " + pool["execution_list"].length.toString();
        // response['variant'] = "success";
        return response;
    }
}



