import LandingPage from '../../global/components/LandingContainer';
import AdminSidePanel from '../components/AdminSidePanel';
import SideNav from '../../landing/components/SideNav';
import OriginContainer from './OriginContainer'
import { useNavigate } from 'react-router-dom';
export var navigate

const AdminHome = () => {
    navigate = useNavigate();
    return (
        <LandingPage
            sideNavBar={< SideNav />}
            sidePanel={<AdminSidePanel />}
            contentPage={<OriginContainer />}
        ></LandingPage>
    )
}
export default AdminHome;