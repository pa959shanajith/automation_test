// var PythonShell = require('python-shell');
const utils = require('../lib/utils');
const logger = require('../../logger');

exports.getTopMatches_ProfJ = async (req, res) => {
    const fnName = "getTopMatches_ProfJ";
	logger.info("Inside UI service: " + fnName);
	try {
        const inputs = {
            data: req.body.userQuery,
            headers: {'Content-Type': 'plain/text'}
        };
        const results = await utils.fetchData(inputs, "chatbot/getTopMatches_ProfJ", fnName);
        if (results == 'fail') return res.send("fail");
        // results is an array consisting of messages collected during execution 
        res.send(results);
	} catch (exception) {
		logger.error("Error occurred in chatbot/"+fnName+":", exception);
		res.send("fail");
	}
};

exports.updateFrequency_ProfJ = async (req, res) => {
    const fnName = "updateFrequency_ProfJ";
	logger.info("Inside UI service: " + fnName);
	try {
        const inputs = {
            data: req.body.qid,
            headers: {'Content-Type': 'plain/text'}
        };
        const results = await utils.fetchData(inputs, "chatbot/updateFrequency_ProfJ", fnName);
        if (results == 'fail') return res.send("fail");
        // results is an array consisting of messages collected during execution 
        res.send(results);
	} catch (exception) {
		logger.error("Error occurred in chatbot/"+fnName+":", exception);
		res.send("fail");
	}
};
