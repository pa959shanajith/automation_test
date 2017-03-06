mySPA.factory('reportService', ['$http','$q', function ($http, $httpProvider, $q)   {
	return{
		renderReport_ICE : function(finalReports, reportType){
			return $http.post('/renderReport_ICE',{
				param : 'renderReport_ICE',				
				finalreports: finalReports,
				reporttype: reportType
			})
			.then(function(response)  {
				return response.data
			},
			function(response){
				return $q.reject(response.data)
			})
		},
		getMainReport_ICE : function(){
			return $http.post('/getMainReport_ICE',{
				param : 'getMainReport_ICE'
			})
			.then(function(response)  {
				return response.data
			},
			function(response){
				return $q.reject(response.data)
			})
		},
		//Get all Testsuites 
		getAllSuites_ICE : function(userID){
			return $http.post('/getAllSuites_ICE',{
				param : 'getAllSuites_ICE',
				userId : userID
			})
			.then(function(response)  {
				return response.data
			},
			function(response){
				return $q.reject(response.data)
			})
		},
		
		//Get Testsuites start end details
		getSuiteDetailsInExecution_ICE : function(testsuiteId){
			return $http.post('/getSuiteDetailsInExecution_ICE',{
				param : 'getSuiteDetailsInExecution_ICE',
				testsuiteid : testsuiteId
			})
			.then(function(response)  {
				return response.data
			},
			function(response){
				return $q.reject(response.data)
			})
		},
		
		//Get Testsuites start end details
		reportStatusScenarios_ICE : function(executionid){
			return $http.post('/reportStatusScenarios_ICE',{
				param : 'reportStatusScenarios_ICE',
				executionId : executionid
			})
			.then(function(response)  {
				return response.data
			},
			function(response){
				return $q.reject(response.data)
			})
		},
		
		//Get Final Reports
		getReport_Nineteen68 : function(reportID, testsuiteId){
			return $http.post('/getReport_Nineteen68',{
				param : 'getReport_Nineteen68',
				reportId : reportID,
				testsuiteId : testsuiteId
			})
			.then(function(response)  {
				return response.data
			},
			function(response){
				return $q.reject(response.data)
			})
		}
	}
}]);