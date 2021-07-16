var uuid = require('uuid-random');
var utils = require('../lib/utils');

/**
 * Function responsible for creating smart batches
 * @param {*} batchInfo 
 * @param {*} type , sceanriolevel / modulelevel , batch.targetUser
 * @param {*} time , time of schedule
 */
exports.smartSchedule = async (batchInfo, type, time, browsers) => {
	// deep copying batchinfo
	const result = {}
	result["displayString"] = "";
	var partitions = await getMachinePartitions(batchInfo, type, time);
	if (partitions == "fail") {
		result["status"] = "fail";
		return result;
	} else if (partitions.result == "busy") {
		result["status"] = "busy"
		result["displayString"] = "ICE busy, Some modules might be skipped.\n"
	} else {
		result["status"] = "success"
		result["displayString"] = "Successfully Scheduled.\n\n"
	}
	result["batchInfo"] = {}
	var setCount = 1;
	//creating batches
	var partBatchInfo = []
	var moduleUserMap = {}
	for (let set in partitions.partitions) {
		var partitionsString = partitions.partitions[set].toString();
		result["displayString"] = result["displayString"] + "Set " + setCount.toString() + ": " + set + "\n";
		setCount++;
		for (var i = 0; i < batchInfo.length; i++) {
			var temp = JSON.parse(JSON.stringify(batchInfo[i]));
			temp.suiteDetails = [];
			temp.smartScheduleId = uuid();
			temp.targetUser = set;
			for (var j = 0; j < batchInfo[i].suiteDetails.length; j++) {
				if (partitionsString.includes(batchInfo[i].suiteDetails[j].scenarioId)) {
					partitionsString = partitionsString.replace(batchInfo[i].suiteDetails[j].scenarioId,"");
					testId = batchInfo[i].testsuiteId;
					if (moduleUserMap[testId] && moduleUserMap[testId]['user'] == set) {
						partBatchInfo[moduleUserMap[testId]["index"]].suiteDetails.push(JSON.parse(JSON.stringify(batchInfo[i].suiteDetails[j])));
						batchInfo[i].suiteDetails[j].scenarioId = "NONE";
					} else {				
						temp.suiteDetails.push(JSON.parse(JSON.stringify(batchInfo[i].suiteDetails[j])))
						batchInfo[i].suiteDetails[j].scenarioId = "NONE";
						moduleUserMap[testId] = {};
						moduleUserMap[testId]['index'] = partBatchInfo.length;
						moduleUserMap[testId]['user'] = set;
						partBatchInfo.push(temp);
					}
				}
			}
		}
	}
	result["displayString"] = result["displayString"] + "\nEstimated Time: " + secondsToHms(partitions.totalTime * browsers);
	result["batchInfo"] = partBatchInfo
	return result;
}

/**
 * Format Seconds to display string days/hours/minutes
 * @param {*} seconds 
 */
function secondsToHms(seconds) {
	var days = Math.floor(seconds / (24 * 60 * 60));
	seconds -= days * (24 * 60 * 60);
	var hours = Math.floor(seconds / (60 * 60));
	seconds -= hours * (60 * 60);
	var minutes = Math.floor(seconds / (60));
	seconds -= minutes * (60);
	return ((0 < days) ? (days + " day, ") : "") + hours + "h, " + minutes + "m and " + seconds.toFixed(2) + "s";
}

/**
 * 
 * @param {*} mod   BatchInfo
 * @param {*} type  Scenario level / module level
 * @param {*} time  Time of schedule
 */
const getMachinePartitions = async (mod, type, time) => {
	let scenarios = [];
	var activeUsers = []
	if(mod[0].iceList){
		activeUsers = mod[0].iceList;
	}else{
		return "fail";
	}
	for (var i = 0; i < mod.length; i++) {
		scenarios = scenarios.concat(mod[i].suiteDetails);
	}
	const inputs = {
		"scenarios": scenarios,
		"activeIce": activeUsers.length,
		"ipAddressList": activeUsers,
		"type": type,
		"modules": mod,
		"time": time
	};
	const result = await utils.fetchData(inputs, "partitons/getPartitions", "getMachineParitions");
	return result;
}
