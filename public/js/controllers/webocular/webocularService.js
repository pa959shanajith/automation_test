mySPA.factory('webocularServices', ['$http','$q', function ($http,$q)   {
	return{
		getResults : function(url, level, agent, proxy,searchData){
			console.info("Data in service", url, level, agent, proxy,searchData);
			return  $http({
				url: '/crawResults',
				method: "POST",
				data: { "url": url , "level": level, "agent": agent, "proxy": proxy , "searchData": searchData },
				headers: {'Content-Type': 'application/json'}
			}).then(function(response){
				return response.data;
			}, function(response){
				return $q.reject(response.data);
			});
		}
	}
}]);
