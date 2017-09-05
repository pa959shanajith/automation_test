/**
 * Dependencies.
 */
var Joi = require('joi');
// var dbConn = require('../../server/config/icetestautomation');
// var cassandra = require('cassandra-driver');
var myserver = require('../../server.js');
var async = require('async');
var parse = require('xml-parser');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl="http://127.0.0.1:1990/";
var dbConnICEHistory = require('../../server/config/ICEHistory');
/**
 * @author vinay.niranjan
 * @modified author vinay.niranjan
 * the service is used to init scraping & fetch scrape objects 
 */

//base RequestElement
var baseRequestBody={};
//xpath for view
var allXpaths=[];
//custname for view
var allCustnames=[];
var objectLevel=1;
var xpath="";
var inputsWS={}

exports.initScraping_ICE = function (req, res) {
	try{
		  if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		console.log("IP:",ip);
		var name = req.session.username;
		console.log(Object.keys(myserver.allSocketsMap),"<<all people, asking person:",name);
		if('allSocketsMap' in myserver && name in myserver.allSocketsMap){
			var mySocket = myserver.allSocketsMap[name];
			var reqScrapJson = {};
			reqScrapJson.action = "SCRAPE"
			if(req.body.screenViewObject.appType == "Desktop"){
				var applicationPath = req.body.screenViewObject.applicationPath;
				var data = "LAUNCH_DESKTOP";
				mySocket._events.scrape = [];               						
				mySocket.emit("LAUNCH_DESKTOP", applicationPath);
				mySocket.on('scrape', function (data) {
					res.send(data);
				});
			}
			else if(req.body.screenViewObject.appType == "SAP"){
				var applicationPath = req.body.screenViewObject.applicationPath;
				var data = "LAUNCH_SAP";
				mySocket._events.scrape = [];               						
				mySocket.emit("LAUNCH_SAP", applicationPath);
				mySocket.on('scrape', function (data) {
					res.send(data);
				});
			}
			else if(req.body.screenViewObject.appType == "DesktopJava"){
				var applicationPath = req.body.screenViewObject.applicationPath;
				var data = "LAUNCH_OEBS";
				mySocket._events.scrape = [];               						
				// mySocket.send(data);
				mySocket.emit("LAUNCH_OEBS", applicationPath);
				mySocket.on('scrape', function (data) {
					res.send(data);
				});
			}
			else if(req.body.screenViewObject.appType == "MobileApp"){
				var apkPath = req.body.screenViewObject.apkPath;
				var serial = req.body.screenViewObject.mobileSerial;
				var mobileDeviceName = req.body.screenViewObject.mobileDeviceName;
				var mobileIosVersion = req.body.screenViewObject.mobileIosVersion;
				var mobileUDID = req.body.screenViewObject.mobileUDID;
				var data = "LAUNCH_MOBILE";
				mySocket._events.scrape = [];                                                                                                  
				mySocket.emit("LAUNCH_MOBILE", apkPath,serial,mobileDeviceName,mobileIosVersion,mobileUDID);
				mySocket.on('scrape', function (data) {
								res.send(data);
				});
			}
			else if(req.body.screenViewObject.appType == "MobileWeb"){
				//console.log(req.body.screenViewObject)
				var mobileSerial = req.body.screenViewObject.mobileSerial;
				var androidVersion = req.body.screenViewObject.androidVersion;
				var data = "LAUNCH_MOBILE_WEB";
				mySocket._events.scrape = [];                                                                                                  
				mySocket.emit("LAUNCH_MOBILE_WEB", mobileSerial, androidVersion);
				mySocket.on('scrape', function (data) {
								res.send(data);
				});
			}
			else{	
			var data = {};
				var browserType = req.body.screenViewObject.browserType;
				if(req.body.screenViewObject.action == 'compare')
				{
				
					data.viewString = req.body.screenViewObject.viewString.view;
					data.action = req.body.screenViewObject.action; 
					if (browserType == "chrome") {
						data.task = "OPEN BROWSER CH";
					}
						else if (browserType == "ie") {
						data.task = "OPEN BROWSER IE";
					}
					else if (browserType == "mozilla") {
						data.task = "OPEN BROWSER FX";
					}
				
				}
				else{
					data.action = "scrape";
						if (browserType == "chrome") {	
						data.task = "OPEN BROWSER CH";
						//var data = "OPEN BROWSER CH";
					}
					else if (browserType == "ie") {
						data.task = "OPEN BROWSER IE";
						//var data =  "OPEN BROWSER IE";
					}
					else if (browserType == "mozilla") {
						data.task =  "OPEN BROWSER FX";
						//var data =   "OPEN BROWSER FX";
					}
				}
				mySocket._events.scrape = [];               						
				mySocket.emit("webscrape",data);
				mySocket.on('scrape', function (data) {
					res.send(data);
				});
			}
		}else{
			console.log("Socket not Available");
			try{
				res.send("unavailableLocalServer");
			}catch(exception){
				console.log(exception);
			}
		}
	}
	else{
		res.send("Invalid Session");
	}
}catch(exception){
		console.log(exception);
		res.send("unavailableLocalServer");
	}
};

/**
 * @author vinay.niranjan
 * @modified author vinay.niranjan
 * the service is used to highlight scraped Objects into the browser
 */
 exports.highlightScrapElement_ICE = function(req, res) {
	try{
		  if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
	 	var focusParam = req.body.elementXpath;
		var elementURL = req.body.elementUrl;
		var appType = req.body.appType;
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		console.log("IP:",ip);
		var name = req.session.username;
		console.log(Object.keys(myserver.allSocketsMap),"<<all people, asking person:",name);
		var mySocket = myserver.allSocketsMap[name];
		mySocket.emit("focus", focusParam , elementURL, appType);
		var flag = 'success';
		res.send(flag);
	}
	else{
		res.send("Invalid Session");
	}
}catch(exception){
		console.log(exception);
	}
};

/**
 * @author vinay.niranjan
 * @modified author vishvas.a
 * the service is used to fetch the  screen data based on the screenid and *projectid
 */
exports.getScrapeDataScreenLevel_ICE = function(req, res){
	try{
		 if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var flag = "";
		// var getScrapeDataQuery = "select screenid,screenname,screendata from screens where "+
		// 		" screenid ="+ req.body.screenId + 
		// 		" and projectid="+req.body.projectId+
		// 		" allow filtering ;";
			var inputs = {"screenid":req.body.screenId,"projectid":req.body.projectId,"query":"getscrapedata" }
			// fetchScrapedData(getScrapeDataQuery,function(getScrapeDataQueryerror,getScrapeDataQueryresponse){
				fetchScrapedData(inputs,function(getScrapeDataQueryerror,getScrapeDataQueryresponse){
					try{
						res.send(getScrapeDataQueryresponse);
					}catch(exception){
						console.log(exception);
					}
			});
	}
		else{
			res.send("Invalid Session");
		}
	}
	catch(exception){
		console.log(exception);
	}
};

/**
 * generic function for DB call to fetch the screendata
 * @author vishvas.a
 */
// function fetchScrapedData(scrapeQuery,fetchScrapedDatacallback){
	function fetchScrapedData(inputs,fetchScrapedDatacallback){
	try{
		var responsedata;
		var flag;
		// dbConn.execute(scrapeQuery, function(getScrapeDataQueryerr, getScrapeDataQueryresult){
		var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
		client.post(epurl+"design/getScrapeDataScreenLevel_ICE",args,
			function (getScrapeDataQueryresult, response) {
				
			try{
				if(response.statusCode != 200 || getScrapeDataQueryresult.rows == "fail"){
				// if (getScrapeDataQueryerr) {
					//console.log("scrape data error: Fail",getScrapeDataQueryerr);
					flag="getScrapeData Fail.";
					fetchScrapedDatacallback(flag,null);
				}else{
					for (var i = 0; i < getScrapeDataQueryresult.rows.length; i++) {
						responsedata = getScrapeDataQueryresult.rows[i].screendata;
					}
					fetchScrapedDatacallback(null,responsedata);
				}
			}catch(exception){
				console.log(exception);
			}
		});
	}catch(exception){
		console.log(exception);
	}
};


/**
* @author vinay.niranjan
* @modified author vishvas.a
* service updates the screen data in screens table
* on user action of NEW SAVING/EDIT/UPDATE/DELETE/Mapping of Objects/Compare and Update in Design screen. 
*/
exports.updateScreen_ICE = function(req, res){
	try{	
		/*
		 * internal variables 
		 */
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var projectID, screenID, screenName,getScrapeData,scrapedObjects, modifiedBy, userInfo,appType, requestedversionnumber ,param;
		var updateData = req.body.scrapeObject; 
		projectID   = updateData.projectId;
		screenID   = updateData.screenId;
		screenName = updateData.screenName;
		userInfo   = updateData.userinfo;
		modifiedBy = userInfo.username.toLowerCase();
		param      = updateData.param;
		appType    = updateData.appType;
		//xpaths required to be mapped(used only when param is mapScrapeData_ICE)
		var requiredXpathList=[];	
		//urls required to be mapped(used only when param is mapScrapeData_ICE)
		var requiredURLList=[];
		scrapedObjects={};
		// scrapedObjects = updateData.getScrapeData;
		//these value has to be modified later
		// var requestedskucodeScreens = req.body.skucodetestcase;
		var requestedskucodeScreens = "skucode";
		//var requestedtags = req.body.tags;
		var requestedtags = "tags";
		// var requestedversionnumber = req.body.versionnumber;
		var requestedversionnumber = 1;
		// var requestscreenhistorydetails = "'updated screens action by " + userInfo.username + " having role:" + userInfo.role + "" +
		// 				" skucode=" + requestedskucodeScreens + ", tags=" + requestedtags + ", versionnumber=" + requestedversionnumber+
		// 				" with the service action="+param+" '";
		// var dateScreen = new Date().getTime();
		// var requestedScreenhistory =  dateScreen + ":" + requestscreenhistorydetails;
		var requestedScreenhistory;
		var requesthistorydetails;
		var createScreenHistoryQuery;
		var updateScreenQuery="";
		var inputs={};
		var inputstestcase={};
		var statusFlag = "";
		if(param == "updateScrapeData_ICE"){	
			try{
				scrapedObjects = updateData.getScrapeData;
				// single quote is replaced with double single quote for scraped data.
				var parsedScrapedObj=JSON.parse(scrapedObjects);
				if(appType.toUpperCase() === 'WEBSERVICE'){
					if('body' in parsedScrapedObj){
						parsedScrapedObj.body[0]=parsedScrapedObj.body[0].replace(/'+/g,"\"");
						scrapedObjects=parsedScrapedObj;
					}
				}
				scrapedObjects = JSON.stringify(scrapedObjects);
				scrapedObjects = scrapedObjects.replace(/'+/g,"''");
				var newParse;
				if(scrapedObjects !=null && scrapedObjects !='' && scrapedObjects != undefined){
					newParse = JSON.parse(scrapedObjects);
				}else{
					newParse=JSON.parse("{}");
				}
					
				scrapedObjects=newParse;
				if(appType.toUpperCase() === 'WEBSERVICE'){
					try{
						//scrapedObjects=JSON.parse(newParse);
						var viewArray=[];
						if('method' in scrapedObjects &&
							'header' in scrapedObjects && 
							'body' in scrapedObjects){
							if(scrapedObjects.method == 'POST'){
								var requestedBody=scrapedObjects.body[0];
								var requestedHeader=scrapedObjects.header[0];
								if(requestedBody != null &&
								   requestedBody != '' &&
								   requestedHeader.indexOf('json') === -1){
									   if(requestedBody.indexOf('Envelope') !== -1){
										var obj = parse(requestedBody);
										if ('root' in obj){
											baseRequestBody=obj.root;
											allXpaths=[];
											allCustnames=[];
											try{
												parseRequest(baseRequestBody);
											}catch(exception){
												console.log(exception);
											}
											for(var populationindex=0;populationindex<allXpaths.length;populationindex++){
												var scrapedObjectsWS={};
												scrapedObjectsWS.xpath=allXpaths[populationindex];
												scrapedObjectsWS.custname=allCustnames[populationindex];
												scrapedObjectsWS.url="";
												scrapedObjectsWS.text="";
												scrapedObjectsWS.hiddentag="";
												scrapedObjectsWS.tag="elementWS";
												scrapedObjectsWS.id="";
												viewArray.push(scrapedObjectsWS);
											}
											var baseData={};
											baseData.endPointURL=scrapedObjects.endPointURL;
											baseData.method=scrapedObjects.method;
											baseData.header=scrapedObjects.header;
											baseData.operations=scrapedObjects.operations;
											baseData.body=scrapedObjects.body;
											baseData.responseHeader=scrapedObjects.responseHeader;
											baseData.responseBody=scrapedObjects.responseBody;
											baseData.view=viewArray;
											scrapedObjects=baseData;
											scrapedObjects=JSON.stringify(scrapedObjects);
											scrapedObjects = scrapedObjects.replace(/'+/g,"''");
											var requestscreenhistorydetails = "'updated screens action by " + userInfo.username.toLowerCase() + " having role:" + userInfo.role + "" +
															" skucode=" + requestedskucodeScreens + ", tags=" + requestedtags + ", versionnumber=" + requestedversionnumber+
															"  screendata=" + scrapedObjects+
															"with the service action="+param+" '";
											var dateScreen = new Date().getTime();
											requestedScreenhistory =  dateScreen + ":" + requestscreenhistorydetails;
											createScreenHistoryQuery = "update screens set history= history + { "+requestedScreenhistory+" }" +
												" where screenid = "+screenID+" and projectid ="+projectID+ //" and screenname ='" + screenName +
												" and versionnumber = "+requestedversionnumber+" ";	
											updateScreenQuery = "update icetestautomation.screens set"+
												" screendata ='"+ scrapedObjects +"',"+
												" modifiedby ='" + modifiedBy + "',"+
												" modifiedon = '" + new Date().getTime()+
												"', skucodescreen ='" + requestedskucodeScreens +
												"' , history= history + { "+requestedScreenhistory+" }" +
												" where screenid = "+screenID+
												" and projectid ="+projectID+
												" and screenname ='" + screenName +
												"' and versionnumber = "+requestedversionnumber+
												" IF EXISTS; ";	
												inputs={"query":"updatescreen","scrapedata":scrapedObjects,"modifiedby":modifiedBy,"skucodescreen":requestedskucodeScreens,
												"screenid":screenID,"projectid":projectID,"screenname":screenName,"versionnumber":requestedversionnumber};
											finalFunction(scrapedObjects);	
										}else{
											//JSON with view string empty
											updateScreenQuery=buildObject(scrapedObjects,modifiedBy,requestedskucodeScreens,requestedScreenhistory,screenID,projectID,screenName,requestedversionnumber);
											inputs=inputsWS
											finalFunction(scrapedObjects);
										}
									}else{
										//JSON with view string empty
										updateScreenQuery=buildObject(scrapedObjects,modifiedBy,requestedskucodeScreens,requestedScreenhistory,screenID,projectID,screenName,requestedversionnumber);
										inputs=inputsWS
										finalFunction(scrapedObjects);
									}
								}else{
									//JSON with view string empty
									updateScreenQuery=buildObject(scrapedObjects,modifiedBy,requestedskucodeScreens,requestedScreenhistory,screenID,projectID,screenName,requestedversionnumber);
									inputs=inputsWS
									finalFunction(scrapedObjects);
								}
							}else{
								//JSON with view string empty
								updateScreenQuery=buildObject(scrapedObjects,modifiedBy,requestedskucodeScreens,requestedScreenhistory,screenID,projectID,screenName,requestedversionnumber);
								inputs=inputsWS
								finalFunction(scrapedObjects);
							}
						}else{
							//JSON with view string empty
							updateScreenQuery=buildObject(scrapedObjects,modifiedBy,requestedskucodeScreens,requestedScreenhistory,screenID,projectID,screenName,requestedversionnumber);
							inputs=inputsWS
							finalFunction(scrapedObjects);
						}
					}catch(exception){
						console.log(exception);
					}
				}else{
								var requestscreenhistorydetails = "'updated screens action by " + userInfo.username.toLowerCase() + " having role:" + userInfo.role + "" +
							" skucode=" + requestedskucodeScreens + ", tags=" + requestedtags + ", versionnumber=" + requestedversionnumber+
							"  screendata=" + scrapedObjects+
							"with the service action="+param+" '";
											var dateScreen = new Date().getTime();
											requestedScreenhistory =  dateScreen + ":" + requestscreenhistorydetails;
											createScreenHistoryQuery = "update screens set history= history + { "+requestedScreenhistory+" }" +
												" where screenid = "+screenID+" and projectid ="+projectID+ //" and screenname ='" + screenName +
												" and versionnumber = "+requestedversionnumber+" ";	
					updateScreenQuery = "update icetestautomation.screens set"+
										" screendata ='"+ scrapedObjects +"',"+
										" modifiedby ='" + modifiedBy + "',"+
										" modifiedon = '" + new Date().getTime()+
										"', skucodescreen ='" + requestedskucodeScreens +
										"' , history= history + { "+requestedScreenhistory+" }" +
										" where screenid = "+screenID+
										" and projectid ="+projectID+
										" and screenname ='" + screenName +
										"' and versionnumber = "+requestedversionnumber+
										" IF EXISTS; ";	
						inputs={"scrapedata":scrapedObjects,"modifiedby":modifiedBy,"skucodescreen":requestedskucodeScreens,
						"screenid":screenID,"projectid":projectID,"screenname":screenName,"versionnumber":requestedversionnumber};
										finalFunction(scrapedObjects);						
				// console.log(updateScreenQuery);
				}
			}catch(exception){
				console.log(exception);
			}
		}else if(param == "editScrapeData_ICE"){
			try{
				/*
				* @author vishvas.a
				* editing of the scraped data
				* based on the changed custom names
				* data used : old custom names, new custom names and xpath. 
				*/
				var oldCustNamesList = updateData.editedList.oldCustName; 
				for(i=0;i<oldCustNamesList.length;i++)
				{
					oldCustNamesList[i] = oldCustNamesList[i].replace(/&amp;/g, '&');
				} 
				var newCustNamesList = updateData.editedList.modifiedCustNames;
				var xpathListofCustName = updateData.editedList.xpathListofCustNames;
				var elementschanged = 0;
				async.series([
					function(editcallback){
						try{
							// var scrapedDataQuery="select screendata from screens where screenid="+screenID+
							// 	" and projectid="+projectID+
							// 	" and screenname = '"+screenName+
							// 	"' and versionnumber = "+requestedversionnumber+
							// 	" allow filtering ;";
							inputs = {"query": "getscrapedata", "screenid":screenID,"projectid":projectID};
							fetchScrapedData(inputs,function(err,scrapedobjects,querycallback){
								try{
									// console.log(err,scrapedobjects,);
									if(scrapedobjects == null && scrapedobjects == '' && scrapedobjects == undefined){
										scrapedobjects=JSON.parse("{}");
									}
									if(scrapedobjects.length>0){
										//this viewString is an array of scraped objects
										var viewString;
										scrapedobjects=JSON.parse(scrapedobjects);
										if('view' in scrapedobjects){
											viewString = scrapedobjects.view;
										}else{
											viewString=[];
											scrapedobjects.mirror='';
											scrapedobjects.scrapedin='';
											scrapedobjects.scrapetype='';
										}
										if(viewString.length > 0){
											for(var elementsindex=0;elementsindex<xpathListofCustName.length;elementsindex++){
													for(var scrapedobjectindex=0;scrapedobjectindex<viewString.length;scrapedobjectindex++){
														if(elementschanged<newCustNamesList.length){
														if((viewString[scrapedobjectindex].xpath.replace(/\s/g,' ').replace('&nbsp;',' ') == xpathListofCustName[elementsindex].replace(/\s/g,' ').replace('&nbsp;',' ')) 
															&& (viewString[scrapedobjectindex].custname.replace(/\s/g,' ').replace('&nbsp;',' ').trim() == oldCustNamesList[elementsindex].replace(/\s/g,' ').replace('&nbsp;',' ').trim())){
																viewString[scrapedobjectindex].custname=newCustNamesList[elementsindex];
																//elementschanged increments only when edit has occured
																elementschanged=elementschanged+1;
														} 
													}
												}
											}
										}
										scrapedObjects.view=viewString;
										scrapedObjects.mirror=scrapedobjects.mirror;
										scrapedObjects.scrapedin=scrapedobjects.scrapedin;
										scrapedObjects.scrapetype=scrapedobjects.scrapetype;
										//the query here will be called only if ALL objects are identified.
										if(elementschanged <= newCustNamesList.length){
											scrapedObjects=JSON.stringify(scrapedObjects);
											scrapedObjects = scrapedObjects.replace(/'+/g,"''");
																						var requestscreenhistorydetails = "'updated screens action by " + userInfo.username.toLowerCase() + " having role:" + userInfo.role + "" +
															" skucode=" + requestedskucodeScreens + ", tags=" + requestedtags + ", versionnumber=" + requestedversionnumber+
															"  screendata=" + scrapedObjects+
															"with the service action="+param+" '";
											var dateScreen = new Date().getTime();
											 requestedScreenhistory =  dateScreen + ":" + requestscreenhistorydetails;
											 createScreenHistoryQuery = "update screens set history= history + { "+requestedScreenhistory+" }" +
												" where screenid = "+screenID+" and projectid ="+projectID+ //" and screenname ='" + screenName +
												" and versionnumber = "+requestedversionnumber+" ";	
											// updateScreenQuery = "update icetestautomation.screens set"+
											// 					" screendata ='"+ scrapedObjects +"',"+
											// 					" modifiedby ='" + modifiedBy + "',"+
											// 					" modifiedon = '" + new Date().getTime()+ "'"+
											// 					" , skucodescreen ='" + requestedskucodeScreens +
											// 					"' , history= history + { "+requestedScreenhistory+" }" +
											// 					" where screenid = "+screenID+
											// 					" and projectid ="+projectID+
											// 					" and screenname ='" + screenName +
											// 					"' and versionnumber = "+requestedversionnumber+
											// 					" IF EXISTS; "
											inputs={"scrapedata":scrapedObjects,"modifiedby":modifiedBy,"skucodescreen":requestedskucodeScreens,
											"screenid":screenID,"projectid":projectID,"screenname":screenName,"versionnumber":requestedversionnumber};
											finalFunction(scrapedObjects);
										}else{
											statusFlag="All objects are not edited.";
											try{
												res.send(statusFlag);
											}catch(exception){
												console.log(exception);
											}
										}
									}else{
										statusFlag="Error occured in updateScreenData : Fail";
										try{
											res.send(statusFlag);
										}catch(exception){
											console.log(exception);
										}
									}
								}catch(exception){
									console.log(exception);
								}
							});
							editcallback;
						}catch(exception){
							console.log(exception);
						}
					}
				]);
			}catch(exception){
				console.log(exception);
			}
		}else if(param == "deleteScrapeData_ICE"){
			try{
				/*
				* @author vishvas.a
				* deleting of the scraped data
				* based on the custom names and xpath. 
				*/
				var deleteCustNames, deleteXpathNames;
				deleteCustNames = updateData.deletedList.deletedCustName;
				deleteXpathNames = updateData.deletedList.deletedXpath;
				var elementschanged = 0;
				var deleteAll=false;
				// var viewString = updateData.getScrapeData.view;
				var deleteindex=[];
				async.series([
					function(deletecallback){
						try{
							// var scrapedDataQuery="select screendata from screens where screenid="+screenID
							// 	" and projectid="+projectID+
							// 	" allow filtering ;";
							inputs = {"query": "getscrapedata", "screenid":screenID,"projectid":projectID};
							fetchScrapedData(inputs,function(err,scrapedobjects,querycallback){
								try{
									//console.log(err,scrapedobjects,querycallback);
									if(scrapedobjects == null && scrapedobjects == '' && scrapedobjects == undefined){
										scrapedobjects='{}';
									}
									if(scrapedobjects.length>0){
										var viewString;
										scrapedobjects=JSON.parse(scrapedobjects);
										if('view' in scrapedobjects){
											viewString = scrapedobjects.view;
										}else{
											viewString=[];
											scrapedobjects.mirror='';
											scrapedobjects.scrapedin='';
											scrapedobjects.scrapetype='';
										}
										if(viewString.length == deleteXpathNames.length){
											deleteAll=true;
											viewString=[];
											scrapedobjects.mirror='';
										}
										if(!deleteAll){
											for(var elementsindex=0;elementsindex<deleteXpathNames.length;elementsindex++){
												for(var scrapedobjectindex=0;scrapedobjectindex<viewString.length;scrapedobjectindex++){
													//console.log(scrapedobjectindex,"---",viewString[scrapedobjectindex].custname,"====",deleteCustNames[elementsindex]);
													if((viewString[scrapedobjectindex].xpath.replace(/\s/g,' ').replace('&nbsp;',' ') == deleteXpathNames[elementsindex].replace(/\s/g,' ').replace('&nbsp;',' ')) 
															&& (viewString[scrapedobjectindex].custname.replace(/\s/g,' ').replace('&nbsp;',' ').trim() == deleteCustNames[elementsindex].replace(/\s/g,' ').replace('&nbsp;',' ').trim())){
														if(elementschanged<deleteCustNames.length){
															//console.log(viewString[scrapedobjectindex].custname);
															if(deleteindex.indexOf(scrapedobjectindex) === -1){
																deleteindex.push(scrapedobjectindex);
																elementschanged=elementschanged+1;
															}
														}
													}
												}
											}
											deleteindex=deleteindex.sort(sortNumber);
											//console.log("dummyObjectsToDelete:::",deleteindex.join());
											for(var deletingelementindex=0;deletingelementindex<deleteindex.length;deletingelementindex++){
												delete viewString[deleteindex[deletingelementindex]];
											}
											//delete is not recommended as the index stays empty after using delete on array.
											//hence performing the below action
											//removing null values from the array JSON
											viewString =  viewString.filter(function(n){ return n != null });
										}
										scrapedObjects.view=viewString;
										scrapedObjects.mirror=scrapedobjects.mirror;
										scrapedObjects.scrapedin=scrapedobjects.scrapedin;
										scrapedObjects.scrapetype=scrapedobjects.scrapetype;
										//this query will be called only if ALL objects are identified.
										if(elementschanged<=deleteXpathNames.length){
											scrapedObjects=JSON.stringify(scrapedObjects);
											scrapedObjects = scrapedObjects.replace(/'+/g,"''");
																					var requestscreenhistorydetails = "'updated screens action by " + userInfo.username.toLowerCase() + " having role:" + userInfo.role + "" +
															" skucode=" + requestedskucodeScreens + ", tags=" + requestedtags + ", versionnumber=" + requestedversionnumber+
															"  screendata=" + scrapedObjects+
															"with the service action="+param+" '";
											var dateScreen = new Date().getTime();
											 requestedScreenhistory =  dateScreen + ":" + requestscreenhistorydetails;
											 createScreenHistoryQuery = "update screens set history= history + { "+requestedScreenhistory+" }" +
												" where screenid = "+screenID+" and projectid ="+projectID+ //" and screenname ='" + screenName +
												" and versionnumber = "+requestedversionnumber+" ";	
											updateScreenQuery = "update icetestautomation.screens set"+
																" screendata ='"+ scrapedObjects +"',"+
																" modifiedby ='" + modifiedBy + "',"+
																" modifiedon = '" + new Date().getTime()+ "'"+
																" , skucodescreen ='" + requestedskucodeScreens +
																"' , history= history + { "+requestedScreenhistory+" }" +
																" where screenid = "+screenID+
																" and projectid ="+projectID+
																" and screenname ='" + screenName +
																"' and versionnumber = "+requestedversionnumber+
																" IF EXISTS; "
											inputs={"scrapedata":scrapedObjects,"modifiedby":modifiedBy,"skucodescreen":requestedskucodeScreens,
											"screenid":screenID,"projectid":projectID,"screenname":screenName,"versionnumber":requestedversionnumber};
											//console.log(updateScreenQuery);
				
											finalFunction(scrapedObjects);	
										}else{
											statusFlag="All objects are not edited.";
											try{
												res.send(statusFlag);
											}catch(exception){
												console.log(exception);
											}
										}
									}else{
										statusFlag="Error occured in updateScreenData : Fail";
										try{
											res.send(statusFlag);
										}catch(exception){
											console.log(exception);
										}
									}
								}catch(exception){
									console.log(exception);
								}
							});
							deletecallback;
						}catch(exception){
							console.log(exception);
						}
					}
				]);
			}catch(exception){
				console.log(exception);
			}
		}else if(param == "mapScrapeData_ICE"){
			/*
			* @author vishvas.a
			* mapping of scraped/new objects
			* based on the scraped data from AUT
			* data used : new Custom names,old custom names,old xpaths,new Xpaths(newly mapped elements)
			*/
			var tagMatch = "";
			//list of custom names of objects scraped and asked to map
			var uiElementsCustnameList=[];
			//tag names of objects scraped(available in DB) 
			var dbElementsTagList=[];
			//mapped custom names(has no xpath)
			var uiUserProvidedNamesList=[];
			//index of objects added
			var addedObjectIndexes=[];
			//list of base elements supported in Ninteen68(ICE)
			var baseElementsList=["a","radiobutton","checkbox","input","list","select","table","button","img"];
			//location of each element to be deleted from scraped list
			var addedObjectIndexes = [];
			async.series({
				function(mappingCallback){
					try{
						// var scrapedDataQuery="select screendata from screens where screenid="+screenID+
						// 			" and projectid="+projectID+
						// 			" and screenname = '"+screenName+
						// 			"' and versionnumber = "+requestedversionnumber+
						// 			" allow filtering ;";
						inputs = {"query": "getscrapedata", "screenid":screenID,"projectid":projectID};
						fetchScrapedData(inputs,function(err,scrapedobjects,querycallback){
							try{
								if(scrapedobjects == null && scrapedobjects == '' && scrapedobjects == undefined){
									scrapedobjects=JSON.parse("{}");
								}
								var viewString;
								if(scrapedobjects.length>0){
									scrapedobjects=JSON.parse(scrapedobjects);
									if('view' in scrapedobjects){
										viewString = scrapedobjects.view;
										if(viewString.length > 0){
											uiUserProvidedNamesList=updateData.editedListoldCustName;
											uiElementsCustnameList=updateData.editedListmodifiedCustNames;
											//fetching tag names 
											//console.log("Cust Names with no Xpath :",uiUserProvidedNamesList);
											//console.log("Scraped Cust Names:",uiElementsCustnameList);
											async.forEachSeries(uiUserProvidedNamesList,function(addedObjectCustName,addedObjectCustNameCallback){
													async.forEachSeries(viewString,function(eachScrapedObject,scrapedObjectCallback){
													try{
														if('custname' in eachScrapedObject){
															var elementCustnameDB=eachScrapedObject.custname;
															if(elementCustnameDB.replace(/\s/g,' ').replace('&nbsp;',' ').trim() == addedObjectCustName.replace(/\s/g,' ').replace('&nbsp;',' ').trim()){
																if('tag' in eachScrapedObject){
																	dbElementsTagList.push(eachScrapedObject.tag);
																}
															}
														}
														scrapedObjectCallback();
													}catch(exception){
														console.log(exception);
													}		
												},addedObjectCustNameCallback);
											});
											/*
											* fetching the appropriate xpath of the actual elements.
											* to change the custom name
											*/
											//console.log("dbElementsTagList:::",dbElementsTagList.join());
											var indexOfUiElement=-1;			
											async.forEachSeries(uiElementsCustnameList,function(userCustName,userCustNameCallback){
												indexOfUiElement=indexOfUiElement+1;
												async.forEachSeries(viewString,function(eachScrapedObject,scrapedObjectCallback){
													try{
														if('custname' in eachScrapedObject){
															var elementCustnameDB=eachScrapedObject.custname;
															if(elementCustnameDB.replace(/\s/g,' ').replace('&nbsp;',' ').trim() == userCustName.replace(/\s/g,' ').replace('&nbsp;',' ').trim()){
																if('tag' in eachScrapedObject){
																	var dbTagName=eachScrapedObject.tag;
																	/*
																	* checks the tag name, if matches take the xpath
																	* if does not match then checks if the dbElementsTagList
																	* at the index is 'element'. if 'element' then without any 
																	* check, match the object.  
																	*/
																	if(dbTagName.toLowerCase() == dbElementsTagList[indexOfUiElement]){
																		if('xpath' in eachScrapedObject){
																			requiredXpathList.push(eachScrapedObject.xpath.replace(/\s/g,' ').replace('&nbsp;',' ').trim());
																		}
																	}else if(dbElementsTagList[indexOfUiElement].toLowerCase() == 'element'
																	&& baseElementsList.indexOf(dbTagName.toLowerCase()) === -1){
																		if('xpath' in eachScrapedObject){
																			requiredXpathList.push(eachScrapedObject.xpath.replace(/\s/g,' ').replace('&nbsp;',' ').trim());
																		}
																	}
																	if('url' in eachScrapedObject){
																			requiredURLList.push(eachScrapedObject.url.replace(/\s/g,' ').replace('&nbsp;',' ').trim())
																	}
																}
															}
														}
														scrapedObjectCallback();
													}catch(exception){
														console.log(exception);
													}	
												},userCustNameCallback);
											});
											//console.log("requiredXpathList:::",requiredXpathList.join());
											//console.log("requiredURLList:::",requiredURLList.join());
											/*
											* the method call below checks if 
											* multiple elements with same xpath are found for mapped elements.
											* if found true mapping of objects is stopped 
											* and user is alerted with an appropriate error message.
											*/
											var multipleObjectsCustnameSet=[];
											async.forEachSeries(requiredXpathList,function(eachXpath,requiredXpathListCallback){
												try{
													var custname=repeatedXpath(viewString,eachXpath);
													if(custname != ""){
														//maintaining the uniqueness of the multipleObjectsCustnameSet
														if(multipleObjectsCustnameSet.indexOf(custname) === -1){
															multipleObjectsCustnameSet.push(custname.replace(/\s/g,' ').replace('&nbsp;',' ').trim());
														}
														tagMatch="sAmEoBjEcTrEpeAtEd";
													}
													requiredXpathListCallback();
												}catch(exception){
													console.log(exception);
												}	
											});
											//console.log("multipleObjectsCustnameSet:::",multipleObjectsCustnameSet.join());
											if(tagMatch != "sAmEoBjEcTrEpeAtEd"){
												/*
												*if the size of xpath list is same as user provided custom names list
												* replacing the custom names of actual elements with xpath with 
												* the user provided custom names   
												*/
												if(requiredXpathList.length == uiUserProvidedNamesList.length){
													var xpathindex=-1;
													async.forEachSeries(requiredXpathList,function(eachXpath,requiredXpathListCallback){
														try{
															xpathindex=xpathindex+1;
															var objectindex=-1;
															async.forEachSeries(viewString,function(eachScrapedObject,scrapedObjectCallback){
																try{
																	objectindex=objectindex+1;
																	if('xpath' in eachScrapedObject){
																		var scrapedXpath=eachScrapedObject.xpath.replace(/\s/g,' ').replace('&nbsp;',' ').trim();
																		if(eachXpath.replace(/\s/g,' ').replace('&nbsp;',' ').trim() == scrapedXpath.replace(/\s/g,' ').replace('&nbsp;',' ').trim()){
																			eachScrapedObject.custname=uiUserProvidedNamesList[xpathindex];
																			addedObjectIndexes.push(objectindex);
																		}
																	}
																	scrapedObjectCallback();
																}catch(exception){
																console.log(exception);
															}	
															},requiredXpathListCallback);
														}catch(exception){
															console.log(exception);
														}
													});
												}else{
													tagMatch="TagMissMatch";
													//console.log("Response sent to the front end:",tagMatch);
													res.send(tagMatch);
												}
												//console.log("addedObjectIndexes:::",addedObjectIndexes.join());
												/*
												* if the tagMatch status is empty, ie., if its not TagMissMatch
												* then remove the dummy objects
												*/
												if(tagMatch == ""){
													var dummyObjectsToDelete=[];
													async.forEachSeries(uiUserProvidedNamesList,function(addedObjectCustName,addedObjectCustNameCallback){
														var objectindexes=-1;
														async.forEachSeries(viewString,function(eachScrapedObject,scrapedObjectCallback){
															try{
																objectindexes=objectindexes+1;
																if(addedObjectIndexes.indexOf(objectindexes) === -1){
																	if((!('xpath' in eachScrapedObject) ||(eachScrapedObject.xpath.trim() == "")) &&
																	('custname' in eachScrapedObject && 
																	uiUserProvidedNamesList.indexOf(eachScrapedObject.custname) !== -1
																	)){
																		if(dummyObjectsToDelete.indexOf(objectindexes) === -1){
																			dummyObjectsToDelete.push(objectindexes);
																		}
																	}
																}
															}catch(exception){
																console.log(exception);
															}	
															scrapedObjectCallback();	
														},addedObjectCustNameCallback);
													});
													dummyObjectsToDelete=dummyObjectsToDelete.sort(sortNumber);
													//console.log("dummyObjectsToDelete:::",dummyObjectsToDelete.join());
													for(var deleteelementindex=0;deleteelementindex<dummyObjectsToDelete.length;deleteelementindex++){
														delete viewString[dummyObjectsToDelete[deleteelementindex]];
													}
													//delete is not recommended as the index stays empty after using delete on array.
													//hence performing the below action
													//removing null values from the array JSON
													viewString =  viewString.filter(function(n){ return n != null });

													scrapedObjects.view=viewString;
													scrapedObjects.mirror=scrapedobjects.mirror;
													scrapedObjects.scrapedin=scrapedobjects.scrapedin;
													scrapedObjects.scrapetype=scrapedobjects.scrapetype;
													scrapedObjects=JSON.stringify(scrapedObjects);
													scrapedObjects = scrapedObjects.replace(/'+/g,"''");
																								var requestscreenhistorydetails = "'updated screens action by " + userInfo.username.toLowerCase() + " having role:" + userInfo.role + "" +
															" skucode=" + requestedskucodeScreens + ", tags=" + requestedtags + ", versionnumber=" + requestedversionnumber+
															"  screendata=" + scrapedObjects+
															"with the service action="+param+" '";
														var dateScreen = new Date().getTime();
														 requestedScreenhistory =  dateScreen + ":" + requestscreenhistorydetails;
														 createScreenHistoryQuery = "update screens set history= history + { "+requestedScreenhistory+" }" +
												" where screenid = "+screenID+" and projectid ="+projectID+ //" and screenname ='" + screenName +
												" and versionnumber = "+requestedversionnumber+" ";	
													updateScreenQuery = "update icetestautomation.screens set"+
																" screendata ='"+ scrapedObjects +"',"+
																" modifiedby ='" + modifiedBy + "',"+
																" modifiedon = '" + new Date().getTime()+ "'"+
																" , skucodescreen ='" + requestedskucodeScreens +
																"' , history= history + { "+requestedScreenhistory+" }" +
																" where screenid = "+screenID+
																" and projectid ="+projectID+
																" and screenname ='" + screenName +
																"' and versionnumber = "+requestedversionnumber+
																" IF EXISTS; "
													inputs={"scrapedata":scrapedObjects,"modifiedby":modifiedBy,"skucodescreen":requestedskucodeScreens,
													"screenid":screenID,"projectid":projectID,"screenname":screenName,"versionnumber":requestedversionnumber};
													//console.log(updateScreenQuery);
													finalFunction(scrapedObjects);	
												}
													
											}else{
												//console.log("These are the repeated objects:",multipleObjectsCustnameSet);
												tagMatch=tagMatch+"maPinGScraPedDaTa"+multipleObjectsCustnameSet.join();
												res.send(tagMatch);
											}
										}
									}else{
										statusFlag="Error occured in mapScreenData : Fail";
										try{
											res.send(statusFlag);
										}catch(exception){
											console.log(exception);
										}	
									}
								}else{
									statusFlag="Error occured in updateScreenData : Fail";
									try{
										res.send(statusFlag);
									}catch(exception){
										console.log(exception);
									}
								}
							}catch(exception){
						 		console.log(exception);
							}
						});
					}catch(exception){
						 console.log(exception);
					}
				}
			});
		}
	else if(param == 'updateComparedObjects')
		{
			//Update changed objects
			try{
				var elementschanged = 0;
				var updatedIndex = [];
				async.series([
					function(comparecallback){
						try{
							// var scrapedDataQuery="select screendata from screens where screenid="+screenID
							// 	" and projectid="+projectID+
							// 	" allow filtering ;";
						inputs = {"query": "getscrapedata", "screenid":screenID,"projectid":projectID};
						fetchScrapedData(inputs,function(err,scrapedobjects,querycallback){
							 try{
								
								  if(scrapedobjects == null && scrapedobjects == '' && scrapedobjects == undefined){
										scrapedobjects='{}';
									}
									if(scrapedobjects.length>0){
										var viewString;
										scrapedobjects=JSON.parse(scrapedobjects);
										if('view' in scrapedobjects){
											viewString = scrapedobjects.view;
										}else{
											viewString=[];
											scrapedobjects.mirror='';
											scrapedobjects.scrapedin='';
											scrapedobjects.scrapetype='';
										}
										console.log("DBSCRAPEOBJECTS",scrapedobjects);
										console.log("updateData",updateData);
										var updatedViewString = updateData.updatedViewString.view[0].changedobject;
										for(var i=0;i<updatedViewString.length;i++){
											for(var j=0;j<viewString.length;j++)
											{
												var updatedXpath = updatedViewString[i].xpath.replace(/\s/g,' ').replace('&nbsp;',' ');
												updatedXpath = updatedViewString[i].xpath.split(";"); 
												updatedXpath = updatedXpath[0];

												var fetchedXpath = viewString[j].xpath.replace(/\s/g,' ').replace('&nbsp;',' ');
												fetchedXpath = viewString[j].xpath.split(";"); 
												fetchedXpath = fetchedXpath[0];
												
												if(updatedXpath == fetchedXpath)
												{
													updatedIndex.push(j);
													viewString[j] = updatedViewString[i];
													elementschanged=elementschanged+1;
												}
											}
										}
										console.log("updatedIndex", updatedIndex);
										updatedIndex=updatedIndex.sort(sortNumber);
										viewString =  viewString.filter(function(n){ return n != null });
											
										scrapedObjects.view=viewString;
										scrapedObjects.mirror=updateData.updatedViewString.mirror;
										scrapedObjects.scrapedin=scrapedobjects.scrapedin;
										scrapedObjects.scrapetype=scrapedobjects.scrapetype;
										if('view' in scrapedObjects)
										{
											scrapedObjects=JSON.stringify(scrapedObjects);
											scrapedObjects = scrapedObjects.replace(/'+/g,"''");
											var requestscreenhistorydetails = "'updated screens action by " + userInfo.username.toLowerCase() + " having role:" + userInfo.role + "" +
															" skucode=" + requestedskucodeScreens + ", tags=" + requestedtags + ", versionnumber=" + requestedversionnumber+
															"  screendata=" + scrapedObjects+
															"with the service action="+param+" '";
											var dateScreen = new Date().getTime();
											requestedScreenhistory =  dateScreen + ":" + requestscreenhistorydetails;
											updateScreenQuery = "update icetestautomation.screens set"+
																" screendata ='"+ scrapedObjects +"',"+
																" modifiedby ='" + modifiedBy + "',"+
																" modifiedon = '" + new Date().getTime()+ "'"+
																" , skucodescreen ='" + requestedskucodeScreens +
																"' , history= history + { "+requestedScreenhistory+" }" +
																" where screenid = "+screenID+
																" and projectid ="+projectID+
																" and screenname ='" + screenName +
																"' and versionnumber = "+requestedversionnumber+
																" IF EXISTS; "
											inputs={"scrapedata":scrapedObjects,"modifiedby":modifiedBy,"skucodescreen":requestedskucodeScreens,
											"screenid":screenID,"projectid":projectID,"screenname":screenName,"versionnumber":requestedversionnumber};
											//console.log("UPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP",updateScreenQuery);
				
											finalFunction(scrapedObjects);	
										}else{
											statusFlag="No Objects to compare.";
											try{
												res.send(statusFlag);
											}catch(exception){
												console.log(exception);
											}
										}
										
									}
									else{
										statusFlag="Error occured in updateScreenData : Fail";
										try{
											res.send(statusFlag);
										}catch(exception){
											console.log(exception);
										}
									}
								}
							catch(exception){
								console.log(exception);
							}
						});//End of fetchScrapedData
						}
						catch(exception){
							console.log(exception);
						}
					}//End of Async function callback
				  ]);//End of Async series
				}
			catch(exception){
				console.log(exception);
			}
		}
		function sortNumber(a,b) {
			return a - b;
		}
		//update screen history transaction
		
		//console.log("scraped:",scrapedObjects);
		//this code will be called only if the statusFlag is empty.
		function finalFunction(scrapedObjects,finalcallback){
			try{
				if(statusFlag=="" && scrapedObjects != "scrape data error: Fail"){
					//console.log(updateScreenQuery);
					// dbConn.execute(updateScreenQuery, function(err, result){
					var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
					client.post(epurl+"design/updateScreen_ICE",args,
						function (result, response) {
						try{
							// if (err) {
							if(response.statusCode != 200 || result.rows == "fail"){	
								// console.log(err);
								statusFlag="Error occured in updateScreenData : Fail";
								// console.log(err);
								try{
									res.send(statusFlag);
								}catch(exception){
									console.log(exception);
								}
							}else{
								if(param != 'updateScrapeData_ICE'){
									async.waterfall([
									function(testcasecallback){
										try{
											// var testcaseDataQuery="select testcaseid,testcasename,testcasesteps from testcases where screenid="+screenID;
											inputstestcase={"query":"screenid","screenid":screenID};
											var newCustnames,oldCustnames,xpathofCustnames;
											if(param == 'editScrapeData_ICE'){
												newCustnames=updateData.editedList.modifiedCustNames;
												oldCustnames=updateData.editedList.oldCustName;
												xpathofCustnames=updateData.editedList.xpathListofCustNames;
											}else if(param == 'mapScrapeData_ICE'){
											}
											else if(param == 'updateComparedObjects'){
												//CHANGE JSON FOR COMPARED OBJECTS -- INVALID JSON FORMAT FROM CORE
												oldCustnames = updateData.updatedViewString.view[0].changedobject;
												console.log("oldcustnames", oldCustnames)
											}
											else{
												oldCustnames = updateData.deletedList.deletedCustName;
												xpathofCustnames = updateData.deletedList.deletedXpath;
											}
												var args = {data:inputstestcase,headers:{"Content-Type" : "application/json"}}
												client.post(epurl+"design/readTestCase_ICE",args,
														function (testcaseDataQueryresult, response) {
												// dbConn.execute(testcaseDataQuery, function(testcaseDataQueryerr, testcaseDataQueryresult){
													// if(testcaseDataQueryerr){
														
													if(response.statusCode != 200 || testcaseDataQueryresult.rows == "fail"){	
														statusFlag="Error occured in testcaseDataQuery : Fail";
														try{
															res.send(statusFlag);
														}catch(exception){
															console.log(exception);
														}
													}else{
														try{
															if(testcaseDataQueryresult.rows.length>0){
																var testcasessize=0;
																async.forEachSeries(testcaseDataQueryresult.rows,
																function(eachTestcase,testcaserendercallback){
																	try{
																		// for(var eachtestcaseindex=0;eachtestcaseindex<testcaseDataQueryresult.length;eachtestcaseindex++){
																		var updatingTestcaseid=eachTestcase.testcaseid;
																		var updatingtestcasedata;
																		if(eachTestcase.testcasesteps != null && eachTestcase.testcasesteps != ''
																			&& eachTestcase.testcasesteps != undefined ){
																			updatingtestcasedata=JSON.parse(eachTestcase.testcasesteps);
																			}else{
																				updatingtestcasedata=JSON.parse("[]");
																			}
																			var updatingtestcasename=eachTestcase.testcasename;
																			if(!(param == 'mapScrapeData_ICE')){
																				//replacing/deleting all the custnames based on xpath and old custnames
																				var deletingStepindex=[]; 
																				//console.log(updatingtestcasedata);
																				if(updatingtestcasedata.length>0){
																					for(var updatingindex=0;updatingindex<oldCustnames.length;updatingindex++){
																						for(var eachtestcasestepindex=0;eachtestcasestepindex<updatingtestcasedata.length;eachtestcasestepindex++){
																							var testcasestep=updatingtestcasedata[eachtestcasestepindex];
																							var step = eachtestcasestepindex + 1;
																							// console.log(testcasestep);
																							if('custname' in testcasestep && 'objectName' in testcasestep){
																								// console.log((testcasestep.custname == oldCustnames[updatingindex]
																								// && testcasestep.objectName == xpathofCustnames[updatingindex]));
																								if((param == 'editScrapeData_ICE' || param == 'deleteScrapeData_ICE') 
																								&& testcasestep.custname.trim() == oldCustnames[updatingindex].trim()
																								&& testcasestep.objectName.trim() == xpathofCustnames[updatingindex].trim()){
																									if(param == 'editScrapeData_ICE'){
																										testcasestep.custname=newCustnames[updatingindex];
																									}else if (param == 'deleteScrapeData_ICE'){
																										testcasestep.stepNo=step;
																										if(deletingStepindex.indexOf(eachtestcasestepindex) === -1){
																											deletingStepindex.push(eachtestcasestepindex);
																										}
																									}
																								}else if((param == 'updateComparedObjects') 
																									&& testcasestep.custname.trim() == oldCustnames[updatingindex].custname.trim()
																									&& testcasestep.objectName.trim() != ''){
																										testcasestep.objectName = oldCustnames[updatingindex].xpath;
																									console.log("custname", oldCustnames[updatingindex].custname);
																									console.log("xpath", oldCustnames[updatingindex].xpath);	
																								}
																							}
																						}
																					}
																				}
																				// console.log(deletingStepindex,updatingtestcasedata);
																				if(param == 'deleteScrapeData_ICE'){
																					deletingStepindex=deletingStepindex.sort(sortNumber);
																					for(var deletingcaseindex=0;deletingcaseindex<deletingStepindex.length;deletingcaseindex++){
																						delete updatingtestcasedata[deletingStepindex[deletingcaseindex]];
																					}	
																				//removing null values from the array JSON
																				updatingtestcasedata =  updatingtestcasedata.filter(function(n){ return n != null });
																				}
																				updatingtestcasedata=JSON.stringify(updatingtestcasedata);
																				updatingtestcasedata = updatingtestcasedata.replace(/'+/g,"''");
																			}else{
																				try{
																					var uiUserProvidedNamesList=updateData.editedListoldCustName;
																					var uiElementsCustnameList=updateData.editedListmodifiedCustNames;
																					if(updatingtestcasedata.length>0){
																						var uiCustNameIndex=-1;
																						async.forEachSeries(uiElementsCustnameList,function(userCustName,userCustNameCallback){
																							uiCustNameIndex=uiCustNameIndex+1;
																							async.forEachSeries(updatingtestcasedata,function(eachTestCaseStep,eachTestCaseStepCallback){
																								// console.log("before eachTestCaseStep:",eachTestCaseStep);
																								if('custname' in eachTestCaseStep){
																									if(eachTestCaseStep.custname.replace(/\s/g,' ').replace('&nbsp;',' ').trim() == userCustName.replace(/\s/g,' ').replace('&nbsp;',' ').trim()){
																										//console.log("Removing Custom Object Value:",eachTestCaseStep.custname.replace(/\s/g,' ').replace('&nbsp;',' ').trim());
																										eachTestCaseStep.custname=uiUserProvidedNamesList[uiCustNameIndex];
																										//console.log("Replaced Custom Object Value:",userCustName.replace(/\s/g,' ').replace('&nbsp;',' ').trim());
																									}
																								}
																								if('custname' in eachTestCaseStep){
																									if(eachTestCaseStep.custname.replace(/\s/g,' ').replace('&nbsp;',' ').trim() == uiUserProvidedNamesList[uiCustNameIndex].replace(/\s/g,' ').replace('&nbsp;',' ').trim()){
																										if(('objectName' in eachTestCaseStep && eachTestCaseStep.objectName.trim() == "")
																											|| !('objectName' in eachTestCaseStep)){
																												eachTestCaseStep.objectName=requiredXpathList[uiCustNameIndex];
																												eachTestCaseStep.url=requiredURLList[uiCustNameIndex];
																										}
																									}
																								}
																								// console.log("after eachTestCaseStep:",eachTestCaseStep);
																								eachTestCaseStepCallback();
																							},userCustNameCallback);
																						});
																					}
																					updatingtestcasedata = JSON.stringify(updatingtestcasedata);
																					updatingtestcasedata = updatingtestcasedata.replace(/'+/g,"''");
																				}catch(exception){
																					console.log(exception);
																				}
																			}
																		 requesthistorydetails = "'updated testcase action by " + userInfo.username.toLowerCase() + " having role:" + userInfo.role + "" +
																			" skucodetestcase=" + requestedskucodeScreens + ", tags=" + requestedtags + "," +
																			" testcasesteps=" + updatingtestcasedata + ", versionnumber=" + requestedversionnumber+
																			" with the service action="+param+" '";
																		var date = new Date().getTime();
																		var requestedhistory =  date + ":" + requesthistorydetails;
																		if(updatingtestcasedata == "[]"){
																			updatingtestcasedata = "";											
																		}
																		var updateTestCaseQuery = "UPDATE testcases SET modifiedby='" + userInfo.username.toLowerCase() +
																			"', modifiedon='" + new Date().getTime() +
																			"',  skucodetestcase='" + requestedskucodeScreens +
																			"', history= history + { "+requestedhistory+" }" +
																			",  testcasesteps='" + updatingtestcasedata + 
																			"' where screenid=" + screenID + " and testcaseid=" + updatingTestcaseid + 
																			" and testcasename='" + updatingtestcasename + 
																			"' and versionnumber = "+requestedversionnumber+" IF EXISTS;";
																		inputs={"query":"updatetestcasedata","modifiedby":userInfo.username.toLowerCase(),"skucodetestcase":"skucodetestcase","testcaseid":updatingTestcaseid,
																		"testcasesteps":updatingtestcasedata,"screenid":screenID,"testcasename":updatingtestcasename,"versionnumber":requestedversionnumber}
																		uploadTestCaseData(inputs,function(error,response){
																			if(error){
																				try{
																					res.send(error);
																				}catch(exception){
																					console.log(exception);
																				}
																			}else{
																				try{
																					testcasessize=testcasessize + 1;
																					if(testcasessize==testcaseDataQueryresult.rows.length){
																							// fnCreateScreenHistory(createScreenHistoryQuery, function(err, data) {
																							// 	if (err) {
																							// 		console.log(err);
																							// 	} else {
																							// 		//Edit,Delete Scrape Objects final response
																							// 		if (data == "success")
																							// 		res.send(response);
																							// 	}
																							// });
																						res.send(response);
																					}
																				}catch(exception){
																					console.log(exception);
																				}
																			}
																		});
																	}catch(exception){
																		console.log(exception);
																	}
																	testcaserendercallback();
																});
															}else{
																//console.log(1);
																statusFlag = "success";
																try{
																	res.send(statusFlag);
																}catch(exception){
																	console.log(exception);
																}
															}
														}catch(exception){
															console.log(exception);
														}
													}
												});
												testcasecallback();
											}catch(exception){
												console.log(exception);
											}
										}
									]);
								}else{
									
								statusFlag = "success";
									try{
									// fnCreateScreenHistory(createScreenHistoryQuery, function(err, dataResult) {
									// 								if (err) {
									// 									console.log(err);
									// 								} else {
									// 									//updateScreen_ICE final response
									// 									if (dataResult == "success")
									// 									res.send(statusFlag);
									// 								}
									// 							});
										res.send(statusFlag);
									}catch(exception){
										console.log(exception);
									}
								}
							}
						}catch(exception){
							console.log(exception);
						}
					});
				}
				finalcallback;
			}catch(exception){
				console.log(exception);
			}
		}
	}
	else{
		res.send("Invalid Session");
	}

	}
	catch(exception){
		console.log(exception);
	}

	//Screen History Transaction 
	function fnCreateScreenHistory(createScreenHistoryQuery, createScreenHistoryCallback) {
				//console.log("History", createScreenHistoryQuery);
				var statusFlag = "";
				dbConnICEHistory.execute(createScreenHistoryQuery,
					function(createScreenHistoryQuery, createScreenHistoryQueryRes) {
						if (createScreenHistoryQuery) {
							statusFlag = "Error occured in createScreenTransactionHistory for screen : Fail";
							createScreenHistoryCallback(null, statusFlag);
						} else {
							statusFlag = "success";
							createScreenHistoryCallback(null, statusFlag);
						}
					});
			};
};

function repeatedXpath(viewString, xpath) {
    var xpathIndex = 0;
    var result = "";
    try {
        for(eachObjectindex=0;eachObjectindex<viewString.length;eachObjectindex++){
            try {
				var eachScrapedObject=viewString[eachObjectindex];
                if ('custname' in eachScrapedObject) {
                    if ('xpath' in eachScrapedObject) {
                        var scrapedxpath = eachScrapedObject.xpath;
                        var scrapedCustName = eachScrapedObject.custname;
                        if (scrapedxpath == xpath) {
                            xpathIndex = xpathIndex + 1;
                        }
                        if (xpathIndex > 1) {
                            //console.log("scrapedCustName:::", scrapedCustName);
                            result = scrapedCustName;
                            break;
                        }
                    }
                }
            } catch (exception) {
                console.log(exception);
            }
        }
        return result;
    } catch (exception) {
        console.log(exception);
    }
}
function buildObject(scrapedObjects,modifiedBy,requestedskucodeScreens,
	requestedScreenhistory,screenID,projectID,screenName,requestedversionnumber){
	try{
		var baseData={};
		var viewArray=[];
		var updateScreenQuery="";
		baseData.endPointURL=scrapedObjects.endPointURL;
		baseData.method=scrapedObjects.method;
		baseData.operations=scrapedObjects.operations;
		baseData.header=scrapedObjects.header;
		baseData.body=scrapedObjects.body;
		baseData.responseHeader=scrapedObjects.responseHeader;
		baseData.responseBody=scrapedObjects.responseBody;
		baseData.view=viewArray;
		scrapedObjects=JSON.stringify(scrapedObjects);
		scrapedObjects = scrapedObjects.replace(/'+/g,"''");
		updateScreenQuery = "update icetestautomation.screens set"+
			" screendata ='"+ scrapedObjects +"',"+
			" modifiedby ='" + modifiedBy + "',"+
			" modifiedon = '" + new Date().getTime()+
			"', skucodescreen ='" + requestedskucodeScreens +
			"' , history= history + { "+requestedScreenhistory+" }" +
			" where screenid = "+screenID+
			" and projectid ="+projectID+
			" and screenname ='" + screenName +
			"' and versionnumber = "+requestedversionnumber+
		" IF EXISTS; ";
		inputsWS={"scrapedata":scrapedObjects,"modifiedby":modifiedBy,"skucodescreen":requestedskucodeScreens,
		"screenid":screenID,"projectid":projectID,"screenname":screenName,"versionnumber":requestedversionnumber};
		return updateScreenQuery;
	}catch(exception){
		console.log(exception);
	}
}

function parseRequest(readChild){
	try{
	   if('name' in readChild){
	       if(xpath==""){  
	            xpath="/"+readChild.name
	            allXpaths.push(xpath);
	            allCustnames.push(readChild.name);
	        }
	        if('attributes' in readChild){
	            var attrchildren=Object.keys(readChild.attributes);
	            if(attrchildren.length >= 1){
	                var basexpath=xpath;
	                // console.log("Attributes Available...");
	                for(var attrindex=0;attrindex<attrchildren.length;attrindex++){
	                    var newLevel = attrchildren[attrindex];
	                    if(xpath == undefined){
	                        xpath="";
	                    }
	                    var custname=readChild.name +"_" + newLevel;
	                    xpath = xpath +"/" + newLevel;
	                    allCustnames.push(custname);
	                    allXpaths.push(xpath);
	                    xpath = basexpath;
	                }
	            }
	        }   
	        if('children' in readChild){
	            if(readChild.children.length >= 1){
	                var basexpath=xpath;
	                for(var childrenindex=0;childrenindex<readChild.children.length;childrenindex++){
	                    objectLevel=objectLevel + 1;
	                    var newLevel = readChild.children[childrenindex].name;
	                    if(xpath == undefined || xpath == 'undefined'){
	                        xpath="";
	                    }
	                    xpath =xpath +"/" +newLevel;
	                    allCustnames.push(newLevel);
	                    allXpaths.push(xpath);
	                    parseRequest(readChild.children[childrenindex]);
	                    xpath=basexpath;
	                    objectLevel=objectLevel - 1;
	                }
	            }
	        }
	    }
	}catch(exception){
		console.log(exception);
	}
}


/**
 * generic function for DB to update the testcases table
 * @author vishvas.a
 */
function uploadTestCaseData(inputs,uploadTestCaseDatacallback){
	try{

		var statusFlag="";
		// dbConn.execute(updateTestCasesQuery, 
			// function(updateTestCaseQueryerr, updateTestCaseQueryresult){
		var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
		client.post(epurl+"design/updateTestCase_ICE",args,
					function (result, response) {
				// if(updateTestCaseQueryerr){
				if(response.statusCode != 200 || result.rows == "fail"){
					statusFlag="Error occured in updateTestCaseQuery : Fail";
					uploadTestCaseDatacallback(statusFlag,null);
				}else{
					statusFlag = "success";						
					uploadTestCaseDatacallback(null,statusFlag);
			}
		});
	}catch(exception){
		console.log(exception);
	}
};



/**
* @author vishvas.a
* @modified author sunil.revankar
* readTestCase_ICE service is used to fetch the testcase data
*/
exports.readTestCase_ICE = function (req, res) {
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		//base output elements
		var testcasesteps = "";
		var testcasename = "";
		var template = "";
		
		// base request elements 		
		var requestedscreenid = req.body.screenid; 		
		var requestedtestscasename=req.body.testcasename; 		
		var requestedtestscaseid = req.body.testcaseid;

		// base request elements sent in request
		inputs={"screenid": requestedscreenid,
			"testcasename":requestedtestscasename,
			"testcaseid" : requestedtestscaseid,
            "versionnumber" : 1,
		"query": "readtestcase"}
		var args = {
					data:inputs,
					headers:{"Content-Type" : "application/json"}
				}

		// var requestedversionnumber = req.body.versionnumber;
		 var requestedversionnumber = 1;
		//complete response data
		var responsedata = {
			template: "",
			testcase: "",
			testcasename: ""
		};
		
		// var getTestCases = "select testcasesteps,testcasename from testcases where screenid= " + requestedscreenid +
		// 				" and testcasename='"+requestedtestscasename+"'" +
		// 				" and versionnumber="+requestedversionnumber+
		// 	" and testcaseid=" + requestedtestscaseid;
		// dbConn.execute(getTestCases, function (err, result) {

		//Query 1 fetching the testcasesteps from the test cases based on requested screenid,testcasename,testcaseid
		client.post(epurl+"design/readTestCase_ICE",args,
						function (result, response) {
			try{
				if(response.statusCode != 200 || result.rows == "fail"){
				// if (err) {
					var flag = "Error in readTestCase_ICE : Fail";
					try{
						res.send(flag);
					}catch(exception){
						console.log(exception);
					}
				} else {
					try{
						for (var i = 0; i < result.rows.length; i++) {
							testcasesteps = result.rows[i].testcasesteps;
							testcasename = result.rows[i].testcasename;
						}
						// var scrapedDataQuery="select screendata from screens where screenid="+requestedscreenid+
						// 	" allow filtering ;";
						var inputs = {"query": "debugtestcase", "screenid":requestedscreenid};
					    fetchScrapedData(inputs, function(err, scrapedobjects, querycallback) {						
						// fetchScrapedData(scrapedDataQuery,function(err,scrapedobjects,querycallback){
							try{
								if(scrapedobjects != null && scrapedobjects.trim() != '' && scrapedobjects != undefined){
									var newParse = JSON.parse(scrapedobjects);
									if('body' in newParse){
										//this is checked
										template = newParse.body;
										responsedata.template = template;
										responsedata.testcase = testcasesteps;
										responsedata.testcasename = testcasename;
										try{
											res.send(responsedata);
										}catch(exception){
											console.log(exception);
										}
									}else{
										//this is checked
										responsedata = { template: "", testcase: testcasesteps, testcasename: testcasename }
										try{
											res.send(responsedata);
										}catch(exception){
											console.log(exception);
										}
									}
								}else if((scrapedobjects == null || scrapedobjects.trim() == '' || scrapedobjects == undefined) 
										 && (testcasesteps != null && testcasesteps != '' || testcasesteps != undefined)){
									//this is checked
									responsedata = { template: "", testcase: testcasesteps, testcasename: testcasename }
									try{
										res.send(responsedata);
									}catch(exception){
										console.log(exception);
									}
								} else {
									//this case is merely impossible in V2.0 as creation happens in MindMaps
									responsedata = { template: "", testcase: "[]", testcasename: "" }
									try{
										res.send(responsedata);
									}catch(exception){
										console.log(exception);
									}
								}
							}catch(exception){
								console.log(exception);
							}
						});		
					}catch(exception){
						console.log(exception);
					}
				}
			}catch(exception){
				console.log(exception);
			}
		});
	}
	else{
		res.send("Invalid Session");
	}
}
catch(exception){
		console.log(exception);
	}
};

/**
* @author vishvas.a
* @modified author sunil.revankar
* updateTestCase_ICE service is used to save testcase data
*/
exports.updateTestCase_ICE = function (req, res) {
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		/*
		 *internal variables 
		 */
		var hasrow = false;
		/*
		 * base request elements
		 */
		var updateTestCaseQuery;
		var requestedscreenid = req.body.screenid;
		var requestedtestcaseid = req.body.testcaseid;
		var requestedtestcasename = req.body.testcasename;
		var requestedtestcasesteps = JSON.parse(req.body.testcasesteps);
		var historyRemarks = requestedtestcasesteps;
		var userinfo = req.body.userinfo;
		//these value has to be modified later
		var requestedskucodetestcase = req.body.skucodetestcase;
		var requestedtags = req.body.tags;
		// var requestedversionnumber = req.body.versionnumber;
		var requestedversionnumber = 1;
		historyRemarks = JSON.stringify(historyRemarks);
		historyRemarks = historyRemarks.replace(/'+/g,"''");
		var requesthistorydetails = "'updated testcase action by " + userinfo.username.toLowerCase() + " having role:" + userinfo.role + "" +
			" skucodetestcase=" + requestedskucodetestcase + ", tags=" + requestedtags + "," +
			" testcasesteps=" + historyRemarks + ", versionnumber=" + requestedversionnumber+" '";
		var date = new Date().getTime();
		var requestedhistory =  date + ":" + requesthistorydetails;
		/*
		 * Query 1 checking whether the testcaseid belongs to the same screen
		 * based on requested screenid,testcasename,testcaseid and testcasesteps
		 */
		var checktestcaseexist = "select testcaseid from testcases where screenid=" + requestedscreenid;
		var inputs = {"screenid":requestedscreenid, "query":"checktestcaseexist"};
		var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
		client.post(epurl+"design/updateTestCase_ICE",args,
					function (result, response) {
		// console.log('-------------',response);
		//dbConn.execute(checktestcaseexist, function (err, result) {
			try{
			//	if (err) {
				if(response.statusCode != 200 || result.rows == "fail"){	
					var flag = "Error in Query 1 testcaseexist: Fail";
					try{
						res.send(flag);
					}catch(exception){
						console.log(exception);
					}
				} else {
					for (var i = 0; i < result.rows.length; i++) {
						if (result.rows[i].testcaseid == requestedtestcaseid) {
							hasrow = true;
							break;
						}
					}
					if (hasrow == true) {
						/*
						 * Query 2 updating the testcasedata based on
						 * based on requested screenid,testcaseid and testcasesteps
						 */
						requestedtestcasesteps = JSON.stringify(requestedtestcasesteps);
						requestedtestcasesteps = requestedtestcasesteps.replace(/'+/g,"''");
						var inputs = {"screenid":requestedscreenid,
										 "query":"updatetestcasedata",
										"modifiedby" : userinfo.username.toLowerCase(),
										"skucodetestcase" : requestedskucodetestcase,
										"testcasesteps" : requestedtestcasesteps,
										"versionnumber" : requestedversionnumber,
										"testcaseid" :  requestedtestcaseid,
										"testcasename"  : requestedtestcasename
										};
						// var updateTestCaseData = "UPDATE testcases SET modifiedby='" + userinfo.username +
						// 	"', modifiedon='" + new Date().getTime() +
						// 	"',  skucodetestcase='" + requestedskucodetestcase +
						// 	//"', history= history + { "+requestedhistory+" }" +
						// 	"',  testcasesteps='" + requestedtestcasesteps + "'"+
						// 	" where versionnumber = "+requestedversionnumber+" and screenid=" + requestedscreenid + " and testcaseid=" + requestedtestcaseid + " and testcasename='" + requestedtestcasename + "' IF EXISTS;";

		                 updateTestCaseQuery =  "UPDATE testcases SET  history= history + { "+requestedhistory+" }" +
							" where versionnumber = "+requestedversionnumber+" and screenid=" + requestedscreenid + " and testcaseid=" + requestedtestcaseid + " and testcasename='" + requestedtestcasename + "' ";
							// console.log(updateTestCaseQuery);
							uploadTestCaseData(inputs,function(error,response){
							// uploadTestCaseData(updateTestCaseData,function(error,response){
								if(error){
									try{
										res.send(error);
									}catch(exception){
										console.log(exception);
									}
								}else{
									try{
										fnUpdateTestcasesHistory(updateTestCaseQuery, function(err, dataResult) {
																	if (err) {
																		console.log(err);
																	} else {
																		//console.log(response);
																		if (dataResult == "success")
																		res.send(response);
																	}
																});
										//res.send(response);
									}catch(exception){
										console.log(exception);
									}
								}
							});
					}else{
						console.log("Fail to save testcase");
						res.send("fail");
					}
				}
			}catch(exception){
				console.log(exception);
			}
		});
	}
	else{
		res.send("Invalid Session");
	}
	}catch(exception){
		console.log(exception);
	}
};
	//Testcases History Transaction 
	function fnUpdateTestcasesHistory(updateTestCaseQuery, updateTestcaseHistoryCallback) {
				//console.log("History", createScreenHistoryQuery);
				var statusFlag = "";
				dbConnICEHistory.execute(updateTestCaseQuery,
					function(updateTestCaseQuery, updateTestcaseHistoryQueryRes) {
						if (updateTestCaseQuery) {
							statusFlag = "Error occured in updateTestcaseHistory for screen : Fail";
							updateTestcaseHistoryCallback(null, statusFlag);
						} else {
							statusFlag = "success";
							updateTestcaseHistoryCallback(null, statusFlag);
						}
					});
			};




/**
* @author vishvas.a
* @modified author sunil.revankar
* debugTestCase_ICE service is used to debug the testcase
*/
exports.debugTestCase_ICE = function (req, res) {
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		console.log("IP:",ip);
		var name = req.session.username;
		console.log(Object.keys(myserver.allSocketsMap),"<<all people, asking person:",name);
		if('allSocketsMap' in myserver && name in myserver.allSocketsMap){
			var mySocket = myserver.allSocketsMap[name];
			try{
				var action=req.body.param;
				if(action == 'debugTestCase_ICE'){
					try {
					    var requestedbrowsertypes = req.body.browsertypes;
					    var requestedtestcaseids = req.body.testcaseids;
					    var responsedata = [];
					    var counter = -1;
					    // var responseobject = {
					    //            template: "",
					    //            testcasename: "",
					    //            testcase: []
					    // };
					    var browsertypeobject = {
					        browsertype: requestedbrowsertypes
					    };
					    var flag = "";
					    //for (var indexes = 0; indexes < requestedtestcaseids.length; indexes++) {
					    async.forEachSeries(requestedtestcaseids, function(testcaseIDs, eachTestcaseIDsCallback) {
					        // var getProjectTestcasedata = "select screenid,testcasename,testcasesteps from testcases where testcaseid=" + testcaseIDs;
					        // dbConn.execute(getProjectTestcasedata, function(errgetTestcasedata, testcasedataresult) {
								var inputs = {"query": "testcaseid", "testcaseid":testcaseIDs};
								var args = {data:inputs,headers:{"Content-Type" : "application/json"}}
								client.post(epurl+"design/readTestCase_ICE",args,
										function (testcasedataresult, response) {
					            try {
					                // if (errgetTestcasedata) {
									if(response.statusCode != 200 || testcasedataresult.rows == "fail"){	
					                    flag = "Error in getProjectTestcasedata : Fail";
					                    try {
					                        res.send(flag);
					                    } catch (exception) {
					                        console.log(exception);
					                    }
					                } else {
					                    //for (var ids = 0; ids < testcasedataresult.rows.length; ids++) {
					                    async.forEachSeries(testcasedataresult.rows, function(eachTestcaseData, testcasedataCallback) {
					                        var responseobject = {
					                            template: "",
					                            testcasename: "",
					                            testcase: []
					                        };
					                        responseobject.testcase = eachTestcaseData.testcasesteps;
					                        responseobject.testcasename = eachTestcaseData.testcasename;
					                        responsedata.push(responseobject);
					                        responsedata.push(browsertypeobject);
					                        // var scrapedDataQuery = "select screendata from screens where screenid=" +
					                        //     testcasedataresult.rows[0].screenid + " allow filtering ;";
											var inputs = {"query": "debugtestcase", "screenid":testcasedataresult.rows[0].screenid};
					                        fetchScrapedData(inputs, function(err, scrapedobjects, querycallback) {
					                            counter++;
					                            try {
					                                if (scrapedobjects != null && scrapedobjects != '' && scrapedobjects != undefined) {
					                                    var newParse = JSON.parse(scrapedobjects);
					                                    if ('body' in newParse) {
					                                        var screen_obj = responsedata[counter];
					                                        screen_obj.template = newParse.body[0];

					                                    }
					                                }
					                                // responsedata.push(responseobject);
					                                // responsedata.push(browsertypeobject);
					                                if (counter == requestedtestcaseids.length - 1) {
					                                    mySocket._events.result_debugTestCase = [];
					                                    mySocket.emit('debugTestCase', responsedata);
					                                    mySocket.on('result_debugTestCase', function(responsedata) {
					                                        try {
					                                            res.send(responsedata);
					                                        } catch (exception) {
					                                            console.log(exception);
					                                        }
					                                    })
					                                }
					                            } catch (exception) {
					                                console.log(exception);
					                            }
					                        });
					                        testcasedataCallback();
					                    }, eachTestcaseIDsCallback);
					                }
					            } catch (exception) {
					                console.log(exception);
					            }
					        });
					    });
					    ///////////
					    /*requestedtestcaseids.forEach(function(testcase,i){vargetProjectTestcasedata="selectscreenid,testcasename,testcasestepsfromtestcaseswheretestcaseid="+testcase;dbConn.execute(getProjectTestcasedata,function(errgetTestcasedata,testcasedataresult){try{if(errgetTestcasedata){flag="ErroringetProjectTestcasedata:Fail";try{res.send(flag);}catch(exception){console.log(exception);}}else{//for(varids=0;ids<testcasedataresult.rows.length;ids++){testcasedataresult.rows.forEach(function(ids,j){varresponseobject={template:"",testcasename:"",testcase:[]};responseobject.testcase=ids.testcasesteps;responseobject.testcasename=ids.testcasename;responsedata.push(responseobject);responsedata.push(browsertypeobject);varscrapedDataQuery="selectscreendatafromscreenswherescreenid="+testcasedataresult.rows[0].screenid+"allowfiltering;";fetchScrapedData(scrapedDataQuery,function(err,scrapedobjects,querycallback){counter++;try{if(scrapedobjects!=null&&scrapedobjects!=''&&scrapedobjects!=undefined){varnewParse=JSON.parse(scrapedobjects);if('body'innewParse){varscreen_obj=responsedata[counter];screen_obj.template=newParse.body[0];}}//responsedata.push(responseobject);//responsedata.push(browsertypeobject);if(counter==requestedtestcaseids.length-1){mySocket._events.result_debugTestCase=[];mySocket.emit('debugTestCase',responsedata);mySocket.on('result_debugTestCase',function(responsedata){try{res.send(responsedata);}catch(exception){console.log(exception);}})}}catch(exception){console.log(exception);}});//}});}}catch(exception){console.log(exception);}});//}});*/
					} catch (exception) {
					    console.log(exception);
					}
					//try{//varrequestedbrowsertypes=req.body.browsertypes;//varrequestedtestcaseids=req.body.testcaseids;//varresponsedata=[];//varresponseobject={//template:"",//testcasename:"",//testcase:[]//};//varbrowsertypeobject={browsertype:requestedbrowsertypes};//varflag="";//for(varindexes=0;indexes<requestedtestcaseids.length;indexes++){//vargetProjectTestcasedata="selectscreenid,testcasename,testcasestepsfromtestcaseswheretestcaseid="+requestedtestcaseids[indexes];//dbConn.execute(getProjectTestcasedata,function(errgetTestcasedata,testcasedataresult){//try{//if(errgetTestcasedata){//flag="ErroringetProjectTestcasedata:Fail";//try{//res.send(flag);//}catch(exception){//console.log(exception);//}//}else{//for(varids=0;ids<testcasedataresult.rows.length;ids++){//responseobject.testcase=testcasedataresult.rows[ids].testcasesteps;//responseobject.testcasename=testcasedataresult.rows[ids].testcasename;//varscrapedDataQuery="selectscreendatafromscreenswherescreenid="+//testcasedataresult.rows[0].screenid+"allowfiltering;";//fetchScrapedData(scrapedDataQuery,function(err,scrapedobjects,querycallback){//try{//if(scrapedobjects!=null&&scrapedobjects!=''&&scrapedobjects!=undefined){//varnewParse=JSON.parse(scrapedobjects);//if('body'innewParse){//responseobject.template=newParse.body[0];//}//}//responsedata.push(responseobject);//responsedata.push(browsertypeobject);//mySocket._events.result_debugTestCase=[];//mySocket.emit('debugTestCase',responsedata);//mySocket.on('result_debugTestCase',function(responsedata){//try{//res.send(responsedata);//}catch(exception){//console.log(exception);//}//})//}catch(exception){//console.log(exception);//}//});//}//}//}catch(exception){//console.log(exception);//}//});//}//}catch(exception){//console.log(exception);//}
				}else if(action == 'debugTestCaseWS_ICE'){
					try{
						mySocket._events.result_debugTestCaseWS = [];
						var testcaseWS=[];
						testcaseWS.push(req.body.testCaseWS);
						mySocket.emit('debugTestCase',testcaseWS);
						mySocket.on('result_debugTestCaseWS', function (value) {
							try{
								if(value.toUpperCase() === 'TERMINATE'){
									try{
										res.send(value);
									}catch(exception){
										console.log(exception);
									}
								}else{
									var responsedata={
											responseHeader:[],
											responseBody:[]
										};
									if(value != "fail" && value != undefined && value != ""){
										var response=value.split('rEsPONseBOdY:');
										
										if(response.length == 2){
											responsedata.responseHeader.push(response[0]);
											responsedata.responseBody.push(response[1].replace("&gt;",">").replace("&lt;","<"));
											try{
												res.send(responsedata);
											}catch(exception){
												console.log(exception);
											}
										}else if (response.length == 1){
											responsedata.responseHeader.push(response[0]);
											responsedata.responseBody.push("");
											try{
												res.send(responsedata);
											}catch(exception){
												console.log(exception);
											}
										}else{
											responsedata.responseHeader.push("");
											responsedata.responseBody.push("");
											try{
												res.send(responsedata);
											}catch(exception){
												console.log(exception);
											}
										}
									}else{
										responsedata.responseHeader.push("Response Header - Fail");
										responsedata.responseBody.push("Response Body - Fail");
										try{
											res.send(responsedata);
										}catch(exception){
											console.log(exception);
										}
									}
								}
							}catch(exception){
								console.log(exception);
							}
						});
					}catch(exception){
						console.log(exception);
					}
				}else if(action == 'wsdlListGenerator_ICE'){
					try{
						var wsdlurl=req.body.wsdlurl;
						mySocket._events.result_wsdl_listOfOperation = []
						mySocket.emit('wsdl_listOfOperation',wsdlurl);
						mySocket.on('result_wsdl_listOfOperation', function (listGenResponse) {
							try{
								if(listGenResponse.toUpperCase() === 'TERMINATE'){
									try{
										res.send(listGenResponse);
									}catch(exception){
										console.log(exception);
									}
								}else{
									var responsedata={listofoperations:[]};
									if(listGenResponse != "None" && listGenResponse != "fail" && listGenResponse != undefined && listGenResponse != ""){
										//console.log(listGenResponse);
										listGenResponse=listGenResponse.replace(/'+/g,"\"");
										var listGenResponse=JSON.parse(listGenResponse);
										responsedata.listofoperations=listGenResponse;
//										try{
											res.send(responsedata);
//										}catch(exception){
//											console.log(exception);
//										}
									}else{
										try{
											res.send("fail");
										}catch(exception){
											console.log(exception);
										}
									}
								}
							}catch(exception){
								console.log(exception);
							}
						});
					}catch(exception){
						console.log(exception);
					}
				}else if(action == 'wsdlServiceGenerator_ICE'){
					try{
						var wsdlurl=req.body.wsdlurl;
						var operations=req.body.method;
						var soapVersion='0';
						if(operations.indexOf('SOAP1.2') !== -1){
							soapVersion='1';
						}
						if(operations.indexOf('SOAP') !== -1){
							operations=operations.split('-')[1];
						}
						var serviceGenRequest={
							wsdlurl:wsdlurl,
							operations:operations,
							soapVersion:soapVersion
						}
						mySocket._events.result_wsdl_ServiceGenerator = [];
						mySocket.emit('wsdl_ServiceGenerator',serviceGenRequest);
						mySocket.on('result_wsdl_ServiceGenerator', function (serviceGenResponse) {
							try{
								if(serviceGenResponse.toUpperCase() === 'TERMINATE'){
									try{
										res.send(serviceGenResponse);
									}catch(exception){
										console.log(exception);
									}
								}else{
									//console.log(wsdlurl.split('?')[0]);
									//console.log(operations);
									var responsedata={
										endPointURL:[],
										method:["POST"],
										header:[],
										body:[],
										operations:[],
										responseHeader:[""],
										responseBody:[""]
									};
									responsedata.endPointURL.push(wsdlurl.split('?')[0]);
									responsedata.operations.push(operations);
									if(serviceGenResponse != "fail" && serviceGenResponse != undefined && serviceGenResponse != ""){
										response=serviceGenResponse.split('rEsPONseBOdY:');
										if(response.length == 2){
											responsedata.header.push(response[0]);
											responsedata.body.push(response[1]);
										}else if(response.length == 1){
											responsedata.header.push(response[0]);
											responsedata.body.push("");
										}else{
											responsedata.header.push("");
											responsedata.body.push("");
										}
									}else{
										responsedata.header.push("");
										responsedata.body.push("");
									}
									try{
										res.send(responsedata);
									}catch(exception){
										console.log(exception);
									}
								}
							}catch(exception){
								console.log(exception);
							}
						});
					}catch(exception){
						console.log(exception);
					}
				}
			}catch(exception){
				console.log(exception);
			}
		}else{
			console.log("Socket not Available");
			try{
				res.send("unavailableLocalServer");
			}catch(exception){
				console.log(exception);
			}
		}
	}
	else{
		res.send("Invalid Session");
	}
}catch(exception){
		res.send("unavailableLocalServer");
		console.log(exception);
	}
};



/**
* getKeywordDetails_ICE for fetching the objects,keywords 
* based on projecttype sent by front end
* @author vishvas.a
*/
exports.getKeywordDetails_ICE = function getKeywordDetails_ICE(req, res) {
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		// request variables
		var requestedprojecttypename = req.body.projecttypename;
		//var requestedprojecttypename = "Web";
		// Query 1 fetching the objecttype,keywords basked on projecttypename
		var individualsyntax = {};
	
		var flag = "Error in errProjectBasedKeywords : Fail";
		// var getProjectBasedKeywords = "select objecttype, keywords from keywords where projecttypename in ('"
		// 		+ requestedprojecttypename + "','Generic') ALLOW FILTERING";
		// dbConn.execute(getProjectBasedKeywords,
		// 	function(errProjectBasedKeywords,projectBasedKeywordsresult) {
			var args = {
				data: requestedprojecttypename,
				headers:{'Content-Type': 'application/json'}
			};
			client.post(epurl+"design/getKeywordDetails_ICE",args,
						function (projectBasedKeywordsresult, response) {
				try{
					// if (errProjectBasedKeywords) {
					if (response.statusCode != 200 || projectBasedKeywordsresult.rows == "fail") {
						flag = "Server data rendering failed: Fail";
						try{
							res.send(flag);
						}catch(exception){
							console.log(exception);
						}
					} else {
						for (var objectindex = 0; objectindex < projectBasedKeywordsresult.rows.length; objectindex++) {
							var objecttype = projectBasedKeywordsresult.rows[objectindex].objecttype;
							// var keywords = projectBasedKeywordsresult.rows[objectindex].keywords;
							var keywords = JSON.parse(projectBasedKeywordsresult.rows[objectindex].keywords);
							individualsyntax[objecttype] = keywords;
						}
						try{	
							res.send(individualsyntax);
						}catch(exception){
							console.log(exception);
						}
					}
				}catch(exception){
					console.log(exception);
				}
			});
	}
	else{
		res.send("Invalid Session");
	}
}catch(exception){
		console.log(exception);
	}
};

//getDependentTestCases by ScenarioId
exports.getTestcasesByScenarioId_ICE = function getTestcasesByScenarioId_ICE(req, res) {
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var testcasesArr = [];
		var testScenarioId = req.body.testScenarioId;
		// var getTestcaseIds = "select testcaseids from testscenarios where testscenarioid = "+testScenarioId+" ALLOW FILTERING";
		//console.log(getTestcaseIds);
		// dbConn.execute(getTestcaseIds,
		// 	function(errGetTestCaseIds,testcasesResult) {
		var inputs = {"testscenarioid":testScenarioId, "query":"gettestcaseids"};
		var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
		client.post(epurl+"design/getTestcasesByScenarioId_ICE",args,
						function (testcasesResult, response) {
				try{
					
					if(response.statusCode != 200 || testcasesResult.rows == "fail"){	
						flag = "Error in fetching testcaseIds : Fail";
						try{
							res.send(flag);
						}catch(exception){
							console.log(exception);
						}
					} else {
						//console.log("testcaseIds", testcasesResult.rows[0].testcaseids);
						
						var testcaseIds = testcasesResult.rows[0].testcaseids
						
						async.forEachSeries(testcaseIds,function(eachtestcaseid,fetchtestcaseNameCallback){
							
							var testcasesObj={};
							try{
							// var getTestCaseDetails = "select testcasename from testcases where testcaseid = "+eachtestcaseid+" ALLOW FILTERING";
							// dbConn.execute(getTestCaseDetails,
			                //       function(errGetTestCaseDetails,testcaseNamesResult) {
							var inputs = {"eachtestcaseid":eachtestcaseid, "query":"gettestcasedetails"};
							var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
							client.post(epurl+"design/getTestcasesByScenarioId_ICE",args,
							function (testcaseNamesResult, response) {
									try{
											// if(errGetTestCaseDetails)
											if(response.statusCode != 200 || testcaseNamesResult.rows == "fail"){	
												flag = "Error in fetching testcaseNames : Fail";
												try{
														res.send(flag);
													}catch(exception){
														console.log(exception);
													}
											}
											else{
												//console.log("testcaseNames", testcaseNamesResult);
												var testcaseNames = testcaseNamesResult.rows[0];
												testcasesObj.testcaseId = eachtestcaseid;
												testcasesObj.testcaseName = testcaseNames.testcasename;
												testcasesArr.push(testcasesObj);
												//console.log("testcasesArr", testcasesArr);
												fetchtestcaseNameCallback();
											}
									   }
									catch(exception){
								console.log(exception);
							}
							});
							}catch(exception){
								console.log(exception);
							}	
						},finalfunction);
					}
				}catch(exception){
					console.log(exception);
				}

				function finalfunction(){
					try{	
						res.send(testcasesArr);
						}catch(exception){
							console.log(exception);
						}
				}
			});
	}
	else{
		res.send("Invalid Session");
	}
	}
	catch(exception){
		console.log(exception);
	}
};