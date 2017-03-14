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
        $(this).parents(".panel-heading").css({'background':'#efefef'})
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
        if($(this).siblings(".popupWrap").attr("id") == "window-scrape-screenshot" || $(this).siblings(".popupWrap").attr("id") == "window-scrape-screenshotTs"){
        	$(this).siblings(".popupWrap").animate({ opacity: 1, right: "97px" }, 100).css({'z-index':'12','pointer-events':'all','display':'block'}).focus()
        } else{
        	$(this).siblings(".popupWrap").animate({ opacity: 1, right: "92px" }, 100).css({'z-index':'12','pointer-events':'all','display':'block'}).focus()
        }
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
	
	//Assist functionality
	$(document).on("click", ".animateAssistUp", function(){
		$(this).attr("src","imgs/ic-down.png").attr("class","animateAssistDown")
		$(".assistContent").fadeIn()
	})
	
	$(document).on("click", ".animateAssistDown", function(){
		$(this).attr("src","imgs/ic-up.png").attr("class","animateAssistUp")
		$(".assistContent").fadeOut(100)
	})
	
	$(document).on("click", ".animateAssistClose", function(){
		$(".assistWrap").fadeOut(100)
	})
	
	$(document).on("click", ".slide_assist", function(){
		$(".assistWrap").fadeIn(100)
	})
	
});
//Document Ready Function


//Innerpages Tasks Implementation
function loadUserTasks(){
	$("#mindmapCSS1, #mindmapCSS2").remove()
	var tasksJson = JSON.parse(window.localStorage['_TJ'])
	$(".task-content-inner").empty().hide()
	var counter = 1;
	for(i=0; i<tasksJson.length; i++){
		for(j=0;j<tasksJson[i].taskDetails.length;j++){
			if(tasksJson[i].taskDetails[j].taskType == "Design"){
				$(".task-content-inner").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+counter+'"><span class="taskNo">Task '+ counter +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-task-directory">'+tasksJson[i].taskDetails[j].taskType+'</span><span class="panel-head-details details-design-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+counter+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTaskInner" data-apptype="'+tasksJson[i].appType+'" data-projectid="'+tasksJson[i].projectId+'" data-releaseid="'+tasksJson[i].releaseId+'"  data-cycleid="'+tasksJson[i].cycleId+'"  data-screenid="'+tasksJson[i].screenId+'"  data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-testsuiteid="'+tasksJson[i].testSuiteId+'"  data-testsuitename="'+tasksJson[i].testSuiteName+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskdescription="'+tasksJson[i].taskDetails[j].taskDescription+'"  data-subtasktype="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'"  data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-expectedenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" onclick="taskRedirectionInner(this.dataset.subtasktype,this.dataset.screenid,this.dataset.screenname,this.dataset.projectid,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.releaseid,this.dataset.cycleid,this.dataset.testsuiteid,this.dataset.testsuitename)">'+tasksJson[i].taskDetails[j].taskName+'</span></div></div></div>').fadeIn()
			}
			else if(tasksJson[i].taskDetails[j].taskType == "Execution"){
				$(".task-content-inner").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+counter+'"><span class="taskNo">Task '+ counter +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-task-directory">'+tasksJson[i].taskDetails[j].taskType+'</span><span class="panel-head-details details-design-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+counter+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTaskInner" data-apptype="'+tasksJson[i].appType+'" data-projectid="'+tasksJson[i].projectId+'" data-releaseid="'+tasksJson[i].releaseId+'"  data-cycleid="'+tasksJson[i].cycleId+'"  data-screenid="'+tasksJson[i].screenId+'"  data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-testsuiteid="'+tasksJson[i].testSuiteId+'"  data-testsuitename="'+tasksJson[i].testSuiteName+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskdescription="'+tasksJson[i].taskDetails[j].taskDescription+'"  data-subtasktype="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'"  data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-expectedenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" onclick="taskRedirectionInner(this.dataset.subtasktype,this.dataset.screenid,this.dataset.screenname,this.dataset.projectid,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.releaseid,this.dataset.cycleid,this.dataset.testsuiteid,this.dataset.testsuitename)">'+tasksJson[i].taskDetails[j].taskName+'</span></div></div></div>').fadeIn()
			}
			counter++
		}
	}
}


function taskRedirectionInner(subtasktype,screenid,screenname,projectid,taskname,testcaseid,testcasename,apptype,releaseid,cycleid,testsuiteid,testsuitename){
	debugger;
	var taskObj = {};
		taskObj.screenId = screenid;
		taskObj.screenName = screenname;
		taskObj.projectId = projectid;
		taskObj.taskName = taskname;
		taskObj.testCaseId = testcaseid;
		taskObj.testCaseName = testcasename;
		taskObj.releaseId = releaseid;
		taskObj.cycleId = cycleid;
		taskObj.testSuiteId = testsuiteid;
		taskObj.testSuiteName = testsuitename;
		taskObj.appType = apptype;
		taskObj.subTaskType = subtasktype; 
		window.localStorage['_CT'] = JSON.stringify(taskObj);
	if(subtasktype == "Scrape")                       window.location.pathname = "/design"
		else if(subtasktype == "TestCase")      	  window.location.pathname = "/designTestCase"
			else if(subtasktype == "TestSuite")       window.location.pathname = "/execute"
				else if(subtasktype == "Scheduling")  window.location.pathname = "/scheduling"
}


//Innerpages Tasks Implementation

//Function to Block UI & unBlockUI
function blockUI(content)
{
	$("body").append("<div id='overlayContainer'><div class='contentOverlay'>"+content+"</div></div>");
	$("#overlayContainer").fadeIn(300);
}

function unblockUI(){
	$("#overlayContainer").fadeOut(300).remove()
}
//Function to Block UI

$(document).on('keypress', '.singleInvitedComma', function(e){
	if(e.charCode == 39) return false;
	else return true;
}).blur(function(){
	var reg = /^[']+$/;
	if(!reg.test($(this).val())){
		return false;
	}else{
		$(this).val('');
		return true;
	}
})