mySPA.factory('PluginService', ['$http','$q', function ($http,$q) {
	return{
		getProjectIDs_Nineteen68: function(){
			var param = "getProjectIDs_Nineteen68";
			return $http.post('/getProjectIDs_Nineteen68', {
				action: param,
				allflag : true
			})
			.then (function(response) { return response.data; },
			function(response){	return $q.reject(response.data);});	
		},
		getTaskJson_mindmaps: function(obj){
			var param = "getTaskJson_mindmaps";
			return $http.post('/getTaskJson_mindmaps', {
				action: param,
				obj : obj,
			})
			.then (function(response) {return response.data; },
			function(response){	return $q.reject(response.data);});	
		},
		updateTaskStatus: function(obj){
			return $http.post('/updateTaskstatus_mindmaps', {
				obj : obj,
			})
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
		}
	}
}]);
mySPA.factory('socket', ['$rootScope', function($rootScope) {
	//	var socket = io.connect();
	if(window.localStorage['_UI'])
	var userName= Encrypt.encode(JSON.parse(window.localStorage['_UI']).username);
	var param={check:'notify'};
	$rootScope.socket = io('', { forceNew: true, reconnect: true, query: param});
	$rootScope.socket.emit("key",userName);
	return {
		on: function(eventName, callback){
			$rootScope.socket.on(eventName, callback);
		},
		emit: function(eventName, data) {
			$rootScope.socket.emit(eventName, data);
		}
	};
}])
