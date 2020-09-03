import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as actionTypes from '../state/action';
import { SetProgressBar } from '../../global';
import StaticElements from '../components/StaticElements';
import * as api from '../api';
import "../styles/BasePage.scss";

/*
    Component: BasePage
    Props: None
    Uses: Renders the base page for avo assure
    Todo: None
*/

const BasePage = () => {

    const [loginValidation, setLoginValidation] = useState("Loading Profile...");
    const [loginAgain, setLoginAgain] = useState(true);
    const [redirectTo , setRedirectTo] = useState(null);
    const dispatch = useDispatch();

    useEffect(()=>{
        (async()=>{
            const checkLogout = JSON.parse(window.sessionStorage.getItem('checkLoggedOut'));
            window.localStorage.clear();
            window.sessionStorage.clear();
            if (checkLogout) {
                if ((typeof(checkLogout) == "object") && (checkLogout.length == 2)) {
                    setLoginValidation("Your session has been terminated by "+checkLogout[0]);
                    if (checkLogout[1] == "dereg") setLoginValidation("Reason: User is deleted from Avo Assure");
                } 
                else setLoginValidation("You Have Successfully Logged Out!");
                SetProgressBar("stop", dispatch);
            }
            else {
                setLoginAgain(false);
                try{
                    let data = await api.checkUserState()
                    SetProgressBar("stop", dispatch);
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
                    else if (data == "redirect") setRedirectTo('/login');
                    else if (data == "Invalid Session") {
                        emsg = "Your session has expired!";
                        setLoginAgain(true);
                    } else {
                        try{
                            let userinfo = await api.loadUserInfo()
                            if (userinfo == "fail") setLoginValidation("Failed to Login.");
                            else if (userinfo == "Invalid Session") {
                                setLoginValidation("Your session has expired!");
                                setLoginAgain(true);
                            } else {
                                window.localStorage.navigateScreen = userinfo.page;
                                dispatch({type:actionTypes.SET_USERINFO, payload: JSON.stringify(userinfo)});
                                SetProgressBar("start", dispatch);
                                setRedirectTo(`/${userinfo.page}`);
                            }
                        }
                        catch(err){
                            setLoginValidation("Failed to Login.");
                            console.error("Fail to Load UserInfo. Error::", err);    
                        }
                    }
                    setLoginValidation(emsg);     
                }
                catch(err){
                    const emsg = "Failed to load user profile. Error::";
                    console.error(emsg, err);
                    setLoginValidation(emsg);
                    SetProgressBar("stop", dispatch);
                }
            }
        })()
    }, []);

    return (
        <>
        {redirectTo ? <Redirect to={redirectTo} /> :
        < StaticElements> 
            <div className="error-msg">{loginValidation}</div>
            {loginAgain ? <span className="error-msg">Click <Link to="/login">here</Link> to login again.</span> : null}
        </ StaticElements>
        }
        </>
    );
}

export default BasePage;