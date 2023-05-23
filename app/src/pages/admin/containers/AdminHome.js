import React ,  { useState } from 'react';
import LeftPanel from './LeftPanel';
import CreateUser from './CreateUser';
import Project from './Project';
import ProjectAssign from './ProjectAssign';
import OidcConfig from './OidcConfig'
import GitConfig from './GitConfig'
import AvoDiscoverConfig from './AvoDiscoverConfig';
import SamlConfig from './SamlConfig';
import Preferences from './Preferences';
import SessionManagement from './SessionManagement';
import CreateIcePool from './CreateIcePool';
import IceProvision from './IceProvision';
import TokenManagement from './TokenMangement';
import LdapConfig from './LdapConfig';
import EmailConfig from './EmailConfig';
import CreateEmailGroup from './CreateEmailGroup';
import Agents from './Agents';
import AllocateIcePool from './AllocateIcePool';
import {Header,FooterTwo,ReferenceBar} from '../../global';
import '../styles/AdminHome.scss';
import LicenseManagement from './LicenseManagement';

/*Component AdminHome
  use: renders Admin landing page (footer,header,sidebars,middle saection)
  todo: 
*/

const AdminHome = () => {
  const [middleScreen,setMiddleScreen] = useState("createUser")
  const [showEditUser,setShowEditUser] = useState(false)
  const [resetMiddleScreen,setResetMiddleScreen] =useState({tokenTab:true,provisionTa:true,Preferences:true,sessionTab:true,gitConfigure:true,ldapConfigTab:true,createUser:true,projectTab:true,assignProjectTab:true,samlConfigTab:true,oidcConfigTab:true,emailGroupTab:true, LicenseManagement:true})
  return (
    <>
    <div className='admin-container'>
        <Header />
        <div className="admin__mid_section">
            <LeftPanel resetMiddleScreen={resetMiddleScreen} setResetMiddleScreen={setResetMiddleScreen} middleScreen={middleScreen} setMiddleScreen={setMiddleScreen} setShowEditUser={setShowEditUser}/>
            <div id="middle-content-section">
                <div className="abs-div">
                    <div className="min-h">
                        <div className='admin-container-wrap'>
                            <div className="containerWrap admin-containerWrap-pad ">
                                {(middleScreen==="createUser")?<CreateUser resetMiddleScreen={resetMiddleScreen} showEditUser={showEditUser} setShowEditUser={setShowEditUser} setMiddleScreen={setMiddleScreen} middleScreen={middleScreen}/>:null}
                                {(middleScreen==="tokenTab")?<TokenManagement resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/> :null}
                                {(middleScreen==="provisionTa")?<IceProvision resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen} />:null}
                                {(middleScreen==="projectTab")?<Project resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
                                {(middleScreen==="assignProjectTab")?<ProjectAssign resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
                                {(middleScreen==="CreateIcePool")?<CreateIcePool resetMiddleScreen={resetMiddleScreen}/>:null}
                                {(middleScreen==="AllocateIcePool")?<AllocateIcePool resetMiddleScreen={resetMiddleScreen}/>:null}
                                {(middleScreen==="avoDiscoverConfigTab")?<AvoDiscoverConfig resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
                                {(middleScreen==="gitConfigure")?<GitConfig resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
                                {(middleScreen==="ldapConfigTab")?<LdapConfig resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
                                {(middleScreen==="samlConfigTab")?<SamlConfig resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen} />:null}
                                {(middleScreen==="oidcConfigTab")?<OidcConfig resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen} />:null}
                                {(middleScreen==="emailConfigTab")?<EmailConfig resetMiddleScreen={resetMiddleScreen}/>:null}
                                {(middleScreen==="emailGroupTab")?<CreateEmailGroup resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen} />:null}
                                {(middleScreen==="agents")?<Agents resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen} />:null}
                                {(middleScreen==="sessionTab")?<SessionManagement resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen}  />:null}
                                {(middleScreen==="Preferences")?<Preferences resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen} />:null}
                                {(middleScreen==="LicenseManagement")?<LicenseManagement resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen}/>:null}
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