var uuidV4 = require('uuid-random');
var neo4jAPI = require('../controllers/neo4jAPI');
var admin = require('../controllers/admin');
var suite = require('../controllers/suite');
var create_ice = require('../controllers/create_ice');
var myserver = require('../lib/socket.js');
var notificationMsg = require("../notifications/notifyMessages");
var logger = require('../../logger');
var utils = require('../lib/utils');
var xlsx = require('xlsx');
var path = require('path');
var fs = require('fs');
var xl = require('excel4node');
var taskflow = require('../config/options').strictTaskWorkflow;
var crypto = require("crypto");
var async = require("async");
var design = require('../controllers/design');
var Client = require("node-rest-client").Client;
var DOMParser = require('xmldom').DOMParser;
var epurl = process.env.NDAC_URL;
var client = new Client();
/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info
*
**/
var Base64 = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

    // public method for encoding
    , encode: function (input)
    {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length)
        {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2))
            {
                enc3 = enc4 = 64;
            }
            else if (isNaN(chr3))
            {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        } // Whend 

        return output;
    } // End Function encode 


    // public method for decoding
    ,decode: function (input)
    {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length)
        {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64)
            {
                output = output + String.fromCharCode(chr2);
            }

            if (enc4 != 64)
            {
                output = output + String.fromCharCode(chr3);
            }

        } // Whend 

        output = Base64._utf8_decode(output);

        return output;
    } // End Function decode 


    // private method for UTF-8 encoding
    ,_utf8_encode: function (string)
    {
        var utftext = "";
        string = string.replace(/\r\n/g, "\n");

        for (var n = 0; n < string.length; n++)
        {
            var c = string.charCodeAt(n);

            if (c < 128)
            {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048))
            {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else
            {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        } // Next n 

        return utftext;
    } // End Function _utf8_encode 

    // private method for UTF-8 decoding
    ,_utf8_decode: function (utftext)
    {
        var string = "";
        var i = 0;
        var c, c1, c2, c3;
        c = c1 = c2 = 0;

        while (i < utftext.length)
        {
            c = utftext.charCodeAt(i);

            if (c < 128)
            {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224))
            {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else
            {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        } // Whend 

        return string;
    } // End Function _utf8_decode 

}
function addslashes( str ) {
    return str;
}
/* Convert excel file to CSV Object. */
var xlsToCSV = function (workbook, sheetname) {
	var result = [];
	var csv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetname]);
	if (csv.length > 0) {
		result.push(sheetname);
		result.push(csv);
	}
	//return result.join("\n");
	return result;
};

exports.populateProjects = function (req, res) {
	logger.info("Inside UI service: populateProjects");
	if (utils.isSessionActive(req)) {
		var reqData = {
			"userid": req.session.userid,
			"allflag": true
		};
		create_ice.getProjectIDs_Nineteen68(reqData, function (err, data) {
			res.setHeader('Content-Type', 'application/json');
			if (err)
				res.status(500).send('Fail');
			else {
				res.status(200).send(data);
			}
		});
	}
	else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
};

exports.populateScenarios = function (req, res) {
	logger.info("Inside UI service: populateScenarios");
	if (utils.isSessionActive(req)) {
		var moduleId = req.body.moduleId;
		//var taskID=d.taskId;
		query = { 'statement': "MATCH (a{moduleID:'" + moduleId + "'})-[:FMTTS]->(b) RETURN b ORDER BY b.childIndex" };
		var qlist_query = [query];
		var scenarioList = [];
		neo4jAPI.executeQueries(qlist_query, function (status, result) {
			res.setHeader('Content-Type', 'application/json');
			if (status != 200) res.status(status).send(result);
			else {
				try {
					res_data = result;
					res_data[0].data.forEach(function (row) {
						scenarioList.push(row.row[0]);
					});
					res.status(200).send(scenarioList);
				} catch (ex) {
					logger.error("exception in mindmapService: ", ex);
					res.status(200).send('fail');
				}
			}
		});
	}
	else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
};

exports.getProjectTypeMM_Nineteen68 = function (req, res) {
	logger.info("Inside UI service: getProjectTypeMM_Nineteen68");
	if (utils.isSessionActive(req)) {
		var inputs = req.body.projectId;
		create_ice.getProjectType_Nineteen68(inputs, function (err, result) {
			if (err) {
				res.status(500).send('Fail');
			}
			else {
				res.status(200).send(result);
			}
		});
	}
	else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
};

exports.populateUsers = function (req, res) {
	logger.info("Inside UI service: populateUsers");
	if (utils.isSessionActive(req)) {
		var d = req.body;
		admin.getUsers_Nineteen68({ prjId: d.projectId }, function (err, data) {
			res.setHeader('Content-Type', 'application/json');
			if (err)
				res.status(500).send('Fail');
			else {
				res.status(200).send(data);
			}
		});
	}
	else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}

};

exports.populateReleases = function (req, res) {
	logger.info("Inside UI service: populateReleases");
	if (utils.isSessionActive(req)) {
		var d = req.body;
		var project_id = { projectId: d.projectId };
		create_ice.getReleaseIDs_Nineteen68(project_id, function (err, data) {
			res.setHeader('Content-Type', 'application/json');
			if (err)
				res.status(500).send('Fail');
			else {
				res.status(200).send(data);
			}
		});
	}
	else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
};

exports.populateCycles = function (req, res) {
	logger.info("Inside UI service: populateCycles");
	if (utils.isSessionActive(req)) {
		var rel_id = { relId: req.body.releaseId };
		create_ice.getCycleIDs_Nineteen68(rel_id, function (err, data) {
			res.setHeader('Content-Type', 'application/json');
			if (err)
				res.status(500).send(err);
			else {
				res.status(200).send(data);
			}
		});
	}
	else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
};

exports.getCRId = function (req, res) {
	logger.info("Inside UI service: getCRId");
	if (utils.isSessionActive(req)) {
		var inputs = { "projectid": req.body.projectid };
		suite.getCRId(inputs, function (status, result) {
			res.setHeader('Content-Type', 'application/json');
			if (status != 200) res.status(status).send(result);
			else {
				res.status(status).send(result);
			}
		});
	}
	else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
};

exports.checkReuse = function (req, res) {
	logger.info("Inside UI service: checkReuse");
	if (utils.isSessionActive(req)) {
		var d = req.body;
		var qData = d.parsedata; // this is coming from mindmapservice which is restrict_scenario_reuse from parsedata reuse in minmapcontroller.js
		var qListReuse = getQueries(qData);
		neo4jAPI.executeQueries(qListReuse, function (status, result) {
			res.setHeader('Content-Type', 'application/json');
			if (status != 200) {
				logger.error('Error in checkReuse mindmap service');
				res.status(500).send('Fail');
			}
			else {
				if (qData.gettestcases) {
					res.status(200).send(result[0].data[0].row[0]);
				}
				else {
					var i = 0;
					while (i < qData['screen'].length) {
						if (result[i].data[0].row[0] > 1)
							qData['screen'][i].reuse = true;
						else
							qData['screen'][i].reuse = false;
						qData['screen'][i].count = result[i].data[0].row[0];
						i = i + 1;
					}
					var j = 0;
					while (j < qData['testcase'].length) {
						if (result[i + j].data[0].row[0].length > 1) {
							qData['testcase'][j].reuse = true;
							qData['testcase'][j].oidlist = result[i + j].data[0].row[0];
						}
						else
							qData['testcase'][j].reuse = false;
						j = j + 1;
					}
					var k = 0;
					if (qData['scenarios']) {
						while (k < qData['scenarios'].length) {
							if (result[k].data.length > 0 && (result[k].data[0].row[0] > 1 || (result[k].data[0].row[0] == 1 && qData['modules'] != result[k].data[0].row[1])))
								qData['scenarios'][k].reuse = true;
							else
								qData['scenarios'][k].reuse = false;
							k = k + 1;
						}
					}
					res.status(status).send(qData);
				}
			}
		});
	}
	else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
};

// exports.getReleaseIDs_Nineteen68 = function (req, res) {
// 	logger.info("Inside UI service: getReleaseIDs_Nineteen68");
// 	var rname = [];
// 	var r_ids = [];
// 	var rel = {
// 		rel: [],
// 		r_ids: []
// 	};
// 	var project_id = req.projectId;
// 	inputs = {
// 		"projectid": project_id
// 	};
// 	var args = {
// 		data: inputs,
// 		headers: {
// 			"Content-Type": "application/json"
// 		}
// 	};
// 	logger.info("Calling NDAC Service from getReleaseIDs_Nineteen68: create_ice/getReleaseIDs_Nineteen68");
// 	client.post(epurl+"create_ice/getReleaseIDs_Nineteen68", args,
// 		function (result, response) {
// 			try {
// 				if (response.statusCode != 200 || result.rows == "fail") {
// 					logger.error("Error occurred in create_ice/getReleaseIDs_Nineteen68: getReleaseIDs_Nineteen68, Error Code : ERRNDAC");
// 					res(null, result.rows);
// 				} else {
// 					async.forEachSeries(result.rows, function (iterator, callback1) {
// 						rname.push(iterator.releasename);
// 						r_ids.push(iterator.releaseid);
// 						callback1();
// 					});
// 					rel.rel = rname;
// 					rel.r_ids = r_ids;
// 					res(null, rel);
// 				}
// 			} catch (ex) {
// 				logger.error("Exception in the service getReleaseIDs_Nineteen68: %s", ex);
// 			}
// 		});
// };

exports.getModules = function (req, res) {
	logger.info("Inside UI service: getModules");
	if (utils.isSessionActive(req)) {
		// var nData = [], qList = [], idDict = {};
		// var urlData = req.get('host').split(':');
		console.log(req);
		var d = req.body;
		// var tab = d.tab;
		// var prjId = d.prjId;
		// var modName = d.modName;
		// var relId = d.relId;
		// var cycId = d.cycId;
		// var qmod = '';

		var inputs= {
			"tab":d.tab,
			"projectid":d.projectid || null,
			"modulename":d.modName,
			"moduleid":d.moduleid,
			// "releaseid":d.relId,
			"cycleid":d.cycId,
			"name":"getModules"
		}
		// console.log("Came in getModules");
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};

		client.post("http://WSLK13FODC3-010.SLKSOFT.COM:1991/mindmap/getModules", args,
		function (result, response) {
			try {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in mindmaps/getModules: getModules, Error Code : ERRNDAC");
					res.send("fail");
				} else {
					// async.forEachSeries(result.rows, function (iterator, callback1) {
					// 	rname.push(iterator.releasename);
					// 	r_ids.push(iterator.releaseid);
					// 	callback1();
					// });
					// rel.rel = rname;
					// rel.r_ids = r_ids;
					res.send(result.rows);
				}
			} catch (ex) {
				logger.error("Exception in the service getReleaseIDs_Nineteen68: %s", ex);
			}
		});

		
		// if (modName == 'fetch all')  {
		// 	if (d.tab == 'tabAssign' || d.tab == 'endToend') {
		// 		qList.push({ "statement": "MATCH path=(n:MODULES_ENDTOEND{projectID:'" + prjId + "'})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });
		// 		qList.push({ "statement": "MATCH path=(n:MODULES_ENDTOEND{projectID:'" + prjId + "'}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
		// 	}
		// 	qList.push({ "statement": " MATCH path=(n:MODULES{projectID:'" + prjId + "'})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });
		// 	qList.push({ "statement": "MATCH path=(n:MODULES{projectID:'" + prjId + "'}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
			
		// 	// MATCH (a:MODULES) WHERE NOT (a)-[:FMTTS]->() return a

			
		// 	neo4jAPI.executeQueries(qList, function (status, result) {
		// 		res.setHeader('Content-Type', 'application/json');
		// 		if (status != 200) res.status(status).send(result);
		// 		else {
		// 			var k = 0, rIndex = [], lbl, neoIdDict = {}, maps = [], tList = [];
		// 			var attrDict = { "modules_endtoend": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "modules": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "scenarios": { "projectID": "projectID", "childIndex": "childIndex", "moduleID": "pid_n", "testScenarioName": "name", "testScenarioID": "id_n", "testScenarioID_c": "id_c" }, "screens": { "projectID": "projectID", "childIndex": "childIndex", "testScenarioID": "pid_n", "screenName": "name", "screenID": "id_n", "screenID_c": "id_c", "taskexists": "taskexists" }, "testcases": { "projectID": "projectID", "childIndex": "childIndex", "screenID": "pid_n", "testCaseName": "name", "testCaseID": "id_n", "testCaseID_c": "id_c", "taskexists": "taskexists" }, "tasks": { "taskID": "id_n", "task": "t", "batchName": "bn", "assignedTo": "at", "reviewer": "rw", "startDate": "sd", "endDate": "ed", "re_estimation": "re_estimation", "release": "re", "cycle": "cy", "details": "det", "nodeID": "pid", "parent": "anc", "cx": "cx" } };
		// 			var jsonData = result;
		// 			var all_modules = jsonData[0].data;
		// 			if (d.tab == 'tabAssign' || d.tab == 'endToend') {
		// 				all_modules = jsonData[0].data.concat(jsonData[1].data).concat(jsonData[2].data).concat(jsonData[3].data);
		// 			} else {
		// 				all_modules = jsonData[0].data.concat(jsonData[1].data);
		// 			}
		// 			all_modules.forEach(function (row) {
		// 				row.graph.nodes.forEach(function (n) {
		// 					if (idDict[n.id] === undefined) {
		// 						lbl = n.labels[0].toLowerCase();
		// 						if (lbl == 'testscenarios') lbl = 'scenarios';
		// 						for (var attrs in n.properties) {
		// 							if (attrDict[lbl][attrs] !== undefined) n[attrDict[lbl][attrs]] = n.properties[attrs];
		// 							delete n.properties[attrs];
		// 						}
		// 						if (lbl == "tasks") {
		// 							try {
		// 								nData.push({ id: n.id_n, oid: n.id, task: n.t, batchName: n.bn, assignedTo: n.at, reviewer: n.rw, startDate: n.sd, endDate: n.ed, re_estimation: n.re_estimation, release: n.re, cycle: n.cy, details: n.det, nodeID: n.pid, parent: n.anc.slice(1, -1).split(','), cx: n.cx });
		// 							}
		// 							catch (ex) {
		// 								logger.error("exception in mindmapService: ", ex);
		// 							}
		// 						}
		// 						else {
		// 							if (lbl == "modules" || lbl == "modules_endtoend") n.childIndex = 0;
		// 							nData.push({ projectID: n.projectID, childIndex: n.childIndex, id: n.id, "type": lbl, name: n.name, id_n: n.id_n, pid_n: n.pid_n, id_c: n.id_c, children: [], task: null });
		// 						}
		// 						if (lbl == "modules" || lbl == "modules_endtoend") rIndex.push(k);
		// 						idDict[n.id] = k; neoIdDict[n.id_n] = k;
		// 						k++;
		// 					}
		// 				});
		// 				row.graph.relationships.forEach(function (r) {
		// 					try {
		// 						var srcIndex = idDict[r.startNode.toString()];
		// 						var tgtIndex = idDict[r.endNode.toString()];
		// 						//if(nData[tgtIndex].children===undefined) nData[srcIndex].task=nData[tgtIndex];
		// 						if (nData[tgtIndex].children === undefined) {
		// 							if ((tab == 'tabAssign' && nData[tgtIndex].release == relId && nData[tgtIndex].cycle == cycId) || tab == 'tabCreate' || tab == 'endToend') {
		// 								nData[srcIndex].task = nData[tgtIndex];
		// 							} else if (nData[srcIndex].type == 'testcases' || nData[srcIndex].type == 'screens') {
		// 								nData[srcIndex].taskexists = nData[tgtIndex];
		// 							}
		// 						}
		// 						else if (nData[srcIndex].children.indexOf(nData[tgtIndex]) == -1) {
		// 							nData[srcIndex].children.push(nData[tgtIndex]);
		// 							if (nData[tgtIndex].childIndex == undefined) {
		// 								nData[tgtIndex].childIndex = nData[srcIndex].children.length;
		// 							}
		// 						}
		// 					} catch (ex) {

		// 						logger.error("exception in mindmapService: ", ex);
		// 					}
		// 				});
		// 			});
		// 			//tList.forEach(function(t){nData[neoIdDict[t.nodeID]].task=t;});
		// 			nData.forEach(function (e) {
		// 				if (e.pid_n) {
		// 					if (neoIdDict[e.pid_n] !== undefined) e.pid_n = nData[neoIdDict[e.pid_n]].id;
		// 					else e.pid_n = null;
		// 				}
		// 			});
		// 			rIndex.forEach(function (m) { maps.push(nData[m]); });
		// 			res.status(status).send(maps);
		// 		}
		// 	});
		// }
		// if (modName) {
		// 	qmod = ',moduleName:"' + modName + '"';
		// 	if (d.tab == 'tabAssign' || d.tab == 'endToend') {
		// 		qList.push({ "statement": "MATCH path=(n:MODULES_ENDTOEND{projectID:'" + prjId + "' " + qmod + "})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });
		// 		qList.push({ "statement": "MATCH path=(n:MODULES_ENDTOEND{projectID:'" + prjId + "' " + qmod + "}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
		// 	}
		// 	qList.push({ "statement": " MATCH path=(n:MODULES{projectID:'" + prjId + "' " + qmod + "})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });
		// 	qList.push({ "statement": "MATCH path=(n:MODULES{projectID:'" + prjId + "' " + qmod + "}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
		// 	//MATCH (a:MODULES) WHERE NOT (a)-[:FMTTS]->() return a

		// 	neo4jAPI.executeQueries(qList, function (status, result) {
		// 		res.setHeader('Content-Type', 'application/json');
		// 		if (status != 200) res.status(status).send(result);
		// 		else {
		// 			var k = 0, rIndex = [], lbl, neoIdDict = {}, maps = [], tList = [];
		// 			var attrDict = { "modules_endtoend": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "modules": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "scenarios": { "projectID": "projectID", "childIndex": "childIndex", "moduleID": "pid_n", "testScenarioName": "name", "testScenarioID": "id_n", "testScenarioID_c": "id_c" }, "screens": { "projectID": "projectID", "childIndex": "childIndex", "testScenarioID": "pid_n", "screenName": "name", "screenID": "id_n", "screenID_c": "id_c", "taskexists": "taskexists" }, "testcases": { "projectID": "projectID", "childIndex": "childIndex", "screenID": "pid_n", "testCaseName": "name", "testCaseID": "id_n", "testCaseID_c": "id_c", "taskexists": "taskexists" }, "tasks": { "taskID": "id_n", "task": "t", "batchName": "bn", "assignedTo": "at", "reviewer": "rw", "startDate": "sd", "endDate": "ed", "re_estimation": "re_estimation", "release": "re", "cycle": "cy", "details": "det", "nodeID": "pid", "parent": "anc", "cx": "cx" } };
		// 			var jsonData = result;
		// 			var all_modules = jsonData[0].data;
		// 			if (d.tab == 'tabAssign' || d.tab == 'endToend') {
		// 				all_modules = jsonData[0].data.concat(jsonData[1].data).concat(jsonData[2].data).concat(jsonData[3].data);
		// 			} else {
		// 				all_modules = jsonData[0].data.concat(jsonData[1].data);
		// 			}
		// 			all_modules.forEach(function (row) {
		// 				row.graph.nodes.forEach(function (n) {
		// 					if (idDict[n.id] === undefined) {
		// 						lbl = n.labels[0].toLowerCase();
		// 						if (lbl == 'testscenarios') lbl = 'scenarios';
		// 						for (var attrs in n.properties) {
		// 							if (attrDict[lbl][attrs] !== undefined) n[attrDict[lbl][attrs]] = n.properties[attrs];
		// 							delete n.properties[attrs];
		// 						}
		// 						if (lbl == "tasks") {
		// 							try {
		// 								nData.push({ id: n.id_n, oid: n.id, task: n.t, batchName: n.bn, assignedTo: n.at, reviewer: n.rw, startDate: n.sd, endDate: n.ed, re_estimation: n.re_estimation, release: n.re, cycle: n.cy, details: n.det, nodeID: n.pid, parent: n.anc.slice(1, -1).split(','), cx: n.cx });
		// 							}
		// 							catch (ex) {
		// 								logger.error("exception in mindmapService: ", ex);
		// 							}
		// 						}
		// 						else {
		// 							if (lbl == "modules" || lbl == "modules_endtoend") n.childIndex = 0;
		// 							nData.push({ projectID: n.projectID, childIndex: n.childIndex, id: n.id, "type": lbl, name: n.name, id_n: n.id_n, pid_n: n.pid_n, id_c: n.id_c, children: [], task: null });
		// 						}
		// 						if (lbl == "modules" || lbl == "modules_endtoend") rIndex.push(k);
		// 						idDict[n.id] = k; neoIdDict[n.id_n] = k;
		// 						k++;
		// 					}
		// 				});
		// 				row.graph.relationships.forEach(function (r) {
		// 					try {
		// 						var srcIndex = idDict[r.startNode.toString()];
		// 						var tgtIndex = idDict[r.endNode.toString()];
		// 						//if(nData[tgtIndex].children===undefined) nData[srcIndex].task=nData[tgtIndex];
		// 						if (nData[tgtIndex].children === undefined) {
		// 							if ((tab == 'tabAssign' && nData[tgtIndex].release == relId && nData[tgtIndex].cycle == cycId) || tab == 'tabCreate' || tab == 'endToend') {
		// 								nData[srcIndex].task = nData[tgtIndex];
		// 							} else if (nData[srcIndex].type == 'testcases' || nData[srcIndex].type == 'screens') {
		// 								nData[srcIndex].taskexists = nData[tgtIndex];
		// 							}
		// 						}
		// 						else if (nData[srcIndex].children.indexOf(nData[tgtIndex]) == -1) {
		// 							nData[srcIndex].children.push(nData[tgtIndex]);
		// 							if (nData[tgtIndex].childIndex == undefined) {
		// 								nData[tgtIndex].childIndex = nData[srcIndex].children.length;
		// 							}
		// 						}
		// 					} catch (ex) {
		// 						logger.error("exception in mindmapService: ", ex);
		// 					}
		// 				});
		// 			});
		// 			//tList.forEach(function(t){nData[neoIdDict[t.nodeID]].task=t;});
		// 			nData.forEach(function (e) {
		// 				if (e.pid_n) {
		// 					if (neoIdDict[e.pid_n] !== undefined) e.pid_n = nData[neoIdDict[e.pid_n]].id;
		// 					else e.pid_n = null;
		// 				}
		// 			});
		// 			rIndex.forEach(function (m) { maps.push(nData[m]); });
		// 			res.status(status).send(maps);
		// 		}
		// 	});
		// }
	// 	else {
	// 		qList.push({ "statement": " MATCH (n:MODULES{projectID:'" + prjId + "'}) RETURN n.moduleName,n.moduleID", "resultDataContents": ["row"] });
	// 		if (d.tab == 'tabAssign' || d.tab == 'endToend') {
	// 			qList.push({ "statement": "MATCH (n:MODULES_ENDTOEND{projectID:'" + prjId + "'}) RETURN n.moduleName,n.moduleID", "resultDataContents": ["row"] });
	// 		}

	// 		neo4jAPI.executeQueries(qList, function (status, result) {
	// 			var modulenames = [];
	// 			res.setHeader('Content-Type', 'application/json');
	// 			if (status != 200) res.status(status).send(result);
	// 			else {
	// 				if (result[1]) {
	// 					result[1].data.forEach(function (e, i) {
	// 						modulenames.push({ name: e.row[0], type: 'modules_endtoend', id_n: e.row[1] });
	// 					});
	// 				}
	// 				result[0].data.forEach(function (e, i) {
	// 					modulenames.push({ name: e.row[0], type: 'modules', id_n: e.row[1] });
	// 				});
	// 				res.status(status).send(modulenames);
	// 			}
	// 		});
	// 	}
	}
	else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
};

function check_status(ExecutionData,check_callback){
	if(ExecutionData && taskflow){
		utils.approval_status_check(ExecutionData, function (err, approved) {
			check_callback(err,approved)
		});
	}else{
		check_callback(null,true);
	}
	
}

exports.reviewTask = function (req, res) {
	logger.info("Inside UI service: reviewTask");
	if (utils.isSessionActive(req)) {
		var inputs = req.body;
		var taskID = inputs.taskId;
		var batchIds = inputs.batchIds;
		var userId = req.session.userid;
		var username = req.session.username;
		var date = new Date();
		var status = inputs.status;
		var versionnumber = inputs.versionnumber;
		if (batchIds.indexOf(',')>-1){
			var batch_tasks=batchIds.split(',');
			taskID=JSON.stringify(batch_tasks);
		}else{
			taskID=JSON.stringify(batchIds);
		}
		var ExecutionData=inputs.module_info;
		check_status(ExecutionData, function (err, check_status_result) {
			if (check_status_result){
				var cur_date = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + ',' +date.toLocaleTimeString();
				var taskHistory = { "userid": userId, "status": "", "modifiedBy": username, "modifiedOn": cur_date };
				if (status == 'inprogress' || status == 'assigned' || status == 'reassigned' || status == 'reassign') {
					query = { 'statement': "MATCH (n:TASKS) WHERE n.taskID in " + taskID + " and n.assignedTo='" + userId + "' with n as n Match path=(n)<-[r]-(a) RETURN path", "resultDataContents": ["graph"] };
				} else if (status == 'review') {
					query = { 'statement': "MATCH (n:TASKS) WHERE n.taskID in " + taskID + " and n.reviewer='" + userId + "' with n as n Match path=(n)<-[r]-(a) RETURN path", "resultDataContents": ["graph"] };
				}

				var qlist_query = [query];
				var new_queries = [];
				var task_flag = false;
				neo4jAPI.executeQueries(qlist_query, function (status_code, result) {
					if (status_code != 200) {
						res.status(status_code).send(result);
					} else {
						try {
							var res_data = result;
							if (res_data[0].data.length != 0 && res_data[0].data[0]['graph']['nodes'] != null) {
								var task = '';
								var task_relation = '';
								if (res_data[0].data[0]['graph']['nodes'][0].labels[0] == 'TASKS') {
									task = res_data[0].data[0]['graph']['nodes'][0];
									task_relation = res_data[0].data[0]['graph']['nodes'][1];
								}
								else {
									task = res_data[0].data[0]['graph']['nodes'][1];
									task_relation = res_data[0].data[0]['graph']['nodes'][0];
								}
								var neo_taskHistory = task.taskHistory;
								if ((status == 'inprogress' || status == 'assigned' || status == 'reassigned') && task.reviewer != 'select reviewer') {
									taskHistory.status = 'review';
									if (neo_taskHistory == undefined || neo_taskHistory == '') {
										neo_taskHistory = [taskHistory];
									} else {
										neo_taskHistory = JSON.parse(neo_taskHistory);
										neo_taskHistory.push(taskHistory);
									}
									neo_taskHistory = JSON.stringify(neo_taskHistory);
									query = { 'statement': "MATCH (n:TASKS) WHERE n.taskID in " + taskID + " and n.assignedTo='" + userId + "' set n.task_owner=n.assignedTo,n.assignedTo=n.reviewer,n.status='review',n.taskHistory='" + neo_taskHistory + "' RETURN n" };
									new_queries.push(query);
									task_flag = true;

								} else if (status == 'review') {
									taskHistory.status = 'complete';
									if (neo_taskHistory == undefined || neo_taskHistory == '') {
										neo_taskHistory = [taskHistory];
									} else {
										neo_taskHistory = JSON.parse(neo_taskHistory)
										neo_taskHistory.push(taskHistory);
									}
									neo_taskHistory = JSON.stringify(neo_taskHistory);
									query = { 'statement': "MATCH (m)-[r]-(n:TASKS) WHERE n.taskID in " + taskID + " and n.reviewer='" + userId + "' set n.assignedTo='',n.status='complete',n.taskHistory='" + neo_taskHistory + "' DELETE r RETURN n" };
									new_queries.push(query);
									task_flag = true;
								} else if (status == 'reassign') {
									taskHistory.status = 'reassigned';
									if (neo_taskHistory == undefined || neo_taskHistory == '') {
										neo_taskHistory = [taskHistory];
									} else {
										neo_taskHistory = JSON.parse(neo_taskHistory);
										neo_taskHistory.push(taskHistory);
									}
									neo_taskHistory = JSON.stringify(neo_taskHistory);
									query = { 'statement': "MATCH (n:TASKS) WHERE n.taskID in " + taskID + " and n.reviewer='" + userId + "' set n.reviewer=n.assignedTo,n.assignedTo=n.task_owner,n.status='reassigned',n.taskHistory='" + neo_taskHistory + "' RETURN n" };
									new_queries.push(query);
									task_flag = true;
								}
								if (task_flag) {
									neo4jAPI.executeQueries(new_queries, function (status, result) {
										if (status != 200) res.status(status).send(result);
										else res.status(200).send('success');

									});
								} else {
									res.status(200).send('fail');
								}
							}
							else {
								res.status(200).send('fail');
							}
						} catch (ex) {
							logger.error("exception in mindmapService: ", ex);
							res.status(200).send('fail');
						}
					}
				});
			}
			else res.status(err.status).send(err.res);
		});
	}
	else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
};

// function getRenameQueries(map, prjId) {
// 	var rnmQList = [];
// 	map.forEach(function (e, i) {
// 		if (e.renamed) {
// 			if (e.type == 'scenarios') {
// 				rnmQList.push({ "statement": "MATCH(n:TESTSCENARIOS{testScenarioName:'" + e.orig_name + "',projectID:'" + prjId + "'})<-[r:FMTTS]-(m) SET n.testScenarioName='" + e.name + "'" });
// 			}
// 			if (e.type == 'screens') {
// 				rnmQList.push({ "statement": "MATCH(n:SCREENS{screenName:'" + e.orig_name + "',projectID:'" + prjId + "'}) SET n.screenName='" + e.name + "'" });
// 			}
// 			if (e.type == 'testcases') {
// 				rnmQList.push({ 'statement': 'Match (n:TESTCASES{testCaseName : "' + e.orig_name + '",projectID :"' + prjId + '"})<-[a:FSTTS]-(scr:SCREENS{screenName:"' + e.screenname + '"})  SET n.testCaseName="' + e.name + '"' });
// 			}
// 		}
// 	});
// 	return rnmQList;
// }

exports.saveData = function (req, res) {
	logger.info("Inside UI service: saveData");
	if (utils.isSessionActive(req)) {
		var tasks = [];
		var nameDict = {};
		var nData = [], qList = [], idDict = {};
		var urlData = req.get('host').split(':');
		var inputs = req.body;
		var data = inputs.map;
		var tab = inputs.tab;
		var assignedAt = inputs.UtcTime;
		var selectedTab = inputs.selectedTab;
		var prjId = inputs.prjId;
		var deletednodes = inputs.deletednode;
		var user = req.session.username;
		var userrole = req.session.activeRole;
		var userid = req.session.user_id;
		var userroleid = req.session.role;
		var flag = inputs.write;
		var removeTask = inputs.unassignTask;
		var sendNotify = inputs.sendNotify;
		var relId = inputs.relId;
		var cycId = inputs.cycId;
		var idxDict = [];
		//Assigned Tasks Notification
		var assignedObj = {};
		for (var k = 0; k < data.length; k++) {
			var task = data[k].task;
			if (task != null) {
				if ('assignedToName' in task) {
					var assignedTo = task.assignedToName;
					if (assignedTo != null && assignedTo != undefined) {
						if ('tstatus' in task) {
							assignedObj[task.details] = assignedTo;
						}
					}
				}
			}
		}
		var notify = assignedObj;
		if (Object.keys(notify).length > 0 && Object.keys(notify).length != undefined) {
			var assignedToValues = Object.keys(notify).map(function (key) { return notify[key] });
			for (var i = 0; i < assignedToValues.length; i++) {
				if (Object.keys(myserver.socketMapNotify).indexOf(assignedToValues[i]) > -1) {
					var keys = Object.keys(notify);
					for (var j = 0; j < keys.length; j++) {
						if (i == j) {
							var tName = keys[j];
							var taskAssignment = 'assigned';
							var taskName = tName;
							var soc = myserver.socketMapNotify[assignedToValues[i]];
							var count = 0;
							var assignedTasksNotification = {};
							assignedTasksNotification.to = '/plugin';
							if (removeTask.length > 0) {
								for (var p = 0; p < removeTask.length; p++) {
									for (var q = 0; q < data.length; q++) {
										if (removeTask[p] == data[q].oid) {
											taskAssignment = "unassigned";
										}
										if (taskAssignment == "unassigned") {
											assignedTasksNotification.notifyMsg = "Task '" + taskName + "' have been unassigned by " + user + "";
										}
										assignedTasksNotification.isRead = false;
										assignedTasksNotification.count = count;
										soc.emit("notify", assignedTasksNotification);
									}
								}
							}

							if (taskAssignment == "assigned") {
								assignedTasksNotification.notifyMsg = "New task '" + taskName + "' have been assigned by " + user + "";
								assignedTasksNotification.isRead = false;
								assignedTasksNotification.count = count;
								soc.emit("notify", assignedTasksNotification);
							}
						}
					}
				}
			}
		}
		// This flag is for Save. Save and Create will now be merged.
		if (flag == 10) 
		{
			qpush=[]
			// This query is not needed
		// 	qpush.push({ "statement": "MATCH(n:MODULES_ENDTOEND{projectID:'" + prjId + "',moduleName:'" + data[0].name + "'}) RETURN n.moduleName" });
		// 	neo4jAPI.executeQueries(qpush, function (status, result){
		// 	if (result[0].data.length != 0){
		// 		result = 'DuplicateModules';
		// 		status = 500
		// 		res.status(status).send(result);
		// 	}
		// 	else{
		// 		var uidx = 0, t, lts, rnmList = [];
		// 		deletednodes.forEach(function (t, i) {
		// 			// My comments:  If the testcase is reused then only we will delete the associated task.Task parent list will have testcase id and I have to delete that task. Hard delete.
		// 			// Delete task if single connection
		// 			qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]->(b) with b as b MATCH(b)<-[s:FNTT]-(M) WITH count(M) as rel_cnt,b as b  WHERE rel_cnt=1 DETACH DELETE b" });
		// 			// Else delete just connection					
		// 			qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]-(b) DELETE r" });
		// 			// delete nodes in case renamed a reused node
		// 			qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " DETACH DELETE N" });
		// 		});
		// 		//TO support task deletion
		// 		removeTask.forEach(function (t, i) {
		// 			//Issue 1685 Release and cycle Id filters are given for task to delete the task only from that release and cycle attached to that node
		// 			qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]-(b:TASKS{release:'" + relId + "',cycle:'" + cycId + "'}) DETACH DELETE b" });
		// 		});

		// 		data.forEach(function (e, i) {
		// 			idxDict[e.id] = i;
		// 		})

		// 		data.forEach(function (e, i) {
		// 			idDict[e.id] = (e.id_n) ? e.id_n : uuidV4();
		// 			e.id = idDict[e.id];
		// 			t = e.task;
		// 			nameDict[e.id] = e.name;
		// 			var taskstatus = 'assigned';
		// 			if (e.type == 'modules') {
		// 				if (e.oid != null) {
		// 					if (e.renamed) qList.push({ "statement": "MATCH(n:MODULES{moduleID:'" + e.id + "'}) SET n.moduleName='" + e.name + "'" + ",n.unique_property='[" + e.name + ',' + prjId + "]'" });
		// 				}
		// 				else qList.push({ "statement": "MERGE(n:MODULES{projectID:'" + prjId + "',moduleName:'" + e.name + "',moduleID:'" + e.id + "',createdBy:'" + user + "',createdOn:'null',moduleID_c:'" + e.id_c + "',unique_property:'[" + e.name + ',' + prjId + "]'}) SET n.childIndex='" + e.childIndex + "'" });
		// 				}
		// 				else if (e.type == 'scenarios') {
		// 					//Part of Issue 1685, take projectid from the scenarios in case of end to end modules
		// 					var temp_prjID = prjId;

		// 				// if (tab=='end_to_end'){
		// 				// 	temp_prjID=e.projectID;
		// 				// }
		// 				if (e.state == 'created') {
		// 					qList.push({ "statement": "MERGE(n:TESTSCENARIOS{projectID:'" + temp_prjID + "',moduleID:'" + idDict[e.pid] + "',testScenarioName:'" + e.name + "',testScenarioID:'" + e.id + "',createdBy:'" + user + "',createdOn:'null',testScenarioID_c:'" + e.id_c + "'}) SET n.childIndex='" + e.childIndex + "'" });
		// 					qList.push({ "statement": "MATCH (a:MODULES{moduleID:'" + idDict[e.pid] + "'}),(b:TESTSCENARIOS{moduleID:'" + idDict[e.pid] + "'}) MERGE (a)-[r:FMTTS {id:'" + idDict[e.pid] + "'}]-(b)" });
		// 				}
		// 				}
		// 				else if (e.type == 'screens') {
		// 					uidx++; lts = idDict[e.pid];
		// 					if (e.state == 'created') {
		// 						qList.push({ "statement": "MERGE(n:SCREENS{projectID:'" + prjId + "',testScenarioID:'" + idDict[e.pid] + "',screenName:'" + e.name + "',screenID:'" + e.id + "',createdBy:'" + user + "',createdOn:'null',uid:'" + uidx + "',screenID_c:'" + e.id_c + "'})SET n.childIndex='" + e.childIndex + "'" });
		// 						qList.push({ "statement": "MATCH (a:TESTSCENARIOS{testScenarioID:'" + idDict[e.pid] + "'}),(b:SCREENS{testScenarioID:'" + idDict[e.pid] + "'}) MERGE (a)-[r:FTSTS {id:'" + idDict[e.pid] + "'}]-(b)" });
		// 					}
		// 				}
		// 				else if (e.type == 'testcases' && e.state == 'created') {
		// 					if (e.pid_c != 'null' && e.pid_c != undefined) {
		// 						qList.push({ "statement": "MERGE(n:TESTCASES{screenID:'" + idDict[e.pid] + "',screenName:'" + nameDict[idDict[e.pid]] + "',projectID:'" + prjId + "',testScenarioID:'" + lts + "',testCaseName:'" + e.name + "',testCaseID:'" + e.id + "',createdBy:'" + user + "',createdOn:'null',uid:'" + uidx + "',testCaseID_c:'" + e.id_c + "'}) SET n.screenID_c='" + e.pid_c + "',n.childIndex='" + e.childIndex + "'" });
		// 					} else {
		// 						qList.push({ "statement": "MERGE(n:TESTCASES{screenID:'" + idDict[e.pid] + "',screenName:'" + nameDict[idDict[e.pid]] + "',projectID:'" + prjId + "',testScenarioID:'" + lts + "',testCaseName:'" + e.name + "',testCaseID:'" + e.id + "',createdBy:'" + user + "',createdOn:'null',uid:'" + uidx + "',testCaseID_c:'" + e.id_c + "'}) SET n.childIndex='" + e.childIndex + "'" });
		// 					}
		// 					qList.push({ "statement": "MATCH (a:SCREENS{screenID:'" + idDict[e.pid] + "'}),(b:TESTCASES{screenID:'" + idDict[e.pid] + "'}) MERGE (a)-[r:FSTTS {id:'" + idDict[e.pid] + "'}]-(b)" });
		// 				}
		// 			});
		// 		rnmList = getRenameQueries(data, prjId);
		// 		data.forEach(function (e, i) {
		// 			var nodetype = { 'modules': 'moduleID', 'modules_endtoend': 'moduleID', 'scenarios': 'testScenarioID', 'screens': 'screenID', 'testcases': 'testCaseID' }
		// 			var ntype = e.type.toUpperCase();
		// 			if (ntype == 'SCENARIOS') ntype = 'TESTSCENARIOS';
		// 			if (e.cidxch) {
		// 				qList.push({ "statement": "MATCH (n:" + ntype + "{" + nodetype[e.type.toLowerCase()] + ":'" + e.id + "'}) SET n.childIndex='" + e.childIndex + "'" });
		// 			}
		// 		})
		// 		// if(tab!='end_to_end'){
		// 		qList.push({ "statement": "MATCH (a) remove a.uid" });
		// 		qList = qList.concat(rnmList);
		// 		qList.push({ "statement": "MATCH path=(n:MODULES{moduleID:'" + data[0].id + "'}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
		// 		qList.push({ "statement": "MATCH path=(n:MODULES{moduleID:'" + data[0].id + "'})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });
		// 		neo4jAPI.executeQueries(qList, function (status, result) {
		// 			if (status != 200) {
		// 				//res.setHeader('Content-Type', 'text');
		// 				logger.debug(result[0]);
		// 				logger.error('Error occurred in saveData Query');
		// 				result = JSON.stringify(result)
		// 				if (result.indexOf('Schema.ConstraintValidationFailed') > -1) {
		// 					result = 'DuplicateModules';
		// 				} else {
		// 					result = 'fail';
		// 				}
		// 				res.status(status).send(result);
		// 				}
		// 				else {
		// 					res.setHeader('Content-Type', 'application/json');
		// 					var k = 0, rIndex, lbl, neoIdDict = {};
		// 					idDict = {};

		// 					var attrDict = { "modules_endtoend": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "modules": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "scenarios": { "projectID": "projectID", "childIndex": "childIndex", "moduleID": "pid_n", "testScenarioName": "name", "testScenarioID": "id_n", "testScenarioID_c": "id_c" }, "screens": { "projectID": "projectID", "childIndex": "childIndex", "testScenarioID": "pid_n", "screenName": "name", "screenID": "id_n", "screenID_c": "id_c", "taskexists": "taskexists" }, "testcases": { "projectID": "projectID", "childIndex": "childIndex", "screenID": "pid_n", "testCaseName": "name", "testCaseID": "id_n", "testCaseID_c": "id_c", "taskexists": "taskexists" }, "tasks": { "taskID": "id_n", "task": "t", "batchName": "bn", "assignedTo": "at", "reviewer": "rw", "startDate": "sd", "endDate": "ed", "re_estimation": "re_estimation", "release": "re", "cycle": "cy", "details": "det", "nodeID": "pid", "parent": "anc", "cx": "cx" } };
		// 					var jsonData = result;

		// 					var new_res = jsonData[jsonData.length - 1].data;
		// 					if (new_res.length == 0) {
		// 						new_res = jsonData[jsonData.length - 2].data;
		// 					}
		// 					new_res.forEach(function (row) {
		// 						row.graph.nodes.forEach(function (n) {
		// 							if (idDict[n.id] === undefined) {
		// 								lbl = n.labels[0].toLowerCase();
		// 								if (lbl == 'testscenarios') lbl = 'scenarios';
		// 								for (var attrs in n.properties) {
		// 									if (attrDict[lbl][attrs] !== undefined) n[attrDict[lbl][attrs]] = n.properties[attrs];
		// 									delete n.properties[attrs];
		// 								}
		// 								if (lbl == "tasks") nData.push({ id: n.id_n, oid: n.id, task: n.t, batchName: n.bn, assignedTo: n.at, reviewer: n.rw, startDate: n.sd, endDate: n.ed, re_estimation: n.re_estimation, release: n.re, cycle: n.cy, details: n.det, nodeID: n.pid, parent: n.anc.slice(1, -1).split(','), cx: n.cx });
		// 								else {
		// 									if (lbl == "modules" || lbl == "modules_endtoend") n.childIndex = 0;
		// 									nData.push({ projectID: n.projectID, childIndex: n.childIndex, id: n.id, "type": lbl, name: n.name, id_n: n.id_n, pid_n: n.pid_n, id_c: n.id_c, children: [], task: null });
		// 								}
		// 								if (lbl == "modules" || lbl == "modules_endtoend") rIndex = k;
		// 								idDict[n.id] = k; neoIdDict[n.id_n] = k;
		// 								k++;
		// 							}
		// 						});
		// 						row.graph.relationships.forEach(function (r) {
		// 							var srcIndex = idDict[r.startNode.toString()];
		// 							var tgtIndex = idDict[r.endNode.toString()];
		// 							//if(nData[tgtIndex].children===undefined) nData[srcIndex].task=nData[tgtIndex];
		// 							//Part of Issue 1685, after saving of data proper task should be written since multiple tasks are conencte dto single node
		// 							if (nData[tgtIndex].children === undefined) {
		// 								if ((selectedTab == 'tabAssign' && nData[tgtIndex].release == relId && nData[tgtIndex].cycle == cycId) || tab == 'tabCreate' || tab == 'endToend') {
		// 									nData[srcIndex].task = nData[tgtIndex];
		// 								} else if (nData[srcIndex].type == 'testcases' || nData[srcIndex].type == 'screens') {
		// 									nData[srcIndex].taskexists = nData[tgtIndex];
		// 								}

		// 							}
		// 							else if (nData[srcIndex].children.indexOf(nData[tgtIndex]) == -1) {
		// 								nData[srcIndex].children.push(nData[tgtIndex]);
		// 								if (nData[tgtIndex].childIndex == undefined) nData[tgtIndex].childIndex = nData[srcIndex].children.length;
		// 							}
		// 						});
		// 					});
		// 					nData.forEach(function (e) {
		// 						if (e.pid_n) {
		// 							if (neoIdDict[e.pid_n] !== undefined) e.pid_n = nData[neoIdDict[e.pid_n]].id;
		// 							else e.pid_n = null;
		// 						}
		// 					});
		// 					res.status(status).send(nData[rIndex]);
		// 				}
		// 			});
		// 	}
		// });
		// }
		// else if (flag == 20) {
			var uidx = 0, rIndex;
			var idn_v_idc = {};
			// var relId=inputs.relId;
			var cycId=inputs.cycId;

			// Creating the data for running the Create Structure Query
			var qObj = { "projectid": prjId, "cycleId": cycId, "appType": "Web", "testsuiteDetails": [], "userName": user, "userRole": userrole,"userid":userid,"roleid":userroleid };
			var nObj = [], tsList = [];
			data.forEach(function (e, i) {
				if (e.type == "modules") rIndex = uidx;
				if (e.task != null) delete e.task.oid;
				idn_v_idc[e.id_n] = e.id_c;
				nObj.push({ _id:e._id||null, name: e.name,state: e.state||"here", task: e.task, children: [] });
				if (e.type == "testcases") nObj[nObj.length - 1]['pid_c'] = e._id||null;
				if (idDict[e.pid] !== undefined) nObj[idDict[e.pid]].children.push(nObj[uidx]);
				idDict[e.id] = uidx++;
			});
			nObj[rIndex].children.forEach(function (ts, i) {
				var sList = [];
				ts.children.forEach(function (s, i) {
					var tcList = [];
					s.children.forEach(function (tc, i) {
						tcList.push({ "screenid": s._id||null, "testcaseid": tc._id||null, "testcaseName": tc.name, "task": tc.task,"state":tc.state });
					});
					sList.push({ "screenid": s._id||null, "screenName": s.name, "task": s.task, "testcaseDetails": tcList,"state":s.state });
				});
				tsList.push({ "testscenarioid": ts._id||null, "testscenarioName": ts.name, "tasks": ts.task, "screenDetails": sList,"state":ts.state });
			});
			qObj.testsuiteDetails = [{ "testsuiteId": nObj[rIndex]._id||null, "testsuiteName": nObj[rIndex].name, "task": nObj[rIndex].task, "testscenarioDetails": tsList,"state":nObj[rIndex].state}];

			
			create_ice.saveMindmap(qObj, function (err, data) {
				if (err) {
					res.status(500).send(err);
				} else {
					console.log(data);
					res.status(200).send(data);
					// var module_type = 'modules';
					// var parsing_result = update_cassandraID(data, urlData, module_type, idn_v_idc);
					// neo4jAPI.executeQueries(parsing_result[0], function (status, result) {
					// 	if (status != 200) res.status(status).send(result);
					// 	else res.status(200).send(parsing_result[1]);
					// });
				}
			});
		}
		else if (flag == 30) { 
			//Assign
			
			// removeTask.forEach(function (t, i) {
			// 	// n68session.tasks.delete({"_id":ObjectId(requestdata["taskid"]),"cycle":ObjectId(requestdata["cycleid"])})
			// 	//Issue 1685 Release and cycle Id filters are given for task to delete the task only from that release and cycle attached to that node
			// 	qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]-(b:TASKS{release:'" + relId + "',cycle:'" + cycId + "'}) DETACH DELETE b" });
			// });
			// data.forEach(function (e, i) {
			// 	idxDict[e.id] = i;
			// })
			var tasks_insert=[];
			var tasks_update=[];
			data.forEach(function (e, i) {
				idDict[e._id] = (e._id) || null;
				e._id = idDict[e._id];
				t = e.task;
				var tsk={}
				if (e.type == 'endtoend') {
					if (t != null && e._id != null && (t.tstatus == 'created' || t.tstatus == 'updated')) {
						tsk.tasktype=t.task
						tsk.nodetype="testsuites"
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycle=t.cycle
						tsk.parent=""
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startDate
						tsk.enddate=t.endDate
						tsk.assignedto=t.assignedTo
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedTo
						tsk.batchname=t.batchName
						tsk.status=t.tstatus
						tsk.details=t.details
						tsk.reestimation=t.re_estimation
						tsk.complexity=""
						tsk.history=[]
						tsk.id=t.oid
						if (tsk.id!=null){
							tasks_update.push(tsk)
						}
						else{
							tasks_insert.push(tsk)
						}
					}
				}
				else if (e.type == 'modules') {
					if (t != null && e._id != null && (t.tstatus == 'created' || t.tstatus == 'updated')) {
						tsk.tasktype=t.task
						tsk.nodetype="testsuites"
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycle=t.cycle
						tsk.parent=""
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startDate
						tsk.enddate=t.endDate
						tsk.assignedto=t.assignedTo
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedTo
						tsk.batchname=t.batchName
						tsk.status=t.tstatus
						tsk.details=t.details
						tsk.reestimation=t.re_estimation
						tsk.complexity=""
						tsk.history=[]
						tsk.id=t.oid
						if (tsk.id!=null){
							tasks_update.push(tsk)
						}
						else{
							tasks_insert.push(tsk)
						}
					}
					tasks.push(tsk)
				}
				else if (e.type == 'scenarios') {
					//Part of Issue 1685, take projectid from the scenarios in case of end to end modules
					if (t != null && e._id != null && (t.tstatus == 'created' || t.tstatus == 'updated')) {
						tsk.tasktype="Execute"
						tsk.nodetype="testscenarios"
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycle=t.cycle
						tsk.parent=t.parent
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startDate
						tsk.enddate=t.endDate
						tsk.assignedto=t.assignedTo
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedTo
						tsk.batchname=""
						tsk.status=t.tstatus
						tsk.details=t.details
						tsk.reestimation=t.re_estimation
						tsk.complexity=""
						tsk.history=[]
						tsk.id=t.oid
						if (tsk.id!=null){
							tasks_update.push(tsk)
						}
						else{
							tasks_insert.push(tsk)
						}
					}
				}
				else if (e.type == 'screens') {
					uidx++; lts = idDict[e.pid];

					if (t != null && e._id != null && (t.tstatus == 'created' || t.tstatus == 'updated')) {
						tsk.tasktype=t.task
						tsk.nodetype=e.type
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycle=t.cycle
						tsk.parent=prjId
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startDate
						tsk.enddate=t.endDate
						tsk.assignedto=t.assignedTo
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedTo
						tsk.batchname=""
						tsk.status=t.tstatus
						tsk.details=t.details
						tsk.reestimation=t.re_estimation
						tsk.complexity=""
						tsk.history=[]
						tsk.id=t.oid
						if (tsk.id != null) {
							if (cycId == t.cycle) {
								tasks_update.push(tsk)
								// if (t.updatedParent != undefined) {
								// 	qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]'}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.status='" + taskstatus + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.uid='" + uidx + "',n.parent='[" + [prjId].concat(t.updatedParent) + "]',n.cx='" + t.cx + "'" });
								// } else {
								// 	qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]'}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.status='" + taskstatus + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.uid='" + uidx + "',n.cx='" + t.cx + "'" });
								// }
							}

						}
						else if (!t.copied) {
							// If reused 
							// t.parent = [prjId].concat(t.parent);
							tasks_insert.push(tsk)
							// qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',reviewer:'" + t.reviewer + "',status:'" + taskstatus + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',release:'" + t.release + "',cycle:'" + t.cycle + "',re_estimation:'" + t.re_estimation + "',details:'" + t.details + "',parent:'[" + t.parent + "]',uid:'" + uidx + "',cx:'" + t.cx + "'})" });
						}
						// qList.push({ "statement": "MATCH (a:SCREENS{screenID_c:'" + e.id_c + "'}),(b:TASKS{taskID:'" + t.id + "'}) MERGE (a)-[r:FNTT {id:a.screenID}]-(b)" });
					}
				}
				else if (e.type == 'testcases') {
					var screenid_c = 'null';

					if (t != null && e.id != null && (t.tstatus == 'created' || t.tstatus == 'updated')) {
						tsk.tasktype=t.task
						tsk.nodetype=e.type
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycle=t.cycle
						tsk.parent=t.parent
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startDate
						tsk.enddate=t.endDate
						tsk.assignedto=t.assignedTo
						tsk.reviewer=t.reviewer
						tsk.owner=null
						tsk.batchname=""
						tsk.status=t.tstatus
						tsk.details=t.details
						tsk.reestimation=t.re_estimation
						tsk.complexity=""
						tsk.history=[]
						tsk.id=t.oid
						if (tsk.id != null) {
							if (cycId == t.cycle) {
								tasks_update.push(tsk)
								// if (t.updatedParent != undefined) {
								// 	qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]'}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.status='" + taskstatus + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.uid='" + uidx + "',n.parent='[" + [prjId].concat(t.updatedParent) + "]',n.cx='" + t.cx + "'" });
								// } else {
								// 	qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]'}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.status='" + taskstatus + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.uid='" + uidx + "',n.cx='" + t.cx + "'" });
								// }
							}

						}
						else if (!t.copied) {
							// If reused 
							// t.parent = [prjId].concat(t.parent);
							tasks_insert.push(tsk)
							// qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',reviewer:'" + t.reviewer + "',status:'" + taskstatus + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',release:'" + t.release + "',cycle:'" + t.cycle + "',re_estimation:'" + t.re_estimation + "',details:'" + t.details + "',parent:'[" + t.parent + "]',uid:'" + uidx + "',cx:'" + t.cx + "'})" });
						}
						// qList.push({ "statement": "MATCH (a:SCREENS{screenID_c:'" + e.id_c + "'}),(b:TASKS{taskID:'" + t.id + "'}) MERGE (a)-[r:FNTT {id:a.screenID}]-(b)" });
					}
				}
			});
			var inputs={
				"update": tasks_update,
				"insert": tasks_insert,
				"action": "modify"
			}
			var args={
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			}
			logger.info("Calling NDAC Service from newProjectDetails : admin/createProject_ICE");
			client.post("http://127.0.0.1:1991/mindmap/manageTaskDetails", args,
				function (data, response) {
					if (response.statusCode != 200 || data.rows == "fail") {
						logger.error("Error occurred in mindmap/manageTaskDetails from newProjectDetails Error Code : ERRNDAC");
						res.send("fail");
					} else {
						res.send(result.rows);
					}
			});
			// if (tab != 'end_to_end') {
			// 	qList.push({ "statement": "MATCH (a) remove a.uid" });
			// 	//qList=qList.concat(rnmList);
			// 	qList.push({ "statement": "MATCH path=(n:MODULES{moduleID:'" + data[0].id + "'}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
			// 	qList.push({ "statement": "MATCH path=(n:MODULES{moduleID:'" + data[0].id + "'})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });
			// } else {
			// 	qList.push({ "statement": "MATCH (a) remove a.uid" });
			// 	//qList=qList.concat(rnmList);
			// 	qList.push({ "statement": "MATCH path=(n:MODULES_ENDTOEND{moduleID:'" + data[0].id + "'}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
			// 	qList.push({ "statement": "MATCH path=(n:MODULES_ENDTOEND{moduleID:'" + data[0].id + "'})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });
			// }
		}
	} else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
}

// exports.saveData = function (req, res) {
// 	logger.info("Inside UI service: saveData");
// 	if (utils.isSessionActive(req)) {
// 		var tasks = [];
// 		var nameDict = {};
// 		var nData = [], qList = [], idDict = {};
// 		var urlData = req.get('host').split(':');
// 		var inputs = req.body;
// 		var data = inputs.map;
// 		var tab = inputs.tab;
// 		var assignedAt = inputs.UtcTime;
// 		var selectedTab = inputs.selectedTab;
// 		var prjId = inputs.prjId;
// 		var deletednodes = inputs.deletednode;
// 		var user = req.session.username;
// 		var userrole = req.session.activeRole;
// 		var flag = inputs.write;
// 		var removeTask = inputs.unassignTask;
// 		var sendNotify = inputs.sendNotify;
// 		var relId = inputs.relId;
// 		var cycId = inputs.cycId;
// 		var idxDict = [];
// 		//Assigned Tasks Notification
// 		var assignedObj = {};
// 		for (var k = 0; k < data.length; k++) {
// 			var task = data[k].task;
// 			if (task != null) {
// 				if ('assignedToName' in task) {
// 					var assignedTo = task.assignedToName;
// 					if (assignedTo != null && assignedTo != undefined) {
// 						if ('tstatus' in task) {
// 							assignedObj[task.details] = assignedTo;
// 						}
// 					}
// 				}
// 			}
// 		}
// 		var notify = assignedObj;
// 		if (Object.keys(notify).length > 0 && Object.keys(notify).length != undefined) {
// 			var assignedToValues = Object.keys(notify).map(function (key) { return notify[key] });
// 			for (var i = 0; i < assignedToValues.length; i++) {
// 				if (Object.keys(myserver.socketMapNotify).indexOf(assignedToValues[i]) > -1) {
// 					var keys = Object.keys(notify);
// 					for (var j = 0; j < keys.length; j++) {
// 						if (i == j) {
// 							var tName = keys[j];
// 							var taskAssignment = 'assigned';
// 							var taskName = tName;
// 							var soc = myserver.socketMapNotify[assignedToValues[i]];
// 							var count = 0;
// 							var assignedTasksNotification = {};
// 							assignedTasksNotification.to = '/plugin';
// 							if (removeTask.length > 0) {
// 								for (var p = 0; p < removeTask.length; p++) {
// 									for (var q = 0; q < data.length; q++) {
// 										if (removeTask[p] == data[q].oid) {
// 											taskAssignment = "unassigned";
// 										}
// 										if (taskAssignment == "unassigned") {
// 											assignedTasksNotification.notifyMsg = "Task '" + taskName + "' have been unassigned by " + user + "";
// 										}
// 										assignedTasksNotification.isRead = false;
// 										assignedTasksNotification.count = count;
// 										soc.emit("notify", assignedTasksNotification);
// 									}
// 								}
// 							}

// 							if (taskAssignment == "assigned") {
// 								assignedTasksNotification.notifyMsg = "New task '" + taskName + "' have been assigned by " + user + "";
// 								assignedTasksNotification.isRead = false;
// 								assignedTasksNotification.count = count;
// 								soc.emit("notify", assignedTasksNotification);
// 							}
// 						}
// 					}
// 				}
// 			}
// 		}
// 		// This flag is for Save. Save and Create will now be merged.
// 		if (flag == 10) 
// 		{
// 			qpush=[]
// 			// This query is not needed
// 			qpush.push({ "statement": "MATCH(n:MODULES_ENDTOEND{projectID:'" + prjId + "',moduleName:'" + data[0].name + "'}) RETURN n.moduleName" });
// 			neo4jAPI.executeQueries(qpush, function (status, result){
// 			if (result[0].data.length != 0){
// 				result = 'DuplicateModules';
// 				status = 500
// 				res.status(status).send(result);
// 			}
// 			else{
// 				var uidx = 0, t, lts, rnmList = [];
// 				deletednodes.forEach(function (t, i) {
// 					// My comments:  If the testcase is reused then only we will delete the associated task.Task parent list will have testcase id and I have to delete that task. Hard delete.
// 					// Delete task if single connection
// 					qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]->(b) with b as b MATCH(b)<-[s:FNTT]-(M) WITH count(M) as rel_cnt,b as b  WHERE rel_cnt=1 DETACH DELETE b" });
// 					// Else delete just connection					
// 					qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]-(b) DELETE r" });
// 					// delete nodes in case renamed a reused node
// 					qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " DETACH DELETE N" });
// 				});
// 				//TO support task deletion
// 				removeTask.forEach(function (t, i) {
// 					//Issue 1685 Release and cycle Id filters are given for task to delete the task only from that release and cycle attached to that node
// 					qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]-(b:TASKS{release:'" + relId + "',cycle:'" + cycId + "'}) DETACH DELETE b" });
// 				});

// 				data.forEach(function (e, i) {
// 					idxDict[e.id] = i;
// 				})

// 				data.forEach(function (e, i) {
// 					idDict[e.id] = (e.id_n) ? e.id_n : uuidV4();
// 					e.id = idDict[e.id];
// 					t = e.task;
// 					nameDict[e.id] = e.name;
// 					var taskstatus = 'assigned';
// 					if (e.type == 'modules') {
// 						if (e.oid != null) {
// 							if (e.renamed) qList.push({ "statement": "MATCH(n:MODULES{moduleID:'" + e.id + "'}) SET n.moduleName='" + e.name + "'" + ",n.unique_property='[" + e.name + ',' + prjId + "]'" });
// 						}
// 						else qList.push({ "statement": "MERGE(n:MODULES{projectID:'" + prjId + "',moduleName:'" + e.name + "',moduleID:'" + e.id + "',createdBy:'" + user + "',createdOn:'null',moduleID_c:'" + e.id_c + "',unique_property:'[" + e.name + ',' + prjId + "]'}) SET n.childIndex='" + e.childIndex + "'" });
// 						}
// 						else if (e.type == 'scenarios') {
// 							//Part of Issue 1685, take projectid from the scenarios in case of end to end modules
// 							var temp_prjID = prjId;

// 						// if (tab=='end_to_end'){
// 						// 	temp_prjID=e.projectID;
// 						// }
// 						if (e.state == 'created') {
// 							qList.push({ "statement": "MERGE(n:TESTSCENARIOS{projectID:'" + temp_prjID + "',moduleID:'" + idDict[e.pid] + "',testScenarioName:'" + e.name + "',testScenarioID:'" + e.id + "',createdBy:'" + user + "',createdOn:'null',testScenarioID_c:'" + e.id_c + "'}) SET n.childIndex='" + e.childIndex + "'" });
// 							qList.push({ "statement": "MATCH (a:MODULES{moduleID:'" + idDict[e.pid] + "'}),(b:TESTSCENARIOS{moduleID:'" + idDict[e.pid] + "'}) MERGE (a)-[r:FMTTS {id:'" + idDict[e.pid] + "'}]-(b)" });
// 						}
// 						}
// 						else if (e.type == 'screens') {
// 							uidx++; lts = idDict[e.pid];
// 							if (e.state == 'created') {
// 								qList.push({ "statement": "MERGE(n:SCREENS{projectID:'" + prjId + "',testScenarioID:'" + idDict[e.pid] + "',screenName:'" + e.name + "',screenID:'" + e.id + "',createdBy:'" + user + "',createdOn:'null',uid:'" + uidx + "',screenID_c:'" + e.id_c + "'})SET n.childIndex='" + e.childIndex + "'" });
// 								qList.push({ "statement": "MATCH (a:TESTSCENARIOS{testScenarioID:'" + idDict[e.pid] + "'}),(b:SCREENS{testScenarioID:'" + idDict[e.pid] + "'}) MERGE (a)-[r:FTSTS {id:'" + idDict[e.pid] + "'}]-(b)" });
// 							}
// 						}
// 						else if (e.type == 'testcases' && e.state == 'created') {
// 							if (e.pid_c != 'null' && e.pid_c != undefined) {
// 								qList.push({ "statement": "MERGE(n:TESTCASES{screenID:'" + idDict[e.pid] + "',screenName:'" + nameDict[idDict[e.pid]] + "',projectID:'" + prjId + "',testScenarioID:'" + lts + "',testCaseName:'" + e.name + "',testCaseID:'" + e.id + "',createdBy:'" + user + "',createdOn:'null',uid:'" + uidx + "',testCaseID_c:'" + e.id_c + "'}) SET n.screenID_c='" + e.pid_c + "',n.childIndex='" + e.childIndex + "'" });
// 							} else {
// 								qList.push({ "statement": "MERGE(n:TESTCASES{screenID:'" + idDict[e.pid] + "',screenName:'" + nameDict[idDict[e.pid]] + "',projectID:'" + prjId + "',testScenarioID:'" + lts + "',testCaseName:'" + e.name + "',testCaseID:'" + e.id + "',createdBy:'" + user + "',createdOn:'null',uid:'" + uidx + "',testCaseID_c:'" + e.id_c + "'}) SET n.childIndex='" + e.childIndex + "'" });
// 							}
// 							qList.push({ "statement": "MATCH (a:SCREENS{screenID:'" + idDict[e.pid] + "'}),(b:TESTCASES{screenID:'" + idDict[e.pid] + "'}) MERGE (a)-[r:FSTTS {id:'" + idDict[e.pid] + "'}]-(b)" });
// 						}
// 					});
// 				rnmList = getRenameQueries(data, prjId);
// 				data.forEach(function (e, i) {
// 					var nodetype = { 'modules': 'moduleID', 'modules_endtoend': 'moduleID', 'scenarios': 'testScenarioID', 'screens': 'screenID', 'testcases': 'testCaseID' }
// 					var ntype = e.type.toUpperCase();
// 					if (ntype == 'SCENARIOS') ntype = 'TESTSCENARIOS';
// 					if (e.cidxch) {
// 						qList.push({ "statement": "MATCH (n:" + ntype + "{" + nodetype[e.type.toLowerCase()] + ":'" + e.id + "'}) SET n.childIndex='" + e.childIndex + "'" });
// 					}
// 				})
// 				// if(tab!='end_to_end'){
// 				qList.push({ "statement": "MATCH (a) remove a.uid" });
// 				qList = qList.concat(rnmList);
// 				qList.push({ "statement": "MATCH path=(n:MODULES{moduleID:'" + data[0].id + "'}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
// 				qList.push({ "statement": "MATCH path=(n:MODULES{moduleID:'" + data[0].id + "'})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });
// 				neo4jAPI.executeQueries(qList, function (status, result) {
// 					if (status != 200) {
// 						//res.setHeader('Content-Type', 'text');
// 						logger.debug(result[0]);
// 						logger.error('Error occurred in saveData Query');
// 						result = JSON.stringify(result)
// 						if (result.indexOf('Schema.ConstraintValidationFailed') > -1) {
// 							result = 'DuplicateModules';
// 						} else {
// 							result = 'fail';
// 						}
// 						res.status(status).send(result);
// 						}
// 						else {
// 							res.setHeader('Content-Type', 'application/json');
// 							var k = 0, rIndex, lbl, neoIdDict = {};
// 							idDict = {};

// 							var attrDict = { "modules_endtoend": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "modules": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "scenarios": { "projectID": "projectID", "childIndex": "childIndex", "moduleID": "pid_n", "testScenarioName": "name", "testScenarioID": "id_n", "testScenarioID_c": "id_c" }, "screens": { "projectID": "projectID", "childIndex": "childIndex", "testScenarioID": "pid_n", "screenName": "name", "screenID": "id_n", "screenID_c": "id_c", "taskexists": "taskexists" }, "testcases": { "projectID": "projectID", "childIndex": "childIndex", "screenID": "pid_n", "testCaseName": "name", "testCaseID": "id_n", "testCaseID_c": "id_c", "taskexists": "taskexists" }, "tasks": { "taskID": "id_n", "task": "t", "batchName": "bn", "assignedTo": "at", "reviewer": "rw", "startDate": "sd", "endDate": "ed", "re_estimation": "re_estimation", "release": "re", "cycle": "cy", "details": "det", "nodeID": "pid", "parent": "anc", "cx": "cx" } };
// 							var jsonData = result;

// 							var new_res = jsonData[jsonData.length - 1].data;
// 							if (new_res.length == 0) {
// 								new_res = jsonData[jsonData.length - 2].data;
// 							}
// 							new_res.forEach(function (row) {
// 								row.graph.nodes.forEach(function (n) {
// 									if (idDict[n.id] === undefined) {
// 										lbl = n.labels[0].toLowerCase();
// 										if (lbl == 'testscenarios') lbl = 'scenarios';
// 										for (var attrs in n.properties) {
// 											if (attrDict[lbl][attrs] !== undefined) n[attrDict[lbl][attrs]] = n.properties[attrs];
// 											delete n.properties[attrs];
// 										}
// 										if (lbl == "tasks") nData.push({ id: n.id_n, oid: n.id, task: n.t, batchName: n.bn, assignedTo: n.at, reviewer: n.rw, startDate: n.sd, endDate: n.ed, re_estimation: n.re_estimation, release: n.re, cycle: n.cy, details: n.det, nodeID: n.pid, parent: n.anc.slice(1, -1).split(','), cx: n.cx });
// 										else {
// 											if (lbl == "modules" || lbl == "modules_endtoend") n.childIndex = 0;
// 											nData.push({ projectID: n.projectID, childIndex: n.childIndex, id: n.id, "type": lbl, name: n.name, id_n: n.id_n, pid_n: n.pid_n, id_c: n.id_c, children: [], task: null });
// 										}
// 										if (lbl == "modules" || lbl == "modules_endtoend") rIndex = k;
// 										idDict[n.id] = k; neoIdDict[n.id_n] = k;
// 										k++;
// 									}
// 								});
// 								row.graph.relationships.forEach(function (r) {
// 									var srcIndex = idDict[r.startNode.toString()];
// 									var tgtIndex = idDict[r.endNode.toString()];
// 									//if(nData[tgtIndex].children===undefined) nData[srcIndex].task=nData[tgtIndex];
// 									//Part of Issue 1685, after saving of data proper task should be written since multiple tasks are conencte dto single node
// 									if (nData[tgtIndex].children === undefined) {
// 										if ((selectedTab == 'tabAssign' && nData[tgtIndex].release == relId && nData[tgtIndex].cycle == cycId) || tab == 'tabCreate' || tab == 'endToend') {
// 											nData[srcIndex].task = nData[tgtIndex];
// 										} else if (nData[srcIndex].type == 'testcases' || nData[srcIndex].type == 'screens') {
// 											nData[srcIndex].taskexists = nData[tgtIndex];
// 										}

// 									}
// 									else if (nData[srcIndex].children.indexOf(nData[tgtIndex]) == -1) {
// 										nData[srcIndex].children.push(nData[tgtIndex]);
// 										if (nData[tgtIndex].childIndex == undefined) nData[tgtIndex].childIndex = nData[srcIndex].children.length;
// 									}
// 								});
// 							});
// 							nData.forEach(function (e) {
// 								if (e.pid_n) {
// 									if (neoIdDict[e.pid_n] !== undefined) e.pid_n = nData[neoIdDict[e.pid_n]].id;
// 									else e.pid_n = null;
// 								}
// 							});
// 							res.status(status).send(nData[rIndex]);
// 						}
// 					});
// 			}
// 		});
// 		// }
// 		// else if (flag == 20) {
// 			var uidx = 0, rIndex;
// 			var idn_v_idc = {};
// 			// var relId=inputs.relId;
// 			// var cycId=inputs.cycId;

// 			// Creating the data for running the Create Structure Query
// 			var qObj = { "projectId": prjId, "releaseId": relId, "cycleId": cycId, "appType": "Web", "testsuiteDetails": [], "userName": user, "userRole": userrole };
// 			var nObj = [], tsList = [];
// 			data.forEach(function (e, i) {
// 				if (e.type == "modules") rIndex = uidx;
// 				if (e.task != null) delete e.task.oid;
// 				idn_v_idc[e.id_n] = e.id_c;
// 				nObj.push({ id: e.id_n, id_c: e.id_c, name: e.name, task: e.task, children: [] });
// 				if (e.type == "testcases") nObj[nObj.length - 1]['pid_c'] = e.pid_c;
// 				if (idDict[e.pid] !== undefined) nObj[idDict[e.pid]].children.push(nObj[uidx]);
// 				idDict[e.id] = uidx++;
// 			});
// 			nObj[rIndex].children.forEach(function (ts, i) {
// 				var sList = [];
// 				ts.children.forEach(function (s, i) {
// 					var tcList = [];
// 					s.children.forEach(function (tc, i) {
// 						tcList.push({ "screenID_c": tc.pid_c, "testcaseId": tc.id, "testcaseId_c": tc.id_c, "testcaseName": tc.name, "task": tc.task });
// 					});
// 					sList.push({ "screenId": s.id, "screenId_c": s.id_c, "screenName": s.name, "task": s.task, "testcaseDetails": tcList });
// 				});
// 				tsList.push({ "testscenarioId": ts.id, "testscenarioId_c": ts.id_c, "testscenarioName": ts.name, "tasks": ts.task, "screenDetails": sList });
// 			});
// 			qObj.testsuiteDetails = [{ "testsuiteId": nObj[rIndex].id, "testsuiteId_c": nObj[rIndex].id_c, "testsuiteName": nObj[rIndex].name, "task": nObj[rIndex].task, "testscenarioDetails": tsList }];

			
// 			create_ice.createStructure_Nineteen68(qObj, function (err, data) {
// 				if (err) {
// 					res.status(500).send(err);
// 				} else {
// 					var module_type = 'modules';
// 					var parsing_result = update_cassandraID(data, urlData, module_type, idn_v_idc);
// 					neo4jAPI.executeQueries(parsing_result[0], function (status, result) {
// 						if (status != 200) res.status(status).send(result);
// 						else res.status(200).send(parsing_result[1]);
// 					});
// 				}
// 			});
// 		}
// 		else if (flag == 30) {  //Assign task
// 			removeTask.forEach(function (t, i) {
// 				//Issue 1685 Release and cycle Id filters are given for task to delete the task only from that release and cycle attached to that node
// 				qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]-(b:TASKS{release:'" + relId + "',cycle:'" + cycId + "'}) DETACH DELETE b" });
// 			});
// 			data.forEach(function (e, i) {
// 				idxDict[e.id] = i;
// 			})

// 			data.forEach(function (e, i) {
// 				idDict[e.id] = (e.id_n) ? e.id_n : uuidV4();
// 				e.id = idDict[e.id];
// 				t = e.task;
// 				if ((e.taskexists || e.task) && (e.type == 'screens' || e.type == 'testcases')) {
// 					if (e.task == null) {
// 						t = e.taskexists;
// 					} else if (e.taskexists) {
// 						t.id = e.taskexists.id;
// 						t.oid = e.taskexists.oid;
// 						t.parent = e.taskexists.parent;
// 						//To fix issue 1685, not to update the task details unless the details comes from original release and cycle
// 						t.release = e.taskexists.release;
// 						t.cycle = e.taskexists.cycle;
// 					}
// 				}
// 				nameDict[e.id] = e.name;
// 				var taskstatus = 'assigned';
// 				if (e.type == 'modules_endtoend') {
// 					if (t != null && e.id_c != null && (t.tstatus == 'created' || t.tstatus == 'updated')) {
// 						t.parent = [prjId].concat(e.id_c);
// 						t.id = (t.id != null) ? t.id : uuidV4();
// 						if (t.oid != null) {
// 							//Part of Issue 1685, before relID and cycId from create tab was undefined
// 							if (t.updatedParent != undefined) {
// 								qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]',release:'" + t.release + "',cycle:'" + t.cycle + "'}) SET n.task='" + t.task + "',n.assignedTime='"+ assignedAt +"',n.batchName='" + t.batchName + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.status='" + taskstatus + "',n.parent='[" + [prjId].concat(t.updatedParent) + "]'" });
// 							} else {
// 								qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]',release:'" + t.release + "',cycle:'" + t.cycle + "'}) SET n.task='" + t.task + "',n.assignedTime='"+ assignedAt +"',n.batchName='" + t.batchName + "',n.status='" + taskstatus + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "'" });
// 							}
// 						}
// 						else qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',batchName:'" + t.batchName + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',assignedTime:'" + assignedAt + "',status:'" + taskstatus + "',reviewer:'" + t.reviewer + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',re_estimation:'" + t.re_estimation + "',release:'" + relId + "',cycle:'" + cycId + "',details:'" + t.details + "',parent:'[" + t.parent + "]'})" });
// 						qList.push({ "statement": "MATCH (a:MODULES_ENDTOEND{moduleID:'" + e.id + "'}),(b:TASKS{taskID:'" + t.id + "'}) MERGE (a)-[r:FNTT {id:'" + e.id + "'}]-(b)" });
// 					}
// 				}
// 				else if (e.type == 'modules') {
// 					if (t != null && e.id_c != null && (t.tstatus == 'created' || t.tstatus == 'updated')) {
// 						t.parent = [prjId].concat(e.id_c);
// 						t.id = (t.id != null) ? t.id : uuidV4();

// 						if (t.oid != null) {
// 							//Part of Issue 1685, before relID and cycId from create tab was undefined
// 							if (t.updatedParent != undefined) {
// 								qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]',release:'" + t.release + "',cycle:'" + t.cycle + "'}) SET n.task='" + t.task + "',n.assignedTime='"+ assignedAt +"',n.batchName='" + t.batchName + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.status='" + taskstatus + "',n.parent='[" + [prjId].concat(t.updatedParent) + "]'" });
// 							} else {
// 								qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]',release:'" + t.release + "',cycle:'" + t.cycle + "'}) SET n.task='" + t.task + "',n.assignedTime='"+ assignedAt +"',n.batchName='" + t.batchName + "',n.status='" + taskstatus + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "'" });
// 							}
// 						}
// 						else qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',batchName:'" + t.batchName + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',assignedTime:'" + assignedAt + "',status:'" + taskstatus + "',reviewer:'" + t.reviewer + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',re_estimation:'" + t.re_estimation + "',release:'" + relId + "',cycle:'" + cycId + "',details:'" + t.details + "',parent:'[" + t.parent + "]'})" });
// 						qList.push({ "statement": "MATCH (a:MODULES{moduleID:'" + e.id + "'}),(b:TASKS{taskID:'" + t.id + "'}) MERGE (a)-[r:FNTT {id:'" + e.id + "'}]-(b)" });
// 					}
// 				}
// 				else if (e.type == 'scenarios') {
// 					//Part of Issue 1685, take projectid from the scenarios in case of end to end modules
// 					var temp_prjID = prjId;

// 					if (tab == 'end_to_end') {
// 						temp_prjID = e.projectID;
// 					}

// 					//Supporting task assignment for scenarios
// 					if (t != null && e.id_c != null && (t.tstatus == 'created' || t.tstatus == 'updated')) {
// 						t.parent = [temp_prjID].concat(e.pid_c, e.id_c);
// 						t.id = (t.id != null) ? t.id : uuidV4();
// 						if (t.oid != null) {
// 							if (t.updatedParent != undefined) {
// 								qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]',release:'" + t.release + "',cycle:'" + t.cycle + "'}) SET n.task='" + t.task + "',n.status='" + taskstatus + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.parent='[" + [temp_prjID].concat(t.updatedParent) + "]',n.cx='" + t.cx + "'" });
// 							} else {
// 								qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]',release:'" + t.release + "',cycle:'" + t.cycle + "'}) SET n.task='" + t.task + "',n.status='" + taskstatus + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.cx='" + t.cx + "'" });
// 							}
// 						}
// 						else qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',reviewer:'" + t.reviewer + "',status:'" + taskstatus + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',re_estimation:'" + t.re_estimation + "',release:'" + relId + "',cycle:'" + cycId + "',details:'" + t.details + "',parent:'[" + t.parent + "]',cx:'" + t.cx + "'})" });
// 						qList.push({ "statement": "MATCH (a:TESTSCENARIOS{projectID:'" + temp_prjID + "',testScenarioName:'" + e.name + "',testScenarioID:'" + e.id + "'}),(b:TASKS{taskID:'" + t.id + "'}) MERGE (a)-[r:FNTT {id:a.testScenarioID}]-(b)" });
// 					}
// 					if (tab != 'end_to_end') {
// 						qList.push({ "statement": "MATCH (m:MODULES)-[mt]-(c:TESTSCENARIOS{projectID:'" + temp_prjID + "',testScenarioName:'" + e.name + "',testScenarioID:'" + e.id + "'}) ,(a:TASKS) where not c.testScenarioID_c='null' and a.parent=~('.*'+m.moduleID_c+','+c.testScenarioID_c+']') MERGE (c)-[rel:FNTT {id:c.testScenarioID}]-(a)" });
// 					}
// 					else {
// 						qList.push({ "statement": "MATCH (m:MODULES_ENDTOEND)-[mt]-(c:TESTSCENARIOS{projectID:'" + temp_prjID + "',testScenarioName:'" + e.name + "',testScenarioID:'" + e.id + "'}) ,(a:TASKS) where not c.testScenarioID_c='null' and a.parent=~('.*'+m.moduleID_c+','+c.testScenarioID_c+']') MERGE (c)-[rel:FNTT {id:c.testScenarioID}]-(a)" });
// 					}
// 					//else if(e.id_n==null){ // In case added first time to end to end then connect to all task if exist

// 					//}						
// 					//qList.push({"statement":"MATCH(n:TESTSCENARIOS{testScenarioID:'"+e.id+"'}) SET n.testScenarioName='"+e.name+"'"+",n.projectID='"+prjId+"'"});

// 				}
// 				else if (e.type == 'screens') {
// 					uidx++; lts = idDict[e.pid];

// 					if (t != null && e.id_c != null && (t.tstatus == 'created' || t.tstatus == 'updated')) {
// 						t.id = (t.id != null) ? t.id : uuidV4();
// 						if (t.oid != null) {
// 							//Part of Issue 1685
// 							if (relId == t.release && cycId == t.cycle) {
// 								if (t.updatedParent != undefined) {
// 									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]'}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.status='" + taskstatus + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.uid='" + uidx + "',n.parent='[" + [prjId].concat(t.updatedParent) + "]',n.cx='" + t.cx + "'" });
// 								} else {
// 									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]'}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.status='" + taskstatus + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.uid='" + uidx + "',n.cx='" + t.cx + "'" });
// 								}
// 							}

// 						}
// 						else if (!t.copied) {
// 							// If reused 
// 							t.parent = [prjId].concat(t.parent);
// 							qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',reviewer:'" + t.reviewer + "',status:'" + taskstatus + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',release:'" + t.release + "',cycle:'" + t.cycle + "',re_estimation:'" + t.re_estimation + "',details:'" + t.details + "',parent:'[" + t.parent + "]',uid:'" + uidx + "',cx:'" + t.cx + "'})" });
// 						}
// 						qList.push({ "statement": "MATCH (a:SCREENS{screenID_c:'" + e.id_c + "'}),(b:TASKS{taskID:'" + t.id + "'}) MERGE (a)-[r:FNTT {id:a.screenID}]-(b)" });
// 					}
// 				}
// 				else if (e.type == 'testcases') {
// 					var screenid_c = 'null';

// 					if (t != null && e.id_c != null && (t.tstatus == 'created' || t.tstatus == 'updated')) {
// 						t.id = (t.id != null) ? t.id : uuidV4();
// 						//var parent=[prjId].concat(t.parent);
// 						if (t.oid != null) {
// 							//Part of Issue 1685
// 							if (relId == t.release && cycId == t.cycle) {
// 								if (t.updatedParent != undefined) {
// 									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]'}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.status='" + taskstatus + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.uid='" + uidx + "',n.parent='[" + [prjId].concat(t.updatedParent) + "]',n.cx='" + t.cx + "'" });
// 								} else {
// 									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]'}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.status='" + taskstatus + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.uid='" + uidx + "',n.cx='" + t.cx + "'" });
// 								}
// 							}
// 						}
// 						else if (!t.copied) {
// 							t.parent = [prjId].concat(t.parent);
// 							qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',status:'" + taskstatus + "',reviewer:'" + t.reviewer + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',release:'" + t.release + "',cycle:'" + t.cycle + "',re_estimation:'" + t.re_estimation + "',details:'" + t.details + "',parent:'[" + t.parent + "]',uid:'" + uidx + "',cx:'" + t.cx + "'})" });
// 						}
// 						//In case of reuse
// 						qList.push({ "statement": "MATCH (a:TESTCASES{testCaseID_c:'" + e.id_c + "'}),(b:TASKS{taskID:'" + t.id + "'}) MERGE (a)-[r:FNTT {id:a.testCaseID}]-(b)" });
// 					}
// 				}
// 			});
// 			if (tab != 'end_to_end') {
// 				qList.push({ "statement": "MATCH (a) remove a.uid" });
// 				//qList=qList.concat(rnmList);
// 				qList.push({ "statement": "MATCH path=(n:MODULES{moduleID:'" + data[0].id + "'}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
// 				qList.push({ "statement": "MATCH path=(n:MODULES{moduleID:'" + data[0].id + "'})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });
// 			} else {
// 				qList.push({ "statement": "MATCH (a) remove a.uid" });
// 				//qList=qList.concat(rnmList);
// 				qList.push({ "statement": "MATCH path=(n:MODULES_ENDTOEND{moduleID:'" + data[0].id + "'}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
// 				qList.push({ "statement": "MATCH path=(n:MODULES_ENDTOEND{moduleID:'" + data[0].id + "'})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });
// 			}

// 			neo4jAPI.executeQueries(qList, function (status, result) {
// 				if (status != 200) {
// 					//res.setHeader('Content-Type', 'text');
// 					logger.debug(result[0]);
// 					logger.error('Error occurred in saveData Query');
// 					result = JSON.stringify(result)
// 					if (result.indexOf('Schema.ConstraintValidationFailed') > -1) {
// 						result = 'DuplicateModules';
// 					} else {
// 						result = 'fail';
// 					}
// 					res.status(status).send(result);
// 				}
// 				else {
// 					res.setHeader('Content-Type', 'application/json');
// 					var k = 0, rIndex, lbl, neoIdDict = {};
// 					idDict = {};

// 					var attrDict = { "modules_endtoend": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "modules": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "scenarios": { "projectID": "projectID", "childIndex": "childIndex", "moduleID": "pid_n", "testScenarioName": "name", "testScenarioID": "id_n", "testScenarioID_c": "id_c" }, "screens": { "projectID": "projectID", "childIndex": "childIndex", "testScenarioID": "pid_n", "screenName": "name", "screenID": "id_n", "screenID_c": "id_c", "taskexists": "taskexists" }, "testcases": { "projectID": "projectID", "childIndex": "childIndex", "screenID": "pid_n", "testCaseName": "name", "testCaseID": "id_n", "testCaseID_c": "id_c", "taskexists": "taskexists" }, "tasks": { "taskID": "id_n", "task": "t", "batchName": "bn", "assignedTo": "at", "reviewer": "rw", "startDate": "sd", "endDate": "ed", "re_estimation": "re_estimation", "release": "re", "cycle": "cy", "details": "det", "nodeID": "pid", "parent": "anc", "cx": "cx" } };
// 					var jsonData = result;

// 					var new_res = jsonData[jsonData.length - 1].data;
// 					if (new_res.length == 0) {
// 						new_res = jsonData[jsonData.length - 2].data;
// 					}
// 					new_res.forEach(function (row) {
// 						row.graph.nodes.forEach(function (n) {
// 							if (idDict[n.id] === undefined) {
// 								lbl = n.labels[0].toLowerCase();
// 								if (lbl == 'testscenarios') lbl = 'scenarios';
// 								for (var attrs in n.properties) {
// 									if (attrDict[lbl][attrs] !== undefined) n[attrDict[lbl][attrs]] = n.properties[attrs];
// 									delete n.properties[attrs];
// 								}
// 								if (lbl == "tasks") nData.push({ id: n.id_n, oid: n.id, task: n.t, batchName: n.bn, assignedTo: n.at, reviewer: n.rw, startDate: n.sd, endDate: n.ed, re_estimation: n.re_estimation, release: n.re, cycle: n.cy, details: n.det, nodeID: n.pid, parent: n.anc.slice(1, -1).split(','), cx: n.cx });
// 								else {
// 									if (lbl == "modules" || lbl == "modules_endtoend") n.childIndex = 0;
// 									nData.push({ projectID: n.projectID, childIndex: n.childIndex, id: n.id, "type": lbl, name: n.name, id_n: n.id_n, pid_n: n.pid_n, id_c: n.id_c, children: [], task: null });
// 								}
// 								if (lbl == "modules" || lbl == "modules_endtoend") rIndex = k;
// 								idDict[n.id] = k; neoIdDict[n.id_n] = k;
// 								k++;
// 							}
// 						});
// 						row.graph.relationships.forEach(function (r) {
// 							var srcIndex = idDict[r.startNode.toString()];
// 							var tgtIndex = idDict[r.endNode.toString()];
// 							//if(nData[tgtIndex].children===undefined) nData[srcIndex].task=nData[tgtIndex];
// 							//Part of Issue 1685, after saving of data proper task should be written since multiple tasks are conencte dto single node
// 							if (nData[tgtIndex].children === undefined) {
// 								if ((selectedTab == 'tabAssign' && nData[tgtIndex].release == relId && nData[tgtIndex].cycle == cycId) || tab == 'tabCreate' || tab == 'endToend') {
// 									nData[srcIndex].task = nData[tgtIndex];
// 								} else if (nData[srcIndex].type == 'testcases' || nData[srcIndex].type == 'screens') {
// 									nData[srcIndex].taskexists = nData[tgtIndex];
// 								}

// 							}
// 							else if (nData[srcIndex].children.indexOf(nData[tgtIndex]) == -1) {
// 								nData[srcIndex].children.push(nData[tgtIndex]);
// 								if (nData[tgtIndex].childIndex == undefined) nData[tgtIndex].childIndex = nData[srcIndex].children.length;

// 							}
// 						});
// 					});
// 					nData.forEach(function (e) {
// 						if (e.pid_n) {
// 							if (neoIdDict[e.pid_n] !== undefined) e.pid_n = nData[neoIdDict[e.pid_n]].id;
// 							else e.pid_n = null;
// 						}
// 					});
// 					res.status(status).send(nData[rIndex]);
// 				}
// 			});
// 		}
// 	} else {
// 		logger.error("Invalid Session");
// 		res.send("Invalid Session");
// 	}
// }

exports.saveEndtoEndData = function (req, res) {
	logger.info("Inside UI service: saveEndtoEndData");
	if (utils.isSessionActive(req)) {
		var nData = [], qList = [], idDict = {};
		var urlData = req.get('host').split(':');
		var inputs = req.body;
		var data = inputs.map;
		var prjId = inputs.prjId;
		var deletednodes = inputs.deletednode;
		var user = req.session.username;
		var userrole = req.session.activeRole;
		var flag = inputs.write;
		var relId = inputs.relId;
		var cycId = inputs.cycId;
		//TO support task deletion
		var removeTask = inputs.unassignTask;
		if (flag == 10) {
			qpush=[]
			qpush.push({ "statement": "MATCH(n:MODULES{projectID:'" + data[0].projectID + "',moduleName:'" + data[0].name + "'}) RETURN n.moduleName" });
			neo4jAPI.executeQueries(qpush, function (status, result){
			if (result[0].data.length != 0){
				status= 500
				error_msg = 'DuplicateModules';
				res.status(status).send(error_msg);
			}
			else{		
				var uidx = 0, t, lts, rnmList = [];
				deletednodes.forEach(function (t, i) {
					// Delete task if single connection
					qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]->(b) with b as b MATCH(b)<-[s:FNTT]-(M) WITH count(M) as rel_cnt,b as b  WHERE rel_cnt=1 DETACH DELETE b" });
					// Else delete just connection					
					qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]-(b) DELETE r" });
				});
				//TO support task deletion
				removeTask.forEach(function (t, i) {
					qList.push({ "statement": "MATCH (N) WHERE ID(N)=" + t + " MATCH (N)-[r:FNTT]-(b) DETACH DELETE b" });
				});

				data.forEach(function (e, i) {
					idDict[e.id] = (e.id_n) ? e.id_n : uuidV4();
					e.id = idDict[e.id];
					t = e.task;
					var taskstatus = 'assigned';
					if (e.type == 'modules_endtoend') {
						if (e.oid != null) {
							qList.push({ "statement": "MATCH (n)-[r:FMTTS{id:'" + e.id + "'}]->(o:TESTSCENARIOS) DETACH DELETE r,o;" });
							if (e.renamed) qList.push({ "statement": "MATCH(n:MODULES_ENDTOEND{moduleID:'" + e.id + "'}) SET n.moduleName='" + e.name + "'" + ",n.unique_property='[" + e.name + ',' + e.projectID + "]'" });
						}
						else qList.push({ "statement": "MERGE(n:MODULES_ENDTOEND{projectID:'" + e.projectID + "',moduleName:'" + e.name + "',moduleID:'" + e.id + "',createdBy:'" + user + "',createdOn:'null',moduleID_c:'" + e.id_c + "',unique_property:'[" + e.name + ',' + e.projectID + "]'}) SET n.childIndex='" + e.childIndex + "'" });
						if (t != null && e.id_c != null) {
							t.parent = [prjId].concat(e.id_c);
							t.id = (t.id != null) ? t.id : uuidV4();
							if (t.oid != null) {
								if (t.updatedParent != undefined) {
									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]',release:'" + t.release + "',cycle:'" + t.cycle + "'}) SET n.task='" + t.task + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + ",n.status='" + taskstatus + "',n.parent='[" + [prjId].concat(t.updatedParent) + "]'" });
								} else {
									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]',release:'" + t.release + "',cycle:'" + t.cycle + "'}) SET n.task='" + t.task + "',n.status='" + taskstatus + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "'" });
								}
							}
							else qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',status:'" + taskstatus + "',reviewer:'" + t.reviewer + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',re_estimation:'" + t.re_estimation + "',release:'" + relId + "',cycle:'" + cycId + "',details:'" + t.details + "',parent:'[" + t.parent + "]'})" });
						}
					}
					else if (e.type == 'scenarios') {
						if (e.renamed && e.id_n) rnmList.push({ "statement": "MATCH(n:TESTSCENARIOS{testScenarioID:'" + e.id + "'}) SET n.testScenarioName='" + e.name + "'" + ",n.projectID='" + prjId + "'" });
						qList.push({ "statement": "MERGE(n:TESTSCENARIOS{projectID:'" + e.projectID + "',moduleID:'" + idDict[e.pid] + "',testScenarioName:'" + e.name + "',testScenarioID:'" + e.id + "',createdBy:'" + user + "',createdOn:'null',testScenarioID_c:'" + e.id_c + "'}) SET n.childIndex='" + e.childIndex + "'" });
						//Scenario query-------yashi
						//Relating scenario with moduleId
						//Yashi
						qList.push({ "statement": "MATCH (a:MODULES_ENDTOEND{moduleID:'" + idDict[e.pid] + "'}),(b:TESTSCENARIOS{moduleID:'" + idDict[e.pid] + "'}) MERGE (a)-[r:FMTTS {id:'" + idDict[e.pid] + "'}]-(b)" });
						//Supporting task assignmnet for scenarios
						if (t != null && e.id_c != null) {
							t.parent = [prjId].concat(e.pid_c, e.id_c);
							t.id = (t.id != null) ? t.id : uuidV4();
							if (t.oid != null) {
								if (t.updatedParent != undefined) {
									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]',release:'" + relId + "',cycle:'" + cycId + "'}) SET n.task='" + t.task + "',n.status='" + taskstatus + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "',n.parent='[" + [prjId].concat(t.updatedParent) + "]'" });
								} else {
									qList.push({ "statement": "MATCH(n:TASKS{taskID:'" + t.id + "',parent:'[" + t.parent + "]',release:'" + relId + "',cycle:'" + cycId + "'}) SET n.task='" + t.task + "',n.status='" + taskstatus + "',n.assignedTo='" + t.assignedTo + "',n.reviewer='" + t.reviewer + "',n.startDate='" + t.startDate + "',n.endDate='" + t.endDate + "',n.re_estimation='" + t.re_estimation + "',n.details='" + t.details + "'" });
								}
							}
							else qList.push({ "statement": "MERGE(n:TASKS{taskID:'" + t.id + "',task:'" + t.task + "',assignedTo:'" + t.assignedTo + "',reviewer:'" + t.reviewer + "',status:'" + taskstatus + "',startDate:'" + t.startDate + "',endDate:'" + t.endDate + "',re_estimation:'" + t.re_estimation + "',release:'" + relId + "',cycle:'" + cycId + "',details:'" + t.details + "',parent:'[" + t.parent + "]'})" });
							qList.push({ "statement": "MATCH (a:TESTSCENARIOS{projectID:'" + e.projectID + "',testScenarioName:'" + e.name + "'}),(b:TASKS{taskID:'" + t.id + "'}) MERGE (a)-[r:FNTT {id:a.testScenarioID}]-(b)" });
						}
						qList.push({ "statement": "MATCH (m:MODULES_ENDTOEND)-[mt]-(c:TESTSCENARIOS{projectID:'" + prjId + "',testScenarioName:'" + e.name + "',testScenarioID:'" + e.id + "'}) ,(a:TASKS) where not c.testScenarioID_c='null' and a.parent=~('.*'+m.moduleID_c+','+c.testScenarioID_c+']') MERGE (c)-[rel:FNTT {id:c.testScenarioID}]-(a)" });
						// else if(e.id_n==null){ // In case added first time to end to end then connect to all task if exist
						// 	qList.push({"statement":"MATCH (a:TASKS)<-[r]-(b:TESTSCENARIOS{projectID:'"+prjId+"',testScenarioName:'"+e.name+"'}),(c:TESTSCENARIOS{projectID:'"+e.projectID+"',testScenarioName:'"+e.name+"'}) MERGE (c)-[rel:FNTT {id:c.testScenarioID}]-(a)"});							
						// }
					}
				});

				qList.push({ "statement": "MATCH (a) remove a.uid" });
				qList = qList.concat(rnmList);
				qList.push({ "statement": "MATCH path=(n:MODULES_ENDTOEND{moduleID:'" + data[0].id + "'}) WHERE NOT (n)-[:FMTTS]->() RETURN n", "resultDataContents": ["graph"] });
				qList.push({ "statement": "MATCH path=(n:MODULES_ENDTOEND{moduleID:'" + data[0].id + "'})-[r*1..]->(t) RETURN path", "resultDataContents": ["graph"] });

				neo4jAPI.executeQueries(qList, function (status, result) {
					if (status != 200) {
						var error_msg = 'Fail';
						result = JSON.stringify(result)
						if (result.indexOf('Schema.ConstraintValidationFailed') > -1) {
							error_msg = 'DuplicateModules';
						}
						res.status(status).send(error_msg);
					} else {
						res.setHeader('Content-Type', 'application/json');
						var k = 0, rIndex, lbl, neoIdDict = {};
						idDict = {};
						var attrDict = { "modules_endtoend": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "modules": { "childIndex": "childIndex", "projectID": "projectID", "moduleName": "name", "moduleID": "id_n", "moduleID_c": "id_c" }, "scenarios": { "projectID": "projectID", "childIndex": "childIndex", "moduleID": "pid_n", "testScenarioName": "name", "testScenarioID": "id_n", "testScenarioID_c": "id_c" }, "screens": { "projectID": "projectID", "childIndex": "childIndex", "testScenarioID": "pid_n", "screenName": "name", "screenID": "id_n", "screenID_c": "id_c", "taskexists": "taskexists" }, "testcases": { "projectID": "projectID", "childIndex": "childIndex", "screenID": "pid_n", "testCaseName": "name", "testCaseID": "id_n", "testCaseID_c": "id_c", "taskexists": "taskexists" }, "tasks": { "taskID": "id_n", "task": "t", "batchName": "bn", "assignedTo": "at", "reviewer": "rw", "startDate": "sd", "endDate": "ed", "re_estimation": "re_estimation", "release": "re", "cycle": "cy", "details": "det", "nodeID": "pid", "parent": "anc", "cx": "cx" } };
						var jsonData = result;
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
									if (lbl == "tasks") nData.push({ id: n.id_n, oid: n.id, task: n.t, assignedTo: n.at, reviewer: n.rw, startDate: n.sd, endDate: n.ed, re_estimation: n.re_estimation, release: n.re, cycle: n.cy, details: n.det, nodeID: n.pid, parent: n.anc.slice(1, -1).split(',') });
									else {
										if (lbl == "modules_endtoend") n.childIndex = 0;
										nData.push({ projectID: n.projectID, childIndex: n.childIndex, id: n.id, "type": lbl, name: n.name, id_n: n.id_n, pid_n: n.pid_n, id_c: n.id_c, children: [], task: null });
									}
									if (lbl == "modules_endtoend") rIndex = k;
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
						res.status(status).send(nData[rIndex]);
					}
				});
			}
		});
		} else if (flag == 20) {
			var uidx = 0, rIndex;
			var vn_from = inputs.vn_from;
			var vn_to = inputs.vn_from;
			var qObj = { "projectId": prjId, "testsuiteDetails": [], "userName": user, "userRole": userrole, "from_version": parseFloat(vn_from), "new_version": vn_to };
			var nObj = [], tsList = [];
			data.forEach(function (e, i) {
				if (e.type == "modules_endtoend") rIndex = uidx;
				if (e.task != null) delete e.task.oid;
				nObj.push({ projectID: e.projectID, id: e.id_n, id_c: e.id_c, name: e.name, task: e.task, children: [] });
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
				tsList.push({ "projectID": ts.projectID, "testscenarioId": ts.id, "testscenarioId_c": ts.id_c, "testscenarioName": ts.name, "tasks": ts.task, "screenDetails": sList });
			});
			qObj.testsuiteDetails = [{ "projectID": nObj[rIndex].projectID, "testsuiteId": nObj[rIndex].id, "testsuiteId_c": nObj[rIndex].id_c, "testsuiteName": nObj[rIndex].name, "task": nObj[rIndex].task, "testscenarioDetails": tsList }];

			create_ice.createE2E_Structure_Nineteen68(qObj, function (err, data) {
				if (err) {
					logger.error(err);
					res.status(500).send('Fail');
				} else {
					var module_type = 'modules_endtoend';
					var parsing_result = update_cassandraID(data, urlData, module_type);
					neo4jAPI.executeQueries(parsing_result[0], function (status, result) {
						if (status != 200) res.status(status).send(result);
						else res.status(200).send(parsing_result[1]);
					});
				}
			});
		}
	} else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
};

// function getQueries(qdata) {
// 	// This function is making queries for checking the reuse in Neo4j currently. Have to shift these to MongoDB.
// 	var qList_reuse = [];
// 	if (qdata.gettestcases) {	//for a reused screen fetches all the testcases
// 		qList_reuse.push({ 'statement': 'Match (n:SCREENS{screenName :"' + qdata.screen[0].screenname + '",projectID :"' + qdata['projectid'] + '"})-[r]-(m:TESTCASES) return distinct collect(ID(m))' });
// 	}
// 	else {
// 		// Currently we are not using versioning so ignore this
// 		if (qdata.versionNumber != undefined) {
// 			//Reuse in case of versioning
// 			if (qdata.scenarios != undefined) {
// 				qdata['scenarios'].forEach(function (e, i) {
// 					qList_reuse.push({ 'statement': 'Match (n:TESTSCENARIOS{testScenarioName : "' + e.scenarioname + '",projectID :"' + qdata['projectid'] + '"})<-[s:FMTTS]-(m:MODULES)<-[t:FVTM]-(v:VERSION{versionNumber:' + qdata['versionNumber'] + '}) return count(n),m.moduleName' });
// 				})
// 			} else {
// 				qdata['screen'].forEach(function (e, i) {
// 					qList_reuse.push({ 'statement': 'Match (n:SCREENS{screenName : "' + e.screenname + '",projectID :"' + qdata['projectid'] + '"})<-[r:FTSTS]-(ts:TESTSCENARIOS)<-[s:FMTTS]-(m:MODULES)<-[t:FVTM]-(v:VERSION{versionNumber:' + qdata['versionNumber'] + '}) return count(n)' });
// 				})
// 				qdata['testcase'].forEach(function (e, i) {
// 					qList_reuse.push({ 'statement': 'Match (n:TESTCASES{testCaseName : "' + e.testcasename + '",projectID :"' + qdata['projectid'] + '"})<-[a:FSTTS]-(scr:SCREENS{screenName:"' + e.screenname + '"})<-[r:FTSTS]-(ts:TESTSCENARIOS)<-[s:FMTTS]-(m:MODULES)<-[t:FVTM]-(v:VERSION{versionNumber:' + qdata['versionNumber'] + '}) return collect(ID(n))' });
// 				})
// 			}

// 		}
// 		else {
// 			if (qdata.scenarios != undefined) {
// 				qdata['scenarios'].forEach(function (e, i) {
// 					qList_reuse.push({ 'statement': 'Match (n:TESTSCENARIOS{testScenarioName : "' + e.scenarioname + '",projectID :"' + qdata['projectid'] + '"})<-[s:FMTTS]-(m:MODULES) return count(n),m.moduleName' });
// 				})
// 			} else {
// 				qdata['screen'].forEach(function (e, i) {
// 					qList_reuse.push({ 'statement': 'Match (n:SCREENS{screenName : "' + e.screenname + '",projectID :"' + qdata['projectid'] + '"}) return count(n)' });
// 				})
// 				qdata['testcase'].forEach(function (e, i) {
// 					qList_reuse.push({ 'statement': 'Match (n:TESTCASES{testCaseName : "' + e.testcasename + '",projectID :"' + qdata['projectid'] + '"})<-[a:FSTTS]-(scr:SCREENS{screenName:"' + e.screenname + '"}) return collect(ID(n))' });
// 				})
// 			}

// 		}
// 	}
// 	return qList_reuse;
// }

// var update_cassandraID = function (d, urlData, module_type, idn_v_idc = null) {
// 	logger.info("Inside function: update_cassandraID ");
// 	var data = d;
// 	var qList_new = [];
// 	var result = "";
// 	var testsuiteDetails = d.testsuiteDetails;
// 	var updateJson = [];
// 	var cassandraId_dict = {};
// 	try {
// 		testsuiteDetails.forEach(function (e, i) {
// 			var moduleID_json = e.testsuiteId;
// 			var modulename_json = e.testsuiteName;
// 			var moduleID_c_json = e.testsuiteId_c;
// 			//var modulename_json=e.testsuiteName;
// 			var testscenarioDetails_json = e.testscenarioDetails;
// 			if (!(idn_v_idc && idn_v_idc[e.testsuiteId] == moduleID_c_json)) {
// 				if (module_type == 'modules') {
// 					qList_new.push({ "statement": "MATCH (a:MODULES) WHERE a.moduleName='" + modulename_json + "' and a.projectID='" + data.projectId + "' SET a.moduleID_c='" + moduleID_c_json + "'" });
// 				} else
// 					qList_new.push({ "statement": "MATCH (a:MODULES_ENDTOEND) WHERE a.moduleName='" + modulename_json + "' and a.projectID='" + data.projectId + "' SET a.moduleID_c='" + moduleID_c_json + "'" });
// 			}
// 			cassandraId_dict[moduleID_json] = moduleID_c_json;
// 			//updateJson.push(cassandraId_dict);
// 			testscenarioDetails_json.forEach(function (sc, i) {
// 				var testscenarioId_json = sc.testscenarioId;
// 				var testscenarioname_json = sc.testscenarioName;
// 				var testscenarioId_c_json = sc.testscenarioId_c;
// 				//var modulename_json=sc.testsuiteName;
// 				var screenDetails_json = sc.screenDetails;
// 				//console.log(testscenarioId_json,testscenarioId_c_json);
// 				if (!(idn_v_idc && idn_v_idc[sc.testscenarioId] == testscenarioId_c_json)) {
// 					if (module_type == 'modules')
// 						qList_new.push({ "statement": "MATCH (a:TESTSCENARIOS) WHERE a.testScenarioName='" + testscenarioname_json + "' and a.projectID='" + data.projectId + "' SET a.testScenarioID_c='" + testscenarioId_c_json + "'" });
// 					else {
// 						qList_new.push({ "statement": "MATCH (a:TESTSCENARIOS) WHERE a.testScenarioName='" + testscenarioname_json + "' and a.projectID='" + sc.scenario_PrjId + "' SET a.testScenarioID_c='" + testscenarioId_c_json + "'" });
// 					}
// 				}
// 				cassandraId_dict[testscenarioId_json] = testscenarioId_c_json;
// 				screenDetails_json.forEach(function (scr, i) {
// 					var screenId_json = scr.screenId;
// 					var screenId_c_json = scr.screenId_c;
// 					var screenname_json = scr.screenName;
// 					//var modulename_json=sc.testsuiteName;
// 					var testcaseDetails_json = scr.testcaseDetails;
// 					if (!(idn_v_idc && idn_v_idc[scr.screenId] == screenId_c_json)) {
// 						qList_new.push({ "statement": "MATCH (a:SCREENS) WHERE a.screenName='" + screenname_json + "' and a.projectID='" + data.projectId + "' SET a.screenID_c='" + screenId_c_json + "'" });
// 						//Screen Task update in case of reuse
// 						//qList_new.push({"statement":"MATCH p=(a:SCREENS{screenID_c:'"+screenId_c_json+"'})-[r]-(b:TASKS),(q:SCREENS{screenID_c:'"+screenId_c_json+"'}) MERGE (q)-[s:FNTT{id:q.screenID}]-(b)"});
// 						// reg ex query
// 						qList_new.push({ "statement": "MATCH (c:TASKS) ,(d:SCREENS{screenID:'" + scr.screenId + "'}) where c.parent=~('.*,'+d.screenID_c+']') MERGE (d)-[t:FNTT{id:d.screenID}]-(c)" });
// 						//qList_new.push({"statement":"MATCH (a:SCREENS) WHERE a.screenName='"+screenname_json+"' and a.projectID='"+data.projectId+"' SET a.screenID_c='"+screenId_c_json+"'"});
// 						//updateJson.push({screenId_json:screenId_c_json});	
// 					}
// 					cassandraId_dict[screenId_json] = screenId_c_json;
// 					//updateJson.push(cassandraId_dict);

// 					testcaseDetails_json.forEach(function (tc, i) {
// 						var testcaseId_json = tc.testcaseId;
// 						var testcaseId_c_json = tc.testcaseId_c;
// 						var testcaseName_json = tc.testcaseName;
// 						var screenId_C_neo = tc.screenID_c;
// 						//console.log('testcaseId_json',testcaseId_c_json);
// 						if (screenId_C_neo == 'null' || screenId_C_neo == undefined) {
// 							qList_new.push({ "statement": "MATCH (a:TESTCASES) WHERE a.testCaseName='" + testcaseName_json + "' and a.screenID='" + screenId_json + "' SET a.screenID_c='" + screenId_c_json + "'" });
// 						}
// 						if (!(idn_v_idc && idn_v_idc[tc.testcaseId] == testcaseId_c_json)) {
// 							qList_new.push({ "statement": "MATCH (a:TESTCASES) WHERE a.testCaseName='" + testcaseName_json + "' and a.screenID_c='" + screenId_c_json + "' SET a.testCaseID_c='" + testcaseId_c_json + "'" });
// 							//TestCase Task update in case of reuse
// 							//qList_new.push({"statement":"MATCH (a:SCREENS{screenID_c:'"+screenId_c_json+"'})-[r]-(b:TESTCASES{testCaseID_c:'"+testcaseId_c_json+"'})-[s]-(c:TASKS) ,(d:TESTCASES{testCaseID_c:'"+testcaseId_c_json+"'}) MERGE (d)-[t:FNTT{id:d.testCaseID}]-(c)"});
// 							qList_new.push({ "statement": "MATCH (c:TASKS) ,(d:TESTCASES{testCaseID:'" + tc.testcaseId + "'}) where c.parent=~('.*'+d.testCaseID_c+']') MERGE (d)-[t:FNTT{id:d.testCaseID}]-(c)" });
// 						}
// 						cassandraId_dict[testcaseId_json] = testcaseId_c_json;
// 					});
// 				});
// 			});
// 		});
// 	} catch (ex) {
// 		logger.error('exception in update_cassandraID', ex);
// 	}
// 	updateJson.push(cassandraId_dict);
// 	return [qList_new, updateJson];
// };

exports.excelToMindmap = function (req, res) {
	logger.info("Inside UI service: excelToMindmap");
	try {
		if (utils.isSessionActive(req)) {
			var wb1 = xlsx.read(req.body.data.content, { type: 'binary' });
			if (req.body.data.flag == 'sheetname') {
				return res.status(200).send(wb1.SheetNames);
			}
			var myCSV = xlsToCSV(wb1, req.body.data.sheetname);
			var numSheets = myCSV.length / 2;
			var qObj = [];
			var err;
			for (var k = 0; k < numSheets; k++) {
				var cSheet = myCSV[k * 2 + 1];
				var cSheetRow = cSheet.split('\n');
				var scoIdx = -1, scrIdx = -1, sctIdx = -1;
				var uniqueIndex = 0;
				cSheetRow[0].split(',').forEach(function (e, i) {
					if(i== 0 && e.toLowerCase()=="module") modIdx = i;
					if(i== 1 && e.toLowerCase()=="scenario") scoIdx = i;
					if(i== 2 && e.toLowerCase()=="screen") scrIdx = i;
					if(i== 3 && e.toLowerCase()=="script") sctIdx = i;
				});
				if (modIdx == -1 || scoIdx == -1 || scrIdx == -1 || sctIdx == -1 || cSheetRow.length < 2) {
					err = true;
					break;
				}
				var e, lastSco = -1, lastScr = -1, nodeDict = {}, scrDict = {};
				for (var i = 1; i < cSheetRow.length; i++) {
					var row = cSheetRow[i].split(',');
					if (row.length < 3) continue;
					if (row[modIdx] !== '') {
						e = { id: uuidV4(), name: row[modIdx], type: 0 };
						qObj.push(e);
					}
					if (row[scoIdx] !== '') {
						lastSco = uniqueIndex; lastScr = -1; scrDict = {};
						e = { id: uuidV4(), name: row[scoIdx], type: 1 };
						qObj.push(e);
						nodeDict[e.id] = uniqueIndex;
						uniqueIndex++;
					}
					if (row[scrIdx] !== '' && lastSco != -1) {
						var tName = row[scrIdx];
						var lScr = qObj[lastScr];
						if (lScr === undefined || (lScr)) {
							if (scrDict[tName] === undefined) scrDict[tName] = uuidV4();
							lastScr = uniqueIndex;
							e = { id: scrDict[tName], name: tName, type: 2, uidx: lastScr };
							qObj.push(e);
							nodeDict[e.id] = uniqueIndex;
							uniqueIndex++;
						}
					}
					if (row[sctIdx] !== '' && lastScr != -1) {
						e = { id: uuidV4(), name: row[sctIdx], type: 3, uidx: lastScr };
						qObj.push(e);
						nodeDict[e.id] = uniqueIndex;
						uniqueIndex++;
					}
				}
			}
			if (err) res.status(200).send('fail');
			else res.status(200).send(qObj);
		}
		else {
			logger.error("Invalid Session");
			res.send("Invalid Session");
		}
	}
	catch (exc) {
		logger.error(exc.message);
		return res.send('fail')
	}
};

exports.getScreens = function (req, res) {
	logger.info("Inside UI service: populateScenarios");
	if (utils.isSessionActive(req)) {
		var d = req.body;
		var prjId = d.projectId;
		var screenList = [];
		var testCasesList = [];
		var qList = [];
		qList.push({ 'statement': "MATCH (n:SCREENS{projectID:'" + prjId + "'}) RETURN n.screenID_c,n.screenID,n.screenName,ID(n)" });
		qList.push({ 'statement': "MATCH (n:TESTCASES{projectID:'" + prjId + "'}) RETURN n.testCaseID_c,n.testCaseID,n.testCaseName,ID(n)" });

		var scenarioList = [];
		neo4jAPI.executeQueries(qList, function (status, result) {
			res.setHeader('Content-Type', 'application/json');
			if (status != 200) res.status(status).send(result);
			try {
				result[0].data.forEach(function (e, i) {
					screenList.push({ 'name': e.row[2], 'id_c': e.row[0], 'id_n': e.row[1], 'id': e.row[3] })
				})
				result[1].data.forEach(function (e, i) {
					testCasesList.push({ 'name': e.row[2], 'id_c': e.row[0], 'id_n': e.row[1], 'id': e.row[3] })
				})
				// res_data=result;
				// res_data[0].data.forEach(function(row){
				// 	scenarioList.push(row.row[0])
				// });
				res.status(200).send({ 'screenList': screenList, 'testCaseList': testCasesList });
			} catch (ex) {
				logger.error("exception in mindmapService: ", ex);
				res.status(200).send('fail');
			}

		});
	}
	else {
		logger.error("Invalid Session");
		res.send("Invalid Session");
	}
};

exports.exportToExcel = function (req, res) {
	logger.info("Writing Module structure to Excel");
	if (utils.isSessionActive(req)) {
		var d = req.body;
		var excelMap = d.excelMap;
		var dir = './../../excel';
		var excelDirPath = path.join(__dirname, dir);
		var filePath = path.join(excelDirPath, 'samp234.xlsx');

		try {
			if (!fs.existsSync(excelDirPath)) fs.mkdirSync(excelDirPath); // To create directory for storing excel files if DNE.
			if (fs.existsSync(filePath)) fs.unlinkSync(path.join(filePath)); // To remove the created files
		} catch (e) {
			logger.error("Exception in mindmapService: exportToExcel: Create Directory/Remove file", e);
		}

		//create a new workbook file in current working directory
		var wb = new xl.Workbook();
		var ws = wb.addWorksheet('Sheet1');

		logger.debug(excelMap.name);

		//create the new worksheet with 10 coloumns and rows equal to number of testcases
		var curr = excelMap;

		//Sorting the positions of the child nodes according to their childindex
		for (i = 0; i < curr.children.length; i++) {
			for (j = 0; j < curr.children[i].children.length; j++) {
				//sort the testcases based on childindex
				curr.children[i].children[j].children.sort(function(a,b){
					return parseInt(a.childIndex)-parseInt(b.childIndex)});
			}
			//sort the screens based on childindex
			curr.children[i].children.sort(function(a,b){
				return parseInt(a.childIndex)-parseInt(b.childIndex)});
		}
		//sort the scenarios based on childindex
		curr.children.sort(function(a,b){
		return parseInt(a.childIndex)-parseInt(b.childIndex)});

		//Set some width for first 4 columns
		ws.column(1).setWidth(40);
 		ws.column(2).setWidth(40);
  		ws.column(3).setWidth(40);
		ws.column(4).setWidth(40);

		var style = wb.createStyle({
			font: {
				color: '000000',
				bold: true,
				  size: 12,
				}
			  });

		ws.cell(1, 1)
			  .string('Module')
			  .style(style);
	
		ws.cell(1, 2)
			  .string('Scenario')
			  .style(style);
	
		ws.cell(1, 3)
			  .string('Screen')
			  .style(style);
	
		ws.cell(1, 4)
			  .string('Script')
			  .style(style);

		var min_scen_idx = 1;
		var min_scr_idx = 1;
		ws.cell(2,1).string(curr.name);
		try {
			var tc_count=0;
			for (i = 0; i < curr.children.length; i++) {
				for (j = 0; j < curr.children[i].children.length; j++) {
					for (k = 0; k < curr.children[i].children[j].children.length; k++) {
						tc_count++;
						ws.cell(1 + tc_count,4).string(curr.children[i].children[j].children[k].name);
					}
					
					ws.cell(1 + min_scr_idx,3).string(curr.children[i].children[j].name);
					min_scr_idx= tc_count+1;
				}
				ws.cell( 1 + min_scen_idx,2).string(curr.children[i].name);
				min_scen_idx=tc_count+1;
			}
			//save it
			wb.write('./excel/samp234.xlsx',function (err) {
				if (err) return res.send('fail');
				res.writeHead(200, {'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
				var rstream = fs.createReadStream(filePath);
				rstream.pipe(res);
			});
		} catch (ex) {
			logger.error("Exception in mindmapService: exportToExcel: ", ex);
		}
	} else {
		logger.error("Invalid session");
		res.send("Invalid Session");
	}
};

exports.getDomain = function (req, res) {
	admin.getDomains_ICE(req, res);
};
function getElementByAttribute(attr, value, root) {
    root = root || document.body;
    if(root.hasAttribute(attr) && root.getAttribute(attr) == value) {
        return root;
    }
    var children = root.children, 
        element;
    for(var i = children.length; i--; ) {
        element = getElementByAttribute(attr, value, children[i]);
        if(element) {
            return element;
        }
    }
    return null;
}
function xml2json(xml, tab) {
	var X = {
	   toObj: function(xml) {
		  var o = {};
		  if (xml.nodeType==1) {   // element node ..
			 if (xml.attributes.length)   // element with attributes  ..
				for (var i=0; i<xml.attributes.length; i++)
				   o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
			 if (xml.firstChild) { // element has child nodes ..
				var textChild=0, cdataChild=0, hasElementChild=false;
				for (var n=xml.firstChild; n; n=n.nextSibling) {
				   if (n.nodeType==1) hasElementChild = true;
				   else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
				   else if (n.nodeType==4) cdataChild++; // cdata section node
				}
				if (hasElementChild) {
				   if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
					  X.removeWhite(xml);
					  for (var n=xml.firstChild; n; n=n.nextSibling) {
						 if (n.nodeType == 3)  // text node
							o["#text"] = X.escape(n.nodeValue);
						 else if (n.nodeType == 4)  // cdata node
							o["#cdata"] = X.escape(n.nodeValue);
						 else if (o[n.nodeName]) {  // multiple occurence of element ..
							if (o[n.nodeName] instanceof Array)
							   o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
							else
							   o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
						 }
						 else  // first occurence of element..
							o[n.nodeName] = X.toObj(n);
					  }
				   }
				   else { // mixed content
					  if (!xml.attributes.length)
						 o = X.escape(X.innerXml(xml));
					  else
						 o["#text"] = X.escape(X.innerXml(xml));
				   }
				}
				else if (textChild) { // pure text
				   if (!xml.attributes.length)
					  o = X.escape(X.innerXml(xml));
				   else
					  o["#text"] = X.escape(X.innerXml(xml));
				}
				else if (cdataChild) { // cdata
				   if (cdataChild > 1)
					  o = X.escape(X.innerXml(xml));
				   else
					  for (var n=xml.firstChild; n; n=n.nextSibling)
						 o["#cdata"] = X.escape(n.nodeValue);
				}
			 }
			 if (!xml.attributes.length && !xml.firstChild) o = null;
		  }
		  else if (xml.nodeType==9) { // document.node
			 o = X.toObj(xml.documentElement);
		  }
		  else
			 console.log("unhandled node type: " + xml.nodeType);
		  return o;
	   },
	   toJson: function(o, name, ind) {
		  var json = name ? ("\""+name+"\"") : "";
		  if (o instanceof Array) {
			 for (var i=0,n=o.length; i<n; i++)
				o[i] = X.toJson(o[i], "", ind+"\t");
			 json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
		  }
		  else if (o == null)
			 json += (name&&":") + "null";
		  else if (typeof(o) == "object") {
			 var arr = [];
			 for (var m in o)
				arr[arr.length] = X.toJson(o[m], m, ind+"\t");
			 json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
		  }
		  else if (typeof(o) == "string")
			 json += (name&&":") + "\"" + o.toString() + "\"";
		  else
			 json += (name&&":") + o.toString();
		  return json;
	   },
	   innerXml: function(node) {
		  var s = ""
		  if ("innerHTML" in node)
			 s = node.innerHTML;
		  else {
			 var asXml = function(n) {
				var s = "";
				if (n.nodeType == 1) {
				   s += "<" + n.nodeName;
				   for (var i=0; i<n.attributes.length;i++)
					  s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
				   if (n.firstChild) {
					  s += ">";
					  for (var c=n.firstChild; c; c=c.nextSibling)
						 s += asXml(c);
					  s += "</"+n.nodeName+">";
				   }
				   else
					  s += "/>";
				}
				else if (n.nodeType == 3)
				   s += n.nodeValue;
				else if (n.nodeType == 4)
				   s += "<![CDATA[" + n.nodeValue + "]]>";
				return s;
			 };
			 for (var c=node.firstChild; c; c=c.nextSibling)
				s += asXml(c);
		  }
		  return s;
	   },
	   escape: function(txt) {
		  return txt.replace(/[\\]/g, "\\\\")
					.replace(/[\"]/g, '\\"')
					.replace(/[\n]/g, '\\n')
					.replace(/[\r]/g, '\\r');
	   },
	   removeWhite: function(e) {
		  e.normalize();
		  for (var n = e.firstChild; n; ) {
			 if (n.nodeType == 3) {  // text node
				if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
				   var nxt = n.nextSibling;
				   e.removeChild(n);
				   n = nxt;
				}
				else
				   n = n.nextSibling;
			 }
			 else if (n.nodeType == 1) {  // element node
				X.removeWhite(n);
				n = n.nextSibling;
			 }
			 else                      // any other node
				n = n.nextSibling;
		  }
		  return e;
	   }
	};
	if (xml.nodeType == 9) // document node
	   xml = xml.documentElement;
	var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
	return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}

var getAdjacentItems = function(activityJSON,taskidx,type){
	// get links
	if(type == 'task')
		var currentTask = activityJSON["mxGraphModel"]["root"]["Task"][taskidx];
	else if (type == 'rhombus')
		var currentTask = activityJSON["mxGraphModel"]["root"]["Shape"][taskidx];

	// get previous links
	var previousLinks = activityJSON["mxGraphModel"]["root"]["Edge"].filter(function(eachLink){
		return eachLink["mxCell"]["@target"] == currentTask["@id"];
	});
	var previousNodes;
	// get next links
	var nextLinks = activityJSON["mxGraphModel"]["root"]["Edge"].filter(function(eachLink){
		return eachLink["mxCell"]["@source"] == currentTask["@id"];
	});	
	var previousLinksSourceList = [];	// list of id of sources
	// get next item
	
	if(previousLinks.length>0){
		// fill source list
		previousLinks.forEach(function(eachLink,eachLinkIdx){
			previousLinksSourceList.push(eachLink["mxCell"]["@source"]);
		})


		//search in shape just to check if node is connected to start node while generating scripts
		var filteredShape = activityJSON["mxGraphModel"]["root"]["Shape"].filter(function(eachShape){
			return previousLinksSourceList.indexOf(eachShape["@id"]) != -1;
		});
		if(filteredShape.length>0){previousNodes = filteredShape}
		else{
			//search in task
			var filteredTask = activityJSON["mxGraphModel"]["root"]["Task"].filter(function(eachTask){
				return previousLinksSourceList.indexOf(eachTask["@id"]) != -1;
			});		
			if(filteredTask.length>0){
				previousNodes = filteredTask;
			}
			else{
				return {"error":"no match found!"};
			}
		}
	}
	// was assuming only 1 end node (target) earlier but since rhombus (if block) is introduced
	// can have multiple next links
	if(nextLinks.length>0){	
		//search in task
		var nextLinksList = [];
		nextLinks.forEach(function(eachNextLink,eachNextLinkIdx){
			nextLinksList.push(eachNextLink["mxCell"]["@target"]);
		})
		var filteredTask = activityJSON["mxGraphModel"]["root"]["Task"].filter(function(eachTask){
			return nextLinksList.indexOf(eachTask["@id"]) != -1;	//assuming only one earlier but now multiple
		});
		var filteredShapes = activityJSON["mxGraphModel"]["root"]["Shape"].filter(function(eachShape){
			return nextLinksList.indexOf(eachShape["@id"]) != -1;
		});		
		return {"sources":previousNodes,"targets":filteredTask.concat(filteredShapes)};
	}
}

exports.pdProcess = function (req, res) {
	try{
		var testcaseid = uuidV4(),screenid = uuidV4();

		// orderlist contains {label:'',type:''}
		var file = JSON.parse(req.body.data.file);
		var sessionID = uuidV4();
		var orderMatrix = file.order;// 2d array list of all possible paths in case of multiple start nodes to guide through the order for mindmap creation
		// var doc = new DOMParser().parseFromString(file,'text/xml');

		// cleanup
		for(var i = 0; i < orderMatrix.length; i++) {
			var templist = orderMatrix[i];
			for(var j = 0; j < templist.length; j++) {
				orderMatrix[i][j].label = templist[j].label.replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'');
			}
		}

		// testcase and screen creation
		var screenshotdatapertask = [],screendataobj = {},orderlist = [],nameMap = {},ordernameidlist = [],screendatamindmap=[];	
		var doc = new DOMParser().parseFromString(file.data,'text/xml');
		var activityJSON = JSON.parse(xml2json(doc).replace("\nundefined",""))
		// in case single task it returns object instead of list so make it list
		if(!activityJSON["mxGraphModel"]["root"]["Task"].length){
			activityJSON["mxGraphModel"]["root"]["Task"] = [activityJSON["mxGraphModel"]["root"]["Task"]];
		}
		

		// new logic
		//	 for each "task" create screen, testcase
		// 	 for each "if" create testcases 
		activityJSON["mxGraphModel"]["root"]["Task"].forEach(function(eachActivity,eachActivityIdx){
			var adjacentItems = getAdjacentItems(activityJSON,eachActivityIdx,'task');
			screendatamindmap = [];
			try{
				screenshotdatapertask = JSON.parse(Base64.decode(eachActivity.mxCell["@data"]));	// list of objects
			}
			catch(ex){
				console.log("empty task");
				screenshotdatapertask = [];
			}
			// Encrypt for storage
			screenshotdatapertask.forEach(function(a,i){
				
				if(a['xpath']){
					a['url']= encrypt(a['url'])
					xpath_string=a['xpath'].split(';');
					left_part=encrypt(xpath_string.slice(0,2).join(';'));	// 0,1
					right_part=encrypt(xpath_string.slice(3,).join(';'));	// 3,4...
					a['xpath'] = left_part+';'+xpath_string[2]+';'+right_part;	
					screendatamindmap.push(a);
				}
			});
			// map data with screenname
			var tempName = eachActivity["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'');		// name id combo
			screendataobj[tempName] = {};
			screendataobj[tempName].data = {"mirror":"","view":screendatamindmap};
			var scrapedObjects = JSON.stringify(screendataobj[tempName].data);
			var parsedScrapedObj = JSON.parse(scrapedObjects);
			scrapedObjects = JSON.stringify(parsedScrapedObj);
			scrapedObjects = JSON.stringify(scrapedObjects);
			scrapedObjects = scrapedObjects.replace(/'+/g, "''");
			var newParse;
			if (scrapedObjects != null && scrapedObjects.trim() != '' && scrapedObjects != undefined) {
				newParse = JSON.parse(scrapedObjects);
			} else {
				newParse = JSON.parse("{}");
			}
			// scrapedObjects = newParse;		
			scrapedObjects = JSON.parse(newParse);	
			screendataobj[tempName].data = scrapedObjects;
			
			var testCaseOut = generateTestCaseMap(screenshotdatapertask,eachActivityIdx,adjacentItems,sessionID);
			if(testCaseOut.start) orderlist.unshift({'label':tempName,'type':'task'}) // in case of first script
			else orderlist.push({'label':tempName,'type':'task'});
			var requestedtestcasesteps = JSON.stringify(testCaseOut.data);
			requestedtestcasesteps = requestedtestcasesteps.replace(/'+/g, "''");
			screendataobj[tempName].script = JSON.parse(requestedtestcasesteps);
	
		});
	
		activityJSON["mxGraphModel"]["root"]["Shape"].forEach(function(eachShape,eachActivityIdx){
			if(eachShape.mxCell['@style']!='rhombus') return;
			var tempName = eachShape["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'');		// name id combo
			screendataobj[tempName] = {};
			screendataobj[tempName].data = {"mirror":"","view":[]};
			var adjacentItems = getAdjacentItems(activityJSON,eachActivityIdx,'rhombus');	// items adjacent to if block
			var testCaseOut = generateTestCaseMap([],eachActivityIdx,adjacentItems,sessionID);
			if(testCaseOut.start) orderlist.unshift({'label':tempName,'type':'rhombus'}) // in case of first script
			else orderlist.push({'label':tempName,'type':'rhombus'});
			screendataobj[tempName].script = testCaseOut.data;
	
		});
	
	
		// data insertion logic
		async.forEachSeries(orderlist, function (nodeObj, savedcallback) {
			var name = nodeObj.label,type = nodeObj.type;
			testcaseid = uuidV4(),screenid = uuidV4();
			var inputs = {
				'projectid': req.body.data.projectid,
				'screenname': 'Screen_PD_'+name,
				'screenid': screenid,
				'versionnumber': 0,
				'createdby': 'PD',
				'createdon':new Date().getTime().toString(),
				'createdthrough':'null1',				
				'createdthrough': 'pd',
				'modifiedby':'asd',
				'modifiedbyrole':'ad',
				'modifiedon':'ew',
				'deleted': false,
				'skucodescreen': 'skucodescreen',
				'tags': 'tags',
				'screendata': JSON.stringify(screendataobj[name].data)
			};
			ordernameidlist.push({'name':'Screen_PD_'+name,'type':3})
	
			
			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};
			
			client.post(epurl + "create_ice/updateScreenname_ICE", args,
				function (getScrapeDataQueryresult, response) {
					try {
						if (response.statusCode != 200 || getScrapeDataQueryresult.rows == "fail") {
							logger.error("Error occurred in create_ice/updateScreenname_ICE from fetchScrapedData Error Code : ERRNDAC");
						} else {
							console.log("screen saved successfully!");
							var inputs = {
								'screenid': screenid,
								'testcasename': 'Testcase_PD_'+name,
								'testcaseid': uuidV4(),
								'versionnumber': 0,
								'createdby': 'pd',
								'createdthrough': 'pd',
								'createdon':new Date().getTime().toString(),
								'createdthrough':'null1',
								'modifiedby':'asd',
								'modifiedbyrole':'ad',
								'modifiedon':'ew',
								'deleted': false,
								'skucodetestcase': 'skucodetestcase',
								'tags': 'tags',
								'testcasesteps':JSON.stringify(screendataobj[name].script)
							};
							ordernameidlist.push({'name':'Testcase_PD_'+name,'type':4})
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							client.post(epurl + "create_ice/updateTestcasename_ICE", args,
								function (getScrapeDataQueryresult, response) {
									try {
										if (response.statusCode != 200 || getScrapeDataQueryresult.rows == "fail") {
											logger.error("Error occurred in design/getScrapeDataScreenLevel_ICE from fetchScrapedData Error Code : ERRNDAC");
										} else {
											console.log("Testcase saved successfully!");
											savedcallback();		
										}
									} catch (exception) {
										logger.error("Exception: %s",exception);
									}
								}
							);							
						}
					} catch (exception) {
						logger.error("Exception while sending scraped data from the function fetchScrapedData: %s",exception);
					}
				}
			);
		},function(){
			//final callback
			res.send({"success":true,"data":orderMatrix,"history":activityJSON['mxGraphModel']['@history']});
		});
	
	}
	catch(err){
		console.log(err)
	}

	
};
                                                                                                                 
var generateTestCaseMap = function(screendata,idx,adjacentItems,sessionID){

	var testCaseSteps = [],testcaseObj,step = 1;
	var firstScript = false,windowId;
	if(adjacentItems){
	// in case is first script
		// make orderlist global
		// move the script to first

		adjacentItems.sources.forEach(function(item,idx){
			if(item["@label"]=="Start"){
				firstScript = true;
				testCaseSteps = [{
					"stepNo": 1,
					"objectName": " ",
					"custname": "@Browser",
					"keywordVal": "openBrowser",
					"inputVal": [""],
					"outputVal": "",
					"remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
					"remarks": "",
					"url": " ",
					"appType": "Web",
					"addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_1\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
					"addTestCaseDetailsInfo": "",
					"cord": "",
					"_id_": "1"
				}],step = 2;			
			}
		});	
	}

	screendata.forEach(function(eachScrapedAction,i){
		testcaseObj = '';
		if(eachScrapedAction.action){
            if(eachScrapedAction.action.windowId){
                if(windowId && windowId!=eachScrapedAction.action.windowId) {
                    testcaseObj = {
                        "stepNo": step,
                        "objectName": " ",
                        "custname": "@Browser",
                        "keywordVal": "switchToWindow",
                        "inputVal": [""],
                        "outputVal": "",
                        "remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
                        "remarks": "",
                        "url": eachScrapedAction.url,
                        "appType": "Web",
                        "addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_4\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
                        "addTestCaseDetailsInfo": "",
                        "cord": "",
                        "_id_": String(step)
                    } 
                    testCaseSteps.push(testcaseObj);
                    step++;                    
                }
                else{
                    windowId=eachScrapedAction.action.windowId;
                }
            }            
			switch(eachScrapedAction.action.actionName){
				case "navigate":
					testcaseObj = {
							"stepNo": step,
							"objectName": " ",
							"custname": "@Browser",
							"keywordVal": "navigateToURL",
							"inputVal": [eachScrapedAction.action.actionData],
							"outputVal": "",
							"remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
							"remarks": "",
							"url": " ",
							"appType": "Web",
							"addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_1\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
							"addTestCaseDetailsInfo": "",
							"cord": "",
							"_id_": String(step)
					}
					break;
				case "click":
					testcaseObj = {
						"stepNo": step,
						"objectName": eachScrapedAction.xpath,
						"custname": addslashes(eachScrapedAction.custname),
						"keywordVal": "click",
						"inputVal": [""],
						"outputVal": "",
						"remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
						"remarks": "",
						"url": eachScrapedAction.url,
						"appType": "Web",
						"addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_3\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
						"addTestCaseDetailsInfo": "",
						"cord": "",
						"_id_": String(step)
					}		
					if(eachScrapedAction.custname.split('_')[eachScrapedAction.custname.split('_').length-1] == 'elmnt') testcaseObj.keywordVal = 'clickElement';
					break;	
				case "inputChange":
                    if(eachScrapedAction.action.actionData.split(";").length == 2 && eachScrapedAction.action.actionData.split(";")[1] =='byIndex'){
                        testcaseObj = {
                            "stepNo": step,
                            "objectName": eachScrapedAction.xpath,
                            "custname": addslashes(eachScrapedAction.custname),
                            "keywordVal": "selectValueByIndex",
                            "inputVal": [eachScrapedAction.action.actionData.split(";")[0]],
                            "outputVal": "",
                            "remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
                            "remarks": "",
                            "url": eachScrapedAction.url,
                            "appType": "Web",
                            "addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_4\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
                            "addTestCaseDetailsInfo": "",
                            "cord": "",
                            "_id_": String(step)
                        }                      
					}
					else if(eachScrapedAction.action.actionData.split(";").length == 2 && eachScrapedAction.action.actionData.split(";")[1] =='byIndexes'){
						var selectIdxList = eachScrapedAction.value.split(";")[0].replace(/,/g,';');
						testcaseObj = {
							"stepNo": step,
							"objectName": eachScrapedAction.xpath,
							"custname": addslashes(eachScrapedAction.custname),
							"keywordVal": "selectValueByIndex",
							"inputVal": [selectIdxList],
							"outputVal": "",
							"remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
							"remarks": "",
							"url": eachScrapedAction.url,
							"appType": "Web",
							"addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_4\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
							"addTestCaseDetailsInfo": "",
							"cord": "",
							"_id_": String(step)
						}    
						if(selectIdxList.length > 1){
							testcaseObj.keywordVal = "selectMultipleValuesByIndexes";
						}
					}
                    else{
                        testcaseObj = {
                            "stepNo": step,
                            "objectName": eachScrapedAction.xpath,
                            "custname": addslashes(eachScrapedAction.custname),
                            "keywordVal": "setText",
                            "inputVal": [eachScrapedAction.action.actionData],
                            "outputVal": "",
                            "remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
                            "remarks": "",
                            "url": eachScrapedAction.url,
                            "appType": "Web",
                            "addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_4\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
                            "addTestCaseDetailsInfo": "",
                            "cord": "",
                            "_id_": String(step)
                        }
                        
                    }
					break;		
				default:
					console.log("no match found!");
					break;
			}
			if(testcaseObj){
				testCaseSteps.push(testcaseObj);
				step++;
			}

		}
		else if(eachScrapedAction.tag == "browser_navigate"){
			testcaseObj = {
				"stepNo": step,
				"objectName": " ",
				"custname": "@Browser",
				"keywordVal": "navigateToURL",
				"inputVal": [eachScrapedAction.url],
				"outputVal": "",
				"remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
				"remarks": "",
				"url": " ",
				"appType": "Web",
				"addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_1\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
				"addTestCaseDetailsInfo": "",
				"cord": "",
				"_id_": String(step)
			}			
			testCaseSteps.push(testcaseObj);
			step++;
		}
	});
	// console.log(screendata)

	if(adjacentItems){
		console.log("adjacent:",adjacentItems);
		// list of sources(only shapes) and targets (assuming only one)

		if(adjacentItems["error"]){
			console.log(adjacentItems["error"]);
		}
		else{

			// old logic
			// in case target is if
			// 	get next items
			// 	add if step with jumpto those scripts (***outgoing connections equal to number of cases)

			// new logic
			// in case multiple targets, current node is "if" block create if steps
			// otherwise just jump to
			if(adjacentItems.targets.length>1){	// I am if block
				adjacentItems.targets.forEach(function(eachBox,eachBoxIdx){
					  testcaseObj = {
						"stepNo": step,
						"objectName": " ",
						"custname": "@Generic",
						"keywordVal": "elseIf",
						"inputVal": [""],
						"outputVal": "",
						"remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
						"remarks": "",
						"url": " ",
						"appType": "Generic",
						"addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_1\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
						"addTestCaseDetailsInfo": "",
						"cord": "",
						"_id_": String(step)
					}		
					if(eachBoxIdx==0) testcaseObj["keywordVal"] = "if"; 		
					testCaseSteps.push(testcaseObj);
					step++;					
					if(eachBox["@label"]=="End"){// in case of end
						testcaseObj = {
							"stepNo": step,
							"objectName": " ",
							"custname": "@Generic",
							"keywordVal": "stop",
							"inputVal": [""],
							"outputVal": "",
							"remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
							"remarks": "",
							"url": " ",
							"appType": "Generic",
							"addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_1\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
							"addTestCaseDetailsInfo": "",
							"cord": "",
							"_id_": String(step)
						}				
						testCaseSteps.push(testcaseObj);
						step++;
					}
					if(eachBox['mxCell']['@style'] == 'rhombus'){// in case of if
						testcaseObj = {
							"stepNo": step,
							"objectName": " ",
							"custname": "@Generic",
							"keywordVal": "jumpTo",
							"inputVal": ['Testcase_PD_'+eachBox["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'')],
							"outputVal": "",
							"remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
							"remarks": "",
							"url": " ",
							"appType": "Generic",
							"addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_1\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
							"addTestCaseDetailsInfo": "",
							"cord": "",
							"_id_": String(step)
						}				
						testCaseSteps.push(testcaseObj);
						step++;
					}					
					else if(eachBox['mxCell']['@style'] == 'task'){	// in case of task
						testcaseObj = {
							"stepNo": step,
							"objectName": " ",
							"custname": "@Generic",
							"keywordVal": "jumpTo",
							"inputVal": ['Testcase_PD_'+eachBox["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'')],
							"outputVal": "",
							"remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
							"remarks": "",
							"url": " ",
							"appType": "Generic",
							"addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_1\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
							"addTestCaseDetailsInfo": "",
							"cord": "",
							"_id_": String(step)
						}				
						testCaseSteps.push(testcaseObj);
						step++;								
					}

	
				});
				// end of if step
				testcaseObj = {
					"stepNo": step,
					"objectName": " ",
					"custname": "@Generic",
					"keywordVal": "endIf",
					"inputVal": [""],
					"outputVal": "",
					"remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
					"remarks": "",
					"url": " ",
					"appType": "Generic",
					"addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_1\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
					"addTestCaseDetailsInfo": "",
					"cord": "",
					"_id_": String(step)
				}				
				testCaseSteps.push(testcaseObj);
				step++;							
			}



			// in case target is activity
				// add jumpto activity
			
			else if(adjacentItems.targets[0]){	// assuming only 1 target // I am activity
	
				// in case activity target is end			
				// add end keyword
				if(adjacentItems.targets[0]["@label"]=="End"){	// assuming only 1 target // if end
					testcaseObj = {
						"stepNo": step,
						"objectName": " ",
						"custname": "@Generic",
						"keywordVal": "stop",
						"inputVal": [""],
						"outputVal": "",
						"remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
						"remarks": "",
						"url": " ",
						"appType": "Generic",
						"addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_1\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
						"addTestCaseDetailsInfo": "",
						"cord": "",
						"_id_": String(step)
					}				
					testCaseSteps.push(testcaseObj);
					step++;			
				}	
				else{ // otherwise task or activity
					testcaseObj = {
						"stepNo": step,
						"objectName": " ",
						"custname": "@Generic",
						"keywordVal": "jumpTo",
						"inputVal": ['Testcase_PD_'+adjacentItems.targets[0]["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'')],
						"outputVal": "",
						"remarksStatus": "<img src=\"imgs/ic-remarks-inactive.png\" class=\"remarksIcon\">",
						"remarks": "",
						"url": " ",
						"appType": "Generic",
						"addTestCaseDetails": "<img alt=\"inActiveDetails\" title=\"\" id=\"details_1\" src=\"imgs/ic-details-inactive.png\" class=\"detailsIcon inActiveDetails\">",
						"addTestCaseDetailsInfo": "",
						"cord": "",
						"_id_": String(step)
					}				
					testCaseSteps.push(testcaseObj);
					step++;													
				}
			}	

	

		}

	}
	return {"data":testCaseSteps,"start":firstScript};
}

var encrypt = function(data){

	// var key = 'Nineeteen68@SecureScrapeDataPath'
	// var ciphertext = CryptoJS.AES.encrypt(data, key,{ 
	// 	iv: "00000000", 
	// 	padding: CryptoJS.pad.Pkcs7,
	// 	mode: CryptoJS.mode.CBC
	
	//   }).toString();
    // var e64 = CryptoJS.enc.Base64.parse(ciphertext);
    // var eHex = e64.toString(CryptoJS.enc.Hex);
	// return eHex;	
	let cipher = crypto.createCipheriv('aes-256-cbc', 'Nineeteen68@SecureScrapeDataPath', "0000000000000000");
	let encryptedData = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
	// console.log('encrypted data=', encryptedData.toUpperCase());
	return 	encryptedData.toUpperCase();
}