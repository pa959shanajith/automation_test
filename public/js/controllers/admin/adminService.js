mySPA.factory('adminServices', ['$http', '$q', function ($http, $q) {
	return {
		getUserRoles_Nineteen68: function () {
			return $http.post('/getUserRoles_Nineteen68')
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		manageUserDetails: function (action, userObj) {
			return $http.post('/manageUserDetails', {
				action: action,
				user: userObj
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		getUserDetails: function (action, args) {
			return $http.post('/getUserDetails', {
				action: action,
				args: args
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		getDomains_ICE: function () {
			return $http.post('/getDomains_ICE')
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		createProject_ICE: function (createprojectObj, userDetails) {
			return $http.post('/createProject_ICE', {
				userDetails: userDetails,
				createProjectObj: createprojectObj
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		updateProject_ICE: function (updateProjectObj, userDetails) {
			return $http.post('/updateProject_ICE', {
				userDetails: userDetails,
				updateProjectObj: updateProjectObj
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		getNames_ICE: function (requestedids, idtype) {
			return $http.post('/getNames_ICE', {
				requestedids: requestedids,
				idtype: idtype
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		getDetails_ICE: function (idtype, requestedids) {
			return $http.post('/getDetails_ICE', {
				idtype: idtype,
				requestedids: requestedids
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		assignProjects_ICE: function (assignProjectsObj) {
			return $http.post('/assignProjects_ICE', {
				assignProjectsObj: assignProjectsObj
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		getAssignedProjects_ICE: function (getAssignProj) {
			return $http.post('/getAssignedProjects_ICE', {
				getAssignProj: getAssignProj
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		getAvailablePlugins: function () {
			return $http.post('/getAvailablePlugins')
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		generateCItoken: function () {
			return $http.post('/generateCItoken')
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		manageCIUsers: function (action,CIUser) {
			return $http.post('/manageCIUsers', {
				action: action,
				CIUser: CIUser
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		getCIUsersDetails: function (CIUser) {
			return $http.post('/getCIUsersDetails',{
				CIUser: CIUser
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		manageSessionData: function (action, user, key, reason) {
			return $http.post('/manageSessionData', {
				action: action,
				user: user,
				key: key,
				reason: reason
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		restartService : function(i){
			return $http.post('/restartService',{
				id : i
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		testLDAPConnection: function (auth, url, baseDN, bindDN, bindCredentials) {
			return $http.post('/testLDAPConnection', {
				authType: auth,
				ldapURL: url,
				baseDN: baseDN,
				username: bindDN,
				password: bindCredentials
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		manageLDAPConfig: function (action, confObj) {
			return $http.post('/manageLDAPConfig', {
				action: action,
				conf: confObj
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		getLDAPConfig: function (action, args, opts) {
			return $http.post('/getLDAPConfig', {
				action: action,
				args: args,
				opts: opts
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		manageSAMLConfig: function (action, confObj) {
			return $http.post('/manageSAMLConfig', {
				action: action,
				conf: confObj
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		getSAMLConfig: function (name) {
			return $http.post('/getSAMLConfig', {
				name: name
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		manageOIDCConfig: function (action, confObj) {
			return $http.post('/manageOIDCConfig', {
				action: action,
				conf: confObj
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		getOIDCConfig: function (name) {
			return $http.post('/getOIDCConfig', {
				name: name
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		getPreferences: function () {
			return $http.post('/getPreferences')
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		fetchICE: function (args) {
			return $http.post('/fetchICE', {
				user: args
			})
			.then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		},
		provisions: function (tokeninfo) {
			return $http.post('/provisionIce',{
				tokeninfo:tokeninfo
			}).then(function(response) { return response.data },
			function(response) { return $q.reject(response.data) });
		}
	};
}]);
