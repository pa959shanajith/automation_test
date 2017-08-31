mySPA.factory('headerServices', ['$http','$q', function ($http, $httpProvider, $q){
    return{
        getProjectDetails_ICE : function(projectId){	
			return $http.post('/getProjectDetails_ICE',{
				param : 'getProjectDetails_ICE',
				projectId: projectId
			})
			.then(function(response)  { return response.data},
					function(response)        {return $q.reject(response.data)})
		},
		logoutUser_Nineteen68 : function(UserName){	
			return $http.post('/logoutUser_Nineteen68',{
				param : 'logoutUser_Nineteen68',
				UserName :UserName
			})
			.then(function(response)  { return response.data},
					function(response)        {return $q.reject(response.data)})
		},
		getNames_ICE: function(requestedIds,idType){
			return $http.post('/getNames_ICE',{
				param : 'getNames_ICE',
				requestedids : requestedIds,
				idtype : idType
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
	    },
		/*getReleaseNameByReleaseId_ICE: function(releaseId,projectId){
			return $http.post('/getReleaseNameByReleaseId_ICE',{
				param : 'getReleaseNameByReleaseId_ICE',
				releaseId : releaseId,
				projectId : projectId
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
	    },
		getCycleNameByCycleId_ICE: function(cycleId, releaseId){
			return $http.post('/getCycleNameByCycleId_ICE',{
				param : 'getCycleNameByCycleId_ICE',
				cycleId : cycleId,
				releaseId : releaseId
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
	    },*/

		// for role based
		getAdditionalRoles_Nineteen68: function(userId) {
    		var param = "getAdditionalRoles_Nineteen68";
    		return $http.post('/getAdditionalRoles_Nineteen68', {
    			action: param,
				userId : userId
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		userPlugins_Nineteen68: function(username, rolename, roleId){
    		var param = "userPlugins_Nineteen68";
	        return $http.post('/userPlugins_Nineteen68', {
	        		action: param,
              username : username, 
			  rolename : rolename,
			  roleId : roleId
	        })
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
    },
		modifyRoles_Nineteen68: function(additionalRoleName, currentRole, selectedROleID, userId) {
    		var param = "modifyRoles_Nineteen68";
    		return $http.post('/modifyRoles_Nineteen68', {
    			action: param,
				additionalRoleName : additionalRoleName,
				currentRole : currentRole,
				selectedROleID : selectedROleID,
				userId : userId
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	}
		
    }
}]);

