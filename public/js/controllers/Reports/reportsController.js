
mySPA.controller('reportsController', ['$scope', '$http', '$location', '$timeout','$window', 'reportService','cfpLoadingBar', function($scope,$http,$location,$timeout,$window,reportService, cfpLoadingBar) {
	$("body").css("background","#eee");
	var getUserInfo = JSON.parse(window.localStorage['_UI']);
	var userID = getUserInfo.user_id;
	var open = 0;	var openWindow = 0;
	var counter = 0;
	var executionId, testsuiteId;
	$("#page-taskName").empty().append('<span>Reports</span>')
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		/*document.getElementById("currentYear").innerHTML = new Date().getFullYear()*/
		angular.element(document.getElementById("reportSection")).scope().getReports_ICE();
	}, 100)
	//Loading Project Info
	//var getProjInfo = JSON.parse(window.localStorage['_T'])
	//$(".upper-section-testsuites").append('<span class="suitedropdownicon"><span class="iconSpace">Down</span></span>');
	
	//$(".projectInfoWrap").empty()
	//$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">'+getProjInfo.projectName+'</span></p><p class="proj-info-wrap"><span class="content-label">Module :</span><span class="content">'+getProjInfo.moduleName+'</span></p><p class="proj-info-wrap"><span class="content-label">Screen :</span><span class="content">'+getProjInfo.screenName+'</span></p>')
	//Loading Project Info
	
	$scope.getReports_ICE = function(){
		reportService.getMainReport_ICE()
		.then(function(data1) {
			if(data1){
				$("#reportSection").append(data1)
				reportService.getAllSuites_ICE(userID)
				.then(function(data) {
					$('.scrollbar-inner').scrollbar();
					$('.scrollbar-macosx').scrollbar();
					var container = $('.staticTestsuiteContainer');
					if(Object.prototype.toString.call( data ) === '[object Array]'){
						if(data.length > 0){
							for(i=0; i<data.length; i++){
								if(container.find('.suiteContainer').length >= 6){
									$('.dynamicTestsuiteContainer').append("<span class='suiteContainer' data-suiteId='"+data[i].testsuiteid+"'><img alt='Test suite icon' class='reportbox' src='imgs/ic-reportbox.png' title='"+data[i].testsuitename+"'><br/><span class='repsuitename' title='"+data[i].testsuitename+"'>"+data[i].testsuitename+"</span></span>");
								}
								else
									container.append("<span class='suiteContainer' data-suiteId='"+data[i].testsuiteid+"'><img alt='Test suite icon' class='reportbox' src='imgs/ic-reportbox.png' title='"+data[i].testsuitename+"'><br/><span class='repsuitename' title='"+data[i].testsuitename+"'>"+data[i].testsuitename+"</span></span>");
							}					
						}
					}
					else{
						
					}
					if($('.dynamicTestsuiteContainer').find('.suiteContainer').length <= 0){
						$('.suitedropdownicon').hide();
					}
				}, 
				function(error) {
					console.log("Error-------"+error);
				})
			}					
		}, function(error) {
		});
	}
		
	//Service call to get start and end details of suites
	$(document).on('click', '.suiteContainer', function(){
		$(this).find('.reportbox').addClass('reportboxselected');
		if($(this).parent().hasClass('staticTestsuiteContainer')){
			$(this).siblings().find('.reportbox').removeClass('reportboxselected');
			$('.dynamicTestsuiteContainer').find('.reportbox').removeClass('reportboxselected');
		}
		else if($(this).parent().hasClass('dynamicTestsuiteContainer')){
			$(this).siblings().find('.reportbox').removeClass('reportboxselected');
			$('.staticTestsuiteContainer').find('.reportbox').removeClass('reportboxselected');
		}		
		testsuiteId = $(this).attr('data-suiteId');
		$('#scenarioReportsTable').find('tbody').empty();
		reportService.getSuiteDetailsInExecution_ICE(testsuiteId)
		.then(function(data) {
			var tableContainer = $('#testSuitesTimeTable');
			if(Object.prototype.toString.call(data) === '[object Array]'){
				if(data.length > 0){
					tableContainer.find('tbody').empty();
					for(i=0; i<data.length; i++){
						tableContainer.find('tbody').append("<tr class='scenariostatusreport' data-executionid='"+data[i].execution_id+"'><td>"+(i+1)+"</td><td>"+data[i].start_time.split(' ')[0]+"</td><td>"+data[i].start_time.split(' ')[1]+"</td><td>"+data[i].end_time.split(' ')[0]+"</td><td>"+data[i].end_time.split(' ')[1]+"</td></tr>");
					}					
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
		$(this).addClass('scenariostatusreportselect');
		$(this).siblings().removeClass('scenariostatusreportselect');
		executionId = $(this).attr('data-executionid');
		reportService.reportStatusScenarios_ICE(executionId)
		.then(function(data) {
			var scenarioContainer = $('#scenarioReportsTable');
			if(Object.prototype.toString.call(data) === '[object Array]'){
				var pass = fail = terminated = incomplete = P = F = T = I = 0;
				var total = data.length;
				scenarioContainer.find('tbody').empty();
				var browserIcon;
				var styleColor;
				for(i=0; i<data.length; i++){
					if(data[i].browser == "chrome")	browserIcon = "ic-reports-chrome.png";
					else if(data[i].browser == "firefox")	browserIcon = "ic-reports-firefox.png";
					else if(data[i].browser == "internet explorer")	browserIcon = "ic-reports-ie.png";					
					if(data[i].status == "Pass"){	pass++;	styleColor="style='color: #009444 !important;'";}
					else if(data[i].status == "Fail"){	fail++;	styleColor="style='color: #b31f2d !important;'";}
					else if(data[i].status == "Terminate"){	terminated++;	styleColor="style='color: #faa536 !important;'";}
					else if(data[i].status == "Incomplete"){	incomplete++;	styleColor="style='color: #58595b !important;'";}
					scenarioContainer.find('tbody').append("<tr><td>"+data[i].testscenarioname+"</td><td>"+data[i].executedtime+"</td><td><img alt='Browser icon' src='imgs/"+browserIcon+"'></td><td class='openReports' data-reportid='"+data[i].reportid+"'><a class='openreportstatuss' "+styleColor+">"+data[i].status+"</a></td><td data-reportid='"+data[i].reportid+"'><img alt='Export JSON' class='exportToJSON' src='imgs/ic-export-json.png' style='margin-right: 10px; cursor: pointer;' title='Export to Json'><img alt='Pdf Icon' class='getSpecificReportBrowser openreportstatus' data-getrep='phantom-pdf' style='cursor: pointer; margin-right: 10px;' src='imgs/ic-pdf.png' title='PDF Report'><img alt='Browser Icon' class='getSpecificReportBrowser openreportstatus' data-getrep='html' style='cursor: pointer;' src='imgs/ic-reports-chrome.png' title='Browser Report'></td></tr>");
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
		
	$(document).on('click', '.openreportstatus', function(e){
		var reportID = $(this).parent().attr('data-reportid');
		var reportType = $(this).attr('data-getrep');
		var testsuitename = $(".reportboxselected").siblings(".repsuitename").text();
		var d = new Date();
		var hours = d.getHours();
	    var hours = (hours+24-2)%24; 
	    var mid='AM';
	    if(hours>12){	mid='PM';}
	    var DATE = d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear();
	    var TIME = d.getHours()+":"+d.getMinutes()+" "+mid;
	    var pass = fail = terminated = total = 0;
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
					"date": DATE,
					"time": TIME,
					"pass": "",
					"fail": "",
					"terminate": ""
				}],
				rows : []
		}		
		reportService.getReport_Nineteen68(reportID, testsuiteId,testsuitename)
		.then(function(data) {
			if(data.length > 0){
				finalReports.overallstatus[0].domainName = data[0].domainname
				finalReports.overallstatus[0].projectName = data[0].projectname
				finalReports.overallstatus[0].releaseName =	data[0].releasename
				finalReports.overallstatus[0].cycleName = data[0].cyclename
				finalReports.overallstatus[0].scenarioName = data[0].testscenarioname
				
				var obj2 = JSON.parse(data[1].reportdata);
				for(j=0; j<obj2.overallstatus.length; j++){
					finalReports.overallstatus[0].browserVersion = obj2.overallstatus[j].browserVersion
					finalReports.overallstatus[0].browserType = obj2.overallstatus[j].browserType
					finalReports.overallstatus[0].StartTime = obj2.overallstatus[j].StartTime
					finalReports.overallstatus[0].EndTime = obj2.overallstatus[j].EndTime
					finalReports.overallstatus[0].overAllStatus = obj2.overallstatus[j].overallstatus
					finalReports.overallstatus[0].EllapsedTime = obj2.overallstatus[j].EllapsedTime
				}
				for(k=0; k<obj2.rows.length; k++){
					finalReports.rows.push(obj2.rows[k]);
					if(finalReports.rows[k].hasOwnProperty("status")){
						total++;
					}
				}
				for(l=0; l<finalReports.rows.length; l++){
					finalReports.rows[l].Step = finalReports.rows[l]["Step "];
					if(finalReports.rows[l].status == "Pass"){	pass++;}
					else if(finalReports.rows[l].status == "Fail"){	fail++;}
					else if(finalReports.rows[l].status == "Terminate"){	terminated++;}
				}
				finalReports.overallstatus[0].pass = parseFloat((pass/total)*100).toFixed(2);
				finalReports.overallstatus[0].fail = parseFloat((fail/total)*100).toFixed(2);
				finalReports.overallstatus[0].terminate = parseFloat((terminated/total)*100).toFixed(2);
			}
			reportService.renderReport_ICE(finalReports, reportType)
			.then(function(data1) {
				var path = "/specificreports";
				openWindow = 0;
				if(openWindow == 0)
				{
					var myWindow = window.open(path);
					myWindow.document.write(data1);
				}
				openWindow++;
				e.stopImmediatePropagation();
			},
			function(error) {
				console.log("Error-------"+error);
			})
		},
		function(error) {
			console.log("Error-------"+error);
		})
	})
	
	
	//Export To JSON
	$(document).on('click', '.exportToJSON', function(e){
		var repId = $(this).parent().attr('data-reportid');		
		reportService.exportToJson_ICE(repId)
		.then(function(response) {
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
					if(counter == 0)
					{
						a.dispatchEvent(e);
					}
					counter++;
				}
				
			}
          
		},
		function(error) {
			//alert("Error while fetching reports! \r\n "+(error.data));
		});
	})
}]);