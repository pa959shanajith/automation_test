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

    	getAllUsers_Nineteen68 : function(){
    		var param = "getAllUsers_Nineteen68";
    		return $http.post('/getAllUsers_Nineteen68', {
    			action: param
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
    	
    	getUsersInfo : function(userId, userName){
    		var param = "getEditUsersInfo_Nineteen68";
    		return $http.post('/getEditUsersInfo_Nineteen68', {
    			action: param,
    			userId: userId,
    			userName: userName
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
    	
    	updateUser_nineteen68: function (updateUserObj) {
    		var param = "updateUser_nineteen68";
    		return $http.post('/updateUser_nineteen68', {
    			action: param,
				updateUserObj : updateUserObj
    		})
    		.then(function (response) { return response.data; },
    				function (response) { return $q.reject(response.data); });
    	},
    };
}]);