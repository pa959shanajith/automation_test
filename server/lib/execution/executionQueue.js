const utils = require('../utils');
const redisServer = require('../redisSocketHandler');
const cache = require("../cache.js").getClient(2);
var logger = require('../../../logger.js');
const EMPTYUSER = process.env.nulluser;
var testSuiteInvoker = require('../execution/executionInvoker')
const constants = require('./executionConstants')

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
                if (this.ice_list[targetICE]["mode"] && userInfo.userid === userInfo.invokinguser && !this.ice_list[targetICE]["status"]) {
                    if (type == "ACTIVE") {
                        this.executionInvoker.executeActiveTestSuite(batchExecutionData, execIds, userInfo, type);
                    } else {
                        this.executionInvoker.executeScheduleTestSuite(batchExecutionData, execIds, userInfo, type);
                    }
                    response['status'] = "pass";
                    response["message"] = "Execution Started on " + targetICE;
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
                    } else response["message"] = "Execution queued on " + targetICE + "\nQueue Length: " + pool["execution_list"].length.toString();
                }

            } else if (poolid && poolid in this.queue_list) {
                //if target ICE was not specified fetch the appropriate pool and push
                pool = this.queue_list[poolid];
                pool["execution_list"].push(testSuite);
                await cache.set("execution_queue", this.queue_list);
                response['status'] = "pass";
                logger.info("Adding Test Suite to Pool: " + pool['name'] + " to be Executed on any availble ICE");
                response["message"] = "Execution queued on pool: " + pool["name"] + "\nQueue Length: " + pool["execution_list"].length.toString();
            } else {
                //check if target ice is connected but not preset in any pool, execute directly if true
                if (this.ice_list[targetICE] && this.ice_list[targetICE]["connected"]) {
                    const sockmode = await utils.channelStatus(targetICE);
                    if ((!sockmode.normal && !sockmode.schedule)) {
                        response["status"] = "pass";
                        response["message"] = "Can't establish connection with ICE: " + targetICE + " Re-Connect to server!";
                        return response;
                    }
                    if (this.ice_list[targetICE]['status']) {
                        response["status"] = "pass";
                        response["message"] = "Execution or Termination already in progress on ICE: " + targetICE;
                        return response;
                    }
                    if ((this.ice_list[targetICE]["mode"] && userInfo.userid === userInfo.invokinguser) || !this.ice_list[targetICE]["mode"]) {
                        if (type == "ACTIVE") {
                            this.executionInvoker.executeActiveTestSuite(batchExecutionData, execIds, userInfo, type);
                        } else {
                            this.executionInvoker.executeScheduleTestSuite(batchExecutionData, execIds, userInfo, type);
                        }
                        response["message"] = "Execution Started on " + targetICE;
                    } else if (this.ice_list[targetICE]["mode"] && userInfo.userid != userInfo.invokinguser) {
                        response["message"] = "ICE: " + targetICE + " is on DND mode, please disable from DND to proceed.";
                    }
                    response['status'] = "pass";
                } else if (targetICE && targetICE != EMPTYUSER) {
                    //the target ice is neither part of a pool nor is connected to server, queuing not possible
                    response['status'] = "pass";
                    response["message"] = targetICE + " not connected to server and not part of any pool, connect ICE to server or add ICE to a pool to proceed."
                } else {
                    response['status'] = "pass";
                    response["message"] = "ICE not selected."
                }
            }
        } catch (e) {
            response["error"] = "Error while adding test suite to queue";
            logger.error("Error in addTestSuiteToQueue. Error: %s", e);
        }

        return response;
    }

    static addAPITestSuiteToQueue = async (testSuiteRequest, res) => {
        let targetICE = EMPTYUSER;
        let request_pool_name = EMPTYUSER;
        let poolid = "";
        const hdrs = testSuiteRequest.headers;
        const multiBatchExecutionData = testSuiteRequest.body.executionData;
        try {
            if (testSuiteRequest.body && testSuiteRequest.body.executionData && testSuiteRequest.body.executionData[0] && testSuiteRequest.body.executionData[0].userInfo) {
                let suite = testSuiteRequest.body.executionData[0].userInfo;
                //Check wether poolname or icename provided (Execution on pool name not supported in this implementation)
                if (suite.icename) targetICE = testSuiteRequest.body.executionData[0].userInfo.icename;
                if (suite.poolname) {
                    request_pool_name = suite.poolname;
                    for (let id in this.queue_list) {
                        if (this.queue_list[id].name === request_pool_name) {
                            poolid = id;
                            break;
                        }
                    }
                }
            }
            // Check if request came from Azure DevOps. If yes, then send the acknowledgement
            if (hdrs["user-agent"].startsWith("VSTS") && hdrs.planurl && hdrs.projectid) {
                res.setHeader(constants.X_EXECUTION_MESSAGE, "Request Recieved")
                return res.status("200").send("Request Recieved");
            }
            if (!multiBatchExecutionData || multiBatchExecutionData.constructor !== Array || multiBatchExecutionData.length === 0) {
                res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES["400"])
                return res.status("400").send({ "error": "Empty or Invalid Batch Data" });
            }
            let suiteRequest = { "executionData": testSuiteRequest.body.executionData, "headers": testSuiteRequest.headers }
            let userInfo = testSuiteRequest.body.executionData[0].userInfo;
            let testSuite = { "testSuiteRequest": suiteRequest, "type": "API", "userInfo": userInfo }
            if (targetICE && targetICE in this.ice_list && this.ice_list[targetICE]["poolid"] in this.queue_list) {
                if (this.ice_list[targetICE]["mode"] && !this.ice_list[targetICE]["status"]) {
                    testSuite['res'] = res;
                    this.executionInvoker.executeAPI(testSuite);
                }
                let pool = this.queue_list[this.ice_list[targetICE]["poolid"]];
                pool["execution_list"].push(testSuite);
                //save execution queue to redis
                await cache.set("execution_queue", this.queue_list);
                logger.info("Adding Test Suite to Pool: " + pool['name'] + " to be Executed on ICE: " + targetICE);
                testSuite['res'] = res;
            } else if (poolid && poolid in this.queue_list) {
                let pool = this.queue_list[poolid];
                pool["execution_list"].push(testSuite);
                //save execution queue to redis
                await cache.set("execution_queue", this.queue_list);
                logger.info("Adding Test Suite to Pool: " + pool['name'] + " to be Executed on any ICE");
                testSuite['res'] = res;
            } else if (this.ice_list[targetICE] && this.ice_list[targetICE]["connected"]) {
                const sockmode = await utils.channelStatus(targetICE);
                if ((!sockmode.normal && !sockmode.schedule)) {
                    res.setHeader(constants.X_EXECUTION_MESSAGE, constants.constants.STATUS_CODES['461'])
                    return res.status("461").send({ "error": "Can't establish connection with ICE Re-Connect to server!" })
                }
                testSuite['res'] = res;
                this.executionInvoker.executeAPI(testSuite);
            } else if (targetICE === EMPTYUSER && (!poolid || poolid === "")) {
                res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['400'])
                return res.status("400").send({ "error": "ICE name and Pool Id not provided." })
            } else {
                res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES["461"])
                return res.status('461').send({ "error": targetICE + " not connected to server!" })
            }
        } catch (e) {
            logger.error("Error in addAPITestSuiteToQueue. Error: %s", e);
            res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES["500"])
            return res.status('500').send({ "error": "Error while adding test suite to queue" });
        }
        return;
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
                if (data.value.mode && testSuite.userInfo.userid != testSuite.userInfo.invokinguser) {
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
                //Except the ID all other fields of pool can be updated hence re initialise are pool variables
                this.queue_list[poolid]["name"] = pool["poolname"];
                //Map projects to poolid key == projecid value = poolid
                this.project_list = this.setUpProjectList(pool["projectids"], poolid);
                this.queue_list[poolid]["ice_list"] = pool["ice_list"];
                //Map ice to pool key = ICE_name value = {poolid,mode,status,connected,_id}
                this.ice_list = this.setUpICEList(pool["ice_list"], poolid);
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

}



