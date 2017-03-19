/**
 * 
 */
var DOMAINID;
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
            debugger;
            $("img.selectedIcon").removeClass("selectedIcon");
            $(this).children().find('img').addClass('selectedIcon');
        });

        $("#projectTab").on('click',function() {
            debugger;
            $("img.selectedIcon").removeClass("selectedIcon");
            $(this).children().find('img').addClass('selectedIcon');
        });

         $("#preferencesTab").on('click',function() {
            debugger;
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
        console.log('clicked');
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

}]);

