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
    	DesignServices.initScraping_ICE(browserType)
 	    .then(function (data) {
        console.log(data);
        var data = JSON.stringify(data);
        var scrapeJson = JSON.parse(data);
        var viewString = {}
        viewString = scrapeJson[0];
        //viewString.view = data;
        console.log("Scrapping Started::::::")
        $("#finalScrap").empty()
        $("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox'><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-default objBtn hide'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-default objBtn hide'>Delete</button></span><span></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");

        //Before Saving the Scrape JSON to the Database
        for (var i = 0; i < viewString.view.length; i++) { 
			var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');
			var path = viewString.view[i].xpath;
			var ob = viewString.view[i];
			ob.tempId= i;
            //ob.url = 'http://10.41.31.29:3000';
			var custN = ob.custname.replace(/[<>]/g, '').trim();
			var tag = ob.tag;
			if(tag == "dropdown"){imgTag = "select"}
			else if(tag == "textbox/textarea"){imgTag = "input"}
			else imgTag = tag;
			var tag1 = tag.replace(/ /g, "_");
			var tag2;
			if(tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell"){
				var li = "<li data-xpath='"+ob.xpath+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><input type='checkbox' class='checkall' name='selectAllListItems' /><span class='highlight'></span ><span  class='ellipsis'>"+custN+"</span></a></li>";
				$(".ellipsis").attr('title',custN)
			} 
			else {
				var li = "<li data-xpath='"+ob.xpath+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><input type='checkbox' class='checkall' name='selectAllListItems' /><span class='highlight'></span><span  class='ellipsis'>"+custN+"</span></a></li>";
				$(".ellipsis").attr('title',custN)
			}
			angular.element(innerUL).append(li);
		}
        //Before Saving the Scrape JSON to the Database
        
        
        /*var custname;
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
			var li = "<li class='item' val="+ob.tempId+"><img id='focus_"+i+"' class='focus-icon' src='imgs/ic-highlight-element-inactive.png'/><input type='checkbox' class='checkall' name='selectAllListItems' /><a><img class='tag-icon' src='imgs/ic_"+imgTag+"_32x32.png'/>"+custname+"</a></li>";
			angular.element(innerUL).append(li)
		}*/
        
        //Build Scrape Tree using dmtree.scrapper.js file
        $(document).find('#scrapTree').scrapTree({
			multipleSelection : {
				//checkbox : checked,
				classes : [ '.item' ]
			},
			editable: true,
			radio: true
		});
        //Build Scrape Tree using dmtree.scrapper.js file
        
    	if(data.length > 0)
     	{
     		$("#saveObjects").removeClass('hide');
     	}
     	else{
     		$("#saveObjects").addClass('hide');
     	}
        
        //Highlight Focus Icon
//        $(document).on('click', '.focus-icon', function(e) {
//        	var id = $(this).attr('id');
//        	$("img.focus-icon").removeAttr('src').attr('src','imgs/ic-highlight-element-inactive.png').removeClass('focus-highlight');
//        	$("#"+id).addClass('focus-highlight');
//        	$(".focus-highlight").removeAttr('src').attr('src','imgs/ic-highlight-element-active.png');
//        })
        
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
    	 
     
    	//Highlight Element on browser
        $scope.highlightScrapElement = function(xpath,url) {
        	DesignServices.highlightScrapElement_ICE(xpath,url)

			.then(function(data) {
				if(data == "fail"){
					alert("fail");
				}
				console.log("success!::::"+data);
			}, function(error) {
				//console.log('bad weather! thunderstorm!!');
			});
    	};
    	//Highlight Element on browser
    }

}]);
