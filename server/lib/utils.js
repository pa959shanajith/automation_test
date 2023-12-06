const bcrypt = require('bcryptjs');
const randexp = require('randexp');
const logger = require('../../logger');
const myserver = require('../../server');
const cache = require('./cache').getClient();
const redisServer = require('./redisSocketHandler');
const taskflow = require('../config/options').strictTaskWorkflow;
const epurl = process.env.DAS_URL;
const Client = require("node-rest-client").Client;
const client = new Client();
const axios = require("axios");
const https = require('https');
const mySocket = require('./socket')

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

module.exports.allSessCount = async (clientName) => {
    const sessList = await this.allSess();
    var count = sessList.filter(ki => clientName == ki.client).length
    return count;
};

module.exports.delSession = async (data,host) => {
	const dataToSend = JSON.stringify({"emitAction":"killSession","username":data.user,"cmdBy":data.cmdBy,"reason":data.reason});
	var clientName=this.getClientName(host);
	if (data.action == "disconnect") {
		if(clientName in mySocket.allSocketsMap && data.user in mySocket.allSocketsMap[clientName]){
			mySocket.allSocketsMap[clientName][data.user].emit("killSession", data.cmdBy, data.reason);
		}
		return true;
	} else {
		const sessDeletePromise = myserver.rsStore.pDestroy(data.key);
		return sessDeletePromise;
	}
};

module.exports.findSessID = async (username,clientName) => {
	let sid = "";
	const sessList = await this.allSess();
	for (let ki of sessList) {
		if (username == ki.username && clientName == ki.client) {
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

module.exports.generateDefPassword = function () {
	let passwordtemp = new randexp(/^([A-Z][a-z][0-9][!#$%&,:;<>@_~])(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!*#$%&@_^])[A-Za-z\d!*#$%&@_^]{4,6}$/).gen();
	return passwordtemp;
}

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
	if (result[0].rows == "No task") data.res = 'Notask';
	else if (result[0].rows == "Modified") data.res = 'Modified';
	else if (result[0].rows != 0) data.res = 'NotApproved';
	return data;
};

module.exports.setReq = async (req) =>
{
	this.avoreq=req;
}


const fetchData = async (inputs, url, from, all) => {
	if(this.avoreq != null)
	{
		if(Array.isArray(inputs)) inputs.push({"host":this.avoreq.headers.host});
		else inputs.host = this.avoreq.headers.host;
	}
	let args = (inputs.headers)? inputs : {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("DL------>avoreq in fetchData", this.avoreq);
	logger.info("DL------>inputs in fetchData", inputs);
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
				result = (result.rows === undefined || all)? result:result.rows;
				if (cache.checkapi(url) && result != "fail") {
					cache.setapi(url, inputs, result);
				}
				if (all) rsv([result, response]);
				else rsv(result);
			}
		});
		apiReq.on('error', function(err) {
			logger.error("Error occurred in " + url + from + query + ", Error Code : ERRDAS, Error: %s", err);
			if (all) rsv(["fail", response, null]);
			else rsv("fail");
		});
	}));
	return promiseData;
};

const fetchDiscoverData = async (url, inputs) => {
	try{
		const agent = new https.Agent({  
			rejectUnauthorized: false
		  });
		inputs.httpsAgent = agent
		const res = await axios(url, inputs);
		if(res.status !== 200 || res.data === "Invalid Session"){
			console.error('fail');
			return "fail";
		}
		return res.data;
	}catch(err){
		return err;
	}
};

module.exports.getChannelNum = getChannelNum_cb;
module.exports.fetchData = fetchData;
module.exports.fetchDiscoverData = fetchDiscoverData;
module.exports.cache = cache;

exports.getUserInfoFromHeaders = (headers) => {
	headers['x-ice-name'] = headers['x-ice-name'] || "";
	headers['x-pool-name'] = headers['x-pool-name'] || ""; 
	if (headers['x-token-hash'] && headers['x-token-name'] && headers['x-token-name'] != "" && headers['x-token-name'] != "") {
		if(headers['x-ice-name'] != "" || headers['x-pool-name'] != ""){
				return { 'tokenhash': headers['x-token-hash'], "tokenname": headers['x-token-name'], 'icename': headers['x-ice-name'], 'poolname': headers['x-pool-name']}                      
		}
	}
	return false;
}

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

// Get client Name from host value
module.exports.getClientName = (host) =>{
	let clientName="avoassure";
	if(host != null && host != undefined)
	{
			if(!(host.includes("localhost") || require('net').isIP(host)>0)){
					clientName=host.split('.')[0]
			}
	}
	return clientName;
}