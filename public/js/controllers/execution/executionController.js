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
	var getTaskName = JSON.parse(window.localStorage['_CT']).taskName;
	appType = JSON.parse(window.localStorage['_CT']).appType;

	$("#page-taskName").empty().append('<span class="taskname">'+getTaskName+'</span>');
	$(".projectInfoWrap").empty()
	testSuiteName = JSON.parse(window.localStorage['_CT']).testSuiteName;

	$timeout(function(){
  		var releaseId = JSON.parse(window.localStorage['_CT']).releaseId;
		var cycleId = JSON.parse(window.localStorage['_CT']).cycleId;
		var projectId = JSON.parse(window.localStorage['_CT']).projectId;
		projectDetails = angular.element(document.getElementById("left-nav-section")).scope().projectDetails;
		ExecutionService.getReleaseNameByReleaseId_ICE(releaseId, projectId) 
		  .then(function(data){
			  releaseName = data;
			  ExecutionService.getCycleNameByCycleId(cycleId, releaseId)
				.then(function(data) {
					cycleName = data;
					$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">'+projectDetails.projectname+'</span></p><p class="proj-info-wrap"><span class="content-label">Release :</span><span class="content">'+releaseName+'</span></p><p class="proj-info-wrap"><span class="content-label">Cycle :</span><span class="content">'+cycleName+'</span></p><p class="proj-info-wrap"><span class="content-label">TestSuite :</span><span class="content">'+testSuiteName+'</span></p>')
				}, 
				function(error) {console.log("Error") })
		  }, function(error) {	console.log("Failed to get release name")});
	}, 3000)
	
	//Global Information
	var cycleId = JSON.parse(window.localStorage['_CT']).cycleId;
	var testSuiteId = JSON.parse(window.localStorage['_CT']).testSuiteId;
	var testSuiteName = JSON.parse(window.localStorage['_CT']).testSuiteName;
	
	//Global Information
	
	//Getting Apptype or Screen Type
	//console.log(appType);
	$scope.getScreenView = appType
	//Getting Apptype orScreen Type
	
	//Onload ServiceCall
	$timeout(function(){
		angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
	}, 1000)
	
	$scope.readTestSuite_ICE = function(){
		getEachScenario = []
		ExecutionService.readTestSuite_ICE(cycleId, testSuiteId,testSuiteName)
		.then(function(data) {
			if(data == ""){}
			else{
				cfpLoadingBar.complete();
				rowData = data;
				var row = $("<tbody />");
				$("#executionDataTable tbody tr").remove();
				var count = 1
				//Building object for each row after getting the data from server
				for(i=0; i<rowData.condition.length && rowData.dataparam.length && rowData.executestatus && rowData.scenarioids.length && rowData.projectnames.length; i++){
					getEachScenario.push({
						"condition" : rowData.condition[i],
						"dataParam" : rowData.dataparam[i],
						"executeStatus" : rowData.executestatus[i],
						"scenarioIds" : rowData.scenarioids[i],
						"scenarionames": rowData.scenarionames[i],
						"projectnames" : rowData.projectnames[i]
					})
				}
				//Building object for each row after getting the data from server
				var projectName=['Project Name'];
				//Creating Table Rows for each of the Scenarios
				for (var i = 0; i < getEachScenario.length; i++) {

					row = $("<tr id=\"" + count + "\"/>");
					$("#executionDataTable").append(row);
					row.append($("<td class='tabeleCellPadding' style='width:3.9%;' id=\"" + count + "\">"+ count + "</td>"));
					if(getEachScenario[i].executeStatus == undefined || getEachScenario[i].executeStatus == 0){
						row.append($("<td class='tabeleCellPadding exe-ExecuteStatus noExe' style='width: 3%; padding-top: 7px !important'><input ng-checked='executeAll' type='checkbox' title='Select to not execute this scenario' class='doNotExecuteScenario d-execute'></td>"));
					}
					else if(getEachScenario[i].executeStatus == 1){
						row.append($("<td class='tabeleCellPadding exe-ExecuteStatus' style='width:3%; padding-top: 7px !important'><input ng-checked='executeAll' type='checkbox' title='Select to not execute this scenario' class='doNotExecuteScenario d-execute' checked></td>"));
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
				//Creating Table Rows for each of the Scenarios
				
				//No Execution Status Marking Red
				$(".noExe").parent("tr").css({'border-left':'4px solid red'});
				$(".noExe").prev().css({'width':'3.5%'})
			}
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
		ExecutionService.loadLocationDetails(scenarioName, scenarioId)
		.then(function(data) {
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
			else{
				$("#saveSuitesModalFail").show();
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
				if(data == "Terminate"){
					$('#executionTerminated').modal('show');
				}
				else if(data == "unavailableLocalServer"){
					$('#executionserverunavailable').modal('show');
				}
				else{
					$('#executionCompleted').modal('show');
				}
				unblockUI()
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

	//check parent checkbox by default if all child checkboxes are checked
	if($("input[type='checkbox']:not(#parentExecute):checked").length == $("input[type='checkbox']:not(#parentExecute)").length)
	{
		$("#parentExecute").prop("checked", true);
	}
	else{
		$("#parentExecute").prop("checked", false);
	}

	
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

function loadLocationDetails(scenarioName, scenarioId){
	angular.element(document.getElementById("left-nav-section")).scope().loadLocationDetails(scenarioName, scenarioId);
}