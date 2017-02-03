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
	    deleteScrapeObjects_ICE : function(){
		      return $http.post('/deleteScrapeObjects_ICE',{
		    	  	param : 'deleteScrapeObjects_ICE'
		      })
		      .then(function(response)  { return response.data},
		       function(response)        {return $q.reject(response.data)})
		    },
	    highlightScrapElement_ICE: function(xpath,url) {    		
			   // the $http API is based on the deferred/promise APIs exposed by the $q service
			   // so it returns a promise for us by default

			   //var appType = window.localStorage['appTypeScreen'];
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
		   updateScrapeData_ICE : function(getScrapeData,moduleId,screenId,screenName,userinfo){
               return $http.post('/updateScrapeData_ICE',{
                     param : 'updateScrapeData_ICE',
                     getScrapeData : getScrapeData,
                     appType       :      "Web",
                     moduleId : moduleId,
                     screenId : screenId,
                     screenName: screenName,
                     userInfo : userinfo
               })
               .then(function(response) { 
                     return response.data
               },
               function(response) {
                     return $q.reject(response.data)
               })
        }

		    
  }
}]);
