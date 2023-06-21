import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, getNotificationGroups } from '../api';
import { Messages as MSG,ScreenOverlay, setMsg,RedirectPage} from "../../global";
import { getObjNameList, getKeywordList } from "../components/UtilFunctions";
import * as DesignApi from "../api";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import '../styles/DesignTestStep.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TestCases, copiedTestCases, SaveEnable, Modified } from '../designSlice';
import { InputText } from 'primereact/inputtext';


const DesignModal = (props) => {
    const toast = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.landing.userinfo);
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
    const [newtestcase, setnewtestcase] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [testCaseIDsList, setTestCaseIDsList] = useState([]);
    const [testcaseList, setTestcaseList] = useState([]);
    const [dependencyTestCaseFlag, setDependencyTestCaseFlag] = useState(false);
    const [deleteTestDialog, setDeleteTestDialog] = useState(false);
    const [testCase, setTestCase] = useState(null)
    const[selectedTestCases,setSelectedTestCases]=useState(null);
    const [idx, setIdx] = useState(0);
    let runClickAway = true;
    const emptyRowData = {
        "stepNo": '',
        "objectName": ' ',
        "custname": '',
        "keywordVal": '',
        "inputVal": [""],
        "outputVal": '',
        "remarks": "",
        "url": ' ',
        "appType": props.appType,
        "addDetails": "",
        "cord": '',
        "addTestCaseDetails": "",
        "addTestCaseDetailsInfo": ""
    };
    const parentScreen = props.fetchingDetails["parent"]["children"];
    useEffect(()=>{
        const parentScreenId = () =>{
            for (var i = 0; i < parentScreen.length; i++) {
                if (props.fetchingDetails["name"] === parentScreen[i].name) {
                    setIdx(i);
                    return setShow({
                        name: parentScreen[i].name,
                        id: parentScreen[i]._id,
                        parentName:props.fetchingDetails["parent"]['name'],
                        parent_id:props.fetchingDetails["parent"]['_id'], 
                        projectId:parentScreen[i].projectID, 
                    });
                }
            }
            return 0;
        }
        parentScreenId();
    },[parentScreen, props.fetchingDetails,idx])
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
        if (props.imported) {
            fetchTestCases()
            .then(data=>{
                if (data==="success") 
                    setMsg(MSG.DESIGN.SUCC_TC_IMPORT);
                else 
                    setMsg(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                props.setImported(false)
                setStepSelect({edit: false, check: [], highlight: []});
                setChanged(false);
                // headerCheckRef.current.indeterminate = false;
            })
            .catch(error=>console.error("Error: Fetch TestCase Failed ::::", error));
        }
        //eslint-disable-next-line
    }, [props.imported]);

    useEffect(() => {
        if (Object.keys(userInfo).length) {
            //  && Object.keys(props.current_task).length) {
            fetchTestCases()
                .then(data => {
                    data !== "success" &&
                        setMsg(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                    //     setEdit(false);
                    // setStepSelect({ edit: false, check: [], highlight: [] });
                    // // headerCheckRef.current.indeterminate = false;
                    // setDraggable(false);
                    // setChanged(false);
                    // setHeaderCheck(false);
                    // setIsUnderReview(props.current_task.status === "underReview")
                })
                .catch(error => console.error("Error: Fetch TestCase Failed ::::", error));
        }
        //eslint-disable-next-line
    }, [userInfo, props.current_task]);

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

    const fetchTestCases = () => {
        return new Promise((resolve, reject) => {
            // let { testCaseName, versionnumber, screenName, screenId, projectId, testCaseId, appType } = props.current_task;
            let deleteObjectFlag = false;

            setOverlay("Loading...");

            DesignApi.readTestCase_ICE(userInfo, props.fetchingDetails["_id"], props.fetchingDetails["name"], 0 /** versionNumber */, props.fetchingDetails["parent"]["name"])
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

                    DesignApi.getScrapeDataScreenLevel_ICE(props.appType, props.fetchingDetails.parent['_id'], props.fetchingDetails.projectID, props.fetchingDetails["_id"])
                        .then(scriptData => {
                            if (scriptData === "Invalid Session") return;

                            setTestScriptData(scriptData.view);
                            // props.setMirror(scriptData.mirror);

                            DesignApi.getKeywordDetails_ICE(props.appType)
                                .then(keywordData => {
                                    if (keywordData === "Invalid Session") return;

                                    setKeywordList(keywordData);
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
                                                testcase[i].stepNo = (i + 1).toString();
                                                let temp = testcase[i].keywordVal
                                                testcase[i].keywordVal = testcase[i].keywordVal[0].toLowerCase() + testcase[i].keywordVal.slice(1,)
                                                testcaseArray.push(testcase[i]);
                                            }
                                        }
                                        setOverlay("");
                                    }
                                    setDraggable(false);
                                    setTestCaseData(testcaseArray);
                                    setnewtestcase(testcaseArray);
                                    console.log(testcaseArray)
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
                                    setMsg("Error getObjectType method! \r\n ", error);
                                    setMsg(MSG.DESIGN.ERR_FETCH_TC);
                                    reject("fail");
                                });
                    })
                    .catch(error => {
                        setOverlay("");
                        setTestCaseData([]);
                        setTestScriptData(null);
                        setKeywordList(null);
                        setObjNameList(null);
                        setMsg(MSG.DESIGN.ERR_FETCH_TC);
                        setMsg("Error getObjectType method! \r\n " + (error));
                        reject("fail");
                    });
            })
            .catch(error => {
                setOverlay("");
                setTestCaseData([]);
                setTestScriptData(null);
                setKeywordList(null);
                setObjNameList(null);
                setMsg(MSG.DESIGN.ERR_FETCH_TC);
                setMsg("Error getTestScriptData method! \r\n " + (error));
                reject("fail");
            });
        });
    };


    const saveTestCases = (e, confirmed) => {
        if (userInfo.role !== "Viewer") {
            if (reusedTC && !confirmed) {
                props.setShowConfirmPop({ 'title': 'Save Testcase', 'content': 'Testcase has been reused. Are you sure you want to save?', 'onClick': () => { props.setShowConfirmPop(false); saveTestCases(null, true) } });
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
                    // let step = i + 1
                    // testCases[i].stepNo = step;

                    if (!testCases[i].custname || !testCases[i].keywordVal) {
                        let col = "Object Name";
                        if (!testCases[i].keywordVal) col = "keyword";
                        // setMsg(MSG.CUSTOM(`Please select ${col} Name a`));
                        errorFlag = true;
                        break;
                    } else {
                        // testCases[i].custname = testCases[i].custname.trim();
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
                    
                    // if (!testCases[i].cord) testCases[i].cord = "";

                }

                if (!errorFlag) {
                    if(props.fetchingDetails['name'] === showPopup.name){
                        DesignApi.updateTestCase_ICE(props.fetchingDetails['_id'], props.fetchingDetails['name'], testCases, userInfo, 0 /**versionnumber*/, import_status, pastedTC)
                        .then(data => {
                            if (data === "Invalid Session") return;
                            if (data === "success") {
                                if (props.appType.toLowerCase() === "web" && Object.keys(modified).length !== 0) {
                                    let scrape_data = {};
                                    // let { appType, projectId, testCaseId, versionnumber } = props.current_task;

                                    DesignApi.getScrapeDataScreenLevel_ICE(props.appType, props.fetchingDetails['parent']['_id'], props.fetchingDetails.projectID, props.fetchingDetails['_id'])
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
                                                'testCaseId': props.fetchingDetails["_id"],
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
                                                        ? setMsg(MSG.DESIGN.SUCC_TC_SAVE)
                                                        : setMsg(MSG.DESIGN.WARN_DELETED_TC_FOUND)
                                                    })
                                                    .catch(error => {
                                                        setMsg(MSG.DESIGN.ERR_FETCH_TC);
                                                        setMsg("Error: Fetch TestCase Failed ::::", error)
                                                    });
                                                } else setMsg(MSG.DESIGN.ERR_SAVE_TC);
                                            })
                                            .catch(error => {
                                                setMsg(MSG.DESIGN.ERR_SAVE_TC);
                                                setMsg("Error::::", error)
                                            })
                                })
                                .catch(error=> {
                                    setMsg(MSG.DESIGN.ERR_SAVE_TC);
                                    setMsg("Error:::::", error)
                                });
                            }
                            else{
                                fetchTestCases()
                                .then(data=>{
                                    setChanged(false);
                                    data === "success" 
                                    ? setMsg(MSG.DESIGN.SUCC_TC_SAVE) 
                                    : setMsg(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                                })
                                .catch(error=>{
                                    setMsg(MSG.DESIGN.ERR_FETCH_TC);
                                    setMsg("Error: Fetch TestCase Failed ::::", error)
                                });
                            }
                        } else setMsg(MSG.DESIGN.ERR_SAVE_TC);
                    })
                    .catch(error => { 
                        setMsg(MSG.DESIGN.ERR_SAVE_TC);
                        setMsg("Error::::", error);
                    });
                    errorFlag = false;
                    }
                }
            } else setMsg(MSG.DESIGN.ERR_UNDEFINED_SID_TID);
        }
        setStepSelect({edit: false, check: [], highlight: []});
        // headerCheckRef.current.indeterminate = false;
        setHeaderCheck(false);
        setDebugEnable(false);
    }

    const addRow = () => {
        if(props.fetchingDetails["name"] === showPopup.name){
            let oldTestCases = [...newtestcase]
            let emptyRowDataIndex={...emptyRowData,stepNo:String(oldTestCases.length+1)}
            let emptyAddedRow=[...oldTestCases,emptyRowDataIndex]
            setnewtestcase(emptyAddedRow)
        }
    }

    const getKeywords = useCallback(objectName => getKeywordList(objectName, keywordList, props.appType, testScriptData), [keywordList, props.appType, testScriptData]);

    const getRowPlaceholders = useCallback((obType, keywordName) => keywordList[obType][keywordName], [keywordList])

    //Debug function

    const debugTestCases = selectedBrowserType => {
        setVisibleDependentTestCaseDialog(false);
        let testcaseID = [];
        let browserType = [];

        if (props.appType !== "MobileWeb" && props.appType !== "Mainframe") browserType.push(selectedBrowserType);

        // globalSelectedBrowserType = selectedBrowserType;5

        if (dependencyTestCaseFlag) testcaseID = testCaseIDsList;
        else testcaseID.push(props.fetchingDetails['_id']);
        setOverlay('Debug in Progress. Please Wait...');
        // ResetSession.start();
        DesignApi.debugTestCase_ICE(browserType, testcaseID, userInfo, props.appType)
            .then(data => {
                setOverlay("");
                // ResetSession.end();
                if (data === "Invalid Session") return ;
                else if (data === "unavailableLocalServer")  setMsg(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER)
                else if (data === "success") setMsg(MSG.DESIGN.SUCC_DEBUG)
                else if (data === "fail") setMsg(MSG.DESIGN.ERR_DEBUG)
                else if (data === "Terminate") setMsg(MSG.DESIGN.WARN_DEBUG_TERMINATE)
                else if (data === "browserUnavailable") setMsg(MSG.DESIGN.WARN_UNAVAILABLE_BROWSER)
                else if (data === "scheduleModeOn") setMsg(MSG.GENERIC.WARN_UNCHECK_SCHEDULE)
                else if (data === "ExecutionOnlyAllowed") setMsg(MSG.GENERIC.WARN_EXECUTION_ONLY)
                else if (data.status === "success"){
                    let rows={}
                    mainTestCases.forEach((testCase, index) => {
                        if (index + 1 in data) {
                            rows[testCase.custname] = data[index + 1].xpath;
                        }
                    });
                    dispatch(Modified(rows));
                    dispatch(SaveEnable(!saveEnable))
                    setMsg(MSG.DESIGN.SUCC_DEBUG);
                } else {
                    setMsg(data);
                }										
            })
            .catch(error => {
                setOverlay("");
                // ResetSession.end();
                setMsg(MSG.DESIGN.ERR_DEBUG);
                setMsg("Error while traversing while executing debugTestcase method! \r\n " + (error.data));
            });
    };

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
        const update = { ...testCases };
        const addTestcaseData = {};
        const TestIDPresent = addedTestCase.filter(item => {
            return item.testCaseID === testCases.testCaseID
        });
        // console.log("TestIDPresent", TestIDPresent);
        if (TestIDPresent.length > 0) {
            toastError("Duplicate Dependent Testcase found");
        }
        else {
            addTestcaseData["testCaseID"] = update.testCaseID;
            addTestcaseData["testCaseName"] = update.testCaseName;
            addTestcaseData["disableAndBlock"] = update.disableAndBlock;
            addTestcaseData["checked"] = true;
            setTestCaseIDsList([...testCaseIDsList, update.testCaseID])
            setAddedTestCase([...addedTestCase, addTestcaseData]);
            setDependencyTestCaseFlag(true);
            setTestCases(null);
        }
    };

    const toastError = (errMessage) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: errMessage, life: 10000 });
    }

    const headerTemplate = (
        <>
            <div>
                <h5 className='dailog_header1'>Design Test Step</h5>
                <h4 className='dailog_header2'>{props.fetchingDetails["parent"]["name"]}</h4>
                <img className="screen_btn" src="static/imgs/ic-screen-icon.png" alt='screen icon' />
                <div className='btn__grp'>
                    <Button size='small' onClick={() => { DependentTestCaseDialogHideHandler(); setVisibleDependentTestCaseDialog(true) }} label='Debug' outlined></Button>
                    <Button size='small' label='Add Test Step' onClick={()=>addRow()}></Button>
                </div>
            </div>
        </>
    );

    const footerTemplate = (
        <>
            <div className='btn__grp'>
               <Button size='small' label='Save' onClick={saveTestCases}></Button>
              {selectedTestCases &&  <Button size='small' label='Delete' onClick={()=>setDeleteTestDialog(true)}></Button>}
            </div>
        </>
    );

    const emptyMessage = (
        <div className='empty__msg1'>
            <div className='empty__msg'>
                <img className="not_captured_ele" src="static/imgs/ic-capture-notfound.png" alt="No data available" />
                <p className="not_captured_message">No Design Step yet</p>
            </div>
            <Button size='small' className="btn-design-single" label='Design Test Steps' onClick={()=>addRow()}></Button>
        </div>
    );

    const footerContent = (
        <div>
            <Button label="Cancel" size='small' onClick={() => DependentTestCaseDialogHideHandler()} className="p-button-text" />
            <Button label="Debug" size='small' onClick={() => debugTestCases('1')} autoFocus />
        </div>
    );
    
    const elementEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={objNameList}
                onChange={(e) => {options.editorCallback(e.value);setKeywordListTable(getKeywords(e.value).keywords);setKeyword(getKeywords(e.value).keywords[0])}}
                placeholder="Select a custname"
            />
        );
    };
    const keywordEditor = (options) => {
        return (
            <Dropdown
                value={keyword.length>0?keyword:options.value}
                options={keywordListTable.length>0?keywordListTable:getKeywords(options.rowData.custname).keywords}
                onChange={(e) => {options.editorCallback(e.value);setKeyword([]);}}
                placeholder="Select a keywords"
            />
        );
    };

    const inputEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    };
    const outputEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    };

    const onRowEditComplete = (e) => {
        if(props.fetchingDetails["name"] === showPopup.name){
            let testcase = [...newtestcase];
            let { newData, index } = e;
            testcase[index] = newData;
            setnewtestcase(testcase); 
        }
    };
        
    const deleteProduct = () => {
        if(props.fetchingDetails["name"] === showPopup.name){
            let testcases = newtestcase.filter(function(objFromA) {
                return !selectedTestCases.find(function(objFromB) {
                    return objFromA.stepNo === objFromB.stepNo
                
                })
            })
        
            setnewtestcase(testcases);
            setDeleteTestDialog(false);
            setTestCase(emptyRowData);
            setSelectedTestCases(null)
            setMsg(MSG.CUSTOM('success full deleted test steps'));
        }
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
        const reorderTestCases=(e)=>{
            if(props.fetchingDetails["name"] === showPopup.name){
                const reorderedTestcase=e.value
                const newReorderedTestCases=reorderedTestcase.map((testcase,idx)=>{
                    return {...testcase, [testcase.stepNo]:idx+1}
                })
                setnewtestcase(newReorderedTestCases)
            }
        }

        // const onCellEditComplete = (e) => {
        //     let { rowData, newValue, field } = e;
        //     let editedTestCases=[...newtestcase]
        //     const updatedRowData = {...rowData,  [field]: newValue };
        //     editedTestCases.splice(e.rowIndex, 1, updatedRowData);
        //     setnewtestcase(editedTestCases);
        // };
        // const cellEditor = (options) => {
        //     if (options.field === 'custname') return elementEditor(options);
        //     else if (options.field === 'keywordVal') return keywordEditor(options);
        //     else return textEditor(options);
        //   };

    const DependentTestCaseDialogHideHandler = () => {
        setVisibleDependentTestCaseDialog(false);
        setDependencyTestCaseFlag(false);
        setTestCases(null);
        setTestCaseIDsList([]);
        setAddedTestCase([]);
    }

    return (
        <>
        {overlay && <ScreenOverlay content={overlay} />}
        <Toast ref={toast} position="bottom-center" baseZIndex={1000} />
            <Dialog className='design_dialog_box' header={headerTemplate} position='right' visible={props.visibleDesignStep} style={{ width: '73vw', color: 'grey', height: '95vh', margin: '0px' }} onHide={() => props.setVisibleDesignStep(false)} footer={footerTemplate} >
                <div className='toggle__tab'>
                <Accordion multiple activeIndex={[idx]}>
                {parentScreen.map((item)=><AccordionTab header={item.name} onClick={toggleTableVisibility}>
                            <DataTable
                                value={newtestcase.length>0 ?newtestcase:[]}
                                selectionMode="checkbox" selection={selectedTestCases}
                                onSelectionChange={(e) => setSelectedTestCases(e.value)}  
                                emptyMessage={newtestcase.length === 0?emptyMessage:null} onRowEditComplete={onRowEditComplete}
                                rowReorder editMode="row" reorderableRows onRowReorder={(e) => reorderTestCases(e)} resizableColumns showGridlines size='small' >
                                <Column style={{ width: '3em' ,textAlign: 'center' }} rowReorder />
                                <Column selectionMode="multiple" style={{ width: '3em' ,textAlign: 'center' }} />
                                <Column field="custname" header="Element Name" editor={(options) => elementEditor(options)} ></Column>
                                <Column field="keywordVal" header="Keyword" editor={(options) => keywordEditor(options)}  ></Column>
                                <Column field="inputVal" header="Input" editor={(options) => inputEditor(options)} ></Column>
                                <Column field="outputVal" header="Output" editor={(options) => outputEditor(options)} ></Column>
                                <Column field="remarks" header="Remarks" />
                                <Column rowEditor field="action" header="Actions" bodyStyle={{ textAlign: 'center' }} ></Column>
                            </DataTable>
                        </AccordionTab>)}
                    </Accordion>
                </div> 
            </Dialog>

            <Dialog className="debug__object__modal" header="Design:Sign up screen 1" style={{ height: "31.06rem", width: "47.06rem" }} visible={visibleDependentTestCaseDialog} onHide={DependentTestCaseDialogHideHandler} footer={footerContent}>
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
                    </div>
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