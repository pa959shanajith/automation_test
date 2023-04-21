import React, { useState, useRef} from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import '../styles/ProjectCreation.scss';
import { useNavigate , Link} from 'react-router-dom';
import CreateProject from './CreateProject';
import VerticalSteps from './VerticalStpes';




const  ProjectCreation=() =>{
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false );


    const handleClick = () => {
        navigate("/admin");
      };

    const handleOpenDialog = () => {
        setVisible(true); 
      };
    
      const handleCloseDialog = () => {
        setVisible(false); 
      };

    return(
    <>
        {/* {visible && <CreateProject setVisible={setVisible} />} */}
        <div style={{overflow:'scroll',height:'71vh'}}>
        <VerticalSteps/>
        
        <div  className=" CreateProj-card">
    <Card  style={{height : '7rem'}} id='Createproj-title' title="Do you want to create a new project?" >
        <div >
            <button className='projbtn' onClick={handleOpenDialog} > Create Project </button> 
         </div>
        <CreateProject visible={visible} onHide={handleCloseDialog} /> 
        </Card>
        </div>
        <div  className="gotoadmin-card"> 
        <Card  style={{height : '8rem'}} title="Do you wish to do some housekeeping today?">
            <div className="list_btns">
            <Link>  <li className="list1">Configure a new user</li></Link> 
            <Link>   <li className="list1">Manage License</li></Link> 
            <Link>   <li className="list1">Manage Elastic Execution Grid </li></Link> 
            </div>
        <div >
        <button className='admin-btn'  onClick={handleClick} > Go to Admin</button>
        </div>
        </Card>
        </div>
        </div>
        
    </>
   
    )


}

export default ProjectCreation;
