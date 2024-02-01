/*
 * Dependencies.
 */
const myserver = require('../lib/socket');
const logger = require('../../logger');
const utils = require('../lib/utils');
var path = require('path');
var fs = require('fs');
var xlsx = require('xlsx');
var xl = require('excel4node');

/* Convert excel file to CSV Object. */
var xlsToCSV = function (workbook, sheetname) {
	var result = [];
	var csv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetname]);
	if (csv.length > 0) {
		result.push(sheetname);
		result.push(csv);
	}
	//return result.join("\n");
	return result;
};

exports.initScraping_ICE = function (req, res) {
	var icename,value,username;
	var dataToIce={"username":""};
	logger.info("Inside UI service: initScraping_ICE");
	try {
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		username=req.session.username;
		icename = undefined
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][icename];	
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.info("ICE Socket requesting Address: %s" , icename);
		if(mySocket != undefined && mySocket.connected) {	
				var reqAction = "";
				var reqBody = req.body.screenViewObject;
				if (reqBody.appType == "Desktop") {
					var applicationPath = reqBody.applicationPath;
					var processID = reqBody.processID;
					var scrapeMethod = reqBody.scrapeMethod;
					reqAction = "desktop";
					dataToIce = {"emitAction": "LAUNCH_DESKTOP", "username": icename, "applicationPath": applicationPath,
						"processID": processID, "scrapeMethod": scrapeMethod};
					logger.info("Sending socket request for "+dataToIce.emitAction+" to cachedb");
					mySocket.emit(dataToIce["emitAction"], dataToIce.applicationPath, dataToIce.processID, dataToIce.scrapeMethod);
				} else if (reqBody.appType == "SAP") {
					var applicationPath = reqBody.applicationPath;
					reqAction = "SAP";
					var emitAction = "LAUNCH_SAP";
					if (reqBody.scrapeType && reqBody.scrapeType == "Genius") {
						emitAction= "LAUNCH_SAP_GENIUS";
					}
					dataToIce = {"emitAction": emitAction, "username": icename, "applicationPath": applicationPath};
					logger.info("Sending socket request for "+dataToIce.emitAction+" to cachedb");
					mySocket.emit(dataToIce["emitAction"], dataToIce.applicationPath);
				} else if (reqBody.appType == "OEBS") {
					var applicationPath = reqBody.applicationPath;
					reqAction = "OEBS";
					dataToIce = {"emitAction": "LAUNCH_OEBS", "username": icename, "applicationPath": applicationPath};
					logger.info("Sending socket request for "+dataToIce.emitAction+" to cachedb");
					mySocket.emit(dataToIce["emitAction"], dataToIce.applicationPath);
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
							
							logger.info("Sending socket request for "+dataToIce.emitAction+" to cachedb");
							mySocket.emit("LAUNCH_MOBILE", dataToIce.deviceName, dataToIce.versionNumber, dataToIce.bundleId, dataToIce.ipAddress, dataToIce.param);
					} else {
						dataToIce = {"emitAction" : "LAUNCH_MOBILE", "username" : icename, "apkPath": apkPath, "serial": serial,
							"mobileDeviceName": mobileDeviceName, "mobileIosVersion": mobileIosVersion, "mobileUDID": mobileUDID};
						
						logger.info("Sending socket request for "+dataToIce.emitAction+" to cachedb");	
						mySocket.emit("LAUNCH_MOBILE", dataToIce.apkPath, dataToIce.serial, dataToIce.mobileDeviceName, dataToIce.mobileIosVersion, dataToIce.mobileUDID);
					}
					// mySocket.emit(dataToIce["emitAction"], dataToIce.applicationPath, dataToIce.processID, dataToIce.scrapeMethod);
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

						logger.info("Sending socket request for "+dataToIce.emitAction+" to cachedb");
						mySocket.emit("LAUNCH_MOBILE_WEB", dataToIce.mobileSerial, dataToIce.androidVersion, dataToIce.data);
				} else if (req.body.screenViewObject.appType == "pdf"){
					var data = {};
					var browserType = req.body.screenViewObject.appType;
					data.browsertype = browserType;
					dataToIce = {"emitAction" : "PDF_SCRAPE","username" : icename, "data":data,"browsertype":browserType};
					
					logger.info("Sending socket request for "+dataToIce.emitAction+" to cachedb");
					mySocket.emit("PDF_SCRAPE", data.browsertype);
				} else {  //Web Scrape
					var data = {action: "scrape"};
					var browserType = reqBody.browserType;
					if (reqBody.action == 'compare') {
					   if (reqBody.scenarioLevel){

						data.view = reqBody.dataObject;

						data.scenarioLevel = true;

					}

					    else{
						data.viewString = reqBody.viewString.view;
						if ("scrapedurl" in reqBody.viewString){
							data.scrapedurl = reqBody.viewString.scrapedurl;
						}
						else{
							data.scrapedurl = "";
						}
						data.scrapedurl = reqBody.viewString.scrapedurl;
					}
						data.action = reqBody.action;
					} else if (reqBody.action == 'replace') {
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

					logger.info("Sending socket request for "+dataToIce.emitAction+" to cachedb");
					mySocket.emit(dataToIce["emitAction"], dataToIce.data);
				}
				dataToIce.username = icename;
				// function scrape_listener(message) {
				// 	var data = message;
				// 	//LB: make sure to send recieved data to corresponding user
				// 	mySocket.removeListener('scrape', scrape_listener);
				// 	value = data;
				// 	logger.info("Sending "+reqAction+" scraped objects from initScraping_ICE");
				// 	res.send(value);
				// }
				// mySocket.on("scrape", scrape_listener);
				myserver.resMap[clientName][icename] = res;
			} else {
				logger.error("Error occurred in the service initScraping_ICE: Socket not Available");
				var flag = "unavailableLocalServer";
				res.send(flag);
			}
		
	} catch (exception) {
		logger.error("Exception in the service initScraping_ICE: %s",exception);
		res.send("fail");
	}
};
exports.updateScenarioComparisionStatus = async (req, res) => {

    const fnName = "updateScenarioComparisionStatus";

    logger.info("Inside UI service: " + fnName);

    try {

        const inputs = {

            "scenarioID": req.body.scenarioID,

            "scenarioComparisonData": req.body.scenarioComparisionData,

            "query": "updatecomparisiondata"

        };

        if (req.body.type == "WS_screen" || req.body.type== "Webservice"){

            inputs.query = "getWSscrapedata";

        }

        const result = await utils.fetchData(inputs, "design/updateScenarioComparisionStatus", fnName);

        if (result == "fail") return res.send("fail");

        logger.info("Scenario comparision status sent successfully from designscreen/"+fnName+" service");

        res.send(JSON.stringify(result))

    } catch (exception) {

        logger.error("Error occurred in designscreen/"+fnName+":", exception);

        res.status(500).send("fail");

    }

};
exports.updateTestSuiteInUseBy = async (req, res) => {

    const fnName = "updateTestSuiteInUseBy";

    logger.info("Inside UI service: " + fnName);

    try {

        const inputs = {

            "testsuiteId": req.body.testsuiteId,
            "resetFlag":req.body.resetFlag,
			"assignToUser":req.body.assignToUser,
            "accessedBy": req.body.accessedBy,
			"oldTestSuiteId":req.body.oldTestSuiteId,
            "query": "updatetesuiteAccessedBy"

        };

        if (req.body.type == "WS_screen" || req.body.type== "Webservice"){

            inputs.query = "getWSscrapedata";

        }

        const result = await utils.fetchData(inputs, "design/updateTestSuiteInUseBy", fnName);

        if (result == "fail") return res.send("fail");

        logger.info("Scenario comparision status sent successfully from designscreen/"+fnName+" service");

        res.send(JSON.stringify(result))

    } catch (exception) {

        logger.error("Error occurred in designscreen/"+fnName+":", exception);

        res.status(500).send("fail");

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
exports.getScrapeDataScenarioLevel_ICE = async (req, res) => {

    const fnName = "getScrapeDataScenarioLevel_ICE";

    logger.info("Inside UI service: " + fnName);

    try {

        const inputs = {

            "scenarioID": req.body.scenarioID,

            "query": "getscrapedata"

        };

        if (req.body.type == "WS_screen" || req.body.type== "Webservice"){

            inputs.query = "getWSscrapedata";

        }

        const result = await utils.fetchData(inputs, "design/getScrapeDataScenarioLevel_ICE", fnName);

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
		inputs.userId = req.session.userid;
		inputs.roleId = req.session.activeRoleId;
		var data = await utils.fetchData(inputs, "design/updateScreen_ICE", fnName);
		res.send(data)
	} catch (exception) {
		logger.error("Error occurred in designscreen/"+fnName+":", exception);
		res.status(500).send('fail');
	}
};

exports.insertScreen = async (req, res) =>{
    const fnName = "insertScreen";
    try {
        logger.info("Inside UI service: " + fnName);
        // var d = req.body;
        var inputs = req.body.data;
        inputs.userId = req.session.userid;
        inputs.roleId = req.session.activeRoleId;
        var data = await utils.fetchData(inputs, "design/insertScreen", fnName);
        res.send(data)
    } catch (exception) {
        logger.error("Error occurred in insertScreen/"+fnName+":", exception);
        res.status(500).send('fail');
    }
};

exports.fetchReplacedKeywords_ICE = async (req, res) => {
	const fname = "fetchReplacedKeywords_ICE";
	try{
		logger.info("Inside UI service: "+fname);
		var data = await utils.fetchData(req.body, "design/fetchReplacedKeywords_ICE", fname);
		res.send(data);
	} catch (exception){
		logger.error("Error occured in designscreen/"+fname+":",exception);
		res.status(500).send('fail');
	}
}

exports.userObjectElement_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: userObjectElement_ICE");
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username=req.session.username;
		var icename = undefined
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][icename];	
		var operation = req.body.object[0];
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.info("ICE Socket requesting Address: %s" , icename);
		logger.info("Sending socket request for focus to cachedb");
		if(mySocket != undefined && mySocket.connected) {	
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
				mySocket.emit(dataToIce["emitAction"], dataToIce.data);
				// function userObjectElement_ICE_listener(message) {
				// 	var data = message;
				// 		mySocket.removeListener('scrape', userObjectElement_ICE_listener);						
				// 		value = data;
				// 		logger.info("Sending objects");
				// 		res.send(value);	
				// }
				// mySocket.on("scrape",userObjectElement_ICE_listener);
				myserver.resMap[clientName][icename] = res;
				logger.info("Successfully updated userdefined object");
			} else {
				logger.error("Error occurred in the service initScraping_ICE: Socket not Available");
				res.send("unavailableLocalServer")
			}
		
	} catch (exception) {
		logger.error("Exception in the service userObjectElement_ICE: %s",exception);
		res.send("fail");
	}
};

exports.highlightScrapElement_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: highlightScrapElement_ICE");
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username=req.session.username;
		var icename = undefined
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][icename];	
		var focusParam = req.body.elementXpath;
		var elementURL = req.body.elementUrl;
		var appType = req.body.appType;
		var top = req.body.top;
		var left = req.body.left;
		var width = req.body.width;
		var height = req.body.height;
		logger.info("ICE Socket requesting Address: %s" , icename);
		logger.info("Sending socket request for focus to cachedb");
		mySocket.emit("focus", focusParam, elementURL, appType, top, left, width, height);
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

exports.exportScreenToExcel = async (req, res) =>{
	const fnName = "exportScreenToExcel";
	logger.info("Inside UI service: " + fnName);
	try {
		logger.info("Fetching Module details");
		const inputs = {
			"screenid": req.body.screenId,
			"projectid": req.body.projectId,
			"query": "getscrapedata"
		};
		const result = await utils.fetchData(inputs, "design/getScrapeDataScreenLevel_ICE", fnName);
		if (result == "fail") return res.send("fail");
		logger.info("Scraped Data sent successfully from designscreen/"+fnName+" service");
		logger.info("Writing Module structure to Excel");
		var excelDirPath = path.join(__dirname, './../../output');
		var filePath = path.join(excelDirPath, 'samp234.xlsx');

		try {
			if (!fs.existsSync(excelDirPath)) fs.mkdirSync(excelDirPath); // To create directory for storing excel files if DNE.
			if (fs.existsSync(filePath)) fs.unlinkSync(path.join(filePath)); // To remove the created files
		} catch (e) {
			logger.error("Exception in mindmapService: exportScreenToExcel: Create Directory/Remove file", e);
		}

		//create a new workbook file in current working directory
		var wb = new xl.Workbook();
		var ws = wb.addWorksheet('Sheet1');

		//create the new worksheet with 10 coloumns and rows equal to number of testcases
		var curr = result;

		//Set some width for columns
		ws.column(1).setWidth(40);
		ws.column(2).setWidth(15);
		ws.column(3).setWidth(15);
		ws.column(4).setWidth(15);
		ws.column(5).setWidth(15);
		ws.column(6).setWidth(15);
		ws.column(7).setWidth(15);
		ws.column(8).setWidth(15);
		ws.column(9).setWidth(15);
		ws.column(10).setWidth(15);
		ws.column(11).setWidth(15);
		ws.column(12).setWidth(15);
		ws.column(13).setWidth(15);
		ws.column(14).setWidth(15);
		ws.column(15).setWidth(15);

		var style = wb.createStyle({
			font: {
				color: '000000',
				bold: true,
					size: 12,
				}
				});

		ws.cell(1, 1)
				.string('ObjectName')
				.style(style);

		ws.cell(1, 2)
				.string('Update')
				.style(style);

		ws.cell(1, 3)
				.string('URL')
				.style(style);

		ws.cell(1, 4)		
				.string('RelativeXpath')
				.style(style);

		ws.cell(1, 5)
				.string('Id')
				.style(style);

		ws.cell(1, 6)
				.string('AbsoluteXpath')
				.style(style);

		ws.cell(1, 7)
				.string('Name')
				.style(style);

		ws.cell(1, 8)
				.string('TagName')
				.style(style);

		ws.cell(1, 9)
				.string('ClassName')
				.style(style);

		ws.cell(1, 10)
				.string('Left')
				.style(style);

		ws.cell(1, 11)
				.string('Top')
				.style(style);

		ws.cell(1, 12)
				.string('Height')
				.style(style);

		ws.cell(1, 13)
				.string('Width')
				.style(style);

		ws.cell(1, 14)
				.string('CssSelector')
				.style(style);

		ws.cell(1, 15)
				.string('ObjectType')
				.style(style);

		var obj_count=1;
		for (i = 0; i < curr.view.length; i++) {
			ws.cell(2+i,1).string(curr.view[i].custname);
			ws.cell(2+i,3).string(curr.view[i].url);
			xpathSplit = curr.view[i].xpath.split(";");
			if(xpathSplit[2] == "null"){
				ws.cell(2+i,4).string((""));
			}
			else{
			ws.cell(2+i,4).string(xpathSplit[2]);
			}
			if(xpathSplit[1] == "null"){
				ws.cell(2+i,5).string((""));
			}
			else{
				ws.cell(2+i,5).string(xpathSplit[1]);
			}

			if(xpathSplit[0] == "null"){
				ws.cell(2+i,6).string((""));
			}
			else{
			ws.cell(2+i,6).string(xpathSplit[0]);
			}

			if(xpathSplit[3] == "null"){
				ws.cell(2+i,7).string((""));
			}else{
				ws.cell(2+i,7).string(xpathSplit[3]);
			}

			if(xpathSplit[4] == "null" ){
				ws.cell(2+i,8).string((""));
			}
			else{
				ws.cell(2+i,8).string(xpathSplit[4]);
			}

			if(xpathSplit[5] == "null"){
				ws.cell(2+i,9).string((""));
			}
			else{
				ws.cell(2+i,9).string(xpathSplit[5]);
			}
			if ("left" in curr.view[i] ){
			ws.cell(2+i,10).string((curr.view[i].left).toString());
			}
			else{
				ws.cell(2+i,10).string((""));
			}
			if("top" in curr.view[i]  ){
				ws.cell(2+i,11).string((curr.view[i].top).toString());
			}
			else{
				ws.cell(2+i,11).string((""));
			}
			if("height" in curr.view[i]  ){
				ws.cell(2+i,12).string((curr.view[i].height).toString());
			}
			else{
				ws.cell(2+i,12).string((""));
			}
			if("width" in curr.view[i]  ){
				ws.cell(2+i,13).string((curr.view[i].width).toString());
			}
			else{
				ws.cell(2+i,13).string((""));
			}
			if (xpathSplit[12] == undefined){
			ws.cell(2+i,14).string((""));
			}
			else{
			ws.cell(2+i,14).string(xpathSplit[12]);
			}
			if(xpathSplit[14] == undefined){
			ws.cell(2+i,15).string((""));
			}
			else{
			ws.cell(2+i,15).string(xpathSplit[14]);
			}
		}

		//save it
		wb.write(filePath,function (err) {
			if (err) return res.send('fail');
			res.writeHead(200, {'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
			var rstream = fs.createReadStream(filePath);
			rstream.pipe(res);
		});
	} catch(exception) {
		logger.error("Error occurred in designscreen/"+fnName+":", exception);
		return res.status(500).send("fail");
	}

};

exports.importScreenfromExcel = async (req, res) =>{
	const fnName = "importScreenfromExcel";
	logger.info("Inside UI service: " + fnName);
	try {
		var wb1 = xlsx.read(req.body.data.content, { type: 'binary' });
		if (req.body.data.flag == 'sheetname') {
			return res.status(200).send(wb1.SheetNames);
		}
		else if (req.body.data.flag == 'data') {
			var myCSV = xlsToCSV(wb1, req.body.data.sheetname);
			var numSheets = myCSV.length / 2;
			var qObj = [];
			var objlst = [];
			var err;
			if (numSheets == 0) {
				return res.status(200).send("emptySheet");
			}
			for (var k = 0; k < numSheets; k++) {
				var cSheet = myCSV[k * 2 + 1];
				var cSheetRow = cSheet.split('\n');
				var objIdx = -1, updIdx = -1, rxpathIdx = -1, idIdx = -1, axpathIdx = -1, nameIdx = -1, tagIdx = -1, classIdx = -1;
				var leftIdx = -1, topIdx = -1, hIdx = -1, wIdx = -1, cssIdx = -1, objtypeIdx = -1;
				var uniqueIndex = 0;
				cSheetRow[0].split(',').forEach(function (e, i) {
					if(i== 0 && e.toLowerCase()=="objectname") objIdx = i;
					if(i== 1 && e.toLowerCase()=="update") updIdx = i;
					if(i== 2 && e.toLowerCase()=="url") urlIdx = i;
					if(i== 3 && e.toLowerCase()=="relativexpath") rxpathIdx = i;
					if(i== 4 && e.toLowerCase()=="id") idIdx = i;
					if(i== 5 && e.toLowerCase()=="absolutexpath") axpathIdx = i;
					if(i== 6 && e.toLowerCase()=="name") nameIdx = i;
					if(i== 7 && e.toLowerCase()=="tagname") tagIdx = i;
					if(i== 8 && e.toLowerCase()=="classname") classIdx = i;
					if(i== 9 && e.toLowerCase()=="left") leftIdx = i;
					if(i== 10 && e.toLowerCase()=="top") topIdx = i;
					if(i== 11 && e.toLowerCase()=="height") hIdx = i;
					if(i== 12 && e.toLowerCase()=="width") wIdx = i;
					if(i== 13 && e.toLowerCase()=="cssselector") cssIdx = i;
					if(i== 14 && e.toLowerCase()=="objecttype") objtypeIdx = i;
				});
				if (objIdx == -1 || updIdx == -1 || urlIdx == -1 || rxpathIdx == -1 || idIdx == -1 || axpathIdx == -1 || nameIdx == -1 || tagIdx == -1 || classIdx == -1 ||
					leftIdx == -1 || topIdx == -1 || hIdx == -1 || wIdx == -1 || cssIdx == -1 || objtypeIdx == -1|| cSheetRow.length < 2) {
					err = true;
					break;
				}
				var objprop = [];
				for (var i = 1; i < cSheetRow.length; i++) {
					var e={}
					var row = cSheetRow[i].split(',');
					if (i==1 && (row[0]=="" || row[1]=="")){
						if (row[1].toLowerCase() == "yes" && (row[2]!="" ||row[3]!="" ||row[4]!="" ||row[5]!="" ||row[6]!="" ||row[7]!="" ||row[8]!="" ||row[9]!="" ||
						row[10]!="" || row[11]!="" ||row[12]!="" || row[13]!="" || row[14]!="" )){
							return res.status(200).send('valueError');
						}
					}
					if (row.length < 15) continue;
					if (row[objIdx] !== '') {
						e.name = row[objIdx];
					}
					if (row[updIdx] !== '') {
						e.update = row[updIdx];
					}
					if (row[urlIdx] !== '') {
						e.url = row[urlIdx];
					}
					if (row[objtypeIdx] !== '') {
						e.objtype = row[objtypeIdx];
					}
					a={}
					for (var j = 3; j < row.length; j++) {
						if(row[j] != ""){
							a[j-3] = row[j]
						}
					}
					e.modify = a
					objlst.push(e)
				}
			}
			if (err) res.status(200).send('fail');
			else{
				const inputs = {
					"screenid": req.body.data.screenid,
					"projectid": req.body.data.projectid,
					"data": objlst
				};
				const result = await utils.fetchData(inputs, "design/updateImportObject", fnName);
				if (result == "fail") return res.send("fail");
				else res.send(JSON.stringify(result))
			}
		}
	} catch(exception) {
		logger.error("Error occurred in designscreen/"+fnName+":", exception);
		return res.status(500).send("fail");
	}

};

exports.getDeviceSerialNumber_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: getDeviceSerialNumber_ICE");
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username=req.session.username;
		var icename = undefined
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][icename];
		logger.info("ICE Socket requesting Address: %s" , icename);
		logger.info("Sending socket request to get serial number");
		mySocket.emit("getSerialNumber");
		try {
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.debug("ICE Socket requesting Address: %s", icename);
				function get_device_serial_listener(message) {
					var data = message;
						mySocket.removeListener("get_serial_number", get_device_serial_listener);
						var resultData = data;
						res.send(resultData);	
				}
				mySocket.on("get_serial_number", get_device_serial_listener);
					
				
		} catch (exception) {
			logger.error("Exception in the service getDeviceSerialNumber_ICE: %s", exception);
		}
	} catch (exception) {
		logger.error("Exception in the service getDeviceSerialNumber_ICE: %s",exception);
		res.send("fail");
	}
};

exports.checkingMobileClient_ICE = function (req, res) {
	try {
		logger.info("Inside UI service: checkingMobileClient_ICE");
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		var username=req.session.username;
		var icename = undefined
		if(myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
		mySocket = myserver.allSocketsMap[clientName][icename];	
		logger.info("ICE Socket requesting Address: %s" , icename);
		logger.info("Sending socket request to check mobile Client Folder");
		mySocket.emit("checkingMobileClient");
		
		try {
			logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
			logger.debug("ICE Socket requesting Address: %s", icename);

			mySocket.emit("checkingMobileClient");

				function Checking_mobile_client(message) {
					var data = message;
						mySocket.removeListener("checking_Mobile_Client", Checking_mobile_client);
						var resultData = data;
						res.send(resultData);	
						
				}
				mySocket.on("checking_Mobile_Client", Checking_mobile_client);
					
				
		} catch (exception) {
			logger.error("Exception in the checkingMobileClient_ICE: %s", exception);
		}
	} catch (exception) {
		logger.error("Exception in the checkingMobileClient_ICE: %s",exception);
		res.send("fail");
	}
};

exports.launchAndServerConnectSAPGenius_ICE = function (req, res) {
	var icename,value,username;
	var dataToIce={"username":""};
	logger.info("Inside UI service: launchAndServerConnectSAPGenius_ICE");
	try {
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		username=req.session.username;
		icename = undefined
		if(myserver.allSocketsICEUser[clientName] && myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
		if (myserver.allSocketsMap[clientName] && myserver.allSocketsMap[clientName][icename]) mySocket = myserver.allSocketsMap[clientName][icename];
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.info("ICE Socket requesting Address: %s" , icename);
		if(mySocket != undefined && mySocket.connected) {	
				var reqAction = "";
				var reqBody = req.body.screenViewObject;
				if (reqBody.appType == "SAP") {
					var applicationPath = reqBody.applicationPath;
					reqAction = "SAP";
					var emitAction = "LAUNCH_SAP_GENIUS";
					dataToIce = {"emitAction": emitAction, "username": icename, "applicationPath": applicationPath};
					logger.info("Sending socket request for "+dataToIce.emitAction+" to cachedb");
					mySocket.emit(dataToIce["emitAction"], dataToIce.applicationPath);
				}
				res.send("pass");
		} 
		else {
				logger.error("Error occurred in the service launchAndServerConnectSAPGenius_ICE: Socket not Available");
				var flag = "unavailableLocalServer";
				res.send(flag);
		}
		
	} 
	catch (exception) {
		logger.error("Exception in the service launchAndServerConnectSAPGenius_ICE: %s",exception);
		res.send("fail");
	}
};


exports.startScrapingSAPGenius_ICE = function (req, res) {
	var icename,value,username;
	var dataToIce={"username":""};
	logger.info("Inside UI service: startScrapingSAPGenius_ICE");
	try {
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		username=req.session.username;
		icename = undefined
		if(myserver.allSocketsICEUser[clientName] && myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
		if (myserver.allSocketsMap[clientName] && myserver.allSocketsMap[clientName][icename]) mySocket = myserver.allSocketsMap[clientName][icename];	
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.info("ICE Socket requesting Address: %s" , icename);
		if(mySocket != undefined && mySocket.connected) {	
				var reqAction = "";
				var reqBody = req.body.screenViewObject;
				if (reqBody.appType == "SAP") {
					var applicationPath = reqBody.applicationPath;
					reqAction = "SAP";
					var emitAction = "START_SCRAPE_SAP_GENIUS";
					dataToIce = {"emitAction": emitAction, "username": username, "applicationPath": applicationPath};
					logger.info("Sending socket request for "+dataToIce.emitAction+" to cachedb");
					mySocket.emit(dataToIce["emitAction"], dataToIce.applicationPath, dataToIce.username);
				}
				res.send("pass");
		} 
		else {
				logger.error("Error occurred in the service startScrapingSAPGenius_ICE: Socket not Available");
				var flag = "unavailableLocalServer";
				res.send(flag);
		}
		
	} 
	catch (exception) {
		logger.error("Exception in the service startScrapingSAPGenius_ICE: %s",exception);
		res.send("fail");
	}
};

exports.stopScrapingSAPGenius_ICE = function (req, res) {
	var icename,value,username;
	var dataToIce={"username":""};
	logger.info("Inside UI service: stopScrapingSAPGenius_ICE");
	try {
		var mySocket;
		var clientName=utils.getClientName(req.headers.host);
		username=req.session.username;
		icename = undefined
		if(myserver.allSocketsICEUser[clientName] && myserver.allSocketsICEUser[clientName][username] && myserver.allSocketsICEUser[clientName][username].length > 0 ) icename = myserver.allSocketsICEUser[clientName][username][0];
		if (myserver.allSocketsMap[clientName] && myserver.allSocketsMap[clientName][icename]) mySocket = myserver.allSocketsMap[clientName][icename];	
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		logger.debug("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
		logger.info("ICE Socket requesting Address: %s" , icename);
		if(mySocket != undefined && mySocket.connected) {	
				var reqAction = "";
				var reqBody = req.body.screenViewObject;
				if (reqBody.appType == "SAP") {
					var applicationPath = reqBody.applicationPath;
					reqAction = "SAP";
					var emitAction = "STOP_SCRAPE_SAP_GENIUS";
					dataToIce = {"emitAction": emitAction, "username": username, "applicationPath": applicationPath};
					logger.info("Sending socket request for "+dataToIce.emitAction+" to cachedb");
					mySocket.emit(dataToIce["emitAction"], dataToIce.applicationPath, dataToIce.username);
				}
				res.send("pass");
		} 
		else {
				logger.error("Error occurred in the service stopScrapingSAPGenius_ICE: Socket not Available");
				var flag = "unavailableLocalServer";
				res.send(flag);
		}
		
	} 
	catch (exception) {
		logger.error("Exception in the service stopScrapingSAPGenius_ICE: %s",exception);
		res.send("fail");
	}
};