const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const credsPath = path.join(path.dirname(fs.realpathSync(__filename)), '../../config/.dbtokens');

const logger = require('../../../logger');

//decrypt the cache auth data
const decryptMongoDBAuth = () => {
    const fileData = fs.readFileSync(credsPath, 'UTF-8');
    const decipher = crypto.createDecipheriv('aes-256-cbc', 'AvoAssureCredentials@MongoDBAuth', '0000000000000000');
    var sdata = {};
    try {
        sdata = JSON.parse(decipher.update(fileData, 'hex', 'utf8') + decipher.final('utf8'));
    } catch (e) {
        logger.error("Invalid Mongo Database credentials!");
    }
    return sdata;
};

exports.getMongoDBAuth = () => {
    const creds = decryptMongoDBAuth();
    return { "username": creds.mongodb.username, "password": creds.mongodb.password };
};