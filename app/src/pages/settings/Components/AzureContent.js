import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
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
import {
    resetIntergrationLogin, resetScreen, selectedProject,
    selectedIssue, selectedTCReqDetails, selectedTestCase,
    syncedTestCases, mappedPair, selectedScenarioIds,
    selectedAvoproject, mappedTree,enableSaveButton
} from '../settingSlice';
import { Toast } from "primereact/toast";
import { Paginator } from 'primereact/paginator';


const AzureContent = ({ setToast, issueTypes, projectDetails, selectedNodes, setSelectedNodes, activeIndex, setActiveIndex, setFooterIntegrations, callAzureSaveButton, showLogin }, ref) => {
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
    // const [activeIndex, setActiveIndex] = useState(0);
    const [checked, setChecked] = useState(false);
    const [checkedAvo, setCheckedAvo] = useState(false);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [selectedAvoKeys, setSelectedAvoKeys] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [secondOption, setSecondOption] = useState('');
    const [testSuites, setTestSuites] = useState([]);
    const [storiesToDisplay, setStoriesToDisplay] = useState([])
    const [testsToDisplay, setTestsToDisplay] = useState([])
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [userStories, setUserStories] = useState([]);
    const [testPlansDropdown, setTestPlansDropdown] = useState([]);
    const [isShowTestplan, setIsShowTestplan] = useState(false);
    const [showCustmBtn, setShowCustmBtn] = useState(true);
    const [selectedTestplan, setSelectedTestplan] = useState('');
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
    const [pageLimit, setPageLimit] = useState(['1-100'])
    const [skipItem, setSkipItem] = useState(0)
    const [isLastPage, setIsLastPage] = useState(false);
    const [isShowPagination, setIsShowPagination] = useState(false)
    const [skipRecord, setSkipRecord] = useState(0)
    const [pageSize, setPageSize] = useState(100);
    const [enableBounce, setEnableBounce] = useState(false);
    const [counts, setCounts] = useState({
        totalCounts: 0,
        mappedScenarios: 0,
        mappedTests: 0
    });
    const [viewMappedFiles, setViewMappedFiles] = useState([]);
    const [currentAvoPage, setCurrentAvoPage] = useState(1);
    const scenariosPerPage = 10;
    const [indexOfFirstScenario, setIndexOfFirstScenario] = useState(0);
    const [completeTreeData, setCompleteTreeData] = useState([]);
    const [isShowPaginationAvo, setIsShowPaginationAvo] = useState(false);
    const [saveEnable, setSaveEnable] = useState(false);
    const [selectedLeftNodes, setselectedLeftNodes] = useState([]);
    const [currentTestPlan,setCurrentTestPlan] = useState([]);
    const [newtestSuites, setNewTestSuites] = useState([]);
    const [testCases, setTestCases] = useState([]);
    const [checkedTestcase,setCheckedTestcase] = useState({})
    const dropdownRef = useRef();
////////////////////////////////Paginator for Test plans///////////////////////////////////////

const [currentPageTestPlan, setCurrentPageTestPlan] = useState(1);
const itemsPerPageTestPlan = 10; 
const totalRecordsTestPlan = testPlansDropdown.length;


const totalPagesTestPlan = Math.ceil(totalRecordsTestPlan.length / itemsPerPageTestPlan);

const handlePageChangeTestPlan = (e) => {
    setCurrentPageTestPlan(e.page + 1); // Page numbers are 1-based
  };
const startIdx = (currentPageTestPlan - 1) * itemsPerPageTestPlan;
const endIdx = startIdx + itemsPerPageTestPlan;

const paginatedDataTestPlan = testPlansDropdown.slice(startIdx, endIdx);


    useImperativeHandle(ref, () => ({
        callSaveButton,
        callViewMappedFiles
    }));    

       
    const handleTabChange = (index) => {
        setActiveIndex(index);
    };
    
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
                    'testCaseNames': [].concat(secondOption && secondOption.name === 'Story' ? findMappedId[0].userStoryId : findMappedId[0].TestSuiteId),
                    'testid': [].concat(null),
                    'testSummary': [].concat(null)
                })
                let args = Object.values(unSyncObj);
                args['screenType'] = selectedscreen.name === 'Azure DevOps' ? 'Azure' : selectedscreen.name;
                const saveUnsync = await api.saveUnsyncDetails(args);
                if (saveUnsync.error) {
                    setToast("error", "Error", 'Failed to Unsync');
                }
                else if (saveUnsync === "unavailableLocalServer") {
                    setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
                    return
                }
                else if (saveUnsync === "scheduleModeOn") {
                    setToast("info", "Info", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
                    return
                }
                else if (saveUnsync === "fail") {
                    setToast("error", "Error", MSG.INTEGRATION.ERR_SAVE.CONTENT);
                    return
                }
                else if (saveUnsync == "success") {
                    callViewMappedFiles()
                    setToast("success", "Success", 'Mapped data unsynced successfully');
                }

            }

            let unsyncMap = completeTreeData.map((item) => item.key == node.key ? { ...item, checked: false, children: [] } : item);
            let unsyncMappedData = mappedData.filter((item) => item.scenarioId[0] !== node.key);
            setTreeData(unsyncMap.slice(indexOfFirstScenario, indexOfFirstScenario + scenariosPerPage));
            // setTreeData(unsyncMap);
            setCompleteTreeData(unsyncMap);
            dispatchAction(mappedTree(unsyncMap));
            dispatchAction(mappedPair(unsyncMappedData));
        }
    }

    const handleUnSyncmappedData = async (items) =>{
        let unSyncObj = [];
        if (Object.keys(items).length) {
            // let findUnsyncedObj = mappedData.filter((item) =>  item.scenarioId[0] === node.key);
            // const scenriodId = item.find((row) => row.scenarioId);
            let findMappedId = viewMappedFiles.filter((item) => item.testscenarioid === items.scenarioId);
            if (findMappedId && findMappedId.length) {
                unSyncObj.push({
                    'mapid': findMappedId[0]._id,
                    'testCaseNames': [].concat(findMappedId[0].itemType==="UserStory" ? findMappedId[0].userStoryId : findMappedId[0].TestSuiteId),
                    'testid': [].concat(null),
                    'testSummary': [].concat(null)
                })
                let args = Object.values(unSyncObj);
                args['screenType'] = selectedscreen.name === 'Azure DevOps' ? 'Azure' : selectedscreen.name;
                const saveUnsync = await api.saveUnsyncDetails(args);
                if (saveUnsync.error)
                    setToast("error", "Error", 'Failed to Unsync'); 
				else if(saveUnsync === "unavailableLocalServer")
                    setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
				else if(saveUnsync === "scheduleModeOn")
                    setToast("info", "Info", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
				else if(saveUnsync === "fail")
                    setToast("error", "Error", MSG.INTEGRATION.ERR_SAVE.CONTENT);
				else if(saveUnsync == "success"){
                    // callViewMappedFiles()
                    setToast("success", "Success", "Mapped data unsynced successfully");
                }

            }

            let unsyncMap = completeTreeData.map((item) => item.key == items.scenarioId ? { ...item, checked: false, children: [] } : item);
            let unsyncMappedData = mappedData.filter((item) => item.scenarioId[0] !== items.scenarioId);
            let filteredRows=rows.filter(element=>element.mapId!==items.mapId)
            setTreeData(unsyncMap.slice(indexOfFirstScenario, indexOfFirstScenario+scenariosPerPage));
            // setTreeData(unsyncMap);
            setCompleteTreeData(unsyncMap);
            dispatchAction(mappedTree(unsyncMap));
            dispatchAction(mappedPair(unsyncMappedData));
            setRows(filteredRows)

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
        setTestPlansDropdown([]);
        setSecondOption('');
        setTreeData([]);
        // dispatchAction(selectedProject(e.value));
        getProjectScenarios();
        setDisableIssue(false);
        console.log(e.target.value, ' project e');
        setSelectedProject(e.value);
        setIsShowPagination(false);
        setIsShowPaginationAvo(true);
        setStoriesToDisplay([]);
        setTestsToDisplay([]);
        setCheckedTestcase({})
    }

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
        setTreeData([]);
        if (scnData.length) {
            let filterScns = scnData.filter(el => el.project_id === reduxDefaultselectedProject.projectId)[0]['scenario_details'] || [];
            setListofScenarios(filterScns);

            let treeData = selectedAvoproject
                ? filterScns.map((scenario) => ({
                    key: scenario._id,
                    label: scenario.name,
                    data: { type: 'scenario' },
                    checked: false,
                    children: mappedTreeList.length ? mappedTreeList.filter((mappedscn) => mappedscn.key === scenario._id)[0].children:[]
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

    const handleSecondOptionChange = async (event) => {
        setEnableBounce(true);
        setSecondOption(event.value);
        setTestSuites([]);
        setStoriesToDisplay([]);
        setTestsToDisplay([]);
        setCurrentPage(0);
        setTotalRecords(0)
        if (event.value.name === 'TestPlans') {
            setUserStories([]);
            let azureLogin = {
                "baseurl": AzureLoginDetails.url, "username": AzureLoginDetails.username, "pat": AzureLoginDetails.password
            }
            let projectData = {
                'projectdetails': selectedProject
            }
            let apiObj = Object.assign({ "action": 'azureTestPlans' }, azureLogin, projectData);
            const getTestplans = await api.connectAzure_ICE(apiObj);
            if (getTestplans && getTestplans.testplans && getTestplans.testplans.length) {
                const convertToTree = convertDataStructure(getTestplans.testplans);
                setTestPlansDropdown(convertToTree);
            }
            setIsShowTestplan(true);
            setShowCustmBtn(false);
            // setEnableBounce(false);
        }
        else if (event.value.name === 'Story') {
            setTestPlansDropdown([]);
            setSelectedTestplan('');
            setIsShowTestplan(false);
            getWorkItems(event.value.name);
            setEnableBounce(true);
        }
        setEnableBounce(false);
    };


    const getWorkItems = async (e) => {
        setShowCustmBtn(true);
        let azureLogin = {
            "baseurl": AzureLoginDetails.url, "username": AzureLoginDetails.username, "pat": AzureLoginDetails.password
        }
        let projectData = {
            'projectdetails': selectedProject
        }
        let apiObj = Object.assign({ "action": "azureUserStories" }, azureLogin, projectData, { 'skip': e.skip || 0 });
        const workItemsDetails = await api.connectAzure_ICE(apiObj);
        if (workItemsDetails && workItemsDetails.userStories) {
            const updateUserStory = workItemsDetails.userStories.map((item) => ({ ...item, checked: false }));
            const newArray = userStories.concat(updateUserStory);
            setUserStories(newArray);
            const startStoryIndex = (e.currPage ? e.currPage : 0) * recordsPerPage;
            const endStoryIndex = startStoryIndex + recordsPerPage;
            setStoriesToDisplay(newArray.slice(startStoryIndex, endStoryIndex));
            // setUserStories(updateUserStory);
            // setStoriesToDisplay(workItemsDetails.userStories.slice(0, 9));
            if (e && e.currPage) {
                const startIndex = e.currPage * recordsPerPage;
                const endIndex = startIndex + recordsPerPage;
                setStoriesToDisplay(newArray.slice(startIndex, endIndex));
            }
            setTotalRecords(workItemsDetails.total_count)
            setIsShowPagination(true);
            // setTotalStoriesCount(workItemsDetails.total_count)
        }
    }

    const testcaseCheck = (e, checkboxIndex) => {
        if (checkboxIndex >= 0) {
            if (secondOption && secondOption.name === 'TestPlans' && testsToDisplay.length) {
                const setObjValue = testsToDisplay.map((item) => ({ ...item, checked: false }));
                const updatedData = setObjValue.map((item, idx) => idx === checkboxIndex ? { ...item, checked: e.checked } : item)
                setTestsToDisplay(updatedData);
            }
            if (secondOption && secondOption.name === 'Story' && storiesToDisplay.length) {
                const setObjValue = storiesToDisplay.map((item) => ({ ...item, checked: false }));
                const updatedData = setObjValue.map((item, idx) => idx === checkboxIndex ? { ...item, checked: e.checked } : item)
                setStoriesToDisplay(updatedData);
            }

        }
    }

    const handleSync = () => {
        let popupMsg = false;
        let filterProject = projectDetails.filter(el => el.id === selectedProject.id)[0];
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
            let newmappedPair = secondOption.name === 'Story' ? {
                scenarioId: selectedScIds,
                projectId: filterProject.id,
                projectName: filterProject.name,
                // [secondOption.name === 'Story' ? 'userStoryId' : 'TestSuiteId']: selectedTC[0] || '',
                userStoryId:selectedTC[0] || '',
                itemType: 'UserStory',
                // [secondOption.name === 'Story' ? 'userStorySummary' : 'testSuiteSummary']: selectedTC[1] || ''
                userStorySummary:selectedTC[1] || ''
            } :  {
                scenarioId: selectedScIds,
                projectId: filterProject.id,
                projectName: filterProject.name,
                testid: [].concat(selectedId.toString()) || [],
                testname: [].concat(selectedTC[1]) || [],
                testPlanId:[].concat(checkedTestcase.testPlanId) || [],
                testSuiteId:[].concat(checkedTestcase.testSuiteId) || [],
                testPoints:checkedTestcase.testcase.points || [],
                itemType: 'TestCase',
                // testCaseSummary: selectedTC[1] || ''
            }

            const mappedPairObj = [...mappedData];
            mappedPairObj.push(newmappedPair);
            dispatchAction(mappedPair(mappedPairObj));
            if (secondOption && secondOption.name === 'TestPlans') {
                const filterTestCase = testCases.filter((testCase) => testCase.workItem.id == selectedId).map(el => ({ key: el.workItem.id, label: el.workItem.name, data: { type: 'testcase' } }))
                // checking the current map obj is already present with any other scenario
                const findDuplicate = completeTreeData.map((parent, index) => {
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
                setTreeData(updatedTreeData.slice(indexOfFirstScenario, indexOfFirstScenario + scenariosPerPage));
                setCompleteTreeData(updatedTreeData);
                dispatchAction(mappedTree(updatedTreeData));
                const updateCheckbox = testsToDisplay.map((item) => ({ ...item, checked: false }));
                setTestsToDisplay(updateCheckbox);
                dispatchAction(syncedTestCases(selected));
                setSelectedNodes([]);
                setselectedLeftNodes([]);
                dispatchAction(selectedScenarioIds([]));
            }
            if (secondOption && secondOption.name === 'Story') {
                const filterTestCase = userStories.filter((testCase) => testCase.id == selectedId).map(el => ({ key: el.id, label: el.id + ' ' + el.fields['System.Title'], data: { type: 'testcase' } }))
                // checking the current map obj is already present with any other scenario
                const findDuplicate = completeTreeData.map((parent, index) => {
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
                setTreeData(updatedTreeData.slice(indexOfFirstScenario, indexOfFirstScenario + scenariosPerPage));
                setCompleteTreeData(updatedTreeData);
                dispatchAction(mappedTree(updatedTreeData));
                const updateCheckbox = storiesToDisplay.map((item) => ({ ...item, checked: false }));
                setStoriesToDisplay(updateCheckbox);
                dispatchAction(syncedTestCases(selected));
                setSelectedNodes([]);
                dispatchAction(selectedScenarioIds([]));
            }
        }
        setDisabled(false);
        dispatchAction(enableSaveButton(true));
    }

    const callViewMappedFiles = async (saveFlag) => {
        try {
            const response = await api.viewAzureMappedList_ICE('6440e7b258c24227f829f2a4');
            if (response.error) {
                setToast('error', 'Error', response.error);
            }
            else if (response === 'fail') {
                setToast('error', 'Error', 'failed to fetch mapped details');
            }

            else if (response.length) {
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
                        'testid': object.itemId,
                        'itemSummary': object.itemType === "UserStory" ? object.userStorySummary : object.testSuiteSummary ? object.testSuiteSummary : object.testCaseSummary
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
        catch (err) {
            setToast('error', 'Error', MSG.INTEGRATION.ERR_FETCH_DATA.CONTENT);
        }
    }

    const callSaveButton = async () => {
        const response = await api.saveAzureDetails_ICE(mappedData);
        if (response.error) {
            setToast('error', 'Error', response.error);
        }
        else if (response == 'fail') {
            setToast('error', 'Error', 'failed to save');
        }
        else if (response === "unavailableLocalServer")
            setToast('error', 'Error', MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
        else if (response === "scheduleModeOn")
            setToast('error', 'Error', MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
        else if (response === "success") {
            console.log('inside suc');
            setToast('success', 'Success', MSG.INTEGRATION.SUCC_SAVE.CONTENT);
            callViewMappedFiles()
        }
        setDisabled(true)
        setSelected(false)
    }

    const handleTestSuite = async (event) => {
        if (event.target.value) {
            setSelectedTestplan(event.target.value);
            setTestsToDisplay([]);
            setTestSuites([]);
            let azureLogin = {
                "baseurl": AzureLoginDetails.url, "username": AzureLoginDetails.username, "pat": AzureLoginDetails.password
            }
            let projectData = {
                'projectdetails': selectedProject
            }
            let apiObj = Object.assign({ "action": 'azureTestSuites' }, azureLogin, { "testplandetails": { "id": parseInt(event.target.value.id) || '' } }, projectData);
            const getTestSuites = await api.connectAzure_ICE(apiObj);
            if (getTestSuites && getTestSuites.testsuites && getTestSuites.testsuites.length) {
                const updateCheckbox = getTestSuites.testsuites.map((item) => ({ ...item, checked: false }));
                setTestSuites(updateCheckbox);
                setTestsToDisplay(updateCheckbox);
                setTotalRecords(getTestSuites.testsuites.length);
                setIsShowPagination(true);
            }
        }
        setEnableBounce(false);
    }

    function convertDataStructure(input) {
        // let output = [];
      
        // input.forEach((item) => {
        //   let cycle = {
        //     key: item.id,
        //     label: item.name,
        //     children: [{}],
        //     checked: false
        //   };
      
        //   output.push(cycle);
        // });
    const modifiedArr = input.map(item => ({
        ...item,
        key: item.id,
        label: item.name,
        children: [].concat({
            key:  item.rootSuite.id || '',
            label: item.rootSuite.name || '',
            type:'testplan',
            children:[{}]
        }),
        checked: false
    }));
        return modifiedArr;
      }


    const onPageChange = async (e) => {
        setCurrentPage(e.page);
        setSkipItem(e.first);
        setEnableBounce(true);
        if (secondOption.name === 'Story') {
            checkPaginator(e);
        }
        const isLastPage = e.page === Math.ceil(totalRecords / recordsPerPage) - 1;
        setIsLastPage(isLastPage);
        const startIndex = e.page * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        secondOption.name === 'Story' ? setStoriesToDisplay(userStories.slice(startIndex, endIndex)) : setTestsToDisplay(testSuites.slice(startIndex, endIndex));
        // if(e.page%10 === 0 && e.page !== 0){
        //     let azureLogin = {
        //         "baseurl": AzureLoginDetails.url, "username": AzureLoginDetails.username, "pat": AzureLoginDetails.password
        //     }
        //     let projectData = {
        //         'projectdetails': selectedProject
        //     }
        //     let apiObj = Object.assign({ "action": "azureUserStories" }, azureLogin, projectData, { 'skip': parseInt(e.page/10+'00') });
        //     const workItemsDetails = await api.connectAzure_ICE(apiObj);
        //     if (workItemsDetails && workItemsDetails.userStories) {
        //         const updateUserStory = workItemsDetails.userStories.map((item) => ({ ...item, checked: false }));
        //         const newArray = userStories.concat(updateUserStory);
        //         secondOption.name === 'Story' ? setStoriesToDisplay(newArray.slice(startIndex, endIndex)) : setTestsToDisplay(testSuites.slice(startIndex, endIndex));
        //     }
        // }



        // const startStoryIndex = (e.currPage ? e.currPage : 0) * recordsPerPage;
        //     const endStoryIndex = startStoryIndex + recordsPerPage;
        //     setUserStories(updateUserStory.slice(startStoryIndex, endStoryIndex));
        // if(!(e.page%10 === 0 && e.page !== 0)) secondOption.name === 'Story' ? setStoriesToDisplay(userStories.slice(startIndex, endIndex)) : setTestsToDisplay(testSuites.slice(startIndex, endIndex));

    }

    const checkPaginator = (e) => {
        const findPageLimit = pageLimit[0].split('-');
        let pageNumber = (e.page + 1) * 10;
        if (pageNumber > userStories.length && pageNumber > parseInt(findPageLimit[1])) {
            let set_pagelimit = parseInt(findPageLimit[1]) + '-' + (parseInt(findPageLimit[1]) + pageSize);
            setPageLimit([set_pagelimit]);
            handlePrevNext('next', e.page)
        }
        if (pageNumber > userStories.length && pageNumber < parseInt(findPageLimit[0])) {
            let set_pagelimit = (parseInt(findPageLimit[0]) - pageSize) + '-' + parseInt(findPageLimit[0])
            setPageLimit([set_pagelimit]);
            handlePrevNext('prev', e.page)
        }
    }

    const handlePrevNext = (btnType, currPage) => {
        if (btnType === 'prev') {
            setSkipRecord(skipRecord - pageSize);
            getWorkItems({ skip: skipRecord - pageSize, currPage: currPage });
        }
        if (btnType === 'next') {
            setSkipRecord(skipRecord + pageSize);
            getWorkItems({ skip: skipRecord + pageSize, currPage: currPage });
        }

    }


const onPageAvoChange = (event) => {
    setCurrentAvoPage(event.page + 1);
    const indexOfLastScenario = (event.page + 1) * scenariosPerPage;
    setIndexOfFirstScenario(indexOfLastScenario - scenariosPerPage);
    setTreeData(completeTreeData.slice(indexOfLastScenario - scenariosPerPage, indexOfLastScenario));

  };



    const totalPages = Math.ceil(listofScenarios.length / scenariosPerPage);

    const handleNodeToggle = async (nodeobj) => {
        // setEnableBounce(true);
        console.log(nodeobj, ' its nodeobj');
        if(Object.keys(nodeobj).length && nodeobj.node && !isNaN(parseInt(nodeobj.node.key)) && nodeobj.node.type){
            setEnableBounce(true);
            if(nodeobj.node.type === "testplan"){
                let azureLogin = {
                    "baseurl": AzureLoginDetails.url, "username": AzureLoginDetails.username, "pat": AzureLoginDetails.password
                }
                let projectData = {
                    'projectdetails': selectedProject
                }
                let testPlandetails = testPlansDropdown.filter((item) => item.rootSuite.id === nodeobj.node.key);
                console.log(testPlandetails, ' its testPlandetails');
                let apiObj = Object.assign({ "action": 'azureTestSuites' }, azureLogin, projectData,{'testplandetails': testPlandetails[0]});
                const data = await api.connectAzure_ICE(apiObj);
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
                    if(data.testsuites.length){
                        updateChildrenData(testPlansDropdown,data.testsuites);
                        setNewTestSuites(data.testsuites);
                    }
                }
            }
            else if(nodeobj.node.type === "testsuite" && Object.keys(nodeobj.node.parentSuite).length > 0){
                let azureLogin = {
                    "baseurl": AzureLoginDetails.url, "username": AzureLoginDetails.username, "pat": AzureLoginDetails.password
                }
                let projectData = {
                    'projectdetails': selectedProject
                }
                let testPlandetails = testPlansDropdown.filter((item) => item.rootSuite.id === nodeobj.node.parentSuite.id);
                console.log(testPlandetails, ' its testPlandetails ',);
                let apiObj = Object.assign({ "action": 'azureTestCases' }, azureLogin, projectData,
                {'testsuitedetails': nodeobj.node},
                {'testplandetails': testPlandetails[0]}
                );
                const data = await api.connectAzure_ICE(apiObj);
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
                    
                    // if(data.testcases.length){
                        updateTestcaseChildren(testPlansDropdown,data.testcases,nodeobj.node.id);
                        setTestCases(data.testcases);
                    // }
                }
            }
            setEnableBounce(false);
        }
        setEnableBounce(false);
       
    }

    const updateTestcaseChildren = (testplans,testcases,suiteId) => {
        function processChildren(proChildren){
                proChildren.forEach((child,childIndex) => {
                    if(child.key === suiteId){
                        if(!testcases.length){
                            child.children = [];
                            child.children.push({msg:'no test case found'});
                        }
                        testcases.forEach((testcase) => {
                            child.children = child.children.filter((child) => Object.keys(child).length > 0);
                            let lngOfChildren = child.children.length;
                            if(lngOfChildren >= 0 && lngOfChildren < testcases.length){
                                child.children.push({
                                    ...testcase,
                                    key: testcase.workItem.id,
                                    label: testcase.workItem.name,
                                    type: 'testcase'
                                })
                            }
                        })
                       
                    }
                    else if(child.children && child.children.length){
                        processChildren(child.children);
                    }
                })
            
        }
        testplans.forEach((plan, planindex) => {
                processChildren(plan.children);
        })
    }

    
      

    const updateChildrenData = (testplans, testsuites) => {
        testplans.forEach((plan, planindex) => {
            testsuites.forEach((suite, suiteindex) => {
                if (suite.parentSuite && suite.parentSuite.id === plan.children[0].key) {
                    if (!plan.children[0].children) {
                        plan.children[0].children = [];
                    }
                    plan.children[0].children = plan.children[0].children.filter((child) => Object.keys(child).length > 0);
                   let lngOfChildren = plan.children[0].children.length;
                    if(lngOfChildren >= 0 && lngOfChildren < testsuites.length-1){
                        plan.children[0].children.push({
                            ...suite,
                            key: suite.id,
                            label: suite.name,
                            type: 'testsuite',
                            children: [{}]
                        })
                    }
                    
                }
            })
        })
    };


    const onLeftCheckboxChange = (nodeKey,parentObj) => {
        console.log(parentObj,' its something');
        const nodeIndex = selectedLeftNodes.indexOf(nodeKey.key);
        const newSelectedNodes = [];
        handleClick(nodeIndex ? true:false,nodeKey.key,nodeKey.label);
        if (nodeIndex !== -1) {
            newSelectedNodes.splice(nodeIndex, 1);
            setCheckedTestcase({})
        } else {
            newSelectedNodes.push(nodeKey.key);
            const currentCheckedObj = {
                testcase:nodeKey,
                testSuiteId:parentObj.props.parent.id,
                testPlanId:parentObj.props.parent.plan.id
            }
            setCheckedTestcase(currentCheckedObj);
        }
        setSelectedNodes(newSelectedNodes);
        setselectedLeftNodes(newSelectedNodes);
        
        // dispatchAction(selectedScenarioIds(newSelectedNodes));
    }
    const TreeNodeProjectCheckbox = (node,parentObj) => {
        if (node.children) {
            return (
                <div>
                    <span>{node.label}</span>
                </div>
            );
        } else {
            if(node.msg){
                return (
                    <div>
                        <span style={{color:'red'}}>{node.msg}</span>
                    </div>
                )
            }
            else{
                return (
                    <div>
                        <Checkbox
                            checked={selectedLeftNodes.includes(node.key)}
                            onChange={(e) => {
                                onLeftCheckboxChange(node,parentObj)
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
            
        }
    };


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
                                                <span className={secondOption && secondOption.name === 'TestPlans' ? "release_span21" : "release_span1"}> Select Work items<span style={{ color: 'red', left: '3rem' }}>*</span></span>
                                                {/* {secondOption && secondOption.name === 'TestPlans' && (
                                                    <span className="release_span2"> Select Testplans<span style={{ color: 'red' }}>*</span></span>)} */}

                                            </div>
                                            <div className="dropdown-map_azure">
                                                <Dropdown value={selectedProject} onChange={(e) => {onProjectChange(e);setSecondOption("")}} options={projectDetails} optionLabel="name"
                                                    placeholder="Select Project" style={{ width: '11rem', height: '2.5rem' }} className="dropdown_project1" />
                                                <Dropdown value={secondOption} disabled={disableIssue} onChange={(e) => handleSecondOptionChange(e)} options={issueTypes} optionLabel="name"
                                                    placeholder="Select Work Items" style={{ width: '11rem', height: '2.5rem' }} className="dropdown_release1" />
                                                {/* {secondOption && secondOption.name === 'TestPlans' && (
                                                    <Dropdown value={selectedTestplan} onChange={(e) => handleTestSuite(e)} options={testPlansDropdown} optionLabel="name"
                                                        placeholder="Select TestPlans" style={{ width: '11rem', height: '2.5rem' }} className="dropdown_release2" />)} */}
                                            </div>
                                        </div>
                                        {secondOption && selectedProject && (
                                            <div>

                                                <div className="tree_data_card1">
                                                    {storiesToDisplay && storiesToDisplay.length > 0 ? storiesToDisplay.map((item, i) => (
                                                        <div key={item.id} className="azure__data__div">
                                                            <Checkbox
                                                                inputId={`${item.id}`}
                                                                checked={item.checked}
                                                                // onChange={(e) => handleCheckboxChange(e, item.id)}
                                                                onChange={(e) => { testcaseCheck(e, i); handleClick(e.checked, item.id, item.fields['System.Title']) }}
                                                            />
                                                            <span className="azure__id" title={item.id}>{item.id}</span>
                                                            <span className="azure__name" title={item.fields['System.Title']}>{item.fields['System.Title'].trim().length > 50 ? item.fields['System.Title'].substr(0, 50) + "..." : item.fields['System.Title']}</span>
                                                        </div>
                                                    )) : enableBounce && <div className="bouncing-loader">
                                                        <div></div>
                                                        <div></div>
                                                        <div></div>
                                                    </div>}
                                                    <div>
                                                    <Tree
                                                        value={paginatedDataTestPlan}
                                                        selectionMode="single"
                                                        selectionKeys={selectedKeys}
                                                        onSelectionChange={(e) => setSelectedKeys(e.value)}
                                                        nodeTemplate={TreeNodeProjectCheckbox}
                                                        onExpand={handleNodeToggle}
                                                    />
                                                   
                                                    <div className="testplans__paginator">
                                                    <Paginator
                                                    first={currentPageTestPlan - 1}
                                                    rows={itemsPerPageTestPlan}
                                                    totalRecords={totalRecordsTestPlan}
                                                    onPageChange={handlePageChangeTestPlan}
                                                    totalPages={totalPagesTestPlan} // Set the totalPages prop
                                                />
                                                </div>
                                               
                                                   

                                                 </div>
                                                    {/* {testsToDisplay && testsToDisplay.length > 0 && testsToDisplay.map((item, i) => (
                                                        <div key={item.id} className="azure__data__div">
                                                            <Checkbox
                                                                inputId={`${item.id}`}
                                                                checked={item.checked}
                                                                // onChange={(e) => handleCheckboxChange(e, item.id)}
                                                                onChange={(e) => { testcaseCheck(e, i); handleClick(e.checked, item.id, item.name); }}
                                                            />
                                                            <span className="azure__id" title={item.id}>{item.id}</span>
                                                            <label className="azure__name" title={item.name}>{item.name.trim().length > 45 ? item.name.substr(0, 45) + "..." : item.name}</label>
                                                        </div>
                                                    ))} */}

                                                </div>

                                                {secondOption.name === 'Story' &&  isShowPagination && (
                                                    <div className="pagination-controls-container"><div className="pagination-controls"
                                                        style={{ display: (secondOption === 'Story' && userStories && !userStories.length) || (secondOption === 'TestPlans' && testSuites && !testSuites.length) ? 'none' : '' }}>
                                                        <Paginator
                                                            className='custom-paginator'
                                                            first={currentPage * recordsPerPage}
                                                            totalRecords={totalRecords}
                                                            rows={recordsPerPage}
                                                            pageLinkSize={8}
                                                            rowsPerPageOptions={[10, 20, 30]}
                                                            onPageChange={onPageChange}

                                                        />
                                                    </div></div>)}
                                            </div>

                                        )}
                                    </Card>
                                </div>


                                <div>
                                    <div className="card_Azure2">
                                        <Card className="mapping_data_card_azure">
                                            <div className="dropdown_div">
                                                <div className="dropdown-map">
                                                    <span>Project <span style={{ color: 'red' }}>*</span></span>
                                                </div>
                                                <div className="dropdown-map">
                                                    {/* <Dropdown  style={{ width: '11rem', height: '2.5rem' }}  className="dropdown_project" value={selectedCity} onChange={(e) => setSelectedCity(e.value)} options={cities}  placeholder="Select Project" /> */}
                                                    {/* <Dropdown value={selectedCity} onChange={(e) => (e.value)} options={cities} optionLabel="name"
                                                        placeholder="Select Project" style={{ width: '11rem', height: '2.5rem' }} className="dropdown_project" /> */}
                                                    <span className="selected_projName" title={reduxDefaultselectedProject.projectName}>{reduxDefaultselectedProject.projectName}</span>
                                                </div>

                                                <div>
                                                    {/* {currentScenarios.map((scenario) => ( */}
                                                        <div className="avotest__data__zephyr">

                                                            <Tree value={treeData} selectionMode="single" selectionKeys={selectedAvoKeys} onSelectionChange={(e) => setSelectedAvoKeys(e.value)} nodeTemplate={TreeNodeCheckbox} className="avoProject_tree" />
                                                        </div>
                                                    {/* ))} */}
                                                    <div className="testcase__AVO__paginator">
                                                  {isShowPaginationAvo && <Paginator
                                                        first={indexOfFirstScenario}
                                                        rows={scenariosPerPage}
                                                        totalRecords={listofScenarios.length}
                                                        onPageChange={onPageAvoChange}
                                                        />}
                                                        </div>
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
                                        <span>Azure DevOps Test case to Avo Assure Test case</span>
                                        <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                                        <span>Avo Assure Test case to Azure DevOps Test case</span>
                                    </div>

                                    {checked ? (<div className="accordion_testcase">
                                        <Accordion multiple activeIndex={0} >
                                            {rows.map((item) => (
                                                <AccordionTab header={<span>{item.scenarioNames[0]} <i className="pi pi-times cross_icon" onClick={() => handleUnSyncmappedData(item)}/></span>}>
                                                    <span>{item.itemSummary}</span>
                                                </AccordionTab>))}
                                        </Accordion>
                                    </div>

                                    ) : (

                                        <div className="accordion_testcase">
                                            <Accordion multiple activeIndex={0}>
                                                {rows.map((item) => (
                                                    <AccordionTab header={<span>{item.itemSummary} <i className="pi pi-times cross_icon" onClick={() => handleUnSyncmappedData(item)}/></span>}>
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
