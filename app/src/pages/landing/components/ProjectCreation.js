import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import '../styles/ProjectCreation.scss';
import { useNavigate, Link } from 'react-router-dom';
import CreateProject from './CreateProject';
import VerticalSteps from './VerticalSteps';
import { useSelector } from 'react-redux';
import { Tooltip } from 'primereact/tooltip';




const ProjectCreation = (props) => {
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
      {props.validateProjectLicense.status === 'fail' && <Tooltip target="#CreateDisable_Title" content={props.validateProjectLicense.message} position='bottom'/>}
      <div className='p-2 surface-100 flex flex-column' style={{overflow:"auto", height:'100vh'}}>
        <div className='VerticalStepBox'>
          <VerticalSteps />
        </div>
        {userInfo && userInfo.rolename === "Quality Manager" ? (
          <Card className="CreateProj-card" id='Createproj-title' title="Do you want to create a new project?" >
            <span id='CreateDisable_Title'><Button className="CreateProj_btn" size="small" onClick={handleOpenDialog} label='Create Project' disabled ={props.validateProjectLicense.status === 'fail'} /></span>
            <CreateProject 
            visible={visible} 
            onHide={handleCloseDialog} 
            setHandleManageProject={setHandleManageProject} 
            handleManageProject={handleManageProject}
            toastSuccess={props.toastSuccess}
            toastError={props.toastError}/>
          </Card>) : null}
        {userInfo && userInfo.isadminuser === true ? (
        <Card className="gotoadmin-card" title="Wish to do some housekeeping today?">
          <div className="list_btns">
            <Link>   <li className="list1">Configure a new user</li></Link>
            <Link>   <li className="list1">Manage License</li></Link>
            <Link>   <li className="list1">Manage Elastic Execution Grid</li></Link>
          </div>
          <Button size="small" className='admin-btn' onClick={handleClick} > Go to Admin</Button>
        </Card>) : null}
      </div>
    </>

  )


}

export default ProjectCreation;
