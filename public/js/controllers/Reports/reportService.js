mySPA.factory('reportService', ['$http','$q', function ($http, $httpProvider, $q)   {
	return{
		renderReport_ICE : function(){
			return $http.post('/renderReport_ICE',{
				param : 'renderReport_ICE'
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
		}
	}
}]);