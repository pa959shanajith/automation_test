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
        reqScrapJson.appType = "Web";
        reqScrapJson.action =  "SCRAPE"
        var data = "OPEN BROWSER CH";
        var ip = req.headers['x-forwarded-for'] || req.info.remoteAddress;
        var mySocket =  myserver.allSocketsMap[ip];
        mySocket.send(data);
        mySocket.on('message', function(data){
   	      cb(null, data);
       });
},

deleteScrapeObjects_ICE: function deleteScrapeObjects_ICE(req, cb, data) {

},

};