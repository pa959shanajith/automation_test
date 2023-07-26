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
import { useDispatch, useSelector } from 'react-redux';
import { screenType } from '../settingSlice'
import * as api from '../api.js';
import { RedirectPage, Messages as MSG, setMsg } from '../../global';
import { Toast } from "primereact/toast";
import {
    resetIntergrationLogin, resetScreen, selectedProject,
    selectedIssue, selectedTCReqDetails, selectedTestCase,
    syncedTestCases, mappedPair, selectedScenarioIds,
    selectedAvoproject
} from '../settingSlice';
import { InputSwitch } from "primereact/inputswitch";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Checkbox } from 'primereact/checkbox';
import { Tree } from 'primereact/tree';
// import { checkboxTemplate } from './path/to/checkboxTemplate';


const ManageIntegrations = ({ visible, onHide }) => {
    // selectors
    const currentProject = useSelector(state => state.setting.selectedProject);
    const currentIssue = useSelector(state => state.setting.selectedIssue);
    const selectedZTCDetails = useSelector(state => state.setting.selectedZTCDetails);
    const selectedScIds = useSelector(state => state.setting.selectedScenarioIds);
    const selectedAvo = useSelector(state => state.setting.selectedAvoproject);
    // state
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeIndexViewMap, setActiveIndexViewMap] = useState(0);
    const [showLoginCard, setShowLoginCard] = useState(true);
    const selectedscreen = useSelector(state => state.setting.screenType);
    const loginDetails = useSelector(state => state.setting.intergrationLogin);
    const [isSpin, setIsSpin] = useState(false);
    const [checked, setChecked] = useState(false);
    const [projectDetails, setProjectDetails] = useState([]);
    const [issueTypes, setIssueTypes] = useState([]);
    const [disableIssue, setDisableIssue] = useState(true)
    const [testCaseData, setTestCaseData] = useState([]);
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
    const [selectedNodes, setSelectedNodes] =useState([]);


    // const [proj, setProj] = useState('');
    // const [projCode, setProjCode] = useState('');
    // const [projName, setProjName] = useState('');
    // const [releaseId, setReleaseId] = useState('');
    const toast = useRef();

    const dispatchAction = useDispatch();

    const handleIntegration = useCallback((value) => {
        dispatchAction(screenType(value));
    }, [])

    const handleSubmit = () => {
        setIsSpin(true);
        // console.log(reduxDefaultselectedProject);

        switch (selectedscreen.name) {
            case 'jira':
                callLogin_Jira();
                break;
            case 'Zephyr':
                break;
            case 'Azue DevOps':
                break;
            case 'ALM':
                break;
            case 'qTest':
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
        if (domainDetails.error) setMsg(domainDetails.error);
        else if (domainDetails === "unavailableLocalServer") setToast("error", "Error", "ICE Engine is not available, Please run the batch file and connect to the Server.");
        else if (domainDetails === "scheduleModeOn") setToast("warn", "Warning", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
        else if (domainDetails === "Invalid Session") {
            setToast("error", "Error", "Session Expired please login again");
            setIsSpin(false);
            // return RedirectPage(history);
        }
        else if (domainDetails === "invalidcredentials") setToast("error", "Error", "Invalid Credentials");
        else if (domainDetails === "fail") setToast("error", "Error", "Fail to Login");
        else if (domainDetails === "notreachable") setToast("error", "Error", "Host not reachable.");
        else if (domainDetails) {
            if (Object.keys(domainDetails).length && domainDetails.projects) {
                setProjectDetails(domainDetails.projects.map((el) => { return { label: el.name, value: el.code, key: el.id } }))
                setIssueTypes(domainDetails.issue_types.map((el) => { return { label: el.name, value: el.id, key: el.id } }))
            }
            setToast("success", "Success", `${selectedscreen.name} login successful`);
            setShowLoginCard(false);
        }
        setIsSpin(false);
    }

    const setToast = (tag, summary, msg) => {
        toast.current.show({ severity: tag, summary: summary, detail: msg, life: 10000 });
    }

    const integrationItems = [
        { label: 'ALM' },
        { label: 'Cloud Based Integration' },
    ];

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
            jiraCase: 'Jira TestCase 1',
        },
        {
            id: 2,
            name: 'Test Case 2',
            jiraCase: 'Jira TestCase 2'
        },
        {
            id: 3,
            name: 'Test Case 3',
            jiraCase: 'Jira TestCase 3'
        },
    ];


    const IntegrationTypes = [
        { name: 'jira', code: 'NY' },
        { name: 'Zephyr', code: 'RM' },
        { name: 'Azure DevOps', code: 'LDN' },
        { name: 'ALM', code: 'LDN' },
        { name: 'qTest', code: 'LDN' },
    ];

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
        setAvoProjectsList([]);
        setAvoProjects([]);
        dispatchAction(selectedAvoproject(''))
        setListofScenarios([])
        setShowLoginCard(true);
        setIsSpin(false);
        onHide();
    }

    

    const dropdownOptions = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
    ];

    const handleTabChange = (index) => {
        setActiveIndex(index);
    };

    const showCard2 = () => {
        handleSubmit();
    };

    const onCheckboxChange = (nodeKey) => {
        const nodeIndex = selectedNodes.indexOf(nodeKey);
        const newSelectedNodes = [...selectedNodes];
        if (nodeIndex !== -1) {
          newSelectedNodes.splice(nodeIndex, 1);
        } else {
          newSelectedNodes.push(nodeKey);
        }
        setSelectedNodes(newSelectedNodes);
      };

    const checkboxTemplate = (node) => {
        return (
            <div style={{width: '100%'}}>
          <Checkbox
            checked={selectedNodes.includes(node.key)}
            onChange={() => onCheckboxChange(node.key)}
          />
          <span>{node.label} </span>
          <i className="pi pi-times" style={{ float: 'right'}}></i>
          </div>
        );
      };

    const showLogin = () => {
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
        setAvoProjectsList([]);
        setAvoProjects([]);
        setListofScenarios([]);
        dispatchAction(selectedAvoproject(''))
    };

    useEffect(() => {
        onAvoProjectChange(reduxDefaultselectedProject.projectId);
      }, [showLogin]);

    const onProjectChange = async (e) => {
        e.preventDefault();
        dispatchAction(selectedProject(e.target.value));
        setDisableIssue(false);
        console.log(e.target.value, ' project e');
        // const releaseId = e.target.value;
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
            // setSelectedRel(releaseId);  
            // clearSelections();
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
            setTestCaseData(testData.testcases)
        }
        setEnableBounce(false);
    }
    const onAvoProjectChange = async (e) => {
        dispatchAction(selectedAvoproject(reduxDefaultselectedProject.projectId));
        if(avoProjectsList.length){
            let filterScns = avoProjectsList.filter(el => el.project_id === reduxDefaultselectedProject.projectId)[0]['scenario_details'] || [];
            setListofScenarios(filterScns);

            const dummyTestCases = [
                {
                  _id: 'testcase-1',
                  name: 'Test Case 1',
                },
                {
                  _id: 'testcase-2',
                  name: 'Test Case 2',
                },
                {
                    _id: 'testcase-2',
                    name: 'Test Case 2',
                  },
                  {
                    _id: 'testcase-2',
                    name: 'Test Case 2',
                  },
                  {
                    _id: 'testcase-2',
                    name: 'Test Case 2',
                  },
              ];

            let treeData = selectedAvoproject
                ? filterScns.map((scenario) => ({
                    key: scenario._id,
                    label: scenario.name,
                    data: { type: 'scenario' },
                    children: dummyTestCases.map((testCase) => ({
                        key: testCase._id,
                        label: testCase.name,
                        data: { type: 'testCase' },
                      })),
                })) 
                
                : []
                setTreeData(treeData);
        }
    }
    const handleClick = useCallback((value, id, summary) => {
        let newSelectedTCDetails = { ...selectedZTCDetails };
        let newSelectedTC = [...value, summary];
        setSelected(value)
        setSelectedId(id)
        setSelectedSummary(summary)
        setDisabled(true)
        dispatchAction(selectedTCReqDetails(newSelectedTCDetails));
        dispatchAction(syncedTestCases([]));
        dispatchAction(selectedTestCase(newSelectedTC));
    }, [])

    const handleSync = useCallback(() => {
        let popupMsg = false;
        let currentProject = projectDetails.filter(el => el.value === currentProject)[0];
        let releaseId = issueTypes.filter(el => el.value === currentIssue)[0]['label'];
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
            // label:el.name , value:el.code, key:el.id
            const mappedPairObj = [
                {
                    projectId: currentProject.id,
                    projectCode: currentProject.code,
                    projectName: currentProject.label,
                    testId: selectedId,
                    testCode: selected,
                    scenarioId: selectedScIds,
                    itemType: releaseId,
                    itemSummary: selectedSummary


                }
            ];
            dispatchAction(mappedPair(mappedPairObj));
            console.log(mappedPairObj);
            dispatchAction(syncedTestCases(selected));
        }
        setDisabled(false);
    }, [])

    const handleUnSync = useCallback(() => {
        dispatchAction(mappedPair([]));
        dispatchAction(syncedTestCases([]));
        dispatchAction(selectedTestCase([]));
        dispatchAction(selectedScenarioIds([]));
        // clearSelections();
        setDisabled(true)
        setSelected(false)
    }, [])

    // const logoutTab = {
    //     label: '',
    //     content: null,
    //     template: (
    //       <Button label={selectedscreen.name && `${selectedscreen.name} Logout`} onClick={showLogin} className="logout__btn" />
    //     ),
    //   };

    //   if (!showLoginCard) {
    //     integrationItems.push(logoutTab);
    //   }

    const footerIntegrations = (
        <div className='btn-11'>
            {activeIndex === 0 &&(
                <div className="btn__2">
                    <Button label="Save" severity="primary" className='btn1' />
                    <Button label="Back" onClick={showLogin} size="small" className="logout__btn" />
                </div>)}

                {activeIndex === 1 && (
                <Button label="Back" onClick={showLogin} size="small" className="cancel__btn" />)}

        </div>
    );

    const IntergrationLogin = useMemo(() => <LoginModal isSpin={isSpin} showCard2={showCard2} selectedscreen={selectedscreen} handleIntegration={handleIntegration} />, [isSpin, showCard2, selectedscreen, handleIntegration])


    return (
        <>
            <div className="card flex justify-content-center">
                <Dialog className="manage_integrations" header={selectedscreen.name ? `Manage Integration: ${selectedscreen.name} Integration` : 'Manage Integrations'} visible={visible} style={{ width: '70vw', height: '45vw' }} onHide={handleCloseManageIntegrations} footer={!showLoginCard ? footerIntegrations : ""}>
                    <div className="card">
                        {showLoginCard ? <TabMenu model={integrationItems} /> : ""}
                    </div>


                    {showLoginCard ? (
                        <>
                            {IntergrationLogin}
                        </>
                    ) : (
                        <div>
                            <div className="tab__cls">
                                <TabView activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
                                    <TabPanel header="Mapping">
                                        <div className="data__mapping">
                                            <div className="card_data1">
                                                <Card className="mapping_data_card1">
                                                    <div className="dropdown_div">
                                                        <div className="dropdown-map">
                                                            <span>Select Project <span style={{ color: 'red' }}>*</span></span>
                                                            <span className="release_span"> Select Release<span style={{ color: 'red' }}>*</span></span>
                                                        </div>
                                                        <div className="dropdown-map">
                                                            <Dropdown style={{ width: '11rem', height: '2.5rem' }} value={currentProject} className="dropdown_project" options={projectDetails} onChange={(e) => onProjectChange(e)} placeholder="Select Project" />
                                                            <Dropdown disabled={disableIssue} style={{ width: '11rem', height: '2.5rem' }} value={currentIssue} className="dropdown_release" options={issueTypes} onChange={(e) => onIssueChange(e)} placeholder="Select Release" />
                                                        </div>
                                                    </div>
                                                    <div className="testcase__data">
                                                        {
                                                            testCaseData && testCaseData.length ?
                                                                testCaseData.map((e, i) => (
                                                                    <div className={"test_tree_leaves" + (selected === e.code ? " test__selectedTC" : "")}>
                                                                        <label className="test__leaf" title={e.code} onClick={() => handleClick(e.code, e.id, e.summary)}>
                                                                            <Checkbox onChange={e => setCheckedTestcase(e.checkedTestcase)} checked={checkedTestcase} />
                                                                            <span className="leafId">{e.code}</span>
                                                                            <span className="test__tcName" title={e.summary}>{e.summary.trim().length > 35 ? e.summary.substr(0, 35) + "..." : e.summary} </span>
                                                                        </label>
                                                                    </div>
                                                                ))
                                                                :
                                                                enableBounce &&
                                                                <div className="bouncing-loader">
                                                                    <div></div>
                                                                    <div></div>
                                                                    <div></div>
                                                                </div>

                                                        }
                                                    </div>
                                                </Card>
                                            </div>
                                            <span>
                                                <img className="map__btn" src="static/imgs/map_button_icon.svg" />
                                            </span>
                                            <div>
                                                <div className="card_data2">
                                                    <Card className="mapping_data_card2">
                                                        <div className="dropdown_div">
                                                            <div className="dropdown-map">
                                                                <span>Selected Project <span style={{ color: 'red' }}>*</span></span>
                                                            </div>
                                                            <div className="dropdown-map">
                                                                {/* <Dropdown options={avoProjects} style={{ width: '11rem', height: '2.5rem' }} value={selectedAvo} onChange={(e) => onAvoProjectChange(e)} className="dropdown_project" placeholder="Select Project" /> */}
                                                               <span className="selected_projName" title={reduxDefaultselectedProject.projectName}>{reduxDefaultselectedProject.projectName}</span>
                                                            </div>

                                                           <div className="avotest__data">
                                                           <Tree value={treeData} selectionMode="multiple" selectionKeys={selectedNodes} nodeTemplate={checkboxTemplate} className="avoProject_tree" />
                                                         </div>
                                                        </div>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>

                                    </TabPanel>

                                    <TabPanel header="View Mapping">
                                        <Card className="view_map_card">
                                            <div className="flex justify-content-flex-start toggle_btn">
                                                <span>Jira Testcase to Avo Assure Testcase</span>
                                                <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                                                <span>Avo Assure Testcase to Jira Testcase</span>
                                            </div>

                                            {checked ? (<div className="accordion_testcase">
                                                <Accordion multiple activeIndex={0} >
                                                    {avoTestCase.map((jiraCase) => (
                                                        <AccordionTab header="Avo Assure Testcase">
                                                            <span>{jiraCase.jiraCase}</span>
                                                        </AccordionTab>))}
                                                </Accordion>
                                            </div>

                                            ) : (

                                                <div className="accordion_testcase">
                                                    <Accordion multiple activeIndex={0}>
                                                        {jiraTestCase.map((testCase) => (
                                                            <AccordionTab header="Jira Testcase">
                                                                <span>{testCase.avoassure}</span>
                                                            </AccordionTab>))}
                                                    </Accordion>
                                                </div>
                                            )}
                                        </Card>

                                    </TabPanel>

                                </TabView>

                            </div>
                        </div>
                    )}


                    <Toast ref={toast} position="bottom-center" baseZIndex={1000} />
                </Dialog>
            </div>

        </>
    )
}

export default React.memo(ManageIntegrations);