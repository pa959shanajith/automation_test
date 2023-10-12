import { useSelector} from 'react-redux';
import React,{useState} from 'react';
import Header from '../components/AdminHeader';
import LdapConfig from './LdapConfig';
import UserHome from '../containers/UserHome';
import EmailConfiguration from './EmailConfiguration';
import SamlConf from './SamlConf';
import '../styles/OriginContainer.scss'
import Agents from './Agents'
import Grid from './Grid'
import LicenseManagement from './LicenseManagement';
import SessionManagement from './SessionManagement';
import Privileges from './preferences';

const OriginContainer = (props) => {
    const currentTab = useSelector(state => state.admin.screen);
    const [createUserDialog, setCreateUserDialog] = useState(false)
    // const [provisionDialog,setProvisionDialog] = useState(false)
    return (<>
        <div className="rightContainer">
            {currentTab !== "session_management"?
            <div className="admin_origin_header">
                <Header setCreateUserDialog={setCreateUserDialog} />
            </div> : null}
            {currentTab === "ldapConf" && <LdapConfig/>}
            {currentTab === "samlConf" && <SamlConf />}
            {currentTab === "users" && <UserHome createUserDialog={createUserDialog}  setCreateUserDialog={setCreateUserDialog}/>}
            {currentTab === "email_server_configuration" && <EmailConfiguration/>}
            {currentTab === "manage_agents" && <Agents/>}
            {currentTab === "grid_configuration" && <Grid/>}
            {currentTab === "license_details" && <LicenseManagement/>}
            {currentTab === "session_management" && <SessionManagement/>}
            {currentTab === "privileges" && <Privileges/>}
        </div>
    </>)
}
export default OriginContainer;