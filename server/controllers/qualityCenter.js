/**
 * Dependencies.
 */
var async = require('async');
var myserver = require('../lib/socket.js');
var epurl = "http://127.0.0.1:1990/";
var Client = require("node-rest-client").Client;
var client = new Client();
var sessionExtend = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
var sessionTime = 30 * 60 * 1000;
var updateSessionTimeEvery = 20 * 60 * 1000;
var validator = require('validator');
var  logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');

exports.loginQCServer_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: loginQCServer_ICE");
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			redisServer.redisSub2.removeAllListeners('message');
			redisServer.redisSub2.subscribe('ICE2_' + req.session.username,1);
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.info("ICE Socket connecting IP: %s" , ip);
			//console.log("IP:", ip);
			var name = req.session.username;
			//console.log(Object.keys(myserver.allSocketsMap),"<<all people, asking person:",name);
			logger.info("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , name);
            check_qcUrl = validator.isEmpty(req.body.qcURL);
            if(check_qcUrl == false)
            {
                validate_qcUrl = true;
            }
            check_qcUsername = validator.isEmpty(req.body.qcUsername);
            if(check_qcUsername == false)
            {
                validate_qcUsername = true;
            }
            check_qcPassword = validator.isEmpty(req.body.qcPassword);
            if(check_qcPassword == false)
            {
                 validate_qcPassword = true;
            }
			if(validate_qcUrl == true && validate_qcUsername == true &&  validate_qcPassword == true) {
				redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + req.session.username,function(err,redisres){
					// if('allSocketsMap' in myserver && name in myserver.allSocketsMap){
					if (redisres[1]==1) {
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
						/* Commented for LB
						var mySocket = myserver.allSocketsMap[name];
						mySocket._events.qcresponse = [];
						mySocket.emit("qclogin", qcDetails); */
						logger.info("Sending socket request for qclogin to redis");
						dataToIce = {"emitAction" : "qclogin","username" : req.session.username, "responsedata":qcDetails};
						redisServer.redisPub1.publish('ICE1_normal_' + req.session.username,JSON.stringify(dataToIce));
						var updateSessionExpiry = setInterval(function () {
								req.session.cookie.maxAge = sessionTime;
							}, updateSessionTimeEvery);
						/* Commented for LB
						mySocket.on('qcresponse', function (data) {
							//req.session.cookie.expires = sessionExtend;
							clearInterval(updateSessionExpiry);
							res.send(data);
						});
						mySocket.on("unavailableLocalServer", function () {
							logger.error("Error occured in loginQCServer_ICE: Socket Disconnected");
							if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
								var soc = myserver.socketMapNotify[name];
								soc.emit("ICEnotAvailable");
							}
						}); */
						redisServer.redisSub2.on("message",function (channel,message) {
							data = JSON.parse(message);
							if(req.session.username == data.username){
								if (data.onAction == "unavailableLocalServer") {
									logger.error("Error occured in loginQCServer_ICE: Socket Disconnected");
									if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
										var soc = myserver.socketMapNotify[name];
										soc.emit("ICEnotAvailable");
									}
								} else {
									data = data.value;
									//req.session.cookie.expires = sessionExtend;
									clearInterval(updateSessionExpiry);
									res.send(data);
								}
							}
						});
					} else {
						logger.info("ICE Socket not Available");
						try {
							res.send("unavailableLocalServer");
						} catch (exception) {
							logger.error(exception);
						}
					}
				});
			} else {
				logger.info("Invalid Session");
				res.send("Invalid Session");
			}
		} else {
			res.send('unavailableLocalServer');
		}
	} catch (exception) {
		logger.error(exception);
		res.send("unavailableLocalServer");
	}
};

exports.qcProjectDetails_ICE = function (req, res) {
	logger.info("Inside UI service: qcProjectDetails_ICE");
	var projectDetailList = {
		"nineteen68_projects": '',
		"qc_projects": ""
	};
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			redisServer.redisSub2.removeAllListeners('message');
			redisServer.redisSub2.subscribe('ICE2_' + req.session.username,1);
			//var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			var name = req.session.username;
			logger.info("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , name);
			redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + req.session.username,function(err,redisres){
				/* Commented for LB
				if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
					var mySocket = myserver.allSocketsMap[name]; */
				if (redisres[1]==1) {
					var userid = req.body.user_id;
					var qcDetails = {
						"domain": req.body.domain,
						"qcaction": req.body.qcaction
					};
					getProjectsForUser(userid, function (projectdata) {
						// var qcDetails = {"qcUsername":username,"qcPassword":password,"qcURL":url};
						// var data = "LAUNCH_SAP";
						/* Commented for LB
						mySocket._events.qcresponse = [];
						mySocket.emit("qclogin", qcDetails); */
						logger.info("Sending socket request for qclogin to redis");
						dataToIce = {"emitAction" : "qclogin","username" : req.session.username, "responsedata":qcDetails};
						redisServer.redisPub1.publish('ICE1_normal_' + req.session.username,JSON.stringify(dataToIce));
						var updateSessionExpiry = setInterval(function () {
								req.session.cookie.maxAge = sessionTime;
							}, updateSessionTimeEvery);
						/* Commented for LB
						mySocket.on('qcresponse', function (data) {
							//req.session.cookie.expires = sessionExtend;
							clearInterval(updateSessionExpiry);
							try {
								projectDetailList.nineteen68_projects = projectdata;
								projectDetailList.qc_projects = data.project;
								res.send(projectDetailList);
							} catch (ex) {
								logger.error(ex);
								res.send("fail");
							}
						});
						mySocket.on("unavailableLocalServer", function () {
							logger.error("Error occured in qcProjectDetails_ICE: Socket Disconnected");
							if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
								var soc = myserver.socketMapNotify[name];
								soc.emit("ICEnotAvailable");
							}
						}); */
						redisServer.redisSub2.on("message",function (channel,message) {
							data = JSON.parse(message);
							if(req.session.username == data.username){
								if (data.onAction == "unavailableLocalServer") {
									logger.error("Error occured in qcProjectDetails_ICE: Socket Disconnected");
									if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
										var soc = myserver.socketMapNotify[name];
										soc.emit("ICEnotAvailable");
									}
								} else {
									data = data.value;
									//req.session.cookie.expires = sessionExtend;
									clearInterval(updateSessionExpiry);
									try {
										projectDetailList.nineteen68_projects = projectdata;
										projectDetailList.qc_projects = data.project;
										res.send(projectDetailList);
									} catch (ex) {
										logger.error(ex);
										res.send("fail");
									}
								}
							}
						});
					});
				} else {
					logger.info("ICE Socket not Available");
					try {
						res.send("unavailableLocalServer");
					} catch (exception) {
						logger.error(exception);
					}
				}
			});
		} else {
				logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception);
		res.send("unavailableLocalServer");
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
			logger.info("Calling NDAC Service from getProjectsForUser: qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (projectrows, response) {
				if (response.statusCode != 200 || projectrows.rows == "fail") {
					logger.error("Error occured in qualityCenter/qcProjectDetails_ICE from getprojectDetails Error Code : ERRNDAC");
				} else {
					if (projectrows.rows.length != 0) {
						flagtocheckifexists = true;
						projectidlist = projectrows.rows[0].projectids;
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
			console.log(JSON.stringify(projectDetailsList));
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
				logger.info("Calling NDAC Service : qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (projectdata, response) {
				if (response.statusCode != 200 || projectdata.rows == "fail") {
					
					logger.error("Error occured in getProjectsForUser from projectname1 Error Code : ERRNDAC");
				} else {
					if (projectdata.rows.length != 0) {
						projectname = projectdata.rows[0].projectname;
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
				logger.info("Calling NDAC Service :qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (scenariorows, response) {
				if (response.statusCode != 200 || scenariorows.rows == "fail") {
					logger.error("Error occured in getProjectsForUser from scenariodata Error Code : ERRNDAC");
				} else {
					if (scenariorows.rows.length != 0) {
						flagtocheckifexists = true;
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
	var projectDetailList = {
		"nineteen68_projects": '',
		"qc_projects": ""
	};
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			redisServer.redisSub2.removeAllListeners('message');
			redisServer.redisSub2.subscribe('ICE2_' + req.session.username,1);
			var name = req.session.username;
			logger.info("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , name);
			redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + req.session.username,function(err,redisres){
				if (redisres[1]==1) {
					/* Commented for LB
					if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
					var mySocket = myserver.allSocketsMap[name];
					mySocket._events.qcresponse = [];
					mySocket.emit("qclogin", req.body); */
					logger.info("Sending socket request for qclogin to redis");
					dataToIce = {"emitAction" : "qclogin","username" : req.session.username, "responsedata":qcDetails};
					redisServer.redisPub1.publish('ICE1_normal_' + req.session.username,JSON.stringify(dataToIce));
					var updateSessionExpiry = setInterval(function () {
							req.session.cookie.maxAge = sessionTime;
						}, updateSessionTimeEvery);
					/* Commented for LB
					mySocket.on('qcresponse', function (data) {
						//req.session.cookie.expires = sessionExtend;
						clearInterval(updateSessionExpiry);
						res.send(data);
					});
					mySocket.on("unavailableLocalServer", function () {
						logger.error("Error occured in qcFolderDetails_ICE: Socket Disconnected");
						if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
							var soc = myserver.socketMapNotify[name];
							soc.emit("ICEnotAvailable");
						}
					}); */
					redisServer.redisSub2.on("message",function (channel,message) {
						data = JSON.parse(message);
						if(req.session.username == data.username){
							if (data.onAction == "unavailableLocalServer") {
								logger.error("Error occured in qcFolderDetails_ICE: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}
							} else {
								data = data.value;
								//req.session.cookie.expires = sessionExtend;
								clearInterval(updateSessionExpiry);
								res.send(data);
							}
						}
					});
				} else {
					logger.info("ICE Socket not Available");
					try {
						res.send("unavailableLocalServer");
					} catch (exception) {
						logger.error(exception);
					}
				}
			});
		} else {
				logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception);
		res.send("unavailableLocalServer");
	}
};

exports.saveQcDetails_ICE = function (req, res) {
	logger.info("Inside UI service: saveQcDetails_ICE");
	var mappedDetails = req.body.mappedDetails;
	var flag = true;
	if (mappedDetails.length > 0) {
		flag = true;
	} else {
		flag = false;
	}
	async.forEachSeries(mappedDetails, function (itr, callback) {
		var qcdetailsid = null;
		var testscenarioid = itr.scenarioId;
		var qcdomain = itr.domain;
		var qcproject = itr.project;
		var qcfolderpath = itr.folderpath;
		var qctestcase = itr.testcase;
		var qctestset = itr.testset;
		var scenarioquery = "INSERT INTO qualitycenterdetails (testscenarioid,qcdetailsid,qcdomain,qcfolderpath,qcproject,qctestcase,qctestset) VALUES (" + testscenarioid + "," + testscenarioid + ",'" + qcdomain + "','" + qcfolderpath + "','" + qcproject + "','" + qctestcase + "','" + qctestset + "')";
		var inputs = {
			"testscenarioid": testscenarioid,
			"qcdetailsid": testscenarioid,
			"qcdomain": qcdomain,
			"qcfolderpath": qcfolderpath,
			"qcproject": qcproject,
			"qctestcase": qctestcase,
			"qctestset": qctestset,
			"query": "saveQcDetails_ICE"
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
			logger.info("Calling NDAC Service: qualityCenter/saveQcDetails_ICE");
		client.post(epurl + "qualityCenter/saveQcDetails_ICE", args,
			function (qcdetailsows, response) {
			if (response.statusCode != 200 || qcdetailsows.rows == "fail") {
					logger.error("Error occured in saveQcDetails_ICE Error Code : ERRNDAC");
				flag = false;
			}
			callback();
		});
	}, function () {
		if (flag) {
			try {
				if (req.cookies['connect.sid'] != undefined) {
					var sessionCookie = req.cookies['connect.sid'].split(".");
					var sessionToken = sessionCookie[0].split(":");
					sessionToken = sessionToken[1];
				}
				if (sessionToken != undefined && req.session.id == sessionToken) {
					/*var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
					console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", ip);
					var mySocket = myserver.allSocketsMap[ip];
					if ('allSocketsMap' in myserver && ip in myserver.allSocketsMap) {
						mySocket._events.qcresponse = [];
						var qcDetails = {
							"qcaction": "qcquit"
						};
						mySocket.emit("qclogin", qcDetails);
						var updateSessionExpiry = setInterval(function () {
								req.session.cookie.maxAge = sessionTime;
							}, updateSessionTimeEvery);
						mySocket.on('qcresponse', function (data) {
							clearInterval(updateSessionExpiry);
							res.send("success");
						});
					} else {
						console.log("Socket not Available");
						try {
							res.send("unavailableLocalServer");
						} catch (exception) {
							console.log(exception);
						}
					}*/
					res.send("success");
				} else {
					logger.info("Invalid Session");
					res.send("Invalid Session");
				}
			} catch (exception) {
				logger.error(exception);
				res.send("unavailableLocalServer");
			}
		} else {
			res.send("fail");
		}
	});
};

exports.viewQcMappedList_ICE = function (req, res) {
	logger.info("Inside UI service: viewQcMappedList_ICE");
	var qcDetailsList = [];
	var userid = req.body.user_id;
	getQcDetailsForUser(userid, function (responsedata) {
		//console.log(responsedata);
		res.send(responsedata);
	});
};

function getQcDetailsForUser(userid, cb) {
	logger.info("Inside function getQcDetailsForUser");
	var projectDetailsList = [];
	var projectidlist = [];
	var scenarioDetailsList;
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
				logger.info("Calling NDAC Service :qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (projectrows, response) {
				if (response.statusCode != 200 || projectrows.rows == "fail") {
				logger.error("Error occured in qualityCenter/qcProjectDetails_ICE from getQcDetailsForUser Error Code : ERRNDAC");
				} else {
					if (projectrows.rows.length != 0) {
						flagtocheckifexists = true;
						projectidlist = projectrows.rows[0].projectids;
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
				logger.info("Calling NDAC Service from qcscenariodetails: qualityCenter/qcProjectDetails_ICE");
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (scenariorows, response) {
				if (response.statusCode != 200 || scenariorows.rows == "fail") {
					logger.error("Error occured in qualityCenter/qcProjectDetails_ICE from qcscenariodetails Error Code : ERRNDAC");
				} else {
					if (scenariorows.rows.length != 0) {
						flagtocheckifexists = true;
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
					"testscenarioid": itr.testscenarioid,
					"query": "qcdetails"
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
					logger.info("Calling NDAC Service from qcdetails: qualityCenter/viewQcMappedList_ICE");
				client.post(epurl + "qualityCenter/viewQcMappedList_ICE", args,
					function (qcdetailsows, response) {
					if (response.statusCode != 200 || qcdetailsows.rows == "fail") {
						logger.error("Error occured inqualityCenter/viewQcMappedList_ICE from qcdetails Error Code : ERRNDAC");
					} else {
						if (qcdetailsows.rows.length != 0) {
							flagtocheckifexists = true;
							qcdetails = JSON.parse(JSON.stringify(qcdetailsows.rows[0]));
							qcdetails.testscenarioname = itr.testscenarioname;
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
            //var getprojects = "select projectids from icepermissions where userid="+userid;
            var inputs = {"userid":userid,"query":"getprojectDetails"};
            var args = {
                data:inputs,
                headers:{"Content-Type" : "application/json"}                
            };
				logger.info("Calling NDAC Service from getProjectsAndModules: qualityCenter/qcProjectDetails_ICE");
            client.post(epurl+"qualityCenter/qcProjectDetails_ICE",args,
                function (projectrows, response) {
                    if (response.statusCode != 200 || projectrows.rows == "fail") {
           // dbConnICE.execute(getprojects,function(err,projectrows){
                //if(err){
                    //console.log(err);
                  					logger.error("Error occured in qualityCenter/qcProjectDetails_ICE from getProjectsAndModules Error Code : ERRNDAC");

                }else{
                    if(projectrows.rows.length!=0){
                        flagtocheckifexists = true;
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
            var args = {
                data:inputs,
                headers:{"Content-Type" : "application/json"}
                
            };
				logger.info("Calling NDAC Service from projectname1: qualityCenter/qcProjectDetails_ICE");
            client.post(epurl+"qualityCenter/qcProjectDetails_ICE",args,
                function (projectdata, response) {
                    if (response.statusCode != 200 || projectdata.rows == "fail") {
            // dbConnICE.execute(projectnamequery,function(err,projectdata){
            //         if(err){
            //             console.log(err);
					logger.error("Error occured in qualityCenter/qcProjectDetails_ICE from projectname1 Error Code : ERRNDAC");
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
                        console.log("Error occured in getProjectsForUser: fail , scenariodata");
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
                console.log("Error occured is :",err);
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