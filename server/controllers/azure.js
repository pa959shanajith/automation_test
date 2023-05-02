var myserver = require('../lib/socket');
var validator = require('validator');
var logger = require('../../logger');
var async = require('async');
var Client = require("node-rest-client").Client;
var epurl = process.env.DAS_URL;
var client = new Client();
var redisServer = require('../lib/redisSocketHandler');
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
        var username=req.session.username;
        var icename = undefined
        if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
        redisServer.redisSubServer.subscribe('ICE2_' + icename);
        if (req.body.action == 'loginToAzure') { //Login to Jira for creating issues
            var azureurl = req.body.url;
            var azureusername = req.body.username;
            var azurepat = req.body.pat;
            if (!validateData(azureurl, "empty") && !validateData(azureusername, "empty") && !validateData(azurepat, "empty")) {
                //var inputs = [jiraurl,jirausername,jirapwd];
                var inputs = {
                    "azureBaseUrl": azureurl,
                    "azure_uname": azureusername,
                    "azurepat": azurepat
                };
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for jira_login to cachedb");
                            var dataToIce = {
                                "emitAction": "azureLogin",
                                "username": icename,
                                "action": req.body.action,
                                "inputs": inputs
                            };
                            redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
                            var count = 0;

                            function azure_login_1_listener(channel, message) {
                                var data = JSON.parse(message);
                                if (icename == data.username && ["unavailableLocalServer", "auto_populate"].includes(data.onAction)) {
                                    redisServer.redisSubServer.removeListener("message", azure_login_1_listener);
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
                            redisServer.redisSubServer.on("message", azure_login_1_listener);
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
        } else if (req.body.action == 'createIssueInAzure') { //Create issues in the Jira
            var createObj = req.body.issue_dict;
            if (!validateData(createObj.info.project.text, "empty") && !validateData(createObj.info.issue.text, "empty") && !validateData(createObj.info.summary.value, "empty")  && !validateData(createObj.info.reproSteps.value, "empty")) {
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for jira_login to cachedb");
                            dataToIce = {
                                "emitAction": "azureLogin",
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
        } else if (req.body.action == 'getAzureConfigureFields') { //gets jira configure fields for given project and issue type
            var createObj = req.body.azure_input_dict;
            var project = req.body.project;
            project = 'AvoAssure'
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
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for jira_login to cachedb");
                            dataToIce = {
                                "emitAction": "azureLogin",
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
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for jira_login to cachedb");
                            var dataToIce = {
                                "emitAction": "azureLogin",
                                "username": icename,
                                "action": req.body.action,
                                "inputs": inputs
                            };
                            redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
                            var count = 0;

                            function jira_login_4_listener(channel, message) {
                                var data = JSON.parse(message);
                                if (icename == data.username && ["unavailableLocalServer", "Jira_details"].includes(data.onAction)) {
                                    redisServer.redisSubServer.removeListener("message", jira_login_4_listener);
                                    if (data.onAction == "unavailableLocalServer") {
                                        logger.error("Error occurred in connectJira_ICE - loginToJira: Socket Disconnected");
                                        if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
                                            var soc = myserver.socketMapNotify[username];
                                            soc.emit("ICEnotAvailable");
                                        }
                                    } else if (data.onAction == "Jira_details") {
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
                            redisServer.redisSubServer.on("message", jira_login_4_listener);
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
                    // redisServer.redisSubServer.subscribe('ICE2_' + icename);
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for jira_login to cachedb");
                            var dataToIce = {
                                "emitAction": "jiralogin",
                                "username": icename,
                                "action": req.body.action,
                                "inputs": inputs,
                                "project_selected": {
                                    'project':req.body.project,
                                    'key':req.body.key
                                },
                                "itemType":req.body.itemType,
                                
                            };
                            redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
                            var count = 0;

                            function jira_login_5_listener(channel, message) {
                                var data = JSON.parse(message);
                                if (icename == data.username && ["unavailableLocalServer", "Jira_testcases"].includes(data.onAction)) {
                                    redisServer.redisSubServer.removeListener("message", jira_login_5_listener);
                                    if (data.onAction == "unavailableLocalServer") {
                                        logger.error("Error occurred in connectJira_ICE - loginToJira: Socket Disconnected");
                                        if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
                                            var soc = myserver.socketMapNotify[username];
                                            soc.emit("ICEnotAvailable");
                                        }
                                    } else if (data.onAction == "Jira_testcases") {
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
                            redisServer.redisSubServer.on("message", jira_login_5_listener);
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
                    "projectDetails":azureprojectdetails
                };
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for azure_user_stories to cachedb");
                            var dataToIce = {
                                "emitAction": "azureLogin",
                                "username": icename,
                                "action": req.body.action,
                                "inputs": inputs
                            };
                            redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
                            var count = 0;

                            function azure_login_5_listener(channel, message) {
                                var data = JSON.parse(message);
                                if (icename == data.username && ["unavailableLocalServer", "Jira_details"].includes(data.onAction)) {
                                    redisServer.redisSubServer.removeListener("message", azure_login_5_listener);
                                    if (data.onAction == "unavailableLocalServer") {
                                        logger.error("Error occurred in connectJira_ICE - loginToJira: Socket Disconnected");
                                        if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
                                            var soc = myserver.socketMapNotify[username];
                                            soc.emit("ICEnotAvailable");
                                        }
                                    } else if (data.onAction == "Jira_details") {
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
                            redisServer.redisSubServer.on("message", azure_login_5_listener);
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
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for azure_user_stories to cachedb");
                            var dataToIce = {
                                "emitAction": "azureLogin",
                                "username": icename,
                                "action": req.body.action,
                                "inputs": inputs
                            };
                            redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
                            var count = 0;

                            function azure_login_6_listener(channel, message) {
                                var data = JSON.parse(message);
                                if (icename == data.username && ["unavailableLocalServer", "Jira_details"].includes(data.onAction)) {
                                    redisServer.redisSubServer.removeListener("message", azure_login_6_listener);
                                    if (data.onAction == "unavailableLocalServer") {
                                        logger.error("Error occurred in connectJira_ICE - loginToJira: Socket Disconnected");
                                        if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
                                            var soc = myserver.socketMapNotify[username];
                                            soc.emit("ICEnotAvailable");
                                        }
                                    } else if (data.onAction == "Jira_details") {
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
                            redisServer.redisSubServer.on("message", azure_login_6_listener);
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
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for azure_user_stories to cachedb");
                            var dataToIce = {
                                "emitAction": "azureLogin",
                                "username": icename,
                                "action": req.body.action,
                                "inputs": inputs
                            };
                            redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
                            var count = 0;

                            function azure_login_7_listener(channel, message) {
                                var data = JSON.parse(message);
                                if (icename == data.username && ["unavailableLocalServer", "Jira_details"].includes(data.onAction)) {
                                    redisServer.redisSubServer.removeListener("message", azure_login_7_listener);
                                    if (data.onAction == "unavailableLocalServer") {
                                        logger.error("Error occurred in connectJira_ICE - loginToJira: Socket Disconnected");
                                        if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
                                            var soc = myserver.socketMapNotify[username];
                                            soc.emit("ICEnotAvailable");
                                        }
                                    } else if (data.onAction == "Jira_details") {
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
                            redisServer.redisSubServer.on("message", azure_login_7_listener);
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
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for azure_user_stories to cachedb");
                            var dataToIce = {
                                "emitAction": "azureLogin",
                                "username": icename,
                                "action": req.body.action,
                                "inputs": inputs
                            };
                            redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
                            var count = 0;

                            function azure_login_8_listener(channel, message) {
                                var data = JSON.parse(message);
                                if (icename == data.username && ["unavailableLocalServer", "Jira_details"].includes(data.onAction)) {
                                    redisServer.redisSubServer.removeListener("message", azure_login_8_listener);
                                    if (data.onAction == "unavailableLocalServer") {
                                        logger.error("Error occurred in connectJira_ICE - loginToJira: Socket Disconnected");
                                        if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
                                            var soc = myserver.socketMapNotify[username];
                                            soc.emit("ICEnotAvailable");
                                        }
                                    } else if (data.onAction == "Jira_details") {
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
                            redisServer.redisSubServer.on("message", azure_login_8_listener);
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
		logger.error("Error occurred in jira/"+fnName+":", exception);
		res.send("fail");
	}
};

exports.viewAzureMappedList_ICE = async (req, res) => {
    // console.log(args);
	const fnName = "viewJiraMappedListAzure";
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