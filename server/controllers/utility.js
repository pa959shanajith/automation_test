var crypto = require('crypto');
var myserver = require('../../server');
// var PythonShell = require('python-shell');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.DAS_URL;
var sessionExtend = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
var validator =  require('validator');
var DOMParser = require('xmldom').DOMParser;
var xl = require('excel4node');
var xlsx = require('xlsx');
var path = require('path');
var fs = require('fs');
var logger = require('../../logger');
var utils = require('../lib/utils');

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
		var datatablename = req.body.datatablename;
		var action = req.body.action;
		var inputs = {
			datatablename: datatablename,
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
		var dts = await getDatatable({"datatablename":d.datatablename, "action":d.action})
		res.send(dts);
	} catch(exception) {
		logger.error("Error occurred in utility/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

const getDatatable = async (d) => {
	const inputs = {
		"datatablename": d.datatablename,
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
		var myCSV = xlsToCSV(wb1, req.body.sheetname);
		var numSheets = myCSV.length / 2;
		var qObj = {};
		if (numSheets == 0) {
			return res.status(200).send("emptySheet");
		}
		rows = [];
		for (var k = 0; k < numSheets; k++) {
			var cSheet = myCSV[k * 2 + 1];
			var cSheetRow = cSheet.trimEnd().split('\n');
			if (k == 0) {
				columnNames = cSheetRow[k].split(',');
			} 
			if(columnNames.length>10) {
				return res.status(500).send("columnExceeds");
			}
			if(cSheetRow.length >200) {
				return res.status(500).send("rowExceeds");
			}
			for (var i = 1; i < cSheetRow.length; i++) {
				var row = cSheetRow[i].split(',');
				newObj = {};
				for(var j=0; j<columnNames.length; ++j) {
					newObj[columnNames[j]] = row[j]
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

exports.importDtFromCSV = function (req, res) {
	const fnName = "importDtFromExcel";
	logger.info("Inside UI service: " + fnName);
	try {
		var myCSV = req.body.content;
		var qObj = {};
		var csvArray = myCSV.split('\n');
		if (csvArray.length > 200) {
			return res.status(500).send("rowExceeds");
		}
		rows = [];
		for (var k = 0; k < csvArray.length; k++) {
			if (k == 0) {
				columnNames = csvArray[k].split(',');
				if(columnNames.length>10) {
					return res.status(500).send("columnExceeds");
				}
			} else  { 
				var row = csvArray[k].split(',');
				newObj = {};
				for (var i = 0; i < row.length; i++) {
					newObj[columnNames[i]] = row[i];
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
		var excelMap = await getDatatable({"datatablename":d.datatablename, 'action': 'datatable'})
		dts = excelMap[0];
		datatable = dts.datatable;
		excelType = d.excelType;
		logger.info("Writing Datatable structure to Excel");
		var dir = './../../excel';
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

		logger.debug(d.datatablename);

		//create the new worksheet with coloumns and rows specified in data
		for (var i=1;i<=datatable.length;i++) {
			if(i==1) {
				keys = Object.keys(datatable[0]);
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
		wb.write('./excel/'+d.filename+'.'+excelType,function (err) {
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
		var csvMap = await getDatatable({"datatablename":d.datatablename, 'action': "datatable"})
		dts = csvMap[0];
		datatable = dts.datatable;
		logger.info("Writing Datatable structure to CSV");
		var dir = './../../csv';
		var csvDirPath = path.join(__dirname, dir);
		var filePath = path.join(csvDirPath, d.filename+'.csv');

		try {
			if (!fs.existsSync(csvDirPath)) fs.mkdirSync(csvDirPath); // To create directory for storing csv files if DNE.
			if (fs.existsSync(filePath)) fs.unlinkSync(path.join(filePath)); // To remove the created files
		} catch (e) {
			logger.error("Exception in utilityService: exportToExcel: Create Directory/Remove file", e);
		}

		logger.debug(d.datatablename);

		//create csv value
		var csv = datatable.map(row => Object.values(row));
		csv.unshift(Object.keys(datatable[0]));
		var finalcsv = csv.join('\n');

		//save it
		// fs.writeFileSync(filePath, finalcsv, function(err) {});
		fs.writeFile('./csv/'+d.filename+'.csv', finalcsv, function (err) {
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
		var myXMLStr = myXML.replace(/\s/g,'');
		var qObj = {};
		const doc = new DOMParser().parseFromString(myXMLStr, "text/xml");
		var allrows = doc.getElementsByTagName("row");
		var rows = [];
		var columnNames = [];
		for( var i=0;i<allrows.length;++i) {
			var newObj = {};
			var alltags = allrows[i].childNodes;
			for (var j=0;j<alltags.length;++j) {
				if(i==0) {
					columnNames.push(alltags[j].nodeName);
				}
				newObj[alltags[j].nodeName] = alltags[j].childNodes[0].nodeValue;
			}
			rows.push(newObj);
		}
		qObj['datatable'] = rows;
		qObj['dtheaders'] = columnNames;
		res.status(200).send(qObj);
	} catch(exception) {
		logger.error("Error occurred in utility/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.exportToDtXML = async (req, res) => {
	const fnName = "exportToXML";
	logger.info("Inside UI service: " + fnName);
	try {
		logger.info("Fetching Datatable details");
		var d = req.body;
		var xmlMap = await getDatatable({"datatablename":d.datatablename, 'action': "datatable"})
		dts = xmlMap[0];
		datatable = dts.datatable;
		logger.info("Writing Datatable structure to XML");
		var dir = './../../xml';
		var excelDirPath = path.join(__dirname, dir);
		var filePath = path.join(excelDirPath, d.filename+".xml");

		try {
			if (!fs.existsSync(excelDirPath)) fs.mkdirSync(excelDirPath); // To create directory for storing excel files if DNE.
			if (fs.existsSync(filePath)) fs.unlinkSync(path.join(filePath)); // To remove the created files
		} catch (e) {
			logger.error("Exception in utilityService: exportToExcel: Create Directory/Remove file", e);
		}

		logger.debug(d.datatablename);

		var doc = OBJtoXML(datatable);

		//save it
		fs.writeFile('./xml/'+d.filename+'.xml', doc, function (err) {
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