'use strict';
const winston = require('winston');
const fs = require('fs');
var dateFormat = require('dateformat');

const logDir = 'logs';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
var LOG_LEVEL_CONSOLE = 'error';
var LOG_LEVEL_FILE = 'info';

//DEV environment
if(process.env.ENV == 'DEV'){
  LOG_LEVEL_CONSOLE = 'debug';
  LOG_LEVEL_FILE = 'debug';
} 
//TEST environment
else if(process.env.ENV == 'TEST'){
  LOG_LEVEL_CONSOLE = 'warn';
  LOG_LEVEL_FILE = 'debug';
}
//PROD environment
else if(process.env.ENV == 'PROD'){
  LOG_LEVEL_CONSOLE = 'error';
  LOG_LEVEL_FILE = 'info';
}
else{
  console.warn("ENV variable is not set in .env file, attempting to start with default PROD environment");
  //process.env.ENV = 'PROD'
}
const logger = new (winston.Logger)({
  rewriters: [
            (level, msg, meta) => {
              try{
                  if (meta!=undefined){
                    meta.username = null;
                    meta.userid = null;
                    meta.userip = null;
                    return meta;
                  }
              }
              catch(e){}
            }
        ],

  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: dateFormat,
      colorize: true,
      level:LOG_LEVEL_CONSOLE,
      handleExceptions: true,
     
    }),
    new (require('winston-daily-rotate-file'))({
      filename: `${logDir}/node_server.log`,
      timestamp: dateFormat,
      datePattern: 'yyyy-MM-dd',
      prepend: true,
      level: LOG_LEVEL_FILE,
      handleExceptions: true
    })
  ],
    colorize: true
});
module.exports = logger;
