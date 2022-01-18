var myserver = require('../lib/socket');
var validator = require('validator');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');
var Handlebars = require('../lib/handlebar.js');
var wkhtmltopdf = require('wkhtmltopdf');
var fs = require('fs');
var os = require('os');
var options = require('../config/options');
const Readable = require('stream').Readable;
var path = require('path');
const tokenAuth = require('../lib/tokenAuth')

wkhtmltopdf.command = path.join(__dirname, '..', '..', 'assets', 'wkhtmltox', 'bin', 'wkhtmltopdf'+((process.platform == "win32")? '.exe':''));
var templatepdf = '';
var templateweb = '';
var constants = {
    'STATUS_CODES' : {
        "401": 'Token validation failed',
        "400": 'Invalid request details',
        "200": 'Successfull',
        '500': 'Internal Server Error'
    },
    'X_EXECUTION_MESSAGE' : 'X-EXECUTION-MESSAGE'
}

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

fs.readFile('assets/templates/pdfReport/content.handlebars', 'utf8', function(err, data) {
    templatepdf = Handlebars.compile(data);
});

fs.readFile('assets/templates/specificReport/content.handlebars', 'utf8', function(err, data) {
    templateweb = Handlebars.compile(data);
});


/** Function responsible for returning ICE connection status */
const checkForICEstatus = async (icename, fnName) => {
    logger.debug("ICE Socket requesting Address: %s", icename);
	const err = "Error occurred in the function "+fnName+": ";
    const sockmode = await utils.channelStatus(icename);
    if (!sockmode.schedule && !sockmode.normal) {
        logger.error(err + "ICE is not available");
        return "unavailableLocalServer";
    } else if (sockmode.schedule) {
        logger.error(err + "ICE is connected in Scheduling mode");
        return "scheduleModeOn";
    } else {
		return null;
	}
};

// To load screenshot from ICE
const openScreenShot = async (username, path) => {
    const fnName = "openScreenShot";
    try {
        var icename = undefined
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
        const iceStatus = await checkForICEstatus(icename, fnName);
        if (iceStatus !== null) return iceStatus;
        redisServer.redisSubServer.subscribe('ICE2_' + icename);
        logger.info("Sending socket request for render_screenshot to cachedb");
        const dataToIce = { "emitAction": "render_screenshot", "username": icename, "path": path };
        redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));

        return (new Promise((rsv, rej) => {
            let scrShotData = [];
            function render_screenshot_listener(channel, message) {
                const data = JSON.parse(message);
                if (icename == data.username && ["unavailableLocalServer", "render_screenshot_finished","render_screenshot"].includes(data.onAction)) {
                    const resultData = data.value;
                    if (data.onAction == "unavailableLocalServer") {
                        redisServer.redisSubServer.removeListener('message', render_screenshot_listener);
                        logger.error("Error occurred in " + fnName + ": Socket Disconnected");
                        rsv(data.onAction);
                    } else if (data.onAction == "render_screenshot_finished") {
                        redisServer.redisSubServer.removeListener('message', render_screenshot_listener);
                        if (resultData === "fail") {
                            logger.error("Screenshots processing failed!");
                            rsv("fail");
                        } else {
                            logger.debug("Screenshots processed successfully");
                            rsv(scrShotData);
                        }
                    } else if (data.onAction == "render_screenshot") {
                        scrShotData = scrShotData.concat(resultData);
                    }
                }
            }
            redisServer.redisSubServer.on("message", render_screenshot_listener);
        }));
    } catch (exception) {
        logger.error("Exception in openScreenShot when trying to open screenshot: %s", exception);
        cb('fail');
    }
};

// Render screenshots for html reports
exports.openScreenShot = async (req, res) => {
    try {
        const username = req.session.username;
        const result = await openScreenShot(username, req.body.absPath);
        res.send(result);
    } catch (exception) {
        logger.error("Exception in openScreenShot when trying to load screenshot: %s", exception);
        res.send("fail");
    }
};

//Render HTML/PDF reports for download
exports.renderReport_ICE = async (req, res) => {
    logger.info("Inside UI service: renderReport_ICE");
    try {
        const finalReports = req.body.finalreports;
        const reportType = req.body.reporttype;
        const username = req.session.username;
        const data = {
            "overallstatus": finalReports.overallstatus,
            "rows": finalReports.rows,
            "remarksLength": finalReports.remarksLength.length,
            'commentsLength': finalReports.commentsLength.length
        };
        //PDF Reports
        if (reportType != "html") {
            const scrShot = req.body.absPath;
            const result = await openScreenShot(username, scrShot.paths);
            if (["fail", "unavailableLocalServer", "scheduleModeOn"].includes(result)) {
                scrShot.paths.forEach((d, i) => data.rows[scrShot.idx[i]].screenshot_dataURI = result);
            } else {
                result.forEach((d, i) => data.rows[scrShot.idx[i]].screenshot_dataURI = d);
            }
            try {
                const pdf = new Readable({read: ()=>{}});
                pdf.push(templatepdf(data));
                pdf.push(null);
                wkhtmltopdf(pdf).pipe(res);
            } catch (exception) {
                const emsg = exception.message;
                const flag = "fail";
                if ((exception instanceof RangeError) && emsg === "Invalid string length") {
                    emsg = "Report Size too large";
                    flag = "limitExceeded";
                }
                logger.error("Exception occurred in renderReport_ICE when trying to render report: %s", emsg);
                return res.send(flag);
            }
        }
        //HTML Reports
        else {
            const htmlReport = templateweb(data);
            return res.send(htmlReport);
        }
    } catch (exception) {
        logger.error("Exception occurred in renderReport_ICE when trying to render report: %s", exception);
        res.send("fail");
    }
};

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
    return { report, scrShots };
};

exports.viewReport = async (req, res, next) => {
    const fnName = "viewReport";
    logger.info("Inside UI function: " + fnName);
    const username = req.session.username;
    const userInfo = {username};
    const url = req.url.split('/');
    let reportName = url[1] || "";
    if (reportName.split('.').length == 1) reportName += ".html";
    const reportId = reportName.split('.')[0];
    const typeWithQuery = (reportName.split('.')[1] || 'html').toLowerCase().split('?')
    const type = typeWithQuery[0];
    const embedImages = typeWithQuery[1] == 'images=true';
    let report = { overallstatus: [{}], rows: [], remarksLength: 0, commentsLength: 0 };
    logger.info("Requesting report type - " + type);
    if (url.length > 2) {
        return res.redirect('/404');
    } else if (!req._passport.instance.verifySession(req) && type == 'html') {
        report.error = {
            ecode: "INVALID_SESSION",
            emsg: "Authentication Failed! No Active Sessions found. Please login and try again.",
            status: 401
        }
    } else if (!['html', 'pdf', 'json'].includes(type)) {
        report.error = {
            ecode: "BAD_REQUEST",
            emsg: "Requested Report Type is not Available",
            status: 400
        }
    } else {
        const inputs = { reportid: reportId };
        const reportData = await utils.fetchData(inputs, "reports/getReport", fnName);
        if (reportData == "fail") {
            report.error = {
                ecode: "SERVER_ERROR",
                emsg: "Error while loading Report due to an internal error. Try again later!",
                status: 500
            }
        } else if (reportData.length == 0) {
            report.error = {
                ecode: "NOT_FOUND",
                emsg: "Requested Report is not Available!",
                status: 404
            }
        } else {
            reportData.reportId = reportId;
            const newData = prepareReportData(reportData, embedImages);
            var scrShots = newData.scrShots;
            report = newData.report;
        }
    }

    if (type == "html") {
        report.remarksLength = report.remarksLength.length;
        report.commentsLength = report.commentsLength.length;
        const content = templateweb(report);
        return res.send(content);
    } else if (type == "json") {
        const statusCode = report.error && report.error.status || 200;
        res.setHeader("Content-Type", "application/json");
        return res.status(statusCode).send(JSON.stringify(report, null, 2));
    } else if (type == "pdf") {
        if (report.error) {
            res.setHeader("X-Render-Error", report.error.emsg);
            return res.status(report.error.status || 200).send(report.error);
        }
        res.setHeader("Content-Type", "application/pdf");
        report.remarksLength = report.remarksLength.length;
        report.commentsLength = report.commentsLength.length;
        if (scrShots && scrShots.paths.length > 0) {
            const dataURIs = await openScreenShot(userInfo.username, scrShots.paths);
            if (["fail", "unavailableLocalServer", "scheduleModeOn"].includes(dataURIs)) {
                scrShots.paths.forEach((d, i) => report.rows[scrShots.idx[i]].screenshot_dataURI = '');
            } else {
                dataURIs.forEach((d, i) => report.rows[scrShots.idx[i]].screenshot_dataURI = d);
            }
        }
        try {
            const pdf = new Readable({read: ()=>{}});
            pdf.push(templatepdf(report));
            pdf.push(null);
            wkhtmltopdf(pdf).pipe(res);
        } catch (exception) {
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
            const statusCode = report.error && report.error.status || 200;
            return res.status(statusCode).send(report.error);
        }
    }
};

//To get all the projects and their releases & cycles
exports.getAllSuites_ICE = async (req, res) => {
    const fnName = "getAllSuites_ICE";
    logger.info("Inside UI service: " + fnName);
    try {
        var requestedaction = req.body.readme;
        if (requestedaction == 'projects' || requestedaction == 'reports') {
            const inputs = {
                "query": "projects",
                "userid": req.session.userid
            };
            const result = await utils.fetchData(inputs, "reports/getAllSuites_ICE", fnName);
            if (result == "fail") return res.send("fail");
            res.send(result);
        } else {
            logger.error("Error occurred in report/"+fnName+": Invalid input fail");
            res.send('Invalid input fail');
        }
	} catch (exception) {
		logger.error("Error occurred in report/"+fnName+":", exception);
		res.send("fail");
    }
};

//To get all the executed suites
exports.getSuiteDetailsInExecution_ICE = async (req, res) => {
    const fnName = "getSuiteDetailsInExecution_ICE";
    logger.info("Inside UI service: " + fnName);
    try {
        const inputs = { "suiteid": req.body.testsuiteid };
        const executionData = await utils.fetchData(inputs, "reports/getSuiteDetailsInExecution_ICE", fnName);
        if (executionData == "fail") return res.send("fail");
        var startTime, endTime, starttime, endtime;
        var executionDetailsJSON = [];
        for (var i = 0; i < executionData.length; i++) {
            startTime = new Date(executionData[i].starttime);
            starttime = startTime.getUTCDate() + "-" + (startTime.getUTCMonth() + 1) + "-" + startTime.getUTCFullYear() + " " + startTime.getUTCHours() + ":" + startTime.getUTCMinutes();
            if (executionData[i].endtime === null) endtime = '-';
            else {
                endTime = new Date(executionData[i].endtime);
                endtime = endTime.getUTCDate() + "-" + (endTime.getUTCMonth() + 1) + "-" + endTime.getUTCFullYear() + " " + (endTime.getUTCHours()) + ":" + (+endTime.getUTCMinutes());
            }
            executionDetailsJSON.push({
                execution_id: executionData[i]._id,
                start_time: starttime,
                end_time: endtime
            });
        }
        logger.info("Sending execution details from reports/"+fnName);
        res.send(JSON.stringify(executionDetailsJSON));
	} catch (exception) {
		logger.error("Error occurred in report/"+fnName+":", exception);
		res.send("fail");
    }
};

//To get status scenarios of executed modules
exports.reportStatusScenarios_ICE = async (req, res) => {
    const fnName = "reportStatusScenarios_ICE";
    logger.info("Inside UI service: " + fnName);
    try {
        var executionid = req.body.executionId;
        var report = [];
        let inputs = {
            "query": "executiondetails",
            "executionid": executionid,
        };
        const result = await utils.fetchData(inputs, "reports/reportStatusScenarios_ICE", fnName);
        if (result == "fail") return res.send("fail");
        for (let entry of result) {
            let executedtimeTemp = new Date(entry.executedtime);
            if (executedtimeTemp !== null && executedtimeTemp != "Invalid Date") {
                executedtimeTemp = (executedtimeTemp.getUTCFullYear()) + "-" + ("0" + (executedtimeTemp.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + executedtimeTemp.getUTCDate()).slice(-2) + " " + ("0" + executedtimeTemp.getUTCHours()).slice(-2) + ":" + ("0" + executedtimeTemp.getUTCMinutes()).slice(-2) + ":" + ("0" + executedtimeTemp.getUTCSeconds()).slice(-2);
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

//To render reports
exports.getReport = async (req, res) => {
    const fnName = "getReport";
    logger.info("Inside UI service: " + fnName);
    try {
        const reportid = req.body.reportId;
        const result = await utils.fetchData({ reportid }, "reports/getReport", fnName);
        if (result == "fail") return res.send("fail");
        else res.send(result);
    } catch (exception) {
        logger.error("Error occurred in "+fnName+". Error: " + exception.message);
        res.status(500).send("fail");
    }
};

//Connect to Jira
exports.connectJira_ICE = function(req, res) {
    logger.info("Inside UI service: connectJira_ICE");
    try {
        var username=req.session.username;
        var icename = undefined
        if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
        redisServer.redisSubServer.subscribe('ICE2_' + icename);
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
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for jira_login to cachedb");
                            var dataToIce = {
                                "emitAction": "jiralogin",
                                "username": icename,
                                "action": req.body.action,
                                "inputs": inputs
                            };
                            redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
                            var count = 0;

                            function jira_login_1_listener(channel, message) {
                                var data = JSON.parse(message);
                                if (icename == data.username && ["unavailableLocalServer", "auto_populate"].includes(data.onAction)) {
                                    redisServer.redisSubServer.removeListener("message", jira_login_1_listener);
                                    if (data.onAction == "unavailableLocalServer") {
                                        logger.error("Error occurred in connectJira_ICE - loginToJira: Socket Disconnected");
                                        if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
                                            var soc = myserver.socketMapNotify[username];
                                            soc.emit("ICEnotAvailable");
                                        }
                                    } else if (data.onAction == "auto_populate") {
                                        var resultData = data.value;
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
                                }
                            }
                            redisServer.redisSubServer.on("message", jira_login_1_listener);
                        } else {
                            utils.getChannelNum('ICE1_scheduling_' + icename, function(found) {
                                var flag = "";
                                if (found) flag = "scheduleModeOn";
                                else {
                                    flag = "unavailableLocalServer";
                                    logger.error("Error occurred in the service connectJira_ICE - loginToJira: Socket not Available");
                                }
                                res.send(flag);
                            });
                        }
                    });
                } catch (exception) {
                    logger.error("Exception in the service connectJira_ICE - loginToJira: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectJira_ICE - loginToJira: Invalid inputs");
                res.send("Fail");
            }
        } else if (req.body.action == 'createIssueInJira') { //Create issues in the Jira
            var createObj = req.body.issue_dict;
            if (!validateData(createObj.project, "empty") && !validateData(createObj.issuetype, "empty") && !validateData(createObj.summary, "empty") && !validateData(createObj.priority, "empty")) {
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for jira_login to cachedb");
                            dataToIce = {
                                "emitAction": "jiralogin",
                                "username": icename,
                                "action": req.body.action,
                                "inputs": createObj
                            };
                            redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
                            var count = 0;

                            function jira_login_2_listener(channel, message) {
                                var data = JSON.parse(message);
                                if (icename == data.username && ["unavailableLocalServer", "issue_id"].includes(data.onAction)) {
                                    redisServer.redisSubServer.removeListener("message", jira_login_2_listener);
                                    if (data.onAction == "unavailableLocalServer") {
                                        logger.error("Error occurred in connectJira_ICE - createIssueInJira: Socket Disconnected");
                                        if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
                                            var soc = myserver.socketMapNotify[username];
                                            soc.emit("ICEnotAvailable");
                                        }
                                    } else if (data.onAction == "issue_id") {
                                        var resultData = data.value;
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
                                }
                            }
                            redisServer.redisSubServer.on("message", jira_login_2_listener);
                        } else {
                            utils.getChannelNum('ICE1_scheduling_' + icename, function(found) {
                                var flag = "";
                                if (found) flag = "scheduleModeOn";
                                else {
                                    flag = "unavailableLocalServer";
                                    logger.error("Error occurred in the service connectJira_ICE - createIssueInJira: Socket not Available");
                                }
                                res.send(flag);
                            });
                        }
                    });
                } catch (exception) {
                    logger.error("Exception in the service connectJira_ICE - createIssueInJira: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectJira_ICE - createIssueInJira: Invalid inputs");
                res.send("Fail");
            }
        }
    } catch (exception) {
        logger.error("Exception in the service connectJira_ICE: %s", exception);
        res.send("Fail");
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

//Fetch all modules on change of projects,release & cycle
exports.getReportsData_ICE = async (req, res) => {
    const fnName = "getReportsData_ICE";
    try {
        if (req.body.reportsInputData.type == 'allmodules') {
            logger.info("Inside UI service: " + fnName + " - allmodules");
            const inputs = {
                "query": "getAlltestSuites",
                "id": req.body.reportsInputData.cycleId
            };
            const result1 = await utils.fetchData(inputs, "reports/getAllSuites_ICE", fnName)
            if (result1 == "fail") return res.send("fail");
            return res.send({ rows: result1 });
        }
    } catch (exception) {
        logger.error("Error occurred in "+fnName+". Error: " + exception.message);
        res.status(500).send("fail");
    }
};


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
            const report = prepareReportData(reportInfo).report;
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

exports.downloadVideo = async (req, res) => {
    const fnName = "downloadVideo";
    const osPf = os.platform();
    const videoPathLinux = options.screenShotPath.linux;
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