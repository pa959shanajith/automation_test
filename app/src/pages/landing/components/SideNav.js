import { React, useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Tooltip } from 'primereact/tooltip';
import PrimeReact from "primereact/api";
import { Badge } from 'primereact/badge';
import { Ripple } from 'primereact/ripple';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { useSelector } from 'react-redux';
import '../styles/SideNav.scss';


const SideNav = () => {
    PrimeReact.ripple = true;
    const [tabSelected, setTabSelected] = useState("/landing");
    const [disableIconDialogVisible, setDisableIconDialogVisible] = useState(false);
    const [filteredMenuItems, setFilteredMenuItems] = useState([]);
    const [tabForDashboard, setTabForDashboard] = useState("");
    const recipientEmail = 'support@avoautomation.com';

    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if (!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo;



    useEffect(() => {
        updateNavListItems();
    }, []);

    const menuItem = [
        {
            path: "/landing",
            name: "Projects",
            icon: <img src={tabSelected === "/landing" ? "static/imgs/folder_icon_selected.svg" : "static/imgs/folder_icon.svg"} className="icon" data-pr-tooltip="Create/View all your projects." data-pr-position="right" height="25px" />,
            disabled: false
        },
        {
            path: "/reports",
            name: "Reports",
            icon: <img src={tabSelected === "/reports" ? "static/imgs/report_icon_selected.svg" : "static/imgs/report_icon.svg"} className="icon" data-pr-tooltip=" View and analyze executed test automations." data-pr-position="right" height="25px" />,
            disabled: false
        },
        {
            path: "/utility",
            name: "Utilities",
            icon: <img src={tabSelected==="/utility" ? "static/imgs/Reports tab.svg" : "static/imgs/Reports tab.svg"} className="icon" data-pr-tooltip=" Manage utilities"  data-pr-position="right" height="25px"/>,
            disabled: false
        },
        {
            path: "/admin",
            name: "Admin",
            icon: <img src={tabSelected === "/admin" ? "static/imgs/admin_icon_selected.svg" : "static/imgs/admin_disabled_icon.svg"} className="icon" data-pr-tooltip="Manage/Create users, agents and other advanced configurations." data-pr-position="right" height="25px" />,
            disabled: false
        },
        {
            // path: "/itdm",
            name: "ITDM",
            icon: <img src={tabSelected === "/landing" ? "static/imgs/ITDM_icon.svg" : "static/imgs/ITDM_icon_selected.svg"} className="icon" data-pr-tooltip="Test Data Management Tool to create, modify and provision data" data-pr-position="right" height="25px" />,
            disabled: true
        },
        {
            // path: "/dashboard",
            name: "Dashboard",
            icon: <img src={tabForDashboard === "dashboard" ? "static/imgs/dashboardIcon.png" : "static/imgs/dashboard_disabled_icon.png"} className="icon" data-pr-tooltip="Access to Dash board." data-pr-position="right" height="25px" />,
            disabled: false
        },
    ]
    const onTabClickHandler = (event, route, disabled, name) => {
        if (!disabled) {setTabForDashboard(name);setTabSelected(route); }
        else {
            setDisableIconDialogVisible(true);
        };
        if (name === "dashboard") {
            window.open("/dashboard/#", '_blank');
            const dataHandledForDashBoard = {
                login: JSON.stringify({
                    SR: userInfo.rolename,
                    userinfo: userInfo,
                })
            };

            const finalDataForDashboard = JSON.stringify(dataHandledForDashBoard);  
            localStorage.setItem("Reduxbackup", finalDataForDashboard);
            // window.localStorage['Reduxbackup'] = finalDataForDashboard;
            window.localStorage['persist:login'] = window.localStorage['Reduxbackup']
            window.localStorage['integrationScreenType'] = null
            // window.localStorage['navigateScreen'] = 'dashboard';
            // window.location.href = "/dashboard";
        }
    }

    const itdmDialogHide = () => {
        setDisableIconDialogVisible(false)
    }

    const updateNavListItems = () => {
        if (userInfo.isadminuser) return setFilteredMenuItems(menuItem)
        else if (userInfo.role === "5db0022cf87fdec084ae49a9") return setFilteredMenuItems(menuItem.filter(item => item.name === "Admin"));
        else return setFilteredMenuItems(menuItem.filter(item => item.name !== "Admin"));
    }

    return (
        <>
            <div className="sidebar_container">
                <Tooltip target=".icon" mouseTrack mouseTrackLeft={20} />
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
                        filteredMenuItems.map((item, index) => (
                            <NavLink to={item.path} key={index} onClick={(e) => onTabClickHandler(e, item.path, item.disabled, item.name)} className={"p-ripple nav_item" + (item.disabled ? '_disabled' : '') + (item.name === "ITDM" && item.name === "ITDM" ? 'inactive' : '')} activeclassname={(item.name === "ITDM" || "dashboard" ? "inactive" : "active")} end>
                                <div className="flex flex-column w-full">
                                    <div className={item.name === "ITDM" ? "flex-row p-overlay-badge itdm_icon" : "icon flex-row p-overlay-badge"}>{item.icon} </div>
                                    <div className={item.name === "ITDM" ? "link_text itdm_icon" : "link_text"}>{item.name}</div>
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