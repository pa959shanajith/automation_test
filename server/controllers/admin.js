/**
 * Dependencies.
 */
var bcrypt = require('bcrypt');
var async = require('async');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = "http://127.0.0.1:1990/";
var roles = [];
var r_ids = [];
var userRoles = {};
var validator =  require('validator');
var qList = [];
var neo4jAPI = require('../controllers/neo4jAPI');
var logger = require('../../logger');
//GetUserRoles
exports.getUserRoles_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI service: getUserRoles_Nineteen68");
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			logger.info("Calling NDAC Service: getUserRoles_Nineteen68");
			client.post(epurl + "admin/getUserRoles_Nineteen68",
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in getUserRoles_Nineteen68 Error Code : ERRNDAC");
					res.send("fail");
				} else {
					try {
						for (var i = 0; i < result.rows.length; i++) {
							roles[i] = result.rows[i].rolename;
							r_ids[i] = result.rows[i].roleid;
						}
						userRoles.userRoles = roles;
						userRoles.r_ids = r_ids;
						logger.info("User Roles fetched successfully");
						res.send(userRoles);
					} catch (exception) {
						logger.error(exception);
						res.send("fail");
					}
				}
			});
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception);
		res.send("fail");
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
			logger.error("Error occured in getRoleNameByRoleId_Nineteen68 Error Code : ERRNDAC");
			res(null, "fail");getUserRoles_Nineteen68
		} else {
			inputs = {
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
					logger.error("Error occured in getUsers_Nineteen68 Error Code : ERRNDAC");
					res(null, "fail");
				} else {
					logger.info("Users fetched successfully");
					res(null, getUsers);
				}
			});
		}
	});
};

//Get All Users
exports.getAllUsers_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI service: getAllUsers_Nineteen68");
		var checkAction = validator.isEmpty(req.body.action);
		if(checkAction == false) {
			if (req.cookies['connect.sid'] != undefined) {
				var sessionCookie = req.cookies['connect.sid'].split(".");
				var sessionToken = sessionCookie[0].split(":");
				sessionToken = sessionToken[1];
			}
			if (sessionToken != undefined && req.session.id == sessionToken) {
				var user_names = [];
				var userIds = [];
				var d_role = [];
				var userDetails = {
					user_names: [],
					userIds: [],
					d_roles: []
				};
				var args = {
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service: getAllUsers_Nineteen68");
				client.post(epurl + "admin/getAllUsers_Nineteen68", args,
					function (allusersresult, allusersresponse) {
					if (allusersresponse.statusCode != 200 || allusersresult.rows == "fail") {
					logger.error("Error occured in getAllUsers_Nineteen68 Error Code : ERRNDAC");
						res(null, "fail");
					} else {
						for (var i = 0; i < allusersresult.rows.length; i++) {
							user_names[i] = allusersresult.rows[i].username.toLowerCase();
							userIds[i] = allusersresult.rows[i].userid;
							d_role[i] = allusersresult.rows[i].defaultrole;
						}
						userDetails.userIds = userIds;
						userDetails.user_names = user_names;
						userDetails.d_roles = d_role;
						logger.info("Users fetched successfully");
						res.send(userDetails);
					}
				});
			} else {
				logger.info("Invalid Session");
				res.send("Invalid Session");
			}
		} else{
				res.send("fail");
		}
	} catch (exception) {
		logger.error(exception);
		res.send("fail");
	}
};

//Get Users for Edit
exports.getEditUsersInfo_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI service: getEditUsersInfo_Nineteen68");
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var requestedUserName = req.body.userName;
			var requestedUserId = req.body.userId;
			var userDetails = {};
			var inputs = {
				"userid": requestedUserId
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service: getUserData_Nineteen68");
			client.post(epurl + "admin/getUserData_Nineteen68", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						res.send(null,"fail");
					} else {
						result.rows.forEach(function (iterator) {
							userDetails.userName = iterator.username.toLowerCase();
							userDetails.roleId = iterator.defaultrole;
							userDetails.additionalroles = iterator.additionalroles;
							userDetails.emailId = iterator.emailid;
							userDetails.firstName = iterator.firstname;
							userDetails.lastName = iterator.lastname;
							userDetails.ldapuser = iterator.ldapuser;
						});
						logger.info("User Details fetched successfully");
						res.send(userDetails);
					}
				} catch (exception) {
					logger.error(exception);
					res.send(flag);
				}
			});
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception);
	}
};

//CreateUser
exports.createUser_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI service: createUser_Nineteen68");
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var flag = "fail";
			var status = false;
			var req_username = req.body.createUser.username.toLowerCase();
			var req_password = req.body.createUser.password;
			var req_firstname = req.body.createUser.firstName;
			var req_lastname = req.body.createUser.lastName;
			var req_ldapuser = req.body.createUser.ldapUser;
			var req_defaultRole = req.body.createUser.role;
			var req_email_id = req.body.createUser.email;
			var salt = bcrypt.genSaltSync(10);
			var req_hashedPassword = bcrypt.hashSync(req_password, salt);

			validateCreateUser();

			function validateCreateUser() {
				logger.info("Inside validateCreateUser function");
				check_username = validator.isEmpty(req_username);
				check_usernameLen = validator.isLength(req_username, 1, 50);
				if (check_username == false && check_usernameLen == true) {
					valid_username = true;
				}
				check_password = validator.isEmpty(req_password);
				check_passwordLen = validator.isLength(req_password, 1, 12);
				if (check_password == false && check_passwordLen == true) {
					valid_password = true;
				}
				check_firstname = validator.isEmpty(req_firstname);
				check_firstnameLen = validator.isLength(req_firstname, 1, 12);
				check_firstnamePattern = validator.isAlpha(req_firstname);
				if (check_firstname == false && check_firstnameLen == true && check_firstnamePattern == true) {
					valid_firstname = true;
				}
				check_lastname = validator.isEmpty(req_lastname);
				check_lastnameLen = validator.isLength(req_lastname, 1, 12);
				check_lastnamePattern = validator.isAlpha(req_lastname);
				if (check_lastname == false && check_lastnameLen == true && check_lastnamePattern == true) {
					valid_lastname = true;
				}
				check_ldapuser = validator.isEmpty(req_ldapuser.toString());
				if (check_ldapuser == false) {
					valid_ldapuser = true;
				}
				check_defaultRole = validator.isUUID(req_defaultRole);
				if (check_defaultRole == true) {
					valid_defaultRole = true;
				}
				check_email_id = validator.isEmail(req_email_id);
				check_emailLen = validator.isLength(req_email_id, 1, 50);
				if (check_email_id == true && check_emailLen == true) {
					valid_email_id = true;
				}
				var salt = bcrypt.genSaltSync(10);
				check_hashedPassword = validator.isEmpty(bcrypt.hashSync(req_password, salt));
				if (check_hashedPassword == false) {
					valid_hashedPassword = true;
				}
			}

			var inputs = {
				"query": "allusernames"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			if (valid_username == true && valid_password == true && valid_firstname == true && valid_lastname == true && valid_ldapuser == true && valid_defaultRole == true && valid_email_id == true && valid_hashedPassword == true) {
				logger.info("Calling NDAC Service: createUser_Nineteen68");
				client.post(epurl + "admin/createUser_Nineteen68", args,
					function (userNameresult, response) {
					if (response.statusCode != 200 || userNameresult.rows == "fail") {
						logger.error("Error occured in createUser_Nineteen68 Error Code : ERRNDAC");
						res.send("fail");
					} else {
						try {
							for (var i = 0; i < userNameresult.rows.length; i++) {
								dbResult = userNameresult.rows[i];
								if (req_username.toLowerCase() === dbResult.username.toLowerCase()) {
									status = true;
									break;
								}
							}
							if (req_ldapuser) {
								req_hashedPassword = "null";
							}
							if (status === false) {
								var inputs = {
									"query": "createuser",
									"createdby": req_username,
									"defaultrole": req_defaultRole,
									"emailid": req_email_id,
									"firstname": req_firstname,
									"lastname": req_lastname,
									"ldapuser": req_ldapuser,
									"password": req_hashedPassword,
									"username": req_username
								};
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								logger.info("Calling NDAC Service: createUser_Nineteen68");
								client.post(epurl + "admin/createUser_Nineteen68", args,
									function (result, response) {
									try {
										flag = "Success";
										logger.info("User created successfully");
										res.send(flag);
									} catch (exception) {
										logger.error(exception);
										res.send(flag);
									}
								});
							} else {
								flag = "User Exists";
								logger.info("User already exists");
								res.send(flag);
							}
						} catch (exception) {
							logger.error(exception);
							res.send(flag);
						}
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
		logger.error(exception);
		res.send("fail");
	}
};

//Edit User
exports.updateUser_nineteen68 = function updateUser_nineteen68(req, res) {
	try {
		logger.info("Inside UI service: updateUser_nineteen68");
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var flag = "fail";
			var status = false;
			var userdetails = req.body.userinfo;
			var userObj = req.body.updateUserObj;
			var local_username = userObj.userName.toLowerCase();
			//needs to be sent from front end further on
			var local_additionalroles = userObj.additionalRole;
			var local_password = userObj.passWord;
			var local_firstname = userObj.firstName;
			var local_lastname = userObj.lastName;
			var local_role;
			//var local_role = userObj.role;
			var local_email_id = userObj.email;
			var local_user_Id = userObj.userId;
			var db_password = '';
			if (local_password != "") {
				var salt = bcrypt.genSaltSync(10);
				var req_hashedPassword = bcrypt.hashSync(local_password, salt);
			}
			validateUpdateUser();
			function validateUpdateUser() {
				logger.info("Inside validateUpdateUser function");
				check_username = validator.isEmpty(local_username);
				check_usernameLen = validator.isLength(local_username, 1, 50);
				if (check_username == false && check_usernameLen == true) {
					valid_username = true;
				}
				if (local_password != "") {
					check_password = validator.isEmpty(local_password);
					check_passwordLen = validator.isLength(local_password, 1, 12);
					if (check_password == false && check_passwordLen == true) {
						valid_password = true;
					} else {
						valid_password = false;
					}
				} else {
					if (local_password == "") {
						valid_password = true;
					}
				}
				check_firstname = validator.isEmpty(local_firstname);
				check_firstnameLen = validator.isLength(local_firstname, 1, 12);
				check_firstnamePattern = validator.isAlpha(local_firstname);
				if (check_firstname == false && check_firstnameLen == true && check_firstnamePattern == true) {
					valid_firstname = true;
				}
				check_lastname = validator.isEmpty(local_lastname);
				check_lastnameLen = validator.isLength(local_lastname, 1, 12);
				check_lastnamePattern = validator.isAlpha(local_lastname);
				if (check_lastname == false && check_lastnameLen == true && check_lastnamePattern == true);{
					valid_lastname = true;
				}
				check_email_id = validator.isEmail(local_email_id);
				check_emailLen = validator.isLength(local_email_id, 1, 50);
				if (check_email_id == true && check_emailLen == true) {
					valid_email_id = true;
				}

			}
			var inputs = {
				"userid": local_user_Id
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			if (valid_username == true && valid_password == true && valid_firstname == true && valid_lastname == true && valid_email_id == true) {
				logger.info("Calling NDAC Service: getUserData_Nineteen68");
				client.post(epurl + "admin/getUserData_Nineteen68", args,
					function (result, response) {
					try {
						if (response.statusCode != 200 || result.rows == "fail") {
							var flag = "fail";
							logger.error("Error occured in getUserData_Nineteen68 Error Code : ERRNDAC");
							res.send(flag);
						} else {
							service = result.rows[0];
							if (local_username == undefined || local_username == 'undefined' || local_username == '') {
								local_username = service.username.toLowerCase();
							}
							if (local_password.trim().length == 0) {
								db_password = "existing";
							} else {
								var salt = bcrypt.genSaltSync(10);
								var req_hashedPassword = bcrypt.hashSync(local_password, salt);
							}
							if (local_firstname == undefined || local_firstname == 'undefined' || local_firstname == '') {
								local_firstname = service.firstname;
							}
							if (local_lastname == undefined || local_lastname == 'undefined' || local_lastname == '') {
								local_lastname = service.lastname;
							}

							if (local_role == undefined || local_role == 'undefined' || local_role == '') {
								local_role = service.role;
							}
							// if(local_additionalroles == undefined || local_additionalroles == 'undefined' || local_additionalroles == ''){
							//     local_additionalroles = service.additionalroles;
							// }
							if (local_email_id == undefined || local_email_id == 'undefined' || local_email_id == '') {
								local_email_id = service.emailid;
							}
							if (result.rows[0].ldapuser != null || result.rows[0].ldapuser != undefined) {
								if (result.rows[0].ldapuser) {
									db_password = null;
									req_hashedPassword = null;
								}
							}
							var inputs = {
								"userid": local_user_Id,
								"additionalroles": local_additionalroles,
								"deactivated": false,
								"emailid": local_email_id,
								"firstname": local_firstname,
								"lastname": local_lastname,
								"ldapuser": result.rows[0].ldapuser,
								"modifiedby": userdetails.username.toLowerCase(),
								"modifiedbyrole": userdetails.role,
								"password": req_hashedPassword,
								"username": local_username
							};
							if (db_password != "" && db_password != undefined) {
								inputs.password = db_password;
							}
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							logger.info("Calling NDAC Service: updateUser_Nineteen68");
							client.post(epurl + "admin/updateUser_Nineteen68", args,
								function (result, response) {
								try {
									if (response.statusCode != 200 || result.rows == "fail") {
										var flag = "fail";
										res.send(flag);
									} else {
										flag = "success";
										logger.info("User updated successfully");
										res.send(flag);
									}
								} catch (exception) {
									logger.error(exception);
									res.send(flag);
								}
							});
						}
					} catch (exception) {
						logger.error(exception);
						res.send(flag);
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
		logger.error(exception);
		res.send("fail");
	}
};

//Get Domains
exports.getDomains_ICE = function getDomains_ICE(req, res) {
	logger.info("Inside UI service: getDomains_ICE");
	var checkAction = validator.isEmpty(req.body.action);

	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var responsedata = [];
			var args = {
				headers: {
					"Content-Type": "application/json"
				}
			};
			if (checkAction == false) {
					logger.info("Calling NDAC Service: getDomains_ICE");
				client.post(epurl + "admin/getDomains_ICE", args,
					function (result, response) {
					try {
						if (response.statusCode != 200 || result.rows == "fail") {
							logger.error("Error occured in getDomains_ICE Error Code : ERRNDAC");
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
									logger.error(exception);
								}
							}, finalresult);
						}
					} catch (exception) {
					logger.error(exception);
					}
				});
			} else {
				res.send("fail");
			}
			function finalresult() {
				logger.info("Domains fetched successfully");
				res.send(responsedata);
			}
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception);
		res.send("fail");
	}
};

exports.createProject_ICE = function createProject_ICE(req, res) {
    qList = [];
	try {
		logger.info("Inside UI service: createProject_ICE");
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var createProjectObj = req.body.createProjectObj;
			var userinfo = req.body.userDetails;
			var requestedskucode = "skucodetestcase";
			var requestedtags = "tags";
			var projectTypeId = "";
			var newProjectID = "";
			validateCreateProject();
			function validateCreateProject() {
				logger.info("Inside function validateCreateProject");
				check_domain = validator.isEmpty(createProjectObj.domainId);
				check_domain_type = validator.isUUID(createProjectObj.domainId);
				if (check_domain == false && check_domain_type == true) {
					valid_domain = true;
				}
				check_project = validator.isEmpty(createProjectObj.projectName);
				check_projectLen = validator.isLength(createProjectObj.projectName, 1, 50);
				if (check_project == false && check_projectLen == true) {
					valid_projectName = true;
				}
				check_appType = validator.isEmpty(createProjectObj.appType);
				if (check_appType == false) {
					valid_appType = true;
				}
				check_projectDetails = validator.isJSON(JSON.stringify(createProjectObj.projectDetails));
				check_projectDetailsLen = createProjectObj.projectDetails.length;
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
										logger.error("Error occured in createProject_ICE Error Code : ERRNDAC");
									}
									else {
										projectTypeId = projectTypeData.rows[0].projecttypeid;
									}
									callback();
								} catch (exception) {
									logger.error(exception);
								}
							});
						} catch (exception) {
							logger.error(exception);
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
									logger.error("Error occured in createProject_ICE from createproject Error Code : ERRNDAC");
								} else {
                                    newProjectID = insertProjectData.rows[0].projectid;
                                    //Execute neo4j query!!
                                    //var qList=[];
                                    qList.push({"statement":"MERGE (n:PROJECTS_NG {projectid:'"+newProjectID
                                                +"',domainid:'"+inputs.domainid+"',projectname:'"
                                                +inputs.projectname+"'}) return n"});
                                    //Relationships
                                    qList.push({"statement":"MATCH (a:DOMAINS_NG{domainid:'"+inputs.domainid+"'}),(b:PROJECTS_NG {projectid:'"+newProjectID
                                                +"',domainid:'"+inputs.domainid+"',projectname:'"+inputs.projectname+"'}) MERGE(a)-[r:FDOMTPRJ_NG{id:'"+newProjectID+"'}]->(b) return a,r,b"})
                                    
                                    callback();
                                    
								}
							});
						} catch (exception) {
							logger.error(exception);
						}
					},
					createreleases: function (callback) {
						try {
							var numberOfReleases = createProjectObj.projectDetails;
							var releasesLength = numberOfReleases.length;
							async.forEachSeries(numberOfReleases, function (eachrelease, numberOfReleasescallback) {
								try {
									var releaseDetails = eachrelease;
									var releaseName = releaseDetails.releaseName;
									var cycleNames = releaseDetails.cycleNames;
									var cyclesLength = cycleNames.length;
									var cycleindex = 0;
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
											logger.error("Error occured in createProject_ICE Error Code : ERRNDAC");
										} else {
											newReleaseID = data.rows[0].releaseid;
                                            //Execute neo4j query!! createrelease
                                            //var qList=[];
                                            qList.push({"statement":"MERGE (n:RELEASES_NG {releaseid:'"+newReleaseID
                                                        +"',projectid:'"+inputs.projectid+"',releasename:'"
                                                        +inputs.releasename+"',deleted:'"+false+"'}) return n"});
                                            //Relationships
                                            qList.push({"statement":"MATCH (a:PROJECTS_NG{projectid:'"+inputs.projectid+"'}),(b:RELEASES_NG {releaseid:'"+newReleaseID
                                                        +"',projectid:'"+inputs.projectid+"',releasename:'"
                                                        +inputs.releasename+"',deleted:'"+false+"'}) MERGE(a)-[r:FPRJTREL_NG{id:'"+newReleaseID
                                                        +"'}]->(b) return a,r,b"})														

                                            //qList.push({"statement":"MATCH (c:RELEASES_NG{releaseid:'"+newReleaseID+"'}) return c"})
                                            //qList.push({"statement":"MATCH (c:CYCLES_NG{releaseid:'"+newReleaseID+"'}) return c"})

                                            qList.push({"statement":"MATCH (a:RELEASES_NG{releaseid:'"+newReleaseID
                                                        +"'}),(b:CYCLES_NG {releaseid:'"+newReleaseID
                                                        +"',deleted:'"+false+"'}) MERGE(a)-[r:FRELTCYC_NG{id:b.cycleid}]->(b) return a,r,b"})														
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
															logger.error(exception);
														}
													});
												} catch (exception) {
													logger.error(exception);
												}
											}, numberOfReleasescallback);
										}
									});
								} catch (exception) {
									logger.error(exception);
								}
							}, callback(null, ""));
							logger.info("Project created successfully");
							res.send('success');
						} catch (exception) {
							logger.error(exception);
						}
					}
				}, function (err, data) {
					if (err) {
						logger.error(exception);
					} else {
						logger.info("Calling neo4jAPI execute queries for createProject_ICE");
                        neo4jAPI.executeQueries(qList,function(status,result){
                            if(status!=200){
                               logger.info("Error in neo4jAPI execute queries with status for createProject_ICE: %d",status,"\nresponse for createProject_ICE:Response: %s",result);
                            }
                            else{
								logger.info("neo4jAPI execute queries with status for createProject_ICE: %d",status,"\nresponse for createProject_ICE:Response: %s",result);
                                logger.info('neo4jAPI execute queries for createProject_ICE executed successfully');
                            }
                        });						
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
		logger.error(exception);
	}
};

function createCycle(args, createCycleCallback) {
	logger.info("Inside function createCycle");
	var statusFlag = "";
	var cycleId="";
	logger.info("Calling NDAC Service from createCycle:createProject_ICE");
	client.post(epurl + "admin/createProject_ICE", args,
		function (result, response) {
		try {
			if (response.statusCode != 200 || result.rows == "fail") {
				statusFlag = "Error occured in createCycle of createProject_ICE : Fail";
				logger.error("Error occured in createProject_ICE from createCycle Error Code : ERRNDAC");
				createCycleCallback(statusFlag, null);
			} else {
				newCycleID  = result.rows[0].cycleid;
				//var qList=[];
				qList.push({"statement":"MERGE (n:CYCLES_NG {releaseid:'"+args.data.releaseid
                +"',cyclename:'"+args.data.cyclename+"',cycleid:'"
                +newCycleID+"',deleted:'"+false+"'}) return n"});
				//Relationships
				qList.push({"statement":"MATCH (a:RELEASES_NG{releaseid:'"+args.data.releaseid+"'}),(b:CYCLES_NG {releaseid:'"+args.data.releaseid
                +"',cyclename:'"+args.data.cyclename+"',cycleid:'"
                +newCycleID+"',deleted:'"+false+"'}) MERGE(a)-[r:FRELTCYC_NG{id:'"
                +newCycleID+"'}]->(b) return a,r,b"})														
				
				//statusFlag = "success";
				//createCycleCallback(null, statusFlag);
				createCycleCallback(null, result.rows[0]);
				logger.info("Cycle created for project successfully");
			}
		} catch (exception) {
			logger.error(exception);
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
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var updateProjectDetails = req.body.updateProjectObj;
			var userinfo = req.body.userDetails;
			var requestedskucode = "skucode";
			var requestedtags = "tags";
			var flag = "";
			var requestedprojectid = updateProjectDetails.projectId;
			validateUpdateProject();

			function validateUpdateProject() {
				logger.info("Inside function validateUpdateProject");
				check_project = validator.isEmpty(updateProjectDetails.projectName);
				check_projectId = validator.isUUID(updateProjectDetails.projectId);
				check_projectLen = validator.isLength(updateProjectDetails.projectName, 1, 50);
				if (check_project == false && check_projectLen == true && check_projectId == true) {
					valid_projectName = true;
				}
				check_appType = validator.isEmpty(updateProjectDetails.appType);
				if (check_appType == false) {
					valid_appType = true;
				}
				check_updateProjectDetails = validator.isJSON(JSON.stringify(updateProjectDetails));
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
								if (releaseCreateStatus) {
									try {
										var releaseDetails = eachprojectDetail;
										var releaseName = releaseDetails.releaseName;
										var cycleDetails = releaseDetails.cycleDetails;
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
                                                    qList.push({"statement":"MERGE (n:RELEASES_NG {releaseid:'"+newReleaseID
                                                                +"',projectid:'"+inputs.projectid+"',releasename:'"
                                                                +inputs.releasename+"',deleted:'"+false+"'}) return n"});
                                                    //reqToAPI(qList,urlData);
                                                    //Relationships
                                                    qList.push({"statement":"MATCH (a:PROJECTS_NG{projectid:'"+inputs.projectid+"'}),(b:RELEASES_NG {releaseid:'"+newReleaseID
                                                                +"',projectid:'"+inputs.projectid+"',releasename:'"
                                                                +inputs.releasename+"',deleted:'"+false+"'}) MERGE(a)-[r:FPRJTREL_NG{id:'"+newReleaseID
                                                                +"'}]->(b) return a,r,b"})														

                                                    //qList.push({"statement":"MATCH (c:RELEASES_NG{releaseid:'"+newReleaseID+"'}) return c"})
                                                    //qList.push({"statement":"MATCH (c:CYCLES_NG{releaseid:'"+newReleaseID+"'}) return c"})

                                                    qList.push({"statement":"MATCH (a:RELEASES_NG{releaseid:'"+newReleaseID
                                                                +"'}),(b:CYCLES_NG {releaseid:'"+newReleaseID
                                                                +"',deleted:'"+false+"'}) MERGE(a)-[r:FRELTCYC_NG{id:b.cycleid}]->(b) return a,r,b"})														
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
																		logger.error(exception);
																	}
																}
															});
														} catch (exception) {
															logger.error(exception);
														}
													}, eachprojectDetailcallback);
												}
											} catch (exception) {
											logger.error(exception);
											}
										});
									} catch (exception) {
										logger.error(exception);
									}
								} else {
									try {
										//this piece of code runs when only cycles needs to be created
										//in a specified release
										var releaseDetails = eachprojectDetail;
										var releaseId = releaseDetails.releaseId;
										var cycleDetails = releaseDetails.cycleDetails;
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
															logger.error(exception);
														}
													}
												});
											} catch (exception) {
												logger.error(exception);
											}
										}, eachprojectDetailcallback);
									} catch (exception) {
										logger.error(exception);
									}
								}
							} catch (exception) {
								logger.error(exception);
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
                                                    qList.push({"statement":"MATCH (n:RELEASES_NG {projectid:'"+inputs.projectid
                                                                +"',releaseid:'"+inputs.releaseid+"',releasename:'"
                                                                +inputs.releasename+"'}) detach delete n"});
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
                                                                    qList.push({"statement":"MATCH (n:CYCLES_NG {cycleid:'"+inputs.cycleid
                                                                                +"',releaseid:'"+inputs.releaseid+"',cyclename:'"
                                                                                +inputs.cyclename+"'}) detach delete n"});
                                                                    //reqToAPI(qList,urlData);																
                                                                    eachCycleCallback();                                                                    
																}
															});
														} catch (exception) {
															logger.error(exception);
														}
													}, eachprojectDetailcallback);
												}
											} catch (exception) {
												logger.error(exception);
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
															var cyclesOfRelease = eachCycleDetail.cycleDetails;
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
                                                                    qList.push({"statement":"MATCH (n:CYCLES_NG {cycleid:'"+inputs.cycleid
                                                                                +"',releaseid:'"+inputs.releaseid+"',cyclename:'"
                                                                                +inputs.cyclename+"'}) detach delete n"});
                                                                    //reqToAPI(qList,urlData);
                                                                    eachCycleCallback();
																}
															});
														} catch (exception) {
															logger.error(exception);
														}
													}
												} catch (exception) {
													logger.error(exception);
												}
											}, eachprojectDetailcallback);
										} catch (exception) {
											logger.error(exception);
										}
									}
								} catch (exception) {
									logger.error(exception);
								}
							}, deletedProjectDetailsCallback);
						} catch (exception) {
								logger.error(exception);
						}
					},
					editedProjectDetails: function (editedProjectDetailsCallback) {
						try {
							var projectDetails = updateProjectDetails.editedProjectDetails;
							async.forEachSeries(projectDetails, function (eachprojectDetail, eachprojectDetailcallback) {
								try {
									var editedStatus = eachprojectDetail.editStatus;
									if (editedStatus) {
										try {
											var newReleaseName = eachprojectDetail.releaseName;
											var releaseId = eachprojectDetail.releaseId;
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
																									logger.error(exception);
																								}
																							}
																						});
																					} catch (exception) {
																						logger.error(exception);
																					}
																				} else {
																					eachCycleCallback();
																				}
																			} catch (exception) {
																				logger.error(exception);
																			}
																		}, eachprojectDetailcallback);
																	} catch (exception) {
																		logger.error(exception);
																	}
																}
															});
														} catch (exception) {
																logger.error(exception);
														}
													}
												} catch (exception) {
													logger.error(exception);
												}
											});
										} catch (exception) {
												logger.error(exception);
										}
									} else {
										try {
											var newReleaseName = eachprojectDetail.releaseName;
											var releaseId = eachprojectDetail.releaseId;
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
																			logger.error(exception);
																	}
																}
															});
														} catch (exception) {
															logger.error(exception);
														}
													} else {
														eachCycleCallback();
													}
												} catch (exception) {
													logger.error(exception);
												}
											}, eachprojectDetailcallback);
										} catch (exception) {
											logger.error(exception);
										}
									}
								} catch (exception) {
									logger.error(exception);
								}
							}, editedProjectDetailsCallback);
						} catch (exception) {
							logger.error(exception);
						}
					}
				}, function (error, response) {
					if (error) {
						logger.error("Error occured in function newProjectDetails");
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
		logger.error(exception);
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
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var requestedidslist = req.body.requestedids;
			var idtypes = req.body.idtype;
			var index = 0;
			var responsedata = {
				requestedids: [],
				respnames: [],
				idtypes: []
			};
			if (requestedidslist.length == idtypes.length) {
				for (var eachid = 0; eachid < requestedidslist.length; eachid++) {
					if (requestedidslist[eachid] != null && requestedidslist[eachid] != undefined && requestedidslist[eachid].trim() != '') {
						//in this block all projects under the domain is the response.
						if (idtypes[eachid] == 'domainsall') {
							var responsedata = {
								projectIds: [],
								projectNames: []
							};
							namesfetcher(requestedidslist[eachid], "domainsall", function (error, response) {
								try {
									if (response.length <= 0) {
										logger.info('No projects found')
										res.send("No Projects");
									} else {
										for (var i = 0; i < response.length; i++) {
											responsedata.projectIds.push(response[i].projectid);
											responsedata.projectNames.push(response[i].projectname);
											if (i == response.length - 1) {
												logger.info('Project details fetched successfully')
												res.send(responsedata);
											}
										}
									}
								} catch (exception) {
									logger.error(exception);
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
									logger.error(exception);
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
									logger.error(exception);
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
									logger.error(exception);
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
									logger.error(exception);
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
							statusFlag = "Error occured in namesfetcher : Fail";
							logger.error("Error occured in admin/getNames_ICE from namesfetcher Error Code : ERRNDAC");
							namesfetchercallback(statusFlag, null);
						} else {
							index = index + 1;
							namesfetchercallback(null, queryStringresult.rows);
						}
					} catch (exception) {
						logger.error(exception);
					}
				});
			}
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception);
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
			if (req.cookies['connect.sid'] != undefined) {
				var sessionCookie = req.cookies['connect.sid'].split(".");
				var sessionToken = sessionCookie[0].split(":");
				sessionToken = sessionToken[1];
			}
			if (sessionToken != undefined && req.session.id == sessionToken) {
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
												logger.error("Error occured in getDetails_ICE_domaindetails");
												res.send("Error in getDetails_ICE_domaindetails : Fail");
											} catch (exception) {
												logger.error(exception);
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
																logger.error(exception);
															}
														}
													}
												}
											} catch (exception) {
												logger.error(exception);
											}
										}
									});
								} catch (exception) {
										logger.error(exception);
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
												logger.error(exception);
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
																logger.error(exception);
															}
														} else {
															try {
																for (var indexofName = 0; indexofName < queryForProjectTyperesponse.length; indexofName++) {
																	responsedata.appType = queryForProjectTyperesponse[indexofName].projecttypename;
																	queryExecutor(requestedid, "projectsdetails", "releasedetails",
																		function (queryGetReleaseserror, queryGetReleasesresponse) {
																		if (queryGetReleaseserror) {
																			try {
																				logger.error(queryGetReleasesQueryerror);
																				res.send(queryGetReleasesQueryerror);
																			} catch (exception) {
																					logger.error(exception);
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
																									logger.error(exception);
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
																												logger.error(exception);
																										}
																									});
																									eachProjectDetail.releaseName = eachRelease.releasename;
																									eachProjectDetail.releaseId = eachRelease.releaseid;
																									eachProjectDetail.cycleDetails = cycleDetails;
																									if (releaseindex == queryGetReleasesresponse.length && queryGetCyclesresponse.length == cycleindex) {
																										finalDataReturn();
																									}
																								} catch (exception) {
																										logger.error(exception);
																								}
																							}
																							releasecallback();
																						} catch (exception) {
																								logger.error(exception);
																						}
																					});
																					responsedata.projectDetails.push(eachProjectDetail);
																				} catch (exception) {
																						logger.error(exception);
																				}
																			});
																		}
																	});
																}
															} catch (exception) {
																logger.error(exception);
															}
														}
													});
												}
											} catch (exception) {
												logger.error(exception);
											}
										}
									});
								} catch (exception) {
									logger.error(exception);
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
											logger.error("Error occured in getDetails_ICE_cycledetails");
											res.send("Error in getDetails_ICE_cycledetails : Fail");
										} catch (exception) {
											logger.error(exception);
										}
									} else {
										async.forEachSeries(response, function (eachtestSuiteDetails, testsuiteCallback) {
											try {
												responsedata.testsuiteIds.push(eachtestSuiteDetails.testsuiteid);
												responsedata.testsuiteNames.push(eachtestSuiteDetails.testsuitename);
												testsuiteCallback();
											} catch (exception) {
												logger.error(exception);
											}
										});
										finalDataReturn();
									}
								});

							} else {
								try {
									res.send("fail");
								} catch (exception) {
									logger.error(exception);
								}
							}
						}
					} catch (exception) {
						logger.error(exception);
					}
				} else {
					try {
						res.send("fail");
					} catch (exception) {
						logger.error(exception);
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
								statusFlag = "Error occured in queryExecutor : Fail";
								logger.error("Error occured in getDetails_ICE Error Code : ERRNDAC");
								queryExecutorcallback(statusFlag, null);
							} else {
								index = index + 1;
								queryExecutorcallback(null, queryStringresult.rows);
							}
						} catch (exception) {
							logger.error(exception);
						}
					});
				}

				function finalDataReturn() {
					try {
						res.send(responsedata);
					} catch (exception) {
						logger.error(exception);
					}
				}
			} else {
				logger.info("Invalid Session");
				res.send("Invalid Session");
			}
		} catch (exception) {
				logger.error(exception);
		}
	} else {
		res.send('fail');
	}
};

//Save Assigned Projects
exports.assignProjects_ICE = function (req, res) {
	logger.info("Inside UI Service: assignProjects_ICE");
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var assignProjectsDetails = req.body.assignProjectsObj;
			var projectDetails = assignProjectsDetails.assignedProjects;
			var projectIds = [];
			var alreadyassigned = false;
			for (var i = 0; i < projectDetails.length; i++) {
				projectIds.push(projectDetails[i].projectId);
			}
			var inputs = {};
			validateAssignProjects();
			function validateAssignProjects() {
				logger.info("Inside function validateAssignProjects");
				check_domainId = validator.isEmpty(assignProjectsDetails.domainId);
				if (check_domainId == false) {
					valid_domainId = true;
				}
				check_userid = validator.isUUID(assignProjectsDetails.userId);
				if (check_userid == true) {
					valid_userId = true;
				}
				check_userInfo = validator.isJSON(JSON.stringify(assignProjectsDetails.userInfo));
				check_assignProjectDetails = validator.isJSON(JSON.stringify(assignProjectsDetails.userInfo));
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
                        inputs.projectids1 = "'"+inputs.projectids.join('\',\'')+"'"
                        //Execute neo4j query!!
                        //var qList=[];
                        qList.push({"statement":"MERGE (n:ICEPERMISSIONS_NG {userid:'"+inputs.userid
                                    +"',domainid:'"+inputs.domainid+"'}) set n.projectids=["+inputs.projectids1+"] return n"});
                        //Relationships
                        qList.push({"statement":"MATCH (a:ICEPERMISSIONS_NG{userid:'"+inputs.userid
                                    +"',domainid:'"+inputs.domainid+"'}),(b:DOMAINS_NG {domainid:'"
                                    +inputs.domainid+"'}) MERGE(a)-[r:FICETDOM_NG{id:'"+inputs.domainid+"'}]->(b) return a,r,b"})

                        // MATCH p = (a:DOMAINS_NG{userid:'bced8722-1ce1-41e0-b7d3-d9a9c0bcd800'})-[r1]->(d:DOMAINS_NG) return p
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

//						res.send("success");
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
		logger.error(exception);
		res.send("fail");
	}
};

//get Assigned Projects
exports.getAssignedProjects_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: getAssignedProjects_ICE");
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
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
										logger.error(exception);
										res.send("fail");
									}
								});
							} catch (exception) {
								logger.error(exception);
								res.send("fail");
							}
						}, finalfunction);

					}
					function finalfunction() {
						logger.info('Assigned projects fetched successfully');
						res.send(assignedProjObj);
					}
				} catch (exception) {
					logger.error(exception);
					res.send("fail");
				}
			});
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception);
		res.send("fail");
	}
};

exports.getAvailablePlugins = function (req, res) {
	try {
		var plugins_list = [];
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
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
		console.log(exception);
		res.send("fail");
	}
};