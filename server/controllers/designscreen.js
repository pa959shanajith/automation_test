/*
 * Dependencies.
 */
var myserver = require('../lib/socket');
var async = require('async');
var parse = require('xml-parser');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.DAS_URL;
var logger = require('../../logger');
//xpath for view
var allXpaths = [];
//custname for view
var allCustnames = [];
var objectLevel = 1;
var xpath = "";
var inputsWS = {};
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');

exports.initScraping_ICE = function (req, res) {
	var icename,value,username;
	var dataToIce={};
	logger.info("Inside UI service: initScraping_ICE");
	try {
		if (utils.isSessionActive(req)) {
			username=req.session.username;
			icename = undefined
			if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
			redisServer.redisSubServer.subscribe('ICE2_' + icename);	
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , icename);
			//cr:use utils.getChannelNum('ICE1_scheduling_' + name, function(found)
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + icename,function(err,redisres){
				if (redisres[1]>0) {
					var reqAction = "";
					var reqBody = req.body.screenViewObject;
					if (reqBody.appType == "Desktop") {
						var applicationPath = reqBody.applicationPath;
						var processID = reqBody.processID;
						var scrapeMethod = reqBody.scrapeMethod;
						reqAction = "desktop";
						dataToIce = {"emitAction": "LAUNCH_DESKTOP", "username": icename, "applicationPath": applicationPath,
							"processID": processID, "scrapeMethod": scrapeMethod};
					} else if (reqBody.appType == "SAP") {
						var applicationPath = reqBody.applicationPath;
						reqAction = "SAP";
						dataToIce = {"emitAction": "LAUNCH_SAP", "username": icename, "applicationPath": applicationPath};
					} else if (reqBody.appType == "OEBS") {
						var applicationPath = reqBody.applicationPath;
						reqAction = "OEBS";
						dataToIce = {"emitAction": "LAUNCH_OEBS", "username": icename, "applicationPath": applicationPath};
					} else if (reqBody.appType == "MobileApp") {
						var apkPath = reqBody.apkPath;
						var serial = reqBody.mobileSerial;
						var mobileDeviceName = reqBody.mobileDeviceName;
						var mobileIosVersion = reqBody.mobileIosVersion;
						var mobileUDID = reqBody.mobileUDID;
						var deviceName = reqBody.deviceName;
						var versionNumber = reqBody.versionNumber;
						var bundleId = reqBody.bundleId;
						var ipAddress = reqBody.ipAddress;
						reqAction = "mobile";
						if(reqBody.param == 'ios') {
							dataToIce = {"emitAction": "LAUNCH_MOBILE", "username" : icename, "deviceName": deviceName,
								"versionNumber": versionNumber, "bundleId":bundleId, "ipAddress": ipAddress, "param": "ios"};
						} else {
							dataToIce = {"emitAction" : "LAUNCH_MOBILE", "username" : icename, "apkPath": apkPath, "serial": serial,
								"mobileDeviceName": mobileDeviceName, "mobileIosVersion": mobileIosVersion, "mobileUDID": mobileUDID};
						}
					} else if (reqBody.appType == "MobileWeb") {
						var data = {action: "scrape"};
						// var browserType = reqBody.browserType;
						var mobileSerial = reqBody.mobileSerial;
						var androidVersion = reqBody.androidVersion;
						if (reqBody.action == 'compare') {
							data.viewString = reqBody.viewString.view;
							if ("scrapedurl" in reqBody.viewString){
								data.scrapedurl = reqBody.viewString.scrapedurl;
							}
							else{
								data.scrapedurl = "";
							}
							data.scrapedurl = reqBody.viewString.scrapedurl;
							data.action = reqBody.action;
						}
						if (browserType == "chrome") data.task = "MOBILE CHROME BROWSER";
						reqAction = "mobile web";
						dataToIce = {"emitAction": "LAUNCH_MOBILE_WEB", "username" : icename,
							"mobileSerial": mobileSerial, "androidVersion": androidVersion, "data": data};
					} else if (req.body.screenViewObject.appType == "pdf"){
						var data = {};
						var browserType = req.body.screenViewObject.appType;
						data.browsertype = browserType;
						dataToIce = {"emitAction" : "PDF_SCRAPE","username" : icename, "data":data,"browsertype":browserType};
					} else {  //Web Scrape
						var data = {action: "scrape"};
						var browserType = reqBody.browserType;
						if (reqBody.action == 'compare') {
							data.viewString = reqBody.viewString.view;
							if ("scrapedurl" in reqBody.viewString){
								data.scrapedurl = reqBody.viewString.scrapedurl;
							}
							else{
								data.scrapedurl = "";
							}
							data.scrapedurl = reqBody.viewString.scrapedurl;
							data.action = reqBody.action;
						}
						if (browserType == "chrome") data.task = "OPEN BROWSER CH";
						else if (browserType == "ie") data.task = "OPEN BROWSER IE";
						else if (browserType == "edge") data.task = "OPEN BROWSER EDGE";
						else if (browserType == "chromium") data.task = "OPEN BROWSER CHROMIUM";
						else if (browserType == "mozilla") data.task = "OPEN BROWSER FX";
						else if (browserType == "safari") data.task = "OPEN BROWSER SF"
						reqAction = "web";
						dataToIce = {"emitAction": "webscrape", "username" : icename, "data": data};
					}
					dataToIce.username = icename;
					logger.info("Sending socket request for "+dataToIce.emitAction+" to cachedb");
					redisServer.redisPubICE.publish('ICE1_normal_' + icename, JSON.stringify(dataToIce));
					function scrape_listener(channel, message) {
						var data = JSON.parse(message);
						//LB: make sure to send recieved data to corresponding user
						if (icename == data.username && ["unavailableLocalServer", "scrape"].includes(data.onAction)) {
							redisServer.redisSubServer.removeListener('message', scrape_listener);
							if (data.onAction == "unavailableLocalServer") {
								logger.error("Error occurred in initScraping_ICE: Socket Disconnected");
								if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
									var soc = myserver.socketMapNotify[username];
									soc.emit("ICEnotAvailable");
								}
							} else {
								value = data.value;
								logger.info("Sending "+reqAction+" scraped objects from initScraping_ICE");
								res.send(value);
							}
						}
					}
					redisServer.redisSubServer.on("message",scrape_listener);
				} else {
					logger.error("Error occurred in the service initScraping_ICE: Socket not Available");
					utils.getChannelNum('ICE1_scheduling_' + icename, function(found){
						var flag = (found)? "scheduleModeOn" : "unavailableLocalServer";
						res.send(flag);
					});
				}
			});
		} else {
			logger.error("Error occurred in the service initScraping_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service initScraping_ICE: %s",exception);
		res.send("fail");
	}
};

exports.getScrapeDataScreenLevel_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: getScrapeDataScreenLevel_ICE");
		if (utils.isSessionActive(req)) {
			var inputs = {
				"screenid": req.body.screenId,
				"projectid": req.body.projectId,
				"query": "getscrapedata"
			};
			if (req.body.type == "WS_screen" || req.body.type== "Webservice"){
				inputs.query = "getWSscrapedata";
			}
			if (req.body.testCaseId){
				inputs.testcaseid = req.body.testCaseId;//Send versionnumber also if needed
				delete inputs['screenid'];
			}
			logger.info("Calling function fetchScrapedData from getScrapeDataScreenLevel_ICE service");
			fetchScrapedData(inputs, function (err, getScrapeDataQueryresponse) {
				logger.info("Scraped Data sent successfully from getScrapeDataScreenLevel_ICE service");
				res.send(getScrapeDataQueryresponse);
			});
		} else {
			logger.error("Error occurred in the service getScrapeDataScreenLevel_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service getScrapeDataScreenLevel_ICE: %s",exception);
		res.send("fail");
	}
};

function fetchScrapedData(inputs, fetchScrapedDatacallback) {
	try {
		logger.info("Inside the function fetchScrapedData ");
		var responsedata;
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling DAS Service from fetchScrapedData: design/getScrapeDataScreenLevel_ICE");
		client.post(epurl + "design/getScrapeDataScreenLevel_ICE", args,
			function (getScrapeDataQueryresult, response) {
				try {
					if (response.statusCode != 200 || getScrapeDataQueryresult.rows == "fail") {
						logger.error("Error occurred in design/getScrapeDataScreenLevel_ICE from fetchScrapedData Error Code : ERRDAS");
						fetchScrapedDatacallback("getScrapeData Fail", null);
					} else {
						responsedata = JSON.stringify(getScrapeDataQueryresult.rows)
						fetchScrapedDatacallback(null, responsedata);
					}
				} catch (exception) {
					logger.error("Exception while sending scraped data from the function fetchScrapedData: %s",exception);
				}
			});
	} catch (exception) {
		logger.error("Exception in the function fetchScrapedData: %s",exception);
	}
}

exports.updateScreen_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: updateScreen_ICE");
		if (utils.isSessionActive(req)) {
			var username = req.session.username;
			var modifiedByID = req.session.userid;
			var modifiedByrole = req.session.activeRoleId;
			var updateData = req.body.scrapeObject;
			var projectID = updateData.projectId;
			var screenID = updateData.screenId;
			var screenName = updateData.screenName;
			var param = updateData.param;
			// var delete_list = updateData.delete_list;
			var update_list = updateData.update_list;
			// var insert_list = updateData.insert_list;
			var appType = updateData.appType;
			var requestedversionnumber = updateData.versionnumber;
			//xpaths required to be mapped(used only when param is mapScrapeData_ICE)
			// var requiredXpathList = [];
			//URLs required to be mapped(used only when param is mapScrapeData_ICE)
			// var requiredURLList = [];
			var scrapedObjects = {};
			var inputs = {};
			// var inputstestcase = {};
			var statusFlag = "";
			dataObj=[]
			newData = updateData.newData;
			type = updateData.type;
			var regEx = /[<>]/;
			var scrape_err="Error: Special characters <> not allowed!!";
			if (param == "updateScrapeData_ICE") {
				try {
					scrapedObjects = updateData.getScrapeData;
					var parsedScrapedObj = JSON.parse(scrapedObjects);
					if (parsedScrapedObj.view) {
						for (var i=0;i<parsedScrapedObj.view.length;i++) {
							if (regEx.test(parsedScrapedObj.view[i].custname)) {
								logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE. "+scrape_err);
								return finalFunction("Fail");
							}
						}
					}
					if (newData != undefined){
						if ("scrapedurl" in newData){
							parsedScrapedObj.scrapedurl = newData.scrapedurl
						}
					}
					if (appType.toUpperCase() === 'WEBSERVICE') {
						if (parsedScrapedObj.method == 'POST' && parsedScrapedObj.body) {
							parsedScrapedObj.body[0] = parsedScrapedObj.body[0].replace(/'+/g, "\"");
						}
					}
					else{
						for(var i=0;i<parsedScrapedObj.view.length;i++){
							if(!('_id'  in parsedScrapedObj.view[i]))
							{
								dataObj.push(parsedScrapedObj.view[i])
							}
						}
						parsedScrapedObj.view = dataObj
					}
					//why 2 stringyfy
					scrapedObjects = JSON.stringify(parsedScrapedObj);
					//scrapedObjects = JSON.stringify(scrapedObjects);
					scrapedObjects = scrapedObjects.replace(/'+/g, "''");
					var newParse;
					if (scrapedObjects != null && scrapedObjects.trim() != '' && scrapedObjects != undefined) {
						newParse = JSON.parse(scrapedObjects);
					} else {
						newParse = JSON.parse("{}");
					}
					scrapedObjects = newParse;
					if (appType.toUpperCase() === 'WEBSERVICE') {
						var temp_flag=true;
						try {
							var viewArray = [];
							if ('method' in scrapedObjects &&
								'header' in scrapedObjects &&
								'body' in scrapedObjects) {
								var method = scrapedObjects.method;
								var requestedparam = scrapedObjects.param;
								if (method == 'POST') {
									var requestedBody = scrapedObjects.body;
									var requestedHeader = scrapedObjects.header;
									if (method == 'POST' && requestedBody != null &&
										requestedBody != ''){
										if(requestedHeader.indexOf('json') === -1){
											if (requestedBody.indexOf('Envelope') !== -1) {
												var obj = parse(requestedBody);
												if ('root' in obj) {
													temp_flag = false
													var baseRequestBody = obj.root;
													allXpaths = [];
													allCustnames = [];
													//Parsing Request Parameters
													if (requestedparam.trim() != ""){
														var reqparams=parseRequestParam(requestedparam);
														if (reqparams.length>0) viewArray.concat(reqparams);
													}
													try {
														logger.info("Calling function parseRequest from the service updateScreen_ICE: updateScrapeData_ICE");
														parseRequest(baseRequestBody);

													} catch (exception) {
														logger.error(exception.message);
													}
													for (var populationindex = 0; populationindex < allXpaths.length; populationindex++) {
														var scrapedObjectsWS = {};
														scrapedObjectsWS.xpath = allXpaths[populationindex];
														scrapedObjectsWS.custname = allCustnames[populationindex];
														scrapedObjectsWS.tag = "elementWS";
														viewArray.push(scrapedObjectsWS);
													}
													scrapedObjects.view = viewArray;
													scrapedObjects = JSON.stringify(scrapedObjects);
													scrapedObjects = scrapedObjects.replace(/'+/g, "''")
												}
											}else{
												logger.error("Invalid Request header or Request body for XML")
												scrapedObjects="Fail";
											}
										}
										else if(requestedHeader.indexOf('json') !== -1){
											try{
												//Parsing Request Parameters
												if (requestedparam.trim() != ""){
													var reqparams=parseRequestParam(requestedparam);
													if (reqparams.length>0) viewArray.concat(reqparams);
												}
												//Parsing Request Body
												requestedBody=JSON.parse(requestedBody)
												var xpaths=parseJsonRequest(requestedBody,"","");
												for (var object of xpaths) {
													var scrapedObjectsWS = {};
													scrapedObjectsWS.xpath = object;
													scrapedObjectsWS.custname = object;
													scrapedObjectsWS.tag = "elementWS";
													viewArray.push(scrapedObjectsWS);
												}
												if (viewArray.length>0) scrapedObjects.view=viewArray;

											}
											catch(Exception){
												logger.error("Invalid Request body for RestAPI")
												scrapedObjects="Fail";
											}
										}else{
											logger.error("Invalid Request header or Request body")
											scrapedObjects="Fail";
										}
									}
								}else if (method=='GET' && requestedparam.trim() !='') {
									try{
										//Parsing Request Parameters
										if (requestedparam.trim() != ""){
											var reqparams=parseRequestParam(requestedparam);
											if (reqparams.length>0){
												scrapedObjects.view=reqparams;
											}
										}	
									}catch(Exception){
										logger.error("Invalid Request Header for GET API")
										scrapedObjects="Fail";
									}
								}
							}
							
							if (temp_flag == false){
								inputs = {
									"query": "updatescreen",
									"scrapedata": scrapedObjects,
									"modifiedby": modifiedByID,
									"modifiedByrole":modifiedByrole,
									"screenid": screenID,
									"projectid": projectID,
									"screenname": screenName,
									"versionnumber": requestedversionnumber,
									"type": "WS_obj"
								}
							}
							else{
								inputs = buildObject(scrapedObjects, modifiedByID, modifiedByrole, screenID, projectID, screenName, requestedversionnumber);
							}
							logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
							finalFunction(scrapedObjects);
						} catch (exception) {
							logger.error("Exception from the service updateScreen_ICE: updateScrapeData_ICE - WEBSERVICE: %s",exception);
						}
					} else {
						if(type == 'delete') deleteList=updateData.delete_list
						else deleteList=[]
						if(updateData.update_list != '') updateList=updateData.update_list
						else updateList=[]
						inputs = {
							"scrapedata": scrapedObjects,
							"modifiedby": modifiedByID,
							"screenid": screenID,
							"modifiedByrole":modifiedByrole, 
							"projectid": projectID,
							"screenname": screenName,
							"versionnumber": requestedversionnumber,
							"type": "insert_obj",
							"delete_list": deleteList,
							"update_list": updateList
						};
						if (updateData.propedit != undefined){
							inputs.propedit = updateData.propedit
						}
						logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
						finalFunction(scrapedObjects);
					}
				} catch (exception) {
					logger.error("Exception from the service updateScreen_ICE: updateScrapeData_ICE: %s",exception);
				}
			}else if (param == "importScreen") {
				try {
					for(var i=0;i<newData.view.length;i++){
						if(regEx.test(newData.view[i].custname)){
							logger.info("Calling final function from the service updateScreen_ICE: importScreen. "+scrape_err);
							return finalFunction("Fail");
						}
					}
					scrapedObjects.view = newData.view;
					scrapedObjects.mirror = newData.mirror;
					scrapedObjects.scrapedurl = newData.scrapedurl;
					scrapeinfo = { 
						"body" : newData.body,
						"endPointURL" : newData.endPointURL,
						"header" : newData.header,
						"method" : newData.method,
						"operations" : newData.operations,
						"responseBody" : newData.responseBody,
						"responseHeader" : newData.responseHeader
					};
					scrapedObjects.scrapeinfo =scrapeinfo
					scrapedObjects = JSON.stringify(scrapedObjects);
					scrapedObjects = scrapedObjects.replace(/'+/g, "''");
					inputs = {
						"scrapedata": scrapedObjects,
						"modifiedby": modifiedByID,
						"modifiedByrole":modifiedByrole,
						"screenid": screenID,
						"projectid": projectID,
						"screenname": screenName,
						"versionnumber": requestedversionnumber,
						"type": "importScreen"
					};
					logger.info("Calling final function from the service updateScreen_ICE: importScreen");
					finalFunction(newData);
				} catch (exception) {
					logger.error("Exception from the service updateScreen_ICE: importScreen: %s",exception);
				}
			}else if (param == "mapScrapeData_ICE") {
				//add double type check tag=[button,textbox..]
				updateObj = updateData.toMerge
				deleteObj = updateData.fromMerge
				try{
					inputs = {
						"scrapedata": [deleteObj,updateObj],
						"modifiedby": modifiedByID,
						"modifiedByrole":modifiedByrole,
						"screenid": screenID,
						"projectid": projectID,
						"screenname": screenName,
						"versionnumber": requestedversionnumber,
						"type": "map_obj"
					};
					logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
					finalFunction(scrapedObjects);
				}catch (exception) {
					logger.error("Exception in the mapScrapeData_ICE: %s", exception);
				}
			} else if (param == 'updateComparedObjects') {
				//Update changed objects
				if ("changedobject" in updateData.updatedViewString.view[0]){
					updateData.updatedViewString.view[0]
				}
				scrapedObjects.view = updateData.updatedViewString.view[0].changedobject;
				scrapedObjects.mirror = updateData.updatedViewString.mirror;
				scrapedObjects.scrapedin = updateData.updatedViewString.scrapedin;
				scrapedObjects.scrapetype = updateData.updatedViewString.scrapetype;
				scrapedObjects.scrapedurl = updateData.updatedViewString.scrapedurl;
				scrapedObjects = JSON.stringify(scrapedObjects);
				scrapedObjects = scrapedObjects.replace(/'+/g, "''");
				inputs = {
					"scrapedata": scrapedObjects,
					"modifiedby": modifiedByID,
					"modifiedByrole":modifiedByrole,
					"screenid": screenID,
					"projectid": projectID,
					"screenname": screenName,
					"versionnumber": requestedversionnumber,
					"type": "compare_obj"
				};
				finalFunction(scrapedObjects);	
			} else if (param == 'edit_updateScrapeData_ICE'){
				if(updateData.insert_list != '') insertList=updateData.insert_list
				else insertList=[]
				try {
					scrapedObjects = updateData.getScrapeData;
					var parsedScrapedObj = JSON.parse(scrapedObjects);
					for(var i=0;i<parsedScrapedObj.length;i++){
						if(regEx.test(parsedScrapedObj[i][1])){
							logger.info("Calling final function from the service updateScreen_ICE: importScreen. "+scrape_err);
							return finalFunction("Fail");
						}
					}
					inputs = {
						"scrapedata": scrapedObjects,
						"modifiedby": modifiedByID,
						"modifiedByrole":modifiedByrole,
						"screenid": screenID,
						"projectid": projectID,
						"screenname": screenName,
						"versionnumber": requestedversionnumber,
						"type": "update_obj",
						"insert_list": insertList
					};
					logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
					finalFunction(scrapedObjects);
				}
				catch (exception) {
					logger.error("Exception in the edit_updateScrapeData_ICE: %s", exception);
				}

			} else if (param == "delete_updateScrapeData_ICE"){
				scrapedObjects = updateData.getScrapeData;
				if (updateData.update_list== "") update_list=[]
				else update_list=updateData.update_list
				if(updateData.insert_list != '') insertList=updateData.insert_list
						else insertList=[]
				//var parsedScrapedObj = JSON.parse(scrapedObjects);
				inputs = {
					"scrapedata": scrapedObjects,
					"modifiedby": modifiedByID,
					"modifiedByrole":modifiedByrole,
					"screenid": screenID,
					"projectid": projectID,
					"screenname": screenName,
					"versionnumber": requestedversionnumber,
					"type": "delete_obj",
					"update_list": update_list,
					"insert_list": insertList
				};
				logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
				finalFunction(scrapedObjects)

			}
			function sortNumber(a, b) {
				return a - b;
			}
			//this code will be called only if the statusFlag is empty.
			function finalFunction(scrapedObjects, finalcallback) {
				logger.info("Inside the finalFunction: service updateScreen_ICE");
				allXpaths=[];
				allCustnames=[];
				try {
					if (statusFlag == "" && scrapedObjects != "Fail") {
						var args = {
							data: inputs,
							headers: {
								"Content-Type": "application/json"
							}
						};
						logger.info("Calling DAS Service from finalFunction: design/updateScreen_ICE");
						client.post(epurl + "design/updateScreen_ICE", args,
							function (result, response) {
							try {
								if (response.statusCode != 200 || result.rows == "fail") {
									statusFlag = "Error occurred in updateScreenData : Fail";
									logger.error("Error occurred in design/updateScreen_ICE from finalFunction Error Code : ERRDAS");
									try {
										res.send(statusFlag);
									} catch (exception) {
										logger.error("Exception while sending response in design/updateScreen_ICE from the finalFunction: %s", exception);
									}
								} else {
									if(param == "delete_updateScrapeData_ICE"){
										res.send("success");return;
									}
									if(param == "mapScrapeData_ICE"){
										res.send("success");return;
									}
									if (param == "edit_updateScrapeData_ICE"){
										res.send("success");return;
									} else {
										var check_for_duplicate_images = false;
										if(type=='save' && newData['view'] != undefined){
											for(var i=0;i<newData['view'].length;i++){
												if(newData['view'][i]['cord']!=null && newData['view'][i]['cord']!=''){
													check_for_duplicate_images = true;
													if(newData['view'][i]['tag']=='constant'){
														check_for_duplicate_images = false;
														break;
													}
												}
												else{
													check_for_duplicate_images = false;
													break;
												}
											}
										}
										if(!check_for_duplicate_images){
											res.send("success");
										}
										else{
											var icename = undefined
											if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
											redisServer.redisSubServer.subscribe('ICE2_' + icename);
											logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
											logger.debug("ICE Socket requesting Address: %s" , icename);
											redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + icename,function(err,redisres){
												if (redisres[1]>0){
													var scrapedata = newData;
													logger.info("Sending socket request for checkIrisDuplicate_ICE to cachedb");
													dataToIce = {"emitAction" : "irisOperations","username" : icename, "image_data":scrapedata, "param":"checkDuplicate"};
													redisServer.redisPubICE.publish('ICE1_normal_' + icename,JSON.stringify(dataToIce));
													function checkIrisDuplicate_listener(channel,message) {
														var data = JSON.parse(message);
														if(icename == data.username && ["unavailableLocalServer", "iris_operations_result"].includes(data.onAction)){
															redisServer.redisSubServer.removeListener('message',checkIrisDuplicate_listener);
															if (data.onAction == "unavailableLocalServer") {
																logger.error("Error occurred in checkIrisDuplicate_ICE: Socket Disconnected");
																if('socketMapNotify' in myserver &&  username in myserver.socketMapNotify){
																	var soc = myserver.socketMapNotify[username];
																	soc.emit("ICEnotAvailable");
																}
															} else if (data.onAction == "iris_operations_result") {
																if(data.value.length==0)
																	res.send("success");
																else
																	res.send(data.value);
															}
														}
													}
													redisServer.redisSubServer.on("message",checkIrisDuplicate_listener);
												}
												else res.send("success");
											});
										}
									}
								}
							} catch (exception) {
								logger.error("Exception in the finalFunction: %s", exception);
							}
						});
					}else{
						statusFlag = "Invalid Input";
						res.send(statusFlag); 
					}
					finalcallback;
				} catch (exception) {
					logger.error("Exception in the finalFunction: %s", exception);
				}
			}
		} else {
			logger.error("Error occurred in the finalFunction: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the finalFunction: %s", exception);
	}
};

exports.userObjectElement_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: userObjectElement_ICE");
		if (utils.isSessionActive(req)) {
			var username=req.session.username;
			var icename = undefined
			if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
			redisServer.redisSubServer.subscribe('ICE2_' + icename);
			var operation = req.body.object[0];
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , icename);
			logger.info("Sending socket request for focus to cachedb");
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + icename,function(err,redisres){
				if (redisres[1]>0) {
					if(operation=='encrypt'){
						props={
							action:"userobject",
							url:req.body.object[1],
							name:req.body.object[2],
							rpath:req.body.object[3],
							apath:req.body.object[4],
							classname:req.body.object[5],
							id:req.body.object[6],
							selector:req.body.object[7],
							tagname:req.body.object[8],
							operation:operation
						};
						dataToIce = {"emitAction": "webscrape", "username" : icename, "data": props};
					}
					else if(operation=='decrypt'){
						props={
							action:"userobject",
							xpath:req.body.object[1],
							url:req.body.object[2],
							tag:req.body.object[3],
							operation:operation
						};
						dataToIce = {"emitAction": "webscrape", "username" : icename, "data": props};
					}
					else if(operation=='saveirisimage_Desktop'){
						props={
							action:"update_dataset",
							cord:req.body.object[1],
							type:req.body.object[2],
							id:req.body.object[3],
							operation:operation
						};
						dataToIce = {"emitAction": "LAUNCH_DESKTOP_iris", "username" : icename, "data": props};
					}
					else if(operation=='saveirisimage_OEBS'){
						props={
							action:"update_dataset",
							cord:req.body.object[1],
							type:req.body.object[2],
							id:req.body.object[3],
							operation:operation
						};
						dataToIce = {"emitAction": "LAUNCH_OEBS_iris", "username" : icename, "data": props};
					}
					else if(operation=='saveirisimage_SAP'){
						props={
							action:"update_dataset",
							cord:req.body.object[1],
							type:req.body.object[2],
							id:req.body.object[3],
							operation:operation
						};
						dataToIce = {"emitAction": "LAUNCH_SAP_iris", "username" : icename, "data": props};
					}
					else if(operation=='saveirisimage_Web'){
						props={
							action:"update_dataset",
							cord:req.body.object[1],
							type:req.body.object[2],
							id:req.body.object[3],
							operation:operation
						};
						dataToIce = {"emitAction": "webscrape", "username" : icename, "data": props};
					}
					redisServer.redisPubICE.publish('ICE1_normal_' + icename,JSON.stringify(dataToIce));
					function userObjectElement_ICE_listener(channel, message) {
						var data = JSON.parse(message);
						if (icename == data.username && ["unavailableLocalServer", "scrape"].includes(data.onAction)) {
							redisServer.redisSubServer.removeListener('message', userObjectElement_ICE_listener);
							if (data.onAction == "unavailableLocalServer") {
								logger.error("Error occurred in initScraping_ICE: Socket Disconnected");
								if ('socketMapNotify' in myserver && username in myserver.socketMapNotify) {
									var soc = myserver.socketMapNotify[username];
									soc.emit("ICEnotAvailable");
								}
							} else {
								value = data.value;
								logger.info("Sending objects");
								res.send(value);
							}
						}
					}
					redisServer.redisSubServer.on("message",userObjectElement_ICE_listener);
					logger.info("Successfully updated userdefined object");
				} else {
					logger.error("Error occurred in the service initScraping_ICE: Socket not Available");
					res.send("unavailableLocalServer")
				}
			})
		} else {
			logger.error("Error occurred in the service userObjectElement_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service userObjectElement_ICE: %s",exception);
		res.send("fail");
	}
};

exports.highlightScrapElement_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: highlightScrapElement_ICE");
		if (utils.isSessionActive(req)) {
			var username=req.session.username;
			var icename = undefined
			if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
			redisServer.redisSubServer.subscribe('ICE2_' + icename);
			var focusParam = req.body.elementXpath;
			var elementURL = req.body.elementUrl;
			var appType = req.body.appType;
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , icename);
			logger.info("Sending socket request for focus to cachedb");
			var dataToIce = {"emitAction": "focus", "username": icename, "focusParam": focusParam, "elementURL": elementURL, "appType": appType};
			redisServer.redisPubICE.publish('ICE1_normal_' + icename,JSON.stringify(dataToIce));
			logger.info("Successfully highlighted selected object");
			res.send('success');
		} else {
			logger.error("Error occurred in the service highlightScrapElement_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service highlightScrapElement_ICE: %s",exception);
		res.send("fail");
	}
};

exports.updateIrisDataset = async(req, res) => {
	try{
		logger.info("Inside UI service: updateIrisDataset");
		var image_data = req.body.data;
		const result = await utils.fetchData(image_data, "design/updateIrisObjectType", 'updateIrisDataset');
		res.send(result)
	} catch(exception){
		logger.error("Exception in the service updateIrisDataset: %s", exception);
		res.send("fail");
	}
}

function buildObject(scrapedObjects, modifiedBy, modifiedByrole, screenID, projectID, screenName, requestedversionnumber) {
	logger.info("Inside the function buildObject");
	try {
		scrapedObjects = JSON.stringify(scrapedObjects);
		scrapedObjects = scrapedObjects.replace(/'+/g, "''");
		inputsWS = {
			"scrapedata": scrapedObjects,
			"modifiedby": modifiedBy,
			"modifiedByrole":modifiedByrole,
			"screenid": screenID,
			"projectid": projectID,
			"screenname": screenName,
			"versionnumber": requestedversionnumber,
			"type": "WS_obj"
		};
		return inputsWS;
	} catch (exception) {
		logger.error("Exception in the function buildObject: %s", exception);
	}
}

function parseRequestParam(paramerters){
	logger.info("Inside the function parseRequest ");
	var paramsArray=[];
	try{
		var params=paramerters.split('##');
		for (var object of params) {
			object=object.split("=");
			var scrapedObjectsWS = {};
			scrapedObjectsWS.xpath = object[0].trim();
			scrapedObjectsWS.custname = object[0].trim();
			scrapedObjectsWS.tag = "elementWS";
			paramsArray.push(scrapedObjectsWS);
		}
	}catch (Exception){
		logger.info("Exception in the function parseRequest : %s",exception);
	}	
	return paramsArray										
}


function parseRequest(readChild) {
	try {
		logger.info("Inside the function parseRequest ");
		if (readChild.name) {
			if (xpath == "") {
				xpath = "/" + readChild.name;
					allXpaths.push(xpath);
				allCustnames.push(readChild.name);
			}
			if (readChild.attributes) {
				var attrchildren = Object.keys(readChild.attributes);
				if (attrchildren.length >= 1) {
					var basexpath = xpath;
					for (var attrindex = 0; attrindex < attrchildren.length; attrindex++) {
						var newLevel = attrchildren[attrindex];
						if (xpath == undefined) {
							xpath = "";
						}
						var custname = readChild.name + "_" + newLevel;
						xpath = xpath + "/" + newLevel;
						allCustnames.push(custname);
						allXpaths.push(xpath);
						xpath = basexpath;
					}
				}
			}
			if (readChild.children) {
				if (readChild.children.length >= 1) {
					var basexpath = xpath;
					for (var childrenindex = 0; childrenindex < readChild.children.length; childrenindex++) {
						objectLevel = objectLevel + 1;
						var newLevel = readChild.children[childrenindex].name;
						if (xpath == undefined || xpath == 'undefined') {
							xpath = "";
						}
						xpath = xpath + "/" + newLevel;
						allCustnames.push(newLevel);
						allXpaths.push(xpath);
						parseRequest(readChild.children[childrenindex]);
						xpath = basexpath;
						objectLevel = objectLevel - 1;
					}
				}
			}
		}
	} catch (exception) {
		logger.error("Exception in the function parseRequest: %s", exception);
	}
}


function parseJsonRequest(requestedBody,base_key,cur_key) {
	xpaths=[]
	try {
		logger.info("Inside the function parseRequest ");
     	for (var key in requestedBody){
			 var value=requestedBody[key];
			 if (typeof(value)==="object" && !(Array.isArray(value))){
				if (base_key!== "")  base_key+='/'+key;
				else  base_key=key;
				xpaths.push(base_key);
				xpaths.concat(parseJsonRequest(value,base_key,key));
				base_key=base_key.slice(0,-key.length-1);

			 }else if(Array.isArray(value)){
				for (var i=0;i<value.length;i++){
					base_key+=key+"["+i.toString()+"]";
					xpaths.concat(parseJsonRequest(value[i],base_key,key));
				}
					
			 }else{
				xpaths.push(base_key+'/'+key);
			 }
		 }
		 base_key=base_key.slice(0,-cur_key.length);
     	 
	} catch (exception) {
		logger.error("Exception in the function parseRequest: %s", exception);
	}
	return xpaths
}