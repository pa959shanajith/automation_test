var async = require('async');
var logger = require('../../logger');
var myserver = require('../../server');
var redisServer = require('./redisSocketHandler');
var epurl = process.env.NDAC_URL;
var Client = require("node-rest-client").Client;
var client = new Client();
//var neo4jAPI = require('../controllers/neo4jAPI');


module.exports.getChannelNum = function(channel,cb) {
	redisServer.redisPubICE.pubsub('numsub', channel,function(err,redisres){
		if (redisres[1]>0) cb(true);
		else cb(false);
	});
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
			async.eachSeries(redisres, function(e, innerCB){
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
	async.forEachSeries(ExecutionData,function(eachmoduledata,callback){
		var qlist=[];
		var scenario_list=[];
		var arr=eachmoduledata.suiteDetails;
		for (i=0;i<arr.length;i++){
			scenario_list.push(arr[i].scenarioids);
		}
		var inputs = {
			"scenario_ids":scenario_list
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
				if(result.rows!=0){
					err = {res:'NotApproved',status:response.statusCode};
					callback(err);
				} else callback()
			}
		});
		// return null;
		// callback({res:'success',status:502})
// 		qlist.push({'statement':"MATCH (ts:TESTSCENARIOS)-[r]->(s:SCREENS)-[]->(tc:TESTCASES) where ts.testScenarioID_c in "+JSON.stringify(scenario_list)+"  with '.*'+s.screenID_c+']' as r1,s MATCH (t:TASKS),(t1:TASKS{status:'complete'}) where t.parent=~r1 and t1.parent=~r1 return count(DISTINCT t.status)=1 and count(DISTINCT substring(t.parent,112))=count(DISTINCT s.screenID_c) and count(DISTINCT substring(t1.parent,112))=count(DISTINCT s.screenID_c)"});
// 		qlist.push({'statement':"MATCH (ts:TESTSCENARIOS)-[r]->(s:SCREENS)-[]->(tc:TESTCASES) where ts.testScenarioID_c in "+JSON.stringify(scenario_list)+"  with '.*'+tc.testCaseID_c+']' as r1,tc  MATCH (t:TASKS),(t1:TASKS{status:'complete'}) where t.parent=~r1 and t1.parent=~r1 return count(DISTINCT t.status)=1 and count(DISTINCT substring(t.parent,149))=count(DISTINCT tc.testCaseID_c) and count(DISTINCT substring(t1.parent,149))=count(DISTINCT tc.testCaseID_c)"});
// 		neo4jAPI.executeQueries(qlist,function(status_res,result){
// 			if(status_res!=200) {
// 				logger.error("Error in ExecuteTestSuite_ICE: Neo4j query to find the number of tasks approved");
// 				return callback({res:'fail',status:status_res});
// 			}
// 			try {
// 				var err = null;
// 				if(!(result[0].data[0].row[0] && result[1].data[0].row[0] )){
// 						logger.info("All its dependent tasks (design, scrape) are not approved");
// 						err = {res:'NotApproved',status:status_res};
// 				}
// 				callback(err);
// 			} catch(ex) {
// 				logger.error("exception in function ValidateIfApproved() of Suitejs: ",ex);
// 				callback({res:'fail',status:502});
// 			}
// 		});
	}, function (err,data){
		console.log(err);
		if (err) approval_callback(err,false)
		else approval_callback(null,true)
	});
}
