var logger = require('../../logger');
var myserver = require('../../server');
var redisServer = require('../lib/redisSocketHandler');

module.exports.allSess = function (cb){
	myserver.redisSessionStore.all(cb);
};

module.exports.getChannelNum = function(channel,cb) {
	redisServer.redisPubICE.pubsub('numsub', channel,function(err,redisres){
		if (redisres[1]>0) cb(true);
		else cb(false);
	});
};

module.exports.socketList = function(cb) {
	var connectusers=[];
	redisServer.redisPubICE.pubsub('channels','ICE1_normal_*',function(err,redisres){
		redisres.forEach(function(e){
			connectusers.push(e.split('_')[2]);
		});
		cb(connectusers);
	});
};

module.exports.scheduleSocketList = function(cb) {
	var connectusers=[];
	redisServer.redisPubICE.pubsub('channels','ICE1_scheduling_*',function(err,redisres){
		redisres.forEach(function(e){
			connectusers.push(e.split('_')[2]);
		});
		cb(connectusers);
	});
};

module.exports.resetSession = function(session) {
	var intr = parseInt(process.env.SESSION_INTERVAL);
	var sessAge = parseInt(process.env.SESSION_AGE);
	session.cookie.maxAge = sessAge;
	myserver.redisSessionStore.touch(session.uniqueId,session);
	var updateSessionExpiry = setInterval(function () {
		session.cookie.maxAge = sessAge;
		myserver.redisSessionStore.touch(session.uniqueId,session);
	}, intr);
	return updateSessionExpiry;
};

module.exports.isSessionActive = function (session){
	var sessionToken = session.uniqueId;
    return sessionToken != undefined && session.id == sessionToken;
}
