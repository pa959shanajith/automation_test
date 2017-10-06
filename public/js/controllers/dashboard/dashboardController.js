mySPA.controller('dashboardController', ['$scope', '$http', '$location', '$timeout', 'dashboardService', 'cfpLoadingBar', '$window', function($scope, $http, $location, $timeout, dashboardService, cfpLoadingBar, $window) {
  $scope.levels = ["Test Suites", "Cycles", "Releases","Projects"];
  $scope.selectedLevel = "Test Suites";
  $scope.showButtons = false;
  $scope.showButtonsSection = function(){
    $scope.showButtons = true;
  }
  function graph1 (testData){
    dashboardService.loadDashboard(testData)
    .then(function(data){
      console.log(data);
        if(data == "Invalid Session"){
  				window.location.href = "/";
  			}
        if (data != 'fail') {
          $("#dashboardSection").append(data);
        }else{
          console.log("error in loding the dashboard")
        }

    }, function(error){
      console.log(error);
    });
  }

 function filterBy(obj, objDetails, label){
      myChart.data.datasets[0].data = Object.values(obj);
      myChart.data.datasets[0].label = ;
      myChart.data.labels = [];
      for(x in obj){
        myChart.data.labels.push(objDetails[x])
      }
      myChart.update();
  }

  $scope.update = function(){
    console.log($scope.selectedLevel);
    if ($scope.selectedLevel == "Test Suites") {
      filterBy($scope.tsData);
    }else if ($scope.selectedLevel == "Cycles") {
      filterBy($scope.cyData);
    }else if($scope.selectedLevel == "Releases"){
      filterBy($scope.rlData);
    }else{
      filterBy($scope.pjData);
    }
  }

  $scope.selBtn = "ts";
  $scope.updateBtn = function(opt){
    if (opt == "ts") {
      $scope.selBtn = "ts"
      filterBy($scope.tsData, $scope.eData.testsuiteDetails, "testsuites");
    }else if (opt == "cy") {
      $scope.selBtn = "cy"
      filterBy($scope.cyData, $scope.eData.cycleDetails, "cycles");
    }else if(opt == "rl"){
      $scope.selBtn = "rl"
      filterBy($scope.rlData, $scope.eData.releaseDetails, "releases");
    }else{
      $scope.selBtn = "pj"
      filterBy($scope.pjData, $scope.eData.projectDetails, "projects");
    }
  }

  var userInfo =  JSON.parse(window.localStorage['_UI']);
  var userid = userInfo.user_id;

  dashboardService.loadDashboardData(userid)
  .then((data)=>{
    console.log(data);
    var tsData = {};
    var cyData = {};
    var relData = {};
    var pjData = {};
    var totalex = 0;
    data.eData.executionDetails.forEach(function(e){
      if (!tsData.hasOwnProperty(e.ts)) {
        tsData[e.ts] = e.ex;
      }else{
        tsData[e.ts] = tsData[e.ts] + e.ex;
      }

      if (!cyData.hasOwnProperty(e.cy)) {
        cyData[e.cy] = e.ex;
      }else{
        cyData[e.cy] = cyData[e.cy] + e.ex;
      }

      if (!relData.hasOwnProperty(e.rl)) {
        relData[e.rl] = e.ex;
      }else{
        relData[e.rl] = relData[e.rl] + e.ex;
      }
      if(!pjData.hasOwnProperty(e.pj)){
        pjData[e.pj] = e.ex;
      }else{
        pjData[e.pj] = pjData[e.pj] + e.ex;
      }

      totalex = totalex + e.ex;

    });
    console.log(totalex);
    $scope.totalExTime = totalex/1000;
    $scope.tsData= tsData;
    Object.keys($scope.tsData).map(function(key, index) {
       $scope.tsData[key] = $scope.tsData[key]/(3600*1000);
       $scope.tsData[key] = $scope.tsData[key].toFixed(2);

    });
    $scope.cyData= cyData;
    Object.keys($scope.cyData).map(function(key, index) {
       $scope.cyData[key] = $scope.cyData[key]/(3600*1000);
       $scope.cyData[key] = $scope.cyData[key].toFixed(2);
    });
    $scope.rlData= relData;
    Object.keys($scope.rlData).map(function(key, index) {
       $scope.rlData[key] = $scope.rlData[key]/(3600*1000);
       $scope.rlData[key] = $scope.rlData[key].toFixed(2);
    });
    $scope.pjData= pjData;
    Object.keys($scope.pjData).map(function(key, index) {
       $scope.pjData[key] = $scope.pjData[key]/(3600*1000);
       $scope.pjData[key] = $scope.pjData[key].toFixed(2);
    });
    $scope.eData = data.eData;
    console.log(relData);
    console.log(pjData);
    graph1(data.eData);

  }, (err)=>{
    console.log(err);
  });


}]);
