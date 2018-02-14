var myserver = require('../../server');
var redisServer = require('../lib/redisSocketHandler');

module.exports.getChannelNum = function(channel,cb) {
	redisServer.redisPub1.pubsub('numsub', channel,function(err,redisres){
		if (redisres[1]>0) cb(true);
		else cb(false);
	});
};

module.exports.socketList = function(cb) {
	var connectusers=[];
	redisServer.redisPub1.pubsub('channels','ICE1_normal_*',function(err,redisres){
		redisres.forEach(function(e){
			connectusers.push(e.split('_')[2]);
		});
		cb(connectusers);
	});
};

module.exports.scheduleSocketList = function(cb) {
	var connectusers=[];
	redisServer.redisPub1.pubsub('channels','ICE1_scheduling_*',function(err,redisres){
		redisres.forEach(function(e){
			connectusers.push(e.split('_')[2]);
		});
		cb(connectusers);
	});
};

module.exports.resetSession = function(session) {
	var intr = parseInt(process.env.SESSION_INTERVAL);
	var updateSessionExpiry = setInterval(function () {
			myserver.redisSessionStore.touch(session.id, session);
		}, intr);
	return updateSessionExpiry;
};

module.exports.isSessionActive = function (session){
	var sessionToken = session.uniqueId;
    return sessionToken != undefined && session.id == sessionToken;
}
