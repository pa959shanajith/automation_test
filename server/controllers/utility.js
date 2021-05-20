var crypto = require('crypto');
var myserver = require('../../server');
// var PythonShell = require('python-shell');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.DAS_URL;
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
			var regEx=/[<">']/;
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
				if(check_encryptData == false || !regEx.test(encrytData))
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
							logger.info("Calling DAS Service : utility/encrypt_ICE/aes");
						client.post(epurl+"utility/encrypt_ICE/aes",args,
							function (results, response) {
							// if (err){
								if(response.statusCode != 200){
								logger.error("Error occurred in encrypt_ICE Error Code : ERRDAS");
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

exports.manageDataTable = async(req, res) => {
	var fnName = "manageDataTable";
	logger.info("Inside UI service: " + fnName);
	try {
		var datatablename = req.body.datatablename;
		var action = req.body.action;
		var inputs = {
			datatablename: datatablename,
			action: action
		};
		if (action == "create" || action == "edit") {
			inputs.dtheaders = req.body.dtheaders;
			inputs.datatable = JSON.stringify(req.body.datatable);
		}
		const result = await utils.fetchData(inputs, "utility/manageDataTable", fnName);
		if (result == "fail" || result == "forbidden") res.status(500).send("fail");
		else res.send(result);
	} catch (exception) {
        logger.error("Exception in the service createDataTable - Error: %s", exception);
        res.status(500).send("fail");
    }
};


exports.getDatatableDetails = async(req, res) =>{
	const fnName = "getDatatableNames";
	logger.info("Inside UI service: " + fnName);
	try {
		logger.info("Fetching datatable names");
		var d = req.body;
		var dts = await getDatatable({"datatablename":d.datatablename, "action":d.action})
		res.send(dts);
	} catch(exception) {
		logger.error("Error occurred in utility/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

const getDatatable = async (d) => {
	const inputs = {
		"datatablename": d.datatablename,
		"action": d.action
	}
	return utils.fetchData(inputs, "utility/fetchDatatable", "fetchDatatable");
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

