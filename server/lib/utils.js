var myserver = require('../../server');
var redisServer = require('../lib/redisSocketHandler');

module.exports.socketList = function() {
	var connectusers=[];
	redisServer.redisPub1.pubsub('channels','ICE1_normal_*',function(err,redisres){
		redisres.forEach(function(e){
			connectusers.push(e.split('_')[2]);
		});
		return connectusers;
	});
};

module.exports.scheduleSocketList = function() {
	var connectusers=[];
	redisServer.redisPub1.pubsub('channels','ICE1_scheduling_*',function(err,redisres){
		redisres.forEach(function(e){
			connectusers.push(e.split('_')[2]);
		});
		return connectusers;
	});
};

module.exports.resetSession = function(session) {
	var intr = parseInt(process.env.SESSION_INTERVAL);
	var updateSessionExpiry = setInterval(function () {
			console.log(session);
			console.log("bwahaha");
			myserver.redisSessionStore.touch(session.id, session);
		}, intr);
	return updateSessionExpiry;
};

module.exports.isSessionActive = function (session){
	var sessionToken = session.uniqueId;
    return sessionToken != undefined && session.id == sessionToken;
}
