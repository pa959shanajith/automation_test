mySPA.factory('PluginService', ['$http','$q', function ($http, $httpProvider, $q)   {
  return{
        getProjectIDs_Nineteen68: function(userid){
    		var param = "getProjectIDs_Nineteen68";
	        return $http.post('/getProjectIDs_Nineteen68', {
	        		action: param,
              userid : userid, 
	        })
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
    	},
       getTaskJson_Nineteen68: function(obj){
    		var param = "getTaskJson_Nineteen68";
	        return $http.post('/getTaskJson_Nineteen68', {
	        		action: param,
              obj : obj, 
	        })
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
    	}
  }
}]);
