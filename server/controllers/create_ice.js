/**
 * Dependencies.
 */
//var passwordHash = require('password-hash');
var uuid = require('uuid-random');
var async = require('async');
//var dbConnICE = require('../../server/config/icetestautomation');
var Client = require("node-rest-client").Client;
var client = new Client();

function get_moduleName(moduleId, cb, data) {
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
	client.post("http://127.0.0.1:1990/create_ice/getNames_Ninteen68", args,
		function (modulename, response) {
		if (response.statusCode != 200 || modulename.rows == "fail") {
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
	client.post("http://127.0.0.1:1990/create_ice/getNames_Ninteen68", args,
		function (screenname, response) {
		if (response.statusCode != 200 || screenname.rows == "fail") {
			console.log(screenname.rows);
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
	client.post("http://127.0.0.1:1990/create_ice/getNames_Ninteen68", args,
		function (testscenarioname, response) {
		if (response.statusCode != 200 || testscenarioname.rows == "fail") {
			console.log(testscenarioname.rows);
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
	client.post("http://127.0.0.1:1990/create_ice/getNames_Ninteen68", args,
		function (testcasename, response) {
		if (response.statusCode != 200 || testcasename.rows == "fail") {
			console.log(testcasename.rows);
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
			get_moduleName(parent[1], function (err, data) {
				if (err) {
					console.log(err);
				}
				else {
					allNames.modulename = data.modulename;
					allNames.testscenarioIds.push(data.testscenarioids);
					callback();
				}
			});
		},
		scenarioname: function (callback) {
			if (parent_length == 5 || parent_length == 3) {
				get_scenarioName(parent[2], function (err, data2) {
					if (err) {
						console.log(err);
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
			if (parent_length >= 4) {
				get_screenName(parent[3], function (err, data2) {
					if (err) {
						console.log(err);
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
			if (parent_length == 5) {
				get_testcaseName(parent[4], function (err, data3) {
					if (err) {
						console.log(err);
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

/*function testscreen_exists(testscreenname, cb, data) {
	var flag = false;
	var obj = {
		flag: false,
		screenid: ''
	};
	var inputs = {
		"screen_name": testscreenname
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	client.post("http://127.0.0.1:1990/create_ice/testscreen_exists_ICE", args,
		function (result, response) {
		if (response.statusCode != 200 || result.rows == "fail") {
			console.log(result.rows);
			cb(null, result.rows);
		} else {
			if (result.rows.length != 0) {
				obj.flag = true;
				obj.screenid = result.rows[0].screenid;
			}
			cb(null, obj);
		}
	})
}

function testcase_exists(testcasename, cb, data) {
	var flag = false;
	var obj = {
		flag: false,
		testcaseid: ''
	};
	var inputs = {
		"testcase_name": testcasename
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	client.post("http://127.0.0.1:1990/create_ice/testcase_exists_ICE", args,
		function (result, response) {
		if (response.statusCode != 200 || result.rows == "fail") {
			console.log(result.rows);
			cb(null, result.rows);
		} else {
			if (result.rows.length != 0) {
				obj.flag = true;
				obj.testcaseid = result.rows[0].testcaseid;
			}
			cb(null, obj);
		}

	})
}*/

//CreateStrcutre
exports.createStructure_Nineteen68 = function (req, res) {
	var createdthrough = 'Mindmaps Creation';
	var RequestedJSON = req;
	var projectid = RequestedJSON.projectId;
	var cycleId = RequestedJSON.cycleId;
	var releaseId = RequestedJSON.releaseId;
	var appType = RequestedJSON.appType;
	var username_role = 'Nineteen68_Admin';
	var username = RequestedJSON.userName.toLowerCase();
	var suite = RequestedJSON.testsuiteDetails.length;
	var suiteID = uuid();
	var suitedetails = RequestedJSON.testsuiteDetails[0];
	var testsuiteName = suitedetails.testsuiteName;
	var moduleid_c = suitedetails.testsuiteId_c;
	var scenarioidlist = [];
	var scenario = [];
	var suitedetailslist = [];
	var versionnumber = 0;
	var newversionnumber = 0;
	var suiteflag = false;
	async.series({
		projectsUnderDomain: function (callback) {
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
					console.log(err);
				} else {
					suiteflag = data.flag;
					suiteidTemp = data.suiteid;
				}
				var insertInSuite = '';
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
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				client.post("http://127.0.0.1:1990/create_ice/insertInSuite_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
					} else {
						scenario = suitedetails.testscenarioDetails;
						var scenariosarray = [];
						var testcaseidlist = [];
						async.forEachSeries(scenario, function (iterator, callback2) {
							var scenarioId = uuid();
							scenariosarray.push(scenarioId);
							var modifiedon = new Date().getTime();
							//var scenariodetails = iterator.testscenarioDetails[scenario];
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
									console.log(err);
								} else {
									scenarioflag = scenariodata.flag;
									scenarioidTemp = scenariodata.scenarioid;
								}
								var scenario_query = '';
								var insertInScenario = '';
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
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								client.post("http://127.0.0.1:1990/create_ice/insertInScenarios_ICE", args,
									function (result, response) {
									if (response.statusCode != 200 || result.rows == "fail") {
										console.log(result.rows);
									} else {
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
											var versionnumber = 0;
											//console.log('screenName details',screenName);
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
													console.log(err);
												} else {
													screenflag = screendata.flag;
													screenidTemp = screendata.screenid;
												}
												var insertInScreen = '';
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
												var args = {
													data: inputs,
													headers: {
														"Content-Type": "application/json"
													}
												};
												client.post("http://127.0.0.1:1990/create_ice/insertInScreen_ICE", args,
													function (result, response) {
													if (response.statusCode != 200 || result.rows == "fail") {
														console.log(result.rows);
													} else {
														var testcase = screenDetails.testcaseDetails;
														var testcasesarray = [];
														async.forEachSeries(testcase, function (testcaseitr, callback4) {
															var testcaseID = uuid();
															// testcasesarray.push(testcaseID);
															var testcaseDetails = testcaseitr;
															var testcaseName = testcaseitr.testcaseName;
															var testcaseid_c = testcaseitr.testcaseId_c;
															var testcaseflag = false;
															var testcaseidTemp = '';
															var testcaseidneo = testcaseitr.testcaseId;
															var tasktestcase = testcaseitr.task;
															var screenID_c_neo = testcaseitr.screenID_c;
															var versionnumber = 0;
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
																	console.log(err);
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
																var args = {
																	data: inputs,
																	headers: {
																		"Content-Type": "application/json"
																	}
																};
																client.post("http://127.0.0.1:1990/create_ice/insertInTestcase_ICE", args,
																	function (result, response) {
																	if (response.statusCode != 200 || result.rows == "fail") {
																		console.log(result.rows);
																	}
																	else {
																		testcaseidlist.push(testcaseID);
																		var updateTestscenario = "update testscenarios set testcaseids=testcaseids+[" + testcaseID + "],modifiedby='" + username + "',modifiedon=" + modifiedon + "   where projectid =" + projectid + "and testscenarioid =" + scenarioId + " and testscenarioname = '" + scenarioName + "' and versionnumber=" + versionnumber;
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
																		client.post("http://127.0.0.1:1990/create_ice/updateTestScenario_ICE", args,
																			function (result, response) {
																			if (response.statusCode != 200 || result.rows == "fail") {
																				console.log(result.rows);
																			}
																			else {
																				console.log("Successfully updated testscenarios");
																			}
																		});
																	}
																	callback4();
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
			client.post("http://127.0.0.1:1990/create_ice/updateModule_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log(result.rows);
				} else {
					console.log("Successfully updated Modules");
				}
				callback();

			});
		}
	},
		function (err, results) {
		if (err) {
			console.log(err);
			res(null, err);
		} else {
			var returnJsonmindmap = {
				"projectId": projectid,
				"cycleId": cycleId,
				"releaseId": releaseId,
				"appType": appType,
				"testsuiteDetails": suitedetailslist
			};
			res(null, returnJsonmindmap);
		}
	});
};

function testsuiteid_exists(moduledetails, cb, data) {
	var flagId = false;
	var obj = {
		flag: false,
		suiteid: ''
	};
	var statusflag = false;
	async.series({
		modulename: function (modulecallback) {
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
			client.post("http://127.0.0.1:1990/create_ice/testsuiteid_exists_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log(result.rows);
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
			if (!flagId) {
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
				client.post("http://127.0.0.1:1990/create_ice/testsuiteid_exists_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
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
			if (!statusflag) {
				updatetestsuitename(moduledetails, function (err, data) {
					if (err) {
						console.log(err);
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
	var suitedatatoupdate = [];
	var flagtocheckifexists = false;
	var flagtocheckifdeleted = false;
	async.series({
		select: function (callback) {
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
			client.post("http://127.0.0.1:1990/create_ice/get_node_details_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log(result.rows);
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
				client.post("http://127.0.0.1:1990/create_ice/delete_node_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {

						console.log(result.rows);
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
				client.post("http://127.0.0.1:1990/create_ice/updateModulename_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
					} else {
						console.log('Succesfully renamed module name');
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
	var flagId = false;
	var obj = {
		flag: false,
		scenarioid: ''
	};
	var statusflag = false;
	async.series({
		scenarioname: function (scenariocallback) {
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
			client.post("http://127.0.0.1:1990/create_ice/testscenariosid_exists_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log(result.rows);
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
			if (!flagId) {
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
				client.post("http://127.0.0.1:1990/create_ice/testscenariosid_exists_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
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
			if (!statusflag) {
				updatetestscenarioname(testscenariodetails, function (err, data) {
					if (err) {
						console.log(err);
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
	var scenariodatatoupdate = [];
	var flagtocheckifexists = false;
	var flagtocheckifdeleted = false;
	async.series({
		select: function (callback) {
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
			client.post("http://127.0.0.1:1990/create_ice/get_node_details_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log(result.rows);
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
				client.post("http://127.0.0.1:1990/create_ice/delete_node_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
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
				client.post("http://127.0.0.1:1990/create_ice/updateTestscenarioname_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
					} else {
						console.log('Succesfully renamed Testscenario name');
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
	var flagId = false;
	var obj = {
		flag: false,
		screenid: ''
	};
	var statusflag = false;
	async.series({
		screenname: function (screencallback) {
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
			client.post("http://127.0.0.1:1990/create_ice/testscreenid_exists_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log(result.rows);
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
			if (!flagId) {
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
				client.post("http://127.0.0.1:1990/create_ice/testscreenid_exists_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
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
			if (!statusflag) {
				updatetestscreenname(testscreendetails, function (err, data) {
					if (err) {
						console.log(err);
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
	var screendatatoupdate = [];
	var flagtocheckifexists = false;
	var flagtocheckifdeleted = false;
	async.series({
		select: function (callback) {
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
			client.post("http://127.0.0.1:1990/create_ice/get_node_details_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log(result.rows);
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
				client.post("http://127.0.0.1:1990/create_ice/delete_node_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
					} else {
						// if(deleted.rows != undefined && deleted.rows.length!=0){
						flagtocheckifdeleted = true;
						// }
					}
					callback();
				});
			} else {
				callback();
			}
		},
		update: function (callback) {
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
				client.post("http://127.0.0.1:1990/create_ice/updateScreenname_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
					} else {
						console.log('Succesfully renamed Screen name');
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
	var flagId = false;
	var obj = {
		flag: false,
		testcaseid: ''
	};
	var statusflag = false;
	async.series({
		testcasename: function (testcasecallback) {
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
			client.post("http://127.0.0.1:1990/create_ice/testcaseid_exists_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log(result.rows);
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
			if (!flagId) {
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
				client.post("http://127.0.0.1:1990/create_ice/testcaseid_exists_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
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
			if (!statusflag) {
				updatetestcasename(testcasedetails, function (err, data) {
					if (err) {
						console.log(err);
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
	var testcasedatatoupdate = [];
	var flagtocheckifexists = false;
	var flagtocheckifnameexists = false;
	var flagtocheckifdeleted = false;
	async.series({
		select: function (callback) {
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
			client.post("http://127.0.0.1:1990/create_ice/get_node_details_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log(result.rows);
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
				client.post("http://127.0.0.1:1990/create_ice/delete_node_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
					} else {
						// if(deleted.rows != undefined && deleted.rows.length!=0){
						flagtocheckifdeleted = true;
						// }
					}
					callback();
				});
			} else {
				callback();
			}
		},
		update: function (callback) {
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
				client.post("http://127.0.0.1:1990/create_ice/updateTestcasename_ICE  ", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
					} else {
						console.log('Succesfully renamed Testcase name');
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
	client.post("http://127.0.0.1:1990/create_ice/getReleaseIDs_Ninteen68", args,
		function (result, response) {
		try {
			if (response.statusCode != 200 || result.rows == "fail") {
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
			console.log(ex);
		}
	});
};

exports.getCycleIDs_Ninteen68 = function (req, res) {
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
	client.post("http://127.0.0.1:1990/create_ice/getCycleIDs_Ninteen68", args,
		function (result, response) {
		try {
			if (response.statusCode != 200 || result.rows == "fail") {
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
			console.log(ex);
		}
	});
};

exports.getProjectIDs_Nineteen68 = function (req, res) {
	var project_names = [];
	var project_ids = [];
	var app_types = [];
	var projectdetails = {
		projectId: [],
		projectName: [],
		appType: []
	};
	var user_id = req.userid;
	var inputs1 = {
		"userid": user_id,
		"query": "getprojids"
	};
	args1 = {
		data: inputs1,
		headers: {
			"Content-Type": "application/json"
		}
	};
	async.series({
		function (callback) {
			client.post("http://127.0.0.1:1990/create_ice/getProjectIDs_Nineteen68", args1,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					res(null, result.rows);
				} else {
					var res_projectid = [];
					if (result.rows[0] != null || result.rows[0] != undefined) {
						res_projectid = result.rows[0].projectids;
					}
					async.forEachSeries(res_projectid, function (iterator, callback1) {
						inputs2 = {
							"projectid": iterator,
							"query": "getprojectname"
						};
						args2 = {
							data: inputs2,
							headers: {
								"Content-Type": "application/json"
							}
						};
						client.post("http://127.0.0.1:1990/create_ice/getProjectIDs_Nineteen68", args2,
							function (projectnamedata, response) {
							try {
								if (response.statusCode != 200 || projectnamedata.rows == "fail") {
									res(null, projectnamedata.rows);
								} else {
									if (projectnamedata.rows[0] != undefined) {
										project_names.push(projectnamedata.rows[0].projectname);
										app_types.push(projectnamedata.rows[0].projecttypeid);
										project_ids.push(iterator);
									} else {
										console.log('projectnamedata is Undefined');
									}
								}
								projectdetails.projectId = project_ids;
								projectdetails.projectName = project_names;
								projectdetails.appType = app_types;
								callback1();
							} catch (ex) {
								console.log(ex);
							}
						});
					}, callback);
				}
			});
		}
	}, function (err, results) {
		//console.log(projectdetails);
		try {
			res(null, projectdetails);
		} catch (ex) {
			console.log(ex);
		}
	});
};

exports.getProjectType_Nineteen68 = function (req, res) {
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
	client.post("http://127.0.0.1:1990/create_ice/getProjectType_Nineteen68", args,
		function (result, response) {
		try {
			if (response.statusCode != 200 || result.rows == "fail") {
				res(null, result.rows);
			} else {
				if (result.rows.length != 0) {
					projectDetails.projectType = result.rows[0].projecttypeid;
					projectDetails.project_id = req;
				}
				res(null, projectDetails);
			}
		} catch (ex) {
			console.log(ex);
		}
	});
};

exports.createE2E_Structure_Nineteen68 = function (req, res) {
	var createdthrough = 'Mindmaps Creation';
	var RequestedJSON = req;
	var projectid = RequestedJSON.projectId;
	var cycleId = RequestedJSON.cycleId;
	var releaseId = RequestedJSON.releaseId;
	var appType = RequestedJSON.appType;
	var username = RequestedJSON.userName.toLowerCase();
	var username_role = 'Nineteen68_Admin';
	var suite = RequestedJSON.testsuiteDetails.length;
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
					console.log(err);
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
				client.post("http://127.0.0.1:1990/create_ice/insertInSuite_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						console.log(result.rows);
					} else {
						scenario = suitedetails.testscenarioDetails;
						var scenariosarray = [];
						var testcaseidlist = [];
						async.forEachSeries(scenario, function (iterator, callback2) {
							var scenarioId = uuid();
							scenariosarray.push(scenarioId);
							var modifiedon = new Date().getTime();
							//var scenariodetails = iterator.testscenarioDetails[scenario];
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
									console.log(err);
									cb(null, err);
								} else {
									scenarioflag = scenariodata.flag;
									scenarioidTemp = scenariodata.scenarioid;
								}
								var insertInScenario = '';
								if (!scenarioflag) {
									console.log("Scenario does not exists");
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
			client.post("http://127.0.0.1:1990/create_ice/updateModule_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					console.log(result.rows);
				} else {
					console.log("Successfully updated Modules");
				}
				callback();
			});
		}
	},
		function (err, results) {
		if (err) {
			console.log(err);
			res(null, err);
		} else {
			var returnJsonmindmap = {
				"projectId": projectid,
				"cycleId": cycleId,
				"releaseId": releaseId,
				"appType": appType,
				"testsuiteDetails": suitedetailslist
			};
			res(null, returnJsonmindmap);
		}
	});
};
