import React from 'react';
import "../styles/Footer.scss"

const Footer = () => {
    return (
        <div className="login-footer">
            <div className="footer-content">
            <span className="upper-text">
                Powered By
                <img className="footer-logo" src="static/imgs/ftr-avo-logo.png"/>
            </span>
            <span className="lower-text">
                © {new Date().getFullYear()}  Avo Automation. All Rights Reserved
            </span>
            </div>
        </div>
    );
}

export default Footer;