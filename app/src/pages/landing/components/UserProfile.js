import React, { useState, useRef,useEffect} from "react";
import { Avatar } from 'primereact/avatar';
import { TieredMenu } from 'primereact/tieredmenu';
import { ConfirmDialog} from 'primereact/confirmdialog';
import { useSelector, useDispatch } from 'react-redux';
import { loadUserInfoActions } from '../LandingSlice';
import { useNavigate } from "react-router-dom";
import RedirectPage from '../../global/components/RedirectPage';
import ChangePassword from '../../global/components/ChangePassword';
import EditProfile from '../components/EditProfile'
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../styles/userProfile.scss';
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";


const UserDemo = (props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [logoutClicked, setLogoutClicked] = useState(false);
    const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
    const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
    const [initials, setInitials] = useState('');
    const userInfo = useSelector((state) => state.landing.userinfo);

    
    const handleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    useEffect(() => {
        const firstNameInitial = userInfo.firstname ? userInfo.firstname.slice(0, 1) : '';
        const lastNameInitial = userInfo.lastname ? userInfo.lastname.slice(0, 1) : '';
        const initials = (firstNameInitial+ lastNameInitial).toUpperCase();
        setInitials(initials);
    }, [userInfo])

    const userMenuItems =[
        {
            template: () => {
                return (
                            <div className='ProfileDisplay'>
                                <Avatar className="pl-0 mt-2 mb-2 bg-yellow-100 text-800"
                                label={initials } 
                                onClick={handleUserMenu} size="xlarge" shape="circle"/>
                                <div className="flex flex-column">
                                    <span className="font-bold c">{userInfo.username}</span>
                                    <span className="text-sm c">{userInfo.rolename}</span>
                                    <span className="text-sm c">{userInfo.email_id}</span>
                                </div>
                            </div>)
                            }
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
                }
            ]
        },
        {
            label: 'Notification Setting',
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
    const confirmLogout = () => {
        RedirectPage(navigate, { reason: "logout" });
    };
  
    return (
        <div className="UserProfileContainer">
            { showUserMenu && <TieredMenu className='custom-tieredmenu' model={userMenuItems} />}
            { showEditProfileDialog && <EditProfile showDialogBox = {showEditProfileDialog} setShowDialogBox= {setShowEditProfileDialog}/>}
            { showChangePasswordDialog && < ChangePassword showDialogBox = {showChangePasswordDialog} setShowDialogBox= {setShowChangePasswordDialog}/>}
            <AvoConfirmDialog className="Logout_modal"
                visible={logoutClicked}
                onHide={setLogoutClicked} 
                showHeader={false}
                message="Are you sure you want to logout?" 
                icon="pi pi-exclamation-triangle" 
                accept={confirmLogout} />
            <Avatar className="pl-0 mt-2 mb-2 bg-yellow-100 text-800 profile"
                // image={userLoginInfo.profilePictureUrl ? userLoginInfo.profilePictureUrl :''} 
                // label={userLoginInfo.profilePictureUrl ? userLoginInfo.username : getInitials()}
                image={userInfo ? userInfo :''} 
                label={ userInfo ? initials :''}
                onClick={handleUserMenu} size='small' shape="circle"/>
        </div>
   );
};

export default UserDemo;

