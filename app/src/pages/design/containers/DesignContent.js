import React, { useEffect, useState, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSortable } from 'react-sortablejs';
import { ScreenOverlay, RedirectPage, PopupMsg, ScrollBar, ModalContainer } from '../../global'
import TableContents from '../components/TableContents';
import DetailsDialog from '../components/DetailsDialog';
import RemarkDialog from '../components/RemarkDialog';
import PasteStepDialog from '../components/PasteStepDialog';
import * as DesignApi from "../api";
import { reviewTask } from "../../mindmap/api";
import * as pluginActions from "../../plugin/state/action";
import * as designActions from '../state/action';
import "../styles/DesignContent.scss";

const DesignContent = (props) => {
    
    const userInfo = useSelector(state=>state.login.userinfo);
    const copiedContent = useSelector(state=>state.design.copiedTestCases);

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
    const [changed, setChanged] = useState(false);
    const [isUnderReview, setIsUnderReview] = useState(props.current_task.status === "underReview");
    const [rowChange, setRowChange] = useState(false);
    const [headerCheck, setHeaderCheck] = useState(false);
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
        {'title': 'Edit Test Step', 'img': 'static/imgs/ic-jq-editstep.png', 'alt': 'Edit Steps', onClick:  ()=>editRow()},
        {'title': 'Drag & Drop Test Step', 'img': 'static/imgs/ic-jq-dragstep.png', 'alt': 'Drag Steps', onClick:  ()=>toggleDrag()},
        {'title': 'Copy Test Step', 'img': 'static/imgs/ic-jq-copystep.png', 'alt': 'Copy Steps', onClick:  ()=>copySteps()},
        {'title': 'Paste Test Step', 'img': 'static/imgs/ic-jq-pastestep.png', 'alt': 'Paste Steps', onClick:  ()=>onPasteSteps()},
        {'title': 'Skip Test Step', 'img': 'static/imgs/ic-jq-commentstep.png', 'alt': 'Comment Steps', onClick:  ()=>commentRows()}
    ]

    useEffect(()=>{
        if (props.imported) {
            fetchTestCases()
            .then(data=>props.setImported(false))
            .catch(error=>console.error("Error: Fetch TestCase Failed"));
        }
    }, [props.imported]);

    useEffect(()=>{
        if (Object.keys(userInfo).length!==0 && Object.keys(props.current_task).length!==0) {
            fetchTestCases()
            .then(data=>{
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
                    props.setShowPop({ "title": "Deleted objects found", "content": "Deleted objects found in some teststeps, Please delete or modify those steps."});
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
                                resolve("success");
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
                let errorFlag = true;
                let testCases = [...testCaseData]

                for (let i = 0; i < testCases.length; i++) {
                    let step = i + 1
                    testCases[i].stepNo = step;

                    if (!testCases[i].custname || !testCases[i].keywordVal) {
                        let col = "Object Name"
                        if (!testCases[i].keywordVal) col = "keyword"
                        props.setShowPop({'title': 'Save Testcase', 'content': `Please select ${col} Name at Step No. ${step}`})
                        errorFlag = false;
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

                if (errorFlag) {
                    DesignApi.getScrapeDataScreenLevel_ICE()
                        .then(res => {
                            let getScrapeData=res
                            let scrape_data = JSON.parse(JSON.stringify(getScrapeData));
                        })
                        .catch(error=>{
                            console.error("Error:::::", error)
                        });
                    DesignApi.updateTestCase_ICE(testCaseId, testCaseName, testCases, userInfo, versionnumber, import_status)
                    .then(data => {
                        if (data === "Invalid Session") return RedirectPage(history);
                        if (data === "success") {
                            fetchTestCases()
                            .then(data=>{
                                setChanged(false);
                                props.setShowPop({'title': 'Save Testcase', 'content': 'Testcase saved successfully'});
                            })
                            .catch(error=>console.error("Error: Fetch TestCase Failed"));
                            
                            
                            // if(taskInfo.appType.toLowerCase()=="web" && '_modified' in localStorage && localStorage['_modified'] != ""){
                            //     var screenId = taskInfo.screenId;
                            //     var screenName = angular.element(document.getElementById("left-nav-section")).scope().screenName;
                            //     var projectId = taskInfo.projectId;
                            //     var userinfo = JSON.parse(window.localStorage['_UI']);
                            //     scrapeObject = {};
                            //     if(localStorage['_modified'])
                            //     {
                            //         data1=JSON.parse(localStorage['_modified'])
                            //         for(i=0;i<scrape_data.view.length;i++){
                            //             if(scrape_data.view[i].custname in data1){
                            //                 scrape_data.view[i].xpath=data1[scrape_data.view[i].custname]
                            //             }
                            //         } 
                            //     }
                            //     scrapeObject.getScrapeData = JSON.stringify(scrape_data);
                            //     scrapeObject.projectId = projectId;
                            //     scrapeObject.screenId = screenId;
                            //     scrapeObject.screenName = screenName;
                            //     scrapeObject.userinfo = userinfo;
                            //     scrapeObject.param = "updateScrapeData_ICE";
                            //     scrapeObject.appType = taskInfo.appType;
                            //     scrapeObject.versionnumber = taskInfo.versionnumber;
                            //     scrapeObject.newData = viewString;
                            //     if(deleteObjectsFlag==true){
                            //         scrapeObject.type = "delete";
                            //         deleteObjectsFlag = false;
                            //     }
                            //     else
                            //         scrapeObject.type = "save";
                            //     //Update Service to Save Scrape Objects
                            //     DesignApi.updateScreen_ICE(scrapeObject)
                            //         .then(function (data1) {
                            //             if (data1 == "Invalid Session") {
                            //                 return $rootScope.redirectPage();
                            //             }
                            //             if (data1 == "success") {
                            //                 openDialog("Save Testcase", "Testcase saved successfully.");
                            //                 //$("#WSSaveSuccess").modal("show");
                            //                 $("#enbledWS").prop("checked", false)
                            //                 angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
                            //             } else {
                            //                 openDialog("Save Testcase", "Failed to save Testcase.");
                            //                 //$("#WSSaveFail").modal("show")
                            //             }
                            //         }, function (error) {
                            //             console.log("Error")
                            //         })
                            // }
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
            if (testCases[rowIdx].custname !== objName || testCases[rowIdx].keywordVal !== keyword || testCases[rowIdx].inputVal[0] !== inputVal || testCases[rowIdx].outputVal !== outputVal){
                testCases[rowIdx].custname = objName;
                testCases[rowIdx].keywordVal = keyword;
                testCases[rowIdx].inputVal = [inputVal];
                testCases[rowIdx].outputVal = outputVal;
                changed = true;
            }
            setFocusedRow("");
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

        reviewTask(projectId, taskid, taskstatus, version, batchTaskIDs)
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

    const editRow = () => {
        let check = [...checkedRows];
        let focus = null;
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
            for (let idx of selectedRows) {
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
        for(let step of stepList){
            let stepInt = parseInt(step)
            if (testCases.length === 1 && !testCases[0].custname) testCases = copiedContent.testCases
            else testCases.splice(stepInt, 0, ...copiedContent.testCases);
            for(let i=0; i<copiedContent.testCases.length; i++){
                toFocus.push(stepInt+i)
            }
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

        if (selectedIndexes.length === 0) props.setShowPop({'title': 'Skip Testcase step', 'content': 'Please select step to skip'});
        else if (selectedIndexes.length === 1 && !testCases[selectedIndexes[0]].custname) props.setShowPop({'title': 'Comment step', 'content': 'Empty step can not be commented.'});
        else{
            for(let idx of selectedIndexes){
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
            setEdit(false);
            setChanged(true);
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

    return (
        <>
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
                {testCaseData.length>0 && <div className="d__table_contents" >
                <div className="ab">
                    <div className="min">
                        <div className="con">
                            <ScrollBar verticalbarWidth="8px" thumbColor="#321e4f" trackColor="rgb(211, 211, 211)">
                            <ReactSortable disabled={!draggable} key={draggable.toString()} list={testCaseData} setList={setTestCaseData} animation={200} delayOnTouchStart={true} delay={2} ghostClass="d__ghost_row">
                                <TableContents 
                                    edit={edit} 
                                    objList={objNameList} 
                                    testCaseList={testCaseData} 
                                    getKeywords={getKeywords} 
                                    getRowPlaceholders={getRowPlaceholders} 
                                    checkedRows={checkedRows}
                                    updateChecklist={updateChecklist} 
                                    focusedRow={focusedRow}
                                    setFocusedRow={setFocusedRow}
                                    setRowData={setRowData}
                                    showRemarkDialog={showRemarkDialog}
                                    showDetailDialog={showDetailDialog}
                                    rowChange={rowChange}
                                    />
                            </ReactSortable>
                            </ScrollBar>
                        </div>
                    </div>
                </div>
                </div>}
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

                    if (!(['a', 'select', 'radiobutton', 'checkbox', 'input', 'list', 'tablecell', 'table', 'img', 'button', 'iris'].includes(obType)) && ['Web', 'MobileWeb'].includes(appType) && !ob.tag.startsWith('@PDF')) {
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