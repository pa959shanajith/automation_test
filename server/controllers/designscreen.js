/*
 * Dependencies.
 */
const myserver = require('../lib/socket');
const logger = require('../../logger');
const redisServer = require('../lib/redisSocketHandler');
const utils = require('../lib/utils');

exports.initScraping_ICE = function (req, res) {
	var icename,value,username;
	var dataToIce={};
	logger.info("Inside UI service: initScraping_ICE");
	try {
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
	} catch (exception) {
		logger.error("Exception in the service initScraping_ICE: %s",exception);
		res.send("fail");
	}
};

exports.getScrapeDataScreenLevel_ICE = async (req, res) => {
	const fnName = "getScrapeDataScreenLevel_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		const inputs = {
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
		const result = await utils.fetchData(inputs, "design/getScrapeDataScreenLevel_ICE", fnName);
		if (result == "fail") return res.send("fail");
		logger.info("Scraped Data sent successfully from designscreen/"+fnName+" service");
		res.send(JSON.stringify(result))
	} catch (exception) {
		logger.error("Error occurred in designscreen/"+fnName+":", exception);
        res.status(500).send("fail");
	}
};

exports.updateScreen_ICE = async (req, res) =>{
	const fnName = "updateScreen_ICE";
	try {
		logger.info("Inside UI service: " + fnName);
		var d = req.body;
		var inputs = d.data;
		var data = await utils.fetchData(inputs, "design/updateScreen_ICE", fnName);
		res.send(data)
	} catch (exception) {
		logger.error("Error occurred in designscreen/"+fnName+":", exception);
		res.status(500).send('fail');
	}
};

exports.userObjectElement_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: userObjectElement_ICE");
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
	} catch (exception) {
		logger.error("Exception in the service userObjectElement_ICE: %s",exception);
		res.send("fail");
	}
};

exports.highlightScrapElement_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: highlightScrapElement_ICE");
		var username=req.session.username;
		var icename = undefined
		if(myserver.allSocketsICEUser[username] && myserver.allSocketsICEUser[username].length > 0 ) icename = myserver.allSocketsICEUser[username][0];
		redisServer.redisSubServer.subscribe('ICE2_' + icename);
		var focusParam = req.body.elementXpath;
		var elementURL = req.body.elementUrl;
		var appType = req.body.appType;
		logger.info("ICE Socket requesting Address: %s" , icename);
		logger.info("Sending socket request for focus to cachedb");
		var dataToIce = {"emitAction": "focus", "username": icename, "focusParam": focusParam, "elementURL": elementURL, "appType": appType};
		redisServer.redisPubICE.publish('ICE1_normal_' + icename,JSON.stringify(dataToIce));
		logger.info("Successfully highlighted selected object");
		res.send('success');
	} catch (exception) {
		logger.error("Exception in the service highlightScrapElement_ICE: %s",exception);
		res.send("fail");
	}
};

exports.updateIrisDataset = async(req, res) => {
	const fnName = "updateIrisDataset";
	logger.info("Inside UI service: " + fnName);
	try{
		var image_data = req.body.data;
		const result = await utils.fetchData(image_data, "design/updateIrisObjectType", fnName);
		res.send(result)
	} catch(exception){
		logger.error("Error occurred in designscreen/"+fnName+":", exception);
		res.send("fail");
	}
}
