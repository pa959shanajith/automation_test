//node
var myserver = require('../../server.js');
// var PythonShell = require('python-shell');
var Client = require("node-rest-client").Client;
var client = new Client();

exports.Encrypt_ICE = function getDomains_ICE(req, res) {
	try {
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if(sessionToken != undefined && req.session.id == sessionToken)
		{
			var methodSelected = req.body.encryptionType;
			var encrytData = req.body.encryptionValue;
			var encryptedValue;
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
						client.post("http://127.0.0.1:1990/utility/encrypt_ICE/aes",args,
							function (results, response) {
							// if (err){
								if(response.statusCode != 200){
								console.log("error occured : ",err);
								res.send("fail");
							}else{
									// results is an array consisting of messages collected during execution 
									// console.log('results: %j', results);
									// encryptedValue = results[2];
									if(results.rows != "fail"){
										encryptedValue = results.rows;
										// console.log(encryptedValue);
										res.send(encryptedValue);
									}else{
										res.send("fail");
									}
							}
						});
						
					}catch(exception){
						console.log(exception);
						res.send("fail");
					}
				}else if(methodSelected == "MD5"){
					try{
						var crypto = require('crypto');
						encryptedValue = crypto.createHash('md5').update(encrytData).digest("hex");
						console.log(encryptedValue);						
					}
					catch(exception){
						console.log(exception);
						res.send("fail");
					}
					res.send(encryptedValue);
				}else if(methodSelected == "Base64"){
					try{
						
						var buffer = new Buffer(encrytData);
						var encryptedValue = buffer.toString('base64');
						console.log(encryptedValue);
					}
					catch(exception){
						console.log(exception);
						res.send("fail");
					}
					res.send(encryptedValue);
				}else{
					res.send("fail");
				}
			}
			catch(exception){
				console.log(exception);
			}
		}
		else{
			res.send("Invalid Session");
		} 
	}catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

exports.pairwise_ICE = function(req, res) {	
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if(sessionToken != undefined && req.session.id == sessionToken)
		{
			var abc = {}
			abc.key = req.body.dataObj;
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			console.log(Object.keys(myserver.allSocketsMap),"<<all people, asking person:",ip);
			if('allSocketsMap' in myserver && ip in myserver.allSocketsMap){
				var mySocket = myserver.allSocketsMap[ip];
				mySocket._events.pairwise = [];               						
			//mySocket.send(dataObj);
				mySocket.emit("pairwise", abc );//Sending

				//Receiving				
				mySocket.on('result_pairs', function (data) {
					res.send(data);
				});
			}else{
				console.log("Socket not Available");
				res.send("unavailableLocalServer");
			}
			
		}

	}

