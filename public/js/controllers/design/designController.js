var screenshotObj,scrapedGlobJson,enableScreenShotHighlight,mirrorObj,emptyTestStep,anotherScriptId,getAppTypeForPaste, eaCheckbox, finalViewString, scrapedData, deleteFlag;
var initScraping = {}; var mirrorObj = {}; var scrapeTypeObj = {}; var viewString = {}; var scrapeObject = {};
var selectRowStepNoFlag = false; var deleteStep = false;
var getAllAppendedObj; //Getting all appended scraped objects
mySPA.controller('designController', ['$scope', '$http', '$location', '$timeout', 'DesignServices','cfpLoadingBar', function($scope,$http,$location,$timeout,DesignServices, cfpLoadingBar) {
	$("body").css("background","#eee");
	$("#tableActionButtons, .designTableDnd").delay(500).animate({opacity:"1"}, 500)
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
	}, 500)

	//Task Listing
	loadUserTasks()

	cfpLoadingBar.start()
	$timeout(function(){
		if(window.location.href.split("/")[3] == "designTestScript"){
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

	$scope.readTestCase_ICE = function()	{
		var taskInfo = JSON.parse(window.localStorage['_T']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		enabledEdit = "false"
			// service call # 1 - getTestScriptData service call
			DesignServices.readTestCase_ICE(screenId, testCaseId)	
			.then(function(data) {
				var appType = "Web";
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
					var recievedData = JSON.parse(data2.scrapeObj);
					window.localStorage['newTestScriptDataList'] = angular.toJson(recievedData.view);
					$scope.newTestScriptDataLS = recievedData.view;
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
					if (data == "" || data == null || data == emptyStr || data == "[]" || data.testcase.toString() == "" || len == 1)	{
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
						window.localStorage['testScriptTableData'] = angular.toJson(datalist);
						$("#jqGrid").jqGrid('GridUnload');
						$("#jqGrid").trigger("reloadGrid");
						if(data.testcase[0].comments!=null || data.testcase[0].comments!=""){
							comments=data.testcase[0].comments;
						}
						contentTable($scope.newTestScriptDataLS);
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
						window.localStorage['testScriptTableData'] = angular.toJson(data);
						var testcase = JSON.parse(JSON.parse(window.localStorage['testScriptTableData']).testcase);
						var testcaseArray = [];
						for(var i = 0; i < testcase.length; i++)	{
							testcaseArray.push(testcase[i]);
							/*if(testcase[i].hasOwnProperty('comments')){
							if($('#commentField').val() == testcase[i].comments){

							}
							else if(testcase[i].comments == "" || testcase[i].comments == " " || testcase[i].comments == null){
								$('#commentField').val('');
							}
							else{
								$('#commentField').val(testcase[i].comments);							
							}
						}else{
							testcaseArray.push(testcase[i]);
						}*/						
						}				
						window.localStorage['testScriptTableData'] = JSON.stringify(testcaseArray)
						$("#jqGrid_addNewTestScript").jqGrid('clearGridData');
						$("#jqGrid").jqGrid('GridUnload');
						$("#jqGrid").trigger("reloadGrid");
						contentTable($scope.newTestScriptDataLS);
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
						if(selectRowStepNoFlag == true){
							if($("#jqGrid").find("tr[id='"+window.localStorage['selectRowStepNo']+"']").prev('tr[class="ui-widget-content"]').length > 0){
								//$("#jqGrid").find("tr[id='"+window.localStorage['selectRowStepNo']+"']").trigger('click');
								$("#jqGrid").find("tr[id='"+window.localStorage['selectRowStepNo']+"']").prev().focus();
							}else{
								//$("#jqGrid").find("tr[id='"+window.localStorage['selectRowStepNo']+"']").focus().trigger('click');
							}					
							selectRowStepNoFlag = false;
						}
						return;
					}
				},
				function(error) {	console.log("Error in designController.js file getObjectType method! \r\n "+(error.data));
				}); //	getScrapeData end
			},
			function(error) {	console.log("Error in designController.js file getTestScriptData method! \r\n "+(error.data));	
			});
	};//	getTestScriptData end

	//Populating Saved Scrape Data
	$scope.getScrapeData = function(){
		$("#enableAppend").prop("checked", false)
		if($("#finalScrap").find("#scrapTree").length == 0){
			$(".disableActions").addClass("enableActions").removeClass("disableActions");
			$("#enableAppend").prop("disabled", true)
		}
		else{
			$(".enableActions").addClass("disableActions").removeClass("enableActions");
			$("#enableAppend").prop("disabled", false)
		}
		enableScreenShotHighlight = true;
		DesignServices.getScrapeDataScreenLevel_ICE() 
		.then(function(data){
			if(deleteFlag  == true) console.log("inside delete", data);
			else{
				console.log("inside save", data);
				viewString = JSON.parse(JSON.parse(data.scrapeObj));
			}
			$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").empty()
			$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrape"><img id="screenshot" src="data:image/PNG;base64,'+viewString.mirror+'" /></div>')
			$("#finalScrap").empty()
			if (jQuery.isEmptyObject(viewString)){	
				console.log("Data is Empty");
				$(".disableActions").addClass("enableActions").removeClass("disableActions");
				$("#enableAppend").prop("disabled", true)
				return;
			}
			else{
				console.log("Data There");
				$(".enableActions").addClass("disableActions").removeClass("enableActions");
				$("#enableAppend").prop("disabled", false)
			}
			console.log("response data: ", viewString);
			$("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox'><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-xs btn-xs-custom objBtn' style='margin-left: 10px'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 0' disabled>Delete</button></span><span></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
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
				var data = JSON.stringify(data);
				var scrapeJson = JSON.parse(data);
				screenshotObj = scrapeJson;
				$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").empty()
				$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrape"><img id="screenshot" src="data:image/PNG;base64,'+data[1].mirror+'" /></div>')
				initScraping = scrapeJson[0];

				mirrorObj = scrapeJson[1];
				scrapeTypeObj = scrapeJson[2];


				$("#finalScrap").empty()
				$("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox'><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-xs btn-xs-custom objBtn' style='margin-left: 10px'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 0' disabled>Delete</button></span><span></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
				var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');

				//If enable append is active
				if(eaCheckbox){
					//Getting the Existing Scrape Data


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
					//Getting the Existing Scrape Data

					generateScrape()

					//Getting appended scraped object irrespective to the dynamic value
					function generateScrape(){
						var tempId = viewString.view.length - 1;
						for (var i = 0; i < initScraping.view.length; i++) { 
							tempId++
							var path = initScraping.view[i].xpath;
							var ob = initScraping.view[i];

							var custN = ob.custname.replace(/[<>]/g, '').trim();
							var tag = ob.tag;
							if(tag == "dropdown"){imgTag = "select"}
							else if(tag == "textbox/textarea"){imgTag = "input"}
							else imgTag = tag;
							var tag1 = tag.replace(/ /g, "_");
							var tag2;

							if(tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell"){
								var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
							} 
							else {


								var li = "<li data-xpath='"+ob.xpath+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
							}
							angular.element(innerUL).append(li);
							viewString.view.push(initScraping.view[i])
						}
						viewString.mirror = mirrorObj.mirror
					}
					//Getting appended scraped object irrespective to the dynamic value
				}
				//If enable append is active

				//If enable append is inactive
				else{
					//Before Saving the Scrape JSON to the Database
					for (var i = 0; i < initScraping.view.length; i++) { 
						var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');
						var path = initScraping.view[i].xpath;
						var ob = initScraping.view[i];
						ob.tempId= i;
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
					initScraping.mirror = mirrorObj.mirror

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
				if(data.length > 0) $("#saveObjects").removeClass('hide');
				else $("#saveObjects").addClass('hide');
			}, function (error) { console.log("Fail to Load design_ICE") });
		}
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
			}, function(error) { });
		}    
	};
	//Highlight Element on browser

	//Save ScrapeData Objects into Database
	$(document).on('click', "#saveObjects", function(){
		debugger;
		var tasks = JSON.parse(window.localStorage['_T']);
		if(eaCheckbox) var getScrapeData = angular.toJson(viewString);
		else var getScrapeData = angular.toJson(initScraping);

		//var getScrapeData = angular.toJson(screenshotObj);
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

		DesignServices.updateScrapeData_ICE(scrapeObject)
		.then(function(data){
			if(data == "success"){
				deleteFlag = false;
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

		}, function(error){})

	})
	//Save ScrapeData Objects into Database

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
				$("#jqGrid tr").children("td[aria-describedby='jqGrid_outputVal']").each(function(){
					if($(this).text().trim() == "##" || $(this).is(":contains(';##')")){
						$(this).parent().css("background","#D5E7FF").focus();
					}
				})
				//#D5E7FF  DBF5DF
				var serviceCallFlag = false;
				var mydata = $("#jqGrid").jqGrid('getGridParam','data');		 
				for(var i=0; i<mydata.length;i++){
					//new to parse str to int (step No)
					if(mydata[i].url == undefined){mydata[i].url="";}
					mydata[i].stepNo = i+1;
					//check - keyword column should be mandatorily populated by User
					if(mydata[i].custname == undefined || mydata[i].custname == ""){
						var stepNoPos = parseInt(mydata[i].stepNo);
						$("#globalModal").find('.modal-title').text("Save Testcase");
						$("#globalModal").find('.modal-body p').text("Please select Object Name at Step No. ",stepNoPos).css('color','black');
						$("#globalModal").modal("show");
						serviceCallFlag  = true;
						break;
					}
					else{
						mydata[i].custname = mydata[i].custname.trim();
						if(mydata[i].keywordVal == undefined || mydata[i].keywordVal == ""){
							var stepNoPos = parseInt(mydata[i].stepNo);
							window.localStorage['stepNoPos'] = stepNoPos;
							$("#globalModal").find('.modal-title').text("Save Testcase");
							$("#globalModal").find('.modal-body p').text("Please select Object Name at Step No. ",stepNoPos).css('color','black');
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
				}
				if(serviceCallFlag  == true)
				{
					console.log("no service call being made");
				}
				else{
					DesignServices.updateTestCase_ICE(screenId,testCaseId,testCaseName,mydata,userInfo)
					.then(function(data){
						if(data == "Success"){
							/*if(window.localStorage['UITSCrtd'] == "true") window.localStorage['UITSCrtd'] = "false"
		        			else{
		        				$("#tabs,#tabo2,#tabo1").tabs("destroy");
		        				showDialogMesgsBtn("Save Test Script", "Test Script saved successfully", "btnSave");
		        				selectRowStepNoFlag = true;
			        			$("#tabs,#tabo2,#tabo1").tabs();
		        			}*/
							angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
							if(deleteStep == false){
								selectRowStepNoFlag = true;
								$("#globalModal").find('.modal-title').text("Save Testcase");
								$("#globalModal").find('.modal-body p').text("Testcase saved successfully").css('color','black');
								$("#globalModal").modal("show");
							}
							else{
								$("#globalModal").find('.modal-title').text("Delete Testcase step");
								$("#globalModal").find('.modal-body p').text("Successfully delete the steps").css('color','black');
								$("#globalModal").modal("show");
								deleteStep = false;
							}
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
}]);

//Loading table action buttons
function contentTable(newTestScriptDataLS) {
	//get keyword list
	var keywordArrayList = window.localStorage['keywordListData'];
	keywordArrayList = JSON.parse(keywordArrayList);
	testContent = JSON.parse(window.localStorage['testScriptTableData']);
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
		           { label: 'Step No', 	name: 'stepNo', key:true, width: 50,  editable: false, sortable:false, resizable:false,  key:true, hidden: true},
		           { name: 'objectName', width: 0, editable: false, sortable:false, resizable:false, hidden: true},
		           { label: 'Object Name', name: 'custname', width: 250, editable: true,  resizable:false, sortable:false, 
		        	   edittype:'select', 
		        	   editoptions : {
		        		   value : getTags(scrappedData),
		        		   dataEvents : [{            					
		        			   type : 'change',
		        			   'fn' : editCell
		        		   }]
		        	   }
		           },
		           { label: 'Keyword', 	name: 'keywordVal',	width: 250, editable: true, resizable:false, sortable:false ,
		        	   edittype:'select',
		        	   editoptions :{
		        		   value : getKeywordList(keywordArrayList),
		        		   dataEvents : [{            					
		        			   type : 'change' ,
		        			   'fn' : editkeyWord
		        		   }]
		        	   }
		           },
		           { label: 'Input', name: 'inputVal', width: 200, editable: true,  resizable:false, sortable:false },
		           { label: 'Output', name: 'outputVal', width: 150, editable: true,  resizable:false, sortable:false },
		           { label: 'Remark', name: 'remarksIcon', width: 70, editable: false,  resizable:false, sortable:false},
		           { label: 'Remark', name: 'remarks', width: 70, editable: false,  resizable:false, sortable:false, hidden: true},
		           { label: 'URL', 	name: 'url', width: 0, editable: false, resizable:false, hidden:true },
		           { label: 'appType', name: 'appType', width: 0, editable: false, resizable:false, hidden:true }
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
		        	   $("#cb_jqGrid").on('click', function() {
		        		   var cboxParent =  $(this).is(":checked");
		        		   var editableLen = $(".editable").length;
		        		   if (cboxParent == true && editableLen == 0){
		        			   $(".commentIcon,.unCommentIcon,.deleteIcon").show();
		        		   }
		        		   else{
		        			   $(".commentIcon,.unCommentIcon,.deleteIcon").hide();
		        		   }
		        		   window.localStorage['selectRowStepNo']='';
		        	   });		        	   
		        	   $("#jqGrid tr").children("td[aria-describedby='jqGrid_outputVal']").each(function(){
		        		   if($(this).text().trim() == "##" || $(this).is(":contains(';##')")){
		        			   $(this).parent().css("background","#D5E7FF").focus();
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

			if (cboxCheckedLen != 0 && editableLen == 0 ){
				$(".commentIcon,.unCommentIcon,.deleteIcon").show();	
			}
			else{
				$(".commentIcon,.unCommentIcon,.deleteIcon").hide();
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
	$("#jqGrid").bind("jqGridInlineEditRow jqGridInlineAfterSaveRow jqGridInlineAfterRestoreRow", function () {
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
		var appTypeLocal = "Web";//window.localStorage['appTypeScreen'];
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
		var appTypeLocal = "Web";//window.localStorage['appTypeScreen'];
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
	deleteStep = true;
	angular.element(document.getElementById("tableActionButtons")).scope().updateTestCase_ICE();
}

function addTestScriptRow(){
	var flagClass;
	if($("#jqGrid tr").hasClass("ui-state-highlight") == true) {
		flagClass = "true";
		window.localStorage['selectedRowStepNo'] = $("#jqGrid tr.ui-state-highlight td:nth-child(1)").text();
		if($("#jqGrid tr.ui-state-highlight").length > 1) flagClass = "false";
	}
	else flagClass = "false";
	var selectedStepNo = window.localStorage['selectedRowStepNo']
	$("#jqGrid").trigger("reloadGrid");
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
	if(!$(document).find(".cbox:checked").parent().parent("tr").hasClass("ui-state-highlight")) return false
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
					//"remarksIcon"		: $(this).children("td:nth-child(9)").text(),
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
		getAppTypeForPaste = "Web";//window.localStorage['appTypeScreen']
	}
}
//Need to work
function pasteTestStep(){
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
			createDialogsCopyPaste("Paste Test Step", "Paste after step no:<br/><span style='font-size:11px;'>For multiple paste, provide step numbers separated by semicolon Eg: 5;10;20</span>", "*Textbox cannot be empty", "*Textbox cannot contain characters other than numbers seperated by single semi colon", "*Please enter a valid step no", "btnPasteTestStep");
			$("#btnPasteTestStep").text("Paste")
			$("#textBoxID").css({'margin-bottom':'0'})
		}
	}
}

$(document).on("click", "#btnPasteTestStepYes", function(){
	$("#globalModalYesNo").find('.modal-footer button:nth-child(2)').trigger("click");
	if($("#jqGrid tr.ui-widget-content td:nth-child(5)").html() == "&nbsp;" && $("#jqGrid tr.ui-widget-content").length == 1){
		pasteInGrid()
	}
	else{
		createDialogsCopyPaste("Paste Test Step", "Paste after step no:<br/><span style='font-size:11px;'>For multiple paste, provide step numbers separated by semicolon Eg: 5;10;20</span>", "*Textbox cannot be empty", "*Textbox cannot contain characters other than numbers seperated by single semi colon", "*Please enter a valid step no", "btnPasteTestStep");
		$("#btnPasteTestStep").text("Paste")
		$("#textBoxID").css({'margin-bottom':'0'})
	}
})

$(document).on("click","#btnPasteTestStep", function(){
	var chkNo;
	var selectedStepNo = [];
	var proceed = true;
	$("#errorMsgs1, #errorMsgs2, #errorMsgs3").hide();
	if(!$("#textBoxID").val()) $("#errorMsgs1").show();
	else{
		$(document).find(".dialogContent").append('<img src="imgs/loader1.gif" class="domainLoader" style="bottom: 20px; left: 20px;" />')
		chkNo = $("#textBoxID").val().split(";");

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
			$('.domainLoader').remove();
			$("#dialogOverlay, #dialogContainer").remove();
		}
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