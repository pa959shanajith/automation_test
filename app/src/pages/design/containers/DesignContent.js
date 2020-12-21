import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSortable } from 'react-sortablejs';
import ClickAwayListener from 'react-click-away-listener';
import { ScreenOverlay, RedirectPage, ScrollBar, ModalContainer } from '../../global'
import { getObjNameList, getKeywordList } from '../components/UtilFunctions';
import TableRow from '../components/TableRow';
import DetailsDialog from '../components/DetailsDialog';
import RemarkDialog from '../components/RemarkDialog';
import PasteStepDialog from '../components/PasteStepDialog';
import SelectMultipleDialog from '../components/SelectMultipleDialog';
import * as DesignApi from "../api";
import * as pluginActions from "../../plugin/state/action";
import * as designActions from '../state/action';
import "../styles/DesignContent.scss";

/*
    Container: Design Content
    Uses: Renders middle screen contents of design screen 
    Props: 
        current_task -> current task state from redux
        imported -> imported flag / changes everytime a testcase is imported
        setImported -> setState for imported flag
        setMirror -> setState for mirror value
        setShowPop -> showPopup state
        setShowConfirmPop -> confirmation dialog popup
        setDisableActionBar -> flag to set if action bar is required to disable
*/

const DesignContent = (props) => {
    
    const userInfo = useSelector(state=>state.login.userinfo);
    const copiedContent = useSelector(state=>state.design.copiedTestCases);
    const modified = useSelector(state=>state.design.modified);
    const saveEnable = useSelector(state=>state.design.saveEnable);

    const history = useHistory();
    const dispatch = useDispatch();
    const [overlay, setOverlay] = useState("");
    const [hideSubmit, setHideSubmit] = useState(false);
    const [keywordList, setKeywordList] = useState(null);
    const [testCaseData, setTestCaseData] = useState([]);
    const [testScriptData, setTestScriptData] = useState(null);
    const [checkedRows, setCheckedRows] = useState([]);
    const [focusedRow, setFocusedRow] = useState(null);
    const [draggable, setDraggable] = useState(false);
    const [dataFormat, setDataFormat] = useState(null);
    const [objNameList, setObjNameList] = useState(null);
    const [showConfPaste, setShowConfPaste] = useState(false);
    const [showPS, setShowPS] = useState(false);
    const [edit, setEdit] = useState(false);
    const [showRemarkDlg, setShowRemarkDlg] = useState(false);
    const [showDetailDlg, setShowDetailDlg] = useState(false);
    const [showSM, setShowSM] = useState(false);
    const [changed, setChanged] = useState(false);
    const [isUnderReview, setIsUnderReview] = useState(props.current_task.status === "underReview");
    const [rowChange, setRowChange] = useState(false);
    const [headerCheck, setHeaderCheck] = useState(false);
    const [clickedAway, setClickAway] = useState(false);
    const [commentFlag, setCommentFlag] = useState(false);
    let runClickAway = true;
    const emptyRowData = {
        "objectName": "",
        "custname": "",
        "keywordVal": "",
        "inputVal": [""],
        "outputVal": "",
        "stepNo": "",
        "url": "",
        "appType": "Generic",
        "remarksStatus": "",
        "remarks": "",
        "_id_": "",
        "addTestCaseDetails": "",
        "addTestCaseDetailsInfo": ""
    };
    // let checkArray = [];
    

    const tableActionBtnGroup = [
        {'title': 'Add Test Step', 'img': 'static/imgs/ic-jq-addstep.png', 'alt': 'Add Steps', onClick: ()=>addRow()},
        {'title': 'Select Test Step(s)', 'img': 'static/imgs/ic-selmulti.png', 'alt': 'Select Steps', onClick: ()=>selectMultiple()},
        {'title': 'Edit Test Step', 'img': 'static/imgs/ic-jq-editstep.png', 'alt': 'Edit Steps', onClick:  ()=>editRow()},
        {'title': 'Drag & Drop Test Step', 'img': 'static/imgs/ic-jq-dragstep.png', 'alt': 'Drag Steps', onClick:  ()=>toggleDrag()},
        {'title': 'Copy Test Step', 'img': 'static/imgs/ic-jq-copystep.png', 'alt': 'Copy Steps', onClick:  ()=>copySteps()},
        {'title': 'Paste Test Step', 'img': 'static/imgs/ic-jq-pastestep.png', 'alt': 'Paste Steps', onClick:  ()=>onPasteSteps()},
        {'title': 'Skip Test Step', 'img': 'static/imgs/ic-jq-commentstep.png', 'alt': 'Comment Steps', onClick:  ()=>commentRows()}
    ]

    useEffect(()=>{
        dispatch({type: designActions.SET_TESTCASES, payload: testCaseData})
    }, [testCaseData]);

    useEffect(()=>{
        setChanged(true);
        console.log(`shipped ${saveEnable}`);
    }, [saveEnable]);

    useEffect(()=>{
        if (props.imported) {
            fetchTestCases()
            .then(data=>{
                data !== "success" && props.setShowPop({ "title": "Deleted objects found", "content": "Deleted objects found in some teststeps, Please delete or modify those steps."});
                props.setImported(false)
            })
            .catch(error=>console.error("Error: Fetch TestCase Failed"));
        }
    }, [props.imported]);

    useEffect(()=>{
        if (Object.keys(userInfo).length!==0 && Object.keys(props.current_task).length!==0) {
            fetchTestCases()
            .then(data=>{
                data !== "success" &&
                props.setShowPop({ "title": "Deleted objects found", "content": "Deleted objects found in some teststeps, Please delete or modify those steps."});
                setEdit(false);
                setFocusedRow(null);
                setCheckedRows([]);
                setDraggable(false);
                setChanged(false);
                setHeaderCheck(false);
                setIsUnderReview(props.current_task.status === "underReview")
            })
            .catch(error=>console.error("Error: Fetch TestCase Failed"));
        }
    }, [userInfo, props.current_task]);

    const fetchTestCases = () => {
		return new Promise((resolve, reject)=>{
            let taskInfo = props.current_task;
            let testCaseId = taskInfo.testCaseId;
            let testCaseName = taskInfo.testCaseName;
            let versionnumber = taskInfo.versionnumber;
            let deleteObjectFlag = false;
            
            setOverlay("Loading...");
            
            // service call # 1 - getTestScriptData service call
            DesignApi.readTestCase_ICE(userInfo, testCaseId, testCaseName, versionnumber, taskInfo.screenName)
            .then(data => {
                if (data === "Invalid Session") RedirectPage(history);
                
                let changeFlag = false
                let taskObj = props.current_task
                if(data.screenName && data.screenName !== taskObj.screenName){
                    taskObj.screenName = data.screenName;
                    changeFlag = true
                }
                if(data.reuse && data.reuse !== taskObj.reuse){
                    taskObj.reuse = "True";
                    changeFlag = true
                }
                if (changeFlag) dispatch({type: pluginActions.SET_CT, payload: taskObj});

                if(data.del_flag){
                    //pop up for presence of deleted objects
                    deleteObjectFlag = true;
                    //disable left-top-section
                    props.setDisableActionBar(true);
                }
                else{
                    //enable left-top-section
                    props.setDisableActionBar(false);
                }
                let appType = taskInfo.appType;
                // $('#jqGrid').removeClass('visibility-hide').addClass('visibility-show');
                // removing the down arrow from grid header columns - disabling the grid menu pop-up
                // $('.ui-grid-icon-angle-down').removeClass('ui-grid-icon-angle-down');
                // $("#jqGrid").jqGrid('clearGridData');
                
                setHideSubmit(data.testcase.length === 0);
                
                
                // $('#jqGrid').show();
                // service call # 2 - objectType service call 

                DesignApi.getScrapeDataScreenLevel_ICE(appType, taskInfo.screenId, taskInfo.projectId, taskInfo.testCaseId)
                    .then(scriptData => {
                        if (scriptData === "Invalid Session") RedirectPage(history);
                        if (appType === "Webservice"){
                            if (scriptData.view.length > 0) {
                                if (scriptData.view[0].header) setDataFormat(scriptData.view[0].header[0].split("##").join("\n"));
                                else setDataFormat(scriptData.header[0].split("##").join("\n"));
                            }	
                        }
                        
                        setTestScriptData(scriptData.view);
                        props.setMirror(scriptData.mirror);
                        
                        // service call # 3 -objectType service call
                        DesignApi.getKeywordDetails_ICE(appType)
                            .then(keywordData => {
                                if (keywordData === "Invalid Session") RedirectPage(history);
                                
                                setKeywordList(keywordData);
                                let testcaseArray = [];
                                if (data === "" || data === null || data === "{}" || data === "[]" || data.testcase.toString() === "" || data.testcase === "[]") {
                                    testcaseArray.push(emptyRowData);
                                    props.setDisableActionBar(true);
                                    // $("#jqGrid").jqGrid('GridUnload');
                                    // $("#jqGrid").trigger("reloadGrid");
                                    // contentTable(scriptData.view);
                                    // $('.cbox').prop('disabled', false);
                                    // $('.cbox').parent().removeClass('disable_a_href');
                                    // updateColumnStyle();
                                    // $("#jqGrid").focusout(()=>{
                                    // 	updateColumnStyle();
                                    // })
                                    
                                    setOverlay("");
                                } else {
                                    let testcase = data.testcase;
                                    
                                    for (let i = 0; i < testcase.length; i++) {
                                        if ("comments" in testcase[i]) {
                                            delete testcase[i];
                                            testcase = testcase.filter(n => n !== null);
                                        } else {
                                            if (appType === "Webservice") {
                                                if (testcase[i].keywordVal === "setHeader" || testcase[i].keywordVal === "setHeaderTemplate") {
                                                    testcase[i].inputVal[0] = testcase[i].inputVal[0].split("##").join("\n")
                                                }
                                            }
                                            testcase[i].stepNo = (i + 1).toString();
                                            testcaseArray.push(testcase[i]);
                                            props.setDisableActionBar(false);
                                        }
                                    }
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
                                    setOverlay("");
                                }
                                setTestCaseData(testcaseArray);
                                setObjNameList(getObjNameList(props.current_task.appType, scriptData.view));
                                let msg = deleteObjectFlag ? "deleteObjs" : "success"
                                resolve(msg);
                            })
                            .catch(error => {
                                setOverlay("");
                                setTestCaseData([]);
                                setTestScriptData(null);
                                setKeywordList(null);
                                setObjNameList(null);
                                console.error("Error getObjectType method! \r\n " + (error.data));
                                reject("fail");
                            }); //	getObjectType end
                        
                    })
                    .catch(error => {
                        setOverlay("");
                        setTestCaseData([]);
                        setTestScriptData(null);
                        setKeywordList(null);
                        setObjNameList(null);
                        console.error("Error getObjectType method! \r\n " + (error));
                        reject("fail");
                    }); //	getScrapeData end
            })
            .catch(error => {
                setOverlay("");
                setTestCaseData([]);
                setTestScriptData(null);
                setKeywordList(null);
                setObjNameList(null);
                console.error("Error getTestScriptData method! \r\n " + (error));
                reject("fail");
            });
        });
    };
    
    const saveTestCases = () => {
        if (userInfo.role !== "Viewer") {
            let screenId = props.current_task.screenId;
            let testCaseId = props.current_task.testCaseId;
            let testCaseName = props.current_task.testCaseName;
            let versionnumber = props.current_task.versionnumber;
            let import_status = false;

            if (String(screenId) !== "undefined" && String(testCaseId) !== "undefined") {
                let errorFlag = false;
                let testCases = [...testCaseData]

                for (let i = 0; i < testCases.length; i++) {
                    let step = i + 1
                    testCases[i].stepNo = step;

                    if (!testCases[i].custname || !testCases[i].keywordVal) {
                        let col = "Object Name"
                        if (!testCases[i].keywordVal) col = "keyword"
                        props.setShowPop({'title': 'Save Testcase', 'content': `Please select ${col} Name at Step No. ${step}`})
                        errorFlag = true;
                        break;
                    } else {
                        testCases[i].custname = testCases[i].custname.trim();
                         if (testCases[i].keywordVal == 'SwitchToFrame' && String(testScriptData) !== "undefined") {
                            let scriptData = [...testScriptData];
                            for (let j = 0; j < scriptData.length; j++) {
                                if (!(['@Browser', '@Oebs', '@Window', '@Generic', '@Custom'].includes(scriptData[j].custname)) && scriptData[j].url !== "") {
                                    testCases[i].url = scriptData[j].url;
                                    break;
                                }
                            }
                        }
                        if (["setHeader", "setHeaderTemplate"].includes(testCases[i].keywordVal)) {
                            if (typeof (testCases[i].inputVal) === "string") testCases[i].inputVal = testCases[i].inputVal.replace(/[\n\r]/g, '##');
                            else testCases[i].inputVal[0] = testCases[i].inputVal[0].replace(/[\n\r]/g, '##');
                        }
                    }
                    if (testCases[i].url == undefined) testCases[i].url = "";
                    
                    if (testCases[i].cord === null) testCases[i].cord = "";

                }

                if (!errorFlag) {
                    let scrape_data = null;
                    let taskInfo = props.current_task;
                    DesignApi.getScrapeDataScreenLevel_ICE(taskInfo.appType, taskInfo.screenId, taskInfo.projectId, taskInfo.testCaseId)
                        .then(res => {
                            let getScrapeData=res
                            scrape_data = JSON.parse(JSON.stringify(getScrapeData));
                        })
                        .catch(error=>{
                            console.error("Error:::::", error)
                        });
                    DesignApi.updateTestCase_ICE(testCaseId, testCaseName, testCases, userInfo, versionnumber, import_status)
                    .then(data => {
                        if (data === "Invalid Session") return RedirectPage(history);
                        if (data === "success") {
                            
                            if(props.current_task.appType.toLowerCase()==="web" && Object.keys(modified).length !== 0){
                                let screenId = props.current_task.screenId;
                                let screenName = props.current_task.screenName;
                                let projectId = props.current_task.projectId;
                                
                                let scrapeObject = {};
                                for(let i=0; i<scrape_data.view.length; i++){
                                    if(scrape_data.view[i].custname in modified){
                                        scrape_data.view[i].xpath=modified[scrape_data.view[i].custname]
                                    }
                                } 

                                scrapeObject.getScrapeData = JSON.stringify(scrape_data);
                                scrapeObject.projectId = projectId;
                                scrapeObject.screenId = screenId;
                                scrapeObject.screenName = screenName;
                                scrapeObject.userinfo = userInfo;
                                scrapeObject.param = "updateScrapeData_ICE";
                                scrapeObject.appType = props.current_task.appType;
                                scrapeObject.versionnumber = props.current_task.versionnumber;
                                scrapeObject.newData = {}; //viewString
                                scrapeObject.type = "save";
                                
                                DesignApi.updateScreen_ICE(scrapeObject)
                                .then(data1 => {
                                    if (data1 === "Invalid Session") return RedirectPage(history);
                                    
                                    if (data1 === "success") {            
                                        fetchTestCases()
                                        .then(msg=>{
                                            setChanged(false);
                                            msg === "success" ? props.setShowPop({'title': 'Save Testcase', 'content': 'Testcase saved successfully'})
                                            : props.setShowPop({ "title": "Deleted objects found", "content": "Deleted objects found in some teststeps, Please delete or modify those steps."})
                                        })
                                        .catch(error=>console.error("Error: Fetch TestCase Failed"));
                                    } else {
                                        props.setShowPop({'title': 'Save Testcase', 'content': 'Failed to save Testcase'});
                                    }
                                })
                                .catch(error => {
                                    console.error("Error")
                                })
                            }
                            else{
                                fetchTestCases()
                                .then(data=>{
                                    setChanged(false);
                                    data === "success" ? props.setShowPop({'title': 'Save Testcase', 'content': 'Testcase saved successfully'}) 
                                    : props.setShowPop({ "title": "Deleted objects found", "content": "Deleted objects found in some teststeps, Please delete or modify those steps."});
                                })
                                .catch(error=>console.error("Error: Fetch TestCase Failed"));
                            }
                        } else {
                            props.setShowPop({'title':'Save Testcase', 'content':'Failed to save Testcase'})
                        };
                    })
                    .catch(error => { 
                        console.error("Error::::", error);
                    });
                    errorFlag = false;
                }
            } else {
                props.setShowPop({'title':'Save Testcase', 'content':'ScreenID or TestscriptID is undefined'});
            }
        }
        setFocusedRow(null);
        setCheckedRows([]);
        setHeaderCheck(false);
    }

    const setRowData = (data) => {
        let testCases = [...testCaseData];
        let { rowIdx, operation } = data;
        let changed = false;
        if (operation === "row") {
            const { objName, keyword, inputVal, outputVal } = data;
            if (testCases[rowIdx].custname !== objName || testCases[rowIdx].keywordVal !== keyword || testCases[rowIdx].inputVal[0] !== inputVal || testCases[rowIdx].outputVal !== outputVal || commentFlag){
                testCases[rowIdx].custname = objName;
                testCases[rowIdx].keywordVal = keyword;
                testCases[rowIdx].inputVal = [inputVal];

                let outputVal2 = outputVal
                if (commentFlag) {
                    let isComment = outputVal2.slice(-2) === "##";
                    if (isComment) outputVal2 = outputVal2.replace(/(;*##)$/g, "")
                    else outputVal2 += outputVal2.length === 0 ? "##" : ";##"
                    setCommentFlag(false);
                }

                testCases[rowIdx].outputVal = outputVal2;
                changed = true;
            }
        }
        else if (operation === "remarks") {
            testCases[rowIdx].remarks = data.remarks;
            changed = true;
        }
        else if (operation === "details") {
            let testCase = {...testCases[rowIdx]};
            testCase.addTestCaseDetailsInfo = data.details;
            testCases[rowIdx] = testCase
            changed = true;
        }
        if (changed) {
            setTestCaseData(testCases);
            setChanged(true);
            setRowChange(!rowChange);
        }
    }

    const redirectToPlugin = () => {
        window.localStorage['navigateScreen'] = "plugin";
        history.replace('/plugin');
    }

    const submitTask = (submitOperation) => {
		let taskid = props.current_task.subTaskId;
		let taskstatus = props.current_task.status;
		let version = props.current_task.versionnumber;
		let batchTaskIDs = props.current_task.batchTaskIDs;
        let projectId = props.current_task.projectId;
        
		if (submitOperation === 'reassign') {
			taskstatus = 'reassign';
        }

        DesignApi.reviewTask(projectId, taskid, taskstatus, version, batchTaskIDs)
        .then(result => {
            if (result === "fail") props.setShowPop({'title': 'Task Submission Error', 'content': 'Reviewer is not assigned !'});
            else if (taskstatus === 'reassign') props.setShowPop({'title': "Task Reassignment Success", 'content': "Task Reassigned successfully!", onClick: ()=>redirectToPlugin()});
            else if (taskstatus === 'underReview') props.setShowPop({'title': "Task Completion Success", 'content': "Task Approved successfully!", onClick: ()=>redirectToPlugin()});
            else props.setShowPop({'title': "Task Submission Success", 'content': "Task Submitted successfully!", onClick: ()=>redirectToPlugin()});
        })
        .catch(error => {
			console.error(error);
        })
        
        props.setShowConfirmPop(false);
    }

    const deleteTestcase = () => {
        let testCases = [...testCaseData]
        if (testCases.length === 1 && !testCases[0].custname) props.setShowPop({'title': 'Delete Testcase step', 'content': 'No steps to Delete'});
        else if (checkedRows.length <= 0) props.setShowPop({'title': 'Delete Test step', 'content': 'Select steps to delete'});
        else if (props.current_task.reuse === 'True') props.setShowConfirmPop({'title': 'Delete Test Step', 'content': 'Testcase is been reused. Are you sure, you want to delete?', 'onClick': ()=>onDeleteTestStep()});
        else props.setShowConfirmPop({'title': 'Delete Test Step', 'content': 'Are you sure, you want to delete?', 'onClick': ()=>onDeleteTestStep()});
    }

    const onDeleteTestStep = () => {
        let testCases = [...testCaseData]
        testCases = testCases.filter((val, idx) => !checkedRows.includes(idx))
        setTestCaseData(testCases);
        setCheckedRows([]);
        setHeaderCheck(false);
        setFocusedRow(null);
        props.setShowConfirmPop(false);
        setChanged(true);
    }

    const addRow = () => {
        let testCases = [...testCaseData]
        let insertedRowIdx = [];
        if (checkedRows.length === 1) {
            const rowIdx = checkedRows[0];
            testCases.splice(rowIdx+1, 0, emptyRowData);
            insertedRowIdx.push(rowIdx+1)
        }
        else {
            testCases.splice(testCaseData.length, 0, emptyRowData);
            insertedRowIdx.push(testCaseData.length)
        }
        setTestCaseData(testCases);
        setCheckedRows([]);
        setHeaderCheck(false);
        setFocusedRow(insertedRowIdx);
        setChanged(true);
        // setEdit(false);
    }

    const selectMultiple = () => {
        setHeaderCheck(false);
        setFocusedRow(null);
        setShowSM(true);
    }

    const selectSteps = stepList => {
        stepList.push(...checkedRows)
        let newChecks = Array.from(new Set(stepList))
        setCheckedRows([...newChecks]);
        setShowSM(false);
    }

    const editRow = () => {
        let check = [...checkedRows];
        let focus = null;
        runClickAway = false;
        if (check.length === 0) props.setShowPop({'title': 'Edit Step', 'content': 'Select step to edit'});
        else {
            if (check.length === 1) focus = check[0]
            else check = []
            
            setCheckedRows(check);
            setHeaderCheck(false);
            setFocusedRow(focus);
            setEdit(true);
            setDraggable(false);
        }
    }

    const toggleDrag = () => {
        setCheckedRows([]);
        setFocusedRow(null);
        setHeaderCheck(false);
        setEdit(false);

        if (draggable) setDraggable(false);
        else setDraggable(true);
    }

    const copySteps = () => {
        let selectedRows = [...checkedRows]
        let copyTestCases = []
        let copyContent = {}
        if (selectedRows.length === 0) props.setShowPop({'title': 'Copy Test Step', 'content': 'Select step to copy'});
        else{
            let sortedSteps = selectedRows.map(step=>parseInt(step)).sort((a,b)=>a-b)
            for (let idx of sortedSteps) {
                if (!testCaseData[idx].custname) {
                    if (selectedRows.length === 1) props.setShowPop({'title': 'Copy Test Step', 'content': 'Empty step can not be copied.'});
                    else props.setShowPop({'title': 'Copy Test Step', 'content': 'The operation cannot be performed as the steps contains invalid/blank object references'});
                    break
                } 
                else{
                    let testCase = Object.assign({}, testCaseData[idx])
                    copyTestCases.push(testCase);
                }
            }
            
            copyContent = {'appType': props.current_task.appType, 'testCaseId': props.current_task.testCaseId, 'testCases': copyTestCases}
            setCheckedRows([]);
            setHeaderCheck(false);
            setEdit(false);
            setFocusedRow(null);
            dispatch({type: designActions.SET_COPYTESTCASES, payload: copyContent});
        }
    }

    const onPasteSteps = () => {
        setFocusedRow(null);

        if (!copiedContent.testCaseId){
            // console.log("No TestCase to Paste");
            return;
        }

        if (copiedContent.testCaseId !== props.current_task.testCaseId) {
            let appTypeFlag = false;
            for (let testCase of copiedContent.testCases){
                if (["Web", "Desktop", "Mainframe", "OEBS", "MobileApp", "MobileWeb", "MobileApp", "SAP"].includes(testCase.appType)) {
                    appTypeFlag = true;
                    break;
                }
            }
            if (copiedContent.appType !== props.current_task.appType && appTypeFlag) {
                props.setShowPop({'title': 'Paste Test Step', 'content': 'Project Type is not same.'});
            }
            else{
                setShowConfPaste(true);
            }
        }
        else setShowPS(true);
    }

    const ConfPasteStep = () => (
        <ModalContainer 
            title="Paste Test Step"
            close={()=>setShowConfPaste(false)} 
            content="Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?"
            footer={
                <>
                <button onClick={()=>{
                    setShowConfPaste(false);
                    setShowPS(true);
                }}>Yes</button>
                <button onClick={()=>setShowConfPaste(false)}>No</button>
                </>}
        />
    );

    const pasteSteps = (stepList) => {
        let toFocus = []
        let testCases = [...testCaseData]
        let offset = 0;

        let sortedSteps = stepList.map(step=>parseInt(step)).sort((a,b)=>a-b)

        for(let step of sortedSteps){
            let stepInt = parseInt(step)
            stepInt = stepInt+offset
            if (testCases.length === 1 && !testCases[0].custname) testCases = copiedContent.testCases
            else testCases.splice(stepInt, 0, ...copiedContent.testCases);
            for(let i=0; i<copiedContent.testCases.length; i++){
                toFocus.push(stepInt+i);
            }
            offset=offset+copiedContent.testCases.length;
        }
        setTestCaseData(testCases);
        setShowPS(false);
        setFocusedRow(toFocus);
        setCheckedRows([]);
        setHeaderCheck(false);
        setChanged(true);
    }

    const commentRows = () => {
        let selectedIndexes = [...checkedRows]
        let testCases = [ ...testCaseData ]
        runClickAway = false;
        if (selectedIndexes.length === 0) props.setShowPop({'title': 'Skip Testcase step', 'content': 'Please select step to skip'});
        else if (selectedIndexes.length === 1 && !testCases[selectedIndexes[0]].custname) props.setShowPop({'title': 'Comment step', 'content': 'Empty step can not be commented.'});
        else{
            for(let idx of selectedIndexes){
                if (focusedRow === idx) continue;
                let testCase = { ...testCases[idx] }
                let isComment = testCase.outputVal.slice(-2) === "##";
                if (isComment) testCase.outputVal = testCase.outputVal.replace(/(;*##)$/g, "")
                else testCase.outputVal += testCase.outputVal.length === 0 ? "##" : ";##"
                testCases[idx] = { ...testCase }
            }
            setTestCaseData(testCases);
            setFocusedRow(null);
            setCheckedRows([]);
            setHeaderCheck(false);
            // setEdit(false);
            // setRowChange(!rowChange);
            setChanged(true);
            setCommentFlag(true);
        }
    }

    

    const showRemarkDialog = (rowIdx) => {
        setFocusedRow(null);
        setShowRemarkDlg(String(rowIdx));
    }

    const showDetailDialog = (rowIdx) => {
        setFocusedRow(null);
        setShowDetailDlg(String(rowIdx));
    }

    const updateChecklist = (RowIdx, click, msg) => {
        let check = [...checkedRows]
        let headerCheckFlag = false
        let focusIdx = null;
        let loc = check.indexOf(RowIdx);
        if (loc>=0) {
            if (click==="check") check.splice(loc, 1)
            else focusIdx = RowIdx
        }
        else {
            check.push(RowIdx)
            focusIdx = RowIdx;
        }
        if (check.length === testCaseData.length) headerCheckFlag = true;
        if (msg === "noFocus") focusIdx = null;
        // checkArray = check;
        setHeaderCheck(headerCheckFlag);
        setFocusedRow(focusIdx); 
        setCheckedRows(check);
    }

    const onAction = (operation) => {
        switch(operation){
            case "submit": props.setShowConfirmPop({'title':'Submit Task', 'content': 'Are you sure you want to submit the task ?', 'onClick': ()=>submitTask(operation)});
                           break;
            case "reassign": props.setShowConfirmPop({'title':'Reassign Task', 'content': 'Are you sure you want to reassign the task ?', 'onClick': ()=>submitTask(operation)});
                             break;
            case "approve": props.setShowConfirmPop({'title':'Approve Task', 'content': 'Are you sure you want to approve the task ?', 'onClick': ()=>submitTask(operation)});
                            break;
            default: break;
        }                       
    }

    const onCheckAll = (event) => {
        let checkList = [...checkedRows]
        if (event.target.checked) {
            checkList = new Array(testCaseData.length);
            for (let i=0; i<checkList.length; i++ ) checkList[i] = i;
        }
        else {
            checkList = []
        }
        setFocusedRow(null); 
        setHeaderCheck(event.target.checked);
        setCheckedRows(checkList);
    }

    const getKeywords = useCallback(objectName => getKeywordList(objectName, keywordList, props.current_task, testScriptData), [keywordList, props.current_task, testScriptData]);

    const getRowPlaceholders = useCallback((obType, keywordName) => keywordList[obType][keywordName], [keywordList])
    let key = 0;
    return (
        <>
        { showSM && <SelectMultipleDialog setShow={setShowSM} selectSteps={selectSteps} upperLimit={testCaseData.length} /> }
        { showPS && <PasteStepDialog setShow={setShowPS} pasteSteps={pasteSteps} upperLimit={testCaseData.length}/> }
        { showRemarkDlg && <RemarkDialog remarks={testCaseData[parseInt(showRemarkDlg)].remarks} setShow={setShowRemarkDlg} onSetRowData={setRowData} idx={showRemarkDlg} firstname={userInfo.firstname} lastname={userInfo.lastname}/> }
        { showDetailDlg && <DetailsDialog TCDetails={testCaseData[showDetailDlg].addTestCaseDetailsInfo && JSON.parse(testCaseData[showDetailDlg].addTestCaseDetailsInfo)} setShow={setShowDetailDlg} onSetRowData={setRowData} idx={showDetailDlg} /> }
        { overlay && <ScreenOverlay content={overlay} /> }
        { showConfPaste && <ConfPasteStep />}
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
                    <button className="d__taskBtn d__btn" onClick={saveTestCases} disabled={!changed}>Save</button>
                    <button className="d__taskBtn d__btn" onClick={deleteTestcase}>Delete</button>
                </div>

                <div className="d__submit">
                    { isUnderReview && 
                        <>
                        <button className="d__reassignBtn d__btn" 
                                onClick={()=>onAction("reassign")}>
                            Reassign
                        </button>
                        <button className="d__approveBtn d__btn" onClick={()=>onAction("approve")}>
                            Approve
                        </button>
                        </>
                    }
                    { !hideSubmit && !isUnderReview &&
                        <button className="d__submitBtn d__btn" onClick={()=>onAction("submit")}>
                            Submit
                        </button>
                    }
                </div>

            </div>
            </div>

            { /* Table */ }
            <div className="d__table">
                <div className="d__table_header">
                    <span className="step_col d__step_head" ></span>
                    <span className="sel_col d__sel_head"><input className="sel_obj" type="checkbox" checked={headerCheck} onChange={onCheckAll}/></span>
                    <span className="objname_col d__obj_head" >Object Name</span>
                    <span className="keyword_col d__key_head" >Keyword</span>
                    <span className="input_col d__inp_head" >Input</span>
                    <span className="output_col d__out_head" >Output</span>
                    <span className="remark_col d__rem_head" >Remarks</span>
                    <span className="details_col d__det_head" >Details</span>
                </div>
                <ClickAwayListener onClickAway={()=>{ runClickAway ? setFocusedRow(null) : runClickAway=true}} style={{height: "100%"}}>
                {testCaseData.length>0 && <div className="d__table_contents" >
                <div className="ab">
                    <div className="min">
                        <div className="con">
                            <ScrollBar verticalbarWidth="8px" thumbColor="#321e4f" trackColor="rgb(211, 211, 211)">
                            <ReactSortable disabled={!draggable} key={draggable.toString()} list={testCaseData} setList={setTestCaseData} animation={200} ghostClass="d__ghost_row">
                                {
                                testCaseData.map((testCase, i) => <TableRow 
                                    key={key++} idx={i} objList={objNameList} testCase={testCase} edit={edit} 
                                    getKeywords={getKeywords} getRowPlaceholders={getRowPlaceholders} checkedRows={checkedRows}
                                    updateChecklist={updateChecklist} focusedRow={focusedRow} setFocusedRow={setFocusedRow}
                                    setRowData={setRowData} showRemarkDialog={showRemarkDialog} showDetailDialog={showDetailDialog}
                                    rowChange={rowChange}
                                                        />)
                                }
                            </ReactSortable>
                            </ScrollBar>
                        </div>
                    </div>
                </div>
                </div>}
                </ClickAwayListener>
            </div>
        </div>
        </>
    );

}

export default DesignContent;