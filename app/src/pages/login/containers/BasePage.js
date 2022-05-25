import React, { useState, useEffect } from 'react';
import { Redirect, Link, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as actionTypes from '../state/action';
import { SetProgressBar, BrowserFp, RedirectPage, ChangePassword, setMsg } from '../../global';
import StaticElements from '../components/StaticElements';
import TermsAndConditions from '../components/TermsAndConditions';
import * as api from '../api';
import { updatePassword } from "../../global/api";
import "../styles/BasePage.scss";
import { persistor } from '../../../reducer';

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
    const [showTCPopup, setShowTCPopup] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [showChangePass, setShowChangePass] = useState(false);
    const [showSuccessPass, setSuccessPass] = useState(false);
    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(()=>{
        (async()=>{
            const checkLogout = JSON.parse(window.sessionStorage.getItem('logoutFlag'));
            window.localStorage.clear();
            window.sessionStorage.clear();

            let reason = "";
            let showLoginAgain = false;

            if (checkLogout) {
                switch(checkLogout.reason) {
                    case "dereg": reason = `Your session has been terminated by ${checkLogout.by}. Reason: User is deleted from Avo Assure`; break;
                    case "session": reason = `Your session has been terminated by ${checkLogout.by}`; showLoginAgain = true; break;
                    case "logout":  reason = "You Have Successfully Logged Out!"; showLoginAgain = true; break;
                    case "invalidSession": reason = "Your session has expired!"; showLoginAgain = true; break;
                    case "screenMismatch": reason = "You have been logged out due to URL manipulation"; showLoginAgain = true; break;
                    default: break;
                }
            } 
            
            if (reason) {    
                setLoginValidation(reason);
                SetProgressBar("stop");
                setLoginAgain(showLoginAgain);
            } 
            else {
                setLoginAgain(false);
                try{
                    let data = await api.validateUserState()
                    SetProgressBar("stop");
                    setLoginValidation("Loading Profile...");
                    if (data === "fail") setLoginValidation("Failed to load user profile.");
                    else if (data === "unauthorized") setLoginValidation("User is not authorized to use Avo Assure.");
                    else if (data === "badrequest") setLoginValidation("User does not have sufficient permission to view this page.");
                    else if (data === "nouser") setLoginValidation("User profile not found in Avo Assure.");
                    else if (data === "nouserprofile") setLoginValidation("User profile not found in Authorization Server.");
                    else if (data === "userLogged") setLoginValidation("User is already logged in! Please logout from the previous session.");
                    else if (data === "inValidCredential" || data === "invalid_username_password") setLoginValidation("The username or password you entered isn't correct. Please try again.");
                    else if (data === "noProjectsAssigned") setLoginValidation("To Login, user must be allocated to a Domain and Project. Please contact Admin.");
                    else if (data === "reload") window.location.reload();
                    else if (data === "redirect") setRedirectTo('/login');
                    else if (data === "Invalid Session") {
                        setLoginValidation("Your session has expired!");
                        setLoginAgain(true);
                    } else {
                        try{
                            let userinfo = await api.loadUserInfo()
                            if (userinfo === "fail") setLoginValidation("Failed to Login.");
                            else if (userinfo === "Invalid Session") {
                                setLoginValidation("Your session has expired!");
                                setLoginAgain(true);
                            } else {
                                // if (userinfo.tandc) {
                                //     setUserProfile(userinfo);
                                //     setShowTCPopup(true);
                                // }
                                // else 
                                if(userinfo.firstTimeLogin && userinfo.dbuser) {
                                    setUserProfile(userinfo);
                                    setShowChangePass(true);
                                }
                                else
                                    loadProfile(userinfo)
                            }
                        }
                        catch(err){
                            setLoginValidation("Failed to Login.");
                            console.error("Fail to Load UserInfo. Error::", err);    
                        }
                    }    
                }
                catch(err){
                    const emsg = "Failed to load user profile. Error::";
                    console.error(emsg, err);
                    setLoginValidation(emsg);
                    SetProgressBar("stop");
                }
            }
        })()
        //eslint-disable-next-line
    }, []);

    useEffect(()=>{
        if(showChangePass){
            window.addEventListener('beforeunload',warnBeforeUnload);
            window.addEventListener('unload',logout);
        }
        return ()=>{
            window.removeEventListener('beforeunload', warnBeforeUnload);
            window.removeEventListener('unload',logout)
        }
    },[showChangePass])

    const warnBeforeUnload = (e) => {
        if(showChangePass){
            e.returnValue = `Are you sure you want to leave?`;
        }
    }

    const logout = (e) => {
        if(showChangePass){
            persistor.purge();
            RedirectPage(history, { reason: "logout" });
        }
    };

    const loadProfile = userinfo => {
        window.localStorage.navigateScreen = userinfo.page;
        dispatch({type:actionTypes.SET_DATEFORMAT, payload: userinfo.dateformat})
        dispatch({type:actionTypes.SET_SR, payload: userinfo.rolename});
        dispatch({type:actionTypes.SET_USERINFO, payload: userinfo});
        SetProgressBar("start");
        setRedirectTo(`/${userinfo.page}`);
    }

    const tcAction = action => {
        let fullName = userProfile["firstname"] + " " + userProfile["lastname"];
		let email = userProfile["email_id"];
		let timeStamp = new Date().toLocaleString();
		let bfp = BrowserFp()
		let userData = {
			'fullname': fullName,
			'emailaddress': email,
			'acceptance': action,
			'timestamp': timeStamp,
			'browserfp': bfp
        };
        api.storeUserDetails(userData)
		.then(data => {
			if(data === "Invalid Session") {
                setShowTCPopup(false);
                RedirectPage(history);
			} else if (data !== "success") {
                setLoginValidation("Failed to record user preference. Please Try again!");
                setShowTCPopup(false);
                RedirectPage(history, { reason: "userPrefHandle" });
            }
            else {
				if (action === "Accept") loadProfile(userProfile);
				else {
                    setLoginValidation("Please accept our terms and conditions to continue to use Avo Assure!");
                    setShowTCPopup(false);
                    RedirectPage(history, { reason: "userPrefHandle" });
                }
			}
        })
        .catch(error => {
			setLoginValidation("Failed to record user preference. Please Try again!");
			setLoginAgain(false);
            setShowTCPopup(false);
			console.error("Error updating user tnc preference", error);
        });
        
    }

    const toggleChangePass = () => setShowChangePass(!showChangePass);
    
    const PasswordSuccessPopup = () => (
        <>{setMsg({"CONTENT":"Password changed successfully !", "VARIANT":"success"}) && setSuccessPass(false)}</>
    );

    const updatePass = (newpassword) => {
        updatePassword(newpassword, userProfile).then((res)=>{
            if(res==="success"){
                toggleChangePass();
                setSuccessPass(true);
                loadProfile(userProfile);
            }
        }).catch((err)=>{
            console.log(err)
        })
    }
    
    return (
        <>
        { showChangePass && <ChangePassword setShow={toggleChangePass} setSuccessPass={setSuccessPass} loginCurrPassword={null} changeType={"CreateNewPass"} updatePass={updatePass} /> }
        { showSuccessPass && <PasswordSuccessPopup /> }
        {redirectTo ? <Redirect to={redirectTo} /> :
        <>
        { showTCPopup && <TermsAndConditions tcAction={tcAction}/> }
        < StaticElements> 
            <div className="error-msg">{loginValidation}</div>
            {loginAgain && <span className="error-msg">Click <Link to="/login" className="base__redirect">here</Link> to login again.</span>}
        </ StaticElements>
        </>
        }
        </>
    );
}

export default BasePage;