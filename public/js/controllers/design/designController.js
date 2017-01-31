mySPA.controller('designController', ['$scope', '$http', '$location', '$timeout', 'DesignServices', function($scope,$http,$location,$timeout,DesignServices) {
	$("body").css("background","#eee");
    $timeout(function(){
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
        document.getElementById("currentYear").innerHTML = new Date().getFullYear()
    }, 500)
    
    //Task Listing
    loadUserTasks()
    
    //Initiating Scraping
    $scope.initScraping = function(browserType){
    	console.log(io);
    	
    	
    	 DesignServices.initScraping_ICE(browserType)
 	    .then(function (data) {
        console.log(data);
        var data = JSON.stringify(data);
        var scrapeJson = JSON.parse(data);
        scrapeJson = scrapeJson.view;
        var viewString = {};
        //viewString.view = data;
        console.log("Scrapping Started::::::")
        $("#finalScrap").empty()
        $("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox'><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-default objBtn hide'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-default objBtn hide'>Delete</button></span><span></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
        var custname;
		var imgTag;
		var scrapTree = $("#finalScrap").children('#scrapTree');
		var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');
        for (var i = 0; i < scrapeJson.length; i++) {
			var path = scrapeJson[i].xpath;
			var ob = scrapeJson[i];
			ob.tempId= i; 
			custname = ob.custname;
			var tag = ob.tag;
			//Add This after Anchor Tag in next line <input type='checkbox' name='selectAllListItems' />
			var li = "<li class='item' val="+ob.tempId+"><img id='focus_"+i+"' class='focus-icon' src='imgs/ic-highlight-element-inactive.png'/><input type='checkbox' class='checkall' name='selectAllListItems' /><a><img class='tag-icon' src='imgs/ic_"+imgTag+"_32x32.png'/>"+custname+"</a></li>";
			angular.element(innerUL).append(li)
		}
        $(document).find('#scrapTree').scrapTree({
			multipleSelection : {
				//checkbox : checked,
				classes : [ '.item' ]
			},
			editable: true,
		});
    	if(data.length > 0)
     	{
     		$("#saveObjects").removeClass('hide');
     	}
     	else{
     		$("#saveObjects").addClass('hide');
     	}
        
        //Highlight Focus Icon
        $(document).on('click', '.focus-icon', function(e) {
        	var id = $(this).attr('id');
        	$("img.focus-icon").removeAttr('src').attr('src','imgs/ic-highlight-element-inactive.png').removeClass('focus-highlight');
        	$("#"+id).addClass('focus-highlight');
        	$(".focus-highlight").removeAttr('src').attr('src','imgs/ic-highlight-element-active.png');
        })
        
        //To Select and unSelect all objects 
    	$('.checkStylebox').click(function(){
		if($(this).is(":checked")){
			$("#scraplist li").find('input[name="selectAllListItems"]').prop("checked", true).addClass('checked');
			$(".optionalActionButtions").children("#deleteFunction").prop("disabled", false).show().css({'cursor':'pointer'});
			  $("#deleteObjects").removeClass('hide');
			}
			else{
				$("#scraplist li").find('input[name="selectAllListItems"]').prop("checked", false).removeClass('checked');
				$(".optionalActionButtions").children("#deleteFunction").prop("disabled", true).hide().css({'cursor':'no-drop'});
				$("#deleteObjects").addClass('hide');
			}
		})
		
		//Triggered When each checkbox objects are clicked
		$(document).on('click', "input[name='selectAllListItems']", function(){
			if($(this).is(":checked")){
				$(this).addClass('checked');
				$(".optionalActionButtions").children("#deleteFunction").prop("disabled", false).show().css({'cursor':'pointer'});
			} else{
				$(this).removeClass('checked');
				$(".optionalActionButtions").children("#deleteFunction").prop("disabled", true).hide().css({'cursor':'no-drop'});
			}
			var checkedLength =  $("input.checked").length;
			var totalLength = 	$("#scraplist li").find('input[name="selectAllListItems"]').length;
			if(totalLength == checkedLength)
				{
				$('.checkStylebox').prop("checked", true);
				}
			else{
				$('.checkStylebox').prop("checked", false);
			}
			
			if(checkedLength > 0 )
			{
			   $("#deleteObjects").removeClass('hide');
			}
			else{
			   $("#deleteObjects").addClass('hide');
			}
		})
		//To delete Scrape Objects 
		 $scope.del_Objects = function() 
	     {
        	$(".close:visible").trigger('click');
        	var checkCond = $("#scraplist li").children("input[type='checkbox']").is(':checked');
        	if(checkCond = true){
        		
        		DesignServices.deleteScrapeObjects_ICE(	$scope.newTestScriptDataLS)
    			.then(function(data) {
    				//Service to be integrated as it has dependency of ($scope.newTestScriptDataLS)
    			}, function(error) {

    			});
        	}
        	
	     }
       
 	   }, function (error) { console.log("Fail to Load design_ICE") });
    	 

    	 
    }

}]);
