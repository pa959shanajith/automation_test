var crypto = require('crypto');
var myserver = require('../../server');
// var PythonShell = require('python-shell');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.DAS_URL;
var sessionExtend = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes 
var validator =  require('validator');
var xl = require('excel4node');
var xlsx = require('xlsx');
var path = require('path');
var fs = require('fs');
var logger = require('../../logger');
var utils = require('../lib/utils');

exports.Encrypt_ICE = function getDomains_ICE(req, res) {
	try {
		logger.info("Inside UI service: Encrypt_ICE");
		if (utils.isSessionActive(req)) {
			var methodSelected = req.body.encryptionType;
			var encrytData = req.body.encryptionValue;
			var encryptedValue,check_encryptionType;
			var validate_encryptionType,validate_check_encryptData;
			var regEx=/[<">']/;
			validateEncryption();
			function validateEncryption()
			{
				logger.info("Inside function validateEncryption");
				check_encryptionType = validator.isEmpty(methodSelected);
				if(check_encryptionType == false)
				{
					validate_encryptionType = true;
				}
				check_encryptData = validator.isEmpty(encrytData);
				if(check_encryptData == false || !regEx.test(encrytData))
				{
					validate_check_encryptData = true;
				}
			}
			if(validate_encryptionType == true && validate_check_encryptData == true)
					{

			try{
				// if (methodSelected === 'undefined') {
				// 	res.send("fail");
				// }
				// else
				if(methodSelected == "AES"){
					try{
						// var dirName = __dirname.split("\\");
						// 	dirName.pop();
						// 	dirName.pop();
						// 	dirName.push("Portable_python");
						// 	var strPath = dirName.join("\\");
						// 	console.log(strPath);

							// var dir_name = __dirname.split("\\");
							// dir_name.pop();
							// dir_name.pop();
							// dir_name.push("Portable_python");
							// dir_name.push("python");
							// var pyPath = dir_name.join("\\");
							// console.log(pyPath);

						// var options = {
						// 	mode: 'text',
						// 	pythonPath:pyPath,
						// 	scriptPath: strPath,
						// 	args: [encrytData]
						// 	};
						var args = {
							data: req.body.encryptionValue,
							headers:{'Content-Type': 'plain/text'}
						};
						// PythonShell.run("AES_encryption.py", options, function (err, results) {
							logger.info("Calling DAS Service : utility/encrypt_ICE/aes");
						client.post(epurl+"utility/encrypt_ICE/aes",args,
							function (results, response) {
							// if (err){
								if(response.statusCode != 200){
								logger.error("Error occurred in encrypt_ICE Error Code : ERRDAS");
								res.send("fail");
							}else{
									// results is an array consisting of messages collected during execution
									// console.log('results: %j', results);
									// encryptedValue = results[2];
									if(results.rows != "fail"){
										encryptedValue = results.rows;
										logger.info("Data encrypted successfully");
										// console.log(encryptedValue);
										res.send(encryptedValue);
									}else{
										res.send("fail");
									}
							}
						});

					}catch(exception){
						logger.error(exception.message);
						res.send("fail");
					}
				}else if(methodSelected == "MD5"){
					try{
						encryptedValue = crypto.createHash('md5').update(encrytData).digest("hex");
					} catch(exception){
						logger.error(exception.message);
						res.send("fail");
					}
						logger.info("Data encrypted successfully");
					res.send(encryptedValue);
				}else if(methodSelected == "Base64"){
					try{
						var buffer = new Buffer(encrytData);
						var encryptedValue = buffer.toString('base64');
					} catch(exception){
					    logger.error(exception.message);
						res.send("fail");
					}
					logger.info("Data encrypted successfully");
					res.send(encryptedValue);
				}else{
					res.send("fail");
				}
			} 
			catch(exception){
				logger.error(exception.message);
			} }else{
				res.send("fail");
			}
		}
		else{
			res.send("Invalid Session");
		}
	}catch (exception) {
		logger.error(exception.message);
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
			var cSheetRow = cSheet.split('\n');
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
				if ( k != 0) {
					for (var i = 1; i < row.length; i++) {
						newObj = {};
						for(var j=0; j<columnNames.length; ++j) {
							newObj[columnNames[j]] = row[j]
						}
						rows.push(newObj);
					}
				}
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

exports.exportToExcel = async (req, res) => {
	const fnName = "exportToExcel";
	logger.info("Inside UI service: " + fnName);
	try {
		logger.info("Fetching Module details");
		var d = req.body;
		var excelMap = await getDatatable({"datatablename":d.datatablename, 'action': 'datatable'})
		dts = excelMap[0];
		datatable = dts.datatable;
		logger.info("Writing Datatable structure to Excel");
		var dir = './../../excel';
		var excelDirPath = path.join(__dirname, dir);
		var filePath = path.join(excelDirPath, d.filename+'.xlsx');

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
			} else {
				for(var j=1;j<=keys.length;++j) {
					rowVal = datatable[i-1][keys[j-1]]
					ws.cell(i,j).string(rowVal);
				}
			}
		}
		//save it
		wb.write('./excel/'+d.filename+'.xlsx',function (err) {
			if (err) return res.send('fail');
			res.writeHead(200, {'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
			var rstream = fs.createReadStream(filePath);
			rstream.pipe(res);
		});
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}

};

exports.exportToCSV = async (req, res) => {
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
		fs.writeFileSync('./csv/'+d.filename+'.csv', finalcsv, function (err) {
			if (err) return res.send('fail');
			res.writeHead(200, {'Content-Type': 'text/csv'});
			var rstream = fs.createReadStream(filePath);
			rstream.pipe(res);
		});
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}

};

/*exports.pairwise_ICE = function (req, res) {
	if (utils.isSessionActive(req)) {
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