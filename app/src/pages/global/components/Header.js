import React, { useState, useEffect } from 'react';
import {Dropdown} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RedirectPage } from '../../global';
import "../styles/Header.scss";
import 'font-awesome/css/font-awesome.min.css';
import * as loginApi from '../../login/api';
import ChangePassword from './ChangePassword';

const Header = (props) => {

    const [userDetails, setUserDetails] = useState(null);
    const [username, setUsername] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [task, setTask] = useState(null);
    const [selectedRoleID, setSelectedRoleID] = useState(null);
    const [selectedRoleName, setSelectedRoleName] = useState(null);
    const [redirectPath, setRedirectPath] = useState(null);
	const [projectId, setProjectId] = useState([]);
	const [releaseId, setReleaseId] = useState([]);
	const [cycleId, setCycleId] = useState([]);
    const [screenId, setScreenId] = useState([]);
    const [screenName, setScreenName] = useState(null);
    const [projectDetails, setProjectDetails] = useState(null);
    const [releaseDetails, setReleaseDetails] = useState(null);
    const [cycleDetails, setCycleDetails] = useState(null);
    const [passwordValidation, setPasswordValid] = useState("");
    const [showChangePass, setShowChangePass] = useState(false);
    let unavailableLocalServer_msg = "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server.";
    const [userInfo, setUserInfo] = useState(useSelector(state=>state.login.userinfo));
    const [callRedirect, setCallRedirect] = useState(false);
    let history = useHistory();

    // setUserDetails(JSON.parse(userInfo))
    // setUserRole(userInfo.rolename);
    // setUsername(userDetails.username.toLowerCase());

    useEffect(()=>{
        
        // console.log("USERINFO I AM GETTING: ", userInfo)
        // let userDetailsVar;
        // if(userInfo){
        //     userDetailsVar = JSON.parse(userInfo);
        // }
        // let userRoleVar = userInfo.rolename;
        // let usernameVar = userDetailsVar.username.toLowerCase();
        // setUserDetails(userDetailsVar)
        // setUserRole(userRoleVar);
        // setUsername(usernameVar);
    }, []);

    const naviPg = () => {
		if (localStorage.getItem("navigateEnable") == "true") {
			window.localStorage['navigateScreen'] = "plugin";
			//Transaction Activity for Avo Assure Logo Action
			// var labelArr = [];
			// var infoArr = [];
			// labelArr.push(txnHistory.codesDict['AvoAssureLogo']);
			// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
			setTimeout(() => {
                history.replace('/plugin');
                console.log("Go to /plugin")
		   	}, 100);
		}
    };
    
    const logout = event => {
        event.preventDefault();
		//Transaction Activity for Logout Button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['Logout']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
		window.sessionStorage.clear();
		window.sessionStorage["checkLoggedOut"] = true;
        // $rootScope.redirectPage();
        console.log("redirectPage")
        RedirectPage(history);
        // setCallRedirect(true);
        // props.callRedirectPage(true);
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
            { showChangePass ? <ChangePassword show={showChangePass} setShow={toggleChangePass} /> : null }
            <div className = "main-header">
                <span className="header-logo-span"><img className="header-logo" alt="logo" src="static/imgs/logo.png" onClick={naviPg}/></span>
                <div className="btn-container"><button className="fa fa-bell no-border"></button></div>
                { userRole == "Admin" ? null :
                <div className="btn-container" onClick={switchRole}>
                    <Dropdown>
                        <Dropdown.Toggle className="switch-role-btn no-border">
                            <span><img className="switch-role-icon" alt="switch-ic" src="static/imgs/ic-switch-user.png"/></span>
                            <span>Switch Roles</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="switch-role-menu">
                            <Dropdown.Item>Item</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>}
                <div className="btn-container">
                    <Dropdown>
                        <Dropdown.Toggle className="user-name-btn no-border">
                            <span className="user-name">{username ? username : "Demo User"}</span>
                            <span><img className = "user-name-icon" alt="user-ic" src="static/imgs/ic-user-nav.png"/></span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="user-name-menu">
                            <Dropdown.Item className="user-role-item">{userRole ? userRole : "Test Manager"}</Dropdown.Item>
                            <Dropdown.Divider className="dropdown-divider" />
                            <Dropdown.Item onClick={getIce} >Download ICE</Dropdown.Item>
                            <Dropdown.Divider className="dropdown-divider" />
                            <Dropdown.Item onClick={resetPass}>Change Password</Dropdown.Item>
                            <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            {/* } */}
        </>
    );
}

export default Header;