import React, { useState,useRef, useEffect,forwardRef,useImperativeHandle  } from "react";
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { InputSwitch } from "primereact/inputswitch";
import "../styles/AzureContent.scss";
import { Tree } from 'primereact/tree';
import { Checkbox } from 'primereact/checkbox';
import { useDispatch, useSelector } from 'react-redux';
import * as api from '../api.js';
import { RedirectPage, Messages as MSG, setMsg } from '../../global';
import {resetIntergrationLogin, resetScreen, selectedProject,
    selectedIssue, selectedTCReqDetails, selectedTestCase,
    syncedTestCases, mappedPair, selectedScenarioIds,
    selectedAvoproject, mappedTree} from '../settingSlice';
    import { Toast } from "primereact/toast";    


const AzureContent = ({setToast,issueTypes,projectDetails,selectedNodes,setSelectedNodes},ref) => {
    // selectors
     // selectors
     const currentProject = useSelector(state => state.setting.selectedProject);
     const currentIssue = useSelector(state => state.setting.selectedIssue);
     const selectedZTCDetails = useSelector(state => state.setting.selectedZTCDetails);
     const selectedScIds = useSelector(state => state.setting.selectedScenarioIds);
     const mappedData = useSelector(state => state.setting.mappedPair);
     const mappedTreeList = useSelector(state => state.setting.mappedTree);
     const selectedAvo = useSelector(state => state.setting.selectedAvoproject);
     const AzureLoginDetails = useSelector(state => state.setting.AzureLogin);
     const zephyrLoginDetails = useSelector(state => state.setting.zephyrLogin);
     const selectedTC = useSelector(state => state.setting.selectedTestCase);
     const selectedscreen = useSelector(state => state.setting.screenType);

    // const toast = useRef(null);
    const dispatchAction = useDispatch();
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedWorkItem, setSelectedWorkItem] = useState(null);
    // const [selectedtestplan, setSelectedtestplan] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [checked, setChecked] = useState(false);
    const [checkedAvo, setCheckedAvo] = useState(false);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [selectedAvoKeys, setSelectedAvoKeys] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [secondOption, setSecondOption] = useState('');
    const [testSuites,setTestSuites] = useState([]);
    const [storiesToDisplay,setStoriesToDisplay] = useState([])
    const [testsToDisplay,setTestsToDisplay] = useState([])
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage,setRecordsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [userStories,setUserStories] = useState([]);
    const [testPlansDropdown ,setTestPlansDropdown] = useState([]);
    const [isShowTestplan,setIsShowTestplan] = useState(false);
    const [showCustmBtn,setShowCustmBtn] = useState(true);
    const [selectedTestplan,setSelectedTestplan] = useState('');
    const [disableIssue, setDisableIssue] = useState(true);
    const [avoProjectsList, setAvoProjectsList] = useState(null);
    const [avoProjects, setAvoProjects] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [listofScenarios, setListofScenarios] = useState([]);
    const [selected, setSelected] = useState(false);
    const [selectedId, setSelectedId] = useState('');
    const [selectedSummary, setSelectedSummary] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [rows, setRows] = useState([]);
    const [counts, setCounts] = useState({
        totalCounts: 0,
        mappedScenarios: 0,
        mappedTests: 0
    });
    const [viewMappedFiles, setViewMappedFiles] = useState([]);

    const jiraTestCase = [
        {
            id: 1,
            name: 'Test Case 1',
            avoassure: 'AvoTestCase 1',
        },
        {
            id: 2,
            name: 'Test Case 2',
            avoassure: 'Avo TestCase 2'
        },
        {
            id: 3,
            name: 'Test Case 3',
            avoassure: 'Avo TestCase 3'
        },
    ];

    const avoTestCase = [
        {
            id: 1,
            name: 'Test Case 1',
            jiraCase: 'Azure TestCase 1',
        },
        {
            id: 2,
            name: 'Test Case 2',
            jiraCase: 'Azure TestCase 2'
        },
        {
            id: 3,
            name: 'Test Case 3',
            jiraCase: 'Azure TestCase 3'
        },
    ];

    const projects = [
        { name: 'Avo Design Components', code: 'NY' },
        { name: 'Avo Azure', code: 'RM' }
    ];
    const workItems = [
        { name: 'Story', code: 'NY' },
        { name: 'Testplans', code: 'RM' }
    ];
    const testplans = [
        { name: 'test1', code: 'NY' },
        { name: 'test2', code: 'RM' }
    ];

    //tree data///////////////////

    const data = [
        { id: 1, label: 'Item 1' },
        { id: 2, label: 'Item 2' },
        { id: 3, label: 'Item 3' },
        { id: 4, label: 'Item 4' },
        { id: 5, label: 'Item 5' },
    ];

    useImperativeHandle(ref, () => ({
        callSaveButton,
        callViewMappedFiles
      })); 

    // const [data, setData] = useState([

    //     {

    //         key: "grandparent1",

    //         label: "Grandparent 1",

    //         children: [

    //             {

    //                 key: "parent1",

    //                 label: "Parent 1",

    //                 children: [

    //                     {

    //                         key: "children1",

    //                         label: "Children 1",

    //                         children: [

    //                             { key: "child1", label: "Child 1" },

    //                             { key: "child2", label: "Child 2" },

    //                         ],

    //                     }
    //                 ],

    //             },

    //         ],

    //     },

    //     {

    //         key: "grandparent2",

    //         label: "Grandparent 2",

    //         children: [

    //             {

    //                 key: "parent2",

    //                 label: "Parent 2",

    //                 children: [

    //                     {

    //                         key: "children1",

    //                         label: "Children 1",

    //                         children: [

    //                             { key: "child1", label: "Child 1" },

    //                             { key: "child2", label: "Child 2" },

    //                         ],

    //                     }
    //                 ],

    //             },

    //         ],

    //     },

    // ]);

    const avotestcases = [

        {

            key: "screnario1",

            label: "Scenario 1",

            children: [

                { key: "testCase1", label: "Testcase 1" },

                { key: "testCase2", label: "Testcase 2" },

            ],

        },

        {

            key: "screnario2",

            label: "Scenario 2",

            children: [

                { key: "testCase3", label: "Testcase 3" },

                { key: "testCase4", label: "Testcase 4" },

            ],

        }

    ]

    const handleTabChange = (index) => {
        setActiveIndex(index);
    };
    // const handleWorkItemChange = (e) => {
    //     setSelectedWorkItem(e.value);

    //     // If "testplans" is selected, reset the selectedTestPlan state to null
    //     if (e.value.name === 'Testplans') {
    //         setSelectedtestplan(null);
    //     }
    // };

    //////////////////////////////////////// left side tree/////////////////////////////////////

    const onCheckboxChange = (nodeKey) => {
        const nodeIndex = selectedNodes.indexOf(nodeKey);
        const newSelectedNodes = [];
        if (nodeIndex !== -1) {
            newSelectedNodes.splice(nodeIndex, 1);
        } else {
            newSelectedNodes.push(nodeKey);
        }
        setSelectedNodes(newSelectedNodes);
        dispatchAction(selectedScenarioIds(newSelectedNodes));
    }

    const TreeNodeCheckbox = (node) => {
        if (node.data.type === 'scenario') {
            return (
                <div style={{ width: '100%' }}>
                    <Checkbox
                        checked={selectedNodes.includes(node.key)}
                        onChange={() => onCheckboxChange(node.key)}
                    />
                    <span className="scenario_label">{node.label} </span>
                    {
                        node.checked && <i className="pi pi-times unmap_icon" style={{ float: 'right' }} onClick={() => handleUnSync(node)}></i>
                    }

                </div>)
        }
        else if (node.data.type === 'testcase') {
            return (
                <div style={{ width: '100%' }}>
                    <span>{node.label} </span>
                    {/* <i className="pi pi-times" style={{ float: 'right'}} ></i> */}
                </div>
            )
        }
    };


    const handleClick = (isChecked, value, summary) => {
        if (isChecked) {
            let newSelectedTCDetails = { ...selectedZTCDetails };
            let newSelectedTC = isChecked ? [value, summary] : [];
            console.log(newSelectedTC);
            setSelected(value)
            setSelectedId(value)
            setSelectedSummary(summary)
            setDisabled(true)
            dispatchAction(selectedTCReqDetails(newSelectedTCDetails));
            dispatchAction(syncedTestCases([]));
            dispatchAction(selectedTestCase(newSelectedTC));
        }
        else {
            let newSelectedTCDetails = { ...selectedZTCDetails };
            setSelected('')
            setSelectedId('')
            setSelectedSummary('')
            setDisabled(true)
            dispatchAction(selectedTCReqDetails(newSelectedTCDetails));
            dispatchAction(syncedTestCases([]));
            dispatchAction(selectedTestCase([]));
        }
    }


    const handleUnSync = async (node) => {
        let unSyncObj = [];
        if (Object.keys(node).length) {
            let findMappedId = viewMappedFiles.filter((item) => item.testscenarioid === node.key);
            if (findMappedId && findMappedId.length) {
                unSyncObj.push({
                    'mapid': findMappedId[0]._id,
                    'testCaseNames': [].concat(secondOption && secondOption.name === 'Story' ? findMappedId[0].userStoryId : findMappedId[0].TestSuiteId ),
                    'testid': [].concat(null),
                    'testSummary': [].concat(null)
                })
                let args = Object.values(unSyncObj);
                args['screenType'] = selectedscreen.name === 'Azure DevOps' ? 'Azure': selectedscreen.name ;
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

            let unsyncMap = treeData.map((item) => item.key == node.key ? { ...item, checked: false, children: [] } : item);
            let unsyncMappedData = mappedData.filter((item) => item.scenarioId[0] !== node.key);
            setTreeData(unsyncMap);
            dispatchAction(mappedTree(unsyncMap));
            dispatchAction(mappedPair(unsyncMappedData));
        }
    }

    const handleCheckboxChange = (e, id) => {
        setCheckedItems(prevState => ({
            ...prevState,
            [id]: e.checked
        }));
    };

    const onProjectChange = async (e) => {
        e.preventDefault();
        // dispatchAction(selectedProject(e.value));
        getProjectScenarios();
        setDisableIssue(false);
        console.log(e.target.value, ' project e');
        setSelectedProject(e.value);
        // const releaseId = e.target.value;
        // const projectScenario = await api.getAvoDetails("6440e7b258c24227f829f2a4");
        // if (projectScenario.error)
        //     setToast("error", "Error", projectScenario.error);
        // else if (projectScenario === "unavailableLocalServer")
        //     setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
        // else if (projectScenario === "scheduleModeOn")
        //     setToast("error", "Error", MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
        // else if (projectScenario === "Invalid Session") {
        //     setToast("error", "Error", 'Invalid Session');
        // }
        // else if (projectScenario && projectScenario.avoassure_projects && projectScenario.avoassure_projects.length) {
        //     // setProjectDetails(projectScenario.project_dets);
        //     setAvoProjectsList(projectScenario.avoassure_projects);
        //     setAvoProjects(projectScenario.avoassure_projects.map((el, i) => { return { label: el.project_name, value: el.project_id, key: i } }));
        //     // onAvoProjectChange(reduxDefaultselectedProject.projectId);
        // }
    }

    // useEffect(() =>{getProjectScenarios()},[])

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
            setTreeData(treeData);
        }
    }

    const handleSecondOptionChange = async (event) => {
        setSecondOption(event.value);
        setTestSuites([]);
        setStoriesToDisplay([]);
        setTestsToDisplay([]);
        setCurrentPage(0);
        setTotalRecords(0)
      if (event.value.name === 'TestPlans') {  
          setUserStories([]);
          let azureLogin = {
            "baseurl": AzureLoginDetails.url,"username": AzureLoginDetails.username,"pat": AzureLoginDetails.password
        }
        let projectData = {
            'projectdetails':selectedProject
        }
          let apiObj = Object.assign({"action": 'azureTestPlans'},azureLogin,projectData);
          const getTestplans = await api.connectAzure_ICE(apiObj);
          if(getTestplans && getTestplans.testplans && getTestplans.testplans.length){
            setTestPlansDropdown(getTestplans.testplans);
          }
          setIsShowTestplan(true);
          setShowCustmBtn(false);
      }
      else if (event.value.name === 'Story') {
          setTestPlansDropdown([]);
          setSelectedTestplan('');
          setIsShowTestplan(false);
          getWorkItems(event.value.name);
      }
  };


  const getWorkItems = async (e) => {
    setShowCustmBtn(true);
    let azureLogin = {
        "baseurl": AzureLoginDetails.url,"username": AzureLoginDetails.username,"pat": AzureLoginDetails.password
    }
    let projectData = {
        'projectdetails':selectedProject
    }
    let apiObj = Object.assign({"action":"azureUserStories" },azureLogin,projectData,{'skip':e.skip || 0});
    const workItemsDetails = await api.connectAzure_ICE(apiObj);
    if(workItemsDetails && workItemsDetails.userStories){
        const updateUserStory = workItemsDetails.userStories.map((item) => ({ ...item, checked: false }));
        const newArray = userStories.concat(updateUserStory)
        setUserStories(newArray);
        setStoriesToDisplay(workItemsDetails.userStories.slice(0,9));
        if(e && e.currPage){
            const startIndex = e.currPage * recordsPerPage;
            const endIndex = startIndex + recordsPerPage;
            setStoriesToDisplay(newArray.slice(startIndex,endIndex));
        }
        setTotalRecords(workItemsDetails.total_count)
        // setIsShowPagination(true);
        // setTotalStoriesCount(workItemsDetails.total_count)
    }
}

const testcaseCheck = (e, checkboxIndex) => {
    if (checkboxIndex >= 0) {
        if(secondOption && secondOption.name  === 'TestPlans' && testsToDisplay.length){
            const setObjValue = testsToDisplay.map((item) => ({ ...item, checked: false }));
            const updatedData = setObjValue.map((item, idx) => idx === checkboxIndex ? { ...item, checked: e.checked } : item)
            setTestsToDisplay(updatedData);
        }
        if(secondOption && secondOption.name === 'Story' && userStories.length){
            const setObjValue = userStories.map((item) => ({ ...item, checked: false }));
            const updatedData = setObjValue.map((item, idx) => idx === checkboxIndex ? { ...item, checked: e.checked } : item)
            setUserStories(updatedData);
        }
        
    }
}

const handleSync = () => {
    let popupMsg = false;
    let filterProject = projectDetails.filter(el => el.id === selectedProject.id)[0];
    console.log(selectedProject,' its selectedProject');
    // let releaseId = issueTypes.filter(el => el.value === currentIssue)[0]['label'];
    if (selectedScIds.length === 0) {
        popupMsg = MSG.INTEGRATION.WARN_SELECT_SCENARIO;
    }
    else if (selectedId === '') {
        popupMsg = MSG.INTEGRATION.WARN_SELECT_TESTCASE;
    }
    else if (selectedId === selectedId && selectedScIds.length > 1) {
        popupMsg = MSG.INTEGRATION.WARN_MULTI_TC_SCENARIO;
    }

    if (popupMsg) setMsg(popupMsg);
    else {
        const mappedPairObj = [...mappedData,
        {
                scenarioId: selectedScIds,
                projectId: filterProject.id, 
                projectName: filterProject.name,        
                // testId: selectedId,
                // testCode: selected,
                [secondOption.name  === 'Story' ?'userStoryId':'TestSuiteId']:selectedTC[0] || '', 
                itemType:secondOption.name  === 'Story' ? 'UserStory' : 'TestSuite' ,
                [secondOption.name  === 'Story' ?'userStorySummary':'testSuiteSummary']:selectedTC[1] || ''
        }
        ];
        dispatchAction(mappedPair(mappedPairObj));
        if(secondOption && secondOption.name  === 'TestPlans'){
            const filterTestCase = testsToDisplay.filter((testCase) => testCase.id == selectedId).map(el => ({ key: el.id, label: el.name, data: { type: 'testcase' } }))
        // checking the current map obj is already present with any other scenario
        const findDuplicate = treeData.map((parent, index) => {
            const duplicateChildIndex = parent.children.findIndex(
                (child) => child.key === selectedTC[0]
            );
            if (duplicateChildIndex !== -1) {
                // Remove the duplicate child from the parent's children array
                return { ...parent, checked: false, children: [] };
            }
            else {
                return parent;
            }
        });
        let updatedTreeData = findDuplicate.map((scenario) => scenario.key == selectedScIds[0] ? { ...scenario, checked: true, children: filterTestCase } : scenario)
        setTreeData(updatedTreeData);
        dispatchAction(mappedTree(updatedTreeData));
        const updateCheckbox = testsToDisplay.map((item) => ({ ...item, checked: false }));
        setTestsToDisplay(updateCheckbox);
        dispatchAction(syncedTestCases(selected));
        setSelectedNodes([]);
        dispatchAction(selectedScenarioIds([]));
        }
        if(secondOption && secondOption.name  === 'Story'){
            const filterTestCase = userStories.filter((testCase) => testCase.id == selectedId).map(el => ({ key: el.id, label: el.id +' '+ el.fields['System.Title'], data: { type: 'testcase' } }))
        // checking the current map obj is already present with any other scenario
        const findDuplicate = treeData.map((parent, index) => {
            const duplicateChildIndex = parent.children.findIndex(
                (child) => child.key === selectedTC[0]
            );
            if (duplicateChildIndex !== -1) {
                // Remove the duplicate child from the parent's children array
                return { ...parent, checked: false, children: [] };
            }
            else {
                return parent;
            }
        });
        let updatedTreeData = findDuplicate.map((scenario) => scenario.key == selectedScIds[0] ? { ...scenario, checked: true, children: filterTestCase } : scenario)
        setTreeData(updatedTreeData);
        dispatchAction(mappedTree(updatedTreeData));
        const updateCheckbox = userStories.map((item) => ({ ...item, checked: false }));
        setUserStories(updateCheckbox);
        dispatchAction(syncedTestCases(selected));
        setSelectedNodes([]);
        dispatchAction(selectedScenarioIds([]));
        }
    }
    setDisabled(false);
}

const callViewMappedFiles=async(saveFlag)=>{
    try{
        const response = await api.viewAzureMappedList_ICE('6440e7b258c24227f829f2a4');
        if (response.error){
            setToast('error','Error',response.error);
        }
        else if(response === 'fail'){
            setToast('error','Error','failed to fetch mapped details');
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
                mappedTests = mappedTests + 1;
                tempRow.push({
                    'testCaseNames': object.itemType === "UserStory" ? object.userStoryId : object.TestSuiteId, 
                    'scenarioNames': object.testscenarioname,
                    'mapId': object._id,
                    'scenarioId': object.testscenarioid,
                    'testid':object.itemId,
                    'itemSummary': object.itemType === "UserStory" ? object.userStorySummary : object.testSuiteSummary
                });
            });
            setCounts({
                totalCounts: totalCounts,
                mappedScenarios: mappedScenarios,
                mappedTests: mappedTests
            });
            setRows(tempRow);
        }
        else if(response !== 'fail'){
            setRows([]);
            setCounts({
                totalCounts: 0,
                mappedScenarios: 0,
                mappedTests: 0
            });
        } 
    }
    catch(err) {
        setToast('error','Error',MSG.INTEGRATION.ERR_FETCH_DATA.CONTENT);
    }
}

const callSaveButton =async()=>{
    console.log(' mappedData ',mappedData); 
    const response = await api.saveAzureDetails_ICE(mappedData);
    console.log(response,' its response');
    if (response.error){
        setToast('error','Error',response.error);
    }
    else if (response == 'fail'){
        setToast('error','Error','failed to save');
    }
    else if(response === "unavailableLocalServer")
        setToast('error','Error',MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
    else if(response === "scheduleModeOn")
        setToast('error','Error',MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
    else if ( response === "success"){
        console.log('inside suc');
        setToast('success','Success',MSG.INTEGRATION.SUCC_SAVE.CONTENT);
        callViewMappedFiles()
    }
    setDisabled(true)
    setSelected(false)
    }

    const handleTestSuite = async (event) => {
        if(event.target.value){
            setSelectedTestplan(event.target.value);
            setTestsToDisplay([]);
            setTestSuites([]);
            let azureLogin = {
                "baseurl": AzureLoginDetails.url,"username": AzureLoginDetails.username,"pat": AzureLoginDetails.password
            }
            let projectData = {
                'projectdetails':selectedProject
            }
            let apiObj = Object.assign({"action": 'azureTestSuites'},azureLogin,{"testplandetails":{"id":parseInt(event.target.value.id) || ''}},projectData);
            const getTestSuites = await api.connectAzure_ICE(apiObj);
            if(getTestSuites && getTestSuites.testsuites && getTestSuites.testsuites.length){
                const updateCheckbox = getTestSuites.testsuites.map((item) => ({ ...item, checked: false }));
                setTestSuites(updateCheckbox);
                setTestsToDisplay(updateCheckbox);
                setTotalRecords(getTestSuites.testsuites.length);
                // setIsShowPagination(true);
            }
        }
  }
    


    return (
        <>
            <div>
                <div className="tab__cls">
                    <TabView activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
                        <TabPanel header="Mapping">
                            <div className="data__mapping">
                                <div className="card_Azure1">
                                    <Card className="mapping_data_card_azure">
                                        <div className="dropdown_div">
                                            <div className="dropdown-map_azure">
                                                <span>Select Project <span style={{ color: 'red' }}>*</span></span>
                                                <span className={ selectedWorkItem && selectedWorkItem.name === 'Testplans' ? "release_span1" : "release_span21"}> Select Workitems<span style={{ color: 'red', left: '3rem' }}>*</span></span>
                                                {secondOption && secondOption.name === 'TestPlans' && (
                                                    <span className="release_span2"> Select Testplans<span style={{ color: 'red' }}>*</span></span>)}

                                            </div>
                                            <div className="dropdown-map_azure">
                                                <Dropdown value={selectedProject} onChange={(e) => onProjectChange(e)} options={projectDetails} optionLabel="name"
                                                    placeholder="Select Project" style={{ width: '11rem', height: '2.5rem' }} className="dropdown_project1" />
                                                <Dropdown value={secondOption} onChange={(e) => handleSecondOptionChange(e)} options={issueTypes} optionLabel="name"
                                                    placeholder="Select Project" style={{ width: '11rem', height: '2.5rem' }} className="dropdown_release1" />
                                                {secondOption && secondOption.name === 'TestPlans' && (
                                                    <Dropdown value={selectedTestplan} onChange={(e) => handleTestSuite(e)} options={testPlansDropdown} optionLabel="name"
                                                        placeholder="Select Project" style={{ width: '11rem', height: '2.5rem' }} className="dropdown_release2" />)}
                                            </div>
                                        </div>
                                        {secondOption && selectedProject && (
                                            <div>

                                            <div className="tree_data_card1">
                                                {userStories && userStories.length && userStories.map((item,i) => (
                                                    <div key={item.id} className="azure__data__div">
                                                        <Checkbox
                                                            inputId={`${item.id}`}
                                                            checked={item.checked}
                                                            // onChange={(e) => handleCheckboxChange(e, item.id)}
                                                            onChange={(e) =>{testcaseCheck(e, i); handleClick(e.checked, item.id,item.fields['System.Title'])}}
                                                        />
                                                        <label className="azure__name">{item.id} {item.fields['System.Title']}</label>
                                                    </div>
                                                ))}
                                                {testsToDisplay && testsToDisplay.length && testsToDisplay.map((item,i) => (
                                                    <div key={item.id} className="azure__data__div">
                                                        <Checkbox
                                                            inputId={`${item.id}`}
                                                            checked={item.checked}
                                                            // onChange={(e) => handleCheckboxChange(e, item.id)}
                                                            onChange={(e) => {testcaseCheck(e, i);handleClick(e.checked, item.id, item.name);}}
                                                        />
                                                        <label className="azure__name">{item.name}</label>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* <div className="azure_paginator">
                                            <Paginator
                                            first={first}
                                            rows={itemsPerPage}
                                            totalRecords={totalRecords}
                                            onPageChange={onPageChange}
                                            rowsPerPageOptions={[5, 10, 20]} // Customize the rows per page options as needed
                                          /> */}
                                          </div>
                                        
                                        )}
                                    </Card>
                                </div>


                                <div>
                                    <div className="card_Azure2">
                                        <Card className="mapping_data_card_azure">
                                            <div className="dropdown_div">
                                                <div className="dropdown-map">
                                                    <span>Select Project <span style={{ color: 'red' }}>*</span></span>
                                                </div>
                                                <div className="dropdown-map">
                                                    {/* <Dropdown  style={{ width: '11rem', height: '2.5rem' }}  className="dropdown_project" value={selectedCity} onChange={(e) => setSelectedCity(e.value)} options={cities}  placeholder="Select Project" /> */}
                                                    {/* <Dropdown value={selectedCity} onChange={(e) => (e.value)} options={cities} optionLabel="name"
                                                        placeholder="Select Project" style={{ width: '11rem', height: '2.5rem' }} className="dropdown_project" /> */}
                                                    <span className="selected_projName" title={reduxDefaultselectedProject.projectName}>{reduxDefaultselectedProject.projectName}</span>
                                                </div>

                                                <div className="avotest__data">

                                                    <Tree value={treeData} selectionMode="single" selectionKeys={selectedAvoKeys} onSelectionChange={(e) => setSelectedAvoKeys(e.value)} nodeTemplate={TreeNodeCheckbox} className="avoProject_tree" />
                                                </div>
                                            </div>
                                            {/* {
                                                                selectedAvoproject ?
                                                                listofScenarios.map((e,i)=> (<div
                                                                    key={i}
                                                                    className={"scenario__listItem"}
                                                                    title={e.name}
                                                                    // onClick={(event) => { selectScenarioMultiple(event, e._id); }}
                                                                >
                                                                    {e.name}
                                                                </div>))
                                                                     :
                                                                    null

                                                            } */}
                                        </Card>
                                    </div>
                                </div>
                                <span> <Button label="Map" size="small" className="map_icon_cls" onClick={handleSync}></Button></span>
                            </div>

                        </TabPanel>

                        <TabPanel header="View Mapping">
                            <div className="card2_viewmap">
                                <Card className="view_map_card">
                                    <div className="flex justify-content-flex-start toggle_btn">
                                        <span>Azure DevOps Testcase to Avo Assure Testcase</span>
                                        <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                                        <span>Avo Assure Testcase to Azure DevOps Testcase</span>
                                    </div>

                                    {checked ? (<div className="accordion_testcase">
                                        <Accordion multiple activeIndex={0} >
                                            {rows.map((item) => (
                                                <AccordionTab header={item.scenarioNames[0]}>
                                                    <span>{item.itemSummary}</span>
                                                </AccordionTab>))}
                                        </Accordion>
                                    </div>

                                    ) : (

                                        <div className="accordion_testcase">
                                            <Accordion multiple activeIndex={0}>
                                                {rows.map((item) => (
                                                    <AccordionTab header={item.itemSummary}>
                                                        <span>{item.scenarioNames[0]}</span>
                                                    </AccordionTab>))}
                                            </Accordion>
                                        </div>
                                    )}
                                </Card>
                            </div>

                        </TabPanel>                          
                    </TabView>
                </div>


            </div>


        </>
    )
}

export default forwardRef(AzureContent);
