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


exports.saveBrowserstackData = function(req, res) {
    try {
        logger.info("Inside UI service: saveBrowserstackData");
        var username = req.session.username;
        var icename = undefined;
        let mySocket;

        let clientName = utils.getClientName(req.headers.host);
        if (myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0) {
            icename = myserver.allSocketsICEUser[clientName][username][0];
        }
        mySocket = myserver.allSocketsMap[clientName][icename];
        logger.debug("ICE Socket requesting Address: %s", icename);

        const reqData = req.body;
        var browserstackUsername = reqData.BrowserstackPayload.BrowserstackUsername;
        var browserstackAccessKey = reqData.BrowserstackPayload.Browserstackkey;
        var check_BrowserStackUploadApk =(reqData.BrowserstackPayload.uploadApkValuesBS);
        
        var inputs = {
            "Browserstack_uname": browserstackUsername,
            "BrowserstackAccessKey": browserstackAccessKey,
            "BrowserstackUploadApk": check_BrowserStackUploadApk,
            "action": reqData.BrowserstackPayload.action
            
        };

        if (inputs.action === 'webDetails' || inputs.action === 'mobileWebDetails' || inputs.action === 'BrowserStackMobileUploadDetails') {
            // Login to Browserstack
            if (!validateData(browserstackUsername, "empty") && !validateData(browserstackAccessKey, "empty")) {
                logger.debug("IP's connected: %s", Object.keys(myserver.allSocketsMap).join());
                logger.debug("ICE Socket requesting Address: %s", icename);

                dataToIce = {
                    "username": username,
                    "emitAction": "logintobrowserstack",
                    "responsedata": inputs
                };
                mySocket.emit(dataToIce.emitAction, dataToIce.responsedata);

                var count = 0;

                function browserstack_login_listener(message) {
                    var value = message;
                    data = {
                        "username": username,
                        "onAction": "browserstack_confresponse",
                        "value": value
                    };
                    mySocket.removeListener('browserstack_confresponse', browserstack_login_listener);

                    if (data.onAction === "unavailableLocalServer") {
                        logger.error("Error occurred in saveBrowserstackData - loginToBrowserstack: Socket Disconnected");
                    } else if (data.onAction === "browserstack_confresponse") {
                        var resultData = data.value;

                        if (count === 0) {
                            if (resultData !== "Fail" && resultData !== "Invalid Url" && resultData !== "Invalid Credentials") {
                                logger.info('Browserstack: Login successfully.');
                            } else {
                                logger.error('Browserstack: Login Failed.');
                            }
                            res.send(resultData);
                            count++;
                        }
                    }
                }

                mySocket.on("browserstack_confresponse", browserstack_login_listener);
            } else {
                logger.error("Error occurred in the service saveBrowserstackData: Socket not Available");
                flag = "unavailableLocalServer";
                logger.info("ICE Socket not Available");
                res.send(flag);
            }
        } else {
            logger.error("Error occurred in the service saveBrowserstackData - loginToBrowserstack: Invalid inputs");
            res.send("Fail");
        }
    } catch (error) {
        logger.error("Error occurred in the service saveBrowserstackData - loginToBrowserstack: " + error);
        res.send("Fail");
    }
}
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