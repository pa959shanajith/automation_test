mySPA.factory('zephyrServices', ['$http','$q', function ($http,$q)   {
	return{
	  loginToZephyr_ICE: function(zephyrURL,zephyrUserName,zephyrPassword){
			var param = "loginToZephyr_ICE";
			return $http.post('/loginToZephyr_ICE', {
				action: param,
				zephyrURL:	zephyrURL,
				zephyrUserName:	zephyrUserName,
				zephyrPassword :	zephyrPassword,
				zephyraction: "project"
			})
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
		},
		zephyrProjectDetails_ICE: function(projectId){
			var param = "zephyrProjectDetails_ICE";
			var userid = JSON.parse(window.localStorage['_UI']).user_id
			return $http.post('/zephyrProjectDetails_ICE', {
				action: param,
				projectId:	projectId,
				zephyraction: "release",
				user_id : userid 
			})
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
		},
		zephyrCyclePhase_ICE: function(releaseId){
			var param = "zephyrCyclePhase_ICE";
			var userid = JSON.parse(window.localStorage['_UI']).user_id
			return $http.post('/zephyrCyclePhase_ICE', {
				action: param,
				releaseId:	releaseId,
				zephyraction: "cyclephase",
				user_id : userid 
			})
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
		},
		zephyrTestcaseDetails_ICE: function(zephyraction, treeId) {
			var param = "zephyrTestcaseDetails_ICE";
			return $http.post('/zephyrTestcaseDetails_ICE', {
				action: param,
				treeId: treeId,
				zephyraction: zephyraction,
			})
			.then(function(response) {
					return response.data;
			},function(response) {
					return $q.reject(response.data);
			});
		},
		saveZephyrDetails_ICE: function(mappedList){
			var param = "saveZephyrDetails_ICE";
			return $http.post('/saveZephyrDetails_ICE', {
				action: param,
				mappedDetails : mappedList, 
			})
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
		},
		viewZephyrMappedList_ICE: function(userid){
			var param = "viewZephyrMappedList_ICE";
			var userid = JSON.parse(window.localStorage['_UI']).user_id
			return $http.post('/viewZephyrMappedList_ICE', {
				action: param,
				user_id : userid
			})
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
		},
		manualTestcaseDetails_ICE: function(userid){
			var param = "manualTestcaseDetails_ICE";
			var userid = JSON.parse(window.localStorage['_UI']).user_id
			return $http.post('/manualTestcaseDetails_ICE', {
				action: param,
				user_id : userid
			})
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
		},
	}
  }]);