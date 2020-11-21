var releaseName, cycleName, testSuiteName;
var triggeredSeconds = 0;
mySPA.controller('scheduleController', ['$scope', '$rootScope', '$http', '$timeout', '$location', 'ScheduleService', 'cfpLoadingBar', '$compile', '$interval', function ($scope, $rootScope, $http, $timeout, $location, ScheduleService, cfpLoadingBar, $compile, $interval) {
	cfpLoadingBar.start();
	$("body").css("background", "#eee");
	$timeout(function () {
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
	}, 500);
	var browserTypeExe = [];
	var execAction = "serial";
	var execEnv = "default";
	//Task Listing
	loadUserTasks()
	blockUI("Loading...");

	if (window.localStorage['navigateScreen'] != "scheduling") return $rootScope.redirectPage();
	$('.submitTaskBtn').hide();
	if (window.localStorage['_CT']) {
		var window_ct = JSON.parse(window.localStorage['_CT']);
		var readTestSuite = window_ct.testSuiteDetails;
		var versionnumber = parseFloat(window_ct.versionnumber);
		for (var rti = 0; rti < readTestSuite.length; rti++) readTestSuite[rti].versionnumber = versionnumber;
		var appType = window_ct.appType;
		$(".projectInfoWrap").empty()
		$scope.getScreenView = window_ct.appType;
	}
	var sortFlag = false;
	//Onload ServiceCall
	$timeout(function () {
		angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
		$('.scrollbar-macosx').scrollbar();
	}, 1000)

	//update scheduled table every 60 seconds
	$interval(getScheduledDetailsInterval, 60000);

	$scope.readTestSuite_ICE = function () {
		ScheduleService.readTestSuite_ICE(readTestSuite, "schedule")
			.then(function (result) {
				if (result == "Invalid Session") {
					return $rootScope.redirectPage();
				} else if (result.testSuiteDetails) {
					var data = result.testSuiteDetails;
					//Populating Data in Scheduling Table
					var dataLen = Object.keys(data).length;
					$(".scheduleSuiteTable").empty();
					var eachData = Object.keys(data).map(function (itm) { return data[itm]; });
					for (i = 0; i < dataLen; i++) {
						$(".scheduleSuiteTable").append('<div class="batchSuite"><div class="scheduleSuite"><input type="checkbox" class="selectScheduleSuite"/>'
							+ '<span class="scheduleSuiteName" data-testsuiteid="' + eachData[i].testsuiteid + '" data-moduleid="' + eachData[i].moduleid + '" data-versionnumber="' + eachData[i].versionnumber + '">' + eachData[i].testsuitename + '</span>'
							+ '<span class="ipContainer"><select id="mod' + i + '" onchange="openPopup(id)"" class="form-control ipformating"><option selected disabled>Select User</option></select></span>'
							+ '<span class="datePicContainer"><input class="form-control fc-datePicker" type="text" title="Select Date" placeholder="Select Date" value="" readonly/><img class="datepickerIcon" src="../imgs/ic-datepicker.png" /></span>'
							+ '<span class="timePicContainer"><input class="form-control fc-timePicker" type="text" value="" class="cursor:not-allowed" title="Select Time" placeholder="Select Time" readonly disabled/><img class="timepickerIcon" src="../imgs/ic-timepicker.png" /></span></div>'
							+ '<table class="scenarioSchdCon scenarioSch_' + i + '"><thead class="scenarioHeaders"><tr><td>Sl No.</td><td>Scenario Name</td><td>Data Parameterization</td><td>Condition Check</td><td>Project Name</td></tr></thead>'
							+ '<tbody class="scenarioBody scenarioTbCon_' + i + '"></tbody></table>');
						for (j = 0; j < eachData[i].scenarioids.length; j++) {
							const flag = eachData[i].condition[j] == 0;
							$(document).find(".scenarioTbCon_" + i + "").append('<tr><td><span>' + (j + 1) + '</span><input type="checkbox" class="selectToSched"/></td>'
								+ '<td data-scenarioid="' + eachData[i].scenarioids[j] + '">' + eachData[i].scenarionames[j] + '</td>'
								+ '<td style="padding: 2px 0 2px 0;"><input type="text" value="' + eachData[i].dataparam[j] + '" disabled/></td>'
								+ '<td><select disabled><option value="1" ' + ((flag) ? '' : 'selected') + '>True</option><option value="0" ' + ((flag) ? 'selected' : '') + '>False</option></select></td>'
								+ '<td>' + eachData[i].projectnames[j] + '</td></tr>');
						}
						if (result.connectedUsers.length == 0) openModelPopup("Schedule Test Suite", "Please enable scheduling in Local Server. And refresh the page.");
						else {
							$(".ipformating").empty();
							$(".ipformating").append("<option value=' ' selected disabled>Select User</option>")
							for (k = 0; k < result.connectedUsers.length; k++) {
								$(".ipformating").append("<option value='" + result.connectedUsers[k] + "'>" + result.connectedUsers[k] + "</option>")
							}
							$(".ipformating").append("<option hidden value='Module Smart Scheduling'>Module Smart Scheduling</option>")
							$(".ipformating").append("<option hidden value='Scenario Smart Scheduling'>Scenario Smart Scheduling</option>")

						}
					}
					$(".fc-timePicker").timepicker({
						//minTime: new Date().getHours() + ':' + (parseInt(new Date().getMinutes() + 5)),
						minuteStep: 1,
						showMeridian: false
					});
					$(".fc-timePicker").timepicker('clear');
					$(".fc-datePicker").datepicker({
						autoclose: "true",
						format: "dd-mm-yyyy",
						todayHighlight: true,
						startDate: new Date()
					}).on('hide.datepicker', function (e) {
						var timepicker =  $(".fc-timePicker");
						if ($(this).val().length > 0) {
							const selDate = $(this).datepicker('getDate');
							const timeNow = new Date();
							if (selDate.toDateString() == timeNow.toDateString()) {
								let timeset = timepicker.val();
								if (timeset != "") timeset = new Date().setHours(timeset.split(":")[0],timeset.split(":")[1],0,0);
								if (timeset != "" && (timeNow.getTime() - timeset) > 0) {
									timeNow.setMinutes(timeNow.getMinutes()+6);
									const timeToSet = timeNow.getHours() + ":" + timeNow.getMinutes();
									timepicker.timepicker('setTime', timeToSet);
								}
							}
							timepicker.prop('disabled', false).css({ 'cursor': 'pointer', 'background-color': 'white' }).focus();
						} else {
							timepicker.prop('disabled', true).css('cursor', 'not-allowed');
						}
					});
					$('.scrollbar-inner').scrollbar();
					sortFlag = true;
					getScheduledDetails();
					sortFlag = false;
				}
				cfpLoadingBar.complete();
				unblockUI();
			},
			function (error) {
				console.log("Error:", error);
			}
		);
	}

	//Datepicker Function
	$(document).on('focus', '.fc-datePicker', function () {
		$(this).datepicker('show');
	}).on('focus', '.fc-timePicker', function () {
		$(this).timepicker('showWidget');
	});

	$(document).on('click', ".datepickerIcon", function () {
		$(this).siblings(".fc-datePicker").focus()
	}).on('click', ".timepickerIcon", function () {
		$(this).siblings(".fc-timePicker").focus()
	})
	//Datepicker Function

	$(document).on("change", ".selectScheduleSuite", function () {
		if ($(this).is(":checked")) $(this).parent().siblings(".scenarioSchdCon").find(".selectToSched").attr("disabled", false).prop("checked", true);
		else $(this).parent().siblings(".scenarioSchdCon").find(".selectToSched").prop("checked", false);
	})

	$(document).on("change", '.selectToSched', function () {
		const selectedCount = $(this).parents(".scenarioBody").children("tr").find(".selectToSched:checked").length;
		const flag = (selectedCount == 0) ? false : true;
		$(this).parents(".scenarioSchdCon").siblings(".scheduleSuite").find(".selectScheduleSuite").prop("checked", flag);
	});

	//Function to get scheduled details on interval
	function getScheduledDetailsInterval() {
		if (Math.round(new Date() / 1000) - triggeredSeconds >= 20) {
			getScheduledDetails();
		}
	}

	//Function to get scheduled details
	function getScheduledDetails() {
		ScheduleService.getScheduledDetails_ICE()
			.then(function (result) {
				if (result && result.length > 0 && result != "fail") {
					for (var k = 0; k < result.length; k++) {
						if (result[k].scenariodetails[0].scenarioids !== undefined) result[k].scenariodetails = [result[k].scenariodetails];
						result[k].browserlist = result[k].executeon;
						const dt = new Date(result[k].scheduledon);
						result[k].scheduledatetime = dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-"
							+ ("0" + dt.getDate()).slice(-2) + " " + ("0" + dt.getHours()).slice(-2) + ":" + ("0" + dt.getMinutes()).slice(-2);
					}
					$scope.scheduledData = result;
					$timeout(function () {
						sortFlag == true ? $(".scheduleDataHeader span:first-child").trigger("click") :
							changeBackground();
						$("#scheduledSuitesFilterData").prop('selectedIndex', 0);
						triggeredSeconds = Math.round(new Date() / 1000);
					}, 100)
				}
			},
				function (error) {
					console.log(error)
				});
	}

	$scope.browImg = function (brow, appType) {
		if (appType == "Web") {
			if (parseInt(brow) == 1) return './imgs/ic-ch-schedule.png';
			else if (parseInt(brow) == 2) return './imgs/ic-ff-schedule.png';
			else if (parseInt(brow) == 3) return './imgs/ic-ie-schedule.png';
			else if (parseInt(brow) == 7) return './imgs/ic-legacy-schedule.png';
			else if (parseInt(brow) == 8) return './imgs/ic-chromium-schedule.png';
		}
		else if (appType == "Webservice") return './imgs/webservice.png';
		else if (appType == "MobileApp") return './imgs/mobileApps.png';
		else if (appType == "System") return './imgs/desktop.png';
		else if (appType == "Desktop") return './imgs/desktop.png';
		else if (appType == "SAP") return './imgs/sapApps.png';
		else if (appType == "Mainframe") return './imgs/mainframe.png';
		else if (appType == "OEBS") return './imgs/oracleApps.png';
		else if (appType == "MobileWeb") return './imgs/MobileWeb.png';
	}

	$("#tableActionButtons, .scheduleDataTable").delay(400).animate({ opacity: "1" }, 300)

	//Select Browser Function
	$(document).on("click", ".selectBrowserSc", function () {
		$(this).find("img").toggleClass("sb")
		$(this).find("svg").toggleClass("sb")
	})
	//Select Browser Function

	//Submit Task Scheduling
	$scope.submitTaskScheduling = function () {
		$("#submitTasksdScheduling").modal("show")
		$('#submitTasksdScheduling').find('.btn-default-yes').focus();
	}
	//Submit Task Scheduling

	//select all scenario in testSuite
	$(document).on('click', '.slctAllScenarioSchdule', function () {
		$(this).parents(".scenarioHeaders").siblings("tbody.scenarioBody").find(".scenarioCheck").prop("checked", $(this).is(":checked"));
	})

	$(document).on('click', '.scenarioCheck', function () {
		const tr = $(this).parents("tbody").children("tr");
		const flag = ($(this).is(":checked") && (tr.length == tr.find(".scenarioCheck:checked").length)) ? true : false;
		$(this).parents("tbody").siblings("thead.scenarioHeaders").find(".slctAllScenarioSchdule").prop("checked", flag);
	})

	//Select Browser Function
	$(document).on("click", ".selectBrowserSc", function(){
		if($(this).find("img").hasClass("sb") == false && $(this).find("svg").hasClass("sb") == false) {
			browserTypeExe.splice(browserTypeExe.indexOf(''+$(this).data("name")), 1);
			$(this).find("img").removeClass("sb");
			$(this).find("svg").removeClass("sb");
		} else {
			$(this).find("img").addClass("sb");
			$(this).find("svg").addClass("sb");
			browserTypeExe.push(''+$(this).data("name"));
		}
	})
	//Select Browser Function

	//Filter the scheduled jobs based on status
	$("#scheduledSuitesFilterData").change(function () {
		var slctdOption = $(this).children("option:selected").val();
		if (slctdOption == "Show All") {
			$("#scheduledDataBody>.scheduleDataBodyRow .scheduleDataBodyRowChild").show();
			$("#scheduledSuitesFilterData").prop('selectedIndex', 0);
			changeBackground();
		} else {
			var keySlctd;
			if (slctdOption == "Completed") keySlctd = "Completed";
			else if (slctdOption == "In Progress") keySlctd = "Inprogress";
			else if (slctdOption == "Terminated") keySlctd = "Terminate";
			else if (slctdOption == "Skipped") keySlctd = "Skipped";
			else if (slctdOption == "Missed") keySlctd = "Missed";
			else if (slctdOption == "Failed") keySlctd = "Failed";
			else if (slctdOption == "Cancelled") keySlctd = "cancelled";
			else if (slctdOption == "Scheduled") keySlctd = "scheduled";
			var content = $("#scheduledDataBody>.scheduleDataBodyRow .scheduleDataBodyRowChild");
			$.each(content, function () {
				if ($(this).children("div:nth-child(6)").text().indexOf(keySlctd) >= 0) $(this).show();
				else if ($(this).children("div:nth-child(6)").text() != keySlctd) $(this).hide();
				else $(this).show();
			})
			changeBackground();
		}
	})

	function changeBackground() {
		var oddColorify = $(".scheduleDataBodyRowChild:visible");
		oddColorify.css("background", "white");
		var l = 0;
		while (l < oddColorify.length) {
			oddColorify[l].style.background = "#e8e6fe";
			l = l + 2;
		}
	}

	//select Saucelabs execution
	$(document).on("click", ".selectSaucelabs", function () {
		$(this).find("img").toggleClass("sb");
		$(this).find("svg").toggleClass("sb");
		if ($("img").hasClass('sb') == true || $("svg").hasClass('sb') == true) {
			execEnv = "Saucelabs";
		} else {
			execEnv = "default";
		}
	});

	//Add to list and schedule
	$scope.initSchedule = function ($event) {
		if (smartBatch) {
			sequence(true,false,copyId);
		}
		if ($(".selectScheduleSuite:checked").length == 0) openModelPopup("Schedule Test Suite", "Please select atleast one Suite(s) to schedule");
		else if ($('.selectToSched:checked').length == 0) openModelPopup("Schedule Test Suite", "Please select atleast one scenario to schedule");
		else if (appType == "SAP" && browserTypeExe.length == 0) openModelPopup("Schedule Test Suite", "Please select SAP Apps option");
		else if (appType == "MobileApp" && browserTypeExe.length == 0) openModelPopup("Schedule Test Suite", "Please select Mobile Apps option");
		else if (appType == "MobileWeb" && browserTypeExe.length == 0) openModelPopup("Schedule Test Suite", "Please select Mobile Web option");
		else if (appType == "Desktop" && browserTypeExe.length == 0) openModelPopup("Schedule Test Suite", "Please select Desktop Apps option");
		else if (appType == "Web" && browserTypeExe.length == 0) openModelPopup("Schedule Test Suite", "Please select a browser");
		else if (appType == "Webservice" && browserTypeExe.length == 0) openModelPopup("Schedule Test Suite", "Please select Web Services option");
		else if (appType == "Mainframe" && browserTypeExe.length === 0) openModelPopup("Schedule Test Suite", "Please select Mainframe option");
		else if (appType == "OEBS" && browserTypeExe.length === 0) openModelPopup("Schedule Test Suite", "Please select OEBS Apps option");
		else if (browserTypeExe.length === 0) openModelPopup("Schedule Test Suite", "Please select " + appType + " option");
		else if ((appType == "Web") && browserTypeExe.length == 1 && execAction == "parallel") openModelPopup("Schedule Test Suite", "Please select multiple browsers");
		else {
			if (appType == "SAP") browserTypeExe = ["1"];
			var doNotSchedule = false;
			const moduleInfo = [];
			$.each($(".batchSuite"), function () {
				const suiteInfo = {};
				const selectedScenarioData = [];
				if ($(this).find(".selectScheduleSuite").is(":checked")) {
					suiteInfo.date = $(this).children('.scheduleSuite').find(".datePicContainer .fc-datePicker").val();
					suiteInfo.time = $(this).children('.scheduleSuite').find(".timePicContainer .fc-timePicker").val();
					suiteInfo.targetUser = $(this).children('.scheduleSuite').find(".ipContainer .ipformating").children("option:selected").val()
					if (suiteInfo.targetUser == "Select User" || suiteInfo.targetUser.trim() == '') {  // Check if any user is selected for scheduling
						$(this).children('.scheduleSuite').find(".ipContainer .ipformating").prop("style", "border: 2px solid red;");
						doNotSchedule = true;
						return false;
					}
					if (!suiteInfo.date) {  // Check if schedule date is not empty
						$(this).children('.scheduleSuite').find(".datePicContainer .fc-datePicker").prop("style", "border: 2px solid red;");
						doNotSchedule = true;
						return false;
					}
					if (!suiteInfo.time) {  // Check if schedule time is not empty
						$(this).children('.scheduleSuite').find(".timePicContainer .fc-timePicker").prop("style", "border: 2px solid red;");
						doNotSchedule = true;
						return false;
					}
					const sldate_2 = suiteInfo.date.split("-");
					const sltime_2 = suiteInfo.time.split(":");
					const timestamp = new Date(sldate_2[2], (sldate_2[1] - 1), sldate_2[0], sltime_2[0], sltime_2[1]);
					const diff = (timestamp - new Date()) / 60000;
					if (diff < 5) {  // Check if schedule time is not ahead of 5 minutes from current time
						if (diff < 0) $(this).children('.scheduleSuite').find(".datePicContainer .fc-datePicker").prop("style", "border: 2px solid red;");
						$(this).children('.scheduleSuite').find(".timePicContainer .fc-timePicker").prop("style", "border: 2px solid red;");
						openModelPopup("Schedule Test Suite", "Schedule time must be 5 mins more than current time.");
						doNotSchedule = true;
						return false;
					}
					if (doNotSchedule) return false;
					$(this).find(".scenarioSchdCon tbody tr").each(function () {
						if ($(this).find(".selectToSched").is(":checked")) {
							selectedScenarioData.push({
								condition: parseInt($(this).children("td:nth-child(4)").find("select option:selected").val()),
								dataparam: [$(this).children("td:nth-child(3)").find("input").val().trim()],
								scenarioId: $(this).children("td:nth-child(2)").data("scenarioid"),
								scenarioName: $(this).children("td:nth-child(2)").text(),
							});
						}
					});
					suiteInfo.testsuiteName = $(this).children('.scheduleSuite').find(".scheduleSuiteName").text();
					suiteInfo.testsuiteId = $(this).children('.scheduleSuite').find(".scheduleSuiteName").data("testsuiteid");
					suiteInfo.versionNumber = $(this).children('.scheduleSuite').find(".scheduleSuiteName").data("versionnumber");
					suiteInfo.appType = appType;
					const moduleId = $(this).children('.scheduleSuite').find(".scheduleSuiteName").data("moduleid");
					const tsu = readTestSuite[readTestSuite.map(t => t.testsuiteid).indexOf(moduleId)];
					const info = JSON.parse(window.localStorage['_FD']);
					suiteInfo.domainName = info.idnamemapdom[tsu.projectidts];
					suiteInfo.projectName = info.idnamemapprj[tsu.projectidts];
					suiteInfo.projectId = tsu.projectidts;
					suiteInfo.releaseId = tsu.releaseid;
					suiteInfo.cycleName = info.idnamemapcyc[tsu.cycleid];
					suiteInfo.cycleId = tsu.cycleid;
					suiteInfo.suiteDetails = selectedScenarioData;
					moduleInfo.push(suiteInfo);
				}
			});
			if (doNotSchedule) return false;
			const chkRepeat = {};
			for (let i = 0; i < moduleInfo.length; i++) {
				if (chkRepeat[moduleInfo[i].targetUser + "_" + moduleInfo[i].date + "_" + moduleInfo[i].time] !== undefined) {
					// doNotSchedule = true;
					// openModelPopup("Schedule Test Suite", "Schedule time is matching for testsuites scheduled for "+moduleInfo[i].targetUser);
					console.log("Schedule time is matching for testsuites scheduled for " + moduleInfo[i].targetUser + ". These will be combined and executed as a batch.");
				}
			}
			if (doNotSchedule) return false;
			const executionData = {
				source: "schedule",
				executionEnv: execEnv,
				exectionMode: execAction,
				browserType: browserTypeExe,
				qccredentials: { "qcurl": "", "qcusername": "", "qcpassword": "" },
				batchInfo: moduleInfo
			};
			blockUI("Scheduling...");
			ScheduleService.testSuitesScheduler_ICE(executionData)
				.then(function (data) {
					unblockUI();
					sequence(false,false,0);
					if (data == "Invalid Session") return $rootScope.redirectPage();
					else if (data == "NotApproved") openModelPopup("Schedule Test Suite", "All the dependent tasks (design, scrape) needs to be approved before execution");
					else if (data == "NoTask") openModelPopup("Schedule Test Suite", "Task does not exist for child node");
					else if (data == "Modified") openModelPopup("Schedule Test Suite", "Task has been modified, Please approve the task");
					else if (data.status == "booked") openModelPopup("Schedule Test Suite", "Schedule time is matching for testsuites scheduled for " + data.user);
					else if (data == "success" || data.includes("success")) {
						if (data.includes("Set")) openModelPopup("Schedule Test Suite", data.replace('success', ''));
						else openModelPopup("Schedule Test Suite", "Successfully scheduled.");
						$(".ipformating").val(" ");
						$(".fc-datePicker").datepicker('clearDates');
						$(".fc-timePicker").prop('disabled', true).css('cursor', 'not-allowed').timepicker('clear');
						getScheduledDetails();
						//Transaction Activity for InitSchedule Button Action
						// var labelArr = [];
						// var infoArr = [];
						// labelArr.push(txnHistory.codesDict['InitSchedule']);
						// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
					} else if (data == "few") {
						openModelPopup("Schedule Test Suite", "Failed to schedule few testsuites");
						$(".ipformating").val(" ");
						$(".fc-datePicker").datepicker('clearDates');
						$(".fc-timePicker").prop('disabled', true).css('cursor', 'not-allowed').timepicker('clear');
					} else if (data == "fail") {
						openModelPopup("Schedule Test Suite", "Failed to schedule Testsuite");
					} else {
						openModelPopup("Schedule Test Suite", "Error in scheduling Testsuite. Scheduling failed");
					}
					$("#scheduledDataBody>.scheduleDataBodyRow .scheduleDataBodyRowChild").show();
					$("#scheduledSuitesFilterData").prop('selectedIndex', 0);
					changeBackground();
					browserTypeExe = [];
					sequence(true,false,copyId);
					$(".selectScheduleSuite, .selectToSched").prop("checked", false);
					$(".selectBrowserSc").find(".sb").removeClass("sb");
					$(".selectParallel").find("img").removeClass("sb");
					$(".ipformating, .fc-datePicker, .fc-timePicker").prop("style", "border: none;");
					//$(".fc-timePicker").focus()
				}, function (error) {
					unblockUI();
					openModelPopup("Schedule Test Suite", "Failed to schedule Testsuite");
					console.error("Error: ", error);
				});
		}
	}

	//select parallel execution
	$(document).on("click", ".selectParallel", function () {
		$(this).find("img").toggleClass("sb");
		if ($("img").hasClass('sb') == true) execAction = "parallel";
		else execAction = "serial";
	});

	//Cancel scheduled jobs
	$scope.cancelThisJob = function ($event, status) {
		const target = $event.currentTarget.parentElement;
		const schDetails = target.dataset;
		const host = target.parentElement.children[1].innerText;
		const schedUserid = target.parentElement.children[1].dataset.scheduledby;
		ScheduleService.cancelScheduledJob_ICE(schDetails, host, schedUserid)
			.then(function (data) {
				if (data == "success") {
					openModelPopup("Scheduled Test Suite", "Job is " + status + ".");
					target.innerText = status;
					getScheduledDetails();
				} else if (data == "inprogress") openModelPopup("Scheduled Test Suite", "Job is in progress.. cannot be cancelled.");
				else if (data == "not authorised") openModelPopup("Scheduled Test Suite", "You are not authorized to cancel this job.");
				else openModelPopup("Scheduled Test Suite", "Failed to cancel Job");
			})
	}
}]);

function openModelPopup(title, body) {
	$("#scheduleGlobalModal").find('.modal-title').text(title);
	$("#scheduleGlobalModal").find('.modal-body p').text(body).css('color', 'black');
	$("#scheduleGlobalModal").modal("show");
	setTimeout(function () {
		$("#scheduleGlobalModal").find('.btn-accept').focus();
	}, 300);
}
var smartBatch = false;
var copyId = 0
function openPopup(id) {
	console.log("did reach here")
	if ($('.ipContainer').find(":selected")[parseInt(id[id.length - 1])].label === "Scenario Smart Scheduling") {
		console.log(id)
		if ($('#' + id)[0].length < 3) {
			$('#smartScheduling').find('.btn-default')[1].click();
			openModelPopup("Smart Scheduling", "No active ICE found to use Smart Scheduling");
			$('#' + id)[0].children[0].selectedIndex = 0;
			sequence(true,false,0);
			copyId = 0
		} else {
			$("#smartScheduling").modal("show");
			$($('#smartScheduling').find('.btn-default')[1]).data('selector-id', id);
			$('#smartScheduling').find('.btn-default')[1].onclick = function () {
				$('#' + $(this).data('selector-id'))[0].selectedIndex = 0;
				sequence(true,false,0);
				smartBatch = false;
				copyId = 0;
			}
			smartBatch = true;
			copyId = parseInt(id.replace("mod",""));
			sequence(true,true,copyId);
		}
	}
	else if ($('.ipContainer').find(":selected")[parseInt(id[id.length - 1])].label === "Module Smart Scheduling") {
		if ($('#' + id)[0].length <= 3) {
			$('#smartScheduling').find('.btn-default')[1].click();
			openModelPopup("Smart Scheduling", "No active ICE found to use Smart Scheduling");
			$('#' + id)[0].children[0].selectedIndex = 0;
			sequence(true,false,0);
			copyId = 0;
		} else {
			openModelPopup("Smart Scheduling", "All the modules will be executed as batch.\nAll available ICE should be in similar configurations for optimal results.");
			smartBatch = true;
			copyId = parseInt(id.replace("mod",""));
			sequence(true,true,copyId);
		}
	} else { 
		smartBatch = false;
		sequence(false,false,parseInt(id.replace("mod","")));
	 }
}
function sequence(copy,block,id) {
	var selectall = block; // select all only when blockin
	for (var i = 0; i < $(".batchSuite").length ; i++) {
		if(i == id){
			continue;
		}
		if(copy){
			$(".batchSuite")[i].children[0].children[2].children[0].selectedIndex = $(".batchSuite")[id].children[0].children[2].children[0].selectedIndex;
			$(".batchSuite")[i].children[0].children[3].children[0].value = $(".batchSuite")[id].children[0].children[3].children[0].value;
			$(".batchSuite")[i].children[0].children[4].children[0].value = $(".batchSuite")[id].children[0].children[4].children[0].value;
			$(".batchSuite")[i].children[0].children[4] = $(".batchSuite")[id].children[0].children[4]
			
		}
		if (block) {
			$(".batchSuite")[i].children[0].children[4].children[0].disabled = true;
			$(".batchSuite")[i].children[0].children[3].children[0].disabled = true;
			$(".batchSuite")[i].children[0].children[2].children[0].disabled = true;
		}else{
			$(".batchSuite")[i].children[0].children[4].children[0].disabled = false;
			$(".batchSuite")[i].children[0].children[3].children[0].disabled = false;
			$(".batchSuite")[i].children[0].children[2].children[0].disabled = false;
		}
	}
	// for (var i = 0; i < $(".batchSuite").find(".selectToSched").length ; i++) {
	// 	if(selectall && copy){ 
	// 		$(".batchSuite").find(".selectToSched")[i].checked = true;
	// 	}


	// }
	

}

function moduleSmartScheduling(){
	console.log("hello there")
	$("#mod0")[0].selectedIndex = $("#mod0")[0].length - 2;
	$("#mod0")[0].onchange();
}
function scenarioSmartScheduling(){
	$("#mod0")[0].selectedIndex = $("#mod0")[0].length - 1;
	$("#mod0")[0].onchange();
}