import React from 'react';
import ProjectCreation from './ProjectCreation';
import DisplayProject from './DisplayProject';
import CreateProject from './CreateProject';
import VerticalSteps from './VerticalStpes';
import ProjectOverview from './ProjectOverview';
import '../styles/Project.scss'




const Project = ( props) => {
    return (
    <>
    
        {/* <VerticalSteps/> */}
        <div><ProjectOverview/></div>
        <div className='ProjectCreationAlignment'><ProjectCreation/></div>
  
    </>
    );
}

export default Project;