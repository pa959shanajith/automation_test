mySPA.factory('webCrawlerServices', ['$http','$q', function ($http, $httpProvider, $q)   {
	return{
		getResults : function(url, level, agent){
			console.log("Data in service", url, level, agent);
			return  $http({
				url: '/crawResults',
				method: "POST",
				data: { "url" : url , "level" : level, "agent" : agent },
				headers: {'Content-Type': 'application/json'}
			}).then(function(response){
				return response.data;
			}, function(err){
				console.log(err);
			});
		}
	}
}]);
