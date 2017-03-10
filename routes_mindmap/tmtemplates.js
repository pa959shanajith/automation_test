/*jshint loopfunc:true*/
var fs = require('fs');
var http = require('http');
var xlsx = require('xlsx');
var express = require('express');
var router = express.Router();
var cassandra = require('node-cassandra-cql');

/* Convert excel file to JSON Object. */
var xlsToJSON = function(workbook) {
	var result = {};
	workbook.SheetNames.forEach(function(sheetName) {
		var roa = xlsx.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
		if (roa.length > 0) {
			result[sheetName] = roa;
		}
	});
	return result;
};

/* Convert excel file to CSV Object. */
var xlsToCSV = function(workbook) {
	var result = [];
	workbook.SheetNames.forEach(function(sheetName) {
		var csv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);
		if (csv.length > 0) {
			result.push(sheetName);
			result.push(csv);
		}
	});
	//return result.join("\n");
	return result;
};

/* Send queries to Neo4J API. */
var reqToNeo4j = function(d,u,callback) {
	var data = JSON.stringify(d);
	var result="";
	var postOptions = {host: u[0], port: u[1], path: '/neoQuerya', method: 'POST',	headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)}};
	var postRequest = http.request(postOptions,function(resp){
		resp.setEncoding('utf-8');
		resp.on('data', function(chunk) {result+=chunk;});
		resp.on('end', function(chunk) {callback(null,resp.statusCode,result);});
	});
	postRequest.on('error',function(e){callback(e.message,400,null);});
	postRequest.write(data);
	postRequest.end();
};

/* Send queries to Cassandra API. */
var reqToCassandra = function(d,q,u,i,callback) {
	var data = JSON.stringify({data:d,query:q,uid:i});
	var result="";
	var postOptions = {host: u[0], port: u[1], path: '/casQuerya', method: 'POST',	headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)}};
	var postRequest = http.request(postOptions,function(resp){
		resp.setEncoding('utf-8');
		resp.on('data', function(chunk) {result+=chunk;});
		resp.on('end', function(chunk) {
			if(resp.statusCode==400) callback(result,400,null);
			else callback(null,resp.statusCode,result);
		});
	});
	postRequest.on('error',function(e){callback(e.message,400,null);});
	postRequest.write(data);
	postRequest.end();
};

/* GET Templates page. */
router.get('/', function(req, res, next) {
	if(!req.session.uniqueID) {res.status(200).send('<br><br>Your session has been invalidated. Please <a href=\'/logout\'>Login</a> Again');}
	else {
		var userDetails = req.session.uniqueID.attributes;
		res.status(200).render('tmTemplates.jade', {title: 'Template Design', fname: userDetails.fName, lname: userDetails.lName, urole: userDetails.role});
	}
});

/* GET Create Templates page. */
router.get('/create', function(req, res, next) {
	if(!req.session.uniqueID) {res.status(200).send('<br><br>Your session has been invalidated. Please <a href=\'/logout\'>Login</a> Again');}
	else {
		var userDetails = req.session.uniqueID.attributes;
		res.status(200).render('tmCreateTemplate.jade', {title: 'Create New Template', fname: userDetails.fName, lname: userDetails.lName, urole: userDetails.role});
	}
});

/* POST Create Templates page. */
router.post('/create', function(req, res, next) {
	if(!req.session.uniqueID) {res.status(401).send('Session Timed Out! Login Again');}
	else {
		var data=req.body.data,neoQList=[],casQList=[],idDict={};
		var sessObj=req.session.uniqueID;
		var prjId=sessObj.project.id;
		data[0].childId=[];
		data.forEach(function(e,i){
			idDict[e.id]=cassandra.types.uuid();
			e.id=idDict[e.id];
			if(e.type==1) {
				e.pid=sessObj.cycle.id;
				neoQList.push({"statement":"MERGE (n:TEST_SCENARIOS {testscenario_id:'"+e.id+"',testscenario_name:'"+e.name+"',cycle_id:'"+e.pid+"'})"});
			}
			else if(e.type==2) {
				e.pid=idDict[e.pid];
				neoQList.push({"statement":"MERGE (n:SCREENS {screen_id:'"+e.id+"',screen_name:'"+e.name+"',testscenario_id:'"+e.pid+"'})"});
				casQList.push({query:"INSERT INTO screens(project_id,screen_id,screen_name) values(?,?,?)",params:[prjId,e.id,e.name]});
			}
			else if(e.type==3) {
				e.pid=idDict[e.pid];
				data[0].childId.push(e.id);
				neoQList.push({"statement":"MERGE (n:TEST_SCRIPTS {testscript_id:'"+e.id+"',testscript_name:'"+e.name+"',screen_id:'"+e.pid+"'})"});
				casQList.push({query:"INSERT INTO test_scripts(screen_id,testscript_id,testscript_name) values(?,?,?)",params:[e.pid,e.id,e.name]});
			}
		});
		neoQList.push({"statement":"MATCH (a:TEST_SCENARIOS),(b:SCREENS) WHERE a.testscenario_id=b.testscenario_id MERGE (a)-[r:FTSCNTSCR {id:b.testscenario_id}]-(b)"});
		neoQList.push({"statement":"MATCH (a:SCREENS),(b:TEST_SCRIPTS) WHERE a.screen_id=b.screen_id MERGE (a)-[r:FSCRTTSCT {id:b.screen_id}]-(b)"});
		casQList.push({query:"INSERT INTO test_scenarios(cycle_id,testscenario_id,testscenario_name,testscript_ids) values(?,?,?,?)",params:[data[0].pid,data[0].id,data[0].name,data[0].childId]});
		var urlData=req.get('host').split(':');
		var reqError={n4j:null,cas:null};
		var reqStatus={n4j:null,cas:null};
		var reqResult={n4j:null,cas:null};
		reqToNeo4j({"data":{"statements":neoQList}},urlData,function(err,status,result){
			reqError.n4j=err;
			reqStatus.n4j=status;
			reqResult.n4j=result;
		});
		reqToCassandra(casQList,'writeMindMap',urlData,req.session.uniqueID,function(err,status,result){
			reqError.cas=err;
			reqStatus.cas=status;
			reqResult.cas=result;
		});
		res.setHeader('Content-Type','application/json');
		var msg={},statusCode;
		if(reqError.n4j) msg.neo4j=reqError.n4j;
		else msg.neo4j=reqResult.n4j;
		if(reqError.cas) msg.cassandra=reqError.cas;
		else msg.cassandra=reqResult.cas;
		if(reqStatus.cas==400&&reqStatus.n4j==400) statusCode=400;
		else statusCode=200;
		res.status(statusCode).send(JSON.stringify(msg));
	}
});

/* GET Import From Excel page. */
router.get('/import/excel', function(req, res, next) {
	if(!req.session.uniqueID) {res.status(200).send('<br><br>Your session has been invalidated. Please <a href=\'/logout\'>Login</a> Again');}
	else {
		var userDetails = req.session.uniqueID.attributes;
		res.status(200).render('tmImportXlsTemplate.jade', {title: 'Import Template From Excel', fname: userDetails.fName, lname: userDetails.lName, urole: userDetails.role});
	}
});

/* POST Import From Excel page. */
router.post('/import/excel', function(req, res, next) {
	if(!req.session.uniqueID) res.status(401).send('Session Timed Out! Login Again');
	else {
		var sessObj=req.session.uniqueID;
		var wb = xlsx.read(req.body.data, {type:req.body.type});
		var myCSV=xlsToCSV(wb);
		var numSheets=myCSV.length/2;
		var qObj=[];
		var err;
		for(var k=0;k<numSheets;k++){
			var cSheet=myCSV[k*2+1];
			var cSheetRow=cSheet.split('\n');
			var scoIdx=-1,scrIdx=-1,sctIdx=-1;
			var uniqueIndex=0;
			cSheetRow[0].split(',').forEach(function(e,i) {
				if(/scenario/i.test(e))scoIdx=i;
				if(/screen/i.test(e))scrIdx=i;
				if(/script/i.test(e))sctIdx=i;
			});
			if(scoIdx==-1||scrIdx==-1||sctIdx==-1||cSheetRow.length<2){
				err='FATAL Error!! Import a non empty excel file with Scenario, Screen, Script columns.';
				break;
			}
			var e,lastSco=-1,lastScr=-1,nodeDict={},scrDict={};
			for(var i=1;i<cSheetRow.length;i++){
				var row=cSheetRow[i].split(',');
				if(row.length<3) continue;
				if(row[scoIdx]!==''){
					lastSco=uniqueIndex;lastScr=-1;scrDict={};
					e={id:cassandra.types.uuid(),name:row[scoIdx],pid:sessObj.cycle.id,type:1};
					qObj.push(e);
					nodeDict[e.id]=uniqueIndex;
					uniqueIndex++;
				}
				if(row[scrIdx]!=='' && lastSco!=-1){
					var tName=row[scrIdx];
					var lScr=qObj[lastScr];
					if(lScr===undefined||(lScr&&lScr.name!==tName)) {
						if(scrDict[tName]===undefined) scrDict[tName]=cassandra.types.uuid();
						lastScr=uniqueIndex;
						e={id:scrDict[tName],name:tName,pid:qObj[lastSco].id,type:2,uidx:lastScr};
						qObj.push(e);
						nodeDict[e.id]=uniqueIndex;
						uniqueIndex++;
					}
				}
				if(row[sctIdx]!=='' && lastScr!=-1){
					e={id:cassandra.types.uuid(),name:row[sctIdx],pid:qObj[lastScr].id,type:3,uidx:lastScr};
					qObj.push(e);
					nodeDict[e.id]=uniqueIndex;
					uniqueIndex++;
				}
			}
		}
		var tSt,qList=[];
		qObj.forEach(function(e,i){
			if(e.type==1) qList.push({"statement":"MERGE (n:TEST_SCENARIOS {testscenario_id:'"+e.id+"',testscenario_name:'"+e.name+"',cycle_id:'"+e.pid+"'})"});
			else if(e.type==2) {
				tSt="screen_id:'"+e.id+"',screen_name:'"+e.name+"',testscenario_id:'"+e.pid+"'";
				qList.push({"statement":"MATCH (o:SCREENS{"+tSt+"}) with count(o) as co OPTIONAL MATCH(n:SCREENS{"+tSt+"}) WHERE exists(n.uid) WITH co,count(n) as cn FOREACH (x IN CASE WHEN cn>0 THEN [1] END | CREATE(p:SCREENS{"+tSt+",uid:"+e.uidx+"})) FOREACH (x IN CASE WHEN co=0 THEN [1] END | CREATE(p:SCREENS{"+tSt+",uid:"+e.uidx+"}))"});
			}
			else if(e.type==3) {
				tSt="testscript_id:'"+e.id+"',testscript_name:'"+e.name+"',screen_id:'"+e.pid+"'";
				qList.push({"statement":"MATCH (o:TEST_SCRIPTS{"+tSt+"}) with count(o) as co OPTIONAL MATCH(n:TEST_SCRIPTS{"+tSt+"}) WHERE exists(n.uid) WITH co,count(n) as cn FOREACH (x IN CASE WHEN cn>0 THEN [1] END | CREATE(p:TEST_SCRIPTS{"+tSt+",uid:"+e.uidx+"})) FOREACH (x IN CASE WHEN co=0 THEN [1] END | CREATE(p:TEST_SCRIPTS{"+tSt+",uid:"+e.uidx+"}))"});
			}
		});
		qList.push({"statement":"MATCH (a:TEST_SCENARIOS),(b:SCREENS) WHERE a.testscenario_id=b.testscenario_id MERGE (a)-[r:FTSCNTSCR {id:b.testscenario_id}]-(b)"});
		qList.push({"statement":"MATCH (a:SCREENS),(b:TEST_SCRIPTS) WHERE a.screen_id=b.screen_id and a.uid=b.uid MERGE (a)-[r:FSCRTTSCT {id:b.screen_id}]-(b)"});
		qList.push({"statement":"MATCH (a) remove a.uid"});
		var urlData=req.get('host').split(':');
		reqToNeo4j({"data":{"statements":qList}},urlData,function(error,status,result){
			res.setHeader('Content-Type', 'application/json');
			if(err) res.status(400).send(err);
			else if(error) res.status(status).send(error);
			else res.status(status).send('Data imported successfully!');
		});
	}
});

/* GET Import From DB page. */
router.get('/import/db', function(req, res, next) {
	if(!req.session.uniqueID) {res.status(200).send('<br><br>Your session has been invalidated. Please <a href=\'/logout\'>Login</a> Again');}
	else {
		var userDetails = req.session.uniqueID.attributes;
		res.status(200).render('tmImportDBTemplate.jade', {title: 'Import Template From DB', fname: userDetails.fName, lname: userDetails.lName, urole: userDetails.role});
	}
});

/* POST Import From DB page. */
router.post('/import/db', function(req, res, next) {
	if(!req.session.uniqueID) res.status(401).send('Session Timed Out! Login Again');
	else {
		var d=req.body;
		var nData=[],query=[],qList=[];
		var sessObj=req.session.uniqueID;
		var urlData=req.get('host').split(':');
		if(d.task=='getList'){
			query="SELECT testscenario_id,testscenario_name FROM test_scenarios WHERE cycle_id="+sessObj.cycle.id+";";
			reqToCassandra(query,'none',urlData,sessObj,function(err,status,result){
				res.setHeader('Content-Type', 'application/json');
				if(err) res.status(status).send(err);
				else{
					var jsonData=JSON.parse(result);
					jsonData.forEach(function(e,i) {
						nData.push({id:e.testscenario_id,name:e.testscenario_name});
					});
					res.status(status).send(nData);
				}
			});
		}
		else if(d.task=='setList'){
			var qObj=[],qObjDict={},uIdx=0;
			query="SELECT testscenario_id,testscenario_name,testscript_ids FROM test_scenarios WHERE cycle_id="+sessObj.cycle.id+";";
			reqToCassandra({q:query,d:d.data},'loadMindMap',urlData,sessObj,function(err,status,result){
				if(err) res.status(status).send(err);
				else{
					var idDict={},k=0;
					var jsonData=JSON.parse(result);
					jsonData.scrn.forEach(function(e,i) {
						nData.push({id:e.id,name:e.name,type:2});
						idDict[e.id]=k;
						k++;
					});
					jsonData.scpt.forEach(function(e,i) {
						var pIdx=idDict[e.pid];
						if(pIdx!==undefined) {
							nData.push({id:e.id,name:e.name,parent:nData[pIdx],pid:e.pid,type:3});
							idDict[e.id]=k;
							k++;
						}
					});
					jsonData.scno.forEach(function(e) {
						var mMap,flag,scr,sct,iScr,lScr;
						if(e.childId) {
							mMap={id:e.id,name:e.name,pid:sessObj.cycle.id,type:1};
							flag=e.childId.some(function(c,i){
								if(idDict[c]===undefined) return !0;
								else{
									var lastScr=null;
									sct=nData[idDict[c]];
									scr=JSON.parse(JSON.stringify(sct.parent));
									iScr=qObjDict[scr.id];
									if(iScr===undefined) {
										scr.pid=e.id; scr.uidx=uIdx; lScr=uIdx;
										qObj.push(scr);
										qObjDict[scr.id]=uIdx;
										uIdx++;
									}
									else if(qObj[iScr].pid!==e.id) {
										scr.pid=e.id; scr.uidx=uIdx; lScr=uIdx;
										qObj.push(scr);
										qObjDict[scr.id]=uIdx;
										uIdx++;
									}
									else {
										var u=qObj[lScr];
										if(u&&u.id!=scr.id){
											scr.pid=e.id; scr.uidx=uIdx; lScr=uIdx;
											qObj.push(scr);
											qObjDict[scr.id]=uIdx;
											uIdx++;
										}
									}
									qObj.push({id:sct.id,name:sct.name,pid:sct.pid,type:3,uidx:lScr});
									qObjDict[sct.id]=uIdx;
									uIdx++;
									return !1;
								}
							});
							if(flag) mMap=null;
							else {
								qObj.push(mMap);
								qObjDict[scr.id]=uIdx;
								uIdx++;
							}
						}
					});
					var tSt;
					qObj.forEach(function(e,i){
						if(e.type==1) qList.push({"statement":"MERGE (n:TEST_SCENARIOS {testscenario_id:'"+e.id+"',testscenario_name:'"+e.name+"',cycle_id:'"+e.pid+"'})"});
						else if(e.type==2) {
							tSt="screen_id:'"+e.id+"',screen_name:'"+e.name+"',testscenario_id:'"+e.pid+"'";
							qList.push({"statement":"MATCH (o:SCREENS{"+tSt+"}) with count(o) as co OPTIONAL MATCH(n:SCREENS{"+tSt+"}) WHERE exists(n.uid) WITH co,count(n) as cn FOREACH (x IN CASE WHEN cn>0 THEN [1] END | CREATE(p:SCREENS{"+tSt+",uid:"+e.uidx+"})) FOREACH (x IN CASE WHEN co=0 THEN [1] END | CREATE(p:SCREENS{"+tSt+",uid:"+e.uidx+"}))"});
						}
						else if(e.type==3) {
							tSt="testscript_id:'"+e.id+"',testscript_name:'"+e.name+"',screen_id:'"+e.pid+"'";
							qList.push({"statement":"MATCH (o:TEST_SCRIPTS{"+tSt+"}) with count(o) as co OPTIONAL MATCH(n:TEST_SCRIPTS{"+tSt+"}) WHERE exists(n.uid) WITH co,count(n) as cn FOREACH (x IN CASE WHEN cn>0 THEN [1] END | CREATE(p:TEST_SCRIPTS{"+tSt+",uid:"+e.uidx+"})) FOREACH (x IN CASE WHEN co=0 THEN [1] END | CREATE(p:TEST_SCRIPTS{"+tSt+",uid:"+e.uidx+"}))"});
						}
					});
					qList.push({"statement":"MATCH (a:TEST_SCENARIOS),(b:SCREENS) WHERE a.testscenario_id=b.testscenario_id MERGE (a)-[r:FTSCNTSCR {id:b.testscenario_id}]-(b)"});
					qList.push({"statement":"MATCH (a:SCREENS),(b:TEST_SCRIPTS) WHERE a.screen_id=b.screen_id and a.uid=b.uid MERGE (a)-[r:FSCRTTSCT {id:b.screen_id}]-(b)"});
					qList.push({"statement":"MATCH (a) remove a.uid"});
					var urlData=req.get('host').split(':');
					reqToNeo4j({"data":{"statements":qList}},urlData,function(err,status,result){
						res.setHeader('Content-Type', 'application/json');
						if(err) res.status(status).send(err);
						else if(status!=200) res.status(status).send(result);
						else res.status(status).send(result);
					});
				}
			});
		}
	}
});

module.exports = router;
