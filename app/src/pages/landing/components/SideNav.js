import { NavLink } from "react-router-dom";
import { Tooltip } from 'primereact/tooltip';

import '../styles/SideNav.scss';
import { React, useState } from "react";

const SideNav = () =>{
    const [tabSelected, setTabSelected] = useState(false)
    const menuItem = [
        {
            path: "/",
            name: "My Project(s)",
            icon: <img src={tabSelected==="/" ? "static/imgs/folder_icon_selected.svg" : "static/imgs/folder_icon.svg"} className="icon" data-pr-tooltip="My Project(s)"  data-pr-position="right" height="25px"/>
        },
        {
            path: "/integration",
            name: "Integration",
            icon: <img src={tabSelected==="/integration" ? "static/imgs/integration_icon_selected.svg"  :"static/imgs/integration_icon.svg"} className="icon" data-pr-tooltip="Integration"  data-pr-position="right" height="25px"/>
        },
        {
            path: "/reports",
            name: "Reports",
            icon: <img src={tabSelected==="/reports" ? "static/imgs/report_icon_selected.svg" :"static/imgs/report_icon.svg"} className="icon" data-pr-tooltip="Reports"  data-pr-position="right" height="25px"/>
        },
        {
            path: "/settings",
            name: "Settings",
            icon: <img src={tabSelected==="/settings" ? "static/imgs/settings_icon_selected.svg" : "static/imgs/settings_icon.svg"} className="icon" data-pr-tooltip="Settings"  data-pr-position="right" height="25px"/>
        },
        {
            path: "/more",
            name: "More",
            icon: <img src= {tabSelected==="/more" ? "static/imgs/more_icon_selected.svg" : "static/imgs/more_icon.svg"} className="icon" data-pr-tooltip="More"  data-pr-position="right" height="25px"/>
        },
    ]
    const onTabClickHandler = (index, route)=>{
        setTabSelected(route);
    }
    return ( 
        <>
            <div className="sidebar_container">
            <Tooltip target=".icon" mouseTrack mouseTrackLeft={20}/>
                <div className="sidebar">
                    {
                        menuItem.map((item, index) =>(
                            <NavLink to={item.path} key={index} onClick={()=>onTabClickHandler(index, item.path)} className="link" activeclassname="active">
                                <div className="flex flex-column w-full">
                                    <div className="icon">{item.icon}</div>
                                    <div className="link_text">{item.name}</div>
                                </div>
                                
                            </NavLink>
                        ))
                    }
                </div>
            </div>
        </>
     );
}

export default SideNav;