import React ,{useState} from 'react';
// import {Header, FooterTwo as Footer } from '../../global';
import Leftbar from '../components/LeftBar';
// import Rightbar from '../components/Rightbar';
import UtilityCenter from './UtilityCenter'
import '../styles/UtilityHome.scss';
//Utility Screen main Home Renders--> Header, LefbarScreen , CenterScreen, RIghtbarScreen and Main FooterBar // 

const  Utilities=()=>{
    const [screenType , setScreenType] = useState(''); //State for Utility screen type selection on icon click in leftbar
    const [pairwiseClicked , setPairwiseClicked] = useState(false); 
    return(
        <div className="parent">
            {/* <Header/> */}
            <div id="holder">
                <Leftbar setScreenType={setScreenType} setPairwiseClicked={setPairwiseClicked} />
                <UtilityCenter pairwiseClicked={pairwiseClicked} setPairwiseClicked={setPairwiseClicked} screenType={screenType} setScreenType={setScreenType}/>
                {/* <Rightbar /> */}
            </div>    
            {/* <div className="utlFooter"><Footer/></div> */}
        </div>
    )
}

export default Utilities;