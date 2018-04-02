//Window Load Function
function loadBody(){
	$("body").delay(400).animate({opacity:"1"})
}
window.onload = loadBody;
//Window Load Function

var Encrypt = {
		_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
		encode: function(input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
	
			input = Encrypt._utf8_encode(input);
	
			while (i < input.length) {
	
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
	
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
	
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
	
				output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
	
			}
	
			return output;
		},
	
		_utf8_encode: function(string) {
			string = string.replace(/\r\n/g, "\n");
			var utftext = "";
	
			for (var n = 0; n < string.length; n++) {
	
				var c = string.charCodeAt(n);
	
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if ((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
	
			}
	
			return utftext;
		},
	
	}
		

setTimeout(function(){
	//For bootstrap tool tip
	$('[data-toggle="tooltip"]').tooltip();
}, 500)

//To prevent Back Button in browser
history.pushState(null, null, document.URL);
window.addEventListener('popstate', function () {
	var currentURL = document.URL.split("/")[0]+'/'+window.localStorage.navigateScreen;
	history.pushState(null, null, currentURL);
});
//   /**
//    * 'XSRF-TOKEN',
//    * 'X-XSRF-TOKEN' name changed
//    * @author - sushma.p
//    */
// $.extend($.jgrid.defaults, {
// 	ajaxRowOptions : {
// 		beforeSend : function(jqXHR) {
// 			var csrf_token = getCookie("29927e0554f6483cfd4761fa4c8edfd1");
// 			jqXHR.setRequestHeader('1753f5bdd248dcf909f106d0a6595dab', csrf_token);
// 		}
// 	}
// })

$(document).ajaxSend(function(elm, xhr, s){
    if (s.type == "POST") {
        s.data += s.data?"&":"";
        s.data += "_token=" + $('#csrf-token').val();
    }
});

//Document Ready Function
$(document).ready(function() {
	//prevent special characters(such as <,>,',"",-) for all the Inputs except for password field, testcase grid inputs and edit on scrapedobjects.
	$(document).on("keydown","input[type='text']:not([type=password]):not(.editObjectName):not(.editable):not(#userName):not(#firstName):not(#lastName):not(.launchPopupInput), textarea:not(.editable):not(.wsdlTextAreaBody)", function(e) {
		if(e.target.className == 'searchScrapInput' )
		{
			if(e.keyCode === 222)
			{
				return true;
			}
		}
		if(e.shiftKey && e.keyCode == 189)
		{
			return true;
		}
		else if($(this).attr("id") == "mobilitySerialPath" && e.keyCode == 189)
		{
			return true;
		}
		else if(e.keyCode == 222 || e.shiftKey && e.keyCode == 222 || e.shiftKey && e.keyCode == 188 || e.shiftKey && e.keyCode == 190 || (e.currentTarget.getAttribute("id") == "getremarksData" && e.keyCode == 186 && !e.shiftKey))
		{
			return false;
		}
	});
	//Prevent special characters(such as <,>,',"",-) for all the Inputs except for password field, testcase grid inputs and edit on scrapedobjects on cut copy paste
	$(document).on("cut copy paste","input[type='text']:not([type=password]):not(.editObjectName):not(.editable), textarea:not(.editable)", function(e){
		if(e.target.className != "wsdlTextAreaBody"){
			var element = this;
			setTimeout(function () {
				var userEnteredText = $(element).val();
				if(e.target.id == "getremarksData") userEnteredText = userEnteredText.replace (/[<>'";]/g ,"");
				else userEnteredText = userEnteredText.replace (/[<>'"]/g ,"");
				$(element).val(userEnteredText);
			}, 5); //html5 min is 4ms.			
		}
	});
	
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
		if(!($(this).attr('title') == "Filter" && (window.localStorage['navigateScreen'] == "Scrape" && $('#scraplist li').length <= 0))){
			$(".thumb-ic").removeClass("thumb-ic-highlight")
			$(".popupWrap").animate({ opacity: 0, right: "70px" }, 100).css({'z-index':'0','pointer-events':'none'})
			$(this).children(".thumb-ic").addClass("thumb-ic-highlight")
			if($(this).siblings(".popupWrap").attr("id") == "window-scrape-screenshot" || $(this).siblings(".popupWrap").attr("id") == "window-scrape-screenshotTs"){
				$(this).siblings(".popupWrap").animate({ opacity: 1, right: "97px" }, 100).css({'z-index':'12','pointer-events':'all','display':'block'}).focus()
			} else{
				$(this).siblings(".popupWrap").animate({ opacity: 1, right: "92px" }, 100).css({'z-index':'12','pointer-events':'all','display':'block'}).focus()
				$(".searchInputMyTask").focus();
			} 
		}
		if(window.localStorage['_CT'])
		{
			var subTaskID = JSON.parse(window.localStorage['_CT']).subTaskId;
		}
		if(window.location.pathname != "/scheduling"){
			var selectedTask = $("#window-task").find("#accordion").find(".assignedTaskInner");
			$.each(selectedTask, function(){
				if($(this)[0].dataset.subtaskid == subTaskID){
					$(this).parents(".panel-default").addClass("disableActions");
					$(this)[0].setAttribute("onclick","");
					$(this).css("cursor","default");
					return false;
				}
			})
			setTimeout(function(){
				$(".assignedTaskInner").each(function(){
					if($(this)[0].dataset.subtaskid == subTaskID){
						$(this).trigger("click");
						return false;
					}
				})    		
			}, 200)
		}
		if(window.localStorage['_CT'])
		{
			if(JSON.parse(window.localStorage['_CT']).appType == "MobileWeb" && navigator.appVersion.indexOf("Win")!=-1){
				if(parseInt(viewString.mirrorwidth) > 800)
				{}
				else{
					$("#window-scrape-screenshot").css({"width":""+viewString.mirrorwidth+"px", /*"height": ""+viewString.mirrorheight+"px",*/ "max-height":""+viewString.mirrorheight+"px !important"});        	 
					$("#window-scrape-screenshot .popupContent").css({"width":""+viewString.mirrorwidth+"px", "height": ""+viewString.mirrorheight+"px"});
				}
			}
			else 
			if(JSON.parse(window.localStorage['_CT']).appType == "MobileApp"){
				if(navigator.appVersion.indexOf("Win")!=-1){
					$("#window-scrape-screenshot").css({"width":""+(parseInt(viewString.mirrorwidth)/3)+"px", /*"height": ""+viewString.mirrorheight+"px",*/ "max-height":""+(parseInt(viewString.mirrorheight)/3)+"px !important"});        	 
					$("#window-scrape-screenshot .popupContent").css({"width":""+(parseInt(viewString.mirrorwidth)/3)+"px", "height": ""+(parseInt(viewString.mirrorheight)/3)+"px"});        		 
				}
				else if(navigator.appVersion.indexOf("Mac")!=-1){
					$("#window-scrape-screenshot").css({"width":""+viewString.mirrorwidth+"px", /*"height": ""+viewString.mirrorheight+"px",*/ "max-height":""+viewString.mirrorheight+"px !important"});        	 
					$("#window-scrape-screenshot .popupContent").css({"width":""+viewString.mirrorwidth+"px", "height": ""+viewString.mirrorheight+"px"});        		 
				}
			}
		}
		//Filter My Tasks
		$(document).find('.searchInputMyTask').keyup(function() {
			filterMyTasks(this); 
		});

		function filterMyTasks(element) {
			var value = $(element).val();
			$(".panel-default span.assignedTaskInner").each(function () {
				if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
					$(this).parents(".panel-default").show();
				} else {
					$(this).parents(".panel-default").hide();
				}
			});
			var counter=1;
			$(".panel-default h4:visible").each(function () {
				$(this).text(counter) 
				counter++;
			});
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

	$(document).on("click", ".globalSubmit", function(){
		window.localStorage['navigateScreen'] = "plugin"
		window.location.href = "/plugin";
	});

	//Special character validation
	/*$(document).on('keypress','.forValidation', function(e){	
    	var targetName = e.target.parentElement.firstChild.textContent.trim();
    	var targetClass = e.target.className.split(" ")[0];
    	var className = e.target.className;
    	if (className == "datagrid-editable-input"){
    		if(e.charCode == 32){
    			return true;
    	    }
    	}
    	if((targetName == "TestScript Name:" || targetName == "Screen Name:" || targetName == "Scenario Name:" || targetName == "Test Suite Name:") || e.target.parentElement.firstElementChild.textContent.trim() == "UI Test Script name:" || (targetClass == "dynamicInputBoxStyle" || "dynamicInputBoxStyleTS" || "dynamicInputBoxStyleScenario" || "dynamicInputBoxStyleSuite")){
    		if(e.charCode >= 189 || e.charCode == 46) return true;
    	    else if((e.charCode < 95 || e.charCode > 122) && (e.charCode < 48 || e.charCode > 57) && (e.charCode < 65 || e.charCode > 90) && (e.charCode != 45) || e.charCode == 96 || e.charCode == 32) return false;
    	}else{
    		if(e.charCode >= 189 || e.charCode == 32 || e.charCode == 46) return true;
    	    else if((e.charCode < 95 || e.charCode > 122) && (e.charCode < 48 || e.charCode > 57) && (e.charCode < 65 || e.charCode > 90) && (e.charCode != 45) || e.charCode == 96) return false;		
    	}
    }).blur(function(){
    	var reg = /^[a-zA-Z0-9\s\.\-\_]+$/
    		  if(reg.test($(this).val())){
    			  return true;
    		  }
    		  else if($(this).val() == ''){
    		  }
    		  else{
    			  //showDialogMesgsBtn("Incorrect Inputs","Cannot contain special characters other than ._- and space","btnSCV3");
    			  $(this).val('');
    			  return false;
    		  }
      });*/
});
//Document Ready Function


//Innerpages Tasks Implementation
function loadUserTasks(){
	if(window.location.pathname != '/mindmap'){
		$("#mindmapCSS1, #mindmapCSS2").remove()
	}
	else if(window.location.pathname != "/neuronGraphs"){
		$("#nGraphsCSS").remove()
	}
	var tasksJson = JSON.parse(window.localStorage['_TJ'])
	$(".task-content-inner").empty().hide()
	var counter = 1;
	for(i=0; i<tasksJson.length; i++){
		var classIndex = i<100 ? "tasks-l-s": i<1000? "tasks-l-m" : "tasks-l-l";
		for(j=0;j<tasksJson[i].taskDetails.length;j++){
			var testSuiteDetails = JSON.stringify(tasksJson[i].testSuiteDetails);
			var taskTypeIcon = "imgs/ic-taskType-yellow-plus.png";

			if(tasksJson[i].taskDetails[j].taskType == "Execution"){
				taskTypeIcon = "imgs/ic-taskType-blue-plus.png";
			}

			$(".task-content-inner").append('<div class="panel panel-default"><div class="panel-heading"><div style="margin-top: 9px;min-height: 40px;margin-top: 15px;" href="#collapse' + counter + '"><h4 class="taskNo-Inner-Pgs '+classIndex+'" style="margin-top: -1px;">' + counter + '</h4><span class="assignedTask-Inner-Pgs assignedTaskInner" data-testsuitedetails='+testSuiteDetails+' data-scenarioflag='+tasksJson[i].scenarioFlag+'  data-apptype="' + tasksJson[i].appType + '" data-projectid="' + tasksJson[i].projectId + '" data-screenid="' + tasksJson[i].screenId + '"  data-screenname="' + tasksJson[i].screenName + '" data-testcaseid="' + tasksJson[i].testCaseId + '" data-testcasename="' + tasksJson[i].testCaseName + '"  data-scenarioid="' + tasksJson[i].scenarioId + '" data-taskname="' + tasksJson[i].taskDetails[j].taskName + '" data-taskdes="' + tasksJson[i].taskDetails[j].taskDescription + '" data-tasktype="' + tasksJson[i].taskDetails[j].taskType + '" data-subtasktype="' + tasksJson[i].taskDetails[j].subTaskType + '" data-subtaskid="' + tasksJson[i].taskDetails[j].subTaskId + '"  data-assignedtestscenarioids='+tasksJson[i].assignedTestScenarioIds+' data-assignedto="' + tasksJson[i].taskDetails[j].assignedTo + '" data-startdate="' + tasksJson[i].taskDetails[j].startDate + '" data-exenddate="' + tasksJson[i].taskDetails[j].expectedEndDate + '" data-status="' + tasksJson[i].taskDetails[j].status+'" data-versionnumber='+tasksJson[i].versionnumber+' data-batchTaskIDs="'+tasksJson[i].taskDetails[j].batchTaskIDs+'" data-releaseid="'+tasksJson[i].releaseid+'" data-cycleid="'+tasksJson[i].cycleid+'" data-reuse="'+tasksJson[i].taskDetails[j].reuse+'" onclick="taskRedirectionInner(this.dataset.testsuitedetails,this.dataset.scenarioflag,this.dataset.assignedtestscenarioids,this.dataset.subtasktype,this.dataset.screenid,this.dataset.screenname,this.dataset.projectid,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.scenarioid,this.dataset.subtaskid,this.dataset.versionnumber,this.dataset.status,this.dataset.batchtaskids,this.dataset.releaseid,this.dataset.cycleid,this.dataset.reuse)">' + tasksJson[i].taskDetails[j].taskName + '</span><!--Addition--><div class="panel-additional-details"><img style="height: 20px;opacity: 0.7;" src="'+taskTypeIcon+'"/><button class="panel-head-tasktype-Inner-Pgs">' + tasksJson[i].taskDetails[j].taskType + '</button></div><!--Addition--></div></div></div>').fadeIn()
			
			counter++
		}
	}
}

function taskRedirectionInner(testsuitedetails,scenarioflag,assignedtestscenarioids,subtasktype,screenid,screenname,projectid,taskname,testcaseid,testcasename,apptype,scenarioid,subtaskid,versionnumber,status,batchTaskIDs,releaseid,cycleid,reuse){
	var taskObj = {};
	if(status=='assigned'){
		status='inprogress';
	}
	taskObj.scenarioFlag = scenarioflag;
	taskObj.assignedTestScenarioIds = assignedtestscenarioids;
	taskObj.screenId = screenid;
	taskObj.screenName = screenname;
	taskObj.projectId = projectid;
	taskObj.taskName = taskname;
	taskObj.testCaseId = testcaseid;
	taskObj.testCaseName = testcasename;
	//	taskObj.releaseId = releaseid;
	//	taskObj.cycleId = cycleid;
	//	taskObj.testSuiteId = testsuiteid;
	taskObj.scenarioId = scenarioid;
	taskObj.status = status;
	//	taskObj.testSuiteName = testsuitename;
	taskObj.appType = apptype;
	taskObj.subTaskType = subtasktype;
	taskObj.subTaskId=subtaskid;
	taskObj.versionnumber=versionnumber;
	taskObj.batchTaskIDs=batchTaskIDs;
	taskObj.releaseid = releaseid;
	taskObj.cycleid = cycleid;
	taskObj.reuse=reuse;
	taskObj.testSuiteDetails = JSON.parse(testsuitedetails);
	window.localStorage['_CT'] = JSON.stringify(taskObj);
	if(subtasktype == "Scrape"){
		window.localStorage['navigateScreen'] = "Scrape";
		window.localStorage['navigateScrape'] = true;
		window.location.pathname = "/design"
	}
	else if(subtasktype == "TestCase"){
		window.localStorage['navigateScreen'] = "TestCase";
		window.localStorage['navigateTestcase'] = true;
		window.location.pathname = "/designTestCase"
	}
	else if(subtasktype == "TestSuite"){
		window.localStorage['navigateScreen'] = "TestSuite";
		window.location.pathname = "/execute"
	}
	else if(subtasktype == "Scheduling"){
		window.localStorage['navigateScreen'] = "scheduling";
		window.location.pathname = "/scheduling"
	}
}
//Innerpages Tasks Implementation

//Function to Block UI & unBlockUI
function blockUI(content){
	$("body").append("<div id='overlayContainer'><div class='contentOverlay'>"+content+"</div></div>");
	$("#overlayContainer").fadeIn(300);
}

function unblockUI(){
	$("#overlayContainer").fadeOut(300).remove()
}
//Function to Block UI

function p_redirect(name){
	window.localStorage['navigateScreen'] = name;
	if(name == 'p_Reports'){
		localStorage.setItem('fromExecution','true');
	}
	window.location.assign(name);
}

function replaceHtmlEntites(selectedText) {
	var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
	var translate = {"nbsp": " ","amp" : "&","quot": "\"","lt"  : "<","gt"  : ">"};
	return ( selectedText.replace(translate_re, function(match, entity) {
		return translate[entity];
	}) );
};

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

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}