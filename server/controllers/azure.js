var myserver = require('../lib/socket');
var validator = require('validator');
var logger = require('../../logger');
var async = require('async');
var Client = require("node-rest-client").Client;
var epurl = process.env.DAS_URL;
var client = new Client();
var utils = require('../lib/utils');
var fs = require('fs');
var options = require('../config/options');
var path = require('path');
const tokenAuth = require('../lib/tokenAuth')
const constants = require('../lib/execution/executionConstants');

let headers

exports.connectAzure_ICE = function(req, res) {
    try {
        logger.info("Inside UI service: connectAzure_ICE");
        var mySocket;
		var clientName=utils.getClientName(req.headers.host);
        var username=req.session.username;
        var icename = undefined
        if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
        mySocket = myserver.allSocketsMap[clientName][icename];	
        if (req.body.action == 'loginToAzure') { //Login to Azure for creating issues
            var azureurl = req.body.url;
            var azureusername = req.body.username;
            var azurepat = req.body.pat;
            if (!validateData(azureurl, "empty") && !validateData(azureusername, "empty") && !validateData(azurepat, "empty")) {
                var inputs = {
                    "azureBaseUrl": azureurl,
                    "azure_uname": azureusername,
                    "azurepat": azurepat
                };
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                    if(mySocket != undefined) {	
                            logger.info("Sending socket request for azure_login to cachedb");
                            mySocket.emit("azurelogin", req.body.action, inputs);
                            var count = 0;

                            function azure_login_1_listener(message) {
                                var data = message;
                                    mySocket.removeListener("auto_populate", azure_login_1_listener);
                                    
                                    var resultData = data;
                                    if (count == 0) {
                                        if (resultData != "Fail" && resultData != "Invalid Url" && resultData != "Invalid Credentials") {
                                            logger.info('Azure: Login successfully.');
                                        } else {
                                            logger.error('Azure: Login Failed.');
                                        }
                                        res.send(resultData);
                                        count++;
                                    }
                                   
                            }
                            mySocket.on("auto_populate", azure_login_1_listener);
                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectAzure_ICE - loginToAzure: Socket not Available");
                                res.send(flag);
                        }
                } catch (exception) {
                    logger.error("Exception in the service connectAzure_ICE - loginToAzure: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectAzure_ICE - loginToAzure: Invalid inputs");
                res.send("Fail");
            }
        } else if (req.body.action == 'createIssueInAzure') { //Create issues in the Azure
            var createObj = req.body.issue_dict;

            if (!validateData(createObj.info.project.text, "empty") && !validateData(createObj.info.issue.text, "empty") && !validateData(createObj.info.summary.value, "empty")  && !validateData(createObj.info.reproSteps.value, "empty")) {
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                    if(mySocket != undefined) {
                            logger.info("Sending socket request for azure_login to cachedb");
                            mySocket.emit("azurelogin", req.body.action, createObj);
                            var count = 0;

                            function azure_login_2_listener(message) {
                                var data = message;
                                    mySocket.removeListener("auto_populate", azure_login_2_listener);
                                    mySocket.removeListener("issue_id", azure_login_2_listener);
                                    var resultData = data;
                                    if (count == 0) {
                                        if (resultData != "Fail") {
                                            updateDbReportData(createObj.reportId, createObj.slno, resultData);
                                            logger.info('Azure: Bug created successfully.');
                                        } else {
                                            logger.error('Azure: Failed to create Bug.');
                                        }
                                        res.send(resultData);
                                        count++;
                                    }
                                    
                                
                            }
                            mySocket.on("auto_populate", azure_login_2_listener);
                            mySocket.on("issue_id", azure_login_2_listener);
                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectAzure_ICE - createIssueInAzure: Socket not Available");
                                res.send(flag);
                        }
                    
                } catch (exception) {
                    logger.error("Exception in the service connectAzure_ICE - createIssueInAzure: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectAzure_ICE - createIssueInAzure: Invalid inputs");
                // res.send("Fail");
            }  
        } else if (req.body.action == 'getAzureConfigureFields') { //gets azure configure fields for given project and issue type
            var createObj = req.body.azure_input_dict;
            var project = '';
            if(req.body.projects && req.body.projects.length){
                project = req.body.projects.filter((el) => el.key === req.body.project)[0]['text'];
            }
            var issuetype = req.body.issuetype;
            var url =req.body.url;
            var username= req.body.username;
            var pat= req.body.pat;
            var projects=req.body.projects;
            if (!validateData(project, "empty") && !validateData(issuetype, "empty")){
                var inputs = {
                    "project": project,
                    "issuetype": issuetype,
                    "azureBaseUrl": url,
                    "username": username,
                    "azurepat": pat,
                    "projects_data":projects
                };
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                    if(mySocket != undefined) {
                            logger.info("Sending socket request for azure_login to cachedb");
                            mySocket.emit("azurelogin", req.body.action, inputs);

                            function azure_login_3_listener(message) {
                                var data1 = message;
                                    mySocket.removeListener("configure_field", azure_login_3_listener);
                                   
                                    var resultData = data1;
                                    if(Object.keys(resultData).length && resultData.hasOwnProperty('Error')){
                                        logger.info('Azure: '+resultData.Error.msg);
                                        res.status(resultData.Error.status).send(resultData.Error.msg);
                                        return;
                                    }
                                    if (resultData != "Fail") {
                                        logger.info('Azure: configure field fetched successfully.');
                                    } else {
                                        logger.error('Azure: Failed fetch congigure fields.');
                                    }
                                    res.send(resultData);
                                    
                                
                            }
                            mySocket.on("configure_field", azure_login_3_listener);
                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectAzure_ICE - getAzureConfigureFields: Socket not Available");
                                res.send(flag);
                        }
                    
                } catch (exception) {
                    logger.error("Exception in the service connectAzure_ICE - getAzureConfigureFields: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectAzure_ICE - getAzureConfigureFields: Invalid inputs");
                res.send("Fail");
            }
        }
        else if (req.body.action == 'azureLogin' ) { //Login to azure for mapping scenarios
            var azureurl = req.body.url;
            var azureusername = req.body.username;
            var azurepat = req.body.pat;
            if (!validateData(azureurl, "empty") && !validateData(azureusername, "empty") && !validateData(azurepat, "empty")) {
                var inputs = {
                    "azureBaseUrl": azureurl,
                    "azure_uname": azureusername,
                    "azurepat": azurepat
                };
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                        if(mySocket != undefined) {
                            logger.info("Sending socket request for azure_login to cachedb");
                            mySocket.emit("azurelogin", req.body.action, inputs);
                            var count = 0;

                            function azure_login_4_listener(message) {
                                var data = message;
                                    mySocket.removeListener("Azure_details", azure_login_4_listener);
                                    
                                    var resultData = data;
                                    if (count == 0) {
                                        if (resultData != "Fail" && resultData != "Invalid Url" && resultData != "Invalid Credentials") {
                                            logger.info('Azure: Login successfully.');
                                        } else {
                                            logger.error('Azure: Login Failed.');
                                        }
                                        res.send(resultData);
                                        count++;
                                    }
                                
                            }
                            mySocket.on("Azure_details", azure_login_4_listener);
                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectAzure_ICE - loginToAzure: Socket not Available");
                                res.send(flag);
                        }
                } catch (exception) {
                    logger.error("Exception in the service connectAzure_ICE - loginToAzure: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectAzure_ICE - loginToAzure: Invalid inputs");
                res.send("Fail");
        }}
        else if(req.body.action == 'azureUserStories' ) {
            var azureurl = req.body.baseurl;
            var azureusername = req.body.username;
            var azurepat = req.body.pat;
            var azureprojectdetails = req.body.projectdetails
            if (!validateData(azureurl, "empty") && !validateData(azureusername, "empty") && !validateData(azurepat, "empty")) {
                var inputs = {
                    "azureBaseUrl": azureurl,
                    "azure_uname": azureusername,
                    "azurepat": azurepat,
                    "projectDetails":azureprojectdetails,
                    "skip": req.body.skip || 0
                };
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                        if(mySocket != undefined) {
                            logger.info("Sending socket request for azure_user_stories to cachedb");
                            mySocket.emit("azurelogin", req.body.action, inputs);
                            var count = 0;
                            mySocket.on("Azure_details", (message) =>{
                                var data = message;
                                var resultData = data;
                                        if (count == 0) {
                                            if (resultData != "Fail" && resultData != "Invalid Url" && resultData != "Invalid Credentials") {
                                                logger.info('Azure: Login successfully.');
                                            } else {
                                                logger.error('Azure: Login Failed.');
                                            }
                                            res.send(resultData);
                                            count++;
                                        }
                            });
                            mySocket.on("auto_populate", (message) =>{
                                var data = message;
                                var resultData = data;
                                        logger.error("Error occurred while fetching data from azure devOps : "+resultData);
                                        res.status(429).send(resultData);
                            });

                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectAzure_ICE - loginToAzure: Socket not Available");
                                res.send(flag);
                        }
                } catch (exception) {
                    logger.error("Exception in the service connectAzure_ICE - loginToAzure: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectAzure_ICE - loginToAzure: Invalid inputs");
                res.send("Fail");
            }
        }
        else if(req.body.action == 'azureTestPlans') {
            var azureurl = req.body.baseurl;
            var azureusername = req.body.username;
            var azurepat = req.body.pat;
            var azureprojectdetails = req.body.projectdetails
            if (!validateData(azureurl, "empty") && !validateData(azureusername, "empty") && !validateData(azurepat, "empty")) {
                var inputs = {
                    "azureBaseUrl": azureurl,
                    "azure_uname": azureusername,
                    "azurepat": azurepat,
                    "projectDetails":azureprojectdetails
                };
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                        if(mySocket != undefined) {
                            logger.info("Sending socket request for azure_user_stories to cachedb");
                            mySocket.emit("azurelogin", req.body.action, inputs);
                            var count = 0;

                            function azure_login_6_listener(message) {
                                var data = message;
                                    mySocket.removeListener("Azure_details", azure_login_6_listener);
                                    
                                        var resultData = data;
                                        if (count == 0) {
                                            if (resultData != "Fail" && resultData != "Invalid Url" && resultData != "Invalid Credentials") {
                                                logger.info('Azure: Login successfully.');
                                            } else {
                                                logger.error('Azure: Login Failed.');
                                            }
                                            res.send(resultData);
                                            count++;
                                        }
                            }
                            mySocket.on("Azure_details", azure_login_6_listener);
                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectAzure_ICE - loginToAzure: Socket not Available");
                                res.send(flag);
                        }
                } catch (exception) {
                    logger.error("Exception in the service connectAzure_ICE - loginToAzure: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectAzure_ICE - loginToAzure: Invalid inputs");
                res.send("Fail");
            }
        }
        else if(req.body.action == 'azureTestSuites') {
            var azureurl = req.body.baseurl;
            var azureusername = req.body.username;
            var azurepat = req.body.pat;
            var azuretestplandetails = req.body.testplandetails
            var azureprojectdetails = req.body.projectdetails

            if (!validateData(azureurl, "empty") && !validateData(azureusername, "empty") && !validateData(azurepat, "empty")) {
                var inputs = {
                    "azureBaseUrl": azureurl,
                    "azure_uname": azureusername,
                    "azurepat": azurepat,
                    "testPlanDetails":azuretestplandetails,
                    "projectDetails":azureprojectdetails
                };
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                        if(mySocket != undefined) {
                            logger.info("Sending socket request for azure_user_stories to cachedb");
                            mySocket.emit("azurelogin", req.body.action, inputs);
                            var count = 0;

                            function azure_login_7_listener(message) {
                                var data = message;
                                    mySocket.removeListener("Azure_details", azure_login_7_listener);
                                    
                                        var resultData = data;
                                        if (count == 0) {
                                            if (resultData != "Fail" && resultData != "Invalid Url" && resultData != "Invalid Credentials") {
                                                logger.info('Azure: Login successfully.');
                                            } else {
                                                logger.error('Azure: Login Failed.');
                                            }
                                            res.send(resultData);
                                            count++;
                                        }
                                    
                                
                            }
                            mySocket.on("Azure_details", azure_login_7_listener);
                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectAzure_ICE - loginToAzure: Socket not Available");
                                res.send(flag);
                        }
                } catch (exception) {
                    logger.error("Exception in the service connectAzure_ICE - loginToAzure: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectAzure_ICE - loginToAzure: Invalid inputs");
                res.send("Fail");
            }
        }
        else if(req.body.action == 'azureTestCases') {
            var azureurl = req.body.baseurl;
            var azureusername = req.body.username;
            var azurepat = req.body.pat;
            var azuretestsuitedetails = req.body.testsuitedetails
            var azuretestplandetails = req.body.testplandetails
            var azureprojectdetails = req.body.projectdetails

            if (!validateData(azureurl, "empty") && !validateData(azureusername, "empty") && !validateData(azurepat, "empty")) {
                var inputs = {
                    "azureBaseUrl": azureurl,
                    "azure_uname": azureusername,
                    "azurepat": azurepat,
                    "testSuiteDetails":azuretestsuitedetails,
                    "testPlanDetails":azuretestplandetails,
                    "projectDetails":azureprojectdetails
                };
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                        if(mySocket != undefined) {
                            logger.info("Sending socket request for azure_user_stories to cachedb");
                            mySocket.emit("azurelogin", req.body.action, inputs);
                            var count = 0;

                            function azure_login_8_listener(message) {
                                var data = message;
                                    mySocket.removeListener("Azure_details", azure_login_8_listener);
                                    var resultData = data;
                                    if (count == 0) {
                                        if (resultData != "Fail" && resultData != "Invalid Url" && resultData != "Invalid Credentials") {
                                            logger.info('Azure: Login successfully.');
                                        } else {
                                            logger.error('Azure: Login Failed.');
                                        }
                                        res.send(resultData);
                                        count++;
                                    }
                                    
                                
                            }
                            mySocket.on("Azure_details", azure_login_8_listener);
                        } else {
                                flag = "unavailableLocalServer";
                                logger.error("Error occurred in the service connectAzure_ICE - loginToAzure: Socket not Available");
                                res.send(flag);
                        }
                    
                } catch (exception) {
                    logger.error("Exception in the service connectAzure_ICE - loginToAzure: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service connectAzure_ICE - loginToAzure: Invalid inputs");
                res.send("Fail");
            }
        }
    } catch (exception) {
        logger.error("Exception in the service connectAzure_ICE: %s", exception);
        res.send("Fail");
    }

};

exports.saveAzureDetails_ICE = async (req, res) => {
    
	const fnName = "saveAzureDetails_ICE";
	logger.info("Inside UI service: " + fnName);
    // console.log(req.body);
	try {
		var mappedDetails = req.body.mappedDetails;
		var flag = mappedDetails.length > 0;
		if (!flag) return res.send('fail');
		for (let i=0; i<mappedDetails.length; i++) {
			let itr = mappedDetails[i];
			let inputs = {
				"testscenarioid": itr.scenarioId[0],
				'projectid': itr.projectId,			
				'projectName': itr.projectName,
				// 'itemCode': itr.testCode,
                'itemType': itr.itemType,
				"query": "saveAzureDetails_ICE"
			};
            if(inputs.itemType == 'UserStory') {
                inputs['userStoryId'] = itr.userStoryId;
                inputs['userStorySummary'] = itr.userStorySummary
            } else {
                inputs['TestSuiteId'] = itr.TestSuiteId;
                inputs['testSuiteSummary'] = itr.testSuiteSummary
            }
			const result = await utils.fetchData(inputs, "qualityCenter/saveIntegrationDetails_ICE", fnName);
			if (result == "fail") flag = false;
		}
		if (!flag) return res.send('fail');
		res.send("success");
	} catch (exception) {
		logger.error("Error occurred in azure/"+fnName+":", exception);
		res.send("fail");
	}
};

exports.viewAzureMappedList_ICE = async (req, res) => {
    // console.log(args);
	const fnName = "viewAzureMappedListAzure";
	logger.info("Inside UI service: " + fnName);
	try {
		var userid = req.session.userid;
        if (!req.body.scenarioName) {
            var inputs = {
                "userid": userid,
                "query": "azuredetails"
            };
        } else {
            var inputs = {
                "userid": userid,
                'scenarioName':req.body.scenarioName,
                "query": "azuredetails"
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

const updateDbReportData = async (reportId, slno, defectId) => {
    const inputs = {
        "reportid": reportId,
        "slno": slno,
        "defectid": defectId,
        "query": "defectThroughAzure"
    };
    const reportUpdateStatus = await utils.fetchData(inputs, "reports/updateReportData", "updateDbReportData");
    return reportUpdateStatus !== "fail";
}