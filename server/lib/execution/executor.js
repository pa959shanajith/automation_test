const utils = require('../utils');
const redisServer = require('../redisSocketHandler');
var myserver = require('../socket');
var logger = require('../../../logger.js');
const accessibility_testing = require("../../controllers/accessibilityTesting")
const notifications = require('../../notifications');
var queue = require('./executionQueue')
if (process.env.REPORT_SIZE_LIMIT) require('follow-redirects').maxBodyLength = parseInt(process.env.REPORT_SIZE_LIMIT) * 1024 * 1024;
const constants = require('./executionConstants')
var testSuiteExecutor = undefined;
class TestSuiteExecutor {
    /** Function responsible for updating execution counter for licensing */
    counterUpdater = async (count, userid) => {
        const updateinp = {
            "query": "testsuites",
            "count": count,
            "userid": userid
        };
        return utils.fetchData(updateinp, "utility/dataUpdator_ICE", "counterUpdater");
    };

    /** Function responsible for fetching testcase and qcdetails for given scenarioid */
    fetchScenarioDetails = async (scenarioid, userid, integrationType, gitflag) => {
        const fnName = "fetchScenarioDetails";
        const scenario = {};
        const allTestcaseSteps = [];
        const qcDetailsList = [];
        const allTestcaseObj = {};
        var inputs = null;

        if(!gitflag){
            // Step 1: Get Testcase details
            inputs = {
                "query": "testcasedetails",
                "id": scenarioid,
                "userid": userid
            };
            var testcases = await utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", fnName);
            if (testcases == "fail") return "fail";

            // Step 2: Get Testcasesteps
            for (const tc of testcases) {
                if (allTestcaseObj[tc._id] === undefined) {
                    inputs = {
                        "testcaseid": tc._id,
                        "screenid": tc.screenid,
                        "versionnumber": tc.versionnumber,
                        "userid": userid,
                        "query": "readtestcase"
                    };
                    const testcasedata = await utils.fetchData(inputs, "design/readTestCase_ICE", fnName);
                    if (testcasedata == "fail") return "fail";
                    allTestcaseObj[tc._id] = testcasedata[0];
                }
            }

            testcases.forEach(async (tc) => {
                allTestcaseSteps.push({
                    "template": "",
                    "testcase": allTestcaseObj[tc._id].steps,
                    "testcasename": allTestcaseObj[tc._id].name,
                    "screenid": tc.screenid,
                    "screenname": tc.screenname
                });
            });

            scenario.testcase = JSON.stringify(allTestcaseSteps);
        }
        // Step 3: Get qcdetails
        scenario.qcdetails = [];
        for (var k = 0; k < integrationType.length; ++k) {
            inputs = {
                "testscenarioid": scenarioid
            };
            const integ = integrationType[k];
            if (integ == 'qTest') inputs.query = "qtestdetails";
            else if (integ == 'ALM') inputs.query = "qcdetails";
            else if (integ == 'Zephyr') inputs.query = "zephyrdetails";
            if (inputs.query) {
                const qcdetails = await utils.fetchData(inputs, "qualityCenter/viewIntegrationMappedList_ICE", fnName);
                if (integ == 'ALM' && Array.isArray(qcdetails)) {
                    for (let i = 0; i < qcdetails.length; ++i) {
                        if (qcdetails[i] != "fail") qcDetailsList.push(JSON.parse(JSON.stringify(qcdetails[i])));
                    }
                    if (qcDetailsList.length > 0) scenario.qcdetails.push(qcDetailsList);
                } else {
                    if (qcdetails != "fail" && qcdetails.length > 0) scenario.qcdetails.push(JSON.parse(JSON.stringify(qcdetails[0])));
                }
            }
        }
        return scenario;
    };

    /** Function responsible for creating execution request json that will be consumed by ICE */
    prepareExecutionRequest = async (batchData, userInfo, gitflag) => {
        if (!batchData.executionEnv || batchData.executionEnv === "") {
            batchData.executionEnv = "default";
        }
        const execReq = {
            "exec_mode": batchData.exectionMode,
            "exec_env": batchData.executionEnv,
            "apptype": batchData.batchInfo[0].appType,
            "integration": batchData.integration,
            "batchId": "",
            "executionIds": [],
            "testsuiteIds": [],
            "suitedetails": [],
            "reportType": "functionalTesting",
            "versionname":"NA"
        };
        const gitInfo = batchData.gitInfo;
        if(gitflag){
            var folderPath = gitInfo['folderPath'];
            if(!folderPath.startsWith("avoassuretest_artifacts")){
                folderPath="avoassuretest_artifacts/"+folderPath
            }
            const inputs = {
                "gitbranch":gitInfo['gitbranch'],
                "gitVersionName":gitInfo['gitVersionName'],
                "folderPath":folderPath,
                "userid":userInfo.userid
            };
            const module_data = await utils.fetchData(inputs, "git/importFromGit_ICE");
            if (module_data == "gitfail") return "gitfail";
            if(module_data == "empty") return "empty";
            execReq['apptype']=module_data.batchInfo[0].apptype;
            execReq['versionname']=gitInfo['gitVersionName'];
            var batchInfo = module_data.batchInfo;
            var suite_details=module_data.suitedetails;
            const gittaskApproval = await utils.approvalStatusCheck(batchInfo);
            if (gittaskApproval.res !== "pass") return taskApproval.res;
        } else{
            var batchInfo = batchData.batchInfo;
        }
        for (const suite of batchInfo) {
            const testsuiteid = suite.testsuiteId;
            const scenarioList = [];
            const suiteObj = {
                "browserType": batchData.browserType,
                "testsuitename": suite.testsuiteName,
                "testsuiteid": suite.testsuiteId,
                "domainname": suite.domainName,
                "projectid": suite.projectId,
                "projectname": suite.projectName,
                "releaseid": suite.releaseId,
                "cyclename": suite.cycleName,
                "cycleid": suite.cycleId,
                "condition": [],
                "dataparampath": [],
                "scenarioNames": [],
                "scenarioIds": [],
                "accessibilityMap": {}
            };
            const suiteDetails = suite.suiteDetails;
            for (const tsco of suiteDetails) {
                var integrationType = [];
                if (batchData.integration && batchData.integration.alm.url) {
                    integrationType.push("ALM");
                }
                if (batchData.integration && batchData.integration.qtest.url) {
                    integrationType.push("qTest");
                }
                if (batchData.integration && batchData.integration.zephyr.url) {
                    integrationType.push("Zephyr");
                }
                var scenario = await this.fetchScenarioDetails(tsco.scenarioId, userInfo.userid, integrationType, gitflag);
                if (scenario == "fail") return "fail";
                scenario = Object.assign(scenario, tsco);
                suiteObj.accessibilityMap[scenario.scenarioId] = tsco.accessibilityParameters;
                suiteObj.condition.push(scenario.condition);
                suiteObj.dataparampath.push(scenario.dataparam[0]);
                suiteObj.scenarioNames.push(scenario.scenarioName);
                suiteObj.scenarioIds.push(scenario.scenarioId);
                const scenarioObj = {};
                if(gitflag){
                    scenarioObj[scenario.scenarioId] = suite_details[tsco.scenarioId];
                } else {
                    scenarioObj[scenario.scenarioId] = scenario.testcase;
                }
                scenarioObj.qcdetails = scenario.qcdetails;
                scenarioList.push(scenarioObj);
            }
            if (suite.scenarioTaskType == "exclusive") execReq.reportType = "accessiblityTestingOnly";
            suiteObj[testsuiteid] = scenarioList;
            execReq.testsuiteIds.push(testsuiteid);
            execReq.suitedetails.push(suiteObj);
        }
        return execReq;
    };

    /** Function responsible for generating batchid and executionid dfor given list of testsuiteid */
    generateExecutionIds = async (execIds, tsuIds, userid, versionname) => {
        for (const tsuid of tsuIds) {
            if (execIds.execid[tsuid] == undefined) execIds.execid[tsuid] = null;
        }
        const inputs = {
            "query": "insertintoexecution",
            "executedby": userid,
            "testsuiteids": tsuIds,
            "executionids": execIds.execid,
            "batchid": execIds.batchid,
            "versionname": versionname
        };
        const newExecIds = await utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", "generateExecutionIds");
        if (newExecIds == "fail") return "fail";
        execIds.batchid = newExecIds.batchid;
        execIds.execid = newExecIds.execids;
        return newExecIds;
    };

    /** Function responsible for inserting reports */
    insertReport = async (executionid, scenarioId, browserType, userInfo, reportData) => {
        const inputs = {
            "executionid": executionid,
            "testscenarioid": scenarioId,
            "browser": browserType,
            "status": reportData.overallstatus[0].overallstatus,
            "report": JSON.stringify(reportData),
            "modifiedby": userInfo.invokinguser,
            "modifiedbyrole": userInfo.invokinguserrole,
            "query": "insertreportquery"
        };
        const result = utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", "insertReport");
        return result;
    };

    /** Function responsible for updating execution status/starttime/endtime before/after execution */
    updateExecutionStatus = async (execIds, data) => {
        const fnName = "updateExecutionStatus";
        logger.info("Calling function " + fnName + " from executionFunction");
        const inputs = {
            "query": "updateintoexecution",
            "executionids": execIds,
            ...data
        };
        const response = await utils.fetchData(inputs, "suite/ExecuteTestSuite_ICE", fnName);
        return response;
    };

    /** Function responsible for updating execution status and insert reports for the skipped scenarios. */
    updateSkippedExecutionStatus = async (batchData, userInfo, status, msg) => {
        const dt = new Date();
        const currtime = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds() + '.' + dt.getMilliseconds();
        //const currtime = new Date(dt.getTime()-dt.getTimezoneOffset()*60000).toISOString().replace('T',' ').replace('Z','');
        const reportData = {
            'rows': [{ 'id': '1', 'Keyword': '', 'parentId': '', 'status': status, 'Step ': '', 'Comments': null, 'StepDescription': msg, "screenshot_path": null, "EllapsedTime": "0:00:00.000000", "Remark": "", "testcase_details": "" }],
            'overallstatus': [{ 'EllapsedTime': '0:00:00.000000', 'EndTime': currtime, 'browserVersion': 'NA', 'versionname': 'NA', 'StartTime': currtime, 'overallstatus': status, 'browserType': 'NA' }],
            'commentsLength': []
        }
        const executionIds = batchData.executionIds;
        for (let i = 0; i < batchData.suitedetails.length; i++) {
            const suite = batchData.suitedetails[i];
            if (!suite.reportData) suite.reportData = [];
            for (let idx = 0; idx < suite.scenarioIds.length; idx++) {
                const scid = suite.scenarioIds[idx];
                const scenarioname = suite.scenarioNames[idx];
                const reportid = await this.insertReport(executionIds[i], scid, "N/A", userInfo, reportData);
                const reportItem = { reportid, scenarioname, status, terminated: 'N/A' };
                if (reportid == "fail") {
                    logger.error("Failed to insert report data for scenario (id: " + scid + ") with executionid " + executionIds[i]);
                    reportItem[reportid] = '';
                } else {
                    logger.info("Successfully inserted report data");
                    logger.debug("Successfully inserted report data for scenario (id: " + scid + ") with executionid " + executionIds[i]);
                }
                suite.reportData.push(reportItem);
            };
            notifications.notify("report", { ...suite, user: userInfo, status, suiteStatus: "fail" });
        }
        await this.updateExecutionStatus(executionIds, { status: "fail" });
    };

    /** Function responsible for sending execution request to ICE and reciving reports and status */
    executionRequestToICE = async (execReq, execType, userInfo) => {
        const fnName = "executionRequestToICE";
        logger.info("Inside " + fnName + " function");
        const username = userInfo.username;
        const invokinguser = userInfo.invokingusername;
        const icename = userInfo.icename;
        const _this = this;
        const channel = "normal";
        var reportType = "accessiblityTestingOnly";
        logger.info("Sending request to ICE for executeTestSuite");
        const dataToIce = { "emitAction": "executeTestSuite", "username": icename, "executionRequest": execReq };
        redisServer.redisPubICE.publish('ICE1_' + channel + '_' + icename, JSON.stringify(dataToIce));

        const exePromise = async (resSent) => (new Promise((rsv, rej) => {
            var d2R = {};
            async function executeTestSuite_listener(channel, message) {
                const data = JSON.parse(message);
                const event = data.onAction;
                const resultData = data.value;
                const batchId = (resultData) ? resultData.batchId : "";
                const executionid = (resultData) ? resultData.executionId : "";
                if (!(icename == data.username && (event == constants.SOCK_NA || (event != constants.SOCK_NA && execReq.batchId == batchId)))) return false;
                const status = resultData.status;
                if (event == constants.SOCK_NA) {
                    redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
                    logger.error("Error occurred in " + fnName + ": Socket Disconnected");
                    if (resSent && notifySocMap[invokinguser]) {
                        notifySocMap[invokinguser].emit("ICEnotAvailable");
                        rsv(constants.DO_NOT_PROCESS);
                    } else rsv(constants.SOCK_NA);
                } else if (event == "return_status_executeTestSuite") {
                    if (status === "success") {
                        if (execType == "SCHEDULE") await _this.updateScheduleStatus(execReq.scheduleId, "Inprogress", batchId);
                    } else if (status === "skipped") {
                        const execStatus = "Skipped";
                        var errMsg = (execType == "SCHEDULE") ? "due to conflicting schedules" :
                            "because another execution is running in ICE";
                        redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
                        logger.error("Error occurred in " + fnName + ": Execution is skipped " + errMsg);
                        errMsg = "This scenario was skipped " + errMsg;
                        let report_result = {};
                        report_result["status"] = execStatus
                        report_result["testSuiteDetails"] = execReq["suitedetails"]
                        await _this.updateSkippedExecutionStatus(execReq, userInfo, execStatus, errMsg);
                        if (resSent && notifySocMap[invokinguser] && notifySocMap[invokinguser].connected) {
                            notifySocMap[invokinguser].emit(execStatus);
                            rsv(constants.DO_NOT_PROCESS);
                        } else if (resSent) {
                            queue.Execution_Queue.add_pending_notification("", report_result, username);
                            rsv(constants.DO_NOT_PROCESS);
                        } else rsv(execStatus);
                    } else if (status === "started") {
                        await _this.updateExecutionStatus([executionid], { starttime: resultData.startTime });
                    } else if (status === "finished") {
                        const testsuiteIndex = execReq.testsuiteIds.indexOf(resultData.testsuiteId);
                        const testsuite = execReq.suitedetails[testsuiteIndex];
                        const exeStatus = resultData.executionStatus ? "pass" : "fail";
                        await _this.updateExecutionStatus([executionid], { endtime: resultData.endTime, status: exeStatus });
                        if (reportType != "accessiblityTestingOnly")
                            notifications.notify("report", { ...testsuite, user: userInfo, status, suiteStatus: exeStatus });
                    }
                } else if (event == "result_executeTestSuite") {
                    if (!status) { // This block is for report data
                        if ("accessibility_reports" in resultData) {
                            const accessibility_reports = resultData.accessibility_reports
                            accessibility_testing.saveAccessibilityReports(accessibility_reports);
                        }
                        if (resultData.report_type != "accessiblityTestingOnly") reportType = "functionalTesting";
                        const scenarioid = resultData.scenarioId;
                        const testsuiteid = resultData.testsuiteId;
                        const testsuiteIndex = execReq.testsuiteIds.indexOf(testsuiteid);
                        const testsuite = execReq.suitedetails[testsuiteIndex];
                        const scenarioIndex = testsuite.scenarioIds.indexOf(scenarioid);
                        const scenarioname = testsuite.scenarioNames[scenarioIndex];
                        if (!testsuite.reportData) testsuite.reportData = [];//Array.from({length: testsuite.scenarioIds.length}, () => {});
                        try {
                            const reportData = JSON.parse(JSON.stringify(resultData.reportData).replace(/'/g, "''"));
                            if (execType == "API") {
                                if (d2R[testsuiteid] === undefined) d2R[testsuiteid] = { "testsuiteName": testsuite.testsuitename, "testsuiteId": testsuiteid, "scenarios": {} };
                                if (d2R[testsuiteid].scenarios[scenarioid] === undefined) d2R[testsuiteid].scenarios[scenarioid] = [];
                                d2R[testsuiteid].scenarios[scenarioid].push({ scenarioname, scenarioid, "overallstatus": "Not Executed" });
                            }
                            if (reportData.overallstatus.length !== 0) {
                                const appTypes = ["OEBS", "MobileApp", "System", "Webservice", "Mainframe", "SAP", "Desktop"];
                                const browserType = (appTypes.indexOf(execReq.apptype) > -1) ? execReq.apptype : reportData.overallstatus[0].browserType;
                                reportData.overallstatus[0].browserType = browserType;
                                if (execType == "API") {
                                    const cidx = d2R[testsuiteid].scenarios[scenarioid].length - 1;
                                    d2R[testsuiteid].scenarios[scenarioid][cidx] = { ...d2R[testsuiteid].scenarios[scenarioid][cidx], ...reportData.overallstatus[0] };
                                }
                                const reportStatus = reportData.overallstatus[0].overallstatus;
                                const reportid = await _this.insertReport(executionid, scenarioid, browserType, userInfo, reportData);
                                const reportItem = { reportid, scenarioname, status: reportStatus, terminated: reportData.overallstatus[0].terminatedBy };
                                if (reportid == "fail") {
                                    logger.error("Failed to insert report data for scenario (id: " + scenarioid + ") with executionid " + executionid);
                                    reportItem[reportid] = '';
                                } else {
                                    logger.info("Successfully inserted report data");
                                    logger.debug("Successfully inserted report data for scenario (id: " + scenarioid + ") with executionid " + executionid);
                                }
                                // testsuite.reportData[scenarioIndex] = reportItem;
                                testsuite.reportData.push(reportItem);
                            }
                        } catch (ex) {
                            logger.error("Exception in the function " + fnName + ": insertreportquery: %s", ex);
                            if (reportType != "accessiblityTestingOnly") notifications.notify("report", { ...testsuite, user: userInfo, status, suiteStatus: "fail" });
                            await this.updateExecutionStatus([executionid], { status: "fail" });
                        }
                    } else { // This block will trigger when resultData.status has "success or "Terminate"
                        redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
                        try {
                            let result = status;
                            let report_result = {};
                            report_result["status"] = status
                            if (reportType == 'accessiblityTestingOnly' && status == 'success') report_result["status"] = 'accessibilityTestingSuccess';
                            if (reportType == 'accessiblityTestingOnly' && status == 'Terminate') report_result["status"] = 'accessibilityTestingTerminate';
                            report_result["testSuiteDetails"] = execReq["suitedetails"]
                            if (resultData.userTerminated) result = "UserTerminate";
                            if (execType == "API") result = [d2R, status];
                            if (resSent && notifySocMap[invokinguser] && notifySocMap[invokinguser].connected) { // This block is only for active mode
                                notifySocMap[invokinguser].emit("result_ExecutionDataInfo", report_result);
                                rsv(constants.DO_NOT_PROCESS);
                            } else if (resSent) {
                                queue.Execution_Queue.add_pending_notification("", report_result, username);
                                rsv(constants.DO_NOT_PROCESS);
                            } else {
                                rsv(result);
                            }
                        } catch (ex) {
                            logger.error("Exception while returning execution status from function " + fnName + ": %s", ex);
                            rej("fail");
                        }
                    }
                }
            }
            redisServer.redisSubServer.on("message", executeTestSuite_listener);
        }));

        const notifySocMap = myserver.socketMapNotify;
        if (execType == "ACTIVE" && notifySocMap && notifySocMap[invokinguser]) {
            exePromise(true);
            return "begin";
        } else return await exePromise(false);
    };

    /** Function responsible for Orchestrating execution flow. Invokes series of functions to achive the results */
    executionFunction = async (batchExecutionData, execIds, userInfo, execType) => {
        //const icename = (execType=='API')? userInfo.icename : myserver.allSocketsICEUser[userInfo.username];
        var icename = userInfo.icename;
        var gitflag = false;
        //userInfo.icename=icename;
        redisServer.redisSubServer.subscribe('ICE2_' + icename);
        //var iceStatus = await checkForICEstatus(icename, execType);
        //if (iceStatus != null) return iceStatus;
        var gitInfo = batchExecutionData.gitInfo;
        for (let key in gitInfo){
            if(gitInfo[key]!='') gitflag=true; break;
        }
        if(!gitflag){
            const taskApproval = await utils.approvalStatusCheck(batchExecutionData.batchInfo);
            if (taskApproval.res !== "pass") return taskApproval.res;
        }
        /*const countStatus =*/ await this.counterUpdater(batchExecutionData.batchInfo.length, userInfo.invokinguser);
        // if (countStatus == "fail") return "fail";
        const executionRequest = await this.prepareExecutionRequest(batchExecutionData, userInfo, gitflag);
        if (executionRequest == "fail") return "fail";
        if (executionRequest == "gitfail") return "gitfail";
        if (executionRequest == "empty") return "empty";
        const currExecIds = await this.generateExecutionIds(execIds, executionRequest.testsuiteIds, userInfo.invokinguser, executionRequest.versionname);
        if (currExecIds == "fail") return "fail";
        executionRequest.batchId = currExecIds.batchid;
        executionRequest.executionIds = executionRequest.testsuiteIds.map(i => currExecIds.execids[i]);
        if (execType == "SCHEDULE") executionRequest.scheduleId = batchExecutionData.scheduleId;
        const result = await this.executionRequestToICE(executionRequest, execType, userInfo);
        return result;
    };


}

module.exports.execute = async (batchExecutionData, execIds, userInfo, execType) =>{
    if (!testSuiteExecutor){
        testSuiteExecutor =  new TestSuiteExecutor();
    }
    var result = await testSuiteExecutor.executionFunction(batchExecutionData, execIds, userInfo, execType)
    return result;
}
