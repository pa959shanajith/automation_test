
mySPA.controller('mindmapController', ['$scope', '$http', '$location', '$timeout', 'mindmapServices','cfpLoadingBar','$window', function($scope,$http,$location,$timeout,mindmapServices,cfpLoadingBar,$window) {
    	$("body").css("background","#eee");
    	$("head").append('<link id="mindmapCSS1" rel="stylesheet" type="text/css" href="css/css_mindmap/style.css" /><link id="mindmapCSS2" rel="stylesheet" type="text/css" href="fonts/font-awesome_mindmap/css/font-awesome.min.css" />')
	
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
	}, 500)
		/*Sidebar-toggle*/
    $scope.tab = "tabRequirement";
    $(".left-sec-mindmap,.rsSlide").show();
    // $("#ct-moduleBox").hide();
    //$("#ct-moduleBox,.ct-tilebox").hide();
    $(".ct-show-left").click(function(e) {
        e.preventDefault();
        $(".left-sec-mindmap").hide();
        //$("#wrapper").toggleClass("active");
    });
    $("#ct-expand").click(function(e) {
           $(".left-sec-mindmap").show();
    });
    $("#ct-collapse").click(function(e) {
           $(".left-sec-mindmap").hide();
    });
    $("#ct-expand-right").click(function(e) {
         e.preventDefault()
         $(".rsSlide").toggle(5, function(){
             $(this).siblings("#ct-expand-right").toggleClass("ct-collapse-right")
         });
    });

    $scope.createMapsCall = function(e){
            if ($scope.tab=='tabCreate'){
                 $("a.selectedIcon").removeClass("selectedIcon");
		         $('#createImg1').addClass('selectedIcon');
            }else if($scope.tab=='tabAssign'){
                $("a.selectedIcon").removeClass("selectedIcon");
		         $('#assignImg1').addClass('selectedIcon');

            }
        window.localStorage['tabMindMap'] = $scope.tab;
        loadMindmapData()
    }

    // $(".highlightImg").on('click',function(e) {
    //     if(e.target.id == "reqImg" || e.target.id == "createImg" ||  e.target.id == "assignImg" || 
    //     e.target.id == "reqImg1" || e.target.id == "createImg1" ||  e.target.id == "assignImg1")
    //     {
    //         $("a.selectedIcon").removeClass("selectedIcon");
	// 	    $(this).addClass('selectedIcon');
    //     }
		
	// });

}]);