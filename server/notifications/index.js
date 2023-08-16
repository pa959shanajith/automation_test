const utils = require('../lib/utils');
const generator = require('./generator');
const email = require('./email');
const logger = require('../../logger');
const notfEvents = ["test", "report", "userUpdate", "schedule", "iceAssign", "projectAssign", "forgotPassword", "unlockAccount", "taskWorkFlow","verifyUser",'welcomenewuser'];
const channels = {};
const preferences = {};

module.exports.initalize = async () => {
	const fnName = "initalizeNotification";
	const inputs = {
		action: "list",
		filter: "active"
	};
	const chList = await utils.fetchData(inputs, "admin/getNotificationChannels", fnName);
	if (chList == "fail") return logger.error("Failed to initialize notification module");
	chList.forEach((chConf)=> {
		const chType = chConf.channel;
		// return // remove this
		if (!channels[chType]) {
			if (chType == "email") channels[chType] = new email(chConf);
			//else if (chType == "otherChannelType") channels[chType] = otherChannelType;
		}
	});
	for (let ev of notfEvents) {
		preferences[ev] = {
			"email": true,
			"otherChannelType": false
		};
	}
};

module.exports.test = async (channel, data, conf) => {
	if (!notfEvents.includes("test")) {
		logger.error("Unable to send notification for Event: '"+event+"', No such event exists.")
		return {error: { msg: "Notification event "+event+" not found", code: "UNKNOWN_EVENT"}};
	}
	if (channel == "email") {
		const mailer = new email(conf);
		data.url = mailer.opts.appurl;
		const { error, msg, receivers } = await generator.getPayload(channel, "test", data);
		if (error) return error;
		const res = await mailer.send(msg, receivers);
		mailer.destroy();
		return res.error && res || res[0];
	} else {
		logger.error("Unable to send test notification over "+channel+", Channel is not supported.")
		return {error: { msg: "Notification channel "+channel+" not supported", code: "UNKNOWN_CHANNEL"}};
	}
}

module.exports.notify = async (event, data, channel) => {
	if (!notfEvents.includes(event)) {
		logger.error("Unable to send notification for Event: '"+event+"', No such event exists.")
		return {error: { msg: "Notification event "+event+" not found", code: "UNKNOWN_EVENT"}};
	}
	if (channel && !channels[channel]) {
		logger.error("Unable to send notification over "+channel+", Channel is not supported.")
		return {error: { msg: "Notification channel "+channel+" not supported", code: "UNKNOWN_CHANNEL"}};
	}
	let targetChannels = (channel)? [channel] : Object.keys(channels);
	if (targetChannels.length === 0) {
		logger.error("Unable to send notifications, No Channels are configured/enabled.")
		return {error: { msg: "Notification channel not available", code: "NO_CHANNEL"}};
	}
	for(let idx = 0; idx<targetChannels.length; idx++){
		let ch = targetChannels[idx]
		// Consider preferences i.e. Only send over channels which have enabled notifications event.
		if (!preferences[event][ch]) return false;
		data.url = channels[ch].opts.appurl;
		const { error, msg, receivers } = await generator.getPayload(ch, event, data);
		// Check recipient level preferences here.
		if (error) {
			logger.error("Unable to send notification over "+ch+", Error Code: "+error.code)
			return error;
		}
		try {
			channels[ch].send(msg, receivers);
		} catch (e) {
			logger.error("Error occured while sending "+ch+" notification, Error: "+e);
			return {error: { msg: "Error occured while sending "+ch+" notification", code: "SEND_ERROR"}};
		}
	}
};

module.exports.update = async (action, name, channel, provider) => {
	const fnName = "updateNotification";
	if (["disable", "update"].includes(action) && channels[channel]) {
		await channels[channel].destroy();
		delete channels[channel];
	}
	if (["enable", "create", "update"].includes(action)) {
		const inputs = {
			channel, name, action: "specific"
		};
		const chConf = await utils.fetchData(inputs, "admin/getNotificationChannels", fnName);
		if (chConf === "fail") return logger.error(`Error occurred in ${fnName}: Failed to start ${channel} notification module`);
		else if (chConf.length === 0) return logger.error(`Error occurred in ${fnName}: Unable to find configuration details for ${name}`);
		if (channel === "email") channels[channel] = new email(chConf[0]);
		//else if (channel == "otherChannelType") channels[channel] = otherChannelType;
	}
};


// UI notifications
module.exports.broadcast = {
	to: [],
	notifyMsg: "",
	isRead: false
};
