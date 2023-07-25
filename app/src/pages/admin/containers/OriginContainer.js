import { useSelector } from 'react-redux';
import Header from '../components/AdminHeader';
import '../styles/OriginContainer.scss'
import LdapConfig from './LdapConfig';

const OriginContainer = (props) => {
    const currentTab = useSelector(state => state.admin.screen);
    return (<>
        <div>
            <div className="admin_origin_header">
                <Header/>
            </div>
            {currentTab === "ldapConf" && <LdapConfig/>}
        </div>
    </>)
}
export default OriginContainer;