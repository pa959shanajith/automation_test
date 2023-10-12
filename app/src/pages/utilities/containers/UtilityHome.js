import LandingPage from '../../global/components/LandingContainer';
import Leftbar from '../components/LeftBar';
import SideNav from '../../landing/components/SideNav';
import Utilities from './OriginContainerUtilities';

const AdminContainer = () => {
    return (
        <LandingPage
            sideNavBar={< SideNav />}
            // sidePanel={<Leftbar setScreenType={props.setScreenType} setPairwiseClicked={props.setPairwiseClicked}/>}
            contentPage={<Utilities />}
        ></LandingPage>
    )
}
export default AdminContainer;