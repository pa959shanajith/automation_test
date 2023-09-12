import { useSelector } from "react-redux";
import {Button} from 'primereact/button';
import "../styles/AdminHeader.scss";
import { AdminActions } from '../adminSlice';
import { useDispatch } from 'react-redux';


const AdminHeader = (props) => {
    const currentTab = useSelector(state => state.admin.screen);
    const dispatch = useDispatch();

    const currentTabImage = () => {
        switch (currentTab) {
          case 'ldapConf':
            return <img src="static/imgs/ldap_configuration_icon.svg" className='current_img_icon' alt="SVG Image" />;
          case 'samlConf':
            return <img src="static/imgs/saml_configuration_icon.svg" className='current_img_icon' alt="SVG Image"/>;
          case 'openIdConf':
            return <img src="static/imgs/openid_connect_icon.svg" className='current_img_icon' alt="SVG Image" />;
          case 'Users':
            return <img src="static/imgs/users_icon.svg" className='current_img_icon' alt="SVG Image"/>;
          case 'License Details':
            return <img src="static/imgs/license_icon.svg" className='current_img_icon' alt="SVG Image" />
          case 'Email Server Configuration':
            return <img src="static/imgs/email_server_configuration_icon.svg"  className='current_img_icon' alt="SVG Image" />;
          case 'Manage Agents':
            return <img src="static/imgs/agent_icon.svg" alt="SVG Image" className='current_img_icon' />;
          case 'Grid Configuration':
            return <img src="static/imgs/agent_icon.svg" alt="SVG Image" className='current_img_icon' />;
          case 'SessionManagement':
            return <img src="static/imgs/users_icon.svg" alt="SVG Image" className='current_img_icon'/>;
          case 'Privileges':
            return <img src="static/imgs/privileges_icon.svg" alt="SVG Image" className='current_img_icon' style={{width: '1.5rem'}}/>;
          default:
            return null;
        }
      };
    
    return (
        <div className="Create_Header">
            <h3 className="header_label">{currentTabImage()}{currentTab}</h3>
            {currentTab === "Users" && <Button className="Create_btn" label ="create" onClick={() => {props.setCreateUserDialog(true); dispatch(AdminActions.RESET_VALUES(""))}}> </Button>}
        </div>
    )
}
export default AdminHeader;