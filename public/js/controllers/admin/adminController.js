var domainId, DOMAINID, releaseName, cycleName, count=0,delCount=0,editReleaseId='',editCycleId='',deleteReleaseId='',deleteRelid,deleteCycleId='',deleteCycId,taskName,unAssignedFlag=false;var releaseNamesArr =[];
var createprojectObj = {}; var projectDetails = [];var flag;var projectExists;var updateProjectDetails = [];
var editedProjectDetails = [];
var deletedProjectDetails = [];
var newProjectDetails = [];
var unAssignedProjects = []; var assignedProjects = [];var projectData =[];var valid = "";var getAssignedProjectsLen=0;
mySPA.controller('adminController', ['$scope', '$rootScope', '$http', '$location', 'adminServices','$timeout','cfpLoadingBar', function ($scope, $rootScope, $http, $location, adminServices, $timeout, cfpLoadingBar) {
	$("body").css("background","#eee");

	localStorage.setItem("navigateEnable", false);

	$('.dropdown').on('show.bs.dropdown', function (e) {
		$(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
	});

	$scope.ldapConf = {};
	$scope.userConf = {};
	$scope.moveItems = {};
	$scope.assignProj = {};
	$scope.preferences = {};
	$scope.sessionConf = {};
	$scope.tokens = {};
	$('.dropdown').on('hide.bs.dropdown', function (e) {
		$(this).find('.dropdown-menu').first().stop(true, true).slideUp(300);
	});

	$timeout(function(){
		angular.element('#userTab').triggerHandler('click');
		cfpLoadingBar.complete();
	}, 500);

	$(document).on('change', '#selAssignUser', function (e) {
		$scope.assignedProjectInitial = [];
		$scope.assignProj.allProjectAP = [];
		$scope.assignProj.assignedProjectAP = [];
		$(".load").show();
		$("#selAssignUser, #rightall, #rightgo, #leftgo, #leftall, .adminBtn").prop("disabled", true);
		$("#overlayContainer").prop("style", "opacity: 1;");
		adminServices.getDomains_ICE()
		.then(function (data) {
			if (data == "Invalid Session") {
				$rootScope.redirectPage();
			} else {
				domainId = data[0].domainId;
				$("#selAssignProject").val(data[0].domainName);
				$scope.assignProj.allProjectAP = [];
				$scope.assignProj.assignedProjectAP = [];
				//var domainId = data[0].domainId;
				//var requestedids = domainId;
				//var domains = [];
				var requestedids = [];
				requestedids.push(domainId);
				//console.log("Domain", domains);
				//var requestedids = domains.push(domainId);
				var idtype = ["domaindetails"];
				var userId = $("#selAssignUser option:selected").attr("data-id");
				var getAssignProj = {};
				getAssignProj.domainId = domainId;
				getAssignProj.userId = userId;
				var assignedProjectsArr = [];
				var assignedProjectNames = [];
				var unassignedProjectIds = [];
				var unassignedProjectNames = [];
				var unAssignedProjects = {};
				//	getAssignedProjectsLen = 0;

				adminServices.getAssignedProjects_ICE(getAssignProj)
				.then(function (data1) {
					getAssignedProjectsLen = data1.length;
					if (data1 == "Invalid Session") {
						$rootScope.redirectPage();
					}
					$scope.assignProj.assignedProjectAP = [];
					projectData = [];
					projectData = data1;
					if (data1.length > 0) {
						for (var i = 0; i < data1.length; i++) {
							$scope.assignProj.assignedProjectAP.push({'projectid':data1[i].projectId,'projectname':data1[i].projectName});
						}
						$scope.assignedProjectInitial = $scope.assignProj.assignedProjectAP;
						for (var j = 0; j < projectData.length; j++) {
							assignedProjectsArr.push(projectData[j].projectId);
							assignedProjectNames.push(projectData[j].projectName);
						}

						adminServices.getDetails_ICE(idtype, requestedids)
						.then(function (detResponse) {
							if (detResponse == "Invalid Session") {
								$rootScope.redirectPage();
							}
							$scope.assignProj.allProjectAP = [];
							if (detResponse.projectIds.length > 0) {
								for (var k = 0; k < detResponse.projectIds.length; k++) {
									if (!eleContainsInArray(assignedProjectsArr, detResponse.projectIds[k])) {
										unassignedProjectIds.push(detResponse.projectIds[k]);
									}
								}

								for (var l = 0; l < detResponse.projectNames.length; l++) {
									if (!eleContainsInArray(assignedProjectNames, detResponse.projectNames[l])) {
										unassignedProjectNames.push(detResponse.projectNames[l]);
									}
								}

								function eleContainsInArray(arr, element) {
									if (arr != null && arr.length > 0) {
										for (var s = 0; s < arr.length; s++) {
											if (arr[s] == element)
												return true;
										}
									}
									return false;
								}
								unAssignedProjects.projectIds = unassignedProjectIds;
								unAssignedProjects.projectNames = unassignedProjectNames;
								for (var m = 0; m < unAssignedProjects.projectIds.length; m++) {
									$scope.assignProj.allProjectAP.push({'projectname':unAssignedProjects.projectNames[m],'projectid':unAssignedProjects.projectIds[m]});
								}
								if ($("#selAssignUser").find("option:selected").text() == 'Select User') {
									$scope.assignProj.allProjectAP = [];
									$scope.assignProj.assignedProjectAP = [];
								}
								$(".load").hide();
								$("#selAssignUser, #rightall, #rightgo, #leftgo, #leftall, .adminBtn").prop("disabled", false);
							}
						}, function (error) {
							console.log("Error:::::::::::::", error);
						});
					} else {
						adminServices.getDetails_ICE(idtype, requestedids)
						.then(function (res) {
							if (res == "Invalid Session") {
								$rootScope.redirectPage();
							}
							if (res.projectIds.length > 0) {
								$scope.assignProj.allProjectAP = [];
								$scope.assignProj.assignedProjectAP = [];
								for (var n = 0; n < res.projectIds.length; n++) {
									$scope.assignProj.allProjectAP.push({'projectname':res.projectNames[n],'projectid':res.projectIds[n]});
								}
							}
							$(".load").hide();
							$("#selAssignUser, #rightall, #rightgo, #leftgo, #leftall, .adminBtn").prop("disabled", false);
						}, function (error) {
							console.log("Error:::::::::::::", error);
						});
					}
				}, function (error) {
					console.log("Error:::::::::::::", error);
				});
			}
		});

	});

	// Assign Projects Tab Click
	$scope.assignProj.click = function () {
		resetAssignProjectForm();
		$(".selectedIcon").removeClass("selectedIcon");
		$("#assignProjectTab").find("img").addClass("selectedIcon");
		adminServices.getUserDetails("user")
		.then(function(data){
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "fail") {
				openModalPopup("Assign Project", "Failed to fetch users.");
			} else if(data == "empty") {
				openModalPopup("Assign Project", "There are no users present.");
			} else {
				data.sort(function(a,b){ return a[0] > b[0]; });
				var selectBox = $("#selAssignUser");
				selectBox.empty();
				selectBox.append('<option data-id="" value disabled selected>Select User</option>');
				for(i=0; i<data.length; i++){
					if(data[i][2] != "b5e9cb4a-5299-4806-b7d7-544c30593a6e"){
						selectBox.append('<option data-id="'+data[i][1]+'" value="'+data[i][0]+'">'+data[i][0]+'</option>');
					}
				}
				selectBox.prop('selectedIndex', 0);
			}
		}, function (error) {
			console.log("Error:::::::::::::", error);
		});
	};

	//	Assign Projects Button Click
	$scope.assignProjects = function($event){
		if(unAssignedFlag == true)
		{
			$("#assignProjectModal").modal("show");
		}
		else{
			$scope.assignProjects1();
		}
	}
	$scope.assignProjects1 = function ($event) {
		$("#assignProjectModal").modal("hide");
		unAssignedProjects = [];
		assignedProjects = [];
		$("#selAssignUser,#selAssignProject").removeClass("selectErrorBorder").css('border', '1px solid #909090 !important');
		if ($('#selAssignUser option:selected').val() == "") {
			$("#selAssignUser").css('border', '').addClass("selectErrorBorder");
			return false;
		} else if ($('#selAssignProject').val() == "") {
			$("#selAssignProject").css('border', '').addClass("selectErrorBorder");
			return false;
		}

		$("#allProjectAP option").each(function () {
			var unassignedProj = {};
			unassignedProj.projectId = $(this).val();
			unassignedProj.projectName = $(this).text();
			unAssignedProjects.push(unassignedProj);
		});

		$("#assignedProjectAP option").each(function () {
			var assignedProj = {};
			assignedProj.projectId = $(this).val();
			assignedProj.projectName = $(this).text();
			assignedProjects.push(assignedProj);
		});
		var userDetails = JSON.parse(window.localStorage['_UI']);
		var userId = $("#selAssignUser option:selected").attr("data-id");

		var assignProjectsObj = {};
		assignProjectsObj.domainId = domainId;
		assignProjectsObj.userInfo = userDetails;
		assignProjectsObj.userId = userId;
		//assignProjectsObj.unAssignedProjects = unAssignedProjects;
		assignProjectsObj.assignedProjects = assignedProjects;
		assignProjectsObj.getAssignedProjectsLen = getAssignedProjectsLen;

		/* Logic to get unassigned project list */
		$scope.diffprj = [];
		function getDifferentProjects(){
			$scope.diffprj = $scope.assignedProjectInitial;
			for (i = 0; i < assignedProjects.length; i++) { 
				$scope.diffprj = $.grep($scope.diffprj, function(e){ 
					return e.projectid != assignedProjects[i].projectId ; 
			   });
			}
		}
		getDifferentProjects();
		//console.log($scope.diffprj);
		/*End of logic to get unassigned project list */
		assignProjectsObj.deletetasksofprojects = $scope.diffprj;
		//console.log(assignProjectsObj);

		//Transaction Activity for Assign Project Button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['AssignProjects']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);

		blockUI('Saving in Progress. Please Wait...');
		adminServices.assignProjects_ICE(assignProjectsObj)
		.then(function (data) {
			unblockUI();
			if (data == "Invalid Session") {
				$rootScope.redirectPage();
			}
			if (data == 'success') {
				if (assignedProjects.length != 0)
					openModalPopup("Assign Projects", "Projects assigned to user successfully");
				else
					openModalPopup("Assign Projects", "Projects unassigned successfully");
				resetAssignProjectForm();
			} else {
				openModalPopup("Assign Projects", "Failed to assign projects to user");
			}
		}, function (error) {
			console.log("Error:::::::::::::", error);
		});
	};

	$(document).on('click', '#tokenTab', function () {
	});
	$(document).on('change', '#selAssignUser1', function (e) {
		blockUI("Fetchin Token data. Please wait...")
		var userId = $("#selAssignUser1 option:selected").attr("data-id");
		var generatetoken = {};
		generatetoken.userId = userId;
		
		$scope.tokens.users={}
		adminServices.getCIUsersDetails(generatetoken)
		.then(function (data) {
				unblockUI();
				if (data == "Invalid Session") {
					$rootScope.redirectPage();
				}
				else if (data == 'fail') {
						openModalPopup("Token Management", "Failed to fetch user data");
						resetAssignProjectForm();
				} else {
					openModalPopup("Token Management", "Fetch Token details successful");
					data.sort(function(a,b) { 
						if (a.deactivated < b.deactivated) return -1;
						else if(a.deactivated > b.deactivated) return 1;
						else return 0
					 });
					$scope.tokens.users=data;
					$('#tokenName').val('');
					$('.fc-datePicker').val('');
					$('#generateNewToken').val('');
				}
			}, function (error) {
				unblockUI();
				console.log("Error:::::::::::::", error);
			});
	});
	$scope.tokens.click = function () {
		$scope.tokens.users=[]
		$(".selectedIcon").removeClass("selectedIcon");
		$("#tokenTab").find('img').addClass('selectedIcon');
		taskName = $("#page-taskName").children("span").text();
		adminServices.getUserDetails("user")
		.then(function(data){
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "fail") {
				openModalPopup("Token Management", "Failed to fetch users.");
			} else if(data == "empty") {
				openModalPopup("Token Management", "There are no users present.");
			} else {
				data.sort(function(a,b){ return a[0] > b[0]; });
				var selectBox = $("#selAssignUser1");
				selectBox.empty();
				selectBox.append('<option data-id="" value disabled selected>Select User</option>');
				for(i=0; i<data.length; i++){
					if(data[i][2] != "b5e9cb4a-5299-4806-b7d7-544c30593a6e"){
						selectBox.append('<option data-id="'+data[i][1]+'" value="'+data[i][0]+'">'+data[i][0]+'</option>');
					}
				}
				selectBox.prop('selectedIndex', 0);
			}
		}, function (error) {
			console.log("Error:::::::::::::", error);
		});
	};
	//	Generate CI user Token
	$scope.generateCIusertokens = function ($event) {
		$("#GenerateNewTkenModal").modal("hide");
		$("#selAssignUser1").removeClass("selectErrorBorder").css('border', '1px solid #909090 !important');
		$("#tokenName").removeClass("selectErrorBorder").css('border', '1px solid #909090 !important');
		$(".tokeninfo .tokenSuite .datePicContainer .fc-datePicker").removeClass("selectErrorBorder").css('border', '1px solid #909090 !important');
		if ($('#selAssignUser1 option:selected').val() == "") {
			$("#selAssignUser1").css('border', '').addClass("selectErrorBorder");
			return false;
		} 
		else if ($('#tokenName').val() == "") {
			$("#tokenName").css('border', '').addClass("selectErrorBorder");
			return false;
		}
		else if ($('.tokeninfo .tokenSuite .datePicContainer .fc-datePicker').val() == "") {
			$(".tokeninfo .tokenSuite .datePicContainer .fc-datePicker").css('border', '').addClass("selectErrorBorder");
			return false;
		}
		else{
			var userDetails = JSON.parse(window.localStorage['_UI']);
			var userId = $("#selAssignUser1 option:selected").attr("data-id");
			var generatetoken = {};
			$(".scheduleSuiteTable").append('<div class="tokenSuite"><span class="datePicContainer"><input class="form-control fc-datePicker" type="text" title="Select Date" placeholder="Select Date" value="" readonly/><img class="datepickerIconToken" src="../imgs/ic-datepicker.png" /></span><span class="timePicContainer"><input class="form-control fc-timePicker" type="text" value="" title="Select Time" placeholder="Select Time" readonly disabled/><img class="timepickerIcon" src="../imgs/ic-timepicker.png" /></span></div>');
			var expdate=$(".tokeninfo .tokenSuite .datePicContainer .fc-datePicker").val()
			//console.log(expdate)
			var tokenname=$('#tokenName').val()
			//console.log(tokenname)
			generatetoken.userId = userId;
			generatetoken.expiry = expdate;
			generatetoken.tokenname = tokenname;
			blockUI('Generating Token. Please Wait...');
			//console.log('generateCIusertokens',generatetoken)
			adminServices.generateCIusertokens(generatetoken)
			.then(function (data) {
				unblockUI();
				//console.log(data)
				if (data == "Invalid Session") {
					$rootScope.redirectPage();
				}
				else if (data == 'fail') {
					openModalPopup("Token Management", "Failed to generate token");
				} 
				else if (data == 'duplicate') {
					openModalPopup("Token Management", "Failed to generate token, Token Name already exist");
				} 
				else {
					$("#generateNewToken").val(data);
					adminServices.getCIUsersDetails(generatetoken)
					.then(function (data) {
						unblockUI();
						if (data == "Invalid Session") {
							$rootScope.redirectPage();
						}
						else if (data == 'fail') {
							openModalPopup("Token Management", "Failed to fetch user data");
							resetAssignProjectForm();
						} else {
							openModalPopup("Token Management", "Token generated successfully");
							data.sort(function(a,b) { 
							if (a.deactivated < b.deactivated) return -1;
								else if(a.deactivated > b.deactivated) return 1;
								else return 0
							});
							$scope.tokens.users=data
						}
					}, function (error) {
							unblockUI();
							console.log("Error:::::::::::::", error);
						});	
				}
			}, function (error) {
				unblockUI();
				console.log("Error:::::::::::::", error);
			});
		}		
	};
	$scope.deactivate = function ($event) {
		var CIUser={}
		CIUser.userId = $("#selAssignUser1 option:selected").attr("data-id");
		CIUser.tokenName = $.trim($event.target.parentElement.parentElement.firstElementChild.textContent);
		adminServices.deactivateCIUser(CIUser)
		.then(function (data) {
				unblockUI();
				// console.log(data)
				if (data == "Invalid Session") {
					$rootScope.redirectPage();
				}
				else if (data == 'fail') {
					openModalPopup("Token Management", "Failed to deactivate token");
				}  
				else {
					openModalPopup("Token Management", "Token '"+CIUser.tokenName+"' has been Deactivated");
					data.sort(function(a,b) { 
						if (a.deactivated < b.deactivated) return -1;
							else if(a.deactivated > b.deactivated) return 1;
							else return 0
						});
					$scope.tokens.users=data
				}
			}, function (error) {
				unblockUI();
				console.log("Error:::::::::::::", error);
			});
	};
	$(document).on('focus', '.fc-datePicker', function(){
		$(this).datepicker({
			autoclose:"true",
			format:"dd-mm-yyyy",
			todayHighlight: true,
			startDate: new Date()
		})
	})
	$(document).on('click', ".datepickerIconToken", function(){
		$(this).siblings(".fc-datePicker").focus()
	})
	
	$(document).on('click', '#projectTab', function () {
		resetForm();
		projectDetails = [];
		updateProjectDetails = [];
		var plugins = [];
		$(".selectedIcon").removeClass("selectedIcon");
		$(this).children().find('img').addClass('selectedIcon');
		adminServices.getAvailablePlugins()
		.then(function (plugins_list) {
			for (var i = 0; i < plugins_list.length; i++) {
				plugins[i] = plugins_list[i];
			}
			$timeout(function () {
				$('.scrollbar-inner').scrollbar();
				$('.scrollbar-macosx').scrollbar();
				toggleCycleClick();
			}, 10);
			adminServices.getDomains_ICE()
			.then(function (data) {
				if (data == "Invalid Session") {
					$rootScope.redirectPage();
				} else {
					$("#selDomain").val(data[0].domainName);
					domainId = data[0].domainId;
					var details = {
						"web":{"data":"Web","title":"Web","img":"web"},
						"webservice":{"data":"Webservice","title":"Web Service","img":"webservice"},
						"mainframe":{"data":"Mainframe","title":"Mainframe","img":"mainframe"},
						"desktop":{"data":"Desktop","title":"Desktop Apps","img":"desktop"},
						"oebs":{"data":"DesktopJava","title":"Oracle Apps","img":"oracleApps"},
						"mobileapp":{"data":"MobileApp","title":"Mobile Apps","img":"mobileApps"},
						"mobileweb":{"data":"MobileWeb","title":"Mobile Web","img":"mobileWeb"},
						"sap":{"data":"SAP","title":"SAP Apps","img":"sapApps"},
						"system":{"data":"System","title":"System Apps","img":"desktop"}
					};
					$("div.appTypesContainer").empty();
					for (var i = 0; i < plugins.length; i++) {
						html = '<div class="projectTypes_create" data-app="' + details[plugins[i]]['data'] + '" title="' + details[plugins[i]]['title'] + '"><img src="imgs/' + details[plugins[i]]['img'] + '.png" alt="' + details[plugins[i]]['title'] + '" /><label>' + details[plugins[i]]['title'] + '</label></div>';
						$(".appTypesContainer").append(html);
					}

				}
			}, function (error) {
				console.log("Error:::::::::::::", error);
			});
		}, function (error) {
			console.log("Error:::::::::::::", error);
		});
	});

	function toggleCycleClick() {
		var releaseListLen = $("#releaseList li").length;
		var cyclesListLen = $("#cycleList li").length;
		var releaseSelectedLen = $("li.active").length;
		if (cyclesListLen == 0 && releaseListLen == 0) {
			$("#addCycle").addClass('disableAddCycle');
		} else if (releaseListLen == 0 || releaseSelectedLen == 0) {
			$("#addCycle").addClass('disableAddCycle');
		} else {
			$("#addCycle").removeClass('disableAddCycle');
		}
	}

	$scope.preferences.click = function () {
		$(".selectedIcon").removeClass("selectedIcon");
		$("#preferencesTab").find("img").addClass("selectedIcon");
		setTimeout(function () {
			$("#preferencesTable").find("input[type=checkbox]:not(.switchRole)").each(function () {
				$(this).attr("disabled", "disabled");
			});
		}, 50);
	};

	// Create Project Action
	$scope.create_project = function ($event) {
		$("#selDomain").removeClass("inputErrorBorder");
		$("#projectName").removeClass("inputErrorBorder");

		if ($('#selDomain').val() == "") {
			$("#selDomain").addClass("inputErrorBorder");
		} else if ($("#projectName").val() == "") {
			$("#projectName").addClass("inputErrorBorder");
		} else if ($(".projectTypeSelected").length == 0) {
			openModalPopup("Create Project", "Please select Application Type");
		} else if ($("#releaseList").children("li").length == 0) {
			openModalPopup("Create Project", "Please add atleast one release");
		}
		/*else if($("#cycleList").children("li").length == 0){
			openModalPopup("Update Project", "Failed. does not contain cycle");
		}*/
		else {
			var proceedToCreate = true;
			var relNames = "";
			for (i = 0; i < projectDetails.length; i++) {
				if (projectDetails[i].cycleNames.length <= 0) {
					relNames = relNames.length > 0 ? relNames + ", " + projectDetails[i].releaseName : projectDetails[i].releaseName;
					proceedToCreate = false;
					//break;
				}
			}
			if (proceedToCreate == false) {
				openModalPopup("Update Project", "Please add atleast one cycle for release: " + relNames);
			} else if (proceedToCreate == true) {
				projectExists = false;
				var requestedids = [];
				var idtype = [];
				checkCycle(flag);

				if (valid == "false") {
					return false;
				} else {

					//Transaction Activity for Create Project Button Action
					// var labelArr = [];
					// var infoArr = [];
					// labelArr.push(txnHistory.codesDict['CreateProject']);
					// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
					if ($('#selDomain').val() != "") {
						requestedids.push(domainId);
						idtype.push('domainsall');
						var proceeed = false;
						adminServices.getNames_ICE(requestedids, idtype)
						.then(function (response) {
							if (response == "Invalid Session") {
								$rootScope.redirectPage();
							}
							if (response == "No Projects") {
								proceeed = true;
							} else if (response.projectNames.length > 0) {
								for (var i = 0; i < response.projectNames.length; i++) {
									if ($("#projectName").val() == response.projectNames[i]) {
										openModalPopup("Create Project", "Project Name already Exists");
										projectExists = true;
										return false;
									} else
										proceeed = true;

								}
							} else {
								openModalPopup("Create Project", "Failed to create project");
								return false;
							}
							if (proceeed == true) {
								blockUI("Loading...");
								var userDetails = JSON.parse(window.localStorage['_UI']);
								createprojectObj.domainId = domainId;
								createprojectObj.projectName = $.trim($("#projectName").val());
								createprojectObj.appType = $(".projectTypeSelected").attr('data-app');
								createprojectObj.projectDetails = projectDetails;
								console.log("Controller: " + createprojectObj);
								adminServices.createProject_ICE(createprojectObj, userDetails)
								.then(function (createProjectRes) {
									if (createProjectRes == "Invalid Session") {
										$rootScope.redirectPage();
									}
									if (createProjectRes == 'success') {
										openModalPopup("Create Project", "Project created successfully");
										resetForm();
										projectDetails = [];
									} else {
										openModalPopup("Create Project", "Failed to create project");
										resetForm();
									}
									unblockUI();
								}, function (error) {
									console.log("Error:::::::::::::", error);
								});
							}
						}, function (error) {
							console.log("Error:::::::::::::", error);
						});
					}
				}
			} else {
				unblockUI();
				openModalPopup("Create Project", "Please add atleast one cycle for a release");
			}
		}
	};

	function checkCycle(flag) {
		$("#releaseList li").each(function () {
			for (var i = 0; i < projectDetails.length; i++) {
				if ($(this).children('span.releaseName').text() == projectDetails[i].releaseName) {
					if (projectDetails[i].cycleNames.length == 0) {
						openModalPopup("Create Project", "Please add atleast one cycle for a release");
						valid = "false";
						return flag;
					}
				}
			}
		});
	}

	//Update Project Action
	$scope.update_project = function ($event) {
		$("#selDomainEdit,#selProject").removeClass("selectErrorBorder");
		if ($('#selDomainEdit option:selected').val() == "") {
			$("#selDomainEdit").addClass("selectErrorBorder");
		} else if ($('#selProject option:selected').val() == "") {
			$("#selProject").addClass("selectErrorBorder");
		} else if ($("#releaseList").children("li").length == 0) {
			openModalPopup("Update Project", "Please add atleast one release");
		}
		// else if($("#cycleList").children("li").length == 0){
		// 	console.log("Update PPPPPPPPPPP");
		// 	openModalPopup("Update Project", "Please add atleast one cycle for a release");
		// }
		else {
			blockUI("Loading...");
			flag = false;
			//Update project details json with editedProjectDetails, deletedProjectDetails, newProjectDetails
			updateProjectObj = {};
			var userDetails = JSON.parse(window.localStorage['_UI']);
			updateProjectObj.projectId = $('#selProject option:selected').val();
			updateProjectObj.projectName = $('#selProject option:selected').text();
			updateProjectObj.appType = $(".projectTypeSelected").attr('data-app');
			updateProjectObj.editedProjectDetails = "";
			updateProjectObj.deletedProjectDetails = "";
			updateProjectObj.newProjectDetails = "";

			if (updateProjectObj.editedProjectDetails.length <= 0)
				updateProjectObj.editedProjectDetails = editedProjectDetails;
			else
				updateProjectObj.editedProjectDetails.push(editedProjectDetails);

			if (updateProjectObj.deletedProjectDetails.length <= 0)
				updateProjectObj.deletedProjectDetails = deletedProjectDetails;
			else
				updateProjectObj.deletedProjectDetails.push(deletedProjectDetails);

			var proceedFlag = true;
			var relName = "";
			if (newProjectDetails.length > 0) {
				for (i = 0; i < newProjectDetails.length; i++) {
					var testFlag = true;
					if (newProjectDetails[i].cycleDetails.length <= 0) {
						for (var j = 0; j < updateProjectDetails.length; j++) {
							if (updateProjectDetails[j].releaseName == newProjectDetails[i].releaseName && updateProjectDetails[j].cycleDetails.length <= 0) {
								relName = relName.length > 0 ? relName + ", " + newProjectDetails[i].releaseName : relName + newProjectDetails[i].releaseName;
								proceedFlag = false;
								testFlag = false;
							}
						}
						if (testFlag) {
							relName = relName.length > 0 ? relName + ", " + newProjectDetails[i].releaseName : relName + newProjectDetails[i].releaseName;
							proceedFlag = false;
						}
					}
				}
			}

			if (updateProjectDetails.length > 0) {
				for (i = 0; i < updateProjectDetails.length; i++) {
					if (updateProjectDetails[i].cycleDetails.length <= 0) {
						var testFlag = true;
						for (var j = 0; j < newProjectDetails.length; j++) {
							if (updateProjectDetails[i].releaseName == newProjectDetails[j].releaseName) {
								testFlag = false;
								if (newProjectDetails[j].cycleDetails.length <= 0) {
									relName = relName.length > 0 ? relName + ", " + updateProjectDetails[i].releaseName : relName + updateProjectDetails[i].releaseName;
									proceedFlag = false;
								}
							}
						}
						if (newProjectDetails.length <= 0 || testFlag) {
							relName = relName.length > 0 ? relName + ", " + updateProjectDetails[i].releaseName : relName + updateProjectDetails[i].releaseName;
							proceedFlag = false;
						}
					}
				}

			}
			if (proceedFlag == false) {
				unblockUI();
				openModalPopup("Update Project", "Please add atleast one cycle for release: " + relName);
				return false;
			}
			if (proceedFlag == true) {

				//Transaction Activity for Update Project Button Action
				// var labelArr = [];
				// var infoArr = [];
				// labelArr.push(txnHistory.codesDict['UpdateProject']);
				// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);

				if (updateProjectObj.newProjectDetails.length <= 0)
					updateProjectObj.newProjectDetails = newProjectDetails;
				else
					updateProjectObj.newProjectDetails.push(newProjectDetails);
				//updateProjectObj.updateProjectDetails = releaseCycleDetails;


				adminServices.updateProject_ICE(updateProjectObj, userDetails)
				.then(function (updateProjectRes) {
					if (updateProjectRes == "Invalid Session") {
						$rootScope.redirectPage();
					}
					clearUpdateProjectObjects();
					if (updateProjectRes == 'success') {
						//Clearing old data from updateProject object

						openModalPopup("Update Project", "Project updated successfully");
						$timeout(function () {
							$("#projectTab").trigger("click");
							$(".adminActionBtn button:nth-child(1)").trigger("click");
						}, 200);
						resetForm();
					} else {
						openModalPopup("Update Project", "Failed to update project");
						resetForm();
					}
					unblockUI();
				}, function (error) {
					console.log("Error:::::::::::::", error);
				});
			}
		}
	};

	function resetForm() {
		//$("#selDomain").prop('selectedIndex', 0);
		$("#projectName").val("");
		$("div.projectTypeSelected").removeClass("projectTypeSelected");
		$("#releaseList li, #cycleList li").remove();
		toggleCycleClick();
	}

	function resetAssignProjectForm() {
		$("#selAssignUser, #selAssignProject").prop('selectedIndex', 0);
		$scope.assignProj.allProjectAP = [];
		$scope.assignProj.assignedProjectAP = [];        
		$("#selAssignProject").empty();
		$("#selAssignProject").append('<option data-id="" value disabled selected>Please Select your domain</option>');
	}

	//Add Release Name Functionality
	$(document).on("click", "#addRelease", function () {
		flag = false;
		//$("#addReleaseNameModal").modal("show");
		openEditGlobalModal("Add Release", "releaseTxt", "Add Release Name", "addReleaseName");
		$("#releaseTxt").removeClass("inputErrorBorder");
		$("#releaseTxt").addClass("validationKeydown");
		//$("#releaseTxt").focus();
		/*$('#addReleaseNameModal').on('shown.bs.modal', function () {
		$('#releaseTxt').focus();
		});*/
		$("#releaseTxt").val('');
		var reg = /^[a-zA-Z0-9\s\.\-\_]+$/;
			$(document).on('click', "#addReleaseName", function (e) {
				e.preventDefault();
				if ($("#releaseTxt").val() == "") {
					$("#releaseTxt").addClass('inputErrorBorder');
					return false;
				} else if (!reg.test($("#releaseTxt").val())) {
					$("#releaseTxt").addClass('inputErrorBorder');
					$("#releaseTxt").val('');
					return false;
				} else {
					$("#releaseTxt").removeClass('inputErrorBorder');
					$("#releaseList li").each(function () {
						if ($(this).children('span.releaseName').text() == $("#releaseTxt").val()) {
							$(".close:visible").trigger('click');
							openModalPopup("Add Release", "Release Name already exists");
							flag = true;
						}
					});
					if (flag == true) {
						return false;
					}
					releaseName = $("#releaseTxt").val();

					taskName = $("#page-taskName").children("span").text();
					$(".close:visible").trigger('click');
					if (taskName == "Create Project") {
						$("#releaseList").append("<li id='releaseList_" + count + "'><img src='imgs/ic-release.png' /><span title=" + releaseName + " class='releaseName'>" + releaseName + "</span><span class='actionOnHover'><img id=editReleaseName_" + count + " title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_" + count + " title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
						$("#releaseList li:last").trigger('click');
						//releaseNamesArr.push(releaseName);
						var releCycObj = {
							"releaseName": '',
							"cycleNames": []
						};
						releCycObj.releaseName = releaseName;
						projectDetails.push(releCycObj);
						toggleCycleClick();
						count++;
					}
					if (taskName == "Update Project") {
						var createNewRelCyc = {
							"releaseName": "",
							"newStatus": true,
							"cycleDetails": []
						};
						count = $("#releaseList li").length;
						$("#releaseList").append("<li class='createRelease' id='releaseList_" + count + "'><img src='imgs/ic-release.png' /><span title=" + releaseName + " class='releaseName'>" + releaseName + "</span><span class='actionOnHover'><img id=editReleaseName_" + count + " title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_" + count + " title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
						// releCycObj = {};
						// releCycObj.releaseName = releaseName;
						// releCycObj.releaseId = "";
						// releCycObj.cycleDetails = [];
						// updateProjectDetails.push(releCycObj);
						//for update project json
						createNewRelCyc.releaseName = releaseName;
						newProjectDetails.push(createNewRelCyc);
						toggleCycleClick();
						$("#releaseList li#releaseList_" + count + "").trigger('click');
						count++;
					}
					if ($("#releaseList li").length >= 11)
						$('.scrollbar-inner').scrollbar();
					e.stopImmediatePropagation();
				}
			});
	});

	$(document).on('click', "#releaseList li", function () {
		$("li.active").removeClass("active");
		$(this).addClass("active");
	});

	$(document).on('click', "#cycleList li", function () {
		$("li.cycleList").removeClass("cycleList");
		$(this).addClass("cycleList");
	});

	//Add Cycle Name Functionality
	$(document).on("click", "#addCycle", function (e) {
		e.preventDefault();
		flag = false;
		//$("#addCycleNameModal").modal("show");
		openEditGlobalModal("Add Cycle", "cycleTxt", "Add Cycle Name", "addCycleName");
		$("#cycleTxt").removeClass('inputErrorBorder');
		$("#cycleTxt").addClass("validationKeydown");
		/*$('#addCycleNameModal').on('shown.bs.modal', function () {
		$('#cycleTxt').focus();
		});*/
		$("#cycleTxt").val('');
		$(document).on('click', "#addCycleName", function (e) {
			var reg = /^[a-zA-Z0-9\s\.\-\_]+$/
			var relName = $("#releaseList li.active .releaseName").text();
			e.preventDefault();
			$("#cycleTxt").removeClass("inputErrorBorder");
			if ($("#cycleTxt").val() == "") {
				$("#cycleTxt").addClass('inputErrorBorder');
				return false;
			} else if (!reg.test($("#cycleTxt").val())) {
				$("#cycleTxt").addClass('inputErrorBorder');
				$("#cycleTxt").val('');
				return false;
			} else {
				$("#cycleList li:visible").each(function () {
					if ($(this).children('span.cycleName').text() == $("#cycleTxt").val()) {
						$(".close:visible").trigger('click');
						openModalPopup("Add Cycle", "Cycle Name already exists for this release");
						flag = true;
					}
				});
				if (flag == true) {
					return;
				}
				$("#cycleTxt").removeClass('inputErrorBorder');
				cycleName = $("#cycleTxt").val();

				$(".close:visible").trigger('click');
				$("#cycleList li.cycleList").removeClass("cycleList");
				taskName = $("#page-taskName").children("span").text();
				if (taskName == "Create Project") {
					$("#cycleList").append("<li class='cycleList createCycle'><img src='imgs/ic-cycle.png' /><span title=" + cycleName + " class='cycleName'>" + cycleName + "</span><span class='actionOnHover'><img id=editCycleName_" + delCount + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + delCount + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
					for (i = 0; i < projectDetails.length; i++) {
						if (projectDetails[i].releaseName == $("li.active").children('span.releaseName').text()) {
							projectDetails[i].cycleNames.push(cycleName);
						}
					}
					/*for (i = 0; i < releaseNamesArr.length; i++) {
						//console.log("selRelease", releaseNamesArr[i]);
						//console.log("activeRel", $("li.active").children('span.releaseName').text());
						if (releaseNamesArr[i] == $("li.active").children('span.releaseName').text()) {
							for (var j = 0; j < projectDetails.length; j++) {
								if ('releaseName' in projectDetails[j]) {
									if (releaseNamesArr[i] == projectDetails[j].releaseName) {
										var cycleArr = [];
										//this line is for releases which already have at least 1 cycle
										if ('cycleNames' in projectDetails[j]) {
											cycleArr = projectDetails[j].cycleNames;
										}
										cycleArr.push(cycleName);
										projectDetails[j].cycleNames = cycleArr;
									}
								}
							}
						}
					}*/
					toggleCycleClick();
					delCount++;
				}

				if (taskName == "Update Project") {
					var createNewRelCyc = {
						"releaseName": "",
						"releaseId": "",
						"newStatus": false,
						"cycleDetails": []
					};
					var createCyc = {
						"cycleName": "",
						"newStatus": true
					};
					delCount = (delCount + 1) * 3;
					$("#cycleList").append("<li class='cycleList createCycle'><img src='imgs/ic-cycle.png' /><span title=" + cycleName + " class='cycleName'>" + cycleName + "</span><span class='actionOnHover'><img id=editCycleName_" + delCount + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + delCount + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
					/*for (var i = 0; i < updateProjectDetails.length; i++) {
						if (updateProjectDetails[i].releaseName == $("li.active").children('span.releaseName').text()) {
							if ('releaseName' in updateProjectDetails[i]) {
								var cycleArr = [];
								//this line is for releases which already have at least 1 cycle
								if ('cycleDetails' in updateProjectDetails[i]) {
									cycleArr = updateProjectDetails[i].cycleDetails;
								}
								cycleArr.push(cycleName);
								updateProjectDetails[i].cycleDetails = cycleArr;
							}
						}
					}*/
					var RelID = $("li.active").children('span.releaseName').data("releaseid");
					//For update project json
					if (newProjectDetails.length <= 0) {
						createNewRelCyc.releaseName = relName;
						createNewRelCyc.releaseId = RelID;
						createCyc.cycleName = cycleName;
						createNewRelCyc.cycleDetails.push(createCyc);
						newProjectDetails.push(createNewRelCyc);
					} else {
						var chk = true;
						for (j = 0; j < newProjectDetails.length; j++) {
							if (newProjectDetails[j].releaseName == relName && newProjectDetails[j].releaseId == RelID) {
								createCyc.cycleName = cycleName;
								newProjectDetails[j].cycleDetails.push(createCyc);
								chk = false;
								break;
							}
						}
						if (chk == true) {
							createNewRelCyc.releaseName = relName;
							createNewRelCyc.releaseId = RelID;
							createCyc.cycleName = cycleName;
							createNewRelCyc.cycleDetails.push(createCyc);
							newProjectDetails.push(createNewRelCyc);
						}
					}
					//console.log(newProjectDetails);
					toggleCycleClick();
					delCount++;
				}
				if ($("#cycleList li:visible").length >= 11)
					$('.scrollbar-inner').scrollbar();
				e.stopImmediatePropagation();
			}
		});
	});

	$(document).on('click', '[id^=releaseList]', function (e) {
		if ($("#releaseList li").length == 0) {
			$("#cycleList li").remove();
			updateProjectDetails = [];
		}
		toggleCycleClick();
		showHideEditDeleteIcons();
		var id = e.target.id;
		id = "#".concat(e.target.id);
		taskName = $("#page-taskName").children("span").text();
		if (taskName == "Create Project" && id.indexOf("edit") != 0 && id.indexOf("delete") != 0) {
			var releaseName = $("li.active").children('span.releaseName').text();
			$("#cycleList li").remove();
			if (projectDetails.length > 0) {
				for (var i = 0; i < projectDetails.length; i++) {
					if (projectDetails[i].releaseName == releaseName && 'cycleNames' in projectDetails[i]) {
						for (var j = 0; j < projectDetails[i].cycleNames.length; j++) {
							$("#cycleList").append("<li><img src='imgs/ic-cycle.png' /><span title=" + projectDetails[i].cycleNames[j] + " class='cycleName'>" + projectDetails[i].cycleNames[j] + "</span><span class='actionOnHover'><img id=editCycleName_" + j + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + j + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
						}
					}
				}
			}
		}

		if (taskName == "Update Project" && id.indexOf("edit") != 1 && id.indexOf("delete") != 1) {
			var releaseName = $("li.active").children('span.releaseName').text();
			$("#cycleList li").remove();
			//Check Release details if already exist
			if (updateProjectDetails.length > 0) {
				for (var i = 0; i < updateProjectDetails.length; i++) {
					if (updateProjectDetails[i].releaseName == releaseName && 'cycleDetails' in updateProjectDetails[i]) {
						for (var j = 0; j < updateProjectDetails[i].cycleDetails.length; j++) {
							var objectType = typeof(updateProjectDetails[i].cycleDetails[j]);
							if (objectType == "object") {
								$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span title=" + updateProjectDetails[i].cycleDetails[j].cycleName + " data-cycleid=" + updateProjectDetails[i].cycleDetails[j].cycleId + " class='cycleName'>" + updateProjectDetails[i].cycleDetails[j].cycleName + "</span><span class='actionOnHover'><img id=editCycleName_" + j + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + j + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							} else if (objectType == "string") {
								$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span title=" + updateProjectDetails[i].cycleDetails[j] + "  class='cycleName'>" + updateProjectDetails[i].cycleDetails[j] + "</span><span class='actionOnHover'><img id=editCycleName_" + j + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + j + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							}
							/*if ($("li.active").hasClass("updateRelease")) {
								$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+updateProjectDetails[i].cycleDetails[j].cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							} else {
								$("#cycleList").append("<li class='createCycle'><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+updateProjectDetails[i].cycleDetails[j].cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							}*/
						}
					}
				}
			}

			//Check Release details if newly added
			if (newProjectDetails.length > 0) {
				for (var i = 0; i < newProjectDetails.length; i++) {
					if (newProjectDetails[i].releaseName == releaseName && 'cycleDetails' in newProjectDetails[i]) {
						for (var j = 0; j < newProjectDetails[i].cycleDetails.length; j++) {
							var objectType = typeof(newProjectDetails[i].cycleDetails[j]);
							if (objectType == "object") {
								$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span title=" + newProjectDetails[i].cycleDetails[j].cycleName + " data-cycleid=" + newProjectDetails[i].cycleDetails[j].cycleId + " class='cycleName'>" + newProjectDetails[i].cycleDetails[j].cycleName + "</span><span class='actionOnHover'><img id=editCycleName_" + j + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + j + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							} else if (objectType == "string") {
								$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span title=" + newProjectDetails[i].cycleDetails[j] + "  class='cycleName'>" + newProjectDetails[i].cycleDetails[j] + "</span><span class='actionOnHover'><img id=editCycleName_" + j + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + j + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							}
						}
					}
				}
			}
		}
	});

	var editRelid;
	//Edit Release Name Functionality
	$(document).on("click", "[id^=editReleaseName_]", function (e) {
		openEditGlobalModal("Edit Release Name", "releaseName", "Enter New Release Name", "updateReleaseName");
		$("#releaseName").addClass("validationKeydown");
		var existingReleaseName = $(this).parents("li").children(".releaseName").text();
		$("#releaseName").val(existingReleaseName);
		var flag = false;
		editReleaseId = e.target.id;
		editRelid = e.target.parentElement.previousSibling.dataset.releaseid;
		if (e.target.id != "releaseName") {
			$("#releaseName").removeClass("inputErrorBorder");
			$('#editReleaseNameModal').on('shown.bs.modal', function () {
				$('#releaseName').focus();
			});
			var existingReleaseName = $(this).parents("li").children(".releaseName").text();
				releaseName = $("#releaseName").val(existingReleaseName);
			//Save edited release name
			$(document).on('click', '#updateReleaseName', function (event) {
				var reg = /^[a-zA-Z0-9\s\.\-\_]+$/;
					if ($("#releaseName").val() == "") {
						$("#releaseName").addClass('inputErrorBorder');
						return false;
					} else if (!reg.test($("#releaseName").val())) {
						$("#releaseName").addClass('inputErrorBorder');
						$("#releaseName").val('');
						return false;
					} else {
						$("#releaseName").removeClass('inputErrorBorder');
						$("#releaseList li").each(function () {
							if ($(this).children('span.releaseName').text() == $("#releaseName").val()) {
								$(".close:visible").trigger('click');
								openModalPopup("Add Release", "Release Name already exists");
								flag = true;
							}
						});
						if (flag == true) {
							return false;
						}
						releaseName = $("#releaseName").val();
						taskName = $("#page-taskName").children("span").text();
						if (taskName == "Create Project") {
							$(".close:visible").trigger('click');
							var index = '';
							index = $('li.active').index();
							$("#" + editReleaseId).parent().prev('span').text($("#releaseName").val());
							$("#" + editReleaseId).parent().prev('span')[0].setAttribute("title", $("#releaseName").val());
							//console.log("projectDetails", projectDetails);
							for (var i = 0; i < projectDetails.length; i++) {
								if (i == index) {
									projectDetails[i].releaseName = $("#releaseName").val();
								}
							}
						} else if (taskName == "Update Project") {
							for (i = 0; i < updateProjectDetails.length; i++) {
								if ($("#releaseName").val().trim() == updateProjectDetails[i].releaseName) {
									$(".close:visible").trigger('click');
									openModalPopup("Edit Release Name", "Release Name already exists");
									return false;
								}
							}
							for (i = 0; i < newProjectDetails.length; i++) {
								if ($("#releaseName").val().trim() == newProjectDetails[i].releaseName) {
									$(".close:visible").trigger('click');
									openModalPopup("Edit Release Name", "Release Name already exists");
									return false;
								} else {
									if ($("#" + editReleaseId).parent().prev('span').text() == newProjectDetails[i].releaseName) {
										newProjectDetails[i].releaseName = $("#releaseName").val().trim();
									}
								}
							}

							$(".close:visible").trigger('click');
							var index = '';
							index = $('li.active').index();
							var oldRelText = $("#" + editReleaseId).parent().prev('span').text();
							$("#" + editReleaseId).parent().prev('span').text($("#releaseName").val());
							$("#" + editReleaseId).parent().prev('span')[0].setAttribute("title", $("#releaseName").val());
							var newReleaseTxt = $("li.active").children("span.releaseName").text();
							for (var i = 0; i < updateProjectDetails.length; i++) {
								if (i == index) {
									var editRelCyc = {
										"releaseId": "",
										"releaseName": "",
										"oldreleaseName": "",
										"cycleDetails": [],
										"editStatus": false
									};
									updateProjectDetails[i].releaseName = $("#releaseName").val();
									//For update project json
									if (editedProjectDetails.length <= 0) {
										editRelCyc.releaseId = editRelid; //updateProjectDetails[i].releaseId;
										editRelCyc.releaseName = $("#releaseName").val(); //updateProjectDetails[i].releaseName;
										editRelCyc.oldreleaseName = oldRelText;
										editRelCyc.editStatus = true;
										editedProjectDetails.push(editRelCyc);
									} else {
										var chkPresent = true;
										for (m = 0; m < editedProjectDetails.length; m++) {
											if (editedProjectDetails[m].releaseId == editRelid /*updateProjectDetails[i].releaseId*/) {
												editedProjectDetails[m].releaseName = $("#releaseName").val(); //updateProjectDetails[i].releaseName;
												editedProjectDetails[m].oldreleaseName = oldRelText;
												editedProjectDetails[m].editStatus = true;
												chkPresent = false;
												break;
											}
										}
										if (chkPresent == true) {
											editRelCyc.releaseId = editRelid; //updateProjectDetails[i].releaseId;
											editRelCyc.releaseName = $("#releaseName").val(); //updateProjectDetails[i].releaseName;
											editRelCyc.oldreleaseName = oldRelText;
											editRelCyc.editStatus = true;
											editedProjectDetails.push(editRelCyc);
										}
									}
									//For update project json
								}
							}
						}
						//$("#"+editReleaseId).addClass("editedRelease");
						//$("#"+editReleaseId).siblings(".deleteRelease").addClass("editedRelease");
						event.stopImmediatePropagation();
					}
			});
			e.stopImmediatePropagation();
		}
	});

	//Delete Release Functionality: Open Popup
	$(document).on("click", "[id^=deleteReleaseName_]", function (e) {
		openDeleteGlobalModal("Delete Release","deleteReleaseYes");
		deleteReleaseId = e.target.id;
		deleteRelid = e.target.parentElement.previousSibling.dataset.releaseid;
	});

	//Delete Release Functionality
	$(document).on("click", "#deleteReleaseYes", function(event) {
		hideDeleteGlobalModal();
		taskName = $("#page-taskName").children("span").text();
		var goahead = false;
		if (taskName == "Create Project") {
			if ($("#cycleList li").length > 0) {
				openModalPopup("Delete Release", "Release contains cycles. Cannot delete");
			} else {
				for (var i = 0; i < projectDetails.length; i++) {
					if (projectDetails[i].releaseName == $("#" + deleteReleaseId).parent().prev('span.releaseName').text()) {
						delete projectDetails[i];
						goahead = true;
						projectDetails = projectDetails.filter(function (n) {
								return n != undefined;
							});
					}
				}
			}
		} else if (taskName == "Update Project") {
			if ($("#cycleList").find(".updateCycle").length > 0) {
				openModalPopup("Delete Release", "Release contains cycles. Cannot delete");
			} else {
				for (var i = 0; i < updateProjectDetails.length; i++) {
					if (updateProjectDetails[i].releaseName == $("#" + deleteReleaseId).parent().prev('span.releaseName').text()) {
						var deleteRelCyc = {
							"releaseName": "",
							"releaseId": "",
							"cycleDetails": [],
							"deleteStatus": false
						};
						//For update project json
						if (deletedProjectDetails.length <= 0) {
							deleteRelCyc.releaseName = $("#" + deleteReleaseId).parent().prev('span.releaseName').text(); //updateProjectDetails[i].releaseName;
							deleteRelCyc.releaseId = deleteRelid; //updateProjectDetails[i].releaseId
							deleteRelCyc.deleteStatus = true;
							deletedProjectDetails.push(deleteRelCyc);
						} else {
							var chkRelease = true;
							for (j = 0; j < deletedProjectDetails.length; j++) {
								if (deletedProjectDetails[j].releaseId == deleteRelid /*updateProjectDetails[i].releaseId*/) {
									deletedProjectDetails[j].releaseName = $("#" + deleteReleaseId).parent().prev('span.releaseName').text(); //updateProjectDetails[i].releaseName;
									deletedProjectDetails[j].deleteStatus = true;
									chkRelease = false;
									break;
								}
							}
							if (chkRelease == true) {
								deleteRelCyc.releaseName = $("#" + deleteReleaseId).parent().prev('span.releaseName').text(); //updateProjectDetails[i].releaseName;
								deleteRelCyc.releaseId = deleteRelid; //updateProjectDetails[i].releaseId
								deleteRelCyc.deleteStatus = true;
								deletedProjectDetails.push(deleteRelCyc);
							}
						}
						//For update project json
						delete updateProjectDetails[i];
						$("#cycleList li").remove();
						updateProjectDetails = updateProjectDetails.filter(function (n) {
								return n != undefined;
							});
					}
				}
				for (var j = 0; j < newProjectDetails.length; j++) {
					if (newProjectDetails[j].releaseName == $("#" + deleteReleaseId).parent().prev('span.releaseName').text()) {
						delete newProjectDetails[j];
						newProjectDetails = newProjectDetails.filter(function (n) {
								return n != undefined;
							});
					}
				}
				goahead = true;
			}
		}
		if (goahead) {
			$("#" + deleteReleaseId).parent().parent("li").remove();
			$("#releaseList li:last").trigger('click');
			openModalPopup("Delete Release", "Release deleted successfully");
			toggleCycleClick();
		}
		event.stopImmediatePropagation();
	});

	var editCycId;
	//Edit Cycle Name Functionality
	$(document).on("click", "[id^=editCycleName_]", function (e) {
		//$("#editCycleNameModal").modal("show");
		openEditGlobalModal("Edit Cycle Name", "cycleName", "Enter New Cycle Name", "updateCycleName");
		$("#cycleName").addClass("validationKeydown");
		var existingCycleName = $(this).parents("li").children(".cycleName").text();
		$("#cycleName").val(existingCycleName);
		editCycleId = e.target.id;
		editCycId = e.target.parentElement.previousSibling.dataset.cycleid;
		if (e.target.id != "cycleName") {
			$("#cycleName").removeClass("inputErrorBorder");
			/*$('#editCycleNameModal').on('shown.bs.modal', function () {
			$('#cycleName').focus();
			});*/
			var existingCycleName = $(this).parents("li").children(".cycleName").text();
				cycleName = $("#cycleName").val(existingCycleName);
			$('#cycleName').focus();
			//Edit cycle name save button
			$(document).on('click', '#updateCycleName', function (event) {
				flag = false;
				var reg = /^[a-zA-Z0-9\s\.\-\_]+$/;
					$("#cycleList li:visible").each(function () {
						if ($(this).children('span.cycleName').text().trim() == $("#cycleName").val().trim()) {
							$(".close:visible").trigger('click');
							openModalPopup("Add Cycle", "Cycle Name already exists for this release");
							flag = true;
						}
					});
				if (flag == true) {
					return false;
				}
				if ($("#cycleName").val() == "") {
					$("#cycleName").addClass('inputErrorBorder');
					return false;
				} else if (!reg.test($("#cycleName").val())) {
					$("#cycleName").addClass('inputErrorBorder');
					$("#cycleName").val('');
					return false;
				} else {
					var relID = $("li.active").children('span.releaseName').data("releaseid");
					for (i = 0; i < updateProjectDetails.length; i++) {
						if (relID == updateProjectDetails[i].releaseId) {
							for (j = 0; j < updateProjectDetails[i].cycleDetails.length; j++) {
								if ($("#cycleName").val().trim() == updateProjectDetails[i].cycleDetails[j].cycleName) {
									$(".close:visible").trigger('click');
									openModalPopup("Edit Cycle Name", "Cycle Name already exists");
									return false;
								}
							}
							break;
						}
					}
					$("#cycleName").removeClass('inputErrorBorder');
					cycleName = $("#cycleName").val();

					$(".close:visible").trigger('click');
					taskName = $("#page-taskName").children("span").text();
					if (taskName == "Create Project") {
						$("#" + editCycleId).parent().prev('span').text($("#cycleName").val());
						$("#" + editCycleId).parent().prev('span')[0].setAttribute("title", $("#cycleName").val());
						var cycleIndex = '';
						cycleIndex = $('li.cycleList').index();
						for (var i = 0; i < projectDetails.length; i++) {
							if (projectDetails[i].releaseName == $("li.active").children('span.releaseName').text()) {
								for (var j = 0; j < projectDetails[i].cycleNames.length; j++) {
									if (j == cycleIndex) {
										projectDetails[i].cycleNames[j] = $("#cycleName").val();
									}
								}
							}
						}
					} else if (taskName == "Update Project") {
						var oldCycText = $("#" + editCycleId).parent().prev('span').text();
						$("#" + editCycleId).parent().prev('span').text($("#cycleName").val());
						$("#" + editCycleId).parent().prev('span')[0].setAttribute("title", $("#cycleName").val());
						var cycleIndex = '';
						cycleIndex = $('li.cycleList').index();
						for (var i = 0; i < updateProjectDetails.length; i++) {
							if (updateProjectDetails[i].releaseName == $("li.active").children('span.releaseName').text()) {
								for (var j = 0; j < updateProjectDetails[i].cycleDetails.length; j++) {
									var objectType = typeof(updateProjectDetails[i].cycleDetails[j]);
									if (objectType == "object" && j == cycleIndex && (updateProjectDetails[i].releaseName == $("li.active").children('span.releaseName').text()) && (updateProjectDetails[i].cycleDetails[j].cycleId == editCycId)) {
										var editRelCyc = {
											"releaseId": "",
											"releaseName": "",
											"oldreleaseName": "",
											"cycleDetails": [],
											"editStatus": false
										};
										var editCycle = {
											"oldCycleName": "",
											"cycleName": "",
											"cycleId": "",
											"editStatus": false
										};
										//console.log("objectType", typeof(updateProjectDetails[i].cycleDetails[j]))
										updateProjectDetails[i].cycleDetails[j].cycleName = $("#cycleName").val();

										//For update project json
										if (editedProjectDetails.length <= 0) {
											//building release details
											editRelCyc.releaseId = relID; //updateProjectDetails[i].releaseId;
											editRelCyc.releaseName = $("li.active").children('span.releaseName').text(); //updateProjectDetails[i].releaseName;
											//building cycle details with release
											editCycle.oldCycleName = oldCycText;
											editCycle.cycleName = $("#cycleName").val(); //updateProjectDetails[i].cycleDetails[j].cycleName;
											editCycle.cycleId = editCycId; //updateProjectDetails[i].cycleDetails[j].cycleId;
											editCycle.editStatus = true;
											editRelCyc.cycleDetails.push(editCycle);
											//pushing all data to an array
											editedProjectDetails.push(editRelCyc);
										} else {
											var chkRelPresent = true;
											for (m = 0; m < editedProjectDetails.length; m++) {
												if (editedProjectDetails[m].releaseId == relID /*updateProjectDetails[i].releaseId*/) {
													var chkcycinrel = true;
													for (n = 0; n < editedProjectDetails[m].cycleDetails.length; n++) {
														if (editedProjectDetails[m].cycleDetails[n].cycleId == editCycId /*updateProjectDetails[i].cycleDetails[j].cycleId*/) {
															editedProjectDetails[m].cycleDetails[n].cycleName = $("#cycleName").val(); //updateProjectDetails[i].cycleDetails[j].cycleName;
															editedProjectDetails[m].cycleDetails[n].oldCycleName = oldCycText;
															editedProjectDetails[m].cycleDetails[n].editStatus = true;
															chkcycinrel = false;
															break;
														}
													}
													if (chkcycinrel == true) {
														//building cycle details with release
														editCycle.oldCycleName = oldCycText;
														editCycle.cycleName = $("#cycleName").val(); //updateProjectDetails[i].cycleDetails[j].cycleName;
														editCycle.cycleId = editCycId; //updateProjectDetails[i].cycleDetails[j].cycleId;
														editCycle.editStatus = true;
														editedProjectDetails[m].cycleDetails.push(editCycle);
														break;
													}
													chkRelPresent = false;
												}
											}
											if (chkRelPresent == true) {
												//building release details
												editRelCyc.releaseId = relID; //updateProjectDetails[i].releaseId;
												editRelCyc.releaseName = $("li.active").children('span.releaseName').text(); //updateProjectDetails[i].releaseName;
												//building cycle details with release
												editCycle.oldCycleName = oldCycText;
												editCycle.cycleName = $("#cycleName").val(); //updateProjectDetails[i].cycleDetails[j].cycleName;
												editCycle.cycleId = editCycId; //updateProjectDetails[i].cycleDetails[j].cycleId;
												editCycle.editStatus = true;
												editRelCyc.cycleDetails.push(editCycle);
												//pushing all data to an array
												editedProjectDetails.push(editRelCyc);
											}
										}
										break;
									}
									//For update project json
									if (objectType == "string" && j == cycleIndex) {
										updateProjectDetails[i].cycleDetails[j] = $("#cycleName").val();
									}
								}
							}
						}
					}
					//$("#"+editCycleId).addClass("editedCycle");
					//$("#"+editCycleId).siblings(".deleteCycle").addClass("editedCycle");
					event.stopImmediatePropagation();
					$("#" + event.target.id).unbind('click');
				}
			});
		}
	});

	//Delete Cycle Functionality: Open Popup
	$(document).on("click", "[id^=deleteCycleName_]", function(e){
		openDeleteGlobalModal("Delete Cycle","deleteCycleYes");
		deleteCycleId = e.target.id;
		var cycName = $(this).parent().siblings(".cycleName").text();
		deleteCycId = $(this).parent().siblings(".cycleName").attr("data-cycleid");
	});

	//Delete Cycle Functionality
	$(document).on("click", "#deleteCycleYes", function(event) {
		var CycleID = [];
		CycleID.push(deleteCycId);
		hideDeleteGlobalModal();
		taskName = $("#page-taskName").children("span").text();
		var goahead = false;
		if (taskName == "Create Project") {
			for (var i = 0; i < projectDetails.length; i++) {
				for (var j = 0; j < projectDetails[i].cycleNames.length; j++) {
					if ((projectDetails[i].cycleNames[j] == $("#" + deleteCycleId).parent().prev('span.cycleName').text()) && (projectDetails[i].releaseName == $("li.active").children('span.releaseName').text())) {
						delete projectDetails[i].cycleNames[j];
						projectDetails[i].cycleNames = projectDetails[i].cycleNames.filter(function (n) {
								return n != null;
							});
						goahead = true;
					}
				}
			}
			if (goahead == true) {
				$("#" + deleteCycleId).parent().parent("li").remove();
				openModalPopup("Delete Cycle", "Cycle deleted successfully");
				toggleCycleClick();
			}
		} else if (taskName == "Update Project") {
			var idtype = ["cycledetails"];
			adminServices.getDetails_ICE(idtype, CycleID)
			.then(function (response) {
				if (response == "Invalid Session") {
					$rootScope.redirectPage();
				}

				for (var i = 0; i < newProjectDetails.length; i++) {
					if (newProjectDetails[i].releaseName == $("li.active").children("span.releaseName").text()) {
						for (var j = 0; j < newProjectDetails[i].cycleDetails.length; j++) {
							if (newProjectDetails[i].cycleDetails[j].cycleName == $("#" + deleteCycleId).parent().prev('span.cycleName').text()) {
								delete newProjectDetails[i].cycleDetails[j];
								newProjectDetails[i].cycleDetails = newProjectDetails[i].cycleDetails.filter(function (n) {
										return n != null;
									});
								if (newProjectDetails[i].cycleDetails.length <= 0) {
									delete newProjectDetails[i];
									newProjectDetails = newProjectDetails.filter(function (n) {
											return n != null;
										});
									break;
								}
								goahead = true;
							}
						}
					}
				}
				if ((response.testsuiteIds == undefined && deleteCycId == undefined) || (response.testsuiteIds && response.testsuiteIds.length <= 0)) {
					for (var i = 0; i < updateProjectDetails.length; i++) {
						if (updateProjectDetails[i].releaseName == $("li.active").children("span.releaseName").text()) {
							for (var j = 0; j < updateProjectDetails[i].cycleDetails.length; j++) {
								var objectType = typeof(updateProjectDetails[i].cycleDetails[j]);
								if (objectType == 'object') {
									if (updateProjectDetails[i].cycleDetails[j].cycleName == $("#" + deleteCycleId).parent().prev('span.cycleName').text()) {
										var deleteRelCyc = {
											"releaseName": "",
											"releaseId": "",
											"cycleDetails": [],
											"deleteStatus": false
										};
										var deleteCycle = {
											"cycleName": "",
											"cycleId": "",
											"deleteStatus": false
										};
										//For update project json
										if (deletedProjectDetails.length <= 0) {
											//adding release object
											deleteRelCyc.releaseName = $("li.active").children("span.releaseName").text(); //updateProjectDetails[i].releaseName;
											deleteRelCyc.releaseId = $("li.active").children("span.releaseName").data("releaseid"); //updateProjectDetails[i].releaseId;
											deleteRelCyc.deleteStatus = false;
											//adding cycle object within release
											deleteCycle.cycleName = $("#" + deleteCycleId).parent().prev('span.cycleName').text(); //updateProjectDetails[i].cycleDetails[j].cycleName;
											deleteCycle.cycleId = deleteCycId; //updateProjectDetails[i].cycleDetails[j].cycleId;
											deleteCycle.deleteStatus = true;
											deleteRelCyc.cycleDetails.push(deleteCycle);
											//pushing all to object
											deletedProjectDetails.push(deleteRelCyc);
										} else {
											var chk = true;
											for (k = 0; k < deletedProjectDetails.length; k++) {
												if (deletedProjectDetails[k].releaseId == $("li.active").children("span.releaseName").data("releaseid") /*updateProjectDetails[i].releaseId*/) {
													var chkCycInRel = true;
													for (l = 0; l < deletedProjectDetails[k].cycleDetails.length; l++) {
														if (deletedProjectDetails[k].cycleDetails[l].cycleId == deleteCycId /*updateProjectDetails[i].cycleDetails[j].cycleId*/) {
															deletedProjectDetails[k].cycleDetails[l].cycleName = $("#" + deleteCycleId).parent().prev('span.cycleName').text(); //updateProjectDetails[i].cycleDetails[j].cycleName;
															deletedProjectDetails[k].cycleDetails[l].deleteStatus = true;
															chkCycInRel = false;
															break;
														}
													}
													if (chkCycInRel == true) {
														deleteCycle.cycleName = $("#" + deleteCycleId).parent().prev('span.cycleName').text(); //updateProjectDetails[i].cycleDetails[j].cycleName;
														deleteCycle.cycleId = deleteCycId; //updateProjectDetails[i].cycleDetails[j].cycleId;
														deleteCycle.deleteStatus = true;
														deletedProjectDetails[k].cycleDetails.push(deleteCycle);
													}
													chk = false;
												}
											}
											if (chk == true) {
												//adding release object
												deleteRelCyc.releaseName = $("li.active").children("span.releaseName").text(); //updateProjectDetails[i].releaseName;
												deleteRelCyc.releaseId = $("li.active").children("span.releaseName").data("releaseid"); //updateProjectDetails[i].releaseId;
												deleteRelCyc.deleteStatus = false;
												//adding cycle object within release
												deleteCycle.cycleName = $("#" + deleteCycleId).parent().prev('span.cycleName').text(); //updateProjectDetails[i].cycleDetails[j].cycleName;
												deleteCycle.cycleId = deleteCycId; //updateProjectDetails[i].cycleDetails[j].cycleId;
												deleteCycle.deleteStatus = true;
												deleteRelCyc.cycleDetails.push(deleteCycle);
												//pushing all to object
												deletedProjectDetails.push(deleteRelCyc);
											}
										}
										//For update project json
										delete updateProjectDetails[i].cycleDetails[j];
										updateProjectDetails[i].cycleDetails = updateProjectDetails[i].cycleDetails.filter(function (n) {
												return n != null;
											});
									}
								} else if (objectType == 'string') {
									if (updateProjectDetails[i].cycleDetails[j] == $("#" + deleteCycleId).parent().prev('span.cycleName').text()) {
										delete updateProjectDetails[i].cycleDetails[j];
										updateProjectDetails[i].cycleDetails = updateProjectDetails[i].cycleDetails.filter(function (n) {
												return n != null;
											});
									}
								}
							}
						}
					}
					goahead = true;
				} else if (response.testsuiteIds && response.testsuiteIds.length > 0) {
					goahead = false;
					openModalPopup("Delete Cycle", "Cycle contains Test suites. Cannot delete");
				}
				if (goahead == true) {
					$("#" + deleteCycleId).parent().parent("li").remove();
					openModalPopup("Delete Cycle", "Cycle deleted successfully");
					toggleCycleClick();
				}
			});
		}
	});

	//Load Projects for Edit
	$scope.editProjectTab = function () {
		projectDetails = [];
		updateProjectDetails = [];
		$scope.tab = "editProject";
		var plugins = [];
		$("#middle-content-section").addClass('removeScroll');
		adminServices.getAvailablePlugins()
		.then(function (plugins_list) {
			for (var i = 0; i < plugins_list.length; i++) {
				plugins[i] = plugins_list[i];
			}
			//$(document).on('change','#selDomainEdit', function() {
			//	var domainId = $("#selDomainEdit option:selected").val();
			adminServices.getDomains_ICE()
			.then(function (data) {
				if (data == "Invalid Session") {
					$rootScope.redirectPage();
				} else {
					domainId = data[0].domainId;
					$("#selDomainEdit").val(data[0].domainName);
					var domains = [domainId];
					var requestedids = [];
					requestedids.push(domainId);
					var idtype = ["domaindetails"];
					var details = {
						"web":{"data":"Web","title":"Web","img":"web"},
						"webservice":{"data":"Webservice","title":"Web Service","img":"webservice"},
						"mainframe":{"data":"Mainframe","title":"Mainframe","img":"mainframe"},
						"desktop":{"data":"Desktop","title":"Desktop Apps","img":"desktop"},
						"oebs":{"data":"DesktopJava","title":"Oracle Apps","img":"oracleApps"},
						"mobileapp":{"data":"MobileApp","title":"Mobile Apps","img":"mobileApps"},
						"mobileweb":{"data":"MobileWeb","title":"Mobile Web","img":"mobileWeb"},
						"sap":{"data":"SAP","title":"SAP Apps","img":"sapApps"},
						"system":{"data":"System","title":"System Apps","img":"desktop"}
					};
					$(".appTypesContainer").empty();
					for (var i = 0; i < plugins.length; i++) {
						html = '<div class="projectTypes" data-app="' + details[plugins[i]]['data'] + '" title="' + details[plugins[i]]['title'] + '"><img src="imgs/' + details[plugins[i]]['img'] + '.png" alt="' + details[plugins[i]]['title'] + '" /><label>' + details[plugins[i]]['title'] + '</label></div>';
						$(".appTypesContainer").append(html);
					}
					adminServices.getDetails_ICE(idtype, requestedids)
					.then(function (getDetailsResponse) {
						if (getDetailsResponse == "Invalid Session") {
							$rootScope.redirectPage();
						}
						$('#selProject').empty();
						$('#selProject').append($("<option value=''  disabled selected>Please Select Your Project</option>"));
						for (var i = 0; i < getDetailsResponse.projectNames.length; i++) {
							$('#selProject').append($("<option value=" + getDetailsResponse.projectIds[i] + "></option>").text(getDetailsResponse.projectNames[i]));
						}
						//sorting the dropdown values in alphabetical order
						var selectOptions = $("#selProject option:not(:first)");
						selectOptions.sort(function (a, b) {
							if (a.text > b.text)
								return 1;
							else if (a.text < b.text)
								return -1;
							else
								return 0;
						});
						$("#selProject").empty();
						$("#selProject").append('<option data-id="" value disabled selected>Please Select Your Project</option>');
						for (i = 0; i < selectOptions.length; i++) {
							$("#selProject").append(selectOptions[i]);
						}
						$("#selProject").prop('selectedIndex', 0);
					}, function (error) {
						console.log("Error:::::::::::::", error);
					});
					clearUpdateProjectObjects();
				}
			}, function (error) {
				console.log("Error:::::::::::::", error);
			});
		}, function (error) {
			console.log("Error:", error);
		});


		$(document).on('change', '#selProject', function () {
			updateProjectDetails = [];
			var domaiprojectId = $("#selProject option:selected").val();
			var projects = [];
			var requestedids = [domaiprojectId];
			var idtype = ["projectsdetails"];
			projects.push(domaiprojectId);
			//console.log("projects", projects);
			adminServices.getDetails_ICE(idtype, requestedids)
			.then(function (selProjectRes) {
				if (selProjectRes == "Invalid Session") {
					$rootScope.redirectPage();
				}
				//console.log("resposne", response);
				$("div.projectTypes").addClass("disableProjectType");
				switch (selProjectRes.appType) {
				case "Web":
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='Web'],.projectTypes_create[data-app='Web']").addClass("projectTypeSelected");
					break;
				case "Webservice":
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='Webservice'],.projectTypes_create[data-app='Webservice']").addClass("projectTypeSelected");
					break;
				case "Mainframe":
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='Mainframe'],.projectTypes_create[data-app='Mainframe']").addClass("projectTypeSelected");
					break;
				case "Desktop":
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='Desktop'],.projectTypes_create[data-app='Desktop']").addClass("projectTypeSelected");
					break;
				case "DesktopJava":
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='DesktopJava'],.projectTypes_create[data-app='DesktopJava']").addClass("projectTypeSelected");
					break;
				case "MobileApp":
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='MobileApp'],.projectTypes_create[data-app='MobileApp']").addClass("projectTypeSelected");
					break;
				case "MobileWeb":
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='MobileWeb'],.projectTypes_create[data-app='MobileWeb']").addClass("projectTypeSelected");
					break;
				case "SAP":
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='SAP'],.projectTypes_create[data-app='SAP']").addClass("projectTypeSelected");
					break;
				default:
				}
				$(".projectTypes").each(function () {
					if (!$(this).hasClass("projectTypeSelected")) {
						$(this).addClass("projectTypesremovefunc");
						$(this).find("label").css("cursor", "default");
					}
				});

				updateProjectDetails = [];
				updateProjectDetails = selProjectRes.projectDetails;
				$("#releaseList li,#cycleList li").remove();
				for (var i = 0; i < updateProjectDetails.length; i++) {
					$("#releaseList:not(.createRelBox)").append("<li class='updateRelease' id='releaseList_" + i + "'><img src='imgs/ic-release.png' /><span title=" + updateProjectDetails[i].releaseName + " data-releaseid=" + updateProjectDetails[i].releaseId + " class='releaseName'>" + updateProjectDetails[i].releaseName + "</span><span class='actionOnHover'><img id=editReleaseName_" + i + " title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_" + i + " title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
					$("#releaseList:not(.createRelBox) li:first").trigger('click');
				}
				showHideEditDeleteIcons();
			}, function (error) {
				console.log("Error:::::::::::::", error);
			});
			clearUpdateProjectObjects();
		});
	};

	//Toggle Release Edit Delete Icons
	function showHideEditDeleteIcons() {
		$("#releaseList li").each(function () {
			if ($(this).hasClass("active")) {
				$(this).children("span.actionOnHover").children("img").show();
			} else {
				$(this).children("span.actionOnHover").children("img").hide();
			}
		});
	}

	//AppTypeSelect Functionality
	$(document).on("click", ".projectTypes, .projectTypes_create", function (event) {
		var taskName = $("#page-taskName").children("span").text();
		if (taskName == "Create Project") {
			$(this).toggleClass("projectTypeSelected");
			$(this).siblings().removeClass("projectTypeSelected");
		} else
			return false;
		event.stopImmediatePropagation();
	});

	$scope.userConf.click = function(query) {
		$(".selectedIcon").removeClass("selectedIcon");
		$("button.userTypeBtnActive").removeClass('userTypeBtnActive');
		$("#userTab").find("img").addClass("selectedIcon");
		this.userId = '';
		this.userName = '';
		this.userIdName = '';
		this.firstName = '';
		this.lastName = '';
		this.passWord = '';
		this.confirmPassword = '';
		this.email = '';
		this.role = '';
		this.addRole = {};
		this.nocreate = false;
		this.getUserRoles();
		this.ciActive = false;
		if (query != "retainldap") {
			if (!this.ldapActive) {
				this.ldapActive = false;
				this.ldap = {server: '', fetch: "map", user: '', expired: false};
			} else {
				this.ldapActive = true;
				$scope.userConf.activateLDAP();
			}
			this.ldapAllServerList=[];
			this.ldapAllUserList=[];
		}
		this.query0 = '';
		this.query1 = '';
	};

	//Fetch All Available User Roles
	$scope.userConf.getUserRoles = function() {
		if (!this.allRoles) {
			adminServices.getUserRoles_Nineteen68()
			.then(function (rolesRes) {
				if(rolesRes == "Invalid Session"){
					$rootScope.redirectPage();
				} else {
					rolesRes.sort(function(a,b){ return a[0] >  b[0]; });
					$scope.userConf.allRoles = rolesRes;
					$scope.userConf.allAddRoles = rolesRes.slice(0);
					rolesRes.some(function(e,i) {
						if (e[0].toLowerCase()=="admin") {
							$scope.userConf.allAddRoles.splice(i,1);
							return true;
						}
					});
				}
			}, function (error) {
				$scope.userConf.allRoles = [];
				openModalPopup("Manage Users", "Something Went Wrong");
			});
		}
	};

	$scope.userConf.validate = function(action) {
		var flag = true;
		$("#userName,#firstName,#lastName,#password,#confirmPassword,#email,#ldapDirectory").removeClass("inputErrorBorder");
		$("#userIdName,#userRoles,#ldapServer,#ldapDirectory").removeClass("selectErrorBorder");
		var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		//var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,16}$/;
		var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		if(this.ciActive) return flag;
		var popupOpen = false;
		if (this.userName == "") {
			var nameErrorClass = (action == "update")? "selectErrorBorder":"inputErrorBorder";
			$("#userName").addClass(nameErrorClass);
			flag = false;
		}
		if (this.userIdName == "" && action=="update") {
			$("#userIdName").addClass("selectErrorBorder");
			flag = false;
		}
		if (this.firstName == "") {
			$("#firstName").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.lastName == "") {
			$("#lastName").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.ldapActive) {
			if (this.ldap.server == "") {
				$("#ldapServer").addClass("selectErrorBorder");
				flag = false;
			}
			if (this.ldap.expired && action != "delete") {
				if (!popupOpen) openModalPopup("Error", "This configuration is deleted/invalid...");
				popupOpen = true;
				$("#ldapServer").addClass("selectErrorBorder");
				flag = false;
			}
			if (this.ldap.user == "") {
				$("#ldapDirectory").addClass("selectErrorBorder");
				flag = false;
			}
		} else if (action != "delete" && !(action == "update" && this.passWord == "" && this.confirmPassword == "")) {
			if (this.passWord == "") {
				$("#password").addClass("inputErrorBorder");
				flag = false;
			} else if (!regexPassword.test(this.passWord)) {
				if (!popupOpen) openModalPopup("Error", "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 12 characters..");
				popupOpen = true;
				$("#password").addClass("inputErrorBorder");
				flag = false;
			}
			if (this.confirmPassword == "") {
				$("#confirmPassword").addClass("inputErrorBorder");
				flag = false;
			} else if (!regexPassword.test(this.confirmPassword)) {
				if (!popupOpen) openModalPopup("Error", "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 12 characters..");
				popupOpen = true;
				$("#confirmPassword").addClass("inputErrorBorder");
				flag = false;
			}
			if (this.passWord != this.confirmPassword) {
				if (!popupOpen) openModalPopup("Error", "Password and Confirm Password did not match");
				popupOpen = true;
				$("#confirmPassword").addClass("inputErrorBorder");
				flag = false;
			}
		}
		if (this.email == "") {
			$("#email").addClass("inputErrorBorder");
			flag = false;
		} else if (!emailRegEx.test(this.email)) {
			if (!popupOpen) openModalPopup("Error", "Email address is not valid");
			popupOpen = true;
			$("#email").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.role == "") {
			$("#userRoles").addClass("selectErrorBorder");
			flag = false;
		}
		/*if (this.addRole == "" && action=="update") {
			$("#userRoles").addClass("selectErrorBorder");
			flag = false;
		}*/
		return flag;
	};

	//Create / Update / Delete User
	$scope.userConf.manage = function(action,$event) {
		//Transaction Activity for Create/ Update/ Delete User button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['UserConfmanage']);
		// infoArr.push(action);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);

		var userConf = $scope.userConf;
		if (!userConf.validate(action)) return;
		var bAction = action.charAt(0).toUpperCase() + action.substr(1);
		var addRole = [];
		for (var role in userConf.addRole) {
			if (userConf.addRole[role]) addRole.push(role);
		}
		var userObj = {
			userid: userConf.userId,
			username: userConf.userName.toLowerCase(),
			password: userConf.passWord,
			firstname: userConf.firstName,
			lastname: userConf.lastName,
			email: userConf.email,
			role: userConf.role,
			addRole: addRole,
			ciUser: userConf.ciActive,
			ldapUser: userConf.ldapActive
		};
		if (userConf.ldapActive) {
			userObj.ldap = userConf.ldap;
		}
		blockUI(bAction.slice(0,-1)+"ing User...");
		adminServices.manageUserDetails(action, userObj)
		.then(function (data) {
			unblockUI();
			if(data == "Invalid Session"){
				$rootScope.redirectPage();
			} else if(data == "success") {
				if (action == "create") $scope.userConf.click();
				else $scope.userConf.edit();
				openModalPopup(bAction+" User", "User "+action+"d successfully!");
			} else if(data == "exists") {
				$("#userName").addClass("inputErrorBorder");
				openModalPopup(bAction+" User", "User already Exists!");
			} else if(data == "fail") {
				if (action == "create") $scope.userConf.click();
				else $scope.userConf.edit();
				openModalPopup(bAction+" User", "Failed to "+action+" user.");
			} else if(/^2[0-4]{10}$/.test(data)) {
				if (parseInt(data[1])) {
					openModalPopup(bAction+" User", "Failed to "+action+" user. Invalid Request!");
					return;
				}
				var errfields = [];
				if (parseInt(data[2])) errfields.push("User Name");
				if (parseInt(data[3])) errfields.push("First Name");
				if (parseInt(data[4])) errfields.push("Last Name");
				if (parseInt(data[5])) errfields.push("Password");
				if (parseInt(data[6])) errfields.push("Email");
				if (parseInt(data[7])) errfields.push("Primary Role");
				if (parseInt(data[8])) errfields.push("Additional Role");
				if (parseInt(data[9])) errfields.push("LDAP Server");
				if (parseInt(data[10])) errfields.push("User Domain Name");
				openModalPopup(bAction+" User", "Following values are invalid: "+errfields.join(", "));
			}
		}, function (error) {
			unblockUI();
			openModalPopup(bAction+" User", "Failed to "+action+" user.");
		});
	};

	//LDAP Functionality for User
	$scope.userConf.activateLDAP = function(cb) {
		if (!cb) cb = function() {};
		var currentServer = this.ldap.server;
		if (currentServer) this.ldap = {server: currentServer, fetch: "map", user: ''};
		else this.ldap = {server: '', fetch: "map", user: ''};
		setTimeout(function(){
			var target = $("button.ldapBtn");
			if ($scope.userConf.ldapActive) target.addClass("userTypeBtnActive");
			else target.removeClass("userTypeBtnActive");
		}, 50);
		if (!this.ldapActive) return;
		blockUI("Fetching LDAP Server configurations...");
		adminServices.getLDAPConfig("server")
		.then(function(data){
			unblockUI();
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "fail") {
				$scope.userConf.nocreate = true;
				openModalPopup("Create User", "Failed to fetch LDAP server configurations.");
			} else if(data == "empty") {
				$scope.userConf.nocreate = true;
				openModalPopup("Create User","There are no LDAP server configured. To proceed create a server configuration in LDAP configuration section.");
			} else {
				$scope.userConf.ldapAllServerList=[];
				data.sort(function(a,b) { return a > b; });
				data.forEach(function(e) {
					$scope.userConf.ldapAllServerList.push(e);
				});
				cb();
			}
		}, function (error) {
			unblockUI();
			$scope.userConf.nocreate = true;
			console.log("Error:::::::::::::", error);
			openModalPopup("Create User", "Failed to fetch LDAP server configurations");
		});
	};

	$scope.userConf.ldapSetServer = function() {
		this.userName = '';
		this.firstName = '';
		this.lastName = '';
		this.email = '';
		this.ldap.user = '';
		this.ldap.fetch = 'map';
	};

	//LDAP Functionality for User: Switch choice between import and map
	$scope.userConf.ldapSwitchFetch = function() {
		$("#ldapDirectory").removeClass("inputErrorBorder").removeClass("selectErrorBorder");
		if (this.ldap.fetch == "import") {
			var ldapServer = this.ldap.server;
			$scope.userConf.nocreate = true;
			blockUI("Fetching LDAP users...");
			adminServices.getLDAPConfig("user", ldapServer)
			.then(function(data){
				$scope.userConf.ldapAllUserList=[];
				unblockUI();
				if(data == "Invalid Session") {
					$rootScope.redirectPage();
				} else if(data == "fail") {
					openModalPopup("Create User", "Failed to LDAP fetch users");
				} else if(data == "insufficient_access") {
					openModalPopup("Create User", "Either Credentials provided in LDAP server configuration does not have required privileges for fetching users or there are no users available in this Server");
				} else if(data == "empty") {
					openModalPopup("Create User","There are no users available in this Server.");
				} else {
					$scope.userConf.nocreate = false;
					data.sort(function(a,b) { return a > b; });
					data.forEach(function(e) {
						$scope.userConf.ldapAllUserList.push({value:e[1],html:e[0]});
					});
				}
			}, function (error) {
				unblockUI();
				console.log("Error:::::::::::::", error);
				openModalPopup("Create User", "Failed to fetch LDAP server configurations");
			});
		} else {
			this.ldap.user = '';
			this.userName = '';
			this.firstName = '';
			this.lastName = '';
			this.email = '';
		}
	};

	//LDAP Functionality for User: Verify and Fetch user details from ldapdb
	$scope.userConf.ldapGetUser = function() {
		var ldapUser = this.ldap.user;
		var ldapServer = this.ldap.server;
		this.nocreate = true;
		this.userName = '';
		this.firstName = '';
		this.lastName = '';
		this.email = '';
		if (this.ldap.user == '') {
			$("#ldapDirectory").addClass("inputErrorBorder");
			return;
		}
		userConf = $scope.userConf;
		blockUI("Fetching User details...");
		adminServices.getLDAPConfig("user", ldapServer, ldapUser)
		.then(function(data){
			unblockUI();
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "fail") {
				openModalPopup("Create User", "Failed to populate User details");
			} else if(data == "insufficient_access") {
				openModalPopup("Create User", "Either Credentials provided in LDAP server configuration does not have required privileges for fetching users or there is no such user");
			} else if(data == "empty") {
				openModalPopup("Create User","User not found!");				
			} else {
				userConf.nocreate = false;
				userConf.userName = data.username;
				userConf.firstName = data.firstname;
				userConf.lastName = data.lastname;
				userConf.email = data.email;
				userConf.ldap.user = data.ldapname;
			}
		}, function (error) {
			unblockUI();
			console.log("Error:::::::::::::", error);
			openModalPopup("Create User", "Failed to fetch LDAP server configurations");
		});
	};

	//Generate CI Token
	$scope.userConf.activateCI = function($event){
		this.ciActive = !this.ciActive;
		var target = $("button.citokenBtn");
		if(this.ciActive){
			target.addClass("userTypeBtnActive");
			blockUI("Fetching Token...");
			adminServices.generateCItoken()
			.then(function (data) {
				unblockUI();
				if (data == "Invalid Session") {
					$rootScope.redirectPage();
				} else {
					$scope.userConf.userName = data.user_name;
					$scope.userConf.passWord = data.token;
				}
			}, function (error) {
				unblockUI();
				console.log("Error:::::::::::::", error);
				openModalPopup("Create User", "Something Went Wrong");
			});
		} else {
			target.removeClass("userTypeBtnActive");
			$scope.userConf.click();
		}
	};

	//Load Users for Edit
	$scope.userConf.edit = function() {
		this.ldapActive = false;
		this.ciActive = false;
		this.click();
		$scope.tab = "editUser";
		blockUI("Fetching users...");
		adminServices.getUserDetails("user")
		.then(function(data){
			unblockUI();
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "fail") {
				openModalPopup("Edit User", "Failed to fetch users.");
			} else if(data == "empty") {
				openModalPopup("Edit User", "There are no users created yet.");
			} else {
				data.sort(function(a,b){ return a[0] > b[0]; });
				$scope.userConf.allUsersList = data;
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Edit User", "Failed to fetch users.");
		});
	};

	//Get Selected User Data
	$scope.userConf.getUserData = function() {
		var userObj = this.userIdName.split(';');
		this.userId = userObj[0];
		this.userName = userObj[1];
		userConf = $scope.userConf;
		var failMsg = "Failed to fetch user details.";
		blockUI("Fetching User details...");
		adminServices.getUserDetails("userid", userObj[0])
		.then(function(data){
			unblockUI();
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "fail") {
				openModalPopup("Edit User", failMsg);
			} else {
				userConf.userId = data.userid;
				userConf.userName = data.username;
				userConf.userIdName = data.userid+";"+data.username;
				userConf.passWord = data.password;
				userConf.firstName = data.firstname;
				userConf.lastName = data.lastname;
				userConf.email = data.email;
				userConf.role = data.role;
				userConf.addRole = {};
				data.addrole.forEach(function(e){
					userConf.addRole[e] = true;
				});
				if (!data.ldapuser) {
					userConf.ldapActive = false;
					$scope.userConf.activateLDAP();
				} else {
					userConf.ldapActive = true;
					var ldapserver = data.ldapuser.server;
					var ldapuser = data.ldapuser.user;
					$scope.userConf.activateLDAP(function() {
						userConf.ldap.expired = false;
						if (!userConf.ldapAllServerList.some(function(e) { return e == ldapserver;})) {
							userConf.ldapAllServerList.push(ldapserver);
							userConf.ldap.expired = ldapserver;
						}
						userConf.ldap.user = ldapuser;
						userConf.ldap.server = ldapserver;
					});
					
				}
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Edit User", failMsg);
		});
	};

	//Delete User Data: Confirmation
	$scope.userConf.delete = function (action) {
		openDeleteGlobalModal("Delete User", "delUserConf");
	};
	
	//Delete User Data
	$(document).on('click','#delUserConf', function(e) {
		hideDeleteGlobalModal();
		$scope.userConf.manage("delete",e);
	});

	//Populating secondary role drop down
	$scope.userConf.toggleAddRoles = function() {
		var addRolesObj = $('#additionalRoles');
		if (addRolesObj.is(':hidden')){
			addRolesObj.show();
		} else{
			addRolesObj.hide();
		}
	};

	$(document).mouseup(function(e) {
		var roleSel = $("#additionalRole_options");
		var roleOpt = $("#additionalRoles");
		if ((!roleSel.is(e.target) && roleSel.has(e.target).length === 0) && (!roleOpt.is(e.target) && roleOpt.has(e.target).length === 0)) {
			$('#additionalRoles').hide();
		}
	});

	$(document).on("keypress", "#email", function (key) {
		if (key.charCode >= 189 || key.charCode == 64 || key.charCode == 46)
			return true;
		else if ((key.charCode < 95 || key.charCode > 122) && (key.charCode < 48 || key.charCode > 57) && (key.charCode < 65 || key.charCode > 90) && (key.charCode != 45) || key.charCode == 96 || key.charCode == 32)
			return false;
	});

	$(document).on("blur", "#email", function () {
		var reg = /^[a-zA-Z0-9\.\@\-\_]+$/
			if (reg.test($(this).val()) && !(/^[\s]+$/).test($(this).val())) {
				return true;
			} else if ($(this).val() != '') {
				openModalPopup("Incorrect Inputs", "Cannot contain special characters other than ._-");
				$(this).val('');
				return false;
			}
	});

	// Prevents special characters on keydown
	$(document).on("keydown", ".validationKeydown", function (e) {
		if (e.target.id == "ldapServerURL" && [':', '/'].indexOf(e.key) > -1)
			return true;
		// Block all characters except _ . a-Z 0-9 - [ ] { } ! # $ ^ & . space
		if (([59, 61, 106, 107, 109, 111, 173, 186, 187, 188, 191, 192, 220, 222].indexOf(e.keyCode) > -1) || e.shiftKey && ([48, 50, 53, 56, 57, 190].indexOf(e.keyCode) > -1))
			return false;
		else
			return true;
		// Block all characters except underscore, alphabet, digit, space, dot
		/*if (([59,61,106,107,109,111,173,186,187,188,191,192,219,220,221,222].indexOf(e.keyCode) > -1) || !e.shiftKey && e.keyCode == 189 || e.shiftKey && (e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode == 190)) return false;
		else {
		if (e.target.id == "userName" && e.keyCode == 32) return false;
		if ((e.target.id == "firstName" || e.target.id == "lastName") && (([32,110,189,190].indexOf(e.keyCode) > -1) || e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode >= 96 && e.keyCode <= 105)) return false;
		return true;
		}*/
	});

	// All Special characters prevented on cut copy paste
	$(document).on('cut copy paste', '.preventSpecialChar', function (e) {
		var element = $(this);
		setTimeout(function () {
			var userEnteredText = element.val();
			var regex;
			if (e.target.id == 'userName')
				regex = /[\\[\]\~`!@#$%^&*()+={}|;:"',<>?/\s]/g;
			if (e.target.id == 'ldapServerURL')
				regex = /[\\[\]\~`!@#$%^&*()+={}|;"',<>?\s]/g;
			else if (e.target.id == 'projectName' || e.target.id == 'releaseTxt' || e.target.id == 'cycleTxt' || e.target.id == 'releaseName' || e.target.id == 'cycleName')
				regex = /[-\\[\]\~`!@#$%^&*()+={}|;:"',.<>?/\s]/g;
			else
				regex = /[-\\0-9[\]\~`!@#$%^&*()-+={}|;:"',.<>?/\s_]/g;
			userEnteredText = userEnteredText.replace(regex, "");
			element.val(userEnteredText);
		}, 5);
	});

	// Prevents special characters on blur/paste
	$(document).on("blur", ".validationBlur", function (e) {
		var id = e.target.id;
		var val = $(this).val();
		preventSpecialCharOnBlur(id, val);
	});

	function preventSpecialCharOnBlur(id, val) {
		var reg = /^[a-zA-Z0-9\_]+$/
			if (reg.test(val)) {
				return true;
			} else if (val != '') {
				openModalPopup("Incorrect Inputs", "Cannot contain special characters other than _");
				$("#" + id).val('');
				return false;
			}
	}
	//Global modal popup
	function openModalPopup(title, body) {
		var mainModal = $("#adminModal");
		mainModal.find('.modal-title').text(title);
		mainModal.find('.modal-body p').text(body);
		mainModal.modal("show");
		setTimeout(function () {
			$("#adminModal").find('.btn-default').focus();
		}, 300);
	}

	//Global edit modal popup
	function openEditGlobalModal(title, inputID, placeholder, buttonID) {
		var editModal = $("#editGlobalModal");
		editModal.find('.modal-title').text(title);
		editModal.find('input').prop("id", inputID).prop("placeholder", placeholder);
		editModal.find('button.btnGlobalSave').prop("id", buttonID);
		editModal.modal("show");
		setTimeout(function () {
			$("#editGlobalModal").find('input').focus();
		}, 300);
	}

	//Show Global delete modal popup
	function openDeleteGlobalModal(title, buttonID) {
		var delModal = $("#deleteGlobalModal");
		delModal.find('.modal-title').text(title);
		delModal.find('button.btnGlobalYes').prop("id", buttonID);
		delModal.modal("show");
		setTimeout(function () {
			$("#deleteGlobalModal").find('.btn-default')[1].focus();
		}, 300);
	}

	//Hide Global delete modal popup
	function hideDeleteGlobalModal() {
		var delModal = $("#deleteGlobalModal");
		delModal.modal("hide");
		delModal.find('.modal-title').text('');
		delModal.find('button.btnGlobalYes').prop("id", "deleteGlobalModalButton");
	}

	function clearUpdateProjectObjects() {
		newProjectDetails = [];
		deletedProjectDetails = [];
		editedProjectDetails = [];
	}

	function moveItems(origin, dest) {
		$(origin).find(':selected').appendTo(dest);
	}

	function moveAllItems(origin, dest) {
		$(origin).children().appendTo(dest);
	}

	$scope.moveItems.leftgo = function (to,from) {
		unAssignedFlag = true;
		moveItems(to,from);
	};

	$scope.moveItems.rightgo = function (from,to) {
		unAssignedFlag = false;
		moveItems(from,to);
	};

	$scope.moveItems.leftall = function (to,from) {
		unAssignedFlag = true;
		moveAllItems(to,from);
	};

	$scope.moveItems.rightall = function (from,to) {
		unAssignedFlag = false;
		moveAllItems(from,to);
	};

	$scope.ldapConf.click = function (action) {
		$(".selectedIcon").removeClass("selectedIcon");
		$("#ldapConfigTab").find("img").addClass("selectedIcon");
		this.serverName = "";
		this.url = "";
		this.authType = "anonymous";
		this.bindDN = "";
		this.bindCredentials = "";
		this.baseDN = "";
		this.fieldMap = {uName: "None", fName: "None", lName: "None", email: "None"};
		this.fieldMapOpts = ["None"];
		if (action == "edit") this.authType = "";
		this.testStatus = "false";
		this.switchAuthType();
	};

	$scope.ldapConf.validate = function(action) {
		var flag = true;
		$("#ldapServerURL,#bindDN,#bindCredentials,#ldapBaseDN").removeClass("inputErrorBorder");
		$("#ldapFMapUname,#ldapFMapFname,#ldapFMapLname,#ldapFMapEmail").removeClass("selectErrorBorder");
		var nameErrorClass = (action == "update")? "selectErrorBorder":"inputErrorBorder";
		$("#ldapServerName").removeClass(nameErrorClass);
		regExURL = /^ldap:\/\/[A-Za-z0-9._-]+:\d+$/;
		if (this.serverName == "") {
			$("#ldapServerName").addClass(nameErrorClass);
			flag = false;
		}
		if (this.url == "") {
			$("#ldapServerURL").addClass("inputErrorBorder");
			flag = false;
		} else if (regExURL.test(this.url) == false) {
			$("#ldapServerURL").addClass("inputErrorBorder");
			openModalPopup("Error", "Invalid URL provided! URL must start with ldap:// followed by either an IP or a well defined domain name has to be provided along with a port number.");
			flag = false;
		}
		if (this.baseDN == "") {
			$("#ldapBaseDN").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.bindDN == "" && this.authType == "simple") {
			$("#bindDN").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.bindCredentials == "" && this.authType == "simple" && action == "create") {
			$("#bindCredentials").addClass("inputErrorBorder");
			flag = false;
		}
		if (action != "test") {
			if (this.fieldMap.uName == "") {
				$("#ldapFMapUname").addClass("selectErrorBorder");
				flag = false;
			}
			if (this.fieldMap.fName == "") {
				$("#ldapFMapFname").addClass("selectErrorBorder");
				flag = false;
			}
			if (this.fieldMap.lName == "") {
				$("#ldapFMapLname").addClass("selectErrorBorder");
				flag = false;
			}
			if (this.fieldMap.email == "") {
				$("#ldapFMapEmail").addClass("selectErrorBorder");
				flag = false;
			}
		}
		return flag;
	};

	$scope.ldapConf.manage = function (action,$event) {
		var ldapConf = $scope.ldapConf;
		if (!ldapConf.validate(action)) return;
		var bAction = action.charAt(0).toUpperCase() + action.substr(1);
		var confObj = {
			name: ldapConf.serverName,
			ldapURL: ldapConf.url,
			baseDN: ldapConf.baseDN,
			authType: ldapConf.authType,
			authUser: ldapConf.bindDN,
			authKey: ldapConf.bindCredentials,
			fieldMap: ldapConf.fieldMap
		};
		blockUI(bAction.slice(0,-1)+"ing configuration...");
		//Transaction Activity for Create/ Update/ Delete LDAP conf button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['LdapConfmanage']);
		// infoArr.push(action);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
		adminServices.manageLDAPConfig(action, confObj)
		.then(function(data){
			unblockUI();
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "success") {
				if (action == "create") $scope.ldapConf.click();
				else $scope.ldapConf.edit();
				openModalPopup(bAction+" Configuration", "Configuration '"+confObj.name+"' "+action+"d successfully!");
			} else if(data == "exists") {
				$("#ldapServerName").addClass("inputErrorBorder");
				openModalPopup(bAction+" Configuration", "Configuration '"+confObj.name+"' already Exists!");
			} else if(data == "fail") {
				if (action == "create") $scope.ldapConf.click();
				else $scope.ldapConf.edit();
				openModalPopup(bAction+" Configuration", "Failed to "+action+" '"+confObj.name+"' configuration.");
			} else if(/^1[0-4]{8}$/.test(data)) {
				if (parseInt(data[1])) {
					openModalPopup(bAction+" Configuration", "Failed to "+action+" '"+confObj.name+"' configuration. Invalid Request!");
					return;
				}
				var errfields = [];
				var errHints = [];
				if (parseInt(data[2])) errfields.push("Server Name");
				if (parseInt(data[3])) errfields.push("Directory Provider URL");
				if (parseInt(data[3]) == 2) errHints.push("'ldaps' protocol is not supported");
				if (parseInt(data[3]) == 3) errHints.push("'ldap://' is missing from url prefix");
				if (parseInt(data[4])) errfields.push("Base Domain Name");
				if (parseInt(data[5])) errfields.push("Authentication Type");
				if (parseInt(data[6])) errfields.push("Authentication Principal");
				if (parseInt(data[7])) errfields.push("Authentication Credentials");
				if (parseInt(data[8])) errfields.push("Data Mapping Settings");
				openModalPopup(bAction+" Configuration", "Following values are invalid: "+errfields.join(", ")+". Note: "+errHints);
			}
		}, function (error) {
			unblockUI();
			openModalPopup(bAction+" Configuration", "Failed to "+action+" '"+confObj.name+"' configuration.");
		});
	};

	$scope.ldapConf.edit = function () {
		$scope.tab = "tabldapConfigEdit";
		this.click("edit");
		blockUI("Fetching details...");
		adminServices.getLDAPConfig("server")
		.then(function(data){
			unblockUI();
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "fail") {
				openModalPopup("Edit Configuration", "Failed to fetch configurations.");
			} else if(data == "empty") {
				openModalPopup("Edit Configuration", "There are no configurations created yet.");
				var selBox = $("#ldapServerName");
				selBox.empty();
				selBox.append("<option value='' disabled selected>Select Server</option>");
				selBox.prop("selectedIndex", 0);
			} else {
				data.sort(function(a,b){ return a > b; });
				var selBox = $("#ldapServerName");
				selBox.empty();
				selBox.append("<option value='' disabled selected>Select Server</option>");
				for(var i = 0; i < data.length; i++){
					selBox.append("<option value=\""+data[i]+"\">"+data[i]+"</option>");
				}
				selBox.prop("selectedIndex", 0);
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Edit Configuration", "Failed to fetch configurations.");
		});
	};

	$scope.ldapConf.delete = function (action) {
		openDeleteGlobalModal("Delete Configuration", "delLdapConf");
	};
	
	$(document).on('click','#delLdapConf', function(e) {
		hideDeleteGlobalModal();
		$scope.ldapConf.manage("delete",e);
	});

	$scope.ldapConf.getServerData = function () {
		var name = this.serverName;
		ldapConf = $scope.ldapConf;
		var failMsg = "Failed to fetch details for '"+name+"' configuration.";
		blockUI("Fetching details...");
		adminServices.getLDAPConfig("config", name)
		.then(function(data){
			unblockUI();
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "fail") {
				openModalPopup("Edit Configuration", failMsg);
			} else {
				ldapConf.url = data.url;
				ldapConf.baseDN = data.baseDN;
				ldapConf.authType = data.authType;
				ldapConf.bindDN = data.bindDN;
				ldapConf.bindCredentials = data.bindCredentials;
				ldapConf.fieldMap = data.fieldMap;
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Edit Configuration", failMsg);
		});
	};

	$scope.ldapConf.test = function($event){
		if (!this.validate("test")) return;
		//Transaction Activity for LDAP conf Test Button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['LdapConftest']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
		var url = this.url;
		var base_dn = this.baseDN;
		var bind_dn = this.bindDN;
		var bind_auth = this.bindCredentials;
		var auth = this.authType;
		blockUI("Testing Connection...");
		adminServices.testLDAPConnection(auth, url, base_dn, bind_dn, bind_auth)
		.then(function(data){
			unblockUI();
			var fields = (typeof data=="string")? [] : (data.fields || []);
			if (typeof data!="string") data = data.flag;
			$scope.ldapConf.testStatus = data;
			if(data == "Invalid Session"){
				$rootScope.redirectPage();
				$(".modal-backdrop").remove();
			} else if(data == "success"){
				openModalPopup("Test Connection", "Test Connection Successful!");
				$scope.ldapConf.fieldMapOpts = fields.concat("None").sort();
			} else if(data == "fail"){
				openModalPopup("Test Connection", "Test Connection Failed!");
			} else if(data == "invalid_addr"){
				openModalPopup("Test Connection", "Test Connection Failed! Either host is unavailable or port is incorrect.");
			} else if(data == "invalid_url_protocol"){
				openModalPopup("Test Connection", "Test Connection Failed! Invalid URL. 'ldaps://' is not permitted");
			} else if(data == "invalid_url"){
				openModalPopup("Test Connection", "Test Connection Failed! Invalid URL. It must start with 'ldap://'");
			} else if(data == "invalid_auth"){
				openModalPopup("Test Connection", "Test Connection Success! Anonymous access is not allowed for this server.");
			} else if(data == "invalid_credentials"){
				openModalPopup("Test Connection", "Test Connection Failed! Credentials provided for Authentication are invalid.");
			} else if(data == "insufficient_access"){
				openModalPopup("Test Connection", "Test Connection Failed! Credentials provided does not have required privileges for setting up LDAP.");
			} else if(data == "invalid_basedn"){
				openModalPopup("Test Connection", "Test Connection Failed! Base Domain Name is incorrect.");
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Test Connection", "Test Connection Failed!");
		});
	};

	$scope.ldapConf.switchAuthType = function(){
		if($scope.ldapConf.authType == "anonymous"){
			$("#bindDN").val('');
			$("#bindCredentials").val('');
		}
	};

	// Session Management Tab Click
	$scope.sessionConf.click = function () {
		$(".selectedIcon").removeClass("selectedIcon");
		$("#sessionTab").find("img").addClass("selectedIcon");
		blockUI("Retrieving session data...");
		adminServices.manageSessionData("get")
		.then(function (data) {
			if (data == "Invalid Session") {
				$rootScope.redirectPage();
			} else {
				data.sessionData.sort(function(a,b) { return a.username > b.username; });
				data.clientData.sort(function(a,b) { return a.username > b.username; });
				$scope.sessionConf.sessions = data.sessionData;
				$scope.sessionConf.clients = data.clientData;
			}
			unblockUI();
		}, function (error) {
			console.error("Fail to load session data", error);
		});
	};

	// Session Management: Logoff/Disconnect User
	$scope.sessionConf.kill = function ($event) {
		var ele = $event.target;
		var action = $event.target.innerHTML.trim().toLowerCase();
		var id = parseInt($event.target.dataset.id);
		var msg, rootObj, key, obj;
		if (action == "logout") {
			msg = "Logging out ";
			rootObj = $scope.sessionConf.sessions;
			obj = rootObj[id];
			key = obj.id;
		} else {
			msg = "Disconnecting ";
			rootObj = $scope.sessionConf.clients;
			obj = rootObj[id];
			key = obj.mode;
		}
		var user = obj.username;
		blockUI(msg+user+"...");
		adminServices.manageSessionData(action,user,key)
		.then(function (data) {
			if (data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if (data == "fail") {
				openModalPopup("Session Management", msg+"failed!")
			} else {
				rootObj.splice(id,1);
			}
			unblockUI();
		}, function (error) {
			console.error("Fail to load session data", error);
		});
	};
}]);
