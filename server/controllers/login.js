var async = require('async');
var bcrypt = require('bcrypt');
var validator = require('validator');
var activeDirectory = require('activedirectory');
var epurl = "http://"+process.env.NDAC_IP+":"+process.env.NDAC_PORT+"/";
var Client = require("node-rest-client").Client;
var client = new Client();
var logger = require('../../logger');
var utils = require('../lib/utils');

//Authenticate User - Nineteen68
exports.authenticateUser_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI service: authenticateUser_Nineteen68");
		var username = req.body.username.toLowerCase();
		var password = req.body.password;
		var sessId = req.session.id;

		// Credentials for service user that can restart services
		if (username == "restartservice" && password == "r3Start@3") return res.send("restart");

		var valid_username = validator.isLength(username, 1, 100);
		var valid_password = validator.isLength(password, 1, 100);
		if (valid_username && valid_password) {
			var flag = 'inValidCredential';
			var userLogged = false;
			var validUser = false;
			var userid = '';

			async.waterfall([
				function checkUserLoggedIn(callback) {
					// Implementation for Concurrent login
					utils.allSess(function (err, allKeys) {
						if (err) {
							logger.info("User Authentication failed");
							callback("fail");
						} else {
							for (var ki = 0; ki < allKeys.length; ki++) {
								if (username == allKeys[ki].username) {
									userLogged=true;
									break;
								}
							}
							callback(null);
						}
					});
				}, function authenticate(callback) {
					checkldapuser(username, function (data) {
						logger.info("Inside call function of checkldapuser");
						if (data) {
							// LDAP Authentication
							userid = data.userid;
							data.password = password;
							ldapCheck(data, function (ldapdata) {
								logger.info("Inside call function of ldapCheck: LDAP User");
								if (ldapdata == "empty") callback("inValidLDAPServer");
								else if (ldapdata == "pass") {
									validUser = true;
									callback(null);
								}
							});
						} else {
							// In-House Authentication
							var args = {
								data: { "username": username },
								headers: { "Content-Type": "application/json" }
							};
							logger.info("Calling NDAC Service: authenticateUser_Nineteen68");
							client.post(epurl + "login/authenticateUser_Nineteen68", args,
								function (result, response) {
								if (response.statusCode != 200 || result.rows == "fail") {
									logger.error("Error occurred in authenticateUser_Nineteen68 Error Code : ERRNDAC");
									callback("fail");
								} else {
									try {
										if (result.rows.length !== 0) {
											var dbHashedPassword = result.rows[0].password;
											userid = result.rows[0].userid;
											validUser = bcrypt.compareSync(password, dbHashedPassword); // true
											callback(null);
										}
									} catch (exception) {
										logger.error(exception.message);
										callback("fail");
									}
								}
							});
						}
					});
				}
			], function(err) {
				if (err) flag = err;
				if (!validUser) logger.info("User Authentication failed");
				else {
					req.session.username = username;
					req.session.uniqueId = sessId;
					req.session.userid = userid;
					flag = 'validCredential';
					if (userLogged) {
						req.session.emsg = "userLogged";
						logger.info("User already logged in");
					} else {
						logger.info("User Authenticated successfully");
						logger.rewriters[0]=function(level, msg, meta) {
							meta.username = username;
							meta.userid = userid;
							return meta;
						};
					}
				}
				return res.send(flag);
			});
		} else {
			res.send("invalid_username_password");
		}
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

/**
 * @see : function to check whether projects are assigned for user
 * @author : vinay
 */
function checkAssignedProjects(username, main_callback) {
	logger.info("Inside checkAssignedProjects function");
	var assignedProjects = false;
	var flag = 'fail';
	async.waterfall([
		function getUserId(callback) {
			var inputs = {
				"username": username,
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
					logger.error("Error occurred in authenticateUser_Nineteen68/projassigned Error Code : ERRNDAC");
					callback(flag);
				} else if (result.rows.length !== 0) {
					var userid = result.rows[0].userid;
					var roleid = result.rows[0].defaultrole;
					callback(null, userid, roleid);
				} else callback("invalid_username");
			});
		},
		function getUserRole(userid, roleid, callback) {
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
					logger.error("Error occurred in authenticateUser_Nineteen68 Error Code : ERRNDAC");
					callback(flag);
				} else {
					var rolename = rolesResult.rows[0].rolename;
					callback(null, userid, rolename);
				}
			});
		},
		function getAssignedProjects(userid, rolename, callback) {
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
					logger.error("Error occurred in authenticateUser_Nineteen68 Error Code : ERRNDAC");
					callback(flag);
				} else {
					if (projectsResult.rows.length > 0 && projectsResult.rows[0].projectids != null) {
						assignedProjects = projectsResult.rows[0].projectids.length!==0;
					}
					callback(null, assignedProjects, userid, rolename);
				}
			});
		},
	], function (err, assignedProjects, userid, rolename) {
		main_callback(err, assignedProjects, userid, rolename);
	});
}

/**
 * @see : function to check whether existing user is ldap user or not
 * @author : shree.p
 */
function checkldapuser(username, callback) {
	logger.info("Inside function checkldapuser");
	var flag = false;
	var inputs = {
		"username": username
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
			logger.error("Error occurred in authenticateUser_Nineteen68_ldap Error Code : ERRNDAC");
			callback(flag);
		} else if (result.rows.length === 0) {
			callback(flag);
		} else {
			if (result.rows[0].ldapuser != '{}') {
				flag = JSON.parse(result.rows[0].ldapuser);
				flag.userid = result.rows[0].userid;
			}
			callback(flag);
		}
	});
}

function ldapCheck(ldapdata, cb) {
	logger.info("Inside ldapCheck function");
	var username = ldapdata.user;
	var password = ldapdata.password;
	var inputs = {
		name: ldapdata.server
	};
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
			cb("fail");
		} else if (result.rows.length === 0) {
			cb("empty");
		} else {
			result = result.rows[0];
			var ad_config = {
				url: result.url,
				baseDN: result.base_dn,
			};
			if (result.authtype == "simple") {
				ad_config.bindDN = result.bind_dn;
				ad_config.bindCredentials = result.bind_credentials;
			}
			var ad = new activeDirectory(ad_config);
			ad.authenticate(username, password, function (err, auth) {
				if (err) {
					logger.error("Error occurred in ldap authentication");
					logger.debug("Error occurred in ldap authentication : " + JSON.stringify(err));
					cb("fail");
				}
				else if (auth) cb("pass");
				else cb("fail");
			});
		}
	});
}

// Check User login State - Nineteen68
exports.checkUserState_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI Service: checkUserState_Nineteen68");
		if (utils.isSessionActive(req.session)) {
			var emsg = req.session.emsg || "ok";
			async.series({
				checkProjects_ifOK: function(callback) {
					if (emsg != "ok") callback(emsg);
					else {
						var username = req.session.username;
						checkAssignedProjects(username, function (err, assignedProjects, userid, role) {
							if(err) {
								logger.error("Error occurred in checkUserState_Nineteen68. Cause: "+ err);
								emsg = err;
							} else {
								logger.info("Inside function call of checkAssignedProjects");
								if (role != "Admin" && !assignedProjects) {
									emsg = "noProjectsAssigned";
									logger.info("User has not been assigned any projects");
								} else {
									req.session.userid = userid;
									req.session.ip = req.headers['x-forwarded-for'];
									req.session.loggedin = (new Date()).toISOString();
								}
							}
							callback(emsg);
						});
					}
				}
			}, function (emsg) {
				if (emsg != "ok") req.session.destroy();
				//else res.cookie('sid','sessionendsatbrowserclose', {path: '/', httpOnly: true, secure: true})
				return res.send(emsg);
			});
		}
	} catch (exception) {
		logger.error(exception.message);
		req.session.destroy();
		res.send("fail");
	}
};

//Load User Information - Nineteen68
exports.loadUserInfo_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI Service: loadUserInfo_Nineteen68");
		if (utils.isSessionActive(req.session)) {
			var selectedRole = req.body.selRole;
			var userName = req.session.username;
			var jsonService = {};
			async.series({
				userInfo: function (callback) {
					try {
						var inputs = {
							"username": userName,
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
								logger.error("Error occurred in loadUserInfo_Nineteen68 Error Code : ERRNDAC");
								return res.send("fail");
							} else {
								if (userResult.rows.length > 0) {
									var service = userResult.rows[0];
									jsonService.user_id = service.userid;
									jsonService.email_id = service.emailid;
									jsonService.additionalrole = service.additionalroles;
									jsonService.firstname = service.firstname;
									jsonService.lastname = service.lastname;
									jsonService.role = service.defaultrole;
									jsonService.username = service.username.toLowerCase();
									selectedRole = selectedRole||jsonService.role;
									req.session.userid = service.userid;
									req.session.defaultRoleId = service.defaultrole;
									req.session.activeRoleId = selectedRole;
								} else {
									logger.info("User info not found");
									return res.send("invalid_username");
								}
							}
							callback();
						});
					} catch (exception) {
						logger.error(exception.message);
						return res.send("fail");
					}
				},
				loggedinRole: function (callback) {
					var inputs = {
						"roleid": [selectedRole]
					};
					var args = {
						data: inputs,
						headers: {
							"Content-Type": "application/json"
						}
					};
					logger.info("Calling NDAC Service from loggedinRole: getRoleNameByRoleId_Nineteen68");
					client.post(epurl + "login/getRoleNameByRoleId_Nineteen68", args,
						function (rolesResult, response) {
						if (response.statusCode != 200 || rolesResult.rows == "fail") {
							logger.error("Error occurred in loadUserInfo_Nineteen68 Error Code : ERRNDAC");
							return res.send("fail");
						} else {
							try {
								var rolename = rolesResult.rows[selectedRole];
								if (!rolename) {
									logger.error("User role not found");
									return res.send("fail");
								} else {
									if (selectedRole == req.session.defaultRoleId) req.session.defaultRole = rolename;
									req.session.activeRole = rolename;
									jsonService.rolename = req.session.defaultRole;
								}
								callback();
							} catch (exception) {
								logger.error(exception.message);
								return res.send("fail");
							}
						}
					});
				},
				//Service call to get the plugins accessible for the user
				userPlugins: function (callback) {
					try {
						var inputs = {
							"roleid": selectedRole,
							"query": "userPlugins"
						};
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
								logger.error("Error occurred in loadUserInfo_Nineteen68 Error Code : ERRNDAC");
								return res.send("fail");
							} else {
								try {
									if (pluginResult.rows.length === 0) {
										logger.info("User plugins not found");
										return res.send("fail");
									} else {
										var pluginsArr = [];
										var key = ["ALM", "APG", "Dashboard", "Dead Code Identifier", "Mindmap", "Neuron Graphs", "Oxbow Code Identifier", "Reports", "Utility", "Webocular"];
										var vals = Object.values(pluginResult.rows[0]);
										for(var i=0; i < key.length; i++){
											pluginsArr.push({
												"pluginName" : key[i],
												"pluginValue" : vals[i]
											});
										}
										jsonService.pluginsInfo = pluginsArr;
									}
								} catch (exception) {
									logger.error(exception.message);
									return res.send("fail");
								}
							}
							callback();
						});
					} catch (exception) {
						logger.error(exception.message);
						return res.send("fail");
					}
				}
			}, function (err, data) {
				if (err) {
					logger.error(err);
					return res.send("fail");
				} else {
					res.send(jsonService);
				}
			});
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
		return res.send("fail");
	}
};

//Get UserRoles By RoleId - Nineteen68
exports.getRoleNameByRoleId_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI service: getRoleNameByRoleId_Nineteen68");
		if (utils.isSessionActive(req.session)) {
			var roleList = req.body.role;
			var inputs = {
				"roleid": roleList
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
					logger.error("Error occurred in getRoleNameByRoleId_Nineteen68 Error Code : ERRNDAC");
					res.send("fail");
				} else {
					res.send(rolesResult.rows);
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

exports.logoutUser_Nineteen68 = function (req, res) {
	logger.info("Inside UI Service: logoutUser_Nineteen68");
	res.clearCookie('connect.sid');
	logger.info("%s logged out successfully", req.session.username);
	req.session.destroy();
	res.send('Session Expired');
};
