import React, { useMemo, useState, useRef} from "react";
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import "../styles/projectSettings.scss";
import ManageIntegrations from './ManageIntegrations';
import CreateProject from "../../landing/components/CreateProject";
import { useSelector} from 'react-redux';
import { Toast } from 'primereact/toast';




const Settings =() =>{
  const [manageIntegrationsvisible, manageIntegrationsSetVisible] = useState(false);
  const [handleManageProject, setHandleManageProject] = useState(false);
  let userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userInfoFromRedux = useSelector((state) => state.landing.userinfo);
  if (!userInfo) userInfo = userInfoFromRedux;
  else userInfo = userInfo;
  const isQualityManager = userInfo && userInfo.rolename === 'Quality Manager';
  const isQualityEngineer = userInfo && userInfo.rolename === 'Quality Engineer';
  const toast = useRef();



  const handleOpenDialog = () => {
    manageIntegrationsSetVisible(true);
  };

  const handleCloseDialog = () => {
    manageIntegrationsSetVisible(false);
  };

  const ManageProj = () => {
    setHandleManageProject(!handleManageProject);
  }
  const Integrations = useMemo(() => <ManageIntegrations visible={manageIntegrationsvisible} onHide={handleCloseDialog} />, [manageIntegrationsvisible, handleCloseDialog])

  const toastError = (erroMessage) => {
    if (erroMessage.CONTENT) {
      toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
  }

  const toastWarn = (warnMessage) => {
    if (warnMessage.CONTENT) {
      toast.current.show({ severity: warnMessage.VARIANT, summary: 'Warning', detail: warnMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'warn', summary: 'Warning', detail: warnMessage, life: 5000 });
  }

  const toastSuccess = (successMessage) => {
    if (successMessage.CONTENT) {
      toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
  }

  return (
    <>
      {handleManageProject && <CreateProject visible={handleManageProject} setHandleManageProject={setHandleManageProject} handleManageProject={handleManageProject} onHide={() => setHandleManageProject(false)} toastError={toastError} toastSuccess={toastSuccess} toastWarn={toastWarn} />}
      <div className='p-4 surface-100 flex flex-column' style={{ overflow: "auto" }}>

        <Toast ref={toast} position="bottom-center" baseZIndex={9999} />
        <div>
          <Card className="proj-card" title="Manage project"  >
            <div className="card_container">
              <div className="flex flex-column" style={{ alignItems: "start" }}>
                <span style={{ marginBottom: '0.5rem' }}>
                  <p className="sentence-cls" style={{ fontSize: '14px' }}> Can change the name of the project, can manage roles of the people, can add or remove users from the project</p>
                </span>
                <Button className="manageProj_btn" size="small" label='Manage Project' disabled={!isQualityManager} onClick={ManageProj} ></Button>
              </div>
              <div className='image-settings'>
                <img src="static/imgs/manage_project_icon.svg" alt="project" style={{ width: '50px', height: '50px' }} />
              </div>
            </div>

          </Card>

          <Card className="proj-card" title="Manage Integrations" >
            <div className="card_container">
              <div className="flex flex-column" style={{ alignItems: "start" }}>
                <span style={{ marginBottom: '0.5rem' }}>
                  <p className="sentence-cls" style={{ flex: '1', fontSize: '14px' }}> Jira, Zephyr, Azure DevOps, ALM, Qtest & Cloud ALM integration can be done</p>
                </span>
                <Button className="manageProj_btn" size="small" label='Manage Integrations' disabled={isQualityEngineer} onClick={handleOpenDialog} ></Button>
                {Integrations}
              </div>
              <div className='image-settings'>
                <img src="static/imgs/manage_integration_icon.svg" alt="integration" style={{ width: '50px', height: '50px' }} />
              </div>
            </div>
          </Card>

          <Card className="proj-card" title="Manage Configurations" >
            <div className="card_container">
              <div className="flex flex-column" style={{ alignItems: "start" }}>
                <span style={{ marginBottom: '0.5rem' }}>
                  <p className="sentence-cls" style={{ flex: '1', fontSize: '14px' }}> Can change the name of the project, can manage roles of the people, can add or remove users from the project</p>
                </span>
                <Button className="manageProj_btn" size="small" label='Manage Configuration' disabled='true' ></Button>
              </div>
              <div className='image-settings'>
                <img src="static/imgs/configaration-icon.png" alt="configuration" style={{ width: '50px', height: '50px' }} />
              </div>
            </div>
          </Card>

          <Card className="proj-card" title="Manage Email Notifications" >
            <div className="card_container">
              <div className="flex flex-column" style={{ alignItems: "start" }}>
                <span style={{ marginBottom: '0.5rem' }}>
                  <p className="sentence-cls" style={{ flex: '1', fontSize: '14px' }}>Can change the name of the project, can manage roles of the people, can add or remove users from the project</p>
                </span>
                <Button className="manageProj_btn" size="small" label='Manage Email Notifications' disabled='true'></Button>
              </div>
              <div className='image-settings'>
                <img src="static/imgs/manage_email_notification_icon.svg" alt="email" style={{ width: '50px', height: '50px' }} />
              </div>
            </div>
          </Card>
        </div>

      </div>
    </>




  )
}

export default Settings