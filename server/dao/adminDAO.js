/**
* Dependencies.
*/
var Joi = require('joi');
var dbConn = require('../../server/config/cassandra');
var cassandra = require('cassandra-driver');
var cb = require('callback');
var passwordHash = require('password-hash');
var uuid = require('uuid-random');

var roles = [];
var r_ids = [];
var userRoles = {};

//DAO Callbacks to Hapi controllers
module.exports = {
    getUserRoles_Nineteen68: function getUserRoles_Nineteen68(req, cb, data) {
        var getUserRoles = "select roleid, rolename from roles";
        dbConn.execute(getUserRoles, function (err, result) {
            if (err) {
                cb(null, err);
            }
            else {
                for (var i = 0; i < result.rows.length; i++) {
                    roles[i] = result.rows[i].rolename;
                    r_ids[i] = result.rows[i].roleid;
                }
                userRoles.userRoles = roles;
                userRoles.r_ids = r_ids;
                cb(null, userRoles);
            }
        });
    },
    createUser_Nineteen68: function createUser_Nineteen68(req,cb,data) {
        var flag = "fail";
        var status = false;
        var req_username = req.payload.username;
        var req_password = req.payload.password;
        var req_firstname = req.payload.firstName;
        var req_lastname =  req.payload.lastName;
        var req_ldapuser = req.payload.ldapUser;
        var req_defaultRole = req.payload.role;
        var req_email_id = req.payload.email;
        var req_hashedPassword = passwordHash.generate(req_password);
        
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
             var createUser = "INSERT INTO users (userid,deactivated,additionalroles,createdby,createdon,defaultrole,emailid,firstname,history,lastname,ldapuser,modifiedby,modifiedon,password,username) VALUES ("+uuid()+",null,null,'"+req_username+"',"+new Date().getTime()+","+req_defaultRole+",'"+req_email_id+"','"+req_firstname+"',null,'"+req_lastname+"',null,'"+req_username+"',"+new Date().getTime()+",'"+req_hashedPassword+"','"+req_username+"')";
                dbConn.execute(createUser, function (err, userResult) {
                flag = "success";
                cb(null, flag);
                })
            }
            else
            {
               flag = "User Exists";
               console.log(flag);
               cb(null, flag);
            }
        })        
        }
};



