
mySPA.controller('mindmapController', ['$scope', '$rootScope', '$http', '$location', '$timeout', 'chatbotService','mindmapServices','cfpLoadingBar','$window','socket', function($scope, $rootScope, $http, $location,$timeout,chatbotService,mindmapServices,cfpLoadingBar,$window,socket) {
    $("body").css("background","#eee");
    $("head").append('<link id="mindmapCSS1" rel="stylesheet" type="text/css" href="css/css_mindmap/style.css" /><link id="mindmapCSS2" rel="stylesheet" type="text/css" href="fonts/font-awesome_mindmap/css/font-awesome.min.css" />')
	
    /*var taskAuth;
	if(window.localStorage["_VM"] == "false")
	{
		taskAuth = false;
	}*/
	if(window.localStorage['navigateScreen'] != "home"){
		$rootScope.redirectPage();
	}
    var versioningEnabled=false;
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
    var blockMsg = 'Please Wait...';
    blockUI(blockMsg);
    loadUserTasks()
    unblockUI();
    /*creating version in ui*/
    socket.on('versionUpdate', function(to_v){
        $('.version-list').append($('<option>').attr({
             value: to_v
            }).text(to_v))
    });
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
           if($(".left-sec-mindmap").is(":visible") == true && $('#right-dependencies-section').is(':visible') == false){
                $("#ct-moduleBox,.tabAssign").removeClass("leftBarClose leftBarOpen bar-collapse rightBarClose rightBarOpen rightOpenLeftClose bar-expand").addClass("leftBarOpen");
                // $("#ct-moduleBox,.tabAssign").css({'left':'147px !important','width':'100%'})
                $(".ct-tileBox").css({'left':'52% !important'});
                //endtoend
                $(".endtoend-modulesContainer").prop("style","width:calc(100% - 172px) !important; left:166px !important;");
                $(".searchModuleimg").prop("style","right:91px !important;");
                $(".endtoend-modules-right-upper img").prop("style","left:195px !important;");
                $(".eteLabel").prop("style","left:392px !important; width:140px !important; bottom:23px !important;");
           }
           else if($(".left-sec-mindmap").is(":visible") == true && $('#right-dependencies-section').is(':visible') == true){
                $(".ct-tileBox").css({'left':'50%'})
                $("#ct-moduleBox,.tabAssign").removeClass("leftBarClose rightBarClose rightBarOpen bar-collapse leftOpenRightClose rightOpenLeftClose bar-expand").addClass("bar-expand");
                //endtoend
                $(".endtoend-modulesContainer").prop("style","width:calc(100% - 256px) !important; left:166px !important;");
                $(".searchModuleimg").prop("style","right:86px !important;");
                $(".endtoend-modules-right-upper img").prop("style","left:180px !important;");
                $(".eteLabel").prop("style","left:366px !important; width:140px !important; bottom:23px !important;");
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
                $("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen rightBarClose rightBarOpen bar-collapse leftOpenRightClose rightOpenLeftClose bar-expand").addClass("leftBarClose");
                $(".ct-tileBox").css({'left':'50%'})
            }
            else{
                $("#ct-expand").removeClass('collapsed');
                $(".ct-tileBox").css({'left':'52% !important'})
            }
            $("span.taskname").removeClass('taskTitle');
            $("div.content-div").removeClass("content-div-req ");
            if(($("#left-nav-section").is(":visible") == false &&  $("#right-dependencies-section").is(":visible") == false))
            {
                    $("div.content-div").addClass("content-div-both-collapse");
                    $("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarClose rightBarOpen bar-expand leftOpenRightClose rightOpenLeftClose").addClass("bar-collapse");
                    //endtoend
                    $(".endtoend-modulesContainer").prop("style","width:calc(100% - 10px) !important;");
                    $(".searchModuleimg").prop("style","right:100px !important;");
                    $(".endtoend-modules-right-upper img").prop("style","left:222px !important;");
                    $(".eteLabel").prop("style","left:0 !important; width:140px !important; bottom:18px !important;");
            }            
            else if(($("#left-nav-section").is(":visible") == false &&  $("#right-dependencies-section").is(":visible") == true))
            {
                $("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarClose rightBarOpen bar-collapse leftOpenRightClose bar-expand").addClass("rightBarOpen");
                //endtoend
                $(".endtoend-modulesContainer").prop("style","width:calc(100% - 96px) !important;");
                $(".searchModuleimg").prop("style","right:95px !important;");
                $(".endtoend-modules-right-upper img").prop("style","left:210px !important;");
                $(".eteLabel").prop("style","left:420px !important; width:140px !important; bottom:18px !important;");
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
                 $("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarOpen bar-collapse bar-expand leftOpenRightClose rightOpenLeftClose").addClass("bar-expand");
            	 flg = true;
                 $("div.content-div").addClass("content-div-req");
                 $("div.content-div").removeClass("content-div-right-expand");
                 $(".project-list").removeClass("selectProject");
                $timeout(function(){
                    $("select.selectProject").removeClass("selectProjectPri");
                },300)
                //endtoend
                $(".endtoend-modulesContainer").prop("style","width:calc(100% - 256px) !important; left:166px !important;");
                $(".searchModuleimg").prop("style","right:86px !important;");
                $(".endtoend-modules-right-upper img").prop("style","left:180px !important;");
                $(".eteLabel").prop("style","left:366px !important; width:140px !important; bottom:23px !important;");
             }
             else{                 
                $("#ct-expand-right").addClass('expand');
                $("div.content-div").removeClass("content-div-req");
                $("div.content-div").addClass("content-div-right-expand");
                $(".project-list").addClass("selectProject");
                if(($("#left-nav-section").is(":visible") == true &&  $("#right-dependencies-section").is(":visible") == false)){

					$("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarOpen bar-collapse bar-expand leftOpenRightClose rightOpenLeftClose").addClass("leftBarOpen");

				//endtoend
                    $(".endtoend-modulesContainer").prop("style","width:calc(100% - 172px) !important; left:166px !important;");
                    $(".searchModuleimg").prop("style","right:91px !important;");
                    $(".endtoend-modules-right-upper img").prop("style","left:195px !important;");
                    $(".eteLabel").prop("style","left:390px !important; width:140px !important; bottom:23px !important;");
                }
                else if(($("#left-nav-section").is(":visible") == false &&  $("#right-dependencies-section").is(":visible") == true)){
					$("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarOpen bar-collapse bar-expand leftOpenRightClose rightOpenLeftClose").addClass("rightBarOpen");

				//endtoend
                    $(".endtoend-modulesContainer").prop("style","width:calc(100% - 96px) !important;");
                    $(".searchModuleimg").prop("style","right:95px !important;");
                    $(".endtoend-modules-right-upper img").prop("style","left:208px !important;");
                    $(".eteLabel").prop("style","left:417px !important; width:140px !important; bottom:23px !important;");

                    $("div.content-div").removeClass("content-div-right-expand");
                    $(".project-list").removeClass("selectProject");
                }
                else if(($("#left-nav-section").is(":visible") == false && $("#right-dependencies-section").is(":visible") == false)){
					$("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarOpen bar-collapse bar-expand leftOpenRightClose rightOpenLeftClose").addClass("bar-collapse");
                    //endtoend
                    $(".endtoend-modulesContainer").prop("style","width:calc(100% - 12px) !important;");
                    $(".searchModuleimg").prop("style","right:102px !important;");
                    $(".endtoend-modules-right-upper img").prop("style","left:225px !important;");
                    $(".eteLabel").prop("style","left:0px !important; width:140px !important; bottom:18px !important;");

                    $("div.content-div").removeClass("content-div-right-expand");
                    $(".project-list").removeClass("selectProject");
                }
                $timeout(function(){
                    $("select.selectProject").addClass("selectProjectPri");
                },300)
             }
             if(flg) $("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarClose rightBarOpen bar-collapse leftOpenRightClose rightOpenLeftClose").addClass("bar-expand");
               if(($("#left-nav-section").is(":visible") == false &&  $("#right-dependencies-section").is(":visible") == false))
                {
                   $("div.content-div").addClass("content-div-both-collapse");
                     $("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarClose rightBarOpen bar-expand leftOpenRightClose rightOpenLeftClose").addClass("bar-collapse");
                }
                else{
                      $("div.content-div").removeClass("content-div-both-collapse");
                }
         });
     
    });

    // Changes made for End to end module implementation
    $scope.createMapsCall = function(e){
            
           $.ajax({
                    type: 'HEAD',
                    url: window.location.origin+'/js/js_mindmap/versioning.js',
                    success: function() {

                        versioningEnabled=true;
                        
                        load_versions();
                    },  
                    error: function() {
                        load_versions();
                    }
                });
       
       function load_versions(){
            if($scope.tab=='tabRequirement'){
        	$('.selectProject').hide();
            $("img.selectedIcon").removeClass("selectedIcon");
            $('#reqImg').addClass('selectedIcon');
        }
        else if($scope.tab=='mindmapCreateOption'){
            $('.selectProject').hide();
        	$("img.selectedIcon").removeClass("selectedIcon");
	        $('#createImg').addClass('selectedIcon');
            if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == false)
            {
               $("#ct-moduleBox,.tabAssign").addClass("ct-expand-module");
            }
        }
        else if($scope.tab=='mindmapEndtoEndModules'){
            // if(!versioningEnabled){
            $("#ct-main").hide();
        	$("img.selectedIcon").removeClass("selectedIcon");
	        $('#createImg').addClass('selectedIcon');
            if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == false)
            {
               $("#ct-moduleBox,.tabAssign").addClass("ct-expand-module");
            }
           
            if($('.scrollbar-macosx').is(':visible'))
                $("#ct-collapse").trigger("click");
            if($('.rsSlide').is(':visible'))
                $("#ct-expand-right").trigger("click");
            loadMindmapData_W();
            // }else{
            //     openDialogMindmap('Error',"EndtoEnd flow disabled in Versioning");
            // }
        	
        }
        else{
            if ($scope.tab=='tabCreate'){
            	$('.selectProject').show();
                $("img.selectedIcon").removeClass("selectedIcon");
		        $('#createImg').addClass('selectedIcon');
                if(!versioningEnabled)
                    $('.selectProject').addClass('selectProjectPosition');
                if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == false)
                {
                   $("#ct-moduleBox,.tabAssign").addClass("ct-expand-module");
                }
                $("#ct-main").css("display","block");
                if(!versioningEnabled){
                    addExport(versioningEnabled);
                }
            }else if($scope.tab=='tabAssign'){
                $('.selectProject').show();
                $("img.selectedIcon").removeClass("selectedIcon");
		        $('#assignImg').addClass('selectedIcon');
                if(!versioningEnabled)
                    $('.selectProject').addClass('selectProjectPosition');
                 if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == false)
                {
                    $("#ct-moduleBox,.tabAssign").addClass("ct-expand-module");
                }
                $("#ct-main").css("display","block");
            }
            
            if($('.scrollbar-macosx').is(':visible'))
                $("#ct-collapse").trigger("click");
            if($('#right-dependencies-section').is(':visible'))
                $("#ct-expand-right").trigger("click");
                            //if versioning.js file is present then call addVersioning function else call loadMindmapData()
                if (versioningEnabled){
                    loadMindmapData_V();
                }else{
                    loadMindmapData(0);
                    
                }
                // $.ajax({
                //     type: 'HEAD',
                //     url: window.location.origin+'/js/js_mindmap/versioning.js',
                //     success: function() {
                //         loadMindmapData_V();
                        
                //     },  
                //     error: function() {
                //         loadMindmapData(0);
                //     }
                // });
                

            $timeout(function(){
               $('#ct-moduleBox').prop("style","width:100% ; left:0px ;");

            },10);
            $timeout(function(){
                $('#ct-AssignBox').prop("style","width:100% ; left:0px ;");
            },10);
            
          
            
        }
        window.localStorage['tabMindMap'] = $scope.tab;
       }
    }
    
    $scope.createMap = function(option){
    	// if(option == "mindmapEndtoEndModules" && versioningEnabled){
        //     openDialogMindmap('Error',"EndtoEnd flow disabled in Versioning");
        // } //as of now, do nothing
        // else
    	$scope.tab = option;
    }

    
    var collapseEteflag = true;
    $(document).on('click', '.collapseEte', function(){
    	if(collapseEteflag){
    		if(screen.height < 1024){
    			$(".endtoend-modulesContainer").prop("style","height: 48% !important;");
    			//$("#ct-canvas").prop("style","height: 250px !important");
    			$("#ct-legendBox").prop("style","top: calc(100% - 24px) !important; left: 8px !important;");
    			$("#ct-actionBox_W").prop("style","top: calc(100% - 34px) !important; left: (100% - 285px) !important;");
    		}
    		else{
    			$(".endtoend-modulesContainer").css("height","calc(100% - 430px)");
                //$("#ct-canvas").prop("style","height: 410px !important")
    		}
        	$(this).attr("src","imgs/ic-collapseup.png");
        	collapseEteflag = false;
    	}
    	else{
    		if(screen.height < 1024){
    			$(".endtoend-modulesContainer").prop("style","height: 28% !important;");
    			//$("#ct-canvas").prop("style","height: 352px !important")
    		}
    		else{
    			$(".endtoend-modulesContainer").css("height","calc(100% - 643px)");
                //$("#ct-canvas").prop("style","height: 660px !important")
    		}
        	$(this).attr("src","imgs/ic-collapse.png");
        	collapseEteflag = true;
    	}
    })
    
    //Search Modules
    $(document).on('keyup', '#eteSearchModules', function() {
		filter(this, 'etemModuleContainer'); 
	});
    
    //Search Scenarios
    $(document).on('keyup', '#eteSearchScenarios', function() {
		filter(this, 'eteScenarioContainer'); 
	});
    
	function filter(element, id) {
		var value = $(element).val();
		var container;
		if(id == "etemModuleContainer")	container = $("#etemModuleContainer span.modulename");
		else container = $("#eteScenarioContainer span.eteScenrios");
		$(container).each(function () {
			if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
				id == "etemModuleContainer"? $(this).parent().show() : $(this).show()
			} else {
				id == "etemModuleContainer"? $(this).parent().hide() : $(this).hide()
			}
		});
	}

// #817 To select multiple scenarios in e2e (Himanshu)
	$(document).on('click', '.eteScenrios', function(){
//		$.each($('.eteScenrios'), function(){
//			$(this).removeClass('selectScenariobg');
//		})


		/*if($(this).siblings("input").is(":checked")){
			$(this).siblings("input").prop("checked",false);
		}
		else $(this).siblings("input").prop("checked",true);*/
// #894: Add button should be enabled only if some scenario is selected
		$(this).toggleClass('selectScenariobg');
        var classflag=false;
        d3.select('.addScenarios-ete').classed('disableButton',!0);
		$.each($('.eteScenrios'), function(){
			if($(this).hasClass('selectScenariobg')){
                classflag=true;
                console.log(classflag);
                d3.select('.addScenarios-ete').classed('disableButton',!1);
        }})
        
	})

// Search for modules in assign tab of end to end flow (Himanshu)
 	$(document).on('keyup', '#searchModule-assign', function(){
		input = document.getElementById("searchModule-assign");
    filter_elem = input.value.toUpperCase();
		elems = $('#ct-AssignBox .ct-node');
        console.log(elems)
		for (i = 0; i < elems.length; i++) {
				if (elems[i].textContent.toUpperCase().indexOf(filter_elem) > -1) {
						elems[i].style.display = "";
				} else {
						elems[i].style.display = "none";
				}
		}
	});

	// Search for modules in create tab (Himanshu)
 	$(document).on('keyup', '#searchModule-create', function(){
		input = document.getElementById("searchModule-create");
    filter_elem = input.value.toUpperCase();
		elems = $('#ct-moduleBox .ct-node');
        console.log(elems)
		for (i = 0; i < elems.length; i++) {
				if (elems[i].textContent.toUpperCase().indexOf(filter_elem) > -1) {
						elems[i].style.display = "";
				} else {
						elems[i].style.display = "none";
				}
		}
	});
	


    // $(".highlightImg").on('click',function(e) {
    //     if(e.target.id == "reqImg" || e.target.id == "createImg" ||  e.target.id == "assignImg" || 
    //     e.target.id == "reqImg1" || e.target.id == "createImg1" ||  e.target.id == "assignImg1")
    //     {
    //         $("a.selectedIcon").removeClass("selectedIcon");
	// 	    $(this).addClass('selectedIcon');
    //     }
		
	// });
    function initScroller(){
    	$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
    }
     // Prof J Assist (Yashi)
    $scope.conversation = []
     $scope.querySend = function (){
        var query = $scope.query;
        console.log(query.length);
        if(query.length == 0 ){
            openDialogMindmap('Error',"Please enter a query!");
        }
        else{
        $scope.visible = 0;
        $scope.conversation.push({'text' : query,'pos': "assistFrom-me",'type': 0});
        //console.log(query);
        $scope.query = "";
        chatbotService.getTopMatches(query).then(function(data){ 
       // console.log("Reporting from controller.. i have this object:");
        //console.log(data);
        $scope.topMatches = data;
        $scope.conversation.push({'text' : $scope.topMatches,'pos': "assistFrom-them",'type':0});
        //console.log($scope.conversation)
        });
        } 
    }
  $scope.displayAnswer = function (index){
        $scope.conversation.push({'text' : $scope.topMatches[index][2],'pos':  "assistFrom-them",'type':1});
        $scope.answer = $scope.topMatches[index][2];
        
        var qid = $scope.topMatches[index][0];
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
    }
    // Changes made for End to end module implementation
//To toggle the view when user clicks on switch layout (Himanshu)
    $scope.toggleview = function(){
        var selectedTab = window.localStorage['tabMindMap'];
        if(selectedTab=='mindmapEndtoEndModules')
            var temp=dNodes_W.length;
        else
            var temp=dNodes.length;
        
        if(temp==0){
                openDialogMindmap('Error',"Please select a module first");
        }
        else if((selectedTab=='mindmapEndtoEndModules' || selectedTab=='tabCreate') && !$('#ct-inpBox').hasClass('no-disp'))
        {
                openDialogMindmap('Error',"Please complete editing first");   
                d3.select('#ct-inpAct').node().focus();
        }
        else if(selectedTab=='tabAssign' && !$('#ct-assignBox').hasClass('no-disp')){
                openDialogMindmap('Error','Please complete assign step first');    
        }
        else{
                $('#switch-layout').toggleClass('vertical-layout');
                loadMap2();
        }
    };
}]);