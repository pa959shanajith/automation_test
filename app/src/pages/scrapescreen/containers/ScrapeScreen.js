import React ,{useState ,useEffect} from 'react';
import {useSelector, useDispatch} from "react-redux"
import ScrapeCenter from '../components/CenterScr.js';
import Rightbar from '../components/RightBarItems.js';
import CreateOptions from '../components/LeftBarItems.js';
import {GetScrapeDataScreenLevel_ICE } from '../api';
import '../styles/Scrapescreen.scss';
import Header from '../../global/components/Header';
import Footer from '../../global/components/FooterTwo';
import * as actionTypes from '../state/action';


const ScrapeScreen = ()=>{
    const dispatch = useDispatch();
    const [mweb , setMweb] = useState(false);
    const [spdf , setSpdf] = useState(false);
    const [scpitm , setScpitm ] = useState([]);
    const _CT = useSelector(state=>state.plugin.CT);
    const apptype = _CT.appType;
    useEffect(() => {
        (async () =>{
            var res = await GetScrapeDataScreenLevel_ICE(_CT)
            dispatch({type: actionTypes.SET_SCRAPEDATA, payload: res});
        })()
    }, [_CT])
    return (
        <div  className="parent">
            {/* header Section */}
            <Header/>
            <div className="holder">
                {/* Left Dependencies Section as per Particular Appt type */}
                <CreateOptions apptype={apptype} mweb={mweb} setMweb={setMweb} spdf={spdf} setSpdf={setSpdf} scpitm={scpitm} setScpitm={setScpitm}/>
                {/* Main Center Screena with Scrape Elements */}
                <ScrapeCenter  mweb={mweb} setMweb={setMweb} spdf={spdf} setSpdf={setSpdf} _CT={_CT} scpitm={scpitm} setScpitm={setScpitm}/>
                {/* RIght Dependencies Section */}
                <Rightbar scpitm={scpitm}/>
            </div>
            {/* Footer */}
            <Footer/>
        </div>
    );
}

export default ScrapeScreen;