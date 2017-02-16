
mySPA.controller('reportsController', ['$scope', '$http', '$location', '$timeout', 'reportService','cfpLoadingBar', function($scope,$http,$location,$timeout,reportService, cfpLoadingBar) {
	$("body").css("background","#eee");
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
	}, 500)
	//Loading Project Info
	//var getProjInfo = JSON.parse(window.localStorage['_T'])
	//$(".upper-section-testsuites").append('<span class="suitedropdownicon"><span class="iconSpace">Down</span></span>');
	$("#page-taskName").empty().append('<span>Reports</span>')
	//$(".projectInfoWrap").empty()
	//$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">'+getProjInfo.projectName+'</span></p><p class="proj-info-wrap"><span class="content-label">Module :</span><span class="content">'+getProjInfo.moduleName+'</span></p><p class="proj-info-wrap"><span class="content-label">Screen :</span><span class="content">'+getProjInfo.screenName+'</span></p>')
	//Loading Project Info

	readTestSuites();
	function readTestSuites(){
		
	}
	
	$(".iconSpace").on('click', function(){
		if($(this).hasClass('expanded')){
			$(".upper-section-testsuites").animate({height : '128'}, 300);
			//$(".upper-section-testsuites").scrollTop($(".upper-section-testsuites").height());
			$(this).removeClass("expanded");
			$(".upper-section-testsuites").removeClass("addscrolltotestsuite");
		}
		else{
			$(".upper-section-testsuites").animate({height : '400'}, 300);
			$(this).addClass("expanded");
			$(".upper-section-testsuites").addClass("addscrolltotestsuite");
		}
	})
}]);