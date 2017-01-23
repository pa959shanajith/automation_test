mySPA.controller('designController', ['$scope', '$http', '$location', '$timeout', 'DesignServices', function($scope,$http,$location,$timeout,DesignServices) {
	$("body").css("background","#eee");
    $timeout(function(){
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
    }, 500)
    
    //Task Listing
    loadUserTasks()
    
    //Initiating Scraping
    $scope.initScraping = function(browserType){
    	 DesignServices.initScraping_ICE()
 	    .then(function (data) {
     	
        var viewString = {};
        viewString.view = data;
        console.log("Scrapping Started::::::")
        $("#finalScrap").empty()
        $("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><input title='Select all' type='checkbox' class='checkStylebox'><a id='aScrapper'>Screen Fields </a><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
        var custname;
		var imgTag;
		var scrapTree = $("#finalScrap").children('#scrapTree');
		var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');
        for (var i = 0; i < viewString.view.length; i++) {
			var path = viewString.view[i].xpath;
			var ob = viewString.view[i];
			ob.tempId= i; 
			custname = ob.custname;
			var tag = ob.tag;
			//Add This after Anchor Tag in next line <input type='checkbox' name='selectAllListItems' />
			var li = "<li class='item' val="+ob.tempId+"><input type='checkbox' class='checkall' name='selectAllListItems' /><a><img class='tag-icon' src='imgs/ic_"+imgTag+"_32x32.png'/>"+custname+"</a></li>";
			angular.element(innerUL).append(li)
		}
        $(document).find('#scrapTree').scrapTree({
			multipleSelection : {
				//checkbox : checked,
				classes : [ '.item' ]
			},
			editable: true,
		});
 	   }, function (error) { console.log("Fail to Load design_ICE") });
    }
}]);