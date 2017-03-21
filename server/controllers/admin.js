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

var roles = [];
var r_ids = [];
var userRoles = {};

//GetUserRoles
exports.getUserRoles_Nineteen68 = function(req, res){
	var getUserRoles = "select roleid, rolename from roles";
	dbConn.execute(getUserRoles, function (err, result) {
		if (err) {
			res.send(err);
		}
		else {
			for (var i = 0; i < result.rows.length; i++) {
				roles[i] = result.rows[i].rolename;
				r_ids[i] = result.rows[i].roleid;
			}
			userRoles.userRoles = roles;
			userRoles.r_ids = r_ids;
			res.send(userRoles);
		}
	});
};


//GetUsers
exports.getUsers_Nineteen68 = function(req, res){
	var roles = [];
	var r_ids = [];
	var userRoles = {userRoles:[],r_ids:[]};
	var getUserRoles = "select userid, username from nineteen68.users ";
	dbConn.execute(getUserRoles, function (err, result) {
		if (err) {
			res(null, err);
		}
		else {
			async.forEachSeries(result.rows,function(iterator,callback1){
				roles.push(iterator.username);
				r_ids.push(iterator.userid);
				callback1();
			});
			userRoles.userRoles = roles;
			userRoles.r_ids = r_ids;
			//console.log(userRoles);
			res(null,userRoles);
		}
	});
};

//Get All Users
exports.getAllUsers_Nineteen68 = function(req, res){
	var user_names = [];
	var userIds = [];
	var userDetails = {user_names:[], userIds : []};
	var getUserRoles = "select userid, username from nineteen68.users ";
	dbConn.execute(getUserRoles, function (err, result) {
		if (err) {
			res(null, err);
		}
		else {
			async.forEachSeries(result.rows,function(iterator,callback1){
				user_names.push(iterator.username);
				userIds.push(iterator.userid);
				callback1();
			});
			userDetails.userIds = userIds;
			userDetails.user_names = user_names;
			//console.log(userDetails);
			res.send(userDetails);
		}
	});
};


//Get Users for Edit
exports.getEditUsersInfo_Nineteen68 = function(req, res){
	var reuestedUserName = req.body.userName;
	var reuestedUserId = req.body.userId;
	var userDetails = {};
	var getUserRoles = "select username,defaultrole,emailid,firstname,lastname from users where userid="+reuestedUserId+"";
	dbConn.execute(getUserRoles, function (err, result) {
		if (err) {
			res(null, err);
		}
		else {
			async.forEachSeries(result.rows,function(iterator,callback1){
				userDetails.userName = iterator.username,
				userDetails.roleId = iterator.defaultrole,
				userDetails.emailId = iterator.emailid,
				userDetails.firstName = iterator.firstname,
				userDetails.lastName = iterator.lastname
			});
			//console.log(userDetails);
			res.send(userDetails);
		}
	});
};


//CreateUser   
exports.createUser_Nineteen68 = function(req, res){
	var flag = "fail";
	var status = false;
	var req_username = req.body.createUser.username;
	var req_password = req.body.createUser.password;
	var req_firstname = req.body.createUser.firstName;
	var req_lastname =  req.body.createUser.lastName;
	var req_ldapuser = req.body.createUser.ldapUser;
	var req_defaultRole = req.body.createUser.role;
	var req_email_id = req.body.createUser.email;
	var salt = bcrypt.genSaltSync(10);
	var req_hashedPassword = bcrypt.hashSync(req_password, salt);

	var getUsername = "SELECT username FROM users";
	dbConn.execute(getUsername, function (err, userNameresult) {
		for (var i = 0; i < userNameresult.rows.length; i++) {
			dbResult = userNameresult.rows[i];
			if(req_username === dbResult.username)
			{
				status = true;
				break;
			}
		}
		if(status === false){
			var createUser = "INSERT INTO users (userid,deactivated,additionalroles,createdby,createdon,defaultrole,emailid,firstname,history,lastname,ldapuser,modifiedby,modifiedon,password,username) VALUES ("+uuid()+",null,null,'"+req_username+"',"+ new Date().getTime()+","+req_defaultRole+",'"+req_email_id+"','"+req_firstname+"',null,'"+req_lastname+"',null,'"+req_username+"',"+new Date().getTime()+",'"+req_hashedPassword+"','"+req_username+"')";
			dbConn.execute(createUser, function (err, userResult) {
				flag = "Success";
				res.send(flag);
			})
		}
		else
		{
			flag = "User Exists";
			res.send(flag);
		}
	})        
};


//Edit User
exports.updateUser_nineteen68 = function updateUser_nineteen68(req, res) {
	var flag = "fail";
	var status = false;
	var userObj = req.body.updateUserObj;
	var local_username = userObj.userName;
	var local_password = userObj.passWord;
	var local_firstname = userObj.firstName;
	var local_lastname = userObj.lastName;
	var local_role = userObj.role;
	var local_email_id = userObj.email;
	var local_user_Id = userObj.userId;

	if(local_password != "")
	{
		var salt = bcrypt.genSaltSync(10);
	    var req_hashedPassword = bcrypt.hashSync(local_password, salt);
	}
	
	var getUserDetails = "select username,password,firstname,lastname,defaultrole,emailid from users where userid="+local_user_Id;
	console.log(getUserDetails);
	dbConn.execute(getUserDetails, function (err, result) {
		if (typeof result === 'undefined') {
			var flag = "fail";
			res.send(flag); 
		}
		else {
			service = result.rows[0];
			if(local_username == undefined || local_username == 'undefined' || local_username == ''){
				local_username = service.username;
			}
			if(local_password.trim().length == 0) {
				local_password = service.password;
			}
			else{
				var salt = bcrypt.genSaltSync(10);
	            var req_hashedPassword = bcrypt.hashSync(local_password, salt);
			}
			if(local_firstname == undefined || local_firstname == 'undefined' || local_firstname == ''){
				local_firstname = service.firstname;
			}
			if(local_lastname == undefined || local_lastname == 'undefined' || local_lastname == ''){
				local_lastname = service.lastname;
			}
			if(local_role == undefined || local_role == 'undefined' || local_role == ''){
				local_role = service.role;
			}
			if(local_email_id == undefined || local_email_id == 'undefined' || local_email_id == ''){
				local_email_id = service.email_id;
			}

			var updateUser = "UPDATE users set username='"+local_username+"', password='"+local_password+"', firstname='"+local_firstname+"', lastname='"+local_lastname+"', modifiedby='"+local_username+"', modifiedon="+new Date().getTime()+", defaultrole="+local_role+", emailid='"+local_email_id+"' where userid="+local_user_Id;
			console.log(updateUser);
			dbConn.execute(updateUser, function (err, result) {
				if (typeof result === 'undefined') {
					var flag = "fail";
					res.send(flag); 
				}
				else {
					flag = "success";
					res.send(flag); 
				}
			});
		}
	}); 
};