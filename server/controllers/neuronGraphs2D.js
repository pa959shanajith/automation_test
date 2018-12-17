var fs = require('fs');
var neo4jAPI = require('../controllers/neo4jAPI');
var logger = require('../../logger');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = "http://"+process.env.NDAC_IP+":"+process.env.NDAC_PORT+"/";
var utils = require('../lib/utils');

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
		if (utils.isSessionActive(req)) {
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
					res.status(status).send("Error connecting to neo4j!");
				}
				else{
					var jsonData=result;
					var pData=parseData(jsonData[0].data);
					if(pData.nodes.length==0) res.status(status).send({"err":true,"ecode":"DB_NOT_FOUND","msg":"Neuron Graphs DB not found!"});
					else{
						var cData=cleanData(pData.nodes);
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