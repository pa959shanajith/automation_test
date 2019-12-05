var async = require('async');
var logger = require('../../logger');
var utils = require('../lib/utils');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.NDAC_URL;

exports.updateTaskstatus_mindmaps = function (req, res) {
	logger.info("Inside UI service: updateTaskstatus_mindmaps");
	if (utils.isSessionActive(req)) {
		try {
			var taskid=req.body.obj;
			//Mongo query needs to be written to change the task status
			var inputs= {
				"id":taskid,
				"action":"updatestatus",
				"status":"inprogress"
			}
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};

			client.post(epurl+"mindmap/manageTask", args,
			function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in mindmap/manageTask: updateTaskstatus_mindmaps, Error Code : ERRNDAC");
					res.send("fail");
				} else {
					res.send('inprogress');
				}

			})
			
		} catch (error) {
			logger.error("exception occurred in updateTaskstatus_mindmaps",error);
		}
	} else {
		res.send("Invalid Session");
	}
};


// exports.getTaskJson_mindmaps = function (req, res) {
// 	logger.info("Inside UI service: getTaskJson_mindmaps");
// 	if (utils.isSessionActive(req)) {
// 		try {
// 			//MATCH (b{assignedTo:'60f6ad0b-ce14-4cad-8345-b09c0739f3e2'})<-[r:FNTT]-(a) with b,collect (a) as set return set,b
// 			var userid = req.session.userid;
// 			var prjId=req.body.obj;
// 			var qlist_query = [{'statement': "MATCH (b{assignedTo:'" + userid + "'})<-[r:FNTT]-(a) with b,collect (a) as set return set,b"}];
// 			neo4jAPI.executeQueries(qlist_query,function(status,result){
// 				if(status!=200) {
// 					logger.info(result);
// 				}
// 				else {
// 					var resultobj = {
// 						"result": result,
// 						"prjId": prjId
// 					};
// 					next_function(resultobj, function (err, data) {
// 						if (err) {
// 							logger.error('error occurred in getTaskJson_mindmaps',err);
// 							res.send('fail');
// 						} else {
// 							res.send(data);
// 						}
// 					});
// 				}
// 			});
// 		} catch (error) {
// 			logger.error('exception in getTaskJson_mindmaps',error);
// 		}
// 	} else {
// 		res.send("Invalid Session");
// 	}
// };

exports.getTaskJson_mindmaps = function (req, res) {
	logger.info("Inside UI service: getTaskJson_mindmaps");
	if (utils.isSessionActive(req)) {
		try {
			var userid = req.session.userid;
			var prjId=req.body.obj;

			var inputs= {
				"userid":userid
			}
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};

			client.post(epurl+"plugins/getTasksJSON", args,
			function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in plugins/getModules: getTasksJSON, Error Code : ERRNDAC");
						res.send("fail");
					} else {
							taskJSON=next_function(result.rows,prjId);
							// console.log("came here");
							res.send(taskJSON);
					}
						// res.send(result.rows);
					
				} catch (ex) {
					logger.error("Exception in the service getTasksJSON: %s", ex);
				}
			});

			// var qlist_query = [{'statement': "MATCH (b{assignedTo:'" + userid + "'})<-[r:FNTT]-(a) with b,collect (a) as set return set,b"}];
			// neo4jAPI.executeQueries(qlist_query,function(status,result){
			// 	if(status!=200) {
			// 		logger.info(result);
			// 	}
			// 	else {
			// 		var resultobj = {
			// 			"result": result,
			// 			"prjId": prjId
			// 		};
					// next_function(resultobj, function (err, data) {
					// 	if (err) {
					// 		logger.error('error occurred in getTaskJson_mindmaps',err);
					// 		res.send('fail');
					// 	} else {
					// 		res.send(data);
					// 	}
					// });
				// }
			// });
		} catch (error) {
			logger.error('exception in getTaskJson_mindmaps',error);
		}
	} else {
		res.send("Invalid Session");
	}
};

var tasktypes = {
	'Design': ['TestCase', 'Design', 'Create Testcase'],
	'Update': ['TestCase', 'Design', 'Update Testcase'],
	'UpdateSuite': ['TestSuite', 'Execution', 'Execute'],
	'Execute': ['TestSuite', 'Execution', 'Execute'],
	'Execute Scenario': ['TestSuite', 'Execution', 'Execute'],
	'Execute Batch': ['TestSuite', 'Execution', 'Execute'],
	'Scrape': ['Scrape', 'Design', 'Create Screen'],
	'Append': ['Scrape', 'Design', 'Create Screen'],
	'Compare': ['Scrape', 'Design', 'Create Screen'],
	'Add': ['Scrape', 'Design', 'Create Screen'],
	'Map': ['Scrape', 'Design', 'Create Screen']
};

//This dict has to be buit run time . Query Projecttypekeywords to build this dict for one time
var projectTypes = {};

var screen_tasks=['scrape','append','compare','add','map'];


function next_function(resultobj,projectid) 
{
	logger.info("Inside function: next_function ");
	var result = resultobj;
	var prjId = projectid.projectId;
	var appTypes = projectid.appType;
	var projectTypes=projectid.projecttypes;
	var cycles=projectid.cycles;
	var jsonData = result;
	var alltasks = jsonData;
	var user_task_json = [];
	var batch_indx = [];
	var taskDetails = {};
	var batch_dict = {};
	var status_dict={"inprogress":0,"assigned":0,"underReview":0,"complete":0}
	for(var ti=0;ti<resultobj.length;ti++){
		// async.forEachSeries(alltasks, function (a, maincallback) {
		var task_json = {
			'appType': '',
			'projectId': '',
			'screenId': '',
			'screenName': '',
			'testCaseId': '',
			'versionnumber': '',
			'testCaseName': '',
			'scenarioId': '',
			'scenarioName': '',
			'assignedTestScenarioIds': [],
			'taskDetails': [],
			'testSuiteDetails': [],
			'scenarioFlag': 'False',
			'releaseid':'',
			'cycleid':''

		};
		taskDetails = {
			'taskName': '',
			'taskDescription': '',
			'taskType': '', //module nd scenario - Execute,  screen and TC- Design
			'subTaskType': '',
			'subTaskId': '',
			'assignedTo': '',
			'reviewer': '',
			'startDate': '',
			'expectedEndDate': '',
			'batchTaskIDs':[],
			'status': 'assigned',
			'reuse':'False',
			'releaseid': '',
			'cycleid':''
		};
		var testSuiteDetails_obj = {
			"assignedTime":"",
			"releaseid": "",
			"cycleid": "",
			"testsuiteid": "",
			"testsuitename": "",
			"projectidts": "",
			"assignedTestScenarioIds": []
			//"scenarioFlag": "True",
		};

		/*t refers to task node, and m refers to its respective node */
		var t = resultobj[ti];
		var relName=cycles[t.cycleid][1];
		var reuseflag='False';
		// var m = a.row[0][0];
		// if(a.row[0].length>1) reuseflag='True';
		var abc = tasktypes[t.tasktype];
		var batch_flag = false;
		//To support the task assignmnet in scenario
		if (t.tasktype == 'Execute' || t.tasktype == 'Execute Scenario' || t.tasktype == 'Execute Batch') {
			testSuiteDetails_obj.releaseid = t.release || relName;
			testSuiteDetails_obj.cycleid = t.cycleid;
		}else{
			task_json.releaseid=t.release || relName;
			task_json.cycleid=t.cycleid;
		}
		if (t.taskvn !== undefined) {
			task_json.versionnumber = t.versionnumber;
		} else {
			task_json.versionnumber = 0;
		}
		taskDetails.taskName = t.tasktype+" "+t.name;
		taskDetails.subTaskType = abc[0];
		taskDetails.taskType = abc[1];
		taskDetails.assignedTo = t.assignedto;
		taskDetails.reviewer = t.reviewer;
		taskDetails.subTaskId = t._id;
		taskDetails.taskDescription = t.details;
		taskDetails.releaseid = t.release||relName;
		taskDetails.cycleid = t.cycleid;
		if (t.status != undefined) {
			taskDetails.status = t.status;
			status_dict[t.status]++;
			logger.info(status_dict);
		}
		// var parent = t.parent.substring(1, t.parent.length - 1).split(",");
		// var parent_length = parent.length;
		task_json.projectId = t.projectid;
		var index = prjId.indexOf(t.projectid);
		var apptype=projectTypes[appTypes[index]];
		task_json.appType=apptype;
					if(t.nodetype=="testsuites")
					{
						testSuiteDetails_obj.testsuiteid=t.nodeid;
						testSuiteDetails_obj.testsuitename = t.name;
						
					}
					else if(t.nodetype=="testscenarios")
					{
						testSuiteDetails_obj.testsuiteid=t.parent|| null;
						testSuiteDetails_obj.testsuitename = 'testsuitename';
						task_json.scenarioId = t.nodeid;
						task_json.scenarioName=t.name;
					}
					else if(t.nodetype=="screens")
					{
						//task_json.projectId=t.parent|| null;
						task_json.screenId=t.nodeid;
						task_json.screenName = t.name;
					}
					else if(t.nodetype=="testcases")
					{
						task_json.scenarioId=t.parent|| null;
						task_json.testCaseId=t.nodeid;
						task_json.testCaseName = t.name;
					}
					
					testSuiteDetails_obj.projectidts = t.projectid;
					testSuiteDetails_obj.assignedTestScenarioIds = '';
					
					
					
					//Check if versioning exists
					function versioningCheck() {
						versioningEnabled = ' ';
						if (process.env.projectVersioning != "disabled")
							versioningEnabled += 'version_'+ task_json.versionnumber+ ' : ';
						return versioningEnabled;
					}

					if (t.tasktype == 'Design' || t.tasktype == 'Update') {
						// taskDetails.taskName = t.tasktype + versioningCheck() + m.testCaseName;
						taskDetails.reuse=reuseflag;
						// task_json.testCaseName = m.testCaseName;
					} else if (t.tasktype == 'Execute') {
						// taskDetails.taskName = t.tasktype + versioningCheck()  + m.moduleName;
						// testSuiteDetails_obj.testsuitename = m.moduleName;
					} else if (t.tasktype == 'Execute Batch') {
						task_json.projectId = "";
						taskDetails.taskName = t.tasktype + versioningCheck() + t.batchname;
						// testSuiteDetails_obj.testsuitename = m.moduleName;
						testSuiteDetails_obj.assignedTime = t.assignedTime;
						if (batch_dict[t.batchName+'_'+t.cycleid] == undefined) {
							batch_dict[t.batchName+'_'+t.cycleid] = user_task_json.length;
						} else {
							parent_index = batch_dict[t.batchName+'_'+t.cycleid];
							batch_task = user_task_json[parent_index];
							batch_task.taskDetails[0].batchTaskIDs.push(t.taskID);
							testSuiteDetails_obj.subTaskId = t.taskID;
							batch_task.testSuiteDetails.push(testSuiteDetails_obj);
							batch_flag = true;
							batch_indx = Object.values(batch_dict);
						}
					} else if (t.tasktype == 'Execute Scenario') {
						task_json.scenarioFlag = 'True';
						task_json.assignedTestScenarioIds = [task_json.scenarioId];
						// taskDetails.taskName = t.tasktype + versioningCheck() + m.testScenarioName;
						// task_json.scenarioName = m.testScenarioName;
						//testSuiteDetails_obj.assignedTestScenarioIds=[task_json.scenarioId];
					} else {
						// taskDetails.taskName = t.tasktype + versioningCheck() + m.screenName;
						// task_json.screenName = m.screenName;
						taskDetails.reuse=reuseflag;
					}
					//task_json.assignedTestScenarioIds=data.assignedTestScenarioIds;
					if (!batch_flag) {
						testSuiteDetails_obj.subTaskId = t.taskID;
						task_json.testSuiteDetails.push(testSuiteDetails_obj);
						taskDetails.batchTaskIDs.push(t.taskID);
						task_json.taskDetails.push(taskDetails);
						user_task_json.push(task_json);
					}
				// }	
			// }	
		// }
		// task_json.testSuiteDetails.push(testSuiteDetails_obj);
		// taskDetails.batchTaskIDs.push(t.taskID);
		// task_json.taskDetails.push(taskDetails);
		// user_task_json.push(task_json);
	}		
	return user_task_json;	
}