import React from 'react';
import Topbar from '../components/Topbar';
import SideNavBar from '../components/SideNav';
import SidePanel from './SidePanel';
import HomePageContainer from './HomePageContainer';
import '../styles/HomePage.scss';
import { Outlet } from 'react-router-dom';


const HomePage = () => {
    return(
        <div className='dashboard_container'>
            <SidePanel/>
            <div className='surface-card'>
                <Outlet/>
            </div>
                
        </div>
    )
}

export default HomePage;