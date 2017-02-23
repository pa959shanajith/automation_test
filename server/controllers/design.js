/**
 * Dependencies.
 */
var Joi = require('joi');
var dbConn = require('../../server/config/icetestautomation');
var cassandra = require('cassandra-driver');
var myserver = require('../../server.js');
var async = require('async');
/**
 * @author vinay.niranjan
 * @modified author vinay.niranjan
 * the service is used to init scraping & fetch scrape objects 
 */
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
	var responsedata;

	var getScrapeDataQuery = "select screendata from screens where screenid ="
				+ req.body.screenId + " allow filtering  ";
	dbConn.execute(getScrapeDataQuery, function(getScrapeDataQueryerr, getScrapeDataQueryresult){
		if (getScrapeDataQueryerr) {
			//console.log("scrape data error: Fail",getScrapeDataQueryerr);
			flag="getScrapeData Fail.";
			res.send(flag);
		}else{
			for (var i = 0; i < getScrapeDataQueryresult.rows.length; i++) {
				responsedata = getScrapeDataQueryresult.rows[i].screendata;
			}
			res.send(responsedata);
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
	var moduleID, screenID, screenName,getScrapeData,scrapedObjects, modifiedBy, userInfo, param;
	var updateData = req.body.scrapeObject; 
	moduleID   = updateData.moduleId;
	screenID   = updateData.screenId;
	screenName = updateData.screenName;
	userInfo   = updateData.userinfo;
	modifiedBy = userInfo.username;
	param      = updateData.param;
	scrapedObjects = updateData.getScrapeData;
	var updateScreenQuery="";
	var statusFlag = "";
	/*
	* single quote is replaced with double single quote for scraped data
	*/
	scrapedObjects = JSON.stringify(scrapedObjects);
	scrapedObjects = scrapedObjects.replace(/'+/g,"''");
	var newParse = JSON.parse(scrapedObjects);
	scrapedObjects=newParse;
	if(param == "updateScrapeData_ICE"){		
		updateScreenQuery = "update icetestautomation.screens set"+
							" screendata ='"+ scrapedObjects +"',"+
							" modifiedby ='" + modifiedBy + "',"+
							" modifiedon = '" + new Date().getTime()+ "'"+
							" where screenid = "+screenID+
							" and moduleid ="+moduleID+
							" and screenname ='" + screenName +
							"' IF EXISTS; "
		//console.log(updateScreenQuery);
	}else if(param == "editScrapeData_ICE"){
		/*
		* @author vishvas.a
		* editing of the scraped data
		* based on the changed custom names
		* data used : old custom names, new custom names and xpath. 
		*/
		//this viewString is an array of scraped objects
		var viewString = updateData.getScrapeData.view;
		var oldCustNamesList = updateData.editedList.oldCustName; 
		for(i=0;i<oldCustNamesList.length;i++)
		{
			oldCustNamesList[i] = oldCustNamesList[i].replace(/&amp;/g, '&');
		} 
		var newCustNamesList = updateData.editedList.modifiedCustNames;
		var xpathListofCustName = updateData.editedList.xpathListofCustNames;
		var elementschanged = 0;
		async.series([
			function(callback){
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
				scrapedObjects.view=viewString;
				callback(null,scrapedObjects);
			}
		]);
		//the query here will be called only if ALL objects are identified.
		if(elementschanged <= newCustNamesList.length){
			scrapedObjects=JSON.stringify(scrapedObjects);
			scrapedObjects = scrapedObjects.replace(/'+/g,"''");
			updateScreenQuery = "update icetestautomation.screens set"+
								" screendata ='"+ scrapedObjects +"',"+
								" modifiedby ='" + modifiedBy + "',"+
								" modifiedon = '" + new Date().getTime()+ "'"+
								" where screenid = "+screenID+
								" and moduleid ="+moduleID+
								" and screenname ='" + screenName +
								"' IF EXISTS; "
		}else{
			statusFlag="All objects are not edited.";
			cb(null,statusFlag);
		}
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
		var viewString = updateData.getScrapeData.view;
		var deleteindex=[];
		async.series([
			function(callback){
				if(viewString.length == deleteXpathNames.length){
					deleteAll=true;
					viewString=[];
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
				callback(null,scrapedObjects);
			}
		]);
		//this query will be called only if ALL objects are identified.
		if(elementschanged<=deleteXpathNames.length){
			scrapedObjects=JSON.stringify(scrapedObjects);
			scrapedObjects = scrapedObjects.replace(/'+/g,"''");
			updateScreenQuery = "update icetestautomation.screens set"+
								" screendata ='"+ scrapedObjects +"',"+
								" modifiedby ='" + modifiedBy + "',"+
								" modifiedon = '" + new Date().getTime()+ "'"+
								" where screenid = "+screenID+
								" and moduleid ="+moduleID+
								" and screenname ='" + screenName +
								"' IF EXISTS; "
		}else{
			statusFlag="All objects are not edited.";
			res.send(statusFlag);
		}
	}
	//console.log("scraped:",scrapedObjects);
	//this code will be called only if the statusFlag is empty.
	if(statusFlag=="" && scrapedObjects != "scrape data error: Fail"){
		// console.log(updateScreenQuery);
		dbConn.execute(updateScreenQuery, function(err, result){
			if (err) {
				// console.log(err);
				statusFlag="Error occured in updateScreenData : Fail";
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
										var updatingtestcasedata=JSON.parse(eachTestcase.testcasesteps);
										var updatingtestcasename=eachTestcase.testcasename;
										//replacing/deleting all the custnames based on xpath and old custnames
										var deletingStepindex=[]; 
										for(var updatingindex=0;updatingindex<oldCustnames.length;updatingindex++){
											for(var eachtestcasestepindex=0;eachtestcasestepindex<updatingtestcasedata.length;eachtestcasestepindex++){
												var testcasestep=updatingtestcasedata[eachtestcasestepindex];
												var step = eachtestcasestepindex + 1;
												// console.log(testcasestep);
												if('custname' in testcasestep && 'objectName' in testcasestep){
													// console.log((testcasestep.custname == oldCustnames[updatingindex]
													// && testcasestep.objectName == xpathofCustnames[updatingindex]));
													if(testcasestep.custname.trim() == oldCustnames[updatingindex].trim()
													&& testcasestep.objectName == xpathofCustnames[updatingindex]){
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
										var updateTestCaseQuery="update testcases set testcasesteps='"+updatingtestcasedata+"'"+
											" where screenid="+screenID+
											" and testcasename = '"+updatingtestcasename+"'"+
											" and testcaseid="+updatingTestcaseid;
										dbConn.execute(updateTestCaseQuery, function(updateTestCaseQueryerr, updateTestCaseQueryresult){
											if(updateTestCaseQueryerr){
												statusFlag="Error occured in updateTestCaseQuery : Fail";
												res.send(statusFlag);
											}else{
												statusFlag = "success";						
												res.send(statusFlag);
											}
										});
									});
									}
									else{
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
	//complete response data
	var responsedata = {
		template: "",
		testcase: "",
		testcasename: ""
	};
	//Query 1 fetching the testcasesteps from the test cases based on requested screenid,testcasename,testcaseid
	var getTestCases = "select testcasesteps,testcasename from testcases where screenid= " + requestedscreenid +
					" and testcasename='"+requestedtestscasename+"' " +
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
	var requestedtestcasesteps = req.body.testcasesteps;
	var historyRemarks = JSON.parse(req.body.testcasesteps);
	var updatedTestSteps = JSON.parse(req.body.testcasesteps);
	historyRemarks = JSON.stringify(historyRemarks);
	var userinfo = req.body.userinfo;
	//these value has to be modified later
	var requestedskucodetestcase = req.body.skucodetestcase;
	var requestedtags = req.body.tags;
	var requestedversionnumber = req.body.versionnumber;
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
				updatedTestSteps = JSON.stringify(updatedTestSteps);
				var updateTestCaseData = "UPDATE testcases SET modifiedby='" + userinfo.username +
					"', modifiedon=" + new Date().getTime() +
					",  skucodetestcase='" + requestedskucodetestcase +
					"', history= history + { "+requestedhistory+" }" +
					",  testcasesteps='" + updatedTestSteps + "', versionnumber=" + requestedversionnumber +
					" where screenid=" + requestedscreenid + " and testcaseid=" + requestedtestcaseid + " and testcasename='" + requestedtestcasename + "' IF EXISTS;";
				  //console.log("upQuery", updateTestCaseData);
				 dbConn.execute(updateTestCaseData, function (err, result) {
					if (err) {
//						console.log(err)
						var flag = "Error in Query 1 updateTestCaseData: Fail";
						res.send(flag);
					} else {
						var flag = "success";
						res.send(flag);
					}
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
exports.debugTestCase_ICE = function (req, res) {
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
				var mySocket = myserver.allSocketsMap[ip];
				mySocket._events.result_debugTestCase = [];
				mySocket.emit('debugTestCase',responsedata);
				mySocket.on('result_debugTestCase', function (responsedata) {
					res.send("success");
				});
			}
		});
	}
};