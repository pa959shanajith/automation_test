const uidsafe = require('uid-safe');
const logger = require('../../logger');
const utils = require('../lib/utils');
const configpath= require('../config/options');
const bcrypt = require('bcryptjs');

/**
 * @see : function to check whether projects are assigned for user
 * @author : vinay
 */
const checkAssignedProjects = async username => {
	const fnName = "checkAssignedProjects";
	logger.info("Inside " + fnName + " function");
	let assignedProjects = false;
	// Get user profile by username
	let inputs = { username };
	const userInfo = await utils.fetchData(inputs, "login/loadUser", fnName);
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
	const userRole = await utils.fetchData(inputs, "login/loadPermission", fnName);
	if (userRole == "fail") return ['fail'];
	else if (userRole === null) return ["invalid_username_password"];
	else return [null, userid, userRole.rolename, assignedProjects];
}

// Check User login State - Avo Assure
exports.checkUserState = async (req, res) => {
	try {
		logger.info("Inside UI Service: checkUserState");
		const sess = req.session;
		if (sess && (sess.emsg || sess.username)) {
			let emsg = req.session.emsg || "ok";
			if (emsg == "ok") {
				const username = sess.username;
				const data = await checkAssignedProjects(username);
				const err = data[0];
				if(err) {
					logger.error("Error occurred in checkUserState. Cause: "+ err);
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

// Check User login State - Avo Assure
exports.checkUser = async (req, res) => {
	const fnName = "checkUser";
	try {
		logger.info("Inside UI Service: " + fnName);
		const inputs = 	{ "username": req.body.username };
		const userInfo = await utils.fetchData(inputs, "login/loadUser", fnName);
		let result = { "proceed": true };
		if (userInfo == "fail") return res.send("fail");
		else if (userInfo && userInfo.auth) {
			const uType = userInfo.auth.type;
			if (["saml","oidc"].indexOf(uType) > -1) result.redirect = "/login/" + uType;
		}
		return res.send(result);
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

//Load User Information - Avo Assure
exports.loadUserInfo = async (req, res) => {
	const fnName = "loadUserInfo";
	try {
		logger.info("Inside UI Service: " + fnName);
		const username = req.session.username;
		const userType = req.session.usertype;
		let inputs = { username };
		const userData = await utils.fetchData(inputs, "login/loadUser", fnName);
		if (userData == "fail") return res.send("fail");
		const userProfile = {
			user_id: userData._id,
			username: userData.name.toLowerCase(),
			email_id: userData.email,
			additionalrole: userData.addroles,
			firstname: userData.firstname,
			lastname: userData.lastname,
			role: userData.defaultrole,
			taskwflow: configpath.strictTaskWorkflow,
			token: configpath.defaultTokenExpiry,
			dbuser: userType=="inhouse",
			ldapuser: userType=="ldap",
			samluser: userType=="saml",
			openiduser: userType=="oidc",
		};
		const selectedRole = req.body.selRole || userProfile.role;
		req.session.userid = userData._id;
		req.session.defaultRoleId = userData.defaultrole;
		req.session.activeRoleId = selectedRole;
		req.session.emailid = userData.email,
		req.session.additionalroles = userData.addroles,
		req.session.firstname = userData.firstname,
		req.session.lastname = userData.lastname,

		inputs = {
			"roleid": selectedRole,
			"query": "permissionInfoByRoleID"
		};
		const permData = await utils.fetchData(inputs, "login/loadPermission", fnName);
		if (permData == "fail") return res.send("fail");
		const rolename = permData.rolename;
		if (!rolename) {
			logger.error("User role not found");
			return res.send("fail");
		}
		if (permData.pluginresult.length === 0) {
			logger.info("User plugins not found");
			return res.send("fail");
		}
		if (selectedRole == req.session.defaultRoleId) req.session.defaultRole = rolename;
		req.session.activeRole = rolename;
		userProfile.rolename = req.session.defaultRole;
		userProfile.pluginsInfo = permData.pluginresult;
		userProfile.page = (userProfile.rolename == "Admin")? "admin":"plugin";
		return res.send(userProfile);
	} catch (exception) {
		logger.error(exception.message);
		return res.send("fail");
	}
};

//Get UserRoles By RoleId - Avo Assure
exports.getRoleNameByRoleId = async (req, res) => {
	const fnName = "getRoleNameByRoleId";
	logger.info("Inside UI service: " + fnName);
	try {
		const inputs = {
			"roleid": req.body.role,
			"query":"nameidInfoByRoleIDList"
		};
		const rolesResult = await utils.fetchData(inputs, "login/loadPermission", fnName)
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

// Reset Current password
exports.resetPassword = async (req, res) => {
	const fnName = "resetPassword";
	logger.info("Inside UI Service: " + fnName);
	try {
		if (req.session.usertype != "inhouse") return res.send("fail");
		const username = req.session.username;
		const currpassword = req.body.currpassword;
		const newpassword = req.body.newpassword;
		let inputs = { username };
		const result = await utils.fetchData(inputs, "login/loadUser", fnName);
		if (result == "fail") return res.send("fail");
		const dbpassword = result.auth.password;
		const validUser = bcrypt.compareSync(currpassword, dbpassword);
		if (!validUser) return res.send("incorrect");
		if (currpassword == newpassword) return res.send("same");
		const password = bcrypt.hashSync(newpassword, bcrypt.genSaltSync(10));
		inputs = {
			action: "resetpassword",
			userid: req.session.userid,
			name: req.session.username,
			modifiedby: req.session.userid,
			modifiedbyrole: req.session.activeRoleId,
			password: password
		};
		const status = await utils.fetchData(inputs, "admin/manageUserDetails", fnName);
		if (status == "fail" || status == "forbidden") return res.send("fail");
		else res.send(status);
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.logoutUser = async (req, res) => {
	logger.info("Inside UI Service: logoutUser");
	logger.info("%s logged out successfully", req.session.username);
	req.logOut();
	req.clearSession();
	res.send('Session Expired');
};