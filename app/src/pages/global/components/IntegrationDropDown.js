import React , { useState} from 'react';
import {ModalContainer, Messages as MSG} from '../../global' 
import '../styles/IntegrationDropDown.scss'
import { loginQCServer_ICE, loginQTestServer_ICE, loginZephyrServer_ICE } from '../../execute/api';

/*Component IntegrationDropDown
  use: renders integration popup for ALM/ qTest/ Zypher
*/

const IntegrationDropDown = ({setshowModal, type, browserTypeExe, appType, integrationCred, setCredentialsExecution, displayError}) => {
    const [credentials,setCredentials] = useState({url: "", userName: "", password: "", apitoken:"", authtype:""});
    const [urlErrBor,setUrlErrBor] = useState(false)
    const [usernameErrBor,setUserNameErrBor] = useState(false)
    const [passErrBor,setPassErrBor] = useState(false)
    const [authErrBor,setAuthErrBor] = useState(false)
    const [qtestSteps,setqtestSteps] = useState(false)
    const [errorMsg,setErrorMsg] = useState("")
    const [zephAuthType, setZephAuthType] = useState("basic");
    
    const saveAction = async () => {
        setPassErrBor(false);setUrlErrBor(false);setUserNameErrBor(false);setAuthErrBor(false);setErrorMsg("");
		if(type==="Zephyr" && !credentials.url) {
            setUrlErrBor(true);
            setErrorMsg("Please "+placeholder[type].url);
        } else if(type==="Zephyr" && zephAuthType==="basic" && !credentials.userName) {
            setUserNameErrBor(true);
            setErrorMsg("Please "+placeholder[type].username);
        } else if (type==="Zephyr" && zephAuthType==="basic" && !credentials.password) {
            setPassErrBor(true);
            setErrorMsg("Please "+placeholder[type].password);
		} else if (type==="Zephyr" && zephAuthType==="token" && !credentials.apitoken) {
            setAuthErrBor(true);
            setErrorMsg("Please "+placeholder[type].apitoken);
        } else if (type!=="Zephyr" && !credentials.url) {
            setUrlErrBor(true);
            setErrorMsg("Please "+placeholder[type].url);
		} else if (type!=="Zephyr" && !credentials.userName) {
            setUserNameErrBor(true);
            setErrorMsg("Please "+placeholder[type].username);
		} else if (type!=="Zephyr" && !credentials.password) {
            setPassErrBor(true);
            setErrorMsg("Please "+placeholder[type].password);
		} else if (appType !== "SAP" && browserTypeExe.length === 0) {
            setshowModal(false);
            displayError(MSG.EXECUTE.WARN_SELECT_BROWSER);
        }
        else {
            setErrorMsg("");
            var data = undefined;
            var apiIntegration = loginQTestServer_ICE;
            if(type === "ALM") apiIntegration = loginQCServer_ICE;
            if(type === "Zephyr") data = await loginZephyrServer_ICE(credentials.url, credentials.userName, credentials.password, credentials.apitoken, zephAuthType, type);
			else data = await apiIntegration(credentials.url, credentials.userName, credentials.password, type);
            if(data.error){displayError(data.error);return;}
            else if (data === "unavailableLocalServer") setErrorMsg("Unavailable LocalServer");
            else if (data === "Invalid Session") setErrorMsg("Invalid Session");
            else if (data === "invalidcredentials") setErrorMsg("Invalid Credentials");
            else if (data === "serverdown") setErrorMsg("Host not serviceable.");
            else if (data === "notreachable") setErrorMsg("Host not reachable.");
            else if (data === "invalidurl") setErrorMsg("Invalid URL");
            else {
                var integration = {...integrationCred};
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
                        apitoken: credentials.apitoken,
                        authtype: zephAuthType
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
            content={MiddleContent(credentials, setCredentials, urlErrBor, usernameErrBor, passErrBor, authErrBor, type, qtestSteps, setqtestSteps, zephAuthType, setZephAuthType, setErrorMsg)} 
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

const MiddleContent = (credentials, setCredentials, urlErrBor, usernameErrBor, passErrBor, authErrBor, type, qtestSteps, setqtestSteps, zephAuthType, setZephAuthType, setErrorMsg) => {

    const populateFields=async(authtype)=>{
        setErrorMsg("");
        if(authtype==="token") {
            credentials.url="";
            credentials.userName="";
            credentials.password="";
            credentials.authtype=authtype;
        } else {
            credentials.url="";
            credentials.apitoken="";
            credentials.authtype=authtype;
        }
        setZephAuthType(authtype)
        setCredentials({url: credentials.url, userName: credentials.userName, password: credentials.password, apitoken: credentials.apitoken, authtype: authtype});
    }

    return(
        <div className="popupWrapRow">
            <div className="textFieldsContainer">
            {type==="Zephyr"?
                <>
                <div className='ilm__authtype_cont'>
                    <span className="ilm__auth" title="Authentication Type">Authentication Type</span>
                    <label className="authTypeRadio ilm__leftauth">
                        <input type="radio" value="basic" checked={zephAuthType==="basic"} onChange={()=>{populateFields("basic")}}/>
                        <span>Basic</span>
                    </label>
                    <label className="authTypeRadio">
                        <input type="radio" value="token" checked={zephAuthType==="token"} onChange={()=>{populateFields("token")}}/>
                        <span>Token</span>
                    </label>
                </div>
                </>
                :null}
                <p><input value={credentials.url} onChange={(event)=>{setCredentials({url: event.target.value, userName: credentials.userName, password: credentials.password, apitoken: credentials.apitoken, authtype: credentials.authtype})}} type="text" className={(urlErrBor ? " i__inputErrBor " : "")+"i__input-cust i__input e__modal-alm-input "} placeholder={placeholder[type].url} /></p>
                {(type==="Zephyr" && zephAuthType==="basic") || type!=="Zephyr"?
                <>
                    <p className="halfWrap halfWrap-margin" ><input value={credentials.userName} onChange={(event)=>{setCredentials({url: credentials.url, userName: event.target.value, password: credentials.password, apitoken: credentials.apitoken, authtype: credentials.authtype})}} type="text" className={"i__input-cust i__input e__modal-alm-input"+ (usernameErrBor ? " i__inputErrBor" : "")} placeholder={placeholder[type].username} /></p>
                    <p className="halfWrap"><input value={credentials.password} onChange={(event)=>{setCredentials({url: credentials.url, userName: credentials.userName, password: event.target.value, apitoken: credentials.apitoken, authtype: credentials.authtype})}} type="password" className={"i__input-cust i__input e__modal-alm-input"+ (passErrBor ? " i__inputErrBor" : "")} placeholder={placeholder[type].password} /></p>
                </>
                :null}
                {(type==="Zephyr" && zephAuthType==="token")?
                <>
                    <p><input value={credentials.apitoken} onChange={(event)=>{setCredentials({url: credentials.url, userName: credentials.userName, password: credentials.password, apitoken: event.target.value, authtype: credentials.authtype})}} type="text" className={"i__input-cust i__input e__modal-alm-input"+ (authErrBor ? " i__inputErrBor" : "")} placeholder={placeholder[type].apitoken} /></p>
                </>
                :null}
                {type==="qTest"?
                    <p className="qtestSteps" ><input value={qtestSteps} onChange={()=>{setqtestSteps(!qtestSteps)}} type="checkbox" title="Update steps status"/><span className="i__step">Update step status</span></p>
                :null}
                </div>
        </div>
    )
}

export default IntegrationDropDown;


const placeholder={
    Zephyr:{url:"Enter Zephyr URL (Ex. http(s)://SERVER[:PORT])" ,username:"Enter Zephyr Username", password:"Enter Zephyr Password", apitoken:"Enter API Token"  },
    ALM:{url:"Enter ALM Url" ,username:"Enter User Name", password:"Enter Password" },
    qTest:{url:"Enter qTest Url" ,username:"Enter User Name", password:"Enter Password" },
}



