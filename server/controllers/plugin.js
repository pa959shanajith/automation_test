var create_ice = require('../controllers/create_ice');
var logger = require('../../logger');
var utils = require('../lib/utils');

//getProjectIds
exports.getProjectIDs_Nineteen68 = function (req, res) {
	logger.info("Inside UI service: getProjectIDs_Nineteen68");
	if (utils.isSessionActive(req.session)) {
		logger.info("Calling UI Service getProjectIDs_Nineteen68 from create_ice");
		var obj = req.body;
		obj.userid = req.session.userid;
		create_ice.getProjectIDs_Nineteen68(obj, function (err, data) {
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
