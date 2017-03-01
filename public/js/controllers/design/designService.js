mySPA.factory('DesignServices', ['$http','$q', function ($http, $httpProvider, $q)   {
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
			var appType =  JSON.parse(window.localStorage['_CT']).appType;
			var screenId = JSON.parse(window.localStorage['_CT']).screenId;
			var projectId = JSON.parse(window.localStorage['_CT']).projectId;
			return $http.post('/getScrapeDataScreenLevel_ICE',{
				param : 'getScrapeDataScreenLevel_ICE',
				screenId : screenId,
				appType : appType,
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

		readTestCase_ICE : function(screenId,testCaseId,testCaseName){
			return $http.post('/readTestCase_ICE',{
				param : 'readTestCase_ICE',
				screenid: screenId,
				testcaseid: testCaseId,
				testcasename: testCaseName
			})
			.then(function(response)  { 
				return response.data
			},function(response){
				return $q.reject(response.data)
			})
		},
		updateTestCase_ICE : function(screenId,testCaseId,testCaseName,mydata,userInfo){
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
				versionnumber: "1"
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
				browsertypes: browserType,
				testcaseids: testcaseID
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
		}
	}
}]);
