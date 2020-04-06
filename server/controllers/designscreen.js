/*
 * Dependencies.
 */
var myserver = require('../lib/socket');
var async = require('async');
var parse = require('xml-parser');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.NDAC_URL;
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
	var name,value;
	var dataToIce={};
	logger.info("Inside UI service: initScraping_ICE");
	try {
		if (utils.isSessionActive(req)) {
			name = req.session.username;
			redisServer.redisSubServer.subscribe('ICE2_' + name);	
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , name);
			//cr:use utils.getChannelNum('ICE1_scheduling_' + name, function(found)
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]>0) {
					var reqAction = "";
					var reqBody = req.body.screenViewObject;
					if (reqBody.appType == "Desktop") {
						var applicationPath = reqBody.applicationPath;
						var processID = reqBody.processID;
						var scrapeMethod = reqBody.scrapeMethod;
						reqAction = "desktop";
						dataToIce = {"emitAction": "LAUNCH_DESKTOP", "username": name, "applicationPath": applicationPath,
							"processID": processID, "scrapeMethod": scrapeMethod};
					} else if (reqBody.appType == "SAP") {
						var applicationPath = reqBody.applicationPath;
						reqAction = "SAP";
						dataToIce = {"emitAction": "LAUNCH_SAP", "username": name, "applicationPath": applicationPath};
					} else if (reqBody.appType == "OEBS") {
						var applicationPath = reqBody.applicationPath;
						reqAction = "OEBS";
						dataToIce = {"emitAction": "LAUNCH_OEBS", "username": name, "applicationPath": applicationPath};
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
							dataToIce = {"emitAction": "LAUNCH_MOBILE", "username" : name, "deviceName": deviceName,
								"versionNumber": versionNumber, "bundleId":bundleId, "ipAddress": ipAddress, "param": "ios"};
						} else {
							dataToIce = {"emitAction" : "LAUNCH_MOBILE", "username" : name, "apkPath": apkPath, "serial": serial,
								"mobileDeviceName": mobileDeviceName, "mobileIosVersion": mobileIosVersion, "mobileUDID": mobileUDID};
						}
					} else if (reqBody.appType == "MobileWeb") {
						var mobileSerial = reqBody.mobileSerial;
						var androidVersion = reqBody.androidVersion;
						reqAction = "mobile web";
						dataToIce = {"emitAction": "LAUNCH_MOBILE_WEB", "username" : name,
							"mobileSerial": mobileSerial, "androidVersion": androidVersion};
					} else if (req.body.screenViewObject.appType == "pdf"){
						var data = {};
						var browserType = req.body.screenViewObject.appType;
						data.browsertype = browserType;
						dataToIce = {"emitAction" : "PDF_SCRAPE","username" : name, "data":data,"browsertype":browserType};
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
						else if (browserType == "mozilla") data.task = "OPEN BROWSER FX";
						else if (browserType == "safari") data.task = "OPEN BROWSER SF"
						reqAction = "web";
						dataToIce = {"emitAction": "webscrape", "username" : name, "data": data};
					}
					dataToIce.username = name;
					logger.info("Sending socket request for "+dataToIce.emitAction+" to redis");
					redisServer.redisPubICE.publish('ICE1_normal_' + name, JSON.stringify(dataToIce));
					function scrape_listener(channel, message) {
						var data = JSON.parse(message);
						//LB: make sure to send recieved data to corresponding user
						if (name == data.username) {
							redisServer.redisSubServer.removeListener('message', scrape_listener);
							if (data.onAction == "unavailableLocalServer") {
								logger.error("Error occurred in initScraping_ICE: Socket Disconnected");
								if ('socketMapNotify' in myserver && name in myserver.socketMapNotify) {
									var soc = myserver.socketMapNotify[name];
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
					utils.getChannelNum('ICE1_scheduling_' + name, function(found){
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
			if (req.body.type == "WS_screen"){
				inputs.query = "getWSscrapedata";
			}
			else if (req.body.testCaseId){
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
		logger.info("Calling NDAC Service from fetchScrapedData: design/getScrapeDataScreenLevel_ICE");
		client.post(epurl + "design/getScrapeDataScreenLevel_ICE", args,
			function (getScrapeDataQueryresult, response) {
				try {
					if (response.statusCode != 200 || getScrapeDataQueryresult.rows == "fail") {
						logger.error("Error occurred in design/getScrapeDataScreenLevel_ICE from fetchScrapedData Error Code : ERRNDAC");
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
			var updateData = req.body.scrapeObject;
			var projectID = updateData.projectId;
			var screenID = updateData.screenId;
			var screenName = updateData.screenName;
			var userInfo = updateData.userinfo;
			var modifiedByID = userInfo.user_id;
			var modifiedByrole = userInfo.role;//user_role
			var param = updateData.param;
			var appType = updateData.appType;
			var requestedversionnumber = updateData.versionnumber;
			//xpaths required to be mapped(used only when param is mapScrapeData_ICE)
			var requiredXpathList = [];
			//URLs required to be mapped(used only when param is mapScrapeData_ICE)
			var requiredURLList = [];
			var scrapedObjects = {};
			var inputs = {};
			var inputstestcase = {};
			var statusFlag = "";
			dataObj=[]
			newData = updateData.newData;
			type = updateData.type;
			if (param == "updateScrapeData_ICE") {
				try {
					scrapedObjects = updateData.getScrapeData;
					var parsedScrapedObj = JSON.parse(scrapedObjects);
					if (newData != undefined){
						if ("scrapedurl" in newData){
							parsedScrapedObj.scrapedurl = newData.scrapedurl
						}
					}
					if (appType.toUpperCase() === 'WEBSERVICE') {
						if ('body' in parsedScrapedObj) {
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
								if (scrapedObjects.method == 'POST') {
									var requestedBody = scrapedObjects.body[0];
									var requestedHeader = scrapedObjects.header[0];
									if (requestedBody != null &&
										requestedBody != '' &&
										requestedHeader.indexOf('json') === -1) {
										if (requestedBody.indexOf('Envelope') !== -1) {
											var obj = parse(requestedBody);
											if ('root' in obj) {
												temp_flag = false
												var baseRequestBody = obj.root;
												allXpaths = [];
												allCustnames = [];
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
												var baseData = {};
												baseData.endPointURL = scrapedObjects.endPointURL;
												baseData.method = scrapedObjects.method;
												baseData.header = scrapedObjects.header;
												baseData.operations = scrapedObjects.operations;
												baseData.body = scrapedObjects.body;
												baseData.responseHeader = scrapedObjects.responseHeader;
												baseData.responseBody = scrapedObjects.responseBody;
												baseData.view = viewArray;
												scrapedObjects = baseData;
												scrapedObjects = JSON.stringify(scrapedObjects);
												scrapedObjects = scrapedObjects.replace(/'+/g, "''")
											}
										}
									}
								}
							}if (temp_flag == false){
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
						inputs = {
							"scrapedata": scrapedObjects,
							"modifiedby": modifiedByID,
							"screenid": screenID,
							"modifiedByrole":modifiedByrole, 
							"projectid": projectID,
							"screenname": screenName,
							"versionnumber": requestedversionnumber,
							"type": "insert_obj"
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
				try {
					scrapedObjects = updateData.getScrapeData;
					var parsedScrapedObj = JSON.parse(scrapedObjects);
					inputs = {
						"scrapedata": scrapedObjects,
						"modifiedby": modifiedByID,
						"modifiedByrole":modifiedByrole,
						"screenid": screenID,
						"projectid": projectID,
						"screenname": screenName,
						"versionnumber": requestedversionnumber,
						"type": "update_obj"
					};
					logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
					finalFunction(scrapedObjects);
				}
				catch (exception) {
					logger.error("Exception in the edit_updateScrapeData_ICE: %s", exception);
				}

			} else if (param == "delete_updateScrapeData_ICE"){
				scrapedObjects = updateData.getScrapeData;
				//var parsedScrapedObj = JSON.parse(scrapedObjects);
				inputs = {
					"scrapedata": scrapedObjects,
					"modifiedby": modifiedByID,
					"modifiedByrole":modifiedByrole,
					"screenid": screenID,
					"projectid": projectID,
					"screenname": screenName,
					"versionnumber": requestedversionnumber,
					"type": "delete_obj"
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
					if (statusFlag == "" && scrapedObjects != "scrape data error: Fail") {
						var args = {
							data: inputs,
							headers: {
								"Content-Type": "application/json"
							}
						};
						logger.info("Calling NDAC Service from finalFunction: design/updateScreen_ICE");
						client.post(epurl + "design/updateScreen_ICE", args,
							function (result, response) {
							try {
								if (response.statusCode != 200 || result.rows == "fail") {
									statusFlag = "Error occurred in updateScreenData : Fail";
									logger.error("Error occurred in design/updateScreen_ICE from finalFunction Error Code : ERRNDAC");
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
											name = req.session.username;
											redisServer.redisSubServer.subscribe('ICE2_' + name);
											logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
											logger.debug("ICE Socket requesting Address: %s" , name);
											redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
												if (redisres[1]>0){
													var scrapedata = newData;
													logger.info("Sending socket request for checkIrisDuplicate_ICE to redis");
													dataToIce = {"emitAction" : "irisOperations","username" : name, "image_data":scrapedata, "param":"checkDuplicate"};
													redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
													function checkIrisDuplicate_listener(channel,message) {
														var data = JSON.parse(message);
														if(name == data.username){
															redisServer.redisSubServer.removeListener('message',checkIrisDuplicate_listener);
															if (data.onAction == "unavailableLocalServer") {
																logger.error("Error occurred in checkIrisDuplicate_ICE: Socket Disconnected");
																if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
																	var soc = myserver.socketMapNotify[name];
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
			var name = req.session.username;
			redisServer.redisSubServer.subscribe('ICE2_' + name);
			var operation = req.body.object[0];
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , name);
			logger.info("Sending socket request for focus to redis");
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
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
						}
					}
					else if(operation=='decrypt'){
						props={
							action:"userobject",
							xpath:req.body.object[1],
							url:req.body.object[2],
							tag:req.body.object[3],
							operation:operation
						}
					}
					dataToIce = {"emitAction": "webscrape", "username" : name, "data": props};
					redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					function userObjectElement_ICE_listener(channel, message) {
						var data = JSON.parse(message);
						if (name == data.username) {
							redisServer.redisSubServer.removeListener('message', userObjectElement_ICE_listener);
							if (data.onAction == "unavailableLocalServer") {
								logger.error("Error occurred in initScraping_ICE: Socket Disconnected");
								if ('socketMapNotify' in myserver && name in myserver.socketMapNotify) {
									var soc = myserver.socketMapNotify[name];
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
			var name = req.session.username;
			redisServer.redisSubServer.subscribe('ICE2_' + name);
			var focusParam = req.body.elementXpath;
			var elementURL = req.body.elementUrl;
			var appType = req.body.appType;
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , name);
			logger.info("Sending socket request for focus to redis");
			var dataToIce = {"emitAction": "focus", "username": name, "focusParam": focusParam, "elementURL": elementURL, "appType": appType};
			redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
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

exports.updateIrisDataset = function updateIrisDataset(req, res) {
	try{
		logger.info("Inside UI service: updateIrisDataset");
		if (utils.isSessionActive(req)) {
			name = req.session.username;
			image_data = req.body.data;
			redisServer.redisSubServer.subscribe('ICE2_' + name);
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.debug("ICE Socket requesting Address: %s" , name);
			redisServer.redisPubICE.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]>0) {
					logger.info("Sending socket request for updateIrisDataset to redis");
					dataToIce = {"emitAction" : "irisOperations","username" : name, "image_data":image_data, "param":"updateDataset"};
					redisServer.redisPubICE.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					function updateIrisDataset_listener(channel,message) {
						var data = JSON.parse(message);
						if(name == data.username){
							redisServer.redisSubServer.removeListener('message',updateIrisDataset_listener);
							if (data.onAction == "unavailableLocalServer") {
								logger.error("Error occurred in updateIrisDataset: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}
							} else if (data.onAction == "iris_operations_result") {
								if(data.value==true){
									var args = {
										data: image_data,
										headers: {
											"Content-Type": "application/json"
										}
									};
									logger.info("Calling NDAC Service from updateIrisDataset: design/updateIrisObjectType");
									client.post(epurl + "design/updateIrisObjectType", args,
										function (result, response) {
										try {
											if (response.statusCode != 200 || result.rows == "fail") res.send(false);
											else if (result.rows == "unsavedObject") res.send("unsavedObject");
											else res.send(true);
										} catch (exception) {
											logger.error("Exception in the service updateIrisObjectType: %s", exception);
											res.send(false);
										}
									});
								}
								else  res.send(data.value);
							}
						}
					}
					redisServer.redisSubServer.on("message",updateIrisDataset_listener);
				} else {
					utils.getChannelNum('ICE1_scheduling_' + name, function(found){
						var flag="";
						if (found) flag = "scheduleModeOn";
						else {
							flag = "unavailableLocalServer";
							logger.info("ICE Socket not Available");
						}
						res.send(flag);
					});
				}
			});
		} else {
			logger.error("Error occurred in the service updateIrisDataset: Invalid Session");
			res.send("Invalid Session");
		}
	} catch(exception){
		logger.error("Exception in the service updateIrisDataset: %s", exception);
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

function parseRequest(readChild) {
	try {
		logger.info("Inside the function parseRequest ");
		if ('name' in readChild) {
			if (xpath == "") {
				xpath = "/" + readChild.name;
					allXpaths.push(xpath);
				allCustnames.push(readChild.name);
			}
			if ('attributes' in readChild) {
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
			if ('children' in readChild) {
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
