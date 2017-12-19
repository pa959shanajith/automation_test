// var PythonShell = require('python-shell');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = "http://"+process.env.NDAC_IP+":"+process.env.NDAC_PORT+"/";

function isSessionActive(req){
	var sessionToken = req.session.uniqueId;
    return sessionToken != undefined && req.session.id == sessionToken;
}

exports.getTopMatches_ProfJ = function getTopMatches(req, res) {
	try {
		if (isSessionActive(req)) {
			var query= req.body.userQuery;
			try{
                    var args = {
                        data: req.body.userQuery,
                        headers:{'Content-Type': 'plain/text'}
                    };
						// PythonShell.run("AES_encryption.py", options, function (err, results) {
                    client.post(epurl+"chatbot/getTopMatches_ProfJ",args,
                        function (results, response) {
                        // if (err){
                            if(response.statusCode != 200){
                            console.log("error occured : ",err);
                            res.send("fail");
                        }else{
                                // results is an array consisting of messages collected during execution 
                                // console.log('results: %j', results);
                                // choices = results[2];
								console.log("Hi i am server of profj");
                                if(results.rows != "fail"){
                                    choices = results.rows;
                                    console.log(choices);
                                    res.send(choices);
                                }else{
                                    res.send("fail");
                                }
                        }
                    });	
			}
			catch(exception){
				console.log(exception);
			}
		}
		else{
			res.send("Invalid Session");
		} 
	}catch (exception) {
		console.log(exception);
		res.send("fail");
	}
};

exports.updateFrequency_ProfJ = function(req, res) {
	try {
		if (isSessionActive(req)) {
			var qid= req.body.qid;
			try{
                    var args = {
                        data: req.body.qid,
                        headers:{'Content-Type': 'plain/text'}
                    };
						// PythonShell.run("AES_encryption.py", options, function (err, results) {
					console.log("Hi I am inside update freq service")
                    client.post(epurl+"chatbot/updateFrequency_ProfJ",args,
                        function (results, response) {
                        // if (err){
                            if(response.statusCode != 200){
                            console.log("error occured : ",err);
                            res.send("fail");
                        }else{
                                // results is an array consisting of messages collected during execution 
                                // console.log('results: %j', results);
                                // choices = results[2];
								console.log("Hi i am server of profj");
                                if(results.rows != "fail"){
                                    choices = results.rows;
                                    console.log(choices);
                                    res.send(choices);
                                }else{
                                    res.send("fail");
                                }
                        }
                    });	
			}
			catch(exception){
				console.log(exception);
			}
		}
		else{
			res.send("Invalid Session");
		} 
	}catch (exception) {
		console.log(exception);
		res.send("fail");
	}
}