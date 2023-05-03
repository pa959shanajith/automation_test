import React from 'react'; 
import { TabMenu } from 'primereact/tabmenu';
import '../styles/ProjectOverview.scss';

const ProjectOverview=({ DefaultProject })=> {
    const items = [
        {label: 'Overview'},
        {label: 'Analysis' },
        {label: 'Report'},
    ];

    return (
        <div className="OverviewSection">
            <h1> {DefaultProject}</h1>
            <button className="manage-btn">Manage Project</button>
            <TabMenu className='tab-menu' model={items} />
        </div>
    )
}
export default ProjectOverview;


