var create_ice = require('../controllers/create_ice');
var logger = require('../../logger');

//getProjectIds
exports.getProjectIDs = async (req, res) =>{
	logger.info("Inside UI service: getProjectIDs");
	var obj = req.body;
	obj.userid = req.session.userid;
	const data  = await create_ice.getProjectIDs(obj)
	res.send(data)
};
