import React ,{Fragment } from 'react';
import ScrapeCenter from '../components/CenterScr.js';
import Rightbar from '../components/RightBarItems.js';
import ScrapeLeft from './LeftBar.js';
import '../styles/Scrapescreen.scss';
import Header from '../../global/components/Header';
import Footer from '../../global/components/FooterTwo';


const ScrapeScreen = ()=>{
    return (
        <Fragment>
            <div  className="parent">
                {/* header Section */}
                <Header/>
                <div className="holder">
                    {/* Left Dependencies Section as per Particular Appt type */}
                    <ScrapeLeft/>
                    {/* Main Center Screena with Scrape Elements */}
                    <ScrapeCenter/>
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