/**
 * Dependencies.
 */
var Joi = require('joi');
var cassandra = require('cassandra-driver');
var async = require('async');
var myserver = require('../../server.js');
var uuid = require('uuid-random');
var dbConnICE = require('../../server/config/icetestautomation');
var dbConnICEHistory = require('../../server/config/ICEHistory');
var epurl="http://127.0.0.1:1990/";
var Client = require("node-rest-client").Client;
var client = new Client();
/**
 * @author vishvas.a
 * @modifiedauthor shree.p (fetching the scenario names from the scenarios table)
 * @author vishvas.a changes on 21/June/2017 with regard to Batch Execution
 * this reads the scenario information from the testsuites
 * and testsuites table of the icetestautomation keyspace
 */
exports.readTestSuite_ICE = function(req, res) {
    //internal variables
    if (req.cookies['connect.sid'] != undefined) {
        var sessionCookie = req.cookies['connect.sid'].split(".");
        var sessionToken = sessionCookie[0].split(":");
        sessionToken = sessionToken[1];
    }
    if (sessionToken != undefined && req.session.id == sessionToken) {
        //base request elements
        // var requiredtestsuiteid = req.body.testsuiteid;
        // var requiredcycleid = req.body.cycleid;
        // var requiredtestsuitename = req.body.testsuitename;
		// var requiredreadTestSuite =[{ 	"testsuiteid": "df6120fe-aaf1-456b-9b6c-0615c792d8d8", 	"cycleid": "472b2499-761c-4e5d-bf8b-19d85e377bc4", 	"testsuitename": "Execution_ModuleLevel1", 	"releaseid": "1" }, { 	"testsuiteid": "57ec9be0-4994-4526-beb5-5d042c9073b1", 	"cycleid": "472b2499-761c-4e5d-bf8b-19d85e377bc4", 	"testsuitename": "Unicode_Module", 	"releaseid": "2" }];
		// res.send(responsedata);
        var requiredreadTestSuite = req.body.readTestSuite;
		var responsedata={};
		var testsuitesindex=0;
		async.forEachSeries(requiredreadTestSuite, function(eachSuite, readSuiteDatacallback) {
			//internal variables
			var outexecutestatus = [];
			var outcondition = [];
			var outdataparam = [];
			var outscenarioids = [];
			var outscenarionames = [];
			var outprojectnames = [];
			testsuitesindex = testsuitesindex + 1;

			TestSuiteDetails_Module_ICE(eachSuite, function(TestSuiteDetailserror, TestSuiteDetailsCallback) {
				if (TestSuiteDetailserror) {
					console.log(TestSuiteDetailserror);
				} else {
					// var getTestSuites = "select donotexecute,conditioncheck,getparampaths,testscenarioids from testsuites where testsuiteid= " +
					// 	eachSuite.testsuiteid + " and cycleid=" + eachSuite.cycleid + " and testsuitename='" + eachSuite.testsuitename + "'";
					//dbConnICE.execute(getTestSuites, function(getTestSuiteserr, getTestSuitesresult) {
                    var inputs = {"testsuiteid":eachSuite.testsuiteid,"cycleid":eachSuite.cycleid ,"testsuitename":eachSuite.testsuitename,"query":"readTestSuite_ICE"}
                    var args = {
                        data:inputs,
                        headers:{"Content-Type" : "application/json"}
                        
                    }
                    client.post(epurl+"suite/readTestSuite_ICE",args,
                        function (result, response) {
						if (response.statusCode != 200 || result.rows == "fail") {
							var flag = "Error in readTestSuite_ICE : Fail";
							res.send(flag);
						} else {
							//complete each response scenario object
							var respeachscenario = {
								executestatus: [],
								condition: [],
								dataparam: [],
								scenarioids: [],
								scenarionames: [],
								projectnames: []
							};
							async.forEachSeries(result.rows, function(eachSuiterow, eachSuitecallback) {
								outscenarioids = eachSuiterow.testscenarioids;
								respeachscenario.scenarioids = outscenarioids;
								if (eachSuiterow.donotexecute == null) {
									var arrTemp = [];
									for (var i = 0; i < outscenarioids.length; i++) {
										arrTemp.push(1);
									}
									outexecutestatus = arrTemp;
								} else {
									outexecutestatus = eachSuiterow.donotexecute;
								}
								respeachscenario.executestatus = outexecutestatus;
								if (eachSuiterow.conditioncheck == null) {
									var arrTemp = [];
									for (var i = 0; i < outscenarioids.length; i++) {
										arrTemp.push(0);
									}
									outcondition = arrTemp;
								} else {
									outcondition = eachSuiterow.conditioncheck;
								}
								respeachscenario.condition = outcondition;
								if (eachSuiterow.getparampaths == null) {
									var arrTemp = [];
									for (var i = 0; i < outscenarioids.length; i++) {
										arrTemp.push('');
									}
									outdataparam = arrTemp;
								} else {
									outdataparam = eachSuiterow.getparampaths;
								}
								respeachscenario.dataparam = outdataparam;
								scenarioidindex=0;
								async.forEachSeries(outscenarioids, function(eachoutscenarioid, outscenarioidcallback) {
									scenarioidindex=scenarioidindex+1;
									/**
									 *  Projectnametestcasename_ICE is a function to fetch testscenario name and project name
									 * 	modified shreeram p on 15th mar 2017
									 * */
									Projectnametestcasename_ICE(eachoutscenarioid, function(eachoutscenarioiderr, eachoutscenarioiddata) {
										if (eachoutscenarioiderr) {
											console.log(eachoutscenarioiderr);
										} else {
											if (eachoutscenarioiddata != null || eachoutscenarioiddata != undefined) {
												outscenarionames.push(eachoutscenarioiddata.testcasename);
												outprojectnames.push(eachoutscenarioiddata.projectname);
											}	
											respeachscenario.scenarionames = outscenarionames;
											respeachscenario.projectnames = outprojectnames;
											respeachscenario.testsuiteid = eachSuite.testsuiteid;
											if(scenarioidindex == outscenarioids.length){
												responsedata[eachSuite.testsuitename] = respeachscenario;
												if (testsuitesindex == requiredreadTestSuite.length){
													res.send(responsedata);
												}
											}
											outscenarioidcallback();
										}
									},eachSuitecallback);
									
								},readSuiteDatacallback);
							});
						}
					});
				}
			});

		});
        //old code 
        //commented by vishvas(21/June/2017) with regard to Batch Execution
        // /*  * Query 1 fetching the donotexecute,conditioncheck,getparampaths,testscenarioids  * based on testsuiteid,testsuitename and cycleid  */ TestSuiteDetails_Module_ICE(req.body, function(err, data) { if (err) { console.log(err); } else {  async.series({ testsuitesdata: function(callback) { var getTestSuites = "select donotexecute,conditioncheck,getparampaths,testscenarioids from testsuites where testsuiteid= " + requiredtestsuiteid + " and cycleid=" + requiredcycleid + " and testsuitename='" + requiredtestsuitename + "'"; //var getTestSuites="select donotexecute,condtitioncheck,getparampaths,testscenarioids from testsuites where testsuiteid= 13bbacaf-82c7-4c4a-9f91-0933462b10d4 AND cycleid=e6e5b473-34cd-4963-9bda-cb78c727e413 and testsuitename='Dev Suite 1'"; dbConnICE.execute(getTestSuites, function(err, result) { if (err) { var flag = "Error in readTestSuite_ICE : Fail"; res.send(""); } else { async.forEachSeries(result.rows, function(quest, callback2) {  outscenarioids = quest.testscenarioids;  if (quest.donotexecute == null) { var arrTemp = []; for (var i = 0; i < outscenarioids.length; i++) { arrTemp.push(1); } outexecutestatus = arrTemp; } else { outexecutestatus = quest.donotexecute; }  if (quest.conditioncheck == null) { var arrTemp = []; for (var i = 0; i < outscenarioids.length; i++) { arrTemp.push(0); } outcondition = arrTemp; } else { outcondition = quest.conditioncheck; }  if (quest.getparampaths == null) { var arrTemp = []; for (var i = 0; i < outscenarioids.length; i++) { arrTemp.push(''); } outdataparam = arrTemp; } else { outdataparam = quest.getparampaths; }   //var responsedata={template: "",testcase:[],testcas	ename:""}; async.forEachSeries(outscenarioids, function(quest1, callback3) { // var testcasestepsquery = "SELECT testscenarioname,projectid FROM testscenarios where testscenarioid="+quest1; // dbConnICE.execute(testcasestepsquery, function(err, answers) { // 	if(err){ // 		console.log(err); // 	}else{ // 		// var projectnamequery = "SELECT projectname FROM projects where projectid = "+answers.rows[0].projectid+" ALLOW FILTERING;"; // 		// var runquery = dbConnICE.execute(projectnamequery, function(err, projectnameresult) {if(err){ }else{outprojectnames.push(projectnameresult.rows[0].projectname)}}); // 		outscenarionames.push(answers.rows[0].testscenarioname); // 	} // 	callback3(); // }); /**  *  Projectnametestcasename_ICE is a function to fetch testscenario name and project name  * 	modified shreeram p on 15th mar 2017  * */ Projectnametestcasename_ICE(quest1, function(err, data) { if (err) { console.log(err); } else { if (data != null || data != undefined) { outscenarionames.push(data.testcasename); outprojectnames.push(data.projectname); }  } callback3(); }); }, callback2); }, callback); responsedata.executestatus = outexecutestatus; responsedata.condition = outcondition; responsedata.dataparam = outdataparam; responsedata.scenarioids = outscenarioids; responsedata.scenarionames = outscenarionames; responsedata.projectnames = outprojectnames; //cb(null, responsedata); } }); }, }, function(err, results) { //data.setHeader('Content-Type','application/json'); if (err) {  try { res.send(err); } catch (ex) { console.log("Exception occured in read test suite : ", ex); }  } else { //console.log(responsedata); try { res.send(JSON.stringify(responsedata)); } catch (ex) { console.log("Exception occured in read test suite : ", ex); } } }) } });

    } else {
        res.send("Invalid Session");
    }

};



/**
 * Projectnametestcasename_ICE function is to fetch projectname and testscenario
 * created by shreeram p on 15th mar 2017
 *  */
function Projectnametestcasename_ICE(req, cb, data) {
    var projectid = '';
    var testcaseNproject = {
        testcasename: "",
        projectname: ""
    };
    async.series({
        testcasename: function(callback_name) {
            var inputs = {"testscenarioid":req,"query":"testcasename"}
            var args = {
                data:inputs,
                headers:{"Content-Type" : "application/json"}
                
            }
            client.post(epurl+"suite/readTestSuite_ICE",args,
                function (result, response) {
            //var testcasestepsquery = "SELECT testscenarioname,projectid FROM testscenarios where testscenarioid=" + req;
            //dbConnICE.execute(testcasestepsquery, function(err, answers) {
                if (response.statusCode != 200 || result.rows == "fail") {
                    console.log("Error occured in Projectnametestcasename_ICE : fail");
                } else {
                    if (result.rows.length != 0) {
                        projectid = result.rows[0].projectid;
                        testcaseNproject.testcasename = result.rows[0].testscenarioname;
                    }
                    callback_name(null, projectid);
                }

            });
        },
        projectname: function(callback_name) {
            var inputs = {"projectid":projectid,"query":"projectname"}
            var args = {
                data:inputs,
                headers:{"Content-Type" : "application/json"}
                
            }
            client.post(epurl+"suite/readTestSuite_ICE",args,
                function (result, response) {
            // var projectnamequery = "SELECT projectname FROM projects where projectid = " + projectid + " ALLOW FILTERING;";
            // dbConnICE.execute(projectnamequery, function(err, projectnameresult) {
                if (response.statusCode != 200 || result.rows == "fail") {
                    console.log("Error occured in Projectnametestcasename_ICE : fail");
                } else {
                    if (result.rows.length != 0)
                        testcaseNproject.projectname = result.rows[0].projectname;
                    callback_name(null, testcaseNproject);
                }
            });
        }

    }, function(err, data) {
        cb(null, testcaseNproject);
    })

}

/**
 * @author vishvas.a
 * @author vishvas.a modified on 08/03/2017
 * @author vishvas.a changes on 23/June/2017 with regard to Batch Execution
 * this block of code is used for updating the testsuite details
 * to the testsuites table of icetestautomation keyspace
 */
exports.updateTestSuite_ICE = function(req, res) {
    if (req.cookies['connect.sid'] != undefined) {
        var sessionCookie = req.cookies['connect.sid'].split(".");
        var sessionToken = sessionCookie[0].split(":");
        sessionToken = sessionToken[1];
    }
    if (sessionToken != undefined && req.session.id == sessionToken) {
        var userinfo = req.body.batchDetails.userinfo;
        var batchDetails = req.body.batchDetails.suiteDetails;
        // var batchDetails = [{ 		"Execution_ModuleLevel1": { 			"requestedtestsuiteid": "df6120fe-aaf1-456b-9b6c-0615c792d8d8", 			"requestedtestsuitename": "Execution_ModuleLevel1", 			"conditioncheck": ["0", "0"], 			"donotexecute": ["1", "1"], 			"getparampaths": ["'a'", "'a'"], 			"testscenarioids": ["4c1142f8-7851-477c-b25b-6504c86fe6b4", "bdda93ff-63ed-4809-84f7-396ae203cc3c"], 			"testscycleid": "472b2499-761c-4e5d-bf8b-19d85e377bc4" 		}, 		"Execution_ModuleLevel2": { 			"requestedtestsuiteid": "558c720b-fe3c-48d4-b6b7-7d1c39f35063", 			"requestedtestsuitename": "Execution_ModuleLevel2", 			"conditioncheck": ["0", "0"], 			"donotexecute": ["1", "1"], 			"getparampaths": ["'a'", "'a'"], 			"testscenarioids": ["061c89a6-c171-45f9-bcf8-397c4e9abecd", "82b734e9-5c1f-4828-88ec-37eb24ab086b"], 			"testscycleid": "5c4b2a0c-c294-4d76-ba51-da995e8a177c" 		} 	}];
        // var requestedversionnumber = req.body.versionnumber;
        var requestedversionnumber = 1;
        var batchDetailslength=batchDetails.length;
        var batchindex=0;
        var totalnumberofsuites=0;
        var suiteindex=0;
        async.forEachSeries(batchDetails,function(eachbatchDetails,batchDetailscallback){
            batchindex= batchindex + 1;
            var allsuitenames=Object.keys(eachbatchDetails);
            totalnumberofsuites= totalnumberofsuites + allsuitenames.length;
            async.forEachSeries(allsuitenames,function(eachsuitename,eachsuitenamecallback){
                var requestedtestsuitename = eachbatchDetails[eachsuitename].requestedtestsuitename;
                var requestedtestsuiteid = eachbatchDetails[eachsuitename].requestedtestsuiteid;
                var conditioncheck = eachbatchDetails[eachsuitename].conditioncheck;
                var donotexecute = eachbatchDetails[eachsuitename].donotexecute;
                var getparampaths = eachbatchDetails[eachsuitename].getparampaths;
                var testscenarioids = eachbatchDetails[eachsuitename].testscenarioids;
                var testscycleid = eachbatchDetails[eachsuitename].testscycleid;
                console.log(requestedtestsuitename);
                var index = 0;
                /*
                * Query 1 checking whether the requestedtestsuiteid belongs to the same requestedtestscycleid
                * based on requested cycleid,suiteid
                */
                var checksuiteexists = "";
                var deleteTestSuiteQuery = "";
                var updateTestSuiteData = "";
                var flag="";
                var inputs = {"query": "deletetestsuitequery","cycleid":testscycleid,
						"testsuitename":requestedtestsuitename,"testsuiteid":requestedtestsuiteid,"versionnumber":requestedversionnumber};
                /*deleteTestSuiteQuery = "DELETE conditioncheck,donotexecute,getparampaths,testscenarioids FROM testsuites " +
                                        "where cycleid=" + testscycleid +
                                        " and testsuitename='" + requestedtestsuitename + "'" +
                                        " and testsuiteid=" + requestedtestsuiteid + " and versionnumber = " + requestedversionnumber;*/
                //deleteSuite(deleteTestSuiteQuery, function(err, response) {
                deleteSuite(inputs, function(err, response) {
                    if (response == "success") {
                        saveSuite(function(err, response) {
                            if (err) {
  
                                flag = "fail";
                                // index = index + 1;
                                // if (index == testscenarioids.length) {
                                //     eachsuitenamecallback();
                                // }
                                res.send(flag);
                            } else {
                                flag = "success";
                                index = index + 1;
                                if (index == testscenarioids.length) {                            
                                    console.log("delete completed --- calling next Suite");
                                    suiteindex=suiteindex+1;
                                    if(batchindex == batchDetailslength && suiteindex == totalnumberofsuites){
                                        res.send("success");
                                    }else{
                                        eachsuitenamecallback();
                                    }
                                }
                            }
                        });
                    }
                });

                //function deleteSuite(deleteTestSuiteQuery, deleteSuitecallback) {
                function deleteSuite(inputs, deleteSuitecallback) {
                	var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
					client.post(epurl+"suite/updateTestSuite_ICE",args,
					function (data, response) {
                    //dbConnICE.execute(deleteTestSuiteQuery, function(err, deleteQueryresults) {
                        //if (err) {
						if(response.statusCode != 200 || data.rows == "fail"){
							console.log(response.statusCode);
						} else {
                            flag = "success";
                            deleteSuitecallback(null, flag);
                        }
                    });
                }

                function saveSuite(saveSuite) {
                    for (var scenarioidindex = 0; scenarioidindex < testscenarioids.length; scenarioidindex++) {
                    	var inputs2 = {"query": "updatetestsuitedataquery","conditioncheck":conditioncheck[scenarioidindex],
        						"donotexecute":donotexecute[scenarioidindex],"getparampaths":getparampaths[scenarioidindex],
        						"testscenarioids":testscenarioids[scenarioidindex],"modifiedby":userinfo.username.toLowerCase(),"modifiedbyrole":userinfo.role,
        						"cycleid":testscycleid,"testsuiteid":requestedtestsuiteid,"testsuitename":requestedtestsuitename,
        						"versionnumber":requestedversionnumber ,"skucodetestsuite":"skucodetestsuite","tags":"tags"};
                        /*updateTestSuiteData = "update testsuites set" +
                            " conditioncheck=conditioncheck+[" + conditioncheck[scenarioidindex] + "], " +
                            "donotexecute=donotexecute+[" + donotexecute[scenarioidindex] + "], " +
                            "getparampaths=getparampaths+[" + getparampaths[scenarioidindex] + "], " +
                            "testscenarioids=testscenarioids+[" + testscenarioids[scenarioidindex] + "], " +
                            "modifiedby='" + userinfo.username + "', modifiedbyrole='" + userinfo.role + "' " +
                            "where cycleid=" + testscycleid +
                            " and testsuiteid=" + requestedtestsuiteid +
                            " and testsuitename='" + requestedtestsuitename +
                            "' and versionnumber = " + requestedversionnumber + " ;";*/
                        
                        //dbConnICE.execute(updateTestSuiteData, function(err, updateQueryresults) {
                    	var args = {data:inputs2,headers:{"Content-Type" : "application/json"}};
    					client.post(epurl+"suite/updateTestSuite_ICE",args,
    					function (data, response) {
                            /*if (err) {
                                flag = "fail";
                                saveSuite(flag, null);*/
    						console.log(response);
    						if(response.statusCode != 200 || data.rows == "fail"){
    							
    							console.log(response.statusCode);
    						
                            } else {
                                flag = "success";
                                saveSuite(null, flag);
                            }
                        });
                    }
                }
            });
            batchDetailscallback();
        });
        
    } else {
        res.send("Invalid Session");
    }
}

//UpdateTestSscnario Functionality
exports.updateTestScenario_ICE = function(req, res) {

        /*
         * internal variables
         */

        /*
         * base request elements
         */

        // var userinfo = req.payload.userinfo;
        if (req.cookies['connect.sid'] != undefined) {
            var sessionCookie = req.cookies['connect.sid'].split(".");
            var sessionToken = sessionCookie[0].split(":");
            sessionToken = sessionToken[1];
        }
        if (sessionToken != undefined && req.session.id == sessionToken) {

            var updatetestscenarioHistory;
            var updatedtestscenarioHistoryQuery;
            var date;

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
            //console.log(requestedetestcaseids)
            var delettestcaseids = "delete testcaseids from  testscenarios where projectid=" + requestedprojectid + " and testscenarioid=" + requestedtestscenarioid + " and testscenarioname ='" + requestedtestscenarioname + "';";
            dbConnICE.execute(delettestcaseids, function(err, result) {
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

               updatetestscenarioHistory =   "testcaseids=testcaseids+[" + requestedetestcaseids[i] + "] ,modifiedby ='" + requestedmodifiedby +
                    "' , modifiedon = " + requestedmodifiedon + "";
              updatetestscenarioHistory = dateScreen + ":" + updatetestscenarioHistory;
              updatedtestscenarioHistoryQuery = "UPDATE testscenarios SET  history= history + { "+updatetestscenarioHistory+" }" +
																			"' where projectid=" + requestedprojectid + " and testscenarioid=" + requestedtestscenarioid + 
																			" and testscenarioname='" + requestedtestscenarioname + "' ";
                console.log(updatedtestscenarioHistoryQuery);

                dbConnICE.execute(updateTestScenarioData, function(err, result) {
                    if (err) {
                        var flag = "Error in Query 1 updateTestScenarioData: Fail";
                        console.log(err);
                        //cb(null, flag);
                        res.send(flag);
                    } else {
                        	fnUpdateTestScenariosHistory(updatedtestscenarioHistoryQuery, function(err, response) {
																	if (err) {
																		console.log(err);
																	} else {
																		//console.log(response);
																		if (response == "success")
																		 var flag = "updateTestScenarioData updation : Success";
                                                                            console.log(flag);
                                                                            //cb(null,flag);
                                                                            res.send(flag);
																	}
																});

                        // var flag = "updateTestScenarioData updation : Success";
                        // console.log(flag);
                        // //cb(null,flag);
                        // res.send(flag);
                    }
                });
            }
        } else {
            res.send("Invalid Session");
        }
    }
//UpdateTestScenario History
          function fnUpdateTestScenariosHistory(updatedtestscenarioHistoryQuery, updateScenarioHistoryCallback)
            {
                    console.log("History", updatedtestscenarioHistoryQuery);
                    var statusFlag = "";
            dbConnICEHistory.execute(updatedtestscenarioHistoryQuery,
                function(updatedtestscenarioHistoryQuery, updateScenarioHistoryQueryRes) {
                    if (updatedtestscenarioHistoryQuery) {
                        statusFlag = "Error occured in updateScenarioHistoryQueryRes: Fail";
                        updateScenarioHistoryCallback(null, statusFlag);
                    } else {
                        statusFlag = "success";
                        updateScenarioHistoryCallback(null, statusFlag);
                    }
                });
            }
//UpdateTestSscnario Functionality



/**
 * @author shree.p
 * @author vishvas.a changes on 21/June/2017 with regard to Batch Execution
 */
exports.ExecuteTestSuite_ICE = function(req, res) {
    if (req.cookies['connect.sid'] != undefined) {
        var sessionCookie = req.cookies['connect.sid'].split(".");
        var sessionToken = sessionCookie[0].split(":");
        sessionToken = sessionToken[1];
    }
    if (sessionToken != undefined && req.session.id == sessionToken) {
        
    //    var batchExecutionData=[{ 	"suiteDetails": [{ 		"condition": 0, 		"browserType": ["1"], 		"dataparam": [""], 		"executestatus": 1, 		"scenarioids": "4c1142f8-7851-477c-b25b-6504c86fe6b4", 		"scenarionames": "Module_Scenario1" 	}, { 		"condition": 0, 		"dataparam": [""], 		"executestatus": 1, 		"scenarioids": "bdda93ff-63ed-4809-84f7-396ae203cc3c", 		"scenarionames": "Module_Scenario2" 	}], 	"testsuitename": "Execution_ModuleLevel1", 	"testsuiteid": "df6120fe-aaf1-456b-9b6c-0615c792d8d8", 	"browserType": ["1"] }, { 	"suiteDetails": [{ 		"condition": 0, 		"browserType": ["1"], 		"dataparam": [""], 		"executestatus": 1, 		"scenarioids": "061c89a6-c171-45f9-bcf8-397c4e9abecd", 		"scenarionames": "BatchExecution_Scenario1_Level2" 	}, { 		"condition": 0, 		"dataparam": [""], 		"executestatus": 1, 		"scenarioids": "82b734e9-5c1f-4828-88ec-37eb24ab086b", 		"scenarionames": "BatchExecution_Scenario2_Level2" 	}], 	"testsuitename": "Execution_ModuleLevel2", 	"testsuiteid": "558c720b-fe3c-48d4-b6b7-7d1c39f35063", 	"browserType": ["1"] },]
        var batchExecutionData = req.body.moduleInfo;
        var testsuitedetailslist = [];
        // var testsuiteidslist = [];
        var testsuiteIds=[];
        var executionRequest={"executionId":"","suitedetails":[],"testsuiteIds":[]};
        var executionId = uuid();
        var starttime = new Date().getTime();
        async.forEachSeries(batchExecutionData,function(eachbatchExecutionData,batchExecutionDataCallback){
            //required values
            var suiteDetails=eachbatchExecutionData.suiteDetails;
            var testsuitename=eachbatchExecutionData.testsuitename;
            var testsuiteid=eachbatchExecutionData.testsuiteid;
            var browserType=eachbatchExecutionData.browserType;
            var listofscenarioandtestcases = [];
            var scenarioIdList = [];
            var dataparamlist = [];
            var conditionchecklist = [];
            var browserTypelist=[];
            var scenarioindex=0;
            testsuiteIds.push(testsuiteid);
            async.forEachSeries(suiteDetails, function(eachsuiteDetails, eachsuiteDetailscallback) {
                
                var executionjson = {
                "scenarioIds": [],
                "browserType": [],
                "dataparampath":[],
                "condition":[],
                "testsuitename":""
                };
                var currentscenarioid = "";

                scenarioIdList.push(eachsuiteDetails.scenarioids);
                dataparamlist.push(eachsuiteDetails.dataparam[0]);
                conditionchecklist.push(eachsuiteDetails.condition);
                browserTypelist.push(eachsuiteDetails.browserType);
                currentscenarioid=eachsuiteDetails.scenarioids;
                TestCaseDetails_Suite_ICE(currentscenarioid, function(currentscenarioidError, currentscenarioidResponse) {
                    var scenariotestcaseobj = {};
                    // scenarioindex=scenarioindex + 1;
                    if (currentscenarioidError) {
                        console.log(currentscenarioidError);
                    } else {
                        if (currentscenarioidResponse != null || currentscenarioidResponse != undefined) {
                            scenariotestcaseobj[currentscenarioid] = currentscenarioidResponse.listoftestcasedata;
                            scenariotestcaseobj["qccredentials"] = eachsuiteDetails.qccredentials
                            scenariotestcaseobj["qcdetails"] = currentscenarioidResponse.qcdetails;
                            listofscenarioandtestcases.push(scenariotestcaseobj);
                            eachsuiteDetailscallback();
                        }
                        if(listofscenarioandtestcases.length == suiteDetails.length){
                            updateData();
                            batchExecutionDataCallback();
                            if(testsuitedetailslist.length == batchExecutionData.length){
                                var a=executionFunction(executionRequest);
                                console.log(a);
                            }
                        }
                    }
                });
                function updateData(){
                    executionjson[testsuiteid] = listofscenarioandtestcases;
                    executionjson.scenarioIds = scenarioIdList;
                    executionjson.browserType = browserType;
                    executionjson.condition = conditionchecklist;
                    executionjson.dataparampath = dataparamlist;
                    executionjson.testsuiteid = testsuiteid;
                    executionjson.testsuitename = testsuitename;
                    testsuitedetailslist.push(executionjson);
                    if(testsuitedetailslist.length == batchExecutionData.length){
                        excutionObjectBuilding(testsuitedetailslist);
                    }
                }
            });

        });
        function excutionObjectBuilding(testsuitedetailslist){
            executionRequest.executionId=executionId;
            executionRequest.suitedetails=testsuitedetailslist;
            executionRequest.testsuiteIds=testsuiteIds;
        }
        
        function executionFunction(executionRequest){
            console.log(executionRequest);
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", ip);
            if ('allSocketsMap' in myserver && ip in myserver.allSocketsMap) {
                var mySocket = myserver.allSocketsMap[ip];
                mySocket._events.result_executeTestSuite = [];
                mySocket.emit('executeTestSuite', executionRequest);
                mySocket.on('result_executeTestSuite', function(resultData) {
                    if (resultData != "success" && resultData != "Terminate") {
                        try {
                            var insertReportHistory;
                            var insertReportQuery;
                            var date;

                            var insertExecutionHistory;
                            var insertExecutionQuery;

                            var scenarioid = resultData.scenarioId;
                            var executionid = resultData.executionId;
                            var reportdata = resultData.reportData;
                            var testsuiteid = resultData.testsuiteId; 
                            var req_report = resultData.reportdata;
                            var req_reportStepsArray = reportdata.rows;
                            var req_overAllStatus = reportdata.overallstatus
                            var req_browser = reportdata.overallstatus[0].browserType;
                            reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
                            reportdata = JSON.parse(reportdata);
                            
                            var reportId = uuid();

                            // var insertReport = "INSERT INTO reports (reportid,executionid,testsuiteid,testscenarioid,executedtime,browser,modifiedon,status,report) VALUES (" + reportId + "," + executionid + "," + testsuiteid + "," + scenarioid + "," + new Date().getTime() + ",'" + req_browser + "'," + new Date().getTime() + ",'" + resultData.reportData.overallstatus[0].overallstatus + "','" + JSON.stringify(reportdata) + "')";
                             date = new Date().getTime();
                            insertReportHistory = "'reportid=" + reportId + ", executionid=" + executionid + ", testsuiteid=" + testsuiteid + ", testscenarioid=" + scenarioid + ", " +
                                    "executedtime=" + new Date().getTime() + ", browser=" + req_browser + ", modifiedon=" + new Date().getTime() + ", " +
                                    "status=" + resultData.reportData.overallstatus[0].overallstatus +",report=" + JSON.stringify(reportdata) + " '";
                            
                            insertReportQuery =  "INSERT INTO reports (reportid,executionid,history) VALUES (" + reportId + "," + executionid + ",{" + date + ":" + insertReportHistory + "})";
                            var inputs = {"reportid":reportId,
                            "executionid":executionid,
                            "testsuiteid":testsuiteid,
                            "testscenarioid":scenarioid,
                            "browser":req_browser,
                            "status":resultData.reportData.overallstatus[0].overallstatus,
                            "report":JSON.stringify(reportdata),
                            "query":"insertreportquery"}
                            var args = {
                                data:inputs,
                                headers:{"Content-Type" : "application/json"}
                                
                            }
                            client.post(epurl+"suite/ExecuteTestSuite_ICE",args,
                                function (result, response) {
                                if (response.statusCode != 200 || result.rows == "fail") {
                                    console.log("Error occured in TestCaseDetails_Suite_ICE : fail , insertreportquery");
                            // var dbquery = dbConnICE.execute(insertReport, function(err, result) {
                            //     if (err) {
                                    flag = "fail";
                                } else {
                                  	 fnCreateReportHistory(insertReportQuery, function(err, response) {
                                                                if (err) {
                                                                    console.log(err);
                                                                } else {
                                                                    if (response == "success")
                                                                        flag = "success";
                                                                }
                                                            });
                                    //flag = "success";
                                }
                            });
                            var insertIntoExecution = "INSERT INTO execution (testsuiteid,executionid,starttime,endtime) VALUES (" + testsuiteid + "," + executionid + "," + starttime + "," + new Date().getTime() + ");"

                            insertExecutionHistory = "'testsuiteid=" + testsuiteid + ", executionid=" + executionid + ", starttime=" + starttime + ", endtime=" + new Date().getTime() + " '";
                            insertExecutionQuery = "INSERT INTO execution (testsuiteid,executionid,history) VALUES (" + testsuiteid + "," + executionid + ",{" + date + ":" + insertExecutionHistory + "});"
                            var inputs = {"testsuiteid":testsuiteid,
                            "executionid":executionid,
                            "starttime":starttime.toString(),
                            "query":"inserintotexecutionquery"}
                            var args = {
                                data:inputs,
                                headers:{"Content-Type" : "application/json"}
                                
                            }
                            var dbqueryexecution = client.post(epurl+"suite/ExecuteTestSuite_ICE",args,
                                function (result, response) {
                                if (response.statusCode != 200 || result.rows == "fail") {
                                    console.log("Error occured in TestCaseDetails_Suite_ICE : fail , insertIntoExecution");
                            // var dbqueryexecution = dbConnICE.execute(insertIntoExecution, function(err, resultexecution) {
                            //     if (err) {
                                    flag = "fail";
                                } else {
                                    fnCreateExecutionHistory(insertExecutionQuery, function(err, response) {
                                                                if (err) {
                                                                    console.log(err);
                                                                } else {
                                                                    if (response == "success")
                                                                        flag = "success";
                                                                }
                                                            });
                                   // flag = "success";
								
                                }

                            });
                            //console.log("this is the value:",resultData);
							
                        } catch (ex) {
                            console.log(ex);
                        }
                    }
					if(resultData =="success" || resultData == "Terminate"){
						try{
								res.send(resultData);
						}
						catch (ex) {
                            console.log(ex);
                        }	
					}
                });
            } else {
                console.log("Socket not Available");
                res.send("unavailableLocalServer");
            }
        }
        //Create Report History while Execution
        function fnCreateReportHistory(insertReportQuery, createReportHistoryCallback)
        {
                console.log("History", insertReportQuery);
                var statusFlag = "";
        dbConnICEHistory.execute(insertReportQuery,
            function(insertReportQuery, createReportHistoryQueryRes) {
                if (insertReportQuery) {
                    statusFlag = "Error occured in createReportHistory: Fail";
                    createReportHistoryCallback(null, statusFlag);
                } else {
                    statusFlag = "success";
                    createReportHistoryCallback(null, statusFlag);
                }
            });
        }
        //Create Execution insert history
          function fnCreateExecutionHistory(insertExecutionQuery, createExecutionHistoryCallback)
            {
                    console.log("History", insertExecutionQuery);
                    var statusFlag = "";
            dbConnICEHistory.execute(insertExecutionQuery,
                function(insertExecutionQuery, createExecuteHistoryQueryRes) {
                    if (insertExecutionQuery) {
                        statusFlag = "Error occured in createExecuteHistory: Fail";
                        createExecutionHistoryCallback(null, statusFlag);
                    } else {
                        statusFlag = "success";
                        createExecutionHistoryCallback(null, statusFlag);
                    }
                });
            }
        //old code 
        //commented by vishvas(21/June/2017) with regard to Batch Execution
        // var browserType = req.body.browserType; // var testsuiteid = req.body.testsuiteId // var scenarioIdinfor = ''; //var json = "[{ 	\"scenarioname\": \"Scenario Name1\", 	\"scenarioid\": \"72bcc08e-15a7-4de6-ad59-389aee2230cb\", 	\"conditon\": [\"false\"], 	\"dataParam\": \"http://10.41.31.92:3000/execute\", 	\"executeStatus\": [\"1\"] }]"; // var json1 = JSON.parse(json); // var executionId = uuid(); // var starttime = new Date().getTime(); //internal values // var testsuitedetails = { // "suitedetails": "", // "executionId":"", // "testsuiteIds": "" // }; // async.forEachSeries(json1, function(itr, callback3) { // scenarioIdList.push(itr.scenarioids); // dataparamlist.push(itr.dataparam[0]); // conditionchecklist.push(itr.condition); // scenarioIdinfor = itr.scenarioids; // TestCaseDetails_Suite_ICE(scenarioIdinfor, function(err, data) {  // if (err) { // console.log(err); // } else { // if (data != null || data != undefined) { // scenariotestcaseobj[scenarioIdinfor] = data; // listofscenarioandtestcases.push(scenariotestcaseobj); // } // } // callback3(); // }) // }, function(callback3) { // executionjson[testsuiteid] = listofscenarioandtestcases; // executionjson.scenarioIds = scenarioIdList; // executionjson.browserType = browserType; // executionjson.condition = conditionchecklist; // executionjson.dataparampath = dataparamlist; // testsuitedetailslist.push(executionjson)  // testsuiteidslist.push(testsuiteid); // testsuitedetails.suitedetails = testsuitedetailslist; // testsuitedetails.testsuiteIds = testsuiteidslist; // testsuitedetails.executionId = executionId; // //					console.log(JSON.stringfy(testsuitedetails)); // var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", ip); // if ('allSocketsMap' in myserver && ip in myserver.allSocketsMap) { // var mySocket = myserver.allSocketsMap[ip]; // mySocket._events.result_executeTestSuite = []; // mySocket.emit('executeTestSuite', testsuitedetails); // mySocket.on('result_executeTestSuite', function(resultData) {  // if (resultData != "success" && resultData != "Terminate") { // try { // var scenarioid = resultData.scenarioId; // var executionid = resultData.executionId; // var reportdata = resultData.reportData; // var req_report = resultData.reportdata; // var req_reportStepsArray = reportdata.rows; // var req_overAllStatus = reportdata.overallstatus // var req_browser = reportdata.overallstatus[0].browserType; // reportdata = JSON.stringify(reportdata).replace(/'/g, "''"); // reportdata = JSON.parse(reportdata);  // var insertReport = "INSERT INTO reports (reportid,executionid,testsuiteid,testscenarioid,executedtime,browser,modifiedon,status,report) VALUES (" + uuid() + "," + executionid + "," + testsuiteid + "," + scenarioid + "," + new Date().getTime() + ",'" + req_browser + "'," + new Date().getTime() + ",'" + resultData.reportData.overallstatus[0].overallstatus + "','" + JSON.stringify(reportdata) + "')"; // var dbquery = dbConnICE.execute(insertReport, function(err, result) { // if (err) { // flag = "fail"; // } else { // flag = "success"; // } // });  // var insertIntoExecution = "INSERT INTO execution (testsuiteid,executionid,starttime,endtime) VALUES (" + testsuiteid + "," + executionid + "," + starttime + "," + new Date().getTime() + ");" // var dbqueryexecution = dbConnICE.execute(insertIntoExecution, function(err, resultexecution) { // if (err) { // flag = "fail"; // } else { // flag = "success"; // } // }); // //console.log("this is the value:",resultData); // } catch (ex) { // console.log(ex);  // } // } // //console.log("Response data in execution : ",resultData); // try { // if (resultData == "success" || resultData == "Terminate") // res.send(resultData); // } catch (ex) { // console.log("Exception occured is : ", ex) // }  // //} // }); // } else { // console.log("Socket not Available"); // res.send("unavailableLocalServer"); // }  // });
    
    } else {
        res.send("Invalid Session");
    }
}

/**
 * @author shree.p
 * @see function to execute test suites from jenkins
 */
exports.ExecuteTestSuite_ICE_CI = function(req, res) {
    if(req.sessionStore.sessions != undefined) {
        session_list = req.sessionStore.sessions;
        if(Object.keys(session_list).length !=0){
            var sessionCookie = session_list[req.body.session_id];
            var sessionToken = JSON.parse(sessionCookie).uniqueId;
            sessionToken = Object.keys(session_list)[Object.keys(session_list).length - 1];
        }
        
    }
        if(sessionToken != undefined && req.body.session_id == sessionToken)
    {
        
        var batchExecutionData = req.body.moduleInfo;
        var testsuitedetailslist = [];
        var testsuiteIds=[];
        var executionRequest={"executionId":"","suitedetails":[],"testsuiteIds":[]};
        var executionId = uuid();
        var starttime = new Date().getTime();
        async.forEachSeries(batchExecutionData,function(eachbatchExecutionData,batchExecutionDataCallback){
            //required values
            var suiteDetails=eachbatchExecutionData.suiteDetails;
            var testsuitename=eachbatchExecutionData.testsuitename;
            var testsuiteid=eachbatchExecutionData.testsuiteid;
            var browserType=eachbatchExecutionData.browserType;
            var listofscenarioandtestcases = [];
            var scenarioIdList = [];
            var dataparamlist = [];
            var conditionchecklist = [];
            var browserTypelist=[];
            var scenarioindex=0;
            testsuiteIds.push(testsuiteid);
            async.forEachSeries(suiteDetails, function(eachsuiteDetails, eachsuiteDetailscallback) {
                
                var executionjson = {
                "scenarioIds": [],
                "browserType": [],
                "dataparampath":[],
                "condition":[],
                "testsuitename":""
                };
                var currentscenarioid = "";

                scenarioIdList.push(eachsuiteDetails.scenarioids);
                dataparamlist.push(eachsuiteDetails.dataparam[0]);
                conditionchecklist.push(eachsuiteDetails.condition);
                browserTypelist.push(eachsuiteDetails.browserType);
                currentscenarioid=eachsuiteDetails.scenarioids;
                TestCaseDetails_Suite_ICE(currentscenarioid, function(currentscenarioidError, currentscenarioidResponse) {
                    var scenariotestcaseobj = {};
                    // scenarioindex=scenarioindex + 1;
                    if (currentscenarioidError) {
                        console.log(currentscenarioidError);
                    } else {
                        if (currentscenarioidResponse != null || currentscenarioidResponse != undefined) {
                            scenariotestcaseobj[currentscenarioid] = currentscenarioidResponse;
                            listofscenarioandtestcases.push(scenariotestcaseobj);
                            eachsuiteDetailscallback();
                        }
                        if(listofscenarioandtestcases.length == suiteDetails.length){
                            updateData();
                            batchExecutionDataCallback();
                            if(testsuitedetailslist.length == batchExecutionData.length){
                                var a=executionFunction(executionRequest);
                                console.log(a);
                            }
                        }
                    }
                });
                function updateData(){
                    executionjson[testsuiteid] = listofscenarioandtestcases;
                    executionjson.scenarioIds = scenarioIdList;
                    executionjson.browserType = browserType;
                    executionjson.condition = conditionchecklist;
                    executionjson.dataparampath = dataparamlist;
                    executionjson.testsuiteid = testsuiteid;
                    executionjson.testsuitename = testsuitename;
                    testsuitedetailslist.push(executionjson);
                    if(testsuitedetailslist.length == batchExecutionData.length){
                        excutionObjectBuilding(testsuitedetailslist);
                    }
                }
            });

        });
        function excutionObjectBuilding(testsuitedetailslist){
            executionRequest.executionId=executionId;
            executionRequest.suitedetails=testsuitedetailslist;
            executionRequest.testsuiteIds=testsuiteIds;
        }
        
        function executionFunction(executionRequest){
            console.log(executionRequest);
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", ip);
            if ('allSocketsMap' in myserver && ip in myserver.allSocketsMap) {
                var mySocket = myserver.allSocketsMap[ip];
                mySocket._events.result_executeTestSuite = [];
                mySocket.emit('executeTestSuite', executionRequest);
                mySocket.on('result_executeTestSuite', function(resultData) {
                    if (resultData != "success" && resultData != "Terminate") {
                        try {
                            var scenarioid = resultData.scenarioId;
                            var executionid = resultData.executionId;
                            var reportdata = resultData.reportData;
                            var testsuiteid = resultData.testsuiteId; 
                            var req_report = resultData.reportdata;
                            var req_reportStepsArray = reportdata.rows;
                            var req_overAllStatus = reportdata.overallstatus
                            var req_browser = reportdata.overallstatus[0].browserType;
                            reportdata = JSON.stringify(reportdata).replace(/'/g, "''");
                            reportdata = JSON.parse(reportdata);
                            
                            // var insertReport = "INSERT INTO reports (reportid,executionid,testsuiteid,testscenarioid,executedtime,browser,modifiedon,status,report) VALUES (" + uuid() + "," + executionid + "," + testsuiteid + "," + scenarioid + "," + new Date().getTime() + ",'" + req_browser + "'," + new Date().getTime() + ",'" + resultData.reportData.overallstatus[0].overallstatus + "','" + JSON.stringify(reportdata) + "')";
                            var inputs = {"reportid":reportId,
                            "executionid":executionid,
                            "testsuiteid":testsuiteid,
                            "testscenarioid":scenarioid,
                            "browser":req_browser,
                            "status":resultData.reportData.overallstatus[0].overallstatus,
                            "report":JSON.stringify(reportdata),
                            "query":"insertreportquery"}
                            var args = {
                                data:inputs,
                                headers:{"Content-Type" : "application/json"}
                                
                            }
                            var dbquery = client.post(epurl+"suite/ExecuteTestSuite_ICE",args,
                                function (result, response) {
                                if (response.statusCode != 200 || result.rows == "fail") {
                                    console.log("Error occured in TestCaseDetails_Suite_ICE : fail , insertreportquery");
                            // var dbquery = dbConnICE.execute(insertReport, function(err, result) {
                            //     if (err) {
                                    flag = "fail";
                                } else {
                                    flag = "success";
                                }
                            });
                            // var insertIntoExecution = "INSERT INTO execution (testsuiteid,executionid,starttime,endtime) VALUES (" + testsuiteid + "," + executionid + "," + starttime + "," + new Date().getTime() + ");"
                            var inputs = {"testsuiteid":testsuiteid,
                            "executionid":executionid,
                            "starttime":starttime.toString(),
                            "query":"inserintotexecutionquery"}
                            var args = {
                                data:inputs,
                                headers:{"Content-Type" : "application/json"}
                                
                            }
                            var dbqueryexecution = client.post(epurl+"suite/ExecuteTestSuite_ICE",args,
                                function (result, response) {
                                if (response.statusCode != 200 || result.rows == "fail") {
                                    console.log("Error occured in TestCaseDetails_Suite_ICE : fail , insertIntoExecution");
                            // var dbqueryexecution = dbConnICE.execute(insertIntoExecution, function(err, resultexecution) {
                            //     if (err) {
                                    flag = "fail";
                                } else {
                                    flag = "success";
								
                                }

                            });
                            //console.log("this is the value:",resultData);
							
                        } catch (ex) {
                            console.log(ex);
                        }
                    }
					if(resultData =="success" || resultData == "Terminate"){
						try{
								res.send(resultData);
						}
						catch (ex) {
                            console.log(ex);
                            res.send("fail");
                        }	
					}
                });
            } else {
                console.log("Socket not Available");
                res.send("unavailableLocalServer");
            }
        }
 
    } else {
        res.send("Invalid Session");
    }
}



function TestCaseDetails_Suite_ICE(req, cb, data) {
        var requestedtestscenarioid = req;
        var testscenarioslist = "select testcaseids from testscenarios where testscenarioid=" + requestedtestscenarioid + ";";
        var resultstring = [];
        var data = [];
        var resultdata = '';
        var qcdetails = {};

        var listoftestcasedata = [];
        async.series({
                testcaseid: function(callback) {
                    var inputs = {"testscenarioid":requestedtestscenarioid,"query":"testcaseid"}
                    var args = {
                        data:inputs,
                        headers:{"Content-Type" : "application/json"}
                        
                    }
                    client.post(epurl+"suite/ExecuteTestSuite_ICE",args,
                        function (result, response) {
                        if (response.statusCode != 200 || result.rows == "fail") {
                            console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcaseid");
                    // dbConnICE.execute(testscenarioslist, function(err, result) {
                    //     if (err) {
                    //         console.log(err);
                        } else {
                            if (result.rows.length != 0)
                                data = JSON.parse(JSON.stringify(result.rows[0].testcaseids));
                            resultdata = data;
                            //console.log(data);
                            callback(null, resultdata);
                        }
                    });
                },
                testcasesteps: function(callback) {
                    async.forEachSeries(resultdata, function(quest, callback2) {
                        var responsedata = {
                            template: "",
                            testcase: [],
                            testcasename: ""
                        };
                        var inputs = {"testcaseid":quest,"query":"testcasesteps"}
                        var args = {
                            data:inputs,
                            headers:{"Content-Type" : "application/json"}
                            
                        }
                        client.post(epurl+"suite/ExecuteTestSuite_ICE",args,
                            function (screenidresponse, response) {
                            if (response.statusCode != 200 || screenidresponse.rows == "fail") {
                                console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
                        // var getscreenidquery = "select screenid from testcases where testcaseid=" + quest;
                        // dbConnICE.execute(getscreenidquery, function(err, screenidresponse) {
                        //     if (err) {
                            } else {
                                try {
                                    if (screenidresponse.rows.length != 0) {
                                        var inputs = {"screenid":screenidresponse.rows[0].screenid,"query":"getscreendataquery"}
                                        var args = {
                                            data:inputs,
                                            headers:{"Content-Type" : "application/json"}
                                            
                                        }
                                        client.post(epurl+"suite/ExecuteTestSuite_ICE",args,
                                            function (screendataresponse, response) {
                                            if (response.statusCode != 200 || screendataresponse.rows == "fail") {
                                                console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
                                        // var getscreendataquery = "select screendata from screens where screenid=" + screenidresponse.rows[0].screenid;
                                        // dbConnICE.execute(getscreendataquery, function(err, screendataresponse) {
                                            // if (err) {
                                            //     console.log(err);
                                            } else {
                                                try {
                                                    try {
                                                        screendataresponse = JSON.parse(screendataresponse.rows[0].screendata);
                                                    } catch (exception) {
                                                        screendataresponse = JSON.parse("{}");;
                                                    }
                                                    if (screendataresponse != null && screendataresponse != "") {
                                                        if ('body' in screendataresponse) {
                                                            var wsscreentemplate = screendataresponse.body[0];
                                                            var inputs = {"testcaseid":quest,"query":"testcasestepsquery"}
                                                            var args = {
                                                                data:inputs,
                                                                headers:{"Content-Type" : "application/json"}
                                                                
                                                            }
                                                            client.post(epurl+"suite/ExecuteTestSuite_ICE",args,
                                                                function (answers, response) {
                                                                if (response.statusCode != 200 || answers.rows == "fail") {
                                                                    console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
                                                            // var testcasestepsquery = "select testcasesteps,testcasename from testcases where testcaseid = " + quest;
                                                            // dbConnICE.execute(testcasestepsquery, function(err, answers) {
                                                            //     if (err) {
                                                                    // console.log(err);
                                                                } else {
                                                                    responsedata.template = wsscreentemplate;
                                                                    if (answers.rows.length != 0) {
                                                                        responsedata.testcasename = answers.rows[0].testcasename;
                                                                        responsedata.testcase = answers.rows[0].testcasesteps;
                                                                    }
                                                                    listoftestcasedata.push(responsedata);
                                                                }
                                                                callback2();
                                                            });
                                                        } else {
                                                            var inputs = {"testcaseid":quest,"query":"testcasestepsquery"}
                                                            var args = {
                                                                data:inputs,
                                                                headers:{"Content-Type" : "application/json"}
                                                                
                                                            }
                                                            client.post(epurl+"suite/ExecuteTestSuite_ICE",args,
                                                                function (answers, response) {
                                                                if (response.statusCode != 200 || answers.rows == "fail") {
                                                                    console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
                                                            // var testcasestepsquery = "select testcasesteps,testcasename from testcases where testcaseid = " + quest;
                                                            // dbConnICE.execute(testcasestepsquery, function(err, answers) {
                                                            //     if (err) {
                                                            //         console.log(err);
                                                                } else {
                                                                    responsedata.template = "";
                                                                    if (answers.rows.length != 0) {
                                                                        responsedata.testcasename = answers.rows[0].testcasename;
                                                                        responsedata.testcase = answers.rows[0].testcasesteps;
                                                                    }

                                                                    listoftestcasedata.push(responsedata);
                                                                }
                                                                callback2();
                                                            });
                                                        }
                                                    } else {
                                                        var inputs = {"testcaseid":quest,"query":"testcasestepsquery"}
                                                        var args = {
                                                            data:inputs,
                                                            headers:{"Content-Type" : "application/json"}
                                                            
                                                        }
                                                        client.post(epurl+"suite/ExecuteTestSuite_ICE",args,
                                                            function (answers, response) {
                                                            if (response.statusCode != 200 || answers.rows == "fail") {
                                                                console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
                                                        // var testcasestepsquery = "select testcasesteps,testcasename from testcases where testcaseid = " + quest;
                                                        // dbConnICE.execute(testcasestepsquery, function(err, answers) {
                                                        //     if (err) {
                                                                // console.log(err);
                                                            } else {
                                                                responsedata.template = "";
                                                                if (answers.rows.length != 0) {
                                                                    responsedata.testcasename = answers.rows[0].testcasename;
                                                                    responsedata.testcase = answers.rows[0].testcasesteps;
                                                                }
                                                                listoftestcasedata.push(responsedata);
                                                            }
                                                            callback2();
                                                        });
                                                    }
                                                } catch (exception) {
                                                    var inputs = {"testcaseid":quest,"query":"testcasestepsquery"}
                                                    var args = {
                                                        data:inputs,
                                                        headers:{"Content-Type" : "application/json"}
                                                        
                                                    }
                                                    client.post(epurl+"suite/ExecuteTestSuite_ICE",args,
                                                        function (answers, response) {
                                                        if (response.statusCode != 200 || answers.rows == "fail") {
                                                            console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
                                                    // var testcasestepsquery = "select testcasesteps,testcasename from testcases where testcaseid = " + quest;
                                                    // dbConnICE.execute(testcasestepsquery, function(err, answers) {
                                                    //     if (err) {
                                                    //         console.log(err);
                                                        } else {
                                                            responsedata.template = "";
                                                            if (answers.rows.length != 0) {
                                                                responsedata.testcasename = answers.rows[0].testcasename;
                                                                responsedata.testcase = answers.rows[0].testcasesteps;
                                                            }
                                                            listoftestcasedata.push(responsedata);
                                                        }
                                                        callback2();
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        var inputs = {"testcaseid":quest,"query":"testcasestepsquery"}
                                        var args = {
                                            data:inputs,
                                            headers:{"Content-Type" : "application/json"}
                                            
                                        }
                                        client.post(epurl+"suite/ExecuteTestSuite_ICE",args,
                                            function (answers, response) {
                                            if (response.statusCode != 200 || answers.rows == "fail") {
                                                console.log("Error occured in TestCaseDetails_Suite_ICE : fail , testcasesteps");
                                        // var testcasestepsquery = "select testcasesteps,testcasename from testcases where testcaseid = " + quest;
                                        // dbConnICE.execute(testcasestepsquery, function(err, answers) {
                                        //     if (err) {
                                        //         console.log(err);
                                            } else {
                                                responsedata.template = "";
                                                if (answers.rows.length != 0) {
                                                    responsedata.testcasename = answers.rows[0].testcasename;
                                                    responsedata.testcase = answers.rows[0].testcasesteps;
                                                }
                                                listoftestcasedata.push(responsedata);
                                            }
                                            callback2();
                                        });
                                    }
                                } catch (exception) {
                                    console.log("Exception occured in TestCaseDetails_Suite_ICE : ", exception);
                                    // var testcasestepsquery = "select testcasesteps,testcasename from testcases where testcaseid = " + quest;
                                    //     dbConnICE.execute(testcasestepsquery, function(err, answers) {
                                    //         if (err) {
                                    //             console.log(err);
                                    //         } else {
                                    //             responsedata.template = "";
                                    //             responsedata.testcasename = answers.rows[0].testcasename;
                                    //             responsedata.testcase = answers.rows[0].testcasesteps;
                                    //             listoftestcasedata.push(responsedata);
                                    //         }
                                    //         callback2();
                                    //     });
                                }
                            }
                        });
                    }, callback);
                },
                qcscenariodetails : function(callback){
                    var qcdetailsquery = "SELECT * FROM qualitycenterdetails where testscenarioid="+requestedtestscenarioid;
                    var inputs = {"testscenarioid":requestedtestscenarioid,"query":"qcdetails"}
                    var args = {
                        data:inputs,
                        headers:{"Content-Type" : "application/json"}
                        
                    }
                    client.post(epurl+"qualityCenter/viewQcMappedList_ICE",args,
                        function (qcdetailsows, response) {
                        if (response.statusCode != 200 || qcdetailsows.rows == "fail") {
                    // dbConnICE.execute(qcdetailsquery,function(err,qcdetailsows){
                    //     if(err){
                    //         console.log(err);
                            console.log("Exception occured in TestCaseDetails_Suite_ICE : fail, qcscenariodetails ");
                        }else{
                            if(qcdetailsows.rows.length!=0){
                                flagtocheckifexists = true;
                                qcdetails = JSON.parse(JSON.stringify(qcdetailsows.rows[0]));
                            }
                        }
                        callback(null,qcdetails);
                    });
                }
            },
            function(err, results) {
                var obj = {"listoftestcasedata":JSON.stringify(listoftestcasedata),"qcdetails":qcdetails};
                //data.setHeader('Content-Type','application/json');
                if (err) {
                    cb(err);
                } else {
                    cb(null, obj);
                }
            }
        );
    }
    //ExecuteTestSuite Functionality


/**
 * Service to fetch all the testcase,screen and project names for provided scenarioid
 * @author Shreeram
 */
exports.getTestcaseDetailsForScenario_ICE = function(req, res) {
    if (req.cookies['connect.sid'] != undefined) {
        var sessionCookie = req.cookies['connect.sid'].split(".");
        var sessionToken = sessionCookie[0].split(":");
        sessionToken = sessionToken[1];
    }
    if (sessionToken != undefined && req.session.id == sessionToken) {
        var requiredtestscenarioid = req.body.testScenarioId;
        //var requiredtestscenarioname = req.testScenarioName;

        testcasedetails_testscenarios(requiredtestscenarioid, function(err, data) {
            if (err) {
                res.send("fail");
            } else {

                try {
                    //console.log(data);
                    res.send(JSON.stringify(data));
                } catch (ex) {
                    console.log("Exception occured in getTestcaseDetailsForScenario_ICE : ", ex)
                }
            }
        })
    } else {
        res.send("Invalid Session");
    }
}

//Function to fetch all the testcase,screen and project names for provided scenarioid
function testcasedetails_testscenarios(req, cb, data) {
    var testcasedetails = {
        testcasename: "",
        screenname: "",
        projectname: ""
    };
    var testcaseids = [];
    var screenidlist = [];
    var testcasenamelist = [];
    var screennamelist = [];
    var projectidlist = [];
    var projectnamelist = [];
    async.series({
        testscenariotable: function(callback) {
            // var testscenarioquery = "SELECT testcaseids FROM testscenarios where testscenarioid=" + req;
            // dbConnICE.execute(testscenarioquery, function(err, testscenarioresult) {
            //     if (err) {
            //         console.log(err);
            var inputs = {"query": "testscenariotable", "testscenarioid":req};
            var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
            client.post(epurl+"suite/getTestcaseDetailsForScenario_ICE",args,
			function (testscenarioresult, response) {
				if(response.statusCode != 200 || testscenarioresult.rows == "fail"){	
                    console.log(response.statusCode);
                } else {
                    if (testscenarioresult.rows.length != 0)
                        testcaseids = testscenarioresult.rows[0].testcaseids;
                }
                callback(null, testcaseids);
            });
        },
        testcasetable: function(callback) {
            var testcasename = '';
            async.forEachSeries(testcaseids, function(itr, callback2) {
                // var testcasequery = "SELECT testcasename,screenid FROM testcases WHERE testcaseid=" + itr;
                // dbConnICE.execute(testcasequery, function(err, testcaseresult) {
                //     if (err) {
                //         console.log(err);
                var inputs = {"query": "testcasetable", "testcaseid":itr};
                var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
                client.post(epurl+"suite/getTestcaseDetailsForScenario_ICE",args,
                function (testcaseresult, response) {
                    if(response.statusCode != 200 || testcaseresult.rows == "fail"){	
                        console.log(response.statusCode);
                    } else {
                        if (testcaseresult.rows.length != 0) {
                            testcasenamelist.push(testcaseresult.rows[0].testcasename);
                            screenidlist.push(testcaseresult.rows[0].screenid);
                        }

                    }
                    callback2();
                });

            }, callback);
        },
        screentable: function(callback) {
            async.forEachSeries(screenidlist, function(screenitr, callback3) {
                // var screenquery = "SELECT screenname,projectid FROM screens where screenid=" + screenitr;
                // dbConnICE.execute(screenquery, function(err, screenresult) {
                //     if (err) {
                //         console.log(err);
                var inputs = {"query": "screentable", "screenid":screenitr};
                var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
                client.post(epurl+"suite/getTestcaseDetailsForScenario_ICE",args,
                function (screenresult, response) {
                    if(response.statusCode != 200 || screenresult.rows == "fail"){	
                        console.log(response.statusCode);
                    } else {
                        if (screenresult.rows.length != 0) {
                            screennamelist.push(screenresult.rows[0].screenname);
                            projectidlist.push(screenresult.rows[0].projectid);
                        }
                    }
                    callback3();
                });


            }, callback);

        },
        projecttable: function(callback) {
            async.forEachSeries(projectidlist, function(projectitr, callback4) {
                    // var projectquery = "SELECT projectname FROM projects where projectid=" + projectitr;
                    // dbConnICE.execute(projectquery, function(err, projectresult) {
                    //     if (err) {
                    //         console.log(err);
                    var inputs = {"query": "projecttable", "projectid":projectitr};
                    var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
                    client.post(epurl+"suite/getTestcaseDetailsForScenario_ICE",args,
                    function (projectresult, response) {
                        if(response.statusCode != 200 || projectresult.rows == "fail"){	
                            console.log(response.statusCode);
                        } else {
                            if (projectresult.rows.length != 0)
                                projectnamelist.push(projectresult.rows[0].projectname);

                            //projectidlist.push(screenresult.rows[0].projectid);
                        }
                        callback4();

                    });
                }, callback)
                //callback(projectidlist);

        }
    }, function(err, data) {
        if (err) {
            console.log(err);
            cb(err, "fail");
        } else {
            var resultdata = {
                testcasenames: [],
                testcaseids: [],
                screennames: [],
                screenids: [],
                projectnames: [],
                projectids: []
            };
            resultdata.testcasenames = testcasenamelist;
            resultdata.testcaseids = testcaseids;
            resultdata.screennames = screennamelist;
            resultdata.screenids = screenidlist
            resultdata.projectnames = projectnamelist;
            resultdata.projectids = projectidlist;
            cb(err, resultdata);
        }
    });
}

function TestSuiteDetails_Module_ICE(req, cb1, data) {
    //	var requestedtestscenarioid = req;

    var requiredcycleid = req.cycleid;
    var requiredtestsuiteid = req.testsuiteid;
    var requiredtestsuitename = req.testsuitename;
    //var testscenarioslist = "select testcaseids from testscenarios where testscenarioid="+requestedtestscenarioid+";";



    var resultstring = [];
    var data = [];
    var resultdata = '';
    var flag = false;
    var listoftestcasedata = [];
    async.series({
            testsuitecheck: function(callback) {
                var inputs = {"testsuiteid":requiredtestsuiteid,"cycleid":requiredcycleid,"query":"testsuitecheck"}
                var args = {
					data:inputs,
					headers:{"Content-Type" : "application/json"}
                    
				}
                //var getTestSuites = "select donotexecute,conditioncheck,getparampaths,testscenarioids from testsuites where testsuiteid= " + requiredtestsuiteid + " and cycleid=" + requiredcycleid;
                //dbConnICE.execute(getTestSuites, function(err, result) {
                    client.post(epurl+"suite/readTestSuite_ICE",args,
						function (result, response) {
                            // if (err) {
                            if (response.statusCode != 200 || result.rows == "fail") {
                                console.log("Error occured in TestSuiteDetails_Module_ICE : fail , testsuitecheck");
                            
                             } else {
                                if (result.rows.length != 0) {
                                    flag = true;
                                }
                                callback();
                            }
                        });
                    
                //});
            },
            selectmodule: function(callback) {
                var inputs = {"moduleid":requiredtestsuiteid,"modulename":requiredtestsuitename,"query":"selectmodule"}
                var args = {
					data:inputs,
					headers:{"Content-Type" : "application/json"}
                    
				}
                //var moduledetails = "SELECT * FROM modules where moduleid=" + requiredtestsuiteid + " and modulename='" + requiredtestsuitename + "' ALLOW FILTERING";
                //dbConnICE.execute(moduledetails, function(err, result) {
                    client.post(epurl+"suite/readTestSuite_ICE",args,
						function (result, response) {
                    // if (err) {
                    //     console.log(err);
                    if (response.statusCode != 200 || result.rows == "fail") {
                            console.log("Error occured in TestSuiteDetails_Module_ICE : fail, selectmodule");
                    } else {
                        if (result.rows.length != 0) {
                            data = JSON.parse(JSON.stringify(result.rows[0]));
                            resultdata = data;
                        }

                        //console.log(data);
                        callback(null, resultdata);
                    }
                });
            },
            testcasesteps: function(callback) {
                var testscenarioids = resultdata.testscenarioids;
                //async.forEachSeries(resultdata, function(quest, callback2) {					var responsedata={template: "",testcase:[],testcasename:""};
                var requiredversionnumber = 1;
                var createTestSuitesHistory;
                var insertTestSuiteQuery;
                var date;
                //var testcasestepsquery = "select testcasesteps,testcasename from testcases where testcaseid = "+quest;
                if (!flag) {
                    var conditioncheckvalues = [];
                    var donotexecutevalues = [];
                    var getparampathvalues = [];
                    for (var i = 0; i < testscenarioids.length; i++) {
                        conditioncheckvalues.push('0');
                        donotexecutevalues.push('1');
                        getparampathvalues.push('');
                    }
                    var inputs = {"cycleid":requiredcycleid,
                    "testsuitename":requiredtestsuitename,
                    "testsuiteid":requiredtestsuiteid,
                    "versionnumber":"1",
                    "conditioncheck":conditioncheckvalues,
                    "createdby":"Ninteen68_admin",
                    "createdthrough":"createdthrough",
                    "deleted":"FALSE",
                    "donotexecute":donotexecutevalues,
                    "getparampaths": getparampathvalues,
                    "skucodetestsuite":"skucodetestsuite",
                    "tags":"tags",
                    "testscenarioids":testscenarioids,
                    "query":"testcasesteps"}
                    var args = {
                        data:inputs,
                        headers:{"Content-Type" : "application/json"}
                        
                    }
                    // var testsuiteexe = "INSERT INTO testsuites (cycleid,testsuitename,testsuiteid,versionnumber,conditioncheck,createdby,createdon,createdthrough,deleted,donotexecute,getparampaths,history,modifiedby,modifiedon,skucodetestsuite,tags,testscenarioids) VALUES (" + requiredcycleid + ",'" + requiredtestsuitename + "'," + requiredtestsuiteid + ",1,[" + conditioncheckvalues+ "],'Ninteen68_admin'," + new Date().getTime().toString() + ",null,null,[" + donotexecutevalues + "],["+ getparampathvalues + "],null,null," + new Date().getTime().toString() + ",null,null,["+ testscenarioids + "])";

                    createTestSuitesHistory = "Inserted by Ninteen68_admin cycleid="+requiredcycleid+",testsuitename="+requiredtestsuitename+",testsuiteid=" + requiredtestsuiteid +",versionnumber=1,conditioncheck=[" + conditioncheckvalues + "],createdby= 'Ninteen68_admin',createdon=" + new Date().getTime().toString() + ",createdthrough=null,deleted=null,donotexecute=[" + donotexecutevalues + "],getparampaths=[" + getparampathvalues + "],modifiedby=null,modifiedon=" + new Date().getTime().toString() + ",skucodetestsuite=null,tags=null,testscenarioids=[" + testscenarioids + "] ";
                   date = new Date().getTime();

                    insertTestSuiteQuery = "INSERT INTO testsuites (cycleid,testsuiteid,testsuitename,versionnumber,history) VALUES ("+requiredcycleid+"," + requiredtestsuiteid +","+requiredtestsuitename+",1,{" + date + ":" + createTestSuitesHistory + "})";


                   // dbConnICE.execute(testsuiteexe, function(err, answers) {
                    client.post(epurl+"suite/readTestSuite_ICE",args,
						function (result, response) {
                        //if (err) {
                        if (response.statusCode != 200 || result.rows == "fail") {
                            console.log("Error occured in TestSuiteDetails_Module_ICE : fail, testcasesteps");
                            cb1(null, flag);
                        } else {
                            //cb1(null,flag);
                            fnCreateTestsuiteHistory(insertTestSuiteQuery, function(err, response) {
                                    if (response == 'success') {
                                       callback(null, flag);
                                    }else{
                                        callback(null, flag);
                                    } 
                                });
                          //  callback(null, flag);
                        }


                    });
                } else {
                    //var updatetestsuitefrommodule = "UPDATE testsuites SET testscenarioids = ["+testscenarioids+"] WHERE testsuiteid="+requiredtestsuiteid+" and cycleid="+requiredcycleid+" and testsuitename='"+requiredtestsuitename+"' and versionnumber="+requiredversionnumber;
                    var jsondata = {
                            "testsuiteid": requiredtestsuiteid,
                            "testscenarioid": testscenarioids,
                            "cycleid": requiredcycleid,
                            "testsuitename": requiredtestsuitename,
                            "versionnumber": requiredversionnumber,
                            "testscenarioids": testscenarioids
                        }
                        // try{

                    updatescenariodetailsinsuite(jsondata, function(err, data) {
                        if (err) {
                            console.log(err);
                            cb1(null, flag);

                        } else {
                            callback(null, flag);

                            //cb1(null,flag);
                        }

                    });
                    // }catch(ex){
                    // 	console.log("Exception occured in the updating scenarios",ex);
                    // }
                }
                //callback(); 

                //}, callback);

            }
        },
        function(err, results) {
            //data.setHeader('Content-Type','application/json');
            if (err) {
                cb1(null, flag);
            } else {
                cb1(null, flag);
            }
        }

    );
}

//Create TestSuite History Transaction
function fnCreateTestsuiteHistory(insertTestSuiteQuery,createTestSuiteHistoryCallback){
	//console.log("History", insertTestSuiteQuery);
	 var statusFlag="";
	dbConnICEHistory.execute(insertTestSuiteQuery, 
		function(insertTestSuiteQuery, createTestSuiteHistoryQueryRes){
			if(insertTestSuiteQuery){
				statusFlag="Error occured in createTestSuiteHistory for screen : Fail";
				createTestSuiteHistoryCallback(null,statusFlag);
			}else{
				statusFlag = "success";						
				createTestSuiteHistoryCallback(null,statusFlag);
		}
	});
};

function updatescenariodetailsinsuite(req, cb, data) {
    var suiterowdetails = {};
    var getparampath1 = [];
    var conditioncheck1 = [];
    var donotexecute1 = [];
    var createTestSuitesHistory;
    var insertTestSuiteQuery;
    var date;
				
    async.series({
        fetchdata: function(simplecallback) {
             var inputs = {"testsuiteid":req.testsuiteid,"cycleid":req.cycleid,"query":"fetchdata"}
                var args = {
					data:inputs,
					headers:{"Content-Type" : "application/json"}
                    
				}
            //var selectsuierows = "SELECT * FROM testsuites where testsuiteid = " + req.testsuiteid + " and cycleid=" + req.cycleid + " ALLOW FILTERING;";
            //dbConnICE.execute(selectsuierows, function(err, answers) {
            client.post(epurl+"suite/readTestSuite_ICE",args,
                    function (result, response) {
                //if (err) {
                if (response.statusCode != 200 || result.rows == "fail") {
                    console.log("Error occured in TestSuiteDetails_Module_ICE : fail, fetchdata");
                } else {
                    if (result.rows.length != 0)
                        suiterowdetails = result.rows[0]
                }
                simplecallback();
            });
        },
        validatedata: function(simplecallback) {
            var scenarioidstocheck = suiterowdetails.testscenarioids;
            var verifyscenarioid = req.testscenarioid;
            var getparampath = suiterowdetails.getparampaths;
            var conditioncheck = suiterowdetails.conditioncheck;
            var donotexecute = suiterowdetails.donotexecute;



            for (var i = 0; i < verifyscenarioid.length; i++) {
                var temp = verifyscenarioid[i];
                //var index = scenarioidstocheck.toString().indexOf(temp);
                var index = JSON.parse(JSON.stringify(scenarioidstocheck)).indexOf(temp);
                if (index != null && index != undefined && index != -1) {
                    if (getparampath != null) {
                        if (getparampath[index] == '' || getparampath[index] == ' ') {
                            getparampath1.push('\' \'');
                        } else {
                            getparampath1.push("\'" + getparampath[index] + "\'");
                        }

                    }
                    if (conditioncheck != null) {
                        conditioncheck1.push(conditioncheck[index].toString());
                    }
                    if (donotexecute != null) {
                        donotexecute1.push(donotexecute[index]);
                    }
                } else {
                    getparampath1.push('\' \'');
                    conditioncheck1.push('0');
                    donotexecute1.push('1');
                }
            }
            simplecallback();

        },
        delete: function(simplecallback) {
            // if(flagtocheckifexists){
            // var deletequery = "DELETE FROM testsuites WHERE testsuiteid=" + req.testsuiteid + " and cycleid=" + req.cycleid + " and testsuitename='" + suiterowdetails.testsuitename + "'";
            var inputs = {"testsuiteid":req.testsuiteid,"cycleid":req.cycleid,"testsuitename":suiterowdetails.testsuitename ,"query":"delete"}
                var args = {
					data:inputs,
					headers:{"Content-Type" : "application/json"}
                    
				}
            //dbConnICE.execute(deletequery, function(err, deleted) {
                client.post(epurl+"suite/readTestSuite_ICE",args,
                    function (result, response) {
                //if (err) {
                if (response.statusCode != 200 || result.rows == "fail") {
                    console.log("Error occured in TestSuiteDetails_Module_ICE : fail, delete");
                } else {}
                simplecallback();
            });


        },
        updatescenarioinnsuite: function(simplecallback) {

            // var updatetestsuitefrommodule = "INSERT INTO testsuites (cycleid,testsuitename,testsuiteid,versionnumber,conditioncheck,createdby,createdon,createdthrough,deleted,donotexecute,getparampaths,history,modifiedby,modifiedon,skucodetestsuite,tags,testscenarioids) VALUES (" + req.cycleid + ",'" + req.testsuitename + "'," + req.testsuiteid + "," + suiterowdetails.versionnumber + ",[" + conditioncheck1 + "],'" + suiterowdetails.createdby + "'," + suiterowdetails.createdon.valueOf() + ",null,null,[" + donotexecute1 + "],[" + getparampath1 + "],null,'" + suiterowdetails.modifiedby + "'," + new Date().getTime().toString() + ",null,null,[" + req.testscenarioids + "])";
            var inputs = {"cycleid":req.cycleid,
                    "testsuitename":req.testsuitename,
                    "testsuiteid":req.testsuiteid,
                    "versionnumber":suiterowdetails.versionnumber.toString(),
                    "conditioncheck":conditioncheck1,
                    "createdby":suiterowdetails.createdby,
                    "createdon":new Date(suiterowdetails.createdon).getTime().toString(),
                    "createdthrough":"createdthrough",
                    "deleted":"FALSE",
                    "donotexecute":donotexecute1,
                    "getparampaths": getparampath1,
                    "modifiedby":"Ninteen68_admin",
                    "skucodetestsuite":"skucodetestsuite",
                    "tags":"tags",
                    "testscenarioids":req.testscenarioids,
                    "query":"updatescenarioinnsuite"}
            var args = {
                data:inputs,
                headers:{"Content-Type" : "application/json"}
                
            }
            // createTestSuitesHistory = "Inserted by Ninteen68_admin cycleid="+req.cycleid+",testsuitename="+req.testsuitename+",testsuiteid=" + req.testsuiteid +",versionnumber="+suiterowdetails.versionnumber+",conditioncheck=[" + conditioncheck1 + "],createdby= " + suiterowdetails.createdby + ",createdon=" + suiterowdetails.createdon.valueOf() + ",createdthrough=null,deleted=null,donotexecute=[" + donotexecute1 + "],getparampaths=[" + getparampath1 + "],modifiedby=" + suiterowdetails.modifiedby + ",modifiedon=" + new Date().getTime().toString() + ",skucodetestsuite=null,tags=null,testscenarioids=[" + req.testscenarioids + "] ";
             date = new Date().getTime();
            
            createTestSuitesHistory = "'cycleid=" + req.cycleid + ", testsuitename="+req.testsuitename+", testsuiteid=" + req.testsuiteid +", versionnumber="+suiterowdetails.versionnumber+", conditioncheck=["+conditioncheck1+"], createdby= " + suiterowdetails.createdby + ",createdon=" + suiterowdetails.createdon.valueOf() + ",createdthrough=null, deleted=null, donotexecute=["+donotexecute1+"],getparampaths=[],modifiedby=" + suiterowdetails.modifiedby + ", modifiedon=" + new Date().getTime().toString() + ", skucodetestsuite=null,tags=null,testscenarioids=[" + req.testscenarioids + "] '";  

            console.log(createTestSuitesHistory);

            insertTestSuiteQuery = "INSERT INTO testsuites (cycleid,testsuiteid,testsuitename,versionnumber,history) VALUES ("+req.cycleid+"," +  req.testsuiteid +",'"+ req.testsuitename +"',1,{" + date + ":" + createTestSuitesHistory + "})";
          
            //var updatetestsuitefrommodule = "UPDATE testsuites SET testscenarioids = ["+req.testscenarioids+"], conditioncheck=["+conditioncheck1+"] ,getparampaths=["+getparampath1+"], donotexecute=["+donotexecute1+"] WHERE testsuiteid="+req.testsuiteid+" and cycleid="+req.cycleid+" and testsuitename='"+req.testsuitename+"' and versionnumber="+req.versionnumber;
            //dbConnICE.execute(updatetestsuitefrommodule, function(err, answers) {
            client.post(epurl+"suite/readTestSuite_ICE",args,
                    function (result, response) {
                if (response.statusCode != 200 || result.rows == "fail") {
                    cb(null, "fail");
                } else {
                      fnCreateTestsuiteHistory(insertTestSuiteQuery, function(err, response) {
                                    if (response == 'success') {
                                           simplecallback(null, result);
                                    } else {
                                        flag = "fail";
                                        simplecallback(null, result);
                                       console.log(err);
                                    }
                                });
                }
                //data=answers;
                //simplecallback(null, answers);
            });

        }

    }, function(err, data) {
        if (err) {
            console.log(err);
            cb(null, err);
        } else {
            try {
                cb(null, 'Successsssssss');
            } catch (ex) {
                console.log("Exception occured in the updating scenarios", ex);
            }
        }
    })


}