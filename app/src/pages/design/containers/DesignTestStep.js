import AceEditor from "react-ace";
import "ace-builds";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/worker-javascript";

import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import 'ace-builds/src-noconflict/ext-error_marker';
import 'ace-builds/webpack-resolver';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, getNotificationGroups, createKeyword } from '../api';
import { Messages as MSG,ScreenOverlay,RedirectPage,ResetSession } from "../../global";
import { getObjNameList, getKeywordList } from "../components/UtilFunctions";
import * as DesignApi from "../api";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import '../styles/DesignTestStep.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { TestCases, copiedTestCases, SaveEnable, Modified } from '../designSlice';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Tooltip } from 'primereact/tooltip';
import TableRow from "../components/TableRow";
import { ReactSortable } from 'react-sortablejs';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import DetailsDialog from "../components/DetailsDialog";
import PasteStepDialog from "../components/PasteStepDialog";
import SelectMultipleDialog from "../components/SelectMultipleDialog";
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from "primereact/radiobutton";
//import AceEditor from 'react-ace';


import { mode, style } from 'd3';
import AvoInput from '../../../globalComponents/AvoInput';
import ReactAce from "react-ace/lib/ace";
import { Icon } from "@mui/material";

const DesignModal = (props) => {

    const pgmLang = useRef();
    const toast = useRef();
    const headerCheckRef = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    let userInfo = useSelector((state) => state.landing.userinfo);
    const copiedContent = useSelector(state => state.design.copiedTestCases);
    const modified = useSelector(state => state.design.Modified);
    const saveEnable = useSelector(state => state.design.SaveEnable);
    const mainTestCases = useSelector(state => state.design.TestCases);
    const [selectedSpan, setSelectedSpan] = useState(null);
    const [visibleDependentTestCaseDialog, setVisibleDependentTestCaseDialog] = useState(false);
    const [addedTestCase, setAddedTestCase] = useState([]);
    const [overlay, setOverlay] = useState("Loading...");
    const [keywordList, setKeywordList] = useState(null);
    const [testCaseData, setTestCaseData] = useState([]);
    const [testScriptData, setTestScriptData] = useState(null);
    const [stepSelect, setStepSelect] = useState({ edit: false, check: [], highlight: [] });
    const [draggable, setDraggable] = useState(false);
    const [objNameList, setObjNameList] = useState(null);
    const [changed, setChanged] = useState(false);
    const [headerCheck, setHeaderCheck] = useState(false);
    const [draggedFlag, setDraggedFlag] = useState(false);
    const [reusedTC, setReusedTC] = useState(false);
    const [pastedTC, setPastedTC] = useState([]);
    const [debugEnable, setDebugEnable] = useState(false);
    const [testCaseIDsList, setTestCaseIDsList] = useState([]);
    const [testcaseList, setTestcaseList] = useState([]);
    const [dependencyTestCaseFlag, setDependencyTestCaseFlag] = useState(false);
    const [selectedTestCases,setSelectedTestCases]=useState([]);
    const [idx, setIdx] = useState(false);
    const [imported, setImported] = useState(false);
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [screenLavelTestSteps, setScreenLevelTastSteps] = useState([]);
    const [newtestcase, setnewtestcase] = useState([]);
    const [rowExpandedName,setRowExpandedName] = useState({name:'',id:''});
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [visible, setVisible] = useState(false);
    const [edit, setEdit] = useState(true);
    const [showDetailDlg, setShowDetailDlg] = useState(false);
    const [showSM, setShowSM] = useState(false);
    const [showConfPaste, setShowConfPaste] = useState(false);
    const [showPS, setShowPS] = useState(false);
    const [rowChange, setRowChange] = useState(false);
    const [commentFlag, setCommentFlag] = useState(false);
    const [disableActionBar, setDisableActionBar ] = useState(false);
    const [arrow, setArrow] = useState(false);
    const [customkeyword, setCustomKeyWord] = useState(false);
    const [stepOfCustomKeyword, setStepOfCustomKeyword] = useState(0);
    const [langSelect, setLangSelect] = useState('javascript');
    const [inputKeywordName, setInputKeywordName] = useState('');
    const [inputEditor, setInputEditor] = useState("");
    const [customTooltip, setCustomTooltip] = useState("");
    const customKeyToast = useRef();
    let runClickAway = true;
    const [selectedType, setSelectedType] = useState("Specific");
    const [checked, setChecked] = useState(false);
    const [AllOptions , setAlloptions] = useState('');
    const [isNameValid, setIsNameValid] = useState(false);
    const [isSpaceError, setIsSpaceError] = useState(false);
    // const [keywordtypes,setKeywordtypes] = useState("Specific")

    const handleAceEditor = (e) => {
        setInputEditor(e)
    }
    const onSelectLanguage = (e) => {
        setLangSelect(e.target.value);

    }

    // Function to remove duplicates based on a specified property (e.g., 'name')
    const removeDuplicates = (arr, property) => {
        const uniqueMap = new Map();
        arr.forEach(obj => uniqueMap.set(obj[property], obj));
        return Array.from(uniqueMap.values());
    };

    // Function to sort the array based on the 'index' property
    const sortByIndex = (arr) => arr.slice().sort((a, b) => a.index - b.index);

    // Combined function
    const uniqueArray = (arr, property) => sortByIndex(removeDuplicates(arr, property));

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
    let screenLevelTestCases=[]
    const parentScreen = props.fetchingDetails["parent"]["children"];

    useEffect(() => {
        if (draggedFlag) {
            setStepSelect({ edit: false, check: [], highlight: [] });
            setDraggedFlag(false);
        }
    }, [draggedFlag])

    useEffect(() => {
        let shouldDisable = false;
        if(screenLavelTestSteps.length !==0){
        const findData = screenLavelTestSteps.find(item=>item.id === rowExpandedName.id)
        //eslint-disable-next-line
        if(findData !== undefined){
            dispatch(TestCases(findData.testCases))
            for (let value of findData.testCases) {
                if (value.custname === "" || value.custname === "OBJECT_DELETED") {
                    shouldDisable = true;
                }
            }
            setDebugEnable(shouldDisable);
        }
    }
    }, [dispatch, rowExpandedName, screenLavelTestSteps, testCaseData]);
    useEffect(() => {
        setChanged(true);
    }, [saveEnable]);
    useEffect(()=>{
        let browserName = (function (agent) {        
    
          switch (true) {
    
          case agent.indexOf("edge") > -1: return {name:"chromium",val:"8"};
          case agent.indexOf("edg/") > -1: return {name:"chromium",val:"8"};
          case agent.indexOf("chrome") > -1 && !!window.chrome: return {name:"chrome",val:"1"};
          case agent.indexOf("firefox") > -1: return {name:"mozilla",val:"2"};
          default: return "other";
       }
    
        })(window.navigator.userAgent.toLowerCase());
    
        // setBrowserName(browserName.name)
        setSelectedSpan(browserName.val)
        
      },[])
    useEffect(() => {
        if (imported) {
            if(screenLavelTestSteps === 0){
                setOverlay("Loading...")
            }
            for(var i = 0 ; i<parentScreen.length; i++){
                if(parentScreen[i]._id === rowExpandedName.id){
                    fetchTestCases(i)
                    .then(data=>{
                        if (data==="success")
                            toast.current.show({severity:'success', summary:'Success', detail:MSG.DESIGN.SUCC_TC_IMPORT.CONTENT, life:2000})
                        else 
                            toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_DELETED_TC_FOUND.CONTENT , life:3000})
                        setImported(false)
                        setStepSelect({edit: false, check: [], highlight: []});
                        setChanged(false);
                        headerCheckRef.current.indeterminate = false;
                    })
                    .catch(error=>console.error("Error: Fetch Test Steps Failed ::::", error));
                }
            }
        }
        //eslint-disable-next-line
    }, [imported, screenLavelTestSteps]);
    const ConfirmPopups = () => {
        return(
            <Dialog visible={showConfirmPop} header={showConfirmPop.title} onHide={()=>setShowConfirmPop(false)} footer={footerPopUp} >
                <div>{showConfirmPop.content}</div>
            </Dialog>
        )
    }
       
    const footerPopUp = () =>(
        <>
            <Button onClick={showConfirmPop.onClick} label='Yes'/>
            <Button onClick={()=>setShowConfirmPop(false)} label='No'/>
        </>
    )
    useEffect(()=>{
        let _expandedRow={}
        _expandedRow[`${props.fetchingDetails['_id']}`]=true
        setExpandedRows(_expandedRow)
        setRowExpandedName({name:props.fetchingDetails['name'], id:props.fetchingDetails['_id']})
        setSelectedTestCase({name:props.fetchingDetails['name'], id:props.fetchingDetails['_id']})
    },[])
    useEffect(() => {
            for(var i = 0 ; i<parentScreen.length; i++){
                fetchTestCases(i)
                .then(data => {
                    data !== "success" &&
                        toast.current.show({severity:'warn',summary:'Warning', detail:MSG.DESIGN.WARN_DELETED_TC_FOUND.CONTENT,life:3000});
                        setEdit(true);
                    setStepSelect({ edit: false, check: [], highlight: [] });
                    headerCheckRef.current.indeterminate = false;
                    setDraggable(false);
                    setChanged(false);
                    setHeaderCheck(false);
                })
                .catch(error => console.error("Error: Fetch Test Steps Failed ::::", error));
            }
            setOverlay("Loading...")
            if (screenLevelTestCases.length !== 0) {
                // Create an array to store unique items
                const uniqueSteps = [];
                for (const item of screenLevelTestCases) {
                    const reuesd = item.reused;
                    if (reuesd === true) {
                      // Check if the uniqueSteps array does not already contain this item
                      const isUnique = !uniqueSteps.some(
                        (uniqueItem) => uniqueItem.some((u) => u.reused === true)
                      );
                      // If it's unique, add it to the uniqueSteps array
                      if (isUnique) {
                        uniqueSteps.push(item);
                      }
                    } else {
                      // If not reused, add it to the uniqueSteps array
                      uniqueSteps.push(item);
                    }
                  }
                  // Update the state with the uniqueSteps array
                  setScreenLevelTastSteps(uniqueSteps);
                }
            setScreenLevelTastSteps(screenLevelTestCases)
        //eslint-disable-next-line
    }, [imported]);

    useEffect(() => {
        const scenarioId = props.fetchingDetails.parent.parent["_id"];
        let dependentTestCases = [];
        DesignApi.getTestcasesByScenarioId_ICE(scenarioId)
            .then(data => {
                if (data === "Invalid Session") return RedirectPage(navigate);
                else {
                    for (let i = 0; i < data.length; i++) {
                        dependentTestCases.push({ 'testCaseID': data[i].testcaseId, 'testCaseName': data[i].testcaseName, 'checked': false, 'tempId': i })
                    }
                    let testCases = [];
                    let disableAndBlock = true
                    let dtcLength = dependentTestCases.length;
                    for (let i = dtcLength - 1; i >= 0; i--) {
                        let tc = dependentTestCases[i];
                        tc.disableAndBlock = disableAndBlock;
                        if (tc.testCaseName === props.fetchingDetails.name) disableAndBlock = false;
                        testCases.push(tc);
                    }
                    testCases.reverse();
                    setTestcaseList(testCases);
                }
            })
            .catch(error => console.error("ERROR::::", error));
        //eslint-disable-next-line
    }, []);

    const fetchTestCases = (j) => {
        return new Promise((resolve, reject) => {
            // let { testCaseName, versionnumber, screenName, screenId, projectId, testCaseId, appType } = props.current_task;
            let deleteObjectFlag = false;

            setOverlay("Loading...");

            DesignApi.readTestCase_ICE(userInfo, props.fetchingDetails['parent']['children'][j]["_id"], props.fetchingDetails['parent']['children'][j]["name"], 0 /** versionNumber */, props.fetchingDetails["parent"]["name"])
                .then(data => {
                    if (data === "Invalid Session") return;

                    let taskObj = props.current_task
                    if (data.screenName && data.screenName !== taskObj.screenName) {
                        taskObj.screenName = data.screenName;
                    }

                    if (data.del_flag) {
                        deleteObjectFlag = true; // Flag for DeletedObjects Popup
                        setDisableActionBar(true); //disable left-top-section
                    }
                    else setDisableActionBar(false); //enable left-top-section
                    setReusedTC(data.reuse);

                    DesignApi.getScrapeDataScreenLevel_ICE(props.appType, props.fetchingDetails.parent['_id'], props.fetchingDetails.projectID, props.fetchingDetails['parent']['children'][j]["_id"])
                        .then(scriptData => {
                            if (scriptData === "Invalid Session") return;
                            setTestScriptData(scriptData.view);
                            DesignApi.getKeywordDetails_ICE(props.appType)
                            .then(keywordData => {
                                if (keywordData === "Invalid Session") return RedirectPage(navigate);
                                let sortedKeywordList = {};
                                for(let object in keywordData) {
                                    let firstList = [];
                                    let secondList = [];
                                    for(let keyword in keywordData[object]){
                                        if(keywordData[object][keyword]['ranking']){
                                            firstList[keywordData[object][keyword]['ranking'] - 1] = ({
                                                [keyword] : keywordData[object][keyword]
                                            });
                                        } else {
                                            secondList.push(({
                                                [keyword] :keywordData[object][keyword]
                                            }));
                                        }
                                    };
                                    secondList = [...firstList, ...secondList];
                                    let keyWordObject = {};
                                    for(let keyword of secondList){
                                        if(keyword&& Object.keys(keyword)[0] && Object.values(keyword)[0])
                                            keyWordObject[[Object.keys(keyword)[0]]] = Object.values(keyword)[0];
                                    }
                                    sortedKeywordList[object] = keyWordObject;
                                }
                                setKeywordList(sortedKeywordList);
                                    let testcaseArray = [];
                                    if (data === "" || data === null || data === "{}" || data === "[]" || data.testcase.toString() === "" || data.testcase === "[]") {
                                        testcaseArray.push(emptyRowData);
                                        setDisableActionBar(true);
                                        setOverlay("");
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
                                                testcase[i].stepNo = (i + 1);
                                                let temp = testcase[i].keywordVal
                                                if(testcase[i].custname !== "OBJECT_DELETED"){
                                                    let objType = getKeywordList(testcase[i].custname,keywordData,props.appType,scriptData.view)
                                                    testcase[i]["keywordTooltip"] = keywordData[objType.obType][temp]?.tooltip!==undefined?keywordData[objType.obType][temp].tooltip:testcase[i].keywordVal;
                                                    testcase[i]["keywordDescription"] = keywordData[objType.obType][temp]?.description!==undefined?keywordData[objType.obType][temp].description:testcase[i].keywordVal;
                                                }else{
                                                    testcase[i]["keywordTooltip"] = testcase[i].keywordVal;
                                                    testcase[i]["keywordDescription"] = testcase[i].keywordVal ;
                                                }
                                                testcaseArray.push(testcase[i]);
                                            }
                                        }
                                        setOverlay("");
                                    }
                                    setDraggable(false);
                                    screenLevelTestCases.push({name:parentScreen[j].name,testCases:testcaseArray.length?testcaseArray:[emptyRowData],id:parentScreen[j]._id, reused: data.testcase.length>0?true:false, index:parentScreen[j].childIndex})
                                    setObjNameList(getObjNameList(props.appType, scriptData.view));
                                    setTestCaseData([...testCaseData,testcaseArray]); 
                                    setPastedTC([]);
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
                                    toast.current.show({severity:'error', summary:'Error', detail:MSG.DESIGN.ERR_FETCH_TC.CONTENT,life:5000});
                                    reject("fail");
                                });
                    })
                    .catch(error => {
                        setOverlay("");
                        setTestCaseData([]);
                        setTestScriptData(null);
                        setKeywordList(null);
                        setObjNameList(null);
                        toast.current.show({severity:'error', summary:'Error', detail:MSG.DESIGN.ERR_FETCH_TC.CONTENT, life:5000});
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
                toast.current.show({severity:'error', summary:'Error', detail:MSG.DESIGN.ERR_FETCH_TC.CONTENT, life:5000});
                console.error("Error getTestScriptData method! \r\n " + (error));
                reject("fail");
            });
        });
    };


    const saveTestCases = (e, confirmed) => {
        if (userInfo.role !== "Viewer") {
            if (reusedTC && !confirmed) {
                setShowConfirmPop({ 'title': 'Save Test Steps', 'content': 'Test Steps has been reused. Are you sure you want to save?', 'onClick': () => { setShowConfirmPop(false); saveTestCases(null, true) } });
                return;
            }
            let testCaseId = '';
            let testCaseName = '';
            let versionnumber = 0;
            let screenId = props.fetchingDetails['parent']['_id'];
            for (var k=0; screenLavelTestSteps.length>k;k++){
                if(screenLavelTestSteps[k].name === rowExpandedName.name){
                       testCaseName = screenLavelTestSteps[k].name;
                       testCaseId = screenLavelTestSteps[k].id
                }
            }


            let import_status = false;

            if (String(screenId) !== "undefined" && String(testCaseId) !== "undefined") {
                let errorFlag = false;
                let testCases = [];
                let findData = screenLavelTestSteps.find(screen=>screen.name===rowExpandedName.name)
               
                const modifiedTestCases = findData.testCases.map((testCase, index) => ({
                    ...testCase,
                    stepNo: index + 1
                  }));
                testCases = modifiedTestCases
                for (let i = 0; i < testCases.length; i++) {

                    if (!testCases[i].custname || !testCases[i].keywordVal) {
                        let col = "Object Name";
                        if (!testCases[i].keywordVal) col = "keyword";
                        toast.current.show({severity:'warn', summary:'Warning', detail:`Please select ${col} Name at Step No. ${testCases[i].stepNo}`, life:3000});
                        errorFlag = true;
                        break;
                    } else {
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
                            else testCases[i].inputVal = [
                                testCases[i].inputVal[0].replace(/[\n\r]/g, '##'),
                                ...testCases[i].inputVal.slice(1) // Copy the rest of the elements as-is
                              ];
                        }
                    }
                }
                
                if (!errorFlag) {
                        DesignApi.updateTestCase_ICE(testCaseId, testCaseName, testCases, userInfo, 0 /**versionnumber*/, import_status, pastedTC)
                        .then(data => {
                            if (data === "Invalid Session") return;
                            if (data === "success") {
                                if (props.appType.toLowerCase() === "web" && Object.keys(modified).length !== 0) {
                                    let scrape_data = {};

                                    DesignApi.getScrapeDataScreenLevel_ICE(props.appType, props.fetchingDetails['parent']['_id'], props.fetchingDetails.projectID, testCaseId)
                                        .then(res => {
                                            scrape_data = res;
                                            let modifiedObjects = [];
                                            for (let i = 0; i < scrape_data.view.length; i++) {
                                                if (scrape_data.view[i].custname in modified) {
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
                                                if (data1 === "Invalid Session") return ;
                                                
                                                if (data1 === "Success") {    
                                                    for(var i = 0; parentScreen.length>i;i++) {
                                                        if(parentScreen[i]._id === rowExpandedName.id){
                                                            fetchTestCases(i)
                                                            .then(msg=>{
                                                                setChanged(false);
                                                                msg === "success"
                                                                ? toast.current.show({severity:"success", summary:'Success', detail:MSG.DESIGN.SUCC_TC_SAVE.CONTENT , life:2000})
                                                                : toast.current.show({severity:"warn", summary:'Warning', detail:MSG.DESIGN.WARN_DELETED_TC_FOUND.CONTENT , life:3000})
                                                            })
                                                            .catch(error => {
                                                                toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_FETCH_TC.CONTENT , life:5000})
                                                                console.error("Error: Fetch Test Steps Failed ::::", error)
                                                            });
                                                        }
                                                    }        
                                                } else toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_SAVE_TC.CONTENT , life:5000})
                                            })
                                            .catch(error => {
                                                toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_SAVE_TC.CONTENT , life:5000})
                                                console.error("Error::::", error)
                                            })
                                })
                                .catch(error=> {
                                    toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_SAVE_TC.CONTENT , life:5000})
                                    console.error("Error:::::", error)
                                });
                            }
                            else{
                                for (var i = 0; parentScreen.length>i; i++){
                                    if(parentScreen[i]._id === rowExpandedName.id){
                                        fetchTestCases(i)
                                        .then(data=>{
                                            setChanged(false);
                                            data === "success" 
                                            ? toast.current.show({severity:'success', summary:'Success', detail:MSG.DESIGN.SUCC_TC_SAVE.CONTENT, life:2000}) 
                                            : toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_DELETED_TC_FOUND.CONTENT, life:3000})
                                        })
                                        .catch(error=>{
                                            toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_FETCH_TC.CONTENT , life:5000})
                                            console.error("Error: Fetch Test Steps Failed ::::", error)
                                        });
                                    }
                                }
                            }
                        } else toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_SAVE_TC.CONTENT , life:5000})
                    })
                    .catch(error => { 
                        toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_UNDEFINED_SID_TID.CONTENT , life:5000})
                        console.error("Error::::", error);
                    });
                    errorFlag = false;
                }
            } else toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_UNDEFINED_SID_TID.CONTENT , life:5000})
        }
        setStepSelect({edit: false, check: [], highlight: []});
        headerCheckRef.current.indeterminate = false;
        setHeaderCheck(false);
        setDebugEnable(false);
        setEdit(true)
    }

    const addRow = () => {
        const updateData = screenLavelTestSteps.find((item)=>item.id === rowExpandedName.id)
        let testCases = [...updateData.testCases]
        let insertedRowIdx = [];
        runClickAway = false;
        if (stepSelect.check.length === 1) {
            const rowIdx = stepSelect.check[0];
            let emptyRowDataIndex = {...emptyRowData, stepNo:rowIdx+2}
            testCases.splice(rowIdx+1, 0, emptyRowDataIndex);
            insertedRowIdx.push(rowIdx+1)
        }
        else if (stepSelect.highlight.length === 1 && !stepSelect.check.length) {
            const rowIdx = stepSelect.highlight[0];
            let emptyRowDataIndex = {...emptyRowData, stepNo:rowIdx+2}
            testCases.splice(rowIdx+1, 0, emptyRowDataIndex);
            insertedRowIdx.push(rowIdx+1)
        }
        else {
            let emptyRowDataIndex = {...emptyRowData, stepNo:updateData.testCases.length+1}
            testCases.splice(updateData.testCases.length, 0, emptyRowDataIndex);
            insertedRowIdx.push(updateData.testCases.length)
        }
        let updatedScreenLevelTestSteps = screenLavelTestSteps.map((screen) => {
            if (screen.name === rowExpandedName.name) {
                return { ...screen, testCases: testCases };
            }
            return screen;
        });
        setScreenLevelTastSteps(updatedScreenLevelTestSteps)
        setStepSelect({edit: false, check: [], highlight: insertedRowIdx});
        setHeaderCheck(false);
        setChanged(true);
        headerCheckRef.current.indeterminate = false;
    }

    const getKeywords = useCallback(objectName => getKeywordList(objectName, keywordList, props.appType, testScriptData), [keywordList, props.appType, testScriptData]);

    const getRowPlaceholders = useCallback((obType, keywordName) => keywordList[obType][keywordName], [keywordList])

    //Debug function
    const showSuccess = (success) => {
        toast.current.show({severity:'success', summary: 'Success', detail:success, life: 2000});
    }

    const showInfo = (Info) => {
        toast.current.show({severity:'info', summary: 'Info', detail:Info, life: 3000});
    }

    const showWarn = (Warn) => {
        toast.current.show({severity:'warn', summary: 'Warning', detail:Warn, life: 3000});
    }

    const showError = (Error) => {
        toast.current.show({severity:'error', summary: 'Error', detail:Error, life: 5000});
    }
    const debugTestCases = selectedBrowserType => {
        setVisibleDependentTestCaseDialog(false);
        let testcaseID = [];
        let browserType = [];

        if (props.appType !== "MobileWeb" && props.appType !== "Mainframe") browserType.push(selectedBrowserType);

        let findTestCaseId = screenLavelTestSteps.find(screen=>screen.name===rowExpandedName.name)
        if (dependencyTestCaseFlag){
            for(let p = 0; p<testcaseList.length;p++){
                if(testcaseList[p].checked === true && testcaseList[p].disableAndBlock === false){
                    testcaseID.push(testcaseList[p].testCaseID)
                }
            }
            testcaseID.push(findTestCaseId.id);
        } 
        else testcaseID.push(findTestCaseId.id);
        setOverlay('Debug in Progress. Please Wait...');
        ResetSession.start();
        DesignApi.debugTestCase_ICE(browserType, testcaseID, userInfo, props.appType)
            .then(data => {
                setOverlay("");
                ResetSession.end();
                if (data === "Invalid Session") return ;
                else if (data === "unavailableLocalServer")  showInfo(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER.CONTENT)
                else if (data === "success") showSuccess(MSG.DESIGN.SUCC_DEBUG.CONTENT)
                else if (data === "fail") showError(MSG.DESIGN.ERR_DEBUG.CONTENT)
                else if (data === "Terminate") showWarn(MSG.DESIGN.WARN_DEBUG_TERMINATE.CONTENT) 
                else if (data === "browserUnavailable") showWarn(MSG.DESIGN.WARN_UNAVAILABLE_BROWSER.CONTENT)
                else if (data === "scheduleModeOn") showWarn(MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT)
                else if (data === "ExecutionOnlyAllowed")  showWarn(MSG.GENERIC.WARN_EXECUTION_ONLY.CONTENT)
                else if (data.status === "success"){
                    let rows={}
                    mainTestCases.forEach((testCase, index) => {
                        if (index + 1 in data) {
                            rows[testCase.custname] = data[index + 1].xpath;
                        }
                    });
                    dispatch(Modified(rows));
                    dispatch(SaveEnable(!saveEnable))
                    setSelectedTestCases([])
                    toast.current.show({severity: 'success',summary: 'Success', detail:MSG.DESIGN.SUCC_DEBUG.CONTENT, life:2000})
                } else {
                    toast.current.show({severity: 'success',summary: 'Success', detail:data, life:2000})
                }										
            })
            .catch(error => {
                setOverlay("");
                ResetSession.end();
                toast.current.show({severity:'error',summary: 'Error', detail:MSG.DESIGN.ERR_DEBUG.CONTENT, life:5000})
                console.log("Error while traversing while executing debugTeststeps method! \r\n " + (error.data));
            });
    };

    const handleSpanClick = (index) => {
        if (selectedSpan === index) {
            setSelectedSpan(null);
        } else {
            setSelectedSpan(index);
        }
    };

    const handleAdd = (testCase) => {
        const isTestIDPresent = addedTestCase.some(item => item.testCaseID === testCase.testCaseID);
    
        if (isTestIDPresent) {
            toastError("Duplicate Dependent Test Steps found");
        } else {
            const addTestcaseData = {
                testCaseID: testCase.testCaseID,
                testCaseName: testCase.testCaseName,
                disableAndBlock: testCase.disableAndBlock,
                checked: true
            };
    
            setTestCaseIDsList(prevIDs => [...prevIDs, testCase.testCaseID]);
            setAddedTestCase(prevAdded => [...prevAdded, addTestcaseData]);
            setDependencyTestCaseFlag(true);
        }
    };
        //add dependant checkboxes UI functionality
    const handleCheckboxChangeAddDependant = (event) => {
        const testCase = testcaseList.find(item => item.testCaseName === event.value);
            
        if (testCase) {
            if (event.checked) {
                // Update the specific testCase object's checked property to true
                testCase.checked = true;
                setTestcaseList([...testcaseList]); // Update the state with the modified list
                setSelectedTestCases([...selectedTestCases, testCase.testCaseName]);
                handleAdd(testCase);
            } else {
                handleRemove(testCase);
                setSelectedTestCases(selectedTestCases.filter(item => item !== testCase.testCaseName));
                setAddedTestCase(addedTestCase.filter(item => item.testCaseName !== testCase.testCaseName));
            }
        }
    };
    const handleRemove = (testCaseToRemove) => {
        setAddedTestCase(prevAdded => prevAdded.filter(item => item.testCaseID !== testCaseToRemove.testCaseID));
        setTestCaseIDsList(prevIDs => prevIDs.filter(id => id !== testCaseToRemove.testCaseID));
        setDependencyTestCaseFlag(true);
    };

    const toastError = (errMessage) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: errMessage, life: 5000 });
    }

    const history = useNavigate();
    const hiddenInput = useRef(null);

    const exportTestCase =  () => {
        let findTestCaseData = screenLavelTestSteps.find(screen=>screen.name === rowExpandedName.name)
        let testCaseId = findTestCaseData.id;
        let testCaseName = findTestCaseData.name;
        // let versionnumber = fetchingDetails.versionnumber;
        
        DesignApi.readTestCase_ICE(userInfo, testCaseId, testCaseName, 0)
        .then(response => {
                if (response === "Invalid Session") return RedirectPage(history);
                
                let responseData;
                if (typeof response === 'object') responseData = JSON.stringify(response.testcase, null, 2);
                let filename = testCaseName + ".json";

                let testCaseBlob = new Blob([responseData], {
                    type: "text/json"
                })

                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(new Blob([responseData], {
                        type: "text/json;charset=utf-8"
                    }), filename);
                }
                else {
                    let a = document.createElement('a');
                    a.download = filename;
                    a.href = window.URL.createObjectURL(testCaseBlob);
                    a.target = '_blank';
                    // document.body.appendChild(a);
                    a.click();
                    // document.body.removeChild(a);
                  } 
            })
            .catch(error => console.error("ERROR::::", error));
    }

    const headerTemplate = (
        <>
            <div>
                <h5 className='dailog_header1'>Design Test Steps</h5>
                <h4 className='dailog_header2'>{props.fetchingDetails["parent"]["name"]}</h4>
                <img className="btn_test_screen" src="static/imgs/bi_code-square.svg" alt='screen icon' />
                {props.testSuiteInUse?<img src="static/imgs/view_only_access_icon.svg" style={{height:'25px',position:'absolute',left:'13rem',top:'0.5rem'}} alt='' title="Read Only Access"/>:null}

            </div>
        </>
    );
    const bodyHeaderName = (row)=>{
        return(
            <>
            <span className='rowNameTrim'>{row.name}</span>
            <Tooltip target=".rowNameTrim " position="bottom" content={row.name}/>
            </>
        )
    }
    const bodyHeader = (rowData)=>{
        const onInputChange = (event) => {
            let findTestCaseData = screenLavelTestSteps.find(screen=>screen.name === rowExpandedName.name)
            let testCaseId = findTestCaseData.id;
            let testCaseName = findTestCaseData.name;
            // let versionnumber = fetchingDetails.versionnumber;
            // let appType = appType;
            let import_status = true;
            let flag = false;
    
            let file = event.target.files[0];
            let reader = new FileReader();
            reader.onload = function (e) {
                try{
                    hiddenInput.current.value = '';
                    if (file.name.split('.').pop().toLowerCase() === "json") {
                        setOverlay("Loading...");
                        let resultString = JSON.parse(reader.result);
                        if (!Array.isArray(resultString)) 
                            throw toast.current.show({severity:"error",summary:'Error',detail:MSG.DESIGN.ERR_FILE_FORMAT.CONTENT,life:5000})
                        for (let i = 0; i < resultString.length; i++) {
                            if (!resultString[i].appType)
                                throw toast.current.show({severity:"error",summary:'Error',detail:MSG.DESIGN.ERR_JSON_IMPORT.CONTENT,life:5000})
                            if (
                                resultString[i].appType.toLowerCase() !== "generic" && 
                                resultString[i].appType.toLowerCase() !== "pdf" &&
                                resultString[i].appType !== props.appType
                            ) 
                                throw toast.current.show({severity:"error",summary:'Error',detail:MSG.DESIGN.ERR_NO_MATCH_APPTYPE.CONTENT,life:5000})
                        }
                        DesignApi.updateTestCase_ICE(testCaseId, testCaseName, resultString, userInfo, 0, import_status)
                            .then(data => {
                                setOverlay("");
                                if (data === "Invalid Session") RedirectPage(history);
                                if (data === "success") setImported(true);
                            })
                            .catch(error => {
                                setOverlay("");
                                console.error("ERROR::::", error)
                            });
                        
                    } else throw  toast.current.show({severity:'error', summary:"Error", detail:MSG.DESIGN.ERR_FILE_FORMAT.CONTENT, life:5000});
                }
                catch(error){
                    setOverlay("");
                    if (typeof(error)==="object") toast.current.show({severity:'error', summary:'Error', detail:error, life:5000});
                    else toast.current.show({severity:'error', summary:'Error', detail:MSG.DESIGN.ERR_TC_JSON_IMPORT.CONTENT, life:5000})
                    console.error(error);
                }
            }
            reader.readAsText(file);
        }
    
        const importTestCase = (overWrite) => {
            
            let findTestCaseData = screenLavelTestSteps.find(screen=>screen.name === rowExpandedName.name)
            let testCaseId = findTestCaseData.id;
            let testCaseName = findTestCaseData.name;
            // let versionnumber = fetchingDetails.versionnumber;
            if(overWrite) setShowConfirmPop(false);
    
            
            DesignApi.readTestCase_ICE(userInfo, testCaseId, testCaseName , 0 )
            .then(response => {
                    if (response === "Invalid Session") RedirectPage(history);
                    // eslint-disable-next-line no-mixed-operators
                    if (response.testcase && response.testcase.length === 0 || overWrite) {
                        hiddenInput.current.click();
                        // document.getElementById("importTestCaseField").click();
                    }
                    else{
                        setVisible(true);
                    }
                })
            .catch(error => console.error("ERROR::::", error));
        }
       
        return (
            <>
                { ((screenLavelTestSteps.length === 0) || overlay ) && <ScreenOverlay content={overlay} />}
                <ConfirmDialog visible={visible} onHide={() => setVisible(false)} message='Import will erase your old data. Do you want to continue?' 
                    header="Table Consists of Data" accept={()=>importTestCase(true)} reject={()=>setVisible(false)} />
            {(rowData && !props.testSuiteInUse)?<div>
                {(rowData.name === rowExpandedName.name)?<div className='btn__grp'>
                    <img className='add' src='static/imgs/ic-jq-addsteps.png' alt='addrow' style={{marginTop:'0.5rem',width:'26px', height:'26px'}}  onClick={()=>addRow()} />
                    <Tooltip target=".add " position="bottom" content="  Add Test Step"/>
                    <img src='static/imgs/ic-jq-editsteps.png' alt='edit' className='edit' style={{width:'20px', height:'20px', marginTop:'0.7rem'}} onClick={()=>editRow()}/>
                    <Tooltip target=".edit " position="bottom" content="  Edit Test Step"/>
                    <img className='trash' src='static/imgs/ic-jq-deletesteps.png' alt='delete' style={{marginTop:'0.5rem', width:'26px', height:'26px'}} title='Delete' onClick={deleteTestcase} />
                    <Tooltip target=".trash " position="bottom" content="  Delete"/>
                    <Divider type="solid" layout="vertical" style={{padding: '0rem', margin:'0rem'}}/>

                    <i className='pi pi-check-square' style={{width:'20px', height:'20px', marginTop:'0.8rem',color: 'black'}} onClick={()=>selectMultiple()}/>
                    <Tooltip target='.pi-check-square' position='bottom' content='  Select Test Step(s)'/>
                    <img src='static/imgs/ic-jq-dragsteps.png' alt='Drag Steps' className='drag' style={{width:'20px', height:'20px', marginTop:'0.7rem'}} onClick={()=>toggleDrag()}/>
                    <Tooltip target='.drag' position='bottom' content='  Drag & Drop Test Step'/>
                    <img src='static/imgs/ic-jq-copysteps.png' alt='Copy Steps' className='copy' style={{width:'20px', height:'20px', marginTop:'0.7rem'}} onClick={()=>copySteps()}/>
                    <Tooltip target='.copy' position='bottom'content='  Copy Test Step'/>
                    <img src='static/imgs/ic-jq-pastesteps.png' alt='Paste steps' className='paste' style={{width:'20px', height:'20px', marginTop:'0.7rem'}} onClick={()=>onPasteSteps()}/>
                    <Tooltip target=".paste" position='bottom' content='  Paste Test Step'/>
                    <Divider type="solid" layout="vertical" style={{padding: '0rem', margin:'0rem'}}/>

                    <img src='static/imgs/skip-test-steps.png' alt='comment steps'className='comment' style={{width:'20px', height:'20px', marginTop:'0.7rem'}} onClick={()=>commentRows()}/>
                    <Tooltip target=".comment " position="bottom" content="  Skip Test Step"/>
                    <Divider type="solid" layout="vertical" style={{padding: '0rem', margin:'0rem'}}/>

                    <img src='static/imgs/import_new_18x18_icons.png' className='ImportSSSS' alt='import' style={{marginTop:'0.6rem', width:'20px', height:'20px'}} onClick={()=>importTestCase()} />
                    <Tooltip target=".ImportSSSS" position="bottom" content="Import Test Steps"/>
                    <input id="importTestCaseField" type="file" style={{display: "none"}} ref={hiddenInput} onChange={onInputChange} accept=".json"/>
                    <img src='static/imgs/Export_new_icon_greys.png' alt='export' className='ExportSSSS' style={{marginTop:'0.6rem', width:'20px', height:'20px'}} disabled={disableActionBar}  onClick={()=>disableActionBar !== true?exportTestCase():rowData.testCases[0].custname !== ""?exportTestCase():""} />
                    <Tooltip target=".ExportSSSS" position="bottom" content="Export Test Steps"/>
                    <Divider type="solid" layout="vertical" style={{padding: '0rem', margin:'0rem'}}/>
                    
                    <Button label="Debug" size='small'  disabled={rowData.testCases.length===0 || debugEnable} className="debuggggg" onClick={()=>{DependentTestCaseDialogHideHandler(); setVisibleDependentTestCaseDialog(true)}} outlined></Button>
                    <Tooltip target=".debuggggg" position="left" content=" Click to debug and optionally add dependent test steps repository." />
                    <Button className="SaveEEEE" data-test="d__saveBtn" title="Save Test Case" onClick={saveTestCases} size='small' disabled={!changed} label='Save'/>
                    <Tooltip target=".SaveEEEE" position="left" content="  save" />
            </div>:null}
            </div>:null}
            </>
        );
    }
    const handleDebug = (selectedSpan) => {
        if (props.appType === "Web"){
            debugTestCases(selectedSpan)
        }
        else if (props.appType === "Desktop"){
            debugTestCases('1')
        }
        else if (props.appType === "MobileApp"){
            debugTestCases('1')
        }
        else if (props.appType === "MobileWeb"){
            debugTestCases()
        }
        else if (props.appType === "Webservice"){
            debugTestCases()
        }
        else if (props.appType === "OEBS"){
            debugTestCases('1')
        }
        else if (props.appType === "SAP"){
            debugTestCases('1')
        }
        else if (props.appType === "Mainframe"){
            debugTestCases()
        }
    }
    const footerContent = (
        <div>
            <Button label="Cancel" size='small' onClick={() => DependentTestCaseDialogHideHandler()} className="p-button-text" />
            <Button label="Debug" size='small' onClick={() => handleDebug(selectedSpan)} autoFocus />
        </div>
    );
    
    const DependentTestCaseDialogHideHandler = () => {
        setVisibleDependentTestCaseDialog(false);
        setDependencyTestCaseFlag(false);
        setTestCaseIDsList([]);
        setAddedTestCase([]);
        setSelectedTestCases([]);
    }
    const allowExpansion = (rowData) => {
        return rowData.testCases.length > 0;
    };
    const [expandedRows, setExpandedRows] = useState(null);
    const onRowExpand = (event) => {
        let _expandedRow={}
        screenLavelTestSteps.forEach(testcase=>{if(event.data.id===testcase.id){
            _expandedRow[`${testcase.id}`]=false
        }
        else{
        _expandedRow[`${testcase.id}`]=null
        }}
        )
        setExpandedRows(_expandedRow)
        setRowExpandedName({name:event.data.name,id:event.data.id});
    };

    const onRowCollapse = (event) => {
        setRowExpandedName({});
    };
    const editRow = () => {
        let check = [...stepSelect.check];
        let highlight = [...stepSelect.highlight]
        let focus = [];
        runClickAway = false;
        if (check.length === 0 && highlight.length === 0) toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_SELECT_STEP_DEL.CONTENT,life:3000});
        else {
            if (check.length === 1) focus = check;
            else if (highlight.length === 1 && !check.length) { focus = highlight; check = highlight }
            else check = []
            
            setStepSelect({edit: true, check: check, highlight: focus});
            setHeaderCheck(false);
            setEdit(true);
            setDraggable(false);
            const testdata = screenLavelTestSteps.find(item=>item.id === rowExpandedName.id)
            headerCheckRef.current.indeterminate = check.length!==0 && check.length !== testdata.testCases.length;
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
        let updateData = screenLavelTestSteps.find(item=>item.id === rowExpandedName.id)
        if (selectedRows.length === 0) toast.current.show({severity:'warn',summary:'Warning',detail:MSG.DESIGN.WARN_SELECT_STEP_COPY.CONTENT,life:3000});
        else{
            let sortedSteps = selectedRows.map(step=>parseInt(step)).sort((a,b)=>a-b)
            for (let idx of sortedSteps) {
                if (!updateData.testCases[idx].custname) {
                    if (selectedRows.length === 1) toast.current.show({severity:'error',summary:'Error', detail: MSG.DESIGN.ERR_EMPTY_TC_COPY.CONTENT,life:5000});
                    else toast.current.show({severity:'error',summary:'Error', detail: MSG.DESIGN.ERR_INVALID_OBJ_REF.CONTENT,life:5000});
                    copyErrorFlag = true;
                    break
                } 
                else{
                    let testCase = Object.assign({}, updateData.testCases[idx])
                    copyTestCases.push(testCase);
                }
            }
            
            if (!copyErrorFlag) {
                copyContent = {'appType': props.appType, 'testCaseId': updateData.id, 'testCases': copyTestCases};
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
            toast.current.show({severity:'warn',summary:'Warning',detail:MSG.DESIGN.WARN_NO_TC_PASTE.CONTENT,life:3000});
            return;
        }

        if (copiedContent.testCaseId !== rowExpandedName.id) {
            let appTypeFlag = false;
            for (let testCase of copiedContent.testCases){
                if (["Web", "Desktop", "Mainframe", "OEBS", "MobileApp", "MobileWeb", "MobileApp", "SAP"].includes(testCase.appType)) {
                    appTypeFlag = true;
                    break;
                }
            }
            if (copiedContent.appType !== props.appType && appTypeFlag) {
                toast.current.show({severity:'warn',summary:'Warning',detail:MSG.DESIGN.WARN_DIFF_PROJTYPE.CONTENT,life:3000});
            }
            else{
                setShowConfPaste(true);
            }
        }
        else setShowPS(true);
    }
    const commentRows = () => {
        let selectedIndexes = [...stepSelect.check];
        let highlighted = [...stepSelect.highlight];
        const findData = screenLavelTestSteps.find(item=>item.id === rowExpandedName.id)
        let testCases = [ ...findData.testCases ]
        runClickAway = false;
        if (highlighted.length === 0 && selectedIndexes.length === 0) toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_SELECT_STEP_SKIP.CONTENT, life:3000});
        else if (selectedIndexes.length === 1 && !testCases[selectedIndexes[0]].custname) toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_EMP_STEP_COMMENT.CONTENT, life:3000});
        else if (highlighted.length === 1 && !testCases[highlighted[0]].custname) toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_EMP_STEP_COMMENT.CONTENT, life:3000});
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
            let updatedScreenLevelTestSteps = screenLavelTestSteps.map((screen) => {
                if (screen.name === rowExpandedName.name) {
                    return { ...screen, testCases: testCases };
                }
                return screen;
            });
            setScreenLevelTastSteps(updatedScreenLevelTestSteps);
            setStepSelect({edit: false, check: [], highlight: []});
            setHeaderCheck(false);
            setChanged(true);
            if(stepSelect.edit && edit) setCommentFlag(true);
            headerCheckRef.current.indeterminate = false;
        }
    }
    const selectMultiple = () => {
        // setHeaderCheck(false);
        setStepSelect(oldState => ({...oldState, highlight: []}));
        setShowSM(true);
    }
    const deleteTestcase = () => {
        setEdit(false)
        setStepSelect({edit: false, check: [], highlight: []});
        const updateData = screenLavelTestSteps.find(item=>item.id === rowExpandedName.id)
        let testCases = [...updateData.testCases]
        if (testCases.length === 1 && !testCases[0].custname) toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_DELETE.CONTENT,life:3000});
        else if (stepSelect.check.length <= 0) toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_SELECT_STEP.CONTENT,life:3000});
        else if (reusedTC) setShowConfirmPop({'title': 'Delete Test Step', 'content': 'Test Steps has been reused. Are you sure you want to delete?', 'onClick': ()=>{setShowConfirmPop(false);onDeleteTestStep()}});
        else setShowConfirmPop({'title': 'Delete Test Step', 'content': 'Are you sure, you want to delete?', 'onClick': ()=>onDeleteTestStep()});
    }
    const onDeleteTestStep = () => {
        let testCases = []
        let localPastedTc = [...pastedTC];
        const deleteData = screenLavelTestSteps.find(item=>item.id === rowExpandedName.id)
        deleteData.testCases.forEach((val, idx) => {
            if (!stepSelect.check.includes(idx)) {
                testCases.push(val);
            }
            else {
                let tcIndex = pastedTC.indexOf(val.objectid)
                if (tcIndex > -1) localPastedTc.splice(tcIndex, 1);
            }
        })

        setPastedTC(localPastedTc);
        let updatedScreenLevelTestSteps = screenLavelTestSteps.map((screen) => {
            if (screen.name === rowExpandedName.name) {
                return { ...screen, testCases: testCases };
            }
            return screen;
        });
        setScreenLevelTastSteps(updatedScreenLevelTestSteps);
        setStepSelect({edit: false, check: [], highlight: []});
        headerCheckRef.current.indeterminate = false;
        setHeaderCheck(false);
        setShowConfirmPop(false);
        setChanged(true);
    }
    const setRowData = data => {
        const itemData = screenLavelTestSteps.find(item=>item.id === rowExpandedName.id)
        let testCases = [...itemData.testCases];
        let { rowIdx, operation } = data;
        let changed = false;
        if (operation === "row") {
            const { objName, keyword, inputVal, outputVal, appType} = data;
            if (testCases[rowIdx].custname !== objName || testCases[rowIdx].keywordVal !== keyword || testCases[rowIdx].inputVal[0] !== inputVal || testCases[rowIdx].outputVal !== outputVal || commentFlag) {
                // Create a new object with the updated values
                const updatedTestCase = Object.assign({}, testCases[rowIdx], {
                    custname: objName,
                    keywordVal: keyword,
                    inputVal: [inputVal],
                    appType: appType
                });

                let outputVal2 = outputVal;
                if (commentFlag) {
                    let isComment = outputVal2.slice(-2) === "##";
                    if (isComment) outputVal2 = outputVal2.replace(/(;*##)$/g, "");
                    else outputVal2 += outputVal2.length === 0 ? "##" : ";##";
                    setCommentFlag(false);
                }
            
                updatedTestCase.outputVal = outputVal2;
            
                // Replace the frozen object with the updated one
                testCases[rowIdx] = updatedTestCase;
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
            let testCaseUpdate = screenLavelTestSteps.find((screen) => screen.name === rowExpandedName.name);
    
            // Create a new array with updated test cases
            let updatedTestCases = testCaseUpdate.testCases.map((testCase, i) => {
                if (i == rowIdx) {
                    let updatedTestCase = {...testCases[rowIdx]};
                    return updatedTestCase;
                }
                return testCase;
            });
    
            // Create a new array of screen objects with updated testCases array
            let updatedScreenLevelTestSteps = screenLavelTestSteps.map((screen) => {
                if (screen.name === rowExpandedName.name) {
                    return { ...screen, testCases: updatedTestCases };
                }
                return screen;
            });
    
            setScreenLevelTastSteps(updatedScreenLevelTestSteps);
            setTestCaseData(testCases);
            setChanged(true);
            setRowChange(!rowChange);
        }
    }
    const pasteSteps = (stepList) => {
        let toFocus = []
        const testData = screenLavelTestSteps.find(item=>item.id === rowExpandedName.id)
        let testCases = [...testData.testCases]
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
        let updatedScreenLevelTestSteps = screenLavelTestSteps.map((screen) => {
            if (screen.name === rowExpandedName.name) {
                return { ...screen, testCases: testCases };
            }
            return screen;
        });
        setScreenLevelTastSteps(updatedScreenLevelTestSteps);
        setShowPS(false);
        setStepSelect({edit: false, check: [], highlight: toFocus});
        headerCheckRef.current.indeterminate = false;
        setHeaderCheck(false);
        setChanged(true);
    }
    const ConfPasteStep = () =>{
         return (
            <Dialog visible={showConfPaste} header="Paste Test Step" onHide={()=>setShowConfPaste(false)} footer={footerPasteStep}>
                <div>Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?</div>
            </Dialog>
        );
    }
       
    const footerPasteStep = () =>(
        <>
            <Button onClick={()=>{setShowConfPaste(false);setShowPS(true);}} label='Yes'/>
            <Button onClick={()=>setShowConfPaste(false)} label='No'/>
        </>
    )
    const selectSteps = stepList => {
        stepList.push(...stepSelect.check)
        let newChecks = Array.from(new Set(stepList))
        setStepSelect({edit: false, check: newChecks, highlight: []});
        const findData = screenLavelTestSteps.find(item=>item.id === rowExpandedName.id)
        headerCheckRef.current.indeterminate = newChecks.length!==0 && newChecks.length !== findData.testCases.length;
        setShowSM(false);
    }


    const showRemarkDialog = (rowIdx) => {
        setStepSelect(oldState => ({ ...oldState, highlight: []}));
    }

    const showDetailDialog = (rowIdx) => {
        setStepSelect(oldState => ({ ...oldState, highlight: []}));
        setShowDetailDlg(String(rowIdx));
        setIdx(true)
    }
    const handleSetList = (e) =>{
        let oldData = [...screenLavelTestSteps];
        let findData = screenLavelTestSteps.find((screen) => screen.name === rowExpandedName.name);
        const reorderedTestcase = e;
        const newReorderedTestCases = reorderedTestcase.map((testcase, idx) => {
        return { ...testcase, stepNo: idx + 1 };
        });
        findData.testCases = newReorderedTestCases;
        let index = screenLavelTestSteps.findIndex((screen) => screen.name === rowExpandedName.name);
        oldData.splice(index, 1, findData);
        setScreenLevelTastSteps(oldData);
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
        const testDatarow = screenLavelTestSteps.find(item=>item.id === rowExpandedName.id)
        headerCheckRef.current.indeterminate = check.length!==0 && check.length !== testDatarow.testCases.length;
    }
    const onDrop = (e) => {
        if (!changed)setChanged(true)
        setDraggedFlag(true);
        setHeaderCheck(false);
        headerCheckRef.current.indeterminate = false;
        handleSetList(newtestcase);
    }

    const onCheckAll = (event) => {
        let checkList = [...stepSelect.check]
        if (event.target.checked) {
            const findData = screenLavelTestSteps.find(item=>item.id === rowExpandedName.id)
            checkList = new Array(findData.testCases.length);
            for (let i=0; i<checkList.length; i++ ) {
                checkList[i] = i;
                // setSelectedOptions(checkList[i])
            }
        }
        else {
            checkList = []
        }
        setStepSelect({edit: false, check: checkList, highlight: []});
        setHeaderCheck(event.target.checked);
        headerCheckRef.current.indeterminate = false;
    }

    useEffect(() => {
        if (inputKeywordName && AllOptions.length > 0) {
          const isExist = AllOptions.some(option => option.value.toLowerCase() === inputKeywordName.toLowerCase());
          setIsNameValid(isExist);
        } else {
          setIsNameValid(false);
        }
    }, [inputKeywordName, AllOptions]);
    console.log(isSpaceError,'space',isNameValid);
    const rowExpansionTemplate = (data) => {
        function handleArrow(){
            setArrow(!arrow)
            if(!arrow){
                toast.current.show({severity:'success', summary: 'Success', detail:'New keywords has been changed to Old keywords', life: 5000}) 
            }else{
                toast.current.show({severity:'success', summary: 'Success', detail:'Old keywords has been changed to New keywords', life: 5000})
            }
        }
     
        return (<>
            <Toast ref={toast} position="bottom-center" baseZIndex={1000} />
            <div className="p-1 dataTableChild">
                    { showSM && <SelectMultipleDialog data-test="d__selectMultiple" setShow={setShowSM} show={showSM} selectSteps={selectSteps} upperLimit={data.testCases.length} /> }
                    { showPS && <PasteStepDialog setShow={setShowPS} show={showPS} pasteSteps={pasteSteps} upperLimit={data.testCases.length}/> }
                    { showConfPaste && <ConfPasteStep />}
                    { showConfirmPop && ConfirmPopups() }
                    { showDetailDlg && <DetailsDialog TCDetails={data.testCases[showDetailDlg].addTestCaseDetailsInfo} setShow={setShowDetailDlg} show={idx} setIdx={setIdx} onSetRowData={setRowData} idx={showDetailDlg} /> }
                <div className="d__table">
                <div className="d__table_header">
                    <span className="step_col d__step_head" >Break Point</span>
                    <span className="sel_col d__sel_head"><input className="sel_obj" type="checkbox" checked={headerCheck} onChange={onCheckAll} ref={headerCheckRef} /></span>
                    <span className="objname_col d__obj_head" >Element Name</span>
                    <span className="keyword_col d__key_head" >{!arrow?"New Keywords":"Old Keywords"}<i className="pi pi-arrow-right-arrow-left" onClick={handleArrow} style={{ fontSize: '1rem',left: '2rem',position: 'relative',top: '0.2rem'}}></i></span>
                    <span className="input_col d__inp_head" >Input</span>
                    <span className="output_col d__out_head" >Output</span>
                    <span className="details_col d__det_head" >Details</span>
                </div>
                <div style={{height: '66vh' }}>
                {data.testCases.length>0 && <div className="d__table_contents"  >
                <div className="ab">
                    <div className="min">
                        <div className="con" id="d__tcListId">
                        <div style={{overflowY:'auto'}}>
                            <ClickAwayListener  mouseEvent="false" touchEvent="false" onClickAway={()=>{ runClickAway ? setStepSelect(oldState => ({ ...oldState, highlight: []})) : runClickAway=true}} style={{height: "100%"}}>
                            <ReactSortable filter=".sel_obj" disabled={!draggable} key={draggable.toString()} list={(data && data.testCases) ? data.testCases.map(x => ({ ...x, chosen: true })) : []} setList={setnewtestcase} style={{overflow:"hidden"}} animation={200} ghostClass="d__ghost_row" onEnd={onDrop}>
                                {
                                data.testCases.map((item, i) => <TableRow data-test="d__tc_row" draggable={draggable}
                                    key={i} idx={i} objList={objNameList} testCase={item} edit={edit} 
                                    getKeywords={getKeywords} getRowPlaceholders={getRowPlaceholders} stepSelect={stepSelect}
                                    updateChecklist={updateChecklist} setStepSelect={setStepSelect} 
                                    setRowData={setRowData} showRemarkDialog={showRemarkDialog} showDetailDialog={showDetailDialog}
                                    rowChange={rowChange} keywordData={keywordList} 
                                    testcaseDetailsAfterImpact={props.testcaseDetailsAfterImpact}
                                    impactAnalysisDone={props.impactAnalysisDone} arrow={arrow}
                                    setCustomKeyWord={setCustomKeyWord}
                                    setStepOfCustomKeyword={setStepOfCustomKeyword}
                                    setInputKeywordName={setInputKeywordName}
                                    setCustomTooltip={setCustomTooltip}
                                    setLangSelect={setLangSelect}
                                    setInputEditor={setInputEditor}
                                    setAlloptions={setAlloptions}
                                    />)
                                } 
                            </ReactSortable>
                            </ClickAwayListener>
                            </div>
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
    
    const rowTog=(e)=>{
        let _expandedRow={}
        if(Object.keys(e.data).length){
            screenLavelTestSteps.forEach(testcase=>{if(selectedTestCase.id===testcase.id){
                _expandedRow[`${testcase.id}`]=true
            }})
        }
    setExpandedRows(_expandedRow)
    }
    
    const approvalOnClick = async () => {

        if (inputKeywordName === '') {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: MSG.DESIGN.WARN_CUSTOMKEY_NOT_ENTERED.CONTENT, life: 2000 })
        }

        else if (inputEditor === '') {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: MSG.DESIGN.WARN_ACE_EDITOR_NOT_ENTERED.CONTENT, life: 2000 })
        }
        else {
            try {
                setCustomKeyWord(false)

                setOverlay('Creating the Kewyord')

                await createKeyword({
                    'name': inputKeywordName,
                    'objecttype': customkeyword,
                    'apptype': props.appType,
                    'code': inputEditor,
                    'elementtype': selectedType,
                    'language': langSelect,
                    'tooltip': customTooltip

                })
                setOverlay('Updating the list ')
                let keywordData = await DesignApi.getKeywordDetails_ICE(props.appType)

                let sortedKeywordList = {};
                for (let object in keywordData) {
                    let firstList = [];
                    let secondList = [];
                    for (let keyword in keywordData[object]) {
                        if (keywordData[object][keyword]['ranking']) {
                            firstList[keywordData[object][keyword]['ranking'] - 1] = ({
                                [keyword]: keywordData[object][keyword]
                            });
                        } else {
                            secondList.push(({
                                [keyword]: keywordData[object][keyword]
                            }));
                        }
                    };
                    // console.log('firstList', firstList);
                    // console.log('secondList', secondList);
                    secondList = [...firstList, ...secondList];
                    // console.log('secondList2', secondList);

                    let keyWordObject = {};
                    // secondList = secondList.forEach((keyword) => {
                    //     keyWordObject[[Object.keys(keyword)[0]]] = Object.values(keyword)[0]
                    // });

                    for (let keyword of secondList) {
                        if (keyword && Object.keys(keyword)[0] && Object.values(keyword)[0])
                            keyWordObject[[Object.keys(keyword)[0]]] = Object.values(keyword)[0];
                        // console.log('Object.keys(keyword)[0]', Object.keys(keyword)[0]);
                        // console.log('Object.values(keyword)[0]', Object.values(keyword)[0]);
                    }
                    // console.log('keyWordObject', keyWordObject);
                    // sortedKeywordList[object] = secondList.reduce((kerwordobjects, currentKeyword) => {
                    //     return ({...kerwordobjects, [Object.keys(currentKeyword)[0]]: Object.values(currentKeyword)[0]})
                    // }, {});
                    // console.log('sortedKeywordList[object]', sortedKeywordList[object]);
                    // sortedKeywordList[object] = { ...secondList };
                    sortedKeywordList[object] = keyWordObject;
                }
                toast.current.show({ severity: 'success', summary: 'Success', detail: MSG.DESIGN.SUCC_CUSTOMKEY_ENTERED.CONTENT, life: 3000 })
                setKeywordList(sortedKeywordList);
                setStepSelect({ edit: false, check: [stepOfCustomKeyword], highlight: [] })
                setOverlay('')
                setCustomTooltip("")
                setInputEditor('');
                setInputKeywordName('');
                setLangSelect('javascript');
                setSelectedType("Specific")
            } catch (error) {

                toast.current.show({ severity: "error", summary: 'Error', detail: MSG.DESIGN.ERR_CUSTOMKEY_NOT_ENTERED.CONTENT, life: 2000 })
                console.error("Error: Failed to communicate with the server ::::", error)

            }
        }
        setInputKeywordName('');
        setCustomTooltip("");
        setLangSelect('javascript');
        setInputEditor('');
        setChecked(false);
    }

    const createCustomeKeywordFooter = () => <>
        <Button
            data-test="createButton"
            label={"save keyword"}
            onClick={approvalOnClick}
            style={{padding: '0.5rem 1rem' }}
            disabled={isNameValid}
        >

        </Button>
    </>

    return (
        <>
        {((screenLavelTestSteps.length === 0) || overlay ) && <ScreenOverlay content={overlay} />}
        <Toast ref={toast} position="bottom-center" baseZIndex={9999} />
            <Dialog className='design_dialog_box' header={headerTemplate} position='right' visible={props.visibleDesignStep} style={{ width: '73vw', color: 'grey', height: '95vh', margin: '0px' }} onHide={() => {props.setVisibleDesignStep(false);props.setImpactAnalysisDone({addedElement:false,addedTestStep:false})}}>
                <div className='toggle__tab'>
                    <DataTable value={screenLavelTestSteps.length>0?uniqueArray(screenLavelTestSteps,'name'):[]} expandedRows={expandedRows} onRowToggle={(e) => rowTog(e)}
                            onRowExpand={onRowExpand} onRowCollapse={onRowCollapse} selectionMode="single" selection={selectedTestCase}
                            onSelectionChange={e => { setSelectedTestCase({name:e.value.name,id:e.value.id})}} rowExpansionTemplate={rowExpansionTemplate}
                            dataKey="id" tableStyle={{ minWidth: '60rem' }}>
                        <Column expander={allowExpansion} style={{ width: '5rem',background: 'white',paddingLeft:'0.5rem' }} />
                        <Column body={bodyHeaderName} style={{background: 'white',paddingLeft:'0.5rem' }}/>
                        <Column body={bodyHeader} style={{ background: 'white',paddingLeft:'0.5rem' }}/>
                    </DataTable>
                </div>
            </Dialog>

            <Dialog className={props.appType !== "Web"?  "debug__object__modal_ForOtherAppTypes" :"debug__object__modal" } header={props.fetchingDetails["parent"]["name"]}  visible={visibleDependentTestCaseDialog} onHide={DependentTestCaseDialogHideHandler} footer={footerContent}>
                <div className={props.appType !== "Web"? "debug__btn_ForOtherAppTypes" : 'debug__btn'}>
                    <div className={props.appType !== "Web"? "debug__object_ForOtherAppTypes" : "debug__object"}>
                        <span className='debug__opt'>
                            <p className='debug__otp__text'>Choose Browsers</p>
                        </span>
                        <span className='browser__col'>
                            <span onClick={() => handleSpanClick("1")} className={selectedSpan === "1" ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/chrome.png' alt='chrome' />Google Chrome {selectedSpan === "1" && <img className='sel__tick' src='static/imgs/ic-tick.png' alt='tick' />}</span>
                            <span onClick={() => handleSpanClick("2")} className={selectedSpan === "2" ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png' alt='firefox' />Mozilla Firefox {selectedSpan === "2" && <img className='sel__tick' src='static/imgs/ic-tick.png' alt='tick' />}</span>
                            <span onClick={() => handleSpanClick("8")} className={selectedSpan === "8" ? 'browser__col__selected' : 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png' alt='edge' />Microsoft Edge {selectedSpan === "8" && <img className='sel__tick' src='static/imgs/ic-tick.png' alt='tick' />}</span>
                        </span>
                    </div>
                    <div>
                        <div className='design__fst__card'>
                        <span className='debug__opt'>
                            <span className='AD__test'>Add Dependent Test Steps (Optional)</span>
                            </span>
                            <div className='card__testcases'>
                            <div className='add__test__case_check'>
                                {testcaseList.map(testCase => {
                                    if(testCase.disableAndBlock) testCase.checked = true;
                                    return (
                                    <div className='test__div' key={testCase.testCaseName}>
                                        <Checkbox className='check__testcase'
                                            inputId={testCase.testCaseName}
                                            value={testCase.testCaseName}
                                            onChange={handleCheckboxChangeAddDependant}
                                            checked={selectedTestCases.includes(testCase.testCaseName)}
                                            disabled={testCase.disableAndBlock}
                                        />
                                        <label className={testCase.disableAndBlock ?'label__testcase_disable' : "label__testcase"} htmlFor={testCase.testCaseName}>{testCase.testCaseName}</label>
                                    </div>  
                                )})}
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
            
            {/* <Toast ref={customKeyToast} position="bottom-center" baseZIndex={1000}/> */}
            <Dialog draggable={false} maximizable visible={customkeyword} onHide={() => { setCustomKeyWord(false); setInputEditor(''); setInputKeywordName(''); setCustomTooltip("");setChecked(false);setLangSelect('javascript'); }} footer={<div style={{paddingTop:'10px'}}>{createCustomeKeywordFooter()}</div>} header={"Custom Keyword"} style={{ width: "75%", height: "90%", overflow: 'hidden' }} position='center'>
                <div className="flex flex-column gap-3" style={{marginTop:'1rem'}}>
                    <div className="flex flex-row gap-1 md:gap-4 xl:gap-8" style={{alignItems:'flex-start'}}>
                        <div className="flex flex-row gap-2 align-items-center">
                            <label htmlFor='isGeneric' className="pb-2 font-medium" style={{ marginTop: "0.3rem" }}>Type: </label><div>I want it to be Generic</div>
                            <Checkbox required checked={checked} value={"Generic"} onChange={(e) => { setChecked(e.checked); setSelectedType(e.value) }} />
                        </div>
                        <div className="flex" style={{flexDirection:'column'}}>
                        <div className="flex flex-row align-items-center gap-2">
                            <label htmlFor='firstName' className="pb-2 font-medium ">Name:</label>
                            <div className="flex" style={{flexDirection:"column"}}>
                            <AvoInput htmlFor="keywordname" data-test="firstName-input__create" maxLength="100"
                                className={`w-full md:w-20rem p-inputtext-sm ${props.firstnameAddClass ? 'inputErrorBorder' : ''}`}
                                type="text"
                                style={{ width: '150%' }}
                                placeholder="Enter custom key"
                                inputTxt={inputKeywordName} 
                                setInputTxt={setInputKeywordName} 
                                isNameValid={isNameValid}
                                setIsSpaceError={setIsSpaceError}
                                nameInput='name'
                                isSpaceError={isSpaceError}
                                />
                                </div>
                                </div>
                                <div className="flex" style={{flexDirection:'column',paddingLeft:'3.5rem'}}>

                                {isNameValid && <small id="username-help" style={{color:'red'}}>
                                  *keyword already exists
                                </small>}
                                {isSpaceError && <small id="username-help" style={{color:'red'}}>
                                  *space not allowed
                                </small>}
                                </div>
                        
                        </div>
                        <div className="flex flex-row align-items-center gap-2" style={{ width: "30%" }}>
                            <label htmlFor='TooltipNamme' className="pb-2 font-medium ">Tooltip: </label>
                            <AvoInput htmlFor="keywordtooltip" maxLength="100"
                                className={`w-full md:w-20rem p-inputtext-sm ${props.firstnameAddClass ? 'inputErrorBorder' : ''}`}
                                type="text"
                                style={{ width: '160%' }}
                                placeholder="Enter short description"
                                inputTxt={customTooltip} setInputTxt={setCustomTooltip}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-row gap-3">
                    <div className="buildtype_container" style={{ overflow: 'hidden' }}>
                        <div className="flex flex-wrap gap-8" style={{ padding: "0.5rem 2.5rem 1rem 0rem" }}>

                            <div className="flex align-items-center" >
                                <RadioButton onChange={onSelectLanguage} className="ss__build_type_rad" type="radio" name="program_language" value="javascript" checked={langSelect === 'javascript'} />
                                <label htmlFor="ingredient1" className="ml-2 ss__build_type_label">JavaScript</label>
                            </div>
                            <div className="flex align-items-center"  >
                                <RadioButton onChange={onSelectLanguage} className="ss__build_type_rad" type="radio" name="program_language" value="python" checked={langSelect === 'python'} />
                                <label htmlFor="ingredient2" className="ml-2 ss__build_type_label">Python</label>
                            </div>
                        </div>
                    </div>

                </div>
                <div className='languageEditor'>

                    <AceEditor
                        mode={langSelect}

                        name="editor"
                        //value={this.props.data}
                        theme="monokai"
                        fontSize={14}


                        onChange={handleAceEditor}
                        editorProps={{ $blockScrolling: true }}
                        style={{ width: "100%" }}
                        value={inputEditor}
                        //   onValidate={(annotations)=>{
                        //     console.log(annotations);
                        //   }}

                        setOptions={{
                            enableSnippets: true,
                            showLineNumbers: true,
                            tabSize: 3,
                            useWorker: true,
                            highlightActiveLine: true,
                            behavioursEnabled: true,
                            showPrintMargin: false,
                            hScrollBarAlwaysVisible: false,
                            vScrollBarAlwaysVisible: false,
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                        }}

                    />
                </div>

            </Dialog>
        </>
    )
}
export default DesignModal;