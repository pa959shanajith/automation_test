mySPA.factory('LoginService', ['$http', '$q', function ($http, $q) {
	return {
		//Checking User Validation
		authenticateUser_Nineteen68: function (username, password) {
			return $http.post('/authenticateUser_Nineteen68', {
				username: username,
				password: password
			})
			.then(function (response) {
				return response.data
			},
				function (response) {
				return $q.reject(response.data)
			})
		},
		loadUserInfo_Nineteen68: function (selRole) {
			var param = "loadUserInfo_Nineteen68";
			return $http.post('/loadUserInfo_Nineteen68', {
				action: param,
				selRole: selRole
			})
			.then(function (response) {
				return response.data;
			},
				function (response) {
				return $q.reject(response.data);
			});
		},
		getRoleNameByRoleId_Nineteen68: function (roleasarray) {
			var param = "getRoleNameByRoleId_Nineteen68";
			return $http.post('/getRoleNameByRoleId_Nineteen68', {
				action: param,
				role: roleasarray,
			})
			.then(function (response) {
				return response.data;
			},
				function (response) {
				return $q.reject(response.data);
			});
		},
		checkUserState_Nineteen68: function () {
			return $http.post('/checkUserState_Nineteen68')
			.then(function (response) {
				return response.data;
			},
				function (response) {
				return $q.reject(response.data);
			});
		}
	}
}]);
