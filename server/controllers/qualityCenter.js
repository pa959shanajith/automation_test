/**
 * Dependencies.
 */
var async = require('async');
var myserver = require('../../server.js');
var epurl = "http://127.0.0.1:1990/";
var Client = require("node-rest-client").Client;
var client = new Client();
var sessionExtend = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
var sessionTime = 30 * 60 * 1000;
var updateSessionTimeEvery = 20 * 60 * 1000;
var validator = require('validator');

exports.loginQCServer_ICE = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			console.log("IP:", ip);
			var name = req.session.username;
			console.log(Object.keys(myserver.allSocketsMap),"<<all people, asking person:",name);
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
        if(validate_qcUrl == true && validate_qcUsername == true &&  validate_qcPassword == true)
            {

			if('allSocketsMap' in myserver && name in myserver.allSocketsMap){
				var mySocket = myserver.allSocketsMap[name];
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
				mySocket._events.qcresponse = [];
				mySocket.emit("qclogin", qcDetails);
				var updateSessionExpiry = setInterval(function () {
						req.session.cookie.maxAge = sessionTime;
					}, updateSessionTimeEvery);
				mySocket.on('qcresponse', function (data) {
					//req.session.cookie.expires = sessionExtend;
					clearInterval(updateSessionExpiry);
					res.send(data);
				});
			} else {
				console.log("Socket not Available");
				try {
					res.send("unavailableLocalServer");
				} catch (exception) {
					console.log(exception);
				}
			}
		} else {
			res.send("Invalid Session");
		}
            }else{
                res.send('unavailableLocalServer');
            }
	} catch (exception) {
		console.log(exception);
		res.send("unavailableLocalServer");
	}
};

exports.qcProjectDetails_ICE = function (req, res) {
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
			//var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			var name = req.session.username;
			console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", name);
			if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
				var mySocket = myserver.allSocketsMap[name];
				// var userid = req.body.qcUsername;
				// var username = req.body.qcUsername;
				// var password = req.body.qcPassword;
				// var url = req.body.qcURL;
				var userid = req.body.user_id;
				var qcDetails = {
					"domain": req.body.domain,
					"qcaction": req.body.qcaction
				};
				getProjectsForUser(userid, function (projectdata) {
					// var qcDetails = {"qcUsername":username,"qcPassword":password,"qcURL":url};
					// var data = "LAUNCH_SAP";
					mySocket._events.qcresponse = [];
					mySocket.emit("qclogin", qcDetails);
					var updateSessionExpiry = setInterval(function () {
							req.session.cookie.maxAge = sessionTime;
						}, updateSessionTimeEvery);
					mySocket.on('qcresponse', function (data) {
						//req.session.cookie.expires = sessionExtend;
						clearInterval(updateSessionExpiry);
						try {
							projectDetailList.nineteen68_projects = projectdata;
							projectDetailList.qc_projects = data.project;
							res.send(projectDetailList);
						} catch (ex) {
							res.send("fail");
						}

					});
				});
			} else {
				console.log("Socket not Available");
				try {
					res.send("unavailableLocalServer");
				} catch (exception) {
					console.log(exception);
				}
			}
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("unavailableLocalServer");
	}
};

function getProjectsForUser(userid, cb) {
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
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (projectrows, response) {
				if (response.statusCode != 200 || projectrows.rows == "fail") {
					console.log("Error occured in getProjectsForUser: fail , getprojectDetails");
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
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (projectdata, response) {
				if (response.statusCode != 200 || projectdata.rows == "fail") {
					console.log("Error occured in getProjectsForUser: fail , projectname1");
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
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (scenariorows, response) {
				if (response.statusCode != 200 || scenariorows.rows == "fail") {
					console.log("Error occured in getProjectsForUser: fail , scenariodata");
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
			var name = req.session.username;
			console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", name);
			if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
				var mySocket = myserver.allSocketsMap[name];
				// var userid = req.body.qcUsername;
				// var username = req.body.qcUsername;
				// var password = req.body.qcPassword;
				// var url = req.body.qcURL;
				// var userid = req.body.user_id;
				// var qcDetails = {"domain":req.body.domain,"qcaction":req.body.qcaction};
				// getProjectsForUser(userid,function(projectdata){
				// var qcDetails = {"qcUsername":username,"qcPassword":password,"qcURL":url};
				// var data = "LAUNCH_SAP";
				mySocket._events.qcresponse = [];
				mySocket.emit("qclogin", req.body);
				var updateSessionExpiry = setInterval(function () {
						req.session.cookie.maxAge = sessionTime;
					}, updateSessionTimeEvery);
				mySocket.on('qcresponse', function (data) {
					//req.session.cookie.expires = sessionExtend;
					clearInterval(updateSessionExpiry);
					res.send(data);
				});
				//})
			} else {
				console.log("Socket not Available");
				try {
					res.send("unavailableLocalServer");
				} catch (exception) {
					console.log(exception);
				}
			}
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("unavailableLocalServer");
	}
};

exports.saveQcDetails_ICE = function (req, res) {
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
		client.post(epurl + "qualityCenter/saveQcDetails_ICE", args,
			function (qcdetailsows, response) {
			if (response.statusCode != 200 || qcdetailsows.rows == "fail") {
				console.log("Error occured in saveQcDetails_ICE: fail");
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
					res.send("Invalid Session");
				}
			} catch (exception) {
				console.log(exception);
				res.send("unavailableLocalServer");
			}
		} else {
			res.send("fail");
		}
	});
};

exports.viewQcMappedList_ICE = function (req, res) {
	var qcDetailsList = [];
	var userid = req.body.user_id;
	getQcDetailsForUser(userid, function (responsedata) {
		//console.log(responsedata);
		res.send(responsedata);
	});
};

function getQcDetailsForUser(userid, cb) {
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
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (projectrows, response) {
				if (response.statusCode != 200 || projectrows.rows == "fail") {
					console.log("Error occured in getQcDetailsForUser: fail , getprojectDetails");
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
				qcscenariodetails(itr, function (err, projectDetails) {
					for (i = 0; i < projectDetails.length; i++) {
						projectDetailsList.push(projectDetails[i]);
					}
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

function qcscenariodetails(projectid, cb) {
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
			client.post(epurl + "qualityCenter/qcProjectDetails_ICE", args,
				function (scenariorows, response) {
				if (response.statusCode != 200 || scenariorows.rows == "fail") {
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
				client.post(epurl + "qualityCenter/viewQcMappedList_ICE", args,
					function (qcdetailsows, response) {
					if (response.statusCode != 200 || qcdetailsows.rows == "fail") {
						console.log("Error occured in getQcDetailsForUser: fail , getprojectDetails");
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
    
    getProjectsAndModules(req.body.user_id,function(data){
        res.send(data);
    })
}

function getProjectsAndModules(userid,cb){
    var projectDetailsList1 = [];
    var projectidlist = [];
    var scenarioDetailsList ;
    async.series({
        getprojectDetails:function(callback){
            //var getprojects = "select projectids from icepermissions where userid="+userid;
            var inputs = {"userid":userid,"query":"getprojectDetails"}
            var args = {
                data:inputs,
                headers:{"Content-Type" : "application/json"}                
            }
            client.post(epurl+"qualityCenter/qcProjectDetails_ICE",args,
                function (projectrows, response) {
                    if (response.statusCode != 200 || projectrows.rows == "fail") {
           // dbConnICE.execute(getprojects,function(err,projectrows){
                //if(err){
                    //console.log(err);
                    console.log("Error occured in getProjectsForUser: fail , getProjectsAndModules");
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
            async.forEachSeries(projectidlist,function(itr,datacallback){
                projectandmodule(itr,function(data){
                    projectDetailsList1.push(data);
                    datacallback();
                })
            },callback);
        }
    },function(err,data){
        cb(projectDetailsList1);
    })
};


function projectandmodule(projectid,cb,data){
    var projectDetails = {"project_id":'',"project_name":'',"module_details":[]};
    var projectname = '';
    var modulelist = [];
    async.series({
        projectname1 : function(callback1){
            //var projectnamequery = "SELECT projectname FROM projects WHERE projectid="+projectid;
            var inputs = {"projectid":projectid,"query":"projectname1"}
            var args = {
                data:inputs,
                headers:{"Content-Type" : "application/json"}
                
            }
            client.post(epurl+"qualityCenter/qcProjectDetails_ICE",args,
                function (projectdata, response) {
                    if (response.statusCode != 200 || projectdata.rows == "fail") {
            // dbConnICE.execute(projectnamequery,function(err,projectdata){
            //         if(err){
            //             console.log(err);
                        console.log("Error occured in getProjectsForUser: fail , projectname1");
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
};


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