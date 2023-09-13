import { useSelector} from 'react-redux';
import React,{useState} from 'react';
import Header from '../components/AdminHeader';
import LdapConfig from './LdapConfig';
import CreateUser from '../components/CreateUser';
// import UserCreation from './UserCreation';
import EmailConfiguration from './EmailConfiguration';
import SamlConf from './SamlConf';
import '../styles/OriginContainer.scss'
import { validateUserState } from '../../login/api';
// import IceProvision from './IceProvision';
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
        <div className={currentTab === "SessionManagement"? "rightContainer":null}>
            {currentTab !== "SessionManagement"?
            <div className="admin_origin_header">
                <Header setCreateUserDialog={setCreateUserDialog} />
            </div> : null}
            {currentTab === "ldapConf" && <LdapConfig/>}
            {currentTab === "samlConf" && <SamlConf />}
            {currentTab === "users" && <CreateUser createUserDialog={createUserDialog}  setCreateUserDialog={setCreateUserDialog}/>}
            {currentTab === "email_server_configuration" && <EmailConfiguration/>}
            {currentTab === "manage_agents" && <Agents/>}
            {currentTab === "license_details" && <LicenseManagement/>}
            {currentTab === "session_management" && <SessionManagement/>}
            {currentTab === "privileges" && <Privileges/>}
            {/* {currentTab === "Avo Assure Client" && <IceProvision/>} */}
        </div>
    </>)
}
export default OriginContainer;