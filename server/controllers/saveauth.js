//save cache db auth
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var credsPath  = path.join(path.dirname(fs.realpathSync(__filename)), '../../.tokens');

if(!process.argv[2] || !process.argv[3]) {    
	console.error("Invalid number of arguments");
} else {
	let var_name = process.argv[2];
	let var_val = process.argv[3];
	try {
		if(var_name != "cachedb") {
			console.error("Invalid key error");
		} else {
			var cred = {
				"cachedb": {
					"password": var_val
				}
			};
			const cipher = crypto.createCipheriv('aes-256-cbc', 'AvoAssureCredentials@CacheDbAuth', "0000000000000000");
			const encryptedData = cipher.update(JSON.stringify(cred), 'utf8', 'hex') + cipher.final('hex');
			fs.writeFileSync(credsPath, encryptedData, function(err) {});
			console.log("Cache auth detail saved successfully");
		}
	} catch(ex) {
		console.error("Exception occured saving cache auth detail"+ex);
	}
};