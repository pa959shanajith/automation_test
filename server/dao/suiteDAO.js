/**
 * Dependencies.
 */
var Hapi = require('hapi');
var Joi = require('joi');
var dbConnICE = require('../../server/config/icetestautomation');
var cassandra = require('cassandra-driver');
var cb = require('callback');
var fs = require('fs');
var myserver = require('../../server.js');
var async = require('async');
var uuid = require('uuid-random');
var desingdao = require('../dao/DesignDao')

module.exports = {
	/**
	 * @author vishvas.a
	 * reading testSuite data from icetestautomation keyspace
	 */
	readTestSuite_ICE: function readTestSuite_ICE(req, cb, data){
		/*
		 * base output elements
		 */
		var outexecutestatus=[];
		var outcondition=[];
		var outdataparam=[];
		var outscenarioids=[];
		/*
		 * base request elements
		 */
		var requiredtestsuiteid=req.payload.testsuiteid;
		var requiredcycleid=req.payload.cycleid;
		/*var requiredtestsuiteid="13bbacaf-82c7-4c4a-9f91-0933462b10d4";
		var requiredcycleid="e6e5b473-34cd-4963-9bda-cb78c727e413";*/
		/*
		 * complete response data
		 */
		var responsedata={
				executestatus: [],
				condition: [],
				dataparam:[],
				scenarioids:[]
		};

		/*
		 * Query 1 fetching the donotexecute,conditioncheck,getparampaths,testscenarioids
		 * based on testsuiteid,testsuitename and cycleid
		 */

		var getTestSuites="select donotexecute,conditioncheck,getparampaths,testscenarioids from testsuites where testsuiteid= "+requiredtestsuiteid+" and cycleid="+requiredcycleid;
		//var getTestSuites="select donotexecute,condtitioncheck,getparampaths,testscenarioids from testsuites where testsuiteid= 13bbacaf-82c7-4c4a-9f91-0933462b10d4 AND cycleid=e6e5b473-34cd-4963-9bda-cb78c727e413 and testsuitename='Dev Suite 1'"; 
		dbConnICE.execute(getTestSuites, function (err, result) {
			if (err) {
				var flag = "Error in readTestSuite_ICE : Fail";
				cb(null, flag);
			}else {
				for (var i = 0; i < result.rows.length; i++) {
					outexecutestatus=result.rows[i].donotexecute;
					outcondition=result.rows[i].conditioncheck;
					outdataparam=result.rows[i].getparampaths;
					outscenarioids=result.rows[i].testscenarioids;
				}
				responsedata.executestatus=outexecutestatus;
				responsedata.condition=outcondition;
				responsedata.dataparam=outdataparam;
				responsedata.scenarioids=outscenarioids;
				cb(null, responsedata);
			}
		});
	},

	/**
	 * @author vishvas.a
	 * reading Scenario data from icetestautomation keyspace
	 */
	readTestScenarios_ICE: function readTestScenarios_ICE(req, cb, data){
		/*
		 * internal variables
		 */
		var outtestcaseids=[];
		var outprojectid="";
		/*
		 * base output elements
		 */
		var outtestscenarioname="";
		var outprojectname="";
		var outtestcasenames=[];
		/*
		 * base request elements
		 */
		var requestedtestscenarioid=req.payload.testscenarioid;
		var requestedtestscenarioname=req.payload.testscenarioname;

		/*
		 * complete response data
		 */
		responsereadTestScenarios={
				projectname:"",
				testscenarioname:"",
				testcasenames:[]
		}

		/*
		 * Query 1 fetching the testcasename,screenname,projectname
		 * based on testscenarioid
		 */
		//fetching the projectid and testcaseids
//		var getProjectTestcaseids="select projectid,testcaseids from testscenarios where " +
//		"testscenarioname ='"+requestedtestscenarioname+"' AND testscenarioid="+requestedtestscenarioid+" ALLOW FILTERING";
		var getProjectTestcaseids="select projectid,testcaseids,testscenarioname from testscenarios where testscenarioid=f432bd8c-ccc3-462f-9281-40fded159eeb ALLOW FILTERING;"
			dbConnICE.execute(getProjectTestcaseids, function (errgetProjectTestcaseids, testscenariosresult) {
				var d = new Date();
				console.log("1",d.toLocaleTimeString());
				if (errgetProjectTestcaseids) {
					console.log("<1");
					var flag = "Error in getProjectTestcaseids : Fail";
					cb(null, flag);
				}else {
					console.log("2");
					async.each(testscenariosresult.rows, function (row, callback) {
						outprojectid=row.projectid;
						// console.log(row.testcaseids.length);
						outtestcaseids=row.testcaseids[4];
						outtestscenarioname=row.testscenarioname;
					});
					//fetching the project name
					console.log(outprojectid,outtestcaseids,outtestscenarioname);
					var getProjectname="select projectname from projects where projectid="+outprojectid;
					console.log("3");
					dbConnICE.execute(getProjectname, function (errgetProjectname, getProjectnameresult) {
						if (errgetProjectname) {
							console.log("<3");
							var flag = "Error in getProjectname : Fail";
							cb(null, flag);
						}else{
							console.log("4");
							for(var projectindex=0;projectindex<getProjectnameresult.rows.length;projectindex++){
								outprojectname=getProjectnameresult.rows[projectindex].projectname;
							}
							console.log("This is the value:",outtestcaseids[0]);
							//  async.each(outtestcaseids, function (row, callback) {
							console.log("outtestcaseids.length:",outtestcaseids.length);
							var onewId = [];
							for(var ids=0;ids<outtestcaseids.length;ids++){
								onewId.push(outtestcaseids[ids]);
								//console.log(outtestcaseids[ids].Uuid);
							}
							console.log(onewId[0].Uuid);
							//  });


							for(var tcindex=0;tcindex<outtestcaseids.length;tcindex++){
								gettestCaseName="select testcasename from testcases where testcaseid="+outtestcaseids[tcindex];
								var eachtestcasename="";
								dbConnICE.execute(gettestCaseName, function (err, gettestCaseNameresult) {
									if (err) {
										var flag = "Error in gettestCaseName : Fail";
										cb(null, flag);
									}else{
										for(var tnindex=0;tnindex<gettestCaseNameresult.rows.length;tnindex++){
											outtestcasenames.push(gettestCaseNameresult.rows[tnindex].testcasename);
											console.log("It entered here111111:",outtestcasenames);
										}
									}
								});
							}

							console.log(outtestcasenames);
							console.log(outtestscenarioname);
							console.log(outprojectname);
						}
					});
				}
			});	
		var d1 = new Date();
		console.log("This has got executed.",d1.toLocaleTimeString());
	},

	/**
	 * @author vishvas.a
	 * updating Suite data for icetestautomation keyspace
	 */
	updateTestSuite_ICE: function updateTestSuite_ICE(req, cb, data){
		/*
		 * internal variables
		 */
		var hasrow=false;
		/*
		 * base request elements
		 */
		var userinfo=req.payload.userinfo;
		var requestedtestscycleid = req.payload.testscycleid;
		var requestedtestsuitename = req.payload.requestedtestsuitename;
		var requestedtestsuiteid = req.payload.requestedtestsuiteid;
		var requestedtestscenarioids = req.payload.testscenarioids;
//		var requestedskucodetestcase = req.payload.skucodetestcase;
//		var requestedtags = req.payload.tags;
		var requestedcondtioncheck = req.payload.condtioncheck;
		var requesteddonotexecute = req.payload.donotexecute;
		var requestedgetparampaths = req.payload.getparampaths;
//		var requestedexecutionids = req.payload.executionids;
//		var requestedversionnumber = req.payload.versionnumber;
//		var requesthistorydetails="update testcase action by "+userinfo.username+" having role:"+userinfo.role+""+
//		" skucodetestcase='"+requestedskucodetestcase+"', tags="+requestedtags+","+
//		" testscenarioids="+requestedtestscenarioids+" versionnumber="+requestedversionnumber;
//		var requestedhistory={date:new Date().getTime(), historydetails:requesthistorydetails};

		// var requestedskucodetestcase="";
		// var requestedtags=[];
		// var requestedversionnumber=2;
		// var requestedtestscycleid="e6e5b473-34cd-4963-9bda-cb78c727e413";
		// var requestedtestsuiteid="13bbacaf-82c7-4c4a-9f91-0933462b10d4";
		/*
		 * Query 1 checking whether the requestedtestsuiteid belongs to the same requestedtestscycleid
		 * based on requested cycleid,suiteid 
		 */
		// requestedtestsuiteid="123";
		var checksuiteexists = "";
		var deleteTestSuiteData = "";
		var updateTestSuiteData = "";
		async.waterfall([
		                 function(callback1){
		                	 //check exists
		                	 checksuiteexists="select testsuiteid from testsuites where cycleid="+requestedtestscycleid;
		                	 dbConnICE.execute(checksuiteexists, function (err, checksuiteexistsresult) {
		                		 if (err) {
		                			 var flag = "Error in Query 1 checksuiteexists: Fail";
		                			 cb(null, flag);
		                		 }else{
		                			 async.forEachSeries(checksuiteexistsresult.rows,function(row,forEachSeriescallback){
		                				 if(row.testsuiteid == requestedtestsuiteid){
		                					 hasrow=true;
		                				 }
		                				 forEachSeriescallback(null,hasrow);
		                			 });
		                		 }
		                		 callback1(null,hasrow);
		                	 });
		                 },
		                 function(actualExecutioncallback){
		                	 if(hasrow){
		                		 async.waterfall([
		                		                  function(deletecallback){
		                		                	  deleteTestSuiteData="DELETE conditioncheck,donotexecute,getparampaths,testscenarioids FROM testsuites "+
		                		                	  "where cycleid="+requestedtestscycleid+
		                		                	  " and testsuitename='"+requestedtestsuitename+"'"+
		                		                	  " and testsuiteid="+requestedtestsuiteid;
		                		                	  dbConnICE.execute(deleteTestSuiteData, function (err, deleteQueryresults) {
		                		                		  if(err){
		                		                			  flag="failed to execute update query: Fail";
		                		                			  cb(err,flag);
		                		                		  }else{
		                		                			  flag="success";
		                		                		  }
		                		                	  });
		                		                	  deletecallback(null,"query1success");
		                		                  },
		                		                  function(value,waterfallquery2callback){
		                		                	  for(var scenarioidindex=0;scenarioidindex<requestedtestscenarioids.length;scenarioidindex++){
		                		                		  updateTestSuiteData="update testsuites set"+
		                		                		  " conditioncheck=conditioncheck+["+requestedcondtioncheck[scenarioidindex]+"], "+
		                		                		  "donotexecute=donotexecute+["+requesteddonotexecute[scenarioidindex]+"], "+
		                		                		  "getparampaths=getparampaths+["+requestedgetparampaths[scenarioidindex]+"], " +
		                		                		  "testscenarioids=testscenarioids+["+requestedtestscenarioids[scenarioidindex]+"], " +
		                		                		  "modifiedby='"+userinfo.username+"', modifiedbyrole='"+userinfo.role+"' "+
		                		                		  "where cycleid="+requestedtestscycleid+" and testsuiteid="+requestedtestsuiteid+
		                		                		  " and testsuitename='"+requestedtestsuitename+"';";
		                		                		  dbConnICE.execute(updateTestSuiteData, function (err, updateQueryresults) {
		                		                			  if(err){
		                		                				  flag="fail";
		                		                				  cb(err,flag);
		                		                			  }else{
		                		                				  flag="success";
		                		                			  }
		                		                		  });
		                		                	  }
		                		                	  waterfallquery2callback(null,"success");
		                		                  }
		                		                  ],
		                		                  function(err,finalcallback){
		                			 cb(null,"success");
		                		 });	
		                	 }
		                 }
		                 ]);
	},

	/**
	 * @author Shreeram
	 * updating Scenario data for icetestautomation keyspace
	 */
	updateTestScenario_ICE: function updateTestScenario_ICE(req, cb, data){
		/*
		 * internal variables
		 */

		/*
		 * base request elements
		 */

		// var userinfo = req.payload.userinfo;
		var requestedtestscycleId = req.payload.cycleId;
		var requestedtestscenarioid = req.payload.testscenarioid;
		var requestedtestscenarioname = req.payload.testscenarioname;
		var requestedmodifiedby = req.payload.modifiedby;
		var requestedmodifiedbyrole = req.payload.modifiedbyrole;
		var requestedmodifiedon = req.payload.modifiedon;
		var requestedskucodetestcase = req.payload.skucodetestcase;
		var requestedtags =  req.payload.tags;
		var requestedetestcaseids =req.payload.testcaseids;
		var requestedprojectid = req.payload.projectid;
		requestedprojectid = '9120ed16-0822-4fad-8979-27cc16975ea6';
		requestedetestcaseids =  ['634068fc-b459-4a7e-b4cb-2e25c0af2f2c','d4f13d90-a53f-4dcd-8513-f883d7742da7'];
		requestedtestscenarioid = 'f432bd8c-ccc3-462f-9281-40fded159eeb';
		requestedtestscenarioname = "Dev Scenario1";
		requestedmodifiedon = new Date().getTime(); 
		requestedmodifiedby = "Shreeram";
		console.log(requestedetestcaseids)
		var delettestcaseids = "delete testcaseids from  testscenarios where projectid="+ requestedprojectid + " and testscenarioid=" + requestedtestscenarioid +" and testscenarioname ='"+requestedtestscenarioname+"';";
		dbConnICE.execute(delettestcaseids, function (err, result) {
			if (err) {
				var flag = "Error in Query 1 delettestcaseids: Fail";
				console.log(err);
				cb(null, flag);
			}else{
				var flag="TestcaseIds Deletion : Success";
				console.log(flag);
				cb(null,flag);
			}
		});

		for (var i = 0; i < requestedetestcaseids.length; i++) {
			var updateTestScenarioData = "update testscenarios set testcaseids=testcaseids+["+ requestedetestcaseids[i]+ "] ,modifiedby ='" +requestedmodifiedby+
			"' , modifiedon = "+requestedmodifiedon+" where projectid ="+ requestedprojectid + " and testscenarioid = "+requestedtestscenarioid+" and testscenarioname = '"+requestedtestscenarioname+"';" ;

			dbConnICE.execute(updateTestScenarioData, function (err, result) {
				if (err) {
					var flag = "Error in Query 1 updateTestScenarioData: Fail";
					console.log(err);
					cb(null, flag);
				}else{
					var flag="updateTestScenarioData updation : Success";
					console.log(flag);
					cb(null,flag);
				}
			});
		}


	},

	ExecuteTestSuite_ICE : function ExecuteTestSuite_ICE(req,cb,data){
		var requestedtestscenarioid = req;
		var testscenarioslist = "select testcaseids from testscenarios where testscenarioid="+requestedtestscenarioid+";";
		var resultstring = [];
		var data = [];
		var resultdata ='';

		var listoftestcasedata = [];
		async.series(
				{	testcaseid: function(callback){
					dbConnICE.execute(testscenarioslist,function(err,result){
						if(err){
							console.log(err);
						}else{
							data = JSON.parse(JSON.stringify(result.rows[0].testcaseids));
							resultdata = data;
							console.log(data);
							callback(err,resultdata);
						}
					});
				},
				testcasesteps : function(callback){

					async.forEachSeries(resultdata, function(quest, callback2) {
						var responsedata={template: "",testcase:[],testcasename:""};

						var testcasestepsquery = "select testcasesteps,testcasename from testcases where testcaseid = "+quest;
						dbConnICE.execute(testcasestepsquery, function(err, answers) {
							if(err){
								console.log(err);
							}else{
								responsedata.template = "";
								responsedata.testcasename = answers.rows[0].testcasename;
								responsedata.testcase = answers.rows[0].testcasesteps;

								listoftestcasedata.push(responsedata);
							}
							callback2(); 
						});
					}, callback);

				}
				},
				function(err,results){
					//data.setHeader('Content-Type','application/json');
					if(err){
						cb(err);
					} 
					else{
						cb(null,JSON.stringify(listoftestcasedata));
					} 
				}

		);
	},



};