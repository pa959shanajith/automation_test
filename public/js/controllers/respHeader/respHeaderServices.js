mySPA.factory('respHeaderServices', ['$http','$q', function ($http,$q){
    return{
		logoutUser : function(){	
			return $http.post('/logoutUser',{
				param : 'logoutUser',
			})
			.then(function(response) { return response.data},
			function(response) {return $q.reject(response.data)})
		},
		getNames_ICE: function(requestedIds,idType){
			return $http.post('/getNames_ICE',{
				param : 'getNames_ICE',
				requestedids : requestedIds,
				idtype : idType
			})
			.then(function(response) { return response.data},
			function(response) {return $q.reject(response.data)})
	    }
    }
}]);