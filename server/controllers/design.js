/**
 * Dependencies.
 */
var Joi = require('joi');
var dbConn = require('../../server/config/icetestautomation');
var cassandra = require('cassandra-driver');
var myserver = require('../../server.js');
var async = require('async');
var parse = require('xml-parser');
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

exports.initScraping_ICE = function (req, res) {
	/*var reqScrapJson = {};
	var browserType = req.body.browserType;
	reqScrapJson.appType = "Web";
	reqScrapJson.action = "SCRAPE"
				if (browserType == "chrome") {
		var data = "OPEN BROWSER CH";
				}
				else if (browserType == "ie") {
		var data = "OPEN BROWSER IE";
				}
				else if (browserType == "mozilla") {
		var data = "OPEN BROWSER FX";
				}
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var mySocket = myserver.allSocketsMap[ip];
	mySocket._events.scrape = [];               						
	mySocket.send(data);
	mySocket.on('scrape', function (data) {
		res.send(data);
	});*/
	var reqScrapJson = {};
	reqScrapJson.action = "SCRAPE"
	if(req.body.screenViewObject.appType == "Desktop"){
		var applicationPath = req.body.screenViewObject.applicationPath;
		var data = "LAUNCH_DESKTOP";
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var mySocket = myserver.allSocketsMap[ip];
		mySocket._events.scrape = [];               						
		mySocket.emit("LAUNCH_DESKTOP", applicationPath);
		mySocket.on('scrape', function (data) {
			res.send(data);
		});
	}
	else if(req.body.screenViewObject.appType == "DesktopJava"){
		var applicationPath = req.body.screenViewObject.applicationPath;
		var data = "LAUNCH OEBS";
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var mySocket = myserver.allSocketsMap[ip];
		mySocket._events.scrape = [];               						
		mySocket.send(data);
		mySocket.on('scrape', function (data) {
			res.send(data);
		});
	}
	else if(req.body.screenViewObject.appType == "Mobility"){
        var apkPath = req.body.screenViewObject.apkPath;
        var serial = req.body.screenViewObject.mobileSerial;
		var data = "LAUNCH_MOBILE";
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var mySocket = myserver.allSocketsMap[ip];
		mySocket._events.scrape = [];                                                                                                  
		mySocket.emit("LAUNCH_MOBILE", apkPath,serial);
		mySocket.on('scrape', function (data) {
						res.send(data);
		});
	}
	else if(req.body.screenViewObject.appType == "mobileweb"){
		console.log(req.body.screenViewObject)
		var mobileSerial = req.body.screenViewObject.mobileSerial;
        var androidVersion = req.body.screenViewObject.androidVersion;
        var data = "LAUNCH_MOBILE_WEB";
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var mySocket = myserver.allSocketsMap[ip];
		mySocket._events.scrape = [];                                                                                                  
		mySocket.emit("LAUNCH_MOBILE_WEB", mobileSerial, androidVersion);
		mySocket.on('scrape', function (data) {
						res.send(data);
		});
	}
	else{	
		var browserType = req.body.screenViewObject.browserType;
			if (browserType == "chrome") {
				var data = "OPEN BROWSER CH";
			}
			else if (browserType == "ie") {
				var data = "OPEN BROWSER IE";
			}
			else if (browserType == "mozilla") {
				var data = "OPEN BROWSER FX";
			}
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var mySocket = myserver.allSocketsMap[ip];
		mySocket._events.scrape = [];               						
		mySocket.send(data);
		mySocket.on('scrape', function (data) {
			res.send(data);
		});
	}
};

/**
 * @author vinay.niranjan
 * @modified author vinay.niranjan
 * the service is used to highlight scraped Objects into the browser
 */
 exports.highlightScrapElement_ICE = function(req, res) {
	 	var focusParam = req.body.elementXpath+","+req.body.elementUrl;
		var appType = req.body.appType;
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var mySocket =  myserver.allSocketsMap[ip];
		mySocket.emit("focus", focusParam, appType);
		var flag = 'success';
		res.send(flag);
};

/**
 * @author vinay.niranjan
 * @modified author vishvas.a
 * the service is used to fetch the  screen data based on the screenid and *projectid
 */
exports.getScrapeDataScreenLevel_ICE = function(req, res){
	var flag = "";
	var getScrapeDataQuery = "select screenid,screenname,screendata from screens where "+
			" screenid ="+ req.body.screenId + 
			" and projectid="+req.body.projectId+
			" allow filtering ;";
		fetchScrapedData(getScrapeDataQuery,function(getScrapeDataQueryerror,getScrapeDataQueryresponse){
				res.send(getScrapeDataQueryresponse);
		});
};

/**
 * generic function for DB call to fetch the screendata
 * @author vishvas.a
 */
function fetchScrapedData(scrapeQuery,fetchScrapedDatacallback){
	var responsedata;
	var flag;
	dbConn.execute(scrapeQuery, function(getScrapeDataQueryerr, getScrapeDataQueryresult){
		if (getScrapeDataQueryerr) {
			//console.log("scrape data error: Fail",getScrapeDataQueryerr);
			flag="getScrapeData Fail.";
			fetchScrapedDatacallback(null,flag);
		}else{
			for (var i = 0; i < getScrapeDataQueryresult.rows.length; i++) {
				responsedata = getScrapeDataQueryresult.rows[i].screendata;
			}
			fetchScrapedDatacallback(null,responsedata);
		}
	});
};


/**
* @author vinay.niranjan
* @modified author vishvas.a
* service updates the screen data in screens table
* on user action of NEW SAVING/EDIT/UPDATE/DELETE in Design screen. 
*/
exports.updateScreen_ICE = function(req, res){
	/*
	 * internal variables 
	 */
	var projectID, screenID, screenName,getScrapeData,scrapedObjects, modifiedBy, userInfo,appType, requestedversionnumber ,param;
	var updateData = req.body.scrapeObject; 
	projectID   = updateData.projectId;
	screenID   = updateData.screenId;
	screenName = updateData.screenName;
	userInfo   = updateData.userinfo;
	modifiedBy = userInfo.username;
	param      = updateData.param;
	appType    = updateData.appType;
	
	scrapedObjects={};
	// scrapedObjects = updateData.getScrapeData;
	//these value has to be modified later
	// var requestedskucodeScreens = req.body.skucodetestcase;
	var requestedskucodeScreens = "skucodetestcase";
	//var requestedtags = req.body.tags;
	var requestedtags = "tags";
	// var requestedversionnumber = req.body.versionnumber;
	var requestedversionnumber = 1;
	var requestscreenhistorydetails = "'updated screens action by " + userInfo.username + " having role:" + userInfo.role + "" +
					" skucodetestcase=" + requestedskucodeScreens + ", tags=" + requestedtags + ", versionnumber=" + requestedversionnumber+
					" with the service action="+param+" '";
	var dateScreen = new Date().getTime();
	var requestedScreenhistory =  dateScreen + ":" + requestscreenhistorydetails;
	var updateScreenQuery="";
	var statusFlag = "";
	if(param == "updateScrapeData_ICE"){	
		scrapedObjects = updateData.getScrapeData;
		// single quote is replaced with double single quote for scraped data
		scrapedObjects = JSON.stringify(scrapedObjects);
		scrapedObjects = scrapedObjects.replace(/'+/g,"''");
		var newParse;
		if(scrapedObjects !=null && scrapedObjects !='' && scrapedObjects != undefined){
			newParse = JSON.parse(scrapedObjects);
		}else{
			newParse=JSON.parse("{}");;
		}
			
		scrapedObjects=newParse;
		if(appType.toUpperCase() === 'WEBSERVICE'){
			scrapedObjects=JSON.parse(newParse);
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
								parseRequest(baseRequestBody);
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
								finalFunction(scrapedObjects);	
							}else{
								//JSON with view string empty
								updateScreenQuery=buildObject(scrapedObjects,modifiedBy,requestedskucodeScreens,requestedScreenhistory,screenID,projectID,screenName,requestedversionnumber);
								finalFunction(scrapedObjects);
							}
						}else{
							//JSON with view string empty
							updateScreenQuery=buildObject(scrapedObjects,modifiedBy,requestedskucodeScreens,requestedScreenhistory,screenID,projectID,screenName,requestedversionnumber);
							finalFunction(scrapedObjects);
						}
					}else{
						//JSON with view string empty
						updateScreenQuery=buildObject(scrapedObjects,modifiedBy,requestedskucodeScreens,requestedScreenhistory,screenID,projectID,screenName,requestedversionnumber);
						finalFunction(scrapedObjects);
					}
				}else{
					//JSON with view string empty
					updateScreenQuery=buildObject(scrapedObjects,modifiedBy,requestedskucodeScreens,requestedScreenhistory,screenID,projectID,screenName,requestedversionnumber);
					finalFunction(scrapedObjects);
				}
			}else{
				//JSON with view string empty
				updateScreenQuery=buildObject(scrapedObjects,modifiedBy,requestedskucodeScreens,requestedScreenhistory,screenID,projectID,screenName,requestedversionnumber);
				finalFunction(scrapedObjects);
			}
		}else{
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
								finalFunction(scrapedObjects);						
		// console.log(updateScreenQuery);
		}
	}else if(param == "editScrapeData_ICE"){
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
				var scrapedDataQuery="select screendata from screens where screenid="+screenID+
					" and projectid="+projectID+
					" and screenname = '"+screenName+
					"' and versionnumber = "+requestedversionnumber+
					" allow filtering ;";
				fetchScrapedData(scrapedDataQuery,function(err,scrapedobjects,querycallback){
					// console.log(err,scrapedobjects,);
					if(scrapedobjects ==null && scrapedobjects =='' && scrapedobjects == undefined){
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
										if((viewString[scrapedobjectindex].xpath == xpathListofCustName[elementsindex]) 
											&& (viewString[scrapedobjectindex].custname.trim() == oldCustNamesList[elementsindex].trim())){
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
							finalFunction(scrapedObjects);
						}else{
							statusFlag="All objects are not edited.";
							res.send(statusFlag);
						}
					}else{
						statusFlag="Error occured in updateScreenData : Fail";
						res.send(statusFlag);
					}
				});
				editcallback;
			}
		]);
		
	}else if(param == "deleteScrapeData_ICE"){
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
				var scrapedDataQuery="select screendata from screens where screenid="+screenID
					" and projectid="+projectID+
					" allow filtering ;";
				fetchScrapedData(scrapedDataQuery,function(err,scrapedobjects,querycallback){
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
									if((viewString[scrapedobjectindex].xpath == deleteXpathNames[elementsindex]) 
											&& (viewString[scrapedobjectindex].custname.trim() == deleteCustNames[elementsindex].trim())){
										if(elementschanged<deleteCustNames.length){
											//console.log(viewString[scrapedobjectindex].custname);
											deleteindex.push(scrapedobjectindex);
											elementschanged=elementschanged+1;
										}
									}
								}
							}
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

							//console.log(updateScreenQuery);

							finalFunction(scrapedObjects);	
						}else{
							statusFlag="All objects are not edited.";
							res.send(statusFlag);
						}
					}else{
						statusFlag="Error occured in updateScreenData : Fail";
						res.send(statusFlag);
					}
				});
				deletecallback;
			}
		]);
	}
	//console.log("scraped:",scrapedObjects);
	//this code will be called only if the statusFlag is empty.
	function finalFunction(scrapedObjects,finalcallback){

		if(statusFlag=="" && scrapedObjects != "scrape data error: Fail"){
			//console.log(updateScreenQuery);
			dbConn.execute(updateScreenQuery, function(err, result){
				if (err) {
					// console.log(err);
					statusFlag="Error occured in updateScreenData : Fail";
					// console.log(err);
					res.send(statusFlag);
				}else{
					if(param != 'updateScrapeData_ICE'){
						async.waterfall([
						function(testcasecallback){
							var testcaseDataQuery="select testcaseid,testcasename,testcasesteps from testcases where screenid="+screenID;
							var newCustnames,oldCustnames,xpathofCustnames;
							if(param == 'editScrapeData_ICE'){
								newCustnames=updateData.editedList.modifiedCustNames;
								oldCustnames=updateData.editedList.oldCustName;
								xpathofCustnames=updateData.editedList.xpathListofCustNames;
							}else{
								oldCustnames = updateData.deletedList.deletedCustName;
								xpathofCustnames = updateData.deletedList.deletedXpath;
							}
								dbConn.execute(testcaseDataQuery, function(testcaseDataQueryerr, testcaseDataQueryresult){
									if(testcaseDataQueryerr){
										statusFlag="Error occured in testcaseDataQuery : Fail";
										res.send(statusFlag);
									}else{
										if(testcaseDataQueryresult.rows.length>0){
											async.forEachSeries(testcaseDataQueryresult.rows,
											function(eachTestcase,testcaserendercallback){
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
																	if(testcasestep.custname.trim() == oldCustnames[updatingindex].trim()
																	&& testcasestep.objectName.trim() == xpathofCustnames[updatingindex].trim()){
																		if(param == 'editScrapeData_ICE'){
																			testcasestep.custname=newCustnames[updatingindex];
																		}else if (param == 'deleteScrapeData_ICE'){
																			testcasestep.stepNo=step;
																			deletingStepindex.push(eachtestcasestepindex);
																		}
																	}
																}
															}
														}
													}
													// console.log(deletingStepindex,updatingtestcasedata);
												if(param == 'deleteScrapeData_ICE'){
													deletingStepindex=deletingStepindex.sort();
													for(var deletingcaseindex=0;deletingcaseindex<deletingStepindex.length;deletingcaseindex++){
														delete updatingtestcasedata[deletingStepindex[deletingcaseindex]];
													}	
												//removing null values from the array JSON
												updatingtestcasedata =  updatingtestcasedata.filter(function(n){ return n != null });
												}
												updatingtestcasedata=JSON.stringify(updatingtestcasedata);
												updatingtestcasedata = updatingtestcasedata.replace(/'+/g,"''");
												var requesthistorydetails = "'updated testcase action by " + userInfo.username + " having role:" + userInfo.role + "" +
													" skucodetestcase=" + requestedskucodeScreens + ", tags=" + requestedtags + "," +
													" testcasesteps=" + updatingtestcasedata + ", versionnumber=" + requestedversionnumber+
													" with the service action="+param+" '";
												var date = new Date().getTime();
												var requestedhistory =  date + ":" + requesthistorydetails;
												if(updatingtestcasedata == "[]"){
													updatingtestcasedata = "";											
												}
												var updateTestCaseQuery = "UPDATE testcases SET modifiedby='" + userInfo.username +
													"', modifiedon='" + new Date().getTime() +
													"',  skucodetestcase='" + requestedskucodeScreens +
													"', history= history + { "+requestedhistory+" }" +
													",  testcasesteps='" + updatingtestcasedata + 
													"' where screenid=" + screenID + " and testcaseid=" + updatingTestcaseid + 
													" and testcasename='" + updatingtestcasename + 
													"' and versionnumber = "+requestedversionnumber+" IF EXISTS;";
												uploadTestCaseData(updateTestCaseQuery,function(error,response){
														res.send(response);
												});
											});
										}else{
											statusFlag = "success";
											res.send(statusFlag);
										}
									}
								});
								testcasecallback();
							}
						]);
					}else{
					statusFlag = "success";
					res.send(statusFlag);
					}
				}
			});
		}
		finalcallback;
	}
};


function buildObject(scrapedObjects,modifiedBy,requestedskucodeScreens,
	requestedScreenhistory,screenID,projectID,screenName,requestedversionnumber){
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
	return updateScreenQuery;
}

function parseRequest(readChild){
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
}


/**
 * generic function for DB to update the testcases table
 * @author vishvas.a
 */
function uploadTestCaseData(updateTestCasesQuery,uploadTestCaseDatacallback){
	var statusFlag="";
	dbConn.execute(updateTestCasesQuery, 
		function(updateTestCaseQueryerr, updateTestCaseQueryresult){
			if(updateTestCaseQueryerr){
				statusFlag="Error occured in updateTestCaseQuery : Fail";
				uploadTestCaseDatacallback(null,statusFlag);
			}else{
				statusFlag = "success";						
				uploadTestCaseDatacallback(null,statusFlag);
		}
	});
};



/**
* @author vishvas.a
* @modified author sunil.revankar
* readTestCase_ICE service is used to fetch the testcase data
*/
exports.readTestCase_ICE = function (req, res) {
	//base output elements
	var testcasesteps = "";
	var testcasename = "";
	var template = "";
	// base request elements
	var requestedscreenid = req.body.screenid;
	var requestedtestscasename=req.body.testcasename;
	var requestedtestscaseid = req.body.testcaseid;
	// var requestedversionnumber = req.body.versionnumber;
	 var requestedversionnumber = 1;
	//complete response data
	var responsedata = {
		template: "",
		testcase: "",
		testcasename: ""
	};
	//Query 1 fetching the testcasesteps from the test cases based on requested screenid,testcasename,testcaseid
	var getTestCases = "select testcasesteps,testcasename from testcases where screenid= " + requestedscreenid +
					" and testcasename='"+requestedtestscasename+"'" +
					" and versionnumber="+requestedversionnumber+
		" and testcaseid=" + requestedtestscaseid;
	dbConn.execute(getTestCases, function (err, result) {
		if (err) {
			var flag = "Error in readTestCase_ICE : Fail";
			res.send(flag);
		} else {
			for (var i = 0; i < result.rows.length; i++) {
				testcasesteps = result.rows[i].testcasesteps;
				testcasename = result.rows[i].testcasename;
			}
			if ((testcasesteps == "" || testcasesteps == null) && testcasename != "") {
				responsedata = { template: "", testcase: "[]", testcasename: testcasename }
				res.send(responsedata);
			} else if ((testcasesteps == "" || testcasesteps == null) && testcasename == "") {
				responsedata = { template: "", testcase: "[]", testcasename: "" }
				res.send(responsedata);
			} else {
				//only web related logic is handledWeb Service related logic is pending
				responsedata.template = template;
				responsedata.testcase = testcasesteps;
				responsedata.testcasename = testcasename;
				res.send(responsedata);
			}
		}
	})
};

/**
* @author vishvas.a
* @modified author sunil.revankar
* updateTestCase_ICE service is used to save testcase data
*/
exports.updateTestCase_ICE = function (req, res) {
	/*
	 *internal variables 
	 */
	var hasrow = false;
	/*
	 * base request elements
	 */
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
	var requesthistorydetails = "'updated testcase action by " + userinfo.username + " having role:" + userinfo.role + "" +
		" skucodetestcase=" + requestedskucodetestcase + ", tags=" + requestedtags + "," +
		" testcasesteps=" + historyRemarks + ", versionnumber=" + requestedversionnumber+" '";
	var date = new Date().getTime();
	var requestedhistory =  date + ":" + requesthistorydetails;
	/*
	 * Query 1 checking whether the testcaseid belongs to the same screen
	 * based on requested screenid,testcasename,testcaseid and testcasesteps
	 */
	var checktestcaseexist = "select testcaseid from testcases where screenid=" + requestedscreenid;

	dbConn.execute(checktestcaseexist, function (err, result) {
		if (err) {
			var flag = "Error in Query 1 testcaseexist: Fail";
			res.send(flag);
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
				var updateTestCaseData = "UPDATE testcases SET modifiedby='" + userinfo.username +
					"', modifiedon='" + new Date().getTime() +
					"',  skucodetestcase='" + requestedskucodetestcase +
					"', history= history + { "+requestedhistory+" }" +
					",  testcasesteps='" + requestedtestcasesteps + "'"+
					" where versionnumber = "+requestedversionnumber+" and screenid=" + requestedscreenid + " and testcaseid=" + requestedtestcaseid + " and testcasename='" + requestedtestcasename + "' IF EXISTS;";
					uploadTestCaseData(updateTestCaseData,function(error,response){
						res.send(response);
					});
			}
		}
	});
	/*
	 * Query 2 updating the testcasesteps
	 * based on requested screenid,testcasename,testcaseid and testcasesteps
	 */
};

/**
* @author vishvas.a
* @modified author sunil.revankar
* debugTestCase_ICE service is used to debug the testcase
*/
/**
* @author vishvas.a
* @modified author sunil.revankar
* debugTestCase_ICE service is used to debug the testcase
*/
exports.debugTestCase_ICE = function (req, res) {
	var action=req.body.param;
	if(action == 'debugTestCase_ICE'){
		var requestedbrowsertypes = req.body.browsertypes;
		var requestedtestcaseids = req.body.testcaseids;
		var responsedata = [];
		var responseobject = {
			template: "",
			testcasename: "",
			testcase: []
		};
		var browsertypeobject = { browsertype: requestedbrowsertypes };
		var flag = "";
		for (var indexes = 0; indexes < requestedtestcaseids.length; indexes++) {
			var getProjectTestcasedata = "select testcasename,testcasesteps from testcases where testcaseid=" + requestedtestcaseids[indexes];
			dbConn.execute(getProjectTestcasedata, function (errgetTestcasedata, testcasedataresult) {
				if (errgetTestcasedata) {
					flag = "Error in getProjectTestcasedata : Fail";
					res.send(flag);
				} else {
					for (var ids = 0; ids < testcasedataresult.rows.length; ids++) {
						responseobject.testcase = testcasedataresult.rows[ids].testcasesteps;
						responseobject.template = "";
						responseobject.testcasename = testcasedataresult.rows[ids].testcasename;
						responsedata.push(responseobject);
					}
					responsedata.push(browsertypeobject);
					var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
					if('allSocketsMap' in myserver && ip in myserver.allSocketsMap){
						var mySocket = myserver.allSocketsMap[ip];
						mySocket._events.result_debugTestCase = [];
						mySocket.emit('debugTestCase',responsedata);
						mySocket.on('result_debugTestCase', function (responsedata) {
							res.send("success");
						});
					}else{
						console.log("Socket not Available");
						res.send("fail");
					}
				}

			});
		}
	}else if(action == 'debugTestCaseWS_ICE'){
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		if('allSocketsMap' in myserver && ip in myserver.allSocketsMap){
			// res.send("success");
			var mySocket = myserver.allSocketsMap[ip];
			mySocket._events.result_debugTestCase = [];
			var testcaseWS=JSON.stringify(req.body.testCaseWS)
			mySocket.emit('debugTestCaseWS',testcaseWS);
			mySocket.on('result_debugTestCaseWS', function (testcaseWS) {
				res.send("success");
			});
			console.log("initWSJson::::::::::", JSON.stringify(req.body.testCaseWS));
			res.send(req.body.testCaseWS);
		}else{
			console.log("Socket not Available");
			res.send("fail");
		}
	}
};



/**
* getKeywordDetails_ICE for fetching the objects,keywords 
* based on projecttype sent by front end
* @author vishvas.a
*/
exports.getKeywordDetails_ICE = function getKeywordDetails_ICE(req, res) {
	// request variables
	var requestedprojecttypename = req.body.projecttypename;
	//var requestedprojecttypename = "Web";
	// Query 1 fetching the objecttype,keywords based on projecttypename
	var individualsyntax = {};

	var flag = "Error in errProjectBasedKeywords : Fail";
	var getProjectBasedKeywords = "select objecttype, keywords from keywords where projecttypename in ('"
			+ requestedprojecttypename + "','Generic') ALLOW FILTERING";
	dbConn.execute(getProjectBasedKeywords,
		function(errProjectBasedKeywords,projectBasedKeywordsresult) {
			if (errProjectBasedKeywords) {
				flag = "Error in errProjectBasedKeywords : Fail";
				res.send(flag);
			} else {
				for (var objectindex = 0; objectindex < projectBasedKeywordsresult.rows.length; objectindex++) {
					var objecttype = projectBasedKeywordsresult.rows[objectindex].objecttype;
					var keywords = projectBasedKeywordsresult.rows[objectindex].keywords;
					individualsyntax[objecttype] = keywords;
				}
			res.send(individualsyntax);
			}
		});
};
