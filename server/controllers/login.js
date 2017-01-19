/**
* Dependencies.
*/
var Joi = require('joi');
var client_cas = require('../../server/config/cassandra');
var cassandra = require('cassandra-driver');
var cb = require('callback');
var loginDAO = require('../dao/loginDAO');

//DAO Calls from Hapi controllers
module.exports = {
  authenticateUser_Nineteen68: {
    handler: function (req, reply) {
      loginDAO.authenticateUser_Nineteen68(req, function (err, data) {
        if (err) { console.log(err); }
        return reply(data);
      });
    },
    app: {
      name: 'authenticateUser_Nineteen68'
    }
  },
  loadUserInfo_Nineteen68: {
    handler: function (req, reply) {
      loginDAO.loadUserInfo_Nineteen68(req, function (err, data) {
        if (err) { console.log(err); }
        return reply(data);
      });
    },
    app: {
      name: 'loadUserInfo_Nineteen68'
    }
  },
   getRoleNameByRoleId_Nineteen68: {
    handler: function (req, reply) {
      loginDAO.getRoleNameByRoleId_Nineteen68(req, function (err, data) {
        if (err) { console.log(err); }
        return reply(data);
      });
    },
    app: {
      name: 'getRoleNameByRoleId_Nineteen68'
    }
  }
};