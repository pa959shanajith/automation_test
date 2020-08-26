import React, { useState, useEffect, useRef } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import * as api from '../api';
import LoadingBar from 'react-top-loading-bar';
import Footer from "../components/Footer.js"
import "../styles/BasePage.scss";

/*
    Component: BasePage
    Uses: When loading from '/' it renders the base page 
            and when calling '/login' it renders the login fields by checking the props
    Todo: Loading bar
*/

const BasePage = (props) => {

    // const ref = useRef(null);
    const [loginValidation, setLoginValidation] = useState("Loading Profile...");
    const [loginAgain, setLoginAgain] = useState(true);
    const [checkLogout, setCheckLogout] = useState(JSON.parse(window.sessionStorage.getItem('checkLoggedOut')));
    const [redirectTo , setRedirectTo] = useState(null);
    const history = useHistory();

    useEffect(()=>{
        console.log(props)
        if (props.location) {
            if (!props.location.state){ 
                setRedirectTo("/login");
            }
            else{    
                (async()=>{
                        window.localStorage.clear();
                        window.sessionStorage.clear();
                        if (checkLogout) {
                            if ((typeof(checkLogout) == "object") && (checkLogout.length == 2)) {
                                setLoginValidation("Your session has been terminated by "+checkLogout[0]);
                                if (checkLogout[1] == "dereg") setLoginValidation("Reason: User is deleted from Avo Assure");
                            } 
                            else setLoginValidation("You Have Successfully Logged Out!");
                            // ref.current.complete();
                        }
                        else {
                            setLoginAgain(false);
                            try{
                                let data = await api.checkUserState()
                                // ref.current.complete();
                                let emsg = "Loading Profile...";
                                if (data == "fail") emsg = "Failed to load user profile.";
                                else if (data == "unauthorized") emsg = "User is not authorized to use Avo Assure.";
                                else if (data == "badrequest") emsg = "User does not have sufficient permission to view this page.";
                                else if (data == "nouser") emsg = "User profile not found in Avo Assure.";
                                else if (data == "nouserprofile") emsg = "User profile not found in Authorization Server.";
                                else if (data == "userLogged") emsg = "User is already logged in! Please logout from the previous session.";
                                else if (data == "inValidCredential" || data == "invalid_username_password") emsg = "The username or password you entered isn't correct. Please try again.";
                                else if (data == "noProjectsAssigned") emsg = "To Login, user must be allocated to a Domain and Project. Please contact Admin.";
                                else if (data == "reload") window.location.reload();
                                else if (data == "Invalid Session") {
                                    emsg = "Your session has expired!";
                                    setLoginAgain(true);
                                }
                                else {
                                    try{
                                        let userinfo = await api.loadUserInfo()
                                    
                                        if (userinfo == "fail") emsg = "Failed to Login.";
                                        else
                                        if (userinfo == "Invalid Session") {
                                            emsg = "Your session has expired!";
                                            setLoginAgain(true);
                                        }
                                        else {
                                            window.localStorage['_SR'] = userinfo.rolename;
                                            window.localStorage['_UI'] = JSON.stringify(userinfo);
                                            window.localStorage.navigateScreen = userinfo.page;
                                            // history.replace(`/${data.page}`)
                                            setRedirectTo(`/${userinfo.page}`);
                                        }
                                        setLoginValidation(emsg);
                                        if (emsg != "Loading Profile...") console.log(emsg);
                                    }
                                    catch(err){
                                        setLoginValidation("Failed to Login.");
                                        console.log("Fail to Load UserInfo");    
                                    }
                                }
                                setLoginValidation(emsg);
                                if (emsg != "Loading Profile...") console.log(emsg);
                            }
                            catch(err){
                                console.error(err)
                                let emsg = "Failed to load user profile.";
                                console.log(emsg);
                                setLoginValidation(emsg);
                                // ref.current.complete();
                            }
                        }
                    }
                )()
            }
        } 
        
    }, []);

    return (
        <>
        {redirectTo ? <Redirect to={redirectTo} /> :
        <div className="bg-container">
            <img className="bg-img" src="static/imgs/login-bg.png"/>
            <div className="element-holder">
                <div className="greet-text">
                    <h1>Hello.</h1>
                    <h2>Welcome to Avo Assure!</h2>
                    <h3>Login to Experience Intelligence</h3>
                </div>
                <div className="login-block">
                    <span className="logo-wrap"><img className="logo-img" src="static/imgs/logo.png"/></span>
                    {props.showLoginField
                    ? <props.LoginFields/>
                    : <>
                    <div className="error-msg">{loginValidation}</div>
                    {loginAgain ? <span className="error-msg">Click here to login again.</span> : null}
                    </>}
                </div>
            </div>
            <Footer/>
        </div>}
        </>
    );
}

export default BasePage;