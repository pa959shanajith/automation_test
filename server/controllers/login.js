const logger = require('../../logger');
const utils = require('../lib/utils');
const configpath= require('../config/options');
const notifications = require('../notifications');
const bcrypt = require('bcryptjs');

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
			tandc : configpath.showEULA,
			// username : userData.name,
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
		if (userProfile.rolename != "Admin" && userProfile.tandc == "True"){
			const input_name = userProfile.username
			var funName = "loadUserInfo";
			inputs = {
				"input_name": input_name,
				"query": funName
			};
			const eulaData = await utils.fetchData(inputs, "login/checkTandC", fnName);
			if (eulaData == "fail"){
				userProfile.eulaData = "fail"
			}
		}
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
		else {
			notifications.notify("userUpdate", {field: "password", user: result});
			res.send(status);
		}
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