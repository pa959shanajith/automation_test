/**
 * Dependencies.
 */
var Joi = require('joi');
var dbConn = require('../../server/config/icetestautomation');
var cassandra = require('cassandra-driver');
var cb = require('callback');
var designDAO = require('../dao/designDAO');
var myserver = require('../../server.js');
module.exports = {
		initScraping_ICE: {
			handler: function (req, reply) {
				designDAO.initScraping_ICE(req, function (err, data) {
					if (err) { console.log(err); }
					return reply(data);
				});
			},
			app: {
				name: 'initScraping_ICE'
			}
		},

		highlightScrapElement_ICE: {
			handler: function (req, reply) {
				designDAO.highlightScrapElement_ICE(req, function (err, data) {
					if (err) { console.log(err); }
					return reply(data);
				});
			},
			app: {
				name: 'highlightScrapElement_ICE'
			}

		},
		
		updateScreen_ICE:{
			handler: function(req, reply){
				designDAO.updateScreen_ICE(req, function(err, data){
					if(err)       { console.log(err); }
					return reply(data);
				})
			},
			app: {
				name: 'updateScreen_ICE'
			}
		},

		deleteScrapeObjects_ICE: {
			handler: function (req, reply) {
				designDAO.deleteScrapeObjects_ICE(req, function (err, data) {
					if (err) { console.log(err); }
					return reply(data);
				});
			},
			app: {
				name: 'deleteScrapeObjects_ICE'
			}
		},
		
		getScrapeDataScreenLevel_ICE : {
			handler: function (req, reply) {
				designDAO.getScrapeDataScreenLevel_ICE(req, function (err, data) {
					if (err) { console.log(err); }
					return reply(data);
				});
			},
			app: {
				name: 'getScrapeDataScreenLevel_ICE'
			}
		},
		/**
		 * @author vishvas.a
		 * @service readTestCase_ICE
		 * reading TestCase data from icetestautomation keyspace
		 */
		readTestCase_ICE:{
			handler: function (req, reply) {
				designDAO.readTestCase_ICE(req, function (err, data) {
					if (err) { console.log(err); }
					return reply(data);
				});
			},
			app: {
				name: 'readTestCase_ICE'
			}
		},

		/**
		 * @author vishvas.a
		 * @service updateTestCase_ICE
		 * update TestCase data from icetestautomation keyspace
		 */
		updateTestCase_ICE:{
			handler: function (req, reply) {
				designDAO.updateTestCase_ICE(req, function (err, data) {
					if (err) { console.log(err); }
					return reply(data);
				});
			},
			app: {
				name: 'updateTestCase_ICE'
			}
		},
		
		//Debug Testcase
		debugTestCase_ICE : {
			handler: function (req, reply) {
				// var requestedbrowsertypes=req.payload.browsertypes;
				var requestfordebug=[]
				designDAO.debugTestCase_ICE(req,function (err,data) {
					if(err.length != 0){
						return reply(err);
					}else{
						if(data.length==1){
							err="yes its DB time out"; 
							return reply(err);
						}else{
							requestfordebug=data;
							var ip = req.headers['x-forwarded-for'] || req.info.remoteAddress;
							var mySocket =  myserver.allSocketsMap[ip];
							var dataarray=[];
							
//							dataarray.push(data);
//							dataarray.push(requestfordebug);
//							mySocket.send(data,requestfordebug);
							
							mySocket.emit('debugTestCase',requestfordebug);
							mySocket.on('result_debugTestCase', function(requestfordebug){
								
								console.log("this is the value:",requestfordebug);
								return reply("success");
							});
//							mySocket.emit('debugTestCase',requestfordebug);
//							mySocket.on('debugTestCase', function(cb,requestfordebug){
//								cb(null, data);
//							});
//							cb(null, requestfordebug);
							//return reply("success");
						}
					}
				});
			},
			app: {
				name: 'debugTestCase_ICE'
			}
		}

};