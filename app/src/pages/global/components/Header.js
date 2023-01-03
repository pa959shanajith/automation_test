import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, Link, Redirect } from 'react-router-dom';
import { loadUserInfo } from '../../login/api';
import { getRoleNameByRoleId } from '../api';
import * as actionTypes from '../../login/state/action';
import { SWITCHED } from '../state/action';
import ClickAwayListener from 'react-click-away-listener';
import { persistor } from '../../../reducer';
import NotifyDropDown from './NotifyDropDown';
import { RedirectPage, ModalContainer, ScreenOverlay, WelcomePopover, Messages as MSG, setMsg } from '../../global';
import ServiceBell from "@servicebell/widget";
import "../styles/Header.scss";

/*
    Component: Header Bar
    Uses: Provides header functionality to the page
    Props: None

*/

const Header = ({show_WP_POPOVER=false,geniusPopup, ...otherProps}) => {

    const history = useHistory();
    const dispatch = useDispatch();
    const [username, setUsername] = useState(null);
    const [showUD, setShowUD] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
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
    const notifyCnt = useSelector(state=>state.login.notify.unread);
    const [showICEMenu, setShowICEMenu] = useState(false);
    const [config, setConfig] = useState({});
    const [OS,setOS] = useState("Windows");
    const [WP_STEPNO, set_WP_STEPNO] = useState(0);
    const [trainLinks, setTrainLinks] = useState({videos:"#", docs:"#"});

    useEffect(()=>{
        //on Click back button on browser
       
        (async()=>{
            const response = await fetch("/getServiceBell")
            let { enableServiceBell } = await response.json();
           const key = await fetch("/getServiceBellSecretKey")
           let { SERVICEBELL_IDENTITY_SECRET_KEY } = await key.json();
           const data = { id: userInfo.email_id,
            email:userInfo.email_id
           };
          if(enableServiceBell){
            ServiceBell("identify",
            userInfo.email_id,
            { 
            displayName: userInfo.firstname + ' ' + userInfo.lastname,
            email: userInfo.email_id
            },
            crypto
          .createHmac('sha256', SERVICEBELL_IDENTITY_SECRET_KEY)
          .update(JSON.stringify(data))
          .digest('hex'),
        );
        }})();
        window.addEventListener('popstate', (e)=> {
            logout(e)
        })
        getOS();
       
        (async()=>{
            const response = await fetch("/getClientConfig")
            let {avoClientConfig,trainingLinks} = await response.json();
            setConfig(avoClientConfig);
            setTrainLinks({videos:trainingLinks.videos, docs:trainingLinks.documentation});
        })();
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

  // getting OS version using userAgent
  const getOS = () => {
    let userAgent = navigator.userAgent.toLowerCase();
    if (/windows nt/.test(userAgent))
        setOS("Windows");

    else if (/mac os x/.test(userAgent))
        setOS("MacOS");

    else if (/linux x86_64/.test(userAgent))
        setOS("Linux")
    else
        setOS("Not Supported");
  }
    
    const getIce = async (clientVer) => {
		try {
      setShowUD(false);
      setShowOverlay(`Loading...`);
			const res = await fetch("/downloadICE?ver="+clientVer);
      const {status} = await res.json();
      // if (status === "available") window.location.href = "https://localhost:8443/downloadICE?ver="+queryICE+"&file=getICE"
			if (status === "available"){
        // const link = document.createElement('a');
        // link.href = "/downloadURL?link="+window.location.origin.split("//")[1];
        // link.setAttribute('download', "avoURL.txt");
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
        window.location.href = window.location.origin+"/downloadICE?ver="+clientVer+"&file=getICE"+(userInfo.isTrial?("&fileName=_"+window.location.origin.split("//")[1].split(".avoassure")[0]):"");
      } 
			else setMsg(MSG.GLOBAL.ERR_PACKAGE);
      setShowOverlay(false)
		} catch (ex) {
			console.error("Error while downloading ICE package. Error:", ex);
			setMsg(MSG.GLOBAL.ERR_PACKAGE);
		}
	}

    const switchRole = () => {
    if(userInfo.isTrial) return;
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
    const onClickAwayHelp = () => setShowHelp(false);

    const switchedRole = event => {
        setShowConfSR(false);
        setShowOverlay(`Switching to ${clickedRole.data}`)
		loadUserInfo(clickedRole.rid)
		.then(data => {
            setShowOverlay("");
			if (data !== "fail" && data !== "Licence Expired") {
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

    const handleWPEvents = (skip = false) => {
        if (typeof skip === 'number') {
            set_WP_STEPNO(skip);
            return
        }
        if(WP_STEPNO===1 || skip===true) {
            otherProps.setPopover(false);
            return
        }
        set_WP_STEPNO((prevno)=>prevno + 1)
    }

    const WP_ITEM_LIST =  useMemo(()=>[
        {imageName:"wp_video_image.svg",content:<>Make your journey smoother with <b>Training videos.</b>  <br/>  <a href={trainLinks.videos} target="_blank" referrerPolicy="no-referrer">Click here</a> to watch training videos or choose <br/> "Training Videos" from "Need Help" button.</>},
        {imageName:"wp_docs_image.svg",content:<>Make your journey smoother with <b>Training document.</b>  <br/>  <a href={trainLinks.docs} target="_blank" referrerPolicy="no-referrer">Click here</a> to watch training document or choose <br/> "Training Document" from "Need Help" button.</>}
    ],[trainLinks]);

    return(
        <> 
            { redirectTo && <Redirect to={redirectTo} /> }
            { showConfSR && <ConfSwitchRole />  }
            { showOverlay && <ScreenOverlay content={showOverlay} /> }
            { show_WP_POPOVER && <div className="tranparentBlocker"></div>}
            <div className = "main-header">
                <span className="header-logo-span"><img className={"header-logo " + (adminDisable && "logo-disable")} alt="logo" src="static/imgs/AssureLogo_horizonal.svg" onClick={ !adminDisable ? naviPg : null } /></span>
                    <ClickAwayListener onClickAway={onClickAwayHelp} style={{zIndex:10, background:show_WP_POPOVER?"white":"transparent", borderRadius:5, position:"relative"}}>
                        <div className="user-name-btn no-border" data-toggle="dropdown" onClick={()=>setShowHelp(!showHelp)} style={{padding:5}}>
                            {geniusPopup?null:<span className="help">Need Help ?</span>}
                        </div>
                        <div className={"help-menu dropdown-menu " + (showHelp && "show")}>
                            <div onClick={()=>{window.open(trainLinks.videos,'_blank')
                                setShowHelp(false)}} ><Link to="#">Training Videos</Link></div>
                            <div onClick={()=>{window.open(trainLinks.docs,'_blank')
                                setShowHelp(false)}} ><Link to="#">Training Document</Link></div>   
                        </div>
                        {show_WP_POPOVER ? 
                            <WelcomePopover 
                                title={`Welcome ${userInfo.firstname} !!`} 
                                handleWPEvents={handleWPEvents}
                                WP_STEPNO={WP_STEPNO}
                                items={WP_ITEM_LIST}
                            ></WelcomePopover>
                        :null}
                    </ClickAwayListener>
                    <div className="dropdown user-options">
                        { 
                        <>
                        { !adminDisable &&
                        <>
                        <div className="btn-container">
                            <ClickAwayListener onClickAway={()=>setClickNotify(false)}>
                                <button title={userInfo.isTrial?"Notifications is available as part of premium":"Notifications"} onClick={(e)=>{if(!userInfo.isTrial) setClickNotify(true)}} className={"fa fa-bell no-border bell-ic notify-btn " + (userInfo.isTrial?"fa-disabled":"")}>
                                    {(notifyCnt !== 0) && <span className='notify-cnt'>{notifyCnt}</span>}
                                </button>
                                <NotifyDropDown show={clickNotify}/>
                            </ClickAwayListener>
                        </div>
                        <ClickAwayListener onClickAway={onClickAwaySR}>
                            <div title={userInfo.isTrial?"Admin role is available as part of premium":"Switch Role"} className={"switch-role-btn no-border "+ (userInfo.isTrial?"logo-grey":"")} data-toggle="dropdown" onClick={switchRole}  >
                                {/* <span><img className="switch-role-icon" alt="switch-ic" src={"static/imgs/ic-switch-user"+ (userInfo.isTrial?"_disabled.png":".png")}/></span>
                                <span>Switch Role</span> */}
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
                        <div className="nav_bar">
                            <span className="">Welcome</span>
                            <div className="user-name-btn no-border" data-toggle="dropdown" onClick={()=>setShowUD(true)}>
                                <span className="user-name">{username || "Demo User"}</span>
                                <span><img className = "user-name-icon" alt="user-ic" src="static/imgs/ic-user-nav.png"/></span>
                            </div>
                        </div>
                        <div className={"user-name-menu dropdown-menu dropdown-menu-right " + (showUD && "show")} onMouseLeave={(e)=>{setShowICEMenu(false)}}>
                            <div><Link className="user-role-item" to="#">{selectedRole || "Test Manager"}</Link></div>
                            <div className="divider" />
                            {
                                !adminDisable &&
                                <>
                                {OS==="Windows"?
                                <div onClick={()=>{getIce("avoclientpath_Windows")}} ><Link to="#">Download ICE</Link></div>:null}
                                {OS==="MacOS"?
                                <div id="downloadICEdrop" onMouseEnter={()=>{setShowICEMenu(true)}}>
                                    <Link style={{display:"flex", justifyContent:"space-between"}} to="#">Download ICE<div className="fa chevron fa-chevron-right" style={{display:"flex",justifyContent:"flex-end",alignItems:"center"}}></div></Link>
                                </div>:null}
                                {OS === "Linux" ?
                                <div onClick={()=>{getIce("avoclientpath_Linux")}}><Link to="#">Download ICE</Link></div>:null}
                                
                                {showICEMenu?
                                (<div id="downloadICEContainer">
                                    <div id="downloadICEMenu" className="user-name-menu dropdown-menu dropdown-menu-right">
                                        {Object.keys(config).map((osPathname)=>{
                                            if (osPathname.includes("Windows") || osPathname.includes("Linux")){
                                                return <></>;
                                            }
                                            let versionName = osPathname.split("_")[1]
                                            return <div onClick={()=>{getIce("avoclientpath_"+versionName)}} ><Link to="#">{versionName}</Link></div>
                                        })}
                                    </div>
                                </div>)
                                :null}

                                { window.localStorage['navigateScreen'] !== 'settings' && <div onClick={chngUsrConf} onMouseEnter={()=>{setShowICEMenu(false)}}><Link to="#">Settings</Link></div>}
                                </>
                            }
                            <div onClick={logout} onMouseEnter={()=>{setShowICEMenu(false)}}><Link to="#">Logout</Link></div>
                        </div>
                        </ClickAwayListener>
                        </>
                        }
                    </div>
            </div>
        </>
    ); 
}
export default Header;