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
		  getDomains_ICE: function () {
            var param = "getDomains_ICE";
            return $http.post('/getDomains_ICE', {
                action: param
            })
                .then(function (response) { return response.data; },
                function (response) { return $q.reject(response.data); });
        },
		 checkReleaseNameExists_ICE: function (releaseName) {
            var param = "checkReleaseNameExists_ICE";
            return $http.post('/checkReleaseNameExists_ICE', {
                action: param,
                releaseName : releaseName
            })
            .then(function (response) { return response.data; },
            function (response) { return $q.reject(response.data); });
        },
         checkCycleNameExists_ICE: function (cycleName) {
            var param = "checkCycleNameExists_ICE";
            return $http.post('/checkCycleNameExists_ICE', {
                action: param,
                cycleName : cycleName
            })
            .then(function (response) { return response.data; },
            function (response) { return $q.reject(response.data); });
        },
		 createProject_ICE: function (createprojectObj,userDetails) {
            var param = "createProject_ICE";
            return $http.post('/createProject_ICE', {
                action: param,
				userDetails:userDetails,
				createProjectObj: createprojectObj
            })
            .then(function (response) { return response.data; },
            function (response) { return $q.reject(response.data); });
        },
		updateProject_ICE: function (updateProjectObj,userDetails) {
            var param = "updateProject_ICE";
            return $http.post('/updateProject_ICE', {
                action: param,
				userDetails:userDetails,
				updateProjectObj: updateProjectObj
            })
            .then(function (response) { return response.data; },
            function (response) { return $q.reject(response.data); });
        },
		getNames_ICE: function (requestedids,idtype) {
            var param = "getNames_ICE";
            return $http.post('/getNames_ICE', {
                action: param,
				requestedids:requestedids,
				idtype: idtype
            })
            .then(function (response) { return response.data; },
            function (response) { return $q.reject(response.data); });
        },
		getDetails_ICE: function (idtype,requestedids) {
            var param = "getDetails_ICE";
            return $http.post('/getDetails_ICE', {
				param:param,
				idtype:idtype,
				requestedids:requestedids
            })
            .then(function (response) { return response.data; },
            function (response) { return $q.reject(response.data); });
        }
    };
}]);