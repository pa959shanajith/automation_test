
import React from 'react';
import { Menubar } from 'primereact/menubar';
// import { InputText } from 'primereact/inputtext';
// import NavigationBar1 from './NavigationBar1';
// import sidePanel1 from './sidePanel1';
// import '../Component/userProfile.css';

import LogOut from '../components/LogOut';
import Project from '../components/Project';

// import { Avatar } from 'primereact/avatar';
// import { AvatarGroup } from 'primereact/avatargroup';
// import { Badge } from 'primereact/badge';
import UserProfile from '../components/UserProfile'
import '../styles/userProfile.scss'


import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";  

const MenubarDemo = (props) => {

    const start = <img alt="logo" src="showcase/images/logo.png" onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} height="40" className="mr-2"></img>;
    const end = (<div>
        {/* // Render other menu items here */}
        <UserProfile />
        <div style={{margin: '-2.8rem 2rem -0.5rem 4.5rem'}}>
        <LogOut/>
        </div>
      </div>
    );

    return (
        <div>
            {/* <div className="card"> */}
                <Menubar start={start}  end={end} />
                {/* <div> */}
                {/* <UserProfile /> */}
                <Project />
                {/* <LogOut/> */}
                {/* </div> */}
                {/* <NavigationBar1/> */}
                {/* <sidePanel1/> */}
                {/* </Menubar> */}
                {/* <sidePanel1/> */}
               
             {/* </div> */}
        </div>
    );
    }


    export default MenubarDemo;