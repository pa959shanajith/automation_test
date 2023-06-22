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
var notification = require('../notifications/index');
var epurl = process.env.DAS_URL;
var client = new Client();
const configpath= require('../config/options');
const archiver = require('archiver');
const zlib = require('zlib');
const unzipper = require('unzipper');
const { Readable } = require('stream');


let headers
module.exports.setReq = async (req) =>
{
	headers=req;
}

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
		"cycleid":d.cycId || null,
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
			inputs.host = headers.headers.host;
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
						if (modid != 'fail' && configpath.enableNotification.assignTabMindmap) sendNotification(data, assigner)
						res.send(modid);
					}
			});
		}

		
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

async function sendNotification(data, assigner){
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
			await notification.notify('taskWorkFlow', assignedObj, 'email')
		}else if('status' in task && task.status == 'unassigned') {
			assignedTasksNotification.notifyMsg = "Task '" + task.details + "' has been unassigned by " + assigner + ". ";
			assignedObj.notifyEvent = 'onUnassign';
			await notification.notify('taskWorkFlow', assignedObj, 'email')
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

exports.excelToMindmap = function (req, res){
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
		
			var cSheet = myCSV[0 * 2 + 1];
			var cSheetRow = cSheet.split('\n');
			excelrows=[]
			cSheetRow[0].split(',').forEach(function (e, i) {
				if(i== 0 && e.toLowerCase()!="module") {return res.status(200).send("fail");}
				if(i== 1 && e.toLowerCase()!="scenario"){return res.status(200).send("fail");}
				if(i== 2 && e.toLowerCase()!="screen"){return res.status(200).send("fail");}
				if(i== 3 && e.toLowerCase()!="script"){return res.status(200).send("fail");}
				if (i==4){return res.status(200).send("fail");}
			});
			for (let i = 0; i < cSheetRow.length; i++) {
				row=cSheetRow[i].split(",")
				excelrows.push(row)


			}
			var scenarios=[]
			var modules=[]
			var dataRows=[]
			var p_count=[]
			var q_count=[]
			for (let p = 0; p < excelrows.length; p++) {
				if (p==0){continue}
				if (p == excelrows.length - 1){continue}
				var data={"name":"","testscenarios":[]}
				var data1={"name":"","screens":[]}
				var data2={"name":"","testcases":[]} 
				for (var q = 0; q < excelrows[p].length; q++) {
					if (p_count.includes (p) && q_count.includes(q)){
						continue
					}
					if ( q == 0 ){
						if(excelrows[p][q] !==''){
							if (modules.includes(excelrows[p][q])){
								return res.send("duplicateMod");
							}
							else{modules.push(excelrows[p][q])
								data["name"]=excelrows[p][q]}
						}
						else{
							ts = q+1
							
							if(excelrows[p][ts] !==''){
								if (scenarios.includes(excelrows[p][ts])){
									return res.send("duplicateSce");
								}
								scenarios.push(excelrows[p][ts])
								p_count.push(p)
								q_count.push(ts)
								dataRows[dataRows.length -1]["testscenarios"].splice(dataRows[dataRows.length -1]["testscenarios"].length -0,0,{"name":excelrows[p][ts],"screens":[]})
								ts=ts+1
								if(excelrows[p][ts] !==''){
									p_count.push(p)
									q_count.push(ts)
								dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].splice(dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -0,0,{"name":excelrows[p][ts],"testcases":[]})
								
								ts=ts+1
								if(excelrows[p][ts] !==''){
									p_count.push(p)
									q_count.push(ts)
								dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].splice(dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].length -0,0,excelrows[p][ts])
										
								}}
								else{
									p_count.push(p)
									q_count.push(ts)
									ts=ts+1
									if(excelrows[p][ts] !==''){
										p_count.push(p)
										q_count.push(ts)
									dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].splice(dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].length -0,0,excelrows[p][ts])		
									}}}
								else{
									p_count.push(p)
									q_count.push(ts)
									ts=ts+1
									if(excelrows[p][ts] !==''){
										p_count.push(p)
										q_count.push(ts)
									dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].splice(dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -0,0,{"name":excelrows[p][ts],"testcases":[]})
									ts=ts+1
									if(excelrows[p][ts] !==''){
										p_count.push(p)
										q_count.push(ts)
									dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].splice(dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].length -0,0,excelrows[p][ts])
											
									}else{p_count.push(p)
										q_count.push(ts)}}
									else{
										p_count.push(p)
										q_count.push(ts)
										ts=ts+1
										if(excelrows[p][ts] !==''){
											p_count.push(p)
											q_count.push(ts)
										dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].splice(dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].length -0,0,excelrows[p][ts])		
										}}
									
								}
							
						}
						
					}
					else if ( q == 1 ){
						if(excelrows[p][q] !==''){
							if (scenarios.includes(excelrows[p][q])){
								return res.send("duplicateSce");
							}
							scenarios.push(excelrows[p][q])
							data1["name"]=excelrows[p][q]
						}
						else{
							ts = q+1
							p_count.push(p)
							q_count.push(ts)
							
							if(excelrows[p][ts] !==''){
								p_count.push(p)
								q_count.push(ts)
							dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].splice(dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -0,0,{"name":excelrows[p][ts],"testcases":[]})
							
							ts=ts+1
							if(excelrows[p][ts] !==''){
								p_count.push(p)
								q_count.push(ts)
							dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].splice(dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].length -0,0,excelrows[p][ts])
									
							}
						}else{
								p_count.push(p)
								q_count.push(ts)
								ts=ts+1
							if(excelrows[p][ts] !==''){
								p_count.push(p)
								q_count.push(ts)
							dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].splice(dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].length -0,0,excelrows[p][ts])
									
							}
							else{p_count.push(p)
								q_count.push(ts)
								dataRows.push(data)
							}}
							
						}
						
					}
					else if ( q == 2 ){
						if(excelrows[p][q] !==''){
							data2["name"]=excelrows[p][q]
						}
						else{
							
							ts = q+1							
							if(excelrows[p][ts] !==''){
								p_count.push(p)
								q_count.push(ts)
								dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].splice(dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"][dataRows[dataRows.length -1]["testscenarios"][dataRows[dataRows.length -1]["testscenarios"].length -1]["screens"].length -1]["testcases"].length -0,0,excelrows[p][ts])
										
								}
							else{
								p_count.push(p)
								q_count.push(ts)
								data["testscenarios"].push(data1)
								dataRows.push(data)
							}
						}
						
					}
					else if (excelrows[p][q] !=='' && q == 3 ){
						
						data2["testcases"].push(excelrows[p][q])
						data1["screens"].push(data2)
						data["testscenarios"].push(data1)
						dataRows.push(data)
					} 
					else{
						data1["screens"].push(data2)
						data["testscenarios"].push(data1)
						dataRows.push(data)
					}
					
				}
			
			}
		let userid =  req.session.userid;
		let impPath = path.join(__dirname,'../../assets/ImportMindmap')
		if (!fs.existsSync(impPath)) {
			fs.mkdirSync(impPath);
		  }
		importFolderPath= impPath+"/"+"excel"
		if (!fs.existsSync(importFolderPath)) {
			fs.mkdirSync(importFolderPath);
		}
		let importPath=importFolderPath+"/"+userid+".json"
		if (fs.existsSync(importPath)) {
			fs.unlinkSync(importPath)
		}		
		writedata=fs.writeFile(importPath, JSON.stringify(dataRows), (err) => {
			if (err) {
				res.status(500).send("fail")
			}
			else{
				res.send(result)
			}
		})

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
		var excelMap=[]
		var excelMM = await getModule({modName:null,cycId:null,"tab":"tabCreate","projectid":d.projectid,"moduleid":d.moduleid})
		if(excelMM.constructor === Array) {
			excelMap=excelMM			
		 }else{
			excelMap.push(excelMM)}
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
		for (k = 0; k < curr.length; k++) {
			for (i = 0; i < curr[k].children.length; i++) {
				for (j = 0; j < curr[k].children[i].children.length; j++) {
					//sort the testcases based on childindex
					curr[k].children[i].children[j].children.sort(function(a,b){
						return parseInt(a.childIndex)-parseInt(b.childIndex)});
				}
				//sort the screens based on childindex
				curr[k].children[i].children.sort(function(a,b){
					return parseInt(a.childIndex)-parseInt(b.childIndex)});
		}
	}
		//sort the scenarios based on childindex
		for (k = 0; k < curr.length; k++) {
		curr[k].children.sort(function(a,b){
		return parseInt(a.childIndex)-parseInt(b.childIndex)});}

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
		var min_mm_idx =1
		var min_scen_idx = 1;
		var min_scr_idx = 1;
		var tc_count=0;
		for (l = 0; l < curr.length; l++) {
			if (curr[l].children.length>0){		
			for (i = 0; i < curr[l].children.length; i++) {
				if (curr[l].children[i].children.length>0){
				for (j = 0; j < curr[l].children[i].children.length; j++) {
					if(curr[l].children[i].children[j].children.length>0){
					for (k = 0; k < curr[l].children[i].children[j].children.length; k++) {
						tc_count++;
						ws.cell(1 + tc_count,4).string(curr[l].children[i].children[j].children[k].name);
					}
					
					ws.cell(1 + min_scr_idx,3).string(curr[l].children[i].children[j].name);
					min_scr_idx= tc_count+1;}
					else{
						ws.cell(1 + min_scr_idx,3).string(curr[l].children[i].children[j].name);
						tc_count++
						min_scr_idx++
					}
				}
				ws.cell( 1 + min_scen_idx,2).string(curr[l].children[i].name);
				min_scen_idx=tc_count+1;}
				else{
					ws.cell( 1 + min_scen_idx,2).string(curr[l].children[i].name);
					tc_count++
					min_scen_idx++
					min_scr_idx++
				}
		}
		ws.cell(1+min_mm_idx,1).string(curr[l].name);
		min_mm_idx= tc_count+1;}
		else{
			ws.cell(1+min_mm_idx,1).string(curr[l].name);
			tc_count++
			min_mm_idx++
			min_scen_idx++
			min_scr_idx++
		}
		
		
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

const removeDir = function(path) {
	if (fs.existsSync(path)) {
		const files = fs.readdirSync(path);
		if (files.length > 0) {
			files.forEach(function(filename) {
				if (fs.statSync(path + "/" + filename).isDirectory()) {
					removeDir(path + "/" + filename);
				} else {
					fs.unlinkSync(path + "/" + filename);
				}
			});
			fs.rmdirSync(path);
		} else {
			fs.rmdirSync(path);
		}
	} else {
		logger.error("Directory path not found.")
	}
}
exports.exportMindmap = async (req, res) => {
	const fnName = "exportMindmap";
	logger.info("Inside UI service: " + fnName);
	try {
		
		const mindmapId = req.body.mindmapId["moduleid"];
		const exportProjAppType=req.body.mindmapId["exportProjAppType"];
		const exportedFilePath = path.join(__dirname,'../../assets/ExportMindmap');
		if (!fs.existsSync(exportedFilePath)) {
			fs.mkdirSync(exportedFilePath);
		}
		var userid=req.session.userid;
		const inputs= {
			"mindmapId": mindmapId,
			"query":"exportMindmap",
			"userid":userid,
			"exportProjAppType":exportProjAppType
		}
		const result = await utils.fetchData(inputs, "mindmap/exportMindmap", fnName);
		if (result == "fail") {
			return res.send("fail");
		} else {
			let zip_path = exportedFilePath+'/'+userid+'.zip'
			const archive = archiver('zip', { zlib: { level: 9 }});
			const stream = fs.createWriteStream(zip_path);
			stream.on('close', ()=>{
				removeDir(exportedFilePath+'/'+userid);
				// res.writeHead(200, {
				// 	'Content-Type' : 'application/zip',
				// });
				var filestream = fs.createReadStream(zip_path);
				filestream.pipe(res);
			})
			archive.directory(exportedFilePath+'/'+userid, false).pipe(stream);
			archive.finalize();
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
		var userid = req.session.userid;
		var userroleid = req.session.activeRoleId;
		const inputs= {
			"projectid": content["projid"],			
			"query":"importMindmap",						
			"userid":userid,
			"role":userroleid
		}
		const result = await utils.fetchData(inputs, "mindmap/importMindmap", fnName);
		if (result == "fail") {
			return res.send("fail");
		} else {			
			let impPath = path.join(__dirname,'../../assets/ImportMindmap/'+userid)
			if (fs.existsSync(impPath)) {				
				await fs.rmdirSync(impPath, { recursive: true});
			}
			return res.send(result);
		}
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.writeZipFileServer = async(req,res) => {
	const fnName = "writeZipFileServer";
	logger.info("Inside UI service: " + fnName);
	try {
		let userid =  req.session.userid;	
			
		// Check if request contains a ZIP file
		if (req.file && path.extname(req.file.originalname) === '.zip') {
			// Create target directory for extracted files
			const importZip=path.join(__dirname, '../../assets/ImportMindmap');
			if (!fs.existsSync(importZip)) {				
				fs.mkdirSync(importZip);
			}
			const targetDir = path.join(__dirname, '../../assets/ImportMindmap/'+userid);
			if (fs.existsSync(targetDir)) {				
				await fs.rmdirSync(targetDir,{ recursive: true});
			}
			if (!fs.existsSync(targetDir)) {				
			  fs.mkdirSync(targetDir);
			}
			const bufferStream = new Readable();
			bufferStream.push(req.file.buffer);
			bufferStream.push(null);
			// Extract files from ZIP
			const unzipStream = bufferStream.pipe(unzipper.Parse());
			await unzipStream.on('entry', (entry) => {
			  const filePath = path.join(targetDir, entry.path);
			  if (!entry.path.startsWith('__MACOSX/') && !entry.path.endsWith('/')) {
				entry.pipe(fs.createWriteStream(filePath));
			  } else {
				entry.autodrain();
			  }
			});
			await unzipStream.on('close', async () => {
				let jsonResponse = {msg : 'Files extracted successfully',appType:''};
				let jsonModpath=targetDir +'\\'+ 'Modules.json';
				let jsontscpath=targetDir +'\\'+ 'Testscenarios.json';
				let jsonscrpath=targetDir +'\\'+ 'screens.json';
				let jsontcpath=targetDir +'\\'+ 'Testcases.json';
				let jsondobpath=targetDir +'\\'+ 'Dataobjects.json';
				if (fs.existsSync(jsonModpath) && fs.existsSync(jsontscpath) && fs.existsSync(jsonscrpath) && fs.existsSync(jsontcpath) ) {
					fs.readFile(jsontscpath, 'utf8', (err, data) => {
						if (err) throw err;
						if (data === ""){data = []}
						else{
						let jsonTscData = JSON.parse(data);
						if(!Array.isArray(jsonTscData)){
							return res.status(400).send('Invalid file format');}}
					});
					fs.readFile(jsondobpath, 'utf8', (err, data) => {
						 if (err) throw err;
						 if (data === ""){data = []}
						 else{
						let jsonDobData = JSON.parse(data);
						if(!Array.isArray(jsonDobData) && !""){
							return res.status(400).send('Invalid file format');}}
					});
					fs.readFile(jsonscrpath, 'utf8', (err, data) => {
						if (err) throw err;
						if (data === ""){data = []}
						else{
						let jsonScrData =JSON.parse(data);
						if(!Array.isArray(jsonScrData)){
							return res.status(400).send('Invalid file format');}}
					});
					fs.readFile(jsontcpath, 'utf8', (err, data) => {
						 if (err) throw err;
						 if (data === ""){data = []}
						 else{
						let jsonTcData = JSON.parse(data);
						if(!Array.isArray(jsonTcData)){
							return res.status(400).send('Invalid file format');}}
					});
					fs.readFile(jsonModpath, 'utf8', (err, data) => {
						if (err) throw err;
						if (data === ""){return res.status(400).send('No ModuleData');}
						else{
						let jsonData = JSON.parse(data);
						if(Array.isArray(jsonData) && jsonData.length>0){
							jsonResponse.msg = 'Files extracted successfully';
							jsonResponse.appType = jsonData[0].appType ? jsonData[0].appType: '';
							res.status(200).send(jsonResponse);
						}
						else{
							return res.status(400).send('Invalid file format');
						}}
						
					});
				
				}else{
					return res.status(400).send('Invalid file format');
				}
				 
			  	// res.status(200).send(getJsonResponse);
			});
		  } else {
			// If no ZIP file is present, send error response
			res.status(400).send('Invalid file format');
		  }
		
	} catch (error) {
		logger.error("Error occurred in mindmap/"+fnName+":", error);
		return res.status(500).send("fail");
	}
}



exports.writeFileServer = async (req, res) => {
	const fnName = "writeFileServer";
	logger.info("Inside UI service: " + fnName);
	try {
		let data = req.body;
		let userid=req.session.userid;
		let importFolderJPath = path.join(__dirname,'../../assets/ImportMindmap');
		let importJsonPath = path.join(__dirname,'../../assets/ImportMindmap')+"/"+"json";
		let importPath=importJsonPath +"/"+userid+".json"		
		if (data.status=="start" && data.type=="json"){						
			if (!fs.existsSync(importFolderJPath)) {
				fs.mkdirSync(importFolderJPath);
			}
			if (!fs.existsSync(importJsonPath)) {
				fs.mkdirSync(importJsonPath);
			}
			if (fs.existsSync(importPath)) {
				fs.unlinkSync(importPath)
			  }
			fs.appendFile(importPath,"[", (err) => { 
				if(err) { 
				res.status(500).send('Fail')}
				else{
				res.send(result) 
				}})
		}
		else if (data.status=="stop"){
			fs.appendFile(importPath,"]", (err) => { 
				if(err) { 
				res.status(500).send('Fail')}
				else{
				res.send(result)
				}})
		}
		else if (data.status=="first"){
			fs.appendFile(importPath, JSON.stringify(data), (err) => { 
				if(err) { 
				res.status(500).send('Fail')}
				else{
				res.send(result) 
				}})
		}
		else {			
			fs.appendFile(importPath,",", (err) => {
			if(err) { 
			res.status(500).send('Fail')}
			else{
			
				fs.appendFile(importPath, JSON.stringify(data), (err) => {  
					if(err) { 
					res.status(500).send('Fail')}
					else{
					res.send(result) 
					}})
			}})
		
		}
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.gitToMindmap = async (req, res) => {
	const fnName = "gitToMindmap";
	logger.info("Inside UI service: " + fnName);
	try {
		const content = req.body;
		const inputs= {
			"mindmap": content,
			"query":"gitToMindmap"
		}
		const result = await utils.fetchData(inputs, "mindmap/gitToMindmap", fnName);
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

exports.deleteScenario = async(req,res) => {
	const fnName = "deleteScenario"
	logger.info("Inside UI service: " + fnName)
	try{
		const inputs = {};
		console.log(req.body);		
		const result = await utils.fetchData(req.body, "mindmap/deleteScenario", fnName);
		return res.status('200').send(result);
	}catch (exception){
		logger.error("Error occurred in mindmaps/deleteScenario:", exception);
		return res.status('500').send("fail");
	}
}
exports.deleteScenarioETE = async(req,res) => {
	const fnName = "deleteScenarioETE"
	logger.info("Inside UI service: " + fnName)
	try{
		const inputs = {};
		console.log(req.body);		
		const result = await utils.fetchData(req.body, "mindmap/deleteScenarioETE", fnName);
		return res.status('200').send(result);
	}catch (exception){
		logger.error("Error occurred in mindmaps/deleteScenarioETE:", exception);
		return res.status('500').send("fail");
	}
}
exports.exportToProject = async (req, res) => {
	const fnName = "exportToProject";
	logger.info("Inside UI service: " + fnName);
	try {
		const mindmapId = req.body.mindmapId["moduleid"];
		const projectId=req.body.mindmapId["projectid"]
		var userid = req.session.userid;
		var userroleid = req.session.activeRoleId
		const inputs= {
			"mindmapId": mindmapId,
			"query":"exportToProject",
			"userid":userid,
			"role":userroleid,
			"projectId":projectId
		}
		const result = await utils.fetchData(inputs, "mindmap/exportToProject", fnName);
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

exports.exportToMMSkel = async (req, res) => {
	const fnName = "exportToMMSkel";
	logger.info("Inside UI service: " + fnName);
	try {
		const inputs= {
			"tab":req.body.data.tab,
		"projectid":req.body.data.projectid,
		"moduleid":req.body.data.moduleid,
		"cycleid":null,
		"name":"getModules"
		}
		var data=[]
		var output = await getModule(inputs);
		if (output == "fail") {
			return res.send("fail");
		} else {	
		if(output.constructor === Array) {
			data=output			
		 }else{
			data.push(output)} 
			mindmapStructure=[]
			for (i = 0; i < data.length; i++) {
				var module={"name":"","testscenarios":[]}
				for (j = 0; j < data[i].children.length; j++) {
					var scenario={"name":"","screens":[]}
					for (k = 0; k < data[i].children[j].children.length; k++) {
						var screen={"name":"","testcases":[]}
						for (l = 0; l < data[i].children[j].children[k].children.length; l++) {
							screen["testcases"].push(data[i].children[j].children[k].children[l].name)

						}
						screen["name"]=data[i].children[j].children[k].name
						scenario["screens"].push(screen)
					}
					scenario["name"]=data[i].children[j].name
					module["testscenarios"].push(scenario)
				}
				module["name"]=data[i].name
				
				mindmapStructure.push(module)

			}
			result=mindmapStructure
			return res.send(result);
		}
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};
exports.jsonToMindmap = async (req, res) => {
	const fnName = "jsonToMindmap";
	logger.info("Inside UI service: " + fnName);
	try {
		var importproj = req.body["mindmapId"]["importproj"]
		var importtype=req.body["mindmapId"]["type"]		
		var userid = req.session.userid;
		var userroleid = req.session.activeRoleId;
		const inputs= {
			"importproj":importproj,
			"userid":userid,
			"role":userroleid,
			"importtype":importtype,
		}
		const result = await utils.fetchData(inputs, "mindmap/jsonToMindmap", fnName);
		if (result == "fail") {
			return res.send("fail");
		} else {
			let impPath = path.join(__dirname,'../../assets/ImportMindmap/'+importtype+"/"+userid+".json")
			if (fs.existsSync(impPath)) {
				fs.unlinkSync(impPath)
			}
			return res.send(result);
		}
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};
exports.dropTempExpImpColl = async () => {
	logger.info("Inside UI service dropTempExpImpColl");
    const fnName= "dropTempExpImpColl"
	const inputs = { "query": "dropTempExpImpColl" };
	const result = await utils.fetchData(inputs, "mindmap/dropTempExpImpColl");
    if (result == "fail") logger.error( fnName + " : Error occured while deleting Temporary collections");
    else logger.info( fnName + " :Temporary collections got deleted successfully");
}