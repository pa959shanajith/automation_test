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
		
		updateScrapeData_ICE:{
			handler: function(req, reply){
				designDAO.updateScrapeData_ICE(req, function(err, data){
					if(err)       { console.log(err); }
					return reply(data);
				})
			},
			app: {
				name: 'updateScrapeData_ICE'
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
		}

};