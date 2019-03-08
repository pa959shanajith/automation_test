mySPA.factory('respHeaderServices', ['$http','$q', function ($http,$q){
    return{
		logoutUser_Nineteen68 : function(){	
			return $http.post('/logoutUser_Nineteen68',{
				param : 'logoutUser_Nineteen68',
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