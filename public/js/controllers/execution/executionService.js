mySPA.factory('ExecutionService', ['$http','$q', function ($http, $httpProvider, $q)   {
	return{
		readTestSuite_ICE : function(cycleId, testSuiteId,testSuiteName){
			return $http.post('/readTestSuite_ICE',{
				param : 'readTestSuite_ICE',
				cycleid : cycleId,
				testsuiteid : testSuiteId,
				testsuitename : testSuiteName
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
		},
		
		QClogin : function(url, userName, passWord){
			return $http.post('/QCLOGIN_ICE',{
				param : 'QCLOGIN_ICE',
				url : url,
            	uname : userName,
            	password : passWord
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
		},
		
		saveQcScenarioDetails : function(scenarioIdQC,domainName,projectName,testSetName,testCaseName,folderPath){
			return $http.post('/saveQcScenarioDetails_ICE',{
				param : 'saveQcScenarioDetails_ICE',
				testScenarioId : scenarioIdQC,
            	domainName : domainName,
            	projectName : projectName,
            	testset : testSetName,
            	testcase : testCaseName,
            	folderpath : folderPath
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
		},
		
		getQcScenarioDetails: function(scenarioIdQC){
			return $http.post('/getQcScenarioDetails_ICE',{
				param : 'getQcScenarioDetails_ICE',
				testScenarioId : scenarioIdQC
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
	    },
	   getCycleNameByCycleId: function(cycleId, releaseId){
			return $http.post('/getCycleNameByCycleId',{
				param : 'getCycleNameByCycleId',
				cycleId : cycleId,
				releaseId : releaseId
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
	    },
	}
}]);
