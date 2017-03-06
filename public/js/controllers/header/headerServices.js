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
    }
}]);

