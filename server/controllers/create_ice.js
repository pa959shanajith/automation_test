/**
* Dependencies.
*/

//var passwordHash = require('password-hash');
var uuid = require('uuid-random');
var async=require('async');
var dbConnICE = require('../../server/config/icetestautomation');




// //GetUserRoles
// exports.getUserRoles_Nineteen68 = function(req, res){
//     var roles = [];
//     var r_ids = [];
//     var userRoles = {userRoles:[],r_ids:[]};
//    var getUserRoles = "select userid, username from nineteen68.users ";
//         dbConn.execute(getUserRoles, function (err, result) {
//             if (err) {
//                 res(null, err);
//             }
//             else {
//                 async.forEachSeries(result.rows,function(iterator,callback1){
//                     roles.push(iterator.username);
//                     r_ids.push(iterator.userid);
//                     callback1();
//                 });
//                 userRoles.userRoles = roles;
//                 userRoles.r_ids = r_ids;
//                 //console.log(userRoles);
//                res(null,userRoles);
//             }
//         });
// };

// function testsuiteid_exists(testsuiteName,cb,data){
//         var flag = false;
//         var obj = {flag:false,suiteid:''};
//         var suiteCheck = "SELECT moduleid FROM modules where modulename='"+testsuiteName+"' ALLOW FILTERING";
//         dbConnICE.execute(suiteCheck,function(err,suiteid){
//             if(err){
//                 console.log(err);
//                 cb(null,err);
//             }else{
//                 if(suiteid.rows.length!=0){obj.flag = true; obj.suiteid = suiteid.rows[0].moduleid}
//                 cb(null,obj) 
//             }
            
//         });

// };

function get_moduleName(moduleId,cb,data){
        var flag = false;
        var obj = {flag:false,modulename:''};
        var moduleCheck = "SELECT modulename FROM modules where moduleid="+moduleId;
        dbConnICE.execute(moduleCheck,function(err,modulename){
            if(err){
                console.log(err);
                cb(null,err);
            }else{
                if(modulename.rows.length!=0){
                    obj.flag = true; 
                    obj.modulename = modulename.rows[0].modulename
                }
                cb(null,obj) 
            }
            
        })

};
function get_screenName(screenId,cb,data){
         var screenCheck = "SELECT screenname FROM screens where screenid="+screenId;
         var obj2 = {flag:false,screenname:''};
         dbConnICE.execute(screenCheck,function(err,screenname){
             if(err){
                        console.log(err);
                        cb(null,err);
                    }else{
                        if(screenname.rows.length!=0){
                            obj2.flag = true; 
                            obj2.screenname = screenname.rows[0].screenname;
                        }
                        cb(null,obj2) 
                    }
                    
            })

};

exports.getAllNames = function(parent,cb,data){

            var parent_length=parent.length;
			//task_json.testSuiteId=parent[1];
            var allNames = {"testsuitename":"","screenname":"","testcasename":""};
			async.series({
			modulename:function(callback){
				get_moduleName(parent[1],function(err,data){
					if(err)
					console.log(err);
					else{
						allNames.modulename=data.modulename;
					    callback();
					}
				});
			},
            // modulename:function(callback){
			// 	get_moduleName(parent[1],function(err,data){
			// 		if(err)
			// 		console.log(err);
			// 		else{
			// 			allNames.modulename=data.modulename;
			// 		    callback();
			// 		}
			// 	});
			// },
			screenname:function(callback){
				if (parent_length>=4){
					//task_json.screenId=parent[3];
					get_screenName(parent[3],function(err,data2){
						if(err)
						console.log(err);
						else{
							allNames.screenname=data2.screenname;
							callback();
						}
					});
				}else{
                    callback();
                }
			},
			testcasename:function(callback){
				if (parent_length==5){
					//task_json.testCaseId=parent[4];
					get_testcaseName(parent[4],function(err,data3){
						if(err)
						console.log(err);
						else{
							allNames.testcasename=data3.testcasename;
							callback();
						}
					});
				}else{
                    callback();
                }
			}
		},function(err,data){
			cb(null,allNames);
		});	
			
		

};

function get_testcaseName(testcaseId,cb,data){
         var testcaseCheck = "SELECT testcasename FROM testcases where testcaseid="+testcaseId;
         var obj3 = {flag:false,testcasename:''};
        dbConnICE.execute(testcaseCheck,function(err,testcasename){
            if(err){
                console.log(err);
                cb(null,err);
            }else{
                if(testcasename.rows.length!=0){
                    obj3.flag = true; 
                    obj3.testcasename = testcasename.rows[0].testcasename
                }
                cb(null,obj3) 
            }
            
        })

};




function testscreen_exists(testscreenname,cb,data){
    var flag = false;
    var obj = {flag:false,screenid:''};
        var screenCheck = "select screenid from screens where screenname='"+testscreenname+"' ALLOW FILTERING";
        dbConnICE.execute(screenCheck,function(err,screenid){
            if(err){
                console.log(err);
                cb(null,err);
            }else{
                if(screenid.rows.length!=0){ obj.flag = true; obj.screenid = screenid.rows[0].screenid}
                cb(null,obj) 
            }
            
        })
}

function testcase_exists(testcasename,cb,data){
    var flag = false;
    var obj = {flag:false,testcaseid:''}; 
        var screenCheck = "select testcaseid from testcases where testcasename='"+testcasename+"' ALLOW FILTERING";
        dbConnICE.execute(screenCheck,function(err,testcaseid){
            if(err){
                console.log(err);
                cb(null,err);
            }else{
                if(testcaseid.rows.length!=0){ obj.flag = true; obj.testcaseid = testcaseid.rows[0].testcaseid; }
                cb(null,obj) 
            }
            
        })
}




//getProjectIds
exports.getProjectIDs_Nineteen68 = function(req, res){
    var out_project_id = [];
    
    var project_ids = [];
    //var user_id = req.userid;
    var user_id = req.userid;
    //var user_id='e348b7e0-aad7-47d5-ae43-23ec64e83747';
    async.series({

        function(callback){
               var getProjIds = "select projectids FROM icetestautomation.icepermissions where userid"+'='+ user_id;
        dbConnICE.execute(getProjIds, function (err, result) {
            if (err) {
                res(null, err);
            }
            else {
                async.forEachSeries(result.rows[0].projectids,function(iterator,callback1){
                    var projectdetails = {projectId:'',projectName:''};
                    var getProjectName = "select projectName FROM icetestautomation.projects where projectID"+'='+iterator;
                    dbConn.execute(getProjectName,function(err,projectnamedata){
                        if(err){

                        }else{
                            projectdetails.projectId = iterator;
                            projectdetails.projectName = projectnamedata.rows[0].projectname; 
                            console.log(projectnamedata.rows[0].projectname);
                        }
                        project_ids.push(projectdetails);
                       // console.log(project_ids);
                        
                        callback1();
                    })

                },callback);
                //project_ids.out_project_id = out_project_id;
               // callback();
           }
        });
        }

    },function(err,results){
        console.log(project_ids);
        res(null,project_ids);
    })

};

//CreateStrcutre 
exports.createStructure_Nineteen68 = function(req, res) {
    // var RequestedJSON = {
    //     "projectId": "42c3238d-7c0f-48dc-a6e1-fd5deeab845f",
    //     "releaseId": "05329457-f02f-4d41-8ffc-9e04d2d380e3",
    //     "cycleId": "69906803-f30d-485a-9bd1-0719c3e70ff4",
    //     "appType": "Web",
    //     "testsuiteDetails": [{
    //         "testsuiteName": "Dev Suite 1",
    //         "testscenarioDetails": [{
    //             "testscenarioName": "RFRN_OEM_Prerequisites",
    //             "screenDetails": [{
    //                 "screenName": "AHRI_Login",
    //                 "testcaseDetails": [{
    //                     "testcaseName": "AHRI_USHP_AT"
    //                 }]
    //             }, {
    //                 "screenName": "Common_Excel_Data",
    //                 "testcaseDetails": [{
    //                     "testcaseName": "AHRI_USAC_PBM"
    //                 }]
    //             }]
    //         }, {
    //             "testscenarioName": "RFRN_Manage_Disciplinary_Mode_Penalty",
    //             "screenDetails": [{
    //                 "screenName": "Common_Manage_Program",
    //                 "testcaseDetails": [{
    //                     "testcaseName": "USAC_Systems"
    //                 }, {
    //                     "testcaseName": "USAC_PBM_Single_Entry"
    //                 }]
    //             }, {
    //                 "screenName": "AHRI_QuickSearch",
    //                 "testcaseDetails": [{
    //                     "testcaseName": "USAC_QuickSearch"
    //                 }, {
    //                     "testcaseName": "USHP_QuickSearch"
    //                 }]
    //             }]
    //         }]
    //     }]
    // };
    var RequestedJSON =req;
    var projectid = RequestedJSON.projectId;
    var cycleId = RequestedJSON.cycleId;
    var releaseId = RequestedJSON.releaseId;
    var appType = RequestedJSON.appType;
    console.log('projectid', projectid);
    console.log('cycleId', cycleId);

    var username=RequestedJSON.userName;
    var suite = RequestedJSON.testsuiteDetails.length;
    var suiteID = uuid();
    var suitedetails = RequestedJSON.testsuiteDetails[0];
    var testsuiteName = suitedetails.testsuiteName;
    var moduleid_c = suitedetails.testsuiteId_c;
    var scenarioidlist = [];
    var scenario =[];
    
    var suitedetailslist = [];
    async.series({

            projectsUnderDomain: function(callback) {
                var suiteflag = false;
                var suiteidTemp = '';
                var scenariodetailslist = [];
                var testsuiteidneo = suitedetails.testsuiteId;
                var tasksuite = suitedetails.task;
             //   function loopback(callback){
                    //  async.series({
                    // function(callback){
                    //     var suiteCheck = "SELECT testsuiteid FROM testsuites where testsuitename='"+testsuiteName+"' ALLOW FILTERING";
                    //     dbConnICE.execute(suiteCheck,function(err,suiteid){
                    //         if(err){
                    //             console.log(err);
                    //         }else{
                    //             if(suiteid.rows.length!=0){
                    //                  flag = true;
                    //                  suite = suiteid.rows[0].testsuiteid;
                    //             } 
                    //         }
                    //         callback();
                    //     });   
                            
                    // }
                    
                    //  },callback);
               // }


               testsuiteid_exists({"modulename":testsuiteName,"moduleid":moduleid_c,'modifiedby':username},function(err,data){
						
						if(err){
							console.log(err);
						}else{
							suiteflag = data.flag;
                            suiteidTemp = data.suiteid;			
						}

                            var insertInSuite ='';
                if(!suiteflag){
                insertInSuite = "INSERT INTO modules (projectid,modulename,moduleid,versionnumber,createdby,createdon,createdthrough,deleted,history,modifiedby,modifiedbyrole,modifiedon,skucodemodule,tags,testscenarioids) VALUES (" + projectid + ",'" + testsuiteName + "'," + suiteID + ",1,'"+username+"'," + new Date().getTime() + ",null,null,null,null,null," + new Date().getTime() + ",null,null,null);";
                }else{
                insertInSuite = "SELECT moduleid FROM modules where modulename='"+testsuiteName+"' ALLOW FILTERING";
                suiteID = suiteidTemp; 
               }
               var testsuiteobj = {"testsuiteId":testsuiteidneo,"testsuiteId_c":suiteID,"testsuiteName":testsuiteName,"task":tasksuite,"testscenarioDetails":scenariodetailslist};
               suitedetailslist.push(testsuiteobj);
               console.log(insertInSuite);
                dbConnICE.execute(insertInSuite, function(err, testsuiteresult) {
                    if (err) {
                        console.log(err);
                    } else {
                        scenario = suitedetails.testscenarioDetails;
                        var scenariosarray = [];
                         var testcaseidlist = []; 
                        async.forEachSeries(scenario, function(iterator, callback2) {
                           
                            var scenarioId = uuid();
                            scenariosarray.push(scenarioId);
                           
                            var modifiedon = new Date().getTime();
                            //var scenariodetails = iterator.testscenarioDetails[scenario];
                            var scenarioName = iterator.testscenarioName;
                            var scenarioid_c = iterator.testscenarioId_c;
                            var scenarioflag = false;
                            var scenarioidTemp = '';
                            var screendetailslist = [];
                            var taskscenario = iterator.task;
                            var scenarioidneo = iterator.testscenarioId;
                            
                            
                            testscenariosid_exists({"testscenarioname":scenarioName,"testscenarioid":scenarioid_c},function(err,scenariodata){
                                if(err){
                                    console.log(err);
                                    cb(null,err);
                                }else{
                                    scenarioflag = scenariodata.flag;
                                    scenarioidTemp = scenariodata.scenarioid;
                                }
                                var insertInScenario='';
                                if(!scenarioflag){
                                    insertInScenario   = "insert into testscenarios(projectid,testscenarioname,testscenarioid,createdby,createdon,history,modifiedby,modifiedbyrole,modifiedon,skucodetestscenario,tags,testcaseids) VALUES (" + projectid + ",'" + scenarioName + "'," + scenarioId + ",'"+username+"'," + new Date().getTime() + ",null,null,null," + new Date().getTime() + ",null,null,null)";
                                }else{
                                    insertInScenario = "DELETE testcaseids FROM testscenarios WHERE testscenarioid="+scenarioidTemp+" and testscenarioname='"+scenarioName +"' and projectid = "+projectid;
                                    scenarioId =  scenarioidTemp;
                                }
                                var scenariodetailsobj = {"testscenarioId":scenarioidneo,"testscenarioId_c":scenarioId,"screenDetails":screendetailslist,"tasks":taskscenario,"testscenarioName":scenarioName};
                                scenariodetailslist.push(scenariodetailsobj);
                                dbConnICE.execute(insertInScenario, function(err, scenarioresult) {

                                if (err) {
                                    console.log(err);
                                } else {
                                    scenarioidlist.push(scenarioId);
                                    var screen = iterator.screenDetails;
                                    async.forEachSeries(screen, function(screenitr, callback3) {

                                        var screenId = uuid();
                                        var screenDetails = screenitr;
                                        var screenName = screenitr.screenName;
                                        var screenid_c = screenitr.screenId_c;
                                        var screenflag = false;
                                        var screenidTemp = '';
                                        var testcasedetailslist = [];
                                        var screenidneo = screenitr.screenId;
                                        var taskscreen = screenitr.task;

                                        //console.log('screenName details',screenName);
                                        testscreen_exists({"testscreenname":screenName,"testscreenid":screenid_c},function(err,screendata){
                                            if(err){
                                                console.log(err);
                                            }else{
                                                screenflag = screendata.flag;
                                                screenidTemp = screendata.screenid;
                                            }
                                            var insertInScreen = '';
                                            if(!screenflag){
                                                insertInScreen = "INSERT INTO screens (projectid,screenname,screenid,versionnumber,createdby,createdon,createdthrough,deleted,history,modifiedby,modifiedon,screendata,skucodescreen,tags) VALUES (" + projectid + ",'" + screenName + "'," + screenId + ",1,'"+username+"'," + new Date().getTime() + ",null,null,null,null," + new Date().getTime() + ",'',null,null)";

                                            }else{
                                                insertInScreen = "select screenid from screens where screenname='"+screenName+"' ALLOW FILTERING";
                                                screenId = screenidTemp;
                                            }
                                            var screendetailsobj = {"testcaseDetails":testcasedetailslist,"screenName":screenName,"screenId_c":screenId,"screenId":screenidneo,"task":taskscreen};
                                            screendetailslist.push(screendetailsobj);

                                                dbConnICE.execute(insertInScreen, function(err, screenresult) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        var testcase = screenDetails.testcaseDetails;
                                                        var testcasesarray = [];
                                                        async.forEachSeries(testcase, function(testcaseitr, callback4) {
                                                            var testcaseID = uuid();
                                                            // testcasesarray.push(testcaseID);

                                                            var testcaseDetails = testcaseitr;
                                                            var testcaseName = testcaseitr.testcaseName;
                                                            var testcaseid_c = testcaseitr.testcaseId_c;
                                                            var testcaseflag = false;
                                                            var testcaseidTemp = '';
                                                            var testcaseidneo = testcaseitr.testcaseId;
                                                            var tasktestcase = testcaseitr.task;
                                                            testcase_exists({"testcasename":testcaseName,"testcaseid":testcaseid_c},function(err,testcasedata){
                                                                if(err){
                                                                    console.log(err)
                                                                }else{
                                                                    testcaseflag = testcasedata.flag;
                                                                    testcaseidTemp = testcasedata.testcaseid;
                                                                }

                                                                var insertInTescase = '';
                                                                if(!testcaseflag){
                                                                    insertInTescase = "INSERT INTO testcases (screenid,testcasename,testcaseid,versionnumber,createdby,createdon,createdthrough,deleted,history,modifiedby,modifiedon,skucodetestcase,tags,testcasesteps)VALUES (" + screenId + ",'" + testcaseName + "'," + testcaseID + ",1,'"+username+"'," + new Date().getTime() + ",null,null,null,null," + new Date().getTime() + ",'skucodetestcase',null,'')";

                                                                }else{
                                                                    insertInTescase = "select testcaseid from testcases where testcasename='"+testcaseName+"' ALLOW FILTERING";
                                                                    testcaseID = testcaseidTemp;

                                                                } 
                                                                 var testcasedetailsobj = {"testcaseId":testcaseidneo,"testcaseId_c":testcaseID,"testcaseName":testcaseName,"task":tasktestcase};
                                                                testcasedetailslist.push(testcasedetailsobj);                                                           
                                                            //   var testsuiteids = "SELECT testsuiteid,testsuitename FROM testsuites WHERE cycleid="+cycleiditr.cycleid;
                                                            dbConnICE.execute(insertInTescase, function(err, testsuiteidsdata) {
                                                                if (err) {
                                                                    console.log(err);
                                                                } else {
                                                                    testcaseidlist.push(testcaseID);
                                                                	var updateTestscenario="update testscenarios set testcaseids=testcaseids+["+testcaseID+"],modifiedby='"+username+"',modifiedon="+modifiedon+"   where projectid ="+projectid+"and testscenarioid ="+scenarioId+" and testscenarioname = '"+scenarioName+"' ";
                                                                    var update =dbConnICE.execute(updateTestscenario,function(err,result){});
                                                                }
                                                                
                                                             callback4();
                                                            });


                                                            })
                                                            
                                                        }, callback3);
                                                    }
                                                });

                                           // callback3();

                                        });
                                        
                                    }, callback2);     
                                    
                                }
                            });
                            // var updateTestscenario="update testscenarios set testcaseids=["+testcaseidlist+"],modifiedby='KAVYASREE',modifiedon="+modifiedon+"   where projectid ="+projectid+"and testscenarioid ="+scenarioId+" and testscenarioname = '"+scenarioName+"' ";
                            // var update =dbConnICE.execute(updateTestscenario,function(err,result){testcaseidlist=[]});
                            
                               // callback2();
                            })
                            
                        }, callback);
                    }
                });


						//callback(); 
					});
               

                

            },
            updatescenarioids:function(callback){
                var versionnumber = 1;
                var updatescenarioidsinsuite = "UPDATE modules SET testscenarioids = ["+scenarioidlist+"] WHERE moduleid="+suiteID+" and projectid="+projectid+" and modulename='"+testsuiteName+"' and versionnumber="+versionnumber;
                dbConnICE.execute(updatescenarioidsinsuite,function(err,result){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("sucess scenario");
                      
                    }callback();

                });
            }

        },
        function(err, results) {
            // data.setHeader('Content-Type','application/json');
            if (err) {
                console.log(err);
                res(null,err);
            } else {
                var returnJsonmindmap = {"projectId":projectid,"cycleId":cycleId,"releaseId":releaseId,"appType":appType,"testsuiteDetails":suitedetailslist}
                console.log('in last function',returnJsonmindmap);
                // console.log('here in last function   ',JSON.stringify(testSuiteDetails));
                // cb(null,JSON.stringify(RequestedJSON));
                res(null,returnJsonmindmap);


                //callback();
            }
        }
    );
}


function testsuiteid_exists(moduledetails,cb,data){
        var flag = false;
        var obj = {flag:false,suiteid:''};
        var statusflag = false;
        async.series({

            moduledetails:function(modulecallback){
                var suiteCheck = "SELECT moduleid FROM modules where modulename='"+moduledetails.modulename+"' and moduleid="+moduledetails.moduleid+" ALLOW FILTERING";
                dbConnICE.execute(suiteCheck,function(err,suiteid){
                    if(err){
                        console.log(err);
                        cb(null,obj);
                    }else{
                        if(suiteid.rows.length!=0){obj.flag = true; obj.suiteid = suiteid.rows[0].moduleid
                            statusflag = true;
                            //cb(null,obj);
                        }
                        modulecallback();
                        
                    }
                    
                });
            },
            moduleupdate:function(modulecallback){
               if(!statusflag){
                    updatetestsuitename(moduledetails,function(err,data){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(data);
                            if(data=="success"){
                                obj.flag = true;
                                obj.suiteid = moduledetails.moduleid;
                            }
                            modulecallback(null,data);
                        }
                        //cb(null,obj);
                    });
                }else{
                   modulecallback(null,obj);
                }
                
            }

        },function(err,data){
            if(err){

            }else{
                cb(null,obj);
            }
        });
        

};
function updatetestsuitename(moduledetails,cb,data){
    var suitedatatoupdate = [];
    var flagtocheckifexists = false;
    async.series({
        select:function(callback){
            var completesuite = "select * from modules where moduleid="+moduledetails.moduleid;
            dbConnICE.execute(completesuite,function(err,suitedata){
                if(err){
                    console.log(err);
                }else{
                    if(suitedata.rows.length!=0){
                        flagtocheckifexists = true;
                        suitedatatoupdate = suitedata.rows[0];
                    }
                    
                }
                callback(null,suitedatatoupdate);
            });
        },
        delete:function(callback){
            if(flagtocheckifexists){
                var deletequery = "DELETE FROM modules WHERE moduleid="+moduledetails.moduleid+" and modulename='"+suitedatatoupdate.modulename+"' and projectid="+suitedatatoupdate.projectid;
                dbConnICE.execute(deletequery,function(err,deleted){
                    if(err)  console.log(err);
                    // {
                    
                    // }else{
                        
                    // }
                    callback();
                });
            }else{
                callback();
            }
            
        },
        update:function(callback){
            if(flagtocheckifexists){
                var insertquery = "";
                try{
                    insertquery = "INSERT INTO modules (projectid,modulename,moduleid,versionnumber,createdby,createdon,createdthrough,deleted,history,modifiedby,modifiedbyrole,modifiedon,skucodemodule,tags,testscenarioids) VALUES ("+suitedatatoupdate.projectid+",'"+moduledetails.modulename+"',"+
                    suitedatatoupdate.moduleid+","+suitedatatoupdate.versionnumber+",'"+suitedatatoupdate.createdby+"',"+suitedatatoupdate.createdon.valueOf()+","+suitedatatoupdate.createdthrough
                    +","+suitedatatoupdate.deleted+",null,'"+moduledetails.modifiedby+"',"+suitedatatoupdate.modifiedbyrole+","+new Date().getTime()+","+suitedatatoupdate.skucodemodule
                    +","+suitedatatoupdate.tags+",["+suitedatatoupdate.testscenarioids+"]);"; 
                }catch(ex){
                    console.log(ex);
                    console.log(insertquery);
                }
                
                dbConnICE.execute(insertquery,function(err,deleted){
                    // if(err){
                    //     console.log(err);
                    // }else{
                    // }
                    callback(null,"success");
                });
            }else{
                callback(null,"fail");
            }    
            

        }
    },function(err,data){
        cb(null,"success");
    });

}
function testscenariosid_exists(testscenariodetails,cb,data){
    var flag = false;
    var obj = {flag:false,scenarioid:''};
    var statusflag = false;
        
        // dbConnICE.execute(scenarioCheck,function(err,scenarioid){
        //     if(err){
        //         console.log(err);
        //         cb(null,obj);
        //     }else{
        //         if(scenarioid.rows.length!=0){ obj.flag = true; obj.scenarioid = scenarioid.rows[0].testscenarioid}
        //         else{
                    
        //         }
        //         cb(null,obj) 
        //     }
            
        // })
        async.series({

            scenariodetails:function(scenariocallback){
                var scenarioCheck = "select testscenarioid from testscenarios where testscenarioname='"+testscenariodetails.testscenarioname+"' and testscenarioid = "+testscenariodetails.testscenarioid+" ALLOW FILTERING";
                dbConnICE.execute(scenarioCheck,function(err,scenarioid){
                    if(err){
                        console.log(err);
                        cb(null,obj);
                    }else{
                        if(scenarioid.rows.length!=0){ 
                            obj.flag = true; 
                            obj.scenarioid = scenarioid.rows[0].testscenarioid;
                            statusflag = true;
                        }
                        scenariocallback();
                        
                    }
                    
                });
            },
            scenarioupdate:function(scenariocallback){
               if(!statusflag){
                    updatetestscenarioname(testscenariodetails,function(err,data){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(data);
                            if(data=="success"){
                                obj.flag = true;
                                obj.scenarioid = testscenariodetails.testscenarioid;
                            }
                            scenariocallback(null,data);
                        }
                        //cb(null,obj);
                    });
                }else{
                   scenariocallback(null,obj);
                }
                
            }

        },function(err,data){
            if(err){

            }else{
                cb(null,obj);
            }
        });

}
function updatetestscenarioname(testscenariodetails,cb,data){
    var scenariodatatoupdate = [];
    var flagtocheckifexists = false;
    async.series({
        select:function(callback){
            var completesuite = "select * from testscenarios where testscenarioid="+testscenariodetails.testscenarioid;
            dbConnICE.execute(completesuite,function(err,scenariodata){
                if(err){
                    console.log(err);
                }else{
                    if(scenariodata.rows.length!=0){
                        flagtocheckifexists = true;
                        scenariodatatoupdate = scenariodata.rows[0];
                    }
                    
                }
                callback(null,scenariodatatoupdate);
            });
        },
        delete:function(callback){
            if(flagtocheckifexists){
                var deletequery = "DELETE FROM testscenarios WHERE testscenarioid="+testscenariodetails.testscenarioid+" and testscenarioname='"+scenariodatatoupdate.testscenarioname+"' and projectid="+scenariodatatoupdate.projectid;
                dbConnICE.execute(deletequery,function(err,deleted){
                    if(err)  console.log(err);
                    // {
                    
                    // }else{
                        
                    // }
                    callback();
                });
            }else{
                callback();
            }
            
        },
        update:function(callback){
            // var insertquery = "INSERT INTO modules (projectid,modulename,moduleid,versionnumber,createdby,createdon,createdthrough,deleted,history,modifiedby,modifiedbyrole,modifiedon,skucodemodule,tags,testscenarioids) VALUES ("+suitedatatoupdate.projectid+",'"+moduledetails.modulename+"',"+
            // suitedatatoupdate.moduleid+","+suitedatatoupdate.versionnumber+",'"+suitedatatoupdate.createdby+"',"+suitedatatoupdate.createdon.valueOf()+","+suitedatatoupdate.createdthrough
            // +","+suitedatatoupdate.deleted+","+suitedatatoupdate.history+","+suitedatatoupdate.modifiedby+","+suitedatatoupdate.modifiedbyrole+","+new Date().getTime()+","+suitedatatoupdate.skucodemodule
            // +","+suitedatatoupdate.tags+",["+suitedatatoupdate.testscenarioids+"]);";
            if(flagtocheckifexists){
                var insertquery = "";
                try{
                    if (scenariodatatoupdate.testcaseids==null){
                        scenariodatatoupdate.testcaseids='';
                    }
                    insertquery = "INSERT INTO testscenarios (projectid,testscenarioname,testscenarioid,createdby,createdon,deleted,history,modifiedby,modifiedbyrole,modifiedon,skucodetestscenario,tags,testcaseids) VALUES ("+
                scenariodatatoupdate.projectid+",'"+testscenariodetails.testscenarioname+"',"+testscenariodetails.testscenarioid+",'"+scenariodatatoupdate.createdby+"',"+scenariodatatoupdate.createdon.valueOf()
                +","+scenariodatatoupdate.deleted+",null,'"+scenariodatatoupdate.modifiedby+"',"+scenariodatatoupdate.modifiedbyrole+","+new Date().getTime()+",'"+scenariodatatoupdate.skucodetestscenario
                +"',"+scenariodatatoupdate.tags+",["+scenariodatatoupdate.testcaseids+"]);";
                }catch(ex){
                    console.log(ex);
                }

                dbConnICE.execute(insertquery,function(err,deleted){
                    // if(err){
                    //     console.log(err);
                    // }else{
                    // }
                    callback(null,"success");
                });
            }else{
                callback(null,"fail");
            }

        }
    },function(err,data){
        cb(null,"success");
    });   
}
function testscreen_exists(testscreendetails,cb,data){
    var flag = false;
    var obj = {flag:false,screenid:''};
    var statusflag = false;

        async.series({

            screendetails:function(screencallback){
                var screenCheck =  "select screenid from screens where screenname='"+testscreendetails.testscreenname+"' and screenid="+testscreendetails.testscreenid+" ALLOW FILTERING";
                dbConnICE.execute(screenCheck,function(err,screenid){
                    if(err){
                        console.log(err);
                        cb(null,obj);
                    }else{
                        if(screenid.rows.length!=0){ 
                            obj.flag = true; 
                            obj.screenid = screenid.rows[0].screenid;
                            statusflag = true;
                        }
                        screencallback();
                        
                    }
                    
                });
            },
            screenupdate:function(screencallback){
               if(!statusflag){
                    updatetestscreenname(testscreendetails,function(err,data){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(data);
                            if(data=="success"){
                                obj.flag = true;
                                obj.screenid = testscreendetails.testscreenid;
                            }
                            screencallback(null,data);
                        }
                        //cb(null,obj);
                    });
                }else{
                   screencallback(null,obj);
                }
                
            }

        },function(err,data){
            if(err){

            }else{
                cb(null,obj);
            }
        });

}

function updatetestscreenname(testscreendetails,cb,data){
var screendatatoupdate = [];
    var flagtocheckifexists = false;
    async.series({
        select:function(callback){
            var completescreen = "select * from screens where screenid="+testscreendetails.testscreenid;
            dbConnICE.execute(completescreen,function(err,screendata){
                if(err){
                    console.log(err);
                }else{
                    if(screendata.rows.length!=0){
                        flagtocheckifexists = true;
                        screendatatoupdate = screendata.rows[0];
                    }
                    
                }
                callback(null,screendatatoupdate);
            });
        },
        delete:function(callback){
            if(flagtocheckifexists){
                
                var deletequery = "DELETE FROM screens WHERE screenid="+testscreendetails.testscreenid+" and screenname='"+screendatatoupdate.screenname+"' and projectid="+screendatatoupdate.projectid;
                dbConnICE.execute(deletequery,function(err,deleted){
                    if(err)  console.log(err);
                    // {
                    
                    // }else{
                        
                    // }
                    callback();
                });
                
            }else{
                callback();
            }
        },
        update:function(callback){
            if(flagtocheckifexists){
                var insertquery = "";
                try{
                     insertquery = "INSERT INTO screens (projectid,screenname,screenid,versionnumber,createdby,createdon,createdthrough,deleted,history,modifiedby,modifiedbyrole,modifiedon,screendata,skucodescreen,tags) VALUES ("+screendatatoupdate.projectid
                +",'"+testscreendetails.testscreenname+"',"+screendatatoupdate.screenid+","+screendatatoupdate.versionnumber+",'"+screendatatoupdate.createdby+"',"+screendatatoupdate.createdon.valueOf()
                +","+screendatatoupdate.createdthrough+","+screendatatoupdate.deleted+",null,'"+screendatatoupdate.modifiedby+"',"+screendatatoupdate.modifiedbyrole
                +","+new Date().getTime()+",'"+screendatatoupdate.screendata+"','"+screendatatoupdate.skucodescreen+"',"+screendatatoupdate.tags+");"
                }catch(ex){
                    console.log(ex);
                }
                

                dbConnICE.execute(insertquery,function(err,deleted){
                    // if(err){
                    //     console.log(err);
                    // }else{
                    // }
                    callback(null,"success");
                });
            }else{
                callback(null,"fail");
            }

        }
    },function(err,data){
        cb(null,"success");
    });
}

function testcase_exists(testcasedetails,cb,data){
    var flag = false;
    var obj = {flag:false,testcaseid:''};
    var statusflag = false; 
        // var screenCheck = "select testcaseid from testcases where testcasename='"+testcasedetails.testcasename+"' and testcaseid="+testcasedetails.testcaseid+" ALLOW FILTERING";
        // dbConnICE.execute(screenCheck,function(err,testcaseid){
        //     if(err){
        //         console.log(err);
        //         cb(null,err);
        //     }else{
        //         if(testcaseid.rows.length!=0){ obj.flag = true; obj.testcaseid = testcaseid.rows[0].testcaseid; }
        //         else{
                    
        //         }
        //         cb(null,obj) 
        //     }
            
        // })
        async.series({

            testcasedetails:function(testcasecallback){
                var testcaseCheck =  "select testcaseid from testcases where testcasename='"+testcasedetails.testcasename+"' and testcaseid="+testcasedetails.testcaseid+" ALLOW FILTERING";
                dbConnICE.execute(testcaseCheck,function(err,testcaseid){
                    if(err){
                        console.log(err);
                        cb(null,obj);
                    }else{
                        if(testcaseid.rows.length!=0){ 
                            obj.flag = true; 
                            obj.testcaseid = testcaseid.rows[0].testcaseid;
                            statusflag = true;
                        }
                        testcasecallback();
                        
                    }
                    
                });
            },
            testcaseupdate:function(testcasecallback){
               if(!statusflag){
                    updatetestcasename(testcasedetails,function(err,data){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(data);
                            if(data=="success"){
                                obj.flag = true;
                                obj.testcaseid = testcasedetails.testcaseid;
                            }
                            testcasecallback(null,data);
                        }
                        //cb(null,obj);
                    });
                }else{
                   testcasecallback(null,obj);
                }
                
            }

        },function(err,data){
            if(err){

            }else{
                cb(null,obj);
            }
        });
}
function updatetestcasename(testcasedetails,cb,data){
var testcasedatatoupdate = [];
    var flagtocheckifexists = false;
    async.series({
        select:function(callback){
            var completetestcase = "select * from testcases where testcaseid="+testcasedetails.testcaseid;
            dbConnICE.execute(completetestcase,function(err,testcasedata){
                if(err){
                    console.log(err);
                }else{
                    if(testcasedata.rows.length!=0){
                        flagtocheckifexists = true;
                        testcasedatatoupdate = testcasedata.rows[0];
                    }
                    
                }
                callback(null,testcasedatatoupdate);
            });
        },
        delete:function(callback){
            if(flagtocheckifexists){
                
                var deletequery = "DELETE FROM testcases WHERE testcaseid="+testcasedetails.testcaseid+" and testcasename='"+testcasedatatoupdate.testcasename+"' and screenid="+testcasedatatoupdate.screenid;
                dbConnICE.execute(deletequery,function(err,deleted){
                    if(err)  console.log(err);
                    // {
                    
                    // }else{
                        
                    // }
                    callback();
                });
            }else{
                callback();
            }
        },
        update:function(callback){

            // var insertquery = "INSERT INTO screens (projectid,screenname,screenid,versionnumber,createdby,createdon,createdthrough,deleted,history,modifiedby,modifiedbyrole,modifiedon,screendata,skucodescreen,tags) VALUES ("+screendatatoupdate.projectid
            // +",'"+testscreendetails.testscreenname+"',"+screendatatoupdate.screenid+","+screendatatoupdate.versionnumber+",'"+screendatatoupdate.createdby+"',"+screendatatoupdate.createdon.valueOf()
            // +","+screendatatoupdate.createdthrough+","+screendatatoupdate.deleted+","+screendatatoupdate.history+",'"+screendatatoupdate.modifiedby+"',"+screendatatoupdate.modifiedbyrole
            // +","+new Date().getTime()+",'"+screendatatoupdate.screendata+"',"+screendatatoupdate.skucodescreen+","+screendatatoupdate.tags+");"
            if(flagtocheckifexists){
                var insertquery = "";
                try{
                     insertquery = "INSERT INTO testcases (screenid,testcasename,testcaseid,versionnumber,createdby,createdon,createdthrough,deleted,history,modifiedby,modifiedbyrole,modifiedon,skucodetestcase,tags,testcasesteps) VALUES ("+
                testcasedatatoupdate.screenid+",'"+testcasedetails.testcasename+"',"+testcasedetails.testcaseid+","+testcasedatatoupdate.versionnumber+",'"+testcasedatatoupdate.createdby
                +"',"+testcasedatatoupdate.createdon.valueOf()+","+testcasedatatoupdate.createdthrough+","+testcasedatatoupdate.deleted+",null,'"+testcasedatatoupdate.modifiedby+"',"+testcasedatatoupdate.modifiedbyrole+","+new Date().getTime()
                +",'"+testcasedatatoupdate.skucodetestcase+"',"+testcasedatatoupdate.tags+",'"+testcasedatatoupdate.testcasesteps+"');";
                }catch(ex){
                    console.log(ex);
                }
                

                dbConnICE.execute(insertquery,function(err,deleted){
                    // if(err){
                    //     console.log(err);
                    // }else{
                    // }
                    callback(null,"success");
                });
            }else{
                callback(null,"fail");
            }

        }
    },function(err,data){
        cb(null,"success");
    });
}
exports.getReleaseIDs_Ninteen68 = function(req,res){
    var rname = [];
    var r_ids = [];
    var rel = {rel:[],r_ids:[]};
    //var project_id = req.projectid;
   var project_id = 'd4965851-a7f1-4499-87a3-ce53e8bf8e66'
   var getReleaseDetails = "select releasename,releaseid from icetestautomation.releases where projectid"+'='+ project_id;
        dbConnICE.execute(getReleaseDetails, function (err, result) {
            if (err) {
                res(null, err);
            }
            else {
                async.forEachSeries(result.rows,function(iterator,callback1){
                    rname.push(iterator.releasename);
                    r_ids.push(iterator.releaseid);
                    callback1();
                });
                rel.rel = rname;
                rel.r_ids = r_ids;
                console.log(rel);
               res(null,rel);
            }
        });
}

exports.getCycleIDs_Ninteen68 = function(req,res){
    var cname = [];
    var c_ids = [];
    var cyc = {cyc:[],c_ids:[]};
    var release_id = req.relId;
    //var release_id = '7f71b58f-ad8c-46ac-80f5-5c4145585c08'
    var getCycleDetails = "select cyclename,cycleid from icetestautomation.cycles where releaseid"+'='+ release_id;
    dbConnICE.execute(getCycleDetails, function (err, result) {
            if (err) {
                res(null, err);
            }
            else {
                async.forEachSeries(result.rows,function(iterator,callback1){
                    cname.push(iterator.cyclename);
                    c_ids.push(iterator.cycleid);
                    callback1();
                });
                cyc.cyc = cname;
                cyc.c_ids = c_ids;
                console.log(cyc);
               res(null,cyc);
            }
        });
}

exports.getProjectIDs_Nineteen68 = function(req, res){
    var out_project_id = [];   
    var project_ids = [];
    var user_id = req.userid;
    //var user_id='e348b7e0-aad7-47d5-ae43-23ec64e83747';
    async.series({
        function(callback){
               var getProjIds = "select projectids FROM icetestautomation.icepermissions where userid"+'='+ user_id;
        dbConnICE.execute(getProjIds, function (err, result) {
            if (err) {
                res(null, err);
            }
            else {
                async.forEachSeries(result.rows[0].projectids,function(iterator,callback1){
                    var projectdetails = {projectId:'',projectName:''};
                    var getProjectName = "select projectName FROM icetestautomation.projects where projectID"+'='+iterator;
                    dbConn.execute(getProjectName,function(err,projectnamedata){
                        if(err){

                        }else{
                            projectdetails.projectId = iterator;
                            projectdetails.projectName = projectnamedata.rows[0].projectname; 
                            console.log(projectnamedata.rows[0].projectname);
                        }
                        project_ids.push(projectdetails);
                       // console.log(project_ids);
                        
                        callback1();
                    })

                },callback);
                //project_ids.out_project_id = out_project_id;
               // callback();
           }
        });
        }
    },function(err,results){
        console.log(project_ids);
        res(null,project_ids);
    })
};