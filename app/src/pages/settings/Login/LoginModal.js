import React, { useCallback, useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from 'primereact/password';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDispatch, useSelector } from 'react-redux';
import { IntergrationLogin, zephyrLogin, AzureLogin, screenType } from '../settingSlice';
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




const LoginModal = ({ isSpin, showCard2, handleIntegration, setShowLoginCard, setAuthType, authType }) => {
    const toast = useRef();
    // list of selectors
    const loginDetails = useSelector(state => state.setting.intergrationLogin);
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


    
  const toastError = (erroMessage) => {
    if (erroMessage.CONTENT) {
      toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
  }

  const toastSuccess = (successMessage) => {
    if (successMessage.CONTENT) {
      toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
  }

  const toastWarn = (warnMessage) => {
    if (warnMessage.CONTENT) {
        toast.current.show({ severity: warnMessage.VARIANT, summary: 'Warning', detail: warnMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'warn', summary: 'Warning', detail: warnMessage, life: 5000 });
}


    const handleLogin = (name, value) => {
        switch (selectedscreen.name) {
            case 'Jira':
                dispatchAction(IntergrationLogin({ fieldName: name, value }));
                break;
            case 'Zephyr':
                dispatchAction(zephyrLogin({ fieldName: name, value }));
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

    const loginHandler = () => {
        showCard2(); setDisableFields(true);
    }


    return (
        <>
            <Toast ref={toast} position="bottom-center" baseZIndex={1300} />
            <div className="login_container_integrations">
                <div className="side-panel_login">
                  
                    <div className={`icon-wrapper ${selectedscreen?.name === 'Jira' ? 'selected' : ''}`} onClick={() => handleScreenType({ name: 'Jira', code: 'JA' })}>
                        <span><img src="static/imgs/jira_icon.svg" className="img__jira"></img></span>
                        <span className="text__jira">Jira</span>
                    </div>
                    <div className={`icon-wrapper ${selectedscreen?.name === 'Azure DevOps' ? 'selected' : ''}`} onClick={() => handleScreenType({ name: 'Azure DevOps', code: 'ADO' })}>
                        <span><img src="static/imgs/azure_devops_icon.svg" className="img__azure"></img></span>
                        <span className="text__azure">Azure DevOps</span>
                    </div>
                    <div className={`icon-wrapper ${selectedscreen?.name === 'Zephyr' ? 'selected' : ''}`} onClick={() => handleScreenType({ name: 'Zephyr', code: 'ZR' })}>
                        <span><img src="static/imgs/zephyr_icon.svg" className="img__zephyr"></img></span>
                        <span className="text__zephyr">Zephyr</span>
                    </div>
                    <div className={`icon-wrapper ${selectedscreen?.name === 'qTest' ? 'selected' : ''}`} onClick={() => handleScreenType({ name: 'qTest', code: 'QT' })}>
                        <span><img src="static/imgs/qTest_icon.svg" className="img__qtest"></img></span>
                        <span className="text__qtest">qTest</span>
                    </div>
                    <div className={`icon-wrapper ${selectedscreen?.name === 'ALM' ? 'selected' : ''}`} onClick={() => handleScreenType({ name: 'ALM', code: 'ALM' })}>
                        <span><img src="static/imgs/ALM_icon.svg" className="img__alm"></img></span>
                        <span className="text__alm">ALM</span>
                    </div>
                    <div>
                        <div className={`icon-wrapper ${selectedscreen?.name === 'Git' ? 'selected' : ''}`} onClick={() => handleScreenType({ name: 'Git', code: 'GIT' })}>
                            <span><img src="static/imgs/git_configuration_icon.svg" className="img__alm" alt="Git Icon" /></span>
                            <span className="text_git">Git</span><br/>
                            <span className="text__git">Configuration</span>
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
                                    <InputText disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="username" value={selectedscreen.name === 'Jira' ? loginDetails.username : selectedscreen.name === 'Azure DevOps' ? AzureLoginDetails.username : zephyrLoginDetails.username} onChange={(e) => handleLogin('username', e.target.value)} />
                                    {/* <label htmlFor="username">Username</label> */}
                                </span>
                            </div>
                            <div className="passwrd-cls">
                                {selectedscreen?.name === 'Zephyr' ?(
                                 <span> Password <span style={{ color: 'red' }}>*</span></span>)
                                 :(
                                    <span> API Token <span style={{ color: 'red' }}>*</span></span>
                                 )
                                }
                                
                                <Tooltip target='.eyeIcon' content={showPassword ? 'Hide Password' : 'Show Password'} position='bottom' />
                                <Password disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem', marginLeft: '2rem' }} className="input-txt1" value={selectedscreen.name === 'Jira' ? loginDetails.password : selectedscreen.name === 'Azure DevOps' ? AzureLoginDetails.password : zephyrLoginDetails.password} onChange={(e) => handleLogin('password', e.target.value)} type={showPassword ? "type" : "password"} feedback={false} />
                                {(loginDetails.password || zephyrLoginDetails.password) && <div className='p-input-icon-right mb-2 cursor-pointer' onClick={togglePasswordVisibility}>
                                    <i className={`eyeIcon ${showPassword ? "pi pi-eye-slash" : "pi pi-eye"}`} />

                                    </div>}

                                </div>
                                <div className="url-cls">
                                    <span>URL <span style={{ color: 'red' }}>*</span></span>
                                    <span style={{ marginLeft: '4.5rem' }}>
                                        <InputText disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="URL" value={selectedscreen.name === 'Jira' ? loginDetails.url : selectedscreen.name === 'Azure DevOps' ? AzureLoginDetails.url : zephyrLoginDetails.url} onChange={(e) => handleLogin('url', e.target.value)} />
                                        {/* <label htmlFor="username">URL</label> */}
                                    </span>
                                </div>
                                <div className="login__div">
                                    <Button disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} size="small" label={isSpin ? <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" fill="transparent" animationDuration=".5s" /> : 'login'}
                                        onClick={loginHandler} className="login__btn">
                                    </Button>
                                </div>
                            </>)}
                        {authType === "token" && (
                            <>
                                <div className="url-cls">
                                    <span>URL <span style={{ color: 'red' }}>*</span></span>
                                    <span style={{ marginLeft: '4.5rem' }}>
                                        <InputText disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="URL" value={selectedscreen.name === 'Jira' ? loginDetails.url : zephyrLoginDetails.url} onChange={(e) => handleLogin('url', e.target.value)} />
                                        {/* <label htmlFor="username">URL</label> */}
                                    </span>
                                </div>
                                <div className="url-cls">
                                    <span>Token <span style={{ color: 'red' }}>*</span></span>
                                    <span style={{ marginLeft: '4.5rem' }}>
                                        <InputText disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="URL" value={selectedscreen.name === 'Jira' ? loginDetails.token : zephyrLoginDetails.token} onChange={(e) => handleLogin('token', e.target.value)} />
                                        {/* <label htmlFor="username">Token</label> */}
                                    </span>
                                </div>
                                <div className="login__div">
                                    <Button disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} size="small" label={isSpin ? <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" fill="transparent" animationDuration=".5s" /> : 'login'}
                                        onClick={loginHandler} className="login__btn">
                                    </Button>
                                </div>
                            </>)}
                    </>

                    }

                </div>
            </Card>
            {/* <ZephyrContent visible={zephyrVisible} onHide={zephyrhideDialog} selectedscreen={selectedscreen} /> */}
        </>
    )
}

export default React.memo(LoginModal);