var fs = require('fs');
var http = require('http');
var https = require('https');
var uuidV4 = require('uuid/v4');
//var router = express.Router();
var create_ice = require('../controllers/create_ice');
var neo4jAPI = require('../controllers/neo4jAPI');
var async = require('async');
var certificate = fs.readFileSync('server/https/server.crt', 'utf-8');
var Client = require("node-rest-client").Client;
var client = new Client({ connection: { rejectUnauthorized: false } });

// /* Send queries to Neo4J/ICE API. */
// var reqToAPI = function(d,u,p,callback) {
// 	try{
// 		var neoUrl="https://"+u[0]+":"+u[1]+p;
// 		var args={
// 			"data":d,
//             "headers": {
// 				'Accept': 'application/json',
// 				'Content-Type': 'application/json',
// 			}
// 		};
// 		client.post(neoUrl,args,function(resData,response){
// 			if (response.statusCode != 200) callback("fail",400,null);
// 			else callback(null,response.statusCode,resData);
// 		});
// 	}catch(ex){
// 		console.log(ex);
// 	}

// };



/* POST Mindmap*/
exports.versioning = function (req, res, next) {
	//if(!req.session.uniqueID) res.status(401).send('Session Timed Out! Login Again');
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
		var d = req.body;
		var prjId = d.projectId;

		var urlData = req.get('host').split(':');
		if (d.task == 'getVersions') {
			//prjId=d.projectId;
			var qList = [{ "statement": "MATCH (n:VERSION{projectID:'" + prjId + "'}) RETURN n.vn" }];
			neo4jAPI.executeQueries(qList, function (status, result) {
				//res.setHeader('Content-Type', 'application/json');
				if (status != 200) res.status(status).send(result);
				else {
					var jsonData = result[0].data;
					if (jsonData.length == 0 || jsonData[0].row[0] == null) {
						var vn = '0.0';
						qList = [({ "statement": "MERGE(n:VERSION{projectID:'" + prjId + "',moduleIDs:[],versionNumber:" + vn + ",vn:'" + vn + "',versionId:'" + uuidV4() + "'})" })];
						neo4jAPI.executeQueries(qList, function (status, result) {
							//res.setHeader('Content-Type', 'application/json');
							if (status != 200) res.status(status).send(result);
							else {
								res.status(status).send([vn]);
							}
						});
					} else {
						var list = [];
						jsonData.forEach(function (d) {
							list.push(d.row[0])
						})
						//jsonData=JSON.stringify(list);
						res.status(status).send(list);
					}
					//res.setHeader('Content-Type', 'application/json');

				}
			});
		}


		else if (d.task == 'getModules') {
			var nData = [], qList = [], idDict = {};
			prjId = d.prjId;
			version = d.version;
			qList.push({ "statement": " MATCH path=(n:VERSION{projectID:'" + prjId + "',versionNumber:" + version + "})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });
			qList.push({ "statement": "MATCH path=(n:VERSION{projectID:'" + prjId + "',versionNumber:" + version + "}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
			neo4jAPI.executeQueries(qList, function (status, result) {
				res.setHeader('Content-Type', 'application/json');
				if (status != 200) res.status(status).send(result);
				else {
					var k = 0, rIndex = [], lbl, neoIdDict = {}, maps = [], tList = [];
					var attrDict = { "modules_endtoend": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "modules": { "childIndex": "childIndex", "projectID": "pid_n", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "scenarios": { "projectID": "projectID", "childIndex": "childIndex", "moduleID": "pid_n", "testScenarioName": "name", "testScenarioID": "id_n", "testScenarioID_c": "id_c" }, "screens": { "childIndex": "childIndex", "testScenarioID": "pid_n", "screenName": "name", "screenID": "id_n", "screenID_c": "id_c" }, "testcases": { "childIndex": "childIndex", "screenID": "pid_n", "testCaseName": "name", "testCaseID": "id_n", "testCaseID_c": "id_c" }, "tasks": { "taskID": "id_n", "task": "t", "batchName": "bn", "assignedTo": "at", "reviewer": "rw", "startDate": "sd", "endDate": "ed", "release": "re", "cycle": "cy", "details": "det", "nodeID": "pid", "parent": "anc", "taskvn": "taskvn" } };
					var jsonData = result;
					var all_modules = jsonData[0].data;

					// if (d.tab=='tabAssign' || d.tab=='endToend'){
					// 	all_modules=jsonData[0].data.concat(jsonData[1].data).concat(jsonData[2].data).concat(jsonData[3].data);

					// }else{
					all_modules = jsonData[0].data.concat(jsonData[1].data);
					//}
					all_modules.forEach(function (row) {
						row.graph.nodes.forEach(function (n) {
							if (idDict[n.id] === undefined) {
								lbl = n.labels[0].toLowerCase();
								if (lbl == 'testscenarios') lbl = 'scenarios';
								for (var attrs in n.properties) {
									if (attrDict[lbl] !== undefined && attrDict[lbl][attrs] !== undefined) n[attrDict[lbl][attrs]] = n.properties[attrs];
									delete n.properties[attrs];
								}
								if (lbl == "tasks") {
									try {

										nData.push({ id: n.id_n, oid: n.id, task: n.t, batchName: n.bn, assignedTo: n.at, reviewer: n.rw, startDate: n.sd, endDate: n.ed, release: n.re, cycle: n.cy, details: n.det, nodeID: n.pid, parent: n.anc.slice(1, -1).split(','), vn: n.taskvn });
									}
									catch (ex) {
										console.log(n.id);
									}
								}
								else {
									if (lbl == "modules") n.childIndex = 0;
									nData.push({ projectID: n.projectID, childIndex: n.childIndex, id: n.id, "type": lbl, name: n.name, id_n: n.id_n, pid_n: n.pid_n, id_c: n.id_c, children: [], task: null });

								}
								if (lbl == "modules") rIndex.push(k);
								idDict[n.id] = k; neoIdDict[n.id_n] = k;
								k++;
							}
						});
						row.graph.relationships.forEach(function (r) {
							try {
								var srcIndex = idDict[r.startNode.toString()];
								var tgtIndex = idDict[r.endNode.toString()];
								if (nData[tgtIndex].children === undefined) nData[srcIndex].task = nData[tgtIndex];
								else if (nData[srcIndex].children.indexOf(nData[tgtIndex]) == -1) {
									nData[srcIndex].children.push(nData[tgtIndex]);
									if (nData[tgtIndex].childIndex == undefined) {
										nData[tgtIndex].childIndex = nData[srcIndex].children.length;
									}

								}
							} catch (ex) {
								console.log(ex);
							}
						});
					});
					tList.forEach(function (t) { nData[neoIdDict[t.nodeID]].task = t; });
					nData.forEach(function (e) {
						if (e.pid_n) {
							if (neoIdDict[e.pid_n] !== undefined) e.pid_n = nData[neoIdDict[e.pid_n]].id;
							else e.pid_n = null;
						}
					});
					rIndex.forEach(function (m) { maps.push(nData[m]); });
					maps.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
					res.status(status).send(maps);
				}
			});
		}
		else if (d.task == 'writeMap') {
			var nData = [], qList = [], idDict = {};
			var createdOn = new Date().toLocaleString();
			data = d.data.map;
			prjId = d.data.prjId;
			var vn_from = d.data.vn_from;
			var vn_to = d.data.vn_from;
			var tab = d.data.tab;
			var deletednodes = d.data.abc;
			var user = d.data.user_name;
			var userRole = d.data.userRole;
			//TO support task deletion
			var removeTask = d.data.xyz;
			if (d.data.write == 10) {
				var uidx = 0, t, lts, rnmList = [];
				deletednodes.forEach(function (t, i) {
					qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]-(b) DETACH DELETE b" });
				});
				//TO support task deletion
				removeTask.forEach(function (t, i) {
					qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]-(b) DETACH DELETE b" });
				});

				data.forEach(function (e, i) {
					idDict[e.id] = (e.id_n) ? e.id_n : uuidV4();
					e.id = idDict[e.id];
					t = e.task;
					var taskstatus = 'inprogress';
					if (e.type == 'modules') {
						if (e.oid != null) {
							//Added new queries to allow saving of incomplete structure
							//qList.push({"statement":"MATCH (n)-[r:FMTTS{id:'"+e.id+"'}]->(o:TESTSCENARIOS)-[s]->(p:SCREENS)-[t]->(q:TESTCASES) DETACH DELETE r,s,t,o,p,q"});
							qList.push({ "statement": "MATCH (n)-[r:FMTTS{id:'" + e.id + "'}]->(o:TESTSCENARIOS)-[s]->(p:SCREENS)-[t]->(q:TESTCASES) DETACH DELETE t,q" });
							qList.push({ "statement": "MATCH (n)-[r:FMTTS{id:'" + e.id + "'}]->(o:TESTSCENARIOS)-[s]->(p:SCREENS) DETACH DELETE s,p" });
							qList.push({ "statement": "MATCH (n)-[r:FMTTS{id:'" + e.id + "'}]->(o:TESTSCENARIOS) DETACH DELETE r,o" });

							if (e.renamed) qList.push({ "statement": "MATCH(n:MODULES{moduleID:'" + e.id + "'}) SET n.modifiedOn='" + createdOn + "',n.moduleName='" + e.name + "'" + ",n.unique_property='[" + e.name + ',' + prjId + ',' + vn_from + "]'" });
						}
						else {
							//qList.push({"statement":"MERGE(n:MODULES{projectID:'"+prjId+"',moduleName:'"+e.name+"',moduleID:'"+e.id+"',createdBy:'"+user+"',createdOn:'null',moduleID_c:'"+e.id_c+"',unique_property:'["+e.name+','+prjId+"]'}) SET n.childIndex='"+e.childIndex+"'"});
							qList.push({ "statement": "MERGE(n:MODULES{projectID:'" + prjId + "',moduleName:'" + e.name + "',moduleID:'" + e.id + "',createdBy:'" + user + "',createdOn:'" + createdOn + "',moduleID_c:'" + e.id_c + "',unique_property:'[" + e.name + ',' + prjId + ',' + vn_from + "]'}) SET n.childIndex='" + e.childIndex + "'" });
							qList.push({ "statement": "MATCH (a:VERSION{versionNumber:" + parseFloat(vn_from) + ",projectID:'" + prjId + "'}) set a.moduleIDs=a.moduleIDs+[\"" + e.id + "\"]" });
							qList.push({ "statement": "MATCH (a:VERSION),(b:MODULES) WHERE b.moduleID IN a.moduleIDs MERGE (a)-[r:FVTM {id:b.moduleID}]->(b)" });
						}
						if (t != null && e.id_c != null) {
							t.parent = [prjId].concat(e.id_c);
							t.id = (t.id != null) ? t.id : uuidV4();

							if (t.oid != null) {
								if (t.updatedParent != undefined) {
									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',nodeID:'" + e.id + "',parent:'[" + t.parent + "]',taskvn:" + parseFloat(vn_from) + "}) SET n.task='" + t.task + "',n.batchName='" + t.batchName + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.release='" + t.release + "',n.cycle='" + t.cycle + "',n.details='" + t.details + ",n.status='" + taskstatus + "',n.parent='[" + [prjId].concat(t.updatedParent) + "]'" });
								} else {
									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',nodeID:'" + e.id + "',parent:'[" + t.parent + "]',taskvn:" + parseFloat(vn_from) + "}) SET n.task='" + t.task + "',n.batchName='" + t.batchName + "',n.status='" + taskstatus + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.release='" + t.release + "',n.cycle='" + t.cycle + "',n.details='" + t.details + "'" });
								}

							}
							else qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',batchName:'" + t.batchName + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',status:'" + taskstatus + "',reviewer:'" + t.reviewer + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',release:'" + t.release + "',cycle:'" + t.cycle + "',details:'" + t.details + "',nodeID:'" + e.id + "',parent:'[" + t.parent + "]',taskvn:" + parseFloat(vn_from) + "})" });
						}
					}
					else if (e.type == 'scenarios') {
						if (e.renamed && e.id_n) rnmList.push({ "statement": "MATCH(n:TESTSCENARIOS{testScenarioID:'" + e.id + "'}) SET n.testScenarioName='" + e.name + "'" + ",n.projectID='" + prjId + "'" });
						qList.push({ "statement": "MERGE(n:TESTSCENARIOS{projectID:'" + prjId + "',moduleID:'" + idDict[e.pid] + "',testScenarioName:'" + e.name + "',testScenarioID:'" + e.id + "',createdBy:'" + user + "',createdOn:'" + createdOn + "',testScenarioID_c:'" + e.id_c + "'}) SET n.childIndex='" + e.childIndex + "'" });
						//Supporting task assignmnet for scenarios
						if (t != null && e.id_c != null) {
							t.parent = [prjId].concat(e.pid_c, e.id_c);
							t.id = (t.id != null) ? t.id : uuidV4();

							if (t.oid != null) {
								if (t.updatedParent != undefined) {
									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',nodeID:'" + e.id + "',parent:'[" + t.parent + "]',taskvn:" + parseFloat(vn_from) + "}) SET n.task='" + t.task + "',n.status='" + taskstatus + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.release='" + t.release + "',n.cycle='" + t.cycle + "',n.details='" + t.details + "',n.parent='[" + [prjId].concat(t.updatedParent) + "]'" });
								} else {
									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',nodeID:'" + e.id + "',parent:'[" + t.parent + "]',taskvn:" + parseFloat(vn_from) + "}) SET n.task='" + t.task + "',n.status='" + taskstatus + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.release='" + t.release + "',n.cycle='" + t.cycle + "',n.details='" + t.details + "'" });
								}

							}
							else qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',reviewer:'" + t.reviewer + "',status:'" + taskstatus + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',release:'" + t.release + "',cycle:'" + t.cycle + "',details:'" + t.details + "',nodeID:'" + e.id + "',parent:'[" + t.parent + "]',taskvn:" + parseFloat(vn_from) + "})" });
						}
						//qList.push({"statement":"MATCH(n:TESTSCENARIOS{testScenarioID:'"+e.id+"'}) SET n.testScenarioName='"+e.name+"'"+",n.projectID='"+prjId+"'"});
					}
					else if (e.type == 'screens') {
						uidx++; lts = idDict[e.pid];
						if (e.renamed && e.id_n && e.orig_name) {
							//rnmList.push({"statement":"MATCH(n:SCREENS{screenName:'"+e.orig_name+"'}) SET n.projectID='"+prjId+"',n.vn="+parseFloat(vn_from)});
							rnmList.push({ "statement": "MATCH(n:SCREENS{screenName:'" + e.orig_name + "',projectID:'" + prjId + "',vn:" + parseFloat(vn_from) + "}) SET n.screenName='" + e.name + "'" });
						}
						//qList.push({"statement":"MATCH(n:SCREENS{screenID:'"+e.id+"'}) SET n.screenName='"+e.name+"'"+",n.projectID='"+prjId+"'"});
						qList.push({ "statement": "MERGE(n:SCREENS{projectID:'" + prjId + "',testScenarioID:'" + idDict[e.pid] + "',screenName:'" + e.name + "',screenID:'" + e.id + "',createdBy:'" + user + "',createdOn:'" + createdOn + "',uid:'" + uidx + "',screenID_c:'" + e.id_c + "'})SET n.childIndex='" + e.childIndex + "',n.vn=" + parseFloat(vn_from) });
						if (t != null && e.id_c != null) {
							t.id = (t.id != null) ? t.id : uuidV4();

							if (t.oid != null) {
								if (t.updatedParent != undefined) {
									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',nodeID:'" + e.id + "',parent:'[" + t.parent + "]',taskvn:" + parseFloat(vn_from) + "}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.status='" + taskstatus + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.details='" + t.details + "',n.uid='" + uidx + "',n.parent='[" + [prjId].concat(t.updatedParent) + "]'" });
								} else {
									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',nodeID:'" + e.id + "',parent:'[" + t.parent + "]',taskvn:" + parseFloat(vn_from) + "}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.status='" + taskstatus + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.details='" + t.details + "',n.uid='" + uidx + "'" });
								}

							}
							else {

								t.parent = [prjId].concat(t.parent);
								qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',reviewer:'" + t.reviewer + "',status:'" + taskstatus + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',details:'" + t.details + "',nodeID:'" + e.id + "',parent:'[" + t.parent + "]',uid:'" + uidx + "',taskvn:" + parseFloat(vn_from) + "})" });
							}
						}
					}
					else if (e.type == 'testcases') {
						var screen_data = '';
						var screenid_c = 'null';
						if (e.renamed && e.id_n && e.orig_name) {
							rnmList.push({ "statement": "MATCH(n:TESTCASES{testCaseName:'" + e.orig_name + "',testScenarioID:'" + lts + "',screenID_c:'" + e.pid_c + "'}) SET n.testCaseName='" + e.name + "'" });
						}

						if (e.pid_c != 'null' && e.pid_c != undefined) {
							qList.push({ "statement": "MERGE(n:TESTCASES{screenID:'" + idDict[e.pid] + "',testScenarioID:'" + lts + "',testCaseName:'" + e.name + "',testCaseID:'" + e.id + "',createdBy:'" + user + "',createdOn:'" + createdOn + "',uid:'" + uidx + "',testCaseID_c:'" + e.id_c + "'}) SET n.screenID_c='" + e.pid_c + "',n.childIndex='" + e.childIndex + "'" });
						} else {
							qList.push({ "statement": "MERGE(n:TESTCASES{screenID:'" + idDict[e.pid] + "',testScenarioID:'" + lts + "',testCaseName:'" + e.name + "',testCaseID:'" + e.id + "',createdBy:'" + user + "',createdOn:'" + createdOn + "',uid:'" + uidx + "',testCaseID_c:'" + e.id_c + "'}) SET n.childIndex='" + e.childIndex + "'" });
						}


						if (t != null && e.id_c != null) {
							t.id = (t.id != null) ? t.id : uuidV4();
							//var parent=[prjId].concat(t.parent);
							if (t.oid != null) {
								if (t.updatedParent != undefined) {
									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',nodeID:'" + e.id + "',parent:'[" + t.parent + "]',taskvn:" + parseFloat(vn_from) + "}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.status='" + taskstatus + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.details='" + t.details + "',n.uid='" + uidx + "',n.parent='[" + [prjId].concat(t.updatedParent) + "]'" });
								} else {
									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',nodeID:'" + e.id + "',parent:'[" + t.parent + "]',taskvn:" + parseFloat(vn_from) + "}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.status='" + taskstatus + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.details='" + t.details + "',n.uid='" + uidx + "'" });
								}

							}
							else {

								t.parent = [prjId].concat(t.parent);
								qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',status:'" + taskstatus + "',reviewer:'" + t.reviewer + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',details:'" + t.details + "',nodeID:'" + e.id + "',parent:'[" + t.parent + "]',uid:'" + uidx + "',taskvn:" + parseFloat(vn_from) + "})" });
							}
						}
					}
				});
				if (tab != 'end_to_end') {
					qList.push({ "statement": "MATCH (a:MODULES),(b:TESTSCENARIOS) WHERE a.moduleID=b.moduleID MERGE (a)-[r:FMTTS {id:b.moduleID}]-(b)" });
					qList.push({ "statement": "MATCH (a:TESTSCENARIOS),(b:SCREENS) WHERE a.testScenarioID=b.testScenarioID MERGE (a)-[r:FTSTS {id:b.testScenarioID}]-(b)" });
					qList.push({ "statement": "MATCH (a:SCREENS),(b:TESTCASES) WHERE a.screenID=b.screenID and a.uid=b.uid MERGE (a)-[r:FSTTS {id:b.screenID}]-(b)" });
					qList.push({ "statement": "MATCH (a:MODULES),(b:TASKS) WHERE a.moduleID=b.nodeID MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)" });
					qList.push({ "statement": "MATCH (a:TESTSCENARIOS),(b:TASKS) WHERE a.testScenarioID=b.nodeID MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)" });
					qList.push({ "statement": "MATCH (a:SCREENS),(b:TASKS) WHERE a.screenID=b.nodeID and a.uid=b.uid MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)" });
					qList.push({ "statement": "MATCH (a:TESTCASES),(b:TASKS) WHERE a.testCaseID=b.nodeID and a.uid=b.uid MERGE (a)-[r:FNTT {id:b.nodeID}]-(b)" });
					qList.push({ "statement": "MATCH (a) remove a.uid" });
					qList = qList.concat(rnmList);
					qList.push({ "statement": "MATCH path=(n:MODULES{moduleID:'" + data[0].id + "'}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
					qList.push({ "statement": "MATCH path=(n:MODULES{moduleID:'" + data[0].id + "'})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });
				}



				neo4jAPI.executeQueries(qList, function (status, result) {
					res.setHeader('Content-Type', 'application/json');
					if (status != 200) res.status(status).send(result);
					else {
						var k = 0, rIndex, lbl, neoIdDict = {};
						idDict = {};
						var attrDict = { "modules": { "childIndex": "childIndex", "projectID": "pid_n", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "scenarios": { "childIndex": "childIndex", "moduleID": "pid_n", "testScenarioName": "name", "testScenarioID": "id_n", "testScenarioID_c": "id_c" }, "screens": { "childIndex": "childIndex", "testScenarioID": "pid_n", "screenName": "name", "screenID": "id_n", "screenID_c": "id_c" }, "testcases": { "childIndex": "childIndex", "screenID": "pid_n", "testCaseName": "name", "testCaseID": "id_n", "testCaseID_c": "id_c" }, "tasks": { "taskID": "id_n", "task": "t", "batchName": "bn", "assignedTo": "at", "reviewer": "rw", "startDate": "sd", "endDate": "ed", "release": "re", "cycle": "cy", "details": "det", "nodeID": "pid", "parent": "anc", "taskvn": "taskvn" } };
						var jsonData = (result);

						var new_res = jsonData[jsonData.length - 1].data;
						if (new_res.length == 0) {
							new_res = jsonData[jsonData.length - 2].data
						}
						new_res.forEach(function (row) {
							row.graph.nodes.forEach(function (n) {
								if (idDict[n.id] === undefined) {
									lbl = n.labels[0].toLowerCase();
									if (lbl == 'testscenarios') lbl = 'scenarios';
									for (var attrs in n.properties) {
										if (attrDict[lbl][attrs] !== undefined) n[attrDict[lbl][attrs]] = n.properties[attrs];
										delete n.properties[attrs];
									}
									if (lbl == "tasks") nData.push({ id: n.id_n, oid: n.id, task: n.t, batchName: n.bn, assignedTo: n.at, reviewer: n.rw, startDate: n.sd, endDate: n.ed, release: n.re, cycle: n.cy, details: n.det, nodeID: n.pid, parent: n.anc.slice(1, -1).split(',') });
									else {
										if (lbl == "modules") n.childIndex = 0;
										nData.push({ childIndex: n.childIndex, id: n.id, "type": lbl, name: n.name, id_n: n.id_n, pid_n: n.pid_n, id_c: n.id_c, children: [], task: null });
									}
									if (lbl == "modules") rIndex = k;
									idDict[n.id] = k; neoIdDict[n.id_n] = k;
									k++;
								}
							});
							row.graph.relationships.forEach(function (r) {
								var srcIndex = idDict[r.startNode.toString()];
								var tgtIndex = idDict[r.endNode.toString()];
								if (nData[tgtIndex].children === undefined) nData[srcIndex].task = nData[tgtIndex];
								else if (nData[srcIndex].children.indexOf(nData[tgtIndex]) == -1) {
									nData[srcIndex].children.push(nData[tgtIndex]);
									if (nData[tgtIndex].childIndex == undefined) nData[tgtIndex].childIndex = nData[srcIndex].children.length;

								}
							});
						});
						nData.forEach(function (e) {
							if (e.pid_n) {
								if (neoIdDict[e.pid_n] !== undefined) e.pid_n = nData[neoIdDict[e.pid_n]].id;
								else e.pid_n = null;
							}
						});

						console.log(rIndex);
						console.log(nData[rIndex]);
						res.status(status).send(nData[rIndex]);
					}
				});
			}
			else if (d.data.write == 20) {
				var uidx = 0, rIndex;


				//var qObj={"projectId":prjId,"testsuiteDetails":[]};
				var qObj = { "projectId": prjId, "testsuiteDetails": [], userRole: userRole, from_version: parseFloat(vn_from), new_version: vn_to };
				var nObj = [], tsList = [];
				data.forEach(function (e, i) {
					if (e.type == "modules") rIndex = uidx;
					if (e.task != null) delete e.task.oid;
					nObj.push({ id: e.id_n, id_c: e.id_c, name: e.name, task: e.task, children: [] });
					if (e.type == "testcases") nObj[nObj.length - 1]['pid_c'] = e.pid_c;
					if (idDict[e.pid] !== undefined) nObj[idDict[e.pid]].children.push(nObj[uidx]);
					idDict[e.id] = uidx++;
				});
				nObj[rIndex].children.forEach(function (ts, i) {
					var sList = [];
					ts.children.forEach(function (s, i) {
						var tcList = [];
						s.children.forEach(function (tc, i) {
							tcList.push({ "screenID_c": tc.pid_c, "testcaseId": tc.id, "testcaseId_c": tc.id_c, "testcaseName": tc.name, "task": tc.task });
						});
						sList.push({ "screenId": s.id, "screenId_c": s.id_c, "screenName": s.name, "task": s.task, "testcaseDetails": tcList });
					});
					tsList.push({ "testscenarioId": ts.id, "testscenarioId_c": ts.id_c, "testscenarioName": ts.name, "tasks": ts.task, "screenDetails": sList });
				});
				qObj.testsuiteDetails = [{ "testsuiteId": nObj[rIndex].id, "testsuiteId_c": nObj[rIndex].id_c, "testsuiteName": nObj[rIndex].name, "task": nObj[rIndex].task, "testscenarioDetails": tsList }];
				qObj.userName = d.data.user_name;
				create_ice.createStructure_Nineteen68(qObj, function (err, data) {
					if (err)
						res.status(500).send(err);
					else {
						datatosend = data;

					}
					var module_type = 'modules';
					var parsing_result = parsing(data, module_type, vn_to, 0);

					neo4jAPI.executeQueries(parsing_result[0], function (status, result) {
						if (status != 200) res.status(status).send(result);
						else res.status(200).send(parsing_result[1]);

					});



				});

			}
		}

		else if (d.task == 'createVersion') {
			//get the version from version table
			//create a new version with the existing version data
			//id's must be new
			var nData = [];
			prjId = d.srcprojectId;
			tmpprjId = prjId;
			var user_name = d.user_name;
			if (d.action == "project_replicate") {
				prjId = d.dstprojectId;
			} else {
				prjId = d.projectId;
				tmpprjId = prjId;
			}
			vn_from = d.vn_from;
			vn_to = d.vn_to;
			userRole = d.userRole;
			console.log(prjId, vn_from, vn_to);
			//
			var qList = [{ "statement": "MATCH path=(n:VERSION{projectID:'" + tmpprjId + "',versionNumber:" + vn_from + "})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] }];
			neo4jAPI.executeQueries(qList, function (status, result) {
				res.setHeader('Content-Type', 'application/json');
				if (status != 200) res.status(status).send(result);
				else {
					var k = 0, rIndex, lbl, neoIdDict = {};
					idDict = {};
					newMap = {};
					rIndexMap = {}, rIndexList = [];
					//var attrDict={"version":{},"modules_endtoend":{"moduleID":"id_n"},"modules":{"moduleID":"id_n"},"testscenarios":{"testScenarioID":"id_n"},"screens":{"screenID":"id_n"},"testcases":{"testCaseID":"id_n"}};
					var attrDict = { "version": "versionID", "modules_endtoend": "moduleID", "modules": "moduleID", "testscenarios": "testScenarioID", "screens": "screenID", "testcases": "testCaseID" };
					var jsonData = result;
					console.log(jsonData.length);
					var new_res = jsonData[0].data;
					new_res.forEach(function (row) {
						row.graph.nodes.forEach(function (n) {
							if (idDict[n.id] === undefined) {
								lbl = n.labels[0].toLowerCase();
								if (lbl != "tasks" && lbl != "modules_endtoend") {

									if (lbl == "modules") n.childIndex = 0;
									// nData.push({id:n.id,type:lbl,name:n.name,attrs:n.properties,children:[]});
									nData.push({ type: lbl, attrs: n.properties, children: [] });
									idDict[n.id] = k;
									var newId = uuidV4();
									if (lbl == "version") rIndex = k;
									if (newMap[n.properties[attrDict[lbl]]] === undefined) {
										newMap[n.properties[attrDict[lbl]]] = newId;
										if (lbl == 'modules') {
											rIndexMap[newId] = k; rIndexList.push(k);
										}
									}

									k++;
								}
							}
						});

						row.graph.relationships.forEach(function (r) {
							var srcIndex = idDict[r.startNode.toString()];
							var tgtIndex = idDict[r.endNode.toString()];
							if (tgtIndex != undefined) {
								if (nData[tgtIndex].children === undefined) nData[srcIndex].task = nData[tgtIndex];
								else if (nData[srcIndex].children.indexOf(nData[tgtIndex]) == -1) {
									nData[srcIndex].children.push(nData[tgtIndex]);
									if (nData[tgtIndex].childIndex == undefined) nData[tgtIndex].childIndex = nData[srcIndex].children.length;

								}
							}

						});
					});

					//  SORT THE nDATA on Basis of heirchy

					nData.forEach(function (e) {
						//neoIdDict[n.id_n]=k;
						if (e.type == 'version') {
							newModIds = [];
							console.log("Version moduleids");
							for (var mix = 0; mix < e.attrs.moduleIDs.length; mix++) {
								console.log("Version moduleids:  OLD:", e.attrs.moduleIDs[mix], "  new:", newMap[e.attrs.moduleIDs[mix]]);
								if (newMap[e.attrs.moduleIDs[mix]] !== undefined) newModIds.push("\"" + newMap[e.attrs.moduleIDs[mix]] + "\"");
							}
							e.attrs.moduleIDs = "[" + newModIds + "]";
							//console.log("Version moduleids", e.attrs.moduleIDs);
						} else if (e.type == "modules") {
							e.attrs.moduleID = newMap[e.attrs.moduleID];
							//console.log("module id: ",e.attrs.moduleID, "moduleame : ",e.name)
						} else if (e.type == 'testscenarios') {
							e.attrs.moduleID = newMap[e.attrs.moduleID];
							e.attrs.testScenarioID = newMap[e.attrs.testScenarioID];
							//console.log("scenario id: ",e.attrs.testScenarioID, "scenarioname  : ",e.name)
						} else if (e.type == 'screens') {
							e.attrs.screenID = newMap[e.attrs.screenID];
							e.attrs.testScenarioID = newMap[e.attrs.testScenarioID];
							//console.log("screen id: ",e.attrs.screenID, "screenname  : ",e.name)
						} else if (e.type == 'testcases') {
							e.attrs.screenID = newMap[e.attrs.screenID];
							e.attrs.testCaseID = newMap[e.attrs.testCaseID];
							//console.log("testCase id: ",e.attrs.testCaseID, "testCase name  : ",e.name)
						}
					});


					var uidx = 0, t, lts, qList = [];
					var createdOn = new Date().toLocaleString();
					nData.forEach(function (e, i) {
						t = e.attrs;
						t.projectID = prjId;

						if (e.type == 'version') {
							qList.push({ "statement": "MERGE(n:VERSION{projectID:'" + prjId + "',moduleIDs:" + t.moduleIDs + ",versionNumber:" + vn_to + ",vn:'" + vn_to + "',versionID:'" + uuidV4() + "'}) SET n.createdBy='" + user_name + "',n.createdOn='" + createdOn + "'" });
						}
						else if (e.type == 'modules') {
							var new_property = t.unique_property.slice(0, -1).concat(',' + vn_to + ']')
							qList.push({ "statement": "MERGE(n:MODULES{projectID:'" + t.projectID + "',moduleName:'" + t.moduleName + "',moduleID:'" + t.moduleID + "',createdBy:'" + t.createdBy + "',createdOn:'" + createdOn + "',moduleID_c:'null',unique_property:'" + new_property + "',childIndex:'" + t.childIndex + "'})" });
						}
						else if (e.type == 'testscenarios') {
							qList.push({ "statement": "MERGE(n:TESTSCENARIOS{projectID:'" + t.projectID + "',moduleID:'" + t.moduleID + "',testScenarioName:'" + t.testScenarioName + "',testScenarioID:'" + t.testScenarioID + "',createdBy:'" + t.createdBy + "',createdOn:'" + createdOn + "',testScenarioID_c:'null', childIndex:'" + t.childIndex + "'})" });
						}
						else if (e.type == 'screens') {
							uidx++; lts = t.testScenarioID;
							qList.push({ "statement": "MERGE(n:SCREENS{projectID:'" + t.projectID + "',testScenarioID:'" + t.testScenarioID + "',screenName:'" + t.screenName + "',screenID:'" + t.screenID + "',createdBy:'" + t.createdBy + "',createdOn:'" + createdOn + "',uid:'" + uidx + "',screenID_c:'null',childIndex:'" + t.childIndex + "'})" });
						}
						else if (e.type == 'testcases') {
							qList.push({ "statement": "MERGE(n:TESTCASES{screenID:'" + t.screenID + "',testScenarioID:'" + lts + "',testCaseName:'" + t.testCaseName + "',testCaseID:'" + t.testCaseID + "',createdBy:'" + t.createdBy + "',createdOn:'" + createdOn + "',uid:'" + uidx + "',testCaseID_c:'null',screenID_c:'null',childIndex:'" + t.childIndex + "'})" });
						}
					});
					qList.push({ "statement": "MATCH (a:VERSION),(b:MODULES) WHERE b.moduleID IN a.moduleIDs MERGE (a)-[r:FVTM {id:b.moduleID}]->(b)" });
					qList.push({ "statement": "MATCH (a:MODULES),(b:TESTSCENARIOS) WHERE a.moduleID=b.moduleID MERGE (a)-[r:FMTTS {id:b.moduleID}]->(b)" });
					qList.push({ "statement": "MATCH (a:TESTSCENARIOS),(b:SCREENS) WHERE a.testScenarioID=b.testScenarioID MERGE (a)-[r:FTSTS {id:b.testScenarioID}]->(b)" });
					qList.push({ "statement": "MATCH (a:SCREENS),(b:TESTCASES) WHERE a.screenID=b.screenID and a.uid=b.uid MERGE (a)-[r:FSTTS {id:b.screenID}]->(b)" });
					qList.push({ "statement": "MATCH (a) remove a.uid" });

					neo4jAPI.executeQueries(qList, function (status, result) {
						res.setHeader('Content-Type', 'application/json');
						if (status != 200) res.status(status).send(result);
						else {
							var qObj = { "projectId": prjId, "testsuiteDetails": [], userRole: userRole, from_version: parseFloat(vn_from), new_version: vn_to };
							qObj.userName = d.user_name;

							async.forEachSeries(rIndexList, function (rIndex, maincallback) {
								var incompleteFlow = false;
								var tsList = [];
								//Condition to check incomplete flow of Modules, if so do not create structure in cassandra
								if (nData[rIndex].children.length == 0 || nData[rIndex].attrs.moduleID_c == 'null' || nData[rIndex].attrs.moduleID_c == 'undefined') {
									incompleteFlow = true;
								} else {
									nData[rIndex].children.forEach(function (ts, i) {
										var sList = [];
										//Condition to check incomplete flow of Scenarios, if so do not create structure in cassandra
										if (ts.children.length == 0) {
											incompleteFlow = true;
											return false;
										} else {
											ts.children.forEach(function (s, i) {
												var tcList = [];
												//Condition to check incomplete flow of Screens, if so do not create structure in cassandra
												if (s.children.length == 0) {
													incompleteFlow = true;
													return false;
												} else {
													s.children.forEach(function (tc, i) {
														if (tc.attrs.testCaseID_c != "null" && tc.attrs.testCaseID_c != "undefined")
															tcList.push({ "screenID_c": tc.attrs.screenID_c, "testcaseId": tc.attrs.testCaseID, "testcaseId_c": null, "testcaseName": tc.attrs.testCaseName, "task": tc.attrs.task });
													});
													if (s.attrs.screenID_c != "null" && s.attrs.screenID_c != "undefined")
														sList.push({ "screenId": s.attrs.screenID, "screenId_c": null, "screenName": s.attrs.screenName, "task": s.attrs.task, "testcaseDetails": tcList });
												}


											});
											if (ts.attrs.testScenarioID_c != "null" && ts.attrs.testScenarioID_c != "undefined")
												tsList.push({ "testscenarioId": ts.attrs.testScenarioID, "testscenarioId_c": null, "testscenarioName": ts.attrs.testScenarioName, "tasks": ts.attrs.task, "screenDetails": sList });
										}
									});
								}
								if (!incompleteFlow) {
									qObj.testsuiteDetails = [{ "testsuiteId": nData[rIndex].attrs.moduleID, "testsuiteId_c": null, "testsuiteName": nData[rIndex].attrs.moduleName, "task": nData[rIndex].attrs.task, "testscenarioDetails": tsList }];
									//Passing the details of hierarchical structure of module and its children to NDAC service to create Structure in Cassandra 	
									create_ice.createStructure_Nineteen68(qObj, function (err, data) {
										if (err)
											res.status(500).send(err);
										else {
											datatosend = data;
										}
										var module_type = 'modules';
										var parsing_result = parsing(data, module_type, vn_to, 1);
										neo4jAPI.executeQueries(parsing_result[0], function (status, result) {
											if (status != 200) res.status(status).send(result);
											maincallback();
										});
									})
								} else {
									maincallback();
								}

							}, function (maincallback) {
								res.status(status).send({ status: "Success" });
							});

						}
					});
				}
			});

		}
		else if (d.task == 'projectReplication') {
			var qlist = { userid: d.userid }
			create_ice.getEmptyProjects_ICE(qlist, function (err, result) {
				if (err) res.status(500).send(result);
				else {
					res.status(200).send(result)
				}
			});
		}
		else if (d.task == 'listOfProjectsNeo4j') {
			var qList = []
			qList.push({ "statement": "MATCH (n:VERSION) return distinct n.projectID" });
			neo4jAPI.executeQueries(qList, function (status, result) {
				res.setHeader('Content-Type', 'application/json');
				if (status != 200) res.status(status).send(result);
				else {
					res.status(status).send(result);
				}
			});
		}
	}

	else {
		res.send("Invalid Session");
	}
};




var parsing = function (d, module_type, vn, flag) {
	var data = d;
	var qList_new = [];

	var result = "";
	var testsuiteDetails = d.testsuiteDetails;
	var updateJson = [];
	var cassandraId_dict = {};
	try {
		testsuiteDetails.forEach(function (e, i) {
			var moduleID_json = e.testsuiteId;
			var modulename_json = e.testsuiteName;
			var moduleID_c_json = e.testsuiteId_c;
			//var modulename_json=e.testsuiteName;
			var testscenarioDetails_json = e.testscenarioDetails;
			if (module_type == 'modules') {
				qList_new.push({ "statement": "MATCH (a:MODULES) WHERE a.moduleID='" + moduleID_json + "' and a.projectID='" + data.projectId + "' SET a.moduleID_c='" + moduleID_c_json + "'" });
			}
			// else 
			// qList_new.push({"statement":"MATCH (a:MODULES_ENDTOEND) WHERE a.moduleName='"+modulename_json+"' and a.projectID='"+data.projectId+"' SET a.moduleID_c='"+moduleID_c_json+"'"});
			cassandraId_dict[moduleID_json] = moduleID_c_json;
			//updateJson.push(cassandraId_dict);
			testscenarioDetails_json.forEach(function (sc, i) {
				var testscenarioId_json = sc.testscenarioId;
				var testscenarioname_json = sc.testscenarioName;
				var testscenarioId_c_json = sc.testscenarioId_c;
				//var modulename_json=sc.testsuiteName;
				var screenDetails_json = sc.screenDetails;
				//console.log(testscenarioId_json,testscenarioId_c_json);
				// if (module_type=='modules')
				// 	qList_new.push({"statement":"MATCH (a:TESTSCENARIOS) WHERE a.testScenarioName='"+testscenarioname_json+"' and a.projectID='"+data.projectId+"' SET a.testScenarioID_c='"+testscenarioId_c_json+"'"});

				qList_new.push({ "statement": "MATCH (b:VERSION{versionNumber:" + vn + "})-[r*1..]->(a:TESTSCENARIOS{testScenarioName:'" + testscenarioname_json + "',projectID:'" + data.projectId + "'}) SET a.testScenarioID_c='" + testscenarioId_c_json + "'" });

				cassandraId_dict[testscenarioId_json] = testscenarioId_c_json;


				screenDetails_json.forEach(function (scr, i) {
					var screenId_json = scr.screenId;
					var screenId_c_json = scr.screenId_c;
					var screenname_json = scr.screenName;
					//var modulename_json=sc.testsuiteName;
					var testcaseDetails_json = scr.testcaseDetails;
					//console.log(screenId_json,screenId_c_json);
					qList_new.push({ "statement": "MATCH (b:VERSION{versionNumber:" + vn + "})-[r*1..]->(a:SCREENS{screenName:'" + screenname_json + "',projectID:'" + data.projectId + "'}) SET a.screenID_c='" + screenId_c_json + "'" });

					//updateJson.push({screenId_json:screenId_c_json});
					cassandraId_dict[screenId_json] = screenId_c_json;
					//updateJson.push(cassandraId_dict);

					testcaseDetails_json.forEach(function (tc, i) {
						var testcaseId_json = tc.testcaseId;
						var testcaseId_c_json = tc.testcaseId_c;
						var testcaseName_json = tc.testcaseName;
						var screenId_C_neo = tc.screenID_c;
						console.log('testcaseId_json', testcaseId_c_json);
						if (flag == 0) {
							if (screenId_C_neo == 'null' || screenId_C_neo == undefined) {
								qList_new.push({ "statement": "MATCH (b:VERSION{versionNumber:" + vn + "})-[r*1..]->(a:TESTCASES{testCaseName:'" + testcaseName_json + "',screenID:'" + screenId_json + "'}) SET a.screenID_c='" + screenId_c_json + "'" });
								qList_new.push({ "statement": "MATCH (b:VERSION{versionNumber:" + vn + "})-[r*1..]->(a:TESTCASES{testCaseName:'" + testcaseName_json + "',screenID_c:'" + screenId_c_json + "'}) SET a.testCaseID_c='" + testcaseId_c_json + "'" });
							} else {
								qList_new.push({ "statement": "MATCH (b:VERSION{versionNumber:" + vn + "})-[r*1..]->(a:TESTCASES{testCaseName:'" + testcaseName_json + "',screenID_c:'" + screenId_c_json + "'}) SET a.testCaseID_c='" + testcaseId_c_json + "'" });
							}
						}
						else {
							qList_new.push({ "statement": "MATCH (b:VERSION{versionNumber:" + vn + "})-[r*1..]->(a:TESTCASES{testCaseName:'" + testcaseName_json + "',screenID:'" + screenId_json + "'}) SET a.screenID_c='" + screenId_c_json + "'" });
							qList_new.push({ "statement": "MATCH (b:VERSION{versionNumber:" + vn + "})-[r*1..]->(a:TESTCASES{testCaseName:'" + testcaseName_json + "',screenID_c:'" + screenId_c_json + "'}) SET a.testCaseID_c='" + testcaseId_c_json + "'" });
						}

						cassandraId_dict[testcaseId_json] = testcaseId_c_json;


					});

				});


			});



		});
	} catch (ex) {
		console.log(ex);
	}

	updateJson.push(cassandraId_dict);

	return [qList_new, updateJson];
};



