import { useSelector } from "react-redux";
import { Button } from 'primereact/button';
import "../styles/AdminHeader.scss";
import { AdminActions } from '../adminSlice';
import { useDispatch } from 'react-redux';


const AdminHeader = (props) => {
  const currentTab = useSelector(state => state.admin.screen);
  const headerTitle = useSelector(state => state.admin.header);

  const dispatch = useDispatch();

  const currentTabImage = () => {
    switch (currentTab) {
      case 'ldapConf':
        return <img src="static/imgs/ldap_configuration_icon.svg" className='current_img_icon' alt="SVG Image" />;
      case 'samlConf':
        return <img src="static/imgs/saml_configuration_icon.svg" className='current_img_icon' alt="SVG Image" />;
      case 'openIdConf':
        return <img src="static/imgs/openid_connect_icon.svg" className='current_img_icon' alt="SVG Image" />;
      case 'users':
        return <img src="static/imgs/users_icon.svg" className='current_img_icon' alt="SVG Image" />;
      case 'license_details':
        return <img src="static/imgs/license_icon.svg" className='current_img_icon' alt="SVG Image" />
      case 'email_server_configuration':
        return <img src="static/imgs/email_server_configuration_icon.svg" className='current_img_icon' alt="SVG Image" />;
      case 'manage_agents':
        return <img src="static/imgs/agent_icon.svg" alt="SVG Image" className='current_img_icon' />;
      case 'grid_configuration':
        return <img src="static/imgs/agent_icon.svg" alt="SVG Image" className='current_img_icon' />;
      case 'session_management':
        return <img src="static/imgs/users_icon.svg" alt="SVG Image" className='current_img_icon' />;
      case 'privileges':
        return <img src="static/imgs/privileges_icon.svg" alt="SVG Image" className='current_img_icon' style={{ width: '1.5rem' }} />;
      default:
        return null;
    }
  };

  return (
      <div className="Create_Header">
        <h3 className="header_label">{currentTabImage()}{headerTitle}</h3>
        {currentTab === "users" && <Button className="Create_btn" label="create" size="small" onClick={() => { props.setCreateUserDialog(true); dispatch(AdminActions.RESET_VALUES("")) }}> </Button>}
      </div>
  )
}
export default AdminHeader;