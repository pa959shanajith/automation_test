/**
 * 
 */
var DOMAINID;
mySPA.controller('adminController', ['$scope', '$http', 'adminServices', function ($scope, $http, adminServices) {

 $scope.create_userCheck = function () {				//Yes-----------------------------------
        $scope.userNameRequired = '';
        $scope.passwordRequired = '';
        $scope.firstNameRequired = '';
        $scope.lastNameRequired = '';
        $scope.emailRequired = '';
        $scope.roleRequired = '';
        $scope.loadIcon = '';
        var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,16}$/;
        var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
        if (!$scope.userName) {
            $scope.userNameRequired = 'Enter User Name';
        } else if (!$scope.passWord && !$('.ldapChkBox').is(':checked')) {
            $scope.passwordRequired = 'Enter Password';
        } else if (regexPassword.test($scope.passWord) == false && !$('.ldapChkBox').is(':checked')) {
            $scope.passwordRequired = 'Password must contain atleast 1 special character, 1 numeric, 1 uppercase, length should be minimum 8 character and maximum 12 character';
        } else if (!$scope.firstName) {
            $scope.firstNameRequired = 'Enter First Name';
        } else if (!$scope.lastName) {
            $scope.lastNameRequired = 'Enter Last Name';
        } else if (!$scope.email) {
            $scope.emailRequired = 'Enter Email Address';
        } else if (reg.test($scope.email) == false) {
            $scope.emailRequired = 'Email address is not valid';
        } 
         else if (!$scope.role) {
             $scope.roleRequired = 'Select a Role';
         } 
        else {
            //role = $('#userRoles option:selected').text();
            role = $('#userRoles option:selected').val();
            userName = $scope.userName;
            passWord = $scope.passWord;
            firstName = $scope.firstName;
            lastName = $scope.lastName;
            email = $scope.email;
            role = role;
            ldapUser = $('.ldapChkBox').is(':checked')

            adminServices.createUser_Nineteen68(userName, passWord, firstName, lastName, email, role, ldapUser)
                .then(function (data) { 
                    if (data == "success") {
                        alert('success');
                       // showDialogMesgsBtn("Create User", "New User has been created successfully", "btnCreate");
                    } else {
                        console.log(data);
                        alert('fail');
                       // showDialogMesgsBtn("User Creation Failed", "User Already Exists", "btnCreateFail");
                    }
                }, function (error) { console.log("Error:::::::::::::", error) })
        }
    };

    //Get User Roles in the select container
    $scope.getUserRoles = function (getTab) {	//Yes---------------------------------
        $("#passwordIcon").parent().show()
        adminServices.getUserRoles_Nineteen68()
            .then(function (response) {
                 userRoleArrayList = response.userRoles;
                 var getDropDown;
                 if (getTab == "create") {
                     getDropDown = $('#userRoles');
                 }
                 else if (getTab == "edit") {
                     getDropDown = $('#userRolesED');
                 }
                 getDropDown.empty();
                 getDropDown.append('<option value=""selected>Select User Role</option>');
                 for (var i = 0; i < userRoleArrayList.length; i++) {
                    getDropDown.append($("<option value=" + response.r_ids[i] + "></option>").text(userRoleArrayList[i]));
                 }
                 window.localStorage['_R'] = response.r_ids;
            }, function (error) { console.log("Error:::::::::::::", error) })
    };

}]);

