const mySocket = require('./socket')
var logger = require('../../logger');
let queue = require("./execution/executionQueue");

module.exports.result_executeTestSuite = async(resultData,execReq,execType,userInfo,invokinguser,insertReport,notifySocMap,resSent)=>
{
        const executionid = (resultData) ? resultData.executionId : "";
        const status = resultData.status;
        const iceExecReq=resultData.execReq;
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
                        d2R[testsuiteid].scenarios[scenarioid].push({ scenarioname, scenarioid, "overallstatus": "Not Execu.ted" });
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
                        const reportid = await insertReport(executionid, scenarioid, browserType, userInfo, reportData);
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
                    if (resSent && notifySocMap[invokinguser] && notifySocMap[invokinguser].connected && execType == 'ACTIVE') { // This block is only for active mode
                        notifySocMap[invokinguser].emit("result_ExecutionDataInfo", report_result);
                    } else if (resSent) {
                        queue.Execution_Queue.add_pending_notification("", report_result, username);
                    }
                } catch (ex) {
                    logger.error("Exception while returning execution status from function " + fnName + ": %s", ex);
                }
            }
   
}
