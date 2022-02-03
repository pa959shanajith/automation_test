var myserver = require('../lib/socket');
var validator = require('validator');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');
var fs = require('fs');
var options = require('../config/options');
var path = require('path');
const tokenAuth = require('../lib/tokenAuth')

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
            if (!validateData(createObj.project, "empty") && !validateData(createObj.issuetype, "empty") && !validateData(createObj.summary, "empty")  && !validateData(createObj.description, "empty") && !validateData(createObj.priority, "empty")) {
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
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for jira_login to cachedb");
                            dataToIce = {
                                "emitAction": "jiralogin",
                                "username": icename,
                                "action": req.body.action,
                                "inputs": inputs
                            };
                            redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));

                            function jira_login_3_listener(channel, message) {
                                var data1 = JSON.parse(message);
                                if (icename == data1.username && ["unavailableLocalServer", "configure_field"].includes(data1.onAction)) {
                                    redisServer.redisSubServer.removeListener("message", jira_login_3_listener);
                                    if (data1.onAction == "unavailableLocalServer") {
                                        logger.error("Error occurred in connectJira_ICE - getJiraConfigureFields: Socket Disconnected");
                                        if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
                                            var soc = myserver.socketMapNotify[username];
                                            soc.emit("ICEnotAvailable");
                                        }
                                    } else if (data1.onAction == "configure_field") {
                                        var resultData = data1.value;
                                        if (resultData != "Fail") {
                                            logger.info('Jira: configure field fetched successfully.');
                                        } else {
                                            logger.error('Jira: Failed fetch congigure fields.');
                                        }
                                        res.send(resultData);
                                    }
                                }
                            }
                            redisServer.redisSubServer.on("message", jira_login_3_listener);
                        } else {
                            utils.getChannelNum('ICE1_scheduling_' + icename, function(found) {
                                var flag = "";
                                if (found) flag = "scheduleModeOn";
                                else {
                                    flag = "unavailableLocalServer";
                                    logger.error("Error occurred in the service connectJira_ICE - getJiraConfigureFields: Socket not Available");
                                }
                                res.send(flag);
                            });
                        }
                    });
                } catch (exception) {
                    logger.error("Exception in the service connectJira_ICE - getJiraConfigureFields: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectJira_ICE - getJiraConfigureFields: Invalid inputs");
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