import React from 'react';
import "../styles/FooterOne.scss"

/*
    Component: Footer
    Uses: Provides Footer with text on top and below each other
    Props: None

*/

const {REACT_APP_VERSION} = process.env;

const FooterOne = () => {
    return (
        <div className="login-footer">
            <div className="footer-content">
            <span className="upper-text">
                Powered By
                <img className="footer-logo_one" alt="logo" src="static/imgs/ftr-avo-logo.png"/>
            </span>
            <span className="lower-text">
                Avo Assure v{REACT_APP_VERSION} © {new Date().getFullYear()} <br></br>
                Avo Automation. All Rights Reserved
            </span>
            </div>
        </div>
    );
}

export default FooterOne;