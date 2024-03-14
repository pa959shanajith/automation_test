import { useEffect, useState } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { AdminActions } from '../adminSlice';
import '../styles/AdminSidePanel.scss'
import { useDispatch, useSelector } from 'react-redux';

const AdminSidePanel = () => {
    const currentScreen = useSelector(state => state.admin.screen);
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
                            <li onClick={() => { setHeader('LDAP Configuration'); setScreen('ldapConf'); }} className={currentScreen === "ldapConf" ? "active_tab" : "not_active_tab"} >
                                <img src="static/imgs/ldap configuration.svg" alt="LDAP" style={{ marginRight: '0.5rem' }} />
                               <span className='ldap_label'> LDAP Configuration</span>
                            </li>

                            <li onClick={() => { setHeader('SAML Configuration'); setScreen('samlConf'); }} className={currentScreen === "samlConf" ? "active_tab" : "not_active_tab"}>
                                <img src="static/imgs/saml_configuration.svg" alt="SAML" style={{ marginRight: '0.5rem' }} />
                                <span className='saml_label'>SAML Configuration</span>
                            </li>

                            <li onClick={() => { setHeader('Open ID Connect Configuration'); setScreen('openIdConf'); }} className={currentScreen === "openIdConf" ? "active_tab" : "not_active_tab"}>
                                <img src="static/imgs/open id configuration.svg" alt="open_id_connect" style={{ marginRight: '0.5rem' }} />
                               <span className='openId_label'> Open ID Connect Configuration</span>
                            </li>
                        </ul>
                    </div>
                </AccordionTab>
                <AccordionTab header="User management">
                    <div className='flex flex-column pl-4 sidepanel_admin'>
                        <ul>
                            <li onClick={() => { setHeader('Users'); setScreen('users'); }} className={currentScreen === "users" ? "active_tab" : "not_active_tab"}>
                                <img src="static/imgs/user_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                               <span className='useers_label'>Users</span> 
                            </li>

                            <li onClick={() => { setHeader('License'); setScreen('license_details'); }} className={currentScreen === "license_details" ? "active_tab" : "not_active_tab"}>
                                <img src="static/imgs/license.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                                <span className='license_label'> License Details</span>
                            </li>
                        </ul>
                    </div>
                </AccordionTab>

                <AccordionTab header="Feature management">
                    <div className='flex flex-column pl-4 sidepanel_admin'>
                        <ul>
                        <li onClick={() => { setHeader('LLM Modal'); setScreen('LLM'); }} className={currentScreen === "LLM" ? "active_tab" : "not_active_tab"}>
                                <img src="static/imgs/LLM.png" alt="PNG Image" style={{ marginRight: '0.5rem' }} />
                               <span className='useers_label'>LLM Modal</span> 
                            </li>
                            <li onClick={() => { setHeader('AI Template'); setScreen('aitemplate'); }} className={currentScreen === "aitemplate" ? "active_tab" : "not_active_tab"}>
                                <img src="static/imgs/AI_Icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                               <span className='useers_label'>AI Template</span> 
                            </li>
                            <li onClick={() => { setHeader('Grid'); setScreen('grid_template'); }} className={currentScreen === "grid_template" ? "active_tab" : "not_active_tab"}>
                                <img src="static/imgs/AI_Icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                               <span className='useers_label'>Grid</span> 
                            </li>
                        </ul>
                    </div>
                </AccordionTab>
            </Accordion>
         
            <div className='flex flex-column pl-2 pr-1 m-1 sidepanel_admin'>
                <ul>
                    <li onClick={() => { setHeader('Email Server Configuration'); setScreen('email_server_configuration'); }} className={currentScreen === "email_server_configuration" ? "active_tab" : "not_active_tab"}>
                        <img src="static/imgs/email server configuration.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                       <span className='email_label' > Email Server Configuration</span>
                    </li>

                    <li onClick={() => { setHeader('Manage Agents'); setScreen('manage_agents'); }} className={currentScreen === "manage_agents" ? "active_tab" : "not_active_tab"}>
                        <img src="static/imgs/agent.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                       <span className='agent_label'>  Agents</span>
                    </li>

                    <li onClick={() => { setHeader('Grid'); setScreen('grid_configuration'); }} className={currentScreen === "grid_configuration" ? "active_tab" : "not_active_tab"}>
                        <img src="static/imgs/grid.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                        <span className='grid_label'>Grids</span>
                    </li>

                    <li onClick={() => { setHeader('Session Management'); setScreen('session_management'); }} className={currentScreen === "session_management" ? "active_tab" : "not_active_tab"}>
                        <img src="static/imgs/grid.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} />
                      <span className='session_label'> Session Management</span> 
                    </li>

                    <li onClick={() => { setHeader('Privileges'); setScreen('privileges'); }} className={currentScreen === "privileges" ? "active_tab" : "not_active_tab"}>
                        <img src="static/imgs/privileges.svg" alt="SVG Image" style={{ marginRight: '0.5rem', width: '1.5rem' }} />
                       <span className='privileges_label'>Privileges</span> 
                    </li>
                </ul>
            </div>
        </div>
    )
}
export default AdminSidePanel;