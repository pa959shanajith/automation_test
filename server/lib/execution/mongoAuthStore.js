const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const credsPath = path.join(path.dirname(fs.realpathSync(__filename)), '../../config/.dbtokens');

if (!fs.existsSync(credsPath)) {  // Write default creds to tokens
	const encryptedData = "6458bb45807de4ee1bb32cdcd874970011787ff93369691c2740ae84cf5783104680755fbede77dcd7674069e1f370f465eaab8b419238c2536ff96b5372f4b536e75343a7e711da5ca39a63ed2b8c9992fba661cf933b362fb066cc36b6a2d6960e21e801bf262904c5f6e24ffb7b9a45f72d812e37602a50a375ca8165a6b263fad157899219f7a1eb3c1bdb7fe1a9";
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
    return { "usernameadmin": creds.mongodb.usernameadmin, "passwordadmin": creds.mongodb.passwordadmin, "usernameavoassure": creds.mongodb.usernameavoassure, "passwordavoassure": creds.mongodb.passwordavoassure};
};