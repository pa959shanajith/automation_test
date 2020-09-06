import React ,{Fragment } from 'react';
import ScrapeCenter from '../components/CenterScr.js';
import Rightbar from '../components/RightBarItems.js';
import ScrapeLeft from './LeftBar.js';
import '../styles/Scrapescreen.scss'


const ScrapeScreen = ()=>{
    return (
        <Fragment>
            <div  className="parent">
                {/* header Section */}
                <div className="header">Header</div>
                <div className="holder">
                    {/* Left Dependencies Section as per Particular Appt type */}
                    <ScrapeLeft/>
                    {/* Main Center Screena with Scrape Elements */}
                    <ScrapeCenter/>
                    {/* RIght Dependencies Section */}
                    <Rightbar/>
                </div>
                {/* Footer */}
                <div className="footer">Footer</div>
            </div>
        </Fragment>
    );
}

export default ScrapeScreen;