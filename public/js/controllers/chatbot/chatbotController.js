mySPA.controller('chatbotController', function($scope, $rootScope, $timeout, $http, $location, chatbotService, LoginService, cfpLoadingBar, socket) {

 $scope.conversation = []
     $scope.querySend = function (){
        var query = $scope.query;
        if(query.length == 0 ){
            openDialogMindmap('Error',"Please enter a query!");
        }
        else{
            $scope.visible = 0;
            $scope.conversation.push({'text' : query,'pos': "assistFrom-me",'type': 0});
            $scope.query = "";
            chatbotService.getTopMatches(query).then(function(data){ 
                $scope.topMatches = data;
                $scope.conversation.push({'text' : $scope.topMatches,'pos': "assistFrom-them",'type':0});
                //console.log($scope.conversation)
                setTimeout(function(){
                    var elem = document.getElementById('chatContainerBox');
                    elem.scrollTop = elem.scrollHeight;
                },500)
            });
        } 
    }
  $scope.displayAnswer = function (index){
        $scope.conversation.push({'text' : $scope.topMatches[index][2],'pos':  "assistFrom-them",'type':1});
        $scope.answer = $scope.topMatches[index][2];
        
        var qid = $scope.topMatches[index][0];
        setTimeout(function(){
                    var elem = document.getElementById('chatContainerBox');
                    elem.scrollTop = elem.scrollHeight;
        },500)
        //console.log($scope.topMatches[index][2]);
        chatbotService.updateFrequency(qid).then(function(data){ 
            //console.log("Reporting from controller.. after updating question frequency:");
            //console.log(data);

        });

    }

    $scope.myFunct = function(keyEvent) {
        if (keyEvent.which === 13)
            $scope.querySend();
            var objDiv = document.getElementById("hello");
            objDiv.scrollTop = objDiv.scrollHeight;
            var elem = document.getElementById('chatContainerBox');
            elem.scrollTop = elem.scrollHeight;
    }
});
