import React, { useState } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import '../styles/ProjectOverview.scss';
import Analysis from './Analysis';
import Settings from '../../settings/Components/Settings';
import ProjectCreation from './ProjectCreation'
import { useSelector } from 'react-redux';

const ProjectOverview = ({ }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const defaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const items = [
        { label: 'Overview' },
        { label: 'Analysis' },
        { label: 'Settings' },
    ];

    return (
        <div className="surface-card OverviewSection">
            <div className='DefaultProject'>
                {defaultselectedProject && defaultselectedProject.appType === "5db0022cf87fdec084ae49b6" && (<img src="static/imgs/Web.svg" alt="Web App Icon" height="30" />)}
                {defaultselectedProject && defaultselectedProject.appType === "5db0022cf87fdec084ae49b2" && (<img src="static/imgs/MobileWeb.svg" alt="Mobile App Icon" height="30" />)}
                {defaultselectedProject && defaultselectedProject.appType === "5db0022cf87fdec084ae49af" && (<img src="static/imgs/Desktop.svg" alt="Mobile App Icon" height="25" />)}
                {defaultselectedProject && defaultselectedProject.appType === "5db0022cf87fdec084ae49b7" && (<img src="static/imgs/WebService.svg" alt="Mobile App Icon" height="30" />)}
                {defaultselectedProject && defaultselectedProject.appType === "5db0022cf87fdec084ae49b4" && (<img src="static/imgs/SAP.svg" alt="Mobile App Icon" height="25" />)}
                {defaultselectedProject && defaultselectedProject.appType === "5db0022cf87fdec084ae49b3" && (<img src="static/imgs/OEBS.svg" alt="Mobile App Icon" height="28" width='35' />)}
                {defaultselectedProject && defaultselectedProject.appType === "5db0022cf87fdec084ae49b0" && (<img src="static/imgs/Mainframes.svg" alt="Mobile App Icon" height="23" width='18' />)}
                {defaultselectedProject && defaultselectedProject.appType === "5db0022cf87fdec084ae49b1" && (<img src="static/imgs/MobileApps.svg" alt="Mobile App Icon" height="25" />)}
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


