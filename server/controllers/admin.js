/**
 * Dependencies.
 */
var Joi = require('joi');
var client_cas = require('../../server/config/cassandra');
var cassandra = require('cassandra-driver');
var Joi = require('joi');
var dbConn = require('../../server/config/cassandra');
var cassandra = require('cassandra-driver');
var uuid = require('uuid-random');
//var passwordHash = require('password-hash');
var bcrypt = require('bcrypt');
var async = require('async');
var dbConnHistory = require('../../server/config/nineteen68History');
var dbConnICEHistory = require('../../server/config/ICEHistory');

var Client = require("node-rest-client").Client;
var client = new Client();
var epurl="http://127.0.0.1:1990/";
//var set = require('set');
var dbConnICE = require('../../server/config/icetestautomation');

var roles = [];
var r_ids = [];
var userRoles = {};

//GetUserRoles
exports.getUserRoles_Nineteen68 = function(req, res){
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		// var getUserRoles = "select roleid, rolename from roles";
		
		// dbConn.execute(getUserRoles, function (err, result) {
		client.post(epurl+"admin/getUserRoles_Nineteen68",
						function (result, response) {
			// if (err) {
			if (response.statusCode != 200 || result.rows == "fail") {
				res.send("fail");
			}
			else {
				try{
					for (var i = 0; i < result.rows.length; i++) {
						roles[i] = result.rows[i].rolename;
						r_ids[i] = result.rows[i].roleid;
					}
					userRoles.userRoles = roles;
					userRoles.r_ids = r_ids;
					res.send(userRoles);
				}catch(exception){
					console.log(exception);
					res.send("fail");
				}
			}
		});
	}
	else{
		res.send("Invalid Session");
	}
	}catch(exception){
		console.log(exception);
		res.send("fail");
	}
};

//GetUsers service has been changed to populate the users who has access to the project
exports.getUsers_Nineteen68 = function(req, res){

	var roles = [];
	var r_ids = [];
    var prjId=req.prjId;
	var userRoles = {userRoles:[],r_ids:[]};
	var args = {headers:{"Content-Type" : "application/json"}}
	client.post(epurl+"admin/getUserRoles_Nineteen68",args,
				function (userrolesresult, userrolesresponse) {
					if(userrolesresponse.statusCode != 200 || userrolesresult.rows == "fail"){	
							console.log("fail");
							res(null,"fail");
					}else{
						inputs = { "userroles":userrolesresult.rows,"projectid":prjId };
						args = {data:inputs,headers:{"Content-Type" : "application/json"}}
						client.post(epurl+"admin/getUsers_Nineteen68",args,
								function (getUsers, response) {
						if(response.statusCode != 200 || getUsers.rows == "fail"){	
									console.log("fail");
									res(null,"fail");
								}else{
									res(null,getUsers);
								}
						});
					}
	});

	// var getUserId = "select userid,projectids from icepermissions;"
    // var i=0,j=0;
	// dbConnICE.execute(getUserId, function (err, result) {
	// 	if (err) {
	// 		res(null, err);
	// 	}
	// 	else {


	// 		async.forEachSeries(result.rows,function(iterator,callback1){
	// 			try{
	// 				j++;
	// 				if (iterator.projectids != null && iterator.projectids.length>0 && JSON.parse(JSON.stringify(iterator.projectids)).indexOf(prjId)>-1){
	// 					roles.push(iterator.userid);
	// 				}
	// 				if(j<result.rows.length){
	// 					callback1();
	// 				}else{
	// 					getNames();
	// 				}
	// 			}catch(ex){
	// 				console.log(ex);
	// 			}
                
				
	// 		});
            
    //         function getNames(){
	// 			var userid=[];
    //             async.forEachSeries(roles,function(iterator,callback2){
	// 				i++;
					
	// 				var getUserName = "select username,defaultrole from users where userid="+iterator;
	// 				dbConn.execute(getUserName, function (err, result2) {
	// 					if (err) {
	// 						res(null, err);
	// 					}
	// 					else {
	// 						try{
	// 							if(result2.rows.length>0 && result2.rows[0] != undefined && (result2.rows[0].defaultrole!='160d3943-e6d9-4630-a824-cabf54f225d2' && result2.rows[0].defaultrole!='b5e9cb4a-5299-4806-b7d7-544c30593a6e')){
	// 								r_ids.push(result2.rows[0].username);
	// 								userid.push(iterator);
	// 							}
							
	// 							if(i<roles.length){
	// 								callback2();
	// 							}else{
	// 								userRoles.userRoles =r_ids ;
	// 								userRoles.r_ids = userid;
	// 								//console.log('----------------------------'+userid);
	// 								//console.log('----------------------------'+r_ids);
	// 								res(null,userRoles);
	// 							}
	// 						}catch(ex){
	// 							console.log(ex);
	// 						}
								
	// 					}
	// 				});
	// 			});
    //         } 
	// 	}
	// });
};

//GetUsers
exports.getUsersOld_Nineteen68 = function(req, res){
	try{
		var roles = [];
		var r_ids = [];
		var userRoles = {userRoles:[],r_ids:[]};
		var getUserRoles = "select userid, username from nineteen68.users ";
		dbConn.execute(getUserRoles, function (err, result) {
			if (err) {
				res(null, err);
			}
			else {
				try{
					async.forEachSeries(result.rows,function(iterator,callback1){
						try{
							roles.push(iterator.username.toLowerCase());
							r_ids.push(iterator.userid);
							callback1();
						}
						catch(exception){console.log(exception);}
					});
					userRoles.userRoles = roles;
					userRoles.r_ids = r_ids;
					//console.log(userRoles);
					res(null,userRoles);
				}
				catch(exception){console.log(exception);}
			}
		});		
	}
	catch(exception){
		console.log(exception);
	}
};

//Get All Users
exports.getAllUsers_Nineteen68 = function(req, res){
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{

		var user_names = [];
		var userIds = [];
		var d_role = [];
		var userDetails = {user_names:[], userIds : [], d_roles:[]};
		var getUsers = "select userid, username, defaultrole from nineteen68.users ";
		dbConn.execute(getUsers, function (err, result) {
			try{
				if (err) {
					console.log("Error::::::",err);
					res.send("fail");
				}
				else {
					async.forEachSeries(result.rows,function(iterator,callback1){
						try{
							user_names.push(iterator.username.toLowerCase());
							userIds.push(iterator.userid);
							d_role.push(iterator.defaultrole);
							callback1();							
						}
						catch(exception){
							console.log(exception);
							res.send("fail");
						}
					});
					userDetails.userIds = userIds;
					userDetails.user_names = user_names;
					userDetails.d_roles = d_role;
					//console.log(userDetails);
					res.send(userDetails);
				}
			}
			catch(exception){
				console.log(exception);
				res.send("fail");
			}
		});
	}
	else{
		res.send("Invalid Session");
	}
	}
	catch(exception){
		console.log(exception);
		res.send("fail");
	}
};


//Get Users for Edit
exports.getEditUsersInfo_Nineteen68 = function(req, res){
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var reuestedUserName = req.body.userName;
		var reuestedUserId = req.body.userId;
		var userDetails = {};
		var getUserRoles = "select username,defaultrole,additionalroles,emailid,firstname,lastname,ldapuser from users where userid="+reuestedUserId+"";
		dbConn.execute(getUserRoles, function (err, result) {
			try{
				if (err) {
					res(null, err);
				}
				else {
					async.forEachSeries(result.rows,function(iterator,callback1){
						try{
							userDetails.userName = iterator.username.toLowerCase(),
							userDetails.roleId = iterator.defaultrole,
							userDetails.additionalroles = iterator.additionalroles,
							userDetails.emailId = iterator.emailid,
							userDetails.firstName = iterator.firstname,
							userDetails.lastName = iterator.lastname,
							userDetails.ldapuser = iterator.ldapuser
						}
						catch(exception){console.log(exception);}
					});
					//console.log(userDetails);
					res.send(userDetails);
				}
			}
			catch(exception){console.log(exception);}
		});		
	}
		else{
		res.send("Invalid Session");
	   }
	}
	catch(exception){console.log(exception);}
};


//CreateUser   
exports.createUser_Nineteen68 = function(req, res) {
    try {
        if (req.cookies['connect.sid'] != undefined) {
            var sessionCookie = req.cookies['connect.sid'].split(".");
            var sessionToken = sessionCookie[0].split(":");
            sessionToken = sessionToken[1];
        }
        if (sessionToken != undefined && req.session.id == sessionToken) {
            var createUserHistory;
            var createUserHistoryTxn; //History Txn Variable for create user in nineteen68
            var createUserHistoryQuery;
            var date;
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

            var getUsername = "SELECT username FROM users";
            dbConn.execute(getUsername, function(err, userNameresult) {
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
                        var userId = uuid();
                        // var createUser = "INSERT INTO users (userid,deactivated,additionalroles,createdby,createdon,defaultrole,emailid,firstname,history,lastname,ldapuser,modifiedby,modifiedon,password,username) VALUES (" + userId + ",null,null,'" + req_username + "'," + new Date().getTime() + "," + req_defaultRole + ",'" + req_email_id + "','" + req_firstname + "',null,'" + req_lastname + "'," + req_ldapuser + ",'" + req_username + "'," + new Date().getTime() + ",'" + req_hashedPassword + "','" + req_username + "')";
                        // dbConn.execute(createUser, function(err, userResult) {
						var inputs = {"query":"createuser", "createdby":req_username,"defaultrole":req_defaultRole, "emailid":req_email_id
						, "firstname":req_firstname, "lastname":req_lastname, "ldapuser":req_ldapuser, "password":req_hashedPassword, 
						"username":req_username}
						var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
						client.post(epurl+"admin/createUser_Nineteen68",args,
								function (result, response) {
                            try {
                                flag = "Success";
                                //Create User History Update
                                createUserHistory = "'userid=" + userId + ", deactivated=null, additionalroles=null, createdby=" + req_username + ", " +
                                    "createdon=" + new Date().getTime() + ", defaultrole=" + req_defaultRole + ", emailid=" + req_email_id + ", " +
                                    "firstname=" + req_firstname + ", lastname=" + req_lastname + ", ldapuser=" + req_ldapuser + ", modifiedby=" + req_username + ", modifiedon=" + new Date().getTime() + ", password=" + req_hashedPassword + ", username= " + req_username + " '";
                                date = new Date().getTime();
                                createUserHistoryQuery = "INSERT INTO users (userid,history) VALUES (" + userId + ",{" + date + ":" + createUserHistory + "})";
                                fnCreateUserHistory(createUserHistoryQuery, function(err, response) {
                                    if (response == 'success') {
                                        res.send(flag);
                                    } else {
                                        flag = "fail";
                                        res.send(flag);
                                    }
                                });
                                //res.send(flag);
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
            })
        } else {
            res.send("Invalid Session");
        }
    } catch (exception) {
        console.log(exception);
        res.send("fail");
    }
};

//create user history
function fnCreateUserHistory(createUserHistoryQuery, createUserHistoryCallback) {

    var statusFlag = "";
    dbConnHistory.execute(createUserHistoryQuery,
        function(createUserHistoryQuery, createUserHistoryQueryRes) {
            if (createUserHistoryQuery) {
                statusFlag = "Error occured in createUserTransactionHistory for screen : Fail";
                createUserHistoryCallback(null, statusFlag);
            } else {
                statusFlag = "success";
                createUserHistoryCallback(null, statusFlag);
            }
        });
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
            var updateUserHistory;
            var updateUserHistoryTxn; //History Txn Variable for create user in nineteen68
            var updateUserHistoryQuery;
            var date;
            var flag = "fail";
            var status = false;
			var userdetails=req.body.userinfo;
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
            date = new Date().getTime();
            if (local_password != "") {
                var salt = bcrypt.genSaltSync(10);
                var req_hashedPassword = bcrypt.hashSync(local_password, salt);
            }
            // var getUserDetails = "select username,password,firstname,lastname,defaultrole,emailid,ldapuser from users where userid=" + local_user_Id;
            // dbConn.execute(getUserDetails, function(err, result) {
			var inputs = {"query":"userdetails","userid":local_user_Id}
			var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
			client.post(epurl+"admin/updateUser_Nineteen68",args,
					function (result, response) {
                try {
                    // if (typeof result === 'undefined') {
					if(response.statusCode != 200 || result.rows == "fail"){	
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
						var inputs = {};
                        if (db_password != "" && db_password != undefined) {
                            // var updateUser = "UPDATE users set username='" + local_username + "', password='" + db_password + "', firstname='" + local_firstname + "', lastname='" + local_lastname + "', modifiedby='" + local_username + "', modifiedon=" + new Date().getTime() + ", emailid='" + local_email_id + "' where userid=" + local_user_Id;

							inputs = {"query":"updateuser",
							"userid":local_user_Id, "additionalroles":local_additionalroles,
							"deactivated" :false,"emailid": local_email_id, "firstname":local_firstname, "lastname":local_lastname,
							"ldapuser":result.rows[0].ldapuser, "modifiedby":userdetails.username.toLowerCase(),"modifiedbyrole":userdetails.role,
							"password":db_password, "username":local_username};

                            updateUserHistory = "'username=" + local_username + ",password=" + db_password + ","
                                "firstname=" + local_firstname + ", lastname=" + local_lastname + ",modifiedby=" + local_username + "," +
                                "modifiedon=" + new Date().getTime() + ",emailid=" + local_email_id + " '";

                            updateUserHistoryTxn = date + ":" + updateUserHistory;
                            updateUserHistoryQuery = "update users set history= history + { " + updateUserHistoryTxn + " }" + " where userid = " + local_user_Id + " ";

                        } else {
                            // var updateUser = "UPDATE users set username='" + local_username + "', password='" + req_hashedPassword + "', firstname='" + local_firstname + "', lastname='" + local_lastname + "', modifiedby='" + local_username + "', modifiedon=" + new Date().getTime() + ", emailid='" + local_email_id + "' where userid=" + local_user_Id;

							inputs = {"query":"updateuser",
							"userid":local_user_Id, "additionalroles":local_additionalroles,
							"deactivated" :false,"emailid": local_email_id, "firstname":local_firstname, "lastname":local_lastname,
							"ldapuser":result.rows[0].ldapuser, "modifiedby":userdetails.username.toLowerCase(),"modifiedbyrole":userdetails.role,
							"password":req_hashedPassword, "username":local_username};

                            updateUserHistory = "'username=" + local_username + ",password=" + db_password + ","
                                "firstname=" + local_firstname + ", lastname=" + local_lastname + ",modifiedby=" + local_username + "," +
                                "modifiedon=" + new Date().getTime() + ",emailid=" + local_email_id + " '";

                            updateUserHistoryTxn = date + ":" + updateUserHistory;
                            updateUserHistoryQuery = "update users set history= history + { " + updateUserHistoryTxn + " }" + " where userid = " + local_user_Id + " ";

                        }
						var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
							
                        // dbConn.execute(updateUser, function(err, result) {
						client.post(epurl+"admin/updateUser_Nineteen68",args,
								function (result, response) {
                            try {
                                // if (typeof result === 'undefined') {
								if(response.statusCode != 200 || result.rows == "fail"){	
                                    var flag = "fail";
                                    res.send(flag);
                                } else {
                                    flag = "success";
                                    fnUpdateUserHistory(updateUserHistoryQuery, function(err, response) {
                                        if (flag == 'success') {
                                            res.send(flag);
                                        } else {
                                            flag = "fail";
                                            res.send(flag);
                                        }
                                    });
                                    //res.send(flag);
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

//Update User History Transaction
function fnUpdateUserHistory(updateUserHistoryQuery, updateUserHistoryCallback) {

    var statusFlag = "";
    dbConnHistory.execute(updateUserHistoryQuery,
        function(updateUserHistoryQuery, updateUserHistoryQueryRes) {
            if (updateUserHistoryQuery) {
                statusFlag = "Error occured in updateUserTransactionHistory for screen : Fail";
                updateUserHistoryCallback(null, statusFlag);
            } else {
                statusFlag = "success";
                updateUserHistoryCallback(null, statusFlag);
            }
        });
};

//Get Domains
exports.getDomains_ICE = function getDomains_ICE(req, res) {
	try {
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var responsedata = [];
		// var domainsQuery = "select domainid,domainname from domains";
		// dbConnICE.execute(domainsQuery, function(error, response) {
			var args = {headers:{"Content-Type" : "application/json"}}
			client.post(epurl+"admin/getDomains_ICE",args,
						function (result, response) {
			try{
				// if (error) {
				if(response.statusCode != 200 || result.rows == "fail"){	
					res.send("fail");
				}else {
					async.forEachSeries(result.rows, function(eachdomain, domainscallback) {
						try {
							var reponseobj = {
									domainId: "",
									domainName: ""
							}
							reponseobj.domainId=eachdomain.domainid;
							reponseobj.domainName=eachdomain.domainname;
							responsedata.push(reponseobj);
							domainscallback();
						} catch (exception) {
							console.log(exception);
						}
					},finalresult);
				}
			}
			catch(exception){console.log(exception);}
		});
		function finalresult(){
			res.send(responsedata);
		}
	}
	else{
		res.send("Invalid Session");
	} 
	}catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

//CheckReleaseNameExists
exports.checkReleaseNameExists_ICE =  function checkReleaseNameExists_ICE(req, res) {
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var releaseName = req.body.releaseName;
		var flag = "fail";
		var status = false;
		if (releaseName != 'undefined' || releaseName != undefined || releaseName != '') {
			var getReleaseInfo = "SELECT releasename FROM releases";
			dbConnICE.execute(getReleaseInfo, function (err, relResponse) {
				try{
					if (typeof relResponse === 'undefined') {
						res.send("fail");
					}
					else {
						for (var i = 0; i < relResponse.rows.length; i++) {
							service = relResponse.rows[i];
							if (releaseName == service.releasename) {
								status = true;
								break;
							}
						}
					}
					if (status == false) {
						flag = "success";
						res.send(flag);
					}
					else {
						flag = "Release Name Exists";
						res.send(flag);
					}
				}
				catch(exception){console.log(exception);}
			});
		}
	}
	else{
		res.send("Invalid Session");
	}
	}
	catch(exception){console.log(exception);}
};

//CheckCycleNameExists
exports.checkCycleNameExists_ICE =  function checkCycleNameExists_ICE(req, res) {
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var cycleName = req.body.cycleName;
		var flag = "fail";
		var status = false;

		if (cycleName != 'undefined' || cycleName != undefined || cycleName != '') {
			var getCycleInfo = "select cyclename from cycles";
			dbConnICE.execute(getCycleInfo, function (err, cycResponse) {
				try{
					if (typeof cycResponse === 'undefined') {
						res.send("fail");
					}
					else {
						for (var i = 0; i < cycResponse.rows.length; i++) {
							service = cycResponse.rows[i];
							if (cycleName == service.cyclename) {
								status = true;
								break;
							}
						}
					}
					if (status == false) {
						flag = "success";
						res.send(flag);
					}
					else {
						flag = "Cycle Name Exists";
						res.send(flag);
					}
				}
				catch(exception){console.log(exception);}
			});
		}
	}
	else{
		res.send("Invalid Session");
	}
	}
	catch(exception){console.log(exception);}
};

exports.createProject_ICE = function createProject_ICE(req, res) {
    try {
        if (req.cookies['connect.sid'] != undefined) {
            var sessionCookie = req.cookies['connect.sid'].split(".");
            var sessionToken = sessionCookie[0].split(":");
            sessionToken = sessionToken[1];
        }
        if (sessionToken != undefined && req.session.id == sessionToken) {
            var createProjectHistory;
            var createProjectHistoryQuery
            var date;
            var createProjectObj = req.body.createProjectObj;
            var userinfo = req.body.userDetails;
            var dateScreen = new Date().getTime();
            var requestedskucode = "skucodetestcase";
            var requestedtags = "tags";
            var requestedversionnumber = 1;
            var projectTypeId = "";
            var newProjectID = "";

            async.series({
                projecttype: function(callback) {
                    try {
                        // var queryGetProjectTypeId = "SELECT projecttypeid from projecttype where projecttypename = '" + createProjectObj.appType + "' ALLOW FILTERING";
                        // dbConnICE.execute(queryGetProjectTypeId, function(err, projectTypeData) {
							var inputs={"query":"projecttype", "projecttype":createProjectObj.appType};
							var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
							client.post(epurl+"admin/createProject_ICE",args,
									function (projectTypeData, response) {
                            try {
                                // if (err) {
								if(response.statusCode != 200 || projectTypeData.rows == "fail"){	
                                } else {
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
                createproject: function(callback) {
                    try {
                        // var requestprojecthistorydetails = "'inserted project action by " + userinfo.username + " having role:" + userinfo.role + "" +
                        //     " skucodetestcase=" + requestedskucode + ", tags=" + requestedtags + ", versionnumber=" + requestedversionnumber +
                        //     " with the project Name " + createProjectObj.projectName + " '";
                        // newProjectID = uuid();
                        // var createProjectQuery = "INSERT INTO projects (domainid,projectname,projectid,createdby,createdon,deleted,history,projecttypeid,skucodeproject,tags) values(" +
                        //     createProjectObj.domainId + ",'" + createProjectObj.projectName + "'," + newProjectID + ",'" + userinfo.username +
                        //     "','" + new Date().getTime() + "'," + false + ",{" + dateScreen + ":" + requestprojecthistorydetails + "}," +
                        //     projectTypeId + ",'" + requestedskucode + "',['" + requestedtags + "']);"
						var inputs={"query":"createproject", "domainid":createProjectObj.domainId,
						"projectname": createProjectObj.projectName, "createdby":userinfo.username.toLowerCase(),"projecttypeid":projectTypeId,
						"skucodeproject" : "skucodeproject", "tags":"tags"};
						var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
						
                        createProjectHistory = "'domainid=" + createProjectObj.domainId + ", projectname=" + createProjectObj.projectName + ", projectid=" + newProjectID + ", createdby=" + userinfo.username.toLowerCase() + ", " +
                            "createdon=" + new Date().getTime() + ", deleted=" + false + ", projecttypeid=" + projectTypeId + ", " +
                            "skucodeproject=" + requestedskucode + ", tags=[" + requestedtags + "] '";
                        date = new Date().getTime();

                        createProjectHistoryQuery = "INSERT INTO projects (projectid,history) VALUES (" + newProjectID + ",{" + date + ":" + createProjectHistory + "})";
                        // dbConnICE.execute(createProjectQuery, function(err, insertProjectData) {
                        //     if (err) {
						newProjectID = "";
						client.post(epurl+"admin/createProject_ICE",args,
									function (insertProjectData, response) {
							if(response.statusCode != 200 || insertProjectData.rows == "fail"){
                                console.log(response.statusCode);
                            } else {
								newProjectID = insertProjectData.rows[0].projectid;
                                fnCreateProjectHistory(createProjectHistoryQuery, function(err, response) {
                                    if (err) {
                                        console.log(err);
                                    } else {

                                        callback();
                                    }
                                });
                            }

                        });
                    } catch (exception) {
                        console.log(exception);
                    }
                },
                createreleases: function(callback) {
                    try {
                        var numberOfReleases = createProjectObj.projectDetails;
                        // console.log(numberOfReleases);
                        var releasesLength = numberOfReleases.length;
                        async.forEachSeries(numberOfReleases, function(eachrelease, numberOfReleasescallback) {
                            try {
                                var createReleaseHistory;
                                var createReleaseHistoryQuery;
                                var date;
                                var releaseDetails = eachrelease;
                                var releaseName = releaseDetails.releaseName;
                                var cycleNames = releaseDetails.cycleNames;
                                var cyclesLength = cycleNames.length;
                                var cycleindex = 0;
                                // cyclesLength=cycleNames.length;
                            //     var requestReleasehistorydetails = "'inserted release action by " + userinfo.username + " having role:" + userinfo.role + "" +
                            //         " skucodetestcase=" + requestedskucode + ", tags=" + requestedtags + ", with the release Name " + releaseName + " '";
                               var newReleaseID = "";
                            //     //console.log("insideRelease", newProjectID);
                            //     var createReleaseQuery = "INSERT INTO releases (projectid,releasename,releaseid,createdby,createdon,deleted,history,skucoderelease,tags) values(" +
                            //         newProjectID + ",'" + releaseName + "'," + newReleaseID + ",'" + userinfo.username + "','" +
                            //         new Date().getTime() + "'," + false + ",{" + dateScreen + ":" + requestReleasehistorydetails + "},'" +
                            //         requestedskucode + "',['" + requestedtags + "']);"
								var inputs={"query":"createrelease", "projectid":newProjectID,
									"releasename": releaseName, "createdby":userinfo.username.toLowerCase(),
									"skucoderelease" : "skucoderelease", "tags":"tags"};
								var args = {data:inputs,headers:{"Content-Type" : "application/json"}};

                                createReleaseHistory = "'projectid=" + newProjectID + ", releasename=" + releaseName + ", releaseid=" + newReleaseID + ", createdby=" + userinfo.username.toLowerCase() + ", " +
                                    "createdon=" + new Date().getTime() + ", deleted=" + false + ", skucoderelease=" + requestedskucode + ", " +
                                    "tags=" + requestedtags + " '";
                                date = new Date().getTime();

                                createReleaseHistoryQuery = "INSERT INTO releases (projectid,releaseid,history) VALUES (" + newProjectID + "," + newReleaseID + ",{" + date + ":" + createReleaseHistory + "})";
								
								client.post(epurl+"admin/createProject_ICE",args,
									function (data, response) {
								if(response.statusCode != 200 || data.rows == "fail"){
                                //History Insert for release name
                                // dbConnICE.execute(createReleaseQuery, function(err, data) {
                                //     if (err) {
                                        // console.log(err);
										 console.log(response.statusCode);
                                    } else {
											newReleaseID  = data.rows[0].releaseid;
											fnCreateReleaseHistory(createReleaseHistoryQuery, function(err, response) {
													if (err) {
														console.log(err);
													} else {
														console.log(response);
													}
											  async.forEachSeries(cycleNames, function(cycleName, cycleNamescallback) {
                                                try {
                                                var createCycleHistory;
                                                var createCycleHistoryQuery
                                                var date;
                                                var eachCycleName = cycleName;
                                                // var requestCyclehistorydetails = "'inserted cycle action by " + userinfo.username + " having role:" + userinfo.role + "" +
                                                //     " skucodetestcase=" + requestedskucode + ", tags=" + requestedtags + ",with the cycle Name " + eachCycleName + " '";
                                                var newCycleID = uuid();
                                                // var getCycleQuery = "INSERT INTO cycles (releaseid,cyclename,cycleid,createdby,createdon,deleted,history,skucodecycle,tags) VALUES (" + newReleaseID + ",'" + eachCycleName + "'," + newCycleID + ",'" + userinfo.username + "','" +
                                                //     new Date().getTime() + "'," + false + ",{" + dateScreen + ":" + requestCyclehistorydetails + "},'" +
                                                //     requestedskucode + "',['" + requestedtags + "']);"

												var inputs={"query":"createcycle", "releaseid":newReleaseID,
													"cyclename": eachCycleName, "createdby":userinfo.username.toLowerCase(),
													"skucodecycle" : "skucodecycle", "tags":"tags"};
												var args = {data:inputs,headers:{"Content-Type" : "application/json"}};

                                                createCycleHistory = "'releaseid=" + newReleaseID + ", cyclename=" + eachCycleName + ", cycleid=" + newCycleID + ", createdby=" + userinfo.username.toLowerCase() + ", " +
                                                    "createdon=" + new Date().getTime() + ", deleted=" + false + ", skucodecycle=" + requestedskucode + ", " +
                                                    "tags=" + requestedtags + " '";
                                                date = new Date().getTime();
                                                createCycleHistoryQuery = "INSERT INTO cycles (releaseid,cycleid,history) VALUES (" + newReleaseID + "," + newCycleID + ",{" + date + ":" + createCycleHistory + "})";
                                                createCycle(args, function(error, response) {
                                                    try {
                                                        if (error) {
                                                            res.send(error);
                                                        } else {
                                                            //
                                                            fnCreateCycleHistory(createCycleHistoryQuery, function(err, response) {
                                                                if (err) {
                                                                    console.log(err);
                                                                } else {
                                                                    console.log(response);
                                                                    if (response == "success")
                                                                        cycleNamescallback();
                                                                }
                                                            });

                                                        }
                                                    } catch (exception) {
                                                        console.log(exception);
                                                    }
                                                });
                                            } catch (exception) {
                                                console.log(exception);
                                            }
                                        }, numberOfReleasescallback);
												});
                                       
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

            }, function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    //console.log(data);
                }
            })
        } else {
            res.send("Invalid Session");
        }
    } catch (exception) {
        console.log(exception);
    }
};

//Create Project History Transaction
function fnCreateProjectHistory(createProjectHistoryQuery, createProjectHistoryCallback) {
    console.log("History", createProjectHistoryQuery);
    var statusFlag = "";
    dbConnICEHistory.execute(createProjectHistoryQuery,
        function(createProjectHistoryQuery, createProjectHistoryQueryRes) {
            if (createProjectHistoryQuery) {
                statusFlag = "Error occured in createProjectTransactionHistory : Fail";
                createProjectHistoryCallback(null, statusFlag);
            } else {
                statusFlag = "success";
                createProjectHistoryCallback(null, statusFlag);
            }
        });
};

//Create Release History Transaction
function fnCreateReleaseHistory(createReleaseHistoryQuery, createReleaseHistoryCallback) {
	console.log(createReleaseHistoryQuery);
    var statusFlag = "";
    dbConnICEHistory.execute(createReleaseHistoryQuery,
        function(createReleaseHistoryQuery, createReleaseHistoryQueryRes) {
            if (createReleaseHistoryQuery) {
                statusFlag = "Error occured in createReleaseTransactionHistory : Fail";
                createReleaseHistoryCallback(null, statusFlag);
            } else {
                statusFlag = "success";
                createReleaseHistoryCallback(null, statusFlag);
            }
        });
};

//Create Cycle History Transaction
function fnCreateCycleHistory(createCycleHistoryQuery, createCycleHistoryCallback) {

    var statusFlag = "";
    dbConnICEHistory.execute(createCycleHistoryQuery,
        function(createCycleHistoryQuery, createCycleHistoryQueryRes) {
            if (createCycleHistoryQuery) {
                statusFlag = "Error occured in createCycleTransactionHistory : Fail";
                createCycleHistoryCallback(null, statusFlag);
            } else {
                statusFlag = "success";
                createCycleHistoryCallback(null, statusFlag);
            }
        });
};

/**
 * generic function for DB to insert project
 * @author vinay.niranjan
 */
function getProjectType(getProjectTypeQuery,getProjectTypeCallback){
	var statusFlag="";
	dbConnICE.execute(getProjectTypeQuery,function(getProjectTypeQueryError, getProjectTypeQueryRes){
		try{
			if(getProjectTypeQueryError){
				statusFlag="Error occured in getProjectType of createProject_ICE: Fail";
				getProjectTypeCallback(statusFlag,null);
			}else{	
				var projectTypeId = getProjectTypeQueryRes.rows[0].projecttypeid;				
				getProjectTypeCallback(null,projectTypeId);
			}			
		}
		catch(exception){console.log(exception);}
	});
};

function createProject(createProjectQuery,createProjectCallback){
	var statusFlag="";
	dbConnICE.execute(createProjectQuery,function(createProjectQuery, createProjectQueryRes){
		try{
			if(createProjectQuery){
				statusFlag="Error occured in createProject_ICE : Fail";
				createProjectCallback(null,statusFlag);
			}else{
				statusFlag = "success";						
				createProjectCallback(null,statusFlag);
			}			
		}
		catch(exception){console.log(exception);}
	});
};

function createRelease(createReleaseQuery,createReleaseCallback){
	var statusFlag="";
	dbConnICE.execute(createReleaseQuery, function(createReleaseerror, createReleaseResponse){
		try{
			if(createReleaseerror){
				statusFlag="Error occured in createRelease of createProject_ICE : Fail";
				createReleaseCallback(statusFlag,null);
			}else{
				statusFlag = "success";						
				createReleaseCallback(null,statusFlag);
			}
		}
		catch(exception){console.log(exception);}
	});
};

function createCycle(args,createCycleCallback){
	var statusFlag="";
	// dbConnICE.execute(createCycleQuery,function(createCycleerror, createCycleresponse){
	client.post(epurl+"admin/createProject_ICE",args,
			function (result, response) {
		try{
			// if(createCycleerror){
			if(response.statusCode != 200 || result.rows == "fail"){	
				statusFlag="Error occured in createCycle of createProject_ICE : Fail";
				createCycleCallback(statusFlag,null);
			}else{
				statusFlag = "success";			
				createCycleCallback(null,statusFlag);
			}			
		}
		catch(exception){console.log(exception);}
	});
};

/**
 * this service is used to create/update/delete projects/releases/cycles 
 * from a particular domain
 */
exports.updateProject_ICE = function updateProject_ICE(req, res){
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var updateProjectDetails=req.body.updateProjectObj;
		// var updateProjectDetails={projectId:"f9409e26-cb50-489b-9527-623ce9f23672"};
		//console.log(JSON.stringify(req.body.updateProjectObj));
		var userinfo = req.body.userDetails;
		var date = new Date().getTime();
		var requestedskucode = "skucode";
		var requestedtags = "tags";
		var flag="";
		var requestedversionnumber = 1;
		var requestedprojectid=updateProjectDetails.projectId;
		async.series({
			newProjectDetails : function(newProjectDetailsCallback){
				var projectDetails=updateProjectDetails.newProjectDetails;
				async.forEachSeries(projectDetails, function(eachprojectDetail, eachprojectDetailcallback) {
					try{
						var releaseCreateStatus=eachprojectDetail.newStatus;
						if(releaseCreateStatus){
							try{  
								var releaseDetails = eachprojectDetail;
								var releaseName = releaseDetails.releaseName;
								var cycleDetails = releaseDetails.cycleDetails;
								var requestReleasehistorydetails = "'inserted release action on Update project service by " + userinfo.username.toLowerCase() + " having role:" + userinfo.role + "" +
								" skucoderelease=" + requestedskucode + ", tags=" + requestedtags + ", with the release Name " + releaseName + " '";
								var newReleaseID = uuid();
								//console.log("insideRelease", newProjectID);
								// var createReleaseQuery = "INSERT INTO releases (projectid,releasename,releaseid,createdby,createdon,deleted,history,skucoderelease,tags) values(" +
								// requestedprojectid + ",'" + releaseName + "'," + newReleaseID + ",'" + userinfo.username + "','" +
								// new Date().getTime() + "'," + false + ",{" + date + ":" + requestReleasehistorydetails + "},'" +
								// requestedskucode + "',['" + requestedtags + "']);"
								// dbConnICE.execute(createReleaseQuery, function(err, data) {
									var inputs={"query":"createrelease", "projectid":requestedprojectid,
									"releasename": releaseName, "createdby":userinfo.username.toLowerCase(),
									"skucoderelease" : "skucoderelease", "tags":"tags"};
									var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
									client.post(epurl+"admin/createProject_ICE",args,
									function (data, response) {
								
									try{    
										// if (err) {
										// 	console.log(err);
										if(response.statusCode != 200 || data.rows == "fail"){
											console.log(response.statusCode);
										} else {
											newReleaseID  = data.rows[0].releaseid;
											async.forEachSeries(cycleDetails, function(eachCycleDetail, cycleNamescallback) {
												try{     
													var eachCycleName = eachCycleDetail.cycleName;
													var requestCyclehistorydetails = "'inserted cycle action by " + userinfo.username.toLowerCase() + " having role:" + userinfo.role + "" +
													" skucodecycle=" + requestedskucode + ", tags=" + requestedtags + ",with the cycle Name " + eachCycleName + " '";
													var newCycleID = uuid();
													// var getCycleQuery = "INSERT INTO cycles (releaseid,cyclename,cycleid,createdby,createdon,deleted,history,skucodecycle,tags) VALUES (" + 
													// newReleaseID + ",'" + eachCycleName + "'," + newCycleID + ",'" + userinfo.username + "','" +
													// new Date().getTime() + "'," + false + ",{" + date + ":" + requestCyclehistorydetails + "},'" +
													// requestedskucode + "',['" + requestedtags + "']);"
													var inputs={"query":"createcycle", "releaseid":newReleaseID,
													"cyclename": eachCycleName, "createdby":userinfo.username.toLowerCase(),
													"skucodecycle" : "skucodecycle", "tags":"tags"};
													var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
													createCycle(args, function(error, response) {
													// createCycle(getCycleQuery, function(error, response) {
														if (error) {
															res.send(error);
														} else {
															try{
																cycleNamescallback();
															}catch(exception){
																console.log(exception);
															}
														}
													});
												}catch(exception){
													console.log(exception);
												}
											},eachprojectDetailcallback);
										}
									}catch(exception){
										console.log(exception);
									}
								});
							}catch(exception){
								console.log(exception);
							}
						}else{
							try{ 
								//this piece of code runs when only cycles needs to be created 
								//in a specified release 
								var releaseDetails = eachprojectDetail;
								var releaseId = releaseDetails.releaseId;
								var cycleDetails = releaseDetails.cycleDetails;
								async.forEachSeries(cycleDetails, function(eachCycleDetail, cycleNamescallback) {
									try{
										var eachCycleName = eachCycleDetail.cycleName;
										var requestCyclehistorydetails = "'inserted cycle action by " + userinfo.username.toLowerCase() + " having role:" + userinfo.role + "" +
										" skucodecycle=" + requestedskucode + ", tags=" + requestedtags + ",with the cycle Name " + eachCycleName + " '";
										var newCycleID = uuid();
										// var getCycleQuery = "INSERT INTO cycles (releaseid,cyclename,cycleid,createdby,createdon,deleted,history,skucodecycle,tags) VALUES (" + 
										// releaseId + ",'" + eachCycleName + "'," + newCycleID + ",'" + userinfo.username + "','" +
										// new Date().getTime() + "'," + false + ",{" + date + ":" + requestCyclehistorydetails + "},'" +
										// requestedskucode + "',['" + requestedtags + "']);"
										// createCycle(getCycleQuery, function(error, response) {
											
										var inputs={"query":"createcycle", "releaseid":releaseId,
										"cyclename": eachCycleName, "createdby":userinfo.username.toLowerCase(),
										"skucodecycle" : "skucodecycle", "tags":"tags"};
										var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
										createCycle(args, function(error, response) {
											if (error) {
												res.send(error);
											} else {
												try{
													cycleNamescallback();
												}catch(exception){
													console.log(exception);
												}
											}
										});
									}catch(exception){
										console.log(exception);
									}   
								},eachprojectDetailcallback);
							}catch(exception){
								console.log(exception);
							}
						}
					}catch(exception){
						console.log(exception)
					}
				},newProjectDetailsCallback);
			},
			deletedProjectDetails: function(deletedProjectDetailsCallback){
				try{
					var projectDetails=updateProjectDetails.deletedProjectDetails;
					async.forEachSeries(projectDetails, function(eachprojectDetail, eachprojectDetailcallback) {
						try{   
							var deleteStatus=eachprojectDetail.deleteStatus;
							if(deleteStatus){
								// var deleteReleaseQuery="delete from releases where releasename='"+eachprojectDetail.releaseName+
								// "' and projectid="+requestedprojectid+" and releaseid="+eachprojectDetail.releaseId;
								// console.log(deleteReleaseQuery);
								// dbConnICE.execute(deleteReleaseQuery, function(deleteReleaseQueryerror, deleteReleaseQueryresponse) {
									var inputs = {"query": "deleterelease","releasename":eachprojectDetail.releaseName,
									"projectid":requestedprojectid,"releaseid":eachprojectDetail.releaseId};
									var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
									client.post(epurl+"admin/updateProject_ICE",args,
												function (result, response) {
									try{
										// if(deleteReleaseQueryerror){
										if(response.statusCode != 200 || result.rows == "fail"){	
											flag="Error in deleteRelease-updateProject_ICE : Fail";
											res.send(flag);
										}else{
											var cyclesOfRelease=eachprojectDetail.cycleDetails;
											async.forEachSeries(cyclesOfRelease, function(eachCycleDetail, eachCycleCallback) {
												try{
													// var deleteCyclesQuery="delete from cycles where cyclename='"+eachCycleDetail.cycleName+
													// "' and releaseid="+eachprojectDetail.releaseId+" and cycleid="+eachCycleDetail.cycleId;
													// dbConnICE.execute(deleteCyclesQuery, function(deleteCyclesQueryerror, deleteCyclesQueryresponse) {
													var inputs = {"query": "deletecycle","cyclename":eachCycleDetail.cycleName,
														"releaseid":eachprojectDetail.releaseId,"cycleid":eachCycleDetail.cycleId};
													var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
													client.post(epurl+"admin/updateProject_ICE",args,
																function (result, response) {
														// if(deleteCyclesQueryerror){
														if(response.statusCode != 200 || result.rows == "fail"){	
															flag="Error in deleteCycles(true)-updateProject_ICE : Fail";
															res.send(flag);
														}else{
															eachCycleCallback();
														}
													});
												}catch(exception){
													console.log(exception);
												}
											},eachprojectDetailcallback);
										}
									}catch(exception){
										console.log(exception);
									}
								});
							}else if(!deleteStatus){
								try{
									var cycleDetails=eachprojectDetail.cycleDetails;
									async.forEachSeries(cycleDetails, function(eachCycleDetail, eachCycleCallback) {
										try{
											var deleteStatusCycles=eachCycleDetail.deleteStatus;
											if(deleteStatusCycles){
												try{
													var cyclesOfRelease=eachCycleDetail.cycleDetails;
													// var deleteCyclesQuery="delete from cycles where cyclename='"+eachCycleDetail.cycleName+
													// "' and releaseid="+eachprojectDetail.releaseId+" and cycleid="+eachCycleDetail.cycleId;
													// dbConnICE.execute(deleteCyclesQuery, function(deleteCyclesQueryerror, deleteCyclesQueryresponse) {
													// 	if(deleteCyclesQueryerror){
													var inputs = {"query": "deletecycle","cyclename":eachCycleDetail.cycleName,
														"releaseid":eachprojectDetail.releaseId,"cycleid":eachCycleDetail.cycleId};
													var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
													client.post(epurl+"admin/updateProject_ICE",args,
																function (result, response) {
														// if(deleteCyclesQueryerror){
														if(response.statusCode != 200 || result.rows == "fail"){
															flag="Error in deleteCycles(false)-updateProject_ICE : Fail";
															res.send(flag);
														}else{
															eachCycleCallback();
														}
													});
												}catch(exception){
													console.log(exception);
												}
											}
										}catch(exception){
											console.log(exception);
										}
									},eachprojectDetailcallback);
								}catch(exception){
									console.log(exception);
								}
							}
						}catch(exception){
							console.log(exception);
						}
					},deletedProjectDetailsCallback);
				}catch(exception){
					console.log(exception);
				}
			},
			editedProjectDetails : function(editedProjectDetailsCallback){
				try{
					var projectDetails=updateProjectDetails.editedProjectDetails;
					async.forEachSeries(projectDetails, function(eachprojectDetail, eachprojectDetailcallback) {
						try{   
							var editedStatus=eachprojectDetail.editStatus;
							if(editedStatus){
								try{
									var newReleaseName=eachprojectDetail.releaseName;
									var releaseId=eachprojectDetail.releaseId;
									var deleteReleaseQuery="delete from releases where releasename='"+eachprojectDetail.oldreleaseName+
									"' and projectid="+requestedprojectid+" and releaseid="+releaseId;
									// console.log(deleteReleaseQuery);
									dbConnICE.execute(deleteReleaseQuery, function(deleteReleaseQueryerror, deleteReleaseQueryresponse) {
										try{
											if(deleteReleaseQueryerror){
												flag="Error in delete-Release(true)-updateProject_ICE : Fail";
												res.send(flag);
											}else{
												try{
													var requestReleasehistorydetails = "'inserted release action on Update project service by " + userinfo.username.toLowerCase() + " having role:" + userinfo.role + "" +
													" skucoderelease=" + requestedskucode + ", tags=" + requestedtags + ", with the release Name " + newReleaseName + " '";
													var createReleaseQuery = "INSERT INTO releases (projectid,releasename,releaseid,createdby,createdon,deleted,history,skucoderelease,tags) values(" +
													requestedprojectid + ",'" + newReleaseName + "'," + releaseId + ",'" + userinfo.username.toLowerCase() + "','" +
													new Date().getTime() + "'," + false + ",{" + date + ":" + requestReleasehistorydetails + "},'" +
													requestedskucode + "',['" + requestedtags + "']);"
													dbConnICE.execute(createReleaseQuery, function(error, response) {
														if(error){
															flag="Error in update-Release(true)-updateProject_ICE : Fail";
															res.send(flag);
														}else{
															try{
																var cycleDetails=eachprojectDetail.cycleDetails;
																var newCycleName="";
																var cycleId="";
																async.forEachSeries(cycleDetails, function(eachCycleDetail, eachCycleCallback) {
																	try{
																		var editedStatusCycles=eachCycleDetail.editStatus;
																		if(editedStatusCycles){
																			try{
																				newCycleName=eachCycleDetail.cycleName;
																				cycleId=eachCycleDetail.cycleId;
																				var deleteCyclesQuery="delete from cycles where cyclename='"+eachCycleDetail.oldCycleName+
																				"' and releaseid="+releaseId+" and cycleid="+cycleId;
																				dbConnICE.execute(deleteCyclesQuery, function(deleteCyclesQueryerror, deleteCyclesQueryresponse) {
																					if(deleteCyclesQueryerror){
																						flag="Error in delete-Cycle(true)-updateProject_ICE : Fail";
																						res.send(flag);
																					}else{
																						try{
																							var requestCyclehistorydetails = "'inserted cycle action by " + userinfo.username.toLowerCase() + " having role:" + userinfo.role + "" +
																							" skucodecycle=" + requestedskucode + ", tags=" + requestedtags + ",with the cycle Name " + newCycleName + " '";
																							// var getCycleQuery = "INSERT INTO cycles (releaseid,cyclename,cycleid,createdby,createdon,deleted,history,skucodecycle,tags) VALUES (" + 
																							// releaseId + ",'" + newCycleName + "'," + cycleId + ",'" + userinfo.username + "','" +
																							// new Date().getTime() + "'," + false + ",{" + date + ":" + requestCyclehistorydetails + "},'" +
																							// requestedskucode + "',['" + requestedtags + "']);"
																							// createCycle(getCycleQuery, function(error, response) {
																							var inputs={"query":"createcycle", "releaseid":releaseId,
																								"cyclename": newCycleName, "createdby":userinfo.username.toLowerCase(),
																								"skucodecycle" : "skucodecycle", "tags":"tags"};
																							var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
																							createCycle(args, function(error, response) {
																								if (error) {
																									res.send(error);
																								} else {
																									eachCycleCallback();
																								}
																							}); 
																						}catch(exception){
																							console.log(exception);
																						}
																					}
																				});
																			}catch(exception){
																				console.log(exception);
																			}
																		}else{
																			eachCycleCallback();
																		}
																	}catch(exception){
																		console.log(exception);
																	}
																},eachprojectDetailcallback);
															}catch(exception){
																console.log(exception);
															}
														}
													});
												}catch(exception){
													console.log(exception);
												}
											}
										}catch(exception){
											console.log(exception);
										}
									});
								}catch(exception){
									console.log(exception);
								}
							}else{
								try{   
									var newReleaseName=eachprojectDetail.releaseName;
									var releaseId=eachprojectDetail.releaseId;
									var cycleDetails=eachprojectDetail.cycleDetails;
									var newCycleName="";
									var cycleId="";
									async.forEachSeries(cycleDetails, function(eachCycleDetail, eachCycleCallback) {
										try{
											var editedStatusCycles=eachCycleDetail.editStatus;
											if(editedStatusCycles){
												try{   
													newCycleName=eachCycleDetail.cycleName;
													cycleId=eachCycleDetail.cycleId;
													var deleteCyclesQuery="delete from cycles where cyclename='"+eachCycleDetail.oldCycleName+
													"' and releaseid="+releaseId+" and cycleid="+cycleId;
													dbConnICE.execute(deleteCyclesQuery, function(deleteCyclesQueryerror, deleteCyclesQueryresponse) {
														if(deleteCyclesQueryerror){
															flag="Error in delete-Cycle(true)-updateProject_ICE : Fail";
															res.send(flag);
														}else{
															try{
																var requestCyclehistorydetails = "'inserted cycle action by " + userinfo.username.toLowerCase() + " having role:" + userinfo.role + "" +
																" skucodecycle=" + requestedskucode + ", tags=" + requestedtags + ",with the cycle Name " + newCycleName + " '";
																// var getCycleQuery = "INSERT INTO cycles (releaseid,cyclename,cycleid,createdby,createdon,deleted,history,skucodecycle,tags) VALUES (" + 
																// releaseId + ",'" + newCycleName + "'," + cycleId + ",'" + userinfo.username + "','" +
																// new Date().getTime() + "'," + false + ",{" + date + ":" + requestCyclehistorydetails + "},'" +
																// requestedskucode + "',['" + requestedtags + "']);"
																// createCycle(getCycleQuery, function(error, response) {
																var inputs={"query":"createcycle", "releaseid":releaseId,
																		"cyclename": newCycleName, "createdby":userinfo.username.toLowerCase(),
																		"skucodecycle" : "skucodecycle", "tags":"tags"};
																var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
																createCycle(args, function(error, response) {
																	if (error) {
																		res.send(error);
																	} else {
																		eachCycleCallback();
																	}
																}); 
															}catch(exception){
																console.log(exception);
															}
														}
													});
												}catch(exception){
													console.log(exception);
												}
											}else{
												eachCycleCallback();
											}
										}catch(exception){
											console.log(exception);
										}
									},eachprojectDetailcallback);
								}catch(exception){
									console.log(exception);
								}
							}
						}catch(exception){
							console.log(exception);
						}
					},editedProjectDetailsCallback);
				}catch(exception){
					console.log(exception);
				}
			}
		}, function(error, response) {
			if (error) {
				console.log("fail");
				res.send("fail");
			} else {
				console.log("success");
				res.send("success");
			}
		});		
	}
	else{
		res.send("Invalid Session");
	}
	}
	catch(exception){
		console.log(exception);
	}
};


/***
 * vishvas.a   
 * service renders the names of all projects in domain/projects
 * cycles
 * date 24.03.2017
 */
exports.getNames_ICE = function(req, res){
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var requestedidslist=req.body.requestedids;
		var idtypes=req.body.idtype;
		var index=0;
		var responsedata={
				requestedids:[],
				respnames:[],
				idtypes:[]
		}
		if(requestedidslist.length == idtypes.length){
			// var queryString="";
			for(var eachid=0; eachid<requestedidslist.length; eachid++){
				if(requestedidslist[eachid] != null && requestedidslist[eachid] != undefined && requestedidslist[eachid].trim() != ''){
					//in this block all projects under the domain is the response.
					if(idtypes[eachid] == 'domainsall'){
						var responsedata={
								projectIds:[],
								projectNames:[]
						}
						// queryString="select projectid,projectname from projects where domainid="+requestedidslist[eachid];

						namesfetcher(requestedidslist[eachid],"domainsall",function(error,response){
							try{
								if(response.length<=0){
									res.send("No Projects");
								}
								else{
									for(var i=0;i<response.length;i++){
										responsedata.projectIds.push(response[i].projectid);
										responsedata.projectNames.push(response[i].projectname);
										if(i==response.length-1){
											//console.log(responsedata);
											res.send(responsedata);
										}
									}
								}	                		
							}
							catch(exception){
								console.log(exception);
							}
						});
					}else if(idtypes[eachid] == 'projects'){
						//in this block project name and project id of the respective id is sent
						// queryString="select projectid,projectname from projects where projectid="+requestedidslist[eachid];
						namesfetcher(requestedidslist[eachid],"projects",function(error,response){
							try{
								responsedata.idtypes.push('projects');
								responsedata.requestedids.push(response[0].projectid);
								responsedata.respnames.push(response[0].projectname);
								if(index == requestedidslist.length){
									res.send(responsedata);
									// console.log(responsedata);
								}	                		
							}
							catch(exception){
								console.log(exception);
							}
						});
					}else if(idtypes[eachid] == 'releases'){
						//in this block release name and release id of the respective id is sent
						// queryString="select releaseid,releasename from releases where releaseid="+requestedidslist[eachid];
						namesfetcher(requestedidslist[eachid],"releases",function(error,response){
							try{
								responsedata.idtypes.push('releases');
								responsedata.requestedids.push(response[0].releaseid);
								responsedata.respnames.push(response[0].releasename);
	
								if(index == requestedidslist.length){
									res.send(responsedata);
									//console.log(responsedata);
								}	                		
							}
							catch(exception){
								console.log(exception);
							}
						});
					}else if(idtypes[eachid] == 'cycles'){
						//in this block cycle name and cycle id of the respective id is sent
						// queryString="select cycleid,cyclename from cycles where cycleid="+requestedidslist[eachid];
						namesfetcher(requestedidslist[eachid],"cycles",function(error,response){
							try{
								responsedata.idtypes.push('cycles');
								responsedata.requestedids.push(response[0].cycleid);
								responsedata.respnames.push(response[0].cyclename);
	
								if(index == requestedidslist.length){
									res.send(responsedata);
									//console.log(responsedata);
								}	                		
							}
							catch(exception){
								console.log(exception);
							}
						});
					}else{
						res.send("fail");
						break;
					}
				}else{
					console.log("Invalid Input")
				}
			}
		}else{
			res.send("fail");
		}

		function namesfetcher(id,query,namesfetchercallback){
			// dbConnICE.execute(queryString, function(queryStringerr, queryStringresult){
			// 	try{
			// 		if(queryStringerr){
			var inputs = {"id" :id, "query" : query}
			var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
			client.post(epurl+"admin/getNames_ICE",args,
						function (queryStringresult, response) {
				try{
					if(response.statusCode != 200 || queryStringresult.rows == "fail"){
						statusFlag="Error occured in namesfetcher : Fail";
						namesfetchercallback(statusFlag,null);
					}else{
						index=index+1;
						namesfetchercallback(null,queryStringresult.rows);
					}	        		
				}
				catch(exception){
					console.log(exception);
				}
			});
		}		
	}
	else{
		res.send("Invalid Session");
	}
	}
	catch(exception){
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
exports.getDetails_ICE = function(req, res) {
	try {
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var requestedidslist = req.body.requestedids;
		var idtypes = req.body.idtype;
		var responsedata = {};
		var requestedid;
		var eachProjectDetail = {};
		var index = 0;
		if (requestedidslist.length == idtypes.length) {
			try {
				var queryString = "";
				for (var eachid = 0; eachid < requestedidslist.length; eachid++) {
					requestedid = requestedidslist[eachid];
					//here the data gets sent at once
					if (idtypes[eachid] == 'domaindetails') {
						try {
							var responsedatadomains = {
									projectIds: [],
									projectNames: []
							}
							// queryString = "select projectid,projectname from projects where domainid=" + requestedid;
							queryExecutor(requestedid,"domaindetails","subquery", function(error, response) {
								if (error) {
									try {
										res.send("Error in getDetails_ICE_domaindetails : Fail");
									} catch (exception) {
										console.log(exception);
									}
								} else {
									try{
										if(response.length == 0){
											res.send(responsedatadomains);
										}else{
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
							}
							// var queryForProjectTypeId = "select projecttypeid,projectname from projects where projectid=" + requestedid;

							queryExecutor(requestedid,"projectsdetails","projecttypeid", 
										function(queryForProjectTypeIderror, queryForProjectTypeIdresponse) {
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
											// var queryForProjectType = "select projecttypename from projecttype where projecttypeid=" + queryForProjectTypeIdresponse[i].projecttypeid;
											queryExecutor(queryForProjectTypeIdresponse[i].projecttypeid,"projectsdetails","projecttypename", 
													function(queryForProjectTypeerror, queryForProjectTyperesponse) {
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
															// var queryGetReleases = "select releaseid,releasename from releases where projectid=" + requestedid;
															queryExecutor(requestedid,"projectsdetails","releasedetails", 
																	 function(queryGetReleaseserror, queryGetReleasesresponse) {
																if (queryGetReleaseserror) {
																	try {
																		res.send(queryGetReleasesQueryerror);
																	} catch (exception) {
																		console.log(exception);
																	}
																} else {
																	var releaseindex = 0;
																	async.forEachSeries(queryGetReleasesresponse,
																			function(eachRelease, releasecallback) {
																		try {
																			eachProjectDetail = {};
																			// var queryGetCycles = "select cycleid,cyclename from cycles where releaseid=" + eachRelease.releaseid;
																			queryExecutor(eachRelease.releaseid,"projectsdetails","cycledetails",  
																					function(queryGetCycleserror, queryGetCyclesresponse) {
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
																									function(eachCycle, cyclecallback) {
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
					}else if (idtypes[eachid] == 'cycledetails') {
						responsedata = {
								testsuiteIds: [],
								testsuiteNames: []
						}
						//queryString = "select testsuiteid,testsuitename from testsuites where cycleid=" + requestedid;
						queryExecutor(requestedid,"cycledetails","subquery",
									function(error, response) {
							if (error) {
								try {
									res.send("Error in getDetails_ICE_cycledetails : Fail");
								} catch (exception) {
									console.log(exception);
								}
							} else {
								async.forEachSeries(response,function(eachtestSuiteDetails,testsuiteCallback){
									try{
										responsedata.testsuiteIds.push(eachtestSuiteDetails.testsuiteid);
										responsedata.testsuiteNames.push(eachtestSuiteDetails.testsuitename);
										testsuiteCallback();                            			
									}
									catch (exception) {
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

		function queryExecutor(id,query,subquery, queryExecutorcallback) {
			// console.log(queryString);
			
			var inputs = {"id" :id, "query" : query, "subquery":subquery}
			var args = {data:inputs,headers:{"Content-Type" : "application/json"}}	
			// dbConnICE.execute(queryString,function(queryStringerr, queryStringresult) {
			client.post(epurl+"admin/getDetails_ICE",args,
				function (queryStringresult, response) {
				try{
					// if (queryStringerr) {
					if(response.statusCode != 200 || queryStringresult.rows == "fail"){
						statusFlag = "Error occured in queryExecutor : Fail";
						queryExecutorcallback(statusFlag, null);
					} else {
						index = index + 1;
						queryExecutorcallback(null, queryStringresult.rows);
					}
				}
				catch (exception) {
					console.log(exception);
				}
			});
		}

		function finalDataReturn() {
			//console.log(JSON.stringify(responsedata));
			try {
				res.send(responsedata);
			} catch (exception) {
				console.log(exception);
			}
		}
	}
	else{
		res.send("Invalid Session");
	}
}
 
	catch (exception) {
		console.log(exception);
	}
};

//Save Assigned Projects
exports.assignProjects_ICE = function(req, res) {
    try {
        if (req.cookies['connect.sid'] != undefined) {
            var sessionCookie = req.cookies['connect.sid'].split(".");
            var sessionToken = sessionCookie[0].split(":");
            sessionToken = sessionToken[1];
        }
        if (sessionToken != undefined && req.session.id == sessionToken) {
            var assignProjectsHistory;
            var assignProjectsHistoryTxn; //History Txn Variable for create user in nineteen68
            var assignProjectsHistoryQuery;
            var date;
            var assignProjectsDetails = req.body.assignProjectsObj;
            var projectDetails = assignProjectsDetails.assignedProjects;
            var projectIds = [];
			var alreadyassigned=false;
            for (var i = 0; i < projectDetails.length; i++) {
                projectIds.push(projectDetails[i].projectId);
            }
			var inputs={};
            if(assignProjectsDetails.getAssignedProjectsLen > 0)
			{
				// var assignProjectsToUsers = "UPDATE icepermissions set modifiedby='" + assignProjectsDetails.userInfo.username + "', modifiedon=" + new Date().getTime() + ",modifiedbyrole='" + assignProjectsDetails.userInfo.role + "', projectids=[" + projectIds + "] where userid=" + assignProjectsDetails.userId;
				alreadyassigned=true;
				inputs = {"alreadyassigned":alreadyassigned, "userid":assignProjectsDetails.userId,"domainid":assignProjectsDetails.domainId,
				"modifiedbyrole":assignProjectsDetails.userInfo.role,"modifiedby":assignProjectsDetails.userInfo.username.toLowerCase(),
				"projectids":projectIds}
			}
			else{
				//    var assignProjectsToUsers = "INSERT INTO icepermissions (userid,domainid,createdby,createdon,history,projectids) VALUES (" + assignProjectsDetails.userId + "," + assignProjectsDetails.domainId + ",'" + assignProjectsDetails.userInfo.username + "','" + new Date().getTime() + "',null,[" + projectIds + "]);"
				inputs = {"alreadyassigned":alreadyassigned, "userid":assignProjectsDetails.userId,"domainid":assignProjectsDetails.domainId,
				"createdby":assignProjectsDetails.userInfo.username.toLowerCase(),
				"projectids":projectIds}
			}
            assignProjectsHistory = "'userid=" + assignProjectsDetails.userId + ", domainid=" + assignProjectsDetails.domainId + ", createdby=" + assignProjectsDetails.userInfo.username.toLowerCase() + ", createdon=" + new Date().getTime() + ", " +
                "modifiedby=" + assignProjectsDetails.userInfo.username.toLowerCase() + ", modifiedbyrole=" + assignProjectsDetails.userInfo.role + ", modifiedon=" + new Date().getTime() + ", " +
                "projectids=[" + projectIds + "] '";
            date = new Date().getTime();
            assignProjectsHistoryQuery = "INSERT INTO icepermissions (userid,history) VALUES (" + userId + ",{" + date + ":" + assignProjectsHistory + "})";

			var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
			client.post(epurl+"admin/assignProjects_ICE",args,
			function (result, response) {
				if(response.statusCode != 200 || result.rows == "fail"){	
            // dbConnICE.execute(assignProjectsToUsers, function(err, result) {
            //     if (err) {

                    res.send("fail");
                } else {
                    fnAssignProjectsHistory(assignProjectsHistoryQuery, function(err, response) {
                        console.log("response", response);
                        if (response == 'success') {
                            res.send(response);
                        } else {
                            flag = "fail";
                            res.send(flag);
                        }
                    });
                    // res.send('success');
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

//Assign Projects History Transaction
function fnAssignProjectsHistory(assignProjectsHistoryQuery, assignProjectsHistoryCallback) {
    console.log("History", assignProjectsHistoryQuery);
    var statusFlag = "";
    dbConnICEHistory.execute(assignProjectsHistoryQuery,
        function(assignProjectsHistoryQuery, assignProjectsHistoryQueryRes) {
            if (assignProjectsHistoryQuery) {
                statusFlag = "Error occured in assignProjectsHistory for screen : Fail";
                assignProjectsHistoryCallback(null, statusFlag);
            } else {
                statusFlag = "success";
                assignProjectsHistoryCallback(null, statusFlag);
            }
        });
};

//get Assigned Projects
exports.getAssignedProjects_ICE = function(req, res){
	try{
		
if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var requestDetails = req.body.getAssignProj;
		var assignedProjectIds =[];
		var assignedProjObj = [];
		// var getAssignedProjects = "Select projectids from icepermissions where userid = "+requestDetails.userId+" and domainid = "+requestDetails.domainId+"";
		//console.log(getAssignedProjects);
		// dbConnICE.execute(getAssignedProjects, function (err, result) {
			var inputs = { "query":"projectid","domainid":requestDetails.domainId,"userid":requestDetails.userId}
			var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
			client.post(epurl+"admin/getAssignedProjects_ICE",args,
					function (result, response) {
			try{
				// if (err) {
				if(response.statusCode != 200 || result.rows == "fail"){	
					// console.log("Error::::",err);
					res.send("fail");
				}
				else {
					for(var i=0;i<result.rows.length;i++)
					{
						assignedProjectIds = result.rows[i].projectids;
					}
					async.forEachSeries(assignedProjectIds,function(iterator,assignProjectCallback){
						try{
							// var getProjectNames = "Select projectname from projects where projectid = "+iterator+"";
							// dbConnICE.execute(getProjectNames, function (err, result) {
							var inputs = {"query":"projectname","projectid":iterator}
							var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
							client.post(epurl+"admin/getAssignedProjects_ICE",args,
									function (result, response) {
								try{
									// if (err) {
									if(response.statusCode != 200 || result.rows == "fail"){
										// console.log("Error::::",err);
										res.send("fail");
									}
									else{
										//console.log(result);
										if(result.rows.length > 0){
											var assignedProjects = {};
											assignedProjects.projectId = iterator;
											assignedProjects.projectName = result.rows[0].projectname;
											assignedProjObj.push(assignedProjects);
										}
										assignProjectCallback();
									}									
								}
								catch (exception) {
									console.log(exception);
									res.send("fail");
								}
							});							
						}
						catch (exception) {
							console.log(exception);
							res.send("fail");
						}
					},finalfunction);

				}
				function finalfunction(){
					res.send(assignedProjObj);
				}
			}
			catch (exception) {
				console.log(exception);
				res.send("fail");
			}
		});
	}else{
		res.send("Invalid Session");
	}
}
	catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};
