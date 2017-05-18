/**
* Dependencies.
*/
var Joi = require('joi');
var client_cas = require('../../server/config/cassandra');
var dbConn = require('../../server/config/cassandra');
var cassandra = require('cassandra-driver');
var bcrypt = require('bcrypt');
var async = require('async');
//Global Variables
var roles = [];
var userRoles = {};


//Authenticate User - Nineteen68
exports.authenticateUser_Nineteen68 = function(req, res){
      try{
            console.log("Inside Authenticate User");
            var username = req.body.username;
            var password = req.body.password;
            var session = req.session;
            var sessId = req.session.id;
            req.session.username = username;
            req.session.uniqueId = sessId;
            var flag= 'inValidCredential';
            var authUser = "select password from users where username = '"+ req.session.username+"' allow filtering;"
            //console.log(req);
            dbConn.execute(authUser, function (err, result) {
                  if(err) {
                        flag="Error occured in authenticateUser_Nineteen68 : Fail";
                        res.send(flag);
                  }else{
                        try{
                              if (result.rows.length == 0){
                                    res.send(flag);
                              }else{
                                    for (var i = 0; i < result.rows.length; i++) {
                                          dbHashedPassword = result.rows[i].password;
                                    }
                                    var validUser = bcrypt.compareSync(password, dbHashedPassword);         // true
                                    if(validUser == true){
                                          flag = 'validCredential';
                                          res.send(flag);
                                    }else{
                                          res.send(flag);
                                    }  
                              }
                        }catch(exception){
                              console.log(exception);
                              res.send(flag);
                        }
                  }
            });
      }catch(exception){
            console.log(exception);
            res.send(flag);
      }
};

//Load User Information - Nineteen68
exports.loadUserInfo_Nineteen68 = function(req, res){
	try{
		userName = req.body.username;
		jsonService = {};
		userpermissiondetails = [];
	      async.series({
	            userInfo: function(callback){
	            	try{
	            		var getUserInfo = "select userid, emailid, firstname, lastname, defaultrole, additionalroles, username from users where username = '"+userName+"' allow filtering";
	                    dbConn.execute(getUserInfo, function (err, userResult) {
	                		if (err)
	                		{
	                			var flag = "Error occured in loadUserInfo_Nineteen68 : Fail"
	                				res.send(flag);
	                		}
	                		else
	                		{
	                			try{
	                				if (userResult.rows.length > 0)
		                			{
		                				AlljsonServices = [];
		                				service = userResult.rows[0];
		                				userId = service.userid;
		                				
		                				jsonService.user_id = userId;
		        						jsonService.email_id = service.emailid;
		        						jsonService.firstname = service.firstname;
		        						jsonService.lastname = service.lastname;
		        						jsonService.role = service.defaultrole;
		        						jsonService.username = service.username;
		                			}
		                			else{
		                				var flag = "No Records Found";
		                					res.send(flag);
		                			}
	                			}
	                			catch(exception){console.log(exception);}
	                		}

	                    	callback();
	                	})
	            	}
	            	catch(exception){
	            		console.log(exception);
	            	}
	            },
	          //Service call to get the plugins accessible for the user
	            userPlugins: function(callback){
	            	try{
	            		var getUserPlugins = "select dashboard,deadcode,ice,mindmap,neuron2d,neuron3d,oxbowcode,reports from userpermissions WHERE roleid = "+jsonService.role+" allow filtering";
	                	dbConn.execute(getUserPlugins, function(err, pluginResult){
	                		if(err){
	                			var flag = "Error occured in loadUserInfo_Nineteen68 : Fail";
	                				res.send(flag);
	                		}
	                		else{
	                			try{
		                			if(pluginResult.rows.length > 0){
		                				userpermissiondetails.push(pluginResult.rows[0]);
		                				jsonService.plugindetails = userpermissiondetails
		                			}
		                			else{
		                				var flag = "No Records Found";
		                				res.send(flag);
		                			}
	                			}
	                			catch(exception){console.log(exception);}
	                		}
	                    	callback();
	                	})
	            	}
	            	catch(exception){console.log(exception);}
	            }
	      },function(err,data){
	    	  if(err){
	    		  
	    	  }else{
	    		  try{
	  	    		res.send(jsonService); 	    			  
	    		  }
	    		  catch(exception){console.log(exception);}
	    	  }
	      })
	}
	catch(exception){
        console.log(exception);
	}
};

//Get UserRoles By RoleId - Nineteen68
exports.getRoleNameByRoleId_Nineteen68 = function(req, res){
      try{
           var roleId= req.body.role;
           var flag="";
           var getRoleInfo = "select rolename from roles where roleid = "+roleId+" allow filtering";
           dbConn.execute(getRoleInfo, function (err, rolesResult) {
                 if(err){
                       flag="Error occured in getRoleNameByRoleId_Nineteen68 : Fail";
                       res.send(flag);
                 }else{
                       try{
                             if (rolesResult.rows.length == 0){
                                   flag = "No Records Found"
                                   res.send(flag);
                             }else{
                                   try{
                                         var role="";
                                         for (var i = 0; i < rolesResult.rows.length; i++) {
                                               role = rolesResult.rows[i].rolename;
                                         }
                                         res.send(role);
                                   }catch(exception){
                                         console.log(exception);
                                   }
                             }
                       }catch(exception){
                             console.log(exception);
                       }
                 }
           });
     }catch(exception){
           console.log(exception);
     }
};
