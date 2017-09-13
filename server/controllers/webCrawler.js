var myserver = require('../../server.js');
var url=require('url');
var sessionExtend = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
var sessionTime = 30 * 60 * 1000;
var updateSessionTimeEvery = 20 * 60 * 1000;

exports.getCrawlResults = function(req, res){
       try{
           if(req.cookies['connect.sid'] != undefined){
             var sessionCookie = req.cookies['connect.sid'].split(".");
             var sessionToken = sessionCookie[0].split(":");
             sessionToken = sessionToken[1];
           }

           if(sessionToken != undefined && req.session.id == sessionToken){
             var input_url = req.body.url;
             var level = req.body.level;
             var agent = req.body.agent;

           var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
           console.log("IP:",ip);
            var name = req.session.username;
            console.log(Object.keys(myserver.allSocketsMap),"<<all people, asking person:",name);
            var mySocket = myserver.allSocketsMap[name];
             if (!mySocket) {
               return res.send("unavailableLocalServer");
             }
             mySocket.emit("webCrawlerGo", input_url, level, agent);
            //  var updateSessionExpiry = setInterval(function () {
            //    req.session.cookie.maxAge = sessionTime;
            //  },updateSessionTimeEvery);
             mySocket.on('result_web_crawler', function (value) {
              // req.session.cookie.expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
               try{
                //  console.log(value);
                  var mySocketUI =  myserver.allSocketsMapUI[name];
                  mySocketUI.emit("newdata", JSON.parse(value));
                }catch(exception){
                    console.log(exception);
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
                  console.log(exception);
                  return res.status(500).json({ success: false, data: err});
                }
             });

             mySocket.on('disconnect', function(){
               return res.send("localServerDisconnected")
             });
          }else{
            return res.send("Invalid Session");
          }
      }catch(exception){
        console.log(exception);
      }
}
