const redis = require("redis");
const logger = require('../../logger');
const dbAuthStore = require('./dbAuthStore');
const redisConfig = {"host": process.env.CACHEDB_IP, "port": parseInt(process.env.CACHEDB_PORT), "password": dbAuthStore.getCachedbAuth()};

const clients = {};

class Cache {
	locations = ["login/loadUserx", "utility/userAccess"];

	constructor(conf, db) {
		const client = redis.createClient(conf);
		client.on("error", err => { /* Error Handler */ });
		client.select(db);
		// client.getP = async (key) => (new Promise((rsv, rej) => client.get(key, (e,d) => ((e)? rej(e):rsv(d)))));
		// client.setP = async (args) => (new Promise((rsv, rej) => client.set(args, (e,d) => ((e)? rej(e):rsv(d)))));
		this.client = client;
		this.TTL = 300;
	}

	checkapi(url) {
		return this.locations.includes(url);
	}

	async get(key) {
		return (new Promise((rsv, rej) => this.client.get(key, (err, data) => {
			if (err) {
				logger.error("Error occurred while fetching cached request data. Error:" + err);
				return rsv(null);
			}
			if (data) data = JSON.parse(data);
			else data = null
			rsv(data);
		})));
	}
	
	async gethmap(host) {
		let clientName="avoassure";
		if(host != null && host != undefined)
		{
			if(!(host.includes("localhost") || host.includes("127.0.0.1"))){
				clientName=host.split('.')[0]
			}
		}
		return (new Promise((rsv, rej) => this.client.hgetall(clientName, (err, data) => {
			if (err) {
				logger.error("Error occurred while fetching cached request data. Error:" + err);
				return rsv(null);
			}
			if (data) data = data;
			else data = {}
			rsv(data);
		})));
	}

	async getapi(url, query) {
		const key = url + ':' + JSON.stringify(query);
		return this.get(key);
	}

	async set(key, data, ttl) {
		data = JSON.stringify(data);
		const args = (ttl)? [key, data, 'EX', ttl] : [key, data];
		return (new Promise((rsv, rej) => this.client.set(args, (err) => {
			if (err) {
				logger.error("Error occurred while caching request data. Error:" + err);
				return rsv(null);
			}
			rsv(true);
		})));
	};

	async sethmap(key, data, ttl) {
		let clientName="avoassure";
		if(ttl){
			if(!(ttl.includes("localhost") || ttl.includes("127.0.0.1"))){
				clientName=ttl.split('.')[0]
			}
		}else {
			if(!(data.host.includes("localhost") || data.host.includes("127.0.0.1"))){
				clientName=data.host.split('.')[0]
			}
		}
		data = JSON.stringify(data);
		const args = (ttl)? [key, data, 'EX', ttl] : [key, data];
		return (new Promise((rsv, rej) => this.client.hset(clientName,key,data, (err) => {
			if (err) {
				logger.error("Error occurred while caching request data. Error:" + err);
				return rsv(null);
			}
			rsv(true);
		})));
	};


	async setx(key, data, ttl) {
		return this.set(key, data, ttl);
	};

	async setapi(url, query, data) {
		const key = url + ':' + JSON.stringify(query);
		return this.set(key, data, this.TTL);
	}
}

module.exports = Cache;
module.exports.getClient = db => {
	if (db === undefined || typeof(db) !== "number" || db == 1 || db == 3 || db > 16 || db < 0) db = 5;
	if (!clients[db]) clients[db] = new Cache(redisConfig, db);
	return clients[db];
}
