var releaseName;var cycleName;var testSuiteName;
mySPA.controller('scheduleController',['$scope','$http','$timeout','$location','ScheduleService','cfpLoadingBar', function ($scope, $http, $timeout, $location, ScheduleService, cfpLoadingBar) {
	cfpLoadingBar.start();
	$("body").css("background","#eee");
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
	    $('.scrollbar-macosx').scrollbar();
	    document.getElementById("currentYear").innerHTML = new Date().getFullYear()
	}, 500)
    
    //Task Listing
    loadUserTasks()
    
   	var getTaskName = JSON.parse(window.localStorage['_CT']).taskName;
	var	appType = JSON.parse(window.localStorage['_CT']).appType;
			$("#page-taskName").empty().append('<span class="taskname">'+getTaskName+'</span>');
			$(".projectInfoWrap").empty()
			releaseName = JSON.parse(window.localStorage['_CT']).releaseName;
			cycleName = JSON.parse(window.localStorage['_CT']).cycleName;
			testSuiteName = JSON.parse(window.localStorage['_CT']).testSuiteName;
	
	$timeout(function(){
		projectDetails = angular.element(document.getElementById("left-nav-section")).scope().projectDetails;
		$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">'+projectDetails.projectname+'</span></p><p class="proj-info-wrap"><span class="content-label">Cycle :</span><span class="content">'+releaseName+'</span></p><p class="proj-info-wrap"><span class="content-label">Cycle :</span><span class="content">'+cycleName+'</span></p><p class="proj-info-wrap"><span class="content-label">TestSuite :</span><span class="content">'+testSuiteName+'</span></p>')
	}, 3000)
    
    //Sample JSON to load Test Suite Data
    var testSuiteData = [{
		"test_suite_id": "13afa0b6-69c0-4ec2-aaf8-e8ce40651b09",
		"project_name": "Web",
		"cycleId": "65422140-9b1f-4ccc-982f-308af047ca15",
		"project_id": "3217b6a8-7178-48c0-ac10-b14638fd2af4",
		"test_suite_name": "OEBS-Web-Suit"
	}, {
		"test_suite_id": "13b56827-8de4-4a94-bf53-db4e52d5bc15",
		"project_name": "Web",
		"cycleId": "65422140-9b1f-4ccc-982f-308af047ca15",
		"project_id": "3217b6a8-7178-48c0-ac10-b14638fd2af4",
		"test_suite_name": "OEBS-Web-Suit"
	}, {
		"test_suite_id": "159549b3-bfcf-4c1e-b747-01e8a2832dc3",
		"project_name": "Web",
		"cycleId": "65422140-9b1f-4ccc-982f-308af047ca15",
		"project_id": "3217b6a8-7178-48c0-ac10-b14638fd2af4",
		"test_suite_name": "OEBS-Web-Suit"
	}, {
		"test_suite_id": "15aff91b-903d-423a-82b8-4d84b3b3fadd",
		"project_name": "Web",
		"cycleId": "65422140-9b1f-4ccc-982f-308af047ca15",
		"project_id": "3217b6a8-7178-48c0-ac10-b14638fd2af4",
		"test_suite_name": "OEBS-Web-Suit"
	}, {
		"test_suite_id": "13b56827-8de4-4a94-bf53-db4e52d5bc15",
		"project_name": "Web",
		"cycleId": "65422140-9b1f-4ccc-982f-308af047ca15",
		"project_id": "3217b6a8-7178-48c0-ac10-b14638fd2af4",
		"test_suite_name": "OEBS-Web-Suit"
	}, {
		"test_suite_id": "159549b3-bfcf-4c1e-b747-01e8a2832dc3",
		"project_name": "Web",
		"cycleId": "65422140-9b1f-4ccc-982f-308af047ca15",
		"project_id": "3217b6a8-7178-48c0-ac10-b14638fd2af4",
		"test_suite_name": "OEBS-Web-Suit"
	}, {
		"test_suite_id": "15aff91b-903d-423a-82b8-4d84b3b3fadd",
		"project_name": "Web",
		"cycleId": "65422140-9b1f-4ccc-982f-308af047ca15",
		"project_id": "3217b6a8-7178-48c0-ac10-b14638fd2af4",
		"test_suite_name": "OEBS-Web-Suit"
	}, {
		"test_suite_id": "13b56827-8de4-4a94-bf53-db4e52d5bc15",
		"project_name": "Web",
		"cycleId": "65422140-9b1f-4ccc-982f-308af047ca15",
		"project_id": "3217b6a8-7178-48c0-ac10-b14638fd2af4",
		"test_suite_name": "OEBS-Web-Suit"
	}];
	
	//Populating Data in Scheduling Table
	$("#scheduleDataBody").empty()
	for(i=0; i<testSuiteData.length; i++){
		$("#scheduleDataBody").append('<div class="scheduleDataBodyRow"><div style="width: 4%" class="tabeleCellPadding"><input type="checkbox" class="d-schedule"></div><div style="width: 23%; text-align:left" class="tabeleCellPadding" data-SuiteId="'+testSuiteData[i].test_suite_id+'">'+testSuiteData[i].test_suite_name+'</div><div style="width: 17%"><input class="form-control" type="text" value=""/></div><div style="width: 20%"><input class="form-control" type="text" value=""/></div><div style="width: 25%"><span style="position: relative; display: inline-block; width:50%; margin-right:5%"><input class="form-control fc-datePicker" type="text" value=""/><img class="datepickerIcon" src="../imgs/ic-datepicker.png" /></span><span style="position: relative; display: inline-block; width:40%"><input class="form-control fc-timePicker" type="text" value=""/><img class="timepickerIcon" src="../imgs/ic-timepicker.png" /></span></div><div style="width: 11%" class="tabeleCellPadding"><img src="../imgs/ic-alm.png" style="cursor:pointer" /></div></div>')
	}
	
	cfpLoadingBar.complete();
	$("#tableActionButtons, .scheduleDataTable").delay(400).animate({opacity: "1"}, 300)
	
	
	//Datepicker Function
	$('.fc-datePicker').datepicker({
		autoclose:"true",
		format:"dd-mm-yyyy",
		todayHighlight: true
	})
	$(document).on('click', ".datepickerIcon", function(){
		$(this).siblings(".fc-datePicker").focus()
	})
	.on('click', ".timepickerIcon", function(){
		$(this).siblings(".fc-timePicker").focus()
	})
	//Datepicker Function
	
	
	//Select Browser Function
	$(document).on("click", ".selectBrowserSc", function(){
		$(this).find("img").toggleClass("sb")
	})
	//Select Browser Function
	
	//Submit Task Scheduling
	$scope.submitTaskScheduling = function(){
		$("#submitTasksdScheduling").modal("show")
	}
	//Submit Task Scheduling
	
	
	//Add to list and schedule
	$scope.initSchedule = function(){
		
	}
	//Add to list and schedule
}]);