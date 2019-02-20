mySPA.factory('DesignServices', ['$http','$q', function ($http,$q)   {
	return{
		initScraping_ICE : function(screenViewObject){
			return $http.post('/initScraping_ICE',{
				param : 'initScraping_ICE',
				screenViewObject: screenViewObject
			})
			.then(function(response)  { return response.data},
					function(response)        {return $q.reject(response.data)})
		},

		highlightScrapElement_ICE: function(xpath,url,appType) {
			return $http.post('/highlightScrapElement_ICE',
					{"action":"highlightScrapElement_ICE","elementXpath":xpath,"elementUrl" : url,"appType":appType}
			).then(function(response) {
				console.log("highlightScrapElement ...", response.data);
				//promise fulfilled
				return response.data;
			}, function(response) {
				// something went wrong
				return $q.reject(response.data);
			});
		},

		getScrapeDataScreenLevel_ICE: function()	{
			var screenId = JSON.parse(window.localStorage['_CT']).screenId;
			var projectId = JSON.parse(window.localStorage['_CT']).projectId;
			return $http.post('/getScrapeDataScreenLevel_ICE',{
				param : 'getScrapeDataScreenLevel_ICE',
				screenId : screenId,
				projectId : projectId
			})

			.then (function(response){return response.data;	},
					function(response){	return $q.reject(response.data);});	
		},

		updateScreen_ICE : function(scrapeObject){
			return $http.post('/updateScreen_ICE',{
				scrapeObject : scrapeObject
			})
			.then(function(response) { 
				return response.data
			},
			function(response) {
				return $q.reject(response.data)
			})
		},
		
		mapScrapeData_ICE : function(updateData){
			return $http.post('/updateScreen_ICE',{
				scrapeObject : scrapeObject
			})
			.then(function(response) { 
				return response.data
			},
			function(response) {
				return $q.reject(response.data)
			})
		},

		readTestCase_ICE : function(screenId,testCaseId,testCaseName,versionnumber){
			return $http.post('/readTestCase_ICE',{
				param : 'readTestCase_ICE',
				screenid: screenId,
				testcaseid: testCaseId,
				testcasename: testCaseName,
				versionnumber: versionnumber
			})
			.then(function(response)  { 
				return response.data
			},function(response){
				return $q.reject(response.data)
			})
		},

		updateTestCase_ICE : function(screenId,testCaseId,testCaseName,mydata,userInfo,versionnumber){
			var modifiedData = JSON.parse(JSON.stringify(mydata));
			for(i=0;i<modifiedData.length;i++){
				if(modifiedData[i].inputVal == undefined){
					modifiedData[i].inputVal = "";
				}
				modifiedData[i].inputVal= JSON.stringify(modifiedData[i].inputVal);

				if(modifiedData[i].inputVal[0] != '['){
					modifiedData[i].inputVal = jQuery.parseJSON('['+modifiedData[i].inputVal+']');
				}else{
					modifiedData[i].inputVal = jQuery.parseJSON(modifiedData[i].inputVal); 
				}
			}
			return $http.post('/updateTestCase_ICE',{
				param : 'updateTestCase_ICE',
				screenid: screenId,
				testcaseid: testCaseId,
				testcasename: testCaseName,
				testcasesteps: JSON.stringify(modifiedData),
				userinfo: userInfo,
				skucodetestcase : "skucodetestcase",
				tags: "tags",
				versionnumber: versionnumber
			})
			.then(function(response)  { 
				return response.data
			},function(response){
				return $q.reject(response.data)
			})
		},

		//Debug Testcases
		debugTestCase_ICE : function(browserType,testcaseID){
			return $http.post('/debugTestCase_ICE',{
				param : 'debugTestCase_ICE',
				userInfo: JSON.parse(window.localStorage['_UI']),
				browsertypes: browserType,
				testcaseids: testcaseID,
				apptype: appType
			})
			.then(function(response)  { 
				return response.data
			},function(response){
				return $q.reject(response.data)
			})
		},

		initScrapeWS_ICE : function(initWSJson){
			return $http.post('/debugTestCase_ICE',{
				param : 'debugTestCaseWS_ICE',
				testCaseWS: initWSJson
			})
			.then(function(response)  { 
				return response.data
			},function(response){
				return $q.reject(response.data)
			})
		},

		getKeywordDetails_ICE : function(appType){
			return $http.post('/getKeywordDetails_ICE',{
				param : 'getKeywordDetails_ICE',
				projecttypename : appType
			})
			.then(function(response)  { 
				return response.data
			},function(response){
				return $q.reject(response.data)
			})
		},
		
		launchWSDLGo: function(wsdlUrl){
			return $http.post('/debugTestCase_ICE',{
				param : 'wsdlListGenerator_ICE',
				wsdlurl: wsdlUrl
			})
			.then(function(response)  { 
				return response.data
			},function(response){
				return $q.reject(response.data)
			})
		},
		
		wsdlAdd : function(wsdlUrl, wsdlSelectedMethod){
			return $http.post('/debugTestCase_ICE',{
				param : 'wsdlServiceGenerator_ICE',
				wsdlurl: wsdlUrl,
                method : wsdlSelectedMethod
			})
			.then(function(response)  { 
				return response.data
			},function(response){
				return $q.reject(response.data)
			})
		},
		getTestcasesByScenarioId_ICE : function(testScenarioId){
				return $http.post('/getTestcasesByScenarioId_ICE',{
				param : 'getTestcasesByScenarioId_ICE',
				testScenarioId : testScenarioId
			})
			.then(function(response)  { 
				return response.data
			},function(response){
				return $q.reject(response.data)
			})
		},
		updateIrisDataset : function(data){
			return $http.post('/updateIrisDataset',{
				data : data
			})
			.then(function(response)  { 
				return response.data
			},function(response){
				return $q.reject(response.data)
			})
		}
	}
}]);
