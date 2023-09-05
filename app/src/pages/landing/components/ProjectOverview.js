import React, { useState } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import '../styles/ProjectOverview.scss';
import Analysis from './Analysis';
import Settings from '../../settings/Components/Settings';
import ProjectCreation from './ProjectCreation'
import { useSelector } from 'react-redux';

const ProjectOverview = ({ }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    let defaultselectedProject = reduxDefaultselectedProject;

    const localStorageDefaultProject = localStorage.getItem('DefaultProject');
    if (localStorageDefaultProject) {
        defaultselectedProject = JSON.parse(localStorageDefaultProject);
    }
    const items = [
        { label: 'Overview' },
        { label: 'Analysis' },
        { label: 'Settings' },
    ];

    return (
        <div className="surface-card OverviewSection">
            <div className='DefaultProject'>
                {defaultselectedProject && defaultselectedProject.appType === "Web" && (<img src="static/imgs/Web.svg" alt="Web App Icon" height="35" />)}
                {defaultselectedProject && defaultselectedProject.appType === "MobileWeb" && (<img src="static/imgs/MobileWeb.svg" alt="Mobile App Icon" height="35" />)}
                {defaultselectedProject && defaultselectedProject.appType === "Desktop" && (<img src="static/imgs/Desktop.svg" alt="Mobile App Icon" height="35" />)}
                {defaultselectedProject && defaultselectedProject.appType === "Webservice" && (<img src="static/imgs/WebService.svg" alt="Mobile App Icon" height="35" />)}
                {defaultselectedProject && defaultselectedProject.appType === "SAP" && (<img src="static/imgs/SAP.svg" alt="Mobile App Icon" height="35" />)}
                {defaultselectedProject && defaultselectedProject.appType === "OEBS" && (<img src="static/imgs/OEBS.svg" alt="Mobile App Icon" height="35" width='45' />)}
                {defaultselectedProject && defaultselectedProject.appType === "Mainframe" && (<img src="static/imgs/Mainframes.svg" alt="Mobile App Icon" height="35" width='30' />)}
                {defaultselectedProject && defaultselectedProject.appType === "MobileApp" && (<img src="static/imgs/MobileApps.svg" alt="Mobile App Icon" height="35" width='30' />)}
                {defaultselectedProject && defaultselectedProject.appType === "System" && (<img src="static/imgs/System_application.svg" alt="Mobile App Icon" height="20" />)}
                <p className='DefaultProjectName'>{defaultselectedProject && defaultselectedProject.projectName}</p>
            </div>
            <TabMenu className='tab-menu' model={items} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} />
            {activeIndex === 0 && <ProjectCreation />}
            {activeIndex === 1 && <Analysis />}
            {activeIndex === 2 && <Settings />}
        </div>
    )
}
export default ProjectOverview;


