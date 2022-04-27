var uuidV4 = require('uuid-random');
var admin = require('../controllers/admin');
var create_ice = require('../controllers/create_ice');
var myserver = require('../lib/socket.js');
var logger = require('../../logger');
var utils = require('../lib/utils');
var xlsx = require('xlsx');
var path = require('path');
var fs = require('fs');
var xl = require('excel4node');
var Client = require("node-rest-client").Client;
var notification = require('../notifications/index')
var epurl = process.env.DAS_URL;
var client = new Client();

/* Convert excel file to CSV Object. */
var xlsToCSV = function (workbook, sheetname) {
	var result = [];
	var csv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetname]);
	if (csv.length > 0) {
		result.push(sheetname);
		result.push(csv);
	}
	//return result.join("\n");
	return result;
};

exports.populateProjects =  async(req, res) => {
	const fnName = "populateScenarios";
	try {
		logger.info("Inside UI service: " + fnName);
		var reqData = {
			"userid": req.session.userid,
			"allflag": true
		};
		const data = await create_ice.getProjectIDs(reqData);
		res.send(data);
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.populateScenarios = async (req, res) => {
	const fnName = "populateScenarios";
	logger.info("Inside UI service: " + fnName);
	try {
		const moduleId = req.body.moduleId;
		const inputs= {
			"moduleid":moduleId,
			"name":"populateScenarios"
		}
		const result = await utils.fetchData(inputs, "mindmap/getScenarios", fnName);
		if (result == "fail") {
			return res.send("fail");
		} else {
			return res.send(result);
		}
	} catch (exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.getProjectTypeMM = (req, res) =>{
	logger.info("Inside UI service: getProjectTypeMM");
	var inputs = req.body.projectId;
	create_ice.getProjectType(inputs, function (err, result) {
		if (err) {
			res.status(500).send('Fail');
		}
		else {
			res.status(200).send(result);
		}
	});
};

exports.populateUsers = async (req, res) => {
	const fnName = "populateUsers";
	logger.info("Inside UI service: " + fnName);
	try {
		var d = req.body;
		admin.getUsers({ prjId: d.projectId }, (err, data) => {
			res.setHeader('Content-Type', 'application/json');
			if (err)
				res.status(500).send('Fail');
			else {
				res.status(200).send(data);
			}
		});
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

const getModule = async (d) => {
	const inputs = {
		"tab":d.tab,
		"projectid":d.projectid || null,
		"moduleid":d.moduleid,
		"cycleid":d.cycId,
		"name":"getModules"
	}
	return utils.fetchData(inputs, "mindmap/getModules", "getModules");
};

exports.getModules = async (req, res) => {
	const fnName = "getModules";
	logger.info("Inside UI service: " + fnName);
	try {
		const data = await getModule(req.body);
		res.send(data);
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.reviewTask = async (req, res) => {
	const fnName = "reviewTask";
	logger.info("Inside UI service: " + fnName);
	try {
		var inputs = req.body;
		var taskID = inputs.taskId;
		var batchIds = inputs.batchIds;
		var nodeid = inputs.nodeid;
		var extraidsNotification = inputs.extrausers || []
		var extragroupsNotification = inputs.extragroups || []
		var taskdetails = inputs.taskname;
		var userId = req.session.userid;
		var username = req.session.username;
		var date = new Date();
		let inReview = false
		var status = inputs.status;
		var cur_date = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + ',' +date.toLocaleTimeString();
		var queryResult = 'pass'
		for (let index in batchIds){
			taskID = batchIds[index]
			var taskHistory = { "userid": userId, "status": "", "modifiedBy": username, "modifiedOn": cur_date };
			var inputs= {
				"id" : taskID,
				"action" : "updatetaskstatus",
				"status" : status,
				"history" : taskHistory
			};
			if (status == 'inprogress' || status == 'assigned' || status == 'reassigned' || status == 'reassign') {
				inputs.assignedto = userId;
			} else if (status == 'underReview') {
				inputs.reviewer = userId;
				inReview = true
			}
			var notificationEvent = (status == 'reassign' || status == 'underReview') ? 'onReview' : 'onSubmit'
			const result = await utils.fetchData(inputs, "mindmap/manageTask", fnName);
			if (result == "fail") {
				queryResult = 'fail'
			} else {
				let notificationData = {
					taskid: taskID,
					assignedto: username,
					assigneeid: userId,
					notifyEvent: notificationEvent,
					status: status,
					nodeid: nodeid,
					taskdetails: taskdetails,
					extrausers: extraidsNotification,
					extragroups: extragroupsNotification	
				}
				notification.notify("taskWorkFlow", notificationData,'email')
			}
		}
		if (queryResult != 'fail') return res.status(200).send('inprogress')	
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
	return res.status(500).send("fail");
};

exports.saveData = async (req, res) => {
	const fnName = "saveData";
	logger.info("Inside UI service: " + fnName);
	try {
		var tasks = [];
		var idDict = {};
		var inputs = req.body;
		var data = inputs.map;
		var vn_from="0.0";
		var assigner = req.session.username
		var vn_to="0.0";
		var prjId = inputs.prjId;
		var deletednodes = inputs.deletednode;
		var user = req.session.username;
		var userrole = req.session.activeRole;
		var userid = req.session.userid;
		var userroleid = req.session.activeRoleId;
		var flag = inputs.write;
		var removeTask = inputs.unassignTask;
		var cycId = inputs.cycId;
		var createdthrough = inputs.createdthrough || "Web";
		var assignedObj = {};
        var regg= /[~*+=?^%<>()|\\|\/]/;
		for(var key in inputs){
			if(key=='map'){
				for(var i=0;i<inputs[key].length;i++){
					if(regg.test(inputs[key][i]['name'])){
						logger.error("Error occurred in mindmap/"+fnName+": Special characters found!!");
						return res.send('fail');
					}
					if(inputs[key][i]['task']!=null){
						var map_task=inputs[key][i]['task']
						if(regg.test(map_task['batchName']) || regg.test(map_task['details']) || regg.test(map_task['task'])){
							logger.error("Error occurred in mindmap/"+fnName+": Special characters found!!");
							return res.send('fail');
						}
					}
				}
			}
		}	
		// This flag is for Save. Save and Create will now be merged.
		if (flag == 10) 
		{
			qpush=[]
			var uidx = 0, rIndex;
			// var idn_v_idc = {};
			var cycId=inputs.cycId;

			// Creating the data for running the Create Structure Query
			var qObj = { "projectid": prjId, "cycleId": cycId, "appType": "Web", "testsuiteDetails": [], "versionnumber": parseFloat(vn_from), "newversionnumber":  parseFloat(vn_to) ,"username": user, "userrole": userrole,"userid":userid,"userroleid":userroleid,"createdthrough":createdthrough ,"deletednodes":deletednodes };
			var nObj = [], tsList = [];
			data.forEach(function (e, i) {
				if (e.type == "modules") rIndex = uidx;
				if (e.task != null) delete e.task.oid;
				// idn_v_idc[e.id_n] = e.id_c;
				nObj.push({ _id:e._id||null, name: e.name,state: e.state, task: e.task, children: [],childIndex:e.childIndex });
				if (e.type == "testcases") nObj[nObj.length - 1]['pid_c'] = e._id||null;
				if (idDict[e.pid] !== undefined) nObj[idDict[e.pid]].children.push(nObj[uidx]);
				idDict[e.id] = uidx++;
			});
			nObj[rIndex].children.forEach(function (ts, i) {
				var sList = [];
				ts.children.forEach(function (s, i) {
					var tcList = [];
					s.children.forEach(function (tc, i) {
						tcList.push({ "screenid": s._id||null, "testcaseid": tc._id||null, "testcaseName": tc.name, "task": tc.task,"state":tc.state ,"childIndex":parseInt(tc.childIndex)});
						
					});
					tcList.sort((a, b) => (a.childIndex > b.childIndex) ? 1 : -1);
					sList.push({ "screenid": s._id||null, "screenName": s.name, "task": s.task, "testcaseDetails": tcList,"state":s.state,"childIndex":parseInt(s.childIndex) });
					
				});
				sList.sort((a, b) => (a.childIndex > b.childIndex) ? 1 : -1);
				tsList.push({ "testscenarioid": ts._id||null, "testscenarioName": ts.name, "tasks": ts.task, "screenDetails": sList,"state":ts.state, "childIndex":parseInt(ts.childIndex) });
				
			});
			tsList.sort((a, b) => (a.childIndex > b.childIndex) ? 1 : -1);
			qObj.testsuiteDetails = [{ "testsuiteId": nObj[rIndex]._id||null, "testsuiteName": nObj[rIndex].name, "task": nObj[rIndex].task, "testscenarioDetails": tsList,"state":nObj[rIndex].state}];
			
			create_ice.saveMindmap(qObj, function (err, result) {
				if (err) {
					res.status(500).send(err);
				} else {
					sendNotification(data, assigner)
					res.status(200).send(result);
				}
			});
		}
		else if (flag == 30) { 
			//Assign
			var tasks_insert=[];
			var tasks_update=[];
			var tasks_remove=removeTask;
			var scenarioids=new Set();
			var screenids= new Set();
			var testcaseids = new Set();
			data.forEach(function (e, i) {
				idDict[e._id] = (e._id) || null;
				e._id = idDict[e._id];
				t = e.task;
				var tsk={}
				if (e.type == 'endtoend') {
					if (t != null && e._id != null) {
						if (t._id!=null && (removeTask.includes(t._id))) return;
						tsk.tasktype=t.task
						tsk.nodetype="testsuites"
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycleid=t.cycleid
						tsk.parent=""
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startdate
						tsk.enddate=t.enddate
						tsk.assignedto=t.assignedto
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedto
						tsk.batchname=t.batchName
						tsk.status=t.status
						tsk.details=t.details
						tsk.reestimation=t.reestimation
						tsk.complexity=""
						tsk.history=[]
						tsk.projectid=prjId
						if (t._id!=null){
							tsk._id=t._id
							tasks_update.push(tsk)
						}
						else{
							tasks_insert.push(tsk)
						}
					}
				}
				else if (e.type == 'modules') {
					if (t != null && e._id != null) {
						if (t._id!=null && (removeTask.includes(t._id))) return;
						tsk.tasktype=t.task
						tsk.nodetype="testsuites"
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycleid=t.cycleid
						tsk.parent=""
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startdate
						tsk.enddate=t.enddate
						tsk.assignedto=t.assignedto
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedto
						tsk.batchname=t.batchName
						tsk.status=t.status
						tsk.details=t.details
						tsk.reestimation=t.reestimation
						tsk.complexity=""
						tsk.history=[]
						tsk.projectid=prjId
						
						
						if (t._id!=null){
							tsk._id=t._id
							tasks_update.push(tsk)
						}
						else{
							tasks_insert.push(tsk)
						}
					}
					tasks.push(tsk)
				}
				else if (e.type == 'scenarios') {					
					if (t != null && e._id != null) {
						if (t._id!=null && (removeTask.includes(t._id))) return;
						tsk.tasktype=t.task
						tsk.nodetype="testscenarios"
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycleid=t.cycleid
						tsk.parent=t.parent
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startdate
						tsk.enddate=t.enddate
						tsk.assignedto=t.assignedto
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedto
						tsk.status=t.status
						tsk.details=t.details
						tsk.reestimation=t.reestimation
						tsk.complexity=t.complexity || ""
						tsk.history=[]
						tsk.projectid=prjId
						
						if (t._id!=null){
							tsk._id=t._id
							tasks_update.push(tsk)
						}
						else{
							if(!scenarioids.has(tsk.nodeid))
								tasks_insert.push(tsk)
						}

						scenarioids.add(tsk.nodeid);
					}
					
				}
				else if (e.type == 'screens') {
					uidx++; lts = idDict[e.pid];

					if (t != null && e._id != null) {
						if (t._id!=null && (removeTask.includes(t._id))) return;
						tsk.tasktype=t.task
						tsk.nodetype=e.type
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycleid=t.cycleid
						tsk.parent=prjId
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startdate
						tsk.enddate=t.enddate
						tsk.assignedto=t.assignedto
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedto
						tsk.status=t.status
						tsk.details=t.details
						tsk.reestimation=t.reestimation
						tsk.complexity=t.complexity || ""
						tsk.history=[]
						tsk.projectid=prjId
						if (t._id != null) {
							if (cycId == t.cycleid) {
								tsk.projectid=prjId
								tsk._id=t._id
								tasks_update.push(tsk)
								
							}
						}else{
							if(!screenids.has(tsk.nodeid))
								tasks_insert.push(tsk)
						}
						screenids.add(tsk.nodeid)
					}
				}
				else if (e.type == 'testcases') {
					if (t != null && e.id != null) {
						if (t._id!=null && (removeTask.includes(t._id))) return;
						tsk.tasktype=t.task
						tsk.nodetype=e.type
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycleid=t.cycleid
						tsk.parent=t.parent
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startdate
						tsk.enddate=t.enddate
						tsk.assignedto=t.assignedto
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedto
						tsk.status=t.status
						tsk.details=t.details
						tsk.reestimation=t.reestimation
						tsk.complexity=t.complexity || ""
						tsk.history=[]
						tsk.projectid=prjId
						if (t._id != null) {
							if (cycId == t.cycleid) {
								tsk._id=t._id
								tasks_update.push(tsk)
							}
						}else{
							if(!testcaseids.has(tsk.nodeid))
								tasks_insert.push(tsk)
						}
						testcaseids.add(tsk.nodeid);
					}
				}
			});
			var inputs={
				"update": tasks_update,
				"insert": tasks_insert,
				"delete": tasks_remove,
				"action": "modify"
			}
			var args={
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			}
			logger.info("Calling DAS Service from saveData : admin/createProject_ICE");
			client.post(epurl+"mindmap/manageTask", args,
				function (data_var, response) {
					if (response.statusCode != 200 || data_var.rows == "fail") {
						logger.error("Error occurred in mindmap/manageTask from saveData Error Code : ERRDAS");
						res.send("fail");
					} else {
						var modid='fail'
						if (data_var.rows == "success"){
							modid=data[0]._id
						}
						// if (modid != 'fail') sendNotification(data, assigner)
						res.send(modid);
					}
			});
		}

		
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

function sendNotification(data, assigner){
	visited = {}
	for(let i = 0; i < data.length; i++){
		if (!data[i].task || data[i].task.details in visited) continue
		visited[data[i].task.details] = true
		var task = data[i].task;
		var assignedTasksNotification = {user: task.assignedToName, to: '/plugin', isRead: false,count: 0}
		let assignedObj = { 
			taskdetails: task.details,
			mindmapid: data[0]._id,
			nodeid: data[i]._id,
			taskid: task._id || "", 
			asigneeid: task.assignedto, 
			reviewerid: task.reviewer, 
			nodetype: data[i].type,  
			assignedto: task.assignedToName || "",
			assigner: assigner,
			assignedTasksNotification:assignedTasksNotification,
			notifyEvent:""
		}
		if (assigner == task.assignedToName) assignedObj.assigner = 'self'
		
		if ('status' in task && task.status == 'assigned' && task._id == null){
			assignedTasksNotification.notifyMsg = "Task '" + task.details + "' has been assigned by " + assigner + " to " + task.assignedToName + '.';
			assignedObj.notifyEvent =  'onAssign';
			notification.notify('taskWorkFlow', assignedObj, 'email')
		}else if('status' in task && task.status == 'unassigned') {
			assignedTasksNotification.notifyMsg = "Task '" + task.details + "' has been unassigned by " + assigner + ". ";
			assignedObj.notifyEvent = 'onUnassign';
			notification.notify('taskWorkFlow', assignedObj, 'email')
		}
		if(task.assignedToName in myserver.socketMapNotify){
			var soc = myserver.socketMapNotify[task.assignedToName];
			soc.emit("notify", assignedTasksNotification);
		}
	}
}

exports.saveEndtoEndData = function (req, res) {
	const fnName = "saveEndtoEndData";
	logger.info("Inside UI service: " + fnName);
	try {
		var nData = [], qList = [], idDict = {};
		var urlData = req.get('host').split(':');
		var inputs = req.body;
		var data = inputs.map;
		var prjId = inputs.prjId;
		var deletednodes = inputs.deletednode;
		var user = req.session.username;
		var userrole = req.session.activeRole;
		var userid = req.session.userid;
		var userroleid = req.session.activeRoleId;
		var flag = inputs.write;
		// var relId = inputs.relId;
		var cycId = inputs.cycId;
		var createdthrough=inputs.createdthrough || "Web";

		//TO support task deletion
		var removeTask = inputs.unassignTask;
		if (flag == 10) {
			var uidx = 0, rIndex;
			var vn_from = inputs.vn_from;
			var vn_to = inputs.vn_from;
			// var idn_v_idc = {};

			var qObj = { "projectid": prjId, "testsuiteDetails": [], "username": user, "userrole": userrole, "versionnumber": parseFloat(vn_from)|| 0, "newversionnumber": parseFloat(vn_to) || 0 , "userid":userid,"userroleid":userroleid ,"createdthrough":createdthrough,"deletednodes":deletednodes};
			var nObj = [], tsList = [];
			data.forEach(function (e, i) {
				if (e.type == "endtoend") rIndex = uidx; // check for normal modules
				if (e.task != null) delete e.task.oid;
				nObj.push({ projectID: e.projectID, _id: e._id || null, name: e.name, task: e.task, children: [] ,state: e.state, childIndex:e.childIndex});
				if (idDict[e.pid] !== undefined) nObj[idDict[e.pid]].children.push(nObj[uidx]);
				idDict[e.id] = uidx++;
			});

			nObj[rIndex].children.forEach(function (ts, i) {
				var sList = [];
				tsList.push({ "testscenarioid": ts._id||null, "testscenarioName": ts.name, "tasks": ts.task,"state":ts.state,"childIndex":parseInt(ts.childIndex)});
				
			});
			tsList.sort((a, b) => (a.childIndex > b.childIndex) ? 1 : -1)
			qObj.testsuiteDetails = [{ "testsuiteId": nObj[rIndex]._id||null, "testsuiteName": nObj[rIndex].name, "task": nObj[rIndex].task, "testscenarioDetails": tsList,"state":nObj[rIndex].state}];
			
			create_ice.saveMindmapE2E(qObj, function (err, data) {
				if (err) {
					res.status(500).send(err);
				} else {
					// if res.rows
					res.status(200).send(data);
				}
			});
		}
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.excelToMindmap = function (req, res) {
	const fnName = "excelToMindmap";
	logger.info("Inside UI service: " + fnName);
	try {
		var wb1 = xlsx.read(req.body.data.content, { type: 'binary' });
		if (req.body.data.flag == 'sheetname') {
			return res.status(200).send(wb1.SheetNames);
		}
		var myCSV = xlsToCSV(wb1, req.body.data.sheetname);
		var numSheets = myCSV.length / 2;
		var qObj = [];
		var err;
		if (numSheets == 0) {
			return res.status(200).send("emptySheet");
		}
		for (var k = 0; k < numSheets; k++) {
			var cSheet = myCSV[k * 2 + 1];
			var cSheetRow = cSheet.split('\n');
			var scoIdx = -1, scrIdx = -1, sctIdx = -1,modIdx=-1;
			var uniqueIndex = 0;
			cSheetRow[0].split(',').forEach(function (e, i) {
				if(i== 0 && e.toLowerCase()=="module") modIdx = i;
				if(i== 1 && e.toLowerCase()=="scenario") scoIdx = i;
				if(i== 2 && e.toLowerCase()=="screen") scrIdx = i;
				if(i== 3 && e.toLowerCase()=="script") sctIdx = i;
			});
			if (modIdx == -1 || scoIdx == -1 || scrIdx == -1 || sctIdx == -1 || cSheetRow.length < 2) {
				err = true;
				break;
			}
			var e, lastSco = -1, lastScr = -1, nodeDict = {}, scrDict = {};
			for (var i = 1; i < cSheetRow.length; i++) {
				var row = cSheetRow[i].split(',');
				if (i==1 && (row[0]=="" || row[1]=="" || row[2]=="" || row[3]=="")) {
					return res.status(200).send('valueError');
				}
				if (row.length < 3) continue;
				if (row[modIdx] !== '') {
					e = { id: uuidV4(), name: row[modIdx], type: 0 };
					qObj.push(e);
				}
				if (row[scoIdx] !== '') {
					lastSco = uniqueIndex; lastScr = -1; scrDict = {};
					e = { id: uuidV4(), name: row[scoIdx], type: 1 };
					qObj.push(e);
					nodeDict[e.id] = uniqueIndex;
					uniqueIndex++;
				}
				if (row[scrIdx] !== '' && lastSco != -1) {
					var tName = row[scrIdx];
					var lScr = qObj[lastScr];
					if (lScr === undefined || (lScr)) {
						if (scrDict[tName] === undefined) scrDict[tName] = uuidV4();
						lastScr = uniqueIndex;
						e = { id: scrDict[tName], name: tName, type: 2, uidx: lastScr };
						qObj.push(e);
						nodeDict[e.id] = uniqueIndex;
						uniqueIndex++;
					}
				}
				if (row[sctIdx] !== '' && lastScr != -1) {
					e = { id: uuidV4(), name: row[sctIdx], type: 3, uidx: lastScr };
					qObj.push(e);
					nodeDict[e.id] = uniqueIndex;
					uniqueIndex++;
				}
			}
		}
		if (err) res.status(200).send('fail');
		else res.status(200).send(qObj);
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.getScreens = async (req, res) => {
	const fnName = "getScreens";
	logger.info("Inside UI service: " + fnName);
	try {
		const projectid = req.body.projectId;
		const inputs= { projectid }
		const result = await utils.fetchData(inputs, "mindmap/getScreens", fnName);
		if (result == "fail") {
			return res.send("fail");
		} else {
			return res.send(result);
		}
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.exportToExcel = async (req, res) =>{
	const fnName = "exportToExcel";
	logger.info("Inside UI service: " + fnName);
	try {
		logger.info("Fetching Module details");
		var d = req.body;
		var excelMap = await getModule({modName:null,cycId:null,"tab":"tabCreate","projectid":d.projectid,"moduleid":d.moduleid})
		logger.info("Writing Module structure to Excel");
		var excelDirPath = path.join(__dirname, './../../output');
		var filePath = path.join(excelDirPath, 'samp234.xlsx');

		try {
			if (!fs.existsSync(excelDirPath)) fs.mkdirSync(excelDirPath); // To create directory for storing excel files if DNE.
			if (fs.existsSync(filePath)) fs.unlinkSync(path.join(filePath)); // To remove the created files
		} catch (e) {
			logger.error("Exception in mindmapService: exportToExcel: Create Directory/Remove file", e);
		}

		//create a new workbook file in current working directory
		var wb = new xl.Workbook();
		var ws = wb.addWorksheet('Sheet1');

		logger.debug(excelMap.name);

		//create the new worksheet with 10 coloumns and rows equal to number of testcases
		var curr = excelMap;

		//Sorting the positions of the child nodes according to their childindex
		for (i = 0; i < curr.children.length; i++) {
			for (j = 0; j < curr.children[i].children.length; j++) {
				//sort the testcases based on childindex
				curr.children[i].children[j].children.sort(function(a,b){
					return parseInt(a.childIndex)-parseInt(b.childIndex)});
			}
			//sort the screens based on childindex
			curr.children[i].children.sort(function(a,b){
				return parseInt(a.childIndex)-parseInt(b.childIndex)});
		}
		//sort the scenarios based on childindex
		curr.children.sort(function(a,b){
		return parseInt(a.childIndex)-parseInt(b.childIndex)});

		//Set some width for first 4 columns
		ws.column(1).setWidth(40);
		ws.column(2).setWidth(40);
		ws.column(3).setWidth(40);
		ws.column(4).setWidth(40);

		var style = wb.createStyle({
			font: {
				color: '000000',
				bold: true,
					size: 12,
				}
				});

		ws.cell(1, 1)
				.string('Module')
				.style(style);

		ws.cell(1, 2)
				.string('Scenario')
				.style(style);

		ws.cell(1, 3)
				.string('Screen')
				.style(style);

		ws.cell(1, 4)
				.string('Script')
				.style(style);

		var min_scen_idx = 1;
		var min_scr_idx = 1;
		ws.cell(2,1).string(curr.name);
		var tc_count=0;
		for (i = 0; i < curr.children.length; i++) {
			for (j = 0; j < curr.children[i].children.length; j++) {
				for (k = 0; k < curr.children[i].children[j].children.length; k++) {
					tc_count++;
					ws.cell(1 + tc_count,4).string(curr.children[i].children[j].children[k].name);
				}
				
				ws.cell(1 + min_scr_idx,3).string(curr.children[i].children[j].name);
				min_scr_idx= tc_count+1;
			}
			ws.cell( 1 + min_scen_idx,2).string(curr.children[i].name);
			min_scen_idx=tc_count+1;
		}
		//save it
		wb.write(filePath,function (err) {
			if (err) return res.send('fail');
			res.writeHead(200, {'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
			var rstream = fs.createReadStream(filePath);
			rstream.pipe(res);
		});
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}

};

/* Export data to Git repository. */
exports.exportToGit = async (req, res) => {
	const actionName = "exportToGit";
	logger.info("Inside UI service: " + actionName);
	try {
		const data = req.body;
		const gitname = data.gitconfig;
		const gitVersion = data.gitVersion;
		var gitFolderPath = data.gitFolderPath;
		const gitBranch = data.gitBranch;
		const moduleId = data.mindmapId;
		if(!gitFolderPath.startsWith("avoassuretest_artifacts")){
			gitFolderPath="avoassuretest_artifacts/"+gitFolderPath
		}
		const inputs = {
			"moduleId":moduleId,
			"userid":req.session.userid,
			"action":actionName,
			"gitname":gitname,
			"gitBranch":gitBranch,
			"gitVersion": gitVersion,
			"gitFolderPath": gitFolderPath
		};
		const module_data = await utils.fetchData(inputs, "git/exportToGit", actionName);
		return res.send(module_data);
	} catch (ex) {
		logger.error("Exception in the service exportToGit: %s", ex);
		return res.status(500).send("fail");
	}
};

exports.exportMindmap = async (req, res) => {
	const fnName = "exportMindmap";
	logger.info("Inside UI service: " + fnName);
	try {
		const mindmapId = req.body.mindmapId;
		const inputs= {
			"mindmapId": mindmapId,
			"query":"exportMindmap"
		}
		const result = await utils.fetchData(inputs, "mindmap/exportMindmap", fnName);
		if (result == "fail") {
			return res.send("fail");
		} else {
			return res.send(result);
		}
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.importMindmap = async (req, res) => {
	const fnName = "importMindmap";
	logger.info("Inside UI service: " + fnName);
	try {
		const content = req.body;
		const inputs= {
			"mindmap": content,
			"query":"importMindmap"
		}
		const result = await utils.fetchData(inputs, "mindmap/importMindmap", fnName);
		res.send(result)
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.importGitMindmap = async (req, res) => {
	const fnName = "importGitMindmap";
	logger.info("Inside UI service: " + fnName);
	try {
		const projectid = req.body.projectid;
		const gitname = req.body.gitname;
		const gitbranch = req.body.gitbranch;
		const gitversion = req.body.gitversion;
		var gitfolderpath = req.body.gitfolderpath;
		if(!gitfolderpath.startsWith("avoassuretest_artifacts")){
			gitfolderpath="avoassuretest_artifacts/"+gitfolderpath
		}
		const inputs= {
			"userid": req.session.userid,
			"roleid": req.session.activeRoleId,
			"projectid": projectid,
			"gitname": gitname,
			"gitbranch": gitbranch,
			"gitversion": gitversion,
			"gitfolderpath": gitfolderpath
		}
		const result = await utils.fetchData(inputs, "git/importGitMindmap", fnName);
		res.send(result)
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.updateNotificationConfiguration = async(req,res) => {
	const fnName = "updateNotificationConfiguration"
	logger.info("Inside UI service: " + fnName)
	try{
		const ruleinfo = req.body;
		const inputs = {
			deletedrules: ruleinfo.deletedrules,
			mindmapid: ruleinfo.mindmapid,
			taskdata: ruleinfo.taskdata,
			newrules: ruleinfo.newrules,
			priority: ruleinfo.priority,
			updatedrules: ruleinfo.updatedrules,
			otherrules: ruleinfo.otherrules,
			modifiedby: req.session.userid,
			modifiedbyrole: req.session.activeRoleId,
		};		
		const result = await utils.fetchData(inputs, "notification/updateNotificationConfiguration", fnName);
		return res.status('200').send(result);
	}catch (exception){
		logger.error("Error occurred in notifications/updateNotificationConfiguration:", exception);
		return res.status('500').send("fail");
	}
} 

exports.getNotificationConfiguration = async(req,res) => {
	const fnName = "getNotificationConfiguration"
	logger.info("Inside UI service: " + fnName)
	try{
		const info = req.body;
		const inputs = {
			fetchby: info.fetchby,
			id: info.id,
			priority: info.priority
		};		
		const result = await utils.fetchData(inputs, "notification/getNotificationConfiguration", fnName);
		return res.status('200').send(result);
	}catch (exception){
		logger.error("Error occurred in notifications/getNotificationConfiguration:", exception);
		return res.status('500').send("fail");
	}
} 

exports.getNotificationRules = async(req,res) => {
	const fnName = "getNotificationRules"
	logger.info("Inside UI service: " + fnName)
	try{
		const inputs = {};		
		const result = await utils.fetchData(inputs, "notification/getNotificationRules", fnName);
		return res.status('200').send(result);
	}catch (exception){
		logger.error("Error occurred in notifications/getNotificationRules:", exception);
		return res.status('500').send("fail");
	}
} 