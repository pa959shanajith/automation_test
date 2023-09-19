/**
 * Dependencies.
 */
var async = require('async');
var myserver = require('../lib/socket');
var epurl = process.env.DAS_URL;
var Client = require("node-rest-client").Client;
var client = new Client();
var validator = require('validator');
var logger = require('../../logger');
var utils = require('../lib/utils');
var xlsx = require('xlsx');
var xl = require('excel4node');

let headers
module.exports.setReq = async (req) =>
{
	headers=req;
}
/* Convert excel file to CSV Object. */
var xlsToCSV = function (workbook, sheetname) {
	var result = [];
	var csv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetname]);
	if (csv.length > 0) {
		result.push(sheetname);
		result.push(csv);
	}
	//return result.join("\n");
	return result;
};

exports.loginToZephyr_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: loginToZephyr_ICE");
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username = req.session.username;
		var name = undefined;
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) name = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][name];	
		logger.debug("ICE Socket requesting Address: %s" , name);
		const reqData = req.body;
		var check_zephyrURL = !validator.isEmpty(req.body.zephyrPayload.zephyrURL);
		var check_zephyrauthtype = !validator.isEmpty(req.body.zephyrPayload.authtype);
		if(!check_zephyrURL) {
			logger.info("Error occurred in loginToZephyr_ICE: Invalid Zephyr URL");
			return res.send("invalidurl");
		}
		if(check_zephyrURL && check_zephyrauthtype) {
			if(mySocket != undefined) {
					var zephyrPayload = req.body.zephyrPayload;
					var integrationType = reqData.integrationType;
					var zephyraction = reqData.zephyraction;
					var zephyrDetails = {
						"zephyrPayload": zephyrPayload,
						"integrationType" : integrationType,
						"zephyraction": zephyraction
					};
					logger.info("Sending socket request for zephyrlogin to redis");
					mySocket.emit("zephyrlogin", zephyrDetails);
					function zephyrlogin_listener(message) {
						var data = message;
						mySocket.removeListener('qcresponse',zephyrlogin_listener);
							res.send(data);
					}
					mySocket.on("qcresponse",zephyrlogin_listener);
				} else {
						flag = "unavailableLocalServer";
						logger.info("ICE Socket not Available");
						res.send(flag);
				}
			
		} else {
			logger.info("Error occurred in loginZephyrServer_ICE: Invalid Zephyr Credentials");
			res.send("invalidcredentials");
		}
	} catch (exception) {
		logger.error("Error occurred in loginZephyrServer_ICE:", exception.message);
		res.send("fail");
	}
};

exports.zephyrProjectDetails_ICE = function (req, res) {
	logger.info("Inside UI service: zephyrProjectDetails_ICE");
	try {
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username = req.session.username;
		var name= undefined
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) name = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][name];	
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		if(mySocket != undefined) {	
				var zephyrDetails = {
					"projectId": req.body.projectId,
					"zephyraction": req.body.zephyraction
				};
				logger.info("Sending socket request for zephyrlogin to redis");
				mySocket.emit("zephyrlogin", zephyrDetails);
				function zephyrlogin_listener(message) {
					var data = message;
					mySocket.removeListener('qcresponse',zephyrlogin_listener);
					res.send(data);
				}
				mySocket.on("qcresponse",zephyrlogin_listener);
			} else {
					flag = "unavailableLocalServer";
					logger.info("ICE Socket not Available");
					res.send(flag);
			}
		
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.zephyrTestcaseDetails_ICE = function (req, res) {
	logger.info("Inside UI service: zephyrTestcaseDetails_ICE");
	try {
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username = req.session.username;
		var name = undefined;
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) name = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][name];	
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		if(mySocket != undefined) {
				var zephyrDetails = {
					"treeId": req.body.treeId,
					"zephyraction": req.body.zephyraction
				};
				logger.info("Sending socket request for zephyrlogin to redis");
				mySocket.emit("zephyrlogin", zephyrDetails);
				function zephyrlogin_listener(message) {
					var data = message;
					mySocket.removeListener('qcresponse',zephyrlogin_listener);
					res.send(data);
				}
				mySocket.on("qcresponse",zephyrlogin_listener);
			} else {
					flag = "unavailableLocalServer";
					logger.info("ICE Socket not Available");
					res.send(flag);
			}
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.zephyrMappedTestcaseDetails_ICE = async (req, res) => {
	logger.info("Inside UI service: zephyrMappedTestcaseDetails_ICE");
	var mappedTests = [];
	var mappedDets = [];
	try {
		//get mapped details
		try {
			var userid = req.session.userid;
			var inputs = {
				"userid": userid,
				"treeid": req.body.cyclephaseid,
				"query": "zephyrdetails"
			};
			mappedDets = await utils.fetchData(inputs, "qualityCenter/getMappedDetails", "zephyrMappedCyclePhase");
			if (mappedDets == "fail") res.send('fail');
			for(var i=0;i<mappedDets.length;++i) {
				mappedTests.push(...mappedDets[i].testid);
			}
		} catch (exception) {
			logger.error("Error occurred in zephyr/"+zephyrMappedCyclePhase+":", exception);
			res.send("fail");
		}
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username = req.session.username;
		var name = undefined;
	
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) name = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][name];	
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		if(mySocket != undefined) {	
				var zephyrDetails = {
					"treeId": req.body.treeId,
					"mappedTests": mappedTests,
					"zephyraction": req.body.zephyraction
				};
				logger.info("Sending socket request for zephyrlogin to redis");
				mySocket.emit("zephyrlogin", zephyrDetails);
				function zephyrlogin_listener(message) {
					var data = message;
					mySocket.removeListener('qcresponse',zephyrlogin_listener);
					res.send(data);
				}
				mySocket.on("qcresponse",zephyrlogin_listener);
			} else {
					flag = "unavailableLocalServer";
					logger.info("ICE Socket not Available");
					res.send(flag);
			}
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.zephyrUpdateMapping = async (req, res) => {
	logger.info("Inside UI service: zephyrUpdateMapping");
	var mappedTestIds = [];
	var mappedTestNames = [];
	var mappedTreeIds = [];
	var mappedParentIds = [];
	var mappedProjectIds = [];
	var mappedReleaseIds = [];
	var testIds = [];
	var testNames = [];
	var testList = {};
	var finalList = {update:[], error:[], warning:[]};
	var treeidParentIdMap = {};
	try {
		var releaseId = parseInt(req.body.updateMapPayload.releaseId);
		var phaseDets = req.body.updateMapPayload.phaseDets;
		var selectedPhase = req.body.updateMapPayload.selectedPhase;
		var rootCheck = req.body.rootCheck;
		var mappedDets = [];
		//get mapped details
		try {
			if(!rootCheck) {
				var userid = req.session.userid;
				var cyps  = Object.keys(phaseDets);
				for(var i=0;i<cyps.length;++i) {
					var treeid = cyps[i];
					if(Object.keys(phaseDets[treeid]).length>0) {
						if(Object.keys(phaseDets[treeid])[0]=="all") {
							var inputs = {
								"userid": userid,
								"treeid": treeid,
								"query": "zephyrdetails"
							};
							mappedDets = await utils.fetchData(inputs, "qualityCenter/getMappedDetails", "zephyrUpdateMapping");
							if (mappedDets == "fail") res.send('fail');
							// else if(mappedDets.length==0) res.send('notfound');
							for(var j=0;j<mappedDets.length;++j) {
								mappedTestIds.push(...mappedDets[j].testid);
								mappedTestNames.push(...mappedDets[j].testname);
								mappedTreeIds.push(...mappedDets[j].treeid);
								mappedParentIds.push(...mappedDets[j].parentid);
								mappedProjectIds.push(...mappedDets[j].projectid);
								mappedReleaseIds.push(...mappedDets[j].releaseid);
							}
						} else {
							var testcases = [];
							var pars = Object.keys(phaseDets[treeid]);
							for(var k=0;k<pars.length;++k) {
								testcases = phaseDets[treeid][pars[k]];
								if(testcases.length>0 && testcases[0]==="all") {
									treeidParentIdMap[pars[k]] = treeid;
								}
								var inputs = {
									"userid": userid,
									"treeid": treeid,
									"query": "zephyrdetails"
								};
								if(pars[k] != '-1') {
									inputs.parentid = pars[k];
								}
								if(testcases.length>0 && testcases[0]!="all") {
									inputs.testcaseids = testcases;
								}
								mappedDets = await utils.fetchData(inputs, "qualityCenter/getMappedDetails", "zephyrUpdateMapping");
								if (mappedDets == "fail") res.send('fail');
								// else if(mappedDets.length==0) res.send('notfound');
								if(testcases.length>0 && testcases[0]!="all") {
									for(var j=0;j<mappedDets.length;++j) {
										for(var k=0;k<mappedDets[j].testid.length;++k) {
											if(testcases.includes(mappedDets[j].testid[k])) {
												mappedTestIds.push(mappedDets[j].testid[k]);
												mappedTestNames.push(mappedDets[j].testname[k]);
												mappedTreeIds.push(mappedDets[j].treeid[k]);
												mappedParentIds.push(mappedDets[j].parentid[k]);
												mappedProjectIds.push(mappedDets[j].projectid[k]);
												mappedReleaseIds.push(mappedDets[j].releaseid[k]);
											}
										}
									}
								} else {
									for(var j=0;j<mappedDets.length;++j) {
										mappedTestIds.push(...mappedDets[j].testid);
										mappedTestNames.push(...mappedDets[j].testname);
										mappedTreeIds.push(...mappedDets[j].treeid);
										mappedParentIds.push(...mappedDets[j].parentid);
										mappedProjectIds.push(...mappedDets[j].projectid);
										mappedReleaseIds.push(...mappedDets[j].releaseid);
									}
								}
							};
						}
						
					}
				};
			} else {
				var inputs = {
					"userid": userid,
					"releaseId": releaseId,
					"query": "zephyrdetails"
				};
				mappedDets = await utils.fetchData(inputs, "qualityCenter/getMappedDetails", "zephyrUpdateMapping");
				if (mappedDets == "fail") res.send('fail');
				// else if(mappedDets.length==0) res.send('notfound');
				for(var i=0;i<mappedDets.length;++i) {
					mappedTestIds.push(...mappedDets[i].testid);
					mappedTestNames.push(...mappedDets[i].testname);
					mappedTreeIds.push(...mappedDets[i].treeid);
					mappedParentIds.push(...mappedDets[i].parentid);
					mappedProjectIds.push(...mappedDets[i].projectid);
					mappedReleaseIds.push(...mappedDets[i].releaseid);
				}
			}
		}  catch (exception) {
			logger.error("Error occurred in zephyr/zephyrUpdateMapping:", exception);
			res.send("fail");
		}
		var username = req.session.username;
		var name = undefined;
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) name = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][name];	
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		if(mySocket != undefined) {
				var zephyrDetails = {
					"treeId": selectedPhase[0],
					"parentFetchList":treeidParentIdMap,
					"updateflag": req.body.updateFlag,
					"zephyraction": req.body.zephyraction
				};
				logger.info("Sending socket request for zephyrlogin to redis");
				mySocket.emit("zephyrlogin", zephyrDetails);
				function zephyrlogin_listener(message) {
					var data = message;
					mySocket.removeListener('qcresponse',zephyrlogin_listener);
							data = data;
							for(var i=0;i<data.testcases.length;++i) {
								testIds.push(parseInt(data.testcases[i].id));
								testNames.push(data.testcases[i].name);
								testList[parseInt(data.testcases[i].id)] = data.testcases[i];
							}
							if(data.parentids != undefined && data.parentids.length!=0) {
								for(var i=0;i<data.parentids.length;++i) {
									fetchParentIds(userid, data.parentids[i].treeid, data.parentids[i].parid, function(mappedDets) {
										if (mappedDets == "fail") res.send('fail');
										// if(mappedDets.length==0) res.send('notfound');
										for(var j=0;j<mappedDets.length;++j) {
											mappedTestIds.push(...mappedDets[j].testid);
											mappedTestNames.push(...mappedDets[j].testname);
											mappedTreeIds.push(...mappedDets[j].treeid);
											mappedParentIds.push(...mappedDets[j].parentid);
											mappedProjectIds.push(...mappedDets[j].projectid);
											mappedReleaseIds.push(...mappedDets[j].releaseid);
										}
										const occurences = mappedTestNames.reduce(function (acc, curr) {
											return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
										}, {});
										const occurences2 = testNames.reduce(function (acc, curr) {
											return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
										}, {});
										saveUpdateMapping(mappedTestNames, testNames, testIds, selectedPhase, mappedTestIds, mappedTreeIds,  
											mappedParentIds, mappedProjectIds, mappedReleaseIds, testList, occurences, occurences2, finalList, function(finallist) {
											return res.send(finallist);
										});
									});
								}
							} else {
								const occurences = mappedTestNames.reduce(function (acc, curr) {
									return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
								}, {});
								const occurences2 = testNames.reduce(function (acc, curr) {
									return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
								}, {});
								saveUpdateMapping(mappedTestNames, testNames, testIds, selectedPhase, mappedTestIds, mappedTreeIds,  
									mappedParentIds, mappedProjectIds, mappedReleaseIds, testList, occurences, occurences2, finalList, function(finallist) {
									return res.send(finallist);
								});
							}
						
					
				}
				mySocket.on("qcresponse",zephyrlogin_listener);
			} else {
					flag = "unavailableLocalServer";
					logger.info("ICE Socket not Available");
					return res.send(flag);
			}
		
	} catch (exception) {
		logger.error(exception.message);
		return res.send("fail");
	}
};

function fetchParentIds(userid, treeid, parentid, cb){
	logger.info("Inside function getProjectsForUser");
	var parentIds = [];
	async.series({
		getParentIds: function (callback1) {
			var inputs = {
				"userid": userid,
				"treeid": treeid,
				"parentid": parentid,
				"query": "zephyrdetails"
			};
			inputs.host = headers.headers.host;
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling DAS Service :qualityCenter/getMappedDetails");
			client.post(epurl + "qualityCenter/getMappedDetails", args,
			function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in fetchParentIds Error Code : ERRDAS");
				} else {
					if (result.rows.length != 0) {
						parentIds = result.rows;
					}
				}
				callback1();
			});
		},
		data: function (callback1) {
			cb(parentIds);
		}
	});
}

function  saveUpdateMapping(mappedTestNames, testNames, testIds, selectedPhase, mappedTestIds, mappedTreeIds,  
	mappedParentIds, mappedProjectIds, mappedReleaseIds, testList, occurences, occurences2, finalList, cb) {
	logger.info("Inside function saveUpdateMapping");
	async.series({
		saveMappings: function (callback1) {
			async.forEachSeries([...Array(mappedTestNames.length).keys()], function (itr, callback2) {
				updateTest(mappedTestNames[itr], testNames, testIds, selectedPhase, mappedTestIds[itr], mappedTreeIds[itr],  
					mappedParentIds[itr], mappedProjectIds[itr], mappedReleaseIds[itr], testList, occurences, occurences2, function (updateList) {
					if(updateList.length != 0) {
						finalList.update.push(updateList);
					} else if(occurences[mappedTestNames[itr]] > 1 || occurences2[mappedTestNames[itr]] > 1) {
						finalList.warning.push(mappedTestNames[itr]);
					} else {
						finalList.error.push(mappedTestNames[itr]);
					}
					callback2();
				});

			}, callback1);
		},
		data: function (callback1) {
			cb(finalList);
		}
	});
}

function updateTest(mappedTest, testNames, testIds, selectedPhase, mappedTestIds, mappedTreeIds,  
	mappedParentIds, mappedProjectId, mappedReleaseId, testList, occurences, occurences2,  cb) {
	var updateList = [];
	async.series({
		update: function(callback1) {
			if(occurences[mappedTest] == 1 && testNames.includes(mappedTest) && occurences2[testNames[testNames.indexOf(mappedTest)]] == 1) {
				var index = testNames.indexOf(mappedTest);
				var newMap = testList[testIds[index]];
				const inputs = {
					'projectid': parseInt(selectedPhase[1]),			
					'releaseid': parseInt(selectedPhase[2]),
					'treeid': String(newMap.cyclePhaseId),
					'testid': String(newMap.id),
					'parentid': newMap.parentId,
					'testname': newMap.name,
					'reqdetails': newMap.reqdetails,
					'oldtestid': mappedTestIds,
					'oldtreeid': mappedTreeIds,
					'oldparentid': mappedParentIds,
					'oldtestname': mappedTest,
					'oldprojectid':mappedProjectId,
					'oldreleaseid':mappedReleaseId,
					"query": "saveZephyrDetails_ICE"
				};
				inputs.host = headers.headers.host;
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling DAS Service :qualityCenter/saveIntegrationDetails_ICE");
				client.post(epurl + "qualityCenter/saveIntegrationDetails_ICE", args,
				function (result, response) {
					if (response.statusCode != 200 || result == "fail") {
						logger.error("Error occurred in zephyrUpdateMapping Error Code : ERRDAS");
					}
					updateList.push(mappedTest);
					callback1();
				});
			} else {
				callback1();
			}
		},
		data: function (callback1) {
			cb(updateList);
		}
	});
}

exports.zephyrCyclePhase_ICE = function (req, res) {
	logger.info("Inside UI service: zephyrCyclePhase_ICE");
	var projectDetailList = {
		"avoassure_projects": '',
		"project_dets": ""
	};
	try {
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username = req.session.username;
		var name = undefined
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) name = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][name];
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		if(mySocket != undefined) {
				var userid = req.session.userid;
				var zephyrDetails = {
					"releaseId": req.body.releaseId,
					"zephyraction": req.body.zephyraction
				};
				getProjectsForUser(userid, function (projectdata) {
					logger.info("Sending socket request for zephyrlogin to redis");
					mySocket.emit("zephyrlogin", zephyrDetails);
					function zephyrlogin_listener(message) {
						var data = message;
						mySocket.removeListener('qcresponse',zephyrlogin_listener);
							if (data == "fail")
								res.send("fail");
							else {
								dataVal = data;
								try {
									projectDetailList.avoassure_projects = projectdata;
									projectDetailList.project_dets = dataVal;
									res.send(projectDetailList);
								} catch (ex) {
									logger.error(ex);
									res.send("fail");
								}
							}
					}
					mySocket.on("qcresponse",zephyrlogin_listener);
				});
			} else {
					flag = "unavailableLocalServer";
					logger.info("ICE Socket not Available");
					res.send(flag);
			}
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.zephyrMappedCyclePhase = async (req, res) => {
	logger.info("Inside UI service: zephyrMappedCyclePhase");
	var projectDetailList = {
		"project_dets": ""
	};
	var mappedDets = [];
	var mappedPhases = new Set();
	try {
		//fetch all mapped cycles
		try {
			var userid = req.session.userid;
			var inputs = {
				"userid": userid,
				"releaseId": parseInt(req.body.releaseId),
				"query": "zephyrdetails"
			};
			mappedDets = await utils.fetchData(inputs, "qualityCenter/getMappedDetails", "zephyrMappedCyclePhase");
			if (mappedDets == "fail") res.send('fail');
			for(var i=0;i<mappedDets.length;++i) {
				mappedPhases.add(parseInt(mappedDets[i].treeid));
			}
		} catch (exception) {
			logger.error("Error occurred in zephyr/"+zephyrMappedCyclePhase+":", exception);
			res.send("fail");
		}
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username = req.session.username;
		var name = undefined
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) name = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][name];
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		if(mySocket != undefined) {
				var userid = req.session.userid;
				var zephyrDetails = {
					"releaseId": req.body.releaseId,
					"mappedPhases": [...mappedPhases],
					"zephyraction": req.body.zephyraction
				};
				getProjectsForUser(userid, function (projectdata) {
					logger.info("Sending socket request for zephyrlogin to redis");
					mySocket.emit("zephyrlogin", zephyrDetails);
					function zephyrlogin_listener(message) {
						var data = message;
						mySocket.removeListener('qcresponse',zephyrlogin_listener);
						if (data == "fail")
							res.send("fail");
						else {
							dataVal = data;
							try {
								projectDetailList.project_dets = dataVal;
								res.send(projectDetailList);
							} catch (ex) {
								logger.error(ex);
								res.send("fail");
							}
						}
						}
					mySocket.on("qcresponse",zephyrlogin_listener);
				});
			} else {
					flag = "unavailableLocalServer";
					logger.info("ICE Socket not Available");
					res.send(flag);
			}
		
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

function getProjectsForUser(userid, cb) {
	logger.info("Inside function getProjectsForUser");
	var projectDetailsList = [];
	var projectidlist = [];
	async.series({
		getprojectDetails: function (callback1) {
			var getprojects = "select projectids from icepermissions where userid=" + userid;
			var inputs = {
				"userid": userid,
				"query": "getprojectDetails"
			};
			inputs.host = headers.headers.host;
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling DAS Service from getProjectsForUser: qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (projectrows, response) {
				if (response.statusCode != 200 || projectrows.rows == "fail") {
					logger.error("Error occurred in qualityCenter/qcProjectDetails_ICE from getprojectDetails Error Code : ERRDAS");
				} else {
					if (projectrows.rows.length != 0) {
						projectidlist = projectrows.rows[0].projects;
					}
				}
				callback1();
			});
		},
		scenarioDetails: function (callback1) {
			async.forEachSeries(projectidlist, function (itr, callback2) {
				projectandscenario(itr, function (err, projectDetails) {
					projectDetailsList.push(projectDetails);
					callback2();
				});

			}, callback1);
		},
		data: function (callback1) {
			cb(projectDetailsList);
		}
	});
}

function projectandscenario(projectid, cb) {
		logger.info("Inside function projectandscenario");
	var scenarios_list;
	var projectDetails = {
		"project_id": '',
		"project_name": '',
		"scenario_details": ''
	};
	var projectname = '';
	async.series({
		projectname1: function (callback1) {
			var inputs = {
				"projectid": projectid,
				"query": "projectname1"
			};
			inputs.host = headers.headers.host;
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
				logger.info("Calling DAS Service : qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (projectdata, response) {
				if (response.statusCode != 200 || projectdata.rows == "fail") {
					
					logger.error("Error occurred in getProjectsForUser from projectname1 Error Code : ERRDAS");
				} else {
					if (projectdata.rows.length != 0) {
						projectname = projectdata.rows[0].name;
					}
				}
				callback1();
			});
		},
		scenariodata: function (callback1) {
			var inputs = {
				"projectid": projectid,
				"query": "scenariodata"
			};
			inputs.host = headers.headers.host;
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
				logger.info("Calling DAS Service :qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (scenariorows, response) {
				if (response.statusCode != 200 || scenariorows.rows == "fail") {
					logger.error("Error occurred in getProjectsForUser from scenariodata Error Code : ERRDAS");
				} else {
					if (scenariorows.rows.length != 0) {
						scenarios_list = JSON.parse(JSON.stringify(scenariorows.rows));
						projectDetails.project_id = projectid;
						projectDetails.scenario_details = scenarios_list;
						projectDetails.project_name = projectname;
					} else {
						projectDetails.project_id = projectid;
						projectDetails.project_name = projectname;
					}
				}
				callback1();
			});
		}
	}, function (err, data) {
		cb(null, projectDetails);
	});
}

exports.saveZephyrDetails_ICE = async (req, res) => {
	const fnName = "saveZephyrDetails_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		var mappedDetails = req.body.mappedDetails;
		var flag = mappedDetails.length > 0;
		if (!flag) return res.send('fail');
		for (let i=0; i<mappedDetails.length; i++) {
			let itr = mappedDetails[i];
			const inputs = {
				"testscenarioid": itr.scenarioId,
				'projectid': itr.projectid,			
				'releaseid': itr.releaseid,
				'treeid': itr.treeid,
				'parentid': itr.parentid,
				'testid': itr.testid,
				'testname': itr.testname,
				'reqdetails': itr.reqdetails,
				"query": "saveZephyrDetails_ICE"
			};
			const result = await utils.fetchData(inputs, "qualityCenter/saveIntegrationDetails_ICE", fnName);
			if (result == "fail") flag = false;
		}
		if (!flag) return res.send('fail');
		res.send("success");
	} catch (exception) {
		logger.error("Error occurred in zephyr/"+fnName+":", exception);
		res.send("fail");
	}
};

exports.viewZephyrMappedList_ICE = async (req, res) => {
	const fnName = "viewZephyrMappedList_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		var userid = req.session.userid;
		var inputs = {
			"userid": userid,
			"query": "zephyrdetails"
		};
		const result = await utils.fetchData(inputs, "qualityCenter/viewIntegrationMappedList_ICE", fnName);
		if (result == "fail") res.send('fail');
		else res.send(result);
	} catch (exception) {
		logger.error("Error occurred in zephyr/"+fnName+":", exception);
		res.send("fail");
	}
};

exports.manualTestcaseDetails_ICE = function(req,res){
    logger.info("Inside UI service: manualTestcaseDetails_ICE");
    getProjectsAndModules(req.session.userid,function(data){
        res.send(data);
    });
};

function getProjectsAndModules(userid,cb){
		logger.info("Inside function getProjectsAndModules");
    var projectDetailsList1 = [];
    var projectidlist = [];
    var scenarioDetailsList ;
    async.series({
        getprojectDetails:function(callback){
            var inputs = {"userid":userid,"query":"getprojectDetails"};
			inputs.host = headers.headers.host;
            var args = {
                data:inputs,
                headers:{"Content-Type" : "application/json"}                
            };
				logger.info("Calling DAS Service from getProjectsAndModules: qualityCenter/qcProjectDetails_ICE");
            client.post(epurl+"qualityCenter/qcProjectDetails_ICE",args,
                function (projectrows, response) {
                    if (response.statusCode != 200 || projectrows.rows == "fail") {
                  					logger.error("Error occurred in qualityCenter/qcProjectDetails_ICE from getProjectsAndModules Error Code : ERRDAS");

                }else{
                    if(projectrows.rows.length!=0){
                        projectidlist = projectrows.rows[0].projectids;
                    }
                }
                 callback();
            }); 
        },
        moduleDetails:function(callback){
				logger.info("Inside function moduleDetails");
            async.forEachSeries(projectidlist,function(itr,datacallback){
                projectandmodule(itr,function(data){
                    projectDetailsList1.push(data);
                    datacallback();
                });
            },callback);
        }
    },function(err,data){
        cb(projectDetailsList1);
    });
}


function projectandmodule(projectid,cb,data){
		logger.info("Inside function projectandmodule");
    var projectDetails = {"project_id":'',"project_name":'',"module_details":[]};
    var projectname = '';
    var modulelist = [];
    async.series({
        projectname1 : function(callback1){
            var inputs = {"projectid":projectid,"query":"projectname1"};
			inputs.host = headers.headers.host;
            var args = {
                data:inputs,
                headers:{"Content-Type" : "application/json"}
                
            };
				logger.info("Calling DAS Service from projectname1: qualityCenter/qcProjectDetails_ICE");
            client.post(epurl+"qualityCenter/qcProjectDetails_ICE",args,
                function (projectdata, response) {
                    if (response.statusCode != 200 || projectdata.rows == "fail") {
					logger.error("Error occurred in qualityCenter/qcProjectDetails_ICE from projectname1 Error Code : ERRDAS");
                    }else{
                        if(projectdata.rows.length!=0){
                            projectname = projectdata.rows[0].projectname;
                        }
                    }
                    callback1();
            });
        },
    },function(err,data){
        projectDetails.module_details = modulelist;
        cb(projectDetails);
    });
}

exports.excelToZephyrMappings= function(req,res){
	const fnName = "excelToZephyrMappings";
	logger.info("Inside UI service: " + fnName);
	try {
		var wb1 = xlsx.read(req.body.data.content, { type: 'binary' });
		if (req.body.data.flag == 'sheetname') {
			return res.status(200).send(wb1.SheetNames);
		}
		var myCSV = xlsToCSV(wb1, req.body.data.sheetname);
		var numSheets = myCSV.length / 2;
		var mappings = [];
		var errorRows=[];
		var err;
		if (numSheets == 0) {
			return res.status(200).send("emptySheet");
		}
		for (var k = 0; k < numSheets; k++) {
			var cSheet = myCSV[k * 2 + 1];
			var cSheetRow = cSheet.split('\n');
			if(cSheetRow[0].split(',').length>2|| cSheetRow[0].split(',').length<2){
				return res.status(200).send("emptySheet");
			}
			var scenarioIdx = -1, testCaseIdx=-1;
			cSheetRow[0].split(',').forEach(function (e, i) {
				if(i== 0 && e.toLowerCase()=="testcaseid") testCaseIdx = i;
				if(i== 1 && e.toLowerCase()=="scenario") scenarioIdx = i;
			});
			if (testCaseIdx == -1 || scenarioIdx == -1 || cSheetRow.length < 2) {
				err = true;
				break;
			}
			
			for (var i = 1; i < cSheetRow.length; i++) {
				var row = cSheetRow[i].split(',');
				if(i==(cSheetRow.length-1) && row.length<2 && row[0]==""){
					continue;
				}
				if (row[0]=="" || row[1]=="") {
					errorRows.push(i+1)
					continue;
				}
				if (row.length < 2 || row.length>2){
					errorRows.push(i+1)	
					continue;
				}
				var testCaseList = row[testCaseIdx].split(';')
				var scenarioList = row[scenarioIdx].split(';')
				if(testCaseList.length>1 && scenarioList.length>1){
					errorRows.push(i+1)	
					continue;
				}
				mappings.push({row: i+1,testCaseIds:[],scenarios:[]})
				testCaseList.forEach(testCaseId => {
					mappings[mappings.length-1].testCaseIds.push(testCaseId);
				});
				scenarioList.forEach(scenarioName => {
					mappings[mappings.length-1].scenarios.push(scenarioName);
				});
			}
		}
		if (err) res.status(200).send('fail');
		else res.status(200).send({"mappings" : mappings , "errorRows": errorRows});
	} catch(exception) {
		logger.error("Error occurred in zephyr/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
}