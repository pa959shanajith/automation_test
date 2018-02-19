var myserver = require('../lib/socket.js');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
//var fs = require('fs');

function isSessionActive(req){
	var sessionToken = req.session.uniqueId;
    return sessionToken != undefined && req.session.id == sessionToken;
}

exports.flowGraphResults = function(req, res){
	logger.info("Inside UI service: flowGraphResults");
	try{
		if(isSessionActive(req)){
			var name = req.session.username;
			var version = req.body.version;
			var path = req.body.path;
			/*validatePath(path);
			function validatePath(path){
				logger.info("Inside function: validatePath");
				valid = true;
				try{
					fs.lstatSync(path).isDirectory();
					fs.lstatSync(path).isFile();
				}catch(exception){
					valid = false; 
				}
			}*/
			redisServer.redisSub2.subscribe('ICE2_' + name ,1);
			redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]==1) {
					logger.info("Sending socket request for generateFlowGraph to redis");
					dataToIce = {"emitAction" : "generateFlowGraph","username" : name, "version":version, "path" : path};
					redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					function generateFlowGraph_listener(channel,message) {
						data = JSON.parse(message);
						if(name == data.username){
							var value = data.value;
							if (data.onAction == "unavailableLocalServer") {
								redisServer.redisSub2.removeListener('message',generateFlowGraph_listener);	
								logger.error("Error occured in flowGraphResults: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}
							} else if (data.onAction == "flowgraph_result") {
								try {
									var mySocketUI = myserver.allSocketsMapUI[name];
									mySocketUI.emit("newdata", value);
								} catch (exception) {
									logger.error(exception.message);
								}
							} else if (data.onAction == "result_flow_graph_finished") {
								redisServer.redisSub2.removeListener('message',generateFlowGraph_listener);	
								try {
									var mySocketUI = myserver.allSocketsMapUI[name];
									mySocketUI.emit("endData", value);
									res.status(200).json({success: true});
								} catch (exception) {
									logger.error(exception.message);
									res.status(500).json({success: false, data: exception});
								}
							}
						}
					};
					redisServer.redisSub2.on("message",generateFlowGraph_listener);
				} else {
					logger.info("ICE socket not available for Address : %s", name);
					res.send("unavailableLocalServer");
				}
			});
		}
		else{
			logger.info("Error occured in the service flowGraphResults: Invalid Session");
			return res.send("Invalid session");
		}
	}catch(exception){
		console.log(exception);
		logger.error("Error occured in flowGraphResults");
	}
}