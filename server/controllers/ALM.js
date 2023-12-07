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
const httpsServer = require('./../../server').httpsServer;
const uiConfig = require('./../config/options');
const socket_io = require('socket.io')(httpsServer, {
	cookie: false,
	pingInterval: uiConfig.socketio.pingInterval,
	pingTimeout: uiConfig.socketio.pingTimeout,
	allowEIO3: true,
	maxHttpBufferSize: 1e8  // approx. 100 MB, default is 1 MB
});



exports.create_ALM_Testcase = async function (req, res) {
 
    logger.info("ALM create testcase service called");
    try {
        logger.info("validating the request payload");
         if ( !req.body.projectName || !req.body.project || !req.body.processGlobalId || !req.body.testCaseName || !req.body.testCaseDescription) {
            return res.status(400).json({ error: 'Bad request: Missing required data' });
        }
        var inputs,emit_data; 
        inputs = emit_data = req.body;
        inputs['query'] = "alm_create_testcase";
        inputs['username'] = req.session.username;
        var current_url =`${req.protocol}://${req.get('host')}/testcases`;
        inputs['url'] = current_url
        logger.info("making an call to DAS to save the request details to db");
        const result = await utils.fetchData(inputs, "/ALM_createtestcase", "alm_create_testcase", true);
        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        emit_data['testcaseId'] = result[0].rows || ''
        socket_io.emit('messageFromServer',req.body);
        logger.info("info : emitted socket connection with testcaseid and those details saved in db");
        res.status(201).send({  "testCaseId": result[0].rows || '',"url": `${req.protocol}://${req.get('host')}/testcases/${result[0].rows}` });
 
    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.getALM_Testcases = async function (req, res) {
 
    logger.info("ALM get testcases service called");
    try {
        // calmTenantId/:calmTenantLabel/:sutTenant/:sutSystemType/:sutSystemId/:sutBaseUrl/:sutSoftwareVersion/:project/:scope/:countryVersion/:processes/:processGlobalIds
        console.log(req.query.calmTenantId);
        console.log(req.query.calmTenantLabel);
        console.log(req.query.sutTenant);
        console.log(req.query.sutSystemType);
        console.log(req.query.sutSystemId);
        console.log(req.query.sutBaseUrl);
        console.log(req.query.sutSoftwareVersion);
        console.log(req.query.project);
        console.log(req.query.scope);
        console.log(req.query.countryVersion);
        console.log(req.query.processes);
        console.log(req.query.processGlobalIds);

        // var inputs = {
        //     "query": "alm_get_testcases"
        // }
        // inputs['query'] = "alm_create_testcase";
        // logger.info("making an call to DAS to save the request details to db");
        // const result = await utils.fetchData(inputs, "/ALM_createtestcase", "alm_create_testcase", true);
        // if (result &&  result[1].statusCode !== 200) {
        //     logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
        //     return res.status(result[1].statusCode).json({
        //         error: result[1].statusMessage || 'Unknown error',
        //     });
        // }
        // emit_data['testcaseId'] = result[0].rows || ''
        // socket_io.emit('messageFromServer',req.body);
        logger.info("info : testcases api called");
        res.status(200).send({
            "project": "11111111-1111-1111-1111-111111111111",
            "scope": "f787dc00-0e96-4457-82b5-911e2861f6bf",
            "count": 42,
            "testcases": [
              {
                "id": "GUIDTC1",
                "name": "Default BD9 Test Case",
                "description": "Validation of the straightforward BD9 processing for Order type OR",
                "language": "string",
                "isCustom": true,
                "automationVersion": true,
                "process": "BD9",
                "processGlobalId": "ERL-619d2c82cbe94af99f762d27af62017e",
                "releaseCreated": "string",
                "releaseChanged": "string",
                "createdBy": "John Doe",
                "lastModifiedBy": "Jane Doe",
                "createdAt": "2023-12-06T09:46:29.790Z",
                "lastModifiedAt": "2023-12-06T09:46:29.790Z",
                "url": "https://<root_automation_tool_URL>/testcases/<GUIDTC1>",
                "error": {
                  "errorType": "string",
                  "errorCode": 0,
                  "errorShortMessage": "string",
                  "errorLongMessage": "string",
                  "errorUrl": "string"
                }
              }
            ]
          });
 
    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ code:'500', error: 'error while processing' });
    }
  };
  
  exports.getALM_Datavariants = async function (req, res) {
 
    logger.info("ALM get datavariants service called");
    try {
        console.log(req.query.calmTenantId);
        console.log(req.query.calmTenantLabel);
        console.log(req.query.sutTenant);
        console.log(req.query.sutSystemType);
        console.log(req.query.sutSystemId);
        console.log(req.query.sutBaseUrl);
        console.log(req.query.sutSoftwareVersion);
        console.log(req.query.project);
        console.log(req.query.scope);
        console.log(req.query.countryVersion);
        console.log(req.query.testCases);
        console.log(req.query.language);

        // var inputs = {
        //     "query": "alm_get_testcases"
        // }
        // inputs['query'] = "alm_create_testcase";
        // logger.info("making an call to DAS to save the request details to db");
        // const result = await utils.fetchData(inputs, "/ALM_createtestcase", "alm_create_testcase", true);
        // if (result &&  result[1].statusCode !== 200) {
        //     logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
        //     return res.status(result[1].statusCode).json({
        //         error: result[1].statusMessage || 'Unknown error',
        //     });
        // }
        // emit_data['testcaseId'] = result[0].rows || ''
        // socket_io.emit('messageFromServer',req.body);
        logger.info("info : getALM_Datavariants api called");
        res.status(200).send({
            "project": "11111111-1111-1111-1111-111111111111",
            "scope": "f787dc00-0e96-4457-82b5-911e2861f6bf",
            "testcasesvariants": [
              {
                "testCaseId": "GUIDTC1",
                "variants": [
                  {
                    "id": "VAR01",
                    "name": "Data Variant 1",
                    "description": "Simple data variant for simple scenario",
                    "language": "string",
                    "lastModifiedBy": "John Doe",
                    "lastModifiedAt": "2023-12-06T09:46:29.782Z",
                    "url": "https://<test_automation_tool_URL/datavariant/<Variant_ID>",
                    "error": {
                      "errorType": "string",
                      "errorCode": 0,
                      "errorShortMessage": "string",
                      "errorLongMessage": "string",
                      "errorUrl": "string"
                    }
                  }
                ],
                "error": {
                  "errorType": "string",
                  "errorCode": 0,
                  "errorShortMessage": "string",
                  "errorLongMessage": "string",
                  "errorUrl": "string"
                }
              }
            ]
          });
 
    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ code:'500', error: 'error while processing' });
    }
  };
  
  exports.Execute_Testcase = async function (req, res) {
 
    logger.info("ALM Execute testcase service called");
    try {
        // var inputs = {
        //     "query": "alm_get_testcases"
        // }
        // inputs['query'] = "alm_create_testcase";
        // logger.info("making an call to DAS to save the request details to db");
        // const result = await utils.fetchData(inputs, "/ALM_createtestcase", "alm_create_testcase", true);
        // if (result &&  result[1].statusCode !== 200) {
        //     logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
        //     return res.status(result[1].statusCode).json({
        //         error: result[1].statusMessage || 'Unknown error',
        //     });
        // }
        // emit_data['testcaseId'] = result[0].rows || ''
        // socket_io.emit('messageFromServer',req.body);
        logger.info("info : Execute_Testcase api called");
        res.status(202).send({'data':[
            {
              "testCaseId": "GUIDTC1",
              "testDataVariantId": "VAR01",
              "jobUrl": "https://<test_automation_tool_URL/jobmonitor/<jobID>",
              "jobId": "JOB123",
              "jobName": "string",
              "error": {
                "errorType": "string",
                "errorCode": 0,
                "errorShortMessage": "string",
                "errorLongMessage": "string",
                "errorUrl": "string"
              }
            }
          ]});
 
    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ code:'500', error: 'error while processing' });
    }
  };  

  exports.Job_Status = async function (req, res) {
 
    logger.info("ALM Job Status service called");
    try {
        console.log(req.query.project);
        console.log(req.query.scope);
        console.log(req.query.jobIds);
        // var inputs = {
        //     "query": "alm_get_testcases"
        // }
        // inputs['query'] = "alm_create_testcase";
        // logger.info("making an call to DAS to save the request details to db");
        // const result = await utils.fetchData(inputs, "/ALM_createtestcase", "alm_create_testcase", true);
        // if (result &&  result[1].statusCode !== 200) {
        //     logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
        //     return res.status(result[1].statusCode).json({
        //         error: result[1].statusMessage || 'Unknown error',
        //     });
        // }
        // emit_data['testcaseId'] = result[0].rows || ''
        // socket_io.emit('messageFromServer',req.body);
        logger.info("info : Job_Status api called , "+req.params.jobids);
        res.status(200).send({
            "project": "11111111-1111-1111-1111-111111111111",
            "scope": "f787dc00-0e96-4457-82b5-911e2861f6bf",
            "jobstatuses": [
              {
                "id": "JOB123",
                "status": "running",
                "percentage": 50,
                "error": {
                  "errorType": "string",
                  "errorCode": 0,
                  "errorShortMessage": "string",
                  "errorLongMessage": "string",
                  "errorUrl": "string"
                }
              }
            ]
          });
 
    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ code:'500', error: 'error while processing' });
    }
  };

  exports.Execution_History = async function (req, res) {
 
    logger.info("ALM Execution History service called");
    try {
        console.log(req.query.calmTenantId);
        console.log(req.query.calmTenantLabel);
        console.log(req.query.sutTenant);
        console.log(req.query.sutSystemType);
        console.log(req.query.sutSystemId);
        console.log(req.query.sutBaseUrl);
        console.log(req.query.sutSoftwareVersion);
        console.log(req.query.project);
        console.log(req.query.scope);
        console.log(req.query.language);
        console.log(req.query.testCases);
        console.log(req.query.lastExecutionCount);
        // var inputs = {
        //     "query": "alm_get_testcases"
        // }
        // inputs['query'] = "alm_create_testcase";
        // logger.info("making an call to DAS to save the request details to db");
        // const result = await utils.fetchData(inputs, "/ALM_createtestcase", "alm_create_testcase", true);
        // if (result &&  result[1].statusCode !== 200) {
        //     logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
        //     return res.status(result[1].statusCode).json({
        //         error: result[1].statusMessage || 'Unknown error',
        //     });
        // }
        // emit_data['testcaseId'] = result[0].rows || ''
        // socket_io.emit('messageFromServer',req.body);
        logger.info("info : Execution_History api called , "+req.params.testcaseId);
        res.status(200).send({
            "project": "11111111-1111-1111-1111-111111111111",
            "scope": "f787dc00-0e96-4457-82b5-911e2861f6bf",
            "testcaseshistory": [
              {
                "testCaseId": "GUIDTC1",
                "testDataVariantId": "VAR01",
                "jobId": "JOB123",
                "jobName": "string",
                "jobUrl": "string",
                "logUrl": "string",
                "startedAt": "2023-12-06T11:28:41.259Z",
                "startedBy": "John Doe",
                "endedAt": "2023-12-06T11:28:41.259Z",
                "resultStatus": "failed",
                "message": "Save button not found - Sales order could not be created",
                "language": "string",
                "error": {
                  "errorType": "string",
                  "errorCode": 0,
                  "errorShortMessage": "string",
                  "errorLongMessage": "string",
                  "errorUrl": "string"
                }
              }
            ]
          });
 
    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ code:'500', error: 'error while processing' });
    }
  };
  
  exports.Scope_Changed = async function (req, res) {
 
    logger.info("ALM Scope Change service called");
    try {
        // var inputs = {
        //     "query": "alm_get_testcases"
        // }
        // inputs['query'] = "alm_create_testcase";
        // logger.info("making an call to DAS to save the request details to db");
        // const result = await utils.fetchData(inputs, "/ALM_createtestcase", "alm_create_testcase", true);
        // if (result &&  result[1].statusCode !== 200) {
        //     logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
        //     return res.status(result[1].statusCode).json({
        //         error: result[1].statusMessage || 'Unknown error',
        //     });
        // }
        // emit_data['testcaseId'] = result[0].rows || ''
        // socket_io.emit('messageFromServer',req.body);
        logger.info("info : Scope_Changed api called ");
        res.status(201).send({ 'data':
        [
            {
              "process": "BD9",
              "processGlobalId": "ERL-619d2c82cbe94af99f762d27af62017e",
              "created": true,
              "error": {
                "errorType": "string",
                "errorCode": 0,
                "errorShortMessage": "string",
                "errorLongMessage": "string",
                "errorUrl": "string"
              }
            }
          ]
          });
 
    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ code:'500', error: 'error while processing' });
    }
  };