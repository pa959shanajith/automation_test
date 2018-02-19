mySPA.factory('flowGraphServices', ['$http','$q', function ($http, $q)   {
	return{
		getResults : function(version, path){
			console.log("Data in service", version, path);
			return  $http({
				url: '/flowGraphResults',
				method: "POST",
				data: { "version" : version, "path" : path },
				headers: {'Content-Type': 'application/json'}
			}).then(function(response){
				return response.data;
			}, function(err){
				console.log(err);
			});
		}
	}
}]);
