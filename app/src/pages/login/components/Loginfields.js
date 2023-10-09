import React, { useEffect, useState, useRef } from 'react';
import { Messages as MSG, } from '../../global';
import * as api from '../api';
import { Navigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import '../styles/StaticElements.scss'
import { Toast } from 'primereact/toast';
import ChangePassword from '../../global/components/ChangePassword';

const Login = (props) => {
    let serverList = [{ "name": "License Server", "active": false }, { "name": "DAS Server", "active": false }, { "name": "Web Server", "active": false }];
    const regEx_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const [showForgotPasswordScreen, setShowForgotPasswordScreen] = useState(false);
    const [singleSignOnScreen, setSingleSignOnScreen] = useState(false);
    const [disableLoginButton, setdisableLoginButton] = useState(true);
    const [showloginScreen, setShowloginScreen] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [redirectTo, setRedirectTo] = useState("");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const toast = useRef(null);
    const [overlayText, setOverlayText] = useState("");
    const [initialFormPos,setInitialFormPos] = useState(0)
    const [userInfo, setUserInfo] = useState({});
    const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);

    const toastError = (erroMessage) => {
        if (erroMessage.CONTENT) {
            toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 10000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 10000 });
    }
    const toastSuccess = (successMessage) => {
        if (successMessage.CONTENT) {
            toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
    }

    const forgotPasswordLinkHandler = () => {
        setShowForgotPasswordScreen(true);
        setShowloginScreen(false);
        setEmail('');
    }
    const singleSignOnHandler = () => {
        setSingleSignOnScreen(true);
        setShowloginScreen(false);
    }
    const backButtonHandler = () => {
        setShowloginScreen(true);
        setSingleSignOnScreen(false);
        setShowForgotPasswordScreen(false);
        setUsername('');
        setPassword('');
    }
    const handleUsername = event => {
        setUsername(event.target.value);
    }
    const handlePassword = event => {
        setPassword(event.target.value);
    }
    const emailHandler = event => {
        setEmail(event.target.value.trim());
    }

    useEffect(() => {
        if (username.length > 0 && password.length > 0) {
            setdisableLoginButton(false);
        }
        else setdisableLoginButton(true);
    }, [username, password]);


    const checkUser = async () => {
        let errorMsg = "Failed to Login.";
        try {
            const checkUserIsPresent = await api.checkUser(username);
            if (checkUserIsPresent.redirect) {
                window.location.href = checkUserIsPresent.redirect;
            }
            else if (checkUserIsPresent.proceed) {
                check_credentials();
            }
            else if (checkUserIsPresent === "invalidServerConf") toastError("Authentication Server Configuration is invalid!");
            else toastError(errorMsg);
        }
        catch (err) {
            toastError(err)
        }
    }

    const check_credentials = async () => {
        try {
            let userValidate = await api.authenticateUser(username.toLowerCase(), password);
            if (userValidate === "restart") {
                api.restartService("query")
                    .then(data => {
                        if (data === "fail") {
                            toastError("Failed to fetch services.");
                        } else {
                            data.forEach((e, i) => {
                                serverList[i].active = e;
                            });
                        }
                    })
                    .catch(error => {
                        console.log("Failed to fetch services. Error::", error);
                    });
            }
            else if (userValidate === 'validCredential') setRedirectTo('/');
            else if (userValidate === 'inValidCredential' || userValidate === "invalid_username_password") {
                toastError(MSG.LOGIN.ERR_USER_LOGIN_CREDENTIALS);
            } else if (userValidate === "changePwd") {
                toastError("Changing Password is not implemented in code");
            } else if (userValidate === "timeout") {
                toastError("User Password has expired. Please reset forgot password or contact admin");
            } else if (userValidate === "userLocked") {
                toastError("User account is locked!");
            }
            else if (userValidate === "userLogged") toastError("User is already logged in! Please logout from the previous session.");
            else if (userValidate === "inValidLDAPServer") toastError("LDAP Server Configuration is invalid!");
            else if (userValidate === "invalidUserConf") toastError("User-LDAP mapping is incorrect!");
            else toastError("Failed to Login.");
        }
        catch (err) {
            console.log(err);
        }
    }

    const loginSubmitHandler = async (event) => {
        toast.current.clear();
        event.preventDefault();
        if (username.trim().length > 0 && password.length > 0) {
            checkUser();
        }
        else { toastError("Enter a valid username and password.") }
    }

    const forgotUsernameOrPasswordSubmitHandler = async (event) => {
        event.preventDefault();
        if (email === "" || !regEx_email.test(email)) {
            toastError("Please enter a valid email address")
        }
        else {
            api.forgotPasswordEmail({ "email": email.toLowerCase(), "username": '' })
                .then(data => {
                    if (data.status && data.status === "duplicates_found") {
                        toastError(MSG.LOGIN.DUP_ACC_EXISTS);
                    }
                    else if (data === 'success' || data === "invalid_username_password" || data === "fail") {
                        toastSuccess(MSG.LOGIN.SUCC_REC_MAIL);
                    }
                    else if (data === "userLocked") {
                        toastError(MSG.LOGIN.ERR_USER_LOCKED);
                    }
                    else {
                        toastError(MSG.GLOBAL.ERR_SOMETHING_WRONG);
                    };
                })
                .catch(err => {
                    console.log("Error", err)
                });
        }
    }
    // need code for future ------Single Sign on 
    // const singleSignOnSubmitHandler = () => {
    //     try {
    //         const checkUserIsPresent = await api.checkUser(username);
    //         if (checkUserIsPresent.redirect) {
    //             window.location.href = checkUserIsPresent.redirect;
    //         }
    //         else if (checkUserIsPresent.proceed) {
    //             check_credentials();
    //         }
    //         else if (checkUserIsPresent === "invalidServerConf") toastError("Authentication Server Configuration is invalid!");
    //         else toastError(errorMsg);
    //     }
    //     catch (err) {
    //         toastError(err)
    //     }
    // }
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
                    setUserInfo(res.userInfo)
                    if(res.proceed){
                        setOverlayText("");
                        setShowChangePasswordDialog(true)
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
                        setUserInfo(res.user)
                        setShowChangePasswordDialog(true)
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

    const toastErrored = (erroMessage) => {
        if (erroMessage.CONTENT) {
            toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
    }

    const toastSuccessed = (successMessage) => {
        if (successMessage.CONTENT) {
            toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
    }
    
    return (
        <>
            <Toast ref={toast} position="bottom-center" />
            {redirectTo && <Navigate to={redirectTo} />}
            <>
                {showloginScreen &&
                    <>
                        <form onSubmit={loginSubmitHandler}>
                            <div className='flex flex-column'>
                                <label className='text-left Login_Font' htmlFor="username">Username</label>
                                <div className="p-input-icon-left mb-5 mt-2">
                                    <i className='pi pi-user' />
                                    <InputText
                                        id="username"
                                        className='user_input'
                                        value={username}
                                        onChange={handleUsername}
                                        placeholder='Enter username'
                                        type="text"
                                        
                                    />
                                </div>
                            </div>

                            <div className='flex flex-column'>
                                <Tooltip target='.eyeIcon' content={showPassword ? 'Hide Password' : 'Show Password'} position='bottom' />
                                <label className='text-left Login_Font' htmlFor="password">Password</label>
                                <div className="p-input-icon-left mb-5 mt-2">
                                    <i className='pi pi-lock' />
                                    <InputText
                                        id="password"
                                        value={password}
                                        className='user_input'
                                        onChange={handlePassword}
                                        placeholder='Enter password'
                                        type={showPassword ? "type" : "password"}
                                    />
                                    {password && <div className='p-input-icon-right mb-2 cursor-pointer' onClick={() => { setShowPassword(!showPassword) }}>
                                        <i className={`eyeIcon ${showPassword ? "pi pi-eye-slash" : "pi pi-eye"}`} />
                                    </div>
                                    }
                                </div>
                            </div>

                            <div className='mb-5'>
                                <Button className='Btn Login_Btn' id="login" label='Login' size="small" disabled={disableLoginButton} ></Button>
                            </div>
                            <div className='link mb-5'>
                                <a onClick={forgotPasswordLinkHandler} > Forgot Username/Password? </a>
                            </div>
                            <div className='link mb-3'>
                                <a onClick={singleSignOnHandler} >Login with SSO/SAML</a>
                            </div>
                            <span className="text-sm Contact_Admin_link"> Don't have an account? Contact admin to create an account.</span>
                        </form>
                    </>}

                {showForgotPasswordScreen && <>
                    <span className='Forgot_Header'>Forgot Username/Password?</span>
                    <span className='Password_reset_link'> Provide registered email address to retrieve username/receive password resent link.  </span>
                    <form onSubmit={forgotUsernameOrPasswordSubmitHandler}>
                        <div className='flex flex-column'>
                            <label className='text-left Login_Font' htmlFor="email">Email Address</label>
                            <div className="p-input-icon-left mb-5 mt-2">
                                <i className='pi pi-user'></i>
                                <InputText
                                    id="email"
                                    value={email}
                                    onChange={emailHandler}
                                    placeholder='Enter email address'
                                    className='forgetPassword_user_input'
                                />
                            </div>
                        </div>
                        <div className='login_btn mb-5'>
                            <Button className='Btn' id="back" label='Back' size="small" onClick={backButtonHandler} disabled={false} text ></Button>
                            <Button className='Btn' id="submit" label='Submit' size="small" disabled={!email} ></Button>
                        </div>
                    </form>
                </>}

                {singleSignOnScreen && <>
                    <span className='Forgot_Header'>Login with SSO/SAML</span>
                    <span className='Password_reset_link'> Enter user ID associated with SSO/SAML account.</span>
                    <form>
                        <div className='flex flex-column'>
                            <label className='text-left Login_Font' htmlFor="username">User ID</label>
                            <div className="p-input-icon-left mb-5 mt-2">
                                <i className='pi pi-user'></i>
                                <InputText id="username" className='forgetPassword_user_input' placeholder='Enter user id' />
                            </div>
                        </div>
                        <div className='login_btn mb-5'>
                            <Button className='Btn' id="back" label='Back' size="small" onClick={backButtonHandler} disabled={false} text ></Button>
                            <Button className='Btn' id="submit" label='Submit' size="small" disabled={false} ></Button>
                        </div>
                    </form>
                </>}
                {showChangePasswordDialog && < ChangePassword showDialogBox={showChangePasswordDialog} setShowDialogBox={setShowChangePasswordDialog} userInfo={userInfo} toastError={toastErrored}  toastSuccess={toastSuccessed}  />}
            </>
        </>
    );
}
export default Login;
