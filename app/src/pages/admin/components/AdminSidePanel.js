import { useEffect, useState } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { AdminActions } from '../adminSlice';
import '../styles/AdminSidePanel.scss'
import { useDispatch, useSelector } from 'react-redux';

const AdminSidePanel = () => {
    const Currentscreen = useSelector(state => state.admin.screen);
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
                    <div className='flex flex-column pl-4 sidepanel_admin'>
                        <ul>
                            <li onClick={() => { setHeader('LDAP Configuration'); setScreen('ldapConf'); }} className={Currentscreen === "ldapConf" ? "active_tab" : "not_active_tab"} >
                                <img src="static/imgs/ldap_configuration_icon.svg" alt="LDAP" style={{ marginRight: '0.5rem' }} />
                                LDAP Configuration
                            </li>

                            <li onClick={() => { setHeader('SAML Configuration'); setScreen('samlConf'); }} className={Currentscreen === "samlConf" ? "active_tab" : "not_active_tab"}>
                                <img src="static/imgs/saml_configuration_icon.svg" alt="SAML" style={{ marginRight: '0.5rem' }} />
                                SAML Configuration
                            </li>

                            <li onClick={() => { setHeader('Open ID Connect Configuration'); setScreen('openIdConf'); }} className={Currentscreen === "openIdConf" ? "active_tab" : "not_active_tab"}>
                                <img src="static/imgs/openid_connect_icon.svg" alt="open_id_connect" style={{ marginRight: '0.5rem' }} />
                                Open ID Connect Configuration
                            </li>
                        </ul>
                    </div>
                </AccordionTab>
                <AccordionTab header="User management">
                    <div className='flex flex-column pl-4 sidepanel_admin'>
                        <ul>
                            <li onClick={() => { setHeader('Users'); setScreen('users'); }} className={Currentscreen === "users" ? "active_tab" : "not_active_tab"}>
                                <img src="static/imgs/users_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                                Users
                            </li>

                            <li onClick={() => { setHeader('License'); setScreen('license_details'); }} className={Currentscreen === "license_details" ? "active_tab" : "not_active_tab"}>
                                <img src="static/imgs/license_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                                License Details
                            </li>
                        </ul>
                    </div>
                </AccordionTab>
            </Accordion>
            <div className='flex flex-column pl-2 pr-1 m-1 sidepanel_admin'>
                <ul>
                    <li onClick={() => { setHeader('Email Server Configuration'); setScreen('email_server_configuration'); }} className={Currentscreen === "email_server_configuration" ? "active_tab" : "not_active_tab"}>
                        <img src="static/imgs/email_server_configuration_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                        Email Server Configuration
                    </li>

                    <li onClick={() => { setHeader('Manage Agents'); setScreen('manage_agents'); }} className={Currentscreen === "manage_agents" ? "active_tab" : "not_active_tab"}>
                        <img src="static/imgs/agent_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                        Manage Agents
                    </li>

                    <li onClick={() => { setHeader('Grid'); setScreen('grid'); }} className={Currentscreen === "grid" ? "active_tab" : "not_active_tab"}>
                        <img src="static/imgs/license_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                        Grids
                    </li>

                    <li onClick={() => { setHeader('Session Management'); setScreen('session_management'); }} className={Currentscreen === "session_management" ? "active_tab" : "not_active_tab"}>
                        <img src="static/imgs/users_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem', width: '2rem' }} />
                        Session Management
                    </li>

                    <li onClick={() => { setHeader('Privileges'); setScreen('privileges'); }} className={Currentscreen === "privileges" ? "active_tab" : "not_active_tab"}>
                        <img src="static/imgs/privileges_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem', width: '1.5rem' }} />
                        Privileges
                    </li>
                </ul>
            </div>
        </div>
    )
}
export default AdminSidePanel;