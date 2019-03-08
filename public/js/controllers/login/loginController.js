mySPA.controller('loginController', function ($scope, $rootScope, $timeout, $http, $location, LoginService, cfpLoadingBar, adminServices) {
	$(".ic-username, .ic-password").parent().removeClass("input-border-error");
	$scope.loginValidation = "";
	$scope.ud = {};
	$scope.serverList = [{"name": "License Server", "active": false}, {"name": "NDAC Server", "active": false}, {"name": "Web Server", "active": false}];
	$scope.restartForm = false;
	document.getElementById("currentYear").innerHTML = new Date().getFullYear();

	$scope.check_credentials = function (path, $event) {
		cfpLoadingBar.start();
		$scope.loginValidation = "";
		$(".ic-username, .ic-password").parent().removeClass("input-border-error");
		if (!$scope.ud.userName) {
			$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
			$(".ic-username").parent().addClass("input-border-error");
			$(".ic-password").children().attr("src", "imgs/ic-password.png");
			$(".ic-password").parent().removeClass("input-border-error");
			$scope.loginValidation = "Please Enter Username";
			cfpLoadingBar.complete();
		} else if (!$scope.ud.password) {
			$(".ic-username").children().attr("src", "imgs/ic-username.png");
			$(".ic-username").parent().removeClass("input-border-error");
			$(".ic-password").children().attr("src", "imgs/ic-password-error.png");
			$(".ic-password").parent().addClass("input-border-error");
			$scope.loginValidation = "Please Enter Password";
			cfpLoadingBar.complete();
		} else {
			var username = $scope.ud.userName.toLowerCase();
			var password = $scope.ud.password;
			LoginService.authenticateUser_Nineteen68(username, password)
			.then(function (data) {
				cfpLoadingBar.complete();
				if (data == "restart") {
					blockUI("Fetching active services...");
					adminServices.restartService("query")
					.then(function (data) {
						if (data == "fail") {
							$scope.loginValidation = "Failed to fetch services.";
						} else {
							$scope.restartForm = true;
							data.forEach(function(e, i){
								$scope.serverList[i].active = e;
							});
						}
						unblockUI();
					}, function (error) {
						unblockUI();
						$scope.loginValidation = "Failed to fetch services.";
					});
				} else if (data == 'validCredential') {
					$(".ic-username").children().attr("src", "imgs/ic-username.png");
					$(".ic-password").children().attr("src", "imgs/ic-password.png");
					$(".ic-username, .ic-password").parent().removeClass("input-border-error");
					$scope.loginButtonValidation = "";
					window.location = '/';
				} else if (data == 'inValidCredential') {
					$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
					$(".ic-password").children().attr("src", "imgs/ic-password-error.png");
					$(".ic-password").parent().addClass("input-border-error");
					$scope.loginValidation = "The username or password you entered isn't correct. Please try again.";
				} else if (data == "userLogged") {
					$scope.loginValidation = "User is already logged in! Please logout from the previous session.";
				} else if (data == "inValidLDAPServer") {
					$scope.loginValidation = "LDAP Server Configuration is invalid!";
				} else if (data == 'invalid_username_password') {
					$scope.loginValidation = "The username or password you entered isn't correct. Please try again.";
				} else {
					$scope.loginValidation = "Failed to Login.";
				}
			}, function (error) {
				console.log("Failed to Authenticate User.");
				$scope.loginValidation = "Failed to Authenticate User.";
				cfpLoadingBar.complete();
			});
		}
	};

	$scope.restartServer = function (serverid, serverName) {
		var errmsg = "Fail to restart " + serverName + " service!";
		blockUI("Please wait while " + serverName + " service is being restarted...");
		adminServices.restartService(serverid)
		.then(function (data) {
			if (data == "success") {
				setTimeout(function(){
					unblockUI();
					openModalPopup("Restart Service", serverName+" service is restarted successfully!!");
				}, 120 * 1000);
			} else {
				unblockUI();
				if (data == "na") errmsg = "Service is not found. Ensure "+serverName+" is running as a service.";
				openModalPopup("Restart Service", errmsg);
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Restart Service", errmsg);
		});
	};

	function openModalPopup(title, body){
		var mainModal = $("#popupModal");
		mainModal.find('.modal-title').text(title);
		mainModal.find('.modal-body p').text(body);
		mainModal.modal("show");
		setTimeout(function(){
			$("#popupModal").find('.btn-default').focus();
		}, 300);
	}
});
