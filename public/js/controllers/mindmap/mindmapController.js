
mySPA.controller('mindmapController', ['$scope', '$http', '$location', '$timeout', 'mindmapServices','cfpLoadingBar','$window', function($scope,$http,$location,$timeout,mindmapServices,cfpLoadingBar,$window) {
    	$("body").css("background","#eee");
    	$("head").append('<link id="mindmapCSS1" rel="stylesheet" type="text/css" href="css/css_mindmap/style.css" /><link id="mindmapCSS2" rel="stylesheet" type="text/css" href="fonts/font-awesome_mindmap/css/font-awesome.min.css" />')
	
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
        if($("#left-nav-section").is(":visible") == true)
            {
               $("span.taskname").addClass('taskTitle');
              
            }
        else{
             $("span.taskname").removeClass('taskTitle');
             $("div.content-div").removeClass("content-div-req");
        }
        
	}, 500)
		/*Sidebar-toggle*/
    $scope.tab = "tabRequirement";
    $(".left-sec-mindmap,.rsSlide").show();
    $('.selectProject').hide();
    // $("#ct-moduleBox").hide();
    //$("#ct-moduleBox,.ct-tilebox").hide();
    $(".ct-show-left").click(function(e) {
        e.preventDefault();
        $(".left-sec-mindmap").hide();
        //$("#wrapper").toggleClass("active");
    });
   
    $("#ct-expand").click(function(e) {
         $("#ct-moduleBox,.tabAssign").removeClass("ct-expand-module");
           $(".left-sec-mindmap").show();
           if($('#right-dependencies-section').is(':visible')){
                $("#ct-moduleBox,.tabAssign").css({'left':'147px','width':'83%'})
                $(".ct-tileBox").css({'left':'50%'})
           }
           else{
               $("#ct-moduleBox,.tabAssign").css({'left':'147px','width':'100%'})
               $(".ct-tileBox").css({'left':'52% !important'})
           }  
            $("span.taskname").addClass('taskTitle');
            $("div.content-div").removeClass("content-div-both-collapse");
            $("div.content-div").addClass("content-div-req");
            
    });
    $("#ct-collapse").click(function(e) {
         $("#ct-moduleBox,.tabAssign").removeClass("ct-expand-module");
           $(".left-sec-mindmap").hide();
            $("#ct-expand").addClass('collapsed');
           if($('#right-dependencies-section').is(':visible')){
               $("#ct-moduleBox,.tabAssign").css({'left':'0','width':'94%'})
               $(".ct-tileBox").css({'left':'50%'})
           }
           else{
               $("#ct-expand").removeClass('collapsed');
               $("#ct-moduleBox,.tabAssign").css({'left':'0','width':'100%'})
               $(".ct-tileBox").css({'left':'52% !important'})
           }
              $("span.taskname").removeClass('taskTitle');
              $("div.content-div").removeClass("content-div-req ");
            if(($("#left-nav-section").is(":visible") == false &&  $("#right-dependencies-section").is(":visible") == false))
                {
                   $("div.content-div").addClass("content-div-both-collapse");
                }
                else{
                      $("div.content-div").removeClass("content-div-both-collapse");
                }
    });
    $("#ct-expand-right").click(function(e) {
         $("#ct-moduleBox,.tabAssign").removeClass("ct-expand-module");
    	var flg = false;
         e.preventDefault()
         $(".rsSlide").toggle(5, function(){
             $(this).siblings("#ct-expand-right").toggleClass("ct-collapse-right");
             $("#ct-expand-right").removeClass('expand');
             if($(".left-sec-mindmap").is(':visible') && $('#right-dependencies-section').is(':visible')){
            	 $("#ct-moduleBox,.tabAssign").css({'width':''})
            	 flg = true;
                // $(".ct-tileBox").css({'left':'50%'})
                 $("div.content-div").addClass("content-div-req");
                 $("div.content-div").removeClass("content-div-right-expand");
                 $(".project-list").removeClass("selectProject");
                 if($("#ctExpandCreate").hasClass("ctExpandCreateFixed"))
                 {
                      $("#ctExpandCreate").removeClass("ctExpandCreateFixedClosed").addClass("ctExpandCreateFixed");
                 }
             }
             else{
                 
                 $("#ct-expand-right").addClass('expand');
                 $("#ct-moduleBox,.tabAssign").css({'z-index':'0','width':'100%'})
               //  $(".ct-tileBox").css({'left':'52% !important'})
                 $("div.content-div").removeClass("content-div-req");
                 $("div.content-div").addClass("content-div-right-expand");
                $(".project-list").addClass("selectProject");
                if(($("#left-nav-section").is(":visible") == false &&  $("#right-dependencies-section").is(":visible") == true))
                {
                   $("div.content-div").removeClass("content-div-right-expand");
                   $(".project-list").removeClass("selectProject");
                }
             }
             if(flg) $("#ct-moduleBox,.tabAssign").css({'z-index':'0','width':'82% !important'})
               if(($("#left-nav-section").is(":visible") == false &&  $("#right-dependencies-section").is(":visible") == false))
                {
                   $("div.content-div").addClass("content-div-both-collapse");
                }
                else{
                      $("div.content-div").removeClass("content-div-both-collapse");
                }
            if($("#ctExpandCreate").hasClass("ctExpandCreateFixed"))
            {
                 $("#ctExpandCreate").removeClass("ctExpandCreateFixed").addClass("ctExpandCreateFixedCLosed");
            }
                  $("#ctExpandCreate").css("bottom","553px !important");
         });
     
    });

    $scope.createMapsCall = function(e){
        if($scope.tab=='tabRequirement'){
        	$('.selectProject').hide();
            $("img.selectedIcon").removeClass("selectedIcon");
            $('#reqImg').addClass('selectedIcon');
        }
        else{
            if ($scope.tab=='tabCreate'){
            	$('.selectProject').show();
                $("img.selectedIcon").removeClass("selectedIcon");
		        $('#createImg').addClass('selectedIcon');
                if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == false)
                {
                   $("#ct-moduleBox,.tabAssign").addClass("ct-expand-module");
                }
            }else if($scope.tab=='tabAssign'){
                $('.selectProject').show();
                $("img.selectedIcon").removeClass("selectedIcon");
		        $('#assignImg').addClass('selectedIcon');
                 if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == false)
                {
                    $("#ct-moduleBox,.tabAssign").addClass("ct-expand-module");
                }
            }
            loadMindmapData()
        }
        window.localStorage['tabMindMap'] = $scope.tab;
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