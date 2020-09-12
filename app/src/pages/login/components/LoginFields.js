import React, { useState } from 'react';
import * as api from '../api';
import * as adminApi from "../../admin/api";
import "../styles/LoginFields.scss";

/*
    Component: LoginFields
    Props: dispatch and SetProgressBar
    Uses: Renders input fields for user to login
    Todo: modal popups
*/

const LoginFields = (props) => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassField, setPassField] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [userError, setUserError] = useState(false);
    const [passError, setPassError] = useState(false);
    const [loginValidation, setLoginValidation] = useState("");
    const [requested, setRequested] = useState(false);
    const [restartForm, setRestartForm] = useState(false);
    const [focusBtn, setFocus] = useState("");
    let serverList = [{"name": "License Server", "active": false}, {"name": "DAS Server", "active": false}, {"name": "Web Server", "active": false}];
    let dispatch = props.dispatch;
    let SetProgressBar = props.SetProgressBar;

    const handleShowPass = () => {
        // setPassError(false);
        // setUserError(false);
        // setLoginValidation("");
        setShowPass(!showPass);
    }

    const handleUsername = event => {
        resetErrors();
        if (showPassField){
            hidePassField();
        }
        setUsername(event.target.value);
    }
    const handlePassword = event => {
        resetErrors();
        setPassword(event.target.value);
    }

    const resetErrors = () =>{
        setPassError(false);
        setUserError(false);
        setLoginValidation("");
    }

    const hidePassField = () => {
        setPassField(false);
        setPassword("");
        setPassError(false);
        setShowPass(false);
    }

    const checkUser = () => {
        if (requested) return false;
        let err = "Failed to Login.";
        if (!username) {
            setUserError(true);
            // SetProgressBar("stop", dispatch);
            return false;
        }
        setRequested(true);
        (async()=>{
            try{
                let data = await api.checkUser(username)
                // SetProgressBar("stop", dispatch);
                setRequested(false);
                if (data.redirect) {
                    window.location.href = data.redirect;
                    // setRedirectTo(data.redirect);
                } // history.replace(data.redirect);
                else if (data.proceed) setPassField(true);
                else if (data === "invalidServerConf") setLoginValidation("Authentication Server Configuration is invalid!");
                else setLoginValidation(err);    
            }
            catch(err){
                setLoginValidation(err);
                // cfpLoadingBar.complete();
                setRequested(false);
            }
        })()
    }

    const login = event => {
        event.preventDefault();
        if (focusBtn ==="checkpass") handleShowPass();
        else if (focusBtn !== "checkuser" && focusBtn !== "checkpass"){
            resetErrors();
            if (!showPassField) checkUser();
            else if (!password) setPassError(true);
            else check_credentials();
        }
    }

    
    const check_credentials = () => {
        if (username && password){
            setRequested(true);
            SetProgressBar("start", dispatch);
            let user = username.toLowerCase();
            (async()=>{
                try{
                    let data = await api.authenticateUser(user, password)
                    SetProgressBar("stop", dispatch);
                    setRequested(false);
                    if (data === "restart") {
                        // blockUI("Fetching active services...");
                        adminApi.restartService("query")
                        .then(data=> {
                            if (data === "fail") {
                                setLoginValidation("Failed to fetch services.");
                            } else {
                                setRestartForm(true);
                                data.forEach((e, i)=>{
                                    serverList[i].active = e;
                                });
                            }
                            // unblockUI();
                        })
                        .catch(error=> {
                            // unblockUI();
                            console.log("Failed to fetch services. Error::", error)
                            setLoginValidation("Failed to fetch services.");
                        });
                    }
                    else if (data === 'validCredential') window.location='/'; //setRedirectTo('/')  //  history.replace('/')
                    else if (data === 'inValidCredential' || data === "invalid_username_password") {
                        setUserError(true);
                        setPassError(true);
                        setLoginValidation("The username or password you entered isn't correct. Please try again.");
                    }
                    else if (data === "userLogged") setLoginValidation("User is already logged in! Please logout from the previous session.");
                    else if (data === "inValidLDAPServer") setLoginValidation("LDAP Server Configuration is invalid!");
                    else if (data === "invalidUserConf") setLoginValidation("User-LDAP mapping is incorrect!");
                    else setLoginValidation("Failed to Login.");
                }
                catch(err){
                    setRequested(false);
                    console.error("Error::", err)
                }
            })()
        }
    }

    const restartServer = (serverid, serverName) => {
        let errmsg = "Fail to restart " + serverName + " service!";
        // blockUI("Please wait while " + serverName + " service is being restarted...");
        adminApi.restartService(serverid)
        .then(data => {
            if (data === "success") {
                setTimeout(()=>{
                    // unblockUI();
                    // openModalPopup("Restart Service", serverName+" service is restarted successfully!!");
                    alert("Restart Service", serverName+" service is restarted successfully!!");
                }, 120 * 1000);
            } else {
                // unblockUI();
                if (data === "na") errmsg = "Service is not found. Ensure "+serverName+" is running as a service.";
                // openModalPopup("Restart Service", errmsg);
                alert("Restart Service", errmsg);
            }
        })
        .catch(error=> {
            // unblockUI();
            // openModalPopup("Restart Service", errmsg);
            alert("Restart Service", error);
        });
    };
    


    return (
        <>
        { restartForm 
            ?
            <div>
                {serverList.map((server, index)=>{
                    return <button className="restart-service-btn" disabled={!server.active} onClick={()=>restartServer(index, server.name)} type="submit">Restart {server.name}</button>
                })}
            </div>
            :
            <form className="login-form" onSubmit={login}>
            <div className="username-wrap" style={userError ? loginValidation ? {borderColor: "#d33c3c"} : styles.errorBorder : null }>
                <span className="ic-holder"><img className="ic-username" alt="user-ic" src={userError ? res.errorUserIcon : res.defaultUserIcon}/></span>
                <input className="field" placeholder="Username" onFocus={()=>setFocus("username")} value={username} onChange={handleUsername}></input>
                {showPassField && username ? true : <button className="ic-rightarrow fa fa-arrow-circle-right arrow-circle no-decor" onFocus={()=>setFocus("checkuser")} onClick={checkUser}></button>}
            </div>
            {userError && !loginValidation ? <div className="error-msg">Please Enter Username</div> : null}
            {
            showPassField ?
                <>
                <div className="password-wrap" style={passError ? styles.errorBorder : null }>
                    <span className="ic-holder"><img className="ic-password" alt="pass-ic" src={passError ? res.errorPassIcon : res.defaultPassIcon}/></span>
                    <input className="field" type={showPass ? "text" : "password"} autoFocus onFocus={()=>setFocus("password")} placeholder="Password" value={password} onChange={handlePassword}></input>
                    <button className={ "no-decor " + (showPass ? res.eyeSlashIcon : res.eyeIcon) } onFocus={()=>setFocus("checkpass")}></button>
                </div>
                {passError && !loginValidation? <div className="error-msg">Please Enter Password</div> : null}
                <div className="error-msg">{loginValidation}</div>
                <button className="login-btn" type="submit" disabled={requested} onFocus={()=>{setFocus("login")}} onClick={login}>Login</button>
                </>
            : false
            }
            </form>
        }
        </>
    );
}

const styles = {
    errorBorder : { borderColor: "#d33c3c", marginBottom: '19px'},
}

const res = {
    defaultUserIcon : "static/imgs/ic-username.png",
    errorUserIcon :  "static/imgs/ic-username-error.png",
    defaultPassIcon : "static/imgs/ic-password.png",
    errorPassIcon : "static/imgs/ic-password-error.png",
    eyeSlashIcon : "password-eye fa fa-eye-slash eye-ic",
    eyeIcon : "password-eye fa fa-eye eye-ic",
}


export default LoginFields;

