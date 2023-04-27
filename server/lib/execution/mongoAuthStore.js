const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const credsPath = path.join(path.dirname(fs.realpathSync(__filename)), '../../config/.dbtokens');

if (!fs.existsSync(credsPath)) {  // Write default creds to tokens
	const encryptedData = "6458bb45807de4ee1bb32cdcd874970028ed1445542f97406148a717b66b78f476c5baa7395379c026a0af2b380ad54cd13be055080e5f33e94f3a386dab108d2a569bf2ddd54b25f5c0197f6754fc8a";
	fs.writeFileSync(credsPath, encryptedData, err => { throw "Invalid Mongo Database credentials!"; });
}

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