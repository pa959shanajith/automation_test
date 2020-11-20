mySPA.factory('PluginService', ['$http','$q', function ($http,$q) {
	return{
		getProjectIDs: function(){
			var param = "getProjectIDs";
			return $http.post('/getProjectIDs', {
				action: param,
				allflag : true
			})
			.then (function(response) { return response.data; },
			function(response){	return $q.reject(response.data);});	
		},
		getTaskJson_mindmaps: function(obj){
			var param = "getTaskJson_mindmaps";
			return $http.post('/getTaskJson_mindmaps', {
				action: param,
				obj : obj,
			})
			.then (function(response) {return response.data; },
			function(response){	return $q.reject(response.data);});	
		},
		updateTaskStatus: function(obj){
			return $http.post('/updateTaskstatus_mindmaps', {
				obj : obj,
			})
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
		},
		getNames_ICE: function (requestedids,idtype) {
            var param = "getNames_ICE";
            return $http.post('/getNames_ICE', {
                action: param,
				requestedids:requestedids,
				idtype: idtype
            })
            .then(function (response) { return response.data; },
            function (response) { return $q.reject(response.data); });
		}

	}
}]);