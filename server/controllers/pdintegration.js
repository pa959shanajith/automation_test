var uuidV4 = require('uuid-random');
var DOMParser = require('xmldom').DOMParser;
var crypto = require("crypto");
var asynclib = require("async");
var logger = require('../../logger');
var Client = require("node-rest-client").Client;
var epurl = process.env.DAS_URL;
var client = new Client();
var jwt = require('jsonwebtoken')
var utils = require('../lib/utils');

//PD import
exports.pdProcess = function (req, res) {
	try {
		const userid = req.session.userid;
		const role = req.session.activeRoleId;
		// orderlist contains {label:'',type:''}
		var file = JSON.parse(req.body.data.file);
		var sessionID = uuidV4();
		var orderMatrix = file.order;// 2d array list of all possible paths in case of multiple start nodes to guide through the order for mindmap creation
		// var doc = new DOMParser().parseFromString(file,'text/xml');

		// cleanup
		for(var i = 0; i < orderMatrix.length; i++) {
			var templist = orderMatrix[i];
			for(var j = 0; j < templist.length; j++) {
				orderMatrix[i][j].label = templist[j].label.replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'');
			}
		}

		// testcase and screen creation
		var screenshotdatapertask = [],screendataobj = {},orderlist = [],nameMap = {},ordernameidlist = [],screendatamindmap=[];	
		var doc = new DOMParser().parseFromString(file.data,'text/xml');
		var activityJSON = JSON.parse(xml2json(doc).replace("\nundefined",""))
		// in case single task it returns object instead of list so make it list
		if(!activityJSON["mxGraphModel"]["root"]["Task"].length){
			activityJSON["mxGraphModel"]["root"]["Task"] = [activityJSON["mxGraphModel"]["root"]["Task"]];
		}

		// new logic
		//	 for each "task" create screen, testcase
		// 	 for each "if" create testcases 
		activityJSON["mxGraphModel"]["root"]["Task"].forEach(function(eachActivity,eachActivityIdx){
			var adjacentItems = getAdjacentItems(activityJSON,eachActivityIdx,'task');
			screendatamindmap = [];
			var custname_count = {};
			var custnames=[]
			var cust_flag=false
			try{
				screenshotdatapertask = JSON.parse(eachActivity["#cdata"]);	// list of objects
			}
			catch(ex){
				screenshotdatapertask = [];
			}
			// Encrypt for storage
			screenshotdatapertask.forEach(function(a,i){
				if(a['xpath']){
					if(a['apptype']=="WEB"){
						a['url']= encrypt(a['url'])
						xpath_string=a['xpath'].split(';').concat(['null',a['tag']]);
						left_part=encrypt(xpath_string.slice(0,2).join(';'));	// 0,1
						right_part=encrypt(xpath_string.slice(3,).join(';'));	// 3,4...
						a['xpath'] = left_part+';'+xpath_string[2]+';'+right_part;	
					}
					screendatamindmap.push(a);
				}
			});
			//renaming custname of objects
			custnames = screendatamindmap.map(ei => ei.custname);
			custnames.forEach(function(x,i) {
				if(custnames.indexOf(x) != i) {
					cust_flag=true;
					var c = custname_count[x] || 1;
					var j = c + 1;
					var k = x + '(' + j + ')';
					while( custnames.indexOf(k) !== -1 ) {
						k = x + '(' + (++j) + ')';
						custname_count[x] = j;
					}
					custnames[i] = k;
				}
			});
			if(cust_flag){
				for(i=0;i<custnames.length;i++){
					screendatamindmap[i].custname=custnames[i];
				}
			}
			// map data with screenname
			var tempName = eachActivity["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'');		// name id combo
			screendataobj[tempName] = {};
			screendataobj[tempName].data = {"mirror":"","view":screendatamindmap};
			var scrapedObjects = JSON.stringify(screendataobj[tempName].data);
			var parsedScrapedObj = JSON.parse(scrapedObjects);
			scrapedObjects = JSON.stringify(parsedScrapedObj);
			scrapedObjects = JSON.stringify(scrapedObjects);
			scrapedObjects = scrapedObjects.replace(/'+/g, "''");
			var newParse;
			if (scrapedObjects != null && scrapedObjects.trim() != '' && scrapedObjects != undefined) {
				newParse = JSON.parse(scrapedObjects);
			} else {
				newParse = JSON.parse("{}");
			}
			// scrapedObjects = newParse;		
			scrapedObjects = JSON.parse(newParse);	
			screendataobj[tempName].data = scrapedObjects;

			var testCaseOut = generateTestCaseMap(screenshotdatapertask,eachActivityIdx,adjacentItems,sessionID);
			if(testCaseOut.start) orderlist.unshift({'label':tempName,'type':'task'}) // in case of first script
			else orderlist.push({'label':tempName,'type':'task'});
			var requestedtestcasesteps = JSON.stringify(testCaseOut.data);
			requestedtestcasesteps = requestedtestcasesteps.replace(/'+/g, "''");
			screendataobj[tempName].script = JSON.parse(requestedtestcasesteps);
		});

		activityJSON["mxGraphModel"]["root"]["Shape"].forEach(function(eachShape,eachActivityIdx){
			if(eachShape.mxCell['@style']!='rhombus') return;
			var tempName = eachShape["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'');		// name id combo
			screendataobj[tempName] = {};
			screendataobj[tempName].data = {"mirror":"","view":[]};
			var adjacentItems = getAdjacentItems(activityJSON,eachActivityIdx,'rhombus');	// items adjacent to if block
			var testCaseOut = generateTestCaseMap([],eachActivityIdx,adjacentItems,sessionID);
			if(testCaseOut.start) orderlist.unshift({'label':tempName,'type':'rhombus'}) // in case of first script
			else orderlist.push({'label':tempName,'type':'rhombus'});
			screendataobj[tempName].script = testCaseOut.data;
		});

		// data insertion logic
		asynclib.forEachSeries(orderlist, function (nodeObj, savedcallback) {
			var name = nodeObj.label;
			if(screendataobj[name].data.view[0]!=undefined){
				var len1=(screendataobj[name].data.view).length
				var screenshotdeatils = screendataobj[name].data.view[len1-1].screenshot.split(";")[1];
			    var screenshotdata = screenshotdeatils.split(",")[1];
			}else{
				var screenshotdata = "";
			}
			var inputs = {
				'projectid': req.body.data.projectid,
				'screenname': 'Screen_'+name,
				'versionnumber': 0,
				'createdby': userid,
				'createdbyrole': role,
				'modifiedby': userid,
				'modifiedbyrole': role,
				'deleted': false,
				'createdthrough':'PD',
				'screenshot':screenshotdata,
				'scrapedurl':'',
				'createdthrough':'PD',
				'scrapedata': screendataobj[name].data
			};
			ordernameidlist.push({'name':'Screen_'+name,'type':3})

			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};

			client.post(epurl + "create_ice/updateScreenname_ICE", args,
				function (getScrapeDataQueryresult, response) {
					try {
						if (response.statusCode != 200 || getScrapeDataQueryresult.rows == "fail") {
							logger.error("Error occurred in create_ice/updateScreenname_ICE from fetchScrapedData Error Code : ERRDAS");
						} else {
							if(getScrapeDataQueryresult.rows[0]['parent']!=undefined){
								var screenid = getScrapeDataQueryresult.rows[0]['parent'][0];
								var dobjects = getScrapeDataQueryresult.rows;
							}else{
								var screenid = getScrapeDataQueryresult.rows;
								var dobjects = [];
							}
							var inputs = {
								'screenid': screenid,
								'testcasename': 'Testcase_'+name,
								'versionnumber': 0,
								'createdthrough': 'PD',
								'createdby': userid,
								'createdbyrole': role,
								'modifiedby': userid,
								'modifiedbyrole': role,
								'deleted': false,
								'parent':0,
								'dataobjects':dobjects,
								'steps':screendataobj[name].script
							};
							ordernameidlist.push({'name':'Testcase_'+name,'type':4})
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							client.post(epurl + "create_ice/updateTestcasename_ICE", args,
								function (getScrapeDataQueryresult, response) {
									try {
										if (response.statusCode != 200 || getScrapeDataQueryresult.rows == "fail") {
											logger.error("Error occurred in design/getScrapeDataScreenLevel_ICE from fetchScrapedData Error Code : ERRDAS");
										} else {
											savedcallback();		
										}
									} catch (exception) {
										logger.error("Exception: %s",exception);
									}
								}
							);							
						}
					} catch (exception) {
						logger.error("Exception while sending scraped data from the function fetchScrapedData: %s",exception);
					}
				}
			);
		}, function(){
			//final callback
			res.send({"success":true,"data":orderMatrix,"history":activityJSON['mxGraphModel']['@history']});
		});
	} catch(exception) {
		logger.error("Error occurred in pdintegration/pdProcess:", exception);
		res.status(500).send("fail");
	}
};

var getTestcaseStep = function(sno, ob, cn, keyVal, inp, out, url, app) {
	const tsp = {
		"stepNo": sno,
		"objectName": ob || ' ',
		"custname": cn,
		"keywordVal": keyVal,
		"inputVal": inp || [''],
		"outputVal": out || '',
		"remarks": "",
		"url": url || ' ',
		"appType": app,
		"addDetails": "",
		"cord": ''
	}
	if (app == "SAP") delete tsp["url"];
	return tsp;
};

var encrypt = (data) => {
	const cipher = crypto.createCipheriv('aes-256-cbc', 'Nineeteen68@SecureScrapeDataPath', "0000000000000000");
	const encryptedData = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
	return 	encryptedData.toUpperCase();
}

var generateTestCaseMap = function(screendata,idx,adjacentItems,sessionID){
	var testCaseSteps = [],testcaseObj,step = 1;
	var firstScript = false,windowId;
	var temp_screendata=screendata;
	var menu_input='';
	var menu_count=step;
	var mflag=0;
	if(adjacentItems){
		// in case is first script
		// make orderlist global
		// move the script to first
		adjacentItems.sources.forEach(function(item,idx){
			if(item["@label"]=="Start" && screendata[0].apptype=="WEB"){
				firstScript = true;
				testCaseSteps = [getTestcaseStep(1,null,'@Browser','openBrowser',null,null,null,"Web")],step = 2;
			}
			else if(item["@label"]=="Start" && screendata[0].apptype=="SAP"){
				firstScript = true;
				testCaseSteps = [
					getTestcaseStep(1,null,'@Sap','LaunchApplication',null,null,null,"SAP"),
					getTestcaseStep(2,null,'@Sap','ServerConnect',null,null,null,"SAP")
				];
				mflag=1;
				step = 3;
				menu_count=step;
			}
			else if (item["@label"]=="Start" && screendata[0].apptype=="OEBS"){
				firstScript = true;
				testCaseSteps = [getTestcaseStep(1,null,'@Oebs','FindWindowAndAttach',screendata[0].url,null,null,"OEBS")],step = 2;
			}
		});	
	}

	screendata.forEach(function(eachScrapedAction,i){
		testcaseObj = '';
		var key, keycode_map;
		if(eachScrapedAction.apptype=="WEB"){
			if(eachScrapedAction.action){
				if(eachScrapedAction.action.windowId){
					if(windowId && windowId!=eachScrapedAction.action.windowId) {
						testcaseObj = getTestcaseStep(step,null,'@Browser','switchToWindow',null,null,eachScrapedAction.url,"Web");
						testCaseSteps.push(testcaseObj);
						windowId=eachScrapedAction.action.windowId;
						step++;
					}
					else{
						windowId=eachScrapedAction.action.windowId;
					}
				}            
				switch(eachScrapedAction.action.actionName){
					case "openBrowser":
						testcaseObj = getTestcaseStep(step,null,'@Browser','openBrowser',null,null,null,"Web");
						break;
					case "navigate":
						testcaseObj = getTestcaseStep(step,null,'@Browser','navigateToURL',[eachScrapedAction.action.actionData],null,null,"Web");
						break;
					case "click":
						if(eachScrapedAction.tag == "radiobutton") {
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'selectRadioButton',null,null,eachScrapedAction.url,"Web");
						} else if(eachScrapedAction.tag == "checkbox") {
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'selectCheckbox',null,null,eachScrapedAction.url,"Web");
						} else if(eachScrapedAction.tag == "table") {
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'cellClick',null,null,eachScrapedAction.url,"Web");
						} else {
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'click',null,null,eachScrapedAction.url,"Web");
							if(eachScrapedAction.custname.indexOf("_elmnt") !== -1) testcaseObj.keywordVal = 'clickElement';
						}
						break;
					case "inputChange":
						if(eachScrapedAction.action.actionData.split(";").length == 2 && eachScrapedAction.action.actionData.split(";")[1] =='byIndex'){
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,
								'selectValueByIndex',[eachScrapedAction.action.actionData.split(";")[0]],null,eachScrapedAction.url,"Web");                     
						}
						else if(eachScrapedAction.action.actionData.split(";").length == 2 && eachScrapedAction.action.actionData.split(";")[1] =='byIndexes'){
							var selectIdxList = eachScrapedAction.value.split(";")[0].replace(/,/g,';');
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,
								'selectValueByIndex',[selectIdxList],null,eachScrapedAction.url,"Web");
							if(selectIdxList.length > 1) {
								testcaseObj.keywordVal = "selectMultipleValuesByIndexes";
							}
						}
						else {
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,
								'setText',[eachScrapedAction.action.actionData],null,eachScrapedAction.url,"Web")
						}
						break;
                    case "inputReadOnly":
						testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,
								'setText',[eachScrapedAction.action.actionData],null,eachScrapedAction.url,"Web")
						break;
					case "sendKeys":
						key=eachScrapedAction.action.actionData;
						keycode_map = {
							'13': 'Enter'
						}
						testcaseObj = getTestcaseStep(step,null,'@Generic','sendFunctionKeys',[keycode_map[key]],null,null,"Generic")
						break;		
					default:
						break;
				}
				if(testcaseObj){
					testCaseSteps.push(testcaseObj);
					step++;
				}
			}
			else if(eachScrapedAction.tag == "browser_navigate"){
				testcaseObj = getTestcaseStep(step,null,"@Browser",'navigateToURL',[eachScrapedAction.url],null,null,"Web");
				testCaseSteps.push(testcaseObj);
				step++;
			}
			
		}
		//SeleniumToAvo for browser actins
		else if(eachScrapedAction.transitionType  == "reload" || eachScrapedAction.transitionType =="link" || eachScrapedAction.transitionType =="typed"){
            testcaseObj = getTestcaseStep(step,null,"@Browser",'navigateToURL',[eachScrapedAction.url],null,null,"Web");
			testCaseSteps.push(testcaseObj);
			step++;
        }
		//mapping for SAP objects 
		else if(eachScrapedAction.apptype=="SAP" || eachScrapedAction.apptype=="Generic"){
			text = eachScrapedAction.text;
			input = text.split("  ");
			var menu_flg=0;
			var temp_mdata;
			//To concatinate menu objects into one
			if(eachScrapedAction.tag=="GuiMenu"){
				if(mflag==1) temp_mdata=temp_screendata[menu_count-2];
				else temp_mdata=temp_screendata[menu_count]
				if(temp_mdata && temp_mdata.tag=="GuiMenu"){
					menu_flg=1;
					menu_input=menu_input.concat(input+';');
				} else{
					menu_input=menu_input.concat(input);
				}
			}
			if(eachScrapedAction.tag=="tree" && eachScrapedAction.command[0][1]=="expandNode"){
				if(mflag==1) temp_mdata=temp_screendata[menu_count-2];
				else temp_mdata=temp_screendata[menu_count]
				if(temp_mdata && temp_mdata.tag=="tree") menu_flg=1;
			}
				
			if(menu_flg==0){
				if('keyboardshortcut' in eachScrapedAction && eachScrapedAction.tag==''){
					testcaseObj = getTestcaseStep(step,null,"@Generic",'sendFunctionKeys',['Alt+F4'],null,null,"Generic");
				}
				else if(eachScrapedAction.command[0][1]!='sendVKey'){
					switch(eachScrapedAction.tag){
						case "input":
						case "GuiOkCodeField":
							if(eachScrapedAction.command[0][1]!=undefined && eachScrapedAction.command[0][1]=='setFocus')
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SetFocus',null,null,null,"SAP");
							else if(eachScrapedAction.command[0][1]!=undefined && eachScrapedAction.command[0][1]=='text' && input[0]=='')
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SetText',[eachScrapedAction.command[0][2]],null,null,"SAP");
							else
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SetText',[input[0]],null,null,"SAP");
							break;
						case "table":
							if(eachScrapedAction.command[0][1]=="getAbsoluteRow"){
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectRow',[(eachScrapedAction.command[0][2]+1).toString()],null,null,"SAP");
								if(eachScrapedAction.command[1][1]!="selected") testcaseObj.keywordVal = 'UnselectRow';
							}
							else if(eachScrapedAction.command[0][1]=="verticalScrollbar")
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'scrollDown',null,null,null,"SAP");
							else if(eachScrapedAction.command[0][1]=="columns"){
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectColumn',[(eachScrapedAction.command[1][2]+1).toString()],null,null,"SAP");
								if(eachScrapedAction.command[2][1]!="selected") testcaseObj.keywordVal = 'UnselectColumn';
							} else testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'Click',null,null,null,"SAP");
							break;
						case "gridview":
							if(eachScrapedAction.command[0][1]=="selectColumn")
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectColumns',[(eachScrapedAction.command[0][2]).toString()],null,null,"SAP");
							else if(eachScrapedAction.command[0][1]=="pressToolbarButton")
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'PressToolbarButton',[eachScrapedAction.command[0][2]],null,null,"SAP");
							else if(eachScrapedAction.command[0][1]=="modifyCell"){
								var data = eachScrapedAction.command[0].slice(-3);
								var data1 = data.slice(0,2).map(i => 1 + i);
								data1.push(data[2]);
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SetTextInCell',[data1.join(';')],null,null,"SAP");
							}	
							else if(eachScrapedAction.command[0][1]=="setCurrentCell"){
								const cell_inp = eachScrapedAction.command[0].slice(-2).map(i => 1 + i).join(';')
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'ClickCell',[cell_inp],null,null,"SAP");
							}
							else if(eachScrapedAction.command[0][1]=="pressF4")
								testcaseObj = getTestcaseStep(step,null,"@Generic",'sendFunctionKeys',['F4'],null,null,"Generic");
							else testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'Click',null,null,null,"SAP");
							break;
						case "GuiLabel":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'Click',null,null,null,"SAP");
							if(eachScrapedAction.command[0][1]=="setFocus") testcaseObj.keywordVal = 'SetFocus';
							break;
						case "calendar":
							if(eachScrapedAction.command[0][1]=="selectionInterval"){
								cal_range = (eachScrapedAction.command[0][2].split(',')).join(';')
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectRange',[cal_range],null,null,"SAP");
							} else testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'Click',null,null,null,"SAP");
							break;
						case "button":
						case "shell":
						case "toolbar":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'Click',null,null,null,"SAP");
							if(eachScrapedAction.custname.indexOf("_elmnt") !== -1) testcaseObj.keywordVal = 'clickElement';
							break;
						case "GuiStatusbar":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'DoubleClickStatusBar',null,null,null,"SAP");
							break;
						case "GuiTab":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectTab',null,null,null,"SAP");
							break;
						case "select":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname, 'selectValueByText',[input[0]],null,null,"SAP");
							break;
						case "GuiMenu":
							testcaseObj = getTestcaseStep(step,null,'@Sap','SelectMenu',[menu_input],null,null,"SAP");
							break;
						case "GuiSimpleContainer":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname, 'DoubleClickOnCell',[input[0]],null,null,"SAP");
							break;
						case "radiobutton":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectRadioButton',null,null,null,"SAP");
							break;
						case "checkbox":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectCheckbox',null,null,null,"SAP");
							if(eachScrapedAction.command[0][1]=='Unselected') testcaseObj.keywordVal = 'UnSelectCheckbox';
							break;
						case "tree":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectTreeElement',null,null,null,"SAP");
							break;
						case "picture":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'DoubleClick',null,null,null,"SAP");
							break;
						case "text":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SetText',[input[0]],null,null,"SAP");
							break;
						case "GuiModalWindow":
						case "GuiDialogShell":
							if(eachScrapedAction.command[0][1]=='close')
								testcaseObj = getTestcaseStep(step,null,'@Sap','closeWindow',null,null,null,"SAP");
							break;
						default:
							logger.info("Import PD: No match found for "+eachScrapedAction.tag+" for SAP apptype.");
							break;
					}
				}
				else{
					key=eachScrapedAction.command[0][2]
					keycode_map = {
						'1': 'F1', '2': 'F2', '3': 'F3', '4': 'F4', '5': 'F5', '6': 'F6', '7': 'F7', '8': 'F8', '9': 'F9', '10': 'F10', '11': 'ctrl+s', '12': 'f12', '13': 'shift+f1',
						'14': 'shift+f2', '15': 'shift+f3', '16': 'shift+f4', '17': 'shift+f5', '18': 'shift+f6', '19': 'shift+f7', '20': 'shift+f8', '21': 'shift+f9',
						'22': 'shift+ctrl+0', '23': 'shift+f11', '24': 'shift+f12', '25': 'ctrl+f1', '26': 'ctrl+f2', '27': 'ctrl+f3', '28': 'ctrl+f4', '29': 'ctrl+f5',
						'30': 'ctrl+f6', '31': 'ctrl+f7', '32': 'ctrl+f8', '33': 'ctrl+f9', '34': 'ctrl+f10', '35': 'ctrl+f11', '36': 'ctrl+f12', '37': 'ctrl+shift+f1',
						'38': 'ctrl+shift+f2', '39': 'ctrl+shift+f3', '40': 'ctrl+shift+f4', '41': 'ctrl+shift+f5', '42': 'ctrl+shift+f6', '43': 'ctrl+shift+f7', '44': 'ctrl+shift+f8',
						'45': 'ctrl+shift+f9', '46': 'ctrl+shift+f10', '47': 'ctrl+shift+f11', '48': 'ctrl+shift+f12', '70': 'ctrl+e', '71': 'ctrl+f', '72': 'ctrl+/', '73': 'ctrl+\ ',
						'74': 'ctrl+n', '75': 'ctrl+o', '76': 'ctrl+x', '77': 'ctrl+c', '78': 'ctrl+v', '79': 'ctrl+z', '80': 'ctrl+pageup', '81': 'pageup', '82': 'pagedown', '83': 'ctrl+pagedown',
						'84': 'ctrl+g', '85': 'ctrl+r', '86': 'ctrl+p', '0': 'Enter'
					}
					testcaseObj = getTestcaseStep(step,null,'@Generic','sendFunctionKeys',[keycode_map[key]],null,null,"Generic");
				}
				if(testcaseObj){
					testCaseSteps.push(testcaseObj);
					step++;
					menu_count=step;
				}
			} else{
				menu_count++;
			}
		}
		//maping OEBS objects
		else if(eachScrapedAction.apptype=="OEBS"){
			text = eachScrapedAction.text;
			input = text.split("  ");
			switch(eachScrapedAction.tag){
				case "combo box":
				case "list":
					if (eachScrapedAction.custname == '') eachScrapedAction.custname=eachScrapedAction.tag.concat("_elmnt");
					testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectValueByText',[input[0]],null,null,"OEBS");
					break;
				case "push button":
				case "page tab":
					if (eachScrapedAction.custname == '') eachScrapedAction.custname=eachScrapedAction.tag.concat("_elmnt");
					testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'click',null,null,null,"OEBS");
					break;
				case "radio button":
					if (eachScrapedAction.custname == '') eachScrapedAction.custname=eachScrapedAction.tag.concat("_elmnt");
					testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectRadioButton',null,null,null,"OEBS");
					break;
				case "check box":
					if (eachScrapedAction.custname == '') eachScrapedAction.custname=eachScrapedAction.tag.concat("_elmnt");
					testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectCheckbox',null,null,null,"OEBS");
					break;
				case "text":
					if (eachScrapedAction.custname == '') eachScrapedAction.custname=eachScrapedAction.tag.concat("_elmnt");
					testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SetText',[input[0]],null,null,"OEBS");
					break;
				default:
					logger.info("Import PD: No match found for "+eachScrapedAction.tag+" for OEBS apptype.");
					break;
			}
			if(testcaseObj){
				testCaseSteps.push(testcaseObj);
				step++;
			}
		}
	});

	if(adjacentItems){
		// list of sources(only shapes) and targets (assuming only one)
		if(adjacentItems["error"]){
			logger.error("Error in pdProcess:generateTestCaseMap, Err: ", adjacentItems["error"]);
		}
		else{
			// old logic
			// in case target is if
			// 	get next items
			// 	add if step with jumpto those scripts (***outgoing connections equal to number of cases)

			// new logic
			// in case multiple targets, current node is "if" block create if steps
			// otherwise just jump to
			if(adjacentItems.targets.length>1){	// I am if block
				adjacentItems.targets.forEach(function(eachBox,eachBoxIdx){
					  testcaseObj = getTestcaseStep(step,null,"@Generic",'elseIf',null,null,null,"Generic");
					if(eachBoxIdx==0) testcaseObj["keywordVal"] = "if"; 		
					testCaseSteps.push(testcaseObj);
					step++;					
					if(eachBox["@label"]=="End"){// in case of end
						testcaseObj = getTestcaseStep(step,null,"@Generic",'stop',null,null,null,"Generic");
						testCaseSteps.push(testcaseObj);
						step++;
					}
					if(eachBox['mxCell']['@style'] == 'rhombus'){// in case of if
						testcaseObj = getTestcaseStep(step,null,"@Generic",'jumpTo',
							['Testcase_'+eachBox["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'')],null,null,"Generic");
						testCaseSteps.push(testcaseObj);
						step++;
					}	
					else if(eachBox['mxCell']['@style'] == 'task'){	// in case of task
						testcaseObj = getTestcaseStep(step,null,"@Generic",'jumpTo',
							['Testcase_'+eachBox["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'')],null,null,"Generic");
						testCaseSteps.push(testcaseObj);
						step++;								
					}
				});
				// end of if step
				testcaseObj = getTestcaseStep(step,null,"@Generic",'endIf',null,null,null,"Generic");
				testCaseSteps.push(testcaseObj);
				step++;							
			}

			// in case target is activity -> add jumpto activity
			else if(adjacentItems.targets[0]){	// assuming only 1 target // I am activity
				// in case activity target is end -> add end keyword
				if(adjacentItems.targets[0]["@label"]=="End"){	// assuming only 1 target // if end
					testcaseObj = getTestcaseStep(step,null,"@Generic",'stop',null,null,null,"Generic");
					testCaseSteps.push(testcaseObj);
					step++;			
				}	
				else{ // otherwise task or activity
					testcaseObj = getTestcaseStep(step,null,"@Generic",'jumpTo',
						['Testcase_'+adjacentItems.targets[0]["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'')],null,null,"Generic");
					testCaseSteps.push(testcaseObj);
					step++;													
				}
			}
		}
	}
	return {"data":testCaseSteps,"start":firstScript};
}

function xml2json(xml, tab) {
	var X = {
	   toObj: function(xml) {
		  var o = {};
		  if (xml.nodeType==1) {   // element node ..
			 if (xml.attributes.length)   // element with attributes  ..
				for (var i=0; i<xml.attributes.length; i++)
				   o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
			 if (xml.firstChild) { // element has child nodes ..
				var textChild=0, cdataChild=0, hasElementChild=false;
				for (var n=xml.firstChild; n; n=n.nextSibling) {
				   if (n.nodeType==1) hasElementChild = true;
				   else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
				   else if (n.nodeType==4) cdataChild++; // cdata section node
				}
				if (hasElementChild) {
				   if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
					  X.removeWhite(xml);
					  for (var n=xml.firstChild; n; n=n.nextSibling) {
						 if (n.nodeType == 3)  // text node
							o["#text"] = X.escape(n.nodeValue);
						 else if (n.nodeType == 4)  // cdata node
							o["#cdata"] = X.escape(n.nodeValue);
						 else if (o[n.nodeName]) {  // multiple occurence of element ..
							if (o[n.nodeName] instanceof Array)
							   o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
							else
							   o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
						 }
						 else  // first occurence of element..
							o[n.nodeName] = X.toObj(n);
					  }
				   }
				   else { // mixed content
					  if (!xml.attributes.length)
						 o = X.escape(X.innerXml(xml));
					  else
						 o["#text"] = X.escape(X.innerXml(xml));
				   }
				}
				else if (textChild) { // pure text
				   if (!xml.attributes.length)
					  o = X.escape(X.innerXml(xml));
				   else
					  o["#text"] = X.escape(X.innerXml(xml));
				}
				else if (cdataChild) { // cdata
				   if (cdataChild > 1)
					  o = X.escape(X.innerXml(xml));
				   else
					  for (var n=xml.firstChild; n; n=n.nextSibling)
						 o["#cdata"] = X.escape(n.nodeValue);
				}
			 }
			 if (!xml.attributes.length && !xml.firstChild) o = null;
		  }
		  else if (xml.nodeType==9) { // document.node
			 o = X.toObj(xml.documentElement);
		  }
		  else
			 logger.debug("unhandled node type: " + xml.nodeType);
		  return o;
	   },
	   toJson: function(o, name, ind) {
		  var json = name ? ("\""+name+"\"") : "";
		  if (o instanceof Array) {
			 for (var i=0,n=o.length; i<n; i++)
				o[i] = X.toJson(o[i], "", ind+"\t");
			 json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
		  }
		  else if (o == null)
			 json += (name&&":") + "null";
		  else if (typeof(o) == "object") {
			 var arr = [];
			 for (var m in o)
				arr[arr.length] = X.toJson(o[m], m, ind+"\t");
			 json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
		  }
		  else if (typeof(o) == "string")
			 json += (name&&":") + "\"" + o.toString() + "\"";
		  else
			 json += (name&&":") + o.toString();
		  return json;
	   },
	   innerXml: function(node) {
		  var s = ""
		  if ("innerHTML" in node)
			 s = node.innerHTML;
		  else {
			 var asXml = function(n) {
				var s = "";
				if (n.nodeType == 1) {
				   s += "<" + n.nodeName;
				   for (var i=0; i<n.attributes.length;i++)
					  s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
				   if (n.firstChild) {
					  s += ">";
					  for (var c=n.firstChild; c; c=c.nextSibling)
						 s += asXml(c);
					  s += "</"+n.nodeName+">";
				   }
				   else
					  s += "/>";
				}
				else if (n.nodeType == 3)
				   s += n.nodeValue;
				else if (n.nodeType == 4)
				   s += "<![CDATA[" + n.nodeValue + "]]>";
				return s;
			 };
			 for (var c=node.firstChild; c; c=c.nextSibling)
				s += asXml(c);
		  }
		  return s;
	   },
	   escape: function(txt) {
		  return txt.replace(/[\\]/g, "\\\\")
					.replace(/[\"]/g, '\\"')
					.replace(/[\n]/g, '\\n')
					.replace(/[\r]/g, '\\r');
	   },
	   removeWhite: function(e) {
		  e.normalize();
		  for (var n = e.firstChild; n; ) {
			 if (n.nodeType == 3) {  // text node
				if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
				   var nxt = n.nextSibling;
				   e.removeChild(n);
				   n = nxt;
				}
				else
				   n = n.nextSibling;
			 }
			 else if (n.nodeType == 1) {  // element node
				X.removeWhite(n);
				n = n.nextSibling;
			 }
			 else                      // any other node
				n = n.nextSibling;
		  }
		  return e;
	   }
	};
	if (xml.nodeType == 9) // document node
	   xml = xml.documentElement;
	var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
	return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}

var getAdjacentItems = function(activityJSON,taskidx,type){
	// get links
	if(type == 'task')
		var currentTask = activityJSON["mxGraphModel"]["root"]["Task"][taskidx];
	else if (type == 'rhombus')
		var currentTask = activityJSON["mxGraphModel"]["root"]["Shape"][taskidx];

	// get previous links
	var previousLinks = activityJSON["mxGraphModel"]["root"]["Edge"].filter(function(eachLink){
		return eachLink["mxCell"]["@target"] == currentTask["@id"];
	});
	var previousNodes;
	// get next links
	var nextLinks = activityJSON["mxGraphModel"]["root"]["Edge"].filter(function(eachLink){
		return eachLink["mxCell"]["@source"] == currentTask["@id"];
	});	
	var previousLinksSourceList = [];	// list of id of sources
	// get next item
	
	if(previousLinks.length>0){
		// fill source list
		previousLinks.forEach(function(eachLink,eachLinkIdx){
			previousLinksSourceList.push(eachLink["mxCell"]["@source"]);
		})


		//search in shape just to check if node is connected to start node while generating scripts
		var filteredShape = activityJSON["mxGraphModel"]["root"]["Shape"].filter(function(eachShape){
			return previousLinksSourceList.indexOf(eachShape["@id"]) != -1;
		});
		if(filteredShape.length>0){previousNodes = filteredShape}
		else{
			//search in task
			var filteredTask = activityJSON["mxGraphModel"]["root"]["Task"].filter(function(eachTask){
				return previousLinksSourceList.indexOf(eachTask["@id"]) != -1;
			});		
			if(filteredTask.length>0){
				previousNodes = filteredTask;
			}
			else{
				return {"error":"no match found!"};
			}
		}
	}
	// was assuming only 1 end node (target) earlier but since rhombus (if block) is introduced
	// can have multiple next links
	if(nextLinks.length>0){	
		//search in task
		var nextLinksList = [];
		nextLinks.forEach(function(eachNextLink,eachNextLinkIdx){
			nextLinksList.push(eachNextLink["mxCell"]["@target"]);
		})
		var filteredTask = activityJSON["mxGraphModel"]["root"]["Task"].filter(function(eachTask){
			return nextLinksList.indexOf(eachTask["@id"]) != -1;	//assuming only one earlier but now multiple
		});
		var filteredShapes = activityJSON["mxGraphModel"]["root"]["Shape"].filter(function(eachShape){
			return nextLinksList.indexOf(eachShape["@id"]) != -1;
		});		
		return {"sources":previousNodes,"targets":filteredTask.concat(filteredShapes)};
	}
}

exports.getMappedDiscoverUser = async(req,res)=>{
	const fnName = "getMappedDiscoverUser";
	logger.info("Inside UI service " + fnName);
    const userid = req.session.userid;
    try{
        const data = await utils.fetchData({userid: userid}, "plugins/getMappedDiscoverUser", fnName);
        if (data === "fail") return res.status(500).send('fail');
        else if (data.result === 'fail') return res.send('fail');
        else {
            const payload = { 
                username: data.username,
				password: data.password
            }
            const encrptionKey = 'Nineeteen68@SecureDiscovDataPath';
            const cipher = crypto.createCipheriv('aes-256-cbc',encrptionKey , "0000000000000000");
            const encryptedData = cipher.update(JSON.stringify(payload), 'utf8', 'hex') + cipher.final('hex');
            const signatureKey = 'Nineeteen68to@DiscoverySecureAuthToken';
            // creating a json web token and given expiry of token as 5 minutes
            var token = jwt.sign({"encryptToken" : encryptedData.toUpperCase()}, signatureKey,{ expiresIn: 300});
            // return res.send({"url" : data.url, "token" :token});  
			return res.send({"url" : "https://dev.process-discovery.dl.slksoft.com:8088" , "token" :token});
        }
	} catch(exception) {
		logger.error("Error occurred in plugins/getMappedDiscoverUser:", exception);
		return res.status(500).send("fail");
	}
}