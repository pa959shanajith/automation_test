import { React, useState } from "react";
import { NavLink } from "react-router-dom";
import { Tooltip } from 'primereact/tooltip';
import PrimeReact from "primereact/api";
import { Badge } from 'primereact/badge';
import { Ripple } from 'primereact/ripple';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { useSelector } from 'react-redux';
import '../styles/SideNav.scss';


const SideNav = () =>{
    PrimeReact.ripple = true;
    const [tabSelected, setTabSelected] = useState("/landing");
    const [disableIconDialogVisible, setDisableIconDialogVisible] = useState(false);

    const recipientEmail = 'support@avoautomation.com';

    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if (!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo;
  

    const menuItem = [
        {
            path: "/landing",
            name: "Projects",
            icon: <img src={tabSelected === "/landing" ? "static/imgs/folder_icon_selected.svg" : "static/imgs/folder_icon.svg"} className="icon" data-pr-tooltip="Create/View all your projects."  data-pr-position="right" height="25px" />,
            disabled: false
        },
        // {
        //     path: "/integration",
        //     name: "Integration",
        //     icon: <img src={tabSelected==="/integration" ? "static/imgs/integration_icon_selected.svg"  :"static/imgs/integration_icon.svg"} className="icon" data-pr-tooltip=" Configure Avo Assure to integrate with external systems"  data-pr-position="right" height="25px"/>,
        //     disabled: false
        // },
        {
            path: "/reports",
            name: "Reports",
            icon: <img src={tabSelected==="/reports" ? "static/imgs/report_icon_selected.svg" :"static/imgs/report_icon.svg"} className="icon" data-pr-tooltip=" View and analyze executed test automations."  data-pr-position="right" height="25px"/>,
            disabled: false
        },
        // {
        //     path: "/settings",
        //     name: "Settings",
        //     icon: <img src={tabSelected==="/settings" ? "static/imgs/settings_icon_selected.svg" : "static/imgs/settings_icon.svg"} className="icon" data-pr-tooltip=" Manage/Create users, agents and other advanced configurations"  data-pr-position="right" height="25px"/>,
        //     disabled: false
        // },
        {
            path: "/admin",
            name: "Admin",
            icon: <img src= {tabSelected==="/admin" ? "static/imgs/admin_icon_selected.svg" : "static/imgs/admin_disabled_icon.svg"} className="icon" data-pr-tooltip="Manage/Create users, agents and other advanced configurations."  data-pr-position="right" height="25px"/>,
            disabled: false
        },
        {
            // path: "/itdm",
            name: "ITDM",
            icon: <img src= { tabSelected=== "/landing" ?  "static/imgs/ITDM_icon.svg" : "static/imgs/ITDM_icon_selected.svg"} className="icon" data-pr-tooltip="Avo’s intelligent Test Data Management (iTDM) solution offers production-like, relevant, and compliant data with a few clicks. It streamlines the entire test data management process making testing cost-effective and faster."  data-pr-position="right" height="25px"/>,
            disabled: true
        }
    ]
    const onTabClickHandler = (event, route, disabled)=>{
        if(!disabled) setTabSelected(route);
        else {
            setDisableIconDialogVisible(true);
        };
    }
 
    const itdmDialogHide = () => {
        setDisableIconDialogVisible(false)
    }

    const filteredMenuItems = userInfo.isadminuser ? menuItem : menuItem.filter(item => item.name !== "Admin");

    return ( 
        <>
            <div className="sidebar_container">
            <Tooltip target=".icon" mouseTrack mouseTrackLeft={20}/>
            <Dialog className="itdm_header" visible={disableIconDialogVisible} header="AVO iTDM" onHide={() => itdmDialogHide()} style={{ width: '30vw' }} >
                {/* <Carousel value={ITDM_images} itemTemplate={ITDM_Template} /> */}
                <div className="border-1 surface-border border-round m-2 text-center py-5 px-3">
                <div className="mb-3">
                    <img src={`static/imgs/ITDM_disabled_ipopup_img2.png`} alt={"ITDM"} className="w-6 shadow-2" />
                </div>
                <div>
                    <span className="mb-1 itdm_dis">Accelerate application development speed, code quality and sustainability initiatives by providing timely access to fresh relevant data downstream for test automation purpose.</span>
                    <div className="itdm_dis">Want to know more?</div>
                    <div className="mt-5 flex flex-wrap gap-2 justify-content-center">
                        <Button className="Itdm_contact" label="Contact Us" onClick={() => window.location.href = `mailto:${recipientEmail}`} />
                    </div>
                </div>
            </div>
            </Dialog>
                <div className="sidebar">
                    {
                     filteredMenuItems.map((item, index) =>(
                            <NavLink to={item.path} key={index} onClick={(e)=>onTabClickHandler(e, item.path, item.disabled)} className={"p-ripple nav_item" + (item.disabled ? '_disabled' : '')+(item.name === "ITDM" ? 'inactive' : '')} activeclassname= {(item.name === "ITDM" ? "inactive" : "active")} end>
                                <div className="flex flex-column w-full">
                                    <div className={item.name === "ITDM" ? "flex-row p-overlay-badge itdm_icon" : "icon flex-row p-overlay-badge"}>{item.icon} </div>
                                    <div className={item.name === "ITDM" ?  "link_text itdm_icon" :"link_text"}>{item.name}</div>
                                    <Ripple />
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