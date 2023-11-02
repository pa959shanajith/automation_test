const validator = require('validator');
const logger = require('../../logger');
const utils = require('../lib/utils');
const path = require('path')
const companyLogo1 = "/static/imgs/companyLogo.png"
const companyLogo = "/static/imgs/ftr-avo-logo.png";
const productLogo = "/static/imgs/logo.png";
const generateEmailPayload = {};

module.exports.getPayload = async (channel, event, data) => {
	let payloadGenerator;
	if (channel == "email") payloadGenerator = await generateEmailPayload[event];
	if (!payloadGenerator) return {error: { msg: "Notification event "+event+" not found", code: "UNKNOWN_EVENT"}};
	try {
		return payloadGenerator(data);
	} catch (e) {
		const err = {error: { msg: "Error while generating payload data", code: "PAYLOAD_ERROR"}};
		logger.error(err.msg + ". Error: %s", e);
		return err;
	}
};

generateEmailPayload.test = async data => {
	const msg = {
		'subject': 'Avo Assure: Test Email',
		'template': 'test',
		'context': {
			'companyLogo': data.url + companyLogo,
			'productLogo': data.url + productLogo
		}
	};
	return {
		error: null,
		msg,
		receivers: [data.recipient]
	};
};

generateEmailPayload.report = async data => {
	const fnName = 'generateEmailPayload'
	let recv = {};
	const username = data.user && data.user.invokingusername || '';	
	const execNode = (data.scenarioFlag) ? "scenarios" : "modules"
	const apiType = (data.scenarioFlag) ? "onScenariosExecute" : "onModulesExecute"
	const subj = msgTitle = 'Below modules have been executed successfully.';
	var inputs = {
		"fetchby": "testsuiteid",
		"id": data.testsuite[0].testsuiteid,
		"nodetype": execNode,
		"actiontype": '5',
		"invokerid": data.user.invokinguser
	}

	if (data.recieverEmailAddress) {
		const emails = data.recieverEmailAddress.split(',');
		for (email of emails) {
			recv[email] = -1;
		}
	}
	else {
		result = await getReceivers(inputs, data.testsuite[0].scenarioIds[0], apiType)
		recv = result['emails']

		for(var email in recv){
			if (!validator.isEmail(email)){
				delete recv[email]
				logger.error(email + ' is not a valid email, notification can not be sent to this address')
			}
		}
		if (!recv || Object.keys(recv).length == 0){
			return { error: { msg: "User does not have a valid email address", code: "INVALID_RECIPIENT"} }
		}
		let prioirtyRecv = Object.fromEntries(Object.entries(recv).filter(([k,v])=> v == '1'))
		if (Object.keys(prioirtyRecv).length > 0){
			recv = Object.assign({},prioirtyRecv,Object.fromEntries(Object.entries(recv).filter(([k,v])=> v == '-1')))
		} 
	}

	data.testsuite.forEach((testSuiteDetails) => {
		testSuiteDetails.reportData.forEach((reportDataItem) => {
			if (reportDataItem.reportid.length > 0) {
				reportDataItem.url = data.url + '/viewReports?reportID=' + reportDataItem.reportid;
				reportDataItem.projectName = testSuiteDetails.projectname;
				reportDataItem.testsuiteName = testSuiteDetails.testsuitename;
			}

			if (reportDataItem.status.toLowerCase() == "pass") reportDataItem.pass = true;
			else if (reportDataItem.status.toLowerCase() == "fail") reportDataItem.fail = true;
			else if (reportDataItem.status.toLowerCase() == "terminate") reportDataItem.terminate = true;
			else if (reportDataItem.status.toLowerCase() == "incomplete") reportDataItem.incomplete = true;
			else if (reportDataItem.status.toLowerCase() == "skipped") reportDataItem.skipped = true;
		})

	})

	// let fStatus = 'fail';
	// if (data.suiteStatus == 'pass') fStatus = 'pass';
	// else if (data.status !== undefined) fStatus = data.status.toLowerCase();
	// else {
	// 	const userTerm = data.reportData.map(r => r.terminated);
	// 	if (userTerm.includes("user")) fStatus = "userterminate";
	// 	else if (userTerm.includes("program")) fStatus = "terminate";
	// }
	// let subj = msgTitle = 'Execution of ' + data.testsuitename;
	// if (fStatus === 'pass') {
	// 	subj = 'Execution of ' + data.testsuitename + ' completed';
	// 	msgTitle = subj + ' successfully.';
	// } else if (fStatus === 'userterminate') {
	// 	subj = 'Execution of ' + data.testsuitename + ' terminated';
	// 	msgTitle = 'Execution of ' + data.testsuitename + ' failed. Reason: Manually terminated by user.';
	// } else if (fStatus === 'terminate') {
	// 	subj = 'Execution of ' + data.testsuitename + ' failed';
	// 	msgTitle = subj + '. Reason: Terminated by program.';
	// } else if (fStatus === 'skipped') {
	// 	subj = 'Execution of ' + data.testsuitename + ' skipped';
	// 	msgTitle = 'Execution of ' + data.testsuitename + ' is skipped.';
	// } else {
	// 	subj = 'Execution of ' + data.testsuitename + ' failed';
	// 	msgTitle = subj + '.';
	// }

	const msg = {
		'subject': subj,
		'template': 'report',
		'context': {
			'companyLogo': data.url + companyLogo,
			'productLogo': data.url + productLogo,
			'status': data.suiteStatus,
			'msgTitle': msgTitle,
			'suiteName': data.testsuitename,
			'projectName': data.projectname,
			'releaseName': data.releaseid,
			'cycleName': data.cyclename,
			'reports': data.testsuite,
			'profileName': data.profileName,
			'executionType': data.executionType === "ACTIVE" ? "Avo Assure Client" : data.executionType === "SCHEDULE" ? "Scheduled Execution" : "Avo Assure Client",
			'startDate': new Date().getFullYear() + "-" + ("0" + (new Date().getMonth() + 1)).slice(-2) + "-" + ("0" + new Date().getDate()).slice(-2) + " " + ("0" + new Date().getHours()).slice(-2) + ":" + ("0" + new Date().getMinutes()).slice(-2) + ":" + ("0" + new Date().getSeconds()).slice(-2)
		}
	};

	return {
		error: null,
		msg,
		receivers: Object.keys(recv)
	};
};

generateEmailPayload.taskWorkFlow = async data => {
	const fnName = 'taskWorkFlow'
	const ruleactionsids = {'onAssign': "1", "onUnassign": "2", "onReview": "3", "onSubmit": "4"}
	var action =  ruleactionsids[data.notifyEvent]
	var inputs = {}
	var recv = {}
	var taskupdate = ""
	var result = {}
	var mindmapid = ""
	switch (data.notifyEvent){
		case 'onUnassign':
			
			mindmapid  = data.mindmapid;
			inputs = {
				"fetchby": "mindmapbyrule",
				"id": mindmapid,
				"nodetype":data.nodetype,
				"reviewerid":data.reviewerid, 
				"assigneeid":data.asigneeid
			}
			result = await getReceivers(inputs, data.nodeid, 'onUnassign')
			taskupdate = data.assigner + " has unassigned " + result.owners.assignee + " from task " + data.taskdetails + "."
			recv = result['emails']
			break

		case 'onAssign':
			mindmapid  = data.mindmapid;
			inputs = {
				"fetchby": "mindmapbyrule",
				"id": mindmapid,
				"nodetype":data.nodetype,
				"reviewerid":data.reviewerid, 
				"assigneeid":data.asigneeid
			}
			result = await getReceivers(inputs, data.nodeid, 'onAssign')
			recv = result['emails']
			taskupdate = 'Task ' + " '" + data.taskdetails + "' has been assigned to " + result.owners.assignee + ' by ' + data.assigner + ". " + result.owners.reviewer + " has been marked as the reviewer."
			var ruleids = result['ruleids'] || []
			inputs = {
				"nodeid": data.nodeid,
				'ruleids': ruleids
			}
			var updateTasks =  await utils.fetchData(inputs, "notification/updateTaskRules", fnName)
			if (updateTasks == 'fail'){
				logger.error("Failed to update tasks with associated rules");
			}
			break
		default:
			let taskid = data.taskid
			inputs = {
				"fetchby": "task",
				"id": taskid,
				"ruleactionid": action,
				"extragroups": data.extragroups || [],
				"extrausers": data.extrausers || []
			}
			result = await getReceivers(inputs, data.nodeid, 'taskflow')
			recv = result['emails']
			switch(data.notifyEvent){
				case "onReview": 
					if (data.status == 'underReview') data.status = 'approoved'
					else data.status = 'reassigned'
					taskupdate = 'Task ' +  data.taskdetails + " has been reviewed and " + data.status + " by " + data.assignedto + "."		
					break
				case "onSubmit":
					taskupdate = 'Task ' +  data.taskdetails + " has been submitted by " + result.owners.assignee + " to " + result.owners.reviewer + " for approval."
					break
				
			}
			break
	}
	for(var email in recv){
		if (!validator.isEmail(email)){
			delete recv[email]
			logger.error(email + ' is not a valid email, notification can not be sent to this address')
		}
	}
	if (!recv || Object.keys(recv).length == 0){
		return { error: { msg: "User does not have a valid email address", code: "INVALID_RECIPIENT"} }
	}
	let subj = "Task Update"
	const msg = {
		'subject': subj,
		'template': 'task-workflow',
		'context': {
			'companyLogo': data.url + companyLogo,
			'productLogo': data.url + productLogo,
			'taskupdate': taskupdate
		}
	};
	return {
		error: null,
		msg,
		receivers: Object.keys(recv)
	};
};

const getReceivers  = async (inputs, nodeid, type) =>{
	const fnName = 'getReceivers'
	var emails = {}
	var ruleids = []
	var owners = {'assignee':'','reviewer':''}
	try{
		var ruledata =  await utils.fetchData(inputs, "notification/getNotificationConfiguration", fnName)
		if (ruledata == 'fail'){
			logger.error("Error occured while fetching notification groups")
			return {'emails':{},'ruleids':[],'owners':owners}
		}else if (ruledata.length == 0){
			logger.debug("No applicable rules found")
			return {'emails':{},'ruleids':[],'owners':owners}
		}
		for (let index in ruledata){
			var ruleinfo = ruledata[index].ruleinfo
			var taskdata = ruledata[index]
			if (type == 'taskflow' && taskdata.taskowners){
				if (taskdata.taskowners.length  == 1){
					owners.assignee =  taskdata.taskowners[0].name ;
					owners.reviewer =  taskdata.taskowners[0].name ;
					emails[taskdata.taskowners[0].email] = '-1';

				}else if(taskdata.taskowners.length == 2){
					owners.assignee = (taskdata.taskowners[0]._id == taskdata.assignedto) ? taskdata.taskowners[0].name : taskdata.taskowners[1].name;
					owners.reviewer = (taskdata.taskowners[0]._id == taskdata.reviewer) ? taskdata.taskowners[0].name : taskdata.taskowners[1].name;
					emails[taskdata.taskowners[1].email] = '-1';
					emails[taskdata.taskowners[0].email] = '-1';
				}
				else{
					logger.error("Task Owners not found")
				}
			} else if (type == 'onModulesExecute' || type == 'onScenariosExecute'){
				emails[taskdata.taskowners[0].email] = '-1';
			} else if (type == 'onAssign' || type == 'onUnassign' && taskdata.taskowners){
				if (taskdata.taskowners.length  == 1){
					owners.assignee =  taskdata.taskowners[0].name 
					owners.reviewer =  taskdata.taskowners[0].name 
					emails[taskdata.taskowners[0].email] = '-1';

				}else if(taskdata.taskowners.length == 2){
					owners.assignee = (taskdata.taskowners[0]._id == inputs.assigneeid) ? taskdata.taskowners[0].name : taskdata.taskowners[1].name;
					owners.reviewer = (taskdata.taskowners[0]._id == inputs.reviewerid) ? taskdata.taskowners[0].name : taskdata.taskowners[2].name;
					emails[taskdata.taskowners[1].email] = '-1';
					emails[taskdata.taskowners[0].email] = '-1';
				}
				else{
					logger.error("Task Owners not found")
				}	
			} 
			for(var ruleindex in ruleinfo){
				var rule = ruleinfo[ruleindex]
				if (rule && (rule.targetnodeid == 0 || type == 'onModulesExecute' || (rule.targetnodeid != 0 && nodeid ==  rule.targetnodeid ))){
					switch(type){
						case 'onAssign':
							if(rule.actiontype == '1') rule.emails.reduce((map,obj)=>{emails[obj] = rule.priority},{})
							ruleids.push(rule._id);
							break
						case 'onUnassign':
							if(rule.actiontype == '2') rule.emails.reduce((map,obj)=>{emails[obj] = rule.priority},{});
							break
						default:
							rule.emails.reduce((map,obj)=>{emails[obj] = rule.priority},{});
					}
				}
			}
				
		}
	}catch(e){
		logger.error("Error occured while fetching notification groups, Error: "+e);
		return {'emails':{},'ruleids':[],'owners':{'assignee':'','reviewer':''}}
	}
	return {'emails':emails,'ruleids':ruleids,'owners':owners}
}

generateEmailPayload.userUpdate = async data => {
	const user = data.user;
	const recv = user.email;
	if (!validator.isEmail(recv)) return { error: { msg: "User does not have a valid email address", code: "INVALID_RECIPIENT"} }
	const msg = {
		'subject': '',
		'template': 'user-update',
		'context': {
			'companyLogo': data.url + companyLogo,
			'productLogo': data.url + productLogo,
			'username': user.name,
			'name': user.firstname + ' ' + user.lastname,
			'datetime': new Date().toLocaleString(),
			'customFooter': "Please contact your Avo Assure administrator for any trouble logging in, or to disable further notifications."
		}
	};

	if (data.field === 'password') {
		msg.subject = 'Your Avo Assure password has been changed';
		msg.context.password = true;
	}

	return {
		error: null,
		msg,
		receivers: [recv]
	};
};

generateEmailPayload.schedule = async data => {};
generateEmailPayload.iceAssign = async data => {};
generateEmailPayload.projectAssign = async data => {};


generateEmailPayload.forgotPassword = async data => {
	const user = data.user;
	const recv = user.email;
	if (!validator.isEmail(recv)) return { error: { msg: "User does not have a valid email address", code: "INVALID_RECIPIENT"} }
	const msg = {
		'subject': '',
		'template': 'forgot-password',
		'context': {
			'companyLogo': data.url + companyLogo,
			'productLogo': data.url + productLogo,
			'username': user.name,
			'name': user.firstname + ' ' + user.lastname,
			"defaultpassword": user.defaultpassword,
      'domain':data.url,
      'uid':user._id,
			'datetime': new Date().toLocaleString(),
			'customFooter': "Please contact your Avo Assure administrator for any trouble logging in, or to disable further notifications."
		}
	};

	if (data.field === 'password') {
		msg.subject = 'Avo Assure Change Password Notification';
		msg.context.password = true;
	}

	return {
		error: null,
		msg,
		receivers: [recv]
	};
};

generateEmailPayload.unlockAccount = async data => {
	const user = data.user;
	const recv = user.email;
	if (!validator.isEmail(recv)) return { error: { msg: "User does not have a valid email address", code: "INVALID_RECIPIENT"} }
	const msg = {
		'subject': '',
		'template': 'unlock-account',
		'context': {
			'companyLogo': data.url + companyLogo,
			'productLogo': data.url + productLogo,
			'username': user.name,
			'name': user.firstname + ' ' + user.lastname,
			"verificationpassword": user.verificationpassword,
			'datetime': new Date().toLocaleString(),
			'customFooter': "Please contact your Avo Assure administrator for any trouble logging in, or to disable further notifications."
		}
	};

	if (data.field === 'password') {
		msg.subject = 'Your Avo Assure Unlock Account Notification';
		msg.context.password = true;
	}

	return {
		error: null,
		msg,
		receivers: [recv]
	};
};

generateEmailPayload.verifyUser = async data => {
	const user = data.user;
	const recv = user.email;
	if (!validator.isEmail(recv)) return { error: { msg: "User does not have a valid email address", code: "INVALID_RECIPIENT"} }
	const msg = {
		'subject': 'Welcome to AvoAssure',
		'template': 'verify-user',
		'context': {
			'companyLogo': data.url + companyLogo,
			'productLogo': data.url + productLogo,
			'username': user.username,
			'firstname': user.firstname,
			'lastname': user.lastname,
			'uid':user.uid,
			'domain':data.url,
			'datetime': new Date().toLocaleString(),
      'mainTemplateNotRequired':true,
			'customFooter': "Please contact your Avo Assure administrator for any trouble logging in."
		},
    // attachments:[{
    //   filename: 'AvoAutomation.png',
    //   path: path.resolve(__dirname,"../../public" + companyLogo1),
    //   cid: 'companyLogo'
    // }]
	};

	return {
		error: null,
		msg,
		receivers: [recv]
	};
};

generateEmailPayload.welcomenewuser = async data => {
	const user = data.user;
	const recv = user.email.toString();
	if (!validator.isEmail(recv)) return { error: { msg: "User does not have a valid email address", code: "INVALID_RECIPIENT"} }
	const msg = {
		'subject': 'Welcome to AvoAssure',
		'template': 'welcome-new-user',
		'context': {
			'companyLogo': data.url + companyLogo,
			'productLogo': data.url + productLogo,
			'username': user.email,
			'firstname': user.firstname,
			'lastname': user.lastname,
			'uid':user.uid,
			'domain':user.url,
			'Token': user.token,
			'datetime': new Date().toLocaleString(),
      'mainTemplateNotRequired':true,
			'customFooter': "Please contact your Avo Assure administrator for any trouble logging in."
		},
    // attachments:[{
    //   filename: 'AvoAutomation.png',
    //   path: path.resolve(__dirname,"../../public" + companyLogo1),
    //   cid: 'companyLogo'
    // }]
	};

	return {
		error: null,
		msg,
		receivers: [recv]
	};
};

function userUpdate(data) {
	return when.promise((resolve, reject) => {
		storageModule.getUser(data.userId).then((user) => {
			if (user.length == 0) {
				return reject({ error: { msg: "User with id " + data.userId + " not found" } });
			}
			user = user[0];
			if (!user.email) {
				return reject({
					error: {
						msg: "User update notification :: cannot notify user with id " + data.userId
							+ " as user email not found",
						code: ""
					}
				});
			}
			let receivers = [user.email];
			let msg = {
				"template": 'user-update',
				"subject": 'Account role changed',
				"context": {
					"userRole": data.role.charAt(0).toUpperCase() + data.role.slice(1),
					"userName": user.username
				}
			}
			return resolve({ 'msg': msg, 'receivers': receivers });
		}).otherwise((err) => {
			return reject(err);
		});
	});
}
function reportStatus(data) {
	return when.promise((resolve, reject) => {
		storageModule.getProjectIdFromFlowId(data.flowId)
			.then((projectId) => {
				return storageModule.getProjectUsers(projectId)
			}).then((projUsers) => {
				let receivers = new Set();
				if (projUsers && projUsers.users) {
					projUsers.users.forEach(({ email }) => {
						if (email) { receivers.add(email) };
					});
				}
				receivers = Array.from(receivers);
				let msg = {
					'template': 'report',
					'context': {
						'reportURL': settings.listenPath + '/reporthtml/' + data.reportId,
						'processName': data.flowName
					}
				}
				if (data.overAllStatus === 'Completed') {
					msg.context.completed = true;
					msg.subject = 'Report for ' + data.flowName + ' is now available';
				} else if (data.overAllStatus === 'Terminated-System') {
					msg.context.terminatedSystem = true;
					msg.subject = 'Execution for ' + data.flowName + ' failed';
				} else if (data.overAllStatus === 'Skipped') {
					msg.context.skipped = true;
					msg.subject = 'Execution for ' + data.flowName + ' skipped';
				} else {
					msg.context.terminatedManual = true;
					msg.subject = data.flowName + ' terminated manually';
				}
				return resolve({ 'msg': msg, 'receivers': receivers });
			}).otherwise((err) => {
				return reject(err);
			});
	});
}
function scheduleState(data) {
	return when.promise((resolve, reject) => {
		return storageModule.getScheduleDetails(data.schid).then((schedule) => {
			return storageModule.getProjectUsers(schedule[0].projectId)
				.then(projUsers => [schedule[0], projUsers])
		}).then(([schedule, projUsers]) => {
			let receivers = new Set();
			if (projUsers && projUsers.users) {
				projUsers.users.forEach(({ userId, username, email, role }) => {
					if (role === 'lead') {
						if (email) { receivers.add(email) };
						if (data.deletedBy && userId === data.deletedBy) {
							data.deletedBy = username;
						}
						if (data.cancelledBy && userId === data.cancelledBy) {
							data.cancelledBy = username;
						}
						if (data.editedBy && userId === data.editedBy) {
							data.editedBy = username;
						}
					}
				});
			}
			receivers = Array.from(receivers);
			let msg = {
				'template': 'schedule-state',
				'context': {
					processName: schedule.flowName,
					projectName: schedule.projectId,
					botName: schedule.botName,
					reason: data.reason,
				}
			}
			if (data.status === 'deleted') {
				msg.context.deleted = true;
				msg.context.deletedBy = data.deletedBy;
				msg.subject = schedule.projectId + ' | Schedule deleted';
			} else if (data.status === 'cancelled') {
				msg.context.cancelled = true;
				msg.context.cancelledBy = data.cancelledBy;
				msg.subject = schedule.projectId + ' | Schedule cancelled';
			} else if (data.status === 'edited') {
				msg.context.edited = true;
				msg.context.editedBy = data.editedBy;
				msg.subject = schedule.projectId + ' | Schedule Edited';
			}
			return resolve({ 'msg': msg, 'receivers': receivers });
		}).otherwise((err) => {
			return reject(err);
		});
	});
}

function assetAllocation(data) {
	return when.promise((resolve, reject) => {
		return storageModule.getProcessNameByIds([data.flowId]).then((d) => {
			return storageModule.getProjectIdFromFlowId(data.flowId)
				.then(projectName => [d.data[0].flowname, projectName]);
		}).then(([processName, projectName]) => {
			return storageModule.getProjectUsers(projectName)
				.then(projUsers => [processName, projectName, projUsers]);
		}).then(([processName, projectName, projUsers]) => {
			let receivers = new Set();
			if (projUsers && projUsers.users) {
				projUsers.users.forEach(({ email }) => {
					if (email) { receivers.add(email) };
				});
			}
			receivers = Array.from(receivers);
			let msg = {
				"template": "asset-state",
				"context": {
					"projectName": projectName,
					"processName": processName,
					"assetType": data.assetType,
				},
				"subject": projectName + " | " + "Change in " + data.assetType
			}
			if (data.unassignedAssets && data.unassignedAssets.length > 0) {
				msg.context.unassignedAssets = data.unassignedAssets;
			}
			if (data.assignedAssets && data.assignedAssets.length > 0) {
				msg.context.assignedAssets = data.assignedAssets;
			}
			return resolve({ 'msg': msg, 'receivers': receivers });
		}).otherwise((err) => {
			return reject(err);
		});
	});
}

function projectAllocation(data) {
	return when.promise((resolve, reject) => {
		storageModule.getUser(data.userId).then((user) => {
			if (user.length == 0) {
				return reject({ error: { msg: "User with id " + data.userId + " not found" } });
			}
			user = user[0];
			if (!user.email) {
				return reject({
					error: {
						msg: "project allocation notification :: cannot notify user with id " + data.userId
							+ " as user email not found",
						code: ""
					}
				});
			}
			let receivers = [user.email];
			let msg = {
				"template": "user-project-state",
				"context": {
					"userName": user.username,
				},
				"subject": "Change in project allocation"
			}
			if (data.assignedProjects && data.assignedProjects.length > 0) {
				msg.context.assignedProjects = data.assignedProjects;
			}
			if (data.unassignedProjects && data.unassignedProjects.length > 0) {
				msg.context.unassignedProjects = data.unassignedProjects;
			}
			return resolve({ 'msg': msg, 'receivers': receivers });
		}).otherwise((err) => {
			return reject(err);
		})
	});
}

generateEmailPayload.onExecutionStart = async data => {
	const fnName = 'generateEmailPayload';
	const subj = msgTitle = "Below modules have been successfully added to the Test Execution Queue.";
	const recv = data.recieverEmailAddress.split(",");

	data.executionData.forEach(execData => {
		execData.suiteDetails.forEach(suiteInfo => {
			suiteInfo.projectName = execData.projectName;
			suiteInfo.testsuiteName = execData.testsuiteName;
		})
	});

	const msg = {
		'subject': subj,
		'template': 'report-on-cicd-execution-starts',
		'context': {
			'companyLogo': data.url + companyLogo,
			'productLogo': data.url + productLogo,
			'status': 'Queued',
			'msgTitle': msgTitle,
			'executionType': "AvoAgent/AvoGrid",
			'profileName': data.profileName,
			'startDate': data.startDate,
			'executionData': data.executionData
		}
	};

	return {
		error: null,
		msg,
		receivers: recv
	};
};

generateEmailPayload.reportOnCICDExecution = async data => {
	const fnName = 'generateEmailPayload'
	const subj = msgTitle = 'Below modules have been executed successfully.';
	const recv = data.recieverEmailAddress.split(",");

	data.reportExecutionData.reportData.forEach(reportDataItem => {
		reportDataItem.suiteDetails.forEach(reportItem => {
			if (reportItem.reportId.length > 0) reportItem.url = data.url + "/reports/?" + "executionid="+reportItem.reportId

			if (reportItem.status.toLowerCase() == "pass") reportItem.pass = true;
			else if (reportItem.status.toLowerCase() == "fail") reportItem.fail = true;
			else if (reportItem.status.toLowerCase() == "terminate") reportItem.terminate = true;
			else if (reportItem.status.toLowerCase() == "incomplete") reportItem.incomplete = true;
			else if (reportItem.status.toLowerCase() == "skipped") reportItem.skipped = true;
		})
	});

	const msg = {
		'subject': subj,
		'template': 'report-on-cicd-execution-completes',
		'context': {
			'companyLogo': data.url + companyLogo,
			'productLogo': data.url + productLogo,
			'msgTitle': msgTitle,
			'executionType': data.executionThrough,
			'executionData': data.reportExecutionData.reportData,
			'profileName': data.profileName,
			'startDate': new Date().getFullYear() + "-" + ("0" + (new Date().getMonth() + 1)).slice(-2) + "-" + ("0" + new Date().getDate()).slice(-2) + " " + ("0" + new Date().getHours()).slice(-2) + ":" + ("0" + new Date().getMinutes()).slice(-2) + ":" + ("0" + new Date().getSeconds()).slice(-2)
		}
	};

	return {
		error: null,
		msg,
		receivers: recv
	};
};