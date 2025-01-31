const moment = require('moment');
export const getObjNameList = (appType, data) => {
    let obnames = [];

    switch(appType){
        case "Web":         obnames = ["@Generic", "@Excel", "@Custom", "@Browser", "@BrowserPopUp", "@Object", "@Word"];
                            break;
        case "Webservice":  obnames = ["@Generic", "@Excel", "WebService List", "@Word"];
                            break;
        case "Mainframe":   obnames = ["@Generic", "@Excel", "Mainframe List", "@Word"];
                            break;
        case "Desktop":     obnames = ["@Generic", "@Excel", "@Window", "@Custom", "@Email", "@Word"];
                            break;
        case "OEBS":        obnames = ["@Generic", "@Excel", "@Oebs", "@Custom", "@Word"];
                            break;
        case "MobileApp":   if (navigator.appVersion.indexOf("Mac") === -1) obnames = ["@Generic", "@Mobile", "@Android_Custom", "@Action","@Excel","@Word"];
                            else if (navigator.appVersion.indexOf("Mac") !== -1) obnames = ["@Generic", "@Mobile", "@CustomiOS","@Excel","@Word"];
                            break;
        case "MobileWeb":   obnames = ["@Generic", "@Browser", "@BrowserPopUp", "@Action","@Excel","@Word","@Custom"];
                            break;
        case "SAP":         obnames = ["@Generic", "@Sap", "@Custom", "@Word","@Excel"];
                            break;
        case "System":      obnames = ["@Generic", "@Excel", "@System", "@Word"];
                            break;
        default:            break;
    }

    for (let i = 0; i < data.length; i++) obnames.push(data[i].custname);
    
	return obnames;
}

export const getKeywordList = (objectName, keywordList, appType, scriptData) => {
    let cord = null;
    let objName = " ";
    let url = " ";
    let tcAppType = appType;
    let keywords = null;
    let selectedKeywordList = null;

    let selectedObj = objectName; 
    if (selectedObj === "") {
        selectedObj = "@Generic"
    }
    switch (selectedObj) {
        case undefined: /* FALL THROUGH */
        case "@Generic": 
            if (appType === "MobileApp") {
                keywords = Object.keys(keywordList.defaultListMobility);
                selectedKeywordList = "defaultListMobility";
                tcAppType = "Generic";
            }
            else {
                keywords = Object.keys(keywordList.defaultList);
                selectedKeywordList = "defaultList";
                tcAppType = "Generic";
            }
            break;
        case "@System":
            keywords = Object.keys(keywordList.system);
            selectedKeywordList = "getOsInfo";
            tcAppType = "System";
            break;
        case "@Browser":
            keywords = Object.keys(keywordList.browser);
            selectedKeywordList = "browser";
            break;
        case "@BrowserPopUp":
            keywords = Object.keys(keywordList.browserPopUp);
            selectedKeywordList = "browserPopUp";
            break;
        case "@Custom":
            objName = "@Custom";
            url = "";
            if (appType === "Desktop") {
                keywords = Object.keys(keywordList.customDp);
				selectedKeywordList = "customDp";
            } else if (appType === "OEBS"){
                keywords = Object.keys(keywordList.customOEBS);
                selectedKeywordList = "customOEBS"; //need check
                if (scriptData && scriptData !== "undefined") {
                    for (let j = 0; j < scriptData.length; j++) {
                        if (!(['@Browser', '@Oebs', '@Window', '@Generic', '@Custom'].includes(scriptData[j].custname))) {
                            if (scriptData[j].url) {
                                url = scriptData[j].url;
                                break;
                            }
                        }
                    }
                }
            } else {
				keywords = Object.keys(keywordList.custom);
				selectedKeywordList = "custom";
			}
            break;
        case "@Object":
            keywords = Object.keys(keywordList.object);
            selectedKeywordList = "object";
            objName = "@Object";
            url = "";
            if (appType === 'Web') {
                if (scriptData && scriptData !== "undefined") {
                    for (let j = 0; j < scriptData.length; j++) {
                        if (!(['@Browser', '@Oebs', '@Window', '@Generic', '@Custom'].includes(scriptData[j].custname))) {
                            if (scriptData[j].url) {
                                url = scriptData[j].url;
                                break;
                            }
                        }
                    }
                }
            } else {
                keywords = Object.keys(keywordList.object);
                selectedKeywordList = "object";
            }
            break;
        case "WebService List":
            keywords = Object.keys(keywordList.defaultListWS);
            selectedKeywordList = "defaultListWS";
            break;
        case "Mainframe List":
            keywords = Object.keys(keywordList.defaultListMF);
            selectedKeywordList = "defaultListMF";
            break;
        case "@Email":
            keywords = Object.keys(keywordList.defaultListDP);
            selectedKeywordList = "defaultListDP";
            break;
        case "@Window":
            keywords = Object.keys(keywordList.generic);
            selectedKeywordList = "generic";
            break;
        case "@Oebs":
            keywords = Object.keys(keywordList.generic);
            selectedKeywordList = "generic";
            break;
        case "@Mobile":
            if (navigator.appVersion.indexOf("Mac") !== -1){
                keywords = Object.keys(keywordList.genericIos);
                selectedKeywordList = "genericIos";
            }
            else{
                keywords = Object.keys(keywordList.generic);
                selectedKeywordList = "generic";
            }
            break;
        case "@Action":
            keywords = Object.keys(keywordList.action);
            selectedKeywordList = "action";
            break;
        case "@Android_Custom":
            keywords = Object.keys(keywordList.Android_Custom);
            selectedKeywordList = "Android_Custom";
            break;
        case "@CustomiOS":
            keywords = Object.keys(keywordList.CustomiOS);
            selectedKeywordList = "CustomiOS";
            break;
        case "@MobileiOS":
            keywords = Object.keys(keywordList.genericiOS);
            selectedKeywordList = "genericiOS";
            break;
        case "@Sap":
            keywords = Object.keys(keywordList.generic);
            selectedKeywordList = "generic";
            break;
        case "@Excel":
            keywords = Object.keys(keywordList.excelList);
            selectedKeywordList = "excelList";
            tcAppType = "Generic";
            break;
        case "@Word":
            keywords = Object.keys(keywordList.word);
            selectedKeywordList = "word";
            tcAppType = "Generic";
            break;
        default: 
            let scrappedDataCustnames = [];
            selectedObj = replaceHtmlEntites(selectedObj.trim());
            
            for (let i = 0; i < scriptData.length; i++) {
                let ob = scriptData[i];
                let custname = ob.custname.trim();
                scrappedDataCustnames.push(custname);
                //eslint-disable-next-line
                if ((custname.replace(/\s/g, ' ') === (selectedObj.replace('/\s/g', ' ')).replace('\n', ' '))) {
                    let isIos = scriptData[i].text;
                    if (isIos === 'ios') objName = ob.xpath;
                    else objName = ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ');

                    url = ob.url;
                    let obType = ob.tag || "";
                    // let listType = ob.canselectmultiple;
                    let objNameArray = objName.split(';');
                    if (ob.cord) {
                        selectedKeywordList = 'iris';
                        cord = ob.cord;
                        url = "";
                        if (objNameArray.length === 9){
                            switch (objNameArray[6]){
                                case 'textbox': obType = 'iristextbox'; break;
                                case 'radiobutton': obType = 'irisradiocheck'; break;
                                case 'checkbox': obType = 'irisradiocheck'; break;
                                case 'button': obType = 'irisbutton'; break;
                                case 'table': obType = 'iristable'; break;
                                case 'scroll': obType = 'irisscroll'; break;
                                case 'dropdown':    /* FALL THROUGH */
                                case 'label':       /* FALL THROUGH */
                                case 'listbox':     /* FALL THROUGH */
                                case 'tree':        /* FALL THROUGH */
                                case 'image': obType = 'irisgeneric'; break;
                                default: obType = "iris"; break;
                            }
						} else {
                            obType = "iris";
                        }
                    }

                    if (!obType && appType === "Webservice" ) {
                        keywords = Object.keys(keywordList.elementWS);
                        selectedKeywordList = "elementWS";
                        break;
                    }
                    else if (!(['a', 'select', 'radiobutton', 'checkbox', 'input', 'list', 'tablecell', 'table', 'grid', 'img', 'button', 'iris', 'iristextbox', 'irisradiocheck', 'irisbutton', 'iristable', 'irisgeneric', 'irisscroll'].includes(obType)) && ['Web', 'MobileWeb'].includes(appType) && !obType.startsWith('@PDF')) {
                        keywords = Object.keys(keywordList.element);
                        selectedKeywordList = "element";
                        break;
                    } else if (obType.startsWith("@PDF")) {
                        keywords = Object.keys(keywordList.pdfList);
                        selectedKeywordList = "pdfList";
                        tcAppType = "pdf";
                        break;
                    } else if (obType === 'elementWS') {
                        keywords = Object.keys(keywordList.elementWS);
                        selectedKeywordList = "elementWS";
                        break;
                    } else if (appType === 'Desktop') {
                        //let listType = ob.canselectmultiple;
                        switch (obType) {
                            case 'button':      
                                keywords = Object.keys(keywordList.button);
                                selectedKeywordList = "button";
                                break;
                            case 'input':   /* FALL THROUGH */
                            case 'edit':
                                keywords = Object.keys(keywordList.text);
                                selectedKeywordList = "text";
                                break;
                            case 'select':
                                keywords = Object.keys(keywordList.select);
                                selectedKeywordList = "select";
                                break;
                            case 'list':
                                keywords = Object.keys(keywordList.list);
                                selectedKeywordList = "list";
                                break;
                            case 'list_item':
                                keywords = Object.keys(keywordList.list);
                                selectedKeywordList = "list";
                                break;
                            case 'tab':
                                keywords = Object.keys(keywordList.tab);
                                selectedKeywordList = "tab";
                                break;
                            case 'datepicker':
                                keywords = Object.keys(keywordList.datepicker);
                                selectedKeywordList = "datepicker";
                                break;
                            case 'checkbox':
                                keywords = Object.keys(keywordList.checkbox);
                                selectedKeywordList = "checkbox";
                                break;
                            case 'radiobutton':
                                keywords = Object.keys(keywordList.radiobutton);
                                selectedKeywordList = "radiobutton";
                                break;
                            case 'hyperlink': /* FALL THROUGH */
                            case 'lbl': 
                                keywords = Object.keys(keywordList.link);
                                selectedKeywordList = "link";
                                break;
                            case 'treeview': /* FALL THROUGH */
                            case 'TreeView': /* FALL THROUGH */
                            case 'tree':
                                keywords = Object.keys(keywordList.tree);
                                selectedKeywordList = "tree";
                                break;
                            case 'iris':
                                keywords = Object.keys(keywordList.iris);
                                selectedKeywordList = "iris";
                                break;
                            case 'iristextbox':
                                keywords = Object.keys(keywordList.iristextbox);
                                selectedKeywordList = "iristextbox";
                                break;
                            case 'irisradiocheck':
                                keywords = Object.keys(keywordList.irisradiocheck);
                                selectedKeywordList = "irisradiocheck";
                                break;
                            case 'iristable':
                                keywords = Object.keys(keywordList.iristable);
                                selectedKeywordList = "iristable";
                                break;
                            case 'irisbutton':
                                keywords = Object.keys(keywordList.irisbutton);
                                selectedKeywordList = "irisbutton";
                                break;
                            case 'irisgeneric':
                                keywords = Object.keys(keywordList.irisgeneric);
                                selectedKeywordList = "irisgeneric";
                                break;
                            case 'irisscroll':
                                keywords = Object.keys(keywordList.irisscroll);
                                selectedKeywordList = "irisscroll";
                                break;
                            case 'table':
                                keywords = Object.keys(keywordList.table);
                                selectedKeywordList = "table";
                                break;
                            default: 
                                keywords = Object.keys(keywordList.element);
                                selectedKeywordList = "element";
                                break;
                        }
                        break;
                    } else if (appType === 'SAP') {
                        //let listType = '';
                        switch (obType) {
                            case 'push_button': /* FALL THROUGH */
                            case 'GuiButton': /* FALL THROUGH */
                            case 'button':
                                keywords = Object.keys(keywordList.button);
                                selectedKeywordList = "button";
                                break;
                            case 'GuiTextField': /* FALL THROUGH */
                            case 'GuiCTextField': /* FALL THROUGH */
                            case 'text': /* FALL THROUGH */
                            case 'input':
                                keywords = Object.keys(keywordList.text);
                                selectedKeywordList = "text";
                                break;
                            case 'GuiLabel': /* FALL THROUGH */
                            case 'lbl':
                                keywords = Object.keys(keywordList.element);
                                selectedKeywordList = "element";
                                break;
                            case 'GuiPasswordField':
                                keywords = Object.keys(keywordList.text);
                                selectedKeywordList = "text";
                                break;
                            case 'GuiTab':
                                keywords = Object.keys(keywordList.tabs);
                                selectedKeywordList = "tabs";
                                break;
                            case 'GuiScrollContainer': /* FALL THROUGH */
                            case 'scroll':
                                keywords = Object.keys(keywordList.scroll);
                                selectedKeywordList = "scroll";
                                break;
                            case 'combo_box': /* FALL THROUGH */
                            case 'GuiBox': /* FALL THROUGH */
                            case 'GuiComboBox': /* FALL THROUGH */
                            case 'select':
                                keywords = Object.keys(keywordList.select);
                                selectedKeywordList = "select";
                                break;
                            case 'list_item':
                                keywords = Object.keys(keywordList.list);
                                selectedKeywordList = "list";
                                break;
                            case 'GuiTableControl': /* FALL THROUGH */
                            case 'table':
                                keywords = Object.keys(keywordList.table);
                                selectedKeywordList = "table";
                                break;
                            case 'GuiShell': /* FALL THROUGH */
                            case 'shell':
                                keywords = Object.keys(keywordList.shell);
                                selectedKeywordList = "shell";
                                break;
                            case 'scontainer':
                                keywords = Object.keys(keywordList.scontainer);
                                selectedKeywordList = "scontainer";
                                break;
                            case 'tree':
                                keywords = Object.keys(keywordList.tree);
                                selectedKeywordList = "tree";
                                break;
                            case 'calendar':
                                keywords = Object.keys(keywordList.calendar);
                                selectedKeywordList = "calendar";
                                break;
                            case 'gridview':
                                keywords = Object.keys(keywordList.gridview);
                                selectedKeywordList = "gridview";
                                break;
                            case 'toolbar':
                                keywords = Object.keys(keywordList.toolbar);
                                selectedKeywordList = "toolbar";
                                break;
                            case 'list':
                                keywords = Object.keys(keywordList.list);
                                selectedKeywordList = "list";
                                break;
                            case 'check_box': /* FALL THROUGH */
                            case 'GuiCheckBox': /* FALL THROUGH */
                            case 'checkbox':
                                keywords = Object.keys(keywordList.checkbox);
                                selectedKeywordList = "checkbox";
                                break;
                            case 'radio_button': /* FALL THROUGH */
                            case 'GuiRadioButton': /* FALL THROUGH */
                            case 'radiobutton':
                                keywords = Object.keys(keywordList.radiobutton);
                                selectedKeywordList = "radiobutton";
                                break;
                            case 'hyperlink': /* FALL THROUGH */
                            case 'a':
                                keywords = Object.keys(keywordList.link);
                                selectedKeywordList = "link";
                                break;
                            case 'iris':
                                keywords = Object.keys(keywordList.iris);
                                selectedKeywordList = "iris";
                                break;
                            case 'iristextbox':
                                keywords = Object.keys(keywordList.iristextbox);
                                selectedKeywordList = "iristextbox";
                                break;
                            case 'irisradiocheck':
                                keywords = Object.keys(keywordList.irisradiocheck);
                                selectedKeywordList = "irisradiocheck";
                                break;
                            case 'iristable':
                                keywords = Object.keys(keywordList.iristable);
                                selectedKeywordList = "iristable";
                                break;
                            case 'irisbutton':
                                keywords = Object.keys(keywordList.irisbutton);
                                selectedKeywordList = "irisbutton";
                                break;
                            case 'irisgeneric':
                                keywords = Object.keys(keywordList.irisgeneric);
                                selectedKeywordList = "irisgeneric";
                                break;
                            case 'irisscroll':
                                keywords = Object.keys(keywordList.irisscroll);
                                selectedKeywordList = "irisscroll";
                                break;
                            default: 
                                keywords = Object.keys(keywordList.element);
                                selectedKeywordList = "element";
                                break;
                        } 
                        break;
                    } else if (appType === 'MobileApp') {
                        if (obType.includes("RadioButton")) {
                            keywords = Object.keys(keywordList.radiobutton);
                            selectedKeywordList = "radiobutton";
                        } else if (obType.includes("TextField") || obType.includes("SearchField") || obType.includes("SecureTextField")){
                            keywords = Object.keys(keywordList.inputIos);
                            selectedKeywordList = "inputIos";
                        } else if (obType.includes("EditText")) {
                            keywords = Object.keys(keywordList.input);
                            selectedKeywordList = "input";
                        } else if (obType.includes("PickerWheel")) {
                            keywords = Object.keys(keywordList.pickerwheel);
                            selectedKeywordList = "pickerwheel";
                        } else if (obType.includes("Slider")) {
                            keywords = Object.keys(keywordList.slider);
                            selectedKeywordList = "slider";
                        } else if (obType.includes("Switch")) {
                            keywords = Object.keys(keywordList.togglebutton);
                            selectedKeywordList = "togglebutton";
                        } else if (obType.includes("ImageButton") || obType.includes("Button")) {
                            keywords = Object.keys(keywordList.button);
                            selectedKeywordList = "button";
                        } else if (obType.includes("Spinner")) {
                            keywords = Object.keys(keywordList.spinners);
                            selectedKeywordList = "spinners";
                        } else if (obType.includes("CheckBox")) {
                            keywords = Object.keys(keywordList.checkbox);
                            selectedKeywordList = "checkbox";
                        } else if (obType.includes("TimePicker")) {
                            keywords = Object.keys(keywordList.timepicker);
                            selectedKeywordList = "timepicker";
                        } else if (obType.includes("DatePicker")) {
                            keywords = Object.keys(keywordList.datepicker);
                            selectedKeywordList = "datepicker";
                        } else if (obType.includes("Time")) {
                            keywords = Object.keys(keywordList.time);
                            selectedKeywordList = "time";
                        } else if (obType.includes("Date")) {
                            keywords = Object.keys(keywordList.date);
                            selectedKeywordList = "date";
                        } else if (obType.includes("NumberPicker")) {
                            keywords = Object.keys(keywordList.numberpicker);
                            selectedKeywordList = "numberpicker";
                        } else if (obType.includes("RangeSeekBar")) {
                            keywords = Object.keys(keywordList.rangeseekbar);
                            selectedKeywordList = "rangeseekbar";
                        } else if (obType.includes("SeekBar")) {
                            keywords = Object.keys(keywordList.seekbar);
                            selectedKeywordList = "seekbar";
                        } else if (obType.includes("ListView")) {
                            keywords = Object.keys(keywordList.listview);
                            selectedKeywordList = "listview";
                        } else if (obType.includes("XCUIElementTypeTable")) {
                            keywords = Object.keys(keywordList.table);
                            selectedKeywordList = "table";
                        } else if (obType.includes('iris')) {
                            keywords = Object.keys(keywordList.iris);
                            selectedKeywordList = "iris";
                        }
                        else {
                            keywords = Object.keys(keywordList.element);
                            selectedKeywordList = "element";
                        }
                        break;
                    } else if (appType === 'OEBS') {
                        switch (obType) {
                            case 'push button':
                            case 'toggle button':
                                keywords = Object.keys(keywordList.button);
                                selectedKeywordList = "button";
                                break;
                            case 'edit':
                            case 'Edit Box':
                            case 'text':
                            case 'password text':
                                keywords = Object.keys(keywordList.text);
                                selectedKeywordList = "text";
                                break;
                            case 'combo box':
                                keywords = Object.keys(keywordList.select);
                                selectedKeywordList = "select";
                                break;
                            case 'list item':
                            case 'list':
                                keywords = Object.keys(keywordList.list);
                                selectedKeywordList = "list";
                                break;
                            case 'hyperlink':
                            case 'Static':
                                keywords = Object.keys(keywordList.link);
                                selectedKeywordList = "link";
                                break;
                            case 'check box':
                                keywords = Object.keys(keywordList.checkbox);
                                selectedKeywordList = "checkbox";
                                break;
                            case 'radio button':
                                keywords = Object.keys(keywordList.radiobutton);
                                selectedKeywordList = "radiobutton";
                                break;
                            case 'table': 
                                keywords = Object.keys(keywordList.table);
                                selectedKeywordList = "table";
                                break;
                            case 'scroll bar':
                                keywords = Object.keys(keywordList.scrollbar);
                                selectedKeywordList = "scrollbar";
                                break;
                            case 'frame':
                            case 'internal frame':
                                keywords = Object.keys(keywordList.internalframe);
                                selectedKeywordList = "internalframe";
                                break;
                            case 'iris':
                                keywords = Object.keys(keywordList.iris);
                                selectedKeywordList = "iris";
                                break;
                            case 'iristextbox':
                                keywords = Object.keys(keywordList.iristextbox);
                                selectedKeywordList = "iristextbox";
                                break;
                            case 'irisradiocheck':
                                keywords = Object.keys(keywordList.irisradiocheck);
                                selectedKeywordList = "irisradiocheck";
                                break;
                            case 'iristable':
                                keywords = Object.keys(keywordList.iristable);
                                selectedKeywordList = "iristable";
                                break;
                            case 'irisbutton':
                                keywords = Object.keys(keywordList.irisbutton);
                                selectedKeywordList = "irisbutton";
                                break;
                            case 'irisgeneric':
                                keywords = Object.keys(keywordList.irisgeneric);
                                selectedKeywordList = "irisgeneric";
                                break;
                            case 'irisscroll':
                                keywords = Object.keys(keywordList.irisscroll);
                                selectedKeywordList = "irisscroll";
                                break;
                            default:
                                keywords = Object.keys(keywordList.element);
                                selectedKeywordList = "element";
                                break;
                        }
                        break;
                    } else {
                        keywords = Object.keys(keywordList[obType]);
                        selectedKeywordList = obType;
                        break;
                    }
                }
            }
            break;
    }
    const data = { objectName: objName, keywords: keywords, url: url, cord: cord, obType: selectedKeywordList, appType: tcAppType }
    return data;
}

const replaceHtmlEntites = selectedText => {
	var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
	var translate = {"nbsp": " ","amp" : "&","quot": "\"","lt"  : "<","gt"  : ">"};
	return ( selectedText.replace(translate_re, function(match, entity) {
		return translate[entity];
	}) );
}

const roles = {
    "Quality Lead": "5db0022cf87fdec084ae49aa",
    "Quality Manager": "5db0022cf87fdec084ae49ab",
    "Quality Engineer": "5db0022cf87fdec084ae49ac"
};

export const roleIdentifiers = {
    QALead: "Quality Lead",
    QAManager: "Quality Manager",
    QAEngineer: "Quality Engineer"
};

// Function to Check roleId belongs to QA Manager, QA Lead, QA Engineer
export const checkRole = (roleName, roleId) => {
    const roleIds = roles[roleName];
    if ([String(roleId)].includes(roleIds)) {
        return true;
    }
    return false;
};

export const getRoleId = (roleName) =>{
    return roles[roleName];
}
 export const convertIdIntoNameOfAppType = (apptypeID) => {
    switch (apptypeID) {
      case "5db0022cf87fdec084ae49b6":
        return "Web";
      case "5db0022cf87fdec084ae49b2":
        return "MobileWeb";
      case "5db0022cf87fdec084ae49af":
        return "Desktop";
      case "5db0022cf87fdec084ae49b7":
        return "Webservice";
      case "5db0022cf87fdec084ae49b4":
        return "SAP";
      case "5db0022cf87fdec084ae49b3":
        return "OEBS";
      case "5db0022cf87fdec084ae49b0":
        return "Mainframe";
      case "5db0022cf87fdec084ae49b1":
        return "MobileApp";
      case "5db0022cf87fdec084ae49b5":
        return "System";
      default:
        return "";
    }
}

export const DateTimeFormat = (inputDate, createDate) => {
    // Provided date
    const providedDate = new Date(inputDate);
    const createddate = new Date(createDate);
    let createdNowProject = false;
    { providedDate.toISOString() === createddate.toISOString() ? createdNowProject = true : createdNowProject = false }
    // Current date
    const currentDate = new Date();
    // Calculate years, months, days, hours, and seconds
    const millisecondsInASecond = 1000;
    const millisecondsInAMinute = 60 * millisecondsInASecond;
    const millisecondsInAnHour = 60 * millisecondsInAMinute;
    const millisecondsInADay = 24 * millisecondsInAnHour;
    const millisecondsInAYear = 365 * millisecondsInADay;
    const date1 = moment(providedDate, 'ddd, DD MMM YYYY HH:mm:ss ZZ');
    const date2 = moment(new Date(), 'ddd MMM DD YYYY HH:mm:ss ZZ');
    //convert the difference to other units, such as seconds, minutes, hours, etc.
    const seconds = date2.diff(date1, 'seconds');
    const minutes = date2.diff(date1, 'minutes');
    const hours = date2.diff(date1, 'hours');
    const days = date2.diff(date1, 'days');
    const months = date2.diff(date1, 'months');
    const years = date2.diff(date1, 'years');
    let output = "";
    if (years <= 0 && months <= 0 && days <= 0 && hours <= 0 && minutes <= 0) {
        output = createdNowProject ? "Created now" : "Edited Now";
    }
    else if (years <= 0 && months <= 0 && days <= 0 && hours <= 0 && minutes >= 1) {
        output = `Last Edited ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    else if (years <= 0 && months <= 0 && days <= 0 && hours >= 1) {
        output = `Last Edited ${hours} hr${hours > 1 ? 's' : ''} ago`;
    }
    else if (years <= 0 && months <= 0 && days >= 1) {
        output = `Last Edited ${days} day${days > 1 ? 's' : ''} ago`;
    }
    else if (years <= 0 && months >= 1) {
        output = `Last Edited ${months} month${months > 1 ? 's' : ''} ago`;
    }
    else {
        output = `Last Edited ${years} year${years > 1 ? 's' : ''} ago`;
    }
    return output;
}
// Report Date Time Show Format Ex: ~00:00:00 
export const reportsDateFormat = (startDateFormat, endDateFormat) => {
    // Check if endDateFormat is null
    if (!startDateFormat || !endDateFormat) {
        return "NA";
    }
    // Convert date strings to Date objects
    const startDate = new Date(startDateFormat);
    const endDate = new Date(endDateFormat);
    // Calculate the difference in milliseconds
    const differenceMs = endDate - startDate;
    // Convert milliseconds to seconds
    const differenceSec = Math.round(differenceMs / 1000);
    // Calculate hours, minutes, and seconds
    const hours = Math.floor(differenceSec / 3600);
    const minutes = Math.floor((differenceSec % 3600) / 60);
    const seconds = differenceSec % 60;
    // Format the result
    const formattedResult = "~" + (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    return formattedResult;
}
// Add 2 Report Date Format Ex: (~00:00:04 + ~00:00:03) = ~00:00:07
export const addReportEllapsedTimes = (ellapsedTimeArr) => {
    const timeToSeconds = (timeStr) => {
        const [, hours, minutes, seconds] = timeStr.match(/(\d+):(\d+):(\d+)/);
        return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
    }
    const secondsToTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `~${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    // Convert to seconds and sum
    const totalSeconds = ellapsedTimeArr.reduce((acc, timeStr) => acc + timeToSeconds(timeStr), 0);
    // Convert total seconds back to time format
    const totalTime = secondsToTime(totalSeconds);
    return totalTime
}