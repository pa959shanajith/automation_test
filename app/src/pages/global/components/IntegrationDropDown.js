import React , { useState} from 'react';
import {ModalContainer} from '../../global' 
import '../styles/IntegrationDropDown.scss'
import { loginQCServer_ICE, loginQTestServer_ICE, loginZephyrServer_ICE } from '../../execute/api';

/*Component IntegrationDropDown
  use: renders integration popup for ALM/ qTest/ Zypher
*/

const IntegrationDropDown = ({setshowModal, type, browserTypeExe, appType, setPopupState, setCredentialsExecution, displayError}) => {
    const [credentials,setCredentials] = useState({url: "", userName: "", password: ""});
    const [urlErrBor,setUrlErrBor] = useState(false)
    const [usernameErrBor,setUserNameErrBor] = useState(false)
    const [passErrBor,setPassErrBor] = useState(false)
    const [qtestSteps,setqtestSteps] = useState(false)
    const [errorMsg,setErrorMsg] = useState("")
    
    const saveAction = async () => {
        setPassErrBor(false);setUrlErrBor(false);setUserNameErrBor(false);
		if (!credentials.url) {
            setUrlErrBor(true);
            setErrorMsg("Please "+placeholder[type].url);
		} else if (!credentials.userName) {
            setUserNameErrBor(true);
            setErrorMsg("Please "+placeholder[type].username);
		} else if (!credentials.password) {
            setPassErrBor(true);
            setErrorMsg("Please "+placeholder[type].password);
		} else if (appType !== "SAP" && browserTypeExe.length === 0) {
            setshowModal(false);
            setPopupState({show:true,title:"Execute Test Suite",content:"Please select a browser"});
        }
        else {
            setErrorMsg("");
            var apiIntegration = loginZephyrServer_ICE;
            if(type === "ALM") apiIntegration = loginQCServer_ICE;
            else if(type === "qTest") apiIntegration = loginQTestServer_ICE;
			const data = await apiIntegration(credentials.url, credentials.userName, credentials.password, type);
            if(data.error){displayError(data.error);return;}
            else if (data === "unavailableLocalServer") {
                setErrorMsg("Unavailable LocalServer");
            } else if (data === "Invalid Session") {
                setErrorMsg("Invalid Session");
            } else if (data === "invalidcredentials") {
                setErrorMsg("Invalid Credentials");
            } else if (data === "invalidurl") {
                setErrorMsg("Invalid URL");
            } else {
                var integration = {alm: {url:"",username:"",password:""}, 
                qtest: {url:"",username:"",password:"",qteststeps:""}, 
                zephyr: {accountid:"",accesskey:"",secretkey:""}};
                if(type === "ALM"){
                    integration.alm = {
						url:credentials.url,
						username: credentials.userName,
						password: credentials.password
					}
                }
                else if(type === "qTest"){
                    integration.qtest = {
						url:credentials.url,
						username: credentials.userName,
                        password: credentials.password,
                        qteststeps:qtestSteps
					}
                }
                else if(type === "Zephyr"){
                    integration.zephyr = {
						url: credentials.url,
						username: credentials.userName,
						password: credentials.password,
					}
                }
                setCredentialsExecution(integration)
                setshowModal(false);
            }
		}
    }

    return(
        <ModalContainer 
            title={type} 
            footer={submitModal(errorMsg, saveAction)} 
            close={()=>{setshowModal(false)}} 
            content={MiddleContent(credentials, setCredentials, urlErrBor, usernameErrBor, passErrBor, type, qtestSteps, setqtestSteps)} 
            modalClass=" i__modal"
        />
    )
}

const submitModal = (errorMsg, saveAction) => {
    return(
        <div className="i__popupWrapRow">
            <div className="i__textFieldsContainer">
            <p align="right" className="i__textFieldsContainer-cust">
                <span className="i__error-msg">{errorMsg}</span>
                <button type="button" className="e__btn-md " onClick={()=>{saveAction()}} >Save</button>
            </p>
            </div>
        </div>
    )
}

const MiddleContent = (credentials, setCredentials, urlErrBor, usernameErrBor, passErrBor, type, qtestSteps, setqtestSteps) => {
    return(
        <div className="popupWrapRow">
            <div className="textFieldsContainer">
                <p><input value={credentials.url} onChange={(event)=>{setCredentials({url: event.target.value, userName: credentials.userName, password: credentials.password})}} type="text" className={(urlErrBor ? " i__inputErrBor " : "")+"i__input-cust i__input e__modal-alm-input "} placeholder={placeholder[type].url} /></p>
                <p className="halfWrap halfWrap-margin" ><input value={credentials.userName} onChange={(event)=>{setCredentials({url: credentials.url, userName: event.target.value, password: credentials.azephyrPassword})}} type="text" className={"i__input-cust i__input e__modal-alm-input"+ (usernameErrBor ? " i__inputErrBor" : "")} placeholder={placeholder[type].username} /></p>
                <p className="halfWrap"><input value={credentials.password} onChange={(event)=>{setCredentials({url: credentials.url, userName: credentials.userName, password: event.target.value})}} type="password" className={"i__input-cust i__input e__modal-alm-input"+ (passErrBor ? " i__inputErrBor" : "")} placeholder={placeholder[type].password} /></p>
                {type==="qTest"?
                    <p className="qtestSteps" ><input value={qtestSteps} onChange={()=>{setqtestSteps(!qtestSteps)}} type="checkbox" title="Update steps status"/><span className="i__step">Update step status</span></p>
                :null}
                </div>
        </div>
    )
}

export default IntegrationDropDown;


const placeholder={
    Zephyr:{url:"Enter Zephyr URL (Ex. http(s)://SERVER[:PORT])" ,username:"Enter Zephyr Username", password:"Enter Zephyr Password"  },
    ALM:{url:"Enter ALM Url" ,username:"Enter User Name", password:"Enter Password" },
    qTest:{url:"Enter qTest Url" ,username:"Enter User Name", password:"Enter Password" },
}



