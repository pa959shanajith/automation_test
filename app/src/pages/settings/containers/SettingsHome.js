
import React, {useState} from 'react';
import { Header, FooterTwo as Footer, ReferenceBar } from '../../global'
import LeftPanelBar from './LeftPanelBar'
import EditUser from './EditUser'
import UserTokenMgmt from './UserTokenMgmt'
import UserIceProvision from './UserIceProvision'
import UserProject from './UserProject'
import UserGitConfig from './UserGitConfig'
import UserJiraConfig from './UserJiraConfig'
import UserZephyrConfig from './UserZephyrConfig'
import UserAzureconfig from './UserAzureConfig'
import UserSaucelabconfig from "./UserSaucelabsconfig"

import '../styles/SettingsHome.scss'

/*Component SettingsHome
  use: Provides user option to update their user configeration 
  props: None
  todo: 
    
*/

const SettingsHome = () => {
    const [middleScreen,setMiddleScreen] = useState("editUser");  
    const [resetMiddleScreen,setResetMiddleScreen] =useState({editUser:true});
    return (
        <div className='uc__container'>
            <Header />
            <div className='uc__body'>
                <LeftPanelBar setMiddleScreen={setMiddleScreen} resetMiddleScreen={resetMiddleScreen} setResetMiddleScreen={setResetMiddleScreen} middleScreen={middleScreen}/>
                <div className='uc__middle_container'>
                    {middleScreen=== "editUser" &&  <EditUser resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen} middleScreen={middleScreen}/>}
                    {(middleScreen==="tokenTab") && <UserTokenMgmt resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen} middleScreen={middleScreen}/>}
                    {(middleScreen==="provisionTa") && <UserIceProvision resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen} />}
                    {(middleScreen==="projectTab") && <UserProject resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>}
                    {(middleScreen==="gitConfigure") && <UserGitConfig resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>}
                    {(middleScreen==="jiraConfigure") && <UserJiraConfig resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>}
                    {(middleScreen==="SauceLabConfigure") && <UserSaucelabconfig resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>}
                    {(middleScreen==="zephyrConfigure") && <UserZephyrConfig resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>}
                    {(middleScreen==="AzureConfigure") &&<UserAzureconfig resetMiddleScreen={resetMiddleScreen}setMiddleScreen={setMiddleScreen}/>}
                </div>
                <ReferenceBar hideTask={true}  hideInfo={true}/>
            </div>
            <div className='uc__footer'><Footer /></div>
        </div>
    );
}

export default SettingsHome;