var fs = require('fs');
var neo4jAPI = require('../controllers/neo4jAPI');
var logger = require('../../logger');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = "http://"+process.env.NDAC_IP+":"+process.env.NDAC_PORT+"/";

function isSessionActive(req){
	var sessionToken = req.session.uniqueId;
    return sessionToken != undefined && req.session.id == sessionToken;
}

var parseData = function(data){
	logger.info("Inside function: parseData ");
	var rootIndex=-1;
	var nodeTypes={"DOMAINS_NG":"Domain","PROJECTS_NG":"Project","RELEASES_NG":"Release","CYCLES_NG":"Cycle","TESTSUITES_NG":"TestSuite","TESTSCENARIOS_NG":"TestScenario","TESTCASES_NG":"TestCase","SCREENS_NG":"Screen"};
	var nc=0,lc=0,nodes=[],links=[],nodeIdDict={},linkIdDict={};
	var attrDict={"complexity":"Complexity","createdby":"Created By","cyclename":"Name","domainname":"Name","projectname":"Name","releasename":"Name","risk":"Risk","screenname":"Name","testsuitename":"Name","testscenarioname":"Name","testcasename":"Name","testscenarioids":"testScenarioids","testsuiteid":"testSuiteid"};
	data.forEach(function(row){
		d=row.graph;
		d.nodes.forEach(function (n) {
			//console.log("******node*******\n",JSON.stringify(n))
			if (nodeIdDict[n.id]===undefined && nodeTypes[n.labels[0]]!==undefined){
				if(n.labels[0]=="DOMAINS_NG") rootIndex=nc;
				if(n.labels[0]=="TESTCASES_NG"){
					n.properties.complexity=Math.floor((Math.random()*10))%3+1;
					n.properties.risk=Math.floor((Math.random()*10))%3+1;
				}
				for(var attrs in n.properties){
					if(attrDict[attrs] !== undefined) {
						n.properties[attrDict[attrs]]=n.properties[attrs];
					}
					delete n.properties[attrs];
				}
				//nodes.push({"id":n.id,"idx":nc,"type":nodeTypes[n.labels[0]],"name":n.properties.Name,"parent":[],"children":[]});
				//console.log(nodeTypes[n.labels[0]],'\n')
				//console.log('@@@@@@@@@@@n@@@@@@@@@@@@@:',JSON.stringify(n))
				nodes.push({"id":n.id,"idx":nc,"type":nodeTypes[n.labels[0]],"name":n.properties.Name,"attributes": n.properties,"parent":[],"children":[]});
				nodeIdDict[n.id]=nc;
				nc++;
			}
		});
		d.relationships.forEach(function(l){
			if (linkIdDict[l.id]===undefined){
				var source=l.startNode.toString();
				var target=l.endNode.toString();
				srcIndex=nodeIdDict[source];
				tgtIndex=nodeIdDict[target];
				if(srcIndex!==undefined && tgtIndex!==undefined){
					links.push({"start":source,"end":target});
					linkIdDict[l.id]=lc;
					lc++;
					if (nodes[srcIndex].children.indexOf(nodes[tgtIndex]) == -1) nodes[srcIndex].children.push(nodes[tgtIndex]);
					//if (nodes[tgtIndex].parent.indexOf(nodes[srcIndex]) == -1) nodes[tgtIndex].parent.push(nodes[srcIndex]);
				}
			}
		});
	});
	return {nodes:nodes,links:links,type:nodeTypes,root:rootIndex};
};

var get2DCoordsData = function(data,r,dNeed){
	logger.info("Inside function: get2DCoordsData ");
	if(r){
		dNeed={};
		if(data.children) data.children.forEach(function(p){
			if(p.children){
				dNeed[p.children.length]=1;
				p.children.forEach(function(r){
					if(r.children) dNeed[r.children.length]=1;
				});
			}
		});
	}
	var dMap = JSON.parse(fs.readFileSync('./assets/nGraphs_2dcoords_300.json'));
	for(var k in dNeed){
		dNeed[k]=dMap[k.toString()];
	}
	return dNeed;
};

var cleanData = function(data){
	logger.info("Inside function: cleanData ");
	data.forEach(function(e){
		delete e.children;
		delete e.parent;
	});
	return data;
};

exports.getGraphData = function(req, res){
	logger.info("Inside UI service: getGraphData");
	try{
		if (isSessionActive(req)) {
			var qList=[];
			//var urlData=req.get('host').split(':');
			var userid=req.body.uid;
			//'686d69a5-b519-4b4f-a813-8299235a2e97';'9c017f14-5a1c-4f2f-85a9-52728c86684c';
			//qList.push({"statement":"MATCH(a:ICEPERMISSIONS_NG{userid:'"+userid+"'})-[r1]->(b:DOMAINS_NG) WITH b as d MATCH path=(d)-[r*1..]->(x) RETURN path","resultDataContents":["graph"]});
			qList.push({"statement":"MATCH(a:ICEPERMISSIONS_NG{userid:'"+userid+"'})-[r1]->(d:DOMAINS_NG) WITH a.projectids as pids,d as d MATCH (p:PROJECTS_NG) WHERE p.projectid in pids WITH p as p,d as d MATCH path=(d)-[r2]->(p)-[r3*1..]->(x) RETURN path","resultDataContents":["graph"]});
			//console.log('qList::::', qList);
			neo4jAPI.executeQueries(qList,function(status,result){
				res.setHeader('Content-Type', 'application/json');
				if(status!=200){
					//console.log("Status:",status,"\nResponse: ",result);
					res.status(status).send(result);
				}
				else{
					var jsonData=result;
					var pData=parseData(jsonData[0].data);
					if(pData.nodes.length==0) res.status(status).send({"err":true,"ecode":"DB_NOT_FOUND","msg":"Neuron Graphs DB not found!"});
					else{
						var coords=get2DCoordsData(pData.nodes[pData.root]);
						var cData=cleanData(pData.nodes);
						pData.coords2D=coords;
						pData.err=false;
						res.status(status).send(pData);
					}
				}
			});
			
		}
		else{
			res.send({"err":true,"ecode":"INVALID_SESSION","msg":"Your session has been expired. Please login again"});
		}
	}
	catch(exception){
		logger.info("Exception in the service getGraphData: ", exception);
		res.send({"err":true,"ecode":"FAIL","msg":"Internal Error! Please contact admin"});
	}
};

exports.getPackData = function(req, res){
	logger.info("Inside UI service: getPackData");
	try{
		if (isSessionActive(req)) {
			var dNeed=req.body.data;
			var coords=get2DCoordsData(!1,!1,dNeed);
			res.status(200).send({"err":false,"coords_data":coords});
		}
		else{
			res.send({"err":true,"ecode":"INVALID_SESSION","msg":"Your session has been expired. Please login again"});
		}
	}
	catch(exception){
		logger.error("Exception in the service getPackData: ", exception);
		res.send({"err":true,"ecode":"FAIL","msg":"Internal Error! Please contact admin"});
	}
};

exports.getReportData = function(req, res){
	logger.info("Inside UI service: getReportData");
	try{
		if (isSessionActive(req)) {
			//my story
			var req_testsuiteId=req.body.moduleid;
			var req_executionId=req.body.executionid;
			var req_testScenarioIds=req.body.testscenarioids;
			// var getExecutionDetails="SELECT executionid,starttime,endtime FROM execution WHERE testsuiteid="
			// 	+ req_testsuiteId ;
			// dbConnICE.execute(getExecutionDetails,function(err,executionData){
			var inputs = {"suiteid" :req_testsuiteId,"executionid":req_executionId,"testscenarioids":req_testScenarioIds};
			//console.log("\n*****inputs******\n",inputs);
			var args = {data:inputs,headers:{"Content-Type" : "application/json"}};
			logger.info("Calling NDAC Service from getReportData :reports/getReportData");
			client.post(epurl+"reports/getReportData",args,
			function (result, response) {
				var executionDetailsJSON={};
				try{
					// if(err){
					if(response.statusCode != 200 || result.rows == "fail"){
						//console.log(err);
						res.send("fail");
					}else{
							//Correct response
							res.send(result);
						}
						//console.log('executionDetailsJSON ',JSON.stringify(executionDetailsJSON));
						//res.send(JSON.stringify(executionDetailsJSON));
					}
				catch(exception){
					//console.log(exception);
					logger.error(exception.message);
					res.send("fail");
				}
			});

		}
		else{
			res.send({"err":true,"ecode":"INVALID_SESSION","msg":"Your session has been expired. Please login again"});
		}
	}
	catch(exception){
		logger.error(exception.message);
		res.send({"err":true,"ecode":"FAIL","msg":"Internal Error! Please contact admin"});
	}
};

// exports.BuildRelationships = function(req, res){
// 	try{
//  	if (isSessionActive(req)) {
// 			//my story
// 			var qList = [];
// 			qList.push({"statement":"MATCH (a:TESTSUITES_NG),(b:TESTSCENARIOS_NG) WHERE b.testscenarioid IN a.testscenarioids MERGE (a)-[r:FTSUTTSC_NG{id:b.testscenarioid}]->(b)"});
// 			console.log('hi1');
// 			qList.push({"statement":"MATCH (a:TESTCASES_NG),(b:SCREENS_NG) WHERE a.screenid=b.screenid MERGE (a)-[r:FTCETSCR_NG{id:b.screenid}]->(b)"})
// 			console.log('hi2');
// 			qList.push({"statement":"MATCH (a:TESTSCENARIOS_NG),(b:TESTCASES_NG) WHERE b.testcaseid IN a.testcaseids MERGE (a)-[r:FTSCTTCE_NG{id:b.testcaseid}]->(b)"})
// 			console.log('hi3');
// 			reqToAPI1(qList,urlData);
// 			setTimeout(function() {
// 				res.send("BuildRelationships executed successfully");	
// 				console.log("==================After Response======================")
// 			}, 20000);
			

// 		}
// 		else{
// 			res.send({"err":true,"ecode":"INVALID_SESSION","msg":"Your session has been expired. Please login again"});
// 		}
// 	}
// 	catch(exception){
// 		console.log(exception);
// 		res.send({"err":true,"ecode":"FAIL","msg":"Internal Error! Please contact admin"});
// 	}
// }
