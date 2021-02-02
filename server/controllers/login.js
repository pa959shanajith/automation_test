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

// Reset Current password
exports.resetPassword = async (req, res) => {
	const fnName = "resetPassword";
	logger.info("Inside UI Service: " + fnName);
	try {
		let regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		if (req.session.usertype != "inhouse") return res.send("fail");
		const username = req.session.username;
		const currpassword = req.body.currpassword;
		const newpassword = req.body.newpassword;
		if (!regexPassword.test(currpassword)) {
			logger.error("Error occurred in login/"+fnName+": Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");
			return rers.send("fail");
		}
		if (!regexPassword.test(newpassword)) {
			logger.error("Error occurred in login/"+fnName+": Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");
			return rers.send("fail");
		}
		let inputs = { username };
		const result = await utils.fetchData(inputs, "login/loadUser", fnName);
		if (result == "fail") return res.send("fail");
		else {
			var passHistory = result.passwordhistory;
			const dbpassword = result.auth.password;
			const validUser = bcrypt.compareSync(currpassword, dbpassword);
			if (!validUser) return res.send("incorrect");
			if (currpassword == newpassword) return res.send("same");
			if (bcrypt.compareSync(newpassword, dbpassword)) return res.send("reusedPass")
			else {
				for(var i=0;i<passHistory.length;++i) {
					if(bcrypt.compareSync(newpassword, passHistory[i])) {
						return res.send("reusedPass")
					}
				}
			}
		}
		const password = bcrypt.hashSync(newpassword, bcrypt.genSaltSync(10));
		const oldPassword = bcrypt.hashSync(currpassword, bcrypt.genSaltSync(10));
		
		inputs = {
			action: "resetpassword",
			userid: req.session.userid,
			name: req.session.username,
			modifiedby: req.session.userid,
			modifiedbyrole: req.session.activeRoleId,
			password: password,
			oldPassword: oldPassword
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
		let regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		const username = req.body.username;
		const currpassword = req.body.currpassword;
		const newpassword = req.body.newpassword;
		if (!regexPassword.test(newpassword)) {
			logger.error("Error occurred in login/"+fnName+": Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");
			return res.send("fail");
		}
		let inputs = { username };
		const result = await utils.fetchData(inputs, "login/loadUser", fnName);
		if (result == "fail") return res.send("fail");
		else {
			var passHistory = result.passwordhistory;
			const dbpassword = result.auth.password;
			const validUser = bcrypt.compareSync(currpassword, result.defaultpassword);
			if (!validUser) return res.send("incorrect");
			if (bcrypt.compareSync(newpassword, dbpassword)) return res.send("reusedPass")
			else {
				for(var i=0;i<passHistory.length;++i) {
					if(bcrypt.compareSync(newpassword, passHistory[i])) {
						return res.send("reusedPass")
					}
				}
			}
		}
		const password = bcrypt.hashSync(newpassword, bcrypt.genSaltSync(10));
		const oldPassword = bcrypt.hashSync(result.auth.password, bcrypt.genSaltSync(10));
		
		inputs = {
			action: "changepassword",
			name: req.body.username,
			password: password,
			oldPassword: oldPassword
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
	//res.clearCookie('XSRF-TOKEN');
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