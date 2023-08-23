import React , { useState, useEffect} from 'react';
import {ModalContainer, ScreenOverlay, Messages as MSG, setMsg} from '../../global' 
import '../styles/IntegrationDropDown.scss'
import { loginQCServer_ICE, loginQTestServer_ICE, loginZephyrServer_ICE, getDetails_ZEPHYR } from '../../execute/api';

/*Component IntegrationDropDown
  use: renders integration popup for ALM/ qTest/ Zypher
*/

const IntegrationDropDown = ({setshowModal, type, browserTypeExe, appType, integrationCred, setCredentialsExecution, displayError}) => {
    const [credentials,setCredentials] = useState({url: "", userName: "", password: "", apitoken:"", authtype:"basic"});
    const [urlErrBor,setUrlErrBor] = useState(false)
    const [usernameErrBor,setUserNameErrBor] = useState(false)
    const [passErrBor,setPassErrBor] = useState(false)
    const [authErrBor,setAuthErrBor] = useState(false)
    const [qtestSteps,setqtestSteps] = useState(false)
    const [errorMsg,setErrorMsg] = useState("")
    const [zephAuthType, setZephAuthType] = useState("basic");
    const [isEmpty, setIsEmpty] = useState(true);
    
    const saveAction = async (autoSaveFlag=false, updatedData={}) => {
        setPassErrBor(false);setUrlErrBor(false);setUserNameErrBor(false);setAuthErrBor(false);setErrorMsg("");
        const latestCredentialsData = autoSaveFlag ? updatedData : credentials;
		if(type==="Zephyr" && !latestCredentialsData.url ) {
            setUrlErrBor(true);
            setErrorMsg("Please "+placeholder[type].url);
        } else if(type==="Zephyr" && latestCredentialsData.authtype==="basic" && !latestCredentialsData.userName) {
            setUserNameErrBor(true);
            setErrorMsg("Please "+placeholder[type].username);
        } else if (type==="Zephyr" && latestCredentialsData.authtype==="basic" && !latestCredentialsData.password) {
            setPassErrBor(true);
            setErrorMsg("Please "+placeholder[type].password);
		} else if (type==="Zephyr" && latestCredentialsData.authtype==="token" && !latestCredentialsData.apitoken) {
            setAuthErrBor(true);
            setErrorMsg("Please "+placeholder[type].apitoken);
        } else if (type!=="Zephyr" && !latestCredentialsData.url) {
            setUrlErrBor(true);
            setErrorMsg("Please "+placeholder[type].url);
		} else if (type!=="Zephyr" && !latestCredentialsData.userName) {
            setUserNameErrBor(true);
            setErrorMsg("Please "+placeholder[type].username);
		} else if (type!=="Zephyr" && !latestCredentialsData.password) {
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
            if(type === "Zephyr") data = await loginZephyrServer_ICE(latestCredentialsData.url, latestCredentialsData.userName, latestCredentialsData.password, latestCredentialsData.apitoken, latestCredentialsData.authtype, type);
			else data = await apiIntegration(latestCredentialsData.url, latestCredentialsData.userName, latestCredentialsData.password, type);
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
						url:latestCredentialsData.url,
						username: latestCredentialsData.userName,
						password: latestCredentialsData.password
					}
                }
                else if(type === "qTest"){
                    integration.qtest = {
						url:latestCredentialsData.url,
						username: latestCredentialsData.userName,
                        password: latestCredentialsData.password,
                        qteststeps:qtestSteps
					}
                }
                else if(type === "Zephyr"){
                    integration.zephyr = {
						url: latestCredentialsData.url,
						username: latestCredentialsData.userName,
                        password: latestCredentialsData.password,
                        apitoken: latestCredentialsData.apitoken,
                        authtype: latestCredentialsData.authtype
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
            show={true}
            footer={submitModal(errorMsg, saveAction, type, isEmpty)}
            close={()=>{setshowModal(false)}} 
            content={MiddleContent(credentials, setCredentials, urlErrBor, usernameErrBor, passErrBor, authErrBor, type, qtestSteps, setqtestSteps, zephAuthType, setZephAuthType, setErrorMsg, saveAction, setIsEmpty)} 
            modalClass=" i__modal"
        />
    )
}

const submitModal = (errorMsg, saveAction,type,  isEmpty) => {
    return(
        <div className="i__popupWrapRow" style={{ display: 'flex', justifyContent: 'space-between'}}>
            <span className="i__error-msg" style={{ marginTop: '-1.4rem'}}>
                {
                    type==="Zephyr" && isEmpty && <><span style={{color: '#333'}} ><img src={"static/imgs/info.png"} style={{width: '6%'}} alt={"Tip: "} ></img> Save Credentials in Settings for Auto Login</span><br /></>
                }
                {errorMsg}
            </span>
            <button type="button" className="e__btn-md " onClick={()=>{saveAction()}} >Save</button>
            {/* <div className="i__textFieldsContainer">
            <p align="right" className="i__textFieldsContainer-cust">
                <span className="i__error-msg" style={{ marginTop: '-1.4rem'}}>
                    {
                        type==="Zephyr" && isEmpty && <><span style={{color: '#333'}} ><img src={"static/imgs/info.png"} style={{width: '6%'}} alt={"Tip: "} ></img> Save Credentials in Settings for Auto Login</span><br /></>
                    }
                    {errorMsg}
                </span>
                <button type="button" className="e__btn-md " onClick={()=>{saveAction()}} >Save</button>
            </p>
            </div> */}
        </div>
    )
}

const MiddleContent = (credentials, setCredentials, urlErrBor, usernameErrBor, passErrBor, authErrBor, type, qtestSteps, setqtestSteps, zephAuthType, setZephAuthType, setErrorMsg, saveAction, setIsEmpty) => {
    const [loading, setLoading] = useState(false);
    const [defaultValues, setDefaultValues] = useState(false);
    const populateFields=async(authtype)=>{
        setErrorMsg("");
        let tempCredentialsData = {};
        if(authtype==="token") {
            tempCredentialsData.url = (defaultValues.url) ? defaultValues.url : "";
            tempCredentialsData.userName = "";
            tempCredentialsData.password = "";
            tempCredentialsData.apitoken = (defaultValues.apitoken) ? defaultValues.apitoken : "";
            tempCredentialsData.authtype = authtype;
        } else {
            tempCredentialsData.url = (defaultValues.url) ? defaultValues.url : "";
            tempCredentialsData.userName = (defaultValues.userName) ? defaultValues.userName : "";
            tempCredentialsData.password = (defaultValues.password) ? defaultValues.password : "";
            tempCredentialsData.apitoken = "";
            tempCredentialsData.authtype = authtype;
        }
        setZephAuthType(authtype);
        setCredentials({url: tempCredentialsData.url, userName: tempCredentialsData.userName, password: tempCredentialsData.password, apitoken: tempCredentialsData.apitoken, authtype: authtype});
    }
    const getZephyrDetails = async () =>{
        try {
            setLoading("Loading...")
            const data = await getDetails_ZEPHYR()
            if (data.error) { setMsg(data.error); return; }
            if(data !=="empty"){
                setIsEmpty(false);
                let credentialsData = {
                    // authtype: 'basic',
                    // url: '',
                    // apitoken: '',
                    userName: '',
                    password: ''
                };

                // if(data.zephyrURL) credentialsData['url'] = data.zephyrURL;
                // if(data.zephyrAuthType) credentialsData['authtype'] = data.zephyrAuthType;
                // if(data.zephyrToken) credentialsData['apitoken'] = data.zephyrToken;
                if(data.zephyrUsername) credentialsData['userName'] = data.zephyrUsername;
                if(data.zephyrPassword) credentialsData['password'] = data.zephyrPassword;

                setDefaultValues(credentialsData);
                // setZephAuthType(credentialsData.authtype);
                setCredentials(credentialsData);
                saveAction(true, credentialsData);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }
    useEffect(() => {
        type==="Zephyr" && getZephyrDetails();
    }, [])
    

    return(
        <div className="popupWrapRow">
            {loading ? <ScreenOverlay content={loading} /> : null}
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



