var uuidV4 = require('uuid-random');
var neo4jAPI = require('../controllers/neo4jAPI');
var admin = require('../controllers/admin');
var suite = require('../controllers/suite');
var create_ice=require('../controllers/create_ice');
var myserver = require('../lib/socket.js');
var notificationMsg = require("../notifications/notifyMessages");
var logger = require('../../logger');
var utils = require('../lib/utils');
var xlsx = require('xlsx');
var excelbuilder = require('msexcel-builder');
var path = require('path');
var fs = require('fs');

/* Convert excel file to CSV Object. */
var xlsToCSV = function(workbook,sheetname) {
	var result = [];
	var csv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetname]);
	if (csv.length > 0) {
		result.push(sheetname);
		result.push(csv);
	}
	//return result.join("\n");
	return result;
};

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
			query={'statement':"MATCH (a{moduleID:'"+moduleId+"'})-[:FMTTS]->(b) RETURN b ORDER BY b.childIndex"};
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
			create_ice.getReleaseIDs_Nineteen68(project_id,function(err,data){
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
			create_ice.getCycleIDs_Nineteen68(rel_id,function(err,data){
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

					if(qData.gettestcases){
						res.status(200).send(result[0].data[0].row[0]);
					}
					else{
						var i = 0;
						while(i<qData['screen'].length){
							if(result[i].data[0].row[0]>1)
								qData['screen'][i].reuse = true;
							else
								qData['screen'][i].reuse = false;						
							qData['screen'][i].count = result[i].data[0].row[0];
							i = i+1;
						}
						var j = 0;
						while(j<qData['testcase'].length){
							if(result[i+j].data[0].row[0].length>1){
								qData['testcase'][j].reuse = true;
								qData['testcase'][j].oidlist = result[i+j].data[0].row[0];
							}
							else
								qData['testcase'][j].reuse = false;						
							j = j+1;
						}
						var k = 0;
						if(qData['scenarios']){
							while(k<qData['scenarios'].length){
								if(result[k].data.length>0 && (result[k].data[0].row[0]>1 || (result[k].data[0].row[0]==1 && qData['modules']!=result[k].data[0].row[1])))
									qData['scenarios'][k].reuse = true;
								else
									qData['scenarios'][k].reuse = false;						
								k = k+1;
							}
						}
						
						res.status(status).send(qData);	
					}
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
		var modName = d.modName;
		var relId=d.relId;
		var cycId=d.cycId;
		var qmod = ''
		if(modName == 'fetch all'){
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
					var attrDict={"modules_endtoend":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"modules":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"scenarios":{"projectID":"projectID","childIndex":"childIndex","moduleID":"pid_n","testScenarioName":"name","testScenarioID":"id_n","testScenarioID_c":"id_c"},"screens":{"projectID":"projectID","childIndex":"childIndex","testScenarioID":"pid_n","screenName":"name","screenID":"id_n","screenID_c":"id_c","taskexists":"taskexists"},"testcases":{"projectID":"projectID","childIndex":"childIndex","screenID":"pid_n","testCaseName":"name","testCaseID":"id_n","testCaseID_c":"id_c","taskexists":"taskexists"},"tasks":{"taskID":"id_n","task":"t","batchName":"bn","assignedTo":"at","reviewer":"rw","startDate":"sd","endDate":"ed","re_estimation":"re_estimation","release":"re","cycle":"cy","details":"det","nodeID":"pid","parent":"anc","cx":"cx"}};
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
										nData.push({id:n.id_n,oid:n.id,task:n.t,batchName:n.bn,assignedTo:n.at,reviewer:n.rw,startDate:n.sd,endDate:n.ed,re_estimation:n.re_estimation,release:n.re,cycle:n.cy,details:n.det,nodeID:n.pid,parent:n.anc.slice(1,-1).split(','),cx:n.cx});
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
		else if(modName){
			qmod = ',moduleName:"'+modName+'"';
			if(d.tab=='tabAssign' || d.tab=='endToend'){
				qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{projectID:'"+prjId+"' "+qmod+"})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
				qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{projectID:'"+prjId+"' "+qmod+"}) WHERE NOT (n)-[:FMTTS]->() RETURN n","resultDataContents":["graph"]});

			}
			qList.push({"statement":" MATCH path=(n:MODULES{projectID:'"+prjId+"' "+qmod+"})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
			qList.push({"statement":"MATCH path=(n:MODULES{projectID:'"+prjId+"' "+qmod+"}) WHERE NOT (n)-[:FMTTS]->() RETURN n","resultDataContents":["graph"]});
			//MATCH (a:MODULES) WHERE NOT (a)-[:FMTTS]->() return a

			neo4jAPI.executeQueries(qList,function(status,result){
				res.setHeader('Content-Type', 'application/json');
				if(status!=200) res.status(status).send(result);
				else{
					var k=0,rIndex=[],lbl,neoIdDict={},maps=[],tList=[];
					var attrDict={"modules_endtoend":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"modules":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"scenarios":{"projectID":"projectID","childIndex":"childIndex","moduleID":"pid_n","testScenarioName":"name","testScenarioID":"id_n","testScenarioID_c":"id_c"},"screens":{"projectID":"projectID","childIndex":"childIndex","testScenarioID":"pid_n","screenName":"name","screenID":"id_n","screenID_c":"id_c","taskexists":"taskexists"},"testcases":{"projectID":"projectID","childIndex":"childIndex","screenID":"pid_n","testCaseName":"name","testCaseID":"id_n","testCaseID_c":"id_c","taskexists":"taskexists"},"tasks":{"taskID":"id_n","task":"t","batchName":"bn","assignedTo":"at","reviewer":"rw","startDate":"sd","endDate":"ed","re_estimation":"re_estimation","release":"re","cycle":"cy","details":"det","nodeID":"pid","parent":"anc","cx":"cx"}};
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
										nData.push({id:n.id_n,oid:n.id,task:n.t,batchName:n.bn,assignedTo:n.at,reviewer:n.rw,startDate:n.sd,endDate:n.ed,re_estimation:n.re_estimation,release:n.re,cycle:n.cy,details:n.det,nodeID:n.pid,parent:n.anc.slice(1,-1).split(','),cx:n.cx});
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
			qList.push({"statement":" MATCH (n:MODULES{projectID:'"+prjId+"'}) RETURN n.moduleName,n.moduleID","resultDataContents":["row"]});
			if(d.tab=='tabAssign' || d.tab=='endToend'){
				qList.push({"statement":"MATCH (n:MODULES_ENDTOEND{projectID:'"+prjId+"'}) RETURN n.moduleName,n.moduleID","resultDataContents":["row"]});
			}

			neo4jAPI.executeQueries(qList,function(status,result){
				var modulenames = [];
				res.setHeader('Content-Type', 'application/json');
				if(status!=200) res.status(status).send(result);
				else{
					
					if(result[1]){
						result[1].data.forEach(function(e,i){
							modulenames.push({name:e.row[0],type:'modules_endtoend',id_n:e.row[1]});
						});	
					}
					result[0].data.forEach(function(e,i){
						modulenames.push({name:e.row[0],type:'modules',id_n:e.row[1]});
					});
					res.status(status).send(modulenames);

				}
			});			
		}
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
							var res_data=result;
							
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

function getRenameQueries(map,prjId){
	var rnmQList = [];
	map.forEach(function(e,i){
		if(e.renamed){
			if(e.type=='scenarios'){
				rnmQList.push({"statement":"MATCH(n:TESTSCENARIOS{testScenarioName:'"+e.orig_name+"',projectID:'"+prjId+"'})<-[r:FMTTS]-(m) SET n.testScenarioName='"+e.name+"'"});
			}
			if(e.type=='screens'){
				rnmQList.push({"statement":"MATCH(n:SCREENS{screenName:'"+e.orig_name+"',projectID:'"+prjId+"'}) SET n.screenName='"+e.name+"'"});
			}
			if(e.type=='testcases'){
				rnmQList.push({'statement':'Match (n:TESTCASES{testCaseName : "'+e.orig_name+'",projectID :"'+prjId+'"})<-[a:FSTTS]-(scr:SCREENS{screenName:"'+e.screenname+'"})  SET n.testCaseName="'+e.name+'"'});
			}
		}
	});
	return rnmQList;
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
		var selectedTab=inputs.selectedTab;
		var prjId=inputs.prjId;
		var deletednodes=inputs.deletednode;
		var user=req.session.username;
		var userrole=req.session.activeRole;
		var flag=inputs.write;
		var removeTask=inputs.unassignTask;
		var sendNotify=inputs.sendNotify;
		var relId=inputs.relId;
		var cycId=inputs.cycId;
		var idxDict=[];
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

		if(flag==10){
			var uidx=0,t,lts,rnmList=[];
			deletednodes.forEach(function(t,i){
				// Delete task if single connection
				qList.push({"statement":"MATCH (N) WHERE ID(N)="+t+" MATCH (N)-[r:FNTT]->(b) with b as b MATCH(b)<-[s:FNTT]-(M) WITH count(M) as rel_cnt,b as b  WHERE rel_cnt=1 DETACH DELETE b"});
				// Else delete just connection					
				qList.push({"statement":"MATCH (N) WHERE ID(N)="+t+" MATCH (N)-[r:FNTT]-(b) DELETE r"});
				// delete nodes in case renamed a reused node
				qList.push({"statement":"MATCH (N) WHERE ID(N)="+t+" DETACH DELETE N"});
			});
			//TO support task deletion
			removeTask.forEach(function(t,i){
				//Issue 1685 Release and cycle Id filters are given for task to delete the task only from that release and cycle attached to that node
				qList.push({"statement":"MATCH (N) WHERE ID(N)="+t+" MATCH (N)-[r:FNTT]-(b:TASKS{release:'"+relId+"',cycle:'"+cycId+"'}) DETACH DELETE b"});
			});

			data.forEach(function(e,i){
				idxDict[e.id]=i; 
			})

			data.forEach(function(e,i){
				idDict[e.id]=(e.id_n)?e.id_n:uuidV4();
				e.id=idDict[e.id];
				t=e.task;
				nameDict[e.id] = e.name;
				var taskstatus='assigned';
				// if(e.type=='modules_endtoend'){
				// 	if(e.oid!=null){
				// 		//qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS) DETACH DELETE r,o"});
				// 		if(e.renamed) qList.push({"statement":"MATCH(n:MODULES_ENDTOEND{moduleID:'"+e.id+"'}) SET n.moduleName='"+e.name+"'"+",n.unique_property='["+e.name+','+prjId+"]'"});
				// 	}
				// 	else qList.push({"statement":"MERGE(n:MODULES_ENDTOEND{projectID:'"+prjId+"',moduleName:'"+e.name+"',moduleID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',moduleID_c:'"+e.id_c+"',unique_property:'["+e.name+','+prjId+"]'}) SET n.childIndex='"+e.childIndex+"'"});
				// }
				if(e.type=='modules'){
					if(e.oid!=null){
					//Added new queries to allow saving of incomplete structure
						//qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS)-[s]->(p:SCREENS)-[t]->(q:TESTCASES) DETACH DELETE r,s,t,o,p,q"});
						// qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS)-[s]->(p:SCREENS)-[t]->(q:TESTCASES) DETACH DELETE t,q"});
						// qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS)-[s]->(p:SCREENS) DETACH DELETE s,p"});
						// qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS) DETACH DELETE r,o"});

						if(e.renamed) qList.push({"statement":"MATCH(n:MODULES{moduleID:'"+e.id+"'}) SET n.moduleName='"+e.name+"'"+",n.unique_property='["+e.name+','+prjId+"]'"});
					}
					else qList.push({"statement":"MERGE(n:MODULES{projectID:'"+prjId+"',moduleName:'"+e.name+"',moduleID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',moduleID_c:'"+e.id_c+"',unique_property:'["+e.name+','+prjId+"]'}) SET n.childIndex='"+e.childIndex+"'"}); 
				}
				else if(e.type=='scenarios' ){
				//Part of Issue 1685, take projectid from the scenarios in case of end to end modules
					var temp_prjID=prjId;
					
					// if (tab=='end_to_end'){
					// 	temp_prjID=e.projectID;
					// }
					if(e.state == 'created'){
						qList.push({"statement":"MERGE(n:TESTSCENARIOS{projectID:'"+temp_prjID+"',moduleID:'"+idDict[e.pid]+"',testScenarioName:'"+e.name+"',testScenarioID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',testScenarioID_c:'"+e.id_c+"'}) SET n.childIndex='"+e.childIndex+"'"});						
						// if(tab!='end_to_end'){
						// 	qList.push({"statement":"MATCH (a:MODULES{moduleID:'"+idDict[e.pid]+"'}),(b:TESTSCENARIOS{moduleID:'"+idDict[e.pid]+"'}) MERGE (a)-[r:FMTTS {id:'"+idDict[e.pid]+"'}]-(b)"});
						// }
						// else{
						qList.push({"statement":"MATCH (a:MODULES{moduleID:'"+idDict[e.pid]+"'}),(b:TESTSCENARIOS{moduleID:'"+idDict[e.pid]+"'}) MERGE (a)-[r:FMTTS {id:'"+idDict[e.pid]+"'}]-(b)"});
						// }	
					}
				}
				else if(e.type=='screens'){
					uidx++;lts=idDict[e.pid];
					if(e.state == 'created'){
						qList.push({"statement":"MERGE(n:SCREENS{projectID:'"+prjId+"',testScenarioID:'"+idDict[e.pid]+"',screenName:'"+e.name+"',screenID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',uid:'"+uidx+"',screenID_c:'"+e.id_c+"'})SET n.childIndex='"+e.childIndex+"'"});
						qList.push({"statement":"MATCH (a:TESTSCENARIOS{testScenarioID:'"+idDict[e.pid]+"'}),(b:SCREENS{testScenarioID:'"+idDict[e.pid]+"'}) MERGE (a)-[r:FTSTS {id:'"+idDict[e.pid]+"'}]-(b)"});			  	
					}
				}
				else if(e.type=='testcases' && e.state == 'created'){						
					if(e.pid_c!='null' && e.pid_c!=undefined){
						qList.push({"statement":"MERGE(n:TESTCASES{screenID:'"+idDict[e.pid]+"',screenName:'"+nameDict[idDict[e.pid]] +"',projectID:'" + prjId + "',testScenarioID:'"+lts+"',testCaseName:'"+e.name+"',testCaseID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',uid:'"+uidx+"',testCaseID_c:'"+e.id_c+"'}) SET n.screenID_c='"+e.pid_c+"',n.childIndex='"+e.childIndex+"'"});
					}else{
						qList.push({"statement":"MERGE(n:TESTCASES{screenID:'"+idDict[e.pid]+"',screenName:'"+nameDict[idDict[e.pid]] +"',projectID:'" + prjId + "',testScenarioID:'"+lts+"',testCaseName:'"+e.name+"',testCaseID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',uid:'"+uidx+"',testCaseID_c:'"+e.id_c+"'}) SET n.childIndex='"+e.childIndex+"'"});
					}
						qList.push({"statement":"MATCH (a:SCREENS{screenID:'"+idDict[e.pid]+"'}),(b:TESTCASES{screenID:'"+idDict[e.pid]+"'}) MERGE (a)-[r:FSTTS {id:'"+idDict[e.pid]+"'}]-(b)"});				   
				}
			});
			rnmList = getRenameQueries(data,prjId);
			data.forEach(function(e,i){
				var nodetype = {'modules':'moduleID','modules_endtoend':'moduleID','scenarios':'testScenarioID','screens':'screenID','testcases':'testCaseID'}
				var ntype = e.type.toUpperCase();
				if(ntype == 'SCENARIOS') ntype = 'TESTSCENARIOS';
				if(e.cidxch){
					qList.push({"statement":"MATCH (n:"+ntype+"{"+nodetype[e.type.toLowerCase()]+":'"+e.id+"'}) SET n.childIndex='"+e.childIndex+"'"});						
				}
			})				
			// if(tab!='end_to_end'){

			qList.push({"statement":"MATCH (a) remove a.uid"});
			qList=qList.concat(rnmList);
			qList.push({"statement":"MATCH path=(n:MODULES{moduleID:'"+data[0].id+"'}) WHERE NOT (n)-[:FMTTS]->() RETURN n","resultDataContents":["graph"]});
			qList.push({"statement":"MATCH path=(n:MODULES{moduleID:'"+data[0].id+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
			// }else{
				
			// qList.push({"statement":"MATCH (a) remove a.uid"});
			// qList=qList.concat(rnmList);
			// qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{moduleID:'"+data[0].id+"'}) WHERE NOT (n)-[:FMTTS]->() RETURN n","resultDataContents":["graph"]});
			// qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{moduleID:'"+data[0].id+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
			// }

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

					var attrDict={"modules_endtoend":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"modules":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"scenarios":{"projectID":"projectID","childIndex":"childIndex","moduleID":"pid_n","testScenarioName":"name","testScenarioID":"id_n","testScenarioID_c":"id_c"},"screens":{"projectID":"projectID","childIndex":"childIndex","testScenarioID":"pid_n","screenName":"name","screenID":"id_n","screenID_c":"id_c","taskexists":"taskexists"},"testcases":{"projectID":"projectID","childIndex":"childIndex","screenID":"pid_n","testCaseName":"name","testCaseID":"id_n","testCaseID_c":"id_c","taskexists":"taskexists"},"tasks":{"taskID":"id_n","task":"t","batchName":"bn","assignedTo":"at","reviewer":"rw","startDate":"sd","endDate":"ed","re_estimation":"re_estimation","release":"re","cycle":"cy","details":"det","nodeID":"pid","parent":"anc","cx":"cx"}};
					var jsonData=result;

					var new_res=jsonData[jsonData.length-1].data;
					if(new_res.length==0){
						new_res=jsonData[jsonData.length-2].data;
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
								if(lbl=="tasks") nData.push({id:n.id_n,oid:n.id,task:n.t,batchName:n.bn,assignedTo:n.at,reviewer:n.rw,startDate:n.sd,endDate:n.ed,re_estimation:n.re_estimation,release:n.re,cycle:n.cy,details:n.det,nodeID:n.pid,parent:n.anc.slice(1,-1).split(','),cx:n.cx});
								else{
									if(lbl=="modules" || lbl=="modules_endtoend") n.childIndex=0;
									nData.push({projectID:n.projectID,childIndex:n.childIndex,id:n.id,"type":lbl,name:n.name,id_n:n.id_n,pid_n:n.pid_n,id_c:n.id_c,children:[],task:null});
								}
								if(lbl=="modules" || lbl=="modules_endtoend") rIndex=k;
								idDict[n.id]=k;neoIdDict[n.id_n]=k;
								k++;
							}
						});
						row.graph.relationships.forEach(function(r){
							var srcIndex=idDict[r.startNode.toString()];
							var tgtIndex=idDict[r.endNode.toString()];
							//if(nData[tgtIndex].children===undefined) nData[srcIndex].task=nData[tgtIndex];
							//Part of Issue 1685, after saving of data proper task should be written since multiple tasks are conencte dto single node
							if(nData[tgtIndex].children===undefined){
								if((selectedTab=='tabAssign'&& nData[tgtIndex].release==relId && nData[tgtIndex].cycle==cycId)||tab=='tabCreate'||tab=='endToend'){
									nData[srcIndex].task=nData[tgtIndex];
								}else if(nData[srcIndex].type=='testcases' || nData[srcIndex].type=='screens'){
									nData[srcIndex].taskexists=nData[tgtIndex];
								}
									
							}
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
			var idn_v_idc = {};
			// var relId=inputs.relId;
			// var cycId=inputs.cycId;
			var qObj={"projectId":prjId,"releaseId":relId,"cycleId":cycId,"appType":"Web","testsuiteDetails":[],"userName":user,"userRole":userrole};
			var nObj=[],tsList=[];
			data.forEach(function(e,i){
				if(e.type=="modules") rIndex=uidx;
				if(e.task!=null) delete e.task.oid;
				idn_v_idc[e.id_n] = e.id_c;
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

			create_ice.createStructure_Nineteen68(qObj,function(err,data){
				if(err) {
					res.status(500).send(err);
				} else {
					var module_type='modules';
					var parsing_result=update_cassandraID(data,urlData,module_type,idn_v_idc);
					neo4jAPI.executeQueries(parsing_result[0],function(status,result){
						if(status!=200) res.status(status).send(result);
						else res.status(200).send(parsing_result[1]);
					});
				}
			});
		}
		else if(flag==30) {  //Assign
			removeTask.forEach(function(t,i){
				//Issue 1685 Release and cycle Id filters are given for task to delete the task only from that release and cycle attached to that node
				qList.push({"statement":"MATCH (N) WHERE ID(N)="+t+" MATCH (N)-[r:FNTT]-(b:TASKS{release:'"+relId+"',cycle:'"+cycId+"'}) DETACH DELETE b"});
			});		
			data.forEach(function(e,i){
				idxDict[e.id]=i; 
			})

			data.forEach(function(e,i){
				idDict[e.id]=(e.id_n)?e.id_n:uuidV4();
				e.id=idDict[e.id];
				t=e.task;						
				if((e.taskexists || e.task) && (e.type=='screens' || e.type=='testcases')){
					if(e.task==null){
						t=e.taskexists;
					}else if(e.taskexists){
						t.id=e.taskexists.id;
						t.oid=e.taskexists.oid;
						t.parent=e.taskexists.parent;
						//To fix issue 1685, not to update the task details unless the details comes from original release and cycle
						t.release=e.taskexists.release;
						t.cycle=e.taskexists.cycle;
					}
				}
				nameDict[e.id] = e.name;
				var taskstatus='assigned';
				if(e.type=='modules_endtoend'){
					if(t!=null && e.id_c !=null && (t.tstatus=='created' ||t.tstatus=='updated')){
						t.parent=[prjId].concat(e.id_c);
						t.id=(t.id!=null)?t.id:uuidV4();
						if(t.oid!=null){
						//Part of Issue 1685, before relID and cycId from create tab was undefined
							if (t.updatedParent != undefined){
								qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]',release:'"+t.release+"',cycle:'"+t.cycle+"'}) SET n.task='"+t.task+"',n.batchName='"+t.batchName+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.status='"+taskstatus+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
							}else{
								qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]',release:'"+t.release+"',cycle:'"+t.cycle+"'}) SET n.task='"+t.task+"',n.batchName='"+t.batchName+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"'"});
							}
						}
						else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',batchName:'"+t.batchName+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',status:'"+taskstatus+"',reviewer:'"+t.reviewer+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',re_estimation:'"+t.re_estimation+"',release:'"+relId+"',cycle:'"+cycId+"',details:'"+t.details+"',parent:'["+t.parent+"]'})"});
						qList.push({"statement":"MATCH (a:MODULES_ENDTOEND{moduleID:'"+e.id+"'}),(b:TASKS{taskID:'"+t.id+"'}) MERGE (a)-[r:FNTT {id:'"+e.id+"'}]-(b)"});				   
					}
				}
				else if(e.type=='modules'){
					if(t!=null && e.id_c !=null && (t.tstatus=='created' ||t.tstatus=='updated')){
						t.parent=[prjId].concat(e.id_c);
						t.id=(t.id!=null)?t.id:uuidV4();

						if(t.oid!=null){
						//Part of Issue 1685, before relID and cycId from create tab was undefined
							if (t.updatedParent != undefined){
								qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]',release:'"+t.release+"',cycle:'"+t.cycle+"'}) SET n.task='"+t.task+"',n.batchName='"+t.batchName+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.status='"+taskstatus+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
							}else{
								qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]',release:'"+t.release+"',cycle:'"+t.cycle+"'}) SET n.task='"+t.task+"',n.batchName='"+t.batchName+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"'"});
							}
						}
						else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',batchName:'"+t.batchName+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',status:'"+taskstatus+"',reviewer:'"+t.reviewer+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',re_estimation:'"+t.re_estimation+"',release:'"+relId+"',cycle:'"+cycId+"',details:'"+t.details+"',parent:'["+t.parent+"]'})"});
						qList.push({"statement":"MATCH (a:MODULES{moduleID:'"+e.id+"'}),(b:TASKS{taskID:'"+t.id+"'}) MERGE (a)-[r:FNTT {id:'"+e.id+"'}]-(b)"});
					}		 
				}
				else if(e.type=='scenarios'){
				//Part of Issue 1685, take projectid from the scenarios in case of end to end modules
					var temp_prjID=prjId;

					if (tab=='end_to_end'){
						temp_prjID=e.projectID;
					}

					//Supporting task assignment for scenarios
					if(t!=null && e.id_c!=null && (t.tstatus=='created' ||t.tstatus=='updated')){
						t.parent=[temp_prjID].concat(e.pid_c,e.id_c);
						t.id=(t.id!=null)?t.id:uuidV4();
						if(t.oid!=null){
							if (t.updatedParent != undefined){
								qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]',release:'"+t.release+"',cycle:'"+t.cycle+"'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.parent='["+[temp_prjID].concat(t.updatedParent)+"]',n.cx='"+t.cx+"'"});
							}else{
								qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]',release:'"+t.release+"',cycle:'"+t.cycle+"'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.cx='"+t.cx+"'"});
							}
						}
						else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',reviewer:'"+t.reviewer+"',status:'"+taskstatus+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',re_estimation:'"+t.re_estimation+"',release:'"+relId+"',cycle:'"+cycId+"',details:'"+t.details+"',parent:'["+t.parent+"]',cx:'"+t.cx+"'})"});
						qList.push({"statement":"MATCH (a:TESTSCENARIOS{projectID:'"+temp_prjID+"',testScenarioName:'"+e.name+"',testScenarioID:'"+e.id+"'}),(b:TASKS{taskID:'"+t.id+"'}) MERGE (a)-[r:FNTT {id:a.testScenarioID}]-(b)"});
					}
					if(tab!='end_to_end'){
						qList.push({"statement":"MATCH (m:MODULES)-[mt]-(c:TESTSCENARIOS{projectID:'"+temp_prjID+"',testScenarioName:'"+e.name+"',testScenarioID:'"+e.id+"'}) ,(a:TASKS) where not c.testScenarioID_c='null' and a.parent=~('.*'+m.moduleID_c+','+c.testScenarioID_c+']') MERGE (c)-[rel:FNTT {id:c.testScenarioID}]-(a)"});	
					}
					else{
						qList.push({"statement":"MATCH (m:MODULES_ENDTOEND)-[mt]-(c:TESTSCENARIOS{projectID:'"+temp_prjID+"',testScenarioName:'"+e.name+"',testScenarioID:'"+e.id+"'}) ,(a:TASKS) where not c.testScenarioID_c='null' and a.parent=~('.*'+m.moduleID_c+','+c.testScenarioID_c+']') MERGE (c)-[rel:FNTT {id:c.testScenarioID}]-(a)"});
					}						
					//else if(e.id_n==null){ // In case added first time to end to end then connect to all task if exist
												
					//}						
					//qList.push({"statement":"MATCH(n:TESTSCENARIOS{testScenarioID:'"+e.id+"'}) SET n.testScenarioName='"+e.name+"'"+",n.projectID='"+prjId+"'"});

				}
				else if(e.type=='screens'){
					uidx++;lts=idDict[e.pid];

					if(t!=null && e.id_c!=null && (t.tstatus=='created' ||t.tstatus=='updated')){
						t.id=(t.id!=null)?t.id:uuidV4();
						if(t.oid!=null){
						//Part of Issue 1685
							if(relId==t.release && cycId==t.cycle){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.status='"+taskstatus+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.uid='"+uidx+"',n.parent='["+[prjId].concat(t.updatedParent)+"]',n.cx='"+t.cx+"'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.status='"+taskstatus+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.uid='"+uidx+"',n.cx='"+t.cx+"'"});
								}
							}
							
						}
						else if(!t.copied){
							// If reused 
							t.parent=[prjId].concat(t.parent);
							qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',reviewer:'"+t.reviewer+"',status:'"+taskstatus+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',release:'"+t.release+"',cycle:'"+t.cycle+"',re_estimation:'"+t.re_estimation+"',details:'"+t.details+"',parent:'["+t.parent+"]',uid:'"+uidx+"',cx:'"+t.cx+"'})"});
						}		 
						qList.push({"statement":"MATCH (a:SCREENS{screenID_c:'"+e.id_c+"'}),(b:TASKS{taskID:'"+t.id+"'}) MERGE (a)-[r:FNTT {id:a.screenID}]-(b)"});
					}
				}
				else if(e.type=='testcases'){
					var screenid_c='null';

					if(t!=null  && e.id_c!=null && (t.tstatus=='created' ||t.tstatus=='updated')){
						t.id=(t.id!=null)?t.id:uuidV4();
						//var parent=[prjId].concat(t.parent);
						if(t.oid!=null){
						//Part of Issue 1685
							if(relId==t.release && cycId==t.cycle){
								if (t.updatedParent != undefined){
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.status='"+taskstatus+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.uid='"+uidx+"',n.parent='["+[prjId].concat(t.updatedParent)+"]',n.cx='"+t.cx+"'"});
								}else{
									qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.status='"+taskstatus+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.uid='"+uidx+"',n.cx='"+t.cx+"'"});
								}
							}
						}
						else if(!t.copied){
							t.parent=[prjId].concat(t.parent);
							qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',status:'"+taskstatus+"',reviewer:'"+t.reviewer+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',release:'"+t.release+"',cycle:'"+t.cycle+"',re_estimation:'"+t.re_estimation+"',details:'"+t.details+"',parent:'["+t.parent+"]',uid:'"+uidx+"',cx:'"+t.cx+"'})"});
						}
							//In case of reuse
						qList.push({"statement":"MATCH (a:TESTCASES{testCaseID_c:'"+e.id_c+"'}),(b:TASKS{taskID:'"+t.id+"'}) MERGE (a)-[r:FNTT {id:a.testCaseID}]-(b)"});								   
					}
				}
			});
			if(tab!='end_to_end'){
				qList.push({"statement":"MATCH (a) remove a.uid"});
				//qList=qList.concat(rnmList);
				qList.push({"statement":"MATCH path=(n:MODULES{moduleID:'"+data[0].id+"'}) WHERE NOT (n)-[:FMTTS]->() RETURN n","resultDataContents":["graph"]});
				qList.push({"statement":"MATCH path=(n:MODULES{moduleID:'"+data[0].id+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});
			}else{
				qList.push({"statement":"MATCH (a) remove a.uid"});
				//qList=qList.concat(rnmList);
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

					var attrDict={"modules_endtoend":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"modules":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"scenarios":{"projectID":"projectID","childIndex":"childIndex","moduleID":"pid_n","testScenarioName":"name","testScenarioID":"id_n","testScenarioID_c":"id_c"},"screens":{"projectID":"projectID","childIndex":"childIndex","testScenarioID":"pid_n","screenName":"name","screenID":"id_n","screenID_c":"id_c","taskexists":"taskexists"},"testcases":{"projectID":"projectID","childIndex":"childIndex","screenID":"pid_n","testCaseName":"name","testCaseID":"id_n","testCaseID_c":"id_c","taskexists":"taskexists"},"tasks":{"taskID":"id_n","task":"t","batchName":"bn","assignedTo":"at","reviewer":"rw","startDate":"sd","endDate":"ed","re_estimation":"re_estimation","release":"re","cycle":"cy","details":"det","nodeID":"pid","parent":"anc","cx":"cx"}};
					var jsonData=result;

					var new_res=jsonData[jsonData.length-1].data;
					if(new_res.length==0){
						new_res=jsonData[jsonData.length-2].data;
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
								if(lbl=="tasks") nData.push({id:n.id_n,oid:n.id,task:n.t,batchName:n.bn,assignedTo:n.at,reviewer:n.rw,startDate:n.sd,endDate:n.ed,re_estimation:n.re_estimation,release:n.re,cycle:n.cy,details:n.det,nodeID:n.pid,parent:n.anc.slice(1,-1).split(','),cx:n.cx});
								else{
									if(lbl=="modules" || lbl=="modules_endtoend") n.childIndex=0;
									nData.push({projectID:n.projectID,childIndex:n.childIndex,id:n.id,"type":lbl,name:n.name,id_n:n.id_n,pid_n:n.pid_n,id_c:n.id_c,children:[],task:null});
								}
								if(lbl=="modules" || lbl=="modules_endtoend") rIndex=k;
								idDict[n.id]=k;neoIdDict[n.id_n]=k;
								k++;
							}
						});
						row.graph.relationships.forEach(function(r){
							var srcIndex=idDict[r.startNode.toString()];
							var tgtIndex=idDict[r.endNode.toString()];
							//if(nData[tgtIndex].children===undefined) nData[srcIndex].task=nData[tgtIndex];
							//Part of Issue 1685, after saving of data proper task should be written since multiple tasks are conencte dto single node
							if(nData[tgtIndex].children===undefined){
								if((selectedTab=='tabAssign'&& nData[tgtIndex].release==relId && nData[tgtIndex].cycle==cycId)||tab=='tabCreate'||tab=='endToend'){
									nData[srcIndex].task=nData[tgtIndex];
								}else if(nData[srcIndex].type=='testcases' || nData[srcIndex].type=='screens'){
									nData[srcIndex].taskexists=nData[tgtIndex];
								}
									
							}
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
	} else{
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
		var userrole=req.session.activeRole;
		var flag=inputs.write;
		var relId=inputs.relId;
		var cycId=inputs.cycId;
		//TO support task deletion
		var removeTask=inputs.unassignTask;
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
								qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]',release:'"+t.release+"',cycle:'"+t.cycle+"'}) SET n.task='"+t.task+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+",n.status='"+taskstatus+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
							}else{
								qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]',release:'"+t.release+"',cycle:'"+t.cycle+"'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"'"});
							}
						}
						else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',status:'"+taskstatus+"',reviewer:'"+t.reviewer+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',re_estimation:'"+t.re_estimation+"',release:'"+relId+"',cycle:'"+cycId+"',details:'"+t.details+"',parent:'["+t.parent+"]'})"});
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
								qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]',release:'"+relId+"',cycle:'"+cycId+"'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"',n.parent='["+[prjId].concat(t.updatedParent)+"]'"});
							}else{
								qList.push({"statement":"MATCH(n:TASKS{taskID:'"+t.id+"',parent:'["+t.parent+"]',release:'"+relId+"',cycle:'"+cycId+"'}) SET n.task='"+t.task+"',n.status='"+taskstatus+"',n.assignedTo='"+t.assignedTo+"',n.reviewer='"+t.reviewer+"',n.startDate='"+t.startDate+"',n.endDate='"+t.endDate+"',n.re_estimation='"+t.re_estimation+"',n.details='"+t.details+"'"});
							}
						}
						else qList.push({"statement":"MERGE(n:TASKS{taskID:'"+t.id+"',task:'"+t.task+"',assignedTo:'"+t.assignedTo+"',reviewer:'"+t.reviewer+"',status:'"+taskstatus+"',startDate:'"+t.startDate+"',endDate:'"+t.endDate+"',re_estimation:'"+t.re_estimation+"',release:'"+relId+"',cycle:'"+cycId+"',details:'"+t.details+"',parent:'["+t.parent+"]'})"});
						qList.push({"statement":"MATCH (a:TESTSCENARIOS{projectID:'"+e.projectID+"',testScenarioName:'"+e.name+"'}),(b:TASKS{taskID:'"+t.id+"'}) MERGE (a)-[r:FNTT {id:a.testScenarioID}]-(b)"});
					}
					qList.push({"statement":"MATCH (m:MODULES_ENDTOEND)-[mt]-(c:TESTSCENARIOS{projectID:'"+prjId+"',testScenarioName:'"+e.name+"',testScenarioID:'"+e.id+"'}) ,(a:TASKS) where not c.testScenarioID_c='null' and a.parent=~('.*'+m.moduleID_c+','+c.testScenarioID_c+']') MERGE (c)-[rel:FNTT {id:c.testScenarioID}]-(a)"});							
					// else if(e.id_n==null){ // In case added first time to end to end then connect to all task if exist
					// 	qList.push({"statement":"MATCH (a:TASKS)<-[r]-(b:TESTSCENARIOS{projectID:'"+prjId+"',testScenarioName:'"+e.name+"'}),(c:TESTSCENARIOS{projectID:'"+e.projectID+"',testScenarioName:'"+e.name+"'}) MERGE (c)-[rel:FNTT {id:c.testScenarioID}]-(a)"});							
					// }
				}
			});
			
			qList.push({"statement":"MATCH (a) remove a.uid"});
			qList=qList.concat(rnmList);
			qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{moduleID:'"+data[0].id+"'}) WHERE NOT (n)-[:FMTTS]->() RETURN n","resultDataContents":["graph"]});
			qList.push({"statement":"MATCH path=(n:MODULES_ENDTOEND{moduleID:'"+data[0].id+"'})-[r*1..]->(t) RETURN path","resultDataContents":["graph"]});

			neo4jAPI.executeQueries(qList,function(status,result){
				if(status!=200){
					var error_msg='Fail';
					result=JSON.stringify(result)
					if(result.indexOf('Schema.ConstraintValidationFailed')>-1){
						error_msg='DuplicateModules';
					}
					res.status(status).send(error_msg);
				} else{
					res.setHeader('Content-Type', 'application/json');
					var k=0,rIndex,lbl,neoIdDict={};
					idDict={};
					var attrDict={"modules_endtoend":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"modules":{"childIndex":"childIndex","projectID":"projectID","moduleName":"name","moduleID":"id_n","moduleID_c":"id_c"},"scenarios":{"projectID":"projectID","childIndex":"childIndex","moduleID":"pid_n","testScenarioName":"name","testScenarioID":"id_n","testScenarioID_c":"id_c"},"screens":{"projectID":"projectID","childIndex":"childIndex","testScenarioID":"pid_n","screenName":"name","screenID":"id_n","screenID_c":"id_c","taskexists":"taskexists"},"testcases":{"projectID":"projectID","childIndex":"childIndex","screenID":"pid_n","testCaseName":"name","testCaseID":"id_n","testCaseID_c":"id_c","taskexists":"taskexists"},"tasks":{"taskID":"id_n","task":"t","batchName":"bn","assignedTo":"at","reviewer":"rw","startDate":"sd","endDate":"ed","re_estimation":"re_estimation","release":"re","cycle":"cy","details":"det","nodeID":"pid","parent":"anc","cx":"cx"}};
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
		} else if(flag==20){
			var uidx=0,rIndex;
			var vn_from=inputs.vn_from;
			var vn_to=inputs.vn_from;
			var qObj={"projectId":prjId,"testsuiteDetails":[],"userName":user,"userRole":userrole,"from_version":parseFloat(vn_from),"new_version":vn_to};
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

			create_ice.createE2E_Structure_Nineteen68(qObj,function(err,data){
				if(err){
					logger.error(err);
					res.status(500).send('Fail');
				} else{
					var module_type='modules_endtoend';
					var parsing_result=update_cassandraID(data,urlData,module_type);
					neo4jAPI.executeQueries(parsing_result[0],function(status,result){
						if(status!=200) res.status(status).send(result);
						else res.status(200).send(parsing_result[1]);
					});
				}
			});
		}
	} else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
}

function getQueries(qdata){
	var qList_reuse= [];
	if(qdata.gettestcases){	//for a reused screen fetches all the testcases
		qList_reuse.push({'statement':'Match (n:SCREENS{screenName :"'+qdata.screen[0].screenname+'",projectID :"'+qdata['projectid']+'"})-[r]-(m:TESTCASES) return distinct collect(ID(m))'});
	}
	else{
		if(qdata.versionNumber!=undefined){
			//Reuse in case of versioning
			if (qdata.scenarios!=undefined){
				qdata['scenarios'].forEach(function(e,i){
					qList_reuse.push({'statement':'Match (n:TESTSCENARIOS{testScenarioName : "'+e.scenarioname+'",projectID :"'+qdata['projectid']+'"})<-[s:FMTTS]-(m:MODULES)<-[t:FVTM]-(v:VERSION{versionNumber:'+qdata['versionNumber']+'}) return count(n),m.moduleName'});
				})
			}else{
				qdata['screen'].forEach(function(e,i){
					qList_reuse.push({'statement':'Match (n:SCREENS{screenName : "'+e.screenname+'",projectID :"'+qdata['projectid']+'"})<-[r:FTSTS]-(ts:TESTSCENARIOS)<-[s:FMTTS]-(m:MODULES)<-[t:FVTM]-(v:VERSION{versionNumber:'+qdata['versionNumber']+'}) return count(n)'});
				})
				qdata['testcase'].forEach(function(e,i){
					qList_reuse.push({'statement':'Match (n:TESTCASES{testCaseName : "'+e.testcasename+'",projectID :"'+qdata['projectid']+'"})<-[a:FSTTS]-(scr:SCREENS{screenName:"'+e.screenname+'"})<-[r:FTSTS]-(ts:TESTSCENARIOS)<-[s:FMTTS]-(m:MODULES)<-[t:FVTM]-(v:VERSION{versionNumber:'+qdata['versionNumber']+'}) return collect(ID(n))'});
				})
			}
					
		}
		else{
			if (qdata.scenarios!=undefined){
				qdata['scenarios'].forEach(function(e,i){
					qList_reuse.push({'statement':'Match (n:TESTSCENARIOS{testScenarioName : "'+e.scenarioname+'",projectID :"'+qdata['projectid']+'"})<-[s:FMTTS]-(m:MODULES) return count(n),m.moduleName'});
				})
			}else{
				qdata['screen'].forEach(function(e,i){
					qList_reuse.push({'statement':'Match (n:SCREENS{screenName : "'+e.screenname+'",projectID :"'+qdata['projectid']+'"}) return count(n)'});
				})
				qdata['testcase'].forEach(function(e,i){
					qList_reuse.push({'statement':'Match (n:TESTCASES{testCaseName : "'+e.testcasename+'",projectID :"'+qdata['projectid']+'"})<-[a:FSTTS]-(scr:SCREENS{screenName:"'+e.screenname+'"}) return collect(ID(n))'});
				})
			}
			
		}
	}

	return qList_reuse;
}

var update_cassandraID = function(d,urlData,module_type,idn_v_idc = null) {
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
		if(!(idn_v_idc && idn_v_idc[e.testsuiteId] == moduleID_c_json)){
			if (module_type=='modules'){
				qList_new.push({"statement":"MATCH (a:MODULES) WHERE a.moduleName='"+modulename_json+"' and a.projectID='"+data.projectId+"' SET a.moduleID_c='"+moduleID_c_json+"'"});
			}else
			qList_new.push({"statement":"MATCH (a:MODULES_ENDTOEND) WHERE a.moduleName='"+modulename_json+"' and a.projectID='"+data.projectId+"' SET a.moduleID_c='"+moduleID_c_json+"'"});	
		}
		cassandraId_dict[moduleID_json]=moduleID_c_json;
		//updateJson.push(cassandraId_dict);
			testscenarioDetails_json.forEach(function(sc,i){
				var testscenarioId_json=sc.testscenarioId;
				var testscenarioname_json=sc.testscenarioName;
				var testscenarioId_c_json=sc.testscenarioId_c;
				//var modulename_json=sc.testsuiteName;
				var screenDetails_json=sc.screenDetails;
				//console.log(testscenarioId_json,testscenarioId_c_json);
				if(!(idn_v_idc && idn_v_idc[sc.testscenarioId] == testscenarioId_c_json)){
					if (module_type=='modules')
						qList_new.push({"statement":"MATCH (a:TESTSCENARIOS) WHERE a.testScenarioName='"+testscenarioname_json+"' and a.projectID='"+data.projectId+"' SET a.testScenarioID_c='"+testscenarioId_c_json+"'"});
					else{
						qList_new.push({"statement":"MATCH (a:TESTSCENARIOS) WHERE a.testScenarioName='"+testscenarioname_json+"' and a.projectID='"+sc.scenario_PrjId+"' SET a.testScenarioID_c='"+testscenarioId_c_json+"'"});
					}
				}
				cassandraId_dict[testscenarioId_json]=testscenarioId_c_json;
				screenDetails_json.forEach(function(scr,i){
					var screenId_json=scr.screenId;
					var screenId_c_json=scr.screenId_c;
					var screenname_json=scr.screenName;
					//var modulename_json=sc.testsuiteName;
					var testcaseDetails_json=scr.testcaseDetails;
					if(!(idn_v_idc && idn_v_idc[scr.screenId] == screenId_c_json)){
						qList_new.push({"statement":"MATCH (a:SCREENS) WHERE a.screenName='"+screenname_json+"' and a.projectID='"+data.projectId+"' SET a.screenID_c='"+screenId_c_json+"'"});
						//Screen Task update in case of reuse
						//qList_new.push({"statement":"MATCH p=(a:SCREENS{screenID_c:'"+screenId_c_json+"'})-[r]-(b:TASKS),(q:SCREENS{screenID_c:'"+screenId_c_json+"'}) MERGE (q)-[s:FNTT{id:q.screenID}]-(b)"});
						// reg ex query
						qList_new.push({"statement":"MATCH (c:TASKS) ,(d:SCREENS{screenID:'"+scr.screenId+"'}) where c.parent=~('.*,'+d.screenID_c+']') MERGE (d)-[t:FNTT{id:d.screenID}]-(c)"});

						//qList_new.push({"statement":"MATCH (a:SCREENS) WHERE a.screenName='"+screenname_json+"' and a.projectID='"+data.projectId+"' SET a.screenID_c='"+screenId_c_json+"'"});
						//updateJson.push({screenId_json:screenId_c_json});	
					}					
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
						}
						if(!(idn_v_idc && idn_v_idc[tc.testcaseId] == testcaseId_c_json)){
							qList_new.push({"statement":"MATCH (a:TESTCASES) WHERE a.testCaseName='"+testcaseName_json+"' and a.screenID_c='"+screenId_c_json+"' SET a.testCaseID_c='"+testcaseId_c_json+"'"});
							//TestCase Task update in case of reuse
							//qList_new.push({"statement":"MATCH (a:SCREENS{screenID_c:'"+screenId_c_json+"'})-[r]-(b:TESTCASES{testCaseID_c:'"+testcaseId_c_json+"'})-[s]-(c:TASKS) ,(d:TESTCASES{testCaseID_c:'"+testcaseId_c_json+"'}) MERGE (d)-[t:FNTT{id:d.testCaseID}]-(c)"});
							qList_new.push({"statement":"MATCH (c:TASKS) ,(d:TESTCASES{testCaseID:'"+tc.testcaseId+"'}) where c.parent=~('.*'+d.testCaseID_c+']') MERGE (d)-[t:FNTT{id:d.testCaseID}]-(c)"});
						}
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

exports.excelToMindmap = function(req,res){
	var wb1 = xlsx.read(req.body.data.content, {type:'binary'});
	if(req.body.data.flag == 'sheetname'){
		res.status(200).send(wb1.SheetNames);
		return;
	}
	try{
		var myCSV=xlsToCSV(wb1,req.body.data.sheetname);
	}
	catch(exc){
		console.log(exc);
	}
	var numSheets=myCSV.length/2;
	var qObj=[];
	var err;
	for(var k=0;k<numSheets;k++){
		var cSheet=myCSV[k*2+1];
		var cSheetRow=cSheet.split('\n');
		var scoIdx=-1,scrIdx=-1,sctIdx=-1;
		var uniqueIndex=0;
		cSheetRow[0].split(',').forEach(function(e,i) {
			if(/module/i.test(e))modIdx=i;
			if(/scenario/i.test(e))scoIdx=i;
			if(/screen/i.test(e))scrIdx=i;
			if(/script/i.test(e))sctIdx=i;
		});
		if(modIdx==-1||scoIdx==-1||scrIdx==-1||sctIdx==-1||cSheetRow.length<2){
			err=true;
			break;
		}
		var e,lastSco=-1,lastScr=-1,nodeDict={},scrDict={};
		for(var i=1;i<cSheetRow.length;i++){
			var row=cSheetRow[i].split(',');
			if(row.length<3) continue;
			if(row[modIdx]!==''){
				e={id:uuidV4(),name:row[modIdx],type:0};
				qObj.push(e);
			}
			if(row[scoIdx]!==''){
				lastSco=uniqueIndex;lastScr=-1;scrDict={};
				e={id:uuidV4(),name:row[scoIdx],type:1};
				qObj.push(e);
				nodeDict[e.id]=uniqueIndex;
				uniqueIndex++;
			}
			if(row[scrIdx]!=='' && lastSco!=-1){
				var tName=row[scrIdx];
				var lScr=qObj[lastScr];
				if(lScr===undefined||(lScr&&lScr.name!==tName)) {
					if(scrDict[tName]===undefined) scrDict[tName]=uuidV4();
					lastScr=uniqueIndex;
					e={id:scrDict[tName],name:tName,type:2,uidx:lastScr};
					qObj.push(e);
					nodeDict[e.id]=uniqueIndex;
					uniqueIndex++;
				}
			}
			if(row[sctIdx]!=='' && lastScr!=-1){
				e={id:uuidV4(),name:row[sctIdx],type:3,uidx:lastScr};
				qObj.push(e);
				nodeDict[e.id]=uniqueIndex;
				uniqueIndex++;
			}
		}
	}
	var tSt,qList=[];
	if(err){
		res.status(200).send('fail');
	}
	else
		res.status(200).send(qObj);
	
}

exports.getScreens=function(req,res){
	logger.info("Inside UI service: populateScenarios");
	if (utils.isSessionActive(req.session)) {
		var d=req.body;
		var prjId=d.projectId;
		var screenList = [];
		var testCasesList = [];
		var qList = [];
		qList.push({'statement':"MATCH (n:SCREENS{projectID:'"+prjId+"'}) RETURN n.screenID_c,n.screenID,n.screenName,ID(n)"});
		qList.push({'statement':"MATCH (n:TESTCASES{projectID:'"+prjId+"'}) RETURN n.testCaseID_c,n.testCaseID,n.testCaseName,ID(n)"});
		
		var scenarioList=[];
		neo4jAPI.executeQueries(qList,function(status,result){
			res.setHeader('Content-Type', 'application/json');
			if(status!=200) res.status(status).send(result);
				try{
					result[0].data.forEach(function(e,i){
						screenList.push({'name':e.row[2],'id_c':e.row[0],'id_n':e.row[1],'id':e.row[3]})
					})
					result[1].data.forEach(function(e,i){
						testCasesList.push({'name':e.row[2],'id_c':e.row[0],'id_n':e.row[1],'id':e.row[3]})
					})
					// res_data=result;
					// res_data[0].data.forEach(function(row){
					// 	scenarioList.push(row.row[0])
					// });
					 res.status(200).send({'screenList':screenList,'testCaseList':testCasesList});
					}catch(ex){
						logger.error("exception in mindmapService: ",ex);
						res.status(200).send('fail');
					}

			});
	}
	else{
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

}

exports.exportToExcel = function(req,res){
	logger.info("Writing  Module structure to Excel");
	if(utils.isSessionActive(req.session)){
		
		var d = req.body;
		var excelMap = d.excelMap;
		var dir = './../../excel';
		var filepath1 = path.join(__dirname,'../../excel');
		var filePath = path.join(__dirname,'../../excel','samp234.xlsx');

        try {
			//to remove the created files
			fs.unlinkSync(path.join(filePath));
		} catch(e){
            logger.error("Error in loading excel ",e);
		}
		try{
			if (!fs.existsSync(filepath1)){
				console.log("inside directory");
    				fs.mkdirSync(filepath1);
					//console.log("created"+dir);
			}
		}
		catch(e){
			logger.error("exception in mindmapService: ",ex);
		}
		
		//create a new workbook file in current working directory
		var workbook = excelbuilder.createWorkbook("./excel","samp234.xlsx");
		
		console.log(excelMap.name);
		
		
		//create the new worksheet with 10 coloumns and 20 rows
		var sheet1 = workbook.createSheet('sheet1',10,20);
		//var dNodes = [];
		var curr = {};
		//var dNodes = [];
		curr = excelMap;
		

var sce_row_count = 2;
var scr_row_count = 2;
var tes_row_count = 2;


//To fill some data

    sheet1.width(1, 40);sheet1.height(1, 20);sheet1.width(2, 40);sheet1.height(2, 20);
    sheet1.width(3, 40);sheet1.height(3, 20);sheet1.width(4, 40);sheet1.height(4, 20);
    sheet1.set(1,1,'Module');sheet1.set(2,1,'Scenario');
    sheet1.set(3,1,'Screen');sheet1.set(4,1,'Script');

	 sheet1.set(1,2,curr.name);
	 try{
     //loop to iterate through number of scenarios
     for(i=0 ; i<curr.children.length; i++){
         sheet1.set(2,sce_row_count,curr.children[0].name);
         //loop to iterate through number of screens
        for(j=0 ; j<curr.children[i].children.length; j++){
            sheet1.set(3,scr_row_count,curr.children[i].children[j].name);
            //loop through number of test cases
            for(k=0 ; k<curr.children[i].children[j].children.length ; k++){
                sheet1.set(4,tes_row_count,curr.children[i].children[j].children[k].name);
                tes_row_count++;

            }
            scr_row_count = tes_row_count;
        }
        sce_row_count = tes_row_count;
     }



//save it 
    workbook.save(function(ok){
        //if(!ok)
           // workbook.cancel();
        //else
			//console.log("workbook created");
			
    
			console.log(__dirname);
			
			res.writeHead(200, {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				
			});
			var rstream = fs.createReadStream(filePath);
			rstream.pipe(res);
			
	});
	

	
	
	  
}catch(ex){
	logger.error("exception in mindmapService: ",ex);
	
}
	
	}
	else{
		logger.error("Invalid session");
		res.send("Invalid Session");
	}
}

exports.getDomain = function(req,res){
	admin.getDomains_ICE(req,res);
}