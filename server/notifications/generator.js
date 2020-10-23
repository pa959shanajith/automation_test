const utils = require('../lib/utils');

const companyLogo = "/imgs/avo-logo.png";
const productLogo = "/imgs/logo.png";
const generateEmailPayload = {};

module.exports.getPayload = async (channel, event, data) => {
	let payloadGenerator;
	if (channel == "email") payloadGenerator = generateEmailPayload[event];
	if (!payloadGenerator) return {error: { msg: "Notification event "+event+" not found", code: "UNKNOWN_EVENT"}};
	return payloadGenerator(data);
};

generateEmailPayload.test = async data => {
	let msg = {
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
	// reportid
	// scenarioname
	// userid
	// url
	// viewtype
	// status
	const recv = data.modifiedby;
	let msg = {
		'template': 'report',
		'context': {
			'companyLogo': data.url + companyLogo,
			'productLogo': data.url + productLogo,
			'reportURL': data.url + '/viewreport/' + data.reportView + '/' + data.reportId,
			'processName': data.flowName
		}
	};

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
	return {
		error: null,
		msg,
		receivers: recv
	};
};

generateEmailPayload.userUpdate = async data => {};
generateEmailPayload.schedule = async data => {};
generateEmailPayload.iceAssign = async data => {};
generateEmailPayload.projectAssign = async data => {};


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