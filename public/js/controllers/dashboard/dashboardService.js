mySPA.factory('dashboardService', ['$http','$q', function ($http,$q)   {
  return{
    loadDashboard: function(query){
      return $http.post('/loadDashboard', {
        testData : query
      })
      .then(function(response){
        return response.data;
      }, function(err){
        console.log(err);
      });
    },

    loadDashboard_2: function(id, labels, values){
      return $http.post('/loadDashboard_2', {
        chart_id : id,
        labels : labels,
        values : values
      })
      .then(function(response){
        return response.data;
      }, function(err){
        console.log(err);
      });
    },

    loadDashboardData: function(userid){
      return $http.post('/loadDashboardData', {
        userid : userid
      })
      .then(function(response){
        return response.data;
      }, function(err){
        console.log(err);
      });
    }
  }
}]);
