//Window Load Function
function loadBody(){
	$("body").delay(400).animate({opacity:"1"});
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
	}
};

setTimeout(function(){
	//For bootstrap tool tip
	$('[data-toggle="tooltip"]').tooltip();
}, 500);

//To prevent Back Button in browser
history.pushState(null, null, document.URL);
window.addEventListener('popstate', function () {
	var currentURL = document.URL.split("/")[0]+'/'+window.localStorage.navigateScreen;
	history.pushState(null, null, currentURL);
});
//   /**
//	* 'XSRF-TOKEN',
//	* 'X-XSRF-TOKEN' name changed
//	* @author - sushma.p
//	*/
// $.extend($.jgrid.defaults, {
// 	ajaxRowOptions : {
// 		beforeSend : function(jqXHR) {
// 			var csrf_token = getCookie("29927e0554f6483cfd4761fa4c8edfd1");
// 			jqXHR.setRequestHeader('1753f5bdd248dcf909f106d0a6595dab', csrf_token);
// 		}
// 	}
// })

// $(document).ajaxSend(function(elm, xhr, s){
//	 if (s.type == "POST") {
//		 s.data += s.data?"&":"";
//		 s.data += "_token=" + $('#csrf-token').val();
//	 }
// });

//Document Ready Function
$(document).ready(function() {
	//prevent special characters(such as <,>,',"",-) for all the Inputs except for password field, testcase grid inputs and edit on scrapedobjects.
	$(document).on("keydown","input[type='text']:not([type=password]):not(.editObjectName):not(.editable):not(#userName):not(#firstName):not(#lastName):not(.launchPopupInput):not(.form-control.form-control-custom-prop), textarea:not(.editable):not(.wsdlTextAreaBody)", function(e) {
		if ((e.target.className == 'searchScrapInput' && e.keyCode === 222) || (e.shiftKey && e.keyCode == 189) || ($(this).attr("id") == "mobilitySerialPath" && e.keyCode == 189))
			return true;
		else if(e.keyCode == 222 || e.shiftKey && e.keyCode == 222 || e.shiftKey && e.keyCode == 188 || e.shiftKey && e.keyCode == 190 || (e.currentTarget.getAttribute("id") == "getremarksData" && e.keyCode == 186 && !e.shiftKey))
			return false;
	});
	//Prevent special characters(such as <,>,',"",-) for all the Inputs except for password field, testcase grid inputs and edit on scrapedobjects on cut copy paste
	$(document).on("cut copy paste","input[type='text']:not([type=password]):not(.editObjectName):not(.editable):not(.form-control.form-control-custom-prop), textarea:not(.editable)", function(e){
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
		$(".caret-absolute").hide();
		$(".panel-heading").css({'background':''});
		$(this).parents(".panel-heading").css({'background':'#efefef'});
		if($(this).hasClass("collapsed")) {
			$(".panel-heading").css({'background':''});
			$(this).find(".caret-absolute").fadeOut();
		} 
		else{
			$(this).find(".caret-absolute").fadeIn(function(){
				$(this).css({
					'border-top': '4px solid ' + $(this).parent().css("background-color")					
				});
			});
		}
	});  

	//Task Function - Design Page
	$(document).on("click", ".task-content-inner .collapse-head", function(){
		$(".caret-absolute").hide();
		if($(this).hasClass("collapsed")) $(this).find(".caret-absolute").fadeOut();
		else{
			$(this).find(".caret-absolute").fadeIn(function(){
				$(this).css({
					'border-top': '4px solid ' + $(this).parent().css("background-color")					
				});
			});
		}
	}); 

	//Popup Function - Screen Level (Screenshot, Filter, Tasks, Project Info)
	$(document).on("click", ".slidePopup", function(e){
		if(!($(this).attr('title') == "Filter" && (window.localStorage['navigateScreen'] == "Scrape" && $('#scraplist li').length <= 0))){
			$(".thumb-ic").removeClass("thumb-ic-highlight");
			$(".popupWrap").animate({ opacity: 0, right: "70px" }, 100).css({'z-index':'0','pointer-events':'none'});
			$(this).children(".thumb-ic").addClass("thumb-ic-highlight");
			if($(this).siblings(".popupWrap").attr("id") == "window-scrape-screenshot" || $(this).siblings(".popupWrap").attr("id") == "window-scrape-screenshotTs"){
				$(this).siblings(".popupWrap").animate({ opacity: 1, right: "97px" }, 100).css({'z-index':'12','pointer-events':'all','display':'block'}).focus();
			} else{
				$(this).siblings(".popupWrap").animate({ opacity: 1, right: "92px" }, 100).css({'z-index':'12','pointer-events':'all','display':'block'}).focus();
				$(".searchInputMyTask").focus();
			} 
		}
		if(window.localStorage['_CT']) {
			var ct = JSON.parse(window.localStorage['_CT']);
			var subTaskID = ct.subTaskId;
			if(window.location.pathname != "/scheduling"){
				var selectedTask = $("#window-task").find("#accordion").find(".assignedTaskInner");
				$.each(selectedTask, function(){
					if($(this)[0].dataset.subtaskid == subTaskID){
						$(this).parents(".panel-default").addClass("disableActions");
						$(this)[0].setAttribute("onclick","");
						$(this).css("cursor","default");
						return false;
					}
				});
				setTimeout(function(){
					$(".assignedTaskInner").each(function(){
						if($(this)[0].dataset.subtaskid == subTaskID){
							$(this).trigger("click");
							return false;
						}
					});			
				}, 200);
			}

			var appType = ct.appType;
			var appVersion = navigator.appVersion;
			if((appType == "MobileWeb" || appType == "MobileApp") && typeof(viewString) == "undefined") {
				viewString = {};
				viewString.mirrorwidth = '';
				viewString.mirrorheight = '';
			}
			if(appType == "MobileWeb" && appVersion.indexOf("Win")!=-1) {
				if(parseInt(viewString.mirrorwidth) <= 800) {
					$("#window-scrape-screenshot").css({"width":""+viewString.mirrorwidth+"px", "max-height":""+viewString.mirrorheight+"px !important"});
					$("#window-scrape-screenshot .popupContent").css({"width":""+viewString.mirrorwidth+"px", "height": ""+viewString.mirrorheight+"px"});
				}
			}
			else if(appType == "MobileApp") {
				if(appVersion.indexOf("Win")!=-1) {
					$("#window-scrape-screenshot").css({"width":""+(parseInt(viewString.mirrorwidth)/3)+"px", "max-height":""+(parseInt(viewString.mirrorheight)/3)+"px !important"});
					$("#window-scrape-screenshot .popupContent").css({"width":""+(parseInt(viewString.mirrorwidth)/3)+"px", "height": ""+(parseInt(viewString.mirrorheight)/3)+"px"});
				}
				else if(appVersion.indexOf("Mac")!=-1) {
					$("#window-scrape-screenshot").css({"width":""+viewString.mirrorwidth+"px", "max-height":""+viewString.mirrorheight+"px !important"});
					$("#window-scrape-screenshot .popupContent").css({"width":""+viewString.mirrorwidth+"px", "height": ""+viewString.mirrorheight+"px"});
				}
			}
		}
		//Filter My Tasks
		$(document).on("keyup", ".searchInputMyTask", function(e){
			filterMyTasks(this,e);
			e.stopImmediatePropagation(); 
		});
		var testval = '';
		function filterMyTasks(element,e) {
			setTimeout(function () {
				value = $(element).val();
				$(".panel-default span.assignedTaskInner").each(function () {
					var title = $(this).attr('title');
					if(title == undefined)
					{
						if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
							$(this).parents(".panel-default").show();
						} else {
							$(this).parents(".panel-default").hide();
						}
					}
					else{
						console.log(title);
						if (title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
							$(this).parents(".panel-default").show();
						} else {
							$(this).parents(".panel-default").hide();
						}
					}
					if (value != testval) {
						$(".description-container").remove();
					}
					testval = value;
				});
				var counter=1;
				$(".panel-default h4:visible").each(function () {
					$(this).text(counter); 
					counter++;
				});
			},5);
		} 
	})
	.on("click", ".closePopup", function(){
		$(".popupWrap").animate({ opacity: 0, right: "70px" }, 100).css({'z-index':'0','pointer-events':'none'});
		$(".thumb-ic").removeClass("thumb-ic-highlight");
	});

	//Filter Function - Screen Level
	$(document).on("click", ".popupContent-default", function(){
		$(this).removeClass("popupContent-default").addClass("popupContent-filter-active"); 
	});

	$(document).on("click", ".popupContent-filter-active", function(){
		$(this).removeClass("popupContent-filter-active").addClass("popupContent-default"); 
	});

	//To Select All Element Filters
	$(document).on('click', ".checkStyleboxFilter", function(){
		if($(this).is(":checked")) {
			$('.popupContent-filter div span:not(.selectAllTxt)').addClass('popupContent-filter-active').removeClass('popupContent-default');
		} else {
			$('.popupContent-filter div span:not(.selectAllTxt)').removeClass('popupContent-filter-active').addClass('popupContent-default');
		}
	});

	//If all filters get selected then parent select all get selected
	$(document).on('click', ".popupContent-filter div span", function(){
		var defaultFilterLen = $('.popupContent-filter div span:not(.selectAllTxt)').length;
		var activefilterLen =  $('.popupContent-filter-active').length;
		if(defaultFilterLen == activefilterLen) {
			$(".checkStyleboxFilter").prop('checked', true);
		} else{
			$(".checkStyleboxFilter").prop('checked', false);
		}
	});

	//Assist functionality
	$(document).on("click", ".animateAssistUp", function(){
		$(this).attr("src","imgs/ic-down.png").attr("class","animateAssistDown");
		$(".assistContent").fadeIn();
	});

	$(document).on("click", ".animateAssistDown", function(){
		$(this).attr("src","imgs/ic-up.png").attr("class","animateAssistUp");
		$(".assistContent").fadeOut(100);
	});

	$(document).on("click", ".animateAssistClose", function(){
		$(".assistWrap").fadeOut(100);
	});

	$(document).on("click", ".slide_assist", function(){
		$(".assistWrap").fadeIn(100);
	});

	$(document).on("click", ".globalSubmit", function(){
		window.localStorage['navigateScreen'] = "plugin";
		window.location.href = "/plugin";
	});

});
//Document Ready Function


//Innerpages Tasks Implementation
function loadUserTasks(){
	if(window.location.pathname != '/mindmap'){
		$("#mindmapCSS1, #mindmapCSS2").remove();
	} else if(window.location.pathname != "/neuronGraphs") {
		$("#nGraphsCSS").remove();
	}
	var tasksJson = JSON.parse(window.localStorage['_TJ']);
	$(".task-content-inner").empty().hide();
	var counter = 1;
	var lenght_tasksJson=tasksJson.length;
	for(i=0; i<lenght_tasksJson; i++) {
		var classIndex = i<100 ? "tasks-l-s": i<1000? "tasks-l-m" : "tasks-l-l";
		var lenght_taskDetails=tasksJson[i].taskDetails.length;
		for(j=0;j<lenght_taskDetails;j++){
			var testSuiteDetails = JSON.stringify(tasksJson[i].testSuiteDetails);
			var taskTypeIcon = "imgs/ic-taskType-yellow-plus.png";
			var tasktype = tasksJson[i].taskDetails[j].taskType;
			var taskname = tasksJson[i].taskDetails[j].taskName;
			if(tasktype == "Execution"){
				taskTypeIcon = "imgs/ic-taskType-blue-plus.png";
			}
			var dataobj = {
				'scenarioflag':tasksJson[i].scenarioFlag,
				'apptype':tasksJson[i].appType,
				'projectid':tasksJson[i].projectId,
				'screenid':tasksJson[i].screenId,
				'screenname':tasksJson[i].screenName,
				'testcaseid':tasksJson[i].testCaseId,
				'testcasename':tasksJson[i].testCaseName,
				'scenarioid':tasksJson[i].scenarioId,
				'taskname':taskname,
				'taskdes':tasksJson[i].taskDetails[j].taskDescription,
				'tasktype':tasksJson[i].taskDetails[j].taskType,
				'subtasktype':tasksJson[i].taskDetails[j].subTaskType,
				'subtaskid':tasksJson[i].taskDetails[j].subTaskId,
				'assignedtestscenarioids':tasksJson[i].assignedTestScenarioIds,
				'assignedto':tasksJson[i].taskDetails[j].assignedTo,
				'startdate':tasksJson[i].taskDetails[j].startDate,
				'exenddate':tasksJson[i].taskDetails[j].expectedEndDate,
				'status':tasksJson[i].taskDetails[j].status,
				'versionnumber':tasksJson[i].versionnumber,
				'batchTaskIDs':tasksJson[i].taskDetails[j].batchTaskIDs,
				'releaseid':tasksJson[i].taskDetails[j].releaseid,
				'cycleid':tasksJson[i].taskDetails[j].cycleid,
				'reuse':tasksJson[i].taskDetails[j].reuse
			}
			dataobj = JSON.stringify(dataobj)
			$('.task-content-inner').append("<div class='panel panel-default' panel-id='"+i+"'><div id='panelBlock_"+i+"' class='panel-heading'><div class='taskDirection' href='#collapse" + counter + "'><h4 class='taskNo-Inner-Pgs "+classIndex+" taskRedir'>" + counter + "</h4><span class='assignedTask-Inner-Pgs assignedTaskInner' data-testsuitedetails='"+testSuiteDetails+"' data-dataobj='"+dataobj+"' onclick='taskRedirectionInner(this.dataset.testsuitedetails,this.dataset.dataobj)'>" + taskname + "</span><!--Addition--><div class='panel-additional-details'><button class='panel-head-tasktype-Inner-Pgs'>" + tasktype + "</button></div><!--Addition--></div></div></div>").fadeIn();
			var limit = 45;
			var chars = $("#panelBlock_"+i+"").children().find('span.assignedTaskInner').text();
			if (chars.length > limit) {
			   var visiblePart = chars.substr(0, limit-1);
			   var dots = $("<span class='dots'>...</span>");
			   var hiddenPart = chars.substr(limit-1);
			   var assignedTaskText = visiblePart + hiddenPart;
			   $("#panelBlock_"+i+"").children().find('span.assignedTaskInner').text(visiblePart).attr('title',assignedTaskText).append(dots);
			}
			counter++;
		}
	}
	var taskJson = JSON.parse(window.localStorage['_TJ'])
	if (window.location.pathname != '/plugin'){
	$(".panel-additional-details").off("click");
	$(".panel-additional-details").click(function(e){
		var data_object = this.parentElement.children[1].getAttribute('data-dataobj');
		data_object=JSON.parse(data_object)
		var tdes = data_object['taskdes']
		var olddescriptionid = "null";
		if($(".description-container").length>0)
			olddescriptionid = $(".description-container")[0].getAttribute("description-id");
		$(".description-container").remove();
		$(".remove-bg").removeClass("remove-bg")
		$(".active-task").removeClass("active-task");
		var clickedtask = this.parentElement.parentElement.parentElement.getAttribute('panel-id');
		if(clickedtask == olddescriptionid){
			$(".description-container").remove();
			$(".remove-bg").removeClass("remove-bg")
			$(".active-task").removeClass("active-task");
			return;
		}
		var clktask = taskJson[clickedtask];
		var maintask = clktask
		var filterDat = JSON.parse(window.localStorage['_FD'])
		if(clktask.taskDetails[0].taskType != 'Design')
			clktask = clktask.testSuiteDetails[0];
		adddetailhtml = '<div class="panel panel-default description-container" description-id="'+clickedtask+'"><li class="description-item" title="Description: '+tdes+'">Description: '+tdes+'</li><li class="description-item" title="Release: '+filterDat.idnamemaprel[clktask.releaseid]+'">Release: '+filterDat.idnamemaprel[clktask.releaseid]+'</li><li class="description-item" title="Cycle: '+filterDat.idnamemapcyc[clktask.cycleid]+'">Cycle: '+filterDat.idnamemapcyc[clktask.cycleid]+'</li><li class="description-item" title="Apptype: '+maintask.appType+'">Apptype: '+maintask.appType+'</li></div>';
		$(adddetailhtml).insertAfter("[panel-id="+clickedtask+"]");
		$("[panel-id="+clickedtask+"]").addClass("active-task");
		$(".active-task").addClass("remove-bg")
	});
	}
}

function taskRedirectionInner(testsuitedetails,dataobj){
	var taskObj = {};
	var dataobj_json=JSON.parse(dataobj);
	if(dataobj_json.status=='assigned'){
		dataobj_json.status='inprogress';
	}
	taskObj.scenarioFlag = dataobj_json.scenarioflag;
	taskObj.assignedTestScenarioIds = dataobj_json.assignedtestscenarioids;
	taskObj.screenId = dataobj_json.screenid;
	taskObj.screenName = dataobj_json.screenname;
	taskObj.projectId = dataobj_json.projectid;
	taskObj.taskName = dataobj_json.taskname;
	taskObj.testCaseId = dataobj_json.testcaseid;
	taskObj.testCaseName = dataobj_json.testcasename;
	taskObj.scenarioId = dataobj_json.scenarioid;
	taskObj.status = dataobj_json.status;
	taskObj.appType = dataobj_json.apptype;
	taskObj.subTaskType = dataobj_json.subtasktype;
	taskObj.subTaskId=dataobj_json.subtaskid;
	taskObj.versionnumber=dataobj_json.versionnumber;
	taskObj.batchTaskIDs=dataobj_json.batchTaskIDs;
	taskObj.releaseid = dataobj_json.releaseid;
	taskObj.cycleid = dataobj_json.cycleid;
	taskObj.reuse=dataobj_json.reuse;
	taskObj.testSuiteDetails = JSON.parse(testsuitedetails);
	window.localStorage['_CT'] = JSON.stringify(taskObj);
	if(dataobj_json.subtasktype == "Scrape"){
		window.localStorage['navigateScreen'] = "Scrape";
		window.localStorage['navigateScrape'] = true;
		window.location.pathname = "/design";
	}
	else if(dataobj_json.subtasktype == "TestCase"){
		window.localStorage['navigateScreen'] = "TestCase";
		window.localStorage['navigateTestcase'] = true;
		window.location.pathname = "/designTestCase";
	}
	else if(dataobj_json.subtasktype == "TestSuite"){
		window.localStorage['navigateScreen'] = "TestSuite";
		window.location.pathname = "/execute";
	}
	else if(dataobj_json.subtasktype == "Scheduling"){
		window.localStorage['navigateScreen'] = "scheduling";
		window.location.pathname = "/scheduling";
	}
}
//Innerpages Tasks Implementation

//Function to Block UI & unBlockUI
function blockUI(content){
	$("body").append("<div id='overlayContainer'><div class='contentOverlay'>"+content+"</div></div>");
	$("#overlayContainer").fadeIn(300);
}

function unblockUI(){
	$("#overlayContainer").fadeOut(300).remove();
}
//Function to Block UI

function p_redirect(name){
	window.localStorage['navigateScreen'] = name;
	if(name == 'p_Reports'){
		localStorage.setItem('fromExecution','true');
		window.localStorage.setItem('redirectedReportObj',window.localStorage['_CT']);
	}
	window.location.assign(name);
}

function replaceHtmlEntites(selectedText) {
	var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
	var translate = {"nbsp": " ","amp" : "&","quot": "\"","lt"  : "<","gt"  : ">"};
	return ( selectedText.replace(translate_re, function(match, entity) {
		return translate[entity];
	}) );
}

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
});

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

var txnHistory = {
	/*
	Params: 
	1. action: the action related to the transaction
	2. labelArr: an array of label codes for the action
	3. infoArr:  an array of info related to the action
	4. url: the current url when action was performed
	*/

	log: function(action,labelArr,infoArr,url) {
		var timeStampInMs = window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
		var data = {};
		data.username = JSON.parse(window.localStorage['_UI']).username;
		data.timestamp = timeStampInMs;
		data.action = action;
		data.labels = labelArr;
		data.category = "UI";
		data.infoArr  = infoArr;
		data.elapsedTime = '';
		data.url = url;
		data.role = window.localStorage['_SR'];
		var idbSupported = false;
		var db;

		//Check Indexed DB Support
		if (window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB) {
			idbSupported = true;
		}

		//IFF Indexed DB is supported
		if (idbSupported) {
			var openRequest = indexedDB.open("transactionHistorydb", 1);	   //Indexed DB instantiated
			//Indexed DB on Upgrade
			openRequest.onupgradeneeded = function(e) {
				console.log("Upgrading idb...");
				db = e.target.result;
				if (!db.objectStoreNames.contains("transactionHistory")) {
					db.createObjectStore("transactionHistory", {
						keyPath: "transactionId",
						autoIncrement: true
					});
				}
			};
			//Indexed DB on Success DB connection
			openRequest.onsuccess = function(e) {
				db = e.target.result;
				saveTransactionHistory(); 										// Save Transaction History function being called
			};
			//Indexed DB on Error DB connection
			openRequest.onerror = function(e) {
				console.log("Error in opening idb");
			};
		}

		// Save a Transaction
		function saveTransactionHistory() {
			var transaction = db.transaction(["transactionHistory"], "readwrite");
			var objectStore = transaction.objectStore("transactionHistory");
			var request = objectStore.put(data); //Saves a transaction in the idb
			request.onsuccess = function(event) {
				if(labelArr.indexOf("100") > -1 || labelArr.indexOf("104") > -1){
					//commenting sending part as of now
					// console.log("sending from idb!");
					// var data = sendAllTransactions();
					}
			};

			request.onerror = function(e) {
				console.log("Error in saving txn");
			};
		}
		
		//Send All Transactions
		function sendAllTransactions(){
			var transaction = db.transaction(["transactionHistory"]); //Create Transaction
			var objectStore = transaction.objectStore("transactionHistory"); //Get ObjectStore

			//To get all objects from the db
			var request = objectStore.getAll();
			request.onerror = function (event) { // Handle errors!
				console.log("Error in fetching all txn data");
			};
			request.onsuccess = function (event) {
				var hostName = window.location.host;
				var host = hostName.split(':')[0];
				var apiurl = 'https://' + host + ':4242/addTransactions';
				data = {
					"transactionsData": request.result
				};
				$.ajax({
					type: 'POST',
					url: apiurl,
					data: JSON.stringify(data),
					contentType: 'application/json',
					success: function (data) {
						console.log(data);
						deleteAllData();
					},
					error: function (xhr, ajaxOptions, thrownError) {
						console.log("Error while sending txn data");
					}
				});
				return request.result;
			};
		}

		//Delete all the data from the object store and then delete the object store
		function deleteAllData(){
			var transaction = db.transaction(["transactionHistory"],"readwrite");		  //access the Transaction
			var objectStore = transaction.objectStore("transactionHistory");   //Get ObjectStore
			//Now, delete the object store
			//db.deleteObjectStore("transactionHistory");
			//Clear the object store
			var request = objectStore.clear();
			request.onerror = function(event) {								  // Handle errors!
				console.log("Error in delete txn data");
		   	};
			request.onsuccess = function(event) {	
				console.log("deleted from idb!");							 
	   		};
		}
	},

	codesDict : {
		"Login" : "100",
		"Nineteen68Logo" : "101",
		"BellIcon" : "102",
		"SwitchRole" : "103",
		"Logout" : "104",		
		"PluginNavigation" : "201",
		"FilterTaskBySearch" : "202",
		"FilterTaskByParams" : "203",
		"TaskNavigation" : "204",
		"CancelALMLogin" : "301",
		"SubmitALMLogin" : "302",
		"Generate" : "401",
		"ViewComplexity" : "402",
		"GenerateDataFlowDiagram" : "403",
		"OpenFileInEditor" : "404",
		"WMCCalculate" : "405",
		"ShowFlowGraphHome" : "406",
		"FilterProjectsForReports" : "1001",
		"SuiteNodeClick" : "1002",
		"SuiteDrillDownClick": "1003",
		"selectReportFormatClick": "1004",
		"PDFReportClick": "1005",
		"HTMLReportClick": "1006",
		"ExportToJSONClick": "1007",
		"JiraLoginConnection": "1008",
		"WebocularGoClick": "1101",
		"generateGraphClick": "1102",
		"showReportClick": "1103",
		"SelectEncryptionMethod": "1201",
		"Encryption": "1202",
		"ResetEncryptionData": "1203",
		"UserConfmanage" : "1301",
		"CreateProject" : "1302",
		"UpdateProject" : "1303",
		"AssignProjects" : "1304",
		"LdapConftest" : "1305",
		"LdapConfmanage" : "1306",
		"InitScraping" : "1401",
		"InitCompareAndUpdate" : "1402",
		"SaveScrapedObjects" : "1403",
		"DeleteScrapedObjects" : "1404",
		"TaskReassign" : "1405",
		"TaskApprove" : "1406",
		"TaskSubmit" : "1407",
		"SubmitCustomObject" : "1408",
		"SubmitMapObject" : "1409",
		"DebugTestCase" : "1501",
		"AddDependentTestCase" : "1502",
		"ImportTestCase" : "1503",
		"ExportTestCase" : "1504",
		"AddTestScriptRow" : "1505",
		"EditTestCaseRow":"1506",
		"RearrangeTestScriptRow" : "1507",
		"CopyTestStep" : "1508",
		"PasteTestStep" : "1509",
		"CommentStep" : "1510",
		"SaveTestcase" : "1511",
		"DeleteTestScriptRow" : "1512",
		"AddRemarksTestStep" : "1513",
		"SaveTestStepDetails" : "1514",
		"SaveTestSuite" : "1601",
		"SaveQcCredentialsExecution" : "1602",
		"ExecuteTestSuite" : "1603",
		"InitSchedule" : "1701"
	}
};
