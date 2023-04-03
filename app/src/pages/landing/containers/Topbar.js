
import React from 'react';
import { Menubar } from 'primereact/menubar';
import LogOut from '../components/LogOut';
import Project from '../components/Project';
import UserProfile from '../components/UserProfile'
import '../styles/userProfile.scss'


import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";  
import ProjectCreation from './ProjectCreation';

const MenubarDemo = (props) => {

    const start = <img alt="logo" src="showcase/images/logo.png" onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} height="40" className="mr-2"></img>;
    const end = (<div>
        <UserProfile />
        <div style={{margin: '-2.8rem 2rem -0.5rem 4.5rem'}}>
        <LogOut/>
        </div>
      </div>
    );

    return (
        <div>
                <Menubar start={start}  end={end} />
                <Project />
                <ProjectCreation/>
        </div>
    );
    }


    export default MenubarDemo;