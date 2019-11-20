var async = require('async');
var uidsafe = require('uid-safe');
var epurl = process.env.NDAC_URL;
var Client = require("node-rest-client").Client;
var client = new Client();
var logger = require('../../logger');
var utils = require('../lib/utils');
var configpath= require('../config/options');
var taskflow = configpath.strictTaskWorkflow;
var bcrypt = require('bcryptjs');
var admin=require('../controllers/admin');


/**
 * @see : function to check whether projects are assigned for user
 * @author : vinay
 */
function checkAssignedProjects(username, main_callback) {
	logger.info("Inside checkAssignedProjects function");
	var assignedProjects = false;
	var flag = 'fail';
	async.waterfall([
		function getUserInfo(callback) {
			var inputs = {
				"username": username,
				"query": "userInfobyName"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from getUserInfo :loadUser_Nineteen68");
			client.post(epurl + "login/loadUser_Nineteen68", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in loadUser_Nineteen68 Error Code : ERRNDAC");
					callback(flag);
				} else if (result.rows.length !== 0) {
					var userid = result.rows._id;
					var roleid = result.rows.defaultrole;
					if (result.rows.projects != null) {
						assignedProjects = result.rows.projects.length!==0;
					}
					callback(null, userid, roleid, assignedProjects);
				} else callback("invalid_username_password");
			});
		},
		function getUserRole(userid,roleid,assignedProjects, callback) {
			var inputs = {
				"roleid": roleid,
				"query": "permissionInfoByRoleID"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from getUserRole :loadPermission_Nineteen68");
			client.post(epurl + "login/loadPermission_Nineteen68", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in loadPermission_Nineteen68 Error Code : ERRNDAC");
					callback(flag);
				} else if (result.rows !== null) {
					var rolename = result.rows.rolename;
					callback(null,assignedProjects, userid, rolename);
				} else {
					callback("invalid_username_password");
				}
			});
		}
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
			jsonService.ldapuser = req.session.ldapuser;
			async.waterfall([
				function userInfo(callback) {
					var inputs = {
						"username": userName,
						"query": "userInfobyName"
					};
					var args = {
						data: inputs,
						headers: {
							"Content-Type": "application/json"
						}
					};
					logger.info("Calling NDAC Service from userInfo : loadUser_Nineteen68");
					client.post(epurl + "login/loadUser_Nineteen68", args,
						function (result, response) {
						if (response.statusCode != 200 || result.rows == "fail") {
							logger.error("Error occurred in loadUser_Nineteen68 Error Code : ERRNDAC");
							callback("fail");
						} else {
							var service = result.rows;
							jsonService.user_id = service._id;
							jsonService.email_id = req.session.emailid = service.email;
							jsonService.additionalrole = req.session.additionalroles = service.addroles;
							jsonService.firstname = req.session.firstname = service.firstname;
							jsonService.lastname = req.session.lastname = service.lastname;
							jsonService.role = service.defaultrole;
							jsonService.taskwflow = taskflow;
							jsonService.username = service.name.toLowerCase();
							selectedRole = selectedRole||jsonService.role;
							req.session.userid = service._id;
							req.session.defaultRoleId = service.defaultrole;
							req.session.activeRoleId = selectedRole;
							callback(null);
						}
					});
				},
				function loggedinRole(callback) {
					var inputs = {
						"roleid": selectedRole,
						"query": "permissionInfoByRoleID"
					};
					var args = {
						data: inputs,
						headers: {
							"Content-Type": "application/json"
						}
					};
					logger.info("Calling NDAC Service from loggedinRole: loadPermission_Nineteen68");
					client.post(epurl+ "login/loadPermission_Nineteen68", args,
						function (result, response) {
						if (response.statusCode != 200 || result.rows == "fail") {
							logger.error("Error occurred in loadPermission_Nineteen68 Error Code : ERRNDAC");
							callback("fail");
						} else {
							var rolename = result.rows.rolename;
							if (!rolename) {
								logger.error("User role not found");
								callback("fail");
							} else {
								if (result.rows.pluginresult.length === 0) {
									logger.info("User plugins not found");
									callback("fail");
								} else {
									jsonService.pluginsInfo = result.rows.pluginresult;
								}
								if (selectedRole == req.session.defaultRoleId) req.session.defaultRole = rolename;
								req.session.activeRole = rolename;
								jsonService.rolename = req.session.defaultRole;
								jsonService.page = (jsonService.rolename == "Admin")? "admin":"plugin";
								callback(null);
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
				"roleid": roleList,
				"query":"nameidInfoByRoleIDList"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service: loadPermission_Nineteen68");
			client.post(epurl + "login/loadPermission_Nineteen68", args,
				function (rolesResult, response) {
				if (response.statusCode != 200 || rolesResult.rows == "fail") {
					logger.error("Error occurred in loadPermission_Nineteen68 Error Code : ERRNDAC");
					res.send("fail");
				} else {
					result={}
					for(i=0;i<rolesResult.rows.length;i++){
						result[rolesResult.rows[i]._id]=rolesResult.rows[i].name
					}
					res.send(result);
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

// Get Current password - Nineteen68
exports.resetPassword_Nineteen68 = function(req, res) {
	logger.info("Inside UI Service: resetPassword_Nineteen68");
	var username = req.session.username;
	var currpassword = req.body.currpassword;
	var newpassword = req.body.newpassword;
	var inputs = {
		"username": username,
		"query":'userInfobyName'
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service: loadUser_Nineteen68");
	client.post(epurl + "login/loadUser_Nineteen68", args,
		function (result, response) {
		if (response.statusCode != 200 || result.rows == "fail") {
			logger.error("Error occurred in loadUser_Nineteen68 Error Code : ERRNDAC");
			res.send("fail");
		} else {
			password = result.rows.password;
			validUser = bcrypt.compareSync(currpassword, password);
			if (validUser){
				if (currpassword == newpassword){
					res.send("same");
				} else{
					var action = "update";
					var userObj = {
						userid: req.session.userid,
						username: req.session.username.toLowerCase(),
						password: newpassword,
						firstname: req.session.firstname,
						lastname: req.session.lastname,
						email: req.session.emailid,
						role: req.session.activeRoleId,
						addRole: req.session.additionalroles,
						ldapUser: false
					};
					req.body = {"action": action, "user": userObj};
					admin.manageUserDetails(req, res);
				}
			} else{
				res.send("incorrect");
			}
		}
	});
};

exports.logoutUser_Nineteen68 = function (req, res) {
	logger.info("Inside UI Service: logoutUser_Nineteen68");
	logger.info("%s logged out successfully", req.session.username);
	req.logOut();
	req.clearSession();
	res.send('Session Expired');
};