mySPA.controller('executionController',['$scope','$http','$timeout','$location','ExecutionService', function ($scope, $http, $timeout, $location, ExecutionService) {
	$("body").css("background","#eee");
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
	    $('.scrollbar-macosx').scrollbar();
	    document.getElementById("currentYear").innerHTML = new Date().getFullYear()
	}, 500)
    
    //Task Listing
    loadUserTasks()
}]);

