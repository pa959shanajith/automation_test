//Window Load Function
function loadBody(){
	$("body").delay(400).animate({opacity:"1"})
}
window.onload = loadBody;
//Window Load Function

//Document Ready Function
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
        $(this).siblings(".popupWrap").animate({ opacity: 1, right: "92px" }, 100).css({'z-index':'12','pointer-events':'all','display':'block'}).focus()
    })
    .on("click", ".closePopup", function(){
        $(".popupWrap").animate({ opacity: 0, right: "70px" }, 100).css({'z-index':'0','pointer-events':'none'})
        $(".thumb-ic").removeClass("thumb-ic-highlight");
    })

    //Filter Function - Screen Level
    $(document).on("click", ".popupContent-default", function(){
        $(this).removeClass("popupContent-default").addClass("popupContent-filter-active"); 
    })
    
    $(document).on("click", ".popupContent-filter-active", function(){
        $(this).removeClass("popupContent-filter-active").addClass("popupContent-default"); 
    })
    
    //To Select All Element Filters
	$(document).on('click', ".checkStyleboxFilter", function(){
		if($(this).is(":checked"))
			{
			 $('.popupContent-filter div span:not(.selectAllTxt)').addClass('popupContent-filter-active').removeClass('popupContent-default');
			}
		else{
			 $('.popupContent-filter div span:not(.selectAllTxt)').removeClass('popupContent-filter-active').addClass('popupContent-default');
		} 
	})
	
	//If all filters get selected then parent select all get selected
	$(document).on('click', ".popupContent-filter div span", function(){
		var defaultFilterLen = $('.popupContent-filter div span:not(.selectAllTxt)').length;
		var activefilterLen =  $('.popupContent-filter-active').length;
		if(defaultFilterLen == activefilterLen)
		{
			$(".checkStyleboxFilter").prop('checked', true);
		}
		else{
			$(".checkStyleboxFilter").prop('checked', false);
		}
	})
	
});
//Document Ready Function


//Innerpages Tasks Implementation
function loadUserTasks(){
	var tasksJson = JSON.parse(window.localStorage['_TJ'])
    $(".task-content-inner").empty().hide()
    var counter = 1;
    for(i=0; i<tasksJson.length; i++){
		if(tasksJson[i].Task_Type == "Design"){
			$(".task-content-inner").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+i+'"><span class="taskNo">Task '+ counter +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-task-directory">'+tasksJson[i].Task_Type+'</span><span class="panel-head-details details-design-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+i+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTaskInner" data-name="'+tasksJson[i].Sub_Task+'" onclick="taskRedirectionInner(this.dataset.name)">'+tasksJson[i].Task_Name+'</span></div></div></div>').fadeIn()
		} 
    	else if(tasksJson[i].Task_Type == "Execution"){
    		$(".task-content-inner").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+i+'"><span class="taskNo">Task '+ counter +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-task-directory">'+tasksJson[i].Task_Type+'</span><span class="panel-head-details details-execute-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+i+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTaskInner" data-name="'+tasksJson[i].Sub_Task+'" onclick="taskRedirectionInner(this.dataset.name)">'+tasksJson[i].Task_Name+'</span></div></div></div>').fadeIn()
    	}
		counter++
    }
}

function taskRedirectionInner(path){
	if(path == "Screen") 			window.location.pathname = "/design"
    else if(path == "TestScript")	window.location.pathname = "/designTestScript"
    else if(path == "TestSuite")	window.location.pathname = "/execute"
    else if(path == "Scheduling")	window.location.pathname = "/scheduling"
}

//Innerpages Tasks Implementation

//Function to Block UI & unBlockUI
function blockUI(content)
{
	$("body").append("<div id='overlayContainer'><div class='contentOverlay'>"+content+"</div></div>");
	$("#overlayContainer").fadeIn( "slow" );
}

function unblockUI(){
	$("#overlayContainer").fadeOut().remove()
}
//Function to Block UI