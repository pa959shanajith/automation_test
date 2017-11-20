mySPA.controller('dashboardController', ['$scope', '$rootScope', '$http', '$timeout', 'dashboardService', 'cfpLoadingBar', '$window', function($scope, $rootScope, $http, $timeout, dashboardService, cfpLoadingBar, $window) {
  $scope.levels = ["Test Suites", "Cycles", "Releases","Projects"];
  $scope.selectedLevel = "Releases";
  $scope.selectedProject = {
    title : "Program",
    id: null,
    name: null
  }
  $scope.executionStatus = {
    "pass": 0,
    "fail": 0,
    "terminated":0
  }
  //$scope.a = 40;
  function progressAnimate(){
    $('.bar-percentage[data-percentage]').each(function () {
      var progress = $(this);
      var key = $(this).attr('id');
      var percentage = $scope.executionStatus[key];
      //var percentage = Number().toFixed(2);
      $({countNum: 0}).animate({countNum: percentage}, {
        duration: 1500,
        easing:'linear',
        step: function() {
          // What todo on every count
          var pct = '';
          if(percentage == 0){
            pct = Math.floor(this.countNum) + '%';
          }else{
            pct = Math.floor(this.countNum)+1 + '%';
          }
          progress.text(pct) && progress.siblings().children().css('width',pct);
        }
      });
    });
  }


  $scope.showButtons = false;
  $scope.scheduledAdherence = "red";
  $scope.showButtonsSection = function(){
    $scope.showButtons = true;
  }

  $scope.setProject = function(projName, projKey){
    if (projName == $scope.selectedProject.name) {
      return;
    }

    $scope.totalReestimationCount = 0;
    $scope.selectedProject = {
      title: projName? projName : "Program",
      id : projKey,
      name : projName
    };
    $scope.taskStatus= {};
    $scope.taskTypesCount = {};
    $scope.tData.forEach((d)=>{
      $scope.totalReestimationCount += $scope.sumRestimationCount(d.data);
      $scope.getTaskDetails(d.data);
    });

    $scope.getExecutionTime();
    $scope.selBtn = "rl"
    updateChart($scope.rlData, $scope.eData.releaseDetails, "Releases");
    updatePieChart1();
    updatePieChart2();
    if(projName == null){
      $scope.showButtons = false;
      return;
    }
    $scope.showButtonsSection();
  }

  $scope.updateTime  = function(key){
    $scope.convertTimeKey = key;
    $scope.totalExTime.set = $scope.totalExTime[key];
  }
  function graph1 (testData){
    dashboardService.loadDashboard(testData)
    .then(function(data){
      //console.log(data);
      if(data == "Invalid Session"){
        $rootScope.redirectPage();
      }
      if (data != 'fail') {
        $("#first_graph").append(data);
      }else{
        console.log("error in loding the dashboard")
      }

    }, function(error){
      console.log(error);
    });
  }
  function graph2(canvas_id, id, labels, values){

    dashboardService.loadDashboard_2(canvas_id, labels, values)
    .then(function(data){
      console.log(data);
      if(data == "Invalid Session"){
        $rootScope.redirectPage();
      }
      if (data != 'fail') {

        $("#"+id).append(data);
      }else{
        console.log("error in loding the dashboard")
      }

    }, function(error){
      console.log(error);
    });
  }

  $scope.sumRestimationCount = function(data){
    var total = 0;
    data.forEach((d)=>{
      if ($scope.selectedProject.id == null) {
        total += Number(d.row[0].re_estimation);
      }else{
        row = d.row[0];
        if (row.parent.includes($scope.selectedProject.id)) {
          total += Number(row.re_estimation);
        }
      }

    });
    return total;
  }

  $scope.getTaskDetails= function(data){
    var adherenceFlag = true;
    $scope.scheduledAdherence  = "emerald";
    data.forEach((d)=>{
      var taskStatus = d.row[0].status;
        if ($scope.selectedProject.id == null || d.row[0].parent.includes($scope.selectedProject.id)) {
          var date = d.row[0].endDate.split("/");
          var newDate = date[1]+"/"+date[0]+"/"+date[2];
          var newDateTimeStamp = new Date(newDate);
          var currentDateTimeStamp = new Date();
          if(newDateTimeStamp < currentDateTimeStamp && d.row[0].status != "completed"){
            adherenceFlag = false;
            $scope.scheduledAdherence = "red";
          }else if (adherenceFlag && newDateTimeStamp >= currentDateTimeStamp) {
            $scope.scheduledAdherence = "yellow";
          }else if ($scope.scheduledAdherence != "yellow") {
            $scope.scheduledAdherence = "emerald";
          }
          $scope.taskStatus[taskStatus] = $scope.taskStatus[taskStatus]? Number($scope.taskStatus[taskStatus])+1 : 1;
          $scope.taskTypesCount[d.row[0].task] = $scope.taskTypesCount[d.row[0].task] ? Number($scope.taskTypesCount[d.row[0].task])+1 : 1;
        }
      });
  }

  function updateChart(obj, objDetails, label){
    myChart.data.datasets[0].data = Object.values(obj).map(function(e){
      return e/1000;
    });

    //myChart.data.datasets[0].data = Object.values(obj);
    //myChart.data.datasets[0].label = " ("+label+")";
    myChart.data.labels = [];
    if (label=="Releases") {
      myChart.data.datasets[0].backgroundColor = "skyblue";
      myChart.data.datasets[0].hoverBackgroundColor= "skyblue";

    }else{
      myChart.data.datasets[0].backgroundColor = "#74ce74";
      myChart.data.datasets[0].hoverBackgroundColor="#2ecc71";
    }

    for(x in obj){
      myChart.data.labels.push(objDetails[x]);
    }
    myChart.update();
  }

  function updatePieChart1(){
    pie1.data.datasets[0].data =  Object.values($scope.taskStatus);
    pie1.data.labels = Object.keys($scope.taskStatus);
    pie1.update();
  }
  function updatePieChart2(){
    pie2.data.datasets[0].data =  Object.values($scope.taskTypesCount);;
    pie2.data.labels = Object.keys($scope.taskTypesCount);;
    pie2.update();
  }
  // $scope.update = function(){
  //   // if ($scope.selectedLevel == "Test Suites") {
  //   //   filterBy($scope.tsData);
  //   // }else
  //   if($scope.selectedLevel == "Cycles") {
  //     updateChart($scope.cyData);
  //   }else if($scope.selectedLevel == "Releases"){
  //     updateChart($scope.rlData);
  //   }
  //   // else{
  //   //   filterBy($scope.pjData);
  //   // }
  // }

  $scope.selBtn = "rl";
  $scope.updateBtn = function(opt){
    // if (opt == "ts") {
    //   $scope.selBtn = "ts"
    //   updateChart($scope.tsData, $scope.eData.testsuiteDetails, "Testsuites");
    // }else
    if(opt == "cy") {
      $scope.selBtn = "cy"
      updateChart($scope.cyData, $scope.eData.cycleDetails, "Cycles");
    }else if(opt == "rl"){
      $scope.selBtn = "rl"
      updateChart($scope.rlData, $scope.eData.releaseDetails, "Releases");
    }
    // else{
    //   $scope.selBtn = "pj"
    //   updateChart($scope.pjData, $scope.eData.projectDetails, "Projects");
    // }
  }
  $scope.getExecutionTime = function(){

    $scope.tsData = {};
    $scope.cyData = {};
    $scope.rlData = {};
    $scope.pjData = {};
    $scope.totalExTime = 0;
    $scope.totalExecutionCount = 0;
    $scope.executionStatus = {
      "pass" : 0,
      "fail" : 0,
      "terminated" : 0
    }
    var totalStatusCount =0;
    $scope.eData.executionDetails.forEach(function(e){

      if ($scope.selectedProject.id == null || e.pj ==$scope.selectedProject.id ) {
        $scope.executionStatus = {
          "pass" : $scope.executionStatus.pass + Number(e.status.pass),
          "fail" : $scope.executionStatus.fail + Number(e.status.fail),
          "terminated" : $scope.executionStatus.terminated + Number(e.status.terminated)
        }
        totalStatusCount += e.status.pass+e.status.fail+e.status.terminated;
        if (!$scope.tsData.hasOwnProperty(e.ts) ) {
          $scope.tsData[e.ts] = e.ex;
        }else{
          $scope.tsData[e.ts] = $scope.tsData[e.ts] + e.ex;
        }
        if (!$scope.cyData.hasOwnProperty(e.cy)) {
          $scope.cyData[e.cy] = e.ex;
        }else{
          $scope.cyData[e.cy] = $scope.cyData[e.cy] + e.ex;
        }
        if (!$scope.rlData.hasOwnProperty(e.rl)) {
          $scope.rlData[e.rl] = e.ex;
        }else{
          $scope.rlData[e.rl] = $scope.rlData[e.rl] + e.ex;
        }
        if(!$scope.pjData.hasOwnProperty(e.pj)){
          $scope.pjData[e.pj] = e.ex;
        }else{
          $scope.pjData[e.pj] = $scope.pjData[e.pj] + e.ex;
        }
        $scope.totalExTime = $scope.totalExTime + e.ex;
      }
    });
    console.log($scope.executionStatus);

    $scope.executionStatus = {
      "pass" : ($scope.executionStatus.pass/totalStatusCount)*100,
      "fail" : ($scope.executionStatus.fail/totalStatusCount)*100,
      "terminated" : ($scope.executionStatus.terminated/totalStatusCount)*100,
    }


    $scope.totalExTime = {
      "mins" : ($scope.totalExTime/(1000*60)).toFixed(2),
      "secs" : ($scope.totalExTime/(1000)),
      "hrs" : ($scope.totalExTime/(1000*3660)).toFixed(2),
      "days" : Math.ceil($scope.totalExTime/(1000*3600*24)),
      "set" : ($scope.totalExTime/(1000*60)).toFixed(2)
    }
    $scope.convertTimeKey = 'mins';
    progressAnimate();
  }

  var userInfo =  JSON.parse(window.localStorage['_UI']);
  var userid = userInfo.user_id;

  dashboardService.loadDashboardData(userid)
  .then((data)=>{
    //console.log(data);
    $scope.eData = data.eData;
    $scope.tData = data.tData;

    $scope.getExecutionTime();


    Object.keys($scope.tsData).map(function(key, index) {
      $scope.tsData[key] = $scope.tsData[key]/(1000);
      $scope.tsData[key] = $scope.tsData[key].toFixed(2);
    });

    Object.keys($scope.cyData).map(function(key, index) {
      $scope.cyData[key] = $scope.cyData[key]/(1000);
      $scope.cyData[key] = $scope.cyData[key].toFixed(2);
    });

    Object.keys($scope.rlData).map(function(key, index) {
      $scope.rlData[key] = $scope.rlData[key]/(1000);
      $scope.rlData[key] = $scope.rlData[key].toFixed(2);
    });

    Object.keys($scope.pjData).map(function(key, index) {
      $scope.pjData[key] = $scope.pjData[key]/(1000);
      $scope.pjData[key] = $scope.pjData[key].toFixed(2);
    });

    console.log("Release data", $scope.rlData);
    console.log("project data",$scope.pjData);
    graph1(data.eData);

    $scope.totalReestimationCount = 0;
    $scope.taskStatus = {
      "review" : 0,
      "completed" : 0,
      "inprogress":0
    }

    $scope.taskTypesCount = {
      "Scrape": 0,
      "Design": 0,
      "Execute Scenario": 0,
      "Execute":0,
      "Execute Batch":0
    }

    $scope.tData.forEach((d)=>{
      $scope.totalReestimationCount += $scope.sumRestimationCount(d.data);
      $scope.getTaskDetails(d.data);
    });

    var taskStatusKeys = Object.keys($scope.taskStatus);
    var taskStatusValues = Object.values($scope.taskStatus);
    var taskNamesKeys = Object.keys($scope.taskTypesCount);
    var taskNamesValues = Object.values($scope.taskTypesCount);
    graph2("pie1", "second_graph",taskStatusKeys, taskStatusValues );
    graph2("pie2", "third_graph", taskNamesKeys, taskNamesValues );
    progressAnimate();
    console.log($scope.taskStatus);
    console.log($scope.totalReestimationCount);
  }, (err)=>{
    console.log(err);
  });
}]);
