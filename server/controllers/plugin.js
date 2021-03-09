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

exports.updateAccessibilitySelection = async function(req, res){
	logger.info("Inside UI service: updateAccessibiltySelection");
	var status = "fail";
	try{
		var result = await utils.fetchData(req.body,"/plugins/updateAccessibilitySelection");
		if(result != 'fail') status = "success";
		return res.send(status);
	}catch(e){
		logger.error("Error occurred in updateAccessibilitySelection: %s", e);
		return res.send("fail");
	}
}
