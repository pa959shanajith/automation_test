mySPA.controller('qcController',['$scope','$window','$http','$location','$timeout','qcServices','cfpLoadingBar', function($scope,$window,$http,$location,$timeout,qcServices,cfpLoadingBar) {
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
	if(window.localStorage['navigateScreen'] != "p_QualityCenter")
	{
		window.location.href = "/";
	}

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
	//login to QC
	$scope.loginQCServer = function(){
		$("#qcErrorMsg").text("");
		$("#qcName,#qcUserName,#qcPwd").removeClass("inputErrorBorder");
		var qcURL = $("#qcName").val();
		var qcUserName = $("#qcUserName").val();
		var qcPassword = $("#qcPwd").val();
		if(!qcURL)	$("#qcName").addClass("inputErrorBorder");
		else if(!qcUserName)	$("#qcUserName").addClass("inputErrorBorder");
		else if(!qcPassword)	$("#qcPwd").addClass("inputErrorBorder");
		else{
			$("#qcPwd").removeClass("inputErrorBorder");
			qcServices.loginQCServer_ICE(qcURL,qcUserName,qcPassword)
			.then(function(data){
				$scope.domainData = data;
				//$("#loginToQCpop").modal("hide");
				if(data == "unavailableLocalServer"){
					$("#qcErrorMsg").text("Unavailable LocalServer");
				}
				else if(data == "Invalid Session"){
					$("#qcErrorMsg").text("Invalid Session");
				}
				else if(data == "invalidcredentials"){
					$("#qcErrorMsg").text("Invalid Credentials");
				}				
				else if(data){
					$(".qcSelectDomain").empty();
					$(".qcSelectDomain").append("<option selected disabled>Select Domain</option>")
					for(var i=0;i<data.domain.length;i++){
						$(".qcSelectDomain").append("<option value='"+data.domain[i]+"'>"+data.domain[i]+"</option>");
					}
					$("#loginToQCpop").modal("hide");
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
		$(".mappedFiles").hide();
		$("#page-taskName span").text("ALM Integration");
		$(".qcActionBtn, .leftQcStructure, .rightQcStructure").show();
	}

	//Select Domains
	$(document).on('change', ".qcSelectDomain", function(){
		var getDomain = $(this).children("option:selected").val();
		qcServices.qcProjectDetails_ICE(getDomain)
			.then(function(data){
				nineteen68_projects_details = data.nineteen68_projects;
				if(data == "unavailableLocalServer"){
					openModelPopup("ALM Connection", "unavailableLocalServer")
				}
				else if(data == "Invalid Session"){
					openModelPopup("ALM Connection", "Invalid Session")
				}
				else if(data){
					$(".qcSelectProject").empty();
					$(".qcSelectProject").append("<option value='' selected>Select Project</option>");
					for(var i=0;i<data.qc_projects.length;i++){
						$(".qcSelectProject").append("<option value='"+data.qc_projects[i]+"'>"+data.qc_projects[i]+"</option>");
					}
					$(".qcN68SelectProject").empty();					
					$(".qcN68SelectProject").append("<option value='' selected>Select Project</option>");
					for(var i=0;i<data.nineteen68_projects.length;i++){
						$(".qcN68SelectProject").append("<option value='"+data.nineteen68_projects[i].project_id+"'>"+data.nineteen68_projects[i].project_name+"</option>");
					}
					
				}
			},
			function(error) {	console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
			});
	})

	//Select QC projects
	$(document).on("change", ".qcSelectProject", function(){
		var getProjectName = $(".qcSelectProject option:selected").val();
		var getDomainName = $(".qcSelectDomain option:selected").val();
		qcServices.qcFolderDetails_ICE("folder",getProjectName,getDomainName,"root")
			.then(function(data){				
				var structContainer = $(".qcTreeContainer");
				structContainer.empty();
				structContainer.append("<ul class='root'><li class='testfolder_'><img class='qcCollapse' title='expand' style='height: 16px;' src='imgs/ic-qcCollapse.png'><label title='Root'>Root</label></li></ul>")
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
				N68Container.append("<ul></ul>")
				for(var j=0; j<nineteen68_projects_details[i].scenario_details.length; j++){
					N68Container.find("ul").append("<li class='testSet testScenariolink' data-scenarioid='"+nineteen68_projects_details[i].scenario_details[j].testscenarioid+"'><label title='"+nineteen68_projects_details[i].scenario_details[j].testscenarioname+"'>"+nineteen68_projects_details[i].scenario_details[j].testscenarioname+"</label></li>")
				}
			}
		}
	});

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
				getParent.addClass("qcCollapse");
				if(getParent.hasClass("Tfolnode"))	$(this).prop("src","imgs/ic-qcCollapse.png");
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
					},
					function(error) {	console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
					});
					$('.scrollbar-inner').scrollbar();
			}
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

	//Mapping
	$(document).on('click', ".qcUndoSyncronise", function(){
		var qcTestcaseName = $(this).siblings("label").text();
		var qcTestsetName = $(this).parent("li").parent("ul").prev("li").find('label').text();
		for(var i=0;i<mappedList.length;i++){
			if(qcTestcaseName == mappedList[i].testcase && qcTestsetName == mappedList[i].testset){
				delete mappedList[i];
				mappedList =  mappedList.filter(function(n){ return n != null });
				$('.testScenariolink').removeClass("selectedToMap");
				$('.testScenariolink').prop("style","background-color:none;border-radius:0px;");
				break;
			}
		}
	})

	//Undo Mapping
	$(document).on('click', ".qcSyncronise", function(){
		var getDomainName = $(".qcSelectDomain option:selected").val();
		var getProjectName = $(".qcSelectProject option:selected").val();
		var qcTestcaseName = $(this).siblings("label").text();
		var qcTestsetName = $(this).parent("li").parent("ul").prev("li").find('label').text();
		var qcFolderPath = $(this).parent("li").parent("ul").prev("li").parent("ul").prev("li").data("folderpath");
		var N68ScenarioId = $(".qcN68TreeContainer").find(".selectedToMap").data("scenarioid");
		mappedList.push({
			'domain': getDomainName,
			'project': getProjectName,			
			'testcase': qcTestcaseName,
			'testset': qcTestsetName,
			'folderpath': qcFolderPath,
			'scenarioId': N68ScenarioId,
		})
	})

	//Submit mapped details
	$scope.mapTestcaseToN68 = function(){
		qcServices.saveQcDetails_ICE(mappedList)
		.then(function(data){
			if(data == "unavailableLocalServer"){
				openModelPopup("Save Mapped Testcase", "unavailableLocalServer")
			}
			else if(data == "fail"){
				openModelPopup("Save Mapped Testcase", "failed to save")
			}
			else if(data == "success"){
				mappedList = [];
				$('.testcaselink, .testScenariolink').removeClass("selectedToMap");
				$('.testcaselink').find(".qcSyncronise, .qcUndoSyncronise").hide();
				$('.testcaselink, .testScenariolink').prop("style","background-color:none;border-radius:0px;");
				openModelPopup("Save Mapped Testcase", "Saved successfully")
			}
		},
		function(error) {	console.log("Error in qcController.js file mapTestcaseToN68 method! \r\n "+(error.data));
		});		
	}

	$scope.displayMappedFilesTab = function(){
		var userid = JSON.parse(window.localStorage['_UI']).user_id;
		qcServices.viewQcMappedList_ICE(userid)
		.then(function(data){
			if(data.length > 0){
				$(".qcActionBtn, .leftQcStructure, .rightQcStructure").hide();
				$("#page-taskName span").text("Mapped Files");
				$(".mappedFiles").empty().show();
				for(var i=0;i<data.length;i++){
					$(".mappedFiles").append('<div class="linkedTestset"><label data-qcdomain="'+data[i].qcdomain+'" data-qcfolderpath="'+data[i].qcfolderpath+'" data-qcproject="'+data[i].qcproject+'" data-qctestset="'+data[i].qctestset+'">'+data[i].qctestcase+'</label><span class="linkedLine"></span><label data-scenarioid="'+data[i].testscenarioid+'">'+data[i].testscenarioname+'</label></div>')
				}				
				$('.scrollbar-inner').scrollbar();
			}
			else{
				openModelPopup("Mapped Testcase", "No mapped details")
			}
		},
		function(error) {	console.log("Error in qcController.js file viewQcMappedList_ICE method! \r\n "+(error.data));
		});		
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