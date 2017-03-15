/**
 * Dependencies.
 */
var Joi = require('joi');
var cassandra = require('cassandra-driver');
var async = require('async');
var myserver = require('../../server.js');
var uuid = require('uuid-random');
var dbConnICE = require('../../server/config/icetestautomation');


/**
 * @author vishvas.a	
 * @modifiedauthor shree.p (fetching the scenario names from the scenarios table)
 * this reads the scenario information from the testsuites
 * and testsuites table of the icetestautomation keyspace 
 */
exports.readTestSuite_ICE = function (req, res) {
	//internal variables
	var outexecutestatus=[];
	var outcondition=[];
	var outdataparam=[];
	var outscenarioids=[];
	var outscenarionames = [];
	var outprojectnames = [];
	
	//base request elements
	var requiredtestsuiteid=req.body.testsuiteid;
	var requiredcycleid=req.body.cycleid;
	var requiredtestsuitename = req.body.testsuitename;
	/*var requiredtestsuiteid="13bbacaf-82c7-4c4a-9f91-0933462b10d4";
	var requiredcycleid="e6e5b473-34cd-4963-9bda-cb78c727e413";*/
	//complete response data
	var responsedata={
			executestatus: [],
			condition: [],
			dataparam:[],
			scenarioids:[],
			scenarionames:[],
			projectnames:[]
	};

	/*
	* Query 1 fetching the donotexecute,conditioncheck,getparampaths,testscenarioids
	* based on testsuiteid,testsuitename and cycleid
	*/
	TestSuiteDetails_Module_ICE(req.body,function(err,data){
		if(err){
			console.log(err);
		}else{
			console.log(data);
			async.series({		
			testsuitesdata: function(callback){
			var getTestSuites="select donotexecute,conditioncheck,getparampaths,testscenarioids from testsuites where testsuiteid= "+requiredtestsuiteid+" and cycleid="+requiredcycleid+" and testsuitename='"+requiredtestsuitename+"'";
			//var getTestSuites="select donotexecute,condtitioncheck,getparampaths,testscenarioids from testsuites where testsuiteid= 13bbacaf-82c7-4c4a-9f91-0933462b10d4 AND cycleid=e6e5b473-34cd-4963-9bda-cb78c727e413 and testsuitename='Dev Suite 1'"; 
			dbConnICE.execute(getTestSuites, function (err, result) {
				if (err) {
					var flag = "Error in readTestSuite_ICE : Fail";
					res.send("");
				}else {
					async.forEachSeries(result.rows, function(quest, callback2) {
						
						outscenarioids=quest.testscenarioids;

						if(quest.donotexecute == null){
							var arrTemp = [];
							for(var i=0;i<outscenarioids.length;i++){
								arrTemp.push(1);
							}
							outexecutestatus = arrTemp;
						}else{
						outexecutestatus=quest.donotexecute;
						}

						if(quest.conditioncheck == null){
							var arrTemp = [];
							for(var i=0;i<outscenarioids.length;i++){
								arrTemp.push(0);
							}
							outcondition = arrTemp;
						}else{
						outcondition=quest.conditioncheck;
						}

						if(quest.getparampaths == null){
							var arrTemp = [];
							for(var i=0;i<outscenarioids.length;i++){
								arrTemp.push('');
							}
							outdataparam = arrTemp;
						}else{
						outdataparam=quest.getparampaths;
						}
						
						
						//var responsedata={template: "",testcase:[],testcas	ename:""};
						async.forEachSeries(outscenarioids,function(quest1,callback3){
							// var testcasestepsquery = "SELECT testscenarioname,projectid FROM testscenarios where testscenarioid="+quest1;
							// dbConnICE.execute(testcasestepsquery, function(err, answers) {
							// 	if(err){
							// 		console.log(err);
							// 	}else{
							// 		// var projectnamequery = "SELECT projectname FROM projects where projectid = "+answers.rows[0].projectid+" ALLOW FILTERING;";
							// 		// var runquery = dbConnICE.execute(projectnamequery, function(err, projectnameresult) {if(err){ }else{outprojectnames.push(projectnameresult.rows[0].projectname)}});
							// 		outscenarionames.push(answers.rows[0].testscenarioname);
							// 	}
							// 	callback3(); 
							// });
							/**
							 *  Projectnametestcasename_ICE is a function to fetch testscenario name and project name
							 * 	modified shreeram p on 15th mar 2017
							 * */
							Projectnametestcasename_ICE(quest1,function(err,data){
								if(err){
									console.log(err);
								}else{
									outscenarionames.push(data.testcasename);
									outprojectnames.push(data.projectname);
									
								}
								callback3();
							});
					}, callback2);
				},callback);
				responsedata.executestatus=outexecutestatus;
				responsedata.condition=outcondition;
				responsedata.dataparam=outdataparam;
				responsedata.scenarioids=outscenarioids;
				responsedata.scenarionames = outscenarionames;
				responsedata.projectnames = outprojectnames;
				//cb(null, responsedata);
				}
			});
		},
	},
	function(err,results){
	//data.setHeader('Content-Type','application/json');
	if(err){
		res.send(err);
	} 
	else{
		console.log(responsedata);
		res.send(JSON.stringify(responsedata));
	} 
	})
		}
	});
};

/**
 * Projectnametestcasename_ICE function is to fetch projectname and testscenario
 * created by shreeram p on 15th mar 2017
 *  */ 
function Projectnametestcasename_ICE(req,cb,data){
	var projectid = '';
	var testcaseNproject = {testcasename:"",projectname:""};
	async.series({
		testcasename : function(callback_name){
			var testcasestepsquery = "SELECT testscenarioname,projectid FROM testscenarios where testscenarioid="+req;
			dbConnICE.execute(testcasestepsquery, function(err, answers) {
				if(err){
					console.log(err);
				}else{
					projectid = answers.rows[0].projectid;
					testcaseNproject.testcasename = answers.rows[0].testscenarioname;
					callback_name(null,projectid); 
				}
				
			});
		},
		projectname : function(callback_name){
			var projectnamequery = "SELECT projectname FROM projects where projectid = "+projectid+" ALLOW FILTERING;";
			dbConnICE.execute(projectnamequery, function(err, projectnameresult) {
				if(err){ 

				}else{
					testcaseNproject.projectname = projectnameresult.rows[0].projectname;
					callback_name(err,testcaseNproject)
				}
			});
		}

	},function(err,data){
		cb(null,testcaseNproject);
	})
	
}

/**
 * @author vishvas.a
 * @author vishvas.a modified on 08/03/2017
 * this block of code is used for updating the testsuite details 
 * to the testsuites table of icetestautomation keyspace 
 */
exports.updateTestSuite_ICE = function (req, res) {
	//internal variables
	var hasrow = false;
	var flag = "fail";
	var index=0;
	//base request elements
	var userinfo = req.body.userinfo;
	var requestedtestscycleid = req.body.testscycleid;
	var requestedtestsuitename = req.body.requestedtestsuitename;
	var requestedtestsuiteid = req.body.requestedtestsuiteid;
	var requestedtestscenarioids = req.body.testscenarioids;
	//		var requestedskucodetestcase = req.payload.skucodetestcase;
	//		var requestedtags = req.payload.tags;
	var requestedcondtioncheck = req.body.condtioncheck;
	var requesteddonotexecute = req.body.donotexecute;
	var requestedgetparampaths = req.body.getparampaths;
	var requestedversionnumber=req.body.versionnumber;
	requestedversionnumber = 1;
	//		var requestedexecutionids = req.payload.executionids;
	//		var requestedversionnumber = req.payload.versionnumber;
	//		var requesthistorydetails="update testcase action by "+userinfo.username+" having role:"+userinfo.role+""+
	//		" skucodetestcase='"+requestedskucodetestcase+"', tags="+requestedtags+","+
	//		" testscenarioids="+requestedtestscenarioids+" versionnumber="+requestedversionnumber;
	//		var requestedhistory={date:new Date().getTime(), historydetails:requesthistorydetails};

	/*
	 * Query 1 checking whether the requestedtestsuiteid belongs to the same requestedtestscycleid
	 * based on requested cycleid,suiteid 
	 */
	var checksuiteexists = "";
	var deleteTestSuiteQuery = "";
	var updateTestSuiteData = "";
			checksuiteexists = "select testsuiteid from testsuites where cycleid=" + requestedtestscycleid;
			dbConnICE.execute(checksuiteexists, function (err, checksuiteexistsresult) {
				if (err) {
					var flag = "Error in Query 1 checksuiteexists: Fail";
					//res.send(flag);
				} else {
					if (checksuiteexistsresult.rows[0].testsuiteid == requestedtestsuiteid) {
						deleteTestSuiteQuery = "DELETE conditioncheck,donotexecute,getparampaths,testscenarioids FROM testsuites " +
						"where cycleid=" + requestedtestscycleid +
						" and testsuitename='" + requestedtestsuitename + "'" +
						" and testsuiteid=" + requestedtestsuiteid +" and versionnumber = "+requestedversionnumber;
						deleteSuite(deleteTestSuiteQuery,function(err,response){
							if(response == "success"){
								saveSuite(function(err,response){
									if(err){
										flag = "fail";
										index=index+1;
										if(index == requestedtestscenarioids.length){res.send(flag);}
									}else{
										flag = "success";
										index=index+1;
										if(index == requestedtestscenarioids.length){res.send(flag);}										
									}
								});
							}
						});
					}
				}
			});

	function deleteSuite(deleteTestSuiteQuery,deleteSuitecallback){
		dbConnICE.execute(deleteTestSuiteQuery, function (err, deleteQueryresults) {
			if (err) {
					flag = "failed to execute update query: Fail";
					res.send("fail");
			} else {
					flag = "success";
					deleteSuitecallback(null,flag);
			}
		});
	}
	function saveSuite(saveSuite){
		for (var scenarioidindex = 0; scenarioidindex < requestedtestscenarioids.length; scenarioidindex++) {
			updateTestSuiteData = "update testsuites set" +
				" conditioncheck=conditioncheck+[" + requestedcondtioncheck[scenarioidindex] + "], " +
				"donotexecute=donotexecute+[" + requesteddonotexecute[scenarioidindex] + "], " +
				"getparampaths=getparampaths+[" + requestedgetparampaths[scenarioidindex] + "], " +
				"testscenarioids=testscenarioids+[" + requestedtestscenarioids[scenarioidindex] + "], " +
				"modifiedby='" + userinfo.username + "', modifiedbyrole='" + userinfo.role + "' " +
				"where cycleid=" + requestedtestscycleid + 
				" and testsuiteid=" + requestedtestsuiteid +
				" and testsuitename='" + requestedtestsuitename +
				"' and versionnumber = "+requestedversionnumber+" ;";
			dbConnICE.execute(updateTestSuiteData, function (err, updateQueryresults) {
				if (err) {
					flag="fail";
					saveSuite(flag,null);
				} else {
					flag = "success";
					saveSuite(null,flag);
				}
			});
		}
	}
}


//UpdateTestSscnario Functionality
exports.updateTestScenario_ICE = function (req, res) {

	/*
	 * internal variables
	 */

	/*
	 * base request elements
	 */

	// var userinfo = req.payload.userinfo;
	var requestedtestscycleId = req.body.cycleId;
	var requestedtestscenarioid = req.body.testscenarioid;
	var requestedtestscenarioname = req.body.testscenarioname;
	var requestedmodifiedby = req.body.modifiedby;
	var requestedmodifiedbyrole = req.body.modifiedbyrole;
	var requestedmodifiedon = req.body.modifiedon;
	var requestedskucodetestcase = req.body.skucodetestcase;
	var requestedtags = req.body.tags;
	var requestedetestcaseids = req.body.testcaseids;
	var requestedprojectid = req.body.projectid;
	requestedprojectid = '9120ed16-0822-4fad-8979-27cc16975ea6';
	requestedetestcaseids = ['634068fc-b459-4a7e-b4cb-2e25c0af2f2c', 'd4f13d90-a53f-4dcd-8513-f883d7742da7'];
	requestedtestscenarioid = 'f432bd8c-ccc3-462f-9281-40fded159eeb';
	requestedtestscenarioname = "Dev Scenario1";
	requestedmodifiedon = new Date().getTime();
	requestedmodifiedby = "Shreeram";
	console.log(requestedetestcaseids)
	var delettestcaseids = "delete testcaseids from  testscenarios where projectid=" + requestedprojectid + " and testscenarioid=" + requestedtestscenarioid + " and testscenarioname ='" + requestedtestscenarioname + "';";
	dbConnICE.execute(delettestcaseids, function (err, result) {
		if (err) {
			var flag = "Error in Query 1 delettestcaseids: Fail";
			console.log(err);
			//cb(null, flag);
			res.send(flag);
		} else {
			var flag = "TestcaseIds Deletion : Success";
			console.log(flag);
			//cb(null,flag);
			res.send(flag);
		}
	});

	for (var i = 0; i < requestedetestcaseids.length; i++) {
		var updateTestScenarioData = "update testscenarios set testcaseids=testcaseids+[" + requestedetestcaseids[i] + "] ,modifiedby ='" + requestedmodifiedby +
			"' , modifiedon = " + requestedmodifiedon + " where projectid =" + requestedprojectid + " and testscenarioid = " + requestedtestscenarioid + " and testscenarioname = '" + requestedtestscenarioname + "';";

		dbConnICE.execute(updateTestScenarioData, function (err, result) {
			if (err) {
				var flag = "Error in Query 1 updateTestScenarioData: Fail";
				console.log(err);
				//cb(null, flag);
				res.send(flag);
			} else {
				var flag = "updateTestScenarioData updation : Success";
				console.log(flag);
				//cb(null,flag);
				res.send(flag);
			}
		});
	}
}
//UpdateTestSscnario Functionality


//ExecuteTestSuite Functionality
exports.ExecuteTestSuite_ICE = function (req, res) {
	var scenarioIdList = [];
				var scenarioIdList = [];
				var dataparamlist = [];
				var conditionchecklist = [];
				var browserType = req.body.browserType;
				var testsuiteid = req.body.testsuiteId
				var scenarioIdinfor = '';
				var scenariotestcaseobj = {};
				var listofscenarioandtestcases = [];
				var testsuitedetailslist = [];
				var testsuiteidslist = [];
				var testsuitedetails = { "suitedetails": "", "testsuiteIds": "" };
				var json = req.body.jsonData;
				var executionjson = { "scenarioIds": [], "browserType": [] };
				//var json = "[{ 	\"scenarioname\": \"Scenario Name1\", 	\"scenarioid\": \"72bcc08e-15a7-4de6-ad59-389aee2230cb\", 	\"conditon\": [\"false\"], 	\"dataParam\": \"http://10.41.31.92:3000/execute\", 	\"executeStatus\": [\"1\"] }]";

				var json1 = JSON.parse(json);
				var executionId = uuid();
				var starttime = new Date().getTime();
		async.forEachSeries(json1, function (itr, callback3) {
					scenarioIdList.push(itr.scenarioids);
					dataparamlist.push(itr.dataParam);
					conditionchecklist.push(itr.condition);
					scenarioIdinfor = itr.scenarioids;
					TestCaseDetails_Suite_ICE(scenarioIdinfor,function(err,data){
						
						if(err){
							console.log(err);
						}else{
							scenariotestcaseobj[scenarioIdinfor] = data;
							listofscenarioandtestcases.push(scenariotestcaseobj);
							
						}
						callback3(); 
					})
		}, function (callback3) {
		executionjson[testsuiteid] = listofscenarioandtestcases;
		executionjson.scenarioIds = scenarioIdList;
		executionjson.browserType = browserType;
		executionjson.condition = conditionchecklist;
		executionjson.dataparampath = dataparamlist;
		testsuitedetailslist.push(executionjson)

		testsuiteidslist.push(testsuiteid);
		testsuitedetails.suitedetails = testsuitedetailslist;
		testsuitedetails.testsuiteIds = testsuiteidslist;
		testsuitedetails.executionId = executionId;
		//					console.log(JSON.stringfy(testsuitedetails));
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		if('allSocketsMap' in myserver && ip in myserver.allSocketsMap){
			var mySocket = myserver.allSocketsMap[ip];
			mySocket._events.result_executeTestSuite = [];
			mySocket.emit('executeTestSuite', testsuitedetails);
			mySocket.on('result_executeTestSuite', function (resultData) {

				if(resultData !="success" && resultData != "Terminate"){
						var scenarioid =resultData.scenarioId;
						var executionid = resultData.executionId;
						var reportdata = resultData.reportData; 
						var req_report = resultData.reportdata;
						var req_reportStepsArray = reportdata.rows;
						var req_overAllStatus = reportdata.overallstatus
						var req_browser = reportdata.overallstatus[0].browserType;
						reportdata = JSON.stringify(reportdata).replace(/'/g,"''");
						reportdata = JSON.parse(reportdata);

						var insertReport = "INSERT INTO reports (reportid,executionid,testsuiteid,testscenarioid,browser,modifiedon,status,report) VALUES (" + uuid() + "," + executionid + "," + testsuiteid + ","
							+ scenarioid + ",'" + req_browser + "'," + new Date().getTime() + ",'" + resultData.reportData.overallstatus[0].overallstatus + "','" + JSON.stringify(reportdata)  +"')";
						var dbquery =	dbConnICE.execute(insertReport, function (err, result) {if (err) {flag ="fail";}else {flag = "success";}});

						var insertIntoExecution = "INSERT INTO execution (testsuiteid,executionid,starttime,endtime) VALUES ("
						+testsuiteid+","+executionid+","+starttime+","+new Date().getTime()+");"
						var dbqueryexecution =	dbConnICE.execute(insertIntoExecution, function (err, resultexecution) {if (err) {flag ="fail";}else {flag = "success";}});
						//console.log("this is the value:",resultData);

						}
						if(resultData =="success" || resultData == "Terminate")
						res.send(resultData);
			
			//}
			});
		}else{
			console.log("Socket not Available");
			res.send("unavailableLocalServer");
		}
		
	});
}


	function TestCaseDetails_Suite_ICE(req,cb,data){
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
	}
exports.getCycleNameByCycleId = function (req, res) {
	var getCycleName = "select cyclename from cycles where releaseid = "+req.body.releaseId+" and cycleid = "+req.body.cycleId+"";
		dbConnICE.execute(getCycleName, function(err, result) {
							if(err){ console.log(err);
							}
							else{
								if(result.rows.length > 0)
								{
										for (var i = 0; i < result.rows.length; i++) {
										    cycleName = result.rows[i].cyclename;
								          }	
								}
								else{
									cycleName = "";
								}
									res.send(cycleName);
							}
		});
}
	//getReleaseName Functionality
	exports.getReleaseNameByReleaseId_ICE = function (req, res) {
		var releaseId = req.body.releaseId;
		var projectId = req.body.projectId;
		var getReleaseName = "select releasename from icetestautomation.releases where releaseid = "+releaseId+" and projectid = "+projectId+"";
		console.log("sd", getReleaseName)
		dbConnICE.execute(getReleaseName, function(err, result) {
			//console.log("Result", result);
			if(result.rows.length > 0)
								{
			  for (var i = 0; i < result.rows.length; i++) {
                  releaseName = result.rows[i].releasename;
                
              }
								}
								else{
									releaseName = "";
								}
								  res.send(releaseName);
		});
	  }

//ExecuteTestSuite Functionality


	/**
	 * Service to fetch all the testcase,screen and project names for provided scenarioid
	 * @author Shreeram
	 */
	exports.getTestcaseDetailsForScenario_ICE = function (req, res) {

		var requiredtestscenarioid = req.body.testScenarioId;
		//var requiredtestscenarioname = req.testScenarioName;

		testcasedetails_testscenarios(requiredtestscenarioid,function(err,data){
			if(err){
				res.send("fail");
			}else{
				console.log(data);
				res.send(JSON.stringify(data));
			}
		})



	}

	//Function to fetch all the testcase,screen and project names for provided scenarioid
	function testcasedetails_testscenarios(req,cb,data){
		var testcasedetails = {testcasename:"",screenname:"",projectname:""};
		var testcaseids = [];
		var screenidlist = [];
		var testcasenamelist = [];
		var screennamelist=[];
		var projectidlist = [];
		var projectnamelist = [];
		async.series({
			testscenariotable:function(callback){
				var testscenarioquery = "SELECT testcaseids FROM testscenarios where testscenarioid="+req;
				dbConnICE.execute(testscenarioquery,function(err,testscenarioresult){
					if(err){
						console.log(err);
					}else{
						testcaseids = testscenarioresult.rows[0].testcaseids;
					}                                              
					callback(err,testcaseids);                                                              
				});
			},
			testcasetable:function(callback){
				var testcasename = '';
				async.forEachSeries(testcaseids,function(itr,callback2){
					var testcasequery = "SELECT testcasename,screenid FROM testcases WHERE testcaseid="+itr;
					dbConnICE.execute(testcasequery,function(err,testcaseresult){
						if(err){
							console.log(err);
						}else{
							testcasenamelist.push(testcaseresult.rows[0].testcasename);
							screenidlist.push(testcaseresult.rows[0].screenid);

						}
						callback2();
					});

				},callback);
			},
			screentable:function(callback){
				async.forEachSeries(screenidlist,function(screenitr,callback3){
					var screenquery = "SELECT screenname,projectid FROM screens where screenid="+screenitr;
					dbConnICE.execute(screenquery,function(err,screenresult){
						if(err){
							console.log(err);
						}else{
							screennamelist.push(screenresult.rows[0].screenname);
							projectidlist.push(screenresult.rows[0].projectid);

						}
						callback3();         
					});


				},callback);

			},
			projecttable:function(callback){
				async.forEachSeries(projectidlist,function(projectitr,callback4){
					var projectquery = "SELECT projectname FROM projects where projectid="+projectitr;
					dbConnICE.execute(projectquery,function(err,projectresult){
						if(err){
							console.log(err);
						}else{
							projectnamelist.push(projectresult.rows[0].projectname);

							//projectidlist.push(screenresult.rows[0].projectid);
						}
						callback4();

					});
				},callback)
				//callback(projectidlist);

			}
		},function(err,data){
			if(err){
				console.log(err);
				cb(err,"fail");
			}else{
				var resultdata = {testcasenames:[],testcaseids:[],screennames:[],screenids:[],projectnames:[],projectids:[]};
				resultdata.testcasenames = testcasenamelist;
				resultdata.testcaseids = testcaseids;
				resultdata.screennames = screennamelist;
				resultdata.screenids = screenidlist
				resultdata.projectnames = projectnamelist;
				resultdata.projectids = projectidlist;
				cb(err,resultdata);
			}
		});
	}

	function TestSuiteDetails_Module_ICE(req,cb,data){
//	var requestedtestscenarioid = req;
	var requiredcycleid = req.cycleid;
	var requiredtestsuiteid = req.testsuiteid;
	var requiredtestsuitename = req.testsuitename;
	//var testscenarioslist = "select testcaseids from testscenarios where testscenarioid="+requestedtestscenarioid+";";
	
	
	
	var resultstring = [];
	var data = [];
	var resultdata ='';
	var flag = false;
	var listoftestcasedata = [];
	async.series(
			{
			testsuitecheck : function(callback){
				var getTestSuites="select donotexecute,conditioncheck,getparampaths,testscenarioids from testsuites where testsuiteid= "+requiredtestsuiteid+" and cycleid="+requiredcycleid+" and testsuitename='"+requiredtestsuitename+"'";
				dbConnICE.execute(getTestSuites,function(err,result){
					if(err){
						console.log(err);
					}else{
						if(result.rows.length!=0){
							flag = true;
						}
						callback();
					}
				});
			},
			selectmodule: function(callback){
				var moduledetails = "SELECT * FROM modules where moduleid="+requiredtestsuiteid+" and modulename='"+requiredtestsuitename+"' ALLOW FILTERING";
				dbConnICE.execute(moduledetails,function(err,result){
					if(err){
						console.log(err);
					}else{
						if(result.rows.length!=0){
							data = JSON.parse(JSON.stringify(result.rows[0]));
							resultdata = data;
						}
						
						console.log(data);
						callback(err,resultdata);
					}
				});
			},
			testcasesteps : function(callback){
				var testscenarioids = resultdata.testscenarioids;
				//async.forEachSeries(resultdata, function(quest, callback2) {
					var responsedata={template: "",testcase:[],testcasename:""};
					var testsuiteexe = "INSERT INTO testsuites (cycleid,testsuitename,testsuiteid,versionnumber,condtitioncheck,createdby,createdon,createdthrough,deleted,donotexecute,getparampaths,history,modifiedby,modifiedon,skucodetestsuite,tags,testscenarioids) VALUES (" + requiredcycleid + ",'" + requiredtestsuitename + "'," + requiredtestsuiteid + ",1,[],'Kavyashree'," + new Date().getTime().toString() + ",null,null,[],[],null,null," + new Date().getTime().toString() + ",null,null,["+testscenarioids+"])";
					//var testcasestepsquery = "select testcasesteps,testcasename from testcases where testcaseid = "+quest;
					if(!flag){
						dbConnICE.execute(testsuiteexe, function(err, answers) {
						if(err){
							console.log(err);
						}else{
							
						}
						
						});
					}
					callback(); 
					
				//}, callback);

			}
			},
			function(err,results){
				//data.setHeader('Content-Type','application/json');
				if(err){
					cb(err);
				} 
				else{
					cb(null,flag);
				} 
			}

	);
}
