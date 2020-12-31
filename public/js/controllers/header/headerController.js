mySPA.controller('headerController', function($scope, $rootScope, $timeout, $http, $location, headerServices, LoginService, cfpLoadingBar, socket) {
	var userDetails,username,userRole,task;
	var selectedRoleID, selectedRoleName, redirectPath;
	var projectId = [];
	var releaseId = [];
	var cycleId = [];
	var screenId = [];
	$scope.passwordValidation = "";
	$rootScope.unavailableLocalServer_msg="No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server.";

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

	$("#displayUsername").text(userDetails.firstname + ' ' + userDetails.lastname);
	$(".heading-center-light").text('Welcome  ' + userDetails.firstname + ' ' + userDetails.lastname + '!');
	$(".headerDrop_1").text(userRole);
	if (userRole == 'Admin') {
		$("#sRole").hide(); //naviPg
		$("#naviPg").css("cursor", "default");
		$(".bell-icon-div").hide();
		$(".resetPassEntry").hide();
		$(".user-actions-menuitem").hide();
	}

	if (!userDetails.dbuser){
		$(".resetPassEntry").hide();
	}

	if ($location.$$path == "/plugin") {
		$("button.notify-btn").addClass('notify-btn-white');
	}

	$("#notifications-count").hide();


	socket.on('killSession', function (source, reason) {
		window.sessionStorage["checkLoggedOut"] = JSON.stringify([source, reason]);
		return $rootScope.redirectPage();
	});

	socket.on('notify', function (value) {
		var isDuplicateNotificationMsg;
		if (window.localStorage.notification) {
			var notificationArrList = JSON.parse(window.localStorage.notification);
			for (var i = 0; i < notificationArrList.length; i++) {
				if (value.notifyMsg == notificationArrList[i].notifyMsg) {
					isDuplicateNotificationMsg = true;
				}
			}
			if (isDuplicateNotificationMsg == true) {
				return;
			}
		}
		if (isDuplicateNotificationMsg != true) {
			if (value.count == 0 && 'notifyMsg' in value) {
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
				} else {
					var notificationArr = [];
					value.dateTime = dateTime;
					notificationArr.push(value);
					notificationArr = JSON.stringify(notificationArr);
					window.localStorage.notification = notificationArr;
					$scope.notifications = JSON.parse(window.localStorage.notification);
					$scope.$apply();
				}
				unreadNotifications();
			}
		}
	});

	socket.on('display_execution_popup', (value) => {
		var msg = "";
		for(val in value){
			var data = value[val].status;
			var testSuite = value[val].testSuiteIds;
			var exec = testSuite[0].testsuitename + ": "
			if (data == "begin") continue;
			if (data == "unavailableLocalServer") data = exec + $rootScope.unavailableLocalServer_msg;
			else if (data == "NotApproved") data = exec + "All the dependent tasks (design, scrape) needs to be approved before execution";
			else if (data == "NoTask") data = exec + "Task does not exist for child node";
			else if (data == "Modified") data = exec +"Task has been modified, Please approve the task";
			else if (data == "Completed") data = exec +"Execution Complete";
			else if (data == "Terminate") data = exec + "Terminated";
			else if (data == "UserTerminate") data = exec +"Terminated by User"
			else if (data == "success") data = exec +"success"
			else if (data == "API Execution Completed") data = exec + "API Execution Completed"
			else if (data == "API Execution Fail") data = exec + "API Execution Failed"
			else data = exec + "Failed to execute.";
			msg = msg + "\n" + data;
		}
		if(msg && msg.trim() != ""){
			openHeaderModalPopup("executeGlobalModal","Execution Result", msg);
		}		
		
	});

	socket.on('result_ExecutionDataInfo', function (result) {
		var data = result.status
		var testSuiteIds = result.testSuiteDetails;
		var msg = "";
		testSuiteIds[0]["projectidts"] = testSuiteIds[0]["projectid"];
		window.localStorage["report"] = JSON.stringify(result);
		msg = testSuiteIds[0]["testsuitename"]
		
		if (data == "Terminate") {
			$('#executionTerminatedBy').html('Program');
			$("#executionTerminatedBy").find('.modal-title').text(msg);
			$('#executionTerminated').modal('show');
			$('#executionTerminated').find('.btn-default').focus();
		} else if (data == "UserTerminate") {
			$('#executionTerminatedBy').html('User');
			$("#executionTerminatedBy").find('.modal-title').text(msg);
			$('#executionTerminated').modal('show');
			$('#executionTerminated').find('.btn-default').focus();
		} else if (data == "unavailableLocalServer") {
			openHeaderModalPopup("executeGlobalModal","Execute Test Suite", $rootScope.unavailableLocalServer_msg);
		} else if (data == "success") {
			$("#executionCompleted").find('.modal-title').text(msg);
			$('#executionCompleted').modal('show');
			setTimeout(function () {
				$("#executionCompleted").find('.btn-default').focus();
			}, 300);
		} else if(data == "Completed"){
			openHeaderModalPopup("executeGlobalModal","Scheduled Execution Complete", msg);
		}else openHeaderModalPopup("executeGlobalModal","Execute Test Suite", "Failed to execute.");
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
		if(window.localStorage.notification)
		{
			$scope.notifications = JSON.parse(window.localStorage.notification);
		}
		if (!window.localStorage.notification) {
			$("#notifyBox").hide();
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
	};

	$scope.naviPg = function($event){
		if (localStorage.getItem("navigateEnable") == "true") {
			window.localStorage['navigateScreen'] = "plugin";
			//Transaction Activity for Avo Assure Logo Action
			// var labelArr = [];
			// var infoArr = [];
			// labelArr.push(txnHistory.codesDict['AvoAssureLogo']);
			// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
			$timeout(function () {
				$location.path('/plugin');
		   	}, 100);
		}
	};

	if(window.localStorage['_SRS']=="success"){
		delete window.localStorage['_SRS'];
		setTimeout(function () {
			openHeaderModalPopup("switchRoleStatus", "Switch Role", "Your role is changed to " + window.localStorage['_SR']);
		}, 500);
	}

	$(document).on('click', ".switchRole_confirm", function () {
		selectedRoleName = $(this).text();
		selectedRoleID = $(this).valueOf("outerHTML").data("id");
		openHeaderModalPopup("switchRoleModal", "Switch Role", "Are you sure you want to switch role to: " + selectedRoleName);
	});

	$scope.switchRole = function () {
		userDetails = JSON.parse(window.localStorage['_UI']);
		var roleasarray = userDetails.additionalrole;
		if (roleasarray.length == 0) {
			$("#switchRoles").hide();
			openHeaderModalPopup("switchRoleStatus", "Switch Role", "There are no roles to switch");
		} else {
			LoginService.getRoleNameByRoleId(roleasarray)
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
	};

	$scope.switchedRole = function ($event) {
		$("#switchRoleModal").modal("hide");
		blockUI("Switching to " + selectedRoleName);
		LoginService.loadUserInfo(selectedRoleID)
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
				openHeaderModalPopup("switchRoleStatus", "Switch Role", "Fail to Switch User");
			}
		}, function (error) {
			unblockUI();
			console.log("Fail to Switch User");
			openHeaderModalPopup("switchRoleStatus", "Switch Role", "Fail to Switch User");
		});
	};

	$scope.resetSuccess = function(){
		window.sessionStorage.clear();
		window.sessionStorage["checkLoggedOut"] = true;
		$rootScope.redirectPage();
	};

	$scope.resetPass = function(){
		openHeaderModalPopup("resetPassPopup");
	};

	$scope.resetFields = function(){
		$scope.currpassword = "";
		$scope.newpassword = "";
		$scope.confpassword = "";
		$scope.passwordValidation = "";
		$(".ic-currpassword, .ic-newpassword, .ic-confpassword").parent().removeClass("input-border-error");
	};

	$scope.resetPassword = function(){
		$scope.passwordValidation = "";
		$(".ic-currpassword, .ic-newpassword, .ic-confpassword").parent().removeClass("input-border-error");
		var currpassword = $scope.currpassword;
		var newpassword = $scope.newpassword;
		var confpassword = $scope.confpassword;
		var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		if (!currpassword) {
			$(".ic-currpassword").parent().addClass("input-border-error");
			$scope.passwordValidation = "Current Password field is empty.";
		} else if (!newpassword) {
			$(".ic-newpassword").parent().addClass("input-border-error");
			$scope.passwordValidation = "New Password field is empty.";
		} else if (!regexPassword.test(newpassword)) {
			$(".ic-newpassword").parent().addClass("input-border-error");
			$scope.passwordValidation = "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..";
		} else if (!confpassword) {
			$(".ic-confpassword").parent().addClass("input-border-error");
			$scope.passwordValidation = "Confirm Password field is empty.";
		} else if (newpassword != confpassword) {
			$(".ic-confpassword").parent().addClass("input-border-error");
			$scope.passwordValidation = "New Password and Confirm Password do not match";
		} else {
			LoginService.resetPassword(newpassword,currpassword)
			.then(function (data) {
				if(data == "Invalid Session"){
					$scope.passwordValidation = "Invalid Session";
				} else if(data == "success") {
					$("#resetPassPopup").modal("hide");
					openHeaderModalPopup("resetSuccessPopup");
				} else if(data == "same"){
					$(".ic-newpassword").parent().addClass("input-border-error");
					$(".ic-confpassword").parent().addClass("input-border-error");
					$scope.passwordValidation = "Sorry! You can't use the existing password again";
				} else if(data == "incorrect") {
					$(".ic-currpassword").parent().addClass("input-border-error");
					$scope.passwordValidation = "Current Password is incorrect";
				} else if(data == "fail") {
					$scope.passwordValidation = "Failed to Change Password";
				} else if(/^2[0-4]{10}$/.test(data)) {
					$scope.passwordValidation = "Invalid Request";
				}
			}, function (error) {
				$(".ic-currpassword").parent().addClass("input-border-error");
				$scope.passwordValidation = "Failed to Authenticate Current Password.";
			});
		}
	};

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

		// headerServices.getNames_ICE(projectId,['projects']) 
		// .then(function(data){
		// 	if(data == "Invalid Session"){
		// 		return $rootScope.redirectPage();
		// 	}
		 var data = JSON.parse(window.localStorage['_CT'])
			$scope.projectDetails = {"idtypes":["projects"],"requestedids":[data.projectId],"respnames":[data.taskName]};
			task = JSON.parse(window.localStorage['_CT']);

			releaseId.push(task.releaseid);
			screenId.push(task.screenId);
//			$scope.releaseDetails = data.respnames[0];
			$scope.releaseDetails = task.releaseid;
			$scope.cycleDetails = data.cycleid;
			$scope.screenName = data.taskName;

			// headerServices.getNames_ICE(releaseId, ['releases']) 
			// .then(function(data){
			// 	if(data == "Invalid Session"){
			// 		return $rootScope.redirectPage();
			// 	}
			// 	$scope.releaseDetails = data.respnames[0];
			// 	cycleId.push(task.cycleid);
			// 	headerServices.getNames_ICE(cycleId, ['cycles'])
			// 	.then(function(data){
			// 		if(data == "Invalid Session"){
			// 	  		return $rootScope.redirectPage();
			// 		}
			// 		$scope.cycleDetails = data.respnames[0];

			// 	}, function(error) { console.log("Failed to get cycle name");});
			// }, function(error) { console.log("Failed to get release name");});
	// 		headerServices.getNames_ICE(screenId,['screens'])
	// 		.then(function(data){
	// 			if(data == "Invalid Session"){
	// 				return $rootScope.redirectPage();
	// 			}
	// 			$scope.screenName = data.respnames[0];
	// 		}, function(error) { console.log("Failed to fetch info");});
	// 	}, function(error) { console.log("Failed to fetch projectInfo");});
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

	$scope.getIce = async () => {
		try {
			const res = await fetch("/AvoAssure_ICE.zip");
			const status = await res.text();
			if (status == "available") location.href = location.origin+"/AvoAssure_ICE.zip?file=getICE"
			else openHeaderModalPopup("switchRoleStatus", "Download Avo Assure ICE", "Package is not available");
		} catch (ex) {
			console.error("Error while downloading ICE package. Error:", ex);
			openHeaderModalPopup("switchRoleStatus", "Download Avo Assure ICE", "Package is not available");
		}
	}

	$scope.changeDefICE = () =>{
		blockUI("Fetching ICE ...")
		headerServices.getUserICE()
		.then(function (data) {
			unblockUI();
			if(data == 'fail'){
				openHeaderModalPopup("executeGlobalModal", "Change Default ICE", $rootScope.unavailableLocalServer_msg);
			}else{
				var ice=data.ice_list
				if(!data.ice_list || ice.length<1){
					openHeaderModalPopup("executeGlobalModal", "Change Default ICE", $rootScope.unavailableLocalServer_msg);
					return;
				}
				$("#selectDefIce").modal("show")
				$('#chooseDefICE option').remove()
				ice.map((e)=>{
					$('#chooseDefICE').append(`<option value="${e}">${e}</option>`)
				})
			}
		}).catch(error=>{
			unblockUI()
			console.error(error)
			openHeaderModalPopup("executeGlobalModal", "Change Default ICE", $rootScope.unavailableLocalServer_msg);
		})
	}
	
	$scope.changeDefICEClick = () =>{
		blockUI("Setting Default ICE ...")
		$("#selectDefIce").modal("hide")
		var ice = $('#chooseDefICE').val()
		headerServices.setDefaultUserICE(ice)
		.then(function (data) {
			unblockUI();
			if(data == 'success'){
				openHeaderModalPopup("executeGlobalModal", "Change Default ICE", "Changed default ICE successfully");
			}else{
				openHeaderModalPopup("executeGlobalModal", "Change Default ICE", "Failed to change default ICE");
			}
		}).catch(error=>{
			unblockUI()
			console.error(error)
			openHeaderModalPopup("executeGlobalModal", "Change Default ICE", "Failed to change default ICE");
		})
	}

	$scope.redirectToNeuronGraphs = function() {
		window.location.href='/neuronGraphs/';
	}
});

function openHeaderModalPopup(modalId, title, body) {
	var modalBox = $("#"+modalId);
	modalBox.find('.modal-title').text(title);
	modalBox.find('.modal-body p').text(body);
	modalBox.modal("show");
	setTimeout(function () {
		modalBox.find('.btn-default').focus();
	}, 300);
}