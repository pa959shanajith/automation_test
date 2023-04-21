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
        setVisible(true); // Set the state to show the dialog
      };
    
      const handleCloseDialog = () => {
        setVisible(false); // Set the state to hide the dialog
      };

    return(
    <>
        {/* {visible && <CreateProject setVisible={setVisible} />} */}
        <div style={{overflow:'scroll',height:'71vh'}}>
        <VerticalSteps/>
        
        <div  className=" CreateProj-card">
    <Card  style={{height : '7rem'}} id='Createproj-title' title="Do you want to create a new project?" >
        <div className="card flex justify-content-center">
            <Button  className='projbtn'label="Create Project" onClick={handleOpenDialog}  />
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
        <div className="card flex justify-content-center">
        <Button className='admin-btn' label="Go to Admin" onClick={handleClick} />
        </div>
        </Card>
        </div>
        </div>
        
    </>
   
    )


}

export default ProjectCreation;
