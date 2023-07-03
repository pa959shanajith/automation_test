import React from 'react';
import "../styles/FooterTwo.scss"

/*
    Component: Footer
    Uses: Provides Footer with text on left and right
    Props: None

*/

const Footer = () => {
    return (
        <div className="main-footer">
            <div className="main-footer-content">
            <span className="right-text">
                <img src='static/imgs/Copyright.svg' alt='copyright'/> Copyright {new Date().getFullYear()} Avo Automation - <span className='terms'>Terms of Use</span>
            </span>
            <span className="left-text">
                Avo Assure v23.1.1
            </span>
            </div>
        </div>
    );
}

export default Footer;