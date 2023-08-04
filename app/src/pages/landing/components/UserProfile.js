import React, { useState, useRef, useEffect } from "react";
import { Avatar } from 'primereact/avatar';
import { TieredMenu } from 'primereact/tieredmenu';
import { Tooltip } from "primereact/tooltip";
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useSelector, useDispatch } from 'react-redux';
import { loadUserInfoActions } from '../LandingSlice';
import { useNavigate, Link } from "react-router-dom";
import RedirectPage from '../../global/components/RedirectPage';
import ChangePassword from '../../global/components/ChangePassword';
import EditProfile from '../components/EditProfile'
import Agent from '../components/Agent';
// import 'primereact/resources/themes/saga-blue/theme.css';
// import 'primereact/resources/primereact.min.css';
import '../styles/userProfile.scss';
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";
import { Button } from "primereact/button";
import { setMsg, Messages as MSG, } from "../../global";
import { Toast } from "primereact/toast";


const UserDemo = (props) => {
    const menu = useRef(null);
    const toast = useRef();
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
    }, []);


    const toastError = (erroMessage) => {
        if (erroMessage.CONTENT) {
            toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
    }

    const toastSuccess = (successMessage) => {
        if (successMessage.CONTENT) {
            toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
    }

    const getIce = async (clientVer) => {
        try {
            setShowUD(false);
            //   setShowOverlay(`Loading...`);
            const res = await fetch("/downloadICE?ver=" + clientVer);
            const { status } = await res.json();
            if (status === "available") {
                window.location.href = window.location.origin + "/downloadICE?ver=" + clientVer + "&file=getICE" + "&fileName=" + ((userInfo.isTrial ? "1_" : "0_") + window.location.host + "." + config[clientVer].split(".").pop());
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
        getIce("avoclientpath_Windows");
    };

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
        <Toast ref={toast} position="bottom-center" baseZIndex={1300} />

        <div className="UserProfileContainer">
            <TieredMenu className='custom-tieredmenu' model={userMenuItems} popup ref={menu} breakpoint="767px" />
            {showEditProfileDialog && <EditProfile showDialogBox={showEditProfileDialog} setShowDialogBox={setShowEditProfileDialog} userInfo={userInfo} />}
            {showChangePasswordDialog && < ChangePassword showDialogBox={showChangePasswordDialog} setShowDialogBox={setShowChangePasswordDialog} toastError={toastError}  toastSuccess={toastSuccess}  />}
            {showAgentDialog && < Agent showDialogBox={showAgentDialog} setShowDialogBox={setShowAgentDialog} />}
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

