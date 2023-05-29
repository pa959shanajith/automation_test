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
        <div className='p-4 surface-100 flex flex-column'>
          <div className='VerticalStepBox'>
          <VerticalSteps/>
          </div>
          {/* <div className=" CreateProj-card"> */}
            <Card className="CreateProj-card"  id='Createproj-title' title="Do you want to create a new project?" >
              <Button  size="small"  onClick={handleOpenDialog} >Create Project</Button> 
              <CreateProject visible={visible} onHide={handleCloseDialog} /> 
            </Card>
          {/* </div> */}

          {/* <div  className="gotoadmin-card">  */}
            <Card className="gotoadmin-card" title="Do you wish to do some housekeeping today?">
              <div className="list_btns">
                <Link>   <li className="list1">Configure a new user</li></Link> 
                <Link>   <li className="list1">Manage License</li></Link> 
                <Link>   <li className="list1">Manage Elastic Execution Grid</li></Link> 
              </div>
                <Button  size="small" className='admin-btn' onClick={handleClick} > Go to Admin</Button>
            </Card>
          {/* </div> */}
        </div>
    </>
   
    )


}

export default ProjectCreation;
