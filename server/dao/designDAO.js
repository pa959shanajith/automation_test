/**
* Dependencies.
*/
var Hapi = require('hapi');
var Joi = require('joi');
var dbConnICE = require('../../server/config/icetestautomation');
var cassandra = require('cassandra-driver');
var cb = require('callback');
var fs = require('fs');

//var socketio  = require('socket.io');
//var server = new Hapi.Server();
//io = socketio.listen(3000);

module.exports = {

initScraping_ICE: function initScraping_ICE(req, cb, data) {
	 //var browserType = req.payload.browserType;
	fs.readFile('D://GITNew/ui/server/config/scrapeData.json','utf8', (err, data) => {
		  if (err) throw err;
		  cb(null, data);
		});  
},

deleteScrapeObjects_ICE: function deleteScrapeObjects_ICE(req, cb, data) {

},

};