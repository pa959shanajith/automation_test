const crypto = require('crypto');
const validator =  require('validator');
const logger = require('../../logger');
const utils = require('../lib/utils');

exports.Encrypt_ICE = async (req, res) => {
	const fnName = "Encrypt_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		var methodSelected = req.body.encryptionType;
		var encrytData = req.body.encryptionValue;
		var encryptedValue;
		var regEx=/[<">']/;
		const validate_encryptionType = validator.isEmpty(methodSelected) == false;
		const validate_check_encryptData = validator.isEmpty(encrytData) == false || !regEx.test(encrytData);
		if (!validate_encryptionType || !validate_check_encryptData) return res.send("fail");
		if (methodSelected == "AES") {
			const args = {
				data: req.body.encryptionValue,
				headers:{'Content-Type': 'plain/text'}
			};
			const results = await utils.fetchData(args, "utility/encrypt_ICE/aes", fnName)
			if (results == "fail") return res.send("fail");
			encryptedValue = results;
		} else if(methodSelected == "MD5"){
			encryptedValue = crypto.createHash('md5').update(encrytData).digest("hex");
		} else if(methodSelected == "Base64"){
			encryptedValue = Buffer.from(encrytData).toString('base64');
		} else {
			return res.send("fail");
		}
		if (encryptedValue) {
			logger.info("Data encrypted successfully");
			res.send(encryptedValue);
		}
	} catch (exception) {
		logger.error("Error occurred in utility/"+fnName+":", exception);
		res.send("fail");
	}
};

/*exports.pairwise_ICE = function (req, res) {
	var abc = {}
	abc.key = req.body.dataObj;
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log("IP:", ip);
	var name = req.session.username;
	console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", name);
	if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
		var mySocket = myserver.allSocketsMap[name];
		mySocket._events.pairwise = [];
		//mySocket.send(dataObj);
		mySocket.emit("pairwise", abc); //Sending
		//Receiving
		mySocket.on('result_pairs', function (data) {
			res.send(data);
		});
	} else {
		console.log("Socket not Available");
		res.send("unavailableLocalServer");
	}
}*/

