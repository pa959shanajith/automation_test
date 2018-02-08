var uuidV4 = require('uuid-random');
var neo4jAPI = require('../controllers/neo4jAPI');
var admin = require('../controllers/admin');
var suite = require('../controllers/suite');
var create_ice=require('../controllers/create_ice');
var myserver = require('../lib/socket.js');
var notificationMsg = require("../notifications/notifyMessages");
var logger = require('../../logger');
var utils = require('../lib/utils');

exports.populateProjects=function(req,res){
	logger.info("Inside UI service: populateProjects");
	if (utils.isSessionActive(req.session)) {
		//var d=req.body;
		var datatosend ='';
			var reqData={
				"userid": req.session.userid,
				"allflag": true
			};
			create_ice.getProjectIDs_Nineteen68(reqData,function(err,data){
				res.setHeader('Content-Type', 'application/json');
				if(err)
				res.status(500).send('Fail')
				else{
					datatosend=data;
				}

				res.status(200).send(datatosend);
			});
	}
	else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

}
exports.populateScenarios=function(req,res){
	logger.info("Inside UI service: populateScenarios");
	if (utils.isSessionActive(req.session)) {
		var moduleId=req.body.moduleId;
			//var taskID=d.taskId;
			query={'statement':"MATCH (a{moduleID:'"+moduleId+"'})-[:FMTTS]->(b) RETURN b"};
			var qlist_query=[query];
			var scenarioList=[];
			neo4jAPI.executeQueries(qlist_query,function(status,result){
				res.setHeader('Content-Type', 'application/json');
				if(status!=200) res.status(status).send(result);
				else{
					try{
						res_data=result;
						res_data[0].data.forEach(function(row){
							scenarioList.push(row.row[0])
						});
						res.status(200).send(scenarioList);
					}catch(ex){
						logger.error("exception in mindmapService: ",ex);
						res.status(200).send('fail');
					}
				}
			});
	}
	else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

}

exports.getProjectTypeMM_Nineteen68=function(req,res){
	logger.info("Inside UI service: getProjectTypeMM_Nineteen68");
	if (utils.isSessionActive(req.session)) {
			var inputs = req.body.projectId;
			create_ice.getProjectType_Nineteen68(inputs,function(err,result){
				if(err){
					res.status(500).send('Fail');
				}
				else{
					res.status(200).send(result);
				}
			});
	}
	else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

}


exports.populateUsers=function(req,res){
	logger.info("Inside UI service: populateUsers");
	if (utils.isSessionActive(req.session)) {
		var d=req.body;
		var datatosend ='';
			admin.getUsers_Nineteen68({prjId:d.projectId},function(err,data){
				res.setHeader('Content-Type', 'application/json');
				if(err)
				res.status(500).send('Fail')
				else{
					datatosend=data;
				}

				res.status(200).send(datatosend);
			});
	}
	else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

}

exports.populateReleases=function(req,res){
	logger.info("Inside UI service: populateReleases");
	if (utils.isSessionActive(req.session)) {
			var datatosend ='';
			var d=req.body;
			var project_id={projectId: d.projectId};
			create_ice.getReleaseIDs_Ninteen68(project_id,function(err,data){
				res.setHeader('Content-Type', 'application/json');
				if(err)
				res.status(500).send('Fail')
				else{
					datatosend=data
				}

				res.status(200).send(datatosend);
			});
	}
	else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

}

exports.populateCycles=function(req,res){
	logger.info("Inside UI service: populateCycles");
	if (utils.isSessionActive(req.session)) {
		var datatosend ='';
			var rel_id={relId : req.body.releaseId};
			create_ice.getCycleIDs_Ninteen68(rel_id,function(err,data){
				res.setHeader('Content-Type', 'application/json');
				if(err)
				res.status(500).send(err)
				else{
					datatosend=data;
				}

				res.status(200).send(datatosend);
			});

	}
	else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

}

exports.getCRId=function(req,res){
	logger.info("Inside UI service: getCRId");
	if (utils.isSessionActive(req.session)) {
		var inputs = { "projectid": req.body.projectid};
		suite.getCRId(inputs, function (status, result) {
				res.setHeader('Content-Type', 'application/json');
				if (status != 200) res.status(status).send(result);
				else {
					res.status(status).send(result);
				}
			});
	}
	else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

}

exports.checkReuse=function(req,res){
	logger.info("Inside UI service: checkReuse");
	if (utils.isSessionActive(req.session)) {
			var d=req.body;
			var qData = d.parsedata;
			var qListReuse = getQueries(qData);
			neo4jAPI.executeQueries(qListReuse,function(status,result){
				res.setHeader('Content-Type', 'application/json');
				if(status!=200) {
					logger.error('Error in checkReuse mindmap service');		
					res.status(500).send('Fail');			
				}
				else{
					var i = 0;
					while(i<qData['screen'].length){
						if(result[i].data[0].row[0]>1)
							qData['screen'][i].reuse = true;
						else
							qData['screen'][i].reuse = false;						
						i = i+1;
					}
					var j = 0;
					while(j<qData['testcase'].length){
						if(result[i+j].data[0].row[0]>1)
							qData['testcase'][j].reuse = true;
						else
							qData['testcase'][j].reuse = false;						
						j = j+1;
					}
					res.status(status).send(qData);
				} 
			});
	}
	else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
}

exports.getModules=function(req,res){
	logger.info("Inside UI service: getModules");
	if (utils.isSessionActive(req.session)) {
		var nData=[],qList=[],idDict={};
		var urlData=req.get('host').split(':');
		var d=req.body;
		var tab=d.tab;
		var prjId=d.prjId;
		var relId=d.relId;
		var cycId=d.cycId;
			if(d.tab=='tabAssign' || d.tab=='endToend'){
				qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{projectID:'"+prjId+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
				qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{projectID:'"+prjId+"'}) WHERE NOT (n)-[:FMTTS]->() RETURN n","resultDataContents":["graph"]});

			}
			qList.push({"statement":" MATCH path=(n:MODULES{projectID:'"+prjId+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
			qList.push({"statement":"MATCH path=(n:MODULES{projectID:'"+prjId+"'}) WHERE NOT (n)-[:FMTTS]->() RETURN n","resultDataContents":["graph"]});
			//MATCH (a:MODULES) WHERE NOT (a)-[:FMTTS]->() return a

			neo4jAPI.executeQueries(qList,function(status,result){
				res.setHeader('Content-Type', 'application/json');
				if(status!=200) res.status(status).send(result);
				else{
					var k=0,rIndex=[],lbl,neoIdDict={},maps=[],tList=[];
					var attrDict={"modules_endtoend":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"modules":{"childIndex":"childIndex","projectID":"pid_n","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"scenarios":{"projectID":"projectID","childIndex":"childIndex","moduleID":"pid_n","testScenarioName":"name","testScenarioID":"id_n","testScenarioID_c":"id_c"},"screens":{"childIndex":"childIndex","testScenarioID":"pid_n","screenName":"name","screenID":"id_n","screenID_c":"id_c","taskexists":"taskexists"},"testcases":{"childIndex":"childIndex","screenID":"pid_n","testCaseName":"name","testCaseID":"id_n","testCaseID_c":"id_c","taskexists":"taskexists"},"tasks":{"taskID":"id_n","task":"t","batchName":"bn","assignedTo":"at","reviewer":"rw","startDate":"sd","endDate":"ed","re_estimation":"re_estimation","release":"re","cycle":"cy","details":"det","nodeID":"pid","parent":"anc"}};
					var jsonData=result;

					var all_modules=jsonData[0].data;

					if (d.tab=='tabAssign' || d.tab=='endToend'){
						all_modules=jsonData[0].data.concat(jsonData[1].data).concat(jsonData[2].data).concat(jsonData[3].data);

					}else{
						all_modules=jsonData[0].data.concat(jsonData[1].data);
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
										nData.push({id:n.id_n,oid:n.id,task:n.t,batchName:n.bn,assignedTo:n.at,reviewer:n.rw,startDate:n.sd,endDate:n.ed,re_estimation:n.re_estimation,release:n.re,cycle:n.cy,details:n.det,nodeID:n.pid,parent:n.anc.slice(1,-1).split(',')});
									}
									catch (ex){
					
										logger.error("exception in mindmapService: ",ex);
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
								//if(nData[tgtIndex].children===undefined) nData[srcIndex].task=nData[tgtIndex];
								if(nData[tgtIndex].children===undefined){
									if((tab=='tabAssign'&& nData[tgtIndex].release==relId && nData[tgtIndex].cycle==cycId)||tab=='tabCreate'||tab=='endToend'){
										nData[srcIndex].task=nData[tgtIndex];
									}else if(nData[srcIndex].type=='testcases' || nData[srcIndex].type=='screens'){
										nData[srcIndex].taskexists=nData[tgtIndex];
									}
										
								} 
								else if(nData[srcIndex].children.indexOf(nData[tgtIndex])==-1){
									nData[srcIndex].children.push(nData[tgtIndex]);
									if(nData[tgtIndex].childIndex==undefined){
										nData[tgtIndex].childIndex=nData[srcIndex].children.length;
									}
								}
							}catch (ex){

								logger.error("exception in mindmapService: ",ex);
							}
						});
					});
					//tList.forEach(function(t){nData[neoIdDict[t.nodeID]].task=t;});
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
	else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

}

exports.reviewTask=function(req,res){
	logger.info("Inside UI service: reviewTask");
	if (utils.isSessionActive(req.session)) {
			var inputs=req.body;
			var taskID=inputs.taskId;
			var batchIds=inputs.batchIds;
			var userId=req.session.userid;
			var username=req.session.username;
			var date=new Date();
			var status=inputs.status;
			var versionnumber=inputs.versionnumber;

			var cur_date=date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+','+date.toLocaleTimeString();
			var taskHistory={"userid":userId,"status":"","modifiedBy":username,"modifiedOn":cur_date};
			if (status=='inprogress' || status=='assigned'|| status=='reassigned' || status=='reassign'){
				query={'statement':"MATCH (n:TASKS) WHERE n.taskID='"+taskID+"' and n.assignedTo='"+userId+"' with n as n Match path=(n)<-[r]-(a) RETURN path","resultDataContents":["graph"]};
			}else if(status=='review'){
				query={'statement':"MATCH (n:TASKS) WHERE n.taskID='"+taskID+"' and n.reviewer='"+userId+"' with n as n Match path=(n)<-[r]-(a) RETURN path","resultDataContents":["graph"]};
			}
			

			var qlist_query=[query];
			var new_queries=[];
			var task_flag=false;
			neo4jAPI.executeQueries(qlist_query,function(status_code,result){
					if(status_code!=200) {
						res.status(status_code).send(result);
					}else{
						try{
							res_data=result;
							
							if(res_data[0].data.length!= 0 && res_data[0].data[0]['graph']['nodes'] != null){
								
								var task = '';
								var task_relation='';
								if(res_data[0].data[0]['graph']['nodes'][0].labels[0]=='TASKS'){
									task=res_data[0].data[0]['graph']['nodes'][0];
									task_relation = res_data[0].data[0]['graph']['nodes'][1];
								}
								else{
									task=res_data[0].data[0]['graph']['nodes'][1];
									task_relation = res_data[0].data[0]['graph']['nodes'][0];
								}
								var neo_taskHistory=task.taskHistory;
								if((status=='inprogress' || status=='assigned' || status=='reassigned') && task.reviewer != 'select reviewer'){
									taskHistory.status='review';
									if (neo_taskHistory==undefined || neo_taskHistory==''){
										neo_taskHistory=[taskHistory];
									}else{
										neo_taskHistory=JSON.parse(neo_taskHistory)
										neo_taskHistory.push(taskHistory);

									}
									neo_taskHistory=JSON.stringify(neo_taskHistory);

									query={'statement':"MATCH (n:TASKS) WHERE n.taskID='"+taskID+"' and n.assignedTo='"+userId+"' set n.task_owner=n.assignedTo,n.assignedTo=n.reviewer,n.status='review',n.taskHistory='"+neo_taskHistory+"' RETURN n"};
									new_queries.push(query);
									task_flag=true;

								}else if(status=='review'){
									taskHistory.status='complete';
									if (neo_taskHistory==undefined || neo_taskHistory==''){
										neo_taskHistory=[taskHistory];
									}else{
										neo_taskHistory=JSON.parse(neo_taskHistory)
										neo_taskHistory.push(taskHistory);

									}
									neo_taskHistory=JSON.stringify(neo_taskHistory);
									query={'statement':"MATCH (m)-[r]-(n:TASKS) WHERE n.taskID='"+taskID+"' and n.reviewer='"+userId+"' set n.assignedTo='',n.status='complete',n.taskHistory='"+neo_taskHistory+"' DELETE r RETURN n"};
									new_queries.push(query);
									task_flag=true;
								}else if(status=='reassign'){
									taskHistory.status='reassigned';
									if (neo_taskHistory==undefined || neo_taskHistory==''){
										neo_taskHistory=[taskHistory];
									}else{
										neo_taskHistory=JSON.parse(neo_taskHistory)
										neo_taskHistory.push(taskHistory);

									}
									neo_taskHistory=JSON.stringify(neo_taskHistory);
									query={'statement':"MATCH (n:TASKS) WHERE n.taskID='"+taskID+"' and n.reviewer='"+userId+"' set n.reviewer=n.assignedTo,n.assignedTo=n.task_owner,n.status='reassigned',n.taskHistory='"+neo_taskHistory+"' RETURN n"};
									new_queries.push(query);
									task_flag=true;
								}
								if(task_flag){
									inputs = {
										'status':taskHistory.status,
										'taskdetails':task_relation,
										'user':username,
										'versionnumber':versionnumber
									}
									
									neo4jAPI.executeQueries(new_queries,function(status,result){
											if(status!=200) res.status(status).send(result);
											else res.status(200).send('success');

									});
								}else{
									res.status(200).send('fail');
								}

							}
							else{
								res.status(200).send('fail');
							}
						}catch(ex){
							logger.error("exception in mindmapService: ",ex);
							res.status(200).send('fail');
						}
					}
				});
	}
	else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

}

exports.saveData=function(req,res){
	logger.info("Inside UI service: saveData");
	if (utils.isSessionActive(req.session)) {
			var tasks =[];
			var nameDict = {};
			var nData=[],qList=[],idDict={};
			var urlData=req.get('host').split(':');
			var inputs=req.body; 
			var data=inputs.map;
			var tab=inputs.tab;
			var prjId=inputs.prjId;
			var deletednodes=inputs.deletednode;
			var user=req.session.username;
			var flag=inputs.write;
			var removeTask=inputs.unassignTask;
			var sendNotify=inputs.sendNotify;
			var relId=inputs.relId;
			var cycId=inputs.cycId;
			//Assigned Tasks Notification
			var assignedToValues = Object.keys(sendNotify).map(function(key){return sendNotify[key]});
			for(var i=0;i<assignedToValues.length;i++) {
				if (Object.keys(myserver.socketMapNotify).indexOf(assignedToValues[i]) > -1) {
					var taskAssignment = 'assigned';
					var taskName = data[i].name;
					var soc = myserver.socketMapNotify[assignedToValues[i]];
					var count = 0;
					var assignedTasksNotification = {};
					assignedTasksNotification.to = '/plugin';
					if(removeTask.indexOf(data[i].oid) >= 0) {
						taskAssignment = "unassigned";
					}
					if(taskAssignment == "unassigned") {
						assignedTasksNotification.notifyMsg = "Task '"+taskName+"' have been unassigned by "+ user+"";
					} else{
						assignedTasksNotification.notifyMsg = "New task '"+taskName+"' have been assigned by "+ user+"";
					}
					assignedTasksNotification.isRead = false;
					assignedTasksNotification.count = count;
					soc.emit("notify",assignedTasksNotification);
				}
			}
			
			//TO support task deletion
			
			if(flag==10){
				var uidx=0,t,lts,rnmList=[];
				deletednodes.forEach(function(t,i){
					// Delete task if single connection
					qList.push({"statement":"MATCH (N) WHERE ID(N)="+t+" MATCH (N)-[r:FNTT]->(b) with b as b MATCH(b)<-[s:FNTT]-(M) WITH count(M) as rel_cnt,b as b  WHERE rel_cnt=1 DETACH DELETE b"});
					// Else delete just connection					
					qList.push({"statement":"MATCH (N) WHERE ID(N)="+t+" MATCH (N)-[r:FNTT]-(b) DELETE r"});
				});
				//TO support task deletion
				removeTask.forEach(function(t,i){
					qList.push({"statement":"MATCH (N) WHERE ID(N)="+t+" MATCH (N)-[r:FNTT]-(b) DETACH DELETE b"});
				});

				data.forEach(function(e,i){
					idDict[e.id]=(e.id_n)?e.id_n:uuidV4();
					e.id=idDict[e.id];
					t=e.task;
					if(e.taskexists && e.task){
						t.id=e.taskexists.id;
						t.oid=e.taskexists.oid;
						t.parent=e.taskexists.parent;
						
						
					}
					nameDict[e.id] = e.name;
					var taskstatus='assigned';
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
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]',release:'"+relId+"',cycle:'"+cycId+"'}) SET n.task='"+t.task+"',n.batchName='"+t.batchName+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.status='"+taskstatus+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]',release:'"+relId+"',cycle:'"+cycId+"'}) SET n.task='"+t.task+"',n.batchName='"+t.batchName+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"'"});
								}

							}
							else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',batchName:'"+t.batchName+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',status:'"+taskstatus+"',reviewer:'"+t.reviewer+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',re_estimation:'"+t.re_estimation+"',release:'"+relId+"',cycle:'"+cycId+"',details:'"+t.details+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'})"});
							qList.push({"statement":"MATCH (a:MODULES_ENDTOEND{moduleID:'"+e.id+"'}),(b:TASKS{nodeID:'"+e.id+"'}) MERGE (a)-[r:FNTT {id:'"+e.id+"'}]-(b)"});				   
						}
					}
					else if(e.type=='modules'){
						if(e.oid!=null){
						//Added new queries to allow saving of incomplete structure
							//qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS)-[s]->(p:SCREENS)-[t]->(q:TESTCASES) DETACH DELETE r,s,t,o,p,q"});
							qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS)-[s]->(p:SCREENS)-[t]->(q:TESTCASES) DETACH DELETE t,q"});
							qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS)-[s]->(p:SCREENS) DETACH DELETE s,p"});
							qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS) DETACH DELETE r,o"});

							if(e.renamed) qList.push({"statement":"MATCH(n:MODULES{moduleID:'"+e.id+"'}) SET n.moduleName='"+e.name+"'"+",n.unique_property='["+e.name+','+prjId+"]'"});
						}
						else qList.push({"statement":"MERGE(n:MODULES{projectID:'"+prjId+"',moduleName:'"+e.name+"',moduleID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',moduleID_c:'"+e.id_c+"',unique_property:'["+e.name+','+prjId+"]'}) SET n.childIndex='"+e.childIndex+"'"});
						if(t!=null && e.id_c !=null){
							t.parent=[prjId].concat(e.id_c);
							t.id=(t.id!=null)?t.id:uuidV4();

							if(t.oid!=null || t.taskexists){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]',release:'"+relId+"',cycle:'"+cycId+"'}) SET n.task='"+t.task+"',n.batchName='"+t.batchName+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.status='"+taskstatus+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]',release:'"+relId+"',cycle:'"+cycId+"'}) SET n.task='"+t.task+"',n.batchName='"+t.batchName+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"'"});
								}
							}
							else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',batchName:'"+t.batchName+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',status:'"+taskstatus+"',reviewer:'"+t.reviewer+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',re_estimation:'"+t.re_estimation+"',release:'"+relId+"',cycle:'"+cycId+"',details:'"+t.details+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'})"});
							qList.push({"statement":"MATCH (a:MODULES{moduleID:'"+e.id+"'}),(b:TASKS{nodeID:'"+e.id+"'}) MERGE (a)-[r:FNTT {id:'"+e.id+"'}]-(b)"});
						}		 
					}
 					else if(e.type=='scenarios'){
						if(e.renamed && e.id_n) rnmList.push({"statement":"MATCH(n:TESTSCENARIOS{testScenarioID:'"+e.id+"',projectID:'"+prjId+"'}) SET n.testScenarioName='"+e.name+"'"});
						qList.push({"statement":"MERGE(n:TESTSCENARIOS{projectID:'"+prjId+"',moduleID:'"+idDict[e.pid]+"',testScenarioName:'"+e.name+"',testScenarioID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',testScenarioID_c:'"+e.id_c+"'}) SET n.childIndex='"+e.childIndex+"'"});
						//Relating scenario with moduleId
						//Yashi
						if(tab!='end_to_end'){
							qList.push({"statement":"MATCH (a:MODULES{moduleID:'"+idDict[e.pid]+"'}),(b:TESTSCENARIOS{moduleID:'"+idDict[e.pid]+"'}) MERGE (a)-[r:FMTTS {id:'"+idDict[e.pid]+"'}]-(b)"});
						}
						else{
							qList.push({"statement":"MATCH (a:MODULES_ENDTOEND{moduleID:'"+idDict[e.pid]+"'}),(b:TESTSCENARIOS{moduleID:'"+idDict[e.pid]+"'}) MERGE (a)-[r:FMTTS {id:'"+idDict[e.pid]+"'}]-(b)"});
						}			   
						//Supporting task assignmnet for scenarios
						if(t!=null && e.id_c!=null){
							t.parent=[prjId].concat(e.pid_c,e.id_c);
							t.id=(t.id!=null)?t.id:uuidV4();

							if(t.oid!=null){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]',release:'"+relId+"',cycle:'"+cycId+"'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]',release:'"+relId+"',cycle:'"+cycId+"'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"'"});
								}
							}
							else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',reviewer:'"+t.reviewer+"',status:'"+taskstatus+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',re_estimation:'"+t.re_estimation+"',release:'"+relId+"',cycle:'"+cycId+"',details:'"+t.details+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'})"});
							qList.push({"statement":"MATCH (a:TESTSCENARIOS{testScenarioID:'"+e.id+"'}),(b:TASKS{nodeID:'"+e.id+"'}) MERGE (a)-[r:FNTT {id:'"+e.id+"'}]-(b)"});
						}
						//qList.push({"statement":"MATCH(n:TESTSCENARIOS{testScenarioID:'"+e.id+"'}) SET n.testScenarioName='"+e.name+"'"+",n.projectID='"+prjId+"'"});
					}
					else if(e.type=='screens'){
						uidx++;lts=idDict[e.pid];
						if(e.renamed && e.id_n && e.orig_name) 
						{	
							rnmList.push({"statement":"MATCH(n:SCREENS{screenName:'"+e.orig_name+"',projectID:'"+prjId+"'}) SET n.screenName='"+e.name+"'"});
							// Beacuse of reuse feature adding testcasename to screen table so if screen is renamed change should reflect in testcase table
							rnmList.push({"statement":"MATCH(n:TESTCASES{screenName:'"+e.orig_name+"',projectID:'"+prjId+"'}) SET n.screenName='"+e.name+"'"});
						}
						qList.push({"statement":"MERGE(n:SCREENS{projectID:'"+prjId+"',testScenarioID:'"+idDict[e.pid]+"',screenName:'"+e.name+"',screenID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',uid:'"+uidx+"',screenID_c:'"+e.id_c+"'})SET n.childIndex='"+e.childIndex+"'"});
						//Relating scenario with screens
						//Yashi
							qList.push({"statement":"MATCH (a:TESTSCENARIOS{testScenarioID:'"+idDict[e.pid]+"'}),(b:SCREENS{testScenarioID:'"+idDict[e.pid]+"'}) MERGE (a)-[r:FTSTS {id:'"+idDict[e.pid]+"'}]-(b)"});			  
						if(t!=null && e.id_c!=null){
							t.id=(t.id!=null)?t.id:uuidV4();
							if(t.oid!=null){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.status='"+taskstatus+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.uid='"+uidx+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.status='"+taskstatus+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.uid='"+uidx+"'"});
								}
							}
							else{
								// If reused 
								t.parent=[prjId].concat(t.parent);
								qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',reviewer:'"+t.reviewer+"',status:'"+taskstatus+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',release:'"+t.release+"',cycle:'"+t.cycle+"',re_estimation:'"+t.re_estimation+"',details:'"+t.details+"',parent:'["+t.parent+"]',uid:'"+uidx+"'})"});
							}		 
								qList.push({"statement":"MATCH (a:SCREENS{screenID_c:'"+e.id_c+"'}),(b:TASKS{taskID:'"+t.id+"'}) MERGE (a)-[r:FNTT {id:'"+e.id+"'}]-(b)"});
						}
					}
					else if(e.type=='testcases'){
						var screen_data='';
						var screenid_c='null';
						if(e.renamed && e.id_n && e.orig_name){
							rnmList.push({"statement":"MATCH(n:TESTCASES{testCaseName:'"+e.orig_name+"',testScenarioID:'"+lts+"',screenID_c:'"+e.pid_c+"'}) SET n.testCaseName='"+e.name+"'"});
						}
						if(e.pid_c!='null' && e.pid_c!=undefined){
							qList.push({"statement":"MERGE(n:TESTCASES{screenID:'"+idDict[e.pid]+"',screenName:'"+nameDict[idDict[e.pid]] +"',projectID:'" + prjId + "',testScenarioID:'"+lts+"',testCaseName:'"+e.name+"',testCaseID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',uid:'"+uidx+"',testCaseID_c:'"+e.id_c+"'}) SET n.screenID_c='"+e.pid_c+"',n.childIndex='"+e.childIndex+"'"});
						}else{
							qList.push({"statement":"MERGE(n:TESTCASES{screenID:'"+idDict[e.pid]+"',screenName:'"+nameDict[idDict[e.pid]] +"',projectID:'" + prjId + "',testScenarioID:'"+lts+"',testCaseName:'"+e.name+"',testCaseID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',uid:'"+uidx+"',testCaseID_c:'"+e.id_c+"'}) SET n.childIndex='"+e.childIndex+"'"});
						}

						//Relating testcases with screens
						//Yashi
							qList.push({"statement":"MATCH (a:SCREENS{screenID:'"+idDict[e.pid]+"'}),(b:TESTCASES{screenID:'"+idDict[e.pid]+"'}) MERGE (a)-[r:FSTTS {id:'"+idDict[e.pid]+"'}]-(b)"});				   
						if(t!=null  && e.id_c!=null){
							t.id=(t.id!=null)?t.id:uuidV4();
							//var parent=[prjId].concat(t.parent);
							if(t.oid!=null){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.status='"+taskstatus+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.uid='"+uidx+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.status='"+taskstatus+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.release='"+t.release+"',n.cycle='"+t.cycle+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.uid='"+uidx+"'"});
								}
							}
							else{
								t.parent=[prjId].concat(t.parent);
								qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',status:'"+taskstatus+"',reviewer:'"+t.reviewer+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',release:'"+t.release+"',cycle:'"+t.cycle+"',re_estimation:'"+t.re_estimation+"',details:'"+t.details+"',parent:'["+t.parent+"]',uid:'"+uidx+"'})"});
							}
								//In case of reuse
								qList.push({"statement":"MATCH (a:TESTCASES{testCaseID_c:'"+e.id_c+"'}),(b:TASKS{taskID:'"+t.id+"'}) MERGE (a)-[r:FNTT {id:'"+e.id+"'}]-(b)"});								   
						}
					}
				});
				if(tab!='end_to_end'){
					
					qList.push({"statement":"MATCH (a) remove a.uid"});
					qList=qList.concat(rnmList);
					qList.push({"statement":"MATCH path=(n:MODULES{moduleID:'"+data[0].id+"'}) WHERE NOT (n)-[:FMTTS]->() RETURN n","resultDataContents":["graph"]});
					qList.push({"statement":"MATCH path=(n:MODULES{moduleID:'"+data[0].id+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
				}else{
					
					qList.push({"statement":"MATCH (a) remove a.uid"});
					qList=qList.concat(rnmList);
					qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{moduleID:'"+data[0].id+"'}) WHERE NOT (n)-[:FMTTS]->() RETURN n","resultDataContents":["graph"]});
					qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{moduleID:'"+data[0].id+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
				}


				neo4jAPI.executeQueries(qList,function(status,result){
					
					if(status!=200){
						//res.setHeader('Content-Type', 'text');
						logger.debug(result[0]);
						logger.error('Error occured in saveData Query');
						result=JSON.stringify(result)
						if(result.indexOf('Schema.ConstraintValidationFailed')>-1){
							result='DuplicateModules';
						}else{
							result='fail';
						}
						res.status(status).send(result);
					} 
					else{
						res.setHeader('Content-Type', 'application/json');
						var k=0,rIndex,lbl,neoIdDict={};
						idDict={};

						var attrDict={"modules_endtoend":{"childIndex":"childIndex","projectID":"pid_n","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"modules":{"childIndex":"childIndex","projectID":"pid_n","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"scenarios":{"childIndex":"childIndex","moduleID":"pid_n","testScenarioName":"name","testScenarioID":"id_n","testScenarioID_c":"id_c"},"screens":{"childIndex":"childIndex","testScenarioID":"pid_n","screenName":"name","screenID":"id_n","screenID_c":"id_c"},"testcases":{"childIndex":"childIndex","screenID":"pid_n","testCaseName":"name","testCaseID":"id_n","testCaseID_c":"id_c"},"tasks":{"taskID":"id_n","task":"t","batchName":"bn","assignedTo":"at","reviewer":"rw","startDate":"sd","endDate":"ed","re_estimation":"re_estimation","release":"re","cycle":"cy","details":"det","nodeID":"pid","parent":"anc"}};
						var jsonData=result;

						var new_res=jsonData[jsonData.length-1].data;
						if(new_res.length==0){
							new_res=jsonData[jsonData.length-2].data
						}
						new_res.forEach(function(row){
							row.graph.nodes.forEach(function(n){
								if (idDict[n.id] === undefined) {
									lbl=n.labels[0].toLowerCase();
									if(lbl=='testscenarios') lbl='scenarios';
									for (var attrs in n.properties){
										if(attrDict[lbl][attrs] !== undefined) n[attrDict[lbl][attrs]]=n.properties[attrs];
										delete n.properties[attrs];
									}
									if(lbl=="tasks") nData.push({id:n.id_n,oid:n.id,task:n.t,batchName:n.bn,assignedTo:n.at,reviewer:n.rw,startDate:n.sd,endDate:n.ed,re_estimation:n.re_estimation,release:n.re,cycle:n.cy,details:n.det,nodeID:n.pid,parent:n.anc.slice(1,-1).split(',')});
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
			else if(flag==20){
				var uidx=0,rIndex;
				// var relId=inputs.relId;
				// var cycId=inputs.cycId;

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
				qObj.userName=user;

				create_ice.createStructure_Nineteen68(qObj,function(err,data){

					if(err)
					res.status(500).send(err);
					else{
						datatosend=data;

					}
				
					var module_type='modules';
					var parsing_result=update_cassandraID(data,urlData,module_type);
					neo4jAPI.executeQueries(parsing_result[0],function(status,result){
						if(status!=200) res.status(status).send(result);
						else res.status(200).send(parsing_result[1]);
					});
				});
			}
	}else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

}

exports.saveEndtoEndData=function(req,res){
	logger.info("Inside UI service: saveEndtoEndData");
	if (utils.isSessionActive(req.session)) {
			var nData=[],qList=[],idDict={};
			var urlData=req.get('host').split(':');
			var inputs=req.body; 
			var data=inputs.map;
			var prjId=inputs.prjId;
			var deletednodes=inputs.deletednode;
			var user=req.session.username;
			var flag=inputs.write;
			var relId=inputs.relId;
			var cycId=inputs.cycId;
			//TO support task deletion
			var removeTask=inputs.unassignTask;
			if(flag==10){
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
					var taskstatus='assigned';
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
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]',release:'"+relId+"',cycle:'"+cycId+"'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+",n.status='"+taskstatus+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]',release:'"+relId+"',cycle:'"+cycId+"'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"'"});
								}
							}
							else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',status:'"+taskstatus+"',reviewer:'"+t.reviewer+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',re_estimation:'"+t.re_estimation+"',release:'"+relId+"',cycle:'"+cycId+"',details:'"+t.details+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'})"});
						}
					}
 					else if(e.type=='scenarios'){
						if(e.renamed && e.id_n) rnmList.push({"statement":"MATCH(n:TESTSCENARIOS{testScenarioID:'"+e.id+"'}) SET n.testScenarioName='"+e.name+"'"+",n.projectID='"+prjId+"'"});
						qList.push({"statement":"MERGE(n:TESTSCENARIOS{projectID:'"+e.projectID+"',moduleID:'"+idDict[e.pid]+"',testScenarioName:'"+e.name+"',testScenarioID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',testScenarioID_c:'"+e.id_c+"'}) SET n.childIndex='"+e.childIndex+"'"});
						//Scenario query-------yashi
						//Relating scenario with moduleId
						//Yashi
						qList.push({"statement":"MATCH (a:MODULES_ENDTOEND{moduleID:'"+idDict[e.pid]+"'}),(b:TESTSCENARIOS{moduleID:'"+idDict[e.pid]+"'}) MERGE (a)-[r:FMTTS {id:'"+idDict[e.pid]+"'}]-(b)"});		  
						//Supporting task assignmnet for scenarios
						if(t!=null && e.id_c!=null){
							t.parent=[prjId].concat(e.pid_c,e.id_c);
							t.id=(t.id!=null)?t.id:uuidV4();
							if(t.oid!=null){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]',release:'"+relId+"',cycle:'"+cycId+"'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]',release:'"+relId+"',cycle:'"+cycId+"'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"'"});
								}
							}
							else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',reviewer:'"+t.reviewer+"',status:'"+taskstatus+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',re_estimation:'"+t.re_estimation+"',release:'"+relId+"',cycle:'"+cycId+"',details:'"+t.details+"',nodeID:'"+e.id+"',parent:'["+t.parent+"]'})"});
							qList.push({"statement":"MATCH (a:TESTSCENARIOS{testScenarioID:'"+e.id+"'}),(b:TASKS{nodeID:'"+e.id+"'}) MERGE (a)-[r:FNTT {id:'"+e.id+"'}]-(b)"});
						}
						//qList.push({"statement":"MATCH(n:TESTSCENARIOS{testScenarioID:'"+e.id+"'}) SET n.testScenarioName='"+e.name+"'"+",n.projectID='"+prjId+"'"});
					}
				});
				
				qList.push({"statement":"MATCH (a) remove a.uid"});
				qList=qList.concat(rnmList);
				qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{moduleID:'"+data[0].id+"'}) WHERE NOT (n)-[:FMTTS]->() RETURN n","resultDataContents":["graph"]});
				qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{moduleID:'"+data[0].id+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
				

				neo4jAPI.executeQueries(qList,function(status,result){
					res.setHeader('Content-Type', 'application/json');
					if(status!=200){
						var error_msg='Fail';
						if(result.indexOf('Schema.ConstraintValidationFailed')>-1){
							error_msg='DuplicateModules';
						}
						res.status(status).send(error_msg);
					} 
					else{
						var k=0,rIndex,lbl,neoIdDict={};
						idDict={};
						var attrDict={"modules_endtoend":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"modules":{"childIndex":"childIndex","projectID":"pid_n","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"scenarios":{"projectID":"projectID","childIndex":"childIndex","moduleID":"pid_n","testScenarioName":"name","testScenarioID":"id_n","testScenarioID_c":"id_c"},"screens":{"childIndex":"childIndex","testScenarioID":"pid_n","screenName":"name","screenID":"id_n","screenID_c":"id_c"},"testcases":{"childIndex":"childIndex","screenID":"pid_n","testCaseName":"name","testCaseID":"id_n","testCaseID_c":"id_c"},"tasks":{"taskID":"id_n","task":"t","assignedTo":"at","reviewer":"rw","startDate":"sd","endDate":"ed","re_estimation":"re_estimation","release":"re","cycle":"cy","details":"det","nodeID":"pid","parent":"anc"}};
						var jsonData=result;

						var new_res=jsonData[jsonData.length-1].data;
						if(new_res.length==0){
							new_res=jsonData[jsonData.length-2].data
						}
						new_res.forEach(function(row){
							row.graph.nodes.forEach(function(n){
								if (idDict[n.id] === undefined) {
									lbl=n.labels[0].toLowerCase();
									if(lbl=='testscenarios') lbl='scenarios';
									for (var attrs in n.properties){
										if(attrDict[lbl][attrs] !== undefined) n[attrDict[lbl][attrs]]=n.properties[attrs];
										delete n.properties[attrs];
									}
									if(lbl=="tasks") nData.push({id:n.id_n,oid:n.id,task:n.t,assignedTo:n.at,reviewer:n.rw,startDate:n.sd,endDate:n.ed,re_estimation:n.re_estimation,release:n.re,cycle:n.cy,details:n.det,nodeID:n.pid,parent:n.anc.slice(1,-1).split(',')});
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
		}	else if(flag==20){
				var uidx=0,rIndex;
				var vn_from=inputs.vn_from;
				var vn_to=inputs.vn_from;
				var userRole=inputs.userRole;
				var qObj={"projectId":prjId,"testsuiteDetails":[],userRole:userRole,from_version:parseFloat(vn_from),new_version:vn_to};
				var nObj=[],tsList=[];
				data.forEach(function(e,i){
					if(e.type=="modules_endtoend") rIndex=uidx;
					if(e.task!=null) delete e.task.oid;
					nObj.push({projectID:e.projectID,id:e.id_n,id_c:e.id_c,name:e.name,task:e.task,children:[]});
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
				qObj.userName=user;
				
				create_ice.createE2E_Structure_Nineteen68(qObj,function(err,data){
					
					if(err){
						logger.error(err);
						res.status(500).send('Fail');
					}

					
					else{
						datatosend=data;
					}
					
					var module_type='modules_endtoend';
					var parsing_result=update_cassandraID(data,urlData,module_type);
					
					neo4jAPI.executeQueries(parsing_result[0],function(status,result){
						if(status!=200) res.status(status).send(result);
						else res.status(200).send(parsing_result[1]);
					});
				});
			}
	}
	else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

}

function getQueries(qdata){
	var qList_reuse= [];
	if(qdata.versionNumber!=undefined){
		//Reuse in case of versioning
		qdata['screen'].forEach(function(e,i){
			qList_reuse.push({'statement':'Match (n:SCREENS{screenName : "'+e.screenname+'",projectID :"'+qdata['projectid']+'"})<-[r:FTSTS]-(ts:TESTSCENARIOS)<-[s:FMTTS]-(m:MODULES)<-[t:FVTM]-(v:VERSION{versionNumber:'+qdata['versionNumber']+'}) return count(n)'});
		})
		qdata['testcase'].forEach(function(e,i){
			qList_reuse.push({'statement':'Match (n:TESTCASES{testCaseName : "'+e.testcasename+'",projectID :"'+qdata['projectid']+'"})<-[a:FSTTS]-(scr:SCREENS{screenName:"'+e.screenname+'"})<-[r:FTSTS]-(ts:TESTSCENARIOS)<-[s:FMTTS]-(m:MODULES)<-[t:FVTM]-(v:VERSION{versionNumber:'+qdata['versionNumber']+'}) return count(n)'});
		})		
	}
	else{
		qdata['screen'].forEach(function(e,i){
			qList_reuse.push({'statement':'Match (n:SCREENS{screenName : "'+e.screenname+'",projectID :"'+qdata['projectid']+'"}) return count(n)'});
		})
		qdata['testcase'].forEach(function(e,i){
			qList_reuse.push({'statement':'Match (n:TESTCASES{testCaseName : "'+e.testcasename+'",projectID :"'+qdata['projectid']+'"})<-[a:FSTTS]-(scr:SCREENS{screenName:"'+e.screenname+'"}) return count(n)'});
		})
	}
	return qList_reuse;
}

var update_cassandraID = function(d,urlData,module_type) {
	logger.info("Inside function: update_cassandraID ");
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
					qList_new.push({"statement":"MATCH (a:SCREENS) WHERE a.screenName='"+screenname_json+"' and a.projectID='"+data.projectId+"' SET a.screenID_c='"+screenId_c_json+"'"});
					//Screen Task update in case of reuse
					qList_new.push({"statement":"MATCH p=(a:SCREENS{screenID_c:'"+screenId_c_json+"'})-[r]-(b:TASKS),(q:SCREENS{screenID_c:'"+screenId_c_json+"'}) MERGE (q)-[s:FNTT{id:q.screenID}]-(b)"});
					//qList_new.push({"statement":"MATCH (a:SCREENS) WHERE a.screenName='"+screenname_json+"' and a.projectID='"+data.projectId+"' SET a.screenID_c='"+screenId_c_json+"'"});
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
						//TestCase Task update in case of reuse
						qList_new.push({"statement":"MATCH (a:SCREENS{screenID_c:'"+screenId_c_json+"'})-[r]-(b:TESTCASES{testCaseID_c:'"+testcaseId_c_json+"'})-[s]-(c:TASKS) ,(d:TESTCASES{testCaseID_c:'"+testcaseId_c_json+"'}) MERGE (d)-[t:FNTT{id:d.testCaseID}]-(c)"});

						cassandraId_dict[testcaseId_json]=testcaseId_c_json;
					});
				});
			});
		});
	}catch(ex){
		logger.error('exception in update_cassandraID',ex);
	}

updateJson.push(cassandraId_dict);

return [ qList_new,updateJson];
};


//MATCH (n)-[r:FMTTS{id:'bad100b6-c223-4888-a8e9-ad26a2de4a61'}]->(o:TESTSCENARIOS) DETACH DELETE r,o
