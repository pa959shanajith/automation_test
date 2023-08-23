import { useSelector} from 'react-redux';
import React,{useState} from 'react';
import Header from '../components/AdminHeader';
import '../styles/OriginContainer.scss'
import LdapConfig from './LdapConfig';
import CreateUser from '../components/CreateUser';
// import UserCreation from './UserCreation';
import EmailConfiguration from './EmailConfiguration';
import { validateUserState } from '../../login/api';
// import IceProvision from './IceProvision';
import Agents from './Agents'
import LicenseManagement from './LicenseManagement';

const OriginContainer = (props) => {
    const currentTab = useSelector(state => state.admin.screen);
    const [createUserDialog, setCreateUserDialog] = useState(false)
    // const [provisionDialog,setProvisionDialog] = useState(false)
    return (<>
        <div>
            <div className="admin_origin_header">
                <Header setCreateUserDialog={setCreateUserDialog}   />
            </div>
            {currentTab === "ldapConf" && <LdapConfig/>}
            {/* {currentTab === "users" && <CreateUser/>}  setCreateUserDialog ={setCreateUserDialog} */}
            {currentTab === "users" && <CreateUser createUserDialog={createUserDialog}  setCreateUserDialog={setCreateUserDialog}/>}
            {currentTab === "Email Server Configuration" && <EmailConfiguration/>}
            {currentTab === "agent" && <Agents/>}
            {currentTab === "License Details" && <LicenseManagement/>}
            {/* {currentTab === "Avo Assure Client" && <IceProvision/>} */}
        </div>
    </>)
}
export default OriginContainer;