var screenshotObj,scrapedGlobJson,enableScreenShotHighlight,mirrorObj;
mySPA.controller('designController', ['$scope', '$http', '$location', '$timeout', 'DesignServices','cfpLoadingBar', function($scope,$http,$location,$timeout,DesignServices, cfpLoadingBar) {
	cfpLoadingBar.start()
	$("body").css("background","#eee");
    $timeout(function(){
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
        document.getElementById("currentYear").innerHTML = new Date().getFullYear()
    }, 500)
    
    //Task Listing
    loadUserTasks()
    
    $timeout(function(){
		angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
		cfpLoadingBar.complete()
	}, 1500)
	
	//Populating Saved Scrape Data
    $scope.getScrapeData = function(){
    	enableScreenShotHighlight = true;
    	DesignServices.getScrapeDataScreenLevel_ICE() 
        .then(function(data){
        	//var divId = $("#finalScrap") 
       	    viewString = JSON.parse(JSON.parse(data.scrapeObj));
			//window.localStorage['projectIdVal'] = projectId;
			//$scope.newTestScriptDataLS = viewString;
			//var screenLabel = window.localStorage['projLabelVal'];
			$("#window-scrape-screenshot .popupContent").empty()
	        $("#window-scrape-screenshot .popupContent").html('<div id="screenShotScrape"><img id="screenshot" src="data:image/PNG;base64,'+viewString[1].mirror+'" /></div>')
			angular.element($("#finalScrap")).empty();
			if (jQuery.isEmptyObject(viewString)){	
				console.log("Data is Empty")
				return;
			}
			else{
				console.log("Data There")
			}
			//console.log("divId: "+divId);
			console.log("response data: ", viewString);
			$("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox'><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-xs btn-xs-custom objBtn' style='margin-left: 10px'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 10px' disabled>Delete</button></span><span></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
			var custN;
			var imgTag;
			var scrapTree = $("#finalScrap").children('#scrapTree');
			var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');
			for (var i = 0; i < viewString[0].view.length; i++) {        			
				var path = viewString[0].view[i].xpath;
				var ob = viewString[0].view[i];
				ob.tempId= i; 
				custN = ob.custname;
				var tag = ob.tag;
				if(tag == "dropdown"){imgTag = "select"}
				else if(tag == "textbox/textarea"){imgTag = "input"}
				else imgTag = tag;
				//var li = "<li class='item' val="+ob.tempId+"><input type='checkbox' class='checkall' name='selectAllListItems' /><a><img class='tag-icon' src='imgs/ic_"+imgTag+"_32x32.png'/>"+custname+"</a></li>";
				if(tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell"){
					var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' /><span title="+custN+" class='ellipsis'>"+custN+"</span></a></li>";
				} 
				else {
					var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' /><span title="+custN+" class='ellipsis'>"+custN+"</span></a></li>";
				}
				angular.element(innerUL).append(li)
			}
			
			$(document).find('#scrapTree').scrapTree({
				multipleSelection : {
					//checkbox : checked,
					classes : [ '.item' ]
				},
				editable: true,
				radio: true
			});
        }, 
        function(error){console.log("error");})
    }
    //Populating Saved Scrape Data
    
    //Initiating Scraping
    $scope.initScraping = function(browserType){
    	enableScreenShotHighlight = false;
    	var blockMsg = 'Scrapping in progress. Please Wait...';
    	blockUI(blockMsg);
    	DesignServices.initScraping_ICE(browserType)
 	    .then(function (data) { 
 	     unblockUI();
        var data = JSON.stringify(data);
        var scrapeJson = JSON.parse(data);
        screenshotObj = scrapeJson;
        $("#window-scrape-screenshot .popupContent").empty()
        $("#window-scrape-screenshot .popupContent").html('<div id="screenShotScrape"><img id="screenshot" src="data:image/PNG;base64,'+screenshotObj[1].mirror+'" /></div>')
        var viewString = {}
        viewString = scrapeJson[0];
        //viewString.view = data;
        console.log("Scrapping Started::::::")
        $("#finalScrap").empty()
        $("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox'><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-xs btn-xs-custom objBtn' style='margin-left: 10px'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 10px' disabled>Delete</button></span><span></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");

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
				var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' /><span title="+custN+" class='ellipsis'>"+custN+"</span></a></li>";
			} 
			else {
				var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' /><span title="+custN+" class='ellipsis'>"+custN+"</span></a></li>";
			}
			angular.element(innerUL).append(li);
		}
        //Before Saving the Scrape JSON to the Database
        
        
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

 	   }, function (error) { console.log("Fail to Load design_ICE") });
    }
    
    //To delete Scrape Objects 
	$scope.del_Objects = function() 
    {
   	$(".close:visible").trigger('click');
   	var checkCond = $("#scraplist li").children("input[type='checkbox']").is(':checked');
   		if(checkCond = true){
   		
   		DesignServices.deleteScrapeObjects_ICE($scope.newTestScriptDataLS)
			.then(function(data) {
				//Service to be integrated as it has dependency of ($scope.newTestScriptDataLS)
			}, function(error) {

			});
   		}
    }
    
    //Highlight Element on browser
    $scope.highlightScrapElement = function(xpath,url) {
    	//if($("#enableScreenShot").prop("checked") == true){
    	if(enableScreenShotHighlight == true){
    		console.log("Init ScreenShot Highlight")
    		var data = {
					args : [$("#scrapTree").find(".focus-highlight").parents("a")[0]],
					rlbk : false,
					rslt :	{
						obj : $("#scrapTree").find(".focus-highlight").closest("li")
					}
				}
			console.log(data)
			//window.localStorage['mobilityiOSRef'] = $("#scrapTree2").find("input[type='radio']:checked").parent().parent().data("reference")
			//Inspector.prototype.onNodeMouseOver("mouseover", data)
			var rect, type, ref, name, id, value, label, visible, l10n, source;
    		rect = {
					x : data.rslt.obj.data("left"),
		    		y : data.rslt.obj.data("top"),
		    		w : data.rslt.obj.data("width"),
		    		h : data.rslt.obj.data("height")
		    }
		    type = data.rslt.obj.data("tag");
		    ref = data.rslt.obj.data("reference");
		    name = data.rslt.obj.find(".ellipsis").text();
		    id = data.rslt.obj.attr("val");
		    value = data.rslt.obj.attr("val");
		    label = data.rslt.obj.find(".ellipsis").text();
		    visible = data.rslt.obj.data('hiddentag');
		    l10n = {
		         matches: 0
		    };
		    source = "";
		    if (rect === undefined) return;
		    var translationFound = false;
		    if (l10n) {
		        translationFound = (l10n.matches != 0);
		    }
		    if (typeof rect.x != 'undefined') {
		    	$(".hightlight").remove();
		        var d = $("<div></div>", {
		            "class": "hightlight"
		        });
		        var screen_width = document.getElementById('screenshot').height;
			    var real_width = document.getElementById('screenshot').naturalHeight;
			    scale_highlight = 1 / (real_width / screen_width)
		        d.appendTo("#screenShotScrape");
		        d.css('border', "1px solid red");
		        d.css('left', Math.round(rect.x)  * scale_highlight + 'px');
		        d.css('top', Math.round(rect.y) * scale_highlight + 'px');
		        d.css('height', Math.round(rect.h) * scale_highlight + 'px');
		        d.css('width', Math.round(rect.w) * scale_highlight + 'px');
		        d.css('position', 'absolute');
		        d.css('background-color', 'yellow');
		        d.css('z-index', '3');
		        d.css('opacity', '0.5');
		        d.css('opacity', '0.5');
		        var color;
		        if (translationFound) {
		            color = "blue";
		        } else {
		            color = "yellow";
		        }
		        d.css("background-color", color);

		    } else {
		        $(".hightlight").remove();
		    }
    	}
    	
    	else{
    		DesignServices.highlightScrapElement_ICE(xpath,url)

			.then(function(data) {
				if(data == "fail"){
					alert("fail");
				}
				console.log("success!::::"+data);
			}, function(error) {
				//console.log('bad weather! thunderstorm!!');
			});
    	}        	
	};
	//Highlight Element on browser
    
    //Save ScrapeData Objects into Database
	$(document).on('click', "#saveObjects", function(){
		var tasks = JSON.parse(window.localStorage['_T']);
		console.log(screenshotObj);
		var getScrapeData = angular.toJson(screenshotObj);
        var moduleId = tasks.moduleId;
        var screenId = tasks.screenId;
        var screenName = tasks.screenName;
        var userinfo = JSON.parse(window.localStorage['_UI']);
        DesignServices.updateScrapeData_ICE(getScrapeData,moduleId,screenId,screenName,userinfo)
        .then(function(data){
               if(data == "success"){
            	     enableScreenShotHighlight = true;
                     $("#globalModal").modal("show");
                     $("#globalModal").find('.modal-title').text("Save Scraped data");
                     $("#globalModal").find('.modal-body p').text("Scraped data saved successfully.");
                     angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
               }
               else{
            	   enableScreenShotHighlight = false;
                     $("#globalModal").modal("show");
                     $("#globalModal").find('.modal-title').text("Save Scraped data");
                     $("#globalModal").find('.modal-body p').text("Failed to save");
               }
        }, function(error){    
        })
	})
  	//Save ScrapeData Objects into Database
    
    //To Select and unSelect all objects 
	$(document).on("click", ".checkStylebox", function(){
		if($(this).is(":checked")){
			$("#scraplist li").find('input[name="selectAllListItems"]').prop("checked", true).addClass('checked');
			//$(".optionalActionButtions").children("#deleteFunction").prop("disabled", false).show().css({'cursor':'pointer'});
			$("#deleteObjects").prop("disabled", false)
		}
		else{
			$("#scraplist li").find('input[name="selectAllListItems"]').prop("checked", false).removeClass('checked');
			//$(".optionalActionButtions").children("#deleteFunction").prop("disabled", true).hide().css({'cursor':'no-drop'});
			$("#deleteObjects").prop("disabled", true)
		}
	})
	
	//Triggered When each checkbox objects are clicked
	$(document).on('click', "input[name='selectAllListItems']", function(){
		if($(this).is(":checked")){
			$(this).addClass('checked');
			//$(".optionalActionButtions").children("#deleteFunction").prop("disabled", false).show().css({'cursor':'pointer'});
		} else{
			$(this).removeClass('checked');
			//$(".optionalActionButtions").children("#deleteFunction").prop("disabled", true).hide().css({'cursor':'no-drop'});
		}
		var checkedLength = $("input.checked").length;
		var totalLength = $("#scraplist li").find('input[name="selectAllListItems"]').length;
		if(totalLength == checkedLength)
			{
			$('.checkStylebox').prop("checked", true);
			}
		else{
			$('.checkStylebox').prop("checked", false);
		}
		
		if(checkedLength > 0 )
		{
		   $("#deleteObjects").prop("disabled", false)
		}
		else{
		   $("#deleteObjects").prop("disabled", true)
		}
	})
}]);
