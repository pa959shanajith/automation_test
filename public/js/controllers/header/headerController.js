/**
 * 
 */
var userDetails,userRole;
mySPA.controller('headerController', function($scope,$http,$location,headerServices,cfpLoadingBar) {
	 userDetails = JSON.parse(window.localStorage['_UI']);
	 userRole = window.localStorage['_SR'];
	 $("#displayUsername").text(userDetails.firstname + ' ' + userDetails.lastname)
	 $(".heading-center-light").text('Welcome  '+ userDetails.firstname + ' ' + userDetails.lastname +'!');
	 $(".userRole").text(userRole);
	 if(userRole == 'Admin')
	  {
	      $(".dropdown-userrole").html('')
	      $(".dropdown-userPart").children('div:first-child').css("border","none");  
	  }
	 $scope.switchRole_Yes = function () 
	 {
	    window.location.href = '/plugin';
	 }
	 $scope.logout = function() 
	 {
	     window.localStorage.clear();
	     window.location.href = '/';
	     //Logout User Service to be called
	      headerServices.logoutUser 
	      .then(function(data){
	          
	      }, function(error) {	console.log("Failed to Logout")});
	 }
});

