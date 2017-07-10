var appType;var releaseName;var cycleName;var testSuiteName;
mySPA.controller('executionController',['$scope','$http','$timeout','$location','ExecutionService','cfpLoadingBar', function ($scope, $http, $timeout, $location, ExecutionService, cfpLoadingBar) {
	cfpLoadingBar.start();
	var getEachScenario = [] //Contains Each RowData of Scenarios
	var userinfo = {} //Contains Userinfo
	var browserTypeExe = []; // Contains selected browser id for execution
	var scenarioIdQC;
	
	$("body").css("background","#eee");
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
	}, 500)

	//Task Listing
	loadUserTasks()
	/*var taskAuth;
	if(window.localStorage['_CT'] == "")
	{
		taskAuth = false;
	}*/
	if(window.localStorage['navigateScreen'] != "TestSuite")
	{
		window.location.href = "/";
	}
	var getTaskName = JSON.parse(window.localStorage['_CT']).taskName;
	appType = JSON.parse(window.localStorage['_CT']).appType;

	//Task Name Commented
	//$("#page-taskName").empty().append('<span class="taskname">'+getTaskName+'</span>');
	$(".projectInfoWrap").empty()
	testSuiteName = JSON.parse(window.localStorage['_CT']).testSuiteName;

	$timeout(function(){
  		//var releaseId = JSON.parse(window.localStorage['_CT']).releaseId;
	//	var cycleId = JSON.parse(window.localStorage['_CT']).cycleId;
	//	var projectId = JSON.parse(window.localStorage['_CT']).projectId;
		//projectDetails = angular.element(document.getElementById("left-nav-section")).scope().projectDetails;
		// releaseName = angular.element(document.getElementById("left-nav-section")).scope().releaseDetails.respnames[0];
		// cycleName = angular.element(document.getElementById("left-nav-section")).scope().cycleDetails.respnames[0];
		// if(projectDetails.respnames[0] !="" &&  releaseName!="" && cycleName !="" && testSuiteName != "")
		// {
		// 	$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">'+projectDetails.respnames[0]+'</span></p><p class="proj-info-wrap"><span class="content-label">Release :</span><span class="content">'+releaseName+'</span></p><p class="proj-info-wrap"><span class="content-label">Cycle :</span><span class="content">'+cycleName+'</span></p><p class="proj-info-wrap"><span class="content-label">TestSuite :</span><span class="content">'+testSuiteName+'</span></p>')
		// }
	}, 2000)
	
	//Global Information
	// var cycleId = JSON.parse(window.localStorage['_CT']).cycleId;
	// var testSuiteId = JSON.parse(window.localStorage['_CT']).testSuiteId;
	// var testSuiteName = JSON.parse(window.localStorage['_CT']).testSuiteName;
	var assignedTestScenarioId = JSON.parse(window.localStorage['_CT']).assignedTestScenarioIds;


	if(window.localStorage['_CT'])
	{
		var readTestSuite = JSON.parse(window.localStorage['_CT']).testSuiteDetails;
		console.log("read",readTestSuite);
	}
	
	//Global Information
	
	//Getting Apptype or Screen Type
	//console.log(appType);
	$scope.getScreenView = appType
	//Getting Apptype orScreen Type
	
	//Onload ServiceCall
	$timeout(function(){
		angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
	}, 1000)

		//readTestSuite service input
		
	// var readTestSuite = [{
	// 		"assignedTestScenarioIds": ["deb28c38-f338-4491-8cd4-7bb0ef87c79e"],
	// 		"cycleid":"b0a7e66b-a459-40b8-991c-dcaa29f8912b",
	// 		"projectidts":"5122b95c-84ad-40fd-9f10-e29988323fb5",
	// 		"releaseid":"8b4878e7-9b8c-48e9-8d92-348a72f390a5",
	// 		"testsuiteid":"139b6815-e2a9-4df0-9b08-5274f08d7bc8",
	// 		"testsuitename":"Module_web3"
	// 		},{
	// 		"assignedTestScenarioIds": ["deb28c38-f338-4491-8cd4-7bb0ef87c79e"],
	// 		"cycleid":"b0a7e66b-a459-40b8-991c-dcaa29f8912b",
	// 		"projectidts":"5122b95c-84ad-40fd-9f10-e29988323fb5",
	// 		"releaseid":"8b4878e7-9b8c-48e9-8d92-348a72f390a5",
	// 		"testsuiteid":"139b6815-e2a9-4df0-9b08-5274f08d7bc8",
	// 		"testsuitename":"Module_web3"
	// 		}]
	
		$scope.readTestSuite_ICE = function(){
	
		ExecutionService.readTestSuite_ICE(readTestSuite)
		.then(function(data) {
			// var data ={
			// 			"Testsuitename1": {
			// 				"executestatus": [1, 1],
			// 				"condition": [0, 0],
			// 				"dataparam": [" ", " "],
			// 				"scenarioids": ["0e86ff7a-97a7-45be-8e97-473ad881dbce", "0e86ff7a-97a7-45be-8e97-473ad881dbce"],
			// 				"scenarionames": ["Module_Scenario1", "Module_Scenario2"],
			// 				"projectnames": ["New Project_SLK_1", "New Project_SLK_2"]
			// 			},
			// 			"Testsuitename2": {
			// 				"executestatus": [1, 1],
			// 				"condition": [0, 0],
			// 				"dataparam": [" ", " "],
			// 				"scenarioids": ["0e86ff7a-97a7-45be-8e97-473ad881dbce", "0e86ff7a-97a7-45be-8e97-473ad881dbce"],
			// 				"scenarionames": ["Module_Scenario3", "Module_Scenario4"],
			// 				"projectnames": ["New Project_SLK_3", "New Project_SLK_4"]
			// 			}
            //           }

			//var jsonData = JSON.parse(data);
			if(data == "Invalid Session"){
					window.location.href = "/";
			 }
			if(data == ""){}
			else{
				$(".executionTableDnd").empty()
				cfpLoadingBar.complete();
				// console.log("Jdata", data);
				 var dataLen = Object.keys(data).length;
				 for(var m =0;m<dataLen;m++)
				 {
					getEachScenario = []; // Empty scenarios for each module
					//create header for table
					$("#executionDataTable_"+m+" tbody tr").remove();
					var keys = Object.keys(data);
				//	var eachData = Object.values(data);
					var eachData = Object.keys(data).map(function(itm) { return data[itm]; });
					eachData = eachData[m];
					rowData = eachData;
					$("div.executionTableDnd").attr('id','batch_'+m);
					//console.log("TBODY", $("tbody").text());
					$("#batch_"+m+"").append("<div class='suiteNameTxt' id='page-taskName_"+m+"'><span class='taskname'><input id='parentSuite_"+m+"' class='parentSuiteChk' type='checkbox' name='' />"+keys[m]+"</span></div><div id='exeData_"+m+"' class='exeDataTable testSuiteBatch'><table id='executionDataTable_"+m+"' class='executionDataTable' cellspacing='0' cellpadding='0'><thead><tr><th style='width: 4%' id='contextmenu'></th><th style='width: 3%; padding: 5px 0px'><i class='fa fa-ban' title='Do Not Execute' aria-hidden='true' style='font-size: 14px;'></i><input id='parentExecute_"+m+"' class='d-execute' type='checkbox' /></th>	<th style='width: 25%; text-align:left; border-right: 1px solid #fff;'>Scenario Name</th><th style='width: 22%; border-right: 1px solid #fff'>Data Parameterization</th>	<th style='width: 15%; border-right: 1px solid #fff'>Condition</th><th style='width: 23%; border-right: 1px solid #fff'>Project Name</th><th style='width: 8%; text-align: center;'>ALM</th></tr><input type='hidden' value='"+rowData.testsuiteid+"'/></thead><tbody class='scrollbar-inner testScenarioScroll'></tbody></table></div>");
				

				    var row = $("#executionDataTable_"+m+"").find('tbody');
					//var row = $("<tbody />");
					console.log("row",row);
					var count = 1

					//Building object for each row after getting the data from server
					for(var k=0; k<rowData.scenarioids.length; k++){
						if(JSON.parse(window.localStorage['_CT']).scenarioFlag == 'True'){
							if(rowData.scenarioids[k] == assignedTestScenarioId){
								getEachScenario.push({
									"condition" : rowData.condition[k],
									"dataParam" : rowData.dataparam[k],
									"executeStatus" : rowData.executestatus[k],
									"scenarioIds" : rowData.scenarioids[k],
									"scenarionames": rowData.scenarionames[k],
									"projectnames" : rowData.projectnames[k],
									"testSuiteId": rowData.testsuiteid[k]
								})							
							}
						}
						else{
							getEachScenario.push({
								"condition" : rowData.condition[k],
								"dataParam" : rowData.dataparam[k],
								"executeStatus" : rowData.executestatus[k],
								"scenarioIds" : rowData.scenarioids[k],
								"scenarionames": rowData.scenarionames[k],
								"projectnames" : rowData.projectnames[k],
								"testSuiteId": rowData.testsuiteid[k]
							})
						}
					}

					//Building object for each row after getting the data from server
				var projectName=['Project Name'];
				//Creating Table Rows for each of the Scenarios
				for (var i = 0; i < getEachScenario.length; i++) {

					row = $("<tr id=\"" + count + "\"/>");
					$("#executionDataTable_"+m+"").append(row);
					row.append($("<td class='tabeleCellPadding' style='width:3.7%;' id=\"" + count + "\">"+ count + "</td>"));
					if(getEachScenario[i].executeStatus == undefined || getEachScenario[i].executeStatus == 0){
						row.append($("<td class='tabeleCellPadding exe-ExecuteStatus noExe' style='width: 3%; padding-top: 7px !important'><input ng-checked='executeAll' type='checkbox' title='Select to execute this scenario' class='doNotExecuteScenario d-execute'></td>"));
					}
					else if(getEachScenario[i].executeStatus == 1){
						row.append($("<td class='tabeleCellPadding exe-ExecuteStatus' style='width:3%; padding-top: 7px !important'><input ng-checked='executeAll' type='checkbox' title='Select to execute this scenario' class='doNotExecuteScenario d-execute' checked></td>"));
					}
					row.append($("<td class='tabeleCellPadding exe-scenarioIds' onclick='loadLocationDetails(this.innerHTML, this.getAttribute(\"sId\"))' sId="+getEachScenario[i].scenarioIds+" style='width: 23%; margin-right: 2%; cursor:pointer; word-break: break-all; text-align:left'>" + getEachScenario[i].scenarionames+ "</td>"));
					if(getEachScenario[i].dataParam == undefined){
						row.append($('<td style="width: 22%" class="tabeleCellPadding exe-dataParam"><input class="getParamPath form-control" type="text" value=""/></td>'));
					}
					else {
						row.append($('<td style="width: 22%" class="tabeleCellPadding exe-dataParam"><input class="getParamPath form-control" type="text" value="'+ getEachScenario[i].dataParam +'"/></td>'));
					}
					if(getEachScenario[i].condition == 0){
						row.append($('<td style="width:15%" class="tabeleCellPadding exe-conditionCheck"><select class="conditionCheck form-control alertRed"><option value="1">True</option><option value="'+getEachScenario[i].condition+'" selected>False</option></select> </td>'));
					}
					else{
						row.append($('<td style="width:15%" class="tabeleCellPadding exe-conditionCheck"><select class="conditionCheck form-control alertGreen"><option value="'+getEachScenario[i].condition+'" selected>True</option><option value="0">False</option></select> </td>'));
					}
					row.append($("<td style='width:23%; word-break: break-all; padding-left: 1% !important; padding-right: 1% !important' class='tabeleCellPadding'>" + getEachScenario[i].projectnames + "</td>"));
					row.append($("<td style='width:8%' class='tabeleCellPadding'><img src='../imgs/ic-alm.png' id='syncScenario' title='Sync Test Scenario' style='cursor: pointer;'/></td>"));
					count++;
				    }
					//No Execution Status Marking Red
					$(".noExe").parent("tr").css({'border-left':'4px solid red'});
					$(".noExe").prev().css({'width':'calc(3.9% - 4px)'})

					//check,uncheck parentSuite onload
					$('#parentExecute_'+m).each(function() {
						var checkedLen = $(this).parents('table').find('tbody tr input[type=checkbox]:checked').length;
						if(parseInt(checkedLen) > 0)
							$('#parentSuite_'+m).prop("checked", true);
						else
							$('#parentSuite_'+m).prop("checked", false);
						var totalLen =  $(this).parents('table').find('tbody tr input[type=checkbox]').length;
						if(totalLen == checkedLen)
						{
							$('#parentExecute_'+m).prop("checked", true);
							//$('#parentSuite_'+m).prop("checked", true);
						}
						else{
							$('#parentExecute_'+m).prop("checked", false);
							//$('#parentSuite_'+m).prop("checked", false);
						}
					});

					//check parent checkbox by default if all child checkboxes are checked
					if($("#executionDataTable_"+m+" tbody tr").length == $("#executionDataTable_"+m+" tbody tr td.exe-ExecuteStatus input:checked").length)
					{
						$("#parentExecute").prop("checked", true);
						
					}
					else{
						$("#parentExecute").prop("checked", false);
					}
				 }
				 if(dataLen == $(".parentSuiteChk:checked").length)
				 {
					 $(".checkStylebox").prop("checked", true);
				 }
				 else{
					 $(".checkStylebox").prop("checked", false);
				 }

				 	$('[id^=parentExecute_]').on('click',function(e){
						if($(this).is(":checked") == true)
						{
							$(this).parents('table').find('tbody tr input[type=checkbox]').prop('checked', true);
							$(this).parents('table').parent().prev().children('span').children('input').prop('checked', true);
						}
						else{
							$(this).parents('table').find('tbody tr input[type=checkbox]').prop('checked', false);
							$(this).parents('table').parent().prev().children('span').children('input').prop('checked', false);
						}
					var moduleLen = $('[id^=parentSuite_]:checked').length;
					var totalModuleLen =  $('[id^=parentSuite_]').length;
					if(moduleLen == totalModuleLen)
					{
						$("input[type='checkbox'].checkStylebox").prop('checked', true);
					}
					else{
						$("input[type='checkbox'].checkStylebox").prop('checked', false);
					}
					});
				
				$('[id^=executionDataTable]').find('tbody tr td input').on('click',function(e){
					var totalLen = $(this).parent().parent().parent().children().find('input[type=checkbox]').length;
					var checkedLen = $(this).parent().parent().parent().children().find('input[type=checkbox]:checked').length;
					if(totalLen == checkedLen)
					{
						$(this).parents('table').find('thead input[type=checkbox]').prop('checked', true);
					}
					else{
						$(this).parents('table').find('thead input[type=checkbox]').prop('checked', false);
					}
					if(checkedLen > 0)
					{
						$(this).parents('table').parent().prev().children('span').children('input[type=checkbox]').prop('checked', true);
					}
					else{
						$(this).parents('table').parent().prev().children('span').children('input[type=checkbox]').prop('checked', false);
					}
					var moduleLen = $('[id^=parentSuite_]:checked').length;
					var totalModuleLen =  $('[id^=parentSuite_]').length;
					if(moduleLen == totalModuleLen)
					{
						$("input[type='checkbox'].checkStylebox").prop('checked', true);
					}
					else{
						$("input[type='checkbox'].checkStylebox").prop('checked', false);
					}
				});

				 $('[id^=parentSuite_]').on('click',function(e){
					if($(this).is(":checked") == true)
						{
							$(this).parents('.suiteNameTxt').next().children().find('input[type=checkbox]').prop('checked', true);
						}
					else{
						$(this).parents('.suiteNameTxt').next().children().find('input[type=checkbox]').prop('checked', false);
					}
					 var checkedLen = $('[id^=parentSuite_]:checked').length;
					 var totalLen = $('[id^=parentSuite_]').length;
					 if(checkedLen == totalLen)
					 {
						$("input[type='checkbox'].checkStylebox").prop('checked', true);
					 }
					 else
					 {
						 $("input[type='checkbox'].checkStylebox").prop('checked', false);
					 }
				 });

				 $("input[type='checkbox'].checkStylebox").on('click',function(e){
						if($(this).is(":checked") == true)
						{
							$('[id^=parentSuite_]').prop('checked', true);
							$('[id^=parentExecute_]').prop('checked', true);
							$("tbody").find('input[type=checkbox]').prop('checked', true);
						}
						else{
							$('[id^=parentSuite_]').prop('checked', false);
							$('[id^=parentExecute_]').prop('checked', false);
							$("tbody").find('input[type=checkbox]').prop('checked', false);
						}
				  });

			}

			//select all checkboxes by default on load
			//$("input[type=checkbox]:visible").prop('checked',true)
			
			// //check parent checkbox by default if all child checkboxes are checked
			// if($("#executionDataTable_"+m+" tbody tr").length == $("#executionDataTable_"+m+" tbody tr td.exe-ExecuteStatus input:checked").length)
			// {
			// 	$("#parentExecute").prop("checked", true);
			// }
			// else{
			// 	$("#parentExecute").prop("checked", false);
			// }
			//}
		}, 
		function(error) {
			console.log("Error")
		})
	};
	
	//Load Location Details of Scenario
	$scope.loadLocationDetails = function(scenarioName, scenarioId) {
		//document.getElementById("scenarioDetailsContent").innerHTML = "";
		$("#scenarioDetailsContent").empty();
		$("#modalScenarioDetails").find(".modal-title").text(scenarioName);
		$("#modalScenarioDetails").modal("show");
		$('#modalScenarioDetails').find('.btn-default').focus();
		ExecutionService.loadLocationDetails(scenarioName, scenarioId)
		.then(function(data) {
			if(data == "Invalid Session"){
					window.location.href = "/";
			 }
			for(i=0; i<data.projectnames.length && data.testcasenames.length && data.screennames.length; i++){
				//document.getElementById("scenarioDetailsContent").innerHTML += '<div class="sDInnerContentsWrap"><div class="sDInnerContents">'+data.testcasenames[i]+'</div><div class="sDInnerContents">'+data.screennames[i]+'</div><div class="sDInnerContents">'+data.projectnames[i]+'</div></div>'
				$("#scenarioDetailsContent").append('<div class="sDInnerContentsWrap"><div class="sDInnerContents">'+data.testcasenames[i]+'</div><div class="sDInnerContents">'+data.screennames[i]+'</div><div class="sDInnerContents">'+data.projectnames[i]+'</div></div>')
			}
		}, 
		function(error){
			console.log(error)
		})
	}
	//Load Location Details of Scenario
	
	
	//Save TestSuite Functionality
	$scope.updateTestSuite = function(){
		var batchInfo = [];
		var batchDetails = {};
		userinfo = {
				username : JSON.parse(window.localStorage['_UI']).username,
				role : window.localStorage['_SR']	
		}
		//updateTestSuite
		var loopingtimes=0;
		$.each($(".parentSuiteChk"), function(){
			var suiteInfo = {};
			var suiteDetails = {};
			var testSuiteName = "";
			var testSuiteId = "";
			var testScenarioIds = [];
			var getParamPaths = [];
			var conditionCheck = [];
			var executeStatus = [];
			if(window.localStorage['_CT']){
				var cycleid = JSON.parse(window.localStorage['_CT']).testSuiteDetails;
			}
			//if($(this).is(":checked") == true){
			//Getting ScenarioIds
			$.each($(this).parents('.suiteNameTxt').next('div').find('.exe-scenarioIds'), function(){
				testScenarioIds.push($(this).attr("sId"));
				getParamPaths.push("\'"+$(this).parent().find(".getParamPath").val().trim()+"\'");
				conditionCheck.push($(this).parent().find(".conditionCheck option:selected").val());
				if($(this).parent().find(".doNotExecuteScenario").is(":checked")) 
					executeStatus.push(1);
				else
					executeStatus.push(0);
			})
			/*//Getting DataParamPaths
				$.each($(this).parents('.suiteNameTxt').next('div').find('.exe-dataParam'), function(){
					getParamPaths.push("\'"+$(this).find("input").val()+"\'")
				})
				//Getting ConditionChecks
				$.each($(this).parents('.suiteNameTxt').next('div').find('.exe-conditionCheck'), function(){
					conditionCheck.push($(this).find("select option:selected").val())
				})
				//Getting Execution Status
				$.each($(this).parents('.suiteNameTxt').next('div').find('.exe-ExecuteStatus'), function(){
					if($(this).find("input").is(":checked")) executeStatus.push(1)
					else executeStatus.push(0)
				})*/
			testSuiteName = $(this).parents('span.taskname').text();
			testSuiteId =  $(this).parents('.suiteNameTxt').next().find('thead').children('input[type=hidden]').val();
			// console.log("testScenarioIds",testScenarioIds);
			// console.log("getParamPaths",getParamPaths);
			// console.log("conditionCheck",conditionCheck);
			// console.log("executeStatus",executeStatus);
			// console.log("suiteName", testSuiteName);
			// console.log("suiteId", testSuiteId);
			// console.log("cycleId", cycleId);// cycleId to be changed from taskJson
			// suiteDetails.push({
			// 		testSuiteId: testSuiteId,
			// 		testSuiteName: testSuiteName,
			// 		testScenarioIds :testScenarioIds,
			// 		getParamPaths : getParamPaths,
			// 		conditionCheck : conditionCheck,
			// 		executeStatus : executeStatus,
			// 		testscycleid : cycleId
			// 	})
			suiteDetails.requestedtestsuiteid = testSuiteId;
			suiteDetails.requestedtestsuitename= testSuiteName;
			suiteDetails.testscenarioids =testScenarioIds;
			suiteDetails.getparampaths = getParamPaths;
			suiteDetails.conditioncheck = conditionCheck;
			suiteDetails.donotexecute = executeStatus;
			suiteDetails.testscycleid = JSON.parse(window.localStorage['_CT']).testSuiteDetails[loopingtimes].cycleid;
			//console.log("suiteDetails",suiteDetails);
			suiteInfo[testSuiteName] = suiteDetails;
			//console.log("suiteInfo", suiteInfo);
			batchInfo.push(suiteInfo);
			//console.log("batchInfo", batchInfo);
			batchDetails.suiteDetails = batchInfo;
			batchDetails.userinfo = userinfo;
			loopingtimes = loopingtimes + 1;
			//console.log("batchDetails",batchDetails);
			//}
		});
		console.log("batchdetails",batchDetails);
		//Getting ConditionChecks
		ExecutionService.updateTestSuite_ICE(batchDetails)
		.then(function(data) {
			if(data == "Invalid Session"){
				window.location.href = "/";
			}
			if(data != "fail"){
				openDialogExe("Save Test Suite", "Test suite saved successfully.")
				//$("#saveSuitesModal").modal("show")
				angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
			}
			else{
				openDialogExe("Save Test Suite", "Failed to save test suite.")
				//$("#saveSuitesModalFail").show();
				angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
			}
		}, 
		function(error){})
	}
	//Save TestSuite Functionality
	
	
	//Execute TestSuite Functionality
	$scope.ExecuteTestSuite = function(){
		var moduleInfo = [];
		$.each($(".parentSuiteChk"), function(){
			var suiteInfo = {};
			var selectedRowData = [];
			//suiteInfo.suiteDetails = [];
			if($(this).is(":checked") == true){
				$(this).parent().parent().next().find('tbody input[type=checkbox]:checked').each(function() {
					selectedRowData.push({
						condition : parseInt($(this).parent().siblings(".exe-conditionCheck").find("select option:selected").val()),
						dataparam : [$(this).parent().siblings(".exe-dataParam").find("input").val().trim()],
						executestatus : 1,
						scenarioids : $(this).parent().siblings(".exe-scenarioIds").attr("sId"),
					})
				});
				//console.log("selectedRowData:::" + selectedRowData)
				suiteInfo.suiteDetails = selectedRowData;
				suiteInfo.testsuitename = $(this).parents('span.taskname').text();
				suiteInfo.testsuiteid = $(this).parents('.suiteNameTxt').next().find('thead').children('input[type=hidden]').val();
				suiteInfo.browserType = browserTypeExe;
				//console.log("suiteInfo:::" + suiteInfo)
				moduleInfo.push(suiteInfo);
			}
		});
		console.log("moduleInfo:::" + moduleInfo)
		//moduleInfo.push(suiteInfo);
		//Getting each row data as an object
		if(appType != "SAP" && browserTypeExe.length == 0)	openDialogExe("Execute Test Suite", "Please select a browser")//$("#selectBrowserAlert").modal("show");
		else if($(".exe-ExecuteStatus input:checked").length == 0) openDialogExe("Execute Test Suite", "Please select atleast one scenario(s) to execute")//$("#selectScenarioAlert").modal("show");
		else{
			if(appType == "SAP") browserTypeExe = ["1"];
			blockUI("Execution in progress. Please Wait...")
			ExecutionService.ExecuteTestSuite_ICE(moduleInfo)
			.then(function(data){
				if(data == "Invalid Session"){
					window.location.href = "/";
				}
				if(data == "Terminate"){
					$('#executionTerminated').modal('show');
					$('#executionTerminated').find('.btn-default').focus();
				}
				else if(data == "unavailableLocalServer"){
					openDialogExe("Execute Test Suite", "ICE Engine is not available. Please run the batch file and connect to the Server.")
					//$('#executionserverunavailable').modal('show');
				}
				else{
					$('#executionCompleted').modal('show');
					setTimeout(function(){
						$("#executionCompleted").find('.btn-default').focus();					
					}, 300);
				}
				unblockUI()
				$(".selectBrowser").find("img").removeClass("sb");
				browserTypeExe = [];
				angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE()
			},
			function(error){ 
				unblockUI()
				openDialogExe("Execute Failed", "Failed to execute.")
				//$('#executionFailed').modal('show');
				$(".selectBrowser").find("img").removeClass("sb");
				browserTypeExe = [];
				angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE()
			})
		}
	}
	//Execute TestSuite Functionality
	
	
	//ALM Functionality
	$(document).on("click", "#syncScenario", function(){
		scenarioIdQC = $(this).parent().siblings("td:nth-child(3)").attr("sId")
		$("#ALMSyncWindow").modal("show");
		$("#almURL, #almUserName, #almPassword, #almDomainName, #almProjectName, #almTestSetName, #almTestCaseName, #almFolderPath").val('')
		$("#almFolderPath").val('Root\\')
		/*ExecutionServices.getQcScenarioDetails(scenarioIdQC)	
		.then(function(data) {
			console.log(data)
		},
		function(error) {
			console.log("Error while traversing executionController.js file testConnection method!! \r\n "+(error.data));
		});*/
	})
	
	$scope.testConnection = function(){
		$scope.errorMessage2 = "";
		$("#almURL, #almUserName, #almPassword").removeClass('inputErrorBorder')
		if(!$scope.almURL) {
			$scope.errorMessage2 = "Enter ALM Url";
			$("#almURL").addClass('inputErrorBorder')
		}
		else if(!$scope.almUserName){
			$scope.errorMessage2 = "Enter User Name";
			$("#almUserName").addClass('inputErrorBorder')
		}
		else if(!$scope.almPassword){
			$scope.errorMessage2 = "Enter Password";
			$("#almPassword").addClass('inputErrorBorder')
		}
		else{
			$scope.errorMessage2 = "";
			$("#almURL, #almUserName, #almPassword").removeClass('inputErrorBorder')
			var alURL = $scope.almURL;
			var almUserName = $scope.almUserName;
			var almPassword = $scope.almPassword;
			/*ExecutionService.QClogin(alURL,almUserName,almPassword)
			.then(function(data) {
				console.log(data)
			},
			function(error) {
				console.log("Error while traversing executionController.js file testConnection method!! \r\n "+(error.data));
			});*/
		}
	};
	
	$scope.saveQcScenarioDetails = function(){
		$scope.errorMessage3 = "";
		$("#almDomainName, #almProjectName, #almTestSetName, #almTestCaseName, #almFolderPath").removeClass('inputErrorBorder')
		if(!$scope.almDomainName) {
			$scope.errorMessage3 = "Enter Domain Name";
			$("#almDomainName").addClass('inputErrorBorder')
		}
		else if(!$scope.almProjectName){
			$scope.errorMessage3 = "Enter Project Name";
			$("#almProjectName").addClass('inputErrorBorder')
		}
		else if(!$scope.almTestSetName){
			$scope.errorMessage3 = "Enter Testset Name";
			$("#almTestSetName").addClass('inputErrorBorder')
		}
		else if(!$scope.almTestCaseName){
			$scope.errorMessage3 = "Enter Testcase Name";
			$("#almTestCaseName").addClass('inputErrorBorder')
		}
		else if(!$scope.almFolderPath){
			$scope.errorMessage3 = "Enter Folder Name";
			$("#almFolderPath").addClass('inputErrorBorder')
		}
		else{
			$scope.errorMessage3 = "";
			$("#almDomainName, #almProjectName, #almTestSetName, #almTestCaseName, #almFolderPath").removeClass('inputErrorBorder')
			var domainName = $scope.almDomainName;
			var projectName = $scope.almProjectName;
			var testSetName = $scope.almTestSetName;
			var testCaseName = $scope.almTestCaseName;
			var folderPath = $scope.almFolderPath;
			/*ExecutionServices.saveQcScenarioDetails(scenarioIdQC,domainName,projectName,testSetName,testCaseName,folderPath)	
			.then(function(data) {
				console.log(data)
			},
			function(error) {
				console.log("Error while traversing executionController.js file testConnection method!! \r\n "+(error.data));
			});*/
		}
	}
	//ALM Functionality
	
	
	//Submit Task Function
	$scope.submitTaskExecution = function(){
		$("#submitTasksExecution").modal("show")
		$('#submitTasksExecution').find('.btn-default-yes').focus();
	}
	//Submit Task Function
	
	
	//Conditiion Check Function 
	$(".conditionCheck").each(function(){
		if($(this).val() == 0) $(this).removeClass("alertGreen").addClass("alertRed");
		else $(this).removeClass("alertRed").addClass("alertGreen");
	})

	$(document).on("change", ".conditionCheck", function(){
		if($(this).val() == 0) $(this).removeClass("alertGreen").addClass("alertRed")
		else $(this).removeClass("alertRed").addClass("alertGreen")
	})
	//Conditiion Check Function 
	
	
	//Select Browser Function
	$(document).on("click", ".selectBrowser", function(){
		$(this).find("img").toggleClass("sb")
		if($(this).find("img").hasClass("sb") == false) {
			var getSpliceIndex = browserTypeExe.indexOf(''+$(this).data("name")+'')
			browserTypeExe.splice(getSpliceIndex, 1)
		}
		else {
			//browserTypeExe.push($(this).data("name"))
			browserTypeExe.push(''+$(this).data("name")+'')
		}
		console.log(browserTypeExe)
	})
	//Select Browser Function

	$("#tableActionButtons, .executionTableDnd").delay(500).animate({opacity:"1"}, 500)
}]);

function loadLocationDetails(scenarioName, scenarioId){
	angular.element(document.getElementById("left-nav-section")).scope().loadLocationDetails(scenarioName, scenarioId);
}

function openDialogExe(title, body){
	$("#executeGlobalModal").find('.modal-title').text(title);
    $("#executeGlobalModal").find('.modal-body p').text(body).css('color','black');
	$("#executeGlobalModal").modal("show");
	setTimeout(function(){
		$("#executeGlobalModal").find('.btn-accept').focus();					
	}, 300);
}