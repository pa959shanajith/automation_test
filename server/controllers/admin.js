/**
 * Dependencies.
 */
var bcrypt = require('bcryptjs');
var TokenGenerator = require('uuid-token-generator')
var async = require('async');
var activeDirectory = require('activedirectory');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.NDAC_URL;
var validator =  require('validator');
var logger = require('../../logger');
var utils = require('../lib/utils');


//GetUserRoles
exports.getUserRoles_Nineteen68 = function (req, res) {
	try {
		logger.info("Inside UI service: getUserRoles_Nineteen68");
		if (utils.isSessionActive(req)) {
			logger.info("Calling NDAC Service: getUserRoles_Nineteen68");
			client.post(epurl + "admin/getUserRoles_Nineteen68",
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in getUserRoles_Nineteen68 Error Code : ERRNDAC");
					res.status(500).send("fail");
				} else {
					var rolesList = [];
					var result = result.rows;
					for (var i = 0; i < result.length; i++) {
						rolesList.push([result[i].name, result[i]._id]);
					}
					res.send(rolesList);
				}
			});
		} else {
			logger.error("Error occurred in getUserRoles_Nineteen68: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
		res.status(500).send("fail");
	}
};

// Create/Edit/Delete Users
exports.manageUserDetails = function(req, res){
	logger.info("Inside UI Service: manageUserDetails");
	try{
		if (utils.isSessionActive(req)) {
			var flag = ['2','0','0','0','0','0','0','0','0','0','0'];
			var salt = bcrypt.genSaltSync(10);
			var reqData = req.body.user;
			var action = req.body.action;
			var inputs = {};
			inputs.action=action;
			inputs.createdby = req.session.userid;
			inputs.createdbyrole = reqData.role;
			inputs.name = (reqData.username || "").trim();
			inputs.ldapuser = reqData.ldapUser;
			inputs.password = (reqData.password || "").trim();

			if (validator.isEmpty(action) || ["create","update","delete"].indexOf(action) == -1) {
				logger.error("Error occurred in admin/manageUserDetails: Invalid action.");
				flag[1]='1';
			}
			if (!validator.isLength(inputs.name,1,100)) {
				logger.error("Error occurred in admin/manageUserDetails: Invalid User name.");
				flag[2]='1';
			}
			if (action != "create") {
				inputs.userid = (reqData.userid || "").trim();
			}
			if (!inputs.ldapuser && action == "create") {
				if (validator.isEmpty(inputs.password) && !(validator.isLength(inputs.password,1,12))) {
					logger.error("Error occurred in admin/manageUserDetails: Invalid Password.");
					flag[5]='1';
				}
			}
			if (inputs.password == '') delete inputs.password;
			else inputs.password = bcrypt.hashSync(inputs.password, salt);
			if (action != "delete") {
				inputs.firstname = (reqData.firstname || "").trim();
				inputs.lastname = (reqData.lastname || "").trim();
				inputs.email = (reqData.email || "").trim();
				inputs.defaultrole = (reqData.role || "").trim();

				if (!validator.isLength(inputs.firstname,1,100)) {
					logger.error("Error occurred in admin/manageUserDetails: Invalid First name.");
					flag[3]='1';
				}
				if (!validator.isLength(inputs.lastname,1,100)) {
					logger.error("Error occurred in admin/manageUserDetails: Invalid Last name.");
					flag[4]='1';
				}
				if (!validator.isLength(inputs.email,1,100)) {
					logger.error("Error occurred in admin/manageUserDetails: Email cannot be empty.");
					flag[6]='1';
				}
				if (action == "update") {
					inputs.additionalroles = reqData.addRole || [];
					inputs.additionalroles.every(function(e) {
					});
				}
				if (inputs.ldapuser) {
					inputs.ldapuser = reqData.ldapUser || {};
					if (!inputs.ldapuser.server || validator.isEmpty(inputs.ldapuser.server)) {
						logger.error("Error occurred in admin/manageUserDetails: Invalid LDAP Server.");
						flag[9]='1';
					}
					if (validator.isEmpty(inputs.ldapuser.user)) {
						logger.error("Error occurred in admin/manageUserDetails: Invalid User Domain Name.");
						flag[10]='1';
					}
					inputs.ldapuser = JSON.stringify({server:inputs.ldapuser.server,user:inputs.ldapuser.user});
				}
			}
			flag = flag.join('');
			if (flag != "20000000000") {
				return res.send(flag);
			}
			logger.info("Calling NDAC Service: manageUserDetails");
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/manageUserDetails", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in admin/manageUserDetails Error Code : ERRNDAC");
					res.status(500).send("fail");					
				} else {
                    "change here"
					// if(action == 'delete'){
					// 	qList.push({"statement":"match p = (m)-[FNTT]-(t:TASKS{assignedTo:'"+reqData.userid+"'}) where t.status = 'assigned' or t.status = 'inprogress' or t.status = 'reassign' detach delete t;"});
					// 	qList.push({"statement":"match p = (m)-[FNTT]-(t:TASKS{reviewer:'"+reqData.userid+"'}) where t.status = 'review' detach delete t;"});
					// 	qList.push({"statement":"match p = (m)-[FNTT]-(t:TASKS{assignedTo:'"+reqData.userid+"'}) set m.assignedTo = '' "});
					// 	qList.push({"statement":"match p = (m)-[FNTT]-(t:TASKS{reviewer:'"+reqData.userid+"'}) set m.reviewer = '' "});
					// }

					// logger.info("Calling neo4jAPI execute queries for manageUserDetails");
					// neo4jAPI.executeQueries(qList,function(status1,result1){
					// 	if(status1!=200){
					// 		logger.error("Error in neo4jAPI execute queries with status for manageUserDetails: %d",status1,"\n response for manageUserDetails:%s",result1);
					// 		return res.send(result.rows);
					// 	}
					// 	else{
					// 		logger.info('neo4jAPI execute queries for manageUserDetails executed successfully');
					// 		return res.send(result.rows);
					// 	}
					// });					
					res.send(result.rows)
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception){
		logger.error("Error occurred in admin/manageUserDetails", exception);
		res.status(500).send("fail");
	}
};

// Fetch Users or a specific user details
exports.getUserDetails = function (req, res) {
	logger.info("Inside UI Service: getUserDetails");
	try{
		if (utils.isSessionActive(req)) {
			var action = req.body.action;
			var userid = req.body.args;
			logger.info("Calling NDAC Service: getUserDetails");
			var inputs = {};
			if (action != "user") inputs.userid = userid;
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/getUserDetails", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in admin/getUserDetails Error Code : ERRNDAC");
					res.status(500).send("fail");
				} else if (result.rows.length == 0) {
					res.send("empty");
				} else {
					var data;
					if (action != "user") {
						result = result.rows[0];
						//var password = result.password;
						data = {
							userid: userid,
							username: result.name,
							password: '',
							firstname: result.firstname,
							lastname: result.lastname,
							email: result.email,
							role: result.defaultrole,
							addrole: result.addroles,
							ldapuser: result.ldapuser,
						};
						if (!data.ldapuser.server) data.ldapuser = false;
						return res.send(data);
					}
					else {
						data = [];
						var result = result.rows;
						for(var i = 0; i < result.length; i++) {
							data.push([result[i].name,result[i]._id,result[i].defaultrole,result[i].rolename]);
						}
						return res.send(data);
					}
				}
			});
		} else {
			res.status(403).send("Invalid Session");
		}
	} catch (exception){
		logger.error("Error occurred in admin/getUserDetails", exception);
		res.status(500).send("fail");
	}
};

exports.getDomains_ICE = function getDomains_ICE(req, res) {
	logger.info("Inside UI service: getDomains_ICE");
	try {
		if (utils.isSessionActive(req)) {
			var responsedata = [];
			var args = {
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service: getDomains_ICE");
			client.post(epurl + "admin/getDomains_ICE", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in getDomains_ICE Error Code : ERRNDAC");
						res.send("fail");
					} else {
						res.send(result.rows)
					}
				} catch (exception) {
				logger.error(exception.message);
				}
			});
			function finalresult() {
				logger.info("Domains fetched successfully");
				res.send(responsedata);
			}
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

//Generate Token for CI User
exports.manageCIUsers = function (req, res) {
	logger.info("Inside UI service: manageCIUsers");
	try {
		if (utils.isSessionActive(req)) {
			if(req.body.action=="create")
			{
				var requestDetails = req.body.CIUser;
				const tokgen2 = new TokenGenerator(256, TokenGenerator.BASE62);
				var token=tokgen2.generate()
				var salt = bcrypt.genSaltSync(10);
				var inputs = {
					userid: requestDetails.userId,
					expireson: requestDetails.expiry,
					name: requestDetails.tokenname,
					hash: bcrypt.hashSync(token, salt),
					action: req.body.action,
					type: "TOKENS",
					deactivated: "active"
				};
			}
			if(req.body.action=="deactivate")
			{
				var requestDetails = req.body.CIUser;
				var inputs = {
					userid: requestDetails.userId,
					name: requestDetails.tokenName,
					action: req.body.action,
				};
			}
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service : admin/manageCIUsers");
			client.post(epurl + "admin/manageCIUsers",args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					res.send("fail");
				} else if (response.statusCode != 200 || result.rows == "duplicate"){
					res.send("duplicate")
				}else {
					res.send(result.rows);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Error occurred in admin/manageCIUsers:", exception);
		res.status(500).send("fail");
	}
};

//Fetch CI User details
exports.getCIUsersDetails = function(req,res){
	logger.info("Inside UI Service: getCIUsersDetails");
	try {
		if (utils.isSessionActive(req)) {
			var requestDetails = req.body.CIUser;
			var inputs = {
				user_id: requestDetails.userId
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service : admin/getCIUsersDetails");
			client.post(epurl + "admin/getCIUsersDetails",args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					res.send("fail");
				} else {
					res.send(result.rows);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Error occurred in admin/getCIUsersDetails:", exception);
		res.status(500).send("fail");
	}
};

//Manage Session for User
exports.manageSessionData = function (req, res) {
	logger.info("Inside UI service: manageSessionData");
	try {
		if (utils.isSessionActive(req)) {
			var currUser = req.session.username;
			var action = req.body.action;
			var user = req.body.user;
			var key = req.body.key;
			var data = {sessionData: [], clientData: []};
			if (action == "get") {
				logger.info("Inside UI service: manageSessionData/getSessions");
				utils.getSocketList("ICE", function(connectusers) {
					connectusers.forEach(function(e) {
						data.clientData.push({
							username: e[0],
							mode: e[1],
							ip: e[2]
						});
					});
					utils.allSess(function(err, sessions){
						if (err) {
							logger.error("Error occurred in admin/manageSessionData");
							logger.debug(err);
						} else {
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
						}
						return res.send(data);
					});
				});
			} else if (action == "logout" || action == "disconnect") {
				logger.info("Inside UI service: manageSessionData/"+action);
				if (action == "logout") key = Buffer.from(req.body.key, "base64").toString();
				var d2s = {"action":action, "key":key, "user":user, "cmdBy":currUser};
				utils.delSession(d2s, function(err){
					if (err) {
						logger.error("Error occurred in admin/manageSessionData: Fail to "+action+" "+user);
						logger.debug(err);
						return res.status(500).send("fail");
					} else return res.send("success");
				});
			}
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Error occurred in admin/manageSessionData:",exception);
		res.status(500).send("fail");
	}
};


exports.getNames_ICE = function (req, res) {
	logger.info("Inside UI service: getNames_ICE");
	try {
		if (utils.isSessionActive(req)) {
			var id=req.body.requestedids;
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
				logger.info("Calling NDAC Service from namesfetcher: admin/getNames_ICE");
				client.post(epurl + "admin/getNames_ICE", args,
					function (queryStringresult, response) {
					try {
						if (response.statusCode != 200 || queryStringresult.rows == "fail") {
							var statusFlag = "Error occurred in namesfetcher : Fail";
							logger.error("Error occurred in admin/getNames_ICE from namesfetcher Error Code : ERRNDAC");
							// namesfetchercallback(statusFlag, null);
						} else {
							respLength = queryStringresult.rows.length;
							responsedata = {
								projectIds: [],
								projectNames: []
							};
							if (respLength <= 0) {
								logger.info('No projects found');
								res.send("No Projects");
							} else {
								for (var i = 0; i < respLength; i++) {
									responsedata.projectIds.push(queryStringresult.rows[i]._id);
									responsedata.projectNames.push(queryStringresult.rows[i].name);
									if (i == respLength - 1) {
										logger.info('Project details fetched successfully');
										res.send(responsedata);
									}
								}
							}
						}
					} catch (exception) {
						logger.error(exception.message);
					}
				});
			}
			else {
				logger.info("Invalid Session");
				res.send("Invalid Session");
			}
		} catch (exception) {
			logger.error(exception.message);
		}
	};

exports.createProject_ICE = function createProject_ICE(req, res) {
	try {
		logger.info("Inside UI service: createProject_ICE");
		if (utils.isSessionActive(req)) {
			var createProjectObj=req.body.createProjectObj;
			var userDetails=req.body.userDetails;
			var inputs={
				name: createProjectObj.projectName,
				domain: createProjectObj.domain,
				type: createProjectObj.appType,
				releases: createProjectObj.projectDetails,
				createdbyrole: userDetails.role,
				createdby: userDetails.user_id,
				modifiedby: userDetails.user_id,
				modifiedbyrole: userDetails.role
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service: createProject_ICE");
			client.post(epurl + "admin/createProject_ICE", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in createProject_ICE Error Code : ERRNDAC");
						res.send("fail");
					} else {
						res.send(result.rows)
					}
				} catch (exception) {
				logger.error(exception.message);
				}
			});
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
	}
};

exports.testLDAPConnection = function(req, res){
	logger.info("Inside UI Service: testLDAPConnection");
	try{
		if (utils.isSessionActive(req)) {
			var reqData = req.body;
			var ldapURL = (reqData.ldapURL || "").trim();
			if (ldapURL.slice(0,8) == "ldaps://") {
				logger.error("Error occurred in admin/testLDAPConnection: 'ldaps' protocol is not supported.");
				res.send("invalid_url_protocol");
			} else if (ldapURL.slice(0,7) != "ldap://") {
				logger.error("Error occurred in admin/testLDAPConnection: Invalid URL provided for connection test.");
				res.send("invalid_url");
			}
			var baseDN = (reqData.baseDN || "").trim();
			var authUser = (reqData.username || "").trim();
			var authKey = (reqData.password || "").trim();
			var authType = reqData.authType;
			var adConfig = {
				url: ldapURL,
				baseDN: baseDN
			};
			if (authType == "simple") {
				adConfig.bindDN = authUser;
				adConfig.bindCredentials = authKey;
			}
			var ad = new activeDirectory(adConfig);
			var resSent = false;
			ad.find("cn=*", function (err, result) {
				if (resSent) return;
				resSent = !resSent;
				var flag = "success";
				var data = {fields:{}};
				if (err) {
					if (err.errno == "EADDRNOTAVAIL" || err.errno == "ECONNREFUSED" || err.errno == "ETIMEDOUT") flag = "invalid_addr";
					else if (err.errno == "INSUFFICIENT_ACCESS_RIGHTS") {
						if (authType == "simple") flag = "insufficient_access";
						else flag = "success";
					} else if (err.lde_message) {
						if (err.lde_message.indexOf("DSID-0C0906E8") > -1) {
							if (authType == "simple") flag = "insufficient_access";
							else flag = "invalid_auth";
						} else if (err.lde_message.indexOf("DSID-031522C9") > -1) {
							flag = "insufficient_access";
							logger.error("User Does not have sufficient Access!");
						} else if (((err.lde_message.indexOf("DSID-0C0903A9") > -1) || (err.lde_message.indexOf("DSID-0C090400") > -1)) && authType == "simple") flag = "invalid_credentials";
						else if (err.lde_message.indexOf("DSID-031007DB") > -1) flag = "invalid_basedn";
					}
					else flag = "fail";
					logger.debug("Error occurred in admin/testLDAPConnection: " + JSON.stringify(err));
				}
				if (flag == "success") {
					logger.info('LDAP Connection test passed!');
					if (result && result.users && result.users.length>0) data.fields = Object.keys(result.users[0]);
				} else {
					logger.error('LDAP Connection test failed!');
				}
				data.flag = flag;
				return res.send(data);
			});
		} else {
			res.send("Invalid Session");
		}
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

exports.getLDAPConfig = function(req, res){
	logger.info("Inside UI Service: getLDAPConfig");
	try{
		if (utils.isSessionActive(req)) {
			var action = req.body.action;
			var name = req.body.args;
			var opts = (req.body.opts || "").trim();
			logger.info("Calling NDAC Service: getLDAPConfig");
			var inputs = {};
			if (action != "server") inputs.name = name;
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
					res.status(500).send("fail");
				} else if (result.rows.length == 0) {
					res.send("empty");
				} else {
					var data;
					if (action != "server") {
						result = result.rows;
						var bindCredentials = result.bindcredentials;
						data = {
							url: result.url,
							basedn: result.basedn,
							auth: result.auth,
							binddn: result.binddn,
							bindCredentials: '',
							fieldmap: result.fieldmap
						};
						if (action == "config") return res.send(data);
						if (action == "user") {
							var adConfig = {
								url: data.url,
								baseDN: data.basedn
							};
							if (data.auth == "simple") {
								adConfig.bindDN = data.binddn;
								adConfig.bindCredentials = bindCredentials;
							}
							var dataMaps = data.fieldmap;
							var filter = dataMaps.uname;
							var ad = new activeDirectory(adConfig);
							if (opts.length > 0) {
								var resSent = false;
								ad.findUser(opts, function (err, result) {
									if (resSent) return;
									resSent = !resSent;
									if (err) {
										if (err.lde_message.indexOf("DSID-031522C9") > -1) {
											logger.error("Error occurred in admin/getLDAPConfig: Fetch User Details: Insufficient Access");
											data = "insufficient_access";
										} else {
											logger.error("Error occurred in admin/getLDAPConfig: Fetch User Details:", err.lde_message);
											logger.debug("ERROR: " + JSON.stringify(err));
											data = "server_error";
										}
									}
									if (result) {
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
								var resSent = false;
								ad.find(filter+"=*", function (err, result) {
									if (resSent) return;
									resSent = !resSent;
									if (err) {
										if (err.lde_message.indexOf("DSID-031522C9") > -1) {
											logger.error("Error occurred in admin/getLDAPConfig: Fetch Users: Insufficient Access");
											data = "insufficient_access";
										} else {
											logger.error("Error occurred in admin/getLDAPConfig: Fetch Users:", err.lde_message);
											logger.debug("ERROR: " + JSON.stringify(err));
											data = "server_error";
										}
									}
									if (result) {
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
						}
					}
					else {
						data = [];
						for(var i = 0; i < result.rows.length; i++) {
							data.push(result.rows[i].name);
						}
						return res.send(data);
					}
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception){
		logger.error("Error occurred in admin/getLDAPConfig", exception);
		res.status(500).send("fail");
	}
};

exports.manageLDAPConfig = function(req, res){
	logger.info("Inside UI Service: manageLDAPConfig");
	try{
		if (utils.isSessionActive(req)) {
			var flag = ['1','0','0','0','0','0','0','0','0'];
			var reqData = req.body.conf;
			var action = req.body.action;
			var inputs = {};
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
				inputs.auth = reqData.auth;
				inputs.fieldmap = reqData.fieldmap || {};
				if (validator.isEmpty(inputs.url)) {
					logger.error("Error occurred in admin/manageLDAPConfig: LDAP Server URL cannot be empty.");
					flag[3] = '1';
				} else if (inputs.url.slice(0,8) == "ldaps://") {
					logger.error("Error occurred in admin/manageLDAPConfig: 'ldaps' protocol is not supported.");
					flag[3] = '2';
				} else if (inputs.url.slice(0,7) != "ldap://") {
					logger.error("Error occurred in admin/manageLDAPConfig: Invalid URL provided for connection test.");
					flag[3] = '3';
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
			if (flag != "100000000") {
				return res.send(flag);
			}
			logger.info("Calling NDAC Service: manageLDAPConfig");
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/manageLDAPConfig", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in admin/manageLDAPConfig Error Code : ERRNDAC");
					res.status(500).send("fail");
				} else {
					return res.send(result.rows);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception){
		logger.error("Error occurred in admin/manageLDAPConfig", exception);
		res.status(500).send("fail");
	}
};

exports.getDetails_ICE = function (req, res) {
	logger.info("Inside UI service: getDetails_ICE");
	var checkresBody = validator.isJSON(JSON.stringify(req.body));
	if (checkresBody == true) {
		try {
			if (utils.isSessionActive(req)) {
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
					logger.info("Calling NDAC Service from namesfetcher: admin/getDetails_ICE");
					client.post(epurl + "admin/getDetails_ICE", args,
						function (queryStringresult, response) {
						try {
							if (response.statusCode != 200 || queryStringresult.rows == "fail") {
								var statusFlag = "Error occurred in namesfetcher : Fail";
								logger.error("Error occurred in admin/getDetails_ICE from namesfetcher Error Code : ERRNDAC");
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
								else{
									var responsedatadomains = {
										projectIds: [],
										projectNames: []
									};
									for (var i = 0; i < queryStringresult.rows.length; i++) {
										responsedatadomains.projectIds.push(queryStringresult.rows[i]._id);
										responsedatadomains.projectNames.push(queryStringresult.rows[i].name);
									}
									res.send(responsedatadomains)
								}
							}
						} catch (exception) {
							logger.error(exception.message);
						}
					});
				}
				else {
					logger.info("Invalid Session");
					res.send("Invalid Session");
				}
			} catch (exception) {
				logger.error(exception.message);
			}
		};
}

exports.assignProjects_ICE = function (req, res) {
	logger.info("Inside UI Service: assignProjects_ICE");
	try {
		if (utils.isSessionActive(req)) {
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
				logger.info("Calling NDAC Service : admin/assignProjects_ICE");
				client.post(epurl + "admin/assignProjects_ICE", args,
					function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in admin/assignProjects_ICE Error Code : ERRNDAC");
						res.send("fail");
					} else {
                        inputs.projectids1 = "'"+inputs.projectids.join('\',\'')+"'";
                        //Execute neo4j query!!
						var qList=[];
						res.send(result.rows);
                        /*qList.push({"statement":"MERGE (n:ICEPERMISSIONS_NG {userid:'"+inputs.userid+
                                    "',domainid:'"+inputs.domainid+"'}) set n.projectids=["+inputs.projectids1+"] return n"});*/
                        //Relationships
                        /*qList.push({"statement":"MATCH (a:ICEPERMISSIONS_NG{userid:'"+inputs.userid+
                                    "',domainid:'"+inputs.domainid+"'}),(b:DOMAINS_NG {domainid:'"+
                                    inputs.domainid+"'}) MERGE(a)-[r:FICETDOM_NG{id:'"+inputs.domainid+"'}]->(b) return a,r,b"});*/

						// MATCH p = (a:DOMAINS_NG{userid:'bced8722-1ce1-41e0-b7d3-d9a9c0bcd800'})-[r1]->(d:DOMAINS_NG) return p
						
						// if length of unassigned projects > 0 then delete tasks of that project
						// if(assignProjectsDetails.deletetasksofprojects.length > 0){
						// 	assignProjectsDetails.deletetasksofprojects.forEach(function(e,i){
						// 		qList.push({"statement":"match p = (m{projectID:'"+e.projectid+"'})-[FNTT]-(t:TASKS{assignedTo:'"+assignProjectsDetails.userId+"'}) where t.status = 'assigned' or t.status = 'inprogress' or t.status = 'reassign' detach delete t;"});
						// 		qList.push({"statement":"match p = (m{projectID:'"+e.projectid+"'})-[FNTT]-(t:TASKS{reviewer:'"+assignProjectsDetails.userId+"'}) where t.status = 'review' detach delete t;"});
						// 		qList.push({"statement":"match p = (m{projectID:'"+e.projectid+"'})-[FNTT]-(t:TASKS{assignedTo:'"+assignProjectsDetails.userId+"'}) set m.assignedTo = '' "});
						// 		qList.push({"statement":"match p = (m{projectID:'"+e.projectid+"'})-[FNTT]-(t:TASKS{reviewer:'"+assignProjectsDetails.userId+"'}) set m.reviewer = '' "});
						// 	});
						// }

						// logger.info("Calling neo4jAPI execute queries for assignProjects_ICE");
                        // neo4jAPI.executeQueries(qList,function(status,result){
                        //     if(status!=200){
                        //    		logger.info("Error in neo4jAPI execute queries with status for assignProjects_ICE: %d",status,"\n response for assignProjects_ICE:%s",result);
                        //     }
                        //     else{
                        //         logger.info('neo4jAPI execute queries for assignProjects_ICE executed successfully');
                        //         res.send("success");
                        //     }
                        // });
					}
				});
			} else {
				res.send('fail');
			}
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

exports.getAssignedProjects_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: getAssignedProjects_ICE");
		if (utils.isSessionActive(req)) {
			var requestDetails = req.body.getAssignProj;
			var assignedProjectIds = [];
			var assignedProjObj = [];
			var inputs = {
				"query": "projectid",
				"domain": requestDetails.domainname,
				"userid": requestDetails.userId
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service : admin/getAssignedProjects_ICE");
			client.post(epurl + "admin/getAssignedProjects_ICE", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in admin/getAssignedProjects_ICE Error Code : ERRNDAC");
						res.send("fail");
					} else {
						assignedProjectIds = result.rows.projects;
						// async.forEachSeries(assignedProjectIds, function (iterator, assignProjectCallback) {
							try {
								var inputs = {
									"query": "projectname",
									"projectid": assignedProjectIds
								};
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								logger.info("Calling NDAC Service : admin/getAssignedProjects_ICE inside async function");
								client.post(epurl + "admin/getAssignedProjects_ICE", args,
									function (result, response) {
									try {
										if (response.statusCode != 200 || result.rows == "fail") {
											logger.error("Error occurred in admin/getAssignedProjects_ICE inside async function Error Code : ERRNDAC");
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
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

function createCycle(args, createCycleCallback) {
	logger.info("Inside function createCycle");
	var statusFlag = "";
	logger.info("Calling NDAC Service from createCycle:createProject_ICE");
	client.post(epurl + "admin/updateProject_ICE", args,
		function (result, response) {
		try {
			if (response.statusCode != 200 || result.rows == "fail") {
				statusFlag = "Error occurred in createCycle of createProject_ICE : Fail";
				logger.error("Error occurred in createProject_ICE from createCycle Error Code : ERRNDAC");
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
		if (utils.isSessionActive(req)) {
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
										logger.info("Calling NDAC Service from newProjectDetails : admin/createProject_ICE");
										client.post(epurl + "admin/updateProject_ICE", args,
											function (data, response) {

											try {
												if (response.statusCode != 200 || data.rows == "fail") {
												logger.error("Error occurred in admin/createProject_ICE from newProjectDetails Error Code : ERRNDAC");
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
													"cyclename": eachCycleName,
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
										logger.info("Calling NDAC Service from deletedProjectDetails : admin/updateProject_ICE");
										client.post(epurl + "admin/updateProject_ICE", args,
											function (result, response) {
											try {
												if (response.statusCode != 200 || result.rows == "fail") {
													flag = "Error in deleteRelease-updateProject_ICE : Fail";
													logger.error("Error occurred in admin/updateProject_ICE from deletedProjectDetails Error Code : ERRNDAC");
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
															logger.info("Calling NDAC Service from deletedProjectDetails inside async : admin/updateProject_ICE");
															client.post(epurl + "admin/updateProject_ICE", args,
																function (result, response) {
																if (response.statusCode != 200 || result.rows == "fail") {
																	logger.error("Error occurred in admin/updateProject_ICE inside async Error Code : ERRNDAC");
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
															logger.info("Calling NDAC Service inside async from !deleteStatus: admin/updateProject_ICE");
															client.post(epurl + "admin/updateProject_ICE", args,
																function (result, response) {
																if (response.statusCode != 200 || result.rows == "fail") {
																	logger.error("Error occurred in admin/updateProject_ICE inside async from !deleteStatus Error Code : ERRNDAC");
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
									var newReleaseName = eachprojectDetail.releaseName;
									var releaseId = eachprojectDetail.releaseId;
									if (editedStatus) {
										try {
											var inputs = {
												"query": "deleterelease",
												"releasename": eachprojectDetail.oldreleaseName,
												"projectid": requestedprojectid,
												"releaseid": releaseId
											};
											var args = {
												data: inputs,
												headers: {
													"Content-Type": "application/json"
												}
											};
											logger.info("Calling NDAC Service from editedProjectDetails : admin/updateProject_ICE");
											client.post(epurl + "admin/updateProject_ICE", args,
												function (result, response) {
												try {
													if (response.statusCode != 200 || result.rows == "fail") {
														logger.error("Error occurred in admin/updateProject_ICE from editedProjectDetails Error Code : ERRNDAC");
														flag = "Error in delete-Release(true)-updateProject_ICE : Fail";
														res.send(flag);
													} else {
														try {
															var inputs = {
																"query": "createrelease",
																"projectid": requestedprojectid,
																"releaseid": releaseId,
																"releasename": newReleaseName,
																"createdby": userinfo.username.toLowerCase(),
																"skucoderelease": "skucoderelease",
																"tags": "tags"
															};
															var args = {
																data: inputs,
																headers: {
																	"Content-Type": "application/json"
																}
															};
															logger.info("Calling NDAC Service from editedProjectDetails :admin/createProject_ICE");
															client.post(epurl + "admin/createProject_ICE", args,
																function (data, response) {
																if (response.statusCode != 200 || data.rows == "fail") {
																	logger.error("Error occurred in admin/createProject_ICE from editedProjectDetails Error Code : ERRNDAC");
																	flag = "Error in update-Release(true)-updateProject_ICE : Fail";
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
																						newCycleName = eachCycleDetail.cycleName;
																						cycleId = eachCycleDetail.cycleId;
																						var inputs = {
																							"query": "deletecycle",
																							"cyclename": eachCycleDetail.oldCycleName,
																							"releaseid": releaseId,
																							"cycleid": cycleId
																						};
																						var args = {
																							data: inputs,
																							headers: {
																								"Content-Type": "application/json"
																							}
																						};
																						logger.info("Calling NDAC Service from editedProjectDetails :admin/updateProject_ICE");
																						client.post(epurl + "admin/updateProject_ICE", args,
																							function (result, response) {
																							if (response.statusCode != 200 || result.rows == "fail") {
																								logger.error("Error occurred in admin/updateProject_ICE from editedProjectDetails Error Code : ERRNDAC");
																								flag = "Error in delete-Cycle(true)-updateProject_ICE : Fail";
																								res.send(flag);
																							} else {
																								try {
																									var inputs = {
																										"query": "createcycle",
																										"releaseid": releaseId,
																										"cycleid": cycleId,
																										"cyclename": newCycleName,
																										"createdby": userinfo.username.toLowerCase()
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
																											res.send(error);
																										} else {
																											eachCycleCallback();
																										}
																									});
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
															});
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
															newCycleName = eachCycleDetail.cycleName;
															cycleId = eachCycleDetail.cycleId;
															var inputs = {
																"query": "deletecycle",
																"cyclename": eachCycleDetail.oldCycleName,
																"releaseid": releaseId,
																"cycleid": cycleId
															};
															var args = {
																data: inputs,
																headers: {
																	"Content-Type": "application/json"
																}
															};
															logger.info("Calling NDAC Service : admin/updateProject_ICE");
															client.post(epurl + "admin/updateProject_ICE", args,
																function (result, response) {
																if (response.statusCode != 200 || result.rows == "fail") {
																	logger.error("Error occurred in admin/updateProject_ICE Error Code : ERRNDAC");
																	flag = "Error in delete-Cycle(true)-updateProject_ICE : Fail";
																	res.send(flag);
																} else {
																	try {
																		var inputs = {
																			"query": "createcycle",
																			"releaseid": releaseId,
																			"cycleid": cycleId,
																			"cyclename": newCycleName,
																			"createdby": userinfo.username.toLowerCase()
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
																				res.send(error);
																			} else {
																				eachCycleCallback();
																			}
																		});
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
		} else {
			logger.info("Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error(exception.message);
	}
};

//GetUsers service has been changed to populate the users who has access to the project
exports.getUsers_Nineteen68 = function (req, res) {
	logger.info("Inside UI service: getUsers_Nineteen68");
	var prjId = req.prjId;
	var args = {
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service: getUsers_Nineteen68");
	client.post(epurl + "admin/getUserRoles_Nineteen68", args,
		function (userrolesresult, userrolesresponse) {
		if (userrolesresponse.statusCode != 200 || userrolesresult.rows == "fail") {
			logger.error("Error occurred in getUsers_Nineteen68 Error Code : ERRNDAC");
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
			logger.info("Calling NDAC Service: getUsers_Nineteen68");
			client.post(epurl + "admin/getUsers_Nineteen68", args,
				function (getUsers, response) {
				if (response.statusCode != 200 || getUsers.rows == "fail") {
					logger.error("Error occurred in getUsers_Nineteen68 Error Code : ERRNDAC");
					res(null, "fail");
				} else {
					logger.info("Users fetched successfully");
					res(null, getUsers);
				}
			});
		}
	});
};

//-----------------------------------------------------no changes here
exports.getAvailablePlugins = function (req, res) {
	logger.info("Inside UI service: getAvailablePlugins");
	try {
		if (utils.isSessionActive(req)) {
			client.post(epurl + "admin/getAvailablePlugins",
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					res.send("fail");
				} else {
					res.send(result.rows);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Error occurred in admin/getAvailablePlugins:", exception);
		res.send("fail");
	}
};