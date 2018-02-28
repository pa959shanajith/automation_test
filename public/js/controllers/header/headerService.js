mySPA.factory('headerServices', ['$http','$q', function ($http,$q){
    return{
		logoutUser_Nineteen68 : function(UserName){	
			return $http.post('/logoutUser_Nineteen68',{
				param : 'logoutUser_Nineteen68',
				UserName :UserName
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
	    }
    }
}]);