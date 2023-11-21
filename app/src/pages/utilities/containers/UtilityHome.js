import React ,{useState} from 'react';
import LandingPage from '../../global/components/LandingContainer';
import Leftbar from '../components/LeftBar';
import SideNav from '../../landing/components/SideNav';
import UtilityCenter from './UtilityCenter'


const AdminContainer = () => {
    const [screenType , setScreenType] = useState(''); //State for Utility screen type selection on icon click in leftbar
    const [pairwiseClicked , setPairwiseClicked] = useState(false); 
    return (
        <LandingPage
            sideNavBar={< SideNav />}
            sidePanel={<Leftbar setScreenType={setScreenType} setPairwiseClicked={setPairwiseClicked} />}
            contentPage= {<UtilityCenter pairwiseClicked={pairwiseClicked} setPairwiseClicked={setPairwiseClicked} screenType={screenType} setScreenType={setScreenType}/>}
        ></LandingPage>
    )
}
export default AdminContainer;