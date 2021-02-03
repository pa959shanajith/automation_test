const bcrypt = require('bcryptjs');
const TokenGenerator = require('uuid-token-generator')
const async = require('async');
const fs = require('fs');
const archiver = require('archiver');
const activeDirectory = require('activedirectory');
const Client = require("node-rest-client").Client;
const client = new Client();
const epurl = process.env.DAS_URL;
const validator =  require('validator');
const logger = require('../../logger');
const utils = require('../lib/utils');
const notifications = require('../notifications');
const queue = require("../lib/executionQueue")

//GetUserRoles
exports.getUserRoles = async (req, res) => {
	const fnName = "getUserRoles";
	logger.info("Inside UI service: " + fnName);
	try {
		const result = await utils.fetchData({}, "admin/getUserRoles", fnName);
		if (result == "fail") res.status(500).send("fail");
		else {
			const rolesList = [];
			for (let role of result) {
				rolesList.push([role.name, role._id]);
			}
			res.send(rolesList);
		}
	} catch (exception) {
		logger.error("Error occurred in "+fnName+":", exception);
		res.status(500).send("fail");
	}
};

// Create/Edit/Delete Users
exports.manageUserDetails = async (req, res) => {
	const fnName = "manageUserDetails";
	logger.info("Inside UI Service: " + fnName);
	try {
		let flag = ['2','0','0','0','0','0','0','0','0'];
		const reqData = req.body.user;
		const action = req.body.action;
		const internalUser = reqData.type == "inhouse";
		let inputs = {
			action: action,
			createdby: req.session.userid,
			createdbyrole: reqData.role,
			name: (reqData.username || "").trim(),
			auth: {
				type: reqData.type,
				password: reqData.password || ""
			},
		};

		if (validator.isEmpty(action) || ["create","update","delete"].indexOf(action) == -1) {
			logger.error("Error occurred in admin/"+fnName+": Invalid action.");
			flag[1]='1';
		}
		if (!validator.isLength(inputs.name,1,100)) {
			logger.error("Error occurred in admin/"+fnName+": Invalid User name.");
			flag[2]='1';
		}
		if (action != "create") {
			inputs.userid = (reqData.userid || "").trim();
		}
		if (action != "delete") {
			if (internalUser) {
				if (validator.isEmpty(inputs.auth.password) && !(validator.isLength(inputs.auth.password,1,12))) {
					logger.error("Error occurred in admin/"+fnName+": Invalid Password.");
					flag[5]='1';
				}
			}
			if (inputs.auth.password != '') {
				const salt = bcrypt.genSaltSync(10);
				inputs.auth.password = bcrypt.hashSync(inputs.auth.password, salt);
			} else delete inputs.auth.password;
			inputs.firstname = (reqData.firstname || "").trim();
			inputs.lastname = (reqData.lastname || "").trim();
			inputs.email = (reqData.email || "").trim();
			inputs.defaultrole = (reqData.role || "").trim();

			if (!validator.isLength(inputs.firstname,1,100)) {
				logger.error("Error occurred in admin/"+fnName+": Invalid First name.");
				flag[3]='1';
			}
			if (!validator.isLength(inputs.lastname,1,100)) {
				logger.error("Error occurred in admin/"+fnName+": Invalid Last name.");
				flag[4]='1';
			}
			if (!validator.isLength(inputs.email,1,100)) {
				logger.error("Error occurred in admin/"+fnName+": Email cannot be empty.");
				flag[6]='1';
			}
			if (action == "update") {
				inputs.additionalroles = reqData.addRole || [];
			}
			if (!internalUser) {
				inputs.auth.server = reqData.server;
				if (!inputs.auth.server || validator.isEmpty(inputs.auth.server)) {
					logger.error("Error occurred in admin/"+fnName+": Invalid Authentication Server.");
					flag[7]='1';
				}
				if (inputs.auth.type == "ldap") {
					inputs.auth.user = reqData.ldapUser;
					if (validator.isEmpty(inputs.auth.user)) {
						logger.error("Error occurred in admin/"+fnName+": Invalid User Domain Name.");
						flag[8]='1';
					}
				}
			}
		}
		flag = flag.join('');
		if (flag != "200000000") {
			return res.send(flag);
		}
		const result = await utils.fetchData(inputs, "admin/manageUserDetails", fnName);
		if (result == "fail" || result == "forbidden") res.status(500).send("fail");
		else res.send(result);
	} catch (exception) {
		logger.error("Error occurred in admin/"+fnName, exception);
		res.status(500).send("fail");
	}
};

// Fetch Users or a specific user details
exports.getUserDetails = async (req, res) => {
	logger.info("Inside UI Service: getUserDetails");
	try {
		const action = req.body.action;
		const userid = req.body.args;
		let inputs = {};
		if (action != "user") inputs.userid = userid;
		const result = await utils.fetchData(inputs, "admin/getUserDetails", "getUserDetails");
		if (result == "fail") res.status(500).send("fail");
		else if (result.length == 0) res.send("empty");
		else {
			let data = [];
			if (action == "user") {
				for (let row of result) {
					data.push([row.name, row._id, row.defaultrole, row.rolename]);
				}
			} else {
				data = {
					userid: userid,
					username: result.name,
					password: '',
					firstname: result.firstname,
					lastname: result.lastname,
					email: result.email,
					role: result.defaultrole,
					rolename: result.rolename,
					addrole: result.addroles,
					type: result.auth.type,
					server: result.auth.server || '',
				};
				if (result.auth.user) data.ldapuser = result.auth.user;
			}
			return res.send(data);
		}
	} catch (exception){
		logger.error("Error occurred in admin/getUserDetails", exception);
		res.status(500).send("fail");
	}
};

exports.getDomains_ICE = async (req, res) => {
	const fnName = "getDomains_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		const result = await utils.fetchData({}, "admin/getDomains_ICE", fnName);
		if (result == "fail") return res.send("fail");
		else return res.send(result);
	} catch (exception) {
		logger.error("Error occurred in admin/"+fnName+":", exception);
		res.status(500).send("fail");
	}
};

//Generate Token for CI User
exports.manageCIUsers = async (req, res) => {
	const fnName = "manageCIUsers";
	logger.info("Inside UI service: " + fnName);
	try {
		const requestDetails = req.body.CIUser;
		let token = '';
		let inputs = {
			type: "TOKENS",
			action: req.body.action,
			userid: requestDetails.userId,
			name: requestDetails.tokenName
		}
		if (req.body.action=="create") {
			const tokgen2 = new TokenGenerator(256, TokenGenerator.BASE62);
			token = tokgen2.generate()
			const salt = bcrypt.genSaltSync(10);
			inputs = {
				...inputs,
				expireson: requestDetails.expiry,
				icetype:requestDetails.icetype,
				hash: bcrypt.hashSync(token, salt),
				deactivated: "active",
				name: requestDetails.tokenname,
			};
		}
		const result = await utils.fetchData(inputs, "admin/manageCIUsers", fnName);
		if (result == "fail") return res.send("fail");
		else if (result == "duplicate") return res.send("duplicate");
		else {
			result.token = token;
			return res.send(result);
		}
	} catch (exception) {
		logger.error("Error occurred in admin/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

//Fetch CI User details
exports.getCIUsersDetails = async (req,res) => {
	const fnName = "getCIUsersDetails";
	logger.info("Inside UI Service: " + fnName);
	try {
		const requestDetails = req.body.CIUser;
		const inputs = {
			user_id: requestDetails.userId
		};
		const result = await utils.fetchData(inputs, "admin/getCIUsersDetails", fnName);
		logger.info("Calling DAS Service : admin/getCIUsersDetails");
		if (result == "fail") return res.send("fail");
		else return res.send(result);
	} catch (exception) {
		logger.error("Error occurred in admin/"+fnName+":", exception);
		res.status(500).send("fail");
	}
};

//Manage Session for User
exports.manageSessionData = async (req, res) => {
	logger.info("Inside UI service: manageSessionData");
	try {
		const currUser = req.session.username;
		const action = req.body.action;
		if (action == "get") {
			logger.info("Inside UI service: manageSessionData/getSessions");
			const data = {sessionData: [], clientData: []};
			const connectusers = await utils.getSocketList("ICE");
			connectusers.forEach(function(e) {
				data.clientData.push({
					username: e[0],
					mode: e[1],
					ip: e[2]
				});
			});
			try {
				const sessions = await utils.allSess();
				sessions.forEach(function(e) {
					if (e.uniqueId && currUser != e.username) {
						data.sessionData.push({
							username: e.username,
							id: Buffer.from(e.uniqueId).toString("base64"),
							role: e.activeRole,
							loggedin: (new Date(e.loggedin)).toLocaleString(),
							ip: e.ip
						});
					}
				});
			} catch(err) {
				logger.error("Error occurred in admin/manageSessionData");
				logger.debug(err);
			}
			return res.send(data);
		} else if (action == "logout" || action == "disconnect") {
			const user = req.body.user;
			const reason = req.body.reason;
			let key = req.body.key;
			logger.info("Inside UI service: manageSessionData/"+action);
			if (action == "logout") {
				if (key != '?') key = Buffer.from(req.body.key, "base64").toString();
				else {
					try {
						key = await utils.findSessID(user);
					} catch (err) {
						logger.error("Error occurred in admin/manageSessionData: Fail to "+action+" "+user);
						logger.debug(err);
						return res.status(500).send("fail");
					}
				}
			} else if (action == "disconnect" && key == '?') {
				const icemode = await utils.channelStatus(user);
				if (icemode.schedule) key = "schedule";
				else if (icemode.normal) key = "normal";
				else return res.send("success");
			}
			const d2s = {"action":action, "key":key, "user":user, "cmdBy":currUser, "reason": reason};
			try {
				const status = await utils.delSession(d2s);
				return res.send("success");
			} catch (err) {
				logger.error("Error occurred in admin/manageSessionData: Fail to "+action+" "+user);
				logger.debug(err);
				return res.status(500).send("fail");
			}
		}
	} catch (exception) {
		logger.error("Error occurred in admin/manageSessionData:", exception);
		res.status(500).send("fail");
	}
};

exports.getNames_ICE = async (req, res) => {
	const fnName = "getNames_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		const inputs = {
			"type": req.body.idtype[0],
			"id": req.body.requestedids,
		};
		const queryStringresult = await utils.fetchData(inputs, "admin/getNames_ICE", fnName);
		if (queryStringresult == "fail") {
			res.send("fail");
		} else if (queryStringresult.length == 0) {
			logger.info('No projects found');
			return res.send("No Projects");
		} else {
			let responsedata = {
				projectIds: [],
				projectNames: []
			};
			for (let row of queryStringresult) {
				responsedata.projectIds.push(row._id);
				responsedata.projectNames.push(row.name);
			}
			return res.send(responsedata);
		}
	} catch (exception) {
		logger.error("Error occurred in admin/"+fnName+":", exception);
		res.status(500).send("fail");
	}
};

exports.createProject_ICE = async (req, res) => {
	const fnName = "createProject_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		var createProjectObj=req.body.createProjectObj;
		var inputs = {
			name: createProjectObj.projectName,
			domain: createProjectObj.domain,
			type: createProjectObj.appType,
			releases: createProjectObj.projectDetails,
			createdby: res.session.userid,
			createdbyrole: res.session.activeRoleId,
			modifiedby: res.session.userid,
			modifiedbyrole: res.session.activeRoleId
		};
		const result = await utils.fetchData(inputs, "admin/createProject_ICE", fnName);
		if (result == "fail") {
			res.send("fail");
		} else {
			res.send(result)
		}
	} catch (exception) {
		logger.error("Error occurred in admin/"+fnName+":", exception);
		res.status(500).send("fail");
	}
};

exports.testLDAPConnection = (req, res) => {
	logger.info("Inside UI Service: testLDAPConnection");
	try{
		const reqData = req.body;
		const ldapURL = (reqData.ldapURL || "").trim();
		const secure = (reqData.secure || "false").trim();
		const tlsCert = (reqData.tlsCert || "").trim() || false;
		if (ldapURL.slice(0,8) == "ldaps://") {
			if (secure === "false") {
				logger.error("Error occurred in admin/testLDAPConnection: Secure connection must be enabled for 'ldaps' protocol");
				return res.send("mismatch_secure");
			} else if (!tlsCert) {
				logger.error("Error occurred in admin/testLDAPConnection: 'ldaps' protocol require TLS Certificate.");
				return res.send("invalid_cert");
			}
		} else if (ldapURL.slice(0,8) != "ldaps://" && ldapURL.slice(0,7) != "ldap://") {
			logger.error("Error occurred in admin/testLDAPConnection: Invalid URL provided for connection test.");
			return res.send("invalid_url");
		}
		const baseDN = (reqData.baseDN || "").trim();
		const authUser = (reqData.username || "").trim();
		const authKey = (reqData.password || "").trim();
		const authType = reqData.authType;
		const adConfig = {
			url: ldapURL,
			baseDN: baseDN
		};
		if (secure !== "false") adConfig.tlsOptions = { 
			ca: tlsCert,
			rejectUnauthorized: secure === "secure"
		};
		if (authType == "simple") {
			adConfig.bindDN = authUser;
			adConfig.bindCredentials = authKey;
		}
		const ad = new activeDirectory(adConfig);
		var resSent = false;
		ad.find("cn=*", function (err, result) {
			if (resSent) return;
			resSent = !resSent;
			var flag = "success";
			var data = {fields:{}};
			if (err) {
				const errm = err.lde_message;
				if (["EADDRNOTAVAIL", "ECONNREFUSED", "ETIMEDOUT"].includes(err.errno)) flag = "invalid_addr";
				else if (err.errno == "INSUFFICIENT_ACCESS_RIGHTS") {
					if (authType == "simple") flag = "insufficient_access";
					else flag = "success";
				} else if (errm) {
					if (errm.indexOf("DSID-0C0906E8") > -1) {
						if (authType == "simple") flag = "insufficient_access";
						else flag = "invalid_auth";
					} else if (errm.indexOf("DSID-031522C9") > -1) {
						flag = "insufficient_access";
						logger.error("User Does not have sufficient Access!");
					} else if (authType == "simple") {
						if ((errm.indexOf("DSID-0C0903A9") > -1) || (errm.indexOf("DSID-0C090400") > -1) || (errm.indexOf("DSID-0C090442") > -1))
							flag = "invalid_credentials";
					}
					else if (errm.indexOf("DSID-031007DB") > -1) flag = "invalid_basedn";
				} else if (err.code == "UNABLE_TO_VERIFY_LEAF_SIGNATURE") flag = "invalid_cacert";
				else if (err.code == "ERR_TLS_CERT_ALTNAME_INVALID") flag = "invalid_cacert_host";
				else flag = "fail";
				var errStack = "";
				try {
					errStack = JSON.stringify(err);
				} catch(_){
					errStack = JSON.stringify({"message": err.lde_message || err.message, "code": err.errno || err.code});
				}
				logger.debug("Error occurred in admin/testLDAPConnection: " + errStack);
			}
			if (flag == "success") {
				logger.info('LDAP Connection test passed!');
				if (result && result.users && result.users.length > 0) {
					const fieldSet = new Set();
					for (let idx of [0, parseInt(result.users.length/2), result.users.length]) {
						for (let uo in result.users[idx]) fieldSet.add(uo);
					}
					data.fields = [...fieldSet.values()];
				} else {
					flag= "empty";
					logger.warn('LDAP Connection test passed but directory is empty');
				}
			} else {
				logger.error('LDAP Connection test failed!');
			}
			data.flag = flag;
			return res.send(data);
		});
	} catch (exception){
		if (exception.name == "InvalidDistinguishedNameError") {
			res.send("invalid_basedn");
			logger.error('LDAP Connection test failed!');
		} else {
			logger.error("Error occurred in admin/testLDAPConnection", exception);
			res.status(500).send("fail");
		}
	}
};

exports.getLDAPConfig = async (req, res) => {
	const fnName = "getLDAPConfig";
	logger.info("Inside UI Service: " + fnName);
	try {
		const action = req.body.action;
		const name = req.body.args;
		const opts = (req.body.opts || "").trim();
		let inputs = {};
		if (action != "server") inputs.name = name;
		const resConf = await utils.fetchData(inputs, "admin/getLDAPConfig", fnName);
		if (resConf == "fail") return res.status(500).send("fail");
		else if (resConf.length == 0) return res.send("empty");
		if (action == "server") return res.send(resConf);

		const bindCredentials = resConf.bindcredentials;
		let data = {
			url: resConf.url,
			basedn: resConf.basedn,
			secure: resConf.secure,
			cert: resConf.cert || '',
			auth: resConf.auth,
			binddn: resConf.binddn,
			bindCredentials: '',
			fieldmap: resConf.fieldmap
		};
		if (action == "config") return res.send(data);
		if (action != "user") return res.send("fail");

		const adConfig = {
			url: data.url,
			baseDN: data.basedn
		};
		if (data.secure !== "false") adConfig.tlsOptions = { 
			ca: data.cert,
			rejectUnauthorized: (data.secure === "secure")
		};
		if (data.auth == "simple") {
			adConfig.bindDN = data.binddn;
			adConfig.bindCredentials = bindCredentials;
		}
		const dataMaps = data.fieldmap;
		const filter = dataMaps.uname;
		const ad = new activeDirectory(adConfig);
		let resSent = false;
		if (opts.length > 0) {
			ad.findUser(opts, function (err, result) {
				if (resSent) return;
				resSent = !resSent;
				if (err) {
					if (err.lde_message && err.lde_message.indexOf("DSID-031522C9") > -1) {
						logger.error("Error occurred in admin/getLDAPConfig: Fetch User Details: Insufficient Access");
						data = "insufficient_access";
					} else {
						logger.error("Error occurred in admin/getLDAPConfig: Fetch User Details:", err.lde_message || err.message);
						logger.debug("ERROR: " + JSON.stringify(err));
						data = "server_error";
					}
				}
				else if (result) {
					data = {
						username: result[filter],
						firstname: result[dataMaps.fname],
						lastname: result[dataMaps.lname],
						email: result[dataMaps.email],
						ldapname: result.dn
					};
				} else {
					logger.error("Error occurred in admin/getLDAPConfig: Fetch User Details: User not Found");
					data = "empty";
				}
				return res.send(data);
			});
		} else {
			ad.find(filter+"=*", function (err, result) {
				if (resSent) return;
				resSent = !resSent;
				if (err) {
					if (err.lde_message && err.lde_message.indexOf("DSID-031522C9") > -1) {
						logger.error("Error occurred in admin/getLDAPConfig: Fetch Users: Insufficient Access");
						data = "insufficient_access";
					} else {
						logger.error("Error occurred in admin/getLDAPConfig: Fetch Users:", err.lde_message || err.message);
						logger.debug("ERROR: " + JSON.stringify(err));
						data = "server_error";
					}
				}
				else if (result) {
					var groups = result.groups;
					var others = result.other;
					groups.forEach(function(e) {
						logger.info("Group '%s' found in base domain '%s'", e.dn, adConfig.baseDN);
					});
					others.forEach(function(e) {
						logger.info("Unknown entry '%s' found in base domain '%s'", e.dn, adConfig.baseDN);
					});
					var users = result.users;
					data = [];
					for (var i = 0; i < users.length; i++) {
						data.push([users[i].cn, users[i].dn]);
					}
				} else {
					logger.error("Error occurred in admin/getLDAPConfig: Fetch Users: No users Found");
					data = "empty";
				}
				return res.send(data);
			});
		}
	} catch (exception){
		logger.error("Error occurred in admin/getLDAPConfig", exception);
		res.status(500).send("fail");
	}
};

exports.manageLDAPConfig = async (req, res) => {
	const fnName = "manageLDAPConfig";
	logger.info("Inside UI Service: " + fnName);
	try {
		let flag = ['1','0','0','0','0','0','0','0','0'];
		const reqData = req.body.conf;
		const action = req.body.action;
		let inputs = {};
		inputs.action = action;
		inputs.name = (reqData.name || "").trim();
		if (validator.isEmpty(action) || ["create","update","delete"].indexOf(action) == -1) {
			logger.error("Error occurred in admin/manageLDAPConfig: Invalid action.");
			flag[1] = '1';
		}
		if (validator.isEmpty(inputs.name)) {
			logger.error("Error occurred in admin/manageLDAPConfig: LDAP Server Name cannot be empty.");
			flag[2] = '1';
		}
		if  (action != "delete") {
			inputs.url = (reqData.url || "").trim();
			inputs.basedn = (reqData.basedn || "").trim();
			inputs.secure = reqData.secure;
			inputs.auth = reqData.auth;
			inputs.fieldmap = reqData.fieldmap || {};
			const secure = (reqData.secure !== "false");
			const protocol = (inputs.url.slice(0,7) + ((inputs.url.slice(7,8)=='/')?'/':'')).slice(0,-3);
			if (validator.isEmpty(inputs.url)) {
				logger.error("Error occurred in admin/manageLDAPConfig: LDAP Server URL cannot be empty.");
				flag[3] = '1';
			} else if (secure && protocol == "ldap") {
				logger.error("Error occurred in admin/manageLDAPConfig: Secure Connection needs 'ldaps' protocol.");
				flag[3] = '2';
			} else if (secure && protocol == "ldaps") {
				if ((reqData.cert || "").trim().length !== 0) inputs.cert = reqData.cert;
				else {
					logger.error("Error occurred in admin/manageLDAPConfig: Secure Connection needs a TLS Certificate.");
					flag[3] = '3';
				}
			} else if (!secure && protocol == "ldaps") {
				logger.error("Error occurred in admin/manageLDAPConfig: 'ldaps' protocol needs secure connection enabled.");
				flag[3] = '4';
			} else if (!["ldap", "ldaps"].includes(protocol)) {
				logger.error("Error occurred in admin/manageLDAPConfig: Invalid URL provided. URL should start with ldap or ldaps");
				flag[3] = '5';
			}
			if (validator.isEmpty(inputs.basedn)) {
				logger.error("Error occurred in admin/manageLDAPConfig: Invalid Base Domain Name.");
				flag[4] = '1';
			}
			if (validator.isEmpty(inputs.auth)) {
				logger.error("Error occurred in admin/manageLDAPConfig: Invalid Authentication Protocol.");
				flag[5] = '1';
			}
			if (inputs.auth == "simple") {
				inputs.binddn = (reqData.binddn || "").trim();
				inputs.bindcredentials = (reqData.bindcredentials || "").trim();
				if (validator.isEmpty(inputs.binddn)) {
					logger.error("Error occurred in admin/manageLDAPConfig: Invalid Bind Domain Name.");
					flag[6] = '1';
				}
				if (validator.isEmpty(inputs.bindcredentials)) {
					if (action == "create") {
						logger.error("Error occurred in admin/manageLDAPConfig: Invalid Bind Credentials.");
						flag[7] = '1';
					} else {
						delete inputs.bindcredentials;
					}
				}
			}
			if (!inputs.fieldmap.uname || !inputs.fieldmap.fname || !inputs.fieldmap.lname || !inputs.fieldmap.email) {
				logger.error("Error occurred in admin/manageLDAPConfig: Invalid Field Map.");
				flag[8] = '1';
			} else inputs.fieldmap = JSON.stringify(inputs.fieldmap);
		}
		flag = flag.join('');
		if (flag != "100000000") return res.send(flag);
		const data = await utils.fetchData(inputs, "admin/manageLDAPConfig", fnName);
		if (data == "fail") res.status(500).send(data);
		else return res.send(data);
	} catch (exception){
		logger.error("Error occurred in admin/manageLDAPConfig", exception);
		res.status(500).send("fail");
	}
};

exports.getSAMLConfig = async (req, res) => {
	const fnName = "getSAMLConfig";
	const errPretext = "Error occurred in admin/" + fnName;
	logger.info("Inside UI Service: " + fnName);
	try {
		const name = req.body.name;
		const inputs = { name: name };
		var data = await utils.fetchData(inputs, "admin/getSAMLConfig", fnName);
		if (data == "fail") res.status(500).send(data);
		else if (data.length == 0) res.send("empty");
		else res.send(data);
	} catch (exception){
		logger.error(errPretext, exception);
		res.status(500).send("fail");
	}
}

exports.manageSAMLConfig = async (req, res) => {
	const fnName = "manageSAMLConfig";
	const errPretext = "Error occurred in admin/" + fnName;
	logger.info("Inside UI Service: " + fnName);
	try{
		let flag = ['1','0','0','0','0'];
		const reqData = req.body.conf;
		const action = req.body.action;
		const inputs = {};
		inputs.action = action;
		inputs.name = (reqData.name || "").trim();
		if (validator.isEmpty(action) || ["create","update","delete"].indexOf(action) == -1) {
			logger.error(errPretext + ": Invalid action.");
			flag[1] = '1';
		}
		if (validator.isEmpty(inputs.name)) {
			logger.error(errPretext + ": SAML Server Name cannot be empty.");
			flag[2] = '1';
		}
		if  (action != "delete") {
			inputs.url = (reqData.url || "").trim();
			inputs.idp = (reqData.idp || "").trim();
			inputs.cert = (reqData.cert || "").trim();
			if (validator.isEmpty(inputs.url)) {
				logger.error(errPretext + ": Single Sign-On URL cannot be empty.");
				flag[3] = '1';
			} else if (!inputs.url.startsWith("https://") && !inputs.url.startsWith("http://")) {
				logger.error(errPretext + ": Single Sign-On URL must start with http:// or https://");
				flag[3] = '2';
			}
			if (validator.isEmpty(inputs.idp)) {
				logger.error(errPretext + ": Issuer cannot be empty.");
				flag[4] = '1';
			}
			if (validator.isEmpty(inputs.cert)) {
				logger.error(errPretext + ": Certificate cannot be empty.");
				flag[5] = '1';
			} else if (inputs.cert.indexOf("BEGIN CERTIFICATE") == -1 || inputs.cert.indexOf("END CERTIFICATE") == -1) {
				logger.error(errPretext + ": Invalid certificate provided.");
				flag[5] = '2';
			}
		}
		flag = flag.join('');
		if (flag != "10000") return res.send(flag);
		const data = await utils.fetchData(inputs, "admin/manageSAMLConfig", fnName);
		if (data == "fail") res.status(500).send(data);
		else return res.send(data);
	} catch (exception){
		logger.error(errPretext, exception);
		res.status(500).send("fail");
	}
};

exports.getOIDCConfig = async (req, res) => {
	const fnName = "getOIDCConfig";
	const errPretext = "Error occurred in admin/" + fnName;
	logger.info("Inside UI Service: " + fnName);
	try {
		const name = req.body.name;
		const inputs = { name: name };
		var data = await utils.fetchData(inputs, "admin/getOIDCConfig", fnName);
		if (data == "fail") res.status(500).send(data);
		else if (data.length == 0) res.send("empty");
		else res.send(data);
	} catch (exception){
		logger.error(errPretext, exception);
		res.status(500).send("fail");
	}
}

exports.manageOIDCConfig = async (req, res) => {
	const fnName = "manageOIDCConfig";
	const errPretext = "Error occurred in admin/" + fnName;
	logger.info("Inside UI Service: " + fnName);
	try{
		let flag = ['1','0','0','0','0'];
		const reqData = req.body.conf;
		const action = req.body.action;
		const inputs = {};
		inputs.action = action;
		inputs.name = (reqData.name || "").trim();
		if (validator.isEmpty(action) || ["create","update","delete"].indexOf(action) == -1) {
			logger.error(errPretext + ": Invalid action.");
			flag[1] = '1';
		}
		if (validator.isEmpty(inputs.name)) {
			logger.error(errPretext + ": OIDC Server Name cannot be empty.");
			flag[2] = '1';
		}
		if  (action != "delete") {
			inputs.url = (reqData.url || "").trim();
			inputs.clientid = (reqData.clientid || "").trim();
			inputs.secret = (reqData.secret || "").trim();
			if (validator.isEmpty(inputs.url)) {
				logger.error(errPretext + ": Issuer URL cannot be empty.");
				flag[3] = '1';
			} else if (!inputs.url.startsWith("https://") && !inputs.url.startsWith("http://")) {
				logger.error(errPretext + ": Issuer URL must start with http:// or https://");
				flag[3] = '2';
			}
			if (validator.isEmpty(inputs.clientid)) {
				logger.error(errPretext + ": Client ID cannot be empty.");
				flag[4] = '1';
			}
			if (validator.isEmpty(inputs.secret)) {
				logger.error(errPretext + ": Client Secret cannot be empty.");
				flag[5] = '1';
			}
		}
		flag = flag.join('');
		if (flag != "10000") return res.send(flag);
		const data = await utils.fetchData(inputs, "admin/manageOIDCConfig", fnName);
		if (data == "fail") res.status(500).send(data);
		else return res.send(data);
	} catch (exception){
		logger.error(errPretext, exception);
		res.status(500).send("fail");
	}
};

exports.getDetails_ICE = function (req, res) {
	logger.info("Inside UI service: getDetails_ICE");
	try {
		var id=req.body.requestedids[0];
		var type=req.body.idtype[0];
		logger.info("Inside function namesfetcher");
		var inputs = {
			"type": type,
			"id": id,
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling DAS Service from namesfetcher: admin/getDetails_ICE");
		client.post(epurl + "admin/getDetails_ICE", args,
			function (queryStringresult, response) {
			try {
				if (response.statusCode != 200 || queryStringresult.rows == "fail") {
					var statusFlag = "Error occurred in namesfetcher : Fail";
					logger.error("Error occurred in admin/getDetails_ICE from namesfetcher Error Code : ERRDAS");
					// namesfetchercallback(statusFlag, null);
				} else {
					if(type=="projectsdetails"){
					responsedata = {
						appType: "",
						projectName: "",
						projectId: "",
						projectDetails: []
					};
					responsedata.appType=queryStringresult.rows.type
					responsedata.projectName=queryStringresult.rows.name
					responsedata.projectId=queryStringresult.rows._id
					responsedata.projectDetails=queryStringresult.rows.releases
					res.send(responsedata);
					}
					else if(type == "domaindetails"){
						var responsedatadomains = {
							projectIds: [],
							projectNames: []
						};
						for (var i = 0; i < queryStringresult.rows.length; i++) {
							responsedatadomains.projectIds.push(queryStringresult.rows[i]._id);
							responsedatadomains.projectNames.push(queryStringresult.rows[i].name);
						}
						res.send(responsedatadomains)
					}else{
						res.send(queryStringresult.rows);
					}
				}
			} catch (exception) {
				logger.error(exception.message);
			}
		});
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.assignProjects_ICE = function (req, res) {
	logger.info("Inside UI Service: assignProjects_ICE");
	try {
		var assignProjectsDetails = req.body.assignProjectsObj;
		var projectDetails = assignProjectsDetails.assignedProjects;
		var projectIds = [];
		var alreadyassigned = false;
		for (var i = 0; i < projectDetails.length; i++) {
			projectIds.push(projectDetails[i].projectId);
		}
		var inputs = {};
		validateAssignProjects();
		var valid_domainId, valid_objects, valid_userId;
		function validateAssignProjects() {
			logger.info("Inside function validateAssignProjects");
			var check_domainId = validator.isEmpty(assignProjectsDetails.domainname);
			if (check_domainId == false) {
				valid_domainId = true;
			}
			valid_userId = true;
			// var check_userid = validator.isUUID(assignProjectsDetails.userId);
			// if (check_userid == true) {
			// 	valid_userId = true;
			// }
			var check_userInfo = validator.isJSON(JSON.stringify(assignProjectsDetails.userInfo));
			var check_assignProjectDetails = validator.isJSON(JSON.stringify(assignProjectsDetails.userInfo));
			if (check_userInfo == true && check_assignProjectDetails == true) {
				valid_objects = true;
			}

		}

		if (assignProjectsDetails.getAssignedProjectsLen > 0) {
			alreadyassigned = true;
			inputs = {
				"alreadyassigned": alreadyassigned,
				"userid": assignProjectsDetails.userId,
				"domainid": assignProjectsDetails.domainname,
				"modifiedbyrole": assignProjectsDetails.userInfo.role,
				"modifiedby": assignProjectsDetails.userInfo.username.toLowerCase(),
				"projectids": projectIds
			};
		} else {
			inputs = {
				"alreadyassigned": alreadyassigned,
				"userid": assignProjectsDetails.userId,
				"domainid": assignProjectsDetails.domainname,
				"createdby": assignProjectsDetails.userInfo.username.toLowerCase(),
				"projectids": projectIds
			};
		}
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		if (valid_domainId == true && valid_userId == true && valid_objects == true) {
			logger.info("Calling DAS Service : admin/assignProjects_ICE");
			client.post(epurl + "admin/assignProjects_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in admin/assignProjects_ICE Error Code : ERRDAS");
					res.send("fail");
				} else {
					inputs.projectids1 = "'"+inputs.projectids.join('\',\'')+"'";
					res.send(result.rows);
				}
			});
		} else {
			res.send('fail');
		}
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.getAssignedProjects_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: getAssignedProjects_ICE");
		var requestDetails = req.body.getAssignProj;
		var assignedProjectIds = [];
		var inputs = {
			"query": "projectid",
			"userid": requestDetails.userId
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling DAS Service : admin/getAssignedProjects_ICE");
		client.post(epurl + "admin/getAssignedProjects_ICE", args,
			function (result, response) {
			try {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in admin/getAssignedProjects_ICE Error Code : ERRDAS");
					res.send("fail");
				} else {
					assignedProjectIds = result.rows.projects;
					// async.forEachSeries(assignedProjectIds, function (iterator, assignProjectCallback) {
						try {
							var inputs = {
								"query": "projectname",
								"domain": requestDetails.domainname,
								"projectid": assignedProjectIds
							};
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							logger.info("Calling DAS Service : admin/getAssignedProjects_ICE inside async function");
							client.post(epurl + "admin/getAssignedProjects_ICE", args,
								function (result, response) {
								try {
									if (response.statusCode != 200 || result.rows == "fail") {
										logger.error("Error occurred in admin/getAssignedProjects_ICE inside async function Error Code : ERRDAS");
										res.send("fail");
									} else {
										res.send(result.rows)
									}
								} catch (exception) {
									logger.error(exception.message);
									res.send("fail");
								}
							});
						} catch (exception) {
							logger.error(exception.message);
							res.send("fail");
						}
					// }, finalfunction);

				}
				// function finalfunction() {
				// 	logger.info('Assigned projects fetched successfully');
				// 	res.send(assignedProjObj);
				// }
			} catch (exception) {
				logger.error(exception.message);
				res.send("fail");
			}
		});
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

function createCycle(args, createCycleCallback) {
	logger.info("Inside function createCycle");
	var statusFlag = "";
	logger.info("Calling DAS Service from createCycle:createProject_ICE");
	client.post(epurl + "admin/updateProject_ICE", args,
		function (result, response) {
		try {
			if (response.statusCode != 200 || result.rows == "fail") {
				statusFlag = "Error occurred in createCycle of createProject_ICE : Fail";
				logger.error("Error occurred in createProject_ICE from createCycle Error Code : ERRDAS");
				createCycleCallback(statusFlag, null);
			} else {
				var newCycleID  = result.rows[0].cycleid;
				createCycleCallback(null, result.rows[0]);
				logger.info("Cycle created for project successfully");
			}
		} catch (exception) {
			logger.error(exception.message);
		}
	});
}

/**
 * this service is used to create/update/delete projects/releases/cycles
 * from a particular domain
 */
exports.updateProject_ICE = function updateProject_ICE(req, res) {
	qList=[];
	try {
		logger.info("Inside UI Service: updateProject_ICE");
		var updateProjectDetails = req.body.updateProjectObj;
		var userinfo = req.body.userDetails;
		var flag = "";
		var requestedprojectid = updateProjectDetails.projectId;
		validateUpdateProject();
		var valid_projectName,valid_appType, valid_projectDetails;
		function validateUpdateProject() {
			logger.info("Inside function validateUpdateProject");
			var check_project = validator.isEmpty(updateProjectDetails.projectName);
			var check_projectId = validator.isMongoId(updateProjectDetails.projectId);
			var check_projectLen = validator.isLength(updateProjectDetails.projectName, 1, 50);
			if (check_project == false && check_projectLen == true && check_projectId == true) {
				valid_projectName = true;
			}
			var check_appType = validator.isEmpty(updateProjectDetails.appType);
			if (check_appType == false) {
				valid_appType = true;
			}
			var check_updateProjectDetails = validator.isJSON(JSON.stringify(updateProjectDetails));
			if (check_updateProjectDetails == true) {
				valid_projectDetails = true;
			}
		}
		if (valid_projectName == true && valid_appType == true && valid_projectDetails == true) {
			async.series({
				newProjectDetails: function (newProjectDetailsCallback) {
					var projectDetails = updateProjectDetails.newProjectDetails;
					async.forEachSeries(projectDetails, function (eachprojectDetail, eachprojectDetailcallback) {
						try {
							var releaseCreateStatus = eachprojectDetail.newStatus;
							var releaseDetails = eachprojectDetail;
							var cycles = releaseDetails.cycles;
							if (releaseCreateStatus) {
								try {
									var releaseName = releaseDetails.name;
									var newReleaseID = "";
									var inputs = {
										"query": "createrelease",
										"projectid": requestedprojectid,
										"releasename": releaseName,
										"cycles":cycles,
										"createdby": userinfo.user_id,
										"createdbyrole":userinfo.role
									};
									var args = {
										data: inputs,
										headers: {
											"Content-Type": "application/json"
										}
									};
									logger.info("Calling DAS Service from newProjectDetails : admin/createProject_ICE");
									client.post(epurl + "admin/updateProject_ICE", args,
										function (data, response) {

										try {
											if (response.statusCode != 200 || data.rows == "fail") {
											logger.error("Error occurred in admin/createProject_ICE from newProjectDetails Error Code : ERRDAS");
											} else {
												//newReleaseID = data.rows[0].releaseid;
												res.send("success")

												// async.forEachSeries(cycles, function (eachCycleDetail, cycleNamescallback) {
												// 	try {
												// 		var eachCycleName = eachCycleDetail.cycleName;
												// 		var inputs = {
												// 			"query": "createcycle",
												// 			"releaseid": newReleaseID,
												// 			"cyclename": eachCycleName,
												// 			"createdby": userinfo.username.toLowerCase(),
												// 			"skucodecycle": "skucodecycle",
												// 			"tags": "tags"
												// 		};
														
														
												// 	} catch (exception) {
												// 		logger.error(exception.message);
												// 	}
												// }, eachprojectDetailcallback);
											}
										} catch (exception) {
										logger.error(exception.message);
										}
									});
								} catch (exception) {
									logger.error(exception.message);
								}
							} else {
								try {
									//this piece of code runs when only cycles needs to be created
									//in a specified release
									var releaseId = releaseDetails.releaseId;
									async.forEachSeries(cycles, function (eachCycleDetail, cycleNamescallback) {
										try {
											var eachCycleName = eachCycleDetail.name;
											var inputs = {
												"query": "createcycle",
												"projectid":requestedprojectid,
												"createdbyrole":userinfo.role,
												"releaseid": releaseId,
												"name": eachCycleName,
												"createdby": userinfo.user_id
											};
											var args = {
												data: inputs,
												headers: {
													"Content-Type": "application/json"
												}
											};
											createCycle(args, function (error, response) {
												if (error) {
													logger.error(error);
												} else {
													try {
														cycleNamescallback();
													} catch (exception) {
														logger.error(exception.message);
													}
												}
											});
										} catch (exception) {
											logger.error(exception.message);
										}
									}, eachprojectDetailcallback);
								} catch (exception) {
									logger.error(exception.message);
								}
							}
						} catch (exception) {
							logger.error(exception.message);
						}
					}, newProjectDetailsCallback);
				},
				deletedProjectDetails: function (deletedProjectDetailsCallback) {
					try {
						var projectDetails = updateProjectDetails.deletedProjectDetails;
						async.forEachSeries(projectDetails, function (eachprojectDetail, eachprojectDetailcallback) {
							try {
								var deleteStatus = eachprojectDetail.deleteStatus;
								if (deleteStatus) {
									var inputs = {
										"query": "deleterelease",
										"releasename": eachprojectDetail.releaseName,
										"projectid": requestedprojectid,
										"releaseid": eachprojectDetail.releaseId
									};
									var args = {
										data: inputs,
										headers: {
											"Content-Type": "application/json"
										}
									};
									logger.info("Calling DAS Service from deletedProjectDetails : admin/updateProject_ICE");
									client.post(epurl + "admin/updateProject_ICE", args,
										function (result, response) {
										try {
											if (response.statusCode != 200 || result.rows == "fail") {
												flag = "Error in deleteRelease-updateProject_ICE : Fail";
												logger.error("Error occurred in admin/updateProject_ICE from deletedProjectDetails Error Code : ERRDAS");
												res.send(flag);
											} else {
												//Execute neo4j query!! deleterelease
												//var qList=[];
												/*qList.push({"statement":"MATCH (n:RELEASES_NG {projectid:'"+inputs.projectid+
															"',releaseid:'"+inputs.releaseid+"',releasename:'"+
															inputs.releasename+"'}) detach delete n"});*/
												//reqToAPI(qList,urlData);
												var cyclesOfRelease = eachprojectDetail.cycles;
												async.forEachSeries(cyclesOfRelease, function (eachCycleDetail, eachCycleCallback) {
													try {
														var inputs = {
															"query": "deletecycle",
															"name": eachCycleDetail.cycleName,
															"releaseid": eachprojectDetail.releaseId,
															"cycleid": eachCycleDetail.cycleId
														};
														var args = {
															data: inputs,
															headers: {
																"Content-Type": "application/json"
															}
														};
														logger.info("Calling DAS Service from deletedProjectDetails inside async : admin/updateProject_ICE");
														client.post(epurl + "admin/updateProject_ICE", args,
															function (result, response) {
															if (response.statusCode != 200 || result.rows == "fail") {
																logger.error("Error occurred in admin/updateProject_ICE inside async Error Code : ERRDAS");
																flag = "Error in deleteCycles(true)-updateProject_ICE : Fail";
																res.send(flag);
															} else {
																//Execute neo4j query!! deletecycle
																//var qList=[];
																/* qList.push({"statement":"MATCH (n:CYCLES_NG {cycleid:'"+inputs.cycleid+
																			"',releaseid:'"+inputs.releaseid+"',cyclename:'"+
																			inputs.cyclename+"'}) detach delete n"});*/
																//reqToAPI(qList,urlData);
																eachCycleCallback();
															}
														});
													} catch (exception) {
														logger.error(exception.message);
													}
												}, eachprojectDetailcallback);
											}
										} catch (exception) {
											logger.error(exception.message);
										}
									});
								} else if (!deleteStatus) {
									try {
										var cycles = eachprojectDetail.cycles;
										async.forEachSeries(cycles, function (eachCycleDetail, eachCycleCallback) {
											try {
												var deleteStatusCycles = eachCycleDetail.deleteStatus;
												if (deleteStatusCycles) {
													try {
														var inputs = {
															"query": "deletecycle",
															"cyclename": eachCycleDetail.cycleName,
															"releaseid": eachprojectDetail.releaseId,
															"cycleid": eachCycleDetail.cycleId
														};
														var args = {
															data: inputs,
															headers: {
																"Content-Type": "application/json"
															}
														};
														logger.info("Calling DAS Service inside async from !deleteStatus: admin/updateProject_ICE");
														client.post(epurl + "admin/updateProject_ICE", args,
															function (result, response) {
															if (response.statusCode != 200 || result.rows == "fail") {
																logger.error("Error occurred in admin/updateProject_ICE inside async from !deleteStatus Error Code : ERRDAS");
																flag = "Error in deleteCycles(false)-updateProject_ICE : Fail";
																res.send(flag);
															} else {
																//Execute neo4j query!! deletecycle
																//var qList=[];
																/*qList.push({"statement":"MATCH (n:CYCLES_NG {cycleid:'"+inputs.cycleid+
																			"',releaseid:'"+inputs.releaseid+"',cyclename:'"+
																			inputs.cyclename+"'}) detach delete n"});*/
																//reqToAPI(qList,urlData);
																eachCycleCallback();
															}
														});
													} catch (exception) {
														logger.error(exception.message);
													}
												}
											} catch (exception) {
												logger.error(exception.message);
											}
										}, eachprojectDetailcallback);
									} catch (exception) {
										logger.error(exception.message);
									}
								}
							} catch (exception) {
								logger.error(exception.message);
							}
						}, deletedProjectDetailsCallback);
					} catch (exception) {
							logger.error(exception.message);
					}
				},
				editedProjectDetails: function (editedProjectDetailsCallback) {
					try {
						var projectDetails = updateProjectDetails.editedProjectDetails;
						async.forEachSeries(projectDetails, function (eachprojectDetail, eachprojectDetailcallback) {
							try {
								var editedStatus = eachprojectDetail.editStatus;
								var newReleaseName = eachprojectDetail.name;
								var releaseId = eachprojectDetail.releaseId;
								if (editedStatus) {
									try {
										var inputs = {
											"query": "editrelease",
											"releasename": eachprojectDetail.oldreleaseName,
											"newreleasename": newReleaseName,
											"projectid": requestedprojectid,
											"releaseid": releaseId,
											"modifiedby":userinfo.user_id,
											"modifiedbyrole":userinfo.role
										};
										var args = {
											data: inputs,
											headers: {
												"Content-Type": "application/json"
											}
										};
										logger.info("Calling DAS Service from editedProjectDetails : admin/updateProject_ICE");
										client.post(epurl + "admin/updateProject_ICE", args,
											function (result, response) {
											try {
												if (response.statusCode != 200 || result.rows == "fail") {
													logger.error("Error occurred in admin/updateProject_ICE from editedProjectDetails Error Code : ERRDAS");
													flag = "Error in delete-Release(true)-updateProject_ICE : Fail";
													res.send(flag);
												} else {
													try {
														var cycles = eachprojectDetail.cycles;
														var newCycleName = "";
														var cycleId = "";
														async.forEachSeries(cycles, function (eachCycleDetail, eachCycleCallback) {
															try {
																var editedStatusCycles = eachCycleDetail.editStatus;
																if (editedStatusCycles) {
																	try {
																		newCycleName = eachCycleDetail.cyclename;
																		cycleId = eachCycleDetail._id;
																		var inputs = {
																			"query": "editcycle",
																			"cyclename": eachCycleDetail.oldCycleName,
																			"releaseid": releaseId,
																			"cycleid": cycleId,
																			"projectid": requestedprojectid,
																			"newcyclename": newCycleName,
																			"modifiedby":userinfo.user_id,
																			"modifiedbyrole":userinfo.role
																		};
																		var args = {
																			data: inputs,
																			headers: {
																				"Content-Type": "application/json"
																			}
																		};
																		logger.info("Calling DAS Service from editedProjectDetails :admin/updateProject_ICE");
																		client.post(epurl + "admin/updateProject_ICE", args,
																			function (result, response) {
																			if (response.statusCode != 200 || result.rows == "fail") {
																				logger.error("Error occurred in admin/updateProject_ICE from editedProjectDetails Error Code : ERRDAS");
																				flag = "Error in delete-Cycle(true)-updateProject_ICE : Fail";
																				res.send(flag);
																			} else {
																				try {
																					res.send(result.rows)
																				} catch (exception) {
																					logger.error(exception.message);
																				}
																			}
																		});
																	} catch (exception) {
																		logger.error(exception.message);
																	}
																} else {
																	eachCycleCallback();
																}
															} catch (exception) {
																logger.error(exception.message);
															}
														}, eachprojectDetailcallback);
													} catch (exception) {
															logger.error(exception.message);
													}
												}
											} catch (exception) {
												logger.error(exception.message);
											}
										});
									} catch (exception) {
											logger.error(exception.message);
									}
								} else {
									try {
										var cycles = eachprojectDetail.cycles;
										var newCycleName = "";
										var cycleId = "";
										async.forEachSeries(cycles, function (eachCycleDetail, eachCycleCallback) {
											try {
												var editedStatusCycles = eachCycleDetail.editStatus;
												if (editedStatusCycles) {
													try {
														newCycleName = eachCycleDetail.cyclename ? eachCycleDetail.cyclename : eachCycleDetail.cycleName;
														cycleId = eachCycleDetail._id ? eachCycleDetail._id : eachCycleDetail.cycleId;
														var inputs = {
															"query": "editcycle",
															"cyclename": eachCycleDetail.oldCycleName,
															"newcyclename": newCycleName,
															"releaseid": eachprojectDetail.name,
															"cycleid": cycleId,
															"projectid": requestedprojectid,
															"modifiedby":userinfo.user_id,
															"modifiedbyrole":userinfo.role
														};
														var args = {
															data: inputs,
															headers: {
																"Content-Type": "application/json"
															}
														};
														logger.info("Calling DAS Service : admin/updateProject_ICE");
														client.post(epurl + "admin/updateProject_ICE", args,
															function (result, response) {
															if (response.statusCode != 200 || result.rows == "fail") {
																logger.error("Error occurred in admin/updateProject_ICE Error Code : ERRDAS");
																flag = "Error in delete-Cycle(true)-updateProject_ICE : Fail";
																res.send(flag);
															} else {
																try {
																	res.send(result.rows)
																} catch (exception) {
																		logger.error(exception.message);
																}
															}
														});
													} catch (exception) {
														logger.error(exception.message);
													}
												} else {
													eachCycleCallback();
												}
											} catch (exception) {
												logger.error(exception.message);
											}
										}, eachprojectDetailcallback);
									} catch (exception) {
										logger.error(exception.message);
									}
								}
							} catch (exception) {
								logger.error(exception.message);
							}
						}, editedProjectDetailsCallback);
					} catch (exception) {
						logger.error(exception.message);
					}
				}
			}, function (error, response) {
				if (error) {
					logger.error("Error occurred in function newProjectDetails");
					res.send("fail");
				} else{
					res.send("success");
				}
			});
		} else {
			res.send('fail');
		}
	} catch (exception) {
		logger.error(exception.message);
	}
};

//GetUsers service has been changed to populate the users who has access to the project
exports.getUsers = function (req, res) {
	logger.info("Inside UI service: getUsers");
	var prjId = req.prjId;
	var args = {
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling DAS Service: getUsers");
	client.post(epurl + "admin/getUserRoles", args,
		function (userrolesresult, userrolesresponse) {
		if (userrolesresponse.statusCode != 200 || userrolesresult.rows == "fail") {
			logger.error("Error occurred in getUsers Error Code : ERRDAS");
			res(null, "fail");
		} else {
			var inputs = {
				"userroles": userrolesresult.rows,
				"projectid": prjId
			};
			args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling DAS Service: getUsers");
			client.post(epurl + "admin/getUsers", args,
				function (getUsers, response) {
				if (response.statusCode != 200 || getUsers.rows == "fail") {
					logger.error("Error occurred in getUsers Error Code : ERRDAS");
					res(null, "fail");
				} else {
					logger.info("Users fetched successfully");
					res(null, getUsers);
				}
			});
		}
	});
};

exports.getAvailablePlugins = async (req, res) => {
	logger.info("Inside UI service: getAvailablePlugins");
	try {
		const result = await utils.fetchData({}, "admin/getAvailablePlugins", "getAvailablePlugins");
		res.send(result);
	} catch (exception) {
		logger.error("Error occurred in admin/getAvailablePlugins:", exception);
		res.send("fail");
	}
};

exports.getPreferences = async (req, res) => {
	logger.info("Inside UI service: getPreferences");
	try {
		const result = await utils.fetchData({}, "admin/getPreferences", "getPreferences");
		res.send(result);
	} catch (exception) {
		logger.error("Error occurred in admin/getPreferences:", exception);
		res.send("fail");
	}
};

exports.fetchICE = async (req, res) => {
	logger.info("Inside UI service: fetchICE");
	try {
		const inputs = { user: req.body.user };
		const result = await utils.fetchData(inputs, "admin/fetchICE", "fetchICE");
		res.send(result);
	} catch (exception) {
		logger.error("Error occurred in admin/fetchICE:", exception);
		res.send("fail");
	}
};

exports.provisionICE = async (req, res) => {
	const fnName = "provisionICE";
	logger.info("Inside UI service: " + fnName);
	try {
		const tokeninfo = req.body.tokeninfo;
		const inputs = {
			provisionedto: tokeninfo.userid,
			icename: tokeninfo.icename.toLowerCase(),
			icetype: tokeninfo.icetype,
			query: tokeninfo.action
		};
		const result = await utils.fetchData(inputs, "admin/provisionICE", fnName);
		res.send(result);
	} catch (exception) {
		logger.error("Error occurred in admin/provisionICE:", exception);
		res.send("fail");
	}
};
// UI service to create a new ICE pool
exports.createPool_ICE = async(req,res) => {
	const fnName = "createPools_ICE";
	logger.info("Inside UI service: " + fnName)
	try{
		const poolinfo = req.body.data;
		const inputs = {
			poolname: poolinfo.poolname,
			createdby: req.session.userid,
			createdbyrole: req.session.activeRoleId,
			projectids: poolinfo.projectids
		};
		const result = await utils.fetchData(inputs, "admin/createPool_ICE", fnName);
		if(result && result != "fail") queue.Execution_Queue.updatePools("create",poolinfo);
		res.send(result);
	}catch (exception){
		logger.error("Error occurred in admin/createPools_ICE:", exception);
		res.send("fail");
	}
} 
 
// UI service to update a pool
exports.updatePool = async(req,res) => {
	const fnName = "updatePool"
	logger.info("Inside UI service: " + fnName)
	try{
		const poolinfo = req.body.data;
		const inputs = {
			poolname: poolinfo.poolname,
			poolid: poolinfo._id,
			projectids: poolinfo.projectids,
			ice_added: poolinfo.ice_added,
			ice_deleted: poolinfo.ice_deleted,
			modifiedby: req.session.userid,
			modifiedbyrole: req.session.activeRoleId,
		};
		const result = await utils.fetchData(inputs, "admin/updatePool_ICE", fnName);
		if(result && result != "fail") queue.Execution_Queue.updatePools("update",poolinfo);
		res.send(result);
	}catch (exception){
		logger.error("Error occurred in admin/provisionICE:", exception);
		res.send("fail");
	}
}
// UI service to get pools from projectids / poolid
exports.getPools = async(req,res) => {
	const fnName = "getPools"
	logger.info("Inside UI service: " + fnName)
	var inputCheck = false;
	try{
		const poolinfo = req.body.data;
		const inputs = {
			poolid: poolinfo.poolid,
			projectids: poolinfo.projectids,
		};
		inputCheck = true;
		const result = await utils.fetchData(inputs, "admin/getPools", fnName);
		res.send(result);
	}catch (exception){
		logger.error("Error occurred in admin/getPools:", exception);
		if (!inputCheck) res.send("Payload Error")
		else res.send("fail");
	}
}
// UI service to get ICE in pool from poolid
exports.getICEinPools = async(req,res) => {
	const fnName = "getICEinPools"
	logger.info("Inside UI service: " + fnName)
	try{
		const poolinfo = req.body.data;
		const inputs = {
			poolids: poolinfo.poolid,
		};
		const result = await utils.fetchData(inputs, "admin/getICE_pools", fnName);
		res.send(result);
	}catch (exception){
		logger.error("Error occurred in admin/provisionICE:", exception);
		res.send("fail");
	}
}

exports.deletePools = async(req,res) => {
	const fnName = "deletePools"
	logger.info("Inside UI service: " + fnName)
	try{
		const poolinfo = req.body.data;
		const inputs = {
			poolids: poolinfo.poolid,
		};
		const result = await utils.fetchData(inputs, "admin/deleteICE_pools", fnName);
		if(result && result != "fail") queue.Execution_Queue.updatePools("delete",poolinfo);
		res.send(result);
	}catch (exception){
		logger.error("Error occurred in admin/deletePools:", exception);
		res.send("fail");
	}
}


exports.getAvailable_ICE = async(req,res) => {
	const fnName = "getAvailable_ICE"
	logger.info("Inside UI service: " + fnName)
	try{
		const inputs = {};
		const result = await utils.fetchData(inputs, "admin/getAvailable_ICE", fnName);
		res.send(result);
	}catch (exception){
		logger.error("Error occurred in admin/getAvailable_ICE:", exception);
		res.send("fail");
	}
} 

exports.clearQueue = async(req,res) => {
	try{
		const poolinfo = req.body.data;
		const result = await queue.Execution_Queue.updatePools("clear_queue",poolinfo);
		res.send(result)
	}catch(e){
		logger.error("Error occurred in admin/clearQueue:", exception);
		res.send("fail");
	}
}

exports.exportProject = async (req, res) => {
	const fnName = 'exportProject';
	logger.info("Inside UI service: " + fnName);
	try {
		const d = req.body;
		const projectId = d.projectId;
		const proj_name = d.projectName;
		const inputs = {
			"projectId":projectId
		};
		const proj_data = await utils.fetchData(inputs, "admin/exportProject", fnName);
		if (proj_data == "fail") return res.send("fail");
		let projectPath = './assets/projects/'+proj_name;
		if (!fs.existsSync('./assets/projects')){
			fs.mkdirSync( './assets/projects');
		}
		if (!fs.existsSync(projectPath)) {
			fs.mkdirSync(projectPath);
		} else {
			fs.rmdirSync(projectPath,{recursive:true});
			fs.mkdirSync(projectPath);
		}
		for (i = 0; i < proj_data.length ;i++){
			let mindmap = proj_data[i];
			let mm_name = mindmap.name;
			let mm_path = projectPath+'/'+mm_name
			let screens_path = mm_path+'/'+'screens';
			let testcases_path = mm_path+'/'+'testcases';
			if (!fs.existsSync(mm_path)) fs.mkdirSync(mm_path);
			if (!fs.existsSync(screens_path)) fs.mkdirSync(screens_path);
			if (!fs.existsSync(testcases_path)) fs.mkdirSync(testcases_path);
			let { screens, testcases, ...mm_data } = mindmap;
			let screenList = mindmap.screens;
			let testcaseList = mindmap.testcases;
			delete mindmap.screens, mindmap.testcases;
			fs.writeFileSync(mm_path+'/'+mm_name+'.mm', JSON.stringify(mm_data, undefined, 2), function(err) {});
			for(let j=0;j<screenList.length;j++){
				let screen = screenList[j];
				let screen_name = 'Screen_'+screen.name;
				fs.writeFileSync(screens_path+'/'+screen_name+'.json', JSON.stringify(screen, undefined, 2), function(err) {});
			}
			for(let k=0;k<testcaseList.length;k++){
				let testcase = testcaseList[k];
				let testcase_name = 'Testcase_'+testcase.name;
				fs.writeFileSync(testcases_path+'/'+testcase_name+'.json', JSON.stringify(testcase.steps, undefined, 2), function(err) {});
			}
		}
		let zip_path = projectPath+'.zip'
		const archive = archiver('zip', { zlib: { level: 9 }});
		const stream = fs.createWriteStream(zip_path);
		stream.on('close', ()=>{
			removeDir(projectPath);
			res.writeHead(200, {
				'Content-Type' : 'application/zip',
			});
			var filestream = fs.createReadStream(zip_path);
			filestream.pipe(res);
		})
		archive.directory(projectPath, false).pipe(stream);
		archive.finalize();
	} catch (ex) {
		logger.error("Exception in the service exportProject: %s", ex);
		return res.status(500).send("fail");
	}
};

const removeDir = function(path) {
	if (fs.existsSync(path)) {
		const files = fs.readdirSync(path);
		if (files.length > 0) {
			files.forEach(function(filename) {
				if (fs.statSync(path + "/" + filename).isDirectory()) {
					removeDir(path + "/" + filename);
				} else {
					fs.unlinkSync(path + "/" + filename);
				}
			});
			fs.rmdirSync(path);
		} else {
			fs.rmdirSync(path);
		}
	} else {
		logger.error("Directory path not found.")
	}
}

const getEmailConf = async (conf, fnName, inputs, flag) => {
	if (!flag) flag = ['1','0','0','0','0','0','0','0','0','0','0','0','0'];
	const regExURL = /^http[s]?:\/\/[A-Za-z0-9._-].*$/i;
	inputs.host = (conf.host || "").trim();
	inputs.port = conf.port || "";
	if (!inputs.host && !validator.isIP(inputs.host) && !validator.isFQDN(inputs.host)) { // Allow Anything as of now
		logger.error("Error occurred in admin/"+fnName+": Invalid Hostname or IP.");
		flag[5]='1';
	}
	if (!validator.isPort(inputs.port.toString())) {
		logger.error("Error occurred in admin/"+fnName+": Invalid Port Number.");
		flag[6]='1';
	}
	conf.sender = conf.sender || {};
	inputs.sender = {
		name: (conf.sender.name || "Avo Assure Alerts").trim(),
		email: (conf.sender.email || "avoassure-alerts@avoautomation.com").trim()
	}
	if (!validator.isEmail(inputs.sender.email)) {
		logger.error("Error occurred in admin/"+fnName+": Invalid sender email address.");
		flag[7]='1';
	}
	inputs.tls = {
		security: conf.enabletls || "auto",
		insecure: conf.insecuretls || false
	}
	if (!["enable", "disable", "auto"].includes(inputs.tls.security)) {
		logger.error("Error occurred in admin/"+fnName+": Invalid TLS Options.");
		flag[8]='1';
	}
	const pool = conf.pool;
	if (!pool) inputs.pool = { enable: false };
	else {
		inputs.pool = { enable: pool.enable || false };
		if (validator.isInt((pool.maxConnections||"").toString())) inputs.pool.maxconnections = pool.maxConnections;
		if (validator.isInt((pool.maxMessages||"").toString())) inputs.pool.maxmessages = pool.maxMessages;
	}
	const auth = conf.auth;
	if (!auth) inputs.auth = false;
	else {
		inputs.auth = {
			type: (auth.type || "").trim().toLowerCase(),
			username: (auth.username || "").trim(),
			password: (auth.password || "").trim(),
		};
		if (inputs.auth.type == "none") inputs.auth = false;
		else if (!["basic"].includes(inputs.auth.type)) {
			logger.error("Error occurred in admin/"+fnName+": Invalid auth type.");
			flag[9]='1';
		}
	}
	const timeouts = conf.timeouts || "";
	const tOut = {};
	if (timeouts) {
		if (validator.isInt((timeouts.connection||"").toString())) tOut.connection = timeouts.connection;
		if (validator.isInt((timeouts.greeting||"").toString())) tOut.greeting = timeouts.greeting;
		if (validator.isInt((timeouts.socket||"").toString())) tOut.socket = timeouts.socket;
		if (Object.keys(tOut).length != 0) inputs.timeouts = tOut;
	}
	inputs.appurl = conf.appurl;
	if (!regExURL.test(inputs.appurl) && !validator.isURL(inputs.appurl)) {
		logger.error("Error occurred in admin/"+fnName+": Invalid Avo Assure Application URL.");
		flag[10]='1';
	}
	const proxy = conf.proxy;
	if (!proxy) inputs.proxy = { enable: false };
	else {
		inputs.proxy = {
			enable: proxy.enable || false,
			url: proxy.url || "",
			auth: proxy.auth || false
		};
		if (inputs.proxy.enable && !regExURL.test(inputs.proxy.url) && !validator.isURL(inputs.proxy.url)) {
			logger.error("Error occurred in admin/"+fnName+": Invalid Proxy URL.");
			flag[11]='1';
		}
		inputs.proxy.user = proxy.user || "";
		inputs.proxy.pass = proxy.pass || "";
		if (inputs.proxy.enable && inputs.proxy.auth) {
			if (inputs.proxy.user.length == 0 && inputs.proxy.pass.length == 0) {
				logger.error("Error occurred in admin/"+fnName+": Invalid Proxy Credentials.");
				flag[12]='3';
			}
			else if (inputs.proxy.user.length == 0) {
				logger.error("Error occurred in admin/"+fnName+": Invalid Proxy Username.");
				flag[12]='1';
			}
			else if (inputs.proxy.pass.length == 0) {
				logger.error("Error occurred in admin/"+fnName+": Invalid Proxy Password.");
				flag[12]='2';
			}
		}
	}
};

// Send Test Notification over a specific channel and provider
exports.testNotificationChannels = async (req, res) => {
	const fnName = "testNotificationChannels";
	logger.info("Inside UI Service: "+fnName);
	try {
		const channel = (req.body.channel || "").trim();
		const provider = (req.body.provider || "").trim();
		const recipient = (req.body.recipient || "").trim();
		const rawConf = req.body.conf || {};
		let flag = "fail";
		if (channel == "email") {
			if (provider != "smtp") flag = "invalidprovider";
			else if (!validator.isEmail(recipient)) flag = "invalidrecipient";
			else {
				const conf = { channel, provider, name: rawConf.name };
				await getEmailConf(rawConf, fnName, conf);
				const testResp = await notifications.test(channel, { recipient }, conf);
				if (testResp.error) flag = "fail";
				else flag = testResp.status;
			}
		} else flag = "invalidchannel";
		return res.send(flag);
	} catch (exception){
		logger.error("Error occurred in admin/"+fnName, exception);
		res.status(500).send("fail");
	}
};

// Create/Edit/Delete Notification Channels
exports.manageNotificationChannels = async (req, res) => {
	const fnName = "manageNotificationChannels";
	logger.info("Inside UI Service: " + fnName);
	try {
		let flag = ['1','0','0','0','0','0','0','0','0','0','0','0','0'];
		const conf = req.body.conf;
		const action = req.body.action;
		// if (action == "delete") return res.send("fail");
		const inputs = {
			action: action,
			name: (conf.name || "").trim(),
			channel: (conf.channel || "").trim(),
			provider: (conf.provider || "").trim()
		};

		if (validator.isEmpty(action) || ["create","update","delete","enable","disable"].indexOf(action) == -1) {
			logger.error("Error occurred in admin/"+fnName+": Invalid action.");
			flag[1]='1';
		}
		if (!validator.isLength(inputs.name,1,100)) {
			logger.error("Error occurred in admin/"+fnName+": Invalid Configuration name.");
			flag[2]='1';
		}
		if (inputs.channel != "email") {  // Only email channel is supported as of now
			logger.error("Error occurred in admin/"+fnName+": Invalid Channel: "+channel);
			flag[3]='1';
		}
		if (action == "create" || action == "update") {
			if (inputs.channel == "email") {
				if (inputs.provider == "smtp") {  // Only smtp provider is supported as of now
					await getEmailConf(conf, fnName, inputs, flag);
				} else {
					logger.error("Error occurred in admin/"+fnName+": Invalid Provider "+provider+" for "+channel+" channel.");
					flag[4]='1';
				}
			}
		}
		flag = flag.join('');
		if (flag != "1000000000000") {
			return res.send(flag);
		}
		const result = await utils.fetchData(inputs, "admin/manageNotificationChannels", fnName);
		if (result == "fail") return res.status(500).send("fail");
		else if (result == "dne") {
			logger.error("Error occurred in admin/"+fnName+": Specified Configuration '"+inputs.name+"' does not exists");
			return res.send("fail");
		}
		notifications.update(action, inputs.name, inputs.channel, inputs.provider);
		return res.send(result);
	} catch (exception) {
		logger.error("Error occurred in admin/"+fnName, exception);
		res.status(500).send("fail");
	}
};

// Fetch Notification Channels or a specific channel
exports.getNotificationChannels = async (req, res) => {
	const fnName = "getNotificationChannels";
	logger.info("Inside UI Service: "+fnName);
	try {
		const action = req.body.action;
		const channel = req.body.channel;
		const args = req.body.args;
		let inputs = { action };
		if (action != "list") {
			inputs.name = args;
			inputs.channel = channel;
		}
		const result = await utils.fetchData(inputs, "admin/getNotificationChannels", fnName);
		if (result == "fail") res.status(500).send("fail");
		else if (result.length == 0) res.send("empty");
		else {
			let data = [];
			if (action == "list") {
				for (let row of result) {
					data.push([row.name, row._id, row.channel, row.provider]);
				}
			} else {
				if (action == "provider") data = result[0];  // Return First provider only.
				else data = result;
				if (data.auth && data.auth.password) data.auth.password = '';
			}
			return res.send(data);
		}
	} catch (exception){
		logger.error("Error occurred in admin/"+fnName, exception);
		res.status(500).send("fail");
	}
};
