mySPA.factory('ExecutionService', ['$http','$q', function ($http,$q)   {
	return{
		readTestSuite_ICE : function(readTestSuite){
			return $http.post('/readTestSuite_ICE',{
				param : 'readTestSuite_ICE',
				readTestSuite : readTestSuite,
				fromFlag:	"execution"
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
		},
		
		updateTestSuite_ICE: function(batchDetails){
			return $http.post('/updateTestSuite_ICE',{
				param : 'updateTestSuite_ICE',
				batchDetails: batchDetails
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
		},
		
		ExecuteTestSuite_ICE : function(executionData){
			return $http.post('/ExecuteTestSuite_ICE', {
				param : 'ExecuteTestSuite_ICE',
				executionData: executionData
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
		},
		QClogin : function(url, userName, passWord){
			return $http.post('/QCLOGIN_ICE',{
				param : 'QCLOGIN_ICE',
				url : url,
            	uname : userName,
            	password : passWord
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
		},
		
		saveQcScenarioDetails : function(scenarioIdQC,domainName,projectName,testSetName,testCaseName,folderPath){
			return $http.post('/saveQcScenarioDetails_ICE',{
				param : 'saveQcScenarioDetails_ICE',
				testScenarioId : scenarioIdQC,
            	domainName : domainName,
            	projectName : projectName,
            	testset : testSetName,
            	testcase : testCaseName,
            	folderpath : folderPath
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
		},
		
		getQcScenarioDetails: function(scenarioIdQC){
			return $http.post('/getQcScenarioDetails_ICE',{
				param : 'getQcScenarioDetails_ICE',
				testScenarioId : scenarioIdQC
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
	    },
	    loadLocationDetails: function(scenarioName, scenarioId){
			return $http.post('/getTestcaseDetailsForScenario_ICE',{
				param : 'getTestcaseDetailsForScenario_ICE',
				testScenarioId : scenarioId
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
	    },
		loginQCServer_ICE: function(qcURL,qcUserName,qcPassword){
    		var param = "loginQCServer_ICE";
	        return $http.post('/loginQCServer_ICE', {
				action: param,
              	qcURL: qcURL,
				qcUsername: qcUserName,
				qcPassword : qcPassword,
				qcaction: "domain"
	        })
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
		},
		loginQTestServer_ICE: function(qcURL,qcUserName,qcPassword, qcType){
    		var param = "loginToQTest_ICE";
	        return $http.post('/loginToQTest_ICE', {
				action: param,
              	qcURL: qcURL,
				qcUsername: qcUserName,
				qcPassword : qcPassword,
				qcType : qcType,
				qcaction: "domain"
	        })
			.then (function(response)	{return response.data;	},
			function(response){	return $q.reject(response.data);});	
    	}
	}
}]);
