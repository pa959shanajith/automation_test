import React, { useCallback, useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from 'primereact/password';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDispatch, useSelector } from 'react-redux';
import { IntergrationLogin, zephyrLogin, AzureLogin, screenType, resetZephyrLogin, resetIntergrationLogin, resetAzureLogin, testRailLogin, resetTestRailLogin } from '../settingSlice';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { Tooltip } from 'primereact/tooltip';
import { AdminActions } from '../../admin/adminSlice';
import "../styles/manageIntegrations.scss";
import ZephyrContent from "../Components/ZephyrContent";
// import { useDispatch } from 'react-redux';
import GitConfig from "../containers/GitConfig";
import { Toast } from "primereact/toast";
import { Checkbox } from 'primereact/checkbox';
import { Messages as MSG } from '../../global/components/Messages';
import { RedirectPage, ScreenOverlay,ResetSession,setMsg, VARIANT} from '../../global';
import {manageJiraDetails, manageZephyrDetails, manageAzureDetails, getDetails_Azure, getDetails_JIRA, getDetails_ZEPHYR, manageTestRailDetails, getDetails_Testrail, loginToTestRail_ICE} from "../api"
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";




const LoginModal = ({ isSpin, showCard2, handleIntegration, setShowLoginCard, setAuthType, authType }) => {
    const toast = useRef();
    // list of selectors
    const loginDetails = useSelector(state => state.setting.intergrationLogin);
    const testRailLoginDetails = useSelector(state => state.setting.testRailLogin);
    const selectedscreen = useSelector(state => state.setting.screenType);
    const zephyrLoginDetails = useSelector(state => state.setting.zephyrLogin);
    const AzureLoginDetails = useSelector(state => state.setting.AzureLogin);
    // list of states
    const [disableFields, setDisableFields] = useState(false)
    const dispatchAction = useDispatch();
    const [loginType, setLoginType] = useState('basic');
    const [zephyrVisible, setZephyrVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showUserGitConfig, setShowUserGitConfig] = useState(false);
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false)
    const [isEmpty, setIsEmpty] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [disableLoginBtn, setDisableLoginBtn] = useState(false);


    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if (!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo;

    const toastError = (erroMessage) => {
        if (erroMessage.CONTENT) {
            toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
    else toast.current.show({ severity: 'error', summary: 'Error', detail:JSON.stringify(erroMessage), life: 5000 });
    }

    const toastSuccess = (successMessage) => {
        if (successMessage.CONTENT) {
            toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: JSON.stringify(successMessage), life: 5000 });
    }

    const toastWarn = (warnMessage) => {
        if (warnMessage.CONTENT) {
            toast.current.show({ severity: warnMessage.VARIANT, summary: 'Warning', detail: warnMessage.CONTENT, life: 5000 });
        }
    else toast.current.show({ severity: 'warn', summary: 'Warning', detail:  JSON.stringify(warnMessage), life: 5000 });
    }


    const handleLogin = (name, value) => {
        switch (selectedscreen.name) {
            case 'Jira':
                dispatchAction(IntergrationLogin({ fieldName: name, value }));
                break;
            case 'Zephyr':
                dispatchAction(zephyrLogin({ fieldName: name, value }));
                break;
            case 'TestRail':
                dispatchAction(testRailLogin({ fieldName: name, value }));
                break;
            case 'Azure DevOps':
                dispatchAction(AzureLogin({ fieldName: name, value }));
                break;
            case 'ALM':
                break;
            case 'qTest':
                break;
            default:
                break;
        }

    }

    // const handleButtonClick = () => {
    //     setShowUserGitConfig(!showUserGitConfig);
    //   };

    const handleScreenType = (value) => {
        dispatchAction(screenType(value))
    }

    const handleRadioChange = (e) => {
        setAuthType(e.value);
    };

    const zephyrDialog = () => {
        setZephyrVisible(true);
    };

    const zephyrhideDialog = () => {
        setZephyrVisible(false);
    };
    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

    const getJiraDetails = async () =>{
        try {
            setLoading("Loading...")
            const data = await getDetails_JIRA()
            setLoading(false);
            if (data.error) { setMsg(data.error); return; }
            if(data==="empty"){
                dispatchAction(IntergrationLogin({ fieldName: "url", value: "" }));
                dispatchAction(IntergrationLogin({ fieldName: "username", value: ""}));
                dispatchAction(IntergrationLogin({ fieldName: "password", value: ""}));
                setIsEmpty(true);
            }
            else{                
                dispatchAction(IntergrationLogin({ fieldName: "url", value: data.jiraURL }));
                dispatchAction(IntergrationLogin({ fieldName: "username", value: data.jiraUsername}));
                dispatchAction(IntergrationLogin({ fieldName: "password", value: data.jirakey}));
                setIsEmpty(false);
            }
        } catch (error) {
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }

    useEffect(() => {
        let disbalebtn = false;
        switch (selectedscreen.name) {
            case 'Jira':
                disbalebtn = loginDetails.url && loginDetails.username && loginDetails.password;
                setDisableLoginBtn(!disbalebtn);
                break;
            case 'Zephyr':
                disbalebtn = zephyrLoginDetails.url && zephyrLoginDetails.username && zephyrLoginDetails.password;
                setDisableLoginBtn(!disbalebtn);
                break;
            case 'Azure DevOps':
                disbalebtn = AzureLoginDetails.url && AzureLoginDetails.username && AzureLoginDetails.password;
                setDisableLoginBtn(!disbalebtn);
                break;
            case 'TestRail':
                disbalebtn = testRailLoginDetails.url && testRailLoginDetails.username && testRailLoginDetails.apiKey;
                setDisableLoginBtn(!disbalebtn);
                break;
            case 'ALM':
                break;
            case 'qTest':
                break;
            default:
                break;
        }
        // return disbalebtn;
    },[selectedscreen.name, loginDetails,zephyrLoginDetails,AzureLoginDetails, testRailLoginDetails])

    const getAzureDetails = async () => {
        try {
            setLoading("Loading...")
            const data = await getDetails_Azure();
            setLoading(false);
            if (data.error) { setMsg(data.error); return; }
            if(data==="empty"){
                dispatchAction(AzureLogin({ fieldName: "url", value: ""  }));
                dispatchAction(AzureLogin({ fieldName: "username", value: "" }));
                dispatchAction(AzureLogin({ fieldName: "password", value: "" }));
                setIsEmpty(true);
            }
            else{
                dispatchAction(AzureLogin({ fieldName: "url", value: data.AzureURL  }));
                dispatchAction(AzureLogin({ fieldName: "username", value: data.AzureUsername }));
                dispatchAction(AzureLogin({ fieldName: "password", value: data.AzurePAT }));
                setIsEmpty(false);
            }
        } catch (error) {
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }

    const getZephyrDetails = async () =>{
        try {
            setLoading("Loading...")
            const data = await getDetails_ZEPHYR()
            setLoading(false);
            if (data.error) { setMsg(data.error); return; }
            if(data==="empty"){
                dispatchAction(zephyrLogin({ fieldName: "username", value: ""  }));
                dispatchAction(zephyrLogin({ fieldName: "password", value: ""  }));
                dispatchAction(zephyrLogin({ fieldName: "url", value: ""  }));
                dispatchAction(zephyrLogin({ fieldName: "token", value: ""  }));
                setIsEmpty(true);

            }
            else{
                dispatchAction(zephyrLogin({ fieldName: "username", value: data.zephyrUsername  }));
                dispatchAction(zephyrLogin({ fieldName: "password", value: data.zephyrPassword  }));
                dispatchAction(zephyrLogin({ fieldName: "url", value: data.zephyrURL  }));
                dispatchAction(zephyrLogin({ fieldName: "token", value: data.zephyrToken  }));
                setIsEmpty(false);
            }
        } catch (error) {
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
        
    }

    const getTestRailDetails = async () => {
        try {
            setLoading("Loading...")
            const testRailData = await getDetails_Testrail();
            
            setLoading(false);

            if (testRailData === "empty") setMsg(testRailData);
            if (testRailData == {} || testRailData === "empty" || testRailData.error == "fail" ) {
                setIsEmpty(true);
                dispatchAction(testRailLogin({ fieldName: "url", value: "" }));
                dispatchAction(testRailLogin({ fieldName: "username", value: "" }));
                dispatchAction(testRailLogin({ fieldName: "apiKey", value: "" }));
            }
            else {
                dispatchAction(testRailLogin({ fieldName: "url", value: testRailData.url }));
                dispatchAction(testRailLogin({ fieldName: "username", value: testRailData.username }));
                dispatchAction(testRailLogin({ fieldName: "apiKey", value: testRailData.apiKey }));
                setIsEmpty(false);
            }
        } catch (error) {
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }

    useEffect(()=>{
        getJiraDetails();
    },[])

    const loginHandler = async() => {
     let testrailLogin = true;
     if(checked){
            switch (selectedscreen.name) {
                case 'Jira':
                try{
                    setLoading('Updating...');
                    var data = await manageJiraDetails(isEmpty?"create":"update", loginDetails);
                        setLoading(false);
                    if(data.error){
                            toastError(data.error);
                            return;
                        }
                        // setCreateJira(false);
                        toastSuccess(MSG.CUSTOM(`The JIRA configuration was successfully created`, VARIANT.SUCCESS));
                        //    getJiraDetails();
                }catch(e){
                        toastError(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
                    }
                    break;
                case 'Zephyr':
                try{
                        let zephyrObj = {
                            url: zephyrLoginDetails.url,
                            authType: zephyrLoginDetails.authType
                        }
                    if(zephyrLoginDetails.username && zephyrLoginDetails.password){
                            zephyrObj['username'] = zephyrLoginDetails.username;
                            zephyrObj['password'] = zephyrLoginDetails.password;
                        }
                    if(zephyrLoginDetails.token) {
                            zephyrObj['token'] = zephyrLoginDetails.token;
                        }
                    setLoading('Updating...');
                    var data = await manageZephyrDetails(isEmpty?"create":"update", zephyrObj);
                        setLoading(false);
                    if(data.error){
                            toastError(data.error);
                            return;
                        }
                        // setCreateZephyr(false);
                        toastSuccess(MSG.CUSTOM(`The Zephyr configuration is successfully created`, VARIANT.SUCCESS));
                        //    getZephyrDetails();
                }catch(e){
                        toastError(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
                    }
                    break;
                case 'Azure DevOps':
                try{
                    setLoading('Updating...');
                    var data = await manageAzureDetails(isEmpty?"create":"update", AzureLoginDetails);
                        setLoading(false);
                    if(data.error){
                            toastError(data.error);
                            return;
                        }
                        // setCreateAzure(false);
                        toastSuccess(MSG.CUSTOM(`The Azure DevOps configuration was successfully created`, VARIANT.SUCCESS));
                        //    getAzureDetails();
                }catch(e){
                        toastError(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
                    }
                    break;
                case 'ALM':
                    break;
                case 'qTest':
                    break;
                case 'TestRail':
                    try {
                        setLoading('Updating...');
                        const userObj = {
                            "TestRailUrl": testRailLoginDetails.url,
                            "TestRailUsername": testRailLoginDetails.username,
                            "TestRailToken": testRailLoginDetails.apiKey,
                            "action": isEmpty ? "create" : "update"
                        };

                        const data = await manageTestRailDetails(userObj);
                        setLoading(false);
                        if (data == 'Invalid Credentials' || data == 'Error:testrail Operations') {
                            toastError(data.error);
                            testrailLogin = false
                            return;
                        } else {
                            toastSuccess(MSG.CUSTOM(`The Testrail configuration was successfully created`, VARIANT.SUCCESS));
                            testrailLogin = true;
                            showCard2();
                        }
                        return;
                    } catch (e) {
                        toastError(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
                    }
                    break;
                default:
                    break;
            }
        }

        testrailLogin && showCard2();
        setDisableFields(false);
    }

    const confirmPopupMsg = (
        <div> <p>Are you sure you want to delete the saved credentials</p></div>
    )


    const deleteHandler = async() => {
        if(!isEmpty){
            switch (selectedscreen.name) {
                case 'Jira':
                    var data = await manageJiraDetails("delete", {});
                    if(data.error){
                            toastError(data.error);
                            return;
                        }
                            dispatchAction(resetIntergrationLogin());
                            setIsEmpty(true);
                            toastSuccess("Successfully deleted the credentials")
                        break;
                case 'Zephyr':
                    var data = await manageZephyrDetails("delete", {});
                    if(data.error){
                            toastError(data.error);
                            return;
                        }
                            dispatchAction(resetZephyrLogin())
                            setIsEmpty(true);
                            toastSuccess("Successfully deleted the credentials")
                            break;
                case 'Azure DevOps':
                    var data = await manageAzureDetails("delete", {});
                    if(data.error){
                        toastError(data.error);
                        return;
                    }
                        dispatchAction(resetAzureLogin())
                        setIsEmpty(true);
                        toastSuccess("Successfully deleted the credentials")
                    break;
                case 'TestRail':
                    const testRailData = await manageTestRailDetails("delete", {});
                    if (testRailData.error) {
                        toastError(testRailData.error);
                        return;
                    }
                    dispatchAction(resetTestRailLogin());
                    setIsEmpty(true);
                    toastSuccess("Successfully deleted the credentials")
                    break;
            }
        }
    }

    const notALicenseALM = {
        value: userInfo?.licensedetails?.ALMDMT === 'false',
        msg: "You do not have access for ALM"
    }

    const loginDetailsUsernameMap = {
        Jira: loginDetails.username,
        'Azure DevOps': AzureLoginDetails.username,
        Zephyr: zephyrLoginDetails.username,
        TestRail: testRailLoginDetails.username,
        default: ""
    };

    const passwordDetailsMap = {
        Jira: loginDetails.password,
        'Azure DevOps': AzureLoginDetails.password,
        Zephyr: zephyrLoginDetails.password,
        TestRail: testRailLoginDetails.apiKey,
        default: ""
    };

    const urlDetailsMap = {
        Jira: loginDetails.url,
        'Azure DevOps': AzureLoginDetails.url,
        Zephyr: zephyrLoginDetails.url,
        TestRail: testRailLoginDetails.url,
        default: ""
    };

    return (
        <>
            {loading ? <ScreenOverlay content={loading} /> : null}
            <Toast ref={toast} position="bottom-center" baseZIndex={1300} />
            <div className="login_container_integrations">
                <div className="flex flex-column w-[5rem] side-panel_login">
                    <div className={`integration-card ${selectedscreen?.name === 'Jira' ? 'selected' : ''}`} onClick={() => { handleScreenType({ name: 'Jira', code: 'JA' }); getJiraDetails() }}>
                        <img src="static/imgs/jira_icon.svg" className="img__jira"></img>
                        <span className="text__jira">Jira</span>
                    </div>
                    <div className={`integration-card ${selectedscreen?.name === 'Azure DevOps' ? 'selected' : ''}`} onClick={() => { handleScreenType({ name: 'Azure DevOps', code: 'ADO' }); getAzureDetails() }}>
                        <img src="static/imgs/azure_devops_icon.svg" className="img__azure"></img>
                        <span className="text__azure">Azure DevOps</span>
                    </div>
                    <div className={`integration-card ${selectedscreen?.name === 'Zephyr' ? 'selected' : ''}`} onClick={() => { handleScreenType({ name: 'Zephyr', code: 'ZR' }); getZephyrDetails() }}>
                        <img src="static/imgs/zephyr_icon.svg" className="img__zephyr"></img>
                        <span className="text__zephyr">Zephyr</span>
                    </div>
                    <div className={`integration-card ${selectedscreen?.name === 'TestRail' ? 'selected' : ''}`} onClick={() => { handleScreenType({ name: 'TestRail', code: 'TR' }); getTestRailDetails(); }}>
                        <img src="static/imgs/testrail_icon.png" className="img__testrail" />
                        <span className="text__zephyr">TestRail</span>
                    </div>
                    <div className={`integration-card ${selectedscreen?.name === 'qTest' ? 'selected' : ''}`} onClick={() => handleScreenType({ name: 'qTest', code: 'QT' })}>
                        <img src="static/imgs/qTest_icon.svg" className="img__qtest"></img>
                        <span className="text__qtest">qTest</span>
                    </div>
                    {notALicenseALM.value ? <div className="integration-card" onClick={() => handleScreenType({ name: 'ALM', code: 'ALM' })}>
                        <span title={notALicenseALM.msg}><img src="static/imgs/ALM_icon.svg" className="img__alm_disabled"></img></span>
                        <span className="text__alm_disabled">ALM</span>
                    </div>
                        :
                        <div className={`integration-card ${selectedscreen?.name === 'ALM' ? 'selected' : ''}`} onClick={() => handleScreenType({ name: 'ALM', code: 'ALM' })}>
                            <img src="static/imgs/ALM_icon.svg" className="img__alm"></img>
                            <span className="text__alm">ALM</span>
                        </div>
                    }
                    <div>
                        <div className={`integration-card ${selectedscreen?.name === 'Git' ? 'selected' : ''}`} onClick={() => handleScreenType({ name: 'Git', code: 'GIT' })}>
                            <img src="static/imgs/git_configuration_icon.svg" className="img__alm" alt="Git Icon" />
                            <span className="text_git">Git<br />Configuration</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div>
                {isSpin && 
                    <div className="modal-overlay">
                    <ProgressSpinner className="modal-spinner" style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                </div>
                }
          <p style={{marginBottom:'0.5rem',marginTop:'0.5rem'}} className="login-cls">Login </p>
          <div className="input-cls">
          <span>Username <span style={{color:'red'}}>*</span></span>
            <span className="p-float-label" style={{marginLeft:'1.5rem'}}>
                <InputText style={{width:'20rem', height:'2.5rem'}} className="input-txt1" id="username" value={loginDetails.username} onChange={(e) => handleLogin('username',e.target.value)} />
                <label htmlFor="username">Username</label>
            </span>
            </div>
            <div className="passwrd-cls">
            <span>Password <span style={{color:'red'}}>*</span></span>
            // <Password style={{width:'20rem', height:'2.5rem' , marginLeft:'2rem'}} className="input-txt1"value={loginDetails.password} onChange={(e) => handleLogin('password', e.target.value)} toggleMask />
            </div>
            <div className="url-cls">
            <span>URL <span style={{color:'red'}}>*</span></span>
            <span className="p-float-label" style={{marginLeft:'4.5rem'}}>
                <InputText  style={{width:'20rem', height:'2.5rem'}}className="input-txt1" id="URL" value={loginDetails.url} onChange={(e) => handleLogin('url',e.target.value)} />
                <label htmlFor="username">URL</label>
            </span>
            </div>

        </div> */}
            <Card className="card__login__jira">
                <div className="Login__jira">
                    {/* {isSpin && 
                    <div className="modal-overlay">
                    <ProgressSpinner className="modal-spinner" style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                </div>
                }  */}
                {selectedscreen?.code === 'GIT' ? <GitConfig toastError={toastError} toastSuccess={toastSuccess} toastWarn={toastWarn}/> : <>
                        {selectedscreen && authType === "basic"}
                        <p style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }} className="login-cls">Login </p>
                        {selectedscreen?.name === 'Zephyr' && (
                            <div className="apptype__token">
                                <span>Application Type:</span>
                                <div className="p-field-radiobutton">
                                    <RadioButton inputId="basic" name="loginType" value="basic" onChange={handleRadioChange} checked={authType === 'basic'} />
                                    <label htmlFor="basic" className="basic_login">Basic</label>
                                </div>
                                <div className="p-field-radiobutton">
                                    <RadioButton inputId="token" name="loginType" value="token" onChange={handleRadioChange} checked={authType === 'token'} />
                                    <label htmlFor="token" className="token_login">Token</label>
                                </div>
                            </div>)}
                        {authType === "basic" && selectedscreen && (
                            <>
                                <div className="input-cls">
                                    <span>Username <span style={{ color: 'red' }}>*</span></span>
                                    <span style={{ marginLeft: '1.5rem' }}>
                                        <InputText disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="username" value={loginDetailsUsernameMap[selectedscreen.name] || loginDetailsUsernameMap.default} onChange={(e) => handleLogin('username', e.target.value)} autoComplete="off" />
                                        {/* <label htmlFor="username">Username</label> */}
                                    </span>
                                </div>
                                <div className="passwrd-cls">
                                    {selectedscreen?.name === 'Zephyr' ? (
                                        <span>Password <span style={{ color: 'red' }}>*</span></span>)
                                        : <span>API Token <span style={{ color: 'red' }}>*</span></span>
                                    }

                                    <Tooltip target='.eyeIcon' content={showPassword ? 'Hide Password' : 'Show Password'} position='bottom' />
                                    {/* <Password disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem', marginLeft: '2rem' }} className="input-txt1" value={selectedscreen.name === 'Jira' ? loginDetails.password : selectedscreen.name === 'Azure DevOps' ? AzureLoginDetails.password : zephyrLoginDetails.password} onChange={(e) => handleLogin('password', e.target.value)} type={showPassword ? "type" : "password"} feedback={false} /> */}
                                    <InputText disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem', marginLeft: '2rem', paddingRight:'2rem' }} className="input-txt1" value={passwordDetailsMap[selectedscreen.name] || passwordDetailsMap.default} onChange={(e) => handleLogin(selectedscreen.name==="TestRail" ? 'apiKey' : 'password', e.target.value)} type={showPassword ? "type" : "password"} autoComplete="new-password"/>
                                    {(loginDetails.password || zephyrLoginDetails.password || AzureLoginDetails.password || testRailLoginDetails.apiKey) && <div className='p-input-icon-right cursor-pointer'>
                                        <i className={`eyeIcon ${showPassword ? "pi pi-eye-slash" : "pi pi-eye"}`}
                                            onClick={() => { setShowPassword(!showPassword) }} />
                                    </div>}

                                </div>
                                <div className="url-cls">
                                    <span>URL <span style={{ color: 'red' }}>*</span></span>
                                    <span style={{ marginLeft: '4.5rem' }}>
                                    <InputText disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="URL" value={urlDetailsMap[selectedscreen.name] || urlDetailsMap.default} onChange={(e) => handleLogin('url', e.target.value)} autoComplete="off" />
                                        {/* <label htmlFor="username">URL</label> */}
                                    </span>
                                </div>
                                <div className="login__div">
                                      {!isEmpty ? <Button label="Reset" onClick={()=>setShowModal(true)} severity="danger" /> :""}
                                      <Checkbox className="checkbox_cred" style={{left:!isEmpty?"1.5rem":"7.5rem"}} onChange={e => setChecked(e.checked)} checked={checked}></Checkbox>
                                      <span className="credentials__txt" style={{left:!isEmpty?"2rem":"8rem"}}>{isEmpty?"Save":"Update"} the credentials</span>
                                    <Button disabled={disableLoginBtn} size="small" label={isSpin ? <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" fill="transparent" animationDuration=".5s" /> : 'Login'}
                                        onClick={loginHandler} className="login__btn" style={{left:!isEmpty?"4rem":"11rem"}}>
                                    </Button>
                                </div>
                            </>)}
                        {authType === "token" && (
                            <>
                                <div className="url-cls">
                                    <span>URL <span style={{ color: 'red' }}>*</span></span>
                                    <span style={{ marginLeft: '4.5rem' }}>
                                        <InputText disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="URL" value={selectedscreen.name === 'Jira' ? loginDetails.url : zephyrLoginDetails.url} onChange={(e) => handleLogin('url', e.target.value)} autoComplete="off"/>
                                        {/* <label htmlFor="username">URL</label> */}
                                    </span>
                                </div>
                                <div className="url-cls">
                                    <span>Token <span style={{ color: 'red' }}>*</span></span>
                                    <span style={{ marginLeft: '3.7rem' }}>
                                        <InputText disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="URL" value={selectedscreen.name === 'Jira' ? loginDetails.token : zephyrLoginDetails.token} onChange={(e) => handleLogin('token', e.target.value)} autoComplete="new-password"/>
                                        {/* <label htmlFor="username">Token</label> */}
                                    </span>
                                </div>
                                <div className="login__div">
                                    <div>
                                    {!isEmpty ? <Button label="Delete" onClick={()=>setShowModal(true)} severity="danger" /> :""}
                                     <Checkbox className="checkbox_cred" style={{left:!isEmpty?"1.5rem":"7.5rem"}} onChange={e => setChecked(e.checked)} checked={checked}></Checkbox>
                                     <span className="credentials__txt" style={{left:!isEmpty?"2rem":"8rem"}}>{isEmpty?"Save":"Update"} the credentials</span>
                                    </div>
                                    <Button disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} size="small" label={isSpin ? <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" fill="transparent" animationDuration=".5s" /> : 'login'}
                                        onClick={loginHandler} className="login__btn" style={{left:!isEmpty?"22rem":"21rem", bottom:!isEmpty?"2.5rem":"2rem"}}>
                                    </Button>
                                </div>
                            </>)}
                    </>

                    }

                </div>
            </Card>
            {/* <ZephyrContent visible={zephyrVisible} onHide={zephyrhideDialog} selectedscreen={selectedscreen} /> */}
            <AvoConfirmDialog
                visible={showModal}
                onHide={() => setShowModal(false)}
                showHeader={false}
                message={confirmPopupMsg}
                icon="pi pi-exclamation-triangle"
             accept={()=>deleteHandler()}/>
        </>
    )
}

export default React.memo(LoginModal);