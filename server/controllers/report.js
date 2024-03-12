var myserver = require('../lib/socket');
var validator = require('validator');
var logger = require('../../logger');
var async = require('async');
var Client = require("node-rest-client").Client;
var epurl = process.env.DAS_URL;
var client = new Client();
var wkhtmltopdf = require('wkhtmltopdf');
const Readable = require('stream').Readable;
var utils = require('../lib/utils');
var fs = require('fs');
var options = require('../config/options');
var path = require('path');
const tokenAuth = require('../lib/tokenAuth');
const constants = require('../lib/execution/executionConstants');
const Handlebars = require('../lib/handlebar.js');
var axios  =  require('axios');
var https = require('https');
var os = require('os');

// PDF EXPORT
wkhtmltopdf.command = path.join(__dirname, "..",'wkhtmltox', 'bin', 'wkhtmltopdf'+((process.platform == "win32")? '.exe':''));
var templatepdf = '';

fs.readFile(path.join(__dirname,"..","..","templates","pdfReport","content.handlebars"), 'utf8', function(err, data) {
templatepdf = Handlebars.compile(data);
});

let headers
module.exports.setReq = async (req) =>
{
	headers=req;
}
const formatDate = (date) => {
    if (!date || date == ""){
        return false;
    }
    let dateTime = date.replace(" ", "-").split("-");
    let time = dateTime[dateTime.length - 1].split(":");
    
    var day = dateTime[2];
    var month = dateTime[1];
    var year = dateTime[0];

    let hour = time[0]
    let minute = time[1]
    let seconds = time[2]
    let map = {"MM":month,"YYYY": year, "DD": day};
    let def = [day,month,year];
    let format = options.dateFormat.split("-");
    let arr = []
    let used = {}
    for (let index in format){
        if (!(format[index] in map) || format[index] in used){
            return def.join('-') + " " + [hour,minute,seconds].join(':');
        }
        arr.push(map[format[index]]) 
        used[format[index]] = 1
    }

    return arr.join('-') + " " + [hour,minute,seconds].join(':');
    
};
const getCurrentReportDate = () => {
    // Get current date
    const currentDate = new Date();
    // Get day, month, and year
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // January is 0
    const year = currentDate.getFullYear();
    // Format day and month to have leading zeros if needed
    const formattedDay = day < 10 ? '0' + day : day;
    const formattedMonth = month < 10 ? '0' + month : month;
    // Concatenate day, month, and year with '-' separator
    const presentDate = formattedDay + '-' + formattedMonth + '-' + year;
    return presentDate;
};
const getCurrentReportTime = () => {
    // Get current time
    const currentTime = new Date();
    // Extract hours, minutes, and seconds
    let hours = currentTime.getHours();
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    // Determine AM or PM
    const meridiem = hours >= 12 ? 'pm' : 'am';
    // Convert hours to 12-hour format
    hours = hours % 12 || 12;
    // Format the time as HH:MM:SS AM/PM
    const presentTime = `${hours}:${minutes}:${seconds} ${meridiem}`;
    return presentTime;
};
// Function to format date to dd-mm-yyyy railway time
const formatDateToRailwayTime = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};
const generateReportDateTime = (startDateTime, endDateTime) => {
    // Convert date strings to Date objects
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    // Format start date
    const formattedStartDateTime = formatDateToRailwayTime(startDate);
    // Format end date
    const formattedEndDateTime = formatDateToRailwayTime(endDate);
    // Calculate difference between dates
    const timeDifference = endDate - startDate;
    const millisecondsInSecond = 1000;
    const millisecondsInMinute = millisecondsInSecond * 60;
    const millisecondsInHour = millisecondsInMinute * 60;
    const hoursDifference = Math.floor(timeDifference / millisecondsInHour);
    const minutesDifference = Math.floor((timeDifference % millisecondsInHour) / millisecondsInMinute);
    const secondsDifference = Math.floor((timeDifference % millisecondsInMinute) / millisecondsInSecond);
    // Format difference in ~hh:mm:ss format
    const formattedDifference = `~${hoursDifference}:${minutesDifference.toString().padStart(2, '0')}:${secondsDifference.toString().padStart(2, '0')}`;
    return { formattedStartDateTime, formattedEndDateTime, formattedDifference }
};



/** Function responsible for returning ICE connection status */
// const checkForICEstatus = async (icename, fnName) => {
//     logger.debug("ICE Socket requesting Address: %s", icename);
// 	const err = "Error occurred in the function "+fnName+": ";
//     const sockmode = await utils.channelStatus(icename);
//     if (!sockmode.schedule && !sockmode.normal) {
//         logger.error(err + "ICE is not available");
//         return "unavailableLocalServer";
//     } else if (sockmode.schedule) {
//         logger.error(err + "ICE is connected in Scheduling mode");
//         return "scheduleModeOn";
//     } else {
// 		return null;
// 	}
// };

// To load screenshot from ICE
const openScreenShot = async (username, path,host) => {
    const fnName = "openScreenShot";
    try {
        var mySocket;
		var clientName=utils.getClientName(host);
        var icename = undefined
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
        mySocket = myserver.allSocketsMap[clientName][icename];
        logger.info("Sending socket request for render_screenshot to cachedb");
        mySocket.emit("render_screenshot", path);

        return (new Promise((rsv, rej) => {
            let scrShotData = [];
            mySocket.on("render_screenshot_finished", (message) =>{
                const data = message;
                if (data === "fail") {
                    logger.error("Screenshots processing failed!");
                    rsv("fail");
                } else {
                    logger.debug("Screenshots processed successfully");
                    rsv(scrShotData);
                }
            });
            mySocket.on("render_screenshot", (message) =>{
                const data = message;
                scrShotData = scrShotData.concat(data);
                rsv(scrShotData);
            });
            
        }));
    } catch (exception) {
        logger.error("Exception in openScreenShot when trying to open screenshot: %s", exception);
        cb('fail');
    }
};

// Render screenshots for html reports
exports.openScreenShot_API = async (req, res) => {
    try {
        const username = req.body.username; //req.session.username;
        const result = await openScreenShot(username, req.body.absPath,req.session.client !== undefined? req.session.client:req.body.client);
        res.send(result);
    } catch (exception) {
        logger.error("Exception in openScreenShot when trying to load screenshot: %s", exception);
        res.send("fail");
    }
};

exports.openScreenShot = async (req, res) => {
    try {
        const username = req.session.username;
        const result = await openScreenShot(username, req.body.absPath,req.session.client !== undefined? req.session.client:req.body.client);
        res.send(result);
    } catch (exception) {
        logger.error("Exception in openScreenShot when trying to load screenshot: %s", exception);
        res.send("fail");
    }
};

function calculatePercentage(value, total) {
    if (isNaN(value) || isNaN(total) || total === 0) {
        return 0; // Return 0 if value or total is not a number, or if total is 0
    }
    return parseFloat((value / total) * 100) ? parseFloat((value / total) * 100) : 0;
}

const prepareReportData = (reportData, embedImages) => {
    let pass = fail = terminated = 0;
    const remarksLength = [];
    const commentsLength = [];
    const scrShots = { "idx": [], "paths": [] };

    const report = reportData.report;
    const endTimeStamp = report.overallstatus.EndTime.split(".")[0];
    let elapTime = (report.overallstatus.EllapsedTime.split(".")[0]).split(":");
    report.overallstatus.version = reportData.version;
    report.overallstatus.domainName = reportData.domainname;
    report.overallstatus.projectName = reportData.projectname;
    report.overallstatus.releaseName = reportData.releasename;
    report.overallstatus.cycleName = reportData.cyclename;
    report.overallstatus.scenarioName = reportData.testscenarioname;
    report.overallstatus.reportId = reportData.reportId;
    report.overallstatus.executionId = reportData.executionid;
    report.overallstatus.moduleName = reportData.testsuitename;
    report.overallstatus.browserVersion = report.overallstatus.browserVersion || '-';
    report.overallstatus.browserType = report.overallstatus.browserType || '-';
    report.overallstatus.StartTime = formatDate(report.overallstatus.StartTime.split(".")[0]) || '-';
    report.overallstatus.EndTime = formatDate(endTimeStamp) || '-';
    report.overallstatus.date = report.overallstatus.EndTime && report.overallstatus.EndTime.split(" ")[0]  || '-';
    report.overallstatus.time = endTimeStamp.split(" ")[1] || '-';
    report.overallstatus.EllapsedTime = "~" + ("0" + elapTime[0]).slice(-2) + ":" + ("0" + elapTime[1]).slice(-2) + ":" + ("0" + elapTime[2]).slice(-2)
    report.overallstatus.video = report.overallstatus.video || '-'

    if(embedImages != 'removeReportItems'){  
        report.rows.forEach((row, i) => {
            row.slno = i + 1;
            if (row["Step "]) row.Step = row["Step "];
            // if (row.EllapsedTime && row.EllapsedTime.trim() != "") {
            //     const eT = row.EllapsedTime.split(".");
            //     elapTime = eT[0].split(":")
            //     if (!eT[1]) eT[1] = ((eT[1] || "") + "000").slice(0, 3);
            //     if (eT.length < 3 && eT[0].indexOf(":") === -1) { // Time is x.x not xx:xx:xx.xx
            //         row.EllapsedTime = "00:00:" + ("0" + elapTime[0]).slice(-2) + ":" + eT[1];
            //     } else {
            //         row.EllapsedTime = ("0" + elapTime[0]).slice(-2) + ":" + ("0" + elapTime[1]).slice(-2) + ":" + ("0" + elapTime[2]).slice(-2) + ":" + eT[1];
            //     }
            // }
            if (embedImages && row.screenshot_path) {
                scrShots.idx.push(i);
                scrShots.paths.push(row.screenshot_path);
            }

            if (row.testcase_details) {
                if (typeof(row.testcase_details) == "string" && row.testcase_details != "undefined")
                    row.testcase_details = JSON.parse(row.testcase_details);
            } else if (row.testcase_details === "") {
                row.testcase_details = {
                    "actualResult_pass": "",
                    "actualResult_fail": "",
                    "testcaseDetails": ""
                }
            }
            if (row.status == "Pass") pass++;
            else if (row.status == "Fail") fail++;
            else if (row.Step && row.Step == "Terminated") terminated++
            if (row.Remark && row.Remark !== " ") remarksLength.push(row.Remark)
            if (row.Comments && row.Comments !== " ") commentsLength.push(row.Remark)
        });
        const total = pass+fail+terminated;
        const passPercent = parseFloat(100 * pass / total).toFixed(2);
        const otherPercent = (100-passPercent).toFixed(2);
        const totalRemaining = (fail+terminated) || 1;
        const failPercent = parseFloat(otherPercent * fail / totalRemaining).toFixed(2);
        const termPercent = (otherPercent - failPercent).toFixed(2);
        report.overallstatus.pass = passPercent > 0 ? passPercent : "0.00";
        report.overallstatus.fail = failPercent > 0 ? failPercent : "0.00";
        report.overallstatus.terminate = termPercent > 0 ? termPercent : "0.00";
        report.remarksLength = remarksLength;
        report.commentsLength = commentsLength;
    }

    return { report, scrShots };
};

const prepareExecutionReportData = async(exportLevel = "", downloadLevel = "", executionListId = "", reportId = "",embedImages = "", isViewReport = false) => {
    // row Level Data
    if (downloadLevel == "row") {
        let commonFields = {};
        // to get description Data
        const descriptionData = await utils.fetchData({ executionListId }, "download/downloadReport", "prepareReportData");

        commonFields["projectName"] = descriptionData.length ? descriptionData[0]["projectname"][0] : "";
        commonFields["browser"] = descriptionData.length ? descriptionData[0]["overallstatusReport"][0]["browserType"] : "";
        commonFields["browserVersion"] = descriptionData.length ? descriptionData[0]["overallstatusReport"][0]["browserVersion"] : "";
        commonFields["overallStatus"] = descriptionData.length ? (descriptionData[0]["status"]).toUpperCase() : "";
        if (descriptionData.length) {
            const result = generateReportDateTime(descriptionData[0]["starttime"], descriptionData[descriptionData.length - 1]["endtime"])
            commonFields["startDateTime"] = result.formattedStartDateTime ? result.formattedStartDateTime : "";
            commonFields["endDateTime"] = result.formattedEndDateTime ? result.formattedEndDateTime : "";
            commonFields["ellapsedTime"] = result.formattedDifference ? result.formattedDifference : "";
        };
        commonFields["reportGeneratedDate"] = getCurrentReportDate();
        commonFields["reportGeneratedTime"] = getCurrentReportTime();
        if (exportLevel == "executiveSummary") {
            // to get testSuite Data
            const inputs = {
                "query": "fetchModSceDetails",
                param: "modulestatus",
                executionListId: executionListId,
                executionId: undefined
            };
            const testSuiteResults = await utils.fetchData(inputs, "reports/fetchModSceDetails", "fetchModSceDetails");
            let totalTs = testSuiteResults.length;
            let executedTs = 0;
            let passedTs = 0;
            let failedTs = 0;
            let terminatedTs = 0;
            let executedTsPercent = 1;
            let passedTsPercent = 1;
            let failedTsPercent = 1;
            let terminatedTsPercent = 1;

            let totalTc = 0;
            let executedTc = 0;
            let passedTc = 0;
            let failedTc = 0;
            let terminatedTc = 0;
            let executedTcPercent = 1;
            let passedTcPercent = 1;
            let failedTcPercent = 1;
            let terminatedTcPercent = 1;

            for (const result of testSuiteResults) {
                switch (result.status) {
                    case "pass":
                        passedTs++;
                        executedTs++;
                        break;
                    case "fail":
                        failedTs++;
                        executedTs++;
                        break;
                    case "terminate":
                        terminatedTs++;
                        break;
                }
                result.scenarioStatus.forEach((tcStatus) => {
                    totalTc++;
                    switch (tcStatus) {
                        case "Pass":
                            passedTc++;
                            executedTc++;
                            break;
                        case "Fail":
                            failedTc++;
                            executedTc++;
                            break;
                        case "Terminate":
                            terminatedTc++;
                        default:
                            break;
                    }
                })
            }

            // TestSuite Percentage Calculation
            executedTsPercent = calculatePercentage(testSuiteResults.length, testSuiteResults.length);
            passedTsPercent = calculatePercentage(passedTs, totalTs);
            failedTsPercent = calculatePercentage(failedTs, totalTs);
            terminatedTsPercent = calculatePercentage(terminatedTs, totalTs);
            // TestCase Percentage Calculation
            executedTcPercent = calculatePercentage(executedTc, executedTc);
            passedTcPercent = calculatePercentage(passedTc, totalTc);
            failedTcPercent = calculatePercentage(failedTc, totalTc);
            terminatedTcPercent = calculatePercentage(terminatedTc, totalTc);
            // Executive Level Data
            const replacements = {
                ...commonFields,
                "testSuiteResults": {
                    totalTs,
                    executedTs,
                    passedTs,
                    failedTs,
                    terminatedTs,
                    executedTsPercent,
                    passedTsPercent,
                    failedTsPercent,
                    terminatedTsPercent,
                },
                "testCaseResults": {
                    totalTc,
                    executedTc,
                    passedTc,
                    failedTc,
                    terminatedTc,
                    executedTcPercent,
                    passedTcPercent,
                    failedTcPercent,
                    terminatedTcPercent
                },
                rawHtmlPath: htmlPaths.executive_report_path
            }
            return replacements;
        } else if (exportLevel == "summary") {
            const inputs = {
                "query": "fetchModSceDetails",
                param: "modulestatus",
                executionListId: executionListId,
                executionId: undefined
            };
            const testSuiteResults = await utils.fetchData(inputs, "reports/fetchModSceDetails", "fetchModSceDetails");

            let totalTs = testSuiteResults.length;
            let executedTs = 0;
            let passedTs = 0;
            let failedTs = 0;
            let terminatedTs = 0;
            let executedTsPercent = 1;
            let passedTsPercent = 1;
            let failedTsPercent = 1;
            let terminatedTsPercent = 1;

            let totalTc = 0;
            let executedTc = 0;
            let passedTc = 0;
            let failedTc = 0;
            let terminatedTc = 0;
            let executedTcPercent = 1;
            let passedTcPercent = 1;
            let failedTcPercent = 1;
            let terminatedTcPercent = 1;
            let reportData = {};
            const tsExecutionStatusArr = [];

            for (const result of testSuiteResults) {
                switch (result.status) {
                    case "pass":
                        passedTs++;
                        executedTs++;
                        break;
                    case "fail":
                        failedTs++;
                        executedTs++;
                        break;
                    case "terminate":
                        terminatedTs++;
                        break;
                }
                // Calculate Tc for a particular Ts
                let iTotalTc = 0;
                let iExecutedTc = 0;
                let iPassedTc = 0;
                let ifailedTc = 0;
                let iterminatedTc = 0;
                let iSNo = 1;
                result.scenarioStatus.forEach((tcStatus) => {
                    totalTc++;
                    iTotalTc++;
                    switch (tcStatus) {
                        case "Pass":
                            passedTc++;
                            iPassedTc++;
                            executedTc++;
                            iExecutedTc++;
                            break;
                        case "Fail":
                            failedTc++;
                            ifailedTc++;
                            executedTc++;
                            iExecutedTc++;
                            break;
                        case "Terminate":
                            terminatedTc++;
                            iterminatedTc++
                        default:
                            break;
                    }
                })

                const inputs = {
                    "query": "fetchModSceDetails",
                    param: "scenarioStatus",
                    executionListId: undefined,
                    executionId: result._id
                };

                const tcResult = await utils.fetchData(inputs, "reports/fetchModSceDetails", "fetchModSceDetails");
                const iTcArr = [];
                if (tcResult.length) {
                    for (tc of tcResult) {
                        iTcArr.push({
                            sNo: iSNo++,
                            tcName: tc["scenarioname"],
                            tcStatus: tc["status"]
                        })
                    }
                }
                tsExecutionStatusArr.push({ tsName: result.modulename, totalTc: iTotalTc, executedTc: iExecutedTc, passedTc: iPassedTc, failedTc: ifailedTc, terminatedTc: iterminatedTc, iTcArr });

            }
            // TestSuite Percentage Calculation
            executedTsPercent = calculatePercentage(testSuiteResults.length, testSuiteResults.length);
            passedTsPercent = calculatePercentage(passedTs, totalTs);
            failedTsPercent = calculatePercentage(failedTs, totalTs);
            terminatedTsPercent = calculatePercentage(terminatedTs, totalTs);
            // TestCase Percentage Calculation
            executedTcPercent = calculatePercentage(executedTc, executedTc);
            passedTcPercent = calculatePercentage(passedTc, totalTc);
            failedTcPercent = calculatePercentage(failedTc, totalTc);
            terminatedTcPercent = calculatePercentage(terminatedTc, totalTc);
            // Executive Level Data
            const replacements = {
                ...commonFields,
                "testSuiteResults": {
                    totalTs,
                    executedTs,
                    passedTs,
                    failedTs,
                    terminatedTs,
                    executedTsPercent,
                    passedTsPercent,
                    failedTsPercent,
                    terminatedTsPercent,
                },
                "testCaseResults": {
                    totalTc,
                    executedTc,
                    passedTc,
                    failedTc,
                    terminatedTc,
                    executedTcPercent,
                    passedTcPercent,
                    failedTcPercent,
                    terminatedTcPercent
                },
                tsExecutionStatusArr,
                rawHtmlPath: htmlPaths.summary_report_path
            }
            return replacements;
        } else if (exportLevel == "detailed") {
            const inputs = {
                "query": "fetchModSceDetails",
                param: "modulestatus",
                executionListId: executionListId,
                executionId: undefined
            };
            const testSuiteResults = await utils.fetchData(inputs, "reports/fetchModSceDetails", "fetchModSceDetails");
            let totalTs = testSuiteResults.length;
            let executedTs = 0;
            let passedTs = 0;
            let failedTs = 0;
            let terminatedTs = 0;
            let executedTsPercent = 1;
            let passedTsPercent = 1;
            let failedTsPercent = 1;
            let terminatedTsPercent = 1;

            let totalTc = 0;
            let executedTc = 0;
            let passedTc = 0;
            let failedTc = 0;
            let terminatedTc = 0;
            let executedTcPercent = 1;
            let passedTcPercent = 1;
            let failedTcPercent = 1;
            let terminatedTcPercent = 1;
            let reportData = {};
            const iTcArr = [];
            let tcNo = 1;
            for (const result of testSuiteResults) {
                switch (result.status) {
                    case "pass":
                        passedTs++;
                        executedTs++;
                        break;
                    case "fail":
                        failedTs++;
                        executedTs++;
                        break;
                    case "Terminate":
                        terminatedTs++;
                        executedTs++;
                        break;
                }
                result.scenarioStatus.forEach((tcStatus) => {
                    totalTc++;
                    switch (tcStatus) {
                        case "Pass":
                            passedTc++;
                            executedTc++;
                            break;
                        case "Fail":
                            failedTc++;
                            executedTc++;
                            break;
                        case "Terminate":
                            terminatedTc++;
                        default:
                            break;
                    }
                });

                const inputs = {
                    "query": "fetchModSceDetails",
                    param: "scenarioStatus",
                    executionListId: undefined,
                    executionId: result._id
                };

                const tcResult = await utils.fetchData(inputs, "reports/fetchModSceDetails", "fetchModSceDetails");

                if (tcResult.length) {

                    for (tc of tcResult) {
                        const inputTcData = { reportid: tc["_id"] };
                        const tcData = await utils.fetchData(inputTcData, "reports/getReport", "viewReport");
                        const tcInfoArr = [];
                        let tcSubNo = 1;
                        for (const info of tcData.report.rows) {
                            tcInfoArr.push({
                                sNo: `${tcNo}.${tcSubNo++}`,
                                description: info.Keyword,
                                timeEllapsed: info.EllapsedTime ? (info.EllapsedTime).split(":").slice(0, 3).join(":") : "",
                                status: info.status ? info.status : "",
                                comment: info.Comments ? info.Comments : (info.StepDescription ? info.StepDescription : ""),
                                defectId: ""
                            })
                        }
                        iTcArr.push({
                            sNo: tcNo++,
                            tcName: tcData.testscenarioname,
                            timeElapsed: tcData.report.overallstatus.EllapsedTime,
                            overAllStatus: tcData.report.overallstatus.overallstatus,
                            tcInfoArr
                        })
                    }
                }

            }
            // TestSuite Percentage Calculation
            executedTsPercent = calculatePercentage(testSuiteResults.length, testSuiteResults.length);
            passedTsPercent = calculatePercentage(passedTs, totalTs);
            failedTsPercent = calculatePercentage(failedTs, totalTs);
            terminatedTsPercent = calculatePercentage(terminatedTs, totalTs);
            // TestCase Percentage Calculation
            executedTcPercent = calculatePercentage(executedTc, executedTc);
            passedTcPercent = calculatePercentage(passedTc, totalTc);
            failedTcPercent = calculatePercentage(failedTc, totalTc);
            terminatedTcPercent = calculatePercentage(terminatedTc, totalTc);
            // Executive Level Data
            const replacements = {
                ...commonFields,
                "testSuiteResults": {
                    totalTs,
                    executedTs,
                    passedTs,
                    failedTs,
                    terminatedTs,
                    executedTsPercent,
                    passedTsPercent,
                    failedTsPercent,
                    terminatedTsPercent,
                },
                "testCaseResults": {
                    totalTc,
                    executedTc,
                    passedTc,
                    failedTc,
                    terminatedTc,
                    executedTcPercent,
                    passedTcPercent,
                    failedTcPercent,
                    terminatedTcPercent,
                },
                rawHtmlPath: htmlPaths.detailed_report_path,
                iTcArr
            }
            return replacements;
        }
    } else if (downloadLevel == "testCase") {
        const inputs = { reportid: reportId };
        const reportData = await utils.fetchData(inputs, "reports/getReport", "viewReports");
        let pass = fail = terminated = 0;
        const remarksLength = [];
        const commentsLength = [];
        const scrShots = { "idx": [], "paths": [] };

        const report = reportData.report;
        const endTimeStamp = report.overallstatus.EndTime.split(".")[0];
        let elapTime = (report.overallstatus.EllapsedTime.split(".")[0]).split(":");
        report.overallstatus.version = reportData.version;
        report.overallstatus.domainName = reportData.domainname;
        report.overallstatus.projectName = reportData.projectname;
        report.overallstatus.releaseName = reportData.releasename;
        report.overallstatus.cycleName = reportData.cyclename;
        report.overallstatus.scenarioName = reportData.testscenarioname;
        report.overallstatus.reportId = reportData.reportId;
        report.overallstatus.executionId = reportData.executionid;
        report.overallstatus.moduleName = reportData.testsuitename;
        report.overallstatus.browserVersion = report.overallstatus.browserVersion || '-';
        report.overallstatus.browserType = report.overallstatus.browserType || '-';
        report.overallstatus.StartTime = formatDate(report.overallstatus.StartTime.split(".")[0]) || '-';
        report.overallstatus.EndTime = formatDate(endTimeStamp) || '-';
        report.overallstatus.date = report.overallstatus.EndTime && report.overallstatus.EndTime.split(" ")[0] || '-';
        report.overallstatus.time = endTimeStamp.split(" ")[1] || '-';
        report.overallstatus.EllapsedTime = "~" + ("0" + elapTime[0]).slice(-2) + ":" + ("0" + elapTime[1]).slice(-2) + ":" + ("0" + elapTime[2]).slice(-2)
        report.overallstatus.video = report.overallstatus.video || '-'

        if (embedImages != 'removeReportItems') {
            report.rows.forEach((row, i) => {
                row.slno = i + 1;
                if (row["Step "]) row.Step = row["Step "];

                if (embedImages && row.screenshot_path) {
                    scrShots.idx.push(i);
                    scrShots.paths.push(row.screenshot_path);
                }

                if (row.testcase_details) {
                    if (typeof (row.testcase_details) == "string" && row.testcase_details != "undefined")
                        row.testcase_details = JSON.parse(row.testcase_details);
                } else if (row.testcase_details === "") {
                    row.testcase_details = {
                        "actualResult_pass": "",
                        "actualResult_fail": "",
                        "testcaseDetails": ""
                    }
                }
                if (row.status == "Pass") pass++;
                else if (row.status == "Fail") fail++;
                else if (row.Step && row.Step == "Terminated") terminated++
                if (row.Remark && row.Remark !== " ") remarksLength.push(row.Remark)
                if (row.Comments && row.Comments !== " ") commentsLength.push(row.Remark)
            });
            const total = pass + fail + terminated;
            const passPercent = parseFloat(100 * pass / total).toFixed(2);
            const otherPercent = (100 - passPercent).toFixed(2);
            const totalRemaining = (fail + terminated) || 1;
            const failPercent = parseFloat(otherPercent * fail / totalRemaining).toFixed(2);
            const termPercent = (otherPercent - failPercent).toFixed(2);
            report.overallstatus.pass = passPercent > 0 ? passPercent : "0.00";
            report.overallstatus.fail = failPercent > 0 ? failPercent : "0.00";
            report.overallstatus.terminate = termPercent > 0 ? termPercent : "0.00";
            report.remarksLength = remarksLength;
            report.commentsLength = commentsLength;
        }
        report["rawHtmlPath"] =  htmlPaths.tc_report_path;
        report["overallstatus"] =  isViewReport ? report["overallstatus"] : [report["overallstatus"]];
        report["scrShots"] = scrShots;
        return report;
    }
};
 
//Connect to Jira
exports.connectJira_ICE = function(req, res) {
    try {
        logger.info("Inside UI service: connectJira_ICE");
        var mySocket;
		var clientName=utils.getClientName(req.headers.host);
        var username=req.session.username;
        var icename = undefined
        if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
        mySocket = myserver.allSocketsMap[clientName][icename];	
        var dataToIce = {
            "emitAction": "jiralogin",
            "username": icename,
            "action": req.body.action,
            "inputs": inputs
        };
        if (mySocket != undefined && mySocket.connected){
        if (req.body.action == 'loginToJira') { //Login to Jira for creating issues
            var jiraurl = req.body.url;
            var jirausername = req.body.username;
            var jirapwd = req.body.password;
            if (!validateData(jiraurl, "empty") && !validateData(jirausername, "empty") && !validateData(jirapwd, "empty")) {
                //var inputs = [jiraurl,jirausername,jirapwd];
                var inputs = {
                    "jira_serverlocation": jiraurl,
                    "jira_uname": jirausername,
                    "jira_pwd": jirapwd
                };
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                        if(mySocket != undefined && mySocket.connected) {
                            logger.info("Sending socket request for jira_login to cachedb");
                            mySocket.emit("jiralogin", req.body.action, inputs, dataToIce.project_selected, dataToIce.itemType);
                            var count = 0;

                            function jira_login_1_listener(message) {
                                var data = message;
                                    mySocket.removeListener("auto_populate", jira_login_1_listener);
                                    var resultData = data;
                                    if (count == 0) {
                                        if (resultData != "Fail" && resultData != "Invalid Url" && resultData != "Invalid Credentials") {
                                            logger.info('Jira: Login successfully.');
                                        } else {
                                            logger.error('Jira: Login Failed.');
                                        }
                                        res.send(resultData);
                                        count++;
                                    }
                            }
                            mySocket.on("auto_populate", jira_login_1_listener);
                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectJira_ICE - loginToJira: Socket not Available");
                                res.send(flag);
                        }
                } catch (exception) {
                    logger.error("Exception in the service connectJira_ICE - loginToJira: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectJira_ICE - loginToJira: Invalid inputs");
                res.send("Fail");
            }
        } else if (req.body.action == 'createIssueInJira') { //Create issues in the Jira
            var createObj = req.body.issue_dict;
            if (!validateData(createObj.project, "empty") && !validateData(createObj.issuetype, "empty") && !validateData(createObj.summary, "empty")  && !validateData(createObj.description, "empty")) {
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                    if(mySocket != undefined) {
                            logger.info("Sending socket request for jira_login to cachedb");
                            mySocket.emit("jiralogin", req.body.action, createObj, dataToIce.project_selected, dataToIce.itemType);
                            var count = 0;

                            function jira_login_2_listener(message) {
                                var data = message;
                                    mySocket.removeListener("issue_id", jira_login_2_listener);
                                        var resultData = data;
                                        if (count == 0) {
                                            if (resultData != "Fail") {
                                                updateDbReportData(createObj.reportId, createObj.slno, resultData);
                                                logger.info('Jira: Issue created successfully.');
                                            } else {
                                                logger.error('Jira: Failed to create issue.');
                                            }
                                            res.send(resultData);
                                            count++;
                                        }
                            }
                            mySocket.on("issue_id", jira_login_2_listener);
                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectJira_ICE - createIssueInJira: Socket not Available");
                                res.send(flag);
                        }
                } catch (exception) {
                    logger.error("Exception in the service connectJira_ICE - createIssueInJira: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectJira_ICE - createIssueInJira: Invalid inputs");
                res.send("Fail");
            }  
        } else if (req.body.action == 'getJiraConfigureFields') { //gets jira configure fields for given project and issue type
            var createObj = req.body.jira_input_dict;
            var project = req.body.project;
            var issuetype = req.body.issuetype;
            var url =req.body.url;
            var username= req.body.username;
            var password= req.body.password;
            var projects=req.body.projects;
            if (!validateData(project, "empty") && !validateData(issuetype, "empty")){
                var inputs = {
                    "project": project,
                    "issuetype": issuetype,
                    "url": url,
                    "username": username,
                    "password": password,
                    "projects_data":projects
                };
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                    if(mySocket != undefined) {	
                            logger.info("Sending socket request for jira_login to cachedb");
                            var dataToIce = {
                                "emitAction": "jiralogin",
                                "username": icename,
                                "action": req.body.action,
                                "inputs": inputs,
                                "project_selected":"jiralogin",
                                "itemType":"jiralogin"
                            };
                            mySocket.emit("jiralogin", req.body.action, inputs, dataToIce.project_selected, dataToIce.itemType);
                            function jira_login_3_listener( message) {
                                var data1 = message;
                                mySocket.removeListener("configure_field", jira_login_3_listener);
                                var resultData = data1;
                                if (resultData != "Fail") {
                                    logger.info('Jira: configure field fetched successfully.');
                                } else {
                                    logger.error('Jira: Failed fetch congigure fields.');
                                }
                                res.send(resultData);
                            }
                            mySocket.on("configure_field", jira_login_3_listener);
                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectJira_ICE - getJiraConfigureFields: Socket not Available");
                                res.send(flag);
                        }
                } catch (exception) {
                    logger.error("Exception in the service connectJira_ICE - getJiraConfigureFields: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectJira_ICE - getJiraConfigureFields: Invalid inputs");
                res.send("Fail");
            }
        }
        else if (req.body.action == 'jiraLogin' ) { //Login to Jira for mapping screen
            var jiraurl = req.body.url;
            var jirausername = req.body.username;
            var jirapwd = req.body.password;
            if (!validateData(jiraurl, "empty") && !validateData(jirausername, "empty") && !validateData(jirapwd, "empty")) {
                var inputs = {
                    "jira_serverlocation": jiraurl,
                    "jira_uname": jirausername,
                    "jira_pwd": jirapwd
                };
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                    if(mySocket != undefined) {	
                            logger.info("Sending socket request for jira_login to cachedb");
                            var dataToIce = {
                                "emitAction": "jiralogin",
                                "username": icename,
                                "action": req.body.action,
                                "inputs": inputs
                            };
                            mySocket.emit("jiralogin", req.body.action, inputs, dataToIce.project_selected, dataToIce.itemType);
                            var count = 0;

                            function jira_login_4_listener(message) {
                                var data = message;
                                mySocket.removeListener("Jira_details", jira_login_4_listener);
                                        var resultData = data;
                                        if (count == 0) {
                                            if (resultData != "Fail" && resultData != "Invalid Url" && resultData != "Invalid Credentials") {
                                                logger.info('Jira: Login successfully.');
                                            } else {
                                                if(resultData == "Fail") data = "Fail to Login"
                                                resultData = {'error':data}
                                                logger.error('Jira: Login Failed.');
                                            }
                                            res.send(resultData);
                                            count++;
                                        }
                            
                            }
                            mySocket.on("Jira_details", jira_login_4_listener);
                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectJira_ICE - loginToJira: Socket not Available");
                                res.send(flag);
                        }
                    
                } catch (exception) {
                    logger.error("Exception in the service connectJira_ICE - loginToJira: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectJira_ICE - loginToJira: Invalid inputs");
                res.send("Fail");
            }}
            else if (req.body.action == 'getJiraTestcases' ) { //Login to Jira for mapping screen
                var jiraurl = req.body.url;
                var jirausername = req.body.username;
                var jirapwd = req.body.password;
                if (!validateData(jiraurl, "empty") && !validateData(jirausername, "empty") && !validateData(jirapwd, "empty")) {
                    //var inputs = [jiraurl,jirausername,jirapwd];
                    var inputs = {
                        "jira_serverlocation": jiraurl,
                        "jira_uname": jirausername,
                        "jira_pwd": jirapwd
                    };
                    try {
                        logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                        logger.debug("ICE Socket requesting Address: %s", icename);
                            if(mySocket != undefined) {
                                logger.info("Sending socket request for jira_login to cachedb");
                                mySocket.emit("jiralogin", req.body.action, inputs, {
                                    'project':req.body.project,
                                    'key':req.body.key
                                }, req.body.itemType);
                                var count = 0;
    
                                function jira_login_5_listener(message) {
                                    var data = message;
                                    mySocket.removeListener("Jira_testcases", jira_login_5_listener);
                                        
                                        var resultData = data;
                                        if (count == 0) {
                                            if (resultData != "Fail" && resultData != "Invalid Url" && resultData != "Invalid Credentials") {
                                                logger.info('Jira: Login successfully.');
                                            } else {
                                                logger.error('Jira: Login Failed.');
                                            }
                                            res.send(resultData);
                                            count++;
                                        }
                                        
                                }
                                mySocket.on("Jira_testcases", jira_login_5_listener);
                            } else {
                                    flag = "unavailableLocalServer";
                                    logger.error("Error occurred in the service connectJira_ICE - loginToJira: Socket not Available");
                                    res.send(flag);
                            }
                    } catch (exception) {
                        logger.error("Exception in the service connectJira_ICE - loginToJira: %s", exception);
                    }
                } else {
                    logger.error("Error occurred in the service connectJira_ICE - loginToJira: Invalid inputs");
                    res.send("Fail");
                }}} else{
                    res.send("unavailableLocalServer");
                }
    } catch (exception) {
        logger.error("Exception in the service connectJira_ICE: %s", exception);
        res.send("Fail");
    }
    
};

exports.getJiraTestcases_ICE = function (req, res) {
	logger.info("Inside UI service: getJiraTestcases_ICE");
	try {
        var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username = req.session.username;
		var name = undefined;
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) name = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][name];	
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
        if(mySocket != undefined) {	
				var zephyrDetails = {
					"treeId": req.body.treeId,
					"zephyraction": req.body.zephyraction
				};
				logger.info("Sending socket request for zephyrlogin to redis");
                mySocket.emit("zephyrlogin", zephyrDetails);
				function zephyrlogin_listener(message) {
					var data = message;
						mySocket.removeListener('qcresponse',zephyrlogin_listener);
							data = data;
							res.send(data);
				}
				mySocket.on("qcresponse",zephyrlogin_listener);
			} else {
                    flag = "unavailableLocalServer";
                    logger.info("ICE Socket not Available");
					res.send(flag);
			}
		
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

const updateDbReportData = async (reportId, slno, defectId) => {
    const inputs = {
        "reportid": reportId,
        "slno": slno,
        "defectid": defectId
    };
    const reportUpdateStatus = await utils.fetchData(inputs, "reports/updateReportData", "updateDbReportData");
    return reportUpdateStatus !== "fail";
}


//Get report for execution
exports.getReport_API = async (req, res) => {
    const fnName = "getReport_API";
    var statusCode = '500';
    logger.info("Inside UI service: " + fnName);
    try {
        const execData = req.body.execution_data || {};
		var executionId = execData.executionId || "";
		var scenarioIds = execData.scenarioIds;
		var finalReport = [];
		var tempModDict = {};
        let headerUserInfo = utils.getUserInfoFromHeaders(req.headers)
        if (!headerUserInfo){
            res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['400'])
            return res.status('400').send({'error':"Invalid or missing user info in request headers."})
        }
		const userInfo = await tokenAuth.tokenValidation(headerUserInfo);
		const execResponse = userInfo.inputs;
        if (execResponse.tokenValidation !== "passed") {
            finalReport.push(execResponse);
            res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['401'])
            return res.status('401').send(finalReport);
        }

        const inputs = { executionId, scenarioIds };
        const data = await utils.fetchData(inputs, "reports/getReport_API", fnName, true);
        let reportResult = data[0];
        let reportStatus = data[2];
        if (reportResult == "fail") {
            if(reportResult[2] && reportResult[2].errMsg !== "") execResponse.error_message=reportResult.errMsg;
            if(reportStatus.errMsg != "") execResponse.error_message = reportStatus.errMsg;
            finalReport.push(execResponse);
            res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['400'])
            return res.status('400').send(finalReport);
        }
        if (reportResult.errMsg != ""){
            statusCode = "400"
            execResponse.error_message=reportResult.errMsg;
        } 
        finalReport.push(execResponse);
        for(let i=0; i<reportResult.rows.length; ++i) {
            const reportInfo = reportResult.rows[i];
            const report = prepareReportData(reportInfo,'removeReportItems').report;
            report.overallstatus.reportId = reportInfo.reportid;
            delete report.overallstatus.scenarioName;
            delete report.overallstatus.executionId;
            delete report.overallstatus.moduleName;
            const suburl = req.originalUrl.endsWith('/')? req.originalUrl.slice(0,-1):req.originalUrl;
            const downloadUri = req.protocol + '://' + (req.headers["origin"] || req.hostname) + suburl.split('/').slice(0,-1).join('/') + '/viewReport/' + reportInfo.reportid;
            const scenarioReport = {
                scenarioId: reportInfo.testscenarioid,
                scenarioName: reportInfo.testscenarioname,
                pdf: downloadUri + '.pdf',
                view: downloadUri + '.html',
                Report: report
            };
            const moduleId = reportInfo.moduleid;
            if (tempModDict[moduleId]) {
                tempModDict[moduleId].Scenarios.push(scenarioReport);
            } else {
                tempModDict[moduleId] = {
                    moduleId: moduleId,
                    moduleName: reportInfo.testsuitename,
                    Scenarios: [scenarioReport]
                };
            }
        }
        for (let modid in tempModDict) {
            finalReport.push(tempModDict[modid]);
        } 
        logger.info("Sending reports in the service %s", fnName);
        if (statusCode != "400") statusCode = '200';
        delete execResponse.error_message;
        res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES[statusCode])
        return res.status(statusCode).send(finalReport);
    } catch (exception) {
        logger.error("Exception in the service %s - Error: %s", fnName, exception);
        res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['500'])
        return res.status("500").send("fail");
    }
};


exports.saveJiraDetails_ICE = async (req, res) => {
    
	const fnName = "saveJiraDetails_ICE";
	logger.info("Inside UI service: " + fnName);
    // console.log(req.body);
	try {
		var mappedDetails = req.body.mappedDetails;
		var flag = mappedDetails.length > 0;
		if (!flag) return res.send('fail');
		for (let i=0; i<mappedDetails.length; i++) {
			let itr = mappedDetails[i];
			const inputs = {
				"testscenarioid": itr.scenarioId[0],
				'projectid': itr.projectId,			
				'projectName': itr.projectName,
				'projectCode': itr.projectCode,
				'itemId': itr.testId,
				'itemCode': itr.testCode,
                'itemType': itr.itemType,
                'itemSummary':itr.itemSummary,
				"query": "saveJiraDetails_ICE"
			};
			const result = await utils.fetchData(inputs, "qualityCenter/saveIntegrationDetails_ICE", fnName);
			if (result == "fail") flag = false;
		}
		if (!flag) return res.send('fail');
		res.send("success");
	} catch (exception) {
		logger.error("Error occurred in jira/"+fnName+":", exception);
		res.send("fail");
	}
};


exports.viewJiraMappedList_ICE = async (req, res) => {
    // console.log(args);
	const fnName = "viewJiraMappedList_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		var userid = req.session.userid;
        if (!req.body.scenarioName) {
            var inputs = {
                "userid": userid,
                "query": "jiradetails"
            };
        } else {
            var inputs = {
                "userid": userid,
                'scenarioName':req.body.scenarioName,
                "query": "jiradetails"
            };
        }
		const result = await utils.fetchData(inputs, "qualityCenter/viewIntegrationMappedList_ICE", fnName);
		if (result == "fail") res.send('fail');
		else res.send(result);
	} catch (exception) {
		logger.error("Error occurred in zephyr/"+fnName+":", exception);
		res.send("fail");
	}
};


exports.getAccessibilityReports_API = async(req, res)=>{
    const executionId = req.body.execution_data.executionId;
    var userInfo = req.body.userInfo;
    var result = {"error":"Interanal Server Error", "userinfo":{"ice":userInfo.icename,"token":userInfo.tokenname}};
    try{
        // const token = await utils.tokenValidation(userInfo);
        // if(token.inputs.tokenValidation.toLowerCase() == "passed"){
        //     const inputs = {
        //         "executionid": executionId,
        //     };
        //     reports = await utils.fetchData(inputs,"reports/getAccessibilityReports_API", "getAccessibilityReports_API");
        //     if(reports == 'fail'){
        //         result['error'] = "Invalid Execution ID"
        //     }else{
        //         result['reports'] = reports;
        //         delete result['error'];
        //     } 
        // }else{
        //     result["error"] = "Invalid Token";
        // }
        res.send("Fail");
    }catch(e){
        logger.error("Exception occured in getAccessibilityReports_API service", exception);
        return res.status(500).send("fail");
    }
}

const fetch_metrics=async (args) => {
    const executionId = args.executionId;
    const fromDate = args.fromDate || "";
    const toDate = args.toDate || "";
    const LOB = args.LOB || "";
    const status = args.status;
    const modifiedBy = args.modifiedBy;
    var inputs = {
        "executionid" : executionId,
        "fromdate" : fromDate,
        "todate" : toDate,
        "LOB" : LOB,
        "status" : status,
        "modifiedby" : modifiedBy,
        "api":args.api
    };
    var args = {
        data: inputs,
        headers: {
            "Content-Type": "application/json"
        }
    };
    logger.info("Calling DAS Service from getExecution_metrics_API: reports/getExecution_metrics_API");
    const result=await utils.fetchData(inputs,"reports/getExecution_metrics_API", "getExecution_metrics_API",true);
    return result;
};


exports.getExecution_metrics_API = async(req, res) => {
    logger.info("Inside UI service: getExecution_metrics_API");
    var statusCode = '500';
    try {
        const headerUserInfo = utils.getUserInfoFromHeaders(req.headers);
        if (!headerUserInfo){
            res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['400'])
            return res.status('400').send({'error':"Invalid or missing user info in request headers."})
        }
		const userInfo = await tokenAuth.tokenValidation(headerUserInfo);
        var execResponse = userInfo.inputs;
        var finalReport=[];
        if (execResponse.tokenValidation == "passed"){
            delete execResponse.error_message;
            var metrics_data=req.body.metrics_data;
            metrics_data.api=true;
            var reportResult = await fetch_metrics(metrics_data);
            var result = reportResult[0] =='fail' ? reportResult[2]: reportResult[0];
            if(result.errMsg != ""){
                execResponse.error_message = result.errMsg;
                statusCode = "400";
            }else{
                finalReport.push(result);
                statusCode = "200";
            }
        }else{
            statusCode = "401";
        }
        finalReport.push(execResponse);
        logger.info("Sending reports in the service getExecution_metrics_API: final function");
        res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES[statusCode]);
        return res.status(statusCode).send(finalReport);
    } catch (exception) {
        logger.error("Exception in the service getExecution_metrics_API - Error: %s", exception);
        res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES["500"]);
        return res.status("500").send("fail");
    }
};


exports.getExecution_metrics = async(req, res) => {
    logger.info("Inside UI service: getExecution_metrics");
    try {
            var metrics_data=req.body.metrics_data;
			metrics_data.api=false;
            logger.info("Calling DAS Service from getExecution_metrics: reports/getExecution_metrics");
			var reportResult = await fetch_metrics(metrics_data);
			if (reportResult[0] == 'fail') {
                if (reportResult[2]){
                    if(reportResult[2].errMsg == "Invalid Execution Id") 
                        return res.send("InvalidExecId");
                    else if(reportResult[2].errMsg == "Invalid Status") 
                        return res.send("InvalidStatus");
                    else return res.send('fail');
                }
                else return res.send('fail');
            } else if(reportResult[0].rows.length==0) {
                return res.send('NoRecords');
            } else {
                var data=reportResult[0].rows;
                var dir = './../../output';
                var excelDirPath = path.join(__dirname, dir);
                const filePath = path.join(excelDirPath, 'samp234.csv');
                try {
                    if (!fs.existsSync(excelDirPath)) fs.mkdirSync(excelDirPath); // To create directory for storing excel files if DNE.
                    if (fs.existsSync(filePath)) fs.unlinkSync(path.join(filePath)); // To remove the created files
                } catch (e) {
                    logger.error("Exception in getExecution_metrics: Create Directory/Remove file", e);
                }
                var csv = data.map(row => Object.values(row));
                csv.unshift(Object.keys(data[0]));
                var csvdata= `"${csv.join('"\n"').replace(/,/g, '","')}"`;
                fs.writeFile(filePath, csvdata, 'utf8', function (err) {
                    if (err) {
                        logger.error('Error in writing to CSV in the service getExecution_metrics');
                        return res.send('fail');
                    } else {
                        res.writeHead(200, {'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                        var rstream = fs.createReadStream(filePath);
                        rstream.pipe(res);
                    }
                });
            }
    } catch (exception) {
        logger.error("Exception in the service getExecution_metrics_API - Error: %s", exception);
        res.send("fail");
    }
};

function validateData(content, type) {
    logger.info("Inside function: validateData");
    switch (type) {
        case "empty":
            return validator.isEmpty(content);
        case "url":
            return validator.isURL(content);
        case "num":
            return validator.isNumeric(content);
        case "alph":
            return validator.isAlpha(content);
        case "len":
            return validator.isLength(content);
        case "uuid":
            return validator.isUUID(content);
        case "email":
            return validator.isEmail(content);
        case "json":
            return validator.isJSON(content);
    }
}

exports.saveAccessibilityReports = async function (reports){
	try {
		if (!reports) return false;
		const fnName = "getAccessibilityTestingData_ICE"
		var inputs = {
			"query": "insertdata",
			"reports": reports
		}
		const result = await utils.fetchData(inputs, "reports/getAccessibilityTestingData_ICE", fnName);
	} catch(e){
		logger.error(e.message);
	}
}

//GET REPORTS FOR DEVOPS EXECUTION
exports.getDevopsReport_API = async (req) => {
    const fnName = "getDevopsReport_API";
    var statusCode = '500';
    logger.info("Inside UI service: " + fnName);
    try {
        // const execData = req.body.execution_data || {};
		var executionId = req.body._id || "";
		var scenarioIds = req.body.scenariodetails;
		var finalReport = [];
		var tempModDict = {};
		// const userInfo = await tokenAuth.tokenValidation(headerUserInfo);
		const execResponse = {};
        // execResponse.tokenValidation = 'passed';

        const inputs = { executionId, scenarioIds, 'query': 'devopsReport' };
        const data = await utils.fetchData(inputs, "reports/getDevopsReport_API", fnName, true);
        let reportResult = data[0];
        let reportStatus = data[2];
        if (reportResult == "fail") {
            return 'fail';
        }
        if (reportResult.errMsg != ""){
            statusCode = "400"
            execResponse.error_message=reportResult.errMsg;
        } 
        // finalReport.push(execResponse);
        for(let i=0; i<reportResult.rows.length; ++i) {
            const reportInfo = reportResult.rows[i];
            const report = prepareReportData(reportInfo,'removeReportItems').report;
            report.overallstatus.reportId = reportInfo.reportid;
            delete report.overallstatus.scenarioName;
            delete report.overallstatus.executionId;
            delete report.overallstatus.moduleName;
            delete report.rows
            // const suburl = req.req.originalUrl.endsWith('/')? req.req.originalUrl.slice(0,-1):req.req.originalUrl;
            // const downloadUri = req.req.protocol + '://' + (req.req.headers["origin"] || req.req.hostname) + suburl.split('/').slice(0,-1).join('/') + '/viewReport/' + reportInfo.reportid;
            const scenarioReport = {
                scenarioId: reportInfo.testscenarioid,
                scenarioName: reportInfo.testscenarioname,
                // pdf: downloadUri + '.pdf',
                // view: downloadUri + '.html',
                Report: report
            };
            const moduleId = reportInfo.moduleid;
            if (tempModDict[moduleId]) {
                tempModDict[moduleId].Scenarios.push(scenarioReport);
            } else {
                tempModDict[moduleId] = {
                    moduleId: moduleId,
                    moduleName: reportInfo.testsuitename,
                    Scenarios: [scenarioReport]
                };
            }
        }
        for (let modid in tempModDict) {
            finalReport.push(tempModDict[modid]);
        } 
        logger.info("Sending reports in the service %s", fnName);
        if (statusCode != "400") statusCode = '200';
        delete execResponse.error_message;
        return finalReport ? finalReport[0] : [];
    } catch (exception) {
        logger.error("Exception in the service %s - Error: %s", fnName, exception);
        return 'fail'
    }
};


exports.getAvoDetails = async (req, res) => {
	logger.info("Inside UI service: getAvoDetails");
	var projectDetailList = {
		"avoassure_projects": '',
		"project_dets": ""
	};
	try {
		var userid = req.session.userid;
        getProjectsForUser(userid, function (projectdata) {
            try {
                projectDetailList.avoassure_projects = projectdata;
                res.send(projectDetailList);
            } catch (ex) {
                logger.error(ex);
                res.send("fail");
            }
		});
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.fetchAgentModuleList = async (req, res) => {
	const fnName = "fetchAgentModuleList";
	logger.info("Inside UI service: " + fnName);
	try {
		// const reqData = req.session.userid;
		const input = {
			'executionListId': req.body.executionListId
		}
		const list = await utils.fetchData(input, "devops/getAgentModuleList", "fetchAgentModuleList");
		res.send(list);
	} catch(exception) {
		logger.error("Error occurred in devops/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

//To fetch the History data
exports.fetchHistory = async (req, res) => {
	const fnName = "fetchHistory";
	logger.info("Inside UI service: " + fnName);
	try {
		// const reqData = req.session.userid;
		const input = {
			userid: req.session.userid,
            fromDate: req.body.fromDate,
            toDate:req.body.toDate
		}
		const list = await utils.fetchData(input, "devops/fetchHistory", "fetchHistory");
		res.send(list);
	} catch(exception) {
		logger.error("Error occurred in devops/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

function getProjectsForUser(userid, cb) {
	logger.info("Inside function getProjectsForUser");
	var projectDetailsList = [];
	var projectidlist = [];
	async.series({
		getprojectDetails: function (callback1) {
			var getprojects = "select projectids from icepermissions where userid=" + userid;
			var inputs = {
				"userid": userid,
				"query": "getprojectDetails"
			};
            inputs.host = headers.headers.host;
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling DAS Service from getProjectsForUser: qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (projectrows, response) {
				if (response.statusCode != 200 || projectrows.rows == "fail") {
					logger.error("Error occurred in qualityCenter/qcProjectDetails_ICE from getprojectDetails Error Code : ERRDAS");
				} else {
					if (projectrows.rows.length != 0) {
						projectidlist = projectrows.rows[0].projects;
					}
				}
				callback1();
			});
		},
		scenarioDetails: function (callback1) {
			async.forEachSeries(projectidlist, function (itr, callback2) {
				projectandscenario(itr, function (err, projectDetails) {
					projectDetailsList.push(projectDetails);
					callback2();
				});

			}, callback1);
		},
		data: function (callback1) {
			cb(projectDetailsList);
		}
	});
}

function projectandscenario(projectid, cb) {
		logger.info("Inside function projectandscenario");
	var scenarios_list;
	var projectDetails = {
		"project_id": '',
		"project_name": '',
		"scenario_details": ''
	};
	var projectname = '';
	async.series({
		projectname1: function (callback1) {
			var inputs = {
				"projectid": projectid,
				"query": "projectname1"
			};
            inputs.host = headers.headers.host;
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
				logger.info("Calling DAS Service : qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (projectdata, response) {
				if (response.statusCode != 200 || projectdata.rows == "fail") {
					
					logger.error("Error occurred in getProjectsForUser from projectname1 Error Code : ERRDAS");
				} else {
					if (projectdata.rows.length != 0) {
						projectname = projectdata.rows[0].name;
					}
				}
				callback1();
			});
		},
		scenariodata: function (callback1) {
			var inputs = {
				"projectid": projectid,
				"query": "scenariodata"
			};
            inputs.host = headers.headers.host;
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
				logger.info("Calling DAS Service :qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (scenariorows, response) {
				if (response.statusCode != 200 || scenariorows.rows == "fail") {
					logger.error("Error occurred in getProjectsForUser from scenariodata Error Code : ERRDAS");
				} else {
					if (scenariorows.rows.length != 0) {
						scenarios_list = JSON.parse(JSON.stringify(scenariorows.rows));
						projectDetails.project_id = projectid;
						projectDetails.scenario_details = scenarios_list;
						projectDetails.project_name = projectname;
					} else {
						projectDetails.project_id = projectid;
						projectDetails.project_name = projectname;

					}
				}
				callback1();
			});
		}
	}, function (err, data) {
		cb(null, projectDetails);
	});
}


exports.fetchExecProfileStatus = async (req, res) => {
    const fnName = "fetchExecProfileStatus";
    logger.info("Inside UI service: " + fnName);
    try {            
            inputs = {
              query: "fetchExecProfileStatus",
            };
            if (req.body.configurekey) {
              inputs.configurekey = req.body.configurekey;
            } else if (req.body.testsuiteid) {
              inputs.testsuiteid = req.body.testsuiteid;
            }
        const executionData = await utils.fetchData(inputs, "reports/fetchExecProfileStatus", fnName);
        if (executionData == "fail"){
            return res.send("fail");
        }else {
               return res.send(executionData);
            }
        }
        catch (exception) {
        logger.error("Error occurred in report/"+fnName+":", exception);
        res.send("fail");
    }
};

exports.fetchModSceDetails = async (req, res) => {
    const fnName = "fetchModSceDetails";
    logger.info("Inside UI service: " + fnName);
    try {      
        inputs = {    
                "query":"fetchModSceDetails",            
                param: req.body.param,
                executionId: req.body.executionId,
                executionListId:req.body.executionListId          
        }
        
        const ModSceDetails = await utils.fetchData(inputs, "reports/fetchModSceDetails", fnName);
        if (ModSceDetails == "fail"){
            return res.send("fail");
        }else {
               return res.send(ModSceDetails);
            }
        }
        catch (exception) {
        logger.error("Error occurred in report/"+fnName+":", exception);
        res.send("fail");
    }
};

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifnotEquals', function(arg1, arg2, options) {
    return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('getStyle', function(StepDescription) {
    if (StepDescription && (StepDescription.indexOf("Testscriptname") !== -1 || StepDescription.indexOf("TestCase Name") !== -1)) return "bold";
    else return;
});

Handlebars.registerHelper('getClass', function(StepDescription) {
    if (StepDescription && (StepDescription.indexOf("Testscriptname") !== -1 || StepDescription.indexOf("TestCase Name") !== -1)) return "collapsible-tc demo1 txtStepDescription";
    else return "rDstepDes tabCont";
});

Handlebars.registerHelper('getColor', function(overAllStatus) {
    if (overAllStatus == "Pass") return "green";
    else if (overAllStatus == "Fail") return "red";
    else if (overAllStatus == "Terminate") return "#faa536";
});

Handlebars.registerHelper('validateImageID', function(path, slno) {
    return path? ("#img-" + slno) : '';
});

Handlebars.registerHelper('validateImagePath', function(path) {
    return path? 'block' : 'none';
});

Handlebars.registerHelper('getDataURI', function(uri) {
    var f = "data:image/PNG;base64,";
    if (!uri || uri == "fail" || uri == "unavailableLocalServer") return f;
    else return f + uri;
});

Handlebars.registerHelper('statusClassName', function(tcStatus) {
    let statusText = '';
    switch(tcStatus) {
        case 'Pass':
            statusText = 'passed';
            break;
        case 'Fail':
            statusText = 'failed';
            break;
        case 'Terminate':
            statusText = 'terminated';
            break;
        default:
            statusText = '';
    }
    return statusText;
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifnotEquals', function(arg1, arg2, options) {
    return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

// pdfReport 
Handlebars.registerHelper("getColor", function (overAllStatus) {
	if (overAllStatus == "Pass") return "#28a745";
	else if (overAllStatus == "Fail") return "#dc3545";
	else if (overAllStatus == "Terminate") return "#ffc107";
});

Handlebars.registerHelper("validateImageID", function (path, slno) {
	if (path != null) return "#img-" + slno;
	else return '';
})

Handlebars.registerHelper("validateImagePath", function (path) {
	if (path != null) return 'block';
	else return 'none';
})

Handlebars.registerHelper("getDataURI", function (uri) {
	var f = "data:image/PNG;base64,";
	if (uri == "fail" || uri == "unavailableLocalServer") return f;
	else return f + uri;
});

Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
	return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifnotEquals', function (arg1, arg2, options) {
	return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});



fs.readFile('./templates/pdfReport/content.handlebars', 'utf8', function(err, data) {
    templatepdf = Handlebars.compile(data);
});

fs.readFile('./templates/specificReport/content.handlebars', 'utf8', function(err, data) {
    templateweb = Handlebars.compile(data);
});

// Injecting Data to Reports Html Template.
const htmlDoc = async (replacementData, rawHtmlPath) => {
    const rawHtml = fs.readFileSync(`${process.cwd()}${rawHtmlPath}`, 'utf8');
    return Handlebars.compile(rawHtml)(replacementData);
};
const htmlPaths = {
    executive_report_path: "/assets/html/executive_report.html",
    summary_report_path: "/assets/html/summary_report.html",
    detailed_report_path: "/assets/html/detailed_report.html",
    tc_report_path: "/assets/html/testCaseReport.html",
};

const getScreenshots = async(replacements, scrShots, username, client) => {
    try{
        let webserverURL = "https://"+(process.env.NGINX_URL || "127.0.0.1")+":"+(process.env.NGINX_PORT || "8443")
        const instance = axios.create({
            httpsAgent: new https.Agent({  
                rejectUnauthorized: false,
                requestCert: true,
            })
        });
        let dataURIs = await instance(webserverURL+'/openScreenShot_API', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                "absPath": scrShots.paths,
                "username": username,
                "client": client
            },
            credentials: 'include',
        })
        if (["fail", "unavailableLocalServer", "scheduleModeOn"].includes(dataURIs.data)) {
            scrShots.paths.forEach((d, i) => replacements.rows[scrShots.idx[i]].screenshot_dataURI = '');
        } else {
            dataURIs.data.forEach((d, i) => replacements.rows[scrShots.idx[i]].screenshot_dataURI = d);
        }
        return replacements;
    }
    catch(err){
        console.log("ERROR:", err)
        logger.error("Exception occurred in " + fnName + " when trying to access screenshots: %s", err);
    }
}

exports.viewReport = async (req, res, next) => {
    const fnName = "viewReport";
    logger.info("Inside UI function: " + fnName);
    const embedImages = req.query.images === 'true';
    const reportId = req.query.reportID;
    const fileType = req.query.fileType;
    const exportLevel = req.query.exportLevel;
    const downloadLevel = req.query.downloadLevel;
    const executionListId = req.query.executionListId; // required for row-level downloads
    const isViewReport = req.query.viewReport === "true" ? true : false;

    logger.info("Requesting report type - " + fileType);
    var statusCode = 400;
    let replacements = [];
    let scrShots = [];
    if (!['pdf', 'json'].includes(fileType)) {
        return res.status(statusCode).send({
            ecode: "BAD_REQUEST",
            emsg: "Requested Report Type is not Available",
            status: 400
        });
    }
    // generate Report Data
    replacements = await prepareExecutionReportData(exportLevel, downloadLevel, executionListId, reportId, embedImages, isViewReport);
    scrShots = replacements.scrShots ? replacements.scrShots : [];
    // if filetype is json
    if (fileType == "json") {
        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(replacements, null, 2));
    } else if (fileType == "pdf") {
        res.setHeader("Content-Type", "application/pdf");
        if (scrShots && scrShots.paths && scrShots.paths.length > 0) {
            replacements = await getScreenshots(replacements, scrShots, req.session.username, req.session.client)
        }
        try {
            let rawHtmlPath = replacements.rawHtmlPath;
            // inject data to raw html using handlebars
            const dataInjectedHtml = await htmlDoc(replacements, rawHtmlPath);
            // create pdf
            const pdf = new Readable({read: ()=>{}});
            pdf.push(dataInjectedHtml);
            pdf.push(null);
            wkhtmltopdf(pdf).pipe(res);
        } catch (exception) {
            let report = { overallstatus: [{}], rows: [], remarksLength: 0, commentsLength: 0 };
            report.error = {
                ecode: "SERVER_ERROR",
                emsg: "Error while generating report due to an internal error. Try again later!",
                status: 500
            };
            const emsg = exception.message;
            if ((exception instanceof RangeError) && emsg === "Invalid string length") {
                report.error.emsg = emsg = "Error while generating report. Report size too large";
                report.error.ecode = "LIMIT_EXCEEDED";
            }
            logger.error("Exception occurred in " + fnName + " when trying to render report: %s", emsg);
            statusCode = report.error && report.error.status || 200;
            return res.status(statusCode).send(report.error);
        }
    }
};
/** This service is to get the execution details for given project and time period */
exports.fetchExecutionDetail = async (req, res) => {
	logger.info("Inside UI service: fetchExecutionDetail");
	var paramDetails = req.body;
	logger.info(paramDetails);
	if(paramDetails.authToken==="awdtbkob4g80h-jnlhge43stgjb7hj7g"){
		var inputs = {
			"query": "fetchExecutionDetail",
			"ProjName":paramDetails.ProjName || "Default",			
			"prefixRegexProjName": paramDetails.prefixRegexProjName || "Default",
			"startDate":paramDetails.startDate,
			"endDate":paramDetails.endDate
		};
		const result = await utils.fetchData(inputs, "reports/fetchExecutionDetail", "fetchExecutionDetail")
		return res.send(result);
	}
	else{
		return res.send({ status: 'fail'});
	};
}

exports.getReportsData_ICE = async (req, res) => {
    const fnName = "getReportsData_ICE";
    try {
        let reportInputData = req.body.reportsInputData;
        if (reportInputData.type == 'allmodules') {
            logger.info("Inside UI service: " + fnName + " - allmodules");
            let inputs = {
                "query": "getAlltestSuites",
                "id": reportInputData.cycleId,
                "page": reportInputData.page,
                "searchKey": reportInputData.searchKey,

            };
            if(reportInputData['configurekey'] && reportInputData['cycleId'] == ''){
                inputs = {
                    "query": "getAlltestSuitesDevops",
                    "data": reportInputData
                }
            }
            const result1 = await utils.fetchData(inputs, "reports/getAllSuites_ICE", fnName)
            if (result1 == "fail") return res.send("fail");
            return res.send({ rows: result1 });
        }
    } catch (exception) {
        logger.error("Error occurred in "+fnName+". Error: " + exception.message);
        res.status(500).send("fail");
    }
};

exports.getSuiteDetailsInExecution_ICE = async (req, res) => {
    const fnName = "getSuiteDetailsInExecution_ICE";
    logger.info("Inside UI service: " + fnName);
    try {
        let inputs = {}
        if ("configurekey" in req.query){
            inputs = {
                'configurekey': req.query.configurekey,
                'suiteid': req.query.testsuiteid
            }
        }
        else if ("testsuiteid" in req.body) {
            inputs = {
                'suiteid': req.body.testsuiteid
            }
        }
        else if ("batchname" in req.body) {
            inputs = {
                'batchname': req.body.batchname
            }
        }
        else{
            inputs = ("batchname" in req.query)?{"batchname": req.query.batchname}:{"suiteid": req.query.testsuiteid}
        }
        const executionData = await utils.fetchData(inputs, "reports/getSuiteDetailsInExecution_ICE", fnName);
        if (executionData == "fail") return res.send("fail");
        var startTime, endTime, starttime, endtime;
        var executionDetailsJSON = [];
        for (var i = 0; i < executionData.length; i++) {
            startTime = new Date(executionData[i].starttime);
            starttime = ("0"+startTime.getUTCDate()).slice(-2) + "-" + ("0"+(startTime.getUTCMonth() + 1)).slice(-2) + "-" + ("0"+startTime.getUTCFullYear()).slice(-2) + " " + ("0"+startTime.getUTCHours()).slice(-2) + ":" + ("0"+startTime.getUTCMinutes()).slice(-2);
            if (executionData[i].endtime === null) endtime = '-';
            else {
                endTime = new Date(executionData[i].endtime);
                endtime = ("0"+endTime.getUTCDate()).slice(-2) + "-" + ("0"+(endTime.getUTCMonth() + 1)).slice(-2) + "-" + ("0"+endTime.getUTCFullYear()).slice(-2) + " " + ("0"+endTime.getUTCHours()).slice(-2) + ":" + ("0"+endTime.getUTCMinutes()).slice(-2);
            }
            executionDetailsJSON.push({
                execution_id: executionData[i]._id,
                start_time: starttime,
                end_time: endtime,
                status: executionData[i].status,
                batchid: executionData[i].batchid,
                smart: executionData[i].smart
            });
        }
        logger.info("Sending execution details from reports/"+fnName);
        res.send(JSON.stringify(executionDetailsJSON));
	} catch (exception) {
		logger.error("Error occurred in report/"+fnName+":", exception);
		res.send("fail");
    }
};

exports.reportStatusScenarios_ICE = async (req, res) => {
    const fnName = "reportStatusScenarios_ICE";
    logger.info("Inside UI service: " + fnName);
    try {
        var executionid = req.body.executionId;
        var report = [];
        let inputs = {
            "query": "executiondetails",
            "executionid": executionid[0],
        };
        const result = await utils.fetchData(inputs, "reports/reportStatusScenarios_ICE", fnName);
        if (result == "fail") return res.send("fail");
        for (let entry of result) {
            let executedtimeTemp = new Date(entry.executedtime);
            if (executedtimeTemp !== null && executedtimeTemp != "Invalid Date") {
                executedtimeTemp = ("0" + executedtimeTemp.getUTCDate()).slice(-2) + "-" + ("0" + (executedtimeTemp.getUTCMonth() + 1)).slice(-2) + "-" + (executedtimeTemp.getUTCFullYear()) + " " + ("0" + executedtimeTemp.getUTCHours()).slice(-2) + ":" + ("0" + executedtimeTemp.getUTCMinutes()).slice(-2) + ":" + ("0" + executedtimeTemp.getUTCSeconds()).slice(-2);
                // executedtimeTemp = executedtimeTemp.getUTCDate() + "-" + executedtimeTemp.getUTCMonth() + "-" + executedtimeTemp.getUTCFullYear() + " " + executedtimeTemp.getUTCHours() + ":" + executedtimeTemp.getUTCMinutes() + ":" + executedtimeTemp.getUTCSeconds();
            }
            report.push({
                executedtime: executedtimeTemp,
                browser: entry.executedon,
                status: entry.status,
                reportid: entry._id,
                testscenarioid: entry.testscenarioid,
                testscenarioname: entry.testscenarioname
            });
        }
        if (report.length > 0) report.sort((a, b) => a.executedtime - b.executedtime);
        logger.info("Sending scenario status details from reportStatusScenarios_ICE");
        return res.send(JSON.stringify(report));
    } catch (exception) {
        logger.error("Exception in the service reportStatusScenarios_ICE: %s", exception);
        res.send("fail");
    }
};

exports.downloadVideo = async (req, res) => {
    const fnName = "downloadVideo";
    const osPf = os.platform();
    const videoPathLinux = "" //options.screenShotPath.linux;
    logger.info("os platform is '%s'", osPf);
    logger.info("Inside UI service: " + fnName);
    try {
        var videoPath = req.body.videoPath;
        if (osPf == 'linux') {
            if (videoPathLinux != ""){
                /*Below logic is to manipulate or change the Video Path from windows to linux specific*/
                logger.info("Requested video file path is '%s'", videoPath);
                var ss_path = videoPath.split("Screenshots")[1];
                var temp_videoPath = videoPathLinux.concat(ss_path);
                videoPath = temp_videoPath.replace(/\\/g,"/");
                logger.info("Final video file path is '%s'", videoPath);
            } else {
                logger.error("Please enter the value of linux for screenShotPath in config");
            }
        }
        if (fs.existsSync(videoPath)) {
            res.writeHead(200, {
                'Content-Type': 'video/mp4',
            });
            const filestream = fs.createReadStream(videoPath);
            filestream.pipe(res);
        } else {
            logger.error("Requested video file '%s' is not available", videoPath);
            return res.status(404).send("fail");
        }
    } catch (exception) {
        logger.error("Exception in the service %s - Error: %s", fnName, exception);
        res.send("fail");
    }
}

exports.getAccessibilityTestingData_ICE = async function(req, res) {
    try {
		const fnName = "getAccessibilityTestingData_ICE"
		var inputs = {};
		var result = {};
		var query = req.body;
		switch(query.type){
			case "screendata":
				inputs ={query: "screendata", "cycleid": query.cycleId}; 
				result = await utils.fetchData(inputs, "reports/getAccessibilityTestingData_ICE", fnName);
				break;
			case "reportdata":
				inputs ={query: "reportdata", "executionid": query.executionid}; 
				result = await utils.fetchData(inputs, "reports/getAccessibilityTestingData_ICE", fnName);
				break;
			case "reportdata_names_only":
				inputs ={query: "reportdata_names_only", "screenname": query.screendata}; 
				result = await utils.fetchData(inputs, "reports/getAccessibilityTestingData_ICE", fnName);
				break;
			default:
				return res.send('fail');
		}
		if (result == "fail") return res.status(500).send("fail");
		else return res.send(result)
	} catch(e){
		logger.error(e.message);
		return res.status(500).send("fail");
	}
};
exports.uploadGeneratefile = async (req, res) => {
    logger.info("Inside UI service: uploadGeneratefile");
    try {
         // Validate request data
         if (!req.file || !req.body.name || !req.body.email || !req.body.projectname || !req.body.organization) {
            return res.status(400).json({ error: 'Bad request: Missing required data' });
        }
        var inputs = {
            "query": "uploadGeneratefile",
            "file": req.file,
            "name": req.body.name,
            "email": req.body.email,
            "project": req.body.projectname,
            "organization": req.body.organization,
            "type": req.body.type
        };
        const result = await utils.fetchData(inputs, "upload/generateAIfile", "uploadGeneratefile", true);

        // Check if an error response was received
        if (result &&  result[1].statusCode !== 200) {
            return res.status(result[1].statusCode).json({
                error: result[1].statusMessage || 'Unknown error',
            });
        }

        // If everything is successful, return a success response
        res.status(200).json({ success: true, message: 'File uploaded successfully' });
    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

}

 

exports.getall_uploadfiles = async (req, res) => {
    logger.info("Inside UI service: getall_uploadfiles");
    try {
         // Validate request data
         if (!req.query.email) {
            return res.status(400).json({ error: 'Bad request: Missing required params' });
        }
        var inputs = {
            "query": "getall_uploadfiles",
            "email": req.query.email,
        };
        const result = await utils.fetchData(inputs, "upload/getallUploadFiles", "getall_uploadfiles", true);

        // Check if an error response was received
        if (result &&  result[1].statusCode !== 200) {
            return res.status(result[1].statusCode).json({
                error: result[2].error || 'Unknown error',
            });
        }

        // If everything is successful, return a success response
        res.status(200).json({ data:result[0].rows , msg: result[0]['message'] });
    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };



  
  exports.teststepLevel_ExecutionStatus = async function (req, res) {

    logger.info("Inside report analysis module service ");
    try {
         if ( !req.body.executionid ) {
            return res.status(400).json({ error: 'Bad request: Missing required data' });
        }
        var inputs = {
            "query": "teststep_execution_analysis",
            "executionid": req.body.executionid
        };
        const result = await utils.fetchData(inputs, "/teststepLevel_ExecutionStatus", " teststep_execution_analysis", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("testcase fetched successfully");
        res.status(200).send({ success: true, data: result && result[0].data && result[0].data.length  ? result[0].data: [], message: 'data found' });

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.defect_analysis = async function (req, res) {

    logger.info("Inside report analysis module service ");
    try {
         if ( !req.body.projectid || !req.body.userid ) {
            return res.status(400).json({ error: 'Bad request: Missing required data' });
        }
        var inputs = {
            "query": "api_defect_execution_analysis",
            "projectid": req.body.projectid,
            "userid": req.body.userid,
            // "allflag":req.body.allflag,
            "start_time": req.body.start_time || '',
            "end_time": req.body.end_time || ''
        };
        const result = await utils.fetchData(inputs, "/defect_analysis", " api_defect_execution_analysis", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("defects fetched successfully");
        res.status(200).send({ success: true, data: result && result[0].data && result[0].data.length  ? result[0].data: [], 
            start_time:result && result[0].start_time ? result[0].start_time:'' ,
            end_time:result && result[0].end_time ? result[0].end_time:'',
            message: 'data found' });

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };
  exports.rasa_prompt_model = async function (req, res) {

    logger.info("Inside report analysis module service ");
    try {
        var inputs = {
            "projectid": req.body.projectid,
            "sender": req.body.sender,//"64e86e9f94d8d4c4811f1a9c",69a42e17-d4b1-41a7-8c4b-5ac69a7dcfad
            "roleid": req.body.roleid, // 5db0022cf87fdec084ae49aa (Lead), 5db0022cf87fdec084ae49ab (Manager)
            "message": req.body.message,
            "metadata": {
                "profileid": req.body.profileid || "",
                "moduleid": req.body.moduleId || "",
                "scenarioid": req.body.scenarioId || ""
            },
            "host": req.headers.host
        }

        
        const result = await utils.fetchData(inputs, "/rasa_prompt_model","",true);


        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result.status).json({
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("defects fetched successfully");
        res.status(200).send({ 
            data:JSON.parse(result[0].rows) || []
         });

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };


exports.getJiraJSON_ICE = function (req, res) {
    logger.info("Inside UI service: getJiraJSON_ICE");
    try {
        logger.info("Inside UI service: connectJira_ICE");
        var mySocket;
		var clientName=utils.getClientName(req.headers.host);
        var username=req.session.username;
        var icename = undefined
        if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
        mySocket = myserver.allSocketsMap[clientName][icename];
        if (req.body.action == 'getJiraJSON' ) { //Login to Jira for mapping screen
            var jiraurl = req.body.url;
            var jirausername = req.body.username;
            var jirapwd = req.body.password;
             if (!validateData(jiraurl, "empty") && !validateData(jirausername, "empty") && !validateData(jirapwd, "empty")) {
                //var inputs = [jiraurl,jirausername,jirapwd];
                var inputs = {
                    "jira_serverlocation": jiraurl,
                    "jira_uname": jirausername,
                    "jira_pwd": jirapwd
                };
                
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                        if(mySocket != undefined) {
                            logger.info("Sending socket request for jira_login to cachedb");
                            mySocket.emit("jiralogin", req.body.action, inputs, {
                                'project':req.body.project,
                                'key':req.body.key
                            }, req.body.itemType);
                            var count = 0;

                            function jira_login_5_listener(message) {
                                var data = message;
                                mySocket.removeListener("Jira_testcases_json", jira_login_5_listener);
                                    
                                    var resultData = data;
                                    if (count == 0) {
                                        if (resultData != "Fail" && resultData != "Invalid Url" && resultData != "Invalid Credentials") {
                                            logger.info('Jira: Login successfully.');
                                        } else {
                                            logger.error('Jira: Login Failed.');
                                        }
                                        // const temp_json_dir = process.cwd();
                                        // const filePath = `${temp_json_dir}/userstories.json`
                                        // // Save the JSON data to a file
                                        // fs.writeFileSync(filePath, JSON.stringify(resultData, null, 4));
                                        //     res.setHeader('Content-disposition', 'attachment; filename=userstories.json');
                                        // res.setHeader('Content-type', 'application/json');
                                        // // Send the file as a response
                                        // res.download(filePath, (err) => {
                                        //     if (err) {
                                        //         console.error(err);
                                        //         res.status(500).json({ error: 'Download failed' });
                                        //     }
                                        //     // Delete the temporary file after it has been sent
                                        //     fs.unlinkSync(filePath);
                                        // });
                                        res.send(resultData);
                                        count++;
                                    }
                                    
                            }
                            mySocket.on("Jira_testcases_json", jira_login_5_listener);
                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectJira_ICE - loginToJira: Socket not Available");
                                res.send(flag);
                        }
                } catch (exception) {
                    logger.error("Exception in the service connectJira_ICE - loginToJira: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectJira_ICE - loginToJira: Invalid inputs");
                res.send("Fail");
            }}

    } catch (exception) {
        logger.error(exception.message);
        res.send("fail");
    }
};
exports.getGenarate_testcase = async (req, res) => {
    const fnName = "getReportsData_ICE";
    try {
        let reportInputData = req.bo.reportsInputData;
        if (reportInputData.type == 'allmodules') {
            logger.info("Inside UI service: " + fnName + " - allmodules");
            let inputs = {
                "query": "getAlltestSuites",
                "id": reportInputData.cycleId
            };
            if(reportInputData['configurekey'] && reportInputData['cycleId'] == ''){
                inputs = {
                    "query": "getAlltestSuitesDevops",
                    "data": reportInputData
                }
            }
            const result1 = await utils.fetchData(inputs, "reports/getAllSuites_ICE", fnName)
            if (result1 == "fail") return res.send("fail");
            return res.send({ rows: result1 });
        }
    } catch (exception) {
        logger.error("Error occurred in "+fnName+". Error: " + exception.message);
        res.status(500).send("fail");
    }
}

exports.moduleLevel_ExecutionStatus = async function (req, res) {

    logger.info("Inside report analysis module service ");
    try {
         if ( !req.body.execlistid || !req.body.start_time || !req.body.end_time) {
            return res.status(400).json({ error: 'Bad request: Missing required data' });
        }
        var inputs = {
            "query": "api_modulelevel_execution_analysis",
            "execlistid": req.body.execlistid,
            "start_time": req.body.start_time,
            "end_time": req.body.end_time
        };
        const result = await utils.fetchData(inputs, "/moduleLevel_ExecutionStatus", "api_modulelevel_execution_analysis", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("modules fetched successfully");
        res.status(200).send({ success: true, data: result && result[0].data && result[0].data.length  ? result[0].data: [], message: 'data found' });

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.reportAnalysis = async (req, res) => {
    logger.info("Inside report analysis service ");
    try {
         if ( !req.body.projectid || !req.body.userid) {
            return res.status(400).json({ error: 'Bad request: Missing required data' });
        }
        var inputs = {
            "query": "api_profilelevel_execution_analysis",
            "projectid": req.body.projectid,
            "userid": req.body.userid,
            "start_time": req.body.start_time || '',
            "end_time": req.body.end_time || ''
        };
        const result = await utils.fetchData(inputs, "/profileLevel_ExecutionStatus", "api_profilelevel_execution_analysis", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("testcases generated successfully");
        res.status(200).send({ success: true, data: result && result[0].data && result[0].data.length  ? result[0].data: [],
            start_time:result && result[0].start_time ? result[0].start_time:'' ,
            end_time:result && result[0].end_time ? result[0].end_time:'', message: 'data found' });

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
