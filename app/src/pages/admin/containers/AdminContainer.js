import LandingPage from '../../global/components/LandingContainer';
import AdminSidePanel from '../components/AdminSidePanel';
import SideNav from '../../landing/components/SideNav';
import OriginContainer from './OriginContainer'

const AdminContainer = () => {
    return (
        <LandingPage
            sideNavBar={< SideNav />}
            sidePanel={<AdminSidePanel />}
            contentPage={<OriginContainer />}
        ></LandingPage>
    )
}
export default AdminContainer;