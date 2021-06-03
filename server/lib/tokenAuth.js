const bcrypt = require('bcryptjs');
const logger = require('../../logger');
var queue = require('../lib/execution/executionQueue')
const utils = require('./utils')


module.exports.tokenValidation = async (userInfo) => {
	const icename = (userInfo.icename || "").toLowerCase();
	const poolname = (userInfo.poolname || "");
	userInfo.inputs = {
		"tokenValidation": {
			"status": "failed",
			"msg": "Token authentication failed"
		}
	}
	let iceMap = queue.Execution_Queue.poolname_ice_map;
	if (poolname != "" && !iceMap[poolname]) return userInfo
	//Directly validate on ice name if the following 2 conditions are true:
	// 1. ice name is sent
	// 2. pool name not sent OR pool name is sent but ice does not belong to this pool 
	if(icename != "" && (poolname == "" || !checkICEinPool(icename, iceMap[poolname]))){
		userInfo.icename = icename;
		var userValidation =  await validateUser(icename, userInfo)
		userValidation['owner'] = true;
		return userValidation;
	}
	let iceList = iceMap[poolname];
	for(let id in iceList){
		let poolice = iceList[id].icename
		var userValidation = await validateUser(poolice, userInfo);
		userValidation['owner'] = false;
		//check wether one of the ice in the pool belongs to the user whose token hash was sent 
		if (userValidation.inputs.tokenValidation == "passed"){
			//token is valid, append pool id to user info
			userValidation['poolid'] = queue.Execution_Queue.ice_list[poolice]['poolid']
			//an ice name was sent, set ice name for execution on this ice
			if (icename != "") userValidation['icename'] = icename;
			//ICE is owned bu the user whose token hash was sent, mark as owner  	
			if (poolice == icename) userValidation['owner'] = true;
			return userValidation
		}
	}
	return userInfo;
};

const checkICEinPool = (icename, iceMap) => {
	for (let index in iceMap){
		if (icename == iceMap[index]['icename']){
			return true;
		}
	}
	return false;
}

const validateUser = async (icename, userInfo) =>{
	var validUser = false;
	const emsg = "Inside UI service: ExecuteTestSuite_ICE_SVN ";
	const inputs = {
		'icename': icename,
		'tokenname': userInfo.tokenname || ""
	};
	const tokenValidation = {
		"status": "failed",
		"msg": "Token authentication failed"
	}
	const response = await utils.fetchData(inputs, "login/authenticateUser_CI", "tokenValidation");
	if (response != "fail" && response != "invalid") validUser = bcrypt.compareSync(userInfo.tokenhash || "", response.hash);
	if (validUser) {
		userInfo.userid = response.userid;
		userInfo.username = response.username;
		userInfo.role = response.role;
		if(response.deactivated == "active") {
			tokenValidation.status = "passed";
			tokenValidation.msg = "Token validation successful";
		} else if(response.deactivated == "expired") {
			tokenValidation.status = "expired";
			tokenValidation.msg = "Token is expired";
			logger.error(emsg + tokenValidation.msg + " for username: " + icename);
		} else if(response.deactivated == "deactivated") {
			tokenValidation.status = "deactivated";
			tokenValidation.msg = "Token is deactivated";
			logger.error(emsg + tokenValidation.msg + " for username: " + icename);
		}
	} else logger.info(emsg + "Token authentication failed for username: " + icename);
	inputs.tokenValidation = tokenValidation.status;
	inputs.error_message = tokenValidation.msg;
	userInfo.inputs = inputs;
	return userInfo;
};