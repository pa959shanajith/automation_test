mySPA.factory('DesignServices', ['$http','$q', function ($http, $httpProvider, $q)   {
	return{
		initScraping_ICE : function(browserType){
			return $http.post('/initScraping_ICE',{
				param : 'initScraping_ICE',
				browserType: browserType
			})
			.then(function(response)  { return response.data},
					function(response)        {return $q.reject(response.data)})
		},
		highlightScrapElement_ICE: function(xpath,url) {
			return $http.post('/highlightScrapElement_ICE',
					{"action":"highlightScrapElement_ICE","elementXpath":xpath,"elementUrl" : url,"appType":"web"}
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
			var screenId = JSON.parse(window.localStorage['_T']).screenId;
			return $http.post('/getScrapeDataScreenLevel_ICE',{
				param : 'getScrapeDataScreenLevel_ICE',
				screenId : screenId
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

		readTestCase_ICE : function(screenId,testCaseId){
			return $http.post('/readTestCase_ICE',{
				param : 'readTestCase_ICE',
				screenid: screenId,
				testcaseid: testCaseId
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
				versionnumber: "2"
			})
			.then(function(response)  { 
				return response.data
			},function(response){
				return $q.reject(response.data)
			})
		},
	}
}]);
