/**
* Dependencies.
*/
var Joi = require('joi');
var dbConnICE = require('../../server/config/icetestautomation');
var cassandra = require('cassandra-driver');
var cb = require('callback');
var fs = require('fs');
//var io = require('socket.io-client');


module.exports = {

initScraping_ICE: function initScraping_ICE(req, cb, data) {
	 //var browserType = req.payload.browserType;
	 //var socket = io.connect("http://10.40.31.41:8000", { query: "browserType="+browserType+"" });
	 //console.log(socket);
	fs.readFile('D:/Nineteen68.git/server/config/scrapeData.json','utf8', (err, data) => {
		  if (err) throw err;
		  console.log(data);
		  cb(null, data);
		});  
}

};