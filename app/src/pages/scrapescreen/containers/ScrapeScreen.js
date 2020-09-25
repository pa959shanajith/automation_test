import React ,{Fragment ,useState} from 'react';
import ScrapeCenter from '../components/CenterScr.js';
import Rightbar from '../components/RightBarItems.js';
import CreateOptions from '../components/LeftBarItems.js';
import '../styles/Scrapescreen.scss';
import Header from '../../global/components/Header';
import Footer from '../../global/components/FooterTwo';


const ScrapeScreen = ()=>{
    const [mweb , setMweb] = useState(false);
    const [spdf , setSpdf] = useState(false);
    const [scpitm , setScpitm ] = useState([]);
    return (
        <Fragment>
            <div  className="parent">
                {/* header Section */}
                <Header/>
                <div className="holder">
                    {/* Left Dependencies Section as per Particular Appt type */}
                    <CreateOptions mweb={mweb} setMweb={setMweb} spdf={spdf} setSpdf={setSpdf} scpitm={scpitm} setScpitm={setScpitm}/>
                    {/* Main Center Screena with Scrape Elements */}
                    <ScrapeCenter scpitm={scpitm} setScpitm={setScpitm}/>
                    {/* RIght Dependencies Section */}
                    <Rightbar/>
                </div>
                {/* Footer */}
                <Footer/>
            </div>
        </Fragment>
    );
}

export default ScrapeScreen;