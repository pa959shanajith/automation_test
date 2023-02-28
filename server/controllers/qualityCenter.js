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

let headers
module.exports.setReq = async (req) =>
{
	headers=req;
}

exports.loginQCServer_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: loginQCServer_ICE");
		var username = req.session.username;
		var name = undefined
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) name = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		logger.debug("ICE Socket requesting Address: %s" , name);
		var check_qcUrl = !validator.isEmpty(req.body.qcURL);
		var check_qcUsername = !validator.isEmpty(req.body.qcUsername);
		var check_qcPassword = !validator.isEmpty(req.body.qcPassword);
		if(!check_qcUrl) {
			logger.info("Error occurred in loginQCServer_ICE: Invalid QC Url");
			return res.send("invalidurl");
		}
		if(check_qcUrl && check_qcUsername &&  check_qcPassword) {
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]>0) {
					var username = req.body.qcUsername;
					var password = req.body.qcPassword;
					var url = req.body.qcURL;
					var qcaction = req.body.qcaction;
					var qcDetails = {
						"qcUsername": username,
						"qcPassword": password,
						"qcURL": url,
						"qcaction": qcaction
					};
					logger.info("Sending socket request for qclogin to cachedb");
					dataToIce = {"emitAction" : "qclogin","username" : name, "responsedata":qcDetails};
					redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					function qclogin_listener(channel,message) {
						var data = JSON.parse(message);
						if(name == data.username && ["unavailableLocalServer", "qcresponse"].includes(data.onAction)){
							redisServer.redisSubServer.removeListener('message',qclogin_listener);
							if (data.onAction == "unavailableLocalServer") {
								logger.error("Error occurred in loginQCServer_ICE: Socket Disconnected");
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
					redisServer.redisSubServer.on("message",qclogin_listener);
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
			logger.info("Error occurred in loginQCServer_ICE: Invalid QC Credentials");
			res.send("invalidcredentials");
		}
	} catch (exception) {
		logger.error("Error occurred in loginQCServer_ICE:", exception.message);
		res.send("fail");
	}
};

exports.qcProjectDetails_ICE = function (req, res) {
	logger.info("Inside UI service: qcProjectDetails_ICE");
	var projectDetailList = {
		"avoassure_projects": '',
		"qc_projects": ""
	};
	try {
		var username = req.session.username;
		var name= undefined
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) name = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
			if (redisres[1]>0) {
				var userid = req.session.userid;
				var qcDetails = {
					"domain": req.body.domain,
					"qcaction": req.body.qcaction
				};
				getProjectsForUser(userid, function (projectdata) {
					// var qcDetails = {"qcUsername":username,"qcPassword":password,"qcURL":url};
					logger.info("Sending socket request for qclogin to cachedb");
					dataToIce = {"emitAction" : "qclogin","username" : name, "responsedata":qcDetails};
					redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					function qclogin_listener(channel,message) {
						var data = JSON.parse(message);
						if(name == data.username && ["unavailableLocalServer", "qcresponse"].includes(data.onAction)){
							redisServer.redisSubServer.removeListener('message',qclogin_listener);
							if (data.onAction == "unavailableLocalServer") {
								logger.error("Error occurred in qcProjectDetails_ICE: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}
							} else if (data.onAction == "qcresponse") {
								if (data == "fail")
									res.send("fail");
								else {
									data = data.value;
									try {
										projectDetailList.avoassure_projects = projectdata;
										projectDetailList.qc_projects = data.project;
										res.send(projectDetailList);
									} catch (ex) {
										logger.error(ex);
										res.send("fail");
									}
								}
							}
						}
					}
					redisServer.redisSubServer.on("message",qclogin_listener);
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
		res.send('fail');
	}
};

function getProjectsForUser(userid, cb) {
	logger.info("Inside function getProjectsForUser");
	var projectDetailsList = [];
	var projectidlist = [];
	async.series({
		getprojectDetails: function (callback1) {
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
						//flagtocheckifexists = true;
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

exports.qcFolderDetails_ICE = function (req, res) {
	logger.info("Inside UI service: qcFolderDetails_ICE");
	try {
		var qcDetails = req.body;
		var username=req.session.username;
		var icename = undefined
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + icename);
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , icename);
		redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + icename,function(err,redisres){
			if (redisres[1]>0) {
				logger.info("Sending socket request for qclogin to cachedb");
				dataToIce = {"emitAction" : "qclogin","username" : icename, "responsedata":qcDetails};
				redisServer.redisPubICE.publish('ICE1_normal_' + icename,JSON.stringify(dataToIce));
				function qclogin_listener(channel,message) {
					var data = JSON.parse(message);
					if(icename == data.username && ["unavailableLocalServer", "qcresponse"].includes(data.onAction)){
						redisServer.redisSubServer.removeListener('message',qclogin_listener);
						if (data.onAction == "unavailableLocalServer") {
							logger.error("Error occurred in qcFolderDetails_ICE: Socket Disconnected");
							if('socketMapNotify' in myserver &&  username in myserver.socketMapNotify){
								var soc = myserver.socketMapNotify[username];
								soc.emit("ICEnotAvailable");
							}
						} else if (data.onAction == "qcresponse") {
							data = data.value;
							res.send(data);
						}
					}
				}
				redisServer.redisSubServer.on("message",qclogin_listener);
			} else {
				try {
					utils.getChannelNum('ICE1_scheduling_' + icename, function(found){
						var flag="";
						if (found) flag = "scheduleModeOn";
						else {
							flag = "unavailableLocalServer";
							logger.info("ICE Socket not Available");
						}
						res.send(flag);
					});
				} catch (exception) {
					logger.error(exception.message);
				}
			}
		});
	} catch (exception) {
		logger.error(exception.message);
		res.send('fail');
	}
};

exports.saveQcDetails_ICE = async (req, res) => {
	const fnName = "saveQcDetails_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		var mappedDetails = req.body.mappedDetails;
		var flag = mappedDetails.length > 0;
		if (!flag) return res.send('fail');
		for (let i=0; i<mappedDetails.length; i++) {
			let itr = mappedDetails[i];
			const inputs = {
				"testscenarioid": itr.scenarioId,
				"qcdomain": itr.domain,
				"qcfolderpath": itr.folderpath,
				"qcproject": itr.project,
				"qctestcase": itr.testcase,
				"qctestset": itr.testset,
				"qcfolderid": itr.folderid,
				"query": "saveQcDetails_ICE"
			};
			const result = await utils.fetchData(inputs, "qualityCenter/saveIntegrationDetails_ICE", fnName);
			if (result == "fail") flag = false;
		}
		if (!flag) return res.send('fail');
		res.send("success");
	} catch (exception) {
		logger.error("Error occurred in qualitycenter/"+fnName+":", exception);
		res.send("fail");
	}
};

exports.saveUnsyncDetails = async (req, res) => {
	const fnName = "saveUnsyncDetails";
	try {
		logger.info("Inside UI service: " + fnName);
		const screenType = req.body.screenType;
		const undoMapList = req.body.undoMapList;
		if (undoMapList.length == 0) return res.send("fail");
		const inputs = {
			"mapList": undoMapList,
			"screenType": screenType,
			"query": "updateMapDetails_ICE"
		};
		const result = await utils.fetchData(inputs, "qualityCenter/updateMapDetails_ICE", fnName);
		if (result == "fail") return res.send("fail");
		else return res.send("success");
	} catch (e) {
		logger.error("Error in %s service. Error: %s", fnName, ex)
		res.send("fail");
	}
};

exports.viewQcMappedList_ICE = function (req, res) {
	logger.info("Inside UI service: viewQcMappedList_ICE");
	var userid = req.session.userid;
	getQcDetailsForUser(userid, function (responsedata) {
		res.send(responsedata);
	});
};

function getQcDetailsForUser(userid, cb) {
	logger.info("Inside function getQcDetailsForUser");
	var projectDetailsList = [];
	var projectidlist = [];
	var qcDetailsList = [];
	async.series({
		getprojectDetails: function (callback1) {
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
			logger.info("Calling DAS Service :qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (projectrows, response) {
				if (response.statusCode != 200 || projectrows.rows == "fail") {
				logger.error("Error occurred in qualityCenter/qcProjectDetails_ICE from getQcDetailsForUser Error Code : ERRDAS");
				} else {
					if (projectrows.rows.length != 0) {
						//flagtocheckifexists = true;
						projectidlist = projectrows.rows[0].projects;
					}

				}
				callback1();
			});
		},
		scenarioDetails: function (callback1) {
			logger.info("Inside function scenarioDetails");
			async.forEachSeries(projectidlist, function (itr, callback2) {
				qcscenariodetails(itr, function (err, projectDetails) {
					for (i = 0; i < projectDetails.length; i++) {
						projectDetailsList = projectDetailsList.concat(projectDetails[i]);
					}
					callback2();
				});
			}, callback1);
		},
		qcdetails: function (callback1) {
			logger.info("Inside function qcdetails");
			var inputs = {
				"query": "qcdetails"
			};
			inputs.host = headers.headers.host;
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling DAS Service from qcdetails: qualityCenter/viewIntegrationMappedList_ICE");
			client.post(epurl + "qualityCenter/viewIntegrationMappedList_ICE", args,
				function (qcdetailsows, response) {
				if (response.statusCode != 200 || qcdetailsows.rows == "fail") {
					logger.error("Error occurred in qualityCenter/viewIntegrationMappedList_ICE from qcdetails Error Code : ERRDAS");
				} else {
					if (qcdetailsows.rows.length != 0) {
						for(var i=0;i<qcdetailsows.rows.length;i++){
							qcdetails = JSON.parse(JSON.stringify(qcdetailsows.rows[i]));
							qcdetails.testscenarioname = [];
							var testscenarios = qcdetails.testscenarioid;
							if(Array.isArray(testscenarios)) {
								for(var j=0;j<testscenarios.length;++j){
									flag = false;
									for(var k=0;k<projectDetailsList.length;++k) {
										if(projectDetailsList[k]._id == testscenarios[j]) {
											qcdetails.testscenarioname.push(projectDetailsList[k].name);
											flag = true;
											break;
										} 
									}
									if(!flag) {
										qcdetails.testscenarioid.splice(j,1);
									}
								}
								if(qcdetails.testscenarioname.length != 0){
									qcDetailsList.push(qcdetails);
								}
							} else {
								for(var k=0;k<projectDetailsList.length;++k) {
									if(projectDetailsList[k]._id == testscenarios) {
										qcdetails.testscenarioname.push(projectDetailsList[k].name);
										qcDetailsList.push(qcdetails);
									}
								}
							}
						}
					}
				}
				callback1();
			});
		},
		data: function (callback1) {
			cb(qcDetailsList);
		}
	});
}

function qcscenariodetails(projectid, cb) {
		logger.info("Inside function qcscenariodetails");
	var scenarios_list;
	var projectDetails = {
		"project_id": '',
		"project_name": '',
		"scenario_details": ''
	};
	var projectname = '';
	var qcDetailsList = [];
	async.series({
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
				logger.info("Calling DAS Service from qcscenariodetails: qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (scenariorows, response) {
				if (response.statusCode != 200 || scenariorows.rows == "fail") {
					logger.error("Error occurred in qualityCenter/qcProjectDetails_ICE from qcscenariodetails Error Code : ERRDAS");
				} else {
					if (scenariorows.rows.length != 0) {
						scenarios_list = JSON.parse(JSON.stringify(scenariorows.rows));
						qcDetailsList.push(scenarios_list);
					}
				}
				callback1();
			});
		},
		data: function (callback1) {
			cb(null, qcDetailsList);
		}
	}, function (err, data) {
		cb(null, qcDetailsList);
	});
}


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
    async.series({
        getprojectDetails:function(callback){
            //var getprojects = "select projectids from icepermissions where userid="+userid;
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
                        //flagtocheckifexists = true;
                        projectidlist = projectrows.rows[0].projectids;
                    }
                }
                 callback();
                //cb(null,testcasedatatoupdate);
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
    var modulelist = [];
    async.series({
        projectname1 : function(callback1){
            //var projectnamequery = "SELECT projectname FROM projects WHERE projectid="+projectid;
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
            // dbConnICE.execute(projectnamequery,function(err,projectdata){
            //         if(err){
            //             console.log(err);
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
