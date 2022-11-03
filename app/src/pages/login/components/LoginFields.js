import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { ScreenOverlay , PopupMsg , ChangePassword, ModalContainer, ScrollBar, Messages as MSG, setMsg } from '../../global';
import * as api from '../api';
import { updatePassword } from "../../global/api";
import errorImage from "../../../assets/imgs/error_exclamation.svg";
import "../styles/LoginFields.scss";
import { TextField } from "@avo/designcomponents";
import {motion, AnimatePresence} from "framer-motion"

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
    const [showSuccessPassReset, setShowSuccessPassReset] = useState(false);
    const [showResetPass, setShowResetPass] = useState(false);
    const [showForgotPassword, setforgotPassword] = useState(true);
    const [lockedOut,setLockedOut] = useState(false);
    const [unlockCond,setUnlockCond] = useState(false);
    const [overlayText, setOverlayText] = useState("");
    const [popup, setPopup] = useState("");
    const [showEmailPopup, setshowEmailPopup] = useState(false);
    const [resetUsername, setResetUsername] = useState("")
    const [recoverEmail, setRecoverEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [duplicateEmails, setDuplicateEmails] = useState([]);
    const [dpEmailViewMore, setdpEmailViewMore] = useState(false);
    const [userResetData, setResetUserData] = useState({});
    const [initialFormPos,setInitialFormPos] = useState(0)
    const [formTitle, setFormTitle] = useState("Avo Assure - Log In");
    const [isTrialInstance, setIsTrialInstance] = useState(false);
    const regEx_email=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    let serverList = [{"name": "License Server", "active": false}, {"name": "DAS Server", "active": false}, {"name": "Web Server", "active": false}];
    let SetProgressBar = props.SetProgressBar;

    const handleShowPass = () => {
        setShowPass(!showPass);
    }

    const toggleChangePass = () => setShowChangePass(!showChangePass);

    const toggleResetPass = () => setShowResetPass(!showResetPass);
    
    const PasswordSuccessPopupReset = () => (
        <>{setMsg({"CONTENT":"Password changed successfully !", "VARIANT":"success"}) && setSuccessPass(false)}</>
    );

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
                    setShowPass(false);
                    if(data.ldapuser) setforgotPassword(false);
                    else setforgotPassword(true);
                    check_credentials();
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
            // if (!showPassField) checkUser();
            if (!password) setPassError(true);
            else checkUser();
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
    
    const forgotPasswordEmail = (email) => {
        setLoginValidation("");
        setLockedOut(false);
        setUserError(false);
        if (email==="" || !regEx_email.test(email)) {
          setEmailError("Please Enter a valid email address")
          // retriggerAnimation("rc_email_validation","shakeX")
        }
        else if (duplicateEmails.length>0 && !resetUsername){
          setEmailError("Please select atleast 1 username")
          // retriggerAnimation("rc_email_validation","shakeX")
        } 
        else {
            SetProgressBar("start");
            api.forgotPasswordEmail({"email":email.toLowerCase(),"username":resetUsername.toLowerCase()})
            .then(data => {
              SetProgressBar("stop");
              if(data.status && data.status==="duplicates_found") {
                console.log("here")
                setDuplicateEmails(data.userList)
                setMsg(MSG.LOGIN.DUP_ACC_EXISTS);
              }
				      else if (data === 'success' || data === "invalid_username_password" || data==="fail" ) {
                  setUserError(false);
                  setPassError(false);
                  setPassword("");
                  setMsg(MSG.LOGIN.SUCC_REC_MAIL);
                  setshowEmailPopup(false); 
              } 
              else if (data === "userLocked") {
                  setshowEmailPopup(false);
                  setLockedOut(true);
                  setLoginValidation("User account is locked!");
                  setforgotPassword(false);
				      } 
              else {
                setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
              };
            })
            .catch(err=> {
                setshowEmailPopup(false); 
				        SetProgressBar("stop");
                setRequested(false);
                setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
                console.error("Error",err)
            });
		    }
    };

    const retriggerAnimation = (id, clsName) => {
      document.getElementById(id).classList.remove(clsName);
      setTimeout(()=>{
          document.getElementById(id).classList.add(clsName)
      },100)
  }
    
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

    const updatePass = (newpassword) => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        let user_id = urlParams.get('user_id')
        updatePassword(newpassword, user_id).then((res)=>{
            if(res==="success"){
                toggleResetPass();
                setShowSuccessPassReset(true);
                redirectToHomePage();
            }
        }).catch((err)=>{
            console.log(err)
        })
    }

    const redirectToHomePage = ()=>{
        setTimeout(()=>{
            setRedirectTo("/");
        },2000)
    }

    useEffect(()=>{
        setInitialFormPos(-20);
        if(props.verifyPage){
            setOverlayText("Loading...");
            (async()=>{
                const queryString = window.location.search;
                const urlParams = new URLSearchParams(queryString);
                let user_id = urlParams.get('user_id')
                if(!user_id){
                    setOverlayText("");
                    redirectToHomePage();
                    return
                }
                api.shouldShowVerifyPassword(user_id).then((res)=>{
                    if(res){
                        setOverlayText("");
                        setShowResetPass(true);
                    } else {
                        setOverlayText("");
                        redirectToHomePage();
                    }
                }).catch((error)=>{
                    console.log(error);
                    setOverlayText("");
                    redirectToHomePage();
                })
            })();
        } else if (props.resetPassword){
          setOverlayText("Loading...");
            (async()=>{
                const queryString = window.location.search;
                const urlParams = new URLSearchParams(queryString);
                let user_id = urlParams.get('user_id')
                if(!user_id){
                    setOverlayText("");
                    redirectToHomePage();
                    return
                }
                api.shouldResetPassword(user_id).then((res)=>{
                    if(res.flag && res.flag === "changePwd"){
                        setOverlayText("");
                        setResetUserData(res.user)
                        setShowChangePass(true);
                    } else {
                        setOverlayText("");
                        redirectToHomePage();
                    }
                }).catch((error)=>{
                    console.log(error);
                    setOverlayText("");
                    redirectToHomePage();
                })
            })();
        }
    },[])


    // const Content = ()=>{
    //     return (
    //       <>
    //         { duplicateEmails.length>0 ?
    //         <>
    //           <ScrollBar thumbColor="#613191" >
    //             <div className="reset_container" style={{gap:10, maxHeight:400, marginRight:20}}>
    //               <div className="rc_textContent" style={{fontSize:"1.2rem"}}>
    //                 Multiple accounts with same email address found! Please select your username to recover your account
    //               </div>  
    //               {duplicateEmails.map((user)=>{
    //                 return (
    //                 <div key={user.name} className="rc_reset_username" data-selected={resetUsername===user.name} onClick={()=>{setEmailError("");setResetUsername(user.name)}}>
    //                   {user.name}
    //                 </div>)
    //               })}
    //             </div>
    //           </ScrollBar>
    //         </>:
    //         <>
    //          <div className="reset_container">
    //           <div className="rc_textContent">
    //             Enter the email associated with your account and we'll send an email with instructions to recover your account.
    //           </div>  
    //           <div className="rc_input_group">
    //               <input className={"rc_email_input " + (emailError ? "error_reset_field" : "")} type={"email"} autoFocus={true}
    //                autoComplete="true" onChange={(e)=>{setEmailError("");setRecoverEmail(e.target.value.trim())}} autoCorrect={"false"} 
    //                autoCapitalize={"false"} tabIndex={2} value={recoverEmail}/>
    //               <label className={`rc_email_label ${recoverEmail.length?"shrinked_label":""}`}>Email address</label>
    //             </div>         
    //          </div>
    //         </>}
    //         <span id="rc_email_validation" className={"email_valid_err " + (emailError ? "shakeX" : "hide_email_valid")}>
    //           {emailError ? (
    //           <div style={{display:"flex"}}>
    //               <img height={16} width={16} style={{marginRight:5}} src={errorImage} alt="error_ex_image"/>
    //               <span style={{fontSize:12, fontFamily:"Mulish"}}>{emailError}</span>
    //           </div>
    //             )
    //           : "null"}
    //         </span>
    //       </>
    //     )
    // }

    // const Footer = () => {
    //   return (
    //     <div className="rc_dialog_btns">
    //         <button tabIndex={2} type='submit' className="submit_rc_button">Send Instructions</button>
    //     </div>
    //   )
    // }

    const ForgotUsernamePasswordContent = () => {
      return (
      <motion.div className="forgot-container" initial={{x:20, opacity:0}} animate={{x:0, opacity:1}} transition={{duration:0.7}}>
        {duplicateEmails.length>0?
        <>
          <motion.div className="forgot-container" initial={{x:20, opacity:0}} animate={{x:0, opacity:1}} transition={{duration:0.7}}>
            <div className="form-title">Select one username</div>
            <div className="forgot-content">Listed below are the usernames associated with this mail-id, select one to proceed:</div>
            <ScrollBar thumbColor="#613191" >
              <div className="username-container">
                {duplicateEmails.map((user,idx)=>{
                    return (
                        (!dpEmailViewMore ? idx<4:true) && <div key={user.name}> 
                          <label>
                            <input
                              onChange={()=>{setEmailError("");setResetUsername(user.name)}}
                              checked={resetUsername===user.name}
                              id={user.name}
                              type="radio"
                            />
                            <span>{user.name}</span>
                          </label>
                        </div>
                    )
                })}
              </div>
            </ScrollBar>
            {dpEmailViewMore || duplicateEmails.length<4 ?null:<div style={{color:"#5F338F", fontFamily:"Mulish", fontSize:"1rem",textDecoration:"underline", cursor:"pointer"}} onClick={()=>{setdpEmailViewMore(true)}}>View More</div>}
            <div style={{display:"flex", flexDirection:"row", gap:"2rem", justifyContent:"flex-end"}}>
                <button data-test='cancel-button' data-type="mr-top-1" className="login-btn" type="button" onClick={()=>{setshowEmailPopup(false); setdpEmailViewMore(false)}}>Cancel</button>
                <button data-test='login-button' data-type="mr-top-1" className="login-btn" type="submit" disabled={!recoverEmail || !resetUsername} onClick={(e)=>{e.preventDefault();forgotPasswordEmail(recoverEmail);}}>Submit</button>
              </div>
          </motion.div>
        </>
        :
        <>
          <div className="form-title">Forgot Username or Password?</div>
          <div className="forgot-content">To reset your password or retrieve your username please provide your email address. We will send you an e-mail with your username and a link to reset your password.</div>
          <form data-test='login-form' className="login-form" onSubmit={(e)=>{e.preventDefault();forgotPasswordEmail(recoverEmail);}}>
            <div style={{marginBottom:"1rem",justifyContent:"center",display:"flex"}}>
              <TextField
                iconName="user"
                label="Email Address"
                onChange={(e)=>{setEmailError("");setRecoverEmail(e.target.value.trim())}}
                placeholder="Email Address"
                value={recoverEmail}
                width="400px"
                error={emailError}
                autoCapitalize={"false"}
                autoCorrect={"false"} 
                errorMessage={emailError?emailError:null}
                autoFocus={true}
                type={"email"}
              />
            </div>
            <div style={{display:"flex", flexDirection:"row", gap:"2rem", justifyContent:"flex-end"}}>
              <button data-test='cancel-button' className="login-btn" type="button" onClick={()=>{setshowEmailPopup(false); setdpEmailViewMore(false);}}>Cancel</button>
              <button data-test='login-button' className="login-btn" type="submit" disabled={!recoverEmail}>Submit</button>
            </div>
          </form>
        </>}
      </motion.div>)
    }

    const recoverAccountStart = () => {
      setResetUsername("");
      setRecoverEmail("");
      setEmailError("");
      setDuplicateEmails([]);
      setshowEmailPopup(true);
    }
    return (
        <>
        { popup && <PopUp /> }
        { overlayText && <ScreenOverlay content={overlayText}/>}
        { showSuccessPass && <PasswordSuccessPopup /> }
        { showSuccessPassReset && <PasswordSuccessPopupReset/>}
        { showChangePass && <ChangePassword setRedirectTo={setRedirectTo} setShow={toggleChangePass} setSuccessPass={setSuccessPass} loginCurrPassword={null} changeType={"forgotPass"} userResetData={userResetData}/>}
        { showResetPass && <ChangePassword setRedirectTo={setRedirectTo} setShow={toggleResetPass} setSuccessPass={setShowSuccessPassReset} loginCurrPassword={null} changeType={"CreateNewPass"} updatePass={updatePass} /> }
        {/* { showEmailPopup && 
          <ModalContainer
          close={()=>{setshowEmailPopup(false)}}
          title={"Recover Your Account"}
          content={Content()}
          footer={Footer()}
          modalClass="rc_modal_dialog"
          onSubmit={(e)=>{e.preventDefault();forgotPasswordEmail(recoverEmail);}}
          />} */}
        {redirectTo && <Redirect to={redirectTo} /> }
          <div style={{display:"flex",flexDirection:"row",width:"100%",flex:1}}>
            { restartForm &&
              <div>
                  {serverList.map((server, index)=>{
                      return <button key={index} className="restart-service-btn" disabled={!server.active} onClick={()=>restartServer(index, server.name)} type="submit">Restart {server.name}</button>
                  })}
              </div>
            }
            <AnimatePresence>
              {showEmailPopup && ForgotUsernamePasswordContent()}
            </AnimatePresence>
            <AnimatePresence>
            {!restartForm && !showEmailPopup &&
            (<motion.div className={"login-container"} initial={{x:initialFormPos, opacity:0}} animate={{x:0, opacity:1}} transition={{duration:0.7}}>
              <div className="form-title">{formTitle}</div>
              <form data-test='login-form' className="login-form" onSubmit={login}>
              {/* <div data-test='login-username' className="username-wrap" style={userError ? loginValidation ? {borderColor: "#d33c3c"} : styles.errorBorder : null }>
                  <span data-test='username-icon' className="ic-holder"><img data-test="username-image" className="ic-username" alt="user-ic" src={userError ? res.errorUserIcon : res.defaultUserIcon}/></span>
                  <input data-test='username-input' className="field" placeholder="Username" onFocus={()=>setFocus("username")} value={username} onChange={handleUsername}></input>
                  {showPassField && username ? true : <button data-test='login-username-button' className="ic-rightarrow fa fa-arrow-circle-right arrow-circle no-decor" onFocus={()=>setFocus("checkuser")} onClick={checkUser}></button>}
              </div> */}
              <div style={{marginBottom:"1rem"}}>
                <TextField
                  iconName="user"
                  label="Username/Email"
                  onChange={handleUsername}
                  placeholder="Username/Email"
                  value={username}
                  onFocus={()=>setFocus("username")}
                  width="400px"
                  error={userError && !loginValidation}
                  errorMessage={userError && !loginValidation?"Please Enter Username":null}
                  autoFocus={true}
                />
              </div>
              <TextField
                iconName='password'
                canRevealPassword
                label="Password"
                placeholder="Password"
                type="password"
                value={password}
                width="400px"
                onFocus={()=>setFocus("password")}
                onChange={handlePassword}
                error={passError && !loginValidation}
                errorMessage={passError && !loginValidation?"Please Enter Password":null}
              />
              {/* {userError && !loginValidation ? <div data-test='login-username-error' className="error-msg">Please Enter Username</div> : null} */}
              {
                  <>
                  {/* <div data-test='login-password' className="password-wrap" style={passError ? styles.errorBorder : null }>
                      <span data-test="password-icon" className="ic-holder"><img data-test="password-image" className="ic-password" alt="pass-ic" src={passError ? res.errorPassIcon : res.defaultPassIcon}/></span>
                      <input data-test="password-input" className="field" type={showPass ? "text" : "password"} autoFocus onFocus={()=>setFocus("password")} placeholder="Password" value={password} onChange={handlePassword}></input>
                      <button data-test="password-eyeIcon" className={ "no-decor " + (showPass ? res.eyeIcon : res.eyeSlashIcon) } onFocus={()=>setFocus("checkpass")}></button>
                  </div> */}
                  {showForgotPassword?
                  <div ><a id="forgotPassword" className="forget-password" onClick={recoverAccountStart} >Forgot Username or Password?</a></div>:null}
                  {/* {passError && !loginValidation? <div data-test='password-error' className="error-msg">Please Enter Password</div> : null} */}
                  <div data-test="login-validation" className="error-msg-login" style={!loginValidation?{display:"none"}:{}}>
                    <img height={16} width={16} style={{marginRight:5}} src={errorImage} alt="error_ex_image"/>
                    {loginValidation} {" "}
                    {lockedOut?
                        <span className="error-msg-login">
                        Click 
                        <a className="error-msg-hyperlink" onClick={()=>{unlockAccountEmail()}} > <b>here</b></a> to unlock.
                        </span>:""}
                  </div>
                  <button data-test='login-button' className="login-btn" type="submit" disabled={requested || (!unlockCond?!(username.length && password.length):false)} onFocus={()=>{setFocus("login")}} onClick={unlockCond?unlock:login}>{unlockCond?"Unlock":"Log in"}</button>
                  </>
              }
              </form>
              {!unlockCond && !isTrialInstance?<div className='login-hint'>Don't have an account? Contact your admin for creating an account.</div>:null}
            </motion.div>
            )} 
          </AnimatePresence>
        </div> 
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

