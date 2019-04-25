/**
 * Dependencies.
 */
var bcrypt = require('bcrypt');
var uuid = require('uuid-random');
var TokenGenerator = require('uuid-token-generator')
var async = require('async');
var activeDirectory = require('activedirectory');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.NDAC_URL;
var validator =  require('validator');
var qList = [];
var neo4jAPI = require('../controllers/neo4jAPI');
var logger = require('../../logger');
var utils = require('../lib/utils');


//GetUserRoles
exports.getUserRoles_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI service: getUserRoles_Nineteen68");
		if (utils.isSessionActive(req)) {
			logger.info("Calling NDAC Service: getUserRoles_Nineteen68");
			client.post(epurl + "admin/getUserRoles_Nineteen68",
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in getUserRoles_Nineteen68 Error Code : ERRNDAC");
					res.status(500).send("fail");
				} else {
					var rolesList = [];
					var result = result.rows;
					for (var i = 0; i < result.length; i++) {
						rolesList.push([result[i].rolename, result[i].roleid]);
					}
					res.send(rolesList);
				}
			});
		} else {
			logger.error("Error occurred in getUserRoles_Nineteen68: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
		res.status(500).send("fail");
	}
};

// Create/Edit/Delete Users
exports.manageUserDetails = function(req, res){
	logger.info("Inside UI Service: manageUserDetails");
	try{
		if (utils.isSessionActive(req)) {
			var flag = ['2','0','0','0','0','0','0','0','0','0','0'];
			var salt = bcrypt.genSaltSync(10);
			var reqData = req.body.user;
			var action = req.body.action;
			var inputs = {};
			inputs.action = action;
			inputs.createdby = req.session.username;
			inputs.createdbyrole = req.session.activeRole;
			inputs.username = (reqData.username || "").trim();
			inputs.ldapuser = reqData.ldapUser;
			inputs.password = (reqData.password || "").trim();

			if (validator.isEmpty(action) || ["create","update","delete"].indexOf(action) == -1) {
				logger.error("Error occurred in admin/manageUserDetails: Invalid action.");
				flag[1]='1';
			}
			if (!validator.isLength(inputs.username,1,100)) {
				logger.error("Error occurred in admin/manageUserDetails: Invalid User name.");
				flag[2]='1';
			}
			if (action != "create") {
				inputs.userid = (reqData.userid || "").trim();
				if (!validator.isUUID(inputs.userid)) {
					logger.error("Error occurred in admin/manageUserDetails: Invalid User ID.");
					flag[2]='1';
				}
			}
			if (!inputs.ldapuser && action == "create") {
				if (validator.isEmpty(inputs.password) && !(validator.isLength(inputs.password,1,12))) {
					logger.error("Error occurred in admin/manageUserDetails: Invalid Password.");
					flag[5]='1';
				}
			}
			if (inputs.password == '') delete inputs.password;
			else inputs.password = bcrypt.hashSync(inputs.password, salt);
			if (action != "delete") {
				inputs.firstname = (reqData.firstname || "").trim();
				inputs.lastname = (reqData.lastname || "").trim();
				inputs.emailid = (reqData.email || "").trim();
				inputs.defaultrole = (reqData.role || "").trim();

				if (!validator.isLength(inputs.firstname,1,100)) {
					logger.error("Error occurred in admin/manageUserDetails: Invalid First name.");
					flag[3]='1';
				}
				if (!validator.isLength(inputs.lastname,1,100)) {
					logger.error("Error occurred in admin/manageUserDetails: Invalid Last name.");
					flag[4]='1';
				}
				if (!validator.isLength(inputs.emailid,1,100)) {
					logger.error("Error occurred in admin/manageUserDetails: Email cannot be empty.");
					flag[6]='1';
				}
				if (!validator.isUUID(inputs.defaultrole)) {
					logger.error("Error occurred in admin/manageUserDetails: Invalid Primary Role.");
					flag[7]='1';
				}
				if (action == "update") {
					inputs.additionalroles = reqData.addRole || [];
					inputs.additionalroles.every(function(e) {
						if (!validator.isUUID(e)) {
							logger.error("Error occurred in admin/manageUserDetails: Invalid Additional Role.");
							flag[8]='1';
							return false;
						}
					});
				}
				if (inputs.ldapuser) {
					inputs.ldapuser = reqData.ldap || {};
					if (!inputs.ldapuser.server || validator.isEmpty(inputs.ldapuser.server)) {
						logger.error("Error occurred in admin/manageUserDetails: Invalid LDAP Server.");
						flag[9]='1';
					}
					if (validator.isEmpty(inputs.ldapuser.user)) {
						logger.error("Error occurred in admin/manageUserDetails: Invalid User Domain Name.");
						flag[10]='1';
					}
					inputs.ldapuser = JSON.stringify({server:inputs.ldapuser.server,user:inputs.ldapuser.user});
				}
			}
			flag = flag.join('');
			if (flag != "20000000000") {
				return res.send(flag);
			}
			logger.info("Calling NDAC Service: manageUserDetails");
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/manageUserDetails", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in admin/manageUserDetails Error Code : ERRNDAC");
					res.status(500).send("fail");					
				} else {
					if(action == 'delete'){
						qList.push({"statement":"match p = (m)-[FNTT]-(t:TASKS{assignedTo:'"+reqData.userid+"'}) where t.status = 'assigned' or t.status = 'inprogress' or t.status = 'reassign' detach delete t;"});
						qList.push({"statement":"match p = (m)-[FNTT]-(t:TASKS{reviewer:'"+reqData.userid+"'}) where t.status = 'review' detach delete t;"});
						qList.push({"statement":"match p = (m)-[FNTT]-(t:TASKS{assignedTo:'"+reqData.userid+"'}) set m.assignedTo = '' "});
						qList.push({"statement":"match p = (m)-[FNTT]-(t:TASKS{reviewer:'"+reqData.userid+"'}) set m.reviewer = '' "});
					}

					logger.info("Calling neo4jAPI execute queries for manageUserDetails");
					neo4jAPI.executeQueries(qList,function(status1,result1){
						if(status1!=200){
							logger.error("Error in neo4jAPI execute queries with status for manageUserDetails: %d",status1,"\n response for manageUserDetails:%s",result1);
							return res.send(result.rows);
						}
						else{
							logger.info('neo4jAPI execute queries for manageUserDetails executed successfully');
							return res.send(result.rows);
						}
					});					
					
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception){
		logger.error("Error occurred in admin/manageUserDetails", exception);
		res.status(500).send("fail");
	}
};

// Fetch Users or a specific user details
exports.getUserDetails = function (req, res) {
	logger.info("Inside UI Service: getUserDetails");
	try{
		if (utils.isSessionActive(req)) {
			var action = req.body.action;
			var userid = req.body.args;
			logger.info("Calling NDAC Service: getUserDetails");
			var inputs = {};
			if (action != "user") inputs.userid = userid;
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/getUserDetails", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in admin/getUserDetails Error Code : ERRNDAC");
					res.status(500).send("fail");
				} else if (result.rows.length == 0) {
					res.send("empty");
				} else {
					var data;
					if (action != "user") {
						result = result.rows;
						//var password = result.password;
						data = {
							userid: userid,
							username: result.username,
							password: '',
							firstname: result.firstname,
							lastname: result.lastname,
							email: result.emailid,
							role: result.defaultrole,
							addrole: result.additionalroles,
							ldapuser: JSON.parse(result.ldapuser),
						};
						if (!data.ldapuser.server) data.ldapuser = false;
						return res.send(data);
					}
					else {
						data = [];
						var result = result.rows;
						for(var i = 0; i < result.length; i++) {
							data.push([result[i].username,result[i].userid,result[i].defaultrole]);
						}
						return res.send(data);
					}
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception){
		logger.error("Error occurred in admin/getUserDetails", exception);
		res.status(500).send("fail");
	}
};

//GetUsers service has been changed to populate the users who has access to the project
exports.getUsers_Nineteen68 = function (req, res) {
	logger.info("Inside UI service: getUsers_Nineteen68");
	var prjId = req.prjId;
	var args = {
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service: getUsers_Nineteen68");
	client.post(epurl + "admin/getUserRoles_Nineteen68", args,
		function (userrolesresult, userrolesresponse) {
		if (userrolesresponse.statusCode != 200 || userrolesresult.rows == "fail") {
			logger.error("Error occurred in getUsers_Nineteen68 Error Code : ERRNDAC");
			res(null, "fail");
		} else {
			var inputs = {
				"userroles": userrolesresult.rows,
				"projectid": prjId
			};
			args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service: getUsers_Nineteen68");
			client.post(epurl + "admin/getUsers_Nineteen68", args,
				function (getUsers, response) {
				if (response.statusCode != 200 || getUsers.rows == "fail") {
					logger.error("Error occurred in getUsers_Nineteen68 Error Code : ERRNDAC");
					res(null, "fail");
				} else {
					logger.info("Users fetched successfully");
					res(null, getUsers);
				}
			});
		}
	});
};

//Get Domains
exports.getDomains_ICE = function getDomains_ICE(req, res) {
	logger.info("Inside UI service: getDomains_ICE");
	try {
		if (utils.isSessionActive(req)) {
			var responsedata = [];
			var args = {
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service: getDomains_ICE");
			client.post(epurl + "admin/getDomains_ICE", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in getDomains_ICE Error Code : ERRNDAC");
						res.send("fail");
					} else {
						async.forEachSeries(result.rows, function (eachdomain, domainscallback) {
							try {
								var reponseobj = {
									domainId: "",
									domainName: ""
								};
								reponseobj.domainId = eachdomain.domainid;
								reponseobj.domainName = eachdomain.domainname;
								responsedata.push(reponseobj);
								domainscallback();
							} catch (exception) {
								logger.error(exception.message);
							}
						}, finalresult);
					}
				} catch (exception) {
				logger.error(exception.message);
				}
			});
			function finalresult() {
				logger.info("Domains fetched successfully");
				res.send(responsedata);
			}
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.createProject_ICE = function createProject_ICE(req, res) {
    //qList = [];
	try {
		logger.info("Inside UI service: createProject_ICE");
		if (utils.isSessionActive(req)) {
			var createProjectObj = req.body.createProjectObj;
			var userinfo = req.body.userDetails;
			var requestedskucode = "skucodetestcase";
			var requestedtags = "tags";
			var projectTypeId = "";
			var newProjectID = "";
			validateCreateProject();
			var valid_domain, valid_projectName, valid_appType, valid_projectDetails;
			function validateCreateProject() {
				logger.info("Inside function validateCreateProject");
				var check_domain = validator.isEmpty(createProjectObj.domainId);
				var check_domain_type = validator.isUUID(createProjectObj.domainId);
				if (check_domain == false && check_domain_type == true) {
					valid_domain = true;
				}
				var check_project = validator.isEmpty(createProjectObj.projectName);
				var check_projectLen = validator.isLength(createProjectObj.projectName, 1, 50);
				if (check_project == false && check_projectLen == true) {
					valid_projectName = true;
				}
				var check_appType = validator.isEmpty(createProjectObj.appType);
				if (check_appType == false) {
					valid_appType = true;
				}
				var check_projectDetails = validator.isJSON(JSON.stringify(createProjectObj.projectDetails));
				var check_projectDetailsLen = createProjectObj.projectDetails.length;
				if (check_projectDetails == true && check_projectDetailsLen > 0) {
					valid_projectDetails = true;
				}
			}
			if (valid_domain == true && valid_projectName == true && valid_appType == true && valid_projectDetails == true) {
				async.series({
					projecttype: function (callback) {
						try {
							var inputs = {
								"query": "projecttype",
								"projecttype": createProjectObj.appType
							};
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							logger.info("Calling NDAC Service: createProject_ICE");
							client.post(epurl + "admin/createProject_ICE", args,
								function (projectTypeData, response) {
								try {
									if (response.statusCode != 200 || projectTypeData.rows == "fail") {
										logger.error("Error occurred in createProject_ICE Error Code : ERRNDAC");
									}
									else {
										projectTypeId = projectTypeData.rows[0].projecttypeid;
									}
									callback();
								} catch (exception) {
									logger.error(exception.message);
								}
							});
						} catch (exception) {
							logger.error(exception.message);
						}
					},
					createproject: function (callback) {
						try {
							var inputs = {
								"query": "createproject",
								"domainid": createProjectObj.domainId,
								"projectname": createProjectObj.projectName,
								"createdby": userinfo.username.toLowerCase(),
								"projecttypeid": projectTypeId,
								"skucodeproject": "skucodeproject",
								"tags": "tags"
							};
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							newProjectID = "";
							logger.info("Calling NDAC Service from function createProject: createProject_ICE");
							client.post(epurl + "admin/createProject_ICE", args,
								function (insertProjectData, response) {
								if (response.statusCode != 200 || insertProjectData.rows == "fail") {
									logger.error("Error occurred in createProject_ICE from createproject Error Code : ERRNDAC");
								} else {
                                    newProjectID = insertProjectData.rows[0].projectid;
                                    //Execute neo4j query!!
                                    //var qList=[];
                                    /*qList.push({"statement":"MERGE (n:PROJECTS_NG {projectid:'"+newProjectID+
                                                "',domainid:'"+inputs.domainid+"',projectname:'"+
                                                inputs.projectname+"'}) return n"});*/
                                    //Relationships
                                   /* qList.push({"statement":"MATCH (a:DOMAINS_NG{domainid:'"+inputs.domainid+"'}),(b:PROJECTS_NG {projectid:'"+newProjectID+
                                                "',domainid:'"+inputs.domainid+"',projectname:'"+inputs.projectname+"'}) MERGE(a)-[r:FDOMTPRJ_NG{id:'"+newProjectID+"'}]->(b) return a,r,b"});*/
                                    callback();

								}
							});
						} catch (exception) {
							logger.error(exception.message);
						}
					},
					createreleases: function (callback) {
						try {
							var numberOfReleases = createProjectObj.projectDetails;
							async.forEachSeries(numberOfReleases, function (eachrelease, numberOfReleasescallback) {
								try {
									var releaseDetails = eachrelease;
									var releaseName = releaseDetails.releaseName;
									var cycleNames = releaseDetails.cycleNames;
									var newReleaseID = "";
									var inputs = {
										"query": "createrelease",
										"projectid": newProjectID,
										"releasename": releaseName,
										"createdby": userinfo.username.toLowerCase(),
										"skucoderelease": "skucoderelease",
										"tags": "tags"
									};
									var args = {
										data: inputs,
										headers: {
											"Content-Type": "application/json"
										}
									};
									logger.info("Calling NDAC Service : createProject_ICE");
									client.post(epurl + "admin/createProject_ICE", args,
										function (data, response) {
										if (response.statusCode != 200 || data.rows == "fail") {
											logger.error("Error occurred in createProject_ICE Error Code : ERRNDAC");
										} else {
											newReleaseID = data.rows[0].releaseid;
                                            //Execute neo4j query!! createrelease
                                            //var qList=[];
                                            /*qList.push({"statement":"MERGE (n:RELEASES_NG {releaseid:'"+newReleaseID+
                                                        "',projectid:'"+inputs.projectid+"',releasename:'"+
                                                        inputs.releasename+"',deleted:'"+false+"'}) return n"});*/
                                            //Relationships
                                           /* qList.push({"statement":"MATCH (a:PROJECTS_NG{projectid:'"+inputs.projectid+"'}),(b:RELEASES_NG {releaseid:'"+newReleaseID+
                                                        "',projectid:'"+inputs.projectid+"',releasename:'"+
                                                        inputs.releasename+"',deleted:'"+false+"'}) MERGE(a)-[r:FPRJTREL_NG{id:'"+newReleaseID+
                                                        "'}]->(b) return a,r,b"});*/

                                            //qList.push({"statement":"MATCH (c:RELEASES_NG{releaseid:'"+newReleaseID+"'}) return c"})
                                            //qList.push({"statement":"MATCH (c:CYCLES_NG{releaseid:'"+newReleaseID+"'}) return c"})

                                           /* qList.push({"statement":"MATCH (a:RELEASES_NG{releaseid:'"+newReleaseID+
                                                        "'}),(b:CYCLES_NG {releaseid:'"+newReleaseID+
                                                        "',deleted:'"+false+"'}) MERGE(a)-[r:FRELTCYC_NG{id:b.cycleid}]->(b) return a,r,b"});*/
                                            //reqToAPI(qList,urlData);
											async.forEachSeries(cycleNames, function (cycleName, cycleNamescallback) {
												try {
													var eachCycleName = cycleName;
													var inputs = {
														"query": "createcycle",
														"releaseid": newReleaseID,
														"cyclename": eachCycleName,
														"createdby": userinfo.username.toLowerCase(),
														"skucodecycle": "skucodecycle",
														"tags": "tags"
													};
													var args = {
														data: inputs,
														headers: {
															"Content-Type": "application/json"
														}
													};
													createCycle(args, function (error, response) {
														try {
															if (error) {
																logger.error(error);
																res.send(error);
															} else {
																cycleNamescallback();
															}
														} catch (exception) {
															logger.error(exception.message);
														}
													});
												} catch (exception) {
													logger.error(exception.message);
												}
											}, numberOfReleasescallback);
										}
									});
								} catch (exception) {
									logger.error(exception.message);
								}
							}, callback(null, ""));
							logger.info("Project created successfully");
							res.send('success');
						} catch (exception) {
							logger.error(exception.message);
						}
					}
				}, function (err, data) {
					if (err) {
						logger.error(err);
					} else {
						// logger.info("Calling neo4jAPI execute queries for createProject_ICE");
                        // neo4jAPI.executeQueries(qList,function(status,result){
                            // if(status!=200){
                               // logger.info("Error in neo4jAPI execute queries with status for createProject_ICE: %d",status,"\nresponse for createProject_ICE:Response: %s",result);
                            // }
                            // else{
								// logger.info("neo4jAPI execute queries with status for createProject_ICE: %d",status,"\nresponse for createProject_ICE:Response: %s",result);
                                // logger.info('neo4jAPI execute queries for createProject_ICE executed successfully');
                            // }
                        // });
					}
				});
			} else {
				res.send("fail");
			}
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
	}
};

function createCycle(args, createCycleCallback) {
	logger.info("Inside function createCycle");
	var statusFlag = "";
	logger.info("Calling NDAC Service from createCycle:createProject_ICE");
	client.post(epurl + "admin/createProject_ICE", args,
		function (result, response) {
		try {
			if (response.statusCode != 200 || result.rows == "fail") {
				statusFlag = "Error occurred in createCycle of createProject_ICE : Fail";
				logger.error("Error occurred in createProject_ICE from createCycle Error Code : ERRNDAC");
				createCycleCallback(statusFlag, null);
			} else {
				var newCycleID  = result.rows[0].cycleid;
				//var qList=[];
				/*qList.push({"statement":"MERGE (n:CYCLES_NG {releaseid:'"+args.data.releaseid+
                "',cyclename:'"+args.data.cyclename+"',cycleid:'"+
                newCycleID+"',deleted:'"+false+"'}) return n"});*/
				//Relationships
				/*qList.push({"statement":"MATCH (a:RELEASES_NG{releaseid:'"+args.data.releaseid+"'}),(b:CYCLES_NG {releaseid:'"+args.data.releaseid+
                "',cyclename:'"+args.data.cyclename+"',cycleid:'"+
                newCycleID+"',deleted:'"+false+"'}) MERGE(a)-[r:FRELTCYC_NG{id:'"+
                newCycleID+"'}]->(b) return a,r,b"});*/

				//statusFlag = "success";
				//createCycleCallback(null, statusFlag);
				createCycleCallback(null, result.rows[0]);
				logger.info("Cycle created for project successfully");
			}
		} catch (exception) {
			logger.error(exception.message);
		}
	});
}

/**
 * this service is used to create/update/delete projects/releases/cycles
 * from a particular domain
 */
exports.updateProject_ICE = function updateProject_ICE(req, res) {
	qList=[];
	try {
		logger.info("Inside UI Service: updateProject_ICE");
		if (utils.isSessionActive(req)) {
			var updateProjectDetails = req.body.updateProjectObj;
			var userinfo = req.body.userDetails;
			var flag = "";
			var requestedprojectid = updateProjectDetails.projectId;
			validateUpdateProject();
			var valid_projectName,valid_appType, valid_projectDetails;
			function validateUpdateProject() {
				logger.info("Inside function validateUpdateProject");
				var check_project = validator.isEmpty(updateProjectDetails.projectName);
				var check_projectId = validator.isUUID(updateProjectDetails.projectId);
				var check_projectLen = validator.isLength(updateProjectDetails.projectName, 1, 50);
				if (check_project == false && check_projectLen == true && check_projectId == true) {
					valid_projectName = true;
				}
				var check_appType = validator.isEmpty(updateProjectDetails.appType);
				if (check_appType == false) {
					valid_appType = true;
				}
				var check_updateProjectDetails = validator.isJSON(JSON.stringify(updateProjectDetails));
				if (check_updateProjectDetails == true) {
					valid_projectDetails = true;
				}
			}
			if (valid_projectName == true && valid_appType == true && valid_projectDetails == true) {
				async.series({
					newProjectDetails: function (newProjectDetailsCallback) {
						var projectDetails = updateProjectDetails.newProjectDetails;
						async.forEachSeries(projectDetails, function (eachprojectDetail, eachprojectDetailcallback) {
							try {
								var releaseCreateStatus = eachprojectDetail.newStatus;
								var releaseDetails = eachprojectDetail;
								var cycleDetails = releaseDetails.cycleDetails;
								if (releaseCreateStatus) {
									try {
										var releaseName = releaseDetails.releaseName;
										var newReleaseID = "";
										var inputs = {
											"query": "createrelease",
											"projectid": requestedprojectid,
											"releasename": releaseName,
											"createdby": userinfo.username.toLowerCase(),
											"skucoderelease": "skucoderelease",
											"tags": "tags"
										};
										var args = {
											data: inputs,
											headers: {
												"Content-Type": "application/json"
											}
										};
										logger.info("Calling NDAC Service from newProjectDetails : admin/createProject_ICE");
										client.post(epurl + "admin/createProject_ICE", args,
											function (data, response) {

											try {
												if (response.statusCode != 200 || data.rows == "fail") {
												logger.error("Error occurred in admin/createProject_ICE from newProjectDetails Error Code : ERRNDAC");
												} else {
													newReleaseID = data.rows[0].releaseid;
                                                    //Execute neo4j query!! createrelease
                                                    /*qList.push({"statement":"MERGE (n:RELEASES_NG {releaseid:'"+newReleaseID+
                                                                "',projectid:'"+inputs.projectid+"',releasename:'"+
                                                                inputs.releasename+"',deleted:'"+false+"'}) return n"});*/
                                                    //reqToAPI(qList,urlData);
                                                    //Relationships
                                                   /* qList.push({"statement":"MATCH (a:PROJECTS_NG{projectid:'"+inputs.projectid+"'}),(b:RELEASES_NG {releaseid:'"+newReleaseID+
                                                                "',projectid:'"+inputs.projectid+"',releasename:'"+
                                                                inputs.releasename+"',deleted:'"+false+"'}) MERGE(a)-[r:FPRJTREL_NG{id:'"+newReleaseID+
                                                                "'}]->(b) return a,r,b"});*/

                                                    //qList.push({"statement":"MATCH (c:RELEASES_NG{releaseid:'"+newReleaseID+"'}) return c"})
                                                    //qList.push({"statement":"MATCH (c:CYCLES_NG{releaseid:'"+newReleaseID+"'}) return c"})

                                                   /* qList.push({"statement":"MATCH (a:RELEASES_NG{releaseid:'"+newReleaseID+
                                                                "'}),(b:CYCLES_NG {releaseid:'"+newReleaseID+
                                                                "',deleted:'"+false+"'}) MERGE(a)-[r:FRELTCYC_NG{id:b.cycleid}]->(b) return a,r,b"});*/
                                                    // reqToAPI(qList,urlData);

													async.forEachSeries(cycleDetails, function (eachCycleDetail, cycleNamescallback) {
														try {
															var eachCycleName = eachCycleDetail.cycleName;
															var inputs = {
																"query": "createcycle",
																"releaseid": newReleaseID,
																"cyclename": eachCycleName,
																"createdby": userinfo.username.toLowerCase(),
																"skucodecycle": "skucodecycle",
																"tags": "tags"
															};
															var args = {
																data: inputs,
																headers: {
																	"Content-Type": "application/json"
																}
															};
															createCycle(args, function (error, response) {
																if (error) {
																	logger.error(error);
																	res.send(error);
																} else {
																	try {
																		cycleNamescallback();
																	} catch (exception) {
																		logger.error(exception.message);
																	}
																}
															});
														} catch (exception) {
															logger.error(exception.message);
														}
													}, eachprojectDetailcallback);
												}
											} catch (exception) {
											logger.error(exception.message);
											}
										});
									} catch (exception) {
										logger.error(exception.message);
									}
								} else {
									try {
										//this piece of code runs when only cycles needs to be created
										//in a specified release
										var releaseId = releaseDetails.releaseId;
										async.forEachSeries(cycleDetails, function (eachCycleDetail, cycleNamescallback) {
											try {
												var eachCycleName = eachCycleDetail.cycleName;
												var inputs = {
													"query": "createcycle",
													"releaseid": releaseId,
													"cyclename": eachCycleName,
													"createdby": userinfo.username.toLowerCase(),
													"skucodecycle": "skucodecycle",
													"tags": "tags"
												};
												var args = {
													data: inputs,
													headers: {
														"Content-Type": "application/json"
													}
												};
												createCycle(args, function (error, response) {
													if (error) {
														logger.error(error);
													} else {
														try {
															cycleNamescallback();
														} catch (exception) {
															logger.error(exception.message);
														}
													}
												});
											} catch (exception) {
												logger.error(exception.message);
											}
										}, eachprojectDetailcallback);
									} catch (exception) {
										logger.error(exception.message);
									}
								}
							} catch (exception) {
								logger.error(exception.message);
							}
						}, newProjectDetailsCallback);
					},
					deletedProjectDetails: function (deletedProjectDetailsCallback) {
						try {
							var projectDetails = updateProjectDetails.deletedProjectDetails;
							async.forEachSeries(projectDetails, function (eachprojectDetail, eachprojectDetailcallback) {
								try {
									var deleteStatus = eachprojectDetail.deleteStatus;
									if (deleteStatus) {
										var inputs = {
											"query": "deleterelease",
											"releasename": eachprojectDetail.releaseName,
											"projectid": requestedprojectid,
											"releaseid": eachprojectDetail.releaseId
										};
										var args = {
											data: inputs,
											headers: {
												"Content-Type": "application/json"
											}
										};
										logger.info("Calling NDAC Service from deletedProjectDetails : admin/updateProject_ICE");
										client.post(epurl + "admin/updateProject_ICE", args,
											function (result, response) {
											try {
												if (response.statusCode != 200 || result.rows == "fail") {
													flag = "Error in deleteRelease-updateProject_ICE : Fail";
													logger.error("Error occurred in admin/updateProject_ICE from deletedProjectDetails Error Code : ERRNDAC");
													res.send(flag);
												} else {
                                                    //Execute neo4j query!! deleterelease
                                                    //var qList=[];
                                                    /*qList.push({"statement":"MATCH (n:RELEASES_NG {projectid:'"+inputs.projectid+
                                                                "',releaseid:'"+inputs.releaseid+"',releasename:'"+
                                                                inputs.releasename+"'}) detach delete n"});*/
                                                    //reqToAPI(qList,urlData);
													var cyclesOfRelease = eachprojectDetail.cycleDetails;
													async.forEachSeries(cyclesOfRelease, function (eachCycleDetail, eachCycleCallback) {
														try {
															var inputs = {
																"query": "deletecycle",
																"cyclename": eachCycleDetail.cycleName,
																"releaseid": eachprojectDetail.releaseId,
																"cycleid": eachCycleDetail.cycleId
															};
															var args = {
																data: inputs,
																headers: {
																	"Content-Type": "application/json"
																}
															};
															logger.info("Calling NDAC Service from deletedProjectDetails inside async : admin/updateProject_ICE");
															client.post(epurl + "admin/updateProject_ICE", args,
																function (result, response) {
																if (response.statusCode != 200 || result.rows == "fail") {
																	logger.error("Error occurred in admin/updateProject_ICE inside async Error Code : ERRNDAC");
																	flag = "Error in deleteCycles(true)-updateProject_ICE : Fail";
																	res.send(flag);
																} else {
                                                                    //Execute neo4j query!! deletecycle
                                                                    //var qList=[];
                                                                   /* qList.push({"statement":"MATCH (n:CYCLES_NG {cycleid:'"+inputs.cycleid+
                                                                                "',releaseid:'"+inputs.releaseid+"',cyclename:'"+
                                                                                inputs.cyclename+"'}) detach delete n"});*/
                                                                    //reqToAPI(qList,urlData);
                                                                    eachCycleCallback();
																}
															});
														} catch (exception) {
															logger.error(exception.message);
														}
													}, eachprojectDetailcallback);
												}
											} catch (exception) {
												logger.error(exception.message);
											}
										});
									} else if (!deleteStatus) {
										try {
											var cycleDetails = eachprojectDetail.cycleDetails;
											async.forEachSeries(cycleDetails, function (eachCycleDetail, eachCycleCallback) {
												try {
													var deleteStatusCycles = eachCycleDetail.deleteStatus;
													if (deleteStatusCycles) {
														try {
															var inputs = {
																"query": "deletecycle",
																"cyclename": eachCycleDetail.cycleName,
																"releaseid": eachprojectDetail.releaseId,
																"cycleid": eachCycleDetail.cycleId
															};
															var args = {
																data: inputs,
																headers: {
																	"Content-Type": "application/json"
																}
															};
															logger.info("Calling NDAC Service inside async from !deleteStatus: admin/updateProject_ICE");
															client.post(epurl + "admin/updateProject_ICE", args,
																function (result, response) {
																if (response.statusCode != 200 || result.rows == "fail") {
																	logger.error("Error occurred in admin/updateProject_ICE inside async from !deleteStatus Error Code : ERRNDAC");
																	flag = "Error in deleteCycles(false)-updateProject_ICE : Fail";
																	res.send(flag);
																} else {
                                                                    //Execute neo4j query!! deletecycle
                                                                    //var qList=[];
                                                                    /*qList.push({"statement":"MATCH (n:CYCLES_NG {cycleid:'"+inputs.cycleid+
                                                                                "',releaseid:'"+inputs.releaseid+"',cyclename:'"+
                                                                                inputs.cyclename+"'}) detach delete n"});*/
                                                                    //reqToAPI(qList,urlData);
                                                                    eachCycleCallback();
																}
															});
														} catch (exception) {
															logger.error(exception.message);
														}
													}
												} catch (exception) {
													logger.error(exception.message);
												}
											}, eachprojectDetailcallback);
										} catch (exception) {
											logger.error(exception.message);
										}
									}
								} catch (exception) {
									logger.error(exception.message);
								}
							}, deletedProjectDetailsCallback);
						} catch (exception) {
								logger.error(exception.message);
						}
					},
					editedProjectDetails: function (editedProjectDetailsCallback) {
						try {
							var projectDetails = updateProjectDetails.editedProjectDetails;
							async.forEachSeries(projectDetails, function (eachprojectDetail, eachprojectDetailcallback) {
								try {
									var editedStatus = eachprojectDetail.editStatus;
									var newReleaseName = eachprojectDetail.releaseName;
									var releaseId = eachprojectDetail.releaseId;
									if (editedStatus) {
										try {
											var inputs = {
												"query": "deleterelease",
												"releasename": eachprojectDetail.oldreleaseName,
												"projectid": requestedprojectid,
												"releaseid": releaseId
											};
											var args = {
												data: inputs,
												headers: {
													"Content-Type": "application/json"
												}
											};
											logger.info("Calling NDAC Service from editedProjectDetails : admin/updateProject_ICE");
											client.post(epurl + "admin/updateProject_ICE", args,
												function (result, response) {
												try {
													if (response.statusCode != 200 || result.rows == "fail") {
														logger.error("Error occurred in admin/updateProject_ICE from editedProjectDetails Error Code : ERRNDAC");
														flag = "Error in delete-Release(true)-updateProject_ICE : Fail";
														res.send(flag);
													} else {
														try {
															var inputs = {
																"query": "createrelease",
																"projectid": requestedprojectid,
																"releaseid": releaseId,
																"releasename": newReleaseName,
																"createdby": userinfo.username.toLowerCase(),
																"skucoderelease": "skucoderelease",
																"tags": "tags"
															};
															var args = {
																data: inputs,
																headers: {
																	"Content-Type": "application/json"
																}
															};
															logger.info("Calling NDAC Service from editedProjectDetails :admin/createProject_ICE");
															client.post(epurl + "admin/createProject_ICE", args,
																function (data, response) {
																if (response.statusCode != 200 || data.rows == "fail") {
																	logger.error("Error occurred in admin/createProject_ICE from editedProjectDetails Error Code : ERRNDAC");
																	flag = "Error in update-Release(true)-updateProject_ICE : Fail";
																	res.send(flag);
																} else {
																	try {
																		var cycleDetails = eachprojectDetail.cycleDetails;
																		var newCycleName = "";
																		var cycleId = "";
																		async.forEachSeries(cycleDetails, function (eachCycleDetail, eachCycleCallback) {
																			try {
																				var editedStatusCycles = eachCycleDetail.editStatus;
																				if (editedStatusCycles) {
																					try {
																						newCycleName = eachCycleDetail.cycleName;
																						cycleId = eachCycleDetail.cycleId;
																						var inputs = {
																							"query": "deletecycle",
																							"cyclename": eachCycleDetail.oldCycleName,
																							"releaseid": releaseId,
																							"cycleid": cycleId
																						};
																						var args = {
																							data: inputs,
																							headers: {
																								"Content-Type": "application/json"
																							}
																						};
																						logger.info("Calling NDAC Service from editedProjectDetails :admin/updateProject_ICE");
																						client.post(epurl + "admin/updateProject_ICE", args,
																							function (result, response) {
																							if (response.statusCode != 200 || result.rows == "fail") {
																								logger.error("Error occurred in admin/updateProject_ICE from editedProjectDetails Error Code : ERRNDAC");
																								flag = "Error in delete-Cycle(true)-updateProject_ICE : Fail";
																								res.send(flag);
																							} else {
																								try {
																									var inputs = {
																										"query": "createcycle",
																										"releaseid": releaseId,
																										"cycleid": cycleId,
																										"cyclename": newCycleName,
																										"createdby": userinfo.username.toLowerCase(),
																										"skucodecycle": "skucodecycle",
																										"tags": "tags"
																									};
																									var args = {
																										data: inputs,
																										headers: {
																											"Content-Type": "application/json"
																										}
																									};
																									createCycle(args, function (error, response) {
																										if (error) {
																											logger.error(error);
																											res.send(error);
																										} else {
																											eachCycleCallback();
																										}
																									});
																								} catch (exception) {
																									logger.error(exception.message);
																								}
																							}
																						});
																					} catch (exception) {
																						logger.error(exception.message);
																					}
																				} else {
																					eachCycleCallback();
																				}
																			} catch (exception) {
																				logger.error(exception.message);
																			}
																		}, eachprojectDetailcallback);
																	} catch (exception) {
																		logger.error(exception.message);
																	}
																}
															});
														} catch (exception) {
																logger.error(exception.message);
														}
													}
												} catch (exception) {
													logger.error(exception.message);
												}
											});
										} catch (exception) {
												logger.error(exception.message);
										}
									} else {
										try {
											var cycleDetails = eachprojectDetail.cycleDetails;
											var newCycleName = "";
											var cycleId = "";
											async.forEachSeries(cycleDetails, function (eachCycleDetail, eachCycleCallback) {
												try {
													var editedStatusCycles = eachCycleDetail.editStatus;
													if (editedStatusCycles) {
														try {
															newCycleName = eachCycleDetail.cycleName;
															cycleId = eachCycleDetail.cycleId;
															var inputs = {
																"query": "deletecycle",
																"cyclename": eachCycleDetail.oldCycleName,
																"releaseid": releaseId,
																"cycleid": cycleId
															};
															var args = {
																data: inputs,
																headers: {
																	"Content-Type": "application/json"
																}
															};
															logger.info("Calling NDAC Service : admin/updateProject_ICE");
															client.post(epurl + "admin/updateProject_ICE", args,
																function (result, response) {
																if (response.statusCode != 200 || result.rows == "fail") {
																	logger.error("Error occurred in admin/updateProject_ICE Error Code : ERRNDAC");
																	flag = "Error in delete-Cycle(true)-updateProject_ICE : Fail";
																	res.send(flag);
																} else {
																	try {
																		var inputs = {
																			"query": "createcycle",
																			"releaseid": releaseId,
																			"cycleid": cycleId,
																			"cyclename": newCycleName,
																			"createdby": userinfo.username.toLowerCase(),
																			"skucodecycle": "skucodecycle",
																			"tags": "tags"
																		};
																		var args = {
																			data: inputs,
																			headers: {
																				"Content-Type": "application/json"
																			}
																		};
																		createCycle(args, function (error, response) {
																			if (error) {
																				logger.error(error);
																				res.send(error);
																			} else {
																				eachCycleCallback();
																			}
																		});
																	} catch (exception) {
																			logger.error(exception.message);
																	}
																}
															});
														} catch (exception) {
															logger.error(exception.message);
														}
													} else {
														eachCycleCallback();
													}
												} catch (exception) {
													logger.error(exception.message);
												}
											}, eachprojectDetailcallback);
										} catch (exception) {
											logger.error(exception.message);
										}
									}
								} catch (exception) {
									logger.error(exception.message);
								}
							}, editedProjectDetailsCallback);
						} catch (exception) {
							logger.error(exception.message);
						}
					}
				}, function (error, response) {
					if (error) {
						logger.error("Error occurred in function newProjectDetails");
						res.send("fail");
					} else {
						logger.info("Calling neo4jAPI execute queries for updateProject_ICE");
                        neo4jAPI.executeQueries(qList,function(status,result){
                           // res.setHeader('Content-Type', 'application/json');
                            if(status!=200){
                              logger.info("Error in neo4jAPI execute queries with status for updateProject_ICE: %d",status,"\n response for updateProject_ICE: %s",result);
                            }
                            else{
                               logger.info('neo4jAPI execute queries for updateProject_ICE executed successfully');
                               res.send("success");
                            }
                        });
						 logger.info('neo4jAPI execute queries for updateProject_ICE executed successfully');
						//res.send("success");
					}
				});
			} else {
				res.send('fail');
			}
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
	}
};

/***
 * vishvas.a
 * service renders the names of all projects in domain/projects
 * cycles
 * date 24.03.2017
 */
exports.getNames_ICE = function (req, res) {
	logger.info("Inside UI service: getNames_ICE");
	try {
		if (utils.isSessionActive(req)) {
			var requestedidslist = req.body.requestedids;
			var idtypes = req.body.idtype;
			var index = 0;
			var responsedata = {
				requestedids: [],
				respnames: [],
				idtypes: []
			};
			if (requestedidslist.length == idtypes.length && requestedidslist.length > 0) {
				for (var eachid = 0; eachid < requestedidslist.length; eachid++) {
					if (requestedidslist[eachid] != null && requestedidslist[eachid] != undefined && requestedidslist[eachid].trim() != '') {
						//in this block all projects under the domain is the response.
						if (idtypes[eachid] == 'domainsall') {
							responsedata = {
								projectIds: [],
								projectNames: []
							};
							namesfetcher(requestedidslist[eachid], "domainsall", function (error, response) {
								try {
									if (response.length <= 0) {
										logger.info('No projects found');
										res.send("No Projects");
									} else {
										for (var i = 0; i < response.length; i++) {
											responsedata.projectIds.push(response[i].projectid);
											responsedata.projectNames.push(response[i].projectname);
											if (i == response.length - 1) {
												logger.info('Project details fetched successfully');
												res.send(responsedata);
											}
										}
									}
								} catch (exception) {
									logger.error(exception.message);
								}
							});
						} else if (idtypes[eachid] == 'projects') {
							namesfetcher(requestedidslist[eachid], "projects", function (error, response) {
								try {
									responsedata.idtypes.push('projects');
									responsedata.requestedids.push(response[0].projectid);
									responsedata.respnames.push(response[0].projectname);
									if (index == requestedidslist.length) {
										logger.info('Project details fetched successfully');
										res.send(responsedata);
									}
								} catch (exception) {
									logger.error(exception.message);
								}
							});
						} else if (idtypes[eachid] == 'releases') {
							//in this block release name and release id of the respective id is sent
							namesfetcher(requestedidslist[eachid], "releases", function (error, response) {
								try {
									responsedata.idtypes.push('releases');
									responsedata.requestedids.push(response[0].releaseid);
									responsedata.respnames.push(response[0].releasename);
									if (index == requestedidslist.length) {
										logger.info('Release details fetched successfully');
										res.send(responsedata);
									}
								} catch (exception) {
									logger.error(exception.message);
								}
							});
						} else if (idtypes[eachid] == 'cycles') {
							//in this block cycle name and cycle id of the respective id is sent
							namesfetcher(requestedidslist[eachid], "cycles", function (error, response) {
								try {
									responsedata.idtypes.push('cycles');
									responsedata.requestedids.push(response[0].cycleid);
									responsedata.respnames.push(response[0].cyclename);
									if (index == requestedidslist.length) {
										logger.info('Cycle details fetched successfully');
										res.send(responsedata);
									}
								} catch (exception) {
									logger.error(exception.message);
								}
							});
						} else if (idtypes[eachid] == 'screens') {
							namesfetcher(requestedidslist[eachid], "screens", function (error, response) {
								try {
									responsedata.idtypes.push('screens');
									responsedata.requestedids.push(response[0].screenid);
									responsedata.respnames.push(response[0].screenname);
									if (index == requestedidslist.length) {
										logger.info('Screen details fetched successfully');
										res.send(responsedata);
									}
								} catch (exception) {
									logger.error(exception.message);
								}
							});
						} else {
							res.send("fail");
							break;
						}
					} else {
						logger.info("Invalid Input to UI Service getNames_ICE");
					}
				}
			} else {
				res.send("fail");
			}

			function namesfetcher(id, query, namesfetchercallback) {
				logger.info("Inside function namesfetcher");
				var inputs = {
					"id": id,
					"query": query
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from namesfetcher: admin/getNames_ICE");
				client.post(epurl + "admin/getNames_ICE", args,
					function (queryStringresult, response) {
					try {
						if (response.statusCode != 200 || queryStringresult.rows == "fail") {
							var statusFlag = "Error occurred in namesfetcher : Fail";
							logger.error("Error occurred in admin/getNames_ICE from namesfetcher Error Code : ERRNDAC");
							namesfetchercallback(statusFlag, null);
						} else {
							index = index + 1;
							namesfetchercallback(null, queryStringresult.rows);
						}
					} catch (exception) {
						logger.error(exception.message);
					}
				});
			}
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
	}
};

/**
 * vishvas.a
 * service renders all the details of the child type
 * if domainid is provided all projects in domain is returned
 * if projectid is provided all release and cycle details is returned
 * if cycleid is provided, testsuite details is returned
 * date 03/04/2017
 */
exports.getDetails_ICE = function (req, res) {
	logger.info("Inside UI service: getDetails_ICE");
	var checkresBody = validator.isJSON(JSON.stringify(req.body));
	if (checkresBody == true) {
		try {
			if (utils.isSessionActive(req)) {
				var requestedidslist = req.body.requestedids;
				var idtypes = req.body.idtype;
				var responsedata = {};
				var requestedid;
				var eachProjectDetail = {};
				var index = 0;
				if (requestedidslist.length == idtypes.length) {
					try {
						for (var eachid = 0; eachid < requestedidslist.length; eachid++) {
							requestedid = requestedidslist[eachid];
							//here the data gets sent at once
							if (idtypes[eachid] == 'domaindetails') {
								try {
									var responsedatadomains = {
										projectIds: [],
										projectNames: []
									};
									queryExecutor(requestedid, "domaindetails", "subquery", function (error, response) {
										if (error) {
											try {
												logger.error("Error occurred in getDetails_ICE_domaindetails");
												res.send("Error in getDetails_ICE_domaindetails : Fail");
											} catch (exception) {
												logger.error(exception.message);
											}
										} else {
											try {
												if (response.length == 0) {
													res.send(responsedatadomains);
												} else {
													for (var i = 0; i < response.length; i++) {
														responsedatadomains.projectIds.push(response[i].projectid);
														responsedatadomains.projectNames.push(response[i].projectname);
														if (i == response.length - 1) {
															try {
																res.send(responsedatadomains);
															} catch (exception) {
																logger.error(exception.message);
															}
														}
													}
												}
											} catch (exception) {
												logger.error(exception.message);
											}
										}
									});
								} catch (exception) {
										logger.error(exception.message);
								}
							} else if (idtypes[eachid] == 'projectsdetails') {
								try {
									responsedata = {
										appType: "",
										projectName: "",
										projectId: "",
										projectDetails: []
									};
									queryExecutor(requestedid, "projectsdetails", "projecttypeid",
										function (queryForProjectTypeIderror, queryForProjectTypeIdresponse) {
										if (queryForProjectTypeIderror) {
											try {
												logger.error(queryForProjectTypeIderror);
												res.send(queryForProjectTypeIderror);
											} catch (exception) {
												logger.error(exception.message);
											}
										} else {
											try {
												for (var i = 0; i < queryForProjectTypeIdresponse.length; i++) {
													responsedata.projectName = queryForProjectTypeIdresponse[i].projectname;
													responsedata.projectId = queryForProjectTypeIdresponse[i].projecttypeid;
													queryExecutor(queryForProjectTypeIdresponse[i].projecttypeid, "projectsdetails", "projecttypename",
														function (queryForProjectTypeerror, queryForProjectTyperesponse) {
														if (queryForProjectTypeerror) {
															try {
																logger.error(queryForProjectTypeerror);
																res.send(queryForProjectTypeerror);
															} catch (exception) {
																logger.error(exception.message);
															}
														} else {
															try {
																for (var indexofName = 0; indexofName < queryForProjectTyperesponse.length; indexofName++) {
																	responsedata.appType = queryForProjectTyperesponse[indexofName].projecttypename;
																	queryExecutor(requestedid, "projectsdetails", "releasedetails",
																		function (queryGetReleaseserror, queryGetReleasesresponse) {
																		if (queryGetReleaseserror) {
																			try {
																				logger.error(queryGetReleaseserror);
																				res.send(queryGetReleaseserror);
																			} catch (exception) {
																					logger.error(exception.message);
																			}
																		} else {
																			var releaseindex = 0;
																			async.forEachSeries(queryGetReleasesresponse,
																				function (eachRelease, releasecallback) {
																				try {
																					eachProjectDetail = {};
																					queryExecutor(eachRelease.releaseid, "projectsdetails", "cycledetails",
																						function (queryGetCycleserror, queryGetCyclesresponse) {
																						try {
																							if (queryGetCycleserror) {
																								try {
																									logger.error(queryGetCycleserror);
																									res.send(queryGetCycleserror);
																								} catch (exception) {
																									logger.error(exception.message);
																								}
																							} else {
																								try {
																									releaseindex = releaseindex + 1;
																									var cycleindex = 0;
																									var cycleDetails = [];
																									async.forEachSeries(queryGetCyclesresponse,
																										function (eachCycle, cyclecallback) {
																										try {
																											var eachCycleObject = {};
																											responsedata.projectDetails.releaseid = eachRelease.releaseid;
																											responsedata.projectDetails.releaseid = eachRelease.releaseid;
																											eachCycleObject.cycleName = eachCycle.cyclename;
																											eachCycleObject.cycleId = eachCycle.cycleid;
																											cycleindex = cycleindex + 1;
																											cycleDetails.push(eachCycleObject);
																											cyclecallback();
																										} catch (exception) {
																												logger.error(exception.message);
																										}
																									});
																									eachProjectDetail.releaseName = eachRelease.releasename;
																									eachProjectDetail.releaseId = eachRelease.releaseid;
																									eachProjectDetail.cycleDetails = cycleDetails;
																									if (releaseindex == queryGetReleasesresponse.length && queryGetCyclesresponse.length == cycleindex) {
																										finalDataReturn();
																									}
																								} catch (exception) {
																										logger.error(exception.message);
																								}
																							}
																							releasecallback();
																						} catch (exception) {
																								logger.error(exception.message);
																						}
																					});
																					responsedata.projectDetails.push(eachProjectDetail);
																				} catch (exception) {
																						logger.error(exception.message);
																				}
																			});
																		}
																	});
																}
															} catch (exception) {
																logger.error(exception.message);
															}
														}
													});
												}
											} catch (exception) {
												logger.error(exception.message);
											}
										}
									});
								} catch (exception) {
									logger.error(exception.message);
								}
							} else if (idtypes[eachid] == 'cycledetails') {
								responsedata = {
									testsuiteIds: [],
									testsuiteNames: []
								};
								queryExecutor(requestedid, "cycledetails", "subquery",
									function (error, response) {
									if (error) {
										try {
											logger.error("Error occurred in getDetails_ICE_cycledetails");
											res.send("Error in getDetails_ICE_cycledetails : Fail");
										} catch (exception) {
											logger.error(exception.message);
										}
									} else {
										async.forEachSeries(response, function (eachtestSuiteDetails, testsuiteCallback) {
											try {
												responsedata.testsuiteIds.push(eachtestSuiteDetails.testsuiteid);
												responsedata.testsuiteNames.push(eachtestSuiteDetails.testsuitename);
												testsuiteCallback();
											} catch (exception) {
												logger.error(exception.message);
											}
										});
										finalDataReturn();
									}
								});

							} else {
								try {
									res.send("fail");
								} catch (exception) {
									logger.error(exception.message);
								}
							}
						}
					} catch (exception) {
						logger.error(exception.message);
					}
				} else {
					try {
						res.send("fail");
					} catch (exception) {
						logger.error(exception.message);
					}
				}
				function queryExecutor(id, query, subquery, queryExecutorcallback) {
					logger.info('Inside function queryExecutor');
					var inputs = {
						"id": id,
						"query": query,
						"subquery": subquery
					};
					var args = {
						data: inputs,
						headers: {
							"Content-Type": "application/json"
						}
					};
					logger.info("Calling NDAC Service from queryExecutor: admin/getDetails_ICE");
					client.post(epurl + "admin/getDetails_ICE", args,
						function (queryStringresult, response) {
						try {
							if (response.statusCode != 200 || queryStringresult.rows == "fail") {
								var statusFlag = "Error occurred in queryExecutor : Fail";
								logger.error("Error occurred in getDetails_ICE Error Code : ERRNDAC");
								queryExecutorcallback(statusFlag, null);
							} else {
								index = index + 1;
								queryExecutorcallback(null, queryStringresult.rows);
							}
						} catch (exception) {
							logger.error(exception.message);
						}
					});
				}

				function finalDataReturn() {
					try {
						res.send(responsedata);
					} catch (exception) {
						logger.error(exception.message);
					}
				}
			} else {
				logger.info("Invalid Session");
				res.send("Invalid Session");
			}
		} catch (exception) {
				logger.error(exception.message);
		}
	} else {
		res.send('fail');
	}
};

//Save Assigned Projects
exports.assignProjects_ICE = function (req, res) {
	logger.info("Inside UI Service: assignProjects_ICE");
	try {
		if (utils.isSessionActive(req)) {
			var assignProjectsDetails = req.body.assignProjectsObj;
			var projectDetails = assignProjectsDetails.assignedProjects;
			var projectIds = [];
			var alreadyassigned = false;
			for (var i = 0; i < projectDetails.length; i++) {
				projectIds.push(projectDetails[i].projectId);
			}
			var inputs = {};
			validateAssignProjects();
			var valid_domainId, valid_objects, valid_userId;
			function validateAssignProjects() {
				logger.info("Inside function validateAssignProjects");
				var check_domainId = validator.isEmpty(assignProjectsDetails.domainId);
				if (check_domainId == false) {
					valid_domainId = true;
				}
				var check_userid = validator.isUUID(assignProjectsDetails.userId);
				if (check_userid == true) {
					valid_userId = true;
				}
				var check_userInfo = validator.isJSON(JSON.stringify(assignProjectsDetails.userInfo));
				var check_assignProjectDetails = validator.isJSON(JSON.stringify(assignProjectsDetails.userInfo));
				if (check_userInfo == true && check_assignProjectDetails == true) {
					valid_objects = true;
				}

			}

			if (assignProjectsDetails.getAssignedProjectsLen > 0) {
				alreadyassigned = true;
				inputs = {
					"alreadyassigned": alreadyassigned,
					"userid": assignProjectsDetails.userId,
					"domainid": assignProjectsDetails.domainId,
					"modifiedbyrole": assignProjectsDetails.userInfo.role,
					"modifiedby": assignProjectsDetails.userInfo.username.toLowerCase(),
					"projectids": projectIds
				};
			} else {
				inputs = {
					"alreadyassigned": alreadyassigned,
					"userid": assignProjectsDetails.userId,
					"domainid": assignProjectsDetails.domainId,
					"createdby": assignProjectsDetails.userInfo.username.toLowerCase(),
					"projectids": projectIds
				};
			}
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			if (valid_domainId == true && valid_userId == true && valid_objects == true) {
				logger.info("Calling NDAC Service : admin/assignProjects_ICE");
				client.post(epurl + "admin/assignProjects_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in admin/assignProjects_ICE Error Code : ERRNDAC");
						res.send("fail");
					} else {
                        inputs.projectids1 = "'"+inputs.projectids.join('\',\'')+"'";
                        //Execute neo4j query!!
                        var qList=[];
                        /*qList.push({"statement":"MERGE (n:ICEPERMISSIONS_NG {userid:'"+inputs.userid+
                                    "',domainid:'"+inputs.domainid+"'}) set n.projectids=["+inputs.projectids1+"] return n"});*/
                        //Relationships
                        /*qList.push({"statement":"MATCH (a:ICEPERMISSIONS_NG{userid:'"+inputs.userid+
                                    "',domainid:'"+inputs.domainid+"'}),(b:DOMAINS_NG {domainid:'"+
                                    inputs.domainid+"'}) MERGE(a)-[r:FICETDOM_NG{id:'"+inputs.domainid+"'}]->(b) return a,r,b"});*/

						// MATCH p = (a:DOMAINS_NG{userid:'bced8722-1ce1-41e0-b7d3-d9a9c0bcd800'})-[r1]->(d:DOMAINS_NG) return p
						
						// if length of unassigned projects > 0 then delete tasks of that project
						if(assignProjectsDetails.deletetasksofprojects.length > 0){
							assignProjectsDetails.deletetasksofprojects.forEach(function(e,i){
								qList.push({"statement":"match p = (m{projectID:'"+e.projectid+"'})-[FNTT]-(t:TASKS{assignedTo:'"+assignProjectsDetails.userId+"'}) where t.status = 'assigned' or t.status = 'inprogress' or t.status = 'reassign' detach delete t;"});
								qList.push({"statement":"match p = (m{projectID:'"+e.projectid+"'})-[FNTT]-(t:TASKS{reviewer:'"+assignProjectsDetails.userId+"'}) where t.status = 'review' detach delete t;"});
								qList.push({"statement":"match p = (m{projectID:'"+e.projectid+"'})-[FNTT]-(t:TASKS{assignedTo:'"+assignProjectsDetails.userId+"'}) set m.assignedTo = '' "});
								qList.push({"statement":"match p = (m{projectID:'"+e.projectid+"'})-[FNTT]-(t:TASKS{reviewer:'"+assignProjectsDetails.userId+"'}) set m.reviewer = '' "});
							});
						}

						logger.info("Calling neo4jAPI execute queries for assignProjects_ICE");
                        neo4jAPI.executeQueries(qList,function(status,result){
                            if(status!=200){
                           		logger.info("Error in neo4jAPI execute queries with status for assignProjects_ICE: %d",status,"\n response for assignProjects_ICE:%s",result);
                            }
                            else{
                                logger.info('neo4jAPI execute queries for assignProjects_ICE executed successfully');
                                res.send("success");
                            }
                        });
					}
				});
			} else {
				res.send('fail');
			}
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

//get Assigned Projects
exports.getAssignedProjects_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: getAssignedProjects_ICE");
		if (utils.isSessionActive(req)) {
			var requestDetails = req.body.getAssignProj;
			var assignedProjectIds = [];
			var assignedProjObj = [];
			var inputs = {
				"query": "projectid",
				"domainid": requestDetails.domainId,
				"userid": requestDetails.userId
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service : admin/getAssignedProjects_ICE");
			client.post(epurl + "admin/getAssignedProjects_ICE", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in admin/getAssignedProjects_ICE Error Code : ERRNDAC");
						res.send("fail");
					} else {
						for (var i = 0; i < result.rows.length; i++) {
							assignedProjectIds = result.rows[i].projectids;
						}
						async.forEachSeries(assignedProjectIds, function (iterator, assignProjectCallback) {
							try {
								var inputs = {
									"query": "projectname",
									"projectid": iterator
								};
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								logger.info("Calling NDAC Service : admin/getAssignedProjects_ICE inside async function");
								client.post(epurl + "admin/getAssignedProjects_ICE", args,
									function (result, response) {
									try {
										if (response.statusCode != 200 || result.rows == "fail") {
											logger.error("Error occurred in admin/getAssignedProjects_ICE inside async function Error Code : ERRNDAC");
											res.send("fail");
										} else {
											if (result.rows.length > 0) {
												var assignedProjects = {};
												assignedProjects.projectId = iterator;
												assignedProjects.projectName = result.rows[0].projectname;
												assignedProjObj.push(assignedProjects);
											}
											assignProjectCallback();
										}
									} catch (exception) {
										logger.error(exception.message);
										res.send("fail");
									}
								});
							} catch (exception) {
								logger.error(exception.message);
								res.send("fail");
							}
						}, finalfunction);

					}
					function finalfunction() {
						logger.info('Assigned projects fetched successfully');
						res.send(assignedProjObj);
					}
				} catch (exception) {
					logger.error(exception.message);
					res.send("fail");
				}
			});
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.getAvailablePlugins = function (req, res) {
	logger.info("Inside UI service: getAvailablePlugins");
	try {
		if (utils.isSessionActive(req)) {
			client.post(epurl + "admin/getAvailablePlugins",
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					res.send("fail");
				} else {
					res.send(result.rows);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Error occurred in admin/getAvailablePlugins:", exception);
		res.send("fail");
	}
};

//Generate Token for CI User
exports.generateCIusertokens = function (req, res) {
	logger.info("Inside UI service: generateCIusertokens");
	try {
		if (utils.isSessionActive(req)) {
			var requestDetails = req.body.generatetoken;
			const tokgen2 = new TokenGenerator(256, TokenGenerator.BASE62);
			var token=tokgen2.generate()
			var salt = bcrypt.genSaltSync(10);
			var inputs = {
				user_id: requestDetails.userId,
				expiry: requestDetails.expiry,
				tokenname: requestDetails.tokenname,
				token: bcrypt.hashSync(token, salt)
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service : admin/generateCIusertokens");
			client.post(epurl + "admin/generateCIusertokens",args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					res.send("fail");
				} else if (response.statusCode != 200 || result.rows == "duplicate"){
					res.send("duplicate")
				}else {
					res.send(token);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Error occurred in admin/generateCIusertokens:", exception);
		res.status(500).send("fail");
	}
};

//Fetch CI User details
exports.getCIUsersDetails = function(req,res){
	logger.info("Inside UI Service: getCIUsersDetails");
	try {
		if (utils.isSessionActive(req)) {
			var requestDetails = req.body.generatetoken;
			var inputs = {
				user_id: requestDetails.userId
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service : admin/getCIUsersDetails");
			client.post(epurl + "admin/getCIUsersDetails",args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					res.send("fail");
				} else {
					res.send(result.rows);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Error occurred in admin/getCIUsersDetails:", exception);
		res.status(500).send("fail");
	}
};

//Deactivate CI User Token 
exports.deactivateCIUser = function (req,res){
	logger.info("Inside UI Service: deactivateCIUser");
	try {
		if (utils.isSessionActive(req)) {
			var requestDetails = req.body.CIUser;
			var inputs = {
				user_id: requestDetails.userId,
				tokenname: requestDetails.tokenName
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service : admin/deactivateCIUser");
			client.post(epurl + "admin/deactivateCIUser",args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					res.send("fail");
				}
				else {
					res.send(result.rows);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Error occurred in admin/getCIUsersDetails:", exception);
		res.status(500).send("fail");
	}
};

exports.testLDAPConnection = function(req, res){
	logger.info("Inside UI Service: testLDAPConnection");
	try{
		if (utils.isSessionActive(req)) {
			var reqData = req.body;
			var ldapURL = (reqData.ldapURL || "").trim();
			if (ldapURL.slice(0,8) == "ldaps://") {
				logger.error("Error occurred in admin/testLDAPConnection: 'ldaps' protocol is not supported.");
				res.send("invalid_url_protocol");
			} else if (ldapURL.slice(0,7) != "ldap://") {
				logger.error("Error occurred in admin/testLDAPConnection: Invalid URL provided for connection test.");
				res.send("invalid_url");
			}
			var baseDN = (reqData.baseDN || "").trim();
			var authUser = (reqData.username || "").trim();
			var authKey = (reqData.password || "").trim();
			var authType = reqData.authType;
			var adConfig = {
				url: ldapURL,
				baseDN: baseDN
			};
			if (authType == "simple") {
				adConfig.bindDN = authUser;
				adConfig.bindCredentials = authKey;
			}
			var ad = new activeDirectory(adConfig);
			var resSent = false;
			ad.find("cn=*", function (err, result) {
				if (resSent) return;
				resSent = !resSent;
				var flag = "success";
				var data = {fields:{}};
				if (err) {
					if (err.errno == "EADDRNOTAVAIL" || err.errno == "ECONNREFUSED" || err.errno == "ETIMEDOUT") flag = "invalid_addr";
					else if (err.errno == "INSUFFICIENT_ACCESS_RIGHTS") {
						if (authType == "simple") flag = "insufficient_access";
						else flag = "success";
					} else if (err.lde_message) {
						if (err.lde_message.indexOf("DSID-0C0906E8") > -1) {
							if (authType == "simple") flag = "insufficient_access";
							else flag = "invalid_auth";
						} else if (err.lde_message.indexOf("DSID-031522C9") > -1) {
							flag = "insufficient_access";
							logger.error("User Does not have sufficient Access!");
						} else if (((err.lde_message.indexOf("DSID-0C0903A9") > -1) || (err.lde_message.indexOf("DSID-0C090400") > -1)) && authType == "simple") flag = "invalid_credentials";
						else if (err.lde_message.indexOf("DSID-031007DB") > -1) flag = "invalid_basedn";
					}
					else flag = "fail";
					logger.debug("Error occurred in admin/testLDAPConnection: " + JSON.stringify(err));
				}
				if (flag == "success") {
					logger.info('LDAP Connection test passed!');
					if (result && result.users && result.users.length>0) data.fields = Object.keys(result.users[0]);
				} else {
					logger.error('LDAP Connection test failed!');
				}
				data.flag = flag;
				return res.send(data);
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception){
		if (exception.name == "InvalidDistinguishedNameError") {
			res.send("invalid_basedn");
			logger.error('LDAP Connection test failed!');
		} else {
			logger.error("Error occurred in admin/testLDAPConnection", exception);
			res.status(500).send("fail");
		}
	}
};

exports.manageLDAPConfig = function(req, res){
	logger.info("Inside UI Service: manageLDAPConfig");
	try{
		if (utils.isSessionActive(req)) {
			var flag = ['1','0','0','0','0','0','0','0','0'];
			var reqData = req.body.conf;
			var action = req.body.action;
			var inputs = {};
			inputs.action = action;
			inputs.name = (reqData.name || "").trim();
			if (validator.isEmpty(action) || ["create","update","delete"].indexOf(action) == -1) {
				logger.error("Error occurred in admin/manageLDAPConfig: Invalid action.");
				flag[1] = '1';
			}
			if (validator.isEmpty(inputs.name)) {
				logger.error("Error occurred in admin/manageLDAPConfig: LDAP Server Name cannot be empty.");
				flag[2] = '1';
			}
			if  (action != "delete") {
				inputs.ldapURL = (reqData.ldapURL || "").trim();
				inputs.baseDN = (reqData.baseDN || "").trim();
				inputs.authType = reqData.authType;
				inputs.fieldMap = reqData.fieldMap || {};
				if (validator.isEmpty(inputs.ldapURL)) {
					logger.error("Error occurred in admin/manageLDAPConfig: LDAP Server URL cannot be empty.");
					flag[3] = '1';
				} else if (inputs.ldapURL.slice(0,8) == "ldaps://") {
					logger.error("Error occurred in admin/manageLDAPConfig: 'ldaps' protocol is not supported.");
					flag[3] = '2';
				} else if (inputs.ldapURL.slice(0,7) != "ldap://") {
					logger.error("Error occurred in admin/manageLDAPConfig: Invalid URL provided for connection test.");
					flag[3] = '3';
				}
				if (validator.isEmpty(inputs.baseDN)) {
					logger.error("Error occurred in admin/manageLDAPConfig: Invalid Base Domain Name.");
					flag[4] = '1';
				}
				if (validator.isEmpty(inputs.authType)) {
					logger.error("Error occurred in admin/manageLDAPConfig: Invalid Authentication Protocol.");
					flag[5] = '1';
				}
				if (inputs.authType == "simple") {
					inputs.authUser = (reqData.authUser || "").trim();
					inputs.authKey = (reqData.authKey || "").trim();
					if (validator.isEmpty(inputs.authUser)) {
						logger.error("Error occurred in admin/manageLDAPConfig: Invalid Bind Domain Name.");
						flag[6] = '1';
					}
					if (validator.isEmpty(inputs.authKey)) {
						if (action == "create") {
							logger.error("Error occurred in admin/manageLDAPConfig: Invalid Bind Credentials.");
							flag[7] = '1';
						} else {
							delete inputs.authKey;
						}
					}
				}
				if (!inputs.fieldMap.uName || !inputs.fieldMap.fName || !inputs.fieldMap.lName || !inputs.fieldMap.email) {
					logger.error("Error occurred in admin/manageLDAPConfig: Invalid Field Map.");
					flag[8] = '1';
				} else inputs.fieldMap = JSON.stringify(inputs.fieldMap);
			}
			flag = flag.join('');
			if (flag != "100000000") {
				return res.send(flag);
			}
			logger.info("Calling NDAC Service: manageLDAPConfig");
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/manageLDAPConfig", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in admin/manageLDAPConfig Error Code : ERRNDAC");
					res.status(500).send("fail");
				} else {
					return res.send(result.rows);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception){
		logger.error("Error occurred in admin/manageLDAPConfig", exception);
		res.status(500).send("fail");
	}
};

exports.getLDAPConfig = function(req, res){
	logger.info("Inside UI Service: getLDAPConfig");
	try{
		if (utils.isSessionActive(req)) {
			var action = req.body.action;
			var name = req.body.args;
			var opts = (req.body.opts || "").trim();
			logger.info("Calling NDAC Service: getLDAPConfig");
			var inputs = {};
			if (action != "server") inputs.name = name;
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/getLDAPConfig", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in admin/getLDAPConfig Error Code : ERRNDAC");
					res.status(500).send("fail");
				} else if (result.rows.length == 0) {
					res.send("empty");
				} else {
					var data;
					if (action != "server") {
						result = result.rows[0];
						var bindCredentials = result.bind_credentials;
						data = {
							url: result.url,
							baseDN: result.base_dn,
							authType: result.authtype,
							bindDN: result.bind_dn,
							bindCredentials: '',
							fieldMap: JSON.parse(result.fieldmap)
						};
						if (action == "config") return res.send(data);
						if (action == "user") {
							var adConfig = {
								url: data.url,
								baseDN: data.baseDN
							};
							if (data.authType == "simple") {
								adConfig.bindDN = data.bindDN;
								adConfig.bindCredentials = bindCredentials;
							}
							var dataMaps = data.fieldMap;
							var filter = dataMaps.uName;
							var ad = new activeDirectory(adConfig);
							if (opts.length > 0) {
								var resSent = false;
								ad.findUser(opts, function (err, result) {
									if (resSent) return;
									resSent = !resSent;
									if (err) {
										if (err.lde_message.indexOf("DSID-031522C9") > -1) {
											logger.error("Error occurred in admin/getLDAPConfig: Fetch User Details: Insufficient Access");
											data = "insufficient_access";
										} else {
											logger.error("Error occurred in admin/getLDAPConfig: Fetch User Details:", err.lde_message);
											logger.debug("ERROR: " + JSON.stringify(err));
											data = "server_error";
										}
									}
									if (result) {
										data = {
											username: result[filter],
											firstname: result[dataMaps.fName],
											lastname: result[dataMaps.lName],
											email: result[dataMaps.email],
											ldapname: result.dn
										};
									} else {
										logger.error("Error occurred in admin/getLDAPConfig: Fetch User Details: User not Found");
										data = "empty";
									}
									return res.send(data);
								});
							} else {
								var resSent = false;
								ad.find(filter+"=*", function (err, result) {
									if (resSent) return;
									resSent = !resSent;
									if (err) {
										if (err.lde_message.indexOf("DSID-031522C9") > -1) {
											logger.error("Error occurred in admin/getLDAPConfig: Fetch Users: Insufficient Access");
											data = "insufficient_access";
										} else {
											logger.error("Error occurred in admin/getLDAPConfig: Fetch Users:", err.lde_message);
											logger.debug("ERROR: " + JSON.stringify(err));
											data = "server_error";
										}
									}
									if (result) {
										var groups = result.groups;
										var others = result.other;
										groups.forEach(function(e) {
											logger.info("Group '%s' found in base domain '%s'", e.dn, adConfig.baseDN);
										});
										others.forEach(function(e) {
											logger.info("Unknown entry '%s' found in base domain '%s'", e.dn, adConfig.baseDN);
										});
										var users = result.users;
										data = [];
										for (var i = 0; i < users.length; i++) {
											data.push([users[i].cn, users[i].dn]);
										}
									} else {
										logger.error("Error occurred in admin/getLDAPConfig: Fetch Users: No users Found");
										data = "empty";
									}
									return res.send(data);
								});
							}
						}
					}
					else {
						data = [];
						for(var i = 0; i < result.rows.length; i++) {
							data.push(result.rows[i].servername);
						}
						return res.send(data);
					}
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception){
		logger.error("Error occurred in admin/getLDAPConfig", exception);
		res.status(500).send("fail");
	}
};

exports.manageSessionData = function (req, res) {
	logger.info("Inside UI service: manageSessionData");
	try {
		if (utils.isSessionActive(req)) {
			var currUser = req.session.username;
			var action = req.body.action;
			var user = req.body.user;
			var key = req.body.key;
			var data = {sessionData: [], clientData: []};
			if (action == "get") {
				logger.info("Inside UI service: manageSessionData/getSessions");
				utils.getSocketList("ICE", function(connectusers) {
					connectusers.forEach(function(e) {
						data.clientData.push({
							username: e[0],
							mode: e[1],
							ip: e[2]
						});
					});
					utils.allSess(function(err, sessions){
						if (err) {
							logger.error("Error occurred in admin/manageSessionData");
							logger.debug(err);
						} else {
							sessions.forEach(function(e) {
								if (currUser != e.username) {
									data.sessionData.push({
										username: e.username,
										id: Buffer.from(e.uniqueId).toString("base64"),
										role: e.activeRole,
										loggedin: (new Date(e.loggedin)).toLocaleString(),
										ip: e.ip
									});
								}
							});
						}
						return res.send(data);
					});
				});
			} else if (action == "logout" || action == "disconnect") {
				logger.info("Inside UI service: manageSessionData/"+action);
				if (action == "logout") key = Buffer.from(req.body.key, "base64").toString();
				var d2s = {"action":action, "key":key, "user":user, "cmdBy":currUser};
				utils.delSession(d2s, function(err){
					if (err) {
						logger.error("Error occurred in admin/manageSessionData: Fail to "+action+" "+user);
						logger.debug(err);
						return res.status(500).send("fail");
					} else return res.send("success");
				});
			}
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Error occurred in admin/manageSessionData:",exception);
		res.status(500).send("fail");
	}
};
