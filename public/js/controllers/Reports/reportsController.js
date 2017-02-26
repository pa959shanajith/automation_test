
mySPA.controller('reportsController', ['$scope', '$http', '$location', '$timeout', 'reportService','cfpLoadingBar', function($scope,$http,$location,$timeout,reportService, cfpLoadingBar) {
	$("body").css("background","#eee");
	var getUserInfo = JSON.parse(window.localStorage['_UI']);
	var userID = getUserInfo.user_id;
	var open = 0;	var openWindow = 0;
	var executionId;
	$("#page-taskName").empty().append('<span>Reports</span>')
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
		angular.element(document.getElementById("left-nav-section")).scope().getAllSuites_ICE();
	}, 100)
	//Loading Project Info
	//var getProjInfo = JSON.parse(window.localStorage['_T'])
	//$(".upper-section-testsuites").append('<span class="suitedropdownicon"><span class="iconSpace">Down</span></span>');
	
	//$(".projectInfoWrap").empty()
	//$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">'+getProjInfo.projectName+'</span></p><p class="proj-info-wrap"><span class="content-label">Module :</span><span class="content">'+getProjInfo.moduleName+'</span></p><p class="proj-info-wrap"><span class="content-label">Screen :</span><span class="content">'+getProjInfo.screenName+'</span></p>')
	//Loading Project Info
	
	//Onload ServiceCall to display testsuites
	$scope.getAllSuites_ICE = function(){
		reportService.getAllSuites_ICE(userID)
		.then(function(data) {
			var container = $('.staticTestsuiteContainer');
			if(Object.prototype.toString.call( data ) === '[object Array]'){
				for(i=0; i<data.length; i++){
					if(container.find('.suiteContainer').length >= 6){
						$('.dynamicTestsuiteContainer').append("<span class='suiteContainer' data-suiteId='"+data[i].testsuiteid+"' title='"+data[i].testsuitename+"'><img alt='Test suite icon' src='imgs/ic-testsuite-reportbox.png'><br/><span class='repsuitename'>"+data[i].testsuitename+"</span></span>");
					}
					else
						container.append("<span class='suiteContainer' data-suiteId='"+data[i].testsuiteid+"' title='"+data[i].testsuitename+"'><img alt='Test suite icon' src='imgs/ic-testsuite-reportbox.png'><br/><span class='repsuitename'>"+data[i].testsuitename+"</span></span>");
				}				
			}
			else{
				
			}
		}, 
		function(error) {
			console.log("Error-------"+error);
		})
	}
	
	//Service call to get start and end details of suites
	$(document).on('click', '.suiteContainer', function(){
		var testsuiteId = $(this).attr('data-suiteId');
		$('#scenarioReportsTable').find('tbody').empty();
		reportService.getSuiteDetailsInExecution_ICE(testsuiteId)
		.then(function(data) {
			var tableContainer = $('#testSuitesTimeTable');
			if(Object.prototype.toString.call(data) === '[object Array]'){
				tableContainer.find('tbody').empty();
				for(i=0; i<data.length; i++){
					tableContainer.find('tbody').append("<tr class='scenariostatusreport' data-executionid='"+data[i].execution_id+"'><td>"+(i+1)+"</td><td>"+data[i].start_time+"</td><td>"+data[i].end_time+"</td></tr>");
				}
			}
			$('.progress-bar-success, .progress-bar-danger, .progress-bar-warning, .progress-bar-norun').css('width','0%');
			$('.passPercent, .failPercent, .terminatePercent, .incompletePercent').text('');
		},
		function(error) {
			console.log("Error-------"+error);
		})
		if($('.dynamicTestsuiteContainer').is(':Visible')){
			$('.iconSpace').trigger('click');
		}
	})
	
	//Service call to get scenario status
	$(document).on('click', '.scenariostatusreport', function(){
		executionId = $(this).attr('data-executionid');
		reportService.reportStatusScenarios_ICE(executionId)
		.then(function(data) {
			var scenarioContainer = $('#scenarioReportsTable');
			if(Object.prototype.toString.call(data) === '[object Array]'){
				var pass = fail = terminated = incomplete = P = F = T = I = 0;
				var total = data.length;
				scenarioContainer.find('tbody').empty();
				var browserIcon;
				for(i=0; i<data.length; i++){
					if(data[i].browser == "chrome")	browserIcon = "ic-reports-chrome.png";
					else if(data[i].browser == "firefox")	browserIcon = "ic-reports-firefox.png";
					else if(data[i].browser == "ie")	browserIcon = "ic-reports-ie.png";
					scenarioContainer.find('tbody').append("<tr><td>"+data[i].testscenarioname+"</td><td>"+data[i].executedtime+"</td><td><img alt='Test suite icon' src='imgs/"+browserIcon+"'></td><td class='openReports' data-reportid='"+data[i].reportid+"'>"+data[i].status+"</td><td><img alt='Export JSON' src='imgs/ic-export-json.png'></td></tr>");
					if(data[i].status == "Pass")	pass++;
					else if(data[i].status == "Fail")	fail++;
					else if(data[i].status == "Terminate")	terminated++;
					else if(data[i].status == "Incomplete")	incomplete++;
				}
				if(data.length > 0){
					P=(pass/total)*100;
					F=(fail/total)*100;
					T=(terminated/total)*100;
					I=(incomplete/total)*100;
					$('.progress-bar-success').css('width',P+"%");	$('.passPercent').text(P+" %");
					$('.progress-bar-danger').css('width',F+"%");	$('.failPercent').text(F+" %");
					$('.progress-bar-warning').css('width',T+"%");	$('.terminatePercent').text(T+" %");
					$('.progress-bar-norun').css('width',I+"%");	$('.incompletePercent').text(I+" %");					
				}
				else{
					$('.progress-bar-success, .progress-bar-danger, .progress-bar-warning, .progress-bar-norun').css('width','0%');
					$('.passPercent, .failPercent, .terminatePercent, .incompletePercent').text('');
				}
			}
		},
		function(error) {
			console.log("Error-------"+error);
		})
	})
	
	$(document).on('click','.iconSpace', function(){	
		$elem = $(this);
		if(open == 0){
			//getting the next element
		    $content = $elem.parent().parent().next();
		    //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
		    if($(".scroll-content").parent(".upper-collapsible-section").find(".suitedropdownicon").length > 0){
	    		$(".scroll-content").parent(".upper-collapsible-section").find(".suitedropdownicon").remove();
	    	}
	    	$(".scroll-content").parent(".upper-collapsible-section").append($elem.parent());
	    	$(".suitedropdownicon").children(".iconSpace").attr("src","imgs/ic-collapseup.png")
		    $content.slideDown(200, function () {
		        //execute this after slideToggle is done
		        //change text of header based on visibility of content div		    	
		    });
		    open = 1;
		}
		else {
			$content = $elem.parent().parent();
			$content.slideUp(200, function () {
		        //execute this after slideToggle is done
		        //change text of header based on visibility of content div
				if($(".scroll-content").parent(".upper-collapsible-section").find($elem.parent()).length > 0){
		    		$(".scroll-content").parent(".upper-collapsible-section").find($elem.parent()).remove();
		    	}
		    	$(".upper-section-testsuites").append($elem.parent());
		    	$(".suitedropdownicon").children(".iconSpace").attr("src","imgs/ic-collapse.png")
		    });
		    open = 0;
		}
	    
	})
	
	$(document).on("click",".openReports", function(e){ 
		openWindow = 0;
		var reportId = $(this).attr('data-reportid');
		var path = "/specificreports";
		//$location.path(path);
		if(openWindow == 0)
		{
			window.open(path,'_blank');
			
		}
		openWindow++;
		e.stopImmediatePropagation();
	})
}]);