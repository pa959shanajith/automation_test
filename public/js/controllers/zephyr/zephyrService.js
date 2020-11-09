mySPA.factory('zephyrServices', ['$http','$q', function ($http,$q)   {
  return{
	loginToZephyr_ICE: function(qcURL,qcUserName,qcPassword,qcJiraUrl,qcJiraUserName,qcJiraAccToken){
    			var param = "loginToZephyr_ICE";
	        return $http.post('/loginToZephyr_ICE', {
	        		action: param,
              qcURL:	qcURL,
							qcUsername:	qcUserName,
							qcPassword :	qcPassword,
							qcJiraUrl: qcJiraUrl,
							qcJiraUserName: qcJiraUserName,
							qcJiraAccToken: qcJiraAccToken,
							qcaction: "domain"
	        })
					.then (function(response)	{return response.data;	},
					function(response){	return $q.reject(response.data);});	
    		},
			zephyrProjectDetails_ICE: function(domain){
    			var param = "zephyrProjectDetails_ICE";
					var userid = JSON.parse(window.localStorage['_UI']).user_id
	        return $http.post('/zephyrProjectDetails_ICE', {
	        		action: param,
              domain:	domain,
							qcaction: "project",
							user_id : userid 
	        })
					.then (function(response)	{return response.data;	},
					function(response){	return $q.reject(response.data);});	
    		},
			qtestFolderDetails_ICE: function(qcaction, getProjectName, getDomainName, foldername, testCasename) {
						var param = "qtestFolderDetails_ICE";
						return $http.post('/qtestFolderDetails_ICE', {
										action: param,
										foldername: foldername,
										domain: getDomainName,
										project: getProjectName,
										qcaction: qcaction,
										testset: testCasename
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