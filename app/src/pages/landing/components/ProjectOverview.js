import React, {useState} from 'react'; 
import { TabMenu } from 'primereact/tabmenu';
import '../styles/ProjectOverview.scss';
import Analysis from './Analysis';
import Settings from '../../settings/Components/Settings';
import ProjectCreation from './ProjectCreation'

const ProjectOverview=({ })=> {
    const [activeIndex, setActiveIndex] = useState(0);
    const items = [
        {label: 'Overview'},
        {label: 'Analysis' },
        {label: 'Settings'},
    ];

    return (
        <div className="surface-card OverviewSection">
            {/* <h1> {props.defaultProject}</h1> */}
            {/* <button className="manage-btn">Manage Project</button> */}
            <TabMenu className='tab-menu' model={items} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}/>
                {activeIndex === 0 && <ProjectCreation/>}
                {activeIndex === 1 && <Analysis/> }
                {activeIndex === 2 && <Settings/> }
        </div>
    )
}
export default ProjectOverview;


