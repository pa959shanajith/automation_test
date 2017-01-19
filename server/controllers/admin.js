/**
* Dependencies.
*/
var Joi = require('joi');
var client_cas = require('../../server/config/cassandra');
var cassandra = require('cassandra-driver');
var cb = require('callback');
var adminDAO = require('../dao/adminDAO');

//DAO Calls from Hapi controllers
module.exports = {
  getUserRoles_Nineteen68: {
    handler: function (request, reply) {
      adminDAO.getUserRoles_Nineteen68(request, function (err, data) {
        if (err) { console.log(err); }
        return reply(data);
      });
    },
    app: {
      name: 'getUserRoles_Nineteen68'
    }
  },
   createUser_Nineteen68: {
    handler: function (request, reply) {
      adminDAO.createUser_Nineteen68(request, function (err, data) {
        if (err) { console.log(err); }
        return reply(data);
      });
    },
    app: {
      name: 'createUser_Nineteen68'
    }
  },

};