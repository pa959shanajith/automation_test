mySPA.controller('integrationController',['$scope', '$rootScope', '$window','$http','$location','$timeout','integrationService','cfpLoadingBar', 'socket', function($scope, $rootScope, $window,$http,$location,$timeout,qcServices,cfpLoadingBar,socket) {
	$('.scrollbar-inner').scrollbar();
	var avoassure_projects_details;
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerText = new Date().getFullYear();
	}, 500);
	var mappedList = [];
	if(window.localStorage['navigateScreen'] != "p_Integration"){
		return $rootScope.redirectPage();
	}

	$("body").css("background", "#eee");
	
	$(".selectBrowser").click(function(){
		$(".selectBrowser").find("img").removeClass("selectedIcon");
		$(this).find("img").addClass("selectedIcon");
	});

	$scope.goBacktoPlugin = function($event){
		//Transaction Activity for ALMLogin Cancel Button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['CancelALMLogin']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
		window.localStorage['navigateScreen'] = "plugin";
		window.location.assign('plugin');
	};

	$scope.qtestlogin = function(event){
		window.localStorage['navigateScreen'] = "p_qTest";
		$timeout(function () {
			$location.path('/'+ "p_qTest");
	   	}, 100);
	};

	$scope.almlogin = function(event){
		window.localStorage['navigateScreen'] = "p_ALM";
		$timeout(function () {
			$location.path('/'+ "p_ALM");
	   	}, 100);
	};

	$scope.zephyrlogin = function(event){
		window.localStorage['navigateScreen'] = "p_Zephyr";
		$timeout(function () {
			$location.path('/'+ "p_Zephyr");
	   	}, 100);
	};

	//Global moded popup
	function openModelPopup(title, body){
		$("#globalModal").find('.modal-title').text(title);
		$("#globalModal").find('.modal-body p').text(body);
		$("#globalModal").modal("show");
		setTimeout(function(){
			$("#globalModal").find('.btn-default').focus();
		}, 300);
	}
}]);