import React ,{useState} from 'react';
import Header from '../../global/components/Header';
import Footer from '../../global/components/FooterTwo';
import Leftbar from '../components/Leftbar';
import Rightbar from '../components/Rightbar';
import IntegrationCenter from './IntegrationCenter'

//Integration Screen main Home Renders--> Header, LefbarScreen , CenterScreen, RIghtbarScreen and Main FooterBar // 

const  Integrations=()=>{
    // const [screenType , setScreenType] = useState("encryption");
    const [qTestClicked , setqTestClicked] = useState(false);
    const [popUpEnable , setPopUpEnable] = useState(false);
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
                />
                <IntegrationCenter
                    qTestClicked={qTestClicked}
                    setqTestClicked={setqTestClicked}
                    popUpEnable={popUpEnable}
                    setPopUpEnable={setPopUpEnable}
                    setFocus={setFocus}
                    viewmappedFiles={viewmappedFiles}
                    setViewMappedFiles={setViewMappedFiles}
                />
                <Rightbar />
            </div>    
            <Footer/>
        </div>
    )
}

export default Integrations;
