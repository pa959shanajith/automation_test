import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { ScreenOverlay , PopupMsg , ChangePassword, Messages as MSG, setMsg } from '../../global';
import * as api from '../api';
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
    const [redirectTo, setRedirectTo] = useState("");
    const [focusBtn, setFocus] = useState("");
    const [showChangePass, setShowChangePass] = useState(false);
    const [showSuccessPass, setSuccessPass] = useState(false);
    const [showForgotPassword, setforgotPassword] = useState(true);
    const [lockedOut,setLockedOut] = useState(false);
    const [unlockCond,setUnlockCond] = useState(false);
    const [overlayText, setOverlayText] = useState("");
    const [popup, setPopup] = useState("");

    let serverList = [{"name": "License Server", "active": false}, {"name": "DAS Server", "active": false}, {"name": "Web Server", "active": false}];
    let SetProgressBar = props.SetProgressBar;

    const handleShowPass = () => {
        setShowPass(!showPass);
    }

    const toggleChangePass = () => setShowChangePass(!showChangePass);
    
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
        setLockedOut(false);
    }

    const hidePassField = () => {
        setPassField(false);
        setPassword("");
        setPassError(false);
        setPassField(false);
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
                }
                else if (data.proceed) {
                    setPassField(true);
                    if(data.ldapuser) setforgotPassword(false);
                    else setforgotPassword(true);
                } 
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

    const unlock = event => {
        SetProgressBar("start");
		setLoginValidation("");
		setLockedOut(false);
		resetErrors();
		if (!username) {
			setUserError(true);
			setLoginValidation("Please Enter Username");
			SetProgressBar("stop");
		} else if (!password) {
			setPassError(true);
			setLoginValidation("Please Enter Password");
			SetProgressBar("stop");
		} else {
			setRequested(true);
            api.unlock(username.toLowerCase(), password)
            .then(data => {
                SetProgressBar("stop");
                setRequested(false);
                if (data === 'success') {
                    setUserError(false);
                    setPassError(false);
                    setUnlockCond(false);
                    setLockedOut(false);
                    setPassField(false);
                    setPassword("");
                    setUsername("");
                    setforgotPassword(true);
                    setMsg(MSG.LOGIN.SUCC_UNLOCKED);
                } else if (data === "invalid_username_password") {
                    setUserError(true);
                    setPassError(true);
                    setLoginValidation("The username or password you entered isn't correct. Please try again.");
                } else if(data === "timeout") setLoginValidation("Password expired."); 
                else if (data === "userUnlocked") setLoginValidation("User account is already unlocked!"); 
                else setLoginValidation("Failed to Login.");
            })
            .catch(error=> {
                console.error("Failed to Authenticate User. ERROR::::", error);
                setLoginValidation("Failed to Authenticate User.");
                SetProgressBar("stop");
                setRequested(false);
            });
        }
    }
    
    const check_credentials = () => {
        if (username && password){
            setRequested(true);
            SetProgressBar("start");
            let user = username.toLowerCase();
            (async()=>{
                try{
                    let data = await api.authenticateUser(user, password)
                    SetProgressBar("stop");
                    setRequested(false);
                    if (data === "restart") {
                        setOverlayText("Fetching active services...");
                        api.restartService("query")
                        .then(data=> {
                            if (data === "fail") {
                                setLoginValidation("Failed to fetch services.");
                            } else {
                                setRestartForm(true);
                                data.forEach((e, i)=>{
                                    serverList[i].active = e;
                                });
                            }
                            setOverlayText("");
                        })
                        .catch(error=> {
                            setOverlayText("");
                            console.log("Failed to fetch services. Error::", error)
                            setLoginValidation("Failed to fetch services.");
                        });
                    }
                    else if (data === 'validCredential')  setRedirectTo("/")
                    else if (data === 'inValidCredential' || data === "invalid_username_password") {
                        setUserError(true);
                        setPassError(true);
                        setLoginValidation("The username or password you entered isn't correct. Please try again.");
                    } else if (data === "changePwd") {
                        setShowChangePass(true);
                    } else if(data === "timeout") {
                       setLoginValidation("User Password has expired. Please reset forgot password or contact admin");
                    } else if (data === "userLocked") {
                        setLoginValidation("User account is locked!");
                        setLockedOut(true);
                        setforgotPassword(false);
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
        setOverlayText("Please wait while " + serverName + " service is being restarted...");
        api.restartService(serverid)
        .then(data => {
            if (data === "success") {
                setOverlayText("");
                setPopup({'title': "Restart Service", "content": serverName+" service is restarted successfully!!"})               
            } else {
                setOverlayText("");
                if (data === "na") errmsg = "Service is not found. Ensure "+serverName+" is running as a service.";
                setPopup({"title": "Restart Service", "content": errmsg})
            }
        })
        .catch(error=> {
            setOverlayText("");
            setPopup({'title': "Restart Service", 'content': errmsg})
        });
    };
    
    const forgotPasswordEmail = () => {
        SetProgressBar("start");
        setLoginValidation("");
		setLockedOut(false);
		setUserError(false);
		if (username==="") {
            setUserError(true);
            setLoginValidation("Please Enter Username")
		} else {
            api.forgotPasswordEmail(username.toLowerCase())
            .then(data => {
                SetProgressBar("stop");
				if (data === 'success' || data === "invalid_username_password") {
					setUserError(false);
                    setPassError(false);
                    setPassword("");
                    setMsg(MSG.LOGIN.SUCC_FORGOTP_MAIL);
                } else if (data === "userLocked") {
					setLockedOut(true);
                    setLoginValidation("User account is locked!");
                    setforgotPassword(false);
				}
				else setLoginValidation("Failed to Login.");
            })
            .catch(err=> {
                setLoginValidation(err);
				SetProgressBar("stop");
                setRequested(false);
            });
		}
    };
    
    const unlockAccountEmail = () => {
        SetProgressBar("start");
        setLoginValidation("")
        setUserError(false);
        setLockedOut(false);
		if (username==="") {
            setUserError(true);
            setLoginValidation("Please Enter Username")
		} else {
            api.unlockAccountEmail(username.toLowerCase())
            .then(data => {
                SetProgressBar("stop");
				if (data === 'success') {
					setUserError(false);
                    setPassError(false);
					setPassword("");
                    setforgotPassword(false);
                    setUnlockCond(true);
                    setMsg(MSG.LOGIN.SUCC_UNLOCK_MAIL);
                } else if (data === "invalid_username_password") {
					setUserError(false);
                    setPassError(true);
                    setLoginValidation("The username or password you entered isn't correct. Please try again.");
				} else if (data === "userUnlocked") setLoginValidation("User account is already unlocked!");  
				else setLoginValidation("Failed to Login.");
            })
            .catch(err=> {
                console.error(err);
				setLoginValidation(err);
				SetProgressBar("stop");
                setRequested(false);
            });
		}
	};

    const PopUp = () => (
        <PopupMsg 
            variant={popup.variant}
            content={popup.content}
            close={()=>setPopup("")}
        />
    );

    const PasswordSuccessPopup = () => (
        <>{setMsg(MSG.LOGIN.SUCC_P_CHANGE) && setSuccessPass(false)}</>
    );

    return (
        <>
        { popup && <PopUp /> }
        { overlayText && <ScreenOverlay content={overlayText}/>}
        { showSuccessPass && <PasswordSuccessPopup /> }
        { showChangePass && <ChangePassword setShow={toggleChangePass} setSuccessPass={setSuccessPass} loginCurrPassword={password} /> }
        {redirectTo ? <Redirect to={redirectTo} /> :
            <>
            { restartForm 
            ?
            <div>
                {serverList.map((server, index)=>{
                    return <button key={index} className="restart-service-btn" disabled={!server.active} onClick={()=>restartServer(index, server.name)} type="submit">Restart {server.name}</button>
                })}
            </div>
            :
            <form data-test='login-form' className="login-form" onSubmit={login}>
            <div data-test='login-username' className="username-wrap" style={userError ? loginValidation ? {borderColor: "#d33c3c"} : styles.errorBorder : null }>
                <span data-test='username-icon' className="ic-holder"><img data-test="username-image" className="ic-username" alt="user-ic" src={userError ? res.errorUserIcon : res.defaultUserIcon}/></span>
                <input data-test='username-input' className="field" placeholder="Username" onFocus={()=>setFocus("username")} value={username} onChange={handleUsername}></input>
                {showPassField && username ? true : <button data-test='login-username-button' className="ic-rightarrow fa fa-arrow-circle-right arrow-circle no-decor" onFocus={()=>setFocus("checkuser")} onClick={checkUser}></button>}
            </div>
            {userError && !loginValidation ? <div data-test='login-username-error' className="error-msg">Please Enter Username</div> : null}
            {
            showPassField &&
                <>
                <div data-test='login-password' className="password-wrap" style={passError ? styles.errorBorder : null }>
                    <span data-test="password-icon" className="ic-holder"><img data-test="password-image" className="ic-password" alt="pass-ic" src={passError ? res.errorPassIcon : res.defaultPassIcon}/></span>
                    <input data-test="password-input" className="field" type={showPass ? "text" : "password"} autoFocus onFocus={()=>setFocus("password")} placeholder="Password" value={password} onChange={handlePassword}></input>
                    <button data-test="password-eyeIcon" className={ "no-decor " + (showPass ? res.eyeSlashIcon : res.eyeIcon) } onFocus={()=>setFocus("checkpass")}></button>
                </div>
                {showForgotPassword?
                <div ><a id="forgotPassword" className="forget-password" onClick={()=>{forgotPasswordEmail()}} >Forgot Password?</a></div>:null}
                {passError && !loginValidation? <div data-test='password-error' className="error-msg">Please Enter Password</div> : null}
                <div data-test="login-validation" className="error-msg">{loginValidation}
                {lockedOut?
                    <span className="error-msg"> Click 
                    <a className="error-msg-hyperlink" onClick={()=>{unlockAccountEmail()}} > <b>here</b></a> to unlock.
                    </span>
                :""}</div>
                <button data-test='login-button'  className="login-btn" type="submit" disabled={requested} onFocus={()=>{setFocus("login")}} onClick={unlockCond?unlock:login}>{unlockCond?"Unlock":"Login"}</button>
                </>
            }
            </form>
        } </> }
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

