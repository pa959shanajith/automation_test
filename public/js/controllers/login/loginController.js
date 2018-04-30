mySPA.controller('loginController', function ($scope, $rootScope, $timeout, $http, $location, LoginService, cfpLoadingBar) {
	$(".ic-username, .ic-password").parent().removeClass("input-border-error")
	$scope.loginValidation = "";
	window.localStorage.clear();
	window.localStorage['LoginSuccess'] = "False";
	document.getElementById("currentYear").innerHTML = new Date().getFullYear();
	
	///if checkLoggedIn was true, means, user was logged in but now the session is expired 
	if(window.sessionStorage.getItem('checkLoggedIn') == "true"){
		$scope.loginValidation = "Your session has expired, Please login again";
		window.sessionStorage['checkLoggedIn'] = "false";
	}
	
	$scope.check_credentials = function (path) {
		cfpLoadingBar.start();
		$scope.loginValidation = "";
		$(".ic-username, .ic-password").parent().removeClass("input-border-error")
		if (!$scope.userName) {
			$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
			$(".ic-username").parent().addClass("input-border-error")
			$(".ic-password").children().attr("src", "imgs/ic-password.png");
			$(".ic-password").parent().removeClass("input-border-error")
			$scope.loginValidation = "Please Enter Username";
			cfpLoadingBar.complete();
		}
		else if (!$scope.password) {
			$(".ic-username").children().attr("src", "imgs/ic-username.png");
			$(".ic-username").parent().removeClass("input-border-error")
			$(".ic-password").children().attr("src", "imgs/ic-password-error.png");
			$(".ic-password").parent().addClass("input-border-error")
			$scope.loginValidation = "Please Enter Password";
			cfpLoadingBar.complete();
		}
		else {
			var username = $scope.userName.toLowerCase();
			var password = $scope.password;
			LoginService.authenticateUser_Nineteen68(username, password)
			.then(function (data) {
				if(data != "fail" && data != "noProjectsAssigned"  && data!= "invalid_username_password"){
					if (data == 'inValidCredential') {
						$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
						$(".ic-password").children().attr("src", "imgs/ic-password-error.png");
						$(".ic-password").parent().addClass("input-border-error")
						$scope.loginValidation = "The username or password you entered isn't correct. Please try again.";
						cfpLoadingBar.complete();
					} else if(data == "userLogged"){
						$scope.loginValidation = "User is already logged in! Please logout from the previous session.";
						cfpLoadingBar.complete();
					} else if (data == 'validCredential') {
						cfpLoadingBar.complete();
						$(".ic-username").children().attr("src", "imgs/ic-username.png");
						$(".ic-password").children().attr("src", "imgs/ic-password.png");
						$(".ic-username, .ic-password").parent().removeClass("input-border-error");
						$scope.loginButtonValidation = "";
						LoginService.loadUserInfo_Nineteen68()
						.then(function (data) {
							if(data != "fail"){
								window.localStorage['LoginSuccess'] = "True";
								window.localStorage['_SR'] = data.rolename;
								window.localStorage['_UI'] = JSON.stringify(data);
								window.sessionStorage["checkLoggedIn"]= "true";
								if(data.rolename == "Admin"){
									window.localStorage['navigateScreen'] = "admin";
									$location.path( "/admin");
								}
								else{
									window.localStorage['navigateScreen'] = "plugin";
									$location.path( "/plugin");
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
				} else if(data == 'noProjectsAssigned') {
					$scope.loginValidation = "To Login, user must be allocated to a Domain and Project. Please contact Admin.";
					cfpLoadingBar.complete();
				} else if(data == 'invalid_username_password') {
					$scope.loginValidation = "The username or password you entered isn't correct. Please try again.";
					console.log("Invalid username or password");
					cfpLoadingBar.complete();
				} else {
					$scope.loginValidation = "Failed to Login.";
					console.log("Fail to Login.")
					cfpLoadingBar.complete();
				}
			}, function (error) {
				console.log("Failed to Authenticate User.")
				$scope.loginValidation = "Failed to Authenticate User.";
				cfpLoadingBar.complete();
			});
		}
	}
});
