var create_ice=require('../server/controllers/create_ice');
var fs = require('fs');
var http = require('http');
var async=require('async');


exports.getTaskJson_mindmaps = function(obj,cb,data){
	try {
	//var userid="482fa3f8-7db6-4512-a35f-adef7f07a6c2";
    //obj.userid=userid;
    
	query={'statement':"MATCH (n:TASKS) WHERE n.assignedTo='"+obj.userid+"' RETURN n"};
	var qlist_query=[query];
	reqToAPI({"data":{"statements":qlist_query}},obj.urlData,'/neoQuerya',function(err,status,result){
					//res.setHeader('Content-Type','application/json');
					if(err){
						console.log(err);
						//res.status(status).send(err);
					} else{
                        var resultobj = {"result":result,"prjId":obj.prjId}; 
						next_function(resultobj,function(err,data){
                            if(err){
                                cb(null,err);
                            }else{
                                console.log(data);
                                cb(null,data);
                            }
                        });

                        //console.log("user_task_json : ",user_task_json);
                        //return user_task_json;
					}

	});
	} catch (error) {
		console.log(error);
		
	}	
};

var reqToAPI = function(d,u,p,callback) {
	var data = JSON.stringify(d);
	var result="";
    u=u.split(':');
	var postOptions = {host: u[0], port: u[1], path: p, method: 'POST',	headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)}};
	var postRequest = http.request(postOptions,function(resp){
		resp.setEncoding('utf-8');
		resp.on('data', function(chunk) {result+=chunk;});
		resp.on('end', function(chunk) {callback(null,resp.statusCode,result);});
	});
	postRequest.on('error',function(e){callback(e.message,400,null);});
	postRequest.write(data);
	postRequest.end();
};

var tasktypes={'Design':['TestCase','Design','Create Testcase'],
'Update':['TestCase','Design','Update Testcase'],
'UpdateSuite' :['TestSuite','Execution','Execute'],
'Execute' :['TestSuite','Execution','Execute'],
'Scrape':['Scrape','Design','Create Screen'],
'Append':['Scrape','Design','Create Screen'],
'Compare':['Scrape','Design','Create Screen'],
'Add':['Scrape','Design','Create Screen'],
'Map':['Scrape','Design','Create Screen']}

function next_function(resultobj,cb,data){


    var result=resultobj.result;
    var prjId = resultobj.prjId[0].projectId;
    //var prjName = resultobj.prjId[0].projectName;
	console.log(resultobj);
	var jsonData=JSON.parse(result);
	var alltasks=jsonData[0].data;
	var user_task_json=[];
	var taskDetails={};
	
	
	async.forEachSeries(alltasks,function(a,maincallback){
		var task_json={'appType':'Web',
			'projectId':'',
			'releaseId':'',
			'cycleId':'',
			'screenId':'',
			'screenName':'',
			'testCaseId':'',
			'testCaseName':'',
			'assignedTestScenarioIds':'',
			'testSuiteId':'',
			'testSuiteName':'',
			'taskDetails':[]

};
	taskDetails={'taskName':'',
	'taskDescription':'',
	'taskType':'',//module nd scenario - Execute  screen & TC- Design
	'subTaskType':'',
	'subTaskId':'',
	'assignedTo':'',
	'reviewer':'',
	'startDate':'',
	'expectedEndDate':'',
	'status':'assigned'
	};
	var t=a.row[0];
		var abc=tasktypes[t.task];
        if (t.task=='Execute'){
            task_json.releaseId=t.release;
            task_json.cycleId=t.cycle;
        }
        taskDetails.taskName=abc[2];
		taskDetails.subTaskType=abc[0];
		taskDetails.taskType=abc[1];
		taskDetails.assignedTo=t.assignedTo;
		taskDetails.reviewer=t.reviewer;
		taskDetails.subTaskId=t.taskID;
		taskDetails.taskDescription=t.details;
		var parent=t.parent.substring(1, t.parent.length-1).split(",");
		var parent_length=parent.length;
        task_json.projectId=parent[0];
		
		if (parent_length>=2){
			task_json.testSuiteId=parent[1];
			if(parent_length>=4){
				task_json.screenId=parent[3];

			}if(parent_length==5){
				task_json.testCaseId=parent[4];

			}	
				create_ice.getAllNames(parent,function(err,data){
					if(err){

					}else{
						task_json.testSuiteName=data.modulename;
						task_json.screenName=data.screenname;
						task_json.testCaseName=data.testcasename;
                        //task_json.assignedTestScenarioIds=data.assignedTestScenarioIds;
						task_json.taskDetails.push(taskDetails);
						user_task_json.push(task_json);
						console.log(user_task_json);
						fs.writeFileSync('assets_mindmap/task_json.json',JSON.stringify(user_task_json),'utf8');
						maincallback();

					}

					

				});

			
		}
		// task_json.taskDetails=taskDetails;
		
		// user_task_json.push(task_json);
	
		
	},function(maincallback){
        // if(err){
        //     return "fail";
        // }else{
            cb(null,user_task_json);      
        // }
    });
    //return user_task_json;
	
}
