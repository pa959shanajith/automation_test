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
		let inputs = { username, fnName };
		const userData = await utils.fetchData(inputs, "login/loadUser", fnName);
    if (userData === "Licence Expired") return res.send("Licence Expired");
		if (userData == "fail") return res.send("fail");
		const userProfile = {
			user_id: userData._id,
			username: userData.name.toLowerCase(),
			email_id: userData.email,
			additionalrole: userData.addroles,
			firstname: userData.firstname,
			lastname: userData.lastname,
			createdon: userData.createdon,
			role: userData.defaultrole,
			isadminuser:userData.isAdminUser,
			userimage: userData.profileimage || '',
			taskwflow: configpath.strictTaskWorkflow,
			token: configpath.defaultTokenExpiry,
			dateformat: configpath.dateFormat,
			dbuser: userType=="inhouse",
			ldapuser: userType=="ldap",
			samluser: userType=="saml",
			openiduser: userType=="oidc",
			welcomeStepNo: typeof userData.welcomeStepNo === "number"?  userData.welcomeStepNo : undefined,
			firstTimeLogin: typeof userData.firstTimeLogin === "boolean"?  userData.firstTimeLogin : undefined
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
		userProfile.page = (userProfile.rolename == "Admin")? "admin":"landing";
		userProfile.tandc = false;
		userProfile.isTrial = permData.isTrial;
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
const verifyPasswordHistory = async (uData) => {
	const fnName = "verifyPasswordHistory";
	let {username, newpass, oldpass} = uData;
	const userDet = await utils.fetchData({ username,fnName }, "login/loadUser", fnName);
	if (userDet == "fail") return "fail";
	uData.user = userDet;
	oldpass = uData.oldpass = userDet.auth.password;
	const passHistory = userDet.auth.passwordhistory;
	if (uData.currpass!=undefined && !bcrypt.compareSync(uData.currpass, oldpass)) return "invalid";
	if (uData.currdefpass!=undefined && !bcrypt.compareSync(uData.currdefpass, userDet.auth.defaultpassword)) return "invalid";
	if (bcrypt.compareSync(newpass, oldpass)) return "same";
	for (let pass of passHistory) {
		if (bcrypt.compareSync(newpass, pass)) return "reuse";
	}
	return "valid";
};

exports.verifyPasswordHistory = verifyPasswordHistory;

// Reset Current password
exports.resetPassword = async (req, res) => {
	const fnName = "resetPassword";
	logger.info("Inside UI Service: " + fnName);
	try {
    if(req.body.userData){
      const user = req.body.userData;
      const newpassword = req.body.newpassword;
      const userData = {username:user.name, newpass: newpassword, oldpass: user.auth.password?user.auth.password:""};
      const fresh = await verifyPasswordHistory(userData);
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
        name: user.name,
        user_id: userData.user._id,
        modifiedby: userData.user._id,
        modifiedbyrole: userData.user.defaultrole,
        password: password,
        oldPassword: userData.oldpass
      };
      const status = await utils.fetchData(inputs, "admin/manageUserDetails", fnName);
      if (status == "fail" || status == "forbidden") return res.send("fail");
      else {
        notifications.notify("userUpdate", {field: "password", user: userData.user});
        return res.send(status);
      }
    }
		let {username, usertype} = req.session;
		let resetFlag = false;
		const loggedUser = req._passport.instance.verifySession(req);
		if (!loggedUser && req.user) {
			username = req.user.username;
			usertype = req.user.type;
			resetFlag = true;
		} else if (!loggedUser) {
			return res.status(401).send("Invalid Session");
		}
		if (usertype != "inhouse") return res.send("fail");
		const currpassword = req.body.currpassword;
		const newpassword = req.body.newpassword;
		if (!regexPassword.test(newpassword)) {
			logger.error("Error occurred in login/"+fnName+": Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase alphabet, length should be minimum 8 characters and maximum 16 characters.");
			return res.send("insuff");
		}

		const userData = {username, newpass: newpassword, oldpass: ''};
		if (resetFlag) userData.currdefpass = currpassword;
		else userData.currpass = currpassword;
		const fresh = await verifyPasswordHistory(userData);
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
			name: username,
			user_id: userData.user._id,
			modifiedby: userData.user._id,
			modifiedbyrole: userData.user.defaultrole,
			password: password,
			oldPassword: userData.oldpass
		};
		const status = await utils.fetchData(inputs, "admin/manageUserDetails", fnName);
		if (status == "fail" || status == "forbidden") return res.send("fail");
		else {
			notifications.notify("userUpdate", {field: "password", user: userData.user});
			res.send(status);
		}
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

// Update Current password for new users
exports.updatePassword = async (req, res) => {
	const fnName = "updatePassword";
	logger.info("Inside UI Service: " + fnName);
	try {
		// let {username, usertype} = req.session;
		// let resetFlag = false;
		// const loggedUser = req._passport.instance.verifySession(req);
		// if (!loggedUser && req.user) {
		// 	username = req.user.username;
		// 	usertype = req.user.type;
		// 	resetFlag = true;
		// } else if (!loggedUser) {
		// 	return res.status(401).send("Invalid Session");
		// }
		// if (usertype != "inhouse") return res.send("fail");
		const newpassword = req.body.newpassword;
		// if (!regexPassword.test(newpassword)) {
		// 	logger.error("Error occurred in login/"+fnName+": Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase alphabet, length should be minimum 8 characters and maximum 16 characters.");
		// 	return res.send("insuff");
		// }

		// const userData = {username, newpass: newpassword, oldpass: ''};
		// userData["user"] =  req.body.userObj;

		const password = bcrypt.hashSync(newpassword, bcrypt.genSaltSync(10));
		const inputs = {
			action: "resetpassword",
			name: "self.updating", // temporary name used, will not go to db
			// userid: userData.user._id,
			// modifiedby: userData.user._id,
			// modifiedbyrole: userData.user.defaultrole,
			user_id:req.body.user_id,
			password: password,
		};
		const status = await utils.fetchData(inputs, "admin/manageUserDetails", fnName);
		if (status == "fail" || status == "forbidden") return res.send("fail");
		else {
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