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
});

function loadBody(){
	$("body").delay(400).animate({opacity:"1"})
}

window.onload = loadBody;
