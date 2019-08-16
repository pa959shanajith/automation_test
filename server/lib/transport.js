var logger = require("../../logger");
const EventEmitter = require('events');

module.exports = class Transport extends EventEmitter {

  /**
   * Creates an instance of Transport for socketIO
   *
   * @param {Object} options
   * @param {string} options.mode The choice of transport i.e. Redis or local
   */
	constructor(options = {}) {
		super();
	}

	avail(channel, callback) {
		this.emit('data', data);
	}

	push(data) {
		this.emit('data', data);
	}

	subscribe(data) {
		this.emit('data', data);
	}

	unsubscribe(data) {
		this.emit('data', data);
	}

	add(data) {
		this.emit('data', data);
	}

	remove(data) {
		this.emit('data', data);
	}
}

















/*
var redis = require("redis");
var redisConfig = {"host": process.env.REDIS_IP, "port": parseInt(process.env.REDIS_PORT),"password" : process.env.REDIS_AUTH};
var default_sub = redis.createClient(redisConfig);
var default_pub = redis.createClient(redisConfig);
var server_sub = redis.createClient(redisConfig);
var server_pub = redis.createClient(redisConfig);

default_sub.on("message", function (channel, message) {
	logger.debug("In redisSocketHandler: Channel is %s", channel);
	var data = JSON.parse(message);
	var socketchannel = channel.split('_')[1];
	var sockets = require("./socket");
	var mySocket;
	if (socketchannel === "notify")
		mySocket = sockets.socketMapNotify[data.username];
	else if (socketchannel === "scheduling")
		mySocket = sockets.allSchedulingSocketsMap[data.username];
	else
		mySocket = sockets.allSocketsMap[data.username];

});

function redisErrorHandler(err) {
	logger.debug("Error in Redis pubsub client: %s", err)
	logger.error("Error in syncing data with ICE client");
}

default_sub.on("error", redisErrorHandler);
default_pub.on("error", redisErrorHandler);
server_sub.on("error", redisErrorHandler);
server_pub.on("error", redisErrorHandler);

module.exports.redisSubClient = default_sub;
module.exports.redisPubICE = default_pub;
module.exports.redisSubServer = server_sub;
*/

//module.exports.redisSubClient = default_sub;
//module.exports.redisPubICE = default_pub;
//module.exports.redisSubServer = server_sub;
//module.exports.redisPubServer = server_pub;