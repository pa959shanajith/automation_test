//node
var myserver = require('../../server.js');
var PythonShell = require('python-shell');


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
				if (methodSelected === 'undefined') {
					res.send("fail");
				}
				else if(methodSelected == "AES"){
					try{
						var dirName = __dirname.split("\\");
							dirName.pop();
							dirName.push("python");
							var strPath = dirName.join("\\");
							console.log(strPath);

						var options = {
							mode: 'text',
							scriptPath: strPath,
							args: [encrytData]
							};

						PythonShell.run("AES_encryption.py", options, function (err, results) {
							if (err){
								console.log("error occured : ",err);
								res.send("fail");
							}else{
									// results is an array consisting of messages collected during execution 
									console.log('results: %j', results);
									encryptedValue = results[2];
									console.log(encryptedValue);
									res.send(encryptedValue);
							}
						});
						
					}
					catch(exception){
						console.log(exception);
						res.send("fail");
					}
				}
				else if(methodSelected == "MD5"){
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
				}
				else if(methodSelected == "Base64"){
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

