var logger = require('../../logger');
var Client = require("node-rest-client").Client;
var crypto = require("crypto");
var jwt = require('jsonwebtoken')
var epurl = process.env.DAS_URL;
var client = new Client();


exports.getMappedDiscoverUser = async(req,res)=>{
    const userid = req.session.userid;    
    var args = {
        data: {userid: userid},
		headers: {
			"Content-Type": "application/json"
		}
    };
    try{
		client.post(epurl + "plugins/getMappedDiscoverUser", args,
			function (getData, response) {
				try {
                    if (response.statusCode === 200) {
                        encrypt(getData)
					}
					else if (response.statusCode != 200) {
						logger.error("Error occurred in plugins/getMappedDiscoverUser");
                        return res.status(response.statusCode).send('fail')
					}
				} catch (exception) {
					logger.error("Exception: %s",exception);
                    return res.status(500).send("fail");
				}
			}
		);
	}
	catch(exception) {
		logger.error("Error occurred in plugins/getMappedDiscoverUser:", exception);
		return res.status(500).send("fail");
	}
    var encrypt = (data)=>{
        if(!data.result)
            return res.status(500).send("fail");
        else if(data.result === 'fail')
            return res.send('fail')
        else{
            const payload = { 
                username: data.username,
                password: data.password,
            }
            const encrptionKey = 'Nineeteen68@SecureDiscovDataPath'
            const cipher = crypto.createCipheriv('aes-256-cbc',encrptionKey , "0000000000000000");
            const encryptedData = cipher.update(JSON.stringify(payload), 'utf8', 'hex') + cipher.final('hex');
            const signatureKey = 'Nineeteen68to@DiscoverySecureAuthToken'
            // creating a json web token and given expiry of token as 5 minutes
            var token = jwt.sign({"encryptToken" : encryptedData.toUpperCase()}, signatureKey,{ expiresIn: 300});
            return 	res.send({"url" : data.url, "token" :token})   
        }
    }
}