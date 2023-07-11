import React from 'react';
import "../styles/FooterTwo.scss"

/*
    Component: Footer
    Uses: Provides Footer with text on left and right
    Props: None

*/
const {REACT_APP_VERSION} = process.env;
const Footer = () => {
    return (
        <div className="main-footer">
            <div className="main-footer-content">
            <span className="right-text">
                <img src='static/imgs/Copyright.svg' className='copyImg' alt='copyright'/> Copyright {new Date().getFullYear()} Avo Automation - <span className='terms'>Terms of Use</span>
            </span>
            <span className="left-text">
                Avo Assure v{REACT_APP_VERSION}
            </span>
            </div>
        </div>
    );
}

export default Footer;