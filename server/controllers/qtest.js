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


let headers
module.exports.setReq = async (req) =>
{
	headers=req;
}

exports.loginToQTest_ICE = function (req, res) {
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
					var integrationType = req.body.integrationType;
					var qcaction = req.body.qcaction;
					var qcDetails = {
						"qtestusername": username,
						"qtestpassword": password,
						"qtesturl": url,
						"integrationType" : integrationType,
						"qcaction": qcaction
					};
					logger.info("Sending socket request for qclogin to redis");
					dataToIce = {"emitAction" : "qtestlogin","username" : name, "responsedata":qcDetails};
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

exports.qtestProjectDetails_ICE = function (req, res) {
	logger.info("Inside UI service: qcProjectDetails_ICE");
	var projectDetailList = {
		"avoassure_projects": '',
		"qc_projects": ""
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
				var qcDetails = {
					"domain": req.body.domain,
					"qcaction": req.body.qcaction
				};
				getProjectsForUser(userid, function (projectdata) {
					// var qcDetails = {"qcUsername":username,"qcPassword":password,"qcURL":url};
					logger.info("Sending socket request for qclogin to redis");
					dataToIce = {"emitAction" : "qtestlogin","username" : name, "responsedata":qcDetails};
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
		res.send("fail");
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
						//flagtocheckifexists = true;
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

exports.qtestFolderDetails_ICE = function (req, res) {
	logger.info("Inside UI service: qtestFolderDetails_ICE");
	try {
		var qcDetails = req.body;
		var username = req.session.username;
		var name = undefined
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) name = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + name);
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.debug("ICE Socket requesting Address: %s" , name);
		redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
			if (redisres[1]>0) {
				logger.info("Sending socket request for qclogin to redis");
				dataToIce = {"emitAction" : "qtestlogin","username" : name, "responsedata":qcDetails};
				redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
				function qclogin_listener(channel,message) {
					var data = JSON.parse(message);
					if(name == data.username && ["unavailableLocalServer", "qcresponse"].includes(data.onAction)){
						redisServer.redisSubServer.removeListener('message',qclogin_listener);
						if (data.onAction == "unavailableLocalServer") {
							logger.error("Error occurred in qtestFolderDetails_ICE: Socket Disconnected");
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
				try {
					utils.getChannelNum('ICE1_scheduling_' + name, function(found){
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
		res.send("fail");
	}
};

exports.saveQtestDetails_ICE = async (req, res) => {
	const fnName = "saveQtestDetails_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		var mappedDetails = req.body.mappedDetails;
		var flag = mappedDetails.length > 0;
		if (!flag) return res.send('fail');
		for (let i=0; i<mappedDetails.length; i++) {
			let itr = mappedDetails[i];
			var testscenarioid = itr.scenarioId;
			const inputs = {
				"testscenarioid": testscenarioid,
				"qcdetailsid": testscenarioid,
				"qtestproject": itr.project,
				"qtestprojectid": itr.projectid,
				"qtestsuiteid": itr.testsuiteid,
				"qtestsuite": itr.testsuite,
				// "maptype": itr.maptype,
				"query": "saveQtestDetails_ICE"
			};
			const result = await utils.fetchData(inputs, "qualityCenter/saveIntegrationDetails_ICE", fnName);
			if (result == "fail") flag = false;
		}
		if (!flag) return res.send('fail');
		res.send("success");
	} catch (exception) {
		logger.error("Error occurred in qtest/"+fnName+":", exception);
		res.send("fail");
	}
};

exports.viewQtestMappedList_ICE = function (req, res) {
	logger.info("Inside UI service: viewQtestMappedList_ICE");
	var userid = req.session.userid;
	var username = req.session.username;
	var name = undefined
	if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) name = myserver.allSocketsICEUser[username][0];
	getQcDetailsForUser(userid, function (responsedata) {
		redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
			if (redisres[1]>0) {
				var suiteDetails = {
					"suiteData": responsedata,
					"qcaction": "suitedetails"
				};
				logger.info("Sending socket request for qclogin to redis");
				dataToIce = {"emitAction" : "qtestlogin","username" : name, "responsedata":suiteDetails};
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
						}
						res.send(data);
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
	});
};

function getQcDetailsForUser(userid, cb) {
	logger.info("Inside function getQcDetailsForUser");
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
	var qcList = [];
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
						//flagtocheckifexists = true;
						scenarios_list = JSON.parse(JSON.stringify(scenariorows.rows));
						// projectDetails.project_id = projectid;
						// projectDetails.scenario_details = scenarios_list;
						// projectDetails.project_name = projectname;
					}
				}
				callback1();
			});
		},
		qcdetails: function (callback1) {
			logger.info("Inside function qcdetails");
			async.forEachSeries(scenarios_list, function (itr, callback2) {
				var inputs = {
					"testscenarioid": itr._id,
					"query": "qtestdetails"
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
							//flagtocheckifexists = true;
							qcdetails = JSON.parse(JSON.stringify(qcdetailsows.rows[0]));
							qcdetails.testscenarioname = itr.name;
							// projectDetails.project_id = projectid;
							// projectDetails.scenario_details = scenarios_list;
							// projectDetails.project_name = projectname;
							qcDetailsList.push(qcdetails);
						}
					}
					callback2();
				});
			}, callback1);
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
    var scenarioDetailsList ;
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
           // dbConnICE.execute(getprojects,function(err,projectrows){
                //if(err){
                    //console.log(err);
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
    var projectname = '';
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
        /*scenariodata:function(callback1){
            var modulequery = "SELECT * FROM modules where projectid="+projectid
                var inputs = {"projectid":projectid,"query":"scenariodata"}
                var args = {
                    data:inputs,
                    headers:{"Content-Type" : "application/json"}
                    
                }
                projectDetails.project_id = projectid;
                projectDetails.project_name = projectname;
                // client.post(epurl+"qualityCenter/qcProjectDetails_ICE",args,
                //     function (modulerows, response) {
                //     if (response.statusCode != 200 || scenariorows.rows == "fail") {
                dbConnICE.execute(modulequery,function(err,modulerows){
                if(err){
                    console.log(err);
                        console.log("Error occurred in getProjectsForUser: fail , scenariodata");
                }else{
                    if(modulerows.rows.length!=0){
                        flagtocheckifexists = true;
                        //scenarios_list = JSON.parse(JSON.stringify(modulerows.rows));
                        getmodulescenario(modulerows.rows,function(moduledata){
                            modulelist = moduledata;
                            callback1();
                        })
                        
                    }else{
                        projectDetails.project_id = projectid;
                        projectDetails.project_name = projectname;
                        callback1();
                    }
                }
            });
        }*/
    },function(err,data){
        projectDetails.module_details = modulelist;
        cb(projectDetails);
    });
}


/*function getmodulescenario(rows,cb){
    var modulelist = [];
    async.forEachSeries(rows,function(itr,callback){
        var moduleobj = {"module_name":itr.modulename,"module_id":itr.moduleid,"scenario_details":[]};
        getScenarioDetails(itr.testscenarioids,function(scenariodata){
            moduleobj.scenario_details = scenariodata;
            modulelist.push(moduleobj);
            callback();
        });

    },function(){
        cb(modulelist)
    });
}

function getScenarioDetails(scenarioids,cb){
    var scenariolist = [];
    async.forEachSeries(scenarioids,function(itr,callback){
        var scenarioquery = "select * from testscenarios where testscenarioid="+itr;
        var scenarioobj = {"scenario_name":"","scenario_id":"","testcase_details":[]};
        dbConnICE.execute(scenarioquery,function(err,scenariodata){
            if(err){
                console.log(err);
            }else{
                if(scenariodata.rows.length >0){
                    scenarioobj.scenario_name = scenariodata.rows[0].testscenarioname;
                    scenarioobj.scenario_id = scenariodata.rows[0].testscenarioid;
                    getTestCaseDetails(scenariodata.rows[0].testcaseids,function(testcasedata){
                        scenarioobj.testcase_details = testcasedata;
                        scenariolist.push(scenarioobj);
                        callback();
                    });

                }else{
                    callback();
                }
            }
        });
        
    },function(){
        cb(scenariolist);
    })
}

function getTestCaseDetails(testcaseids,cb){
    var testcaselist = [];
    async.forEachSeries(testcaseids,function(itr,callback){
        var testcaseobj = {"testcase_name":"","testcase_id":""};
        var testcasequery = "select testcasename,testcaseid from testcases where testcaseid="+itr;
        dbConnICE.execute(testcasequery,function(err,testcasedata){
            if(err){
                console.log("Error occurred is :",err);
                callback();
            }else{
                if(testcasedata.rows.length >0){
                    testcaseobj.testcase_name = testcasedata.rows[0].testcasename;
                    testcaseobj.testcase_id = testcasedata.rows[0].testcaseid;
                    testcaselist.push(testcaseobj);
                    callback();
                }else{
                    callback()
                }
            }
        });

    },function(){
        cb(testcaselist);
    });
};*/