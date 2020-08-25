import React ,  { Fragment, useState } from 'react';
import LeftPanel from '../components/LeftPanel'
import CreateUser from '../components/CreateUser'
import '../styles/AdminHome.scss'

/*Component AdminHome
  use: renders Admin landing page (footer,header,sidebars,middle saection)
  todo: select Icon css(dark)
*/

const AdminHome = () => {
    const [middleScreen,setMiddleScreen] = useState("createUser")
    const [showEditUser,setShowEditUser] = useState(false)
    return (
        <Fragment>
                <div className="header">header</div>

                <LeftPanel setMiddleScreen={setMiddleScreen} setShowEditUser={setShowEditUser}/>

                {/* <!--Middle Panel--> */}
                <div id="middle-content-section" style={{ overflow: "auto" }}>
                    <div className="containerWrap">
                        {(middleScreen==="createUser")?<CreateUser showEditUser={showEditUser} setShowEditUser={setShowEditUser} setMiddleScreen={setMiddleScreen} middleScreen={middleScreen}/>:null}
                        {(middleScreen==="tokenTab")?null:null}
                        {(middleScreen==="provisionTa")?null:null}
                        {(middleScreen==="projectTab")?null:null}
                        {(middleScreen==="assignProjectTab")?null:null}
                        {(middleScreen==="ldapConfigTab")?null:null}
                        {(middleScreen==="samlConfigTab")?null:null}
                        {(middleScreen==="oidcConfigTab")?null:null}
                        {(middleScreen==="sessionTab")?null:null}
                        {(middleScreen==="preferencesTab")?null:null}
                    </div>
                </div>  

                { /* <!--Right Panel--> */}
                <div id="right-dependencies-section"></div>

                <div className="footer">footer</div>

        </Fragment>
  );
}

export default AdminHome;