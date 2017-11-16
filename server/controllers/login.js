/**
 * Dependencies.
 */
var bcrypt = require('bcrypt');
var async = require('async');
var epurl = "http://127.0.0.1:1990/";
var Client = require("node-rest-client").Client;
var client = new Client();
var validator = require('validator');
//Global Variables
var roles = [];
var userRoles = {};
var  logger = require('../../logger');
 var notificationMsg = require("../notifications/notifyMessages");
//Authenticate User - Nineteen68
exports.authenticateUser_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI service: authenticateUser_Nineteen68");
		var username = req.body.username.toLowerCase();
		var password = req.body.password;
		var session = req.session;
		var sessId = req.session.id;

		validateLogin();
		function validateLogin() {
			check_username = validator.isEmpty(username);
			check_usernameLen = validator.isLength(username, 1, 50);
			if (check_username == false && check_usernameLen == true) {
				valid_username = true;
			}
			check_password = validator.isEmpty(password);
			check_passwordLen = validator.isLength(password, 1, 12);
			if (check_password == false && check_passwordLen == true) {
				valid_password = true;
			}
		}
		if (valid_username == true && valid_password == true) {
			
			req.session.username = username;
			req.session.uniqueId = sessId;
			var flag = 'inValidCredential';
			var assignedProjects = false;
			var validUser = false;
			var inputs = {
				"username": req.session.username
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			checkldapuser(req, function (err, data) {
				logger.info("Inside call function of checkldapuser");
				if (data) {
					ldapCheck(req, function (err, ldapdata) {
					logger.info("Inside call function of ldapCheck");
					logger.info("LDAP User");
						if (ldapdata == 'pass') {
							flag = 'validCredential';
							addUsernameAndIdInLogs(username,flag,req.session.userid);
							res.setHeader('Set-Cookie', sessId);
							logger.info("User Authenticated successfully");
							res.send(flag);
						} else {
							logger.info("User Authentication failed");
							res.send(flag);
						}
					});
				} else {
					logger.info("Calling NDAC Service: authenticateUser_Nineteen68");
					client.post(epurl + "login/authenticateUser_Nineteen68", args,
						function (result, response) {
						if (response.statusCode != 200 || result.rows == "fail") {
							logger.error("Error occured in authenticateUser_Nineteen68 Error Code : ERRNDAC");
							res.send("fail");
						} else {

							try {
								if (result.rows.length == 0) {
									res.send(flag);
								} else {
									for (var i = 0; i < result.rows.length; i++) {
										dbHashedPassword = result.rows[i].password;
									}
									validUser = bcrypt.compareSync(password, dbHashedPassword); // true

									//Check for concurrent login
									if(validUser == true)
									{
										var maxTime = 0;
										for (var key in req.sessionStore.sessions) {
											var sessionStore = req.sessionStore.sessions[key];
											if (sessionStore) {
												var obj = JSON.parse(sessionStore);
												if (username == obj.username) {
													var dateEx = new Date(obj.cookie.expires);
													if (dateEx.getTime() > maxTime) {
														maxTime = dateEx.getTime();
													}
												}
											}
										}
										var dateNow = new Date();
										if (dateNow.getTime() < maxTime) {
											return res.send("userLogged");
										}
									}
									
									//Check whether projects are assigned for a user
									checkAssignedProjects(req, function (err, assignedProjectsData, role) {
										if(err == 'fail')
										{
											logger.error("Error occured in authenticateUser_Nineteen68 Error Code : ERRNDAC");
											res.send('fail');
										}
										else{
											logger.info("Inside function call of checkAssignedProjects");
											if (role != "Admin" && role != "Business Analyst" && role != "Tech Lead") {
												if (assignedProjectsData > 0) {
													assignedProjects = true;
												}
												if (validUser == true && assignedProjects == true) {
													flag = 'validCredential';
													addUsernameAndIdInLogs(username,flag,req.session.userid);
													res.setHeader('Set-Cookie', sessId);
													logger.info("User Authenticated successfully");
													res.send(flag);
												} else if (validUser == true && assignedProjects == false) {
													flag = 'noProjectsAssigned';
													logger.info("User has not been assigned any projects");
													req.session.destroy();
													res.send(flag);
												} else {
													logger.info("User Authentication failed");
													req.session.destroy();
													res.send(flag);
												}
											} else {
												if (validUser == true) {
													flag = 'validCredential';
													addUsernameAndIdInLogs(username,flag,req.session.userid);
													res.setHeader('Set-Cookie', sessId);
													logger.info("User Authenticated successfully");
													res.send(flag);
												} else {
													logger.info("User Authentication failed");
													req.session.destroy();
													res.send(flag);
												}
											}
										}
										
									});
								}
							} catch (exception) {
								logger.error(exception);
								res.send("fail");
							}
						}
					});
				}
			});
		} else {
			res.send("fail");
		}
	} catch (exception) {
		logger.error(exception);
		res.send("fail");
	}

};
function addUsernameAndIdInLogs(username,flag,userid){
			if(flag == "validCredential"){
				//logger.info("User " + username + " authenticated");
				logger.rewriters.push(function(level, msg, meta) {
						meta.username = username;
						meta.userid = userid;
						return meta;
						});
			}
}
/**
 * @see : function to authenticate users from jenkins
 * @author : vinay
 */
exports.authenticateUser_Nineteen68_CI = function (req, res) {
	try {
		logger.info("Inside UI service: authenticateUser_Nineteen68_CI");
		var username = req.body.username.toLowerCase();
		var password = req.body.password;
		var session = req.session;
		var sessId = req.session.id;
		req.session.username = username;
		req.session.uniqueId = sessId;
		var flag = 'inValidCredential';
		var inputs = {
			"username": req.session.username
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		validateLogin();
		function validateLogin() {
			check_username = validator.isEmpty(username);
			check_usernameLen = validator.isLength(username, 1, 50);
			if (check_username == false && check_usernameLen == true) {
				valid_username = true;
			}
			check_password = validator.isEmpty(password);
			check_passwordLen = validator.isLength(password, 1, 12);
			if (check_password == false && check_passwordLen == true) {
				valid_password = true;
			}
		}
		if (valid_username == true && valid_password == true) {
			checkldapuser(req, function (err, data) {
					logger.info("Inside call function of checkldapuser");
				if (data) {
					ldapCheck(req, function (err, ldapdata) {
						logger.info("Inside call function of ldapCheck");
						if (ldapdata == 'pass') {
							flag = 'validCredential';
							status = {
								"status": flag,
								"session_id": sessId
							};
							res.setHeader('set-cookie', sessId);
							res.writeHead(200, {
								'Content-Type': 'text/plain'
							});
							res.write("status : " + flag + " , session_id : " + sessId);
							logger.info("User Authenticated successfully");
							res.end();
						} else {
							res.setHeader('set-cookie', sessId);
							res.writeHead(401, {
								'Content-Type': 'text/plain'
							});
							res.write("status : " + flag + " , session_id : " + "");
							logger.info("User Authentication failed");
							res.end();
						}
					});
				} else {
					logger.info("Calling NDAC Service: authenticateUser_Nineteen68_CI");
					client.post(epurl + "login/authenticateUser_Nineteen68", args,
						function (result, response) {
						if (response.statusCode != 200 || result.rows == "fail") {
							logger.error("Error occured in authenticateUser_Nineteen68_CI Error Code : ERRNDAC");
							res.setHeader('set-cookie', sessId);
							res.writeHead(500, {
								'Content-Type': 'text/plain'
							});
							res.write("status : fail , session_id : ");
							res.end();
						} else {
							try {
								if (result.rows.length == 0) {
									res.setHeader('set-cookie', sessId);
									res.writeHead(401, {
										'Content-Type': 'text/plain'
									});
									res.write("status : " + flag + " , session_id : " + "");
									res.end();
								} else {
									for (var i = 0; i < result.rows.length; i++) {
										dbHashedPassword = result.rows[i].password;
									}
									var validUser = bcrypt.compareSync(password, dbHashedPassword); // true
									checkAssignedProjects(req, function (err, assignedProjectsData, role) {
										logger.info("Inside function call of checkAssignedProjects");
										if (role != "Admin" && role != "Business Analyst" && role != "Tech Lead") {
											if (assignedProjectsData > 0) {
												assignedProjects = true;
											}
											if (validUser == true && assignedProjects == true) {
												flag = 'validCredential';
												status = {
													"status": flag,
													"session_id": sessId
												};
												res.setHeader('set-cookie', sessId);
												res.writeHead(200, {
													'Content-Type': 'text/plain'
												});
												res.write("status : " + flag + " , session_id : " + sessId);
												logger.info("User Authenticated successfully");
												res.end();
											} else if (validUser == true && assignedProjects == false) {
												flag = 'noProjectsAssigned';
												res.writeHead(401, {
													'Content-Type': 'text/plain'
												});
												res.write("status : " + flag + " , session_id : " + "");
												logger.info("User has not been assigned any projects");
												res.end();
											} else {
												logger.info("User Authentication failed");
												res.setHeader('set-cookie', sessId);
												res.writeHead(401, {
													'Content-Type': 'text/plain'
												});
												res.write("status : " + flag + " , session_id : " + "");
												res.end();
											}
										} else {
											if (validUser == true) {
												flag = 'validCredential';
												status = {
													"status": flag,
													"session_id": sessId
												};
												res.setHeader('set-cookie', sessId);
												res.writeHead(200, {
													'Content-Type': 'text/plain'
												});
												res.write("status : " + flag + " , session_id : " + sessId);
												logger.info("User Authenticated successfully");
												res.end();
											} else {
												logger.info("User Authentication failed");
												res.setHeader('set-cookie', sessId);
												res.writeHead(401, {
													'Content-Type': 'text/plain'
												});
												res.write("status : " + flag + " , session_id : " + "");
												res.end();
											}
										}
									});
								}
							} catch (exception) {
								logger.error(exception);
								res.setHeader('set-cookie', sessId);
								res.writeHead(500, {
									'Content-Type': 'text/plain'
								});
								res.write("status : fail , session_id : ");
								res.end();
							}
						}
					});
				}
			});
		} else {
			res.send('fail');
		}
	} catch (exception) {
		logger.error(exception);
		res.setHeader('set-cookie', sessId);
		res.writeHead(500, {
			'Content-Type': 'text/plain'
		});
		res.write("status : fail , session_id : ");
		res.end();
	}
};

/**
 * @see : function to check whether projects are assigned for user
 * @author : vinay
 */
function checkAssignedProjects(req, callback, data) {
	logger.info("Inside checkAssignedProjects function");
	userid = '';
	var roleid = '';
	var assignedProjectsLen = '';
	var flag = 'fail';
	async.series({
		getUserId: function (callback) {
			var inputs = {
				"username": req.session.username,
				"query": "getUserId"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from getUserId :authenticateUser_Nineteen68/projassigned");
			client.post(epurl + "login/authenticateUser_Nineteen68/projassigned", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occured in authenticateUser_Nineteen68 Error Code : ERRNDAC");
					callback(flag);
					//res.send("fail");
				} else {
					userid = result.rows[0].userid;
					req.session.userid = userid;
					roleid = result.rows[0].defaultrole;
					callback(null, userid, roleid);
				}
			});
		},
		getUserRole: function (callback) {
			try {
				var inputs = {
					"roleid": roleid,
					"query": "getUserRole"
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from getUserRole :authenticateUser_Nineteen68/projassigned");
				client.post(epurl + "login/authenticateUser_Nineteen68/projassigned", args,
					function (rolesResult, response) {
					if (response.statusCode != 200 || rolesResult.rows == "fail") {
						logger.error("Error occured in authenticateUser_Nineteen68 Error Code : ERRNDAC");
						callback(flag);
						//res.send("fail");
					} else {
						rolename = rolesResult.rows[0].rolename;
						callback(null, userid, rolename);
					}
				});
			} catch (exception) {
				logger.error(exception);
				//res.send("fail");
				callback(flag);
			}
		},
		getAssignedProjects: function (callback) {
			try {
				var inputs = {
					"userid": userid,
					"query": "getAssignedProjects"
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from getAssignedProjects :authenticateUser_Nineteen68/projassigned");
				client.post(epurl + "login/authenticateUser_Nineteen68/projassigned", args,
					function (projectsResult, response) {
					if (response.statusCode != 200 || projectsResult.rows == "fail") {
						logger.error("Error occured in authenticateUser_Nineteen68 Error Code : ERRNDAC");
						callback(flag);
						//res.send("fail");
					} else {
						if (projectsResult.rows.length > 0 && projectsResult.rows[0].projectids != null) {
							assignedProjectsLen = projectsResult.rows[0].projectids.length;
							callback(null, assignedProjectsLen, rolename);
						} else {
							assignedProjectsLen = 0;
							callback(null, assignedProjectsLen, rolename);
						}
					}
				});
			} catch (exception) {
				logger.error(exception);
				//res.send('fail');
				callback(flag);
			}
		},
	}, function (err, data) {
		try {
			if (err) {
				logger.error(err);
				callback(flag);
			} else {
				callback(null, assignedProjectsLen, rolename);
			}
		} catch (exception) {
			logger.error(exception);
			//res.send('fail');
			callback(flag);
		}
	});
}

/**
 * @see : function to check whether existing user is ldap user or not
 * @author : shree.p
 */
function checkldapuser(req, callback, data) {
		logger.info("Inside function checkldapuser");
	var flag = false;
	var inputs = {
		"username": req.session.username
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
		logger.info("Calling NDAC Service : authenticateUser_Nineteen68/ldap");
	client.post(epurl + "login/authenticateUser_Nineteen68/ldap", args,
		function (result, response) {
		if (response.statusCode != 200 || result.rows == "fail") {
			logger.error("Error occured in authenticateUser_Nineteen68 Error Code : ERRNDAC");
			callback(null, flag);
		} else {
			try {
				if (result.rows.length == 0) {
					callback(null, flag);
				} else {
					flag = result.rows[0].ldapuser;
					if (flag == null || flag == undefined) {
						flag = false;
					}
					callback(null, flag);
				}
			} catch (exception) {
				logger.error(exception);
				callback(null, flag);
			}
		}
	});
}

function ldapCheck(req, cb) {
	logger.info("Inside ldapCheck function");
	var config = require('../../server/config/config');
	var ldap_ip = '',
	ldap_port = '',
	ldap_domain = '';
	var username = req.body.username.toLowerCase();
	var password = req.body.password;
	ldap_ip = config.ldap_ip;
	ldap_port = config.ldap_port;
	ldap_domain = config.ldap_domain;
	var dcarray = [];
	var dcstringarr = [];
	try {
		if (ldap_domain.indexOf(".") !== -1) {
			dcarray = ldap_domain.split(".");
		}
		for (var i = 0; i < dcarray.length; i++) {
			dcstringarr.push("dc=" + dcarray[i]);
		}
	} catch (ex) {
		logger.error(ex);
	}
	var ActiveDirectory = require('activedirectory');
	var ad = new ActiveDirectory({
			url: 'ldap://' + ldap_ip + ':' + ldap_port,
			baseDN: dcstringarr.toString()
		});
	ad.authenticate(username, password, function (err, auth) {
		if (err) {
			logger.error('Error occurred in ldap authentication : ' + JSON.stringify(err));
			//console.log('Authentication failed!');
			//cb(null,'fail');
		}
		if (auth) {
			logger.info("LDAP user");
			cb(null, 'pass');
		} else {
			logger.info('Authentication failed!');
			cb(null, 'fail');
		}
	});
}

//Load User Information - Nineteen68
exports.loadUserInfo_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI Service: loadUserInfo_Nineteen68");
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var flag = req.body.flag;
			var switchedRole = req.body.selRole;
			if(switchedRole != undefined && switchedRole != '' )
			{
				req.session.switchedRole = true;
			}
			else{
					req.session.switchedRole = false;
			}
			userName = req.session.username.toLowerCase();
			jsonService = {};
			userpermissiondetails = [];
			async.series({
				userInfo: function (callback) {
					try {
						var inputs = {
							"username": userName.toLowerCase(),
							"query": "userInfo"
						};
						var args = {
							data: inputs,
							headers: {
								"Content-Type": "application/json"
							}
						};
						logger.info("Calling NDAC Service from userInfo : loadUserInfo_Nineteen68");
						client.post(epurl + "login/loadUserInfo_Nineteen68", args,
							function (userResult, response) {
							if (response.statusCode != 200 || userResult.rows == "fail") {
								var flag = "fail";
								logger.error("Error occurred in loadUserInfo_Nineteen68 Error Code : ERRNDAC");
								res.send(flag);
							} else {
								try {
									if (userResult.rows.length > 0) {
										AlljsonServices = [];
										service = userResult.rows[0];
										userId = service.userid;
										jsonService.user_id = userId;
										jsonService.email_id = service.emailid;
										jsonService.additionalrole = service.additionalroles;
										jsonService.firstname = service.firstname;
										jsonService.lastname = service.lastname;
										jsonService.role = service.defaultrole;
										jsonService.username = service.username.toLowerCase();
										req.session.defaultRoleId = jsonService.role;
									} else {
										logger.info("User info not found");
										res.send("fail");
									}
								} catch (exception) {
									logger.error(exception);
									res.send("fail");
								}
							}
							callback();
						});
					} catch (exception) {
						logger.error(exception);
						res.send("fail");
					}
				},
				loggedinRole: function (callback) {
					var inputs;
					if (flag == true) {
						inputs = {
							"roleid": req.body.selRole,
							"query": "loggedinRole"
						};
					}
					if (flag == false || flag == undefined) {
						inputs = {
							"roleid": req.session.defaultRoleId,
							"query": "loggedinRole"
						};
					}
					var args = {
						data: inputs,
						headers: {
							"Content-Type": "application/json"
						}
					};
					logger.info("Calling NDAC Service from loggedinRole: loadUserInfo_Nineteen68");
					client.post(epurl + "login/loadUserInfo_Nineteen68", args,
						function (rolesResult, response) {
						if (response.statusCode != 200 || rolesResult.rows == "fail") {
							logger.error("Error occured in loadUserInfo_Nineteen68 Error Code : ERRNDAC");
							res.send("fail");
						} else {
							try {
								if (rolesResult.rows.length == 0) {
									logger.info("user role not found");
									res.send("fail");
								} else {
									try {
										var role = "";
										for (var i = 0; i < rolesResult.rows.length; i++) {
											role = rolesResult.rows[i].rolename;
										}
										req.session.defaultRole = role;
									} catch (exception) {
										logger.error(exception);
										res.send("fail");
									}
								}
								callback();
							} catch (exception) {
								logger.error(exception);
								res.send("fail");
							}
						}
					});
				},
				//Service call to get the plugins accessible for the user
				userPlugins: function (callback) {
					try {
						var inputs;
						if (flag == true) {
							inputs = {
								"roleid": req.body.selRole,
								"query": "userPlugins"
							};
						}
						if (flag == false || flag == undefined) {
							inputs = {
								"roleid": req.session.defaultRoleId,
								"query": "userPlugins"
							};
						}
						var args = {
							data: inputs,
							headers: {
								"Content-Type": "application/json"
							}
						};
						logger.info("Calling NDAC Service from userPlugins: loadUserInfo_Nineteen68");
						client.post(epurl + "login/loadUserInfo_Nineteen68", args,
							function (pluginResult, response) {
							if (response.statusCode != 200 || pluginResult.rows == "fail") {
								logger.error("Error occured in loadUserInfo_Nineteen68 Error Code : ERRNDAC");
								res.send("fail");
							} else {
								try {
									if (pluginResult.rows.length > 0) {
										var objKeys = Object.keys(pluginResult.rows[0]);
										var pluginsArr = [];
										var count = 0;
										for (var k in pluginResult.rows[0]) {
											// if(count < pluginResult.columns.length){
											if (k != 'roleid' && k != 'permissionid') {
												pluginsArr.push({
													"keyName": k,
													"keyValue": (pluginResult.rows[0])[k]
												});
											}
											//     count++;
											// }
										}
										//userpermissiondetails.push(pluginResult.rows[0]);
										jsonService.plugindetails = pluginsArr;
									} else {
										logger.info("User plugins not found");
										res.send("fail");
									}
								} catch (exception) {
									logger.error(exception);
									res.send("fail");
								}
							}
							callback();
						});
					} catch (exception) {
						logger.error(exception);
						res.send("fail");
					}
				}
			}, function (err, data) {
				if (err) {
					logger.error(err);
					res.send("fail");
				} else {
					res.send(jsonService);
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

//Get UserRoles By RoleId - Nineteen68
exports.getRoleNameByRoleId_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI service: getRoleNameByRoleId_Nineteen68");
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var roleId = [];
			roleId.push(req.session.defaultRoleId);
			var role = [];
			//var role = roleId[0];
			var flag = "";
			async.forEachSeries(roleId, function (roleid, callback) {
				var inputs = {
					"roleid": roleid
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};

				logger.info("Calling NDAC Service: getRoleNameByRoleId_Nineteen68");
				client.post(epurl + "login/getRoleNameByRoleId_Nineteen68", args,
					function (rolesResult, response) {
					if (response.statusCode != 200 || rolesResult.rows == "fail") {
						logger.error("Error occured in getRoleNameByRoleId_Nineteen68 Error Code : ERRNDAC");
						res.send("fail");
					} else {
						try {
							if (rolesResult.rows.length == 0) {
								logger.info("User role not found");
								res.send("fail");
							} else {
								try {
									//var role="";
									for (var i = 0; i < rolesResult.rows.length; i++) {
										role.push(rolesResult.rows[i].rolename);
									}
									// res.send(role);
								} catch (exception) {
									logger.error(exception);
									res.send("fail");
								}
								callback();
							}
						} catch (exception) {
							logger.error(exception);
							res.send("fail");
						}
					}
					// callback();
				});
			}, function () {
				if (role == undefined) {
					res.send("fail");
				} else {
					res.send(role);
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

/**
 * @author shree.p
 * @see function to logout in Nineteen68 from jenkins
 */
exports.logoutUser_Nineteen68_CI = function (req, res) {
	logger.info("Inside UI Service: logoutUser_Nineteen68_CI");
	if (req.sessionStore.sessions != undefined) {
		session_list = req.sessionStore.sessions;
		if (Object.keys(session_list).length != 0) {
			logger.info("user logged out successfully");
			req.sessionStore.clear();
			res.send('Logout successful');
		} else {
			logger.info("Session Expired");
			res.send('Session Expired');
		}
	}
};

exports.logoutUser_Nineteen68 = function (req, res) {
	logger.info("Inside UI Service: logoutUser_Nineteen68");
	req.cookies['connect.sid'] = '';
	logger.info("user logged out successfully %s",req.session.username);
	req.session.destroy();
	if (req.session == undefined) {
		logger.info("Session Expired");
		res.send('Session Expired');
	}
};

