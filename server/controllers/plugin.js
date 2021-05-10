var create_ice = require('../controllers/create_ice');
var logger = require('../../logger');
var utils = require('../lib/utils');

//getProjectIds
exports.getProjectIDs = async (req, res) =>{
	const fnName = "getModules";
	logger.info("Inside UI service: " + fnName);
	try {
		var obj = req.body;
		obj.userid = req.session.userid;
		const data  = await create_ice.getProjectIDs(obj)
		res.send(data)
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
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
