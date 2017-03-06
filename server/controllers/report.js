/**
 * Dependencies.
 */
var Joi = require('joi');
var cassandra = require('cassandra-driver');
var async = require('async');
var myserver = require('../../server.js');
var uuid = require('uuid-random');
var dbConnICE = require('../../server/config/icetestautomation');
var async = require('async');

exports.getMainReport_ICE = function(req, res){
	var client = require("jsreport-client")("http://10.41.31.5:3001/");
	client.render({
	    template: { 
	    	shortid: "HJP1pqMcg", 
	    	recipe: "html",
	        engine: "none" 
	    }
	}, function(err, response) {
		if (err) {
			console.log('error when trying to render report:', err);
		}
		else{
			response.pipe(res);
			//res.end()
		}
	});
}

exports.renderReport_ICE = function(req, res){
	var finalReports = req.body.finalreports;
	var reportType = req.body.reporttype;
	var client = require("jsreport-client")("http://10.41.31.5:3001/");
	client.render({
	    template: { 
	    	shortid: "rkE973-5l", 
	    	recipe: reportType,
	        engine: "handlebars" },
	    data: {
	    	"overallstatus": finalReports.overallstatus,
	    	"rows": finalReports.rows
	    }
	}, function(err, response) {
		if (err) {
			console.log('error when trying to render report:', err);
		}
		else{
			response.pipe(res);
			//res.end()
		}
	});
}

exports.getAllSuites_ICE = function (req, res) {
	console.log("coming into getAllSuites_ICE service")
	var req_userId=req.body.userId;
	//req_userId = 'a144b468-e84f-4e7c-9a8a-0a658330212e';
	var getDomain="SELECT domainid FROM icepermissions WHERE userid="+req_userId+";";
	var testSuiteDetails=[];
	async.series(
			{	domainAssignedWithUserID: function(callback){
				dbConnICE.execute(getDomain,function(err,result){
					console.log("Exe getAllSuites_ICE service")
					if(err){
						console.log(err);
					}else{
						var domainid = JSON.parse(JSON.stringify(result.rows[0].domainid));
						resultdata = domainid;
						console.log(resultdata);
						callback(err,resultdata);
					}
				});
			},
			projectsUnderDomain: function(callback){
				var getProjectIDs="SELECT projectid FROM projects WHERE domainid="+resultdata+";";
				dbConnICE.execute(getProjectIDs,function(err,result){
					if(err){
						console.log(err);
					}else{
						async.forEachSeries(result.rows, function(iterator, callback2) {
							var releaseids = "SELECT releaseid FROM releases WHERE projectid="+iterator.projectid;
							dbConnICE.execute(releaseids,function(err,releaseidsdata){

								if(err){
									console.log(err);  
								}else{
									async.forEachSeries(releaseidsdata.rows,function(releaseiditr,callback3){
										var cycleids = "SELECT cycleid FROM cycles WHERE releaseid="+releaseiditr.releaseid;
										dbConnICE.execute(cycleids,function(err,cycleidsdata){
											if(err){
												console.log(err);  
											}else{
												async.forEachSeries(cycleidsdata.rows,function(cycleiditr,callback4){
													var testsuiteids = "SELECT testsuiteid,testsuitename FROM testsuites WHERE cycleid="+cycleiditr.cycleid;
													dbConnICE.execute(testsuiteids,function(err,testsuiteidsdata){
														if(err){
															console.log(err);  
														}else{
															async.forEachSeries(testsuiteidsdata.rows,function(testsuiteiditr,callback5){
																testSuiteDetails.push({
																	testsuiteid :  testsuiteiditr.testsuiteid ,
																	testsuitename: testsuiteiditr.testsuitename
																});
																callback5();
															},callback4);
														}
													});
												},callback3);
											}
										});
									},callback2);
								}
							});
						}, callback);
					}
				});

			}

			},
			function(err,results){
				//data.setHeader('Content-Type','application/json');
				if(err){
					res.send(err);
				} 
				else{
					//console.log(JSON.stringify(testSuiteDetails));
					res.send(JSON.stringify(testSuiteDetails));
				} 
			})
}


exports.getSuiteDetailsInExecution_ICE = function (req, res) {
	var req_testsuiteId=req.body.testsuiteid;
	var startTime, endTime, starttime, endtime;
	var executionDetailsJSON=[];
	var getExecutionDetails="SELECT executionid,starttime,endtime FROM execution WHERE testsuiteid="
		+ req_testsuiteId ;

	dbConnICE.execute(getExecutionDetails,function(err,executionData){
		if(err){
			console.log(err);
		}else{
			for (var i = 0; i < executionData.rows.length; i++) {
				startTime = executionData.rows[i].starttime;
				endTime = executionData.rows[i].endtime;
				starttime = startTime.getDate()+"-"+(startTime.getMonth()+1)+"-"+startTime.getFullYear()+" "+startTime.getHours()+":"+startTime.getMinutes();
				endtime =  endTime.getDate()+"-"+(endTime.getMonth()+1)+"-"+endTime.getFullYear()+" "+endTime.getHours()+":"+endTime.getMinutes();
				executionDetailsJSON.push({
					execution_id :  executionData.rows[i].executionid,
					start_time: starttime,
					end_time: endtime
				});
				//executionDetailsArray.push(executionDetailsJSON);
			}
			//console.log('executionDetailsJSON ',JSON.stringify(executionDetailsJSON));
			res.send(JSON.stringify(executionDetailsJSON));
		}
	});
}


exports.reportStatusScenarios_ICE = function (req, res) {
	var req_executionId=req.body.executionId;
	var reportList=[];
	var report=[];
	async.series({
		executiondetails:function(callback){
			var reportFetchQuery = "SELECT * FROM reports where executionid="+req_executionId+" ALLOW FILTERING";
			dbConnICE.execute(reportFetchQuery, function (err, result) {
				if (err) {
					var flag = "Error in reportStatusScenarios : Fail";
					req.send(flag);
				}else {
					async.forEachSeries(result.rows, function(iterator, callback2) {
						var executedtimeTemp = iterator.executedtime;
						if(executedtimeTemp != null){
							executedtimeTemp = executedtimeTemp.getDate()+"-"+(executedtimeTemp.getMonth()+1)+"-"+executedtimeTemp.getFullYear()+" "+executedtimeTemp.getHours()+":"+executedtimeTemp.getMinutes();
						}						
						var browserTemp = iterator.browser;
						var statusTemp = iterator.status;
						var reportidTemp = iterator.reportid;
						var testscenarioidTemp = iterator.testscenarioid;
						var scenarioName = "SELECT testscenarioname FROM testscenarios where testscenarioid="+iterator.testscenarioid+" ALLOW FILTERING";
						dbConnICE.execute(scenarioName,function(err,scenarioNameDetails){
							if(err){
								console.log(err);  
							}else{
								async.forEachSeries(scenarioNameDetails.rows,function(testScenarioNameitr,callback3){
									report.push({
										executedtime :  executedtimeTemp ,
										browser: browserTemp,
										status: statusTemp,
										reportid :  reportidTemp ,
										testscenarioid: testscenarioidTemp,
										testscenarioname :  testScenarioNameitr.testscenarioname
									})
									callback3();
								},callback2);
							}
						});
						//reportList.push(report);
					},callback);  
				}
			});
		}
	},
	function(err,results){
		//data.setHeader('Content-Type','application/json');
		if(err){
			res.send(err);
		} 
		else{
			console.log('result is :',JSON.stringify(report));
			res.send(JSON.stringify(report));
		} 
	})
}


exports.getReport = function (req, res) {
	var reportDetails=[];
	async.series({	
		reportdetails:function(callback){
			var reportDetailsQuery = "select report,time,testscenario_id from reports where report_id="
				+ reportId + "ALLOW FILTERING";
			dbConnICE.execute(reportDetailsQuery, function (err, result) {
				if(err){
					console.log(err);  
				}else{
					async.forEachSeries(result.rows,function(reportitr,callback2){
						reportDetails.push({
							report :  reportitr.rows[i].report ,
							testscenarioid: reportitr.rows[i].testscenarioid
						})
						var releaseids = "SELECT testsuiteid,cycleid,testsuitename FROM testsuites WHERE testscenarioids CONTAINS "+iterator.projectid;
						dbConnICE.execute(releaseids,function(err,releaseidsdata){
							if(err){
								console.log(err);  
							}else{

							}
						})
					}, callback);
				}
			});
		}
	})
}

exports.getReport_Nineteen68 = function(req, res) {
	var reportId = req.body.reportId;
	var testsuiteId = req.body.testsuiteId;
	var reportInfoObj = {};
	var reportjson = {};
	async.series({
		projectsUnderDomain: function(callback) {
			var getReportQuery = "select report,executedtime,testscenarioid from reports where reportid=" +
			reportId + " ALLOW FILTERING";
			dbConnICE.execute(getReportQuery, function(err, reportResult) {
				if (err) {
					console.log(err);
				} else {
					var reportres = reportResult.rows.length;          
					async.forEachSeries(reportResult.rows, function(iterator, callback1) {
						var reportdata = iterator.report;
						var executedtime = iterator.executedtime;
						var testscenarioid = iterator.testscenarioid;
						reportjson.reportdata = reportdata;
						reportInfoObj.reportId = reportId;
						reportInfoObj.executedtime = executedtime;
						reportInfoObj.testscenarioid = testscenarioid;
						var getReportQuery2 = "select testscenarioname,projectid from testscenarios where testscenarioid=" + testscenarioid + " ALLOW FILTERING";
						dbConnICE.execute(getReportQuery2, function(err, scenarioResult) {
							if (err) {
								console.log(err);
							} else {
								async.forEachSeries(scenarioResult.rows, function(sceiditr, callback2) {

									var testscenarioname = sceiditr.testscenarioname;
									var projectid = sceiditr.projectid;
									reportInfoObj.testscenarioname = testscenarioname;
									reportInfoObj.projectid = projectid;
									var getReportQuery3 = "select testscenarioids,cycleid from testsuites ";
									dbConnICE.execute(getReportQuery3, function(err, suiteResult) {
										if (err) {
											console.log(err);
										} else {
											// var   testscenarioids=[];
											async.forEachSeries(suiteResult.rows, function(suiteiditr, callback3) {
												// count=0;
												console.log('suiteResult.rows', suiteResult.rows.length);
												testscenarioids12 = suiteiditr.testscenarioids;
												if (testscenarioids12 != null) {
													for (var i = 0; i < testscenarioids12.length; i++) {
														if (testscenarioids12[i].toString() == testscenarioid.toString()) {
															cycleid = suiteiditr.cycleid;
															reportInfoObj.cycleid = cycleid;
															break;
														}
													}
												}
												//   callback3();
												var cycledetails = "select cyclename,releaseid from cycles";
												dbConnICE.execute(cycledetails, function(err, cycleResult) {
													if (err) {
														console.log(err);
													} else {
														async.forEachSeries(cycleResult.rows, function(cycleiditr, callback4) {
															var cyclename = cycleiditr.cyclename;
															var releaseid = cycleiditr.releaseid;
															reportInfoObj.cyclename = cyclename;
															reportInfoObj.releaseid = releaseid;
															console.log('final reportInfoObj', reportInfoObj);
															// callback4();
															var releasedetails = "select releasename,projectid from releases where releaseid=" + releaseid + " ALLOW FILTERING";
															dbConnICE.execute(releasedetails, function(err, releaseResult) {
																if (err) {
																	console.log(err);
																} else {
																	async.forEachSeries(releaseResult.rows, function(reliditr, callback5) {
																		var releasename = reliditr.releasename;
																		var projectid = reliditr.projectid;
																		reportInfoObj.releasename = releasename;
																		reportInfoObj.projectid = projectid;
																		console.log('final reportInfoObj in release deatails', reportInfoObj);

																		var projectdeatils = "select projectname,domainid from projects where projectid=" + projectid + " ALLOW FILTERING";
																		dbConnICE.execute(projectdeatils, function(err, projectResult) {
																			if (err) {
																				console.log(err);
																			} else {
																				async.forEachSeries(projectResult.rows, function(proiditr, callback6) {

																					var projectname = proiditr.projectname;
																					var domainid = proiditr.domainid;
																					reportInfoObj.projectname = projectname;
																					reportInfoObj.domainid = domainid;
																					console.log('final reportInfoObj in project deatails', reportInfoObj);

																					var domaindetails = "select domainname from domains where domainid=" + domainid + " ALLOW FILTERING";
																					dbConnICE.execute(domaindetails, function(err, domainResult) {
																						if (err) {
																							console.log(err);
																						} else {
																							async.forEachSeries(domainResult.rows, function(domainiditr, callback7) {
																								var domainname = domainiditr.domainname;
																								reportInfoObj.domainname = domainname;
																								console.log('final reportInfoObj in domain deatails', reportInfoObj);
																								callback7();
																							}, callback6);
																						}


																					});
																				}, callback5);
																			}
																		});
																	}, callback4);

																}

															});

														}, callback3);
													}


												});
											}, callback2);

										}
									});


								}, callback1);

							}

						});
					}, callback);
				}

			});

			//adding false check paran
			// }

		}

	},
	function(err, results) {
		// data.setHeader('Content-Type','application/json');
		if (err) {
			console.log(err);
			cb(err);
		} else {
			console.log('in last function');
			var finalReport = [];
			finalReport.push(reportInfoObj);
			finalReport.push(reportjson)
			res.send(finalReport);
		}
	}
	);
};

// serviceController.createStructure= {
// 		handler: function(req, reply) {
// 			var RequestedJSON={ "projectId": "42c3238d-7c0f-48dc-a6e1-fd5deeab845f","releaseId":"05329457-f02f-4d41-8ffc-9e04d2d380e3","cycleId": "69906803-f30d-485a-9bd1-0719c3e70ff4","appType": "Web","testsuiteDetails": [{"testsuiteName": "AHRI_RFRN_Manage_Disciplinary_Mode_Penalty","testscenarioDetails": [{"testscenarioName": "RFRN_OEM_Prerequisites","screenDetails": [{"screenName": "AHRI_Login","testcaseDetails": [{"testcaseName": "AHRI_USHP_AT"}]}, {"screenName": "Common_Excel_Data","testcaseDetails": [{"testcaseName": "AHRI_USAC_PBM"}]}]}, {"testscenarioName": "RFRN_Manage_Disciplinary_Mode_Penalty","screenDetails": [{"screenName": "Common_Manage_Program","testcaseDetails": [{"testcaseName": "USAC_Systems"}, {"testcaseName": "USAC_PBM_Single_Entry"}]}, {"screenName": "AHRI_QuickSearch","testcaseDetails": [{"testcaseName": "USAC_QuickSearch"}, {"testcaseName": "USHP_QuickSearch"}]}]}]}]};
// 			var projectid=RequestedJSON.projectId;
// 			var cycleId=RequestedJSON.cycleId;
// 			console.log('projectid',projectid);
// 			console.log('cycleId',cycleId);
// 			var suite=RequestedJSON.testsuiteDetails.length;
// 			console.log('before async calllllllllllll');
// 			async.forEachSeries(suite, function(suiteiterator, callback1) {
// 				console.log('inside suite async series')
// 				var suiteID=uuid(); 
// 				var suitedetails=RequestedJSON.testsuiteDetails[i];
// 				var testsuiteName=suitedetails.testsuiteName;
// 				var insertInSuite="INSERT INTO testsuites (cycleid,testsuitename,testsuiteid,versionnumber,condtitioncheck,createdby,createdon,createdthrough,deleted,donotexecute,getparampaths,history,modifiedby,modifiedon,skucodetestsuite,tags,testscenarioids) VALUES ("+cycleId+",'"+testsuiteName+"',"+suiteID+",1,null,'Kavyashree',"+new Date().getTime()+",null,null,null,null,null,null,"+new Date().getTime()+",null,null,null);";
// 				dbConnICE.execute(insertInSuite,function(err,result){
// 					if(err){
// 						console.log(err);
// 					}else{
// 						var scenario=suitedetails.testscenarioDetails.length;
// 						async.forEachSeries(scenario, function(scenarioiterator, callback2) {
// 							var scenarioId=uuid();
// 							scenariosarray.push(scenarioId);
// 							var modifiedon=new Date().getTime();
// 							var scenariodetails=suitedetails.testscenarioDetails[j];
// 							var scenarioName=scenariodetails.testscenarioName;
// 							var insertInScenario="insert into testscenarios(projectid,testscenarioname,testscenarioid,createdby,createdon,deleted,history,modifiedby,modifiedbyrole,modifiedon,skucodetestscenario,tags,testcaseids) VALUES ("+projectid+",'"+scenarioName+"',"+scenarioId+",'Kavyashree',"+new Date().getTime()+",null,null,null,null,"+new Date().getTime()+",null,null,null)";

// 							dbConn.execute(insertInScenario,function(err,result){
// 								if(err){
// 									console.log(err);
// 								}else{

// 									console.log('scenario successfullly inserted');
// 									var screen=scenariodetails.screenDetails.length;
// 									async.forEachSeries(screen, function(screeniterator, callback3) {
// 										var screenId=uuid();
// 										var screenDetails=scenariodetails.screenDetails[k];
// 										var screenName=screenDetails.screenName;
// //										console.log('screenName details',screenName);
// 										var insertInScreen="INSERT INTO screens (projectid,screenname,screenid,versionnumber,createdby,createdon,createdthrough,deleted,history,modifiedby,modifiedon,screendata,skucodescreen,tags) VALUES ("+projectid+",'"+screenName+"',"+screenId+",1,'Kavyashree',"+new Date().getTime()+",null,null,null,null,"+new Date().getTime()+",null,null,null)";
// 										dbConn.execute(insertInScreen,function(err,result){
// 											if(err){
// 												console.log(err);
// 											}else{

// 												console.log('SCREEN successfullly inserted');
// 												var testcase=screenDetails.testcaseDetails.length;
// 												async.forEachSeries(testcase, function(testcaseiterator, callback4) {
// 													var testcaseID=uuid();
// 													testcasesarray.push(testcaseID);
// //													console.log('testcasesarray lengthhhhhhhhhhhhhhhhhh',testcasesarray);
// 													var testcaseDetails=screenDetails.testcaseDetails[a];
// 													var testcaseName=testcaseDetails.testcaseName;
// //													console.log('testcaseName details',testcaseName);
// 													var insertInTescase="INSERT INTO testcases (screenid,testcasename,testcaseid,versionnumber,createdby,createdon,createdthrough,deleted,history,modifiedby,modifiedon,skucodetestcase,tags,testcasesteps)VALUES ("+screenId+",'"+testcaseName+"',"+testcasesarray[a]+",1,'Kavyashree',"+new Date().getTime()+",null,null,null,null,"+new Date().getTime()+",null,null,null)";

// 													dbConn.execute(insertInTescase,function(err,result){
// 														if(err){
// 															console.log(err);
// 														}else{

// 															console.log('Tescase successfullly inserted');
// 														}
// 													});
// 												},callback3);
// 											}
// 										});
// 									},callback2);
// 								}
// 							});
// 						},callback1);
// 					}
// 				});
// 			});
// 		}
// })
// };




