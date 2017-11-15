var myserver = require('../lib/socket.js');
var url=require('url');
var sessionExtend = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
var sessionTime = 30 * 60 * 1000;
var updateSessionTimeEvery = 20 * 60 * 1000;
var validator = require('validator');
var logger = require('../../logger');

exports.getCrawlResults = function(req, res){
       try{
		   logger.info("Inside UI service: getCrawlResults");
           if(req.cookies['connect.sid'] != undefined){
             var sessionCookie = req.cookies['connect.sid'].split(".");
             var sessionToken = sessionCookie[0].split(":");
             sessionToken = sessionToken[1];
           }

           if(sessionToken != undefined && req.session.id == sessionToken){
             var input_url = req.body.url;
             var level = req.body.level;
             var agent = req.body.agent;
              validateWeboccular();
             function validateWeboccular (){
				          logger.info("Inside function: validateWeboccular");
                  check_url = validator.isURL(req.body.url);
                  if(check_url == true){
                    validate_url = true;
                  }
                  check_level = validator.isEmpty(req.body.level.toString());
                  if(check_level == false){
                    validate_level = true;
                  }
                  check_agent = validator.isAlpha(req.body.agent);
                    if(check_agent == true){
                      validate_agent = true;
                    }
             }
        if(validate_url == true && validate_level == true && check_agent == true)
                  {

           var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
           //console.log("IP:",ip);
            var name = req.session.username;
            //console.log(Object.keys(myserver.allSocketsMap),"<<all people, asking person:",name);
            logger.info("IP\'s connected : %s", Object.keys(myserver.allSocketsMap).join());
            logger.info("ICE Socket requesting Address: %s" , name);
            var mySocket = myserver.allSocketsMap[name];
             if (!mySocket) {
               logger.info("ICE socket not available for Address : %s",name);
               return res.send("unavailableLocalServer");
             }
             mySocket.emit("webCrawlerGo", input_url, level, agent);
            //  var updateSessionExpiry = setInterval(function () {
            //    req.session.cookie.maxAge = sessionTime;
            //  },updateSessionTimeEvery);
             mySocket.on('result_web_crawler', function (value) {
              // req.session.cookie.expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
               try{
                  var mySocketUI =  myserver.allSocketsMapUI[name];
                  mySocketUI.emit("newdata", JSON.parse(value));
                }catch(exception){
                    logger.error(exception);
                }
             });
             mySocket.on('result_web_crawler_finished', function (value) {
              // req.session.cookie.expires = sessionExtend;
            //  clearInterval(updateSessionExpiry);

               try{
                  //console.log(value);
                  var mySocketUI =  myserver.allSocketsMapUI[name];
                  mySocketUI.emit("endData", JSON.parse(value));
                  mySocket._events.result_web_crawler = [];
                  mySocket._events.result_web_crawler_finished = [];
                  //res.status(200);
                  return res.status(200).json({ success: true});
                }catch(exception){
                  logger.error(exception);
                  return res.status(500).json({ success: false, data: err});
                }
             });
           }
           else{
              res.send('unavailableLocalServer');
           }
          }else{
            logger.info("Error occured in the service getCrawlResults: Invalid Session");
            return res.send("Invalid Session");
          }
      }catch(exception){
        logger.error(exception);
      }
}
