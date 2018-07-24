var async = require('async');
var logger = require('../../logger');
var myserver = require('../../server');
var redisServer = require('../lib/redisSocketHandler');

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
		redisServer.redisPubICE.pubsub('channels', fetchQuery, function(err,redisres){
			async.eachSeries(redisres, function(e, innerCB){
				var user = e.split('_')[2];
				var mode = e.split('_')[1];
				redisServer.redisSubServer.subscribe('ICE2_' + user ,1);
				redisServer.redisPubICE.publish(e, JSON.stringify({"emitAction":"getSocketInfo","username":user}));
				function fetchIP(channel, message) {
					var data = JSON.parse(message);
					if (user == data.username) {
						redisServer.redisSubServer.removeListener('message', fetchIP);
						connectusers.push([user,mode,data.value]);
					}
					innerCB();
				}
				console.log("sent",e);
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

module.exports.resetSession = function(session) {
	var intr = parseInt(process.env.SESSION_INTERVAL);
	var sessAge = parseInt(process.env.SESSION_AGE);
	var updateSessionExpiry = setInterval(function () {
		session.maxAge = sessAge;
	}, intr);
	return updateSessionExpiry;
};

module.exports.isSessionActive = function (session){
	var sessionToken = session.uniqueId;
    return sessionToken != undefined && session.id == sessionToken;
};
