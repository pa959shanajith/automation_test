const redis = require("redis");
const logger = require('../../logger');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var credsPath = path.join(path.dirname(fs.realpathSync(__filename)), '../../.tokens');
var cachedb = null;
try {
	var fileData = fs.readFileSync(credsPath, 'UTF-8');
	var decipher = crypto.createDecipheriv('aes-256-cbc', 'AvoAssureCredentials@CacheDbAuth', '0000000000000000');
	var parsed = JSON.parse(decipher.update(fileData, 'hex', 'utf8') + decipher.final('utf8'));
	cachedb = parsed['cachedb'];
} catch (ex) {
	console.error("Error occurred while loading cache db auth");
	console.error(ex);
}
const redisConfig = {"host": process.env.CACHEDB_IP, "port": parseInt(process.env.CACHEDB_PORT),"password" : cachedb};

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

module.exports = Cache;
module.exports.getClient = db => {
	if (db === undefined || typeof(db) !== "number" || db == 1 || db == 3 || db > 16 || db < 0) db = 5;
	if (!clients[db]) clients[db] = new Cache(redisConfig, db);
	return clients[db];
}
