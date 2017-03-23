mySPA.controller('pluginController',['$scope','$window','$http','$location','$timeout','PluginService', function($scope,$window,$http,$location,$timeout,PluginService) {
	$('.scrollbar-inner').scrollbar()
	document.getElementById("currentYear").innerHTML = new Date().getFullYear()
    var userInfo = JSON.parse(window.localStorage['_UI']);
    var availablePlugins = userInfo.pluginsInfo;
    $("#plugin-container").empty().hide()
    for(i=0; i<availablePlugins.length; i++){
        $("#plugin-container").append('<div class="col-md-4 plugin-block"><span onclick="p_event(this.dataset.name)" data-name="p_'+availablePlugins[i].pluginName.replace(/\s/g,'')+'" id="'+availablePlugins[i].id+'" title="'+availablePlugins[i].pluginName+'">'+availablePlugins[i].pluginName+'</span></div>').fadeIn()
    }
    //Integration with Mindmaps
	$(".plugin-block span").each(function() {
		if($(this).text() == "RAID")
		{
			$(this).parent().hide();
		}
	});
	/*if(window.localStorage['_UI'])
	{
		var userInfo =  JSON.parse(window.localStorage['_UI']);
		var userid = userInfo.user_id;
			PluginService.getProjectIDs_Nineteen68(userid)
			.then(function (data) { 
			 if(data != "Fail")
			 {
				 var obj={'userid':userid,'prjId':data};
					PluginService.getTaskJson_Nineteen68(obj)
			         .then(function (data) { 
						 	//console.log(data);
					    var tasksJson = data;
                        window.localStorage['_TJ'] = angular.toJson(tasksJson);
                        $(".plugin-taks-listing").empty().hide()
                        var counter = 1;
						for(i=0; i<tasksJson.length; i++){
							console.log("taskJson", tasksJson[i]);
							    for(j=0; j<tasksJson[i].taskDetails.length; j++){
                                   console.log("TASKJSONDETAILS",tasksJson[i].taskDetails);
								    for(j=0; j<tasksJson[i].taskDetails.length; j++){
                                             console.log("TASKJSONDETAILS",tasksJson[i].taskDetails);
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
					}, function (error) { console.log("Error:::::::::::::", error) })
			 }	
			}, function (error) { console.log("Error:::::::::::::", error) })
	}*/
	
    //Plugin click event 
    $scope.pluginFunction = function(name){
    	$window.location.assign(name)
    }
    window.localStorage['_TJ'] = "";
	window.localStorage['_CT'] = "";
    //Task Function
	var tasksJson = [{
		"appType": "Web",
		"projectId": "5122b95c-84ad-40fd-9f10-e29988323fb5",
		"releaseId": "208878f2-bca5-4915-90c3-3b54a7b092a9",
		"cycleId": "0e9a156c-3b87-4765-a3ce-201809139cbe",
		"screenId": "e35b12c8-b193-4f48-9990-033d788e306e",
		"screenName": "Screen_Name_30",
		"testCaseId": "21950747-f61b-4d09-8a45-f8bb0e5135b2",
		"testCaseName": "testcase30",
		"assignedTestScenarioIds": [],
		"testSuiteId": "97859bba-c488-42d4-89b0-b37ea9396711",
		"testSuiteName": "Suite_Scenario_TC_26_27_28_29_TC_30_51_ClearCache_1",
		"taskDetails": [{
			"taskName": "Create Screen",
			"taskDescription": "Scrape Screen 30",
			"taskType": "Design",
			"subTaskType": "Scrape",
			"subTaskId": "98d5e9bc-0433-47aa-8709-f4390d5ca081",
			"assignedTo": "cdbb502a-84ef-435a-92c4-31af4173bb9e",
			"startDate": "27/02/2017",
			"expectedEndDate": "01/03/2017",
			"status": "Assigned"
		}]
	}, {
		"appType": "Web",
		"projectId": "5122b95c-84ad-40fd-9f10-e29988323fb5",
		"releaseId": "208878f2-bca5-4915-90c3-3b54a7b092a9",
		"cycleId": "0e9a156c-3b87-4765-a3ce-201809139cbe",
		"screenId": "e35b12c8-b193-4f48-9990-033d788e306e",
		"screenName": "Screen_Name_30",
		"testCaseId": "21950747-f61b-4d09-8a45-f8bb0e5135b2",
		"testCaseName": "testcase30",
		"assignedTestScenarioIds": [],
		"testSuiteId": "97859bba-c488-42d4-89b0-b37ea9396711",
		"testSuiteName": "Suite_Scenario_TC_26_27_28_29_TC_30_51_ClearCache_1",
		"taskDetails": [{
			"taskName": "Create TestCase",
			"taskDescription": "Design Testcase screen 30",
			"taskType": "Design",
			"subTaskType": "TestCase",
			"subTaskId": "98d5e9bc-0433-47aa-8709-f4390d5ca081",
			"assignedTo": "cdbb502a-84ef-435a-92c4-31af4173bb9e",
			"startDate": "27/02/2017",
			"expectedEndDate": "01/03/2017",
			"status": "Assigned"
		}]
	}, {
		"appType": "Web",
		"projectId": "5122b95c-84ad-40fd-9f10-e29988323fb5",
		"releaseId": "208878f2-bca5-4915-90c3-3b54a7b092a9",
		"cycleId": "0e9a156c-3b87-4765-a3ce-201809139cbe",
		"screenId": "e35b12c8-b193-4f48-9990-033d788e306e",
		"screenName": "Screen_Name_30",
		"testCaseId": "21950747-f61b-4d09-8a45-f8bb0e5135b2",
		"testCaseName": "testcase30",
		"assignedTestScenarioIds": [],
		"testSuiteId": "97859bba-c488-42d4-89b0-b37ea9396711",
		"testSuiteName": "Suite_Scenario_TC_26_27_28_29_TC_30_51_ClearCache_1",
		"taskDetails": [{
			"taskName": "Execution",
			"taskDescription": "Execution Screen 30",
			"taskType": "Execution",
			"subTaskType": "TestSuite",
			"subTaskId": "98d5e9bc-0433-47aa-8709-f4390d5ca081",
			"assignedTo": "cdbb502a-84ef-435a-92c4-31af4173bb9e",
			"startDate": "27/02/2017",
			"expectedEndDate": "01/03/2017",
			"status": "Assigned"
		}]
	}, {
		"appType": "Web",
		"projectId": "d4965851-a7f1-4499-87a3-ce53e8bf8e66",
		"releaseId": "46974ffa-d02a-49d8-978d-7da3b2304255",
		"cycleId": "e72246bb-3e68-4342-8f02-7ce6eda1d662",
		"screenId": "",
		"screenName": "",
		"testCaseId": "",
		"testCaseName": "",
		"assignedTestScenarioIds": [],
		"testSuiteId": "34580d13-4e10-4d78-b1b5-a52ef0adf5c6",
		"testSuiteName": "MM_Module_1",
		"taskDetails": [{
			"taskName": "Execution",
			"taskDescription": "Execute test suite : MM_Module_1",
			"taskType": "Execution",
			"subTaskType": "TestSuite",
			"subTaskId": "98d5e9bc-0433-47aa-8709-f4390d5ca081",
			"assignedTo": "80a48a83-443f-4ecd-b08d-96818eae7347",
			"startDate": "24/02/2017",
			"expectedEndDate": "01/03/2017",
			"status": "Assigned"
		}]

	}];
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
	
    $scope.getTask = function(){
    	$("#fileInputJson").attr("type","file");
    	$("#fileInputJson").trigger('click');
    	fileInputJson.addEventListener('change', function(e) {
				// Put the rest of the demo code here.
				var file = fileInputJson.files[0];
				var textType = /json.*/;
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
    }
    
    $scope.taskRedirection = function(subtask,screenid,screenname,projectname,taskname,testcaseid,testcasename,apptype,releaseid,cycleid,testsuiteid,testsuitename){
		var taskObj = {};
		taskObj.screenId = screenid;
		taskObj.screenName = screenname;
		taskObj.projectId = projectname;
		taskObj.taskName = taskname;
		taskObj.testCaseId = testcaseid;
		taskObj.testCaseName = testcasename;
		taskObj.appType = apptype;
		taskObj.releaseId = releaseid;
		taskObj.cycleId = cycleid;
		taskObj.testSuiteId = testsuiteid;
		taskObj.testSuiteName = testsuitename;
		taskObj.subTask = subtask; 
		window.localStorage['_CT'] = JSON.stringify(taskObj);
    	if(subtask == "Scrape") 			$window.location.assign("/design")
    	else if(subtask == "TestCase")		$window.location.assign("/designTestCase")
    	else if(subtask == "TestSuite")		$window.location.assign("/execute")
    	else if(subtask == "Scheduling")	$window.location.assign("/scheduling")
    }

}]);

//Plugin click event - Creating Scope to define the function and returning back to controller
function p_event(name){
    angular.element(document.getElementsByClassName("plugin-block")).scope().pluginFunction(name)
	if(name == "p_Mindmap")
	{
		debugger;
		window.location.href = '/home';
	}
}

function taskRedirection(subtask,screenid,screenname,projectname,taskname,testcaseid,testcasename,apptype,releaseid,cycleid,testsuiteid,testsuitename){
	angular.element(document.getElementsByClassName("assignedTask")).scope().taskRedirection(subtask,screenid,screenname,projectname,taskname,testcaseid,testcasename,apptype,releaseid,cycleid,testsuiteid,testsuitename)
}
