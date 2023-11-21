const uuid = require('uuid-random');
const crypto = require('crypto');
const validator =  require('validator');
const DOMParser = require('xmldom').DOMParser;
const xl = require('excel4node');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const logger = require('../../logger');
const utils = require('../lib/utils');

exports.Encrypt_ICE = async (req, res) => {
	const fnName = "Encrypt_ICE";
	logger.info("Inside UI service: " + fnName);
	try {
		var methodSelected = req.body.encryptionType;
		var encrytData = req.body.encryptionValue;
		var encryptedValue;
		var regEx=/[<">']/;
		const validate_encryptionType = validator.isEmpty(methodSelected) == false;
		const validate_check_encryptData = validator.isEmpty(encrytData) == false || !regEx.test(encrytData);
		if (!validate_encryptionType || !validate_check_encryptData) return res.send("fail");
		if (methodSelected == "AES") {
			const args = {
				data: req.body.encryptionValue,
				headers:{'Content-Type': 'plain/text'}
			};
			const results = await utils.fetchData(args, "utility/encrypt_ICE/aes", fnName)
			if (results == "fail") return res.send("fail");
			encryptedValue = results;
		} else if(methodSelected == "MD5"){
			encryptedValue = crypto.createHash('md5').update(encrytData).digest("hex");
		} else if(methodSelected == "Base64"){
			encryptedValue = Buffer.from(encrytData).toString('base64');
		} else {
			return res.send("fail");
		}
		if (encryptedValue) {
			logger.info("Data encrypted successfully");
			res.send(encryptedValue);
		}
	} catch (exception) {
		logger.error("Error occurred in utility/"+fnName+":", exception);
		res.send("fail");
	}
};

exports.manageDataTable = async(req, res) => {
	var fnName = "manageDataTable";
	logger.info("Inside UI service: " + fnName);
	try {
		var name = req.body.name;
		var action = req.body.action;
		var inputs = {
			name: name,
			action: action
		};
		if (action == "create" || action == "edit") {
			inputs.dtheaders = req.body.dtheaders;
			inputs.datatable = req.body.datatable;
		}
		const result = await utils.fetchData(inputs, "utility/manageDataTable", fnName);
		if (result == "fail" || result == "forbidden") res.status(500).send("fail");
		else res.send(result);
	} catch (exception) {
        logger.error("Exception in the service createDataTable - Error: %s", exception);
        res.status(500).send("fail");
    }
};


exports.getDatatableDetails = async(req, res) =>{
	const fnName = "getDatatableNames";
	logger.info("Inside UI service: " + fnName);
	try {
		logger.info("Fetching datatable names");
		var d = req.body;
		var dts = await getDatatable({"name":d.name, "action":d.action})
		res.send(dts);
	} catch(exception) {
		logger.error("Error occurred in utility/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

const getDatatable = async (d) => {
	const inputs = {
		"name": d.name,
		"action": d.action
	}
	return utils.fetchData(inputs, "utility/fetchDatatable", "fetchDatatable");
};

exports.importDtFromExcel = function (req, res) {
	const fnName = "importDtFromExcel";
	logger.info("Inside UI service: " + fnName);
	try {
		var wb1 = xlsx.read(req.body.content, {'type': 'binary'});
		if (req.body.flag == 'sheetname') {
			return res.status(200).send(wb1.SheetNames);
		}
		var qObj = {};
		var myCSV = xlsToCSV(wb1, req.body.sheetname);
		var columnNames = [];
		if (myCSV.length == 0) return res.send("emptyExcelData");
		var columns = myCSV[1].split('\n')[0].split(',');
		var cs = [];
		for (var i =0; i<columns.length; ++i) {
			ob = { id: uuid(), name: columns[i]};
			cs.push(ob.id);
			columnNames.push(ob);
		}
		if (columnNames.length>50) return res.send("columnExceeds");
		xlsx.utils.sheet_add_aoa(wb1.Sheets[req.body.sheetname], [cs], {origin:'A1'});
		var myJson = xlsx.utils.sheet_to_json(wb1.Sheets[req.body.sheetname]);
		if (myJson.length>200) return res.send("rowExceeds");
		qObj['datatable'] = myJson;
		qObj['dtheaders'] = columnNames;
		res.status(200).send(qObj);
	} catch(exception) {
		logger.error("Error occurred in utility/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.importDtFromCSV = function (req, res) {
	const fnName = "importDtFromCSV";
	logger.info("Inside UI service: " + fnName);
	try {
		var myCSV = req.body.content;
		var qObj = {};
		var csvArray = myCSV.replace(/\"|\'/g,'').split('\n');
		if(validator.isEmpty(myCSV)) return res.send("emptyData");
		if (csvArray.length > 200) return res.send("rowExceeds");
		rows = [];
		var columnNames = [];
		for (var k = 0; k < csvArray.length; k++) {
			if (k == 0) {
				columns = csvArray[k].split(',');
				if(columns.length>50) return res.send("columnExceeds"); 
				for (var i =0; i<columns.length; ++i) {
					ob = { id: uuid(), name: columns[i]}
					columnNames.push(ob)
				}
			} else  { 
				var row = csvArray[k].split(',');
				newObj = {};
				for (var i = 0; i < row.length; i++) {
					
					newObj[columnNames[i].id] = row[i];
				}
				rows.push(newObj);
			}
		}
		qObj['datatable'] = rows;
		qObj['dtheaders'] = columnNames;
		res.status(200).send(qObj);
	} catch(exception) {
		logger.error("Error occurred in utility/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.exportToDtExcel = async (req, res) => {
	const fnName = "exportToExcel";
	logger.info("Inside UI service: " + fnName);
	try {
		logger.info("Fetching Module details");
		var d = req.body;
		var excelMap = await getDatatable({"name":d.name, 'action': 'datatable'})
		dts = excelMap[0];
		datatable = dts.datatable;
		excelType = d.excelType;
		logger.info("Writing Datatable structure to Excel");
		var dir = './../../output';
		var excelDirPath = path.join(__dirname, dir);
		var filePath = path.join(excelDirPath, d.filename+'.'+excelType);

		try {
			if (!fs.existsSync(excelDirPath)) fs.mkdirSync(excelDirPath); // To create directory for storing excel files if DNE.
			if (fs.existsSync(filePath)) fs.unlinkSync(path.join(filePath)); // To remove the created files
		} catch (e) {
			logger.error("Exception in utilityService: exportToExcel: Create Directory/Remove file", e);
		}

		//create a new workbook file in current working directory
		var wb = new xl.Workbook();
		var ws = wb.addWorksheet('Sheet1');

		logger.debug(d.name);

		//create the new worksheet with coloumns and rows specified in data
		for (var i=1;i<=datatable.length;i++) {
			if(i==1) {
				keys = dts.dtheaders;
				col=1;
				keys.forEach(element => {
					ws.cell(i,col).string(element);
					col+=1;
				});
			}
			for(var j=1;j<=keys.length;++j) {
				rowVal = datatable[i-1][keys[j-1]]
				ws.cell(i+1,j).string(rowVal);
			}
			
		}
		//save it
		wb.write('./output/'+d.filename+'.'+excelType,function (err) {
			if (err) return res.send('fail');
			if(excelType == "xlsx") contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
			else contentType = 'application/vnd.ms-excel';
			res.writeHead(200, {'Content-Type': contentType});
			var rstream = fs.createReadStream(filePath);
			rstream.pipe(res);
		});
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}

};

exports.exportToDtCSV = async (req, res) => {
	const fnName = "exportToCSV";
	logger.info("Inside UI service: " + fnName);
	try {
		logger.info("Fetching Datatable details");
		var d = req.body;
		var csvMap = await getDatatable({"name":d.name, 'action': "datatable"})
		dts = csvMap[0];
		datatable = dts.datatable;
		logger.info("Writing Datatable structure to CSV");
		var dir = './../../output';
		var csvDirPath = path.join(__dirname, dir);
		var filePath = path.join(csvDirPath, d.filename+'.csv');

		try {
			if (!fs.existsSync(csvDirPath)) fs.mkdirSync(csvDirPath); // To create directory for storing csv files if DNE.
			if (fs.existsSync(filePath)) fs.unlinkSync(path.join(filePath)); // To remove the created files
		} catch (e) {
			logger.error("Exception in utilityService: exportToExcel: Create Directory/Remove file", e);
		}

		logger.debug(d.name);

		//create csv value
		var csv = datatable.map(row => Object.values(row));
		csv.unshift(Object.keys(datatable[0]));
		var finalcsv = csv.join('\n');

		//save it
		// fs.writeFileSync(filePath, finalcsv, function(err) {});
		fs.writeFile('./output/'+d.filename+'.csv', finalcsv, function (err) {
			if (err) return res.send('fail');
			res.writeHead(200, {'Content-Type': 'application/csv'});
			var rstream = fs.createReadStream(filePath);
			rstream.pipe(res);
		});
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}

};

exports.importDtFromXML = function (req, res) {
	const fnName = "importDtFromXML";
	logger.info("Inside UI service: " + fnName);
	try {
		var myXML = req.body.content;
		var row = "";
		var qObj = {};
		var rows = [];
		var columnNames = [];
		var newcols = [];
		var cols = [];

		var myXMLStr = myXML.replace(/\s/g,'');
		myXMLStr = myXMLStr.replace(/\<\?xml.*\?\>/, '');
		if(validator.isEmpty(myXMLStr)) return res.send("emptyData");
		const doc = new DOMParser().parseFromString(myXMLStr, "text/xml");
		if(req.body.row != undefined && req.body.row != "") row = req.body.row;
		else row = doc.firstChild.nodeName;
		var allrows = doc.getElementsByTagName(row);
		if(allrows.length==0) return res.send("emptyRow");
		if(allrows.length >200) return res.send("rowExceeds");
		if(req.body.column!=undefined && req.body.column.length>0) cols = req.body.column.split(';');

		for( var i=0;i<allrows.length;++i) {
			var newObj = {};
			var alltags = allrows[i].childNodes; 
			for(var j=0;alltags.length>0 && j<alltags.length;++j) {
				let name = alltags[j].nodeName;
				if(alltags[j].nodeType ==1 && checkForNesting(alltags[j]))  return res.send("nestedXML");
				else {
					if(!(cols.length>0 && !cols.includes(name))) {
						if(columnNames.includes(name))	{
							for(var k=0;k<columnNames.length;++k) {
								if(newcols[k].name==name) {
									newObj[newcols[k].id] = '';
									if(alltags[j].childNodes.length>0) {
										newObj[newcols[k].id] = alltags[j].childNodes[0].nodeValue;
										break;
									} 
								}
							}
						}
						else {
							ob = {id: uuid(), name: alltags[j].nodeName}
							columnNames.push(ob.name)
							newcols.push(ob)
							newObj[ob.id] = '';
							if(alltags[j].childNodes.length>0) newObj[ob.id] = alltags[j].childNodes[0].nodeValue;
						}
					}
				}
			}
			if (alltags.length>0) rows.push(newObj);
		}
		if((req.body.column!=undefined && req.body.column.length>0 && cols.length>50) || newcols.length>50) {
			return res.send("columnExceeds");
		} 
		if (rows.length==0) return res.send("emptyRow")
		if(cols.length>0 && newcols.length==0) return res.send("invalidcols");
		qObj['datatable'] = rows;
		qObj['dtheaders'] = newcols;
		res.status(200).send(qObj);
	} catch(exception) {
		logger.error("Error occurred in utility/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

function checkForNesting (elemTag) {
	var childN = elemTag.childNodes;
	for (var k=0; k<childN.length; ++k) {
		if (childN[k].nodeType == 1) return true;
	}
	return false;
};

exports.exportToDtXML = async (req, res) => {
	const fnName = "exportToXML";
	logger.info("Inside UI service: " + fnName);
	try {
		logger.info("Fetching Datatable details");
		var d = req.body;
		var xmlMap = await getDatatable({"name":d.name, 'action': "datatable"})
		dts = xmlMap[0];
		datatable = dts.datatable;
		logger.info("Writing Datatable structure to XML");
		var dir = './../../output';
		var excelDirPath = path.join(__dirname, dir);
		var filePath = path.join(excelDirPath, d.filename+".xml");

		try {
			if (!fs.existsSync(excelDirPath)) fs.mkdirSync(excelDirPath); // To create directory for storing excel files if DNE.
			if (fs.existsSync(filePath)) fs.unlinkSync(path.join(filePath)); // To remove the created files
		} catch (e) {
			logger.error("Exception in utilityService: exportToExcel: Create Directory/Remove file", e);
		}

		logger.debug(d.name);

		var doc = OBJtoXML(datatable);

		//save it
		fs.writeFile('./output/'+d.filename+'.xml', doc, function (err) {
			if (err) return res.send('fail');
			res.writeHead(200, {'Content-Type': 'text/xml'});
			var rstream = fs.createReadStream(filePath);
			rstream.pipe(res);
		});
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}

};

function OBJtoXML(obj) {
    var xml = '<?xml version="1.0" encoding="utf-8"?>\n';
    for (var i=0;i<obj.length;++i) {
		xml += "<row>\n"
		if(i==0) {
			columnNames = Object.keys(obj[i]);
		}
		for (var j=0;j<columnNames.length;++j) {
			xml += "\t<" + columnNames[j] + ">"+ obj[i][columnNames[j]] +"</" + columnNames[j] + ">\n";
		}
		xml += "</row>\n"
	}
    return xml
}

/*exports.pairwise_ICE = function (req, res) {
	var abc = {}
	abc.key = req.body.dataObj;
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log("IP:", ip);
	var name = req.session.username;
	console.log(Object.keys(myserver.allSocketsMap), "<<all people, asking person:", name);
	if ('allSocketsMap' in myserver && name in myserver.allSocketsMap) {
		var mySocket = myserver.allSocketsMap[name];
		mySocket._events.pairwise = [];
		//mySocket.send(dataObj);
		mySocket.emit("pairwise", abc); //Sending
		//Receiving
		mySocket.on('result_pairs', function (data) {
			res.send(data);
		});
	} else {
		console.log("Socket not Available");
		res.send("unavailableLocalServer");
	}
}*/

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

