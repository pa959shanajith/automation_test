mySPA.controller('headerController', function($scope, $rootScope, $timeout, $http, $location, headerServices, LoginService, cfpLoadingBar, socket) {
	var userDetails,userRole,task,switchedRoleId;
	var projectId = []
	var releaseId = [];
	var cycleId = [];
	var screenId = [];
	var selectedROleID;

	if(window.localStorage['_UI']){
		userDetails = JSON.parse(window.localStorage['_UI']);
	}
	$scope.notifications = [];
	if(window.localStorage.notification){
		$scope.notifications = JSON.parse(window.localStorage.notification);
	}
	
	userRole = window.localStorage['_SR'];

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
	function openModelPopup(title, body) {
		$("#switchRoleModal").find('.modal-title').text(title);
		$("#switchRoleModal").find('.modal-body p').text(body);
		$("#switchRoleModal").modal("show");
		setTimeout(function () {
			$("#switchRoleModal").find('.btn-default').focus();
		}, 300);
	}

	if ($location.$$path == '/admin') {
		$(".bell-icon-div").hide();
	}

	if ($location.$$path == "/plugin" || $location.$$path == "/p_Weboccular" || $location.$$path == "/p_Dashboard") {
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
			var unreadNotifications = notifications.filter(a => a.isRead == false);
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
		if (window.localStorage['_SR'] != 'Admin') {
			window.localStorage["_VP"] = true;
			window.localStorage['navigateScreen'] = "plugin";
			$timeout(function () {
				$location.path('/plugin');
		   	}, 100);
		}
	}

	var additionalRoleName;
	var userId = JSON.parse(window.localStorage['_UI']).user_id;

	$(document).on('click', ".switchRole_confirm", function () {
		//primaryRoleName = window.localStorage['_SR'];
		additionalRoleName = $(this).text();
		selectedROleID = $(this).valueOf("outerHTML").data("id");
		console.log($(this).text());
		openModelPopup("Switch Role", "Are you sure you want to switch role to: " + additionalRoleName);

		//$("#switchRoleModal").modal("show");
	})

	$scope.switchedRole = function () {
		changedRole = $('#changedRole');
		changedRole.append($("<p>Your role is changed to " + additionalRoleName + "</p>"))
		$("#switchRoleModal").modal("hide");
		$("#switchedRoleModal").modal("show");
	}


	$scope.Switch_Role = function () {
		//var userId = JSON.parse(window.localStorage['_UI']).user_id;
		var username = JSON.parse(window.localStorage['_UI']).username.toLowerCase();
		var userRolesList;
		var selRole;
		if (JSON.parse(window.localStorage['_UI']).additionalrole.length == 0) {
			$("#switchRoles").hide();
			$('#sRole ul').hide();
		}
		LoginService.loadUserInfo_Nineteen68(username, selRole, false)
			.then(function (response) {
				if(response == "Invalid Session"){
					$rootScope.redirectPage();
				}
				var roleasarray=[];
				//roleasarray.push(response.additionalrole);
				roleasarray = response.additionalrole;
				LoginService.getRoleNameByRoleId_Nineteen68(roleasarray)
					.then(function (data) {
						if (response == "Invalid Session") {
							$rootScope.redirectPage();
						}
						else if (data.length == 0) {
							$("#switchRoles").hide();
							$('#sRole ul').hide();
							$("#noRoles").modal("show");
						}
						else {
							//alert("success"); $(this).valueOf("outerHTML").data("id")
							getAdditionalRoles = $('#switchRoles');
							getAdditionalRoles.empty();
							var pR = window.localStorage['_pR'].split(";")
							var sr = window.localStorage['_SR'];
							var ar = window.localStorage['_aR'];
							if (pR[0] != sr) {
								for (var i = 0; i < data.length; i++) {
									if (($('#switchRole').val() != response) && (data[i] != sr) && (response.additionalrole[i] != ar)) {

										getAdditionalRoles.append($("<li class='switchRole_confirm' data-id=" + response.additionalrole[i] + " ><a href='#' data-toggle='modal' id=" + response.additionalrole[i] + " data-target='#switchRoleModal'>" + data[i] + "</a></li>"));
									}
								}
								getAdditionalRoles.append($("<li class='switchRole_confirm' data-id=" + pR[1] + " ><a href='#' data-toggle='modal' id=" + pR[1] + " data-target='#switchRoleModal'>" + pR[0] + "</a></li>"));
							}
							else {
								for (var i = 0; i < data.length; i++) {
									getAdditionalRoles.append($("<li class='switchRole_confirm' data-id=" + response.additionalrole[i] + " ><a href='#' data-toggle='modal' id=" + response.additionalrole[i] + " data-target='#switchRoleModal'>" + data[i] + "</a></li>"));
								}
							}
						}
					});
				window.localStorage['_R'] = response.r_ids;

			}, function (error) { console.log("Error:::::::::::::", error) })

	}

	$scope.switchRole_Yes = function () {
		var username = JSON.parse(window.localStorage['_UI']).username.toLowerCase();
		var selRole = selectedROleID;
		LoginService.loadUserInfo_Nineteen68(username, selRole, true)
			.then(function (data) {
				if (data != "fail") {
					//To be removed - Has to come from database
					var availablePlugins = [];
					var key = ["ALM", "Auto Gen Path", "Dashboard", "Dead Code Identifier", "ICE", "Mindmap", "Neuron Graphs", "Neuron Graphs 3D", "Oxbow Code Identifier", "Reports", "Weboccular"];
					for (i = 0; i < data.plugindetails.length; i++) {
						availablePlugins.push({
							"pluginName": key[i],
							"pluginValue": data.plugindetails[i].keyValue
						})
					}
					availablePlugins.push({
						"pluginName": "Utility",
						"pluginValue": "true"
					})
					data.pluginsInfo = availablePlugins;
					//window.localStorage['LoginSuccess'] = "True";
					window.localStorage['_SR'] = additionalRoleName;
					window.localStorage['_UI'] = JSON.stringify(data);
					window.localStorage['_aR'] = selectedROleID;
					var roleasarray = [];
					roleasarray.push(selectedROleID);
					LoginService.getRoleNameByRoleId_Nineteen68(roleasarray)
						.then(function (data1) {
							if (data1 != "fail") {
								window.localStorage['_SR'] = data1;
								if (data1 == "Admin") {
									window.localStorage['navigateScreen'] = "admin";
									window.location.href = "/admin";
								}
								else {
									window.localStorage['navigateScreen'] = "plugin";
									window.location.href = "/plugin";
								}
							}
							else console.log("Fail to get role name by role Id.");
						},
						function (error) {
							console.log("Fail to Load UserInfo")
						});
					//window.location.href = "/plugin";	
				}
				else
					console.log("Failed to Load UserInfo.");
			},
			function (error) {
				console.log("Fail to Load UserInfo")
			});

	}

	if (window.localStorage['_CT']) {
		projectId.push(JSON.parse(window.localStorage['_CT']).projectId);
		headerServices.getNames_ICE(projectId,['projects']) 
		.then(function(data){
			if(data == "Invalid Session"){
				$rootScope.redirectPage();
			}
			$scope.projectDetails = data;
			task = JSON.parse(window.localStorage['_CT']);

			releaseId.push(task.releaseId);
			screenId.push(task.screenId);
			headerServices.getNames_ICE(releaseId, ['releases']) 
			.then(function(data){
				if(data == "Invalid Session"){
				  $rootScope.redirectPage();
				}
				$scope.releaseDetails = data;
				cycleId.push(task.cycleId);
				headerServices.getNames_ICE(cycleId, ['cycles'])
				.then(function(data){
					if(data == "Invalid Session"){
				  		$rootScope.redirectPage();
					}
					$scope.cycleDetails = data;

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
	}
});
