import React ,{useState} from 'react';
import { useDispatch ,useSelector } from 'react-redux';
import Header from '../../global/components/Header';
import Footer from '../../global/components/FooterTwo';
import Leftbar from '../components/Leftbar';
import Rightbar from '../components/Rightbar';
import QTestCenter from './qTestCenter';
import ALMCenter from './ALMCenter.js';
import ZephyrCenter from './ZephyrCenter.js';
import '../styles/IntegrationHome.scss'

//Integration Screen main Home Renders--> Header, LefbarScreen , CenterScreen, RIghtbarScreen and Main FooterBar // 

const  Integrations=()=>{
    const screenType = useSelector(state=>state.integration.loginPopupType);
    const [focus,setFocus] = useState(null);
    return(
        <div className="parent">
            <Header/>
            <div id="holder">
                <Leftbar 
                    focus={focus} 
                    setFocus={setFocus} 
                />
                {screenType== 'ALM'?
                <ALMCenter/> 
                :
                screenType=="Zephyr"?
                <ZephyrCenter
                    setFocus={setFocus}
                />
                :
                screenType=="qTest"?
                <QTestCenter
                    setFocus={setFocus}    
                />:
                <div className="integration_middleContent"></div>}
                <Rightbar />
            </div>    
            <div className="integration_Footer"><Footer/></div>
        </div>
    )
}

export default Integrations;
