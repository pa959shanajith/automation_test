var create_ice = require('../controllers/create_ice');
var logger = require('../../logger');
//getProjectIds
exports.getProjectIDs_Nineteen68 = function (req, res) {
	logger.info("Inside UI service: getProjectIDs_Nineteen68");
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
			req.session.userObj = req.body;
		logger.info("Calling UI Service getProjectIDs_Nineteen68 from create_ice");
		create_ice.getProjectIDs_Nineteen68(req.session.userObj, function (err, data) {
			if (err) {
		logger.info("Error in getProjectIDs_Nineteen68 from create_ice");
				logger.error(err);
				res.send('fail');
			} else {
				logger.info("Project details fetched successfully");
				res.send(data);
			}
		});
	} else {
		logger.info("Invalid Session");
		res.send("Invalid Session");
	}
};
