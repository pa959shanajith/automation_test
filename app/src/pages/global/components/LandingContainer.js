import React, { useEffect, useState } from 'react';
import { FooterTwo as Footer } from '../../global';
import { useLocation } from 'react-router-dom';
import '../styles/LandingContainer.scss';



const LandingContainer = (props) => {

    const location = useLocation();
    const [showSideNavBar, setShowSideNavBar] = useState(true);

    useEffect(() => {
        if (["/design", "/execute", "/reports"].includes(location.pathname)) {
            setShowSideNavBar(false);
        }
        else {
            setShowSideNavBar(true);
        }
    }, [location]);

    return (
        <div className="sidebar_sidepanel_homepage">
            {showSideNavBar && props.sideNavBar}
            <div className='HomePage_container'>
                <div className='sidepanel_container'>
                    {props.sidePanel}
                </div>
                <div className='origin_container surface-100 flex flex-column h-full'>
                    {props.contentPage}
                </div>
            </div>
            <div><Footer /></div>
        </div>


    )
}
export default LandingContainer;