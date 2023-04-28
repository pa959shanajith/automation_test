
import React from 'react';
import { Menubar } from 'primereact/menubar';
import LogOut from './LogOut';
import DisplayProject from './DisplayProject';
import UserProfile from './UserProfile'
import '../styles/userProfile.scss'
 
import ProjectCreation from './ProjectCreation';

const MenubarDemo = (props) => {

    const start = <img alt="logo" src="static/imgs/logo.png" onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} height="30" className="mr-2"></img>;
    const end = (<div> 
        <UserProfile />
        </div>
  
    );

    return (
            <>
               <Menubar className='Header_size' start={start}  end={end} />
            </>
    );
    }


    export default MenubarDemo;