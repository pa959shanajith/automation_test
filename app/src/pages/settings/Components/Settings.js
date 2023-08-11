import React, { useMemo, useState } from "react";
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import "../styles/projectSettings.scss";
import ManageIntegrations from './ManageIntegrations';
import CreateProject from "../../landing/components/CreateProject";
import { useSelector} from 'react-redux';




const Settings =() =>{
    const [manageIntegrationsvisible, manageIntegrationsSetVisible] = useState(false);
    const [handleManageProject, setHandleManageProject ]= useState(false);
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo);
    if (!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo;

    const handleOpenDialog = () => {
        manageIntegrationsSetVisible(true); 
      };
    
      const handleCloseDialog = () => {
        manageIntegrationsSetVisible(false); 
      };

      const ManageProj=()=>{
        setHandleManageProject(!handleManageProject);
      }
      const Integrations = useMemo(() => <ManageIntegrations visible={manageIntegrationsvisible} onHide={handleCloseDialog} />,[manageIntegrationsvisible,handleCloseDialog])

    return(
        <>
         <div className='p-4 surface-100 flex flex-column'>
         <div className='projSettings_cls'>
            <Card className="proj-card" disabled={!(userInfo && userInfo.rolename === "Quality Manager")} title="Manage project" onClick={ManageProj} >
            <div style={{ display: 'flex', alignItems: 'center',marginBottom:'0.5rem' }}>
                <p className="sentence-cls" style={{fontSize:'14px'}}> Can change the name of the project, can manage roles of the people, can add or remove users from the project</p>
                </div>
                <div  className='image-settings'>
                <img src="static/imgs/manage_project_icon.svg" alt="project" style={{  width: '50px', height: '50px' }} />
                </div>
              <Button className="manageProj_btn" size="small" label='Manage Project' disabled={!(userInfo && userInfo.rolename === "Quality Manager")} ></Button> 
             
            </Card>
         </div>
         {handleManageProject && <CreateProject visible={handleManageProject} setHandleManageProject={setHandleManageProject} handleManageProject={handleManageProject} onHide={()=>setHandleManageProject(false)}/>}
           <div  className='projSettings_cls' >
           <Card className="proj-card"   title="Manage Integrations" >
           <div style={{ display: 'flex', alignItems: 'center',marginBottom:'0.5rem' }}>
            <p  className="sentence-cls" style={{ flex: '1',fontSize:'14px' }}>  jira, Zephyr,Azure DevOps, ALM, Qtest integration can be done</p>
            </div>
            <div className='image-integration'>
            <img src="static/imgs/manage_integration_icon.svg" alt="integration"  style={{ width: '50px', height: '50px' }} />
            </div>
             <Button className="manageProj1_btn" size="small" label='Manage Integrations' onClick={handleOpenDialog} ></Button> 
              {Integrations}
            
           </Card>
        </div>
          <div  className='projSettings_cls'>
          <Card className="proj-card"  title="Manage Configurations" >
          <div style={{ display: 'flex', alignItems: 'center',marginBottom:'0.5rem' }}>
            <p  className="sentence-cls" style={{ flex: '1',fontSize:'14px' }}> Can change the name of the project, can manage roles of the people, can add or remove users from the project</p>
            </div>
          <div className='image-config'>
                <img src="static/imgs/configaration-icon.png" alt="configuration" style={{  width: '50px', height: '50px' }} />
                </div>
            <Button className="manageProj2_btn" size="small" label='Manage Configuration' disabled='true' ></Button> 
            
          </Card>
       </div >
         <div className='projSettings_cls'>
         <Card className="proj-card"   title="Manage Email Notifications" >
         <div style={{ display: 'flex', alignItems: 'center',marginBottom:'0.5rem' }}>
            <p className="sentence-cls" style={{ flex: '1',fontSize:'14px' }}>Can change the name of the project, can manage roles of the people, can add or remove users from the project</p>
            </div>
            <div className='image-eamil'>
                <img src="static/imgs/manage_email_notification_icon.svg" alt="email"  style={{ width: '50px', height: '50px' }} />
                </div>
           <Button style={{width:'202px'}} className="manageProj3_btn" size="small"  label='Manage Email Notifications' disabled='true'></Button> 
          
         </Card>
      </div>
      </div>
      </>




    )
}

export default Settings