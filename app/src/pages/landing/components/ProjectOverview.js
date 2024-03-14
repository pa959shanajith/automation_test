import React, { useState } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import '../styles/ProjectOverview.scss';
import Analysis from './Analysis';
import Settings from '../../settings/Components/Settings';
import ProjectCreation from './ProjectCreation'
import CustomKeyword from './CustomKeyword';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from 'primereact/tooltip';
import ElementRepository from './ElementRepository';
import AiTestcase from './Aitestcase';
import DisplayProject from './DisplayProject';
import {loadUserInfoActions} from '../LandingSlice';

const ProjectOverview = (props) => {
    // const [activeIndex, setActiveIndex] = useState(0);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const [elementRepository, setElementRepository] = useState(false);
    let defaultselectedProject = reduxDefaultselectedProject;
    const [overlay, setOverlay] = useState(null);
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState();
    const dispatch = useDispatch()
    const collapseSideBar = useSelector((state) => state.landing.collapseSideBar);
    const activeIndex = useSelector((state) => state.landing.setElementRepositoryIndex);
   

    const localStorageDefaultProject = localStorage.getItem('DefaultProject');
    if (localStorageDefaultProject) {
        defaultselectedProject = JSON.parse(localStorageDefaultProject);
    }

    const handleElementRepository = () =>{
        setElementRepository(true);
        setOverlay("Loading Element Repository")
    }
    const items = [
        { label: 'Overview' },
        { label: 'Analysis' },
        { label: 'Settings' },
        { label: 'Element Repository', command: ()=>handleElementRepository()},
        { label: 'AI Testcase' },
        // { label: 'Capabalities'},
    ];
    const handleToggleCollapse = () => {
        setIsHeaderCollapsed(!isHeaderCollapsed);
        dispatch(loadUserInfoActions.collapseSideBar(!collapseSideBar))
      };

    return (
        <div className="surface-100 OverviewSection">
            <div className='flex flex-column'>
                <div className='DefaultProject'>
                <div className={collapseSideBar?"collapse_click":"collaps_btn"} onClick={handleToggleCollapse}>
                    <img src="static/imgs/CollapseButForLefPanel.png" className="collaps_btn" />
                </div> 
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
                    <Tooltip target=".DefaultProjectName" content={defaultselectedProject.projectName} position='bottom'/>
                </div>
                <TabMenu className='tab-menu' model={items} activeIndex={activeIndex} onTabChange={(e) =>  dispatch(loadUserInfoActions.setElementRepositoryIndex(e.index))} />
            </div>
            {activeIndex === 0 && <ProjectCreation validateProjectLicense={props.validateProjectLicense} toastError={props.toastError} toastSuccess={props.toastSuccess} />}
            {activeIndex === 1 && <Analysis />}
            {activeIndex === 2 && <Settings />}
            {activeIndex === 3 && <ElementRepository setOverlay={setOverlay} overlay={overlay}/>}
            {activeIndex === 4 && <AiTestcase/>}
            {activeIndex === 5 && <CustomKeyword toastError={props.toastError} toastSuccess={props.toastSuccess} toastWarn={props.toastWarn}/>}
        </div>
    )
}
export default ProjectOverview;


