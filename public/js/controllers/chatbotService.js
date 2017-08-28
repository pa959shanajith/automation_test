mySPA.factory('chatbotService', ['$http','$q', function ($http, $httpProvider, $q)   {
	return{
		getTopMatches: function(query){
            console.log("inside service layer");
			return $http.post('/getTopMatches_ProfJ',{
				param : 'getTopMatches_ProfJ',
				userQuery: query
			
			})
		.then(function(response){
			console.log(response);
			return response.data;

		}, function(err){
			console.log(err);
		})	
		},
		updateFrequency: function(qid){
            console.log("inside service layer of update freq");
			return $http.post('/updateFrequency_ProfJ',{
				param : 'updateFrequency',
				qid: qid
			
			})
		.then(function(response){
			console.log(response);
			return response.data;

		}, function(err){
			console.log(err);
		})	
		}
	}
}]);
