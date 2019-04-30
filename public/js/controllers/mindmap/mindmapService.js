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
		getModules: function (versioning_enabled,usertab,prjId,version,relId,cycId,modName){
					
    		var param = "/getModules";
			if (versioning_enabled==1){
				param = "/getModulesVersioning";
			}
    		return $http.post(param, {
				tab:usertab,
                prjId: prjId,
                version:version,
				relId: relId,
				cycId: cycId,
				modName:modName,
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		saveData: function (versioning_enabled,assignedTo,writeFlag,from_v,to_v,cur_module,mapData,deletednode,unassignTask,prjId,relId,cycId,selectedTab,utcTime){
			var param = "/saveData";
			if (versioning_enabled==1){
				param = "/saveDataVersioning";
			}
			return $http.post(param, {
					action: param,
					sendNotify:assignedTo,
					write:writeFlag,
					vn_from: from_v,
					vn_to: to_v,
					tab: cur_module,
					map: mapData,
					deletednode: deletednode,
					unassignTask: unassignTask,
					prjId: prjId,
					relId: relId,
					cycId: cycId,
					selectedTab:selectedTab,
					UtcTime: utcTime
			})
			.then(function (response) { return response.data; },
					function (response) { return $q.reject(response.data); });
    	},
		saveEndtoEndData: function (assignedTo,writeFlag,from_v,to_v,cur_module,mapData,deletednode,unassignTask,prjId,relId,cycId){
    		var param = "saveEndtoEndData";
    		return $http.post('/saveEndtoEndData', {
    			action: param,
				sendNotify:assignedTo,
				write:writeFlag,
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
    	},
		getCRId:function (projectId){
			var param = "getCRId";
    		return $http.post('/getCRId', {
				projectid:projectId
				
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
		},
		getVersions:function (projectId){
			var param = "getVersions";
    		return $http.post('/getVersions', {
				projectId:projectId
				
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
		},
		getProjectsNeo: function (){
    		return $http.post('/getProjectsNeo', {
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		createVersion: function (param,srcprojectId,dstprojectId,vn_from,vn_to,write) {
    		return $http.post('/createVersion', {
    			action: param,
				srcprojectId:srcprojectId,
				dstprojectId:dstprojectId,
				vn_from:vn_from,
				vn_to:vn_to,
				write:write
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		excelToMindmap: function(data){
    		return $http.post('/excelToMindmap', {
    			data: data
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
		},
		getScreens: function (projectId) {
    		var param = "getScreens";
    		return $http.post('/getScreens', {
    			action: param,
				projectId:projectId

    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		exportToExcel: function(excelMap){
			var param = "/exportToExcel";
			return $http.post('/exportToExcel',{
				 action: param,
				 excelMap: excelMap
				 //responseType: 'arraybuffer'
			},{responseType:'arraybuffer'})
			
    		
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	
		},
		getDomain : function(data){
			return $http.post('/getDomain',{
				 data: data
			})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	
		}	
	}
}]);
