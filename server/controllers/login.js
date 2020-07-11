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
const checkAssignedProjects = async username => {
	const fnName = "checkAssignedProjects";
	logger.info("Inside " + fnName + " function");
	let assignedProjects = false;
	// Get user profile by username
	let inputs = {
		"username": username
	};
	const userInfo = await utils.fetchData(inputs, "login/loadUser_Nineteen68", fnName);
	if (userInfo == "fail") return ['fail'];
	else if (userInfo.length === 0) return ["invalid_username_password"];
	const userid = userInfo._id;
	const roleid = userInfo.defaultrole;
	if (userInfo.projects != null) assignedProjects = userInfo.projects.length !== 0;
	// Get Rolename by role id
	inputs = {
		"roleid": roleid,
		"query": "permissionInfoByRoleID"
	};
	const userRole = await utils.fetchData(inputs, "login/loadPermission_Nineteen68", fnName);
	if (userRole == "fail") return ['fail'];
	else if (userRole === null) return ["invalid_username_password"];
	else return [null, userid, userRole.rolename, assignedProjects];
}

// Check User login State - Nineteen68
exports.checkUserState_Nineteen68 = async (req, res) => {
	try {
		logger.info("Inside UI Service: checkUserState_Nineteen68");
		const sess = req.session;
		if (sess && (sess.emsg || sess.username)) {
			let emsg = req.session.emsg || "ok";
			if (emsg == "ok") {
				const username = sess.username;
				const data = await checkAssignedProjects(username);
				const err = data[0];
				if(err) {
					logger.error("Error occurred in checkUserState_Nineteen68. Cause: "+ err);
					emsg = err;
				} else {
					const userid = data[1];
					const role = data[2];
					const assignedProjects = data[3];
					if (role != "Admin" && !assignedProjects) {
						emsg = "noProjectsAssigned";
						logger.info("User has not been assigned any projects");
					} else {
						req.session.userid = userid;
						req.session.ip = req.ip;
						req.session.loggedin = (new Date()).toISOString();
					}
				}
			}
			if (sess.dndSess) {
				await utils.cloneSession(req);
				emsg = "reload";
			} else {
				if (emsg == "ok") res.cookie('maintain.sid', uidsafe.sync(24), {path: '/', httpOnly: true, secure: true, signed:true});
				else req.clearSession();
			}
			return res.send(emsg);
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
						"username": userName
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
exports.getRoleNameByRoleId_Nineteen68 = async (req, res) => {
	const fnName = "getRoleNameByRoleId_Nineteen68";
	logger.info("Inside UI service: " + fnName);
	try {
		const inputs = {
			"roleid": req.body.role,
			"query":"nameidInfoByRoleIDList"
		};
		const rolesResult = await utils.fetchData(inputs, "login/loadPermission_Nineteen68", fnName)
		let result = {};
		if (rolesResult == "fail") result = "fail";
		else {
			for(let role of rolesResult) {
				result[role._id] = role.name;
			}
		}
		res.send(result);
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
		"username": username
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

exports.logoutUser_Nineteen68 = async (req, res) => {
	logger.info("Inside UI Service: logoutUser_Nineteen68");
	logger.info("%s logged out successfully", req.session.username);
	req.logOut();
	req.clearSession();
	res.send('Session Expired');
};