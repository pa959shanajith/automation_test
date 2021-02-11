//save cache db auth
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var credsPath  = path.join(path.dirname(fs.realpathSync(__filename)), '../config/.tokens');

var args = process.argv[1].split("\\");
if(args[args.length-1]=="dbAuthStore.js") {
	if (process.argv[2] && process.argv[3]) {
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
	} else {
		console.error("Invalid number of arguments")
	}
};

//function to load default cache auth value
exports.loadDefaultCacheAuth = function() {
	encryptedData = "1721aecfa7d84efa8d01035bc64e80ee0ee45d162a50fa1f50377b2eab1aeba272a85a33d6b1"+
	"f9699e78f702a470a187c213f474166bcc4d557b858535910e1f322d9e7a9660150d0c3165c7d2d1a18494a48fe2"+
	"fe35761057025d87e4a3d2be";
	fs.writeFileSync(credsPath, encryptedData, function(err) {});
};

//decrypt the cache auth data
exports.decryptCacheAuth = function() {
	var fileData = fs.readFileSync(credsPath, 'UTF-8');
	var decipher = crypto.createDecipheriv('aes-256-cbc', 'AvoAssureCredentials@CacheDbAuth', '0000000000000000');
	return JSON.parse(decipher.update(fileData, 'hex', 'utf8') + decipher.final('utf8'));
};