/**
 * Dependencies.
 */
var async = require('async');
var utils = require('../lib/utils');
var logger = require('../../logger');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = process.env.DAS_URL;

let headers
module.exports.setReq = async (req) =>
{
	headers=req;
}
//Create Structure
exports.saveMindmap = function(req,res) {
	logger.info("Inside UI service: saveMindmap");
	var RequestedJSON = req;
	if (RequestedJSON.from_version != undefined && RequestedJSON.new_version !=undefined) {
		versionnumber = RequestedJSON.from_version;
		newversionnumber = RequestedJSON.new_version;
	}
	var inputs = {
		"data": RequestedJSON 
	};
	inputs.host = headers.headers.host;
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	client.post(epurl+"create_ice/saveMindmap", args,
		function (result, response) {
		if (response.statusCode != 200 || result.rows == "fail") {
			logger.error("Error occurred in create_ice/saveMindmap: saveMindmap, Error Code : ERRDAS");
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
}

exports.saveMindmapE2E = function(req,res) {
	logger.info("Inside UI service: saveMindmapE2E");
	var RequestedJSON = req;
	var inputs = {
		"data": RequestedJSON 
	};
	inputs.host = headers.headers.host;
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	client.post(epurl+"create_ice/saveMindmapE2E", args,
		function (result, response) {
		if (response.statusCode != 200 || result.rows == "fail") {
			logger.error("Error occurred in create_ice/saveMindmapE2E: saveMindmapE2E, Error Code : ERRDAS");
			res(null, result);
		} else {
			projectdetails=result.rows;
			// callback();
			res(null, result.rows);
		}
	});
}

// Have to check the result object how it is coming and how we need. 
exports.getProjectIDs =  async(req) => {
	logger.info("Inside UI service: getProjectIDs");
	var user_id = req.userid;
	var user_role = req.userrole;
	var allflag = req.allflag;
	if (allflag) allflag = "allflag";
	else allflag = "emptyflag";
	var inputs = {
		"userid": "642d1fe9006f0038089831dd",
		"userrole": 'Test Lead',
		"query": allflag
	};
	return await utils.fetchData(inputs, "create_ice/getProjectIDs", "getProjectIDs");
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
	inputs.host = headers.headers.host;
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling DAS Service from getProjectType: create_ice/getProjectType");
	client.post(epurl+"create_ice/getProjectType", args,
		function (result, response) {
		try {
			if (response.statusCode != 200 || result.rows == "fail") {
				logger.error("Error occurred in create_ice/getProjectType: getProjectType, Error Code : ERRDAS");
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
	inputs.host = headers.headers.host;
	var args = {
		data: inputs,
		headers: {
			"Content-Type": "application/json"
		}
	};
	logger.info("Calling DAS Service from submitTask: create_ice/submitTask");
	client.post(epurl+"create_ice/submitTask", args,
		function (result, response) {
			try {
				if (response.statusCode != 200 || result.rows == "fail") {
					logger.error("Error occurred in create_ice/submitTask: submitTask, Error Code : ERRDAS");
					res(null, result.rows);
				} else {
					logger.info("Task submitted successfully");
				}
			} catch (ex) {
				logger.error("Exception in the service submitTask: %s", ex);
			}
		});
};
