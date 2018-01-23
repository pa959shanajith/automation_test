mySPA.factory('mindmapServices', ['$http','$q', function ($http,$q)   {
	return{
		populateProjects: function () {
    		var param = "populateProjects";
    		return $http.post('/populateProjects', {
    			action: param
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		checkReuse: function (parsedata) {
    		var param = "checkReuse";
    		return $http.post('/checkReuse', {
    			action: param,
				parsedata:parsedata
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		populateUsers: function (projectId) {
    		var param = "populateUsers";
    		return $http.post('/populateUsers', {
    			action: param,
				projectId:projectId

    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		populateReleases: function (projectId) {
    		var param = "populateReleases";
    		return $http.post('/populateReleases', {
    			action: param,
				projectId:projectId

    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		populateScenarios: function (moduleId) {
    		var param = "populateScenarios";
    		return $http.post('/populateScenarios', {
    			action: param,
				moduleId:moduleId

    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		populateCycles: function (releaseId) {
    		var param = "populateCycles";
    		return $http.post('/populateCycles', {
    			action: param,
				releaseId:releaseId

    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		getProjectTypeMM_Nineteen68: function (projectId) {
    		var param = "getProjectTypeMM_Nineteen68";
    		return $http.post('/getProjectTypeMM_Nineteen68', {
    			action: param,
				projectId:projectId

    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		getModules: function (usertab,prjId,versioning_enabled,version){
					
    		var param = "getModules";
    		return $http.post('/getModules', {
    			action: param,
				tab:usertab,
                prjId: prjId,
                versioning: versioning_enabled,
                version:version
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		saveData: function (assignedTo,writeFlag,userRole,from_v,to_v,cur_module,mapData,deletednode,unassignTask,prjId,relId,cycId){
					
    		var param = "saveData";
    		return $http.post('/saveData', {
    			action: param,
				sendNotify:assignedTo,
				write:writeFlag,
				userRole:userRole,
				vn_from: from_v,
				vn_to: to_v,
				tab: cur_module,
				map: mapData,
				deletednode: deletednode,
				unassignTask: unassignTask,
				prjId: prjId,
				relId: relId,
				cycId: cycId
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		saveEndtoEndData: function (assignedTo,writeFlag,userRole,from_v,to_v,cur_module,mapData,deletednode,unassignTask,prjId,relId,cycId){
					
    		var param = "saveEndtoEndData";
    		return $http.post('/saveEndtoEndData', {
    			action: param,
				sendNotify:assignedTo,
				write:writeFlag,
				userRole:userRole,
				vn_from: from_v,
				vn_to: to_v,
				tab: cur_module,
				map: mapData,
				deletednode: deletednode,
				unassignTask: unassignTask,
				prjId: prjId,
				relId: relId,
				cycId: cycId
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		reviewTask: function (projectId,taskId,taskstatus,version,batchTaskIDs){
					
    		var param = "reviewTask";
    		return $http.post('/reviewTask', {
    			action: param,
				prjId:projectId,
				taskId:taskId,
				status:taskstatus,
				versionnumber:version,
				batchIds:batchTaskIDs
				
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	}
	}
}]);
