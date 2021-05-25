const logger = require('../../logger');
const utils = require('../lib/utils');

exports.updateTaskstatus_mindmaps = async (req, res) => {
	const fnName = "updateTaskstatus_mindmaps";
	logger.info("Inside UI service: " + fnName);
	try {
		var taskid=req.body.obj;
		var inputs= {
			"id":taskid,
			"action":"updatestatus",
			"status":"inprogress"
		}
		const result = await utils.fetchData(inputs, "mindmap/manageTask", fnName);
		if (result == "fail") return res.send("fail");
		res.send("inprogress");
	} catch (error) {
		logger.error("Error occurred in taskJson/"+fnName+":", error);
		res.send("fail");
	}
};


exports.getTaskJson_mindmaps = async (req, res) => {
	const fnName = "getTaskJson_mindmaps";
	logger.info("Inside UI service: " + fnName);
	try {
		var userid = req.session.userid;
		var prjId = req.body.obj;
		const result = await utils.fetchData({userid}, "plugins/getTasksJSON", fnName);
		if (result == "fail") return res.send("fail");
		let taskJSON = next_function(result, prjId);
		res.send(taskJSON);
	} catch (error) {
		logger.error("Error occurred in taskJson/"+fnName+":", error);
		res.send("fail");
	}
};

var tasktypes = {
	'Design': ['TestCase', 'Design', 'Create Testcase'],
	'Update': ['TestCase', 'Design', 'Update Testcase'],
	'UpdateSuite': ['TestSuite', 'Execution', 'Execute'],
	'Execute': ['TestSuite', 'Execution', 'Execute'],
	'Execute Scenario with Accessibility': ['TestSuite', 'Execution', 'Execute'],
	'Execute Scenario Accessibility Only': ['TestSuite', 'Execution', 'Execute'],
	'Execute Scenario': ['TestSuite', 'Execution', 'Execute'],
	'Execute Batch': ['TestSuite', 'Execution', 'Execute'],
	'Scrape': ['Scrape', 'Design', 'Create Screen'],
	'Append': ['Scrape', 'Design', 'Create Screen'],
	'Compare': ['Scrape', 'Design', 'Create Screen'],
	'Add': ['Scrape', 'Design', 'Create Screen'],
	'Map': ['Scrape', 'Design', 'Create Screen']
};

function next_function(resultobj,projectid){
	logger.info("Inside function: next_function ");
	var result = resultobj;
	var prjId = projectid.projectId;
	var appTypes = projectid.appType;
	var projectTypes = projectid.projecttypes;
	var cycles = projectid.cycles;
	var jsonData = result;
	var alltasks = jsonData;
	var user_task_json = [];
	var batch_indx = [];
	var taskDetails = {};
	var batch_dict = {};
	var status_dict = { "inprogress": 0, "assigned": 0, "underReview": 0, "complete": 0 }
	suitename = {}
	for (var ti = 0; ti < resultobj.length; ti++) {
		try {
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
				'releaseid': '',
				'cycleid': '',
				'accessibilityParameters': []

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
				'batchTaskIDs': [],
				'status': 'assigned',
				'reuse': 'False',
				'releaseid': '',
				'cycleid': ''
			};
			var testSuiteDetails_obj = {
				"assignedTime": "",
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
			var relName = cycles[t.cycleid][1];
			var reuseflag = 'False';
			// var m = a.row[0][0];
			// if(a.row[0].length>1) reuseflag='True';
			var abc = tasktypes[t.tasktype];
			var batch_flag = false;
			//To support the task assignmnet in scenario
			if (['Execute', 'Execute Scenario', 'Execute Batch', 'Execute Scenario with Accessibility', 'Execute Scenario Accessibility Only'].includes(t.tasktype)) {
				testSuiteDetails_obj.releaseid = t.release || relName;
				testSuiteDetails_obj.cycleid = t.cycleid;
			} else {
				task_json.releaseid = t.release || relName;
				task_json.cycleid = t.cycleid;
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
			}
			task_json.projectId = t.projectid;
			var index = prjId.indexOf(t.projectid);
			var apptype = projectTypes[appTypes[index]];
			task_json.appType = apptype;
			switch (t.nodetype) {
				case "testsuites":
					testSuiteDetails_obj.testsuiteid = t.nodeid;
					testSuiteDetails_obj.testsuitename = t.name;
					suitename[t.nodeid] = t.name
					break;
				case "screens":
					//task_json.projectId=t.parent|| null;
					task_json.screenId = t.nodeid;
					task_json.screenName = t.name;
					break;
				case "testcases":
					task_json.scenarioId = t.parent || null;
					task_json.testCaseId = t.nodeid;
					task_json.testCaseName = t.name;
					break;
				case "testscenarios":
					testSuiteDetails_obj.testsuiteid = t.parent || null;
					testSuiteDetails_obj.testsuitename = suitename[t.parent] || 'testsuitename';
					task_json.scenarioId = t.nodeid;
					task_json.scenarioName = t.name;
					break;
			}
			testSuiteDetails_obj.projectidts = t.projectid;
			testSuiteDetails_obj.assignedTestScenarioIds = '';

			switch (t.tasktype) {
				case 'Design':
				case 'Update':
					taskDetails.reuse = reuseflag;
					break;
				case 'Execute':
					break;
				case 'Execute Batch':
					task_json.projectId = "";
					taskDetails.taskName = t.tasktype + ' ' + t.batchname;
					// testSuiteDetails_obj.testsuitename = m.moduleName;
					testSuiteDetails_obj.assignedTime = t.assignedTime;
					if (batch_dict[t.batchname + '_' + t.cycleid] == undefined) {
						batch_dict[t.batchname + '_' + t.cycleid] = user_task_json.length;
					} else {
						parent_index = batch_dict[t.batchname + '_' + t.cycleid];
						batch_task = user_task_json[parent_index];
						batch_task.taskDetails[0].batchTaskIDs.push(t._id);
						testSuiteDetails_obj.subTaskId = t._id;
						batch_task.testSuiteDetails.push(testSuiteDetails_obj);
						batch_flag = true;
						batch_indx = Object.values(batch_dict);
					}
					break;
				case 'Execute Scenario':
					task_json.scenarioTaskType = 'disable';
					taskDetails.taskName = "Execute Scenario " + t.name;
					break;
				case 'Execute Scenario with Accessibility':
					task_json.scenarioTaskType = 'enable';
					taskDetails.taskName = "Execute Scenario "+ t.name + " with Accessibility Testing";
					break;
				case 'Execute Scenario Accessibility Only':
					task_json.scenarioTaskType = "exclusive";
					taskDetails.taskName = "Execute Accessibility Testing for Scenario " + t.name;
					break;
				default:
					taskDetails.reuse = reuseflag;
			}
			if (t.tasktype.includes("Scenario")){
					if('accessibilityparameters' in resultobj[ti] && resultobj[ti].accessibilityparameters.length > 0){
						task_json.accessibilityParameters = resultobj[ti].accessibilityparameters;
					}
					task_json.scenarioFlag = 'True';
					task_json.assignedTestScenarioIds = [task_json.scenarioId];
					t.taskType = 'Execute Scenario';
			}
			if (!batch_flag) {
				testSuiteDetails_obj.subTaskId = t._id;
				task_json.testSuiteDetails.push(testSuiteDetails_obj);
				taskDetails.batchTaskIDs.push(t._id);
				task_json.taskDetails.push(taskDetails);
				user_task_json.push(task_json);
			}
		}
		catch (ex) {
			logger.error("Exception in the next_function: %s", ex);
		}
	}
	return user_task_json;
}