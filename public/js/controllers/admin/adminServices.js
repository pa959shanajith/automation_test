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
         createUser_Nineteen68: function (userName, passWord, firstName, lastName, email, role ,ldapUser) {
            var param = "createUser_Nineteen68";
            return $http.post('/createUser_Nineteen68', {
                action: param,
                    username: userName,
                    password: passWord,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    role: role,
                    ldapUser: ldapUser
            })
                .then(function (response) { return response.data; },
                function (response) { return $q.reject(response.data); });
        },
    };
}]);