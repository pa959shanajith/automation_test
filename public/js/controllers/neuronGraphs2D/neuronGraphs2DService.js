mySPA.factory('neuronGraphs2DService', ['$http','$q', function ($http,$q)   {
	return{
        getGraphData: function(userid){
	        return $http.post('/getGraph_nGraphs2D',{})
			.then(
				function(response){return response.data;},
				function(err){return $q.reject(err);}
			);
    	},
		
		getReportNG: function(suiteID) {
            return $http.post('/getReport_NG', {
                    param: 'getReport_NG',
                    suiteID: suiteID,
                })
                .then(function(response) {
                        return response.data
                    },
                    function(response) {
                        return $q.reject(response.data)
                    })
        },
        getReportExecutionStatusNG: function(suiteId) {
            return $http.post('/getReportExecutionStatus_NG', {
                    param: 'getReportExecutionStatus_NG',
                    suiteID: suiteId,
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

