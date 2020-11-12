const bcrypt = require('bcryptjs');
const logger = require('../../logger');
const myserver = require('../../server');
const cache = require('./cache');
const redisServer = require('./redisSocketHandler');
const taskflow = require('../config/options').strictTaskWorkflow;
const epurl = process.env.DAS_URL;
const Client = require("node-rest-client").Client;
const client = new Client();


const getChannelNum_cb = (channel,cb) => {
	redisServer.redisPubICE.pubsub('numsub', channel, function(err, redisres) {
		if (redisres[1] > 0) cb(true);
		else cb(false);
	});
};

const getChannelNum = async (...channel) => {
	const redisres = await redisServer.redisPubICE.pubsubPromise('numsub', ...channel);
	return redisres.filter((e,i) => (i%2===1));
};

module.exports.channelStatus = async (name) => {
	var num = [0,0];
	try {
		num = await getChannelNum('ICE1_normal_' + name, 'ICE1_scheduling_' + name);
	} finally {
		return { normal: (num[0] > 0), schedule: (num[1] > 0) }
	}
};

module.exports.getSocketList = async (toFetch) => {
	var fetchQuery;
	var connectusers = [];
	if (toFetch == "ICE") fetchQuery = "ICE1_*";
	else if (toFetch == undefined || toFetch == "default") fetchQuery = "ICE1_normal_*";
	else if (toFetch == "schedule") fetchQuery = "ICE1_scheduling_*";
	else if (toFetch == "notify") fetchQuery = "notify_*";
	const redisres = await redisServer.redisPubICE.pubsubPromise('channels', fetchQuery);
	if (toFetch != "ICE") {
		connectusers = redisres.map(e => e.split('_').slice(2).join('_'));
	} else {
		for (const rri of redisres) {
			const ed = rri.split('_');
			const mode = ed[1];
			const user = ed.slice(2).join('_');
			redisServer.redisSubServer.subscribe('ICE2_' + user, 1);
			redisServer.redisPubICE.publish(rri, JSON.stringify({"emitAction":"getSocketInfo","username":user}));
			const res = await (new Promise((rsv, rej) => {
				async function fetchIP(channel, message) {
					var data = JSON.parse(message);
					if (user == data.username) {
						redisServer.redisSubServer.removeListener('message', fetchIP);
						rsv(data.value);
					}
				}
				redisServer.redisSubServer.on("message",fetchIP);
			}));
			if (res != "fail") connectusers.push([user,mode,res]);
		}
	}
	return connectusers;
};

module.exports.allSess = async () => {
	return myserver.rsStore.pAll();
};

module.exports.delSession = async (data) => {
	const dataToSend = JSON.stringify({"emitAction":"killSession","username":data.user,"cmdBy":data.cmdBy,"reason":data.reason});
	if (data.action == "disconnect") {
		redisServer.redisPubICE.publish("ICE1_"+data.key+"_"+data.user, dataToSend);
		return true;
	} else {
		redisServer.redisPubICE.publish("UI_notify_"+data.user, dataToSend);
		const sessDeletePromise = myserver.rsStore.pDestroy(data.key);
		return sessDeletePromise;
	}
};

module.exports.findSessID = async (username) => {
	let sid = "";
	const sessList = await this.allSess();
	for (let ki of sessList) {
		if (username == ki.username) {
			sid = ki.uniqueId;
			break;
		}
	}
	return sid;
};

module.exports.cloneSession = async (req) => {
	var sessid = "sess:" + req.session.id;
	var sessClient = myserver.rsStore.client;
	return (new Promise((rsv, rej) => {
		sessClient.ttl(sessid, (err, ttl) => {
			if (err) return rsv(err);
			var args = [sessid,JSON.stringify(req.session),'EX',ttl];
			req.clearSession();
			sessClient.set(args, err => rsv(err));
		});
	}));
};

module.exports.isSessionActive = function (req){
	var sessionToken = (req.session)? req.session.uniqueId:undefined;
	var sessionCheck = (sessionToken!==undefined) && (req.sessionID==sessionToken);
	var cookies = req.signedCookies;
	var cookieCheck = (cookies["connect.sid"]!==undefined) && (cookies["maintain.sid"]!==undefined);
	return sessionCheck && cookieCheck;
};

module.exports.approvalStatusCheck = async executionData => {
	var data = {res: "pass", status: null};
	if (!taskflow) return data
	var scenarioList=[];
	executionData.forEach(tsu => tsu.suiteDetails.forEach(tsco => scenarioList.push(tsco.scenarioId)));
	const inputs = {
		"scenario_ids": scenarioList
	};
	const result = await fetchData(inputs, "suite/checkApproval", "approvalStatusCheck", true);
	data.statusCode = result[1].statusCode;
	if (result[0] == "No task") data.res = 'Notask';
	else if (result[0] == "Modified") data.res = 'Modified';
	else if (result[0] != 0) data.res = 'NotApproved';
	return data;
};

const fetchData = async (inputs, url, from, all) => {
	const args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	//from = " from " + ((from)? from : fetchData.caller.name);
	from = (from)? " from " + from : "";
	const query = (inputs.query)? " - " + inputs.query:"";
	logger.info("Calling DAS Service: " + url + from + query);
	// Check if value is available in cache
	if (cache.checkapi(url)) {
		const cacheData = await cache.getapi(url, inputs);
		if (cacheData) return cacheData;
	}
	const promiseData = (new Promise((rsv, rej) => {
		const apiReq = client.post(epurl + url, args, (result, response) => {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occurred in " + url + from + query + ", Error Code : ERRDAS");
				const toLog = ((typeof(result)  == "object") && !(result instanceof Buffer))? JSON.stringify(result):result.toString();
				logger.debug("Response is %s", toLog);
				//rej("fail");
				if (all) rsv(["fail", response, result]);
				else rsv("fail");
			} else {
				result = (result.rows === undefined)? result:result.rows;
				if (cache.checkapi(url) && result != "fail") {
					cache.setapi(url, inputs, result);
				}
				if (all) rsv([result, response]);
				else rsv(result);
			}
		});
		apiReq.on('error', function(err) {
			logger.error("Error occurred in " + url + from + query + ", Error Code : ERRDAS, Error: %s", err);
			rsv("fail");
		});
	}));
	return promiseData;
};

module.exports.getChannelNum = getChannelNum_cb;
module.exports.fetchData = fetchData;
module.exports.cache = cache;

module.exports.tokenValidation = async (userInfo) => {
	var validUser = false;
	const icename = (userInfo.icename || "").toLowerCase();
	userInfo.icename = icename;
	const emsg = "Inside UI service: ExecuteTestSuite_ICE_SVN ";
	const tokenValidation = {
		"status": "failed",
		"msg": "Token authentication failed"
	}
	const inputs = {
		'icename': icename,
		'tokenname': userInfo.tokenname || ""
	};
	const response = await fetchData(inputs, "login/authenticateUser_CI", "tokenValidation");
	if (response != "fail" && response != "invalid") validUser = bcrypt.compareSync(userInfo.tokenhash || "", response.hash);
	if (validUser) {
		userInfo.userid = response.userid;
		userInfo.username = response.username;
		userInfo.role = response.role;
		if(response.deactivated == "active") {
			tokenValidation.status = "passed";
			tokenValidation.msg = "Token validation successful";
		} else if(response.deactivated == "expired") {
			tokenValidation.status = "expired";
			tokenValidation.msg = "Token is expired";
			logger.error(emsg + tokenValidation.msg + " for username: " + icename);
		} else if(response.deactivated == "deactivated") {
			tokenValidation.status = "deactivated";
			tokenValidation.msg = "Token is deactivated";
			logger.error(emsg + tokenValidation.msg + " for username: " + icename);
		}
	} else logger.info(emsg + "Token authentication failed for username: " + icename);
	inputs.tokenValidation = tokenValidation.status;
	inputs.error_message = tokenValidation.msg;
	userInfo.inputs = inputs;
	return userInfo;
};

// Fetch original requested url without proxy
exports.originalURL = function(req) {
	const app = req.app;
	const trustProxy = (app && app.get && app.get('trust proxy'));
	const proto = (req.headers['x-forwarded-proto'] || '').toLowerCase();
	const tls = req.connection.encrypted || (trustProxy && 'https' == proto.split(/\s*,\s*/)[0]);
	const protocol = tls ? 'https' : 'http';
	const host = (trustProxy && req.headers['x-forwarded-host']) || req.headers.host;
	const base = req.baseUrl || '';
	const path = req.url || '';
	return protocol + '://' + host + base+ path;
};
