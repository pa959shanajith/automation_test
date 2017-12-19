var releaseName,cycleName,testSuiteName;
mySPA.controller('scheduleController',['$scope', '$rootScope', '$http','$timeout','$location','ScheduleService','cfpLoadingBar','$compile','$interval', function ($scope, $rootScope, $http, $timeout, $location, ScheduleService, cfpLoadingBar, $compile, $interval) {
	cfpLoadingBar.start();
	$("body").css("background","#eee");
	$("head").append('<link rel="stylesheet" type="text/css" href="fonts/font-awesome_mindmap/css/font-awesome.min.css" />')
	$timeout(function(){
		//$('.scrollbar-inner').scrollbar();
	    //$('.scrollbar-macosx').scrollbar();
	    document.getElementById("currentYear").innerHTML = new Date().getFullYear()
	}, 500)
    var browserTypeExe = [];
    //Task Listing
    loadUserTasks()
	blockUI("Loading...");
    /*var taskAuth;
	if(window.localStorage['_CT'] == "")
	{
		taskAuth = false;
	}*/
	if(window.localStorage['navigateScreen'] != "scheduling"){
		$rootScope.redirectPage();
	}
	
	if(window.localStorage['_CT']){
		var window_ct=JSON.parse(window.localStorage['_CT']);
		var readTestSuite = window_ct.testSuiteDetails;
		for(var rti=0;rti<readTestSuite.length;rti++){
			readTestSuite[rti].versionnumber = parseFloat(window_ct.versionnumber);
		}
		//console.log("read",readTestSuite);
	   	var getTaskName = window_ct.taskName;
		var	appType = window_ct.appType;
		//$("#page-taskName").empty().append('<span class="taskname">'+getTaskName+'</span>');
		$(".projectInfoWrap").empty()
		//testSuiteName = window_ct.testSuiteName;
	}
	
	/*$timeout(function(){
		var releaseId = JSON.parse(window.localStorage['_CT']).testSuiteDetails[0].releaseId;
		var cycleId = JSON.parse(window.localStorage['_CT']).cycleId;
		var projectId = JSON.parse(window.localStorage['_CT']).projectId;
		var	projectDetails = angular.element(document.getElementById("left-nav-section")).scope().projectDetails;
		 	releaseName = angular.element(document.getElementById("left-nav-section")).scope().releaseDetails.respnames[0];
			cycleName = angular.element(document.getElementById("left-nav-section")).scope().cycleDetails.respnames[0];
			if(projectDetails.respnames[0] !="" &&  releaseName!="" && cycleName !="")
			{
				$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">'+projectDetails.respnames[0]+'</span></p><p class="proj-info-wrap"><span class="content-label">Release :</span><span class="content">'+releaseName+'</span></p><p class="proj-info-wrap"><span class="content-label">Cycle :</span><span class="content">'+cycleName+'</span></p>')
			}
	}, 2000)*/
    var sortFlag = false;
	//Onload ServiceCall
	$timeout(function(){
		angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
	}, 1000)

	//update scheduled table every 20 seconds
	$interval(getScheduledDetails, 20000);
	
	$scope.readTestSuite_ICE = function(){
		ScheduleService.readTestSuite_ICE(readTestSuite, "schedule")
		.then(function(result) {
			if(result == "Invalid Session"){
				$rootScope.redirectPage();
			}else if(result.testSuiteDetails){
				var data = result.testSuiteDetails;
				//Populating Data in Scheduling Table
				var dataLen = Object.keys(data).length;
				$(".scheduleSuiteTable").empty();
				var keys = Object.keys(data);
				var eachData = Object.keys(data).map(function(itm) { return data[itm]; });
				for(i=0; i<dataLen; i++){
					var count=1;
					$(".scheduleSuiteTable").append('<div class="batchSuite"><div class="scheduleSuite"><input type="checkbox" class="selectScheduleSuite"/><span class="scheduleSuiteName" data-testsuiteid="'+eachData[i].testsuiteid+'" data-versionnumber="'+eachData[i].versionnumber+'">'+eachData[i].testsuitename+'</span><span class="ipContainer"><select class="form-control ipformating"><option selected disabled>Select User</option></select></span><span class="datePicContainer"><input class="form-control fc-datePicker" type="text" title="Select Date" placeholder="Select Date" value="" readonly/><img class="datepickerIcon" src="../imgs/ic-datepicker.png" /></span><span class="timePicContainer"><input class="form-control fc-timePicker" type="text" value="" title="Select Time" placeholder="Select Time" readonly disabled/><img class="timepickerIcon" src="../imgs/ic-timepicker.png" /></span></div>'
					+'<table class="scenarioSchdCon scenarioSch_'+i+'"><thead class="scenarioHeaders"><tr><td>Sl No.</td><td>Scenario Name</td><td>Data Parameterization</td><td>Condition Check</td><td>Project Name</td></tr></thead><tbody class="scenarioBody scenarioTbCon_'+i+'"></tbody></table>');

					if(result.connectedUsers != "" && result.connectedUsers.length >0){
						$(".ipformating").empty();
						$(".ipformating").append("<option selected disabled>Select User</option>")
						for(k=0; k<result.connectedUsers.length; k++){
							$(".ipformating").append("<option value='"+result.connectedUsers[k]+"'>"+result.connectedUsers[k]+"</option>")
						}
					}
					else{
						openModelPopup("Schedule Test Suite", "Please enable scheduling in Local Server. And refresh the page.");
					}
					for(j=0;j<eachData[i].scenarioids.length;j++){
						if(eachData[i].condition[j] == 0)
							$(document).find(".scenarioTbCon_"+i+"").append('<tr><td><span>'+count+'</span><input type="checkbox" class="selectToSched" disabled/></td><td data-scenarioid="'+eachData[i].scenarioids[j]+'">'+eachData[i].scenarionames[j]+'</td><td style="padding: 2px 0 2px 0;"><input type="text" value="'+eachData[i].dataparam[j]+'" disabled/></td><td><select disabled><option value="1">True</option><option value="0" selected>False</option></select></td><td>'+eachData[i].projectnames[j]+'</td></tr>');//<input type="checkbox" class="scenarioCheck"/>
						else
							$(document).find(".scenarioTbCon_"+i+"").append('<tr><td><span>'+count+'</span><input type="checkbox" class="selectToSched" disabled/></td><td data-scenarioid="'+eachData[i].scenarioids[j]+'">'+eachData[i].scenarionames[j]+'</td><td style="padding: 2px 0 2px 0;"><input type="text" value="'+eachData[i].dataparam[j]+'" disabled/></td><td><select disabled><option value="1" selected>True</option><option value="0">False</option></select></td><td>'+eachData[i].projectnames[j]+'</td></tr>');//<input type="checkbox" class="scenarioCheck"/>
						count++;
					}		
							//+'<div id="scheduleDataBody" class="scrollbar-inner scheduleDataBody"><label>'+(i+1)+'</label><input type="checkbox"/><label>scenario</label><span><input type="text" class="dataParamValue"/></span><span><select><option value="false" selected>False</option><option>True</option></select></span><label>project</label></div></div>')
				}				
				$('.scrollbar-inner').scrollbar();
				sortFlag = true;
				getScheduledDetails();
				sortFlag = false;
			}
			cfpLoadingBar.complete();
			unblockUI();
		}, 
		function(error) {
			console.log("Error")
		});
	}
	
	$(document).on("change", ".selectScheduleSuite", function(){
		if($(this).is(":checked")){
			$(this).parent().siblings(".scenarioSchdCon").find(".selectToSched").attr("disabled",false);
		}
		else
			$(this).parent().siblings(".scenarioSchdCon").find(".selectToSched").attr("disabled",true).prop("checked", false);
	})

	//Function to get scheduled details
	function getScheduledDetails(){
		ScheduleService.getScheduledDetails_ICE()
		.then(function(result) {
			console.log(result)
			if(result == "fail"){}
			else if(result && result.length > 0){
				for(var k=0; k<result.length; k++){
					result[k].browserlist = JSON.parse(result[k].browserlist);
					result[k].scenariodetails = JSON.parse(result[k].scenariodetails);
					result[k].scheduledatetime = new Date(result[k].scheduledatetime).getFullYear()+"-"
					+("0" + (new Date(result[k].scheduledatetime).getMonth()+1)).slice(-2)+"-"
					+("0" + new Date(result[k].scheduledatetime).getUTCDate()).slice(-2)+" "
					+("0" + new Date(result[k].scheduledatetime).getUTCHours()).slice(-2)+":"
					+("0" + new Date(result[k].scheduledatetime).getUTCMinutes()).slice(-2)
				}
				$scope.scheduledData = result;
				// $("#scheduledDataBody").empty();
				// for(var k=0; k<result.length; k++){
				// 	var browser = JSON.parse(result[k].browserlist);
				// 	var browImg="";
				// 	for(var a=0;a<browser.length;a++){
				// 		if(browser[a] == 1)	browImg = browImg + "<img src='imgs/ic-ch-schedule.png'/>";
				// 		else if(browser[a] == 2)	browImg = browImg + "<img src='imgs/ic-ff-schedule.png'/>";
				// 		if(browser[a] == 3)	browImg = browImg + "<img src='imgs/ic-ie-schedule.png'/>";
				// 	}
				// 	var scenarios = JSON.parse(result[k].scenariodetails);
				// 	for(var l=0; l<scenarios.length; l++){
				// 		if(result[k].schedulestatus == "scheduled"){
				// 			var $el = $("<div class='scheduleDataBodyRow'><div style='width: 20%'>"+result[k].scheduledatetime.split("T")[0]+" "+result[k].scheduledatetime.split("T")[1].split(".")[0]+"</div><div style='width: 13%'>"+result[k].clientipaddress+"</div><div style='width: 20%'>"+scenarios[l].scenarioname+"</div><div style='width: 20%'>"+result[k].testsuitename+"</div><div style='width: 15%'>"+browImg+"</div><div style='width: 12%' data-cycleid='"+result[k].cycleid+"' data-scheduleid='"+result[k].scheduleid+"' data-scheduledatetime='"+result[k].scheduledatetime.valueOf().toString()+"'>"+result[k].schedulestatus+"<img src='imgs/ic-close.png' class='cancelJob' ng-click='cancelThisJob($event)' title='Cancel Job'/></div></div>");

				// 			$("#scheduledDataBody").append($el);
				// 			$compile($el)($scope);
				// 		}
				// 		else{
				// 			$("#scheduledDataBody").append("<div class='scheduleDataBodyRow'><div style='width: 20%'>"+result[k].scheduledatetime.split("T")[0]+" "+result[k].scheduledatetime.split("T")[1].split(".")[0]+"</div><div style='width: 13%'>"+result[k].clientipaddress+"</div><div style='width: 20%'>"+scenarios[l].scenarioname+"</div><div style='width: 20%'>"+result[k].testsuitename+"</div><div style='width: 15%'>"+browImg+"</div><div style='width: 12%' data-cycleid='"+result[k].cycleid+"' data-scheduleid='"+result[k].scheduleid+"' data-scheduledatetime='"+result[k].scheduledatetime.valueOf().toString()+"'>"+result[k].schedulestatus+"</div></div>");
				// 		}
				// 	}
				// }						
				$timeout(function(){
					sortFlag == true? $(".scheduleDataHeader span:first-child").trigger("click") : 
					changeBackground();
					$("#scheduledSuitesFilterData").prop('selectedIndex', 0);
				},100)
			}
		},
		function(error) {
			console.log(error)
		});
	}

	$scope.browImg = function(brow){
		if(parseInt(brow) == 1)	return './imgs/ic-ch-schedule.png';
		else if(parseInt(brow) == 2)	return './imgs/ic-ff-schedule.png';
		else if(parseInt(brow) == 3)	return './imgs/ic-ie-schedule.png';
	}
	/*//Populating Data in Scheduling Table	
	$("#scheduleDataBody").empty()
	for(i=0; i<testSuiteData.length; i++){
		$("#scheduleDataBody").append('<div class="scheduleDataBodyRow"><div style="width: 4%" class="tabeleCellPadding"><input type="checkbox" class="d-schedule"></div><div style="width: 23%; text-align:left" class="tabeleCellPadding" data-SuiteId="'+testSuiteData[i].test_suite_id+'">'+testSuiteData[i].test_suite_name+'</div><div style="width: 17%"><input class="form-control ipformating" type="text" value=""/></div><div style="width: 20%"><input class="form-control" type="text" value=""/></div><div style="width: 25%"><span style="position: relative; display: inline-block; width:50%; margin-right:5%" title="Select Date"><input class="form-control fc-datePicker" type="text" value="" readonly/><img class="datepickerIcon" src="../imgs/ic-datepicker.png" /></span><span style="position: relative; display: inline-block; width:40%" title="Select Time"><input class="form-control fc-timePicker" type="text" value="" readonly disabled/><img class="timepickerIcon" src="../imgs/ic-timepicker.png" /></span></div><div style="width: 11%" class="tabeleCellPadding"><img src="../imgs/ic-alm.png" style="cursor:pointer" /></div></div>')
	}
	*/
	$("#tableActionButtons, .scheduleDataTable").delay(400).animate({opacity: "1"}, 300)
	
	
	//Datepicker Function
	$(document).on('focus', '.fc-datePicker', function(){
		$(this).datepicker({
			autoclose:"true",
			format:"dd-mm-yyyy",
			todayHighlight: true,
			startDate: new Date()
		}).on('hide.datepicker', function(e){
			if($(this).val().length > 0){
				$(this).parent().siblings('span').find('.fc-timePicker').prop('disabled',false).css('background-color','white');
			}
			$(this).parent().siblings('.timePicContainer').find('.fc-timePicker').timepicker({
				minTime: new Date().getHours() + ':' + (parseInt(new Date().getMinutes()+5)),
				minuteStep: 1,
				showMeridian: false
			})
		})
	})
	$(document).on('focus', '#datetimepicker1', function(){
		$(this).datetimepicker({
			minDate: moment()
		});
	})
	$(document).on('focus', '.fc-timePicker', function(){
		$(this).timepicker({
			minTime: new Date().getHours() + ':' + (parseInt(new Date().getMinutes()+5)),
			minuteStep: 1,
			showMeridian: false
			//minTime: (new Date().getHours() + ':' + ((new Date().getMinutes())+05))
		})
	})
	
	$(document).on('click', ".datepickerIcon", function(){
		$(this).siblings(".fc-datePicker").focus()
	})
	.on('click', ".timepickerIcon", function(){
		//$(".bootstrap-timepicker-hour, .bootstrap-timepicker-minute").val("");
		$(this).siblings(".fc-timePicker").focus()
	})
	//Datepicker Function
	
	//IP Address masking
	/*$(document).on('keyup', '.ipformating', function(){
		$(this).mask('0ZZ.0ZZ.0ZZ.0ZZ', {
			translation: {
		        'Z': {
		          pattern: /[0-9]/, optional: true
		         }
		    }
		});
	    $(this).mask('099.099.099.099');
	})*/
	
	//Select Browser Function
	$(document).on("click", ".selectBrowserSc", function(){
		$(this).find("img").toggleClass("sb")
	})
	//Select Browser Function
	
	//Submit Task Scheduling
	$scope.submitTaskScheduling = function(){
		$("#submitTasksdScheduling").modal("show")
		$('#submitTasksdScheduling').find('.btn-default-yes').focus();
	}
	//Submit Task Scheduling
	
	//select all scenario in testSuite
	$(document).on('click', '.slctAllScenarioSchdule', function(){
		if($(this).is(":checked")){
			$(this).parents(".scenarioHeaders").siblings("tbody.scenarioBody").find(".scenarioCheck").prop("checked",true);
		}
		else{
			$(this).parents(".scenarioHeaders").siblings("tbody.scenarioBody").find(".scenarioCheck").prop("checked",false);
		}
	})

	$(document).on('click', '.scenarioCheck', function(){
		if($(this).is(":checked")){
			if($(this).parents("tbody").children("tr").length == $(this).parents("tbody").children("tr").find(".scenarioCheck:checked").length){
				$(this).parents("tbody").siblings("thead.scenarioHeaders").find(".slctAllScenarioSchdule").prop("checked", true);
			}
			else{
				$(this).parents("tbody").siblings("thead.scenarioHeaders").find(".slctAllScenarioSchdule").prop("checked", false);
			}
		}
		else{
			$(this).parents("tbody").siblings("thead.scenarioHeaders").find(".slctAllScenarioSchdule").prop("checked", false);
		}
	})

	//Select Browser Function
	$(document).on("click", ".selectBrowserSc", function(){
		//$(this).find("img").toggleClass("sb")
		if($(this).find("img").hasClass("sb") == false) {
			var getSpliceIndex = browserTypeExe.indexOf(''+$(this).data("name")+'')
			browserTypeExe.splice(getSpliceIndex, 1)
			$(this).find("img").removeClass("sb")
		}
		else {
			$(this).find("img").addClass("sb")
			browserTypeExe.push('"'+$(this).data("name")+'"')
		}
		console.log(browserTypeExe)
	})
	//Select Browser Function

	//Filter the scheduled jobs based on status
	$("#scheduledSuitesFilterData").change(function(){
		var slctdOption = $(this).children("option:selected").val();
		if(slctdOption == "Show All"){
			$("#scheduledDataBody>.scheduleDataBodyRow .scheduleDataBodyRowChild").show();
			$("#scheduledSuitesFilterData").prop('selectedIndex', 0);
			changeBackground();
		}
		else{
			var keySlctd;
			if(slctdOption == "Completed")	keySlctd = "success";
			else if(slctdOption == "In Progress")	keySlctd = "Inprogress";
			else if(slctdOption == "Terminated")	keySlctd = "Terminate";
			else if(slctdOption == "Failed 00")	keySlctd = "Failed 00";
			else if(slctdOption == "Failed 01")	keySlctd = "Failed 01";
			else if(slctdOption == "Failed 02")	keySlctd = "Failed 02";
			else if(slctdOption == "Cancelled")	keySlctd = "cancelled";
			else if(slctdOption == "Scheduled")	keySlctd = "scheduled";
			var content = $("#scheduledDataBody>.scheduleDataBodyRow .scheduleDataBodyRowChild");
			$.each(content, function(){
				if($(this).children("div:nth-child(6)").text().indexOf(keySlctd) >= 0){
					$(this).show();
				}
				else if($(this).children("div:nth-child(6)").text() != keySlctd){
					$(this).hide();
				}				 
				else $(this).show();
			})
			changeBackground();
		}
	})

	
	function changeBackground(){
		var oddColorify = $(".scheduleDataBodyRowChild:visible");
		oddColorify.css("background","white");
		var l=0;
		while(l < oddColorify.length){
			oddColorify[l].style.background = "#e8e6fe";
			l = l+2;
		}
	}
	//Add to list and schedule
	$scope.initSchedule = function(){
		var moduleInfo = [];
		var doNotSchedule = false;
		if(appType != "SAP" && browserTypeExe.length == 0)	openModelPopup("Schedule Test Suite", "Please select a browser");
		else if($(".selectScheduleSuite:checked").length == 0) openModelPopup("Schedule Test Suite", "Please select atleast one Suite(s) to schedule");
		else{
			if(appType == "SAP") browserTypeExe = ["1"];
			$.each($(".batchSuite"), function(){
				var suiteInfo = {};
				var selectedScenarioData = [];
				if($(this).find(".selectScheduleSuite").is(":checked")){
					var sldate = $(this).children('.scheduleSuite').find(".datePicContainer .fc-datePicker").val();
					var sltime = $(this).children('.scheduleSuite').find(".timePicContainer .fc-timePicker").val();
					var sldate_2 = sldate.split("-");
					var sltime_2 = sltime.split(":");
					var dt = new Date();
					suiteInfo.versionnumber = $(this).children('.scheduleSuite').find(".scheduleSuiteName").data("versionnumber");
					if($(this).children('.scheduleSuite').find(".ipContainer .ipformating").children("option:selected").val() != "Select User")
						suiteInfo.Ip = $(this).children('.scheduleSuite').find(".ipContainer .ipformating").children("option:selected").val();
					else{
						$(this).children('.scheduleSuite').find(".ipContainer .ipformating").prop("style","border: 2px solid red;"); 
						doNotSchedule = true;
						return false;
					}
					if(sldate)
						suiteInfo.date = $(this).children('.scheduleSuite').find(".datePicContainer .fc-datePicker").val();
					else{
						$(this).children('.scheduleSuite').find(".datePicContainer .fc-datePicker").prop("style","border: 2px solid red;");
						doNotSchedule = true;
						return false;
					}
					if(new Date(sldate_2[2],(sldate_2[1]-1),sldate_2[0],sltime_2[0],sltime_2[1]) < new Date()){
						$(this).children('.scheduleSuite').find(".timePicContainer .fc-timePicker").prop("style","border: 2px solid red;");
						openModelPopup("Schedule Test Suite", "Schedule time must be 5 mins more than current time.");
						doNotSchedule = true;
						return false;
					}
					else if((new Date(sldate_2[2],(sldate_2[1]-1),sldate_2[0],sltime_2[0],sltime_2[1]) > new Date()) && (parseInt(sltime_2[0]) == new Date().getHours()) && (parseInt(sltime_2[1]) <= new Date().getMinutes()+5)){
						$(this).children('.scheduleSuite').find(".timePicContainer .fc-timePicker").prop("style","border: 2px solid red;");
						openModelPopup("Schedule Test Suite", "Schedule time must be 5 mins more than current time.");
						doNotSchedule = true;
						return false;
					}
					else{
						if(sltime)
							suiteInfo.time = $(this).children('.scheduleSuite').find(".timePicContainer .fc-timePicker").val();
						else{
							$(this).children('.scheduleSuite').find(".timePicContainer .fc-timePicker").prop("style","border: 2px solid red;");
							doNotSchedule = true;
							return false;
						}
					}
					var chkExistDT = $(".scheduleDataBodyRowChild");
					for(i=0;i<chkExistDT.length;i++){
						var cEd = chkExistDT[i].children[0].innerText.split(" ")[0];
						var cEt = chkExistDT[i].children[0].innerText.split(" ")[1];
						var cEDd = cEd.split("-");
						var cETt = cEt.split(":");
						//if(chkExistDT[i].children[0].innerText == (sldate_2[2]+"-"+sldate_2[1]+"-"+sldate_2[0]+" "+sltime) && chkExistDT[i].children[5].innerText.trim() == "scheduled" && chkExistDT[i].children[1].innerText.trim() == suiteInfo.Ip){
						if(new Date(cEDd[0], cEDd[1]-1, cEDd[2], cETt[0], cETt[1]).toString() == new Date(sldate_2[2],sldate_2[1]-1,sldate_2[0],sltime_2[0],sltime_2[1]).toString() && chkExistDT[i].children[5].innerText.trim() == "scheduled" && chkExistDT[i].children[1].innerText.trim() == suiteInfo.Ip){
							doNotSchedule = true;
							openModelPopup("Schedule Test Suite", "Selected host already scheduled for given time.");
							break;
						}
					}
					if(doNotSchedule == false){					
						$(this).find(".scenarioSchdCon tbody tr").each(function(){
							if($(this).find(".selectToSched").is(":checked")){
								selectedScenarioData.push({
									condition : parseInt($(this).children("td:nth-child(4)").find("select option:selected").val()),
									dataparam : [$(this).children("td:nth-child(3)").find("input").val()],
									executestatus : 1,
									scenarioids : $(this).children("td:nth-child(2)").data("scenarioid"),
									scenarioname: $(this).children("td:nth-child(2)").text(),
									appType: window_ct.appType
								})
							}
						})
						suiteInfo.suiteDetails = selectedScenarioData;
						suiteInfo.testsuitename = $(this).children('.scheduleSuite').find(".scheduleSuiteName").text();
						suiteInfo.testsuiteid = $(this).children('.scheduleSuite').find(".scheduleSuiteName").data("testsuiteid");
						suiteInfo.browserType = browserTypeExe;
						suiteInfo.reschedule = false;
						suiteInfo.scheduleid = "";
						suiteInfo.userInfo = JSON.parse(window.localStorage['_UI'])
						var scenarioDetails = JSON.parse(window.localStorage["_CT"]).testSuiteDetails;
						for(var i=0; i<scenarioDetails.length;i++){
							if(scenarioDetails[i].testsuiteid == suiteInfo.testsuiteid){
								suiteInfo.cycleid = scenarioDetails[i].cycleid;
								break;
							}
						}
						moduleInfo.push(suiteInfo);
					}
				}
			})
			if(doNotSchedule == false){		
				for(var i=0; i<moduleInfo.length; i++){
					for(var j=0; j<moduleInfo.length; j++){
						if(moduleInfo[i].Ip == moduleInfo[j].Ip && i!=j){
							if(moduleInfo[i].date == moduleInfo[j].date){
								if(moduleInfo[i].time == moduleInfo[j].time){
									doNotSchedule = true;
									openModelPopup("Schedule Test Suite", "Time's are matching for testsuite's containing following IP: "+moduleInfo[i].Ip+"");
								}
							}
						}
					}
				}
				if(doNotSchedule == false){
					var counter=0;
					for(var i=0; i<moduleInfo.length; i++){
						var dat = moduleInfo[i].date.split("-");
						var details = {
							"clientipaddress": moduleInfo[i].Ip,
							"curDate": dat[2]+"-"+dat[1]+"-"+dat[0]+" "+moduleInfo[i].time+":00+0000",
						}
						//var curDate = new Date(Date.UTC(sldate_2[2],sldate_2[1]-1,sldate_2[0],sltime_2[0],sltime_2[1],0));
						var chktype = "checkexist"
						ScheduleService.testSuitesScheduler_ICE(chktype,details)
						.then(function(data){
							counter++;
							if(data == "fail"){
								doNotSchedule = true;
							}
							else if(data.length > 0){
								doNotSchedule = true;
								openModelPopup("Schedule Test Suite", "Selected host already scheduled for given time.");
							}
							else if(data.length == 0){
								if(moduleInfo.length == counter){
									proceedScheduling();
								}
							}
						},
						function(error){
							console.log(error);
						})
					}									
				}
			}
			function proceedScheduling(){
				if(doNotSchedule == false){
					var chktype = "schedule"
					ScheduleService.testSuitesScheduler_ICE(chktype,moduleInfo)
					.then(function(data){
						if(data == "success"){
							openModelPopup("Schedule Test Suite", "Successfully scheduled.");
							$(".selectScheduleSuite, .selectToSched").prop("checked", false);
							$(".selectBrowserSc").find(".sb").removeClass("sb");
							$(".ipformating, .fc-datePicker, .fc-timePicker").prop("style","border: none;").val("");
							getScheduledDetails();
						}
						else if(data == "few"){
							openModelPopup("Schedule Test Suite", "Few suites are failed to schedule");
							$(".selectScheduleSuite").prop("checked", false);
							$(".ipformating, .fc-datePicker, .fc-timePicker").prop("style","border: none;").val("");
						}
						else{
							openModelPopup("Schedule Test Suite", "Failed to schedule Testsuite.");
							$(".ipformating, .fc-datePicker, .fc-timePicker").prop("style","border: none;")
						}
						$(".fc-timePicker").focus()
					},
					function(error){
						console.log(error);
					})
					$("#scheduledDataBody>.scheduleDataBodyRow .scheduleDataBodyRowChild").show();
					$("#scheduledSuitesFilterData").prop('selectedIndex', 0);
					changeBackground();
				}
			}
		}		
	}

	//Cancel scheduled jobs
	$scope.cancelThisJob = function($event,status){
		var suiteDetailsObj = $event.currentTarget.parentElement.dataset;
		var host = $event.currentTarget.parentElement.parentElement.children[1].innerText;
		var schedUserid = $event.currentTarget.parentElement.parentElement.children[1].dataset.userid;
		ScheduleService.cancelScheduledJob_ICE(suiteDetailsObj,status,host,schedUserid)
		.then(function(data){
			if(data == "success"){
				openModelPopup("Scheduled Test Suite", "Job is "+status+".");
				$event.target.parentElement.textContent = status;
				var tabEle = $(".scheduleDataBodyRowChild");
				for(var i=0; i<tabEle.length; i++){
					if(tabEle[i].children[5].dataset.scheduleid == suiteDetailsObj.scheduleid){
						tabEle[i].children[5].innerText = status;
					}
				}
				getScheduledDetails();
			}
			else if(data == "inprogress"){
				openModelPopup("Scheduled Test Suite", "Job is in progress.. cannot be cancelled.");
			}
			else if(data == "not authorised"){
				openModelPopup("Scheduled Test Suite", "You are not authorized to cancel this job.");
			}
			else{
				openModelPopup("Scheduled Test Suite", "Failed to cancel Job");
			}
		})
	}
}]);
function openModelPopup(title, body){
	$("#scheduleGlobalModal").find('.modal-title').text(title);
    $("#scheduleGlobalModal").find('.modal-body p').text(body).css('color','black');
	$("#scheduleGlobalModal").modal("show");
	setTimeout(function(){
		$("#scheduleGlobalModal").find('.btn-accept').focus();
	}, 300);
}