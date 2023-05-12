import React from 'react';
import Topbar from '../components/Topbar';
import SideNavBar from '../components/SideNav';
import SidePanel from './SidePanel';
import HomePageContainer from './HomePageContainer';
import { Outlet } from 'react-router-dom';
import ProjectOverview from '../components/ProjectOverview';
import '../styles/HomePage.scss';


const HomePage = (props) => {
    return(
        <div className='HomePage_container'>
            <SidePanel/>
            <div className='surface-100 flex flex-column h-full'>
                <div><ProjectOverview/></div>
            </div>    
        </div>
    )
}

export default HomePage;