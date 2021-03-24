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

exports.updateScreen_ICE= async (req, res) =>{
    logger.info("Inside UI service: updateScreen_ICE");
    var d = req.body;
    var inputs = d.data;
    var data = await utils.fetchData(inputs, "design/updateScreen_ICE","updateScreen_ICE");
    res.send(data)
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


function parseJsonRequest(requestedBody,base_key,cur_key,xpaths) {
	var xpaths=xpaths;
	try {
		logger.info("Inside the function parseRequest ");
     	for (var key in requestedBody){
			 var value=requestedBody[key];
			 if (typeof(value)==="object" && !(Array.isArray(value))){
				if (base_key!== "")  base_key+='/'+key;
				else  base_key=key;
				xpaths.push(base_key);
				xpaths.concat(parseJsonRequest(value,base_key,key,xpaths));
				base_key=base_key.slice(0,-key.length-1);

			 }else if(Array.isArray(value)){
				for (var i=0;i<value.length;i++){
					base_key+=key+"["+i.toString()+"]";
					xpaths.concat(parseJsonRequest(value[i],base_key,key,xpaths));
				}
					
			 }else{
				xpaths.push(base_key+'/'+key);
			 }
		 }
		 base_key=base_key.slice(0,-cur_key.length);
     	 
	} catch (exception) {
		logger.error("Exception in the function parseRequest: %s", exception);
	}
	return xpaths;
}