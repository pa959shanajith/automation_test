mySPA.controller('pluginController', function($scope,$http,$location,PluginService) {
    $('.scrollbar-inner').scrollbar()
    var userInfo = JSON.parse(window.localStorage['_UI']);
    var availablePlugins = userInfo.pluginsInfo;
    $("#plugin-container").empty()
    for(i=0; i<availablePlugins.length; i++){
        $("#plugin-container").append('<div class="col-md-4 plugin-block"><span onclick="p_event(this.dataset.name)" data-name="p_'+availablePlugins[i].pluginName.replace(/\s/g,'')+'" id="'+availablePlugins[i].id+'">'+availablePlugins[i].pluginName+'</span></div>')
    }

    //Plugin click event 
    $scope.pluginFunction = function(name){
        alert(name)
    }
});

//Plugin click event - Creating Scope to define the function and returning back to controller
function p_event(name){
    angular.element(document.getElementsByClassName("plugin-block")).scope().pluginFunction(name)
}