mySPA.controller('qcController',['$scope', '$rootScope', '$window','$http','$location','$timeout','qcServices','cfpLoadingBar', 'socket', function($scope, rootScope, $window,$http,$location,$timeout,qcServices,cfpLoadingBar,socket) {
	$('.scrollbar-inner').scrollbar();
	var nineteen68_projects_details;
	$scope.domainData;
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerText = new Date().getFullYear();
		$("#testPlanTab").trigger("click");
		$("#loginToQCpop").modal("show");
	}, 500)
	var mappedList = [];
	if(window.localStorage['navigateScreen'] != "p_ALM"){
		$rootScope.redirectPage();
	}

	$(".selectBrowser").click(function(){
		$(".selectBrowser").find("img").removeClass("selectedIcon");
		$(this).find("img").addClass("selectedIcon");
	})
	$scope.loadDomains = function(){
		var domainData = $scope.domainData;
		if(domainData){
			$timeout(function(){
				if((domainData != undefined || domainData != "") && domainData.domain.length > 0){
					$(".qcSelectDomain").empty();
					$(".qcSelectDomain").append("<option selected disabled>Select Domain</option>")
					for(var i=0;i<domainData.domain.length;i++){
						$(".qcSelectDomain").append("<option value='"+domainData.domain[i]+"'>"+domainData.domain[i]+"</option>");
					}
				}
			}, 500)
		}
	}

	socket.on('ICEnotAvailable', function () {
		unblockUI();
		openModelPopup("ALM Connection", "ICE Engine is not available, Please run the batch file and connect to the Server.")
	});

	//login to QC
	$scope.loginQCServer = function(){
		$(".qcLoginload").show();
		$("#qcName,#qcUserName,#qcPwd,.qcConnsubmit").prop("disabled",true);
		$("#qcName,#qcUserName,#qcPwd").css("background","none");
		$("#qcErrorMsg").text("");
		$("#qcName,#qcUserName,#qcPwd").removeClass("inputErrorBorder");
		var qcURL = $("#qcName").val();
		var qcUserName = $("#qcUserName").val();
		var qcPassword = $("#qcPwd").val();
		if(!qcURL){
			$("#qcName").addClass("inputErrorBorder");
			$(".qcLoginload").hide();
		}
		else if(!qcUserName){
			$("#qcUserName").addClass("inputErrorBorder");
			$(".qcLoginload").hide();
		}
		else if(!qcPassword){
			$("#qcPwd").addClass("inputErrorBorder");
			$(".qcLoginload").hide();
		}
		else{
			$("#qcPwd").removeClass("inputErrorBorder");
			qcServices.loginQCServer_ICE(qcURL,qcUserName,qcPassword)
			.then(function(data){
				$scope.domainData = data;
				$(".qcLoginload").hide();
				$("#qcName,#qcUserName,#qcPwd,.qcConnsubmit").prop("disabled",false);
				if(data == "unavailableLocalServer"){
					$("#qcErrorMsg").text("ICE Engine is not available,Please run the batch file and connect to the Server.");
				}
				else if(data == "scheduleModeOn")
				{
					$("#qcErrorMsg").text("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
				}
				else if(data == "Invalid Session"){
					$("#qcErrorMsg").text("Invalid Session");
				}
				else if(data == "invalidcredentials"){
					$("#qcErrorMsg").text("Invalid Credentials");
				}
				else if(data == "invalidurl"){
					$("#qcErrorMsg").text("Invalid URL");
				}			
				else if(data){
					$(".qcSelectDomain").empty();
					$(".qcSelectDomain").append("<option selected disabled>Select Domain</option>")
					for(var i=0;i<data.domain.length;i++){
						$(".qcSelectDomain").append("<option value='"+data.domain[i]+"'>"+data.domain[i]+"</option>");
					}
					$("#loginToQCpop").modal("hide");
					$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">User Name :</span><span class="content">'+qcUserName+'</span></p>')
				}
			},
			function(error) {	console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
			});
		}
	} 

	$scope.goBacktoPlugin = function(){
		window.localStorage['navigateScreen'] = "plugin";
		window.location.assign('plugin');
	}

	$scope.hideMappedFilesTab = function(){
		$scope.testLabGenerator = false;
		$(".mappedFiles, .mappedFilesLabel").hide();
		$("#page-taskName span").text("ALM Integration");
		$(".qcActionBtn, .leftQcStructure, .rightQcStructure").show();
	}

	//Select Domains
	$(document).on('change', ".qcSelectDomain", function(){
		$(document.body).css({'cursor' : 'wait'});
		$(".qcSelectDomain, .qcSelectProject").prop("disabled", true);
		var getDomain = $(this).children("option:selected").val();
		blockUI('Loading....');
		qcServices.qcProjectDetails_ICE(getDomain)
			.then(function(data){
				nineteen68_projects_details = data.nineteen68_projects;
				if(data == "unavailableLocalServer"){
					openModelPopup("ALM Connection", "ICE Engine is not available, Please run the batch file and connect to the Server.")
				}	
				else if(data == "scheduleModeOn")
				{
					openModelPopup("ALM Connection", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.")
				}
				else if(data == "Invalid Session"){
					openModelPopup("ALM Connection", "Invalid Session")
				}
				else if(data){
					$(".qcSelectProject").empty();
					$(".qcSelectProject").append("<option value='' selected disabled>Select Project</option>");
					for(var i=0;i<data.qc_projects.length;i++){
						$(".qcSelectProject").append("<option value='"+data.qc_projects[i]+"'>"+data.qc_projects[i]+"</option>");
					}
					$(".qcN68SelectProject").empty();					
					$(".qcN68SelectProject").append("<option value='' selected disabled>Select Project</option>");
					for(var i=0;i<data.nineteen68_projects.length;i++){
						$(".qcN68SelectProject").append("<option value='"+data.nineteen68_projects[i].project_id+"'>"+data.nineteen68_projects[i].project_name+"</option>");
					}
					$(document.body).css({'cursor' : 'default'});
				}
				$(".qcSelectDomain, .qcSelectProject").prop("disabled", false);
				unblockUI();
			},
			function(error) {	unblockUI(); 
				console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
			});
	})

	//Select QC projects
	$(document).on("change", ".qcSelectProject", function(){
		var getProjectName = $(".qcSelectProject option:selected").val();
		var getDomainName = $(".qcSelectDomain option:selected").val();
		blockUI("Loading...");
		qcServices.qcFolderDetails_ICE("folder",getProjectName,getDomainName,"root")
			.then(function(data){
				var structContainer = $(".qcTreeContainer");
				structContainer.empty();
				structContainer.append("<ul class='root scrollbar-inner'><li class='testfolder_'><img class='qcCollapse' title='expand' style='height: 16px;' src='imgs/ic-qcCollapse.png'><label title='Root'>Root</label></li></ul>")
				if("testfolder" in data[0] && data[0].testfolder.length > 0){
					for(var i=0; i<data[0].testfolder.length; i++){
						if(i == 0){				
							structContainer.find(".root").append("<ul></ul>")
						}
						structContainer.find(".root ul").append("<li class='Tfolnode' testfolder_"+(i+1)+" data-folderpath='"+data[0].testfolder[i].folderpath+"'><img class='qcExpand qcExpandFolder selectedQcNode' title='expand' style='height: 16px;' src='imgs/ic-qcExpand.png'><label title='"+data[0].testfolder[i].foldername+"'>"+data[0].testfolder[i].foldername+"</label></li>")
					}
				}
				if("TestSet" in data[1] && data[1].TestSet.length > 0){
					for(var j=0; j<data[1].TestSet.length; j++){
						structContainer.find(".root ul").append("<li class='Tsetnode testSet_"+(j+1)+"' data-testsetpath='"+data[1].TestSet[j].testsetpath+"' data-testsetid='"+data[1].TestSet[j].testsetid+"'><img class='qcExpand qcExpandTestset selectedQcNode' title='expand' style='height: 16px;' src='imgs/ic-taskType-blue-plus.png'><label title='"+data[1].TestSet[j].testset+"'>"+data[1].TestSet[j].testset+"</label></li>")
					}
				}
				unblockUI();				
			},
			function(error) {	console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
			});
			$('.scrollbar-inner').scrollbar();
	});

	//Select Nineteen68 projects
	$(document).on("change", ".qcN68SelectProject", function(){
		var getProject = $(this).children("option:selected").val();
		for(var i=0; i<nineteen68_projects_details.length; i++){
			if(getProject == nineteen68_projects_details[i].project_id){
				var N68Container = $(".qcN68TreeContainer");
				N68Container.empty();
				N68Container.append("<ul class='scrollbar-inner'></ul>")
				if(nineteen68_projects_details[i].scenario_details.length >0){
					for(var j=0; j<nineteen68_projects_details[i].scenario_details.length; j++){
						N68Container.find("ul").append("<li class='testSet testScenariolink' data-scenarioid='"+nineteen68_projects_details[i].scenario_details[j].testscenarioid+"'><label title='"+nineteen68_projects_details[i].scenario_details[j].testscenarioname+"'>"+nineteen68_projects_details[i].scenario_details[j].testscenarioname+"</label></li>")
					}
					if(nineteen68_projects_details[i].scenario_details.length >= 25)	$('.scrollbar-inner').scrollbar();
					$(".searchScenarioN68").show();
				}else{
					N68Container.append("This project does not contain any scenarios");
					$(".searchScenarioN68").hide();
				}
			}
		}
	});

	//Search scenarios
	var flgTog = 1;
	$(document).on('click', ".searchScenarioN68", function(){
		$('.searchScenarioQC').val('');
		if(flgTog){
			$(this).siblings("input").css({"opacity":1});
			flgTog = 0;
		}
		else{
			$(this).siblings("input").css({"opacity":0});
			flgTog = 1;
		}
		filter($(this).siblings("input"));
	})

	$(document).on('keyup', '.searchScenarioQC', function() {
		filter(this);
	});

	function filter(element) {
		var value = $(element).val();
		$(".qcN68TreeContainer ul li").each(function () {
			if ($(this).children("label").text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	}

	//Select selectedQcNode
	$(document).on('click','.selectedQcNode', function(){
		var getParent = $(this).parent();
		var testCasename;
		if(getParent.hasClass("qcCollapse")){
			getParent.next("ul").hide();
			if(getParent.hasClass("Tfolnode"))	$(this).prop("src","imgs/ic-qcExpand.png");
			getParent.removeClass("qcCollapse");
		}
		else{
			if(getParent.next("ul").length > 0){
				getParent.next("ul").show();
				if(getParent.hasClass("Tfolnode"))	$(this).prop("src","imgs/ic-qcCollapse.png");
				getParent.addClass("qcCollapse");
			}
			else{
				$(".qcExpand").addClass("stopPointerEvent");
				$(document.body).css({'cursor' : 'wait'});
				getParent.addClass("qcCollapse");
				//if(getParent.hasClass("Tfolnode"))	$(this).prop("src","imgs/ic-qcCollapse.png");
				var getProjectName = $(".qcSelectProject option:selected").val();
				var getDomainName = $(".qcSelectDomain option:selected").val();
				var datapath, dataAction;
				if(getParent.hasClass("Tfolnode")){
					dataAction = "folder";
					datapath = getParent.data("folderpath");
				} 
				else if(getParent.hasClass("Tsetnode")){
					dataAction = "testcase";
					testCasename = $(this).siblings("label").text();
					datapath = getParent.data("testsetpath");
				}
				var getObject = getParent;
				blockUI('Loading....');
				qcServices.qcFolderDetails_ICE(dataAction,getProjectName,getDomainName,datapath,testCasename)
					.then(function(data){
						if(data){
							getObject.after("<ul class='"+getObject.find("label").text()+"'></ul>");
							for(var a=0; a<data.length; a++){			
								if(getObject.hasClass("Tsetnode")){
									if("testcase" in data[a] && data[a].testcase.length > 0){
										for(var k=0; k<data[a].testcase.length; k++){
											getObject.next("ul").append("<li class='testSet testcaselink'><label title='"+data[a].testcase[k]+"'>"+data[a].testcase[k]+"</label><img class='qcUndoSyncronise' title='Undo' src='imgs/ic-qcUndoSyncronise.png'><img class='qcSyncronise' title='Syncronise' src='imgs/ic-qcSyncronise.png'></li>");
										}
									}
								}
								else if(getObject.hasClass("Tfolnode")){
									if("testfolder" in data[a] && data[a].testfolder.length > 0){
										for(var i=0; i<data[a].testfolder.length; i++){
											getObject.next("ul").append("<li class='Tfolnode' data-folderpath='"+data[a].testfolder[i].folderpath+"'><img class='qcExpand qcExpandFolder selectedQcNode' title='expand' style='height: 16px;' src='imgs/ic-qcExpand.png'><label title='"+data[a].testfolder[i].foldername+"'>"+data[a].testfolder[i].foldername+"</label></li>")
										}
									}
									else if("TestSet" in data[a] && data[a].TestSet.length > 0){
										for(var j=0; j<data[a].TestSet.length; j++){
											getObject.next("ul").append("<li class='Tsetnode testSet_' data-testsetpath='"+data[a].TestSet[j].testsetpath+"' data-testsetid='"+data[a].TestSet[j].testsetid+"'><img class='qcExpand qcExpandTestset selectedQcNode' title='expand' style='height: 16px;' src='imgs/ic-taskType-blue-plus.png'><label title='"+data[a].TestSet[j].testset+"'>"+data[a].TestSet[j].testset+"</label></li>")
										}
									}
								}
							}
						}
						$(".qcExpand").removeClass("stopPointerEvent");
						$(document.body).css({'cursor' : 'default'});	
						unblockUI();
					},
					function(error) {	unblockUI(); console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
					});
					if(getParent.hasClass("Tfolnode"))	$(this).prop("src","imgs/ic-qcCollapse.png");
				}
		}
		if(($(".qcTreeContainer ul").length + $(".qcTreeContainer li").length) >= 25){
			$('.scrollbar-inner').scrollbar();			
		}
	})
	
	//Select testset
	$(document).on('click','.testcaselink', function(){
		$('.testcaselink').removeClass("selectedToMap");
		$('.testcaselink').find(".qcSyncronise, .qcUndoSyncronise").hide();
		$('.testcaselink').prop("style","background-color:none;border-radius:0px;");
		$(this).addClass("selectedToMap");
		$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
		$(this).find(".qcSyncronise, .qcUndoSyncronise").show();
	})
	$(document).on('click','.testScenariolink', function(){
		$(this).addClass("selectedToMap");
		$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
		$(this).siblings().removeClass("selectedToMap");
		$(this).siblings().prop("style","background-color:none;border-radius:0px;");
	})

	//Undo Mapping
	$(document).on('click', ".qcUndoSyncronise", function(){
		var qcTestcaseName = $(this).siblings("label").text();
		var qcTestsetName = $(this).parent("li").parent("ul").prev("li").find('label').text();
		for(var i=0;i<mappedList.length;i++){
			if(qcTestcaseName == mappedList[i].testcase && qcTestsetName == mappedList[i].testset){
				delete mappedList[i];
				mappedList =  mappedList.filter(function(n){ return n != null });
				$('.testScenariolink').removeClass("selectedToMap");
				$('.testScenariolink').prop("style","background-color:none;border-radius:0px;");
				$(this).parent().css({"background-color":"rgb(225, 202, 255)"});
				$(this).siblings(".qcSyncronise").show();
				break;
			}
		}
	})

	// Mapping
	$(document).on('click', ".qcSyncronise", function(event){
		var getDomainName = $(".qcSelectDomain option:selected").val();
		var getProjectName = $(".qcSelectProject option:selected").val();
		var qcTestcaseName = $(this).siblings("label").text();
		var qcTestsetName = $(this).parent("li").parent("ul").prev("li").find('label').text();
		var qcFolderPath = $(this).parent("li").parent("ul").prev("li").parent("ul").prev("li").data("folderpath");
		var N68ScenarioId = $(".qcN68TreeContainer").find(".selectedToMap").data("scenarioid");
		if(!getDomainName)	openModelPopup("Save Mapped Testcase", "Please select domain");
		else if(!getProjectName)	openModelPopup("Save Mapped Testcase", "Please select project");
		else if(!qcTestcaseName)	openModelPopup("Save Mapped Testcase", "Please select Testcase");
		else if(!qcTestsetName)	openModelPopup("Save Mapped Testcase", "Please select Testset");
		else if(!N68ScenarioId)	openModelPopup("Save Mapped Testcase", "Please select scenario");
		else{
			mappedList.push({
				'domain': getDomainName,
				'project': getProjectName,			
				'testcase': qcTestcaseName,
				'testset': qcTestsetName,
				'folderpath': qcFolderPath,
				'scenarioId': N68ScenarioId,
			})
			$(this).parent().css({"background-color":"#ddd"});
			$(this).hide();
			event.stopPropagation();
		}
	})

	//Submit mapped details
	$scope.mapTestcaseToN68 = function(){
		if(mappedList.length > 0){
			qcServices.saveQcDetails_ICE(mappedList)
			.then(function(data){
				if(data == "unavailableLocalServer"){
					openModelPopup("Save Mapped Testcase", "ICE Engine is not available, Please run the batch file and connect to the Server.");
				}
				else if(data == "scheduleModeOn"){
					openModelPopup("Save Mapped Testcase", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
				}
				else if(data == "fail"){
					openModelPopup("Save Mapped Testcase", "failed to save");
				}
				else if(data == "success"){
					mappedList = [];
					$('.testcaselink, .testScenariolink').removeClass("selectedToMap");
					$('.testcaselink').find(".qcSyncronise, .qcUndoSyncronise").hide();
					$('.testcaselink, .testScenariolink').prop("style","background-color:none;border-radius:0px;");
					openModelPopup("Save Mapped Testcase", "Saved successfully");
				}
			},
			function(error) {	console.log("Error in qcController.js file mapTestcaseToN68 method! \r\n "+(error.data));
			});
		}
		else 	openModelPopup("Save Mapped Testcase", "Map Testcases before save");
	}

	$scope.displayMappedFilesTab = function(){
		blockUI("Loading...")
		var userid = JSON.parse(window.localStorage['_UI']).user_id;
		qcServices.viewQcMappedList_ICE(userid)
		.then(function(data){
			// var selectOptions = $("#selAssignUser option:not(:first)");
			data.sort(function(a,b) {
				if (a.qctestcase > b.qctestcase) return 1;
			    else if (a.qctestcase < b.qctestcase) return -1;
			    else return 0;
			})
			if(data.length > 0){
				$(".qcActionBtn, .leftQcStructure, .rightQcStructure").hide();
				$("#page-taskName span").text("Mapped Files");
				$(".mappedFiles").empty().show();
				$(".mappedFilesLabel").show();
				for(var i=0;i<data.length;i++){
					$(".mappedFiles").append('<div class="linkedTestset"><label data-qcdomain="'+data[i].qcdomain+'" data-qcfolderpath="'+data[i].qcfolderpath+'" data-qcproject="'+data[i].qcproject+'" data-qctestset="'+data[i].qctestset+'">'+data[i].qctestcase+'</label><span class="linkedLine"></span><label data-scenarioid="'+data[i].testscenarioid+'">'+data[i].testscenarioname+'</label></div>')
				}				
				$('.scrollbar-inner').scrollbar();
			}
			else{
				openModelPopup("Mapped Testcase", "No mapped details")
			}
			unblockUI()
		},
		function(error) {	console.log("Error in qcController.js file viewQcMappedList_ICE method! \r\n "+(error.data));
		});		
	}

	$scope.exitQcConnection = function(){
		var dataAction = "qcquit";
		qcServices.qcFolderDetails_ICE(dataAction,"","","","")
		.then(function(data){
			if(data == "closedqc"){
				window.localStorage['navigateScreen'] = "plugin"
				window.location.href = "/plugin";
			}		
		},
		function(error) {	console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
		});
	}

	/*****************Manual Test Case Generator*******************/
	//Get all project details for Manual Testcase Generator
	//Load projects
	$scope.getDetailsforMTG = function(){
		$scope.testLabGenerator = false;
		blockUI("Loading...");
		qcServices.manualTestcaseDetails_ICE()
		.then(function(data){
			if(data){
				$scope.manualTestcaseDetails = data;
				$(".mtgProjects").empty();
				$(".mtgProjects").append("<option value='' selected disabled>Select Project</option>");
				for(var i=0; i<data.length; i++){
					$(".mtgProjects").append("<option value='"+data[i].project_id+"'>"+data[i].project_name+"</option>");
				}
			}
			unblockUI();		
		},
		function(error) {	console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
		});
	}

	//Load Modules
	$(document).on('change', '.mtgProjects', function(){
		var projId = $(this).find("option:selected").val();
		var getDetails = $scope.manualTestcaseDetails;
		for(var i=0; i<getDetails.length; i++){
			if(projId == getDetails[i].project_id){
				$scope.scenariosformodule = getDetails[i].module_details;
				$(".mtgModules").empty();
				$(".mtgModules").append("<option value='' selected disabled>Select Module</option>");
				for(var j=0; j<getDetails[i].module_details.length; j++){
					$(".mtgModules").append("<option value='"+getDetails[i].module_details[j].module_id+"'>"+getDetails[i].module_details[j].module_name+"</option>");
				}
				break;
			}
		}
	})

	//Load Scenarios
	$(document).on('change', '.mtgModules', function(){
		var moduleId = $(this).find("option:selected").val();
		var getDetails = $scope.scenariosformodule;
		for(var i=0; i<getDetails.length; i++){
			if(moduleId == getDetails[i].module_id){
				$scope.testcaseforscenario = getDetails[i].scenario_details;
				$(".mtgScenarios").empty();
				$(".mtgScenarios").append("<option value='' selected disabled>Select Scenario</option>");
				for(var j=0; j<getDetails[i].scenario_details.length; j++){
					$(".mtgScenarios").append("<option value='"+getDetails[i].scenario_details[j].scenario_id+"'>"+getDetails[i].scenario_details[j].scenario_name+"</option>");
				}
				break;
			}
		}
	})

	//Load Test Case
	$(document).on('change', '.mtgScenarios', function(){
		var scenarioId = $(this).find("option:selected").val();
		var getDetails = $scope.testcaseforscenario;
		for(var i=0; i<getDetails.length; i++){
			if(scenarioId == getDetails[i].scenario_id){
				$(".mtgScenarioList").empty();
				for(var j=0; j<getDetails[i].testcase_details.length; j++){
					$(".mtgScenarioList").append("<li data-testcaseid='"+getDetails[i].testcase_details[j].testcase_id+"'>"+getDetails[i].testcase_details[j].testcase_name+"</li>");
				}
				break;
			}
		}
		if($(".mtgScenarioList").find("li").length > 11){
			$('.scrollbar-inner').scrollbar();
		}
	})

	//Adding selection class for Testcase option(right upper section of Test Lab)
	$(document).on('click', '.mtgScenarioList li', function(){
		$(this).siblings().removeClass("selectTestcaseMTG");
		$(this).addClass("selectTestcaseMTG");
	})

	//Adding selection class for Fields required option(left bottom section of Test Lab)
	$(document).on('click', '.almfieldsList ul li', function(){
		$(this).siblings().removeClass("selectfieldsList");
		$(this).addClass("selectfieldsList");
	})

	//Adding selection class for ALM Fileds option(right bottom section of Test Lab)
	$(document).on('click', '.almFieldExcel li', function(){
		if($(this).find("label").text() != "Subject" && $(this).find("label").text() != "Test Case" && $(this).find("label").text() != "Type"){
			$(this).siblings().removeClass("selectALMExcel");
			$(this).addClass("selectALMExcel");
		}
	})

	//Move to Fields required list(left bottom section of Test Lab)
	$scope.addToAlmFields = function(){
		var fieldName = $(".selectfieldsList:not(.selectfieldsListAdded)").text();
		$(".selectfieldsList").addClass("selectfieldsListAdded");
		switch (fieldName){
			case "Description":
			case "Step Name":
			case "Step Description":
			case "Author":
			case "Creation Date":
				$(".almFieldExcel").append("<li><label>"+fieldName+"</label><span><input type='text' disabled></input></span></li>");
				break;
			case "Expected Results":
				$(".almFieldExcel").append("<li><label>"+fieldName+"</label><span><input type='text'></input></span></li>");
				break;
			case "Status":
				$(".almFieldExcel").append("<li><label>"+fieldName+"</label><span><input type='text' disabled value='Design'></input></span></li>");
				break;
			default:
				return;
		}
		$(".selectfieldsListAdded").hide();
		if($(".almFieldExcel").find("li").length > 7){
			$('.scrollbar-inner').scrollbar();
		}
	}

	//Remove from ALM Field(right bottom section of Test Lab)
	$scope.removeFromAlmField = function(){
		var ListName = $(".selectALMExcel label").text();
		if(ListName){
			$(".selectALMExcel").remove();
			$.each($(".almfieldsList li.selectfieldsListAdded"), function(){
				if($(this).text() == ListName){
					$(this).show();
					$(this).removeClass("selectfieldsListAdded");
				}
			})
		}
	}

	//Generate Manual Testcase details
	$scope.saveTestlabdetails = function(){
		$scope.tab = false;
		$scope.testLabGenerator = true;
		var tCaseId = $(".selectTestcaseMTG").data("testcaseid");
		var getMTGColumns = $(".almFieldExcel li");
		var testcasedetails = {};
		var testLabdetails = {};
		testcasedetails["testcase_id"] = tCaseId;
		$.each(getMTGColumns, function(){
			var key = $(this).children("label").text();
			var value = $(this).find("span input").val();
			testLabdetails[key] = value;
		})
		testcasedetails["testLabdetails"] = testLabdetails;
	}
	//Global moded popup
	function openModelPopup(title, body){
		$("#globalModal").find('.modal-title').text(title);
		$("#globalModal").find('.modal-body p').text(body);
		$("#globalModal").modal("show");
		setTimeout(function(){
			$("#globalModal").find('.btn-default').focus();
		}, 300);
	}
}]);