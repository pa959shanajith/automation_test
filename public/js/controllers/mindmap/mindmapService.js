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
		populateUsers: function (projectId) {
    		var param = "populateUsers";
    		return $http.post('/populateUsers', {
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
		getProjectTypeMM: function (projectId) {
    		var param = "getProjectTypeMM";
    		return $http.post('/getProjectTypeMM', {
    			action: param,
				projectId:projectId

    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		getModules: function (versioning_enabled,usertab,projectid,version,cycId,modName,moduleid){
    		var param = "/getModules";
			if (versioning_enabled==1){
				param = "/getModulesVersioning";
			}
    		return $http.post(param, {
				tab:usertab,
                projectid: projectid,
                version:version,
				cycId: cycId,
				modName:modName,
				moduleid:moduleid
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
		saveData: function (versioning_enabled,assignedTo,writeFlag,from_v,to_v,cur_module,mapData,deletednode,unassignTask,prjId,cycId,selectedTab,utcTime,createdthrough){
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
					createdthrough: createdthrough,
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
				relId: relId || null,
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
		getTestSuiteDetails: function(data){
			return $http.post('/readTestSuite_ICE', {
				param: 'readTestSuite_ICE',
				readTestSuite: data,
				fromFlag: "mindmaps"
			})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
		},
		pdProcess: function(data){
			return $http.post('/pdProcess',{
				 data: data
			})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
		},
		exportMindmap: function(mindmapId){
			var param = "exportMindmap";
			return $http.post('/exportMindmap',{
					action: param,
					mindmapId: mindmapId
			})
			.then(function (response) { return response.data; },
					function (response) { return $q.reject(response.data); });
		},
		importMindmap: function(mindmap){
			var param = "importMindmap";
			return $http.post('/importMindmap',{
					action: param,
					content: mindmap.content
			})
			.then(function (response) { return response.data; },
					function (response) { return $q.reject(response.data); });
		}
	}
}]);
