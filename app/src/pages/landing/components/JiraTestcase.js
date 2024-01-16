import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useDispatch, useSelector } from 'react-redux';
import { RedirectPage, Messages as MSG, setMsg } from '../../global/index.js';
import * as api from '../../settings/api.js';
import { uploadgeneratefile, getall_uploadfiles } from '../../admin/api.js';
import { Toast } from "primereact/toast";
import { Paginator } from 'primereact/paginator';
import { Checkbox } from 'primereact/checkbox';
import axios from "axios";
import '../styles/jira.scss';
import LoginModal from "../../settings/Login/LoginModal.js";
import { ProgressSpinner } from 'primereact/progressspinner';
import {
    selectedProject, selectedIssue, selectedTCReqDetails, syncedTestCases, selectedTestCase, screenType,
    mappedTree, mappedPair, selectedScenarioIds, resetIntergrationLogin, resetScreen, selectedAvoproject
} from '../../settings/settingSlice.js';
//import AzureTestcase from "./azureTestcase";


const JiraTestcase = () => {
    const currentProject = useSelector(state => state.setting.selectedProject);
    const selectedscreen = useSelector(state => state.setting.screenType);
    const currentIssue = useSelector(state => state.setting.selectedIssue);
    const loginDetails = useSelector(state => state.setting.intergrationLogin);
    const selectedZTCDetails = useSelector(state => state.setting.selectedZTCDetails);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const mappedData = useSelector(state => state.setting.mappedPair);
    const mappedTreeList = useSelector(state => state.setting.mappedTree);
    const AzureLoginDetails = useSelector(state => state.setting.AzureLogin);
    // const enabledSaveButton = useSelector(state => state.setting.enableSaveButton);
    // const selectedAvo = useSelector(state => state.setting.selectedAvoproject);
    // const selectedScIds = useSelector(state => state.setting.selectedScenarioIds);

    //state
    const [counts, setCounts] = useState({
        totalCounts: 0,
        mappedScenarios: 0,
        mappedTests: 0
    })
    const [adoUserstories, setAdoUserstories] = useState([])
    const [user, setUser] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [items, setItems] = useState([])
    const [currentAvoPage, setCurrentAvoPage] = useState(1);
    const [authType, setAuthType] = useState("basic");
    const [activeIndex, setActiveIndex] = useState(0);
    const [completeTreeData, setCompleteTreeData] = useState([]);
    const [indexOfFirstScenario, setIndexOfFirstScenario] = useState(0);
    const [treeData, setTreeData] = useState([]);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [currentJiraPage, setCurrentJiraPage] = useState(1);
    const [disableIssue, setDisableIssue] = useState(true)
    const [showLoginCard, setShowLoginCard] = useState(true);
    const [visible, setVisible] = useState(true);
    const [hide, setHide] = useState("true")
    const [projectDetails, setProjectDetails] = useState([]);
    const [issueTypes, setIssueTypes] = useState([]);
    const [testCaseData, setTestCaseData] = useState([]);
    const [card2Data, setCard2Data] = useState([]);
    const [enableBounce, setEnableBounce] = useState(false);
    const [viewMappedFiles, setViewMappedFiles] = useState([]);
    const [selected, setSelected] = useState(false);
    const [rows, setRows] = useState([]);
    const [isSpin, setIsSpin] = useState(false);
    const [jsonuserstory, setJsonuserstory] = useState([]);
    const [responseMsg, setResponseMsg] = useState("");
    const dispatchAction = useDispatch();
    // const [fileDetails, setFileDetails] = useState([]);
    const [listofScenarios, setListofScenarios] = useState([]);
    const [completeTestCaseData, setCompleteTestCaseData] = useState([]);
    const [isShowConfirm, setIsShowConfirm] = useState(false);
    // const [checked, setChecked] = useState(false);
    const [selectedSummary, setSelectedSummary] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [avoProjectsList, setAvoProjectsList] = useState(null);
    const [avoProjects, setAvoProjects] = useState([]);
    const itemsPerPageJira = 5;
    const scenariosPerPage = 5;
    const azureRef = useRef(null);
    const toast = useRef(null);

    const showToast = (severity, summary, detail, life = 3000) => {
        toast.current.show({ severity, summary, detail, life });
    };
    //checkbox
    const [isChecked, setIsChecked] = useState(false);
    const ToastMessage = ({ message }) => (
        <Toast severity="success" life={3000}>
            {message}
        </Toast>
    );
    const handleIntegration = (value) => {
        dispatchAction(screenType(value));
        setAuthType('basic');
    }

    const callSaveButton = async () => {
        if (mappedData && mappedData.length) {
            const response = await api.saveJiraDetails_ICE(mappedData);
            if (response.error) {
                setToast("error", "Error", response.error);
            }
            else if (response === "unavailableLocalServer")
                setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
            else if (response === "scheduleModeOn")
                setToast("warn", "Warning", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
            else if (response === "success") {
                callViewMappedFiles('')
                setToast("success", "Success", 'Synced details saved successfully');
            }
        }
        else {
            setToast("info", "Info", 'Please sync atleast one map');
        }
    }

    const setToast = (tag, summary, msg) => {
        toast.current.show({ severity: tag, summary: summary, detail: msg, life: 10000 });
    }

    const testcaseCheck = (e, checkboxIndex) => {
        if (checkboxIndex >= 0 && checkboxIndex < testCaseData.length) {
            const setObjValue = testCaseData.map((item) => ({ ...item, checked: false }));
            const updatedData = setObjValue.map((item, idx) => idx === checkboxIndex ? { ...item, checked: e.checked } : item)
            setTestCaseData(updatedData);
        }
    }
    const checkboxTemplate = (node) => {
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
                </div>
            )
        }
    };

    const handleUnSync = async (node) => {
        let unSyncObj = [];
        if (Object.keys(node).length) {
            let findMappedId = viewMappedFiles.filter((item) => item.testscenarioid === node.key);
            if (findMappedId && findMappedId.length) {
                unSyncObj.push({
                    'mapid': findMappedId[0]._id,
                    'testCaseNames': [].concat(findMappedId[0].itemCode),
                    'testid': [].concat(findMappedId[0].itemId),
                    'testSummary': [].concat(null)
                })
                let args = Object.values(unSyncObj);
                args['screenType'] = selectedscreen.name;
                const saveUnsync = await api.saveUnsyncDetails(args);
                if (saveUnsync.error)
                    setToast("error", "Error", 'Failed to Unsync');
                else if (saveUnsync === "unavailableLocalServer")
                    setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
                else if (saveUnsync === "scheduleModeOn")
                    setToast("info", "Info", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
                else if (saveUnsync === "fail")
                    setToast("error", "Error", MSG.INTEGRATION.ERR_SAVE.CONTENT);
                else if (saveUnsync == "success") {
                    callViewMappedFiles()
                    setToast("success", "Success", 'Unsynced');
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


    const handleCloseManageIntegrations = () => {
        // setVisible(false);
        setVisible(false);
        dispatchAction(resetIntergrationLogin());
        dispatchAction(resetScreen());
        dispatchAction(selectedProject(''));
        dispatchAction(selectedIssue(''));
        dispatchAction(mappedPair([]));
        dispatchAction(syncedTestCases([]));
        dispatchAction(selectedTestCase([]));
        dispatchAction(selectedScenarioIds([]));
        setTestCaseData([]);
        setCompleteTestCaseData([]);
        setAvoProjectsList([]);
        setAvoProjects([]);
        dispatchAction(selectedAvoproject(''));
        dispatchAction(mappedTree([]));
        setTreeData([]);
        setCompleteTreeData([]);
        setListofScenarios([])
        setShowLoginCard(true);
        setIsSpin(false);
        setSelectedNodes([]);

    }

    const onProjectChange = async (e) => {
        e.preventDefault();
        dispatchAction(selectedProject(e.target.value));
        setDisableIssue(false);
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
            setAvoProjectsList(projectScenario.avoassure_projects);
            setAvoProjects(projectScenario.avoassure_projects.map((el, i) => { return { label: el.project_name, value: el.project_id, key: i } }));
        }
    }

    const handleClick = (isChecked, value, id, summary) => {
        if (isChecked) {
            let newSelectedTCDetails = { ...selectedZTCDetails };
            let newSelectedTC = isChecked ? [...value, summary] : [];
            setSelected(value)
            setSelectedId(id)
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
    const onIssueChange = async (e) => {
        setTestCaseData([]);
        setEnableBounce(true);
        setIsLoading(true);
        dispatchAction(selectedIssue(e.target.value));
        let projectName = projectDetails.filter(el => el.value === currentProject)[0]['label'];
        let issueName = issueTypes.filter(el => el.value === e.target.value)[0]['label'];
        let jira_info = {
            project: projectName,
            action: 'getJiraJSON',
            issuetype: "",
            itemType: issueName,
            url: loginDetails.url,
            username: loginDetails.username,
            password: loginDetails.password,
            project_data: [],
            key: currentProject
        }
        const testData = await api.getjira_json(jira_info);
        if (testData) {
            setJsonuserstory(testData.testcases);
        }
        setEnableBounce(false);
        setIsLoading(false);
    }

    const callLogin_Jira = async () => {
        const jiraurl = loginDetails.url || '';
        const jirausername = loginDetails.username || '';
        const jirapwd = loginDetails.password || '';

        const domainDetails = await api.connectJira_ICE(jiraurl, jirausername, jirapwd);
        if (domainDetails.error) setToast("error", "Error", domainDetails.error);
        else if (domainDetails === "unavailableLocalServer") setToast("error", "Error", "ICE Engine is not available, Please run the batch file and connect to the Server.");
        else if (domainDetails === "scheduleModeOn") setToast("warn", "Warning", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
        else if (domainDetails === "Invalid Session") {
            setToast("error", "Error", "Session Expired please login again");
            setIsSpin(false);
        }
        else if (domainDetails === "invalidcredentials") setToast("error", "Error", "Invalid Credentials");
        else if (domainDetails === "Fail") setToast("error", "Error", "Fail to Login");
        else if (domainDetails === "notreachable") setToast("error", "Error", "Host not reachable.");
        else if (domainDetails) {
            if (Object.keys(domainDetails).length && domainDetails.projects) {
                setShowLoginCard(false);
                setProjectDetails(domainDetails.projects.map((el) => { return { label: el.name, value: el.code, key: el.id } }))
                setIssueTypes(domainDetails.issue_types.map((el) => { return { label: el.name, value: el.id, key: el.id } }))
            }

            getProjectScenarios();
            callViewMappedFiles();
        }
        setIsSpin(false);
    }
    const acceptFunc = () => {
        setIsShowConfirm(false);
        dispatchAction(resetIntergrationLogin());
        dispatchAction(resetScreen());
        setShowLoginCard(true);
        dispatchAction(selectedProject(''));
        dispatchAction(selectedIssue(''));
        dispatchAction(mappedPair([]));
        dispatchAction(syncedTestCases([]));
        dispatchAction(selectedTestCase([]));
        dispatchAction(selectedScenarioIds([]));
        setTestCaseData([]);
        setCompleteTestCaseData([]);
        setAvoProjectsList([]);
        setAvoProjects([]);
        setListofScenarios([]);
        dispatchAction(selectedAvoproject(''))
        dispatchAction(mappedTree([]));
        setTreeData([]);
        setCompleteTreeData([]);
        setSelectedNodes([]);
    };

    const getProjectScenarios = async () => {
        dispatchAction(selectedProject(''));
        dispatchAction(selectedIssue(''));
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

                : [];
            setCompleteTreeData(treeData);
            if (treeData.length > 8) {
                const indexOfLastScenario = currentAvoPage * scenariosPerPage;
                setIndexOfFirstScenario(indexOfLastScenario - scenariosPerPage);
                setTreeData(treeData.slice(indexOfLastScenario - scenariosPerPage, indexOfLastScenario));
            }
            else {
                setTreeData(treeData);
            }
        }
    }

    const showCard2 = () => {
        handleSubmit();
    };
    const handleSubmit = () => {
        setIsSpin(true);

        switch (selectedscreen.name) {
            case 'Jira':
                callLogin_Jira();
                break;

            case 'Azure DevOps':
                //  callLogin_Azure()
                break;
            case 'Zephyr':
                // callLogin_zephyr();
                break;
            case 'ALM':
                break;
            case 'qTest':
                break;
            default:
                break;
        }
    }
    const callViewMappedFiles = async (saveFlag) => {
        try {
            const response = await api.viewJiraMappedList_ICE("6440e7b258c24227f829f2a4");

            if (response.error) {
                setToast("error", "Error", response.error);
            }
            if (response && response.length) {
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
                        'testCaseNames': object.itemCode,
                        'scenarioNames': object.testscenarioname,
                        'mapId': object._id,
                        'scenarioId': object.testscenarioid,
                        'testid': object.itemId,
                        'itemSummary': object.itemSummary
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
            setToast("error", "Error", MSG.INTEGRATION.ERR_FETCH_DATA.CONTENT);
        }
    }
    ////pagination for  jira testcases//////////////////////////////
    const totalPages = Math.ceil(testCaseData.length / itemsPerPageJira);
    const startIndex = (currentJiraPage - 1) * itemsPerPageJira;
    const endIndex = Math.min(startIndex + itemsPerPageJira, testCaseData.length);
    const onPageChangeJira = event => {
        setCurrentJiraPage(event.page + 1);
    };
    const IntergrationLogin = useMemo(() => <LoginModal isSpin={isSpin} showCard2={showCard2} handleIntegration={handleIntegration}
        setShowLoginCard={setShowLoginCard} setAuthType={setAuthType} authType={authType} />, [isSpin, showCard2,
        handleIntegration, setShowLoginCard, setAuthType, authType])

    const buttonClick = () => {

        if (testCaseData.length > 0) {
            const itemToMove = testCaseData[0];
            setTestCaseData(testCaseData.slice(1));
            setCard2Data([...card2Data, itemToMove]);
        }

    };
    const callAzureSaveButton = () => {
        if (azureRef.current) {
            azureRef.current.callSaveButton();
        }
    }
    // const callLogin_Azure = async () => {
    //     const azureurl = AzureLoginDetails.url || '';
    //     const azureusername = AzureLoginDetails.username || '';
    //     const azurepwd = AzureLoginDetails.password || '';
    //     setUser({
    //         url: azureurl,
    //         username: azureusername,
    //         password: azurepwd
    //     })
    //     var apiObj = {
    //         "action": 'azureLogin',
    //         "url": azureurl,
    //         "username": azureusername,
    //         "pat": azurepwd,

    //     }
    //     const domainDetails = await api.connectAzure_ICE(apiObj);

    //     if (domainDetails.error) setToast('error', 'Error', domainDetails.error.CONTENT);
    //     else if (domainDetails === "unavailableLocalServer") setToast('error', 'Error', "ICE Engine is not available, Please run the batch file and connect to the Server.");
    //     else if (domainDetails === "scheduleModeOn") setToast('error', 'Error', "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
    //     else if (domainDetails === "Invalid Session") {
    //         setToast('error', 'Error', "Invalid Session");
    //     }
    //     else if (domainDetails === "invalidcredentials") setToast('error', 'Error', "Invalid Credentials");
    //     else if (domainDetails === "fail") setToast('error', 'Error', "Fail to Login");
    //     else if (domainDetails === "notreachable") setToast('error', 'Error', "Host not reachable.");
    //     else if (domainDetails) {
    //         if (Object.keys(domainDetails).length && domainDetails.projects) {
    //             let issueTypes = [
    //                 { name: 'Story', code: 'Story' },
    //                 { name: 'TestPlans', code: 'TestPlans' },
    //             ]
    //             setProjectDetails(domainDetails.projects.map((el) => { return { name: el.name, id: el.id } }))
    //             setIssueTypes(issueTypes)
    //         }
    //         setToast("success", "Success", `${selectedscreen.name} login successful`);
    //         setShowLoginCard(false);
    //         getProjectScenarios();
    //         azureRef.current.callViewMappedFiles();
    //     }
    //     setIsSpin(false);
    // }

    const callback = (getDetails) => {
        setAdoUserstories(getDetails);
    }
    const showLogin = async () => {
        setIsShowConfirm("true");
        setIsLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const name = userInfo.username;
        const email = userInfo.email_id;
        const querystrg = { email }
        const organization = "Avo Assure";
        const localStorageDefaultProject = JSON.parse(localStorage.getItem('DefaultProject'));
        const projectName = localStorageDefaultProject.projectName;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('projectname', projectName);
        formData.append('organization', organization);
        let blob = null;
        if (selectedscreen.name === 'Jira') {
            blob = new Blob([JSON.stringify(jsonuserstory)], { type: 'application/json' });
        } else if (selectedscreen.name === 'Azure DevOps') {
            blob = new Blob([JSON.stringify(adoUserstories)], { type: 'application/json' });
        }
        formData.append('file', blob, 'userstories.json');
        formData.append('type', 'userstories')
        try {
            const uploadResponse = await uploadgeneratefile(formData);
            if (uploadResponse) {
                setResponseMsg(uploadResponse);
                //toast.current.show({ severity: 'success', summary: 'Success', detail: ' work items added successfully', life: 3000 });
            }
            const getDataResponse = await axios.get('/getall_uploadfiles', {
                params: {
                    email: email,
                },
            })
            // showToast('success', 'Success', 'Work items added successfully');
            handleCloseManageIntegrations();
        } catch (error) {
            setResponseMsg('');
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
        } finally {
            setIsLoading(false);
            setVisible(false);
        }
    };
    return (
        <>
            <div className="card flex justify-content-center ">
                <Dialog className="jira testcase-cls" header={selectedscreen.name ? `User Story Selection: ${selectedscreen.name} ` : 'User Story Selection'} visible={visible} onHide={handleCloseManageIntegrations} style={{ width: '40vw', height: '20vw' }}
                    footer={
                        <div className="dialog-footer">
                            {isLoading ? (
                                <ProgressSpinner style={{ width: '30px', height: '30px' }} strokeWidth="4" fill="#EEEEEE" animationDuration=".5s" />
                            ) : (
                                <>
                                    <Button label="Submit" onClick={showLogin} className="p-button-submit p-button-primary" />

                                    <Toast ref={toast} position="bottom-center" style={{ zIndex: 999999 }} />
                                    {toastMessage && (
                                        <div className="p-grid p-justify-center">
                                            <div className="p-col-10">
                                                <ToastMessage message={toastMessage} />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                    } >

                    {showLoginCard ? (
                        <>
                            {IntergrationLogin}
                        </>
                    ) : selectedscreen.name === "Jira" ?
                        (

                            <div style={{ margin: '31px' }}>
                                <div className="tab__cls">
                                    <h5 className='select-users'>Select User Stories <span className="imp-cls"> * </span></h5>
                                    <div className="data__mapping" >
                                        <div className="continer_cards">
                                            <div className="card_data1">
                                                <Card className="mapping_data_card1">
                                                    <div className="dropdown_div">
                                                        <div className="dropdown-map1">
                                                            <span> Jira Project <span style={{ color: 'red' }}>*</span></span>
                                                            <span className="release_span">  Jira Work items<span style={{ color: 'red' }}>*</span></span>
                                                        </div>
                                                        <div className="dropdown-map2">
                                                            <Dropdown style={{ width: '11rem', height: '2.5rem' }} value={currentProject} className="dropdown_project" options={projectDetails} onChange={(e) => onProjectChange(e)} placeholder="Select Project" />
                                                            <Dropdown disabled={disableIssue} style={{ width: '11rem', height: '2.5rem' }} value={currentIssue} className="dropdown_release" options={issueTypes} onChange={(e) => onIssueChange(e)} placeholder="Select workitems" />
                                                        </div>
                                                    </div>
                                                    {isLoading && <div className="spinner" style={{ position: 'absolute', right: '73px', top: '59px' }}>
                                                        <ProgressSpinner style={{ width: '15px', height: '15px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                                                    </div>}

                                                    <div className="testcase__data" style={{ display: 'none' }} >
                                                        {
                                                            testCaseData && testCaseData.length ?
                                                                testCaseData.slice(startIndex, endIndex).map((data, i) => (
                                                                    <div key={i} className={"test_tree_leaves" + (selected === data.code ? " test__selectedTC" : "")}>
                                                                        <label className="test__leaf" title={data.code} >
                                                                            <Checkbox onChange={e => { testcaseCheck(e, i); handleClick(e.checked, data.code, data.id, data.summary) }} checked={data.checked} />
                                                                            <span className="leafId">{data.code}</span>
                                                                            <span className="test__tcName" title={data.summary}>{data.summary.trim().length > 35 ? data.summary.substr(0, 35) + "..." : data.summary} </span>
                                                                        </label>
                                                                    </div>
                                                                ))
                                                                :
                                                                enableBounce && (
                                                                    <div className="bouncing-loader">
                                                                        <div></div>
                                                                        <div></div>
                                                                        <div></div>
                                                                    </div>

                                                                )}
                                                        {testCaseData && testCaseData.length > itemsPerPageJira && (
                                                            <div className="jira__paginator">
                                                                <Paginator
                                                                    first={startIndex}
                                                                    rows={itemsPerPageJira}
                                                                    totalRecords={testCaseData.length}
                                                                    onPageChange={onPageChangeJira}
                                                                    pageLinkSize={3}

                                                                />
                                                            </div>

                                                        )}
                                                    </div>

                                                </Card>
                                            </div>
                                        </div>

                                    </div>


                                </div>
                            </div>
                        )
                        // : selectedscreen.name === "Azure DevOps" ? <AzureTestcase ref={azureRef} callback={callback} callAzureSaveButton={callAzureSaveButton} setToast={setToast} issueTypes={issueTypes} projectDetails={projectDetails} selectedNodes={selectedNodes} setSelectedNodes={setSelectedNodes} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
                        : null
                    }
                </Dialog>

            </div>

        </>
    )
}
export default JiraTestcase;