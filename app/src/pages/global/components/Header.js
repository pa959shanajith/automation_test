import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import { RedirectPage } from '../../global';
import "../styles/Header.scss";
import * as loginApi from '../../login/api';
import ClickAwayListener from 'react-click-away-listener';
// import ChangePassword from './ChangePassword';


/*
    Component: Header Bar
    Uses: Provides header functionality to the page
    Props: None
    Todo: Functionality part. ChangePassword import is commented because work in progress.
    Note: LogOut is working fine.

*/

const Header = () => {

    const [userDetails, setUserDetails] = useState(null);
    const [username, setUsername] = useState(null);
    const [userRole, setUserRole] = useState(null);
    // const [task, setTask] = useState(null);
    // const [selectedRoleID, setSelectedRoleID] = useState(null);
    // const [selectedRoleName, setSelectedRoleName] = useState(null);
    // const [redirectPath, setRedirectPath] = useState(null);
	// const [projectId, setProjectId] = useState([]);
	// const [releaseId, setReleaseId] = useState([]);
	// const [cycleId, setCycleId] = useState([]);
    // const [screenId, setScreenId] = useState([]);
    // const [screenName, setScreenName] = useState(null);
    // const [projectDetails, setProjectDetails] = useState(null);
    // const [releaseDetails, setReleaseDetails] = useState(null);
    // const [cycleDetails, setCycleDetails] = useState(null);
    const [passwordValidation, setPasswordValid] = useState("");
    const [showChangePass, setShowChangePass] = useState(false);
    // let unavailableLocalServer_msg = "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server.";
    // const [callRedirect, setCallRedirect] = useState(false);
    const [showUD, setShowUD] = useState(false);
    const [showSR, setShowSR] = useState(false);
    let history = useHistory();

    const userInfo = useSelector(state=>state.login.userinfo);

    useEffect(()=>{
        if(Object.keys(userInfo).length!==0){
            let first_name = userInfo.firstname.charAt(0).toUpperCase() + userInfo.firstname.slice(1);
            let last_name = userInfo.lastname.charAt(0).toUpperCase() + userInfo.lastname.slice(1);
            setUserDetails(userInfo);
            setUserRole(userInfo.rolename);
            if (first_name === last_name) setUsername(first_name);
            else setUsername(first_name + ' ' + last_name);
        }
        else{
            console.log("UserInfo Empty")
        }
    }, [userInfo]);

    const naviPg = () => {
		if (localStorage.getItem("navigateEnable") === "true") {
			window.localStorage['navigateScreen'] = "plugin";
			setTimeout(() => {
                history.replace('/plugin');
		   	}, 100);
        }
        else{
            history.replace('/plugin');
            console.log("navigateEnable was false")
        }
    };
    
    const logout = event => {
        event.preventDefault();
		window.sessionStorage.clear();
		window.sessionStorage["checkLoggedOut"] = true;
        RedirectPage(history);
    };
    
    const getIce = async () => {
		try {
			const res = await fetch("/AvoAssure_ICE");
			const status = await res.text();
			// if (status == "available") location.href = location.origin+"/AvoAssure_ICE?file=getICE"
			// else openModelPopup("switchRoleStatus", "Download Avo Assure ICE", "Package is not available");
		} catch (ex) {
			console.error("Error while downloading ICE package. Error:", ex);
			// openModelPopup("switchRoleStatus", "Download Avo Assure ICE", "Package is not available");
		}
	}

    const switchRole = () => {
		userDetails = JSON.parse(userInfo);
		let roleasarray = userDetails.additionalrole;
		if (roleasarray.length == 0) {
			// $("#switchRoles").hide();
			// alert("switchRoleStatus", "Switch Role", "There are no roles to switch");
		} else {
			loginApi.getRoleNameByRoleId(roleasarray)
			.then(data => {
				if (data == "Invalid Session") {
                    console.log("Invalid Session")
					// return $rootScope.redirectPage();
				} else {
                    console.log("Not Invalid Session")
					// let rolesList = $('#switchRoles');
					// rolesList.empty();
					// let selectedRole = window.localStorage['_SR'];
					// data[userDetails.role] = userDetails.rolename;
					// for (let rid in data) {
					// 	if (data[rid] != selectedRole) {
					// 		rolesList.append($("<li class='switchRole_confirm' data-id=" + rid + " ><a href='#' data-toggle='modal' data-target='#switchRoleModal'>" + data[rid] + "</a></li>"));
					// 	}
					// }
				}
			});
		}
    };
    
    const resetSuccess = () => {
		window.sessionStorage.clear();
		window.sessionStorage["checkLoggedOut"] = true;
        // $rootScope.redirectPage();
        console.log("redirectPage()")
    };
    
    const resetPass = () => {
        // alert("resetPassPopup");
        setShowChangePass(!showChangePass);
    };

    const toggleChangePass = () => setShowChangePass(!showChangePass);

    const onClickAwayUD = () => setShowUD(false);
    const onClickAwaySR = () => setShowSR(false);
    

    const [currpassword, setCurrPassword] = useState("");
    const [newpassword, setNewPassword] = useState("");
    const [confpassword, setConfPassword] = useState("");
    const [currPassError, setCurrPassError] = useState(false);
    const [newPassError, setNewPassError] = useState(false);
    const [confPassError, setConfPassError] = useState(false);
    
    const resetFields = () => {
		setCurrPassword("");
		setNewPassword("");
		setConfPassword("");
		setPasswordValid("");
		// $(".ic-currpassword, .ic-newpassword, .ic-confpassword").parent().removeClass("input-border-error");
	};

    const resetPassword = () => {
        setPasswordValid("");
        setCurrPassError(false);
        setNewPassError(false);
        setConfPassError(false);
		
		let currpassword = currpassword;
		let newpassword = newpassword;
		let confpassword = confpassword;
        
        let regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		if (!currpassword) {
			setCurrPassError(true);
			setPasswordValid("Current Password field is empty.");
		} else if (!newpassword) {
			setNewPassError(true);
			setPasswordValid("New Password field is empty.");
		} else if (!regexPassword.test(newpassword)) {
			setNewPassError(true);
			setPasswordValid("Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");
		} else if (!confpassword) {
			setConfPassError(true);
			setPasswordValid("Confirm Password field is empty.");
		} else if (newpassword != confpassword) {
			setConfPassError(true);
			setPasswordValid("New Password and Confirm Password do not match");
		} else {
			loginApi.resetPassword(newpassword, currpassword)
			.then(data => {
				if(data == "Invalid Session"){
					setPasswordValid("Invalid Session");
				} else if(data == "success") {
					// $("#resetPassPopup").modal("hide");
					alert("resetSuccessPopup");
				} else if(data == "same"){
					setNewPassError(true);
					setConfPassError(true);
					setPasswordValid("Sorry! You can't use the existing password again");
				} else if(data == "incorrect") {
					setCurrPassError(true);
					setPasswordValid("Current Password is incorrect");
				} else if(data == "fail") {
					setPasswordValid("Failed to Change Password");
				} else if(/^2[0-4]{10}$/.test(data)) {
					setPasswordValid("Invalid Request");
				}
            })
            .catch(error => {
				setCurrPassError(true);
				setPasswordValid("Failed to Authenticate Current Password.");
			});
		}
	};

    return(
        <> 
            {/* { callRedirect ? RedirectPage() :  */}
            {/* { showChangePass ? <ChangePassword show={showChangePass} setShow={toggleChangePass} /> : null } */}
            <div className = "main-header">
                <span className="header-logo-span" onClick={ naviPg } disabled={userRole === "Admin"}><img className="header-logo" alt="logo" src="static/imgs/logo.png" onClick={naviPg}/></span>
                    <div className="dropdown user-options">

                        { userRole === "Admin" ? null :
                        <>
                        <div className="btn-container"><button className="fa fa-bell no-border bell-ic"></button></div>
                        <ClickAwayListener onClickAway={onClickAwaySR}>
                            <div className="switch-role-btn no-border" data-toggle="dropdown" onClick={()=>setShowSR(true)} >
                                <span><img className="switch-role-icon" alt="switch-ic" src="static/imgs/ic-switch-user.png"/></span>
                                <span>Switch Roles</span>
                            </div>
                            <div className={showSR ? "switch-role-menu dropdown-menu show" : " switch-role-menu dropdown-menu"}>
                            </div>
                        </ClickAwayListener>
                        </>
                        }

                        <ClickAwayListener onClickAway={onClickAwayUD}>
                        <div className="user-name-btn no-border" data-toggle="dropdown" onClick={()=>setShowUD(true)}>
                            <span className="user-name">{username ? username : "Demo User"}</span>
                            <span><img className = "user-name-icon" alt="user-ic" src="static/imgs/ic-user-nav.png"/></span>
                        </div>
                        <div className={showUD ? "user-name-menu dropdown-menu dropdown-menu-right show" : "dropdown-menu-right user-name-menu dropdown-menu"}>
                            <div><Link className="user-role-item" to="#">{userRole ? userRole : "Test Manager"}</Link></div>
                            <div className="divider" />
                            {
                                userRole === "Admin" ? null :
                                <>
                                <div onClick={getIce} ><Link to="#">Download ICE</Link></div>
                                <div className="divider" />
                                <div onClick={resetPass}><Link to="#">Change Password</Link></div>
                                </>
                            }
                            <div onClick={logout}><Link to="#">Logout</Link></div>
                        </div>
                        </ClickAwayListener>
                    </div>
                </div>
            {/* } */}
        </>
    ); 
}

export default Header;