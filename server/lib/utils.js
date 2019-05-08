var async = require('async');
var logger = require('../../logger');
var myserver = require('../../server');
var redisServer = require('./redisSocketHandler');

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
