var myserver = require('../../server.js');
var fs = require('fs');
var https = require('https');
var certificate = fs.readFileSync('server/https/server.crt','utf-8');
var sessionTime = 30 * 60 * 1000;
var updateSessionTimeEvery = 20 * 60 * 1000;

var reqToAPI = function(d,u,p,callback) {
	try{
		var data = JSON.stringify(d);
		var result="";
		var postOptions = {host: u[0], port: u[1], path: p, method: 'POST',ca:certificate,checkServerIdentity: function (host, cert) {
		return undefined; },headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)}};
		postOptions.agent= new https.Agent(postOptions);
		var postRequest = https.request(postOptions,function(resp){
			resp.setEncoding('utf-8');
			resp.on('data', function(chunk) {result+=chunk;});
			resp.on('end', function(chunk) {callback(null,resp.statusCode,result);});
		});
		postRequest.on('error',function(e){callback(e.message,400,null);});
		postRequest.write(data);
		postRequest.end();
	}catch(ex){
		console.log(ex);
	}
};

var parseData = function(data){
	var rootIndex=-1;
	var nodeTypes={"DOMAINS_NG":"Domain","PROJECTS_NG":"Project","RELEASES_NG":"Release","CYCLES_NG":"Cycle","TESTSUITES_NG":"TestSuite","TESTSCENARIOS_NG":"TestScenario","TESTCASES_NG":"TestCase","SCREENS_NG":"Screen"};
	var nc=0,lc=0,nodes=[],links=[],nodeIdDict={},linkIdDict={};
	var attrDict={"complexity":"Complexity","createdby":"Created By","cyclename":"Name","domainname":"Name","projectname":"Name","releasename":"Name","risk":"Risk","screenname":"Name","testsuitename":"Name","testscenarioname":"Name","testcasename":"Name"};
	data.forEach(function(row){
		d=row.graph;
		d.nodes.forEach(function (n) {
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

var get2DCoordsData = function(data){
	dNeed={}
	if(data.children) data.children.forEach(function(p){
		if(p.children){
			dNeed[p.children.length]=1;
			p.children.forEach(function(r){
				if(r.children) dNeed[r.children.length]=1;
			});
		}
	});
	var dMap = JSON.parse(fs.readFileSync('./assets/nGraphs_2dcoords_300.json'));
	for(k in dNeed){
		dNeed[k]=dMap[k.toString()];
	}
	return dNeed;
};

var cleanData = function(data){
	data.forEach(function(e){
		delete e.children;
		delete e.parent;
	});
	return data
};

exports.getGraphData = function(req, res){
	try{
		if(req.cookies['connect.sid'] != undefined){
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if(sessionToken != undefined && req.session.id == sessionToken){
			var qList=[]
			var urlData=req.get('host').split(':');
			var userid=req.body.uid;
			//'686d69a5-b519-4b4f-a813-8299235a2e97';'9c017f14-5a1c-4f2f-85a9-52728c86684c';
			//qList.push({"statement":"MATCH(a:ICEPERMISSIONS_NG{userid:'"+userid+"'})-[r1]->(b:DOMAINS_NG) WITH b as d MATCH path=(d)-[r*1..]->(x) RETURN path","resultDataContents":["graph"]});
			qList.push({"statement":"MATCH(a:ICEPERMISSIONS_NG{userid:'"+userid+"'})-[r1]->(d:DOMAINS_NG) WITH a.projectids as pids,d as d MATCH (p:PROJECTS_NG) WHERE p.projectid in pids WITH p as p,d as d MATCH path=(d)-[r2]->(p)-[r3*1..]->(x) RETURN path","resultDataContents":["graph"]});
			reqToAPI({"data":{"statements":qList}},urlData,'/neo4jAPI',function(err,status,result){
				res.setHeader('Content-Type', 'application/json');
				if(err) res.status(status).send(err);
				else if(status!=200) res.status(status).send(result);
				else{
					var jsonData=JSON.parse(result);
					var pData=parseData(jsonData[0].data);
					if(pData.nodes.length==0) res.status(status).send({"err":true,"ecode":"DB_NOT_FOUND","msg":"Neuron Graphs DB not found!"});
					else{
						var coords=get2DCoordsData(pData.nodes[pData.root]);
						var cData=cleanData(pData.nodes);
						pData['coords2D']=coords;
						pData['err']=false;
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
		console.log(exception);
		res.send({"err":true,"ecode":"FAIL","msg":"Internal Error! Please contact admin"});
	}
};

exports.getHierarchy = function(req, res){
	try{
		if(req.cookies['connect.sid'] != undefined){
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
		if(sessionToken != undefined && req.session.id == sessionToken){
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", ip);
			if ('allSocketsMap' in myserver && ip in myserver.allSocketsMap) {
				var mySocket = myserver.allSocketsMap[ip];
				var jsonData=req.nGraphsData
				mySocket.emit("clusters_nGraph", jsonData);
				var updateSessionExpiry = setInterval(function () {
					req.session.cookie.maxAge = sessionTime;
				},updateSessionTimeEvery);
				mySocket.on('result_clusters_nGraph', function (data) {
					clearInterval(updateSessionExpiry);
					try{
						console.log(data);
						//Logic Goes Here
					}catch(exception){
						console.log(exception);
					}
				});
			}
			else {
				console.log("Socket not Available");
				res.send("unavailableLocalServer");
			}
		}
		else{
			res.send("Invalid Session");
		}
	}
	catch(exception){
		console.log(exception);
		res.send("fail");
	}
};
