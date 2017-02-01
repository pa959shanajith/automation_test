mySPA.controller('pluginController',['$scope','$window','$http','$location','$timeout','PluginService', function($scope,$window,$http,$location,$timeout,PluginService) {
	$('.scrollbar-inner').scrollbar()
	document.getElementById("currentYear").innerHTML = new Date().getFullYear()
    var userInfo = JSON.parse(window.localStorage['_UI']);
    var availablePlugins = userInfo.pluginsInfo;
    $("#plugin-container").empty().hide()
    for(i=0; i<availablePlugins.length; i++){
        $("#plugin-container").append('<div class="col-md-4 plugin-block"><span onclick="p_event(this.dataset.name)" data-name="p_'+availablePlugins[i].pluginName.replace(/\s/g,'')+'" id="'+availablePlugins[i].id+'">'+availablePlugins[i].pluginName+'</span></div>').fadeIn()
    }

    //Plugin click event 
    $scope.pluginFunction = function(name){
        alert(name)
    }
    
  //Task Function
    var tasksJson = [{
    	"Project_Id": "4464668464",
    	"Node_Type": "Web",
    	"Node_Id": "4464668464",
    	"Task_Type": "Design",
    	"Sub_Task" : "Screen",
    	"Task_Name": "Create Screen"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "Desktop",
    	"Node_Id": "4464668464",
    	"Task_Type": "Execution",
    	"Sub_Task" : "TestSuite",
    	"Task_Name": "Create TestSuite"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "iOS",
    	"Node_Id": "4464668464",
    	"Task_Type": "Design",
    	"Sub_Task" : "TestScript",
    	"Task_Name": "Create TestScript"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "Android",
    	"Node_Id": "4464668464",
    	"Task_Type": "Design",
    	"Sub_Task" : "TestScript",
    	"Task_Name": "Debug TestScript"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "DesktopJava",
    	"Node_Id": "4464668464",
    	"Task_Type": "Execution",
    	"Sub_Task" : "Scheduling",
    	"Task_Name": "Schedule TestSuite"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "iOS",
    	"Node_Id": "4464668464",
    	"Task_Type": "Design",
    	"Sub_Task" : "TestScript",
    	"Task_Name": "Create TestScript"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "Android",
    	"Node_Id": "4464668464",
    	"Task_Type": "Design",
    	"Sub_Task" : "TestScript",
    	"Task_Name": "Debug TestScript"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "DesktopJava",
    	"Node_Id": "4464668464",
    	"Task_Type": "Execution",
    	"Sub_Task" : "Scheduling",
    	"Task_Name": "Schedule TestSuite"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "DesktopJava",
    	"Node_Id": "4464668464",
    	"Task_Type": "Execution",
    	"Sub_Task" : "Scheduling",
    	"Task_Name": "Schedule TestSuite"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "DesktopJava",
    	"Node_Id": "4464668464",
    	"Task_Type": "Execution",
    	"Sub_Task" : "Scheduling",
    	"Task_Name": "Schedule TestSuite"
    }]
    window.localStorage['_TJ'] = angular.toJson(tasksJson)
    $(".plugin-taks-listing").empty().hide()
    var counter = 1;
    for(i=0; i<tasksJson.length; i++){
		if(tasksJson[i].Task_Type == "Design"){
    		$(".plugin-taks-listing").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+i+'"><span class="taskNo">Task '+ counter +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-head-tasktype">'+tasksJson[i].Task_Type+'</span><span class="panel-head-details details-design-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+i+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTask" data-name="'+tasksJson[i].Sub_Task+'" onclick="taskRedirection(this.dataset.name)">'+tasksJson[i].Task_Name+'</span></div></div></div>').fadeIn()
		} 
    	else if(tasksJson[i].Task_Type == "Execution"){
    		$(".plugin-taks-listing").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+i+'"><span class="taskNo">Task '+ counter +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-head-tasktype">'+tasksJson[i].Task_Type+'</span><span class="panel-head-details details-execute-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+i+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTask" data-name="'+tasksJson[i].Sub_Task+'" onclick="taskRedirection(this.dataset.name)">'+tasksJson[i].Task_Name+'</span></div></div></div>').fadeIn()
    	}
		counter++
    }
    
    $scope.taskRedirection = function(path){
    	if(path == "Screen") 			$window.location.assign("/design")
    	else if(path == "TestScript")	$window.location.assign("/designTestScript")
    	else if(path == "TestSuite")	$window.location.assign("/execute")
    	else if(path == "Scheduling")	$window.location.assign("/scheduling")
    }

}]);

//Plugin click event - Creating Scope to define the function and returning back to controller
function p_event(name){
    angular.element(document.getElementsByClassName("plugin-block")).scope().pluginFunction(name)
}

function taskRedirection(name){
	angular.element(document.getElementsByClassName("assignedTask")).scope().taskRedirection(name)
}
