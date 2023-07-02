import React, { useEffect ,useState } from 'react';
import '../styles/StaticElements.scss';
import Topbar from './Topbar';
import SideNavBar from './SideNav';
import {FooterTwo as Footer} from '../../global';
import { useLocation } from 'react-router-dom';


const StaticElements = ({children}) => {

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

    return(
            <div className="sidebar_sidepanel_homepage">
                { showSideNavBar && <SideNavBar />}
                {children}
                <div><Footer/></div>
            </div>
            

    )
}
export default StaticElements;