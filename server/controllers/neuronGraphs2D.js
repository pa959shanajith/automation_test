var logger = require('../../logger');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.DAS_URL;
var utils = require('../lib/utils');

exports.getGraphData = function(req, res){
	logger.info("Inside UI service: getGraphData");
	try{
		if (utils.isSessionActive(req)) {
			var inputs={
				"user_id":req.session.userid
			}
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "/neurongraphs/getData", args,
				function (result, response) {
				if(response.statusCode != 200 || result.rows == "fail"){
					//console.log("Status:",status,"\nResponse: ",result);
					res.status(response.statusCode).send("Error while generating Graph!");
				}
				else{
					if(result.nodes.length==0) res.status(response.statusCode).send({"err":true,"ecode":"DB_NOT_FOUND","msg":"Neuron Graphs DB not found!"});
					else{
						var rootIndex=0;
						var nodeTypes={"DOMAINS_NG":"Domain","PROJECTS_NG":"Project","RELEASES_NG":"Release","CYCLES_NG":"Cycle","TESTSUITES_NG":"TestSuite","TESTSCENARIOS_NG":"TestScenario","TESTCASES_NG":"TestCase","SCREENS_NG":"Screen"};
						pData={"nodes":result.nodes,"links":result.links,"type":nodeTypes,"root":rootIndex};
						res.status(response.statusCode).send(pData);
					}
				}
			});
		}
		else{
			res.send({"err":true,"ecode":"INVALID_SESSION","msg":"Your session has been expired. Please login again"});
		}
	}
	catch(exception){
		logger.info("Exception in the service getGraphData: ", exception);
		res.send({"err":true,"ecode":"FAIL","msg":"Internal Error! Please contact admin"});
	}
};

exports.getReportNG = function(req, res) {
    logger.info("Inside UI service: getReportNG");
    try {
        if (utils.isSessionActive(req)) {
            var suiteID = req.body.suiteID;
            var reportInfoObj = {};
           // var reportjson = {};
            var flag = "";
            var finalReport = [];
            var inputs = {
                "query": "getReportNG",
                "suiteId": suiteID
            };
            var args = {
                data: inputs,
                headers: {
                    "Content-Type": "application/json"
                }
            };
            logger.info("Calling DAS Service from getReportNG - projectsUnderDomain: neurongraphs/getReportNG");
            client.post(epurl + "neurongraphs/getReportNG", args,
                function(reportResult, response) {
                    if (response.statusCode != 200 || reportResult.rows == "fail") {
                        flag = "fail";
                        logger.error("Error occurred in the service getReportNG - projectsUnderDomain: Failed to get report, executed time and scenarioIds from reports. Error Code : ERRDAS");
                        res.send(flag);
                    } else {
                        try{
                            //console.log(reportResult);
                            var pcount=0;
                            var fcount=0;
                            var jira=[];
                            for(var j=0;j<reportResult.rows.length;j++)
                            { 
                            var data=reportResult.rows[j];
                           // var reportvar=data.reports[i];
                            //var timeTaken=data.reports[i].overallstatus[0].EllapsedTime;
                            //reportvar.report.rows[i];
                            //console.log(data);
                            var tempreport=data.reports;
                            //var jdata=j.jiraId[i];
                               
                            for(var i=0;i<tempreport.length;i++)
                            {
                                
                             var jiraid=tempreport[i].jiraId;
                             for(var k=0;k<jiraid.length;k++){
                                var jid=jiraid[k].defectid;
                                jira.push(jid);
                             }
                             
                             //console.log(jiraid);
                            }

                            if(data.status=='pass'){
                                pcount=pcount+1;
                            }
                            else{
                                fcount=fcount+1;
                            }
                        }
                            //console.log(pcount,fcount);
                            console.log(data);
                            var recExec=reportResult.rows.length;
                            var recentExecutionStatus=reportResult.rows[recExec-1].status;
                            var totalexecution=pcount+fcount;
                            reportInfoObj.totalexecution = totalexecution;
                            reportInfoObj.recentExecutionStatus = recentExecutionStatus;
                            reportInfoObj.passcount = pcount;
                            reportInfoObj.failcount = fcount;
                            reportInfoObj.jiraid = jira;

                            //var reportdata = reportResult.row;
                            finalReport.push(reportInfoObj);
                            logger.info("Sending reports in the service getReportNG: final function");
                            res.send(finalReport);
                            }
						
						catch (exception) {
                            logger.error("Exception in the service getReportNG: %s", exception);
                            res.send("fail");
                        }            
                    }
                });
            } else {
            logger.error("Invalid Session, in the service getReportNG");
            res.send("Invalid Session");
        }
    } catch (exception) {
        logger.error("Exception in the service getReportNG - Error: %s", exception);
        res.send("fail");
    }
};
//To get all the executed suites
exports.getReportExecutionStatusNG = function(req, res) {
    logger.info("Inside UI service: getReportExecutionStatus_NG");
    try {
        if (utils.isSessionActive(req)) {
            var req_testsuiteId = req.body.suiteId;
            var startTime, endTime, starttime, endtime,State,suiteID;
            var executionDetailsJSON = [];
            var inputs = {
                "suiteID": req_testsuiteId
            };
            var args = {
                data: inputs,
                headers: {
                    "Content-Type": "application/json"
                }
            };
            logger.info("Calling DAS Service from getReportExecutionStatus_NG: reports/getReportExecutionStatus_NG");
            client.post(epurl + "neurongraphs/getReportExecutionStatus_NG", args,
                function(executionData, response) {
                    try {
                        if (response.statusCode != 200 || executionData.rows == "fail") {
                            logger.error("Error occurred in the service getReportExecutionStatus_NG: reports/getReportExecutionStatus_NG");
                            res.send("fail");
                        } else {
                            for (var i = 0; i < executionData.rows.length; i++) {
								State=executionData.rows[i].status;
								suiteID=executionData.rows[i].parent;
                                startTime = new Date(executionData.rows[i].starttime);
                                starttime = startTime.getUTCDate() + "-" + (startTime.getUTCMonth() + 1) + "-" + startTime.getUTCFullYear() + " " + startTime.getUTCHours() + ":" + startTime.getUTCMinutes();
                                if (executionData.rows[i].endtime === null) endtime = '-';
                                else {
                                    //console.log(endTime);
                                    endTime = new Date(executionData.rows[i].endtime);
                                    endtime = endTime.getUTCDate() + "-" + (endTime.getUTCMonth() + 1) + "-" + endTime.getUTCFullYear() + " " + (endTime.getUTCHours()) + ":" + (+endTime.getUTCMinutes());
                                }
                                //console.log(endtime);
                                
                                executionDetailsJSON.push({
                                    execution_id: executionData.rows[i]._id,
                                    start_time: starttime,
                                    end_time: endtime,
									state:State,
									suiteid:suiteID
                                });
                            }
                            logger.info("Sending execution details from getReportExecutionStatus_NG: reports/getReportExecutionStatus_NG");
                            res.send(JSON.stringify(executionDetailsJSON));
                        }
                    } catch (exception) {
                        logger.error("Exception in the service getReportExecutionStatus_NG: reports/getReportExecutionStatus_NG: %s", exception);
                        res.send("fail");
                    }
                });
        } else {
            logger.error("Error in the service getReportExecutionStatus_NG: Invalid Session");
            res.send("Invalid Session");
        }
    } catch (exception) {
        logger.error("Exception in the service getReportExecutionStatus_NG: %s", exception);
        res.send("fail");
    }
};