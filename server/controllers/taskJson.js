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
			var obj=req.body.obj;
			//Mongo query needs to be written to change the task status
			res.send('inprogress');
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
var projectTypes = {
	'5da865d4f87fdec084ae4982': 'Desktop',
	'5da865d4f87fdec084ae498a': 'Webservice',
	'5da865d4f87fdec084ae4984': 'MobileApp',
	'5da865d4f87fdec084ae4986': 'OEBS',
	'5da865d4f87fdec084ae4989': 'Web',
	'5da865d4f87fdec084ae4985': 'MobileWeb',
	'5da865d4f87fdec084ae4981': 'Generic',
	'5da865d4f87fdec084ae4983': 'Mainframe',
	'5da865d4f87fdec084ae4987': 'SAP',
	'5da865d4f87fdec084ae4988':'System'
};

var screen_tasks=['scrape','append','compare','add','map'];

// function next_function(resultobj, cb, data) {
// 	logger.info("Inside function: next_function ");
// 	var result = resultobj.result;
// 	var prjId = resultobj.prjId.projectId;
// 	var appTypes = resultobj.prjId.appType;
// 	try {
// 		var jsonData = result;
// 		var alltasks = jsonData[0].data;
// 		var user_task_json = [];
// 		var batch_indx = [];
// 		var taskDetails = {};
// 		var batch_dict = {};
// 		var status_dict={"inprogress":0,"assigned":0,"review":0,"complete":0}
// 		async.forEachSeries(alltasks, function (a, maincallback) {
// 			var task_json = {
// 				'appType': '',
// 				'projectId': '',
// 				'screenId': '',
// 				'screenName': '',
// 				'testCaseId': '',
// 				'versionnumber': '',
// 				'testCaseName': '',
// 				'scenarioId': '',
// 				'scenarioName': '',
// 				'assignedTestScenarioIds': [],
// 				'taskDetails': [],
// 				'testSuiteDetails': [],
// 				'scenarioFlag': 'False',
// 				'releaseid':'',
// 				'cycleid':''

// 			};
// 			taskDetails = {
// 				'taskName': '',
// 				'taskDescription': '',
// 				'taskType': '', //module nd scenario - Execute,  screen and TC- Design
// 				'subTaskType': '',
// 				'subTaskId': '',
// 				'assignedTo': '',
// 				'reviewer': '',
// 				'startDate': '',
// 				'expectedEndDate': '',
// 				'batchTaskIDs':[],
// 				'status': 'assigned',
// 				'reuse':'False',
// 				'releaseid': '',
// 				'cycleid':''
// 			};
// 			var testSuiteDetails_obj = {
// 				"assignedTime":"",
// 				"releaseid": "",
// 				"cycleid": "",
// 				"testsuiteid": "",
// 				"testsuitename": "",
// 				"projectidts": "",
// 				"assignedTestScenarioIds": []
// 				//"scenarioFlag": "True",
// 			};
// 			/*t refers to task node, and m refers to its respective node */
// 			var t = a.row[1];
// 			var reuseflag='False';
// 			var m = a.row[0][0];
// 			if(a.row[0].length>1) reuseflag='True';
// 			var abc = tasktypes[t.task];
// 			var batch_flag = false;
// 			//To support the task assignmnet in scenario
// 			if (t.task == 'Execute' || t.task == 'Execute Scenario' || t.task == 'Execute Batch') {
// 				testSuiteDetails_obj.releaseid = t.release;
// 				testSuiteDetails_obj.cycleid = t.cycle;
// 			}else{
// 				task_json.releaseid=t.release;
// 				task_json.cycleid=t.cycle;
// 			}
// 			if (t.taskvn !== undefined) {
// 				task_json.versionnumber = t.taskvn;
// 			} else {
// 				task_json.versionnumber = 0;
// 			}
// 			taskDetails.taskName = abc[2];
// 			taskDetails.subTaskType = abc[0];
// 			taskDetails.taskType = abc[1];
// 			taskDetails.assignedTo = t.assignedTo;
// 			taskDetails.reviewer = t.reviewer;
// 			taskDetails.subTaskId = t.taskID;
// 			taskDetails.taskDescription = t.details;
// 			taskDetails.releaseid = t.release;
// 			taskDetails.cycleid = t.cycle;
// 			if (t.status != undefined) {
// 				taskDetails.status = t.status;
// 				status_dict[t.status]++;
// 				logger.info(status_dict);
// 			}
// 			var parent = t.parent.substring(1, t.parent.length - 1).split(",");
// 			var parent_length = parent.length;
// 			task_json.projectId = parent[0];
// 			if (parent_length >= 2) {
// 				//Checking if the user is assigned to that project before showing the task to the user
// 				if (prjId != undefined && prjId.length > 0 && prjId.indexOf(parent[0]) > -1) {
// 					var index = prjId.indexOf(parent[0]);
// 					var apptype=projectTypes[appTypes[index]];
// 					if(!(screen_tasks.indexOf(t.task.toLowerCase())>-1 && apptype=='Mainframe')){
// 						task_json.appType = apptype;
						
// 						testSuiteDetails_obj.testsuiteid = parent[1];
// 						if (parent_length >= 3) {
// 							task_json.scenarioId = parent[2];
// 						}
// 						if (parent_length >= 4) {
// 							task_json.screenId = parent[3];

// 						}
// 						if (parent_length == 5) {
// 							task_json.testCaseId = parent[4];
// 							//task_json.scenarioId=parent[2];
// 						}
// 						testSuiteDetails_obj.testsuitename = 'modulename';
// 						testSuiteDetails_obj.projectidts = parent[0];
// 						testSuiteDetails_obj.assignedTestScenarioIds = '';
						
// 						task_json.screenName = 'screenname';
// 						task_json.scenarioName = 'scenarioname';
// 						task_json.testCaseName = 'testcasename';
// 						//Check if versioning exists
// 						function versioningCheck() {
// 							versioningEnabled = ' ';
// 							if (process.env.projectVersioning != "disabled")
// 								versioningEnabled += 'version_'+ task_json.versionnumber+ ' : ';
// 							return versioningEnabled;
// 						}

// 						if (t.task == 'Design' || t.task == 'Update') {
// 							taskDetails.taskName = t.task + versioningCheck() + m.testCaseName;
// 							taskDetails.reuse=reuseflag;
// 							task_json.testCaseName = m.testCaseName;
// 						} else if (t.task == 'Execute') {
// 							taskDetails.taskName = t.task + versioningCheck()  + m.moduleName;
// 							testSuiteDetails_obj.testsuitename = m.moduleName;
// 						} else if (t.task == 'Execute Batch') {
// 							task_json.projectId = "";
// 							taskDetails.taskName = t.task + versioningCheck() + t.batchName;
// 							testSuiteDetails_obj.testsuitename = m.moduleName;
// 							testSuiteDetails_obj.assignedTime = t.assignedTime;
// 							if (batch_dict[t.batchName+'_'+t.cycle] == undefined) {
// 								batch_dict[t.batchName+'_'+t.cycle] = user_task_json.length;
// 							} else {
// 								parent_index = batch_dict[t.batchName+'_'+t.cycle];
// 								batch_task = user_task_json[parent_index];
// 								batch_task.taskDetails[0].batchTaskIDs.push(t.taskID);
// 								testSuiteDetails_obj.subTaskId = t.taskID;
// 								batch_task.testSuiteDetails.push(testSuiteDetails_obj);
// 								batch_flag = true;
// 								batch_indx = Object.values(batch_dict);
// 							}
// 						} else if (t.task == 'Execute Scenario') {
// 							task_json.scenarioFlag = 'True';
// 							task_json.assignedTestScenarioIds = [task_json.scenarioId];
// 							taskDetails.taskName = t.task + versioningCheck() + m.testScenarioName;
// 							task_json.scenarioName = m.testScenarioName;
// 							//testSuiteDetails_obj.assignedTestScenarioIds=[task_json.scenarioId];
// 						} else {
// 							taskDetails.taskName = t.task + versioningCheck() + m.screenName;
// 							task_json.screenName = m.screenName;
// 							taskDetails.reuse=reuseflag;
// 						}
// 						//task_json.assignedTestScenarioIds=data.assignedTestScenarioIds;
// 						if (!batch_flag) {
// 							testSuiteDetails_obj.subTaskId = t.taskID;
// 							task_json.testSuiteDetails.push(testSuiteDetails_obj);
// 							taskDetails.batchTaskIDs.push(t.taskID);
// 							task_json.taskDetails.push(taskDetails);
// 							user_task_json.push(task_json);
// 						}
// 						if (t.task == 'Execute Scenario') {
// 							query = {
// 								'statement': "MATCH (n:MODULES{moduleID:'" + m.moduleID + "'}) RETURN n.moduleName"
// 							};
// 							query1 = {
// 								'statement': "MATCH (n:MODULES_ENDTOEND{moduleID:'" + m.moduleID + "'}) RETURN n.moduleName"
// 							};
// 							var qlist_query = [query];
// 							neo4jAPI.executeQueries(qlist_query,function(status,result){
// 								if(status!=200) {
// 									logger.info(result);
// 									maincallback();
// 								}
// 								else {
									
// 										var result1 = result;
// 										if(result1[0].data.length >0 && result1[0].data[0].row[0] != undefined){
// 											testSuiteDetails_obj.testsuitename = result1[0].data[0].row[0];
// 											maincallback();
// 										}else{
// 											qlist_query = [query1];
// 											neo4jAPI.executeQueries(qlist_query,function(status,result){
// 											if(status!=200) {
// 												logger.info(result);
// 												maincallback();
// 											}
// 											else {
// 												result1 = result;
// 												if(result1[0].data.length >0 && result1[0].data[0].row[0] != undefined){
// 													testSuiteDetails_obj.testsuitename = result1[0].data[0].row[0];
// 												}
// 												maincallback();
// 											}
// 										});
// 										}
										
										
// 									} 
// 							});
// 						} else {
// 							maincallback();
// 						}
// 					}else{
// 						maincallback();
// 					}
// 				} else {
// 					maincallback();
// 				}
// 			}
// 		}, function (maincallback) {
// 			if(batch_indx.length>0){
// 				for(i=0;i<batch_indx.length;i++){
// 					var indx=batch_indx[i];
// 					var batchmodules=user_task_json[indx].testSuiteDetails.sort(function(a,b){
// 							return a.assignedTime-b.assignedTime;
// 						});
// 					user_task_json[indx].testSuiteDetails=batchmodules;
// 				}
// 			}
// 			cb(null, user_task_json);
// 		});
// 	} catch (ex) {
// 		logger.error('exception in next_function',ex);
// 		cb(null, user_task_json);
// 	}
// }

function next_function(resultobj,projectid) 
{
	logger.info("Inside function: next_function ");
	var result = resultobj;
	var prjId = projectid.projectId;
	var appTypes = projectid.appType;
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
		var relName=cycles[t.cycle][1];
		var reuseflag='False';
		// var m = a.row[0][0];
		// if(a.row[0].length>1) reuseflag='True';
		var abc = tasktypes[t.tasktype];
		var batch_flag = false;
		//To support the task assignmnet in scenario
		if (t.tasktype == 'Execute' || t.tasktype == 'Execute Scenario' || t.tasktype == 'Execute Batch') {
			testSuiteDetails_obj.releaseid = t.release || relName;
			testSuiteDetails_obj.cycleid = t.cycle;
		}else{
			task_json.releaseid=t.release || '';
			task_json.cycleid=t.cycle;
		}
		if (t.taskvn !== undefined) {
			task_json.versionnumber = t.versionnumber;
		} else {
			task_json.versionnumber = 0;
		}
		taskDetails.taskName = abc[2]+" "+t.name;
		taskDetails.subTaskType = abc[0];
		taskDetails.taskType = abc[1];
		taskDetails.assignedTo = t.assignedto;
		taskDetails.reviewer = t.reviewer;
		taskDetails.subTaskId = t._id;
		taskDetails.taskDescription = t.details;
		taskDetails.releaseid = t.release||relName;
		taskDetails.cycleid = t.cycle;
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
		
				// if(!(screen_tasks.indexOf(t.tasktype.toLowerCase())>-1 && apptype=='Mainframe')){
				// 	task_json.appType = apptype;
		// parent_length=1;
		// if (parent_length >= 2) {
			//Checking if the user is assigned to that project before showing the task to the user
			// if (prjId != undefined && prjId.length > 0 && prjId.indexOf(parent[0]) > -1) {
				// var index = prjId.indexOf(parent[0]);
				// var apptype=projectTypes[appTypes[index]];
		
				// if(!(screen_tasks.indexOf(t.tasktype.toLowerCase())>-1 && apptype=='Mainframe')){
				// 	task_json.appType = apptype;
					
					// testSuiteDetails_obj.testsuiteid = parent[1];
					// if (parent_length >= 3) {
					// 	task_json.scenarioId = parent[2];
					// }
					// if (parent_length >= 4) {
					// 	task_json.screenId = parent[3];

					// }
					// if (parent_length == 5) {
					// 	task_json.testCaseId = parent[4];
					// 	//task_json.scenarioId=parent[2];
					// }
					if(t.nodetype=="testsuites")
					{
						testSuiteDetails_obj.testsuiteid=t.nodeid;
						testSuiteDetails_obj.testsuitename = t.name;
						
					}
					else if(t.nodetype=="testscenarios")
					{
						testSuiteDetails_obj.testsuiteid=t.parent|| null;
						task_json.scenarioId = t.nodeid;
						task_json.scenarioName=t.name;
					}
					else if(t.nodetype=="screens")
					{
						task_json.projectId=t.parent|| null;
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
						if (batch_dict[t.batchName+'_'+t.cycle] == undefined) {
							batch_dict[t.batchName+'_'+t.cycle] = user_task_json.length;
						} else {
							parent_index = batch_dict[t.batchName+'_'+t.cycle];
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