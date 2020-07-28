mySPA.factory('qtestServices', ['$http','$q', function ($http,$q)   {
  return{
		loginToQTest_ICE: function(qcURL,qcUserName,qcPassword){
    			var param = "loginToQTest_ICE";
	        return $http.post('/loginToQTest_ICE', {
	        		action: param,
              qcURL:	qcURL,
							qcUsername:	qcUserName,
							qcPassword :	qcPassword,
							qcaction: "domain"
	        })
					.then (function(response)	{return response.data;	},
					function(response){	return $q.reject(response.data);});	
    		},
			qtestProjectDetails_ICE: function(domain){
    			var param = "qtestProjectDetails_ICE";
					var userid = JSON.parse(window.localStorage['_UI']).user_id
	        return $http.post('/qtestProjectDetails_ICE', {
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
				saveQtestDetails_ICE: function(mappedList){
						var param = "saveQtestDetails_ICE";
						return $http.post('/saveQtestDetails_ICE', {
								action: param,
								mappedDetails : mappedList, 
						})
					.then (function(response)	{return response.data;	},
					function(response){	return $q.reject(response.data);});	
    		},
				viewQtestMappedList_ICE: function(userid){
						var param = "viewQtestMappedList_ICE";
						var userid = JSON.parse(window.localStorage['_UI']).user_id
						return $http.post('/viewQtestMappedList_ICE', {
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