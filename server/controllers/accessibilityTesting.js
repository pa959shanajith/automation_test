
var logger = require('../../logger');
var utils = require('../lib/utils');


exports.saveAccessibilityReports = async function (reports){
	try {
		if (!reports) return false;
		const fnName = "getAccessibilityTestingData_ICE"
		var inputs = {
			"query": "insertdata",
			"reports": reports
		}
		const result = await utils.fetchData(inputs, "reports/getAccessibilityTestingData_ICE", fnName);
	} catch(e){
		logger.error(e.message);
	}
}