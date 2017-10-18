var create_ice = require('../controllers/create_ice');
var async = require('async');
var neo4jAPI = require('../controllers/neo4jAPI');

exports.getTaskJson_mindmaps = function (obj, cb, data) {
	try {
		//query={'statement':"MATCH (n:TASKS) WHERE n.assignedTo='"+obj.userid+"' RETURN n"};
		/*Neo4j query changed to return both the task node and it's associated module/screen/scenario/testcase node */
		var qlist_query = [{'statement': "MATCH (a)-[r:FNTT {id:b.nodeID}]-(b) where b.assignedTo='" + obj.userid + "' return a,b"}];
		neo4jAPI.executeQueries(qlist_query,function(status,result){
			if(status!=200) {
				console.log(result);
			}
			else {
				var resultobj = {
					"result": result,
					"prjId": obj.prjId
				};
				next_function(resultobj, function (err, data) {
					if (err) {
						cb(null, err);
					} else {
						cb(null, data);
					}
				});
			}
		});
	} catch (error) {
		console.log(error);
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

var projectTypes = {
	'41e1c61b-fb17-4eda-a3a7-e1d7578ea166': 'Desktop',
	'3e7d1a83-3add-4ed1-86f4-9ca80fea5758': 'Webservice',
	'396d8a74-aeb3-41a7-a943-4bfe8b915c6f': 'MobileApp',
	'f7d09f53-4c11-4e14-a37c-5001d8b4042d': 'DesktopJava',
	'e9ed5428-64e4-45e0-b4f1-77e1803ab4fe': 'Web',
	'b2a208a5-8c9d-4a7f-b522-0df14993dbd2': 'MobileWeb',
	'07181740-f420-4ea1-bf2b-5219d6535fb5': 'Generic',
	'258afbfd-088c-445f-b270-5014e61ba4e2': 'Mainframe',
	'1fd77879-4dbb-416a-a46d-126d27fee2c7': 'SAP'
};

function next_function(resultobj, cb, data) {
	var result = resultobj.result;
	var prjId = resultobj.prjId.projectId;
	var appTypes = resultobj.prjId.appType;
	try {
		var jsonData = result;
		var alltasks = jsonData[0].data;
		var user_task_json = [];
		var taskDetails = {};
		var batch_dict = {};
		async.forEachSeries(alltasks, function (a, maincallback) {
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
				'scenarioFlag': 'False'
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
				'status': 'assigned'
			};
			var testSuiteDetails_obj = {
				"releaseid": "",
				"cycleid": "",
				"testsuiteid": "",
				"testsuitename": "",
				"projectidts": "",
				"assignedTestScenarioIds": []
				//"scenarioFlag": "True",
			};
			/*t refers to task node, and m refers to its respective node */
			var t = a.row[1];
			var m = a.row[0];
			var abc = tasktypes[t.task];
			var batch_flag = false;
			//To support the task assignmnet in scenario
			if (t.task == 'Execute' || t.task == 'Execute Scenario' || t.task == 'Execute Batch') {
				testSuiteDetails_obj.releaseid = t.release;
				testSuiteDetails_obj.cycleid = t.cycle;
			}
			if (t.taskvn !== undefined) {
				task_json.versionnumber = t.taskvn;
			} else {
				task_json.versionnumber = 0;
			}
			taskDetails.taskName = abc[2];
			taskDetails.subTaskType = abc[0];
			taskDetails.taskType = abc[1];
			taskDetails.assignedTo = t.assignedTo;
			taskDetails.reviewer = t.reviewer;
			taskDetails.subTaskId = t.taskID;
			taskDetails.taskDescription = t.details;
			if (t.status != undefined) {
				taskDetails.status = t.status;
			}
			var parent = t.parent.substring(1, t.parent.length - 1).split(",");
			var parent_length = parent.length;
			task_json.projectId = parent[0];
			if (parent_length >= 2) {
				//Checking if the user is assigned to that project before showing the task to the user
				if (prjId != undefined && prjId.length > 0 && prjId.indexOf(parent[0]) > -1) {
					var index = prjId.indexOf(parent[0]);
					task_json.appType = projectTypes[appTypes[index]];
					testSuiteDetails_obj.testsuiteid = parent[1];
					if (parent_length >= 3) {
						task_json.scenarioId = parent[2];
					}
					if (parent_length >= 4) {
						task_json.screenId = parent[3];

					}
					if (parent_length == 5) {
						task_json.testCaseId = parent[4];
						//task_json.scenarioId=parent[2];
					}
					testSuiteDetails_obj.testsuitename = 'modulename';
					testSuiteDetails_obj.projectidts = parent[0];
					testSuiteDetails_obj.assignedTestScenarioIds = 'data.testscenarioIds[0]';
					task_json.screenName = 'screenname';
					task_json.scenarioName = 'scenarioname';
					task_json.testCaseName = 'testcasename';
					if (t.task == 'Design' || t.task == 'Update') {
						taskDetails.taskName = t.task + ' version_'+ task_json.versionnumber+ ' ' + m.testCaseName;
						task_json.testCaseName = m.testCaseName;
					} else if (t.task == 'Execute') {
						taskDetails.taskName = t.task + ' version_'+ task_json.versionnumber+' ' + m.moduleName;
						testSuiteDetails_obj.testsuitename = m.moduleName;
					} else if (t.task == 'Execute Batch') {
						task_json.projectId = "";
						taskDetails.taskName = t.task + ' version_'+ task_json.versionnumber+ ' ' + t.batchName;
						testSuiteDetails_obj.testsuitename = m.moduleName;
						if (batch_dict[t.batchName] == undefined) {
							batch_dict[t.batchName] = user_task_json.length;
						} else {
							parent_index = batch_dict[t.batchName];
							batch_task = user_task_json[parent_index];
							batch_task.testSuiteDetails.push(testSuiteDetails_obj);
							batch_flag = true;
						}
					} else if (t.task == 'Execute Scenario') {
						task_json.scenarioFlag = 'True';
						task_json.assignedTestScenarioIds = [task_json.scenarioId];
						taskDetails.taskName = t.task + ' version_'+ task_json.versionnumber+ ' ' + m.testScenarioName;
						task_json.scenarioName = m.testScenarioName;
						//testSuiteDetails_obj.assignedTestScenarioIds=[task_json.scenarioId];
					} else {
						taskDetails.taskName = t.task +' version_'+ task_json.versionnumber+ ' ' + m.screenName;
						task_json.screenName = m.screenName;
					}
					//task_json.assignedTestScenarioIds=data.assignedTestScenarioIds;
					if (!batch_flag) {
						task_json.testSuiteDetails.push(testSuiteDetails_obj);
						task_json.taskDetails.push(taskDetails);
						user_task_json.push(task_json);
					}
					if (t.task == 'Execute Scenario') {
						query = {
							'statement': "MATCH (n:MODULES{moduleID:'" + m.moduleID + "'}) RETURN n.moduleName"
						};
						query1 = {
							'statement': "MATCH (n:MODULES_ENDTOEND{moduleID:'" + m.moduleID + "'}) RETURN n.moduleName"
						};
						var qlist_query = [query];
						neo4jAPI.executeQueries(qlist_query,function(status,result){
							if(status!=200) {
								console.log(result);
								maincallback();
							}
							else {
								try {
									result1 = JSON.parse(result);
									testSuiteDetails_obj.testsuitename = result1[0].data[0].row[0];
									maincallback();
								} catch (ex) {
									qlist_query = [query1];
									neo4jAPI.executeQueries(qlist_query,function(status,result){
										if(status!=200) {
											console.log(result);
											maincallback();
										}
										else {
											try {
												result1 = JSON.parse(result);
												testSuiteDetails_obj.testsuitename = result1[0].data[0].row[0];
												maincallback();
											} catch (ex) {
												maincallback();
											}
										}
									});
								}
							}
						});
					} else {
						maincallback();
					}
				} else {
					maincallback();
				}
			}
		}, function (maincallback) {
			cb(null, user_task_json);
		});
	} catch (ex) {
		console.log(ex);
	}
}
