import React from 'react'; 
import { TabMenu } from 'primereact/tabmenu';
import '../styles/ProjectOverview.scss'
import { useNavigate } from 'react-router-dom';

const ProjectOverview=({ DefaultProject })=> {
    const items = [
        {label: 'Overview',},
        {label: 'Analysis', },
        {label: 'Report', },
    ];

    return (
        <div className="OverviewSection">
            <h1> {DefaultProject}</h1>
            {/* <DisplayProject projects={projects} /> */}
            <button className="manage-btn">Manage Project</button>
            <TabMenu className='a ab' model={items} />
        </div>
    )
}
export default ProjectOverview;


