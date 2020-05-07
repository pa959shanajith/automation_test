mySPA.factory('neuronGraphs2DService', ['$http','$q', function ($http,$q)   {
	return{
        getGraphData: function(userid){
	        return $http.post('/getGraph_nGraphs2D',{})
			.then(
				function(response){return response.data;},
				function(err){return $q.reject(err);}
			);
    	}
	}
}]);

