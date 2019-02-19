mySPA.controller('baseController', function ($scope, $rootScope, $timeout, $http, $location, LoginService, cfpLoadingBar) {
	$scope.loginValidation = "Loading Profile...";
	$scope.loginAgain = true;
	document.getElementById("currentYear").innerHTML = new Date().getFullYear();
	var chkLogOut = window.sessionStorage.getItem('checkLoggedOut');
	window.localStorage.clear();
	window.sessionStorage.clear();
	//if chkLogOut was true, then user logged out manually else if chkLogIn was true, then user was logged in but now the session is expired
	if (chkLogOut) {
		$scope.loginValidation = "You Have Successfully Logged Out!";
		cfpLoadingBar.complete();
	} else {
		$scope.loginAgain = false;
		LoginService.checkUserState_Nineteen68()
		.then(function (data) {
			cfpLoadingBar.complete();
			var emsg = "Loading Profile...";
			if (data == "fail") emsg = "Failed to load user profile.";
			else if (data == "unauthorized") emsg = "User is not authorized to use Nineteen68.";
			else if (data == "badrequest") emsg = "User does not have sufficient permission to view this page.";
			else if (data == "userLogged") emsg = "User is already logged in! Please logout from the previous session.";
			else if (data == "invalid_username") emsg = "The username or password you entered isn't correct. Please try again.";
			else if (data == "inValidCredential") emsg = "The username or password you entered isn't correct. Please try again.";
			else if (data == "noProjectsAssigned") emsg = "To Login, user must be allocated to a Domain and Project. Please contact Admin.";
			else if (data == "reload") window.location.reload();
			else if (data == "Invalid Session") {
				emsg = "Your session has expired!";
				$scope.loginAgain = true;
			} else {
				LoginService.loadUserInfo_Nineteen68()
				.then(function (data) {
					if (data == "fail") emsg = "Failed to Login.";
					else if (data == "Invalid Session") {
						emsg = "Your session has expired!";
						$scope.loginAgain = true;
					} else {
						window.localStorage['_SR'] = data.rolename;
						window.localStorage['_UI'] = JSON.stringify(data);
						window.localStorage.navigateScreen = data.page;
						$location.path("/"+data.page);
					}
					$scope.loginValidation = emsg;
					if (emsg != "Loading Profile...") console.log(emsg);
				}, function (error) {
					$scope.loginValidation = "Failed to Login.";
					console.log("Fail to Load UserInfo");
				});
			}
			$scope.loginValidation = emsg;
			if (emsg != "Loading Profile...") console.log(emsg);
		}, function (error) {
			var emsg = "Failed to load user profile.";
			console.log(emsg);
			$scope.loginValidation = emsg;
			cfpLoadingBar.complete();
		});
	}
});
