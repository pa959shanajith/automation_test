mySPA.factory('headerServices', ['$http','$q', function ($http, $httpProvider, $q){
    return{
        getProjectDetails_ICE : function(projectId){	
			return $http.post('/getProjectDetails_ICE',{
				param : 'getProjectDetails_ICE',
				projectId: projectId
			})
			.then(function(response)  { return response.data},
					function(response)        {return $q.reject(response.data)})
		},
		logoutUser_Nineteen68 : function(){	
			return $http.post('/logoutUser_Nineteen68',{
				param : 'logoutUser_Nineteen68'
			})
			.then(function(response)  { return response.data},
					function(response)        {return $q.reject(response.data)})
		},
		getNames_ICE: function(requestedIds,idType){
			return $http.post('/getNames_ICE',{
				param : 'getNames_ICE',
				requestedids : requestedIds,
				idtype : idType
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
	    },
		/*getReleaseNameByReleaseId_ICE: function(releaseId,projectId){
			return $http.post('/getReleaseNameByReleaseId_ICE',{
				param : 'getReleaseNameByReleaseId_ICE',
				releaseId : releaseId,
				projectId : projectId
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
	    },
		getCycleNameByCycleId_ICE: function(cycleId, releaseId){
			return $http.post('/getCycleNameByCycleId_ICE',{
				param : 'getCycleNameByCycleId_ICE',
				cycleId : cycleId,
				releaseId : releaseId
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
	    },*/
    }
}]);

