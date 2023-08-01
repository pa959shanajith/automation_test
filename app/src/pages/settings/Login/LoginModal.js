import React, { useCallback, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from 'primereact/password';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDispatch, useSelector } from 'react-redux';
import { IntergrationLogin } from '../settingSlice';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import "../styles/manageIntegrations.scss";


const LoginModal = ({ isSpin, showCard2, handleIntegration }) => {
    const loginDetails = useSelector(state => state.setting.intergrationLogin);
    const selectedscreen = useSelector(state => state.setting.screenType);
    const [disableFields, setDisableFields] = useState(false)
    const dispatchAction = useDispatch();

    const handleLogin = useCallback((name, value) => {
        dispatchAction(IntergrationLogin({ fieldName: name, value }));
    }, [])


    return (
        <>
            <div className="login_container_integrations">
                <div className="side-panel">
                    <div className={`icon-wrapper ${selectedscreen?.name === 'Jira' ? 'selected' : ''}`} onClick={() => handleIntegration({ name: 'Jira', code: 'NY' })}>
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
            <Password style={{width:'20rem', height:'2.5rem' , marginLeft:'2rem'}} className="input-txt1"value={loginDetails.password} onChange={(e) => handleLogin('password', e.target.value)} toggleMask />
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
                    <p style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }} className="login-cls">Login </p>
                    <div className="input-cls">
                        <span>Username <span style={{ color: 'red' }}>*</span></span>
                        <span style={{ marginLeft: '1.5rem' }}>
                            <InputText disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="username" value={loginDetails.username} onChange={(e) => handleLogin('username', e.target.value)} />
                            {/* <label htmlFor="username">Username</label> */}
                        </span>
                    </div>
                    <div className="passwrd-cls">
                        <span>Password <span style={{ color: 'red' }}>*</span></span>
                        <Password disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem', marginLeft: '2rem' }} className="input-txt1" value={loginDetails.password} onChange={(e) => handleLogin('password', e.target.value)} toggleMask />
                    </div>
                    <div className="url-cls">
                        <span>URL <span style={{ color: 'red' }}>*</span></span>
                        <span style={{ marginLeft: '4.5rem' }}>
                            <InputText disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="URL" value={loginDetails.url} onChange={(e) => handleLogin('url', e.target.value)} />
                            {/* <label htmlFor="username">URL</label> */}
                        </span>
                    </div>
                    <div className="login__div">
                        <Button disabled={selectedscreen && selectedscreen.name && !disableFields ? false : true} size="small" label={isSpin ? <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" fill="transparent" animationDuration=".5s" /> : 'login'}
                            onClick={() => { showCard2(); setDisableFields(true); }} className="login__btn">
                        </Button>
                    </div>

                </div>
            </Card>
        </>
    )
}

export default React.memo(LoginModal);