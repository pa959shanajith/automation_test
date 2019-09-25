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
		},
		saveResults : function(url, level, agent, proxy, crawdata, searchData, modulename){
			console.info("Saving data", url, level, agent, proxy, crawdata, searchData, modulename);
			return  $http({
				url: '/saveResults',
				method: "POST",
				data: { "url": url , "level": level, "agent": agent, "proxy": proxy, "crawdata": crawdata, "modulename": modulename, "searchData": searchData},
				headers: {'Content-Type': 'application/json'}
			}).then(function(response){
				return response.data;
			}, function(response){
				return $q.reject(response.data);
			});
		},
		getWebocularModule_ICE: function(){
            return $http.post('/getWebocularModule_ICE', {
                param: 'getWebocularModule_ICE'
            })
            .then(function(response) {
                    return response.data
                },
                function(response) {
                    return $q.reject(response.data)
                })
        }
	}
}]);
