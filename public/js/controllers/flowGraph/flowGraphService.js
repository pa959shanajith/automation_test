mySPA.factory('flowGraphServices', ['$http','$q', function ($http, $q)   {
	return{
		getResults : function(version, path){
			return  $http({
				url: '/flowGraphResults',
				method: "POST",
				data: { "version" : version, "path" : path },
				headers: {'Content-Type': 'application/json'}
			}).then(function(response){
				return response.data;
			}, function(response){
				return $q.reject(response.data)
			});
		},
		APG_OpenFileInEditor : function(editorName, filePath, lineNumber){
			return $http({
				url: '/APG_OpenFileInEditor',
				method: "POST",
				data: {"editorName": editorName, "filePath" : filePath, "lineNumber": lineNumber},
				headers : {'Content-Type' : 'application/json'} 
			}).then(function(response){
				return response.data
			}, function(response){
				return $q.reject(response.data)
			});

		},
		APG_createAPGProject : function(data){
			return $http({
				url: '/APG_createAPGProject',
				method: 'POST',
				data: {"data": data},
				headers: {'Content-Type': 'application/json'}
			}).then(function(response){
				return response.data
			},function(response){
				return $q.reject(response.data)
			});
		},
		APG_runDeadcodeIdentifier : function(version,path){
			return $http({
				url: '/APG_runDeadcodeIdentifier',
				method: 'POST',
				data: {"version": version, "path":path},
				headers: {'Content-Type': 'application/json'}
			}).then(function(response){
				return response.data
			},function(response){
				return $q.reject(response.data)
			});
		}
	}
}]);
