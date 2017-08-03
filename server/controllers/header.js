/**
 * Dependencies.
 */
var Joi = require('joi');
var dbConn = require('../../server/config/icetestautomation');
var cassandra = require('cassandra-driver');
var client_cas = require('../../server/config/cassandra');		
var async = require('async');

exports.getProjectDetails_ICE = function (req, res) {
	if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
            //base request elements
            var requestedprojectid = req.body.projectId;
            //response data
            responsedata={
                domainid:"",
                projectname:"",
                projectid:"",
                projecttypeid:""
            }
            /*
             * Query 1 fetching the domainid,projectname,projectid,projecttypeid
             * based on projectid
             */
            var fetchprojectDetails="select domainid,projectname,projectid,projecttypeid from projects"+
            " where projectid="+requestedprojectid;
            dbConn.execute(fetchprojectDetails, function (fetchprojectDetailserr, fetchprojectDetailsresult) {
                if (fetchprojectDetailserr) {
                    var flag = "Error in fetchprojectDetails : Fail";
                    res.send(flag);
                }else {
                    for (var index = 0; index < fetchprojectDetailsresult.rows.length; index++) {
                        responsedata.domainid=fetchprojectDetailsresult.rows[index].domainid;
                        responsedata.projectname=fetchprojectDetailsresult.rows[index].projectname;
                        responsedata.projectid=fetchprojectDetailsresult.rows[index].projectid;
                        responsedata.projecttypeid=fetchprojectDetailsresult.rows[index].projecttypeid;
                    }
                    res.send(responsedata);
                }
            });
		}
				else{
				res.send("Invalid Session");
			}
        }
exports.logoutUser_Nineteen68 = function (req, res) {
       req.cookies['connect.sid'] = '';
		req.session.destroy();
        if(req.session == undefined)
        {
            res.send('Session Expired');
        }
};
/**
 * @author shree.p
 * @see function to logout in Nineteen68 from jenkins
 */
exports.logoutUser_Nineteen68_CI = function (req, res) {
       if(req.sessionStore.sessions != undefined) {
        session_list = req.sessionStore.sessions;
        if(Object.keys(session_list).length !=0){
            req.sessionStore.clear()
			res.send('Logout successful');
        }else{
			res.send('Session Expired');
		}
        
    }
};

//getReleaseName Functionality
	exports.getReleaseNameByReleaseId_ICE = function (req, res) {
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var releaseId = req.body.releaseId;
		var projectId = req.body.projectId;
		if(projectId === 'undefined' || projectId === null|| projectId === ''|| releaseId ==='undefined' || releaseId === null || releaseId === ''){
			console.log('Invalid data received in getReleaseNameByReleaseId_ICE');
		}else{
			var getReleaseName = "select releasename from icetestautomation.releases where releaseid = "+releaseId+" and projectid = "+projectId+"";
			//console.log("sd", getReleaseName)
			dbConn.execute(getReleaseName, function(err, result) {
				//console.log("Result", result);
				var	releaseName = '';
				if(err){
					console.log(err);
				}else{
					if(result.rows.length > 0){
						for (var i = 0; i < result.rows.length; i++) {
						releaseName = result.rows[i].releasename;
						}
					}
					else{
						releaseName = "";
					}
				}
					try{
						res.send(releaseName);
					}catch(ex){
						console.log("Exception occured in getReleaseNameByReleaseId_ICE : ",ex)
					}
			});
		}
		}
		else{
		res.send("Invalid Session");
	}
	  }

//get cycleName
exports.getCycleNameByCycleId_ICE = function (req, res) {
	if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
	if(req.body.cycleId === 'undefined' || req.body.cycleId === null|| req.body.cycleId === ''|| req.body.releaseId ==='undefined' || req.body.releaseId === null || req.body.releaseId === '')
	{
		console.log('Invalid data received in getCycleNameByCycleId_ICE');
	}else{
	var getCycleName = "select cyclename from cycles where releaseid = "+req.body.releaseId+" and cycleid = "+req.body.cycleId+"";
		dbConn.execute(getCycleName, function(err, result) {
							if(err){ console.log(err);
							}
							else{
								if(result.rows.length > 0)
								{
										for (var i = 0; i < result.rows.length; i++) {
										    cycleName = result.rows[i].cyclename;
								          }	
								}
								else{
									cycleName = "";
								}
									try{
										res.send(cycleName);
									}catch(ex){
										console.log("Exception occured in getCycleNameByCycleId : ",ex)
									}
							}
		});
	}
		}
		else{
		res.send("Invalid Session");
	}
}
//Get Additional roles		
var secondaryRoles ={};		
var r_ids = [];		
exports.getAdditionalRoles_Nineteen68 = function(req, res){		
	try{		
		if(req.cookies['connect.sid'] != undefined)		
		{		
			var sessionCookie = req.cookies['connect.sid'].split(".");		
			var sessionToken = sessionCookie[0].split(":");		
			sessionToken = sessionToken[1];		
		}		
			if(sessionToken != undefined && req.session.id == sessionToken)		
		{		
         var userID = userId;		
				
		var getAdditionalRoles = "select additionalroles from users where userid="+userID+";"		
		client_cas.execute(getAdditionalRoles, function (err, result) {		
			if (err) {		
				res.send("fail");		
			}		
			else {		
				try{		
					var rolename = [];		
					var roleid = [];		
					//var roleName = [];		
					//var roleID = [];		
					secondaryRoles = result.rows[0].additionalroles;		
					//for(i=0;i<secondaryRoles.length;i++){		
					async.forEachSeries(secondaryRoles,function(iterator,callback2){		
					var obj = {"name":'',"id":''}		
					var getNamesOfRoles = "select rolename from roles where roleid="+iterator+";"		
							
					client_cas.execute(getNamesOfRoles, function (err, result) {		
	                    		
			              		
						  //rolename.push(result.rows[0].rolename);		
						  //roleid.push(iterator);		
						  obj["name"] = result.rows[0].rolename;		
						  obj["id"] = iterator;		
						  rolename.push(obj);		
						  //console.log("inside async:",rolename);		
						  callback2();		
						  		
					})		
							
				},function(){		
							
					if (typeof rolename === 'undefined') {		
								var flag = "fail";		
								console.log(rolename);		
								res.send(flag); 		
							}		
							else {		
								flag = "success";		
								console.log(rolename);		
								res.send(rolename);		
							}		
				})		
				//}		 		
					//res.send(secondaryRoles);		
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
}		
exports.modifyRoles_Nineteen68 = function(req, res){		
		try{		
		if(req.cookies['connect.sid'] != undefined)		
		{		
			var sessionCookie = req.cookies['connect.sid'].split(".");		
			var sessionToken = sessionCookie[0].split(":");		
			sessionToken = sessionToken[1];		
		}		
		if(sessionToken != undefined && req.session.id == sessionToken){		
			var selected_RoleName = req.body.additionalRoleName;		
			var selected_RoleID = req.body.selectedROleID;		
			var current_Rolename = req.body.currentRole;		
			var userID = req.body.userId;		
			if(selected_RoleName == current_Rolename){		
				res.send("Invalid");		
			}		
			else{		
				var data = {"roleName":'',"roleId":''}			
				var roleChanges = [];									
				var updateCurrentRole = "update users set role="+selected_RoleID+" where userid="+userID+";"		
		        client_cas.execute(updateCurrentRole, function (err, result){		
					if(result === undefined){		
						res.send("Invalid Session");		
					}		
					else{		
						data["roleName"] = selected_RoleName;		
						data["roleId"] = selected_RoleID;		
						roleChanges.push(data);		
					}		
					res.send(data);		
			})		
			}		
					
		}		
		}catch(exception){		
		console.log(exception);		
		res.send("fail");		
	}		
}		
exports.userPlugins_Nineteen68 = function(req, res){		
		try{		
		if(req.cookies['connect.sid'] != undefined)		
		{		
			var sessionCookie = req.cookies['connect.sid'].split(".");		
			var sessionToken = sessionCookie[0].split(":");		
			sessionToken = sessionToken[1];		
		}		
		if(sessionToken != undefined && req.session.id == sessionToken){		
			var username = req.body.username;		
			var roleName = req.body.rolename;		
			var roleID = req.body.roleId;		
			//display plugins		
					
			try{		
	            		var getUserPlugins = "select dashboard,deadcode,mindmap,neuron2d,neuron3d,oxbowcode,reports from userpermissions WHERE roleid = "+roleID+" allow filtering";		
	                	client_cas.execute(getUserPlugins, function(err, pluginResult){		
	                		if(err){		
	                			console.log("Error occured in loadUserInfo_Nineteen68 : Fail");		
	                			res.send("fail");		
	                		}		
	                		else{		
								var pluginsArr = [];		
	                			try{		
		                			if(pluginResult.rows.length > 0){		
								    var objKeys = Object.keys(pluginResult.rows[0]);		
								    // var pluginsArr = [];		
								    var count = 0;		
								    for(var k in pluginResult.rows[0]){		
								    	if(count < pluginResult.columns.length){		
								    		pluginsArr.push({		
								    			"keyName" : k,		
								    			"keyValue" : (pluginResult.rows[0])[k]		
								    		})		
								    		count++;		
								    	}		
								    }		
		                			//userpermissiondetails.push(pluginResult.rows[0]);		
		                			// jsonService.plugindetails = pluginsArr		
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
								res.send(pluginsArr);		
	                		}		
	                	})		
	            	}		
	            	catch(exception){		
	            		console.log(exception);		
	            		res.send("fail");		
	            	}		
		}		
		}catch(exception){		
		console.log(exception);		
		res.send("fail");		
	}
}