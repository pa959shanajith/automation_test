var domainname, DOMAINID, releaseName, cycleName, count=0,delCount=0,editReleaseId='',editCycleId='',deleteReleaseId='',deleteRelid,deleteCycleId='',deleteCycId,taskName,unAssignedFlag=false;var releaseNamesArr =[];
var createprojectObj = {}; var projectDetails = [];var flag;var projectExists;var updateProjectDetails = [];
var editedProjectDetails = [];
var deletedProjectDetails = [];
var newProjectDetails = [];
var isIE = /*@cc_on!@*/ false || !!document.documentMode;
var unAssignedProjects = []; var assignedProjects = [];var projectData =[];var valid = "";var getAssignedProjectsLen=0;
mySPA.controller('adminController', ['$scope', '$rootScope', '$http', '$location', 'adminServices','$timeout','cfpLoadingBar', function ($scope, $rootScope, $http, $location, adminServices, $timeout, cfpLoadingBar) {
	$("body").css("background","#eee");
	$("head").append('<link id="mindmapCSS1" rel="stylesheet" type="text/css" href="css/css_mindmap/style.css" />');
	localStorage.setItem("navigateEnable", false);
	$scope.ldapConf = {};
	$scope.samlConf = {};
	$scope.oidcConf = {};
	$scope.mailConf = {};
	$scope.userConf = {};
	$scope.domainConf = {};
	$scope.moveItems = {};
	$scope.assignProj = {};
	$scope.createIcePool = {};
	$scope.allocateIcePool = {};
	$scope.preferences = {};
	$scope.sessionConf = {};
	$scope.tokens = {};
	$scope.provision = {};
	$scope.tokeninfo={};

	$('.dropdown').on('show.bs.dropdown', function (e) {
		$(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
	});
	
	$('.dropdown').on('hide.bs.dropdown', function (e) {
		$(this).find('.dropdown-menu').first().stop(true, true).slideUp(300);
	});

	$timeout(function(){
		angular.element('#userTab').triggerHandler('click');
		cfpLoadingBar.complete();
		$('.scrollbar-macosx').scrollbar();
	}, 300);

	$(document).on('change', '#selDomains', function (e) {
		domainname = $("#selDomains").val();
		// $("#selAssignProject").val(domainname);
		$scope.assignProj.allProjectAP = [];
		$scope.assignProj.assignedProjectAP = [];
		//var domainId = data[0].domainId;
		//var requestedids = domainId;
		//var domains = [];
		var requestedids = [];
		requestedids.push(domainname);
		//console.log("Domain", domains);
		//var requestedids = domains.push(domainId);
		var idtype = ["domaindetails"];
		var userId = $("#selAssignUser option:selected").attr("data-id");
		var getAssignProj = {};
		getAssignProj.domainname = domainname;
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
					$scope.assignProj.assignedProjectAP.push({'projectid':data1[i]._id,'projectname':data1[i].name});
				}
				$scope.assignedProjectInitial = $scope.assignProj.assignedProjectAP;
				for (var j = 0; j < projectData.length; j++) {
					assignedProjectsArr.push(projectData[j]._id);
					assignedProjectNames.push(projectData[j].name);
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
	});
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
				$("#selDomains").empty()
				$("#selDomains").append('<option> Select Domain </option>')
				for (var i=0;i<data.length;i++){
					$("#selDomains").append('<option value="'+data[i]+'">'+data[i]+'</option>')
				}
				
			}
		});
	});

	const populatePool = () => new Promise ((res) => {
		var data = {
			poolid:"all",
			projectids:[]
		}
		adminServices.getPools(data)
		.then(function(data){
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "fail") {
				openModalPopup("Edit User", "Failed to fetch users.");
			} else if(data == "empty") {
				openModalPopup("Edit User", "There are no users created yet.");
			} else {
				var e = Object.entries(data)
				e.sort((a,b) => a[1].poolname.localeCompare(b[1].poolname))
				res({data:e})
			}
			unblockUI();
			res([]);
		}, function (error) {
			unblockUI();
			console.error(error)
			openModalPopup("Edit User", "Failed to fetch users.");
			res([]);
		});
	})

	const populateICEList = () => new Promise ((res) => {
		var id = $scope.allocateIcePool.selectedIcePool._id
		adminServices.getICEinPools({poolid:[id]})//temp
		.then(function(data){
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "fail") {
				openModalPopup("Edit User", "Failed to fetch users.");
			} else if(data == "empty") {
				openModalPopup("Edit User", "There are no users created yet.");
			} else {
				var e = Object.entries(data)
				e.sort((a,b) => a[1].icename.localeCompare(b[1].icename))
				res({data:e,dict:data})
			}
			unblockUI();
			res([]);
		}, function (error) {
			unblockUI();
			console.error(error)
			openModalPopup("Edit User", "Failed to fetch users.");
			res([]);
		});
	})
	
	const createIcePoolReset = () =>{
		$scope.tokens.name=undefined
		$scope.createIcePool.poolName = ""
		$('#assignedProjectAP option').appendTo($('#allProjectAP'))
		$('select#allProjectAP').val([])
		$('#tokenName').val('')
		$('#tokenName').removeClass('error-border')
	}

	$scope.clearQueue = () =>{
		if($scope.createIcePool.selectedIcePool && $scope.createIcePool.selectedIcePool.poolname){
			openDeleteGlobalModal("Clear Queue", "clearQueue", `Are you sure you want to clear queue of the ICE pool : ${$scope.createIcePool.selectedIcePool.poolname} ? \nAll the jobs queued in this pool will be cancelled.`);
		}else{
			openDeleteGlobalModal("Clear Queue", "clearQueue", `Are you sure you want to clear all the queues ? \nAll the jobs queued in every pool will be cancelled.`);
		}
	}
	$(document).on('click','#clearQueue', function(e) {
		blockUI('Clearing Queue ...')
		var poolids = []
		var type = "any";
		if($scope.createIcePool.selectedIcePool && $scope.createIcePool.selectedIcePool._id){
			poolids.push($scope.createIcePool.selectedIcePool._id)
		}else{
			type = "all"	
		}
		var input = {"poolids":poolids,"type":type}
		adminServices.clearQueue(input)
		.then((data)=>{
			if (data == "success") {
				openModalPopup("Success", "Cleared queue successfully.");
			} else if(data == "Invalid Session") {
				$rootScope.redirectPage();
			}else {
				openModalPopup("ICE Pool", "Failed to clear queue");
			}
			unblockUI()
		},(error)=>{
			openModalPopup("ICE Pool", "Failed to clear queue");
			console.log("Error:::::::::::::", error);
			unblockUI()
		})
	})

	$scope.EditIcePoolReset = () =>{
		$('#update-icepool-rename').addClass("hide")
		$('#assignedProjectAP option').remove()
		$("#allProjectAP option").remove()
		$('select#allProjectAP').val([])
		$scope.createIcePool.allProjectList.forEach((e)=>{
			$("#allProjectAP").append('<option value='+e._id+'>'+e.name+'</option>');
		})
		$scope.createIcePool.allIcePoolListFilter=''
		$scope.createIcePool.selectedIcePool = undefined
	}

	// on click of create ice pool from action bar
	$scope.createIcePool.click = () =>{
		createIcePoolReset()
		$(".selectedIcon").removeClass("selectedIcon");
		$("#createIcePool").find("img").addClass("selectedIcon");
		blockUI('Fetching Projects ...')
		var requestedids = ["all"];
		var idtype = ["all"];
		adminServices.getDetails_ICE(idtype, requestedids)
		.then((data)=>{
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "fail") {
				openModalPopup("Create ICE Pool", "Failed to fetch projects.");
			} else if(data == "empty") {
				openModalPopup("Create ICE Pool", "There are no projects created yet.");
			} else {
				var arr = Object.keys(data).map((id)=>{return data[id]})
				arr.sort((a,b) => a.name.localeCompare(b.name));
				$scope.createIcePool.allProjectList = arr
			}
			unblockUI()
		},(error)=>{
			openModalPopup("Create ICE Pool", "Failed to fetch projects.");
			console.log("Error:::::::::::::", error);
			unblockUI()
		})
	}
	
	$scope.createIcePool.changeName = (val) =>{
		if($('#tokenName').val()==''){
			$('#tokenName').addClass('error-border')
		}else{
			$('#tokenName').removeClass('error-border')
		}
		$scope.createIcePool.poolName = val
	} 

	$scope.createIcePool.saveClick = () =>{
		var projList = [];
		$("#assignedProjectAP option").each(function () {
			projList.push($(this).val())
		});
		var data = {
			poolname: $scope.createIcePool.poolName,
			projectids: projList
		}
		blockUI('Saving ICE Pool ...')
		adminServices.createPool_ICE(data)
		.then((data)=>{
			if (data == "success") {
				createIcePoolReset()
				openModalPopup("Success", "ICE Pool created successfully.");
			} else if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data  == 'Pool exists') {
				$('#tokenName').addClass('error-border')
				openModalPopup("Error", "Pool name already exist");
			} else {
				openModalPopup("Create ICE Pool", "There are no projects created yet.");
			}
			unblockUI()
		},(error)=>{
			openModalPopup("ICE Pool", "Failed to create ICE Pool");
			console.log("Error:::::::::::::", error);
			unblockUI()
		})
	}

	$scope.createIcePool.selectIcePool = (pool) =>{
		$scope.createIcePool.selectedIcePool=pool[1]
		$("#update-icepool-rename").find('input').val(pool[1].poolname)
		$("#update-icepool-rename").removeClass("hide");
		var a=[]
		if(pool[1].projectids){
			$scope.createIcePool.allProjectList.forEach((e)=>{
				if(pool[1].projectids.indexOf(e._id)!=-1){
					a.push(e)
					$("#allProjectAP option[value='"+e._id+"']").remove()
				}
			})
		}
		$scope.createIcePool.selectedIcePool=pool[1]
		$scope.createIcePool.selectedIcePool.projectList = a;
	}

	// on click of edit ice pool button
	$scope.editICEPool = async() => {
		$scope.EditIcePoolReset()
		$scope.tab = "tabIcePoolEdit";
		blockUI("Fetching ICE Pools...");
		var res = await populatePool()
		$scope.createIcePool.allIcePoolList = res.data
		unblockUI();
	}

	$scope.createIcePool.updateIcePool = () =>{
		var pool = $scope.createIcePool.selectedIcePool
		pool.projectids=[]
		pool.ice_added=[]
		pool.ice_deleted=[]
		pool.poolname=$('#tokenName').val()
		if(!pool.poolname || pool.poolname == ""){
			$('#tokenName').addClass('error-border')
			return;
		}
		$('#assignedProjectAP option').each((i,e)=>{pool.projectids.push(e.value)})
		blockUI('Saving ICE Pool ...')
		adminServices.updatePool(pool)
		.then((data)=>{
			if (data == "success") {
				$scope.EditIcePoolReset()
				populatePool().then((res)=>{
				$scope.createIcePool.allIcePoolList = res.data
				})
				openModalPopup("Success", "ICE Pool updated successfully.");
			} else if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data  == 'Pool exists') {
				$('#tokenName').addClass('error-border')
				openModalPopup("Error", "Pool name already exist");
			} else {
				openModalPopup("Create ICE Pool", "Failed to update ICE Pool.");
			}
			unblockUI()
		},(error)=>{
			openModalPopup("ICE Pool", "Failed to update ICE Pool.");
			console.log("Error:::::::::::::", error);
			unblockUI()
		})
	}

	$scope.createIcePool.deleteIcePool = function () {
		openDeleteGlobalModal("Delete ICE Pool", "delICEPool", `Are you sure you want to delete ICE Pool : ${$scope.createIcePool.selectedIcePool.poolname} ? \nAll the jobs queued on this pool will be canceled.`);
	};

	$(document).on('click','#delICEPool', function(e) {
		hideDeleteGlobalModal();
		blockUI('Deleting ICE Pool ...')
		var id = $scope.createIcePool.selectedIcePool._id
		adminServices.deletePools({'poolid':[id]})
		.then((data)=>{
			if (data == "success") {
				$scope.EditIcePoolReset()
				populatePool().then((res)=>{
				$scope.createIcePool.allIcePoolList = res.data
				})
				openModalPopup("Success", "ICE Pool deleted successfully.");
			} else if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else {
				openModalPopup("ICE Pool", "Failed to delete ICE Pool");
			}
			unblockUI()
		},(error)=>{
			openModalPopup("ICE Pool", "Failed to delete ICE Pool");
			console.log("Error:::::::::::::", error);
			unblockUI()
		})
	})
	
	// on click of allocate ice pool button
	$scope.allocateIcePool.click = async() =>{
		$(".selectedIcon").removeClass("selectedIcon");
		$("#allocateIcePool").find("img").addClass("selectedIcon");
		//api to get total ice count and remaining ice count
		$scope.iceAllocateType('quantity');
		blockUI("Fetching ICE Pools...");
		unblockUI()
	}
	
	$scope.allocateIcePool.saveClick = () =>{
		blockUI('Saving in Progress. Please Wait...');
		var pool = $scope.allocateIcePool.selectedIcePool
		var iceData = $scope.allocateIcePool.iceData
		var type = $scope.allocateIcePool.type 
		if(type == 'quantity'){
			var iceList = Object.keys(pool.ice_list)
			var val = $('#icepoolNumInp').val() - iceList.length
			pool.ice_deleted = []
			pool.ice_added = []
			var availableIce = Object.keys(iceData.available_ice).length 
			if(val > availableIce){
				openModalPopup("Error", "Number of ICE assigned exceeds available ICE");
				unblockUI()
				return;
			}
			if(val<0){
				pool.ice_deleted = Object.keys($scope.allocateIcePool.iceDict).slice(0,Math.abs(val))
			}else{
				pool.ice_added = Object.keys(iceData.available_ice).slice(0,val)
			}
		}
		if(type == 'specific'){
			var ice_List = []
			var ice_added = []
			var ice_deleted = []
			$('#assignedProjectAP option').each((i,e)=>{
				ice_List.push(e.value)
				if(!(e in $scope.allocateIcePool.iceDict)){
					ice_added.push(e.value)
				}
			})
			$scope.allocateIcePool.iceList.forEach((e)=>{
				if(ice_List.indexOf(e[0])==-1){
					ice_deleted.push(e[0])
				}
			})
			pool.ice_added= ice_added
			pool.ice_deleted=ice_deleted
		}
		blockUI('Saving ICE Pool ...')
		adminServices.updatePool(pool)
		.then((data)=>{
			if (data == "success") {
				$scope.iceAllocateType(type)
				openModalPopup("Success", "ICE Pool updated successfully.");
			} else if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else {
				openModalPopup("ICE Pool", "Failed to update ICE Pool");
				unblockUI()
			}
		},(error)=>{
			openModalPopup("ICE Pool", "Failed to update ICE Pool");
			console.log("Error:::::::::::::", error);
			unblockUI()
		})
	}

	$scope.allocateIcePool.selectIcePool = (pool) =>{
		$scope.allocateIcePool.selectedIcePool=pool
		blockUI('Fetching ICE Pool...')
		populateICEList().then(function(res){
			$scope.allocateIcePool.iceList = res.data
			$scope.allocateIcePool.iceDict = res.dict
			if($scope.allocateIcePool.type==='quantity'){
				$('#update-icepool-count').removeClass("hide")
				$('#update-icepool-count').find('input').attr({
					"max":$scope.allocateIcePool.iceCount+res.data.length,
					"min":0,
				})
				$('#update-icepool-count').find('input').val(res.data.length)
			}
			if($scope.allocateIcePool.type==='specific'){
				var selectBox = $("#assignedProjectAP");
				res.data.forEach((e)=>{
					selectBox.append('<option value='+e[0]+'>'+e[1].icename+'</option>');
				})
			}
		})

	}

	$scope.allocationPoolReset = () => {
		var type = $scope.allocateIcePool.type 
		$scope.allocateIcePool.allIcePoolListFilter=''
		$scope.allocateIcePool.selectedIcePool = undefined	
		if(type == 'quantity'){
			$('#update-icepool-count').addClass("hide")
			$('#icepoolNumInp').val('')
		}
		if(type == 'specific'){
			$('#allProjectAP option').remove()
			if($scope.allocateIcePool.iceData){
				var arr = {...$scope.allocateIcePool.iceData.available_ice}
				Object.entries(arr).forEach((e)=>{
					$('#allProjectAP').append('<option value='+e[0]+'>'+e[1].icename+'</option>')
				})
			}
			$('#assignedProjectAP option').remove()
			$('select#allProjectAP').val([])
		}
	}

	$scope.iceAllocateType = async(type) => {
		blockUI('Fetching ICE Pools...')
		$scope.allocateIcePool.iceData = {}
		$scope.allocateIcePool.type = type
		$(".unactive-opt").removeClass("unactive-opt")
		if(type==='quantity'){
			$('#icepool-specific').addClass('unactive-opt')
		}else{
			$('#icepool-quantity').addClass('unactive-opt')
		}
		$scope.allocationPoolReset()
		adminServices.getAvailable_ICE()
		.then((data)=>{
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data  == 'fail') {
				openModalPopup("Error", "Failed to fetch ICE");
				unblockUI()
			} else if(data.length == 0) {
				openModalPopup("Error", "No active ICE available");
				unblockUI()
			} else {
				if(type==='quantity'){
					var available = Object.keys(data.available_ice).length
					var total = available + Object.keys(data.unavailable_ice).length
					$scope.allocateIcePool.iceCount = {total:total,available:available}
					$scope.allocateIcePool.iceData = data
				}if(type=='specific'){
					$scope.allocateIcePool.iceData = data
				}
				populatePool().then((res)=>{
					$scope.allocateIcePool.allIcePoolList = res.data
					unblockUI()
				})
			}
		},(error)=>{
			openModalPopup("ICE Pool", "Failed to fetch ICE Pool");
			console.log("Error:::::::::::::", error);
			unblockUI()
		})
	}

	// Assign Projects Tab Click
	$scope.assignProj.click = function () {
		resetAssignProjectForm();
		$(".selectedIcon").removeClass("selectedIcon");
		$("#assignProjectTab").find("span.fa").addClass("selectedIcon");
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
					if(data[i][3] != "Admin"){
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
		assignProjectsObj.domainname = domainname;
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

	$scope.provision.click = function($event){
		$(".selectedIcon").removeClass("selectedIcon");
		$("#provisionTab").find("span.fa").addClass("selectedIcon");;
		$scope.provision.op='normal';
		$scope.provision.tokentooltip = "Click on Provision/Reregister to generate token";
		$scope.provision.icelist=[];
		$scope.provision.users = [['Select User',' ','','']];
		$scope.tokeninfo = {};
		$scope.provision.selectProvisionType($event);
		$('body').tooltip({trigger: "hover", selector: "span.fa"});
	};

	$scope.provision.provisionsIce = function ($event) {
		$("#icename").removeClass("inputErrorBorder");
		$("#selAssignUser2").removeClass("selectErrorBorder");
		const icename = $scope.provision.icename;
		const userid = $scope.provision.userid;
		const icetype = $scope.provision.op;
		var flag = false;
		$scope.provision.token = "";
		if (icename == "") {
			$("#icename").addClass("inputErrorBorder");
			flag = true;
		}
		if (icetype == "normal"  && (!userid || userid.trim() == "")) {
			$("#selAssignUser2").addClass("selectErrorBorder");
			flag = true;
		}
		if (flag) return false;

		var tokeninfo = {
			userid: userid,
			icename: icename,
			icetype: icetype,
			action: "provision"
		};
		blockUI("Provisioning Token...")
		adminServices.provisions(tokeninfo).then(function (data) {
			unblockUI();
			if (data == "Invalid Session") return $rootScope.redirectPage();
			else if (data == 'fail') openModalPopup("ICE Provision Error", "ICE Provisioned Failed");
			else if (data=='DuplicateIceName') openModalPopup("ICE Provision Error", "ICE Provisioned Failed!<br/>ICE name or User already exists");
			else {
				$scope.tokeninfo.icename = icename;
				$scope.tokeninfo.token = data;
				$scope.provision.token = data;
				$scope.provision.fetchICE();
				openModalPopup("ICE Provision Success", "Token generated Successfully for ICE '"+icename+"'<br/>Copy or Download the token");
			}
		}, function (error) {
			unblockUI();
			console.log("Error:::::::::::::", error);
		});
	}

	$scope.showTooltip = function (btn, msg, resetmsg) {
		btn.attr('data-original-title', msg).tooltip('show');
		setTimeout(function() {
			btn.tooltip('hide');
			btn.attr('data-original-title', resetmsg);
		}, 1500);
	};

	$scope.copyToken = function ($event) {
		const data = $scope.tokeninfo.token;
		const btn = $($event.target);
		if (!data) {
			$scope.showTooltip(btn, "Nothing to Copy!", "Click to Copy");
			return;
		}
		const x = document.getElementById('iceToken');
		x.select();
		document.execCommand('copy');
		$scope.showTooltip(btn, "Copied!", "Click to Copy");
	}

	$scope.downloadToken = function ($event){
		const data = $scope.tokeninfo.token;
		const btn = $($event.target);
		if (!data) {
			$scope.showTooltip(btn, "Nothing to Download!", "Download Token")
			return;
		}
		const filename = $scope.tokeninfo.icename + "_icetoken.txt";
		if (isIE) {
			window.navigator.msSaveOrOpenBlob(new Blob([data], { type: "text/json;charset=utf-8" }), filename);
		} else {
			var blob = new Blob([data], { type: 'text/json' });
			var e = document.createEvent('MouseEvents');
			var a = document.createElement('a');
			a.download = filename;
			a.href = window.URL.createObjectURL(blob);
			a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
			e.initMouseEvent('click', true, true, window,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
			a.dispatchEvent(e);
		}
		$scope.showTooltip(btn, "Downloaded!", "Download Token");
	}

	$scope.provision.deregister = function ($event) {
		const provisionDetails = $scope.provision.icelist[$($event.target).data("index")];
		const icename = provisionDetails.icename;
		const tokeninfo = {
			icename: icename,
			userid: provisionDetails.provisionedto,
			icetype: provisionDetails.icetype,
			action: "deregister"
		};
		blockUI("Deregistering...");
		adminServices.provisions(tokeninfo).then(function (data) {
			unblockUI();
			if (data == "Invalid Session") return $rootScope.redirectPage();
			else if (data == 'fail') openModalPopup("ICE Provisions", "ICE Deregister Failed");
			else {
				adminServices.manageSessionData('disconnect', icename, "?", "dereg").then(function (data) {
					if (data == "Invalid Session") return $rootScope.redirectPage();
				}, function (error) { });
				openModalPopup("ICE Provisions", "ICE Deregistered Successfully");
				$scope.provision.selectProvisionType($event);
				//$scope.provision.fetchICE();
			}
		}, function (error) {
			unblockUI();
			console.log("Error:::::::::::::", error);
		});
	};

	$scope.provision.reregister = function ($event) {
		const provisionDetails = $scope.provision.icelist[$($event.target).data("index")];
		const icename = provisionDetails.icename;
		const event=$.trim($event.currentTarget.textContent);
		const tokeninfo = {
			icename: icename,
			userid: provisionDetails.provisionedto,
			icetype: provisionDetails.icetype,
			action: "reregister"
		};
		blockUI(event+"ing...");
		adminServices.provisions(tokeninfo).then(function (data) {
			unblockUI();
			if (data == "Invalid Session") return $rootScope.redirectPage();
			else if (data == 'fail') openModalPopup("ICE Provisions", "ICE "+event+" Failed");
			else {
				adminServices.manageSessionData('disconnect', icename, "?", "dereg").then(function (data) {
					if (data == "Invalid Session") return $rootScope.redirectPage();
				}, function (error) { });
				$scope.tokeninfo.icename = icename;
				$scope.tokeninfo.token = data;
				$scope.provision.token = data;
				$scope.provision.icename = icename;
				$scope.provision.op = provisionDetails.icetype;
				$scope.provision.userid = provisionDetails.provisionedto || ' ';
				openModalPopup("ICE Provision Success", "ICE "+event+"ed Successfully: '"+icename+"'<br/>Copy or Download the token");
				$scope.provision.fetchICE();
			}
		}, function (error) {
			unblockUI();
			console.log("Error:::::::::::::", error);
		});
	};

	$scope.provision.selectProvisionType = function($event) {
		$("#icename").removeClass("inputErrorBorder");
		$("#selAssignUser2").removeClass("selectErrorBorder");
		$scope.provision.token = $scope.provision.tokentooltip;
		$scope.provision.icename = '';
		$scope.provision.userid = ' ';
		if ($scope.provision.op == "normal") {
			adminServices.getUserDetails("user").then(function(data) {
				if (data == "Invalid Session") $rootScope.redirectPage();
				else if (data == "fail") openModalPopup("ICE Provision", "Failed to fetch users.");
				else if (data == "empty") openModalPopup("ICE Provision", "There are no users present.");
				else {
					data.sort((a,b)=>a[0].localeCompare(b[0]));
					data.splice(0, 0, ['Select User',' ','','']);
					$scope.provision.users = data.filter((e)=> (e[3] != "Admin"));
				}
			}, function (error) {
				console.log("Error:::::::::::::", error);
			});
		}
		$scope.provision.fetchICE();
	};

	$scope.provision.fetchICE = function($event) {
		blockUI("Loading...");
		$("#searchTasks").val('');
		adminServices.fetchICE().then(function (data) {
			unblockUI();
			if (data == "Invalid Session") $rootScope.redirectPage();
			else if (data == 'fail') openModalPopup("ICE Provisions", "Failed to load ICE Provisions");
			else {
				data.sort((a,b)=>a.icename.localeCompare(b.icename));
				data = data.filter(e => e.provisionedto != "--Deleted--");
				$scope.provision.icelist = data;
			}
		}, function (error) {
			unblockUI();
			console.log("Error:::::::::::::", error);
		});
	};

	$scope.provision.verifyName = function($event) {
		const name = $scope.provision.icename;
		const icelist = $scope.provision.icelist.map(e => e.icename);
		if (icelist.indexOf(name) > -1) $("#icename").addClass("inputErrorBorder")[0].title = "ICE Name already Exists!";
		else $("#icename").removeClass("inputErrorBorder")[0].title = "";
	};

	$(document).on('click','.searchIcon', function($event){
		filter(this,event);
	});

	$(document).on('keyup','#searchTasks', function($event) {
		filter(this,event); 
		// event.stopImmediatePropagation();
	});

	function filter(element,event) {
		var title=$('.searchInput').val();
		$('.provisionTokens').each(function(){
			// elements=$(this).children('td:nth-child(2)')
			if($(this).children('td:nth-child(2)').text().trim() != '' && $(this).children('td:nth-child(2)').text().trim().indexOf(title.toLowerCase())>-1
			|| $(this).children('td:nth-child(1)').text().trim() != '' && $(this).children('td:nth-child(1)').text().trim().indexOf(title.toLowerCase())>-1){
				$(this).show();
			}
			else{
				$(this).hide();
			}
		});
	}

	$scope.tokens.click = function () {
		$(".selectedIcon").removeClass("selectedIcon");
		$("#tokenTab").find("span.fa").addClass("selectedIcon");;
		$scope.tokens.op = 'normal';
		$scope.tokens.repopulateEntries();
	};

	$scope.tokens.repopulateEntries = function ($event) {
		$scope.tokens.name = '';
		$scope.tokens.token = '';
		$scope.tokens.allUsers = [['Select User',' ','','']];
		$scope.tokens.allICE = [{'_id':' ', 'icename':'Select ICE', 'icetype':'ci-cd'}];
		$scope.tokens.allTokens = [];
		$scope.tokens.targetid = ' ';
		$('.fc-datePicker').val('');
		$('.fc-timePicker').val('');
		if ($scope.tokens.op == 'normal') {
			adminServices.getUserDetails("user").then(function(data) {
				if (data == "Invalid Session") $rootScope.redirectPage();
				else if (data == "fail") openModalPopup("Token Management", "Failed to fetch users.");
				else if (data == "empty") openModalPopup("Token Management", "There are no users present.");
				else {
					data.sort((a,b)=>a[0].localeCompare(b[0]));
					data.splice(0, 0, ['Select User',' ','','']);
					$scope.tokens.allUsers = data.filter((e)=> (e[3] != "Admin"));
				}
			}, function (error) {
				console.log("Error:::::::::::::", error);
			});
		} else {
			adminServices.fetchICE().then(function (data) {
				unblockUI();
				if (data == "Invalid Session") $rootScope.redirectPage();
				else if (data == 'fail') openModalPopup("Token Management", "Failed to load ICE Provisions");
				else if(data == "empty") openModalPopup("Token Management", "There are no ICE provisioned");
				else {
					data.sort((a,b)=>a.icename.localeCompare(b.icename));
					data.splice(0, 0, {'_id':' ', 'icename':'Select ICE', 'icetype':'ci-cd'});
					$scope.tokens.allICE = data.filter(e => (e.provisionedto != "--Deleted--" && e.icetype=='ci-cd'));
				}
			}, function (error) {
				unblockUI();
				console.log("Error:::::::::::::", error);
			});
		}
	};

	$scope.tokens.loadData = function ($event, clearFields) {
		const generatetoken = { 'userId': $scope.tokens.targetid };
		if (generatetoken.userId == ' ') return false;
		blockUI("Fetching Token data. Please wait...");
		adminServices.getCIUsersDetails(generatetoken).then(function (data) {
			unblockUI();
			if (data == "Invalid Session") $rootScope.redirectPage();
			else if (data == 'fail') openModalPopup("Token Management", "Failed to fetch token data");
			else if (data.length == 0) openModalPopup("Token Management", "No tokens have been issued");
			else {
				//openModalPopup("Token Management", "Fetch Token details successful");
				data.sort((a,b)=>a.deactivated.localeCompare(b.deactivated));
				data.forEach(e=>e.expiry=new Date(e.expiry).toString().slice(0,-22))
				$scope.tokens.allTokens = data;
				if (clearFields) {
					$scope.tokens.name = '';
					$scope.tokens.token = '';
					$('.fc-datePicker').val('');
					$('.fc-timePicker').val('');
				}
			}
		}, function (error) {
			unblockUI();
			console.log("Error:::::::::::::", error);
		});
	};

	//	Generate CI user Token
	$scope.tokens.generateCIusertokens = function ($event) {
		$("#tokenName").removeClass("inputErrorBorder");
		$("#selAssignUser1").removeClass("selectErrorBorder");
		//$(".tokenSuite .datePicContainer .fc-datePicker").removeClass("selectErrorBorder").css('border', '1px solid #909090 !important');
		const icetype = $scope.tokens.op;
		const userId = $scope.tokens.targetid.trim();
		const tokenname = $scope.tokens.name.trim();
		let flag = false;
		if (userId == "") {
			$("#selAssignUser1").addClass("selectErrorBorder");
			flag = true;
		}
		if (tokenname == "") {
			$("#tokenName").addClass("inputErrorBorder");
			flag = true;
		}
		if (flag) return flag;
		const tokendetails = JSON.parse(window.localStorage['_UI']).token;
		$(".scheduleSuiteTable").append('<div class="tokenSuite"><span class="datePicContainer"><input class="form-control fc-datePicker" type="text" title="Select Date" placeholder="Select Date" value="" readonly/><img class="datepickerIconToken" src="../imgs/ic-datepicker.png" /></span><span class="timePicContainer"><input class="form-control fc-timePicker" type="text" value="" title="Select Time" placeholder="Select Time" readonly disabled/><img class="timepickerIcon" src="../imgs/ic-timepicker.png" /></span></div>');
		var expdate=$(".tokenSuite .datePicContainer .fc-datePicker").val();
		var exptime=$(".tokenSuite .timePicContainer .fc-timePicker").val();
		var today = new Date();
		var td = new Date();
		var expiry = "";
		if (expdate == "") {
			td.setHours(today.getHours()+parseInt(tokendetails));
			expdate = td.getDate()+"-"+(td.getMonth()+1)+"-"+td.getFullYear()
			$('.fc-datePicker').val(expdate);
		}
		if (exptime == "") {
			var sldate = $(".tokenSuite .datePicContainer .fc-datePicker").val()
			var sldate_2 = sldate.split("-");
			if(parseInt(sldate_2[0])==today.getDate() && (parseInt(sldate_2[1]))==today.getMonth()+1 && parseInt(sldate_2[2])==today.getFullYear()){
				td.setHours(today.getHours()+8);
				var exptime=""+td.getHours()+":"+td.getMinutes
				$('.fc-timePicker').val(exptime);
			}
			else{
				var exptime=""+today.getHours()+":"+today.getMinutes()
				$('.fc-timePicker').val(exptime);
			}	
		}
		var sldate_2 = expdate.split("-");
		var sltime_2 = exptime.split(":");
		expiry = expdate+" "+exptime;
		var now = new Date(sldate_2[2],sldate_2[1]-1,sldate_2[0],sltime_2[0],sltime_2[1]);
		td = today;
		td.setHours(today.getHours()+8);
		if (now < today || (now >= today && now < td)) {
			openModalPopup("Token Management", "Expiry time should be 8 hours more than current time");
			return false;
		} else if($('td:contains("active")').length>=10){
			openModalPopup("Token Management", "User can have max 10 active tokens. Please Deactivate old tokens");
			return false;
		}
		const CIUser = {
			'userId': userId,
			'expiry': expiry,
			'tokenname': tokenname,
			'icetype': icetype
		};
		blockUI('Generating Token. Please Wait...');
		adminServices.manageCIUsers("create", CIUser)
		.then(function (data) {
			unblockUI();
			if (data == "Invalid Session") $rootScope.redirectPage();
			else if (data == 'fail') openModalPopup("Token Management", "Failed to generate token");
			else if (data == 'duplicate') openModalPopup("Token Management", "Failed to generate token, Token Name already exists");
			else {
				$scope.tokens.token = data.token;
				$scope.tokens.loadData($event);
				openModalPopup("Token Management", "Token generated successfully");
			}
		}, function (error) {
			unblockUI();
			console.log("Error:::::::::::::", error);
		});
	};

	$scope.tokens.deactivate = function ($event) {
		const CIUser = {
			'userId': $scope.tokens.targetid,
			'tokenName': $scope.tokens.allTokens[$($event.target).data("id")].name
		};
		adminServices.manageCIUsers("deactivate", CIUser).then(function (data) {
			unblockUI();
			if (data == "Invalid Session") $rootScope.redirectPage();
			else if (data == 'fail') openModalPopup("Token Management", "Failed to deactivate token");
			else {
				openModalPopup("Token Management", "Token '"+CIUser.tokenName+"' has been Deactivated");
				data.sort((a,b)=>a.deactivated.localeCompare(b.deactivated));
				data.forEach(e=>e.expiry=new Date(e.expiry).toString().slice(0,-22))
				$scope.tokens.allTokens = data;
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
		}).on('hide.datepicker', function(e){
			if($(this).val().length > 0){
				$(this).parent().siblings('.timePicContainer').find('.fc-timePicker').timepicker({
					minTime: new Date().getHours() + ':' + (parseInt(new Date().getMinutes()+5)),
					minuteStep: 1,
					showMeridian: false
				})
				$(this).parent().siblings('span').find('.fc-timePicker').prop('disabled',false).css({'cursor':'pointer', 'background-color':'white'});
			}
			else{
				$(this).parent().siblings('span').find('.fc-timePicker').prop('disabled',true).css('cursor','not-allowed');
			}
		})
	})

	$(document).on('focus', '.fc-timePicker', function(){
		$(this).timepicker({
			minTime: new Date().getHours() + ':' + (parseInt(new Date().getMinutes()+5)),
			minuteStep: 1,
			showMeridian: false
			//minTime: (new Date().getHours() + ':' + ((new Date().getMinutes())+05))
		})
	})

	$(document).on('click', ".datepickerIconToken", function(){
		$(this).siblings(".fc-datePicker").focus()
	})
	.on('click', ".timepickerIconToken", function(){
		//$(".bootstrap-timepicker-hour, .bootstrap-timepicker-minute").val("");
		$(this).siblings(".fc-timePicker").focus()
	})

	$scope.tokens.verifyName = function($event) {
		const name = $scope.tokens.name;
		const tknlist = $scope.tokens.allTokens.map(e => e.name);
		if (tknlist.indexOf(name) > -1) $("#tokenName").addClass("inputErrorBorder")[0].title = "Token Name already Exists!";
		else $("#tokenName").removeClass("inputErrorBorder")[0].title = "";
	};

	$scope.domainConf.click = function(query) {
		$(".selectedIcon").removeClass("selectedIcon");
		$("button.userTypeBtnActive").removeClass('userTypeBtnActive');
		$("#projectTab").find("span.fa").addClass("selectedIcon");
		this.query0 = '';
		this.query1 = '';
	}

	$(document).on('click', '#projectTab', function () {
		resetForm();
		projectDetails = [];
		updateProjectDetails = [];
		var plugins = [];
		$(".selectedIcon").removeClass("selectedIcon");
		$(this).children().find("span.fa").addClass("selectedIcon");;
		adminServices.getAvailablePlugins()
		.then(function (plugins_list) {
			for (var i = 0; i < plugins_list.length; i++) {
				plugins[i] = plugins_list[i];
			}
			$timeout(function () {
				$('.scrollbar-inner').scrollbar();
				toggleCycleClick();
			}, 10);
			adminServices.getDomains_ICE()
			.then(function (data) {
				if (data == "Invalid Session") {
					$rootScope.redirectPage();
				} else {
					// $scope.domainConf.alldomains=data;
					$('#selDomain').show()
					$('#selDomains').hide()
					$('#selDomain').empty()
					if(data.length==0){
						data=['Banking','Manufacturing','Finance']
					}
					for (var i = 0; i < data.length; i++) {
					// if(data.length!=0){
						$('#selDomain').append($("<option value=" + data[i] + "></option>").text(data[i]));
					}
					var details = {
						"web":{"data":"Web","title":"Web","img":"web"},
						"webservice":{"data":"Webservice","title":"Web Service","img":"webservice"},
						"mainframe":{"data":"Mainframe","title":"Mainframe","img":"mainframe"},
						"desktop":{"data":"Desktop","title":"Desktop Apps","img":"desktop"},
						"oebs":{"data":"OEBS","title":"Oracle Apps","img":"oracleApps"},
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
		blockUI()
		$(".selectedIcon").removeClass("selectedIcon");
		$("#preferencesTab").find("span.fa").addClass("selectedIcon");
		setTimeout(function () {
			adminServices.getPreferences()
			.then(function (response) {
				if (response == "Invalid Session") {
					$rootScope.redirectPage();
				} else {
					$('#pref').empty()
					$('#pref').append("<tr><td>Admin</td><td><input type='checkbox' value='' checked='checked' class='module_admin'></td><td><input type='checkbox' value='' class='module_admin'></td><td><input type='checkbox' value='' class='module_admin'></td><td><input type='checkbox' value='' class='module_admin'></td></tr>")
					$('#pref').append("<tr id=rows><td>ICE</td></tr>")
					for(i=0;i<response.length;i++) {
						$('#head').append("<th>"+response[i].name+"</th>");
						let checked = (['Test Lead', 'Test Engineer'].indexOf(response[i].name) > -1)? "checked='checked'":'';
						$('#rows').append("<td><input type='checkbox' value='' "+checked+" class='module_admin'></td>");
					}
					var rows = ["ALM","Mindmap","Reports","Utility"];
					for (j=0;j<rows.length;j++){
						let pluginName = (rows[j]=="ALM")? "Integration" : rows[j];
						$('#pref').append("<tr id="+pluginName+"><td>"+pluginName+"</td></tr>")
						for(i=0;i<response.length;i++){
							let checked = (response[i].plugins[rows[j].toLowerCase()]==true)? "checked='checked'":'';
							$("#"+pluginName).append("<td><input type='checkbox' value='' "+checked+" class='module_admin'></td>");
						}
					}
					$("#preferencesTable").find("input[type=checkbox]").each(function () {
						$(this).attr("disabled", "disabled");
					});
				}
			}, function (error) {
				console.log("Error:::::::::::::", error);
			});
			$("#preferencesTable").find("input[type=checkbox]:not(.switchRole)").each(function () {
				$(this).attr("disabled", "disabled");
			});
			unblockUI()
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
				if (projectDetails[i].cycles.length <= 0) {
					relNames = relNames.length > 0 ? relNames + ", " + projectDetails[i].name : projectDetails[i].name;
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
						$('#selDomain').val($('#selDomain').val()[0].toUpperCase()+$('#selDomain').val().slice(1))
						requestedids.push($('#selDomain').val());
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
								createprojectObj.domain = $('#selDomain').val();
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
				if ($(this).children('span.releaseName').text() == projectDetails[i].name) {
					if (projectDetails[i].cycles.length == 0) {
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
					if (newProjectDetails[i].cycles.length <= 0) {
						for (var j = 0; j < updateProjectDetails.length; j++) {
							if (updateProjectDetails[j].name == newProjectDetails[i].name && updateProjectDetails[j].cycles.length <= 0) {
								relName = relName.length > 0 ? relName + ", " + newProjectDetails[i].name : relName + newProjectDetails[i].name;
								proceedFlag = false;
								testFlag = false;
							}
						}
						if (testFlag) {
							relName = relName.length > 0 ? relName + ", " + newProjectDetails[i].name : relName + newProjectDetails[i].name;
							proceedFlag = false;
						}
					}
				}
			}

			if (updateProjectDetails.length > 0) {
				for (i = 0; i < updateProjectDetails.length; i++) {
					if (updateProjectDetails[i].cycles.length <= 0) {
						var testFlag = true;
						for (var j = 0; j < newProjectDetails.length; j++) {
							if (updateProjectDetails[i].name == newProjectDetails[j].name) {
								testFlag = false;
								if (newProjectDetails[j].cycles.length <= 0) {
									relName = relName.length > 0 ? relName + ", " + updateProjectDetails[i].name : relName + updateProjectDetails[i].name;
									proceedFlag = false;
								}
							}
						}
						if (newProjectDetails.length <= 0 || testFlag) {
							relName = relName.length > 0 ? relName + ", " + updateProjectDetails[i].name : relName + updateProjectDetails[i].name;
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
				//updateProjectObj.updateProjectDetails = releasecycles;


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


	//Export Project Action
	$scope.export_project = function ($event) {
		$("#selDomainEdit,#selProject").removeClass("selectErrorBorder");
		if ($('#selDomainEdit option:selected').val() == "") {
			$("#selDomainEdit").addClass("selectErrorBorder");
		} else if ($('#selProject option:selected').val() == "") {
			$("#selProject").addClass("selectErrorBorder");
		} else if ($("#releaseList").children("li").length == 0) {
			openModalPopup("Update Project", "Please add atleast one release");
		}
		else {
			blockUI("Loading...");
			flag = false;
			var projectId = $('#selProject option:selected').val();
			var projectName = $('#selProject option:selected').text();
			adminServices.exportProject(projectId,projectName)
				.then(function (data) {
					if (data == "Invalid Session") {
						$rootScope.redirectPage();
					}else if (data == "fail") openModalPopup("Fail", "Error while exporting to zip");
					else {
						openWindow = 0;
						if (openWindow == 0) {
							var file = new Blob([data], { type: 'application/zip' });
							if (isIE) {
								navigator.msSaveOrOpenBlob(file);
							}else{
								var fileURL = URL.createObjectURL(file);
								var a = document.createElement('a');
								a.href = fileURL;
								a.download = projectName+'.zip';
								document.body.appendChild(a);
								a.click();
								document.body.removeChild(a);
								URL.revokeObjectURL(fileURL);
							}
							openModalPopup("Success", "Successfully exported to zip");
						}
						openWindow++;
					}
					unblockUI();
				}, function (error) {
					console.log("Error:::::::::::::", error);
				});
		}
	}



	function resetForm() {
		//$("#selDomain").prop('selectedIndex', 0);
		// $("#selDomain").val("")
		$("#projectName").val("");
		$("div.projectTypeSelected").removeClass("projectTypeSelected");
		$("#releaseList li, #cycleList li").remove();
		// $("#selDomain").empty()
		$('#releaseList').empty()
		$('#cycleList').empty()
		toggleCycleClick();
	}

	function resetAssignProjectForm() {
		$("#selAssignUser, #selAssignProject").prop('selectedIndex', 0);
		$scope.assignProj.allProjectAP = [];
		$scope.assignProj.assignedProjectAP = [];        
		$("#selAssignProject").empty();
		$("#selAssignProject").append('<option data-id="" value disabled selected>Please Select your domain</option>');
		$("#selDomains").empty();
		$("#selDomains").append('<option data-id="" value disabled selected>Please Select your domain</option>');
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
				if ($("#releaseTxt").val().trim() == "") {
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
							"name": '',
							"cycles": []
						};
						releCycObj.name = releaseName;
						projectDetails.push(releCycObj);
						toggleCycleClick();
						count++;
					}
					if (taskName == "Update Project") {
						var createNewRelCyc = {
							"name": "",
							"newStatus": true,
							"cycles": []
						};
						count = $("#releaseList li").length;
						$("#releaseList").append("<li class='createRelease' id='releaseList_" + count + "'><img src='imgs/ic-release.png' /><span title=" + releaseName + " class='releaseName'>" + releaseName + "</span><span class='actionOnHover'><img id=editReleaseName_" + count + " title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_" + count + " title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
						
						createNewRelCyc.name = releaseName;
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
			if ($("#cycleTxt").val().trim() == "") {
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
						if (projectDetails[i].name == $("li.active").children('span.releaseName').text()) {
							projectDetails[i].cycles.push({"name":cycleName});
						}
					}
					
					toggleCycleClick();
					delCount++;
				}

				if (taskName == "Update Project") {
					var createNewRelCyc = {
						"name": "",
						"releaseId": "",
						"newStatus": false,
						"cycles": []
					};
					var createCyc = {
						"name": "",
						"newStatus": true
					};
					delCount = (delCount + 1) * 3;
					$("#cycleList").append("<li class='cycleList createCycle'><img src='imgs/ic-cycle.png' /><span title=" + cycleName + " class='cycleName'>" + cycleName + "</span><span class='actionOnHover'><img id=editCycleName_" + delCount + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + delCount + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
					
					var RelID = $("li.active").children('span.releaseName').data("releaseid");
					//For update project json
					if (newProjectDetails.length <= 0) {
						createNewRelCyc.name = relName;
						createNewRelCyc.releaseId = RelID;
						createCyc.name = cycleName;
						createNewRelCyc.cycles.push(createCyc);
						newProjectDetails.push(createNewRelCyc);
					} else {
						var chk = true;
						for (j = 0; j < newProjectDetails.length; j++) {
							if (newProjectDetails[j].name == relName && newProjectDetails[j].releaseId == RelID) {
								createCyc.name = cycleName;
								newProjectDetails[j].cycles.push(createCyc);
								chk = false;
								break;
							}
						}
						if (chk == true) {
							createNewRelCyc.name = relName;
							createNewRelCyc.releaseId = RelID;
							createCyc.name = cycleName;
							createNewRelCyc.cycles.push(createCyc);
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
					if (projectDetails[i].name == releaseName && 'cycles' in projectDetails[i]) {
						for (var j = 0; j < projectDetails[i].cycles.length; j++) {
							$("#cycleList").append("<li><img src='imgs/ic-cycle.png' /><span title=" + projectDetails[i].cycles[j].name + " class='cycleName'>" + projectDetails[i].cycles[j].name + "</span><span class='actionOnHover'><img id=editCycleName_" + j + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + j + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
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
					if (updateProjectDetails[i].name == releaseName && 'cycles' in updateProjectDetails[i]) {
						for (var j = 0; j < updateProjectDetails[i].cycles.length; j++) {
							var objectType = typeof(updateProjectDetails[i].cycles[j]);
							if (objectType == "object") {
								$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span title=" + updateProjectDetails[i].cycles[j].name + " data-cycleid=" + updateProjectDetails[i].cycles[j]._id + " class='cycleName'>" + updateProjectDetails[i].cycles[j].name + "</span><span class='actionOnHover'><img id=editCycleName_" + j + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + j + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							} else if (objectType == "string") {
								$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span title=" + updateProjectDetails[i].cycles[j] + "  class='cycleName'>" + updateProjectDetails[i].cycles[j] + "</span><span class='actionOnHover'><img id=editCycleName_" + j + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + j + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							}
							/*if ($("li.active").hasClass("updateRelease")) {
								$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+updateProjectDetails[i].cycles[j].cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							} else {
								$("#cycleList").append("<li class='createCycle'><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+updateProjectDetails[i].cycles[j].cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							}*/
						}
					}
				}
			}

			//Check Release details if newly added
			if (newProjectDetails.length > 0) {
				for (var i = 0; i < newProjectDetails.length; i++) {
					if (newProjectDetails[i].name == releaseName && 'cycles' in newProjectDetails[i]) {
						for (var j = 0; j < newProjectDetails[i].cycles.length; j++) {
							var objectType = typeof(newProjectDetails[i].cycles[j]);
							if (objectType == "object") {
								$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span title=" + newProjectDetails[i].cycles[j].name + " data-cycleid=" + newProjectDetails[i].cycles[j].cycleId + " class='cycleName'>" + newProjectDetails[i].cycles[j].name + "</span><span class='actionOnHover'><img id=editCycleName_" + j + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + j + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
							} else if (objectType == "string") {
								$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span title=" + newProjectDetails[i].cycles[j] + "  class='cycleName'>" + newProjectDetails[i].cycles[j] + "</span><span class='actionOnHover'><img id=editCycleName_" + j + " title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_" + j + " title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
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
									projectDetails[i].name = $("#releaseName").val();
								}
							}
						} else if (taskName == "Update Project") {
							for (i = 0; i < updateProjectDetails.length; i++) {
								if ($("#releaseName").val().trim() == updateProjectDetails[i].name) {
									$(".close:visible").trigger('click');
									openModalPopup("Edit Release Name", "Release Name already exists");
									return false;
								}
							}
							for (i = 0; i < newProjectDetails.length; i++) {
								if ($("#releaseName").val().trim() == newProjectDetails[i].name) {
									$(".close:visible").trigger('click');
									openModalPopup("Edit Release Name", "Release Name already exists");
									return false;
								} else {
									if ($("#" + editReleaseId).parent().prev('span').text() == newProjectDetails[i].name) {
										newProjectDetails[i].name = $("#releaseName").val().trim();
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
										"name": "",
										"oldreleaseName": "",
										"cycles": [],
										"editStatus": false
									};
									updateProjectDetails[i].name = $("#releaseName").val();
									//For update project json
									if (editedProjectDetails.length <= 0) {
										editRelCyc.releaseId = editRelid; //updateProjectDetails[i].releaseId;
										editRelCyc.name = $("#releaseName").val(); //updateProjectDetails[i].name;
										editRelCyc.oldreleaseName = oldRelText;
										editRelCyc.editStatus = true;
										editedProjectDetails.push(editRelCyc);
									} else {
										var chkPresent = true;
										for (m = 0; m < editedProjectDetails.length; m++) {
											if (editedProjectDetails[m].releaseId == editRelid /*updateProjectDetails[i].releaseId*/) {
												editedProjectDetails[m].name = $("#releaseName").val(); //updateProjectDetails[i].name;
												editedProjectDetails[m].oldreleaseName = oldRelText;
												editedProjectDetails[m].editStatus = true;
												chkPresent = false;
												break;
											}
										}
										if (chkPresent == true) {
											editRelCyc.releaseId = editRelid; //updateProjectDetails[i].releaseId;
											editRelCyc.name = $("#releaseName").val(); //updateProjectDetails[i].name;
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
		openDeleteGlobalModal("Delete Release","deleteReleaseYes","Are you sure you want to delete ?");
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
					if (projectDetails[i].name == $("#" + deleteReleaseId).parent().prev('span.releaseName').text()) {
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
					if (updateProjectDetails[i].name == $("#" + deleteReleaseId).parent().prev('span.releaseName').text()) {
						var deleteRelCyc = {
							"releasenameName": "",
							"releaseId": "",
							"cycles": [],
							"deleteStatus": false
						};
						//For update project json
						if (deletedProjectDetails.length <= 0) {
							deleteRelCyc.name = $("#" + deleteReleaseId).parent().prev('span.releaseName').text(); //updateProjectDetails[i].releaseName;
							deleteRelCyc.releaseId = deleteRelid; //updateProjectDetails[i].releaseId
							deleteRelCyc.deleteStatus = true;
							deletedProjectDetails.push(deleteRelCyc);
						} else {
							var chkRelease = true;
							for (j = 0; j < deletedProjectDetails.length; j++) {
								if (deletedProjectDetails[j].releaseId == deleteRelid /*updateProjectDetails[i].releaseId*/) {
									deletedProjectDetails[j].name = $("#" + deleteReleaseId).parent().prev('span.releaseName').text(); //updateProjectDetails[i].releaseName;
									deletedProjectDetails[j].deleteStatus = true;
									chkRelease = false;
									break;
								}
							}
							if (chkRelease == true) {
								deleteRelCyc.name = $("#" + deleteReleaseId).parent().prev('span.releaseName').text(); //updateProjectDetails[i].releaseName;
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
					if (newProjectDetails[j].name == $("#" + deleteReleaseId).parent().prev('span.releaseName').text()) {
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
						if (relID == updateProjectDetails[i].name) {
							for (j = 0; j < updateProjectDetails[i].cycles.length; j++) {
								if ($("#cycleName").val().trim() == updateProjectDetails[i].cycles[j].name) {
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
							if (projectDetails[i].name == $("li.active").children('span.releaseName').text()) {
								for (var j = 0; j < projectDetails[i].cycles.length; j++) {
									if (j == cycleIndex) {
										projectDetails[i].cycles[j] = {"name":$("#cycleName").val()};
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
							if (updateProjectDetails[i].name == $("li.active").children('span.releaseName').text()) {
								for (var j = 0; j < updateProjectDetails[i].cycles.length; j++) {
									var objectType = typeof(updateProjectDetails[i].cycles[j]);
									if (objectType == "object" && j == cycleIndex && (updateProjectDetails[i].name == $("li.active").children('span.releaseName').text()) && (updateProjectDetails[i].cycles[j]._id == editCycId)) {
										var editRelCyc = {
											"releaseId": "",
											"name": "",
											"oldreleaseName": "",
											"cycles": [],
											"editStatus": false
										};
										var editCycle = {
											"oldCycleName": "",
											"name": "",
											"_id": "",
											"editStatus": false
										};
										//console.log("objectType", typeof(updateProjectDetails[i].cycles[j]))
										updateProjectDetails[i].cycles[j].name = $("#cycleName").val();

										//For update project json
										if (editedProjectDetails.length <= 0) {
											//building release details
											editRelCyc.releaseId = relID; //updateProjectDetails[i].releaseId;
											editRelCyc.name = $("li.active").children('span.releaseName').text(); //updateProjectDetails[i].releaseName;
											//building cycle details with release
											editCycle.oldCycleName = oldCycText;
											editCycle.cyclename = $("#cycleName").val(); //updateProjectDetails[i].cycles[j].cycleName;
											editCycle._id = editCycId; //updateProjectDetails[i].cycles[j].cycleId;
											editCycle.editStatus = true;
											editRelCyc.cycles.push(editCycle);
											//pushing all data to an array
											editedProjectDetails.push(editRelCyc);
										} else {
											var chkRelPresent = true;
											for (m = 0; m < editedProjectDetails.length; m++) {
												if (editedProjectDetails[m].name == relID /*updateProjectDetails[i].releaseId*/) {
													var chkcycinrel = true;
													for (n = 0; n < editedProjectDetails[m].cycles.length; n++) {
														if (editedProjectDetails[m].cycles[n].cycleId == editCycId /*updateProjectDetails[i].cycles[j].cycleId*/) {
															editedProjectDetails[m].cycles[n].cycleName = $("#cycleName").val(); //updateProjectDetails[i].cycles[j].cycleName;
															editedProjectDetails[m].cycles[n].oldCycleName = oldCycText;
															editedProjectDetails[m].cycles[n].editStatus = true;
															chkcycinrel = false;
															break;
														}
													}
													if (chkcycinrel == true) {
														//building cycle details with release
														editCycle.oldCycleName = oldCycText;
														editCycle.cycleName = $("#cycleName").val(); //updateProjectDetails[i].cycles[j].cycleName;
														editCycle.cycleId = editCycId; //updateProjectDetails[i].cycles[j].cycleId;
														editCycle.editStatus = true;
														editedProjectDetails[m].cycles.push(editCycle);
														break;
													}
													chkRelPresent = false;
												}
											}
											if (chkRelPresent == true) {
												//building release details
												editRelCyc.releaseId = relID; //updateProjectDetails[i].releaseId;
												editRelCyc.name = $("li.active").children('span.releaseName').text(); //updateProjectDetails[i].releaseName;
												//building cycle details with release
												editCycle.oldCycleName = oldCycText;
												editCycle.cycleName = $("#cycleName").val(); //updateProjectDetails[i].cycles[j].cycleName;
												editCycle.cycleId = editCycId; //updateProjectDetails[i].cycles[j].cycleId;
												editCycle.editStatus = true;
												editRelCyc.cycles.push(editCycle);
												//pushing all data to an array
												editedProjectDetails.push(editRelCyc);
											}
										}
										break;
									}
									//For update project json
									if (objectType == "string" && j == cycleIndex) {
										updateProjectDetails[i].cycles[j] = $("#cycleName").val();
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
		openDeleteGlobalModal("Delete Cycle","deleteCycleYes","Are you sure you want to delete ?");
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
				for (var j = 0; j < projectDetails[i].cycles.length; j++) {
					if ((projectDetails[i].cycles[j] == $("#" + deleteCycleId).parent().prev('span.cycleName').text()) && (projectDetails[i].name == $("li.active").children('span.releaseName').text())) {
						delete projectDetails[i].cycles[j];
						projectDetails[i].cycles = projectDetails[i].cycles.filter(function (n) {
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
			var idtype = ["cycles"];
			adminServices.getDetails_ICE(idtype, CycleID)
			.then(function (response) {
				if (response == "Invalid Session") {
					$rootScope.redirectPage();
				}

				for (var i = 0; i < newProjectDetails.length; i++) {
					if (newProjectDetails[i].name == $("li.active").children("span.releaseName").text()) {
						for (var j = 0; j < newProjectDetails[i].cycles.length; j++) {
							if (newProjectDetails[i].cycles[j].cycleName == $("#" + deleteCycleId).parent().prev('span.cycleName').text()) {
								delete newProjectDetails[i].cycles[j];
								newProjectDetails[i].cycles = newProjectDetails[i].cycles.filter(function (n) {
										return n != null;
									});
								if (newProjectDetails[i].cycles.length <= 0) {
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
						if (updateProjectDetails[i].name == $("li.active").children("span.releaseName").text()) {
							for (var j = 0; j < updateProjectDetails[i].cycles.length; j++) {
								var objectType = typeof(updateProjectDetails[i].cycles[j]);
								if (objectType == 'object') {
									if (updateProjectDetails[i].cycles[j].cycleName == $("#" + deleteCycleId).parent().prev('span.cycleName').text()) {
										var deleteRelCyc = {
											"name": "",
											"releaseId": "",
											"cycles": [],
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
											deleteRelCyc.name = $("li.active").children("span.releaseName").text(); //updateProjectDetails[i].releaseName;
											deleteRelCyc.releaseId = $("li.active").children("span.releaseName").data("releaseid"); //updateProjectDetails[i].releaseId;
											deleteRelCyc.deleteStatus = false;
											//adding cycle object within release
											deleteCycle.cycleName = $("#" + deleteCycleId).parent().prev('span.cycleName').text(); //updateProjectDetails[i].cycles[j].cycleName;
											deleteCycle.cycleId = deleteCycId; //updateProjectDetails[i].cycles[j].cycleId;
											deleteCycle.deleteStatus = true;
											deleteRelCyc.cycles.push(deleteCycle);
											//pushing all to object
											deletedProjectDetails.push(deleteRelCyc);
										} else {
											var chk = true;
											for (k = 0; k < deletedProjectDetails.length; k++) {
												if (deletedProjectDetails[k].releaseId == $("li.active").children("span.releaseName").data("releaseid") /*updateProjectDetails[i].releaseId*/) {
													var chkCycInRel = true;
													for (l = 0; l < deletedProjectDetails[k].cycles.length; l++) {
														if (deletedProjectDetails[k].cycles[l].cycleId == deleteCycId /*updateProjectDetails[i].cycles[j].cycleId*/) {
															deletedProjectDetails[k].cycles[l].cycleName = $("#" + deleteCycleId).parent().prev('span.cycleName').text(); //updateProjectDetails[i].cycles[j].cycleName;
															deletedProjectDetails[k].cycles[l].deleteStatus = true;
															chkCycInRel = false;
															break;
														}
													}
													if (chkCycInRel == true) {
														deleteCycle.cycleName = $("#" + deleteCycleId).parent().prev('span.cycleName').text(); //updateProjectDetails[i].cycles[j].cycleName;
														deleteCycle.cycleId = deleteCycId; //updateProjectDetails[i].cycles[j].cycleId;
														deleteCycle.deleteStatus = true;
														deletedProjectDetails[k].cycles.push(deleteCycle);
													}
													chk = false;
												}
											}
											if (chk == true) {
												//adding release object
												deleteRelCyc.name = $("li.active").children("span.releaseName").text(); //updateProjectDetails[i].releaseName;
												deleteRelCyc.releaseId = $("li.active").children("span.releaseName").data("releaseid"); //updateProjectDetails[i].releaseId;
												deleteRelCyc.deleteStatus = false;
												//adding cycle object within release
												deleteCycle.cycleName = $("#" + deleteCycleId).parent().prev('span.cycleName').text(); //updateProjectDetails[i].cycles[j].cycleName;
												deleteCycle.cycleId = deleteCycId; //updateProjectDetails[i].cycles[j].cycleId;
												deleteCycle.deleteStatus = true;
												deleteRelCyc.cycles.push(deleteCycle);
												//pushing all to object
												deletedProjectDetails.push(deleteRelCyc);
											}
										}
										//For update project json
										delete updateProjectDetails[i].cycles[j];
										updateProjectDetails[i].cycles = updateProjectDetails[i].cycles.filter(function (n) {
												return n != null;
											});
									}
								} else if (objectType == 'string') {
									if (updateProjectDetails[i].cycles[j] == $("#" + deleteCycleId).parent().prev('span.cycleName').text()) {
										delete updateProjectDetails[i].cycles[j];
										updateProjectDetails[i].cycles = updateProjectDetails[i].cycles.filter(function (n) {
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
			
			adminServices.getDomains_ICE()
			.then(function (data) {
				if (data == "Invalid Session") {
					$rootScope.redirectPage();
				} else {
					$('#selDomainEdit').show()
					for (var i=0;i<data.length;i++){
						$("#selDomainEdit").append('<option value="'+data[i]+'">'+data[i]+'</option>')
					}
					$(document).on('change','#selDomainEdit', function() {
						$("#releaseList, #cycleList").empty()
						//$("#export_button").addClass("disableButton")
						document.getElementById("export_button").disabled = true;
						var domainName = $("#selDomainEdit option:selected").val();
						console.log(domainName)
						var requestedname = [];
						requestedname.push(domainName);
						var idtype = ["domaindetails"];
						var details = {
							"web":{"data":"Web","title":"Web","img":"web"},
							"webservice":{"data":"Webservice","title":"Web Service","img":"webservice"},
							"mainframe":{"data":"Mainframe","title":"Mainframe","img":"mainframe"},
							"desktop":{"data":"Desktop","title":"Desktop Apps","img":"desktop"},
							"oebs":{"data":"OEBS","title":"Oracle Apps","img":"oracleApps"},
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
						adminServices.getDetails_ICE(idtype, requestedname)
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
							document.getElementById("selProject").addEventListener('change', function (e) {
								document.getElementById("export_button").disabled = false;
								//$("#export_button").removeClass("disableButton")
							});
						}, function (error) {
							console.log("Error:::::::::::::", error);
						});
						clearUpdateProjectObjects();
					});
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
				case "OEBS":
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='OEBS'],.projectTypes_create[data-app='OEBS']").addClass("projectTypeSelected");
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
					$("#releaseList:not(.createRelBox)").append("<li class='updateRelease' id='releaseList_" + i + "'><img src='imgs/ic-release.png' /><span title=" + updateProjectDetails[i].name + " data-releaseid=" + updateProjectDetails[i].name + " class='releaseName'>" + updateProjectDetails[i].name + "</span><span class='actionOnHover'><img id=editReleaseName_" + i + " title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_" + i + " title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
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
		$("#userTab").find("span.fa").addClass("selectedIcon");
		this.userId = '';
		this.userName = '';
		this.userIdName = '';
		this.firstname = '';
		this.lastname = '';
		this.passWord = '';
		this.confirmPassword = '';
		this.email = '';
		this.role = '';
		this.addRole = {};
		this.nocreate = false;
		this.confExpired = false;
		this.getUserRoles();
		this.ldapUserFilter = '';
		this.allUserFilter = '';
		if (query != "retaintype") {
			this.type="inhouse";
			this.server = '';
			this.ldap = {fetch: "map", user: ''};
			this.confServerList=[];
			this.ldapAllUserList=[];
		}
	};

	//Fetch All Available User Roles
	$scope.userConf.getUserRoles = function() {
		if (this.allRoles && this.allRoles.length > 0) return true;
		adminServices.getUserRoles()
		.then(function (rolesRes) {
			if(rolesRes == "Invalid Session"){
				$rootScope.redirectPage();
			} else {
				rolesRes.sort(function(a,b){ return a[0] >  b[0]; });
				$scope.userConf.allRoles = rolesRes;
				$scope.userConf.allAddRoles = rolesRes.filter((e)=> (e[0].toLowerCase() != "admin"));
			}
		}, function (error) {
			$scope.userConf.allRoles = [];
			openModalPopup("Manage Users", "Something Went Wrong");
		});
	};

	$scope.userConf.validate = function(action) {
		var flag = true;
		$("#userName,#firstname,#lastname,#password,#confirmPassword,#email,#ldapDirectory").removeClass("inputErrorBorder");
		$("#userIdName,#userRoles,#confServer,#ldapDirectory").removeClass("selectErrorBorder");
		var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		//var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,16}$/;
		var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
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
		if (this.firstname == "") {
			$("#firstname").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.lastname == "") {
			$("#lastname").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.type!="inhouse") {
			if (this.server == "") {
				$("#confServer").addClass("selectErrorBorder");
				flag = false;
			}
			if (this.confExpired && action != "delete") {
				if (!popupOpen) openModalPopup("Error", "This configuration is deleted/invalid...");
				popupOpen = true;
				$("#confServer").addClass("selectErrorBorder");
				flag = false;
			}
		}
		if (this.type=="ldap" && this.ldap.user == "") {
			$("#ldapDirectory").addClass("selectErrorBorder");
			flag = false;
		}
		if (this.type=="inhouse" && action != "delete" && !(action == "update" && this.passWord == "" && this.confirmPassword == "")) {
			if (this.passWord == "") {
				$("#password").addClass("inputErrorBorder");
				flag = false;
			} else if (!regexPassword.test(this.passWord)) {
				if (!popupOpen) openModalPopup("Error", "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");
				popupOpen = true;
				$("#password").addClass("inputErrorBorder");
				flag = false;
			}
			if (this.confirmPassword == "") {
				$("#confirmPassword").addClass("inputErrorBorder");
				flag = false;
			} else if (!regexPassword.test(this.confirmPassword)) {
				if (!popupOpen) openModalPopup("Error", "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");
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
	$scope.userConf.manage = function(action, $event) {
		//Transaction Activity for Create/ Update/ Delete User button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['UserConfmanage']);
		// infoArr.push(action);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);

		const userConf = $scope.userConf;
		if (!userConf.validate(action)) return;
		const bAction = action.charAt(0).toUpperCase() + action.substr(1);
		const uType = userConf.type;
		const addRole = [];
		for (let role in userConf.addRole) {
			if (userConf.addRole[role]) addRole.push(role);
		}
		const createdbyrole = userConf.allRoles.filter((e)=> (e[0].toLowerCase() == "admin"));;
		var userObj = {
			userid: userConf.userId,
			username: userConf.userName.toLowerCase(),
			password: userConf.passWord,
			firstname: userConf.firstname,
			lastname: userConf.lastname,
			email: userConf.email,
			role: userConf.role,
			addRole: addRole,
			type: uType,
			createdbyrole: createdbyrole,
			server: userConf.server
		};
		if (uType=="ldap") userObj.ldapUser = userConf.ldap.user;
		blockUI(bAction.slice(0,-1)+"ing User...");
		adminServices.manageUserDetails(action, userObj)
		.then(function (data) {
			unblockUI();
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "success") {
				if (action == "create") $scope.userConf.click();
				else $scope.userConf.edit();
				openModalPopup(bAction+" User", "User "+action+"d successfully!");
				if (action == "delete") {
					adminServices.manageSessionData('logout', userObj.username, '?', 'dereg').then(function (data) {
						if (data == "Invalid Session") return $rootScope.redirectPage();
					}, function (error) {});
					adminServices.fetchICE(userObj.userid).then(function (data) {
						if (data == "Invalid Session") return $rootScope.redirectPage();
						if (data.length == 0) return false;
						const icename = data[0].icename;
						adminServices.manageSessionData('disconnect', icename, '?', 'dereg').then(function (data) {
							if (data == "Invalid Session") return $rootScope.redirectPage();
						}, function (error) {});
					}, function (error) {});
				}
			} else if(data == "exists") {
				$("#userName").addClass("inputErrorBorder");
				openModalPopup(bAction+" User", "User already Exists!");
			} else if(data == "fail") {
				if (action == "create") $scope.userConf.click();
				else $scope.userConf.edit();
				openModalPopup(bAction+" User", "Failed to "+action+" user.");
			} else if(/^2[0-4]{8}$/.test(data)) {
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
				if (parseInt(data[7])) errfields.push("Authentication Server");
				if (parseInt(data[8])) errfields.push("User Domain Name");
				openModalPopup(bAction+" User", "Following values are invalid: "+errfields.join(", "));
			}
		}, function (error) {
			unblockUI();
			openModalPopup(bAction+" User", "Failed to "+action+" user.");
			console.log("Error:::", error);
		});
	};

	// Switch between multiple usertypes.
	$scope.userConf.selectUserType = async ($event) => {
		$scope.userConf.server = '';
		$scope.userConf.confServerList = [];
		if ($scope.userConf.type == "ldap") await $scope.userConf.populateLDAPConf();
		else if ($scope.userConf.type == "saml") await $scope.userConf.populateSAMLConf();
		else if ($scope.userConf.type == "oidc") await $scope.userConf.populateOIDCConf();
	};

	// Fetch LDAP servers for User
	$scope.userConf.populateLDAPConf = async () => {
		$scope.userConf.ldap = {fetch: "map", user: ''};
		$scope.userConf.nocreate = true;
		blockUI("Fetching LDAP Server configurations...");
		return new Promise((rsv, rej) => {
			adminServices.getLDAPConfig("server").then(function(data) {
				unblockUI();
				if(data == "Invalid Session") $rootScope.redirectPage();
				else if(data == "fail") openModalPopup("Create User", "Failed to fetch LDAP server configurations.");
				else if(data == "empty") openModalPopup("Create User","There are no LDAP server configured. To proceed create a server configuration in LDAP configuration section.");
				else {
					$scope.userConf.nocreate = false;
					data.sort((a,b)=>a.name.localeCompare(b.name));
					$scope.userConf.confServerList = data
				}
				rsv(true);
			}, function (error) {
				unblockUI();
				console.log("Error:::::::::::::", error);
				openModalPopup("Create User", "Failed to fetch LDAP server configurations");
				rsv(false);
			});
		});
	};

	// Fetch SAML servers for User
	$scope.userConf.populateSAMLConf = async () => {
		$scope.userConf.nocreate = true;
		blockUI("Fetching SAML Server configurations...");
		return new Promise((rsv, rej) => {
			adminServices.getSAMLConfig().then(function(data){
				unblockUI();
				if(data == "Invalid Session") $rootScope.redirectPage();
				else if(data == "fail") openModalPopup("Create User", "Failed to fetch SAML server configurations.");
				else if(data == "empty") openModalPopup("Create User","There are no SAML server configured. To proceed create a server configuration in SAML configuration section.");
				else {
					$scope.userConf.nocreate = false;
					data.sort((a,b)=>a.name.localeCompare(b.name));
					$scope.userConf.confServerList = data
				}
				rsv(true);
			}, function (error) {
				unblockUI();
				console.log("Error:::::::::::::", error);
				openModalPopup("Create User", "Failed to fetch SAML server configurations");
				rsv(false);
			});
		});
	};

	// Fetch OIDC servers for User
	$scope.userConf.populateOIDCConf = async () => {
		$scope.userConf.nocreate = true;
		blockUI("Fetching OpenID Server configurations...");
		return new Promise((rsv, rej) => {
			adminServices.getOIDCConfig()
			.then(function(data) {
				unblockUI();
				if(data == "Invalid Session") $rootScope.redirectPage();
				else if(data == "fail") openModalPopup("Create User", "Failed to fetch OpenID server configurations.");
				else if(data == "empty") openModalPopup("Create User","There are no OpenID server configured. To proceed create a server configuration in OpenID configuration section.");
				else {
					$scope.userConf.nocreate = false;
					data.sort((a,b)=>a.name.localeCompare(b.name));
					$scope.userConf.confServerList = data
				}
				rsv(true);
			}, function (error) {
				unblockUI();
				console.log("Error:::::::::::::", error);
				openModalPopup("Create User", "Failed to fetch OpenID server configurations");
				rsv(false);
			});
		});
	};

	$scope.userConf.clearForm = function(retainExtra) {
		this.userName = '';
		this.firstname = '';
		this.lastname = '';
		this.email = '';
		if (!retainExtra && this.type == "ldap") {
			this.ldap.user = '';
			this.ldap.fetch = 'map';
		}
	};

	//LDAP Functionality for User: Switch choice between import and map
	$scope.userConf.ldapSwitchFetch = function() {
		this.ldapUserFilter = '';
		this.ldap.user = '';
		this.clearForm(true);
		$("#ldapDirectory").removeClass("inputErrorBorder").removeClass("selectErrorBorder");
		if (this.ldap.fetch != "import") return false;
		const ldapServer = this.server;
		$scope.userConf.nocreate = true;
		$scope.userConf.ldapAllUserList=[];
		blockUI("Fetching LDAP users...");
		adminServices.getLDAPConfig("user", ldapServer)
		.then(function(data) {
			unblockUI();
			if(data == "Invalid Session") $rootScope.redirectPage();
			else if(data == "fail")  openModalPopup("Create User", "Failed to LDAP fetch users");
			else if(data == "insufficient_access") openModalPopup("Create User", "Either Credentials provided in LDAP server configuration does not have required privileges for fetching users or there are no users available in this Server");
			else if(data == "empty") openModalPopup("Create User","There are no users available in this Server.");
			else {
				$scope.userConf.nocreate = false;
				data.sort((a,b)=>a[0].localeCompare(b[0]));
				$scope.userConf.ldapAllUserList = data.map(e=>({value:e[1],html:e[0]}));
			}
		}, function (error) {
			unblockUI();
			console.log("Error:::::::::::::", error);
			openModalPopup("Create User", "Failed to fetch LDAP server configurations");
		});
	};

	//LDAP Functionality for User: Verify and Fetch user details from ldapdb
	$scope.userConf.ldapGetUser = function() {
		const ldapUser = this.ldap.user;
		const ldapServer = this.server;
		this.nocreate = true;
		if (this.ldap.user == '') {
			$("#ldapDirectory").addClass("inputErrorBorder");
			return;
		}
		this.clearForm(true);
		const userConf = $scope.userConf;
		blockUI("Fetching User details...");
		adminServices.getLDAPConfig("user", ldapServer, ldapUser)
		.then(function(data){
			unblockUI();
			if(data == "Invalid Session") $rootScope.redirectPage();
			else if(data == "fail") openModalPopup("Create User", "Failed to populate User details");
			else if(data == "insufficient_access") openModalPopup("Create User", "Either Credentials provided in LDAP server configuration does not have required privileges for fetching users or there is no such user");
			else if(data == "empty") openModalPopup("Create User","User not found!");				
			else {
				userConf.nocreate = false;
				if ($scope.tab !== "editUser") userConf.userName = data.username;
				userConf.firstname = data.firstname;
				userConf.lastname = data.lastname;
				userConf.email = data.email;
				userConf.ldap.user = data.ldapname;
			}
		}, function (error) {
			unblockUI();
			console.log("Error:::::::::::::", error);
			openModalPopup("Create User", "Failed to fetch LDAP server configurations");
		});
	};

	//Load Users for Edit
	$scope.userConf.edit = function() {
		this.click();
		$scope.tab = "editUser";
		$scope.userConf.fType = "Default";
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
				data.sort((a,b) => a[0].localeCompare(b[0]));
				$scope.userConf.allUsersList = data;
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Edit User", "Failed to fetch users.");
		});
	};

	//Get Selected User Data
	$scope.userConf.getUserData = function() {
		const userObj = this.userIdName.split(';');
		this.userId = userObj[0];
		this.userName = userObj[1];
		var userConf = $scope.userConf;
		var failMsg = "Failed to fetch user details.";
		blockUI("Fetching User details...");
		adminServices.getUserDetails("userid", userObj[0])
		.then(async data => {
			unblockUI();
			if(data == "Invalid Session") $rootScope.redirectPage();
			else if(data == "fail") openModalPopup("Edit User", failMsg);
			else {
				const uType = data.type;
				userConf.userId = data.userid;
				userConf.userName = data.username;
				userConf.userIdName = data.userid+";"+data.username;
				userConf.passWord = data.password;
				userConf.firstname = data.firstname;
				userConf.lastname = data.lastname;
				userConf.email = data.email;
				userConf.role = data.role;
				userConf.rolename = data.rolename;
				userConf.addRole = {};
				data.addrole.forEach((e) => userConf.addRole[e] = true);
				userConf.type = uType;
				userConf.confExpired = false;
				userConf.fType = (uType=="inhouse")? "Default":((uType=="oidc")? "OpenID":uType.toUpperCase());
				if (data.type != "inhouse") {
					var confserver = data.server;
					await $scope.userConf.selectUserType();
					if (!userConf.confServerList.some(function(e) { return e.name == confserver;})) {
						userConf.confServerList.push({_id: '', name: confserver});
						userConf.confExpired = confserver;
					}
					userConf.server = confserver;
					userConf.ldap.user = data.ldapuser || '';
					$scope.$apply();
				}
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Edit User", failMsg);
		});
	};

	//Delete User Data: Confirmation
	$scope.userConf.delete = function (action) {
		openDeleteGlobalModal("Delete User", "delUserConf", "Are you sure you want to delete ? All task assignment information and ICE provisions will be deleted for this user.");
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
			roleOpt.hide();
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
		// Block all characters except hyphen, alphabet, digit
		if (['ldapServerName', 'samlServerName', 'oidcServerName'].includes(e.target.id)) {
			if (([32,59,61,106,107,109,111,173,186,187,188,190,191,192,219,220,221,222].indexOf(e.keyCode) > -1) ||
			 e.shiftKey && (e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode == 189))
				return false;
			return true;
		}
		// Block all characters except _ . a-Z 0-9 - [ ] { } ! @ # $ ^ & . space
		if (([59, 61, 106, 107, 109, 111, 173, 186, 187, 188, 191, 192, 220, 222].indexOf(e.keyCode) > -1) || e.shiftKey && ([48, 53, 56, 57, 190].indexOf(e.keyCode) > -1))
			return false;
		else
			return true;
		// Block all characters except underscore, alphabet, digit, space, dot
		/*if (([59,61,106,107,109,111,173,186,187,188,191,192,219,220,221,222].indexOf(e.keyCode) > -1) || !e.shiftKey && e.keyCode == 189 || e.shiftKey && (e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode == 190)) return false;
		else {
		if (e.target.id == "userName" && e.keyCode == 32) return false;
		if ((e.target.id == "firstname" || e.target.id == "lastname") && (([32,110,189,190].indexOf(e.keyCode) > -1) || e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode >= 96 && e.keyCode <= 105)) return false;
		return true;
		}*/
	});

	// All Special characters prevented on cut copy paste
	$(document).on('cut copy paste', '.preventSpecialChar', function (e) {
		var element = $(this);
		setTimeout(function () {
			var userEnteredText = element.val();
			var regex;
			if (e.target.id == 'userName' || e.target.id == 'icename')
				regex = /[\\\~`|;:"',<>?/\s]/g;
			else if (e.target.id == 'ldapServerURL')
				regex = /[\\\[\]\~`!@#$%^&*()+={}|;"',<>?\s]/g;
			else if (['projectName', 'releaseTxt', 'cycleTxt', 'releaseName', 'cycleName'].includes(e.target.id))
				regex = /[-\\\[\]\~`!@#$%^&*()+={}|;:"',.<>?/\s]/g;
			else if (['ldapServerName', 'samlServerName', 'oidcServerName'].includes(e.target.id))
				regex = /[\\\[\]\~`!@#$%^&*()_+=\{\}|;:"',.<>?/\s]/g;
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
		mainModal.find('.modal-body p').html(body);
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
	function openDeleteGlobalModal(title, buttonID, content) {
		var delModal = $("#deleteGlobalModal");
		delModal.find('.modal-title').text(title);
		delModal.find('button.btnGlobalYes').prop("id", buttonID);
		delModal.find('.modal-body').find('p').text(content);
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
		$("#ldapConfigTab").find("span.fa").addClass("selectedIcon");
		this.serverName = "";
		this.url = "";
		this.auth = "anonymous";
		this.binddn = "";
		this.bindCredentials = "";
		this.basedn = "";
		this.cert = "";
		this.certName = "No file choosen";
		this.secure = "false";
		this.fieldmap = {uname: "", fname: "", lname: "", email: ""};
		this.fieldMapOpts = ["None"];
		if (action == "edit") this.auth = "";
		this.testStatus = "false";
		this.urlToolTip = "Directory Provider URL (Eg: ldap://example.com:389)";
		this.baseDNToolTip = "Base Domain Name (Eg: DC=EXAMPLE,DC=COM)";
		this.certToolTip = "TLS certificate for secure connection";
		this.switchAuthType();
		this.switchSecureUrl();
		$("#ldapServerURL,#binddn,#bindCredentials,#ldapBaseDN").removeClass("inputErrorBorder");
		$("#ldapFMapUname,#ldapFMapFname,#ldapFMapLname,#ldapFMapEmail").removeClass("selectErrorBorder");
		$("#ldapCert").removeClass("inputErrorText");
	};

	$scope.ldapConf.validate = function(action) {
		let flag = true;
		let popped = false;
		const secure = this.secure != "false";
		$("#ldapServerURL,#binddn,#bindCredentials,#ldapBaseDN").removeClass("inputErrorBorder");
		$("#ldapFMapUname,#ldapFMapFname,#ldapFMapLname,#ldapFMapEmail").removeClass("selectErrorBorder");
		$("#ldapCert").removeClass("inputErrorText");
		let nameErrorClass = (action == "update")? "selectErrorBorder":"inputErrorBorder";
		$("#ldapServerName").removeClass(nameErrorClass);
		const regExName = /^[A-Za-z0-9]+([A-Za-z0-9-]*[A-Za-z0-9]+|[A-Za-z0-9]*)$/;
		let regExURL = /^ldap:\/\/[A-Za-z0-9.-]+:\d+$/;
		if (secure) regExURL = /^ldaps:\/\/[A-Za-z0-9.-]+:\d+$/;
		if (this.serverName == "") {
			$("#ldapServerName").addClass(nameErrorClass);
			flag = false;
		} else if (!regExName.test(this.serverName) && action == "create") {
			$("#ldapServerName").addClass("inputErrorBorder");
			openModalPopup("Error", "Invalid Server Name provided! Name cannot contain any special characters other than hyphen. Also name cannot start or end with hyphen.");
			flag = false;
			popped = true;
		}
		if (this.url == "") {
			$("#ldapServerURL").addClass("inputErrorBorder");
			flag = false;
		} else if (!regExURL.test(this.url)) {
			$("#ldapServerURL").addClass("inputErrorBorder");
			if (!popped) openModalPopup("Error", "Invalid URL provided! URL must start with 'ldap"+((secure)?'s':'')+"://' followed by either an IP or a well defined domain name followed by a port number.");
			flag = false;
			popped = true;
		}
		if (this.basedn == "") {
			$("#ldapBaseDN").addClass("inputErrorBorder");
			flag = false;
		}
		if (secure && this.cert == "") {
			$("#ldapCert").addClass("inputErrorText");
			flag = false;
		}
		if (this.binddn == "" && this.auth == "simple") {
			$("#binddn").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.bindCredentials == "" && this.auth == "simple" && action == "create") {
			$("#bindCredentials").addClass("inputErrorBorder");
			flag = false;
		}
		if (action != "test" && action != "delete") {
			if (this.fieldmap.uname == "") {
				$("#ldapFMapUname").addClass("selectErrorBorder");
				flag = false;
			}
			if (this.fieldmap.fname == "") {
				$("#ldapFMapFname").addClass("selectErrorBorder");
				flag = false;
			}
			if (this.fieldmap.lname == "") {
				$("#ldapFMapLname").addClass("selectErrorBorder");
				flag = false;
			}
			if (this.fieldmap.email == "") {
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
			url: ldapConf.url,
			basedn: ldapConf.basedn,
			secure: ldapConf.secure,
			cert: ldapConf.cert,
			auth: ldapConf.auth,
			binddn: ldapConf.binddn,
			bindcredentials: ldapConf.bindCredentials,
			fieldmap: ldapConf.fieldmap
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
				openModalPopup(bAction+" Configuration", "Configuration '"+confObj.name+"' "+action+"d Successfully!");
			} else if(data == "exists") {
				$("#ldapServerName").addClass("inputErrorBorder");
				openModalPopup(bAction+" Configuration", "Configuration '"+confObj.name+"' already Exists!");
			} else if(data == "fail") {
				if (action == "create") $scope.ldapConf.click();
				else $scope.ldapConf.edit();
				openModalPopup(bAction+" Configuration", "Failed to "+action+" '"+confObj.name+"' configuration.");
			} else if(/^1[0-7]{8}$/.test(data)) {
				if (parseInt(data[1])) {
					openModalPopup(bAction+" Configuration", "Failed to "+action+" '"+confObj.name+"' configuration. Invalid Request!");
					return;
				}
				var errfields = [];
				var errHints = [];
				if (parseInt(data[2])) errfields.push("Server Name");
				if (parseInt(data[3])) errfields.push("Server URL");
				if (parseInt(data[3]) == 2) errHints.push("Secure Connection needs 'ldaps' protocol");
				else if (parseInt(data[3]) == 3) errHints.push("Secure Connection needs a TLS Certificate");
				else if (parseInt(data[3]) == 4) errHints.push("'ldaps' protocol needs secure connection enabled");
				else if (parseInt(data[3]) == 5) errHints.push("'ldap(s)://' is missing from url prefix");
				if (parseInt(data[4])) errfields.push("Base Domain Name");
				if (parseInt(data[5])) errfields.push("Authentication Type");
				if (parseInt(data[6])) errfields.push("Authentication Principal");
				if (parseInt(data[7])) errfields.push("Authentication Credentials");
				if (parseInt(data[8])) errfields.push("Data Mapping Settings");
				openModalPopup(bAction+" Configuration", "Following values are invalid: "+errfields.join(", ")+ (errHints.length!=0)? (". Note: "+errHints):'.');
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
					selBox.append("<option value=\""+data[i].name+"\">"+data[i].name+"</option>");
				}
				selBox.prop("selectedIndex", 0);
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Edit Configuration", "Failed to fetch configurations.");
		});
	};

	$scope.ldapConf.delete = function (action) {
		openDeleteGlobalModal("Delete Configuration", "delLdapConf", "Are you sure you want to delete ? Users depending on this configuration will not be able to login.");
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
				ldapConf.basedn = data.basedn;
				ldapConf.secure = data.secure;
				ldapConf.cert = data.cert;
				ldapConf.certName = "No file choosen";
				ldapConf.auth = data.auth;
				ldapConf.binddn = data.binddn;
				ldapConf.bindCredentials = data.bindCredentials;
				ldapConf.fieldMapOpts = ["None"]
				for (let fmo of Object.values(data.fieldmap)) {
					if (!ldapConf.fieldMapOpts.includes(fmo)) ldapConf.fieldMapOpts.push(fmo);
				}
				ldapConf.fieldmap = data.fieldmap;
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
		blockUI("Testing Connection...");
		adminServices.testLDAPConnection(this.auth, this.url, this.basedn, this.binddn, this.bindCredentials, this.secure, this.cert)
		.then(function(data){
			unblockUI();
			var fields = (typeof data=="string")? [] : (data.fields || []);
			if (typeof data!="string") data = data.flag;
			$scope.ldapConf.testStatus = data;
			if(data == "Invalid Session") {
				$(".modal-backdrop").remove();
				$rootScope.redirectPage();
			} else if(data == "success") {
				openModalPopup("Test Connection", "Test Connection Successful!");
				fields = fields.concat("None");
				for (let fmo of $scope.ldapConf.fieldMapOpts) {
					if (!fields.includes(fmo)) fields.push(fmo);
				}
				$scope.ldapConf.fieldMapOpts = fields.sort();
			} else if(data == "invalid_addr") openModalPopup("Test Connection", "Test Connection Failed! Either host is unavailable or port is incorrect.");
			else if(data == "mismatch_secure") openModalPopup("Test Connection", "Test Connection Failed! Secure connection must be enabled for 'ldaps' protocol.");
			else if(data == "invalid_cert") openModalPopup("Test Connection", "Test Connection Failed! 'ldaps://' protocol require TLS Certificate.");
			else if(data == "invalid_cacert") openModalPopup("Test Connection", "Test Connection Failed! TLS Certificate should have full certificate chain including issuer CA certificate.");
			else if(data == "invalid_cacert_host") openModalPopup("Test Connection", "Test Connection Failed! Hostname/IP provided for connection is not in the TLS Certificate's list.");
			else if(data == "invalid_url") openModalPopup("Test Connection", "Test Connection Failed! Invalid URL. It must start with 'ldap://'");
			else if(data == "invalid_auth") openModalPopup("Test Connection", "Test Connection Success! Anonymous access is not allowed for this server.");
			else if(data == "invalid_credentials") openModalPopup("Test Connection", "Test Connection Failed! Credentials provided for Authentication are invalid.");
			else if(data == "insufficient_access") openModalPopup("Test Connection", "Test Connection Failed! Credentials provided does not have required privileges for setting up LDAP.");
			else if(data == "invalid_basedn") openModalPopup("Test Connection", "Test Connection Failed! Base Domain Name is incorrect.");
			else if(data == "empty") openModalPopup("Test Connection", "Test Connection Successful but LDAP directory is empty!");
			else if(data == "fail") openModalPopup("Test Connection", "Test Connection Failed!");
			else openModalPopup("Test Connection", "Test Connection Failed due to unexpected error!");
		}, function (error) {
			unblockUI();
			openModalPopup("Test Connection", "Test Connection Failed!");
		});
	};

	$scope.ldapConf.switchAuthType = function() {
		if(this.auth == "anonymous") {
			this.binddn = "";
			this.bindCredentials = "";
		}
	};

	$scope.ldapConf.switchSecureUrl = function() {
		this.url = this.url.trim();
		if(this.secure == "false") {
			this.cert = "";
			this.certName = "No file choosen";
			if (this.url.toLowerCase().startsWith("ldaps://")) this.url = "ldap://" + this.url.slice(8);
			if (this.url.toLowerCase().endsWith(":636")) this.url = this.url.slice(0,-3) + "389";
		} else {
			if (this.url.toLowerCase().startsWith("ldap://")) this.url = "ldaps://" + this.url.slice(7);
			if (this.url.toLowerCase().endsWith(":389")) this.url = this.url.slice(0,-3) + "636";
		}
	};

	$scope.samlConf.click = function (action) {
		$(".selectedIcon").removeClass("selectedIcon");
		$("#samlConfigTab").find("span.fa").addClass("selectedIcon");
		this.name = "";
		this.url = "";
		this.idp = "";
		this.cert = "";
		this.certName = "No file choosen";
		this.urlToolTip = "Single Sign-On URL (SAML assertion URL)"
		this.idpToolTip = "Identity Issuer (Can be text or URL)"
		this.certToolTip = "X.509 certificate issued by provider"
		$("#samlAcsUrl,#samlIDP").removeClass("inputErrorBorder");
		$("#samlCert").removeClass("inputErrorText");
		var nameErrorClass = (action == "update")? "selectErrorBorder":"inputErrorBorder";
		$("#samlServerName").removeClass(nameErrorClass);
	};

	$scope.samlConf.validate = function(action) {
		let flag = true;
		let popped = false;
		$("#samlAcsUrl,#samlIDP,#samlServerName").removeClass("inputErrorBorder");
		$("#samlCert").removeClass("inputErrorText");
		$("#samlServerName").removeClass("selectErrorBorder");
		const regExName = /^[A-Za-z0-9]+([A-Za-z0-9-]*[A-Za-z0-9]+|[A-Za-z0-9]*)$/;
		const regExURL = /^http[s]?:\/\/[A-Za-z0-9._-].*$/i;
		const nameErrorClass = (action == "update")? "selectErrorBorder":"inputErrorBorder";
		if (this.name == "") {
			$("#samlServerName").addClass(nameErrorClass);
			flag = false;
		} else if (!regExName.test(this.name) && action == "create") {
			$("#samlServerName").addClass("inputErrorBorder");
			openModalPopup("Error", "Invalid Server Name provided! Name cannot contain any special characters other than hyphen. Also name cannot start or end with hyphen.");
			flag = false;
			popped = true;
		}
		if (this.url == "") {
			$("#samlAcsUrl").addClass("inputErrorBorder");
			flag = false;
		} else if (regExURL.test(this.url) == false) {
			$("#samlAcsUrl").addClass("inputErrorBorder");
			if (!popped) openModalPopup("Error", "Invalid URL provided! URL must start with http:// or https://");
			flag = false;
			popped = true;
		}
		if (this.idp == "") {
			$("#samlIDP").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.cert == "") {
			$("#samlCert").addClass("inputErrorText");
			flag = false;
		}
		return flag;
	};

	$scope.samlConf.manage = function (action,$event) {
		const samlConf = $scope.samlConf;
		if (!samlConf.validate(action)) return;
		const bAction = action.charAt(0).toUpperCase() + action.substr(1);
		var confObj = {
			name: samlConf.name,
			url: samlConf.url,
			idp: samlConf.idp,
			cert: samlConf.cert
		};
		const popupTitle = bAction+" SAML Configuration";
		const failMsg = "Failed to "+action+" '"+confObj.name+"' configuration.";
		blockUI(bAction.slice(0,-1)+"ing configuration...");
		//Transaction Activity for Create/ Update/ Delete SAML conf button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['SamlConfmanage']);
		// infoArr.push(action);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
		adminServices.manageSAMLConfig(action, confObj).then(function(data){
			unblockUI();
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "success") {
				if (action == "create") $scope.samlConf.click();
				else $scope.samlConf.edit();
				openModalPopup(popupTitle, "Configuration '"+confObj.name+"' "+action+"d successfully!");
			} else if(data == "exists") {
				$("#samlServerName").addClass("inputErrorBorder");
				openModalPopup(popupTitle, "Configuration '"+confObj.name+"' already Exists!");
			} else if(data == "fail") {
				if (action == "create") $scope.samlConf.click();
				else $scope.samlConf.edit();
				openModalPopup(popupTitle, failMsg);
			} else if(/^1[0-2]{4}$/.test(data)) {
				if (parseInt(data[1])) {
					openModalPopup(popupTitle, failMsg+" Invalid Request!");
					return;
				}
				const errHints = "<br/>";
				if (parseInt(data[2])) $("#samlServerName").addClass("inputErrorBorder");
				if (parseInt(data[3])) $("#samlAcsUrl").addClass("inputErrorBorder");
				if (parseInt(data[3]) == 2) errHints += "Single Sign-On URL must start with http:// or https://<br/>";
				if (parseInt(data[4])) $("#samlIDP").addClass("inputErrorBorder");
				if (parseInt(data[5])) $("#samlCert").addClass("inputErrorText");
				if (parseInt(data[5]) == 2) errHints += "File uploaded is not a valid certificate";
				openModalPopup(popupTitle, "Some values are Invalid!" + errHints);
			}
		}, function (error) {
			unblockUI();
			openModalPopup(popupTitle, failMsg);
		});
	};

	$scope.samlConf.edit = function () {
		$scope.tab = "tabsamlConfigEdit";
		$scope.samlConf.click("edit");
		blockUI("Fetching details...");
		adminServices.getSAMLConfig()
		.then(function(data) {
			unblockUI();
			if(data == "Invalid Session") return $rootScope.redirectPage();
			else if(data == "fail") openModalPopup("Edit Configuration", "Failed to fetch configurations.");
			else if(data == "empty") {
				openModalPopup("Edit Configuration", "There are no configurations created yet.");
				const selBox = $("#samlServerName");
				selBox.empty();
				selBox.append("<option value='' disabled selected>Select Server</option>");
				selBox.prop("selectedIndex", 0);
			} else {
				data.sort(function(a,b){ return a > b; });
				const selBox = $("#samlServerName");
				selBox.empty();
				selBox.append("<option value='' disabled selected>Select Server</option>");
				for(var i = 0; i < data.length; i++){
					selBox.append("<option value='"+data[i].name+"'>"+data[i].name+"</option>");
				}
				selBox.prop("selectedIndex", 0);
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Edit Configuration", "Failed to fetch configurations.");
		});
	};

	$scope.samlConf.delete = function (action) {
		openDeleteGlobalModal("Delete Configuration", "delSamlConf", "Are you sure you want to delete ? Users depending on this configuration will not be able to login.");
	};

	$(document).on('click','#delSamlConf', function(e) {
		hideDeleteGlobalModal();
		$scope.samlConf.manage("delete", e);
	});

	$(document).on('change','#certInput', function(event) {
		const target = event && (event.srcElement || event.target) || null;
		const targetFile = target && target.files[0] || null;
		if (targetFile == null) return;
		var conf = (target.name.includes('ldap'))? $scope.ldapConf:$scope.samlConf;
		conf.certName = targetFile.name;
		var reader = new FileReader();
		reader.onload = function(e) {
			conf.cert = (e && e.target.result)? e.target.result : this.content;
			$scope.$apply();
		};
		reader.readAsBinaryString(targetFile);
		target.value = '';
	});

	$scope.samlConf.getServerData = function () {
		const name = $scope.samlConf.name;
		const failMsg = "Failed to fetch details for '"+name+"' configuration.";
		blockUI("Fetching details...");
		adminServices.getSAMLConfig(name)
		.then(function(data){
			unblockUI();
			if(data == "Invalid Session") return $rootScope.redirectPage();
			else if(data == "fail") openModalPopup("Edit Configuration", failMsg);
			else if(data == "empty") openModalPopup("Edit Configuration", failMsg + "No such configuration exists");
			else {
				$scope.samlConf.url = data.url;
				$scope.samlConf.idp = data.idp;
				$scope.samlConf.cert = data.cert;
				$scope.samlConf.certName = "No file choosen";
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Edit Configuration", failMsg);
		});
	};

	$scope.oidcConf.click = function (action) {
		$(".selectedIcon").removeClass("selectedIcon");
		$("#oidcConfigTab").find("span.fa").addClass("selectedIcon");
		this.name = "";
		this.url = "";
		this.clientId = "";
		this.secret = "";
		this.idToolTip = "Public identifier for the client"
		this.secretToolTip = "Secret used by the client to exchange an authorization code for a token"
		$("#oidcUrl,#oidcClientId,#oidcClientSecret").removeClass("inputErrorBorder");
		var nameErrorClass = (action == "update")? "selectErrorBorder":"inputErrorBorder";
		$("#oidcServerName").removeClass(nameErrorClass);
	};

	$scope.oidcConf.validate = function(action) {
		let flag = true;
		let popped = false;
		$("#oidcUrl,#oidcClientId,#oidcClientSecret,#oidcServerName").removeClass("inputErrorBorder");
		$("#oidcServerName").removeClass("selectErrorBorder");
		const regExName = /^[A-Za-z0-9]+([A-Za-z0-9-]*[A-Za-z0-9]+|[A-Za-z0-9]*)$/;
		const regExURL = /^http[s]?:\/\/[A-Za-z0-9._-].*$/i;
		const nameErrorClass = (action == "update")? "selectErrorBorder":"inputErrorBorder";
		if (this.name == "") {
			$("#oidcServerName").addClass(nameErrorClass);
			flag = false;
		} else if (!regExName.test(this.name) && action == "create") {
			$("#oidcServerName").addClass("inputErrorBorder");
			openModalPopup("Error", "Invalid Server Name provided! Name cannot contain any special characters other than hyphen. Also name cannot start or end with hyphen.");
			flag = false;
			popped = true;
		}
		if (this.url == "") {
			$("#oidcUrl").addClass("inputErrorBorder");
			flag = false;
		} else if (regExURL.test(this.url) == false) {
			$("#oidcUrl").addClass("inputErrorBorder");
			if (!popped) openModalPopup("Error", "Invalid URL provided! URL must start with http:// or https://");
			flag = false;
			popped = true;
		}
		if (this.clientId == "") {
			$("#oidcClientId").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.secret == "") {
			$("#oidcClientSecret").addClass("inputErrorBorder");
			flag = false;
		}
		return flag;
	};

	$scope.oidcConf.manage = function (action,$event) {
		const oidcConf = $scope.oidcConf;
		if (!oidcConf.validate(action)) return;
		const bAction = action.charAt(0).toUpperCase() + action.substr(1);
		var confObj = {
			name: oidcConf.name,
			url: oidcConf.url,
			clientid: oidcConf.clientId,
			secret: oidcConf.secret
		};
		const popupTitle = bAction+" OIDC Configuration";
		const failMsg = "Failed to "+action+" '"+confObj.name+"' configuration.";
		blockUI(bAction.slice(0,-1)+"ing configuration...");
		//Transaction Activity for Create/ Update/ Delete OIDC conf button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['OidcConfmanage']);
		// infoArr.push(action);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
		adminServices.manageOIDCConfig(action, confObj)
		.then(function(data){
			unblockUI();
			if(data == "Invalid Session") {
				$rootScope.redirectPage();
			} else if(data == "success") {
				if (action == "create") $scope.oidcConf.click();
				else $scope.oidcConf.edit();
				openModalPopup(popupTitle, "Configuration '"+confObj.name+"' "+action+"d successfully!");
			} else if(data == "exists") {
				$("#oidcServerName").addClass("inputErrorBorder");
				openModalPopup(popupTitle, "Configuration '"+confObj.name+"' already Exists!");
			} else if(data == "fail") {
				if (action == "create") $scope.oidcConf.click();
				else $scope.oidcConf.edit();
				openModalPopup(popupTitle, "Failed to "+action+" '"+confObj.name+"' configuration.");
			} else if(/^1[0-3]{4}$/.test(data)) {
				if (parseInt(data[1])) {
					openModalPopup(popupTitle, failMsg+" Invalid Request!");
					return;
				}
				const errHints = "<br/>";
				if (parseInt(data[2])) $("#oidcServerName").addClass("inputErrorBorder");
				if (parseInt(data[3])) $("#oidcUrl").addClass("inputErrorBorder");
				if (parseInt(data[3]) == 2) errHints += "Issuer must start with http:// or https://<br/>";
				if (parseInt(data[4])) $("#oidcClientId").addClass("inputErrorBorder");
				if (parseInt(data[5])) $("#oidcClientSecret").addClass("inputErrorText");
				openModalPopup(popupTitle, "Some values are Invalid!" + errHints);
			}
		}, function (error) {
			unblockUI();
			openModalPopup(popupTitle, failMsg);
		});
	};

	$scope.oidcConf.edit = function () {
		$scope.tab = "taboidcConfigEdit";
		$scope.oidcConf.click("edit");
		blockUI("Fetching details...");
		adminServices.getOIDCConfig()
		.then(function(data){
			unblockUI();
			if(data == "Invalid Session") return $rootScope.redirectPage();
			else if(data == "fail") openModalPopup("Edit Configuration", "Failed to fetch configurations.");
			else if(data == "empty") {
				openModalPopup("Edit Configuration", "There are no configurations created yet.");
				const selBox = $("#oidcServerName");
				selBox.empty();
				selBox.append("<option value='' disabled selected>Select Server</option>");
				selBox.prop("selectedIndex", 0);
			} else {
				data.sort(function(a,b){ return a > b; });
				const selBox = $("#oidcServerName");
				selBox.empty();
				selBox.append("<option value='' disabled selected>Select Server</option>");
				for(var i = 0; i < data.length; i++){
					selBox.append("<option value='"+data[i].name+"'>"+data[i].name+"</option>");
				}
				selBox.prop("selectedIndex", 0);
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Edit Configuration", "Failed to fetch configurations.");
		});
	};

	$scope.oidcConf.delete = function (action) {
		openDeleteGlobalModal("Delete Configuration", "deloidcConf", "Are you sure you want to delete ? Users depending on this configuration will not be able to login.");
	};

	$(document).on('click','#deloidcConf', function(e) {
		hideDeleteGlobalModal();
		$scope.oidcConf.manage("delete", e);
	});

	$scope.oidcConf.getServerData = function () {
		const name = $scope.oidcConf.name;
		const failMsg = "Failed to fetch details for '"+name+"' configuration.";
		blockUI("Fetching details...");
		adminServices.getOIDCConfig(name)
		.then(function(data){
			unblockUI();
			if(data == "Invalid Session") return $rootScope.redirectPage();
			else if(data == "fail") openModalPopup("Edit Configuration", failMsg);
			else if(data == "empty") openModalPopup("Edit Configuration", failMsg + "No such configuration exists");
			else {
				$scope.oidcConf.url = data.url;
				$scope.oidcConf.clientId = data.clientid;
				$scope.oidcConf.secret = data.secret;
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Edit Configuration", failMsg);
		});
	};

	// Email Server Configuration Click
	$scope.mailConf.click = function () {
		$(".selectedIcon").removeClass("selectedIcon");
		$("#mailConfigTab").find("span.fa").addClass("selectedIcon");
		this.providers = ["SMTP"];
		this.channel = "email";
		this.toggleStatus = "Disable";
		this.loaded = "";
		this.provider = "";
		this.active = false;
		this.name = "";
		this.host = "";
		this.port = "";
		this.appurl = window.location.href.replace('/admin', '');
		this.secure = "auto";
		this.insecuretls = "false";
		this.testMailID = "";
		this.testMailMsg = "";
		this.auth = {
			type: "",
			username: "",
			password: ""
		};
		this.sender = {
			name: "",
			email: ""
		};
		this.pool = {
			enable: false,
			maxConnections: "",
			maxMessages: ""
		};
		this.timeouts = {
			connection: "",
			greeting: "",
			socket: ""
		};
		this.proxy = {
			enable: false,
			url: "",
			auth: false,
			user: "",
			pass: ""
		};
		$("#mailName,#mailHost,#mailPort,#senderName,#senderEmail,#appURL,#proxyURL,#proxyUser,#proxyPass").removeClass("inputErrorBorder");
		$("#mailProvider,#authenticationType").removeClass("selectErrorBorder");
	};

	$scope.mailConf.getProviderInfo = function() {
		$("#mailName,#mailHost,#mailPort,#senderName,#senderEmail").removeClass("inputErrorBorder");
		$("#mailProvider,#authenticationType").removeClass("selectErrorBorder");
		blockUI("Loading Configurations...");
		adminServices.getNotificationChannels("provider", this.channel, this.provider)
		.then(function (data) {
			unblockUI();
			if (data == "Invalid Session") $rootScope.redirectPage();
			else if (data == "fail") openModalPopup("Email Configuration", "Fail to fetch configured details for selected provider.");
			else if (data != "empty") {
				$scope.mailConf.loaded = $scope.mailConf.name = data.name;
				$scope.mailConf.host = data.host;
				$scope.mailConf.port = data.port;
				$scope.mailConf.active = data.active;
				$scope.mailConf.toggleStatus = (data.active)? "Disable":"Enable";
				$scope.mailConf.secure = data.tls.security;
				$scope.mailConf.insecuretls = data.tls.insecure.toString();
				const authType = (data.auth && data.auth.type) || data.auth;
				if (authType == "basic") $scope.mailConf.auth = data.auth;
				else {
					$scope.mailConf.auth = {
						type: "none",
						username: '',
						password: ''
					};
				}
				$scope.mailConf.sender = data.sender;
				$scope.mailConf.appurl = data.appurl;
				$scope.mailConf.timeouts = data.timeouts || {};
				if (!data.pool) data.pool = {};
				$scope.mailConf.pool.enable = data.pool.enable || false;
				$scope.mailConf.pool.maxConnections = data.pool.maxconnections || "";
				$scope.mailConf.pool.maxMessages = data.pool.maxmessages || "";
				if (!data.proxy) data.proxy = {};
				$scope.mailConf.proxy.enable = data.proxy.enable || false;
				$scope.mailConf.proxy.url = data.proxy.url || "";
				$scope.mailConf.proxy.auth = data.proxy.auth || false;
				$scope.mailConf.proxy.user = data.proxy.user || "";
				$scope.mailConf.proxy.pass = data.proxy.pass || "";
			}
		}, function (error) {
			unblockUI();
			console.error(error);
			openModalPopup("Email Configuration", "Something Went Wrong");
		});
	};

	$scope.mailConf.getConfObj = function() {
		return {
			channel: this.channel,
			provider: this.provider,
			name: this.name,
			host: this.host,
			port: this.port,
			auth: this.auth,
			sender: this.sender,
			enabletls: this.secure,
			insecuretls: this.insecuretls,
			appurl: this.appurl,
			pool: this.pool,
			proxy: this.proxy,
			timeouts: this.timeouts
		};
	};

	$scope.mailConf.toggle = function() {
		const conf = {
			channel: this.channel,
			provider: this.provider,
			name: this.loaded
		};
		const action = this.toggleStatus;
		let emsg = "Failed to "+action+" '"+conf.name+"' Configuration.";
		blockUI(action.slice(0,-1) + "ing Configuration...")
		adminServices.manageNotificationChannels(action.toLowerCase(), conf)
		.then(function(data) {
			unblockUI();
			if (data == "Invalid Session") return $rootScope.redirectPage();
			else if (data == "fail") openModalPopup(action+" Configuration", emsg);
			else if (data == "success") {
				openModalPopup(action+" Configuration", "'"+conf.name+"' Configuration "+action+"d!");
				$scope.mailConf.getProviderInfo();
			} else if(/^1[0-4]{9}$/.test(data)) {
				if (parseInt(data[1])) {
					openModalPopup(action+" Configuration", emsg+" Invalid Request!");
					return;
				}
				const errfields = [];
				if (parseInt(data[2])) errfields.push("Server Name");
				if (parseInt(data[3])) errfields.push("Channel");
				openModalPopup(action+" Configuration", emsg+" Following values are invalid: "+errfields.join(", "));
			}
		}, function (error) {
			unblockUI();
			openModalPopup(action+" Configuration", emsg);
			console.error("Error in "+action+" Configuration:", error);
		});
	};

	$scope.mailConf.validate = function() {
		let flag = true;
		let popped = false;
		$("#mailName,#mailHost,#mailPort,#senderName,#senderEmail,#appURL,#proxyURL,#proxyUser,#proxyPass").removeClass("inputErrorBorder");
		$("#mailProvider,#authenticationType").removeClass("selectErrorBorder");
		const regExName = /^[A-Za-z0-9]+([A-Za-z0-9-]*[A-Za-z0-9]+|[A-Za-z0-9]*)$/;
		const regExURL = /^http[s]?:\/\/[A-Za-z0-9._-].*$/i;
		const emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (this.provider == "") {
			$("#mailProvider").addClass("selectErrorBorder");
			flag = false;
		}
		if (this.name == "") {
			$("#mailName").addClass("inputErrorBorder");
			flag = false;
		} else if (!regExName.test(this.name)) {
			$("#mailName").addClass("inputErrorBorder");
			if (!popped) openModalPopup("Error", "Invalid Server Name provided! Name cannot contain any special characters other than hyphen. Also name cannot start or end with hyphen.");
			flag = false;
			popped = true;
		}
		if (this.host == "") {
			$("#mailHost").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.port == "") {
			$("#mailPort").addClass("inputErrorBorder");
			flag = false;
		} else if (!((+this.port >= 0) && (+this.port < 65536))) {
			$("#mailPort").addClass("inputErrorBorder");
			if (!popped) openModalPopup("Error", "Invalid Server Port provided! Value has to be a number between 0 and 65535.");
			flag = false;
			popped = true;
		}
		if (this.auth.type == "") {
			$("#authenticationType").addClass("selectErrorBorder");
			flag = false;
		}
		if (this.sender.name == "") {
			$("#senderName").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.sender.email == "" || !emailRegEx.test(this.sender.email)) {
			$("#senderEmail").addClass("inputErrorBorder");
			flag = false;
		}
		if (this.appurl == "") {
			$("#appURL").addClass("inputErrorBorder");
			flag = false;
		} else if (!regExURL.test(this.appurl)) {
			$("#appURL").addClass("inputErrorBorder");
			if (!popped) openModalPopup("Error", "Invalid Avo Assure Application URL provided!");
			flag = false;
			popped = true;
		}
		if (this.proxy.enable) {
			if (this.proxy.url == "") {
				$("#proxyURL").addClass("inputErrorBorder");
				flag = false;
			} else if (!regExURL.test(this.proxy.url)) {
				$("#proxyURL").addClass("inputErrorBorder");
				if (!popped) openModalPopup("Error", "Invalid Proxy Server URL provided!");
				flag = false;
				popped = true;
			}
			if (this.proxy.auth) {
				if (this.proxy.user == "") {
					$("#proxyUser").addClass("inputErrorBorder");
					flag = false;
				}
				if (this.proxy.pass == "") {
					$("#proxyPass").addClass("inputErrorBorder");
					flag = false;
				}
			}
		}
		if (!flag && !popped) openModalPopup("Error", "Form contains errors!");
		return flag;
	};

	$scope.mailConf.showTestMail = function() {
		if (!this.validate()) return false;//openModalPopup("Test Configuration", "Certain fields have invalid values");
		this.testMailID = '';
		this.testMailMsg = '';
		$("#testMailID").removeClass("inputErrorBorder");
		$('#emailserverModal').modal("show");
	};

	$scope.mailConf.test = function() {
		$("#testMailID").removeClass("inputErrorBorder");
		const recipient = this.testMailID;
		const emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (recipient.length === 0 || !emailRegEx.test(recipient)) {
			this.testMailMsg = "Recipient address is invalid!";
			$("#testMailID").addClass("inputErrorBorder");
			return false;
		}
		this.testMailMsg = 'Sending...';
		const conf = this.getConfObj();
		adminServices.testNotificationChannels(this.channel, this.provider, recipient, conf)
		.then(function(data) {
			let status = "Fail to send the test mail. Re-check the configuration.";
			if (data == "Invalid Session") return $rootScope.redirectPage();
			else if (data == "invalidprovider") status = "Selected Provider is not supported yet!";
			else if (data == "invalidrecipient") status = "Recipient address is invalid!";
			else if (data == "success") status = "Test Email Sent!";
			else status = "Fail to send the test mail. Re-check the configuration.";
			$scope.mailConf.testMailMsg = status;
		}, function (error) {
			$scope.mailConf.testMailMsg = "Fail to send the test mail. Re-check the configuration.";
			console.error("Error in Test Email:", error);
		});
		//$('#emailserverModal').modal("hide");
	};

	$scope.mailConf.manage = function() {
		if (!this.validate()) return false;
		const conf = this.getConfObj();
		const action = (this.loaded)? "Update":"Create";
		let emsg = "Failed to "+action+" '"+conf.name+"' Configuration.";
		blockUI(action.slice(0,-1) + "ing Configuration...")
		adminServices.manageNotificationChannels(action.toLowerCase(), conf)
		.then(function(data) {
			unblockUI();
			if (data == "Invalid Session") return $rootScope.redirectPage();
			else if (data == "fail") openModalPopup(action+" Configuration", emsg);
			else if (data == "exists") openModalPopup(action+" Configuration", "'"+conf.name+"' configuration already exists");
			else if (data == "success") {
				openModalPopup(action+" Configuration", "'"+conf.name+"' Configuration "+action+"d!");
				$scope.mailConf.getProviderInfo();
			} else if(/^1[0-4]{12}$/.test(data)) {
				if (+data[1]) {
					openModalPopup(action+" Configuration", emsg+" Invalid Request!");
					return;
				}
				const errfields = [];
				if (+data[2]) errfields.push("Server Name");
				if (+data[3]) errfields.push("Channel");
				if (+data[4]) errfields.push("Provider");
				if (+data[5]) errfields.push("Server Host");
				if (+data[6]) errfields.push("Server Port");
				if (+data[7]) errfields.push("Sender Email");
				if (+data[8]) errfields.push("Secure Connection");
				if (+data[9]) errfields.push("Authentication");
				if (+data[10]) errfields.push("Avo Assure Application URL");
				if (+data[11]) errfields.push("Proxy URL");
				if (+data[12] == 1) errfields.push("Proxy Username");
				else if (+data[12] == 2) errfields.push("Proxy Password");
				else if (+data[12] == 3) errfields.push("Proxy Credentials");
				openModalPopup(action+" Configuration", emsg+" Following values are invalid: "+errfields.join(", "));
			}
		}, function (error) {
			unblockUI();
			openModalPopup(action+" Configuration", emsg);
			console.error("Error in "+action+" Configuration:", error);
		});
	};

	// Session Management Tab Click
	$scope.sessionConf.click = function () {
		$(".selectedIcon").removeClass("selectedIcon");
		$("#sessionTab").find("span.fa").addClass("selectedIcon");
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
		// var ele = $event.target;
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
		adminServices.manageSessionData(action,user,key,"session")
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