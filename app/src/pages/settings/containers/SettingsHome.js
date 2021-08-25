
import React, {useState} from 'react';
import { Header, FooterTwo as Footer, ReferenceBar, PopupMsg } from '../../global'
import LeftPanelBar from './LeftPanelBar'
import EditUser from './EditUser'
import  UserTokenMgmt from './UserTokenMgmt'
import UserIceProvision from './UserIceProvision'
import UserProject from './UserProject'
import UserGitConfig from './UserGitConfig'
import UserJiraConfig from './UserJiraConfig'

import '../styles/SettingsHome.scss'

/*Component SettingsHome
  use: Provides user option to update their user configeration 
  props: None
  todo: 
    
*/

const SettingsHome = () => {
    const [middleScreen,setMiddleScreen] = useState("editUser");  
    const [resetMiddleScreen,setResetMiddleScreen] =useState({editUser:true});
    const [popup, setPopup] = useState(false);
    return (
        <div className='uc__container'>
            { popup && <PopupMsg variant={popup.VARIANT || popup.VARIANT} content={popup.CONTENT || popup.content} close={()=>setPopup(false) } /> }
            <Header />
            <div className='uc__body'>
                <LeftPanelBar setMiddleScreen={setMiddleScreen} resetMiddleScreen={resetMiddleScreen} setResetMiddleScreen={setResetMiddleScreen} middleScreen={middleScreen}/>
                <div className='uc__middle_container'>
                    {middleScreen=== "editUser" &&  <EditUser setPopupState={setPopup} resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen} middleScreen={middleScreen}/>}
                    {(middleScreen==="tokenTab") && <UserTokenMgmt setPopupState={setPopup} resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen} middleScreen={middleScreen}/>}
                    {(middleScreen==="provisionTa") && <UserIceProvision setPopupState={setPopup} resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen} />}
                    {(middleScreen==="projectTab") && <UserProject setPopupState={setPopup} resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>}
                    {(middleScreen==="gitConfigure") && <UserGitConfig setPopupState={setPopup} resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>}
                    {(middleScreen==="jiraConfigure") && <UserJiraConfig setPopupState={setPopup} resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>}
                </div>
                <ReferenceBar hideTask={true}  hideInfo={true}/>
            </div>
            <div className='uc__footer'><Footer /></div>
        </div>
    );
}

export default SettingsHome;