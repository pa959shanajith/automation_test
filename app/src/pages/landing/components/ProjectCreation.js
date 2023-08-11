import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import '../styles/ProjectCreation.scss';
import { useNavigate, Link } from 'react-router-dom';
import CreateProject from './CreateProject';
import VerticalSteps from './VerticalStpes';
import { useSelector } from 'react-redux';




const ProjectCreation = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [handleManageProject, setHandleManageProject] = useState(false)

  let userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
  if (!userInfo) userInfo = userInfoFromRedux;
  else userInfo = userInfo;

  const handleClick = () => {
    navigate("/admin");
  };

  const handleOpenDialog = () => {
    setVisible(true);
    setHandleManageProject(false)
  };

  const handleCloseDialog = () => {
    setVisible(false);
  };

  return (
    <>
      {/* {visible && <CreateProject setVisible={setVisible} />} */}
      <div className='p-4 surface-100 flex flex-column'>
        <div className='VerticalStepBox'>
          <VerticalSteps />
        </div>
        {/* <div className=" CreateProj-card"> */}
        {userInfo && userInfo.rolename === "Quality Manager" ? (
          <Card className="CreateProj-card" id='Createproj-title' title="Do you want to create a new project?" >
            <Button className="CreateProj_btn" size="small" onClick={handleOpenDialog} >Create Project</Button>
            <CreateProject visible={visible} onHide={handleCloseDialog} setHandleManageProject={setHandleManageProject} handleManageProject={handleManageProject} />
          </Card>) : null}
        {/* </div> */}

        {/* <div  className="gotoadmin-card">  */}

        {userInfo && userInfo.isadminuser === "true" ? (
        <Card className="gotoadmin-card" title="Wish to do some housekeeping today?">
          <div className="list_btns">
            <Link>   <li className="list1">Configure a new user</li></Link>
            <Link>   <li className="list1">Manage License</li></Link>
            <Link>   <li className="list1">Manage Elastic Execution Grid</li></Link>
          </div>
          <Button size="small" className='admin-btn' onClick={handleClick} > Go to Admin</Button>
        </Card>) : null}
        {/* </div> */}
      </div>
    </>

  )


}

export default ProjectCreation;
