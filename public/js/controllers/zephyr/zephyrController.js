mySPA.controller('zephyrController',['$scope', '$rootScope', '$window','$http','$location','$timeout','zephyrServices','cfpLoadingBar', 'socket', function($scope, $rootScope, $window,$http,$location,$timeout,zephyrServices,cfpLoadingBar,socket) {
	$('.scrollbar-inner').scrollbar();
	var avoassure_projects_details;
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerText = new Date().getFullYear();
		$("#loginToZephyrpop").modal("show");
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
		$(".zephyrActionBtn, .leftZephyrStructure, .rightZephyrStructure").show();
		$("#qtestTab").show();
		$("#almTab").show();
	};	

	//login to Zephyr
	$scope.loginToZephyr = function($event){
		$(".zephyrLoginload").show();
		$("#zephyrurl,#zephyrusername,#zephyrpassword").css("background","none");
		$("#zephyrErrorMsg").text("");
		$("#zephyrurl,#zephyrusername,#zephyrpassword").removeClass("inputErrorBorder");
		var zephyrURL = $("#zephyrurl").val();
		var zephyrUserName =$("#zephyrusername").val();
		var zephyrPassword = $("#zephyrpassword").val();
		if(!zephyrURL){
			$("#zephyrErrorMsg").text("Please Enter Zephyr URL.");
			$("#zephyrurl").addClass("inputErrorBorder");
			$(".zephyrLoginload").hide();
		}
		else if(!zephyrUserName){
			$("#zephyrErrorMsg").text("Please Enter Zephyr Username.");
			$("#zephyrusername").addClass("inputErrorBorder");
			$(".zephyrLoginload").hide();
		}
		else if(!zephyrPassword){
			$("#zephyrErrorMsg").text("Please Enter Zephyr Password.");
			$("#zephyrpassword").addClass("inputErrorBorder");
			$(".zephyrLoginload").hide();
		}
		else{
			zephyrServices.loginToZephyr_ICE(zephyrURL,zephyrUserName,zephyrPassword)
			.then(function(data){
				$scope.domainData = data;
				$(".zephyrLoginload").hide();
				if(data == "unavailableLocalServer"){
					$("#zephyrErrorMsg").text("ICE Engine is not available,Please run the batch file and connect to the Server.");
				} else if(data == "scheduleModeOn") {
					$("#zephyrErrorMsg").text("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
				} else if(data == "Invalid Session"){
					return $rootScope.redirectPage();
				} else if(data == "invalidcredentials"){
					$("#zephyrErrorMsg").text("Invalid Credentials");
				} else if(data == "noprojectfound"){
					$("#zephyrErrorMsg").text("Invalid credentials or no project found");
				} else if(data == "invalidurl"){
					$("#zephyrErrorMsg").text("Invalid URL");
				} else if(data == "fail"){
					$("#zephyrErrorMsg").text("Fail to Login");
				}
				else if(data == "Error:Failed in running Zephyr"){
					$("#zephyrErrorMsg").text("Unable to run Zephyr");
				} 
				else if(data=="Error:Zephyr Operations"){
					$("#zephyrErrorMsg").text("Failed during execution");
				}
				else if(data){
					$(".zephyrSelectProject").empty();
					$(".zephyrSelectProject").append("<option selected disabled>Select Project</option>");
					for(var i=0;i<data.length;i++){
						$(".zephyrSelectProject").append("<option data-projectid="+data[i].id+" value='"+data[i].name+"'>"+data[i].name+"</option>");
					}
					$("#loginToZephyrpop").modal("hide");
				}
			},
			function(error) {	console.log("Error in zephyrController.js file loginToZephyr method! \r\n "+(error.data));
			});
		}
	}; 

	$scope.goBacktoPlugin = function($event){
		window.localStorage['navigateScreen'] = "p_Integration";
		window.location.assign('p_Integration');
	};

	//Select Domains
	$(document).on('change', ".zephyrSelectProject", function(){
		$(document.body).css({'cursor' : 'wait'});
		$(".zephyrSelectProject").prop("disabled", true);
		var projectId = $(this).children("option:selected").data("projectid");
		zephyrServices.zephyrProjectDetails_ICE(projectId)
			.then(function(data){
				$scope.domainData = data;
				if(data == "unavailableLocalServer"){
					$("#zephyrErrorMsg").text("ICE Engine is not available,Please run the batch file and connect to the Server.");
				} else if(data == "scheduleModeOn") {
					$("#zephyrErrorMsg").text("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
				} else if(data == "Invalid Session"){
					return $rootScope.redirectPage();
				} else if(data == "invalidcredentials"){
					$("#zephyrErrorMsg").text("Invalid Credentials");
				} else if(data == "noprojectfound"){
					$("#zephyrErrorMsg").text("Invalid credentials or no project found");
				} else if(data == "invalidurl"){
					$("#zephyrErrorMsg").text("Invalid URL");
				} else if(data == "fail"){
					$("#zephyrErrorMsg").text("Fail to Login");
				}
				else if(data == "Error:Failed in running Zephyr"){
					$("#zephyrErrorMsg").text("Unable to run Zephyr");
				} 
				else if(data=="Error:Zephyr Operations"){
					$("#zephyrErrorMsg").text("Failed during execution");
				}
				else if(data){
					$(".zephyrSelectRelease").empty();
					$(".zephyrSelectRelease").append("<option selected disabled>Select Release</option>");
					for(var i=0;i<data.length;i++){
						$(".zephyrSelectRelease").append("<option data-releaseid="+data[i].id+" value='"+data[i].name+"'>"+data[i].name+"</option>");
					}
				}
			},
			function(error) {	unblockUI(); 
				console.log("Error in zephyrController.js file loginZephyrServer method! \r\n "+(error.data));
			});
	});

	//Select release
	$(document).on('change', ".zephyrSelectRelease", function(){
		$(document.body).css({'cursor' : 'wait'});
		$(".zephyrSelectRelease").prop("disabled", true);
		var releaseid = $(this).children("option:selected").data("releaseid");
		blockUI('Loading....');
		zephyrServices.zephyrCyclePhase_ICE(releaseid)
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

					var structContainer = $(".zephyrTreeContainer");
					structContainer.empty();
					$(".mtgScenarioList").empty();
					
					project_dets = data.project_dets;
					if(Object.keys(project_dets).length>0) {
						structContainer.append("<ul class='root scrollbar-inner'><li class='testfolder_'><img class='zephyrCollapse' title='expand' style='height: 16px;' src='imgs/ic-qcCollapse.png'><label title='Root'>Root</label></li></ul>");
						var i=0;
						for(var cycle in project_dets) {
							var phases = project_dets[cycle];
							if(i == 0){				
								structContainer.find(".root").append("<ul class='cycleList'></ul>");
							}
							i=i+1;
							structContainer.find(".cycleList").append("<li class='Tfolnode testfolder_"+(i+1)+"'><img class='zephyrExpand zephyrExpandFolder selectedZephyrNode' title='expand' style='height: 16px;' src='imgs/ic-qcExpand.png'><label title='"+cycle+"'>"+cycle+"</label></li>");
							for (var j=0;j<phases.length;++j){
								if(j==0){
									structContainer.find(".testfolder_"+(i+1)).append("<ul class='suiteList suiteList_"+(i+1)+"'></ul>")
									$(".suiteList_"+(i+1)).hide();
								}
								phaseid = Object.keys(phases[j])[0];
								phasename = phases[j][phaseid];
								structContainer.find(".suiteList_"+(i+1)).append("<li  class='testSuite testSet_"+(i+1)+""+(j+1)+"' data-phaseid="+phaseid+" data-phasename="+phasename+"><img class='zephyrExpand zephyrExpandTestset selectedZephyrNode' title='expand' style='height: 16px; float:left; margin-left:19px' src='imgs/ic-taskType-blue-plus.png'><label title='"+phasename+"' style='margin-left:0px'>"+phasename+"</label></li>");
							}
						}
						$('.scrollbar-inner').scrollbar();
					}
				}
				unblockUI();
			},
			function(error) {	unblockUI(); 
				console.log("Error in zephyrController.js file loginZephyrServer method! \r\n "+(error.data));
			});
	});


	//Select Avo Assure projects
	$(document).on("change", ".zephyrAvoAssureSelectProject", function(){
		var getProject = $(this).children("option:selected").val();
		for(var i=0; i<avoassure_projects_details.length; i++){
			if(getProject == avoassure_projects_details[i].project_id){
				var AvoAssureContainer = $(".zephyrAvoAssureTreeContainer");
				AvoAssureContainer.empty();
				AvoAssureContainer.append("<ul class='scrollbar-inner'></ul>");
				var scnDetails = avoassure_projects_details[i].scenario_details;
				if(scnDetails.length >0){
					for(var j=0; j<scnDetails.length; j++){
						AvoAssureContainer.find("ul").append("<li class='testSet testScenariolink' data-scenarioid='"+scnDetails[j]._id+"'><label title='"+scnDetails[j].name+"'>"+scnDetails[j].name+"</label></li>");
					}
					//if(scnDetails.length >= 25)
					$('.scrollbar-inner').scrollbar();
					$(".searchScenarioAvoAssure").show();
				} else{
					AvoAssureContainer.append("This project does not contain any scenarios");
					$(".searchScenarioAvoAssure").hide();
				}
			}
		}
	});

	//Search scenarios
	var flgTog = 1;
	$scope.searchScenarioAvo = function(event){
		$('.searchScenarioZephyr').val('');
		if(flgTog){
			$('.searchScenarioZephyr').css({"opacity":1});
			flgTog = 0;
		}
		else{
			$('.searchScenarioZephyr').css({"opacity":0});
			flgTog = 1;
		}
		filter($('.searchScenarioZephyr'));
	};
	

	$(document).on('keyup', '.searchScenarioZephyr', function() {
		filter(this);
	});

	$(document).on('keyup', '.launchPopupInput', function() {
		$(this).removeClass("inputErrorBorder");
	});

	function filter(element) {
		var value = $(element).val();
		$(".zephyrAvoAssureTreeContainer ul li").each(function () {
			if ($(this).children("label").text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	}

	//Select selectedZephyrNode
	$(document).off('click').on('click','.selectedZephyrNode', function(){
		var getParent = $(this).parent();
		var testCasename;
		if(getParent.hasClass("zephyrCollapse")){
			if(getParent.hasClass("Tfolnode")){
				$(this).prop("src","imgs/ic-qcExpand.png");
				getParent.find(".suiteList").hide();
			}
			if(getParent.hasClass("testSuite")){
				$(this).prop("src","imgs/ic-taskType-blue-plus.png")
				getParent.next("ul.testcaselist").hide();
			}
			getParent.removeClass("zephyrCollapse");
		}
		else{
			getParent.addClass("zephyrCollapse");
			if(getParent.hasClass("Tfolnode")){
				$(this).prop("src","imgs/ic-qcCollapse.png");
				getParent.find(".suiteList").show();
			}
			else if(getParent.hasClass("testSuite") && getParent.next('ul.testcaselist').length>0){
				$(this).prop("src","imgs/ic-taskType-blue-minus.png");
				getParent.next('ul.testcaselist').show();
			}
			else{
				$(this).prop("src","imgs/ic-taskType-blue-minus.png");
				$(".zephyrExpand").addClass("stopPointerEvent");
				$(document.body).css({'cursor' : 'wait'});
				var treeid = getParent.data("phaseid");
				var dataAction = "testcase";
				
				var getObject = getParent;
				blockUI('Loading....');
				zephyrServices.zephyrTestcaseDetails_ICE(dataAction,treeid)
					.then(function(data){
						if(data){
							getObject.after("<ul class='testcaselist'></ul>");
							for(var a=0; a<data.length; a++){			
								if(getObject.hasClass("testSuite")){
									getObject.next("ul").append("<li class='testSet testcaselink'><label title='"+data[a].name+"'> <span class='zephyrTestcaseId'>"+data[a].id+"</span><span class='zephyrTestcaseName'>"+data[a].name+"</span></label><img class='zephyrUndoSyncronise' style='float:right' title='Undo' src='imgs/ic-qcUndoSyncronise.png'><img class='zephyrSyncronise' style='float:right' title='Syncronise' src='imgs/ic-qcSyncronise.png'></li>");
								}
							}
						}
						$(".zephyrExpand").removeClass("stopPointerEvent");
						$(document.body).css({'cursor' : 'default'});	
						unblockUI();
					},
					function(error) {	unblockUI(); console.log("Error in zephyrController.js file loginZephyrServer method! \r\n "+(error.data));
					});
					if(getParent.hasClass("Tfolnode"))	$(this).prop("src","imgs/ic-qcCollapse.png");
				}
		}
		$('.scrollbar-inner').scrollbar();
	});
	
	//Select testset
	$(document).on('click','.testcaselink', function(){
		$('.testcaselink').removeClass("selectedToMap");
		$('.testcaselink').find(".zephyrSyncronise, .zephyrUndoSyncronise").hide();
		$('.testcaselink').prop("style","background-color:none;border-radius:0px;");
		$(this).addClass("selectedToMap");
		$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
		$(this).find(".zephyrSyncronise, .zephyrUndoSyncronise").show();
	});
	$(document).on('click','.testScenariolink', function(){
		
		$('.selectedToMap').prop("style","background-color:none;border-radius:0px;");
		$(this).siblings().removeClass("selectedToMap");
	//	$(this).siblings().prop("style","background-color:none;border-radius:0px;");
		$(this).addClass("selectedToMap");
		$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
		
	});

	//Undo Mapping
	$(document).on('click', ".zephyrUndoSyncronise", function(){
		var zephyrtestcaseid = $(this).parent().find('span.zephyrTestcaseId')[0].innerText;
		for(var i=0;i<mappedList.length;i++){
			if(zephyrtestcaseid == mappedList[i].testid){
				delete mappedList[i];
				mappedList =  mappedList.filter(function(n){ return n != null; });
				$('.testScenariolink').removeClass("selectedToMap");
				$('.testScenariolink').prop("style","background-color:none;border-radius:0px;");
				$(this).parent().css({"background-color":"rgb(225, 255, 255)"});
				$(this).siblings(".zephyrSyncronise").show();
				break;
			}
		}
	});

	// Mapping
	$(document).on('click', ".zephyrSyncronise", function(event){
		var projectid = $(".zephyrSelectProject option:selected").data("projectid");
		var releaseid = $(".zephyrSelectRelease option:selected").data("releaseid");
		var treeid = $(this).parent().parent().prev()[0].getAttribute('data-phaseid');
		var testid = $(this).parent().find('span.zephyrTestcaseId')[0].innerText;
		var testname = $(this).parent().find('span.zephyrTestcaseName')[0].innerText;
		// }
		var AvoAssureScenarioId = $(".zephyrAvoAssureTreeContainer").find(".selectedToMap").data("scenarioid");
		
		if(!releaseid)	openModelPopup("Save Mapped Testcase", "Please select project and release");
		else if(!testid) openModelPopup("Save Mapped Testcase", "Please select Testcase");
		else if(!AvoAssureScenarioId)	openModelPopup("Save Mapped Testcase", "Please select scenario");
		else{
			mappedList.push({
				// 'project': getDomainName,
				'projectid': projectid,			
				'releaseid': releaseid,
				'treeid': treeid,
				'testid': testid,
				'testname': testname,
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
			zephyrServices.saveZephyrDetails_ICE(mappedList)
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
					$('.testcaselink').find(".zephyrSyncronise, .zephyrUndoSyncronise").hide();
					$('.testcaselink, .testScenariolink').prop("style","background-color:none;border-radius:0px;");
					openModelPopup("Save Mapped Testcase", "Saved successfully");
				}
			},
			function(error) {	console.log("Error in ZephyrController.js file mapTestcaseToAvoAssure method! \r\n "+(error.data));
			});
		}
		else 	openModelPopup("Save Mapped Testcase", "Map Testcases before save");
	};

	$scope.displayMappedFilesTab = function(){
		blockUI("Loading...");
		var userid = JSON.parse(window.localStorage['_UI']).user_id;
		zephyrServices.viewZephyrMappedList_ICE(userid)
		.then(function(data){
			data.sort(function(a,b) {
				if (a.qctestcase > b.qctestcase) return 1;
			    else if (a.qctestcase < b.qctestcase) return -1;
			    else return 0;
			});
			if(data.length > 0){
				$(".zephyrActionBtn, .leftZephyrStructure, .rightZephyrStructure").hide();
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
		function(error) {	console.log("Error in zephyrController.js file viewZephyrMappedList_ICE method! \r\n "+(error.data));
		});		
	};

	$scope.exitZephyrConnection = function(){
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