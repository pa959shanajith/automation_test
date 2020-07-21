/**
 * Dependencies.
 */
var async = require('async');
var Client = require("node-rest-client").Client;
var client = new Client();
var logger = require('../../logger');
var epurl = process.env.NDAC_URL;

//Create Structure
exports.saveMindmap = function(req,res) {
	logger.info("Inside UI service: saveMindmap");
	var createdthrough = 'Mindmaps Creation';
	var RequestedJSON = req;
	if (RequestedJSON.from_version != undefined && RequestedJSON.new_version !=undefined) {
		versionnumber = RequestedJSON.from_version;
		newversionnumber = RequestedJSON.new_version;
	}
	var inputs = {
		"data": RequestedJSON 
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	client.post(epurl+"create_ice/saveMindmap", args,
		function (result, response) {
		if (response.statusCode != 200 || result.rows == "fail") {
			logger.error("Error occurred in create_ice/saveMindmap: saveMindmap, Error Code : ERRNDAC");
			res(null, result);
		} else if (result.rows == "reuseerror") {
			result.rows = "fail";
			res(null, result);
		} else {
			projectdetails=result.rows;
			// callback();
			res(null, result.rows);
		}
	});
	var cloneflag = RequestedJSON.action;
	var suiteflag = false;
}

exports.saveMindmapE2E = function(req,res) {
	logger.info("Inside UI service: saveMindmapE2E");
	var createdthrough = 'Mindmaps Creation';
	var RequestedJSON = req;
	if (RequestedJSON.from_version != undefined && RequestedJSON.new_version !=undefined) {
		versionnumber = RequestedJSON.from_version;
		newversionnumber = RequestedJSON.new_version;
	}

	var inputs = {
		"data": RequestedJSON 
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};

	client.post(epurl+"create_ice/saveMindmapE2E", args,
		function (result, response) {
		if (response.statusCode != 200 || result.rows == "fail") {
			logger.error("Error occurred in create_ice/saveMindmapE2E: saveMindmapE2E, Error Code : ERRNDAC");
			res(null, result);
		} else {
			projectdetails=result.rows;
			// callback();
			res(null, result.rows);
		}
	});
}

// Have to check the result object how it is coming and how we need. 
exports.getProjectIDs = function (req, res) {
	logger.info("Inside UI service: getProjectIDs");
	var projectdetails = {
		projectId: [],
		projectName: [],
		appType: []
	};
	var user_id = req.userid;
	var allflag = req.allflag;
	if (allflag) allflag = "allflag";
	else allflag = "emptyflag";
	var inputs = {
		"userid": user_id,
		"query": allflag
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	async.series({
		function (callback) {
			logger.info("Calling NDAC Service from getProjectIDs: create_ice/getProjectIDs");
			client.post(epurl+"create_ice/getProjectIDs", args,
				function (result, response) {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in create_ice/getProjectIDs: getProjectIDs, Error Code : ERRNDAC");
					res(null, result.rows);
				} else {
					projectdetails=result.rows;
					callback();
				}
			});
		}
	}, function (err, results) {
		try {
			res(null, projectdetails);
		} catch (ex) {
			logger.info("Exception in the service getProjectIDs: ", ex);
		}
	});
};

// Have to check the result object how it is coming and how we need. 
exports.getProjectType = function (req, res) {
	logger.info("Inside UI service: getProjectType");
	var projectDetails = {
		projectType: '',
		project_id: ''
	};
	var project_id = req;
	var inputs = {
		"projectid": project_id
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from getProjectType: create_ice/getProjectType");
	client.post(epurl+"create_ice/getProjectType", args,
		function (result, response) {
		try {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occurred in create_ice/getProjectType: getProjectType, Error Code : ERRNDAC");
				res(null, result.rows);
			} else {
				if (result.rows.length != 0) {
					// projectDetails.projectType = result.rows[0].projecttypeid;
					// projectDetails.project_id = req;
					// projectDetails.project_typename = result.projecttype[0].projecttypename;
					projectDetails.projectType=result.rows[0]["type"];
					projectDetails.projectid=result.rows[0]["_id"];
					projectDetails.project_typename=result.projecttype[0].name;
					projectDetails.releases=result.rows[0].releases;
					projectDetails.domains=result.rows[0].domain;
				}
				res(null, projectDetails);
			}
		} catch (ex) {
			logger.error("Exception in the service getProjectType: %s", ex);
		}
	});
};

exports.submitTask = function (req, res) {
	logger.info("Inside UI service: submitTask");
	var taskdetails = req.taskdetails;
	var inputs = {
		'status': req.status,
		'table': taskdetails.labels[0],
		'details': taskdetails.properties,
		'username': req.user,
		'versionnumber': req.versionnumber
	};
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling NDAC Service from submitTask: create_ice/submitTask");
	client.post(epurl+"create_ice/submitTask", args,
		function (result, response) {
			try {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in create_ice/submitTask: submitTask, Error Code : ERRNDAC");
					res(null, result.rows);
				} else {
					logger.info("Task submitted successfully");
				}
			} catch (ex) {
				logger.error("Exception in the service submitTask: %s", ex);
			}
		});
};
