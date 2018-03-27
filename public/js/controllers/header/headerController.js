mySPA.controller('headerController', function($scope, $rootScope, $timeout, $http, $location, headerServices, LoginService, cfpLoadingBar, socket) {
	var userDetails,username,userRole,task;
	var selectedRoleID, selectedRoleName, redirectPath;
	var projectId = [];
	var releaseId = [];
	var cycleId = [];
	var screenId = [];

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
	$(".userRole").text(userRole);
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
	}

	if ($location.$$path == "/plugin" || $location.$$path == "/p_Webocular" || $location.$$path == "/p_Dashboard") {
		$("button.notify-btn").addClass('notify-btn-white');

	}
	$("#notifications-count").hide();

	
	socket.on('notify', function (value) {
		if(value.count == 0){
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

	$scope.dropdownMenuButton = function(){
		if(window.localStorage.notification)
		{
			$scope.notifications = JSON.parse(window.localStorage.notification);
		}
		if (!window.localStorage.notification) {
			$("#notifyBox").removeClass('dropdown-menu');
			return;
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

	$scope.naviPg = function(){
		if (localStorage.getItem("navigateEnable") == "true") {
			window.localStorage['navigateScreen'] = "plugin";
			$timeout(function () {
				$location.path('/plugin');
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

	$scope.switchRole = function () {
		userDetails = JSON.parse(window.localStorage['_UI']);
		var roleasarray = userDetails.additionalrole;
		if (roleasarray.length == 0) {
			$("#switchRoles").hide();
			openModelPopup("switchRoleStatus", "Switch Role", "There are no roles to switch");
		} else {
			LoginService.getRoleNameByRoleId_Nineteen68(roleasarray)
			.then(function (data) {
				if (data == "Invalid Session") {
					$rootScope.redirectPage();
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
	};

	$scope.switchedRole = function () {
		$("#switchRoleModal").modal("hide");
		blockUI("Switching to " + selectedRoleName);
		LoginService.loadUserInfo_Nineteen68(selectedRoleID)
		.then(function (data) {
			unblockUI();
			if (data != "fail") {
				window.localStorage['_SR'] = selectedRoleName;
				window.localStorage['_UI'] = JSON.stringify(data);
				window.localStorage['_SRS'] = "success";
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
	};

	if (window.localStorage['_CT']) {
		projectId.push(JSON.parse(window.localStorage['_CT']).projectId);
		headerServices.getNames_ICE(projectId,['projects']) 
		.then(function(data){
			if(data == "Invalid Session"){
				$rootScope.redirectPage();
			}
			$scope.projectDetails = data;
			task = JSON.parse(window.localStorage['_CT']);

			releaseId.push(task.releaseid);
			screenId.push(task.screenId);
			headerServices.getNames_ICE(releaseId, ['releases']) 
			.then(function(data){
				if(data == "Invalid Session"){
				  $rootScope.redirectPage();
				}
				$scope.releaseDetails = data.respnames[0];
				cycleId.push(task.cycleid);
				headerServices.getNames_ICE(cycleId, ['cycles'])
				.then(function(data){
					if(data == "Invalid Session"){
				  		$rootScope.redirectPage();
					}
					$scope.cycleDetails = data.respnames[0];

				}, function(error) {	console.log("Failed to get cycle name")});
			}, function(error) {	console.log("Failed to get release name")});
			headerServices.getNames_ICE(screenId,['screens']) 
		.then(function(data){
			if(data == "Invalid Session"){
				$rootScope.redirectPage();
			}
			$scope.screenName = data.respnames[0];
		}, 
		function(error) {	console.log("Failed to fetch info")});
		}, function(error) {	console.log("Failed to fetch projectInfo")});
	}

	$scope.logout = function(){
		$rootScope.redirectPage();
	};
});
