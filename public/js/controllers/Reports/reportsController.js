
mySPA.controller('reportsController', ['$scope','$rootScope', '$http', '$location', '$timeout','$window', 'reportService','cfpLoadingBar','$sce', function($scope, $rootScope, $http,$location,$timeout,$window,reportService, cfpLoadingBar, $sce) {
	$("body").css("background","#eee");
	$("head").append('<link id="mindmapCSS2" rel="stylesheet" type="text/css" href="fonts/font-awesome_mindmap/css/font-awesome.min.css" />')
	var getUserInfo = JSON.parse(window.localStorage['_UI']);
	var userID = getUserInfo.user_id;
	var open = 0;	var openWindow = 0;
	var executionId, testsuiteId;
	$("#page-taskName").empty().append('<span>Reports</span>')

	cfpLoadingBar.start()
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		/*document.getElementById("currentYear").innerHTML = new Date().getFullYear()*/
		angular.element(document.getElementById("reportSection")).scope().getReports_ICE();
	}, 100)
	/*var taskAuth;
	if(window.localStorage["_VP"] == "false")
	{
		taskAuth = false;
	}*/
	if(window.localStorage['navigateScreen'] != "p_Reports"){
		$rootScope.redirectPage();
	}
	//Loading Project Info
	//var getProjInfo = JSON.parse(window.localStorage['_T'])
	//$(".upper-section-testsuites").append('<span class="suitedropdownicon"><span class="iconSpace">Down</span></span>');

	//$(".projectInfoWrap").empty()
	//$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">'+getProjInfo.projectName+'</span></p><p class="proj-info-wrap"><span class="content-label">Module :</span><span class="content">'+getProjInfo.moduleName+'</span></p><p class="proj-info-wrap"><span class="content-label">Screen :</span><span class="content">'+getProjInfo.screenName+'</span></p>')
	//Loading Project

	$scope.getReports_ICE = function(){
		reportService.getMainReport_ICE()
		.then(function(data1) {
			if(data1 == "Invalid Session"){
				$rootScope.redirectPage();
			}
			if(data1 != "fail"){
				$("#reportSection").append(data1);
				$("#middle-content-section").css('visibility','visible');
				getProjectsAndSuites(userID, "projects");
			}
			else	console.log("Failed to get reports.")
		}, function(error) {
		});
	}

	//service call to get projects and testsuites
	$(document).on('change', ".rpProjects", function(){
		var projectId = $(this).children("option:selected").val();
		if(projectId){
			$('.suiteContainer, .scenariostatusreport').remove();
			$('.scenarioReportstbody tr').remove();
			$('.progress-bar-success, .progress-bar-danger, .progress-bar-warning, .progress-bar-norun').css('width','0%');
			$('.passPercent, .failPercent, .terminatePercent, .incompletePercent').text('');
			if($(".dynamicTestsuiteContainer").is(":Visible")){
				$('.iconSpace').trigger('click');
			}
			getProjectsAndSuites(projectId, "reports");
		}
	})
	
	//getAllSuites_ICE function call
	function getProjectsAndSuites(ID, type){
		reportService.getAllSuites_ICE(ID, type)
		.then(function(data) {
			if(data == "Invalid Session"){
				$rootScope.redirectPage();
			}
			if(type == "projects"){
				if(data != "fail" && data.projectids.length != 0){
					$(".rpProjects").empty();
					$(".rpProjects").append("<option selected disabled>Select Project</option>");
					for(i=0; i<data.projectids.length; i++){
						$(".rpProjects").append("<option value='"+data.projectids[i]+"'>"+data.projectnames[i]+"</option>");
					}
					var proId;
					if(localStorage.getItem('fromExecution') == "true"){
						var testSuites = JSON.parse(localStorage.getItem("_CT")).testSuiteDetails;
						if(testSuites.length > 0)
						{
							for(var i=0; i<testSuites.length; i++){
								proId = testSuites[i].projectidts;
							}
						}
						else{
							proId = JSON.parse(localStorage.getItem("_CT")).projectId;
						}						
						var options = $(".rpProjects option");
						for(var i=0; i<options.length; i++){
							if(options[i].value == proId){
								$(".rpProjects").prop('selectedIndex', i);
								localStorage.setItem('fromExecution','false')
								break;
							}
						}
					}
					else{
						$(".rpProjects").prop('selectedIndex', 1);
						proId = data.projectids[0];
						console.log("data",data.projectids[0]);
						console.log("proId",proId);
					}
					getProjectsAndSuites(proId, "reports");					
				}
				else	console.log("Unable to load test suites.");
			}
			else if(type == "reports"){
				$('.scrollbar-inner').scrollbar();
				$('.scrollbar-macosx').scrollbar();
				var container = $('.staticTestsuiteContainer');
				if(Object.prototype.toString.call( data ) === '[object Object]'){
					if(data.suiteids.length > 0){
						for(i=0; i<data.suiteids.length; i++){
							if(container.find('.suiteContainer').length >= 6){
								$('.dynamicTestsuiteContainer').append("<span class='suiteContainer' data-suiteId='"+data.suiteids[i]+"'><img alt='Test suite icon' class='reportbox' src='imgs/ic-reportbox.png' title='"+data.suitenames[i]+"'><br/><span class='repsuitename' title='"+data.suitenames[i]+"'>"+data.suitenames[i]+"</span></span>");
							}
							else{
								container.append("<span class='suiteContainer' data-suiteId='"+data.suiteids[i]+"'><img alt='Test suite icon' class='reportbox' src='imgs/ic-reportbox.png' title='"+data.suitenames[i]+"'><br/><span class='repsuitename' title='"+data.suitenames[i]+"'>"+data.suitenames[i]+"</span></span>");
							}
						}
					}
				}
				$('.searchScrapEle').css('display', 'none');
				if($('.dynamicTestsuiteContainer').find('.suiteContainer').length <= 0){
					$('.suitedropdownicon, .dynamicTestsuiteContainer').hide();
				}
				else $('.suitedropdownicon').show();
				$('[data-toggle="tooltip"]').tooltip();
				cfpLoadingBar.complete();
			}
		}, function(error) {
			console.log("Error-------"+error);
			return "fail";
		})
	}
	var showSearchBox = true;
	$(document).on("click", ".searchScrapEle", function(){
		if(showSearchBox){
			$(".searchScrapInput").show();
			showSearchBox=false;
			$(".searchScrapInput").focus();
		}	else{
			$(".searchScrapInput").hide();
			showSearchBox=true;
		}
	})

	$(document).on('keyup', '#searchModule', function(){
		input = document.getElementById("searchModule");
    	filter = input.value.toUpperCase();
		elems = $('.dynamicTestsuiteContainer .suiteContainer');
		for (i = 0; i < elems.length; i++) {
				if (elems[i].textContent.toUpperCase().indexOf(filter) > -1) {
						elems[i].style.display = "";
				} else {
						elems[i].style.display = "none";
				}
		}
	});

	//Service call to get start and end details of suites
	$(document).on('click', '.suiteContainer', function(){
		$('.formatpdfbrwsrexport').remove();
		$(this).find('.reportbox').parent().addClass('reportboxselected');
		if($(this).parent().hasClass('staticTestsuiteContainer')){
			$(this).siblings().find('.reportbox').parent().removeClass('reportboxselected');
			$('.dynamicTestsuiteContainer').find('.reportbox').parent().removeClass('reportboxselected');
		}
		else if($(this).parent().hasClass('dynamicTestsuiteContainer')){
			$(this).siblings().find('.reportbox').parent().removeClass('reportboxselected');
			$('.staticTestsuiteContainer').find('.reportbox').parent().removeClass('reportboxselected');
		}
		testsuiteId = $(this).attr('data-suiteId');
		$('#scenarioReportsTable').find('tbody').empty();
		reportService.getSuiteDetailsInExecution_ICE(testsuiteId)
		.then(function(data) {
			if(data == "Invalid Session"){
				$rootScope.redirectPage();
			}
			if(data != "fail"){
				var tableContainer = $('#testSuitesTimeTable');
				if(Object.prototype.toString.call(data) === '[object Array]'){
					if(data.length > 0){
						tableContainer.find('tbody').empty();
						var startDat, startTym, endDat, endTym, sD,sT,eD,eT;
						for(i=0; i<data.length; i++){
							startDat = (data[i].start_time.split(' ')[0]).split("-")
							startTym = (data[i].start_time.split(' ')[1]).split(":")
							endDat = (data[i].end_time.split(' ')[0]).split("-")
							endTym = (data[i].end_time.split(' ')[1]).split(":")
							sD = ("0" + startDat[0]).slice(-2) +"-"+ ("0" + startDat[1]).slice(-2) +"-"+ startDat[2];
							sT = ("0" + startTym[0]).slice(-2) +":"+ ("0" + startTym[1]).slice(-2);
							eD = ("0" + endDat[0]).slice(-2) +"-"+ ("0" + endDat[1]).slice(-2) +"-"+ endDat[2];
							eT = ("0" + endTym[0]).slice(-2) +":"+ ("0" + endTym[1]).slice(-2);
							tableContainer.find('tbody').append("<tr class='scenariostatusreport' data-executionid='"+data[i].execution_id+"'><td>"+(i+1)+"</td><td>"+sD+"</td><td>"+sT+"</td><td>"+eD+"</td><td>"+eT+"</td></tr>");
						}
						if(data.length > 2){
							$("#dateDESC").show();
						}
						else $("#dateDESC, #dateASC").hide();
						var dateArray = $('tbody.scrollbar-inner-scenariostatus').children('.scenariostatusreport');
						dateASC(dateArray);
						$("tbody.scrollbar-inner-scenariostatus").empty();
						for(i=0; i<dateArray.length; i++){
							dateArray[i].firstChild.innerText = i+1;
							$("tbody.scrollbar-inner-scenariostatus").append(dateArray[i]);
						}
					}
					else {
						tableContainer.find('tbody').empty();
						$("#dateDESC").hide();
						$("#dateASC").hide();
					}
				}
				$('.progress-bar-success, .progress-bar-danger, .progress-bar-warning, .progress-bar-norun').css('width','0%');
				$('.passPercent, .failPercent, .terminatePercent, .incompletePercent').text('');
			}
			else	console.log("Unable to load Test suite details in execution.")
		},
		function(error) {
			console.log("Error-------"+error);
		})
		if($('.dynamicTestsuiteContainer').is(':Visible')){
			$('.iconSpace').trigger('click');
		}
	})

	//Date sorting
	$(document).on('click', '#dateDESC', function(){
		$(this).hide();
		var dateArray;
		if($(this).parents('table').attr("id") == "testSuitesTimeTable"){
			$('#dateASC').show();
			dateArray = $('tbody.scrollbar-inner-scenariostatus').children('.scenariostatusreport');
			dateDESC(dateArray);
			$("tbody.scrollbar-inner-scenariostatus").empty();
			for(i=0; i<dateArray.length; i++){
				dateArray[i].firstChild.innerText = i+1;
				$("tbody.scrollbar-inner-scenariostatus").append(dateArray[i]);
			}
		}
		else if($(this).parents('table').attr("id") == "scenarioReportsTable"){
			$("#scenarioReportsTable #dateASC").show();
			dateArray = $('tbody.scrollbar-inner-scenarioreports').children('tr');
			dateDESC(dateArray);
			$("tbody.scrollbar-inner-scenarioreports").empty();
			for(i=0; i<dateArray.length; i++){
				$("tbody.scrollbar-inner-scenarioreports").append(dateArray[i]);
			}
		}
	})
	$(document).on('click', '#dateASC', function(){
		$(this).hide();
		if($(this).parents('table').attr("id") == "testSuitesTimeTable"){
			$('#dateDESC').show();
			var dateArray = $('tbody.scrollbar-inner-scenariostatus').children('.scenariostatusreport');
			dateASC(dateArray);
			$("tbody.scrollbar-inner-scenariostatus").empty();
			for(i=0; i<dateArray.length; i++){
				dateArray[i].firstChild.innerText = i+1;
				$("tbody.scrollbar-inner-scenariostatus").append(dateArray[i]);
			}
		}
		else if($(this).parents('table').attr("id") == "scenarioReportsTable"){
			$("#scenarioReportsTable #dateDESC").show();
			var dateArray = $('tbody.scrollbar-inner-scenarioreports').children('tr');
			dateASC(dateArray);
			$("tbody.scrollbar-inner-scenarioreports").empty();
			for(i=0; i<dateArray.length; i++){
				$("tbody.scrollbar-inner-scenarioreports").append(dateArray[i]);
			}
		}
	})

	function dateDESC(dateArray){
		dateArray.sort(function(a,b){
			var dateA, timeA, dateB, timeB;
			if(a.children.item(1).children.length == 0){
				dateA = a.children.item(1).innerText;
				timeA = a.children.item(2).innerText;
				dateB = b.children.item(1).innerText;
				timeB = b.children.item(2).innerText;
			}
			else{
				dateA = a.children.item(1).children.item(0).innerText.split(" ")[0];
				timeA = a.children.item(1).children.item(0).innerText.split(" ")[1];
				dateB = b.children.item(1).children.item(0).innerText.split(" ")[0];
				timeB = b.children.item(1).children.item(0).innerText.split(" ")[1];
			}
			var fDate = dateA.split("-"); var lDate = dateB.split("-");
			//var fFDate = fDate[0].split("/"); var lLDate = lDate[0].split("/");
			var gDate = fDate[2]+"-"+fDate[1]+"-"+fDate[0];
			var mDate = lDate[2]+"-"+lDate[1]+"-"+lDate[0];
			if ( new Date(gDate+" "+timeA) < new Date(mDate+" "+timeB) )  return -1;
			if ( new Date(gDate+" "+timeA) > new Date(mDate+" "+timeB) )  return 1;
			return dateArray;
		})
	}

	function dateASC(dateArray){
		dateArray.sort(function(a,b){
			var aA, timeA, bB, timeB;
			if(a.children.item(1).children.length == 0){
				aA = a.children.item(1).innerText;
				timeA = a.children.item(2).innerText;
				bB = b.children.item(1).innerText;
				timeB = b.children.item(2).innerText;
			}
			else{
				aA = a.children.item(1).children.item(0).innerText.split(" ")[0];
				timeA = a.children.item(1).children.item(0).innerText.split(" ")[1];
				bB = b.children.item(1).children.item(0).innerText.split(" ")[0];
				timeB = b.children.item(1).children.item(0).innerText.split(" ")[1];
			}
			var fDate = aA.split("-"); var lDate = bB.split("-");
			//var fFDate = fDate[0].split("/"); var lLDate = lDate[0].split("/");
			var gDate = fDate[2]+"-"+fDate[1]+"-"+fDate[0];
			var mDate = lDate[2]+"-"+lDate[1]+"-"+lDate[0];
			if ( new Date(gDate+" "+timeA) > new Date(mDate+" "+timeB) )  return -1;
			if ( new Date(gDate+" "+timeA) < new Date(mDate+" "+timeB) )  return 1;
			return dateArray;
		})
	}
	//Date sorting
	//Service call to get scenario status
	$(document).on('click', '.scenariostatusreport', function(){
		$(this).addClass('scenariostatusreportselect');
		$(this).siblings().removeClass('scenariostatusreportselect');
		executionId = $(this).attr('data-executionid');
		var testsuiteid = $(".reportboxselected").attr('data-suiteid');
		$('.formatpdfbrwsrexport').remove();
		reportService.reportStatusScenarios_ICE(executionId, testsuiteid)
		.then(function(data) {
			console.log("data",data);
			if(data == "Invalid Session"){
				$rootScope.redirectPage();
			}
			if(data != "fail"){
				var scenarioContainer = $('#scenarioReportsTable');
				if(Object.prototype.toString.call(data) === '[object Array]'){
					var pass = fail = terminated = incomplete = P = F = T = I = 0;
					var total = data.length;
					scenarioContainer.find('tbody').empty();
					var browserIcon, brow="";
					var styleColor, exeDate, exeDat, exeTime;
					for(i=0; i<data.length; i++){
						browserIcon=""; brow="";
						if(data[i].browser.toLowerCase() == "chrome")	browserIcon = "ic-reports-chrome.png";
						else if(data[i].browser.toLowerCase() == "firefox")	browserIcon = "ic-reports-firefox.png";
						else if(data[i].browser.toLowerCase() == "internet explorer")	browserIcon = "ic-reports-ie.png";
						else if(data[i].browser.toLowerCase() == "safari")	browserIcon = "ic-reports-safari.png";
						if(browserIcon)	brow = "imgs/"+browserIcon;
						else brow = "imgs/no_img1.png"
						if(data[i].status == "Pass"){	pass++;	styleColor="style='color: #009444 !important; text-decoration-line: none;'";}
						else if(data[i].status == "Fail"){	fail++;	styleColor="style='color: #b31f2d !important; text-decoration-line: none;'";}
						else if(data[i].status == "Terminate"){	terminated++;	styleColor="style='color: #faa536 !important; text-decoration-line: none;'";}
						else if(data[i].status == "Incomplete"){	incomplete++;	styleColor="style='color: #58595b !important; text-decoration-line: none;'";}
						// exeDate = data[i].executedtime.split(" ")[0].split("-");
						// exeDat = ("0" + exeDate[0]).slice(-2) +"-"+ ("0" + exeDate[1]).slice(-2) +"-"+ exeDate[2];
						// var fst = data[i].executedtime.split(" ")[1].split(":");
						// exeTime = ("0" + fst[0]).slice(-2) +":"+ ("0" + fst[1]).slice(-2);

						scenarioContainer.find('tbody').append("<tr><td title='"+data[i].testscenarioname+"'>"+data[i].testscenarioname+"</td><td><span style='margin-right: 28px;'>"+data[i].executedtime.trim()+"</span></td><td><img class='sap' alt='-' src='"+brow+"'></td><td class='openReports' data-reportid='"+data[i].reportid+"'><a class='openreportstatus' "+styleColor+">"+data[i].status+"</a></td><td data-reportid='"+data[i].reportid+"'><img alt='Select format' class='selectFormat' src='imgs/ic-export-json.png' style='cursor: pointer;' title='Select format'></td></tr>");
					}
					if(data.length > 2){
						$("#scenarioReportsTable #dateDESC").show();
					}
					else{
						$("#scenarioReportsTable #dateDESC").hide();
						$("#scenarioReportsTable #dateASC").hide();
					}
					$("#scenarioReportsTable").find("#dateASC").hide();
					var dateArray = $('tbody.scrollbar-inner-scenarioreports').children('tr');
					dateASC(dateArray);
					$("tbody.scrollbar-inner-scenarioreports").empty();
					for(i=0; i<dateArray.length; i++){
						//dateArray[i].firstChild.innerText = i+1;
						$("tbody.scrollbar-inner-scenarioreports").append(dateArray[i]);
					}
					if(data.length > 0){
						P = parseFloat((pass/total)*100).toFixed();
						F = parseFloat((fail/total)*100).toFixed();
						T = parseFloat((terminated/total)*100).toFixed();
						I = parseFloat((incomplete/total)*100).toFixed();
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
			}
			else	console.log("Failed to get scenario status");
		},
		function(error) {
			console.log("Error-------"+error);
		})
	})

	$(document).on('click', '.selectFormat', function(){
		$('.formatpdfbrwsrexport').remove();
		var repID = $(this).parent().attr("data-reportid");
		$(this).parent().append("<span class='formatpdfbrwsrexport'><img alt='Pdf Icon' class='getSpecificReportBrowser openreportstatus' data-getrep='wkhtmltopdf' data-reportid='"+repID+"' style='cursor: pointer; margin-right: 10px;' src='imgs/ic-pdf.png' title='PDF Report'><img alt='-' class='getSpecificReportBrowser openreportstatus' data-getrep='html' data-reportid='"+repID+"' style='cursor: pointer; margin-right: 10px; width: 23px;' src='imgs/ic-web.png' title='Browser Report'><img alt='Export JSON' class='exportToJSON' data-reportid='"+repID+"' style='cursor: pointer;' src='imgs/ic-export-to-json.png' title='Export to Json'></span>")
		$('.formatpdfbrwsrexport').focus();
	})

	$('span.formatpdfbrwsrexport').focusout(function(){
		$('.formatpdfbrwsrexport').remove();
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
				$('.scrollbar-inner').scrollbar();
				$('.scrollbar-macosx').scrollbar();
			});
			$('.searchScrapEle').css('display', '');
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

			$('.searchScrapEle').css('display', 'none');
			$(".searchScrapInput").hide();
			showSearchBox = true;
			open = 0;
		}
	})

	$(document).on('click', '.openreportstatus', function(e){
		var reportID = $(this).attr('data-reportid');
		var reportType = $(this).attr('data-getrep');
		var testsuitename = $(".reportboxselected").text();
		var scenarioName = $('.openreportstatus').parents('tr').find('td:first-child').text();
		//var d = new Date();
		//var DATE = ("0" + (d.getMonth()+1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/" + d.getFullYear();
		//var TIME = ("0" + d.getHours()).slice(-2) +":"+ ("0" + d.getMinutes()).slice(-2) +":"+ ("0" + d.getSeconds()).slice(-2);
		var pass = fail = terminated = total = 0;
		var scrShot={"idx":[],"paths":[]};
		var finalReports = {
				overallstatus : [{
					"domainName": "",
					"projectName": "",
					"releaseName": "",
					"cycleName": "",
					"scenarioName": "",
					"browserVersion": "",
					"browserType": "",
					"StartTime": "",
					"EndTime": "",
					"overAllStatus": "",
					"EllapsedTime": "",
					"date": "",
					"time": "",
					"pass": "",
					"fail": "",
					"terminate": ""
				}],
				rows : []
		};
		reportService.getReport_Nineteen68(reportID, testsuiteId,testsuitename)
		.then(function(data) {
			if(data == "Invalid Session"){
				$rootScope.redirectPage();
			}
			if(data != "fail"){
				if(data.length > 0){
					finalReports.overallstatus[0].domainName = data[0].domainname
					finalReports.overallstatus[0].projectName = data[0].projectname
					finalReports.overallstatus[0].releaseName =	data[0].releasename
					finalReports.overallstatus[0].cycleName = data[0].cyclename
					finalReports.overallstatus[0].scenarioName = data[0].testscenarioname

					var obj2 = JSON.parse(data[1].reportdata);
					var elapTym;
					for(j=0; j<obj2.overallstatus.length; j++){
						finalReports.overallstatus[0].browserVersion = (obj2.overallstatus[j].browserVersion) == ""? "-" : obj2.overallstatus[j].browserVersion;
						finalReports.overallstatus[0].browserType = (obj2.overallstatus[j].browserType) ==""? "-" : obj2.overallstatus[j].browserType;
						finalReports.overallstatus[0].StartTime = obj2.overallstatus[j].StartTime.split(".")[0];
						finalReports.overallstatus[0].EndTime = obj2.overallstatus[j].EndTime.split(".")[0];
						var getTym = obj2.overallstatus[j].EndTime.split(".")[0];
						var getDat = getTym.split(" ")[0].split("-");
						finalReports.overallstatus[0].date = getDat[1] +"/"+ getDat[2] +"/"+ getDat[0];
						finalReports.overallstatus[0].time = getTym.split(" ")[1];
						finalReports.overallstatus[0].overAllStatus = obj2.overallstatus[j].overallstatus;
						elapTym = (obj2.overallstatus[j].EllapsedTime.split(".")[0]).split(":");
						finalReports.overallstatus[0].EllapsedTime = "~" + ("0" + elapTym[0]).slice(-2) +":"+ ("0" + elapTym[1]).slice(-2) +":"+ ("0" + elapTym[2]).slice(-2)
					}
					for(k=0; k<obj2.rows.length; k++){
						finalReports.rows.push(obj2.rows[k]);
						finalReports.rows[k].slno = k+1;
						if(finalReports.rows[k]["Step "] != undefined){// && finalReports.rows[k]["Step "].indexOf("Step") !== -1){
							finalReports.rows[k].Step = finalReports.rows[k]["Step "];
						}
						if(finalReports.rows[k].hasOwnProperty("EllapsedTime") && finalReports.rows[k].EllapsedTime.trim() != ""){
							elapTym = (finalReports.rows[k].EllapsedTime.split(".")[0]).split(":")
							if(finalReports.rows[k].EllapsedTime.split(".")[1] == undefined || finalReports.rows[k].EllapsedTime.split(".")[1] == ""){
								finalReports.rows[k].EllapsedTime = ("0" + elapTym[0]).slice(-2) +":"+ ("0" + elapTym[1]).slice(-2) +":"+ ("0" + elapTym[2]).slice(-2);
							}
							else if(finalReports.rows[k].EllapsedTime.split(".").length < 3 && finalReports.rows[k].EllapsedTime.split(".")[0].indexOf(":") === -1){
								finalReports.rows[k].EllapsedTime = ("0" + 0).slice(-2) +":"+ ("0" + 0).slice(-2) +":"+ ("0" + elapTym[0]).slice(-2) +":"+ ("0" + 0).slice(-2);
							}
							else{
								finalReports.rows[k].EllapsedTime = ("0" + elapTym[0]).slice(-2) +":"+ ("0" + elapTym[1]).slice(-2) +":"+ ("0" + elapTym[2]).slice(-2) +":"+ finalReports.rows[k].EllapsedTime.split(".")[1].slice(0, 3);
							}
						}
						if(finalReports.rows[k].hasOwnProperty("status") && finalReports.rows[k].status != ""){
							total++;
						}
						if(finalReports.rows[k].status == "Pass"){	pass++;}
						else if(finalReports.rows[k].status == "Fail"){	fail++;}
						else if(finalReports.rows[k].status == "Terminate"){terminated++;}
						if(reportType!="html" && !(finalReports.rows[k].screenshot_path == undefined)){
							scrShot.idx.push(k);
							scrShot.paths.push(finalReports.rows[k].screenshot_path);
						}
					}
					finalReports.overallstatus[0].pass = (parseFloat((pass/total)*100).toFixed(2)) > 0? parseFloat((pass/total)*100).toFixed(2) : parseInt(0);
					finalReports.overallstatus[0].fail = (parseFloat((fail/total)*100).toFixed(2)) > 0? parseFloat((fail/total)*100).toFixed(2) : parseInt(0);
					finalReports.overallstatus[0].terminate = (parseFloat((terminated/total)*100).toFixed(2)) > 0? parseFloat((terminated/total)*100).toFixed(2) : parseInt(0);
				}
				if(reportType=="html"){
					//Service call to get Html reports
					reportService.renderReport_ICE(finalReports, reportType).then(
					function(data1) {
						if(data1 == "Invalid Session") $rootScope.redirectPage();
						else if(data1 == "fail") console.log("Failed to render reports.");
						else{
							openWindow = 0;
							if(openWindow == 0){
								var myWindow;
								myWindow = window.open();
								myWindow.document.write(data1);
								setTimeout(function(){
									myWindow.stop();
								}, 5000);
							}
							openWindow++;
							e.stopImmediatePropagation();
						}
					},
					function(error) {
						console.log("Error-------"+error);
					});
				}
				else{
					//Service call to get screenshots for Pdf reports
					reportService.getScreenshotDataURL_ICE(scrShot.paths).then(
					function(dataURIs) {
						if(dataURIs=="fail" || dataURIs=="unavailableLocalServer") scrShot.paths.forEach(function(d,i){finalReports.rows[scrShot.idx[i]].screenshot_dataURI=dataURIs;});
						else dataURIs.forEach(function(d,i){finalReports.rows[scrShot.idx[i]].screenshot_dataURI=d;});
						//Service call to get Pdf reports
						reportService.renderReport_ICE(finalReports, reportType).then(
						function(data1){
							if(data1 == "Invalid Session") $rootScope.redirectPage();
							else if(data1 == "fail") console.log("Failed to render reports.");
							else{
								openWindow = 0;
								if(openWindow == 0){
									var file = new Blob([data1], {type: 'application/pdf'});
									var fileURL = URL.createObjectURL(file);
									var a = document.createElement('a');
									a.href = fileURL;
									a.download = finalReports.overallstatus[0].scenarioName;
									//a.target="_new";
									document.body.appendChild(a);
									a.click();
									document.body.removeChild(a);
									//$window.open(fileURL, '_blank');
									URL.revokeObjectURL(fileURL);
								}
								openWindow++;
								e.stopImmediatePropagation();
							}
						},
						function(error) {
							console.log("Error-------"+error);
						});
					},
					function(error){
						console.log("Error-------"+error);
					});
				}
				$('.formatpdfbrwsrexport').remove();
			}
			else console.log("Failed to get reports details");
		},
		function(error) {
			console.log("Error-------"+error);
		});
	});


	//Export To JSON
	$(document).on('click', '.exportToJSON', function(e){
		var repId = $(this).attr('data-reportid');
		reportService.exportToJson_ICE(repId)
		.then(function(response) {
			if(response == "Invalid Session"){
				$rootScope.redirectPage();
			}
			if(response != "fail"){
				if (typeof response === 'object') {
					var temp = JSON.parse(response.reportdata);
					var responseData = JSON.stringify(temp, undefined, 2);
				}
				filename = response.scenarioname +".json";
				var objAgent = $window.navigator.userAgent;
				var objbrowserName = navigator.appName;
				var objfullVersion = ''+parseFloat(navigator.appVersion);
				var objBrMajorVersion = parseInt(navigator.appVersion,10);
				var objOffsetName,objOffsetVersion,ix;
				// In Chrome
				if ((objOffsetVersion=objAgent.indexOf("Chrome"))!=-1) {
					objbrowserName = "Chrome";
					objfullVersion = objAgent.substring(objOffsetVersion+7);
				}
				// In Microsoft internet explorer
				else if ((objOffsetVersion=objAgent.indexOf("MSIE"))!=-1) {
					objbrowserName = "Microsoft Internet Explorer";
					objfullVersion = objAgent.substring(objOffsetVersion+5);
				}
				// In Firefox
				else if ((objOffsetVersion=objAgent.indexOf("Firefox"))!=-1) {
					objbrowserName = "Firefox";
				}
				// In Safari
				else if ((objOffsetVersion=objAgent.indexOf("Safari"))!=-1) {
					objbrowserName = "Safari";
					objfullVersion = objAgent.substring(objOffsetVersion+7);
					if ((objOffsetVersion=objAgent.indexOf("Version"))!=-1)
						objfullVersion = objAgent.substring(objOffsetVersion+8);
				}
				// For other browser "name/version" is at the end of userAgent
				else if ( (objOffsetName=objAgent.lastIndexOf(' ')+1) < (objOffsetVersion=objAgent.lastIndexOf('/')) ) {
					objbrowserName = objAgent.substring(objOffsetName,objOffsetVersion);
					objfullVersion = objAgent.substring(objOffsetVersion+1);
					if (objbrowserName.toLowerCase()==objbrowserName.toUpperCase()) {
						objbrowserName = navigator.appName;
					}
				}
				// trimming the fullVersion string at semicolon/space if present
				if ((ix=objfullVersion.indexOf(";"))!=-1) objfullVersion=objfullVersion.substring(0,ix);
				if ((ix=objfullVersion.indexOf(" "))!=-1) objfullVersion=objfullVersion.substring(0,ix);
				objBrMajorVersion = parseInt(''+objfullVersion,10);
				if (isNaN(objBrMajorVersion)) {
					objfullVersion = ''+parseFloat(navigator.appVersion);
					objBrMajorVersion = parseInt(navigator.appVersion,10);
				}
				if(objBrMajorVersion== "9"){
					if(objbrowserName == "Microsoft Internet Explorer"){
						window.navigator.msSaveOrOpenBlob(new Blob([responseData], {type:"text/json;charset=utf-8"}), filename);
					}
				}else{
					var blob = new Blob([responseData], {type: 'text/json'}),
					e = document.createEvent('MouseEvents'),
					a = document.createElement('a');
					a.download = filename;
					if(objbrowserName == "Microsoft Internet Explorer" || objbrowserName == "Netscape"){
						window.navigator.msSaveOrOpenBlob(new Blob([responseData], {type:"text/json;charset=utf-8"}), filename);
						//saveAs(blob, filename);
					}else{
						a.href = window.URL.createObjectURL(blob);
						a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
						e.initMouseEvent('click', true, true, window,
								0, 0, 0, 0, 0, false, false, false, false, 0, null);
						/*if(counter == 0)
						{
							a.dispatchEvent(e);
						}
						counter++;*/
						a.dispatchEvent(e);
					}
				}
			}
			else	console.log("Error while exporting JSON.\n");
		},
		function(error) {
			console.log("Error while exportsing JSON.\n "+(error.data));
		});
		$('.formatpdfbrwsrexport').remove();
	})
}]);
