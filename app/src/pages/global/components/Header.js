import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, Link, Redirect } from 'react-router-dom';
import { RedirectPage, PopupMsg, ModalContainer, ScreenOverlay } from '../../global';
import "../styles/Header.scss";
import { loadUserInfo } from '../../login/api';
import { getRoleNameByRoleId } from '../api';
import * as actionTypes from '../../login/state/action';
import ClickAwayListener from 'react-click-away-listener';
import ChangePassword from './ChangePassword';
import ChangeDefaultIce from './ChangeDefaultIce';
import { persistor } from '../../../reducer'


/*
    Component: Header Bar
    Uses: Provides header functionality to the page
    Props: None

*/

const Header = () => {

    const history = useHistory();
    const dispatch = useDispatch();

    const [userDetails, setUserDetails] = useState(null);
    const [username, setUsername] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [showChangePass, setShowChangePass] = useState(false);
    const [showChangeDefaultIce, setShowChangeDefaultIce] = useState(false);
    const [showSuccessPass, setSuccessPass] = useState(false);
    const [showUD, setShowUD] = useState(false);
    const [showSR, setShowSR] = useState(false);
    const [roleList, setRoleList] = useState([]);
    const [adminDisable, setAdminDisable] = useState(false);
    const [showConfSR, setShowConfSR] = useState(false);
    const [showSR_Pop, setShowSR_Pop] = useState("");
    const [clickedRole, setClickedRole] = useState(null);
    const [showOverlay, setShowOverlay] = useState("");
    const [redirectTo, setRedirectTo] = useState("");

    const userInfo = useSelector(state=>state.login.userinfo);
    const selectedRole = useSelector(state=>state.login.SR);

    useEffect(()=>{
        if(Object.keys(userInfo).length!==0){
            setUserDetails(userInfo);
            setUserRole(selectedRole);
            if (userInfo.rolename === "Admin") setAdminDisable(true); 
            if (userInfo.firstname === userInfo.lastname) setUsername(userInfo.firstname);
            else setUsername(userInfo.firstname + ' ' + userInfo.lastname);
            
            if(window.localStorage['_SRS']==="success"){
                delete window.localStorage['_SRS']; 
                setShowSR_Pop({'title': 'Switch Role', 'content': `Your role is changed to ${selectedRole}`});
            }
        }
    }, [userInfo, selectedRole]);

    const naviPg = () => {
        
		// if (localStorage.getItem("navigateEnable") === "true") {
			window.localStorage['navigateScreen'] = "plugin";
            history.replace('/plugin');
        // }
    };
    
    const logout = event => {
        event.preventDefault();
        persistor.purge();
		window.sessionStorage.clear();
		window.sessionStorage["checkLoggedOut"] = true;
        RedirectPage(history);
    };
    
    const getIce = async () => {
		try {
			const res = await fetch("/AvoAssure_ICE");
			const status = await res.text();
			if (status === "available") window.location.href = window.location.origin+"/AvoAssure_ICE?file=getICE"
			else setShowSR_Pop({'title': 'Download Avo Assure ICE', 'content': 'Package is not available'})
		} catch (ex) {
			console.error("Error while downloading ICE package. Error:", ex);
			setShowSR_Pop({'title': 'Download Avo Assure ICE', 'content': 'Package is not available'})
		}
	}

    const switchRole = () => {
		let roleasarray = userInfo.additionalrole;
		if (roleasarray.length === 0) {
			setShowSR(false);
			setShowSR_Pop({'title': 'Switch Role', 'content': "There are no roles to switch"});
		} else {
			getRoleNameByRoleId(roleasarray)
			.then(data => {
				if (data === "Invalid Session") {
                    RedirectPage(history);
				} else {
                    setRoleList([]);
                    data[userDetails.role] = userDetails.rolename;
                    let tempList = [];
					for (let rid in data) {
						if (data[rid] !== selectedRole) tempList.push({'rid': rid, 'data': data[rid]})
                    }
                    setRoleList(tempList);
                    setShowSR(true);
				}
            })
            .catch(error=>{
                setShowSR(false);
                console.error("Failed to Fetch Role Names. ERROR::", error)
                setShowSR_Pop({'title': 'Switch Role', 'content': "Failed to Fetch Role Names"});
            });
		}
    };
    
    const resetPass = () => {
        setShowUD(false);
        setShowChangePass(!showChangePass);
    };

    const chngDftIce = () => {
        setShowUD(false);
        setShowChangeDefaultIce(true);
    };

    const resetSuccess = () => {
        setSuccessPass(false);
		window.sessionStorage.clear();
		window.sessionStorage["checkLoggedOut"] = true;
        RedirectPage(history);
    };

    const toggleChangePass = () => setShowChangePass(!showChangePass);
    const onClickAwayUD = () => setShowUD(false);
    const onClickAwaySR = () => setShowSR(false);


    const switchedRole = event => {
        setShowConfSR(false);
        setShowOverlay(`Switching to ${clickedRole.data}`)
		loadUserInfo(clickedRole.rid)
		.then(data => {
            setShowOverlay("");
			if (data !== "fail") {
                dispatch({type: actionTypes.SET_SR, payload: clickedRole.data});
				dispatch({type: actionTypes.SET_USERINFO, payload: data});
				window.localStorage['_SRS'] = "success";
				if (clickedRole.data === "Admin") {
					window.localStorage['navigateScreen'] = "admin";
                    setRedirectTo('/admin');
                } else {
					window.localStorage['navigateScreen'] = "plugin";
                    setRedirectTo("/plugin");
                }
			} else {
                console.error("Fail to Switch User");
                setShowSR_Pop({'title': 'Switch Role', 'content': "Fail to Switch User"});
			}
        })
        .catch(error=> {
            setShowOverlay("");
            console.error("Fail to Switch User. ERROR::", error);
            setShowSR_Pop({'title': 'Switch Role', 'content': "Fail to Switch User"});
		});
	};

    const PasswordSuccessPopup = () => (
        <PopupMsg 
            title={"Change Password"}
            close={()=>setSuccessPass(false)}
            content={"Password change successfull! Please login again with new password"}
            submitText={"OK"}
            submit={resetSuccess}
        />
    );

    const SRPopup = () => (
        <PopupMsg 
            title={showSR_Pop.title}
            content={showSR_Pop.content}
            submitText="OK"
            close={()=>setShowSR_Pop("")}
            submit={()=>setShowSR_Pop("")}
        />
    );

    const showConfPop = (rid, data) =>{
        setShowSR(false);
        setClickedRole({'rid':rid, 'data':data});
        setShowConfSR(true);
    }

    const ConfSwitchRole = () => (
       <ModalContainer 
            title="Switch Role"
            content={`Are you sure you want to switch role to: ${clickedRole.data}`}
            close={()=>setShowConfSR(false)}
            footer={
                <>
                <button className="confirm_sr_yes" onClick={switchedRole}>Yes</button>
                <button className="confirm_sr_no" onClick={()=>setShowConfSR(false)}>No</button>
                </>
            }
        />
    );

    return(
        <> 
            { redirectTo && <Redirect to={redirectTo} /> }
            { showChangePass && <ChangePassword setShow={toggleChangePass} setSuccessPass={setSuccessPass} /> }
            { showChangeDefaultIce && <ChangeDefaultIce /> }
            { showSuccessPass && <PasswordSuccessPopup /> }
            { showConfSR && <ConfSwitchRole />  }
            { showSR_Pop && <SRPopup /> }
            { showOverlay && <ScreenOverlay content={showOverlay} /> }

            <div className = "main-header">
                <span className="header-logo-span"><img className={"header-logo " + (adminDisable && "logo-disable")} alt="logo" src="static/imgs/logo.png" onClick={ !adminDisable ? naviPg : null } /></span>
                    <div className="dropdown user-options">
                        { !adminDisable &&
                        <>
                        <div className="btn-container"><button className="fa fa-bell no-border bell-ic"></button></div>
                        <ClickAwayListener onClickAway={onClickAwaySR}>
                            <div className="switch-role-btn no-border" data-toggle="dropdown" onClick={switchRole} >
                                <span><img className="switch-role-icon" alt="switch-ic" src="static/imgs/ic-switch-user.png"/></span>
                                <span>Switch Role</span>
                            </div>
                            <div className={ "switch-role-menu dropdown-menu " + (showSR && "show")}>
                                {roleList.map(role => 
                                    <div key={role.rid} data-id={role.rid} onClick={()=>showConfPop(role.rid, role.data)} >
                                        <Link to="#">{role.data}</Link>
                                    </div>    
                                )}
                            </div>
                        </ClickAwayListener>
                        </>
                        }

                        <ClickAwayListener onClickAway={onClickAwayUD}>
                        <div className="user-name-btn no-border" data-toggle="dropdown" onClick={()=>setShowUD(true)}>
                            <span className="user-name">{username || "Demo User"}</span>
                            <span><img className = "user-name-icon" alt="user-ic" src="static/imgs/ic-user-nav.png"/></span>
                        </div>
                        <div className={"user-name-menu dropdown-menu dropdown-menu-right " + (showUD && "show")}>
                            <div><Link className="user-role-item" to="#">{userRole || "Test Manager"}</Link></div>
                            <div className="divider" />
                            {
                                !adminDisable &&
                                <>
                                <div onClick={getIce} ><Link to="#">Download ICE</Link></div>
                                <div onClick={chngDftIce} ><Link to="#">Change Default ICE</Link></div>
                                <div onClick={resetPass}><Link to="#">Change Password</Link></div>
                                </>
                            }
                            <div onClick={logout}><Link to="#">Logout</Link></div>
                        </div>
                        </ClickAwayListener>
                    </div>
                </div>
        </>
    ); 
}

export default Header;