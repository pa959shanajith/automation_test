import React, { useState,useEffect } from 'react';
import "../styles/FooterTwo.scss"

/*
    Component: Footer
    Uses: Provides Footer with text on left and right
    Props: None

*/
const {REACT_APP_VERSION} = process.env;
const Footer = () => {
    const[version,setVersion]=useState("")
    useEffect(()=>{
        fetch("/getClientConfig").then(data=>data.json()).then(response=>setVersion(response.version))
    },[])
    return (
        <div className="main-footer">
            <div className="main-footer-content">
            <span className="right-text">
                <img src='static/imgs/Copyright.svg' className='copyImg' alt='copyright'/> Copyright {new Date().getFullYear()} Avo Automation - <span className='terms'>Terms of Use</span>
            </span>
            <span className="left-text">
                Avo Assure v{version}
            </span>
            </div>
        </div>
    );
}

export default Footer;