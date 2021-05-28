/**
 * Dependencies.
 */
const myserver = require('../lib/socket');
const Client = require("node-rest-client").Client;
const client = new Client();
const epurl = process.env.DAS_URL;
const logger = require('../../logger');
const redisServer = require('../lib/redisSocketHandler');
const utils = require('../lib/utils');

exports.readTestCase_ICE = async (req, res) => {
	const fnName = "readTestCase_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
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
		if (screenName == "") inputs.screenName = 'fetch';
		const result = await utils.fetchData(inputs, "design/readTestCase_ICE", fnName);
		if (result == "fail") return res.send("Error in readTestCase_ICE : Fail");

		//base output elements
		var testcasesteps = "";
		var testcasename = "";
		var reuse = false;
		if (!requestedscreenid){
			testcasesteps = result[0].steps;
			testcasename = result[0].name;
			reuse = result[0].parent > 1;
		} else {
			for (var i = 0; i < result.length; i++) {
				testcasesteps = result[i].steps;
				testcasename = result[i].name;
				reuse = result[i] > 1;
			}
		}
		let responsedata = {
			template: "",
			reuse: reuse,
			testcase: testcasesteps,
			testcasename: testcasename,
			del_flag: result.del_flag
		};
		if (result.screenName) {
			responsedata.screenName = result.screenName;
		}
		res.send(responsedata);
	} catch (exception) {
		logger.error("Error occurred in design/"+fnName+":", exception);
        res.status(500).send("fail");
	}
};

exports.updateTestCase_ICE = async (req, res) => {
	const fnName = "updateTestCase_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		var tcData = req.body;
		var testcasesteps = JSON.parse(req.body.testcasesteps);
		const inputs = {
			"screenid": tcData.screenid,
			"query": "updatetestcasedata",
			"modifiedby": req.session.userid,
			"modifiedbyrole": req.session.activeRoleId,
			"testcasesteps": testcasesteps,
			"versionnumber": tcData.versionnumber,
			"testcaseid": tcData.testcaseid,
			"testcasename": tcData.testcasename,
			"import_status": tcData.import_status,
			"copiedTestCases": tcData.copiedTestCases,
		};
		const result = await utils.fetchData(inputs, "design/updateTestCase_ICE", fnName);
		if (result == "fail") return res.send("Error occurred in updateTestCaseQuery : Fail");
		res.send("success");
	} catch (exception) {
		logger.error("Error occurred in design/"+fnName+":", exception);
        res.status(500).send("fail");
	}
};

exports.debugTestCase_ICE = function (req, res) {
	var username,icename;
	try {
		logger.info("Inside UI service: debugTestCase_ICE");
		username=req.session.username;
		icename = undefined;
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
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
							logger.info("Calling DAS Service from debugTestCase_ICE: design/readTestCase_ICE");
							client.post(epurl + "design/readTestCase_ICE", args,
								function (testcasedataresult, response) {
								try {
									if (response.statusCode != 200 || testcasedataresult.rows == "fail") {
										flag = "Error in getProjectTestcasedata : Fail";
										logger.error("Error occurred in design/readTestCase_ICE from the service debugTestCase_ICE Error Code : ERRDAS");
										try {
											res.send(flag);
										} catch (exception) {
											logger.error("Exception in the service debugTestCase_ICE: %s", exception);
										}
									} else {
										var testcases = testcasedataresult.rows;
										const tcDict = {};
										for (let i = 0; i < testcases.length; i++){
											tcDict[testcases[i]._id] = {
												template: "",
												testcasename: testcases[i].name,
												testcase: testcases[i].steps,
												apptype: apptype
											};
										}
										var responsedata = requestedtestcaseids.map(i=> tcDict[i])
										responsedata.push(browsertypeobject);
										logger.info("Sending socket request for debugTestCase to cachedb");
										dataToIce = {"emitAction" : "debugTestCase","username" : icename, "responsedata":responsedata};
										redisServer.redisPubICE.publish('ICE1_normal_' + icename,JSON.stringify(dataToIce));
										function result_debugTestCase_listener(channel, message) {
											data = JSON.parse(message);
											//LB: make sure to send recieved data to corresponding user
											if (icename == data.username && ["unavailableLocalServer", "result_debugTestCase"].includes(data.onAction)) {
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
								if (data.username == icename && ["unavailableLocalServer", "result_debugTestCaseWS"].includes(data.onAction)) {
									redisServer.redisSubServer.removeListener('message', result_debugTestCaseWS_listener);
									if (data.onAction == "unavailableLocalServer" ) {
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
									if (data.username == icename && ["unavailableLocalServer", "result_wsdl_listOfOperation"].includes(data.onAction)) {
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
								if (data.username == icename && ["unavailableLocalServer", "result_wsdl_ServiceGenerator"].includes(data.onAction)) {
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

exports.getKeywordDetails_ICE = async (req, res) => {
	const fnName = "getKeywordDetails_ICE";
	logger.info("Inside UI service: " + fnName);
    try {
		const inputs = req.body.projecttypename;
		// Query 1 fetching the objecttype,keywords basked on projecttypename
		const result = await utils.fetchData(inputs, "design/getKeywordDetails_ICE", fnName);
		if (result == "fail") return res.send("Server data rendering failed: Fail");
		var individualsyntax = {};
		for (var i = 0; i < result.length; i++) {
			var objecttype = result[i].objecttype;
			var keywords = result[i].keywords;
			individualsyntax[objecttype] = keywords;
		}
		res.send(individualsyntax);
	} catch (exception) {
		logger.error("Error occurred in design/"+fnName+":", exception);
        res.status(500).send("fail");
	}
};

exports.getTestcasesByScenarioId_ICE = async (req, res) => {
	const fnName = "getTestcasesByScenarioId_ICE";
	logger.info("Inside UI service: " + fnName);
    try {
		var testScenarioId = req.body.testScenarioId;
		const inputs = {
			"testscenarioid": testScenarioId,
			"query": "gettestcasedetails"
		};
		const result = await utils.fetchData(inputs, "design/getTestcasesByScenarioId_ICE", fnName);
		if (result == "fail") return res.send("Error in fetching testcaseIds : Fail");
		var testcases = result.testcaseids;
		var testcasenames = result.testcasenames;
		var testcasesArr = [];
		for (index = 0; index < testcases.length; index++){
			var testcasesObj = {};
			testcasesObj.testcaseId = testcases[index];
			testcasesObj.testcaseName = testcasenames[index];
			testcasesArr.push(testcasesObj);
		}
		logger.info("Sending testcase details from design/"+fnName+" service");
		res.send(testcasesArr);
	} catch (exception) {
		logger.error("Error occurred in design/"+fnName+":", exception);
        res.status(500).send("fail");
	}
};