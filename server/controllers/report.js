var async = require('async');
var myserver = require('../lib/socket');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.DAS_URL;
var validator = require('validator');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');
var Handlebars = require('../lib/handlebar.js');
var wkhtmltopdf = require('wkhtmltopdf');
var fs = require('fs');
var options = require('../config/options');
const Readable = require('stream').Readable;
var path = require('path');

wkhtmltopdf.command = path.join(__dirname, '..', '..', 'assets', 'wkhtmltox', 'bin', 'wkhtmltopdf'+((process.platform == "win32")? '.exe':''));
var templatepdf = '';
var templateweb = '';
var constants = {
    'STATUS_CODES' : {
        "401": 'Authorization failed',
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
    const endTimeStamp = report.overallstatus[0].EndTime.split(".")[0];
    const endDate = endTimeStamp.split(" ")[0].split("-");
    let elapTime = (report.overallstatus[0].EllapsedTime.split(".")[0]).split(":");
    report.overallstatus[0].domainName = reportData.domainname;
    report.overallstatus[0].projectName = reportData.projectname;
    report.overallstatus[0].releaseName = reportData.releasename;
    report.overallstatus[0].cycleName = reportData.cyclename;
    report.overallstatus[0].scenarioName = reportData.testscenarioname;
    report.overallstatus[0].reportId = reportData.reportId;
    report.overallstatus[0].executionId = reportData.executionid;
    report.overallstatus[0].moduleName = reportData.testsuitename;
    report.overallstatus[0].browserVersion = report.overallstatus[0].browserVersion || '-';
    report.overallstatus[0].browserType = report.overallstatus[0].browserType || '-';
    report.overallstatus[0].StartTime = formatDate(report.overallstatus[0].StartTime.split(".")[0]) || '-';
    report.overallstatus[0].EndTime = formatDate(endTimeStamp) || '-';
    report.overallstatus[0].date = report.overallstatus[0].EndTime && report.overallstatus[0].EndTime.split(" ")[0]  || '-';
    report.overallstatus[0].time = endTimeStamp.split(" ")[1] || '-';
    report.overallstatus[0].EllapsedTime = "~" + ("0" + elapTime[0]).slice(-2) + ":" + ("0" + elapTime[1]).slice(-2) + ":" + ("0" + elapTime[2]).slice(-2)
    report.overallstatus[0].video = report.overallstatus[0].video || '-'

    report.rows.forEach((row, i) => {
        row.slno = i + 1;
        if (row["Step "]) row.Step = row["Step "];
        if (row.EllapsedTime && row.EllapsedTime.trim() != "") {
            const eT = row.EllapsedTime.split(".");
            elapTime = eT[0].split(":")
            if (!eT[1]) eT[1] = ((eT[1] || "") + "000").slice(0, 3);
            if (eT.length < 3 && eT[0].indexOf(":") === -1) { // Time is x.x not xx:xx:xx.xx
                row.EllapsedTime = "00:00:" + ("0" + elapTime[0]).slice(-2) + ":" + eT[1];
            } else {
                row.EllapsedTime = ("0" + elapTime[0]).slice(-2) + ":" + ("0" + elapTime[1]).slice(-2) + ":" + ("0" + elapTime[2]).slice(-2) + ":" + eT[1];
            }
        }
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
    const failPercent = parseFloat(100 * fail / total).toFixed(2);
    const termPercent = parseFloat(100 * terminated / total).toFixed(2);
    report.overallstatus[0].pass = passPercent > 0 ? passPercent : 0;
    report.overallstatus[0].fail = failPercent > 0 ? failPercent : 0;
    if(pass > 0 && fail > 0) report.overallstatus[0].terminate = (100 - failPercent - passPercent).toFixed(2);
    else report.overallstatus[0].terminate = termPercent > 0 ? termPercent : 0;
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
exports.getAllSuites_ICE = function(req, res) {
    logger.info("Inside UI service: getAllSuites_ICE");
    if (utils.isSessionActive(req)) {
        var requestedaction = req.body.readme;
        if (requestedaction == 'projects' || requestedaction == 'reports') {
            try {
                var userid = req.body.userId ? req.body.userId : req.session.userid;
                logger.info("Calling function getprojectdetails from getAllSuites_ICE: Projects");
                getprojectdetails(userid, function(getprojectdetailserror, getprojectdetailsresponse) {
                    try {
                        if (getprojectdetailserror) {
                            logger.error("Error occurred in the function getprojectdetails: getAllSuites_ICE: Projects");
                            res.send("fail");
                        } else {
                            logger.info("Sending project details from getprojectdetails function of getAllSuites_ICE:Projects");
                            res.send(getprojectdetailsresponse);
                        }
                    } catch (exception) {
                        logger.error("Exception in the function getprojectdetails: getAllSuites_ICE: Projects: %s", exception);
                        res.send("fail");
                    }
                });
            } catch (exception) {
                logger.error("Exception in the service getAllSuites_ICE: Projects: %s", exception);
                res.send("fail");
            }
         }
        else {
            logger.error("Invalid input fail");
            res.send('Invalid input fail');
        }
    } else {
        logger.error("Invalid Session");
        res.send("Invalid Session");
    }

    function getprojectdetails(userid, getprojectdetailscallback) {
        logger.info("Inside UI function: getprojectdetails");
        try {
            var inputs = {
                "query": "projects",
                "userid": userid
            };
            var args = {
                data: inputs,
                headers: {
                    "Content-Type": "application/json"
                }
            };
            logger.info("Calling DAS Service from getprojectdetails: reports/getAllSuites_ICE");
            client.post(epurl + "reports/getAllSuites_ICE", args,
                function(projectdetails, response) {
                    if (response.statusCode != 200 || projectdetails.rows == "fail") {
                        logger.error("Error occurred in reports/getAllSuites_ICE from getprojectdetails Error Code : ERRDAS");
                        getprojectdetailscallback("fail", null);
                    } else {                       
                        try {
                            var reports = projectdetails.rows
                        } catch (exception) {
                            logger.error("Exception in the function getprojectdetails: %s", exception);
                        }
                        logger.info("Sending project details from getAllSuites_ICE: projects");
                        getprojectdetailscallback(null, reports);
                    }
                });
            } catch (exception) {
                logger.error("Exception in the function getprojectdetails: %s", exception);
            }
        }
};

//To get all the executed suites
exports.getSuiteDetailsInExecution_ICE = function(req, res) {
    logger.info("Inside UI service: getSuiteDetailsInExecution_ICE");
    try {
        if (utils.isSessionActive(req)) {
            var req_testsuiteId = req.body.testsuiteid;
            var startTime, endTime, starttime, endtime;
            var executionDetailsJSON = [];
            var inputs = {
                "suiteid": req_testsuiteId
            };
            var args = {
                data: inputs,
                headers: {
                    "Content-Type": "application/json"
                }
            };
            logger.info("Calling DAS Service from getSuiteDetailsInExecution_ICE: reports/getSuiteDetailsInExecution_ICE");
            client.post(epurl + "reports/getSuiteDetailsInExecution_ICE", args,
                function(executionData, response) {
                    try {
                        if (response.statusCode != 200 || executionData.rows == "fail") {
                            logger.error("Error occurred in the service getSuiteDetailsInExecution_ICE: reports/getSuiteDetailsInExecution_ICE");
                            res.send("fail");
                        } else {
                            for (var i = 0; i < executionData.rows.length; i++) {
                                startTime = new Date(executionData.rows[i].starttime);
                                starttime = startTime.getUTCDate() + "-" + (startTime.getUTCMonth() + 1) + "-" + startTime.getUTCFullYear() + " " + startTime.getUTCHours() + ":" + startTime.getUTCMinutes();
                                if (executionData.rows[i].endtime === null) endtime = '-';
                                else {
                                    endTime = new Date(executionData.rows[i].endtime);
                                    endtime = endTime.getUTCDate() + "-" + (endTime.getUTCMonth() + 1) + "-" + endTime.getUTCFullYear() + " " + (endTime.getUTCHours()) + ":" + (+endTime.getUTCMinutes());
                                }
                                executionDetailsJSON.push({
                                    execution_id: executionData.rows[i]._id,
                                    start_time: starttime,
                                    end_time: endtime
                                });
                            }
                            logger.info("Sending execution details from getSuiteDetailsInExecution_ICE: reports/getSuiteDetailsInExecution_ICE");
                            res.send(JSON.stringify(executionDetailsJSON));
                        }
                    } catch (exception) {
                        logger.error("Exception in the service getSuiteDetailsInExecution_ICE: reports/getSuiteDetailsInExecution_ICE: %s", exception);
                        res.send("fail");
                    }
                });
        } else {
            logger.error("Error in the service getSuiteDetailsInExecution_ICE: Invalid Session");
            res.send("Invalid Session");
        }
    } catch (exception) {
        logger.error("Exception in the service getSuiteDetailsInExecution_ICE: %s", exception);
        res.send("fail");
    }
};

//To get status scenarios of executed modules
exports.reportStatusScenarios_ICE = function(req, res) {
    logger.info("Inside UI service: reportStatusScenarios_ICE");
    try {
        if (utils.isSessionActive(req)) {
            var req_executionId = req.body.executionId;
            var report = [];
            async.series({
                    executiondetails: function(callback) {
                        var inputs = {
                            "query": "executiondetails",
                            "executionid": req_executionId,
                        };
                        var args = {
                            data: inputs,
                            headers: {
                                "Content-Type": "application/json"
                            }
                        };
                        logger.info("Calling DAS Service from reportStatusScenarios_ICE - executiondetails: reports/reportStatusScenarios_ICE");
                        client.post(epurl + "reports/reportStatusScenarios_ICE", args,
                            function(result, response) {
                                if (response.statusCode != 200 || result.rows == "fail") {
                                    logger.error("Error occurred in the service reportStatusScenarios_ICE - executiondetails: reports/reportStatusScenarios_ICE");
                                    var flag = "fail";
                                    res.send(flag);
                                } else {
                                    async.forEachSeries(result.rows, function(iterator, callback2) {
                                        try {
                                            var executedtimeTemp = new Date(iterator.executedtime);
                                            if (executedtimeTemp != null) {
                                                executedtimeTemp = executedtimeTemp.getUTCDate() + "-" + (executedtimeTemp.getUTCMonth() + 1) + "-" + executedtimeTemp.getUTCFullYear() + " " + (executedtimeTemp.getUTCHours()) + ":" + (executedtimeTemp.getUTCMinutes()) + ":" + executedtimeTemp.getSeconds();
                                            }
                                            var browserTemp = iterator.executedon;
                                            var statusTemp = iterator.status;
                                            var reportidTemp = iterator._id;
                                            var testscenarioidTemp = iterator.testscenarioid;
                                            var inputs = {
                                                "query": "scenarioname",
                                                "scenarioid": iterator.testscenarioid
                                            };
                                            var args = {
                                                data: inputs,
                                                headers: {
                                                    "Content-Type": "application/json"
                                                }
                                            };
                                            logger.info("Calling DAS Service from reportStatusScenarios_ICE - scenarioname: reports/reportStatusScenarios_ICE");
                                            client.post(epurl + "reports/reportStatusScenarios_ICE", args,
                                                function(scenarioNameDetails, response) {
                                                    if (response.statusCode != 200 || scenarioNameDetails.rows == "fail") {
                                                        logger.error("Error occurred in the service reportStatusScenarios_ICE - scenarioname: reports/reportStatusScenarios_ICE");
                                                        var flag = "fail";
                                                        res.send(flag);
                                                    } else {
                                                        async.forEachSeries(scenarioNameDetails.rows, function(testScenarioNameitr, callback3) {
                                                            try {
                                                                report.push({
                                                                    executedtime: executedtimeTemp,
                                                                    browser: browserTemp,
                                                                    status: statusTemp,
                                                                    reportid: reportidTemp,
                                                                    testscenarioid: testscenarioidTemp,
                                                                    testscenarioname: testScenarioNameitr.name
                                                                });
                                                                callback3();
                                                            } catch (exception) {
                                                                logger.error("Exception in the service reportStatusScenarios_ICE - scenarioname: reports/reportStatusScenarios_ICE: %s", exception);
                                                                res.send("fail");
                                                            }
                                                        }, callback2);
                                                    }
                                                });
                                        } catch (exception) {
                                            logger.error("Exception in the service reportStatusScenarios_ICE - executiondetails: reports/reportStatusScenarios_ICE: %s", exception);
                                            res.send("fail");
                                        }
                                    }, callback);
                                }
                            });
                    }
                },
                function(err, results) {
                    if (err) {
                        logger.error("Error occurred in the service reportStatusScenarios_ICE: final function: %s", err);
                        res.send("fail");
                    } else {
                        if (report.length > 0) {
                            for (var i = 0; i < report.length; i++) {
                                if (report[i].executedtime != "") {
                                    var dateString = report[i].executedtime,
                                        dateTimeParts = dateString.split(' '),
                                        timeParts = dateTimeParts[1].split(':'),
                                        dateParts = dateTimeParts[0].split('-'),
                                        date;
                                    date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]);
                                    report[i].executedtime = date.getTime();
                                }
                            }
                            report.sort(function(a, b) {
                                return a.executedtime - b.executedtime;
                            });
                            for (var k = 0; k < report.length; k++) {
                                if (report[k].executedtime != "") {
                                    report[k].executedtime = new Date(report[k].executedtime);
                                    report[k].executedtime = ("0" + report[k].executedtime.getDate()).slice(-2) + "-" + ("0" + (report[k].executedtime.getMonth() + 1)).slice(-2) + "-" + (report[k].executedtime.getFullYear()) + " " + ("0" + report[k].executedtime.getHours()).slice(-2) + ":" + ("0" + report[k].executedtime.getMinutes()).slice(-2) + ":" + ("0" + report[k].executedtime.getSeconds()).slice(-2);
                                }
                            }
                        }
                        logger.info("Sending scenario status details from reportStatusScenarios_ICE");
                        res.send(JSON.stringify(report));
                    }
                });
        } else {
            logger.error("Invalid Session: reportStatusScenarios_ICE");
            res.send("Invalid Session");
        }
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
        if (utils.isSessionActive(req)) {
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
                                                    var updateStatus = updateDbReportData(createObj.reportId, createObj.slno, resultData);
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
        } else {
            logger.error("Error occurred in the service connectJira_ICE - createIssueInJira: Invalid Session");
            res.send("Invalid Session");
        }
    } catch (exception) {
        logger.error("Exception in the service connectJira_ICE: %s", exception);
        res.send("Fail");
    }
};

function updateDbReportData(reportId, slno, defectId) {
    var inputs = {
        "reportid": reportId,
        "slno": slno,
        "defectid": defectId
    };
    var args = {
        data: inputs,
        headers: {
            "Content-Type": "application/json"
        }
    };
    logger.info("Calling DAS Service from connectJira_ICE for updateDbReportData: reports/updateReportData");
    client.post(epurl + "reports/updateReportData", args,
        function(reportdata, response) {
            if (response.statusCode != 200 || reportdata.rows == "fail") {
                logger.error("Error occurred in reports/updateReportData from updateDbReportData Error Code : ERRDAS");
                return false;
            } else {
                return true;
            }
        });
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

const getUserInfoFromHeaders = (headers) => {
	if (headers['x-token-hash'] && headers['x-token-name'] && (headers['x-ice-name'] != null || headers['x-pool-name'] != null)) {
		return { 'tokenhash': headers['x-token-hash'], "tokenname": headers['x-token-name'], 'icename': headers['x-ice-name'], 'poolname': headers['x-pool-name'] }
	}
	return false;
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
        let headerUserInfo = getUserInfoFromHeaders(req.headers)
        if (!headerUserInfo){
            res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['400'])
            return res.status('400').send({'error':"Invalid or missing user info in request headers."})
        }
		const userInfo = await utils.tokenValidation(headerUserInfo);
		const execResponse = userInfo.inputs;
        if (execResponse.tokenValidation !== "passed") {
            finalReport.push(execResponse);
            res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['401'])
            return res.status('401').send(finalReport);
        }

        delete execResponse.error_message;
        const inputs = { executionId, scenarioIds };
        const data = await utils.fetchData(inputs, "reports/getReport_API", fnName, true);
        let reportResult = data[0];
        if (reportResult == "fail") {
            if(reportResult[2] && reportResult[2].errMsg !== "") execResponse.error_message=reportResult.errMsg;
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
            report.overallstatus[0].reportId = reportInfo.reportid;
            delete report.overallstatus[0].scenarioName;
            delete report.overallstatus[0].executionId;
            delete report.overallstatus[0].moduleName;
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
        const headerUserInfo = getUserInfoFromHeaders(req.headers);
        if (!headerUserInfo){
            res.setHeader(constants.X_EXECUTION_MESSAGE, constants.STATUS_CODES['400'])
            return res.status('400').send({'error':"Invalid or missing user info in request headers."})
        }
		const userInfo = await utils.tokenValidation(headerUserInfo);
        var execResponse = userInfo.inputs;
        var finalReport=[];
        if (execResponse.tokenValidation == "passed"){
            delete execResponse.error_message;
            var metrics_data=req.body.metrics_data;
            metrics_data.api=true;
            var reportResult = await fetch_metrics(metrics_data);
            logger.info("Calling DAS Service from getExecution_metrics_API: reports/getExecution_metrics_API");
            if(reportResult[0].errMsg != ""){
                execResponse.error_message=reportResult[0].errMsg;
                statusCode = "400";
            }
            finalReport.push(reportResult[0]);
            if (statusCode != "400") statusCode = "200";
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
                return res.send('fail');
            } else if(reportResult[0].rows.length==0) {
                return res.send('NoRecords');
            } else {
                var data=reportResult[0].rows;
                var dir = './../../excel';
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
    logger.info("Inside UI service: " + fnName);
    try {
        const videoPath = req.body.videoPath;
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