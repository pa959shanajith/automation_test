const utils = require('../utils');
var schedule = require('node-schedule');
var smartPartitions = require('../smartPartitions');
var logger = require('../../../logger.js');
var queue = require('./executionQueue');
const constants = require('./executionConstants')
var scheduleJobMap = {};

exports.prepareSchedulingRequest = async (session, body) => {
    logger.info("Inside UI service testSuitesScheduler_ICE");
    const fnName = "testSuitesScheduler_ICE";
    const userInfo = { "userid": session.userid, "username": session.username, "role": session.activeRoleId };
    const multiExecutionData = body.executionData;
    var batchInfo = multiExecutionData.batchInfo;
    let poolid = body.executionData.batchInfo[0].poolid;
    if (!poolid || poolid === "") poolid = constants.EMPTYPOOL
    var invokinguser = {
        invokinguser: session.userid,
        invokingusername: session.username,
        invokinguserrole: session.activeRoleId
    }
    var stat = "none";
    var dateTimeList = batchInfo.map(u => u.timestamp);
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
            "targetaddress": targetUser,
            "userid": userInfo.userid,
            "scenarios": [],
            "testsuiteIds": [],
            "query": "insertscheduledata",
            "poolid": poolid,
            "scheduledby": invokinguser
        };
        for (let i = 0; i < batchIdx.length; i++) {
            let suite = batchInfo[batchIdx[i]];
            inputs.testsuiteIds.push(suite.testsuiteId);
            inputs.scenarios.push(suite.suiteDetails);
            delete suite.targetUser;
            delete suite.date;
            delete suite.time;
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
            const scheduledjob = schedule.scheduleJob(scheduleId, parseInt(scheduleTime), async function () {
                let result;
                execIds['scheduleId'] = scheduleId;
                result = queue.Execution_Queue.addTestSuiteToQueue(batchExecutionData, execIds, userInfo, "SCHEDULE", batchExecutionData.batchInfo[0].poolid);
                schedFlag = result['message'];
            });
            scheduleJobMap[scheduleId] = scheduledjob;
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
            } else {
                // Create entire multiBatchExecutionData object;
                const tsuIds = schd.testsuiteids;
                const batchObj = {
                    "exectionMode": schd.executemode,
                    "executionEnv": schd.executeenv,
                    "browserType": schd.executeon,
                    "scenarioFlag": schd.scenarioFlag,
                    "qccredentials": { "qcurl": "", "qcusername": "", "qcpassword": "" },
                    "targetUser": schd.target,
                    "timestamp": scheduleTime.valueOf(),
                    "scheduleId": schd._id,
                    "batchInfo": [],
                    "poolid": schd.poolid,
                    "scheduledby": schd.scheduledby
                };
                inputs = {
                    "query": "gettestsuiteproject",
                    "testsuiteids": tsuIds
                };
                const details = await utils.fetchData(inputs, "suite/ScheduleTestSuite_ICE", fnName);
                if (details == "fail") {
                    await this.updateScheduleStatus(schd._id, "Failed");
                    continue;
                }
                const prjObj = details.project;
                for (var j = 0; j < tsuIds.length; j++) {
                    const tsuObj = details.suitemap[tsuIds[j]];
                    const suiteObj = {
                        "testsuiteName": tsuObj.name,
                        "testsuiteId": tsuObj._id,
                        "versionNumber": tsuObj.versionnumber,
                        "appType": prjObj.type,
                        "domainName": prjObj.domain,
                        "projectName": prjObj.name,
                        "projectId": prjObj._id,
                        "releaseId": prjObj.releaseid,
                        "cycleName": prjObj.cyclename,
                        "cycleId": prjObj.cycleid,
                        "suiteDetails": schd.scenariodetails[j]
                    };
                    batchObj.batchInfo.push(suiteObj);
                }
                multiBatchExecutionData.push(batchObj);
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
        if (status != "scheduled") {
            logger.info("Sending response 'inprogress' from " + fnName + " service");
            return "inprogress";
        }
        if (scheduleJobMap[scheduleid] && scheduleJobMap[scheduleid].cancel) scheduleJobMap[scheduleid].cancel();
        const result2 = await this.updateScheduleStatus(scheduleid, "cancelled");
        return result2;
    }catch(e){
        logger.error("Exception in the function " + fnName)
        logger.debug("Exception in the function " + fnName + ": %s", ex)
        return 'fail';
    }
	
}