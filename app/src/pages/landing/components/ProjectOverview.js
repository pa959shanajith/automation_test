import React from 'react'; 
import { TabMenu } from 'primereact/tabmenu';
import {Card} from 'primereact/card'
import { Button } from 'primereact/button';
import '../styles/ProjectOverview.scss'
import DisplayProject from './DisplayProject'


const ProjectOverview=({ DefaultProject })=> {
    const items = [
        {label: 'Overview'},
        {label: 'Analysis'},
        {label: 'Report'},
    ];

    return (
        <div className="OverviewSection">
            <h1> {DefaultProject}</h1>
            {/* <DisplayProject projects={projects} /> */}
            <button className="manage-btn">Manage Project</button>
            <TabMenu className='tab-menu' model={items} />
        </div>
    )
}
export default ProjectOverview;


