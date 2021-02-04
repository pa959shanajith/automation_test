const logger = require('../../logger');
const utils = require('../lib/utils');
const configpath= require('../config/options');
const notifications = require('../notifications');
const bcrypt = require('bcryptjs');
const regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;

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
		userProfile.tandc = false;
		if (userProfile.rolename != "Admin" && configpath.showEULA) {
			inputs = {
				"username": userProfile.username,
				"query": "loadUserInfo"
			};
			const eulaData = await utils.fetchData(inputs, "login/checkTandC", fnName);
			if (eulaData != "success") userProfile.tandc = true;
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

// Return if new password provided is acceptable based on password history or not
exports.verifyPasswordHistory = async (uData) => {
	const fnName = "verifyPasswordHistory";
	let {username, newpass, oldpass} = uData;
	const userDet = await utils.fetchData({ username }, "login/loadUser", fnName);
	if (userDet == "fail") return "fail";
	uData.user = userDet;
	oldpass = uData.oldpass = userDet.auth.password;
	const passHistory = userDet.passwordhistory;
	if (uData.currpass && !bcrypt.compareSync(uData.currpass, oldpass)) return "invalid"
	if (bcrypt.compareSync(newpass, oldpass)) return "same";
	for (let pass of passHistory) {
		if (bcrypt.compareSync(newpass, pass)) return "reuse";
	}
	return "valid";
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
		if (!regexPassword.test(newpassword)) {
			logger.error("Error occurred in login/"+fnName+": Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase alphabet, length should be minimum 8 characters and maximum 16 characters.");
			return res.send("insuff");
		}

		const userData = {username, currpass: currpassword, newpass: newpassword, oldpass: ''};
		const fresh = await login.verifyPasswordHistory(userData);
		if (fresh == "fail") {
			logger.error("Error occurred in login/"+fnName+": Unable to retrive user profile");
			return res.status(500).send("fail");
		} else if (fresh == "reuse") {
			logger.error("Error occurred in login/"+fnName+": Password provided does not meet length, complexity or history requirements of application.");
			return res.send("reusedPass");
		} else if (fresh == "same") {
			logger.error("Error occurred in login/"+fnName+": New Password provided is same as old password.");
			return res.send("same");
		} else if (fresh == "invalid") {
			logger.error("Error occurred in login/"+fnName+": Current Password provided is incorrect.");
			return res.send("incorrect");
		}

		const password = bcrypt.hashSync(newpassword, bcrypt.genSaltSync(10));
		const inputs = {
			action: "resetpassword",
			userid: req.session.userid,
			name: req.session.username,
			modifiedby: req.session.userid,
			modifiedbyrole: req.session.activeRoleId,
			password: password,
			oldPassword: userData.oldpass
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

// Reset Current password on Forgot Password
exports.changePassword = async (req, res) => {
	const fnName = "changePassword";
	logger.info("Inside UI Service: " + fnName);
	try {
		const username = req.body.username;
		const currpassword = req.body.currpassword;
		const newpassword = req.body.newpassword;
		if (!regexPassword.test(newpassword)) {
			logger.error("Error occurred in login/"+fnName+": Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase alphabet, length should be minimum 8 characters and maximum 16 characters.");
			return res.send("insuff");
		}
		const userData = {username, newpass: newpassword, oldpass: ''};
		const fresh = await login.verifyPasswordHistory(userData);
		if (fresh == "fail") {
			logger.error("Error occurred in login/"+fnName+": Unable to retrive user profile");
			return res.status(500).send("fail");
		} else {
			const validUser = bcrypt.compareSync(currpassword, fresh.user.defaultpassword);
			if (!validUser) {
				logger.error("Error occurred in login/"+fnName+": Current Password provided is incorrect.");
				return res.send("incorrect");
			}
			if (fresh == "reuse") {
				logger.error("Error occurred in login/"+fnName+": Password provided does not meet length, complexity or history requirements of application.");
				return res.send("reusedPass");
			} else if (fresh == "same") {
				logger.error("Error occurred in login/"+fnName+": New Password provided is same as old password.");
				return res.send("same");
			}
		}

		const password = bcrypt.hashSync(newpassword, bcrypt.genSaltSync(10));
		const inputs = {
			action: "changepassword",
			name: req.body.username,
			password: password,
			oldPassword: userData.oldpass
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

exports.storeUserDetails = async (req, res) => {
	const fnName = "storeUserDetails";
	try {
		logger.info("Inside UI Service: " + fnName);
		const userDetails = req.body.userDetails;
		const username = req.session.username;
		const uId = req.session.userid;
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		const inputs = {
			"username": username,
			"userId" : uId,
			"fullname": userDetails.fullname,
			"email": userDetails.emailaddress,
			"acceptance": userDetails.acceptance,
			"timestamp" : userDetails.timestamp,
			"ip" : ip,
			"browserfingerprint" : userDetails.browserfp,
			"query": "checkTandC"
		};
		const status = await utils.fetchData(inputs, "login/checkTandC", fnName);
		if (status == "fail" || status == "forbidden") return res.send("fail");
		else res.send(status);
	} catch (exception) {
		logger.error(exception.message);
		return res.send("fail");
	}
};