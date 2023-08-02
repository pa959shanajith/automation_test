import { React, useState } from "react";
import { NavLink } from "react-router-dom";
import { Tooltip } from 'primereact/tooltip';
import PrimeReact from "primereact/api";
import { Badge } from 'primereact/badge';
import { Ripple } from 'primereact/ripple';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';




import '../styles/SideNav.scss';


const SideNav = () =>{
    PrimeReact.ripple = true;
    const [tabSelected, setTabSelected] = useState("/landing");
    const [disableIconDialogVisible, setDisableIconDialogVisible] = useState(false);
    const [ITDM_images, setITDM_images] = useState([{image:"ITDM_disabled_popup_img1.png"},
                                                    {image:"ITDM_disabled_ipopup_img2.png"},
                                                    {image:"ITDM_disabled_ipopup_img3.png"}])
    const menuItem = [
        {
            path: "/landing",
            name: "Projects",
            icon: <img src={tabSelected === "/landing" ? "static/imgs/folder_icon_selected.svg" : "static/imgs/folder_icon.svg"} className="icon" data-pr-tooltip="Create/View all your projects."  data-pr-position="right" height="25px" />,
            disabled: false
        },
        {
            path: "/integration",
            name: "Integration",
            icon: <img src={tabSelected==="/integration" ? "static/imgs/integration_icon_selected.svg"  :"static/imgs/integration_icon.svg"} className="icon" data-pr-tooltip=" Configure Avo Assure to integrate with external systems"  data-pr-position="right" height="25px"/>,
            disabled: false
        },
        {
            path: "/reports",
            name: "Reports",
            icon: <img src={tabSelected==="/reports" ? "static/imgs/report_icon_selected.svg" :"static/imgs/report_icon.svg"} className="icon" data-pr-tooltip=" View and analyze executed test automations."  data-pr-position="right" height="25px"/>,
            disabled: false
        },
        {
            path: "/settings",
            name: "Settings",
            icon: <img src={tabSelected==="/settings" ? "static/imgs/settings_icon_selected.svg" : "static/imgs/settings_icon.svg"} className="icon" data-pr-tooltip=" Manage/Create users, agents and other advanced configurations"  data-pr-position="right" height="25px"/>,
            disabled: false
        },
        {
            path: "/itdm",
            name: "ITDM",
            icon: <img src= {tabSelected==="/itdm" ? "static/imgs/ITDM_icon_selected.svg" : "static/imgs/ITDM_icon.svg"} className="icon" data-pr-tooltip="Avo’s intelligent Test Data Management (iTDM) solution offers production-like, relevant, and compliant data with a few clicks. It streamlines the entire test data management process making testing cost-effective and faster."  data-pr-position="right" height="25px"/>,
            disabled: true
        },
        {
            path: "/admin",
            name: "Admin",
            icon: <img src= {tabSelected==="/admin" ? "static/imgs/admin_icon_selected.svg" : "static/imgs/ITDM_icon.svg"} className="" data-pr-tooltip="Avo’s intelligent Test Data Management (iTDM) solution offers production-like, relevant, and compliant data with a few clicks. It streamlines the entire test data management process making testing cost-effective and faster."  data-pr-position="right" height="25px"/>,
            disabled: false
        }
    ]
    const onTabClickHandler = (event, route, disabled)=>{
        if(!disabled) setTabSelected(route);
        else {
            setDisableIconDialogVisible(true);
        };
    }

    const ITDM_Template = (ITDM_images) => {
        return (
            <div className="border-1 surface-border border-round m-2 text-center py-5 px-3">
                <div className="mb-3">
                    <img src={`static/imgs/${ITDM_images.image}`} alt={"ITDM"} className="w-6 shadow-2" />
                </div>
                <div>
                    <h4 className="mb-1">Description about ITDM</h4>
                    <div className="mt-5 flex flex-wrap gap-2 justify-content-center">
                        <Button  className="" onClick={()=> setDisableIconDialogVisible(false)}>Buy Add-ON</Button>
                    </div>
                </div>
            </div>
        );
    };

    const itdmDialogHide = () => {
        setDisableIconDialogVisible(false)
    }

    return ( 
        <>
            <div className="sidebar_container">
            <Tooltip target=".icon" mouseTrack mouseTrackLeft={20}/>
            <Dialog visible={disableIconDialogVisible} onHide={() => itdmDialogHide} style={{ width: '30vw' }} >
                <Carousel value={ITDM_images} numVisible={1} numScroll={1} itemTemplate={ITDM_Template} />
            </Dialog>
                <div className="sidebar">
                    {
                        menuItem.map((item, index) =>(
                            <NavLink to={item.path} key={index} onClick={(e)=>onTabClickHandler(e, item.path, item.disabled)} className={"p-ripple nav_item" + (item.disabled ? '_disabled' : '')} activeclassname="active" end>
                                <div className="flex flex-column w-full">
                                    <div className="icon flex-row p-overlay-badge">{item.icon} {item.disabled && <Badge value={<img  className='lock_icon' src="static/imgs/disabled_tab_lock_icon.png" height="13px"></img>}></Badge> }</div>
                                    <div className="link_text">{item.name}</div>
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