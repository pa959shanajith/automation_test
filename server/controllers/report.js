/**
 * Dependencies.
 */
var async = require('async');
var myserver = require('../../server.js');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = "http://127.0.0.1:1990/";
var sessionExtend = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
var sessionTime = 30 * 60 * 1000;
var updateSessionTimeEvery = 20 * 60 * 1000;

exports.getMainReport_ICE = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var IP = req.headers.host.split(":")[0]; //req.connection.servername;//localAddress.split(":")[req.connection.localAddress.split(":").length-1];
			//console.log("Jsreport server IP:::::",IP);
			var client = require("jsreport-client")("https://" + IP + ":8001/");
			//console.log("Jsreport server ::::::",client)
			client.render({
				template: {
					shortid: "HJP1pqMcg",
					recipe: "html",
					engine: "none"
				}
			}, function (err, response) {
				if (err) {
					console.log('Error when trying to render report:', err);
					res.send("fail");
				} else {
					try {
						response.pipe(res);
					} catch (exception) {
						console.log(exception);
						res.send("fail");
					}
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

//to open screen shot
exports.openScreenShot = function (req, res) {
	try {
		var path = req.body.absPath;
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var name = req.session.username;
		console.log("IP:", ip);
		console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", name);
		if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
			var mySocket = myserver.allSocketsMap[name];
			mySocket._events.render_screenshot = [];
			mySocket.emit('render_screenshot', path);
			var updateSessionExpiry = setInterval(function () {
					req.session.cookie.maxAge = sessionTime;
				}, updateSessionTimeEvery);
			mySocket.on('render_screenshot', function (resultData) {
				//req.session.cookie.expires = sessionExtend
				clearInterval(updateSessionExpiry);
				if (resultData != "fail") {
					res.send(resultData);
				} else
					res.send(resultData);
			});
		} else {
			console.log("Socket not Available");
			res.send("unavailableLocalServer");
		}
	} catch (exception) {
		console.log(exception);
	}
};

exports.renderReport_ICE = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var finalReports = req.body.finalreports;
			var reportType = req.body.reporttype;
			var shortId = "rkE973-5l";
			if (reportType != "html")
				shortId = "H1Orcdvhg";
			var IP = req.headers.host.split(":")[0]; //req.connection.servername;//localAddress.split(":")[req.connection.localAddress.split(":").length-1];
			//console.log("Jsreport server IP:::::",IP);
			var client = require("jsreport-client")("https://" + IP + ":8001/");
			client.render({
				template: {
					shortid: shortId,
					recipe: reportType,
					engine: "handlebars"
				},
				data: {
					"overallstatus": finalReports.overallstatus,
					"rows": finalReports.rows
				}
			}, function (err, response) {
				if (err) {
					console.log('Error when trying to render report:', err);
					res.send("fail");
				} else {
					try {
						response.pipe(res);
					} catch (exception) {
						console.log(exception);
						res.send("fail");
					}
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

exports.getAllSuites_ICE = function (req, res) {
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
		//the code below is commented as per the new requirement
		//ALM #460 - Reports - HTML report takes very long time to open/ hangs when report size is 5MB above
		// author - vishvas.a modified date:27-Sep-2017
		var requestedaction = req.body.readme;
		if (requestedaction == 'projects') {
			try {
				var userid = req.body.userId;
				getprojectdetails(userid, function (getprojectdetailserror, getprojectdetailsresponse) {
					try {
						if (getprojectdetailserror) {
							console.log("Error in getAllSuites_ICE:Projects");
							res.send("fail");
						} else {
							res.send(getprojectdetailsresponse);
						}
					} catch (exception) {
						console.log(exception);
						res.send("fail");
					}
				});
			} catch (exception) {
				console.log(exception);
				res.send("fail");
			}
		} else if (requestedaction == 'reports') {
			try {
				var projectid = req.body.projectId;
				getsuitedetails(projectid, function (getsuitedetailserror, getsuitedetailsresponse) {
					try {
						if (getsuitedetailserror) {
							console.log("Error in getAllSuites_ICE:Suites");
							res.send("fail");
						} else {
							res.send(getsuitedetailsresponse);
						}
					} catch (exception) {
						console.log(exception);
						res.send("fail");
					}
				});
			} catch (exception) {
				console.log(exception);
				res.send("fail");
			}
		} else {
			res.send('Invalid input fail');
		}
	} else {
		res.send("Invalid Session");
	}

	function getprojectdetails(userid, getprojectdetailscallback) {
		try {
			var responsedata = {
				projectids: [],
				projectnames: []
			};
			var inputs = {
				"query": "projects",
				"userid": userid
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "reports/getAllSuites_ICE", args,
				function (allprojectids, response) {
				if (response.statusCode != 200 || allprojectids.rows == "fail") {
					getprojectdetailscallback("fail", null);
				} else {
					try {
						var projectssize = allprojectids.rows[0].projectids.length;
						var index = 0;
						async.forEachSeries(allprojectids.rows[0].projectids, function (eachprojectid, allprojectidscallback) {
							try {
								var inputs = {
									"id": eachprojectid,
									"query": "projects"
								};
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								client.post(epurl + "admin/getNames_ICE", args,
									function (eachprojectdata, response) {
									if (response.statusCode != 200 || eachprojectdata.rows == "fail") {
										getprojectdetailscallback("fail", null);
									} else {
										try {
											if (eachprojectdata.rows.length > 0) {
												responsedata.projectids.push(eachprojectdata.rows[0].projectid);
												responsedata.projectnames.push(eachprojectdata.rows[0].projectname);
												index += 1;
												allprojectidscallback();
											}
											if (projectssize == index) {
												getprojectdetailscallback(null, responsedata);
											}
										} catch (exception) {
											console.log(exception);
											// getprojectdetailscallback("fail",null);
										}
									}
								});
							} catch (exception) {
								console.log(exception);
								// getprojectdetailscallback("fail",null);
							}
						});
					} catch (exception) {
						console.log(exception);
						// getprojectdetailscallback("fail",null);
					}
				}
			});
		} catch (exception) {
			console.log(exception);
			// getprojectdetailscallback("fail",null);
		}
	}

	function getsuitedetails(projectid, getsuitedetailscallback) {
		try {
			var responsedata = {
				suiteids: [],
				suitenames: []
			};
			var inputs = {
				"query": "suites",
				"subquery": "releases",
				"projectid": projectid
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "reports/getAllSuites_ICE", args,
				function (allreleaseids, releaseidresponse) {
				if (releaseidresponse.statusCode != 200 || allreleaseids.rows == "fail") {
					getsuitedetailscallback("fail", null);
				} else {
					try {
						var releasessize = allreleaseids.rows.length;
						var releaseindex = 0;
						if (releasessize > 0) {
							async.forEachSeries(allreleaseids.rows, function (releaseid, releaseidcallback) {
								var inputs = {
									"query": "suites",
									"subquery": "cycles",
									"releaseid": releaseid.releaseid
								};
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								client.post(epurl + "reports/getAllSuites_ICE", args,
									function (allcycleids, cycleidresponse) {
									if (cycleidresponse.statusCode != 200 || allcycleids.rows == "fail") {
										getsuitedetailscallback("fail", null);
									} else {
										try {
											var cyclelength = allcycleids.rows.length;
											var cycleindex = 0;
											if (cyclelength > 0) {
												async.forEachSeries(allcycleids.rows, function (cycleid, cycleidcallback) {
													try {
														var inputs = {
															"id": cycleid.cycleid,
															"query": "cycledetails",
															"subquery": "subquery"
														};
														var args = {
															data: inputs,
															headers: {
																"Content-Type": "application/json"
															}
														};
														client.post(epurl + "admin/getDetails_ICE", args,
															function (allsuitesdata, allsuitesresponse) {
															if (allsuitesresponse.statusCode != 200 || allsuitesdata.rows == "fail") {
																getsuitedetailscallback("fail", null);
															} else {
																try {
																	var suitesize = allsuitesdata.rows.length;
																	var suiteindex = 0;
																	if (suitesize > 0) {
																		async.forEachSeries(allsuitesdata.rows, function (eachsuite, eachsuitecallback) {
																			suiteindex += 1;
																			responsedata.suiteids.push(eachsuite.testsuiteid);
																			responsedata.suitenames.push(eachsuite.testsuitename);
																			eachsuitecallback();
																		});
																	}
																	if (suitesize == suiteindex) {
																		cycleidcallback();
																		cycleindex += 1;
																	}
																} catch (exception) {
																	console.log(exception);
																	getsuitedetailscallback("fail", null);
																}
															}
															if (cyclelength == cycleindex) {
																releaseidcallback();
																releaseindex += 1;
															}

															if (releaseindex == releasessize) {
																finalfunction();
															}
														});
													} catch (exception) {
														console.log(exception);
														// getsuitedetailscallback("fail",null);
													}
												});
											} else {
												releaseidcallback();
												releaseindex += 1;
											}
										} catch (exception) {
											console.log(exception);
											// getsuitedetailscallback("fail",null);
										}
									}
								});
							});
						} else {
							finalfunction();
						}
						function finalfunction() {
							// console.log("This is the response:",responsedata.suitenames.length);
							getsuitedetailscallback(null, responsedata);
						}
					} catch (exception) {
						console.log(exception);
						// getsuitedetailscallback("fail",null);
					}
				}
			});
		} catch (exception) {
			console.log(exception);
			// getsuitedetailscallback("fail",null);
		}
	}
};

exports.getSuiteDetailsInExecution_ICE = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var req_testsuiteId = req.body.testsuiteid;
			var startTime,
			endTime,
			starttime,
			endtime;
			var executionDetailsJSON = [];
			var inputs = {
				"suiteid": req_testsuiteId
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "reports/getSuiteDetailsInExecution_ICE", args,
				function (executionData, response) {
				try {
					if (response.statusCode != 200 || executionData.rows == "fail") {
						console.log(err);
						res.send("fail");
					} else {
						for (var i = 0; i < executionData.rows.length; i++) {
							startTime = new Date(executionData.rows[i].starttime);
							endTime = new Date(executionData.rows[i].endtime);
							starttime = startTime.getDate() + "-" + (startTime.getMonth() + 1) + "-" + startTime.getFullYear() + " " + startTime.getHours() + ":" + startTime.getMinutes();
							endtime = endTime.getDate() + "-" + (endTime.getMonth() + 1) + "-" + endTime.getFullYear() + " " + (endTime.getUTCHours()) + ":" + (+endTime.getUTCMinutes());
							executionDetailsJSON.push({
								execution_id: executionData.rows[i].executionid,
								start_time: starttime,
								end_time: endtime
							});
						}
						res.send(JSON.stringify(executionDetailsJSON));
					}
				} catch (exception) {
					console.log(exception);
					res.send("fail");
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

exports.reportStatusScenarios_ICE = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var req_executionId = req.body.executionId;
			var reportList = [];
			var report = [];
			async.series({
				executiondetails: function (callback) {
					var inputs = {
						"query": "executiondetails",
						"executionid": req_executionId
					};
					var args = {
						data: inputs,
						headers: {
							"Content-Type": "application/json"
						}
					};
					client.post(epurl + "reports/reportStatusScenarios_ICE", args,
						function (result, response) {
						if (response.statusCode != 200 || result.rows == "fail") {
							var flag = "fail";
							res.send(flag);
						} else {
							async.forEachSeries(result.rows, function (iterator, callback2) {
								try {
									var executedtimeTemp = new Date(iterator.executedtime);
									if (executedtimeTemp != null) {
										executedtimeTemp = executedtimeTemp.getDate() + "-" + (executedtimeTemp.getMonth() + 1) + "-" + executedtimeTemp.getFullYear() + " " + (executedtimeTemp.getUTCHours()) + ":" + (executedtimeTemp.getUTCMinutes()) + ":" + executedtimeTemp.getSeconds();
									}
									var browserTemp = iterator.browser;
									var statusTemp = iterator.status;
									var reportidTemp = iterator.reportid;
									var testscenarioidTemp = iterator.testscenarioid;
									var inputs = {
										"query": "scenarioname",
										"scenarioid": iterator.testscenarioid
									};
									var args = {
										data: inputs,
										headers: {
											"Content-Type": "application/json"
										}
									};
									client.post(epurl + "reports/reportStatusScenarios_ICE", args,
										function (scenarioNameDetails, response) {
										if (response.statusCode != 200 || scenarioNameDetails.rows == "fail") {
											var flag = "fail";
											res.send(flag);
										} else {
											async.forEachSeries(scenarioNameDetails.rows, function (testScenarioNameitr, callback3) {
												try {
													report.push({
														executedtime: executedtimeTemp,
														browser: browserTemp,
														status: statusTemp,
														reportid: reportidTemp,
														testscenarioid: testscenarioidTemp,
														testscenarioname: testScenarioNameitr.testscenarioname
													});
													callback3();
												} catch (exception) {
													console.log(exception);
													res.send("fail");
												}
											}, callback2);
										}
									});
									//reportList.push(report);
								} catch (exception) {
									console.log(exception);
									res.send("fail");
								}
							}, callback);
						}
					});
				}
			},
				function (err, results) {
				if (err) {
					console.log('Error:--', err);
					res.send("fail");
				} else {
					if (report.length > 0) {
						for (var i = 0; i < report.length; i++) {
							if (report[i].executedtime != "") {
								var dateString = report[i].executedtime,
								dateTimeParts = dateString.split(' '),
								timeParts = dateTimeParts[1].split(':'),
								dateParts = dateTimeParts[0].split('-'),
								date;
								date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]);
								report[i].executedtime = date.getTime();
							}
						}
						report.sort(function (a, b) {
							return a.executedtime - b.executedtime;
						});
						for (var k = 0; k < report.length; k++) {
							if (report[k].executedtime != "") {
								report[k].executedtime = new Date(report[k].executedtime);
								report[k].executedtime = ("0" + report[k].executedtime.getDate()).slice(-2) + "-" + ("0" + (report[k].executedtime.getMonth() + 1)).slice(-2) + "-" + (report[k].executedtime.getFullYear()) + " " + ("0" + report[k].executedtime.getHours()).slice(-2) + ":" + ("0" + report[k].executedtime.getMinutes()).slice(-2) + ":" + ("0" + report[k].executedtime.getSeconds()).slice(-2);
							}
						}
					}
					res.send(JSON.stringify(report));
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

exports.getReport_Nineteen68 = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var reportId = req.body.reportId;
			var testsuiteId = req.body.testsuiteId;
			var testsuitename = req.body.testsuitename;
			var reportInfoObj = {};
			var reportjson = {};
			var flag = "";
			async.series({
				projectsUnderDomain: function (callback) {
					var inputs = {
						"query": "projectsUnderDomain",
						"reportid": reportId
					};
					var args = {
						data: inputs,
						headers: {
							"Content-Type": "application/json"
						}
					};
					client.post(epurl + "reports/getReport_Nineteen68", args,
						function (reportResult, response) {
						if (response.statusCode != 200 || reportResult.rows == "fail") {
							flag = "fail";
							console.log("Failed to get report, executed time and scenarioIds from reports");
							res.send(flag);
						} else {
							var reportres = reportResult.rows.length;
							async.forEachSeries(reportResult.rows, function (iterator, callback1) {
								try {
									var reportdata = iterator.report;
									var executedtime = iterator.executedtime;
									var testscenarioid = iterator.testscenarioid;
									reportjson.reportdata = reportdata;
									reportInfoObj.reportId = reportId;
									reportInfoObj.executedtime = executedtime;
									reportInfoObj.testscenarioid = testscenarioid;
									var inputs = {
										"query": "scenariodetails",
										"scenarioid": testscenarioid
									};
									var args = {
										data: inputs,
										headers: {
											"Content-Type": "application/json"
										}
									};
									client.post(epurl + "reports/getReport_Nineteen68", args,
										function (scenarioResult, response) {
										if (response.statusCode != 200 || scenarioResult.rows == "fail") {
											console.log("Failed to get scenario name and projectId from scenarios.");
										} else {
											async.forEachSeries(scenarioResult.rows, function (sceiditr, callback2) {
												try {
													var testscenarioname = sceiditr.testscenarioname;
													var projectid = sceiditr.projectid;
													reportInfoObj.testscenarioname = testscenarioname;
													reportInfoObj.projectid = projectid;
													var inputs = {
														"query": "cycleid",
														"suiteid": testsuiteId,
														"suitename": testsuitename
													};
													var args = {
														data: inputs,
														headers: {
															"Content-Type": "application/json"
														}
													};
													client.post(epurl + "reports/getReport_Nineteen68", args,
														function (suiteResult, response) {
														if (response.statusCode != 200 || suiteResult.rows == "fail") {
															console.log("Failed to get cycle Ids from test suites.");
														} else {
															async.forEachSeries(suiteResult.rows, function (suiteiditr, callback3) {
																try {
																	var cycleid = suiteiditr.cycleid;
																	reportInfoObj.cycleid = cycleid;
																	// count=0;
																	/*	console.log('suiteResult.rows', suiteResult.rows.length);
																	testscenarioids12 = suiteiditr.testscenarioids;
																	if (testscenarioids12 != null) {
																	for (var i = 0; i < testscenarioids12.length; i++) {
																	if (testscenarioids12[i].toString() == testscenarioid.toString()) {
																	cycleid = suiteiditr.cycleid;
																	reportInfoObj.cycleid = cycleid;
																	break;
																	}
																	}
																	}*/
																	//   callback3();
																	var inputs = {
																		"query": "cycledetails",
																		"cycleid": cycleid
																	};
																	var args = {
																		data: inputs,
																		headers: {
																			"Content-Type": "application/json"
																		}
																	};
																	client.post(epurl + "reports/getReport_Nineteen68", args,
																		function (cycleResult, response) {
																		if (response.statusCode != 200 || cycleResult.rows == "fail") {
																			console.log("Failed to get cycle name and releaseId from cycles.");
																		} else {
																			async.forEachSeries(cycleResult.rows, function (cycleiditr, callback4) {
																				try {
																					var cyclename = cycleiditr.cyclename;
																					var releaseid = cycleiditr.releaseid;
																					reportInfoObj.cyclename = cyclename;
																					reportInfoObj.releaseid = releaseid;
																					// callback4();
																					var inputs = {
																						"query": "releasedetails",
																						"releaseid": releaseid
																					};
																					var args = {
																						data: inputs,
																						headers: {
																							"Content-Type": "application/json"
																						}
																					};
																					client.post(epurl + "reports/getReport_Nineteen68", args,
																						function (releaseResult, response) {
																						if (response.statusCode != 200 || releaseResult.rows == "fail") {
																							console.log("Failed to get release name and projectsId from releases.");
																						} else {
																							async.forEachSeries(releaseResult.rows, function (reliditr, callback5) {
																								try {
																									var releasename = reliditr.releasename;
																									var projectid = reliditr.projectid;
																									reportInfoObj.releasename = releasename;
																									reportInfoObj.projectid = projectid;
																									//console.log('final reportInfoObj in release deatails', reportInfoObj);
																									var inputs = {
																										"query": "projectdetails",
																										"projectid": projectid
																									};
																									var args = {
																										data: inputs,
																										headers: {
																											"Content-Type": "application/json"
																										}
																									};
																									client.post(epurl + "reports/getReport_Nineteen68", args,
																										function (projectResult, response) {
																										if (response.statusCode != 200 || projectResult.rows == "fail") {
																											console.log("Failed to get project name and domainId from projects.");
																										} else {
																											async.forEachSeries(projectResult.rows, function (proiditr, callback6) {
																												try {
																													var projectname = proiditr.projectname;
																													var domainid = proiditr.domainid;
																													reportInfoObj.projectname = projectname;
																													reportInfoObj.domainid = domainid;
																													var inputs = {
																														"query": "domaindetails",
																														"domainid": domainid
																													};
																													var args = {
																														data: inputs,
																														headers: {
																															"Content-Type": "application/json"
																														}
																													};
																													client.post(epurl + "reports/getReport_Nineteen68", args,
																														function (domainResult, response) {
																														if (response.statusCode != 200 || domainResult.rows == "fail") {
																															console.log("Failed to get domain name from domains.");
																														} else {
																															async.forEachSeries(domainResult.rows, function (domainiditr, callback7) {
																																try {
																																	var domainname = domainiditr.domainname;
																																	reportInfoObj.domainname = domainname;
																																	//console.log('final reportInfoObj in domain deatails', reportInfoObj);
																																	callback7();
																																} catch (exception) {
																																	console.log(exception);
																																	res.send("fail");
																																}
																															}, callback6);
																														}
																													});
																												} catch (exception) {
																													console.log(exception);
																													res.send("fail");
																												}
																											}, callback5);
																										}
																									});
																								} catch (exception) {
																									console.log(exception);
																									res.send("fail");
																								}
																							}, callback4);
																						}
																					});
																				} catch (exception) {
																					console.log(exception);
																					res.send("fail");
																				}
																			}, callback3);
																		}
																	});
																} catch (exception) {
																	console.log(exception);
																	res.send("fail");
																}
															}, callback2);
														}
													});
												} catch (exception) {
													console.log(exception);
													res.send("fail");
												}
											}, callback1);
										}
									});
								} catch (exception) {
									console.log(exception);
									res.send("fail");
								}
							}, callback);
						}
					});
				}
			},
				function (err, results) {
				if (err) {
					console.log(err);
					cb(err);
					res.send("fail");
				} else {
					var finalReport = [];
					finalReport.push(reportInfoObj);
					finalReport.push(reportjson);
					res.send(finalReport);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

exports.exportToJson_ICE = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var reportId = req.body.reportId;
			var reportInfoObj = {};
			async.series({
				projectsUnderDomain: function (callback) {
					var inputs = {
						"query": "reportdata",
						"reportid": reportId
					};
					var args = {
						data: inputs,
						headers: {
							"Content-Type": "application/json"
						}
					};
					client.post(epurl + "reports/exportToJson_ICE", args,
						function (reportResult, response) {
						if (response.statusCode != 200 || reportResult.rows == "fail") {
							console.log("Failed to get reports.");
							res.send("fail");
						} else {
							try {
								var reportres = reportResult.rows.length;
								async.forEachSeries(reportResult.rows, function (iterator, callback1) {
									try {
										var reportdata = iterator.report;
										reportInfoObj.reportdata = reportdata;
										var inputs = {
											"query": "scenarioid",
											"reportid": reportId
										};
										var args = {
											data: inputs,
											headers: {
												"Content-Type": "application/json"
											}
										};
										client.post(epurl + "reports/exportToJson_ICE", args,
											function (scenarioResult, response) {
											if (response.statusCode != 200 || scenarioResult.rows == "fail") {
												console.log("Failed to get scenario Id from reports.");
											} else {
												var reportres = scenarioResult.rows.length;
												async.forEachSeries(scenarioResult.rows, function (sceiditr, callback2) {
													try {
														var scenarioid = sceiditr.testscenarioid;
														var inputs = {
															"query": "scenarioname",
															"scenarioid": scenarioid
														};
														var args = {
															data: inputs,
															headers: {
																"Content-Type": "application/json"
															}
														};
														client.post(epurl + "reports/exportToJson_ICE", args,
															function (scenarionameResult, response) {
															if (response.statusCode != 200 || scenarionameResult.rows == "fail") {
																console.log("Failed to get testscenarioname from testscenarios.");
															} else {
																var scenameres = scenarionameResult.rows.length;
																async.forEachSeries(scenarionameResult.rows, function (scenameitr, callback3) {
																	try {
																		var scenarioname = scenameitr.testscenarioname;
																		reportInfoObj.scenarioname = scenarioname;
																		callback3();
																	} catch (exception) {
																		console.log(exception);
																		res.send("fail");
																	}
																}, callback2);
															}
														});
													} catch (exception) {
														console.log(exception);
														res.send("fail");
													}
												}, callback1);
											}
										});
									} catch (exception) {
										console.log(exception);
										res.send("fail");
									}
								}, callback);
							} catch (exception) {
								console.log(exception);
								res.send("fail");
							}
						}
					});
				}
			},
				function (err, results) {
				if (err) {
					console.log(err);
					cb(err);
					res.send("fail");
				} else {
					console.log('in last function');
					res.send(reportInfoObj);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};
