import React, { useState, useRef} from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import '../styles/CreateProject.scss';
// import { useNavigate , Link} from 'react-router-dom';
import CreateProject from './CreateProject';




const  ProjectCreation=() =>{
    // const navigate = useNavigate();
    const [visible, setVisible] = useState(false );


    // const handleClick = () => {
    //     navigate("/admin");
    //   };

    return(
    <>
        {visible && <CreateProject setVisible={setVisible} />}
        <Card className="card flex justify-content-center CreateProj-card" title="Do you want to create a new project?">
        <div className="card flex justify-content-center">
            <Button  className='projbtn'label="Create Project" onClick={() => setVisible(true)}  />
        </div>
        </Card>

        <Card className="card flex justify-content-center mt-4 gotoadmin-card"  title="Do you wish to do some housekeeping today?">
            <div className="list_btns">
                <li className="list1">Configure a new user</li>
                <li className="list1">Manage License</li>
                <li className="list1">Manage Elastic Execution Grid </li>
            </div>
        <div className="card flex justify-content-center">
        <Button className='projbtn' label="Go to Admin"  />
        </div>
        </Card>

    </>
    )


}

export default ProjectCreation;
