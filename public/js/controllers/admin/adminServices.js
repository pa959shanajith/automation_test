/**
 * Admin Services 
 */
mySPA.factory('adminServices', ['$http', '$q', function ($http, $q) {
    return {
        getUserRoles_Nineteen68: function () {
            var param = "getUserRoles_Nineteen68";
            return $http.post('/getUserRoles_Nineteen68', {
                action: param
            })
                .then(function (response) { return response.data; },
                function (response) { return $q.reject(response.data); });
        },
         createUser_Nineteen68: function (createUser) {
            var param = "createUser_Nineteen68";
            return $http.post('/createUser_Nineteen68', {
                action: param,
                createUser:createUser
            })
                .then(function (response) { return response.data; },
                function (response) { return $q.reject(response.data); });
        },
    };
}]);