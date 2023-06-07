import React, { useEffect, useState, useRef } from 'react';
import { Messages as MSG, } from '../../global';
import * as api from '../api';
import { Navigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import '../styles/StaticElements.scss'
import { Toast } from 'primereact/toast';

const Login = () => {
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

    const toastError = (erroMessage) => {
        if(erroMessage.CONTENT){
            toast.current.show({ severity: erroMessage.VARIANT, summary: erroMessage.VARIANT, detail: erroMessage.CONTENT, life: 3000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 3000 });
    }

    const forgotPasswordLinkHandler = () => {
        setShowForgotPasswordScreen(true);
        setShowloginScreen(false);
    }
    const singleSignOnHandler = () => {
        setSingleSignOnScreen(true);
        setShowloginScreen(false);
    }
    const backButtonHandler = () => {
        setShowloginScreen(true);
        setSingleSignOnScreen(false);
    }
    const handleUsername = event => {
        setUsername(event.target.value);
    }
    const handlePassword = event => {
        setPassword(event.target.value);
    }
    const emailHandler = event => {
        console.log(event);
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
                        toastError(MSG.LOGIN.SUCC_REC_MAIL);
                    }
                    else if (data === "userLocked") {
                        toastError(MSG.LOGIN.ERR_USER_LOCKED);
                    }
                    else {
                        console.log(MSG.GLOBAL.ERR_SOMETHING_WRONG);
                    };
                })
                .catch(err => {
                    console.error("Error", err)
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

    return (
        <>
            <Toast ref={toast} position="bottom-center" />
            {redirectTo && <Navigate to={redirectTo} />}
            <>
                {showloginScreen &&
                    <>
                        <h2>Avo Assure-Login</h2>
                        <form onSubmit={loginSubmitHandler}>
                            <div className='flex flex-column'>
                                <label className='text-left' htmlFor="username">Username</label>
                                <div className="p-input-icon-left mb-5 mt-2">
                                    <i className='pi pi-user' />
                                    <InputText
                                        id="username"
                                        className='user_input'
                                        value={username}
                                        onChange={handleUsername}
                                        placeholder='Enter your username'
                                        type="text"
                                        required
                                    />
                                </div>
                            </div>

                            <div className='flex flex-column'>
                                <label className='text-left' htmlFor="password">Password</label>
                                <div className="p-input-icon-left mb-5 mt-2">
                                    <i className='pi pi-lock' />
                                    <InputText
                                        id="password"
                                        value={password}
                                        className='user_input'
                                        onChange={handlePassword}
                                        placeholder='Password'
                                        type={showPassword ? "type" : "password"}
                                        required
                                    />
                                    {password && <div className='p-input-icon-right mb-2 cursor-pointer' onClick={() => { setShowPassword(!showPassword) }}>
                                        <i className={`${showPassword ? "pi pi-eye-slash" : "pi pi-eye"}`} />
                                    </div>
                                    }
                                </div>
                            </div>

                            <div className='link forgot_password mb-5'>
                                <a onClick={forgotPasswordLinkHandler} >Forgot Username & Password </a>
                            </div>
                            <div className='login_btn mb-5'>
                                <Button id="login" label='Login' disabled={disableLoginButton} text raised></Button>
                            </div>
                            <div className='link mb-3'>
                                <a onClick={singleSignOnHandler} >Use Single Sign-On </a>
                            </div>
                            <p>Don't have an account?<span className='link'><a tooltip='Contact your admin for creating an account' tooltipOptions={{ position: 'bottom' }} >Create one</a> </span> </p>
                        </form>
                    </>}

                {showForgotPasswordScreen && <>
                    <h2>Forgot Username or Password</h2>
                    <span>Provide your registered e-mail to send a link to reset your Password or to know Username  </span>
                    <form onSubmit={forgotUsernameOrPasswordSubmitHandler}>
                        <div className='flex flex-column'>
                            <label className='text-left' htmlFor="username">Email</label>
                            <div className="p-input-icon-left mb-5 mt-2">
                                <i className='pi pi-user'></i>
                                <InputText
                                    type="email"
                                    id="username"
                                    value={email}
                                    onChange={emailHandler}
                                    placeholder='Enter your email'
                                    className='forgetPassword_user_input'
                                    required
                                />
                            </div>
                        </div>
                        <div className='login_btn mb-5'>
                            <Button id="submit" label='Submit' disabled={!email} text raised></Button>
                        </div>
                    </form>
                </>}

                {singleSignOnScreen && <>
                    <h2>Avo Assure - login with SAML SSO</h2>
                    <form >
                        <div className='flex flex-column'>
                            <label className='text-left' htmlFor="username">Email</label>
                            <div className="p-input-icon-left mb-5 mt-2">
                                <i className='pi pi-user'></i>
                                <InputText id="username" className='forgetPassword_user_input' placeholder='Email' type="email" required />
                            </div>
                        </div>
                        <div className='login_btn mb-5'>
                            <Button id="submit" label='Submit' disabled={false} text raised></Button>
                        </div>
                        <div className='mb-5'>
                            <Button id="back" label='Back' onClick={backButtonHandler} disabled={false} text raised></Button>
                        </div>
                    </form>
                </>}
            </>
        </>
    );
}
export default Login;
