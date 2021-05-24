exports.createDataTable = async(req, res) => {
	logger.info("Inside UI service: createDataTable");
	try {
		// Get data table name, data table rows and column values
		var username = req.session.username;
		var datatablename = req.body.datatablename;
		// OLD
		// var datatable = [
		// 	["Module", "Scenario", "Screen", "Script"],
		// 	["Dummy_module","Dummy","Dummy_Screen_2","Dummy_TestCase_2"],
		// 	["Dummy","","Dummy_Screen_1","Dummy_Testcase_1"]
		// ]
		// NEW
		// [{"A":"a","B":"b"},
		// {"A":"a1","B":"b1"},
		// {"A":"a2","B":"b2"}]
		var datatable = req.body.datatable;
		var inputs = {
			"datatablename": datatablename,
			"datatable": datatable
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		client.post(epurl + "utility/createDataTable", args,
        function(respdata, response) {
            if (response.statusCode != 200 || respdata.rows == "fail") {
                logger.error("Error occurred in utility/createDataTable from createDataTable Error Code : ERRDAS");
			} 
			res.send(response);
        });
	} catch (exception) {
        logger.error("Exception in the service createDataTable - Error: %s", exception);
        res.send("fail");
    }
};

exports.editDataTable = async(req, res) => {
	logger.info("Inside UI service: editDataTable");
	try {
		// Get data table name, data table rows and column values
		var username = req.session.username;
		var datatablename = req.body.datatablename;
		var datatable = req.body.datatable;
		var inputs = {
			"datatablename": datatablename,
			"datatable": datatable
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};
		client.post(epurl + "utility/editDataTable", args,
        function(respdata, response) {
            if (response.statusCode != 200 || respdata.rows == "fail") {
                logger.error("Error occurred in utility/editDataTable from editDataTable Error Code : ERRDAS");
                return false;
            } else {
                return true;
            }
        });
	} catch (exception) {
        logger.error("Exception in the service editDataTable - Error: %s", exception);
        res.send("fail");
    }
};

exports.deleteDataTable = async(req, res) => {
	logger.info("Inside UI service: deleteDataTable");
	try {
		// Get data table name, data table rows and column values
		var username = req.session.username;
		var datatablename = req.body.datatablename;
		//Check for referenced tables
		var inputs = {
			"datatablename": datatablename
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};

		//If referenced give warning

		// res.send("referenceExist");

		//end
		client.post(epurl + "utility/deleteDataTable", args,
        function(respdata, response) {
            if (response.statusCode != 200 || respdata.rows == "fail") {
                logger.error("Error occurred in utility/deleteDataTable from deleteDataTable Error Code : ERRDAS");
                return false;
            } else {
                return true;
            }
        });
	} catch (exception) {
        logger.error("Exception in the service deleteDataTable - Error: %s", exception);
        res.send("fail");
    }
};

exports.deleteDataTableConfirm = async(req, res) => {
	logger.info("Inside UI service: deleteDataTable");
	try {
		// Get data table name, data table rows and column values
		var username = req.session.username;
		var datatablename = req.body.datatablename;
		//Check for referenced tables
		var inputs = {
			"datatablename": datatablename,
			"action" : "deleteConfirm"
		};
		var args = {
			data: inputs,
			headers: {
				"Content-Type": "application/json"
			}
		};

		//If referenced give warning

		// res.send("referenceExist");

		//end
		client.post(epurl + "utility/deleteDataTable", args,
        function(respdata, response) {
            if (response.statusCode != 200 || respdata.rows == "fail") {
                logger.error("Error occurred in utility/deleteDataTable from deleteDataTable Error Code : ERRDAS");
                return false;
            } else {
                return true;
            }
        });
	} catch (exception) {
        logger.error("Exception in the service deleteDataTable - Error: %s", exception);
        res.send("fail");
    }
};
