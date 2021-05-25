const logger = require('../../logger');
const utils = require('../lib/utils');

exports.getGraphData = async (req, res) => {
	const fnName = "getGraphData";
	logger.info("Inside UI service: " + fnName);
	try {
        const inputs = {
            "user_id": req.session.userid
        }
        const results = await utils.fetchData(inputs, "neurongraphs/getData", fnName, true);
        const result = results[0];
        const response = results[1];
		if (result == "fail") return res.status(response.statusCode).send("Error while generating Graph!");
        if (result.nodes.length == 0) return res.status(response.statusCode).send({
            "err": true,
            "ecode": "DB_NOT_FOUND",
            "msg": "Neuron Graphs DB not found!"
        });
        else {
            const rootIndex = 0;
            const nodeTypes = {
                "DOMAINS_NG": "Domain",
                "PROJECTS_NG": "Project",
                "RELEASES_NG": "Release",
                "CYCLES_NG": "Cycle",
                "TESTSUITES_NG": "TestSuite",
                "TESTSCENARIOS_NG": "TestScenario",
                "TESTCASES_NG": "TestCase",
                "SCREENS_NG": "Screen"
            };
            pData = {
                "nodes": result.nodes,
                "links": result.links,
                "type": nodeTypes,
                "root": rootIndex
            };
            res.status(response.statusCode).send(pData);
        }
    } catch (exception) {
		logger.error("Error occurred in neurongraphs/"+fnName+":", exception);
        res.send({
            "err": true,
            "ecode": "FAIL",
            "msg": "Internal Error!"
        });
    }
};

exports.getReportNG = async (req, res) => {
	const fnName = "getReportNG";
	logger.info("Inside UI service: " + fnName);
    try {
        var suiteID = req.body.suiteID;
        var reportInfoObj = {};
        var flag = "";
        var finalReport = [];
        const inputs = {
            "query": "getReportNG",
            "suiteId": suiteID
        };
		const reportResult = await utils.fetchData(inputs, "neurongraphs/getReportNG", fnName);
		if (reportResult == "fail") return res.send("fail");

        var pcount = 0;
        var fcount = 0;
        var jira = [];
        for (var j = 0; j < reportResult.length; j++) {
            var data = reportResult[j];
            var tempreport = data.reports;
            for (var i = 0; i < tempreport.length; i++) {
                var jiraid = tempreport[i].jiraId;
                for (var k = 0; k < jiraid.length; k++) {
                    var jid = jiraid[k].defectid;
                    jira.push(jid);
                }
            }
            if (data.status == 'pass') {
                pcount = pcount + 1;
            } else {
                fcount = fcount + 1;
            }
        }

        var recExec = reportResult.length;
        var recentExecutionStatus = reportResult[recExec - 1].status;
        var totalexecution = pcount + fcount;
        reportInfoObj.totalexecution = totalexecution;
        reportInfoObj.recentExecutionStatus = recentExecutionStatus;
        reportInfoObj.passcount = pcount;
        reportInfoObj.failcount = fcount;
        reportInfoObj.jiraid = jira;
        finalReport.push(reportInfoObj);
        logger.info("Sending reports from the service neurongraphs/"+fnName);
        res.send(finalReport);
    } catch (exception) {
		logger.error("Error occurred in neurongraphs/"+fnName+":", exception);
		res.send("fail");
    }
};

//To get all the executed suites
exports.getReportExecutionStatusNG = async (req, res) => {
	const fnName = "getReportExecutionStatusNG";
	logger.info("Inside UI service: " + fnName);
    try {
        var req_testsuiteId = req.body.suiteId;
        var startTime, endTime, starttime, endtime, exec_status, suiteID;
        var executionDetailsJSON = [];
        const inputs = {
            "suiteID": req_testsuiteId
        };
		const executionData = await utils.fetchData(inputs, "neurongraphs/getReportExecutionStatus_NG", fnName);
		if (executionData == "fail") return res.send("fail");
        for (var i = 0; i < executionData.length; i++) {
            exec_status = executionData[i].status;
            suiteID = executionData[i].parent;
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
                end_time: endtime,
                state: exec_status,
                suiteid: suiteID
            });
        }
        logger.info("Sending execution details from reports/"+fnName);
        res.send(JSON.stringify(executionDetailsJSON));
    } catch (exception) {
		logger.error("Error occurred in neurongraphs/"+fnName+":", exception);
        res.send("fail");
    }
};