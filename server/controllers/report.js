/**
 * Dependencies.
 */
var async = require('async');
var myserver = require('../lib/socket');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = "http://127.0.0.1:1990/";
var sessionExtend = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
var sessionTime = 30 * 60 * 1000;
var updateSessionTimeEvery = 20 * 60 * 1000;
var validator =  require('validator');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');

exports.getMainReport_ICE = function (req, res) {
	logger.info("Inside UI service: getMainReport_ICE");
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var IP = req.headers.host.split(":")[0]; //req.connection.servername;//localAddress.split(":")[req.connection.localAddress.split(":").length-1];
			var client = require("jsreport-client")("https://"+IP+"/reporting/");
			client.render({
				template: {
					shortid: "HJP1pqMcg",
					recipe: "html",
					engine: "none"
				}
			}, function (err, response) {
				if (err) {
					logger.error('Error occured in getMainReport_ICE when trying to render report: %s', err);
					res.send("fail");
				} else {
					try {
						logger.info('Reports rendered successfully');
						response.pipe(res);
					} catch (exception) {
						logger.error('Exception in getMainReport_ICE when trying to render report: %s', exception);
						res.send("fail");
					}
				}
			});
		} else {
			logger.error("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error('Exception in getMainReport_ICE when trying to render report: %s', exception);
		res.send("fail");
	}
};

//to open screen shot
exports.openScreenShot = function (req, res) {
	logger.info("Inside UI service: openScreenShot");
	redisServer.redisSub2.removeAllListeners('message');
	redisServer.redisSub2.subscribe('ICE2_' + req.session.username,1);
	try {
		var path = req.body.absPath;
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		logger.info("ICE Socket connecting IP: %s" , ip);
		var name = req.session.username;
		logger.info("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.info("ICE Socket requesting Address: %s" , name);
		redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + req.session.username,function(err,redisres){
			if (redisres[1]==1) {
				/* Commented for LB
				if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
				var mySocket = myserver.allSocketsMap[name];
				mySocket._events.render_screenshot = [];
				mySocket.emit('render_screenshot', path);
				*/
				logger.info("Sending socket request for render_screenshot to redis");
				dataToIce = {"emitAction" : "render_screenshot","username" : req.session.username, "path":path};
				redisServer.redisPub1.publish('ICE1_normal_' + req.session.username,JSON.stringify(dataToIce));
				var updateSessionExpiry = setInterval(function () {
						req.session.cookie.maxAge = sessionTime;
					}, updateSessionTimeEvery);
				/* Commented for LB
				mySocket.on('render_screenshot', function (resultData) {
					//req.session.cookie.expires = sessionExtend
					clearInterval(updateSessionExpiry);
					if (resultData != "fail") {
						logger.info('Screen shot opened successfully');
						res.send(resultData);
					} else{
						logger.error('Screen shot status: ', resultData);
						res.send(resultData);
					}
				});
				mySocket.on("unavailableLocalServer", function () {
					logger.error("Error occured in openScreenShot: Socket Disconnected");
					if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
						var soc = myserver.socketMapNotify[name];
						soc.emit("ICEnotAvailable");
					}
				});*/
				redisServer.redisSub2.on("message",function (channel,message) {
					data = JSON.parse(message);
					if(req.session.username == data.username){
						if (data.onAction == "unavailableLocalServer") {
							logger.error("Error occured in openScreenShot: Socket Disconnected");
							if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
								var soc = myserver.socketMapNotify[name];
								soc.emit("ICEnotAvailable");
							}
						} else {
							var resultData = data.value;
							clearInterval(updateSessionExpiry);
							if (resultData != "fail") {
								logger.info('Screen shot opened successfully');
								res.send(resultData);
							} else{
								logger.error('Screen shot status: ', resultData);
								res.send(resultData);
							}
						}
					}
				});
			} else {
				logger.error("ICE Socket not Available");
				res.send("unavailableLocalServer");
			}
		});
	} catch (exception) {
		logger.error("Exception in openScreenShot when trying to open screenshot: %s",exception);
	}
};

exports.renderReport_ICE = function (req, res) {
	logger.info("Inside UI service: renderReport_ICE");
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
			var client = require("jsreport-client")("https://"+IP+"/reporting/");
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
					logger.error("Error occured in renderReport_ICE when trying to render report: %s",err);
					res.send("fail");
				} else {
					try {
						logger.info('Reports rendered successfully');
						response.pipe(res);
					} catch (exception) {
						logger.error("Exception occured in renderReport_ICE when trying to render report: %s",exception);
						res.send("fail");
					}
				}
			});
		} else {
			logger.error("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception occured in renderReport_ICE when trying to render report: %s",exception);
		res.send("fail");
	}
};

exports.getAllSuites_ICE = function (req, res) {
	logger.info("Inside UI service: getAllSuites_ICE");
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
				logger.info("Calling function getprojectdetails from getAllSuites_ICE: Projects");
				getprojectdetails(userid, function (getprojectdetailserror, getprojectdetailsresponse) {
					try {
						if (getprojectdetailserror) {
							logger.error("Error occured in the function getprojectdetails: getAllSuites_ICE: Projects");
							res.send("fail");
						} else {
							logger.info("Sending project details from getprojectdetails function of getAllSuites_ICE:Projects");
							res.send(getprojectdetailsresponse);
						}
					} catch (exception) {
						logger.error("Exception in the function getprojectdetails: getAllSuites_ICE: Projects: %s",exception);
						res.send("fail");
					}
				});
			} catch (exception) {
				logger.error("Exception in the service getAllSuites_ICE: Projects: %s",exception);
				res.send("fail");
			}
		} else if (requestedaction == 'reports') {
			try {
				var projectid = req.body.projectId;
				logger.info("Calling function getprojectdetails from getAllSuites_ICE: reports");
				getsuitedetails(projectid, function (getsuitedetailserror, getsuitedetailsresponse) {
					try {
						if (getsuitedetailserror) {
							logger.error("Error occured in the function getsuitedetails: getAllSuites_ICE: reports");
							res.send("fail");
						} else {
							logger.info("Sending Suite details from getsuitedetails: getAllSuites_ICE: reports");
							res.send(getsuitedetailsresponse);
						}
					} catch (exception) {
						logger.error("Exception in a function getsuitedetails: getAllSuites_ICE: reports: %s",exception);
						res.send("fail");
					}
				});
			} catch (exception) {
				logger.error("Exception in the service getAllSuites_ICE: reports: %s",exception);
				res.send("fail");
			}
		} else {
			logger.error("Invalid input fail");
			res.send('Invalid input fail');
		}
	} else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

	function getprojectdetails(userid, getprojectdetailscallback) {
		logger.info("Inside UI function: getprojectdetails");
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
			logger.info("Calling NDAC Service from getprojectdetails: reports/getAllSuites_ICE");
			client.post(epurl + "reports/getAllSuites_ICE", args,
				function (allprojectids, response) {
				if (response.statusCode != 200 || allprojectids.rows == "fail") {
					logger.error("Error occured in reports/getAllSuites_ICE from getprojectdetails Error Code : ERRNDAC");
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
								logger.info("Calling NDAC Service from getprojectdetails: admin/getNames_ICE");
								client.post(epurl + "admin/getNames_ICE", args,
									function (eachprojectdata, response) {
									if (response.statusCode != 200 || eachprojectdata.rows == "fail") {
										logger.error("Error occured in admin/getNames_ICE from getprojectdetails Error Code : ERRNDAC");
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
												logger.info("Sending project names from getAllSuites_ICE: projects");
												getprojectdetailscallback(null, responsedata);
											}
										} catch (exception) {
											logger.error("Exception in the function getprojectdetails: admin/getNames_ICE: %s",exception);
											// getprojectdetailscallback("fail",null);
										}
									}
								});
							} catch (exception) {
								logger.error("Exception in the function getprojectdetails when calling admin/getNames_ICE: %s",exception);
								// getprojectdetailscallback("fail",null);
							}
						});
					} catch (exception) {
						logger.error("Exception in the function getprojectdetails when calling admin/getNames_ICE: %s",exception);
						// getprojectdetailscallback("fail",null);
					}
				}
			});
		} catch (exception) {
			logger.error("Exception in the function getprojectdetails when calling reports/getAllSuites_ICE: %s",exception);
			// getprojectdetailscallback("fail",null);
		}
	}

	function getsuitedetails(projectid, getsuitedetailscallback) {
		logger.info("Inside the function: getsuitedetails");
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
			logger.info("Calling NDAC Service from getsuitedetails: reports/getAllSuites_ICE: releases");
			client.post(epurl + "reports/getAllSuites_ICE", args,
				function (allreleaseids, releaseidresponse) {
				if (releaseidresponse.statusCode != 200 || allreleaseids.rows == "fail") {
					logger.error("Error occured in reports/getAllSuites_ICE: releases from getsuitedetails Error Code : ERRNDAC");
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
								logger.info("Calling NDAC Service from getsuitedetails: reports/getAllSuites_ICE: cycles");
								client.post(epurl + "reports/getAllSuites_ICE", args,
									function (allcycleids, cycleidresponse) {
									if (cycleidresponse.statusCode != 200 || allcycleids.rows == "fail") {
										logger.error("Error occured in reports/getAllSuites_ICE: cycles from getsuitedetails Error Code : ERRNDAC");
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
														logger.info("Calling NDAC Service from getsuitedetails: admin/getDetails_ICE: cycledetails");
														client.post(epurl + "admin/getDetails_ICE", args,
															function (allsuitesdata, allsuitesresponse) {
															if (allsuitesresponse.statusCode != 200 || allsuitesdata.rows == "fail") {
																logger.error("Error occured in reports/getAllSuites_ICE: cycledetails from getsuitedetails Error Code : ERRNDAC");
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
																	logger.error("Exception in the function getsuitedetails while getting suite details from admin/getDetails_ICE: %s",exception);
																	getsuitedetailscallback("fail", null);
																}
															}
															if (cyclelength == cycleindex) {
																releaseidcallback();
																releaseindex += 1;
															}

															if (releaseindex == releasessize) {
																logger.info("Calling final function from getsuitedetails: admin/getDetails_ICE: cycledetails");
																finalfunction();
															}
														});
													} catch (exception) {
														logger.error("Exception in the function getsuitedetails while traversing cycleids: %s",exception);
														// getsuitedetailscallback("fail",null);
													}
												});
											} else {
												releaseidcallback();
												releaseindex += 1;
											}
										} catch (exception) {
											logger.error("Exception in the function getsuitedetails while checking no of cycleids: %s",exception);
											// getsuitedetailscallback("fail",null);
										}
									}
								});
							});
						} else {
							logger.info("Calling final function from getsuitedetails: admin/getDetails_ICE: releases");
							finalfunction();
						}
						function finalfunction() {
							getsuitedetailscallback(null, responsedata);
						}
					} catch (exception) {
						logger.error("Exception in the function getsuitedetails while checking no of releaseids: %s",exception);
						// getsuitedetailscallback("fail",null);
					}
				}
			});
		} catch (exception) {
			logger.error("Exception while calling NDAC Service from getsuitedetails: reports/getAllSuites_ICE: releases: %s",exception);
			// getsuitedetailscallback("fail",null);
		}
	}
};

exports.getSuiteDetailsInExecution_ICE = function (req, res) {
	logger.info("Inside UI service: getSuiteDetailsInExecution_ICE");
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var req_testsuiteId = req.body.testsuiteid;
			var startTime, endTime, starttime, endtime;
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
			logger.info("Calling NDAC Service from getSuiteDetailsInExecution_ICE: reports/getSuiteDetailsInExecution_ICE");
			client.post(epurl + "reports/getSuiteDetailsInExecution_ICE", args,
				function (executionData, response) {
				try {
					if (response.statusCode != 200 || executionData.rows == "fail") {
						logger.error("Error occured in the service getSuiteDetailsInExecution_ICE: reports/getSuiteDetailsInExecution_ICE");
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
						logger.info("Sending execution details from getSuiteDetailsInExecution_ICE: reports/getSuiteDetailsInExecution_ICE");
						res.send(JSON.stringify(executionDetailsJSON));
					}
				} catch (exception) {
					logger.error("Exception in the service getSuiteDetailsInExecution_ICE: reports/getSuiteDetailsInExecution_ICE: %s", exception);
					res.send("fail");
				}
			});
		} else {
			logger.error("Error in the service getSuiteDetailsInExecution_ICE: Invalid Session")
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service getSuiteDetailsInExecution_ICE: %s", exception);
		res.send("fail");
	}
};

exports.reportStatusScenarios_ICE = function (req, res) {
	logger.info("Inside UI service: reportStatusScenarios_ICE");
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var req_executionId = req.body.executionId;
			var req_testsuiteId = req.body.testsuiteId;
			var reportList = [];
			var report = [];
			async.series({
				executiondetails: function (callback) {
					var inputs = {
						"query": "executiondetails",
						"executionid": req_executionId,
						"testsuiteid": req_testsuiteId
					};
					var args = {
						data: inputs,
						headers: {
							"Content-Type": "application/json"
						}
					};
					logger.info("Calling NDAC Service from reportStatusScenarios_ICE - executiondetails: reports/reportStatusScenarios_ICE");
					client.post(epurl + "reports/reportStatusScenarios_ICE", args,
						function (result, response) {
						if (response.statusCode != 200 || result.rows == "fail") {
							logger.error("Error occured in the service reportStatusScenarios_ICE - executiondetails: reports/reportStatusScenarios_ICE");
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
									logger.info("Calling NDAC Service from reportStatusScenarios_ICE - scenarioname: reports/reportStatusScenarios_ICE");
									client.post(epurl + "reports/reportStatusScenarios_ICE", args,
										function (scenarioNameDetails, response) {
										if (response.statusCode != 200 || scenarioNameDetails.rows == "fail") {
											logger.error("Error occured in the service reportStatusScenarios_ICE - scenarioname: reports/reportStatusScenarios_ICE");
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
													logger.error("Exception in the service reportStatusScenarios_ICE - scenarioname: reports/reportStatusScenarios_ICE: %s", exception);
													res.send("fail");
												}
											}, callback2);
										}
									});
									//reportList.push(report);
								} catch (exception) {
									logger.error("Exception in the service reportStatusScenarios_ICE - executiondetails: reports/reportStatusScenarios_ICE: %s", exception);
									res.send("fail");
								}
							}, callback);
						}
					});
				}
			},
			function (err, results) {
				if (err) {
					logger.error("Error occured in the service reportStatusScenarios_ICE: final function: %s", err);
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
					logger.info("Sending scenario status details from reportStatusScenarios_ICE");
					res.send(JSON.stringify(report));
				}
			});
		} else {
			logger.error("Invalid Session: reportStatusScenarios_ICE");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service reportStatusScenarios_ICE: %s", exception);
		res.send("fail");
	}
};

exports.getReport_Nineteen68 = function (req, res) {
	logger.info("Inside UI service: getReport_Nineteen68");
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
					logger.info("Calling NDAC Service from getReport_Nineteen68 - projectsUnderDomain: reports/getReport_Nineteen68");
					client.post(epurl + "reports/getReport_Nineteen68", args,
						function (reportResult, response) {
						if (response.statusCode != 200 || reportResult.rows == "fail") {
							flag = "fail";
							logger.error("Error occured in the service getReport_Nineteen68 - projectsUnderDomain: Failed to get report, executed time and scenarioIds from reports");
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
									logger.info("Calling NDAC Service from getReport_Nineteen68 - scenariodetails: reports/getReport_Nineteen68");
									client.post(epurl + "reports/getReport_Nineteen68", args,
										function (scenarioResult, response) {
										if (response.statusCode != 200 || scenarioResult.rows == "fail") {
											logger.error("Error occured in the service getReport_Nineteen68 - scenariodetails: Failed to get scenario name and projectId from scenarios.");
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
													logger.info("Calling NDAC Service from getReport_Nineteen68 - cycleid: reports/getReport_Nineteen68");
													client.post(epurl + "reports/getReport_Nineteen68", args,
														function (suiteResult, response) {
														if (response.statusCode != 200 || suiteResult.rows == "fail") {
															logger.error("Error occured in the service getReport_Nineteen68 - cycleid: Failed to get cycle Ids from test suites.");
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
																	logger.info("Calling NDAC Service from getReport_Nineteen68 - cycledetails: reports/getReport_Nineteen68");
																	client.post(epurl + "reports/getReport_Nineteen68", args,
																		function (cycleResult, response) {
																		if (response.statusCode != 200 || cycleResult.rows == "fail") {
																			logger.error("Error occured in the service getReport_Nineteen68 - cycledetails: Failed to get cycle name and releaseId from cycles.");
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
																					logger.info("Calling NDAC Service from getReport_Nineteen68 - releasedetails: reports/getReport_Nineteen68");
																					client.post(epurl + "reports/getReport_Nineteen68", args,
																						function (releaseResult, response) {
																						if (response.statusCode != 200 || releaseResult.rows == "fail") {
																							logger.error("Error occured in the service getReport_Nineteen68 - releasedetails: Failed to get release name and projectsId from releases.");
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
																									logger.info("Calling NDAC Service from getReport_Nineteen68 - projectdetails: reports/getReport_Nineteen68");
																									client.post(epurl + "reports/getReport_Nineteen68", args,
																										function (projectResult, response) {
																										if (response.statusCode != 200 || projectResult.rows == "fail") {
																											logger.error("Error occured in the service getReport_Nineteen68 - projectdetails: Failed to get project name and domainId from projects.");
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
																													logger.info("Calling NDAC Service from getReport_Nineteen68 - domaindetails: reports/getReport_Nineteen68");
																													client.post(epurl + "reports/getReport_Nineteen68", args,
																														function (domainResult, response) {
																														if (response.statusCode != 200 || domainResult.rows == "fail") {
																															logger.error("Error occured in the service getReport_Nineteen68 - domaindetails: Failed to get domain name from domains.");
																														} else {
																															async.forEachSeries(domainResult.rows, function (domainiditr, callback7) {
																																try {
																																	var domainname = domainiditr.domainname;
																																	reportInfoObj.domainname = domainname;
																																	//console.log('final reportInfoObj in domain deatails', reportInfoObj);
																																	callback7();
																																} catch (exception) {
																																	logger.error("Exception in the service getReport_Nineteen68 - domaindetails: %s",exception);
																																	res.send("fail");
																																}
																															}, callback6);
																														}
																													});
																												} catch (exception) {
																													logger.error("Exception in the service getReport_Nineteen68 - projectdetails: %s",exception);
																													res.send("fail");
																												}
																											}, callback5);
																										}
																									});
																								} catch (exception) {
																									logger.error("Exception in the service getReport_Nineteen68 - releasedetails: %s",exception);
																									res.send("fail");
																								}
																							}, callback4);
																						}
																					});
																				} catch (exception) {
																					logger.error("Exception in the service getReport_Nineteen68 - cycledetails: %s",exception);
																					res.send("fail");
																				}
																			}, callback3);
																		}
																	});
																} catch (exception) {
																	logger.error("Exception in the service getReport_Nineteen68 - cycleid: %s",exception);
																	res.send("fail");
																}
															}, callback2);
														}
													});
												} catch (exception) {
													logger.error("Exception in the service getReport_Nineteen68 - scenariodetails: %s",exception);
													res.send("fail");
												}
											}, callback1);
										}
									});
								} catch (exception) {
									logger.error("Exception in the service getReport_Nineteen68 - projectsUnderDomain: %s",exception);
									res.send("fail");
								}
							}, callback);
						}
					});
				}
			},
				function (err, results) {
				if (err) {
					logger.error("Error occured in the service getReport_Nineteen68: final function: %s",err);
					cb(err);
					res.send("fail");
				} else {
					var finalReport = [];
					finalReport.push(reportInfoObj);
					finalReport.push(reportjson);
					logger.info("Sending reports in the service getReport_Nineteen68: final function");
					res.send(finalReport);
				}
			});
		} else {
			logger.error("Invalid Session, in the service getReport_Nineteen68");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception occured in the service getReport_Nineteen68: %s",exception);
		res.send("fail");
	}
};

exports.exportToJson_ICE = function (req, res) {
	logger.info("Inside UI service: exportToJson_ICE");
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
					logger.info("Calling NDAC Service from exportToJson_ICE - reportdata: reports/exportToJson_ICE");
					client.post(epurl + "reports/exportToJson_ICE", args,
						function (reportResult, response) {
						if (response.statusCode != 200 || reportResult.rows == "fail") {
							logger.error("Error in the service exportToJson_ICE: Failed to get reports.");
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
										logger.info("Calling NDAC Service from exportToJson_ICE - scenarioid: reports/exportToJson_ICE");
										client.post(epurl + "reports/exportToJson_ICE", args,
											function (scenarioResult, response) {
											if (response.statusCode != 200 || scenarioResult.rows == "fail") {
												logger.error("Error in the service exportToJson_ICE: Failed to get scenario Id from reports.");
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
														logger.info("Calling NDAC Service from exportToJson_ICE - scenarioname: reports/exportToJson_ICE");
														client.post(epurl + "reports/exportToJson_ICE", args,
															function (scenarionameResult, response) {
															if (response.statusCode != 200 || scenarionameResult.rows == "fail") {
																logger.error("Error in the service exportToJson_ICE: Failed to get testscenarioname from testscenarios.");
															} else {
																var scenameres = scenarionameResult.rows.length;
																async.forEachSeries(scenarionameResult.rows, function (scenameitr, callback3) {
																	try {
																		var scenarioname = scenameitr.testscenarioname;
																		reportInfoObj.scenarioname = scenarioname;
																		callback3();
																	} catch (exception) {
																		logger.error("Exception in the service exportToJson_ICE - scenarioname: Failed to get testscenarioname from testscenarios: %s", exception);
																		res.send("fail");
																	}
																}, callback2);
															}
														});
													} catch (exception) {
														logger.error("Exception in the service exportToJson_ICE - scenarioname: Failed to get testscenarioname from testscenarios: %s", exception);
														res.send("fail");
													}
												}, callback1);
											}
										});
									} catch (exception) {
										logger.error("Exception in the service exportToJson_ICE - scenarioid: %s", exception);
										res.send("fail");
									}
								}, callback);
							} catch (exception) {
								logger.error("Exception in the service exportToJson_ICE - scenarioid: %s", exception);
								res.send("fail");
							}
						}
					});
				}
			},
				function (err, results) {
				if (err) {
					logger.error("Error in the service exportToJson_ICE final function: %s", err);
					cb(err);
					res.send("fail");
				} else {
					logger.info("Sending reports information object in the service exportToJson_ICE: final function ");
					res.send(reportInfoObj);
				}
			});
		} else {
			logger.error("Error in the service exportToJson_ICE: Invalid Session ");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service exportToJson_ICE: %s", exception);
		res.send("fail");
	}
};

//Connect to Jira
exports.connectJira_ICE = function (req, res) {
	logger.info("Inside UI service: connectJira_ICE");
	try{
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			redisServer.redisSub2.removeAllListeners('message');
			redisServer.redisSub2.subscribe('ICE2_' + req.session.username,1);
			if(req.body.action == 'loginToJira'){ //Login to Jira for creating issues
				var jiraurl = req.body.url;
				var jirausername = req.body.username;
				var jirapwd = req.body.password;
				if(!validateData(jiraurl,"empty") && !validateData(jirausername,"empty") && !validateData(jirapwd,"empty")){
					//var inputs = [jiraurl,jirausername,jirapwd];
					var inputs = {
						"jira_serverlocation": jiraurl,
						"jira_uname": jirausername,
						"jira_pwd": jirapwd
					};
					try {
						var name = req.session.username;
						logger.info("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
						logger.info("ICE Socket requesting Address: %s" , name);
						redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + req.session.username,function(err,redisres){
							if (redisres[1]==1) {
								/* Commented for LB
								if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
								var mySocket = myserver.allSocketsMap[name];
								mySocket._events.jiralogin = [];
								mySocket.emit('jiralogin',req.body.action,inputs);*/
								logger.info("Sending socket request for jira_login to redis");
								dataToIce = {"emitAction": "jira_login", "username": req.session.username, "action": req.body.action, "inputs": inputs};
								redisServer.redisPub1.publish('ICE1_normal_' + req.session.username,JSON.stringify(dataToIce));
								var updateSessionExpiry = setInterval(function () {
									req.session.cookie.maxAge = sessionTime;
								}, updateSessionTimeEvery);
								var count = 0;
								/* Commented for LB
								mySocket.on('auto_populate', function (resultData) {
									clearInterval(updateSessionExpiry);
									if (resultData != "Fail") {
										if(count == 0){
											logger.info('Jira: Login successfully.');
											res.send(resultData); 
											count++;
										}
									} else{
										if(count == 0){
											logger.error('Jira: Login Failed.');
											res.send(resultData); 
											count++;
										}
									}
								});
								mySocket.on("unavailableLocalServer", function () {
									logger.error("Error occured in connectJira_ICE - loginToJira: Socket Disconnected");
									if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
										var soc = myserver.socketMapNotify[name];
										soc.emit("ICEnotAvailable");
									}
								});*/
								redisServer.redisSub2.on("message",function (channel,message) {
									data = JSON.parse(message);
									if(req.session.username == data.username){
										if (data.onAction == "unavailableLocalServer") {
											logger.error("Error occured in connectJira_ICE - loginToJira: Socket Disconnected");
											if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
												var soc = myserver.socketMapNotify[name];
												soc.emit("ICEnotAvailable");
											}
										} else {
											var resultData = data.value;
											clearInterval(updateSessionExpiry);
											if (resultData != "Fail") {
												if(count == 0){
													logger.info('Jira: Login successfully.');
													res.send(resultData); 
													count++;
												}
											} else{
												if(count == 0){
													logger.error('Jira: Login Failed.');
													res.send(resultData); 
													count++;
												}
											}
										}
									}
								});
							} else {
								logger.error("Error occured in the service connectJira_ICE - loginToJira: Socket not Available");
								res.send("unavailableLocalServer");
							}
						});
					} catch (exception) {
						logger.error("Exception in the service connectJira_ICE - loginToJira: %s", exception);
					}
				}
				else{
					logger.error("Error occured in the service connectJira_ICE - loginToJira: Invalid inputs");
					res.send("Fail");
				}
			}
			else if (req.body.action == 'createIssueInJira'){ //Create issues in the Jira
				var createObj = req.body.issue_dict;
				if(!validateData(createObj.project,"empty") && !validateData(createObj.issuetype,"empty") && !validateData(createObj.summary,"empty") && !validateData(createObj.priority,"empty")){
					try {
						var name = req.session.username;
						logger.info("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
						logger.info("ICE Socket requesting Address: %s" , name);
						redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + req.session.username,function(err,redisres){
							if (redisres[1]==1) {
								/* Commented for LB
								if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
								var mySocket = myserver.allSocketsMap[name];
								mySocket._events.jiralogin = [];
								mySocket._events.issue_id = [];
								mySocket.emit('jiralogin',req.body.action,createObj);*/
								logger.info("Sending socket request for jira_login to redis");
								dataToIce = {"emitAction": "jira_login", "username": req.session.username, "action": req.body.action, "inputs": createObj};
								redisServer.redisPub1.publish('ICE1_normal_' + req.session.username,JSON.stringify(dataToIce));
								var updateSessionExpiry = setInterval(function () {
									req.session.cookie.maxAge = sessionTime;
								}, updateSessionTimeEvery);
								var count = 0;
								/* Commented for LB
								mySocket.on('issue_id', function (resultData) {
									clearInterval(updateSessionExpiry);
									if (resultData != "Fail") {
										if(count == 0){
											logger.info('Jira: Issue created successfully.');
											res.send(resultData);
											count++;
										}
									} else {
										if(count == 0){
											logger.error('Jira: Failed to create issue.');
											res.send(resultData);
											count++;
										}
									}
								});
								mySocket.on("unavailableLocalServer", function () {
									logger.error("Error occured in connectJira_ICE - createIssueInJira: Socket Disconnected");
									if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
										var soc = myserver.socketMapNotify[name];
										soc.emit("ICEnotAvailable");
									}
								});*/
								redisServer.redisSub2.on("message",function (channel,message) {
									data = JSON.parse(message);
									if(req.session.username == data.username){
										if (data.onAction == "unavailableLocalServer") {
											logger.error("Error occured in connectJira_ICE - createIssueInJira: Socket Disconnected");
											if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
												var soc = myserver.socketMapNotify[name];
												soc.emit("ICEnotAvailable");
											}
										} else {
											var resultData = data.value;
											clearInterval(updateSessionExpiry);
											if (resultData != "Fail") {
												if(count == 0){
													logger.info('Jira: Issue created successfully.');
													res.send(resultData);
													count++;
												}
											} else {
												if(count == 0){
													logger.error('Jira: Failed to create issue.');
													res.send(resultData);
													count++;
												}
											}
										}
									}
								});
							} else {
								logger.error("Error occured in the service connectJira_ICE - createIssueInJira: Socket not Available");
								res.send("unavailableLocalServer");
							}
						});
					} catch (exception) {
						logger.error("Exception in the service connectJira_ICE - createIssueInJira: %s", exception);
					}
				}
				else{
					logger.error("Error occured in the service connectJira_ICE - createIssueInJira: Invalid inputs");
					res.send("Fail");
				}
			}
		} else {
			logger.error("Error occured in the service connectJira_ICE - createIssueInJira: Invalid Session");
			res.send("Invalid Session");
		}
	}
	catch (exception) {
		logger.error("Exception in the service connectJira_ICE: %s", exception);
		res.send("Fail");
	}
};

function validateData(content, type){
	logger.info("Inside function: validateData");
	switch(type){
		case "empty":
			return validator.isEmpty(content);
		case "url":
			return validator.isURL(content);
		case "num":
			return validator.isNumeric(content);
		case "alph":
			return validator.isAlpha(content);
		case "len":
			return validator.isLength(content);
		case "uuid":
			return validator.isUUID(content);
		case "email":
			return validator.isEmail(content);
		case "json":
			return validator.isJSON(content);
	}
}
