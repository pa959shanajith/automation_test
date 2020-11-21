const redis = require("redis");
const logger = require('../../logger');
const redisConfig = {"host": process.env.CACHEDB_IP, "port": parseInt(process.env.CACHEDB_PORT),"password" : process.env.CACHEDB_AUTH};

class Cache {
	locations = ["login/loadUserx"];

	constructor(conf) {
		const client = redis.createClient(conf);
		client.on("error", err => { /* Error Handler */ });
		client.select(2);
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

	async setx(key, data, ttl) {
		return this.set(key, data, ttl);
	};

	async setapi(url, query, data) {
		const key = url + ':' + JSON.stringify(query);
		return this.set(key, data, this.TTL);
	}
}

module.exports = new Cache(redisConfig);
