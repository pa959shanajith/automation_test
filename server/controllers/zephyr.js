/**
 * Dependencies.
 */
var async = require('async');
var myserver = require('../lib/socket');
var epurl = process.env.DAS_URL;
var Client = require("node-rest-client").Client;
var client = new Client();
var sessionExtend = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
var validator = require('validator');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');

exports.loginToZephyr_ICE = function (req, res) {
	var name;
	try {
		logger.info("Inside UI service: loginToZephyr_ICE");
		if (utils.isSessionActive(req)) {
			var name = myserver.allSocketsICEUser[req.session.username];
			redisServer.redisSubServer.subscribe('ICE2_' + name);
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.debug("ICE Socket connecting IP: %s" , ip);
			logger.debug("ICE Socket requesting Address: %s" , name);

            var check_zephyrAccNo = !validator.isEmpty(req.body.zephyrAccNo);
            var check_zephyrAcKey = !validator.isEmpty(req.body.zephyrAcKey);
			var check_zephyrSecKey = !validator.isEmpty(req.body.zephyrSecKey);
			if(!check_zephyrAccNo) {
				logger.info("Error occurred in loginToZephyr_ICE: Invalid Zephyr Account ID");
				return res.send("invalidurl");
            }
			if(check_zephyrAccNo && check_zephyrAcKey &&  check_zephyrSecKey) {
				redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
					if (redisres[1]>0) {
						var zephyrAcKey = req.body.zephyrAcKey;
						var zephyrSecKey = req.body.zephyrSecKey;
						var zephyrAccNo = req.body.zephyrAccNo;
						var zephyrJiraUrl = req.body.zephyrJiraUrl;
						var zephyrJiraUserName = req.body.zephyrJiraUserName;
						var zephyrJiraAccToken = req.body.zephyrJiraAccToken;
						var integrationType = req.body.integrationType;
						var zephyraction = req.body.zephyraction;
						var execFlag = req.body.execFlag;
						var zephyrDetails = {
							"zephyrAcKey": zephyrAcKey,
							"zephyrSecKey": zephyrSecKey,
							"zephyrAccNo": zephyrAccNo,
							"zephyrJiraUrl": zephyrJiraUrl,
							"zephyrJiraUserName": zephyrJiraUserName,
							"zephyrJiraAccToken": zephyrJiraAccToken,
							"execFlag": execFlag,
							"integrationType" : integrationType,
							"zephyraction": zephyraction
						};
						logger.info("Sending socket request for zephyrlogin to redis");
						dataToIce = {"emitAction" : "zephyrlogin","username" : name, "responsedata":zephyrDetails};
						redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
						function zephyrlogin_listener(channel,message) {
							var data = JSON.parse(message);
							if(name == data.username){
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
		} else {
			logger.error("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Error occurred in loginZephyrServer_ICE:", exception.message);
		res.send("fail");
	}
};

exports.zephyrProjectDetails_ICE = function (req, res) {
	logger.info("Inside UI service: zephyrProjectDetails_ICE");
	var projectDetailList = {
		"avoassure_projects": '',
		"project_dets": ""
	};
	var name;
	try {
		if (utils.isSessionActive(req)) {
			var name = myserver.allSocketsICEUser[req.session.username];
			redisServer.redisSubServer.subscribe('ICE2_' + name);
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.debug("ICE Socket requesting Address: %s" , name);
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]>0) {
					var userid = req.body.user_id;
					var zephyrDetails = {
						"domain": req.body.domain,
						"zephyraction": req.body.zephyraction
					};
					getProjectsForUser(userid, function (projectdata) {
						logger.info("Sending socket request for zephyrlogin to redis");
						dataToIce = {"emitAction" : "zephyrlogin","username" : name, "responsedata":zephyrDetails};
						redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
						function zephyrlogin_listener(channel,message) {
							var data = JSON.parse(message);
							if(name == data.username){
								redisServer.redisSubServer.removeListener('message',zephyrlogin_listener);
								if (data.onAction == "unavailableLocalServer") {
									logger.error("Error occurred in zephyrProjectDetails_ICE: Socket Disconnected");
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
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
		utils.getChannelNum('ICE1_scheduling_' + name, function(found){
			var flag="";
			if (found) flag = "scheduleModeOn";
			else flag = "unavailableLocalServer";
			res.send(flag);
		});
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

exports.saveZephyrDetails_ICE = function (req, res) {
	logger.info("Inside UI service: saveZephyrDetails_ICE");
	var mappedDetails = req.body.mappedDetails;
	var flag = true;
	if (mappedDetails.length > 0) {
		flag = true;
	} else {
		flag = false;
	}
	async.forEachSeries(mappedDetails, function (itr, callback) {
		var testscenarioid = itr.scenarioId;

		var projectid = itr.projectid;
		var versionid = itr.versionid;
		var cycleid = itr.cycleid;
		var issueid = itr.issueid;
		var testid = itr.testid;
		var testname = itr.testname;
		var issueid = itr.issueid;
		var inputs = {
			"testscenarioid": testscenarioid,
			'projectid': projectid,			
			'cycleid': cycleid,
			'versionid': versionid,
			'testid': testid,
			'testname': testname,
			'issueid': issueid,
			"query": "saveZephyrDetails_ICE"
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
			logger.info("Calling DAS Service: qualityCenter/saveIntegrationDetails_ICE");
		client.post(epurl + "qualityCenter/saveIntegrationDetails_ICE", args,
			function (zephyrdetailsows, response) {
			if (response.statusCode != 200 || zephyrdetailsows.rows == "fail") {
					logger.error("Error occurred in saveIntegrationDetails_ICE Error Code : ERRDAS");
				flag = false;
			}
			callback();
		});
	}, function () {
		if (flag) {
			try {
				if (utils.isSessionActive(req)) {
					res.send("success");
				} else {
					logger.info("Invalid Session");
					res.send("Invalid Session");
				}
			} catch (exception) {
				logger.error(exception.message);
				utils.getChannelNum('ICE1_scheduling_' + name, function(found){
					var flag="";
					if (found) flag = "scheduleModeOn";
					else flag = "unavailableLocalServer";
					res.send(flag);
				});
			}
		} else {
			res.send("fail");
		}
	});
};

exports.viewZephyrMappedList_ICE = function (req, res) {
	logger.info("Inside UI service: viewZephyrMappedList_ICE");
	var userid = req.body.user_id;
	var name = myserver.allSocketsICEUser[req.session.username];
	getZephyrDetailsForUser(userid, function (responsedata) {
		res.send(responsedata);
	});
};

function getZephyrDetailsForUser(userid, cb) {
	logger.info("Inside function getZephyrDetailsForUser");
	var projectDetailsList = [];
	var projectidlist = [];
	async.series({
		getprojectDetails: function (callback1) {
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
			logger.info("Calling DAS Service :qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (projectrows, response) {
				if (response.statusCode != 200 || projectrows.rows == "fail") {
					logger.error("Error occurred in qualityCenter/qcProjectDetails_ICE from getZephyrDetailsForUser Error Code : ERRDAS");
				} else {
					if (projectrows.rows.length != 0) {
						projectidlist = projectrows.rows[0].projects;
					}

				}
				callback1();
			});
		},
		scenarioDetails: function (callback1) {
			logger.info("Inside function scenarioDetails");
			async.forEachSeries(projectidlist, function (itr, callback2) {
				zephyrscenariodetails(itr, function (err, projectDetails) {
					for (i = 0; i < projectDetails.length; i++) {
						projectDetailsList.push(projectDetails[i]);
					}
					callback2();
				});
			}, callback1);
		},
		data: function (callback1) {
			cb(projectDetailsList);
		}
	});
}

function zephyrscenariodetails(projectid, cb) {
	logger.info("Inside function zephyrscenariodetails");
	var scenarios_list;
	var projectDetails = {
		"project_id": '',
		"project_name": '',
		"scenario_details": ''
	};
	var projectname = '';
	var zephyrdetailsList = [];
	async.series({
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
			logger.info("Calling DAS Service from zephyrscenariodetails: qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (scenariorows, response) {
				if (response.statusCode != 200 || scenariorows.rows == "fail") {
					logger.error("Error occurred in qualityCenter/qcProjectDetails_ICE from zephyrscenariodetails Error Code : ERRDAS");
				} else {
					if (scenariorows.rows.length != 0) {
						scenarios_list = JSON.parse(JSON.stringify(scenariorows.rows));
					}
				}
				callback1();
			});
		},
		zephyrdetails: function (callback1) {
			logger.info("Inside function zephyrdetails");
			async.forEachSeries(scenarios_list, function (itr, callback2) {
				var inputs = {
					"testscenarioid": itr._id,
					"query": "zephyrdetails"
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling DAS Service from zephyrdetails: qualityCenter/viewIntegrationMappedList_ICE");
				client.post(epurl + "qualityCenter/viewIntegrationMappedList_ICE", args,
					function (zephyrdetailsows, response) {
					if (response.statusCode != 200 || zephyrdetailsows.rows == "fail") {
						logger.error("Error occurred inqualityCenter/viewIntegrationMappedList_ICE from zephyrdetails Error Code : ERRDAS");
					} else {
						if (zephyrdetailsows.rows.length != 0) {
							zephyrdetails = JSON.parse(JSON.stringify(zephyrdetailsows.rows[0]));
							zephyrdetails.testscenarioname = itr.name;
							zephyrdetailsList.push(zephyrdetails);
						}
					}
					callback2();
				});
			}, callback1);
		},
		data: function (callback1) {
			cb(null, zephyrdetailsList);
		}
	}, function (err, data) {
		cb(null, zephyrdetailsList);
	});
}


exports.manualTestcaseDetails_ICE = function(req,res){
    logger.info("Inside UI service: manualTestcaseDetails_ICE");
    getProjectsAndModules(req.body.user_id,function(data){
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

