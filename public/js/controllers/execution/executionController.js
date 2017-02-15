mySPA.controller('executionController',['$scope','$http','$timeout','$location','ExecutionService','cfpLoadingBar', function ($scope, $http, $timeout, $location, ExecutionService, cfpLoadingBar) {
	cfpLoadingBar.start();
	var getEachScenario = [] //Contains Each RowData of Scenarios
	var userinfo = {} //Contains Userinfo
	var browserTypeExe = []; // Contains selected browser id for execution
	$("body").css("background","#eee");
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
	}, 500)

	//Task Listing
	loadUserTasks()

	//Loading Project Info
	var getProjInfo = JSON.parse(window.localStorage['_T'])
	$("#page-taskName").empty().append('<span>'+JSON.parse(window.localStorage['_T']).taskName+'</span>')
	$(".projectInfoWrap").empty()
	$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">'+getProjInfo.projectName+'</span></p><p class="proj-info-wrap"><span class="content-label">Module :</span><span class="content">'+getProjInfo.moduleName+'</span></p><p class="proj-info-wrap"><span class="content-label">Screen :</span><span class="content">'+getProjInfo.screenName+'</span></p>')
	//Loading Project Info
	
	//Global Information
	var cycleId = getProjInfo.cycleId;
	var testSuiteId = getProjInfo.testSuiteId;
	var testSuiteName = getProjInfo.testSuiteName;
	//Global Information
	
	//Onload ServiceCall
	$timeout(function(){
		angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
	}, 1000)
	
	$scope.readTestSuite_ICE = function(){
		getEachScenario = []
		ExecutionService.readTestSuite_ICE(cycleId, testSuiteId)
		.then(function(data) {
			cfpLoadingBar.complete();
			rowData = data;
			var row = $("<tbody />");
			$("#executionDataTable tbody tr").remove();
			var count = 1
			//Building object for each row after getting the data from server
			for(i=0; i<rowData.condition.length && rowData.dataparam.length && rowData.executestatus && rowData.scenarioids.length; i++){
				getEachScenario.push({
					"condition" : rowData.condition[i],
					"dataParam" : rowData.dataparam[i],
					"executeStatus" : rowData.executestatus[i],
					"scenarioIds" : rowData.scenarioids[i]
				})
			}
			//Building object for each row after getting the data from server
			
			//Creating Table Rows for each of the Scenarios
			for (var i = 0; i < getEachScenario.length; i++) {
				row = $("<tr id=\"" + count + "\"/>");
				$("#executionDataTable").append(row);
				row.append($("<td class='tabeleCellPadding' style='width:3.9%;' id=\"" + count + "\">"+ count + "</td>"));
				if(getEachScenario[i].executeStatus == undefined || getEachScenario[i].executeStatus == 0){
					row.append($("<td class='tabeleCellPadding exe-ExecuteStatus' style='width: 3%; padding-top: 7px !important'><input ng-checked='executeAll' type='checkbox' title='Select to not execute this scenario' class='doNotExecuteScenario d-execute'></td>"));
				}
				else if(getEachScenario[i].executeStatus == 1){
					row.append($("<td class='tabeleCellPadding exe-ExecuteStatus' style='width:3%; padding-top: 7px !important'><input ng-checked='executeAll' type='checkbox' title='Select to not execute this scenario' class='doNotExecuteScenario d-execute' checked></td>"));
				}
				row.append($("<td class='tabeleCellPadding exe-scenarioIds' sId="+getEachScenario[i].scenarioIds+" style='width: 23%; margin-right: 2%; word-break: break-all; text-align:left'>" + getEachScenario[i].scenarioIds+ "</td>"));
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
				row.append($("<td style='width:23%; word-break: break-all; padding-left: 1% !important; padding-right: 1% !important' class='tabeleCellPadding'>" + getProjInfo.projectName+ "</td>"));
				row.append($("<td style='width:8%' class='tabeleCellPadding'><img src='../imgs/ic-alm.png' id='syncScenario' title='Sync Test Scenario' style='cursor: pointer;'/></td>"));
				count++;
			}
			//Creating Table Rows for each of the Scenarios
		}, 
		function(error) {
			console.log("Error")
		})
	}
	
	
	//Save TestSuite Functionality
	$scope.updateTestSuite = function(){
		var testScenarioIds = [];
		var executeStatus = [];
		var conditionCheck = [];
		var getParamPaths = [];
		userinfo = {
			username : JSON.parse(window.localStorage['_UI']).username,
			role : window.localStorage['_SR']	
		}
		//Getting ScenarioIds
		$.each($(".exe-scenarioIds"), function(){
			testScenarioIds.push($(this).attr("sId"))
		})
		//Getting ScenarioIds
		
		//Getting Execution Status
		$.each($(".exe-ExecuteStatus"), function(){
			if($(this).find("input").is(":checked")) executeStatus.push(1)
			else executeStatus.push(0)
		})
		//Getting Execution Status
		
		//Getting DataParamPaths
		$.each($(".exe-dataParam"), function(){
			getParamPaths.push("\'"+$(this).find("input").val()+"\'")
		})
		//Getting DataParamPaths
		
		//Getting ConditionChecks
		$.each($(".exe-conditionCheck"), function(){
			conditionCheck.push($(this).find("select option:selected").val())
		})
		//Getting ConditionChecks
		ExecutionService.updateTestSuite_ICE(cycleId, testSuiteId, testSuiteName, testScenarioIds, executeStatus, conditionCheck, getParamPaths, userinfo)
		.then(function(data) {
			if(data != "fail"){
				$("#saveSuitesModal").modal("show")
				angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
			}
		}, 
		function(error){})
	}
	//Save TestSuite Functionality
	
	
	//Execute TestSuite Functionality
	$scope.ExecuteTestSuite = function(){
		var selectedRowData = [];
		
		//Getting each row data as an object
		$.each($(".exe-ExecuteStatus"), function(){
			if($(this).find("input").is(":checked")){
				selectedRowData.push({
					condition : parseInt($(this).siblings(".exe-conditionCheck").find("select option:selected").val()),
					dataparam : $(this).siblings(".exe-dataParam").find("input").val(),
					executestatus : 1,
					scenarioids : $(this).siblings(".exe-scenarioIds").attr("sId"),
					scenarionames : $(this).siblings(".exe-scenarioIds").text(),
				})
			}
		})
		//Getting each row data as an object
		
		console.log("selectedRowData:::" + selectedRowData)
		
		if(browserTypeExe.length == 0) $("#selectBrowserAlert").modal("show");
		else if($(".exe-ExecuteStatus input:checked").length == 0) $("#selectScenarioAlert").modal("show");
		else{
			blockUI("Execution in progress. Please Wait...")
			ExecutionService.ExecuteTestSuite_ICE(selectedRowData, browserTypeExe, testSuiteId)
			.then(function(data){
				unblockUI()
				$('#executionCompleted').modal('show');
				$(".selectBrowser").find("img").removeClass("sb");
				browserTypeExe = [];
				angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE()
			},
			function(error){ 
				unblockUI()
				$('#executionFailed').modal('show');
				$(".selectBrowser").find("img").removeClass("sb");
				browserTypeExe = [];
				angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE()
				console.log("Failed to Execute")
			})
		}
	}
	//Execute TestSuite Functionality
	
	
	//Submit Task Function
	$scope.submitTaskExecution = function(){
		$("#submitTasksExecution").modal("show")
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

	
	//Default checked all the checkboxes
	/*$("#parentExecute, .doNotExecuteScenario").prop("checked", true)*/

	$(document).on('click',"#parentExecute", function(){
		if($(this).is(":checked")){
			$(".doNotExecuteScenario").prop("checked", true)
		}
		else{
			$(".doNotExecuteScenario").prop("checked", false)
		}
	})
	//Default checked all the checkboxes

	
	//Do Not Execute Checkboxes
	$(document).on('click',".doNotExecuteScenario", function(){
		var checkedLen =  $(".doNotExecuteScenario:checked").length;
		var totalLen =  $(".doNotExecuteScenario").length;
		if(totalLen == checkedLen){
			$("#parentExecute").prop("checked", true)
		}
		else{
			$("#parentExecute").prop("checked", false)
		}
	})
	//Do Not Execute Checkboxes
	
	
	//Select Browser Function
	$(document).on("click", ".selectBrowser", function(){
		$(this).find("img").toggleClass("sb")
		if($(this).find("img").hasClass("sb") == false) {
			var getSpliceIndex = browserTypeExe.indexOf($(this).data("name"))
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