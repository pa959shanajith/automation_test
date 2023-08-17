import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, getNotificationGroups } from '../api';
import { Messages as MSG,ScreenOverlay,RedirectPage,SelectRecipients} from "../../global";
import { getObjNameList, getKeywordList } from "../components/UtilFunctions";
import * as DesignApi from "../api";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Divider } from 'primereact/divider';
import '../styles/DesignTestStep.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TestCases, copiedTestCases, SaveEnable, Modified } from '../designSlice';
import { InputText } from 'primereact/inputtext';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Tooltip } from 'primereact/tooltip';
import TableRow from "../components/TableRow";
import { ReactSortable } from 'react-sortablejs';
import ClickAwayListener from 'react-click-away-listener';
import DetailsDialog from "../components/DetailsDialog";
import RemarkDialog from "../components/RemarkDialog";
import PasteStepDialog from "../components/PasteStepDialog";
import SelectMultipleDialog from "../components/SelectMultipleDialog";
import { Checkbox } from 'primereact/checkbox';


const DesignModal = (props) => {
    const toast = useRef();
    const testcaseDropdownRef = useRef();
    const headerCheckRef = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    let userInfo = useSelector((state) => state.landing.userinfo);
    const copiedContent = useSelector(state => state.design.copiedTestCases);
    const modified = useSelector(state => state.design.Modified);
    const saveEnable = useSelector(state => state.design.SaveEnable);
    const mainTestCases = useSelector(state => state.design.TestCases);
    const [showTable, setShowTable] = useState(false);
    const [selectedSpan, setSelectedSpan] = useState(null);
    const [visibleDependentTestCaseDialog, setVisibleDependentTestCaseDialog] = useState(false);
    const [testCases, setTestCases] = useState(null);
    const [addedTestCase, setAddedTestCase] = useState([]);
    const [overlay, setOverlay] = useState("");
    const [keywordList, setKeywordList] = useState(null);
    const [keywordListTable, setKeywordListTable] = useState([]);
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
    const [showPopup, setShow] = useState({});
    const [debugEnable, setDebugEnable] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [testCaseIDsList, setTestCaseIDsList] = useState([]);
    const [testcaseList, setTestcaseList] = useState([]);
    const [dependencyTestCaseFlag, setDependencyTestCaseFlag] = useState(false);
    const [deleteTestDialog, setDeleteTestDialog] = useState(false);
    const [testCase, setTestCase] = useState(null)
    const [selectedTestCases,setSelectedTestCases]=useState([]);
    const [selectedOptions, setSelectedOptions] = useState(null);
    const [disableStep, setDisableStep] = useState(true);
    const [idx, setIdx] = useState(false);
    const [imported, setImported] = useState(false);
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [screenLavelTestSteps, setScreenLevelTastSteps] = useState([]);
    const [newtestcase, setnewtestcase] = useState([screenLavelTestSteps.testCases]);
    const [rowExpandedName,setRowExpandedName] = useState({name:'',id:''});
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [visible, setVisible] = useState(false);
    const [edit, setEdit] = useState(false);
    const [showRemarkDlg, setShowRemarkDlg] = useState(false);
    const [showDetailDlg, setShowDetailDlg] = useState(false);
    const [showSM, setShowSM] = useState(false);
    const [showConfPaste, setShowConfPaste] = useState(false);
    const [showPS, setShowPS] = useState(false);
    const [recipients,setRecipients] =useState({groupids:[],additionalrecepients:[]})
    const [allUsers,setAllUsers] = useState([])
    const [groupList,setGroupList] = useState([])
    const [rowChange, setRowChange] = useState(false);
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
        dispatch(TestCases(testCaseData))
        //eslint-disable-next-line
        for (let value of testCaseData) {
            if (value.custname === "" || value.custname === "OBJECT_DELETED") {
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

    useEffect(() => {
        setChanged(true);
    }, [saveEnable]);

    useEffect(() => {
        if (imported) {
            for(var i = 0 ; i<parentScreen.length; i++){
                fetchTestCases(i)
                .then(data=>{
                    if (data==="success") 
                        // setMsg(MSG.DESIGN.SUCC_TC_IMPORT);
                        toast.current.show({severity:'success', summary:'Success', detail:MSG.DESIGN.SUCC_TC_IMPORT.CONTENT, life:3000})
                    else 
                        // setMsg(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                        toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_DELETED_TC_FOUND.CONTENT , life:2000})
                    setImported(false)
                    setStepSelect({edit: false, check: [], highlight: []});
                    setChanged(false);
                    // headerCheckRef.current.indeterminate = false;
                })
                .catch(error=>console.error("Error: Fetch TestCase Failed ::::", error));
            }
        }
        //eslint-disable-next-line
    }, [imported]);
    const ConfirmPopups = () => (
        <Dialog visible={showConfirmPop} header={showConfirmPop.title} onHide={setShowConfirmPop(false)} footer={footerPopUp} >
            <div>{showConfirmPop.content}</div>
        </Dialog>
    )
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
        // if (Object.keys(userInfo).length) {
            //  && Object.keys(props.current_task).length) {
            for(var i = 0 ; i<parentScreen.length; i++){
                fetchTestCases(i)
                .then(data => {
                    data !== "success" &&
                        toast.current.show({severity:'warn',summary:'Warning', detail:MSG.DESIGN.WARN_DELETED_TC_FOUND.CONTENT,life:2000});
                        setEdit(false);
                    setStepSelect({ edit: false, check: [], highlight: [] });
                    headerCheckRef.current.indeterminate = false;
                    setDraggable(false);
                    setChanged(false);
                    setHeaderCheck(false);
                    // setIsUnderReview(props.current_task.status === "underReview")
                })
                .catch(error => console.error("Error: Fetch TestCase Failed ::::", error));
            }
            setScreenLevelTastSteps(screenLevelTestCases)
        // }
        //eslint-disable-next-line
    }, [userInfo, setScreenLevelTastSteps]);

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
                        // if (Object.keys(props.checkedTc).length <= 0 && !disableAndBlock) {
                        //     tc.checked = true;
                        // }

                        // if ((i in props.checkedTc) && !disableAndBlock) tc.checked = true;
                        if (tc.testCaseName === props.fetchingDetails.name) disableAndBlock = false;

                        testCases.push(tc);
                    }

                    testCases.reverse();
                    setTestcaseList(testCases);
                    // console.log(testCases);
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
                        // dispatch({type: pluginActions.SET_CT, payload: taskObj});
                    }

                    if (data.del_flag) {
                        deleteObjectFlag = true; // Flag for DeletedObjects Popup
                        // props.setDisableActionBar(true); //disable left-top-section
                    }
                    // else props.setDisableActionBar(false); //enable left-top-section

                    // setHideSubmit(data.testcase.length === 0);
                    // setReusedTC(data.reuse);

                    DesignApi.getScrapeDataScreenLevel_ICE(props.appType, props.fetchingDetails.parent['_id'], props.fetchingDetails.projectID, props.fetchingDetails['parent']['children'][j]["_id"])
                        .then(scriptData => {
                            if (scriptData === "Invalid Session") return;

                            setTestScriptData(scriptData.view);
                            // props.setMirror(scriptData.mirror);

                            // DesignApi.getKeywordDetails_ICE(props.appType)
                            //     .then(keywordData => {
                            //         if (keywordData === "Invalid Session") return;

                            //         setKeywordList(keywordData);
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
                                    // console.log('firstList', firstList);
                                    // console.log('secondList', secondList);
                                    secondList = [...firstList, ...secondList];
                                    // console.log('secondList2', secondList);
                                    
                                    let keyWordObject = {};
                                    // secondList = secondList.forEach((keyword) => {
                                    //     keyWordObject[[Object.keys(keyword)[0]]] = Object.values(keyword)[0]
                                    // });
                                    
                                    for(let keyword of secondList){
                                        if(keyword&& Object.keys(keyword)[0] && Object.values(keyword)[0])
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
                                setKeywordList(sortedKeywordList);
                                    let testcaseArray = [];
                                    if (data === "" || data === null || data === "{}" || data === "[]" || data.testcase.toString() === "" || data.testcase === "[]") {
                                        testcaseArray.push(emptyRowData);
                                        // props.setDisableActionBar(true);
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
                                                testcase[i].keywordVal = testcase[i].keywordVal[0].toLowerCase() + testcase[i].keywordVal.slice(1,);
                                                if(testcase[i].custname !== "OBJECT_DELETED"){
                                                    let objType = getKeywordList(testcase[i].custname,keywordData,props.appType,scriptData.view)
                                                    testcase[i]["keywordTooltip"] = keywordData[objType.obType][temp]?.tooltip!==undefined?keywordData[objType.obType][temp].tooltip:testcase[i].keywordVal;
                                                    testcase[i]["keywordDescription"] = keywordData[objType.obType][temp]?.description!==undefined?keywordData[objType.obType][temp].description:testcase[i].keywordVal;
                                                }else{
                                                    // let objType = getKeywordList(testcase[i].custname,keywordData,props.appType)
                                                    testcase[i]["keywordTooltip"] = testcase[i].keywordVal;
                                                    testcase[i]["keywordDescription"] = testcase[i].keywordVal ;
                                                }
                                                testcaseArray.push(testcase[i]);
                                            }
                                        }
                                        setOverlay("");
                                    }
                                    setDraggable(false);
                                    screenLevelTestCases.push({name:parentScreen[j].name,testCases:testcaseArray.length?testcaseArray:[emptyRowData],id:parentScreen[j]._id})
                                    // console.log("screen", screenLevelTestCases)
                                    setTestCaseData([...testCaseData,testcaseArray]);
                                    setnewtestcase([...newtestcase, testcaseArray]); 
                                    setPastedTC([]);
                                    setObjNameList(getObjNameList(props.appType, scriptData.view));
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
                                    toast.current.show({severity:'error', summary:'Error', detail:MSG.DESIGN.ERR_FETCH_TC.CONTENT,life:2000});
                                    reject("fail");
                                });
                    })
                    .catch(error => {
                        setOverlay("");
                        setTestCaseData([]);
                        setTestScriptData(null);
                        setKeywordList(null);
                        setObjNameList(null);
                        toast.current.show({severity:'error', summary:'Error', detail:MSG.DESIGN.ERR_FETCH_TC.CONTENT, life:2000});
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
                toast.current.show({severity:'error', summary:'Error', detail:MSG.DESIGN.ERR_FETCH_TC.CONTENT, life:2000});
                console.error("Error getTestScriptData method! \r\n " + (error));
                reject("fail");
            });
        });
    };


    const saveTestCases = (e, confirmed) => {
        if (userInfo.role !== "Viewer") {
            if (reusedTC && !confirmed) {
                setShowConfirmPop({ 'title': 'Save Testcase', 'content': 'Testcase has been reused. Are you sure you want to save?', 'onClick': () => { setShowConfirmPop(false); saveTestCases(null, true) } });
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


            // let { screenId, testCaseId, testCaseName, versionnumber } = props.current_task;
            let import_status = false;

            if (String(screenId) !== "undefined" && String(testCaseId) !== "undefined") {
                let errorFlag = false;
                let testCases = [];
                let findData = screenLavelTestSteps.find(screen=>screen.name===rowExpandedName.name)
                testCases = [...findData.testCases]
                for (let i = 0; i < testCases.length; i++) {
                    let step = i + 1
                    testCases[i].stepNo = step;

                    if (!testCases[i].custname || !testCases[i].keywordVal) {
                        let col = "Object Name";
                        if (!testCases[i].keywordVal) col = "keyword";
                        // setMsg(MSG.CUSTOM(`Please select ${col} Name a`));
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
                        DesignApi.updateTestCase_ICE(testCaseId, testCaseName, testCases, userInfo, 0 /**versionnumber*/, import_status, pastedTC)
                        .then(data => {
                            if (data === "Invalid Session") return;
                            if (data === "success") {
                                if (props.appType.toLowerCase() === "web" && Object.keys(modified).length !== 0) {
                                    let scrape_data = {};
                                    // let { appType, projectId, testCaseId, versionnumber } = props.current_task;

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
                                                        fetchTestCases(i)
                                                        .then(msg=>{
                                                            setChanged(false);
                                                            msg === "success"
                                                            ? toast.current.show({severity:"success", summary:'Success', detail:MSG.DESIGN.SUCC_TC_SAVE.CONTENT , life:3000})
                                                            : toast.current.show({severity:"warn", summary:'Warning', detail:MSG.DESIGN.WARN_DELETED_TC_FOUND.CONTENT , life:2000})
                                                        })
                                                        .catch(error => {
                                                            // setMsg(MSG.DESIGN.ERR_FETCH_TC);
                                                            toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_FETCH_TC.CONTENT , life:2000})
                                                            console.error("Error: Fetch TestCase Failed ::::", error)
                                                        });
                                                    }        
                                                } else toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_SAVE_TC.CONTENT , life:2000})
                                                // setMsg(MSG.DESIGN.ERR_SAVE_TC);
                                            })
                                            .catch(error => {
                                                // setMsg(MSG.DESIGN.ERR_SAVE_TC);
                                                toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_SAVE_TC.CONTENT , life:2000})
                                                console.error("Error::::", error)
                                            })
                                })
                                .catch(error=> {
                                    // setMsg(MSG.DESIGN.ERR_SAVE_TC);
                                    toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_SAVE_TC.CONTENT , life:2000})
                                    console.error("Error:::::", error)
                                });
                            }
                            else{
                                for (var i = 0; parentScreen.length>i; i++){
                                    fetchTestCases(i)
                                    .then(data=>{
                                        setChanged(false);
                                        data === "success" 
                                        ? toast.current.show({severity:'success', summary:'Success', detail:MSG.DESIGN.SUCC_TC_SAVE.CONTENT, life:3000}) 
                                        : toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_DELETED_TC_FOUND.CONTENT, life:2000})
                                    })
                                    .catch(error=>{
                                        // setMsg(MSG.DESIGN.ERR_FETCH_TC);
                                        toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_FETCH_TC.CONTENT , life:2000})
                                        console.error("Error: Fetch TestCase Failed ::::", error)
                                    });
                                }
                            }
                        } else toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_SAVE_TC.CONTENT , life:2000})
                        // setMsg(MSG.DESIGN.ERR_SAVE_TC);
                    })
                    .catch(error => { 
                        // setMsg(MSG.DESIGN.ERR_SAVE_TC);
                        toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_UNDEFINED_SID_TID.CONTENT , life:2000})
                        console.error("Error::::", error);
                    });
                    errorFlag = false;
                }
            } else toast.current.show({severity:"error", summary:'Error', detail:MSG.DESIGN.ERR_UNDEFINED_SID_TID.CONTENT , life:2000}) 
            // setMsg(MSG.DESIGN.ERR_UNDEFINED_SID_TID);
        }
        setStepSelect({edit: false, check: [], highlight: []});
        // headerCheckRef.current.indeterminate = false;
        setHeaderCheck(false);
        setDebugEnable(false);
    }

    const addRow = () => {
        const updateData = screenLavelTestSteps.find((item)=>item.id === rowExpandedName.id)
        let testCases = [...updateData.testCases]
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
            testCases.splice(updateData.testCases.length, 0, emptyRowData);
            insertedRowIdx.push(updateData.testCases.length)
        }
        // let oldScreenLevelTestSTeps=[...testCases]
        // let testCaseUpdated = screenLavelTestSteps.find((screen) => screen.name === rowExpandedName.name);
        // let emptyRowDataIndex = { ...emptyRowData, stepNo: testCaseUpdated.testCases.length + 1 };
        // let data = [...testCaseUpdated.testCases, emptyRowDataIndex];
        // let updatedTestCase = { ...testCaseUpdated, testCases: data };
        // let index=screenLavelTestSteps.findIndex(screen=>screen.name === rowExpandedName.name)
        // oldScreenLevelTestSTeps.splice(index, 1, updatedTestCase)
        let updatedScreenLevelTestSteps = screenLavelTestSteps.map((screen) => {
            if (screen.name === rowExpandedName.name) {
                return { ...screen, testCases: testCases };
            }
            return screen;
        });
        setScreenLevelTastSteps(updatedScreenLevelTestSteps)
        // setTestCaseData(testCases);
        setStepSelect({edit: false, check: [], highlight: insertedRowIdx});
        setHeaderCheck(false);
        setChanged(true);
        headerCheckRef.current.indeterminate = false;
        // setEdit(false);
       
    }

    const getKeywords = useCallback(objectName => getKeywordList(objectName, keywordList, props.appType, testScriptData), [keywordList, props.appType, testScriptData]);

    const getRowPlaceholders = useCallback((obType, keywordName) => keywordList[obType][keywordName], [keywordList])

    //Debug function
    const showSuccess = (success) => {
        toast.current.show({severity:'success', summary: 'Success', detail:success, life: 3000});
    }

    const showInfo = (Info) => {
        toast.current.show({severity:'info', summary: 'Info', detail:Info, life: 2000});
    }

    const showWarn = (Warn) => {
        toast.current.show({severity:'warn', summary: 'Warning', detail:Warn, life: 2000});
    }

    const showError = (Error) => {
        toast.current.show({severity:'error', summary: 'Error', detail:Error, life: 3000});
    }
    const debugTestCases = selectedBrowserType => {
        setVisibleDependentTestCaseDialog(false);
        let testcaseID = [];
        let browserType = [];

        if (props.appType !== "MobileWeb" && props.appType !== "Mainframe") browserType.push(selectedBrowserType);

        // globalSelectedBrowserType = selectedBrowserType;5
        let findTestCaseId = screenLavelTestSteps.find(screen=>screen.name===rowExpandedName.name)
        if (dependencyTestCaseFlag) testcaseID = testCaseIDsList;
        else testcaseID.push(findTestCaseId.id);
        setOverlay('Debug in Progress. Please Wait...');
        // ResetSession.start();
        DesignApi.debugTestCase_ICE(browserType, testcaseID, userInfo, props.appType)
            .then(data => {
                setOverlay("");
                // ResetSession.end();
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
                    // setMsg(MSG.DESIGN.SUCC_DEBUG);
                    setSelectedTestCases([])
                    toast.current.show({severity: 'success',summary: 'Success', detail:MSG.DESIGN.SUCC_DEBUG.CONTENT, life:3000})
                } else {
                    // setMsg(data);
                    toast.current.show({severity: 'success',summary: 'Success', detail:data, life:3000})
                }										
            })
            .catch(error => {
                setOverlay("");
                // ResetSession.end();
                // setMsg(MSG.DESIGN.ERR_DEBUG);
                toast.current.show({severity:'error',summary: 'Error', detail:MSG.DESIGN.ERR_DEBUG.CONTENT, life:2000})
                console.log("Error while traversing while executing debugTestcase method! \r\n " + (error.data));
            });
    };

    const handleSpanClick = (index) => {
        if (selectedSpan === index) {
            setSelectedSpan(null);
        } else {
            setSelectedSpan(index);
        }
    };

    const toggleTableVisibility = (e) => {
        setShowTable(true);
        console.log(e)
    };
    const handleAdd = (testCase) => {
        const isTestIDPresent = addedTestCase.some(item => item.testCaseID === testCase.testCaseID);
    
        if (isTestIDPresent) {
            toastError("Duplicate Dependent Testcase found");
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
                setSelectedTestCases([...selectedTestCases, testCase.testCaseName]);
                handleAdd(testCase);
            } else {
                setSelectedTestCases(selectedTestCases.filter(item => item !== testCase.testCaseName));
                // Add code to handle the removal of the testCase from addedTestCase
            }
        }
    };
    // const handleAdd = () => {
    //     const update = { ...testCases };
    //     const addTestcaseData = {};
    //     const TestIDPresent = addedTestCase.filter(item => {
    //         return item.testCaseID === testCases.testCaseID
    //     });
    //     // console.log("TestIDPresent", TestIDPresent);
    //     if (TestIDPresent.length > 0) {
    //         toastError("Duplicate Dependent Testcase found");
    //     }
    //     else {
    //         addTestcaseData["testCaseID"] = update.testCaseID;
    //         addTestcaseData["testCaseName"] = update.testCaseName;
    //         addTestcaseData["disableAndBlock"] = update.disableAndBlock;
    //         addTestcaseData["checked"] = true;
    //         setTestCaseIDsList([...testCaseIDsList, update.testCaseID])
    //         setAddedTestCase([...addedTestCase, addTestcaseData]);
    //         setDependencyTestCaseFlag(true);
    //         setTestCases(null);
    //     }
    // };

    const toastError = (errMessage) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: errMessage, life: 10000 });
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
                <h5 className='dailog_header1'>Design Test steps</h5>
                <h4 className='dailog_header2'>{props.fetchingDetails["parent"]["name"]}</h4>
                <img className="btn_test_screen" src="static/imgs/bi_code-square.svg" alt='screen icon' />
            </div>
        </>
    );
    const bodyHeader = ()=>{
        let bodyData = screenLavelTestSteps.find(screen=>screen.name === rowExpandedName.name)
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
                            throw MSG.DESIGN.ERR_FILE_FORMAT
                        for (let i = 0; i < resultString.length; i++) {
                            if (!resultString[i].appType)
                                throw MSG.DESIGN.ERR_JSON_IMPORT
                            if (
                                resultString[i].appType.toLowerCase() !== "generic" && 
                                resultString[i].appType.toLowerCase() !== "pdf" &&
                                resultString[i].appType !== props.appType
                            ) 
                                throw MSG.DESIGN.ERR_NO_MATCH_APPTYPE
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
                        
                    } else throw  toast.current.show({severity:'error', summary:"Error", detail:MSG.DESIGN.ERR_FILE_FORMAT.CONTENT, life:1000});
                }
                catch(error){
                    setOverlay("");
                    if (typeof(error)==="object") toast.current.show({severity:'error', summary:'Error', detail:error, life:1000});
                    else toast.current.show({severity:'error', summary:'Error', detail:MSG.DESIGN.ERR_TC_JSON_IMPORT.CONTENT, life:1000})
                    // setMsg(MSG.DESIGN.ERR_TC_JSON_IMPORT)
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
                <ConfirmDialog visible={visible} onHide={() => setVisible(false)} message='Import will erase your old data. Do you want to continue?' 
                    header="Table Consists of Data" accept={()=>importTestCase(true)} reject={()=>setVisible(false)} />
            {bodyData && <div>
                {(bodyData.name === rowExpandedName.name)?<div className='btn__grp'>
                    <i className='pi pi-plus' style={{marginTop:'0.9rem'}}  onClick={()=>addRow()} />
                    <Tooltip target=".pi-plus " position="bottom" content="  Add Test Step"/>
                    <img src='static/imgs/ic-jq-editsteps.png' alt='edit' className='edit' style={{width:'20px', height:'20px', marginTop:'0.7rem'}} onClick={()=>editRow()}/>
                    <Tooltip target=".edit " position="bottom" content="  Edit Test Step"/>
                    <img src='static/imgs/ic-selmulti.png' alt='Select Steps' className='select' style={{width:'20px', height:'20px', marginTop:'0.7rem'}} onClick={()=>selectMultiple()}/>
                    <Tooltip target='.select' position='bottom' content='  Select Test Step(s)'/>
                    <img src='static/imgs/ic-jq-dragstep.png' alt='Drag Steps' className='drag' style={{width:'20px', height:'20px', marginTop:'0.7rem'}} onClick={()=>toggleDrag()}/>
                    <Tooltip target='.drag' position='bottom' content='  Drag & Drop Test Step'/>
                    <img src='static/imgs/ic-jq-copysteps.png' alt='Copy Steps' className='copy' style={{width:'20px', height:'20px', marginTop:'0.7rem'}} onClick={()=>copySteps()}/>
                    <Tooltip target='.copy' position='bottom'content='  Copy Test Step'/>
                    <img src='static/imgs/ic-jq-pastesteps.png' alt='Paste steps' className='paste' style={{width:'20px', height:'20px', marginTop:'0.7rem'}} onClick={()=>onPasteSteps()}/>
                    <Tooltip target=".paste" position='bottom' content='  Paste Test Step'/>
                    <img src='static/imgs/skip-test-steps.png' alt='comment steps'className='comment' style={{width:'20px', height:'20px', marginTop:'0.7rem'}} onClick={()=>commentRows()}/>
                    <Tooltip target=".comment " position="bottom" content="  Skip Test Step"/>
                    <i className='pi pi-trash' style={{marginTop:'0.9rem'}} title='Delete' onClick={deleteTestcase} />
                    <Tooltip target=".pi-trash " position="bottom" content="  Delete"/>
                    <Divider type="solid" layout="vertical" style={{padding: '0rem'}}/>
                    <img src='static/imgs/import_new_18x18_icon.svg' className='ImportSSSS' alt='import' onClick={()=>importTestCase()} />
                    <Tooltip target=".ImportSSSS" position="bottom" content="Import Test Steps"/>
                    <input id="importTestCaseField" type="file" style={{display: "none"}} ref={hiddenInput} onChange={onInputChange} accept=".json"/>
                    <img src='static/imgs/Export_new_icon_grey.svg' alt='export' className='ExportSSSS' style={{width:'18px'}}  onClick={()=>exportTestCase()} />
                    <Tooltip target=".ExportSSSS" position="bottom" content="Export Test Steps"/>
                    <Divider type="solid" layout="vertical" style={{padding: '0rem'}}/>
                    <Button label="Debug" size='small'  disabled={debugEnable} className="debuggggg" onClick={()=>{DependentTestCaseDialogHideHandler(); setVisibleDependentTestCaseDialog(true)}} outlined></Button>
                    <Tooltip target=".debuggggg" position="left" content=" Click to debug and optionally add dependent test steps repository." />
                    <Button className="SaveEEEE" data-test="d__saveBtn" title="Save Test Case" onClick={saveTestCases} size='small' disabled={!changed} label='Save'/>
                    <Tooltip target=".SaveEEEE" position="left" content="  save" />
            </div>:null}
            </div>}
            </>
        );
    }

    // const footerTemplate = (
    //     <>
    //         <div className='btn__grp'>
    //            <Button size='small' label='Save' title='Save' onClick={saveTestCases} outlined></Button>
    //           {selectedTestCases &&  <Button size='small' label='Delete' title='Delete' onClick={()=>setDeleteTestDialog(true)}></Button>}
    //         </div>
    //     </>
    // );

    // const emptyMessage = (
    //     <div className='empty__msg1'>
    //         <div className='empty__msg'>
    //             <img className="not_captured_ele" src="static/imgs/ic-capture-notfound.png" alt="No data available" />
    //             <p className="not_captured_message">No Design Step yet</p>
    //         </div>
    //         <Button size='small' className="btn-design-single" label='Design Test Steps' onClick={()=>addRow()}></Button>
    //     </div>
    // );

    const footerContent = (
        <div>
            <Button label="Cancel" size='small' onClick={() => DependentTestCaseDialogHideHandler()} className="p-button-text" />
            <Button label="Debug" size='small' onClick={() => debugTestCases(selectedSpan)} autoFocus />
        </div>
    );
    // const [objName, setObjName] = useState(null);
    // const [objType, setObjType] = useState(null);
    
    // const elementEditor = (options) => {
    //     return (
    //         <Dropdown
    //             value={objName}
    //             options={objNameList}
    //             onChange={(e) => {options.editorCallback(e.value);setKeywordListTable(getKeywords(e.value).keywords);setKeyword(getKeywords(e.value).keywords[0]);setObjName(e.value);setObjType(getKeywords(e.value).obType); const caseData = getKeywords(e.target.value)
    //                 const placeholders = getRowPlaceholders(caseData.obType, caseData.keywords[0]);
    //                 setInput("");
    //                 setOutput("");
    //                 // setKeywordList(caseData.keywords);
    //                 setObjType(caseData.obType);
    //                 setOutputPlaceholder(placeholders.outputval);
    //                 setInputPlaceholder(placeholders.inputval);}}
    //             placeholder="Select a element"
    //             style={{maxWidth:'10rem'}}
    //             className='select-option'
    //         />
    //     );
    // };
    // const [startIndex, setStartIndex] = useState(0);
    // const [endIndex, setEndIndex] = useState(7);
    // const [inputPlaceholder, setInputPlaceholder] = useState('');
    // const [outputPlaceholder, setOutputPlaceholder] = useState('');
    // const [input, setInput] = useState('');
    // const [output, setOutput] = useState('');
    // const [ ID, setID] = useState(0);
    // const [focused, setFocused] = useState(false);
    // const [keywords, setKeywords] = useState(null);
    // const [allkeyword, setAllKeyword] = useState([]);

    // const onKeySelect = event => {
    //     if (event.value === 'show all') {
    //         setEndIndex(keywordListTable.length);
    //     }
    //     else{
    //         // const placeholders = getRowPlaceholders(objType, event.value);
    //         // setOutputPlaceholder(placeholders.outputval);
    //         // setInputPlaceholder(placeholders.inputval);
    //         setKeywords(event.value);
    //         setSelectedOptions(event.value);
    //         setAllKeyword(optionKeyword);
    //         testcaseDropdownRef.current.focus();
    //         // testcaseDropdownRef.current.blur();
    //         document.dispatchEvent(new KeyboardEvent('keypress', { key: " " }));
    //     }
    // };
    // const submitChanges = event => {
    //     if (event.keyCode === 13){
    //         console.log({rowIdx: ID, operation: "row", objName: objName, keyword: keywords, inputVal: input, outputVal: output, appType: props.appType });
    //         // setStepSelect(oldState=>({...oldState, highlight: []}));
    //     }
    //     else if (event.keyCode === 27) {
    //         // setStepSelect(oldState=>({...oldState, highlight: []}));
    //     }
    // }
    // useEffect(()=>{
    //     if(screenLavelTestSteps.length>0){
    //         const testCase = screenLavelTestSteps.find(screen=>screen.name === rowExpandedName.name)
    //         if(testCase !== undefined){
    //             let caseData = null;
    //             let placeholders = null;
    //             let data = null;
    //             let keyData = null;
    //             if(testCase.testCases.length>0){
    //                 for(var i = 0; testCase.testCases.length>i; i++){
    //                     if (!testCase.testCases[i].custname || (testCase.testCases[i].custname !== "OBJECT_DELETED" && objNameList.includes(testCase.testCases[i].custname))){
    //                         let obj = !testCase.testCases[i].custname ? objNameList[0] : testCase.testCases[i].custname;
    //                         caseData = getKeywords(obj)
    //                         data=obj;
    //                         let key = (!caseData.keywords.includes(testCase.testCases[i].keywordVal) || !testCase.testCases[i].custname) ? caseData.keywords[0] : testCase.testCases[i].keywordVal;
    //                         placeholders = getRowPlaceholders(caseData.obType, key);
    //                         keyData = key
    //                     }
    //                 }
    //             }
    //             // let obj = !testCase.custname ? objNameList : testCase.custname;
    //             // caseData = getKeywords(obj)
    //             setObjName(data); 
    //             setObjType(caseData.obType);
    //             setKeywordListTable(caseData.keywords)
    //             setOutputPlaceholder(placeholders.outputval);
    //             setInputPlaceholder(placeholders.inputval);
    //             setSelectedOptions(keyData);
    //         }
    //     }
    // },[getKeywords, getRowPlaceholders, objNameList, rowExpandedName, screenLavelTestSteps])
    // const optionKeyword = keywordListTable?.slice(startIndex, endIndex + 1).map((keyword, i) => {
    //     if (i < endIndex) {
    //         return {
    //             value: keyword,
    //             label: keywordList[objType] && keyword !== "" && keywordList[objType][keyword] && keywordList[objType][keyword].description !== undefined ? keywordList[objType][keyword].description : "",
    //             tooltip: keywordList[objType] && keyword !== "" && keywordList[objType][keyword] && keywordList[objType][keyword].tooltip !== undefined ? keywordList[objType][keyword].tooltip : ""
    //         }
    //     }
    //     else {
    //         return {
    //             value: "show all",
    //             label: "Show All"
    //         }
    //     }});

    //     const getOptionLabel = (option) => {
    //         return (
    //           <div title={option.tooltip}>
    //             {option.label === "Show All"? <div style={{color:'blue'}}>{option.label}</div>: <div>{option.label}</div>}
    //           </div>
    //         );
    //       };

    //     const customStyles = {
    //         menuList: (base) => ({
    //           ...base,
    //           FontSize: 100,
    //           width: 200,
    //           fontSize: 12,
    //           background: "white",
    //           height:240,
    //         }),
    //         menuPortal: base => ({ 
    //             ...base, 
    //             zIndex: 9999
    //          }),
    //         menu: base => ({ 
    //             ...base, 
    //             zIndex: 9999 
    //         }),
    //         control: (base) => ({
    //           ...base,
    //           height: 25,
    //           minHeight: 35,
    //           width: 150
    //         }),
    //         option: (base) =>({
    //             ...base,
    //             padding: "3px",
    //           fontFamily: "Lato Web",
    //         })
    //       };
    // const keywordEditor = (options) => {
    //     setFocused(true);
    //     return (
    //         <div className='select-option'>
    //             <Dropdown width='10rem' value={selectedOptions} inputid="testcaseDropdownRefID" ref={testcaseDropdownRef} onChange={(e)=>{options.editorCallback(e.value);onKeySelect(e)}} onKeyDown={(e)=>{options.editorCallback(e.value);submitChanges()}} closeMenuOnSelect={true} options={optionKeyword} optionLabel={getOptionLabel} menuPlacement="auto" isSearchable={false} placeholder='Select a keyword'/>
    //         </div> 
    //    )
    // };
    // const inputEditor = (options) => {
    //     return <InputText type="text" style={{width:'10rem'}} value={options.value} onChange={(e) => options.editorCallback(e.target.value)} placeholder={inputPlaceholder} />;
    // };
    // const outputEditor = (options) => {
    //     return <InputText type="text" style={{width:'10rem'}} value={options.value} onChange={(e) => options.editorCallback(e.target.value)} placeholder={outputPlaceholder} />;
    // };

    // const onRowEditComplete = (e) => {
    //     let { newData, index } = e;
    //     let updateNewData = { ...newData, 
    //         keywordDescription:"",
    //         keywordVal: newData.keywordVal !== ""?newData.keywordVal:newData.keywordDescription?newData.keywordDescription:"",
    //         inputVal:Array.isArray(newData.inputVal)?newData.inputVal:[newData.inputVal]
    //     }
    //     let testCaseUpdate = screenLavelTestSteps.find((screen) => screen.name === rowExpandedName.name);
    //     let updatedTestCases = [...testCaseUpdate.testCases];
    //     updatedTestCases[index] = updateNewData;

    //     // Update the keywordDescription based on newData
    //     if(updatedTestCases[index].keywordVal !== ""){
    //         if (updatedTestCases[index].hasOwnProperty("keywordDescription")) {
    //             updatedTestCases[index].keywordDescription = keywordList[getKeywords(updateNewData.custname).obType][updateNewData.keywordVal].description;
    //         }else{
    //             updatedTestCases[index] = {
    //                 ...updatedTestCases[index],
    //                 keywordDescription: keywordList[getKeywords(updateNewData.custname).obType][updateNewData.keywordVal].description,
    //                 keywordTooltip:  keywordList[getKeywords(updateNewData.custname).obType][updateNewData.keywordVal].tooltip       
    //             }
    //         };
    //     }
    //     let updatedScreenLevelTestSteps = screenLavelTestSteps.map((screen) => {
    //     if (screen.name === rowExpandedName.name) {
    //         return { ...screen, testCases: updatedTestCases };
    //     }
    //     return screen;
    //     });
    //     setID(index);
    //     setScreenLevelTastSteps(updatedScreenLevelTestSteps);
    //     setFocused(false);
    // };
        
    const deleteProduct = () => {
        let findData = screenLavelTestSteps.find(screen => screen.name === rowExpandedName.name);

        if (findData) {
        let testcases = findData.testCases.filter(objFromA => {
            return selectedOptions === objFromA.stepNo
        });
        let updatedScreenLavelTestSteps = screenLavelTestSteps.map(screen => {
            if (screen.name === rowExpandedName.name) {
            return { ...screen, testCases:  testcases.length === 0 ? [emptyRowData] : testcases };
            } else {
            return screen;
            }
        });
        setScreenLevelTastSteps(updatedScreenLavelTestSteps);
        }
        setDeleteTestDialog(false);
        setTestCase(emptyRowData);
        // setSelectedTestCases(null)
        setSelectedOptions(null)
        toast.current.show({severity:'success', summary:'Success',detail:'success full deleted test steps', life:3000});
    };
        const hideDeleteProductDialog = () => {
            setDeleteTestDialog(false);
        };
        
        const deleteProductDialogFooter = (
            <React.Fragment>
                <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProductDialog} />
                <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteProduct} />
            </React.Fragment>
        );
        // const reorderTestCases=(e)=>{
        //     let oldData = [...screenLavelTestSteps];
        //     let findData = screenLavelTestSteps.find((screen) => screen.name === rowExpandedName.name);
        //     const reorderedTestcase = e.value;
        //     const newReorderedTestCases = reorderedTestcase.map((testcase, idx) => {
        //     return { ...testcase, stepNo: idx + 1 };
        //     });
        //     findData.testCases = newReorderedTestCases;
        //     let index = screenLavelTestSteps.findIndex((screen) => screen.name === rowExpandedName.name);
        //     oldData.splice(index, 1, findData);
        //     setScreenLevelTastSteps(oldData);
        // }

    const DependentTestCaseDialogHideHandler = () => {
        setVisibleDependentTestCaseDialog(false);
        setDependencyTestCaseFlag(false);
        setTestCases(null);
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
        // toast.current.show({ severity: 'info', summary: 'Product Expanded', detail: event.data.name, life: 3000 });
    };

    const onRowCollapse = (event) => {
        setRowExpandedName({});
        // toast.current.show({ severity: 'success', summary: 'Product Collapsed', detail: event.data.name, life: 3000 });
    };
    const editRow = () => {
        let check = [...stepSelect.check];
        let highlight = [...stepSelect.highlight]
        let focus = [];
        runClickAway = false;
        if (check.length === 0 && highlight.length === 0) toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_SELECT_STEP_DEL.CONTENT,life:1000});
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
        if (selectedRows.length === 0) toast.current.show({severity:'warn',summary:'Warning',detail:MSG.DESIGN.WARN_SELECT_STEP_COPY.CONTENT,life:1000});
        else{
            let sortedSteps = selectedRows.map(step=>parseInt(step)).sort((a,b)=>a-b)
            for (let idx of sortedSteps) {
                if (!testCaseData[idx].custname) {
                    if (selectedRows.length === 1) toast.current.show({severity:'error',summary:'Error', detail: MSG.DESIGN.ERR_EMPTY_TC_COPY.CONTENT,life:1000});
                    else toast.current.show({severity:'error',summary:'Error', detail: MSG.DESIGN.ERR_INVALID_OBJ_REF.CONTENT,life:1000});
                    copyErrorFlag = true;
                    break
                } 
                else{
                    let testCase = Object.assign({}, testCaseData[idx])
                    copyTestCases.push(testCase);
                }
            }
            
            if (!copyErrorFlag) {
                copyContent = {'appType': props.appType, 'testCaseId': rowExpandedName.id, 'testCases': copyTestCases};
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
            toast.current.show({severity:'warn',summary:'Warning',detail:MSG.DESIGN.WARN_NO_TC_PASTE.CONTENT,life:1000});
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
                // setMsg(MSG.DESIGN.WARN_DIFF_PROJTYPE);
                toast.current.show({severity:'warn',summary:'Warning',detail:MSG.DESIGN.WARN_DIFF_PROJTYPE.CONTENT,life:1000});
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
        if (highlighted.length === 0 && selectedIndexes.length === 0) toast.current.show({severity:'warn', summary:'Warning', details:MSG.DESIGN.WARN_SELECT_STEP_SKIP.CONTENT, life:1000});
        else if (selectedIndexes.length === 1 && !testCases[selectedIndexes[0]].custname) toast.current.show({severity:'warn', summary:'Warning', details:MSG.DESIGN.WARN_EMP_STEP_COMMENT.CONTENT, life:1000});
        else if (highlighted.length === 1 && !testCases[highlighted[0]].custname) toast.current.show({severity:'warn', summary:'Warning', details:MSG.DESIGN.WARN_EMP_STEP_COMMENT.CONTENT, life:1000});
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
            setScreenLevelTastSteps(updatedScreenLevelTestSteps)
            // setTestCaseData(testCases);
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
    const tableActionBtnGroup = [
        // {'title': 'Add Test Step', 'img': 'static/imgs/ic-jq-addstep.png', 'alt': 'Add Steps',onClick: ()=>addRow() },
        // {'title': 'Edit Test Step', 'img': 'static/imgs/ic-jq-editstep.png', 'alt': 'Edit Steps',onClick:  ()=>editRow() },
        // {'title': 'Select Test Step(s)', 'img': 'static/imgs/ic-selmulti.png', 'alt': 'Select Steps', onClick: ()=>selectMultiple()},
        // {'title': 'Drag & Drop Test Step', 'img': 'static/imgs/ic-jq-dragstep.png', 'alt': 'Drag Steps',onClick:  ()=>toggleDrag() },
        // {'title': 'Copy Test Step', 'img': 'static/imgs/ic-jq-copystep.png', 'alt': 'Copy Steps', onClick:  ()=>copySteps()},
        // {'title': 'Paste Test Step', 'img': 'static/imgs/ic-jq-pastestep.png', 'alt': 'Paste Steps', onClick:  ()=>onPasteSteps()},
        // {'title': 'Skip Test Step', 'img': 'static/imgs/skip-test-step.png', 'alt': 'Comment Steps',  onClick:  ()=>commentRows() }
    ]
    const deleteTestcase = () => {
        const updateData = screenLavelTestSteps.find(item=>item.id === rowExpandedName.id)
        let testCases = [...updateData.testCases]
        if (testCases.length === 1 && !testCases[0].custname) toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_DELETE.CONTENT,life:1000});
        else if (stepSelect.check.length <= 0) toast.current.show({severity:'warn', summary:'Warning', detail:MSG.DESIGN.WARN_SELECT_STEP.CONTENT,life:1000});
        else if (reusedTC) setShowConfirmPop({'title': 'Delete Test Step', 'content': 'Testcase has been reused. Are you sure you want to delete?', 'onClick': ()=>{setShowConfirmPop(false);onDeleteTestStep()}});
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
        setScreenLevelTastSteps(updatedScreenLevelTestSteps)
        // setTestCaseData(testCases);
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
                if (i === rowIdx) {
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
        setScreenLevelTastSteps(updatedScreenLevelTestSteps)
        // setTestCaseData(testCases);
        setShowPS(false);
        setStepSelect({edit: false, check: [], highlight: toFocus});
        headerCheckRef.current.indeterminate = false;
        setHeaderCheck(false);
        setChanged(true);
    }
    // const ConfPasteStep = () => (
    //     <Dialog visible={showConfPaste} header="Paste Test Step" onHide={setShowConfPaste(false)} footer={footerPasteStep}>
    //         <div>Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?</div>
    //     </Dialog>
    // );
    // const footerPasteStep = () =>(
    //     <>
    //         <Button onClick={()=>{setShowConfPaste(false);setShowPS(true);}} label='Yes'/>
    //         <Button onClick={()=>setShowConfPaste(false)} label='No'/>
    //     </>
    // )
    const fetchSelectRecipientsData = async () => {
        let checkAddUsers = document.getElementById("dc__checkbox").checked
        if(!checkAddUsers) resetData()
        else {
            var userOptions = [];
            let data = await getUserDetails("user");
            if(data.error){ toast.current.show({severity:'error', summary:'Error', detail:data.error, life:1000});return;}
            for(var i=0; i<data.length; i++) if(data[i][3] !== "Admin") userOptions.push({_id:data[i][1],name:data[i][0]}); 
            setAllUsers(userOptions.sort()); 
            data = await getNotificationGroups({'groupids':[],'groupnames':[]});
            if(data.error){
                if(data.val === 'empty'){
                    toast.current.show({severity:'error', summary:'Error', detail:data.error, life:1000});
                    data = {};
                } else{  toast.current.show({severity:'error', summary:'Error', detail:data.error, life:1000}); return true; }
            }
            setGroupList(data.sort())
        }
    }
    const checkAddUsers = () => {
        if(document.getElementById("dc__checkbox") === null) return true
        let checked = document.getElementById("dc__checkbox").checked
        return !checked
    }
    const ConfirmPopup = () => (
        <Dialog visible={showPopup} header={showPopup.title} onHide={()=>{setShow(false);resetData()}}>
            <div>
                <span>Are you sure you want to {showPopup.content} the task ?</span>
                <p className="dc__checkbox-addRecp" >
                    <input  id="dc__checkbox" onChange={()=>{fetchSelectRecipientsData()}} type="checkbox" title="Notify Additional Users" className="checkAddUsers"/>
                    <span >Notify Additional Users</span>
                </p>
                <div className='dc__select-recpients'>
                    <div>
                        <span className="leftControl" title="Token Name">Select Recipients</span>
                        <SelectRecipients disabled={checkAddUsers()} recipients={recipients} setRecipients={setRecipients} groupList={groupList} allUsers={allUsers} />
                    </div>
                </div>
            </div>
        </Dialog>
    )
    const selectSteps = stepList => {
        stepList.push(...stepSelect.check)
        let newChecks = Array.from(new Set(stepList))
        setStepSelect({edit: false, check: newChecks, highlight: []});
        headerCheckRef.current.indeterminate = newChecks.length!==0 && newChecks.length !== testCaseData.length;
        setShowSM(false);
    }


    const showRemarkDialog = (rowIdx) => {
        setStepSelect(oldState => ({ ...oldState, highlight: []}));
        setShowRemarkDlg(String(rowIdx));
    }

    const showDetailDialog = (rowIdx) => {
        setStepSelect(oldState => ({ ...oldState, highlight: []}));
        setShowDetailDlg(String(rowIdx));
        setIdx(true)
    }

    const updateChecklist = (RowIdx, click, msg) => {
        let check = [...stepSelect.check]
        setSelectedOptions(RowIdx)
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
        setStepSelect({edit: false, check: check, highlight: focusIdx});
        headerCheckRef.current.indeterminate = check.length!==0 && check.length !== testCaseData.length;
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
    const rowExpansionTemplate = (data) => {
        return (
            <div className="p-1 dataTableChild">
                    {/* <DataTable className='datatable__col'
                        value={data.testCases.length>0?data.testCases:[]}
                        selectionMode="checkbox" selection={selectedTestCases}
                        onSelectionChange={(e) => setSelectedTestCases(e.value)}  
                        emptyMessage={newtestcase.length === 0?emptyMessage:null} onRowEditComplete={onRowEditComplete}
                        rowReorder editMode="row" reorderableRows onRowReorder={(e) => reorderTestCases(e)} resizableColumns showGridlines size='small' >
                            <Column style={{ width: '3em' ,textAlign: 'center', paddingLeft:'0.5rem' }} rowReorder />
                            <Column selectionMode="multiple" style={{ width: '3em', paddingLeft:'0.5rem' }} />
                            <Column field="custname" header="Element Name" bodyStyle={{maxWidth:'10rem',textOverflow: 'ellipsis',textAlign: 'left',paddingLeft: '0.5rem', paddinfRight:'0.5rem'}} editor={(options) => elementEditor(options)} ></Column>
                            <Column field="keywordDescription" tooltip="keywordTooltip" header="Operation" style={{paddingLeft:'0.5rem'}} editor={(options) => keywordEditor(options)}  ></Column>
                            <Column field="inputVal" header="Input" bodyStyle={{maxWidth:'10rem', textOverflow:'ellipsis',textAlign: 'left',paddingLeft: '0.5rem',paddinfRight:'0.5rem'}} editor={(options) => inputEditor(options)} ></Column>
                            <Column field="outputVal" header="Output" bodyStyle={{maxWidth:'10rem',textOverflow: 'ellipsis',textAlign: 'left',paddingLeft: '0.5rem', paddinfRight:'0.5rem'}} editor={(options) => outputEditor(options)} ></Column>
                            <Column field="remarks" header="Remarks" style={{paddingLeft:'0.5rem'}}/>
                            <Column rowEditor field="action" header="Actions"  className="action" bodyStyle={{ textAlign: 'center',paddingLeft:'0.5rem' }} ></Column>
                            <Tooltip target=".action " position="left" content="  Edit the test step."/>
                    </DataTable> */}
                    { showPopup && ConfirmPopup()}
                    { showSM && <SelectMultipleDialog data-test="d__selectMultiple" setShow={setShowSM} selectSteps={selectSteps} upperLimit={data.testCases.length} /> }
                    {/* { showPS && <PasteStepDialog setShow={setShowPS} pasteSteps={pasteSteps} upperLimit={data.testCases.length}/> } */}
                    { showRemarkDlg && <RemarkDialog remarks={data.testCases[parseInt(showRemarkDlg)].remarks} setShow={setShowRemarkDlg} onSetRowData={setRowData} idx={showRemarkDlg} firstname={userInfo.firstname} lastname={userInfo.lastname}/> }
                    { overlay && <ScreenOverlay content={overlay} /> }
                    {/* { showConfPaste && <ConfPasteStep />} */}
                    { showConfirmPop && ConfirmPopups() }
                    { showDetailDlg && <DetailsDialog TCDetails={data.testCases[showDetailDlg].addTestCaseDetailsInfo} setShow={setShowDetailDlg} show={idx} setIdx={setIdx} onSetRowData={setRowData} idx={showDetailDlg} /> }
                <div className="d__table">
                <div className="d__table_header">
                    <span className="step_col d__step_head" ></span>
                    <span className="sel_col d__sel_head"><input className="sel_obj" type="checkbox" checked={headerCheck} onChange={onCheckAll} ref={headerCheckRef} /></span>
                    <span className="objname_col d__obj_head" >Element Name</span>
                    <span className="keyword_col d__key_head" >Keywords</span>
                    <span className="input_col d__inp_head" >Input</span>
                    <span className="output_col d__out_head" >Output</span>
                    {/* <span className="remark_col d__rem_head" >Remarks</span> */}
                    <span className="details_col d__det_head" >Details</span>
                </div>
                <div style={{height: '66vh' }}>
                {data.testCases.length>0 && <div className="d__table_contents"  >
                <div className="ab">
                    <div className="min">
                        <div className="con" id="d__tcListId">
                            <div style={{overflowY:'auto'}}>
                            <ClickAwayListener onClickAway={()=>{ runClickAway ? setStepSelect(oldState => ({ ...oldState, highlight: []})) : runClickAway=true}} style={{height: "100%"}}>
                            <ReactSortable filter=".sel_obj" disabled={!draggable} key={draggable.toString()} list={(data && data.testCases) ? data.testCases.map(x => ({ ...x, chosen: true })) : []} setList={setTestCaseData} style={{overflow:"hidden"}} animation={200} ghostClass="d__ghost_row" onEnd={onDrop}>
                                {
                                data.testCases.map((item, i) => <TableRow data-test="d__tc_row" draggable={draggable}
                                    key={i} idx={i} objList={objNameList} testCase={item} edit={edit} 
                                    getKeywords={getKeywords} getRowPlaceholders={getRowPlaceholders} stepSelect={stepSelect}
                                    updateChecklist={updateChecklist} setStepSelect={setStepSelect} editRow={editRow}
                                    setRowData={setRowData} showRemarkDialog={showRemarkDialog} showDetailDialog={showDetailDialog}
                                    rowChange={rowChange} keywordData={keywordList} setDeleteTestDialog={setDeleteTestDialog}
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
    return (
        <>
        {/* <Toast ref={toast} position="bottom-center" /> */}
        {overlay && <ScreenOverlay content={overlay} />}
        <Toast ref={toast} position="bottom-center" baseZIndex={1000} />
            <Dialog className='design_dialog_box' header={headerTemplate} position='right' visible={props.visibleDesignStep} style={{ width: '73vw', color: 'grey', height: '95vh', margin: '0px' }} onHide={() => props.setVisibleDesignStep(false)}>
                <div className='toggle__tab'>
                    <DataTable value={screenLavelTestSteps.length>0?screenLavelTestSteps:[]} expandedRows={expandedRows} onRowToggle={(e) => rowTog(e)}
                            onRowExpand={onRowExpand} onRowCollapse={onRowCollapse} selectionMode="single" selection={selectedTestCase}
                            onSelectionChange={e => { setSelectedTestCase({name:e.value.name,id:e.value.id})}} rowExpansionTemplate={rowExpansionTemplate}
                            dataKey="id" tableStyle={{ minWidth: '60rem' }}>
                        <Column expander={allowExpansion} style={{ width: '5rem',background: 'white',paddingLeft:'0.5rem' }} />
                        <Column field="name" style={{background: 'white',paddingLeft:'0.5rem' }}/>
                        <Column body={bodyHeader} style={{ background: 'white',paddingLeft:'0.5rem' }}/>
                    </DataTable>
                     {/* <Accordion activeIndex={0}>
                     {screenLavelTestSteps.map((data,i)=><AccordionTab header={data.name}>
                        <div className="d__table">
                            <div className="d__table_header">
                                <span className="step_col d__step_head" ></span>
                                <span className="sel_col d__sel_head"><input className="sel_obj" type="checkbox" checked={headerCheck} onChange={onCheckAll} ref={headerCheckRef} /></span>
                                <span className="objname_col d__obj_head" >Element Name</span>
                                <span className="keyword_col d__key_head" >Keywords</span>
                                <span className="input_col d__inp_head" >Input</span>
                                <span className="output_col d__out_head" >Output</span>
                                {/* <span className="remark_col d__rem_head" >Remarks</span> */}
                                {/* <span className="details_col d__det_head" >Details</span>
                            </div>
                            <div style={{height: '66vh' }}>
                            {data.testCases.length>0 && <div className="d__table_contents"  >
                            <div className="ab">
                                <div className="min">
                                    <div className="con" id="d__tcListId">
                                        <ClickAwayListener onClickAway={()=>{ runClickAway ? setStepSelect(oldState => ({ ...oldState, highlight: []})) : runClickAway=true}} style={{height: "100%"}}>
                                        <ReactSortable filter=".sel_obj" disabled={!draggable} key={draggable.toString()} list={(data && data.testCases) ? data.testCases.map(x => ({ ...x, chosen: true })) : []} setList={setTestCaseData} style={{overflow:"hidden"}} animation={200} ghostClass="d__ghost_row" onEnd={onDrop}>
                                            {
                                            data.testCases.map((item, i) => <TableRow data-test="d__tc_row" draggable={draggable}
                                                key={i} idx={i} objList={objNameList} testCase={item} edit={edit} 
                                                getKeywords={getKeywords} getRowPlaceholders={getRowPlaceholders} stepSelect={stepSelect}
                                                updateChecklist={updateChecklist} setStepSelect={setStepSelect} editRow={editRow}
                                                setRowData={setRowData} showRemarkDialog={showRemarkDialog} showDetailDialog={showDetailDialog}
                                                rowChange={rowChange} keywordData={keywordList} setDeleteTestDialog={setDeleteTestDialog}
                                                />)
                                            } 
                                        </ReactSortable>
                                        </ClickAwayListener>
                                    </div>
                                </div>
                            </div>
                            </div>}
                            </div>
                            </div>
                        </AccordionTab>)}
                    </Accordion> */}
                </div>
            </Dialog>

            <Dialog className="debug__object__modal" header={props.fetchingDetails["parent"]["name"]} style={{ height: "31.06rem", width: "47.06rem" }} visible={visibleDependentTestCaseDialog} onHide={DependentTestCaseDialogHideHandler} footer={footerContent}>
                <div className='debug__btn'>
                    <div className={"debug__object"}>
                        <span className='debug__opt'>
                            <p className='debug__otp__text'>Choose Browsers</p>
                        </span>
                        <span className='browser__col'>
                            {/* <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/ic-explorer.png' alt='explorer'/>Internet Explorer {selectedSpan === 1 && <img className='sel__tick' src='static/imgs/ic-tick.png' alt='tick' />}</span> */}
                            <span onClick={() => handleSpanClick("1")} className={selectedSpan === "1" ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/chrome.png' alt='chrome' />Google Chrome {selectedSpan === "1" && <img className='sel__tick' src='static/imgs/ic-tick.png' alt='tick' />}</span>
                            <span onClick={() => handleSpanClick("2")} className={selectedSpan === "2" ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png' alt='firefox' />Mozilla Firefox {selectedSpan === "2" && <img className='sel__tick' src='static/imgs/ic-tick.png' alt='tick' />}</span>
                            <span onClick={() => handleSpanClick("8")} className={selectedSpan === "8" ? 'browser__col__selected' : 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png' alt='edge' />Microsoft Edge {selectedSpan === "8" && <img className='sel__tick' src='static/imgs/ic-tick.png' alt='tick' />}</span>
                        </span>
                    </div>
                    <div>
                        <div className='design__fst__card'>
                        <span className='debug__opt'>
                            <span className='AD__test'>Add Dependent Test Step (Optional)</span>
                            </span>
                            <div className='card__testcases'>
                            <div className='add__test__case_check'>
                                {testcaseList.map(testCase => (
                                    <div className='test__div' key={testCase.testCaseName}>
                                        <Checkbox className='check__testcase'
                                            inputId={testCase.testCaseName}
                                            value={testCase.testCaseName}
                                            onChange={handleCheckboxChangeAddDependant}
                                            checked={selectedTestCases.includes(testCase.testCaseName)}
                                            disabled={testCase.disableAndBlock}
                                        />
                                        <label className='label__testcase' htmlFor={testCase.testCaseName}>{testCase.testCaseName}</label>
                                    </div>
                                    
                                ))}
                            </div>
                            </div>
                        </div>
                    </div>
                    {/* <div>
                        <div className='design__fst__card'>
                            <span>Add Dependent Test Case (Optional)</span>
                            <div className='add__test__case'>
                                <Dropdown className='add__depend__test' value={testCases} onChange={(e) => setTestCases(e.value)} options={testcaseList} optionLabel="testCaseName"
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
                            <div>
                                {addedTestCase.map((value, index) => (
                                    <div key={index}>
                                        <p className={addedTestCase.length > 0 ? 'text__added__step' : ''}>{value.testCaseName}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div> */}
                </div>
            </Dialog>
            <Dialog visible={deleteTestDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {newtestcase && (
                        <span>
                            Are you sure you want to delete?
                        </span>
                    )}
                </div>
            </Dialog>
        </>
    )
}
export default DesignModal;