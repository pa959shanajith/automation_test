export function prepareTestCaseRows (rows, newLogData, logPath) {
    let stepList = JSON.parse(JSON.stringify(rows));
    let parentIdxStack = ["root"];
    let newStepDict = { "root": [] };
    let logData = String(newLogData) !== "undefined" ? JSON.parse(newLogData) : {};

    let currStepObject = {};
    let testCaseNum = 0;
    let tempStack = [];
    let descArray = [];
    let hasComments = false;
    
    for (let i=0; i<stepList.length; i++) {
        let currStep = stepList[i];

        if (tempStack.length) ++tempStack[tempStack.length - 1];
        if (!currStep.Step && currStep.Keyword === "TestCase Name") {
            newStepDict = updateStepDict(parentIdxStack, newStepDict, i);
            parentIdxStack.push(i);
            newStepDict.root.push(i);
            stepList[i].collapsible = true;
            stepList[i].collapsed = false;
            stepList[i].Step = stepList[i].StepDescription.replace(stepList[i].Keyword, "").replace(": ", "");
            let tcName = stepList[i].StepDescription.replace(": ", "");
            stepList[i].testCaseNum = ++testCaseNum;
            stepList[i].itemNumber = testCaseNum;
            stepList[i].paddingLeft = 40;
            tempStack = [ testCaseNum, 0 ];
            if(tcName) currStepObject = logData[tcName] || {};
            stepList[i].type = "TC";

        }
        else if (currStep.Step === "Start iteration") {
            newStepDict = updateStepDict(parentIdxStack, newStepDict, i);
            stepList[i].childOf = parentIdxStack[parentIdxStack.length-1];
            parentIdxStack.push(i);
            stepList[i].itemNumber = tempStack.join('.');
            stepList[i].paddingLeft = (tempStack.length > 7 ? 7 :tempStack.length)*5+35;
            tempStack.push(0);
            stepList[i].collapsible = true;
            stepList[i].collapsed = false;
            stepList[i].status = "Pass";
            stepList[i].type = "SI";
        }
        else if (currStep.Step === "End iteration") {
            newStepDict = updateStepDict(parentIdxStack, newStepDict, i);
            stepList[i].status = "Pass";
            stepList[i].itemNumber = tempStack.join('.');
            stepList[i].paddingLeft = (tempStack.length > 7 ? 7 :tempStack.length)*5+35;
            stepList[i].childOf = parentIdxStack[parentIdxStack.length-1];
            parentIdxStack.pop();
            tempStack.pop();
            stepList[i].type = "EI";
        }
        else {
            if (stepList[i].Step.includes("Step")) {
                let stepNum = stepList[i].Step.replace('Step', '');
                // stepList[i].Step = "Step "+stepNum;
                stepList[i].logs = currStepObject[stepNum] || {};
                stepList[i].logs[0] = `${logPath}/${stepList[i].logs[0]}`;
            }
            stepList[i].childOf = parentIdxStack[parentIdxStack.length-1];
            stepList[i].itemNumber = tempStack.join('.');
            stepList[i].paddingLeft = (tempStack.length > 7 ? 7 :tempStack.length)*5+35;
            newStepDict = updateStepDict(parentIdxStack, newStepDict, i);
            if (stepList[i].Step === "Terminated" || stepList[i].status === "Terminate") stepList[i].status = "Terminated"
            else stepList[i].status = stepList[i].status || "Pass";
            if (stepList[i].Comments) hasComments = true;
        }

        if (stepList[i].EllapsedTime)
            stepList[i].EllapsedTime = stepList[i].EllapsedTime.slice(0, 8);

        descArray.push({ desc: currStep.StepDescription, id: stepList[i].id });
    }

    return [stepList, stepList, newStepDict, descArray, hasComments];
}

const moduleTypeDict = { 'basic': 'Module', 'batch': 'Batch', 'endtoend': 'End to End' };

export function prepareModuleList (modulesData) {
    let moduleList = [];
    if(Object.keys(modulesData)[0] === "modules") {
        for (let moduleItem of modulesData.modules) {
            let moduleObj = { key: moduleItem._id, text: moduleItem.name, data : { secondaryText: moduleTypeDict[moduleItem.type] }, type: 'module' };
            moduleList.push(moduleObj);
        }
    }
    if(Object.keys(modulesData)[0] ==="batch") {
        for (let moduleItem of modulesData.modules) {
            let moduleObj = { key: moduleItem._id, text: moduleItem.name, data : { secondaryText: moduleTypeDict[moduleItem.type] }, type: 'module' };
            moduleList.push(moduleObj);
        }
        for (let moduleName of modulesData.batch) {
            if (moduleName){
                let moduleObj = { key: moduleName, text: moduleName, data : { secondaryText: moduleTypeDict['batch'] }, type: 'batch' };
                moduleList.push(moduleObj);
            }
        }
    }

    return moduleList;
}


export function getFunctionalBarChartValues (scenarioList) {
    let legends = [
        { text: "Pass", badgeText: "P" }, 
        { text: "Fail", badgeText: "F" }, 
        { text: "Incomplete", badgeText: "I" }, 
        { text: "Terminated", badgeText: "T" }
    ];

    let values = {
        "Pass": { value: 0 },
        "Fail": { value: 0 },
        "Incomplete": { value: 0 },
        "Terminated": { value: 0 },
    }

    let total = 0;

    for (let scenario of scenarioList) {
        let status = scenario.status;
        if (status === "Terminate") status = "Terminated";
        values[status].value += 1;
        total += 1;
    }

    if (!total) total = 1;

    for (let legend of legends) {
        values[legend.text].value =  Math.round(( values[legend.text].value / total ) * 10000)/100;
    }
    
    return [legends, values];
}

export function prepareExecutionCard (executionData, moduleName) {
    let executionList = [];
    for (let index in executionData) {
        let execution = executionData[index];
        let moduleCard = {
            _id: execution.execution_id,
            title: moduleName ? moduleName :  `Execution No: E${parseInt(index)+1}`,
            smart: execution.smart,
            status: execution.status,
            msg_one: getMessage(execution.start_time, 'Started'),
            msg_two: getMessage(execution.end_time, 'Ended'),
            onSelId: [execution.execution_id],
            batch_id: execution.batchid,
            execution_id: execution.execution_id,
        }
        executionList.push(moduleCard);
    }
    return executionList;
}

function getMessage(dateTime, event) {
    let result = `${event} on ${dateTime}`;
    if (typeof dateTime === 'string' && dateTime !== '-') {
        let [date, time] = dateTime.split(' ');
        result = `${event} on ${date} at ${time}`;
    }
    return result;
}

export function prepareBatchExecutionCard (executionData) {
    let executionDict = {};
    let batchIdToExecId = {};
    let executionNum = 0;

    for (let index in executionData) {
        let execution = executionData[index];

        if (!(execution.batchid in executionDict)) {
            executionDict[execution.batchid] = [];
            batchIdToExecId[execution.batchid] = [];
            ++executionNum;
        }
        
        batchIdToExecId[execution.batchid].push(execution.execution_id);
        executionDict[execution.batchid] = {
            _id: execution.batchid,
            title: `Execution No: E${executionNum}`,
            smart: execution.smart,
            status: execution.status,
            // msg_one: getMessage(execution.start_time, 'Started'),
            msg_two: getMessage(execution.end_time, 'Ended'),
            onSelId: batchIdToExecId[execution.batchid],
            batch_id: execution.batchid,
            execution_id: execution.execution_id,
        }
    }

    let executionList = Object.values(executionDict);
    return executionList;
}


export function parseDefectInfo({ projects,issuetype }) {
    let defectInfo = {
        projects: projects.map(({ id, name, code }, _) => ({ key: id, text: name, code:code})),
        issuetype: issuetype.map(({ id, name }, _) => ({ key: id, text: name }))
    }
    return defectInfo;
}

export function azureParseDefectInfo({projects}) {
    let defectInfo = {
        projects: projects.map(({ id, name }, _) => ({ key: id, text: name})),
        // issuetype: issuetype.map(({ id, name }, _) => ({ key: id, text: name }))
    }
    defectInfo['issuetype'] = [
        {
            "key": "Bug",
            "text": "Bug"
        }
    ]
    return defectInfo;
}



function updateStepDict (parentIdxStack, newStepDict, i) {
    if (parentIdxStack[parentIdxStack.length-1] in newStepDict) {
        newStepDict[parentIdxStack[parentIdxStack.length-1]].push(i);
    }
    else {
        newStepDict[parentIdxStack[parentIdxStack.length-1]] = [i]
    }

    return newStepDict;
}

export function getStepIcon (stepKeyword) {
    let iconName = "";
    let keyword = stepKeyword.toLowerCase();
    if (excelCsvKeywords().includes(keyword)) iconName = "tsi_excelcsv_kw.png";
    else if (wordKeywords().includes(keyword)) iconName = "tsi_word_kw.png";
    else if (fileFolderKeywords().includes(keyword)) iconName = "tsi_filefolder_kw.png";
    else if (fileKeywords().includes(keyword)) iconName = "tsi_file_kw.png";
    else if (mouseKeywords().includes(keyword)) iconName = "tsi_mouse_kw.png";
    else if (keyboardKeywords().includes(keyword)) iconName = "tsi_keyb_kw.png";
    else if (executionKeywords().includes(keyword)) iconName = "tsi_exec_kw.png";
    else if (compareKeywords().includes(keyword)) iconName = "";
    else if (verifyKeywords().includes(keyword)) iconName = "tsi_verify_kw.png";
    else if (fetchKeywords().includes(keyword)) iconName = "tsi_fetch_kw.png";
    else if (stringKeywords().includes(keyword)) iconName = "tsi_string_kw.png";
    else if (dateKeywords().includes(keyword)) iconName = "tsi_date_kw.png";
    else if (variableKeywords().includes(keyword)) iconName = "tsi_var_kw.png";
    else if (setSelectKeywords().includes(keyword)) iconName = "tsi_set_kw.png";
    else if (browserKeywords().includes(keyword)) iconName = "tsi_browser_kw.png";
    else if (mobileKeywords().includes(keyword)) iconName = "mobileApps.png";
    else if (genericAppKeywords().includes(keyword)) iconName = "tsi_generic_kw.png";
    else if (mainframeKeywords().includes(keyword)) iconName = "tsi_mainframe_kw.png";
    else if (databaseKeywords().includes(keyword)) iconName = "tsi_database_kw.png";
    else if (webserviceKeywords().includes(keyword)) iconName = "webservice.png";
    else if (emailKeywords().includes(keyword)) iconName = "tsi_email_kw.png";
    else if (sapKeywords().includes(keyword)) iconName = "tsi_sap_kw.png";
    else if (oebsKeywords().includes(keyword)) iconName = "ic-desktop.png";

    return iconName ? "static/imgs/"+iconName : "";
}


// File Specific Operations

function excelCsvKeywords () {
    return [
        'clearcell', 'clearexcelpath', 'deleterow', 'readcell', 'setexcelpath', 
        'writetocell', 'cellbycellcompare', 'selectivecellcompare', 'copyworkbook'
    ];
}

function wordKeywords () {
    return [
        'readpdf', 'readworddoc', 'readallcheckbox', 'readjson', 'readxml', 
        'writewordfile', 'getalltablesfromdoc'
    ]
}

function fileFolderKeywords () {
    return [
        'createfile', 'createfolder', 'deletefile', 'deletefolder', 'renamefile', 
        'renamefolder', 'copyfilefolder', 'movefilefolder', 'findfilepath'
    ]
}

function fileKeywords () {
    return [
        'beautify', 'writetofile', 'findimageinpdf', 'capturescreenshot', 'savefile', 'uploadfile', 'dropfile', 'normalizepdf'
    ];
}


// Operation Specific Keywords

function mouseKeywords () {
    return [
        'mouse ops', 'click', 'doubleclick', 'mousehover', 'clickelement', 'clickcell', 'doubleclickcell', 
        'clickiris', 'doubleclickiris', 'rightclickiris', 'mousehoveriris', 'dragiris', 'dropiris', 'clickcelliris', 
        'doubleclickcelliris', 'rightclickcelliris', 'mousehovercelliris', 'mousepress', 'cellclick', 'rightclick', 
        'drag', 'drop', 'clickoncell', 'doubleclickoncell', 'rightclickoncell', 'doubleclickstatusbar', 'mouseclick', 
        'doublecellclick', 'longpress', 'press', 'longpressiris', 'pressiris', 'presstoolbarbutton', 'scrollupiris', 
        'scrolldowniris', 'scrollleftiris', 'scrollrightiris', 'horizontalscroll', 'verticalscroll', 'scrolldown', 
        'scrollleft', 'scrollright', 'scrollup', 'scrolltorownumber', 'down', 'up'
    ]
}

function keyboardKeywords () {
    return [
        'tab', 'sendsecurefunctionkeys', 'sendfunctionkeys', 'sendsecurevalue', 'sendvalue'
    ]
}

function executionKeywords () {
    return [
        'getparam', 'endloop', 'jumpby', 'jumpto', 'startloop', 'stop', 'pause', 'wait', 'executefile', 'executecommand', 
        'waitforelementvisible', 'waitforelementexists', 'else', 'elseif', 'endfor', 'endif', 'evaluate', 'for', 'if'
    ]
}

function compareKeywords () {
    return [
        'selectivexmlfilecompare', 'comparejsoncontent', 'compxmlfilewithxmlblock', 'compareinputs', 'comparefiles', 
        'comparecontent', 'imagesimilaritypercentage', 'comparepdfs'
    ]
}

function verifyKeywords () {
    return [
        'verifybuttonname', 'verifydisabled', 'verifyenabled', 'verifyhidden', 'verifyreadonly', 'verifyvisible', 
        'verifyexists', 'verifyallvalues', 'verifyelementtext', 'verifyemail', 'verifyelementdoesnotexists', 
        'verifyelementexists', 'verifycount', 'verifyselectedvalue', 'verifyvaluesexists', 'verifyselectedtab', 
        'verifytext', 'verifytextiris', 'verifyexistsiris', 'verifycellvalueiris', 'verifytextexists', 'verifycellvalue', 
        'verifydate', 'verifydoesnotexists', 'verifytime', 'verifynumber', 'verifyfileexists', 'verifyfolderexists', 
        'verifyobjects', 'verifyvalues', 'verifyallviews', 'verifylistcount', 'verifyselectedviews', 'verifyrowcount', 
        'verifylinktext', 'verifyattribute', 'verifycurrenturl', 'verifypagetitle', 'verifypopuptext', 'verifycelltooltip', 
        'verifyfileimages', 'verifytreepath', 'verifywebimages', 'verifytextboxlength', 'verifyselectedvalues', 'verifytooltiptext', 
        'verifyiconname', 'verifytextdynamic', 'verifytextofcell', 'nullcheck', 'verifycontent'
    ]
}

function fetchKeywords () {
    return [
        'getbuttonname', 'getstatus', 'getelementtext', 'getnodenamebyindex', 'gettext', 'getdate', 'getcount', 
        'getmultiplevaluesbyindexes', 'getselected', 'getvaluebyindex', 'getselectedtab', 'getcellvalue', 'getcolcount', 
        'getcolnumbytext', 'getrowcount', 'getrownumbytext', 'gettextiris', 'getcellvalueiris', 'getcolcountiris', 
        'getrowcountiris', 'getstatusiris', 'getselectedvalue', 'gettime', 'getnumber', 'getslidevalue', 'getvalue', 
        'getfromclipboard', 'getallviews', 'getlistcount', 'getmultipleviewsbyindexes', 'getselectedviews', 'getviewbyindex', 
        'getmaxvalue', 'getminvalue', 'getlinktext', 'getattributevalue', 'getobjectcount', 'getcolumncount', 'gettextboxlength', 
        'getinnertable', 'gettooltiptext', 'geticonname', 'getinputhelp', 'getallkeyvaluepairs', 'getkeybyindex', 'getcellstatus', 
        'getcolvaluecorrtoselectednode', 'gettreenodecount', 'gettreenodetext', 'getcellcolor', 'getcelltext', 'getcountofcolumns', 
        'getcountofrows', 'getrowcolbytext', 'getallcolumnheaders', 'getcolnumbycolheaders', 'getstatusbarmessage', 
        'getrowcountofcontainer', 'getcolcountofcontainer', 'gettypeofcell', 'gettextofcell', 'getdialogwindowname', 
        'getallinstalledapps', 'getallprocess', 'getosinfo', 'getkeystatus', 'gettextdynamic', 'getelementtagvalue', 
        'getcelltooltip', 'getobject', 'getkeyvalue', 'getblockvalue', 'gettagvalue', 'getxmlblockdata', 'getblockcount', 
        'getcontent', 'getlinenumber', 'getallvalues'
    ]
}


// Action Specific Keywords

function stringKeywords () {
    return [
        'concatenate', 'stringgeneration', 'left', 'mid', 'right', 'split', 'replace', 'find', 'tolowercase', 
        'touppercase', 'trim', 'typecast', 'getindexcount', 'getstringlength', 'getsubstring','numberformatter'
    ]
}

function dateKeywords () {
    return [
        'changedateformat', 'dateaddition', 'datecompare', 'datedifference', 'monthaddition', 'yearaddition', 
        'getcurrentdate', 'getcurrentdateandtime', 'getcurrenttime', 'getcurrentday', 'getcurrentdaydateandtime'
    ]
}

function variableKeywords () {
    return [
        'createdynvariable ({varname})', 'displayvariablevalue', 'deletedynvariable', 
        'createconstvariable(_varname_)', 'deleteconstvariable', 'copyvalue', 'modifyvalue'
    ]
}

function setSelectKeywords () {
    return [
        'setfocus', 'selectcheckbox', 'unselectcheckbox', 'selectradiobutton', 'selecttreenode', 'selectvaluebyindex', 
        'selectvaluebytext', 'setdate', 'selectmenu', 'deselectall', 'selectallvalues', 'selectmultiplevaluesbyindexes', 
        'selectmultiplevaluesbytext', 'selecttabbyindex', 'selecttabbytext', 'selectrow', 'cleartext', 'settextiris', 
        'cleartextiris', 'setsecuretextiris', 'setcellvalueiris', 'setmaxvalue', 'setmidvalue', 'setminvalue', 'setnumber', 
        'settime', 'toggleoff', 'toggleon', 'setslidevalue', 'selectmultipleviewsbyindexes', 'selectmultipleviewsbytext', 
        'selectviewbyindex', 'selectviewbytext', 'setrangevalue', 'selectbyabsolutevalue', 'selectkeybytext', 'setcelltext', 
        'unselectrow', 'selectcolumn', 'unselectcolumn', 'selecttab', 'selecttreeelement', 'singleselectparentofselected', 
        'selectallrows', 'selectrows', 'unselectallselections', 'selectcolumns', 'unselectcolumns', 'selectdate', 'selectrange', 
        'selectmonth', 'selectweek', 'selectcontextmenubytext', 'setcellfocus', 'disableanchoriris', 'savetoclipboard', 'setkeyvalue', 
        'replacecontent', 'clearfilecontent', 'setsecuretext', 'settext', 'setvalue', 'setshelltext', 'settextincell'
    ]
}


// AppType Specific Keywords

function browserKeywords () {
    return [
        'closebrowser', 'navigatetourl', 'openbrowser', 'refresh', 'switchtowindow', 'closesubwindows', 
        'navigateback', 'opennewtab', 'acceptpopup', 'dismisspopup', 'clearcache', 'maximizebrowser', 
        'navigatewithauthenticate', 'getbrowsertoforeground', 'sendkeys', 'getcurrenturl', 'getpagetitle', 
        'getpopuptext', 'getbrowsername'
    ]
}

function mobileKeywords () {
    return [
        'swipedown', 'swipeleft', 'swiperight', 'swipeup', 'backpress', 'getdevices', 'hidesoftkeyboard', 
        'installapplication', 'invokedevice', 'stopserver', 'uninstallapplication', 'actionkey'
    ]
}

function genericAppKeywords () {
    return [
        'closeapplication', 'findwindowandattach', 'launchapplication', 'maximizewindow', 'minimizewindow'
    ]
}

function mainframeKeywords () {
    return [
        'closemainframe', 'connectsession', 'disconnectsession', 'jobstatus', 'launchmainframe', 
        'logoff', 'login', 'securelogin', 'setcursor', 'submitjob'
    ]
}

function databaseKeywords () {
    return [
        'runquery', 'secureexportdata', 'securegetdata', 'securerunquery', 
        'secureverifydata', 'verifydata', 'exportdata', 'getdata'
    ]
}

function webserviceKeywords () {
    return [
        'addclientcertificate', 'executerequest', 'getheader', 'getservercertificate', 'setbasicauth', 'setendpointurl', 
        'setheader', 'setheadertemplate', 'setmethods', 'setoperations', 'setwholebody', 'setproxies', 'setparam', 
        'settagattribute', 'settagvalue', 'setparamvalue'
    ]
}

function emailKeywords () {
    return [
        'sendemail', 'setattachments', 'setbcc', 'setbody', 'setcc', 'setsubject', 'settomailid', 
        'switchtofolder', 'getattachmentstatus', 'getbody', 'getemail', 'getfrommailid', 'getsubject', 'gettomailid', 'verifyattachmentcontent'
    ]
}

function sapKeywords () {
    return [
        'serverconnect', 'starttransaction', 'toolbaraction', 'closewindow', 'restorewindow', 'collapsetree', 'toolbaractionkeys'
    ]
}

function oebsKeywords () {
    return [
        'switchtoframe', 'closeframe', 'togglemaximize', 'toggleminimize'
    ]
}