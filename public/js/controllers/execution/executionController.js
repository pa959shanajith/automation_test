mySPA.controller('executionController',['$scope', '$rootScope', '$http','$timeout','$location','ExecutionService','mindmapServices','DesignServices','cfpLoadingBar', 'socket', function ($scope, $rootScope, $http, $timeout, $location, ExecutionService, mindmapServices,DesignServices,cfpLoadingBar,socket) {
	cfpLoadingBar.start();
	var getEachScenario = []; //Contains Each RowData of Scenarios
	var browserTypeExe = []; // Contains selected browser id for execution
	var executionActive = false;
	var rowId;
	var execAction = "serial";
	var execEnv = "default";
	$scope.moduleInfo = [];
	$scope.somevar = {};
	$("body").css("background", "#eee");
	$timeout(function () {
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear();
		if (navigator.appVersion.indexOf("Mac") != -1) {
			$(".safariBrowser").show();
		}
	}, 500);

	if (window.localStorage['navigateScreen'] != "TestSuite") {
		return $rootScope.redirectPage();
	}

	//Set Modal Title
	$('div.modal').on('shown.bs.modal', function () {
		$(this).find('.modal-title').attr('title', $(this).find('.modal-title').text());
		$('.sDInnerContents').each(function () {
			$(this).attr('title', $(this).text());
		});
	});
	//Task Listing
	loadUserTasks();

	socket.on('ICEnotAvailable', function () {
		unblockUI();
		openDialogExe("Execute Test Suite", $rootScope.unavailableLocalServer_msg);
	});

	var current_task = JSON.parse(window.localStorage['_CT']);
	var getTaskName = current_task.taskName;
	var versionnumber = current_task.versionnumber;
	var appType = current_task.appType;

	//Task Name Commented
	//$("#page-taskName").empty().append('<span class="taskname">'+getTaskName+'</span>');
	$(".projectInfoWrap").empty();
	if (getTaskName.indexOf("Execute Batch") < 0) {
		$(".parentBatchContainer").parent().hide();
		$(".btnPanel").css("left", "0");
		$("#page-taskName span").text("Suite Execution");
	} else
		$("#page-taskName span").text("Batch Execution");
	var status = current_task.status;
	if (status == 'underReview') {
		$('.submitTaskBtn').text('Approve');
		$('.reassignTaskBtn').show();
	}

	var assignedTestScenarioId = current_task.assignedTestScenarioIds;
	var readTestSuite = current_task.testSuiteDetails;
	for (var rti = 0; rti < readTestSuite.length; rti++) {
		readTestSuite[rti].versionnumber = parseFloat(versionnumber);
	}

	//Getting Apptype or Screen Type
	$scope.getScreenView = appType;
	//Onload ServiceCall
	$timeout(function () {
		angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
	}, 1000);

	$scope.readTestSuite_ICE = function () {
		$('.checkStylebox').attr("disabled", true);
		$('#excSaveBtn').attr("disabled", true);
		blockUI("Loading in Progress. Please Wait");
		ExecutionService.readTestSuite_ICE(readTestSuite, "execute")
		.then(function (data) {
			unblockUI();
			if (data == "Invalid Session")
				return $rootScope.redirectPage();
			else if (data !== "") {
				$('.checkStylebox').attr("disabled", false);
				$('#excSaveBtn').attr("disabled", false);
				$(".executionTableDnd").empty();
				cfpLoadingBar.complete();
				var keys = Object.keys(data);
				var dataLen = keys.length;
				var eachData = keys.map(itm => data[itm]);
				for (var m = 0; m < dataLen; m++) {
					getEachScenario = []; // Empty scenarios for each module
					//create header for table
					$("#executionDataTable_" + m + " tbody tr").remove();
					var rowData = eachData[m];
					$("div.executionTableDnd").attr('id', 'batch_' + m);
					$("#batch_" + m).append("<div class='suiteNameTxt' id='page-taskName_" + m + "'><span title=" + rowData.testsuitename + " class='taskname'><input id='parentSuite_" + m + "' class='parentSuiteChk' type='checkbox' name='' />" + rowData.testsuitename + "</span></div><div id='exeData_" + m + "' class='exeDataTable testSuiteBatch'><table id='executionDataTable_" + m + "' class='executionDataTable' cellspacing='0' cellpadding='0'><thead><tr><th style='width: 4%' id='contextmenu'></th><th style='width: 3%; padding: 5px 0px'><i title='Do Not Execute' aria-hidden='true' style='font-size: 14px;'></i><input id='parentExecute_" + m + "' class='d-execute' type='checkbox' /></th>	<th style='width: 20%; text-align:left; border-right: 1px solid #fff;'>Scenario Name</th><th style='width: 24%; border-right: 1px solid #fff'>Data Parameterization</th>	<th style='width: 18%; border-right: 1px solid #fff'>Condition</th><th style='width: 24%;'>Project Name</th></tr><input type='hidden' value='" + rowData.testsuiteid + "'/></thead><tbody class='scrollbar-inner testScenarioScroll'></tbody></table></div>"); //<th style='width: 8%; text-align: center;'>ALM</th>
					//<img class='expandTable' src='imgs/icon-minus.png'>

					var row = $("#executionDataTable_" + m).find('tbody');
					console.log("row", row);
					var count = 1;

					//Building object for each row after getting the data from server
					for (var k = 0; k < rowData.scenarioids.length; k++) {
						if (current_task.scenarioFlag == 'True') {
							if (rowData.scenarioids[k] == assignedTestScenarioId) {
								getEachScenario.push({
									"condition": rowData.condition[k],
									"dataParam": rowData.dataparam[k],
									"executeStatus": rowData.executestatus[k],
									"scenarioIds": rowData.scenarioids[k],
									"scenarionames": rowData.scenarionames[k],
									"projectnames": rowData.projectnames[k],
									"testSuiteId": rowData.testsuiteid[k]
								});
							}
						} else {
							getEachScenario.push({
								"condition": rowData.condition[k],
								"dataParam": rowData.dataparam[k],
								"executeStatus": rowData.executestatus[k],
								"scenarioIds": rowData.scenarioids[k],
								"scenarionames": rowData.scenarionames[k],
								"projectnames": rowData.projectnames[k],
								"testSuiteId": rowData.testsuiteid[k]
							});
						}
					}

					//Building object for each row after getting the data from server
					//Creating Table Rows for each of the Scenarios
					for (var i = 0; i < getEachScenario.length; i++) {
						row = $("<tr id=\"" + count + "\"/>");
						$("#executionDataTable_" + m).append(row);
						row.append($("<td title=" + count + " class='tabeleCellPadding' style='width:4%;' id=\"" + count + "\">" + count + "</td>"));
						if (getEachScenario[i].executeStatus === undefined || getEachScenario[i].executeStatus == 0) {
							row.append($("<td  class='tabeleCellPadding exe-ExecuteStatus noExe' style='width: 3%; padding-top: 7px !important'><input ng-checked='executeAll' type='checkbox' title='Select to execute this scenario' class='doNotExecuteScenario d-execute'></td>"));
						} else if (getEachScenario[i].executeStatus == 1) {
							row.append($("<td class='tabeleCellPadding exe-ExecuteStatus' style='width:3%; padding-top: 7px !important'><input ng-checked='executeAll' type='checkbox' title='Select to execute this scenario' class='doNotExecuteScenario d-execute' checked></td>"));
						}
						row.append($("<td title=" + getEachScenario[i].scenarionames + "  class='tabeleCellPadding exe-scenarioIds' onclick='loadLocationDetails(this.innerHTML, this.getAttribute(\"sId\"))' sId=" + getEachScenario[i].scenarioIds + " style='width: 18%; margin-right: 2%; cursor:pointer; word-break: break-all; text-align:left'>" + getEachScenario[i].scenarionames + "</td>"));
						if (getEachScenario[i].dataParam === undefined) {
							row.append($('<td style="width: 25%" class="tabeleCellPadding exe-dataParam"><input class="getParamPath form-control" type="text" value=""/></td>'));
						} else {
							row.append($('<td style="width: 25%" class="tabeleCellPadding exe-dataParam"><input class="getParamPath form-control" type="text" value="' + getEachScenario[i].dataParam + '"/></td>'));
						}
						if (getEachScenario[i].condition == 0) {
							row.append($('<td style="width:20%" class="tabeleCellPadding exe-conditionCheck"><select class="conditionCheck form-control alertRed"><option value="1">True</option><option value="' + getEachScenario[i].condition + '" selected>False</option></select> </td>'));
						} else {
							row.append($('<td style="width:20%" class="tabeleCellPadding exe-conditionCheck"><select class="conditionCheck form-control alertGreen"><option value="' + getEachScenario[i].condition + '" selected>True</option><option value="0">False</option></select> </td>'));
						}
						row.append($("<td class='projectName' title=" + getEachScenario[i].projectnames + " style='width:20%; word-break: break-all; padding-left: 1% !important; padding-right: 1% !important' class='tabeleCellPadding'>" + getEachScenario[i].projectnames + "</td>"));
						// row.append($("<td class='variableMap' title='' style='width:10%; word-break: break-all; padding-left: 1% !important; padding-right: 1% !important;cursor:pointer;' class='tabeleCellPadding'><span class='descriptionContainer'><img alt='scenarioDescription' title='' id=scenarioDesc_"+count+" src='imgs/ic-details-inactive.png' data-scenarioid='"+getEachScenario[i].scenarioIds+"' class='scenarioDescIcon inactiveDesc'></span></td>"));
						//row.append($("<td style='width:8%' class='tabeleCellPadding'><img src='../imgs/ic-alm.png' id='syncScenario' title='Sync Test Scenario' style='cursor: pointer;'/></td>"));
						count++;
					}

					//Add Scenario Description Functionality
					$(document).on('click', '.descriptionContainer', function (e) {
						var getScenarioDescVal;
						$('.scenarioDescTxt:visible').text('');
						rowId = parseInt(e.target.id.split('_')[1]);
						$("#dialog-addScenarioDesc").attr('data-scenarioid', e.target.getAttribute('data-scenarioid'));
						$("#dialog-addScenarioDesc").modal("show");
						$(document).on('shown.bs.modal', '#dialog-addScenarioDesc', function () {
							$('.scenarioDescVal:first').focus();
						});
						$("#addScenarioDescContainer").empty();
						if ($(".addScenarioDesc-row").length > 1)
							$(".addScenarioDesc-row").remove();
						if ($("#getScenarioDescVal_" + rowId + "").text() !== '') {
							getScenarioDescVal = JSON.parse($("#getScenarioDescVal_" + rowId + "").text());
						} else {
							getScenarioDescVal = [];
						}

						if (getScenarioDescVal.length > 0) {
							for (var i = 0; i < getScenarioDescVal.length; i++) {
								$("#addScenarioDescContainer").append('<div class="row row-modal addScenarioDesc-row"><div class="form-group form-inline scenarioDescFormGroup"><input id="varVal_lbl" maxLength ="20" type="text" class="form-control form-control-custom varVal" placeholder="" value="Account Number"></div><div class="form-group scenarioDescFormGroupval"><input maxLength ="20" type="text" class="form-control form-control-custom scenarioDescVal" placeholder="Enter Account Number"  Value=' + getScenarioDescVal[i].accountNoVal + '></div><span class="delScenarioDesc"><img class="deleteScenarioDescRow" src="imgs/ic-delete.png" /></span></div>');
							}
						} else {
							$("#addScenarioDescContainer").append('<div class="row row-modal addScenarioDesc-row"><div class="form-group form-inline scenarioDescFormGroup"><input id="varVal_txt" maxLength ="20" type="text" class="form-control form-control-custom varVal" placeholder="" value="Account Number"></div><div class="form-group scenarioDescFormGroupval"><input maxLength ="20" type="text" class="form-control form-control-custom scenarioDescVal" placeholder="Enter Account Number"></div><span class="delScenarioDesc"><img class="deleteScenarioDescRow" src="imgs/ic-delete.png" /></span></div>');
						}
						if ($("#scenarioDescriptionTxt_" + rowId + "").text() !== '') {
							$("#" + event.target.id).parents('body.modal-open').find('input.scenarioDescTxt').val($("#scenarioDescriptionTxt_" + rowId + "").text());
						} else {
							$("#" + event.target.id).parents('body.modal-open').find('input.scenarioDescTxt').val('');
						}
						e.stopImmediatePropagation();
					});

					//Input only number on Keypress Event for Account Number
					$(document).on('keypress', '.scenarioDescVal', function (e) {
						if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
							return false;
						}
					});
					//Input only number on Paste Event for Account Number
					$(document).on('input', '.scenarioDescVal', function (e) {
						e.target.value = e.target.value.replace(/[^0-9]/g, '');
					});

					//Add More Scenario Description row Functionality
					$scope.addMoreScenarioObject = function () {
						$("#addScenarioDescContainer").append('<div class="row row-modal addScenarioDesc-row"><div class="form-group form-inline scenarioDescFormGroup"><input  maxLength ="20" id="varVal_text" type="text" class="form-control form-control-custom varVal" value="Account Number" placeholder=""></div><div class="form-group scenarioDescFormGroupval" value= "Account Number"><input maxLength ="50" type="text" class="form-control form-control-custom scenarioDescVal" placeholder="Enter Account Number"></div><span class="delScenarioDesc"><img class="deleteScenarioDescRow" src="imgs/ic-delete.png" /></span></div>');
						$(".scenarioDescVal:last").focus();
					};

					//Delete Scenario Description row Functionality
					$(document).on("click", ".deleteScenarioDescRow", function () {
						$(this).parent().parent(".addScenarioDesc-row").remove();
						$(".scenarioDescVal:last").focus();
					});

					//Reset Scenario Description rows Functionality
					$scope.resetScenarioDescFields = function () {
						$('.addScenarioDesc-row').find("input.scenarioDescVal:visible").val('');
						$('input.scenarioDescTxt:visible').val('');
					};

					//Save Scenario Description rows Functionality
					$scope.saveScenarioDescDetails = function ($event) {
						$scope.scenarioDescriptionObj = [];
						$('.addScenarioDesc-row').each(function () {
							$scope.scenarioDescriptionObj.push({
								'accountNoKey': $(this).find('.varVal').val(),
								'accountNoVal': $(this).find('.scenarioDescVal').val()
							});
						});
						var scenarioDescriptionText = $.trim($("#" + $event.target.id).parents('.modal-dialog').find('.scenarioDescTxt').val());
						$("#dialog-addScenarioDesc").modal("hide");
						openDialogExe("Scenario Description", "Scenario Description added successfully");
						if ($scope.scenarioDescriptionObj.length > 0) {
							$scope.scenarioDescriptionObj = JSON.stringify($scope.scenarioDescriptionObj);
							$('img#scenarioDesc_' + rowId + '').attr('src', 'imgs/ic-details-active.png');
							$("img#scenarioDesc_" + rowId + "").append('<span id="getScenarioDescVal_' + rowId + '" class="getScenarioDescVal hide"></span><span id="scenarioDescriptionTxt_' + rowId + '" class ="scenarioDescriptionTxt hide"></span>');
							$("#getScenarioDescVal_" + rowId + "").text($scope.scenarioDescriptionObj);
						} else {
							$scope.scenarioDescriptionObj = JSON.stringify($scope.scenarioDescriptionObj);
							$('img#scenarioDesc_' + rowId + '').attr('src', 'imgs/ic-details-inactive.png');
							$("img#scenarioDesc_" + rowId + "").append('<span id="getScenarioDescVal_' + rowId + '" class="getScenarioDescVal hide"></span><span id="scenarioDescriptionTxt_' + rowId + '" class ="scenarioDescriptionTxt hide"></span>');
							$("#getScenarioDescVal_" + rowId + "").text($scope.scenarioDescriptionObj);
						}

						$("#scenarioDescriptionTxt_" + rowId + "").text(scenarioDescriptionText);
						//Service to be called for saving scenario description
						$scope.somevar[$("#dialog-addScenarioDesc").attr('data-scenarioid')] = {
							"map": JSON.parse($scope.scenarioDescriptionObj),
							"scenariodescription": scenarioDescriptionText
						};
					};

					//No Execution Status Marking Red
					$(".noExe").parent("tr").css({
						'border-left': '4px solid red'
					});
					$(".noExe").prev().css({
						'width': 'calc(3.9% - 4px)'
					});

					//check,uncheck parentSuite onload
					$('#parentExecute_' + m).each(function () {
						var checkedLen = $(this).parents('table').find('tbody tr input[type=checkbox]:checked').length;
						if (parseInt(checkedLen) > 0)
							$('#parentSuite_' + m).prop("checked", true);
						else
							$('#parentSuite_' + m).prop("checked", false);
						var totalLen = $(this).parents('table').find('tbody tr input[type=checkbox]').length;
						if (totalLen == checkedLen) {
							$('#parentExecute_' + m).prop("checked", true);
							//$('#parentSuite_'+m).prop("checked", true);
						} else {
							$('#parentExecute_' + m).prop("checked", false);
							//$('#parentSuite_'+m).prop("checked", false);
						}
					});

					//check parent checkbox by default if all child checkboxes are checked
					if ($("#executionDataTable_" + m + " tbody tr").length == $("#executionDataTable_" + m + " tbody tr td.exe-ExecuteStatus input:checked").length) {
						$("#parentExecute").prop("checked", true);
					} else {
						$("#parentExecute").prop("checked", false);
					}
				}
				if (dataLen >= 2) {
					$(".executionDataTable tbody").prop("style", "max-height: 100px !important;");
				}
				if (dataLen == $(".parentSuiteChk:checked").length) {
					$(".checkStylebox").prop("checked", true);
				} else {
					$(".checkStylebox").prop("checked", false);
				}

				$('[id^=parentExecute_]').on('click', function (e) {
					if ($(this).is(":checked") == true) {
						$(this).parents('table').find('tbody tr input[type=checkbox]').prop('checked', true);
						$(this).parents('table').parent().prev().children('span').children('input').prop('checked', true);
					} else {
						$(this).parents('table').find('tbody tr input[type=checkbox]').prop('checked', false);
						$(this).parents('table').parent().prev().children('span').children('input').prop('checked', false);
					}
					var moduleLen = $('[id^=parentSuite_]:checked').length;
					var totalModuleLen = $('[id^=parentSuite_]').length;
					if (moduleLen == totalModuleLen) {
						$("input[type='checkbox'].checkStylebox").prop('checked', true);
					} else {
						$("input[type='checkbox'].checkStylebox").prop('checked', false);
					}
				});

				$('[id^=executionDataTable]').find('tbody tr td input').on('click', function (e) {
					var totalLen = $(this).parent().parent().parent().children().find('input[type=checkbox]').length;
					var checkedLen = $(this).parent().parent().parent().children().find('input[type=checkbox]:checked').length;
					if (totalLen == checkedLen) {
						$(this).parents('table').find('thead input[type=checkbox]').prop('checked', true);
					} else {
						$(this).parents('table').find('thead input[type=checkbox]').prop('checked', false);
					}
					if (checkedLen > 0) {
						$(this).parents('table').parent().prev().children('span').children('input[type=checkbox]').prop('checked', true);
					} else {
						$(this).parents('table').parent().prev().children('span').children('input[type=checkbox]').prop('checked', false);
					}
					var moduleLen = $('[id^=parentSuite_]:checked').length;
					var totalModuleLen = $('[id^=parentSuite_]').length;
					if (moduleLen == totalModuleLen) {
						$("input[type='checkbox'].checkStylebox").prop('checked', true);
					} else {
						$("input[type='checkbox'].checkStylebox").prop('checked', false);
					}
				});

				$('[id^=parentSuite_]').on('click', function (e) {
					if ($(this).is(":checked") == true) {
						$(this).parents('.suiteNameTxt').next().children().find('input[type=checkbox]').prop('checked', true);
					} else {
						$(this).parents('.suiteNameTxt').next().children().find('input[type=checkbox]').prop('checked', false);
					}
					var checkedLen = $('[id^=parentSuite_]:checked').length;
					var totalLen = $('[id^=parentSuite_]').length;
					if (checkedLen == totalLen) {
						$("input[type='checkbox'].checkStylebox").prop('checked', true);
					} else {
						$("input[type='checkbox'].checkStylebox").prop('checked', false);
					}
				});

				$("input[type='checkbox'].checkStylebox").on('click', function (e) {
					if ($(this).is(":checked") == true) {
						$('[id^=parentSuite_]').prop('checked', true);
						$('[id^=parentExecute_]').prop('checked', true);
						$("tbody").find('input[type=checkbox]').prop('checked', true);
					} else {
						$('[id^=parentSuite_]').prop('checked', false);
						$('[id^=parentExecute_]').prop('checked', false);
						$("tbody").find('input[type=checkbox]').prop('checked', false);
					}
				});
			}

			if (getTaskName.indexOf("Execute Batch") < 0) {
				$(".parentSuiteChk").hide();
			}
			// // select all checkboxes by defaulton load
			// $("input[type=checkbox]:visible").prop('checked', true)

			// // check parent checkbox by default if all child checkboxes are checked
			// if ($("#executionDataTable_" + m + " tbody tr").length == $("#executionDataTable_" + m + " tbody tr td.exe-ExecuteStatus input:checked").length) {
			// 	$("#parentExecute").prop("checked", true);
			// } else {
			//	 $("#parentExecute").prop("checked", false);
			// }
			// }
			var suiteidsexecution = [];
			$(".parentSuiteChk:checked").each(function (i, e) {
				suiteidsexecution.push(e.getAttribute('id').split('_')[1]);
			});
			window.localStorage.setItem("executionidxreport", JSON.stringify({
				"idxlist": suiteidsexecution
			}));
		}, function (error) {
			unblockUI();
			console.log("Error");
		});
	};

	$(document).on('click', '.expandTable', function () {
		if ($(this).attr('src') == "imgs/icon-plus.png") {
			$(this).prop("src", "imgs/icon-minus.png");
			$(this).parent().parent().next().slideDown();
		} else {
			$(this).prop("src", "imgs/icon-plus.png");
			$(this).parent().parent().next().slideUp();
		}
	});

	//Show scenarios of testsuites
	$(document).dblclick(".taskname", function (e) {
		if (e.target.className == "taskname") {
			var scenarioNames = e.target.parentElement.nextSibling.getElementsByClassName("testScenarioScroll")[0].children;
			$("#suiteDetailsContent").empty();
			$("#modalSuiteDetails").find(".modal-title").text(e.target.textContent);
			var projectName = $(e.target).parents('.executionTableDnd').find('.projectName:first').text();
			for (var i = 0; i < scenarioNames.length; i++) {
				$("#suiteDetailsContent").append('<div class="sDInnerContentsWrap"><div class="sDInnerContents" style="width: 50%;">' + scenarioNames[i].getElementsByClassName("exe-scenarioIds")[0].textContent + '</div><div class="sDInnerContents" style="width: 50%;">' + projectName + '</div></div>');
			}
			$("#modalSuiteDetails").modal("show");
			$('#modalSuiteDetails').find('.btn-default').focus();
		}
	});
	//Load Location Details of Scenario
	$scope.loadLocationDetails = function (scenarioName, scenarioId) {
		//document.getElementById("scenarioDetailsContent").innerHTML = "";
		$("#scenarioDetailsContent").empty();
		$("#modalScenarioDetails").find(".modal-title").text(scenarioName);
		$("#modalScenarioDetails").modal("show");
		$('#modalScenarioDetails').find('.btn-default').focus();
		ExecutionService.loadLocationDetails(scenarioName, scenarioId)
		.then(function (data) {
			if (data == "Invalid Session") {
				return $rootScope.redirectPage();
			}
			for (var i = 0; i < data.projectnames.length && data.testcasenames.length && data.screennames.length; i++) {
				//document.getElementById("scenarioDetailsContent").innerHTML += '<div class="sDInnerContentsWrap"><div class="sDInnerContents">'+data.testcasenames[i]+'</div><div class="sDInnerContents">'+data.screennames[i]+'</div><div class="sDInnerContents">'+data.projectnames[i]+'</div></div>'
				$("#scenarioDetailsContent").append('<div class="sDInnerContentsWrap"><div class="sDInnerContents viewReadOnlyTC" data-name=' + data.testcasenames[i] + ' data-id=' + data.testcaseids[i] + '>' + data.testcasenames[i] + '</div><div class="sDInnerContents">' + data.screennames[i] + '</div><div class="sDInnerContents">' + data.projectnames[i] + '</div></div>');
			}
			$(".viewReadOnlyTC").click(function () {
				var testCaseName = this.getAttribute('data-name'),
				testCaseId = this.getAttribute('data-id');
				DesignServices.readTestCase_ICE(testCaseId, testCaseName, 0)
				.then(function (response) {
					if (response == "Invalid Session") {
						return $rootScope.redirectPage();
					}
					var source = $("#handlebar-template-testcase").html();
					var template = Handlebars.compile(source);
					try {
						JSON.stringify(response.testcase);
					} catch (err) {
						response.testcase = '[]';
					}
					var dat = template({
							name: [{
									testcasename: response.testcasename
								}
							],
							rows: response.testcase
						});
					var newWindow = window.open();
					newWindow.document.write(dat);
				}, function (error) {
					console.log(error);
				});
				//alert( "Handler for .click() called." );
			});

		}, function (error) {
			console.log(error);
		});
	};
	//Load Location Details of Scenario


	//Save TestSuite Functionality
	$scope.updateTestSuite = function (e) {
		blockUI("Saving in progress. Please Wait...");
		const batchInfo = [];
		const suiteidsexecution = [];
		$(".parentSuiteChk:checked").each(function (i, e) {
			suiteidsexecution.push(e.getAttribute('id').split('_')[1]);
		});
		window.localStorage.setItem("executionidxreport", JSON.stringify({"idxlist": suiteidsexecution}));
		$.each($(".parentSuiteChk"), function () {
			const suiteDetails = {};
			const testScenarioIds = [];
			const getParamPaths = [];
			const conditionCheck = [];
			const executeStatus = [];
			const scenarioDescriptionText = [];
			const scenarioAccNoMap = {};
			$.each($(this).parents('.suiteNameTxt').next('div').find('.exe-scenarioIds'), function () {
				testScenarioIds.push($(this).attr("sId"));
				getParamPaths.push($(this).parent().find(".getParamPath").val().trim());
				conditionCheck.push($(this).parent().find(".conditionCheck option:selected").val());
				var scenarioDescObj = $(this).parent().find('.getScenarioDescVal').text().trim();
				if (scenarioDescObj !== '') scenarioDescObj = JSON.parse(scenarioDescObj);
				scenarioAccNoMap[$(this).attr("sId")] = scenarioDescObj;
				scenarioDescriptionText.push($(this).parent().children('td.variableMap').find('.scenarioDescriptionTxt').text());
				if ($(this).parent().find(".doNotExecuteScenario").is(":checked")) executeStatus.push(1);
				else executeStatus.push(0);
			});
			suiteDetails.testsuiteid = $(this).parents('.suiteNameTxt').next().find('thead').children('input[type=hidden]').val();
			suiteDetails.testsuitename = $(this).parents('span.taskname').text();
			suiteDetails.testscenarioids = testScenarioIds;
			suiteDetails.getparampaths = getParamPaths;
			suiteDetails.conditioncheck = conditionCheck;
			suiteDetails.donotexecute = executeStatus;
			// suiteDetails.versionnumber = versionnumber;
			suiteDetails.scenarioAccNoMap = scenarioAccNoMap;
			suiteDetails.scenarioDescriptions = scenarioDescriptionText;
			batchInfo.push(suiteDetails);
		});
		//console.log("batchdetails", batchInfo);
		//Getting ConditionChecks
		ExecutionService.updateTestSuite_ICE(batchInfo)
		.then(function (data) {
			unblockUI();
			if (data == "Invalid Session") {
				return $rootScope.redirectPage();
			}
			if (data != "fail") {
				openDialogExe("Save Test Suite", "Test suite saved successfully.");
				//$("#saveSuitesModal").modal("show")
				//Transaction Activity for Save Test Suite Button Action
				// var labelArr = [];
				// var infoArr = [];
				// labelArr.push(txnHistory.codesDict['SaveTestSuite']);
				// txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
			} else {
				openDialogExe("Save Test Suite", "Failed to save test suite.");
				//$("#saveSuitesModalFail").show();
			}
			angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
		}, function (error) {
			console.log(error);
		});
	};
	//Save TestSuite Functionality

	$scope.qccredentials = {qcurl: "", qcusername: "", qcpassword: "", qctype: ""};

	//Save QC Details
	$scope.saveQcCredentials = function (e) {
		$("#almURL, #almUserName, #almPassword").removeClass('inputErrorBorder');
		if (!$scope.almURL) {
			$("#almURL").addClass('inputErrorBorder');
			$(".error-msg-exeQc").text("Please Enter URL.");
		} else if (!$scope.almUserName) {
			$("#almUserName").addClass('inputErrorBorder');
			$(".error-msg-exeQc").text("Please Enter User Name.");
		} else if (!$scope.almPassword) {
			$("#almPassword").addClass('inputErrorBorder');
			$(".error-msg-exeQc").text("Please Enter Password.");
		} else if (appType != "SAP" && browserTypeExe.length === 0) {
			$("#ALMSyncWindow").find("button.close").trigger("click");
			openDialogExe("Execute Test Suite", "Please select a browser");
		} else if ($(".exe-ExecuteStatus input:checked").length === 0) {
			$("#ALMSyncWindow").find("button.close").trigger("click");
			openDialogExe("Execute Test Suite", "Please select atleast one scenario(s) to execute");
		} else {
			//$("#almURL,#almUserName,#almPassword,.almQclogin").prop("disabled", true);
			$("#almURL,#almUserName,#almPassword").css({
				"background": "none"
			});
			$(".error-msg-exeQc").text("");
			ExecutionService.loginQCServer_ICE($scope.almURL, $scope.almUserName, $scope.almPassword)
			.then(function (data) {
				//$("#almURL,#almUserName,#almPassword,.almQclogin").prop("disabled", false);
				if (data == "unavailableLocalServer") {
					$(".error-msg-exeQc").text("Unavailable LocalServer");
				} else if (data == "Invalid Session") {
					$(".error-msg-exeQc").text("Invalid Session");
				} else if (data == "invalidcredentials") {
					$(".error-msg-exeQc").text("Invalid Credentials");
				} else if (data == "invalidurl") {
					$(".error-msg-exeQc").text("Invalid URL");
				} else {
					$scope.qccredentials = {
						qcurl: $("#almURL").val(),
						qcusername: $("#almUserName").val(),
						qcpassword: $("#almPassword").val()
					}
					//Transaction Activity for SaveQcCredentialsExecution Button Action
					// var labelArr = [];
					// var infoArr = [];
					// labelArr.push(txnHistory.codesDict['SaveQcCredentialsExecution']);
					// txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
					$("#ALMSyncWindow").find("button.close").trigger("click");
				}
			}, function (error) {
				console.log("Error in qcController.js file loginQCServer method! \r\n " + (error.data));
			});
		}
	};

	//Save qTest Details
	$scope.saveQTestCredentials = function (e) {
		var checkedVal = $("#qtestSteps")[0].checked;
		$("#qTestURL, #qTestUserName, #qTestPassword").removeClass('inputErrorBorder');
		if (!$scope.qTestURL) {
			$("#qTestURL").addClass('inputErrorBorder');
			$(".error-msg-exeQc").text("Please Enter URL.");
		} else if (!$scope.qTestUserName) {
			$("#qTestUserName").addClass('inputErrorBorder');
			$(".error-msg-exeQc").text("Please Enter User Name.");
		} else if (!$scope.qTestPassword) {
			$("#qTestPassword").addClass('inputErrorBorder');
			$(".error-msg-exeQc").text("Please Enter Password.");
		} else if (appType != "SAP" && browserTypeExe.length === 0) {
			$("#QTestSyncWindow").find("button.close").trigger("click");
			openDialogExe("Execute Test Suite", "Please select a browser");
		} else if ($(".exe-ExecuteStatus input:checked").length === 0) {
			$("#QTestSyncWindow").find("button.close").trigger("click");
			openDialogExe("Execute Test Suite", "Please select atleast one scenario(s) to execute");
		} else {
			$("#qTestURL,#qTestUserName,#qTestPassword").css({
				"background": "none"
			});
			$(".error-msg-exeQc").text("");
			ExecutionService.loginQTestServer_ICE($scope.qTestURL, $scope.qTestUserName, $scope.qTestPassword,"qTest")
			.then(function (data) {
				if (data == "unavailableLocalServer") {
					$(".error-msg-exeQc").text("Unavailable LocalServer");
				} else if (data == "Invalid Session") {
					$(".error-msg-exeQc").text("Invalid Session");
				} else if (data == "invalidcredentials") {
					$(".error-msg-exeQc").text("Invalid Credentials");
				} else if (data == "invalidurl") {
					$(".error-msg-exeQc").text("Invalid URL");
				} else {
					$scope.qccredentials = {
						qcurl: $("#qTestURL").val(),
						qcusername: $("#qTestUserName").val(),
						qcpassword: $("#qTestPassword").val(),
						qteststeps: checkedVal,
						qctype: "qTest"
					}
					$("#QTestSyncWindow").find("button.close").trigger("click");
				}
			}, function (error) {
				console.log("Error in qcController.js file loginQCServer method! \r\n " + (error.data));
			});
		}
	};
	
	//Execute TestSuite Functionality
	$scope.ExecuteTestSuite = function ($event) {
		if ($(".exe-ExecuteStatus input:checked").length === 0) openDialogExe("Execute Test Suite", "Please select atleast one scenario(s) to execute");
		else if ((appType == "Web") && browserTypeExe.length === 0) openDialogExe("Execute Test Suite", "Please select a browser");
		else if (appType == "Webservice" && browserTypeExe.length === 0) openDialogExe("Execute Test Suite", "Please select Web Services option");
		else if (appType == "MobileApp" && browserTypeExe.length === 0) openDialogExe("Execute Test Suite", "Please select Mobile Apps option");
		else if (appType == "Desktop" && browserTypeExe.length === 0) openDialogExe("Execute Test Suite", "Please select Desktop Apps option");
		else if (appType == "Mainframe" && browserTypeExe.length === 0) openDialogExe("Execute Test Suite", "Please select Mainframe option");
		else if (appType == "OEBS" && browserTypeExe.length === 0) openDialogExe("Execute Test Suite", "Please select OEBS Apps option");
		else if (appType == "SAP" && browserTypeExe.length === 0) openDialogExe("Execute Test Suite", "Please select SAP Apps option");
		else if (appType == "MobileWeb" && browserTypeExe.length === 0) openDialogExe("Execute Test Suite", "Please select Mobile Web option");
		else if (browserTypeExe.length === 0) openDialogExe("Execute Test Suite", "Please select " + appType + " option");
		else if ((appType == "Web") && browserTypeExe.length == 1 && execAction == "parallel") openDialogExe("Execute Test Suite", "Please select multiple browsers");
		else {
			const projectdata = JSON.parse(window.localStorage["_FD"]);
			$scope.moduleInfo = [];
			$.each($(".parentSuiteChk"), function () {
				var testsuiteDetails = current_task.testSuiteDetails[this.getAttribute("id").split('_')[1]];
				var suiteInfo = {};
				var selectedRowData = [];
				var relid = testsuiteDetails.releaseid;
				var cycid = testsuiteDetails.cycleid;
				var projectid = testsuiteDetails.projectidts;
				if ($(this).is(":checked") == true) {
					$(this).parent().parent().next().find('tbody input[type=checkbox]:checked').each(function () {
						selectedRowData.push({
							condition: parseInt($(this).parent().siblings(".exe-conditionCheck").find("select option:selected").val()),
							dataparam: [$(this).parent().siblings(".exe-dataParam").find("input").val().trim()],
							scenarioName: $(this).parent().siblings(".exe-scenarioIds")[0].innerText,
							scenarioId: $(this).parent().siblings(".exe-scenarioIds").attr("sId"),
							scenariodescription: $scope.somevar[$(this).parent().siblings(".exe-scenarioIds").attr("sId")]
						});
					});

					suiteInfo.testsuiteName = $(this).parents('span.taskname').text();
					suiteInfo.testsuiteId = $(this).parents('.suiteNameTxt').next().find('thead').children('input[type=hidden]').val();
					suiteInfo.versionNumber = testsuiteDetails.versionnumber;
					suiteInfo.appType = appType;
					suiteInfo.domainName = projectdata.idnamemapdom[projectid];
					suiteInfo.projectName = projectdata.idnamemapprj[projectid];
					suiteInfo.projectId = projectid;
					suiteInfo.releaseId = relid;
					suiteInfo.cycleName = projectdata.idnamemapcyc[cycid];
					suiteInfo.cycleId = cycid;
					suiteInfo.suiteDetails = selectedRowData;
					$scope.moduleInfo.push(suiteInfo);
				}
			});
			blockUI("Execution in progress. Please Wait...");
			var executionData = {
				source: "task",
				exectionMode: execAction,
				executionEnv: execEnv,
				browserType: browserTypeExe,
				qccredentials: $scope.qccredentials,
				batchInfo: $scope.moduleInfo
			};
			executionActive = true;
			$rootScope.resetSession.start();
			ExecutionService.ExecuteTestSuite_ICE(executionData)
			.then(function (data) {
				if (data == "begin") return false;
				unblockUI();
				$rootScope.resetSession.end();
				executionActive = false;
				if (data == "Invalid Session") return $rootScope.redirectPage();
				else if (data == "unavailableLocalServer") openDialogExe("Execute Test Suite", $rootScope.unavailableLocalServer_msg);
				else if (data == "scheduleModeOn") openDialogExe("Execute Test Suite", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
				else if(data == "NotApproved") openDialogExe("Execute Test Suite", "All the dependent tasks (design, scrape) needs to be approved before execution");
				else if(data == "NoTask") openDialogExe("Execute Test Suite", "Task does not exist for child node");
				else if(data == "Modified") openDialogExe("Execute Test Suite", "Task has been modified, Please approve the task");
				else if (data == "unavailableLocalServer") openDialogExe("Execute Test Suite", $rootScope.unavailableLocalServer_msg);
				else if (data == "Terminate") {
					$('#executionTerminatedBy').html('Program');
					$('#executionTerminated').modal('show');
					$('#executionTerminated').find('.btn-default').focus();
				} else if (data == "UserTerminate") {
					$('#executionTerminatedBy').html('User');
					$('#executionTerminated').modal('show');
					$('#executionTerminated').find('.btn-default').focus();
				} else if (data == "success") {
					$('#executionCompleted').modal('show');
					setTimeout(function () {
						$("#executionCompleted").find('.btn-default').focus();
					}, 300);
				} else openDialogExe("Execute Test Suite", "Failed to execute.");
				$(".selectBrowser").find("img").removeClass("sb");
				$(".selectParallel").find("img").removeClass("sb");
				$(".selectSauceLabs").find("img").removeClass("sb");
				$(".selectBrowser").find("svg").removeClass("sb");
				$(".selectParallel").find("svg").removeClass("sb");
				$(".selectSauceLabs").find("svg").removeClass("sb");
				browserTypeExe = [];
				$scope.moduleInfo = [];
				$scope.readTestSuite_ICE();
				$("#syncScenario").prop("disabled", true);
				//Transaction Activity for ExecuteTestSuite Button Action
				// var labelArr = [];
				// var infoArr = [];
				// infoArr.push({"appType" : appType});
				// infoArr.push({"status" : data});
				// labelArr.push(txnHistory.codesDict['ExecuteTestSuite']);
				// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
			}, function (error) {
				unblockUI();
				$rootScope.resetSession.end();
				openDialogExe("Execute Failed", "Failed to execute.");
				executionActive = false;
				//$('#executionFailed').modal('show');
				$(".selectBrowser").find("img").removeClass("sb");
				$(".selectParallel").find("img").removeClass("sb");
				$(".selectSauceLabs").find("img").removeClass("sb");
				$(".selectBrowser").find("svg").removeClass("sb");
				$(".selectParallel").find("svg").removeClass("sb");
				$(".selectSauceLabs").find("svg").removeClass("sb");
				browserTypeExe = [];
				$scope.moduleInfo = [];
				$scope.readTestSuite_ICE();
				$("#syncScenario").prop("disabled", true);
			});
		}
	};

	socket.on('result_ExecutionDataInfo', function (data) {
		if (!executionActive)
			return false;
		if (data == "Terminate") {
			$('#executionTerminatedBy').html('Program');
			$('#executionTerminated').modal('show');
			$('#executionTerminated').find('.btn-default').focus();
		} else if (data == "UserTerminate") {
			$('#executionTerminatedBy').html('User');
			$('#executionTerminated').modal('show');
			$('#executionTerminated').find('.btn-default').focus();
		} else if (data == "unavailableLocalServer") {
			openDialogExe("Execute Test Suite", $rootScope.unavailableLocalServer_msg);
		} else if (data == "success") {
			$('#executionCompleted').modal('show');
			setTimeout(function () {
				$("#executionCompleted").find('.btn-default').focus();
			}, 300);
		} else openDialogExe("Execute Test Suite", "Failed to execute.");
		unblockUI();
		$rootScope.resetSession.end();
		$(".selectBrowser").find("img").removeClass("sb");
		$(".selectParallel").find("img").removeClass("sb");
		$(".selectBrowser").find("svg").removeClass("sb");
		$(".selectParallel").find("svg").removeClass("sb");
		execAction="serial";
		browserTypeExe = [];
		$scope.moduleInfo = [];
		$scope.readTestSuite_ICE();
		$("#syncScenario").prop("disabled", true);
	});
	//Execute TestSuite Functionality

	//Integration Functionality
	$(document).on("change", "#syncScenario", function () {
		if ($(this).val() == "1") {
			$("#almURL").val('');
			$("#almUserName").val('');
			$("#almPassword").val('');
			$scope.almURL = '';
			$scope.almUserName = '';
			$scope.almPassword = '';
			$("#ALMSyncWindow").modal("show");
			$(".error-msg-exeQc").text('');
		}
		else if ($(this).val() == "0") {
			$("#qTestURL").val('');
			$("#qTestUserName").val('');
			$("#qTestPassword").val('');
			$scope.qTestURL = '';
			$scope.qTestUserName = '';
			$scope.qTestPassword = '';
			$("#QTestSyncWindow").modal("show");
			$(".error-msg-exeQc").text('');
		}
	});

	//ALM Functionality

	$scope.submit_task = function (action, e) {
		var taskid = current_task.subTaskId;
		var taskstatus = current_task.status;
		var version = current_task.versionnumber;
		var batchTaskIDs = current_task.batchTaskIDs;
		var projectId = current_task.projectId;
		if (action != undefined && action == 'reassign') {
			taskstatus = action;
		}
		//Transaction Activity for Task Submit/Approve/Reassign Button Action
		// var labelArr = [];
		// var infoArr = [];

		mindmapServices.reviewTask(projectId, taskid, taskstatus, version, batchTaskIDs).then(function (result) {
			if (result == 'fail') {
				openDialogExe("Task Submission Error", "Reviewer is not assigned !", true);
			}else if(result =='NotApproved'){
				openDialogExe("Task Submission Error", "All the dependent tasks (design, scrape) needs to be approved before Submission", true);
			} 
			else if (taskstatus == 'reassign') {
				openDialogExe("Task Reassignment Success", "Task Reassigned successfully!", true);
				//labelArr.push(txnHistory.codesDict['TaskReassign']);
			} else if (taskstatus == 'underReview') {
				openDialogExe("Task Completion Success", "Task Approved successfully!", true);
				//labelArr.push(txnHistory.codesDict['TaskApprove']);
			} else {
				openDialogExe("Task Submission Success", "Task Submitted successfully!", true);
				//labelArr.push(txnHistory.codesDict['TaskSubmit']);
			}
			//txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
		}, function (error) {
			console.log(error);
		});
	};

	$scope.submitTaskExecution = function (action) {
		$("#submitTasksExecution").modal("show");
		$('#submitTasksExecution').find('.btn-default-yes').focus();
		if (action == 'reassign') {
			$scope.stask = 'reassign';
			$("#submitTasksExecution").find('.modal-title').text('Reassign Task');
			$("#submitTasksExecution").find('.modal-body p').text('Are you sure you want to reassign the task ?');
			//$("#submitTasksExecution").find('.modal-footer button')[0].setAttribute('ng-click',"submit_task('reassign')")
		} else {
			$scope.stask = 'approve';
			if ($(".submitTaskBtn:visible").text() == 'Approve') {
				$("#submitTasksExecution").find('.modal-title').text('Approve Task');
				$("#submitTasksExecution").find('.modal-body p').text('Are you sure you want to approve the task ?');
			} else {
				$("#submitTasksExecution").find('.modal-body p').text('Are you sure you want to submit the task ?');
			}

		}
	};

	//Conditiion Check Function
	$(".conditionCheck").each(function () {
		if ($(this).val() == 0)
			$(this).removeClass("alertGreen").addClass("alertRed");
		else
			$(this).removeClass("alertRed").addClass("alertGreen");
	});

	$(document).on("change", ".conditionCheck", function () {
		if ($(this).val() == 0)
			$(this).removeClass("alertGreen").addClass("alertRed");
		else
			$(this).removeClass("alertRed").addClass("alertGreen");
	});
	//Conditiion Check Function

	//select parallel execution
	$(document).on("click", ".selectParallel", function () {
		$(this).find("img").toggleClass("sb");
		$(this).find("svg").toggleClass("sb");
		if ($("img").hasClass('sb') == true || $("svg").hasClass('sb') == true) {
			execAction = "parallel";
		} else {
			execAction = "serial";
		}
	});

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

	//Select Browser Function
	$(document).on("click", ".selectBrowser", function () {
		$(this).find("img").toggleClass("sb");
		$(this).find("svg").toggleClass("sb");
		if ($(this).find("img").hasClass("sb") == false && $(this).find("svg").hasClass("sb") == false) {
			var getSpliceIndex = browserTypeExe.indexOf($(this).data("name").toString());
			browserTypeExe.splice(getSpliceIndex, 1);
		} else {
			browserTypeExe.push($(this).data("name").toString());
		}
		if (browserTypeExe.length > 0) {
			$("#syncScenario").prop("disabled", false);
		} else {
			$("#syncScenario").prop("disabled", true);
		}
	});
	//Select Browser Function
	$("#tableActionButtons, .executionTableDnd").delay(500).animate({opacity: "1"}, 500);
}]);


function loadLocationDetails(scenarioName, scenarioId) {
	angular.element(document.getElementById("left-nav-section")).scope().loadLocationDetails(scenarioName, scenarioId);
}

var openDialogExe = function (title, body, submitflag) {
	if (submitflag == undefined) {
		$("#executeGlobalModal").find('.modal-title').text(title);
		$("#executeGlobalModal").find('.modal-body p').text(body).css('color', 'black');
		$("#executeGlobalModal").modal("show");
		setTimeout(function () {
			$("#executeGlobalModal").find('.btn-accept').focus();
		}, 300);
	} else {
		$("#globalTaskSubmit").find('.modal-title').text(title);
		$("#globalTaskSubmit").find('.modal-body p').text(body);
		$("#globalTaskSubmit").modal("show");
	}
};
