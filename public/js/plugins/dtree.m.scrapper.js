/*!
 * jquery tree menu
 * scrapTree.js v1.0.0 
 * mefe@mefe.net
 * 2014-09-03
 * 
 */
var editedList = {};
var modifiedCustNames =[];
var xpathListofCustNames = [];
var oldCustName = [];

(function ( $ ) {

	$.fn.scrapTree = function(options) {
    	//console.log("options: "+ (this).selector);
        var defaults = {
            closeSameLevel: true,
            useCookie: true,
            projectHightlight: true,
            multipleSelection: {
            	checkbox: false,
            	classes: ['.project'],
            },
            editable: false,
            radio: false
        };
        var settings = $.extend( {}, defaults, options );//.css({"color":"red","border":"2px solid red"});
       // console.log("settings: ", settings);
        
        //get the id of the menu div
        var id = $("#scrapTree");
        return this.each(function() {
        	
            var $ul = $(this).find('ul');
            var $li = $(this).find('li');
            //var $folder = $li.has("ul");
            
            if (settings.editable){
            	//console.log('preparing editable tree .......');
            	//var sel = id+' li a';
            	var sel = $(id).find("#scraplist li a");
            	var index = 0;
            	//var radioStr = '<span><input type="radio"  name="radio"></input></span>';
            	var radioStr = '<img class="focus-icon" src="imgs/ic-highlight-element-inactive.png"/>';
            	var ri = 0;
                if (settings.radio){
                       $('li.item').each(function(i, v){
                    	   if($(this).parent().parent().parent().parent().attr('id') == "scrapTree"){
                    		  //$(this).append(radioStr);
                    		 //  $(this).children("a").append(radioStr);
                    		 $(this).children("a").children("span.highlight").html(radioStr);
                    	   }
                           var xpath = $(this).data('xpath');
                           //new change to highlight webelement in iframe
                           var url = $(this).data('url')
                           var hiddentag = $(this).data('hiddentag');
                            // $(this).find("input[type='radio']").on('click',function(){    
                           $(this).find(".focus-icon").on('click',function(){ 
                        		
                        	    $(".hightlight").remove();
                        		$('.focus-highlight').removeAttr('src').attr('src','imgs/ic-highlight-element-inactive.png').removeClass('focus-highlight');
                    		    $(this).addClass('focus-highlight');
                             	$(this).attr('src','imgs/ic-highlight-element-active.png');
                            	 if(hiddentag == "Yes"){
                            		 $('#hiddenTagBox').modal('show'); 
                            	 }
                            	 else
                            		 {
                            		 	$('.focus-highlight').removeAttr('src').attr('src','imgs/ic-highlight-element-inactive.png').removeClass('focus-highlight');
                            		    $(this).addClass('focus-highlight');
	                                 	$(this).attr('src','imgs/ic-highlight-element-active.png');
                            		    angular.element(document.getElementById("finalScrap")).scope().highlightScrapElement(xpath,url);
                            		 
                            		 }
                            		
                             });
                       });
                }
            	$(sel).each(function(i, v) {
            		var id_content = "content_"+index;
            		var id_editable = "editable_"+index;
            		index++;
            		//var usrRole = JSON.parse(window.localStorage['userInfo'])
            		var spanHtml = "<span class='objectNames' id='"+id_content+"'/>";
            		/*$(".customeNewNames").each(function(){
            			$(this).html($(this).html().replace(/ &nbsp;/gi,''));
            			$(this).html($(this).html().trim());
            		});*/
            		//wrap anchor text in a span to hide/show 
            	    $(v).contents().eq(1).wrap(function(){
            	    	return spanHtml;
            	    });
            	    var userRole = window.localStorage['_SR'];
            	    $(this).find('.ellipsis').on('dblclick',  function () {
            	    	if(userRole == "Test Lead"){
            	    		if(this.parentElement.parentElement.hasAttribute("data-xpath") == true){
            	    			var span = $(this);
                    	        var input = $('<input />', {
                    	            'type' : 'text',
                    	            'id'   : id_editable,
                    	            'class': 'forValidationScreenObject',
                    	            'value': span.html().replace('&amp;','&').trim()
                    	        });                    	        
        	        	        span.parent().append(input);
        	        	        span.addClass('content-hide');
        	        	        //$(this).remove();
        	        	        input.focus();
        	        	        input.addClass('autoWidth');
            	    		}
            	    	}
            	    	else{
            	    		
                	    	var span = $(this);
                	        var input = $('<input />', {
                	            'type' : 'text',
                	            'id'   : id_editable,
                	            'class': 'editObjectName form-control',
                	            'value': span.html().replace('&amp;','&').trim()
                	        });                	        
    	        	        span.parent().append(input);
    	        	        span.addClass('content-hide');
    	        	        //$(this).remove();
    	        	        input.focus();
    	        	        //input.addClass('autoWidth');
    	        	        input.val(input.val().replace(/&amp;/g, '&'))
            	    	}
	        	        $('#'+id_editable)
		        	        .on('keypress',  function (e) {
		        	        	if (e.which == 13){
		        	        		$("#saveObjects").attr('disabled', false);
		        	        		var regEx = /<|>/g;
		        	        		/*window.localStorage['checkEditWorking'] = "true";
		        	        		$(".optionalActionButtions").children("#editFunction").prop("disabled", false).show().css({'cursor':'pointer'});
		        	        		//$(this).parent().append($(span).html($(this).val()));
		        	        		span.text($(this).val()).removeClass('content-hide');
		        	        		$(this).remove();*/
		        	        		if((!regEx.test($(this).val()))){
		        	        			
		        	        		
			        	        		//$(".optionalActionButtions").children("#editFunction").prop("disabled", false).show().css({'cursor':'pointer'});
			        	        		//$(this).parent().append($(span).html($(this).val()));
			        	        		if($(this).val().trim() == ""){
			        	        			showDialogMesgs("Edit Objects", "Object name cannot be empty.");
			        	        			span.removeClass('content-hide');
			 		        	    	   	$(this).remove();
			        	        		}
			        	        		else { 
			        	        			window.localStorage['checkEditWorking'] = "true";
			        	        			span.text($(this).val()).removeClass('content-hide');
											oldCustName.push($(this)[0].defaultValue);
			        	        		    modifiedCustNames.push($(this)[0].value);
			        	        		    xpathListofCustNames.push($(this).parent().parent().attr("data-xpath"));
			        	        		    editedList.modifiedCustNames = modifiedCustNames;
			        	        		    editedList.xpathListofCustNames = xpathListofCustNames;
											editedList.oldCustName = oldCustName;
			        	        		    window.localStorage['_modified'] = JSON.stringify(editedList);
			        	        		}
			        	        		$(this).remove();
		        	        		} else{
/*		        	        			$("#specialCharacterValidation3").dialog({
			      			                  modal: true,
			      			                  resizable: false,
			      			                  draggable: false
			      						});*/
		        	        			showDialogMesgsBtn("Incorrect Inputs","Cannot contain special characters other than ._- and space","btnSCV3");
			        	        		return false;
		        	        		}
		        	        	}
		        	        })
		        	    //      .on('keypress',  function (e) { debugger;
		        	    //     	 var txtWidth = $(this).attr('size');
		        	    //          var cs = $(this).val().length-6;
		        	    //          txtWidth = parseInt(txtWidth);
		        	    //          if(cs>txtWidth){
		        	    //          $(this).attr('size',txtWidth+5);    }
	        	        // })
		        	       .on('blur',  function (e) {
		        	    	   //$(this).parent().append($(span).html($(this).val()));
		        	    	   span.removeClass('content-hide');
		        	    	   $(this).remove();
	        	        });
            	    });
            	});
            }            
            //multiple selection
			if (settings.multipleSelection.checkbox) {
				//console.log("multipleSelection: ", settings.multipleSelection);
				
				var chkSelector = '';
				
				for (var i=0; i<settings.multipleSelection.classes.length; i++){
					chkSelector += (settings.multipleSelection.classes[i] +' ');
				}
				
				//console.log ("chkSelector: "+chkSelector);
				
				$(id+' '+chkSelector+' a').prepend("<span class='input'><input type='checkbox'/></input></span>");
				//$("<span class='input'><input type='checkbox'/></input></span>").insertBefore($($(id+' '+chkSelector+' img')));
				$("#customInfo").html("<div class='info-msg custom-msg-info'><img src='imgs/info-icon.png'><span>Please provide unique name to object(s)</span></div>")
				
				//$("#custnameSelection").html("Please provide unique name to object(s)");
				$("input[type='checkbox']").change(
						function() {
							$(this).parentsUntil('ul').siblings('ul')
									.find("input[type='checkbox']")
									.prop('checked', this.checked);
						});
			}
                      
            //$folder.prepend("<span class=\"plus\"></span><span class=\"folder\"></span>");
            //$li.not($folder).prepend("<span class=\"join\"></span><span class=\"page\"></span>");
            //$ul.parent("li").addClass("folder-group");
            
            //$ul.children('li:last-child').not($folder).addClass("join-last");
			//$.fn.scrapTree.tree_first_element($li.first());
                        
		    /**
			 * only <li> elements of root UL having <ul> as child will be treated as project
			var $projects = $(this).find('ul:first-child').children('li').has('ul');			
			$projects.each(function(){				
				$.fn.scrapTree.tree_project_element($(this).first());
			});
		     */
			
			/**
			 * find all projects and apply .bg class
			 */
            
			var $projects = $(this).find('li.project');
						
			$projects.each(function(){				
				$.fn.scrapTree.tree_project_element($(this).first());
			});
			
            if (settings.bgHightlight){
            	$.fn.scrapTree.tree_project_element($li.first());
            }
           
            $ul.children('li.folder-group:last-child').addClass("last");
                       
            if(settings.useCookie && $.fn.scrapTree.check_cookie("scrapTree"))
            {
                var object_index = JSON.parse($.fn.scrapTree.get_cookie("scrapTree"));
                $.each( object_index, function( key, value ) {
                    $this = $ul.find("li.folder-group").eq(value);
                    $.fn.scrapTree.set_icons($this.children('span:first')); 
                    $this.children('ul:first').toggle();
                });
            } else if($li.hasClass("active"))
            {
                $active = $ul.find("li.folder-group.active");
                $active.each(function(){
                    $.fn.scrapTree.set_icons($(this).children('span:first')); 
                    $(this).children('ul:first').toggle();
                });
                
                $active.parentsUntil("div", ".folder-group").each(function(){
                    $.fn.scrapTree.set_icons($(this).children('span:first')); 
                    $(this).children('ul:first').toggle();
                });    
            }   
            
            $(this).on('click', '.plus, .minus, .bg', function(){
                
            	
                if(settings.useCookie)
                {
                    var obect_index = [];
                    $(this).parentsUntil("div", ".folder-group").each(function(){
                        obect_index.push($(this).index(".folder-group"));
                    });
                    $.fn.scrapTree.set_cookie("scrapTree", JSON.stringify(obect_index));
                }
                
                if(settings.closeSameLevel)
                {
                    $.fn.scrapTree.close_same_level($(this));
                }
                
                $.fn.scrapTree.set_icons($(this));
                $(this).parent().children('ul:first').toggle(150);
            });
        });
    };
    
    $.fn.scrapTree.set_cookie = function(name, value)
    {
         document.cookie = name + "=" + value;
    };
    
    $.fn.scrapTree.get_cookie = function(name)
    {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    };
    
    $.fn.scrapTree.check_cookie = function(name)
    {
        var _cookie = document.cookie;
        var pattern = new RegExp(""+name+"=([^;=]+)[;\\b]?");
	
		if(pattern.test(_cookie))
		{
	            return true;
		}
    }
    
    // on click
	$.fn.scrapTree.set_icons = function($selected) {
		if (!$selected.parent().children('ul:first').is(':visible')) {

			if ($selected.hasClass('bg')) {
				$selected.children('span.plus').removeClass('plus').addClass(
						'minus')
				$selected.children('span.folder').removeClass('folder')
						.addClass('folder-open')

			} else {
				$selected.removeClass("plus").addClass("minus");
				$selected.siblings("span").removeClass("folder").addClass(
						"folder-open");
				if($selected.siblings("#scraplist").find("li").length > 0){
					if($selected.hasClass("minus")){
						$selected.siblings(".checkStylebox").show();
					}					
				}
				else{
					$selected.siblings(".checkStylebox").hide();
				}
			}
		} else {
			if ($selected.hasClass('bg')) {
				$selected.children('span.minus').removeClass('minus').addClass(
						'plus')
				$selected.children('span.folder-open').removeClass('folder-open')
						.addClass('folder')
			} else {
				$selected.removeClass("minus").addClass("plus");
				$selected.siblings("span").removeClass("folder-open").addClass(
						"folder");
				$selected.siblings(".checkStylebox").hide();
			}
		}
	};
    
    $.fn.scrapTree.close_same_level = function($selected)
    {
        var $same_level = $selected.parent().siblings(".folder-group").children('ul:first'); 

        if($same_level.is(':visible')) 
        {
            $same_level.toggle(250);
            $.fn.scrapTree.set_icons($selected.parent().siblings(".folder-group").children('span:first'));    
        }
    };
    
    /**
	 * Display first
	 * <li> of top level <Ul> as root
	 * <Ul>
	 * as root
	 */
	$.fn.scrapTree.tree_first_element = function($selected) {
		$selected.children("span.join").remove();
		$selected.children("span").addClass("main").removeClass("page");		
	};
	
	/**
	 * @author mukesh.kumar
	 * decorate project node
	 */
	$.fn.scrapTree.tree_project_element = function($selected) {
		$selected.contents().not('ul').wrapAll("<span class='bg'/>");
	};
          
}( jQuery ));