var myserver = require('../lib/socket.js');
var logger = require('../../logger');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.DAS_URL;
// var utils = require('../lib/utils');

let headers
module.exports.setReq = async (req) =>
{
	headers=req;
}
exports.flowGraphResults = function(req, res){
	logger.info("Inside UI service: flowGraphResults");
	try{
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username = req.session.username;
		var icename = undefined
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
		var version = req.body.version;
		var path = req.body.path;
		mySocket = myserver.allSocketsMap[clientName][icename];
		if(mySocket != undefined) {
			logger.info("Sending socket request for generateFlowGraph to cachedb");
			var dataToIce = {"emitAction" : "generateFlowGraph","username" : icename, "version":version, "path" : path};
			mySocket.emit("generateFlowGraph", data.version, data.path);
			mySocket.on("flowgraph_result", (message) => {
				data = message;
				try {
					var mySocketUI = myserver.allSocketsMapUI[username];
					mySocketUI.emit("newdata", value);
				} catch (exception) {
					logger.error(exception.message);
				}
			});
			mySocket.on("result_flow_graph_finished", (message) => {
				data = message;
				try {
					var mySocketUI = myserver.allSocketsMapUI[username];
					mySocketUI.emit("endData", value);
					res.status(200).json({success: true});
				} catch (exception) {
					logger.error(exception.message);
					res.status(500).json({success: false, data: exception});
				}
			});
			} else {
				logger.info("ICE socket not available for Address : %s", icename);
				res.send("unavailableLocalServer");
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
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username = req.session.username;
		var icename = undefined
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][icename];	
		if(mySocket != undefined) {	
				var editorName = req.body.editorName;
				var filePath = req.body.filePath;
				var lineNumber = req.body.lineNumber;
				var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
				logger.info("ICE Socket requesting Address: %s" , icename);
				logger.info("Sending socket request for apgOpenFileInEditor to cachedb");
				var dataToIce = {"emitAction" : "apgOpenFileInEditor","username" : icename,
							"editorName":editorName,"filePath":filePath,"lineNumber":lineNumber};
				mySocket.emit("apgOpenFileInEditor", data.editorName, data.filePath, data.lineNumber);
				function apgOpenFileInEditor_listener(message) {
					data = message;
					mySocket.removeListener('apgOpenFileInEditor_listener',apgOpenFileInEditor_listener);
					try {
						res.send(data.value);
					} catch (exception) {
						logger.error(exception.message);
						res.status(500).json({success: false, data: exception});
					}
						
					
				};
				mySocket.on("apgOpenFileInEditor_listener", apgOpenFileInEditor_listener);
			} else {
				logger.info("ICE socket not available for Address : %s", icename);
				res.send("unavailableLocalServer");
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
	try {
		logger.info("Inside UI service: APG_createAPGProject");
		var name = req.session.username;
		var inputs = req.body.data;
		inputs.createdby = name;
		inputs.modifiedby = name;
		inputs.host = headers.headers.host;
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling DAS Service from APG_createAPGProject: /apg/createAPGProject");
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
	} catch(exception) {
		logger.error(exception.message);
		logger.error("Error occurred in APG_createAPGProject");
	}
};

exports.APG_runDeadcodeIdentifier = function(req,res){
	try {
		logger.info("Inside UI service: APG_runDeadcodeIdentifier");
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username = req.session.username;
		var icename = undefined
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][icename];
		if(mySocket != undefined) {
				var version = req.body.version;
				var path = req.body.path;
				logger.info("ICE Socket requesting Address: %s" , icename);
				logger.info("Sending socket request for runDeadcodeIdentifier to cachedb");
				var dataToIce = {"emitAction" : "runDeadcodeIdentifier","username" : icename,
							"version":version,"path":path};
				mySocket.emit("runDeadcodeIdentifier", data.version, data.path);
				function apgRunDeadcodeIdentifier_listener(message) {
					data = message;
					mySocket.removeListener('deadcode_identifier',apgRunDeadcodeIdentifier_listener);
					res.send(data.value);
					
				};
				mySocket.on("deadcode_identifier",apgRunDeadcodeIdentifier_listener);
			} else {
				logger.info("ICE socket not available for Address : %s", icename);
				res.send("unavailableLocalServer");
			}
		
	} catch(exception) {
		logger.error(exception.message);
		logger.error("Error occurred in APG_runDeadcodeIdentifier");
	}
};