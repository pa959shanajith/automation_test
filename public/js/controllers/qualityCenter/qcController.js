mySPA.controller('qcController',['$scope', '$rootScope', '$window','$http','$location','$timeout','qcServices','cfpLoadingBar', 'socket', function($scope, $rootScope, $window,$http,$location,$timeout,qcServices,cfpLoadingBar,socket) {
	$('.scrollbar-inner').scrollbar();
	var avoAssureProjectsDetails;
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerText = new Date().getFullYear();
		$("#loginToQCpop").modal("show");
		$("#testPlanTab").trigger("click");
	}, 500);
	var mappedList = [];
	var undoMapList = [];
	var undoMapIdList = [];
	if(window.localStorage['navigateScreen'] != "p_ALM"){
		return $rootScope.redirectPage();
	}

	$("body").css("background", "#eee");
	
	$(".selectBrowser").click(function(){
		$(".selectBrowser").find("img").removeClass("selectedIcon");
		$(this).find("img").addClass("selectedIcon");
	});
	// $scope.loadDomains = function(){
	// 	var domainData = $scope.domainData;
	// 	if(domainData){
	// 		$timeout(function(){
	// 			if((domainData != undefined || domainData != "") && domainData.domain.length > 0){
	// 				$(".qcSelectDomain").empty();
	// 				$(".qcSelectDomain").append("<option selected disabled>Select Domain</option>");
	// 				for(var i=0;i<domainData.domain.length;i++){
	// 					$(".qcSelectDomain").append("<option value='"+domainData.domain[i]+"'>"+domainData.domain[i]+"</option>");
	// 				}
	// 			}
	// 		}, 500);
	// 	}
	// };

	socket.on('ICEnotAvailable', function () {
		unblockUI();
		openModelPopup("ALM Connection", "ICE Engine is not available, Please run the batch file and connect to the Server.");
	});

	//login to QC
	$scope.loginQCServer = function($event){
		$(".qcLoginload").show();
		//$("#qcName,#qcUserName,#qcPwd,.qcConnsubmit").prop("disabled",true);
		$("#qcName,#qcUserName,#qcPwd").css("background","none");
		$("#qcErrorMsg").text("");
		$("#qcName,#qcUserName,#qcPwd").removeClass("inputErrorBorder");
		var qcURL = $("#qcName").val();
		var qcUserName =$("#qcUserName").val();
		var qcPassword = $("#qcPwd").val();
		if(!qcURL){
			$("#qcErrorMsg").text("Please Enter URL.");
			$("#qcName").addClass("inputErrorBorder");
			$(".qcLoginload").hide();
		}
		else if(!qcUserName){
			$("#qcErrorMsg").text("Please Enter User Name.");
			$("#qcUserName").addClass("inputErrorBorder");
			$(".qcLoginload").hide();
		}
		else if(!qcPassword){
			$("#qcErrorMsg").text("Please Enter Password.");
			$("#qcPwd").addClass("inputErrorBorder");
			$(".qcLoginload").hide();
		}
		else{
			$("#qcPwd").removeClass("inputErrorBorder");
			qcServices.loginQCServer_ICE(qcURL,qcUserName,qcPassword)
			.then(function(data){
				$scope.domainData = data;
				$(".qcLoginload").hide();
				//$("#qcName,#qcUserName,#qcPwd,.qcConnsubmit").prop("disabled",false);
				if(data == "unavailableLocalServer"){
					$("#qcErrorMsg").text("ICE Engine is not available,Please run the batch file and connect to the Server.");
				} else if(data == "scheduleModeOn") {
					$("#qcErrorMsg").text("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
				} else if(data == "Invalid Session"){
					//$("#qcErrorMsg").text("Invalid Session");
					return $rootScope.redirectPage();
				} else if(data == "invalidcredentials"){
					$("#qcErrorMsg").text("Invalid Credentials");
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
					$(".qcSelectDomain").append("<option selected disabled>Select Domain</option>");
					for(var i=0;i<data.domain.length;i++){
						$(".qcSelectDomain").append("<option value='"+data.domain[i]+"'>"+data.domain[i]+"</option>");
					}
					$("#loginToQCpop").modal("hide");
					$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">User Name :</span><span class="content">'+qcUserName+'</span></p>');
					//Transaction Activity for ALMLogin Submit Button Action
					// var labelArr = [];
					// var infoArr = [];
					// labelArr.push(txnHistory.codesDict['SubmitALMLogin']);
					// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
				}
			},
			function(error) {	console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
			});
		}
	}; 

	$scope.goBacktoPlugin = function($event){
		//Transaction Activity for ALMLogin Cancel Button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['CancelALMLogin']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
		window.localStorage['navigateScreen'] = "p_Integration";
		window.location.assign('p_Integration');
	};

	$scope.hideMappedFilesTab = function(){
		$scope.testLabGenerator = false;
		$(".mappedFiles, .mappedFilesLabel").hide();
		$("#page-taskName span").text("ALM Integration");
		$(".totalcountbx").hide();
		$(".almtestcasesbx").hide();
		$(".scenariobx").hide();
		$(".qcActionBtn, .leftQcStructure, .rightQcStructure").show();
	};

	//Select Domains
	$(document).on('change', ".qcSelectDomain", function(){
		$(document.body).css({'cursor' : 'wait'});
		$(".qcSelectDomain, .qcSelectProject").prop("disabled", true);
		var getDomain = $(this).children("option:selected").val();
		blockUI('Loading....');
		qcServices.qcProjectDetails_ICE(getDomain)
			.then(function(data){
				avoAssureProjectsDetails = data.avoassure_projects;
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
					$(".qcSelectProject").empty();
					$(".qcSelectProject").append("<option value='' selected disabled>Select Project</option>");
					for(var i=0;i<data.qc_projects.length;i++){
						$(".qcSelectProject").append("<option value='"+data.qc_projects[i]+"'>"+data.qc_projects[i]+"</option>");
					}
					$(".qcAvoAssureSelectProject").empty();					
					$(".qcAvoAssureSelectProject").append("<option value='' selected disabled>Select Project</option>");
					for(var i=0;i<data.avoassure_projects.length;i++){
						$(".qcAvoAssureSelectProject").append("<option value='"+data.avoassure_projects[i].project_id+"'>"+data.avoassure_projects[i].project_name+"</option>");
					}
					$(document.body).css({'cursor' : 'default'});
				}
				$(".qcSelectDomain, .qcSelectProject").prop("disabled", false);
				unblockUI();
			},
			function(error) {	unblockUI(); 
				console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
			});
	});

	//Select QC projects
	$(document).on("change", ".qcSelectProject", function(){
		var getProjectName = $(".qcSelectProject option:selected").val();
		var getDomainName = $(".qcSelectDomain option:selected").val();
		blockUI("Loading...");
		qcServices.qcFolderDetails_ICE("folder",getProjectName,getDomainName,"root")
			.then(function(data){
				var structContainer = $(".qcTreeContainer");
				structContainer.empty();
				structContainer.append("<ul class='root scrollbar-inner'><li class='testfolder_'><img class='qcCollapse' title='expand' style='height: 16px;' src='imgs/ic-qcCollapse.png'><label title='Root'>Root</label></li></ul>");
				if("testfolder" in data[0] && data[0].testfolder.length > 0){
					for(var i=0; i<data[0].testfolder.length; i++){
						if(i == 0){				
							structContainer.find(".root").append("<ul></ul>");
						}
						structContainer.find(".root ul").append("<li class='Tfolnode' testfolder_"+(i+1)+" data-folderpath='"+data[0].testfolder[i].folderpath+"'><img class='qcExpand qcExpandFolder selectedQcNode' title='expand' style='height: 16px;' src='imgs/ic-qcExpand.png'><label title='"+data[0].testfolder[i].foldername+"'>"+data[0].testfolder[i].foldername+"</label></li>");
					}
				}
				if("TestSet" in data[0] && data[0].TestSet.length > 0){
					for(var j=0; j<data[0].TestSet.length; j++){
						structContainer.find(".root ul").append("<li class='Tsetnode testSet_"+(j+1)+"' data-testsetpath='"+data[0].TestSet[j].testsetpath+"' data-testsetid='"+data[0].TestSet[j].testsetid+"'><img class='qcExpand qcExpandTestset selectedQcNode' title='expand' style='height: 16px;' src='imgs/ic-taskType-blue-plus.png'><label title='"+data[0].TestSet[j].testset+"'>"+data[0].TestSet[j].testset+"</label></li>");
					}
				}
				unblockUI();				
			},
			function(error) {	console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
			});
			$('.scrollbar-inner').scrollbar();
	});

	//Select Avo Assure projects
	$(document).on("change", ".qcAvoAssureSelectProject", function(){
		var getProject = $(this).children("option:selected").val();
		for(var i=0; i<avoAssureProjectsDetails.length; i++){
			if(getProject == avoAssureProjectsDetails[i].project_id){
				var qcAvoAssureContainer = $(".qcAvoAssureTreeContainer");
				qcAvoAssureContainer.empty();
				qcAvoAssureContainer.append("<ul class='scrollbar-inner'></ul>");
				var scnDetails = avoAssureProjectsDetails[i].scenario_details;
				if(scnDetails.length >0){
					for(var j=0; j<scnDetails.length; j++){
						qcAvoAssureContainer.find("ul").append("<li class='testSet testScenariolink' data-scenarioid='"+scnDetails[j]._id+"'><label title='"+scnDetails[j].name+"'>"+scnDetails[j].name+"</label></li>");
					}
					//if(scnDetails.length >= 25)
					$('.scrollbar-inner').scrollbar();
					$(".searchScenarioAvoAssure").show();
				} else{
					qcAvoAssureContainer.append("This project does not contain any scenarios");
					$(".searchScenarioAvoAssure").hide();
				}
			}
		}
	});

	//Search scenarios
	var flgTog = 1;
	$(document).on('click', ".searchScenarioAvoAssure", function(){
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
	});

	$(document).on('keyup', '.searchScenarioQC', function() {
		filter(this);
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
	$(document).on('click','.testcaselink', function(e){
		// $('.testcaselink').removeClass("selectedToMap");
		// $('.testcaselink').find(".qcSyncronise, .qcUndoSyncronise").hide();
		// $('.testcaselink').prop("style","background-color:none;border-radius:0px;");
		// $(this).addClass("selectedToMap");
		if($(this).hasClass("selectedToMap") && !e.ctrlKey) {
			$('.testcaselink').find(".qcSyncronise, .qcUndoSyncronise").hide();
			$('.testcaselink').prop("style","background-color:none;border-radius:0px;");
			$('.testcaselink').removeClass("selectedToMap");
			$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
			$(this).find(".qcSyncronise, .qcUndoSyncronise").show();
			$(this).addClass("selectedToMap");
		} else if($(this).hasClass("selectedToMap")) {
			$(this).removeClass("selectedToMap");
			$(this).prop("style","background-color:none;border-radius:0px;");
			$(this).find(".qcSyncronise, .qcUndoSyncronise").hide();
		} else if (e.ctrlKey) {
			// $(this).addClass("selectedToMap");
			$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
			$(this).find(".qcSyncronise, .qcUndoSyncronise").show();
			$(this).addClass("selectedToMap");
		}
		else {
			// $(this).addClass("selectedToMap");
			// $('.testcaselink').removeClass("selectedToMap");
			$('.testcaselink').find(".qcSyncronise, .qcUndoSyncronise").hide();
			$('.testcaselink').prop("style","background-color:none;border-radius:0px;");
			$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
			$(this).find(".qcSyncronise, .qcUndoSyncronise").show();
			$(this).addClass("selectedToMap");
		}
		e.stopPropagation();
	});
	$(document).on('click','.testScenariolink', function(e){
		if($(this).hasClass("selectedToMap") && !e.ctrlKey) {
			$('.testScenariolink').prop("style","background-color:none;border-radius:0px;");
			$('.testScenariolink').removeClass("selectedToMap");
			$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
			$(this).addClass("selectedToMap");
		} else if($(this).hasClass("selectedToMap")) {
			$(this).removeClass("selectedToMap");
			$(this).prop("style","background-color:none;border-radius:0px;");
		} else if (e.ctrlKey) {
			// $(this).addClass("selectedToMap");
			$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
			$(this).addClass("selectedToMap");
		}
		else {
			// $(this).addClass("selectedToMap");
			// $('.testcaselink').removeClass("selectedToMap");
			$('.testScenariolink').prop("style","background-color:none;border-radius:0px;");
			$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
			$(this).addClass("selectedToMap");
		}
		e.stopPropagation();
		//ols
		// $(this).addClass("selectedToMap");
		// if (e.ctrlKey) {
		// 	$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
		// } else {
		// 	$('.testScenariolink').prop("style","background-color:none;border-radius:0px;");
		// 	$(this).prop("style","background-color:#E1CAFF;border-radius:5px;");
		// }		
	});

	$(document).on('click','.almtestScenariolink', function(e){
		$('.almtestcaselink').css({"background-color":"#fad7f1fb"});
		$('.almtestcaselink').find(".viewUndoSyncronise").hide();
		var mapid = $(this).parent().data("mapid");
		if($(this).hasClass("selectedToMap") && !e.ctrlKey) {
			$('.almtestScenariolink').css({"background-color": "#E1CAFF"});
			$('.almtestScenariolink').find(".viewUndoSyncronise").hide();
			$('.almtestScenariolink label').removeClass("selectedToMap");
			$(this).css({"background-color": "#c8c8ff"});
			$(this).find(".viewUndoSyncronise").show();
			$(this).addClass("selectedToMap");
		} else if($(this).hasClass("selectedToMap")) {
			$(this).removeClass("selectedToMap");
			$(this).css({"background-color": "#E1CAFF"});
			$(this).find(".viewUndoSyncronise").hide();
		} else if (e.ctrlKey) {
			$(this).css({"background-color": "#c8c8ff"});
			$(this).find(".viewUndoSyncronise").show();
			$(this).addClass("selectedToMap");
		} else {
			$('.almtestScenariolink').css({"background-color": "#E1CAFF"});
			$('.almtestScenariolink').find(".viewUndoSyncronise").hide();
			$(this).css({"background-color": "#c8c8ff"});
			$(this).find(".viewUndoSyncronise").show();
			$(".almtestScenariolink").removeClass("selectedToMap");
			$(this).addClass("selectedToMap");
		}	
		e.stopPropagation();
	});

	$(document).on('click','.almtestcaselink', function(e){
		$('.almtestScenariolink').css({"background-color": "#E1CAFF"});
		$('.almtestScenariolink').find(".viewUndoSyncronise").hide();

		if($(this).hasClass("selectedToMap") && !e.ctrlKey) {
			$('.almtestcaselink').css({"background-color": "#fad7f1fb"});
			$('.almtestcaselink').find(".viewUndoSyncronise").hide();
			$('.almtestcaselink label').removeClass("selectedToMap");
			$(this).css({"background-color": "#c8c8e6"});
			$(this).find(".viewUndoSyncronise").show();
			$(this).addClass("selectedToMap");
		} else if($(this).hasClass("selectedToMap")) {
			$(this).removeClass("selectedToMap");
			$(this).css({"background-color": "#fad7f1fb"});
			$(this).find(".viewUndoSyncronise").hide();
		} else if (e.ctrlKey) {
			$(this).css({"background-color": "#c8c8e6"});
			$(this).find(".viewUndoSyncronise").show();
			$(this).addClass("selectedToMap");
		} else {
			$('.almtestcaselink').css({"background-color": "#fad7f1fb"});
			$('.almtestcaselink').find(".viewUndoSyncronise").hide();
			$(this).css({"background-color": "#c8c8e6"});
			$(this).find(".viewUndoSyncronise").show();
			$(this).addClass("selectedToMap");
		}	
		e.stopPropagation();	
	});

	$(document).on('click', ".arrowdown", function(event) {
		var maplist = $(this).parents("div")[0].classList[1];
		$('.'+maplist).find(".viewTab").css({"display":"block"});
		if($(this).parent().hasClass("almtestcaselink")) {
			var labList = $('.'+maplist).find(".almtestcaselink");
			labList[0].style["border-radius"] = "5px 5px 0px 0px";
			labList[labList.length-1].style["border-radius"] = "0px 0px 5px 5px";
		} else if ($(this).parent().hasClass("almtestScenariolink")) {
			var labList = $('.'+maplist).find(".almtestScenariolink");
			labList[0].style["border-radius"] = "5px 5px 0px 0px";
			labList[labList.length-1].style["border-radius"] = "0px 0px 5px 5px";
		}
		$(this).hide();
		$(this).siblings(".arrowup").show();
		event.stopPropagation();
	});

	$(document).on('click', ".arrowup", function(event) {
		var maplist = $(this).parents("div")[0].classList[1];
		var styleattr = $('.'+maplist).find(".viewTab");
		for(var i=2;i<styleattr.length;++i) {
			styleattr[i].style["display"] = "none";
		}
		if($(this).parent().hasClass("almtestcaselink")) {
			var labList = $('.'+maplist).find(".almtestcaselink");
			labList[0].style["border-radius"] = "5px";
		} else if ($(this).parent("label").hasClass("almtestScenariolink")) {
			var labList = $('.'+maplist).find(".almtestScenariolink");
			labList[0].style["border-radius"] = "5px";
		}
		$(this).hide();
		$(this).siblings(".arrowdown").show();
		event.stopPropagation();
	});


	$(document).on('click', ".viewUndoSyncronise", function(event){
		var undoMapItems = $(".selectedToMap");
		for (var i=0;i<undoMapItems.length;++i) {
			var mapid = undoMapItems[i].parentElement.getAttribute("data-mapid");

			//scenid
			if(undoMapItems[i].classList.contains('almtestScenariolink')) {
				var scenId = undoMapItems[i].getAttribute("data-testscenid")
				if (undoMapIdList.length == 0){
					var newObj = {
						'mapid': mapid,
						'testscenarioid': []
					};
					newObj.testscenarioid.push(scenId);
					undoMapList.push(newObj);
					undoMapIdList.push(mapid);
				} else if (undoMapIdList.indexOf(mapid) == -1){
					var newObj = {
						'mapid': mapid,
						'testscenarioid': []
					};
					newObj.testscenarioid.push(scenId);
					undoMapList.push(newObj);
					undoMapIdList.push(mapid);
				} else {
					for (var j=0;j<undoMapList.length;++j) {
						if (undoMapList[j].mapid == mapid) {
							undoMapList[j].testscenarioid.push(scenId);
						}
					}
				}
			}

			//testcase
			if(undoMapItems[i].classList.contains('almtestcaselink')) {
				var testcase = undoMapItems[i].innerText.trim();
				if (undoMapIdList.length == 0){
					var newObj = {
						'mapid': mapid,
						'qctestcase': []
					};
					newObj.qctestcase.push(testcase);
					undoMapList.push(newObj);
					undoMapIdList.push(mapid);
				} else if (undoMapIdList.indexOf(mapid) == -1){
					var newObj = {
						'mapid': mapid,
						'qctestcase': []
					};
					newObj.qctestcase.push(testcase);
					undoMapList.push(newObj);
					undoMapIdList.push(mapid);
				} else {
					for (var j=0;j<undoMapList.length;++j) {
						if (undoMapList[j].mapid == mapid) {
							undoMapList[j].qctestcase.push(testcase);
						}
					}
				}
			}
		}
		undoMapItems.find(".viewUndoSyncronise").hide();
		event.stopPropagation();
	});

	//Save unsync details
	$scope.saveUnsyncDetails = function(){
		if(undoMapList.length > 0){
			qcServices.saveUnsyncDetails(undoMapList)
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
					undoMapList = [];
					$('.almtestScenariolink, .almtestcaselink').removeClass("selectedToMap");
					$('.almtestScenariolink').find(".viewUndoSyncronise").hide();
					$('.almtestcaselink').find(".viewUndoSyncronise").hide();
					$('.almtestcaselink').css({"background-color":"#fad7f1fb"});
					$('.almtestScenariolink').css({"background-color": "#E1CAFF"});
					openModelPopup("Save Mapped Testcase", "Saved successfully");
				}
			},
			function(error) {	console.log("Error in qcController.js file mapTestcaseToAvoAssure method! \r\n "+(error.data));
			});
		}
		else 	openModelPopup("Save Mapped Testcase", "Map Testcases before save");
	};

	// Undo Mapping
	$(document).on('click', ".qcUndoSyncronise", function(){
	var selectedToMap = $(".qcTreeContainer").find(".selectedToMap")
	var qcTestcase = []
	for(var i=0;i<selectedToMap.length;i++){
		qcTestcase.push(selectedToMap[i].innerText.trim())
	}
	var qcTestsetName = $(this).parent("li").parent("ul").prev("li").find('label').text();
	for(var i=0;i<mappedList.length;i++){
		var mappedTcList = mappedList[i].testcase
		if (qcTestcase.length==mappedTcList.length){
			if(qcTestsetName == mappedList[i].testset){
				delete mappedList[i];
				mappedList =  mappedList.filter(function(n){ return n != null; });
				var selectedList = $(".selectedToMap").siblings("label").prevObject
				for(var i=0;i<selectedList.length;i++){
					selectedList[i].style.cssText = "background-color: rgb(225, 202, 255)";
					selectedList[i].children[2].style.cssText="display:inline";
				}
				}
			}
		}
	});

	// Mapping
	$(document).on('click', ".qcSyncronise", function(event){
		var getDomainName = $(".qcSelectDomain option:selected").val();
		var getProjectName = $(".qcSelectProject option:selected").val();
		var qcTestcaseNameList = []
		var selectedElements=$(".qcTreeContainer").find(".selectedToMap").siblings("label").prevObject
		for(var i=0;i<selectedElements.length;i++){
			var cur_obj =  selectedElements[i].innerText
			qcTestcaseNameList.push(cur_obj)
		}
		var avoAssureScenarioList = []
		var scenarioElements = $(".qcAvoAssureTreeContainer").find(".selectedToMap");
		for(var i=0;i<scenarioElements.length;i++){
			var cur_obj = scenarioElements[i].getAttribute("data-scenarioid")
			avoAssureScenarioList.push(cur_obj)
		}

		var qcTestsetName = $(this).parent("li").parent("ul").prev("li").find('label').text();
		var qcFolderPath = $(this).parent("li").parent("ul").prev("li").parent("ul").prev("li").data("folderpath");
		
		if(qcTestcaseNameList.length>1 && avoAssureScenarioList.length>1) {
			openModelPopup("Save Mapped Testcase","Cannot map multiple test cases with multiple scenarios")
		}
		else if(!getDomainName)	openModelPopup("Save Mapped Testcase", "Please select domain");
		else if(!getProjectName)	openModelPopup("Save Mapped Testcase", "Please select project");
		else if(!qcTestcaseNameList)	openModelPopup("Save Mapped Testcase", "Please select Testcase");
		else if(!qcTestsetName)	openModelPopup("Save Mapped Testcase", "Please select Testset");
		else if(!avoAssureScenarioList)  openModelPopup("Save Mapped Testcase", "Please select Scenario");
		else{
			mappedList.push({
				'domain': getDomainName,
				'project': getProjectName,			
				'testcase': qcTestcaseNameList,
				'testset': qcTestsetName,
				'folderpath': qcFolderPath,
				'scenarioId': avoAssureScenarioList,
			});
			for(var i=0;i<selectedElements.length;i++){
				selectedElements[i].style.cssText = "background-color: #ddd";
				selectedElements[i].children[2].style.cssText="display:hide";
			}
			event.stopPropagation();
		}
	});

	//Submit mapped details
	$scope.mapTestcaseToAvoAssure = function(){
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
			function(error) {	console.log("Error in qcController.js file mapTestcaseToAvoAssure method! \r\n "+(error.data));
			});
		}
		else 	openModelPopup("Save Mapped Testcase", "Map Testcases before save");
	};

	$scope.displayMappedFilesTab = function(){
		blockUI("Loading...");
		var userid = JSON.parse(window.localStorage['_UI']).user_id;
		qcServices.viewQcMappedList_ICE(userid)
		.then(function(data){
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
				var totalMapping = data.length;
				var almTestCaseMapping = 0;
				var scenarioMapping = 0;
				for(var i=0;i<data.length;i++){
					var data_list = ''+data[i].qctestcase
					var scenarios = ''+data[i].testscenarioname
					data_list=data_list.replaceAll(',', ',<br>')
					scenarioList = scenarios.replaceAll(',',',<br>')
					$(".mappedFiles").append('<div class="linkedTestset mapline'+i+'" data-mapid="'+data[i]._id+'"></div>');  //testscenarioname ??
					var maxLen = data[i].testscenarioname.length>=data[i].qctestcase.length ? data[i].testscenarioname.length : data[i].qctestcase.length;
					for( var j=0;j<maxLen;++j) {
						if(j==0 && data[i].testscenarioname.length >1){
							$(".mappedFiles").find(".mapline"+i).append('<label class="almtestScenariolink viewTab" style="display:block; float: left; width: 40%; background-color: #E1CAFF; margin-bottom: 0px; border-radius: 5px" data-testscenid="'+data[i].testscenarioid[j]+'">'+data[i].testscenarioname[j]+'<span class="viewImageSpan"><img   class="viewUndoSyncronise" title="Undo" src="imgs/ic-qcUndoSyncronise.png"><img class="arrowdown" style="float:right; height:22px;" src="imgs/alm_arrow_down.svg"><img class="arrowup" style="float:right; height:22px; display:none;" src="imgs/alm_arrow_up.svg"></span></label>');
							scenarioMapping+=1;
						} else if(j==0 && data[i].testscenarioname.length ==1) {
							$(".mappedFiles").find(".mapline"+i).append('<label class="almtestScenariolink viewTab" style="display:block; float: left; width: 40%; background-color: #E1CAFF; margin-bottom: 0px; border-radius: 5px" data-testscenid="'+data[i].testscenarioid[j]+'">'+data[i].testscenarioname[j]+'<span class="viewImageSpan"><img   class="viewUndoSyncronise" title="Undo" src="imgs/ic-qcUndoSyncronise.png"></span></label>');
							scenarioMapping+=1;
						} else if(j< data[i].testscenarioname.length) {
							$(".mappedFiles").find(".mapline"+i).append('<label class="almtestScenariolink viewTab" style="display:none; float: left; width: 40%; background-color: #E1CAFF; margin-bottom: 0px; border-radius: 0px" data-testscenid="'+data[i].testscenarioid[j]+'">'+data[i].testscenarioname[j]+'<span class="viewImageSpan"><img   class="viewUndoSyncronise" title="Undo" src="imgs/ic-qcUndoSyncronise.png"></span></label>');
							scenarioMapping+=1;
						} else {
							$(".mappedFiles").find(".mapline"+i).append('<label class="viewTab" style="display:none; float: left; width: 40%; margin-bottom: 0px; height: 32px;"></label>');
						}
						if(j==0 && data[i].qctestcase.length >1){
							$(".mappedFiles").find(".mapline"+i).append('<label class="almtestcaselink viewTab" style="display:block; float: right; width: 50%; background-color: #fad7f1fb; margin-bottom: 0px; border-radius: 5px" data-qcdomain="'+data[i].qcdomain+'" data-qcfolderpath="'+data[i].qcfolderpath+'" data-qcproject="'+data[i].qcproject+'">'+data[i].qctestcase[j]+'<span class="viewImageSpan"><img  class="viewUndoSyncronise" title="Undo" src="imgs/ic-qcUndoSyncronise.png"><img class="arrowdown" style="height:22px;float:right;" src="imgs/alm_arrow_down.svg"><img class="arrowup" style="display:none; float:right; height:22px;" src="imgs/alm_arrow_up.svg"></span></label>');
							almTestCaseMapping+=1;
						} else if(j==0 && data[i].qctestcase.length ==1) {
							$(".mappedFiles").find(".mapline"+i).append('<label class="almtestcaselink viewTab" style="display:block; float: right; width: 50%; background-color: #fad7f1fb; margin-bottom: 0px; border-radius: 5px" data-qcdomain="'+data[i].qcdomain+'" data-qcfolderpath="'+data[i].qcfolderpath+'" data-qcproject="'+data[i].qcproject+'">'+data[i].qctestcase[j]+'<span class="viewImageSpan"><img  class="viewUndoSyncronise" title="Undo" src="imgs/ic-qcUndoSyncronise.png"></span></label>');
							almTestCaseMapping+=1;
						} else if(j< data[i].qctestcase.length) {
							$(".mappedFiles").find(".mapline"+i).append('<label class="almtestcaselink viewTab" style="display:none; float: right; width: 50%; background-color: #fad7f1fb; margin-bottom: 0px; border-radius: 0px" data-qcdomain="'+data[i].qcdomain+'" data-qcfolderpath="'+data[i].qcfolderpath+'" data-qcproject="'+data[i].qcproject+'">'+data[i].qctestcase[j]+'<span class="viewImageSpan"><img  class="viewUndoSyncronise" title="Undo" src="imgs/ic-qcUndoSyncronise.png"></span></label>');
							almTestCaseMapping+=1;
						} else {
							$(".mappedFiles").find(".mapline"+i).append('<label class="viewTab" style="display:none; float: right; width: 50%; margin-bottom: 0px; height: 32px;"></label>');
						}
					} 
				}	
				$(".totalcountbx").show();
				$(".almtestcasesbx").show();
				$(".scenariobx").show();
				$(".totalcountbx")[0].innerHTML = "Total Mappings<br>"+totalMapping;
				$(".almtestcasesbx")[0].innerHTML = "Mapped ALM tests<br>"+almTestCaseMapping;
				$(".scenariobx")[0].innerHTML = "Mapped Scenarios<br>"+scenarioMapping;
				$(".linkedTestset").find(".viewUndoSyncronise").hide();
				$('.scrollbar-inner').scrollbar();
			}
			else{
				openModelPopup("Mapped Testcase", "No mapped details");
			}
			unblockUI();
		},
		function(error) {	console.log("Error in qcController.js file viewQcMappedList_ICE method! \r\n "+(error.data));
		});		
	};

	$scope.exitQcConnection = function(){
		var dataAction = "qcquit";
		qcServices.qcFolderDetails_ICE(dataAction,"","","","")
		.then(function(data){
			if(data == "closedqc"){
				window.localStorage['navigateScreen'] = "p_Integration";
				window.location.href = "/p_Integration";
			}		
		},
		function(error) {	console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
		});
	};

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
	});

	//Adding selection class for Testcase option(right upper section of Test Lab)
	$(document).on('click', '.mtgScenarioList li', function(){
		$(this).siblings().removeClass("selectTestcaseMTG");
		$(this).addClass("selectTestcaseMTG");
	});

	//Adding selection class for Fields required option(left bottom section of Test Lab)
	$(document).on('click', '.almfieldsList ul li', function(){
		$(this).siblings().removeClass("selectfieldsList");
		$(this).addClass("selectfieldsList");
	});

	//Adding selection class for ALM Fileds option(right bottom section of Test Lab)
	$(document).on('click', '.almFieldExcel li', function(){
		if($(this).find("label").text() != "Subject" && $(this).find("label").text() != "Test Case" && $(this).find("label").text() != "Type"){
			$(this).siblings().removeClass("selectALMExcel");
			$(this).addClass("selectALMExcel");
		}
	});

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
	};

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
			});
		}
	};

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
		});
		testcasedetails["testLabdetails"] = testLabdetails;
	};
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