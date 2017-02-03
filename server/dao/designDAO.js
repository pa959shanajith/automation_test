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
//	  console.log("-----------------------------------------")
//	  //console.log(focusParam);
//	  console.log("-----------------------------------------")
//	  mySocket.on('highlight', function(data){
//		  console.log("HIGHLIGHT FEATURE");
//		  console.log("res", data);
// 	        cb(null, data);
//     });
	  //callback success on highlight
},
updateScrapeData_ICE : function updateScrapeData_ICE(req, cb, data){
    var appType = req.payload.appType;
    var scrapedJSON = JSON.stringify(req.payload.getScrapeData);
    var flag = "fail";
    var userInfo =  req.payload.userInfo;
    var moduleID, screenID, modifiedBy;
    moduleID = req.payload.moduleId;
    screenID = req.payload.screenId;
    screenName = req.payload.screenName;
    modifiedBy = userInfo.firstname + " " + userInfo.lastname;
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
},
deleteScrapeObjects_ICE: function deleteScrapeObjects_ICE(req, cb, data) {

},
getScrapeDataScreenLevel_ICE : function getScrapeDataScreenLevel_ICE(req, cb, data) {
	  var scrapeData = {};
	  var getScrapeData = "select screendata from screens where screenid ="
			+ req.payload.screenId + " allow filtering  ";
	  console.log("query", getScrapeData);
	  dbConnICE.execute(getScrapeData, function(err, result){
		  if (err) {
              console.log("getScrapeDataScreenLevel=============",err);
          	  cb(null, flag);
          }
		  else{
              // console.log("result",result);
              for (var i = 0; i < result.rows.length; i++) {
            	  scrapeData.scrapeObj = result.rows[i].screendata
            	  cb(null, scrapeData)
                  //scrapeData.scarpedObj = 
              }
       }
	  });
	
},
};