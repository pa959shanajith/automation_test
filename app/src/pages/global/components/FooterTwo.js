import React from 'react';
import "../styles/FooterTwo.scss"

const Footer = () => {
    return (
        <div className="main-footer">
            <div className="main-footer-content">
            <span className="right-text">
                © {new Date().getFullYear()}  Avo Automation. All Rights Reserved
            </span>
            <span className="left-text">
                Powered By
                <img className="footer-logo" alt="logo" src="static/imgs/ftr-avo-logo.png"/>
            </span>
            </div>
        </div>
    );
}

export default Footer;