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
        //To be removed
        username = 's.2'
        var icename = undefined
        if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
        redisServer.redisSubServer.subscribe('ICE2_' + icename);
        if (req.body.action == 'loginToAzure') { //Login to Jira for creating issues
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
            if (!validateData(createObj.project, "empty") && !validateData(createObj.issuetype, "empty") && !validateData(createObj.summary, "empty")  && !validateData(createObj.description, "empty")) {
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
    } catch (exception) {
        logger.error("Exception in the service connectAzure_ICE: %s", exception);
        res.send("Fail");
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