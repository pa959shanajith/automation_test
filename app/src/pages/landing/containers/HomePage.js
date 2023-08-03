import React, { useEffect } from 'react';
import SidePanel from './SidePanel';
import ProjectOverview from '../components/ProjectOverview';
import RedirectPage from '../../global/components/RedirectPage';
import LandingContainer from '../../global/components/LandingContainer';
import SideNavBar from '../components/SideNav';
export var navigate

const HomePage = () => {

    useEffect(() => {
        if (window.localStorage['navigateScreen'] !== "landing") {
            RedirectPage(navigate, { reason: "screenMismatch" });
        }
    }, []);


    return (
        <LandingContainer
            sideNavBar={<SideNavBar />}
            sidePanel={<SidePanel/>}
            contentPage={<ProjectOverview />}
        ></LandingContainer>
    )
}

export default HomePage;