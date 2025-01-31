var validator = require('validator');
var logger = require('../../logger');
var async = require('async');
var Client = require("node-rest-client").Client;
var utils = require('../lib/utils');
const socket_io = require("../lib/socket")
const http = require('http');
const {execAutomation,runningStatus} = require('./suite');
const {fetchModSceDetails,viewReport} = require("./report");
const uuid = require('uuid-random');
const url = require('url');

exports.create_ALM_Testcase = async function (req, res) {
 
    logger.info("ALM create testcase service called");
    console.log(`${req.ip}`," ALM create testcase service called");
    try {
        logger.info("validating the request payload");
        console.log(req.body);
         if ( !req.body.projectName || !req.body.project || !req.body.processGlobalId || !req.body.testCaseName ) {
          console.log( 'error: Bad request: Missing required data');  
          return res.status(400).json({ error: 'Bad request: Missing required data' });
        }
        var inputs,emit_data; 
        inputs = emit_data = req.body;
        inputs['query'] = "alm_create_testcase";
        inputs['username'] = req.session.username;
        var current_url =`${req.protocol}://${req.get('host')}/testcases`;
        inputs['url'] = current_url;
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString();
        inputs['variants'] = [{
          "id": "VAR01",
          "name": "Data Variant 1",
          "description": "Simple data variant for simple scenario",
          "language": "string",
          "lastModifiedBy": "John Doe",
          "lastModifiedAt": formattedDate,
          "url": `${req.protocol}://${req.get('host')}/datavariant/VAR01`,
        }];
        logger.info("making an call to DAS to save the request details to db");
        const result = await utils.fetchData(inputs, "/ALM_createtestcase", "alm_create_testcase", true);
        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            console.log(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({
                message: result[1].statusMessage || 'Unknown error',
            });
        }
        emit_data['testcaseId'] = result[0].rows || ''
        // socket_io.emit('messageFromServer',emit_data);
        logger.info("info : emitted socket connection with testcaseid and those details saved in db");
        res.status(201).send({  "testCaseId": result[0].rows || '',"url": `${req.protocol}://${req.get('host')}/sap-calm-testautomation/api/v1/testcases/${result[0].rows}` });
 
    } catch (error) {
        logger.error('Error:', error.message);
        res.status(500).json({ code:"500", message: 'Internal server error' });
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
            code:'500',
            message: result[1].statusMessage || 'Unknown error',
          });
      }
      logger.info("info : ALM testcases found");
      res.status(result[1].statusCode).send({  "testCases": result[0].rows || [] });

  } catch (error) {
      logger.error('Error: ', error.message);
      res.status(500).json({ code:'500', message: 'Internal server error' });
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
        res.status(500).json({ code:'500', message: 'error while processing' });
    }
  };
  
  exports.getALM_Datavariants = async function (req, res) {
    
    logger.info("ALM get datavariants service called");
    try {
      logger.info("request payload : "+ JSON.stringify(req.query));
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString();
      var send_res = {
        "project":  req.query.project,
        "scope": req.query.scope,
        "testcasesvariants": [
          {
            // "testCaseId": "GUIDTC1",
            "variants": [
              {
                "id": "VAR01",
                "name": "Data Variant 1",
                "description": "Simple data variant for simple scenario",
                "language": "en",
                "lastModifiedBy": "Avo Automation",
                "lastModifiedAt": formattedDate,
                "url": `${req.protocol}://${req.get('host')}/datavariant/VAR01`,
                "error":null
              }
            ],
            // "error": {
            //   "errorType": "string",
            //   "errorCode": 0,
            //   "errorShortMessage": "string",
            //   "errorLongMessage": "string",
            //   "errorUrl": "string"
            // }
          }
        ]
      }

      var testCases = req.query.testCases;
      if(testCases){
        testCases = testCases.split(',');
      }

      logger.info(JSON.stringify(testCases));
      // if(send_res.testcasesvariants.length){
        testCases.forEach((testcaseId) => {
          send_res.testcasesvariants = send_res.testcasesvariants.map((each_variant) => ({
            ...each_variant,
            testCaseId: testcaseId
        }));
        })
        
      // }
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
        logger.info("send response : "+ JSON.stringify(send_res));
        res.status(200).send(send_res);
 
    } catch (error) {
        logger.error('getALM_Datavariants Error:', error.message);
        res.status(500).json({ code:'500', message: 'error while processing' });
    }
  };

  exports.Execute_Testcase_Run = async function (req, res) {

    console.log('Execute testcase API called here');
    return res.status(202).send("Executed testcase");
  }
  
  exports.Execute_Testcase = async function (req, res) {
 
    logger.info("ALM Execute testcase service called");
    try {
      logger.info("request payload : "+ JSON.stringify(req.body));
      var send_res = {'data':[
        {
          "testCaseId": req.body.testcases[0].testCaseId,
          "testDataVariantId": "VAR01",
          "jobUrl": "",
          "jobId": "",
          "jobName": "",
          "error": {}
        }
      ]}
      var inputs = {
        "testcaseId":req.body.testcases[0].testCaseId,
        "query":"getALM_Profile"
      }
      const getProfile = await utils.fetchData(inputs, "/getALM_TestProfile", "getALM_Profile", true);
      console.log(getProfile, ' its from getProfile');
      if (getProfile &&  !(getProfile[1].statusCode >= 200 && getProfile[1].statusCode <= 299)) {
        logger.error(`request error :` ,getProfile[1].statusMessage || 'Unknown error');
        console.log(`request error :` ,getProfile[1].statusMessage || 'Unknown error');
        return res.status(500).json({ code:'500', message: 'error while processing' });
    }
      if(getProfile[0].rows && getProfile[0].rows.executionData){
        let agent_exec = {
          "key": getProfile[0].rows.executionData.configurekey,
          "executionThrough": "AvoAgent/AvoGrid",
          "eventType":"CALM"
      }
        req.body = agent_exec;
        let agent_ExecResult = await execAutomation(req, res);

        // fetching executionListId
        if(agent_ExecResult && agent_ExecResult.status === 'pass' ){
          var job_inputs = {"testcaseId":getProfile[0].rows.executionData.testcaseRefId,"configkey":getProfile[0].rows.executionData.configurekey};
          const fetchJOB = await utils.fetchData(job_inputs, "/getJOB_ID", "getJOB_ID", true);
          if(fetchJOB && !(fetchJOB[1].statusCode >= 200 && fetchJOB[1].statusCode <= 299)){
            send_res['data'][0]['error']["errorType"] = fetchJOB[1].statusMessage;
            send_res['data'][0]['error']["errorCode"] = fetchJOB[1].statusCode;
            send_res['data'][0]['error']["errorShortMessage"] = "error while fetching job details";
            return res.status(500).json({ code:'500', message: send_res });
          }

          send_res['data'][0]['jobId'] = fetchJOB[0].rows.executionListId;
          send_res['data'][0]['jobName'] = fetchJOB[0].rows.executionData.configurename;
          // send_res['data'][0]['jobUrl'] =`${req.protocol}://${req.get('host')}/jobmonitor/${fetchJOB[0].rows.executionListId}`
          send_res['data'][0]['jobUrl'] =`${req.protocol}://${req.get('host')}/runningStatus?configurekey=${getProfile[0].rows.executionData.configurekey}&executionListId=${fetchJOB[0].rows.executionListId}`
          const keyToRemove = 'error';
          var modifies_res = send_res.data.map(obj => {
            let { [keyToRemove]: _, ...rest } = obj;
            return rest;
          })
          logger.info("send response : "+modifies_res);
          return res.status(202).send(modifies_res);
        }
        logger.error(' Failed to fetch Execution details');
        return  res.status(500).json({ code:'500', message: 'testcase execution details not found' });
      }
        logger.error(' Execute_Testcase Error ');
        return  res.status(500).json({ code:'500', message: 'error while executing the job' });
    } catch (error) {
        logger.error(' Execute_Testcase Error: ', error);
        return res.status(500).json({ code:'500', message: 'error while processing' });
    }
  };
  
  async function prepareExec(executionData,active_ice) {
    const sample_exec = {
      "type": "",
      "poolid": "",
      "targetUser": active_ice.icename,
      "executionEnv": "default",
      "browserType": [
          "1"
      ],
      "source": "task",
      "exectionMode": "serial",
      "integration": {
          "alm": {
              "password": "",
              "url": "",
              "username": ""
          },
          "azure": {
              "password": "",
              "url": "",
              "username": ""
          },
          "qtest": {
              "password": "",
              "qteststeps": "",
              "url": "",
              "username": ""
          },
          "zephyr": {
              "password": "",
              "url": "",
              "username": ""
          }
      },
      "configurekey": executionData.configurekey,
      "configurename": executionData.configurename,
      "executingOn": "ICE",
      "executionListId": uuid(),
      "profileName": executionData.configurename,
      "recieverEmailAddress": null,
      "batchInfo": executionData.batchInfo,
      "scenarioFlag": false
  }
  return sample_exec;
  }
  
  async function getICEList (projectids,userid,host){
    const fnName = "getICEList";
    var ice_list = [];
    var ice_status = {}
    var unallocatedICE = {}
    var result = {ice_ids:{}}
    result["ice_list"] = []
    result["unallocatedICE"] = {}
    try {
      const pool_req =  {
        "projectids":[projectids],
        "poolid": ""
      }
      let pool_list = await utils.fetchData(pool_req,"admin/getPools",fnName);
      unallocatedICE = await utils.fetchData({}, "admin/getAvailable_ICE");
      var socket = require('../lib/socket');
      var clientName=utils.getClientName(host);
      unallocatedICE = unallocatedICE["available_ice"];
      if(!unallocatedICE || unallocatedICE === "fail") unallocatedICE = {}
      for(let id in unallocatedICE){
        var ice = unallocatedICE[id];
        var ice_name = ice["icename"]
        ice_list.push(ice_name);
        result.unallocatedICE[id] = {}
        if(socket.allSocketsMap[clientName] != undefined && ice_name in socket.allSocketsMap[clientName]){
          result.unallocatedICE[id]["icename"] = ice_name;
          result.unallocatedICE[id]["status"] = false;
          result.unallocatedICE[id]["mode"] = false;
          result.unallocatedICE[id]["connected"] = socket.allSocketsMap[clientName][ice_name].connected;
  
        }else{
          result.unallocatedICE[id]["icename"] = ice_name
          result.unallocatedICE[id]["status"] = false;
          result.unallocatedICE[id]["mode"] = false;
          result.unallocatedICE[id]["connected"] = false;
        }
      }
      for(let index in pool_list){
        pool = pool_list[index];
        const ice_req = {
          poolids: [pool["_id"]]
        }
        ice_in_pool = await utils.fetchData(ice_req,"admin/getICE_pools",fnName);
        if(!ice_in_pool )ice_in_pool = {}
        for(id in ice_in_pool){
          var ice = ice_in_pool[id];
          var ice_name = ice["icename"]
          result.ice_ids[id] = {};
          result.ice_ids[id]["icename"] = ice_name
          ice_list.push(ice_name)
          if(socket.allSocketsMap[clientName] != undefined && ice_name in socket.allSocketsMap[clientName]){
            result.ice_ids[id]["status"] = false;
            result.ice_ids[id]["mode"] = false;
            result.ice_ids[id]["connected"] = socket.allSocketsMap[clientName][ice_name].connected;
          }else{
            result.ice_ids[id]["status"] = false;
            result.ice_ids[id]["mode"] = false;
            result.ice_ids[id]["connected"] = false;
          }
        }
        result["ice_list"] = ice_list;
      }
    }catch(e){
      logger.error("Error occurred in getICEList, Error: %s",e);
    }
    return result;
  }

  exports.JobMonitor = async function (req, res) {
 
    logger.info("ALM Job Status service called");
    try {
      logger.info("request params : "+ req.params
      );
      let jobIds = []
      var send_res = {
        "jobstatuses": []
      }
        var jobID = req.params.jobID;
        if(jobID){
          jobIds.push(jobID)
        }
        var job_inputs = {"executionListIds":jobIds,"type":"jobId"};
        const fetchJOB = await utils.fetchData(job_inputs, "/getExecutionJob", "getExecutionJob", true);
        if(fetchJOB && fetchJOB.length && !(fetchJOB[1].statusCode >= 200 && fetchJOB[1].statusCode <= 299)){
          send_res['data'][0]['error']["errorType"] = fetchJOB[1].statusMessage;
          send_res['data'][0]['error']["errorCode"] = fetchJOB[1].statusCode;
          send_res['data'][0]['error']["errorShortMessage"] = "error while fetching job details";
          return res.status(500).json({ code:'500', message: send_res });
        }
        // fetch job running url
          if(fetchJOB[0].rows && fetchJOB[0].rows.length){
            const eventType = "CALM";
            await Promise.all(fetchJOB[0].rows.map(async each_exec => {
              req.query.executionListId = each_exec.executionListId;
              req.query.configurekey = each_exec.configkey;
              req.query.eventType = eventType;
              var percentage = 0;
              var jobStatus = "unknown"
              var fetch_jobStatus = await runningStatus(req,res);
              logger.info(fetch_jobStatus,' its fetch_jobStatus ');
              if(!fetch_jobStatus){
                logger.error('Job_Status Error ...... ');
                return res.status(500).json({ code:'500', message: 'error while processing' });
              }
              if(fetch_jobStatus["Modules"] && fetch_jobStatus["Modules"].length){
                fetch_jobStatus["Modules"].forEach((_module) => {
                  if(_module && _module["Scenarios"] && _module["Scenarios"].length){
                    _module["Scenarios"].forEach((scn_report) => {
                      if(scn_report && scn_report.Report && scn_report.Report.overallstatus && Object.keys(scn_report.Report.overallstatus).length)
                      jobStatus = setStatus(scn_report.Report.overallstatus.overallstatus);
                    })
                  }
                })
              }
            percentage = jobStatus === "finished"  ? 100 : percentage;
            percentage = fetch_jobStatus['Completed'] ? calculatePercentage(fetch_jobStatus['Completed']) : percentage;
            send_res["jobstatuses"].push({"id":each_exec.executionListId,
            "status":fetch_jobStatus['status'] === "Inprogress" ? "running": jobStatus,
            "percentage":percentage
          })
            }))
          }
          else if(!send_res.jobstatuses.length){
            logger.error('Job_Status Error: no jobstatus found for this job',);
           return res.status(500).json({ code:'500', message: 'no jobstatus found for this job' });
          }

        console.log(send_res,' its send_res ');
        logger.info("send response : "+send_res)
       return res.status(200).send(send_res);
 
    } catch (error) {
        logger.error('Job_Status Error: ', error.message);
        return  res.status(500).json({ code:'500', message: 'error while processing' });
    }
  };

  exports.Job_Status = async function (req, res) {
 
    logger.info("ALM Job Status service called");
    try {
      logger.info("request payload : "+ JSON.stringify(req.query));
      var send_res = {
        "project": req.query.project,
        "scope": req.query.scope,
        "jobstatuses": [
          // {
          //   "id": "JOB123",
          //   "status": "running",
          //   "percentage": 50,
          //   "error": {
          //     "errorType": "string",
          //     "errorCode": 0,
          //     "errorShortMessage": "string",
          //     "errorLongMessage": "string",
          //     "errorUrl": "string"
          //   }
          // }
        ]
      }
        var jobIds = req.query.jobIds;
        if(jobIds){
          jobIds = jobIds.split(',');
        }
        var job_inputs = {"executionListIds":jobIds,"type":"jobId"};
        const fetchJOB = await utils.fetchData(job_inputs, "/getExecutionJob", "getExecutionJob", true);
        if(fetchJOB && fetchJOB.length && !(fetchJOB[1].statusCode >= 200 && fetchJOB[1].statusCode <= 299)){
          send_res['data'][0]['error']["errorType"] = fetchJOB[1].statusMessage;
          send_res['data'][0]['error']["errorCode"] = fetchJOB[1].statusCode;
          send_res['data'][0]['error']["errorShortMessage"] = "error while fetching job details";
          return res.status(500).json({ code:'500', error: send_res });
        }
        // fetch job running url
          if(fetchJOB[0].rows && fetchJOB[0].rows.length){
            const eventType = "CALM";
            await Promise.all(fetchJOB[0].rows.map(async each_exec => {
              req.query.executionListId = each_exec.executionListId;
              req.query.configurekey = each_exec.configkey;
              req.query.eventType = eventType;
              var percentage = 0;
              var jobStatus = "unknown"
              var fetch_jobStatus = await runningStatus(req,res);
              logger.info(fetch_jobStatus,' its fetch_jobStatus ');
              if(!fetch_jobStatus){
                logger.error('Job_Status Error ...... ');
                return res.status(500).json({ code:'500', message: 'error while fetching job status' });
              }
              if(fetch_jobStatus["Modules"] && fetch_jobStatus["Modules"].length){
                fetch_jobStatus["Modules"].forEach((_module) => {
                  if(_module && _module["Scenarios"] && _module["Scenarios"].length){
                    _module["Scenarios"].forEach((scn_report) => {
                      if(scn_report && scn_report.Report && scn_report.Report.overallstatus && Object.keys(scn_report.Report.overallstatus).length)
                      jobStatus = setStatus(scn_report.Report.overallstatus.overallstatus);
                    })
                  }
                })
              }
            logger.info("jobstatus from running status : ",jobStatus);
            percentage = jobStatus === "finished" || jobStatus === "aborted" ? 100 : percentage;
            percentage = fetch_jobStatus['Completed'] ? calculatePercentage(fetch_jobStatus['Completed']) : percentage;
            send_res["jobstatuses"].push({"id":each_exec.executionListId,
            "status":fetch_jobStatus['status'] === "Inprogress" ? "running": jobStatus,
            "percentage":percentage
          })
            }))
          }

        console.log(send_res,' its send_res ');
        logger.info("send response : "+JSON.stringify(send_res))
        return res.status(200).send(send_res);
 
    } catch (error) {
        logger.error('Job_Status Error: ', error.message);
        return res.status(500).json({ code:'500', message: 'error while processing' });
    }
  };
  function setStatus(jobStatus){
    var resStatus = "unknown"
    if(jobStatus && typeof jobStatus === "string"){
      switch (jobStatus) {
        case "Pass":
          resStatus = "finished"
          break;
        case "Fail":
          resStatus = "aborted"
          break;
        case "Terminate":
          resStatus = "aborted"
          break;  
        default:
          break;
      }
    }
    return resStatus;
  }
  function calculatePercentage(input) {
    // Extract numerator and denominator from the input
    const [numerator, denominator] = input.split('/').map(Number);

    // Calculate the percentage
    const percentage = (numerator / denominator) * 100;

    return Math.round(percentage);
}

  exports.Execution_History = async function (req, res) {
 
    logger.info("ALM Execution History service called");
    try {
      logger.info("request payload : "+ JSON.stringify(req.query));
        var send_res = {
          "project": req.query.project,
          "scope": req.query.scope,
          "testcaseshistory": []
        }
        // fetch job details
        var testCases = req.query.testCases;
        let all_jobstatus = [];
        let testcaseshistory = [];
        if(testCases){
          testCases = testCases.split(',');
        }
        var job_inputs = {"testcaseIds":testCases,"type":"testcaseId"};
        const fetchJOB = await utils.fetchData(job_inputs, "/getExecutionJob", "getExecutionJob", true);
        if(fetchJOB && fetchJOB.length && !(fetchJOB[1].statusCode >= 200 && fetchJOB[1].statusCode <= 299)){
          // send_res['data'][0]['error']["errorType"] = fetchJOB[1].statusMessage;
          // send_res['data'][0]['error']["errorCode"] = fetchJOB[1].statusCode;
          // send_res['data'][0]['error']["errorShortMessage"] = "error while fetching job details";
          return res.status(500).json({ code:'500', message: 'error while fetching job details' });
        }
        
        if(fetchJOB[0].rows && fetchJOB[0].rows.length){
          const _sortArr = fetchJOB[0].rows.reverse();
          const scnDetailsfnName = "fetchModSceDetails";
          const reportfnName = "viewReport";
          
          await Promise.all(_sortArr.map(async each_exec => {
            try {
            var inputs = {    
              "query":"fetchModSceDetails",            
              "param": "modulestatus",
              "executionListId":each_exec.executionListId          
      }
            const fetch_jobStatus = await utils.fetchData(inputs, "reports/fetchModSceDetails", scnDetailsfnName,true);
            // var fetch_jobStatus = await fetchModSceDetails(req,res);

            // var fetch_jobStatus = await runningStatus(req,res);
            logger.info(fetch_jobStatus,' its fetch_jobStatus ');
            if(!fetch_jobStatus){
              logger.error('Job_Status Error...... ');
              res.status(500).json({ code:'500', message: 'error while processing' });
            }
            if(fetch_jobStatus[0].rows && fetch_jobStatus[0].rows.length){
              all_jobstatus.push({"job_status":fetch_jobStatus[0].rows,"exec":each_exec});
            }
            } catch (error) {
              logger.error('Error:', error.message);
              console.log(error,' its errror from promise');
            }
            
          }))

          if(all_jobstatus && all_jobstatus.length){
              for(const job of all_jobstatus){
              try{
              const report_inputs = { reportid: job.job_status[0]["_id"],"report_type":"CALM" };
              // req.query.reportID = job.job_status[0]["_id"];
              // req.query.type = "json";
              // req.query.integration = "CALM"
              // const getReport = await viewReport(req,res);  
              const getReport = await utils.fetchData(report_inputs, "reports/getReport", "viewReport",true);
              console.log("API Response for job:", job, "Response:", getReport,' getting from DAS'); 
              if( getReport[0].rows && Object.keys(getReport[0].rows).length){
                let execHistory = getReport[0].rows;
                // let jobURL = `${req.protocol}://${req.get('host')}/jobmonitor/${job.exec.executionListId}`
                let jobURL = `${req.protocol}://${req.get('host')}/runningStatus?configurekey=${job.exec.executionData.configurekey}&executionListId=${job.exec.executionListId}`
                let logURL = `${req.protocol}://${req.get('host')}/devOpsReport?configurekey=${job.exec.executionData.configurekey}&executionListId=${job.exec.executionListId}`
                testcaseshistory.push({
                    "testCaseId": job.exec.executionData.testcaseRefId || "",
                    "testDataVariantId": "VAR01",
                    "jobId": job.exec.executionListId || "",
                    "jobName": job.exec.executionData.configurename || "",
                    "jobUrl": jobURL || "",
                    "logUrl": jobURL || "",
                    "startedAt": convertDateUTC(execHistory.report.overallstatus.StartTime) || "" ,
                    "startedBy": "Automation",
                    "endedAt": convertDateUTC(execHistory.report.overallstatus.EndTime) || "",
                    "resultStatus": execHistory.report.overallstatus.overallstatus === "Pass" ? "successful": "failed",
                    "message": execHistory.report.overallstatus.overallstatus === "Pass" ? "Automated Execution" : "Execution failed due to some issues",
                    "language": "en",
                    "error":null
                })
                // return testCaseObj; // Resolve the promise
              }
            //   else {
            //     return false; // Resolve the promise with false if there is no data
            // }
            }
            catch (error) {
              console.error("Error fetching data:", error.message);
              throw error;
          } 
            };
            console.log(testcaseshistory,' its testcaseshistory');
                
          }
          
        
        }
        if(testcaseshistory && testcaseshistory.length){
          send_res.testcaseshistory = testcaseshistory;
        }
        logger.info("send response : "+JSON.stringify(send_res))
        return res.status(200).send(send_res);
 
    } catch (error) {
        logger.error('Execution_History Error: ', error.message);
        return res.status(500).json({ code:'500', message: 'error while processing' });
    }
  };

   function convertDateUTC(dateStr) {
    let convertedDate = ""
    if(dateStr){
      const dateParts = dateStr.split(" ");
      const date = dateParts[0];
      const time = dateParts[1];

      const [year, month, day] = date.split("-");
      const [hour, minute, second] = time.split(":");
      const datetime = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
      // console.log(datetime.toISOString(),' IST date');
      // converting the time from IST to UTC
      const IST_to_UTC = new Date(datetime.getTime() - (5 * 60 * 60 * 1000) - (30 * 60 * 1000));
      // Format the datetime to ISO 8601 format
      convertedDate = IST_to_UTC.toISOString();
      // console.log(convertedDate,' UTC date');
    }
    return convertedDate;
  }


  exports.Scope_Changed = async function (req, res) {
 
    logger.info("ALM Scope Change service called");
    try {
      logger.info("request payload : "+ JSON.stringify(req.body));
      var send_res = { 'data':
      [
          {
            "process": req.body[0].process,
            "processGlobalId": req.body[0].processGlobalId,
            "created": true
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
        logger.info("send response : "+JSON.stringify(req.body))
        res.status(201).send(send_res.data);
 
    } catch (error) {
        logger.error('Scope_Changed Error: ', error.message);
        res.status(500).json({ code:'500', message: 'error while processing' });
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

      // Updating TestSuite Details
      const userInfo = { "userid": req.session.userid, "username": req.session.username, "role": req.session.activeRoleId };
      var batchDetails = req.body.batchDetails;
      var overallstatusflag = "success";
      for (const testsuite of batchDetails) {
        var inputs = {
          "query": "updatetestsuitedataquery",
          "conditioncheck": testsuite.conditioncheck,
          "donotexecute": testsuite.donotexecute,
          "getparampaths": testsuite.getparampaths,
          "testscenarioids": testsuite.testscenarioids,
          "modifiedby": userInfo.userid,
          "modifiedbyrole": userInfo.role,
          "testsuiteid": testsuite.testsuiteid,
          "name": testsuite.testsuitename,
          "accessibilityParameters": testsuite.accessibilityParameters
        };
        const TestSuiteResult = await utils.fetchData(inputs, "suite/updateTestSuite_ICE", "updateTestSuite_ICE")
        if (TestSuiteResult == "fail") overallstatusflag = "fail";
      }
      
      // Create Execution Profile
      const createProfileDoc = await generateExeProfile(req.body);
      createProfileDoc.executionData.testcaseRefId = flag && mappedDetails[0].testcaseId && mappedDetails[0].testcaseId.length ? mappedDetails[0].testcaseId[0] : '';
      const fnName = "storeConfigureKey";
      logger.info("Inside UI Service: " + fnName);

      const exe_inputs = {
        "executionData": createProfileDoc.executionData,
        "session": req.session,
        "query": "saveConfigureKey"
      };
      
      const status = await utils.fetchData(exe_inputs, "devops/configurekey", fnName);
      req.body.executionData = createProfileDoc.executionData;
      if (status == "fail" || status == "forbidden") return res.send("fail");
      else if(req.body.executionData.isExecuteNow){
        req['body'] = {"key":req.body.executionData.configurekey,"isExecuteNow":req.body.executionData.isExecuteNow}
        let result = await execAutomation(req, res);
        if(result.status == 'pass') result.status = 'success'
        return res.send(result.status);
      }
      // if testsuite and execution profile create/updated mapping details will be saved here
      if(overallstatusflag === "success" && status === "success"){
        for (let i=0; i<mappedDetails.length; i++) {
          let itr = mappedDetails[i];
          let inputs = {
            "testscenarioid": itr.scenarioId,
            'projectid': itr.projectId,
            "projectname": itr.projectName,
            'testname': itr.testCaseName,
            'testCaseDescription': itr.testCaseDescription,
            "testid":itr.testcaseId,
            "type":"CALM",
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
      }
      
      if (!flag) return res.status(statusCode).json({error:statusMessage});
      res.status(statusCode).json({message:statusMessage});
    } catch (exception) {
      logger.error("Error occurred in ALM/"+fnName+":", exception.message);
      res.status(500).json({message:exception.message});
    }
  };

  function GenerateRandomName(keyName){
    const randomString = Math.random().toString(36).substring(2,8);
    return `${keyName}_${randomString}`;
  }
  function generateExeProfile(reqData) {
    const batchInfo = reqData.batchDetails;
    var prepareBatchObj = [];
    batchInfo.forEach((obj,objIndex) => {
      prepareBatchObj.push({
                "scenarioTaskType": "disable",
                "testsuiteName": obj.testsuitename,
                "testsuiteId": obj.mindmapid,
                "batchname": "",
                "versionNumber": 0,
                "appType": "SAP",
                "domainName": "Banking",
                "projectName": obj.projectName,
                "projectId": obj.projectId,
                "releaseId": "R1",
                "cycleName": "C1",
                "cycleId": obj.cycleId,
                "scenarionIndex": [
                    1
                ],
                "suiteDetails":[]
      })
      
      if(obj.testscenarioids.length){
        obj.testscenarioids.forEach((scn,scnIndex) => {
          prepareBatchObj[objIndex].suiteDetails.push({
            "condition": 0,
            "dataparam": [
                ""
            ],
            "scenarioName": obj.scenarioname[scnIndex],
            "scenarioId": scn,
            "accessibilityParameters": []
          })
        })
      }
    });
    
    const generateExe = {
      donotexe: {
        current: batchInfo.reduce((acc, obj) => {
          acc[obj.mindmapid] = [0];
          return acc;
        }, {})
      }
    };
  
    const executionProfile = {
      "executionData": {
        "type": "",
        "poolid": "",
        "targetUser": "",
        "source": "task",
        "exectionMode": "serial",
        "executionEnv": "default",
        "browserType": [
            "1"
        ],
        "configurename": GenerateRandomName('CALM'),
        "executiontype": "asynchronous",
        "selectedModuleType": "normalExecution",
        "configurekey": reqData.configurekey,
        "isHeadless": false,
        "avogridId": "",
        "avoagents": [],
        "integration": {
            "alm": {
                "url": "",
                "username": "",
                "password": ""
            },
            "qtest": {
                "url": "",
                "username": "",
                "password": "",
                "qteststeps": ""
            },
            "zephyr": {
                "url": "",
                "username": "",
                "password": ""
            },
            "azure": {
                "url": "",
                "username": "",
                "password": ""
            }
        },
        "batchInfo": prepareBatchObj,
        // "donotexe": generateExe.donotexe,
        "donotexe": reqData.donotexe,
        "scenarioFlag": false,
        "isExecuteNow": false,
        "emailNotificationSender": "avoassure-alerts@avoautomation.com",
        "emailNotificationReciever": null,
        "isNotifyOnExecutionCompletion": true,
        "isEmailNotificationEnabled": false,
        "execType": false,
        "type":"CALM"
    }
    }
    return executionProfile;
  }

  exports.viewALM_MappedList_ICE = async (req, res) => {
    // console.log(args);
	const fnName = "viewALM_MappedList_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		var userid = req.session.userid;
            var inputs = {
                "userid": userid,
                "query": "almdetails"
            };
		const result = await utils.fetchData(inputs, "qualityCenter/viewIntegrationMappedList_ICE", fnName);
		if (result == "fail") res.send('fail');
		else res.send(result);
	} catch (exception) {
		logger.error("Error occurred in zephyr/"+fnName+":", exception.message);
		res.send("fail");
	}
};