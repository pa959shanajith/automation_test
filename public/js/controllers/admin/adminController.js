/**
 * 
 */
var DOMAINID, releaseName, cycleName, count=0,delCount=0,editReleaseId='',editCycleId='',deleteReleaseId='',deleteCycleId='';releaseNamesArr =[];
var createprojectObj = {}; var projectDetails = [];var releCycObj;var flag;var projectExists;
mySPA.controller('adminController', ['$scope', '$http', 'adminServices','$timeout','cfpLoadingBar', function ($scope, $http, adminServices, $timeout, cfpLoadingBar) {
	$("body").css("background","#eee");
	$('.dropdown').on('show.bs.dropdown', function(e){
		$(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
	});
	$('.dropdown').on('hide.bs.dropdown', function(e){
		$(this).find('.dropdown-menu').first().stop(true, true).slideUp(300);
	});

	$timeout(function(){
		angular.element(document.getElementById("left-nav-section")).scope().getUserRoles();
		angular.element('#userTab').triggerHandler('click');
		cfpLoadingBar.complete()
	}, 500)


	$("#userTab").on('click',function() {
		$("img.selectedIcon").removeClass("selectedIcon");
		$(this).children().find('img').addClass('selectedIcon');
		angular.element(document.getElementById("left-nav-section")).scope().getUserRoles();
	});

	$("#projectTab").on('click',function() {
		$("img.selectedIcon").removeClass("selectedIcon");
		$(this).children().find('img').addClass('selectedIcon');
		$timeout(function(){
			$('.scrollbar-inner').scrollbar();
			$('.scrollbar-macosx').scrollbar();
			toggleCycleClick();
		}, 10)
	adminServices.getDomains_ICE()
			.then(function (data) {
			if (data == "No Records Found") {
						var domainList = data;
						$('#selDomain').empty();
						$('#selDomain').append($("<option value=''  disabled selected>Please Select Your Domain</option>"));
						for (var i = 0; i < domainList.length; i++) {
							$('#selDomain').append($("<option value=" + domainList[i].DomainId + "></option>").text(domainList[i].DomainName));
						}
				} else {
						var domainList = data;
						$('#selDomain').empty();
						$('#selDomain').append($("<option value=''  disabled selected>Please Select Your Domain</option>"));
						for (var i = 0; i < domainList.length; i++) {
							$('#selDomain').append($("<option value=" + domainList[i].DomainId + "></option>").text(domainList[i].DomainName));
						}
					}
	}, function (error) { console.log("Error:::::::::::::", error) })

});

function toggleCycleClick()
	{
		    var releaseListLen = $("#releaseList li").length;
			var cyclesListLen = $("#cycleList li").length;
			var releaseSelectedLen = $("li.active").length;
			if(cyclesListLen == 0 && releaseListLen == 0)
			{
				$("#addCycle").addClass('disableAddCycle');
			}
			else if(releaseListLen == 0 || releaseSelectedLen == 0)
			{
				$("#addCycle").addClass('disableAddCycle');
			}
			else{
				$("#addCycle").removeClass('disableAddCycle');
			}
	}

	$("#preferencesTab").on('click',function() {
		$("img.selectedIcon").removeClass("selectedIcon");
		$(this).children().find('img').addClass('selectedIcon');
	});

	toggleMenu = function() {
		var elem = document.getElementById("sidebar-wrapper");
		left = window.getComputedStyle(elem,null).getPropertyValue("left");
		// hiding the sidebar
		if(left == "200px"){
			document.getElementsByClassName("sidebar-toggle")[0].style.left="-200px";
			$('#overlay').css('opacity', 0);
			setTimeout(function() {
				$('#overlay').remove();
			}, 300);
		}
		// showing the sidebar
		else if(left == "-200px"){
			document.getElementsByClassName("sidebar-toggle")[0].style.left="200px";
			// adding overlay to darken #page-wrapper and dismiss the left drawer...
			$overlay = $('<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0; left: 0; background: rgb(0, 0, 0); opacity: 0; transition: ease-in-out all .3s"></div>');
			$overlay.click(toggleMenu);            
			setTimeout(function() {
				$overlay.css('opacity', .1);
			}, 200);
			$('#page-wrapper').prepend($overlay);
		}
	}
	$("#menu-toggle").click(function(e) {
		e.preventDefault();
		toggleMenu();        
	});

	$("[data-parent]").click(function(e) {
		console.log('clicked');
		$parent = $($(this).attr('data-parent'));
		actives = $parent.find('.in:not(data-target)'.replace('data-target', $(this).attr('data-target')));
		actives.collapse('hide');
	});

	$scope.create_userCheck = function () {				//Yes-----------------------------------
		$scope.userNameRequired = '';
		$scope.passwordRequired = '';
		$scope.confirmPasswordRequired = '';
		$scope.firstNameRequired = '';
		$scope.lastNameRequired = '';
		$scope.emailRequired = '';
		$scope.roleRequired = '';
		$scope.loadIcon = '';
		$("#userName,#firstName,#lastName,#password,#confirmPassword,#email").removeClass("inputErrorBorder");
		$("#userRoles").removeClass("selectErrorBorder").css('border','1px solid #909090 !important');
		var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		//var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,16}$/;
		var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		if ($("#userName").val() == "") {
			$("#userName").addClass("inputErrorBorder");
		}
		else if ($("#firstName").val() == "") {
			$("#firstName").addClass("inputErrorBorder");
		} else if ($("#lastName").val() == "") {
			$("#lastName").addClass("inputErrorBorder");
		}
		else if ($("#password").val() == "") {
			$("#password").addClass("inputErrorBorder");
		} 
		else if (regexPassword.test($("#password").val()) == false) {
			$("#adminModal").find('.modal-title').text("Error");
			$("#adminModal").find('.modal-body p').text("Password must contain atleast 1 special character, 1 numeric, 1 uppercase, length should be minimum 8 character and maximum 12 character.");
			$("#adminModal").modal("show");
			$("#password").addClass("inputErrorBorder");
		}
		else if ($("#confirmPassword").val() == "") {
			$("#confirmPassword").addClass("inputErrorBorder");
		}
		else if (regexPassword.test($("#confirmPassword").val()) == false ) {
			$("#adminModal").find('.modal-title').text("Error");
			$("#adminModal").find('.modal-body p').text("Password must contain atleast 1 special character, 1 numeric, 1 uppercase, length should be minimum 8 character and maximum 12 character.");
			$("#adminModal").modal("show");
			$("#confirmPassword").addClass("inputErrorBorder");
		}
		else if($("#password").val() != $("#confirmPassword").val()){
			$("#adminModal").find('.modal-title').text("Error");
			$("#adminModal").find('.modal-body p').text("Password and Confirm Password did not match");
			$("#adminModal").modal("show");
			$("#confirmPassword").addClass("inputErrorBorder");
		}
		else if ($("#email").val() == "") {
			$("#email").addClass("inputErrorBorder");
		} 
		else if (reg.test($("#email").val()) == false) {
			$("#adminModal").find('.modal-title').text("Error");
			$("#adminModal").find('.modal-body p').text("Email address is not valid");
			$("#adminModal").modal("show");
			$("#email").addClass("inputErrorBorder");
			// $scope.emailRequired = 'Email address is not valid';
		} 
		else if($('#userRoles option:selected').val() == "") {
			$("#userRoles").css('border','').addClass("selectErrorBorder");
		} 
		else {
			//role = $('#userRoles option:selected').text();
			var createUser = {};
			createUser.role = $('#userRoles option:selected').val();
			createUser.username = $("#userName").val();
			createUser.password = $("#password").val();
			createUser.confirmPassword = $("#confirmPassword").val();
			createUser.firstName = $("#firstName").val();
			createUser.lastName =  $("#lastName").val();
			createUser.email =  $("#email").val();
			createUser.ldapUser = $('.ldapChkBox').is(':checked')

			adminServices.createUser_Nineteen68(createUser)
			.then(function (data) { 
				if (data == "Success") {
					$("#adminModal").find('.modal-title').text("Admin");
					$("#adminModal").find('.modal-body p').text("User created successfully");
					$("#adminModal").modal("show");
				}
				else if (data == "User Exists") {
					$("#adminModal").find('.modal-title').text("Admin");
					$("#adminModal").find('.modal-body p').text("User already Exists");
					$("#adminModal").modal("show");
				}
				else {
					$("#adminModal").find('.modal-title').text("Admin");
					$("#adminModal").find('.modal-body p').text("Failed to create user");
					$("#adminModal").modal("show");
				}
			}, function (error) { console.log("Error:::::::::::::", error) })
		}
	};
	
	//LDAP Functionality for Create User
	$(document).on("click", ".ldapBtn", function(){
		$(this).toggleClass("ldapBtnActive")
	})

	//Get User Roles in the select container
	$scope.getUserRoles = function () {	//Yes---------------------------------
		$("#passwordIcon").parent().show()
		adminServices.getUserRoles_Nineteen68()
		.then(function (response) {
			userRoleArrayList = response.userRoles;
			var getDropDown;
			// if (getTab == "create") {
			getDropDown = $('#userRoles');
			//  }
			//  else if (getTab == "edit") {
			//      getDropDown = $('#userRolesED');
			//  }
			getDropDown.empty();
			getDropDown.append('<option value=""selected>Select User Role</option>');
			for (var i = 0; i < userRoleArrayList.length; i++) {
				getDropDown.append($("<option value=" + response.r_ids[i] + "></option>").text(userRoleArrayList[i]));
			}
			window.localStorage['_R'] = response.r_ids;
		}, function (error) { console.log("Error:::::::::::::", error) })
	};

	// Create Project Action
	$scope.create_project = function () {		

		$("#selDomain").removeClass("selectErrorBorder");
		$("#projectName").removeClass("inputErrorBorder");

		if($('#selDomain option:selected').val() == "")
		{
			$("#selDomain").addClass("selectErrorBorder");
		}
		else if($("#projectName").val() == "")
		{
			$("#projectName").addClass("inputErrorBorder");
		}
		else if($(".projectTypeSelected").length == 0)
		{
			$("#adminModal").find('.modal-title').text("Admin");
			$("#adminModal").find('.modal-body p').text("Please select Application Type");
			$("#adminModal").modal("show");
		}
		else if($("#releaseList").children("li").length == 0)
		{
			$("#adminModal").find('.modal-title').text("Admin");
			$("#adminModal").find('.modal-body p').text("Please add atleast one release");
			$("#adminModal").modal("show");
		}
		else if($("#cycleList").children("li").length == 0)
		{
			$("#adminModal").find('.modal-title').text("Admin");
			$("#adminModal").find('.modal-body p').text("Please add atleast one cycle for a release");
			$("#adminModal").modal("show");
		}
		else{
			flag = false;
			projectExists = false;
			var requestedids = [];
			var idtype = [];
			if($('#selDomain option:selected').val() != "")
			{
					requestedids.push($('#selDomain option:selected').val());
					idtype.push('domainsall');
					adminServices.getNames_ICE(requestedids,idtype)
						.then(function (response) {
						console.log(response);
						for(var i=0;i<response.projectNames.length;i++)
						{
							if($("#projectName").val() == response.projectNames[i])
							{
								console.log($("#projectName").val());
								console.log(response.projectNames[i]);
								$("#adminModal").find('.modal-title').text("Admin");
								$("#adminModal").find('.modal-body p').text("Project Name already Exists");
								$("#adminModal").modal("show");
								 projectExists = true;
							}
						}
						
					}, function (error) { console.log("Error:::::::::::::", error) })
			}
				$("#releaseList li").each(function() {
					for(var i=0;i<projectDetails.length;i++)
					{
						if($(this).children('span.releaseName').text() == projectDetails[i].releaseName)
						{
							if(projectDetails[i].cycleNames.length == 0)
							{
								$("#adminModal").find('.modal-title').text("Admin");
								$("#adminModal").find('.modal-body p').text("Please add atleast one cycle for a release");
								$("#adminModal").modal("show");
								flag = true;
							}
						}
					}
				});
				if(projectExists == true || flag == true)
					{
						return false;
					}
				else{
						var userDetails = JSON.parse(window.localStorage['_UI']);
						createprojectObj.domainId =  $('#selDomain option:selected').val();
						createprojectObj.projectName = $.trim($("#projectName").val());
						createprojectObj.appType = $(".projectTypeSelected").attr('data-app');
						createprojectObj.projectDetails = projectDetails;
						adminServices.createProject_ICE(createprojectObj,userDetails)
							.then(function (response) {
							if(response == 'success')
							{
								$("#adminModal").find('.modal-title').text("Admin");
								$("#adminModal").find('.modal-body p').text("Project created successfully");
								$("#adminModal").modal("show");
								resetForm();
							}
							else{
								$("#adminModal").find('.modal-title').text("Admin");
								$("#adminModal").find('.modal-body p').text("Failed to create project");
								$("#adminModal").modal("show");
								resetForm();
							}
							}, function (error) { console.log("Error:::::::::::::", error) })
						}
				}
				
	};

	//Update Project Action
	$scope.update_project = function () {		
		$("#selDomainEdit,#selProject").removeClass("selectErrorBorder");
		if($('#selDomainEdit option:selected').val() == "")
		{
			$("#selDomainEdit").addClass("selectErrorBorder");
		}
		else if($('#selProject option:selected').val() == "")
		{
			$("#selProject").addClass("selectErrorBorder");
		}
		else if($(".projectTypeSelected").length == 0)
		{
			$("#adminModal").find('.modal-title').text("Admin");
			$("#adminModal").find('.modal-body p').text("Please select Application Type");
			$("#adminModal").modal("show");
		}
		else if($("#releaseList").children("li").length == 0)
		{
			$("#adminModal").find('.modal-title').text("Admin");
			$("#adminModal").find('.modal-body p').text("Please add atleast one release");
			$("#adminModal").modal("show");
		}
		else if($("#cycleList").children("li").length == 0)
		{
			$("#adminModal").find('.modal-title').text("Admin");
			$("#adminModal").find('.modal-body p').text("Please add atleast one cycle for a release");
			$("#adminModal").modal("show");
		}
		else{
				flag = false;
				$("#releaseList li").each(function() {
					for(var i=0;i<projectDetails.length;i++)
					{
						if($(this).children('span.releaseName').text() == projectDetails[i].releaseName)
						{
							if(projectDetails[i].cycleNames.length == 0)
							{
								$("#adminModal").find('.modal-title').text("Admin");
								$("#adminModal").find('.modal-body p').text("Please add atleast one cycle for a release");
								$("#adminModal").modal("show");
								flag = true;
							}
						}
					}
				});
				if(flag == true)
				{
					return false;
				}
				var userDetails = JSON.parse(window.localStorage['_UI']);
				updateProjectObj.domainId =  $('#selDomainEdit option:selected').val();
				updateProjectObj.projectName = $('#selProject option:selected').val();
				updateProjectObj.appType = $(".projectTypeSelected").attr('data-app');
				updateProjectObj.projectDetails = projectDetails;
				adminServices.updateProject_ICE(updateProjectObj,userDetails)
					.then(function (response) {
					 if(response == 'success')
					 {
						$("#adminModal").find('.modal-title').text("Admin");
						$("#adminModal").find('.modal-body p').text("Project updated successfully");
						$("#adminModal").modal("show");
						resetForm();
					 }
					 else{
						$("#adminModal").find('.modal-title').text("Admin");
						$("#adminModal").find('.modal-body p').text("Failed to update project");
						$("#adminModal").modal("show");
						resetForm();
					 }
					}, function (error) { console.log("Error:::::::::::::", error) })
		}
	};

	function resetForm()
	{
			$("#selDomain").prop('selectedIndex', 0);
			$("#projectName").val("");
			$("div.projectTypeSelected").removeClass("projectTypeSelected");
			$("#releaseList li, #cycleList li").remove();
	}
	
	//Add Release Name Functionality
	$(document).on("click", "#addRelease", function(){
		flag = false;
		$("#addReleaseNameModal").modal("show");
		$("#releaseTxt").removeClass("inputErrorBorder");
		$("#releaseTxt").focus();
		$('#addReleaseNameModal').on('shown.bs.modal', function () {
			$('#releaseTxt').focus();
		});
		$("#releaseTxt").val('');
		$("#addReleaseName").on('click',function(e) {
			e.preventDefault();
			if($("#releaseTxt").val() == "")
			{
				$("#releaseTxt").addClass('inputErrorBorder');
				return false;
			}
			else{
				$("#releaseTxt").removeClass('inputErrorBorder');
				$("#releaseList li").each(function() {
					if($(this).children('span.releaseName').text() == $("#releaseTxt").val())
					{
							$(".close:visible").trigger('click');
							$("#adminModal").find('.modal-title').text("Add Release");
							$("#adminModal").find('.modal-body p').text("Release Name already exists");
							$("#adminModal").modal("show");
							flag = true;
					}
				});
				if(flag == true)
				{
					return false;
				}
				releaseName = $("#releaseTxt").val();
				adminServices.checkReleaseNameExists_ICE(releaseName)
				.then(function (response) {
                   if(response == "Release Name Exists")
				   {
					    $(".close:visible").trigger('click');
					    $("#adminModal").find('.modal-title').text("Add Release");
						$("#adminModal").find('.modal-body p').text("Release Name already exists");
						$("#adminModal").modal("show");
				   }
				   else if(response == "Fail")
				   {
					    $(".close:visible").trigger('click');
					    $("#adminModal").find('.modal-title').text("Add Release");
						$("#adminModal").find('.modal-body p').text("Failed to add Release");
						$("#adminModal").modal("show");
				   }
				   else{
					   $(".close:visible").trigger('click');
				       $("#releaseList").append("<li id='releaseList_"+count+"'><img src='imgs/ic-release.png' /><span class='releaseName'>"+releaseName+"</span><span class='actionOnHover'><img id=editReleaseName_"+count+" title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_"+count+" title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
					    $("#releaseList li:last").trigger('click');
					   	releaseNamesArr.push(releaseName);
						releCycObj = {};
						releCycObj.releaseName = releaseName;
						projectDetails.push(releCycObj);
					    toggleCycleClick();
					    count++;
				   }
				}, function (error) { console.log("Error:::::::::::::", error) })
				e.stopImmediatePropagation();
			}
		})
			
	});

	$(document).on('click',"#releaseList li",function() {
			$("li.active").removeClass("active");
	        $(this).addClass("active");
		});

	//Add Cycle Name Functionality
	$(document).on("click","#addCycle", function(e){
		e.preventDefault();
		flag = false;
		$("#addCycleNameModal").modal("show");
		$("#cycleTxt").removeClass('inputErrorBorder');
		$('#addCycleNameModal').on('shown.bs.modal', function () {
			$('#cycleTxt').focus();
		});
		$("#cycleTxt").val('');
		$("#addCycleName").on('click',function(e) {
			e.preventDefault();
			$("#cycleName").removeClass("inputErrorBorder");
			if($("#cycleTxt").val() == "")
			{
				$("#cycleTxt").addClass('inputErrorBorder');
				return false;
			}
			else{
				
				$("#cycleList li:visible").each(function() {
					if($(this).children('span.cycleName').text() == $("#cycleTxt").val())
					{
							$(".close:visible").trigger('click');
							$("#adminModal").find('.modal-title').text("Add Cycle");
							$("#adminModal").find('.modal-body p').text("Cycle Name already exists for this release");
							$("#adminModal").modal("show");
							flag = true;
					}
				});
				if(flag == true)
				{
					return false;
				}
				$("#cycleTxt").removeClass('inputErrorBorder');
				cycleName = $("#cycleTxt").val();
				adminServices.checkCycleNameExists_ICE(cycleName)
				.then(function (response) {
                   if(response == "Cycle Name Exists")
				   {
					    $(".close:visible").trigger('click');
					    $("#adminModal").find('.modal-title').text("Add Cycle");
						$("#adminModal").find('.modal-body p').text("Cycle Name already exists");
						$("#adminModal").modal("show");
				   }
				  else if(response == "Fail")
				   {
					    $(".close:visible").trigger('click');
					    $("#adminModal").find('.modal-title').text("Add Release");
						$("#adminModal").find('.modal-body p').text("Failed to add Cycle");
						$("#adminModal").modal("show");
				   }
				   else{
					   	
					  	$(".close:visible").trigger('click');
					    $("#cycleList").append("<li><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+delCount+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+delCount+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
						    for(i=0;i<releaseNamesArr.length;i++)
							{
								console.log("selRelease", releaseNamesArr[i]);
								console.log("activeRel", $("li.active").children('span.releaseName').text());
								if(releaseNamesArr[i] == $("li.active").children('span.releaseName').text())
								{
									for(var j=0;j<projectDetails.length;j++)
									{
										if('releaseName' in projectDetails[j])
										{
											if(releaseNamesArr[i] == projectDetails[j].releaseName)
											{
												var cycleArr =[];
												//this line is for releases which already have at least 1 cycle
												if('cycleNames' in projectDetails[j])
												{
													cycleArr=projectDetails[j].cycleNames;
												}
												cycleArr.push(cycleName);
												projectDetails[j].cycleNames=cycleArr;
											}
										}
									}	
								}
							}
							// projectDetails.push(releCycObj);
					    	console.log("projectDetails", projectDetails);
							toggleCycleClick();
							delCount++;
				   }
				}, function (error) { console.log("Error:::::::::::::", error) })
				e.stopImmediatePropagation();
			}
		})
	})

		

		$(document).on('click',"[id^=releaseList]",function(e) {
			toggleCycleClick();
				var id = e.target.id;
				var releaseName = $("#"+id).children('span.releaseName').text();
				$("#cycleList li").remove();
				if(projectDetails.length > 0)
				{
					for(var i=0;i<projectDetails.length;i++)
						{
							
							if(projectDetails[i].releaseName == releaseName && 'cycleNames' in projectDetails[i])
							{
								for(var j=0;j<projectDetails[i].cycleNames.length;j++)
								{
									$("#cycleList").append("<li><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+projectDetails[i].cycleNames[j]+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
								}
							}
						}
				}
		});
	
	//Edit Release Name Functionality
	$(document).on("click", "[id^=editReleaseName_]", function(e){
		editReleaseId = e.target.id;
		if(e.target.id != "releaseName")
		{
				$("#editReleaseNameModal").modal("show");
				$("#releaseName").removeClass("inputErrorBorder");
				$('#editReleaseNameModal').on('shown.bs.modal', function () {
					$('#releaseName').focus();
				});
				var existingReleaseName = $(this).parents("li").children(".releaseName").text()
				releaseName = $("#releaseName").val(existingReleaseName);
				$("#updateReleaseName").on('click', function() {
					if($("#releaseName").val() == "")
					{
						$("#releaseName").addClass('inputErrorBorder');
						return false;
					}
					else{
						$("#releaseName").removeClass('inputErrorBorder');
						releaseName = $("#releaseName").val();
						adminServices.checkReleaseNameExists_ICE(releaseName)
						.then(function (response) {
						if(response == "Release Name Exists")
						{
								$(".close:visible").trigger('click');
								$("#adminModal").find('.modal-title').text("Add Release");
								$("#adminModal").find('.modal-body p').text("Release Name already exists");
								$("#adminModal").modal("show");
						}
						else if(response == "Fail")
						{
								$(".close:visible").trigger('click');
								$("#adminModal").find('.modal-title').text("Add Release");
								$("#adminModal").find('.modal-body p').text("Failed to add Release");
								$("#adminModal").modal("show");
						}
						else{
							$(".close:visible").trigger('click');
							$("#"+editReleaseId).parent().prev('span').text($("#releaseName").val());
						}
						}, function (error) { console.log("Error:::::::::::::", error) })
						e.stopImmediatePropagation();
					}
				})
		}
		
	})
	
	//Delete Release Functionality
	$(document).on("click","[id^=deleteReleaseName_]", function(e){
		$("#deleteReleaseModal").modal("show");
		deleteReleaseId = e.target.id;
		$("#deleteReleaseYes").on('click',function() {
			for(var i=0;i<projectDetails.length;i++)
			{
					if(projectDetails[i].releaseName == $("#"+deleteReleaseId).parent().prev('span.releaseName').text())
					{
						    delete projectDetails[i];
							projectDetails = projectDetails.filter(function(n){ return n != undefined });
					}
			}
			$("#"+deleteReleaseId).parent().parent("li").remove();
			$("#adminModal").find('.modal-title').text("Delete Release");
			$("#adminModal").find('.modal-body p').text("Release deleted successfully");
			$("#adminModal").modal("show");
			 toggleCycleClick();
			
		});
	})
	
	//Edit Cycle Name Functionality
	$(document).on("click", "[id^=editCycleName_]", function(e){
		editCycleId = e.target.id;
		if(e.target.id != "cycleName")
		{
			$("#editCycleNameModal").modal("show");
			$("#cycleName").removeClass("inputErrorBorder");
			$('#editCycleNameModal').on('shown.bs.modal', function () {
					$('#cycleName').focus();
			});
			var existingCycleName = $(this).parents("li").children(".cycleName").text()
			cycleName = $("#cycleName").val(existingCycleName)
			$("#updateCycleName").on('click', function() {
				if($("#cycleName").val() == "")
				{
					$("#cycleName").addClass('inputErrorBorder');
					return false;
				}
				else{
				$("#cycleTxt").removeClass('inputErrorBorder');
				cycleName = $("#cycleTxt").val();
				adminServices.checkCycleNameExists_ICE(cycleName)
				.then(function (response) {
                   if(response == "Cycle Name Exists")
				   {
					    $(".close:visible").trigger('click');
					    $("#adminModal").find('.modal-title').text("Add Cycle");
						$("#adminModal").find('.modal-body p').text("Cycle Name already exists");
						$("#adminModal").modal("show");
				   }
				  else if(response == "Fail")
				   {
					    $(".close:visible").trigger('click');
					    $("#adminModal").find('.modal-title').text("Add Release");
						$("#adminModal").find('.modal-body p').text("Failed to add Cycle");
						$("#adminModal").modal("show");
				   }
				   else{
					  	$(".close:visible").trigger('click');
					    $("#"+editCycleId).parent().prev('span').text($("#cycleName").val());
				   }
				}, function (error) { console.log("Error:::::::::::::", error) })
				e.stopImmediatePropagation();
			  }
			});

		}
	})
	
	//Delete Cycle Functionality
	$(document).on("click", "[id^=deleteCycleName_]", function(e){
		$("#deleteCycleModal").modal("show");
		deleteCycleId = e.target.id;
		$("#deleteCycleYes").on('click',function() {
			//console.log(projectDetails);
			for(var i=0;i<projectDetails.length;i++)
			{
				for(var j=0;j<projectDetails[i].cycleNames.length;j++)
				{
						if(projectDetails[i].cycleNames[j] == $("#"+deleteCycleId).parent().prev('span.cycleName').text())
						{
							 delete projectDetails[i].cycleNames[j];
							 projectDetails[i].cycleNames =  projectDetails[i].cycleNames.filter(function(n){ return n != null });
						}
				}
			}
			$("#"+deleteCycleId).parent().parent("li").remove();
			$("#adminModal").find('.modal-title').text("Delete Cycle");
			$("#adminModal").find('.modal-body p').text("Cycle deleted successfully");
			$("#adminModal").modal("show");
			 toggleCycleClick();
		})
		
	})

	
	
	//Load Users for Edit
	$scope.editUserTab = function(){
		$scope.tab = "editUser";
		adminServices.getAllUsers_Nineteen68()
		.then(function (response) {
			$("#userSelect").empty()
			$("#userSelect").append('<option data-id="" value disabled selected>Select User</option>')
			for(i=0; i<response.userIds.length && response.user_names.length; i++){
				$("#userSelect").append('<option data-id="'+response.userIds[i]+'" value="'+response.user_names[i]+'">'+response.user_names[i]+'</option>')
			}
		}, 
		function (error) { console.log("Error:::::::::::::", error) })
	};

	//Load Projects for Edit
	$scope.editProjectTab = function(){
		$scope.tab = "editProject";
		adminServices.getDomains_ICE()
			.then(function (data) {
					if (data == "No Records Found") {
								var domainList = data;
								$('#selDomainEdit').empty();
								$('#selDomainEdit').append($("<option value=''  disabled selected>Please Select Your Domain</option>"));
								for (var i = 0; i < domainList.length; i++) {
									$('#selDomainEdit').append($("<option value=" + domainList[i].DomainId + "></option>").text(domainList[i].DomainName));
								}
						} else {
								var domainList = data;
								$('#selDomainEdit').empty();
								$('#selDomainEdit').append($("<option value=''  disabled selected>Please Select Your Domain</option>"));
								for (var i = 0; i < domainList.length; i++) {
									$('#selDomainEdit').append($("<option value=" + domainList[i].DomainId + "></option>").text(domainList[i].DomainName));
								}
							}
			}, function (error) { console.log("Error:::::::::::::", error) })

			$(document).on('change','#selDomainEdit', function() {
					//get Projects Service
					console.log("selDomainEdit");
			});
		
	};


	
	//Get Selected User Data
	$scope.getUserData = function(){
		var userId = $("#userSelect option:selected").data("id");
		var userName = $("#userSelect option:selected").val();
		adminServices.getUsersInfo(userId, userName)
		.then(function (response) {
			$("#firstName").val(response.firstName);
			$("#lastName").val(response.lastName);
			$("#email").val(response.emailId);
			var roleId = response.roleId;
				adminServices.getUserRoles_Nineteen68()
				.then(function (response) {
					$("#userRoles").empty().append('<option value disabled>Select User Role</option>')
					for(i=0; i<response.r_ids.length && response.userRoles.length; i++){
						if(roleId == response.r_ids[i]){
							$("#userRoles").append('<option selected value="'+response.r_ids[i]+'">'+response.userRoles[i]+'</option>')
						}
						else{
							$("#userRoles").append('<option value="'+response.r_ids[i]+'">'+response.userRoles[i]+'</option>')
						}
					}
				}, 
				function (error) { console.log("Error:::::::::::::", error) })
		}, 
		function (error) { console.log("Error:::::::::::::", error) })
	};
	
	//Update Edit User
	$scope.updateUser = function(){
		var updateUserObj = {};
		updateUserObj.userName = $("#userSelect option:selected").text();
		updateUserObj.passWord = $("#password").val();
		updateUserObj.firstName = $("#firstName").val();
		updateUserObj.lastName = $("#lastName").val();
		updateUserObj.role = $("#userRoles option:selected").val();
		updateUserObj.email = $("#email").val();
		updateUserObj.userId = $("#userSelect option:selected").data("id");
		adminServices.updateUser_nineteen68(updateUserObj)
		.then(function (response) {
			if(response == "success"){
				$("#editUserSuccessModal").modal("show");
			}
			else{
				$("#editUserFailModal").modal("show");
			}
		}, 
		function (error) { console.log("Error:::::::::::::", error) })
	};
	
	//AppTypeSelect Functionality
	$(document).on("click", ".projectTypes", function(){
		$(this).toggleClass("projectTypeSelected");
		$(this).siblings().removeClass("projectTypeSelected")
	});
	
	//Edit Release Name Functionality
	$(document).on("click", ".editReleaseName", function(){
		$("#editReleaseNameModal").modal("show");
		var existingReleaseName = $(this).parents("li").children(".releaseName").text()
		$("#releaseName").val(existingReleaseName)
	});
	
	//Delete Release Functionality
	$(document).on("click", ".deleteRelease", function(){
		$("#deleteReleaseModal").modal("show")
	});
	
	//Edit Cycle Name Functionality
	$(document).on("click", ".editCycleName", function(){
		$("#editCycleNameModal").modal("show");
		var existingCycleName = $(this).parents("li").children(".cycleName").text()
		$("#cycleName").val(existingCycleName)
	});
	
	//Delete Release Functionality
	$(document).on("click", ".deleteCycle", function(){
		$("#deleteCycleModal").modal("show")
	});
}]);

