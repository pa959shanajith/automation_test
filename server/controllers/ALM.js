var validator = require('validator');
var logger = require('../../logger');
var async = require('async');
var Client = require("node-rest-client").Client;
var utils = require('../lib/utils');
const socket_io = require("../lib/socket")
const http = require('http');


exports.create_ALM_Testcase = async function (req, res) {
 
    logger.info("ALM create testcase service called");
    console.log(`${req.ip}`," ALM create testcase service called");
    try {
        logger.info("validating the request payload");
        console.log(req.body);
         if ( !req.body.projectName || !req.body.project || !req.body.processGlobalId || !req.body.testCaseName || !req.body.testCaseDescription) {
          console.log( 'error: Bad request: Missing required data');  
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
            console.log(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        emit_data['testcaseId'] = result[0].rows || ''
        socket_io.emit('messageFromServer',emit_data);
        logger.info("info : emitted socket connection with testcaseid and those details saved in db");
        res.status(201).send({  "testCaseId": result[0].rows || '',"url": `${req.protocol}://${req.get('host')}/sap-calm-testautomation/api/v1/testcases/${result[0].rows}` });
 
    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };

exports.fetchALM_Testcases = async function (req,res) {
      logger.info("ALM fetch all testcases service called");
  try {
      logger.info("making an call to DAS to fetch the testcases");
      var inputs = {};
      inputs['query'] = "alm_create_testcase";
      const result = await utils.fetchData(inputs, "/fetchALM_Testcases", "alm_fetch_testcases", true);
      // const statusCode = findStatusCode();
      if (result &&  !(result[1].statusCode >= 200 && result[1].statusCode <= 299)) {
          logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
          return res.status(result[1].statusCode).json({
              error: result[1].statusMessage || 'Unknown error',
          });
      }
      logger.info("info : ALM testcases found");
      res.status(result[1].statusCode).send({  "testCases": result[0].rows || [] });

  } catch (error) {
      logger.error('Error: ', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}  
  exports.getALM_Testcases = async function (req, res) {
 
    logger.info("ALM get testcases service called");
    try {
      logger.info("request payload : "+ req.query.calmTenantId+', '
                  + req.query.calmTenantLabel + ', '
                  +req.query.sutTenant + ', '
                  + req.query.sutSystemType + ', '
                  + req.query.sutSystemId +  ', '
                  + req.query.sutBaseUrl + ', '
                  + req.query.sutSoftwareVersion + ', '
                  + req.query.project + ', '
                  + req.query.scope + ', '
                  + req.query.countryVersion + ', '
                  + req.query.processes + ', '
                  + req.query.processGlobalIds
                  );
        // calmTenantId/:calmTenantLabel/:sutTenant/:sutSystemType/:sutSystemId/:sutBaseUrl/:sutSoftwareVersion/:project/:scope/:countryVersion/:processes/:processGlobalIds

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
        var send_res = {
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
        }
        logger.info('response : ' +send_res)
        res.status(200).send(send_res);
 
    } catch (error) {
        logger.error('getALM_Testcases Error:', error);
        res.status(500).json({ code:'500', error: 'error while processing' });
    }
  };
  
  exports.getALM_Datavariants = async function (req, res) {
    
    logger.info("ALM get datavariants service called");
    try {
      logger.info("request payload : "+ req.query.calmTenantId+', '
      + req.query.calmTenantLabel + ', '
      +req.query.sutTenant + ', '
      + req.query.sutSystemType + ', '
      + req.query.sutSystemId +  ', '
      + req.query.sutBaseUrl + ', '
      + req.query.sutSoftwareVersion + ', '
      + req.query.project + ', '
      + req.query.scope + ', '
      + req.query.countryVersion + ', '
      + req.query.testCases + ', '
      + req.query.Language
      );
      var send_res = {
        "project": "11111111-1111-1111-1111-111111111111",
        "scope": "f787dc00-0e96-4457-82b5-911e2861f6bf",
        "testcasesvariants": [
          {
            "testCaseId": "GUIDTC1",
            "variants": [
              {
                "id": "DEFAULT_VARIANT",
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
      }
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
        logger.info("send response : "+send_res);
        res.status(200).send(send_res);
 
    } catch (error) {
        logger.error('getALM_Datavariants Error:', error);
        res.status(500).json({ code:'500', error: 'error while processing' });
    }
  };
  
  exports.Execute_Testcase = async function (req, res) {
 
    logger.info("ALM Execute testcase service called");
    try {
      logger.info("request payload : "+ req.body.project+', '
      + req.body.scope + ', '
      +req.body.testcases
      );
      var send_res = {'data':[
        {
          "testCaseId": req.body.testcases[0].testCaseId,
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
      ]}
      var inputs = {
        "testcaseId":req.body.testcases[0].testCaseId,
        "query":"getALM_Profile"
      }
      const getProfile = await utils.fetchData(inputs, "/getALM_TestProfile", "getALM_Profile", true);
      console.log(getProfile, ' its from getProfile');

      socket_io.emit("triggerExecution",getProfile[0].rows.Profile);
        logger.info("send response : "+send_res);
        res.status(202).send(send_res);
 
    } catch (error) {
        logger.error(' Execute_Testcase Error: ', error);
        res.status(500).json({ code:'500', error: 'error while processing' });
    }
  };  

  exports.Job_Status = async function (req, res) {
 
    logger.info("ALM Job Status service called");
    try {
      logger.info("request payload : "+ req.query.project+', '
      + req.query.scope + ', '
      +req.query.jobIds
      );
      var send_res = {
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
      }
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
        logger.info("info : Job_Status api called , "+req.query.jobIds);
        logger.info("send response : "+send_res)
        res.status(200).send(send_res);
 
    } catch (error) {
        logger.error('Job_Status Error: ', error);
        res.status(500).json({ code:'500', error: 'error while processing' });
    }
  };

  exports.Execution_History = async function (req, res) {
 
    logger.info("ALM Execution History service called");
    try {
      logger.info("request payload : "+ req.query.calmTenantId+', '
      + req.query.calmTenantLabel + ', '
      +req.query.sutTenant + ', '
      + req.query.sutSystemType + ', '
      + req.query.sutSystemId +  ', '
      + req.query.sutBaseUrl + ', '
      + req.query.sutSoftwareVersion + ', '
      + req.query.project + ', '
      + req.query.scope + ', '
      + req.query.language + ', '
      + req.query.testCases + ', '
      + req.query.lastExecutionCount
      );
        var send_res = {
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
        }
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
        logger.info("send response : "+send_res)
        res.status(200).send(send_res);
 
    } catch (error) {
        logger.error('Execution_History Error: ', error);
        res.status(500).json({ code:'500', error: 'error while processing' });
    }
  };
  
  exports.Scope_Changed = async function (req, res) {
 
    logger.info("ALM Scope Change service called");
    try {
      logger.info("request payload : "+ req.query.data);
      var send_res = { 'data':
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
        }
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
        logger.info("send response : "+send_res)
        res.status(201).send(send_res);
 
    } catch (error) {
        logger.error('Scope_Changed Error: ', error);
        res.status(500).json({ code:'500', error: 'error while processing' });
    }
  };

  exports.saveSAP_ALMDetails_ICE = async (req, res) => {
    
    const fnName = "saveALM_MappedTestcase";
    logger.info("Inside UI service: " + fnName);
    try {
      var mappedDetails = req.body.mappedDetails;
      var flag = mappedDetails.length > 0;
      var statusMessage = 'Unknown error';
      var statusCode = 400;
      if (!flag) return res.status(statusCode).json({error:'bad request'});
      for (let i=0; i<mappedDetails.length; i++) {
        let itr = mappedDetails[i];
        let inputs = {
          "testscenarioid": itr.scenarioId,
          'projectid': itr.projectId,
          "projectname": itr.projectName,
          'testname': itr.testCaseName,
          'testCaseDescription': itr.testCaseDescription,
          "testid":itr.testcaseId,
          "type":"SAP ALM",
          "query": "saveSAP_ALMDetails_ICE"
        };
        const result = await utils.fetchData(inputs, "/saveALM_MappedTestcase", fnName,true);
        if (result &&  !(result[1].statusCode >= 200 && result[1].statusCode <= 299)) {
          logger.error(`request error : ` ,result[0] === 'fail' ? result[2].error : result[1].statusMessage || 'Unknown error');
          flag = false;
      }
      statusCode = result[1].statusCode;
      statusMessage = result[0] === 'fail' ? result[1].statusMessage : result[0].message;
      }
      if (!flag) return res.status(statusCode).json({error:statusMessage});
      res.status(statusCode).json({message:statusMessage});
    } catch (exception) {
      logger.error("Error occurred in ALM/"+fnName+":", exception);
      res.status(500).json({error:exception.message});
    }
  };