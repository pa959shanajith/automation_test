/**
* Dependencies.
*/
var Joi = require('joi');
var dbConn = require('../../server/config/cassandra');
var cassandra = require('cassandra-driver');
var cb = require('callback');
var passwordHash = require('password-hash');

var roles = [];
var userRoles = {};

//DAO Callbacks to Hapi controllers
module.exports = {
  authenticateUser_Nineteen68: function authenticateUser_Nineteen68(req, cb, data) {
     console.log("Inside Authenticate User");
     username = req.payload.username;
     password = req.payload.password;
     
     var authUser = "select password from users where username = '"+username+"' allow filtering";
     dbConn.execute(authUser, function (err, result) {
      if (result.rows.length == 0)
      {
            flag = 'inValidCredential';
            cb(null, flag);
      }
      else{
          
            for (var i = 0; i < result.rows.length; i++) {
                  dbHashedPassword = result.rows[i].password;
            }
            var validUser = passwordHash.verify(password,dbHashedPassword)
            if(validUser == true)
            {
               flag = 'validCredential';
               cb(null, flag);
            }
            else{
              flag = 'inValidCredential';
              cb(null, flag);
            }  
      }

      });
    },
    loadUserInfo_Nineteen68: function loadUserInfo_Nineteen68(req, cb, data) {
      userName = req.payload.username;
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
            //console.log(jsonService);
            //AlljsonServices.push(jsonService);
            cb (null, jsonService);
      }
    })
    },
    getRoleNameByRoleId_Nineteen68: function getRoleNameByRoleId_Nineteen68(req, cb, data) {
           var roleId= req.payload.role;
           var getRoleInfo = "select rolename from roles where roleid = "+roleId+" allow filtering";
          dbConn.execute(getRoleInfo, function (err, rolesResult) {
              if (rolesResult.rows.length == 0)
              {
                flag = "No Records Found"
                cb(null, flag);
              }
              else{
               for (var i = 0; i < rolesResult.rows.length; i++) {
                  role = rolesResult.rows[i].rolename;
                }
                cb(null, role);
              }
          });
    }
};



