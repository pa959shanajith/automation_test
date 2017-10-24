/**
 * Dependencies.
 */
var bcrypt = require('bcrypt');
var async = require('async');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = "http://127.0.0.1:1990/";
var roles = [];
var r_ids = [];
var userRoles = {};

//GetUserRoles
exports.getUserRoles_Nineteen68 = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			client.post(epurl + "admin/getUserRoles_Nineteen68",
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					res.send("fail");
				} else {
					try {
						for (var i = 0; i < result.rows.length; i++) {
							roles[i] = result.rows[i].rolename;
							r_ids[i] = result.rows[i].roleid;
						}
						userRoles.userRoles = roles;
						userRoles.r_ids = r_ids;
						res.send(userRoles);
					} catch (exception) {
						console.log(exception);
						res.send("fail");
					}
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

//GetUsers service has been changed to populate the users who has access to the project
exports.getUsers_Nineteen68 = function (req, res) {
	var prjId = req.prjId;
	var args = {
		headers: {
			"Content-Type": "application/json"
		}
	};
	client.post(epurl + "admin/getUserRoles_Nineteen68", args,
		function (userrolesresult, userrolesresponse) {
		if (userrolesresponse.statusCode != 200 || userrolesresult.rows == "fail") {
			console.log("fail");
			res(null, "fail");
		} else {
			inputs = {
				"userroles": userrolesresult.rows,
				"projectid": prjId
			};
			args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/getUsers_Nineteen68", args,
				function (getUsers, response) {
				if (response.statusCode != 200 || getUsers.rows == "fail") {
					console.log("fail");
					res(null, "fail");
				} else {
					res(null, getUsers);
				}
			});
		}
	});
};

//Get All Users
exports.getAllUsers_Nineteen68 = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var user_names = [];
			var userIds = [];
			var d_role = [];
			var userDetails = {
				user_names: [],
				userIds: [],
				d_roles: []
			};
			var args = {
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/getAllUsers_Nineteen68", args,
				function (allusersresult, allusersresponse) {
				if (allusersresponse.statusCode != 200 || allusersresult.rows == "fail") {
					console.log("fail");
					res(null, "fail");
				} else {
					for (var i = 0; i < allusersresult.rows.length; i++) {
						user_names[i] = allusersresult.rows[i].username.toLowerCase();
						userIds[i] = allusersresult.rows[i].userid;
						d_role[i] = allusersresult.rows[i].defaultrole;
					}
					userDetails.userIds = userIds;
					userDetails.user_names = user_names;
					userDetails.d_roles = d_role;
					res.send(userDetails);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

//Get Users for Edit
exports.getEditUsersInfo_Nineteen68 = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var requestedUserName = req.body.userName;
			var requestedUserId = req.body.userId;
			var userDetails = {};
			var inputs = {
				"userid": requestedUserId
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/getUserData_Nineteen68", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						res.send(null,"fail");
					} else {
						result.rows.forEach(function (iterator) {
							userDetails.userName = iterator.username.toLowerCase();
							userDetails.roleId = iterator.defaultrole;
							userDetails.additionalroles = iterator.additionalroles;
							userDetails.emailId = iterator.emailid;
							userDetails.firstName = iterator.firstname;
							userDetails.lastName = iterator.lastname;
							userDetails.ldapuser = iterator.ldapuser;
						});
						res.send(userDetails);
					}
				} catch (exception) {
					console.log(exception);
					res.send(flag);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
	}
};

//CreateUser
exports.createUser_Nineteen68 = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var flag = "fail";
			var status = false;
			var req_username = req.body.createUser.username.toLowerCase();
			var req_password = req.body.createUser.password;
			var req_firstname = req.body.createUser.firstName;
			var req_lastname = req.body.createUser.lastName;
			var req_ldapuser = req.body.createUser.ldapUser;
			var req_defaultRole = req.body.createUser.role;
			var req_email_id = req.body.createUser.email;
			var salt = bcrypt.genSaltSync(10);
			var req_hashedPassword = bcrypt.hashSync(req_password, salt);
			var inputs = {
				"query": "allusernames"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/createUser_Nineteen68", args,
				function (userNameresult, response) {
				if (response.statusCode != 200 || userNameresult.rows == "fail") {
					console.log("Error occured in createUser_Nineteen68 : Fail");
					res.send("fail");
				} else {
					try {
						for (var i = 0; i < userNameresult.rows.length; i++) {
							dbResult = userNameresult.rows[i];
							if (req_username.toLowerCase() === dbResult.username.toLowerCase()) {
								status = true;
								break;
							}
						}
						if (req_ldapuser) {
							req_hashedPassword = null;
						}
						if (status === false) {
							var inputs = {
								"query": "createuser",
								"createdby": req_username,
								"defaultrole": req_defaultRole,
								"emailid": req_email_id,
								"firstname": req_firstname,
								"lastname": req_lastname,
								"ldapuser": req_ldapuser,
								"password": req_hashedPassword,
								"username": req_username
							};
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							client.post(epurl + "admin/createUser_Nineteen68", args,
								function (result, response) {
								try {
									flag = "Success";
									res.send(flag);
								} catch (exception) {
									console.log(exception);
									res.send(flag);
								}
							});
						} else {
							flag = "User Exists";
							res.send(flag);
						}
					} catch (exception) {
						console.log(exception);
						res.send(flag);
					}
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

//Edit User
exports.updateUser_nineteen68 = function updateUser_nineteen68(req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var flag = "fail";
			var status = false;
			var userdetails = req.body.userinfo;
			var userObj = req.body.updateUserObj;
			var local_username = userObj.userName.toLowerCase();
			//needs to be sent from front end further on
			var local_additionalroles = userObj.additionalRole;
			var local_password = userObj.passWord;
			var local_firstname = userObj.firstName;
			var local_lastname = userObj.lastName;
			var local_role;
			//var local_role = userObj.role;
			var local_email_id = userObj.email;
			var local_user_Id = userObj.userId;
			var db_password = '';
			if (local_password != "") {
				var salt = bcrypt.genSaltSync(10);
				var req_hashedPassword = bcrypt.hashSync(local_password, salt);
			}
			var inputs = {
				"userid": local_user_Id
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/getUserData_Nineteen68", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						var flag = "fail";
						res.send(flag);
					} else {
						service = result.rows[0];
						if (local_username == undefined || local_username == 'undefined' || local_username == '') {
							local_username = service.username.toLowerCase();
						}
						if (local_password.trim().length == 0) {
							db_password = "existing";
						} else {
							var salt = bcrypt.genSaltSync(10);
							var req_hashedPassword = bcrypt.hashSync(local_password, salt);
						}
						if (local_firstname == undefined || local_firstname == 'undefined' || local_firstname == '') {
							local_firstname = service.firstname;
						}
						if (local_lastname == undefined || local_lastname == 'undefined' || local_lastname == '') {
							local_lastname = service.lastname;
						}

						if (local_role == undefined || local_role == 'undefined' || local_role == '') {
							local_role = service.role;
						}
						// if(local_additionalroles == undefined || local_additionalroles == 'undefined' || local_additionalroles == ''){
						//     local_additionalroles = service.additionalroles;
						// }
						if (local_email_id == undefined || local_email_id == 'undefined' || local_email_id == '') {
							local_email_id = service.emailid;
						}
						if (result.rows[0].ldapuser != null || result.rows[0].ldapuser != undefined) {
							if (result.rows[0].ldapuser) {
								db_password = null;
								req_hashedPassword = null;
							}
						}
						var inputs = {
							"userid": local_user_Id,
							"additionalroles": local_additionalroles,
							"deactivated": false,
							"emailid": local_email_id,
							"firstname": local_firstname,
							"lastname": local_lastname,
							"ldapuser": result.rows[0].ldapuser,
							"modifiedby": userdetails.username.toLowerCase(),
							"modifiedbyrole": userdetails.role,
							"password": req_hashedPassword,
							"username": local_username
						};
						if (db_password != "" && db_password != undefined) {
							inputs.password = db_password;
						}
						var args = {
							data: inputs,
							headers: {
								"Content-Type": "application/json"
							}
						};
						client.post(epurl + "admin/updateUser_Nineteen68", args,
							function (result, response) {
							try {
								if (response.statusCode != 200 || result.rows == "fail") {
									var flag = "fail";
									res.send(flag);
								} else {
									flag = "success";
									res.send(flag);
								}
							} catch (exception) {
								console.log(exception);
								res.send(flag);
							}
						});
					}
				} catch (exception) {
					console.log(exception);
					res.send(flag);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

//Get Domains
exports.getDomains_ICE = function getDomains_ICE(req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var responsedata = [];
			var args = {
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/getDomains_ICE", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						res.send("fail");
					} else {
						async.forEachSeries(result.rows, function (eachdomain, domainscallback) {
							try {
								var reponseobj = {
									domainId: "",
									domainName: ""
								};
								reponseobj.domainId = eachdomain.domainid;
								reponseobj.domainName = eachdomain.domainname;
								responsedata.push(reponseobj);
								domainscallback();
							} catch (exception) {
								console.log(exception);
							}
						}, finalresult);
					}
				} catch (exception) {
					console.log(exception);
				}
			});
			function finalresult() {
				res.send(responsedata);
			}
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

exports.createProject_ICE = function createProject_ICE(req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var createProjectObj = req.body.createProjectObj;
			var userinfo = req.body.userDetails;
			var requestedskucode = "skucodetestcase";
			var requestedtags = "tags";
			var projectTypeId = "";
			var newProjectID = "";
			async.series({
				projecttype: function (callback) {
					try {
						var inputs = {
							"query": "projecttype",
							"projecttype": createProjectObj.appType
						};
						var args = {
							data: inputs,
							headers: {
								"Content-Type": "application/json"
							}
						};
						client.post(epurl + "admin/createProject_ICE", args,
							function (projectTypeData, response) {
							try {
								if (response.statusCode != 200 || projectTypeData.rows == "fail") {}
								else {
									projectTypeId = projectTypeData.rows[0].projecttypeid;
								}
								callback();
							} catch (exception) {
								console.log(exception);
							}
						});
					} catch (exception) {
						console.log(exception);
					}
				},
				createproject: function (callback) {
					try {
						var inputs = {
							"query": "createproject",
							"domainid": createProjectObj.domainId,
							"projectname": createProjectObj.projectName,
							"createdby": userinfo.username.toLowerCase(),
							"projecttypeid": projectTypeId,
							"skucodeproject": "skucodeproject",
							"tags": "tags"
						};
						var args = {
							data: inputs,
							headers: {
								"Content-Type": "application/json"
							}
						};
						newProjectID = "";
						client.post(epurl + "admin/createProject_ICE", args,
							function (insertProjectData, response) {
							if (response.statusCode != 200 || insertProjectData.rows == "fail") {
								console.log(response.statusCode);
							} else {
								newProjectID = insertProjectData.rows[0].projectid;
								callback();
							}
						});
					} catch (exception) {
						console.log(exception);
					}
				},
				createreleases: function (callback) {
					try {
						var numberOfReleases = createProjectObj.projectDetails;
						var releasesLength = numberOfReleases.length;
						async.forEachSeries(numberOfReleases, function (eachrelease, numberOfReleasescallback) {
							try {
								var releaseDetails = eachrelease;
								var releaseName = releaseDetails.releaseName;
								var cycleNames = releaseDetails.cycleNames;
								var cyclesLength = cycleNames.length;
								var cycleindex = 0;
								var newReleaseID = "";
								var inputs = {
									"query": "createrelease",
									"projectid": newProjectID,
									"releasename": releaseName,
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
								client.post(epurl + "admin/createProject_ICE", args,
									function (data, response) {
									if (response.statusCode != 200 || data.rows == "fail") {
										console.log(response.statusCode);
									} else {
										newReleaseID = data.rows[0].releaseid;
										async.forEachSeries(cycleNames, function (cycleName, cycleNamescallback) {
											try {
												var eachCycleName = cycleName;
												var inputs = {
													"query": "createcycle",
													"releaseid": newReleaseID,
													"cyclename": eachCycleName,
													"createdby": userinfo.username.toLowerCase(),
													"skucodecycle": "skucodecycle",
													"tags": "tags"
												};
												var args = {
													data: inputs,
													headers: {
														"Content-Type": "application/json"
													}
												};
												createCycle(args, function (error, response) {
													try {
														if (error) {
															res.send(error);
														} else {
															cycleNamescallback();
														}
													} catch (exception) {
														console.log(exception);
													}
												});
											} catch (exception) {
												console.log(exception);
											}
										}, numberOfReleasescallback);
									}
								});
							} catch (exception) {
								console.log(exception);
							}
						}, callback(null, ""));
						res.send('success');
					} catch (exception) {
						console.log(exception);
					}
				}
			}, function (err, data) {
				if (err) {
					console.log(err);
				} else {
					//console.log(data);
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
	}
};

function createCycle(args, createCycleCallback) {
	var statusFlag = "";
	var cycleId="";
	client.post(epurl + "admin/createProject_ICE", args,
		function (result, response) {
		try {
			if (response.statusCode != 200 || result.rows == "fail") {
				statusFlag = "Error occured in createCycle of createProject_ICE : Fail";
				createCycleCallback(statusFlag, null);
			} else {
				//statusFlag = "success";
				//createCycleCallback(null, statusFlag);
				createCycleCallback(null, result.rows[0]);
			}
		} catch (exception) {
			console.log(exception);
		}
	});
}

/**
 * this service is used to create/update/delete projects/releases/cycles
 * from a particular domain
 */
exports.updateProject_ICE = function updateProject_ICE(req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var updateProjectDetails = req.body.updateProjectObj;
			var userinfo = req.body.userDetails;
			var requestedskucode = "skucode";
			var requestedtags = "tags";
			var flag = "";
			var requestedprojectid = updateProjectDetails.projectId;
			async.series({
				newProjectDetails: function (newProjectDetailsCallback) {
					var projectDetails = updateProjectDetails.newProjectDetails;
					async.forEachSeries(projectDetails, function (eachprojectDetail, eachprojectDetailcallback) {
						try {
							var releaseCreateStatus = eachprojectDetail.newStatus;
							if (releaseCreateStatus) {
								try {
									var releaseDetails = eachprojectDetail;
									var releaseName = releaseDetails.releaseName;
									var cycleDetails = releaseDetails.cycleDetails;
									var newReleaseID = "";
									var inputs = {
										"query": "createrelease",
										"projectid": requestedprojectid,
										"releasename": releaseName,
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
									client.post(epurl + "admin/createProject_ICE", args,
										function (data, response) {

										try {
											if (response.statusCode != 200 || data.rows == "fail") {
												console.log(response.statusCode);
											} else {
												newReleaseID = data.rows[0].releaseid;
												async.forEachSeries(cycleDetails, function (eachCycleDetail, cycleNamescallback) {
													try {
														var eachCycleName = eachCycleDetail.cycleName;
														var inputs = {
															"query": "createcycle",
															"releaseid": newReleaseID,
															"cyclename": eachCycleName,
															"createdby": userinfo.username.toLowerCase(),
															"skucodecycle": "skucodecycle",
															"tags": "tags"
														};
														var args = {
															data: inputs,
															headers: {
																"Content-Type": "application/json"
															}
														};
														createCycle(args, function (error, response) {
															if (error) {
																res.send(error);
															} else {
																try {
																	cycleNamescallback();
																} catch (exception) {
																	console.log(exception);
																}
															}
														});
													} catch (exception) {
														console.log(exception);
													}
												}, eachprojectDetailcallback);
											}
										} catch (exception) {
											console.log(exception);
										}
									});
								} catch (exception) {
									console.log(exception);
								}
							} else {
								try {
									//this piece of code runs when only cycles needs to be created
									//in a specified release
									var releaseDetails = eachprojectDetail;
									var releaseId = releaseDetails.releaseId;
									var cycleDetails = releaseDetails.cycleDetails;
									async.forEachSeries(cycleDetails, function (eachCycleDetail, cycleNamescallback) {
										try {
											var eachCycleName = eachCycleDetail.cycleName;
											var inputs = {
												"query": "createcycle",
												"releaseid": releaseId,
												"cyclename": eachCycleName,
												"createdby": userinfo.username.toLowerCase(),
												"skucodecycle": "skucodecycle",
												"tags": "tags"
											};
											var args = {
												data: inputs,
												headers: {
													"Content-Type": "application/json"
												}
											};
											createCycle(args, function (error, response) {
												if (error) {
													res.send(error);
												} else {
													try {
														cycleNamescallback();
													} catch (exception) {
														console.log(exception);
													}
												}
											});
										} catch (exception) {
											console.log(exception);
										}
									}, eachprojectDetailcallback);
								} catch (exception) {
									console.log(exception);
								}
							}
						} catch (exception) {
							console.log(exception);
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
									client.post(epurl + "admin/updateProject_ICE", args,
										function (result, response) {
										try {
											if (response.statusCode != 200 || result.rows == "fail") {
												flag = "Error in deleteRelease-updateProject_ICE : Fail";
												res.send(flag);
											} else {
												var cyclesOfRelease = eachprojectDetail.cycleDetails;
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
														client.post(epurl + "admin/updateProject_ICE", args,
															function (result, response) {
															if (response.statusCode != 200 || result.rows == "fail") {
																flag = "Error in deleteCycles(true)-updateProject_ICE : Fail";
																res.send(flag);
															} else {
																eachCycleCallback();
															}
														});
													} catch (exception) {
														console.log(exception);
													}
												}, eachprojectDetailcallback);
											}
										} catch (exception) {
											console.log(exception);
										}
									});
								} else if (!deleteStatus) {
									try {
										var cycleDetails = eachprojectDetail.cycleDetails;
										async.forEachSeries(cycleDetails, function (eachCycleDetail, eachCycleCallback) {
											try {
												var deleteStatusCycles = eachCycleDetail.deleteStatus;
												if (deleteStatusCycles) {
													try {
														var cyclesOfRelease = eachCycleDetail.cycleDetails;
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
														client.post(epurl + "admin/updateProject_ICE", args,
															function (result, response) {
															if (response.statusCode != 200 || result.rows == "fail") {
																flag = "Error in deleteCycles(false)-updateProject_ICE : Fail";
																res.send(flag);
															} else {
																eachCycleCallback();
															}
														});
													} catch (exception) {
														console.log(exception);
													}
												}
											} catch (exception) {
												console.log(exception);
											}
										}, eachprojectDetailcallback);
									} catch (exception) {
										console.log(exception);
									}
								}
							} catch (exception) {
								console.log(exception);
							}
						}, deletedProjectDetailsCallback);
					} catch (exception) {
						console.log(exception);
					}
				},
				editedProjectDetails: function (editedProjectDetailsCallback) {
					try {
						var projectDetails = updateProjectDetails.editedProjectDetails;
						async.forEachSeries(projectDetails, function (eachprojectDetail, eachprojectDetailcallback) {
							try {
								var editedStatus = eachprojectDetail.editStatus;
								if (editedStatus) {
									try {
										var newReleaseName = eachprojectDetail.releaseName;
										var releaseId = eachprojectDetail.releaseId;
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
										client.post(epurl + "admin/updateProject_ICE", args,
											function (result, response) {
											try {
												if (response.statusCode != 200 || result.rows == "fail") {
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
														client.post(epurl + "admin/createProject_ICE", args,
															function (data, response) {
															if (response.statusCode != 200 || data.rows == "fail") {
																flag = "Error in update-Release(true)-updateProject_ICE : Fail";
																res.send(flag);
															} else {
																try {
																	var cycleDetails = eachprojectDetail.cycleDetails;
																	var newCycleName = "";
																	var cycleId = "";
																	async.forEachSeries(cycleDetails, function (eachCycleDetail, eachCycleCallback) {
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
																					client.post(epurl + "admin/updateProject_ICE", args,
																						function (result, response) {
																						if (response.statusCode != 200 || result.rows == "fail") {
																							flag = "Error in delete-Cycle(true)-updateProject_ICE : Fail";
																							res.send(flag);
																						} else {
																							try {
																								var inputs = {
																									"query": "createcycle",
																									"releaseid": releaseId,
																									"cycleid": cycleId,
																									"cyclename": newCycleName,
																									"createdby": userinfo.username.toLowerCase(),
																									"skucodecycle": "skucodecycle",
																									"tags": "tags"
																								};
																								var args = {
																									data: inputs,
																									headers: {
																										"Content-Type": "application/json"
																									}
																								};
																								createCycle(args, function (error, response) {
																									if (error) {
																										res.send(error);
																									} else {
																										eachCycleCallback();
																									}
																								});
																							} catch (exception) {
																								console.log(exception);
																							}
																						}
																					});
																				} catch (exception) {
																					console.log(exception);
																				}
																			} else {
																				eachCycleCallback();
																			}
																		} catch (exception) {
																			console.log(exception);
																		}
																	}, eachprojectDetailcallback);
																} catch (exception) {
																	console.log(exception);
																}
															}
														});
													} catch (exception) {
														console.log(exception);
													}
												}
											} catch (exception) {
												console.log(exception);
											}
										});
									} catch (exception) {
										console.log(exception);
									}
								} else {
									try {
										var newReleaseName = eachprojectDetail.releaseName;
										var releaseId = eachprojectDetail.releaseId;
										var cycleDetails = eachprojectDetail.cycleDetails;
										var newCycleName = "";
										var cycleId = "";
										async.forEachSeries(cycleDetails, function (eachCycleDetail, eachCycleCallback) {
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
														client.post(epurl + "admin/updateProject_ICE", args,
															function (result, response) {
															if (response.statusCode != 200 || result.rows == "fail") {
																flag = "Error in delete-Cycle(true)-updateProject_ICE : Fail";
																res.send(flag);
															} else {
																try {
																	var inputs = {
																		"query": "createcycle",
																		"releaseid": releaseId,
																		"cycleid": cycleId,
																		"cyclename": newCycleName,
																		"createdby": userinfo.username.toLowerCase(),
																		"skucodecycle": "skucodecycle",
																		"tags": "tags"
																	};
																	var args = {
																		data: inputs,
																		headers: {
																			"Content-Type": "application/json"
																		}
																	};
																	createCycle(args, function (error, response) {
																		if (error) {
																			res.send(error);
																		} else {
																			eachCycleCallback();
																		}
																	});
																} catch (exception) {
																	console.log(exception);
																}
															}
														});
													} catch (exception) {
														console.log(exception);
													}
												} else {
													eachCycleCallback();
												}
											} catch (exception) {
												console.log(exception);
											}
										}, eachprojectDetailcallback);
									} catch (exception) {
										console.log(exception);
									}
								}
							} catch (exception) {
								console.log(exception);
							}
						}, editedProjectDetailsCallback);
					} catch (exception) {
						console.log(exception);
					}
				}
			}, function (error, response) {
				if (error) {
					console.log("fail");
					res.send("fail");
				} else {
					console.log("success");
					res.send("success");
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
	}
};

/***
 * vishvas.a
 * service renders the names of all projects in domain/projects
 * cycles
 * date 24.03.2017
 */
exports.getNames_ICE = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var requestedidslist = req.body.requestedids;
			var idtypes = req.body.idtype;
			var index = 0;
			var responsedata = {
				requestedids: [],
				respnames: [],
				idtypes: []
			};
			if (requestedidslist.length == idtypes.length) {
				for (var eachid = 0; eachid < requestedidslist.length; eachid++) {
					if (requestedidslist[eachid] != null && requestedidslist[eachid] != undefined && requestedidslist[eachid].trim() != '') {
						//in this block all projects under the domain is the response.
						if (idtypes[eachid] == 'domainsall') {
							var responsedata = {
								projectIds: [],
								projectNames: []
							};
							namesfetcher(requestedidslist[eachid], "domainsall", function (error, response) {
								try {
									if (response.length <= 0) {
										res.send("No Projects");
									} else {
										for (var i = 0; i < response.length; i++) {
											responsedata.projectIds.push(response[i].projectid);
											responsedata.projectNames.push(response[i].projectname);
											if (i == response.length - 1) {
												res.send(responsedata);
											}
										}
									}
								} catch (exception) {
									console.log(exception);
								}
							});
						} else if (idtypes[eachid] == 'projects') {
							namesfetcher(requestedidslist[eachid], "projects", function (error, response) {
								try {
									responsedata.idtypes.push('projects');
									responsedata.requestedids.push(response[0].projectid);
									responsedata.respnames.push(response[0].projectname);
									if (index == requestedidslist.length) {
										res.send(responsedata);
									}
								} catch (exception) {
									console.log(exception);
								}
							});
						} else if (idtypes[eachid] == 'releases') {
							//in this block release name and release id of the respective id is sent
							namesfetcher(requestedidslist[eachid], "releases", function (error, response) {
								try {
									responsedata.idtypes.push('releases');
									responsedata.requestedids.push(response[0].releaseid);
									responsedata.respnames.push(response[0].releasename);
									if (index == requestedidslist.length) {
										res.send(responsedata);
									}
								} catch (exception) {
									console.log(exception);
								}
							});
						} else if (idtypes[eachid] == 'cycles') {
							//in this block cycle name and cycle id of the respective id is sent
							namesfetcher(requestedidslist[eachid], "cycles", function (error, response) {
								try {
									responsedata.idtypes.push('cycles');
									responsedata.requestedids.push(response[0].cycleid);
									responsedata.respnames.push(response[0].cyclename);
									if (index == requestedidslist.length) {
										res.send(responsedata);
									}
								} catch (exception) {
									console.log(exception);
								}
							});
						} else if (idtypes[eachid] == 'screens') {
							namesfetcher(requestedidslist[eachid], "screens", function (error, response) {
								try {
									responsedata.idtypes.push('screens');
									responsedata.requestedids.push(response[0].screenid);
									responsedata.respnames.push(response[0].screenname);
									if (index == requestedidslist.length) {
										res.send(responsedata);
									}
								} catch (exception) {
									console.log(exception);
								}
							});
						} else {
							res.send("fail");
							break;
						}
					} else {
						console.log("Invalid Input");
					}
				}
			} else {
				res.send("fail");
			}

			function namesfetcher(id, query, namesfetchercallback) {
				var inputs = {
					"id": id,
					"query": query
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				client.post(epurl + "admin/getNames_ICE", args,
					function (queryStringresult, response) {
					try {
						if (response.statusCode != 200 || queryStringresult.rows == "fail") {
							statusFlag = "Error occured in namesfetcher : Fail";
							namesfetchercallback(statusFlag, null);
						} else {
							index = index + 1;
							namesfetchercallback(null, queryStringresult.rows);
						}
					} catch (exception) {
						console.log(exception);
					}
				});
			}
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
	}
};

/**
 * vishvas.a
 * service renders all the details of the child type
 * if domainid is provided all projects in domain is returned
 * if projectid is provided all release and cycle details is returned
 * if cycleid is provided, testsuite details is returned
 * date 03/04/2017
 */
exports.getDetails_ICE = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var requestedidslist = req.body.requestedids;
			var idtypes = req.body.idtype;
			var responsedata = {};
			var requestedid;
			var eachProjectDetail = {};
			var index = 0;
			if (requestedidslist.length == idtypes.length) {
				try {
					for (var eachid = 0; eachid < requestedidslist.length; eachid++) {
						requestedid = requestedidslist[eachid];
						//here the data gets sent at once
						if (idtypes[eachid] == 'domaindetails') {
							try {
								var responsedatadomains = {
									projectIds: [],
									projectNames: []
								};
								queryExecutor(requestedid, "domaindetails", "subquery", function (error, response) {
									if (error) {
										try {
											res.send("Error in getDetails_ICE_domaindetails : Fail");
										} catch (exception) {
											console.log(exception);
										}
									} else {
										try {
											if (response.length == 0) {
												res.send(responsedatadomains);
											} else {
												for (var i = 0; i < response.length; i++) {
													responsedatadomains.projectIds.push(response[i].projectid);
													responsedatadomains.projectNames.push(response[i].projectname);
													if (i == response.length - 1) {
														try {
															res.send(responsedatadomains);
														} catch (exception) {
															console.log(exception);
														}
													}
												}
											}
										} catch (exception) {
											console.log(exception);
										}
									}
								});
							} catch (exception) {
								console.log(exception);
							}
						} else if (idtypes[eachid] == 'projectsdetails') {
							try {
								responsedata = {
									appType: "",
									projectName: "",
									projectId: "",
									projectDetails: []
								};
								queryExecutor(requestedid, "projectsdetails", "projecttypeid",
									function (queryForProjectTypeIderror, queryForProjectTypeIdresponse) {
									if (queryForProjectTypeIderror) {
										try {
											res.send(queryForProjectTypeIderror);
										} catch (exception) {
											console.log(exception);
										}
									} else {
										try {
											for (var i = 0; i < queryForProjectTypeIdresponse.length; i++) {
												responsedata.projectName = queryForProjectTypeIdresponse[i].projectname;
												responsedata.projectId = queryForProjectTypeIdresponse[i].projecttypeid;
												queryExecutor(queryForProjectTypeIdresponse[i].projecttypeid, "projectsdetails", "projecttypename",
													function (queryForProjectTypeerror, queryForProjectTyperesponse) {
													if (queryForProjectTypeerror) {
														try {
															res.send(queryForProjectTypeerror);
														} catch (exception) {
															console.log(exception);
														}
													} else {
														try {
															for (var indexofName = 0; indexofName < queryForProjectTyperesponse.length; indexofName++) {
																responsedata.appType = queryForProjectTyperesponse[indexofName].projecttypename;
																queryExecutor(requestedid, "projectsdetails", "releasedetails",
																	function (queryGetReleaseserror, queryGetReleasesresponse) {
																	if (queryGetReleaseserror) {
																		try {
																			res.send(queryGetReleasesQueryerror);
																		} catch (exception) {
																			console.log(exception);
																		}
																	} else {
																		var releaseindex = 0;
																		async.forEachSeries(queryGetReleasesresponse,
																			function (eachRelease, releasecallback) {
																			try {
																				eachProjectDetail = {};
																				queryExecutor(eachRelease.releaseid, "projectsdetails", "cycledetails",
																					function (queryGetCycleserror, queryGetCyclesresponse) {
																					try {
																						if (queryGetCycleserror) {
																							try {
																								res.send(queryGetCycleserror);
																							} catch (exception) {
																								console.log(exception);
																							}
																						} else {
																							try {
																								releaseindex = releaseindex + 1;
																								var cycleindex = 0;
																								var cycleDetails = [];
																								async.forEachSeries(queryGetCyclesresponse,
																									function (eachCycle, cyclecallback) {
																									try {
																										var eachCycleObject = {};
																										responsedata.projectDetails.releaseid = eachRelease.releaseid;
																										responsedata.projectDetails.releaseid = eachRelease.releaseid;
																										eachCycleObject.cycleName = eachCycle.cyclename;
																										eachCycleObject.cycleId = eachCycle.cycleid;
																										cycleindex = cycleindex + 1;
																										cycleDetails.push(eachCycleObject);
																										cyclecallback();
																									} catch (exception) {
																										console.log(exception);
																									}
																								});
																								eachProjectDetail.releaseName = eachRelease.releasename;
																								eachProjectDetail.releaseId = eachRelease.releaseid;
																								eachProjectDetail.cycleDetails = cycleDetails;
																								if (releaseindex == queryGetReleasesresponse.length && queryGetCyclesresponse.length == cycleindex) {
																									finalDataReturn();
																								}
																							} catch (exception) {
																								console.log(exception);
																							}
																						}
																						releasecallback();
																					} catch (exception) {
																						console.log(exception);
																					}
																				});
																				responsedata.projectDetails.push(eachProjectDetail);
																			} catch (exception) {
																				console.log(exception);
																			}
																		});
																	}
																});
															}
														} catch (exception) {
															console.log(exception);
														}
													}
												});
											}
										} catch (exception) {
											console.log(exception);
										}
									}
								});
							} catch (exception) {
								console.log(exception);
							}
						} else if (idtypes[eachid] == 'cycledetails') {
							responsedata = {
								testsuiteIds: [],
								testsuiteNames: []
							};
							queryExecutor(requestedid, "cycledetails", "subquery",
								function (error, response) {
								if (error) {
									try {
										res.send("Error in getDetails_ICE_cycledetails : Fail");
									} catch (exception) {
										console.log(exception);
									}
								} else {
									async.forEachSeries(response, function (eachtestSuiteDetails, testsuiteCallback) {
										try {
											responsedata.testsuiteIds.push(eachtestSuiteDetails.testsuiteid);
											responsedata.testsuiteNames.push(eachtestSuiteDetails.testsuitename);
											testsuiteCallback();
										} catch (exception) {
											console.log(exception);
										}
									});
									finalDataReturn();
								}
							});

						} else {
							try {
								res.send("fail");
							} catch (exception) {
								console.log(exception);
							}
						}
					}
				} catch (exception) {
					console.log(exception);
				}
			} else {
				try {
					res.send("fail");
				} catch (exception) {
					console.log(exception);
				}
			}
			function queryExecutor(id, query, subquery, queryExecutorcallback) {
				var inputs = {
					"id": id,
					"query": query,
					"subquery": subquery
				};
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				client.post(epurl + "admin/getDetails_ICE", args,
					function (queryStringresult, response) {
					try {
						if (response.statusCode != 200 || queryStringresult.rows == "fail") {
							statusFlag = "Error occured in queryExecutor : Fail";
							queryExecutorcallback(statusFlag, null);
						} else {
							index = index + 1;
							queryExecutorcallback(null, queryStringresult.rows);
						}
					} catch (exception) {
						console.log(exception);
					}
				});
			}

			function finalDataReturn() {
				try {
					res.send(responsedata);
				} catch (exception) {
					console.log(exception);
				}
			}
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
	}
};

//Save Assigned Projects
exports.assignProjects_ICE = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var assignProjectsDetails = req.body.assignProjectsObj;
			var projectDetails = assignProjectsDetails.assignedProjects;
			var projectIds = [];
			var alreadyassigned = false;
			for (var i = 0; i < projectDetails.length; i++) {
				projectIds.push(projectDetails[i].projectId);
			}
			var inputs = {};
			if (assignProjectsDetails.getAssignedProjectsLen > 0) {
				alreadyassigned = true;
				inputs = {
					"alreadyassigned": alreadyassigned,
					"userid": assignProjectsDetails.userId,
					"domainid": assignProjectsDetails.domainId,
					"modifiedbyrole": assignProjectsDetails.userInfo.role,
					"modifiedby": assignProjectsDetails.userInfo.username.toLowerCase(),
					"projectids": projectIds
				};
			} else {
				inputs = {
					"alreadyassigned": alreadyassigned,
					"userid": assignProjectsDetails.userId,
					"domainid": assignProjectsDetails.domainId,
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
			client.post(epurl + "admin/assignProjects_ICE", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					res.send("fail");
				} else {
					res.send("success");
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

//get Assigned Projects
exports.getAssignedProjects_ICE = function (req, res) {
	try {
		if (req.cookies['connect.sid'] != undefined) {
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if (sessionToken != undefined && req.session.id == sessionToken) {
			var requestDetails = req.body.getAssignProj;
			var assignedProjectIds = [];
			var assignedProjObj = [];
			var inputs = {
				"query": "projectid",
				"domainid": requestDetails.domainId,
				"userid": requestDetails.userId
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			client.post(epurl + "admin/getAssignedProjects_ICE", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						res.send("fail");
					} else {
						for (var i = 0; i < result.rows.length; i++) {
							assignedProjectIds = result.rows[i].projectids;
						}
						async.forEachSeries(assignedProjectIds, function (iterator, assignProjectCallback) {
							try {
								var inputs = {
									"query": "projectname",
									"projectid": iterator
								};
								var args = {
									data: inputs,
									headers: {
										"Content-Type": "application/json"
									}
								};
								client.post(epurl + "admin/getAssignedProjects_ICE", args,
									function (result, response) {
									try {
										if (response.statusCode != 200 || result.rows == "fail") {
											res.send("fail");
										} else {
											if (result.rows.length > 0) {
												var assignedProjects = {};
												assignedProjects.projectId = iterator;
												assignedProjects.projectName = result.rows[0].projectname;
												assignedProjObj.push(assignedProjects);
											}
											assignProjectCallback();
										}
									} catch (exception) {
										console.log(exception);
										res.send("fail");
									}
								});
							} catch (exception) {
								console.log(exception);
								res.send("fail");
							}
						}, finalfunction);

					}
					function finalfunction() {
						res.send(assignedProjObj);
					}
				} catch (exception) {
					console.log(exception);
					res.send("fail");
				}
			});
		} else {
			res.send("Invalid Session");
		}
	} catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};
