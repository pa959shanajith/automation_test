var screenshotObj,scrapedGlobJson,enableScreenShotHighlight,mirrorObj,emptyTestStep,anotherScriptId,getAppTypeForPaste, eaCheckbox, finalViewString, scrapedData, deleteFlag, pasteSelecteStepNo,globalSelectedBrowserType,selectedKeywordList;
var initScraping = {}; var mirrorObj = {}; var scrapeTypeObj = {}; var newScrapedList; var viewString = {}; var scrapeObject = {}; var readTestCaseData; var getRowJsonCopy = [];
var selectRowStepNoFlag = false; //var deleteStep = false;
var getAllAppendedObj; //Getting all appended scraped objects
var gsElement = []; window.localStorage['selectRowStepNo'] = '';
mySPA.controller('designController', ['$scope', '$http', '$location', '$timeout', 'DesignServices','cfpLoadingBar','$window', function($scope,$http,$location,$timeout,DesignServices,cfpLoadingBar,$window) {
	$("body").css("background","#eee");
	$("#tableActionButtons, .designTableDnd").delay(500).animate({opacity:"1"}, 500)
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
	}, 500)

	//Task Listing
	loadUserTasks()
	
	//Loading Project Info
	var getProjInfo = JSON.parse(window.localStorage['_T'])
	$("#page-taskName").empty().append('<span>'+getProjInfo.taskName+'</span>')
	$(".projectInfoWrap").empty()
	$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">'+getProjInfo.projectName+'</span></p><p class="proj-info-wrap"><span class="content-label">Module :</span><span class="content">'+getProjInfo.moduleName+'</span></p><p class="proj-info-wrap"><span class="content-label">Screen :</span><span class="content">'+getProjInfo.screenName+'</span></p>')
	//Loading Project Info

	cfpLoadingBar.start()
	$timeout(function(){
		if(window.location.href.split("/")[3] == "designTestCase"){
			angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
		}
		else if(window.location.href.split("/")[3] == "design"){
			angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();			
		}
		cfpLoadingBar.complete()
	}, 1500)

	var custnameArr = [];
	var keywordValArr = [];
	var proceed = false;
	
	//Submit Task Screen
	$scope.submitTasksScreen = function(){
		$("#submitTasksScreen").modal("show")
	} 
	//Submit Task Screen
	
	//Submit Tast Test Case
	$scope.submitTasksTestCase = function(){
		$("#submitTasksTestCase").modal("show")
	} 
	//Submit task Test Case

	$scope.readTestCase_ICE = function()	{
		var taskInfo = JSON.parse(window.localStorage['_T']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		enabledEdit = "false"
			// service call # 1 - getTestScriptData service call
			DesignServices.readTestCase_ICE(screenId, testCaseId, testCaseName)	
			.then(function(data) {
				console.log(data);
				var appType = taskInfo.appType;
				$('#jqGrid').removeClass('visibility-hide').addClass('visibility-show');
				// removing the down arrow from grid header columns - disabling the grid menu pop-up
				$('.ui-grid-icon-angle-down').removeClass('ui-grid-icon-angle-down');
				$("#jqGrid").jqGrid('clearGridData');
				/*if(itemLabelName == "Runtime_Settings"){
				}else {
				}*/
				$('#jqGrid').show();
				// service call # 2 - objectType service call
				DesignServices.getScrapeDataScreenLevel_ICE(screenId)
				.then(function(data2)	{
					custnameArr.length = 0;
					// counter to append the items @ correct indexes of custnameArr
					var indexCounter = '';
					//window.localStorage['newTestScriptDataList'] = data2.view;
					//$scope.newTestScriptDataLS = recievedData[0].view;
					$("#window-scrape-screenshotTs .popupContent").empty()
					$("#window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrapeTS"><img id="screenshotTS" src="data:image/PNG;base64,'+data2.mirror+'" /></div>')
					
					// service call # 3 -objectType service call
					/*DesignServices.getObjectType()
					.then(function(data3)	{
						keywordValArr.length = 0;
						window.localStorage['keywordListData'] = angular.toJson(data3);
					},
					function(error) {	console.log("Error in designController.js file getObjectType method! \r\n "+(error.data));
					});*/ //	getObjectType end
					var data3 = { 	"a": ["click", "doubleClick", "drag", "drop", "getLinkText", "getToolTipText", "mouseHover", "press", "rightClick", "sendFunctionKeys", "setFocus", "tab", "uploadFile", "verifyDisabled", "verifyDoesNotExists", "verifyEnabled", "verifyExists", "verifyHidden", "verifyLinkText", "verifyToolTipText", "verifyVisible", "waitForElementVisible"], 	"img": ["click", "doubleClick", "drag", "drop", "getToolTipText", "mouseHover", "press", "rightClick", "sendFunctionKeys", "setFocus", "tab", "uploadFile", "verifyDisabled", "verifyDoesNotExists", "verifyEnabled", "verifyExists", "verifyHidden", "verifyToolTipText", "verifyVisible", "verifyWebImages", "waitForElementVisible"], 	"select": ["getCount", "getSelected", "getToolTipText", "getValueByIndex", "mouseHover", "selectValueByIndex", "selectValueByText", "sendFunctionKeys", "setFocus", "tab", "verifyAllValues", "verifyCount", "verifyDisabled", "verifyDoesNotExists", "verifyEnabled", "verifyExists", "verifyHidden", "verifySelectedValue", "verifyToolTipText", "verifyValuesExists", "verifyVisible", "waitForElementVisible"], 	"browserPopUp": ["acceptPopUp", "dismissPopUp", "getPopUpText", "verifyPopUpText"], 	"custom": ["clickElement", "doubleClick", "getElementText", "getStatus", "getText", "getToolTipText", "mouseHover", "rightClick", "selectCheckbox", "selectRadioButton", "selectValueByIndex", "sendFunctionKeys", "sendValue", "setFocus", "setSecureText", "setText", "tab", "unselectCheckbox", "verifyDoesNotExists", "verifyElementText", "verifyExists", "verifyHidden", "verifyToolTipText", "verifyVisible", "waitForElementVisible"], 	"list": ["deselectAll", "getCount", "getMultipleValuesByIndexes", "getSelected", "getToolTipText", "getValueByIndex", "mouseHover", "selectAllValues", "selectMultipleValuesByIndexes", "selectMultipleValuesByText", "selectValueByIndex", "selectValueByText", "sendFunctionKeys", "setFocus", "tab", "verifyAllValues", "verifyCount", "verifyDisabled", "verifyDoesNotExists", "verifyEnabled", "verifyExists", "verifyHidden", "verifySelectedValue", "verifyToolTipText", "verifyValuesExists", "verifyVisible", "waitForElementVisible"], 	"runtimeList": ["stepExecutionWait"], 	"defaultList": ["", "GetBlockValue", "VerifyValues", "captureScreenshot", "changeDateFormat", "clearFileContent", "compareContent", "concatenate", "copyValue", "createDynVariable", "dateAddition", "dateCompare", "dateDifference", "deleteDynVariable", "displayVariableValue", "else", "elseIf", "endFor", "endIf", "endLoop", "evaluate", "executeFile", "exportData", "find", "for", "getBlockCount", "getContent", "getCurrentDate", "getCurrentDateAndTime", "getCurrentTime", "getData", "getIndexCount", "getLineNumber", "getParam", "getStringLength", "getSubString", "getTagValue", "if", "jumpBy", "jumpTo", "left", "mid", "modifyValue", "pause", "replace", "replaceContent", "right", "runQuery", "secureExportData", "secureGetData", "secureRunQuery", "secureVerifyData", "sendFunctionKeys", "split", "startLoop", "stringGeneration", "toLowerCase", "toUpperCase", "trim", "typeCast", "verifyContent", "verifyData", "verifyFileImages", "wait", "writeToFile"], 	"button": ["click", "doubleClick", "drag", "drop", "getToolTipText", "mouseHover", "press", "sendFunctionKeys", "setFocus", "tab", "uploadFile", "verifyButtonName", "verifyDisabled", "verifyDoesNotExists", "verifyEnabled", "verifyExists", "verifyHidden", "verifyToolTipText", "verifyVisible", "waitForElementVisible"], 	"tablecell": ["click", "doubleClick", "mouseHover", "press", "sendFunctionKeys", "setFocus", "tab", "verifyDoesNotExists", "verifyExists", "waitForElementVisible"], 	"excelList": ["clearCell", "clearExcelPath", "deleteRow", "getColumnCount", "getRowCount", "readCell", "setExcelPath", "writeToCell"], 	"input": ["clearText", "click", "drag", "drop", "getText", "getTextboxLength", "getToolTipText", "mouseHover", "press", "rightClick", "sendFunctionKeys", "sendValue", "setFocus", "setSecureText", "setText", "tab", "verifyDisabled", "verifyDoesNotExists", "verifyEnabled", "verifyExists", "verifyHidden", "verifyReadOnly", "verifyText", "verifyTextboxLength", "verifyToolTipText", "verifyVisible", "waitForElementVisible"], 	"radiobutton": ["drag", "drop", "getStatus", "getToolTipText", "mouseHover", "selectRadioButton", "sendFunctionKeys", "setFocus", "tab", "verifyDisabled", "verifyDoesNotExists", "verifyEnabled", "verifyExists", "verifyHidden", "verifyReadOnly", "verifyToolTipText", "verifyVisible", "waitForElementVisible"], 	"browser": ["closeBrowser", "closeSubWindows", "getCurrentURL", "getPageTitle", "maximizeBrowser", "navigateToURL", "navigateWithAuthenticate", "openBrowser", "openNewBrowser", "refresh", "switchToWindow", "verifyCurrentURL", "verifyPageTitle", "verifyTextExists"], 	"checkbox": ["drag", "drop", "getStatus", "getToolTipText", "mouseHover", "selectCheckbox", "sendFunctionKeys", "setFocus", "tab", "unselectCheckbox", "verifyDisabled", "verifyDoesNotExists", "verifyEnabled", "verifyExists", "verifyHidden", "verifyReadOnly", "verifyToolTipText", "verifyVisible", "waitForElementVisible"], 	"syntax": { 		"a": "{\"click\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"doubleClick\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"drag\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"drop\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"getLinkText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getToolTipText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"mouseHover\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"press\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"rightClick\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"sendFunctionKeys\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FunctionKey;Number(optional)\"]}, \"setFocus\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"tab\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"uploadFile\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FilePath;FileName\"]}, \"verifyDisabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyDoesNotExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyEnabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyHidden\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyLinkText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyToolTipText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"waitForElementVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}}", 		"img": "{\"click\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"doubleClick\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"drag\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"drop\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"getToolTipText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"mouseHover\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"press\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"rightClick\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"sendFunctionKeys\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FunctionKey;Number(optional)\"]}, \"setFocus\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"tab\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"uploadFile\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FilePath;FileName\"]}, \"verifyDisabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyDoesNotExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyEnabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyHidden\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyToolTipText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyWebImages\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Image Path\"]}, \"waitForElementVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}}", 		"select": "{\"getCount\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getSelected\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getToolTipText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getValueByIndex\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Index value\"]}, \"mouseHover\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"selectValueByIndex\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Index Value\"]}, \"selectValueByText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"sendFunctionKeys\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FunctionKey;Number(optional)\"]}, \"setFocus\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"tab\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyAllValues\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"val1;val2;val3,...etc\"]}, \"verifyCount\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyDisabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyDoesNotExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyEnabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyHidden\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifySelectedValue\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyToolTipText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyValuesExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"val1;val2;val3,...etc\"]}, \"verifyVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"waitForElementVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}}", 		"browserPopUp": "{\"acceptPopUp\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"dismissPopUp\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"getPopUpText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"verifyPopUpText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}}", 		"custom": "{\"clickElement\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"doubleClick\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"getElementText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"getObjectCount\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"ObjectType\"]}, \"getStatus\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"getText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"getToolTipText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"mouseHover\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"rightClick\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"selectCheckbox\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"selectRadioButton\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"selectValueByIndex\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index;selectIndex\"]}, \"sendFunctionKeys\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(Optional);Index;FunctionKey;Number(Optional)\"]}, \"sendValue\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index;Value\"]}, \"setFocus\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"setSecureText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index;Encrypted Value\"]}, \"setText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index;Value\"]}, \"tab\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"unselectCheckbox\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"verifyDoesNotExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"verifyElementText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index;Value\"]}, \"verifyExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"verifyHidden\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"verifyToolTipText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index;Value\"]}, \"verifyVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index\"]}, \"waitForElementVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ObjectType;VisibleText(optional);Index;Time in Seconds\"]}}", 		"list": "{\"deselectAll\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"getCount\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getMultipleValuesByIndexes\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Multiple Indexes\"]}, \"getSelected\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getToolTipText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getValueByIndex\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Index value\"]}, \"mouseHover\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"selectAllValues\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"selectMultipleValuesByIndexes\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Multiple Indexes\"]}, \"selectMultipleValuesByText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Multiple Text\"]}, \"selectValueByIndex\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Index Value\"]}, \"selectValueByText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"sendFunctionKeys\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FunctionKey;Number(optional)\"]}, \"setFocus\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"tab\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyAllValues\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"val1;val2;val3,...etc\"]}, \"verifyCount\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyDisabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyDoesNotExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyEnabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyHidden\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifySelectedValue\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"val1;val2;val3,...etc\"]}, \"verifyToolTipText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyValuesExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"val1;val2;val3,...etc\"]}, \"verifyVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"waitForElementVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}}", 		"runtimeList": "{\"stepExecutionWait\":{\"outputVal\":\"N/A\",\"inputVal\":[\"N/A\"]}}", 		"defaultList": "{\"\":{\"outputVal\":\"\",\"inputVal\":[\"\"]},\"GetBlockValue\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"XML tagName;No.of blocks to be fetched;BlockName\"]},\"VerifyValues\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"value1;value2\"]},\"captureScreenshot\":{\"outputVal\":\"N/A\",\"inputVal\":[\"(Optional)\"]},\"changeDateFormat\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Date;Current Format;Required Format\"]},\"clearFileContent\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FilePath;FileName;SheetName\"]},\"compareContent\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FilePath1;SheetName1;FilePath2;SheetName2\"]},\"concatenate\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Input Text1;Input Text2\"]},\"copyValue\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Target Variable;Source Variable\"]}, \"createDynVariable\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Variable Name;Value\"]}, \"dateAddition\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Date;Number of days;CurrentDate format\"]}, \"dateCompare\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"DateVariable==Date\"]}, \"dateDifference\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Date;No.of days/date;CurrentDate Format\"]}, \"deleteDynVariable\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"variable\"]}, \"displayVariableValue\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"variable\"]}, \"else\":{\"outputVal\":\"N/A\",\"inputVal\":[\"N/A\"]}, \"elseIf\":{\"outputVal\":\"N/A\",\"inputVal\":[\"(Operand1;Operator;Operand2)\"]}, \"endFor\":{\"outputVal\":\"N/A\",\"inputVal\":[\"N/A\"]}, \"endIf\":{\"outputVal\":\"N/A\",\"inputVal\":[\"N/A\"]}, \"endLoop\":{\"outputVal\":\"N/A\",\"inputVal\":[\"N/A\"]}, \"evaluate\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"operand1 operator operand2\"]}, \"executeFile\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FilePath\"]}, \"exportData\":{\"outputVal\":\"FilePath\",\"inputVal\":[\"DB IP/instance name;DB port;DB username;DB password;DB name;Query;DB Number\"]}, \"find\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"actual string;string to find\"]}, \"for\":{\"outputVal\":\"N/A\",\"inputVal\":[\"number\"]}, \"getBlockCount\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"XML block/XML tags;block name\"]}, \"getContent\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"FilePath;SheetName/PageNumber\"]}, \"getCurrentDate\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Date Format\"]}, \"getCurrentDateAndTime\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Date and Time Format\"]}, \"getCurrentTime\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Time Format\"]}, \"getData\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"DB IP/instance name;DB port;DB username;DB password;DB name;Query;DB Number\"]}, \"getIndexCount\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"variable containing list of value\"]}, \"getLineNumber\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Filepath;Content\"]}, \"getParam\":{\"outputVal\":\"N/A\",\"inputVal\":[\"Filepath;sheetname\"]}, \"getStringLength\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"string\"]}, \"getSubString\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"String;Index OR Range\"]}, \"getTagValue\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"XML block/XML tags;Number;BlockName;TagName\"]}, \"if\":{\"outputVal\":\"N/A\",\"inputVal\":[\"(operand1;operator;operand2)\"]}, \"jumpBy\":{\"outputVal\":\"N/A\",\"inputVal\":[\"Count of steps +ve or -ve\"]}, \"jumpTo\":{\"outputVal\":\"N/A\",\"inputVal\":[\"TestScript Name\"]}, \"left\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"string;number of characters to be fetched from left\"]}, \"mid\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"string\"]}, \"modifyValue\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Existing Value;New Value\"]}, \"pause\":{\"outputVal\":\"N/A\",\"inputVal\":[\"N/A\"]}, \"replace\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"ActualString;String to be replaced;String to replace\"]}, \"replaceContent\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FilePath;SheetNumber;content to replace;content\"]}, \"right\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"string;number of characters to be fetched from right\"]}, \"runQuery\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"DB IP/instance name;DB port;DB username;DB password;DB name;Query;DB Number\"]}, \"secureExportData\":{\"outputVal\":\"FilePath\",\"inputVal\":[\"DB IP/instance name;DB port;DB username;DB encrypted password;DB name;Query;DB Number\"]}, \"secureGetData\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"DB IP/instance name;DB port;DB username;DB encrypted password;DB name;Query;DB Number\"]}, \"secureRunQuery\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"DB IP/instance name;DB port;DB username;DB encrypted password;DB name;Query;DB Number\"]}, \"secureVerifyData\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"DB IP/instance name;DB port;DB username;DB encrypted password;DB name;Query;DB Number\"]}, \"sendFunctionKeys\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FunctionKey;Number(optional)\"]}, \"split\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"String;Split Character\"]}, \"startLoop\":{\"outputVal\":\"N/A\",\"inputVal\":[\"N/A\"]}, \"stringGeneration\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Type;Length\"]}, \"toLowerCase\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Input String\"]}, \"toUpperCase\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Input String\"]}, \"trim\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Input String\"]}, \"typeCast\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Value;Type to be converted\"]}, \"verifyContent\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FileName;SheetName;Content to verify\"]}, \"verifyData\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"DB IP/instance name;DB port;DB username;DB password;DB name;Query;DB Number;file path to be verified;Sheet name\"]}, \"verifyFileImages\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ImagePath1;ImagePath2\"]}, \"wait\":{\"outputVal\":\"N/A\",\"inputVal\":[\"Time in seconds\"]}, \"writeToFile\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FilePath;SheetName;ContentToBeWritten;Newline\"]} }", 		"button": "{\"click\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"doubleClick\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"drag\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"drop\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"getToolTipText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"mouseHover\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"press\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"sendFunctionKeys\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FunctionKey;Number(optional)\"]}, \"setFocus\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"tab\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"uploadFile\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FilePath;FileName\"]}, \"verifyButtonName\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"ButtonName\"]}, \"verifyDisabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyDoesNotExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyEnabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyHidden\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyToolTipText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"waitForElementVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}}", 		"tablecell": "{\"click\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"doubleClick\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"mouseHover\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"press\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"sendFunctionKeys\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FunctionKey;Number(optional)\"]}, \"setFocus\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"tab\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyDoesNotExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"waitForElementVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}}", 		"excelList": "{\"clearCell\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Row;Column\"]},\"clearExcelPath\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]},\"deleteRow\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"RowNumber\"]},\"getColumnCount\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]},\"getRowCount\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]},\"readCell\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Row;Column\"]},\"setExcelPath\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FilePath;SheetName\"]},\"writeToCell\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Row;Column;Value;Type\"]}}", 		"input": "{\"clearText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"click\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"drag\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"drop\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"getText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getTextboxLength\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getToolTipText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"mouseHover\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"press\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"rightClick\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"sendFunctionKeys\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FunctionKey;Number(optional)\"]}, \"sendValue\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"setFocus\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"setSecureText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Encrypted Input\"]}, \"setText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"tab\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyDisabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyDoesNotExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyEnabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyHidden\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyReadOnly\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyTextboxLength\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyToolTipText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"waitForElementVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}}", 		"radiobutton": "{\"drag\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"drop\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"getStatus\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getToolTipText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"mouseHover\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"selectRadioButton\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"sendFunctionKeys\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FunctionKey;Number(optional)\"]}, \"setFocus\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"tab\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyDisabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyDoesNotExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyEnabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyHidden\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyReadOnly\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyToolTipText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"waitForElementVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}}", 		"browser": "{\"closeBrowser\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]},\"closeSubWindows\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]},\"getCurrentURL\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]},\"getPageTitle\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]},\"maximizeBrowser\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]},\"navigateToURL\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"URL\"]},\"navigateWithAuthenticate\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"URL;UserName;EncryptedPassword\"]},\"openBrowser\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]},\"openNewBrowser\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]},\"refresh\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]},\"switchToWindow\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Number\"]},\"verifyCurrentURL\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]},\"verifyPageTitle\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]},\"verifyTextExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}}", 		"checkbox": "{\"drag\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"drop\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"getStatus\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getToolTipText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"mouseHover\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"selectCheckbox\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"sendFunctionKeys\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FunctionKey;Number(optional)\"]}, \"setFocus\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"tab\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"unselectCheckbox\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyDisabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyDoesNotExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyEnabled\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyHidden\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyReadOnly\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyToolTipText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"waitForElementVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}}", 		"table": "{\"cellClick\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Row;Column;ObjectType;Index\"]}, \"getCellToolTip\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Row;Column\"]}, \"getCellValue\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Row;Column\"]}, \"getColNumByText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Input Value\"]}, \"getColumnCount\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getRowCount\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getRowNumByText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"Input Value\"]}, \"mouseHover\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyCellValue\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Row;Column;Input Value\"]}, \"verifyExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyTextExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}}", 		"element": "{\"clickElement\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"doubleClick\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"drag\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"drop\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"getElementText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"getToolTipText\":{\"outputVal\":\"{Variable}\",\"inputVal\":[\"N/A\"]}, \"mouseHover\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"rightClick\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"sendFunctionKeys\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FunctionKey;Number(optional)\"]}, \"setFocus\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"tab\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"uploadFile\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"FilePath;FileName\"]}, \"verifyDoesNotExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyElementText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyExists\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyHidden\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"verifyToolTipText\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"Input Value\"]}, \"verifyVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}, \"waitForElementVisible\":{\"outputVal\":\"(Optional)\",\"inputVal\":[\"N/A\"]}}" 	}, 	"table": ["cellClick", "getCellDetails", "getCellValue", "getColNumByText", "getColumnCount", "getRowCount", "getRowNumByText", "getSelected", "getStatus", "mouseClick", "selectValueByIndex", "selectValueByText", "setFocus", "verifyCellValue", "verifyExists"], 	"element": ["clickElement", "doubleClick", "drag", "drop", "getElementText", "getToolTipText", "mouseHover", "rightClick", "sendFunctionKeys", "setFocus", "tab", "uploadFile", "verifyDoesNotExists", "verifyElementText", "verifyExists", "verifyHidden", "verifyToolTipText", "verifyVisible", "waitForElementVisible"] };
					keywordValArr.length = 0;
					window.localStorage['keywordListData'] = angular.toJson(data3);

					// 'readTestScript' service response null or empty or blank (If service#1 response is null then)
					var emptyStr = "{}";
					var len = data.testcase.length;
					if (data == "" || data == null || data == emptyStr || data == "[]" || data.testcase.toString() == "" || data.testcase == "[]"|| len == 1)	{
						var appTypeLocal1 = "Generic";
						var datalist = [{  
							"stepNo":"1",
							"custname":"",
							"objectName":"",
							"keywordVal":"",
							"inputVal":"",
							"outputVal":"",
							"url":"",
							"_id_":"",
							"appType":appTypeLocal1
						}];
						readTestCaseData = JSON.stringify(datalist);
						$("#jqGrid").jqGrid('GridUnload');
						$("#jqGrid").trigger("reloadGrid");
						contentTable(data2.view);
						/*if(itemLabelName == "Runtime_Settings" || window.localStorage['RunFlag'] == "true" || usrRole.role == "Viewer"){
							$('.cbox').prop('disabled',true);
							$('.cbox').addClass('disabled');
							$('.cbox').closest('tr').addClass('state-disabled ui-jqgrid-disablePointerEvents');
							$('.cbox').parent().addClass('disable_a_href');
							if(usrRole.role == "Viewer"){
								$('#triggerDialog').prop('disabled',true);
							}else $('#triggerDialog').prop('disabled',false);
						}else{
							$('.cbox').prop('disabled',false);
							$('.cbox').parent().removeClass('disable_a_href');			
						}*/
						$('.cbox').prop('disabled',false);
						$('.cbox').parent().removeClass('disable_a_href');
						return;
					}
					else{
						var testcase = JSON.parse(data.testcase);
						var testcaseArray = [];
						for(var i = 0; i < testcase.length; i++)	{
							testcaseArray.push(testcase[i]);						
						}				
						readTestCaseData = JSON.stringify(testcaseArray)
						$("#jqGrid_addNewTestScript").jqGrid('clearGridData');
						$("#jqGrid").jqGrid('GridUnload');
						$("#jqGrid").trigger("reloadGrid");
						contentTable(data2.view);
						/*if(itemLabelName == "Runtime_Settings" || window.localStorage['RunFlag'] == "true" || usrRole.role == "Viewer"){
							$('.cbox').prop('disabled',true);
							$('.cbox').addClass('disabled');
							$('.cbox').closest('tr').addClass('state-disabled ui-jqgrid-disablePointerEvents');
							$('.cbox').parent().addClass('disable_a_href');
							if(usrRole.role == "Viewer"){
								$('#triggerDialog').prop('disabled',true);
							}else $('#triggerDialog').prop('disabled',false);
						}else{
							$('.cbox').prop('disabled',false);
							$('.cbox').addClass('disabled');
							$('.cbox').parent().removeClass('disable_a_href');
						}*/
						$('.cbox').prop('disabled',false);
						//$('.cbox').addClass('disabled');
						$('.cbox').parent().removeClass('disable_a_href');
						/*if(selectRowStepNoFlag == true){
							if($("#jqGrid").find("tr[id='"+window.localStorage['selectRowStepNo']+"']").prev('tr[class="ui-widget-content"]').length > 0){
								$("#jqGrid").find("tr[id='"+window.localStorage['selectRowStepNo']+"']").trigger('click');
								$("#jqGrid").find("tr[id='"+window.localStorage['selectRowStepNo']+"']").prev().focus();
							}else{
								$("#jqGrid").find("tr[id='"+window.localStorage['selectRowStepNo']+"']").focus().trigger('click');
							}					
							selectRowStepNoFlag = false;
						}*/
						return;
					}
				},
				function(error) {	console.log("Error in designController.js file getObjectType method! \r\n "+(error.data));
				}); //	getScrapeData end
			},
			function(error) {	console.log("Error in designController.js file getTestScriptData method! \r\n "+(error.data));	
			});
	};//	getTestScriptData end

	// browser icon clicked
	$scope.debugTestCase_ICE = function (selectedBrowserType) {
		var taskInfo = JSON.parse(window.localStorage['_T']);
		var testcaseID = [];
		testcaseID.push(taskInfo.testCaseId);
		var browserType = [];
		browserType.push(selectedBrowserType)
		globalSelectedBrowserType = selectedBrowserType;
		if(jQuery("#addDependent").is(":checked"))	triggerPopUp();

		else	{
			var blockMsg = 'Debug in Progress. Please Wait...';
			blockUI(blockMsg);    
			DesignServices.debugTestCase_ICE(browserType,testcaseID)
			.then(function(data)	{
				console.log("debug-----",data);
				if (data == "unavailableLocalServer")	{
					unblockUI();
	                $("#globalModal").find('.modal-title').text("Server not found");
	                $("#globalModal").find('.modal-body p').text("Local Server is not available. Please run the batch file from the Bundle.").css('color','black');
					$("#globalModal").modal("show");
				}
				else if(data == "success"){
					unblockUI();
	                $("#globalModal").find('.modal-title').text("Success");
	                $("#globalModal").find('.modal-body p').text("Debug completed.").css('color','black');
					$("#globalModal").modal("show");
				}
				else if(data == "fail"){
					unblockUI();
	                $("#globalModal").find('.modal-title').text("Fail");
	                $("#globalModal").find('.modal-body p').text("Failed to debug").css('color','black');
					$("#globalModal").modal("show");
				}
				else if(data == "terminate"){
					unblockUI();
	                $("#globalModal").find('.modal-title').text("Terminate");
	                $("#globalModal").find('.modal-body p').text("Debug Terminated").css('color','black');
					$("#globalModal").modal("show");
				}
				else if(data == "browserUnavailable"){
					unblockUI();
	                $("#globalModal").find('.modal-title').text("Error");
	                $("#globalModal").find('.modal-body p').text("Browser is not available").css('color','black');
					$("#globalModal").modal("show");
				}
			},
			function(error) {console.log("Error while traversing while executing debugTestcase method!! \r\n "+(error.data));});			
		}
	};	// browser invocation ends
	
	//Add Dependence
	/*$scope.multipleDebugOnBrowser1 = function (selectedBrowserType) {
		selectedBrowserType = window.localStorage['selectedBrowserType'];
		tsNewId.push(window.localStorage['testScriptIdVal']);
		window.localStorage['tsNewId'] = '{"'+tsNewId+'"}';
		if(jQuery("#triggerDialog").is(":checked")){
			triggerPopUp();
			window.localStorage['selectedBrowserType'] = selectedBrowserType;
		}
		$.blockUI({ message: '<h1><img src="imgs/busy.gif" />Debug in Progress<a id="btnTerminate">Terminate?<img src="imgs/terminate.png"/></a></h1>' }); 
		DesignServices.multiDebugOnBrowser(selectedBrowserType)
		.then(function(data) 	{
			if (data == "unavailableLocalServer"){
				showDialogMesgs("Server not found", "Local Server is not available. Please run the batch file from the Bundle.");
				$.unblockUI();
			} 
			else if(data.indexOf("<!") == 0  ){
				location.href = 'login_post.html';
			}
			else{
				$('#divTestScript').dialog("close");
				var executionId =  data;
				(function poll() {
					setTimeout(function(){
						DesignServices.pollExecutionStatus(executionId)
						.then(function(data) 	{
							$("#debugSuccessDialog").hide();
							$("#executionFailDialog").hide();
							$("#terminateDialog").hide();
							$("#browserUnavailableDialog").hide();
							$("#serverNotFoundDialog").hide();
							console.log("data is here:::"+data);			       			
							if (data == "complete"){
								$.unblockUI();
								showDialogMesgsBtn("Success", "Debug completed.", "btnDebugOk");
							}
							else  if (data == "fail"){
								$.unblockUI();
								showDialogMesgs("Fail", "<img src='imgs/Warning.png' style='width: 24px; height: 24px;'>Something has gone wrong. Please contact the support team!");
							}
							else if (data == "terminate"){
								$.unblockUI();
								showDialogMesgsBtn("Debug Terminated", "<img src='imgs/Warning.png' style='width: 24px; height: 24px;'>Debug terminated successfully.", "btnTerminateOk");
							}
							else if (data == "browserUnavailable"){
								$.unblockUI();
								showDialogMesgs("Error", "<img src='imgs/Warning.png' style='width: 24px; height: 24px;'>Browser is not available");
							}
							else if (data == "unavailableLocalServer"){
								$.unblockUI();
								showDialogMesgs("Server not found", "Local Server is not available. Please run the batch file from the Bundle.");
							}
							else if (data == "progress"){
								{
									poll();
								}
							}
						})
					}, 5000);})();
			}
			tsNewId = [];
			window.localStorage['tsNewId'].clear();
		},
		function(error){
		});
	};*/
	
	//Import Test case
	$scope.importTestCase=function(){
		var counter1 = 0;
		var userInfo = JSON.parse(window.localStorage['_UI']);
		var taskInfo = JSON.parse(window.localStorage['_T']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		var appType = taskInfo.appType;
		var flag = false;
		var defaultTestScript='[{"stepNo":"1","custname":"","objectName":"","keywordVal":"","inputVal":"","outputVal":"","url":"","_id_":"","appType":"Generic"}]';
		if(readTestCaseData == defaultTestScript){
			$("#importTestCaseFile").attr("type","file");
			$("#importTestCaseFile").trigger("click");
			importTestCaseFile.addEventListener('change', function(e) {
				if(counter1 == 0){
					// Put the rest of the demo code here.
					var file = importTestCaseFile.files[0];
					var textType = /json.*/;
					var reader = new FileReader();
					reader.onload = function(e) {
						if((file.name.split('.')[file.name.split('.').length-1]).toLowerCase() == "json"){
							var resultString = JSON.parse(reader.result);
							//var resultString = reader.result;
							for(i = 0; i < resultString.length; i++){
								if(resultString[i].appType == appType || resultString[i].appType.toLowerCase() == "generic"){
									flag = true;
									break;
								}else{
									flag = false;
									break;
								}
							}
							if (flag == false){
								$("#globalModal").find('.modal-title').text("App Type Error");
				                $("#globalModal").find('.modal-body p').text("Project application type and Imported JSON application type doesn't match, please check!!").css('color','black');
								$("#globalModal").modal("show");
							}
							else{
								DesignServices.updateTestCase_ICE(screenId,testCaseId,testCaseName,resultString,userInfo)
								.then(function(data) {
									if (data == "success") {
										angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
						                $("#globalModal").find('.modal-title').text("Import Of JSON file");
						                $("#globalModal").find('.modal-body p').text("TestCase Json imported successfully.").css('color','black');
										$("#globalModal").modal("show");
									} else {
										$("#globalModal").find('.modal-title').text("Fail");
						                $("#globalModal").find('.modal-body p').text("Please Check the file format you have uploaded!").css('color','black');
										$("#globalModal").modal("show");
									}
								}, function(error) {
								});
							}
						}
						else{
							$("#globalModal").find('.modal-title').text("Fail");
			                $("#globalModal").find('.modal-body p').text("Please Check the file format you have uploaded!").css('color','black');
							$("#globalModal").modal("show");
						}
					}
					reader.readAsText(file);
					counter1 = 1;
					$("#importTestCaseFile").val('');
				}
			});
		} else{
			$("#fileInputJson").removeAttr("type","file");
			$("#fileInputJson").attr("type","text");			
			$("#globalModalYesNo").find('.modal-title').text("Table Consists of Data");
			$("#globalModalYesNo").find('.modal-body p').text("Import will erase your old data. Do you want to continue??").css('color','black');
			$("#globalModalYesNo").find('.modal-footer button:nth-child(1)').attr("id","btnImportEmptyErrorYes")
			$("#globalModalYesNo").modal("show");
		}
	}
	
	$(document).on('click', '#btnImportEmptyErrorYes', function(){
		$("#globalModalYesNo").modal("hide");
		var counter2 = 0;
		var userInfo = JSON.parse(window.localStorage['_UI']);
		var taskInfo = JSON.parse(window.localStorage['_T']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		var appType = taskInfo.appType;
		var flag = false;
		$("#overWriteJson").trigger("click");
		overWriteJson.addEventListener('change', function(e) {
			if(counter2 == 0){
				// Put the rest of the demo code here.
				var file = overWriteJson.files[0];
				var textType = /json.*/;
				var reader = new FileReader();
				reader.onload = function(e) {
					if((file.name.split('.')[file.name.split('.').length-1]).toLowerCase() == "json"){
						var resultString = JSON.parse(reader.result);
						for(i = 0; i < resultString.length; i++){
							if(resultString[i].appType == appType || resultString[i].appType.toLowerCase() == "generic"){
								flag = true;
								break;
							}else{
								flag = false;
								break;
							}
						}
						if(flag == false){
							$("#globalModal").find('.modal-title').text("App Type Error");
			                $("#globalModal").find('.modal-body p').text("Project application type and Imported JSON application type doesn't match, please check!!").css('color','black');
							$("#globalModal").modal("show");
						}
						else{
							DesignServices.updateTestCase_ICE(screenId,testCaseId,testCaseName,resultString,userInfo)
							.then(function(data) {
										if (data == "success") {
											angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
							                $("#globalModal").find('.modal-title').text("Import Of JSON file");
							                $("#globalModal").find('.modal-body p').text("TestCase Json imported successfully.").css('color','black');
											$("#globalModal").modal("show");
										} else {
											$("#globalModal").find('.modal-title').text("Fail");
							                $("#globalModal").find('.modal-body p').text("Please Check the file format you have uploaded!").css('color','black');
											$("#globalModal").modal("show");
										} /*else if (data == "appTypeError"){
											showDialogMesgsBtn("App Type Error", "Project application type and Imported JSON application type doesn't match, please check!!", "btnAppTypeErrorOk");
											$.unblockUI();
										}	*/											
									}, function(error) {
							});
						}
					}
					else{
						$("#globalModal").find('.modal-title').text("Fail");
		                $("#globalModal").find('.modal-body p').text("Please Check the file format you have uploaded!").css('color','black');
						$("#globalModal").modal("show");
					}					
				}
				reader.readAsText(file);
				counter2 = 1;
				$("#overWriteJson").val('');
			}
		});
	})
	
	$("#overWriteJson").on("click", function(){
		angular.element(document.getElementById("left-bottom-section")).scope().importTestCase1();
	})
	//Import Testcase1
	$scope.importTestCase1=function(){
		var counter = 0;
		var userInfo = JSON.parse(window.localStorage['_UI']);
		var taskInfo = JSON.parse(window.localStorage['_T']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		var appType = taskInfo.appType;
		var flag = false;
		overWriteJson.addEventListener('change', function(e) {
			if(counter == 0){
				// Put the rest of the demo code here.
				var file = overWriteJson.files[0];
				var textType = /json.*/;
				var reader = new FileReader();
				if((file.name.split('.')[file.name.split('.').length-1]).toLowerCase() == "json"){
					reader.onload = function(e) {
						var resultString = JSON.parse(reader.result);
						for(i = 0; i < resultString.length; i++){
							if(resultString[i].appType == appType || resultString[i].appType.toLowerCase() == "generic"){
								flag = true;
								break;
							}else{
								flag = false;
								break;
							}
						}
						if(flag == false){
							$("#globalModal").find('.modal-title').text("App Type Error");
			                $("#globalModal").find('.modal-body p').text("Project application type and Imported JSON application type doesn't match, please check!!").css('color','black');
							$("#globalModal").modal("show");
						}
						else{
							DesignServices.updateTestCase_ICE(screenId,testCaseId,testCaseName,resultString,userInfo)
							.then(function(data) {
								if (data == "success") {
									angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
									$("#globalModal").find('.modal-title').text("Import Of JSON file");
					                $("#globalModal").find('.modal-body p').text("TestCase Json imported successfully.").css('color','black');
									$("#globalModal").modal("show");
								} else {
									$("#globalModal").find('.modal-title').text("Fail");
					                $("#globalModal").find('.modal-body p').text("Please Check the file format you have uploaded!").css('color','black');
									$("#globalModal").modal("show");
								} /*else if (data == "appTypeError"){
									showDialogMesgsBtn("App Type Error", "Project application type and Imported JSON application type doesn't match, please check!!", "btnAppTypeErrorOk");
									$.unblockUI();
								}*/												
							}, function(error) {});
						}						
					}	
					reader.readAsText(file);
					$("#overWriteJson").val('');
				}
				else{
					$("#globalModal").find('.modal-title').text("Fail");
	                $("#globalModal").find('.modal-body p').text("Please Check the file format you have uploaded!").css('color','black');
					$("#globalModal").modal("show");
				}
				counter = 1;
			}				
		});
	}
	//Import Test case
	
	//Export Test case
	$scope.exportTestCase=function() {
		var taskInfo = JSON.parse(window.localStorage['_T']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		DesignServices.readTestCase_ICE(screenId, testCaseId, testCaseName)
		.then(function(response) {	
			var temp, responseData;
			if (typeof response === 'object') {
				temp=JSON.parse(response.testcase);
				responseData = JSON.stringify(temp, undefined, 2);
			}
			filename = testCaseName+".json";
			var objAgent = $window.navigator.userAgent;
			var objbrowserName = navigator.appName;
			var objfullVersion = ''+parseFloat(navigator.appVersion);
			var objBrMajorVersion = parseInt(navigator.appVersion,10);
			var objOffsetName,objOffsetVersion,ix;
			// In Chrome 
			if ((objOffsetVersion=objAgent.indexOf("Chrome"))!=-1) { 
				objbrowserName = "Chrome";
				objfullVersion = objAgent.substring(objOffsetVersion+7);
			}
			// In Microsoft internet explorer
			else if ((objOffsetVersion=objAgent.indexOf("MSIE"))!=-1) { 
				objbrowserName = "Microsoft Internet Explorer"; 
				objfullVersion = objAgent.substring(objOffsetVersion+5);
			}
			// In Firefox 
			else if ((objOffsetVersion=objAgent.indexOf("Firefox"))!=-1) { 
				objbrowserName = "Firefox";

			} 
			// In Safari 
			else if ((objOffsetVersion=objAgent.indexOf("Safari"))!=-1) { 
				objbrowserName = "Safari"; 
				objfullVersion = objAgent.substring(objOffsetVersion+7); 
				if ((objOffsetVersion=objAgent.indexOf("Version"))!=-1)
					objfullVersion = objAgent.substring(objOffsetVersion+8);
			}
			// For other browser "name/version" is at the end of userAgent 
			else if ( (objOffsetName=objAgent.lastIndexOf(' ')+1) < (objOffsetVersion=objAgent.lastIndexOf('/')) ) {
				objbrowserName = objAgent.substring(objOffsetName,objOffsetVersion); 
				objfullVersion = objAgent.substring(objOffsetVersion+1); 
				if (objbrowserName.toLowerCase()==objbrowserName.toUpperCase()) { 
					objbrowserName = navigator.appName; 
				} 
			} 
			// trimming the fullVersion string at semicolon/space if present 
			if ((ix=objfullVersion.indexOf(";"))!=-1) objfullVersion=objfullVersion.substring(0,ix);
			if ((ix=objfullVersion.indexOf(" "))!=-1) objfullVersion=objfullVersion.substring(0,ix); 
			objBrMajorVersion = parseInt(''+objfullVersion,10);
			if (isNaN(objBrMajorVersion)) { 
				objfullVersion = ''+parseFloat(navigator.appVersion); 
				objBrMajorVersion = parseInt(navigator.appVersion,10); 
			}	
			if(objBrMajorVersion== "9"){
				if(objbrowserName == "Microsoft Internet Explorer"){
					window.navigator.msSaveOrOpenBlob(new Blob([responseData], {type:"text/json;charset=utf-8"}), filename);
				}
			}else{	
				var blob = new Blob([responseData], {type: 'text/json'}),
				e = document.createEvent('MouseEvents'),
				a = document.createElement('a');
				a.download = filename;
				if(objbrowserName == "Microsoft Internet Explorer" || objbrowserName == "Netscape"){
					window.navigator.msSaveOrOpenBlob(new Blob([responseData], {type:"text/json;charset=utf-8"}), filename);
				}else{
					a.href = window.URL.createObjectURL(blob);
					a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
					e.initMouseEvent('click', true, true, window,
							0, 0, 0, 0, 0, false, false, false, false, 0, null);
					a.dispatchEvent(e);
				}
			}
		},
		function(error) {
		});
	}
	//Export Test Case
	
	//Populating Saved Scrape Data
	$scope.getScrapeData = function(){
		$("#enableAppend").prop("checked", false)
		window.localStorage['checkEditWorking'] = "false";
	
		if($("#finalScrap").find("#scrapTree").length == 0){
			$(".disableActions").addClass("enableActions").removeClass("disableActions");
			$("#enableAppend").prop("disabled", true).css('cursor','no-drop')
		}
		else{
			$(".enableActions").addClass("disableActions").removeClass("enableActions");
			$("#enableAppend").prop("disabled", false).css('cursor','pointer')
		}
		enableScreenShotHighlight = true;
		DesignServices.getScrapeDataScreenLevel_ICE() 
		.then(function(data){
			if(data.view.length == 0)
			{
				$("#finalScrap").hide();
			}
			if(data != null){
				viewString = data;
				newScrapedList = viewString
				$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").empty()
				$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrape"><img id="screenshot" src="data:image/PNG;base64,'+viewString.mirror+'" /></div>')
				$("#finalScrap").empty()
				if (jQuery.isEmptyObject(viewString)){	
					console.log("Data is Empty");
					$(".disableActions").addClass("enableActions").removeClass("disableActions");
					$("#enableAppend").prop("disabled", true).css('cursor','no-drop');
					$("#screenShotScrape").text("No Screenshot Available")
					return;
				}
				else{
					console.log("Data There");
					$(".enableActions").addClass("disableActions").removeClass("enableActions");
					$("#enableAppend").prop("disabled", false).css('cursor','pointer')
				}
				//console.log("response data: ", viewString);
				$("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox'><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-xs btn-xs-custom objBtn' style='margin-left: 10px'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 0' disabled>Delete</button></span><span></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
				$("#saveObjects").attr('disabled', true);
				var custN;
				var imgTag;
				var scrapTree = $("#finalScrap").children('#scrapTree');
				var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');
				
				for (var i = 0; i < viewString.view.length; i++) {        			
					var path = viewString.view[i].xpath;
					var ob = viewString.view[i];
					ob.tempId= i; 
					custN = ob.custname;
					var tag = ob.tag;
					if(tag == "dropdown"){imgTag = "select"}
					else if(tag == "textbox/textarea"){imgTag = "input"}
					else imgTag = tag;
					if(tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell"){
						var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
					} 
					else {
						var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
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
				
				$(".checkStylebox, .checkall").prop("disabled", false)
			}
		}, 
		function(error){console.log("error");})
	}
	//Populating Saved Scrape Data

	//Initiating Scraping
	$scope.initScraping = function(e, browserType){
		if(e.currentTarget.className == "disableActions") return false
		else{
			eaCheckbox = $("#enableAppend").is(":checked")
			enableScreenShotHighlight = false;
			var blockMsg = 'Scrapping in progress. Please Wait...';
			blockUI(blockMsg);
			DesignServices.initScraping_ICE(browserType)
			.then(function (data) { 				
				unblockUI();
				if(data.view.length > 0)
				{
					$("#finalScrap").show();
				}
				viewString = data;
				//var data = JSON.stringify(data);
				//var scrapeJson = JSON.parse(data);
				//screenshotObj = scrapeJson;
				//initScraping = scrapeJson[0];
				//mirrorObj = scrapeJson[1];
				//scrapeTypeObj = scrapeJson[2];
				$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").empty()
				$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrape"><img id="screenshot" src="data:image/PNG;base64,'+viewString.mirror+'" /></div>')
				$("#finalScrap").empty()
				$("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox' disabled /><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-xs btn-xs-custom objBtn' style='margin-left: 10px'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 0' disabled>Delete</button></span><span></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
				var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');

				//If enable append is active
				if(eaCheckbox){
					//Getting the Existing Scrape Data					
					for (var i = 0; i < newScrapedList.view.length; i++) {
						var path = newScrapedList.view[i].xpath;
						var ob = newScrapedList.view[i];
						ob.tempId= i; 
						custN = ob.custname;
						var tag = ob.tag;
						if(tag == "dropdown"){imgTag = "select"}
						else if(tag == "textbox/textarea"){imgTag = "input"}
						else imgTag = tag;
						if(tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell"){
							var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
						} 
						else {
							var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
						}
						angular.element(innerUL).append(li)
					}
					//Getting the Existing Scrape Data

					generateScrape()

					//Getting appended scraped object irrespective to the dynamic value
					function generateScrape(){ 
						var tempId = newScrapedList.view.length - 1;
						for (var i = 0; i < viewString.view.length; i++) { 
							tempId++
							var path = viewString.view[i].xpath;
							var ob = viewString.view[i];

							var custN = ob.custname.replace(/[<>]/g, '').trim();
							var tag = ob.tag;
							if(tag == "dropdown"){imgTag = "select"}
							else if(tag == "textbox/textarea"){imgTag = "input"}
							else imgTag = tag;
							var tag1 = tag.replace(/ /g, "_");
							var tag2;

							if(tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell"){
								var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
							} 
							else {
								var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
							}
							angular.element(innerUL).append(li)
							newScrapedList.view.push(viewString.view[i]);
						}
						newScrapedList.mirror = viewString.mirror;
						newScrapedList.scrapetype = viewString.scrapetype;
					}
					//Getting appended scraped object irrespective to the dynamic value
				}
				//If enable append is active

				//If enable append is inactive
				else{
					//Before Saving the Scrape JSON to the Database
					for (var i = 0; i < viewString.view.length; i++) {
						
						var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');
						var path = viewString.view[i].xpath;
						var ob = viewString.view[i];
						ob.tempId= i;
						var custN = ob.custname.replace(/[<>]/g, '').trim();
						var tag = ob.tag;
						if(tag == "dropdown"){imgTag = "select"}
						else if(tag == "textbox/textarea"){imgTag = "input"}
						else imgTag = tag;
						var tag1 = tag.replace(/ /g, "_");
						var tag2;
						if(tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell"){
							var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title="+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+" class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
						} 
						else {
							var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title="+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+" class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
						}
						angular.element(innerUL).append(li);
					}

					//Before Saving the Scrape JSON to the Database
				}
				//If enable append is inactive
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
				if(viewString.view.length > 0) $("#saveObjects").removeClass('hide');
				else $("#saveObjects").addClass('hide');
			}, function (error) { console.log("Fail to Load design_ICE") });
		}
	}

//To delete Scrape Objects 
	$scope.del_Objects = function() 
	{
		$("#deleteObjectsModal").modal("hide")
		var userinfo = JSON.parse(window.localStorage['_UI']);
		var tasks = JSON.parse(window.localStorage['_T']);
		var delList = {};
		var deletedCustNames = [];
		var deletedCustPath = [];

		var checkCondLen = $("#scraplist li").children('a').find('input[type=checkbox].checkall:checked').length;
		if(checkCondLen > 0)
		{		
   		 $('input[type=checkbox].checkall:checked').each(function() {
   			 
   			deletedCustNames.push($(this).parent().next('span.ellipsis').text());
   			deletedCustPath.push($(this).parent().parent().parent("li").attr('data-xpath'));
   		});	
   		delList.deletedCustName = deletedCustNames;
   		delList.deletedXpath = deletedCustPath;
   		 //console.log(deletedCustNames);
		}
		//console.log("Delete", viewString);
	    var moduleId = tasks.moduleId;
	    var screenId = tasks.screenId;
	    var screenName = tasks.screenName;
		scrapeObject = {};
		scrapeObject.param = 'deleteScrapeData_ICE';
		scrapeObject.getScrapeData = viewString;
	   	scrapeObject.moduleId = moduleId;
	    scrapeObject.screenId = screenId;
	    scrapeObject.screenName = screenName;
		scrapeObject.deletedList = delList;
		scrapeObject.userinfo = userinfo;
		DesignServices.updateScreen_ICE(scrapeObject)
		.then(function(data) {
			if(data == "success")
			{
				$("#globalModal").modal("show");
                $("#globalModal").find('.modal-title').text("Delete Scrape Objects");
                $("#globalModal").find('.modal-body p').text("Scraped Objects deleted successfully.");
                deleteFlag = true;
                angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();	
			}
			else{
				$("#globalModal").modal("show");
                $("#globalModal").find('.modal-title').text("Delete Scrape Objects");
                $("#globalModal").find('.modal-body p').text("Scraped Objects fail to delete.");
                deleteFlag = false;
			}
			//Service to be integrated as it has dependency of ($scope.newTestScriptDataLS)
		}, function(error) {

		});
	}
	//Highlight Element on browser
	$scope.highlightScrapElement = function(xpath,url) {
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
				var getTopValue;

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
				d.css('opacity', '0.7');
				getTopValue = Math.round(rect.y) * scale_highlight + 'px'
				$(".scroll-wrapper > .scrollbar-screenshot").animate({ scrollTop: parseInt(getTopValue) },500);
				//$('.scroll-wrapper > .scrollbar-screenshot').scrollTo(d.offset().top);
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
			}, function(error) { });
		}    
	};
	//Highlight Element on browser

	//Save Scrape Objects
	$(document).on('click', "#saveObjects", function(){
		
		var tasks = JSON.parse(window.localStorage['_T']);
		if(eaCheckbox) var getScrapeData = JSON.stringify(newScrapedList);
		else var getScrapeData = JSON.stringify(viewString);

		var moduleId = tasks.moduleId;
		var screenId = tasks.screenId;
		var screenName = tasks.screenName;
		var userinfo = JSON.parse(window.localStorage['_UI']);
		scrapeObject = {};
		scrapeObject.getScrapeData = getScrapeData;
		scrapeObject.moduleId = moduleId;
		scrapeObject.screenId = screenId;
		scrapeObject.screenName = screenName;
		scrapeObject.userinfo = userinfo;
		scrapeObject.param = "updateScrapeData_ICE";
		scrapeObject.appType = "Web";
		
		if(window.localStorage['checkEditWorking'] == "true")
		{
			console.log("inside edit");
			var modifiedCust = JSON.parse(window.localStorage['_modified']);
			var currlistItems = [];
        	var modifiedListItems = [];
        	var modList = [];
        	var screenId = tasks.screenId;
        	var userinfo = JSON.parse(window.localStorage['_UI']);
        	getScrapeData = JSON.parse(getScrapeData);
        	scrapeObject.moduleId = moduleId;
    		scrapeObject.screenId = screenId;
    		scrapeObject.screenName = screenName;
    		scrapeObject.userinfo = userinfo;
        	scrapeObject.param = "editScrapeData_ICE";
        	scrapeObject.appType = "Web";
        	for(i=0; i<getScrapeData.view.length; i++){
        		currlistItems.push(getScrapeData.view[i].custname);
        	}
        	$(".ellipsis").children().parent().parent().parent().remove();
        	$.each($(".ellipsis"), function(){            
    			modifiedListItems.push($(this).text());
    		});
    		for(i=0; i<modifiedListItems.length; i++){
    			if(modifiedListItems[i] != "" || modifiedListItems[i] != undefined){
    				modList.push(modifiedListItems[i])
    			}
    		}
    		scrapeObject.getScrapeData = getScrapeData; 
    		scrapeObject.editedList = modifiedCust; 
		}
		
		//Update Service to Save Scrape Objects
		DesignServices.updateScreen_ICE(scrapeObject)
		.then(function(data){
			if(data == "success"){
				window.localStorage['_modified'] = "";
				enableScreenShotHighlight = true;
				localStorage.removeItem("_modified");
				$("#globalModal").modal("show");
				$("#globalModal").find('.modal-title').text("Save Scraped data");
				$("#globalModal").find('.modal-body p').text("Scraped data saved successfully.");
				angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
				$("#saveObjects").attr('disabled', true);
			}
			else{
				enableScreenShotHighlight = false;
				$("#globalModal").modal("show");
				$("#globalModal").find('.modal-title').text("Save Scraped data");
				$("#globalModal").find('.modal-body p').text("Failed to save");
			}

		}, function(error){})

	})

	//To Select and unSelect all objects 
	$(document).on("click", ".checkStylebox", function(){
		if($(this).is(":checked")){
			$("#scraplist li").find('input[name="selectAllListItems"]').prop("checked", true).addClass('checked');

			$("#deleteObjects").prop("disabled", false)
		}
		else{
			$("#scraplist li").find('input[name="selectAllListItems"]').prop("checked", false).removeClass('checked');

			$("#deleteObjects").prop("disabled", true)
		}
	})

	//Triggered When each checkbox objects are clicked
	$(document).on('click', "input[name='selectAllListItems']", function(){
		if($(this).is(":checked")){
			$(this).addClass('checked');
		} else{
			$(this).removeClass('checked');
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

	$(document).find('#load_jqGrid').prop('display','none !important');

	//save button clicked - save the testcase steps
	$scope.updateTestCase_ICE = function()	{
		var userInfo = JSON.parse(window.localStorage['_UI']);
		var taskInfo = JSON.parse(window.localStorage['_T']);
		if(userInfo.role == "Viewer") return false;
		else{
			var screenId = taskInfo.screenId;
			/*if(window.localStorage['screenIdVal'] == undefined || !window.localStorage['screenIdVal'] || window.localStorage['screenIdVal'] == ""){
				screenId = window.localStorage['scrnId'];
			}else{
				screenId = window.localStorage['screenIdVal'];
			}*/
			var testCaseId = taskInfo.testCaseId;
			var testCaseName = taskInfo.testCaseName;
			if((screenId != undefined) && (screenId != "undefined") && (testCaseId != undefined) && (testCaseId != "undefined")){
				//#D5E7FF  DBF5DF
				var serviceCallFlag = false;
				var mydata = $("#jqGrid").jqGrid('getGridParam','data');
				for(var i=0; i<mydata.length;i++){
					//new to parse str to int (step No)
					if(mydata[i].hasOwnProperty("_id_")){
						if(mydata[i]._id_.startsWith("jqg")){
							var index = mydata.indexOf(mydata[i]);
							mydata.splice(index, 1)
						}
					}
			//		else{
						if(mydata[i].url == undefined){mydata[i].url="";}
						mydata[i].stepNo = i+1;
						debugger;
						//mydata[i].remarks = $("#jqGrid tbody tr td:nth-child(10)")[i+1].textContent;
						if(mydata[i].remarks != undefined)
						{
							if(  mydata[i].remarks != $("#jqGrid tbody tr td:nth-child(10)")[i+1].textContent  && $("#jqGrid tbody tr td:nth-child(10)")[i+1].textContent.trim().length > 0 )	{
								if( mydata[i].remarks.length > 0 ){
									mydata[i].remarks = mydata[i].remarks.concat( " ; " + $("#jqGrid tbody tr td:nth-child(10)")[i+1].textContent);
								}
							     else{
									  mydata[i].remarks = $("#jqGrid tbody tr td:nth-child(10)")[i+1].textContent;
								 }	 
						     }
						}
						//check - keyword column should be mandatorily populated by User
						if(mydata[i].custname == undefined || mydata[i].custname == ""){
							var stepNoPos = parseInt(mydata[i].stepNo);
							$("#globalModal").find('.modal-title').text("Save Testcase");
							$("#globalModal").find('.modal-body p').text("Please select Object Name at Step No. "+stepNoPos);
							$("#globalModal").modal("show");
							serviceCallFlag  = true;
							break;
						}
						else{
							mydata[i].custname = mydata[i].custname.trim();
							if(mydata[i].keywordVal == undefined || mydata[i].keywordVal == ""){
								var stepNoPos = parseInt(mydata[i].stepNo);
								$("#globalModal").find('.modal-title').text("Save Testcase");
								$("#globalModal").find('.modal-body p').text("Please select keyword at Step No. "+stepNoPos);
								$("#globalModal").modal("show");
								serviceCallFlag  = true;
								break;
							}
							else if(mydata[i].keywordVal == 'SwitchToFrame'){
								if($scope.newTestScriptDataLS != "undefined"){
									var testScriptTableData = JSON.parse($scope.newTestScriptDataLS);
									for(j=0;j<testScriptTableData.length;j++){
										if(testScriptTableData[j].custname != '@Browser' && testScriptTableData[j].custname != '@Oebs' && testScriptTableData[j].custname != '@Window' && testScriptTableData[j].custname != '@Generic' && testScriptTableData[j].custname != '@Custom'){
											if(testScriptTableData[j].url != ""){
												mydata[i].url = testScriptTableData[j].url;
												break;
											}
										}
									}
								}
							}
						}
				//	}
				}
				if(serviceCallFlag  == true)
				{
					console.log("no service call being made");
				}
				else{
					DesignServices.updateTestCase_ICE(screenId,testCaseId,testCaseName,mydata,userInfo)
					.then(function(data){
						if(data == "success"){
							/*if(window.localStorage['UITSCrtd'] == "true") window.localStorage['UITSCrtd'] = "false"
		        			else{
		        				$("#tabs,#tabo2,#tabo1").tabs("destroy");
		        				showDialogMesgsBtn("Save Test Script", "Test Script saved successfully", "btnSave");
		        				selectRowStepNoFlag = true;
			        			$("#tabs,#tabo2,#tabo1").tabs();
		        			}*/
							angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
							$("#globalModal").find('.modal-title').text("Save Testcase");
							$("#globalModal").find('.modal-body p').text("Testcase saved successfully").css('color','black');
							$("#globalModal").modal("show");
							/*if(deleteStep == false){
								selectRowStepNoFlag = true;
								
							}
							else{
								$("#globalModal").find('.modal-title').text("Delete Testcase step");
								$("#globalModal").find('.modal-body p').text("Successfully deleted the steps").css('color','black');
								$("#globalModal").modal("show");
								deleteStep = false;
							}*/
						}
						else{
							$("#globalModal").find('.modal-title').text("Save Testcase");
							$("#globalModal").find('.modal-body p').text("Failed to save Testcase").css('color','black');
							$("#globalModal").modal("show");
						}
					},
					function(error) {
					});
					serviceCallFlag = false;
				}
			}
			else{
				$("#globalModal").find('.modal-title').text("Save Testcase");
				$("#globalModal").find('.modal-body p').text("ScreenID or TestscriptID is undefined").css('color','black');
				$("#globalModal").modal("show");
				return false;
			}
		}
	}
	
	//Filter Scrape Objects
	$(document).on("click", ".checkStyleboxFilter", function(){
		gsElement = []
		$(".popupContent-filter-active").each(function(){
			gsElement.push($(this).data("tag"))
		})
		filter()
	})
	$(document).on("click", ".selectAllTxt", function(){
		gsElement = []
		$(".popupContent-filter-active").each(function(){
			gsElement.push($(this).data("tag"))
		})
		filter()
	})
	$(document).on("click", ".filterObjects", function(){
		$("#scraplist li").hide()
		if($(this).hasClass("popupContent-filter-active") == false) {
			var getSpliceIndex = gsElement.indexOf($(this).data("tag"))
			gsElement.splice(getSpliceIndex, 1)
		}
		else gsElement.push($(this).data("tag"))	
		filter()
	})
	
	function filter(){
		if(gsElement.length > 0){
			for(i=0; i<gsElement.length; i++){
				$.each($("#scraplist li"), function(){
					if(gsElement[i] == $(this).data("tag")){
						$(this).show()
					}
				})
				$.each($("#scraplist li"), function(){
					if(gsElement[i] == "Element"){
						$.each($("#scraplist li"), function(){
							if($(this).data("tag") != "button" &&
								$(this).data("tag") != "checkbox" &&
								$(this).data("tag") != "select" &&
								$(this).data("tag") != "img" &&
								$(this).data("tag") != "a" &&
								$(this).data("tag") != "radiobutton" &&
								$(this).data("tag") != "input" &&
								$(this).data("tag") != "list" &&
								$(this).data("tag") != "table")
							{
									$(this).show()
							}
						})
					}
				})
			}
		} 
		else{
			$("#scraplist li").show()
		}
	}
	//Filter Scrape Objects
}]);

//Loading table action buttons
function contentTable(newTestScriptDataLS) {
	//get keyword list
	var keywordArrayList = window.localStorage['keywordListData'];
	keywordArrayList = JSON.parse(keywordArrayList);
	testContent = JSON.parse(readTestCaseData);
	var emptyStr = "{}";
	var obj = testContent;
	var scrappedData = "";
	//scrap data
	var newTestScriptData = newTestScriptDataLS;
	if(newTestScriptData == "undefined" || newTestScriptData == null || newTestScriptData == ""){
		scrappedData = "";
	}
	else{	
		scrappedData = newTestScriptData;
	}

	$("#jqGrid").jqGrid({
		datastr: obj,    
		datatype: "jsonstring",
		editUrl:'obj',
		page:1,
		scroll:1,
		colModel: [
		           { label: 'Step No', 	name: 'stepNo', key:true, editable: false, sortable:false, resizable:false, hidden: true},
		           { name: 'objectName', editable: false, sortable:false, resizable:false, hidden: true},
		           { label: 'Object Name', name: 'custname', editable: true,  resizable:false, sortable:false, 
		        	   edittype:'select', 
		        	   editoptions : {
		        		   value : getTags(scrappedData),
		        		   dataEvents : [{            					
		        			   type : 'change',
		        			   'fn' : editCell
		        		   }]
		        	   }
		           },
		           { label: 'Keyword', 	name: 'keywordVal', editable: true, resizable:false, sortable:false ,
		        	   edittype:'select',
		        	   editoptions :{
		        		   value : getKeywordList(keywordArrayList),
		        		   dataEvents : [{            					
		        			   type : 'change' ,
		        			   'fn' : editkeyWord
		        		   }]
		        	   }
		           },
		           { label: 'Input', name: 'inputVal', editable: true,  resizable:false, sortable:false },
		           { label: 'Output', name: 'outputVal', editable: true,  resizable:false, sortable:false },
		           { label: 'Remarks', name:'remarksStatus', editable: false,  resizable:false, sortable:false},
		           { label: 'Remarks', name: 'remarks', editable: false,  resizable:false, sortable:false, hidden:true},
		           { label: 'URL', 	name: 'url', editable: false, resizable:false, hidden:true },
		           { label: 'appType', name: 'appType', editable: false, resizable:false, hidden:true }
		           ],
		           loadonce: false,
		           viewrecords: false,
		           onSelectRow: editRow,
		           autowidth: true,
		           shrinkToFit: true,
		           multiselect: true, //Appends Checkbox for multiRowSelection
		           multiboxonly: true, //Selects single row
		           beforeSelectRow: function (rowid, e) {
		        	   if ($(e.target).closest("tr.jqgrow").hasClass("state-disabled")) {
		        		   return false;   // doesnot allow to select the row
		        	   }
		        	   return true;    // allows to select the row
		           },
		           //width:950,
		           drag: true,
		           height: 'auto',
		           rowList:[],
		           rowNum: 1000,
		           rownumbers: true,
		           toppager:true,
		           autoencode: true,
		           scrollrows : true,
		           loadComplete: function() {
		        	   $("#jqGrid tr[id^='jqg']").remove();
		        	   $("#jqGrid tr").each(function(){
		        		   if($(this).find("td:nth-child(10)").text().trim().length <= 0){
		        			   $(this).find("td:nth-child(9)").text('');
		        			   $(this).find("td:nth-child(9)").append('<img src="imgs/ic-remarks-inactive.png" class="remarksIcon"/>');
		        		   }
		        		   else{
		        			   $(this).find("td:nth-child(9)").text('');
		        			   $(this).find("td:nth-child(9)").append('<img src="imgs/ic-remarks-active.png" class="remarksIcon"/>');
		        		   }
		        	   })
		        	   //$("#cb_jqGrid").on('click', function() {
		        		   /*var cboxParent =  $(this).is(":checked");
		        		   var editableLen = $(".editable").length;
		        		   if (cboxParent == true && editableLen == 0){
		        			   $(".commentIcon,.unCommentIcon,.deleteIcon").show();
		        		   }
		        		   else{
		        			   $(".commentIcon,.unCommentIcon,.deleteIcon").hide();
		        		   }
		        		   window.localStorage['selectRowStepNo']='';*/
		        	   //});		        	   
		        	   $("#jqGrid tr").children("td[aria-describedby='jqGrid_outputVal']").each(function(){
		        		   if($(this).text().trim() == "##" || $(this).is(":contains(';##')")){
		        			   if($(this).parent('tr:nth-child(odd)').length > 0){
		        				   $(this).parent().css("background","linear-gradient(90deg, red 0.6%, #e8e6ff 0)").focus();
		        			   }
		        			   else{
			        			   $(this).parent().css("background","linear-gradient(90deg, red 0.6%, white 0)").focus();		        				   
		        			   }
		        			   $(this).css('color','red');
		        		   }
		        	   });
		        	   hideOtherFuncOnEdit();
		           },
	})

	//commented the sorting of rows (drag and drop) on purpose - Dated: 5/12/2015
	.jqGrid('sortableRows', {
		update: function (ev, ui) {
			var item = ui.item[0],
			ri = item.rowIndex,
			itemId = item.id,
			message = "The row with the id=" + itemId +" is moved. The new row index is " + ri;
			var gridArrayData = $("#jqGrid").jqGrid('getRowData');
			for(var i=0; i<gridArrayData.length;i++){
				gridArrayData[i].stepNo = i+1;
			}
			$("#jqGrid").jqGrid('restoreRow',lastSelection);
			$("#jqGrid").jqGrid('clearGridData');
			$("#jqGrid").jqGrid('setGridParam',{data: gridArrayData});
			$("#jqGrid").trigger("reloadGrid");
			//tsrows_reorder();
		}
	});

	$("#jqGrid_rn").css("width","54px");
	$('#jqGrid').navGrid("#jqGridPager", {edit: false, add: false, del: false, refresh: false, view: false, search:false, position:"left", cloneToTop: true });
	$('#jqGrid').inlineNav('#jqGrid_toppager',{
		// the buttons to appear on the toolbar of the grid
		edit: false, 
		add: false, 
		del: false,
		save: false,
		cancel: false,
		addParams: {
			keys: true,
			position:"last"
		}
	});

	$("#jqGrid_toppager").hide();
	$("#jqGrid").find(">tbody").sortable("disable");
	$("#jqGrid").jqGrid("setColProp", "stepNo", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "objectName", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "custname", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "keywordVal", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "inputVal", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "outputVal", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "url", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "appType", {editable: false});
	$("#jqGrid").resetSelection();
	
	$(document).on('click', '.remarksIcon', function(){
		$(this).parent('td').next('td[aria-describedby="jqGrid_remarks"]').addClass('selectedRemarkCell');
		$("#modalDialogRemarks").find('.modal-title').text("Remarks");
		$("#modalDialogRemarks").find('#labelContent').text("Add Remarks");
		$("#getremarksData").val('');
		$("#modalDialogRemarks").find('.modal-footer button').attr("id","btnaddRemarks");
		$("#modalDialogRemarks").modal("show");
	})

	$(document).on('click', '#btnaddRemarks', function(){
		var getremarks = $("#getremarksData").val();
		if(getremarks.length > 0){
			$("#jqGrid tbody tr td.selectedRemarkCell").text(getremarks);
			$("#jqGrid tbody tr td.selectedRemarkCell").attr('title',getremarks);
			$("#jqGrid tbody tr td.selectedRemarkCell").removeClass('selectedRemarkCell');
			$(this).parent(".modal-footer").parent(".modal-content").find(".close").trigger('click');
		}
	})
	
	function hideOtherFuncOnEdit()
	{
	
		$("#jqGrid").each(function() {
			var cboxCheckedLen = $(".cbox:not(#cb_jqGrid):checked").length;
			var cboxLen = $(".cbox:not(#cb_jqGrid)").length;
			var editableLen = $(".editable").length;
			var cboxParentCheckedLen = $('#cb_jqGrid:checked').length;
			var rowHighlightLen = $("tr.rowHighlight").length;
			var rowSelectedLen = $("tr.ui-state-highlight").length;
			$("tr.rowHighlight").each(function() {
				if(rowSelectedLen > 0 )
				{
					$("tr.rowHighlight").removeClass("rowHighlight");
				}
			});

			if(cboxLen == cboxCheckedLen ){
				$("#cb_jqGrid").prop('checked',true);
			}
			else{
				$("#cb_jqGrid").prop('checked',false);
			}
		});

		$(".cbox:not(#cb_jqGrid)").each(function() {
			$(this).on('click', function(e) {
				var isCboxChecked = $(this).is(":checked");
				var checkedLen = $(".cbox:checked").length;
				if (isCboxChecked == true)
				{
					$(".cbox:not(:checked):not(#cb_jqGrid)").parent().parent("tr.ui-state-highlight").removeClass('ui-state-highlight');
				}
			});
		});

		$("tr.jqgrow").each(function() {
			$(this).on('click', function(e) {
				var rowId = $(this).attr("id");
				if(rowId == (e.target.parentElement.id || e.target.parentElement.parentElement.id))
				{
					$(".cbox:not(:checked):not(#cb_jqGrid)").parent().parent("tr.ui-state-highlight").removeClass('ui-state-highlight');
				}
			});
		});	

		$(".cbox:checked:not(#cb_jqGrid)").parent().parent().siblings("tr.jqgrow").each(function() { 
			var checkedBoxLen = $(".cbox:checked").length;
			if ($(this).hasClass('ui-state-highlight') && checkedBoxLen == 1 ) 
			{ 
				$(this).removeClass('ui-state-highlight'); 
				$(this).find(".cbox").attr("checked",false);
			} 
		});

		//Hide EditTestStep when multiple rows selected
		var checkedLen = $(".cbox:checked:not(#cb_jqGrid)").length;
		if(checkedLen > 1 )
		{
			$("#editTestStep").hide();
		} 
		else{
			$("#editTestStep").show();
		}
	}

	//Enable/disable Functions on start/end of editing
	$("#jqGrid").bind("jqGridInlineEditRow jqGridInlineAfterSaveRow jqGridInlineAfterRestoreRow", function (e) {
		var $self = $(this),
		savedRows = $self.jqGrid("getGridParam", "savedRow");
		if (savedRows.length > 0) {
			hideOtherFuncOnEdit();
		} else {
			hideOtherFuncOnEdit();
		}
	});

	var lastSelection = '';
	function editRow(id,status,e) {
		if (id && id !== lastSelection) {
			var grid = $("#jqGrid");

			var selectedText = grid.jqGrid('getRowData',id).custname;
			var selectedKeyword = grid.jqGrid('getRowData', id).keywordVal;
			grid.jqGrid('restoreRow',lastSelection);                        
			grid.jqGrid('editRow',id, {keys: true} );
			setKeyword(e,selectedText,grid,selectedKeyword);
			lastSelection = id;
			window.localStorage['selectRowStepNo'] = id;
		}
		else{
			var grid = $("#jqGrid");
			grid.jqGrid('restoreRow',lastSelection);
			lastSelection = "";
		}	
		//get Input and Output Syntax for selected Keyword
		var keywordArrayList1 = window.localStorage['keywordListData'];
		var keywordArrayList = JSON.parse(keywordArrayList1);
		$.each(keywordArrayList.syntax, function( index, value ) {
			keywordArrayKey = index;
			keywordArrayValue =  JSON.parse(value);
			if(selectedKeywordList == keywordArrayKey)
			{
				$.each(keywordArrayValue, function(k, v) {
					if(selectedKeyword == k)
					{
						inputSyntax = v.inputVal;
						outputSyntax = v.outputVal;
						grid.find("td[aria-describedby = jqGrid_inputVal]:visible").find('input').attr("placeholder", inputSyntax).attr("title", inputSyntax);
						grid.find("td[aria-describedby = jqGrid_outputVal]:visible").find('input').attr("placeholder", outputSyntax).attr("title", outputSyntax);
					}
				});
			}
		});
	}

	function setKeyword(e,selectedText,$grid,selectedKeyword){
		var keywordArrayList1 = window.localStorage['keywordListData'];
		var keywordArrayList = JSON.parse(keywordArrayList1);
		var taskInfo = JSON.parse(window.localStorage['_T']);
		var appTypeLocal = taskInfo.appType;//window.localStorage['appTypeScreen'];
		if(selectedText == ""){selectedText = "@Generic"}
		if(selectedText == "@Generic" || selectedText == undefined) 
		{
			objName = " ";
			url = " ";    
			if(appTypeLocal == "MobilityiOS"){
				var sc = keywordArrayList.defaultListMobilityiOS;
				selectedKeywordList = "defaultListMobilityiOS";
				var res = '';
				for(var i = 0; i < sc.length; i++){
					if(selectedKeyword == sc[i]){
						res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
					}
					else
						res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
				}
				var row = $(e.target).closest('tr.jqgrow');
				var rowId = row.attr('id');
				$("select#" + rowId + "_keywordVal", row[0]).html(res);
				selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
				$grid.jqGrid('setCell', rowId, 'appType', "Generic");
				$grid.jqGrid('setCell', rowId, 'url', url);
				$grid.jqGrid('setCell', rowId, 'objectName', objName);
			}
			else{
				if (appTypeLocal == 'Mobility') {
					var sc = keywordArrayList.defaultListMobility;
					selectedKeywordList = "defaultListMobility";
				} else {
					var sc = keywordArrayList.defaultList;
					selectedKeywordList = "defaultList";
				}
				var res = '';
				for(var i = 0; i < sc.length; i++){
					if(selectedKeyword == sc[i]){
						res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
					}
					else
						res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
				}
				var row = $(e.target).closest('tr.jqgrow');
				var rowId = row.attr('id');
				$("select#" + rowId + "_keywordVal", row[0]).html(res);
				selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
				$grid.jqGrid('setCell', rowId, 'appType', "Generic");
				$grid.jqGrid('setCell', rowId, 'url', url);
				$grid.jqGrid('setCell', rowId, 'objectName', objName);
			}			
		}

		else if(selectedText == "@Browser" )
		{
			objName = " ";
			url = " ";
			var sc = keywordArrayList.browser;
			selectedKeywordList = "browser";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
		}
		else if(selectedText == "@BrowserPopUp" ){
			objName = " ";
			url = " ";
			var sc = keywordArrayList.browserPopUp;
			selectedKeywordList = "browserPopUp";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
		}
		/**
		 * To Handle custom objects mapping @custom to element keywords
		 * @author sushma.p
		 * Date Sept-09-2015
		 */
		else if(selectedText == "@Custom" ){
			objName = "@Custom";
			url = "";
			var sc;
			var res = '';
			if(appTypeLocal == 'Desktop'){
				sc = keywordArrayList.customDp;
				selectedKeywordList = "customDp";
			}
			else if(appTypeLocal == 'DesktopJava'){
				sc = keywordArrayList.customOEBS;
				selectedKeywordList = "customOEBS";
				var newTSDataLS = angular.element(document.getElementsByClassName('gridview-1')).scope().newTestScriptDataLS;
				if(newTSDataLS){
					if(newTSDataLS != "undefined"){
						var testScriptTableData = JSON.parse(newTSDataLS);
						for(j=0;j<testScriptTableData.length;j++){
							if(testScriptTableData[j].custname != '@Browser' && testScriptTableData[j].custname != '@Oebs' && testScriptTableData[j].custname != '@Window' && testScriptTableData[j].custname != '@Generic' && testScriptTableData[j].custname != '@Custom'){
								if(testScriptTableData[j].url != ""){
									url = testScriptTableData[j].url;
									break;
								}
							}
						}
					}
				}
			}
			else {
				sc = keywordArrayList.custom;
				selectedKeywordList = "custom";
			}
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);			
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'objectName', objName); 
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		//ends here
		else if(selectedText == "WebService List" ){
			objName = " ";
			url = " ";
			var sc = keywordArrayList.defaultListWS;
			selectedKeywordList = "defaultListWS";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		else if(selectedText == "Mainframe List" ){
			objName = " ";
			url = " ";
			var sc = keywordArrayList.defaultListMF;
			selectedKeywordList = "defaultListMF";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		else if(selectedText == "@Email" ){
			objName = " ";
			url = " ";
			var sc = keywordArrayList.defaultListDP;
			selectedKeywordList = "defaultListDP";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		else if(selectedText == "@Window" ){
			objName = " ";
			url = " ";
			var sc = keywordArrayList.generic;
			selectedKeywordList = "generic";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
		}
		else if(selectedText == "@Oebs" ){
			objName = "";
			url = "";
			var sc = keywordArrayList.generic;
			selectedKeywordList = "generic";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
			$grid.jqGrid('setCell', rowId, 'url', url);
		}
		else if(selectedText == "@Mobile" ){
			objName = " ";
			url = " ";
			var sc = keywordArrayList.generic;
			selectedKeywordList = "generic";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		else if (selectedText == "@Action") {
			objName = " ";
			url = " ";
			var sc = keywordArrayList.action;
			selectedKeywordList = "a";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i]
					+ '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">'
					+ sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
			$grid.jqGrid('setCell', rowId, 'url', url);
		}
		else if(selectedText == "@MobileiOS" ){
			objName = " ";
			url = " ";
			var sc = keywordArrayList.genericiOS;
			selectedKeywordList = "genericiOS";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		//Adding @Excel to the objectName dropdown
		if(selectedText == "@Excel") 
		{
			objName = " ";
			url = " ";    		
			//new
			var sc = keywordArrayList.excelList;
			selectedKeywordList = "excelList";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', 'Generic');
		}
		else{
			for (var i=0; i<scrappedData.length; i++){
				var ob = scrappedData[i];
				var custname1;
				var custval=ob.custname;
				selectedText = selectedText.trim();		
				custname1 = $('<input>').html(custval).text().trim();
				if (custname1 == selectedText){
					objName = ob.xpath;
					url = ob.url;					
					var obType = ob.tag;
					var listType=ob.canselectmultiple;

					//changes from wasim
					if(obType!='a' && obType!='select' && obType!='radiobutton' && obType!='checkbox' && obType!='input' && obType!='list' 
						&& obType!='tablecell' && obType!='table' && obType!='img' && obType!='button' && appTypeLocal == 'Web' ){						
						var sc = keywordArrayList.element;
						selectedKeywordList = "element";
						var res = '';
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}	
					else if(obType =='elementWS'){
						var sc = keywordArrayList.elementWS;
						selectedKeywordList = "elementWS";
						var res = '';
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
					else if(appTypeLocal == 'Desktop' &&(obType =='push_button' ||obType =='text' ||obType =='combo_box' || obType =='list_item'|| obType =='hyperlink' || obType =='lbl'
						||obType =='list' || obType == 'edit' || obType == null || obType == 'check_box' || obType == 'radio_button' || obType != undefined)){
						var res = '';
						var sc;
						var listType = ob.canselectmultiple;
						if(obType =='push_button')	{sc = keywordArrayList.button;selectedKeywordList = "button";}		
						else if(obType =='text' || obType == 'edit'){	sc = keywordArrayList.text;selectedKeywordList = "text";}
						else if(obType =='combo_box'){	sc = keywordArrayList.select;selectedKeywordList = "select";}
						else if(obType =='list_item')	{sc = keywordArrayList.list;selectedKeywordList = "list";}
						else if (obType == 'list_item' || obType == 'list') {
							if (listType == 'true') {
								sc = keywordArrayList.list;
								selectedKeywordList = "list";
							} else {
								sc = keywordArrayList.select;
								selectedKeywordList = "select";
							}
						}
						else if(obType =='check_box'){	sc = keywordArrayList.checkbox;selectedKeywordList = "checkbox";}
						else if(obType == 'radio_button')	{sc = keywordArrayList.radiobutton;selectedKeywordList = "radiobutton";}
						else if(obType =='hyperlink' || obType =='lbl'){	sc = keywordArrayList.link;selectedKeywordList = "link";}
						else	{sc = keywordArrayList.element;selectedKeywordList = "element";}
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
					else if(appTypeLocal == 'Desktop' &&(!(obType =='push_button' ||obType =='text' ||obType =='combo_box' || obType =='list_item'|| obType =='hyperlink' || obType =='lbl'
						||obType =='list' || obType == 'edit' || obType == null || obType == 'Static' || obType == 'check_box'|| obType == 'radio_button'))){
						var res = '';
						var sc = keywordArrayList.element;
						selectedKeywordList = "element";
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
					else if (appTypeLocal == 'Mobility'
						&& (obType.includes("RadioButton") || obType.includes("ImageButton") || obType.includes("Button") || obType.includes("EditText") 
								|| obType.includes("Switch") || obType.includes("CheckBox") || obType.includes("Spinner") || obType.includes("TimePicker") || obType.includes("DatePicker") || obType.includes("NumberPicker") || obType.includes("RangeSeekBar") || obType.includes("SeekBar") || obType.includes("ListView"))) {
						var res = '';
						var sc;
						if (obType.includes("RadioButton"))
						{sc = keywordArrayList.radiobutton;
						selectedKeywordList = "radiobutton";}
						else if (obType.includes("EditText"))
						{sc = keywordArrayList.input;
						selectedKeywordList = "input";}
						else if (obType.includes("Switch"))
						{sc = keywordArrayList.togglebutton;
						selectedKeywordList = "togglebutton";}
						else if (obType.includes("ImageButton")
								|| obType.includes("Button"))
						{sc = keywordArrayList.button; selectedKeywordList = "button";}
						else if (obType.includes("Spinner"))
						{sc = keywordArrayList.spinners;selectedKeywordList = "spinners";}
						else if (obType.includes("CheckBox"))
						{sc = keywordArrayList.checkbox;selectedKeywordList = "checkbox";}
						else if (obType.includes("TimePicker"))
						{sc = keywordArrayList.time;selectedKeywordList = "time";}
						else if (obType.includes("DatePicker"))
						{sc = keywordArrayList.date;selectedKeywordList = "date";}
						else if (obType.includes("NumberPicker"))
						{sc = keywordArrayList.numberpicker;selectedKeywordList = "numberpicker";}
						else if (obType.includes("RangeSeekBar"))
						{sc = keywordArrayList.rangeseekbar;selectedKeywordList = "rangeseekbar";}
						else if (obType.includes("SeekBar"))
						{sc = keywordArrayList.seekbar;selectedKeywordList = "seekbar";}
						else if (obType.includes("ListView"))
						{sc = keywordArrayList.listview;selectedKeywordList = "listview";}	
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i]
								+ '" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i]
							+ '">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					} else if (appTypeLocal == 'Mobility' && (!(obType.includes("RadioButton") || obType.includes("ImageButton") || obType.includes("Button") || obType.includes("EditText") 
							|| obType.includes("Switch")  || obType.includes("CheckBox") || obType.includes("Spinner") || obType.includes("TimePicker") || obType.includes("DatePicker") || obType.includes("NumberPicker") || obType.includes("RangeSeekBar") || obType.includes("SeekBar") || obType.includes("ListView")))) {
						var res = '';
						var sc = keywordArrayList.element;
						selectedKeywordList = "element";
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i]
								+ '" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i]
							+ '">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
					else if(appTypeLocal == 'MobilityiOS' && (( obType == 'UIATableView' || obType == 'UIASecureTextField' || obType == 'UIATextField' || obType=='UIASwitch' || obType=='UIAButton'  || obType == 'UIASearchBar' || obType == 'UIASlider' || obType =='UIAPickerWheel'))){
						var res = '';
						var sc;
						if(obType == 'UIASecureTextField' || obType == 'UIATextField' || obType == 'UIASearchBar'){ sc = keywordArrayList.text;selectedKeywordList = "text";}
						else if(obType =='UIASwitch'){ sc = keywordArrayList.Switch;selectedKeywordList = "Switch";}
						else if(obType =='UIAButton') {sc= keywordArrayList.button;selectedKeywordList = "button";}
						else if(obType == 'UIASlider') {sc = keywordArrayList.slider;selectedKeywordList = "slider";}
						else if(obType =='UIAPickerWheel'){ sc = keywordArrayList.picker;selectedKeywordList = "picker";}
						else if(obType =='UIATableView') {sc = keywordArrayList.table;selectedKeywordList = "table";}
						else	{sc = keywordArrayList.generic;selectedKeywordList = "generic";}
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;						
					}
					else if(appTypeLocal == 'MobilityiOS' && (!(obType == 'UIATableView' || obType == 'UIASecureTextField' || obType == 'UIATextField' || obType=='UIASwitch' || obType=='UIAButton'  || obType == 'UIASearchBar' || obType == 'UIASlider' || obType =='UIAPickerWheel'))){
						var res = '';
						var sc = keywordArrayList.element;
						selectedKeywordList = "element";
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
					else if(appTypeLocal == 'DesktopJava' && (obType =='push button' ||obType =='text' ||obType =='combo box' || obType =='list item'|| obType =='hyperlink' || obType =='label' || obType =='scroll bar' || obType =='toggle button' || obType =='menu' 
						||obType =='list' || obType == 'edit' || obType == 'Edit Box' || obType == null || obType == 'Static' || obType == 'check box'|| obType == 'radio button' || obType == 'panel' || obType != undefined || obType == 'table')){
						var sc;
						if(obType =='push button' || obType =='toggle button'){
							sc = keywordArrayList.button;		
							selectedKeywordList = "button";
						}
						else if(obType == 'edit'|| obType == 'Edit Box' || obType =='text'){
							sc = keywordArrayList.text;
							selectedKeywordList = "text";
						}
						else if(obType =='combo box'){
							sc = keywordArrayList.select;
							selectedKeywordList = "select";
						}
						else if(obType =='list item' || obType =='list' ){
							sc = keywordArrayList.list;
							selectedKeywordList = "list";
						}
						else if(obType =='hyperlink' || obType =='Static' || obType == 'text'){
							sc = keywordArrayList.link;
							selectedKeywordList = "link";
						}
						else if(obType =='check box'){
							sc = keywordArrayList.checkbox;
							selectedKeywordList = "checkbox";
						}
						else if(obType =='radio button'){
							sc = keywordArrayList.radiobutton;
							selectedKeywordList = "radiobutton";
						}
						else if(obType == 'table'){
							sc = keywordArrayList.table;
							selectedKeywordList = "table";
						}
						else if(obType == 'scroll bar'){
							sc = keywordArrayList.scrollbar;
							selectedKeywordList = "scrollbar";
						}
						else if(obType == 'internal frame'){
							sc = keywordArrayList.internalframe;
							selectedKeywordList = "internalframe";
						}
						else{
							sc = keywordArrayList.element;
							selectedKeywordList = "element";
						}
						var res = '';
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
					else {
						var sc = keywordArrayList[obType];
						selectedKeywordList = obType;
						var res = '';
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
				}
			}
		}
	}

	function setKeyword1(e,selectedText,$grid,selectedKeyword){
		var keywordArrayList1 = window.localStorage['keywordListData'];
		var keywordArrayList = JSON.parse(keywordArrayList1);
		var taskInfo = JSON.parse(window.localStorage['_T']);
		var appTypeLocal = taskInfo.appType;//window.localStorage['appTypeScreen'];
		if(selectedText == "getBody"){
			$(e.target).parent().next().html("<textarea class='editable' rows='1' style='width: 98%;resize:none;min-height:25px;'></textarea>");
		}
		else if (selectedText == "setHeader"){
			$(e.target).parent().next().html("<textarea class='editable' rows='1' style='width: 98%;resize:none;min-height:25px;'></textarea>");
		}
		else if (selectedText == "setWholeBody"){
			$(e.target).parent().next().html("<textarea class='editable' rows='1' style='width: 98%;resize:none;min-height:25px;'></textarea>");
		}
		else if(selectedText == "setHeaderTemplate"){
			var header;
			if(dataFormat12.length == 1) header = dataFormat12.val();
			else if(dataFormat12.length > 1) header = dataFormat12.replace(/##/g, '\n');
			$(e.target).parent().next().html("<textarea class='editable' rows='1' style='width: 98%;resize:none;min-height:25px;'>"+header+"</textarea>");
		}
		else{
			$(e.target).parent().next().html("<input type='text' class='editable form-control' style='width: 100%;'/>");
		}
	}

	//function editCell(rowid, iCol, cellcontent, e){
	function editkeyWord(e){
		var keywordArrayList = window.localStorage['keywordListData'];
		keywordArrayList = jQuery.parseJSON(keywordArrayList);
		var selName = 'keywordVal';
		var $grid = $('#jqGrid');
		//get current selected row
		var currRowId = $grid.jqGrid('getGridParam','selrow');
		var selId = '#' + currRowId + '_'+selName;
		var selectedText = $(selId+' option:selected').text();
		var url = " " ;
		var objName = " ";
		setKeyword1(e,selectedText,$grid,"empty");
		$(selId).parent().next().find('input').val('');
		$(selId).parent().next().next().find('input').val('');
		//get Input and Output Syntax for selected Keyword
		$.each(keywordArrayList.syntax, function( index, value ) {
			keywordArrayKey = index;
			keywordArrayValue =  JSON.parse(value);
			if(selectedKeywordList == keywordArrayKey)
			{
				$.each(keywordArrayValue, function(k, v) {
					if(selectedText == k)
					{
						inputSyntax = v.inputVal;
						outputSyntax = v.outputVal;
						$grid.find("td[aria-describedby = jqGrid_inputVal]:visible").find('input').attr("placeholder", inputSyntax).attr("title", inputSyntax);
						$grid.find("td[aria-describedby = jqGrid_outputVal]:visible").find('input').attr("placeholder", outputSyntax).attr("title", outputSyntax);
					}
				});
			}
		});
	}

	//function editCell(rowid, iCol, cellcontent, e){
	function editCell(e){
		var keywordArrayList = window.localStorage['keywordListData'];
		keywordArrayList = jQuery.parseJSON(keywordArrayList);
		var selName = 'custname';
		var $grid = $('#jqGrid');
		//get current selected row
		var currRowId = $grid.jqGrid('getGridParam','selrow'); 
		var selId = '#' + currRowId + '_'+selName;             	
		var selectedText = $(selId+' option:selected').text();
		var url = " " ;
		var objName = " ";
		setKeyword(e,selectedText,$grid,"empty");
		//uncomment below two sections to verify change in URL 
		//set the URL to the cell 'url'
		if(selectedText == "@Generic" || selectedText == undefined || selectedText == "@Browser" || selectedText == "@Excel" || selectedText == "@BrowserPopUp"){
			$grid.jqGrid('setCell', currRowId, 'objectName', objName); 
			$grid.jqGrid('setCell', currRowId, 'url', url); 
		}
		//get Input and Output Syntax for selected Keyword
		$.each(keywordArrayList.syntax, function( index, value ) {
			keywordArrayKey = index;
			keywordArrayValue =  JSON.parse(value);
			if(selectedKeywordList == keywordArrayKey)
			{
				$.each(keywordArrayValue, function(k, v) {
					if(selectedKey == k)
					{
						inputSyntax = v.inputVal;
						outputSyntax = v.outputVal;
						$grid.find("td[aria-describedby = jqGrid_inputVal]:visible").find('input').attr("placeholder", inputSyntax).attr("title", inputSyntax);
						$grid.find("td[aria-describedby = jqGrid_outputVal]:visible").find('input').attr("placeholder", outputSyntax).attr("title", outputSyntax);
					}
				});
			}
		});
	}
	$("#load_jqGrid").hide();
}	
//contentTable

//Delete Testscripts
function deleteTestScriptRow(e){
	if($(document).find("#cb_jqGrid:checked").length > 0 || $("#jqGrid").find(".cbox:checked").length > 0 ){
		$("#globalModalYesNo").find('.modal-title').text("Delete Test Step");
		$("#globalModalYesNo").find('.modal-body p').text("Are you sure, you want to delete?").css('color','black');
		$("#globalModalYesNo").find('.modal-footer button:nth-child(1)').attr("id","btnDeleteStepYes")
		$("#globalModalYesNo").modal("show");		
		/*angular.element(document.getElementById("tableActionButtons")).scope().updateTestCase_ICE();*/		
	}
	else{
		$("#globalModal").find('.modal-title').text("Delete Test step");
		$("#globalModal").find('.modal-body p').text("Select steps to delete").css("color","#000");
		$("#globalModal").modal("show");
	}
}

$(document).on('click','#btnDeleteStepYes', function(){
	var selectedRowIds = $("#jqGrid").jqGrid('getGridParam','selarrrow').map(Number);
	var gridArrayData = $("#jqGrid").jqGrid('getRowData');
	console.log("array data test ***** "+JSON.stringify(gridArrayData));
	for(var i=0;i<selectedRowIds.length;i++){
		$("#jqGrid").delRowData(selectedRowIds[i]);
	}
	var gridData = $("#jqGrid").jqGrid('getRowData');
	for(var i=0; i<gridData.length;i++){
		//new to parse str to int (step No)
		gridData[i].stepNo = i+1;
	}
	$("#jqGrid").jqGrid('clearGridData');
	$("#jqGrid").jqGrid('setGridParam',{data: gridData});
	$("#jqGrid").trigger("reloadGrid");
	$('.modal-header:visible').find('.close').trigger('click')
	//deleteStep = true;
})

function addTestScriptRow(){
	var flagClass;
	if($("#jqGrid tr").hasClass("ui-state-highlight") == true) {
		flagClass = "true";
		window.localStorage['selectedRowStepNo'] = $("#jqGrid tr.ui-state-highlight td:nth-child(1)").text();
		if($("#jqGrid tr.ui-state-highlight").length > 1) flagClass = "false";
	}
	else flagClass = "false";
	var selectedStepNo = window.localStorage['selectedRowStepNo']
	//$("#jqGrid").trigger("reloadGrid");
	appTypeLocal = "Web";//window.localStorage['appTypeScreen'];
	var emptyRowData = {
			"objectName": "",
			"custname": "",
			"keywordVal": "",
			"inputVal": [""],
			"outputVal": "",
			"stepNo": "",
			"url": "",
			"appType": "Generic"
	};
	
	$("#jqGrid tr").each(function(){
		if($(this).find("td:nth-child(9)").find(".remarksIcon").length > 0){
			$(this).find("td:nth-child(9)").find(".remarksIcon").remove();
		}
	})
	   
	var gridArrayData = $("#jqGrid").jqGrid('getRowData');
	var arrayLength = gridArrayData.length;
	if(arrayLength <= 0){
		gridArrayData.splice(arrayLength,0,emptyRowData);
		gridArrayData[0].stepNo = parseInt("1");
		window.localStorage['emptyTable'] = true;
	}else{
		window.localStorage['emptyTable'] = false;
		if(flagClass == "true"){
			gridArrayData.splice(parseInt(selectedStepNo),0,emptyRowData);
			if(gridArrayData[parseInt(selectedStepNo)+1] == undefined){
				gridArrayData[arrayLength].stepNo = parseInt(gridArrayData[arrayLength-1].stepNo)+1;
			}
			else{
				gridArrayData[parseInt(selectedStepNo)].stepNo = parseInt(gridArrayData[parseInt(selectedStepNo)+1].stepNo)
				//i=gridArrayData[parseInt(selectedStepNo)].stepNo
				for(i=0; i < gridArrayData.length; i++){
					gridArrayData[i].stepNo = i+1;
				}
			}
		} 
		else{
			gridArrayData.splice(arrayLength,0,emptyRowData);
			gridArrayData[arrayLength].stepNo = parseInt(gridArrayData[arrayLength-1].stepNo)+1;
		}
	}
	$("#jqGrid").jqGrid('clearGridData');
	$("#jqGrid").jqGrid('setGridParam',{data: gridArrayData});
	$("#jqGrid").trigger("reloadGrid");

	$("#jqGrid tr:last").focus();
	if(flagClass == "true"){
		$("#jqGrid tr").each(function(){
			if($(this).children("td:nth-child(1)").text() == window.localStorage['selectedRowStepNo']){
				$(this).siblings().removeClass("ui-state-highlight")
				$(this).next().addClass("ui-state-highlight").focus();
			}
		})
		flagClass == "false"
	}
}

function rearrangeTestScriptRow(){
	$("#jqGrid").trigger("reloadGrid");	
	$("#jqGrid").jqGrid("setColProp", "stepNo", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "objectName", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "custname", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "keywordVal", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "inputVal", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "outputVal", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "url", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "appType", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "remarks", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "remarksIcon", {editable: false});
	$("#jqGrid").resetSelection();
	$("#jqGrid").find(">tbody").sortable("enable");
	enabledEdit = "false";
}

var selectedRow;
var rowSelect;
var selectedRowIds;
var lastSelectedRowId

//Edit Testscript Row
function editTestCaseRow(){
	var rowSelect = $(document).find(".ui-state-highlight").children("td:nth-child(1)").text();
	if(rowSelect == "" || rowSelect == " "){
		$("#globalModal").find('.modal-title').text("Edit Testcase step");
		$("#globalModal").find('.modal-body p').text("Select step to edit.").css('color','black');
		$("#globalModal").modal("show");		
	}
	else{
		var editSelRow = parseInt(rowSelect) + parseInt(1);
		var rowIsChecked =  $(document).find(".ui-state-highlight").find(".cbox").is(":checked");
		var checkedLen = $(".cbox:checked").length;	
		$("#jqGrid").jqGrid("setColProp", "stepNo", {editable: false });
		$("#jqGrid").jqGrid("setColProp", "objectName", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "custname", {editable: true});
		$("#jqGrid").jqGrid("setColProp", "keywordVal", {editable: true});
		$("#jqGrid").jqGrid("setColProp", "inputVal", {editable: true});
		$("#jqGrid").jqGrid("setColProp", "outputVal", {editable: true});
		$("#jqGrid").jqGrid("setColProp", "url", {editable: true});
		$("#jqGrid").jqGrid("setColProp", "appType", {editable: true});
		$("#jqGrid").resetSelection();
		$("#jqGrid").trigger("reloadGrid");
		$("#jqGrid").find(">tbody").sortable("disable");
		$(this).focus();
		$("#jqGrid tr").each(function(){
			if(rowSelect == $(this).children("td:nth-child(1)").text() && rowIsChecked == true )
			{
				$(this).focus().addClass("rowHighlight");
				$("tr.rowHighlight").trigger('click');
			}
			else
			{
				$("tr.rowHighlight").removeClass("rowHighlight");
			}
		});
		enabledEdit = "true";
		$("#errorMsg").text('');
		if(rowSelect != "")
		{
			$("tr:nth-child("+editSelRow+")").focus().trigger('click'); //Focus row on checkbox selection
		}
		//Trigger Focus on selected row when multiple rows are checked and unchecked and is not editable
		$("tr.ui-state-highlight").each(function() {
			var checkedLen = $(".cbox:checked").length;
			var editableLen = $(".editable").length;
			if(checkedLen == 1 && editableLen == 0)
			{
				$(this).focus().trigger('click');
			}
		});
	}
}

//Copy-Paste TestStep Functionality
function copyTestStep(){
	emptyTestStep = "false";
	var taskInfo = JSON.parse(window.localStorage['_T']);
	if(!$(document).find(".cbox:checked").parent().parent("tr").hasClass("ui-state-highlight")){
		$("#globalModal").find('.modal-title').text("Copy Testcase step");
		$("#globalModal").find('.modal-body p').text("Select step to copy").css('color','black');
		$("#globalModal").modal("show");
	}
	else{
		getSelectedRowData = [];
		getRowJsonCopy = [];
		getSelectedRowData = $(document).find(".cbox:checked").parent().parent("tr.ui-state-highlight")
		$.each(getSelectedRowData, function(){
			if($(this).children(":nth-child(5)").html() == "&nbsp;"){
				emptyTestStep = "true";
				$("#globalModal").find('.modal-title').text("Copy Test Step");
				$("#globalModal").find('.modal-body p').text("The operation cannot be performed as the steps contains invalid/blank object references").css('color','black');
				$("#globalModal").modal("show");
				getSelectedRowData = [];
				getRowJsonCopy = [];
				return false
			}
			else{
				getRowJsonCopy.push({
					"objectName"	: $(this).children("td:nth-child(4)").text().trim(),
					"custname"		: $(this).children("td:nth-child(5)").text(),
					"keywordVal"	: $(this).children("td:nth-child(6)").text(),
					"inputVal"		: $(this).children("td:nth-child(7)").text(),
					"outputVal"		: $(this).children("td:nth-child(8)").text().trim(),
					"stepNo"		: parseInt($(this).children("td:nth-child(1)").text()),
					"remarksIcon"		: $(this).children("td:nth-child(9)").text(),
					"remarks"		: $(this).children("td:nth-child(10)").text(),
					"url"			: $(this).children("td:nth-child(11)").text().trim(),
					"appType"		: $(this).children("td:nth-child(12)").text()					
				});
			}
		});
		//Reloading Row
		$("#jqGrid").trigger("reloadGrid");	
		$("#jqGrid").jqGrid("setColProp", "stepNo", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "objectName", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "custname", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "keywordVal", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "inputVal", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "outputVal", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "url", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "appType", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "remarks", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "remarksIcon", {editable: false});
		$("#jqGrid").resetSelection();
		$("#jqGrid").find(">tbody").sortable("enable");
		anotherScriptId = JSON.parse(window.localStorage['_T']).testCaseId;//window.localStorage['testScriptIdVal'];
		getAppTypeForPaste = taskInfo.appType;//window.localStorage['appTypeScreen']
	}
}
//Need to work
function pasteTestStep(){
	if(getRowJsonCopy == [] || getRowJsonCopy == undefined || getRowJsonCopy.length <= 0){
		$("#globalModal").find('.modal-title').text("Paste Testcase step");
		$("#globalModal").find('.modal-body p').text("Copy steps to paste").css('color','black');
		$("#globalModal").modal("show");
	}
	else{
		if(anotherScriptId != JSON.parse(window.localStorage['_T']).testCaseId){
			if (emptyTestStep == "true" || getRowJsonCopy == undefined) return false
			else if(getAppTypeForPaste != "Web") return false
			else{
				$("#globalModalYesNo").find('.modal-title').text("Paste Test Step");
				$("#globalModalYesNo").find('.modal-body p').text("Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?").css('color','black');
				$("#globalModalYesNo").find('.modal-footer button:nth-child(1)').attr("id","btnPasteTestStepYes")
				$("#globalModalYesNo").modal("show");
				//showDialogMesgsYesNo("Paste Test Step", "Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?", "btnPasteTestStepYes", "btnPasteTestStepNo")
			}
		} 
		else{
			if (emptyTestStep == "true" || getRowJsonCopy == undefined) return false
			else if($("#jqGrid").jqGrid('getRowData').length == 1 && $("#jqGrid").jqGrid('getRowData')[0].custname == "") showDialogMesgsYesNo("Paste Test Step", "Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?", "btnPasteTestStepYes", "btnPasteTestStepNo")
			else{
				$("#modalDialog-inputField").find('.modal-title').text("Paste Test Step");
				$("#modalDialog-inputField").find('#labelContent').html("Paste after step no: </br><span style='font-size:11px; color: #000;'>For multiple paste. Eg: 5;10;20</span>").css('color','black');				
				$("#modalDialog-inputField").find('.modal-footer button').attr("id","btnPasteTestStep");
				$("#modalDialog-inputField").find('#getInputData').attr("placeholder","Enter a value");
				$("#modalDialog-inputField").find('#getInputData').addClass("copyPasteValidation");
				$("#modalDialog-inputField").find('#errorMsgs1').text("*Textbox cannot be empty");
				$("#modalDialog-inputField").find('#errorMsgs2').text("*Textbox cannot contain characters other than numbers seperated by single semi colon");
				$("#modalDialog-inputField").find('#errorMsgs3').text("*Please enter a valid step no");
				$("#modalDialog-inputField").modal("show");
				//createDialogsCopyPaste("Paste Test Step", "Paste after step no:<br/><span style='font-size:11px;'>For multiple paste, provide step numbers separated by semicolon Eg: 5;10;20</span>", "*Textbox cannot be empty", "*Textbox cannot contain characters other than numbers seperated by single semi colon", "*Please enter a valid step no", "btnPasteTestStep");
				/*$("#btnPasteTestStep").text("Paste")
				$("#textBoxID").css({'margin-bottom':'0'})*/
			}
		}
	}	
}
// TO Clear Input Val on Close of Bootstrap Modal Dialog
$(document).on('hide.bs.modal','#modalDialog-inputField', function () {
              $("#getInputData").val('')
});

$(document).on("click", "#btnPasteTestStepYes", function(){
	$("#globalModalYesNo").find('.modal-footer button:nth-child(2)').trigger("click");
	if($("#jqGrid tr.ui-widget-content td:nth-child(5)").html() == "&nbsp;" && $("#jqGrid tr.ui-widget-content").length == 1){
		pasteInGrid()
	}
	else{
		$("#modalDialog-inputField").find('.modal-title').text("Paste Test Step");
		$("#modalDialog-inputField").find('#labelContent').text("Paste after step no: </br><span style='font-size:11px; color: #000;'>For multiple paste. Eg: 5;10;20</span>").css('color','black');
		//$("</br><span style='font-size:11px; color: #000;'>For multiple paste. Eg: 5;10;20</span>").insertAfter('#labelContent');
		$("#modalDialog-inputField").find('.modal-footer button').attr("id","btnPasteTestStep");
		$("#modalDialog-inputField").find('#getInputData').attr("placeholder","Enter a value");
		$("#modalDialog-inputField").find('#getInputData').addClass("copyPasteValidation");
		$("#modalDialog-inputField").modal("show");
		/*createDialogsCopyPaste("Paste Test Step", "Paste after step no:<br/><span style='font-size:11px;'>For multiple paste, provide step numbers separated by semicolon Eg: 5;10;20</span>", "*Textbox cannot be empty", "*Textbox cannot contain characters other than numbers seperated by single semi colon", "*Please enter a valid step no", "btnPasteTestStep");
		$("#btnPasteTestStep").text("Paste")
		$("#textBoxID").css({'margin-bottom':'0'})*/
	}
})

$(document).on("click","#btnPasteTestStep", function(){
	var chkNo;
	var selectedStepNo = [];
	var proceed = true;
	$("#errorMsgs1, #errorMsgs2, #errorMsgs3").hide();
	if(!$("#getInputData").val()) $("#errorMsgs1").show();
	else{
		//$(document).find(".dialogContent").append('<img src="imgs/loader1.gif" class="domainLoader" style="bottom: 20px; left: 20px;" />')
		chkNo = $("#getInputData").val().split(";");

		if(chkNo.length > 1){
			selectedStepNo.push(parseInt(chkNo[0]));
			for(j=1; j<chkNo.length; j++){
				selectedStepNo.push(parseInt(chkNo[j])+(getRowJsonCopy.length * selectedStepNo.length));
			}
		}
		else selectedStepNo.push(chkNo[0]);
		for(i=0; i<chkNo.length; i++){
			if(isNaN(parseInt(chkNo[i]))){
				$("#errorMsgs2").show();
				proceed = false;
				break;
			}
			else if(parseInt(chkNo[i]) > $("#jqGrid tr").length || parseInt(chkNo[i]) < 0){
				$("#errorMsgs3").show();
				proceed = false;
				break;
			}
		}
		if(proceed == true){
			for(i=0; i<selectedStepNo.length; i++){
				pasteSelecteStepNo = selectedStepNo[i];
				pasteInGrid();
			}
			/*$('.domainLoader').remove();
			$("#dialogOverlay, #dialogContainer").remove();*/
			$("#modalDialog-inputField").find(".close").trigger("click");
		}
	}	
})

$(document).on('keypress', '.copyPasteValidation', function(e){
	if((e.charCode >= 48 && e.charCode <= 57) || e.charCode == 59) return true;
	else return false;
}).blur(function(){
	var reg = /^[0-9;]+$/;
	if(reg.test($(this).val())){
		return true;
	}else{
		$(this).val('');
		return false;
	}
})

function pasteInGrid(){
	var gridData = $("#jqGrid").jqGrid('getRowData');
	var increaseSplice; var getRowJsonCopyTemp = [];
	var newVal = parseInt(pasteSelecteStepNo);
	if(gridData.length == 1 && gridData[0].custname == ""){
		gridData.splice(gridData[0],1)
		for(k=0; k<getRowJsonCopy.length; k++){
			gridData.push(getRowJsonCopy[k])
		}
	}
	else{
		if(pasteSelecteStepNo > 0){
			for(i=0; i<gridData.length; i++){
				if(gridData[i].stepNo == pasteSelecteStepNo){
					for(j=0; j<getRowJsonCopy.length; j++){
						getRowJsonCopy[j].stepNo = parseInt(gridData[i].stepNo) + 1
						if(increaseSplice == "true") gridData.splice(newVal,0,getRowJsonCopy[j]);
						else gridData.splice(pasteSelecteStepNo,0,getRowJsonCopy[j]);
						//ReArranging Step No
						for(var l=0; l<gridData.length;l++) gridData[l].stepNo = l+1;
						//ReArranging Step No
						increaseSplice = "true";
						newVal++
					}
				}
			}
		}
		else{
			for(i=0; i<getRowJsonCopy.length; i++){
				getRowJsonCopyTemp.push(getRowJsonCopy[i]);
			}
			for(j=0; j<gridData.length;j++){
				getRowJsonCopyTemp.push(gridData[j]);
				for(var l=0; l<getRowJsonCopyTemp.length;l++) getRowJsonCopyTemp[l].stepNo = l+1;
			}
			gridData = [];
			for(k=0; k<getRowJsonCopyTemp.length; k++){
				gridData.push(getRowJsonCopyTemp[k]);
			}
		}

	}
	$("#jqGrid").jqGrid('clearGridData');
	$("#jqGrid").jqGrid('setGridParam',{data: gridData});
	$("#jqGrid").trigger("reloadGrid");
	if(pasteSelecteStepNo > 0){
		for(var i=parseInt(pasteSelecteStepNo)+1; i<=parseInt(pasteSelecteStepNo)+getRowJsonCopy.length; i++){
			$.each($("#jqGrid tr"), function(){
				if(parseInt($(this).children("td:nth-child(1)").text()) == i){				
					$(this).find("input.cbox").trigger("click")
					return false;
				}
			})
		}
	}
	else{
		for(var i=parseInt(pasteSelecteStepNo)+1; i<=getRowJsonCopy.length; i++){
			$.each($("#jqGrid tr"), function(){
				if(parseInt($(this).children("td:nth-child(1)").text()) == i){				
					$(this).find("input.cbox").trigger("click")
					return false;
				}
			})
		}
	}

}
//Copy-Paste TestStep Functionality

//Commenting TestScript Row
function commentStep(){
	if($(document).find(".ui-state-highlight").length > 0){
		var getOutputVal = $(document).find(".ui-state-highlight").children("td[aria-describedby='jqGrid_outputVal']").text();
		if(!getOutputVal.match("##") && !getOutputVal.match(";##")){
			var myData = $("#jqGrid").jqGrid('getGridParam','data')
			var selectedRowIds = $("#jqGrid").jqGrid('getGridParam','selarrrow').map(Number);
			selectedRowIds = selectedRowIds.sort();
			$(document).find(".ui-state-highlight").children("td[aria-describedby='jqGrid_outputVal']").each(function() {
				var outputValLen = $(this).text().trim().length;
				var outputHashMatch = $(this).text().match("##");
				if(outputValLen == 0){
					for(i=0; i<myData.length; i++){
						if($.inArray(myData[i].stepNo, (selectedRowIds)) != -1 && (myData[i].outputVal == "")) {
							myData[i].outputVal = "##";
							$("#jqGrid").trigger("reloadGrid");
						}
						else if($.inArray(myData[i].stepNo, (selectedRowIds.map(String))) != -1 && (myData[i].outputVal == "")) {
							myData[i].outputVal = "##";
							$("#jqGrid").trigger("reloadGrid");
						}
					}
				}
				else if(outputValLen != 0 &&  outputHashMatch == null)
				{
					for(i=0; i<myData.length; i++){
						if(($.inArray(myData[i].stepNo, (selectedRowIds) ) != -1 && myData[i].outputVal != "")) {
							if(myData[i].outputVal.match(";##") == null && myData[i].outputVal != "##")
							{
								myData[i].outputVal = myData[i].outputVal.concat(";##");
								$("#jqGrid").trigger("reloadGrid");
							}								
						}
						else if(($.inArray(myData[i].stepNo, (selectedRowIds.map(String)) ) != -1 && myData[i].outputVal != "")) {
							if(myData[i].outputVal.match(";##") == null && myData[i].outputVal != "##"){
								myData[i].outputVal = myData[i].outputVal.concat(";##");
								$("#jqGrid").trigger("reloadGrid");
							}
						}
					}
				}
			});
		}
		else{
			var myData = $("#jqGrid").jqGrid('getGridParam','data')
			var selectedRowIds = $("#jqGrid").jqGrid('getGridParam','selarrrow').map(Number);
			selectedRowIds = selectedRowIds.sort();
			$(document).find(".ui-state-highlight").children("td[aria-describedby='jqGrid_outputVal']").each(function() {
				var outputValLen = $(this).text().trim().length;
				var outputHashMatch = $(this).text().match("##");
				if(outputValLen != 0 &&  outputHashMatch != null)
				{
					for(i=0; i<myData.length; i++){
						if(($.inArray(myData[i].stepNo, (selectedRowIds) ) != -1 && myData[i].outputVal != "")) {
							if(myData[i].outputVal.match("##") == '##' && myData[i].outputVal.length > 2)
							{
								var lastThree = myData[i].outputVal.substr(myData[i].outputVal.length - 3);
								if (lastThree == ";##")
								{
									myData[i].outputVal = 	myData[i].outputVal.replace(lastThree,"");
									$("#jqGrid").trigger("reloadGrid");
								}
							}
							else if(myData[i].outputVal.match("##") == '##' && myData[i].outputVal.length == 2){
								var lastTwo = myData[i].outputVal.substr(myData[i].outputVal.length - 2);
								myData[i].outputVal = 	myData[i].outputVal.replace(lastTwo,"");
								$("#jqGrid").trigger("reloadGrid");
							}						
						}
						else if(($.inArray(myData[i].stepNo, (selectedRowIds.map(String)) ) != -1 && myData[i].outputVal != "")) {
							if(myData[i].outputVal.match("##") == '##' && myData[i].outputVal.length > 2)
							{
								var lastThree = myData[i].outputVal.substr(myData[i].outputVal.length - 3);
								if (lastThree == ";##")
								{
									myData[i].outputVal = 	myData[i].outputVal.replace(lastThree,"");
									$("#jqGrid").trigger("reloadGrid");
								}
							}
							else if(myData[i].outputVal.match("##") == '##' && myData[i].outputVal.length == 2){
								var lastTwo = myData[i].outputVal.substr(myData[i].outputVal.length - 2);
								myData[i].outputVal = 	myData[i].outputVal.replace(lastTwo,"");
								$("#jqGrid").trigger("reloadGrid");
							}
						}
					}
				}
			});
		}
	}
	else{
		$("#globalModal").find('.modal-title').text("Skip Testcase step");
		$("#globalModal").find('.modal-body p').text("Please select step to skip").css('color','black');
		$("#globalModal").modal("show");
	}
}

function getTags(data) {
	var obnames = [];
	var appTypeLocal = "Web"//window.localStorage['appTypeScreen'];
		if(appTypeLocal == "Web"){
			obnames.push("@Generic");
			obnames.push("@Excel");
			obnames.push("@Custom");
			obnames.push("@Browser");
			obnames.push("@BrowserPopUp");
		}
		else if(appTypeLocal == "Webservice"){
			obnames.push("@Generic");
			obnames.push("@Excel");
			obnames.push("WebService List");
		}
		else if(appTypeLocal == "Mainframe"){
			obnames.push("@Generic");
			obnames.push("@Excel");
			obnames.push("Mainframe List");
		}
		else if(appTypeLocal == "Desktop"){
			obnames.push("@Generic");
			obnames.push("@Excel");
			obnames.push("@Window");
			obnames.push("@Custom");
			obnames.push("@Email");
		}
		else if(appTypeLocal == "DesktopJava")	{
			obnames.push("@Generic");
			obnames.push("@Excel");
			obnames.push("@Oebs");
			obnames.push("@Custom");
		}
		else if(appTypeLocal == "Mobility")	{
			obnames.push("@Generic");
			obnames.push("@Mobile");
			obnames.push("@Action");
		}
		else if(appTypeLocal == "MobilityiOS")	{
			obnames.push("@Generic");
			obnames.push("@MobileiOS");
		}
	for (var i=0; i<data.length; i++){
		obnames.push(data[i].custname);
	}
	return obnames;
}

function getKeywordList(data) {
	var arr = data.defaultList;
	var keywordList = [];
	for (var i=0; i<arr.length; i++){
		keywordList.push(arr[i]);
	}
	return keywordList;
}