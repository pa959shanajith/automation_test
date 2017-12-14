'use strict';
const winston = require('winston');
const fs = require('fs');
var dateFormat = require('dateformat');

const logDir = 'logs';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = new (winston.Logger)({
  rewriters: [
            (level, msg, meta) => {
                meta.username = null;
                meta.userid = null;
                meta.userip = null;
                return meta;
            }
        ],

  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: dateFormat,
      colorize: true,
      level: process.env.ENV === 'DEV' ? 'debug' : 'info',
      handleExceptions: true,
     
    }),
    new (require('winston-daily-rotate-file'))({
      filename: `${logDir}/node_server.log`,
      timestamp: dateFormat,
      datePattern: 'yyyy-MM-dd',
      prepend: true,
      level: process.env.ENV === 'DEV' ? 'debug' : 'info',
      handleExceptions: true
    })
  ],
    colorize: true
});
module.exports = logger;
