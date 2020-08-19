import React from 'react';
import "../styles/Footer.scss"

const Footer = () => {
    return (
        <div className="login-footer">
            <span className="upper-text">
                Powered by
                <img className="footer-logo" src="static/imgs/ftr-avo-logo.png"/>
            </span>
            <span className="lower-text">
                `© {new Date().getFullYear()}  Avo Automation. All Rights Reserved`
            </span>
        </div>
    );
}

export default Footer;