mySPA.factory('webCrawlerServices', ['$http','$q', function ($http, $httpProvider, $q)   {
	return{
		getResults : function(url, level){
			console.log("Data in service",url, level);
			return  $http({
        url: '/crawResults',
        method: "POST",
        data: { "url" : url , "level" : level },
				headers: {'Content-Type': 'application/json'}
    }).then(function(response){
				console.log(response);
			}, function(err){
				console.log(err);
			})
		}

	}
}]);
