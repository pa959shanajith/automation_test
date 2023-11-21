import React from 'react';
import "../styles/LicenseExpired.scss";

/*
    Component: LicenseExpired
    Uses: Renders Licence expired page
    Todo: none
*/

const LicenseExpired = () => {

    return (
        <div className='ls-container'>
          <div className='ls-inner-container'>
            <div style={{backgroundImage:"url('/static/imgs/licence_expiry.svg')"}} className="ls-expired-image"></div>
            <span style={{fontSize:"2rem"}}>Your Licence has expired</span>
            <div className='ls-option-container'>
              <button disabled data-type="disabled" className='ls-upgrade-btn'>Upgrade Now</button> 
              <span>OR</span>
              <a className='ls-contact-link' href="mailto:sales@avoautomation.com">Contact Us</a>
            </div>
          </div>
        </div>
    );

}

export default LicenseExpired;