mySPA.controller('pluginController',['$scope','$http','$location','$timeout','PluginService', function($scope,$http,$location,$timeout,PluginService) {
    $('.scrollbar-inner').scrollbar()
    var userInfo = JSON.parse(window.localStorage['_UI']);
    var availablePlugins = userInfo.pluginsInfo;
    $(".panel-body").click(function(e) {
        window.location.href = '/design';
    });
    $(document).on("click", ".panel-body", function(){
        window.location.href = '/design';
    })
    $("#plugin-container").empty()
    for(i=0; i<availablePlugins.length; i++){
        $("#plugin-container").append('<div class="col-md-4 plugin-block"><span onclick="p_event(this.dataset.name)" data-name="p_'+availablePlugins[i].pluginName.replace(/\s/g,'')+'" id="'+availablePlugins[i].id+'">'+availablePlugins[i].pluginName+'</span></div>')
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
    	"Release_Id": "68744446+",
    	"Cycle_Id": "574644446"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "Web",
    	"Node_Id": "4464668464",
    	"Task_Type": "Execution",
    	"Release_Id": "68744446+",
    	"Cycle_Id": "574644446"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "Web",
    	"Node_Id": "4464668464",
    	"Task_Type": "Design",
    	"Release_Id": "68744446+",
    	"Cycle_Id": "574644446"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "Web",
    	"Node_Id": "4464668464",
    	"Task_Type": "Design",
    	"Release_Id": "68744446+",
    	"Cycle_Id": "574644446"
    }, {
    	"Project_Id": "4464668464",
    	"Node_Type": "Web",
    	"Node_Id": "4464668464",
    	"Task_Type": "Execution",
    	"Release_Id": "68744446+",
    	"Cycle_Id": "574644446"
    }]
    $(".plugin-taks-listing").empty()
    $timeout(function(){
    	for(i=0; i<tasksJson.length; i++){
	    	if(tasksJson[i].Task_Type == "Design"){
	    		$(".plugin-taks-listing").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+i+'"><span class="taskNo">Task '+ i +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-head-tasktype">'+tasksJson[i].Task_Type+'</span><span class="panel-head-details details-design-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+i+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTask"></span></div></div></div>')
			} 
	    	else if(tasksJson[i].Task_Type == "Execution"){
	    		$(".plugin-taks-listing").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+i+'"><span class="taskNo">Task '+ i +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-head-tasktype">'+tasksJson[i].Task_Type+'</span><span class="panel-head-details details-execute-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+i+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTask"></span></div></div></div>')
	    	}
	    }
    }, 500)
}]);

//Plugin click event - Creating Scope to define the function and returning back to controller
function p_event(name){
    angular.element(document.getElementsByClassName("plugin-block")).scope().pluginFunction(name)
}