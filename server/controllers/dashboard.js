// @author : Mukul Saini
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl="http://127.0.0.1:1990/";
var async = require('async');
var fs = require('fs');
var https = require('https');
var uuidV4 = require('uuid/v4');
var express = require('express');
var certificate = fs.readFileSync('server/https/server.crt','utf-8');

/* Send queries to Neo4J/ICE API. */
var reqToAPI = function(d,u,p,callback) {
  try{
    var data = JSON.stringify(d);
    var result="";
    var postOptions = {host: u[0], port: u[1], path: p, method: 'POST',ca:certificate,checkServerIdentity: function (host, cert) {
      return undefined; },headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)}};
      postOptions.agent= new https.Agent(postOptions);
      var postRequest = https.request(postOptions,function(resp){
        resp.setEncoding('utf-8');
        resp.on('data', function(chunk) {result+=chunk;});
        resp.on('end', function(chunk) {callback(null,resp.statusCode,result);});
      });
      postRequest.on('error',function(e){callback(e.message,400,null);});
      postRequest.write(data);
      postRequest.end();
    }catch(ex){
      console.log(ex);
    }

  };

  function isSessionActive(req, res){
    if(req.cookies['connect.sid'] != undefined){
      var sessionCookie = req.cookies['connect.sid'].split(".");
      var sessionToken = sessionCookie[0].split(":");
      sessionToken = sessionToken[1];
    }
    return sessionToken != undefined && req.session.id == sessionToken
  }

  exports.loadDashboard = function(req, res){
    try {
      if(isSessionActive(req, res)){
        var IP = req.headers.host.split(":")[0];
        //req.connection.servername;//localAddress.split(":")[req.connection.localAddress.split(":").length-1];
        var client = require("jsreport-client")("https://"+IP+":8001/");
        client.render({
          template: {
            shortid: "ByCt0KGo-",
            recipe: "html",
            engine: "handlebars"
          },
          data: {
            "over": req.body.testData.executionDetails,
          }
        }, function(err, response){
          if(err) {
            console.log('Error when trying to render report:', err);
            res.send("fail");
          }else{
            try{
              response.pipe(res);
            }catch(exception){
              console.log(exception);
              res.send("fail");
            }
          }
        });
      }else{
        res.send("Invalid Session");
      }
    }catch (e) {
      console.log(exception);
      res.sed("fail");
    }
  }

  function getTasksData(req, res, projIds, callback){
    var qList=[];
    var urlData=req.get('host').split(':');
    projIds.forEach((id)=>{
      qList.push({"statement":"MATCH (n:TASKS) where n.parent CONTAINS '"+id+"' RETURN n"});
    })

    reqToAPI({"data":{"statements":qList}},urlData,'/neo4jAPI', function(err,status,result){
      if(err) res.status(status).send(err);
      else if(status!=200) res.status(status).send(result);
      else{
        var jsonData=JSON.parse(result);
        callback(jsonData);
      }
    });
  }
  function getProjectNames(projectID, allExecutionData, callback){
    inputs = { "projectid":projectID, "query":"getprojectname"};
    args = {data:inputs, headers:{"Content-Type" : "application/json"}}

    client.post(epurl+'create_ice/getProjectIDs_Nineteen68', args,
    function(projectDetails, response){
      allExecutionData.projectDetails[projectID] = projectDetails.rows[0].projectname;
      callback(allExecutionData);
    });

  }

  function getExecutionData(req, res, projectIds, callback){
    var arr = [];
    var allExecutionData = {
      projectDetails: {},
      releaseDetails:{},
      cycleDetails: {},
      testsuiteDetails: {}
    };

    async.each(projectIds, function(projectId, getCycleIds){
      console.log("executing project id, ", projectId );
      inputs = {
        "projectid":projectId,
        "query":"releasesUnderProject"
      };

      args = {
        data:inputs,
        headers:{"Content-Type" : "application/json"}
      };

      client.post(epurl+"dashboard/getAllSuites_ICE", args,
      function(releaseIds, response){
        console.log("releaseIds : ", releaseIds.rows);
        let releaseIdsArr = releaseIds.rows;
        async.each(releaseIdsArr, function(releaseId, getTestsuiteId){
          console.log("executing release id, ", releaseId );
          allExecutionData.releaseDetails[releaseId.releaseid] = releaseId.releasename;
          inputs = {
            "releaseid":releaseId.releaseid,
            "query":"cycleidUnderRelease"
          };

          args = {
            data:inputs,
            headers:{"Content-Type" : "application/json"}
          };
          client.post(epurl+"dashboard/getAllSuites_ICE", args,
          function(cycleIds, response){
            console.log("cycleids : ", cycleIds.rows);
            let cycleIdsArr = cycleIds.rows;
            async.each(cycleIdsArr, function(cycleId, doneFetchingTestsuiteId){
              console.log("executing cycle id, ", cycleId );
              allExecutionData.cycleDetails[cycleId.cycleid] = cycleId.cyclename;
              inputs = {
                "cycleid":cycleId.cycleid,
                "query":"suitesUnderCycle"
              };

              args = {
                data:inputs,
                headers:{"Content-Type" : "application/json"}
              };

              client.post(epurl+"dashboard/getAllSuites_ICE", args,
              function(testsuiteIds, response){
                console.log("testsuiteIds : ", testsuiteIds.rows);
                let testsuiteIdsArr = testsuiteIds.rows;
                async.each(testsuiteIdsArr, function(testsuiteId, doneFetchingExecutionTime){
                  console.log("executing testsuiteId, ", testsuiteId );
                  allExecutionData.testsuiteDetails[testsuiteId.testsuiteid] = testsuiteId.testsuitename;
                  inputs = {
                    "suiteid":testsuiteId.testsuiteid,
                  };

                  args = {
                    data:inputs,
                    headers:{"Content-Type" : "application/json"}
                  };

                  client.post(epurl+'reports/getSuiteDetailsInExecution_ICE', args,
                  function(executionTime, response){
                    console.log("executionTime",executionTime.rows);
                    var ex = 0;
                    var count = 0;
                    executionTime.rows.forEach(function(e){
                      var dStart = new Date(e.starttime);
                      var dEnd = new Date(e.endtime);
                      ex = ex + dEnd.getTime() - dStart.getTime() - 19800000;
                      count++;
                    });

                    var json = {
                      pj : projectId,
                      rl : releaseId.releaseid,
                      cy : cycleId.cycleid,
                      ts :testsuiteId.testsuiteid,
                      tsn : testsuiteId.testsuitename,
                      ex : ex,
                      times : count
                    }
                    arr.push(json);
                    doneFetchingExecutionTime();
                  });
                }, function(){
                  console.log("done fetching execution time for test suite id", projectId);
                  doneFetchingTestsuiteId();
                })
              });
            }, function(){
              console.log("done fetching testsuite ids for cycleId of releaseId: "+ releaseId.releaseid);
              getTestsuiteId();
            });
          });
        }, function(err){
          console.log("all release ids of a project with "+projectId+" completed fetching cycleIds");
          getProjectNames(projectId, allExecutionData, function(data){
            allExecutionData.projectDetails = data.projectDetails;
            getCycleIds();
          });
        });
      });
    }, function(err){
      console.log("All project ids got completed");
      allExecutionData.executionDetails = arr;
      callback(allExecutionData);
    });
  }

  exports.loadDashboardData = function(req, res){
    try {
      var projJson = {}
      if (isSessionActive(req,res)) {
        var user_id = req.body.userid;
        var jsonData;
        inputs = { "userid":user_id, "query":"getprojids"};
        args = {data:inputs, headers:{"Content-Type" : "application/json"}}
        client.post(epurl+"create_ice/getProjectIDs_Nineteen68", args,
        function (result, response) {
          try{
            let projectIds = result.rows[0].projectids;
            var arr = [];
            async.parallel([
              function ( callback ) {
                //console.log("hellosads");
                getTasksData(req, res, projectIds, function(data){
                  jsonData = data;
                  callback();
                });
              },
              function (callback) {
                getExecutionData(req, res, projectIds, function(data){
                  arr = data;
                  callback();
                });
              }
            ], function ( error, results ) {

              res.send({
                eData : arr,
                tData : jsonData
              })
            });
          }catch(exception){
            console.log(exception);
            res.send("fail");
          }
        });
      }else{
        res.send("Invalid Session")
      }
    }catch (e) {
      console.log(e);
      res.send('fail')
    }
  }


  exports.loadDashboard_2 = function(req, res){
    try {
      if(isSessionActive(req, res)){
        var IP = req.headers.host.split(":")[0];
        //req.connection.servername;//localAddress.split(":")[req.connection.localAddress.split(":").length-1];
        console.log("\n\n\n\n\n\n\n ", req.body);
        var client = require("jsreport-client")("https://"+IP+":8001/");
        client.render({
          template: {
            shortid: "rk00qKOn-",
            recipe: "html",
            engine: "handlebars"
          },
          data: {
            "pieChartID": req.body.chart_id,
            "labels" : req.body.labels,
            "values" : req.body.values
          }
        }, function(err, response){
          if(err) {
            console.log('Error when trying to render report:', err);
            res.send("fail");
          }else{
            try{
              response.pipe(res);
            }catch(exception){
              console.log(exception);
              res.send("fail");
            }
          }
        });
      }else{
        res.send("Invalid Session");
      }
    }catch (e) {
      console.log(exception);
      res.sed("fail");
    }
  }
