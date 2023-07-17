import React, { useState } from "react";
import { Dialog } from 'primereact/dialog';
import { TabMenu } from 'primereact/tabmenu';
import { Dropdown } from 'primereact/dropdown';
import "../styles/manageIntegrations.scss";
import { InputText } from "primereact/inputtext";
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
         


const ManageIntegrations = ({ visible, onHide })=> {
    const [selectedIntegrationType, setSelectedIntegrationType] = useState(null);
    const [passeordValue, setPasswordValue] = useState('');
    const [value,setValue]=useState('');
    

    const integrationItems = [
        {label: 'AML'},
        {label: 'Cloud Based Integration'},
    ];

   
    const IntegrationTypes = [
        { name: 'jira', code: 'NY' },
        { name: 'Zephyr', code: 'RM' },
        { name: 'Azue DevOps', code: 'LDN' },
        { name: 'ALM', code: 'LDN' },
        { name: 'qTest', code: 'LDN' },
    ];
   
    const handleCloseManageIntegrations = () => {
           onHide();
    }
   
    const footerIntegrations = (
        <div className='btn-11'>
          <Button label="Next" severity="primary" className='btn1'  />
        </div>
      );


 return(
  <>
<div className="card flex justify-content-center">
            <Dialog header="Manage Integrations" visible={visible} style={{ width: '60vw',height:'40vw' }} onHide={handleCloseManageIntegrations} footer={footerIntegrations}>
            <div className="card">
            <TabMenu model={integrationItems} />
            </div>  
             <div className="dropdown-class ">
                <p style={{marginBottom:'0.5rem'}}>Select integration <span style={{color:'red'}}> *</span></p>
            <Dropdown value={selectedIntegrationType} onChange={(e) => setSelectedIntegrationType(e.value)} options={IntegrationTypes} optionLabel="name" 
                placeholder="Select an Integration Type" className="dropdown-integration " />
        </div>
        <div>
          <p style={{marginBottom:'0.5rem',marginTop:'0.5rem'}} className="login-cls">Login </p>
          <div className="input-cls">
          <span>Username <span style={{color:'red'}}>*</span></span>
            <span className="p-float-label" style={{marginLeft:'1.5rem'}}>
                <InputText style={{width:'20rem', height:'2.5rem'}} className="input-txt1" id="username" value={value} onChange={(e) => setValue(e.target.value)} />
                <label htmlFor="username">Username</label>
            </span>
            </div>
            <div className="passwrd-cls">
            <span>Password <span style={{color:'red'}}>*</span></span>
            <Password style={{width:'20rem', height:'2.5rem' , marginLeft:'2rem'}} className="input-txt1"value={passeordValue} onChange={(e) => setPasswordValue(e.target.passeordValue)} toggleMask />
            </div>
            <div className="url-cls">
            <span>URL <span style={{color:'red'}}>*</span></span>
            <span className="p-float-label" style={{marginLeft:'4.5rem'}}>
                <InputText  style={{width:'20rem', height:'2.5rem'}}className="input-txt1" id="URL" value={value} onChange={(e) => setValue(e.target.value)} />
                <label htmlFor="username">URL</label>
            </span>
            </div>

        </div>


            </Dialog>
        </div>

  </>
    )
}

export default ManageIntegrations;