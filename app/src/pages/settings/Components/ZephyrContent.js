import React ,{ useState, useRef, useEffect , forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import * as api from '../api';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Checkbox } from 'primereact/checkbox';
import { Tree } from 'primereact/tree';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { TabMenu } from 'primereact/tabmenu';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { InputSwitch } from "primereact/inputswitch";
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";
import { RedirectPage, Messages as MSG, setMsg } from '../../global';
import {
    resetIntergrationLogin, resetScreen, selectedProject,
    selectedIssue, selectedTCReqDetails, selectedTestCase,
    syncedTestCases, mappedPair, selectedScenarioIds,
    selectedAvoproject, showOverlay,checkedTCPhaseIds,checkedTcIds,checkedTCNames,checkedTCReqDetails,
    checkedTreeIds,checkedParentIds,checkedProjectIds,checkedReleaseIds,mappedTree, enableSaveButton
} from '../settingSlice';
import "../styles/ZephyrContent.scss";
import { Paginator } from 'primereact/paginator';


const ZephyrContent = ({ domainDetails , setToast },ref) => {
    const uploadFileRef = useRef();
    const dispatch = useDispatch();
    const mappedData = useSelector(state => state.setting.mappedPair);
    const mappedTreeList = useSelector(state => state.setting.mappedTree);
    const checkedScnIds = useSelector(state => state.setting.selectedScenarioIds);
    const selectedZphyrPhaseIds = useSelector(state=> state.setting.checkedTCPhaseIds);
    const selectedZphyrTCIds = useSelector(state=> state.setting.checkedTcIds);
    const selectedZphyrTCNames = useSelector(state=> state.setting.checkedTCNames);
    const selectedZphyrTCReqs = useSelector(state=> state.setting.checkedTCReqDetails);
    const selectedZphyrTreeIds = useSelector(state=> state.setting.checkedTreeIds);
    const selectedZphyrParentIds = useSelector(state=> state.setting.checkedParentIds);
    const selectedZphyrProjIds = useSelector(state=> state.setting.checkedProjectIds);
    const selectedZphyrReleaseIds = useSelector(state=> state.setting.checkedReleaseIds);


    const [activeIndex, setActiveIndex] = useState(0);
    const [checked, setChecked] = useState(false);
    const [checkedAvo, setCheckedAvo] = useState(false);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const [treeData, setTreeData] = useState([]);
    const [completeTreeData, setCompleteTreeData] = useState([]);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [selectedLeftNodes, setselectedLeftNodes] = useState([]);
    const [selectedImportNodes, setSelectedImportNodes] = useState([]);
    const [currentNode,setCurrentNode] = useState({});
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectetestcase, setSelectedtestcase] = useState(null);
    const dispatchAction = useDispatch();
    const [avoProjectsList, setAvoProjectsList] = useState(null);
    const [listofScenarios, setListofScenarios] = useState([]);
    const [showNote, setShowNote] = useState(false);
    const [importMap, setImportMap] = useState(false);
    const [fileData, setFileData] = useState(null);
    const [selectSheet, setSelectSheet] = useState(null);
    const [selectZephyrProject, setSelectZephyrProject] = useState(null);
    const [selectImportZephyrProject, setSelectImportZephyrProject] = useState(null);
    const [selectZephyrRelease, setSelectZephyrRelease] = useState(null);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [importselectedKeys, setImportSelectedKeys] = useState([]);

    const [selectedAvoKeys, setSelectedAvoKeys] = useState([]);
    const [error, setError] = useState('');
    const [fileUpload, setFiledUpload] = useState(undefined);
    const [sheetList, setSheetList] = useState([]);
    const dropdownRef = useRef();
    const [projectDetails , setProjectDetails]=useState([]);
    const [importProjectDetails , setImportProjectDetails]=useState([]);
    const [releaseArr, setReleaseArr] = useState([]);
    const [importReleaseArr, setImportReleaseArr] = useState([]);
    const [avoProjects , setAvoProjects]= useState(null);
    const [selectedRel, setSelectedRel] = useState("Select Release");
    const [importSelectedRel, setImportSelectedRel] = useState("Select Release");
    const [testCases, setTestCases] = useState([]);
    const [modules, setModules] = useState([]);
    const [enableBounce, setEnableBounce] = useState(false);
    const [isMutipleSelected,setMultipleSelected] = useState(false);
    const [isMutipleScn,setMultipleScn] = useState(false);
    const [viewMappedFiles, setViewMappedFiles] = useState([]);
    const [counts, setCounts] = useState({
        totalCounts: 0,
        mappedScenarios: 0,
        mappedTests: 0
    });
    const [rows, setRows] = useState([]);
    const [excelContent,setExcelContent] = useState([]);
    const [importStatus,setImportStatus] = useState(null);
    const [currentAvoPage, setCurrentAvoPage] = useState(1);
    const [indexOfFirstScenario, setIndexOfFirstScenario] = useState(0);
    const scenariosPerPage = 10;
    ////Pagination For Zephyr Projects
    const itemsPerPage = 10;
    const [currentZepPage, setCurrentZepPage] = useState(1);

    const totalPages = Math.ceil(projectDetails.length / itemsPerPage);
    const startIdx = (currentZepPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedDataZephyr = projectDetails.slice(startIdx, endIdx);
    const [saveEnable, setSaveEnable] = useState(false);

    const [data, setData] = useState([
        {
            key: "grandparent1",
            label: "Grandparent 1",
            children: [
                {
                    key: "parent1",
                    label: "Parent 1",
                    children: [
                        {
                            key: "children1",
                            label: "Children 1",
                            children: [
                                { key: "child1", label: "Child 1" },
                                { key: "child2", label: "Child 2" },
                            ],
                        }

                    ],
                },
            ],
        },
        {
            key: "grandparent2",
            label: "Grandparent 2",
            children: [
                {
                    key: "parent2",
                    label: "Parent 2",
                    children: [
                        {
                            key: "children1",
                            label: "Children 1",
                            children: [
                                { key: "child1", label: "Child 1" },
                                { key: "child2", label: "Child 2" },
                            ],
                        }

                    ],
                },
            ],
        },
    ]);

    useEffect(() => {
        setMultipleSelected(false);
        setMultipleScn(false);
        setselectedLeftNodes([]);
        dispatchAction(checkedTcIds([]));
        dispatchAction(checkedTCNames([]));
        dispatchAction(checkedTCReqDetails([]));
        dispatchAction(checkedTreeIds([]));
        dispatchAction(checkedParentIds([]));
        dispatchAction(checkedProjectIds([]));
        dispatchAction(checkedReleaseIds([]));
    },[])

    useImperativeHandle(ref, () => ({
        callSaveButton,
        callViewMappedFiles
    }));    

    const upload = () => {
        setError('')
        setFiledUpload(undefined)
        uploadFile({ uploadFileRef, setSheetList, setError, setFiledUpload, dispatch })
    }


    const handleTabChange = (index) => {
        setActiveIndex(index);
    };
    const showLogin = () => {
        dispatchAction(resetIntergrationLogin());
        dispatchAction(resetScreen());
        dispatchAction(selectedProject(''));
        dispatchAction(selectedTestCase([]));
        setAvoProjectsList([]);
        setListofScenarios([]);
        dispatchAction(selectedAvoproject(''))
    };

    const onCheckboxChange = (nodeKey) => {
        const nodeIndex = selectedNodes.indexOf(nodeKey);
        let newSelectedNodes = isMutipleSelected ? [] : [...selectedNodes];
        if (nodeIndex !== -1) {
            newSelectedNodes.splice(nodeIndex, 1);
        } else {
            newSelectedNodes.push(nodeKey);
        }
        setMultipleScn(newSelectedNodes.length > 1 ? true:false);
        setSelectedNodes(newSelectedNodes);
        dispatchAction(selectedScenarioIds(newSelectedNodes));
    }

    const TreeNodeCheckbox = (node,parentNode) => {
        if (node.data.type === 'scenario') {
            return (
                <div style={{ width: '100%' }}>
                    <Checkbox
                        checked={selectedNodes.includes(node.key)}
                        onChange={() => onCheckboxChange(node.key)}
                    />
                    <span className="scenario_label">{node.label} </span>
                    {/* {
                        node.checked && <i className="pi pi-times unmap_icon" style={{ float: 'right' }} onClick={() => handleUnSync(node)}></i>
                    } */}

                </div>)
        }
        else if (node.data.type === 'testcase') {
            return (
                <div style={{ width: '100%' }}>
                    <Checkbox
                        checked={selectedZphyrTCIds.includes(node.key)}
                        // onChange={() => onCheckboxChange(node.key)}
                    />
                    <span className="scenario_label">{node.label} </span>
                    {
                        node.checked && <i className="pi pi-times unmap_icon" style={{ float: 'right' }} onClick={() => handleUnSync(node,parentNode)}></i>
                    }
                    {/* <span>{node.label} </span> */}
                    {/* <i className="pi pi-times" style={{ float: 'right'}} ></i> */}
                </div>
            )
        }
    };

   const  handleSync = () => {
        let popupMsg = ''
        if (checkedScnIds.length === 0) {
            popupMsg = MSG.INTEGRATION.WARN_SELECT_SCENARIO.CONTENT;
        }
        else if (selectedZphyrTCIds.length === 0) {
            popupMsg = MSG.INTEGRATION.WARN_SELECT_TESTCASE.CONTENT;
        }

        if (popupMsg) setToast("info", "Info", popupMsg);
        else {
            const mappedPairObj = [...mappedData,
            {
                    projectid: selectedZphyrProjIds,			
                    releaseid: selectedZphyrReleaseIds,
                    treeid: selectedZphyrTreeIds,
                    parentid: selectedZphyrParentIds,
                    testid: selectedZphyrTCIds,
                    testname: selectedZphyrTCNames,
                    reqdetails: selectedZphyrTCReqs, 
                    scenarioId: checkedScnIds
            }
            ];
            dispatchAction(mappedPair(mappedPairObj));
            // const filterTestCase = testCaseData.filter((testCase) => testCase.id == selectedId).map(el => ({ key: el.id, label: el.summary, data: { type: 'testcase' } }))
            // // checking the current map obj is already present with any other scenario
            let multipleTestCases = [];
            if(selectedZphyrTCIds.length && selectedZphyrTCNames.length){
                selectedZphyrTCIds.forEach((id,index) => {
                    multipleTestCases.push({ key: id, label: selectedZphyrTCNames[index],cyclePhaseId:checkedTreeIds[index],
                        parentId:checkedParentIds[index],reqdetails:checkedTCReqDetails[index], checked:true, data: { type: 'testcase' } })
                })
                
            }
            const findDuplicate = completeTreeData.map((scenario) => {
                const shouldReplaceChildren = multipleTestCases.some(item => {
                    return scenario.children.some(child => child.key === item.key);
                });
            
                if (shouldReplaceChildren) {
                    return {
                        ...scenario,
                        checked:false,
                        children: []
                    };
                } else {
                    return scenario;
                }
            });
            
            // let updatedTreeData = findDuplicate.map((scenario) => scenario.key == selectedScIds[0] ? { ...scenario, checked: true, children: filterTestCase } : scenario)
            let updatedTreeData = findDuplicate.map((scenario) => {
                if (checkedScnIds && checkedScnIds.length) {
                    checkedScnIds.forEach((scnId, index) => {
                        if (scenario.key === scnId) {
                            scenario = { ...scenario, checked: true, children: multipleTestCases };
                        }
                    });
                }
                return scenario;
            });
            setTreeData(updatedTreeData.slice(indexOfFirstScenario, indexOfFirstScenario+scenariosPerPage));
            // setTreeData(updatedTreeData);
            setCompleteTreeData(updatedTreeData);
            // dispatchAction(mappedTree(updatedTreeData));
            // const updateCheckbox = testCaseData.map((item) => ({ ...item, checked: false }));
            // setTestCaseData(updateCheckbox);
            // dispatchAction(syncedTestCases(selected));
            // setSelectedNodes([]);
            // dispatchAction(selectedScenarioIds([]));
        }
        // setDisabled(false);
        setSaveEnable(true);
        dispatch(enableSaveButton(true))
    }

    const handleUnSync = async (node,parentNode) => {
        let unSyncObj = [];
        if (Object.keys(node).length) {
            let findMappedId = rows.filter((item) => item.scenarioId.includes(parentNode.props.parent.key)).filter((item) => item.testid.includes(node.key))
            // let findMappedId = findScnArray.filter((item) => item.testid.includes(node.key))
            if (findMappedId && findMappedId.length) {
                unSyncObj.push({
                    'mapid': findMappedId[0].mapId,
                    'testCaseNames': [].concat(node.label),
                    'testid': [].concat(node.key)
                })
                let args = Object.values(unSyncObj);
                args['screenType'] = 'Zephyr'
                const saveUnsync = await api.saveUnsyncDetails(args);
                if (saveUnsync.error){  
                    setToast("error", "Error", 'Failed to Unsync'); 
                }
				else if(saveUnsync === "unavailableLocalServer"){
                        setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
                        return
                    }
				else if(saveUnsync === "scheduleModeOn"){
                    setToast("info", "Info", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
                    return
                }
				else if(saveUnsync === "fail"){
                    setToast("error", "Error", MSG.INTEGRATION.ERR_SAVE.CONTENT);
                    return
                }
				else if(saveUnsync == "success"){
                    callViewMappedFiles()
                    setToast("success", "Success", 'Unsynced');
                }

            }
            const removeTestCase = completeTreeData.map((scenario) => {
                if (scenario.children && scenario.children.length > 0) {
                    const filteredChildren = scenario.children.filter((child) => child.key !== node.key);
                    return {
                        ...scenario,
                        children: filteredChildren
                    };
                }
                return scenario;
            });
            onLeftCheckboxChange(node);
           

            // let unsyncMap = treeData.map((item) => item.key == node.key ? { ...item, checked: false, children: [] } : item);
            // console.log(unsyncMap, 'its unsyncMap');
            let unsyncMappedData = mappedData.filter((item) => item.scenarioId !== node.key);
            setTreeData(removeTestCase.slice(indexOfFirstScenario, indexOfFirstScenario+scenariosPerPage));
            setCompleteTreeData(removeTestCase);
            // setCompleteTreeData(unsyncMappedData);
            // setTreeData(unsyncMap);
            dispatchAction(mappedTree(removeTestCase));
            dispatchAction(mappedPair(unsyncMappedData));
        }
    }

    const callSaveButton =async()=>{
        if (mappedData && mappedData.length) {
        const response = await api.saveZephyrDetails_ICE(mappedData);
        if (response.error) {
            setToast("error", "Error", response.error.CONTENT);
        }
        else if (response === "unavailableLocalServer")
            setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
        else if (response === "scheduleModeOn")
            setToast("warn", "Warning", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
        else if (response === "success") {
            callViewMappedFiles('');
            setToast("success", "Success", 'Synced details saved successfully');
        }
    }
    else{
        setToast("info", "Info", 'Please sync atleast one map');
    }
    }

    const callViewMappedFiles=async(saveFlag)=>{
        try{
            const response = await api.viewZephyrMappedList_ICE('6440e7b258c24227f829f2a4');
            if (response.error) {
                setToast('error', 'Error', response.error);
            }
            else if (response === 'fail') {
                setToast('error', 'Error', 'failed to fetch mapped details');
            }
            else if (response.length){
                setViewMappedFiles(response);
                let totalCounts = 0;
                let mappedScenarios = 0;
                let mappedTests = 0;
                let tempRow = [];
                let viewMappedData = response;

                viewMappedData.forEach(object => {
                     totalCounts = totalCounts + 1;
                    mappedScenarios = mappedScenarios + object.testscenarioname.length;
                    mappedTests = mappedTests + object.testname.length;
                    tempRow.push({
                        'testCaseNames': object.testname, 
                        'scenarioNames': object.testscenarioname,
                        'mapId': object._id,
                        'scenarioId': object.testscenarioid,
                        'testid':object.testid,
                        "reqDetails": object.reqdetails
                    });
                });
                setCounts({
                    totalCounts: totalCounts,
                    mappedScenarios: mappedScenarios,
                    mappedTests: mappedTests
                });
                setRows(tempRow);
            }
            else if (response !== 'fail') {
                setRows([]);
                setCounts({
                    totalCounts: 0,
                    mappedScenarios: 0,
                    mappedTests: 0
                });
            }
        }
        catch(err) {
            setToast('error', 'Error', MSG.INTEGRATION.ERR_FETCH_DATA.CONTENT);
        }
    }


    const footerIntegrations = (
        <div className='btn-11'>
            {activeIndex === 0 && (
                <div className="btn__2">
                    <Button label="Save" severity="primary" className='btn1' />
                    <Button label="Back" onClick={showLogin} size="small" className="logout__btn" />
                </div>)}

            {activeIndex === 1 && (
                <Button label="Back" onClick={showLogin} size="small" className="cancel__btn" />)}

        </div>
    );

    const uploadFile = async ({ uploadFileRef, setSheetList, setError, setFiledUpload, dispatch }) => {
        var file = uploadFileRef.current.files[0]
        if (!file) {
            return;
        }
        var extension = file.name.substr(file.name.lastIndexOf('.') + 1)
        dispatch(showOverlay('Uploading...'));
        try {
            const result = await read(file)
            if (extension === 'xls' || extension === 'xlsx') {
                var res = await api.excelToZephyrMappings({ 'content': result, 'flag': "sheetname" })
                dispatch(showOverlay(''));
                if (res.error) { setError(res.error); return; }
                if (res.length > 0) {
                    setFiledUpload(result);
                    setExcelContent(result);
                    setSheetList(res)
                } else {
                    setError("File is empty")
                }
            }
            else {
                setError("File is not supported")
            }
            dispatch(showOverlay(''));
        } catch (err) {
            dispatch(showOverlay(''));
            setError("invalid File!")
        }
    }


    function read(file) {
        return new Promise((res, rej) => {
            var reader = new FileReader();
            reader.onload = function () {
                res(reader.result);
            }
            reader.onerror = () => {
                rej("fail")
            }
            reader.onabort = () => {
                rej("fail")
            }
            reader.readAsBinaryString(file);
        })
    }

    // const checkboxTemplate = (node) => {
    //     return (
    //         <div style={{ width: '100%' }}>
    //             <Checkbox
    //                 checked={selectedNodes.includes(node.key)}
    //                 onChange={() => onCheckboxChange(node.key)}
    //             />
    //             <span>{node.label} </span>
    //             <i className="pi pi-times" style={{ float: 'right' }}></i>
    //         </div>
    //     );
    // };
    const confirmPopupMsg = (
        <div> <p>Note : If you import already mapped testcases will be unmapped</p></div>
    )


    // const onCheckboxChange = (nodeKey) => {
    //     const nodeIndex = selectedNodes.indexOf(nodeKey);
    //     const newSelectedNodes = [...selectedNodes];
    //     if (nodeIndex !== -1) {
    //         newSelectedNodes.splice(nodeIndex, 1);
    //     } else {
    //         newSelectedNodes.push(nodeKey);
    //     }
    //     setSelectedNodes(newSelectedNodes);
    // };
    const handleProject= async(e)=>{
        const projectId = e.target.value;
        const releaseData = await api.zephyrProjectDetails_ICE(projectId.id, '6440e7b258c24227f829f2a4');
        if (releaseData.error)
            setToast('error','Error',releaseData.error);
        else if (releaseData === "unavailableLocalServer")
            setToast('error','Error',MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
        else if (releaseData === "scheduleModeOn")
            setToast("info", "Info", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
        else if (releaseData === "Invalid Session"){
            setToast('error','Error','Invalid Session');
        }
        else if (releaseData === "invalidcredentials")
            setToast('error','Error',MSG.INTEGRATION.ERR_INVALID_CRED.CONTENT);
        else if (releaseData) {
            setProjectDetails([]);
            setReleaseArr(releaseData);
            setSelectZephyrProject(projectId);
            getProjectScenarios();
            // setSelectedRel("Select Release");
            // clearSelections();
        }
    }

    const handleImportProject= async(e)=>{
        const projectId = e.target.value;
        const releaseData = await api.zephyrProjectDetails_ICE(projectId.id, '6440e7b258c24227f829f2a4');
        if (releaseData.error)
            setToast('error','Error',releaseData.error);
        else if (releaseData === "unavailableLocalServer")
            setToast('error','Error',MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
        else if (releaseData === "scheduleModeOn")
            setToast("info", "Info", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
        else if (releaseData === "Invalid Session"){
            setToast('error','Error','Invalid Session');
        }
        else if (releaseData === "invalidcredentials")
            setToast('error','Error',MSG.INTEGRATION.ERR_INVALID_CRED.CONTENT);
        else if (releaseData) {
            setImportProjectDetails([]);
            setImportReleaseArr(releaseData);
            setSelectImportZephyrProject(projectId);
            getProjectScenarios();
            // setSelectedRel("Select Release");
            // clearSelections();
        }
    }

    const onReleaseSelect = async(event) => {
        const releaseId = event.target.value;
        const testAndScenarioData = await api.zephyrCyclePhase_ICE(releaseId.id, '6440e7b258c24227f829f2a4');
        if (testAndScenarioData.error)
             setToast('error','Error',testAndScenarioData.error);
        else if (testAndScenarioData === "unavailableLocalServer")
             setToast('error','Error',MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
        else if (testAndScenarioData === "scheduleModeOn")
             setToast('error','Error',MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
        else if (testAndScenarioData === "Invalid Session"){
            setToast('error','Error','Invalid Session');
        }
        else if (testAndScenarioData) {
            const convertToTree = convertDataStructure(testAndScenarioData.project_dets);
            setProjectDetails(convertToTree);
            // setAvoProjects(testAndScenarioData.avoassure_projects);  
            setSelectedRel(releaseId);
        }
    }
    const onImportReleaseSelect = async(event) => {
        const releaseId = event.target.value;
        const testAndScenarioData = await api.zephyrCyclePhase_ICE(releaseId.id, '6440e7b258c24227f829f2a4');
        if (testAndScenarioData.error)
             setToast('error','Error',testAndScenarioData.error);
        else if (testAndScenarioData === "unavailableLocalServer")
             setToast('error','Error',MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
        else if (testAndScenarioData === "scheduleModeOn")
             setToast('error','Error',MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
        else if (testAndScenarioData === "Invalid Session"){
            setToast('error','Error','Invalid Session');
        }
        else if (testAndScenarioData) {
            const convertToTree = convertDataStructure(testAndScenarioData.project_dets);
            setImportProjectDetails(convertToTree);
            // setAvoProjects(testAndScenarioData.avoassure_projects);  
            setImportSelectedRel(releaseId);
        }
    }
    function convertDataStructure(input) {
        let output = [];
      
        Object.entries(input).forEach(([cycleName, items]) => {
          let cycle = {
            key: cycleName,
            label: cycleName,
            children: []
          };
      
          items.forEach((item) => {
            let [key, label] = Object.entries(item)[0];
            cycle.children.push({
              key,
              label,
              children: [{}],
              checked:false
            });
          });
      
          output.push(cycle);
        });
      
        return output;
      }

      const saveImportMapping = async() => {
        // if(importType === 'excel'){
            var data = await api.zephyrTestcaseDetails_ICE("testcase", selectedImportNodes[0]);
            if (data.error){
                setToast("error", "Error", data.error);
                return;
            }
            else if (data === "unavailableLocalServer"){
                setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);return;
            }
            else if (data === "scheduleModeOn"){
                setToast("error", "Error", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);return;
            }
            else if (data === "Invalid Session"){
                setToast("error", "Error", 'Invalid Session');return;
            }
            
            var res = await api.excelToZephyrMappings({'content':excelContent,'flag':'data',sheetname: selectSheet})
            if(res.error){
                setToast("error", "Error", res.error);return;
            }
            
            var mappings = res.mappings;
            const testIdToTestCase = new Map();    // will contain a map where key is testcaseid and value is the testCase object
            const scenarioNameToScenario =new Map();// will contain a map where key is scnenarioName and value is the scenario object
    
            // var scenarioList = (avoProject?avoProjectList[avoProject].scenario_details:[]);
            {listofScenarios && listofScenarios.map((e,i)=>scenarioNameToScenario.set(e.name,e))}
    
            var testCasesList = data.testcases;
            {testCasesList && testCasesList.map((e,i)=> testIdToTestCase.set(e.id,e))}
           
            var finalMappings = [], errorTestCasesId=[], errorScenarioNames = [];
    
            {mappings && mappings.map((e,idx)=>{
                var testCaseIds = e.testCaseIds;
                var scenarios = e.scenarios;
                var mappedpair = {
                    projectid: [],			
                    releaseid: [],
                    treeid: [],
                    parentid: [],
                    testid:[],
                    testname: [],
                    reqdetails: [], 
                    scenarioId: []
                }
    
                errorTestCasesId.push({row: e.row, tcId:[]});

            //     // traversing all the test case id's received from a row of excel sheet
                testCaseIds.map((tcId,i)=>{
                    // checking if the testCaseId exists in the selected phase/module
                    if(testIdToTestCase.has(parseInt(tcId))){
                        var tcObject = testIdToTestCase.get(parseInt(tcId));
                        mappedpair.treeid.push(String(tcObject.cyclePhaseId))
                        mappedpair.parentid.push(tcObject.parentId)
                        mappedpair.testname.push(tcObject.name)
                        mappedpair.testid.push(String(tcObject.id))
                        mappedpair.reqdetails.push(tcObject.reqdetails) 
                        mappedpair.projectid.push(parseInt(selectImportZephyrProject.id))
                        mappedpair.releaseid.push(parseInt(importSelectedRel.id))    
                    }
                    else{
                        errorTestCasesId[errorTestCasesId.length -1 ].tcId.push(tcId);
                    }
                });
                console.log(mappedpair,' its mappedpair');
                if(errorTestCasesId[errorTestCasesId.length -1 ].tcId.length === 0)
                    errorTestCasesId.pop()
                
                errorScenarioNames.push({row:e.row, snrNames : []});
    
            //     // traversing all the scenario names received from a row of excel sheet
                scenarios.map((scenarioName, i)=>{
                    // checking if the scenario name exists in the selected phase/module
                    if(scenarioNameToScenario.has(scenarioName)){
                        mappedpair.scenarioId.push(scenarioNameToScenario.get(scenarioName)._id); 
                    }
                    else{
                        errorScenarioNames[errorScenarioNames.length - 1].snrNames.push(scenarioName)
                    }
                })
                if(errorScenarioNames[errorScenarioNames.length - 1].snrNames.length === 0){
                    errorScenarioNames.pop()
                }
                if(mappedpair.treeid.length>0 && mappedpair.scenarioId.length>0){
                    finalMappings.push(mappedpair)          //appending the mappedpair to the list of all mapped pairs                
                }
            })}
    
            if(finalMappings.length === 0){
                setImportStatus("Not_Mapped");
                setToast("error", "Error", 'Please upload the valid testcase sheet !!!');return;
            }
            else{
                // saving the finalMappings 
                const response = await api.saveZephyrDetails_ICE(finalMappings);
                if (response.error){
                    setToast("error", "Error", response.error);return;
                }
                else if(response === "unavailableLocalServer"){
                    setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);return;
                    }
                else if(response === "scheduleModeOn"){
                    setToast("error", "Error", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);return;
                }
                if(response === 'success'){
                    handleImportClose();
                    setToast("success", "Success", MSG.INTEGRATION.SUCC_IMPORT.CONTENT);
                }
            }
            
            //Checking in case import is partially sucessfull
            if(!res.errorRows.length && !errorScenarioNames.length && !errorTestCasesId.length){
                handleImportClose();
                setToast("success", "Success", MSG.INTEGRATION.SUCC_IMPORT.CONTENT);
                // setMsg(MSG.INTEGRATION.SUCC_IMPORT);
                // setImportPop(false);
                
            }
            // else{
            //     setErrorRows(res.errorRows);
            //     setTcErrorList(errorTestCasesId)
            //     setSnrErrorList(errorScenarioNames)
            //     setActiveTab("")
            // } 
        // }
      }


      const importMappingFooter = (
        <>
        <Button label='Import' size='small' severity="primary" onClick={saveImportMapping}></Button>
        </>
    )

    const getProjectScenarios = async () => {
        // It needs to be change
        const projectScenario = await api.getAvoDetails("6440e7b258c24227f829f2a4");
        if (projectScenario.error)
            setToast("error", "Error", projectScenario.error);
        else if (projectScenario === "unavailableLocalServer")
            setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
        else if (projectScenario === "scheduleModeOn")
            setToast("error", "Error", MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
        else if (projectScenario === "Invalid Session") {
            setToast("error", "Error", 'Invalid Session');
        }
        else if (projectScenario && projectScenario.avoassure_projects && projectScenario.avoassure_projects.length) {
            // setProjectDetails(projectScenario.project_dets);
            setAvoProjectsList(projectScenario.avoassure_projects);
            setAvoProjects(projectScenario.avoassure_projects.map((el, i) => { return { label: el.project_name, value: el.project_id, key: i } }));
            onAvoProjectChange(projectScenario.avoassure_projects);
            // setSelectedRel(releaseId);  
            // clearSelections();
        }
    }

    const onAvoProjectChange = async (scnData) => {
        dispatchAction(selectedAvoproject(reduxDefaultselectedProject.projectId));
        if (scnData.length) {
            let filterScns = scnData.filter(el => el.project_id === reduxDefaultselectedProject.projectId)[0]['scenario_details'] || [];
            setListofScenarios(filterScns);

            let treeData = selectedAvoproject
                ? filterScns.map((scenario) => ({
                    key: scenario._id,
                    label: scenario.name,
                    data: { type: 'scenario' },
                    checked: false,
                    children: mappedTreeList
                }))

                : []
                setCompleteTreeData(treeData);
                if(treeData.length > 8) {
                    const indexOfLastScenario = currentAvoPage * scenariosPerPage;
                    setIndexOfFirstScenario(indexOfLastScenario - scenariosPerPage);
                    // const currentScenarios = listofScenarios.slice(indexOfLastScenario - scenariosPerPage, indexOfLastScenario);
                    setTreeData(treeData.slice(indexOfLastScenario - scenariosPerPage, indexOfLastScenario));
                }
                else{
            setTreeData(treeData);
                }
        }
    }

    /////Pagination for AVO selected projects
    const onPageAvoChange = (event) => {
        setCurrentAvoPage(event.page + 1);
        const indexOfLastScenario = (event.page + 1) * scenariosPerPage;
        setIndexOfFirstScenario(indexOfLastScenario - scenariosPerPage);
        setTreeData(completeTreeData.slice(indexOfLastScenario - scenariosPerPage, indexOfLastScenario));
      };

    const TreeNodeProjectCheckbox = (node) => {
        if (node.children) {
            return (
                <div>
                    <span>{node.label}</span>
                </div>
            );
        } else {
            return (
                <div>
                    <Checkbox
                        checked={selectedLeftNodes.includes(node.key)}
                        onChange={(e) => {
                            onLeftCheckboxChange(node)
                            // console.log(e,' its selected e');
                            // if (e.checked) {
                            //     setSelectedKeys([...selectedKeys, node.key]);
                            // } else {
                            //     setSelectedKeys(selectedKeys.filter((key) => key !== node.key));
                            // }
                        }}
                    />
                    <span>{node.key} {node.label}</span>
                </div>
            );
        }
    };

    const TreeNodeImportCheckbox = (node,parentNode) => {
        if (!isNaN(node.key)) {
            return (
                <div>
                    <Checkbox
                        checked={selectedImportNodes.includes(node.key)}
                        onChange={(e) => {
                            importNodeCheckbox(node,e,parentNode);
                        }}
                    />
                    <span>{node.label}</span>
                </div>
            );
        }
        else {
            return (
                <div>
                    <span>{node.label}</span>
                </div>
            )
        } 
        // else {
        //     return (
        //         <div>
        //             <Checkbox
        //                 checked={selectedLeftNodes.includes(node.key)}
        //                 onChange={(e) => {
        //                     onLeftCheckboxChange(node);
        //                 }}
        //             />
        //             <span>{node.label}</span>
        //         </div>
        //     );
        // }
    };
    const handleImportClose = () => {
        setImportMap(false); setFiledUpload(undefined);
        setSelectSheet(null);setSelectImportZephyrProject(null);setImportSelectedRel("Select Release");
        setImportSelectedKeys([]);
    }

    const importNodeCheckbox = (nodeKey,e,parentNode) => {
        let data = importProjectDetails;
        const nodeIndex = selectedImportNodes.indexOf(nodeKey.key);
        const newSelectedNodes = [];
        if (nodeIndex !== -1) {
            newSelectedNodes.splice(nodeIndex, 1);
        } else {
            newSelectedNodes.push(nodeKey.key);
        }
        // data.forEach((item) => {
        //     if (item.key === nodeKey.key && item.label === nodeKey.label) {
        //       item.checked = e.checked; // Change checked value to true
        //     }
            
        //     // If there are children, iterate through them as well
        //     if (item.children) {
        //       item.children.forEach((child) => {
        //         if (child.key === nodeKey.key && child.label === nodeKey.label) {
        //           child.checked = e.checked; // Change checked value to true for children
        //         }
        //       });
        //     }
        //   });
          
        setSelectedImportNodes(newSelectedNodes);
        setCurrentNode(nodeKey)
    }

    const onLeftCheckboxChange = (nodeKey) => {
        const nodeIndex = selectedLeftNodes.indexOf(nodeKey.key);
        const newSelectedNodes = isMutipleScn ? [] : [...selectedLeftNodes];
        let newSelectedZphyrTCIds = isMutipleScn ? [] : [ ...selectedZphyrTCIds ];
        let newSelectedZphyrTCNames = isMutipleScn ? [] : [ ...selectedZphyrTCNames ]; 
        let newSelectedZphyrTCReqs = isMutipleScn ? [] : [ ...selectedZphyrTCReqs ];
        let newSelectedZphyrTreeIds = isMutipleScn ? [] : [ ...selectedZphyrTreeIds ];
        let newSelectedZphyrParentIds = isMutipleScn ? [] : [ ...selectedZphyrParentIds ];
        let newSelectedZphyrProjIds = isMutipleScn ? [] : [ ...selectedZphyrProjIds ];
        let newSelectedZphyrRelIds = isMutipleScn ? [] : [ ...selectedZphyrReleaseIds ];


        if (nodeIndex !== -1) {
            newSelectedNodes.splice(nodeIndex, 1);
            newSelectedZphyrTCIds.splice(nodeIndex, 1);
            newSelectedZphyrTCNames.splice(nodeIndex, 1);
            newSelectedZphyrTCReqs.splice(nodeIndex, 1);
            newSelectedZphyrTreeIds.splice(nodeIndex, 1);
            newSelectedZphyrParentIds.splice(nodeIndex, 1);
            newSelectedZphyrProjIds.splice(nodeIndex, 1);
            newSelectedZphyrRelIds.splice(nodeIndex, 1);
        } else {
            newSelectedNodes.push(nodeKey.key);
            newSelectedZphyrTCIds.push(nodeKey.key);
            newSelectedZphyrTCNames.push(nodeKey.label);
            newSelectedZphyrTCReqs.push(nodeKey.reqdetails);
            newSelectedZphyrTreeIds.push(String(nodeKey.cyclePhaseId));
            newSelectedZphyrParentIds.push(nodeKey.parentId);
            newSelectedZphyrProjIds.push(parseInt(selectZephyrProject.id));
            newSelectedZphyrRelIds.push(parseInt(selectedRel.id));
        }
        setMultipleSelected(newSelectedZphyrTCIds.length > 1 ? true:false);
        setselectedLeftNodes(newSelectedNodes);
        dispatchAction(checkedTcIds(newSelectedZphyrTCIds));
        dispatchAction(checkedTCNames(newSelectedZphyrTCNames));
        dispatchAction(checkedTCReqDetails(newSelectedZphyrTCReqs));
        dispatchAction(checkedTreeIds(newSelectedZphyrTreeIds));
        dispatchAction(checkedParentIds(newSelectedZphyrParentIds));
        dispatchAction(checkedProjectIds(newSelectedZphyrProjIds));
        dispatchAction(checkedReleaseIds(newSelectedZphyrRelIds));
    }

    const handleImportNodeToggle = async (nodeobj) => {
        if(Object.keys(nodeobj).length && nodeobj.node && !isNaN(parseInt(nodeobj.node.key))){
            const data = await api.zephyrTestcaseDetails_ICE("testcase", nodeobj.node.key);
        if (data.error)
                setToast('error','Error',data.error);
            else if (data === "unavailableLocalServer")
                setToast('error','Error',MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
            else if (data === "scheduleModeOn")
                setToast('error','Error',MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
            else if (data === "Invalid Session"){
                setToast('error','Error','Invalid Session');
            }
            else {
                if(data.modules.length){
                    updateModuleData(nodeobj.node.key,data.modules,importProjectDetails);
                }
                setTestCases(data.testcases);
                setModules(data.modules);
                // setCollapse(false);
            }
        }
    }

    const handleNodeToggle = async (nodeobj) => {
        if(Object.keys(nodeobj).length && nodeobj.node && !isNaN(parseInt(nodeobj.node.key))){
            setEnableBounce(true);
            const data = await api.zephyrTestcaseDetails_ICE("testcase", nodeobj.node.key);
        if (data.error)
                setToast('error','Error',data.error);
            else if (data === "unavailableLocalServer")
                setToast('error','Error',MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
            else if (data === "scheduleModeOn")
                setToast('error','Error',MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
            else if (data === "Invalid Session"){
                setToast('error','Error','Invalid Session');
            }
            else {
                if(data.testcases.length){
                    updateChildrenData(projectDetails,data.testcases,data.modules);
                }
                if(data.modules.length && !data.testcases.length){
                    updateModuleData(nodeobj.node.key,data.modules,projectDetails);
                }
                setTestCases(data.testcases);
                setModules(data.modules);
                // setCollapse(false);
            }
        }
        setEnableBounce(false);
       
    }

    const  updateChildren =  (node, keyToUpdate, newChildren) => {
        if (!node.children) return node;
    
        const updatedChildren = node.children.map(child => {
            if (child.key === keyToUpdate) {
                return {
                    ...child,
                    children: [
                        ...(child.children || []),
                        ...newChildren.map(obj => {
                            const key = Object.keys(obj)[0];
                            const label = obj[key];
                            return { key, label, children: [] };
                        })
                    ]
                };
            } else if (child.children) {
                return updateChildren(child, keyToUpdate, newChildren);
            }
            return child;
        });
    
        return {
            ...node,
            children: updatedChildren
        };
    }

    



    const updateModuleData = (selectedkey,modules,currentProjectDetails) => {
        if(currentProjectDetails.length && modules.length){
            const findParent = (nodes, parentId, processedNodes,item) => {
                if(item){
                    for (let i = 0; i < nodes.length; i++) {
                        const node = nodes[i];
                        // && (!node.children || node.children.length < totalLen)
                        if (!processedNodes.has(node.key) && node.key === parentId) {
                            processedNodes.add(node.key);
                            if (!node.children) {
                                node.children = [];
                            } else {
                                // Remove empty object from children if exists
                                node.children = node.children.filter((child) => Object.keys(child).length > 0);
                            }
                           
                                    const existingChild = node.children.find(child => child.key === Object.keys(item)[0]);
                                    if(!existingChild){
                                        const additionalChildren = modules.map((obj) => ({
                                            key: Object.keys(obj)[0],
                                            label: Object.values(obj)[0],
                                            children: [{}],
                                            type: 'folder'
                                        }));
                                        node.children.push(...additionalChildren);
                                    }
                            return true;
                        } else if (node.children) {
                            const foundInChild = findParent(node.children, parentId, processedNodes,item);
                            if (foundInChild) return true;
                        }
                    }
                }
                
                return false;
            };
            modules.forEach((item) => {
                findParent(currentProjectDetails, selectedkey, new Set(),item);
            });
            
        }
    }

    const updateChildrenData = (firstArray, secondArray, modules) => {
        let additionalChildrenAdded = false;
        let totalLen = secondArray.length + modules.length;
    
        const findParent = (nodes, parentId, processedNodes,item) => {
            if(item){
                for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i];
                    // && (!node.children || node.children.length < totalLen)
                    if (!processedNodes.has(node.key) && node.key === parentId && node.type !== 'testcase' && (!node.children ||  (node.children.length === 1 || node.children.length < totalLen))) {
                        processedNodes.add(node.key);
                        if (!node.children) {
                            node.children = [];
                        } else {
                            // Remove empty object from children if exists
                            node.children = node.children.filter((child) => Object.keys(child).length > 0);
                        }
                       
                        if(node && node.type !== 'testcase'){
                            if (modules.length && !additionalChildrenAdded) {
                                const existingChild = node.children.some(child => 
                                    modules.some(obj => child.key === Object.keys(obj)[0])
                                );
                                if(!existingChild){
                                    const additionalChildren = modules.map((obj) => ({
                                        key: Object.keys(obj)[0],
                                        label: Object.values(obj)[0],
                                        children: [{}],
                                        type: 'folder'
                                    }));
                                    node.children.push(...additionalChildren);
                                }
                                    
                                additionalChildrenAdded = true;
                            }
                            const existingChild = node.children.find(child => child.key === String(item.id));
                            if (!existingChild) {
                                node.children.push({
                                    key: String(item.id),
                                    label: item.name,
                                    type: 'testcase',
                                    cyclePhaseId:item.cyclePhaseId || '',
                                    parentId:item.parentId || parentId,
                                    reqdetails:item.reqdetails || []
                                });
                            }
                        }
                        return true;
                    } else if (node.children) {
                        const foundInChild = findParent(node.children, parentId, processedNodes,item);
                        if (foundInChild) return true;
                    }
                }
            }
            
            return false;
        };
    
        secondArray.forEach((item) => {
            const { parentId } = item;
            findParent(firstArray, parentId, new Set(),item);
        });
    };
    
    
      


    return (
        <>
            <div ref={dropdownRef}>
                {/* <Dialog header={selectedscreen.name ? `Manage Integration: ${selectedscreen.name} Integration` : 'Manage Integrations'} className='zephyrDialog' visible={visible} style={{ width: '70vw', height: '45vw', overflowX: 'hidden' }} onHide={onHide} footer={footerIntegrations}> */}
                    <div>
                        <div className="tab__cls1">
                            {activeIndex === 0 && <img className='import_img' src="static/imgs/import_icon.svg" id="lll" onClick={() => setShowNote(true)} />}
                            <TabView activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
                                <TabPanel header="Mapping">
                                    <div className="zephyr__mapping">
                                        <div className="card_zephyr1">
                                            <Card className="mapping_zephyr_card1">
                                                {enableBounce && <div className="bouncing-loader">
                                                    <div></div>
                                                    <div></div>
                                                    <div></div>
                                                </div>}
                                                
                                                <div className="dropdown_div1">
                                                    <div className="dropdown-zephyr1">
                                                        <span>Select Project <span style={{ color: 'red' }}>*</span></span>
                                                        <span className="release_span"> Select Release<span style={{ color: 'red' }}>*</span></span>
                                                    </div>
                                                    <div className="dropdown-zephyr2">
                                                        {/* <Dropdown style={{ width: '11rem', height: '2.5rem' }} value={selectZephyrProject} className="dropdown_project" options={zephyrProj} onChange={(e) => setSelectZephyrProject(e)} placeholder="Select Project" /> */}
                                                        <Dropdown value={selectZephyrProject} onChange={(e) => handleProject(e)} options={domainDetails} optionLabel="name"
                                                            placeholder="Select Project" className="project_dropdown" />
                                                        <Dropdown value={selectedRel} onChange={(e) => onReleaseSelect(e)} options={releaseArr} optionLabel="name"
                                                            placeholder="Select Release" className="release_dropdown" />
                                                        {/* <Dropdown style={{ width: '11rem', height: '2.5rem' }} value={selectZephyrRelease} className="dropdown_release" options={zephyrRelease} onChange={(e) => setSelectZephyrRelease(e)} placeholder="Select Release" /> */}
                                                    </div>

                                                </div>
                                                {selectZephyrProject && selectedRel && (<div className='zephyrdata-card1'>
                                                    <Tree
                                                        value={projectDetails}
                                                        selectionMode="single"
                                                        selectionKeys={selectedKeys}
                                                        onSelectionChange={(e) => setSelectedKeys(e.value)}
                                                        nodeTemplate={TreeNodeProjectCheckbox}
                                                        onExpand={handleNodeToggle}

                                                    />
                                                 <div className="jira__paginator">
                                                <Paginator
                                                    first={currentZepPage - 1}
                                                    rows={itemsPerPage}
                                                    totalRecords={projectDetails.length}
                                                    onPageChange={(e) => setCurrentZepPage(e.page + 1)}
                                                    totalPages={totalPages} // Set the totalPages prop
                                                />
                                                </div>
                                                </div>)}
                                            </Card>
                                        </div>

                                        <div>
                                            <div className="card_zephyr2">
                                                <Card className="mapping_zephyr_card2">
                                                    <div className="dropdown_div1">
                                                        <div className="dropdown-zephyr">
                                                            <span>Selected Project <span style={{ color: 'red' }}>*</span></span>
                                                        </div>
                                                        <div className="dropdown-zephyr">
                                                            {/* <Dropdown options={avoProjects} style={{ width: '11rem', height: '2.5rem' }} value={selectedAvo} onChange={(e) => onAvoProjectChange(e)} className="dropdown_project" placeholder="Select Project" /> */}
                                                            <span className="selected_projName" title={reduxDefaultselectedProject.projectName}>{reduxDefaultselectedProject.projectName}</span>

                                                        </div>

                                                        <div className="avotest__zephyr">
                                                            <Tree value={treeData} selectionMode="single" selectionKeys={selectedAvoKeys} onSelectionChange={(e) => setSelectedAvoKeys(e.value)} nodeTemplate={TreeNodeCheckbox} className="avoProject_tree" />
                                                        </div>
                                                        <div className="testcase__AVO__jira__paginator">

                                                        <Paginator
                                                            first={indexOfFirstScenario}
                                                            rows={scenariosPerPage}
                                                            totalRecords={listofScenarios.length}
                                                            onPageChange={onPageAvoChange}
                                                        />
                                                    </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>
                                        <span>
                                            {/* <img className="map__btn__zephyr" src="static/imgs/map_button_icon.svg" /> */}
                                            <Button className="map__btn__zephyr" label='Map' severity='primary' size='small' onClick={()=>handleSync()}></Button>
                                        </span>
                                    </div>


                                </TabPanel>

                                <TabPanel header="View Mapping">
                                    <Card className="view_map_zephyr">
                                        <div className="flex justify-content-flex-start toggle_btn">
                                            <span>Zephyr Testcase to Avo Assure Testcase</span>
                                            <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                                            <span>Avo Assure Testcase to Zephyr Testcase</span>
                                        </div>

                                        {checked ? (<div className="accordion_testcase">
                                        <Accordion multiple activeIndex={0}>
                                            {rows.map((item, rowIndex) => (
                                                item.scenarioNames.map((scenarioName, scenarioIndex) => (
                                                    <AccordionTab key={`${item.scenarioNames.join()}_${scenarioIndex}`} header={scenarioName}>
                                                        <div>
                                                            {item.testCaseNames.map((testCaseName, index) => (
                                                                <div key={index}>{testCaseName}</div>
                                                            ))}
                                                        </div>
                                                    </AccordionTab>
                                                ))
                                            ))}
                                        </Accordion>
                                        </div>

                                        ) : (

                                            <div className="accordion_testcase">
                                                <Accordion multiple activeIndex={0}>
                                                    {rows.map((item) => (
                                                        item.testCaseNames.map((testCaseName, index) => (
                                                            <AccordionTab key={`${item.testCaseNames.join()}_${index}`} header={testCaseName}>
                                                                <div>
                                                                    {item.scenarioNames.map((scenarioName, scenarioIndex) => (
                                                                        <div key={scenarioIndex}>{scenarioName}</div>
                                                                    ))}
                                                                </div>
                                                            </AccordionTab>
                                                        ))
                                                    ))}
                                                </Accordion>
                                            </div>
                                        )}
                                    </Card>

                                </TabPanel>

                            </TabView>

                            <AvoConfirmDialog
                                visible={showNote}
                                onHide={() => setShowNote(false)}
                                showHeader={false}
                                message={confirmPopupMsg}
                                icon="pi pi-exclamation-triangle"
                                accept={() => { setImportMap(true); }} />

                        </div>
                    </div>
                    <Dialog header="Import mappings" visible={importMap} onHide={handleImportClose} style={{ height: fileUpload && selectImportZephyrProject ?'96vh':fileUpload ? '46vh' : '28vh', width: fileUpload && selectImportZephyrProject ?'36vw':fileUpload ? '39vw' : '28vw' }} footer={importMappingFooter}>
                        <div>
                            <div>
                                <label>Upload Excel File: </label>
                                <input type='file' accept=".xls, .xlsx" onChange={upload} ref={uploadFileRef} />
                            </div>
                            <div className='dropdown_lists'>
                                {fileUpload && (
                                    <>
                                        <div>
                                            <label>Select Sheet:</label>
                                            <Dropdown
                                                value={selectSheet}
                                                options={[...sheetList.map((sheet) => ({ label: sheet, value: sheet })),]}
                                                onChange={(e) => setSelectSheet(e.value)}
                                                placeholder="Select Sheet"
                                                className='excelSheet_dropdown'
                                            />
                                        </div>
                                        <div>
                                            <label>Select Project:</label>
                                            <Dropdown
                                                value={selectImportZephyrProject} onChange={(e) => handleImportProject(e)}
                                                options={domainDetails}
                                                optionLabel="name"
                                                placeholder="Select Project"
                                                className='selectProject_dropdown'/>
                                                
                                        </div>
                                        <div>
                                            <label>Select Release:</label>
                                            <Dropdown
                                                value={importSelectedRel} onChange={(e) => onImportReleaseSelect(e)}
                                                options={importReleaseArr}
                                                optionLabel="name"
                                                placeholder="Select Release"
                                                className='selectRelease_dropdown'/>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div>
                                {fileUpload && selectImportZephyrProject &&(
                                    <>
                                        <div>
                                            <div className='zephyrdata-card1 selectPhase'>
                                                <label>
                                                    Select Phase/Module
                                                </label>
                                                <Tree
                                                        value={importProjectDetails}
                                                        selectionMode="single"
                                                        selectionKeys={importselectedKeys}
                                                        onSelectionChange={(e) => setImportSelectedKeys(e.value)}
                                                        nodeTemplate={TreeNodeImportCheckbox}
                                                        onExpand={handleImportNodeToggle}

                                                    />
                                            </div>
                                            <div>
                                            <label>Selected AVO Project:</label>
                                            <span className="selected_projName" title={reduxDefaultselectedProject.projectName}>{reduxDefaultselectedProject.projectName}</span>

                                            </div>
                                        </div>

                                    </>
                                )}
                            </div>
                        </div>
                    </Dialog>
                {/* </Dialog> */}
            </div>
        </>)
}
export default forwardRef(ZephyrContent);