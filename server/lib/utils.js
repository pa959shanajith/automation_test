var logger = require('../../logger');
var myserver = require('../../server');
var redisServer = require('../lib/redisSocketHandler');

module.exports.allSess = function (cb){
	myserver.redisSessionStore.all(cb);
};

module.exports.delSession = function (sessid, cb){
	myserver.redisSessionStore.destroy(sessid, cb);
};

module.exports.getChannelNum = function(channel,cb) {
	redisServer.redisPubICE.pubsub('numsub', channel,function(err,redisres){
		if (redisres[1]>0) cb(true);
		else cb(false);
	});
};

module.exports.getSocketList = function(toFetch, cb) {
	var fetchQuery;
	if (toFetch == "ICE") fetchQuery = "ICE1_*";
	else if (toFetch == "default") fetchQuery = "ICE1_normal_*";
	else if (toFetch == "schedule") fetchQuery = "ICE1_scheduling_*";
	else if (toFetch == "notify") fetchQuery = "notify_*";
	var connectusers = [];
	redisServer.redisPubICE.pubsub('channels', fetchQuery, function(err,redisres){
		redisres.forEach(function(e){
			connectusers.push(e.split('_')[2]);
		});
		cb(connectusers);
	});
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
}
