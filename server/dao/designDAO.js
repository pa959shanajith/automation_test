/**
* Dependencies.
*/
var Hapi = require('hapi');
var Joi = require('joi');
var dbConnICE = require('../../server/config/icetestautomation');
var cassandra = require('cassandra-driver');
var cb = require('callback');
var fs = require('fs');
var myserver = require('../../server.js');
var in_array = require('in_array');

var reqScrapJson =  {};
module.exports = {
	
initScraping_ICE: function initScraping_ICE(req, cb, data) {
        var browserType = req.payload.browserType;
        //console.log(browserType);
        reqScrapJson.appType = "Web";
        reqScrapJson.action =  "SCRAPE"
        if(browserType == "chrome")
        {
           var data = "OPEN BROWSER CH";
        }
        else if(browserType == "ie")
        {
           var data = "OPEN BROWSER IE";
        }
        else if(browserType == "mozilla")
        {
            var data = "OPEN BROWSER FX";
        }
        var ip = req.headers['x-forwarded-for'] || req.info.remoteAddress;
        var mySocket =  myserver.allSocketsMap[ip];
        mySocket.send(data);
        mySocket.on('message', function(data){
   	        cb(null, data);
       });
},

highlightScrapElement_ICE: function highlightScrapElement_ICE(req, cb, data) {
	var focusParam = req.payload.elementXpath+","+req.payload.elementUrl;
	  var ip = req.headers['x-forwarded-for'] || req.info.remoteAddress;
	  
	  var mySocket =  myserver.allSocketsMap[ip];
	  mySocket.emit("focus", focusParam);
	  var flag = 'success';
	  cb(null, flag);
},
updateScrapeData_ICE : function updateScrapeData_ICE(req, cb, data){


	
	var updateData = req.payload.scrapeObject;
	var param = updateData.param;
    
	if(param == "updateScrapeData_ICE")
	{

		var appType = updateData.appType;
	    var scrapedJSON = JSON.stringify(updateData.getScrapeData);
	    var flag = "fail";
	    var userInfo =  updateData.userinfo;
	    var moduleID, screenID, modifiedBy;
	    moduleID = updateData.moduleId;
	    screenID = updateData.screenId;
	    screenName = updateData.screenName;
	    modifiedBy = userInfo.username;
		
		
		var updateScreenData = "update icetestautomation.screens set screendata='"
	          + scrapedJSON + "', modifiedby ='" + modifiedBy + "', modifiedon = '" + new Date().getTime() 
	          + "' where screenid= "+screenID+" and moduleid ="+moduleID+" and screenName ='" + screenName +"';"
	    dbConnICE.execute(updateScreenData, function(err, result){
	          if (err) {
	                 console.log("updateScreenData=============",err);
	      cb(null, flag);
	  }
	          else{
	                 flag = "success";
	                 cb(null, flag);
	          }
	    });
	}
	else if(param == "deleteScrapeData_ICE")
	{
		
		    var flag = "fail";
		    var userInfo =  updateData.userinfo;
		    var moduleID, screenID, modifiedBy;
		    moduleID = updateData.moduleId;
		    screenID = updateData.screenId;
		    screenName = updateData.screenName;
		    modifiedBy = userInfo.username;
		
			var delObjects = updateData.deletedObjectsList;
			var delCust;
			var deletedRes = [];
			var deletedCustName = [];
			var deletedCustPath = [];
			var deletedJson = [];
			var finalJson = [];
			var scrapedJsonArray = [];
			var scrapedJsonObject ={};
		
		for(var d=0;d<delObjects.length;d++)
		{
			delCust = delObjects[d].split("!");
			deletedRes.push(delCust);
		}
		 for(var k= 0;k<deletedRes.length;k++)
			{
			        deletedCustName.push(deletedRes[k][0]);
			        deletedCustPath.push(deletedRes[k][1]);
			}
		var allObjects = {};
		var allObjectsView;
		//console.log("delObjects", delObjects);
		
		var screenQuery = "select screendata from icetestautomation.screens where screenid= " + screenID + ";";
		dbConnICE.execute(screenQuery, function(err, result){
			console.log("Result", result.rows);
			//cb(null, result.rows);
			 for (var i = 0; i < result.rows.length; i++) {
				
			 }
//			 for (var i = 0; i < result.rows.length; i++) {
//				  allObjects = result.rows[i].screendata;
//				  allObjects = JSON.parse(JSON.parse(allObjects));
//				  for(var j=0; j < allObjects[0].view.length; j++)
//				   {
//					   allObjectsView = allObjects[0].view[j];
//					   custname  = allObjectsView.custname;
//					   xpath = allObjectsView.xpath;
//					   if( (in_array(custname,deletedCustName)) && (in_array(xpath,deletedCustPath)) )
//						   {
//					            console.log(j);
//						        console.log("____________________________________________________________________TRUE");
//						        flag = true;
//						        deletedJson.push(allObjectsView)
//						        console.log( allObjects[0].view[j]);
//						        delete allObjects[0].view[j];
//						   }
//				   console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
//				   }
//				  console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
//              }
		     scrapedJsonArray.push(allObjects[0]);
		     scrapedJsonArray.push(updateData.mirror);
			 scrapedJsonArray.push(updateData.scrapetype);
			 scrapedJsonArray = JSON.stringify(scrapedJsonArray);
			 var updateScreenData = "update icetestautomation.screens set screendata='"
		          + scrapedJsonArray + "', modifiedby ='" + modifiedBy + "', modifiedon = '" + new Date().getTime() 
		          + "' where screenid= "+screenID+" and moduleid ="+moduleID+" and screenName ='" + screenName +"';"

		    dbConnICE.execute(updateScreenData, function(err, result){
		          if (err) {
		                 console.log("updateScreenData=============",err);
		                 cb(null, flag);
		  }
		          else{
		                 flag = "success";
		                 //cb(null, flag);
		          }
		    });
			//cb(null, scrapedJsonArray)
		});
	}    
},
getScrapeDataScreenLevel_ICE : function getScrapeDataScreenLevel_ICE(req, cb, data) {
	  var scrapeData = {};
	  var getScrapeData = "select screendata from screens where screenid ="
			+ req.payload.screenId + " allow filtering  ";
	  console.log("select", req.payload.screenId);
	  dbConnICE.execute(getScrapeData, function(err, result){
		  if (err) {
              console.log("getScrapeDataScreenLevel=============",err);
          	  cb(null, flag);
          }
		  else{
              for (var i = 0; i < result.rows.length; i++) {
            	  scrapeData.scrapeObj = result.rows[i].screendata
            	  cb(null, scrapeData) 
              }
       }
	  });
	
}

};