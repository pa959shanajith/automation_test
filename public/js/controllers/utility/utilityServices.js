mySPA.factory('utilityService', ['$http','$q', function ($http, $httpProvider, $q)   {
	return{
		Encrypt : function(methodSelected, encryptionVal){
			return $http.post('/Encrypt_ICE',{
				param : 'Encrypt_ICE',
				encryptionType: methodSelected,
				encryptionValue: encryptionVal
			})
			.then(function(response)  { return response.data},
					function(response)        {return $q.reject(response.data)})
		},

		Pairwise : function(TableData){
			return $http.post('/pairwise_ICE',{
				param : 'pairwise_ICE',
				dataObj: TableData
			})
			.then(function(response)  { return response.data},
					function(response)        {return $q.reject(response.data)})
		}

	};
}]);

