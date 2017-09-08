/*jshint -W030*/
var fs = require('fs');
var http = require('http');
var async = require('async');
var cassandra = require('node-cassandra-cql');

module.exports = {
	importToNeo: function(req,res){
		var impData = fs.readFileSync('./assets/import.txt','utf8');
		var sheet=impData.split('\n');
		var nameDict={};
		var qList=[];
		var ctx=0;
		sheet.forEach(function(line,i) {
			line=line.slice(0,line.length-1);
			//var q="MERGE (n:TEST_SCENARIOS {testscenario_id:'"+e.id+"',testscenario_name:'"+e.name+"',cycle_id:'"+e.pid+"'})";
			var q="MERGE (n:";
			var row=line.split(',');
			if(row[0]==0){
				q+="MODULES{projectID:'";
				if(row[1]=='#') q+=cassandra.types.uuid();
				else q+=row[1];
				if(nameDict[row[2]]===undefined) nameDict[row[2]]=cassandra.types.uuid();
				q+="',moduleName:'"+row[2]+"',moduleID:'"+nameDict[row[2]]+"',createdBy:'"+row[4]+"',createdOn:'"+row[5]+"'})";
				qList.push({"statement":q});
			}
			else if(row[0]==1){
				if(nameDict[row[2]]===undefined) nameDict[row[2]]=cassandra.types.uuid();
				q+="TESTSCENARIOS{moduleID:'"+nameDict[row[1]]+"',testScenarioName:'"+row[2]+"',testScenarioID:'"+nameDict[row[2]]+"',createdBy:'"+row[4]+"',createdOn:'"+row[5]+"'})";
				qList.push({"statement":q});
			}
			else if(row[0]==2){
				ctx++;
				if(nameDict[row[2]]===undefined) nameDict[row[2]]=cassandra.types.uuid();
				q+="SCREENS{testScenarioID:'"+nameDict[row[1]]+"',screenName:'"+row[2]+"',screenID:'"+nameDict[row[2]]+"',createdBy:'"+row[4]+"',createdOn:'"+row[5]+"',uid:"+ctx+"})";
				qList.push({"statement":q});
			}
			else if(row[0]==3){
				if(nameDict[row[2]]===undefined) nameDict[row[2]]=cassandra.types.uuid();
				q+="TESTCASES{screenID:'"+nameDict[row[1]]+"',testCaseName:'"+row[2]+"',testCaseID:'"+nameDict[row[2]]+"',createdBy:'"+row[4]+"',createdOn:'"+row[5]+"',uid:"+ctx+"})";
				qList.push({"statement":q});
			}
		});
		qList.push({"statement":"MATCH (a:MODULES),(b:TESTSCENARIOS) WHERE a.moduleID=b.moduleID MERGE (a)-[r:FMTTS {id:b.moduleID}]-(b)"});
		qList.push({"statement":"MATCH (a:TESTSCENARIOS),(b:SCREENS) WHERE a.testScenarioID=b.testScenarioID MERGE (a)-[r:FTSTS {id:b.testScenarioID}]-(b)"});
		qList.push({"statement":"MATCH (a:SCREENS),(b:TESTCASES) WHERE a.screenID=b.screenID and a.uid=b.uid MERGE (a)-[r:FSTTS {id:b.screenID}]-(b)"});
		qList.push({"statement":"MATCH (a) remove a.uid"});
		var qObj={"data":{"statements":qList}};
		res.status(200).send(qObj);
	},
	saveConfig: function(req,res){
		var rawData = fs.readFileSync('./assets/config.txt');
		if(rawData.length === 0) rawData='{"cassandra":{"host":"xxx.xxx.xxx.xxx","port":0,"keyspace":""},"neo4j":{"host":"xxx.xxx.xxx.xxx","port":0,"username":"???","password":"???"}}';
		var configData = JSON.parse(rawData);
		var data = req.body;
		if(data.db==1){
			if(data.key == 'cfg-type1')	configData.cassandra.host=data.value;
			else if(data.key == 'cfg-type2') configData.cassandra.port=parseInt(data.value);
			else if(data.key == 'cfg-type3') configData.cassandra.keyspace=data.value;
		}
		else if(data.db==2){
			if(data.key == 'cfg-type1')	configData.neo4j.host=data.value;
			else if(data.key == 'cfg-type2') configData.neo4j.port=parseInt(data.value);
			else if(data.key == 'cfg-type3') {
				var valTo = data.value.toString();
				var tList = (valTo.slice(1,valTo.length-1)).split('|:|');
				configData.neo4j[dbInst].username=tList[0];
				configData.neo4j[dbInst].password=tList[1];
			}
		}
		fs.writeFileSync('./assets/config.txt', JSON.stringify(configData), 'utf8');
		res.setHeader('Content-Type', 'application/json');
		res.status(200).send('Success');
	},

	logout: function(req,res){
		req.session.destroy();
		res.status(200).redirect('/');
	},

	neoScriptA: function(req,res){
		var neoData = JSON.parse(fs.readFileSync('./assets/config.txt')).neo4j;
		var data = JSON.stringify(req.body.data);
		var result="";
		var postOptions = {
			host: neoData.host,
			port: neoData.port,
			path: '/db/data/transaction/commit',
			method: 'POST',
			headers: {
				'Authorization': 'Basic '+new Buffer(neoData.username+':'+neoData.password).toString('base64'),
				'Accept': 'application/json,text/plain',
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(data)
			}
		};
		var postRequest = http.request(postOptions,function(resp){
			resp.setEncoding('utf-8');
			resp.on('data',function(chunk){
				result+=chunk;
			});
			resp.on('end',function(chunk){
				var resData=JSON.parse(result);
				res.setHeader('Content-Type','application/json');
				if(resData.errors.length!==0) res.status(400).send(resData.errors);
				else res.status(200).send(resData.results);
			});
		});
		postRequest.on('error',function(e){
			res.setHeader('Content-Type','application/json');
			res.status(400).send(e.message);
		});
		postRequest.write(data);
		postRequest.end();
	},

	casScriptA: function(req,res){
		var reqb=req.body;
		var sessObj = reqb.uid;
		var casData = JSON.parse(fs.readFileSync('./assets/config.txt')).cassandra;
		var casOptions={hosts:[casData.host+':'+casData.port], keyspace:casData.keyspace};
		var casSession = new cassandra.Client(casOptions);
		var query = reqb.query;
		var wData = reqb.data;
		var data = [];
		if(query=='getPrjRelCycList') {
			async.series(
				{
					prjId: function(callback){
						casSession.execute("SELECT project_ids FROM permissions WHERE user_id=?",[sessObj.id],function(err,result){
							if(err) console.log(err);
							else data=JSON.parse(JSON.stringify(result.rows[0].project_ids));
							callback(err,data);
						});
					},
					prjList: function(callback){
						casSession.execute("SELECT project_name,project_id FROM projects WHERE project_id IN ("+data.toString()+") ALLOW FILTERING",function(err,result){
							var resList=[];
							if(err) console.log(err);
							else{
								result.rows.forEach(function(row){
									resList.push({name: row.project_name, id: row.project_id.toString()});
								});
							}
							callback(err,resList);
						});
					},
					relList: function(callback){
						casSession.execute("SELECT project_id,release_id,release_name,cycle_id,cycle_name FROM releases WHERE project_id IN ("+data.toString()+") ALLOW FILTERING",function(err,result){
							var resList=[];
							if(err) console.log(err);
							else{
								result.rows.forEach(function(row){
									resList.push({pid:row.project_id.toString(),rid:row.release_id.toString(),cid:row.cycle_id.toString(),rname:row.release_name,cname:row.cycle_name});
								});
							}
							callback(err,resList);
						});
					}
				},
				function(err,results){
					res.setHeader('Content-Type','application/json');
					if(err) res.status(400).send(err);
					else res.status(200).send(JSON.stringify(results));
				}
			);
		}
		else if(query=='writeMindMap') {
			var consistency = cassandra.types.consistencies.quorum;
			casSession.executeBatch(wData,consistency,function(err,result){
				res.setHeader('Content-Type','application/json');
				if(err) res.status(400).send(err);
				else res.status(200).send(JSON.stringify(result));
			});
		}
		else if(query=='loadMindMap') {
			var reqMaps=wData.d;
			async.series(
				{
					scno: function(callback){
						casSession.executeAsPrepared(wData.q,function(err,result){
							var cleanData=[];data=[];
							if(err) console.log(err);
							else {
								result.rows.forEach(function(e,i){
									if(e.testscript_ids&&reqMaps.indexOf(e.testscenario_id)!=-1) {
										cleanData.push({id:e.testscenario_id,name:e.testscenario_name,childId:e.testscript_ids});
										//data=data.concat(e.testscript_ids);
										e.testscript_ids.forEach(function(j){
											if(data.indexOf(j)==-1) data.push(j);
										});
									}
								});
							}
							callback(err,cleanData);
						});
					},
					scpt: function(callback){
						casSession.execute("SELECT screen_id,testscript_id,testscript_name FROM test_scripts WHERE testscript_id IN ("+data.toString()+") ALLOW FILTERING",function(err,result){
							var cleanData=[];data=[];
							if(err) console.log(err);
							else {
								result.rows.forEach(function(e,i){
									cleanData.push({id:e.testscript_id,name:e.testscript_name,pid:e.screen_id});
									if(data.indexOf(e.screen_id)==-1) data.push(e.screen_id);
								});
							}
							callback(err,cleanData);
						});
					},
					scrn: function(callback){
						casSession.execute("SELECT screen_id,screen_name FROM screens WHERE screen_id IN ("+data.toString()+") ALLOW FILTERING",function(err,result){
							var cleanData=[];
							if(err) console.log(err);
							else {
								result.rows.forEach(function(e,i){
									cleanData.push({id:e.screen_id,name:e.screen_name});
								});
							}
							callback(err,cleanData);
						});
					}
				},
				function(err,results){
					res.setHeader('Content-Type','application/json');
					if(err) res.status(400).send(err);
					else res.status(200).send(JSON.stringify(results));
				}
			);
		}
		else {   //* Other Queries To API *//
			casSession.executeAsPrepared(wData,function(err,result){
				res.setHeader('Content-Type','application/json');
				if(err) res.status(400).send(err);
				else res.status(200).send(JSON.stringify(result.rows));
			});
		}
	}
};
