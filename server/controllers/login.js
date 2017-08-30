/**
* Dependencies.
*/
var Joi = require('joi');
var client_cas = require('../../server/config/cassandra');
var dbConn = require('../../server/config/cassandra');
var cassandra = require('cassandra-driver');
var dbConnICE = require('../../server/config/icetestautomation');
var bcrypt = require('bcrypt');
var async = require('async');
var epurl="http://127.0.0.1:1990/";
var Client = require("node-rest-client").Client;
var myserver = require('../../server.js');
var client = new Client();

//Global Variables
var roles = [];
var userRoles = {};

//Authenticate User - Nineteen68
exports.authenticateUser_Nineteen68 = function(req, res){
      // console.log("session value ",myserver.sessionCreated.length);
      // myserver.sessionCreated.push("name")
      try{
              
            console.log("Inside Authenticate User");
            var username = req.body.username.toLowerCase();
            var password = req.body.password;
            var session = req.session;
            var sessId = req.session.id;
            req.session.username = username;
            req.session.uniqueId = sessId;
            console.log(myserver.sessionCreated);
            if(myserver.sessionCreated.indexOf(username) >= 1){
                  return res.send("userLogged");
            }
            var flag= 'inValidCredential';
                     var assignedProjects = false;
                     var validUser = false;
                     var inputs = {"username":req.session.username};
                     var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
                     // var authUser = "select password from users where username = '"+ req.session.username+"' allow filtering;"
                     checkldapuser(req,function(err,data){
                           if(data){
                                  ldapCheck(req,function(err,ldapdata){
                                         if(ldapdata == 'pass'){
                                                flag = 'validCredential';
                                                res.setHeader('Set-Cookie', sessId);
                                                res.send(flag);
                                         }else{
                                                res.send(flag);
                                         }
                                  });
                           }else{
                                  // dbConn.execute(authUser, function (err, result) {
                                  client.post(epurl+"login/authenticateUser_Nineteen68",args,
                                         function (result, response) {
                                  if(response.statusCode != 200 || result.rows == "fail"){
                                  // if(err) {
                                         console.log("Error occured in authenticateUser_Nineteen68 : Fail");
                                         res.send("fail");
                                  }else{
                                         try{
                                                if (result.rows.length == 0){
                                                       res.send(flag);
                                                }else{
                                                       for (var i = 0; i < result.rows.length; i++) {
                                                              dbHashedPassword = result.rows[i].password;
                                                       }
                                                       validUser = bcrypt.compareSync(password, dbHashedPassword); // true
                                                       //Check whether projects are assigned for a user
                                                       checkAssignedProjects(req,function(err,assignedProjectsData,role){
                                                                     if(role != "Admin" && role != "Business Analyst" && role != "Tech Lead")
                                                                     {
                                                                                  if(assignedProjectsData > 0 )
                                                                                  {
                                                                                         assignedProjects = true;
                                                                                  }
                                                                                  if(validUser == true && assignedProjects == true){
                                                                                         flag = 'validCredential';                                                                                 
                                                                                         myserver.sessionCreated.push(username)
                                                                                         console.log("session value ",myserver.sessionCreated);
                                                                                         res.setHeader('Set-Cookie', sessId);
                                                                                         console.log();
                                                                                         res.send(flag);
                                                                                         
                                                                                  }
                                                                                  else if(validUser == true && assignedProjects == false)
                                                                                  {
                                                                                         flag = 'noProjectsAssigned';
                                                                                         res.send(flag);
                                                                                  }
                                                                                  else{
                                                                                         res.send(flag);
                                                                                         console.log("session value ",myserver.sessionCreated);
                                                                                         myserver.sessionCreated.push(username)
                                                                                  }  
                                                                     }
                                                                     else{
                                                                           if(validUser == true){
                                                                                         flag = 'validCredential';
                                                                                         myserver.sessionCreated.push(username)
                                                                                         console.log("session value ",myserver.sessionCreated.length);
                                                                                         res.setHeader('Set-Cookie', sessId);
                                                                                         res.send(flag);
                                                                                  }
                                                                           else{
                                                                                         res.send(flag);
                                                                              }  
                                                                     }
                                                                     
                                                       });
                                                }
                                         }catch(exception){
                                                console.log(exception);
                                                res.send("fail");
                                         }
                                  }
                                  });
                           }
                     });
                           
              }catch(exception){
                           console.log(exception);
                           res.send("fail");
              }
};


/** 
 * @see : function to authenticate users from jenkins
* @author : vinay 
*/
exports.authenticateUser_Nineteen68_CI = function(req, res){
      try{
              
            console.log("Inside Authenticate User");
            var username = req.body.username.toLowerCase();
            var password = req.body.password;
            var session = req.session;
            var sessId = req.session.id;
            req.session.username = username;
            req.session.uniqueId = sessId;
            var flag= 'inValidCredential';
                     
                     var inputs = {"username":req.session.username};
                     var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
                     // var authUser = "select password from users where username = '"+ req.session.username+"' allow filtering;"
            //console.log(req);
                     checkldapuser(req,function(err,data){
                           if(data){
                                  ldapCheck(req,function(err,ldapdata){
                                         if(ldapdata == 'pass'){
                                                flag = 'validCredential';
                                                status ={"status":flag,"session_id":sessId};
                                                res.setHeader('set-cookie', sessId);
                                                res.writeHead(200,{'Content-Type': 'text/plain'});
                                                res.write("status : "+flag+" , session_id : "+sessId);
                                                res.end();
                                         }else{
                                                res.setHeader('set-cookie', sessId);
                                                res.writeHead(401,{'Content-Type': 'text/plain'});
                                                res.write("status : "+flag+" , session_id : "+"");
                                                res.end();
                                         }
                                  });
                           }else{
                                  // dbConn.execute(authUser, function (err, result) {
                                  // if(err) {
                                  client.post(epurl+"login/authenticateUser_Nineteen68",args,
                                         function (result, response) {
                                  if(response.statusCode != 200 || result.rows == "fail"){
                                         console.log("Error occured in authenticateUser_Nineteen68 : Fail");
                                         res.setHeader('set-cookie', sessId);
                                         res.writeHead(500,{'Content-Type': 'text/plain'});
                                         res.write("status : fail , session_id : ");
                                         res.end();
                                  }else{
                                         try{
                                                if (result.rows.length == 0){
                                                       res.setHeader('set-cookie', sessId);
                                                       res.writeHead(401,{'Content-Type': 'text/plain'});
                                                       res.write("status : "+flag+" , session_id : "+"");
                                                       res.end();
                                                }else{
                                                       for (var i = 0; i < result.rows.length; i++) {
                                                              dbHashedPassword = result.rows[i].password;
                                                       }
                                                       var validUser = bcrypt.compareSync(password, dbHashedPassword);         // true
                                                       checkAssignedProjects(req,function(err,assignedProjectsData,role){
                                                                     if(role != "Admin" && role != "Business Analyst" && role != "Tech Lead")
                                                                     {
                                                                                  if(assignedProjectsData > 0 )
                                                                                   {
                                                                                         assignedProjects = true;
                                                                                  }
                                                                                  if(validUser == true && assignedProjects == true){
                                                                                  
                                                                                         flag = 'validCredential';
                                                                                         status ={"status":flag,"session_id":sessId};
                                                                                         res.setHeader('set-cookie', sessId);
                                                                                         res.writeHead(200,{'Content-Type': 'text/plain'});
                                                                                         res.write("status : "+flag+" , session_id : "+sessId);
                                                                                         res.end();
                                                                                         
                                                                                  }
                                                                                  else if(validUser == true && assignedProjects == false)
                                                                                  {
                                                                                         flag = 'noProjectsAssigned';
                                                                                         res.writeHead(401,{'Content-Type': 'text/plain'});
                                                                                         res.write("status : "+flag+" , session_id : "+"");
                                                                                         res.end();
                                                                                  }
                                                                                  else{
                                                                                         res.setHeader('set-cookie', sessId);
                                                                                         res.writeHead(401,{'Content-Type': 'text/plain'});
                                                                                         res.write("status : "+flag+" , session_id : "+"");
                                                                                         res.end();
                                                                                  }  
                                                                     }
                                                                     else{
                                                                           if(validUser == true){
                                                                                         flag = 'validCredential';
                                                                                         status ={"status":flag,"session_id":sessId};
                                                                                         res.setHeader('set-cookie', sessId);
                                                                                         res.writeHead(200,{'Content-Type': 'text/plain'});
                                                                                         res.write("status : "+flag+" , session_id : "+sessId);
                                                                                         res.end();
                                                                                  }
                                                                           else{
                                                                                         res.setHeader('set-cookie', sessId);
                                                                                         res.writeHead(401,{'Content-Type': 'text/plain'});
                                                                                         res.write("status : "+flag+" , session_id : "+"");
                                                                                         res.end();
                                                                                  }  
                                                                     }
                                                                     
                                                       });

                                                }
                                         }catch(exception){
                                                console.log(exception);
                                                res.setHeader('set-cookie', sessId);
                                                res.writeHead(500,{'Content-Type': 'text/plain'});
                                                res.write("status : fail , session_id : ");
                                                res.end();
                                         }
                                  }
                                  });
                           }
                     });
                           
              }catch(exception){
                           console.log(exception);
                           res.setHeader('set-cookie', sessId);
                           res.writeHead(500,{'Content-Type': 'text/plain'});
                           res.write("status : fail , session_id : ");
                           res.end();
              }
};

/** 
 * @see : function to check whether projects are assigned for user
* @author : vinay 
*/
function checkAssignedProjects(req,callback,data){
var userid = '';
var roleid = '';
var assignedProjectsLen = '';
async.series({
getUserId: function(callback){
       
              // var getUserId = "select userid,defaultrole from users where username = '"+ req.body.username+"' allow filtering;"
              // dbConn.execute(getUserId, function (err, result) {
              //                   if(err) {
              var inputs = {"username":req.session.username, "query":"getUserId"};
              var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
              client.post(epurl+"login/authenticateUser_Nineteen68/projassigned",args,
                                         function (result, response) {
                           if(response.statusCode != 200 || result.rows == "fail"){
                                         console.log("Error occured in authenticateUser_Nineteen68 : Fail");
                                         res.send("fail");
                                  }else{
                                         userid = result.rows[0].userid;
                                         roleid = result.rows[0].defaultrole;
                                         callback(null,userid,roleid);
                                  }
              });
},
getUserRole: function(callback){
       try{
       // var getUserRole = "select rolename from roles where roleid = "+roleid+" allow filtering;"
       //     dbConn.execute(getUserRole, function (err, rolesResult) {
       //                         if(err) {
              var inputs = {"roleid":roleid, "query":"getUserRole"};
              var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
              client.post(epurl+"login/authenticateUser_Nineteen68/projassigned",args,
                     function (rolesResult, response) {
                           if(response.statusCode != 200 || rolesResult.rows == "fail"){ 
                                         console.log("Error occured in authenticateUser_Nineteen68 : Fail");
                                         res.send("fail");
                                  }else{
                                         rolename = rolesResult.rows[0].rolename;
                                         callback(null,userid,rolename);
                                  }
              });
              }
              catch(exception)
              {
                           console.log(exception);
                           res.send('fail');
              }
},
getAssignedProjects: function(callback){
       try{
       //   var getAssignedProjects = "select projectids from icepermissions where userid = "+userid+" allow filtering;"
       //   dbConnICE.execute(getAssignedProjects, function (err, projectsResult) {
       //                         if(err) {
              var inputs = {"userid":userid, "query":"getAssignedProjects"};
              var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
              client.post(epurl+"login/authenticateUser_Nineteen68/projassigned",args,
                                  function (projectsResult, response) {
                                         if(response.statusCode != 200 || projectsResult.rows == "fail"){      
                                         console.log("Error occured in authenticateUser_Nineteen68 : Fail");
                                         res.send("fail");
                                  }else{
                                         if(projectsResult.rows.length > 0)
                                         {
                                                assignedProjectsLen = projectsResult.rows[0].projectids.length;
                                                callback(null,assignedProjectsLen,rolename);
                                         }
                                         else{
                                                assignedProjectsLen = projectsResult.rows.length;
                                                callback(null,assignedProjectsLen,rolename);
                                         }
                                  }
              });
              }
              catch(exception)
              {
                           console.log(exception);
                           res.send('fail');
              }
},
  },function(err,data){
              try{
                if(err){
                      res.send("fail");
                }else{
                     callback(null,assignedProjectsLen,rolename);
                }
              }
              catch(exception)
                     {
                                  console.log(exception);
                                  res.send('fail');
                     }
             })
}


/** 
 * @see : function to check whether user exists or not
* @author : shree.p 
*/
function checkuserexists(req,callback,data){
       var flag = false;
       var authUser = "select password from users where username = '"+ req.session.username+"' allow filtering;"
            //console.log(req);
       dbConn.execute(authUser, function (err, result) {
              if(err) {
                     console.log("Error occured in authenticateUser_Nineteen68 : Fail");
                     callback(null,flag);
              }else{
                     try{
                           if (result.rows.length == 0){
                                  callback(null,flag);
                           }else{
                                  flag = true;
                                  callback(null,flag);
                           }
                     }catch(exception){
                           console.log(exception);
                           callback(null,flag);
                     }
              }
       });

}

/** 
 * @see : function to check whether existing user is ldap user or not
* @author : shree.p 
*/
function checkldapuser(req,callback,data){
       var flag = false;
       // var authUser = "select ldapuser from users where username = '"+ req.session.username+"' allow filtering;"
            //console.log(req);
       // dbConn.execute(authUser, function (err, result) {
              var inputs = {"username":req.session.username};
              var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
              client.post(epurl+"login/authenticateUser_Nineteen68/ldap",args,
                                  function (result, response) {
              // if(err) {
              if(response.statusCode != 200 || result.rows == "fail"){
                     console.log("Error occured in authenticateUser_Nineteen68 : Fail");
                     callback(null,flag);
              }else{
                     try{
                           if (result.rows.length == 0){
                                  callback(null,flag);
                           }else{
                                  flag = result.rows[0].ldapuser;
                                  if(flag == null || flag == undefined){
                                         flag = false;
                                  }
                                  callback(null,flag);
                           }
                     }catch(exception){
                           console.log(exception);
                           callback(null,flag);
                     }
              }
       });

}

function ldapCheck(req,cb){
       var config = require('../../server/config/config');
       var ldap_ip = '',ldap_port='',ldap_domain='';
       var username = req.body.username.toLowerCase();
       var password = req.body.password;
       ldap_ip = config.ldap_ip;
       ldap_port = config.ldap_port;
       ldap_domain = config.ldap_domain;
       var dcarray = [];
       var dcstringarr = []
       try{
              if(ldap_domain.indexOf(".") !== -1){
              dcarray = ldap_domain.split(".");
              }
              for(var i=0;i<dcarray.length;i++){
                     dcstringarr.push("dc="+dcarray[i]);
              }
       }catch(ex){
              console.log("Exception occured : ",ex);
       }
       
       var ActiveDirectory = require('activedirectory');
       var ad = new ActiveDirectory({ url: 'ldap://'+ldap_ip+':'+ldap_port,
                           baseDN: dcstringarr.toString()});
       ad.authenticate(username, password, function(err, auth) {
              if (err) {
                     console.log('ERROR: '+JSON.stringify(err));
                     //console.log('Authentication failed!');
                     //cb(null,'fail');
              }
              if (auth) {
                     console.log("LDAP user");
                     cb(null,'pass');
              } else {
                     console.log('Authentication failed!');
                     cb(null,'fail');
              }
       });
}

//Load User Information - Nineteen68
exports.loadUserInfo_Nineteen68 = function(req, res){
       try{
              if(req.cookies['connect.sid'] != undefined)
              {
                     var sessionCookie = req.cookies['connect.sid'].split(".");
                     var sessionToken = sessionCookie[0].split(":");
                     sessionToken = sessionToken[1];
              }
              if(sessionToken != undefined && req.session.id == sessionToken)
              {
              var flag = req.body.flag;
              var switchedRole = req.body.selRole;
              
              userName = req.body.username.toLowerCase();
              jsonService = {};
              userpermissiondetails = [];
             async.series({
                   userInfo: function(callback){
                     try{
                            // var getUserInfo = "select userid, emailid, firstname, lastname, defaultrole, additionalroles, username from users where username = '"+userName+"' allow filtering";
                           // dbConn.execute(getUserInfo, function (err, userResult) {
                            //     if (err){
                                         var inputs = {"username": userName.toLowerCase(),"query":"userInfo"};
                                         var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
                                         client.post(epurl+"login/loadUserInfo_Nineteen68",args,
                                                function (userResult, response) {
                                                if(response.statusCode != 200 || userResult.rows == "fail"){      
                                         var flag = "fail";
                                         console.log("Failed to get user details from users.");
                                         res.send(flag);
                                  }
                                  else{
                                         try{
                                                if (userResult.rows.length > 0)
                                                {
                                                       AlljsonServices = [];
                                                       service = userResult.rows[0];
                                                       userId = service.userid;
                                                       
                                                       jsonService.user_id = userId;
                                                              jsonService.email_id = service.emailid;
                                                              jsonService.additionalrole = service.additionalroles;
                                                              jsonService.firstname = service.firstname;
                                                              jsonService.lastname = service.lastname;
                                                              jsonService.role = service.defaultrole;
                                                              jsonService.username = service.username.toLowerCase();
                                                              req.session.defaultRoleId = jsonService.role;
                                                              
                                                }
                                                else{
                                                       console.log("No records found.");
                                                       res.send("fail");
                                                }
                                         }
                                         catch(exception){
                                                console.log(exception);
                                                res.send("fail");
                                         }
                                  }
                           callback();
                            })
                     }
                     catch(exception){
                            console.log(exception);
                            res.send("fail");
                     }
                   },
                     loggedinRole: function(callback){
                           
                           //  var getRoleInfo = "select rolename from roles where roleid = "+req.session.defaultRoleId +" allow filtering";
                           //     dbConn.execute(getRoleInfo, function (err, rolesResult) {
                           //            if(err){
                                  var inputs;
                                  if(flag == true){
                                         inputs = {"roleid": req.body.selRole, "query":"loggedinRole"}
                                  }
                                  if(flag == false || flag == undefined){
                                         inputs = {"roleid": req.session.defaultRoleId, "query":"loggedinRole"}
                                  }
                                  //var inputs = {"roleid": req.session.defaultRoleId, "query":"loggedinRole"}
                                  var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
                                  client.post(epurl+"login/loadUserInfo_Nineteen68",args,
                                                       function (rolesResult, response) {
                                         if(response.statusCode != 200 || rolesResult.rows == "fail"){      
                                                console.log("Error occured in getRoleNameByRoleId_Nineteen68 : Fail");
                                                res.send("fail");
                                         }else{
                                                try{
                                                       if (rolesResult.rows.length == 0){
                                                              console.log("No Records Found");
                                                              res.send("fail");
                                                       }else{
                                                              try{
                                                                     var role="";
                                                                     for (var i = 0; i < rolesResult.rows.length; i++) {
                                                                           role = rolesResult.rows[i].rolename;
                                                                     }
                                                                     req.session.defaultRole = role;
                                                              }catch(exception){
                                                                     console.log(exception);
                                                                     res.send("fail");
                                                              }
                                                       }
                                                callback();
                                                }catch(exception){
                                                       console.log(exception);
                                                       res.send("fail");
                                                }
                                         }
                                  });
                     },
                 //Service call to get the plugins accessible for the user
                   userPlugins: function(callback){
                     try{
                            // var getUserPlugins = "select dashboard,deadcode,mindmap,neuron2d,neuron3d,oxbowcode,reports from userpermissions WHERE roleid = "+jsonService.role+" allow filtering";
                            // dbConn.execute(getUserPlugins, function(err, pluginResult){
                            //     if(err){
                                         var inputs;
                                         if(flag == true){
                                                inputs = {"roleid": req.body.selRole, "query":"userPlugins"}
                                         }
                                         if(flag == false || flag == undefined){
                                                inputs = {"roleid": req.session.defaultRoleId, "query":"userPlugins"}
                                         }
                                      //var inputs = {"roleid": req.session.defaultRoleId, "query":"loggedinRole"}
                                         var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
                                         client.post(epurl+"login/loadUserInfo_Nineteen68",args,
                                                       function (pluginResult, response) {
                                                if(response.statusCode != 200 || pluginResult.rows == "fail"){
                                         console.log("Error occured in loadUserInfo_Nineteen68 : Fail");
                                         res.send("fail");
                                  }
                                  else{
                                         try{
                                                if(pluginResult.rows.length > 0){
                                                           var objKeys = Object.keys(pluginResult.rows[0]);
                                                           var pluginsArr = [];
                                                           var count = 0;
                                                           for(var k in pluginResult.rows[0]){
                                                              // if(count < pluginResult.columns.length){
                                                                     pluginsArr.push({
                                                                            "keyName" : k,
                                                                            "keyValue" : (pluginResult.rows[0])[k]
                                                                     })
                                                              //     count++;
                                                              // }
                                                           }
                                                //userpermissiondetails.push(pluginResult.rows[0]);
                                                jsonService.plugindetails = pluginsArr
                                                }
                                                else{
                                                       console.log("No Records Found");
                                                      res.send("fail");
                                                }
                                         }
                                         catch(exception){
                                                console.log(exception);
                                                res.send("fail");
                                         }
                                  }
                            callback();
                            })
                     }
                     catch(exception){
                            console.log(exception);
                            res.send("fail");
                     }
                   }
             },function(err,data){
                if(err){
                       res.send("fail");
                }else{
                       res.send(jsonService);
                }
             })
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

//Get UserRoles By RoleId - Nineteen68
exports.getRoleNameByRoleId_Nineteen68 = function(req, res){
      try{
              if(req.cookies['connect.sid'] != undefined)
              {
                     var sessionCookie = req.cookies['connect.sid'].split(".");
                     var sessionToken = sessionCookie[0].split(":");
                     sessionToken = sessionToken[1];
              }
                     if(sessionToken != undefined && req.session.id == sessionToken)
              {
           var roleId = [];
                 roleId = req.body.role;
                 var role = [];
                 //var role = roleId[0]; 
           var flag="";
        //    var getRoleInfo = "select rolename from roles where roleid = "+roleId+" allow filtering";
        //    dbConn.execute(getRoleInfo, function (err, rolesResult) {
        //          if(err){
              async.forEachSeries(roleId,function(roleid,callback){
                     var inputs = {"roleid": roleid}
                     var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
                     client.post(epurl+"login/getRoleNameByRoleId_Nineteen68",args,
                                  function (rolesResult, response) {
                           if(response.statusCode != 200 || rolesResult.rows == "fail"){ 
                       console.log("Error occured in getRoleNameByRoleId_Nineteen68 : Fail");
                       res.send("fail");
                 }else{
                       try{
                             if (rolesResult.rows.length == 0){
                                   console.log("No Records Found");
                                  res.send("fail");
                             }else{
                                   try{
                                         //var role="";
                                         for (var i = 0; i < rolesResult.rows.length; i++) {
                                               role.push(rolesResult.rows[i].rolename);
                                         }
                                        // res.send(role);
                                   }catch(exception){
                                         console.log(exception);
                                         res.send("fail");
                                   }
                            callback(); 
                                                }
                       }catch(exception){
                             console.log(exception);
                             res.send("fail");
                       }
                 }
                           // callback();
           });
              }, function() {
                     if(role == undefined){
                           res.send("fail");
                     }
                     else {
                           res.send(role);
                     }
              })
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

