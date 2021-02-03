mySPA.factory('ExecutionService', ['$http','$q', function ($http,$q)   {
	return{
		readTestSuite_ICE : function(readTestSuite){
			return $http.post('/readTestSuite_ICE',{
				param : 'readTestSuite_ICE',
				readTestSuite : readTestSuite,
				fromFlag:	"execution"
			})
			.then(function(response)  { return response.data},
			function(response)  {return $q.reject(response.data)})
		},
		
		updateTestSuite_ICE: function(batchDetails){
			return $http.post('/updateTestSuite_ICE',{
				param : 'updateTestSuite_ICE',
				batchDetails: batchDetails
			})
			.then(function(response)  { return response.data},
			function(response)  {return $q.reject(response.data)})
		},
		
		ExecuteTestSuite_ICE : function(executionData){
			return $http.post('/ExecuteTestSuite_ICE', {
				param : 'ExecuteTestSuite_ICE',
				executionData: executionData
			})
			.then(function(response)  { return response.data},
			function(response)  {return $q.reject(response.data)})
		},

		loadLocationDetails: function(scenarioName, scenarioId){
			return $http.post('/getTestcaseDetailsForScenario_ICE',{
				param : 'getTestcaseDetailsForScenario_ICE',
				testScenarioId : scenarioId
			})
			.then(function(response)  { return response.data},
			function(response)  {return $q.reject(response.data)})
		},

		loginQCServer_ICE: function(qcURL,qcUserName,qcPassword){
			var param = "loginQCServer_ICE";
			return $http.post('/loginQCServer_ICE', {
				action: param,
				qcURL: qcURL,
				qcUsername: qcUserName,
				qcPassword : qcPassword,
				qcaction: "domain"
			})
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
		},

		loginQTestServer_ICE: function(qcURL,qcUserName,qcPassword, integrationType){
			var param = "loginToQTest_ICE";
			return $http.post('/loginToQTest_ICE', {
				action: param,
				qcURL: qcURL,
				qcUsername: qcUserName,
				qcPassword : qcPassword,
				integrationType : integrationType,
				qcaction: "domain"
			})
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
		},

		loginZephyrServer_ICE: function(zephyrAccNo,zephyrAcKey,zephyrSecKey, integrationType){
			var param = "loginToZephyr_ICE";
			return $http.post('/loginToZephyr_ICE', {
				action: param,
				zephyrAccNo: zephyrAccNo,
				zephyrAcKey: zephyrAcKey,
				zephyrSecKey : zephyrSecKey,
				integrationType : integrationType,
				execFlag: "1",
				zephyraction: "domain"
			})
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
		}
	}
}]);
