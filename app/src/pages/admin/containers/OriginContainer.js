import { useSelector} from 'react-redux';
import React,{useState} from 'react';
import Header from '../components/AdminHeader';
import '../styles/OriginContainer.scss'
import LdapConfig from './LdapConfig';
import CreateUser from '../components/CreateUser';
import EmailConfiguration from './EmailConfiguration';
import { validateUserState } from '../../login/api';
import LicenseManagement from './LicenseManagement';

const OriginContainer = (props) => {
    const currentTab = useSelector(state => state.admin.screen);
    const [createUserDialog, setCreateUserDialog] = useState(false)
    return (<>
        <div>
            <div className="admin_origin_header">
                <Header setCreateUserDialog={setCreateUserDialog}   />
            </div>
            {currentTab === "ldapConf" && <LdapConfig/>}
            {/* {currentTab === "users" && <CreateUser/>}  setCreateUserDialog ={setCreateUserDialog} */}
            {currentTab === "users" && <CreateUser createUserDialog={createUserDialog}  setCreateUserDialog={setCreateUserDialog}/>}
            {currentTab === "Email Server Configuration" && <EmailConfiguration/>}
            {currentTab === "License Details" && <LicenseManagement/>}

        </div>
    </>)
}
export default OriginContainer;