mySPA.factory('chatbotService', ['$http','$q', function ($http,$q)   {
	return{
		getTopMatches: function(query){
			return $http.post('/getTopMatches_ProfJ',{
				param : 'getTopMatches_ProfJ',
				userQuery: query
			
			})
		.then(function(response){
			return response.data;

		}, function(err){
			console.log(err);
		})	
		},
		updateFrequency: function(qid){
			return $http.post('/updateFrequency_ProfJ',{
				param : 'updateFrequency',
				qid: qid
			
			})
		.then(function(response){
			return response.data;

		}, function(err){
			console.log(err);
		})	
		}
	}
}]);
