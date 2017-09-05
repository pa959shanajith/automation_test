var myserver = require('../../server.js');
var url=require('url');

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
             console.log(Object.keys(myserver.allSocketsMap),"<<all people, asking person:",ip);
             var mySocket =  myserver.allSocketsMap[ip];
             if (!mySocket) {
               return res.send("unavailableLocalServer");
             }
             mySocket.emit("webCrawlerGo", input_url, level, agent);
             mySocket.on('result_web_crawler', function (value) {
               try{
                //  console.log(value);
                  var mySocketUI =  myserver.allSocketsMapUI[ip];
                  mySocketUI.emit("newdata", JSON.parse(value));
                }catch(exception){
                    console.log(exception);
                }
             });
             mySocket.on('result_web_crawler_finished', function (value) {
               try{
                  //console.log(value);
                  var mySocketUI =  myserver.allSocketsMapUI[ip];
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
