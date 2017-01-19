$(document).ready(function() {	
    //Task Function - Plugin Page
    $(document).on("click", ".task-content .collapse-head", function(){
        $(".caret-absolute").hide()
        $(".panel-heading").css({'background':''})
        $(this).parents(".panel-heading").css({'background':'#eee'})
        if($(this).hasClass("collapsed")) {
            $(".panel-heading").css({'background':''})
            $(this).find(".caret-absolute").fadeOut()
        } 
        else{
            $(this).find(".caret-absolute").fadeIn(function(){
                $(this).css({
                    'border-top': '4px solid ' + $(this).parent().css("background-color")                    
                })
            })
        }
    })  

    //Task Function - Design Page
    $(document).on("click", ".task-content-inner .collapse-head", function(){
        $(".caret-absolute").hide()
        if($(this).hasClass("collapsed")) $(this).find(".caret-absolute").fadeOut()
        else{
            $(this).find(".caret-absolute").fadeIn(function(){
                $(this).css({
                    'border-top': '4px solid ' + $(this).parent().css("background-color")                    
                })
            })
        }
    }) 

    //Popup Function - Screen Level (Screenshot, Filter, Tasks, Project Info)
    $(document).on("click", ".slidePopup", function(e){
        $(".thumb-ic").removeClass("thumb-ic-highlight")
        $(".popupWrap").animate({ opacity: 0, right: "70px" }, 100).css({'z-index':'0','pointer-events':'none'})
        $(this).children(".thumb-ic").addClass("thumb-ic-highlight")
        $(this).siblings(".popupWrap").animate({ opacity: 1, right: "92px" }, 100).css({'z-index':'1','pointer-events':'all'}).focus()
    })
    .on("click", ".closePopup", function(){
        $(".popupWrap").animate({ opacity: 0, right: "70px" }, 100).css({'z-index':'0','pointer-events':'none'})
        $(".thumb-ic").removeClass("thumb-ic-highlight");
    })

    //Filter Function - Screen Level
    $(document).on("click", ".popupContent-filter div span", function(){
        $(this).toggleClass("popupContent-filter-active")
    })

    //--------------------- Admin JS ----------------------------------//
	$('.dropdown').on('show.bs.dropdown', function(e){
	    $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
	});
	$('.dropdown').on('hide.bs.dropdown', function(e){
		$(this).find('.dropdown-menu').first().stop(true, true).slideUp(300);
	});
    
    toggleMenu = function() {
        var elem = document.getElementById("sidebar-wrapper");
    	left = window.getComputedStyle(elem,null).getPropertyValue("left");
        // hiding the sidebar
		if(left == "200px"){
			document.getElementsByClassName("sidebar-toggle")[0].style.left="-200px";
            $('#overlay').css('opacity', 0);
            setTimeout(function() {
                $('#overlay').remove();
            }, 300);
		}
        // showing the sidebar
		else if(left == "-200px"){
			document.getElementsByClassName("sidebar-toggle")[0].style.left="200px";
            // adding overlay to darken #page-wrapper and dismiss the left drawer...
            $overlay = $('<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0; left: 0; background: rgb(0, 0, 0); opacity: 0; transition: ease-in-out all .3s"></div>');
            $overlay.click(toggleMenu);            
            setTimeout(function() {
                $overlay.css('opacity', .1);
            }, 200);
            $('#page-wrapper').prepend($overlay);
		}
    }
	$("#menu-toggle").click(function(e) {
        e.preventDefault();
        toggleMenu();        
	});
    
    $("[data-parent]").click(function(e) {
        console.log('clicked');
        $parent = $($(this).attr('data-parent'));
        actives = $parent.find('.in:not(data-target)'.replace('data-target', $(this).attr('data-target')));
        actives.collapse('hide');
    });

     $(".panel-body").click(function(e) {
         window.location.href = '/design';
     });
     $(document).on("click", ".panel-body", function(){
        window.location.href = '/design';
    })
});
