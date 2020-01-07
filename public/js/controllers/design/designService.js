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

		getScrapeDataScreenLevel_ICE: function(type)	{
			var screenId = JSON.parse(window.localStorage['_CT']).screenId;
			var projectId = JSON.parse(window.localStorage['_CT']).projectId;
			var testCaseId = JSON.parse(window.localStorage['_CT']).testCaseId;
			return $http.post('/getScrapeDataScreenLevel_ICE',{
				param : 'getScrapeDataScreenLevel_ICE',
				screenId : screenId,
				projectId : projectId,
				type:type,
				testCaseId:testCaseId
			})

			.then (function(response){return response.data;	},
					function(response){	return $q.reject(response.data);});	
		},
		
		userObjectElement_ICE: function(custObjProps) {
			return $http.post('/userObjectElement_ICE',
					{"action":"userObjectElement_ICE","object":custObjProps}
			).then(function(response) {
				console.log("create object...", response.data);
				//promise fulfilled
				return response.data;
			}, function(response) {
				// something went wrong
				return $q.reject(response.data);
			});
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

		readTestCase_ICE : function(testCaseId,testCaseName,versionnumber,screenName){
			return $http.post('/readTestCase_ICE',{
				param : 'readTestCase_ICE',
				userInfo: JSON.parse(window.localStorage['_UI']),
				testcaseid: testCaseId,
				testcasename: testCaseName,
				versionnumber: versionnumber,
				screenName : screenName
			})
			.then(function(response)  { 
				return response.data
			},function(response){
				return $q.reject(response.data)
			})
		},

		updateTestCase_ICE : function(testCaseId,testCaseName,mydata,userInfo,versionnumber,import_status){
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
				testcaseid: testCaseId,
				testcasename: testCaseName,
				testcasesteps: JSON.stringify(modifiedData),
				userinfo: userInfo,
				skucodetestcase : "skucodetestcase",
				tags: "tags",
				versionnumber: versionnumber,
				import_status: import_status
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
		
		wsdlAdd : function(wsdlUrl, wsdlSelectedMethod,resultFile){
			return $http.post('/debugTestCase_ICE',{
				param : 'wsdlServiceGenerator_ICE',
				wsdlurl: wsdlUrl,
                method : wsdlSelectedMethod,
                resultFile:resultFile
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
