/**
 * Dependencies.
 */
var myserver = require('../lib/socket');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.NDAC_URL;
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');


function uploadTestCaseData(inputs, uploadTestCaseDatacallback) {
	try {
		logger.info("Inside the function uploadTestCaseData ");
		var statusFlag = "";
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling NDAC Service from uploadTestCaseData: design/updateTestCase_ICE");
		client.post(epurl + "design/updateTestCase_ICE", args,
			function (result, response) {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occurred in design/updateTestCase_ICE from uploadTestCaseData Error Code : ERRNDAC");
				statusFlag = "Error occurred in updateTestCaseQuery : Fail";
				uploadTestCaseDatacallback(statusFlag, null);
			} else {
				statusFlag = "success";
				uploadTestCaseDatacallback(null, statusFlag);
			}
		});
	} catch (exception) {
		logger.error("Exception in the function uploadTestCaseData: %s", exception);
	}
}

exports.readTestCase_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: readTestCase_ICE");
		if (utils.isSessionActive(req)) {
			//base output elements
			var testcasesteps = "";
			var testcasename = "";
			var template = "";
			// base request elements
			var requestedscreenid = req.body.screenid;
			var requestedtestscasename = req.body.testcasename;
			var requestedtestscaseid = req.body.testcaseid;
			var requestedversionnumber = req.body.versionnumber;
			var screenName = req.body.screenName;
			var userid = req.body.userInfo.user_id;
			// base request elements sent in request
			inputs = {
				"screenid": requestedscreenid,
				"testcasename": requestedtestscasename,
				"testcaseid": requestedtestscaseid,
				"versionnumber": requestedversionnumber,
				"userid": userid,
				"query": "readtestcase"
			};
			if (!requestedscreenid){ // if there is no screenid fetch just by testcase id in add dependent test cases
				inputs.query = "testcaseid";
				inputs.readonly = true;
			}
			if (screenName == ""){
				inputs.screenName = 'fetch';
			}
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			var responsedata = {
				template: "",
				testcase: "",
				testcasename: ""
			};
			logger.info("Calling NDAC Service from readTestCase_ICE: design/readTestCase_ICE");
			//Query 1 fetching the testcasesteps from the test cases based on requested screenid,testcasename,testcaseid
			client.post(epurl + "design/readTestCase_ICE", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						var flag = "Error in readTestCase_ICE : Fail";
						logger.error("Error occurred in design/readTestCase_ICE: service readTestCase_ICE, Error Code : ERRNDAC");
						try {
							res.send(flag);
						} catch (exception) {
							logger.error("Exception while sending response from the service readTestCase_ICE: %s", exception);
						}
					} else {
						if (!requestedscreenid){
							testcasesteps = result.rows[0].steps;
							testcasename = result.rows[0].name;
							reuse= (result.rows[0].parent>1)?true:false;
							responsedata = {
								template: "",
								reuse: reuse,
								testcase: testcasesteps,
								testcasename: testcasename,
								del_flag: result.del_flag
							};
							if ('screenName' in result){
								responsedata.screenName = result.screenName;
							}
							res.send(responsedata);
						}else{
							try {
								for (var i = 0; i < result.rows.length; i++) {
									testcasesteps = result.rows[i].steps;
									testcasename = result.rows[i].name;
									reuse= (result.rows[i]>1)?true:false;
								}
								responsedata = {
									template: "",
									testcase: testcasesteps,
									reuse: reuse,
									testcasename: testcasename,
									del_flag: result.del_flag
								};
								if ('screenName' in result){
									responsedata.screenName = result.screenName;
								}
								try {
									res.send(responsedata);
								} catch (exception) {
									logger.error("Exception while sending response data from the service readTestCase_ICE - fetchScrapedData: %s", exception);
								}
							} catch (exception) {
								logger.error("Exception in the service readTestCase_ICE: %s", exception);
							}
						}
					}
				} catch (exception) {
					logger.error("Exception in the service readTestCase_ICE: %s", exception);
				}
			});
		} else {
			logger.error("Error in the service readTestCase_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service readTestCase_ICE: %s", exception);
	}
};

exports.updateTestCase_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: updateTestCase_ICE");
		if (utils.isSessionActive(req)) {
			//base request elements
			var requestedscreenid = req.body.screenid;
			var requestedtestcaseid = req.body.testcaseid;
			var requestedtestcasename = req.body.testcasename;
			var requestedversionnumber = req.body.versionnumber;
			var requestedtestcasesteps = JSON.parse(req.body.testcasesteps);
			var import_status = req.body.import_status;
			var userinfo = req.body.userinfo;
			var inputs = {
				"screenid": requestedscreenid,
				"query": "updatetestcasedata",
				"modifiedby": userinfo.user_id,
				"modifiedbyrole": userinfo.role,
				"testcasesteps": requestedtestcasesteps,
				"versionnumber": requestedversionnumber,
				"testcaseid": requestedtestcaseid,
				"testcasename": requestedtestcasename,
				"import_status": import_status,
			};
			logger.info("Calling function uploadTestCaseData from updateTestCase_ICE");
			uploadTestCaseData(inputs, function (error, response) {
				if (error) {
					try {
						res.send(error);
					} catch (exception) {
						logger.error("Exception in the service updateTestCase_ICE - uploadTestCaseData: %s", exception);
					}
				} else {
					try {
						res.send(response);
					} catch (exception) {
						logger.error("Exception in the service updateTestCase_ICE - uploadTestCaseData: %s", exception);
					}
				}
			});
		} else {
			logger.error("Error in the service updateTestCase_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service updateTestCase_ICE: %s", exception);
	}
};

exports.debugTestCase_ICE = function (req, res) {
	var username,icename;
	try {
		logger.info("Inside UI service: debugTestCase_ICE");
		if (utils.isSessionActive(req)) {
			username=req.session.username;
			icename = myserver.allSocketsICEUser[username];
			redisServer.redisSubServer.subscribe('ICE2_' + icename);
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , icename);
			//LB: check on redis whether the ice socket is connected to any of the servers
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + icename,function(err,redisres){
				if (redisres[1]>0) {
					try {
						var action = req.body.param;
						if (action == 'debugTestCase_ICE') {
							try {
								var requestedbrowsertypes = req.body.browsertypes;
								var requestedtestcaseids = req.body.testcaseids;
								var apptype = req.body.apptype;
								var responsedata = [];
								var browsertypeobject = {
									browsertype: requestedbrowsertypes
								};
								var flag = "";
								var inputs = {
									"query": "testcaseids",
									"testcaseid": requestedtestcaseids,
									"userid": req.body.userInfo.user_id
								};
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								logger.info("Calling NDAC Service from debugTestCase_ICE: design/readTestCase_ICE");
								client.post(epurl + "design/readTestCase_ICE", args,
									function (testcasedataresult, response) {
									try {
										if (response.statusCode != 200 || testcasedataresult.rows == "fail") {
											flag = "Error in getProjectTestcasedata : Fail";
											logger.error("Error occurred in design/readTestCase_ICE from the service debugTestCase_ICE Error Code : ERRNDAC");
											try {
												res.send(flag);
											} catch (exception) {
												logger.error("Exception in the service debugTestCase_ICE: %s", exception);
											}
										} else {
											var testcases = testcasedataresult.rows;
											for (i = 0; i < testcases.length; i++){
												var responseobject = {
													template: "",
													testcasename: "",
													testcase: [],
													apptype: ""
												};
												responseobject.testcase = testcases[i].steps;
												responseobject.testcasename = testcases[i].name;
												responseobject.apptype = apptype;
												responsedata.push(responseobject);
											}
											responsedata.push(browsertypeobject);
											logger.info("Sending socket request for debugTestCase to cachedb");
											dataToIce = {"emitAction" : "debugTestCase","username" : icename, "responsedata":responsedata};
											redisServer.redisPubICE.publish('ICE1_normal_' + icename,JSON.stringify(dataToIce));
											function result_debugTestCase_listener(channel, message) {
												data = JSON.parse(message);
												//LB: make sure to send recieved data to corresponding user
												if (icename == data.username) {
													redisServer.redisSubServer.removeListener('message', result_debugTestCase_listener);
													if (data.onAction == "unavailableLocalServer") {
														logger.error("Error occurred in debugTestCase_ICE: Socket Disconnected");
														if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
															var soc = myserver.socketMapNotify[username];
															soc.emit("ICEnotAvailable");
														}
													} else if (data.onAction == "result_debugTestCase") {
														try {
															res.send(data.value);
														} catch (exception) {
															logger.error("Exception in the service debugTestCase_ICE: %s", exception);
														}
													}
												}
											}
											redisServer.redisSubServer.on("message",result_debugTestCase_listener);
										}
									} catch (exception) {
										logger.error("Exception in the service debugTestCase_ICE: %s", exception);
									}
								});
							} catch (exception) {
								logger.error("Exception in the service debugTestCase_ICE: %s", exception);
							}
						} else if (action == 'debugTestCaseWS_ICE') {
							try {
								var testcaseWS = [];
								testcaseWS.push(req.body.testCaseWS);
								logger.info("Sending socket request for debugTestCaseWS_ICE to cachedb");
								dataToIce = {"emitAction" : "debugTestCase","username" : icename, "responsedata":testcaseWS};
								redisServer.redisPubICE.publish('ICE1_normal_' + icename,JSON.stringify(dataToIce));
								function result_debugTestCaseWS_listener(channel, message) {
									data = JSON.parse(message);
									//LB: make sure to send recieved data to corresponding user
									if (data.username == icename) {
										redisServer.redisSubServer.removeListener('message', result_debugTestCaseWS_listener);
										if (data.onAction == "unavailableLocalServer") {
											logger.error("Error occurred in debugTestCase_ICE: Socket Disconnected");
											if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
												var soc = myserver.socketMapNotify[username];
												soc.emit("ICEnotAvailable");
											}
										} else {
											var value = data.value;
											try {
												if (value.toUpperCase() === 'TERMINATE' || value === 'ExecutionOnlyAllowed') {
													try {
														res.send(value);
													} catch (exception) {
														logger.error("Exception while sending response in the service debugTestCase_ICE - result_debugTestCaseWS: %s", exception);
													}
												} else {
													var responsedata = {
														responseHeader: [],
														responseBody: []
													};
													if (value != "fail" && value != undefined && value != "") {
														var response = value.split('rEsPONseBOdY:');
														if (response.length == 2) {
															responsedata.responseHeader.push(response[0]);
															responsedata.responseBody.push(response[1].replace("&gt;", ">").replace("&lt;", "<"));
															try {
																res.send(responsedata);
															} catch (exception) {
																logger.error("Exception while sending response data in the service debugTestCase_ICE - result_debugTestCaseWS: %s", exception);
															}
														} else if (response.length == 1) {
															responsedata.responseHeader.push(response[0]);
															responsedata.responseBody.push("");
															try {
																res.send(responsedata);
															} catch (exception) {
																logger.error("Exception while sending response data in the service debugTestCase_ICE - result_debugTestCaseWS: %s", exception);
															}
														} else {
															responsedata.responseHeader.push("");
															responsedata.responseBody.push("");
															try {
																res.send(responsedata);
															} catch (exception) {
																logger.error("Exception while sending response data in the service debugTestCase_ICE - result_debugTestCaseWS: %s", exception);
															}
														}
													} else {
														responsedata.responseHeader.push("Response Header - Fail");
														responsedata.responseBody.push("Response Body - Fail");
														try {
															res.send(responsedata);
														} catch (exception) {
															logger.error("Exception while sending response data in the service debugTestCase_ICE - result_debugTestCaseWS: %s", exception);
														}
													}
												}
											} catch (exception) {
												logger.error("Exception in the service debugTestCase_ICE - result_debugTestCaseWS: %s", exception);
											}
										}
									}
								}
								redisServer.redisSubServer.on("message",result_debugTestCaseWS_listener);
							} catch (exception) {
								logger.error("Exception in the service debugTestCase_ICE - debugTestCaseWS_ICE: %s", exception);
							}
						} else if (action == 'wsdlListGenerator_ICE') {
							try {
								var wsdlurl = req.body.wsdlurl;
								logger.info("Sending socket request for debugTestCase to cachedb");
								dataToIce = {"emitAction" : "wsdl_listOfOperation","username" : icename, "wsdlurl":wsdlurl};
								redisServer.redisPubICE.publish('ICE1_normal_' + icename,JSON.stringify(dataToIce));	
									function result_wsdl_listOfOperation_listener(channel, message) {
										data = JSON.parse(message);
										//LB: make sure to send recieved data to corresponding user
										if (data.username == icename) {
											redisServer.redisSubServer.removeListener('message', result_wsdl_listOfOperation_listener);
											if (data.onAction == "unavailableLocalServer") {
												logger.error("Error occurred in debugTestCase_ICE: Socket Disconnected");
												if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
													var soc = myserver.socketMapNotify[username];
													soc.emit("ICEnotAvailable");
												}
											} else if (data.onAction == "result_wsdl_listOfOperation") {
												var listGenResponse = data.value;
												try {
													if (listGenResponse.toUpperCase() === 'TERMINATE' || listGenResponse === "ExecutionOnlyAllowed") {
														try {
															res.send(listGenResponse);
														} catch (exception) {
															logger.error("Exception in the service debugTestCase_ICE - result_wsdl_listOfOperation: %s", exception);
														}
													} else {
														var responsedata = {
															listofoperations: []
														};
														if (listGenResponse != "None" && listGenResponse != "fail" && listGenResponse != undefined && listGenResponse != "") {
															listGenResponse = listGenResponse.replace(/'+/g, "\"");
															var listGenResponse = JSON.parse(listGenResponse);
															responsedata.listofoperations = listGenResponse;
															logger.info("Sending response data in the service debugTestCase_ICE: result_wsdl_listOfOperation");
															res.send(responsedata);
														} else {
															try {
																res.send("fail");
															} catch (exception) {
																logger.error("Exception in the service debugTestCase_ICE - result_wsdl_listOfOperation: %s", exception);
															}
														}
													}
												} catch (exception) {
													logger.error("Exception in the service debugTestCase_ICE - result_wsdl_listOfOperation: %s", exception);
												}
											}
										}
									}
									redisServer.redisSubServer.on("message",result_wsdl_listOfOperation_listener);
								
							} catch (exception) {
								logger.error("Exception in the service debugTestCase_ICE - wsdlListGenerator_ICE: %s", exception);
							}
						} else if (action == 'wsdlServiceGenerator_ICE') {
							try {
								var wsdlurl = req.body.wsdlurl;
								var operations = req.body.method;
                                var certificate = req.body.resultFile;
								var soapVersion = '0';
								if (operations.indexOf('SOAP1.2') !== -1) {
									soapVersion = '1';
								}
								if (operations.indexOf('SOAP') !== -1) {
									operations = operations.split('-')[1];
								}
								var serviceGenRequest = {
									wsdlurl: wsdlurl,
									operations: operations,
									soapVersion: soapVersion,
                                    serverCertificate:certificate
								};
								logger.info("Sending socket request for debugTestCase to cachedb");
								dataToIce = {"emitAction" : "wsdl_ServiceGenerator","username" : icename, "serviceGenRequest":serviceGenRequest};
								redisServer.redisPubICE.publish('ICE1_normal_' + icename,JSON.stringify(dataToIce));
								function result_wsdl_ServiceGenerator_listener(channel, message) {
									data = JSON.parse(message);
									//LB: make sure to send recieved data to corresponding user
									if (data.username == icename) {
										redisServer.redisSubServer.removeListener('message', result_wsdl_ServiceGenerator_listener);
										if (data.onAction == "unavailableLocalServer") {
											logger.error("Error occurred in debugTestCase_ICE: Socket Disconnected");
											if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
												var soc = myserver.socketMapNotify[username];
												soc.emit("ICEnotAvailable");
											}
										} else if (data.onAction == "result_wsdl_ServiceGenerator") {
											try {
												if (data.value.toUpperCase() === 'TERMINATE' || data.value === "ExecutionOnlyAllowed") {
													try {
														res.send(data.value);
													} catch (exception) {
														logger.error("Exception in the service debugTestCase_ICE - result_wsdl_ServiceGenerator: %s", exception);
													}
												} else {
													var responsedata = {
														endPointURL: [],
														method: ["POST"],
														header: [],
														body: [],
														operations: [],
														responseHeader: [""],
														responseBody: [""]
													};
													responsedata.endPointURL.push(wsdlurl.split('?')[0]);
													responsedata.operations.push(operations);
													if (data.value != "fail" && data.value != undefined && data.value != "") {
														response = data.value.split('rEsPONseBOdY:');
														if (response.length == 2) {
															responsedata.header.push(response[0]);
															responsedata.body.push(response[1]);
														} else if (response.length == 1) {
															responsedata.header.push(response[0]);
															responsedata.body.push("");
														} else {
															responsedata.header.push("");
															responsedata.body.push("");
														}
													} else {
														responsedata.header.push("");
														responsedata.body.push("");
													}
													try {
														res.send(responsedata);
													} catch (exception) {
														logger.error("Exception in the service debugTestCase_ICE - result_wsdl_ServiceGenerator: %s", exception);
													}
												}
											} catch (exception) {
												logger.error("Exception in the service debugTestCase_ICE - result_wsdl_ServiceGenerator: %s", exception);
											}
										}
									}
								}
								redisServer.redisSubServer.on("message",result_wsdl_ServiceGenerator_listener);
							} catch (exception) {
								logger.error("Exception in the service debugTestCase_ICE - wsdlServiceGenerator_ICE: %s", exception);
							}
						}
					} catch (exception) {
						logger.error("Exception in the service debugTestCase_ICE - wsdlServiceGenerator_ICE: %s", exception);
					}
				} else {
					logger.error("Error in the service debugTestCase_ICE: Socket not Available");
					try {
						utils.getChannelNum('ICE1_scheduling_' + icename, function(found){
							var flag="";
							if (found) flag = "scheduleModeOn";
							else flag = "unavailableLocalServer";
							res.send(flag);
						});
					} catch (exception) {
						logger.error("Error in the service debugTestCase_ICE: %s", exception);
					}
				}
			});
		} else {
			logger.error("Error in the service debugTestCase_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		utils.getChannelNum('ICE1_scheduling_' + icename, function(found){
			var flag="";
			if (found) flag = "scheduleModeOn";
			else flag = "unavailableLocalServer";
			res.send(flag);
		});
		logger.error("Exception in the service debugTestCase_ICE:unavailableLocalServer: %s", exception);
	}
};

exports.getKeywordDetails_ICE = function getKeywordDetails_ICE(req, res) {
	try {
		logger.info("Inside UI service: getKeywordDetails_ICE");
		if (utils.isSessionActive(req)) {
			var requestedprojecttypename = req.body.projecttypename;
			// Query 1 fetching the objecttype,keywords basked on projecttypename
			var individualsyntax = {};
			var args = {
				data: requestedprojecttypename,
				headers: {
					'Content-Type': 'application/json'
				}
			};
			logger.info("Calling NDAC Service from getKeywordDetails_ICE: design/getKeywordDetails_ICE");
			client.post(epurl + "design/getKeywordDetails_ICE", args,
				function (projectBasedKeywordsresult, response) {
					try {
						if (response.statusCode != 200 || projectBasedKeywordsresult.rows == "fail") {
							try {
								logger.error("Error occurred in design/getKeywordDetails_ICE from getKeywordDetails_ICE, Error Code : ERRNDAC");
								res.send("Server data rendering failed: Fail");
							} catch (exception) {
								logger.error("Exception in the service getKeywordDetails_ICE: %s", exception);
							}
						} else {
							for (var objectindex = 0; objectindex < projectBasedKeywordsresult.rows.length; objectindex++) {
								var objecttype = projectBasedKeywordsresult.rows[objectindex].objecttype;
								var keywords = projectBasedKeywordsresult.rows[objectindex].keywords;
								individualsyntax[objecttype] = keywords;
							}
							try {
								res.send(individualsyntax);
							} catch (exception) {
								logger.error("Exception in the service getKeywordDetails_ICE: %s", exception);
							}
						}
					} catch (exception) {
						logger.error("Exception in the service getKeywordDetails_ICE: %s", exception);
					}
				});
		} else {
			logger.error("Error occurred in the service getKeywordDetails_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service getKeywordDetails_ICE: %s", exception);
	}
};

exports.getTestcasesByScenarioId_ICE = function getTestcasesByScenarioId_ICE(req, res) {
	try {
		logger.info("Inside UI service: getTestcasesByScenarioId_ICE");
		if (utils.isSessionActive(req)) {
			var testcasesArr = [];
			var testScenarioId = req.body.testScenarioId;
			var inputs = {
				"testscenarioid": testScenarioId,
				"query": "gettestcasedetails"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from getTestcasesByScenarioId_ICE - gettestcaseids: design/getTestcasesByScenarioId_ICE");
			client.post(epurl + "design/getTestcasesByScenarioId_ICE", args,
				function (testcasesResult, response) {
				try {
					if (response.statusCode != 200 || testcasesResult.rows == "fail") {
						flag = "Error in fetching testcaseIds : Fail";
						try {
							logger.error("Error in fetching testcaseIds");
							res.send(flag);
						} catch (exception) {
							logger.error("Exception in the service getTestcasesByScenarioId_ICE - gettestcaseids: %s", exception);
						}
					} else {
						var testcases = testcasesResult.rows.testcaseids;
						var testcasenames = testcasesResult.rows.testcasenames;
						for (index = 0; index < testcases.length; index++){
							var testcasesObj = {};
							testcasesObj.testcaseId = testcases[index];
							testcasesObj.testcaseName = testcasenames[index];
							testcasesArr.push(testcasesObj);
						}
						try {
							logger.info("Sending testcase details");
							res.send(testcasesArr);
						} catch (exception) {
							logger.error("Exception in sending response from the service getTestcasesByScenarioId_ICE: %s", exception);
						}
					}
				} catch (exception) {
					logger.error("Exception in the service getTestcasesByScenarioId_ICE: %s", exception);
				}
			});
		} else {
			logger.error("Error occurred in the service getTestcasesByScenarioId_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service getTestcasesByScenarioId_ICE: %s", exception);                  
	}
};