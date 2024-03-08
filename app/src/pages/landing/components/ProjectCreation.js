import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import '../styles/ProjectCreation.scss';
import { useNavigate, Link } from 'react-router-dom';
import CreateProject from './CreateProject';
import VerticalSteps from './VerticalSteps';
import { useSelector, useDispatch } from 'react-redux';
import { Tooltip } from 'primereact/tooltip';
import { geniusMigrate, showGenuis, showSmallPopup, migrateProject } from '../../global/globalSlice';
import "primeicons/primeicons.css";
import {loadUserInfoActions} from "../LandingSlice"


const ProjectCreation = (props) => {
  const dispatch=useDispatch();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [handleManageProject, setHandleManageProject] = useState(false)

  let userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
  if (!userInfo) userInfo = userInfoFromRedux;
  else userInfo = userInfo;
  const projectInfoFromRedux = useSelector((state) => state.landing.defaultSelectProject);

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
  const dummyData = [
    "Custom keyword 1",
    "Custom Keyword 2",
    "Custom Keyword 3",
  ];

  const keywordListElements = dummyData.map((item, index) => (
    <>
      <Card
        key={index}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "left",
          margin: "1rem",
          width: "96%",
        }}
      >
        <div
          className="flex justify-content-between flex-wrap"
          style={{ alignItems: "left", marginRight:'1rem'}}
        >
          <p
            style={{
              fontSize: "1.2rem",
              margin: "1rem 1rem 1rem 1rem",
              width: "max-content",
            }}
          >
            {index + 1}.{item}
          </p>
          <div className="flex align-self-end flex-wrap">
            <Button
              style={{
                background: "#1DA750",
                border: "1px #1DA750 solid",
                padding: "10px",
                height: "30px",
                borderRadius: "5px",
                margin: "1rem",
              }}
            >
              Approve
            </Button>
            <Button
              style={{
                padding: "10px",
                border: "1px #D9342B solid",
                background: "#D9342B",
                height: "30px",
                borderRadius: "5px",
                margin: "1rem",
              }}
            >
              Reject
            </Button>
            <i
              className="pi pi-eye"
              style={{ color: "#605BFF", fontSize: "25px", margin: "auto" }}
            />
          </div>
        </div>
      </Card>
    </>
  ));
  const handleMigration = () => {
    dispatch(geniusMigrate(true))
    dispatch(showGenuis({ showGenuisWindow: true, geniusWindowProps: {} }))
    dispatch(migrateProject(""))
  };
  const handleRepository=()=>{
    // navigate("/elementRepository");
    dispatch(loadUserInfoActions.setElementRepositoryIndex(3))
  }

  return (
    <>
      {props.validateProjectLicense.status === 'fail' && <Tooltip target="#CreateDisable_Title" content={props.validateProjectLicense.message} position='bottom'/>}
      <div className='p-2 surface-100 flex flex-column' style={{overflow:"scroll", height:'100vh'}}>
        <div className='VerticalStepBox'>
          <VerticalSteps />
        </div>
        {userInfo && userInfo.rolename === "Quality Manager" ? (
          <>
            <Card
              className="CreateProj-card"
              id="Createproj-title"
              title="Create new element repository"
            >
              <Button
                className="CreateProj_btn"
                size="small"
                onClick={handleRepository}
              >
                Create 
              </Button>
              {/* <CreateProject
                visible={visible}
                onHide={handleCloseDialog}
                setHandleManageProject={setHandleManageProject}
                handleManageProject={handleManageProject}
                toastSuccess={props.toastSuccess}
                toastError={props.toastError}
              /> */}
              
            </Card>
          </>
        ) : null}

        {/* Commented for future use of custom keyword */}
        {/* {userInfo && userInfo.rolename !== "Test Engineer" ? (
          <Card
            className="reviewkeywords"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "left",
              margin: "0 0 1rem 0.75rem",
              width: "98%",
            }}
          >
            <div
              className="flex justify-content-between flex-wrap"
              style={{ alignItems: "left" }}
            >
              <p
                style={{
                  font: "700 1.5625rem/2rem Open Sans",
                  alignItems: "left",
                  margin: "1rem 0 0 1.5rem",
                }}
              >
                Pending Reviews
              </p>

              <Button
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  margin: "0.5rem 0.5rem 0.5rem 1.5rem",
                  alignSelf: "flex-end",
                }}
              >
                Approve all
              </Button>
            </div>

            <ol>{keywordListElements}</ol>
          </Card>
        ) : null} */}

        {/* {userInfo && userInfo.isadminuser === true ? (
          <Card
            className="gotoadmin-card"
            title="Wish to do some housekeeping today?"
          >
            <div className="list_btns">
              <Link>
                {" "}
                <li className="list1">Configure a new user</li>
              </Link>
              <Link>
                {" "}
                <li className="list1">Manage License</li>
              </Link>
              <Link>
                {" "}
                <li className="list1">Manage Elastic Execution Grid</li>
              </Link>
            </div>
            <Button size="small" className='admin-btn' onClick={handleClick} > Go to Admin</Button>
        </Card>) : null} */}
        <Card
        className="gotoadmin-card"
        title="Create test cases using AI"
        >
          <div>
           <Button size="small" className='admin-btn'  > create</Button>
           </div>
        </Card>
        {/* {
          (userInfo && userInfo?.rolename === "Quality Manager") && (projectInfoFromRedux && projectInfoFromRedux?.appType === "Web") && <Card className="gotoadmin-card" title="Want to migrate from Non Avo Automation to Avo Automation?">
            <Button className="CreateProj_btn m-3" size="small" onClick={handleMigration} label='Migrate' disabled={props.validateProjectLicense.status === 'fail'} />
          </Card>
} */}
      </div>
    </>

  );


};

export default ProjectCreation;
