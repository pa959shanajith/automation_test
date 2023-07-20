import React, { useCallback, useMemo, useState, useRef } from "react";
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
import { resetIntergrationLogin, resetScreen,selectedProject,selectedIssue } from '../settingSlice';
import { InputSwitch } from "primereact/inputswitch";
import { Accordion, AccordionTab } from 'primereact/accordion';



const ManageIntegrations = ({ visible, onHide }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeIndexViewMap, setActiveIndexViewMap] = useState(0);
    const [showLoginCard, setShowLoginCard] = useState(true);
    const selectedscreen = useSelector(state => state.setting.screenType);
    const loginDetails = useSelector(state => state.setting.intergrationLogin);
    const [isSpin, setIsSpin] = useState(false);
    const [checked, setChecked] = useState(false);
    const [projectDetails,setProjectDetails] = useState([]);
    const [issueTypes,setIssueTypes] = useState([]);
    const [disableIssue,setDisableIssue] = useState(true)
    const currentProject = useSelector(state => state.setting.selectedProject);
    const currentIssue = useSelector(state => state.setting.selectedIssue);
    const toast = useRef();

    const dispatchAction = useDispatch();

    const handleIntegration = useCallback((value) => {
        // setSelectedIntegrationType(value);
        dispatchAction(screenType(value));
    }, [])

    const handleSubmit = () => {
        setIsSpin(true);
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
            // dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            // return RedirectPage(history);
        }
        else if (domainDetails === "invalidcredentials") setToast("error", "Error", "Invalid Credentials");
        else if (domainDetails === "fail") setToast("error", "Error", "Fail to Login");
        else if (domainDetails === "notreachable") setToast("error", "Error", "Host not reachable.");
        else if (domainDetails) {
            if(Object.keys(domainDetails).length && domainDetails.projects){
                setProjectDetails(domainDetails.projects.map((el) => {return {label:el.name , value:el.code, key:el.id}}))
                setIssueTypes(domainDetails.issue_types.map((el) => {return {label:el.name , value:el.id, key:el.id}}))
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
        { label: 'AML' },
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

    const showLogin = () => {
        dispatchAction(resetIntergrationLogin());
        dispatchAction(resetScreen());
        setShowLoginCard(true);
        dispatchAction(selectedProject(''));
        dispatchAction(selectedIssue(''));
    };

    const onProjectChange = (e) => {
        e.preventDefault();
        dispatchAction(selectedProject(e.target.value));
        setDisableIssue(false);
        console.log(e.target.value, ' project e');
    }

    const onIssueChange = async (e) => {
        e.preventDefault();
        console.log(e.target.value, ' project f');
        dispatchAction(selectedIssue(e.target.value));
        let projectName = projectDetails.filter(el => el.value === currentProject)[0]['label'];
        let issueName = issueTypes.filter(el => el.value === currentIssue)[0]['label'];
        console.log(projectDetails,' /n',projectName);
        let jira_info ={
            project: projectName,
            action:'getJiraTestcases',
            issuetype: "",
            itemType:issueName, 
            url: loginDetails.url,
            username: loginDetails.username,
            password: loginDetails.password,
            project_data: [],
            key:currentProject
        }
        console.log(jira_info, ' jira_info ');
        const testData = await api.getJiraTestcases_ICE(jira_info)
        // setTestCaseData(testData.testcases)

    }

    const logoutTab = {
        label: '',
        content: null,
        template: (
          <Button label={selectedscreen.name && `${selectedscreen.name} Logout`} onClick={showLogin} className="logout__btn" />
        ),
      };

      if (!showLoginCard) {
        integrationItems.push(logoutTab);
      }

    const footerIntegrations = (
        <div className='btn-11'>
            <Button label="Save" severity="primary" className='btn1' />
        </div>
    );

    const IntergrationLogin = useMemo(() => <LoginModal isSpin={isSpin} showCard2={showCard2}  />, [isSpin,showCard2])


    return (
        <>
            <div className="card flex justify-content-center">
                <Dialog className="manage_integrations" header={selectedscreen.name ? `Manage Integration: ${selectedscreen.name} Integration` : 'Manage Integrations'} visible={visible} style={{ width: '70vw', height: '45vw' }} onHide={handleCloseManageIntegrations} footer={!showLoginCard ? footerIntegrations : ""}>
                    <div className="card">
                        <TabMenu model={integrationItems} />
                    </div>


                    {showLoginCard ? (
                        <>
                            <div className="login_container_integrations">
                                <div className="side-panel">
                                    <div className={`icon-wrapper ${selectedscreen?.name === 'jira' ? 'selected' : ''}`} onClick={() => handleIntegration({ name: 'jira', code: 'NY' })}>
                                        <span><img src="static/imgs/jira_icon.svg" className="img__jira"></img></span>
                                        <span className="text__jira">Jira</span>
                                    </div>
                                    <div className={`icon-wrapper ${selectedscreen?.name === 'Zephyr' ? 'selected' : ''}`} onClick={() => handleIntegration({ name: 'Zephyr', code: 'RM' })}>
                                        <span><img src="static/imgs/azure_devops_icon.svg" className="img__azure"></img></span>
                                        <span className="text__azure">Azure DevOps</span>
                                    </div>
                                    <div className={`icon-wrapper ${selectedscreen?.name === 'Azure DevOps' ? 'selected' : ''}`} onClick={() => handleIntegration({ name: 'Azure DevOps', code: 'LDN' })}>
                                        <span><img src="static/imgs/zephyr_icon.svg" className="img__zephyr"></img></span>
                                        <span className="text__zephyr">Zephyr</span>
                                    </div>
                                    <div className={`icon-wrapper ${selectedscreen?.name === 'qTest' ? 'selected' : ''}`} onClick={() => handleIntegration({ name: 'qTest', code: 'LDN' })}>
                                        <span><img src="static/imgs/qTest_icon.svg" className="img__qtest"></img></span>
                                        <span className="text__qtest">qTest</span>
                                    </div>
                                    <div className={`icon-wrapper ${selectedscreen?.name === 'ALM' ? 'selected' : ''}`} onClick={() => handleIntegration({ name: 'ALM', code: 'LDN' })}>
                                        <span><img src="static/imgs/ALM_icon.svg" className="img__alm"></img></span>
                                        <span className="text__alm">ALM</span>
                                    </div>
                                </div>
                                {IntergrationLogin}
                                {/* <Card className="card__login__jira">
                                    <div className="Login__jira">

                                        <p style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }} className="login-cls">Login </p>
                                        <div className="input-cls">
                                            <span>Username <span style={{ color: 'red' }}>*</span></span>
                                            <span className="p-float-label" style={{ marginLeft: '1.5rem' }}>
                                                <InputText style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="username" value={value} onChange={(e) => setValue(e.target.value)} />
                                                <label htmlFor="username">Username</label>
                                            </span>
                                        </div>
                                        <div className="passwrd-cls">
                                            <span>Password <span style={{ color: 'red' }}>*</span></span>
                                            <Password style={{ width: '20rem', height: '2.5rem', marginLeft: '2rem' }} className="input-txt1" value={passeordValue} onChange={(e) => setPasswordValue(e.target.passeordValue)} toggleMask />
                                        </div>
                                        <div className="url-cls">
                                            <span>URL <span style={{ color: 'red' }}>*</span></span>
                                            <span className="p-float-label" style={{ marginLeft: '4.5rem' }}>
                                                <InputText style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="URL" value={value} onChange={(e) => setValue(e.target.value)} />
                                                <label htmlFor="username">URL</label>
                                            </span>
                                        </div>
                                        <div className="login__div">
                                            <Button size="small" label="login" onClick={showCard2} className="login__btn"></Button>
                                        </div>

                                    </div>
                                </Card> */}
                            </div>
                        </>


                        // <div>
                        //   <p style={{marginBottom:'0.5rem',marginTop:'0.5rem'}} className="login-cls">Login </p>
                        //   <div className="input-cls">
                        //   <span>Username <span style={{color:'red'}}>*</span></span>
                        //     <span className="p-float-label" style={{marginLeft:'1.5rem'}}>
                        //         <InputText style={{width:'20rem', height:'2.5rem'}} className="input-txt1" id="username" value={value} onChange={(e) => setValue(e.target.value)} />
                        //         <label htmlFor="username">Username</label>
                        //     </span>
                        //     </div>
                        //     <div className="passwrd-cls">
                        //     <span>Password <span style={{color:'red'}}>*</span></span>
                        //     <Password style={{width:'20rem', height:'2.5rem' , marginLeft:'2rem'}} className="input-txt1"value={passeordValue} onChange={(e) => setPasswordValue(e.target.passeordValue)} toggleMask />
                        //     </div>
                        //     <div className="url-cls">
                        //     <span>URL <span style={{color:'red'}}>*</span></span>
                        //     <span className="p-float-label" style={{marginLeft:'4.5rem'}}>
                        //         <InputText  style={{width:'20rem', height:'2.5rem'}}className="input-txt1" id="URL" value={value} onChange={(e) => setValue(e.target.value)} />
                        //         <label htmlFor="username">URL</label>
                        //     </span>
                        //     </div>
                        //     <div>
                        //         <Button className="loginbtn-jira"  onClick={showCard2} label="Login"></Button>
                        //     </div>

                        // </div>
                    ) : (
                        <div>
                            {/* <span className="integration_header">Jira Integration</span> */}
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
                                                            <Dropdown style={{ width: '11rem', height: '2.5rem' }} value={currentProject} className="dropdown_project" options={projectDetails} onChange={(e) => onProjectChange(e) } placeholder="Select Project" />
                                                            <Dropdown disabled={disableIssue} style={{ width: '11rem', height: '2.5rem' }} value={currentIssue} className="dropdown_release" options={issueTypes} onChange={(e) => onIssueChange(e)} placeholder="Select Release" />
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>

                                            <div>
                                                <div className="card_data2">
                                                    <Card className="mapping_data_card2">
                                                        <div className="dropdown_div">
                                                            <div className="dropdown-map">
                                                                <span>Select Project <span style={{ color: 'red' }}>*</span></span>
                                                            </div>
                                                            <div className="dropdown-map">
                                                                <Dropdown options={dropdownOptions} style={{ width: '11rem', height: '2.5rem' }} className="dropdown_project" placeholder="Select Project" />
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