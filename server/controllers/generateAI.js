var logger = require('../../logger');
var utils = require('../lib/utils');
const axios = require("axios");


exports.generateTestcase = async (req, res) => {
    logger.info("Inside Generate AI service: generateTestcase");
    try {
         if ( !req.body.name || !req.body.email || !req.body.projectname || !req.body.organization) {
            return res.status(400).json({status:false, error: 'Bad request: Missing required data' });
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
            return res.status(result[1].statusCode).json({status:false,
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("testcases generated successfully");
        res.status(200).send({status:true, success: true, data: result[0].rows ? result[0].rows: [], message: 'testcases generated' });
        // res.status(200).send(result);

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({status:false, error: 'Internal server error' });
    }
}

exports.getJSON_UserStories = async (req, res) => {
    logger.info("Inside Generate AI service: generateTestcase");
    try {
         if ( !req.body.name || !req.body.email || !req.body.organization) {
            return res.status(400).json({status:false, error: 'Bad request: Missing required data' });
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
            return res.status(result[1].statusCode).json({status:false,
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("testcases generated successfully");
        
        res.status(200).send({status:true, success: true, data: result[0].rows && result[0].rows.length ? result[0].rows: [], message: 'fetched userstories' });
        // res.status(200).send(result);

    } catch (error) {
        logger.error('Error:', error);              
        res.status(500).json({status:false, error: 'Internal server error' });
    }
}

exports.save_GenTestcases = async (req, res) => {
    logger.info("Inside Generate AI service: generateTestcase");
    try {
         if ( !req.body.name || !req.body.email || !req.body.organization || !req.body.projectname || !req.body.testcase || !req.body.type ) {
            return res.status(400).json({status:false, error: 'Bad request: Missing required data' });
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
            return res.status(result[1].statusCode).json({status:false,
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("testcases saved successfully");
        
        res.status(200).send({status:true, success: true,  message: 'saved successfully' });
        // res.status(200).send(result);

    } catch (error) {
        logger.error('Error:', error);              
        res.status(500).json({status:false, error: 'Internal server error' });
    }
}

// validating AI token
exports.validateToken = async (req, res) => {
    logger.info("Inside Generate AI service: validateToken");
    try {
         if ( !req.body.token || !req.body.type || !req.body.baseURL) {
            return res.status(400).json({status:false, error: 'Bad request: Missing required data' });
        }
        var inputs = {
            "token": req.body.token,
            "type": req.body.type,
            "baseURL": req.body.baseURL
        };
        const result = await utils.fetchData(inputs, "genAI/validateAI_Token", "validateToken", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({status:false,
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("testcases generated successfully");
        res.status(200).send({ status: true, message: 'Valid TOKEN' });

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({status:false, error: 'Internal server error' });
    }
}

async function validateOpenAIToken(token) {
    try {
        const response = await axios.post('https://avoassureexploration.openai.azure.com/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(response,' its response');
        // If the request is successful, the token is considered valid
        return true;
    } catch (error) {
        // If the request fails, the token is considered invalid
        return false;
    }
}

//create LLM Model
exports.createModel = async (req, res) => {
    logger.info("Inside Generate AI service: createModel");
    try {
         if (!req.body.modeltype) {
            return res.status(400).json({status:false, error: 'Bad request: Missing required data' });
        }
        const inputData = validatePayload(req.body);
        if(!inputData.isValid || Object.keys(inputData.modelInput).length == 0){
            return res.status(400).json({status:false, error: 'Bad request: Missing required data' });
        }
        inputData.modelInput.userinfo = req.session;
        const result = await utils.fetchData(inputData.modelInput, "genAI/createModel", "createModel", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({status:false,
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("LLM model saved");
        res.status(201).send({ status: true, message: 'doc created' });

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({status:false, error: 'Internal server error' });
    }
}

function validatePayload(payload) {
    let isValid = true;
    let modelInput = {}
    if (Object.keys(payload).length && payload.modeltype) {
        switch (payload.modeltype) {
            case 'openAi':
                if (!payload.hasOwnProperty('api_key') || isEmptyOrUndefinedOrNull(payload["api_key"]) ||
                    !payload.hasOwnProperty('api_type') || isEmptyOrUndefinedOrNull(payload["api_type"]) ||
                    !payload.hasOwnProperty('api_version') || isEmptyOrUndefinedOrNull(payload["api_version"]) ||
                    !payload.hasOwnProperty('api_base') || isEmptyOrUndefinedOrNull(payload["api_base"]) ||
                     !payload.hasOwnProperty('name') || isEmptyOrUndefinedOrNull(payload["name"])) {
                    isValid = false;
                }
                else{
                    modelInput["openai_api_key"] = payload["api_key"];
                    modelInput["openai_api_type"] = payload["api_type"];
                    modelInput["openai_api_version"] = payload["api_version"];
                    modelInput["openai_api_base"] = payload["api_base"];
                    modelInput["name"] = payload["name"];
                    modelInput["description"] = payload["description"] || "";
                }
                break;
            case 'cohere':
            case "anthropic":
                if (!payload.hasOwnProperty('api_key') || isEmptyOrUndefinedOrNull(payload["api_key"]) ||
                    !payload.hasOwnProperty('model') || isEmptyOrUndefinedOrNull(payload["model"]) ||
                     !payload.hasOwnProperty('name') || isEmptyOrUndefinedOrNull(payload["name"])) {
                    isValid = false;
                }
                else{
                    modelInput[`api_key`] = payload["api_key"];
                    modelInput[`model`] = payload["model"];
                    modelInput[`modeltype`] = payload["modeltype"];
                    modelInput["name"] = payload["name"];
                    modelInput["description"] = payload["description"] || "";
                }
                break;
            default:
                break;
        }
    }
    return {isValid,modelInput};
}

function isEmptyOrUndefinedOrNull(input) {
    return input === '' || input === undefined || input === null;
}

// read the LLM model
exports.readModel = async (req, res) => {
    logger.info("Inside Generate AI service: readModel");
    try {
         if ( !req.query.userid) {
            return res.status(400).json({status:false, error: 'Bad request: Missing required data' });
        }
        var inputs = {
            "userid": req.query.userid
        };
        const result = await utils.fetchData(inputs, "genAI/readModel", "readModel", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({status:false,
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        const sendRes = result[0] && result[0].rows ? result[0].rows : []
        logger.info("user specific models found : ",sendRes);
        res.status(200).send({ status: true, data:sendRes,count:sendRes.length || 0  });

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({status:false, error: 'Internal server error' });
    }
}
// edit the model
exports.editModel = async (req, res) => {
    logger.info("Inside Generate AI service: editModel");
    try {
         if (!req.params.id) {
            return res.status(400).json({status:false, error: 'Bad request: Missing required data' });
        }
        let updateFields = {}
        updateFields.items = req.body; 
       if(updateFields && Object.keys(updateFields).length === 0){
            return res.status(400).json({status:false, error: 'Bad request: no fields to update' });  
       }
        updateFields.id = req.params.id;
        updateFields.userinfo = req.session;
        const result = await utils.fetchData(updateFields, "genAI/editModel", "editModel", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({status:false,
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        const sendRes = result[0] && result[0].rows ? result[0].rows : []
        logger.info("model updated successfully : ",sendRes);
        res.status(200).send({ status: true, data:sendRes, message:"model updated" });

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({status:false, error: 'Internal server error' });
    }
}

// delete model
exports.deleteModel = async (req, res) => {
    logger.info("Inside Generate AI service: editModel");
    try {
         if (!req.params.id) {
            return res.status(400).json({status:false, error: 'Bad request: Missing required data' });
        }
        let deleteInput = {
            "id":req.params.id,
            "userinfo":req.session
        }
        const result = await utils.fetchData(deleteInput, "genAI/deleteModel", "deleteModel", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({status:false,
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        const sendRes = result[0] && result[0].rows ? result[0].rows : []
        logger.info("model deleted successfully : ",sendRes);
        res.status(200).send({ status: true, data:sendRes, message:"model deleted" });

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({status:false, error: 'Internal server error' });
    }
}

// create template
exports.createTemp = async (req, res) => {
    logger.info("Inside Generate AI service: createTemp");
    try {
        let tempPayload = req.body;
         if (!tempPayload.hasOwnProperty('name') || isEmptyOrUndefinedOrNull(tempPayload["name"]) || 
         !tempPayload.hasOwnProperty('domain') || isEmptyOrUndefinedOrNull(tempPayload["domain"]) ||
         !tempPayload.hasOwnProperty('model_id') || isEmptyOrUndefinedOrNull(tempPayload["model_id"]) ||
         !tempPayload.hasOwnProperty('test_type') || isEmptyOrUndefinedOrNull(tempPayload["test_type"]) ||
         !tempPayload.hasOwnProperty('temperature') || isEmptyOrUndefinedOrNull(tempPayload["temperature"])
         ) {
            return res.status(400).json({status:false, error: 'Bad request: Missing required data' });
        }
        let inputData = tempPayload;
        inputData.userinfo = req.session;
        const result = await utils.fetchData(inputData, "genAI/createTemp", "createTemp", true);

        if (result &&  result[1].statusCode !== 200) {
            logger.error(`request error :` ,result[1].statusMessage || 'Unknown error');
            return res.status(result[1].statusCode).json({status:false,
                error: result[1].statusMessage || 'Unknown error',
            });
        }
        logger.info("Template created ");
        res.status(201).send({ status: true, message: 'doc created' });

    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({status:false, error: 'Internal server error' });
    }
}