mySPA.controller('baseController', function ($scope, $rootScope, $timeout, $http, $location, LoginService, cfpLoadingBar) {
	$(".ic-username, .ic-password").parent().removeClass("input-border-error")
	$scope.loginValidation = "Loading Profile...";
	document.getElementById("currentYear").innerHTML = new Date().getFullYear();
	var chkLogOut = window.sessionStorage.getItem('checkLoggedOut');
	var chkLogIn = window.sessionStorage.getItem('checkLoggedIn');
	window.localStorage.clear();
	window.sessionStorage.clear();
	//if checkLoggedIn was true, means, user was logged in but now the session is expired
	if (chkLogOut) {
		$scope.loginValidation = "You Have Successfully Logged Out!";
		cfpLoadingBar.complete();
	} else if (chkLogIn) {
		$scope.loginValidation = "Your session has expired, Please login again";
		cfpLoadingBar.complete();
	} else {
		LoginService.checkState_Nineteen68()
		.then(function (res) {
			cfpLoadingBar.complete();
			var data = res.headers().message;
			var emsg = '';
			if (data == "fail") {
				emsg = "Failed to load user profile.";
			} else if (data == "userLogged") {
				emsg = "User is already logged in! Please logout from the previous session.";
			} else {
				LoginService.loadUserInfo_Nineteen68()
				.then(function (data) {
					if (data != "fail") {
						window.localStorage['_SR'] = data.rolename;
						defaultRole = data.rolename;
						window.localStorage['_UI'] = JSON.stringify(data);
						window.sessionStorage["checkLoggedIn"] = true;
						if (data.rolename == "Admin") {
							window.localStorage['navigateScreen'] = "admin";
							$location.path("/admin");
						} else {
							window.localStorage['navigateScreen'] = "plugin";
							$location.path("/plugin");
						}
					} else {
						$scope.loginValidation = "Failed to Login.";
						console.log("Failed to Load UserInfo.");
					}
				}, function (error) {
					$scope.loginValidation = "Failed to Login.";
					console.log("Fail to Load UserInfo")
				});
			}
			console.log(emsg)
			$scope.loginValidation = emsg;
		}, function (error) {
			var emsg = "Failed to load user profile.";
			console.log(emsg)
			$scope.loginValidation = emsg;
			cfpLoadingBar.complete();
		});
	}

});
