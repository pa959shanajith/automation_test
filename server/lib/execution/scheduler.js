const utils = require('../utils');
var schedule = require('node-schedule');
const parser = require('cron-parser');
var smartPartitions = require('../smartPartitions');
var logger = require('../../../logger.js');
var queue = require('./executionQueue');
const constants = require('./executionConstants')
var scheduleJobMap = {};

// import agenda	
const agenda = require('./agenda');	
// will be called when Agenda mongo connection is successfully opened/thrown error.	
agenda	
    .on("ready", async () => { logger.info('agenda connected to mongo db server'); async () => await agenda.start(); })	
    .on("error", async () => logger.error('error in connecting agenda to mongo db server'));

exports.prepareSchedulingRequest = async (session, body) => {
    logger.info("Inside UI service testSuitesScheduler_ICE");
    const fnName = "testSuitesScheduler_ICE";
    const userInfo = { "userid": session.userid, "username": session.username, "role": session.activeRoleId || session.role };
    const multiExecutionData = body.executionData;
    var batchInfo = multiExecutionData.batchInfo;
    let poolid = body.executionData.batchInfo[0].poolid;
    let recurringString = body.executionData.batchInfo[0].recurringString;
    let recurringStringOnHoverValue = body.executionData.batchInfo[0].recurringStringOnHover;
    let timeValue = body.executionData.batchInfo[0].time;
    let parentId = body.executionData.batchInfo[0].parentId ? body.executionData.batchInfo[0].parentId : 0;
    let startDate = (recurringStringOnHoverValue === "One Time") ? (+ new Date(new Date(new Date().getFullYear()), new Date(new Date().getMonth()), new Date(new Date().getDate()), new Date(new Date().getHours()), new Date(new Date().getMinutes()))).toString() : (body.executionData.batchInfo[0].startDate ? body.executionData.batchInfo[0].startDate : body.executionData.batchInfo[0].timestamp)
    if (!poolid || poolid === "") poolid = constants.EMPTYPOOL
    var invokinguser = {
        invokinguser: session.userid,
        invokingusername: session.username,
        invokinguserrole: session.activeRoleId || session.role
    }
    var stat = "none";
    var dateTimeList = batchInfo.map(u => isNaN(u.timestamp) ? + new Date(new Date(new Date().getFullYear()), new Date(new Date().getMonth()), new Date(new Date().getDate()), new Date(new Date().getHours()), new Date(new Date().getMinutes())) : u.timestamp);
    var smart = false;
    if (batchInfo[0].targetUser && batchInfo[0].targetUser.includes('Smart')) {
        smart = true;
        const dateTimeUtc = new Date(parseInt(batchInfo[0].timestamp)).toUTCString();
        if (poolid == constants.EMPTYPOOL) {
            let iceList = batchInfo[0].iceList
            batchInfo = await getAvailableICE(batchInfo, batchInfo[0].iceList)
            if (!batchInfo) {
                let msg = "ICE: \n";
                for (let ice in iceList) {
                    msg = msg + "\n" + iceList[ice];
                }
                return { "status": "booked", "user": msg };
            }
        }
        result = await smartPartitions.smartSchedule(batchInfo, batchInfo[0].targetUser, dateTimeUtc, multiExecutionData.browserType.length)
        if (result["status"] == "fail") {
            return "fail"
        }
        stat = result["status"]
        batchInfo = result["batchInfo"]
        displayString = result["displayString"]
        if (!batchInfo) batchInfo = []
        dateTimeList = batchInfo.map(u => u.timestamp);
    }
    const taskApproval = await utils.approvalStatusCheck(batchInfo);
    if (taskApproval.res !== "pass") return taskApproval.res;
    const addressList = batchInfo.map(u => u.targetUser);
    var inputs = {
        "query": "checkscheduleddetails",
        "scheduledatetime": dateTimeList,
        "targetaddress": addressList
    };
    if (!smart) {
        const chkResult = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
        if (chkResult != -1) return (chkResult == "fail") ? "fail" : { "status": "booked", "user": addressList[chkResult] };
    }

    /** Add if else for smart schedule below this => NO **/
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
        const timestamp = userTime.split('_').pop();
        const targetUser = batchInfo[batchIdx[0]].targetUser;
        const batchObj = JSON.parse(JSON.stringify(multiExecutionData));
        delete batchObj.batchInfo;
        batchObj.targetUser = targetUser;
        batchObj.timestamp = timestamp;
        batchObj.scheduleId = undefined;
        batchObj.batchInfo = [];
        batchObj.scheduledby = invokinguser;
        inputs = {
            "timestamp": timestamp.toString(),
            "executeon": multiExecutionData.browserType,
            "executemode": multiExecutionData.exectionMode,
            "exec_env": multiExecutionData.executionEnv,
            'scenarioFlag': multiExecutionData.scenarioFlag,
            "type": multiExecutionData.type,
            "targetaddress": targetUser,
            "userid": userInfo.userid,
            "scenarios": [],
            "testsuiteIds": [],
            "query": "insertscheduledata",
            "poolid": poolid,
            "scheduledby": invokinguser,
            "scheduleType": recurringString,
            "recurringStringOnHover": recurringStringOnHoverValue,
            "time": timeValue,
            "parentId": parentId,
            "startDate": startDate.toString()
        };
        for (let i = 0; i < batchIdx.length; i++) {
            let suite = batchInfo[batchIdx[i]];
            inputs.testsuiteIds.push(suite.testsuiteId);
            inputs.scenarios.push(suite.suiteDetails);
            // delete suite.targetUser;
            // delete suite.date;
            // delete suite.time;
            batchObj.batchInfo.push(suite);
        }
        if (!inputs.targetaddress || inputs.targetaddress === "") inputs.targetaddress = constants.EMPTYUSER;
        const insResult = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
        if (insResult == "fail") return "fail";
        else batchObj.scheduleId = insResult.id;
        multiBatchExecutionData.push(batchObj);
    }
    /** Add if else for smart schedule above this **/
    var schResult = await scheduleTestSuite(multiBatchExecutionData);
    if (schResult == "success" && stat != "none") schResult = displayString + " " + "success";
    return schResult;
};

const getAvailableICE = async (batchInfo, iceList) => {
    dateTimeList = batchInfo.map(u => u.timestamp);
    const fnName = "getAvailableICE"
    available_ice = []
    for (let ice in iceList) {
        var inputs = {
            "query": "checkscheduleddetails",
            "scheduledatetime": [dateTimeList[0]],
            "targetaddress": [iceList[ice]]
        };
        const chkResult = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
        if (chkResult == -1) available_ice.push(iceList[ice])
    }
    if (available_ice.length == 0) return false;
    for (let batch in batchInfo) {
        batchInfo[batch].iceList = available_ice
    }
    return batchInfo
}

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
            if (user != "") {
                inputs = { "icename": user };
                const profile = await utils.fetchData(inputs, "login/fetchICEUser", fnName);
                if (profile == "fail" || profile == null) return "fail";
                userInfoMap[user] = { "userid": profile.userid, "username": profile.name, "role": profile.role, "icename": user };
            } else {
                userInfoMap[constants.EMPTYUSER] = { "userid": "N/A", "username": "", "role": "", "icename": constants.EMPTYUSER };
            }

        }
    }
    for (const batchExecutionData of multiBatchExecutionData) {
        let execIds = { "batchid": "generate", "execid": {} };
        if (batchExecutionData.targetUser === "") batchExecutionData.targetUser = constants.EMPTYUSER
        let userInfo = userInfoMap[batchExecutionData.targetUser];
        Object.assign(userInfo, batchExecutionData.scheduledby);
        const scheduleTime = batchExecutionData.timestamp;
        const scheduleId = batchExecutionData.scheduleId;
        const smartId = batchExecutionData.smartScheduleId;
        if (smartId !== undefined) {
            if (execIdsMap[smartId] === undefined) execIdsMap[smartId] = execIds;
            else execIds = execIdsMap[smartId];
        }
        try {
            // definations of the job.	
            agenda.define(scheduleId, async (job, done) => {	
                let result;	
                execIds['scheduleId'] = scheduleId;	
                result = queue.Execution_Queue.addTestSuiteToQueue(batchExecutionData, execIds, userInfo, "SCHEDULE", batchExecutionData.batchInfo[0].poolid);	
                schedFlag = result['message'];	
                done();	
            });	
            // triggerring the agenda job with schedule option(one time).	
            (async function () {	
                await agenda.start();	
                await agenda.schedule(parseInt(scheduleTime), scheduleId, { scheduleData: batchExecutionData });	
            })();
        } catch (ex) {
            logger.error("Exception in the function executeScheduling from scheduleTestSuite: reshedule: %s", ex);
            schedFlag = "few";
            await this.updateScheduleStatus(scheduleId, "Failed");
        }
    }
    return schedFlag;
}

/** Update schedule status of current scheduled job and insert report for the skipped scenarios.
Possible status options are: "Skipped", "Terminate", "Completed", "Inprogress", "Failed", "Missed", "cancelled", "scheduled" */
exports.updateScheduleStatus = async (scheduleid, status, batchid) => {
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
                await this.updateScheduleStatus(eipSchd._id, "Failed");
            }
        }

        // Reschedule pending schedules since server restarted
        inputs = {
            "query": "getscheduledata",
            "status": "scheduled"
        };
        const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
        if (result == "fail") return logger.error("Status from the function " + fnName + ": Jobs are not rescheduled");
        const multiBatchExecutionData = [];
        for (var i = 0; i < result.length; i++) {
            const schd = result[i];
            let poolid = schd.poolid;
            const scheduleTime = new Date(result[i].scheduledon);
            if (scheduleTime < new Date()) {
                await this.updateScheduleStatus(schd._id, "Missed");
            } 
            else {
                // get schedule data from the job	
                const inputs1 = {	
                    "query": "getscheduleagendajobs",	
                    "scheduleid": schd._id	
                };	
                const result1 = await utils.fetchData(inputs1, "suite/ScheduleTestSuite_ICE", fnName);	
                if (result1 == "fail") {	
                    await this.updateScheduleStatus(schd._id, "Failed");	
                    continue;	
                }	
                // cancel the scheduled job	
                const inputs2 = {	
                    "query": "cancelagendajobs",	
                    "scheduleid": schd._id	
                };	
                const jobCancelled = await utils.fetchData(inputs2, "suite/ScheduleTestSuite_ICE", fnName);	
                if (jobCancelled == "fail") {	
                    await this.updateScheduleStatus(schd._id, "Failed");	
                    continue;	
                }	
                // create multibatch execution data	
                multiBatchExecutionData.push(result1[0].data.scheduleData);	
            }
        }
        const status = await scheduleTestSuite(multiBatchExecutionData);
        if (status == "fail") logger.error("Status from the function " + fnName + ": Jobs are not rescheduled");
        else if (status == "few") logger.warn("Status from the function " + fnName + ": All except few jobs are rescheduled");
        else logger.info("Status from the function " + fnName + ": Jobs successfully rescheduled");
    } catch (ex) {
        logger.error("Exception in the function " + fnName + ": %s", ex);
    }
};

exports.cancelJob = async (req) => {
    const fnName = "cancelJobMap";
	logger.info("Inside UI service " + fnName);
    try{
        const userid = req.session.userid;
        const username = req.session.username;
        const scheduleid = req.body.schDetails.scheduleid;
        const schedHost = req.body.host;
        const schedUserid = JSON.parse(req.body.schedUserid);
        var userprofile = {}
        let inputs = { "icename": schedHost };
        if(schedHost != constants.EMPTYUSER){
            userprofile = await utils.fetchData(inputs, "login/fetchICEUser", fnName);
            if (userprofile == "fail" || userprofile == null) "fail";
        }
        if (!(schedUserid["invokinguser"] == userid || userprofile.name == username)) {
            logger.info("Sending response 'not authorised' from " + fnName + " service");
            return "not authorised";
        }
        inputs = {
            "query": "getscheduledata",
            "scheduleid": scheduleid
        };
        const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
        if (result == "fail") return "fail";
        const status = result[0].status;
        if (status != "scheduled" && status != "recurring") {
            logger.info("Sending response 'inprogress' from " + fnName + " service");
            return "inprogress";
        }
        else {
            // cancel the job	
            if (status == "scheduled") {	
                const inputs1 = {	
                    "query": "cancelagendajobs",	
                    "scheduleid": result[0]._id	
                };	
                const jobCancelled = await utils.fetchData(inputs1, "suite/ScheduleTestSuite_ICE", fnName);	
                if (jobCancelled == "fail") return "fail";	
                const updateStatus = await this.updateScheduleStatus(scheduleid, "cancelled");	
                return updateStatus;	
            }	
            else if (status == "recurring") {	
                // cancel child jobs	
                const inputs1 = {	
                    "query": "getscheduledata",	
                    "parentid": result[0]._id	
                };	
                const result1 = await utils.fetchData(inputs1, "suite/ScheduleTestSuite_ICE", fnName);	
                if (result1 == "fail") return "fail";	
                result1.forEach(async (element) => {	
                    const status1 = element.status;	
                    if (status1 == "scheduled") {	
                        const inputs2 = {	
                            "query": "cancelagendajobs",	
                            "scheduleid": element._id	
                        };	
                        const jobCancelled = await utils.fetchData(inputs2, "suite/ScheduleTestSuite_ICE", fnName);	
                        if (jobCancelled == "fail") return "fail";	
                        const updateStatus = await this.updateScheduleStatus(element._id, "cancelled");	
                    }	
                });	
                // cancel parent job	
                const inputs3 = {	
                    "query": "cancelagendajobs",	
                    "scheduleid": result[0]._id	
                };	
                const jobCancelled = await utils.fetchData(inputs3, "suite/ScheduleTestSuite_ICE", fnName);	
                if (jobCancelled == "fail") return "fail";	
                const updateStatus = await this.updateScheduleStatus(scheduleid, "cancelled");	
                return updateStatus;
            }
        }
    }catch(e){
        logger.error("Exception in the function " + fnName)
        logger.debug("Exception in the function " + fnName + ": %s", ex)
        return 'fail';
    }
	
}

exports.scheduleRecurringTestSuite = async (session, body) => {
    const fnName = "scheduleRecurringTestSuite";
    logger.info("Inside " + fnName + " function");
    const userInfoMap = {};

    const multiExecutionData = body.executionData;
    let poolid = multiExecutionData.batchInfo[0].poolid;

    if (!poolid || poolid === "") poolid = constants.EMPTYPOOL

    const userList = multiExecutionData.batchInfo.map((u) => u.targetUser);
    for (const user of userList) {
        if (!userInfoMap[user]) {
            if (user != "") {
                inputs = { icename: user };
                const profile = await utils.fetchData(inputs, "login/fetchICEUser", fnName);
                if (profile == "fail" || profile == null) return "fail";
                userInfoMap[user] = { userid: profile.userid, username: profile.name, role: profile.role, icename: user };
            } 
            else {
                userInfoMap[constants.EMPTYUSER] = { userid: "N/A", username: "", role: "", icename: constants.EMPTYUSER };
            }
        }
    }

    var schedFlag = "success";
    var inputs = {};

    var invokinguser = {
        invokinguser: session.userid,
        invokingusername: session.username,
        invokinguserrole: session.activeRoleId || session.role,
    };

    // check a job is already scheduled for a particular time
    const addressList = multiExecutionData.batchInfo.map(u => u.targetUser);
    const dateTimeList = multiExecutionData.batchInfo.map(u => u.time)
    var inputs = {
        "query": "checkrecurringscheduleddetails",
        "scheduledatetime": dateTimeList,
        "targetaddress": addressList
    };
    
    const chkResult = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
    if (chkResult != -1) return (chkResult == "fail") ? "fail" : { "status": "booked", "user": addressList[chkResult] };

    let timeSelected = multiExecutionData.batchInfo[0].time;
    let timestamp = + new Date(new Date(new Date().getFullYear()), new Date(new Date().getMonth()), new Date(new Date().getDate()), parseInt(timeSelected.split(':')[0]), parseInt(timeSelected.split(':')[1]))
    let createdDate = + new Date(new Date(new Date().getFullYear()), new Date(new Date().getMonth()), new Date(new Date().getDate()), new Date(new Date().getHours()), new Date(new Date().getMinutes()))
    const targetUser = multiExecutionData.batchInfo[0].targetUser;
    let recurringPattern = multiExecutionData['batchInfo'][0]['recurringValue'];
    recurringPattern = recurringPattern.split(" ");
    recurringPattern[0] = timeSelected.split(":")[1];
    recurringPattern[1] = timeSelected.split(":")[0];
    recurringPattern = recurringPattern.join(" ");
    body.executionData.batchInfo[0].recurringValue = recurringPattern;
    body.executionData.batchInfo[0].poolid = poolid;
    body.executionData.batchInfo[0].startDate = createdDate;
    let recurringString = multiExecutionData['batchInfo'][0]['recurringString'];
    let recurringStringOnHover = multiExecutionData.batchInfo[0].recurringStringOnHover;
    inputs = {
        timestamp: timestamp.toString(),
        executeon: multiExecutionData.browserType,
        executemode: multiExecutionData.exectionMode,
        exec_env: multiExecutionData.executionEnv,
        type: multiExecutionData.type,
        targetaddress: targetUser,
        scenarioFlag: multiExecutionData.scenarioFlag,
        scenarios: [multiExecutionData.batchInfo[0].suiteDetails],
        testsuiteIds: [multiExecutionData.batchInfo[0].testsuiteId],
        query: "insertscheduledata",
        scheduledby: invokinguser,
        poolid: poolid,
        status: "recurring",
        scheduleType: recurringString,
        recurringPattern: recurringPattern,
        recurringStringOnHover:	multiExecutionData.batchInfo[0].recurringStringOnHover,
        time: timeSelected,
        parentId: 0,
        startDate: createdDate.toString()
    };

    const insResult = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
    let scheduleId = insResult.id;

    try {
        if (recurringString == "Every Day") {
            if (!recurringPattern.includes("1-5") && recurringStringOnHover != "Occurs every day") {
                let nextRun = parseInt(recurringPattern.split("/")[1].split(" ")[0]);
                let nextRunString = nextRun.toString() + " day";

                let timeValue = multiExecutionData['batchInfo'][0]['time'];
                let timeValueString = "at " + timeValue.toString();
                let timeStamp = new Date(new Date(new Date().getFullYear()), new Date(new Date().getMonth()), new Date(new Date().getDate()), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));

                body.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                body.executionData.batchInfo[0].parentId = scheduleId;
                let result1 = exports.prepareSchedulingRequest(session, body);
                schedFlag = result1;

                // definations of the job.
                agenda.define(scheduleId, async (job, done) => {
                    let multiExecutionData = {};
                    let data = job.attrs.data.scheduleData;
                    multiExecutionData.executionData = data;
                    let dateString = job.attrs.nextRunAt.toString().split(' ');
                    let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                    let timeValue = multiExecutionData.executionData.batchInfo[0].time;
                    let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));

                    multiExecutionData.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                    multiExecutionData.executionData.batchInfo[0].parentId = scheduleId;
                    let result1 = exports.prepareSchedulingRequest(session, multiExecutionData);
                    schedFlag = result1;
                    done();
                });

                // triggerring the agenda job with repeatEvery option(recurring jobs).
                (async function () {
                    const dailyJob = agenda.create(scheduleId, { scheduleData: body.executionData });
                    await agenda.start();
                    let startDate = new Date(new Date(new Date().getFullYear()), new Date(new Date().getMonth()), new Date(new Date().getDate() - nextRun), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));
                    await dailyJob.schedule(startDate).repeatEvery(nextRunString, { skipImmediate: true }).save();
                })();
            }
            else {
                const interval = parser.parseExpression(recurringPattern);
                let dateString = interval.next().toString().split(' ');
                let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                let timeValue = multiExecutionData['batchInfo'][0]['time'];
                let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));

                body.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                body.executionData.batchInfo[0].parentId = scheduleId;
                let result1 = exports.prepareSchedulingRequest(session, body);
                schedFlag = result1;

                // definations of the job.
                agenda.define(scheduleId, async (job, done) => {
                    let multiExecutionData = {};
                    let data = job.attrs.data.scheduleData;
                    multiExecutionData.executionData = data;
                    let dateString = job.attrs.nextRunAt.toString().split(' ');
                    let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                    let timeValue = multiExecutionData.executionData.batchInfo[0].time;
                    let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));

                    multiExecutionData.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                    multiExecutionData.executionData.batchInfo[0].parentId = scheduleId;
                    let result1 = exports.prepareSchedulingRequest(session, multiExecutionData);
                    schedFlag = result1;
                    done();
                });

                // triggerring the agenda job with repeatEvery option(recurring jobs).
                (async function () {
                    const dailyJob = agenda.create(scheduleId, { scheduleData: body.executionData });
                    await agenda.start();
                    await dailyJob.repeatEvery(recurringPattern, { skipImmediate: true }).save();
                })();
            }
        }
        else if (recurringString == "Every Week") {
            const interval = parser.parseExpression(recurringPattern);
            let dateString = interval.next().toString().split(' ');
            let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
            let timeValue = multiExecutionData['batchInfo'][0]['time'];
            let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));

            body.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
            body.executionData.batchInfo[0].parentId = scheduleId;
            let result1 = exports.prepareSchedulingRequest(session, body);
            schedFlag = result1;

            // definations of the job.
            agenda.define(scheduleId, async (job, done) => {
                let multiExecutionData = {};
                let data = job.attrs.data.scheduleData;
                multiExecutionData.executionData = data;
                let dateString = job.attrs.nextRunAt.toString().split(' ');
                let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                let timeValue = multiExecutionData.executionData.batchInfo[0].time;
                let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));

                multiExecutionData.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                multiExecutionData.executionData.batchInfo[0].parentId = scheduleId;
                let result1 = exports.prepareSchedulingRequest(session, multiExecutionData);
                schedFlag = result1;
                done();
            });

            // triggerring the agenda job with repeatEvery option(recurring jobs).
            (async function () {
                const weeklyJob = agenda.create(scheduleId, { scheduleData: body.executionData });
                await agenda.start();
                await weeklyJob.repeatEvery(recurringPattern, { skipImmediate: true }).save();
            })();
        }
        else if (recurringString == "Every Month") {
            if (['first', 'second', 'third', 'fourth', 'last'].some(element => recurringStringOnHover.includes(element))) {
                let nextRun = parseInt(recurringPattern.split("/")[1].split(" ")[0]);
                recurringPattern = recurringPattern.split("/");
                recurringPattern = recurringPattern[0] + " " + recurringPattern[1].split(" ")[1];

                if (recurringStringOnHover.includes('first')) {
                    recurringPattern = recurringPattern + "#1";
                }
                else if (recurringStringOnHover.includes('second')) {
                    recurringPattern = recurringPattern + "#2";
                }
                else if (recurringStringOnHover.includes('third')) {
                    recurringPattern = recurringPattern + "#3";
                }
                else if (recurringStringOnHover.includes('fourth')) {
                    recurringPattern = recurringPattern + "#4";
                }
                else if (recurringStringOnHover.includes('last')) {
                    recurringPattern = recurringPattern + "#5";
                }

                const interval = parser.parseExpression(recurringPattern);
                let dateString = interval.next().toString().split(' ');
                let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                let timeValue = multiExecutionData['batchInfo'][0]['time'];
                let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));

                body.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                body.executionData.batchInfo[0].parentId = scheduleId;
                let result1 = exports.prepareSchedulingRequest(session, body);
                schedFlag = result1;

                // definations of the job.
                agenda.define(scheduleId, async (job, done) => {
                    let recurringPattern = job.attrs.data.scheduleData.batchInfo[0].recurringValue;
                    let nextRun = parseInt(recurringPattern.split("/")[1].split(" ")[0]);
                    if (job.attrs.data.runCount % nextRun == 0) {
                        let multiExecutionData = {};
                        let data = job.attrs.data.scheduleData;
                        multiExecutionData.executionData = data;
                        let dateString = job.attrs.nextRunAt.toString().split(' ');
                        let recurringStringOnHover = multiExecutionData.executionData.batchInfo[0].recurringStringOnHover;
                        recurringPattern = recurringPattern.split("/");
                        recurringPattern = recurringPattern[0] + " " + recurringPattern[1].split(" ")[1];
                        if (recurringStringOnHover.includes('first')) {
                            recurringPattern = recurringPattern + "#1";
                        }
                        else if (recurringStringOnHover.includes('second')) {
                            recurringPattern = recurringPattern + "#2";
                        }
                        else if (recurringStringOnHover.includes('third')) {
                            recurringPattern = recurringPattern + "#3";
                        }
                        else if (recurringStringOnHover.includes('fourth')) {
                            recurringPattern = recurringPattern + "#4";
                        }
                        else if (recurringStringOnHover.includes('last')) {
                            recurringPattern = recurringPattern + "#5";
                        }
                        const interval = parser.parseExpression(recurringPattern);
                        for (let i = 0; i < nextRun; i++) {
                            dateString = interval.next().toString().split(' ');
                        }
                        let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                        let timeValue = multiExecutionData.executionData.batchInfo[0].time;
                        let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));
                        multiExecutionData.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                        multiExecutionData.executionData.batchInfo[0].parentId = scheduleId;
                        let result1 = exports.prepareSchedulingRequest(session, multiExecutionData);
                        schedFlag = result1;
                    }
                    job.attrs.data.runCount = job.attrs.data.runCount + 1;
                    done();
                });

                // triggerring the agenda job with repeatEvery option(recurring jobs).
                (async function () {
                    const monthlyJob = agenda.create(scheduleId, { scheduleData: body.executionData, runCount: 0 });
                    await agenda.start();
                    await monthlyJob.repeatEvery(recurringPattern, { skipImmediate: true }).save();
                })();
            }
            else {
                let nextRun = parseInt(recurringPattern.split("/")[1].split(" ")[0]);
                recurringPattern = recurringPattern.split("/");
                recurringPattern = recurringPattern[0] + " " + recurringPattern[1].split(" ")[1];

                const interval = parser.parseExpression(recurringPattern);
                let dateString = interval.next().toString().split(' ');
                let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                let timeValue = multiExecutionData['batchInfo'][0]['time'];
                let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));

                body.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                body.executionData.batchInfo[0].parentId = scheduleId;
                let result1 = exports.prepareSchedulingRequest(session, body);
                schedFlag = result1;

                // definations of the job.
                agenda.define(scheduleId, async (job, done) => {
                    let recurringPattern = job.attrs.data.scheduleData.batchInfo[0].recurringValue;
                    let nextRun = parseInt(recurringPattern.split("/")[1].split(" ")[0]);
                    if (job.attrs.data.runCount % nextRun == 0) {
                        let multiExecutionData = {};
                        let data = job.attrs.data.scheduleData;
                        multiExecutionData.executionData = data;
                        let dateString = job.attrs.nextRunAt.toString().split(' ');
                        recurringPattern = recurringPattern.split("/");
                        recurringPattern = recurringPattern[0] + " " + recurringPattern[1].split(" ")[1];
                        const interval = parser.parseExpression(recurringPattern);
                        for (let i = 0; i < nextRun; i++) {
                            dateString = interval.next().toString().split(' ');
                        }
                        let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                        let timeValue = multiExecutionData.executionData.batchInfo[0].time;
                        let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));
                        multiExecutionData.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                        multiExecutionData.executionData.batchInfo[0].parentId = scheduleId;
                        let result1 = exports.prepareSchedulingRequest(session, multiExecutionData);
                        schedFlag = result1;
                    }
                    job.attrs.data.runCount = job.attrs.data.runCount + 1;
                    done();
                });

                // triggerring the agenda job with repeatEvery option(recurring jobs).
                (async function () {
                    const monthlyJob = agenda.create(scheduleId, { scheduleData: body.executionData, runCount: 0 });
                    await agenda.start();
                    await monthlyJob.repeatEvery(recurringPattern, { skipImmediate: true }).save();
                })();
            }
        }
    } catch (ex) {
        logger.error("Exception in the function executeScheduling from scheduleTestSuite: reshedule: %s", ex);
        schedFlag = "fail";
        await this.updateScheduleStatus(scheduleId, "Failed");
    }
    return schedFlag;
};

// reschedule recurring jobs on server restart
exports.reScheduleRecurringTestsuite = async () => {
    const fnName = "reScheduleRecurringTestsuite";
    logger.info("Inside UI service " + fnName);
    var inputs = {};
    try {
        // Mark inprogress schedules as failed since server restarted
        inputs = {
            query: "getscheduledata",
            status: "recurring",
        };
        const result = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);

        const multiBatchExecutionData = {};

        for (var i = 0; i < result.length; i++) {
            const schd = result[i];
            let poolid = schd.poolid;
            const scheduleTime = new Date(result[i].scheduledon);

            var session = {
                userid: schd.scheduledby.invokinguser,
                username: schd.scheduledby.invokingusername,
                role: schd.scheduledby.invokinguserrole,
            };

            // get the next run date and remove the job
            let inputs = {
                "query": "getscheduleagendajobs",
                "scheduleid": schd._id
            };
            const result1 = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
            if (result1 == "fail") {
                await this.updateScheduleStatus(schd._id, "Failed");
                continue;
            }

            // Create entire multiBatchExecutionData object;
            multiBatchExecutionData.executionData = result1[0].data.scheduleData;

            // cancel the job
            const inputs2 = {
                "query": "cancelagendajobs",
                "scheduleid": result1[0].name
            };
            const jobCancelled = await utils.fetchData(inputs2, "suite/ScheduleTestSuite_ICE", fnName);
            if (jobCancelled == "fail") {
                await this.updateScheduleStatus(schd._id, "Failed");
                continue;
            }

            if (schd.scheduletype == "Every Day") {
                if (!schd.recurringpattern.includes("1-5") && schd.recurringstringonhover != "Occurs every day") {
                    let nextRun = parseInt(schd.recurringpattern.split("/")[1].split(" ")[0]);
                    let nextRunString = nextRun.toString() + " day";
                    let timeValue = schd.time;

                    let currentDate = new Date(new Date(new Date().getFullYear()), new Date(new Date().getMonth()), new Date(new Date().getDate()));

                    // get next run at date
                    let startDate = new Date(result1[0].nextRunAt).toString().split(" ");
                    let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(startDate[1]) / 3;
                    startDate = new Date(parseInt(startDate[3]), parseInt(month), parseInt(startDate[2]));

                    while (startDate.valueOf() < currentDate.valueOf()) {
                        startDate.setDate(startDate.getDate() + nextRun);
                    }

                    // definations of the job.
                    agenda.define(schd._id, async (job, done) => {
                        let multiExecutionData = {};
                        let data = job.attrs.data.scheduleData;
                        multiExecutionData.executionData = data;
                        let dateString = job.attrs.nextRunAt.toString().split(' ');
                        let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                        let timeValue = multiExecutionData.executionData.batchInfo[0].time;
                        let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));

                        multiExecutionData.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                        multiExecutionData.executionData.batchInfo[0].parentId = schd._id;
                        let result1 = exports.prepareSchedulingRequest(session, multiExecutionData);
                        schedFlag = result1;
                        done();
                    });

                    // triggerring the agenda job with repeatEvery option(recurring jobs).
                    (async function () {
                        const dailyJob = agenda.create(schd._id, { scheduleData: multiBatchExecutionData.executionData });
                        await agenda.start();
                        startDate = startDate.toString().split(" ");
                        let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(startDate[1]) / 3;
                        startDate = new Date(parseInt(startDate[3]), parseInt(month), parseInt(startDate[2]) - nextRun, parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));
                        await dailyJob.schedule(startDate).repeatEvery(nextRunString, { skipImmediate: true }).save();
                    })();
                }
                else {
                    let recurringPattern = schd.recurringpattern;

                    // definations of the job.
                    agenda.define(schd._id, async (job, done) => {
                        let multiExecutionData = {};
                        let data = job.attrs.data.scheduleData;
                        multiExecutionData.executionData = data;
                        let dateString = job.attrs.nextRunAt.toString().split(' ');
                        let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                        let timeValue = multiExecutionData.executionData.batchInfo[0].time;
                        let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));

                        multiExecutionData.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                        multiExecutionData.executionData.batchInfo[0].parentId = schd._id;
                        let result1 = exports.prepareSchedulingRequest(session, multiExecutionData);
                        schedFlag = result1;
                        done();
                    });

                    // triggerring the agenda job with repeatEvery option(recurring jobs).
                    (async function () {
                        const dailyJob = agenda.create(schd._id, { scheduleData: multiBatchExecutionData.executionData });
                        await agenda.start();
                        await dailyJob.repeatEvery(recurringPattern, { skipImmediate: true }).save();
                    })();
                }
            }
            else if (schd.scheduletype == "Every Week") {
                let recurringPattern = schd.recurringpattern;

                // definations of the job.
                agenda.define(schd._id, async (job, done) => {
                    let multiExecutionData = {};
                    let data = job.attrs.data.scheduleData;
                    multiExecutionData.executionData = data;
                    let dateString = job.attrs.nextRunAt.toString().split(' ');
                    let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                    let timeValue = multiExecutionData.executionData.batchInfo[0].time;
                    let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));

                    multiExecutionData.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                    multiExecutionData.executionData.batchInfo[0].parentId = schd._id;
                    let result1 = exports.prepareSchedulingRequest(session, multiExecutionData);
                    schedFlag = result1;
                    done();
                });

                // triggerring the agenda job with repeatEvery option(recurring jobs).
                (async function () {
                    const weeklyJob = agenda.create(schd._id, { scheduleData: multiBatchExecutionData.executionData });
                    await agenda.start();
                    await weeklyJob.repeatEvery(recurringPattern, { skipImmediate: true }).save();
                })();
            }
            else if (schd.scheduletype == "Every Month") {
                let recurringPattern = schd.recurringpattern;
                let nextRun = parseInt(recurringPattern.split("/")[1].split(" ")[0]);
                recurringPattern = recurringPattern.split("/");
                recurringPattern = recurringPattern[0] + " " + recurringPattern[1].split(" ")[1];

                // get runcount for monthly
                let runCount = result1[0].data.runCount ? result1[0].data.runCount : 0;

                let currentDate = new Date(new Date(new Date().getFullYear()), new Date(new Date().getMonth()), new Date(new Date().getDate()));

                // get next run at date
                let startDate = new Date(result1[0].nextRunAt).toString().split(" ");
                let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(startDate[1]) / 3;
                startDate = new Date(parseInt(startDate[3]), parseInt(month), parseInt(startDate[2]));

                while (startDate.valueOf() < currentDate.valueOf()) {
                    startDate.setMonth(startDate.getMonth() + nextRun);
                    runCount = runCount + 1;
                }

                if (['first', 'second', 'third', 'fourth', 'last'].some(element => schd.recurringstringonhover.includes(element))) {
                    if (schd.recurringstringonhover.includes('first')) {
                        recurringPattern = recurringPattern + "#1";
                    }
                    else if (schd.recurringstringonhover.includes('second')) {
                        recurringPattern = recurringPattern + "#2";
                    }
                    else if (schd.recurringstringonhover.includes('third')) {
                        recurringPattern = recurringPattern + "#3";
                    }
                    else if (schd.recurringstringonhover.includes('fourth')) {
                        recurringPattern = recurringPattern + "#4";
                    }
                    else if (schd.recurringstringonhover.includes('last')) {
                        recurringPattern = recurringPattern + "#5";
                    }

                    // definations of the job.
                    agenda.define(schd._id, async (job, done) => {
                        let recurringPattern = job.attrs.data.scheduleData.batchInfo[0].recurringValue;
                        let nextRun = parseInt(recurringPattern.split("/")[1].split(" ")[0]);
                        if (job.attrs.data.runCount % nextRun == 0) {
                            let multiExecutionData = {};
                            let data = job.attrs.data.scheduleData;
                            multiExecutionData.executionData = data;
                            let dateString = job.attrs.nextRunAt.toString().split(' ');
                            let recurringStringOnHover = multiExecutionData.executionData.batchInfo[0].recurringStringOnHover;
                            recurringPattern = recurringPattern.split("/");
                            recurringPattern = recurringPattern[0] + " " + recurringPattern[1].split(" ")[1];
                            if (recurringStringOnHover.includes('first')) {
                                recurringPattern = recurringPattern + "#1";
                            }
                            else if (recurringStringOnHover.includes('second')) {
                                recurringPattern = recurringPattern + "#2";
                            }
                            else if (recurringStringOnHover.includes('third')) {
                                recurringPattern = recurringPattern + "#3";
                            }
                            else if (recurringStringOnHover.includes('fourth')) {
                                recurringPattern = recurringPattern + "#4";
                            }
                            else if (recurringStringOnHover.includes('last')) {
                                recurringPattern = recurringPattern + "#5";
                            }
                            const interval = parser.parseExpression(recurringPattern);
                            for (let i = 0; i < nextRun; i++) {
                                dateString = interval.next().toString().split(' ');
                            }
                            let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                            let timeValue = multiExecutionData.executionData.batchInfo[0].time;
                            let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));
                            multiExecutionData.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                            multiExecutionData.executionData.batchInfo[0].parentId = schd._id;
                            let result1 = exports.prepareSchedulingRequest(session, multiExecutionData);
                            schedFlag = result1;
                        }
                        job.attrs.data.runCount = job.attrs.data.runCount + 1;
                        done();
                    });

                    // triggerring the agenda job with repeatEvery option(recurring jobs).
                    (async function () {
                        const monthlyJob = agenda.create(schd._id, { scheduleData: multiBatchExecutionData.executionData, runCount: runCount });
                        await agenda.start();
                        await monthlyJob.repeatEvery(recurringPattern, { skipImmediate: true }).save();
                    })();
                }
                else {
                    // definations of the job.
                    agenda.define(schd._id, async (job, done) => {
                        let recurringPattern = job.attrs.data.scheduleData.batchInfo[0].recurringValue;
                        let nextRun = parseInt(recurringPattern.split("/")[1].split(" ")[0]);
                        if (job.attrs.data.runCount % nextRun == 0) {
                            let multiExecutionData = {};
                            let data = job.attrs.data.scheduleData;
                            multiExecutionData.executionData = data;
                            let dateString = job.attrs.nextRunAt.toString().split(' ');
                            recurringPattern = recurringPattern.split("/");
                            recurringPattern = recurringPattern[0] + " " + recurringPattern[1].split(" ")[1];
                            const interval = parser.parseExpression(recurringPattern);
                            for (let i = 0; i < nextRun; i++) {
                                dateString = interval.next().toString().split(' ');
                            }
                            let month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateString[1]) / 3;
                            let timeValue = multiExecutionData.executionData.batchInfo[0].time;
                            let timeStamp = new Date(parseInt(dateString[3]), parseInt(month), parseInt(dateString[2]), parseInt(timeValue.split(':')[0]), parseInt(timeValue.split(':')[1]));
                            multiExecutionData.executionData.batchInfo[0].timestamp = timeStamp.valueOf();
                            multiExecutionData.executionData.batchInfo[0].parentId = schd._id;
                            let result1 = exports.prepareSchedulingRequest(session, multiExecutionData);
                            schedFlag = result1;
                        }
                        job.attrs.data.runCount = job.attrs.data.runCount + 1;
                        done();
                    });

                    // triggerring the agenda job with repeatEvery option(recurring jobs).
                    (async function () {
                        const monthlyJob = agenda.create(schd._id, { scheduleData: multiBatchExecutionData.executionData, runCount: runCount });
                        await agenda.start();
                        await monthlyJob.repeatEvery(recurringPattern, { skipImmediate: true }).save();
                    })();
                }
            }
        }
    }
    catch (ex) {
        logger.error("Exception in the function " + fnName + ": %s", ex);
    }
}