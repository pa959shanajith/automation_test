var asynclib = require('async');
var logger = require('../../logger');
var myserver = require('../../server');
var redisServer = require('./redisSocketHandler');
var taskflow = require('../config/options').strictTaskWorkflow;
var epurl = process.env.NDAC_URL;
var Client = require("node-rest-client").Client;
var client = new Client();
//var neo4jAPI = require('../controllers/neo4jAPI');


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


module.exports.getSocketList = function(toFetch, cb) {
	var fetchQuery;
	var connectusers = [];
	if (toFetch == "ICE") fetchQuery = "ICE1_*";
	else if (toFetch == "default") fetchQuery = "ICE1_normal_*";
	else if (toFetch == "schedule") fetchQuery = "ICE1_scheduling_*";
	else if (toFetch == "notify") fetchQuery = "notify_*";
	if (toFetch == "ICE") {
		redisServer.redisPubICE.pubsub('channels', fetchQuery, function(err,redisres) {
			asynclib.eachSeries(redisres, function(e, innerCB){
				var ed = e.split('_');
				var mode = ed[1];
				var user = ed.slice(2).join('_');
				redisServer.redisSubServer.subscribe('ICE2_' + user ,1);
				redisServer.redisPubICE.publish(e, JSON.stringify({"emitAction":"getSocketInfo","username":user}));
				function fetchIP(channel, message) {
					var data = JSON.parse(message);
					if (user == data.username) {
						redisServer.redisSubServer.removeListener('message', fetchIP);
						if (data.value != "fail") connectusers.push([user,mode,data.value]);
					}
					innerCB();
				}
				redisServer.redisSubServer.on("message",fetchIP);
			}, function () {
				cb(connectusers);
			});
		});
	} else {
		redisServer.redisPubICE.pubsub('channels', fetchQuery, function(err,redisres){
			redisres.forEach(function(e){
				connectusers.push(e.split('_')[2]);
			});
			cb(connectusers);
		});
	}
};

module.exports.allSess = function (cb){
	myserver.redisSessionStore.all(cb);
};

module.exports.delSession = function (data, cb){
	if (data.action == "disconnect") {
		redisServer.redisPubICE.publish("ICE1_"+data.key+"_"+data.user, JSON.stringify({"emitAction":"killSession","username":data.user,"cmdBy":data.cmdBy}));
		cb();
	} else {
		redisServer.redisPubICE.publish("UI_notify_"+data.user, JSON.stringify({"emitAction":"killSession","username":data.user}));
		myserver.redisSessionStore.destroy(data.key, cb);
	}
};

module.exports.cloneSession = function (req, cb){
	var sessid = "sess:" + req.session.id;
	var sessClient = myserver.redisSessionStore.client;
	sessClient.ttl(sessid, function(err, ttl) {
		if (err) return cb(err);
		var args = [sessid,JSON.stringify(req.session),'EX',ttl];
		req.clearSession();
		sessClient.set(args, function(err) { return cb(err); });
	});
};

module.exports.isSessionActive = function (req){
	var sessionToken = (req.session)? req.session.uniqueId:undefined;
	var sessionCheck = (sessionToken!==undefined) && (req.sessionID==sessionToken);
	var cookies = req.signedCookies;
	var cookieCheck = (cookies["connect.sid"]!==undefined) && (cookies["maintain.sid"]!==undefined);
	return sessionCheck && cookieCheck;
};

module.exports.approval_status_check=function(ExecutionData,approval_callback){
	asynclib.forEachSeries(ExecutionData,function(eachmoduledata,callback){
		var scenario_list=[];
		var arr=eachmoduledata.suiteDetails;
		for (i=0;i<arr.length;i++){
			scenario_list.push(arr[i].scenarioId);
		}
		var inputs = {
			"scenario_ids": scenario_list
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling NDAC Service from executionFunction: suite/checkApproval");
		client.post(epurl + "suite/checkApproval", args,
			function (result, response) {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occurred in suite/checkApproval from executionFunction Error Code : ERRNDAC");
				err = {res:'fail',status:response.statusCode};
				callback(err);
			} else {
				logger.info("Successfully inserted report data");
				if(result.rows=="No task"){
					err = {res:'Notask',status:response.statusCode};
					callback(err);
				}
				if(result.rows=="Modified"){
					err = {res:'Modified',status:response.statusCode};
					callback(err);
				}
				else if(result.rows!=0){
					err = {res:'NotApproved',status:response.statusCode};
					callback(err);
				} else callback()
			}
		});
	}, function (err,data){
		console.log(err);
		if (err) approval_callback(err,false)
		else approval_callback(null,true)
	});
};

module.exports.approvalStatusCheck = async executionData => {
	var data = {res: "pass", status: null};
	if (!taskflow) return data
	var scenarioList=[];
	executionData.forEach(tsu => tsu.suiteDetails.forEach(tsco => scenarioList.push(tsco.scenarioId)));
	const inputs = {
		"scenario_ids": scenarioList
	};
	const result = fetchData(inputs, "suite/checkApproval", "approvalStatusCheck", true);
	data.statusCode = result[1].statusCode;
	if (result[0] == "No task") data.res = 'Notask';
	else if (result[0] == "Modified") data.res = 'Notask';
	else if (result[0] != 0) data.res = 'NotApproved';
};

var fetchData = async (inputs, url, from, all) => {
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	//from = " from " + ((from)? from : fetchData.caller.name);
	from = (from)? " from " + from : "";
	var query = (inputs.query)? " - " + inputs.query:"";
	logger.info("Calling NDAC Service: " + url + from + query);
	var promiseData = (new Promise((rsv, rej) => {
		client.post(epurl + url, args, (result, response) => {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occurred in " + url + from + query + ", Error Code : ERRNDAC");
				//rej("fail");
				if (all) rsv(["fail", result, response]);
				else rsv("fail");
			} else {
				result = result.rows || result;
				if (all) rsv([result, response]);
				else rsv(result);
			}
		});
	}));
	return promiseData;
};

module.exports.getChannelNum = getChannelNum_cb;
module.exports.fetchData = fetchData;

/*module.exports.cache = {
	get: function get(key, cb) {
		redisServer.cache.get(key, function(err, data) {
			console.log(typeof(data), data[0]);
			if (data) cb(data);
			else cb({});
		});
	},
	set: function set(key, data) {
		redisServer.cache.set(key, data);
	},
};*/
