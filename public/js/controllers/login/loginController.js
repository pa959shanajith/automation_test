mySPA.controller('loginController', function ($scope, $http, $location, LoginService, cfpLoadingBar) {
    $(".ic-username, .ic-password").parent().removeClass("input-border-error")
    $scope.loginValidation = "";
    window.localStorage['LoginSuccess'] = "False";
    $("#yearlogin").text(new Date().getFullYear());
    var availablePlugins = [{
        "id": "123478",
        "pluginName": "Mindmap"
      }, {
        "id": "4846654",
        "pluginName": "Neuron 2D"
      }, {
        "id": "4464166",
        "pluginName": "Neuron 3D"
      }, {
        "id": "5458468",
        "pluginName": "Oxbow Code Identifier"
      }, {
        "id": "56466",
        "pluginName": "Reports"
      }, {
        "id": "8579469",
        "pluginName": "Dead Code Identifier"
      }, {
        "id": "544684",
        "pluginName": "RAID"
      }];
    window.localStorage['availablePlugins'] = angular.toJson(availablePlugins)
    $scope.check_credentials = function (path) {
        cfpLoadingBar.start();
        $scope.loginValidation = "";
        $(".ic-username, .ic-password").parent().removeClass("input-border-error")
        if (!$scope.userName) {
            $(".ic-username").children().attr("src", "imgs/ic-username-error.png");
            $(".ic-username").parent().addClass("input-border-error")
            $(".ic-password").children().attr("src", "imgs/ic-password.png");
            $(".ic-password").parent().removeClass("input-border-error")
            $scope.loginValidation = "Please Enter Username";
            cfpLoadingBar.complete();
        }
        else if (!$scope.password) {
            $(".ic-username").children().attr("src", "imgs/ic-username.png");
            $(".ic-username").parent().removeClass("input-border-error")
            $(".ic-password").children().attr("src", "imgs/ic-password-error.png");
            $(".ic-password").parent().addClass("input-border-error")
            $scope.loginValidation = "Please Enter Password";
            cfpLoadingBar.complete();
        }
        else {
            var username = $scope.userName;
            var password = $scope.password;
            LoginService.authenticateUser_Nineteen68(username, password)
                .then(function (data) {
                    if (data == 'inValidCredential') {
                        $scope.loginValidation = "The username or password you entered isn't correct. Try entering it again.";
                        cfpLoadingBar.complete();
                    }
                    else {
                        if (data == 'validCredential') {
                            cfpLoadingBar.complete();
                            $(".ic-username").children().attr("src", "imgs/ic-username.png");
                            $(".ic-password").children().attr("src", "imgs/ic-password.png");
                            $(".ic-username, .ic-password").parent().removeClass("input-border-error")
                            var username = $scope.userName;
                            var password = $scope.password;
                            $scope.loginButtonValidation = '';

                            LoginService.loadUserInfo_Nineteen68(username)
                                .then(function (data) {
                                    window.localStorage['LoginSuccess'] = "True";
                                    window.localStorage['_UI'] = JSON.stringify(data);
                                    var role = data.role;
                                        LoginService.getRoleNameByRoleId_Nineteen68(role)
                                        .then(function (data) {
                                        window.localStorage['_SR'] = data;
                                        if(data == "Admin")
                                        {
                                            window.location.href = "/admin";
                                        }
                                        else{
                                            window.location.href = "/plugin";
                                        }

                                        }, function (error) { console.log("Fail to Load UserInfo") });                                  
                                }, function (error) { console.log("Fail to Load UserInfo") });
                        }

                    }

                }, function (error) { console.log("Failed to Authenticate User") });
        }
    }
});

