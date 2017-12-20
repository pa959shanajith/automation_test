var create_ice = require('../controllers/create_ice');
var logger = require('../../logger');

function isSessionActive(req){
	var sessionToken = req.session.uniqueId;
    return sessionToken != undefined && req.session.id == sessionToken;
}

//getProjectIds
exports.getProjectIDs_Nineteen68 = function (req, res) {
	logger.info("Inside UI service: getProjectIDs_Nineteen68");
	if (isSessionActive(req)) {
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
