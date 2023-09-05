import { useEffect, useState } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { AdminActions } from '../adminSlice';
import '../styles/AdminSidePanel.scss'
import { useDispatch } from 'react-redux';

const AdminSidePanel = () => {

    const [header, setHeader] = useState('');
    const [screen, setScreen] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(AdminActions.Header(header))
        dispatch(AdminActions.SetScreen(screen))
    }, [header]);

    return (
        <div className="admin_nav card flex flex-column ">
            <Accordion multiple activeIndex={0}>
                <AccordionTab header="Authentication Configuration">
                    <div className='flex flex-column pl-4'>
                        <Button onClick={() => { setHeader('LDAP Configuration'); setScreen('ldapConf');}}><img src="static/imgs/ldap_configuration_icon.svg" alt="SVG Image" style={{marginRight:'0.5rem'}}/>LDAP Configuration</Button>
                        <Button onClick={() => { setHeader('SAML Configuration'); setScreen('samlConf');}}><img src="static/imgs/saml_configuration_icon.svg" alt="SVG Image" style={{marginRight:'0.5rem'}}/>SAML Configuration</Button>
                        <Button onClick={() => { setHeader('Open ID Connect Configuration'); setScreen('openIdConf'); }}><img src="static/imgs/openid_connect_icon.svg" alt="SVG Image" style={{marginRight:'0.5rem'}}/>Open ID Connect Configuration</Button>
                    </div>
                </AccordionTab>
                <AccordionTab header="User management">
                    <div className='flex flex-column pl-4'>
                        <Button onClick={() => { setHeader('Users'); setScreen('Users');  }}><img src="static/imgs/users_icon.svg" alt="SVG Image" style={{marginRight:'0.5rem'}}/>Users</Button>
                        <Button onClick={() => { setHeader('License'); setScreen('License Details');  }}><img src="static/imgs/license_icon.svg" alt="SVG Image" style={{marginRight:'0.5rem'}}/>License Details</Button>
                    </div>
                </AccordionTab>
            </Accordion>
            <div className='flex flex-column pl-2 pr-1 m-1'>
            <Button className="email_button" onClick={() => { setHeader('Email Server Configuration'); setScreen('Email Server Configuration'); }}><img src="static/imgs/email_server_configuration_icon.svg" alt="SVG Image" style={{marginRight:'0.5rem'}} />Email Server Configuration</Button>
            </div>
            <div className='flex flex-column p-2 pr-1 m-1'>
            <Button className='Agent_btn' onClick={() => { setHeader('Manage Agents'); setScreen('Manage Agents'); }}><img src="static/imgs/agent_icon.svg" alt="SVG Image" style={{marginRight:'0.5rem'}}/>Manage Agents</Button>
            <Button className='Agent_btn' onClick={() => { setHeader('Grid'); setScreen('Grid'); }}><img src="static/imgs/agent_icon.svg" alt="SVG Image" style={{marginRight:'0.5rem'}}/>Grids</Button>
            </div>
            <div className='flex flex-column p-2 pr-1 m-1'>
            <Button className='Session_btn' onClick={() => { setHeader('Session Management');  setScreen('SessionManagement'); }}><img src="static/imgs/users_icon.svg" alt="SVG Image" style={{marginRight:'0.5rem',width:'2rem'}}/>Session Management</Button>
            <Button className='prefer_btn' onClick={() => { setHeader('Privileges'); setScreen('Privileges');   }}><img src="static/imgs/privileges_icon.svg" alt="SVG Image" style={{marginRight:'0.5rem',width:'1.5rem'}}/>Privileges</Button>
            </div>
        </div>
    )
}
export default AdminSidePanel;