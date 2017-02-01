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

deleteScrapeObjects_ICE: function deleteScrapeObjects_ICE(req, cb, data) {

},

};