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
  }
}]);
