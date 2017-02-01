/**
* Dependencies.
*/
var Joi = require('joi');
var dbConn = require('../../server/config/icetestautomation');
var cassandra = require('cassandra-driver');
var cb = require('callback');
var designDAO = require('../dao/designDAO');

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
		
};