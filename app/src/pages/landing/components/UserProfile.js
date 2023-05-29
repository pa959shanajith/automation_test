import React, { useState, useEffect, useRef } from "react";
import { Avatar } from 'primereact/avatar';
import { TieredMenu } from 'primereact/tieredmenu';
import { Button } from 'primereact/button';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast'
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import Logout from './LogOut';
import { InputText } from "primereact/inputtext";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../styles/userProfile.scss';
import { useDispatch } from "react-redux";
import { loadUserInfoActions } from '../LandingSlice';
import { useNavigate } from "react-router-dom";
import RedirectPage from '../../global/components/RedirectPage';
import ChangePassword from '../../global/components/ChangePassword';

const UserDemo = (props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showMenu, setShowMenu] = useState(false);
    const [editvisible, seteditVisible] = useState(true);
    const [visible, setVisible] = useState(false);
    const [logoutClicked, setLogoutClicked] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
    const toast = useRef(null);
    const buttonEl = useRef(null);
    const userLoginInfo = {
        username: "DemoUser",
        firstName: "Demo",
        lastName: "User",
        userRole: "TestLead",
        profilePictureUrl: "",
        userId: "Demouser@123.com"
    }
    const handleChipClick = () => {
        setShowMenu(!showMenu);
    };
    const getInitials = () => {
        const firstname = userLoginInfo.firstName.split(' ');
        const lastname = userLoginInfo.lastName.split(' ');
        const initials = firstname[0].substring(0, 1).toUpperCase() + lastname[0].substring(0, 1).toUpperCase();
        return initials;
    }

    // const handleLogoutClick = () => {
    //     // render the Logout component when "Logout" is clicked
    //     return <Logout />;
    //   };

    const [menuItems, setMenuItems] = useState([
        {
            template: () => {
                return (
                    <>
                        {userLoginInfo.profilePictureUrl ? (
                            <div className='ProfileDisplay '>
                                <Avatar image={userLoginInfo.profilePictureUrl} label={userLoginInfo.username} onClick={handleChipClick} size='large' />
                                <div className="flex flex-column">
                                    <span className="font-bold c">{userLoginInfo.username}</span>
                                    <span className="text-sm c">{userLoginInfo.userRole}</span>
                                    <span className="text-sm c">{userLoginInfo.userId}</span>
                                </div>
                            </div>) : (
                            <div className='ProfileDisplay '>
                                <Avatar className="pl-0 mt-3 mb-3 bg-yellow-100" size='large' label={getInitials()} onClick={handleChipClick} shape="circle" />
                                <div className="flex flex-column align">
                                    <span className="font-bold c">{userLoginInfo.username}</span>
                                    <span className="text-sm c">{userLoginInfo.userRole}</span>
                                    <span className="text-sm c">{userLoginInfo.userId}</span>
                                </div>
                            </div>)}
                    </>
                )
            }
        },
        {
            label: 'Edit Profile',
            icon: 'pi pi-fw pi-pencil',
            command: () => {
                setVisible(true);
                setShowMenu(false);
            }
        },
        {
            label: 'Change Password',
            icon: 'pi pi-fw pi-key',
            command: () => changePasswordDialog()
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
                Logout();
                setShowMenu(false);
            }
        }
    ]);

    const changePasswordDialog = () => {
        setShowChangePasswordDialog(true);
        dispatch(loadUserInfoActions.showChangePasswordDialog());
    }

    const onUpload = (event) => {
        // Get the uploaded file
        const uploadedFile = event.files[0];

        // Set the profile image state
        setProfileImage(uploadedFile);
    };


    const accept = () => {
        RedirectPage(navigate, { reason: "logout" });
    };

    const reject = () => {
        toast.current.show({ severity: 'warn', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
    };
    const Logout = () => {
        setLogoutClicked(true);
        return (
            <>
                <Toast ref={toast} />
            </>)
    };
    const chooseOptions = { icon: 'pi pi-camera', label: ' ' };


    const editProfile = () => {
        // Add logic for editing the user's profile here
        // ...

        setVisible(false); // Close the Dialog when editing is complete
    };

    return (
        <>
            { showChangePasswordDialog && < ChangePassword showDialogBox = {showChangePasswordDialog} setShowDialogBox= {setShowChangePasswordDialog}/>}
            <div>
                <Toast ref={toast} />
                <ConfirmPopup target={buttonEl.current} visible={logoutClicked} onHide={() => setLogoutClicked(false)}
                    message="Are you sure you want to logout?" icon="pi pi-exclamation-triangle" accept={accept} reject={reject} />
                {/* <Button id="border-0" className='surface-300' ref={buttonEl} onClick={() => setVisible(true)} icon="pi pi-sign-out" /> */}
            </div>
            <div>
                {userLoginInfo.profilePictureUrl ? (<Avatar image={userLoginInfo.profilePictureUrl} label={userLoginInfo.username} onClick={handleChipClick} size='small' title="User Profile" />)
                    : (<Avatar className="pl-0 mt-3 mb-3 bg-yellow-100" size='small' label={getInitials()} onClick={handleChipClick} shape="circle" title="User Profile" />)}
                <div className="tiredmenu_align">
                    {showMenu && (<>
                        <TieredMenu className='custom-tieredmenu' model={menuItems} setShowMenu={setShowMenu} /></>)}
                    {<Dialog className="heder_dialog" visible={visible} style={{ width: '50vw', height: '87vh' }} onHide={() => setVisible(false)} header="Basic Information"
                        footer={
                            <div>
                                <Button className="Cancel_btn" label="Cancel" onClick={() => setVisible(false)} />
                                <Button className="Save_btn" label="Save" onClick={editProfile} />
                            </div>
                        }
                    >
                        <div className="profileImage">
                            {userLoginInfo.profilePictureUrl ? (
                                <>
                                    {/* <img src={URL.createObjectURL(userLoginInfo.profilePictureUrl)} alt="Profile" /> */}
                                    <Avatar image={userLoginInfo.profilePictureUrl} label={userLoginInfo.username} onClick={handleChipClick} size='xlarge' title="User Profile" />
                                    <FileUpload className="userImage"
                                        mode="basic"
                                        name="profileImage"
                                        accept="image/*"
                                        maxFileSize={1000000}
                                        chooseOptions={chooseOptions}
                                        onUpload={onUpload}
                                    />
                                </>
                            ) : (
                                <>
                                    <Avatar className="pl-0 mt-3 mb-3 bg-yellow-100" size='xlarge' label={getInitials()} onClick={handleChipClick} shape="circle" title="User Profile" />
                                </>)
                            }
                        </div>
                        <div className="input_field">
                            <div>
                                <label htmlFor="name">Name</label>
                                <InputText id="name" type="text" />
                            </div>
                            <div>
                                <label htmlFor="email">Email</label>
                                <InputText id="email" type="email" />
                            </div>
                            <div>
                                <label htmlFor="dob">Primary Role</label>
                                <InputText id="dob" type="text" readOnly />
                            </div>
                            <div>
                                <label htmlFor="phone">Registered Date</label>
                                <InputText id="phone" type="text" readOnly />
                            </div>
                        </div>

                    </Dialog>}

                </div>
            </div>
        </>
    );
};

export default UserDemo;
