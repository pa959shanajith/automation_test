var uuid = require('uuid-random');
var async=require('async');
var dbConnICE = require('../../server/config/icetestautomation');
var home_file=require('../../routes_mindmap/index.js');
var myserver = require('../../server.js');
var taskJson=require('../../routes_mindmap/taskJson');
var create_ice=require('../controllers/create_ice');



//getProjectIds
// exports.getProjectIDs_Nineteen68 = function(req, res){
//     var out_project_id = [];
    
//     var project_ids = [];
//     //var user_id = req.userid;
//     var user_id = req.body.userid;
//     //var user_id='e348b7e0-aad7-47d5-ae43-23ec64e83747';
//     async.series({

//         function(callback){
//                var getProjIds = "select projectids FROM icetestautomation.icepermissions where userid"+'='+ user_id;
//         dbConnICE.execute(getProjIds, function (err, result) {
//             if (err) {
//                res.send("projectsNotAssigned");
//             }
//             else {
//                 if (result.rows[0]==undefined){
//                     res.send("projectsNotAssigned");
//                 }else{
//                       async.forEachSeries(result.rows[0].projectids,function(iterator,callback1){
//                     var projectdetails = {projectId:'',projectName:''};
//                     var getProjectName = "select projectName FROM icetestautomation.projects where projectID"+'='+iterator;
//                     dbConnICE.execute(getProjectName,function(err,projectnamedata){
//                         if(err){
//                             console.log(err);
//                             project_ids.push('projectsNotAssigned');
//                         }else{
//                             projectdetails.projectId = iterator;
//                             projectdetails.projectName = projectnamedata.rows[0].projectname; 
//                             console.log(projectnamedata.rows[0].projectname);
//                         }
//                         project_ids.push(projectdetails);
//                        // console.log(project_ids);
                        
//                         callback1();
//                     })

//                 },callback);
//                 }


              
//                 //project_ids.out_project_id = out_project_id;
//                // callback();
//            }
//         });
//         }

//     },function(err,results){
//         console.log(project_ids);
//         res.send(project_ids);
//     })

// };


exports.getProjectIDs_Nineteen68 = function(req, res){
    if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if(sessionToken != undefined && req.session.id == sessionToken)
		{
            create_ice.getProjectIDs_Nineteen68(req.body,function(err,data){
                if (err){
                    console.log(err);
                    res.send('fail');
                }else{
                    //console.log('user_task_json',data);
                    res.send(data);
                }
            });
        }
        else{
           res.send("Invalid Session");
        }
}

//get Task json
exports.getTaskJson_Nineteen68 = function(req, res){
     if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
                var myserver = require('../../server.js');
                req.body.obj.urlData=req.get('host');
            taskJson.getTaskJson_mindmaps(req.body.obj,function(err,data){
                if (err){
                    console.log(err);
                    res.send('fail');
                }else{
                    // console.log('user_task_json',data);
                    res.send(data);
                }
            });
        }
         else{
           res.send("Invalid Session");
        }

};


