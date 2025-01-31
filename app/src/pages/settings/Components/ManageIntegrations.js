import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Dialog } from 'primereact/dialog';
import { TabMenu } from 'primereact/tabmenu';
import { Dropdown } from 'primereact/dropdown';
import "../styles/manageIntegrations.scss";
import { InputText } from "primereact/inputtext";
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import LoginModal from "../Login/LoginModal";
import CloudSettings from "../../settings/Components/Cloud/CloudSettings"
import { useDispatch, useSelector } from 'react-redux';
import * as api from '../api.js';
import { RedirectPage, Messages as MSG, setMsg } from '../../global';
import { Toast } from "primereact/toast";
import { ConfirmDialog } from 'primereact/confirmdialog';
import TestArtifacts from "./TestArtifacts.js";
import {
    screenType,resetIntergrationLogin, resetScreen, selectedProject,
    selectedIssue, selectedTCReqDetails, selectedTestCase,
    syncedTestCases, mappedPair, selectedScenarioIds,
    selectedAvoproject, mappedTree,enableSaveButton,almavomapped, updateTestrailMapping
} from '../settingSlice';
import { InputSwitch } from "primereact/inputswitch";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Checkbox } from 'primereact/checkbox';
import { Tree } from 'primereact/tree';
// import { checkboxTemplate } from './path/to/checkboxTemplate';
import ZephyrContent from "./ZephyrContent";
import AzureContent from "./AzureContent";
import TestRailContent from "./TestRailContent";
import { Paginator } from 'primereact/paginator';
import { getDetails_SAUCELABS } from "../../execute/api";
import { fetchALMTestCases } from "../api.js"
import { useNavigate } from 'react-router-dom';
import CloudALMContent from "./CloudALMContent";
export var navigate;

const ManageIntegrations = ({ visible, onHide, toastWarn, toastSuccess, toastError }) => {
    // selectors
    const navigate = useNavigate();
    const currentProject = useSelector(state => state.setting.selectedProject);
    const currentIssue = useSelector(state => state.setting.selectedIssue);
    const selectedZTCDetails = useSelector(state => state.setting.selectedZTCDetails);
    const selectedScIds = useSelector(state => state.setting.selectedScenarioIds);
    const mappedData = useSelector(state => state.setting.mappedPair);
    const mappedTreeList = useSelector(state => state.setting.mappedTree);
    const selectedAvo = useSelector(state => state.setting.selectedAvoproject);
    const AzureLoginDetails = useSelector(state => state.setting.AzureLogin);
    const zephyrLoginDetails = useSelector(state => state.setting.zephyrLogin);
    const testrailLoginDetails = useSelector(state => state.setting.testRailLogin);
    const enabledSaveButton = useSelector(state => state.setting.enableSaveButton);
    // state
    const [activeIndex, setActiveIndex] = useState(0);
    const [Index, setIndex] = useState(0);
    const [activeIndexViewMap, setActiveIndexViewMap] = useState(0);
    const [showLoginCard, setShowLoginCard] = useState(true);
    const [avoTestCaseData, setAvoTestCaseData] = useState([]);
    // const selectedSaucelabsScreen = useSelector(state => state.saucelabs.screenType);
    // const selectedBrowserstackScreen = useSelector(state => state.browserstack.screenType);
    const selectedscreen = useSelector(state => state.setting.screenType);
    const loginDetails = useSelector(state => state.setting.intergrationLogin);
    const [isSpin, setIsSpin] = useState(false);
    const [checked, setChecked] = useState(false);
    const [projectDetails, setProjectDetails] = useState([]);
    const [issueTypes, setIssueTypes] = useState([]);
    const [disableIssue, setDisableIssue] = useState(true)
    const [testCaseData, setTestCaseData] = useState([]);
    const [calmTestCaseData, setCalmTestCaseData] = useState([]);
    const [selected, setSelected] = useState(false);
    const [selectedId, setSelectedId] = useState('');
    const [selectedSummary, setSelectedSummary] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [avoProjects, setAvoProjects] = useState([]);
    const [avoProjectsList, setAvoProjectsList] = useState(null);
    const [enableBounce, setEnableBounce] = useState(false);
    const [checkedTestcase, setCheckedTestcase] = useState(false);
    const [listofScenarios, setListofScenarios] = useState([]);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const [treeData, setTreeData] = useState([]);
    const [completeTreeData, setCompleteTreeData] = useState([]);
    const [completeTestCaseData, setCompleteTestCaseData]= useState([]);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [viewMappedFiles, setViewMappedFiles] = useState([]);
    const [rows, setRows] = useState([]);
    const [counts, setCounts] = useState({
        totalCounts: 0,
        mappedScenarios: 0,
        mappedTests: 0
    })
    const [isShowConfirm,setIsShowConfirm] = useState(false);
    const [authType,setAuthType] = useState("basic");
    const [user, setUser] = useState([]);
    const azureRef = useRef(null);
    const zephyrRef = useRef(null);
    const testrailRef = useRef(null);
    const [domainDetails , setDomainDetails] = useState(null);
    const [currentAvoPage, setCurrentAvoPage] = useState(1);
    const [indexOfFirstScenario, setIndexOfFirstScenario] = useState(0);
    const scenariosPerPage = 10;
    const itemsPerPageJira = 10; // Number of items per page
    const [currentPage, setCurrentPage] = useState(0);
    const [currentJiraPage, setCurrentJiraPage] = useState(1);
    const toast = useRef();
    const dispatchAction = useDispatch();
    const [createSaucelabs, setCreateSaucelabs] = useState(true);
    const [SaucelabsURL, setSaucelabsURL] = useState('');
    const [SaucelabsUsername, setSaucelabsUsername] = useState('');
    const [SaucelabsAPI, setSaucelabsAPI] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCloudBasedIntegrationClicked, setIsCloudBasedIntegrationClicked] = useState(false);

    const handleIntegration = (value) => {
        dispatchAction(screenType(value));
        setAuthType('basic');
    }

    useEffect(() => {
        (async () => {
            setLoading("Loading...");
            try {
                const data = await getDetails_SAUCELABS()
                setLoading(false);
                if (data.error) {return; }
                if(data==="empty"){
                    setSaucelabsURL('');
                    setSaucelabsUsername('');
                    setSaucelabsAPI('');
                    setCreateSaucelabs(true);
                }
                else{
                    const url = data.SaucelabsURL;
                    const username = data.SaucelabsUsername;
                    const key = data.Saucelabskey;
                    setSaucelabsURL(url);
                    setSaucelabsUsername(username);
                    setSaucelabsAPI(key);
                    setCreateSaucelabs(false);
                }
            } catch (error) {
                setLoading(false);
            }
        })();
    }, [isCloudBasedIntegrationClicked]);

    //   const handleSubmitSaucelabs = () => {
    //     setIsSpin(true);

    //     switch (selectedSaucelabsScreen.name) {
    //       // Define the cases for `saucelabs` here
    //       case 'SauceLabs':
    //         // callLoginSauceLabs();
    //         break;
    //       // Add more cases as needed
    //       default:
    //         break;
    //     }
    //   };

    //   const handleSubmitBrowserstack = () => {
    //     setIsSpin(true);

    //     switch (selectedBrowserstackScreen.name) {
    //       // Define the cases for `browserstack` here
    //       case 'BrowserStack':
    //         // callLoginBrowserStack();
    //         break;
    //       // Add more cases as needed
    //       default:
    //         break;
    //     }
    //   };

    const handleSubmit = async () => {
        setIsSpin(true);

        switch (selectedscreen.name) {
            case 'Jira':
                callLogin_Jira();
                break;
            case 'Zephyr':
                callLogin_zephyr();
                break;
            case 'Azure DevOps':
                callLogin_Azure();
                break;
            case 'CloudALM':
                const { testCases } = await fetchALMTestCases(setShowLoginCard);
                setCalmTestCaseData(testCases);
                getProjectScenarios();
                // callViewMappedFiles();
                break;
            case 'ALM':
                break;
            case 'qTest':
                break;
            case 'TestRail':
                callLoginTestRail();
                break;
            default:
                break;
        }
    }

    /* Jira Login handler */
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
            return RedirectPage(navigate);
        }
        else if (domainDetails === "invalidcredentials") setToast("error", "Error", "Invalid Credentials");
        else if (domainDetails === "Fail") setToast("error", "Error", "Fail to Login");
        else if (domainDetails === "notreachable") setToast("error", "Error", "Host not reachable.");
        else if (domainDetails) {
            if (Object.keys(domainDetails).length && domainDetails.projects) {
                setProjectDetails(domainDetails.projects.map((el) => { return { label: el.name, value: el.code, key: el.id } }))
                setIssueTypes(domainDetails.issue_types.map((el) => { return { label: el.name, value: el.id, key: el.id } }))
            }
            setToast("success", "Success", `${selectedscreen.name} login successful`);
            setShowLoginCard(false);
            getProjectScenarios();
            callViewMappedFiles();
        }
        setIsSpin(false);
    }

    
    const callLogin_zephyr = async()=>{
        var zephyrPayload = {};
        zephyrPayload.authtype = authType;
        zephyrPayload.zephyrURL = zephyrLoginDetails.url;
        if(authType==="basic") {
            zephyrPayload.zephyrUserName = zephyrLoginDetails.username;
            zephyrPayload.zephyrPassword = zephyrLoginDetails.password;
        } else {
            zephyrPayload.zephyrApiToken = zephyrLoginDetails.token;
        }

        const domainDetails = await api.loginToZephyr_ICE(zephyrPayload);
        if (domainDetails.error) setToast('error','Error', domainDetails.error.CONTENT);
        else if (domainDetails === "unavailableLocalServer") setToast('error','Error',"ICE Engine is not available, Please run the batch file and connect to the Server.");
        else if (domainDetails === "scheduleModeOn") setToast('error','Error',"Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
        else if (domainDetails === "Invalid Session"){
            setToast('error','Error','Invalid session')
        }
        else if (domainDetails === "invalidcredentials") setToast('error','Error',"Invalid Credentials");
        // else if (domainDetails === "noprojectfound") setLoginError("Invalid credentials or no project found");
        // else if (domainDetails === "invalidurl") setLoginError("Invalid URL");
        else if (domainDetails === "fail") setToast('error','Error',"Fail to Login");
        else if (domainDetails === "notreachable") setToast('error','Error',"Host not reachable.");
        //else if (domainDetails === "Error:Failed in running Zephyr") setLoginError("Host not reachable");
        // else if (domainDetails === "Error:Zephyr Operations") setLoginError("Failed during execution");
        else if (domainDetails?.length) {
            setToast("success", "Success", `${selectedscreen?.name} login successful`);
            setShowLoginCard(false);
            setDomainDetails(domainDetails);
            zephyrRef.current.callViewMappedFiles();
            // setLoginSuccess(true);
        }
        setIsSpin(false);
    }
    
    const callLoginTestRail = async()=>{
        const testrailPayload = {
            TestRailUrl : testrailLoginDetails.url,
            TestRailUsername : testrailLoginDetails.username,
            TestRailToken : testrailLoginDetails.apiKey,
            TestRailAction : "getProjects"
        };

        const testrailProjects = await api.getProjectsTestrail_ICE(testrailPayload);
        setIsSpin(false);

        if (testrailProjects.error) setToast('error','Error', testrailProjects.error.CONTENT);
        else if (testrailProjects === "unavailableLocalServer") setToast('error','Error',"ICE Engine is not available, Please run the batch file and connect to the Server.");
        else if (testrailProjects === "scheduleModeOn") setToast('error','Error',"Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
        else if (testrailProjects === "Invalid Session"){
            setToast('error','Error','Invalid session');
            setIsSpin(false);
        }
        else if (testrailProjects === "Invalid Credentials") setToast('error','Error',"Invalid Credentials");
        else if (testrailProjects === "fail") setToast('error','Error',"Fail to Login");
        else if (testrailProjects === "notreachable") setToast('error','Error',"Host not reachable.");
        else if (testrailProjects === "Error:testrail Operations") setToast('error','Error', "Wrong Credentials");
        else if (testrailProjects) {
            setToast("success", "Success", `${selectedscreen.name} login successful`);
            setShowLoginCard(false);
            setDomainDetails(testrailProjects);
            // testrailRef.current.callViewMappedFiles();
        }
        setIsSpin(false);
    }


    const callLogin_Azure = async()=>{
        console.log(' callLogin_Azure called');
        const azureurl = AzureLoginDetails.url || '';
        const azureusername = AzureLoginDetails.username || '';
        const azurepwd = AzureLoginDetails.password || '';
        setUser({
            url: azureurl,
            username: azureusername,
            password: azurepwd
        })
        var apiObj = {
            "action": 'azureLogin',
            "url": azureurl,
            "username": azureusername,
            "pat": azurepwd,

        }
        const domainDetails = await api.connectAzure_ICE(apiObj);
        if (domainDetails.error) {setToast('error','Error', domainDetails.error.CONTENT);}
        else if (domainDetails === "unavailableLocalServer") {setToast('error','Error',"ICE Engine is not available, Please run the batch file and connect to the Server.")}
        else if (domainDetails === "scheduleModeOn") {setToast('error','Error',"Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");}
        else if (domainDetails === "Invalid Session"){
            setToast('error','Error',"Invalid Session");
        }
        else if (domainDetails === "invalidcredentials") {setToast('error','Error',"Invalid Credentials");}
        else if (domainDetails === "fail" || domainDetails === "Fail") {setToast('error','Error',"Fail to Login");}
        else if (domainDetails === "notreachable") {setToast('error','Error',"Host not reachable.");}
        else if (domainDetails) {
            if (Object.keys(domainDetails).length && domainDetails.projects) {
                // {id:1,name:'Story'},{id:2,name:'TestPlans'}
                let issueTypes = [
                    {name: 'Story', code: 'Story'},
                    {name: 'TestPlans', code: 'TestPlans'},
                ]
                setProjectDetails(domainDetails.projects.map((el) => { return { name: el.name, id: el.id } }))
                setIssueTypes(issueTypes)
            }
            setToast("success", "Success", `${selectedscreen.name} login successful`);
            setShowLoginCard(false);
            getProjectScenarios();
            azureRef.current.callViewMappedFiles();
        }
        setIsSpin(false);
    }

    const getProjectScenarios = async () => {
        dispatchAction(selectedProject(''));
        dispatchAction(selectedIssue(''));
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
            setAvoTestCaseData(projectScenario);
            setAvoProjects(projectScenario.avoassure_projects.map((el, i) => { return { label: el.project_name, value: el.project_id, key: i } }));
            onAvoProjectChange(projectScenario.avoassure_projects);
            // setSelectedRel(releaseId);  
            // clearSelections();
        }
    }

    const setToast = (tag, summary, msg) => {
        toast.current.show({ severity: tag, summary: summary, detail: JSON.stringify(msg), life: 10000 });
    }

    const integrationItems = [
        { label: 'Tool Based Integration' },
        { label: 'Cloud Based Integration' },
        { label: 'Versioning'}
    ];

    ////pagination for  jira testcases/////////////////////////////////////////////////////////////////////////////
    const totalPages = Math.ceil(testCaseData.length / itemsPerPageJira);
    const startIndex = (currentJiraPage - 1) * itemsPerPageJira;
    const endIndex = Math.min(startIndex + itemsPerPageJira, testCaseData.length);

    const onPageChangeJira = event => {
        setCurrentJiraPage(event.page + 1);
    };

    const showLogin = () => {
        setIsShowConfirm(true);
    };


    const handleCloseManageIntegrations = () => {
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
        dispatchAction(enableSaveButton(false))
        onHide();
        setDomainDetails([]);
    }

    const handleTabChange = (index) => {
        setActiveIndex(index);
    };

    const handleTabIndexChange = (e) => {
        setIndex(e.index); // Update the index state when a tab is changed
        if (e.index == 1) {
            setIsCloudBasedIntegrationClicked(true);
        }
    };

    const showCard2 = () => {
        handleSubmit();
    };

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
                    {/* <i className="pi pi-times" style={{ float: 'right'}} ></i> */}
                </div>
            )
        }
    };

    const handleUnSync = async (node) => {
        let unSyncObj = [];
        if (Object.keys(node).length) {
            // let findUnsyncedObj = mappedData.filter((item) =>  item.scenarioId[0] === node.key);
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
                else if(saveUnsync === "unavailableLocalServer")
                    setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
                else if(saveUnsync === "scheduleModeOn")
                    setToast("info", "Info", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
                else if(saveUnsync === "fail")
                    setToast("error", "Error", MSG.INTEGRATION.ERR_SAVE.CONTENT);
                else if(saveUnsync == "success"){
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
                    'testCaseNames': [].concat(findMappedId[0].itemCode),
                    'testid': [].concat(findMappedId[0].itemId),
                    'testSummary': [].concat(null)
                })
                let args = Object.values(unSyncObj);
                args['screenType'] = selectedscreen.name;
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
                    setToast("success", "Success", 'Mapped data unsynced successfully');
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
        else{
            setToast("info", "Info", 'Please sync atleast one map');
        }

    }

    const callCalmSaveButton = async () => {
        // Saving/Mapping API's
        if (mappedData && Object.keys(mappedData).length) {
            try {
                const response = await api.saveSAP_ALMDetails_ICE(mappedData);
                console.log(response,' its response');
            if (response.error) {
                setToast("error", "Error", response.error);
            } else if (response === "scheduleModeOn")
                setToast("warn", "Warning", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
            else if (response.status == 201 || response.status == 200 || response.message.length > 0) {
                setToast("success", "Success", 'Tests mapped successfully!');
            }
            } catch (maperror) {
                console.log("failed to map : ", maperror);
                setToast("error", "Error", "failed to map testcase");
            }
        }
        else {
            setToast("info", "Info", 'Please sync atleast one map');
        }
 
        // Fetching mapped API's again
        const fetchMappedDetails = async () => {
            try {
                const getModulesData = await api.viewALM_MappedList_ICE({
                    user_id: localStorage.userInfo.user_id,
                    action: "viewALM_MappedList_ICE"
                });
       
                if (getModulesData && getModulesData.length > 0) {
                    dispatchAction(almavomapped(getModulesData));
                }
            } catch (error) {
                console.error("Error fetching mapped details:", error);
            }
        };
 
        fetchMappedDetails();
    }

    const callTestrailSaveButton = async () => {
        if (mappedData && Object.keys(mappedData).length) {
            const response = await api.saveTestrailMapping(mappedData);
            if (response.error) {
                setToast("error", "Error", response.error);
            } else if (response === "scheduleModeOn")
                setToast("warn", "Warning", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
            else if (response.status == 201 || response.status == 200 || response == "success") {
                setToast("success", "Success", 'Tests mapped successfully!');
                dispatchAction(updateTestrailMapping(true));
            }
        }
        else {
            setToast("info", "Info", 'Please sync atleast one map');
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
                // let updatedTreeData = [];
                // // let updatedTreeData = treeData.map((scenario) => scenario.key == selectedScIds[0] ? {...scenario,checked:true,children:filterTestCase} :scenario)
                // viewMappedData.forEach((view) => {
                //     console.log(view,' its view ', treeData);
                //     // treeData.forEach((scenario) => {
                //     //     console.log(view,' its view ', scenario);
                //     // })
                //     // updatedTreeData =  treeData.map((scenario) => {
                //     //     console.log(view.testscenarioid ,' === ', scenario.key);
                //     //     if(view.testscenarioid === scenario.key){
                //     //         return {...scenario,checked:true,children:{key:view.itemId,label:view.itemSummary,data:{type:'testcase'}}}
                //     //     }
                //     //     else{
                //     //         return scenario;
                //     //     }
                //     // });
                //     // console.log(updatedTreeData, ' inisde forEach ');
                // })
                // console.log(updatedTreeData,' its updatedTreeData of viewMapped');
                // setTreeData(updatedTreeData);
                // dispatchAction(mappedTree(updatedTreeData));
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
            else if(response !== 'fail'){
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


    const acceptFunc = () => {
        setIsShowConfirm(false);
        setDomainDetails([]);
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
        dispatchAction(updateTestrailMapping(false));
    };

    const rejectFunc = () => {
        console.log('its rejected');
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
            // setProjectDetails(projectScenario.project_dets);
            setAvoProjectsList(projectScenario.avoassure_projects);
            setAvoProjects(projectScenario.avoassure_projects.map((el, i) => { return { label: el.project_name, value: el.project_id, key: i } }));
            // onAvoProjectChange(reduxDefaultselectedProject.projectId);
        }
    }

    const onIssueChange = async (e) => {
        // e.preventDefault();
        setTestCaseData([]);
        setEnableBounce(true);
        dispatchAction(selectedIssue(e.target.value));
        let projectName = projectDetails.filter(el => el.value === currentProject)[0]['label'];
        let issueName = issueTypes.filter(el => el.value === e.target.value)[0]['label'];
        let jira_info = {
            project: projectName,
            action: 'getJiraTestcases',
            issuetype: "",
            itemType: issueName,
            url: loginDetails.url,
            username: loginDetails.username,
            password: loginDetails.password,
            project_data: [],
            key: currentProject
        }
        const testData = await api.getJiraTestcases_ICE(jira_info)
        if (testData) {
            const updateCheckbox = testData.testcases.map((item) => ({ ...item, checked: false }));
            setTestCaseData(updateCheckbox)
        }
        setEnableBounce(false);
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
    const handleClick = (isChecked, value, id, summary) => {
        if (isChecked) {
            let newSelectedTCDetails = { ...selectedZTCDetails };
            let newSelectedTC = isChecked ? [...value, summary] : [];
            console.log(newSelectedTC);
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

    function handleSync() {
        let popupMsg = false;
        let filterProject = projectDetails.filter(el => el.value === currentProject)[0];
        let releaseId = issueTypes.filter(el => el.value === currentIssue)[0]['label'];
        if (selectedScIds.length === 0) {
            popupMsg = MSG.INTEGRATION.WARN_SELECT_SCENARIO;
        }
        else if (selectedId === '') {
            popupMsg = MSG.INTEGRATION.WARN_SELECT_TESTCASE;
        }
        else if (selectedScIds.length > 1) {
            popupMsg = MSG.INTEGRATION.WARN_MULTI_TC_SCENARIO;
        }

        if (popupMsg) setMsg(popupMsg);
        else {
            const mappedPairObj = [...mappedData,
            {
                projectId: filterProject.key,
                projectCode: filterProject.value,
                projectName: filterProject.label,
                testId: selectedId,
                testCode: selected,
                scenarioId: selectedScIds,
                itemType: releaseId,
                itemSummary: selectedSummary
            }
            ];
            dispatchAction(mappedPair(mappedPairObj));
            const filterTestCase = testCaseData.filter((testCase) => testCase.id == selectedId).map(el => ({ key: el.id, label: el.summary, data: { type: 'testcase' } }))
            // checking the current map obj is already present with any other scenario
            const findDuplicate = completeTreeData.map((parent, index) => {
                const duplicateChildIndex = parent.children.findIndex(
                    (child) => child.key === selectedId
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
            // setTreeData(updatedTreeData);
            setCompleteTreeData(updatedTreeData);
            dispatchAction(mappedTree(updatedTreeData));
            const updateCheckbox = testCaseData.map((item) => ({ ...item, checked: false }));
            setTestCaseData(updateCheckbox);
            dispatchAction(syncedTestCases(selected));
            setSelectedNodes([]);
            dispatchAction(selectedScenarioIds([]));
        }
        setDisabled(false);
        dispatchAction(enableSaveButton(true));
    }


    /////////////old checkbox selection code
    // const testcaseCheck = (e, checkboxIndex) => {
    //     if (checkboxIndex >= 0 && checkboxIndex < testCaseData.length) {
    //         const setObjValue = testCaseData.map((item) => ({ ...item, checked: false }));
    //         const updatedData = setObjValue.map((item, idx) => idx === checkboxIndex ? { ...item, checked: e.checked } : item)
    //         setTestCaseData(updatedData);
    //     }
    // }

    ////////////////New Chcekbox selection code 

    const testcaseCheck = (e, checkboxIndex) => {
        if (checkboxIndex >= 0 && checkboxIndex < itemsPerPageJira) {
            const updatedData = testCaseData.map((item) => ({ ...item, checked: false })).slice();
            const globalIndex = startIndex + checkboxIndex;
            updatedData[globalIndex].checked = e.checked;
            setTestCaseData(updatedData);
        }
    }



    const callAzureSaveButton = () => {
        if(azureRef.current){
            azureRef.current.callSaveButton();
        }
    }

    const callZephyrSaveButton = () => {
        if(zephyrRef.current){
            zephyrRef.current.callSaveButton();
        }
    }

    const footerIntegrations = useCallback(()=>{
        return (<div className='btn-11'>
            {activeIndex === 0 &&(
                <div className="btn__2">
                    <Button label="Save" disabled={!enabledSaveButton} severity="primary" className='btn1' onClick={selectedscreen.name === 'Jira' ? callSaveButton:selectedscreen.name === 'Azure DevOps' ? callAzureSaveButton : selectedscreen.name=="TestRail" ? callTestrailSaveButton : selectedscreen.name == "CloudALM" ? callCalmSaveButton : callZephyrSaveButton} />
                    <Button label="Back" onClick={()=>{dispatchAction(enableSaveButton(false));showLogin()}} size="small" className="logout__btn" outlined/>
                </div>)}

            {activeIndex === 1 &&(
                <Button label="Back" onClick={()=>{dispatchAction(enableSaveButton(false));showLogin()}} size="small" className="cancel__btn" />)}

        </div>)
    },[activeIndex,selectedscreen.name,mappedData])


    const onPageAvoChange = (event) => {
        setCurrentAvoPage(event.page + 1);
        const indexOfLastScenario = (event.page + 1) * scenariosPerPage;
        setIndexOfFirstScenario(indexOfLastScenario - scenariosPerPage);
        setTreeData(completeTreeData.slice(indexOfLastScenario - scenariosPerPage, indexOfLastScenario));
    };

    const IntergrationLogin = useMemo(() => <LoginModal isSpin={isSpin} showCard2={showCard2} handleIntegration={handleIntegration} setTestCaseData={setTestCaseData}
        setShowLoginCard={setShowLoginCard} setAuthType={setAuthType} authType={authType} />, [isSpin, showCard2,
        handleIntegration,setShowLoginCard,setAuthType,authType])



    const CloudBasedIntegrationContent = useMemo(() => <CloudSettings  />, [])
    


    return (
        <>
            <div className="card flex justify-content-center">
                <Dialog className="manage_integrations" header={Index === 1 && selectedscreen.name ? `Manage Integration` : `Manage Integration: ${selectedscreen.name} Integration`} visible={visible} style={{ width: '70vw', height: '45vw' }} onHide={handleCloseManageIntegrations} footer={!showLoginCard ? footerIntegrations() : ""}>
                    <div>
                        {showLoginCard  ? <TabMenu model={integrationItems} activeIndex={Index}  onTabChange={handleTabIndexChange} /> : ""}
                        {Index === 1 && <CloudSettings createSaucelabs={createSaucelabs} setCreateSaucelabs={setCreateSaucelabs} SaucelabsURL={SaucelabsURL} setSaucelabsURL={setSaucelabsURL} SaucelabsUsername={SaucelabsUsername} setSaucelabsUsername={setSaucelabsUsername} SaucelabsAPI={SaucelabsAPI} setSaucelabsAPI={setSaucelabsAPI} />}
                        {Index === 2 && <TestArtifacts toastError={toastError} toastSuccess={toastSuccess} toastWarn={toastWarn}/>}
                    </div>
                    <ConfirmDialog visible={isShowConfirm} onHide={() => setIsShowConfirm(false)} message="Are you sure you want to go Back ?"
                        header="Confirmation" icon="pi pi-exclamation-triangle" accept={acceptFunc} reject={rejectFunc} />

                    {showLoginCard && Index === 0 ? (
                        <div className="flex flex-row">
                            {IntergrationLogin}
                        </div>
                    ) : selectedscreen.name === "Jira" && Index===0 ?
                        (
                            <div>
                                <div className="tab__cls">
                                    <TabView activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
                                        <TabPanel header="Mapping">
                                            <div className="data__mapping">
                                                <div className="card_data1">
                                                    <Card className="mapping_data_card1">
                                                        <div className="dropdown_div">
                                                            <div className="dropdown-map1">
                                                                <span>Select Jira Project <span style={{ color: 'red' }}>*</span></span>
                                                                <span className="release_span"> Select Jira Work items<span style={{ color: 'red' }}>*</span></span>
                                                            </div>
                                                            <div className="dropdown-map2">
                                                                <Dropdown style={{ width: '11rem', height: '2.5rem' }} value={currentProject} className="dropdown_project" options={projectDetails} onChange={(e) => onProjectChange(e)} placeholder="Select Project" />
                                                                <Dropdown disabled={disableIssue} style={{ width: '11rem', height: '2.5rem' }} value={currentIssue} className="dropdown_release" options={issueTypes} onChange={(e) => onIssueChange(e)} placeholder="Select Release" />
                                                            </div>
                                                        </div>
                                                        <div className="testcase__data">
                                                            {
                                                                testCaseData && testCaseData.length ?
                                                                    testCaseData.slice(startIndex, endIndex).map((data, i) => (
                                                                        <div key ={i} className={"test_tree_leaves" + (selected === data.code ? " test__selectedTC" : "")}>
                                                                            {/* onClick={() => handleClick(data.code, data.id, data.summary)} */}
                                                                            <label className="test__leaf" title={data.code} >
                                                                                <Checkbox onChange={e => { testcaseCheck(e, i); handleClick(e.checked, data.code, data.id, data.summary) }} checked={data.checked} />
                                                                                <span className="leafId">{data.code}</span>
                                                                                <span className="test__tcName" title={data.summary}>{data.summary.trim().length > 35 ? data.summary.substr(0, 35) + "..." : data.summary} </span>
                                                                            </label>
                                                                        </div>
                                                                    ))
                                                                    :
                                                                    enableBounce &&(
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
                                                <div>
                                                    <div className="card_data2">
                                                        <Card className="mapping_data_card2">
                                                            <div className="dropdown_div">
                                                                <div className="dropdown-map">
                                                                    <span>Project <span style={{ color: 'red' }}>*</span></span>
                                                                </div>
                                                                <div className="dropdown-map">
                                                                    {/* <Dropdown options={avoProjects} style={{ width: '11rem', height: '2.5rem' }} value={selectedAvo} onChange={(e) => onAvoProjectChange(e)} className="dropdown_project" placeholder="Select Project" /> */}
                                                                    <span className="selected_projName" title={reduxDefaultselectedProject.projectName}>{reduxDefaultselectedProject.projectName}</span>
                                                                </div>

                                                                <div>
                                                                    {/* {currentScenarios.map((scenario) => ( */}
                                                                    <div className="avotest__data">
                                                                        <Tree value={treeData} selectionMode="multiple" selectionKeys={selectedNodes} nodeTemplate={checkboxTemplate} className="avoProject_tree" />
                                                                    </div>
                                                                    {/* ))} */}
                                                                    <div className="testcase__AVO__jira__paginator">

                                                                        <Paginator
                                                                            first={indexOfFirstScenario}
                                                                            rows={scenariosPerPage}
                                                                            totalRecords={listofScenarios.length}
                                                                            onPageChange={onPageAvoChange}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    </div>
                                                </div>
                                                <span>
                                                    <Button className="map__btn" label="Map" size="small" onClick={()=>handleSync()}/>
                                                </span>
                                            </div>

                                        </TabPanel>

                                            <TabPanel header="View Mapping">
                                                <Card className="view_map_card">
                                                    <div className="flex justify-content-flex-start toggle_btn">
                                                        <span>Jira Test case to Avo Assure Test case</span>
                                                        <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                                                        <span>Avo Assure Test case to Jira Test case</span>
                                                    </div>

                                                    <div className="accordion_testcase">
                                                        <Accordion multiple activeIndex={0}>
                                                            {rows.map((item) => (
                                                                <AccordionTab header={<span>{item.itemSummary} <i className="pi pi-times cross_icon" onClick={() => handleUnSyncmappedData(item)}/></span>}>
                                                                    <span>{item.scenarioNames[0]}</span>
                                                                </AccordionTab>))}
                                                        </Accordion>
                                                    </div>
                                            </Card>
                                            </TabPanel>               
                                    </TabView>

                                
                                </div> 
                           </div>
                            )
                        : selectedscreen.name === "Zephyr" && Index === 0 ? 
                            <ZephyrContent ref={zephyrRef} domainDetails={domainDetails} setToast={setToast} callZephyrSaveButton={callZephyrSaveButton} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
                        : selectedscreen.name === "Azure DevOps" && Index === 0 ?
                            <AzureContent setFooterIntegrations={footerIntegrations} ref={azureRef} callAzureSaveButton={callAzureSaveButton} setToast={setToast} issueTypes={issueTypes} projectDetails={projectDetails} selectedNodes={selectedNodes} setSelectedNodes={setSelectedNodes} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
                        : selectedscreen.name == "TestRail" && Index === 0 ? 
                            <TestRailContent ref={testrailRef} domainDetails={domainDetails} issueTypes={issueTypes} setToast={setToast} />
                        : selectedscreen.name === "CloudALM" && Index === 0 ? calmTestCaseData && <CloudALMContent activeIndex={activeIndex} handleTabChange={handleTabChange} testCaseData={calmTestCaseData} />
                        : null
                    }
                    <Toast ref={toast} position="bottom-center" baseZIndex={1000} />
                </Dialog>
            </div>
        </>
    )
}

export default React.memo(ManageIntegrations);