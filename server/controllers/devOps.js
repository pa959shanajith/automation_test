var create_ice = require('../controllers/create_ice');
var logger = require('../../logger');
var utils = require('../lib/utils');
const { default: async } = require('async');

exports.fetchProjects =  async(req, res) => {
	const fnName = "fetchProjects";
	try {
		logger.info("Inside UI service: " + fnName);
		var reqData = {
			"userid": req.session.userid,
			"allflag": true
		};
		const data = await create_ice.getProjectIDs(reqData);
		res.send(data);
	} catch(exception) {
		logger.error("Error occurred in devops/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};


const getModule = async (d) => {
	const inputs = {
		"tab":d.tab,
		"projectid":d.projectid || null,
		"cycleid":d.cycId,
		"name":"getModules"
	}
	return utils.fetchData(inputs, "mindmap/getModules", "fetchModules");
};

exports.fetchModules = async (req, res) => {
	const fnName = "fetchModules";
	logger.info("Inside UI service: " + fnName);
	try {
		const moduleData = await getModule(req.body);
		const finalData = await utils.fetchData(moduleData, "devops/getScenariosForDevops", "fetchModules");
		const responsedata = {
			'normalExecution': [],
			'batchExecution': {},
			'e2eExecution': [],
		}
		for(let [index,moduleDetails] of finalData.entries()) {
			moduleDetails['type'] = moduleData[index].type;
			if(moduleData[index].type == 'basic'){
				responsedata['normalExecution'].push(moduleDetails);
			} else {
				responsedata['e2eExecution'].push(moduleDetails);
			}
			if(moduleDetails['batchname'] == '') continue;
			if(responsedata['batchExecution'][moduleDetails['batchname']] == undefined){
				responsedata['batchExecution'][moduleDetails['batchname']] = [];
			}
			responsedata['batchExecution'][moduleDetails['batchname']].push(moduleDetails);
		}


		res.send(responsedata);
	} catch(exception) {
		logger.error("Error occurred in devops/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};
exports.storeConfigureKey = async(req,res) => {
	const fnName = "storeConfigureKey";
	try {
		logger.info("Inside UI Service: " + fnName);
		console.log(req.body);
		const inputs = {
			"executionData": req.body.executionData,
			"session": req.session,
			"query": "saveConfigureKey"
		};
		const status = await utils.fetchData(inputs, "devops/configurekey", fnName);
		if (status == "fail" || status == "forbidden") return res.send("fail");
		else res.send(status);
	} catch (exception) {
		logger.error(exception.message);
		return res.send("fail");
	}
}

// exports.storeConfigureKey = async(req,res) => {
// 	const fnName = "avo_ExecAutomation";
// 	try {
// 		console.log('New Thing!!');
// 		logger.info("Inside UI Service: " + fnName);
// 		// const userDetails = req.body.userDetails;
// 		// const username = req.session.username;
// 		// const uId = req.session.userid;
// 		// const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
// 		const inputs = {
// 			"key": req.body.key,
// 			"query": "fetchKeyDetails"
// 		};
// 		const status = await utils.fetchData(inputs, "devops/configureKey", fnName);
// 		if (status == "fail" || status == "forbidden") return res.send("fail");
// 		else res.send(status);
// 	} catch (exception) {
// 		logger.error(exception.message);
// 		return res.send("fail");
// 	}
// }

exports.getExecScenario = async(req,res) => {
	const fnName = "avo_getExecScenario";
	try {
		console.log('New Thing2!!');
		logger.info("Inside UI Service: " + fnName);
		// const userDetails = req.body.userDetails;
		// const username = req.session.username;
		// const uId = req.session.userid;
		// const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		const inputs = {
			"key": req.body.moduleDetail.key,
			"moduleid": req.body.moduleDetail.moduleid,
			"query": "fetchKeyDetails"
		};
		const status = await utils.fetchData(inputs, "devops/getExecScenario", fnName);
		if (status == "fail" || status == "forbidden") return res.send("fail");
		else res.send(status);
	} catch (exception) {
		logger.error(exception.message);
		return res.send("fail");
	}
}

//To get all the projects and their releases & cycles
exports.getAllSuites_ICE = async (req, res) => {
    const fnName = "getAllSuites_ICE";
    logger.info("Inside UI service: " + fnName);
    try {
        var requestedaction = req.body.readme;
        if (requestedaction == 'projects' || requestedaction == 'reports') {
            const inputs = {
                "query": "projects",
                "userid": req.session.userid
            };
            const result = await utils.fetchData(inputs, "reports/getAllSuites_ICE", fnName);
            if (result == "fail") return res.send("fail");
            res.send(result);
        } else {
            logger.error("Error occurred in report/"+fnName+": Invalid input fail");
            res.send('Invalid input fail');
        }
   } catch (exception) {
     logger.error("Error occurred in report/"+fnName+":", exception);
     res.send("fail");
  }
};

exports.getConfigureList = async (req, res) => {
	const fnName = "getConfigureList";
	logger.info("Inside UI service: " + fnName);
	try {
		// const reqData = req.session.userid;
		const input = {
			userid: req.session.userid
		}
		const list = await utils.fetchData(input, "devops/getConfigureList", "getConfigureList");
		res.send(list);
	} catch(exception) {
		logger.error("Error occurred in devops/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.getAvoAgentAndAvoGridList = async (req, res) => {
	const fnName = "getAvoAgentAndAvoGridList";
	logger.info("Inside UI service: " + fnName);
	try {
		// const reqData = req.session.userid;
		const input = {
			userid: req.session.userid,
			query: req.body.query
		}
		const list = await utils.fetchData(input, "devops/getAvoAgentAndAvoGridList", "getAvoAgentAndAvoGridList");
		res.send(list);
	} catch(exception) {
		logger.error("Error occurred in devops/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.deleteConfigureKey = async(req,res) => {
	const fnName = "deleteConfigureKey";
	try {
		console.log('something');
		logger.info("Inside UI Service: " + fnName);
		const inputs = {
			"key": req.body.key,
			"query": "deleteConfigureKey"
		};
		const status = await utils.fetchData(inputs, "devops/deleteConfigureKey", fnName);
		if (status == "fail" || status == "forbidden") return res.send("fail");
		else res.send(status);
	} catch (exception) {
		logger.error(exception.message);
		return res.send("fail");
	}
}
exports.deleteAvoGrid = async(req,res) => {
	const fnName = "deleteAvoGrid";
	try {
		console.log('something');
		logger.info("Inside UI Service: " + fnName);
		const inputs = req.body;
		const status = await utils.fetchData(inputs, "devops/deleteAvoGrid", fnName);
		if (status == "fail" || status == "forbidden") return res.send("fail");
		else res.send(status);
	} catch (exception) {
		logger.error(exception.message);
		return res.send("fail");
	}
}

exports.saveAvoAgent = async(req,res) => {
	const fnName = "saveAvoAgent";
	try {
		console.log('something');
		logger.info("Inside UI Service: " + fnName);
		// const userDetails = req.body.userDetails;
		// const username = req.session.username;
		// const uId = req.session.userid;
		// const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		const inputs = req.body
		const status = await utils.fetchData(inputs, "devops/saveAvoAgent", fnName);
		if (status == "fail" || status == "forbidden") return res.send("fail");
		else res.send(status);
	} catch (exception) {
		logger.error(exception.message);
		return res.send("fail");
	}
}
exports.saveAvoGrid = async(req,res) => {
	const fnName = "saveAvoGrid";
	try {
		console.log('something');
		logger.info("Inside UI Service: " + fnName);
		// const userDetails = req.body.userDetails;
		// const username = req.session.username;
		// const uId = req.session.userid;
		// const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		const inputs = req.body
		const status = await utils.fetchData(inputs, "devops/saveAvoGrid", fnName);
		if (status == "fail" || status == "forbidden") return res.send("fail");
		else res.send(status);
	} catch (exception) {
		logger.error(exception.message);
		return res.send("fail");
	}
}

// exports.getAvoAgentAndAvoGridList = async (req, res) => {
// 	const fnName = "getAvoAgentAndAvoGridList";
// 	logger.info("Inside UI service: " + fnName);
// 	try {
// 		// const reqData = req.session.userid;
// 		const input = {
// 			fetchData: req.body,
// 			query: 'CICD'
// 		}
// 		const list = await utils.fetchData(input, "devops/getAvoAgentAndAvoGridList", "getAvoAgentAndAvoGridList");
// 		res.send(list);
// 	} catch(exception) {
// 		logger.error("Error occurred in devops/"+fnName+":", exception);
// 		return res.status(500).send("fail");
// 	}
// };
exports.fetchModuleListDevopsReport =  async(req, res) => {
	const fnName = "fetchModuleListDevopsReport";
	try {
		logger.info("Inside UI service: " + fnName);
		var input = {
			"configurekey": req.body.configkey,
			"executionListId": req.body.executionListId
		};
		const list = await utils.fetchData(input, "devops/fetchModuleListDevopsReport", "fetchModuleListDevopsReport");
		res.send(list);
	} catch(exception) {
		logger.error("Error occurred in devops/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};