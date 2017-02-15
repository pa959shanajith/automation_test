/**
* Dependencies.
*/
var Joi = require('joi');
var client_cas = require('../../server/config/cassandra');
var dbConn = require('../../server/config/cassandra');
var cassandra = require('cassandra-driver');
var passwordHash = require('password-hash');

//Global Variables
var roles = [];
var userRoles = {};


// Authenticate User - Nineteen68
exports.authenticateUser_Nineteen68 = function(req, res){
     console.log("Inside Authenticate User");
     username = req.body.username;
     password = req.body.password;
     var authUser = "select password from users where username = '"+username+"' allow filtering";
     dbConn.execute(authUser, function (err, result) {
      if(err) console.log(err);
      if (result.rows.length == 0)
      {
            flag = 'inValidCredential';
            res.send(flag);
      }
      else{
          
            for (var i = 0; i < result.rows.length; i++) {
                  dbHashedPassword = result.rows[i].password;
            }
            var validUser = passwordHash.verify(password,dbHashedPassword)
            if(validUser == true)
            {
               flag = 'validCredential';
               res.send(flag);
            }
            else{
              flag = 'inValidCredential';
               res.send(flag);
            }  
      }

      });
};

//Load User Information - Nineteen68
exports.loadUserInfo_Nineteen68 = function(req, res){
 userName = req.body.username;
      var getUserInfo = "select userid, emailid, firstname, lastname, defaultrole, additionalroles, username from users where username = '"+userName+"' allow filtering";
      dbConn.execute(getUserInfo, function (err, userResult) {
      if (userResult.rows.length == 0)
      {
          var flag = "No Records Found"
          cb(null, flag);
      }
      else
      {
              AlljsonServices = [];
              service = userResult.rows[0];
              userId = service.userid;

              jsonService = {
              user_id : userId,
              email_id : service.emailid,
              firstname :service.firstname,
              lastname : service.lastname,
              role: service.defaultrole,
              username:service.username
       }
             res.send(jsonService);
      }
    })
};

//Get UserRoles By RoleId - Nineteen68
 exports.getRoleNameByRoleId_Nineteen68 = function(req, res){
              var roleId= req.body.role;
              var getRoleInfo = "select rolename from roles where roleid = "+roleId+" allow filtering";
              dbConn.execute(getRoleInfo, function (err, rolesResult) {
              if (rolesResult.rows.length == 0)
              {
                flag = "No Records Found"
                res.send(flag);
              }
              else{
               for (var i = 0; i < rolesResult.rows.length; i++) {
                  role = rolesResult.rows[i].rolename;
                }
                 res.send(role);
              }
          });
};
