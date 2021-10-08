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
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');

exports.loginToZephyr_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: loginToZephyr_ICE");
		var username = req.session.username;
		var name = undefined;
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) name = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		logger.debug("ICE Socket requesting Address: %s" , name);
		const reqData = req.body;
		var check_zephyrURL = !validator.isEmpty(reqData.zephyrURL);
		var check_zephyrUserName = !validator.isEmpty(reqData.zephyrUserName);
		var check_zephyrPassword = !validator.isEmpty(reqData.zephyrPassword);
		if(!check_zephyrURL) {
			logger.info("Error occurred in loginToZephyr_ICE: Invalid Zephyr URL");
			return res.send("invalidurl");
		}
		if(check_zephyrURL && check_zephyrUserName &&  check_zephyrPassword) {
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]>0) {
					var zephyrURL = reqData.zephyrURL;
					var zephyrUserName = reqData.zephyrUserName;
					var zephyrPassword = reqData.zephyrPassword;
					var integrationType = reqData.integrationType;
					var zephyraction = reqData.zephyraction;
					var zephyrDetails = {
						"zephyrURL": zephyrURL,
						"zephyrUserName": zephyrUserName,
						"zephyrPassword": zephyrPassword,
						"integrationType" : integrationType,
						"zephyraction": zephyraction
					};
					logger.info("Sending socket request for zephyrlogin to redis");
					dataToIce = {"emitAction" : "zephyrlogin","username" : name, "responsedata":zephyrDetails};
					redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					function zephyrlogin_listener(channel,message) {
						var data = JSON.parse(message);
						if(name == data.username && ["unavailableLocalServer", "qcresponse"].includes(data.onAction)){
							redisServer.redisSubServer.removeListener('message',zephyrlogin_listener);
							if (data.onAction == "unavailableLocalServer") {
								logger.error("Error occurred in loginZephyrServer_ICE: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}
							} else if (data.onAction == "qcresponse") {
								data = data.value;
								res.send(data);
							}
						}
					}
					redisServer.redisSubServer.on("message",zephyrlogin_listener);
				} else {
					utils.getChannelNum('ICE1_scheduling_' + name, function(found){
						var flag="";
						if (found) flag = "scheduleModeOn";
						else {
							flag = "unavailableLocalServer";
							logger.info("ICE Socket not Available");
						}
						res.send(flag);
					});
				}
			});
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
		var username = req.session.username;
		var name= undefined
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) name = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
			if (redisres[1]>0) {
				var zephyrDetails = {
					"projectId": req.body.projectId,
					"zephyraction": req.body.zephyraction
				};
				logger.info("Sending socket request for zephyrlogin to redis");
				dataToIce = {"emitAction" : "zephyrlogin","username" : name, "responsedata":zephyrDetails};
				redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
				function zephyrlogin_listener(channel,message) {
					var data = JSON.parse(message);
					if(name == data.username && ["unavailableLocalServer", "qcresponse"].includes(data.onAction)){
						redisServer.redisSubServer.removeListener('message',zephyrlogin_listener);
						if (data.onAction == "unavailableLocalServer") {
							logger.error("Error occurred in loginZephyrServer_ICE: Socket Disconnected");
							if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
								var soc = myserver.socketMapNotify[name];
								soc.emit("ICEnotAvailable");
							}
						} else if (data.onAction == "qcresponse") {
							data = data.value;
							res.send(data);
						}
					}
				}
				redisServer.redisSubServer.on("message",zephyrlogin_listener);
			} else {
				utils.getChannelNum('ICE1_scheduling_' + name, function(found){
					var flag="";
					if (found) flag = "scheduleModeOn";
					else {
						flag = "unavailableLocalServer";
						logger.info("ICE Socket not Available");
					}
					res.send(flag);
				});
			}
		});
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.zephyrTestcaseDetails_ICE = function (req, res) {
	logger.info("Inside UI service: zephyrTestcaseDetails_ICE");
	try {
		var username = req.session.username;
		var name = undefined;
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) name = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
			if (redisres[1]>0) {
				var zephyrDetails = {
					"treeId": req.body.treeId,
					"zephyraction": req.body.zephyraction
				};
				logger.info("Sending socket request for zephyrlogin to redis");
				dataToIce = {"emitAction" : "zephyrlogin","username" : name, "responsedata":zephyrDetails};
				redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
				function zephyrlogin_listener(channel,message) {
					var data = JSON.parse(message);
					if(name == data.username && ["unavailableLocalServer", "qcresponse"].includes(data.onAction)){
						redisServer.redisSubServer.removeListener('message',zephyrlogin_listener);
						if (data.onAction == "unavailableLocalServer") {
							logger.error("Error occurred in zephyrTestcaseDetails_ICE: Socket Disconnected");
							if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
								var soc = myserver.socketMapNotify[name];
								soc.emit("ICEnotAvailable");
							}
						} else if (data.onAction == "qcresponse") {
							data = data.value;
							res.send(data);
						}
					}
				}
				redisServer.redisSubServer.on("message",zephyrlogin_listener);
			} else {
				utils.getChannelNum('ICE1_scheduling_' + name, function(found){
					var flag="";
					if (found) flag = "scheduleModeOn";
					else {
						flag = "unavailableLocalServer";
						logger.info("ICE Socket not Available");
					}
					res.send(flag);
				});
			}
		});
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
				mappedTests.push(parseInt(mappedDets[i].testid));
			}
		} catch (exception) {
			logger.error("Error occurred in zephyr/"+zephyrMappedCyclePhase+":", exception);
			res.send("fail");
		}
		var username = req.session.username;
		var name = undefined;
	
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) name = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
			if (redisres[1]>0) {
				var zephyrDetails = {
					"treeId": req.body.treeId,
					"mappedTests": mappedTests,
					"zephyraction": req.body.zephyraction
				};
				logger.info("Sending socket request for zephyrlogin to redis");
				dataToIce = {"emitAction" : "zephyrlogin","username" : name, "responsedata":zephyrDetails};
				redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
				function zephyrlogin_listener(channel,message) {
					var data = JSON.parse(message);
					if(name == data.username && ["unavailableLocalServer", "qcresponse"].includes(data.onAction)){
						redisServer.redisSubServer.removeListener('message',zephyrlogin_listener);
						if (data.onAction == "unavailableLocalServer") {
							logger.error("Error occurred in zephyrTestcaseDetails_ICE: Socket Disconnected");
							if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
								var soc = myserver.socketMapNotify[name];
								soc.emit("ICEnotAvailable");
							}
						} else if (data.onAction == "qcresponse") {
							data = data.value;
							res.send(data);
						}
					}
				}
				redisServer.redisSubServer.on("message",zephyrlogin_listener);
			} else {
				utils.getChannelNum('ICE1_scheduling_' + name, function(found){
					var flag="";
					if (found) flag = "scheduleModeOn";
					else {
						flag = "unavailableLocalServer";
						logger.info("ICE Socket not Available");
					}
					res.send(flag);
				});
			}
		});
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.zephyrUpdateMapping = async (req, res) => {
	logger.info("Inside UI service: zephyrUpdateMapping");
	var mappedTestIds = [];
	var mappedTestNames = [];
	var mappedList = {};
	var testIds = [];
	var testNames = [];
	var testList = {};
	var errorList = [];
	var warningList = [];
	var updateList = [];
	try {
		var projectId = parseInt(req.body.updateMapPayload.projectId);
		var releaseId = parseInt(req.body.updateMapPayload.releaseId);
		var phaseDets = req.body.updateMapPayload.phaseDets;
		var selectedPhase = req.body.updateMapPayload.selectedPhase;
		var rootCheck = req.body.rootCheck;
		var mappedDets = [];
		//get mapped details
		try {
			if(!rootCheck) {
				var userid = req.session.userid;
				for(var i=0;i<Object.keys(phaseDets).length;++i) {
					if(phaseDets[Object.keys(phaseDets)[i]].length>0) {
						if(phaseDets[Object.keys(phaseDets)[i]][0] == "all") {
							var inputs = {
								"userid": userid,
								"treeid": Object.keys(phaseDets)[i],
								"query": "zephyrdetails"
							};
						} else {
							var inputs = {
								"userid": userid,
								"treeid": Object.keys(phaseDets)[i],
								"testcaseids": phaseDets[Object.keys(phaseDets)[i]],
								"query": "zephyrdetails"
							};
						}
						mappedDets = await utils.fetchData(inputs, "qualityCenter/getMappedDetails", "zephyrUpdateMapping");
						if (mappedDets == "fail") res.send('fail');
						for(var j=0;j<mappedDets.length;++j) {
							mappedTestIds.push(parseInt(mappedDets[j].testid));
							mappedTestNames.push(mappedDets[j].testname);
							mappedList[parseInt(mappedDets[j].testid)] = mappedDets[j];
						}
					}
				}
			} else {
				var inputs = {
					"userid": userid,
					"releaseId": releaseId,
					"query": "zephyrdetails"
				};
				mappedDets = await utils.fetchData(inputs, "qualityCenter/getMappedDetails", "zephyrUpdateMapping");
				if (mappedDets == "fail") res.send('fail');
				for(var i=0;i<mappedDets.length;++i) {
					mappedTestIds.push(parseInt(mappedDets[i].testid));
					mappedTestNames.push(mappedDets[i].testname);
					mappedList[parseInt(mappedDets[i].testid)] = mappedDets[i];
				}
			}
		}  catch (exception) {
			logger.error("Error occurred in zephyr/zephyrUpdateMapping:", exception);
			res.send("fail");
		}
		var username = req.session.username;
		var name = undefined;
	
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) name = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
			if (redisres[1]>0) {
				var zephyrDetails = {
					"treeId": selectedPhase[0],
					"zephyraction": req.body.zephyraction
				};
				logger.info("Sending socket request for zephyrlogin to redis");
				dataToIce = {"emitAction" : "zephyrlogin","username" : name, "responsedata":zephyrDetails};
				redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
				function zephyrlogin_listener(channel,message) {
					var data = JSON.parse(message);
					if(name == data.username && ["unavailableLocalServer", "qcresponse"].includes(data.onAction)){
						redisServer.redisSubServer.removeListener('message',zephyrlogin_listener);
						if (data.onAction == "unavailableLocalServer") {
							logger.error("Error occurred in zephyrTestcaseDetails_ICE: Socket Disconnected");
							if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
								var soc = myserver.socketMapNotify[name];
								soc.emit("ICEnotAvailable");
							}
						} else if (data.onAction == "qcresponse") {
							data = data.value;
							for(var i=0;i<data.length;++i) {
								testIds.push(parseInt(data[i].id));
								testNames.push(data[i].name);
								testList[parseInt(data[i].id)] = data[i];
							}
							const occurences = mappedTestNames.reduce(function (acc, curr) {
								return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
							}, {});
							const occurences2 = testNames.reduce(function (acc, curr) {
								return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
							}, {});
							//acc[curr] = (acc[curr] || 0) + 1
							//match testcase names
							for(var i=0;i<mappedTestNames.length;++i) {
								if(occurences[mappedTestNames[i]] == 1 && testNames.includes(mappedTestNames[i]) && occurences2[testNames[testNames.indexOf(mappedTestNames[i])]] == 1) {
									var oldMap = mappedList[mappedTestIds[i]];
									var index = testNames.indexOf(mappedTestNames[i]);
									var newMap = testList[testIds[index]];
									const inputs = {
										"testscenarioid": oldMap.testscenarioid,
										'projectid': parseInt(selectedPhase[1]),			
										'releaseid': parseInt(selectedPhase[2]),
										'treeid': String(newMap.cyclePhaseId),
										'testid': String(newMap.id),
										'testname': newMap.name,
										'reqdetails': newMap.reqdetails,
										'oldtestid': mappedTestIds[i],
										"query": "saveZephyrDetails_ICE"
									};
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
									});
									updateList.push(mappedTestNames[i]);
								} else if(occurences[mappedTestNames[i]] > 1 || occurences2[mappedTestNames[i]] > 1) {
									//Warning or error
									warningList.push(mappedTestNames[i]);
								} else {
									errorList.push(mappedTestNames[i]);
								}
							}
							var finalList = {warning:warningList,error:errorList,update:updateList}
							return res.send(finalList)
						}
					}
				}
				redisServer.redisSubServer.on("message",zephyrlogin_listener);
			} else {
				utils.getChannelNum('ICE1_scheduling_' + name, function(found){
					var flag="";
					if (found) flag = "scheduleModeOn";
					else {
						flag = "unavailableLocalServer";
						logger.info("ICE Socket not Available");
					}
					return res.send(flag);
				});
			}
		});
	} catch (exception) {
		logger.error(exception.message);
		return res.send("fail");
	}
};

exports.zephyrCyclePhase_ICE = function (req, res) {
	logger.info("Inside UI service: zephyrCyclePhase_ICE");
	var projectDetailList = {
		"avoassure_projects": '',
		"project_dets": ""
	};
	try {
		var username = req.session.username;
		var name = undefined
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) name = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
			if (redisres[1]>0) {
				var userid = req.session.userid;
				var zephyrDetails = {
					"releaseId": req.body.releaseId,
					"zephyraction": req.body.zephyraction
				};
				getProjectsForUser(userid, function (projectdata) {
					logger.info("Sending socket request for zephyrlogin to redis");
					dataToIce = {"emitAction" : "zephyrlogin","username" : name, "responsedata":zephyrDetails};
					redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					function zephyrlogin_listener(channel,message) {
						var data = JSON.parse(message);
						if(name == data.username && ["unavailableLocalServer", "qcresponse"].includes(data.onAction)){
							redisServer.redisSubServer.removeListener('message',zephyrlogin_listener);
							if (data.onAction == "unavailableLocalServer") {
								logger.error("Error occurred in zephyrCyclePhase_ICE: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}
							} else if (data.onAction == "qcresponse") {
								if (data == "fail")
									res.send("fail");
								else {
									dataVal = data.value;
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
						}
					}
					redisServer.redisSubServer.on("message",zephyrlogin_listener);
				});
			} else {
				utils.getChannelNum('ICE1_scheduling_' + name, function(found){
					var flag="";
					if (found) flag = "scheduleModeOn";
					else {
						flag = "unavailableLocalServer";
						logger.info("ICE Socket not Available");
					}
					res.send(flag);
				});
			}
		});
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

		var username = req.session.username;
		var name = undefined
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) name = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
			if (redisres[1]>0) {
				var userid = req.session.userid;
				var zephyrDetails = {
					"releaseId": req.body.releaseId,
					"mappedPhases": [...mappedPhases],
					"zephyraction": req.body.zephyraction
				};
				getProjectsForUser(userid, function (projectdata) {
					logger.info("Sending socket request for zephyrlogin to redis");
					dataToIce = {"emitAction" : "zephyrlogin","username" : name, "responsedata":zephyrDetails};
					redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					function zephyrlogin_listener(channel,message) {
						var data = JSON.parse(message);
						if(name == data.username && ["unavailableLocalServer", "qcresponse"].includes(data.onAction)){
							redisServer.redisSubServer.removeListener('message',zephyrlogin_listener);
							if (data.onAction == "unavailableLocalServer") {
								logger.error("Error occurred in zephyrMappedCyclePhase: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}
							} else if (data.onAction == "qcresponse") {
								if (data == "fail")
									res.send("fail");
								else {
									dataVal = data.value;
									try {
										projectDetailList.project_dets = dataVal;
										res.send(projectDetailList);
									} catch (ex) {
										logger.error(ex);
										res.send("fail");
									}
								}
							}
						}
					}
					redisServer.redisSubServer.on("message",zephyrlogin_listener);
				});
			} else {
				utils.getChannelNum('ICE1_scheduling_' + name, function(found){
					var flag="";
					if (found) flag = "scheduleModeOn";
					else {
						flag = "unavailableLocalServer";
						logger.info("ICE Socket not Available");
					}
					res.send(flag);
				});
			}
		});
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