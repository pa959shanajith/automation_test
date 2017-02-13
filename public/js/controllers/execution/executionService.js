mySPA.factory('ExecutionService', ['$http','$q', function ($http, $httpProvider, $q)   {
	return{
		readTestSuite_ICE : function(cycleId, testSuiteId){
			return $http.post('/readTestSuite_ICE',{
				param : 'readTestSuite_ICE',
				cycleid : cycleId,
				testsuiteid : testSuiteId
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
		},
		
		updateTestSuite_ICE: function(cycleId, testSuiteId, testSuiteName, testScenarioIds, executeStatus, conditionCheck, getParamPaths, userinfo){
			return $http.post('/updateTestSuite_ICE',{
				param : 'updateTestSuite_ICE',
				testscycleid : cycleId,
				requestedtestsuiteid : testSuiteId,
				requestedtestsuitename : testSuiteName,
				testscenarioids : testScenarioIds,
				condtioncheck : conditionCheck,
				donotexecute : executeStatus,
				getparampaths : getParamPaths,
				executionids : "",
				userinfo : userinfo
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
		},
		
		ExecuteTestSuite_ICE : function(selectedRowData, browserTypeExe, testSuiteId){
			return $http.post('/ExecuteTestSuite_ICE',{
				param : 'ExecuteTestSuite_ICE',
				jsonData : JSON.stringify(selectedRowData),
				browserType : browserTypeExe,
				testsuiteId : testSuiteId
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
		}
	}
}]);
