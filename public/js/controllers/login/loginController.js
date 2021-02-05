mySPA.controller('loginController', function ($scope, $rootScope, $timeout, $http, $location, LoginService, cfpLoadingBar, adminServices) {
	$(".ic-username, .ic-password").parent().removeClass("input-border-error");
	$scope.loginValidation = "";
	$scope.ud = {};
	$scope.inputType = 'password';
	$scope.showLogin = false;
	$scope.unlockCond = false;
	$scope.requested = false;
	$scope.lockedOut = false;
    $scope.showHideClass = 'fa-eye';
	$scope.serverList = [{"name": "License Server", "active": false}, {"name": "DAS Server", "active": false}, {"name": "Web Server", "active": false}];
	$scope.restartForm = false;
	document.getElementById("currentYear").innerHTML = new Date().getFullYear();

	$scope.showPassword=function() {
		if($scope.inputType == 'password') {
			$scope.inputType = 'text';
			$scope.showHideClass = 'fa-eye-slash';
		} else {
			$scope.inputType = 'password';
			$scope.showHideClass = 'fa-eye';
		}
	}

	$scope.hideLogin = function() {
		$scope.showLogin = false;
		$scope.unlockCond = false;
		$scope.loginValidation = "";
		$scope.ud.password = "";
		if ($scope.inputType == "text") $scope.showPassword();
		$(".ic-username, .ic-password").parent().removeClass("input-border-error");
		$(".ic-username").children().attr("src", "imgs/ic-username.png");
		$(".ic-password").children().attr("src", "imgs/ic-password.png");
	};

	$(document).on('keyup', '#userName', function keyuphandler(event) {
		if (!$scope.showLogin && event.keyCode == '13') $scope.checkUser();
	});

	$scope.checkUser = function() {
		if ($scope.requested) return false;
		const err = "Failed to Login.";
		$scope.loginValidation = "";
		$(".ic-username").parent().removeClass("input-border-error");
		$(".ic-username").children().attr("src", "imgs/ic-username.png");
		if (!$scope.ud.userName) {
			$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
			$(".ic-username").parent().addClass("input-border-error");
			$scope.loginValidation = "Please Enter Username";
			cfpLoadingBar.complete();
			return false;
		}
		$scope.requested = true;
		LoginService.checkUser($scope.ud.userName).then(function (data) {
			cfpLoadingBar.complete();
			$scope.requested = false;
			if (data.redirect) {
				window.location.href = data.redirect;
			} else if (data.proceed) {
				$scope.showLogin = true;
				//$("#userName").attr("disabled",true);
			} else if (data == "invalidServerConf") $scope.loginValidation = "Authentication Server Configuration is invalid!";
			else $scope.loginValidation = err;
		}, function (error) {
			console.log(err);
			$scope.loginValidation = err;
			cfpLoadingBar.complete();
			$scope.requested = false;
		});
	}

	$scope.check_credentials = function (path, $event) {
		cfpLoadingBar.start();
		$scope.loginValidation = "";
		$(".ic-username, .ic-password").parent().removeClass("input-border-error");
		$(".ic-username").children().attr("src", "imgs/ic-username.png");
		$(".ic-password").children().attr("src", "imgs/ic-password.png");
		if (!$scope.ud.userName) {
			$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
			$(".ic-username").parent().addClass("input-border-error");
			$scope.loginValidation = "Please Enter Username";
			cfpLoadingBar.complete();
		} else if (!$scope.ud.password) {
			$(".ic-password").children().attr("src", "imgs/ic-password-error.png");
			$(".ic-password").parent().addClass("input-border-error");
			$scope.loginValidation = "Please Enter Password";
			cfpLoadingBar.complete();
		} else {
			var username = $scope.ud.userName.toLowerCase();
			var password = $scope.ud.password;
			$scope.requested = true;
			$scope.lockedOut = false;
			LoginService.authenticateUser(username, password)
			.then(function (data) {
				cfpLoadingBar.complete();
				$scope.requested = false;
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
					$location.path("/");
				} else if (data == 'inValidCredential' || data == "invalid_username_password") {
					$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
					$(".ic-password").children().attr("src", "imgs/ic-password-error.png");
					$(".ic-password").parent().addClass("input-border-error");
					$scope.loginValidation = "The username or password you entered isn't correct. Please try again.";
				} else if (data == "changePwd") {
					$scope.changePwdPopup();
				} else if(data == "timeout") {
					$scope.loginValidation = "User Password has expired. Please reset forgot password or contact admin";
				} else if (data == "userLocked") {
					$scope.loginValidation = "User account is locked!";
					$scope.lockedOut = true;
					$('#forgotPassword').hide();
				}
				else if (data == "userLogged") $scope.loginValidation = "User is already logged in! Please logout from the previous session.";
				else if (data == "inValidLDAPServer") $scope.loginValidation = "LDAP Server Configuration is invalid!";
				else if (data == "invalidUserConf") $scope.loginValidation = "User-LDAP mapping is incorrect!";
				else $scope.loginValidation = "Failed to Login.";
			}, function (error) {
				console.log("Failed to Authenticate User.");
				$scope.loginValidation = "Failed to Authenticate User.";
				cfpLoadingBar.complete();
				$scope.requested = false;
			});
		}
	};

	// unlock user account
	$scope.unlock = function (path, $event) {
		cfpLoadingBar.start();
		$scope.loginValidation = "";
		$scope.lockedOut = false;
		$(".ic-username, .ic-password").parent().removeClass("input-border-error");
		$(".ic-username").children().attr("src", "imgs/ic-username.png");
		$(".ic-password").children().attr("src", "imgs/ic-password.png");
		if (!$scope.ud.userName) {
			$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
			$(".ic-username").parent().addClass("input-border-error");
			$scope.loginValidation = "Please Enter Username";
			cfpLoadingBar.complete();
		} else if (!$scope.ud.password) {
			$(".ic-password").children().attr("src", "imgs/ic-password-error.png");
			$(".ic-password").parent().addClass("input-border-error");
			$scope.loginValidation = "Please Enter Password";
			cfpLoadingBar.complete();
		} else {
			var username = $scope.ud.userName.toLowerCase();
			var password = $scope.ud.password;
			$scope.requested = true;
			LoginService.unlock(username, password)
			.then(function (data) {
				cfpLoadingBar.complete();
				$scope.requested = false;
				if (data == 'success') {
					$(".ic-username").children().attr("src", "imgs/ic-username.png");
					$(".ic-password").children().attr("src", "imgs/ic-password.png");
					$(".ic-username, .ic-password").parent().removeClass("input-border-error");
					$('#loginButton').show();
					$('#unlockButton').hide();
					$scope.unlockCond = false;
					openHeaderModalPopup("unlockAccSuccess");
				} else if (data == "invalid_username_password") {
					$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
					$(".ic-password").children().attr("src", "imgs/ic-password-error.png");
					$(".ic-password").parent().addClass("input-border-error");
					$scope.loginValidation = "The username or password you entered isn't correct. Please try again.";
				} else if(data == "timeout") $scope.loginValidation = "Password expired."; 
				else if (data == "userUnlocked") $scope.loginValidation = "User account is already unlocked!"; 
				else $scope.loginValidation = "Failed to Login.";
			}, function (error) {
				console.log("Failed to Authenticate User.");
				$scope.loginValidation = "Failed to Authenticate User.";
				cfpLoadingBar.complete();
				$scope.requested = false;
			});
		}
	};

	$scope.forgotPasswordEmail = function () {
		cfpLoadingBar.start();
		$scope.loginValidation = "";
		$scope.forgotPassLogin = "";
		$scope.lockedOut = false;
		$(".ic-username").parent().removeClass("input-border-error");
		if (!$scope.ud.userName) {
			$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
			$(".ic-username").parent().addClass("input-border-error");
			$scope.loginValidation = "Please Enter Username";
		} else {
			var username = $scope.ud.userName.toLowerCase();
			LoginService.forgotPasswordEmail(username)
			.then(function (data) {
				cfpLoadingBar.complete();
				if (data == 'success') {
					$(".ic-username").children().attr("src", "imgs/ic-username.png");
					$(".ic-password").children().attr("src", "imgs/ic-password.png");
					$(".ic-username, .ic-password").parent().removeClass("input-border-error");
					openHeaderModalPopup("forgotPassEmailSuccess");
				} else if (data == "invalid_username_password") {
					$(".ic-username").children().attr("src", "imgs/ic-username.png");
					$(".ic-password").children().attr("src", "imgs/ic-password-error.png");
					$(".ic-password").parent().addClass("input-border-error");
					$scope.loginValidation = "The username or password you entered isn't correct. Please try again.";
				} else if (data == "userLocked") {
					$scope.loginValidation = "User account is locked!"; 
					$scope.lockedOut = true;
					$('#forgotPassword').hide();
				}
				else $scope.loginValidation = "Failed to Login.";
			}, function (error) {
				console.log(err);
				$scope.loginValidation = err;
				cfpLoadingBar.complete();
				$scope.requested = false;
			});
		}
	};

	$scope.unlockAccountEmail = function () {
		cfpLoadingBar.start();
		$scope.loginValidation = "";
		$(".ic-username").parent().removeClass("input-border-error");
		if (!$scope.ud.userName) {
			$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
			$(".ic-username").parent().addClass("input-border-error");
			$scope.loginValidation = "Please Enter Username";
		} else {
			var username = $scope.ud.userName.toLowerCase();
			LoginService.unlockAccountEmail(username)
			.then(function (data) {
				cfpLoadingBar.complete();
				if (data == 'success') {
					$(".ic-username").children().attr("src", "imgs/ic-username.png");
					$(".ic-password").children().attr("src", "imgs/ic-password.png");
					$(".ic-username, .ic-password").parent().removeClass("input-border-error");
					$scope.ud.password = "";
					$('#loginButton').hide();
					$('#forgotPassword').hide();
					$('#unlockButton').show();
					$scope.unlockCond = true;
					openHeaderModalPopup("unlockAccEmailSuccess");
				} else if (data == "invalid_username_password") {
					$(".ic-username").children().attr("src", "imgs/ic-username.png");
					$(".ic-password").children().attr("src", "imgs/ic-password-error.png");
					$(".ic-password").parent().addClass("input-border-error");
					$scope.loginValidation = "The username or password you entered isn't correct. Please try again.";
				} else if (data == "userUnlocked") $scope.loginValidation = "User account is already unlocked!";  
				else $scope.loginValidation = "Failed to Login.";
			}, function (error) {
				console.log(err);
				$scope.loginValidation = err;
				cfpLoadingBar.complete();
				$scope.requested = false;
			});
		}
	};

	$scope.resetAllFields = function(){
		$scope.username = "";
		$scope.newpassword = "";
		$scope.confpassword = "";
		$scope.passwordValidation = "";
		$(".fpcurrpass, .fpnewpass, .fpconfpass").parent().removeClass("input-border-error");
	};

	$scope.changePwd = function(){
		$scope.passwordValidation = "";
		$(".fpcurrpass, .fpnewpass, .fpconfpass").parent().removeClass("input-border-error");
		var currpassword = $scope.currpassword;
		var newpassword = $scope.newpassword;
		var confpassword = $scope.confpassword;
		var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		if (!currpassword) {
			$(".fpcurrpass").parent().addClass("input-border-error");
			$scope.passwordValidation = "Current Password field is empty.";
		} else if (!newpassword) {
			$(".fpnewpass").parent().addClass("input-border-error");
			$scope.passwordValidation = "New Password field is empty.";
		} else if (!regexPassword.test(newpassword)) {
			$(".fpnewpass").parent().addClass("input-border-error");
			$scope.passwordValidation = "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..";
		} else if (!confpassword) {
			$(".fpconfpass").parent().addClass("input-border-error");
			$scope.passwordValidation = "Confirm Password field is empty.";
		} else if (currpassword == newpassword) {
			$(".fpcurrpass, .fpnewpass, .fpconfpass").parent().addClass("input-border-error");
			$scope.passwordValidation = "Current Password and New Password should not be same";
		}  else if (newpassword != confpassword) {
			$(".fpnewpass, .fpconfpass").parent().addClass("input-border-error");
			$scope.passwordValidation = "New Password and Confirm Password do not match";
		}  else {
			LoginService.resetPassword(newpassword,currpassword)
			.then(function (data) {
				if(data == "Invalid Session"){
					$scope.passwordValidation = "Invalid Session";
				} else if(data == "success") {
					$("#changePassPopup").modal("hide");
					openHeaderModalPopup("changeSuccessPopup");
				} else if(data == "incorrect") {
					$(".ic-currpassword").parent().addClass("input-border-error");
					$scope.passwordValidation = "Current Password is incorrect";
				} else if(data == "reusedPass" || data == "insuff" || data == "same") {
					$(".ic-newpassword").parent().addClass("input-border-error");
					$(".ic-confpassword").parent().addClass("input-border-error");
					if (data == "same") $scope.passwordValidation = "New Password provided is same as old password";
					else if (data == "insuff") $scope.passwordValidation = "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase alphabet, length should be minimum 8 characters and maximum 16 characters.";
					else $scope.passwordValidation = "Password provided does not meet length, complexity or history requirements of application.";
				} else if(data == "fail") {
					$scope.passwordValidation = "Failed to Change Password";
				} else if(/^2[0-4]{10}$/.test(data)) {
					$scope.passwordValidation = "Invalid Request";
				}
			}, function (error) {
				$(".ic-currpassword").parent().addClass("input-border-error");
				$scope.passwordValidation = "Failed to Change Password.";
			});
		}
	};

	$scope.changePwdPopup = function(){
		openHeaderModalPopup("changePassPopup");
	};

	$scope.resetSuccess = function(){
		$rootScope.redirectPage();
	};

	$scope.closeSuccess = function(){
		$("#unlockAccEmailSuccess").modal("hide");
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

	function openHeaderModalPopup(modalId, title, body) {
		var modalBox = $("#"+modalId);
		modalBox.find('.modal-title').text(title);
		modalBox.find('.modal-body p').text(body);
		modalBox.modal("show");
		setTimeout(function () {
			modalBox.find('.btn-default').focus();
		}, 300);
	}

});

