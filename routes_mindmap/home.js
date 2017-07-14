var fs = require('fs');
var http = require('http');
var https = require('https');
var uuidV4 = require('uuid/v4');
var express = require('express');
var router = express.Router();
var admin = require('../server/controllers/admin');
var create_ice=require('../server/controllers/create_ice');
var async = require('async');
var certificate = fs.readFileSync('server/https/server.crt','utf-8');

/* Send queries to Neo4J/ICE API. */
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

/* GET Home page. */
router.get('/', function(req, res, next) {
	if(!req.session.uniqueID) {res.status(200).send('<br><br>Your session has been invalidated. Please <a href=\'/logout\'>Login</a> Again');}
	else {
		var e = req.session.uniqueID.attributes;
		res.status(200).render('home.jade', { title: 'Mindmap', fname: e.fName, lname: e.lName, urole: e.role});
	}
});

/* POST Mindmap*/
router.post('/', function(req, res, next) {
	//if(!req.session.uniqueID) res.status(401).send('Session Timed Out! Login Again');
	if(req.cookies['connect.sid'] != undefined)
	{
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if(sessionToken != undefined && req.session.id == sessionToken)
	{
		if(!req.session.id) res.status(401).send('<br><br>Your session has been expired.Please <a href="/">Login</a> Again');
	else {
		var d=req.body;
		//var sessObj=req.session.uniqueID;
		//var prjId=sessObj.project.id;
		//var prjId='d4965851-a7f1-4499-87a3-ce53e8bf8e66';
		var prjId=d.prjId;
		var nData=[],qList=[],idDict={};
		var urlData=req.get('host').split(':');
		if(d.task=='getList'){
			qList.push({"statement":"MATCH (n:MODULES{projectID:'"+prjId+"'}) RETURN n.moduleID,n.moduleName"});
			reqToAPI({"data":{"statements":qList}},urlData,'/neoQuerya',function(err,status,result){
				res.setHeader('Content-Type', 'application/json');
				if(err) res.status(status).send(err);
				else if(status!=200) res.status(status).send(result);
				else{
					var jsonData=JSON.parse(result);
					jsonData[0].data.forEach(function(e,i){
						nData.push({id:e.row[0],name:e.row[1]});
					});
					res.status(status).send(nData);
				}
			});
		}
		
		
		else if(d.task=='getModules'){
			prjId=d.prjId;
			if(d.tab=='tabAssign' || d.tab=='endToend'){
				qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{projectID:'"+prjId+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
			}
			qList.push({"statement":"MATCH path=(n:MODULES{projectID:'"+prjId+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
			reqToAPI({"data":{"statements":qList}},urlData,'/neoQuerya',function(err,status,result){
				res.setHeader('Content-Type','application/json');
				if(err) res.status(status).send(err);
				else if(status!=200) res.status(status).send(result);
				else{
					var k=0,rIndex=[],lbl,neoIdDict={},maps=[],tList=[];
					var attrDict={"modules_endtoend":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"modules":{"childIndex":"childIndex","projectID":"pid_n","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"scenarios":{"projectID":"projectID","childIndex":"childIndex","moduleID":"pid_n","testScenarioName":"name","testScenarioID":"id_n","testScenarioID_c":"id_c"},"screens":{"childIndex":"childIndex","testScenarioID":"pid_n","screenName":"name","screenID":"id_n","screenID_c":"id_c"},"testcases":{"childIndex":"childIndex","screenID":"pid_n","testCaseName":"name","testCaseID":"id_n","testCaseID_c":"id_c"},"tasks":{"taskID":"id_n","task":"t","batchName":"bn","assignedTo":"at","reviewer":"rw","startDate":"sd","endDate":"ed","release":"re","cycle":"cy","details":"det","nodeID":"pid","parent":"anc"}};
					var jsonData=JSON.parse(result);
					var all_modules=jsonData[0].data;
					if (qList.length>1){
						all_modules=jsonData[0].data.concat(jsonData[1].data);
						//all_modules.push(jsonData[1].data);
					}
					all_modules.forEach(function(row){
						row.graph.nodes.forEach(function(n){
							if (idDict[n.id] === undefined) {
								lbl=n.labels[0].toLowerCase();
								if(lbl=='testscenarios') lbl='scenarios';
								for (var attrs in n.properties){
									if(attrDict[lbl][attrs] !== undefined) n[attrDict[lbl][attrs]]=n.properties[attrs];
									delete n.properties[attrs];
								}
								if(lbl=="tasks"){
									try{
										
										nData.push({id:n.id_n,oid:n.id,task:n.t,batchName:n.bn,assignedTo:n.at,reviewer:n.rw,startDate:n.sd,endDate:n.ed,release:n.re,cycle:n.cy,details:n.det,nodeID:n.pid,parent:n.anc.slice(1,-1).split(',')});
									}
									catch (ex){
										console.log(n.id);
									}
								}
								else{
									if(lbl=="modules" || lbl=="modules_endtoend") n.childIndex=0;
									nData.push({projectID:n.projectID,childIndex:n.childIndex,id:n.id,"type":lbl,name:n.name,id_n:n.id_n,pid_n:n.pid_n,id_c:n.id_c,children:[],task:null});

								} 
								if(lbl=="modules" || lbl=="modules_endtoend") rIndex.push(k);
								idDict[n.id]=k;neoIdDict[n.id_n]=k;
								k++;
							}
						});
						row.graph.relationships.forEach(function(r){
							try{
							var srcIndex=idDict[r.startNode.toString()];
							var tgtIndex=idDict[r.endNode.toString()];
							if(nData[tgtIndex].children===undefined) nData[srcIndex].task=nData[tgtIndex];
							else if(nData[srcIndex].children.indexOf(nData[tgtIndex])==-1){
								nData[srcIndex].children.push(nData[tgtIndex]);
								if(nData[tgtIndex].childIndex==undefined){
									nData[tgtIndex].childIndex=nData[srcIndex].children.length;
								}
								
							} 
							}catch (ex){
								console.log(ex);
							}
						});
					});
					tList.forEach(function(t){nData[neoIdDict[t.nodeID]].task=t;});
					nData.forEach(function(e){
						if(e.pid_n){
							if(neoIdDict[e.pid_n]!==undefined) e.pid_n=nData[neoIdDict[e.pid_n]].id;
							else e.pid_n=null;
						}
					});
					rIndex.forEach(function(m){maps.push(nData[m]);});
					res.status(status).send(maps);
				}
			});
		}
		else if(d.task=='endTOend'){

			data=d.data.map;
			prjId=d.data.prjId;
			var deletednodes=d.data.abc;
			var user=d.data.user_name
			//TO support task deletion
			var removeTask=d.data.xyz;
			if(d.data.write==10){
				var uidx=0,t,lts,rnmList=[];
				deletednodes.forEach(function(t,i){
					qList.push({"statement":"MATCH (N) WHERE ID(N)="+t+" MATCH (N)-[r:FNTT]-(b) DETACH DELETE b"});
				});
				//TO support task deletion
				removeTask.forEach(function(t,i){
					qList.push({"statement":"MATCH (N) WHERE ID(N)="+t+" MATCH (N)-[r:FNTT]-(b) DETACH DELETE b"});
				});
				
				data.forEach(function(e,i){
					idDict[e.id]=(e.id_n)?e.id_n:uuidV4();
					e.id=idDict[e.id];
					t=e.task;
					var taskstatus='inprogress';
					if(e.type=='modules_endtoend'){
						if(e.oid!=null){			
							qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS) DETACH DELETE r,o;"});
							if(e.renamed) qList.push({"statement":"MATCH(n:MODULES_ENDTOEND{moduleID:'"+e.id+"'}) SET n.moduleName='"+e.name+"'"+",n.unique_property='["+e.name+','+e.projectID+"]'"});
						}
						else qList.push({"statement":"MERGE(n:MODULES_ENDTOEND{projectID:'"+e.projectID+"',moduleName:'"+e.name+"',moduleID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',moduleID_c:'"+e.id_c+"',unique_property:'["+e.name+','+e.projectID+"]'}) SET n.childIndex='"+e.childIndex+"'"});
						if(t!=null && e.id_c !=null){
							t.parent=[prjId].concat(e.id_c);
							t.id=(t.id!=null)?t.id:uuidV4();
							
							if(t.oid!=null){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.details='"+t.details+",n.status='"+taskstatus+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.details='"+t.details+"'"});
								}
								
							} 
							else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',status:'"+taskstatus+"',reviewer:'"+t.reviewer+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',release:'"+t.release+"',cycle:'"+t.cycle+"',details:'"+t.details+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'})"});
						}
					}
 					else if(e.type=='scenarios'){
						if(e.renamed && e.id_n) rnmList.push({"statement":"MATCH(n:TESTSCENARIOS{testScenarioID:'"+e.id+"'}) SET n.testScenarioName='"+e.name+"'"+",n.projectID='"+prjId+"'"});
						qList.push({"statement":"MERGE(n:TESTSCENARIOS{projectID:'"+e.projectID+"',moduleID:'"+idDict[e.pid]+"',testScenarioName:'"+e.name+"',testScenarioID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',testScenarioID_c:'"+e.id_c+"'}) SET n.childIndex='"+e.childIndex+"'"});
						//Supporting task assignmnet for scenarios
						if(t!=null && e.id_c!=null){
							t.parent=[prjId].concat(e.pid_c,e.id_c);
							t.id=(t.id!=null)?t.id:uuidV4();
		
							if(t.oid!=null){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.details='"+t.details+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.details='"+t.details+"'"});
								}
								
							} 
							else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',reviewer:'"+t.reviewer+"',status:'"+taskstatus+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',release:'"+t.release+"',cycle:'"+t.cycle+"',details:'"+t.details+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'})"});
						}
						//qList.push({"statement":"MATCH(n:TESTSCENARIOS{testScenarioID:'"+e.id+"'}) SET n.testScenarioName='"+e.name+"'"+",n.projectID='"+prjId+"'"});
					}
					
					
				});
				qList.push({"statement":"MATCH (a:MODULES_ENDTOEND),(b:TESTSCENARIOS) WHERE a.moduleID=b.moduleID MERGE (a)-[r:FMTTS {id:b.moduleID}]-(b)"});
				// qList.push({"statement":"MATCH (a:TESTSCENARIOS),(b:SCREENS) WHERE a.testScenarioID=b.testScenarioID MERGE (a)-[r:FTSTS {id:b.testScenarioID}]-(b)"});
				// qList.push({"statement":"MATCH (a:SCREENS),(b:TESTCASES) WHERE a.screenID=b.screenID and a.uid=b.uid MERGE (a)-[r:FSTTS {id:b.screenID}]-(b)"});
				qList.push({"statement":"MATCH (a:MODULES_ENDTOEND),(b:TASKS) WHERE a.moduleID=b.nodeID MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)"});
				qList.push({"statement":"MATCH (a:TESTSCENARIOS),(b:TASKS) WHERE a.testScenarioID=b.nodeID MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)"});
				// qList.push({"statement":"MATCH (a:SCREENS),(b:TASKS) WHERE a.screenID=b.nodeID and a.uid=b.uid MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)"});
				// qList.push({"statement":"MATCH (a:TESTCASES),(b:TASKS) WHERE a.testCaseID=b.nodeID and a.uid=b.uid MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)"});
				qList.push({"statement":"MATCH (a) remove a.uid"});
				qList=qList.concat(rnmList);
				qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{moduleID:'"+data[0].id+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
				//qList=qList.concat(rnmList);
				//var index=(qList.length-rnmList.length)-1;
				
				reqToAPI({"data":{"statements":qList}},urlData,'/neoQuerya',function(err,status,result){
					res.setHeader('Content-Type','application/json');
					if(err) res.status(status).send(err);
					else if(status!=200) res.status(status).send(result);
					else{
						var k=0,rIndex,lbl,neoIdDict={};
						idDict={};
						var attrDict={"modules_endtoend":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"modules":{"childIndex":"childIndex","projectID":"pid_n","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"scenarios":{"projectID":"projectID","childIndex":"childIndex","moduleID":"pid_n","testScenarioName":"name","testScenarioID":"id_n","testScenarioID_c":"id_c"},"screens":{"childIndex":"childIndex","testScenarioID":"pid_n","screenName":"name","screenID":"id_n","screenID_c":"id_c"},"testcases":{"childIndex":"childIndex","screenID":"pid_n","testCaseName":"name","testCaseID":"id_n","testCaseID_c":"id_c"},"tasks":{"taskID":"id_n","task":"t","assignedTo":"at","reviewer":"rw","startDate":"sd","endDate":"ed","release":"re","cycle":"cy","details":"det","nodeID":"pid","parent":"anc"}};
						var jsonData=JSON.parse(result);
						jsonData[jsonData.length-1].data.forEach(function(row){
							row.graph.nodes.forEach(function(n){
								if (idDict[n.id] === undefined) {
									lbl=n.labels[0].toLowerCase();
									if(lbl=='testscenarios') lbl='scenarios';
									for (var attrs in n.properties){
										if(attrDict[lbl][attrs] !== undefined) n[attrDict[lbl][attrs]]=n.properties[attrs];
										delete n.properties[attrs];
									}
									if(lbl=="tasks") nData.push({id:n.id_n,oid:n.id,task:n.t,assignedTo:n.at,reviewer:n.rw,startDate:n.sd,endDate:n.ed,release:n.re,cycle:n.cy,details:n.det,nodeID:n.pid,parent:n.anc.slice(1,-1).split(',')});
									else{
										if(lbl=="modules_endtoend") n.childIndex=0;
										nData.push({projectID:n.projectID,childIndex:n.childIndex,id:n.id,"type":lbl,name:n.name,id_n:n.id_n,pid_n:n.pid_n,id_c:n.id_c,children:[],task:null});
									} 
									if(lbl=="modules_endtoend") rIndex=k;
									idDict[n.id]=k;neoIdDict[n.id_n]=k;
									k++;
								}
							});
							row.graph.relationships.forEach(function(r){
								var srcIndex=idDict[r.startNode.toString()];
								var tgtIndex=idDict[r.endNode.toString()];
								if(nData[tgtIndex].children===undefined) nData[srcIndex].task=nData[tgtIndex];
								else if(nData[srcIndex].children.indexOf(nData[tgtIndex])==-1){
									nData[srcIndex].children.push(nData[tgtIndex]);
									if(nData[tgtIndex].childIndex==undefined) nData[tgtIndex].childIndex=nData[srcIndex].children.length;
									
								} 
							});
						});
						nData.forEach(function(e){
							if(e.pid_n){
								if(neoIdDict[e.pid_n]!==undefined) e.pid_n=nData[neoIdDict[e.pid_n]].id;
								else e.pid_n=null;
							}
						});
						
					
						res.status(status).send(nData[rIndex]);
					}
				});
		}	else if(d.data.write==20){
				var uidx=0,rIndex;
				var relId=d.data.relId;
				var cycId=d.data.cycId;
			
				var qObj={"projectId":prjId,"releaseId":relId,"cycleId":cycId,"appType":"Web","testsuiteDetails":[]};
				var nObj=[],tsList=[];
				data.forEach(function(e,i){
					if(e.type=="modules_endtoend") rIndex=uidx;
					if(e.task!=null) delete e.task.oid;
					nObj.push({projectID:e.projectID,id:e.id_n,id_c:e.id_c,name:e.name,task:e.task,children:[]});
					//if(e.type=="testcases") nObj[nObj.length-1]['pid_c']=e.pid_c;
					//if(e.type=="scenarios") 
					//nObj[nObj.length-1]['projectID']=e.projectID;
					if(idDict[e.pid]!==undefined) nObj[idDict[e.pid]].children.push(nObj[uidx]);
					idDict[e.id]=uidx++;
				});
				nObj[rIndex].children.forEach(function(ts,i){
					var sList=[];
					ts.children.forEach(function(s,i){
						var tcList=[];
						s.children.forEach(function(tc,i){
							tcList.push({"screenID_c":tc.pid_c,"testcaseId":tc.id,"testcaseId_c":tc.id_c,"testcaseName":tc.name,"task":tc.task});
						});
						sList.push({"screenId":s.id,"screenId_c":s.id_c,"screenName":s.name,"task":s.task,"testcaseDetails":tcList});
					});
					tsList.push({"projectID":ts.projectID,"testscenarioId":ts.id,"testscenarioId_c":ts.id_c,"testscenarioName":ts.name,"tasks":ts.task,"screenDetails":sList});
				});
				qObj.testsuiteDetails=[{"projectID":nObj[rIndex].projectID,"testsuiteId":nObj[rIndex].id,"testsuiteId_c":nObj[rIndex].id_c,"testsuiteName":nObj[rIndex].name,"task":nObj[rIndex].task,"testscenarioDetails":tsList}];
				qObj.userName=d.data.user_name;
				//fs.writeFileSync('assets_mindmap/req_json.json',JSON.stringify(qObj),'utf8');
				create_ice.createE2E_Structure_Nineteen68(qObj,function(err,data){
				//res.setHeader('Content-Type', 'application/json');
				if(err)
				res.status(500).send(err);
				else{
					datatosend=data;
					
				}
				//fs.writeFileSync('assets_mindmap/req_json_cassandra.txt',JSON.stringify(data),'utf8');
				//var data = JSON.stringify(data);
				var module_type='modules_endtoend';
				var parsing_result=parsing(data,urlData,module_type);
				//var qList_new=parsing(data,urlData);
				 
				reqToAPI({"data":{"statements":parsing_result[0]}},urlData,'/neoQuerya',function(err,status,result){
					//res.setHeader('Content-Type','application/json');
					if(err) res.status(status).send(err);
					res.status(200).send(parsing_result[1]);
					
				});
				


				});

			}
		}
		else if(d.task=='writeMap'){
			data=d.data.map;
			prjId=d.data.prjId;
			var tab=d.data.tab;
			var deletednodes=d.data.abc;
			var user=d.data.user_name;
			//TO support task deletion
			var removeTask=d.data.xyz;
			if(d.data.write==10){
				var uidx=0,t,lts,rnmList=[];
				deletednodes.forEach(function(t,i){
					qList.push({"statement":"MATCH (N) WHERE ID(N)="+t+" MATCH (N)-[r:FNTT]-(b) DETACH DELETE b"});
				});
				//TO support task deletion
				removeTask.forEach(function(t,i){
					qList.push({"statement":"MATCH (N) WHERE ID(N)="+t+" MATCH (N)-[r:FNTT]-(b) DETACH DELETE b"});
				});
				
				data.forEach(function(e,i){
					idDict[e.id]=(e.id_n)?e.id_n:uuidV4();
					e.id=idDict[e.id];
					t=e.task;
					var taskstatus='inprogress';
					if(e.type=='modules_endtoend'){
						if(e.oid!=null){
							qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS) DETACH DELETE r,o"});
							if(e.renamed) qList.push({"statement":"MATCH(n:MODULES_ENDTOEND{moduleID:'"+e.id+"'}) SET n.moduleName='"+e.name+"'"+",n.unique_property='["+e.name+','+prjId+"]'"});
						}
						else qList.push({"statement":"MERGE(n:MODULES_ENDTOEND{projectID:'"+prjId+"',moduleName:'"+e.name+"',moduleID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',moduleID_c:'"+e.id_c+"',unique_property:'["+e.name+','+prjId+"]'}) SET n.childIndex='"+e.childIndex+"'"});
						if(t!=null && e.id_c !=null){
							t.parent=[prjId].concat(e.id_c);
							t.id=(t.id!=null)?t.id:uuidV4();
							
							if(t.oid!=null){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.batchName='"+t.batchName+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.details='"+t.details+",n.status='"+taskstatus+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.batchName='"+t.batchName+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.details='"+t.details+"'"});
								}
								
							} 
							else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',batchName:'"+t.batchName+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',status:'"+taskstatus+"',reviewer:'"+t.reviewer+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',release:'"+t.release+"',cycle:'"+t.cycle+"',details:'"+t.details+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'})"});
						}
					}
					else if(e.type=='modules'){
						if(e.oid!=null){
						//Added new queries to allow saving of incomplete structure
							//qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS)-[s]->(p:SCREENS)-[t]->(q:TESTCASES) DETACH DELETE r,s,t,o,p,q"});
							qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS)-[s]->(p:SCREENS)-[t]->(q:TESTCASES) DETACH DELETE t,q"});
							qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS)-[s]->(p:SCREENS) DETACH DELETE s,p"});
							qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS) DETACH DELETE o"});

							if(e.renamed) qList.push({"statement":"MATCH(n:MODULES{moduleID:'"+e.id+"'}) SET n.moduleName='"+e.name+"'"+",n.unique_property='["+e.name+','+prjId+"]'"});
						}
						else qList.push({"statement":"MERGE(n:MODULES{projectID:'"+prjId+"',moduleName:'"+e.name+"',moduleID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',moduleID_c:'"+e.id_c+"',unique_property:'["+e.name+','+prjId+"]'}) SET n.childIndex='"+e.childIndex+"'"});
						if(t!=null && e.id_c !=null){
							t.parent=[prjId].concat(e.id_c);
							t.id=(t.id!=null)?t.id:uuidV4();
							
							if(t.oid!=null){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.batchName='"+t.batchName+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.details='"+t.details+",n.status='"+taskstatus+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.batchName='"+t.batchName+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.details='"+t.details+"'"});
								}
								
							} 
							else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',batchName:'"+t.batchName+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',status:'"+taskstatus+"',reviewer:'"+t.reviewer+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',release:'"+t.release+"',cycle:'"+t.cycle+"',details:'"+t.details+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'})"});
						}
					}
 					else if(e.type=='scenarios'){
						if(e.renamed && e.id_n) rnmList.push({"statement":"MATCH(n:TESTSCENARIOS{testScenarioID:'"+e.id+"'}) SET n.testScenarioName='"+e.name+"'"+",n.projectID='"+prjId+"'"});
						qList.push({"statement":"MERGE(n:TESTSCENARIOS{projectID:'"+prjId+"',moduleID:'"+idDict[e.pid]+"',testScenarioName:'"+e.name+"',testScenarioID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',testScenarioID_c:'"+e.id_c+"'}) SET n.childIndex='"+e.childIndex+"'"});
						//Supporting task assignmnet for scenarios
						if(t!=null && e.id_c!=null){
							t.parent=[prjId].concat(e.pid_c,e.id_c);
							t.id=(t.id!=null)?t.id:uuidV4();
		
							if(t.oid!=null){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.details='"+t.details+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.details='"+t.details+"'"});
								}
								
							} 
							else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',reviewer:'"+t.reviewer+"',status:'"+taskstatus+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',release:'"+t.release+"',cycle:'"+t.cycle+"',details:'"+t.details+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'})"});
						}
						//qList.push({"statement":"MATCH(n:TESTSCENARIOS{testScenarioID:'"+e.id+"'}) SET n.testScenarioName='"+e.name+"'"+",n.projectID='"+prjId+"'"});
					}
					else if(e.type=='screens'){
						uidx++;lts=idDict[e.pid];
						if(e.renamed && e.id_n && e.orig_name) rnmList.push({"statement":"MATCH(n:SCREENS{screenName:'"+e.orig_name+"',testScenarioID:'"+idDict[e.pid]+"'}) SET n.screenName='"+e.name+"'"+",n.projectID='"+prjId+"'"});
						//qList.push({"statement":"MATCH(n:SCREENS{screenID:'"+e.id+"'}) SET n.screenName='"+e.name+"'"+",n.projectID='"+prjId+"'"});
						qList.push({"statement":"MERGE(n:SCREENS{projectID:'"+prjId+"',testScenarioID:'"+idDict[e.pid]+"',screenName:'"+e.name+"',screenID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',uid:'"+uidx+"',screenID_c:'"+e.id_c+"'})SET n.childIndex='"+e.childIndex+"'"});
						if(t!=null && e.id_c!=null){
							t.id=(t.id!=null)?t.id:uuidV4();
		
							if(t.oid!=null){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.status='"+taskstatus+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.details='"+t.details+"',n.uid='"+uidx+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.status='"+taskstatus+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.details='"+t.details+"',n.uid='"+uidx+"'"});
								}
								
							} 
							else{
								if(t.parent) t.parent.forEach(function(tPrt,tIdx){
									//t.parent[tIdx]=idDict[tPrt];
								});
								t.parent=[prjId].concat(t.parent);
								qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',reviewer:'"+t.reviewer+"',status:'"+taskstatus+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',details:'"+t.details+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]',uid:'"+uidx+"'})"});
							}
						}
					}
					else if(e.type=='testcases'){
						var screen_data='';
						var screenid_c='null';
						if(e.renamed && e.id_n && e.orig_name){
							rnmList.push({"statement":"MATCH(n:TESTCASES{testCaseName:'"+e.orig_name+"',testScenarioID:'"+lts+"',screenID_c:'"+e.pid_c+"'}) SET n.testCaseName='"+e.name+"'"});
						}
						
						if(e.pid_c!='null' && e.pid_c!=undefined){
							qList.push({"statement":"MERGE(n:TESTCASES{screenID:'"+idDict[e.pid]+"',testScenarioID:'"+lts+"',testCaseName:'"+e.name+"',testCaseID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',uid:'"+uidx+"',testCaseID_c:'"+e.id_c+"'}) SET n.screenID_c='"+e.pid_c+"',n.childIndex='"+e.childIndex+"'"});
						}else{
							qList.push({"statement":"MERGE(n:TESTCASES{screenID:'"+idDict[e.pid]+"',testScenarioID:'"+lts+"',testCaseName:'"+e.name+"',testCaseID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',uid:'"+uidx+"',testCaseID_c:'"+e.id_c+"'}) SET n.childIndex='"+e.childIndex+"'"});
						}
						
						
						if(t!=null  && e.id_c!=null){
							t.id=(t.id!=null)?t.id:uuidV4();
							//var parent=[prjId].concat(t.parent);
							if(t.oid!=null){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.status='"+taskstatus+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.details='"+t.details+"',n.uid='"+uidx+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.status='"+taskstatus+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.details='"+t.details+"',n.uid='"+uidx+"'"});
								}
								
							} 
							else{
								if(t.parent){ t.parent.forEach(function(tPrt,tIdx){
									//t.parent[tIdx]=idDict[tPrt];
									});
								}
								t.parent=[prjId].concat(t.parent);
								qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',status:'"+taskstatus+"',reviewer:'"+t.reviewer+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',details:'"+t.details+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]',uid:'"+uidx+"'})"});
							}
						}
					}
				});
				if(tab!='end_to_end'){
					qList.push({"statement":"MATCH (a:MODULES),(b:TESTSCENARIOS) WHERE a.moduleID=b.moduleID MERGE (a)-[r:FMTTS {id:b.moduleID}]-(b)"});
					qList.push({"statement":"MATCH (a:TESTSCENARIOS),(b:SCREENS) WHERE a.testScenarioID=b.testScenarioID MERGE (a)-[r:FTSTS {id:b.testScenarioID}]-(b)"});
					qList.push({"statement":"MATCH (a:SCREENS),(b:TESTCASES) WHERE a.screenID=b.screenID and a.uid=b.uid MERGE (a)-[r:FSTTS {id:b.screenID}]-(b)"});
					qList.push({"statement":"MATCH (a:MODULES),(b:TASKS) WHERE a.moduleID=b.nodeID MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)"});
					qList.push({"statement":"MATCH (a:TESTSCENARIOS),(b:TASKS) WHERE a.testScenarioID=b.nodeID MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)"});
					qList.push({"statement":"MATCH (a:SCREENS),(b:TASKS) WHERE a.screenID=b.nodeID and a.uid=b.uid MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)"});
					qList.push({"statement":"MATCH (a:TESTCASES),(b:TASKS) WHERE a.testCaseID=b.nodeID and a.uid=b.uid MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)"});
					qList.push({"statement":"MATCH (a) remove a.uid"});
					qList=qList.concat(rnmList);
					qList.push({"statement":"MATCH path=(n:MODULES{moduleID:'"+data[0].id+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
				}else{
					qList.push({"statement":"MATCH (a:MODULES_ENDTOEND),(b:TESTSCENARIOS) WHERE a.moduleID=b.moduleID MERGE (a)-[r:FMTTS {id:b.moduleID}]-(b)"});
					// qList.push({"statement":"MATCH (a:TESTSCENARIOS),(b:SCREENS) WHERE a.testScenarioID=b.testScenarioID MERGE (a)-[r:FTSTS {id:b.testScenarioID}]-(b)"});
					// qList.push({"statement":"MATCH (a:SCREENS),(b:TESTCASES) WHERE a.screenID=b.screenID and a.uid=b.uid MERGE (a)-[r:FSTTS {id:b.screenID}]-(b)"});
					qList.push({"statement":"MATCH (a:MODULES_ENDTOEND),(b:TASKS) WHERE a.moduleID=b.nodeID MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)"});
					qList.push({"statement":"MATCH (a:TESTSCENARIOS),(b:TASKS) WHERE a.testScenarioID=b.nodeID MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)"});
					// qList.push({"statement":"MATCH (a:SCREENS),(b:TASKS) WHERE a.screenID=b.nodeID and a.uid=b.uid MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)"});
					// qList.push({"statement":"MATCH (a:TESTCASES),(b:TASKS) WHERE a.testCaseID=b.nodeID and a.uid=b.uid MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)"});
					qList.push({"statement":"MATCH (a) remove a.uid"});
					qList=qList.concat(rnmList);
					qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{moduleID:'"+data[0].id+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
				}
				
				
				reqToAPI({"data":{"statements":qList}},urlData,'/neoQuerya',function(err,status,result){
					res.setHeader('Content-Type','application/json');
					if(err) res.status(status).send(err);
					else if(status!=200) res.status(status).send(result);
					else{
						var k=0,rIndex,lbl,neoIdDict={};
						idDict={};
						var attrDict={"modules_endtoend":{"childIndex":"childIndex","projectID":"pid_n","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"modules":{"childIndex":"childIndex","projectID":"pid_n","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"scenarios":{"childIndex":"childIndex","moduleID":"pid_n","testScenarioName":"name","testScenarioID":"id_n","testScenarioID_c":"id_c"},"screens":{"childIndex":"childIndex","testScenarioID":"pid_n","screenName":"name","screenID":"id_n","screenID_c":"id_c"},"testcases":{"childIndex":"childIndex","screenID":"pid_n","testCaseName":"name","testCaseID":"id_n","testCaseID_c":"id_c"},"tasks":{"taskID":"id_n","task":"t","batchName":"bn","assignedTo":"at","reviewer":"rw","startDate":"sd","endDate":"ed","release":"re","cycle":"cy","details":"det","nodeID":"pid","parent":"anc"}};
						var jsonData=JSON.parse(result);
						jsonData[jsonData.length-1].data.forEach(function(row){
							row.graph.nodes.forEach(function(n){
								if (idDict[n.id] === undefined) {
									lbl=n.labels[0].toLowerCase();
									if(lbl=='testscenarios') lbl='scenarios';
									for (var attrs in n.properties){
										if(attrDict[lbl][attrs] !== undefined) n[attrDict[lbl][attrs]]=n.properties[attrs];
										delete n.properties[attrs];
									}
									if(lbl=="tasks") nData.push({id:n.id_n,oid:n.id,task:n.t,batchName:n.bn,assignedTo:n.at,reviewer:n.rw,startDate:n.sd,endDate:n.ed,release:n.re,cycle:n.cy,details:n.det,nodeID:n.pid,parent:n.anc.slice(1,-1).split(',')});
									else{
										if(lbl=="modules" || lbl=="modules_endtoend") n.childIndex=0;
										nData.push({childIndex:n.childIndex,id:n.id,"type":lbl,name:n.name,id_n:n.id_n,pid_n:n.pid_n,id_c:n.id_c,children:[],task:null});
									} 
									if(lbl=="modules" || lbl=="modules_endtoend") rIndex=k;
									idDict[n.id]=k;neoIdDict[n.id_n]=k;
									k++;
								}
							});
							row.graph.relationships.forEach(function(r){
								var srcIndex=idDict[r.startNode.toString()];
								var tgtIndex=idDict[r.endNode.toString()];
								if(nData[tgtIndex].children===undefined) nData[srcIndex].task=nData[tgtIndex];
								else if(nData[srcIndex].children.indexOf(nData[tgtIndex])==-1){
									nData[srcIndex].children.push(nData[tgtIndex]);
									if(nData[tgtIndex].childIndex==undefined) nData[tgtIndex].childIndex=nData[srcIndex].children.length;
									
								} 
							});
						});
						nData.forEach(function(e){
							if(e.pid_n){
								if(neoIdDict[e.pid_n]!==undefined) e.pid_n=nData[neoIdDict[e.pid_n]].id;
								else e.pid_n=null;
							}
						});
						
					
						res.status(status).send(nData[rIndex]);
					}
				});
			}
			else if(d.data.write==20){
				var uidx=0,rIndex;
				var relId=d.data.relId;
				var cycId=d.data.cycId;
			
				var qObj={"projectId":prjId,"releaseId":relId,"cycleId":cycId,"appType":"Web","testsuiteDetails":[]};
				var nObj=[],tsList=[];
				data.forEach(function(e,i){
					if(e.type=="modules") rIndex=uidx;
					if(e.task!=null) delete e.task.oid;
					nObj.push({id:e.id_n,id_c:e.id_c,name:e.name,task:e.task,children:[]});
					if(e.type=="testcases") nObj[nObj.length-1]['pid_c']=e.pid_c;
					if(idDict[e.pid]!==undefined) nObj[idDict[e.pid]].children.push(nObj[uidx]);
					idDict[e.id]=uidx++;
				});
				nObj[rIndex].children.forEach(function(ts,i){
					var sList=[];
					ts.children.forEach(function(s,i){
						var tcList=[];
						s.children.forEach(function(tc,i){
							tcList.push({"screenID_c":tc.pid_c,"testcaseId":tc.id,"testcaseId_c":tc.id_c,"testcaseName":tc.name,"task":tc.task});
						});
						sList.push({"screenId":s.id,"screenId_c":s.id_c,"screenName":s.name,"task":s.task,"testcaseDetails":tcList});
					});
					tsList.push({"testscenarioId":ts.id,"testscenarioId_c":ts.id_c,"testscenarioName":ts.name,"tasks":ts.task,"screenDetails":sList});
				});
				qObj.testsuiteDetails=[{"testsuiteId":nObj[rIndex].id,"testsuiteId_c":nObj[rIndex].id_c,"testsuiteName":nObj[rIndex].name,"task":nObj[rIndex].task,"testscenarioDetails":tsList}];
				qObj.userName=d.data.user_name;
				//fs.writeFileSync('assets_mindmap/req_json.json',JSON.stringify(qObj),'utf8');
				create_ice.createStructure_Nineteen68(qObj,function(err,data){
				//res.setHeader('Content-Type', 'application/json');
				if(err)
				res.status(500).send(err);
				else{
					datatosend=data;
					
				}
				//fs.writeFileSync('assets_mindmap/req_json_cassandra.txt',JSON.stringify(data),'utf8');
				//var data = JSON.stringify(data);
				var module_type='modules';
				var parsing_result=parsing(data,urlData,module_type);
				//var qList_new=parsing(data,urlData);
				 
				reqToAPI({"data":{"statements":parsing_result[0]}},urlData,'/neoQuerya',function(err,status,result){
					//res.setHeader('Content-Type','application/json');
					if(err) res.status(status).send(err);
					res.status(200).send(parsing_result[1]);
					
				});
				


				});

			}
		}
		else if(d.task=='populateUsers'){
			var datatosend ='';
			admin.getUsers_Nineteen68({prjId:d.projectId},function(err,data){
				res.setHeader('Content-Type', 'application/json');
				if(err)
				res.status(500).send(err)
				else{
					datatosend=data;
				}
			
				res.status(200).send(datatosend);
			});
			
		}else if(d.task=='populateProjects'){

			var datatosend ='';
			var user_id={userid : ''};
			user_id.userid = d.user_id;
			create_ice.getProjectIDs_Nineteen68(user_id,function(err,data){
				res.setHeader('Content-Type', 'application/json');
				if(err)
				res.status(500).send(err)
				else{
					datatosend=data
				}
			
				res.status(200).send(datatosend);
			});
			
		}
		else if(d.task=='populateReleases'){

			var datatosend ='';
			var project_id={projectId: ''};
			project_id.projectId = d.projectId;
			create_ice.getReleaseIDs_Ninteen68(project_id,function(err,data){
				res.setHeader('Content-Type', 'application/json');
				if(err)
				res.status(500).send(err)
				else{
					datatosend=data
				}
			
				res.status(200).send(datatosend);
			});
			
		}
		else if(d.task=='populateCycles'){

			var datatosend ='';
			var rel_id={relId : ''};
			rel_id.relId = d.relId;
			create_ice.getCycleIDs_Ninteen68(rel_id,function(err,data){
				res.setHeader('Content-Type', 'application/json');
				if(err)
				res.status(500).send(err)
				else{
					datatosend=data;
				}
			
				res.status(200).send(datatosend);
			});
			
		}else if(d.task=='reviewTask'){
			//var prjId=d.prjId;
			var taskID=d.taskId;
			query={'statement':"MATCH (n:TASKS) WHERE n.taskID='"+taskID+"' and n.assignedTo='"+d.userId+"' RETURN n.reviewer"};
			var qlist_query=[query];
			reqToAPI({"data":{"statements":qlist_query}},urlData,'/neoQuerya',function(err,status,result){
					//res.setHeader('Content-Type','application/json');
					if(err) {
						res.status(status).send(err);
					}else{
						try{
							res_data=JSON.parse(result);
							if(res_data[0].data.length!= 0){
								if(res_data[0].data[0].row[0] != null && res_data[0].data[0].row[0] != 'select reviewer'){
									query={'statement':"MATCH (n:TASKS) WHERE n.taskID='"+taskID+"' and n.assignedTo='"+d.userId+"' set n.task_owner=n.assignedTo,n.assignedTo=n.reviewer,n.status='review' RETURN n"};
									var qlist_query=[query];
									reqToAPI({"data":{"statements":qlist_query}},urlData,'/neoQuerya',function(err,status,result){
											//res.setHeader('Content-Type','application/json');
											if(err) res.status(status).send(err);
											res.status(200).send('success');
									
									});
								}else{
									res.status(200).send('fail');
								}
							}else{
								res.status(200).send('Tasksubmitted');
							}
						}catch(ex){
							console.log(ex);
							res.status(200).send('fail');
						}
					}
				});
		}else if(d.task=='populateScenarios'){
			var moduleId=d.moduleId;
			//var taskID=d.taskId;
			
			query={'statement':"MATCH (a{moduleID:'"+moduleId+"'})-[:FMTTS]->(b) RETURN b"};
			var qlist_query=[query];
			var scenarioList=[];
			reqToAPI({"data":{"statements":qlist_query}},urlData,'/neoQuerya',function(err,status,result){
					//res.setHeader('Content-Type','application/json');
					if(err) {
						res.status(status).send(err);
					}else{
						try{
							res_data=JSON.parse(result);
							res_data[0].data.forEach(function(row){
								scenarioList.push(row.row[0])
							});
							res.status(200).send(scenarioList);
						}catch(ex){
							console.log(ex);
							res.status(200).send('fail');
						}
					}
				});
		}
	}
}
else{
			res.send("Invalid Session");
		}
});




var parsing = function(d,urlData,module_type) {
	var data = d;
	var qList_new=[];

	var result="";
	var testsuiteDetails=d.testsuiteDetails;
	var updateJson=[];
	var cassandraId_dict={};
	try{
		testsuiteDetails.forEach(function(e,i){
		var moduleID_json=e.testsuiteId;
		var modulename_json=e.testsuiteName;
		var moduleID_c_json=e.testsuiteId_c;
		//var modulename_json=e.testsuiteName;
		var testscenarioDetails_json=e.testscenarioDetails;
		if (module_type=='modules'){
			qList_new.push({"statement":"MATCH (a:MODULES) WHERE a.moduleName='"+modulename_json+"' and a.projectID='"+data.projectId+"' SET a.moduleID_c='"+moduleID_c_json+"'"});
		}else 
		qList_new.push({"statement":"MATCH (a:MODULES_ENDTOEND) WHERE a.moduleName='"+modulename_json+"' and a.projectID='"+data.projectId+"' SET a.moduleID_c='"+moduleID_c_json+"'"});
		cassandraId_dict[moduleID_json]=moduleID_c_json;
		//updateJson.push(cassandraId_dict);
			testscenarioDetails_json.forEach(function(sc,i){
				var testscenarioId_json=sc.testscenarioId;
				var testscenarioname_json=sc.testscenarioName;
				var testscenarioId_c_json=sc.testscenarioId_c;
				//var modulename_json=sc.testsuiteName;
				var screenDetails_json=sc.screenDetails;
				//console.log(testscenarioId_json,testscenarioId_c_json);
				if (module_type=='modules')
					qList_new.push({"statement":"MATCH (a:TESTSCENARIOS) WHERE a.testScenarioName='"+testscenarioname_json+"' and a.projectID='"+data.projectId+"' SET a.testScenarioID_c='"+testscenarioId_c_json+"'"});
				else{
					qList_new.push({"statement":"MATCH (a:TESTSCENARIOS) WHERE a.testScenarioName='"+testscenarioname_json+"' and a.projectID='"+sc.scenario_PrjId+"' SET a.testScenarioID_c='"+testscenarioId_c_json+"'"});
				}
					
				cassandraId_dict[testscenarioId_json]=testscenarioId_c_json;
			

				screenDetails_json.forEach(function(scr,i){
					var screenId_json=scr.screenId;
					var screenId_c_json=scr.screenId_c;
					var screenname_json=scr.screenName;
					//var modulename_json=sc.testsuiteName;
					var testcaseDetails_json=scr.testcaseDetails;
					//console.log(screenId_json,screenId_c_json);
					qList_new.push({"statement":"MATCH (a:SCREENS) WHERE a.screenName='"+screenname_json+"' and a.projectID='"+data.projectId+"' SET a.screenID_c='"+screenId_c_json+"'"});
					//updateJson.push({screenId_json:screenId_c_json});
					cassandraId_dict[screenId_json]=screenId_c_json;
				//updateJson.push(cassandraId_dict);

						testcaseDetails_json.forEach(function(tc,i){
						var testcaseId_json=tc.testcaseId;
						var testcaseId_c_json=tc.testcaseId_c;
						var testcaseName_json=tc.testcaseName;
						var screenId_C_neo=tc.screenID_c;
						//console.log('testcaseId_json',testcaseId_c_json);
						if(screenId_C_neo == 'null' || screenId_C_neo == undefined){
							qList_new.push({"statement":"MATCH (a:TESTCASES) WHERE a.testCaseName='"+testcaseName_json+"' and a.screenID='"+screenId_json+"' SET a.screenID_c='"+screenId_c_json+"'"});
							qList_new.push({"statement":"MATCH (a:TESTCASES) WHERE a.testCaseName='"+testcaseName_json+"' and a.screenID_c='"+screenId_c_json+"' SET a.testCaseID_c='"+testcaseId_c_json+"'"});
						}else{
							qList_new.push({"statement":"MATCH (a:TESTCASES) WHERE a.testCaseName='"+testcaseName_json+"' and a.screenID_c='"+screenId_c_json+"' SET a.testCaseID_c='"+testcaseId_c_json+"'"});
						}
						
						cassandraId_dict[testcaseId_json]=testcaseId_c_json;
				

					});
					
				});


			});
		


		});
	}catch(ex){
		console.log(ex);
	}
	
updateJson.push(cassandraId_dict);

return [ qList_new,updateJson];
};



module.exports = router;

//MATCH (n)-[r:FMTTS{id:'bad100b6-c223-4888-a8e9-ad26a2de4a61'}]->(o:TESTSCENARIOS) DETACH DELETE r,o