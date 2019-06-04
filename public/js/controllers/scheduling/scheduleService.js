mySPA.factory('ScheduleService', ['$http','$q', function ($http,$q)   {
  return{
	  readTestSuite_ICE : function(readTestSuite){
			return $http.post('/readTestSuite_ICE',{
				param : 'readTestSuite_ICE',
				readTestSuite : readTestSuite,
				fromFlag:	"scheduling"
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
	  },
		testSuitesScheduler_ICE : function(chktype,details,moduleInfo){
			return $http.post('/testSuitesScheduler_ICE',{
				param : 'testSuitesScheduler_ICE',
				details:details,
				moduleInfo: moduleInfo,
				chkType: chktype
			})
			.then(function(response){	return response.data},
			function(response){return $q.reject(response.data)})
		},
		getScheduledDetails_ICE : function(){
			return $http.post('/getScheduledDetails_ICE',{
				param : 'getScheduledDetails_ICE'
			})
			.then(function(response){	return response.data},
			function(response){return $q.reject(response.data)})
		},
		cancelScheduledJob_ICE : function(suiteDetailsObj, status,host,schedUserid){
			return $http.post('/cancelScheduledJob_ICE',{
				param : 'cancelScheduledJob_ICE',
				suiteDetails: suiteDetailsObj,
				schedStatus: status,
				host: host,
				schedUserid: schedUserid,
				userInfo: JSON.parse(window.localStorage['_UI']).user_id
			})
			.then(function(response){	return response.data},
			function(response){return $q.reject(response.data)})
		}
  }
}]);
