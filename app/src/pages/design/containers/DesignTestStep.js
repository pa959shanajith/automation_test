import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {getUserDetails,getNotificationGroups} from '../api';
import {Messages as MSG,} from "../../global";
import { getObjNameList, getKeywordList } from "../components/UtilFunctions";
import * as DesignApi from "../api";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import '../styles/DesignTestStep.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { TestCases, copiedTestCases,SaveEnable,Modified } from '../designSlice';
import { InputText } from 'primereact/inputtext';


const DesignModal = (props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const headerCheckRef = useRef();
    const userInfo = useSelector((state) => state.landing.userinfo);
    const copiedContent = useSelector(state=>state.design.copiedTestCases);
    const modified = useSelector(state=>state.design.Modified);
    const saveEnable = useSelector(state=>state.design.SaveEnable);
    const mainTestCases = useSelector(state=>state.design.TestCases);
    const [debugButton,setDebugButton]=useState('1');
    const [showTable, setShowTable] = useState(false);
    const [selectedSpan, setSelectedSpan] = useState(null);
    const [visible, setVisible] = useState(false);
    const [testCases, setTestCases] = useState(null);
    const [addedTestCase, setAddedTestCase] = useState([]);
    const [overlay, setOverlay] = useState("");
    const [hideSubmit, setHideSubmit] = useState(false);
    const [keywordList, setKeywordList] = useState(null);
    const [keywordListTable, setKeywordListTable] = useState([]);
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
    const [isUnderReview, setIsUnderReview] = useState("underReview");
    const [rowChange, setRowChange] = useState(false);
    const [headerCheck, setHeaderCheck] = useState(false);
    const [draggedFlag, setDraggedFlag] = useState(false);
    const [commentFlag, setCommentFlag] = useState(false);
    const [reusedTC, setReusedTC] = useState(false);
    const [pastedTC, setPastedTC] = useState([]);
    const [recipients,setRecipients] =useState({groupids:[],additionalrecepients:[]})
    const [allUsers,setAllUsers] = useState([])
    const [groupList,setGroupList] = useState([])
    const [showPopup, setShow] = useState(false);
    const [debugEnable, setDebugEnable] = useState(false);
    const [newtestcase,setnewtestcase] = useState([]);
    const [keyword, setKeyword] = useState('');
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
        {'title': 'Skip Test Step', 'img': 'static/imgs/skip-test-step.png', 'alt': 'Comment Steps', onClick:  ()=>commentRows()}
    ]

    useEffect(()=>{
        if (draggedFlag) {
            setStepSelect({edit: false, check: [], highlight: []});
            setDraggedFlag(false);
        }
    }, [draggedFlag])

    useEffect(()=>{
        let shouldDisable = false;
        dispatch(TestCases(testCaseData))
        //eslint-disable-next-line
        for(let value of testCaseData){
            if (value.custname === "" || value.custname==="OBJECT_DELETED") {
                shouldDisable = true;         
            }
        }
        // Object.values(testCaseData).forEach(value => {
        //     if (value.custname === "" || value.custname==="OBJECT_DELETED") {
        //         shouldDisable = true;         
        //      }
        //     });
        setDebugEnable(shouldDisable);
    }, [dispatch, testCaseData]);

    useEffect(()=>{
        setChanged(true);
    }, [saveEnable]);

    useEffect(()=>{
        if (props.imported) {
            fetchTestCases()
            .then(data=>{
                if (data==="success") 
                    console.log(MSG.DESIGN.SUCC_TC_IMPORT);
                else 
                console.log(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                props.setImported(false)
                setStepSelect({edit: false, check: [], highlight: []});
                setChanged(false);
                // headerCheckRef.current.indeterminate = false;
            })
            .catch(error=>console.error("Error: Fetch TestCase Failed ::::", error));
        }
        //eslint-disable-next-line
    }, [props.imported]);

    useEffect(()=>{
        if (Object.keys(userInfo).length){
        //  && Object.keys(props.current_task).length) {
            fetchTestCases()
            .then(data=>{
                data !== "success" &&
                // setMsg(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                setEdit(false);
                setStepSelect({edit: false, check: [], highlight: []});
                // headerCheckRef.current.indeterminate = false;
                setDraggable(false);
                setChanged(false);
                setHeaderCheck(false);
                // setIsUnderReview(props.current_task.status === "underReview")
            })
            .catch(error=>console.error("Error: Fetch TestCase Failed ::::", error));
        }
        //eslint-disable-next-line
    }, [userInfo, props.current_task]);

    const fetchTestCases = () => {
		return new Promise((resolve, reject)=>{
            // let { testCaseName, versionnumber, screenName, screenId, projectId, testCaseId, appType } = props.current_task;
            let deleteObjectFlag = false;
            
            setOverlay("Loading...");
            
            DesignApi.readTestCase_ICE(userInfo, props.fetchingDetails["_id"], props.fetchingDetails["name"], 0 /** versionNumber */, props.fetchingDetails["parent"]["name"])
            .then(data => {
                if (data === "Invalid Session") return ;
                
                let taskObj = props.current_task
                if(data.screenName && data.screenName !== taskObj.screenName){
                    taskObj.screenName = data.screenName;
                    // dispatch({type: pluginActions.SET_CT, payload: taskObj});
                }

                if(data.del_flag){
                    deleteObjectFlag = true; // Flag for DeletedObjects Popup
                    // props.setDisableActionBar(true); //disable left-top-section
                }
                // else props.setDisableActionBar(false); //enable left-top-section
                
                // setHideSubmit(data.testcase.length === 0);
                // setReusedTC(data.reuse);

                DesignApi.getScrapeDataScreenLevel_ICE(props.appType, props.fetchingDetails.parent['_id'], props.fetchingDetails.projectId, props.fetchingDetails.testCaseId)
                    .then(scriptData => {
                        if (scriptData === "Invalid Session") return ;

                        setTestScriptData(scriptData.view);
                        // props.setMirror(scriptData.mirror);
                        
                        DesignApi.getKeywordDetails_ICE(props.appType)
                            .then(keywordData => {
                                if (keywordData === "Invalid Session") return ;
                                
                                setKeywordList(keywordData);
                                let testcaseArray = [];
                                if (data === "" || data === null || data === "{}" || data === "[]" || data.testcase.toString() === "" || data.testcase === "[]") {
                                    testcaseArray.push(emptyRowData);
                                    // props.setDisableActionBar(true);
                                    // setOverlay("");
                                } else {
                                    let testcase = data.testcase;
                                    
                                    for (let i = 0; i < testcase.length; i++) {
                                        if ("comments" in testcase[i]) {
                                            delete testcase[i];
                                            testcase = testcase.filter(n => n !== null);
                                        } else {
                                            if (props.appType === "Webservice") {
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
                                    // setOverlay("");
                                }
                                setDraggable(false);
                                setTestCaseData(testcaseArray);
                                setnewtestcase(testcaseArray);
                                setPastedTC([]);
                                setObjNameList(getObjNameList(props.appType, scriptData.view));
                                console.log(getObjNameList(props.appType, scriptData.view))
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
                                console.log(MSG.DESIGN.ERR_FETCH_TC);
                                reject("fail");
                            });
                    })
                    .catch(error => {
                        setOverlay("");
                        setTestCaseData([]);
                        setTestScriptData(null);
                        setKeywordList(null);
                        setObjNameList(null);
                        console.log(MSG.DESIGN.ERR_FETCH_TC);
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
                console.log(MSG.DESIGN.ERR_FETCH_TC);
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
             let screenId = props.fetchingDetails['parent']['_id'];
             let testCaseId = props.fetchingDetails['_id'];
             let testCaseName = props.fetchingDetails.testCaseName;
             let versionnumber = 0;


            // let { screenId, testCaseId, testCaseName, versionnumber } = props.current_task;
            let import_status = false;

            if (String(screenId) !== "undefined" && String(testCaseId) !== "undefined") {
                let errorFlag = false;
                let testCases = [...newtestcase]

                for (let i = 0; i < testCases.length; i++) {
                    let step = i + 1
                    testCases[i].stepNo = step;

                    if (!testCases[i].custname || !testCases[i].keywordVal) {
                        let col = "Object Name";
                        if (!testCases[i].keywordVal) col = "keyword";
                        console.log(MSG.CUSTOM(`Please select ${col} Name at Step No. ${step}`));
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
                    DesignApi.updateTestCase_ICE(props.fetchingDetails['_id'], props.fetchingDetails['name'], testCases, userInfo, 0 /**versionnumber*/, import_status, pastedTC)
                    .then(data => {
                        if (data === "Invalid Session") return;
                        if (data === "success") {
                            
                            if(props.appType.toLowerCase()==="web" && Object.keys(modified).length !== 0){
                                let scrape_data = {};
                                // let { appType, projectId, testCaseId, versionnumber } = props.current_task;
                                
                                DesignApi.getScrapeDataScreenLevel_ICE(props.appType, props.fetchingDetails['parent']['_id'], props.fetchingDetails.projectId, props.fetchingDetails['_id'])
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
                                        'testCaseId': props.fetchingDetails.testCaseId,
                                        'userId': userInfo.user_id,
                                        'roleId': userInfo.role,
                                        'versionnumber': versionnumber,
                                        'param': 'DebugModeScrapeData',
                                        'orderList': scrape_data.orderlist
                                    }
                                    
                                    DesignApi.updateScreen_ICE(params)
                                    .then(data1 => {
                                        if (data1 === "Invalid Session") return ;
                                        
                                        if (data1 === "Success") {            
                                            fetchTestCases()
                                            .then(msg=>{
                                                setChanged(false);
                                                msg === "success"
                                                ? console.log(MSG.DESIGN.SUCC_TC_SAVE)
                                                : console.log(MSG.DESIGN.WARN_DELETED_TC_FOUND)
                                            })
                                            .catch(error => {
                                                console.log(MSG.DESIGN.ERR_FETCH_TC);
                                                console.error("Error: Fetch TestCase Failed ::::", error)
                                            });
                                        } else console.log(MSG.DESIGN.ERR_SAVE_TC);
                                    })
                                    .catch(error => {
                                        console.log(MSG.DESIGN.ERR_SAVE_TC);
                                        console.error("Error::::", error)
                                    })
                                })
                                .catch(error=> {
                                    console.log(MSG.DESIGN.ERR_SAVE_TC);
                                    console.error("Error:::::", error)
                                });
                            }
                            else{
                                fetchTestCases()
                                .then(data=>{
                                    setChanged(false);
                                    data === "success" 
                                    ? console.log(MSG.DESIGN.SUCC_TC_SAVE) 
                                    : console.log(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                                })
                                .catch(error=>{
                                    console.log(MSG.DESIGN.ERR_FETCH_TC);
                                    console.error("Error: Fetch TestCase Failed ::::", error)
                                });
                            }
                        } else console.log(MSG.DESIGN.ERR_SAVE_TC);
                    })
                    .catch(error => { 
                        console.log(MSG.DESIGN.ERR_SAVE_TC);
                        console.error("Error::::", error);
                    });
                    errorFlag = false;
                }
            } else console.log(MSG.DESIGN.ERR_UNDEFINED_SID_TID);
        }
        setStepSelect({edit: false, check: [], highlight: []});
        headerCheckRef.current.indeterminate = false;
        setHeaderCheck(false);
        setDebugEnable(false);
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
        window.localStorage['navigateScreen'] = "design";
        navigate('/design');
    }

   
    const deleteTestcase = () => {
        let testCases = [...testCaseData]
        if (testCases.length === 1 && !testCases[0].custname) console.log(MSG.DESIGN.WARN_DELETE);
        else if (stepSelect.check.length <= 0) console.log(MSG.DESIGN.WARN_SELECT_STEP);
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
        let oldTestCases = [...newtestcase]
       let emptyAddedRow=[...oldTestCases,emptyRowData]
       setnewtestcase(emptyAddedRow)
        // setTestCaseData(testCases);
        // // setStepSelect({edit: false, check: [], highlight: insertedRowIdx});
        // setHeaderCheck(false);
        // setChanged(true);
        // headerCheckRef.current.indeterminate = false;
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
        if (check.length === 0 && highlight.length === 0) console.log(MSG.DESIGN.WARN_SELECT_STEP_DEL);
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
        setDraggable(!draggable);
    }

    const copySteps = () => {
        let selectedRows = [...stepSelect.check]
        let copyTestCases = []
        let copyContent = {}
        let copyErrorFlag = false;
        if (selectedRows.length === 0) console.log(MSG.DESIGN.WARN_SELECT_STEP_COPY);
        else{
            let sortedSteps = selectedRows.map(step=>parseInt(step)).sort((a,b)=>a-b)
            for (let idx of sortedSteps) {
                if (!testCaseData[idx].custname) {
                    if (selectedRows.length === 1) console.log(MSG.DESIGN.ERR_EMPTY_TC_COPY);
                    else console.log(MSG.DESIGN.ERR_INVALID_OBJ_REF);
                    copyErrorFlag = true;
                    break
                } 
                else{
                    let testCase = Object.assign({}, testCaseData[idx])
                    copyTestCases.push(testCase);
                }
            }
            
            if (!copyErrorFlag) {
                copyContent = {'appType': props.appType, 'testCaseId': props.fetchingDetails['_id'], 'testCases': copyTestCases};
                dispatch(copiedTestCases(copyContent));
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
            console.log(MSG.DESIGN.WARN_NO_TC_PASTE);
            return;
        }

        if (copiedContent.testCaseId !== props.fetchingDetails['_id']) {
            let appTypeFlag = false;
            for (let testCase of copiedContent.testCases){
                if (["Web", "Desktop", "Mainframe", "OEBS", "MobileApp", "MobileWeb", "MobileApp", "SAP"].includes(testCase.appType)) {
                    appTypeFlag = true;
                    break;
                }
            }
            if (copiedContent.appType !== props.appType && appTypeFlag) {
                console.log(MSG.DESIGN.WARN_DIFF_PROJTYPE);
            }
            else{
                setShowConfPaste(true);
            }
        }
        else setShowPS(true);
    }

    // const ConfPasteStep = () => (
    //     <ModalContainer 
    //         title="Paste Test Step"
    //         close={()=>setShowConfPaste(false)} 
    //         content="Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?"
    //         footer={
    //             <>
    //             <button onClick={()=>{
    //                 setShowConfPaste(false);
    //                 setShowPS(true);
    //             }}>Yes</button>
    //             <button onClick={()=>setShowConfPaste(false)}>No</button>
    //             </>}
    //     />
    // );

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
        if (highlighted.length === 0 && selectedIndexes.length === 0) console.log(MSG.DESIGN.WARN_SELECT_STEP_SKIP);
        else if (selectedIndexes.length === 1 && !testCases[selectedIndexes[0]].custname) console.log(MSG.DESIGN.WARN_EMP_STEP_COMMENT);
        else if (highlighted.length === 1 && !testCases[highlighted[0]].custname) console.log(MSG.DESIGN.WARN_EMP_STEP_COMMENT);
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

    // const onAction = operation => {
    //     switch(operation){
    //         case "submit": setShow({'title':'Submit Task', 'content': operation, 'onClick': ()=>submitTask(operation)}); break;
    //         case "reassign": setShow({'title':'Reassign Task', 'content': operation, 'onClick': ()=>submitTask(operation)}); break;
    //         case "approve": setShow({'title':'Approve Task', 'content': operation, 'onClick': ()=>submitTask(operation)}); break;
    //         default: break;
    //     }                       
    // }

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

    const resetData = () => {
        setAllUsers([]);
        setGroupList([]);
        setRecipients({groupids:[],additionalrecepients:[]});
    }

    const checkAddUsers = () => {
        if(document.getElementById("dc__checkbox") === null) return true
        let checked = document.getElementById("dc__checkbox").checked
        return !checked
    }

    // const ConfirmPopup = () => (
    //     <ModalContainer 
    //         title={showPopup.title}
    //         content={<div>
    //             <span>Are you sure you want to {showPopup.content} the task ?</span>
    //             <p className="dc__checkbox-addRecp" >
    //                 <input  id="dc__checkbox" onChange={()=>{fetchSelectRecipientsData()}} type="checkbox" title="Notify Additional Users" className="checkAddUsers"/>
    //                 <span >Notify Additional Users</span>
    //             </p>
    //             <div className='dc__select-recpients'>
    //                 <div>
    //                     <span className="leftControl" title="Token Name">Select Recipients</span>
    //                     <SelectRecipients disabled={checkAddUsers()} recipients={recipients} setRecipients={setRecipients} groupList={groupList} allUsers={allUsers} />
    //                 </div>
    //             </div>
    //         </div>}
    //         close={()=>{setShow(false);resetData();}}
    //         // footer={
    //         //     <>
    //         //     <button onClick={()=>{submitTask(showPopup.content)}}>
    //         //         {showPopup.continueText ? showPopup.continueText : "Yes"}
    //         //     </button>
    //         //     <button onClick={()=>{setShow(false);resetData()}}>
    //         //         {showPopup.rejectText ? showPopup.rejectText : "No"}
    //         //     </button>
    //         //     </>
    //         // }
    //     /> 
    // )

    const fetchSelectRecipientsData = async () => {
        let checkAddUsers = document.getElementById("dc__checkbox").checked
        if(!checkAddUsers) resetData()
        else {
            var userOptions = [];
            let data = await getUserDetails("user");
            if(data.error){console.log(data.error);return;}
            for(var i=0; i<data.length; i++) if(data[i][3] !== "Admin") userOptions.push({_id:data[i][1],name:data[i][0]}); 
            setAllUsers(userOptions.sort()); 
            data = await getNotificationGroups({'groupids':[],'groupnames':[]});
            if(data.error){
                if(data.val === 'empty'){
                    console.log(data.error);
                    data = {};
                } else{ console.log(data.error); return true; }
            }
            setGroupList(data.sort())
        }
    }

    const getKeywords = useCallback(objectName => getKeywordList(objectName, keywordList, props.appType, testScriptData), [keywordList, props.current_task, testScriptData]);

    const getRowPlaceholders = useCallback((obType, keywordName) => keywordList[obType][keywordName], [keywordList])

    //Debug function

    const debugTestCases = selectedBrowserType => {
        let testcaseID = [];
        let browserType = [];
        
        if (props.appType !== "MobileWeb" && props.appType !== "Mainframe") browserType.push(selectedBrowserType);
        
        // globalSelectedBrowserType = selectedBrowserType;5
        
        if (props.dTcFlag) testcaseID = Object.values(props.checkedTc);
        else testcaseID.push(props.fetchingDetails['_id']);
        setOverlay('Debug in Progress. Please Wait...');
        // ResetSession.start();
        DesignApi.debugTestCase_ICE(browserType, testcaseID, userInfo, props.appType)
            .then(data => {
                setOverlay("");
                // ResetSession.end();
                if (data === "Invalid Session") return ;
                else if (data === "unavailableLocalServer")  console.log(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER)
                else if (data === "success") console.log(MSG.DESIGN.SUCC_DEBUG)
                else if (data === "fail") console.log(MSG.DESIGN.ERR_DEBUG)
                else if (data === "Terminate") console.log(MSG.DESIGN.WARN_DEBUG_TERMINATE)
                else if (data === "browserUnavailable") console.log(MSG.DESIGN.WARN_UNAVAILABLE_BROWSER)
                else if (data === "scheduleModeOn") console.log(MSG.GENERIC.WARN_UNCHECK_SCHEDULE)
                else if (data === "ExecutionOnlyAllowed") console.log(MSG.GENERIC.WARN_EXECUTION_ONLY)
                else if (data.status === "success"){
                    let rows={}
                    mainTestCases.forEach((testCase, index) => {
                        if(index+1 in data){
                            rows[testCase.custname]=data[index+1].xpath;
                        }
                    });
                    dispatch(Modified(rows));
                    dispatch(SaveEnable(!saveEnable))
                    console.log(MSG.DESIGN.SUCC_DEBUG);
                } else {
                    console.log(data);
                }										
            })
            .catch(error => {
                setOverlay("");
                // ResetSession.end();
                console.log(MSG.DESIGN.ERR_DEBUG);
                console.error("Error while traversing while executing debugTestcase method! \r\n " + (error.data));
            });
    };
    
    const handleDesignBtn = () => {
        setVisible(true);
    }

    const handleSpanClick = (index) => {
        if (selectedSpan === index) {
            setSelectedSpan(null);
        } else {
            setSelectedSpan(index);
        }
    };

    const toggleTableVisibility = () => {
        setShowTable(true);
    };
    const handleAdd = () => {
        setAddedTestCase([...addedTestCase, testCases]);
        setTestCases('');
    };


    const AddTestCases = [
        { name: 'Test1', code: 't1' },
        { name: 'Test2', code: 't2' },
        { name: 'Test3', code: 't3' },
        { name: 'Test4', code: 't4' },
        { name: 'Test5', code: 't5' }
    ];

    const headerTemplate = (
        <>
            <div>
                <h5 className='dailog_header1'>Design Test Step</h5>
                <h4 className='dailog_header2'>Signup screen 1</h4>
                <img className="screen_btn" src="static/imgs/ic-screen-icon.png" alt='screen icon' />
                <div className='btn__grp'>
                    <Button size='small' onClick={()=>debugTestCases('1')} label='Debug' outlined></Button>
                    <Button size='small' label='Add Test Step' onClick={()=>addRow()}></Button>
                    <Button size='small' lable='Save' onClick={saveTestCases}></Button>
                </div>
            </div>
        </>
    );

    const emptyMessage = (
        <div className='empty__msg1'>
            <div className='empty__msg'>
            <img className="not_captured_ele" src="static/imgs/ic-capture-notfound.png" alt="No data available" />
            <p className="not_captured_message">No Design Step yet</p>
            </div>
            <Button className="btn-design-single" label='Design Test Steps'></Button>
        </div>
    );

    const footerContent = (
        <div>
            <Button label="Cancel" className="p-button-text" />
            <Button label="Debug" autoFocus />
        </div>
    );
    const renderActionsCell = (rowData) => {
        return (
         <div>
            <img src="static/imgs/ic-edit.png" style={{ height: "20px", width: "20px" }} className="edit__icon" alt='' />
            <img src="static/imgs/ic-delete-bin.png" style={{ height: "20px", width: "20px" }}className="delete__icon"  alt='' />
         </div>
          )
        };
        const elementEditor = (options) => {
            return (
                <Dropdown
                    value={options.value}
                    options={objNameList}
                    onChange={(e) => {options.editorCallback(e.value);setKeywordListTable(getKeywords(e.value).keywords);setKeyword(getKeywords(e.value).keywords[0]);console.log(getKeywords(e.value).keywords)}}
                    placeholder="Select a Status"
                />
            );
        };
        const keywordEditor = (options) => {
            return (
                <Dropdown
                    value={keyword.length>0?keyword:options.value}
                    options={keywordListTable.length>0?keywordListTable:getKeywords(options.rowData.custname).keywords}
                    onChange={(e) => {options.editorCallback(e.value);setKeyword([])}}
                    placeholder="Select a Status"
                />
            );
        };
        const textEditor = (options) => {
            return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
        };
        const onRowEditComplete = (e) => {
            let testcase = [...newtestcase];
            let { newData, index } = e;
            testcase[index] = newData;
            setnewtestcase(testcase);
        };

    return (
        <>
            <Dialog className='design_dialog_box' header={headerTemplate} position='right' visible={props.visibleDesignStep} style={{ width: '73vw', color: 'grey', height: '95vh', margin: '0px' }} onHide={() => props.setVisibleDesignStep(false)} >
                <div className='toggle__tab'>
                    <Accordion activeIndex={0}>
                        <AccordionTab header={props.fetchingDetails["name"]} onClick={toggleTableVisibility}>
                            <DataTable
                                value={newtestcase.length>0 ?newtestcase:[]}
                                emptyMessage={newtestcase.length === 0?emptyMessage:null}
                                rowReorder editMode="row" dataKey="id" onRowEditComplete={onRowEditComplete} >
                                <Column style={{ width: '3em' }} rowReorder />
                                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                                <Column field="custname" header="Select all" editor={(options) => elementEditor(options)}></Column>
                                <Column field="keywordVal" header="Keyword" editor={(options) => keywordEditor(options)}></Column>
                                <Column field="inputVal" header="Input" editor={(options) => textEditor(options)}></Column>
                                <Column field="outputVal" header="Output" editor={(options) => textEditor(options)}></Column>
                                <Column field="remarks" header="Remarks" />
                                <Column rowEditor headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }} /> 
                            </DataTable>
                        </AccordionTab>
                    </Accordion>
                </div>
            </Dialog>

            <Dialog className={"debug__object__modal"} header="Design:Sign up screen 1" style={{ height: "31.06rem", width: "47.06rem" }} visible={visible} onHide={() => setVisible(false)} footer={footerContent}>
                <div className='debug__btn'>
                    <div className={"debug__object"}>
                        <span className='debug__opt'>
                            <p className='debug__otp__text'>Choose Browsers</p>
                        </span>
                        <span className='browser__col'>
                            <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/ic-explorer.png'></img>Internet Explorer {selectedSpan === 1 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
                            <span onClick={() => handleSpanClick(2)} className={selectedSpan === 2 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/chorme.png' />Google Chrome {selectedSpan === 2 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
                            <span onClick={() => handleSpanClick(3)} className={selectedSpan === 3 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png' />Mozilla Firefox {selectedSpan === 3 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
                            <span onClick={() => handleSpanClick(4)} className={selectedSpan === 4 ? 'browser__col__selected' : 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png' />Microsoft Edge {selectedSpan === 4 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
                        </span>
                    </div>
                    <div>
                        <div className='design__fst__card'>
                            <span>Add Dependent Test Case (Optional)</span>
                            <div className='add__test__case'>
                                <Dropdown className='add__depend__test' value={testCases} onChange={(e) => setTestCases(e.value)} options={AddTestCases} optionLabel="name"
                                    placeholder="Select"></Dropdown>
                                <Button size='small' label='Add' className='add__btn' onClick={handleAdd}></Button>
                            </div>
                        </div>
                        <div className='design__snd__card'>
                            <div className='design__thr__card'>
                                <span className='design__thr__card'>
                                    <p>Added Dependent Test Cases</p>
                                    <p>Clear</p>
                                </span>
                            </div>
                            <div className={addedTestCase.length>0?'added__card':''}>
                                {addedTestCase.map((value, index) => (
                                <div key={index}>
                                    <p className={addedTestCase.length>0?'text__added__step' : ''}>{value.name}</p>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                </div>

            </Dialog>
        </>
    )
}
export default DesignModal;