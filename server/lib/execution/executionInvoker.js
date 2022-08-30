const cache = require("../cache.js").getClient(2);
var Client = require("node-rest-client").Client;
var client = new Client();
var myserver = require('../socket');
var logger = require('../../../logger.js');
var executor = require('./executor')
var scheduler = require('./scheduler')
const constants = require('./executionConstants')
if (process.env.REPORT_SIZE_LIMIT) require('follow-redirects').maxBodyLength = parseInt(process.env.REPORT_SIZE_LIMIT) * 1024 * 1024;

module.exports.ExecutionInvoker = class ExecutionInvoker {

    executeActiveTestSuite = async function (batchExecutionData, execIds, userInfo, type) {
        try {
            var result = await executor.execute(batchExecutionData, execIds, userInfo, type);
        } catch (ex) {
            var result = "fail";
            logger.error("Error in executeTestSuite. Error: %s", ex)
        }
        if(batchExecutionData['configurekey']) return 'pass'
        let reportResult = {};
        batchExecutionData.batchInfo[0]["testsuitename"] = batchExecutionData.batchInfo[0]["testsuiteName"];

        reportResult["testSuiteIds"] = batchExecutionData.batchInfo;
        reportResult["status"] = result;
        let username = userInfo.username;
        this.setNotifications(username, reportResult);
        return result;
    }

    executeScheduleTestSuite = async function (batchExecutionData, execIds, userInfo, type) {
        const scheduleId = execIds["scheduleId"];
        const fnName = "executeScheduleTestSuite";
        var version = '-';
        try {
            result = await executor.execute(batchExecutionData, execIds, userInfo, type);
        } catch (ex) {
            result = "fail";
            logger.error("Error in " + fnName + " service. Error: %s", ex)
        }
        result = (result == "success") ? "Completed" : ((result == "UserTerminate") ? "Terminate" : result);
        let schedStatus = result;
        if (!["Completed", "Terminate", "Skipped", "fail"].includes(result)) {
            let msg = "This scenario was skipped ";
            if ([constants.SOCK_NA, constants.SOCK_NORM, "NotApproved", "NoTask", "Modified"].indexOf(result) > -1) {
                if (result == constants.SOCK_NA) msg += "due to unavailability of ICE";
                else if (result == constants.SOCK_NORM) msg += "due to unavailability of ICE in schedule mode";
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
            const currExecIds = await executor.generateExecutionId(execIds, tsuIds, userInfo.userid, version);
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
                await this.updateSkippedExecutionStatus(batchObj, userInfo, result, msg);
            }
        }
        await scheduler.updateScheduleStatus(scheduleId, schedStatus, execIds.batchid);
        let reportResult = {};
        batchExecutionData.batchInfo[0]["testsuitename"] = batchExecutionData.batchInfo[0]["testsuiteName"];
        reportResult["testSuiteIds"] = batchExecutionData.batchInfo;
        reportResult["status"] = schedStatus;
        let username = userInfo.invokingusername;
        this.setNotifications(username, reportResult)
    }

    setNotifications = async (username, reportResult) => {
        var notification_dict = cache.get("pending_notification");
        const notifySocMap = myserver.socketMapNotify;
        if (notifySocMap && notifySocMap[username] && notifySocMap[username].connected) {
            notifySocMap[username].emit("display_execution_popup", [reportResult]);
        } else {
            if (!(username in notification_dict)) {
                notification_dict[username] = [];
            }
            notification_dict[username].push(reportResult)
            cache.set("pending_notification", notification_dict)
        }
    }

    executeAPI = async (testSuite) => {
        const req = testSuite.testSuiteRequest;
        var res = testSuite.res;
        var userInfo = testSuite.userInfo;
        var execResponse = userInfo.inputs;
        const hdrs = req.headers;
        let reqFromADO = false;
        if (hdrs["user-agent"].startsWith("VSTS") && hdrs.planurl && hdrs.projectid) {
            reqFromADO = true;
            res = null;
        }
        const batchExecutionData = req.executionData;
        var statusCode = '500'
        const execIds = { "batchid": "generate", "execid": {} };
        let result;
        try {
            result = await executor.execute(batchExecutionData, execIds, userInfo, "API");
        } catch (ex) {
            result = "fail";
            logger.error("Error in ExecuteTestSuite_ICE_API service. Error: %s", ex)
        }

        switch (result) {
            case constants.SOCK_NA:
                statusCode = '461';
                execResponse.error_message = constants.SOCK_NA_MSG;
                break;
            case "NotApproved":
                statusCode = '463';
                execResponse.error_message = "All the dependent tasks (design, scrape) needs to be approved before execution"
                break;
            case "NoTask":
                statusCode = '463';
                execResponse.error_message = "Task does not exist for child node";
                break;
            case "Modified":
                statusCode = '463';
                execResponse.error_message = "Task has been modified, Please approve the task";
                break;
            case "Skipped":
                statusCode = '409'
                execResponse.error_message = "Execution is skipped because another execution is running in ICE";
                break;
            case "fail":
                execResponse.error_message = "Internal error occurred during execution"
                break;
            case "gitfail":
                execResponse.error_message = "Internal error occurred during versioning execution"
                break;
            case "empty":
                execResponse.error_message = "Invalid versioning details entered. Please check your inputs!"
                break;
            default:
                switch(result[2]){
                    case 'userTerminate':
                        statusCode = '462';
                        break;
                    case 'programTerminate':
                        statusCode = '463';
                        break;
                    case 'pass':
                        statusCode = '200';
                        break;
                    default:
                        statusCode = '202';
                        break
                }
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
        const finalResult = { "executionStatus": execResponse };
        if (!reqFromADO) {
            if (!res) {
                logger.error("Error while sending response in executeAPI, response object undefined");
                return;
            }
            res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES[statusCode]);
            return res.status(statusCode).send(finalResult);
        }
        // This code only executes when request comes from Azure DevOps
        const args = {
            data: { "name": "TaskCompleted", "taskId": hdrs.taskinstanceid, "jobId": hdrs.jobid, "result": finalResult.executionStatus.status },
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

    setExecStatus = async function (batchExecutionData, execIds, userInfo, type) {
        try {
            var result = await executor.setExecStatus(batchExecutionData, execIds, userInfo, type);
        } catch (ex) {
            var result = "fail";
            logger.error("Error in setExecStatus. Error: %s", ex)
        }
        // if(batchExecutionData['configurekey']) return 'pass'
        // let reportResult = {};
        // batchExecutionData.batchInfo[0]["testsuitename"] = batchExecutionData.batchInfo[0]["testsuiteName"];

        // reportResult["testSuiteIds"] = batchExecutionData.batchInfo;
        // reportResult["status"] = result;
        // let username = userInfo.username;
        // this.setNotifications(username, reportResult);
        return result;
    }
}