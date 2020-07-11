mySPA.controller('baseController', function ($scope, $rootScope, $timeout, $http, $location, LoginService, cfpLoadingBar) {
	$scope.loginValidation = "Loading Profile...";
	$scope.loginAgain = true;
	document.getElementById("currentYear").innerHTML = new Date().getFullYear();
	const chkLogOut = JSON.parse(window.sessionStorage.getItem('checkLoggedOut'));
	window.localStorage.clear();
	window.sessionStorage.clear();
	$('.row').addClass('displayRow');
	$('.jumbotron').addClass('displayBgTransparent');
	//if chkLogOut was true, then either user logged out manually or their session is terminated else session is expired due to user inactivity
	if (chkLogOut) {
		if ((typeof(chkLogOut) == "object") && (chkLogOut.length == 2)) {
			$scope.loginValidation = "Your session has been terminated by "+chkLogOut[0];
			if (chkLogOut[1] == "dereg") $(".absoluteError.errorMessages span").html("Reason: User is deleted from Nineteen68");
		} else {
			$scope.loginValidation = "You Have Successfully Logged Out!";
		}
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
			else if (data == "inValidCredential" || data == "invalid_username_password") emsg = "The username or password you entered isn't correct. Please try again.";
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
