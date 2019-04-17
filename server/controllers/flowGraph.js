var myserver = require('../lib/socket.js');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.NDAC_URL;
var utils = require('../lib/utils');
var fs = require('fs');

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
			var valid = fs.existsSync(path);
			if(valid){
				redisServer.redisSubServer.subscribe('ICE2_' + name ,1);
				redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
					if (redisres[1]>0) {
						logger.info("Sending socket request for generateFlowGraph to redis");
						var dataToIce = {"emitAction" : "generateFlowGraph","username" : name, "version":version, "path" : path};
						redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
						function generateFlowGraph_listener(channel,message) {
							data = JSON.parse(message);
							if(name == data.username){
								var value = data.value;
								if (data.onAction == "unavailableLocalServer") {
									redisServer.redisSubServer.removeListener('message',generateFlowGraph_listener);	
									logger.error("Error occurred in flowGraphResults: Socket Disconnected");
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
									redisServer.redisSubServer.removeListener('message',generateFlowGraph_listener);	
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
						redisServer.redisSubServer.on("message",generateFlowGraph_listener);
					} else {
						logger.info("ICE socket not available for Address : %s", name);
						res.send("unavailableLocalServer");
					}
				});
			} else{
				logger.info("The given path does not exists.");
				res.send("invalidPath");
			}
		}
		else{
			logger.info("Error occurred in the service flowGraphResults: Invalid Session");
			return res.send("Invalid session");
		}
	}catch(exception){
		logger.error(exception.message);
		logger.error("Error occurred in flowGraphResults");
	}
}
/**
 * @author nikunj.jain
 * the service is used to open the file (with the line number) in a specified editor
 */
exports.APG_OpenFileInEditor = function (req, res) {
	try {
		logger.info("Inside UI service: APG_OpenFileInEditor");
		if (isSessionActive(req)) {
			var name = req.session.username;
			redisServer.redisSubServer.subscribe('ICE2_' + name);
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]>0) {
					var editorName = req.body.editorName;
					var filePath = req.body.filePath;
					var lineNumber = req.body.lineNumber;
					var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
					logger.info("ICE Socket requesting Address: %s" , name);
					logger.info("Sending socket request for apgOpenFileInEditor to redis");
					var dataToIce = {"emitAction" : "apgOpenFileInEditor","username" : name,
								"editorName":editorName,"filePath":filePath,"lineNumber":lineNumber};
					redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					function apgOpenFileInEditor_listener(channel,message) {
						data = JSON.parse(message);
						if(name == data.username){
							var value = data.value;
							if (data.onAction == "unavailableLocalServer") {
								redisServer.redisSubServer.removeListener('message',apgOpenFileInEditor_listener);	
								logger.error("Error occurred in APG_OpenFileInEditor: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}

							}  else if (data.onAction == "open_file_in_editor_result") {
								redisServer.redisSubServer.removeListener('message',apgOpenFileInEditor_listener);	
								try {
									res.send(data.value);
								} catch (exception) {
									logger.error(exception.message);
									res.status(500).json({success: false, data: exception});
								}
							}
						}
					};
					redisServer.redisSubServer.on("message",apgOpenFileInEditor_listener);
				} else {
					logger.info("ICE socket not available for Address : %s", name);
					res.send("unavailableLocalServer");
				}
			});
		} else {
			logger.error("Error occurred in the service APG_OpenFileInEditor: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service APG_OpenFileInEditor: %s",exception);
	}
};

/**
 * @author nikunj.jain
 * the service is used to create an APG project in the DB
 */
exports.APG_createAPGProject = function(req,res){
	try{
			logger.info("Inside UI service: APG_createAPGProject");
			if(isSessionActive(req)){
				var name = req.session.username;
				var inputs = req.body.data;
				inputs.createdby = name;
				inputs.modifiedby = name;
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from APG_createAPGProject: /apg/createAPGProject");
				client.post(epurl+"apg/createAPGProject", args,
				function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occurred in apg/createAPGProject: APG_createAPGProject service");
						res.status(response.statusCode).json({success: false})
					}
					else {
						res.status(200).json({success: true});
					}
				});
				
			}else {
				logger.error("Error occurred in the service APG_createAPGProject: Invalid Session");
				res.send("Invalid Session");
			}
	}
	catch(exception){
		logger.error(exception.message);
		logger.error("Error occurred in APG_createAPGProject");
	}
};

exports.APG_runDeadcodeIdentifier = function(req,res){
	try{
			logger.info("Inside UI service: APG_runDeadcodeIdentifier");
			if(isSessionActive(req)){
				var name = req.session.username;
				redisServer.redisSubServer.subscribe('ICE2_' + name);
				redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
					if (redisres[1]>0) {
						var version = req.body.version;
						var path = req.body.path;
						logger.info("ICE Socket requesting Address: %s" , name);
						logger.info("Sending socket request for runDeadcodeIdentifier to redis");
						var dataToIce = {"emitAction" : "runDeadcodeIdentifier","username" : name,
									"version":version,"path":path};
						redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
						function apgRunDeadcodeIdentifier_listener(channel,message) {
							data = JSON.parse(message);
							if(name == data.username){
								redisServer.redisSubServer.removeListener('message',apgRunDeadcodeIdentifier_listener);
								if (data.onAction == "unavailableLocalServer") {	
									logger.error("Error occurred in APG_runDeadcodeIdentifier: Socket Disconnected");
									res.send('unavailableLocalServer');
								} else if (data.onAction == "deadcode_identifier")  {
									res.send(data.value);
								}
							}
						};
						redisServer.redisSubServer.on("message",apgRunDeadcodeIdentifier_listener);
					} else {
						logger.info("ICE socket not available for Address : %s", name);
						res.send("unavailableLocalServer");
					}
				});
			}else {
				logger.error("Error occurred in the service APG_runDeadcodeIdentifier: Invalid Session");
				res.send("Invalid Session");
			}
	}
	catch(exception){
		logger.error(exception.message);
		logger.error("Error occurred in APG_runDeadcodeIdentifier");
	}
};