mySPA.factory('neuronGraphs2DService', ['$http','$q', function ($http, $httpProvider, $q)   {
	return{
        getGraphData: function(userid){
	        return $http.post('/getGraph_nGraphs2D',{uid:userid})
			.then(
				function(response){return response.data;},
				function(err){return $q.reject(err);}
			);
    	},
        getPackData: function(d){
	        return $http.post('/getPackData_nGraphs2D',{data:d})
			.then(
				function(response){return response.data;},
				function(err){return $q.reject(err);}
			);
    	},
	    getReportData: function(moduleid,executionid,testscenarioids){
	        return $http.post('/getReportData_nGraphs2D',{moduleid:moduleid,executionid:executionid,testscenarioids:testscenarioids})
			.then(
				function(response){
					console.log("response:: ",response);
					return response.data;},
				function(err){return $q.reject(err);}
			);
    	},
	    BuildRelationships: function(){
			console.log('Service call')
	        return $http.post('/BuildRelationships_nGraphs2D',{})
			.then(
				function(response){
					console.log("response:: ",response);
					return response.data;},
				function(err){return $q.reject(err);}
			);
	}

	}
}]);

