import React, { useState } from "react";
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import "../styles/projectSettings.scss";
import ManageIntegrations from './ManageIntegrations';




const Settings =() =>{
    const [manageIntegrationsvisible, manageIntegrationsSetVisible] = useState(false);

    const handleOpenDialog = () => {
        manageIntegrationsSetVisible(true); 
      };
    
      const handleCloseDialog = () => {
        manageIntegrationsSetVisible(false); 
      };

    return(
        <>
         <div className='p-4 surface-100 flex flex-column'>
         <div className='projSettings_cls'>
            <Card className="proj-card"   title="Manage project" >
            <div style={{ display: 'flex', alignItems: 'center',marginBottom:'0.5rem' }}>
                <p style={{fontSize:'14px'}}> Can change the name of the project, Can manage roles of the people, Can add or remove users from the project</p>
                </div>
                <div  className='image-settings'>
                <img src="static/imgs/manage_project_icon.svg" alt="project" style={{  width: '50px', height: '50px' }} />
                </div>
              <Button className="manageProj_btn" size="small" label='Manage Project'  ></Button> 
             
            </Card>
         </div>
           <div  className='projSettings_cls' >
           <Card className="proj-card" style={{height:'7rem'}}   title="Manage Integrations" >
           <div style={{ display: 'flex', alignItems: 'center',marginBottom:'0.5rem' }}>
            <p style={{ flex: '1',fontSize:'14px' }}>  jira, Zephyr,Azure DevOps, ALM, Qtest integration can be done</p>
            </div>
            <div className='image-integration'>
            <img src="static/imgs/manage_integration_icon.svg" alt="integration"  style={{ width: '50px', height: '50px' }} />
            </div>
             <Button className="manageProj1_btn" size="small" label='Manage Integrations' onClick={handleOpenDialog} ></Button> 
             <ManageIntegrations visible={manageIntegrationsvisible} onHide={handleCloseDialog} /> 
            
           </Card>
        </div>
          <div  className='projSettings_cls'>
          <Card className="proj-card"  title="Manage Configurations" >
          <div style={{ display: 'flex', alignItems: 'center',marginBottom:'0.5rem' }}>
            <p style={{ flex: '1',fontSize:'14px' }}> Can change the name of the project, Can manage roles of the people, Can add or remove users from the project</p>
            </div>
          <div className='image-config'>
                <img src="static/imgs/configaration-icon.png" alt="configuration" style={{  width: '50px', height: '50px' }} />
                </div>
            <Button className="manageProj2_btn" size="small" label='Manage Configuration' ></Button> 
            
          </Card>
       </div >
         <div className='projSettings_cls'>
         <Card className="proj-card"   title="Manage Email Notifictions" >
         <div style={{ display: 'flex', alignItems: 'center',marginBottom:'0.5rem' }}>
            <p style={{ flex: '1',fontSize:'14px' }}>Can change the name of the project, Can manage roles of the people, Can add or remove users from the project</p>
            </div>
            <div className='image-eamil'>
                <img src="static/imgs/manage_email_notification_icon.svg" alt="email"  style={{ width: '50px', height: '50px' }} />
                </div>
           <Button style={{width:'14rem'}} className="manageProj3_btn" size="small"  label='Manage Email Notifictions' ></Button> 
          
         </Card>
      </div>
      </div>
      </>




    )
}

export default Settings