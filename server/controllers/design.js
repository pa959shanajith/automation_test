/**
 * Dependencies.
 */
var myserver = require('../lib/socket');
var async = require('async');
var parse = require('xml-parser');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = "http://"+process.env.NDAC_IP+":"+process.env.NDAC_PORT+"/";
var logger = require('../../logger');
//base RequestElement
var baseRequestBody = {};
//xpath for view
var allXpaths = [];
//custname for view
var allCustnames = [];
var objectLevel = 1;
var xpath = "";
var inputsWS = {};
//var sessionExtend = new Date(Date.now() + ); // 30 minutes 
var sessionTime = 30 * 60 * 1000;
var updateSessionTimeEvery = 20 * 60 * 1000;
var redisServer = require('../lib/redisSocketHandler');

function isSessionActive(req){
	var sessionToken = req.session.uniqueId;
    return sessionToken != undefined && req.session.id == sessionToken;
}


/**
 * @author vinay.niranjan
 * @modified author vinay.niranjan
 * the service is used to init scraping & fetch scrape objects
 */
exports.initScraping_ICE = function (req, res) {
	logger.info("Inside UI service: initScraping_ICE");
	try {
		if (isSessionActive(req)) {
			var name = req.session.username;
			redisServer.redisSub2.subscribe('ICE2_' + name);	
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , name);
			//check on redis whether the ice socket is connected to any of the servers
			redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]>0) {
					var reqScrapJson = {};
					reqScrapJson.action = "SCRAPE";
					if (req.body.screenViewObject.appType == "Desktop") {
						var applicationPath = req.body.screenViewObject.applicationPath;
						var data = "LAUNCH_DESKTOP";
						logger.info("Sending socket request for LAUNCH_DESKTOP to redis");
						dataToIce = {"emitAction" : "LAUNCH_DESKTOP","username" : name, "applicationPath":applicationPath};
						redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
						var updateSessionExpiry = setInterval(function () {
								req.session.cookie.maxAge = sessionTime;
							}, updateSessionTimeEvery);
						function LAUNCH_DESKTOP_listener(channel, message) {
							data = JSON.parse(message);
							//LB: make sure to send recieved data to corresponding user
							if (name == data.username) {
								value = data.value;
								redisServer.redisSub2.removeListener('message', LAUNCH_DESKTOP_listener);
								if (data.onAction == "unavailableLocalServer") {
									logger.error("Error occured in initScraping_ICE: Socket Disconnected");
									if ('socketMapNotify' in myserver && name in myserver.socketMapNotify) {
										var soc = myserver.socketMapNotify[name];
										soc.emit("ICEnotAvailable");
									}
								} else {
									clearInterval(updateSessionExpiry);
									logger.info("Sending desktop scraped objects from initScraping_ICE");
									res.send(value);
								}
							}
						}
						redisServer.redisSub2.on("message",LAUNCH_DESKTOP_listener);
					} else if (req.body.screenViewObject.appType == "SAP") {
						var applicationPath = req.body.screenViewObject.applicationPath;
						var data = "LAUNCH_SAP";
						logger.info("Sending socket request for LAUNCH_SAP to redis");
						dataToIce = {"emitAction" : "LAUNCH_SAP","username" : name, "applicationPath":applicationPath};
						redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
						var updateSessionExpiry = setInterval(function () {
								req.session.cookie.maxAge = sessionTime;
							}, updateSessionTimeEvery);
						function LAUNCH_SAP_listener(channel, message) {
							data = JSON.parse(message);
							//LB: make sure to send recieved data to corresponding user
							if (name == data.username) {
								value = data.value;
								redisServer.redisSub2.removeListener('message', LAUNCH_SAP_listener);
								if (data.onAction == "unavailableLocalServer") {
									logger.error("Error occured in initScraping_ICE: Socket Disconnected");
									if ('socketMapNotify' in myserver && name in myserver.socketMapNotify) {
										var soc = myserver.socketMapNotify[name];
										soc.emit("ICEnotAvailable");
									}
								} else {
									clearInterval(updateSessionExpiry);
									logger.info("Sending SAP scraped objects from initScraping_ICE");
									res.send(value);
								}
							}
						}
						redisServer.redisSub2.on("message",LAUNCH_SAP_listener);
					} else if (req.body.screenViewObject.appType == "DesktopJava") {
						var applicationPath = req.body.screenViewObject.applicationPath;
						var data = "LAUNCH_OEBS";
						logger.info("Sending socket request for LAUNCH_OEBS to redis");
						dataToIce = {"emitAction" : "LAUNCH_OEBS","username" :name,
									 "applicationPath":applicationPath};
						redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
						var updateSessionExpiry = setInterval(function () {
								req.session.cookie.maxAge = sessionTime;
							}, updateSessionTimeEvery);
						function LAUNCH_OEBS_listener(channel, message) {
							data = JSON.parse(message);
							//LB: make sure to send recieved data to corresponding user
							if (name == data.username) {
								value = data.value;
								redisServer.redisSub2.removeListener('message', LAUNCH_OEBS_listener);
								if (data.onAction == "unavailableLocalServer") {
									logger.error("Error occured in initScraping_ICE: Socket Disconnected");
									if ('socketMapNotify' in myserver && name in myserver.socketMapNotify) {
										var soc = myserver.socketMapNotify[name];
										soc.emit("ICEnotAvailable");
									}
								} else {
									clearInterval(updateSessionExpiry);
									logger.info("Sending OEBS scraped objects from initScraping_ICE");
									res.send(value);
								}
							}
						}
						redisServer.redisSub2.on("message",LAUNCH_OEBS_listener);
					} else if (req.body.screenViewObject.appType == "MobileApp") {
						var apkPath = req.body.screenViewObject.apkPath;
						var serial = req.body.screenViewObject.mobileSerial;
						var mobileDeviceName = req.body.screenViewObject.mobileDeviceName;
						var mobileIosVersion = req.body.screenViewObject.mobileIosVersion;
						var mobileUDID = req.body.screenViewObject.mobileUDID;
						var data = "LAUNCH_MOBILE";
						logger.info("Sending socket request for LAUNCH_MOBILE to redis");
						dataToIce = {"emitAction" : "LAUNCH_MOBILE","username" : name,
									 "apkPath":apkPath,"serial":serial,"mobileDeviceName":mobileDeviceName,
									 "mobileIosVersion":mobileIosVersion,"mobileUDID":mobileUDID};
						redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
						var updateSessionExpiry = setInterval(function () {
								req.session.cookie.maxAge = sessionTime;
							}, updateSessionTimeEvery);
						function LAUNCH_MOBILE_listener(channel, message) {
							data = JSON.parse(message);
							//LB: make sure to send recieved data to corresponding user
							if (name == data.username) {
								value = data.value;
								redisServer.redisSub2.removeListener('message', LAUNCH_MOBILE_listener);
								if (data.onAction == "unavailableLocalServer") {
									logger.error("Error occured in initScraping_ICE: Socket Disconnected");
									if ('socketMapNotify' in myserver && name in myserver.socketMapNotify) {
										var soc = myserver.socketMapNotify[name];
										soc.emit("ICEnotAvailable");
									}
								} else {
									clearInterval(updateSessionExpiry);
									logger.info("Sending MOBILE scraped objects from initScraping_ICE");
									res.send(value);
								}
							}
						}
						redisServer.redisSub2.on("message",LAUNCH_MOBILE_listener);
					} else if (req.body.screenViewObject.appType == "MobileWeb") {
						var mobileSerial = req.body.screenViewObject.mobileSerial;
						var androidVersion = req.body.screenViewObject.androidVersion;
						var data = "LAUNCH_MOBILE_WEB";
						logger.info("Sending socket request for LAUNCH_MOBILE_WEB to redis");
						dataToIce = {"emitAction" : "LAUNCH_MOBILE_WEB","username" : name,
									 "mobileSerial":mobileSerial,"androidVersion":androidVersion};
						redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
						var updateSessionExpiry = setInterval(function () {
								req.session.cookie.maxAge = sessionTime;
							}, updateSessionTimeEvery);
						function LAUNCH_MOBILE_WEB_listener(channel, message) {
							data = JSON.parse(message);
							//LB: make sure to send recieved data to corresponding user
							if (name == data.username) {
								redisServer.redisSub2.removeListener('message', LAUNCH_MOBILE_WEB_listener);
								if (data.onAction == "unavailableLocalServer") {
									logger.error("Error occured in initScraping_ICE: Socket Disconnected");
									if ('socketMapNotify' in myserver && name in myserver.socketMapNotify) {
										var soc = myserver.socketMapNotify[name];
										soc.emit("ICEnotAvailable");
									}
								} else {
									value = data.value;
									clearInterval(updateSessionExpiry);
									logger.info("Sending MOBILE_WEB scraped objects from initScraping_ICE");
									res.send(value);
								}
							}
						}
						redisServer.redisSub2.on("message",LAUNCH_MOBILE_WEB_listener);
					} else {
						var data = {};
						var browserType = req.body.screenViewObject.browserType;
						if (req.body.screenViewObject.action == 'compare') {
							data.viewString = req.body.screenViewObject.viewString.view;
							data.action = req.body.screenViewObject.action;
							if (browserType == "chrome") {
								data.task = "OPEN BROWSER CH";
							} else if (browserType == "ie") {
								data.task = "OPEN BROWSER IE";
							} else if (browserType == "mozilla") {
								data.task = "OPEN BROWSER FX";
							}
						} else {
							data.action = "scrape";
							if (browserType == "chrome") {
								data.task = "OPEN BROWSER CH";
							} else if (browserType == "ie") {
								data.task = "OPEN BROWSER IE";
							} else if (browserType == "mozilla") {
								data.task = "OPEN BROWSER FX";
							}
						}
						logger.info("Sending socket request for webscrape to redis");
						dataToIce = {"emitAction" : "webscrape","username" : name, "data":data};
						redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
						var updateSessionExpiry = setInterval(function () {
								req.session.cookie.maxAge = sessionTime;
							}, updateSessionTimeEvery);
						function webscrape_listener(channel, message) {
							data = JSON.parse(message);
							//LB: make sure to send recieved data to corresponding user
							if (name == data.username) {
								redisServer.redisSub2.removeListener('message', webscrape_listener);
								if (data.onAction == "unavailableLocalServer") {
									logger.error("Error occured in initScraping_ICE: Socket Disconnected");
									if ('socketMapNotify' in myserver && name in myserver.socketMapNotify) {
										var soc = myserver.socketMapNotify[name];
										soc.emit("ICEnotAvailable");
									}
								} else {
									value = data.value;
									clearInterval(updateSessionExpiry);
									logger.info("Sending WEB scraped objects from initScraping_ICE");
									res.send(value);
								}
							}
						}
						redisServer.redisSub2.on("message",webscrape_listener);
					}
				} else {
					logger.error("Error occured in the service initScraping_ICE: Socket not Available");
					try {
						//res.send("unavailableLocalServer");
						if(Object.keys(myserver.allSchedulingSocketsMap).length > 0)
						{
							res.send("scheduleModeOn");
						}
						else{
							res.send("unavailableLocalServer");
						}
					} catch (exception) {
						logger.error("Exception in the service initScraping_ICE: %s",exception);
					}
				}
			});
		} else {
			logger.error("Error occured in the service initScraping_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service initScraping_ICE: %s",exception);
		//res.send("unavailableLocalServer");
		if(Object.keys(myserver.allSchedulingSocketsMap).length > 0)
		{
			res.send("scheduleModeOn");
		}
		else{
			res.send("unavailableLocalServer");
		}
	}
};

/**
 * @author vinay.niranjan
 * @modified author vinay.niranjan
 * the service is used to highlight scraped Objects into the browser
 */
exports.highlightScrapElement_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: highlightScrapElement_ICE");
		if (isSessionActive(req)) {
			var name = req.session.username;
			redisServer.redisSub2.subscribe('ICE2_' + name);
			var focusParam = req.body.elementXpath;
			var elementURL = req.body.elementUrl;
			var appType = req.body.appType;
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , name);
			logger.info("Sending socket request for focus to redis");
			dataToIce = {"emitAction" : "focus","username" : name,
						 "focusParam":focusParam,"elementURL":elementURL,"appType":appType};
			redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
			var flag = 'success';
			logger.info("Successfully highlighted selected object");
			res.send(flag);
		} else {
			logger.error("Error occured in the service highlightScrapElement_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service highlightScrapElement_ICE: %s",exception);
	}
};

/**
 * @author vinay.niranjan
 * @modified author vishvas.a
 * the service is used to fetch the  screen data based on the screenid and *projectid
 */
exports.getScrapeDataScreenLevel_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: getScrapeDataScreenLevel_ICE");
		if (isSessionActive(req)) {
			var inputs = {
				"screenid": req.body.screenId,
				"projectid": req.body.projectId,
				"query": "getscrapedata"
			};
			logger.info("Calling function fetchScrapedData from getScrapeDataScreenLevel_ICE service");
			fetchScrapedData(inputs, function (err, getScrapeDataQueryresponse) {
				try {
					logger.info("Scraped Data sent successfully from getScrapeDataScreenLevel_ICE service");
					res.send(getScrapeDataQueryresponse);
				} catch (exception) {
					logger.error("Exception while sending scraped data from getScrapeDataScreenLevel_ICE service: %s",exception);
				}
			});
		} else {
			logger.error("Error occured in the service getScrapeDataScreenLevel_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service getScrapeDataScreenLevel_ICE: %s",exception);
	}
};

/**
 * generic function for DB call to fetch the screendata
 * @author vishvas.a
 */
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
						logger.error("Error occured in design/getScrapeDataScreenLevel_ICE from fetchScrapedData Error Code : ERRNDAC");
						fetchScrapedDatacallback("getScrapeData Fail", null);
					} else {
						for (var i = 0; i < getScrapeDataQueryresult.rows.length; i++) {
							responsedata = getScrapeDataQueryresult.rows[i].screendata;
						}
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

/**
 * @author vinay.niranjan
 * @modified author vishvas.a
 * service updates the screen data in screens table
 * on user action of NEW SAVING/EDIT/UPDATE/DELETE/Mapping of Objects/Compare and Update in Design screen.
 */
exports.updateScreen_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: updateScreen_ICE");
		if (isSessionActive(req)) {
			var updateData = req.body.scrapeObject;
			var projectID = updateData.projectId;
			var screenID = updateData.screenId;
			var screenName = updateData.screenName;
			var userInfo = updateData.userinfo;
			var modifiedBy = userInfo.username.toLowerCase();
			var param = updateData.param;
			var appType = updateData.appType;
			var requestedskucodeScreens = "skucode";
			var requestedtags = "tags";
			var requestedversionnumber = updateData.versionnumber;
			//xpaths required to be mapped(used only when param is mapScrapeData_ICE)
			var requiredXpathList = [];
			//URLs required to be mapped(used only when param is mapScrapeData_ICE)
			var requiredURLList = [];
			var scrapedObjects = {};
			// scrapedObjects = updateData.getScrapeData;
			var inputs = {};
			var inputstestcase = {};
			var statusFlag = "";
			if (param == "updateScrapeData_ICE") {
				try {
					scrapedObjects = updateData.getScrapeData;
					var parsedScrapedObj = JSON.parse(scrapedObjects);
					if (appType.toUpperCase() === 'WEBSERVICE') {
						if ('body' in parsedScrapedObj) {
							parsedScrapedObj.body[0] = parsedScrapedObj.body[0].replace(/'+/g, "\"");
							scrapedObjects = parsedScrapedObj;
						}
					}
					scrapedObjects = JSON.stringify(scrapedObjects);
					scrapedObjects = scrapedObjects.replace(/'+/g, "''");
					var newParse;
					if (scrapedObjects != null && scrapedObjects.trim() != '' && scrapedObjects != undefined) {
						newParse = JSON.parse(scrapedObjects);
					} else {
						newParse = JSON.parse("{}");
					}
					scrapedObjects = newParse;
					if (appType.toUpperCase() === 'WEBSERVICE') {
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
												baseRequestBody = obj.root;
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
													scrapedObjectsWS.url = "";
													scrapedObjectsWS.text = "";
													scrapedObjectsWS.hiddentag = "";
													scrapedObjectsWS.tag = "elementWS";
													scrapedObjectsWS.id = "";
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
												scrapedObjects = scrapedObjects.replace(/'+/g, "''");
												inputs = {
													"query": "updatescreen",
													"scrapedata": scrapedObjects,
													"modifiedby": modifiedBy,
													"skucodescreen": requestedskucodeScreens,
													"screenid": screenID,
													"projectid": projectID,
													"screenname": screenName,
													"versionnumber": requestedversionnumber
												};
												logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
												finalFunction(scrapedObjects);
											} else {
												//JSON with view string empty
												inputs = buildObject(scrapedObjects, modifiedBy, requestedskucodeScreens, screenID, projectID, screenName, requestedversionnumber);
												logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
												finalFunction(scrapedObjects);
											}
										} else {
											//JSON with view string empty
											inputs = buildObject(scrapedObjects, modifiedBy, requestedskucodeScreens, screenID, projectID, screenName, requestedversionnumber);
											logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
											finalFunction(scrapedObjects);
										}
									} else {
										//JSON with view string empty
										inputs = buildObject(scrapedObjects, modifiedBy, requestedskucodeScreens, screenID, projectID, screenName, requestedversionnumber);
										logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
										finalFunction(scrapedObjects);
									}
								} else {
									//JSON with view string empty
									inputs = buildObject(scrapedObjects, modifiedBy, requestedskucodeScreens, screenID, projectID, screenName, requestedversionnumber);
									logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
									finalFunction(scrapedObjects);
								}
							} else {
								//JSON with view string empty
								inputs = buildObject(scrapedObjects, modifiedBy, requestedskucodeScreens, screenID, projectID, screenName, requestedversionnumber);
								logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
								finalFunction(scrapedObjects);
							}
						} catch (exception) {
							logger.error("Exception from the service updateScreen_ICE: updateScrapeData_ICE - WEBSERVICE: %s",exception);
						}
					} else {
						inputs = {
							"scrapedata": scrapedObjects,
							"modifiedby": modifiedBy,
							"skucodescreen": requestedskucodeScreens,
							"screenid": screenID,
							"projectid": projectID,
							"screenname": screenName,
							"versionnumber": requestedversionnumber
						};
						logger.info("Calling final function from the service updateScreen_ICE: updateScrapeData_ICE");
						finalFunction(scrapedObjects);
					}
				} catch (exception) {
					logger.error("Exception from the service updateScreen_ICE: updateScrapeData_ICE: %s",exception);
				}
			} else if (param == "editScrapeData_ICE") {
				try {
					/*
					 * @author vishvas.a
					 * editing of the scraped data based on the changed custom names
					 * data used : old custom names, new custom names and xpath.
					 */
					var oldCustNamesList = updateData.editedList.oldCustName;
					for (i = 0; i < oldCustNamesList.length; i++) {
						oldCustNamesList[i] = oldCustNamesList[i].replace(/&amp;/g, '&');
					}
					var newCustNamesList = updateData.editedList.modifiedCustNames;
					var xpathListofCustName = updateData.editedList.xpathListofCustNames;
					var elementschanged = 0;
					async.series([
							function (editcallback) {
								try {
									inputs = {
										"query": "getscrapedata",
										"screenid": screenID,
										"projectid": projectID
									};
									logger.info("Calling function fetchScrapedData from the service updateScreen_ICE: editScrapeData_ICE");
									fetchScrapedData(inputs, function (err, scrapedobjects) {
										try {
											if (scrapedobjects == null && scrapedobjects == '' && scrapedobjects == undefined) {
												scrapedobjects = JSON.parse("{}");
											}
											if (scrapedobjects.length > 0) {
												//this viewString is an array of scraped objects
												var viewString;
												scrapedobjects = JSON.parse(scrapedobjects);
												if ('view' in scrapedobjects) {
													viewString = scrapedobjects.view;
												} else {
													viewString = [];
													scrapedobjects.mirror = '';
													scrapedobjects.scrapedin = '';
													scrapedobjects.scrapetype = '';
												}
												if (viewString.length > 0) {
													for (var elementsindex = 0; elementsindex < xpathListofCustName.length; elementsindex++) {
														for (var scrapedobjectindex = 0; scrapedobjectindex < viewString.length; scrapedobjectindex++) {
															if (elementschanged < newCustNamesList.length) {
																if ((viewString[scrapedobjectindex].xpath.replace(/\s/g, ' ').replace('&nbsp;', ' ') == xpathListofCustName[elementsindex].replace(/\s/g, ' ').replace('&nbsp;', ' ')) && (viewString[scrapedobjectindex].custname.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim() == oldCustNamesList[elementsindex].replace(/\s/g, ' ').replace('&nbsp;', ' ').trim())) {
																	viewString[scrapedobjectindex].custname = newCustNamesList[elementsindex];
																	//elementschanged increments only when edit has occured
																	elementschanged = elementschanged + 1;
																}
															}
														}
													}
												}
												scrapedObjects.view = viewString;
												scrapedObjects.mirror = scrapedobjects.mirror;
												scrapedObjects.scrapedin = scrapedobjects.scrapedin;
												scrapedObjects.scrapetype = scrapedobjects.scrapetype;
												//the query here will be called only if ALL objects are identified.
												if (elementschanged <= newCustNamesList.length) {
													scrapedObjects = JSON.stringify(scrapedObjects);
													scrapedObjects = scrapedObjects.replace(/'+/g, "''");
													inputs = {
														"scrapedata": scrapedObjects,
														"modifiedby": modifiedBy,
														"skucodescreen": requestedskucodeScreens,
														"screenid": screenID,
														"projectid": projectID,
														"screenname": screenName,
														"versionnumber": requestedversionnumber
													};
													logger.info("Calling final function from the service updateScreen_ICE: editScrapeData_ICE");
													finalFunction(scrapedObjects);
												} else {
													statusFlag = "All objects are not edited.";
													try {
														res.send(statusFlag);
													} catch (exception) {
														logger.error("Exception while sending status from the service updateScreen_ICE: editScrapeData_ICE: %s",exception);
													}
												}
											} else {
												statusFlag = "Error occured in updateScreenData : Fail";
												try {
													res.send(statusFlag);
												} catch (exception) {
													logger.error("Exception while sending status from the service updateScreen_ICE - Error occured in updateScreenData: %s",exception);
												}
											}
										} catch (exception) {
											logger.error("Exception in the function fetchScrapedData from the service updateScreen_ICE - editScrapeData_ICE: %s",exception);
										}
									});
									editcallback();
								} catch (exception) {
									logger.error("Exception from the service updateScreen_ICE - editScrapeData_ICE: %s",exception);
								}
							}
						]);
				} catch (exception) {
					logger.error("Exception from the service updateScreen_ICE - editScrapeData_ICE: %s",exception);
				}
			} else if (param == "deleteScrapeData_ICE") {
				try {
					/*
					 * @author vishvas.a
					 * deleting of the scraped data based on the custom names and xpath.
					 */
					var deleteCustNames,
					deleteXpathNames;
					deleteCustNames = updateData.deletedList.deletedCustName;
					deleteXpathNames = updateData.deletedList.deletedXpath;
					var elementschanged = 0;
					var deleteAll = false;
					// var viewString = updateData.getScrapeData.view;
					var deleteindex = [];
					async.series([
							function (deletecallback) {
								try {
									inputs = {
										"query": "getscrapedata",
										"screenid": screenID,
										"projectid": projectID
									};
									logger.info("Calling function fetchScrapedData from the service updateScreen_ICE: deleteScrapeData_ICE");
									fetchScrapedData(inputs, function (err, scrapedobjects) {
										try {
											if (scrapedobjects == null && scrapedobjects == '' && scrapedobjects == undefined) {
												scrapedobjects = '{}';
											}
											scrapedobjects = JSON.stringify(updateData.getScrapeData);
											if (scrapedobjects.length > 0) {
												var viewString;
												scrapedobjects = JSON.parse(scrapedobjects);
												if ('view' in scrapedobjects) {
													viewString = scrapedobjects.view;
												} else {
													viewString = [];
													scrapedobjects.mirror = '';
													scrapedobjects.scrapedin = '';
													scrapedobjects.scrapetype = '';
												}
												if (viewString.length == deleteXpathNames.length) {
													deleteAll = true;
													viewString = [];
													scrapedobjects.mirror = '';
												}
												if (!deleteAll) {
													for (var elementsindex = 0; elementsindex < deleteXpathNames.length; elementsindex++) {
														for (var scrapedobjectindex = 0; scrapedobjectindex < viewString.length; scrapedobjectindex++) {
															if ((viewString[scrapedobjectindex].xpath.replace(/\s/g, ' ').replace('&nbsp;', ' ') == deleteXpathNames[elementsindex].replace(/\s/g, ' ').replace('&nbsp;', ' ')) && (viewString[scrapedobjectindex].custname.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim() == deleteCustNames[elementsindex].replace(/\s/g, ' ').replace('&nbsp;', ' ').trim())) {
																if (elementschanged < deleteCustNames.length) {
																	if (deleteindex.indexOf(scrapedobjectindex) === -1) {
																		deleteindex.push(scrapedobjectindex);
																		elementschanged = elementschanged + 1;
																	}
																}
															}
														}
													}
													deleteindex = deleteindex.sort(sortNumber);
													for (var deletingelementindex = 0; deletingelementindex < deleteindex.length; deletingelementindex++) {
														delete viewString[deleteindex[deletingelementindex]];
													}
													// Delete is not recommended as the index stays empty after using delete on array. Hence performing the below action
													// Removing null values from the array JSON
													viewString = viewString.filter(function (n) {
														return n != null;
													});
												}
												scrapedObjects.view = viewString;
												scrapedObjects.mirror = scrapedobjects.mirror;
												scrapedObjects.mirrorheight = scrapedobjects.mirrorheight;
												scrapedObjects.mirrorwidth = scrapedobjects.mirrorwidth;
												scrapedObjects.scrapedin = scrapedobjects.scrapedin;
												scrapedObjects.scrapetype = scrapedobjects.scrapetype;
												//this query will be called only if ALL objects are identified.
												if (elementschanged <= deleteXpathNames.length) {
													scrapedObjects = JSON.stringify(scrapedObjects);
													scrapedObjects = scrapedObjects.replace(/'+/g, "''");
													inputs = {
														"scrapedata": scrapedObjects,
														"modifiedby": modifiedBy,
														"skucodescreen": requestedskucodeScreens,
														"screenid": screenID,
														"projectid": projectID,
														"screenname": screenName,
														"versionnumber": requestedversionnumber
													};
													logger.info("Calling final function from the service updateScreen_ICE: deleteScrapeData_ICE");
													finalFunction(scrapedObjects);
												} else {
													statusFlag = "All objects are not edited.";
													try {
														res.send(statusFlag);
													} catch (exception) {
														logger.error("Exception while sending status flag from the service updateScreen_ICE - deleteScrapeData_ICE: %s",exception);
													}
												}
											} else {
												statusFlag = "Error occured in updateScreenData : Fail";
												try {
													res.send(statusFlag);
												} catch (exception) {
													logger.error("Exception from the service updateScreen_ICE - deleteScrapeData_ICE: Error occured in updateScreenData: %s",exception);
												}
											}
										} catch (exception) {
											logger.error("Exception in the function fetchScrapedData from the service updateScreen_ICE - deleteScrapeData_ICE: %s",exception);
										}
									});
									deletecallback();
								} catch (exception) {
									logger.error("Exception from the service updateScreen_ICE - deleteScrapeData_ICE: %s",exception);
								}
							}
						]);
				} catch (exception) {
					logger.error("Exception from the service updateScreen_ICE - deleteScrapeData_ICE: %s",exception);
				}
			} else if (param == "mapScrapeData_ICE") {
				/*
				 * @author vishvas.a
				 * mapping of scraped/new objects based on the scraped data from AUT
				 * data used : new Custom names,old custom names,old xpaths,new Xpaths(newly mapped elements)
				 */
				var tagMatch = "";
				//list of custom names of objects scraped and asked to map
				var uiElementsCustnameList = [];
				//tag names of objects scraped(available in DB)
				var dbElementsTagList = [];
				//mapped custom names(has no xpath)
				var uiUserProvidedNamesList = [];
				//index of objects added
				var addedObjectIndexes = [];
				//list of base elements supported in Ninteen68(ICE)
				var baseElementsList = ["a", "radiobutton", "checkbox", "input", "list", "select", "table", "button", "img"];
				//location of each element to be deleted from scraped list
				var addedObjectIndexes = [];
				async.series({
					function (mappingCallback) {
						try {
							inputs = {
								"query": "getscrapedata",
								"screenid": screenID,
								"projectid": projectID
							};
							logger.info("Calling function fetchScrapedData from the service updateScreen_ICE: mapScrapeData_ICE");
							fetchScrapedData(inputs, function (err, scrapedobjects) {
								try {
									if (scrapedobjects == null && scrapedobjects == '' && scrapedobjects == undefined) {
										scrapedobjects = JSON.parse("{}");
									}
									var viewString;
									if (scrapedobjects.length > 0) {
										scrapedobjects = JSON.parse(scrapedobjects);
										if ('view' in scrapedobjects) {
											viewString = scrapedobjects.view;
											if (viewString.length > 0) {
												uiUserProvidedNamesList = updateData.editedListoldCustName;
												uiElementsCustnameList = updateData.editedListmodifiedCustNames;
												//fetching tag names
												async.forEachSeries(uiUserProvidedNamesList, function (addedObjectCustName, addedObjectCustNameCallback) {
													async.forEachSeries(viewString, function (eachScrapedObject, scrapedObjectCallback) {
														try {
															if ('custname' in eachScrapedObject) {
																var elementCustnameDB = eachScrapedObject.custname;
																if (elementCustnameDB.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim() == addedObjectCustName.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim()) {
																	if ('tag' in eachScrapedObject) {
																		dbElementsTagList.push(eachScrapedObject.tag);
																	}
																}
															}
															scrapedObjectCallback();
														} catch (exception) {
															logger.error("Exception in the function fetchScrapedData from the service updateScreen_ICE - mapScrapeData_ICE: %s",exception);
														}
													}, addedObjectCustNameCallback);
												});
												/*
												 * fetching the appropriate xpath of the actual elements.
												 * to change the custom name
												 */
												var indexOfUiElement = -1;
												async.forEachSeries(uiElementsCustnameList, function (userCustName, userCustNameCallback) {
													indexOfUiElement = indexOfUiElement + 1;
													async.forEachSeries(viewString, function (eachScrapedObject, scrapedObjectCallback) {
														try {
															if ('custname' in eachScrapedObject) {
																var elementCustnameDB = eachScrapedObject.custname;
																if (elementCustnameDB.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim() == userCustName.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim()) {
																	if ('tag' in eachScrapedObject) {
																		var dbTagName = eachScrapedObject.tag;
																		/*
																		 * checks the tag name, if matches take the xpath
																		 * if does not match then checks if the dbElementsTagList at the index is 'element'. if 'element' then without any check, match the object.
																		 */
																		if (dbTagName.toLowerCase() == dbElementsTagList[indexOfUiElement]) {
																			if ('xpath' in eachScrapedObject) {
																				requiredXpathList.push(eachScrapedObject.xpath.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim());
																			}
																		} else if (dbElementsTagList[indexOfUiElement].toLowerCase() == 'element' && baseElementsList.indexOf(dbTagName.toLowerCase()) === -1) {
																			if ('xpath' in eachScrapedObject) {
																				requiredXpathList.push(eachScrapedObject.xpath.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim());
																			}
																		}
																		if ('url' in eachScrapedObject) {
																			requiredURLList.push(eachScrapedObject.url.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim());
																		}
																	}
																}
															}
															scrapedObjectCallback();
														} catch (exception) {
															logger.error("Exception in the function fetchScrapedData from the service updateScreen_ICE - mapScrapeData_ICE: %s",exception);
														}
													}, userCustNameCallback);
												});
												/*
												 * the method call below checks if multiple elements with same xpath are found for mapped elements.
												 * if found true mapping of objects is stopped and user is alerted with an appropriate error message.
												 */
												var multipleObjectsCustnameSet = [];
												async.forEachSeries(requiredXpathList, function (eachXpath, requiredXpathListCallback) {
													try {
														var custname = repeatedXpath(viewString, eachXpath);
														if (custname != "") {
															//maintaining the uniqueness of the multipleObjectsCustnameSet
															if (multipleObjectsCustnameSet.indexOf(custname) === -1) {
																multipleObjectsCustnameSet.push(custname.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim());
															}
															tagMatch = "sAmEoBjEcTrEpeAtEd";
														}
														requiredXpathListCallback();
													} catch (exception) {
														logger.error("Exception in the function fetchScrapedData from the service updateScreen_ICE - mapScrapeData_ICE: %s",exception);
													}
												});
												if (tagMatch != "sAmEoBjEcTrEpeAtEd") {
													//if the size of xpath list is same as user provided custom names list replacing the custom names of actual elements with xpath with the user provided custom names
													if (requiredXpathList.length == uiUserProvidedNamesList.length) {
														var xpathindex = -1;
														async.forEachSeries(requiredXpathList, function (eachXpath, requiredXpathListCallback) {
															try {
																xpathindex = xpathindex + 1;
																var objectindex = -1;
																async.forEachSeries(viewString, function (eachScrapedObject, scrapedObjectCallback) {
																	try {
																		objectindex = objectindex + 1;
																		if ('xpath' in eachScrapedObject) {
																			var scrapedXpath = eachScrapedObject.xpath.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim();
																			if (eachXpath.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim() == scrapedXpath.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim()) {
																				eachScrapedObject.custname = uiUserProvidedNamesList[xpathindex];
																				addedObjectIndexes.push(objectindex);
																			}
																		}
																		scrapedObjectCallback();
																	} catch (exception) {
																		logger.error("Exception in the function fetchScrapedData from the service updateScreen_ICE - mapScrapeData_ICE: %s",exception);
																	}
																}, requiredXpathListCallback);
															} catch (exception) {
																logger.error("Exception in the function fetchScrapedData from the service updateScreen_ICE - mapScrapeData_ICE: %s",exception);
															}
														});
													} else {
														tagMatch = "TagMissMatch";
														res.send(tagMatch);
													}
													// if the tagMatch status is empty, ie., if its not TagMissMatch then remove the dummy objects
													if (tagMatch == "") {
														var dummyObjectsToDelete = [];
														async.forEachSeries(uiUserProvidedNamesList, function (addedObjectCustName, addedObjectCustNameCallback) {
															var objectindexes = -1;
															async.forEachSeries(viewString, function (eachScrapedObject, scrapedObjectCallback) {
																try {
																	objectindexes = objectindexes + 1;
																	if (addedObjectIndexes.indexOf(objectindexes) === -1) {
																		if ((!('xpath' in eachScrapedObject) || (eachScrapedObject.xpath.trim() == "")) &&
																			('custname' in eachScrapedObject &&
																				uiUserProvidedNamesList.indexOf(eachScrapedObject.custname) !== -1)) {
																			if (dummyObjectsToDelete.indexOf(objectindexes) === -1) {
																				dummyObjectsToDelete.push(objectindexes);
																			}
																		}
																	}
																} catch (exception) {
																	logger.error("Exception in the function fetchScrapedData from the service updateScreen_ICE - mapScrapeData_ICE: %s",exception);
																}
																scrapedObjectCallback();
															}, addedObjectCustNameCallback);
														});
														dummyObjectsToDelete = dummyObjectsToDelete.sort(sortNumber);
														for (var deleteelementindex = 0; deleteelementindex < dummyObjectsToDelete.length; deleteelementindex++) {
															delete viewString[dummyObjectsToDelete[deleteelementindex]];
														}
														//delete is not recommended as the index stays empty after using delete on array. Hence performing the below action
														//removing null values from the array JSON
														viewString = viewString.filter(function (n) {
																return n != null;
															});
														scrapedObjects.view = viewString;
														scrapedObjects.mirror = scrapedobjects.mirror;
														scrapedObjects.scrapedin = scrapedobjects.scrapedin;
														scrapedObjects.scrapetype = scrapedobjects.scrapetype;
														scrapedObjects = JSON.stringify(scrapedObjects);
														scrapedObjects = scrapedObjects.replace(/'+/g, "''");
														inputs = {
															"scrapedata": scrapedObjects,
															"modifiedby": modifiedBy,
															"skucodescreen": requestedskucodeScreens,
															"screenid": screenID,
															"projectid": projectID,
															"screenname": screenName,
															"versionnumber": requestedversionnumber
														};
														finalFunction(scrapedObjects);
													}
												} else {
													//console.log("These are the repeated objects:",multipleObjectsCustnameSet);
													tagMatch = tagMatch + "maPinGScraPedDaTa" + multipleObjectsCustnameSet.join();
													res.send(tagMatch);
												}
											}
										} else {
											statusFlag = "Error occured in mapScreenData : Fail";
											try {
												res.send(statusFlag);
											} catch (exception) {
												logger.error("Exception while sending response from the function fetchScrapedData in the service updateScreen_ICE - mapScrapeData_ICE: Error occured in mapScreenData: %s",exception);
											}
										}
									} else {
										statusFlag = "Error occured in updateScreenData : Fail";
										try {
											res.send(statusFlag);
										} catch (exception) {
											logger.error("Exception while sending response from the function fetchScrapedData in the service updateScreen_ICE - mapScrapeData_ICE: Error occured in updateScreenData: %s",exception);
										}
									}
								} catch (exception) {
									logger.error("Exception in the function fetchScrapedData from the service updateScreen_ICE - mapScrapeData_ICE: %s",exception);
								}
							});
						} catch (exception) {
							logger.error("Exception in the function fetchScrapedData from the service updateScreen_ICE - mapScrapeData_ICE: %s",exception);
						}
					}
				});
			} else if (param == 'updateComparedObjects') {
				//Update changed objects
				try {
					var elementschanged = 0;
					var updatedIndex = [];
					async.series([
							function (comparecallback) {
								try {
									inputs = {
										"query": "getscrapedata",
										"screenid": screenID,
										"projectid": projectID
									};
									logger.info("Calling function fetchScrapedData from the service updateScreen_ICE - updateComparedObjects");
									fetchScrapedData(inputs, function (err, scrapedobjects) {
										try {
											if (scrapedobjects == null && scrapedobjects == '' && scrapedobjects == undefined) {
												scrapedobjects = '{}';
											}
											if (scrapedobjects.length > 0) {
												var viewString;
												scrapedobjects = JSON.parse(scrapedobjects);
												if ('view' in scrapedobjects) {
													viewString = scrapedobjects.view;
												} else {
													viewString = [];
													scrapedobjects.mirror = '';
													scrapedobjects.scrapedin = '';
													scrapedobjects.scrapetype = '';
												}
												var updatedViewString = updateData.updatedViewString.view[0].changedobject;
												for (var i = 0; i < updatedViewString.length; i++) {
													for (var j = 0; j < viewString.length; j++) {
														var updatedXpath = updatedViewString[i].xpath.replace(/\s/g, ' ').replace('&nbsp;', ' ');
														updatedXpath = updatedViewString[i].xpath.split(";");
														updatedXpath = updatedXpath[1];
														var fetchedXpath = viewString[j].xpath.replace(/\s/g, ' ').replace('&nbsp;', ' ');
														fetchedXpath = viewString[j].xpath.split(";");
														fetchedXpath = fetchedXpath[1];
														if (updatedXpath == fetchedXpath) {
															updatedIndex.push(j);
															viewString[j] = updatedViewString[i];
															elementschanged = elementschanged + 1;
														}
													}
												}
												updatedIndex = updatedIndex.sort(sortNumber);
												viewString = viewString.filter(function (n) {
														return n != null;
													});
												scrapedObjects.view = viewString;
												scrapedObjects.mirror = updateData.updatedViewString.mirror;
												scrapedObjects.scrapedin = scrapedobjects.scrapedin;
												scrapedObjects.scrapetype = scrapedobjects.scrapetype;
												if ('view' in scrapedObjects) {
													scrapedObjects = JSON.stringify(scrapedObjects);
													scrapedObjects = scrapedObjects.replace(/'+/g, "''");
													inputs = {
														"scrapedata": scrapedObjects,
														"modifiedby": modifiedBy,
														"skucodescreen": requestedskucodeScreens,
														"screenid": screenID,
														"projectid": projectID,
														"screenname": screenName,
														"versionnumber": requestedversionnumber
													};
													finalFunction(scrapedObjects);
												} else {
													statusFlag = "No Objects to compare.";
													try {
														res.send(statusFlag);
													} catch (exception) {
														logger.error("Exception while sending response from the function fetchScrapedData: updateScreen_ICE - updateComparedObjects: No Objects to compare: %s", exception);
													}
												}
											} else {
												statusFlag = "Error occured in updateScreenData : Fail";
												try {
													res.send(statusFlag);
												} catch (exception) {
													logger.error("Exception while sending response from the function fetchScrapedData: updateScreen_ICE - updateComparedObjects: Error occured in updateScreenData: %s", exception);
												}
											}
										} catch (exception) {
											logger.error("Exception in the function fetchScrapedData: service updateScreen_ICE - updateComparedObjects: %s", exception);
										}
									}); //End of fetchScrapedData
								} catch (exception) {
									logger.error("Exception in the function fetchScrapedData: service updateScreen_ICE - updateComparedObjects: %s", exception);
								}
							} //End of Async function callback
						]); //End of Async series
				} catch (exception) {
					logger.error("Exception in the function fetchScrapedData: service updateScreen_ICE - updateComparedObjects: %s", exception);
				}
			}
			function sortNumber(a, b) {
				return a - b;
			}
			//this code will be called only if the statusFlag is empty.
			function finalFunction(scrapedObjects, finalcallback) {
				logger.info("Inside the finalFunction: service updateScreen_ICE");
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
									statusFlag = "Error occured in updateScreenData : Fail";
									logger.error("Error occured in design/updateScreen_ICE from finalFunction Error Code : ERRNDAC");
									try {
										res.send(statusFlag);
									} catch (exception) {
										logger.error("Exception while sending response in design/updateScreen_ICE from the finalFunction: %s", exception);
									}
								} else {
									if (param != 'updateScrapeData_ICE') {
										async.waterfall([
												function (testcasecallback) {
													try {
														inputstestcase = {
															"query": "screenid",
															"screenid": screenID,
															"versionnumber": requestedversionnumber
														};
														var newCustnames,oldCustnames,xpathofCustnames;
														if (param == 'editScrapeData_ICE') {
															newCustnames = updateData.editedList.modifiedCustNames;
															oldCustnames = updateData.editedList.oldCustName;
															xpathofCustnames = updateData.editedList.xpathListofCustNames;
														} else if (param == 'updateComparedObjects') {
															//CHANGE JSON FOR COMPARED OBJECTS -- INVALID JSON FORMAT FROM CORE
															oldCustnames = updateData.updatedViewString.view[0].changedobject;
															logger.info("oldcustnames: %s", oldCustnames);
														} else if (param == 'mapScrapeData_ICE') {
															// Empty Block
														} else {
															oldCustnames = updateData.deletedList.deletedCustName;
															xpathofCustnames = updateData.deletedList.deletedXpath;
														}
														var args = {
															data: inputstestcase,
															headers: {
																"Content-Type": "application/json"
															}
														};
														logger.info("Calling NDAC Service from finalFunction: design/readTestCase_ICE");
														client.post(epurl + "design/readTestCase_ICE", args,
															function (testcaseDataQueryresult, response) {
															if (response.statusCode != 200 || testcaseDataQueryresult.rows == "fail") {
																statusFlag = "Error occured in testcaseDataQuery : Fail";
																logger.error("Error occured in design/readTestCase_ICE from finalFunction Error Code : ERRNDAC");
																try {
																	res.send(statusFlag);
																} catch (exception) {
																	logger.error("Exception while sending response in design/readTestCase_ICE from the finalFunction: %s", exception);
																}
															} else {
																try {
																	if (testcaseDataQueryresult.rows.length > 0) {
																		var testcasessize = 0;
																		async.forEachSeries(testcaseDataQueryresult.rows,
																			function (eachTestcase, testcaserendercallback) {
																			try {
																				var updatingTestcaseid = eachTestcase.testcaseid;
																				var updatingtestcasedata;
																				if (eachTestcase.testcasesteps != null && eachTestcase.testcasesteps != '' && eachTestcase.testcasesteps != undefined) {
																					updatingtestcasedata = JSON.parse(eachTestcase.testcasesteps);
																				} else {
																					updatingtestcasedata = JSON.parse("[]");
																				}
																				var updatingtestcasename = eachTestcase.testcasename;
																				if (param != 'mapScrapeData_ICE') {
																					//replacing/deleting all the custnames based on xpath and old custnames
																					var deletingStepindex = [];
																					if (updatingtestcasedata.length > 0) {
																						for (var updatingindex = 0; updatingindex < oldCustnames.length; updatingindex++) {
																							for (var eachtestcasestepindex = 0; eachtestcasestepindex < updatingtestcasedata.length; eachtestcasestepindex++) {
																								var testcasestep = updatingtestcasedata[eachtestcasestepindex];
																								var step = eachtestcasestepindex + 1;
																								if ('custname' in testcasestep && 'objectName' in testcasestep) {
																									if ((param == 'editScrapeData_ICE' || param == 'deleteScrapeData_ICE') && testcasestep.custname.trim() == oldCustnames[updatingindex].trim() && testcasestep.objectName.trim() == xpathofCustnames[updatingindex].trim()) {
																										if (param == 'editScrapeData_ICE') {
																											testcasestep.custname = newCustnames[updatingindex];
																										} else if (param == 'deleteScrapeData_ICE') {
																											testcasestep.stepNo = step;
																											if (deletingStepindex.indexOf(eachtestcasestepindex) === -1) {
																												deletingStepindex.push(eachtestcasestepindex);
																											}
																										}
																									} else if ((param == 'updateComparedObjects') && testcasestep.custname.trim() == oldCustnames[updatingindex].custname.trim() && testcasestep.objectName.trim() != '') {
																										testcasestep.objectName = oldCustnames[updatingindex].xpath;
																										// console.log("custname", oldCustnames[updatingindex].custname);
																										// console.log("xpath", oldCustnames[updatingindex].xpath);
																									}
																								}
																							}
																						}
																					}
																					if (param == 'deleteScrapeData_ICE') {
																						deletingStepindex = deletingStepindex.sort(sortNumber);
																						for (var deletingcaseindex = 0; deletingcaseindex < deletingStepindex.length; deletingcaseindex++) {
																							delete updatingtestcasedata[deletingStepindex[deletingcaseindex]];
																						}
																						//removing null values from the array JSON
																						updatingtestcasedata = updatingtestcasedata.filter(function (n) {
																							return n != null;
																						});
																					}
																					updatingtestcasedata = JSON.stringify(updatingtestcasedata);
																					updatingtestcasedata = updatingtestcasedata.replace(/'+/g, "''");
																				} else {
																					try {
																						var uiUserProvidedNamesList = updateData.editedListoldCustName;
																						var uiElementsCustnameList = updateData.editedListmodifiedCustNames;
																						if (updatingtestcasedata.length > 0) {
																							var uiCustNameIndex = -1;
																							async.forEachSeries(uiElementsCustnameList, function (userCustName, userCustNameCallback) {
																								uiCustNameIndex = uiCustNameIndex + 1;
																								async.forEachSeries(updatingtestcasedata, function (eachTestCaseStep, eachTestCaseStepCallback) {
																									if ('custname' in eachTestCaseStep) {
																										if (eachTestCaseStep.custname.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim() == userCustName.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim()) {
																											eachTestCaseStep.custname = uiUserProvidedNamesList[uiCustNameIndex];
																										}
																									}
																									if ('custname' in eachTestCaseStep) {
																										if (eachTestCaseStep.custname.replace(/\s/g, ' ').replace('&nbsp;', ' ').trim() == uiUserProvidedNamesList[uiCustNameIndex].replace(/\s/g, ' ').replace('&nbsp;', ' ').trim()) {
																											if (('objectName' in eachTestCaseStep && eachTestCaseStep.objectName.trim() == "") || !('objectName' in eachTestCaseStep)) {
																												eachTestCaseStep.objectName = requiredXpathList[uiCustNameIndex];
																												eachTestCaseStep.url = requiredURLList[uiCustNameIndex];
																											}
																										}
																									}
																									eachTestCaseStepCallback();
																								}, userCustNameCallback);
																							});
																						}
																						updatingtestcasedata = JSON.stringify(updatingtestcasedata);
																						updatingtestcasedata = updatingtestcasedata.replace(/'+/g, "''");
																					} catch (exception) {
																						logger.error("Exception in the finalFunction: %s", exception);
																					}
																				}
																				if (updatingtestcasedata == "[]") {
																					updatingtestcasedata = "";
																				}
																				inputs = {
																					"query": "updatetestcasedata",
																					"modifiedby": userInfo.username.toLowerCase(),
																					"skucodetestcase": "skucodetestcase",
																					"testcaseid": updatingTestcaseid,
																					"testcasesteps": updatingtestcasedata,
																					"screenid": screenID,
																					"testcasename": updatingtestcasename,
																					"versionnumber": requestedversionnumber
																				};
																				logger.info("Calling function uploadTestCaseData from the finalFunction")
																				uploadTestCaseData(inputs, function (error, response) {
																					if (error) {
																						try {
																							res.send(error);
																						} catch (exception) {
																							logger.error("Exception in the function uploadTestCaseData from finalFunction: %s", exception);
																						}
																					} else {
																						try {
																							testcasessize = testcasessize + 1;
																							if (testcasessize == testcaseDataQueryresult.rows.length) {
																								res.send(response);
																							}
																						} catch (exception) {
																							logger.error("Exception in the function uploadTestCaseData from finalFunction: %s", exception);
																						}
																					}
																				});
																			} catch (exception) {
																				logger.error("Exception in the finalFunction: %s", exception);
																			}
																			testcaserendercallback();
																		});
																	} else {
																		statusFlag = "success";
																		try {
																			res.send(statusFlag);
																		} catch (exception) {
																			logger.error("Exception while sending response in the finalFunction: %s", exception);
																		}
																	}
																} catch (exception) {
																	logger.error("Exception in the finalFunction: %s", exception);
																}
															}
														});
														testcasecallback;
													} catch (exception) {
														logger.error("Exception in the finalFunction: %s", exception);
													}
												}
											]);
									} else {
										statusFlag = "success";
										try {
											res.send(statusFlag);
										} catch (exception) {
											logger.error("Exception while sending response in the finalFunction: %s", exception);
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
			logger.error("Error occured in the finalFunction: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the finalFunction: %s", exception);
	}
};

function repeatedXpath(viewString, xpath) {
	logger.info("Inside the function repeatedXpath ");
	var xpathIndex = 0;
	var result = "";
	try {
		for (eachObjectindex = 0; eachObjectindex < viewString.length; eachObjectindex++) {
			try {
				var eachScrapedObject = viewString[eachObjectindex];
				if ('custname' in eachScrapedObject) {
					if ('xpath' in eachScrapedObject) {
						var scrapedxpath = eachScrapedObject.xpath;
						var scrapedCustName = eachScrapedObject.custname;
						if (scrapedxpath == xpath) {
							xpathIndex = xpathIndex + 1;
						}
						if (xpathIndex > 1) {
							result = scrapedCustName;
							break;
						}
					}
				}
			} catch (exception) {
				logger.error("Exception in the function repeatedXpath: %s", exception);
			}
		}
		return result;
	} catch (exception) {
		logger.error("Exception in the function repeatedXpath: %s", exception);
	}
}

function buildObject(scrapedObjects, modifiedBy, requestedskucodeScreens, screenID, projectID, screenName, requestedversionnumber) {
	logger.info("Inside the function buildObject");
	try {
		scrapedObjects = JSON.stringify(scrapedObjects);
		scrapedObjects = scrapedObjects.replace(/'+/g, "''");
		inputsWS = {
			"scrapedata": scrapedObjects,
			"modifiedby": modifiedBy,
			"skucodescreen": requestedskucodeScreens,
			"screenid": screenID,
			"projectid": projectID,
			"screenname": screenName,
			"versionnumber": requestedversionnumber
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

/**
 * generic function for DB to update the testcases table
 * @author vishvas.a
 */
function uploadTestCaseData(inputs, uploadTestCaseDatacallback) {
	try {
		logger.info("Inside the function uploadTestCaseData ");
		var statusFlag = "";
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		logger.info("Calling NDAC Service from uploadTestCaseData: design/updateTestCase_ICE");
		client.post(epurl + "design/updateTestCase_ICE", args,
			function (result, response) {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occured in design/updateTestCase_ICE from uploadTestCaseData Error Code : ERRNDAC");
				statusFlag = "Error occured in updateTestCaseQuery : Fail";
				uploadTestCaseDatacallback(statusFlag, null);
			} else {
				statusFlag = "success";
				uploadTestCaseDatacallback(null, statusFlag);
			}
		});
	} catch (exception) {
		logger.error("Exception in the function uploadTestCaseData: %s", exception);
	}
}

/**
 * @author vishvas.a
 * @modified author sunil.revankar
 * readTestCase_ICE service is used to fetch the testcase data
 */
exports.readTestCase_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: readTestCase_ICE");
		if (isSessionActive(req)) {
			//base output elements
			var testcasesteps = "";
			var testcasename = "";
			var template = "";
			// base request elements
			var requestedscreenid = req.body.screenid;
			var requestedtestscasename = req.body.testcasename;
			var requestedtestscaseid = req.body.testcaseid;
			var requestedversionnumber = req.body.versionnumber;
			// base request elements sent in request
			inputs = {
				"screenid": requestedscreenid,
				"testcasename": requestedtestscasename,
				"testcaseid": requestedtestscaseid,
				"versionnumber": requestedversionnumber,
				"query": "readtestcase"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			var responsedata = {
				template: "",
				testcase: "",
				testcasename: ""
			};
			logger.info("Calling NDAC Service from readTestCase_ICE: design/readTestCase_ICE");
			//Query 1 fetching the testcasesteps from the test cases based on requested screenid,testcasename,testcaseid
			client.post(epurl + "design/readTestCase_ICE", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						var flag = "Error in readTestCase_ICE : Fail";
						logger.error("Error occured in design/readTestCase_ICE: service readTestCase_ICE, Error Code : ERRNDAC");
						try {
							res.send(flag);
						} catch (exception) {
							logger.error("Exception while sending response from the service readTestCase_ICE: %s", exception);
						}
					} else {
						try {
							for (var i = 0; i < result.rows.length; i++) {
								testcasesteps = result.rows[i].testcasesteps;
								testcasename = result.rows[i].testcasename;
							}
							var inputs = {
								"query": "debugtestcase",
								"screenid": requestedscreenid
							};
							logger.info("Calling function fetchScrapedData from the service readTestCase_ICE");
							fetchScrapedData(inputs, function (err, scrapedobjects) {
								try {
									if (scrapedobjects != null && scrapedobjects.trim() != '' && scrapedobjects != undefined) {
										var newParse = JSON.parse(scrapedobjects);
										if ('body' in newParse) {
											template = newParse.body;
											responsedata.template = template;
											responsedata.testcase = testcasesteps;
											responsedata.testcasename = testcasename;
											try {
												res.send(responsedata);
											} catch (exception) {
												logger.error("Exception while sending response data from the service readTestCase_ICE - fetchScrapedData: %s", exception);
											}
										} else {
											responsedata = {
												template: "",
												testcase: testcasesteps,
												testcasename: testcasename
											};
											try {
												res.send(responsedata);
											} catch (exception) {
												logger.error("Exception while sending response data from the service readTestCase_ICE - fetchScrapedData: %s", exception);
											}
										}
									} else if ((scrapedobjects == null || scrapedobjects.trim() == '' || scrapedobjects == undefined) && (testcasesteps != null && testcasesteps != '' || testcasesteps != undefined)) {
										responsedata = {
											template: "",
											testcase: testcasesteps,
											testcasename: testcasename
										};
										try {
											res.send(responsedata);
										} catch (exception) {
											logger.error("Exception while sending response data from the service readTestCase_ICE - fetchScrapedData: %s", exception);
										}
									} else {
										//this case is merely impossible in V2.0 as creation happens in MindMaps
										responsedata = {
											template: "",
											testcase: "[]",
											testcasename: ""
										};
										try {
											res.send(responsedata);
										} catch (exception) {
											logger.error("Exception while sending response data from the service readTestCase_ICE - fetchScrapedData: %s", exception);
										}
									}
								} catch (exception) {
									logger.error("Exception in the service readTestCase_ICE - fetchScrapedData: %s", exception);
								}
							});
						} catch (exception) {
							logger.error("Exception in the service readTestCase_ICE: %s", exception);
						}
					}
				} catch (exception) {
					logger.error("Exception in the service readTestCase_ICE: %s", exception);
				}
			});
		} else {
			logger.error("Error in the service readTestCase_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service readTestCase_ICE: %s", exception);
	}
};

/**
 * @author vishvas.a
 * @modified author sunil.revankar
 * updateTestCase_ICE service is used to save testcase data
 */
exports.updateTestCase_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: updateTestCase_ICE");
		if (isSessionActive(req)) {
			var hasrow = false;
			//base request elements
			var requestedscreenid = req.body.screenid;
			var requestedtestcaseid = req.body.testcaseid;
			var requestedtestcasename = req.body.testcasename;
			var requestedversionnumber = req.body.versionnumber;
			var requestedtestcasesteps = JSON.parse(req.body.testcasesteps);
			var userinfo = req.body.userinfo;
			//these value has to be modified later
			var requestedskucodetestcase = req.body.skucodetestcase;
			var requestedtags = req.body.tags;
			// Query 1 checking whether the testcaseid belongs to the same screen based on requested screenid,testcasename,testcaseid and testcasesteps
			var inputs = {
				"screenid": requestedscreenid,
				"query": "checktestcaseexist",
				"versionnumber": requestedversionnumber
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from updateTestCase_ICE: design/updateTestCase_ICE");
			client.post(epurl + "design/updateTestCase_ICE", args,
				function (result, response) {
				try {
					if (response.statusCode != 200 || result.rows == "fail") {
						var flag = "Error in Query 1 testcaseexist: Fail";
						logger.error("Error occured in design/updateTestCase_ICE from updateTestCase_ICE Error Code : ERRNDAC");
						try {
							res.send(flag);
						} catch (exception) {
							logger.error("Exception in the service updateTestCase_ICE: %s", exception);
						}
					} else {
						for (var i = 0; i < result.rows.length; i++) {
							if (result.rows[i].testcaseid == requestedtestcaseid) {
								hasrow = true;
								break;
							}
						}
						if (hasrow == true) {
							// Query 2 updating the testcasedata based on based on requested screenid,testcaseid and testcasesteps
							requestedtestcasesteps = JSON.stringify(requestedtestcasesteps);
							requestedtestcasesteps = requestedtestcasesteps.replace(/'+/g, "''");
							var inputs = {
								"screenid": requestedscreenid,
								"query": "updatetestcasedata",
								"modifiedby": userinfo.username.toLowerCase(),
								"skucodetestcase": requestedskucodetestcase,
								"testcasesteps": requestedtestcasesteps,
								"versionnumber": requestedversionnumber,
								"testcaseid": requestedtestcaseid,
								"testcasename": requestedtestcasename
							};
							logger.info("Calling function uploadTestCaseData from updateTestCase_ICE");
							uploadTestCaseData(inputs, function (error, response) {
								if (error) {
									try {
										res.send(error);
									} catch (exception) {
										logger.error("Exception in the service updateTestCase_ICE - uploadTestCaseData: %s", exception);
									}
								} else {
									try {
										res.send(response);
									} catch (exception) {
										logger.error("Exception in the service updateTestCase_ICE - uploadTestCaseData: %s", exception);
									}
								}
							});
						} else {
							logger.error("Error in the service updateTestCase_ICE: Fail to save testcase");
							res.send("fail");
						}
					}
				} catch (exception) {
					logger.error("Exception in the service updateTestCase_ICE: %s", exception);
				}
			});
		} else {
			logger.error("Error in the service updateTestCase_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service updateTestCase_ICE: %s", exception);
	}
};

/**
 * @author vishvas.a
 * @modified author sunil.revankar
 * debugTestCase_ICE service is used to debug the testcase
 */
exports.debugTestCase_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: debugTestCase_ICE");
		if (isSessionActive(req)) {
			var name = req.session.username;
			redisServer.redisSub2.subscribe('ICE2_' + name);
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.info("ICE Socket requesting Address: %s" , name);
			//LB: check on redis whether the ice socket is connected to any of the servers
			redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]>0) {
					try {
						var action = req.body.param;
						if (action == 'debugTestCase_ICE') {
							try {
								var requestedbrowsertypes = req.body.browsertypes;
								var requestedtestcaseids = req.body.testcaseids;
								var apptype = req.body.apptype;
								var responsedata = [];
								var counter = -1;
								var browsertypeobject = {
									browsertype: requestedbrowsertypes
								};
								var flag = "";
								async.forEachSeries(requestedtestcaseids, function (testcaseIDs, eachTestcaseIDsCallback) {
									var inputs = {
										"query": "testcaseid",
										"testcaseid": testcaseIDs,
										"userid": req.body.userInfo.user_id
									};
									var args = {
										data: inputs,
										headers: {
											"Content-Type": "application/json"
										}
									};
									logger.info("Calling NDAC Service from debugTestCase_ICE: design/readTestCase_ICE");
									client.post(epurl + "design/readTestCase_ICE", args,
										function (testcasedataresult, response) {
										try {
											if (response.statusCode != 200 || testcasedataresult.rows == "fail") {
												flag = "Error in getProjectTestcasedata : Fail";
												logger.error("Error occured in design/readTestCase_ICE from the service debugTestCase_ICE Error Code : ERRNDAC");
												try {
													res.send(flag);
												} catch (exception) {
													logger.error("Exception in the service debugTestCase_ICE: %s", exception);
												}
											} else {
												async.forEachSeries(testcasedataresult.rows, function (eachTestcaseData, testcasedataCallback) {
													var responseobject = {
														template: "",
														testcasename: "",
														testcase: [],
														apptype: ""
													};
													responseobject.testcase = eachTestcaseData.testcasesteps;
													responseobject.testcasename = eachTestcaseData.testcasename;
													responseobject.apptype = apptype;
													responsedata.push(responseobject);
													responsedata.push(browsertypeobject);
													var inputs = {
														"query": "debugtestcase",
														"screenid": testcasedataresult.rows[0].screenid
													};
													logger.info("Calling the function fetchScrapedData from debugTestCase_ICE");
													fetchScrapedData(inputs, function (err, scrapedobjects) {
														counter++;
														try {
															if (scrapedobjects != null && scrapedobjects.trim() != '' && scrapedobjects != undefined) {
																var newParse = JSON.parse(scrapedobjects);
																if ('body' in newParse) {
																	var screen_obj = responsedata[counter];
																	screen_obj.template = newParse.body[0];

																}
															}
															// responsedata.push(responseobject);
															// responsedata.push(browsertypeobject);
															if (counter == requestedtestcaseids.length - 1) {
																logger.info("Sending socket request for debugTestCase to redis");
																dataToIce = {"emitAction" : "debugTestCase","username" : name, "responsedata":responsedata};
																redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
																var updateSessionExpiry = setInterval(function () {
																		req.session.cookie.maxAge = sessionTime;
																	}, updateSessionTimeEvery);
																function result_debugTestCase_listener(channel, message) {
																	data = JSON.parse(message);
																	//LB: make sure to send recieved data to corresponding user
																	if (name == data.username) {
																		redisServer.redisSub2.removeListener('message', result_debugTestCase_listener);
																		if (data.onAction == "unavailableLocalServer") {
																			logger.error("Error occured in debugTestCase_ICE: Socket Disconnected");
																			if ('socketMapNotify' in myserver && name in myserver.socketMapNotify) {
																				var soc = myserver.socketMapNotify[name];
																				soc.emit("ICEnotAvailable");
																			}
																		} else if (data.onAction == "result_debugTestCase") {
																			clearInterval(updateSessionExpiry);
																			try {
																				res.send(data.value);
																			} catch (exception) {
																				logger.error("Exception in the service debugTestCase_ICE: %s", exception);
																			}
																		}
																	}
																}
																redisServer.redisSub2.on("message",result_debugTestCase_listener);
															}
														} catch (exception) {
															logger.error("Exception in the service debugTestCase_ICE: %s", exception);
														}
													});
													testcasedataCallback();
												}, eachTestcaseIDsCallback);
											}
										} catch (exception) {
											logger.error("Exception in the service debugTestCase_ICE: %s", exception);
										}
									});
								});
							} catch (exception) {
								logger.error("Exception in the service debugTestCase_ICE: %s", exception);
							}
						} else if (action == 'debugTestCaseWS_ICE') {
							try {
								var testcaseWS = [];
								testcaseWS.push(req.body.testCaseWS);
								logger.info("Sending socket request for debugTestCaseWS_ICE to redis");
								dataToIce = {"emitAction" : "debugTestCase","username" : name, "responsedata":testcaseWS};
								redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
								var updateSessionExpiry = setInterval(function () {
										req.session.cookie.maxAge = sessionTime;
									}, updateSessionTimeEvery);
									function result_debugTestCaseWS_listener(channel, message) {
										data = JSON.parse(message);
										//LB: make sure to send recieved data to corresponding user
										if (data.username == name) {
											redisServer.redisSub2.removeListener('message', result_debugTestCaseWS_listener);
											if (data.onAction == "unavailableLocalServer") {
												logger.error("Error occured in debugTestCase_ICE: Socket Disconnected");
												if ('socketMapNotify' in myserver && name in myserver.socketMapNotify) {
													var soc = myserver.socketMapNotify[name];
													soc.emit("ICEnotAvailable");
												}
											} else {
												clearInterval(updateSessionExpiry);
												var value = data.value;
												try {
													if (value.toUpperCase() === 'TERMINATE') {
														try {
															res.send(value);
														} catch (exception) {
															logger.error("Exception while sending response in the service debugTestCase_ICE - result_debugTestCaseWS: %s", exception);
														}
													} else {
														var responsedata = {
															responseHeader: [],
															responseBody: []
														};
														if (value != "fail" && value != undefined && value != "") {
															var response = value.split('rEsPONseBOdY:');
															if (response.length == 2) {
																responsedata.responseHeader.push(response[0]);
																responsedata.responseBody.push(response[1].replace("&gt;", ">").replace("&lt;", "<"));
																try {
																	res.send(responsedata);
																} catch (exception) {
																	logger.error("Exception while sending response data in the service debugTestCase_ICE - result_debugTestCaseWS: %s", exception);
																}
															} else if (response.length == 1) {
																responsedata.responseHeader.push(response[0]);
																responsedata.responseBody.push("");
																try {
																	res.send(responsedata);
																} catch (exception) {
																	logger.error("Exception while sending response data in the service debugTestCase_ICE - result_debugTestCaseWS: %s", exception);
																}
															} else {
																responsedata.responseHeader.push("");
																responsedata.responseBody.push("");
																try {
																	res.send(responsedata);
																} catch (exception) {
																	logger.error("Exception while sending response data in the service debugTestCase_ICE - result_debugTestCaseWS: %s", exception);
																}
															}
														} else {
															responsedata.responseHeader.push("Response Header - Fail");
															responsedata.responseBody.push("Response Body - Fail");
															try {
																res.send(responsedata);
															} catch (exception) {
																logger.error("Exception while sending response data in the service debugTestCase_ICE - result_debugTestCaseWS: %s", exception);
															}
														}
													}
												} catch (exception) {
													logger.error("Exception in the service debugTestCase_ICE - result_debugTestCaseWS: %s", exception);
												}
											}
										}
									}
									redisServer.redisSub2.on("message",result_debugTestCaseWS_listener);
							} catch (exception) {
								logger.error("Exception in the service debugTestCase_ICE - debugTestCaseWS_ICE: %s", exception);
							}
						} else if (action == 'wsdlListGenerator_ICE') {
							try {
								var wsdlurl = req.body.wsdlurl;
								logger.info("Sending socket request for debugTestCase to redis");
								dataToIce = {"emitAction" : "wsdl_listOfOperation","username" : name, "wsdlurl":wsdlurl};
								redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));	
								var updateSessionExpiry = setInterval(function () {
										req.session.cookie.maxAge = sessionTime;
									}, updateSessionTimeEvery);
									function result_wsdl_listOfOperation_listener(channel, message) {
										data = JSON.parse(message);
										//LB: make sure to send recieved data to corresponding user
										if (data.username == name) {
											redisServer.redisSub2.removeListener('message', result_wsdl_listOfOperation_listener);
											if (data.onAction == "unavailableLocalServer") {
												logger.error("Error occured in debugTestCase_ICE: Socket Disconnected");
												if ('socketMapNotify' in myserver && name in myserver.socketMapNotify) {
													var soc = myserver.socketMapNotify[name];
													soc.emit("ICEnotAvailable");
												}
											} else if (data.onAction == "result_wsdl_listOfOperation") {
												clearInterval(updateSessionExpiry);
												var listGenResponse = data.value;
												try {
													if (listGenResponse.toUpperCase() === 'TERMINATE') {
														try {
															res.send(listGenResponse);
														} catch (exception) {
															logger.error("Exception in the service debugTestCase_ICE - result_wsdl_listOfOperation: %s", exception);
														}
													} else {
														var responsedata = {
															listofoperations: []
														};
														if (listGenResponse != "None" && listGenResponse != "fail" && listGenResponse != undefined && listGenResponse != "") {
															listGenResponse = listGenResponse.replace(/'+/g, "\"");
															var listGenResponse = JSON.parse(listGenResponse);
															responsedata.listofoperations = listGenResponse;
															logger.info("Sending response data in the service debugTestCase_ICE: result_wsdl_listOfOperation");
															res.send(responsedata);
														} else {
															try {
																res.send("fail");
															} catch (exception) {
																logger.error("Exception in the service debugTestCase_ICE - result_wsdl_listOfOperation: %s", exception);
															}
														}
													}
												} catch (exception) {
													logger.error("Exception in the service debugTestCase_ICE - result_wsdl_listOfOperation: %s", exception);
												}
											}
										}
									}
									redisServer.redisSub2.on("message",result_wsdl_listOfOperation_listener);
								
							} catch (exception) {
								logger.error("Exception in the service debugTestCase_ICE - wsdlListGenerator_ICE: %s", exception);
							}
						} else if (action == 'wsdlServiceGenerator_ICE') {
							try {
								var wsdlurl = req.body.wsdlurl;
								var operations = req.body.method;
								var soapVersion = '0';
								if (operations.indexOf('SOAP1.2') !== -1) {
									soapVersion = '1';
								}
								if (operations.indexOf('SOAP') !== -1) {
									operations = operations.split('-')[1];
								}
								var serviceGenRequest = {
									wsdlurl: wsdlurl,
									operations: operations,
									soapVersion: soapVersion
								};
								logger.info("Sending socket request for debugTestCase to redis");
								dataToIce = {"emitAction" : "wsdl_ServiceGenerator","username" : name, "serviceGenRequest":serviceGenRequest};
								redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
								var updateSessionExpiry = setInterval(function () {
										req.session.cookie.maxAge = sessionTime;
									}, updateSessionTimeEvery);
								function result_wsdl_ServiceGenerator_listener(channel, message) {
									data = JSON.parse(message);
									//LB: make sure to send recieved data to corresponding user
									if (data.username == name) {
										redisServer.redisSub2.removeListener('message', result_wsdl_ServiceGenerator_listener);
										if (data.onAction == "unavailableLocalServer") {
											logger.error("Error occured in debugTestCase_ICE: Socket Disconnected");
											if ('socketMapNotify' in myserver && name in myserver.socketMapNotify) {
												var soc = myserver.socketMapNotify[name];
												soc.emit("ICEnotAvailable");
											}
										} else if (data.onAction == "result_wsdl_ServiceGenerator") {
											clearInterval(updateSessionExpiry);
											try {
												if (data.value.toUpperCase() === 'TERMINATE') {
													try {
														res.send(data.value);
													} catch (exception) {
														logger.error("Exception in the service debugTestCase_ICE - result_wsdl_ServiceGenerator: %s", exception);
													}
												} else {
													var responsedata = {
														endPointURL: [],
														method: ["POST"],
														header: [],
														body: [],
														operations: [],
														responseHeader: [""],
														responseBody: [""]
													};
													responsedata.endPointURL.push(wsdlurl.split('?')[0]);
													responsedata.operations.push(operations);
													if (data.value != "fail" && data.value != undefined && data.value != "") {
														response = data.value.split('rEsPONseBOdY:');
														if (response.length == 2) {
															responsedata.header.push(response[0]);
															responsedata.body.push(response[1]);
														} else if (response.length == 1) {
															responsedata.header.push(response[0]);
															responsedata.body.push("");
														} else {
															responsedata.header.push("");
															responsedata.body.push("");
														}
													} else {
														responsedata.header.push("");
														responsedata.body.push("");
													}
													try {
														res.send(responsedata);
													} catch (exception) {
														logger.error("Exception in the service debugTestCase_ICE - result_wsdl_ServiceGenerator: %s", exception);
													}
												}
											} catch (exception) {
												logger.error("Exception in the service debugTestCase_ICE - result_wsdl_ServiceGenerator: %s", exception);
											}
										}
									}
								}
								redisServer.redisSub2.on("message",result_wsdl_ServiceGenerator_listener);
							} catch (exception) {
								logger.error("Exception in the service debugTestCase_ICE - wsdlServiceGenerator_ICE: %s", exception);
							}
						}
					} catch (exception) {
						logger.error("Exception in the service debugTestCase_ICE - wsdlServiceGenerator_ICE: %s", exception);
					}
				} else {
					logger.error("Error in the service debugTestCase_ICE: Socket not Available");
					try {
						//res.send("unavailableLocalServer");
						if(Object.keys(myserver.allSchedulingSocketsMap).length > 0)
						{
							res.send("scheduleModeOn");
						}
						else{
							res.send("unavailableLocalServer");
						}
					} catch (exception) {
						logger.error("Error in the service debugTestCase_ICE: %s", exception);
					}
				}
			});
		} else {
			logger.error("Error in the service debugTestCase_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		if(Object.keys(myserver.allSchedulingSocketsMap).length > 0)
		{
			res.send("scheduleModeOn");
		}
		else{
			res.send("unavailableLocalServer");
		}
		logger.error("Exception in the service debugTestCase_ICE:unavailableLocalServer: %s", exception);
	}
};

/**
 * getKeywordDetails_ICE for fetching the objects,keywords
 * based on projecttype sent by front end
 * @author vishvas.a
 */
exports.getKeywordDetails_ICE = function getKeywordDetails_ICE(req, res) {
	try {
		logger.info("Inside UI service: getKeywordDetails_ICE");
		if (isSessionActive(req)) {
			var requestedprojecttypename = req.body.projecttypename;
			// Query 1 fetching the objecttype,keywords basked on projecttypename
			var individualsyntax = {};
			var args = {
				data: requestedprojecttypename,
				headers: {
					'Content-Type': 'application/json'
				}
			};
			logger.info("Calling NDAC Service from getKeywordDetails_ICE: design/getKeywordDetails_ICE");
			client.post(epurl + "design/getKeywordDetails_ICE", args,
				function (projectBasedKeywordsresult, response) {
					try {
						if (response.statusCode != 200 || projectBasedKeywordsresult.rows == "fail") {
							try {
								logger.error("Error occured in design/getKeywordDetails_ICE from getKeywordDetails_ICE, Error Code : ERRNDAC");
								res.send("Server data rendering failed: Fail");
							} catch (exception) {
								logger.error("Exception in the service getKeywordDetails_ICE: %s", exception);
							}
						} else {
							for (var objectindex = 0; objectindex < projectBasedKeywordsresult.rows.length; objectindex++) {
								var objecttype = projectBasedKeywordsresult.rows[objectindex].objecttype;
								// var keywords = projectBasedKeywordsresult.rows[objectindex].keywords;
								var keywords = JSON.parse(projectBasedKeywordsresult.rows[objectindex].keywords);
								individualsyntax[objecttype] = keywords;
							}
							try {
								res.send(individualsyntax);
							} catch (exception) {
								logger.error("Exception in the service getKeywordDetails_ICE: %s", exception);
							}
						}
					} catch (exception) {
						logger.error("Exception in the service getKeywordDetails_ICE: %s", exception);
					}
				});
		} else {
			logger.error("Error occured in the service getKeywordDetails_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service getKeywordDetails_ICE: %s", exception);
	}
};

//getDependentTestCases by ScenarioId
exports.getTestcasesByScenarioId_ICE = function getTestcasesByScenarioId_ICE(req, res) {
	try {
		logger.info("Inside UI service: getTestcasesByScenarioId_ICE");
		if (isSessionActive(req)) {
			var testcasesArr = [];
			var testScenarioId = req.body.testScenarioId;
			var inputs = {
				"testscenarioid": testScenarioId,
				"query": "gettestcaseids"
			};
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			logger.info("Calling NDAC Service from getTestcasesByScenarioId_ICE - gettestcaseids: design/getTestcasesByScenarioId_ICE");
			client.post(epurl + "design/getTestcasesByScenarioId_ICE", args,
				function (testcasesResult, response) {
				try {
					if (response.statusCode != 200 || testcasesResult.rows == "fail") {
						flag = "Error in fetching testcaseIds : Fail";
						try {
							logger.error("Error in fetching testcaseIds");
							res.send(flag);
						} catch (exception) {
							logger.error("Exception in the service getTestcasesByScenarioId_ICE - gettestcaseids: %s", exception);
						}
					} else {
						var testcaseIds = testcasesResult.rows[0].testcaseids;
							async.forEachSeries(testcaseIds, function (eachtestcaseid, fetchtestcaseNameCallback) {
								var testcasesObj = {};
								try {
									var inputs = {
										"eachtestcaseid": eachtestcaseid,
										"query": "gettestcasedetails"
									};
									var args = {
										data: inputs,
										headers: {
											"Content-Type": "application/json"
										}
									};
									logger.info("Calling NDAC Service from getTestcasesByScenarioId_ICE - gettestcasedetails: design/getTestcasesByScenarioId_ICE");
									client.post(epurl + "design/getTestcasesByScenarioId_ICE", args,
										function (testcaseNamesResult, response) {
										try {
											if (response.statusCode != 200 || testcaseNamesResult.rows == "fail") {
												flag = "Error in fetching testcaseNames : Fail";
												try {
													logger.error("Error in fetching testcaseNames");
													res.send(flag);
												} catch (exception) {
													logger.error("Exception in the service getTestcasesByScenarioId_ICE - gettestcasedetails: %s", exception);
												}
											} else {
												var testcaseNames = testcaseNamesResult.rows[0];
												testcasesObj.testcaseId = eachtestcaseid;
												testcasesObj.testcaseName = testcaseNames.testcasename;
												testcasesArr.push(testcasesObj);
												fetchtestcaseNameCallback();
											}
										} catch (exception) {
											logger.error("Exception in the service getTestcasesByScenarioId_ICE - gettestcasedetails: %s", exception);
										}
									});
								} catch (exception) {
									logger.error("Exception in the service getTestcasesByScenarioId_ICE: %s", exception);
								}
							}, finalfunction);
					}
				} catch (exception) {
					logger.error("Exception in the service getTestcasesByScenarioId_ICE: %s", exception);
				}

				function finalfunction() {
					logger.info("Inside the finalfunction");
					try {
						logger.info("Sending testcase details");
						res.send(testcasesArr);
					} catch (exception) {
						logger.error("Exception in the finalfunction from the service getTestcasesByScenarioId_ICE: %s", exception);
					}
				}
			});
		} else {
			logger.error("Error occured in the service getTestcasesByScenarioId_ICE: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service getTestcasesByScenarioId_ICE: %s", exception);
	}
};
