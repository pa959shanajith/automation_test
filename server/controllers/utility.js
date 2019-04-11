var crypto = require('crypto');
var myserver = require('../../server');
// var PythonShell = require('python-shell');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.NDAC_URL;
var sessionExtend = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
var validator =  require('validator');
var logger = require('../../logger');
var utils = require('../lib/utils');

exports.Encrypt_ICE = function getDomains_ICE(req, res) {
	try {
		logger.info("Inside UI service: Encrypt_ICE");
		if (utils.isSessionActive(req)) {
			var methodSelected = req.body.encryptionType;
			var encrytData = req.body.encryptionValue;
			var encryptedValue,check_encryptionType;
			var validate_encryptionType,validate_check_encryptData;
			validateEncryption();
			function validateEncryption()
			{
				logger.info("Inside function validateEncryption");
				check_encryptionType = validator.isEmpty(methodSelected);
				if(check_encryptionType == false)
				{
					validate_encryptionType = true;
				}
				check_encryptData = validator.isEmpty(encrytData);
				if(check_encryptData == false)
				{
					validate_check_encryptData = true;
				}
			}
			if(validate_encryptionType == true && validate_check_encryptData == true)
					{

			try{
				// if (methodSelected === 'undefined') {
				// 	res.send("fail");
				// }
				// else
				if(methodSelected == "AES"){
					try{
						// var dirName = __dirname.split("\\");
						// 	dirName.pop();
						// 	dirName.pop();
						// 	dirName.push("Portable_python");
						// 	var strPath = dirName.join("\\");
						// 	console.log(strPath);

							// var dir_name = __dirname.split("\\");
							// dir_name.pop();
							// dir_name.pop();
							// dir_name.push("Portable_python");
							// dir_name.push("python");
							// var pyPath = dir_name.join("\\");
							// console.log(pyPath);

						// var options = {
						// 	mode: 'text',
						// 	pythonPath:pyPath,
						// 	scriptPath: strPath,
						// 	args: [encrytData]
						// 	};
						var args = {
							data: req.body.encryptionValue,
							headers:{'Content-Type': 'plain/text'}
						};
						// PythonShell.run("AES_encryption.py", options, function (err, results) {
							logger.info("Calling NDAC Service : utility/encrypt_ICE/aes");
						client.post(epurl+"utility/encrypt_ICE/aes",args,
							function (results, response) {
							// if (err){
								if(response.statusCode != 200){
								logger.error("Error occurred in encrypt_ICE Error Code : ERRNDAC");
								res.send("fail");
							}else{
									// results is an array consisting of messages collected during execution
									// console.log('results: %j', results);
									// encryptedValue = results[2];
									if(results.rows != "fail"){
										encryptedValue = results.rows;
										logger.info("Data encrypted successfully");
										// console.log(encryptedValue);
										res.send(encryptedValue);
									}else{
										res.send("fail");
									}
							}
						});

					}catch(exception){
						logger.error(exception.message);
						res.send("fail");
					}
				}else if(methodSelected == "MD5"){
					try{
						encryptedValue = crypto.createHash('md5').update(encrytData).digest("hex");
					} catch(exception){
						logger.error(exception.message);
						res.send("fail");
					}
						logger.info("Data encrypted successfully");
					res.send(encryptedValue);
				}else if(methodSelected == "Base64"){
					try{
						var buffer = new Buffer(encrytData);
						var encryptedValue = buffer.toString('base64');
					} catch(exception){
					    logger.error(exception.message);
						res.send("fail");
					}
					logger.info("Data encrypted successfully");
					res.send(encryptedValue);
				}else{
					res.send("fail");
				}
			} 
			catch(exception){
				logger.error(exception.message);
			} }else{
				res.send("fail");
			}
		}
		else{
			res.send("Invalid Session");
		}
	}catch (exception) {
		logger.error(exception.message);
		res.send("fail");
	}
};

/*exports.pairwise_ICE = function (req, res) {
	if (utils.isSessionActive(req)) {
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
	}
}*/

