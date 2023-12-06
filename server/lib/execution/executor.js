const utils = require('../utils');
var myserver = require('../socket');
var logger = require('../../../logger.js');
const reports = require("../../controllers/report")
const notifications = require('../../notifications');
var queue = require('./executionQueue')
var scheduler = require('./scheduler')
if (process.env.REPORT_SIZE_LIMIT) require('follow-redirects').maxBodyLength = parseInt(process.env.REPORT_SIZE_LIMIT) * 1024 * 1024;
const constants = require('./executionConstants');
const { setExecStatus } = require('../../controllers/suite');
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
    fetchScenarioDetails = async (scenarioid, userid, integrationType, gitflag, dtparam) => {
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
                "userid": userid,
                "dtparam": dtparam
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
                    allTestcaseObj[tc._id] = testcasedata.tc[0];
                }
            }

        testcases.forEach(async (tc) => {
            allTestcaseSteps.push({
                "template": "",
                "testcase": allTestcaseObj[tc._id].steps,
                "testcasename": allTestcaseObj[tc._id].name,
                "screenid": tc.screenid,
                "screenname": tc.screenname,
                "datatables": tc.datatables
            });
        });

            scenario.testcase = JSON.stringify(allTestcaseSteps);
        }
        // Step 3: Get qcdetails
        scenario.qcdetails = [];
        for (var k = 0; k < integrationType.length; ++k) {
            inputs = {
                "testscenarioid": scenarioid,
                "userid":userid
            };
            const integ = integrationType[k];
            if (integ == 'qTest') inputs.query = "qtestdetails";
            else if (integ == 'ALM') inputs.query = "qcdetails";
            else if (integ == 'Zephyr') inputs.query = "zephyrdetails";
            else if (integ == 'Azure') inputs.query = "azuredetails";
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
            "apptype": batchData.batchInfo == undefined? '' : batchData.batchInfo[0].appType,
            'batchname': batchData.batchInfo == undefined? '' : batchData.batchInfo[0].batchname,
            "smart": batchData.type == undefined ? false : batchData.type.includes('smart'),
            "integration": batchData.integration,
            "scenarioFlag": batchData.scenarioFlag,
            "executingOn": batchData.executingOn,
            "batchId": "",
            "executionIds": [],
            "testsuiteIds": [],
            "suitedetails": [],
            "reportType": "functionalTesting",
            "version":"-"
        };
        if(batchData.executionEnv == 'saucelabs' && batchData.batchInfo.length) {
            execReq['sauce_username'] = batchData.sauce_username
            execReq['sauce_access_key'] = batchData.sauce_access_key
            execReq['remote_url'] = batchData.remote_url
            if(batchData.batchInfo[0].appType == 'Web') {
                execReq['browserVersion'] = batchData.browserVersion
                execReq['platform'] = batchData.platform
            } else {
                execReq["mobile"] = batchData.mobile
            }
        }
        if(batchData.executionEnv == 'browserstack' && batchData.batchInfo.length) {
            execReq['browserstack_username'] = batchData.browserstack_username
            execReq['browserstack_access_key'] = batchData.browserstack_access_key
            if(batchData.batchInfo[0].appType == 'Web') {
                execReq['browserVersion'] = batchData.browserVersion
                execReq['osVersion'] = batchData.osVersion
                execReq['browserName'] = batchData.browserName
                execReq['os'] = batchData.os
            } else {
                execReq["mobile"] = batchData.mobile
            } 
        }
        const gitInfo = batchData.gitInfo;
        if(gitflag){
            var folderPath = gitInfo['folderPath'];
            if(!folderPath.startsWith("avoassuretest_artifacts")){
                folderPath="avoassuretest_artifacts/"+folderPath
            }
            const inputs = {
                "gitbranch":gitInfo['gitbranch'],
                "gitname":gitInfo['gitConfiguration'],
                "gitVersion":gitInfo['gitVersion'],
                "folderPath":folderPath,
                "userid":userInfo.userid
            };
            const module_data = await utils.fetchData(inputs, "git/importFromGit_ICE");
            if (module_data == "gitfail") return "gitfail";
            if(module_data == "empty") return "empty";
            execReq['apptype']=module_data.batchInfo[0].apptype;
            execReq['version']=gitInfo['gitVersion'];
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
                var dtparam = [];
                if (batchData.integration && batchData.integration.alm && batchData.integration.alm.url) {
                    integrationType.push("ALM");
                }
                if (batchData.integration && batchData.integration.qtest && batchData.integration.qtest.url) {
                    integrationType.push("qTest");
                }
                if (batchData.integration && batchData.integration.zephyr && batchData.integration.zephyr.url) {
                    integrationType.push("Zephyr");
                }
                if (batchData.integration && batchData.integration.azure && batchData.integration.azure.url) {
                   integrationType.push("Azure");
                }
                if (tsco.dataparam != "") {
                    var dt = tsco.dataparam[0].split(';')[0].split('/');
                    if (dt[0] == 'avoassure') dtparam.push(dt[1]);
                }
                var scenario = await this.fetchScenarioDetails(tsco.scenarioId, userInfo.userid, integrationType, gitflag, dtparam);
                if (scenario == "fail") return "fail";
                scenario = Object.assign(scenario, tsco);
                suiteObj.accessibilityMap[scenario.scenarioId] = tsco.accessibilityParameters;
                suiteObj.condition.push(scenario.condition);
                suiteObj.dataparampath.push(scenario.dataparam[0]);
                let scName = scenario.scenarioName || scenario.scenarioname
                suiteObj.scenarioNames.push(scName);
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
    generateExecutionIds = async (execIds, tsuIds, userid, version, batchname=undefined, smart=false,batchExecutionData) => {
        for (const tsuid of tsuIds) {
            if (execIds.execid[tsuid] == undefined) execIds.execid[tsuid] = null;
        }
        const inputs = {
            "query": "insertintoexecution",
            "executedby": userid,
            "testsuiteids": tsuIds,
            "executionids": execIds.execid,
            "batchid": execIds.batchid,
            "smart":smart,
            "version": version
        };
        if(batchname)inputs['batchname']=batchname
        if(batchExecutionData.configurekey || batchExecutionData.configureKey) {
            inputs['configurekey']=batchExecutionData.configurekey || batchExecutionData.configureKey;
            inputs['executionListId']=batchExecutionData.executionListId
            inputs['projectId'] = batchExecutionData.batchInfo[0].projectId;
            inputs['releaseName'] =  batchExecutionData.batchInfo[0].releaseId;
            inputs['cycleId'] =  batchExecutionData.batchInfo[0].cycleId;
        }
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
            "status": reportData.overallstatus.overallstatus,
            "overallstatus": reportData.overallstatus,
            "report": JSON.stringify(reportData),
            "modifiedby": userInfo.invokinguser,
            "modifiedbyrole": userInfo.invokinguserrole,
            "query": "insertreportquery",
            "host":userInfo.host
        };
        logger.info("DL------>inputs in insertReport", inputs);
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
        logger.info("DL------>inputs in updateExecutionStatus", inputs);
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
            'overallstatus': [{ 'EllapsedTime': '0:00:00.000000', 'EndTime': currtime, 'browserVersion': 'NA', 'version': 'NA', 'StartTime': currtime, 'overallstatus': status, 'browserType': 'NA' }],
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
        const host = userInfo.host;
        const _this = this;
        const scenarioFlag = execReq.scenarioFlag;
        const channel = "normal";
        var reportType = "accessiblityTestingOnly";
        
        const dataToIce = { "emitAction": "executeTestSuite", "username": icename, "executionRequest": execReq };
        if(execReq['executingOn'] && execReq['executingOn'] =='Agent'){
            // const status = await utils.fetchData(dataToIce, "devops/executionList", fnName);
            // if (status == "fail" || status == "forbidden") return "fail";
            // return 'CICD'
            return dataToIce;
        }
        else{
            var socket = require('../socket');
            var mySocket;
            var clientName=utils.getClientName(host);
            mySocket = socket.allSocketsMap[clientName][icename];	
            logger.info("Sending request to ICE for executeTestSuite");
            mySocket.emit("executeTestSuite", execReq);
            const exePromise = async (resSent) => (new Promise((rsv, rej) => {
                var d2R = {};
                
                mySocket.on("return_status_executeTestSuite",async (message)=>{
                    const data = message;
                    const event = "return_status_executeTestSuite";
                    const resultData = data;
                    const batchId = (resultData) ? resultData.batchId : "";
                    const executionid = (resultData) ? resultData.executionId : "";
                    const status = resultData.status;
                    logger.info("DL------>result data in return_status_executeTestSuite", resultData);
		            logger.info("DL------>clientName %s in return_status_executeTestSuite", clientName);
                    if (status === "success") {
                        if (execType == "SCHEDULE") await scheduler.updateScheduleStatus(execReq.scheduleId, "Inprogress", batchId);
                    } else if (status === "skipped") {
                        const execStatus = "Skipped";
                        var errMsg = (execType == "SCHEDULE") ? "due to conflicting schedules" :
                            "because another execution is running in ICE";
                        // mySocket.removeListener("message", executeTestSuite_listener);
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
                        if (reportType != "accessiblityTestingOnly" && testsuiteIndex === execReq.testsuiteIds.length - 1)
                            notifications.notify("report", { testsuite: execReq.suitedetails, user: userInfo, status, suiteStatus: exeStatus, scenarioFlag: scenarioFlag, profileName: execReq.configurename || execReq.profileName, recieverEmailAddress: execReq.recieverEmailAddress, executionType: execType });
                    }
                });
                mySocket.on("result_executeTestSuite", async (message)=>{
                    const data = message;
                    const event = "return_status_executeTestSuite";
                    const resultData = data;
                    const batchId = (resultData) ? resultData.batchId : "";
                    const executionid = (resultData) ? resultData.executionId : "";
                    const status = resultData.status;
                    logger.info("DL------>result data in result_executeTestSuite", resultData);
		            logger.info("DL------>clientName %s in result_executeTestSuite", clientName);
                        if (!status) { // This block is for report data
                            if ("accessibility_reports" in resultData) {
                                const accessibility_reports = resultData.accessibility_reports
                                reports.saveAccessibilityReports(accessibility_reports);
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
                                if (Object.keys(reportData.overallstatus).length !== 0) {
                                    const appTypes = ["OEBS", "MobileApp", "System", "Webservice", "Mainframe", "SAP", "Desktop"];
                                    const browserType = (appTypes.indexOf(execReq.apptype) > -1) ? execReq.apptype : reportData.overallstatus.browserType;
                                    reportData.overallstatus.browserType = browserType;
                                    if (execType == "API") {
                                        const cidx = d2R[testsuiteid].scenarios[scenarioid].length - 1;
                                        d2R[testsuiteid].scenarios[scenarioid][cidx] = { ...d2R[testsuiteid].scenarios[scenarioid][cidx], ...reportData.overallstatus };
                                    }
                                    const reportStatus = reportData.overallstatus.overallstatus;
                                    logger.info("DL------>mySocket host before insertreport %s in result_executeTestSuite", mySocket.request.headers.host);
                                    logger.info("DL------>userInfo before insertreport %s in result_executeTestSuite", userInfo.host);
                                    userInfoReport = userInfo;
                                    userInfoReport.host = mySocket.request.headers.host;
                                    const reportid = await _this.insertReport(executionid, scenarioid, browserType, userInfoReport, reportData);
                                    const reportItem = { reportid, scenarioname, status: reportStatus, terminated: reportData.overallstatus.terminatedBy, timeEllapsed: reportData.overallstatus.EllapsedTime };
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
                                if (reportType != "accessiblityTestingOnly") notifications.notify("report", { testsuite: execReq.suitedetails, user: userInfo, status, suiteStatus: "fail", scenarioFlag: scenarioFlag, profileName: execReq.profileName, recieverEmailAddress: execReq.recieverEmailAddress, executionType: execType });
                                await this.updateExecutionStatus([executionid], { status: "fail" });
                            }
                        } else { // This block will trigger when resultData.status has "success or "Terminate"
                            try {
                                let result = status;
                                let report_result = {};
                                mySocket.removeAllListeners('return_status_executeTestSuite');
                                mySocket.removeAllListeners('result_executeTestSuite');
                                report_result["status"] = status
                                report_result["configurekey"] = execReq["configurekey"]
                                report_result["configurename"] = execReq["configurename"]
                                if (reportType == 'accessiblityTestingOnly' && status == 'success') report_result["status"] = 'accessibilityTestingSuccess';
                                if (reportType == 'accessiblityTestingOnly' && status == 'Terminate') report_result["status"] = 'accessibilityTestingTerminate';
                                report_result["testSuiteDetails"] = execReq["suitedetails"]
                                if (resultData.userTerminated) result = "UserTerminate";
                                if (execType == "API") result = [d2R, status, resultData.testStatus];
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
                        
                });
            }));

            const notifySocMap = socket.socketMapNotify[clientName];
            if (execType == "ACTIVE" && notifySocMap && notifySocMap[invokinguser]) {
                exePromise(true);
                return "begin";
            } else return await exePromise(false);
        }
    };

    /** Function responsible for Orchestrating execution flow. Invokes series of functions to achive the results */
    executionFunction = async (batchExecutionData, execIds, userInfo, execType) => {
        //const icename = (execType=='API')? userInfo.icename : myserver.allSocketsICEUser[userInfo.username];
        var icename = userInfo.icename;
        var gitflag = false;
        //userInfo.icename=icename;
        //var iceStatus = await checkForICEstatus(icename, execType);
        //if (iceStatus != null) return iceStatus;
        var gitInfo = batchExecutionData.gitInfo;
        var batchCounter;
        for (let key in gitInfo){
            if(gitInfo[key]!='') gitflag=true; break;
        }
        if(!gitflag){
            batchCounter = batchExecutionData.batchInfo.length
            const taskApproval = await utils.approvalStatusCheck(batchExecutionData.batchInfo);
            if (taskApproval.res !== "pass") return taskApproval.res;
        }
        else batchCounter = 1;
        /*const countStatus =*/ await this.counterUpdater(batchCounter, userInfo.invokinguser);
        // if (countStatus == "fail") return "fail";
        const executionRequest = await this.prepareExecutionRequest(batchExecutionData, userInfo, gitflag);
        if (executionRequest == "fail") return "fail";
        if (executionRequest == "gitfail") return "gitfail";
        if (executionRequest == "empty") return "empty";
        const currExecIds = await this.generateExecutionIds(execIds, executionRequest.testsuiteIds, userInfo.invokinguser, executionRequest.version, executionRequest.batchname, executionRequest.smart,batchExecutionData);
        if (currExecIds == "fail") return "fail";
        executionRequest.batchId = currExecIds.batchid;
        executionRequest.executionIds = executionRequest.testsuiteIds.map(i => currExecIds.execids[i]);
        executionRequest.avogridid = batchExecutionData.avogridid;
        executionRequest.executingOn = batchExecutionData.executingOn || '';
        executionRequest.configurekey = batchExecutionData.configurekey;
        // executionRequest.configurekey = "3524a385-943d-40c8-9576-b978bcbc50b4";
        executionRequest.configurename = batchExecutionData.configurename;
        executionRequest.executiontype = batchExecutionData.executiontype;
        executionRequest.executionmode = batchExecutionData.executionmode;
        executionRequest.avoagents = batchExecutionData.avoagents;
        executionRequest.invokinguser = userInfo.invokinguser;
        executionRequest.executionListId = batchExecutionData.executionListId;
        executionRequest.isHeadless = batchExecutionData.isHeadless;
        executionRequest.profileName = batchExecutionData.profileName || batchExecutionData.configureName || null;
        executionRequest.recieverEmailAddress = batchExecutionData.recieverEmailAddress;

        if (execType == "SCHEDULE") executionRequest.scheduleId = batchExecutionData.scheduleId;
        if(batchExecutionData['batchInfo'][0]['appType'] == 'MobileApp' && batchExecutionData['executionEnv'] !== 'default') {
            // Fetch the apk details from DAS
            const inputs = {
                name : batchExecutionData['mobile']['uploadedApk'],
                userid: userInfo.userid
            }
            let apkDetails = await utils.fetchData(inputs, "qualityCenter/fetchAppData", 'executionFunction');
            executionRequest['mobile']['apkDetails'] = apkDetails
        }
        if (execType == "SCHEDULE") {
            executionRequest.scheduleId = batchExecutionData.scheduleId;
            executionRequest.execType = batchExecutionData.execType;
        }
        const result = await this.executionRequestToICE(executionRequest, execType, userInfo);
        return result;
    };
    setExecStatus = async (dataFromIce) => {
        const fnName = "setExecStatus";
        if('exec_req' in dataFromIce)
            dataFromIce.exce_data = dataFromIce.exec_req;
        let execReq = dataFromIce.exce_data.execReq;
        let event = dataFromIce.exce_data.event;
        let status = dataFromIce.status,execType = execReq.execType || 'ACTIVE';
        let userInfo = {
            'icename':'CICDICE',
            'invokinguser': '267ad96f374e4b06344f039c',
            'invokingusername':dataFromIce.exce_data.agentname,
            'invokinguserrole': 'f048d7303be440b943dd80f4',
            'role':'f048d7303be440b943dd80f4',
            'userid':'267ad96f374e4b06344f039c',
            'username':dataFromIce.exce_data.agentname,
        }
        logger.info("Inside " + fnName + " function");
        const username = userInfo.username;
        const invokinguser = userInfo.invokingusername;
        const icename = userInfo.icename;
        const _this = this;
        const scenarioFlag = execReq.scenarioFlag;
        const channel = "normal";
        var reportType = "accessiblityTestingOnly";
        // logger.info("Sending request to ICE for executeTestSuite");
        // const dataToIce = { "emitAction": "executeTestSuite", "username": icename, "executionRequest": execReq };
    
        var d2R = {};
        const data = dataFromIce;
        // const event = data.onAction;
        const resultData = data.exce_data;
        const batchId = (resultData) ? resultData.batchId : "";
        const executionid = (resultData) ? resultData.executionId : "";
        // if (!(icename == data.username && (event == constants.SOCK_NA || (event != constants.SOCK_NA && execReq.batchId == batchId)))) return false;
        // const status = resultData.status;
        if (event == constants.SOCK_NA) {
            // redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
            logger.error("Error occurred in " + fnName + ": Socket Disconnected");
            return 'fail';
            // if (resSent && notifySocMap[invokinguser]) {
            //     notifySocMap[invokinguser].emit("ICEnotAvailable");
            //     rsv(constants.DO_NOT_PROCESS);
            // } else rsv(constants.SOCK_NA);
        } else if (event == "return_status_executeTestSuite") {
            if (status === "success") {
                if (execType == "SCHEDULE") await scheduler.updateScheduleStatus(execReq.scheduleId, "Inprogress", batchId);
            } else if (status === "skipped") {
                const execStatus = "Skipped";
                var errMsg = (execType == "SCHEDULE") ? "due to conflicting schedules" :
                    "because another execution is running in ICE";
                // redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
                logger.error("Error occurred in " + fnName + ": Execution is skipped " + errMsg);
                errMsg = "This scenario was skipped " + errMsg;
                let report_result = {};
                report_result["status"] = execStatus
                report_result["testSuiteDetails"] = execReq["suitedetails"]
                await _this.updateSkippedExecutionStatus(execReq, userInfo, execStatus, errMsg);
                if (resSent && notifySocMap[invokinguser] && notifySocMap[invokinguser].connected) {
                    // notifySocMap[invokinguser].emit(execStatus);
                    // rsv(constants.DO_NOT_PROCESS);
                } else if (resSent) {
                    queue.Execution_Queue.add_pending_notification("", report_result, username);
                    // rsv(constants.DO_NOT_PROCESS);
                } else {
                    // rsv(execStatus);
                }
            } else if (status === "started") {
                await _this.updateExecutionStatus([executionid], { starttime: data.startTime,scenarioParallelExec: resultData.execReq.scenarioParallelExec });
                if (execType == "SCHEDULE") await scheduler.updateScheduleStatus(execReq.scheduleId, "Inprogress", batchId);
            } else if (status === "finished") {
                const testsuiteIndex = execReq.testsuiteIds.indexOf(resultData.testsuiteId);
                const testsuite = execReq.suitedetails[testsuiteIndex];
                const exeStatus = data.executionStatus ? "pass" : "fail";
                await _this.updateExecutionStatus([executionid], { endtime: data.endTime, status: exeStatus });
                if (execType == "SCHEDULE") await scheduler.updateScheduleStatus(execReq.scheduleId, "Completed", batchId);
                if (reportType != "accessiblityTestingOnly")
                    notifications.notify("report", { ...testsuite, user: userInfo, status, suiteStatus: exeStatus, scenarioFlag: scenarioFlag});
            }
        } else if (event == "result_executeTestSuite") {
            if (!status) { // This block is for report data
                if ("accessibility_reports" in resultData) {
                    const accessibility_reports = resultData.accessibility_reports
                    reports.saveAccessibilityReports(accessibility_reports);
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
                    if (Object.keys(reportData.overallstatus).length !== 0) {
                        const appTypes = ["OEBS", "MobileApp", "System", "Webservice", "Mainframe", "SAP", "Desktop"];
                        const browserType = (appTypes.indexOf(execReq.apptype) > -1) ? execReq.apptype : reportData.overallstatus.browserType;
                        reportData.overallstatus.browserType = browserType;
                        if (execType == "API") {
                            const cidx = d2R[testsuiteid].scenarios[scenarioid].length - 1;
                            d2R[testsuiteid].scenarios[scenarioid][cidx] = { ...d2R[testsuiteid].scenarios[scenarioid][cidx], ...reportData.overallstatus };
                        }
                        const reportStatus = reportData.overallstatus.overallstatus;
                        const reportid = await _this.insertReport(executionid, scenarioid, browserType, userInfo, reportData);
                        const reportItem = { reportid, scenarioname, status: reportStatus, terminated: reportData.overallstatus.terminatedBy };
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
                    if (reportType != "accessiblityTestingOnly") notifications.notify("report", { ...testsuite, user: userInfo, status, suiteStatus: "fail", scenarioFlag: scenarioFlag});
                    await this.updateExecutionStatus([executionid], { status: "fail" });
                }
            } else { // This block will trigger when resultData.status has "success or "Terminate"
                // redisServer.redisSubServer.removeListener("message", executeTestSuite_listener);
                try {

                    let result = status;
                    let report_result = {};
                    report_result["status"] = status
                    if (reportType == 'accessiblityTestingOnly' && status == 'success') report_result["status"] = 'accessibilityTestingSuccess';
                    if (reportType == 'accessiblityTestingOnly' && status == 'Terminate') report_result["status"] = 'accessibilityTestingTerminate';
                    report_result["testSuiteDetails"] = execReq["suitedetails"]
                    if (resultData.userTerminated) result = "UserTerminate";
                    if (execType == "API") result = [d2R, status, resultData.testStatus];
                    if (resSent && notifySocMap[invokinguser] && notifySocMap[invokinguser].connected) { // This block is only for active mode
                        // notifySocMap[invokinguser].emit("result_ExecutionDataInfo", report_result);
                        // rsv(constants.DO_NOT_PROCESS);
                    } else if (resSent) {
                        // queue.Execution_Queue.add_pending_notification("", report_result, username);
                        // rsv(constants.DO_NOT_PROCESS);
                    } else {
                        // rsv(result);
                    }
                } catch (ex) {
                    logger.error("Exception while returning execution status from function " + fnName + ": %s", ex);
                    // rej("fail");
                }
            }
        }
    };

}

module.exports.execute = async (batchExecutionData, execIds, userInfo, execType) =>{
    if (!testSuiteExecutor){
        testSuiteExecutor =  new TestSuiteExecutor();
    }
    var result = await testSuiteExecutor.executionFunction(batchExecutionData, execIds, userInfo, execType)
    return result;
}

module.exports.generateExecutionId = async (execIds, tsuIds, userid, version) => {
    return await testSuiteExecutor.generateExecutionIds(execIds, tsuIds, userid, version);
}

//Api for reports and status
module.exports.setExecStatus = async (dataFromIce) => {
    if (!testSuiteExecutor){
        testSuiteExecutor =  new TestSuiteExecutor();
    }
    return await testSuiteExecutor.setExecStatus(dataFromIce);
};