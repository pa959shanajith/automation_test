mySPA.factory('LoginService', ['$http', '$q', function ($http, $q) {
	return {
		//Checking User Validation
		authenticateUser: function (username, password) {
			return $http.post('/login', {
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
		loadUserInfo: function (selRole) {
			var param = "loadUserInfo";
			return $http.post('/loadUserInfo', {
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
		resetPassword: function (newpassword,currpassword) {
			return $http.post('/resetPassword', {
				newpassword: newpassword,
				currpassword: currpassword
			})
			.then(function (response) {
				return response.data
			},
				function (response) {
				return $q.reject(response.data)
			})
		},
		getRoleNameByRoleId: function (roleasarray) {
			var param = "getRoleNameByRoleId";
			return $http.post('/getRoleNameByRoleId', {
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
		checkUserState: function () {
			return $http.post('/checkUserState')
			.then(function (response) {
				return response.data;
			},
				function (response) {
				return $q.reject(response.data);
			});
		},
		checkUser: function (user) {
			return $http.post('/checkUser', {
				username: user
			})
			.then(function (response) {
				return response.data;
			},
				function (response) {
				return $q.reject(response.data);
			});
		}
	}
}]);
