import React, { useState, useRef, useEffect } from "react";
import { Avatar } from 'primereact/avatar';
import { TieredMenu } from 'primereact/tieredmenu';
import { Tooltip } from "primereact/tooltip";
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useSelector, useDispatch } from 'react-redux';
import { loadUserInfoActions } from '../LandingSlice';
import { useNavigate, Link } from "react-router-dom";
import EditProfile from '../components/EditProfile'
import Agent from '../components/Agent';
// import 'primereact/resources/themes/saga-blue/theme.css';
// import 'primereact/resources/primereact.min.css';
import '../styles/userProfile.scss';
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";
import { Button } from "primereact/button";
import { setMsg, Messages as MSG, RedirectPage, ChangePassword} from "../../global";


const UserDemo = (props) => {
    const menu = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [logoutClicked, setLogoutClicked] = useState(false);
    const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
    const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
    const [showAgentDialog, setShowAgentDialog] = useState(false);
    const [initials, setInitials] = useState('');
    const [config, setConfig] = useState({});
    const [showUD, setShowUD] = useState(false);
    const [showOverlay, setShowOverlay] = useState("");
    const[OS,setOS]=useState("Windows")


    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if (!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo;

    useEffect(() => {
        if (userInfo) {
            const firstNameInitial = userInfo.firstname ? userInfo.firstname.slice(0, 1) : '';
            const lastNameInitial = userInfo.lastname ? userInfo.lastname.slice(0, 1) : '';
            const initials = (firstNameInitial + lastNameInitial).toUpperCase();
            setInitials(initials);
        }
    }, [userInfo])

    useEffect(() => {
        (async () => {
            const response = await fetch("/getClientConfig")
            let { avoClientConfig } = await response.json();
            setConfig(avoClientConfig);

        })();
        getOS()
    }, []);

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
            //   setShowOverlay(`Loading...`);
            const res = await fetch("/downloadICE?ver=" + clientVer);
            const { status } = await res.json();
            if (status === "available") {
                window.location.href = window.location.origin + "/downloadICE?ver=" + clientVer + "&file=getICE" + "&fileName=" + ((userInfo['licenseID']) + window.location.host + "." + config[clientVer].split(".").pop());
            }
            else
                setMsg(MSG.GLOBAL.ERR_PACKAGE);
            //   setShowOverlay(false)
        } catch (ex) {
            console.error("Error while downloading ICE package. Error:", ex);
            setMsg(MSG.GLOBAL.ERR_PACKAGE);
        }
    }
    const handleDownloadClick = () => {
    if(OS=="Windows"){
        getIce("avoclientpath_Windows");
        
    }
    if (OS=="MacOS"){
        getIce("avoclientpath_Mac")
    }
    if(OS=="Linux")
    getIce("avoclientpath_Linux")
    }

    const userMenuItems = [
        {
            template: () => {
                return (

                    userInfo && <div className='ProfileDisplay'>
                        <Avatar className="pl-0 mt-2 mb-2 bg-yellow-100 text-800"
                            image={userInfo?.userimage !=="" ? userInfo.userimage : ''}
                            label={(userInfo?.userimage === "") ? initials : ''}
                            size="xlarge" shape="circle" />
                        <div className="flex flex-column">
                            <span className="font-bold user_name">{userInfo.username}</span>
                            <span className="text-sm user_role">{userInfo.rolename}</span>
                            <Tooltip target=".tooltipEmailId" position="left" content={userInfo.email_id} />
                            <span className="text-sm max-w-12rem tooltipEmailId">{userInfo.email_id}</span>
                        </div>
                    </div>)
            }
        },
        {
            separator: true
        },
        {
            label: 'Edit Profile',
            icon: 'pi pi-fw pi-pencil',
            command: () => {
                EditProfileDialog();
                setShowUserMenu(false);
            }
        },
        {
            label: 'Change Password',
            icon: 'pi pi-fw pi-key',
            command: () => {
                changePasswordDialog();
                setShowUserMenu(false);
            }

        },
        {
            label: 'Download',
            icon: 'pi pi-fw pi-download',
            items: [
                {
                    label: 'Download Client',
                    icon: 'pi pi-fw pi-download',
                    command: () => {
                        handleDownloadClick();
                    }
                },
                {
                    label: 'Download Agent',
                    icon: 'pi pi-fw pi-download',
                    command: () => {
                        agentDialog();
                    }
                }
            ]
        },
        {
            label: 'Notification Settings',
            icon: 'pi pi-fw pi-bell',
        },
        {
            separator: true
        },
        {
            label: 'Log Out',
            icon: 'pi pi-fw pi-sign-out',
            command: () => {
                setLogoutClicked(true);
                setShowUserMenu(false);
            }
        }
    ];

    const changePasswordDialog = () => {
        setShowChangePasswordDialog(true);
        dispatch(loadUserInfoActions.showChangePasswordDialog());
    }

    const EditProfileDialog = () => {
        setShowEditProfileDialog(true);
    }

    const agentDialog = () => {
        setShowAgentDialog(true);
    }

    const confirmLogout = () => {
        RedirectPage(navigate, { reason: "logout" });
    };

    return (
    <>
       

        <div className="UserProfileContainer">
            <TieredMenu className='custom-tieredmenu' model={userMenuItems} popup ref={menu} breakpoint="767px" />
            {showEditProfileDialog && <EditProfile showDialogBox={showEditProfileDialog} setShowDialogBox={setShowEditProfileDialog} userInfo={userInfo} toastError={props.toastError}  toastSuccess={props.toastSuccess} toastWarn={props.toastWarn}/>}
            {showChangePasswordDialog && <ChangePassword showDialogBox={showChangePasswordDialog} setShowDialogBox={setShowChangePasswordDialog} toastError={props.toastError}  toastSuccess={props.toastSuccess}  />}
            {showAgentDialog && <Agent showDialogBox={showAgentDialog} setShowDialogBox={setShowAgentDialog} />}
            <AvoConfirmDialog
                visible={logoutClicked}
                onHide={setLogoutClicked}
                showHeader={false}
                message="Are you sure you want to logout?"
                icon="pi pi-exclamation-triangle"
                accept={confirmLogout} />
            <Avatar className="pl-0 mt-2 mb-2 bg-yellow-100 text-800"
                image={userInfo?.userimage !=="" ? userInfo.userimage : initials}
                label={(userInfo?.userimage === "") ? initials : ''}
                onClick={(e) => menu.current.toggle(e)} size='small' shape="circle" />
        </div>
    </>
    );
};

export default UserDemo;

