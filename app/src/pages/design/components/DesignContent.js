import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ReactSortable } from 'react-sortablejs';
import { ScreenOverlay, RedirectPage, PopupMsg } from '../../global'
import TableContents from './TableContents';
import * as DesignApi from "../api";
import * as pluginActions from "../../plugin/state/action";
import "../styles/DesignContent.scss";
import { TestCases, KeywordData, ScrappedData } from './TestCaseValues.js'

const DesignContent = (props) => {

    const history = useHistory();
    const dispatch = useDispatch();
    const [overlay, setOverlay] = useState("");
    const [showPop, setShowPop] = useState("");
    const [hideSubmit, setHideSubmit] = useState(false);
    const [keywordList, setKeywordList] = useState(KeywordData);
    const [testCaseData, setTestCaseData] = useState(TestCases);
    const [testScriptData, setTestScriptData] = useState(ScrappedData);
    const [checkedRows, setCheckedRows] = useState(new Set());
    const [focusedRow, setFocusedRow] = useState(null);
    const [mirror, setMirror] = useState(null);
    const [dataFormat, setDataFormat] = useState(null);
    const [objNameList, setObjNameList] = useState([
        "@Generic",
        "@Excel",
        "@Custom",
        "@Browser",
        "@BrowserPopUp",
        "@Object",
        "@Word",
        "search_box",
        "search_btn",
        "feeling_lucky"
      ]);
    const [edit, setEdit] = useState(false);

    const tableActionBtnGroup = [
        {'title': 'Add Test Step', 'img': 'static/imgs/ic-jq-addstep.png', 'alt': 'Add Steps', onClick() { setEdit(true) }},
        {'title': 'Edit Test Step', 'img': 'static/imgs/ic-jq-editstep.png', 'alt': 'Edit Steps', onClick:  ()=>setEdit(true)},
        {'title': 'Drag & Drop Test Step', 'img': 'static/imgs/ic-jq-dragstep.png', 'alt': 'Drag Steps', onClick:  ()=>setEdit(true)},
        {'title': 'Copy Test Step', 'img': 'static/imgs/ic-jq-copystep.png', 'alt': 'Copy Steps', onClick:  ()=>setEdit(true)},
        {'title': 'Paste Test Step', 'img': 'static/imgs/ic-jq-pastestep.png', 'alt': 'Paste Steps', onClick:  ()=>setEdit(true)},
        {'title': 'Skip Test Step', 'img': 'static/imgs/ic-jq-commentstep.png', 'alt': 'Comment Steps', onClick:  ()=>setEdit(true)}
    ]

    const readTestCase_ICE = () => {
		let taskInfo = props.current_task;
		let testCaseId = taskInfo.testCaseId;
		let testCaseName = taskInfo.testCaseName;
		let versionnumber = taskInfo.versionnumber;
		
		setOverlay("Loading...");
        
        // service call # 1 - getTestScriptData service call
		DesignApi.readTestCase_ICE(testCaseId, testCaseName, versionnumber, taskInfo.screenName)
			.then(data => {
				if (data === "Invalid Session") RedirectPage(history);
                
                let changeFlag = false
                let taskObj = props.current_task
                if(data.screenName){
                    taskObj.screenName = data.screenName;
                    changeFlag = true
				}
				if(data.reuse){
                    taskObj.reuse = "True";
                    changeFlag = true
                }
                if (changeFlag) dispatch({type: pluginActions.SET_CT, payload: taskObj});

				if(data.del_flag){
					//pop up for presence of deleted objects
					setShowPop({ "title": "Deleted objects found", "content": "Deleted objects found in some teststeps, Please delete or modify those steps."});
					//disable left-top-section
					// $("#left-top-section").addClass('disableActions');
					// $("a[title='Export TestCase']").addClass('disableActions');
				}
				else{
					//enable left-top-section
					// $("#left-top-section").removeClass('disableActions');
					// $("a[title='Export TestCase']").removeClass('disableActions');
				}
				let appType = taskInfo.appType;
				// $('#jqGrid').removeClass('visibility-hide').addClass('visibility-show');
				// removing the down arrow from grid header columns - disabling the grid menu pop-up
				// $('.ui-grid-icon-angle-down').removeClass('ui-grid-icon-angle-down');
                // $("#jqGrid").jqGrid('clearGridData');
                
				if(data.testcase.length === 0) setHideSubmit(true);
				else setHideSubmit(false);
                
                // $('#jqGrid').show();
                // service call # 2 - objectType service call 

				DesignApi.getScrapeDataScreenLevel_ICE(appType, taskInfo.screenId, taskInfo.projectId, taskInfo.testCaseId)
					.then(scriptData => {
						if (scriptData === "Invalid Session") RedirectPage(history);
						if (appType === "Webservice"){
							if (scriptData.view.length > 0) {
								if (scriptData.view[0].header) dataFormat = scriptData.view[0].header[0].split("##").join("\n");
								else dataFormat = scriptData.header[0].split("##").join("\n");
							}	
                        }
                        
                        setTestScriptData(scriptData.view);
                        
						if (scriptData.mirror) setMirror(scriptData.mirror);
						else setMirror(null);
                        
						// service call # 3 -objectType service call
						DesignApi.getKeywordDetails_ICE(appType)
							.then(keywordData => {
                                if (keywordData === "Invalid Session") RedirectPage(history);
                                
                                setKeywordList(keywordData);
                                
								if (data === "" || data === null || data === "{}" || data === "[]" || data.testcase.toString() === "" || data.testcase === "[]") {
									let datalist = [{
										"stepNo": "1",
										"custname": "",
										"objectName": "",
										"keywordVal": "",
										"inputVal": "",
										"outputVal": "",
										"url": "",
										"_id_": "",
										"appType": "Generic",
										"remarksStatus": "",
										"remarks": "",
										"addTestCaseDetails": "",
										"addTestCaseDetailsInfo": ""
									}];
									setTestCaseData(datalist);
									// $("#jqGrid").jqGrid('GridUnload');
									// $("#jqGrid").trigger("reloadGrid");
									// contentTable(scriptData.view);
									// $('.cbox').prop('disabled', false);
									// $('.cbox').parent().removeClass('disable_a_href');
									// updateColumnStyle();
									// $("#jqGrid").focusout(()=>{
									// 	updateColumnStyle();
									// })
									return;
								} else {
									let testcase = data.testcase;
									let testcaseArray = [];
									for (let i = 0; i < testcase.length; i++) {
										if ("comments" in testcase[i]) {
											delete testcase[i]; // doubt here
											testcase = testcase.filter(n => n !== null);
										} else {
											if (appType === "Webservice") {
												if (testcase[i].keywordVal === "setHeader" || testcase[i].keywordVal === "setHeaderTemplate") {
													testcase[i].inputVal[0] = testcase[i].inputVal[0].split("##").join("\n")
												}
											}
											testcase[i].stepNo = (i + 1).toString();
											testcaseArray.push(testcase[i]);
										}
									}

                                    setTestCaseData(testcaseArray);
                                    setObjNameList(getObjNameList(props.current_task.appType, scriptData.view));
									// $("#jqGrid_addNewTestScript").jqGrid('clearGridData');
									// $("#jqGrid").jqGrid('GridUnload');
									// $("#jqGrid").trigger("reloadGrid");
									// contentTable(scriptData.view);
									// $('.cbox').prop('disabled', false);
									// $('.cbox').parent().removeClass('disable_a_href');
									// updateColumnStyle();
									// $("#jqGrid").focusout(()=>{
									// 	updateColumnStyle();	
									// });				
									return;
								}
							})
							.catch(error => {
								console.error("Error getObjectType method! \r\n " + (error.data));
							}); //	getObjectType end
						setOverlay("");
					})
					.catch(error => {
						console.error("Error getObjectType method! \r\n " + (error.data));
					}); //	getScrapeData end
			})
			.catch(error => {
				console.error("Error getTestScriptData method! \r\n " + (error.data));
			});

	};

    const PopupDialog = () => (
        <PopupMsg 
            title={showPop.title}
            close={()=>setShowPop("")}
            content={showPop.content}
            submitText="OK"
            submit={()=>setShowPop("")}
        />
    );

    const getKeywords = useCallback(objectName => getKeywordList(objectName, keywordList, props.current_task, testScriptData), []);

    const getRowPlaceholders = useCallback((obType, keywordName) => keywordList[obType][keywordName], [])

    return (
        <>
        { overlay && <ScreenOverlay content={overlay} /> }
        { showPop && <PopupDialog /> }
        <div className="d__content">
            <div className="d__content_wrap">
            { /* Task Name */ }
            <div className="d__task_title">
                <div className="d__task_name">{props.current_task.taskName}</div>
            </div>

            { /* Button Group */ }
            <div className="d__btngroup">
                <div className="d__table_ac_btn_grp">
                {
                    tableActionBtnGroup.map((btn, i) => 
                        <button key={i} className="d__tblBtn" onClick={()=>btn.onClick()}><img className="d__tblBtn_ic" src={btn.img} alt={btn.alt} title={btn.title}/> </button>
                    )
                }
                </div>

                <div className="d__taskBtns">
                    <button className="d__taskBtn d__btn">Save</button>
                    <button className="d__taskBtn d__btn">Delete</button>
                </div>

                <div className="d__submit">
                    { props.current_task.status === "underReview" && <button className="d__reassignBtn d__btn">Reassign</button>}
                    { !hideSubmit && <button className="d__submitBtn d__btn">{props.current_task.status === "underReview" ? "Approve" : "Submit"}</button>}
                </div>

            </div>
            </div>

            { /* Table */ }
            <div className="d__table">
                <div className="d__table_header">
                    <span className="step_col d__step_head" ></span>
                    <span className="sel_col d__sel_head"><input className="sel_obj" type="checkbox"/></span>
                    <span className="objname_col d__obj_head" >Object Name</span>
                    <span className="keyword_col d__key_head" >Keyword</span>
                    <span className="input_col d__inp_head" >Input</span>
                    <span className="output_col d__out_head" >Output</span>
                    <span className="remark_col d__rem_head" >Remarks</span>
                    <span className="details_col d__det_head" >Details</span>
                </div>
                <ReactSortable className="d__table_contents" disabled={true} list={testCaseData} setList={setTestCaseData}>
                {/* <div className="d__table_contents" > */}
                    <TableContents 
                        edit={edit} 
                        objList={objNameList} 
                        testCaseList={testCaseData} 
                        getKeywords={getKeywords} 
                        getRowPlaceholders={getRowPlaceholders} 
                        setCheckedRows={setCheckedRows} 
                        focusedRow={focusedRow}
                        setFocusedRow={setFocusedRow}
                        />
                {/* </div> */}
                </ReactSortable>
            </div>
        </div>
        </>
    );

}

const getObjNameList = (appType, data) => {
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
        case "MobileApp":   if (navigator.appVersion.indexOf("Mac") == -1) obnames = ["@Generic", "@Mobile", "@Android_Custom", "@Action","@Excel","@Word"];
                            else if (navigator.appVersion.indexOf("Mac") != -1) obnames = ["@Generic", "@Mobile", "@CustomiOS","@Excel","@Word"];
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

const getKeywordList = (objectName, keywordList, current_task, scriptData) => {
    let appType = current_task.appType;
    let cord = null;
    let objName = " ";
    let url = " ";
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
            }
            else {
                keywords = Object.keys(keywordList.defaultList);
                selectedKeywordList = "defaultList";
            }
            break;
        case "@System":
            keywords = Object.keys(keywordList.system);
            selectedKeywordList = "getOsInfo";
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
                        if (!(scriptData[j].custname in ['@Browser', '@Oebs', '@Window', '@Generic', '@Custom'])) {
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
                        if (!(scriptData[j].custname in ['@Browser', '@Oebs', '@Window', '@Generic', '@Custom'])) {
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
            selectedKeywordList = "a";
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
            break;
        case "@Word":
            keywords = Object.keys(keywordList.word);
            selectedKeywordList = "word";
            break;
        default: 
            let scrappedDataCustnames = [];
            selectedObj = replaceHtmlEntites(selectedObj.trim());
            
            for (let i = 0; i < scriptData.length; i++) {
                let ob = scriptData[i];
                let custname = ob.custname.trim();
                scrappedDataCustnames.push(custname);

                if ((custname.replace(/\s/g, ' ') === (selectedObj.replace('/\s/g', ' ')).replace('\n', ' '))) {
                    let isIos = scriptData[i].text;
                    if (isIos === 'ios') objName = ob.xpath;
                    else objName = ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ');

                    url = ob.url;
                    let obType = ob.tag;
                    let listType = ob.canselectmultiple;
                    if (ob.cord) {
                        selectedKeywordList = 'iris';
                        cord = ob.cord;
                        obType = "iris";
                        url = "";
                    }

                    if (!(obType in ['a', 'select', 'radiobutton', 'checkbox', 'input', 'list', 'tablecell', 'table', 'img', 'button', 'iris']) && appType in ['Web', 'MobileWeb'] && !ob.tag.startsWith('@PDF')) {
                        keywords = Object.keys(keywordList.element);
                        selectedKeywordList = "element";
                        break;
                    } else if (ob.tag.startsWith("@PDF")) {
                        keywords = Object.keys(keywordList.pdfList);
                        selectedKeywordList = "pdfList";
                        break;
                    } else if (obType === 'elementWS') {
                        keywords = Object.keys(keywordList.elementWS);
                        selectedKeywordList = "elementWS";
                        break;
                    } else if (appType === 'Desktop') {
                        let listType = ob.canselectmultiple;
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
                                if (listType == 'true') {
                                    keywords = Object.keys(keywordList.list);
                                    selectedKeywordList = "list";
                                } else {
                                    keywords = Object.keys(keywordList.select);
                                    selectedKeywordList = "select";
                                }
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
                        let listType = '';
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
                                if (listType == 'true') {
                                    keywords = Object.keys(keywordList.list);
                                    selectedKeywordList = "list";
                                } else {
                                    keywords = Object.keys(keywordList.select);
                                    selectedKeywordList = "select";
                                }
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
                            case 'internal frame':
                                keywords = Object.keys(keywordList.internalframe);
                                selectedKeywordList = "internalframe";
                                break;
                            case 'iris':
                                keywords = Object.keys(keywordList.iris);
                                selectedKeywordList = "iris";
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
    const data = { objectName: objName, keywords: keywords, url: url, cord: cord, obType: selectedKeywordList }
    return data;
}

const replaceHtmlEntites = selectedText => {
	var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
	var translate = {"nbsp": " ","amp" : "&","quot": "\"","lt"  : "<","gt"  : ">"};
	return ( selectedText.replace(translate_re, function(match, entity) {
		return translate[entity];
	}) );
}

export default DesignContent;