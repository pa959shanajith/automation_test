import React ,  { useState } from 'react';
import LeftPanel from './LeftPanel';
import CreateUser from './CreateUser';
import Project from './Project';
import ProjectAssign from './ProjectAssign';
import OidcConfig from './OidcConfig'
import GitConfig from './GitConfig'
import SamlConfig from './SamlConfig';
import Preferences from './Preferences';
import SessionManagement from './SessionManagement';
import CreateIcePool from './CreateIcePool';
import IceProvision from './IceProvision';
import TokenManagement from './TokenMangement';
import LdapConfig from './LdapConfig';
import EmailConfig from './EmailConfig';
import AllocateIcePool from './AllocateIcePool';
import {Header,FooterTwo,ReferenceBar,PopupMsg} from '../../global';
import '../styles/AdminHome.scss';

/*Component AdminHome
  use: renders Admin landing page (footer,header,sidebars,middle saection)
  todo: 
*/

const AdminHome = () => {
  const [middleScreen,setMiddleScreen] = useState("createUser")
  const [showEditUser,setShowEditUser] = useState(false)
  const [popupState,setPopupState] = useState({show:false,title:"",content:""});
  const [resetMiddleScreen,setResetMiddleScreen] =useState({tokenTab:true,provisionTa:true,Preferences:true,sessionTab:true,gitConfigure:true,ldapConfigTab:true,createUser:true,projectTab:true,assignProjectTab:true,samlConfigTab:true,oidcConfigTab:true})
  return (
    <>
    {popupState.show || popupState.content || popupState.CONTENT ?<PopupMsg variant={popupState.variant || popupState.VARIANT } content={popupState.content || popupState.CONTENT} close={()=>setPopupState({show:false})} />:null}
    <div className='admin-container'>
        <Header />
        <div className="admin__mid_section">
            <LeftPanel resetMiddleScreen={resetMiddleScreen} setResetMiddleScreen={setResetMiddleScreen} middleScreen={middleScreen} setMiddleScreen={setMiddleScreen} setShowEditUser={setShowEditUser}/>
            <div id="middle-content-section">
                <div className="abs-div">
                    <div className="min-h">
                        <div className='admin-container-wrap'>
                            <div className="containerWrap admin-containerWrap-pad ">
                                {(middleScreen==="createUser")?<CreateUser setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen} showEditUser={showEditUser} setShowEditUser={setShowEditUser} setMiddleScreen={setMiddleScreen} middleScreen={middleScreen}/>:null}
                                {(middleScreen==="tokenTab")?<TokenManagement setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/> :null}
                                {(middleScreen==="provisionTa")?<IceProvision setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen} />:null}
                                {(middleScreen==="projectTab")?<Project setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
                                {(middleScreen==="assignProjectTab")?<ProjectAssign setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
                                {(middleScreen==="CreateIcePool")?<CreateIcePool setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen}/>:null}
                                {(middleScreen==="AllocateIcePool")?<AllocateIcePool setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen}/>:null}
                                {(middleScreen==="gitConfigure")?<GitConfig setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
                                {(middleScreen==="ldapConfigTab")?<LdapConfig popupState={popupState} setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
                                {(middleScreen==="samlConfigTab")?<SamlConfig setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen} />:null}
                                {(middleScreen==="oidcConfigTab")?<OidcConfig setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen} />:null}
                                {(middleScreen==="emailConfigTab")?<EmailConfig setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen}/>:null}
                                {(middleScreen==="sessionTab")?<SessionManagement setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen}  />:null}
                                {(middleScreen==="Preferences")?<Preferences setPopupState={setPopupState} resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen} />:null}
                            </div>
                        </div>
                    </div>    
                </div>
            </div>  
            <ReferenceBar taskTop={false} hideInfo={true} hideTask={true}/>
        </div>
        <div className='admin-footer'><FooterTwo /></div>
    </div>
    </>
  );
}

export default AdminHome;