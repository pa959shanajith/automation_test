//var dbConnICE = require('../../server/config/icetestautomation');
var taskJson = require('../controllers/taskJson');
var create_ice = require('../controllers/create_ice');

//getProjectIds
exports.getProjectIDs_Nineteen68 = function (req, res) {
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
		create_ice.getProjectIDs_Nineteen68(req.body, function (err, data) {
			if (err) {
				console.log(err);
				res.send('fail');
			} else {
				//console.log('user_task_json',data);
				res.send(data);
			}
		});
	} else {
		res.send("Invalid Session");
	}
};

//get Task json
exports.getTaskJson_Nineteen68 = function (req, res) {
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
		req.body.obj.urlData = req.get('host');
		taskJson.getTaskJson_mindmaps(req.body.obj, function (err, data) {
			if (err) {
				console.log(err);
				res.send('fail');
			} else {
				// console.log('user_task_json',data);
				res.send(data);
			}
		});
	} else {
		res.send("Invalid Session");
	}
};
