import React ,{useState} from 'react';
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
    const [qTestClicked , setqTestClicked] = useState(false);
    const [almClicked , setAlmClicked] = useState(false);
    const [zephyrClicked , setZephyrClicked]= useState(false);
    const [popUpEnable , setPopUpEnable] = useState(false);
    const [loginAlm , setloginAlm]= useState(false);
    const [loginZephyr , setloginZephyr] = useState(false);
    const [focus,setFocus] = useState(null);
    const [viewmappedFiles , setViewMappedFiles] = useState(false)
    return(
        <div className="parent">
            <Header/>
            <div id="holder">
                <Leftbar 
                    focus={focus} 
                    setFocus={setFocus} 
                    setqTestClicked={setqTestClicked} 
                    setPopUpEnable={setPopUpEnable}
                    setViewMappedFiles={setViewMappedFiles}
                    viewmappedFiles={viewmappedFiles}
                    setAlmClicked={setAlmClicked}
                    setloginAlm={setloginAlm}
                    qTestClicked={qTestClicked}
                    almClicked={almClicked}
                    zephyrClicked={zephyrClicked}
                    setZephyrClicked={setZephyrClicked}
                    setloginZephyr={setloginZephyr}
                />
                {almClicked?
                <ALMCenter
                    setloginAlm={setloginAlm}
                    loginAlm={loginAlm}
                    viewmappedFiles={viewmappedFiles}
                    setViewMappedFiles={setViewMappedFiles}
                    almClicked={almClicked}
                    setAlmClicked={setAlmClicked}
                    
                /> 
                :
                zephyrClicked?
                <ZephyrCenter
                    zephyrClicked={zephyrClicked}
                    viewmappedFiles={viewmappedFiles}
                    setViewMappedFiles={setViewMappedFiles}
                    setZephyrClicked={setZephyrClicked}
                    loginZephyr={loginZephyr}
                    setloginZephyr={setloginZephyr}
                    setFocus={setFocus}
                />
                :
                <QTestCenter
                    qTestClicked={qTestClicked}
                    setqTestClicked={setqTestClicked}
                    popUpEnable={popUpEnable}
                    setPopUpEnable={setPopUpEnable}
                    setFocus={setFocus}
                    viewmappedFiles={viewmappedFiles}
                    setViewMappedFiles={setViewMappedFiles}
                    setAlmClicked={setAlmClicked}
                    almClicked={almClicked}
                />}
                <Rightbar />
            </div>    
            <div className="integration_Footer"><Footer/></div>
        </div>
    )
}

export default Integrations;
