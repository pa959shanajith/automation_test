mySPA.controller('respHeaderController', function($scope, $rootScope, $timeout, $http, $location, respHeaderServices, LoginService, cfpLoadingBar, socket) {
	var userDetails,username,userRole,task;
	var selectedRoleID, selectedRoleName, redirectPath;
	var projectId = [];
	var releaseId = [];
	var cycleId = [];
	var screenId = [];
	$('#passwordValidation').text("");
	$rootScope.unavailableLocalServer_msg="No Intelligent Core Engine (ICE) connection found with the Nineteen68 logged in username. Please run the ICE batch file once again and connect to Server.";

	if(window.localStorage['_UI']){
		userDetails = JSON.parse(window.localStorage['_UI']);
	}
	$scope.notifications = [];
	if(window.localStorage.notification){
		$scope.notifications = JSON.parse(window.localStorage.notification);
	}
	
	userRole = window.localStorage['_SR'];
	username = userDetails.username.toLowerCase();

	$scope.$on('$locationChangeStart', function(event, next, current){
		// Prevent the browser default action (Going back):
		if (localStorage["navigateScreen"] == $location.path()) {
			event.preventDefault();
		}
	});

	$("#displayUsername").text(userDetails.firstname + ' ' + userDetails.lastname)
	$(".heading-center-light").text('Welcome  ' + userDetails.firstname + ' ' + userDetails.lastname + '!');
	$(".headerDrop_1").text(userRole);
	if (userRole == 'Admin') {
		$("#sRole").hide(); //naviPg
		$("#naviPg").css("cursor", "default");
	}

	//Global model popup
	function openModelPopup(modalId, title, body) {
		var modalBox = $("#"+modalId);
		modalBox.find('.modal-title').text(title);
		modalBox.find('.modal-body p').text(body);
		modalBox.modal("show");
		setTimeout(function () {
			modalBox.find('.btn-default').focus();
		}, 300);
	}

	if ($location.$$path == '/admin') {
		$(".bell-icon-div").hide();
		$(".resetPassEntry").hide();
	}

	if (userDetails.ldapuser){
		$(".resetPassEntry").hide();
	}

	if ($location.$$path == "/plugin" || $location.$$path == "/p_Webocular" || $location.$$path == "/p_Dashboard") {
		$("button.notify-btn").addClass('notify-btn-white');

	}
	$("#notifications-count").hide();


	socket.on('killSession', function (value) {
		return $rootScope.redirectPage();
	});

	socket.on('notify', function (value) {
		var isDuplicateNotificationMsg;
		if(window.localStorage.notification)
		{
			var notificationArrList = JSON.parse(window.localStorage.notification);
			for(let i=0;i<notificationArrList.length;i++)
			{
				if(value.notifyMsg == notificationArrList[i].notifyMsg)
				{
					isDuplicateNotificationMsg = true;
				}
			}
			if(isDuplicateNotificationMsg == true)
			{
				return;
			}
		}
		if(isDuplicateNotificationMsg != true )
		{
			if(value.count == 0 && 'notifyMsg' in value){
				var dateTime = new Date().toLocaleString();
				if (value.to.indexOf($location.$$path) >= 0) {
					$('.top-left').notify({
						message: {
							text: value.notifyMsg
						},
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					}).show();
			}
				
					value.count = value.count + 1;
					if (window.localStorage.notification) {
						var notificationArr = window.localStorage.notification;
						notificationArr = JSON.parse(notificationArr);
						value.dateTime = dateTime;
						notificationArr.push(value);
						notificationArr = JSON.stringify(notificationArr);
						window.localStorage.notification = notificationArr;
						$scope.notifications = JSON.parse(window.localStorage.notification);
						$scope.$apply();
					}else {
						var notificationArr = [];
						value.dateTime = dateTime;
						notificationArr.push(value);
						notificationArr = JSON.stringify(notificationArr)
						window.localStorage.notification = notificationArr;
						$scope.notifications = JSON.parse(window.localStorage.notification);
						$scope.$apply();
					}
					unreadNotifications();
					}
		}

	});

	function unreadNotifications() {
		if(window.localStorage.notification){
			var notifications = JSON.parse(window.localStorage.notification);
			var unreadNotifications = notifications.filter(function(a){
				return a.isRead == false;
			});
			var notificationCount = unreadNotifications.length;
			if (notificationCount < 1 || notificationCount == '' || notificationCount == undefined) {
				$("#notifications-count").hide();
			}else {
				$("#notifications-count").show();
				$("#notifications-count").text(notificationCount);
			}
		}
	}

	setTimeout(function () {
		unreadNotifications();
	}, 500);

	$scope.dropdownMenuButton = function($event){
		$("#notifyBox").hide().addClass('hide');
		if(window.localStorage.notification)
		{
			$scope.notifications = JSON.parse(window.localStorage.notification);
		}
		if (!window.localStorage.notification || window.localStorage.notification == 'undefined') {
			$("#notifyBox").hide().addClass('hide');
			return;
		}
		else{
			$("#notifyBox").hide().removeClass('hide');
		}

		$("#notifyBox").removeClass('dropdown-menu').addClass('dropdown-menu');
		$("#notifications-count").hide();
		var readMessages = JSON.parse(window.localStorage.notification);
		for (var i = 0; i < readMessages.length; i++) {
			readMessages[i].isRead = true;
		}
		window.localStorage.notification = JSON.stringify(readMessages);
		setTimeout(function() {
			if($(".dropdown-menu").is(":visible") == true)
			{
				var notificationCount = parseInt($("#notifications-count").text());
				$("span.indexCount").each(function() {
						var text = parseInt($(this).text());
						$(this).attr('class','notify_'+text);
				});
				for(var i=0;i<notificationCount;i++)
				{
					$(".notify_"+i).parent().children('.txtNotify').addClass('highlightNotification');
				}
			}
		}, 10);
		
	
	}

	$scope.naviPg = function($event){
		if (localStorage.getItem("navigateEnable") == "true") {
			window.localStorage['navigateScreen'] = "plugin";
			//Transaction Activity for Nineteen68 Logo Action
			// var labelArr = [];
			// var infoArr = [];
			// labelArr.push(txnHistory.codesDict['Nineteen68Logo']);
			// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
			$timeout(function () {
				//$location.path('/plugin');
				window.location.href = '/plugin';
		   	}, 100);
		}
	};

	if(window.localStorage['_SRS']=="success"){
		delete window.localStorage['_SRS'];
		setTimeout(function () {
			openModelPopup("switchRoleStatus", "Switch Role", "Your role is changed to " + window.localStorage['_SR']);
		}, 500);
	}

	$(document).on('click', ".switchRole_confirm", function () {
		selectedRoleName = $(this).text();
		selectedRoleID = $(this).valueOf("outerHTML").data("id");
		openModelPopup("switchRoleModal", "Switch Role", "Are you sure you want to switch role to: " + selectedRoleName);
	});

	$(document).on('click', ".switchRole", function () {
		userDetails = JSON.parse(window.localStorage['_UI']);
		var roleasarray = userDetails.additionalrole;
		if (roleasarray.length == 0) {
			$("#switchRoles").hide();
			$("#switchRoles").addClass('hide');
			openModelPopup("switchRoleStatus", "Switch Role", "There are no roles to switch");
		} else {
			$("#switchRoles").removeClass('hide');
			LoginService.getRoleNameByRoleId_Nineteen68(roleasarray)
			.then(function (data) {
				if (data == "Invalid Session") {
					return $rootScope.redirectPage();
				} else {
					var rolesList = $('#switchRoles');
					rolesList.empty();
					var selectedRole = window.localStorage['_SR'];
					data[userDetails.role] = userDetails.rolename;
					for (var rid in data) {
						if (data[rid] != selectedRole) {
							rolesList.append($("<li class='switchRole_confirm' data-id=" + rid + " ><a href='#' data-toggle='modal' data-target='#switchRoleModal'>" + data[rid] + "</a></li>"));
						}
					}
				}
			});
		}
	});

	$(document).on('click', ".switchedRole", function ($event) {
		$("#switchRoleModal").modal("hide");
		blockUI("Switching to " + selectedRoleName);
		LoginService.loadUserInfo_Nineteen68(selectedRoleID)
		.then(function (data) {
			unblockUI();
			if (data != "fail") {
				window.localStorage['_SR'] = selectedRoleName;
				window.localStorage['_UI'] = JSON.stringify(data);
				window.localStorage['_SRS'] = "success";
				//Transaction Activity for SwitchRole Button Action
				// var labelArr = [];
				// var infoArr = [];
				// labelArr.push(txnHistory.codesDict['SwitchRole']);
				// infoArr.push({"selectedRoleName" : selectedRoleName});
				// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
				if (selectedRoleName == "Admin") {
					window.localStorage['navigateScreen'] = "admin";
					window.location.href = "/admin";
				} else {
					window.localStorage['navigateScreen'] = "plugin";
					window.location.href = "/plugin";
				}
			} else {
				console.log("Fail to Switch User");
				openModelPopup("switchRoleStatus", "Switch Role", "Fail to Switch User");
			}
		}, function (error) {
			unblockUI();
			console.log("Fail to Switch User");
			openModelPopup("switchRoleStatus", "Switch Role", "Fail to Switch User");
		});
	});

	$(document).on('click', ".resetSuccess", function(){
		window.sessionStorage.clear();
		window.sessionStorage["checkLoggedOut"] = true;
		$rootScope.redirectPage();
	});

	$(document).on('click', ".resetPass", function(){
		openModelPopup("resetPassPopup");
	});

	$(document).on('click', ".resetFields", function(){
		document.getElementById('currpassword').value="";
		document.getElementById('newpassword').value="";
		document.getElementById('confpassword').value="";
		$('#passwordValidation').text("");
		$(".ic-currpassword").parent().removeClass("input-border-error");
		$(".ic-newpassword").parent().removeClass("input-border-error");
		$(".ic-confpassword").parent().removeClass("input-border-error");
	});

	$(document).on('click', ".resetPassword", function(){
		$('#passwordValidation').text("");
		$(".ic-currpassword").parent().removeClass("input-border-error");
		$(".ic-newpassword").parent().removeClass("input-border-error");
		$(".ic-confpassword").parent().removeClass("input-border-error");
		var currpassword = $('#currpassword').val();
		var newpassword = $('#newpassword').val();
		var confpassword = $('#confpassword').val();
		var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		if (!currpassword) {
			$(".ic-currpassword").parent().addClass("input-border-error");
			$('#passwordValidation').text("Current Password field is empty.");
		} else if (!newpassword) {
			$(".ic-newpassword").parent().addClass("input-border-error");
			$('#passwordValidation').text("New Password field is empty.");
		} else if (!regexPassword.test(newpassword)) {
			$(".ic-newpassword").parent().addClass("input-border-error");
			$('#passwordValidation').text("Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");
		} else if (!confpassword) {
			$(".ic-confpassword").parent().addClass("input-border-error");
			$('#passwordValidation').text("Confirm Password field is empty.");
		} else if (newpassword != confpassword) {
			$(".ic-confpassword").parent().addClass("input-border-error");
			$('#passwordValidation').text("New Password and Confirm Password do not match");
		} else {
			LoginService.resetPassword_Nineteen68(newpassword,currpassword)
			.then(function (data) {
				if(data == "Invalid Session"){
					$('#passwordValidation').text("Invalid Session");
				} else if(data == "success") {
					$("#resetPassPopup").modal("hide");
					openModelPopup("resetSuccessPopup");
				} else if(data == "same"){
					$(".ic-newpassword").parent().addClass("input-border-error");
					$(".ic-confpassword").parent().addClass("input-border-error");
					$('#passwordValidation').text("Sorry! You can't use the existing password again");
				} else if(data == "incorrect") {
					$(".ic-currpassword").parent().addClass("input-border-error");
					$('#passwordValidation').text("Current Password is incorrect");
				} else if(data == "fail") {
					$('#passwordValidation').text("Failed to Change Password");
				} else if(/^2[0-4]{10}$/.test(data)) {
					$('#passwordValidation').text("Invalid Request");
				}
			}, function (error) {
				$(".ic-currpassword").parent().addClass("input-border-error");
				$('#passwordValidation').text("Failed to Authenticate Current Password.");
			});
		}
	});

	$(document).on("keypress", ".spaceRegex", function (e) {
		if(e.keyCode == 32)
		{
			return false;
		}
	});

	// All Special characters prevented on cut copy paste
	$(document).on('cut copy paste', '.passwordRegex', function (e) {
		var element = $(this);
		setTimeout(function () {
			var userEnteredText = element.val();
			var regex;
				//regex = ;
			userEnteredText = userEnteredText.replace(/\s/g, "");
			element.val(userEnteredText);
		}, 5);
	});

	if (window.localStorage['_CT']) {
		projectId.push(JSON.parse(window.localStorage['_CT']).projectId);
		var data = JSON.parse(window.localStorage['_CT'])
			$scope.projectDetails = {"idtypes":["projects"],"requestedids":[data.projectId],"respnames":[data.taskName]};
			task = JSON.parse(window.localStorage['_CT']);
			releaseId.push(task.releaseid);
			screenId.push(task.screenId);
			$scope.releaseDetails = task.releaseid;
			$scope.cycleDetails = data.cycleid;
			$scope.screenName = data.taskName;
	}

	$scope.logout = function($event){
		//Transaction Activity for Logout Button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['Logout']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
		window.sessionStorage.clear();
		window.sessionStorage["checkLoggedOut"] = true;
		$rootScope.redirectPage();
	};
});
