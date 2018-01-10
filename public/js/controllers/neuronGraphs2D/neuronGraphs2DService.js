mySPA.factory('neuronGraphs2DService', ['$http','$q', function ($http, $httpProvider, $q)   {
	return{
        getGraphData: function(userid){
	        return $http.post('/getGraph_nGraphs2D',{uid:userid})
			.then(
				function(response){return response.data;},
				function(err){return $q.reject(err);}
			);
    	}
	}
}]);

