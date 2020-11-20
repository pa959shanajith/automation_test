mySPA.controller('baseController', function ($scope, $rootScope, $timeout, $http, $location, LoginService, cfpLoadingBar) {
	$scope.loginValidation = "Loading Profile...";
	$scope.loginAgain = true;
	document.getElementById("currentYear").innerHTML = new Date().getFullYear();
	const chkLogOut = JSON.parse(window.sessionStorage.getItem('checkLoggedOut'));
	var reqVal = {};
	window.localStorage.clear();
	window.sessionStorage.clear();
	$('.row').addClass('displayRow');
	$('.jumbotron').addClass('displayBgTransparent');
	//if chkLogOut was true, then either user logged out manually or their session is terminated else session is expired due to user inactivity
	if (chkLogOut) {
		if ((typeof(chkLogOut) == "object") && (chkLogOut.length == 2)) {
			$scope.loginValidation = "Your session has been terminated by "+chkLogOut[0];
			if (chkLogOut[1] == "dereg") $(".absoluteError.errorMessages span").html("Reason: User is deleted from Avo Assure");
		} else {
			$scope.loginValidation = "You Have Successfully Logged Out!";
		}
		cfpLoadingBar.complete();
	} else {
		$scope.loginAgain = false;
		LoginService.validateUserState()
		.then(function (data) {
			cfpLoadingBar.complete();
			var emsg = "Loading Profile...";
			if (data == "fail") emsg = "Failed to load user profile.";
			else if (data == "unauthorized") emsg = "User is not authorized to use Avo Assure.";
			else if (data == "badrequest") emsg = "User does not have sufficient permission to view this page.";
			else if (data == "nouser") emsg = "User profile not found in Avo Assure.";
			else if (data == "nouserprofile") emsg = "User profile not found in Authorization Server.";
			else if (data == "userLogged") emsg = "User is already logged in! Please logout from the previous session.";
			else if (data == "inValidCredential" || data == "invalid_username_password") emsg = "The username or password you entered isn't correct. Please try again.";
			else if (data == "noProjectsAssigned") emsg = "To Login, user must be allocated to a Domain and Project. Please contact Admin.";
			else if (data == "redirect") $location.path("/login"); //window.location = "/login";
			else if (data == "reload") window.location.reload();
			else if (data == "Invalid Session") {
				emsg = "Your session has expired!";
				$scope.loginAgain = true;
			} else {
				LoginService.loadUserInfo()
				.then(function (data) {
					if (data == "fail") emsg = "Failed to Login.";
					else if (data == "Invalid Session") {
						emsg = "Your session has expired!";
						$scope.loginAgain = true;
					} else {
						//t and c popup  displayed here
						if (data.eulaData == "fail" && data.page== "plugin"){
							var mainModal = $("#tAndCpop");
							mainModal.modal("show");
							reqVal = data
						}
						if (data.page != "plugin" || data.eulaData == "success" || data.tandc=="False"){
							window.localStorage['_SR'] = data.rolename;
							window.localStorage['_UI'] = JSON.stringify(data);
							window.localStorage.navigateScreen = data.page;
							$location.path("/"+data.page);
						}
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
	$scope.declineB = function($event){
		var x = document.getElementById("declineBtn");
		if (x.innerHTML=="Decline"){
			console.log("x value is "+ (x.innerHTML));
			var userName = reqVal["username"];
			var userId = reqVal["user_id"];
			var firstName = reqVal["firstname"];
			var lastName = reqVal["lastname"];
			var fullName = firstName+" "+lastName;
			var acceptance = x.innerHTML;
			var email = reqVal["email_id"];
			var timeStamp = new Date().toLocaleString();
			var bfp = browserFp()
			var userDataList = [];
			userDataList.push({
				'username': userName,
				'user_id' : userId,
				'fullname': fullName,			
				'emailaddress': email,
				'acceptance': acceptance,
				'timestamp': timeStamp,
				'browserfp': bfp
			});
			LoginService.storeUserDetails(userDataList)
				.then(function (data) {
					if(data == "Invalid Session") {
						openModelPopup("store user Details", "failed to save");
					} 
					else if(data == "success"){
						userDataList = [];
						var mainModal = $("#tAndCpop");
						mainModal.modal("hide");
						window.sessionStorage.clear();
						window.sessionStorage["checkLoggedOut"] = true;
						$rootScope.redirectPage();
						window.location.reload()
					}
				},function(error) {
					console.log("Error updating task status " + (error.data));
				});
		}
	};

	$scope.AcceptB = function($event){
		var x = document.getElementById("acceptBtn");
		console.log("reqVal value is "+ (reqVal))
		if (x.innerHTML=="Accept"){
			console.log("x value is "+ (x.innerHTML));
			var userName = reqVal["username"];
			var userId = reqVal["user_id"];
			var firstName = reqVal["firstname"];
			var lastName = reqVal["lastname"];
			var fullName = firstName+" "+lastName;
			var acceptance = x.innerHTML;
			var email = reqVal["email_id"];
			var timeStamp = new Date().toLocaleString();
			var bfp = browserFp()
			var userDataList = [];
			userDataList.push({
				'username': userName,
				'user_id' : userId,
				'fullname': fullName,			
				'emailaddress': email,
				'acceptance': acceptance,
				'timestamp': timeStamp,
				'browserfp': bfp
			});
			LoginService.storeUserDetails(userDataList)
				.then(function (data) {
					if(data == "Invalid Session") {
						openModelPopup("store user Details", "failed to save");
					} 
					else if(data == "success"){
						userDataList = [];
						var mainModal = $("#tAndCpop");
						mainModal.modal("hide");
					}
				},function(error) {
					console.log("Error updating task status " + (error.data));
				});

		}
		window.localStorage['_SR'] = reqVal.rolename;
		window.localStorage['_UI'] = JSON.stringify(reqVal);
		window.localStorage.navigateScreen = reqVal.page;
		$location.path("/"+reqVal.page);
	};
});
