/**
 * Dependencies.
 */
//var passwordHash = require('password-hash');
var uuid = require('uuid-random');
var async = require('async');
var Client = require("node-rest-client").Client;
var client = new Client();
var neo4jAPI = require('../controllers/neo4jAPI');
var logger = require('../../logger');
var epurl = "http://"+process.env.NDAC_IP+":"+process.env.NDAC_PORT+"/";
var qList=[]; //For neurongraphs

function get_moduleName(moduleId, cb, data) {
	logger.info("Inside the function get_moduleName");
	var obj = {
		flag: false,
		modulename: '',
		testscenarioids: []
	};
	var inputs = {
		"id": moduleId,
		"name": "module"
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from get_moduleName: create_ice/getNames_Ninteen68");
	client.post(epurl+"create_ice/getNames_Ninteen68", args,
		function (modulename, response) {
		if (response.statusCode != 200 || modulename.rows == "fail") {
			logger.error("Error occured in create_ice/getNames_Ninteen68: get_moduleName, Error Code : ERRNDAC");
			cb(null, modulename.rows);
		} else {
			if (modulename.rows.length != 0) {
				obj.flag = true;
				obj.modulename = modulename.rows[0].modulename;
				obj.testscenarioids = modulename.rows[0].testscenarioids;
			}
			cb(null, obj);
		}
	});
}

function get_screenName(screenId, cb, data) {
	logger.info("Inside the function get_screenName ");
	var obj2 = {
		flag: false,
		screenname: ''
	};
	var inputs = {
		"id": screenId,
		"name": "screen"
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from get_screenName: create_ice/getNames_Ninteen68");
	client.post(epurl+"create_ice/getNames_Ninteen68", args,
		function (screenname, response) {
		if (response.statusCode != 200 || screenname.rows == "fail") {
			logger.error("Error occured in create_ice/getNames_Ninteen68: get_screenName, Error Code : ERRNDAC");
			cb(null, screenname.rows);
		} else {
			if (screenname.rows.length != 0) {
				obj2.flag = true;
				obj2.screenname = screenname.rows[0].screenname;
			}
			cb(null, obj2);
		}
	});
}

function get_scenarioName(testscenarioId, cb, data) {
	logger.info("Inside the function get_scenarioName ");
	var obj2 = {
		flag: false,
		testscenarioname: ''
	};
	var inputs = {
		"id": testscenarioId,
		"name": "scenario"
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from get_scenarioName: create_ice/getNames_Ninteen68");
	client.post(epurl+"create_ice/getNames_Ninteen68", args,
		function (testscenarioname, response) {
		if (response.statusCode != 200 || testscenarioname.rows == "fail") {
			logger.error("Error occured in create_ice/getNames_Ninteen68: get_scenarioName, Error Code : ERRNDAC");
			cb(null, testscenarioname.rows);
		} else {
			if (testscenarioname.rows.length != 0) {
				obj2.flag = true;
				obj2.testscenarioname = testscenarioname.rows[0].testscenarioname;
			}
			cb(null, obj2);
		}
	});
}

function get_testcaseName(testcaseId, cb, data) {
	logger.info("Inside the function get_testcaseName ");
	var obj3 = {
		flag: false,
		testcasename: ''
	};
	var inputs = {
		"id": testcaseId,
		"name": "testcase"
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from get_testcaseName: create_ice/getNames_Ninteen68");
	client.post(epurl+"create_ice/getNames_Ninteen68", args,
		function (testcasename, response) {
		if (response.statusCode != 200 || testcasename.rows == "fail") {
			logger.error("Error occured in create_ice/getNames_Ninteen68: get_testcaseName, Error Code : ERRNDAC");
			cb(null, testcasename.rows);
		} else {
			if (testcasename.rows.length != 0) {
				obj3.flag = true;
				obj3.testcasename = testcasename.rows[0].testcasename;
			}
			cb(null, obj3);
		}
	});
}

exports.getAllNames = function (parent, cb, data) {
	logger.info("Inside UI service: getAllNames");
	var parent_length = parent.length;
	var allNames = {
		"testsuitename": "",
		"screenname": "",
		"testcasename": "",
		"scenarioname": "",
		"testscenarioIds": []
	};
	async.series({
		modulename: function (callback) {
			logger.info("Inside the function modulename : service getAllNames");
			logger.info("Calling function get_moduleName from the service getAllNames");
			get_moduleName(parent[1], function (err, data) {
				if (err) {
					logger.error("Error occured in the function modulename: service getAllNames: %s",err);
				}
				else {
					allNames.modulename = data.modulename;
					allNames.testscenarioIds.push(data.testscenarioids);
					callback();
				}
			});
		},
		scenarioname: function (callback) {
			logger.info("Inside the function scenarioname : service getAllNames");
			if (parent_length == 5 || parent_length == 3) {
				logger.info("Calling function get_scenarioName from the service getAllNames");
				get_scenarioName(parent[2], function (err, data2) {
					if (err) {
						logger.info("Error occured in the function scenarioname: service getAllNames: ",err);
					}
					else {
						allNames.scenarioname = data2.testscenarioname;
						callback();
					}
				});
			} else {
				callback();
			}
		},
		screenname: function (callback) {
			logger.info("Inside the function screenname: service getAllNames");
			if (parent_length >= 4) {
				logger.info("Calling function get_screenName from the service getAllNames");
				get_screenName(parent[3], function (err, data2) {
					if (err) {
						logger.error("Error occured in the function screenname: service getAllNames: %s",err);
					}
					else {
						allNames.screenname = data2.screenname;
						callback();
					}
				});
			} else {
				callback();
			}
		},
		testcasename: function (callback) {
			logger.info("Inside the function testcasename: getAllNames");
			if (parent_length == 5) {
				logger.info("Calling function get_testcaseName from the service getAllNames");
				get_testcaseName(parent[4], function (err, data3) {
					if (err) {
						logger.error("Error occured in the function testcasename: service getAllNames: %s",err);
					}
					else {
						allNames.testcasename = data3.testcasename;
						callback();
					}
				});
			} else {
				callback();
			}
		}
	}, function (err, data) {
		cb(null, allNames);
	});
};

//CreateStrcutre
exports.createStructure_Nineteen68 = function (req, res) {
	logger.info("Inside UI service: createStructure_Nineteen68");
	var createdthrough = 'Mindmaps Creation';
	var RequestedJSON = req;
	var projectid = RequestedJSON.projectId;
	var oldprojectid = RequestedJSON.oldprojectId;
	var cycleId = RequestedJSON.cycleId;
	var releaseId = RequestedJSON.releaseId;
	var appType = RequestedJSON.appType;
	var username_role = 'Nineteen68_Admin';
	var username = RequestedJSON.userName.toLowerCase();
	var suiteID = uuid();
	var suitedetails = RequestedJSON.testsuiteDetails[0];
	var testsuiteName = suitedetails.testsuiteName;
	var moduleid_c = suitedetails.testsuiteId_c;
	var scenarioidlist = [];
	var scenario = [];
	var suitedetailslist = [];
	var versionnumber=0;
	var newversionnumber=0;
	if (RequestedJSON.from_version != undefined && RequestedJSON.new_version !=undefined) {
		versionnumber = RequestedJSON.from_version;
		newversionnumber = RequestedJSON.new_version;
	}
	
	var cloneflag = RequestedJSON.action;
	var suiteflag = false;
	qList=[]; //For neurongraphs
	async.series({
		projectsUnderDomain: function (callback) {
			logger.info("Inside projectsUnderDomain function: createStructure_Nineteen68");
			suiteflag = false;
			var suiteidTemp = '';
			var scenariodetailslist = [];
			var testsuiteidneo = suitedetails.testsuiteId;
			var tasksuite = suitedetails.task;
			var suite_query = '';
			testsuiteid_exists({
				"modulename": testsuiteName,
				"moduleid": moduleid_c,
				'modifiedby': username,
				'modifiedbyrole':username_role,
				"pid": projectid,
				"versionnumber": versionnumber,
				"newversionnumber": newversionnumber
			}, function (err, data) {
				if (err) {
					logger.error("Error occured in the function projectsUnderDomain: createStructure_Nineteen68: %s",err);
				} else {
					suiteflag = data.flag;
					suiteidTemp = data.suiteid;
				}
				if (!suiteflag) {
					suite_query = 'notflagsuite';
				}
				else {
					suite_query = 'selectsuite';
					suiteID = suiteidTemp;
				}
				var testsuiteobj = {
					"testsuiteId": testsuiteidneo,
					"testsuiteId_c": suiteID,
					"testsuiteName": testsuiteName,
					"task": tasksuite,
					"testscenarioDetails": scenariodetailslist
				};
				suitedetailslist.push(testsuiteobj);
				var inputs = {
					"query": suite_query,
					'projectid': projectid,
					'modulename': testsuiteName,
					'moduleid': suiteID,
					'versionnumber': newversionnumber,
					'createdby': username,
					'createdthrough': createdthrough,
					'deleted': false,
					'skucodemodule': 'skucodemodule',
					'tags': 'tags'
				};
				if (cloneflag) {
					inputs.subquery='clonenode';
					inputs.oldversionnumber=versionnumber;
					inputs.oldprojectid=oldprojectid;
				}
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from projectsUnderDomain "+suite_query+": create_ice/insertInSuite_ICE");
				client.post(epurl+"create_ice/insertInSuite_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/insertInSuite_ICE: projectsUnderDomain, Error Code : ERRNDAC");
					} else {
						scenario = suitedetails.testscenarioDetails;
						var scenariosarray = [];
						var testcaseidlist = [];
						async.forEachSeries(scenario, function (iterator, callback2) {
							var scenarioId = uuid();
							scenariosarray.push(scenarioId);
							var scenarioName = iterator.testscenarioName;
							var scenarioid_c = iterator.testscenarioId_c;
							var scenarioflag = false;
							var scenarioidTemp = '';
							var screendetailslist = [];
							var taskscenario = iterator.task;
							var scenarioidneo = iterator.testscenarioId;
							testscenariosid_exists({
								"testscenarioname": scenarioName,
								"testscenarioid": scenarioid_c,
								"pid": projectid,
								'modifiedby': username,
								'modifiedbyrole':username_role,
								"versionnumber": versionnumber,
								"newversionnumber": newversionnumber
							}, function (err, scenariodata) {
								if (err) {
									logger.error("Error occured in the function projectsUnderDomain: createStructure_Nineteen68: %s",err);
								} else {
									scenarioflag = scenariodata.flag;
									scenarioidTemp = scenariodata.scenarioid;
								}
								var scenario_query = '';
								if (!scenarioflag) {
									scenario_query = 'notflagscenarios';
								}
								else {
									scenario_query = 'deletescenarios';
									scenarioId = scenarioidTemp;
								}
								var scenariodetailsobj = {
									"testscenarioId": scenarioidneo,
									"testscenarioId_c": scenarioId,
									"screenDetails": screendetailslist,
									"tasks": taskscenario,
									"testscenarioName": scenarioName
								};
								scenariodetailslist.push(scenariodetailsobj);
								var inputs = {
									"query": scenario_query,
									'projectid': projectid,
									'testscenarioname': scenarioName,
									'testscenarioid': scenarioId,
									'versionnumber': newversionnumber,
									'createdby': username,
									'createdthrough': createdthrough,
									'deleted': false,
									'skucodetestscenario': 'skucodetestscenario',
									'tags': 'tags'
								};
								if (cloneflag) {
									inputs.subquery='clonenode';
									inputs.oldversionnumber=versionnumber;
									inputs.oldprojectid=oldprojectid;
								}
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								logger.info("Calling NDAC Service from projectsUnderDomain "+suite_query+": create_ice/insertInSuite_ICE");
								client.post(epurl+"create_ice/insertInScenarios_ICE", args,
									function (result, response) {
									if (response.statusCode != 200 || result.rows == "fail") {
										logger.error("Error occured in create_ice/insertInSuite_ICE: projectsUnderDomain, Error Code : ERRNDAC");
									} else {
										//Execute neo4j query!!
										if(scenario_query=='notflagscenarios'){
											//Execute neo4j query!!
											qList.push({"statement":"MERGE (n:TESTSCENARIOS_NG {projectid:'"+projectid+"',testscenarioname:'"+scenarioName+"',testscenarioid:'"+scenarioId+"',testcaseids:[]}) SET n.deleted='false' return n"});
											//Add relationship between scenario and testsuite
											qList.push({"statement":"MATCH (a:TESTSUITES_NG),(b:TESTSCENARIOS_NG{testscenarioid:'"+scenarioId+"'}) WHERE '"+scenarioId+"' IN a.testscenarioids MERGE (a)-[r:FTSUTTSC_NG{id:'"+scenarioId+"'}]->(b)RETURN a,b,r"});
											
											qList.push({"statement":"MATCH (a:TESTSCENARIOS_NG{testscenarioid:'"+scenarioId+"'}),(b:TESTCASES_NG) WHERE b.testcaseid IN a.testcaseids MERGE (a)-[r:FTSCTTCE_NG{id:b.testcaseid}]->(b) RETURN a,r,b"});
										}
										else if(scenario_query=='deletescenarios')
											qList.push({"statement":"MATCH (n: TESTSCENARIOS_NG { testscenarioname: '"+scenarioName+"',testscenarioid: '"+scenarioId+"' }) set n.testcaseids=[]"});

										scenarioidlist.push(scenarioId);
										var screen = iterator.screenDetails;
										async.forEachSeries(screen, function (screenitr, callback3) {
											var screenId = uuid();
											var screenDetails = screenitr;
											var screenName = screenitr.screenName;
											var screenid_c = screenitr.screenId_c;
											var screenflag = false;
											var screenidTemp = '';
											var testcasedetailslist = [];
											var screenidneo = screenitr.screenId;
											var taskscreen = screenitr.task;
											testscreen_exists({
												"testscreenname": screenName,
												"testscreenid": screenid_c,
												"pid": projectid,
												'modifiedby': username,
												'modifiedbyrole':username_role,
												"versionnumber": versionnumber,
												"newversionnumber": newversionnumber
											}, function (err, screendata) {
												if (err) {
													logger.error("Error occured in the function projectsUnderDomain: createStructure_Nineteen68: %s",err);
												} else {
													screenflag = screendata.flag;
													screenidTemp = screendata.screenid;
												}
												var screen_query = '';
													if (!screenflag) {
														screen_query = 'notflagscreen';
													}
													else {
														screen_query = 'selectscreen';
														screenId = screenidTemp;
													}
													var screendetailsobj = {
													"testcaseDetails": testcasedetailslist,
													"screenName": screenName,
													"screenId_c": screenId,
													"screenId": screenidneo,
													"task": taskscreen
												};
												screendetailslist.push(screendetailsobj);
												var inputs = {
													"query": screen_query,
													'projectid': projectid,
													'screenname': screenName,
													'screenid': screenId,
													'versionnumber': newversionnumber,
													'createdby': username,
													'createdthrough': createdthrough,
													'deleted': false,
													'skucodescreen': 'skucodescreen',
													'tags': 'tags'
												};
												if (cloneflag) {
													inputs.subquery='clonenode';
													inputs.oldversionnumber=versionnumber;
													inputs.oldprojectid=oldprojectid;
												}
												var args = {
													data: inputs,
													headers: {
														"Content-Type": "application/json"
													}
												};
												logger.info("Calling NDAC Service from createStructure_Nineteen68: create_ice/insertInScreen_ICE");
												client.post(epurl+"create_ice/insertInScreen_ICE", args,
													function (result, response) {
													if (response.statusCode != 200 || result.rows == "fail") {
														logger.error("Error occured in create_ice/insertInScreen_ICE: createStructure_Nineteen68");
													} else {
                                                        //Execute neo4j query!!
                                                        if(screen_query=='notflagscreen'){
                                                            qList.push({"statement":"MERGE (n:SCREENS_NG {projectid:'"+projectid+"',screenname:'"+screenName+"',screenid:'"+screenId+"'}) SET n.deleted='false' return n"});
                                                            //relationship
                                                            qList.push({"statement":"MATCH (a:TESTCASES_NG{screenid:'"+screenId+"'}),(b:SCREENS_NG {projectid:'"+projectid+"',screenname:'"+screenName+"',screenid:'"+screenId+"'}) MERGE (a)-[r:FTCETSCR_NG{id:'"+screenId+"'}]->(b) RETURN a,r,b"});
                                                            //reqToAPI(qList,urlData);
                                                        }
														var testcase = screenDetails.testcaseDetails;
														async.forEachSeries(testcase, function (testcaseitr, callback4) {
															var testcaseID = uuid();
															var testcaseName = testcaseitr.testcaseName;
															var testcaseid_c = testcaseitr.testcaseId_c;
															var testcaseflag = false;
															var testcaseidTemp = '';
															var testcaseidneo = testcaseitr.testcaseId;
															var tasktestcase = testcaseitr.task;
															var screenID_c_neo = testcaseitr.screenID_c;
															testcase_exists({
																"screenId": screenId,
																"testcasename": testcaseName,
																"testcaseid": testcaseid_c,
																"pid": projectid,
																'modifiedby': username,
																'modifiedbyrole':username_role,
																"versionnumber": versionnumber,
																"newversionnumber": newversionnumber
															}, function (err, testcasedata) {
																if (err) {
																	logger.error("Error occured in the function projectsUnderDomain: createStructure_Nineteen68 service: %s",err);
																} else {
																	testcaseflag = testcasedata.flag;
																	testcaseidTemp = testcasedata.testcaseid;
																}

																var testcase_query = '';
																if (!testcaseflag) {
																	testcase_query = 'notflagtestcase';
																}
																else {
																	testcase_query = 'selecttestcase';
																	testcaseID = testcaseidTemp;
																}
																var testcasedetailsobj = {
																	"screenID_c": screenID_c_neo,
																	"testcaseId": testcaseidneo,
																	"testcaseId_c": testcaseID,
																	"testcaseName": testcaseName,
																	"task": tasktestcase
																};
																testcasedetailslist.push(testcasedetailsobj);
																var inputs = {
																	"query": testcase_query,
																	'screenid': screenId,
																	'testcasename': testcaseName,
																	'testcaseid': testcaseID,
																	'versionnumber': newversionnumber,
																	'createdby': username,
																	'createdthrough': createdthrough,
																	'deleted': false,
																	'skucodetestcase': 'skucodetestcase',
																	'tags': 'tags'
																};
																if (cloneflag) {
																	inputs.subquery='clonenode';
																	inputs.oldscreenid=screenID_c_neo;
																	inputs.oldversionnumber=versionnumber;
																}
																var args = {
																	data: inputs,
																	headers: {
																		"Content-Type": "application/json"
																	}
																};
																logger.info("Calling NDAC Service from projectsUnderDomain: create_ice/insertInTestcase_ICE");
																client.post(epurl+"create_ice/insertInTestcase_ICE", args,
																	function (result, response) {
																	if (response.statusCode != 200 || result.rows == "fail") {
																		logger.error("Error occured in create_ice/insertInTestcase_ICE: createStructure_Nineteen68 service");
																	}
																	else {
																		if(testcase_query=='notflagtestcase'){
																			qList.push({"statement":"MERGE (n:TESTCASES_NG {screenid:'"+screenId+"',testcasename:'"+testcaseName+"',testcaseid:'"+testcaseID+"',versionnumber:'1'}) SET n.deleted='false' return n"});
																			//Relationship
																			qList.push({"statement":"MATCH (a:TESTCASES_NG{testcaseid:'"+testcaseID+"'}),(b:SCREENS_NG {screenid:'"+screenId+"'}) MERGE (a)-[r:FTCETSCR_NG{id:'"+screenId+"'}]->(b) RETURN a,r,b"});
																			qList.push({"statement":"MATCH (a:TESTSCENARIOS_NG),(b:TESTCASES_NG{testcaseid:'"+testcaseID+"'}) WHERE '"+testcaseID+"' IN a.testcaseids MERGE (a)-[r:FTSCTTCE_NG{id:'"+testcaseID+"'}]->(b)RETURN a,r,b"});
																		// reqToAPI(qList,urlData);
																		}
																		
																		testcaseidlist.push(testcaseID);
																		var inputs = {
																			'testcaseid': testcaseID,
																			'modifiedby': username,
																			'modifiedbyrole': username_role,
																			'projectid': projectid,
																			'testscenarioid': scenarioId,
																			'modifiedflag': scenarioflag,
																			'testscenarioname': scenarioName,
																			'versionnumber': newversionnumber
																		};
																		var args = {
																			data: inputs,
																			headers: {
																				"Content-Type": "application/json"
																			}
																		};
																		logger.info("Calling NDAC Service from projectsUnderDomain: create_ice/updateTestScenario_ICE");
																		client.post(epurl+"create_ice/updateTestScenario_ICE", args,
																			function (result, response) {
																			if (response.statusCode != 200 || result.rows == "fail") {
																				logger.error("Error occured in create_ice/updateTestScenario_ICE: createStructure_Nineteen68 service");
																			}
																			else {
																				logger.info("Successfully updated testscenarios");
																				qList.push({"statement":"MATCH (n:TESTSCENARIOS_NG {projectid:'"+projectid+"',testscenarioname:'"+scenarioName+"',testscenarioid:'"+scenarioId+"'}) SET n.testcaseids=n.testcaseids+['"+testcaseID+"'] return n"});
																				//Add relationship between scenario and testsuite
																				//qListR.push({"statement":"MATCH (a:TESTSCENARIOS_NG{testscenarioid:'"+scenarioId+"'})-[r]->(b:TESTCASES_NG) delete r"})
																				qList.push({"statement":"MATCH (a:TESTSUITES_NG),(b:TESTSCENARIOS_NG{testscenarioid:'"+scenarioId+"'}) WHERE '"+scenarioId+"' IN a.testscenarioids MERGE (a)-[r:FTSUTTSC_NG{id:'"+scenarioId+"'}]->(b)RETURN a,r,b"});
																				qList.push({"statement":"MATCH (a:TESTSCENARIOS_NG{testscenarioid:'"+scenarioId+"'}),(b:TESTCASES_NG{testcaseid:'"+testcaseID+"'}) MERGE (a)-[r:FTSCTTCE_NG{id:'"+testcaseID+"'}]->(b)RETURN a,r,b"});
																				callback4();
																			}
																		});
																	}
																	
																});
															});
														}, callback3);
													}
												});
												// callback3();
											});
										}, callback2);
									}
								});
								// callback2();
							});
						}, callback);
					}
				});
				//callback();
			});

		},
		updatescenarioids: function (callback) {
			logger.info("Inside the function updatescenarioids ");
			var inputs = {
				'testscenarioids': scenarioidlist,
				'moduleid': suiteID,
				'projectid': projectid,
				'modulename': testsuiteName,
				'modifiedflag': suiteflag,
				'modifiedby': username,
				'modifiedbyrole':username_role,
				'versionnumber': newversionnumber
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from updatescenarioids: create_ice/updateModule_ICE");
			client.post(epurl+"create_ice/updateModule_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.info("Error occured in create_ice/updateModule_ICE: createStructure_Nineteen68 service");
				} else {
					logger.info("Successfully updated Modules");
				}
				callback();

			});
		}
	},
		function (err, results) {
			logger.info("Inside final function");
			if (err) {
				logger.error("Error occured in final funtion: createStructure_Nineteen68 service: %s", err);
				res(null, err);
			} else {
				var returnJsonmindmap = {
					"projectId": projectid,
					"cycleId": cycleId,
					"releaseId": releaseId,
					"appType": appType,
					"testsuiteDetails": suitedetailslist
				};
				logger.info("Calling funtion neo4jAPI.executeQueries: createStructure_Nineteen68 service");
				neo4jAPI.executeQueries(qList,function(status,result){
					if(err){
						logger.error("Error occured in the function neo4jAPI.executeQueries: createStructure_Nineteen68: %s", err);
					} else{
						res(null, returnJsonmindmap);
					}
				});

			}
		});
};

function testsuiteid_exists(moduledetails, cb, data) {
	logger.info("Inside the function testsuiteid_exists ");
	var flagId = false;
	var obj = {
		flag: false,
		suiteid: ''
	};
	var statusflag = false;
	async.series({
		modulename: function (modulecallback) {
			logger.info("Inside the function modulename: testsuiteid_exists");
			var inputs = {
				'project_id': moduledetails.pid,
				'module_name': moduledetails.modulename,
				'name': 'suite_check',
				'versionnumber': moduledetails.newversionnumber
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from testsuiteid_exists - modulename: create_ice/testsuiteid_exists_ICE");
			client.post(epurl+"create_ice/testsuiteid_exists_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/testsuiteid_exists_ICE: testsuiteid_exists - modulename, Error Code : ERRNDAC");
					cb(null, obj);
				} else {
					if (result.rows.length != 0) {
						obj.flag = true;
						flagId = true;
						obj.suiteid = result.rows[0].moduleid;
						statusflag = true;
						//cb(null,obj);
					}
					modulecallback();
				}
			});
		},

		moduledetails: function (modulecallback) {
			logger.info("Inside the function moduledetails: testsuiteid_exists");
			if (!flagId && moduledetails.moduleid != "null") {
				var inputs = {
					'project_id': moduledetails.pid,
					'module_name': moduledetails.modulename,
					'module_id': moduledetails.moduleid,
					'name': 'suite_check_id',
					'versionnumber': moduledetails.newversionnumber
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from testsuiteid_exists - moduledetails: create_ice/testsuiteid_exists_ICE");
				client.post(epurl+"create_ice/testsuiteid_exists_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/testsuiteid_exists_ICE: testsuiteid_exists - moduledetails, Error Code : ERRNDAC");
						cb(null, obj);
					} else {
						if (result.rows.length != 0) {
							obj.flag = true;
							obj.suiteid = result.rows[0].moduleid;
							statusflag = true;
							//cb(null,obj);
						}
						modulecallback();
					}
				});
			} else {
				cb(null, obj);
			}
		},
		moduleupdate: function (modulecallback) {
			logger.info("Inside the function moduleupdate: testsuiteid_exists");
			if (!statusflag) {
				logger.info("Calling updatetestsuitename function from moduleupdate: testsuiteid_exists");
				updatetestsuitename(moduledetails, function (err, data) {
					if (err) {
						logger.error("Error in the function moduleupdate: testsuiteid_exists %s", err);
					} else {
						if (data == "success") {
							obj.flag = true;
							obj.suiteid = moduledetails.moduleid;
						}
						modulecallback(null, data);
					}
					//cb(null,obj);
				});
			} else {
				modulecallback(null, obj);
			}
		}
	}, function (err, data) {
		if (!err) {
			cb(null, obj);
		}
	});

}

function updatetestsuitename(moduledetails, cb, data) {
	logger.info("Inside the function updatetestsuitename ");
	var suitedatatoupdate = [];
	var flagtocheckifexists = false;
	var flagtocheckifdeleted = false;
	async.series({
		select: function (callback) {
			logger.info("Inside the function select: updatetestsuitename");
			var inputs = {
				'name': 'module_details',
				'id': moduledetails.moduleid
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from updatetestsuitename - select: create_ice/get_node_details_ICE");
			client.post(epurl+"create_ice/get_node_details_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/get_node_details_ICE: updatetestsuitename Error Code : ERRNDAC");
				} else {
					if (result.rows.length != 0) {
						flagtocheckifexists = true;
						suitedatatoupdate = result.rows[0];
					}
				}
				callback(null, suitedatatoupdate);
			});
		},
		delete : function (callback) {
			logger.info("Inside the function delete: updatetestsuitename");
			if (flagtocheckifexists) {
				var inputs = {
					'name': 'delete_module',
					'id': moduledetails.moduleid,
					'node_name': suitedatatoupdate.modulename,
					'version_number': suitedatatoupdate.versionnumber,
					'parent_node_id': suitedatatoupdate.projectid
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from updatetestsuitename - delete: create_ice/delete_node_ICE");
				client.post(epurl+"create_ice/delete_node_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/delete_node_ICE: updatetestsuitename Error Code : ERRNDAC");
					} else {
						flagtocheckifdeleted = true;
					}
					callback();
				});
			} else {
				callback();
			}
		},
		update: function (callback) {
			logger.info("Inside theh function update: updatetestsuitename");
			if (flagtocheckifexists && flagtocheckifdeleted) {
				var inputs = {
					'projectid': suitedatatoupdate.projectid,
					'modulename': moduledetails.modulename,
					'moduleid': suitedatatoupdate.moduleid,
					'versionnumber': moduledetails.newversionnumber,
					'modifiedby': moduledetails.modifiedby,
					'modifiedbyrole': moduledetails.modifiedbyrole,
					'modifiedon': new Date().getTime().toString(),
					'createdby': suitedatatoupdate.createdby,
					'createdthrough': suitedatatoupdate.createdthrough,
					'deleted': suitedatatoupdate.deleted.toString(),
					'skucodemodule': 'skucodemodule',
					'tags': 'tags',
					'testscenarioids': suitedatatoupdate.testscenarioids,
					'createdon': new Date(suitedatatoupdate.createdon).getTime().toString()
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from updatetestsuitename - update: create_ice/updateModulename_ICE");
				client.post(epurl+"create_ice/updateModulename_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/updateModulename_ICE: updatetestsuitename Error Code : ERRNDAC");
					} else {
						logger.info('Succesfully renamed module name');
					}
					callback(null, "success");
				});
			} else {
				callback(null, "fail");
			}
		}
	}, function (err, data) {
		cb(null, data.update);
	});

}

function testscenariosid_exists(testscenariodetails, cb, data) {
	logger.info("Inside teh function testscenariosid_exists ");
	var flagId = false;
	var obj = {
		flag: false,
		scenarioid: ''
	};
	var statusflag = false;
	async.series({
		scenarioname: function (scenariocallback) {
			logger.info("Inside the function scenarioname: testscenariosid_exists");
			var inputs = {
				'project_id': testscenariodetails.pid,
				'scenario_name': testscenariodetails.testscenarioname,
				'name': 'scenario_check',
				'versionnumber': testscenariodetails.newversionnumber
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from testscenariosid_exists - scenarioname: create_ice/testscenariosid_exists_ICE");
			client.post(epurl+"create_ice/testscenariosid_exists_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/testscenariosid_exists_ICE: testscenariosid_exists Error Code : ERRNDAC");
					cb(null, obj);
				} else {
					if (result.rows.length != 0) {
						flagId = true;
						obj.flag = true;
						obj.scenarioid = result.rows[0].testscenarioid;
						statusflag = true;
					}
					scenariocallback();
				}
			});
		},
		scenariodetails: function (scenariocallback) {
			logger.info("Inside the function scenariodetails: testscenariosid_exists");
			if (!flagId && testscenariodetails.testscenarioid != "null") {
				var inputs = {
					'project_id': testscenariodetails.pid,
					'scenario_name': testscenariodetails.testscenarioname,
					'scenario_id': testscenariodetails.testscenarioid,
					'name': 'scenario_check_id',
					'versionnumber': testscenariodetails.newversionnumber
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from testscenariosid_exists - scenariodetails: create_ice/testscenariosid_exists_ICE");
				client.post(epurl+"create_ice/testscenariosid_exists_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/testscenariosid_exists_ICE: testscenariosid_exists - scenariodetails Error Code : ERRNDAC");
						cb(null, obj);
					} else {
						if (result.rows.length != 0) {
							obj.flag = true;
							obj.scenarioid = result.rows[0].testscenarioid;
							statusflag = true;
						}
						scenariocallback();
					}
				});
			} else {
				cb(null, obj);
			}
		},
		scenarioupdate: function (scenariocallback) {
			logger.info("Inside the function scenarioupdate: testscenariosid_exists");
			if (!statusflag) {
				logger.info("Calling function updatetestscenarioname from scenarioupdate function");
				updatetestscenarioname(testscenariodetails, function (err, data) {
					if (err) {
						logger.error("Error occured in the function scenarioupdate: testscenariosid_exists - scenarioupdate: %s",err);
					} else {
						if (data == "success") {
							obj.flag = true;
							obj.scenarioid = testscenariodetails.testscenarioid;
						}
						scenariocallback(null, data);
					}
					//cb(null,obj);
				});
			} else {
				scenariocallback(null, obj);
			}
		}
	}, function (err, data) {
		if (!err) {
			cb(null, obj);
		}
	});
}

function updatetestscenarioname(testscenariodetails, cb, data) {
	logger.info("Inside the function updatetestscenarioname");
	var scenariodatatoupdate = [];
	var flagtocheckifexists = false;
	var flagtocheckifdeleted = false;
	async.series({
		select: function (callback) {
			logger.info("Inside the function select: updatetestscenarioname");
			var inputs = {
				'name': 'testscenario_details',
				'id': testscenariodetails.testscenarioid
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from updatetestscenarioname - select: create_ice/get_node_details_ICE");
			client.post(epurl+"create_ice/get_node_details_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/get_node_details_ICE: updatetestscenarioname - select, Error Code : ERRNDAC");
				} else {
					if (result.rows.length != 0) {
						flagtocheckifexists = true;
						scenariodatatoupdate = result.rows[0];
					}
				}
				callback(null, scenariodatatoupdate);
			});
		},
		delete : function (callback) {
			logger.info("Inside the function delete: updatetestscenarioname");
			if (flagtocheckifexists) {
				var inputs = {
					'name': 'delete_testscenario',
					'id': testscenariodetails.testscenarioid,
					'node_name': scenariodatatoupdate.testscenarioname,
					'version_number': scenariodatatoupdate.versionnumber,
					'parent_node_id': scenariodatatoupdate.projectid
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from updatetestscenarioname - delete: create_ice/delete_node_ICE");
				client.post(epurl+"create_ice/delete_node_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/delete_node_ICE: updatetestscenarioname - delete, Error Code : ERRNDAC");
					} else {
						//Execute neo4j query!!
						qList.push({"statement":"MATCH (n: TESTSCENARIOS_NG { testscenarioname: '"+inputs.node_name+"',testscenarioid: '"+inputs.id+"' }) detach delete n"});
						flagtocheckifdeleted = true;
					}
					callback();
				});
			} else {
				callback();
			}
		},
		update: function (callback) {
			logger.info("Inside the function update: updatetestscenarioname");
			if (flagtocheckifexists && flagtocheckifdeleted) {
				if (scenariodatatoupdate.testcaseids == null) {
					scenariodatatoupdate.testcaseids = '';
				}
				var inputs = {
					'projectid': scenariodatatoupdate.projectid,
					'testscenarioname': testscenariodetails.testscenarioname,
					'testscenarioid': testscenariodetails.testscenarioid,
					'versionnumber': testscenariodetails.newversionnumber,
					'modifiedby': testscenariodetails.modifiedby,
					'modifiedbyrole': testscenariodetails.modifiedbyrole,
					'modifiedon': new Date().getTime().toString(),
					'createdon': new Date(scenariodatatoupdate.createdon).getTime().toString(),
					'createdby': scenariodatatoupdate.createdby,
					'deleted': scenariodatatoupdate.deleted.toString(),
					'skucodetestscenario': 'skucodetestscenario',
					'tags': 'tags',
					'testcaseids': scenariodatatoupdate.testcaseids
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from updatetestscenarioname - update: create_ice/updateTestscenarioname_ICE");
				client.post(epurl+"create_ice/updateTestscenarioname_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/updateTestscenarioname_ICE: updatetestscenarioname - update, Error Code : ERRNDAC");
					} else {
	                    //Execute neo4j query!!
	                    qList.push({"statement":"MATCH(n:TESTSCENARIOS_NG{testScenarioid:'"+inputs.testscenarioid+"'}) SET n.testscenarioname='"+inputs.testscenarioname+"'"+",n.projectid='"+inputs.projectid+"' return n"});
						logger.info('Succesfully renamed Testscenario name');
					}
					callback(null, "success");
				});
			} else {
				callback(null, "fail");
			}
		}
	}, function (err, data) {
		cb(null, data.update);
	});
}

function testscreen_exists(testscreendetails, cb, data) {
	logger.info("Inside the function testscreen_exists");
	var flagId = false;
	var obj = {
		flag: false,
		screenid: ''
	};
	var statusflag = false;
	async.series({
		screenname: function (screencallback) {
			logger.info("Inside the function screenname: testscreen_exists");
			var inputs = {
				'project_id': testscreendetails.pid,
				'screen_name': testscreendetails.testscreenname,
				'name': 'screen_check',
				'versionnumber': testscreendetails.newversionnumber
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from testscreen_exists - screenname: create_ice/testscreenid_exists_ICE");
			client.post(epurl+"create_ice/testscreenid_exists_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/testscreenid_exists_ICE: testscreen_exists - screenname, Error Code : ERRNDAC");
					cb(null, obj);
				} else {
					if (result.rows.length != 0) {
						flagId = true;
						obj.flag = true;
						obj.screenid = result.rows[0].screenid;
						statusflag = true;
					}
					screencallback();
				}
			});
		},
		screendetails: function (screencallback) {
			logger.info("Inside the function screendetails: testscreen_exists");
			if (!flagId && testscreendetails.testscreenid != "null") {
				var inputs = {
					'project_id': testscreendetails.pid,
					'screen_name': testscreendetails.testscreenname,
					'screen_id': testscreendetails.testscreenid,
					'name': 'screen_check_id',
					'versionnumber': testscreendetails.newversionnumber
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from testscreen_exists - screendetails: create_ice/testscreenid_exists_ICE");
				client.post(epurl+"create_ice/testscreenid_exists_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/testscreenid_exists_ICE: testscreen_exists - screendetails, Error Code : ERRNDAC");
						cb(null, obj);
					} else {
						if (result.rows.length != 0) {
							obj.flag = true;
							obj.screenid = result.rows[0].screenid;
							statusflag = true;
						}
						screencallback();
					}
				});
			} else {
				cb(null, obj);
			}
		},
		screenupdate: function (screencallback) {
			logger.info("Inside the function screenupdate: testscreen_exists");
			if (!statusflag) {
				logger.info("Calling function updatetestscreenname from screenupdate of testscreen_exists function");
				updatetestscreenname(testscreendetails, function (err, data) {
					if (err) {
						logger.error("Error occured in the function updatetestscreenname: screenupdate of testscreen_exists function: %s", err);
					} else {
						if (data == "success") {
							obj.flag = true;
							obj.screenid = testscreendetails.testscreenid;
						}
						screencallback(null, data);
					}
					//cb(null,obj);
				});
			} else {
				screencallback(null, obj);
			}
		}
	}, function (err, data) {
		if (!err) {
			cb(null, obj);
		}
	});
}

function updatetestscreenname(testscreendetails, cb, data) {
	logger.info("Inside the function updatetestscreenname");
	var screendatatoupdate = [];
	var flagtocheckifexists = false;
	var flagtocheckifdeleted = false;
	async.series({
		select: function (callback) {
			logger.info("Inside the function select: updatetestscreenname");
			var inputs = {
				'name': 'screen_details',
				'id': testscreendetails.testscreenid
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from updatetestscreenname - select: create_ice/get_node_details_ICE");
			client.post(epurl+"create_ice/get_node_details_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/get_node_details_ICE: updatetestscreenname, Error Code : ERRNDAC");
				} else {
					if (result.rows.length != 0) {
						flagtocheckifexists = true;
						screendatatoupdate = result.rows[0];
					}
				}
				callback(null, screendatatoupdate);
			});
		},
		delete : function (callback) {
			logger.info("Inside the function delete: updatetestscreenname");
			if (flagtocheckifexists) {
				var inputs = {
					'name': 'delete_screen',
					'id': testscreendetails.testscreenid,
					'node_name': screendatatoupdate.screenname,
					'version_number': screendatatoupdate.versionnumber,
					'parent_node_id': screendatatoupdate.projectid
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from updatetestscreenname - delete: create_ice/delete_node_ICE");
				client.post(epurl+"create_ice/delete_node_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/delete_node_ICE: updatetestscreenname, Error Code : ERRNDAC");
					} else {
						// if(deleted.rows != undefined && deleted.rows.length!=0){
						flagtocheckifdeleted = true;
						//Execute neo4j query!!
						qList.push({"statement":"MATCH (n: SCREENS_NG { screenname: '"+inputs.node_name+"',screenid: '"+inputs.id+"',versionnumber:'"+inputs.version_number+"' }) detach delete n"});
					}
					callback();
				});
			} else {
				callback();
			}
		},
		update: function (callback) {
			logger.info("Inside the function update: updatetestscreenname");
			if (flagtocheckifexists) {
				if (screendatatoupdate.screendata == null) {
					screendatatoupdate.screendata = '';
				}
				var inputs = {
					'projectid': screendatatoupdate.projectid,
					'screenname': testscreendetails.testscreenname,
					'screenid': screendatatoupdate.screenid,
					'modifiedby': testscreendetails.modifiedby,
					'modifiedbyrole': testscreendetails.modifiedbyrole,
					'modifiedon': new Date().getTime().toString(),
					'createdon': new Date(screendatatoupdate.createdon).getTime().toString(),
					'createdby': screendatatoupdate.createdby,
					'createdthrough': screendatatoupdate.createdthrough,
					'deleted': screendatatoupdate.deleted.toString(),
					'skucodescreen': 'skucodescreen',
					'tags': 'tags',
					'screendata': screendatatoupdate.screendata,
					'versionnumber': testscreendetails.newversionnumber
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from updatetestscreenname - update: create_ice/updateScreenname_ICE");
				client.post(epurl+"create_ice/updateScreenname_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/updateScreenname_ICE: updatetestscreenname, Error Code : ERRNDAC");
					} else {
						logger.info('Succesfully renamed Screen name');
						//Execute neo4j query!!
						qList.push({"statement":"MATCH(n:SCREENS_NG{screenid:'"+inputs.screenid+"'}) SET n.screenname='"+inputs.screenname+"'"+",n.projectid='"+inputs.projectid+"' return n"});
					}
					callback(null, "success");
				});
			} else {
				callback(null, "fail");
			}
		}
	}, function (err, data) {
		cb(null, data.update);
	});
}

function testcase_exists(testcasedetails, cb, data) {
	logger.info("Inside the function testcase_exists");
	var flagId = false;
	var obj = {
		flag: false,
		testcaseid: ''
	};
	var statusflag = false;
	async.series({
		testcasename: function (testcasecallback) {
			logger.info("Inside the function testcasename: testcase_exists");
			var inputs = {
				'screen_id': testcasedetails.screenId,
				'testcase_name': testcasedetails.testcasename,
				'name': 'testcase_check',
				'versionnumber': testcasedetails.newversionnumber
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from testcase_exists - testcasename: create_ice/testcaseid_exists_ICE");
			client.post(epurl+"create_ice/testcaseid_exists_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/testcaseid_exists_ICE: testcase_exists, Error Code : ERRNDAC");
					cb(null, obj);
				} else {
					if (result.rows.length != 0) {
						obj.flag = true;
						flagId = true;
						obj.testcaseid = result.rows[0].testcaseid;
						statusflag = true;
					}
					testcasecallback();
				}
			});
		},
		testcasedetails: function (testcasecallback) {
			logger.info("Inside the function testcasedetails: testcase_exists function");
			if (!flagId && testcasedetails.testcaseid != "null") {
				var inputs = {
					'screen_id': testcasedetails.screenId,
					'testcase_name': testcasedetails.testcasename,
					'testcase_id': testcasedetails.testcaseid,
					'name': 'testcase_check_id',
					'versionnumber': testcasedetails.newversionnumber
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from testcase_exists - testcasedetails: create_ice/testcaseid_exists_ICE");
				client.post(epurl+"create_ice/testcaseid_exists_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/testcaseid_exists_ICE: testcase_exists - testcasedetails, Error Code : ERRNDAC");
						cb(null, obj);
					} else {
						if (result.rows.length != 0) {
							obj.flag = true;
							obj.testcaseid = result.rows[0].testcaseid;
							statusflag = true;
						}
						testcasecallback();
					}
				});
			} else {
				cb(null, obj);
			}
		},
		testcaseupdate: function (testcasecallback) {
			logger.info("Inside the function testcaseupdate: testcase_exists");
			if (!statusflag) {
				logger.info("Calling updatetestcasename function from testcaseupdate of testcase_exists function");
				updatetestcasename(testcasedetails, function (err, data) {
					if (err) {
						logger.error("Error occured in the function testcaseupdate of testcase_exists function");
					} else {
						if (data == "success") {
							obj.flag = true;
							obj.testcaseid = testcasedetails.testcaseid;
						}
						testcasecallback(null, data);
					}
					//cb(null,obj);
				});
			} else {
				testcasecallback(null, obj);
			}
		}
	}, function (err, data) {
		if (!err) {
			cb(null, obj);
		}
	});
}

function updatetestcasename(testcasedetails, cb, data) {
	logger.info("Inside the function updatetestcasename");
	var testcasedatatoupdate = [];
	var flagtocheckifexists = false;
	var flagtocheckifdeleted = false;
	async.series({
		select: function (callback) {
			logger.info("Inside the function select: updatetestcasename");
			var inputs = {
				'name': 'testcase_details',
				'id': testcasedetails.testcaseid
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from updatetestcasename - select: create_ice/get_node_details_ICE");
			client.post(epurl+"create_ice/get_node_details_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/get_node_details_ICE: updatetestcasename - select, Error Code : ERRNDAC");
				} else {
					if (result.rows.length != 0) {
						flagtocheckifexists = true;
						testcasedatatoupdate = result.rows[0];
					}
				}
				callback(null, testcasedatatoupdate);
			});
		},
		delete : function (callback) {
			logger.info("Inside the function delete: updatetestcasename");
			if (flagtocheckifexists) {
				var inputs = {
					'name': 'delete_testcase',
					'id': testcasedetails.testcaseid,
					'node_name': testcasedatatoupdate.testcasename,
					'version_number': testcasedatatoupdate.versionnumber,
					'parent_node_id': testcasedatatoupdate.screenid
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from updatetestcasename - delete: create_ice/delete_node_ICE");
				client.post(epurl+"create_ice/delete_node_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/delete_node_ICE: updatetestcasename - delete, Error Code : ERRNDAC");
					} else {
						// if(deleted.rows != undefined && deleted.rows.length!=0){
						flagtocheckifdeleted = true;
                        //Execute neo4j query!!
                        qList.push({"statement":"MATCH (n: TESTCASES_NG { testCaseName: '"+inputs.node_name+"',testCaseID: '"+inputs.id+"',versionnumber:'"+inputs.version_number+"' }) detach delete n"});
					// }
					}
					callback();
				});
			} else {
				callback();
			}
		},
		update: function (callback) {
			logger.info("Inside the function update: updatetestcasename");
			if (flagtocheckifexists && flagtocheckifdeleted) {
				if (testcasedatatoupdate.testcasesteps == null) {
					testcasedatatoupdate.testcasesteps = '';
				}
				var inputs = {
					'screenid': testcasedatatoupdate.screenid,
					'testcasename': testcasedetails.testcasename,
					'testcaseid': testcasedetails.testcaseid,
					'modifiedby': testcasedetails.modifiedby,
					'modifiedbyrole': testcasedetails.modifiedbyrole,
					'modifiedon': new Date().getTime().toString(),
					'createdon': new Date(testcasedatatoupdate.createdon).getTime().toString(),
					'createdby': testcasedatatoupdate.createdby,
					'createdthrough': testcasedatatoupdate.createdthrough,
					'deleted': testcasedatatoupdate.deleted.toString(),
					'skucodetestcase': 'skucodetestcase',
					'tags': 'tags',
					'testcasesteps': testcasedatatoupdate.testcasesteps,
					"versionnumber": testcasedetails.newversionnumber
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from updatetestcasename - update: create_ice/updateTestcasename_ICE");
				client.post(epurl+"create_ice/updateTestcasename_ICE  ", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/updateTestcasename_ICE: updatetestcasename - update, Error Code : ERRNDAC");
					} else {
						logger.info('Succesfully renamed Testcase name');
						//Execute neo4j query!!
						qList.push({"statement":"MATCH(n:TESTCASES_NG{testcaseid:'"+inputs.testcaseid+"'}) SET n.testcasename='"+inputs.testcasename+"' return n"});
					}
					callback(null, "success");
				});
			} else {
				callback(null, "fail");
			}
		}
	}, function (err, data) {
		cb(null, data.update);
	});
}

exports.getReleaseIDs_Ninteen68 = function (req, res) {
	logger.info("Inside UI service: getReleaseIDs_Ninteen68");
	var rname = [];
	var r_ids = [];
	var rel = {
		rel: [],
		r_ids: []
	};
	var project_id = req.projectId;
	inputs = {
		"projectid": project_id
	};
	args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from getReleaseIDs_Ninteen68: create_ice/getReleaseIDs_Ninteen68");
	client.post(epurl+"create_ice/getReleaseIDs_Ninteen68", args,
		function (result, response) {
			try {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/getReleaseIDs_Ninteen68: getReleaseIDs_Ninteen68, Error Code : ERRNDAC");
					res(null, result.rows);
				} else {
					async.forEachSeries(result.rows, function (iterator, callback1) {
						rname.push(iterator.releasename);
						r_ids.push(iterator.releaseid);
						callback1();
					});
					rel.rel = rname;
					rel.r_ids = r_ids;
					res(null, rel);
				}
			} catch (ex) {
				logger.error("Exception in the service getReleaseIDs_Ninteen68: %s", ex);
			}
		});
};

exports.getCycleIDs_Ninteen68 = function (req, res) {
	logger.info("Inside UI service: getCycleIDs_Ninteen68");
	var cname = [];
	var c_ids = [];
	var cyc = {
		cyc: [],
		c_ids: []
	};
	var release_id = req.relId;
	inputs = {
		"releaseid": release_id
	};
	args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from getCycleIDs_Ninteen68: create_ice/getCycleIDs_Ninteen68");
	client.post(epurl+"create_ice/getCycleIDs_Ninteen68", args,
		function (result, response) {
			try {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/getCycleIDs_Ninteen68: getCycleIDs_Ninteen68, Error Code : ERRNDAC");
					res(null, result.rows);
				} else {
					async.forEachSeries(result.rows, function (iterator, callback1) {
						cname.push(iterator.cyclename);
						c_ids.push(iterator.cycleid);
						callback1();
					});
					cyc.cyc = cname;
					cyc.c_ids = c_ids;
					res(null, cyc);
				}
			} catch (ex) {
				logger.error("Exception in the service getCycleIDs_Ninteen68: %s", ex);
			}
		});
};

exports.getProjectIDs_Nineteen68 = function (req, res) {
	logger.info("Inside UI service: getProjectIDs_Nineteen68");
	var projectdetails = {
		projectId: [],
		projectName: [],
		appType: []
	};
	var user_id = req.userid;
	var allflag = req.allflag;
	if (allflag) allflag = "allflag";
	else allflag = "emptyflag";
	var inputs = {
		"userid": user_id,
		"query": allflag
	};
	args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	async.series({
		function (callback) {
			logger.info("Calling NDAC Service from getProjectIDs_Nineteen68: create_ice/getProjectIDs_Nineteen68");
			client.post(epurl+"create_ice/getProjectIDs_Nineteen68", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/getProjectIDs_Nineteen68: getProjectIDs_Nineteen68, Error Code : ERRNDAC");
					res(null, result.rows);
				} else {
					projectdetails=result.rows;
					callback();
				}
			});
		}
	}, function (err, results) {
		try {
			res(null, projectdetails);
		} catch (ex) {
			logger.info("Exception in the service getProjectIDs_Nineteen68: ", ex);
		}
	});
};

exports.getProjectType_Nineteen68 = function (req, res) {
	logger.info("Inside UI service: getProjectType_Nineteen68");
	var projectDetails = {
		projectType: '',
		project_id: ''
	};
	var project_id = req;
	inputs = {
		"projectid": project_id
	};
	args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from getProjectType_Nineteen68: create_ice/getProjectType_Nineteen68");
	client.post(epurl+"create_ice/getProjectType_Nineteen68", args,
		function (result, response) {
		try {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occured in create_ice/getProjectType_Nineteen68: getProjectType_Nineteen68, Error Code : ERRNDAC");
				res(null, result.rows);
			} else {
				if (result.rows.length != 0) {
					projectDetails.projectType = result.rows[0].projecttypeid;
					projectDetails.project_id = req;
					projectDetails.project_typename = result.projecttype[0].projecttypename;
				}
				res(null, projectDetails);
			}
		} catch (ex) {
			logger.error("Exception in the service getProjectType_Nineteen68: %s", ex);
		}
	});
};

exports.createE2E_Structure_Nineteen68 = function (req, res) {
	logger.info("Inside UI service: createE2E_Structure_Nineteen68");
	var createdthrough = 'Mindmaps Creation';
	var RequestedJSON = req;
	var projectid = RequestedJSON.projectId;
	var cycleId = RequestedJSON.cycleId;
	var releaseId = RequestedJSON.releaseId;
	var appType = RequestedJSON.appType;
	var username = RequestedJSON.userName.toLowerCase();
	var username_role = 'Nineteen68_Admin';
	var suiteID = uuid();
	var suitedetails = RequestedJSON.testsuiteDetails[0];
	var testsuiteName = suitedetails.testsuiteName;
	var moduleid_c = suitedetails.testsuiteId_c;
	var scenarioidlist = [];
	var scenario = [];
	var suitedetailslist = [];
	var versionnumber = 0;
	var suiteflag = false;
	async.series({
		projectsUnderDomain: function (callback) {
			logger.info("Inside the function projectsUnderDomain: createE2E_Structure_Nineteen68");
			suiteflag = false;
			var suiteidTemp = '';
			var scenariodetailslist = [];
			var testsuiteidneo = suitedetails.testsuiteId;
			var tasksuite = suitedetails.task;
			projectid = suitedetails.projectID;
			testsuiteid_exists({
				"modulename": testsuiteName,
				"moduleid": moduleid_c,
				'modifiedby': username,
				'modifiedbyrole':username_role,
				"pid": projectid,
				"versionnumber": versionnumber,
				"newversionnumber": versionnumber
			}, function (err, data) {
				if (err) {
					logger.error("Error occured in projectsUnderDomain: createE2E_Structure_Nineteen68: %s",err);
				} else {
					suiteflag = data.flag;
					suiteidTemp = data.suiteid;
				}
				var query_name;
				if (!suiteflag) {
					query_name = 'notflagsuite';
				} else {
					query_name = 'selectsuite';
					suiteID = suiteidTemp;
				}
				var testsuiteobj = {
					"testsuiteId": testsuiteidneo,
					"testsuiteId_c": suiteID,
					"testsuiteName": testsuiteName,
					"task": tasksuite,
					"testscenarioDetails": scenariodetailslist
				};
				suitedetailslist.push(testsuiteobj);
				var inputs = {
					"query": query_name,
					'projectid': projectid,
					'modulename': testsuiteName,
					'moduleid': suiteID,
					'versionnumber': versionnumber,
					'createdby': username,
					'createdthrough': createdthrough,
					'deleted': false,
					'skucodemodule': 'skucodemodule',
					'tags': 'tags'
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from projectsUnderDomain: createE2E_Structure_Nineteen68: create_ice/insertInSuite_ICE");
				client.post(epurl+"create_ice/insertInSuite_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in create_ice/insertInSuite_ICE: projectsUnderDomain: createE2E_Structure_Nineteen68, Error Code : ERRNDAC");
					} else {
						scenario = suitedetails.testscenarioDetails;
						var scenariosarray = [];
						async.forEachSeries(scenario, function (iterator, callback2) {
							var scenarioId = uuid();
							scenariosarray.push(scenarioId);
							var scenarioName = iterator.testscenarioName;
							var scenarioid_c = iterator.testscenarioId_c;
							var scenarioflag = false;
							var scenarioidTemp = '';
							var screendetailslist = [];
							var taskscenario = iterator.task;
							var scenarioidneo = iterator.testscenarioId;
							var prjID = iterator.projectID;
							testscenariosid_exists({
								"testscenarioname": scenarioName,
								"testscenarioid": scenarioid_c,
								'modifiedby': username,
								'modifiedbyrole':username_role,
								"pid": prjID,
								"versionnumber": versionnumber,
								"newversionnumber": versionnumber
							}, function (err, scenariodata) {
								if (err) {
									logger.error("Error occured in projectsUnderDomain: createE2E_Structure_Nineteen68: create_ice/insertInSuite_ICE %s",err);
									cb(null, err);
								} else {
									scenarioflag = scenariodata.flag;
									scenarioidTemp = scenariodata.scenarioid;
								}
								if (!scenarioflag) {
									logger.info("Scenario does not exists");
								} else {
									scenarioId = scenarioidTemp;
									scenarioidlist.push(scenarioId);
									var scenariodetailsobj = {
										"scenario_PrjId": prjID,
										"testscenarioId": scenarioidneo,
										"testscenarioId_c": scenarioId,
										"screenDetails": screendetailslist,
										"tasks": taskscenario,
										"testscenarioName": scenarioName
									};
									scenariodetailslist.push(scenariodetailsobj);
								}
								callback2();
							});
						}, callback);
					}
				});
			});
		},
		updatescenarioids: function (callback) {
			logger.info("Inside the function updatescenarioids: createE2E_Structure_Nineteen68");
			var inputs = {
				'testscenarioids': scenarioidlist,
				'moduleid': suiteID,
				'projectid': projectid,
				'modulename': testsuiteName,
				'modifiedflag': suiteflag,
				'modifiedby': username,
				'modifiedbyrole':username_role,
				'versionnumber': versionnumber
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from updatescenarioids: createE2E_Structure_Nineteen68: create_ice/updateModule_ICE");
			client.post(epurl+"create_ice/updateModule_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/updateModule_ICE: updatescenarioids: createE2E_Structure_Nineteen68, Error Code : ERRNDAC");
				} else {
					logger.info("Successfully updated Modules");
				}
				callback();
			});
		}
	},
	function (err, results) {
		if (err) {
			logger.error("Error occured in createE2E_Structure_Nineteen68: %s",err);
			res(null, err);
		} else {
			var returnJsonmindmap = {
				"projectId": projectid,
				"cycleId": cycleId,
				"releaseId": releaseId,
				"appType": appType,
				"testsuiteDetails": suitedetailslist
			};
			res(null,returnJsonmindmap);
		}
	});
};


exports.submitTask = function (req, res) {
	logger.info("Inside UI service: submitTask");
	var taskdetails = req.taskdetails;
	inputs = {
		'status': req.status,
		'table': taskdetails.labels[0],
		'details': taskdetails.properties,
		'username': req.user,
		'versionnumber': req.versionnumber
	};
	args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from submitTask: create_ice/submitTask");
	client.post(epurl+"create_ice/submitTask", args,
		function (result, response) {
			try {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in create_ice/submitTask: submitTask, Error Code : ERRNDAC");
					res(null, result.rows);
				} else {
					logger.info("Task submitted successfully");
				}
			} catch (ex) {
				logger.error("Exception in the service submitTask: %s", ex);
			}
		});
};
