import { useSelector} from 'react-redux';
import React,{useState} from 'react';
import Header from '../components/AdminHeader';
import LdapConfig from './LdapConfig';
import { validateUserState } from '../../login/api';
import CreateUser from '../components/CreateUser';
import EmailConfiguration from './EmailConfiguration';
import SamlConf from './SamlConf';
import '../styles/OriginContainer.scss'

const OriginContainer = (props) => {
    const currentTab = useSelector(state => state.admin.screen);
    const [createUserDialog, setCreateUserDialog] = useState(false)
    return (<>
        <div>
            <div className="admin_origin_header">
                <Header setCreateUserDialog={setCreateUserDialog} />
            </div>
            {currentTab === "ldapConf" && <LdapConfig/>}
            {/* {currentTab === "users" && <CreateUser/>}  setCreateUserDialog ={setCreateUserDialog} */}
            {currentTab === "samlConf" && <SamlConf />}
            {currentTab === "users" && <CreateUser createUserDialog={createUserDialog}  setCreateUserDialog={setCreateUserDialog}/>}
            {currentTab === "Email Server Configuration" && <EmailConfiguration/>}

        </div>
    </>)
}
export default OriginContainer;