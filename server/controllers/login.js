var async = require('async');
var uidsafe = require('uid-safe');
var epurl = process.env.NDAC_URL;
var Client = require("node-rest-client").Client;
var client = new Client();
var logger = require('../../logger');
var utils = require('../lib/utils');
var configpath= require('../config/options');
var taskflow = configpath.strictTaskWorkflow;

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
				} else callback("invalid_username_password");
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

// Check User login State - Nineteen68
exports.checkUserState_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI Service: checkUserState_Nineteen68");
		var sess = req.session;
		if (sess && (sess.emsg || sess.username)) {
			var emsg = req.session.emsg || "ok";
			async.series({
				checkProjects_ifOK: function(callback) {
					if (emsg != "ok") callback(emsg);
					else {
						var username = sess.username;
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
				if (sess.dndSess) utils.cloneSession(req, function(err){ return res.send("reload"); });
				else {
					if (emsg == "ok") res.cookie('maintain.sid', uidsafe.sync(24), {path: '/', httpOnly: true, secure: true, signed:true});
					else req.clearSession();
					return res.send(emsg);
				}
			});
		} else {
			logger.info("Invalid Session");
			req.clearSession();
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
		req.clearSession();
		res.send("fail");
	}
};

//Load User Information - Nineteen68
exports.loadUserInfo_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI Service: loadUserInfo_Nineteen68");
		if (utils.isSessionActive(req)) {
			var selectedRole = req.body.selRole;
			var userName = req.session.username;
			var jsonService = {};
			jsonService.token = configpath.defaultTokenExpiry;
			async.waterfall([
				function userInfo(callback) {
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
							callback("fail");
						} else {
							var service = userResult.rows[0];
							jsonService.user_id = service.userid;
							jsonService.email_id = service.emailid;
							jsonService.additionalrole = service.additionalroles;
							jsonService.firstname = service.firstname;
							jsonService.lastname = service.lastname;
							jsonService.role = service.defaultrole;
							jsonService.taskwflow = taskflow;
							jsonService.username = service.username.toLowerCase();
							selectedRole = selectedRole||jsonService.role;
							req.session.userid = service.userid;
							req.session.defaultRoleId = service.defaultrole;
							req.session.activeRoleId = selectedRole;
							callback(null);
						}
					});
				},
				function loggedinRole(callback) {
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
							callback("fail");
						} else {
							var rolename = rolesResult.rows[selectedRole];
							if (!rolename) {
								logger.error("User role not found");
								callback("fail");
							} else {
								if (selectedRole == req.session.defaultRoleId) req.session.defaultRole = rolename;
								req.session.activeRole = rolename;
								jsonService.rolename = req.session.defaultRole;
								jsonService.page = (jsonService.rolename == "Admin")? "admin":"plugin";
								callback(null);
							}
						}
					});
				},
				//Service call to get the plugins accessible for the user
				function userPlugins(callback) {
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
							callback("fail");
						} else {
							if (pluginResult.rows.length === 0) {
								logger.info("User plugins not found");
								callback("fail");
							} else {
								jsonService.pluginsInfo = pluginResult.rows;
								callback();
							}
						}
					});
				}
			], function (err) {
				if (err) jsonService = err;
				return res.send(jsonService);
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
		if (utils.isSessionActive(req)) {
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
	logger.info("%s logged out successfully", req.session.username);
	req.logOut();
	req.clearSession();
	res.send('Session Expired');
};
