var logger = require('../../logger');
//SOCKET CONNECTION USING SOCKET.IO
var allClients = [];
var socketMap = {};
var socketMapUI = {};
var sokcetMapScheduling = {};
var socketMapNotify = {};
var isUISocketRequest = false;

var myserver = require('./../../server.js');
var httpsServer = myserver.httpsServer;
var io = require('socket.io')(httpsServer);
var notificationMsg = require('./../notifications/notifyMessages.js');

var Client = require("node-rest-client").Client;
var apiclient = new Client();

var uiConfig = require('./../config/options');
var screenShotPath = uiConfig.storageConfig.screenShotPath;

io.on('connection', function (socket) {
  logger.info("Inside Socket connection");
  // console.log("-------------------------------------------------------------------------------------------------------");
  var ip = socket.request.connection.remoteAddress || socket.request.headers['x-forwarded-for'];
  logger.info("Normal Mode Enabled for  IP : %s", ip);
  var address = socket.handshake.query['username'];

  var icesession = socket.handshake.query['icesession'];
  logger.info("Socket connecting address %s", address);
  logger.info('Param %s', socket.handshake.query['username']);
  //console.log("middleware:", socket.request._query['check']);

  if (socket.request._query['check'] == "true") {
    logger.info("Inside UI Socket Connection");
    //  if ( !(address in socketMapUI) ) {
    isUISocketRequest = true;
    logger.info("socket request from UI");
    address = socket.request._query['username'];
    socketMapUI[address] = socket;
    socket.emit("connectionAck", "Success");
  }
  else if (socket.request._query['check'] == "notify") {
    address = socket.request._query['username'];
    socketMapNotify[address] = socket;

    //Broadcast Message
    var broadcastTo = ['/admin', '/plugin', '/design', '/designTestCase', '/execute', '/scheduling', '/specificreports', '/home', '/p_Utility', '/p_Reports', 'p_Weboccular', '/neuronGraphs2D', '/p_ALM'];
    notificationMsg.to = broadcastTo;
    notificationMsg.notifyMsg = 'Server Maintenance Scheduled';
    var soc = socketMapNotify[address];
    // soc.emit("notify",notificationMsg);
  }
  else {

    isUISocketRequest = false;
    var inputs = {
      "icesession": icesession,
      "query": 'connect'
    };
    var args = {
      data: inputs,
      headers: {
        "Content-Type": "application/json"
      }
    };
    logger.info("Calling NDAC Service: updateActiveIceSessions");
    apiclient.post("http://127.0.0.1:1990/server/updateActiveIceSessions", args,
      function (result, response) {
        if (response.statusCode != 200) {
          logger.error("Error occured in updateActiveIceSessions Error Code: ERRNDAC");
        }
        else {
          socket.send('checkConnection', result['ice_check']);
          if (result['node_check']) {
            if (!(address in socketMap)) {
              socketMap[address] = socket;
              socket.send('connected');
              logger.info("NO. OF CLIENTS CONNECTED: %d", Object.keys(socketMap).length);
              logger.info("IP\'s connected :' %s", Object.keys(socketMap).join());
              socket.emit('update_screenshot_path', screenShotPath);
            }
            else {
              socket.send('connectionExists');
            }
          }
        }
      });

  }
  module.exports.allSocketsMap = socketMap;
  module.exports.allSocketsMapUI = socketMapUI;
  module.exports.allSchedulingSocketsMap = sokcetMapScheduling;
  module.exports.socketMapNotify = socketMapNotify;
  httpsServer.setTimeout();

  // socket.on('message', function(data) {
  //     console.log("SER", data);
  // });
  // if (!isUISocketRequest) {
  // var socketFlag = false;
  //   if (allSockets.length > 0) {
  //       for (var socketIndexes = 0; socketIndexes < allSockets.length; socketIndexes++) {
  //           if (allSockets[socketIndexes].handshake.query['username'].indexOf(socket.handshake.query['username']) != -1) {
  //               socketFlag = true;
  //           }
  //       }
  //   } else {
  //       allSockets.push(socket);
  //       allClients.push(socket.conn.id);
  //       socketFlag = true;
  //   }
  //   if (socketFlag == false) {
  //       allSockets.push(socket);
  //       allClients.push(socket.conn.id)
  //   }
  // }
  //module.exports.abc = allSockets;
  socket.on('disconnect', function () {
    logger.info("Inside Socket disconnect");
    var ip = socket.request.connection.remoteAddress || socket.request.headers['x-forwarded-for'];
    if (socket.request._query['check'] == "true") {
      logger.info("Inside Socket UI disconnection");
      //var address = socket.request.connection.remoteAddress || socket.request.headers['x-forwarded-for'];
      var address = socket.handshake.query['username'];
      logger.info("Disconnecting from UI socket: %s", address);
    }
    else if (socket.request._query['check'] == "notify") {
      var address = socket.handshake.query['username'];
      logger.info("Disconnecting from Notification socket: %s", address);
    }
    else {
      logger.info("Inside ICE Socket disconnection");
      var address = socket.handshake.query['username'];
      if (socketMap[address] != undefined) {
        logger.info('Disconnecting from ICE socket : %s', address);
        delete socketMap[address];
        module.exports.allSocketsMap = socketMap;
        logger.info("NO. OF CLIENTS CONNECTED: %d", Object.keys(socketMap).length);
        logger.info("IP\'s connected : %s", Object.keys(socketMap).join());
      }
      else if (sokcetMapScheduling[address] != undefined) {
        logger.info('Disconnecting from Scheduling socket : %s', address);
        delete sokcetMapScheduling[address];
        module.exports.allSchedulingSocketsMap = sokcetMapScheduling;
        logger.info(": %d", Object.keys(sokcetMapScheduling).length);
        logger.info("IP\'s connected :' %s", Object.keys(sokcetMapScheduling).join());
      }
      var inputs = {
        "username": address,
        "query": 'disconnect'
      };
      var args = {
        data: inputs,
        headers: {
          "Content-Type": "application/json"
        }
      };
      logger.info("Calling NDAC Service: updateActiveIceSessions");
      apiclient.post("http://127.0.0.1:1990/server/updateActiveIceSessions", args,
        function (result, response) {
          if (response.statusCode != 200 || result.rows == "fail") {
            logger.error("Error occured in updateActiveIceSessions Error Code: ERRNDAC");
          }
          else {
            logger.info("IP disconnected %s", address);
          }
        });
    }
  });

  socket.on('reconnect', function (data) {
    logger.info("Inside Socket reconnect");
    logger.info("Reconnecting for scheduling socket");
    var ip = socket.request.connection.remoteAddress || socket.request.headers['x-forwarded-for'];
    logger.info("Scheduling Mode Enabled for  IP: %s", ip);
    var address = socket.handshake.query['username'];
    if (data && socketMap[address] != undefined) {
      logger.info('Disconnecting socket connection for Normal Mode(ICE Socket) : %s', address);
      delete socketMap[address];
      module.exports.allSocketsMap = socketMap;
      logger.info("NOo. OF CLIENTS CONNECTED: %d", Object.keys(socketMap).length);
      logger.info("IP\'s connected :' %s", Object.keys(socketMap).join());
      sokcetMapScheduling[address] = socket;
      socket.send('reconnected');
      module.exports.allSchedulingSocketsMap = sokcetMapScheduling;
      logger.info("NOoo. OF CLIENTS CONNECTED: %d", Object.keys(sokcetMapScheduling).length);
      logger.info("IP\'s connected :' %s", Object.keys(sokcetMapScheduling).join());
    } else if (!data && sokcetMapScheduling != undefined) {
      logger.info('Disconnecting socket connection for Scheduling mode: %s', address);
      delete sokcetMapScheduling[address];
      module.exports.allSchedulingSocketsMap = sokcetMapScheduling;
      logger.info("NOoo. OF CLIENTS CONNECTED: %d", Object.keys(sokcetMapScheduling).length);
      logger.info("IP\'s connected :' %s", Object.keys(sokcetMapScheduling).join());
      socketMap[address] = socket;
      module.exports.allSocketsMap = socketMap;
      socket.send('connected');
    }

  });

  socket.on('connect_failed', function () {
    logger.error("Error occurred in connecting socket");
  });
});
//SOCKET CONNECTION USING SOCKET.IO

module.exports = io;
