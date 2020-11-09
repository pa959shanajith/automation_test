mySPA.controller('zephyrController',['$scope', '$rootScope', '$window','$http','$location','$timeout','zephyrServices','cfpLoadingBar', 'socket', function($scope, $rootScope, $window,$http,$location,$timeout,qcServices,cfpLoadingBar,socket) {
	$('.scrollbar-inner').scrollbar();
	var avoassure_projects_details;
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerText = new Date().getFullYear();
		$("#loginToQCpop").modal("show");
	}, 500);
	var mappedList = [];
	if(window.localStorage['navigateScreen'] != "p_Zephyr"){
		return $rootScope.redirectPage();
	}

	$("body").css("background", "#eee");
	
	$(".selectBrowser").click(function(){
		$(".selectBrowser").find("img").removeClass("selectedIcon");
		$(this).find("img").addClass("selectedIcon");
	});
	$scope.loadDomains = function(){
		var domainData = $scope.domainData;
		if(domainData){
			$timeout(function(){
				if((domainData != undefined || domainData != "") && domainData.length > 0){
					$(".qcSelectDomain").empty();
					$(".qcSelectDomain").append("<option selected disabled>Select Project</option>");
					for(var i=0;i<domainData.length;i++){
						$(".qcSelectDomain").append("<option data-projectid="+domainData[i].id+" value='"+domainData[i].name+"'>"+domainData.domain[i]+"</option>");
					}
				}
			}, 500);
		}
	};

	socket.on('ICEnotAvailable', function () {
		unblockUI();
		openModelPopup("ALM Connection", "ICE Engine is not available, Please run the batch file and connect to the Server.");
	});

	$scope.almlogin = function(event){
		window.localStorage['navigateScreen'] = "p_ALM";
		$timeout(function () {
			$location.path('/'+ "p_ALM");
	   	}, 100);
	};

	$scope.qtestlogin = function(event){
		window.localStorage['navigateScreen'] = "p_qTest";
		$timeout(function () {
			$location.path('/'+ "p_qTest");
	   	}, 100);
	};

	$scope.hideMappedFilesTab = function(){
		$scope.testLabGenerator = false;
		$(".mappedFiles, .mappedFilesLabel").hide();
		$("#page-taskName span").text("Zephyr Integration");
		$(".qcActionBtn, .leftQcStructure, .rightQcStructure").show();
		$("#qtestTab").show();
		$("#almTab").show();
	};	

	//login to QC
	$scope.loginToZephyr = function($event){
		$(".qcLoginload").show();
		//$("#qcName,#qcUserName,#qcPwd,.qcConnsubmit").prop("disabled",true);
		$("#qcName,#qcUserName,#qcPwd").css("background","none");
		$("#qcErrorMsg").text("");
		$("#qcName,#qcUserName,#qcPwd").removeClass("inputErrorBorder");
		var qcURL = $("#qcName").val();
		var qcUserName =$("#qcUserName").val();
		var qcPassword = $("#qcPwd").val();
		var qcJiraUrl = $("#qcJiraUrl").val();
		var qcJiraUserName = $("#qcJiraUserName").val();
		var qcJiraAccToken = $("#qcJiraAccToken").val();
		if(!qcURL){
			$("#qcErrorMsg").text("Please Enter Zephyr Account Number.");
			$("#qcName").addClass("inputErrorBorder");
			$(".qcLoginload").hide();
		}
		else if(!qcUserName){
			$("#qcErrorMsg").text("Please Enter Access Key.");
			$("#qcUserName").addClass("inputErrorBorder");
			$(".qcLoginload").hide();
		}
		else if(!qcPassword){
			$("#qcErrorMsg").text("Please Enter Secret Key.");
			$("#qcPwd").addClass("inputErrorBorder");
			$(".qcLoginload").hide();
		}
		else if(!qcJiraUrl){
			$("#qcErrorMsg").text("Please Enter Jira URL.");
			$("#qcJiraUrl").addClass("inputErrorBorder");
			$(".qcLoginload").hide();
		}
		else if(!qcJiraUserName){
			$("#qcErrorMsg").text("Please Enter Jira User Name.");
			$("#qcJiraUserName").addClass("inputErrorBorder");
			$(".qcLoginload").hide();
		}
		else if(!qcJiraAccToken){
			$("#qcErrorMsg").text("Please Enter Jira Access Token.");
			$("#qcJiraAccToken").addClass("inputErrorBorder");
			$(".qcLoginload").hide();
		}
		else{
			$("#qcPwd").removeClass("inputErrorBorder");
			qcServices.loginToZephyr_ICE(qcURL,qcUserName,qcPassword,qcJiraUrl,qcJiraUserName,qcJiraAccToken)
			.then(function(data){
				$scope.domainData = data;
				$(".qcLoginload").hide();
				if(data == "unavailableLocalServer"){
					$("#qcErrorMsg").text("ICE Engine is not available,Please run the batch file and connect to the Server.");
				} else if(data == "scheduleModeOn") {
					$("#qcErrorMsg").text("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
				} else if(data == "Invalid Session"){
					return $rootScope.redirectPage();
				} else if(data == "invalidcredentials"){
					$("#qcErrorMsg").text("Invalid Credentials");
				} else if(data == "noprojectfound"){
					$("#qcErrorMsg").text("Invalid credentials or no project found");
				} else if(data == "invalidurl"){
					$("#qcErrorMsg").text("Invalid URL");
				} else if(data == "fail"){
					$("#qcErrorMsg").text("Fail to Login");
				}
				else if(data == "Error:Failed in running Qc"){
					$("#qcErrorMsg").text("Unable to run Qc");
				} 
				else if(data=="Error:Qc Operations"){
					$("#qcErrorMsg").text("Failed during execution");
				}
				else if(data){
					$(".qcSelectDomain").empty();
					$(".qcSelectDomain").append("<option selected disabled>Select Project</option>");
					for(var i=0;i<data.length;i++){
						$(".qcSelectDomain").append("<option data-projectid="+data[i].id+" value='"+data[i].name+"'>"+data[i].name+"</option>");
					}
					$("#loginToQCpop").modal("hide");
					$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">User Name :</span><span class="content">'+qcUserName+'</span></p>');
				}
			},
			function(error) {	console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
			});
		}
	}; 

	$scope.goBacktoPlugin = function($event){
		window.localStorage['navigateScreen'] = "p_Integration";
		window.location.assign('p_Integration');
	};

	//Select Domains
	$(document).off('change').on('change', ".qcSelectDomain", function(){
		$(document.body).css({'cursor' : 'wait'});
		$(".qcSelectDomain").prop("disabled", true);
		var getDomain = $(this).children("option:selected").val();
		blockUI('Loading....');
		qcServices.zephyrProjectDetails_ICE(getDomain)
			.then(function(data){
				avoassure_projects_details = data.avoassure_projects;
				if(data == "unavailableLocalServer"){
					openModelPopup("ALM Connection", "ICE Engine is not available, Please run the batch file and connect to the Server.");
				}	
				else if(data == "scheduleModeOn") {
					openModelPopup("ALM Connection", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
				}
				else if(data == "Invalid Session"){
					//openModelPopup("ALM Connection", "Invalid Session");
					return $rootScope.redirectPage();
				}
				else if(data){

					$(".zephyrAvoAssureSelectProject").empty();					
					$(".zephyrAvoAssureSelectProject").append("<option value='' selected disabled>Select Project</option>");
					for(var i=0;i<data.avoassure_projects.length;i++){
						$(".zephyrAvoAssureSelectProject").append("<option value='"+data.avoassure_projects[i].project_id+"'>"+data.avoassure_projects[i].project_name+"</option>");
					}

					var structContainer = $(".qcTreeContainer");
					structContainer.empty();
					$(".mtgScenarioList").empty();
					structContainer.append("<ul class='root scrollbar-inner'><li class='testfolder_'><img class='qcCollapse' title='expand' style='height: 16px;' src='imgs/ic-qcCollapse.png'><label title='Root'>Root</label></li></ul>");
					project_dets = data.project_dets;
					if(project_dets.length>0) {
						for(var i=0 ; i<project_dets.length;++i) {
							var keyVal = project_dets[i].cycle;
							var cycleId = project_dets[i].cycleId;
							var projectId = project_dets[i].projectId;
							var versionId = project_dets[i].versionId;
							if(i == 0){				
								structContainer.find(".root").append("<ul class='cycleList'></ul>");
							}
							structContainer.find(".cycleList").append("<li class='Tfolnode testfolder_"+(i+1)+"'><img class='qcExpand qcExpandFolder selectedQcNode' title='expand' style='height: 16px;' src='imgs/ic-qcExpand.png'><label title='"+keyVal+"'>"+keyVal+"</label></li>");
							var suites = project_dets[i].tests;
							for (var j=0;j<suites.length;++j){
								if(j==0){
									structContainer.find(".testfolder_"+(i+1)).append("<ul class='suiteList suiteList_"+(i+1)+"'></ul>")
									$(".suiteList_"+(i+1)).hide();
								}
								structContainer.find(".suiteList_"+(i+1)).append("<li  class='testSuite testcaselink testSet_"+(i+1)+""+(j+1)+"' data-suiteid="+suites[j].id+" data-issueid="+suites[j].issueId+" data-cycleid="+cycleId+" data-versionid="+versionId+" data-projectid="+projectId+"  data-type='testsuite'><label title='"+suites[j].name+"' style='margin-left:0px'>"+suites[j].name+"</label><img class='qcUndoSyncronise' title='Undo' src='imgs/ic-qcUndoSyncronise.png'><img class='qcSyncronise' title='Syncronise' src='imgs/ic-qcSyncronise.png'></li>");
							}
						}
							$('.scrollbar-inner').scrollbar();
					}
				}
				unblockUI();
			},
			function(error) {	unblockUI(); 
				console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
			});
	});

	//Select QC projects
	$(document).on("change", ".qcSelectProject", function(){
		var getProjectName = $(".qcSelectProject option:selected").val();
		// var getDomainName = $(".qcSelectDomain option:selected").val();
		var getProjectId = $(".qcSelectDomain option:selected").data("projectid")
		blockUI("Loading...");
		qcServices.qtestFolderDetails_ICE("folder",getProjectName,getProjectId,"root")
			.then(function(data){
				var structContainer = $(".qcTreeContainer");
				structContainer.empty();
				$(".mtgScenarioList").empty();
				structContainer.append("<ul class='root scrollbar-inner'><li class='testfolder_'><img class='qcCollapse' title='expand' style='height: 16px;' src='imgs/ic-qcCollapse.png'><label title='Root'>Root</label></li></ul>");
				if(data.length>0) {
					for(var i=0 ; i<data.length;++i) {
						var keyVal = data[i].cycle;
						if(i == 0){				
							structContainer.find(".root").append("<ul class='cycleList'></ul>");
						}
						structContainer.find(".cycleList").append("<li class='Tfolnode testfolder_"+(i+1)+"'><img class='qcExpand qcExpandFolder selectedQcNode' title='expand' style='height: 16px;' src='imgs/ic-qcExpand.png'><label title='"+keyVal+"'>"+keyVal+"</label></li>");
						var suites = data[i].tests;
						for (var j=0;j<suites.length;++j){
							if(j==0){
								structContainer.find(".testfolder_"+(i+1)).append("<ul class='suiteList suiteList_"+(i+1)+"'></ul>")
								$(".suiteList_"+(i+1)).hide();
							}
							structContainer.find(".suiteList_"+(i+1)).append("<li  class='testcaselink testSuite testSet_"+(i+1)+""+(j+1)+"' data-suiteid="+suites[j].id+" data-type='testsuite'><label title='"+suites[j].name+"' style='margin-left:0px'>"+suites[j].name+"</label><img class='qcUndoSyncronise' title='Undo' src='imgs/ic-qcUndoSyncronise.png'><img class='qcSyncronise' title='Syncronise' src='imgs/ic-qcSyncronise.png'></li>");
							// for (var k=0; k<suites[j].testruns.length;++k){
							// 	if(k==0){
							// 		structContainer.find(".suiteList_"+(i+1)).append("<ul class='runList runList_"+(i+1)+""+(j+1)+"'></ul>")
							// 		$(".runList_"+(i+1)+""+(j+1)).hide();
							// 	}
							// 	structContainer.find(".runList_"+(i+1)+""+(j+1)).append("<li  class='testRun testcaselink' data-runid="+suites[j].testruns[k].id+" data-type='testrun'><label title='"+suites[j].testruns[k].name+"' style='margin-left:57px'>"+suites[j].testruns[k].name+"</label><img class='qcUndoSyncronise' title='Undo' src='imgs/ic-qcUndoSyncronise.png'><img class='qcSyncronise' title='Syncronise' src='imgs/ic-qcSyncronise.png'></li>");
							// }
						}
					}
					// if($(".mtgScenarioList").find("li").length > 11){
						$('.scrollbar-inner').scrollbar();
					// }
				}
				unblockUI();				
			},
			function(error) {	console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
			});
			$('.scrollbar-inner').scrollbar();
	});

	//Select Avo Assure projects
	$(document).on("change", ".zephyrAvoAssureSelectProject", function(){
		var getProject = $(this).children("option:selected").val();
		for(var i=0; i<avoassure_projects_details.length; i++){
			if(getProject == avoassure_projects_details[i].project_id){
				var AvoAssureContainer = $(".qcAvoAssureTreeContainer");
				AvoAssureContainer.empty();
				AvoAssureContainer.append("<ul class='scrollbar-inner'></ul>");
				var scnDetails = avoassure_projects_details[i].scenario_details;
				if(scnDetails.length >0){
					for(var j=0; j<scnDetails.length; j++){
						AvoAssureContainer.find("ul").append("<li class='testSet testScenariolink' data-scenarioid='"+scnDetails[j]._id+"'><label title='"+scnDetails[j].name+"'>"+scnDetails[j].name+"</label></li>");
					}
					//if(scnDetails.length >= 25)
					$('.scrollbar-inner').scrollbar();
					$(".searchZScenarioAvoAssure").show();
				} else{
					AvoAssureContainer.append("This project does not contain any scenarios");
					$(".searchZScenarioAvoAssure").hide();
				}
			}
		}
	});

	//Search scenarios
	var flgTog = 1;
	$scope.searchScenarioAvo = function(event){
		$('.searchScenarioQC').val('');
		if(flgTog){
			$('.searchScenarioQC').css({"opacity":1});
			flgTog = 0;
		}
		else{
			$('.searchScenarioQC').css({"opacity":0});
			flgTog = 1;
		}
		filter($('.searchScenarioQC'));
	};
	

	$(document).on('keyup', '.searchScenarioQC', function() {
		filter(this);
	});

	$(document).on('keyup', '.launchPopupInput', function() {
		$(this).removeClass("inputErrorBorder");
	});

	function filter(element) {
		var value = $(element).val();
		$(".qcAvoAssureTreeContainer ul li").each(function () {
			if ($(this).children("label").text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	}

	//Select selectedQcNode
	$(document).off('click').on('click','.selectedQcNode', function(){
		var getParent = $(this).parent();
		var testCasename;
		if(getParent.hasClass("qcCollapse")){
			if(getParent.hasClass("Tfolnode")){
				$(this).prop("src","imgs/ic-qcExpand.png");
				getParent.find(".suiteList").hide();
			}
			if(getParent.hasClass("testSuite")){
				$(this).prop("src","imgs/ic-taskType-blue-plus.png")
				getParent.next("ul.runList").hide();
			}
			getParent.removeClass("qcCollapse");
		}
		else{
			if(getParent.find("ul").length > 0 || getParent.next("ul").length > 0){
				if(getParent.hasClass("Tfolnode")){
					$(this).prop("src","imgs/ic-qcCollapse.png");
					getParent.find(".suiteList").show();
				}
				if(getParent.hasClass("testSuite")){
					$(this).prop("src","imgs/ic-taskType-blue-minus.png")
					getParent.next("ul.runList").show();
				}
				// if(getParent.hasClass("testrun")) 
				getParent.addClass("qcCollapse");
			}
			else{
				$(".qcExpand").addClass("stopPointerEvent");
				$(document.body).css({'cursor' : 'wait'});
				getParent.addClass("qcCollapse");
				//if(getParent.hasClass("Tfolnode"))	$(this).prop("src","imgs/ic-qcCollapse.png");
				// var getProjectName = $(".qcSelectProject option:selected").val();
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
				qcServices.qtestFolderDetails_ICE(dataAction,getProjectName,getDomainName,datapath,testCasename)
					.then(function(data){
						if(data){
							getObject.after("<ul class='"+getObject.find("label").text()+"'></ul>");
							for(var a=0; a<data.length; a++){			
								if(getObject.hasClass("Tsetnode")){
									if("testcase" in data[a] && data[a].testcase.length > 0){
										for(var k=0; k<data[a].testcase.length; k++){
											var complete_testcase_name = data[a].testcase[k];
											var testcase_name = complete_testcase_name.substring(0,complete_testcase_name.lastIndexOf('/'));
											var testcase_id = complete_testcase_name.substring(complete_testcase_name.lastIndexOf('/')+1);
											getObject.next("ul").append("<li class='testSet testcaselink'><label title='"+complete_testcase_name+"'> <span class='qcTestcaseId'>"+testcase_id+"</span><span class='qcTestcaseName'>"+testcase_name+"</span></label><img class='qcUndoSyncronise' title='Undo' src='imgs/ic-qcUndoSyncronise.png'><img class='qcSyncronise' title='Syncronise' src='imgs/ic-qcSyncronise.png'></li>");
										}
									}
								}
								else if(getObject.hasClass("Tfolnode")){
									if("testfolder" in data[a] && data[a].testfolder.length > 0){
										for(var i=0; i<data[a].testfolder.length; i++){
											getObject.next("ul").append("<li class='Tfolnode' data-folderpath='"+data[a].testfolder[i].folderpath+"'><img class='qcExpand qcExpandFolder selectedQcNode' title='expand' style='height: 16px;' src='imgs/ic-qcExpand.png'><label title='"+data[a].testfolder[i].foldername+"'>"+data[a].testfolder[i].foldername+"</label></li>");
										}
									}
									else if("TestSet" in data[a] && data[a].TestSet.length > 0){
										for(var j=0; j<data[a].TestSet.length; j++){
											getObject.next("ul").append("<li class='Tsetnode testSet_' data-testsetpath='"+data[a].TestSet[j].testsetpath+"' data-testsetid='"+data[a].TestSet[j].testsetid+"'><img class='qcExpand qcExpandTestset selectedQcNode' title='expand' style='height: 16px;' src='imgs/ic-taskType-blue-plus.png'><label title='"+data[a].TestSet[j].testset+"'>"+data[a].TestSet[j].testset+"</label></li>");
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
		//if(($(".qcTreeContainer ul").length + $(".qcTreeContainer li").length) >= 25){
		$('.scrollbar-inner').scrollbar();
		//}
	});
	
	//Select testset
	$(document).on('click','.testcaselink', function(){
		$('.testcaselink').removeClass("selectedToMap");
		$('.testcaselink').find(".qcSyncronise, .qcUndoSyncronise").hide();
		$('.testcaselink').prop("style","background-color:none;border-radius:0px;");
		$(this).addClass("selectedToMap");
		$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
		$(this).find(".qcSyncronise, .qcUndoSyncronise").show();
	});
	$(document).on('click','.testScenariolink', function(){
		
		$('.selectedToMap').prop("style","background-color:none;border-radius:0px;");
		$(this).siblings().removeClass("selectedToMap");
	//	$(this).siblings().prop("style","background-color:none;border-radius:0px;");
		$(this).addClass("selectedToMap");
		$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
		
	});

	//Undo Mapping
	$(document).on('click', ".qcUndoSyncronise", function(){
		var qcTestcaseName = $(this).siblings("label").text();
		var qcTestsetName = $(this).parent("li").parent("ul").prev("li").find('label').text();
		for(var i=0;i<mappedList.length;i++){
			if(qcTestcaseName == mappedList[i].testcase && qcTestsetName == mappedList[i].testset){
				delete mappedList[i];
				mappedList =  mappedList.filter(function(n){ return n != null; });
				$('.testScenariolink').removeClass("selectedToMap");
				$('.testScenariolink').prop("style","background-color:none;border-radius:0px;");
				$(this).parent().css({"background-color":"rgb(225, 202, 255)"});
				$(this).siblings(".qcSyncronise").show();
				break;
			}
		}
	});

	// Mapping
	$(document).on('click', ".qcSyncronise", function(event){
		var getDomainName = $(".qcSelectDomain option:selected").val();
		var getProjectId = $(".qcTreeContainer").find(".selectedToMap").data("projectid")
		var versionId = $(".qcTreeContainer").find(".selectedToMap").data("versionid")
		var cycleId =$(".qcTreeContainer").find(".selectedToMap").data("cycleid")
		var issueId =$(".qcTreeContainer").find(".selectedToMap").data("issueid")
		var testname = $(this).siblings("label")[0].innerText;
		var testid = $(".qcTreeContainer").find(".selectedToMap").data("suiteid");
		// }
		var AvoAssureScenarioId = $(".qcAvoAssureTreeContainer").find(".selectedToMap").data("scenarioid");
		
		if(!getDomainName || !getProjectId)	openModelPopup("Save Mapped Testcase", "Please select project");
		else if(!testid) openModelPopup("Save Mapped Testcase", "Please select Testcase");
		else if(!AvoAssureScenarioId)	openModelPopup("Save Mapped Testcase", "Please select scenario");
		else{
			mappedList.push({
				// 'project': getDomainName,
				'projectid': getProjectId,			
				'cycleid': cycleId,
				'versionid': versionId,
				'testid': testid,
				'testname': testname,
				'issueid': issueId,
				'scenarioId': AvoAssureScenarioId
				// 'maptype':dataType
			});
			$(this).parent().css({"background-color":"#ddd"});
			$(this).hide();
			event.stopPropagation();
		}
	});

	//Submit mapped details
	$scope.mapTestcaseToAvoAssure = function(){
		if(mappedList.length > 0){
			qcServices.saveZephyrDetails_ICE(mappedList)
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
					//mappedList = [];
					$('.testcaselink, .testScenariolink').removeClass("selectedToMap");
					$('.testcaselink').find(".qcSyncronise, .qcUndoSyncronise").hide();
					$('.testcaselink, .testScenariolink').prop("style","background-color:none;border-radius:0px;");
					openModelPopup("Save Mapped Testcase", "Saved successfully");
				}
			},
			function(error) {	console.log("Error in qcController.js file mapTestcaseToAvoAssure method! \r\n "+(error.data));
			});
		}
		else 	openModelPopup("Save Mapped Testcase", "Map Testcases before save");
	};

	$scope.displayMappedFilesTab = function(){
		blockUI("Loading...");
		var userid = JSON.parse(window.localStorage['_UI']).user_id;
		qcServices.viewZephyrMappedList_ICE(userid)
		.then(function(data){
			// var selectOptions = $("#selAssignUser option:not(:first)");
			data.sort(function(a,b) {
				if (a.qctestcase > b.qctestcase) return 1;
			    else if (a.qctestcase < b.qctestcase) return -1;
			    else return 0;
			});
			if(data.length > 0){
				$(".qcActionBtn, .leftQcStructure, .rightQcStructure").hide();
				$("#page-taskName span").text("Mapped Files");	
				$('.mappedFiles').off();
				$(".mappedFiles").empty().show();
				$('.mappedFiles').removeClass('scroll-wrapper');
				$(".mappedFilesLabel").show();
				$("#qtestTab").hide();
				$("#almTab").hide();
				for(var i=0;i<data.length;i++){
					//there is no testscenarioname 
					$(".mappedFiles").append('<div class="linkedTestset"><label data-qcdomain="'+data[i].qtestproject+'" data-qcfolderpath="'+data[i].qcfolderpath+'" data-qcproject="'+data[i].qcproject+'" data-qctestset="'+data[i].qctestset+'">'+data[i].testname+'</label><span class="linkedLine"></span><label data-scenarioid="'+data[i].testscenarioid+'">'+data[i].testscenarioname+'</label></div>');  //testscenarioname ??
				
				}	

				$('.scrollbar-inner').scrollbar();
			}
			else{
				openModelPopup("Mapped Testcase", "No mapped details");
			}
			unblockUI();
		},
		function(error) {	console.log("Error in qcController.js file viewZephyrMappedList_ICE method! \r\n "+(error.data));
		});		
	};

	$scope.exitQcConnection = function(){
		window.localStorage['navigateScreen'] = "p_Integration";
		window.location.href = "/p_Integration";
	};

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
	});

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
	});

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