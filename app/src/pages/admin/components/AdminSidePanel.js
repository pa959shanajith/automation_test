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
                        <Button onClick={() => { setHeader('LDAP Configuration'); setScreen('ldapConf'); }}>LDAP Configuration</Button>
                        <Button onClick={() => { setHeader('SAML Configuration'); setScreen('samlConf'); }}>SAML Configuration</Button>
                        <Button onClick={() => { setHeader('Open ID Connect Configuration'); setScreen('openIdConf'); }}>Open ID Connect Configuration</Button>
                    </div>
                </AccordionTab>
                <AccordionTab header="User management">
                    <div className='flex flex-column pl-4'>
                        <Button onClick={() => { setHeader('Users'); setScreen('Users'); }}>Users</Button>
                        <Button onClick={() => { setHeader('License'); setScreen('License Details'); }}>License Details</Button>
                    </div>
                </AccordionTab>
            </Accordion>
            <div className='flex flex-column pl-2 pr-1 m-1'>
            <Button className="email_button" onClick={() => { setHeader('Email Server Configuration'); setScreen('Email Server Configuration'); }}>Email Server Configuration</Button>
            </div>
            <div className='flex flex-column p-2 pr-1 m-1'>
            <Button className='Agent_btn' onClick={() => { setHeader('Manage Agents'); setScreen('Manage Agents'); }}>Manage Agents</Button>
            </div>
            <div className='flex flex-column p-2 pr-1 m-1'>
            <Button className='Session_btn' onClick={() => { setHeader('SessionManagement'); setScreen('SessionManagement'); }}>Session Management</Button>
            <Button className='prefer_btn' onClick={() => { setHeader('Privileges'); setScreen('Privileges'); }}>Privileges</Button>
            </div>
        </div>
    )
}
export default AdminSidePanel;