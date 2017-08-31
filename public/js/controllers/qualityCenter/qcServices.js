mySPA.factory('qcServices', ['$http','$q', function ($http, $httpProvider, $q)   {
  return{
        loginQCServer_ICE: function(qcURL,qcUserName,qcPassword){
    			var param = "loginQCServer_ICE";
	        return $http.post('/loginQCServer_ICE', {
	        		action: param,
              qcURL:	qcURL,
							qcUsername:	qcUserName,
							qcPassword :	qcPassword,
							qcaction: "domain"
	        })
					.then (function(response)	{return response.data;	},
					function(response){	return $q.reject(response.data);});	
    		},
				qcProjectDetails_ICE: function(domain){
    			var param = "qcProjectDetails_ICE";
					var userid = JSON.parse(window.localStorage['_UI']).user_id
	        return $http.post('/qcProjectDetails_ICE', {
	        		action: param,
              domain:	domain,
							qcaction: "project",
							user_id : userid 
	        })
					.then (function(response)	{return response.data;	},
					function(response){	return $q.reject(response.data);});	
    		},
				qcFolderDetails_ICE: function(qcaction, getProjectName, getDomainName, foldername, testCasename) {
						var param = "qcFolderDetails_ICE";
						return $http.post('/qcFolderDetails_ICE', {
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
				saveQcDetails_ICE: function(mappedList){
						var param = "saveQcDetails_ICE";
						return $http.post('/saveQcDetails_ICE', {
								action: param,
								mappedDetails : mappedList, 
						})
					.then (function(response)	{return response.data;	},
					function(response){	return $q.reject(response.data);});	
    		},
				viewQcMappedList_ICE: function(userid){
						var param = "viewQcMappedList_ICE";
						var userid = JSON.parse(window.localStorage['_UI']).user_id
						return $http.post('/viewQcMappedList_ICE', {
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