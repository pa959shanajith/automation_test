import React, { useEffect, useState } from 'react';
import SidePanel from './SidePanel';
import ProjectOverview from '../components/ProjectOverview';
import '../styles/HomePage.scss';
import StaticElements from '../components/StaticElements';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import RedirectPage from '../../global/components/RedirectPage';
import * as api from '../api';
export var navigate

const HomePage = () => {
    navigate = useNavigate()
    const dispatch = useDispatch();

    useEffect(() => {
        if (window.localStorage['navigateScreen'] !== "landing") {
            RedirectPage(navigate, { reason: "screenMismatch" });
        }
    }, []);


    return (
        <StaticElements>
            <div className='HomePage_container'>
                <SidePanel />
                <div className='surface-100 flex flex-column h-full'>
                    <ProjectOverview />
                </div>
            </div>
        </StaticElements>
    )
}

export default HomePage;