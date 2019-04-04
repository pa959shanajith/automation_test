mySPA.controller('pluginController',['$scope', '$rootScope', '$window','$http','$location','$timeout','PluginService', function($scope, $rootScope,$window,$http,$location,$timeout,PluginService) {
	$('.scrollbar-inner').scrollbar();
	window.onbeforeunload = null;
	localStorage.setItem("navigateEnable", true);
	document.getElementById("currentYear").innerHTML = new Date().getFullYear();
	var userInfo = JSON.parse(window.localStorage['_UI']);
	var availablePlugins = userInfo.pluginsInfo;
	$scope.filterData = {'prjval':'Select Project','relval':'Select Release','cycval':'Select Cycle','apptype':{},'tasktype':{}};
	$("#plugin-container").empty().hide();
	$("body").css("background", "#fff");
	if(window.localStorage['navigateScreen'] != "plugin"){
		return $rootScope.redirectPage();
	}
	if (!Array.prototype.fill) {
		Object.defineProperty(Array.prototype, 'fill', {
		  value: function(value) {
	  
			// Steps 1-2.
			if (this == null) {
			  throw new TypeError('this is null or not defined');
			}
	  
			var O = Object(this);
	  
			// Steps 3-5.
			var len = O.length >>> 0;
	  
			// Steps 6-7.
			var start = arguments[1];
			var relativeStart = start >> 0;
	  
			// Step 8.
			var k = relativeStart < 0 ?
			  Math.max(len + relativeStart, 0) :
			  Math.min(relativeStart, len);
	  
			// Steps 9-10.
			var end = arguments[2];
			var relativeEnd = end === undefined ?
			  len : end >> 0;
	  
			// Step 11.
			var final = relativeEnd < 0 ?
			  Math.max(len + relativeEnd, 0) :
			  Math.min(relativeEnd, len);
	  
			// Step 12.
			while (k < final) {
			  O[k] = value;
			  k++;
			}
	  
			// Step 13.
			return O;
		  }
		});
	}
	$rootScope.plugins = [];
	for(i=0; i<availablePlugins.length; i++){
		if(availablePlugins[i].pluginValue != false){
			var pluginName = availablePlugins[i].pluginName;
			var pluginTxt = availablePlugins[i].pluginName.replace(/\s/g,''); 
			var dataName = Encrypt.encode("p_"+pluginTxt);
			$rootScope.plugins.push("p_"+pluginName);
			$("#plugin-container").append('<div class="col-md-4 plugin-block"><span ng-click="pluginBox()" class="toggleClick pluginBox" data-name="p_'+availablePlugins[i].pluginName.replace(/\s/g,'')+'" id="'+availablePlugins[i].pluginName+'" title="'+availablePlugins[i].pluginName+'">'+pluginName+'</span><input class="plugins" type="hidden" id="'+availablePlugins[i].pluginName+"_"+dataName+'"  title="'+pluginTxt+"_"+dataName+'"></div>').fadeIn();
		}
	}

	//Integration with Mindmaps
	$(".plugin-block span").each(function() {
		if($(this).text() == "RAID")
		{
			$(this).parent().hide();
		}
	});
	//$("#plugin-container").addClass("inactiveLink");
	if(userInfo) {
		var userRole = window.localStorage['_SR'];
		if(userRole == "Test Manager") {
			$(".task-content").hide();
		}
		blockUI("Loading Tasks..Please wait...");
		var userid = userInfo.user_id;
		PluginService.getProjectIDs_Nineteen68()
		.then(function (data) {
			if(data == "Fail" || data == "Invalid Session") return $rootScope.redirectPage();
			else {
				PluginService.getTaskJson_mindmaps(data)
				.then(function (data) {
					if(data == "Invalid Session") {
						return $rootScope.redirectPage();
					} else {
						var tasksJson = data;
						$scope.taskJson = data;
					 	window.localStorage['_TJ'] = angular.toJson(tasksJson);
						if (tasksJson.length == 0) unblockUI();
						/*	Build a list of releaseids and cycleids
						* Another dict for releaseid and cyclelist out of task json
						* List of apptype and tasktype
						*/
					    $scope.filterDat = {'projectids':[],'releaseids':[],'cycleids':[],'prjrelmap':{},'relcycmap':{},'apptypes':[],'tasktypes':['Design','Execution'],'idnamemapprj':{},'idnamemaprel':{},'idnamemapcyc':{}};
						$(".plugin-taks-listing:visible").empty().hide();
						var counter = 1,countertodo = 1,counterreview = 1;
						for(i=0; i<tasksJson.length; i++){
							var classIndex = i<100 ? "tasks-l-s": i<1000? "tasks-l-m" : "tasks-l-l";
							for(j=0; j<tasksJson[i].taskDetails.length; j++){
								var taskTypeIcon = "imgs/ic-taskType-yellow-plus.png";
								var testSuiteDetails = JSON.stringify(tasksJson[i].testSuiteDetails);
								if(tasksJson[i].taskDetails[j].taskType == "Execution"){
									taskTypeIcon = "imgs/ic-taskType-blue-plus.png";
								}
									if(tasksJson[i].taskDetails[0].status == 'review'){
										$(".plugin-taks-listing.review").append('<div class="panel panel-default" panel-id="'+i+'"><div id="panelBlock_'+i+'" class="panel-heading"><div style="margin-top: 9px;min-height: 40px;margin-top: 15px;" href="#collapse'+counter+'"><h4 class="taskNo '+classIndex+'" style="margin-top: -1px; padding-right: 6px;">'+ counterreview +'</h4><span class="assignedTask" data-testsuitedetails='+testSuiteDetails+' data-scenarioflag='+tasksJson[i].scenarioFlag+' data-apptype="'+tasksJson[i].appType+'" data-projectid="'+tasksJson[i].projectId+'" data-screenid="'+tasksJson[i].screenId+'" data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-scenarioid="'+tasksJson[i].scenarioId+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskdes="'+tasksJson[i].taskDetails[j].taskDescription+'" data-tasktype="'+tasksJson[i].taskDetails[j].taskType+'" data-subtask="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'"  data-assignedtestscenarioids="'+tasksJson[i].assignedTestScenarioIds+'" data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-exenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" data-versionnumber="'+tasksJson[i].versionnumber+'" data-batchTaskIDs="'+tasksJson[i].taskDetails[j].batchTaskIDs+'" data-releaseid="'+tasksJson[i].taskDetails[j].releaseid+'" data-cycleid="'+tasksJson[i].taskDetails[j].cycleid+'" data-reuse="'+tasksJson[i].taskDetails[j].reuse+'" onclick="taskRedirection(this.dataset.testsuitedetails,this.dataset.scenarioflag,this.dataset.assignedtestscenarioids,this.dataset.subtask,this.dataset.subtaskid,this.dataset.screenid,this.dataset.screenname,this.dataset.projectid,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.scenarioid,this.dataset.versionnumber,this.dataset.status,this.dataset.batchtaskids,this.dataset.releaseid,this.dataset.cycleid,this.dataset.reuse,event)">'+tasksJson[i].taskDetails[j].taskName+'</span><!--Addition--><div class="panel-additional-details"><img style="height: 20px;" src="'+taskTypeIcon+'"/><button class="panel-head-tasktype">'+tasksJson[i].taskDetails[j].taskType+'</button></div><!--Addition--></div></div></div>').fadeIn();
										counterreview++;
									}
									else{
										$(".plugin-taks-listing.todo").append('<div class="panel panel-default" panel-id="'+i+'"><div id="panelBlock_'+i+'" class="panel-heading"><div style="margin-top: 9px;min-height: 40px;margin-top: 15px;" href="#collapse'+counter+'"><h4 class="taskNo '+classIndex+'" style="margin-top: -1px; padding-right: 6px;">'+ countertodo +'</h4><span class="assignedTask" data-testsuitedetails='+testSuiteDetails+' data-scenarioflag='+tasksJson[i].scenarioFlag+' data-apptype="'+tasksJson[i].appType+'" data-projectid="'+tasksJson[i].projectId+'" data-screenid="'+tasksJson[i].screenId+'" data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-scenarioid="'+tasksJson[i].scenarioId+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskdes="'+tasksJson[i].taskDetails[j].taskDescription+'" data-tasktype="'+tasksJson[i].taskDetails[j].taskType+'" data-subtask="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'"  data-assignedtestscenarioids="'+tasksJson[i].assignedTestScenarioIds+'" data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-exenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" data-versionnumber="'+tasksJson[i].versionnumber+'" data-batchTaskIDs="'+tasksJson[i].taskDetails[j].batchTaskIDs+'" data-releaseid="'+tasksJson[i].taskDetails[j].releaseid+'" data-cycleid="'+tasksJson[i].taskDetails[j].cycleid+'" data-reuse="'+tasksJson[i].taskDetails[j].reuse+'" onclick="taskRedirection(this.dataset.testsuitedetails,this.dataset.scenarioflag,this.dataset.assignedtestscenarioids,this.dataset.subtask,this.dataset.subtaskid,this.dataset.screenid,this.dataset.screenname,this.dataset.projectid,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.scenarioid,this.dataset.versionnumber,this.dataset.status,this.dataset.batchtaskids,this.dataset.releaseid,this.dataset.cycleid,this.dataset.reuse,event)">'+tasksJson[i].taskDetails[j].taskName+'</span><!--Addition--><div class="panel-additional-details"><img style="height: 20px;" src="'+taskTypeIcon+'"/><button class="panel-head-tasktype">'+tasksJson[i].taskDetails[j].taskType+'</button></div><!--Addition--></div></div></div>').fadeIn();										
										countertodo++;
									}									
									 var limit = 45;
									 var chars = $("#panelBlock_"+i+"").children().find('span.assignedTask').text();
									if (chars.length > limit) {
										var visiblePart = chars.substr(0, limit-1);
										var dots = $("<span class='dots'>...</span>");
										var hiddenPart = chars.substr(limit-1);
										var assignedTaskText = visiblePart + hiddenPart;
										$("#panelBlock_"+i+"").children().find('span.assignedTask').text(visiblePart).attr('title',assignedTaskText).append(dots);
									 }
								counter++;
								fillFilterValues(tasksJson[i],j);
							}
						}
						//prevent mouseclick before loading tasks
						$("span.toggleClick").removeClass('toggleClick');
						// Enable Filter
						$("span.filterIcon").removeClass('disableFilter');
					}

					PluginService.getNames_ICE($scope.filterDat.projectids,Array($scope.filterDat.projectids.length).fill('projects'))
					.then(function (response) {
						if(response == "Invalid Session"){
							return $rootScope.redirectPage();
						} else {
							response.respnames.forEach(function(name,i){
								$scope.filterDat.idnamemapprj[response.requestedids[i]] = name;
							});
							PluginService.getNames_ICE($scope.filterDat.releaseids,Array($scope.filterDat.releaseids.length).fill('releases'))
							.then(function (response) {
								if(response == "Invalid Session"){
									return $rootScope.redirectPage();
								} else{
									response.respnames.forEach(function(name,i){
										$scope.filterDat.idnamemaprel[response.requestedids[i]] = name;
									});
									PluginService.getNames_ICE($scope.filterDat.cycleids,Array($scope.filterDat.cycleids.length).fill('cycles'))
									.then(function (response) {
										if(response == "Invalid Session"){
											return $rootScope.redirectPage();
										} else{
											unblockUI();
											response.respnames.forEach(function(name,i){
												$scope.filterDat.idnamemapcyc[response.requestedids[i]] = name;
											});
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
					}, function (error) {
						unblockUI();
						console.log("Error:::::::::::::", error);
					});
					//$("#plugin-container").removeClass("inactiveLink");
				}, function (error) {
					unblockUI();
					blockUI("Fail to load tasks!");
					setTimeout(function(){ unblockUI(); }, 3000);
					console.log("Error:::::::::::::", error);
				});
			}
		}, function (error) {
			unblockUI();
			blockUI("Fail to load Projects!");
			setTimeout(function(){ unblockUI(); }, 3000);
			console.log("Error:::::::::::::", error);
		});
	}

	//Search form
	var isOpen = false;
	$(document).on('click',".searchIcon", function(){
		if(isOpen == false){
			$(this).parents('.list-inline').children("li:first-child").hide();
			$(this).parents('.list-inline').children("li:nth-child(2)").hide();
			$(this).parent().find("input").show();
			$(this).css("border-radius","0px 7px 7px 0px");
			isOpen = true;
			$(".searchInput").focus();
		}

		else
		{
			$(this).parents('.list-inline').children("li:first-child").show();
			$(this).parents('.list-inline').children("li:nth-child(2)").show();
			$(this).parent().find("input").hide();
			$(this).css("border-radius","7px 7px 7px 7px");
			isOpen = false;
		}
	});

	//Search form filter
	$('.searchInput').keyup(function(event) {
		filter(this,event); 
		event.stopImmediatePropagation();
	});

	function filter(element,event) {
		var value = $(element).val();
		$(".panel-default span.assignedTask").each(function () { 
			var title = $(this).attr('title');
			if($('.active-task').is(":visible"))
			{
				$('.active-task').children().children('div').children('div').children('img').click();
			}
			if(title == undefined)
			{
				if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
					$(this).parents(".panel-default").show();
				} else {
					$(this).parents(".panel-default").hide();
				}
			}
			else{
				if (title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
					$(this).parents(".panel-default").show();
				} else {
					$(this).parents(".panel-default").hide();
				}
			}
		});
		//Transaction Activity for Task Search 
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['FilterTaskBySearch']);		
		// txnHistory.log(event.type,labelArr,infoArr,$location.$$path); 
		var counter=1;
		$(".panel-default h4:visible").each(function () {
			$(this).text(counter); 
			counter++;
		});
	}

	//Plugin click event 
	$scope.pluginFunction = function(name,event){
		if(name == "p_Mindmap"){
			name = 'mindmap';
		}
		else if(name == "p_NeuronGraphs") name = 'neuronGraphs';
		else if(name == "p_NeuronGraphs3D") name = 'neuronGraphs3D';
		window.localStorage['navigateScreen'] = name;
		$timeout(function () {
			if(name == 'p_Reports')
			{
				window.location.href = "/"+ name;
			}
			else{
				$location.path('/'+ name);
			}
			//Transaction Activity for Plugin Navigation
			// var labelArr = [];
			// var infoArr = [];
			// infoArr.push({pluginName : name });
			// labelArr.push(txnHistory.codesDict['PluginNavigation']);
			// txnHistory.log(event.type,labelArr,infoArr,$location.$$path); 
	   	}, 100);
	};

	window.localStorage['_TJ'] = "";
	window.localStorage['_CT'] = "";
	//Task Function
	/*$scope.getTask = function(){
    	$("#fileInputJson").attr("type","file");
    	$("#fileInputJson").trigger('click');
    	fileInputJson.addEventListener('change', function(e) {
				// Put the rest of the demo code here.
				var file = fileInputJson.files[0];
				var textType = /json./;
				var reader = new FileReader();
				reader.onload = function(e) {
					if((file.name.split('.')[file.name.split('.').length-1]).toLowerCase() == "json"){
						var tasksJson = JSON.parse(reader.result);
						window.localStorage['_TJ'] = angular.toJson(tasksJson);
						$(".plugin-taks-listing").empty().hide()
						var counter = 1;
						for(i=0; i<tasksJson.length; i++){
							for(j=0; j<tasksJson[i].taskDetails.length; j++){
								if(tasksJson[i].taskDetails[j].taskType == "Design"){
									$(".plugin-taks-listing").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+counter+'"><span class="taskNo">Task '+ counter +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-head-tasktype">'+tasksJson[i].taskDetails[j].taskType+'</span><span class="panel-head-details details-design-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+counter+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTask" data-apptype="'+tasksJson[i].appType+'" data-projectname="'+tasksJson[i].projectId+'" data-releaseid="'+tasksJson[i].releaseId+'" data-cycleid="'+tasksJson[i].cycleId+'" data-screenid="'+tasksJson[i].screenId+'"  data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-testsuiteid="'+tasksJson[i].testSuiteId+'" data-testsuitename="'+tasksJson[i].testSuiteName+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskDes="'+tasksJson[i].taskDetails[j].taskDescription+'" data-tasktype="'+tasksJson[i].taskDetails[j].taskType+'" data-subtask="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'" data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-exenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" onclick="taskRedirection(this.dataset.subtask,this.dataset.screenid,this.dataset.screenname,this.dataset.projectname,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.releaseid,this.dataset.cycleid,this.dataset.testsuiteid,this.dataset.testsuitename)">'+tasksJson[i].taskDetails[j].taskName+'</span></div></div></div>').fadeIn()
								} 
								else if(tasksJson[i].taskDetails[j].taskType == "Execution"){
									$(".plugin-taks-listing").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+counter+'"><span class="taskNo">Task '+ counter +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-head-tasktype">'+tasksJson[i].taskDetails[j].taskType+'</span><span class="panel-head-details details-execute-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+counter+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTask" data-apptype="'+tasksJson[i].appType+'" data-projectname="'+tasksJson[i].projectId+'" data-releaseid="'+tasksJson[i].releaseId+'" data-cycleid="'+tasksJson[i].cycleId+'" data-screenid="'+tasksJson[i].screenId+'"  data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-testsuiteid="'+tasksJson[i].testSuiteId+'" data-testsuitename="'+tasksJson[i].testSuiteName+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskDes="'+tasksJson[i].taskDetails[j].taskDescription+'" data-tasktype="'+tasksJson[i].taskDetails[j].taskType+'" data-subtask="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'" data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-exenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" onclick="taskRedirection(this.dataset.subtask,this.dataset.screenid,this.dataset.screenname,this.dataset.projectname,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.releaseid,this.dataset.cycleid,this.dataset.testsuiteid,this.dataset.testsuitename)">'+tasksJson[i].taskDetails[j].taskName+'</span></div></div></div>').fadeIn()
								}
								counter++
							}
						}
					}
					else{
						alert("Upload only JSON file");
					}
				}
				reader.readAsText(file);
		});
    }*/

	$scope.taskRedirection = function(testsuitedetails,scenarioflag,assignedtestscenarioids,subtask,subtaskid,screenid,screenname,projectid,taskname,testcaseid,testcasename,apptype,scenarioid,versionnumber,status,batchTaskIDs,releaseid,cycleid,reuse,event){
		//Transaction Activity for Task Navigation
		// var labelArr = [];
		// var infoArr = [];
		// infoArr.push({taskName : event.target.outerText });
		// labelArr.push(txnHistory.codesDict['TaskNavigation']);
		// txnHistory.log(event.type,labelArr,infoArr,$location.$$path); 
		
		var taskObj = {};
		if(status=='assigned'){
			status='inprogress';
			PluginService.updateTaskStatus(subtaskid)
					.then(function(data) {
							status=data;
						},
						function(error) {
							console.log("Error updating task status " + (error.data));
						});
		}
		//taskObj.projectidts = projectIdTS;
		taskObj.testSuiteDetails = JSON.parse(testsuitedetails);
		taskObj.scenarioFlag = scenarioflag;
		taskObj.assignedTestScenarioIds = assignedtestscenarioids;
		taskObj.screenId = screenid;
		taskObj.screenName = screenname;
		taskObj.projectId = projectid;
		taskObj.taskName = taskname;
		taskObj.versionnumber = versionnumber;
		taskObj.testCaseId = testcaseid;
		taskObj.testCaseName = testcasename;
		taskObj.appType = apptype;
		taskObj.status=status;
	//	taskObj.releaseId = releaseid;
	//	taskObj.cycleId = cycleid;
	//	taskObj.testSuiteId = testsuiteid;
		taskObj.scenarioId = scenarioid;
		taskObj.batchTaskIDs=batchTaskIDs;
	//	taskObj.testSuiteName = testsuitename;
		taskObj.subTask = subtask; 
		taskObj.subTaskId=subtaskid;
		taskObj.releaseid = releaseid;
		taskObj.cycleid = cycleid;
		taskObj.reuse = reuse;
	//	taskObj.assignedTestScenarioIds = assignedtestscenarioids;
	//	taskObj.scenarioFlag = scenarioflag;
	
		window.localStorage['_CT'] = JSON.stringify(taskObj);
		if(subtask == "Scrape"){
			window.localStorage['navigateScreen'] = "Scrape";
			window.localStorage['navigateScrape'] = true;
			$window.location.assign("/design");
		}
		else if(subtask == "TestCase"){
			window.localStorage['navigateScreen'] = "TestCase";
			window.localStorage['navigateTestcase'] = true;
			$window.location.assign("/designTestCase");
		}
		else if(subtask == "TestSuite"){
			window.localStorage['navigateScreen'] = "TestSuite";
			$window.location.assign("/execute");
		}
		else if(subtask == "Scheduling"){
			window.localStorage['navigateScreen'] = "scheduling";
			$window.location.assign("/scheduling");
		}
	};

	$scope.showTaskFilterPopup = function(){
		$('#dialog-taskFilter').modal('show');
	};

	function passFilterTest(node,tidx){
		var pflag = false, rflag = false,cflag = false,aflag = false,tflag = false;
		if($scope.filterData['prjval']=='Select Project' || $scope.filterData['prjval']==node.testSuiteDetails[tidx].projectidts) pflag = true;
		if($scope.filterData['relval']=='Select Release' || $scope.filterData['relval']==node.taskDetails[tidx].releaseid) rflag = true;
		if($scope.filterData['relval']=='Select Release' || $scope.filterData['relval']==node.taskDetails[tidx].releaseid) rflag = true;
		if($scope.filterData['cycval']=='Select Cycle' || $scope.filterData['cycval']==node.taskDetails[tidx].cycleid) cflag = true;
		if(Object.keys($scope.filterData['tasktype']).map(function(itm) { return $scope.filterData['tasktype'][itm]; }).indexOf(true) == -1 || $scope.filterData.tasktype[node.taskDetails[tidx].taskType]) tflag = true;
		if(Object.keys($scope.filterData['apptype']).map(function(itm) { return $scope.filterData['apptype'][itm]; }).indexOf(true) == -1 || $scope.filterData.apptype[node.appType]) aflag = true;		
		
		if(pflag && rflag && cflag && aflag && tflag) return true;
		else return false;
	}
	$scope.filterTasks = function($event){
		var tasksJson = $scope.taskJson;
		$('#dialog-taskFilter').modal('hide');
		window.localStorage['_TJ'] = angular.toJson(tasksJson);
		$(".plugin-taks-listing").empty();
		var counter =1,countertodo = 1,counterreview = 1;
		var taskTypeIcon = "";
		for(i=0; i<tasksJson.length; i++){
			var classIndex = i<100 ? "tasks-l-s": i<1000? "tasks-l-m" : "tasks-l-l";
			//console.log("taskJson", tasksJson[i]);
			for(j=0; j<tasksJson[i].taskDetails.length; j++){
				//console.log("TASKJSONDETAILS",tasksJson[i].taskDetails);
				if(tasksJson[i].taskDetails[j].taskType == "Design"){
					taskTypeIcon = "imgs/ic-taskType-yellow-plus.png";
				} 
				else if(tasksJson[i].taskDetails[j].taskType == "Execution"){
					taskTypeIcon = "imgs/ic-taskType-blue-plus.png";
					//console.log("test",tasksJson[i].assignedTestScenarioIds);

				}
				var testSuiteDetails = JSON.stringify(tasksJson[i].testSuiteDetails);
				//console.log(i,testSuiteDetails);
				if(passFilterTest(tasksJson[i],0)){
					if(tasksJson[i].taskDetails[0].status == 'review'){
						$(".plugin-taks-listing.review").append('<div class="panel panel-default" panel-id="'+i+'"><div class="panel-heading"><div style="margin-top: 9px;min-height: 40px;margin-top: 15px;" href="#collapse'+counter+'"><h4 class="taskNo '+classIndex+'" style="margin-top: -1px; padding-right: 6px;">'+ counterreview +'</h4><span class="assignedTask" data-testsuitedetails='+testSuiteDetails+' data-scenarioflag='+tasksJson[i].scenarioFlag+' data-apptype="'+tasksJson[i].appType+'" data-projectid="'+tasksJson[i].projectId+'" data-screenid="'+tasksJson[i].screenId+'" data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-scenarioid="'+tasksJson[i].scenarioId+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskdes="'+tasksJson[i].taskDetails[j].taskDescription+'" data-tasktype="'+tasksJson[i].taskDetails[j].taskType+'" data-subtask="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'"  data-assignedtestscenarioids="'+tasksJson[i].assignedTestScenarioIds+'" data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-exenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" data-versionnumber="'+tasksJson[i].versionnumber+'" data-batchTaskIDs="'+tasksJson[i].taskDetails[j].batchTaskIDs+'" data-releaseid="'+tasksJson[i].taskDetails[j].releaseid+'" data-cycleid="'+tasksJson[i].taskDetails[j].cycleid+'" data-reuse="'+tasksJson[i].taskDetails[j].reuse+'" onclick="taskRedirection(this.dataset.testsuitedetails,this.dataset.scenarioflag,this.dataset.assignedtestscenarioids,this.dataset.subtask,this.dataset.subtaskid,this.dataset.screenid,this.dataset.screenname,this.dataset.projectid,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.scenarioid,this.dataset.versionnumber,this.dataset.status,this.dataset.batchtaskids,this.dataset.releaseid,this.dataset.cycleid,this.dataset.reuse,event)">'+tasksJson[i].taskDetails[j].taskName+'</span><!--Addition--><div class="panel-additional-details"><img style="height: 20px;" src="'+taskTypeIcon+'"/><button class="panel-head-tasktype">'+tasksJson[i].taskDetails[j].taskType+'</button></div><!--Addition--></div></div></div>').fadeIn();
						counterreview++;
					}
					else{
						$(".plugin-taks-listing.todo").append('<div class="panel panel-default" panel-id="'+i+'"><div class="panel-heading"><div style="margin-top: 9px;min-height: 40px;margin-top: 15px;" href="#collapse'+counter+'"><h4 class="taskNo '+classIndex+'" style="margin-top: -1px; padding-right: 6px;">'+ countertodo +'</h4><span class="assignedTask" data-testsuitedetails='+testSuiteDetails+' data-scenarioflag='+tasksJson[i].scenarioFlag+' data-apptype="'+tasksJson[i].appType+'" data-projectid="'+tasksJson[i].projectId+'" data-screenid="'+tasksJson[i].screenId+'" data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-scenarioid="'+tasksJson[i].scenarioId+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskdes="'+tasksJson[i].taskDetails[j].taskDescription+'" data-tasktype="'+tasksJson[i].taskDetails[j].taskType+'" data-subtask="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'"  data-assignedtestscenarioids="'+tasksJson[i].assignedTestScenarioIds+'" data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-exenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" data-versionnumber="'+tasksJson[i].versionnumber+'" data-batchTaskIDs="'+tasksJson[i].taskDetails[j].batchTaskIDs+'" data-releaseid="'+tasksJson[i].taskDetails[j].releaseid+'" data-cycleid="'+tasksJson[i].taskDetails[j].cycleid+'" data-reuse="'+tasksJson[i].taskDetails[j].reuse+'" onclick="taskRedirection(this.dataset.testsuitedetails,this.dataset.scenarioflag,this.dataset.assignedtestscenarioids,this.dataset.subtask,this.dataset.subtaskid,this.dataset.screenid,this.dataset.screenname,this.dataset.projectid,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.scenarioid,this.dataset.versionnumber,this.dataset.status,this.dataset.batchtaskids,this.dataset.releaseid,this.dataset.cycleid,this.dataset.reuse,event)">'+tasksJson[i].taskDetails[j].taskName+'</span><!--Addition--><div class="panel-additional-details"><img style="height: 20px;" src="'+taskTypeIcon+'"/><button class="panel-head-tasktype">'+tasksJson[i].taskDetails[j].taskType+'</button></div><!--Addition--></div></div></div>').fadeIn();
						countertodo++;
					}
					counter++;
				}				
			}
		}

		if($scope.filterData['prjval']=='Select Project' && $scope.filterData['relval']=='Select Release' && $scope.filterData['cycval']=='Select Cycle' && !(Object.values($scope.filterData['tasktype']).includes(true) || Object.values($scope.filterData['apptype']).includes(true))){
			$scope.filterEnable = false;
			$('.filterIcon').css('background','white');
		}
		else{
			$scope.filterEnable = true;
			$('.filterIcon').css('background','#b875da');
		}

		//Transaction Activity for Filter Button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['FilterTaskByParams']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
		$(".panel-additional-details").off("click");
		$(".panel-additional-details").click(function(e){
			var tdes = this.parentElement.children[1].getAttribute('data-taskdes');
			var olddescriptionid = "null";
			if($(".description-container").length>0) olddescriptionid = $(".description-container")[0].getAttribute("description-id");
			$(".description-container").remove();
			$(".active-task").removeClass("active-task");
			var clickedtask = this.parentElement.parentElement.parentElement.getAttribute('panel-id');
			if(clickedtask == olddescriptionid){
				$(".description-container").remove();
				$(".active-task").removeClass("active-task");
				return;
			}
			var clktask = $scope.taskJson[clickedtask];
			var filterDat = $scope.filterDat;
			if(clktask.taskDetails[0].taskType != 'Design')
				clktask = clktask.testSuiteDetails[0];
			var adddetailhtml = '<div class="panel panel-default description-container" description-id="'+clickedtask+'"><li class="description-item" title="Description: '+tdes+'">Description: '+tdes+'</li><li class="description-item" title="Release: '+filterDat.idnamemaprel[clktask.releaseid]+'">Release: '+filterDat.idnamemaprel[clktask.releaseid]+'</li><li class="description-item" title="Cycle: '+filterDat.idnamemapcyc[clktask.cycleid]+'">Cycle: '+filterDat.idnamemapcyc[clktask.cycleid]+'</li><li class="description-item" title="Apptype: '+clktask.appType+'">Apptype: '+clktask.appType+'</li></div>';
			$(adddetailhtml).insertAfter("[panel-id="+clickedtask+"]");
			$("[panel-id="+clickedtask+"]").addClass("active-task");
		});		
	};

	$scope.clearFilter = function(){
		$("#cycle-filter-list option:disabled").removeAttr('disabled');
		$scope.filterData['relval']='Select Release';
		$scope.filterData['cycval']='Select Cycle'; 
		$scope.filterData['prjval']='Select Project'; 
		
		Object.keys($scope.filterData.tasktype).forEach(function(key) {
			$scope.filterData.tasktype[key] = false;
		});
		Object.keys($scope.filterData.apptype).forEach(function(key) {
			$scope.filterData.apptype[key] = false;
		});
	};
	function validID(id){
		// Checks if neo4j id for relase and cycle in task is valid
		if(id == 'null' || id == 'undefined' || id == null || id == undefined || id == 'Select Release' || id == 'Select Cycle' || id == '') return false;
		return true;
	}

	function fillFilterValues(obj,tidx){
		/*	Build a list of releaseids and cycleids
		* Another dict for releaseid and cyclelist out of task json
		* List of apptype and tasktype
		*/
		// if(!validID(obj.projectId)) return;
		// if(!validID(obj.taskDetails[tidx].releaseid)) return;
		// if(!validID(obj.taskDetails[tidx].cycleid)) return;

		if(validID(obj.projectId) && $scope.filterDat.projectids.indexOf(obj.projectId) == -1){
			$scope.filterDat.projectids.push(obj.projectId);
			$scope.filterDat.prjrelmap[obj.projectId] = [obj.taskDetails[tidx].releaseid];
		}
		if(validID(obj.taskDetails[tidx].releaseid) && $scope.filterDat.releaseids.indexOf(obj.taskDetails[tidx].releaseid) == -1){
			$scope.filterDat.releaseids.push(obj.taskDetails[tidx].releaseid);
			if(validID(obj.projectId) && $scope.filterDat.prjrelmap[obj.projectId].indexOf(obj.taskDetails[tidx].releaseid) == -1){
				$scope.filterDat.prjrelmap[obj.projectId].push(obj.taskDetails[tidx].releaseid);
			}
			$scope.filterDat.relcycmap[obj.taskDetails[tidx].releaseid] = [obj.taskDetails[tidx].cycleid];
		}
		if(validID(obj.taskDetails[tidx].cycleid) && $scope.filterDat.cycleids.indexOf(obj.taskDetails[tidx].cycleid) == -1){
			$scope.filterDat.cycleids.push(obj.taskDetails[tidx].cycleid);
			$scope.filterDat.relcycmap[obj.taskDetails[tidx].releaseid].push(obj.taskDetails[tidx].cycleid);			
		}

		if($scope.filterDat.apptypes.indexOf(obj.appType)==-1)
			$scope.filterDat.apptypes.push(obj.appType);
		
		$(".panel-additional-details").off("click");
		$(".panel-additional-details").click(function(e){
			var tdes = this.parentElement.children[1].getAttribute('data-taskdes');
			var olddescriptionid = "null";
			if($(".description-container").length>0)
				olddescriptionid = $(".description-container")[0].getAttribute("description-id");
			$(".description-container").remove();
			$(".active-task").removeClass("active-task");
			var clickedtask = this.parentElement.parentElement.parentElement.getAttribute('panel-id');
			if(clickedtask == olddescriptionid){
				$(".description-container").remove();
				$(".active-task").removeClass("active-task");
				return;
			}
			var clktask = $scope.taskJson[clickedtask];
			var filterDat = $scope.filterDat;
			if(clktask.taskDetails[0].taskType != 'Design')
				clktask = clktask.testSuiteDetails[0];
			adddetailhtml = '<div class="panel panel-default description-container" description-id="'+clickedtask+'"><li class="description-item" title="Description: '+tdes+'">Description: '+tdes+'</li><li class="description-item" title="Release: '+filterDat.idnamemaprel[clktask.releaseid]+'">Release: '+filterDat.idnamemaprel[clktask.releaseid]+'</li><li class="description-item" title="Cycle: '+filterDat.idnamemapcyc[clktask.cycleid]+'">Cycle: '+filterDat.idnamemapcyc[clktask.cycleid]+'</li><li class="description-item" title="Apptype: '+clktask.appType+'">Apptype: '+clktask.appType+'</li></div>';
			$(adddetailhtml).insertAfter("[panel-id="+clickedtask+"]");
			$("[panel-id="+clickedtask+"]").addClass("active-task");
		});
	}

	$('#project-filter-list').change(function(){
		$('#release-filter-list').val('Select Release');
		$scope.filterDat.releaseids.forEach(function(cval,i){
			$('[value='+cval+']').attr('disabled','disabled');
		});		
		$scope.filterDat.cycleids.forEach(function(cval,i){
			$('[value='+cval+']').attr('disabled','disabled');
		});
		$scope.filterDat.prjrelmap[$('#project-filter-list').val()].forEach(function(cval,i){
			$('[value='+cval+']').removeAttr("disabled");
		});
	});
	
	$('#release-filter-list').change(function(){
		$('#cycle-filter-list').val('Select Cycle');
		$scope.filterDat.cycleids.forEach(function(cval,i){
			$('[value='+cval+']').attr('disabled','disabled');
		});
		$scope.filterDat.relcycmap[$('#release-filter-list').val()].forEach(function(cval,i){
			$('[value='+cval+']').removeAttr("disabled");
		});
	});

	//Plugin click event - Creating Scope to define the function and returning back to controller
	$(document).on("click", ".pluginBox ", function(event){
		var name = $(this).attr('data-name');
		var pluginDetails = [];
		var selectedPlugin ='';
		var selectedPluginTxt = '';
		var encodedVal =  Encrypt.encode(name);
		var pluginVal = $(this).next('input[type=hidden]').attr('title').split("_")[1];
		var pluginPath = "p_"+ $(this).next('input[type=hidden]').attr('title').split("_")[0];
		//var pluginTxt = angular.element(document.body).scope().$root.plugins;
		$(".plugins").each(function() {
			var id = $(this).attr('title').split("_")[1];
			if (id == encodedVal) {
				$scope.pluginFunction(pluginPath,event);
				return;
			}
	  });
	});

	$(document).on("click", ".pluginBox ", function(event){
		var name = $(this).attr('data-name');
		var pluginDetails = [];
		var selectedPlugin ='';
		var selectedPluginTxt = '';
		var encodedVal =  Encrypt.encode(name);
		var pluginVal = $(this).next('input[type=hidden]').attr('title').split("_")[1];
		var pluginPath = "p_"+ $(this).next('input[type=hidden]').attr('title').split("_")[0];
		//var pluginTxt = angular.element(document.body).scope().$root.plugins;
		$(".plugins").each(function() {
			var id = $(this).attr('title').split("_")[1];
			if (id == encodedVal) {
				$scope.pluginFunction(pluginPath,event);
				return;
			}
	  });
	});	

	$(".task-catagory").click(function(e){
		if($(".active.task-catagory")[0].getAttribute("tasks") == this.getAttribute("tasks")) return;

	});

}]);

function taskRedirection(testsuitedetails,scenarioflag,assignedtestscenarioids,subtask,subtaskid,screenid,screenname,projectid,taskname,testcaseid,testcasename,apptype,scenarioid,versionnumber,status,batchTaskIDs,releaseid,cycleid,reuse,event){
	angular.element(document.getElementsByClassName("assignedTask")).scope().taskRedirection(testsuitedetails,scenarioflag,assignedtestscenarioids,subtask,subtaskid,screenid,screenname,projectid,taskname,testcaseid,testcasename,apptype,scenarioid,versionnumber,status,batchTaskIDs,releaseid,cycleid,reuse,event);
}
