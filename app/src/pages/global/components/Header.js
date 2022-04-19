import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, Link, Redirect } from 'react-router-dom';
import { loadUserInfo } from '../../login/api';
import { getRoleNameByRoleId } from '../api';
import * as actionTypes from '../../login/state/action';
import { SWITCHED } from '../state/action';
import ClickAwayListener from 'react-click-away-listener';
import { persistor } from '../../../reducer';
import NotifyDropDown from './NotifyDropDown';
import { RedirectPage, ModalContainer, ScreenOverlay, Messages as MSG, setMsg } from '../../global';
import "../styles/Header.scss";

/*
    Component: Header Bar
    Uses: Provides header functionality to the page
    Props: None

*/

const Header = () => {

    const history = useHistory();
    const dispatch = useDispatch();
    const [username, setUsername] = useState(null);
    const [showUD, setShowUD] = useState(false);
    const [showSR, setShowSR] = useState(false);
    const [roleList, setRoleList] = useState([]);
    const [adminDisable, setAdminDisable] = useState(false);
    const [showConfSR, setShowConfSR] = useState(false);
    const [clickedRole, setClickedRole] = useState(null);
    const [showOverlay, setShowOverlay] = useState("");
    const [redirectTo, setRedirectTo] = useState("");
    const [clickNotify,setClickNotify] = useState(false)
    const userInfo = useSelector(state=>state.login.userinfo);
    const selectedRole = useSelector(state=>state.login.SR);
    const notifyCnt = useSelector(state=>state.login.notify.unread)

    useEffect(()=>{
        //on Click back button on browser
        window.addEventListener('popstate', (e)=> {
            logout(e)
        })
    },[])
    useEffect(()=>{
        if(Object.keys(userInfo).length!==0){
            if ([userInfo.rolename, selectedRole].includes("Admin")) setAdminDisable(true); 
            if (userInfo.firstname === userInfo.lastname) setUsername(userInfo.firstname);
            else setUsername(userInfo.firstname + ' ' + userInfo.lastname);
        }
    }, [userInfo, selectedRole]);

    const naviPg = () => {
        window.localStorage['navigateScreen'] = "plugin";
        history.replace('/plugin');
    };
    
    const logout = event => {
        event.preventDefault();
        persistor.purge();
        RedirectPage(history, { reason: "logout" });
    };
    
    const getIce = async () => {
		try {
            setShowUD(false);
            setShowOverlay(`Loading...`)
			const res = await fetch("/AvoAssure_ICE.zip");
			const status = await res.text();
			if (status === "available") window.location.href = window.location.origin+"/AvoAssure_ICE.zip?file=getICE"
			else setMsg(MSG.GLOBAL.ERR_PACKAGE);
            setShowOverlay(false)
		} catch (ex) {
			console.error("Error while downloading ICE package. Error:", ex);
			setMsg(MSG.GLOBAL.ERR_PACKAGE);
		}
	}

    const switchRole = () => {
		let roleasarray = userInfo.additionalrole;
		if (roleasarray.length === 0) {
			setShowSR(false);
			setMsg(MSG.GLOBAL.ERR_NOROLES_SWITCH);
		} else {
			getRoleNameByRoleId(roleasarray)
			.then(data => {
				if (data === "Invalid Session") {
                    RedirectPage(history);
				} else {
                    setRoleList([]);
                    data[userInfo.role] = userInfo.rolename;
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
                setMsg(MSG.GLOBAL.ERR_ROLENAMES);
            });
		}
    };

    const chngUsrConf = () => {
        setShowUD(false);
        window.localStorage['navigateScreen'] = 'settings'
        setRedirectTo('/settings');
    }
    
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
                dispatch({type: SWITCHED, payload: true});
				if (clickedRole.data === "Admin") {
					window.localStorage['navigateScreen'] = "admin";
                    setRedirectTo('/admin');
                } else {
					window.localStorage['navigateScreen'] = "plugin";
                    setRedirectTo("/plugin");
                }
			} else {
                console.error("Fail to Switch User");
                setMsg(MSG.GLOBAL.ERR_SWITCH_USER);
			}
        })
        .catch(error=> {
            setShowOverlay("");
            console.error("Fail to Switch User. ERROR::", error);
            setMsg(MSG.GLOBAL.ERR_SWITCH_USER);
		});
	};

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
            { showConfSR && <ConfSwitchRole />  }
            { showOverlay && <ScreenOverlay content={showOverlay} /> }
            <div className = "main-header">
                <span className="header-logo-span"><img className={"header-logo "} alt="logo" src="static/imgs/logo.png" onClick={ !adminDisable ? naviPg : null } /></span>
                    <div className="dropdown user-options">
                        { 
                        <>
                        { !adminDisable &&
                            <div className="btn-container">
                                <ClickAwayListener onClickAway={()=>setClickNotify(false)}>
                                    <button onClick={(e)=>setClickNotify(true)} className="fa fa-bell no-border bell-ic notify-btn">
                                        {(notifyCnt !== 0) && <span className='notify-cnt'>{notifyCnt}</span>}
                                    </button>
                                    <NotifyDropDown show={clickNotify}/>
                                </ClickAwayListener>
                            </div>
                        }
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
                            <div><Link className="user-role-item" to="#">{selectedRole || "Test Manager"}</Link></div>
                            <div className="divider" />
                            {
                                selectedRole !=='Admin' &&
                                <>
                                <div onClick={getIce} ><Link to="#">Download ICE</Link></div>
                                { window.localStorage['navigateScreen'] !== 'settings' && <div onClick={chngUsrConf} ><Link to="#">Settings</Link></div>}
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