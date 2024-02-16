var logger = require('../../logger');
var utils = require('../lib/utils');


exports.generateTestcase = async (req, res) => {
    logger.info("Inside Generate AI service: generateTestcase");
    try {
         if ( !req.body.name || !req.body.email || !req.body.projectname || !req.body.organization) {
            return res.status(400).json({ error: 'Bad request: Missing required data' });
        }
        var inputs = {
            "query": "generateTestcase",
            "name": req.body.name,
            "email": req.body.email,
            "project": req.body.projectname,
            "organization": req.body.organization,
            "generateType": req.body.type
        };
        const result = await utils.fetchData(inputs, "generate/testcase", "generateTestcase", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("test cases generated successfully");
        res.status(200).send({ success: true, data: result[0].rows ? result[0].rows: [], message: 'test cases generated' });
        // res.status(200).send(result);

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.getJSON_UserStories = async (req, res) => {
    logger.info("Inside Generate AI service: generateTestcase");
    try {
         if ( !req.body.name || !req.body.email || !req.body.organization) {
            return res.status(400).json({ error: 'Bad request: Missing required data' });
        }
        var inputs = {
            "query": "getJSONuserstory",
            "name": req.body.name,
            "email": req.body.email,
            "organization": req.body.organization
        };
        const result = await utils.fetchData(inputs, "JSON/userstory", "getuserstories", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("test cases generated successfully");
        
        res.status(200).send({ success: true, data: result[0].rows && result[0].rows.length ? result[0].rows: [], message: 'fetched userstories' });
        // res.status(200).send(result);

    } catch (error) {
        logger.error('Error:', error);              
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.save_GenTestcases = async (req, res) => {
    logger.info("Inside Generate AI service: generateTestcase");
    try {
         if ( !req.body.name || !req.body.email || !req.body.organization || !req.body.projectname || !req.body.testcase || !req.body.type ) {
            return res.status(400).json({ error: 'Bad request: Missing required data' });
        }
        var inputs = {
            "query": "saveTestcases",
            "name": req.body.name,
            "email": req.body.email,
            "organization": req.body.organization,
            "projectname": req.body.projectname,
            "testcase": req.body.testcase,
            "type": req.body.type
        };
        const result = await utils.fetchData(inputs, "Save/testcases", "saveTestcases", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("test cases saved successfully");
        
        res.status(200).send({ success: true,  message: 'saved successfully' });
        // res.status(200).send(result);

    } catch (error) {
        logger.error('Error:', error);              
        res.status(500).json({ error: 'Internal server error' });
    }
}