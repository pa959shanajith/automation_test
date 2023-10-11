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
exports.saveBrowserstackData = function(req, res) {
    try {
        logger.info("Inside UI service: saveBrowserstackData");
        var username=req.session.username;
        var icename = undefined
        if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
        redisServer.redisSubServer.subscribe('ICE2_' + icename);
        var inputs = {
            "Browserstack_uname": req.body.BrowserstackPayload.BrowserstackUsername,
            "BrowserstackAccessKey": req.body.BrowserstackPayload.Browserstackkey
        };
        if (req.body.BrowserstackPayload.action == 'webDetails') { //Login to Browserstack
            var browserstackUsername = req.body.BrowserstackPayload.BrowserstackUsername;
            var browserstackAccessKey = req.body.BrowserstackPayload.Browserstackkey;
            if (!validateData(browserstackUsername, "empty") && !validateData(browserstackAccessKey, "empty")) {
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for browserstack_login to cachedb");
                            inputs['action'] =  req.body.BrowserstackPayload.action;
                            var dataToIce = {
                                "emitAction": "loginToBrowserstack",
                                "username": icename,
                                "inputs": inputs
                            };
                            redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
                            var count = 0;
                            function Browserstack_login_1_listener(channel, message) {
                                var data = JSON.parse(message);
                                if (icename == data.username && ["unavailableLocalServer", "browserstack_confresponse"].includes(data.onAction)) {
                                    redisServer.redisSubServer.removeListener("message", Browserstack_login_1_listener);
                                    if (data.onAction == "unavailableLocalServer") {
                                        logger.error("Error occurred in saveBrowserstackData - loginToBrowserstack: Socket Disconnected");
                                        if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
                                            var soc = myserver.socketMapNotify[username];
                                            soc.emit("ICEnotAvailable");
                                        }
                                    } else if (data.onAction == "browserstack_confresponse") {
                                        var resultData = data.value;
                                        if (count == 0) {
                                            if (resultData != "Fail" && resultData != "Invalid Url" && resultData != "Invalid Credentials") {
                                                logger.info('Browserstack: Login successfully.');
                                            } else {
                                                logger.error('Browserstack: Login Failed.');
                                            }
                                            res.send(resultData);
                                            count++;
                                        }
                                    }
                                }
                            }
                            redisServer.redisSubServer.on("message", Browserstack_login_1_listener);
                        } else {
                            utils.getChannelNum('ICE1_scheduling_' + icename, function(found) {
                                var flag = "";
                                if (found) flag = "scheduleModeOn";
                                else {
                                    flag = "unavailableLocalServer";
                                    logger.error("Error occurred in the service saveBrowserstackData - loginToBrowserstack: Socket not Available");
                                }
                                res.send(flag);
                            });
                        }
                    });
                } catch (exception) {
                    logger.error("Exception in the service saveBrowserstackData - loginToBrowserstack: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service saveBrowserstackData - loginToBrowserstack: Invalid inputs");
                res.send("Fail");
            }
        } else if (req.body.BrowserstackPayload.action == 'mobileWebDetails') { //Create issues in the Azure
            var browserstackUsername = req.body.BrowserstackPayload.BrowserstackUsername;
            var browserstackAccessKey = req.body.BrowserstackPayload.Browserstackkey;
            if (!validateData(browserstackUsername, "empty") && !validateData(browserstackAccessKey, "empty")) {
                try {
                    logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
                    logger.debug("ICE Socket requesting Address: %s", icename);
                    redisServer.redisPubICE.pubsub('numsub', 'ICE1_normal_' + icename, function(err, redisres) {
                        if (redisres[1] > 0) {
                            logger.info("Sending socket request for browserstack_login to cachedb");
                            inputs['action'] =  req.body.BrowserstackPayload.action;
                            dataToIce = {
                                "emitAction": "loginToBrowserstack",
                                "username": icename,
                                "inputs": inputs
                            };
                            redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
                            var count = 0;
                            function browserstack_login_2_listener(channel, message) {
                                var data = JSON.parse(message);
                                if (icename == data.username && ["unavailableLocalServer", "issue_id"].includes(data.onAction)) {
                                    redisServer.redisSubServer.removeListener("message", browserstack_login_2_listener);
                                    if (data.onAction == "unavailableLocalServer") {
                                        logger.error("Error occurred in saveBrowserstackData - loginToBrowserstack: Socket Disconnected");
                                        if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
                                            var soc = myserver.socketMapNotify[username];
                                            soc.emit("ICEnotAvailable");
                                        }
                                    } else if (data.onAction == "browserstack_confresponse") {
                                        var resultData = data.value;
                                        if (count == 0) {
                                            if (resultData != "Fail") {
                                                logger.info('Browserstack: Login successfully.');
                                            } else {
                                                logger.error('Browserstack: Login Failed.');
                                            }
                                            res.send(resultData);
                                            count++;
                                        }
                                    }
                                }
                            }
                            redisServer.redisSubServer.on("message", browserstack_login_2_listener);
                        } else {
                            utils.getChannelNum('ICE1_scheduling_' + icename, function(found) {
                                var flag = "";
                                if (found) flag = "scheduleModeOn";
                                else {
                                    flag = "unavailableLocalServer";
                                    logger.error("Error occurred in the service connectAzure_ICE - createIssueInAzure: Socket not Available");
                                }
                                res.send(flag);
                            });
                        }
                    });
                } catch (exception) {
                    logger.error("Exception in the service saveBrowserstackData - loginToBrowserstack: %s", exception);
                }
            } else {
                logger.error("Error occurred in the service saveBrowserstackData - loginToBrowserstack: Invalid inputs");
                // res.send("Fail");
            }  
        }} catch (exception) {
            logger.error("Exception in the service saveBrowserstackData: %s", exception);
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