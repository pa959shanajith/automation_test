import React, { useState,useEffect,useRef } from "react";
import { Avatar } from 'primereact/avatar';
import { TieredMenu } from 'primereact/tieredmenu';
import { Button } from 'primereact/button';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast'
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../styles/TiredMenu.scss';

const UserDemo = (props) => {
    const [showMenu, setShowMenu] = useState(false);
    const [visible, setVisible] = useState(false);
    const toast = useRef(null);
    const buttonEl = useRef(null);

    const userLoginInfo = {
        username: "DemoUser",
        firstName:"Demo",
        lastName:"User",
        userRole: "TestLead",
        profilePictureUrl: "https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png",
        userId:"Demouser@123.com"
        }


        const handleChipClick = () => {
    setShowMenu(!showMenu);
        };

  const getInitials=()=> {
    const firstname = userLoginInfo.firstName.split(' ');
    const lastname = userLoginInfo.lastName.split(' ');
    const initials = firstname[0].substring(0, 1).toUpperCase() + lastname[0].substring(0, 1).toUpperCase();
    return initials;
  }
const menuitems = [
  {
      template: () => {
        return (
        <>
        {userLoginInfo.profilePictureUrl ? (
        <div className='ProfileDisplay '>
            <Avatar image={userLoginInfo.profilePictureUrl} label={userLoginInfo.username} onClick={handleChipClick} size='large'/>
                <div className="flex flex-column">
                    <span className="font-bold c">{userLoginInfo.username}</span>
                    <span className="text-sm c">{userLoginInfo.userRole}</span>
                    <span className="text-sm c">{userLoginInfo.userId}</span>
                </div>
        </div>) : 
        (
            <div>
                <div className='ProfileDisplay '>
                    <Avatar className="pl-0 mt-3 mb-3 bg-yellow-100" size='large' label={getInitials()} onClick={handleChipClick} shape="circle"/>
                    <div className="flex flex-column align">
                        <span className="font-bold c">{userLoginInfo.username}</span>
                        <span className="text-sm c">{userLoginInfo.userRole}</span>
                        <span className="text-sm c">{userLoginInfo.userId}</span>
                    </div>
                </div>
            </div>)}
        </> 
        )}
},
{
    label: 'Edit Profile',
    icon: 'pi pi-fw pi-pencil',
},
{
    label: 'Change Password',
    icon: 'pi pi-fw pi-key',
},
{
    label: 'Download',
    icon: 'pi pi-fw pi-download',
    items: [
        {
            label: 'Download Client',
            icon: 'pi pi-fw pi-download',
            // command: () => handleItemClick('Log Out'),/
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
    command: () => handleItemClick('Log Out'),
}
];

const handleItemClick = (menuitems) => {
    switch(menuitems) {
        case 'Item 1':
        alert('You clicked Item 1!');
        break;
        case 'Item 2':
        alert('You clicked Item 2!');
        break;
        case 'Item 3':
        alert('You clicked Item 3!');
        break;
        case 'Item 4':
        alert('You clicked Item 2!');
        break;
        case 'Log Out':
        Logout();
        break;
        default:
        alert('Unknown item clicked!');
    }

};


const accept = () => {
toast.current.show({ severity: 'info', detail: 'User successfully logged out from Avo Assure'});
};

const reject = () => {
toast.current.show({ severity: 'warn', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
};
const Logout=()=>{
setVisible(true);
return(
<>
<Toast ref={toast} />
</>)
};

return (
    <div>
        <Toast ref={toast} />
        <ConfirmPopup target={buttonEl.current} visible={visible} onHide={() => setVisible(false)} 
        message="Are you sure you want to logout?" icon="pi pi-exclamation-triangle" accept={accept} reject={reject} />
        {/* <Button id="border-0" className='surface-300' ref={buttonEl} onClick={() => setVisible(true)} icon="pi pi-sign-out" /> */}
    <div>
    <div>

{userLoginInfo.profilePictureUrl ? (
        <Avatar image={userLoginInfo.profilePictureUrl} label={userLoginInfo.username} onClick={handleChipClick} size='small' title="User Profile"/>
) : (

        <div >
        <Avatar className="pl-0 mt-3 mb-3 bg-yellow-100" size='small' label={getInitials()} onClick={handleChipClick} shape="circle" title="User Profile"/>
        
</div>
        
    )
    }
    </div>
<div className="tiredmenu_align">
    {showMenu && (
   <TieredMenu  className='custom-tieredmenu link a tieredmenu_Font' model={menuitems}  />

    )}
    </div>
    </div>
    </div>
);

};

export default UserDemo;
