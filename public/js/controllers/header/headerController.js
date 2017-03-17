/**
 * 
 */
var userDetails,userRole;
mySPA.controller('headerController', function($scope,$http,$location,headerServices,cfpLoadingBar) {
	if(window.localStorage['_UI'])
	{
		userDetails = JSON.parse(window.localStorage['_UI']);
	}
	 userRole = window.localStorage['_SR'];
	 $("#displayUsername").text(userDetails.firstname + ' ' + userDetails.lastname)
	 $(".heading-center-light").text('Welcome  '+ userDetails.firstname + ' ' + userDetails.lastname +'!');
	 $(".userRole").text(userRole);
	 if(userRole == 'Admin')
	  {
		  $("#sRole").hide();
	  }
	 $scope.switchRole_Yes = function () 
	 {
	    window.location.href = '/plugin';
	 }
	  if(window.localStorage['_CT'])
	 {
		var projectId =  JSON.parse(window.localStorage['_CT']).projectId;
		headerServices.getProjectDetails_ICE(projectId) 
			.then(function(data){
				$scope.projectDetails = data;
			}, function(error) {	console.log("Failed to fetch projectInfo")});
	 }
	 $scope.logout = function() 
	 {
	     //Logout User Service to be called
	      headerServices.logoutUser_Nineteen68() 
	      .then(function(data){
			  if(data == "Session Expired")
			  {
				    window.localStorage.clear();
			         window.location.href = '/';
			  }
	      }, function(error) {	console.log("Failed to Logout")});
	 }
});

