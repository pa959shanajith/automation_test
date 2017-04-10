/***
 * 
 */
var DOMAINID, releaseName, cycleName, count=0,delCount=0,editReleaseId='',editCycleId='',deleteReleaseId='',deleteCycleId='',taskName;releaseNamesArr =[];
var createprojectObj = {}; var projectDetails = [];var releCycObj;var flag;var projectExists;var updateProjectDetails = []; 
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
		projectDetails = [];
		updateProjectDetails = [];
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
		//console.log('clicked');
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
								if(flag == true)
								{
									return false;
								}
							}
						}
					}
				});
			
			if($('#selDomain option:selected').val() != "")
			{
					requestedids.push($('#selDomain option:selected').val());
					idtype.push('domainsall');
					adminServices.getNames_ICE(requestedids,idtype)
						.then(function (response) {
						if(response.projectNames.length > 0)
						{
								for(var i=0;i<response.projectNames.length;i++)
									{
										if($("#projectName").val() == response.projectNames[i])
										{
											//console.log($("#projectName").val());
											//console.log(response.projectNames[i]);
											$("#adminModal").find('.modal-title').text("Admin");
											$("#adminModal").find('.modal-body p').text("Project Name already Exists");
											$("#adminModal").modal("show");
											projectExists = true;
											return false;
										}
										
									}
						}
						else{
										$("#adminModal").find('.modal-title').text("Admin");
										$("#adminModal").find('.modal-body p').text("Failed to create project");
										$("#adminModal").modal("show");
										return false;
						     }
				
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
					for(var i=0;i<updateProjectDetails.length;i++)
					{
						if($(this).children('span.releaseName').text() == updateProjectDetails[i].releaseName)
						{
							if(updateProjectDetails[i].cycleDetails.length == 0)
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
				else{
					 // console.log("updateProjectDetaills", updateProjectDetails);
					  var releaseCycleDetails = [];

					 releaseCycleDetails = updateProjectDetails.slice();
					  for(var k=0;k<releaseCycleDetails.length;k++)
					  {
						
						  for(var l=0;l<releaseCycleDetails[k].cycleDetails.length;l++)
						  {
							  var objectType = typeof(releaseCycleDetails[k].cycleDetails[l]);
							  if(objectType == "object")
							  {
								  delete releaseCycleDetails[k].cycleDetails[l].cycleId;
								  releaseCycleDetails[k].cycleDetails[l] = releaseCycleDetails[k].cycleDetails[l].cycleName;
							  }
						  }
						    delete releaseCycleDetails[k].releaseId;
					  }
					 releaseCycleDetails = releaseCycleDetails.filter(function(n){ return n != undefined });

					 updateProjectObj = {};
					 var userDetails = JSON.parse(window.localStorage['_UI']);
					 updateProjectObj.projectId = $('#selProject option:selected').val();
					 updateProjectObj.projectName =  $('#selProject option:selected').text();
					 updateProjectObj.appType = $(".projectTypeSelected").attr('data-app');
					 updateProjectObj.updateProjectDetails = releaseCycleDetails;

					 adminServices.updateProject_ICE(updateProjectObj, userDetails)
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
					   taskName = $("#page-taskName").children("span").text();
					    $(".close:visible").trigger('click');
					   if(taskName == "Create Project")
					   {
							$("#releaseList").append("<li id='releaseList_"+count+"'><img src='imgs/ic-release.png' /><span class='releaseName'>"+releaseName+"</span><span class='actionOnHover'><img id=editReleaseName_"+count+" title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_"+count+" title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
							$("#releaseList li:last").trigger('click');
							releaseNamesArr.push(releaseName);
							releCycObj = {};
							releCycObj.releaseName = releaseName;
							projectDetails.push(releCycObj);
							toggleCycleClick();
							count++;
					   }
					   if(taskName == "Update Project")
					   {
						   count = updateProjectDetails.length * 2;
						   $("#releaseList").append("<li class='createRelease' id='releaseList_"+count+"'><img src='imgs/ic-release.png' /><span class='releaseName'>"+releaseName+"</span><span class='actionOnHover'><img id=editReleaseName_"+count+" title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_"+count+" title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
						   releCycObj = {};
						   releCycObj.releaseName = releaseName;
						   releCycObj.releaseId = "";
						   releCycObj.cycleDetails = [];
						   updateProjectDetails.push(releCycObj);
						   toggleCycleClick();
						   $("#releaseList li#releaseList_"+count+"").trigger('click');
						   count++;
					   }
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

	$(document).on('click',"#cycleList li",function() {
		$("li.cycleList").removeClass("cycleList");
		$(this).addClass("cycleList");
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
						$("#cycleList li.cycleList").removeClass("cycleList");
						 taskName = $("#page-taskName").children("span").text();
						 if(taskName == "Create Project")
						 {
						    $("#cycleList").append("<li class='cycleList createCycle'><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+delCount+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+delCount+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							for(i=0;i<releaseNamesArr.length;i++)
							{
								//console.log("selRelease", releaseNamesArr[i]);
								//console.log("activeRel", $("li.active").children('span.releaseName').text());
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
							toggleCycleClick();
							delCount++;
						 }

						if(taskName == "Update Project")
						{  
							delCount = (delCount +1) * 3;
							$("#cycleList").append("<li class='cycleList createCycle'><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+delCount+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+delCount+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							for(var i=0;i<updateProjectDetails.length;i++)
							{
								if(updateProjectDetails[i].releaseName == $("li.active").children('span.releaseName').text())
								{
									if('releaseName' in updateProjectDetails[i])
										{
											    
												var cycleArr =[];
												//this line is for releases which already have at least 1 cycle
												if('cycleDetails' in updateProjectDetails[i])
												{
													cycleArr=updateProjectDetails[i].cycleDetails;
												}
												cycleArr.push(cycleName);
												updateProjectDetails[i].cycleDetails = cycleArr;
										}
								}
							}
							toggleCycleClick();
							delCount++;
						}
						    
				   }
				}, function (error) { console.log("Error:::::::::::::", error) })
				e.stopImmediatePropagation();
			}
		})
	})

		

		$(document).on('click','[id^=releaseList]',function(e) {
			if ($("#releaseList li").length == 0)
			{
				$("#cycleList li").remove();
				updateProjectDetails = [];
			}
			toggleCycleClick();
			showHideEditDeleteIcons();
			var id = e.target.id;
			id = "#".concat(e.target.id);
			taskName = $("#page-taskName").children("span").text();
			if(taskName == "Create Project")
			{
					if(id.indexOf("edit") != 0 )
						{
							if(id.indexOf("delete") != 0)
							{
								var releaseName = $("li.active").children('span.releaseName').text();
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
							}
						}
			}

			if(taskName == "Update Project")
			{
				if(id.indexOf("edit") != 1)
						{
							if(id.indexOf("delete") != 1 )
							{
								var releaseName = $("li.active").children('span.releaseName').text();
								$("#cycleList li").remove();
								if(updateProjectDetails.length > 0)
								{
									for(var i=0;i<updateProjectDetails.length;i++)
										{
											if(updateProjectDetails[i].releaseName == releaseName && 'cycleDetails' in updateProjectDetails[i])
											{
												for(var j=0;j<updateProjectDetails[i].cycleDetails.length;j++)
												{
													var objectType = typeof(updateProjectDetails[i].cycleDetails[j]);
													if(objectType == "object")
													{
															$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+updateProjectDetails[i].cycleDetails[j].cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
													}
													if(objectType == "string")
													{
															$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+updateProjectDetails[i].cycleDetails[j]+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
													}
													// if($("li.active").hasClass("updateRelease"))
													// {
													// 	$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+updateProjectDetails[i].cycleDetails[j].cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
													// }
													// else{
													// 	$("#cycleList").append("<li class='createCycle'><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+updateProjectDetails[i].cycleDetails[j].cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
													// }
												}
											}
										}
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
				$("#updateReleaseName").on('click', function(event) {
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
							
							taskName = $("#page-taskName").children("span").text();
							if(taskName == "Create Project")
							{
								$(".close:visible").trigger('click');
								var index = '';
							    index = $('li.active').index();
								$("#"+editReleaseId).parent().prev('span').text($("#releaseName").val());
								//console.log("projectDetails", projectDetails);
								for(var i=0;i<projectDetails.length;i++)
								{
									if(i == index)
									{
										projectDetails[i].releaseName = $("#releaseName").val();
									}
								}
							}
							if(taskName == "Update Project")
							{
								$(".close:visible").trigger('click');
								var index = '';
							    index = $('li.active').index();
								var oldRelText = $("#"+editReleaseId).parent().prev('span').text();
								$("#"+editReleaseId).parent().prev('span').text($("#releaseName").val());
								var newReleaseTxt = $("li.active").children("span.releaseName").text();
								for(var i=0;i<updateProjectDetails.length;i++)
								{
									if(i == index)
									{
										updateProjectDetails[i].releaseName = $("#releaseName").val();
									}
								}
							}
						}
						 event.stopImmediatePropagation();
						 $("#"+ event.target.id).unbind('click');
						}, function (error) { console.log("Error:::::::::::::", error) })
						e.stopImmediatePropagation();
					}
				})
		}
		
	});
	
	//Delete Release Functionality
	$(document).on("click","[id^=deleteReleaseName_]", function(e){
		$("#deleteReleaseModal").modal("show");
		deleteReleaseId = e.target.id;
		
		$("#deleteReleaseYes").on('click',function(event) {
			taskName = $("#page-taskName").children("span").text();
			if(taskName == "Create Project")
			{
						for(var i=0;i<projectDetails.length;i++)
						{
								if(projectDetails[i].releaseName == $("#"+deleteReleaseId).parent().prev('span.releaseName').text())
								{
									if('cycleNames' in projectDetails[i])
									{
										for (var j=0;j<projectDetails[i].cycleNames.length;j++)
											{
												$("#cycleList li").each(function() {
												
													if(projectDetails[i].cycleNames[j] == $(this).children("span.cycleName").text())
													{
															$(this).remove();
													}
												})
												
											}
									}
										delete projectDetails[i];
										projectDetails = projectDetails.filter(function(n){ return n != undefined });
								}
						}
			}
			if(taskName == "Update Project")
			{
				for(var i=0;i<updateProjectDetails.length;i++)
						{
								if(updateProjectDetails[i].releaseName == $("#"+deleteReleaseId).parent().prev('span.releaseName').text())
								{
										delete updateProjectDetails[i];
										$("#cycleList li").remove();
										updateProjectDetails = updateProjectDetails.filter(function(n){ return n != undefined });
								}
						}
			}
			$("#"+deleteReleaseId).parent().parent("li").remove();
			$("#releaseList li:last").trigger('click');
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
			$("#updateCycleName").on('click', function(event) {
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
						taskName = $("#page-taskName").children("span").text();
						if(taskName == "Create Project")
						{
								 $("#"+editCycleId).parent().prev('span').text($("#cycleName").val());
								 var cycleIndex = '';
											cycleIndex = $('li.cycleList').index();
									for(var i=0;i<projectDetails.length;i++)
									{
										if(projectDetails[i].releaseName == $("li.active").children('span.releaseName').text())
										{
											for(var j=0;j<projectDetails[i].cycleNames.length;j++)
											{
												if(j == cycleIndex)
												{
													projectDetails[i].cycleNames[j] = $("#cycleName").val();
												}
											}
										}
									}
						}

						if(taskName == "Update Project")
						{
							//var oldCycText = $("#"+editCycleId).parent().prev('span').text();
							 $("#"+editCycleId).parent().prev('span').text($("#cycleName").val());
								 var cycleIndex = '';
								 cycleIndex = $('li.cycleList').index();
									for(var i=0;i<updateProjectDetails.length;i++)
									{
										if(updateProjectDetails[i].releaseName == $("li.active").children('span.releaseName').text())
										{
											for(var j=0;j<updateProjectDetails[i].cycleDetails.length;j++)
											{
												var objectType = typeof(updateProjectDetails[i].cycleDetails[j]);
													if(objectType == "object" && j == cycleIndex && (updateProjectDetails[i].releaseName == $("li.active").children('span.releaseName').text()))
													{
															//console.log("objectType", typeof(updateProjectDetails[i].cycleDetails[j]))
															updateProjectDetails[i].cycleDetails[j].cycleName = $("#cycleName").val();
													}
												    if(objectType == "string" && j == cycleIndex){
																//console.log("objectString");
																//console.log("objectType", typeof(updateProjectDetails[i].cycleDetails[j]))
																updateProjectDetails[i].cycleDetails[j] =  $("#cycleName").val();
													}
											}
										}
									
									}
								
						}
						event.stopImmediatePropagation();
						$("#"+event.target.id).unbind('click');
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
			taskName = $("#page-taskName").children("span").text();
			if(taskName == "Create Project")
			{
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
			}
			if(taskName == "Update Project")
			{
				for(var i=0;i<updateProjectDetails.length;i++)
					{
					if(updateProjectDetails[i].releaseName == $("li.active").children("span.releaseName").text())
						{
						for(var j=0;j<updateProjectDetails[i].cycleDetails.length;j++)
						{
								var objectType = typeof(updateProjectDetails[i].cycleDetails[j]);
								if( objectType == 'object')
								{
									if(updateProjectDetails[i].cycleDetails[j].cycleName == $("#"+deleteCycleId).parent().prev('span.cycleName').text())
									{
										delete updateProjectDetails[i].cycleDetails[j];
										updateProjectDetails[i].cycleDetails =  updateProjectDetails[i].cycleDetails.filter(function(n){ return n != null });
									}
								}
								if(objectType == 'string')
								{
									if(updateProjectDetails[i].cycleDetails[j] == $("#"+deleteCycleId).parent().prev('span.cycleName').text())
									{
									delete updateProjectDetails[i].cycleDetails[j];
									updateProjectDetails[i].cycleDetails =  updateProjectDetails[i].cycleDetails.filter(function(n){ return n != null });
									}
								}
							}
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
		projectDetails = [];
		updateProjectDetails = [];
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
					var domainId = $("#selDomainEdit option:selected").val();
					var requestedids = ["e1cb0da2-44b8-4f8a-9ba8-8a290174881f"];
					var domains = [];
					domains.push(domainId);
					//console.log("Domain", domains);
					//var requestedids = domains.push(domainId);
    				var idtype=["domaindetails"];
					adminServices.getDetails_ICE(idtype,requestedids)
						.then(function (response) {
							if(response.projectNames.length > 0)
							{
								$('#selProject').empty();
								$('#selProject').append($("<option value=''  disabled selected>Please Select Your Project</option>"));
								for (var i = 0; i < response.projectNames.length; i++) {
									$('#selProject').append($("<option value=" + response.projectIds[i] + "></option>").text(response.projectNames[i]));
								}

							}
							else{
								$('#selProject').empty();
								$('#selProject').append($("<option value=''  disabled selected>Please Select Your Project</option>"));
								for (var i = 0; i < response.projectNames.length; i++) {
									$('#selProject').append($("<option value=" + response.projectIds[i] + "></option>").text(response.projectNames[i]));
								}
							}
						}, function (error) { console.log("Error:::::::::::::", error) })
					// console.log("selDomainEdit");
			});

			$(document).on('change','#selProject', function() {
					var domaiprojectId = $("#selProject option:selected").val();
					var projects = [];
					var requestedids=["f9409e26-cb50-489b-9527-623ce9f23672"];
    				var idtype=["projectsdetails"];
					projects.push(domaiprojectId);
					//console.log("projects", projects);
					adminServices.getDetails_ICE(idtype,requestedids)
						.then(function (response) {
							//console.log("resposne", response);
							$("div.projectTypes").addClass("disableProjectType");
								switch (response.appType)
								{
								case "Web":
									$("div.projectTypeSelected").removeClass("projectTypeSelected");
									$(".projectTypes[data-app='Web']").addClass("projectTypeSelected");
									break;
								case "Webservice":
									$("div.projectTypeSelected").removeClass("projectTypeSelected");
									$(".projectTypes[data-app='Webservice']").addClass("projectTypeSelected");
									break;
								case "Mainframe": 
									$("div.projectTypeSelected").removeClass("projectTypeSelected");
									$(".projectTypes[data-app='Mainframe']").addClass("projectTypeSelected");
									break;
								case "Desktop": 
									$("div.projectTypeSelected").removeClass("projectTypeSelected");
									$(".projectTypes[data-app='Desktop']").addClass("projectTypeSelected");
									break;
								case "DesktopJava": 
									$("div.projectTypeSelected").removeClass("projectTypeSelected");
									$(".projectTypes[data-app='DesktopJava']").addClass("projectTypeSelected");
									break;
								case "Mobility": 
									$("div.projectTypeSelected").removeClass("projectTypeSelected");
									$(".projectTypes[data-app='Mobility']").addClass("projectTypeSelected");
									break;
								case "mobilityweb": 
									$("div.projectTypeSelected").removeClass("projectTypeSelected");
									$(".projectTypes[data-app='mobilityweb']").addClass("projectTypeSelected");
									break;
								case "Sap": 
									$("div.projectTypeSelected").removeClass("projectTypeSelected");
									$(".projectTypes[data-app='Sap']").addClass("projectTypeSelected");
									break;
								default: 
							}
						  updateProjectDetails = [];
						  updateProjectDetails =  response.projectDetails;
						  $("#releaseList li,#cycleList li").remove()
						  for(var i=0;i<updateProjectDetails.length;i++)
						  {
							 $("#releaseList").append("<li class='updateRelease' id='releaseList_"+i+"'><img src='imgs/ic-release.png' /><span class='releaseName'>"+updateProjectDetails[i].releaseName+"</span><span class='actionOnHover'><img id=editReleaseName_"+i+" title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_"+i+" title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
							 $("#releaseList li:first").trigger('click');
						  }
						 showHideEditDeleteIcons();
						}, function (error) { console.log("Error:::::::::::::", error) })
			});
		
	};
			//Toggle Release Edit Delete Icons 
			function showHideEditDeleteIcons()
			{
				$("#releaseList li").each(function() {
											if ($(this).hasClass("active"))
											{
												$(this).children("span.actionOnHover").children("img").show();
											}
											else{
												$(this).children("span.actionOnHover").children("img").hide();
											}
									});
			}

	
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

