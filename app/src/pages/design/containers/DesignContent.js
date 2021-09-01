import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSortable } from 'react-sortablejs';
import ClickAwayListener from 'react-click-away-listener';
import { ScreenOverlay, RedirectPage, ScrollBar, ModalContainer, VARIANT, Messages as MSG } from '../../global'
import { getObjNameList, getKeywordList } from '../components/UtilFunctions';
import TableRow from '../components/TableRow';
import DetailsDialog from '../components/DetailsDialog';
import RemarkDialog from '../components/RemarkDialog';
import PasteStepDialog from '../components/PasteStepDialog';
import SelectMultipleDialog from '../components/SelectMultipleDialog';
import * as DesignApi from "../api";
import { reviewTask } from '../../global/api';
import * as pluginActions from "../../plugin/state/action";
import * as designActions from '../state/action';
import "../styles/DesignContent.scss";

/*
    Container: DesignContent
    Uses: Renders middle contents of DesignScreen 
    Props: 
        current_task -> current task state from redux
        imported -> imported flag / changes everytime a testcase is imported
        setImported -> Changes "imported" state
        setMirror -> Changes "mirror" state
        setShowPop -> Show/Hide MsgPopup,  arguments used - {title:'',content:''}/false
        setShowConfirmPop -> Show/Hide Confirmation Popup,  arguments used - {title:'',content:'',footer:''}/false
        setDisableActionBar -> Manages Disabling/Enabling of ActionBar
*/

const DesignContent = props => {
    
    const userInfo = useSelector(state=>state.login.userinfo);
    const copiedContent = useSelector(state=>state.design.copiedTestCases);
    const modified = useSelector(state=>state.design.modified);
    const saveEnable = useSelector(state=>state.design.saveEnable);

    const headerCheckRef = useRef();

    const history = useHistory();
    const dispatch = useDispatch();
    const [overlay, setOverlay] = useState("");
    const [hideSubmit, setHideSubmit] = useState(false);
    const [keywordList, setKeywordList] = useState(null);
    const [testCaseData, setTestCaseData] = useState([]);
    const [testScriptData, setTestScriptData] = useState(null);
    const [stepSelect, setStepSelect] = useState({edit: false, check: [], highlight: []});
    const [draggable, setDraggable] = useState(false);
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
    const [draggedFlag, setDraggedFlag] = useState(false);
    const [commentFlag, setCommentFlag] = useState(false);
    const [reusedTC, setReusedTC] = useState(false);
    const [pastedTC, setPastedTC] = useState([]);
    let runClickAway = true;
    const emptyRowData = {
        "objectName": "",
        "custname": "",
        "keywordVal": "",
        "inputVal": [""],
        "outputVal": "",
        "stepNo": "",
        "url": "",
        "appType": "",
        "remarksStatus": "",
        "remarks": "",
        "_id_": "",
        "addTestCaseDetails": "",
        "addTestCaseDetailsInfo": ""
    };

    const tableActionBtnGroup = [
        {'title': 'Add Test Step', 'img': 'static/imgs/ic-jq-addstep.png', 'alt': 'Add Steps', onClick: ()=>addRow()},
        {'title': 'Edit Test Step', 'img': 'static/imgs/ic-jq-editstep.png', 'alt': 'Edit Steps', onClick:  ()=>editRow()},
        {'title': 'Select Test Step(s)', 'img': 'static/imgs/ic-selmulti.png', 'alt': 'Select Steps', onClick: ()=>selectMultiple()},
        {'title': 'Drag & Drop Test Step', 'img': 'static/imgs/ic-jq-dragstep.png', 'alt': 'Drag Steps', onClick:  ()=>toggleDrag()},
        {'title': 'Copy Test Step', 'img': 'static/imgs/ic-jq-copystep.png', 'alt': 'Copy Steps', onClick:  ()=>copySteps()},
        {'title': 'Paste Test Step', 'img': 'static/imgs/ic-jq-pastestep.png', 'alt': 'Paste Steps', onClick:  ()=>onPasteSteps()},
        {'title': 'Skip Test Step', 'img': 'static/imgs/ic-jq-commentstep.png', 'alt': 'Comment Steps', onClick:  ()=>commentRows()}
    ]

    useEffect(()=>{
        if (draggedFlag) {
            setStepSelect({edit: false, check: [], highlight: []});
            setDraggedFlag(false);
        }
    }, [draggedFlag])

    useEffect(()=>{
        dispatch({type: designActions.SET_TESTCASES, payload: testCaseData})
        //eslint-disable-next-line
    }, [testCaseData]);

    useEffect(()=>{
        setChanged(true);
    }, [saveEnable]);

    useEffect(()=>{
        if (props.imported) {
            fetchTestCases()
            .then(data=>{
                if (data==="success") 
                    props.setShowPop(MSG.DESIGN.SUCC_TC_IMPORT);
                else 
                props.setShowPop(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                props.setImported(false)
                setStepSelect({edit: false, check: [], highlight: []});
                setChanged(false);
                headerCheckRef.current.indeterminate = false;
            })
            .catch(error=>console.error("Error: Fetch TestCase Failed ::::", error));
        }
        //eslint-disable-next-line
    }, [props.imported]);

    useEffect(()=>{
        if (Object.keys(userInfo).length && Object.keys(props.current_task).length) {
            fetchTestCases()
            .then(data=>{
                data !== "success" &&
                props.setShowPop(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                setEdit(false);
                setStepSelect({edit: false, check: [], highlight: []});
                headerCheckRef.current.indeterminate = false;
                setDraggable(false);
                setChanged(false);
                setHeaderCheck(false);
                setIsUnderReview(props.current_task.status === "underReview")
            })
            .catch(error=>console.error("Error: Fetch TestCase Failed ::::", error));
        }
        //eslint-disable-next-line
    }, [userInfo, props.current_task]);

    const fetchTestCases = () => {
		return new Promise((resolve, reject)=>{
            let { testCaseName, versionnumber, screenName, screenId, projectId, testCaseId, appType } = props.current_task;
            let deleteObjectFlag = false;
            
            setOverlay("Loading...");
            
            DesignApi.readTestCase_ICE(userInfo, testCaseId, testCaseName, versionnumber, screenName)
            .then(data => {
                if (data === "Invalid Session") return RedirectPage(history);
                
                let taskObj = props.current_task
                if(data.screenName && data.screenName !== taskObj.screenName){
                    taskObj.screenName = data.screenName;
                    dispatch({type: pluginActions.SET_CT, payload: taskObj});
                }

                if(data.del_flag){
                    deleteObjectFlag = true; // Flag for DeletedObjects Popup
                    props.setDisableActionBar(true); //disable left-top-section
                }
                else props.setDisableActionBar(false); //enable left-top-section
                
                setHideSubmit(data.testcase.length === 0);
                setReusedTC(data.reuse);

                DesignApi.getScrapeDataScreenLevel_ICE(appType, screenId, projectId, testCaseId)
                    .then(scriptData => {
                        if (scriptData === "Invalid Session") return RedirectPage(history);

                        setTestScriptData(scriptData.view);
                        props.setMirror(scriptData.mirror);
                        
                        DesignApi.getKeywordDetails_ICE(appType)
                            .then(keywordData => {
                                if (keywordData === "Invalid Session") return RedirectPage(history);
                                
                                setKeywordList(keywordData);
                                let testcaseArray = [];
                                if (data === "" || data === null || data === "{}" || data === "[]" || data.testcase.toString() === "" || data.testcase === "[]") {
                                    testcaseArray.push(emptyRowData);
                                    props.setDisableActionBar(true);
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
											let temp=testcase[i].keywordVal  
											testcase[i].keywordVal=testcase[i].keywordVal[0].toLowerCase()+testcase[i].keywordVal.slice(1,)
                                            testcaseArray.push(testcase[i]);
                                        }
                                    }
                                    setOverlay("");
                                }
                                setDraggable(false);
                                setTestCaseData(testcaseArray);
                                setPastedTC([]);
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
                                console.error("Error getObjectType method! \r\n ", error);
                                props.setShowPop(MSG.DESIGN.ERR_FETCH_TC);
                                reject("fail");
                            });
                    })
                    .catch(error => {
                        setOverlay("");
                        setTestCaseData([]);
                        setTestScriptData(null);
                        setKeywordList(null);
                        setObjNameList(null);
                        props.setShowPop(MSG.DESIGN.ERR_FETCH_TC);
                        console.error("Error getObjectType method! \r\n " + (error));
                        reject("fail");
                    });
            })
            .catch(error => {
                setOverlay("");
                setTestCaseData([]);
                setTestScriptData(null);
                setKeywordList(null);
                setObjNameList(null);
                props.setShowPop(MSG.DESIGN.ERR_FETCH_TC);
                console.error("Error getTestScriptData method! \r\n " + (error));
                reject("fail");
            });
        });
    };
    
    const saveTestCases = (e, confirmed) => {
        if (userInfo.role !== "Viewer") {
            if (reusedTC && !confirmed) {
                props.setShowConfirmPop({'title': 'Save Testcase', 'content': 'Testcase has been reused. Are you sure you want to save?', 'onClick': ()=>{props.setShowConfirmPop(false);saveTestCases(null, true)}});
                return;
            }

            let { screenId, testCaseId, testCaseName, versionnumber } = props.current_task;
            let import_status = false;

            if (String(screenId) !== "undefined" && String(testCaseId) !== "undefined") {
                let errorFlag = false;
                let testCases = [...testCaseData]

                for (let i = 0; i < testCases.length; i++) {
                    let step = i + 1
                    testCases[i].stepNo = step;

                    if (!testCases[i].custname || !testCases[i].keywordVal) {
                        let col = "Object Name";
                        if (!testCases[i].keywordVal) col = "keyword";
                        props.setShowPop({'VARIANT': VARIANT.WARNING, 'CONTENT': `Please select ${col} Name at Step No. ${step}`});
                        errorFlag = true;
                        break;
                    } else {
                        testCases[i].custname = testCases[i].custname.trim();
                         if (testCases[i].keywordVal === 'SwitchToFrame' && String(testScriptData) !== "undefined") {
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
                    if (!testCases[i].url) testCases[i].url = "";
                    
                    if (!testCases[i].cord) testCases[i].cord = "";

                }

                if (!errorFlag) {
                    DesignApi.updateTestCase_ICE(testCaseId, testCaseName, testCases, userInfo, versionnumber, import_status, pastedTC)
                    .then(data => {
                        if (data === "Invalid Session") return RedirectPage(history);
                        if (data === "success") {
                            
                            if(props.current_task.appType.toLowerCase()==="web" && Object.keys(modified).length !== 0){
                                let scrape_data = {};
                                let { appType, projectId, testCaseId, versionnumber } = props.current_task;
                                
                                DesignApi.getScrapeDataScreenLevel_ICE(appType, screenId, projectId, testCaseId)
                                .then(res => {
                                    scrape_data=res;
                                    let modifiedObjects = [];
                                    for(let i=0; i<scrape_data.view.length; i++){
                                        if(scrape_data.view[i].custname in modified){
                                            scrape_data.view[i].xpath = modified[scrape_data.view[i].custname];
                                            modifiedObjects.push(scrape_data.view[i]);
                                        }
                                    } 

                                    let params = {
                                        'deletedObj': [],
                                        'modifiedObj': modifiedObjects,
                                        'addedObj': {...scrape_data, view: []},
                                        'testCaseId': testCaseId,
                                        'userId': userInfo.user_id,
                                        'roleId': userInfo.role,
                                        'versionnumber': versionnumber,
                                        'param': 'DebugModeScrapeData',
                                        'orderList': scrape_data.orderlist
                                    }
                                    
                                    DesignApi.updateScreen_ICE(params)
                                    .then(data1 => {
                                        if (data1 === "Invalid Session") return RedirectPage(history);
                                        
                                        if (data1 === "Success") {            
                                            fetchTestCases()
                                            .then(msg=>{
                                                setChanged(false);
                                                msg === "success"
                                                ? props.setShowPop(MSG.DESIGN.SUCC_TC_SAVE)
                                                : props.setShowPop(MSG.DESIGN.WARN_DELETED_TC_FOUND)
                                            })
                                            .catch(error => {
                                                props.setShowPop(MSG.DESIGN.ERR_FETCH_TC);
                                                console.error("Error: Fetch TestCase Failed ::::", error)
                                            });
                                        } else props.setShowPop(MSG.DESIGN.ERR_SAVE_TC);
                                    })
                                    .catch(error => {
                                        props.setShowPop(MSG.DESIGN.ERR_SAVE_TC);
                                        console.error("Error::::", error)
                                    })
                                })
                                .catch(error=> {
                                    props.setShowPop(MSG.DESIGN.ERR_SAVE_TC);
                                    console.error("Error:::::", error)
                                });
                            }
                            else{
                                fetchTestCases()
                                .then(data=>{
                                    setChanged(false);
                                    data === "success" 
                                    ? props.setShowPop(MSG.DESIGN.SUCC_TC_SAVE) 
                                    : props.setShowPop(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                                })
                                .catch(error=>{
                                    props.setShowPop(MSG.DESIGN.ERR_FETCH_TC);
                                    console.error("Error: Fetch TestCase Failed ::::", error)
                                });
                            }
                        } else props.setShowPop(MSG.DESIGN.ERR_SAVE_TC);
                    })
                    .catch(error => { 
                        props.setShowPop(MSG.DESIGN.ERR_SAVE_TC);
                        console.error("Error::::", error);
                    });
                    errorFlag = false;
                }
            } else props.setShowPop(MSG.DESIGN.ERR_UNDEFINED_SID_TID);
        }
        setStepSelect({edit: false, check: [], highlight: []});
        headerCheckRef.current.indeterminate = false;
        setHeaderCheck(false);
    }

    const setRowData = data => {
        let testCases = [...testCaseData];
        let { rowIdx, operation } = data;
        let changed = false;
        if (operation === "row") {
            const { objName, keyword, inputVal, outputVal, appType } = data;
            if (testCases[rowIdx].custname !== objName || testCases[rowIdx].keywordVal !== keyword || testCases[rowIdx].inputVal[0] !== inputVal || testCases[rowIdx].outputVal !== outputVal || commentFlag){
                testCases[rowIdx].custname = objName;
                testCases[rowIdx].keywordVal = keyword;
                testCases[rowIdx].inputVal = [inputVal];
                testCases[rowIdx].appType = appType;

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

    const submitTask = submitOperation => {
        let { subTaskId: taskid, status: taskstatus, versionnumber: version, batchTaskIDs, projectId } = props.current_task;
        
		if (submitOperation === 'reassign') taskstatus = 'reassign';

        reviewTask(projectId, taskid, taskstatus, version, batchTaskIDs)
        .then(result => {
            if (result === "fail") props.setShowPop(MSG.GENERIC.WARN_NO_REVIEWER);
            else if (taskstatus === 'reassign') props.setShowPop({'VARIANT': VARIANT.SUCCESS, 'CONTENT': "Task Reassigned successfully!", onClick: ()=>redirectToPlugin()});
            else if (taskstatus === 'underReview') props.setShowPop({'VARIANT': VARIANT.SUCCESS, 'content': "Task Approved successfully!", onClick: ()=>redirectToPlugin()});
            else props.setShowPop({'VARIANT': VARIANT.SUCCESS, 'content': "Task Submitted successfully!", onClick: ()=>redirectToPlugin()});
        })
        .catch(error => {
            props.setShowPop(MSG.DESIGN.ERR_SUBMIT_TASK);
            console.error(error)
        })
        
        props.setShowConfirmPop(false);
    }

    const deleteTestcase = () => {
        let testCases = [...testCaseData]
        if (testCases.length === 1 && !testCases[0].custname) props.setShowPop(MSG.DESIGN.WARN_DELETE);
        else if (stepSelect.check.length <= 0) props.setShowPop(MSG.DESIGN.WARN_SELECT_STEP);
        else if (reusedTC) props.setShowConfirmPop({'title': 'Delete Test Step', 'content': 'Testcase has been reused. Are you sure you want to delete?', 'onClick': ()=>{props.setShowConfirmPop(false);onDeleteTestStep()}});
        else props.setShowConfirmPop({'title': 'Delete Test Step', 'content': 'Are you sure, you want to delete?', 'onClick': ()=>onDeleteTestStep()});
    }

    const onDeleteTestStep = () => {
        let testCases = []
        let localPastedTc = [...pastedTC];

        testCaseData.forEach((val, idx) => {
            if (!stepSelect.check.includes(idx)) {
                testCases.push(val);
            }
            else {
                let tcIndex = pastedTC.indexOf(val.objectid)
                if (tcIndex > -1) localPastedTc.splice(tcIndex, 1);
            }
        })

        setPastedTC(localPastedTc);
        setTestCaseData(testCases);
        setStepSelect({edit: false, check: [], highlight: []});
        headerCheckRef.current.indeterminate = false;
        setHeaderCheck(false);
        props.setShowConfirmPop(false);
        setChanged(true);
    }

    const addRow = () => {
        let testCases = [...testCaseData]
        let insertedRowIdx = [];
        runClickAway = false;
        if (stepSelect.check.length === 1) {
            const rowIdx = stepSelect.check[0];
            testCases.splice(rowIdx+1, 0, emptyRowData);
            insertedRowIdx.push(rowIdx+1)
        }
        else if (stepSelect.highlight.length === 1 && !stepSelect.check.length) {
            const rowIdx = stepSelect.highlight[0];
            testCases.splice(rowIdx+1, 0, emptyRowData);
            insertedRowIdx.push(rowIdx+1)
        }
        else {
            testCases.splice(testCaseData.length, 0, emptyRowData);
            insertedRowIdx.push(testCaseData.length)
        }
        setTestCaseData(testCases);
        setStepSelect({edit: false, check: [], highlight: insertedRowIdx});
        setHeaderCheck(false);
        setChanged(true);
        headerCheckRef.current.indeterminate = false;
        // setEdit(false);
    }

    const selectMultiple = () => {
        // setHeaderCheck(false);
        setStepSelect(oldState => ({...oldState, highlight: []}));
        setShowSM(true);
    }

    const selectSteps = stepList => {
        stepList.push(...stepSelect.check)
        let newChecks = Array.from(new Set(stepList))
        setStepSelect({edit: false, check: newChecks, highlight: []});
        headerCheckRef.current.indeterminate = newChecks.length!==0 && newChecks.length !== testCaseData.length;
        setShowSM(false);
    }

    const editRow = () => {
        let check = [...stepSelect.check];
        let highlight = [...stepSelect.highlight]
        let focus = [];
        runClickAway = false;
        if (check.length === 0 && highlight.length === 0) props.setShowPop(MSG.DESIGN.WARN_SELECT_STEP_DEL);
        else {
            if (check.length === 1) focus = check;
            else if (highlight.length === 1 && !check.length) { focus = highlight; check = highlight }
            else check = []
            
            setStepSelect({edit: true, check: check, highlight: focus});
            setHeaderCheck(false);
            setEdit(true);
            setDraggable(false);
            headerCheckRef.current.indeterminate = check.length!==0 && check.length !== testCaseData.length;
        }
    }

    const toggleDrag = () => {
        setStepSelect({edit: false, check: [], highlight: []});
        setHeaderCheck(false);
        setEdit(false);
        headerCheckRef.current.indeterminate = false;

        // if (draggable) setDraggable(false);
        // else
        setDraggable(true);
    }

    const copySteps = () => {
        let selectedRows = [...stepSelect.check]
        let copyTestCases = []
        let copyContent = {}
        let copyErrorFlag = false;
        if (selectedRows.length === 0) props.setShowPop(MSG.DESIGN.WARN_SELECT_STEP_COPY);
        else{
            let sortedSteps = selectedRows.map(step=>parseInt(step)).sort((a,b)=>a-b)
            for (let idx of sortedSteps) {
                if (!testCaseData[idx].custname) {
                    if (selectedRows.length === 1) props.setShowPop(MSG.DESIGN.ERR_EMPTY_TC_COPY);
                    else props.setShowPop(MSG.DESIGN.ERR_INVALID_OBJ_REF);
                    copyErrorFlag = true;
                    break
                } 
                else{
                    let testCase = Object.assign({}, testCaseData[idx])
                    copyTestCases.push(testCase);
                }
            }
            
            if (!copyErrorFlag) {
                copyContent = {'appType': props.current_task.appType, 'testCaseId': props.current_task.testCaseId, 'testCases': copyTestCases};
                dispatch({type: designActions.SET_COPYTESTCASES, payload: copyContent});
                setEdit(false);
            }
            setStepSelect({edit: false, check: [], highlight: []});
            headerCheckRef.current.indeterminate = false;
            setHeaderCheck(false);
        }
    }

    const onPasteSteps = () => {
        setStepSelect(oldState => ({...oldState, highlight: []}));

        if (!copiedContent.testCaseId){
            props.setShowPop(MSG.DESIGN.WARN_NO_TC_PASTE);
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
                props.setShowPop(MSG.DESIGN.WARN_DIFF_PROJTYPE);
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
            let testCasesToCopy = JSON.parse(JSON.stringify(copiedContent.testCases));
            
            stepInt = stepInt+offset
            if (testCases.length === 1 && !testCases[0].custname) testCases = testCasesToCopy;
            else testCases.splice(stepInt, 0, ...testCasesToCopy);
            for(let i=0; i<copiedContent.testCases.length; i++){
                toFocus.push(stepInt+i);
            }
            offset=offset+copiedContent.testCases.length;
        }

        let localPastedTc = [...pastedTC];
        copiedContent.testCases.forEach(testcase => testcase.objectid ? localPastedTc.push(testcase.objectid) : null)

        localPastedTc = [...new Set(localPastedTc)];
        runClickAway = false;
        setPastedTC(localPastedTc);
        setTestCaseData(testCases);
        setShowPS(false);
        setStepSelect({edit: false, check: [], highlight: toFocus});
        headerCheckRef.current.indeterminate = false;
        setHeaderCheck(false);
        setChanged(true);
    }

    const commentRows = () => {
        let selectedIndexes = [...stepSelect.check];
        let highlighted = [...stepSelect.highlight];
        let testCases = [ ...testCaseData ]
        runClickAway = false;
        if (highlighted.length === 0 && selectedIndexes.length === 0) props.setShowPop(MSG.DESIGN.WARN_SELECT_STEP_SKIP);
        else if (selectedIndexes.length === 1 && !testCases[selectedIndexes[0]].custname) props.setShowPop(MSG.DESIGN.WARN_EMP_STEP_COMMENT);
        else if (highlighted.length === 1 && !testCases[highlighted[0]].custname) props.setShowPop(MSG.DESIGN.WARN_EMP_STEP_COMMENT);
        else{
            let toComment = [...new Set([...highlighted, ...selectedIndexes])]; 
            for(let idx of toComment){
                if (stepSelect.edit && edit && stepSelect.highlight.includes(idx)) continue;
                let testCase = { ...testCases[idx] }
                let isComment = testCase.outputVal.slice(-2) === "##";
                if (isComment) testCase.outputVal = testCase.outputVal.replace(/(;*##)$/g, "")
                else testCase.outputVal += testCase.outputVal.length === 0 ? "##" : ";##"
                testCases[idx] = { ...testCase }
            }
            setTestCaseData(testCases);
            setStepSelect({edit: false, check: [], highlight: []});
            setHeaderCheck(false);
            setChanged(true);
            if(stepSelect.edit && edit) setCommentFlag(true);
            headerCheckRef.current.indeterminate = false;
        }
    }

    

    const showRemarkDialog = (rowIdx) => {
        setStepSelect(oldState => ({ ...oldState, highlight: []}));
        setShowRemarkDlg(String(rowIdx));
    }

    const showDetailDialog = (rowIdx) => {
        setStepSelect(oldState => ({ ...oldState, highlight: []}));
        setShowDetailDlg(String(rowIdx));
    }

    const updateChecklist = (RowIdx, click, msg) => {
        let check = [...stepSelect.check]
        let headerCheckFlag = false
        let focusIdx = [];
        let loc = check.indexOf(RowIdx);
        if (loc>=0) {
            if (click==="check") check.splice(loc, 1)
            else focusIdx = [RowIdx]
        }
        else {
            check.push(RowIdx)
            focusIdx = [RowIdx];
        }
        if (check.length === testCaseData.length) headerCheckFlag = true;
        if (msg === "noFocus") focusIdx = [];
        // checkArray = check;
        setHeaderCheck(headerCheckFlag);
        setStepSelect({edit: true, check: check, highlight: focusIdx});
        headerCheckRef.current.indeterminate = check.length!==0 && check.length !== testCaseData.length;
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
        let checkList = [...stepSelect.check]
        if (event.target.checked) {
            checkList = new Array(testCaseData.length);
            for (let i=0; i<checkList.length; i++ ) checkList[i] = i;
        }
        else {
            checkList = []
        }
        setStepSelect({edit: false, check: checkList, highlight: []});
        setHeaderCheck(event.target.checked);
        headerCheckRef.current.indeterminate = false;
    }

    const onDrop = () => {
        if (!changed)setChanged(true)
        setDraggedFlag(true);
        setHeaderCheck(false);
        headerCheckRef.current.indeterminate = false;
    }

    const getKeywords = useCallback(objectName => getKeywordList(objectName, keywordList, props.current_task.appType, testScriptData), [keywordList, props.current_task, testScriptData]);

    const getRowPlaceholders = useCallback((obType, keywordName) => keywordList[obType][keywordName], [keywordList])

    return (
        <>
        { showSM && <SelectMultipleDialog data-test="d__selectMultiple" setShow={setShowSM} selectSteps={selectSteps} upperLimit={testCaseData.length} /> }
        { showPS && <PasteStepDialog setShow={setShowPS} pasteSteps={pasteSteps} upperLimit={testCaseData.length}/> }
        { showRemarkDlg && <RemarkDialog remarks={testCaseData[parseInt(showRemarkDlg)].remarks} setShow={setShowRemarkDlg} onSetRowData={setRowData} idx={showRemarkDlg} firstname={userInfo.firstname} lastname={userInfo.lastname}/> }
        { showDetailDlg && <DetailsDialog TCDetails={testCaseData[showDetailDlg].addTestCaseDetailsInfo && JSON.parse(testCaseData[showDetailDlg].addTestCaseDetailsInfo)} setShow={setShowDetailDlg} onSetRowData={setRowData} idx={showDetailDlg} /> }
        { overlay && <ScreenOverlay content={overlay} /> }
        { showConfPaste && <ConfPasteStep />}
        <div className="d__content">
            <div className="d__content_wrap">
            { /* Task Name */ }
            <div className="d__task_title">
                <div className="d__task_name" data-test="d__taskName">{props.current_task.taskName}</div>
            </div>

            { /* Button Group */ }
            <div className="d__btngroup">
                <div className="d__table_ac_btn_grp">
                {
                    tableActionBtnGroup.map((btn, i) => 
                        <button data-test="d__tblActionBtns" key={i} className="d__tblBtn" onClick={()=>btn.onClick()}><img className="d__tblBtn_ic" src={btn.img} alt={btn.alt} title={btn.title}/> </button>
                    )
                }
                </div>

                <div className="d__taskBtns">
                    <button className="d__taskBtn d__btn" data-test="d__saveBtn" title="Save Test Case" onClick={saveTestCases} disabled={!changed}>Save</button>
                    <button className="d__taskBtn d__btn" data-test="d__deleteBtn" title="Delete Test Step" onClick={deleteTestcase} disabled={!stepSelect.check.length}>Delete</button>
                </div>

                <div className="d__submit" data-test="d__actionBtn">
                    { isUnderReview && 
                        <>
                        <button className="d__reassignBtn d__btn" title="Reassign Task" onClick={()=>onAction("reassign")}>
                            Reassign
                        </button>
                        <button className="d__approveBtn d__btn" title="Approve Task" onClick={()=>onAction("approve")}>
                            Approve
                        </button>
                        </>
                    }
                    { !hideSubmit && !isUnderReview &&
                        <button className="d__submitBtn d__btn" title="Submit Task" onClick={()=>onAction("submit")}>
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
                    <span className="sel_col d__sel_head"><input className="sel_obj" type="checkbox" checked={headerCheck} onChange={onCheckAll} ref={headerCheckRef} /></span>
                    <span className="objname_col d__obj_head" >Object Name</span>
                    <span className="keyword_col d__key_head" >Keyword</span>
                    <span className="input_col d__inp_head" >Input</span>
                    <span className="output_col d__out_head" >Output</span>
                    <span className="remark_col d__rem_head" >Remarks</span>
                    <span className="details_col d__det_head" >Details</span>
                </div>
                <div style={{height: "100%"}}>
                {testCaseData.length>0 && <div className="d__table_contents" >
                <div className="ab">
                    <div className="min">
                        <div className="con" id="d__tcListId">
                            <ScrollBar scrollId="d__tcListId" verticalbarWidth="8px" thumbColor="#321e4f" trackColor="rgb(211, 211, 211)">
                            <ClickAwayListener onClickAway={()=>{ runClickAway ? setStepSelect(oldState => ({ ...oldState, highlight: []})) : runClickAway=true}} style={{height: "100%"}}>
                            <ReactSortable filter=".sel_obj" disabled={!draggable} key={draggable.toString()} list={testCaseData} setList={setTestCaseData} animation={200} ghostClass="d__ghost_row" onEnd={onDrop}>
                                {
                                testCaseData.map((testCase, i) => <TableRow data-test="d__tc_row"
                                    key={i} idx={i} objList={objNameList} testCase={testCase} edit={edit} 
                                    getKeywords={getKeywords} getRowPlaceholders={getRowPlaceholders} stepSelect={stepSelect}
                                    updateChecklist={updateChecklist} setStepSelect={setStepSelect}
                                    setRowData={setRowData} showRemarkDialog={showRemarkDialog} showDetailDialog={showDetailDialog}
                                    rowChange={rowChange}
                                                        />)
                                } 
                            </ReactSortable>
                            </ClickAwayListener>
                            </ScrollBar>
                        </div>
                    </div>
                </div>
                </div>}
                </div>
            </div>
        </div>
        </>
    );

}

export default DesignContent;