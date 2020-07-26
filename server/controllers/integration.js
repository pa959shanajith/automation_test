/**
 * Dependencies.
 */
var async = require('async');
var myserver = require('../lib/socket');
var epurl = process.env.NDAC_URL;
var Client = require("node-rest-client").Client;
var client = new Client();
var sessionExtend = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
var validator = require('validator');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var utils = require('../lib/utils');

