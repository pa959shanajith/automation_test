
mySPA.controller('reportsController', ['$scope', '$http', '$location', '$timeout','$window', 'reportService','cfpLoadingBar', function($scope,$http,$location,$timeout,$window,reportService, cfpLoadingBar) {
	$("body").css("background","#eee");
	$("head").append('<link id="mindmapCSS2" rel="stylesheet" type="text/css" href="fonts/font-awesome_mindmap/css/font-awesome.min.css" />')
	var getUserInfo = JSON.parse(window.localStorage['_UI']);
	var userID = getUserInfo.user_id;
	var open = 0;	var openWindow = 0;
	var counter = 0;
	var executionId, testsuiteId;
	$("#page-taskName").empty().append('<span>Reports</span>')
	cfpLoadingBar.start()
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
					cfpLoadingBar.complete();
					$("#middle-content-section").css('visibility','visible');
					$('[data-toggle="tooltip"]').tooltip();
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
				}
				if(data.length > 2){
					$("#dateDESC").show();
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
	
	//Date sorting
    $(document).on('click', '#dateDESC', function(){
    	$(this).hide();
    	$('#dateASC').show();
    	var dateArray = $('tbody.scrollbar-inner-scenariostatus').children('.scenariostatusreport');
    	dateDESC(dateArray);
    	$("tbody.scrollbar-inner-scenariostatus").empty();
    	for(i=0; i<dateArray.length; i++){
    		dateArray[i].firstChild.innerHTML = i+1;
			$("tbody.scrollbar-inner-scenariostatus").append(dateArray[i]);
		}
    })
    $(document).on('click', '#dateASC', function(){
    	$(this).hide();
    	$('#dateDESC').show();
    	var dateArray = $('tbody.scrollbar-inner-scenariostatus').children('.scenariostatusreport');
    	dateASC(dateArray);
    	$("tbody.scrollbar-inner-scenariostatus").empty();
    	for(i=0; i<dateArray.length; i++){
    		dateArray[i].firstChild.innerHTML = i+1;
			$("tbody.scrollbar-inner-scenariostatus").append(dateArray[i]);
		}
    })
    
    function dateDESC(dateArray){
    	dateArray.sort(function(a,b){
    		var aA = a.children.item(1).innerHTML;
    		var bB = b.children.item(1).innerHTML;
    		var fDate = aA.split("-"); var lDate = bB.split("-");
    		//var fFDate = fDate[0].split("/"); var lLDate = lDate[0].split("/");
    		var gDate = fDate[1]+"-"+fDate[0]+"-"+fDate[2]//+" "+a.children.item(2).innerHTML;
    		var mDate = lDate[1]+"-"+lDate[0]+"-"+lDate[2]//+" "+b.children.item(2).innerHTML;
    		if ( new Date(gDate) < new Date(mDate) )  return -1;
    	    if ( new Date(gDate) > new Date(mDate) )  return 1;
    	    return dateArray;
    	})
	}
    
    function dateASC(dateArray){
    	dateArray.sort(function(a,b){
    		var aA = a.children.item(1).innerHTML//.replace("&nbsp;&nbsp;&nbsp;&nbsp;"," ");
    		var bB = b.children.item(1).innerHTML//.replace("&nbsp;&nbsp;&nbsp;&nbsp;"," ");
    		var fDate = aA.split("-"); var lDate = bB.split("-");
    		//var fFDate = fDate[0].split("/"); var lLDate = lDate[0].split("/");
    		var gDate = fDate[1]+"-"+fDate[0]+"-"+fDate[2]//+" "+a.children.item(2).innerHTML;
    		var mDate = lDate[1]+"-"+lDate[0]+"-"+lDate[2]//+" "+b.children.item(2).innerHTML;
    		if ( new Date(gDate) > new Date(mDate) )  return -1;
    	    if ( new Date(gDate) < new Date(mDate) )  return 1;
    	    return dateArray;
    	})
	}
    //Date sorting
	//Service call to get scenario status
	$(document).on('click', '.scenariostatusreport', function(){
		$(this).addClass('scenariostatusreportselect');
		$(this).siblings().removeClass('scenariostatusreportselect');
		executionId = $(this).attr('data-executionid');
		$('.formatpdfbrwsrexport').remove();
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
					scenarioContainer.find('tbody').append("<tr><td>"+data[i].testscenarioname+"</td><td>"+data[i].executedtime+"</td><td><img alt='Browser icon' src='imgs/"+browserIcon+"'></td><td class='openReports' data-reportid='"+data[i].reportid+"'><a class='openreportstatuss' "+styleColor+">"+data[i].status+"</a></td><td data-reportid='"+data[i].reportid+"'><img alt='Select format' class='selectFormat' src='imgs/ic-export-json.png' style='cursor: pointer;' title='Select format'></td></tr>");
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
	
	$(document).on('click', '.selectFormat', function(){
		$('.formatpdfbrwsrexport').remove();
		var repID = $(this).parent().attr("data-reportid");
		$(this).parent().append("<span class='formatpdfbrwsrexport'><img alt='Pdf Icon' class='getSpecificReportBrowser openreportstatus' data-getrep='phantom-pdf' data-reportid='"+repID+"' style='cursor: pointer; margin-right: 10px;' src='imgs/ic-pdf.png' title='PDF Report'><img alt='Browser Icon' class='getSpecificReportBrowser openreportstatus' data-getrep='html' data-reportid='"+repID+"' style='cursor: pointer; margin-right: 10px;' src='imgs/ic-reports-chrome.png' title='Browser Report'><img alt='Export JSON' class='exportToJSON' data-reportid='"+repID+"' style='cursor: pointer;' src='imgs/ic-export-to-json.png' title='Export to Json'></span>")
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
		var reportID = $(this).attr('data-reportid');
		var reportType = $(this).attr('data-getrep');
		var testsuitename = $(".reportboxselected").text();
		var d = new Date();		
	    //var DATE = ("0" + (d.getMonth()+1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/" + d.getFullYear();
	    //var TIME = ("0" + d.getHours()).slice(-2) +":"+ ("0" + d.getMinutes()).slice(-2) +":"+ ("0" + d.getSeconds()).slice(-2);
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
					"date": "",
					"time": "",
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
				var elapTym;
				for(j=0; j<obj2.overallstatus.length; j++){
					finalReports.overallstatus[0].browserVersion = obj2.overallstatus[j].browserVersion;
					finalReports.overallstatus[0].browserType = obj2.overallstatus[j].browserType;
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
					if(finalReports.rows[k]["Step "] != undefined && finalReports.rows[k]["Step "].indexOf("Step") !== -1){
						finalReports.rows[k].Step = finalReports.rows[k]["Step "];						
					}
					if(finalReports.rows[k].hasOwnProperty("EllapsedTime") && finalReports.rows[k].EllapsedTime.trim() != ""){
						elapTym = (finalReports.rows[k].EllapsedTime.split(".")[0]).split(":")
						if(finalReports.rows[k].EllapsedTime.split(".")[1] == undefined || finalReports.rows[k].EllapsedTime.split(".")[1] == ""){
							finalReports.rows[k].EllapsedTime = ("0" + elapTym[0]).slice(-2) +":"+ ("0" + elapTym[1]).slice(-2) +":"+ ("0" + elapTym[2]).slice(-2);
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
					var myWindow = window.open();
					myWindow.document.write(data1);
					//myWindow.location.hash = path;
				}
				openWindow++;
				e.stopImmediatePropagation();
				$('.formatpdfbrwsrexport').remove();
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
		var repId = $(this).attr('data-reportid');		
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
		$('.formatpdfbrwsrexport').remove();
	})
}]);