mySPA.factory('dashboardService', ['$http','$q', function ($http, $httpProvider, $q)   {
  return{
    loadDashboard: function(query){
      console.log(query);
      return $http.post('/loadDashboard', {
        testData : query
      })
      .then(function(response){
        console.log(response);
        return response.data;
      }, function(err){
        console.log(err);
      })
    },

    loadDashboardData: function(userid){
      console.log(userid);
      return $http.post('/loadDashboardData', {
        userid : userid
      })
      .then(function(response){
        console.log(response);
        return response.data;
      }, function(err){
        console.log(err);
      });
    }
  }
}]);
