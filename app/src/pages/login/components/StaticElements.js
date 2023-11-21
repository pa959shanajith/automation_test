import React from 'react';
import "../styles/StaticElements.scss";
import { Toast } from 'primereact/toast';
import { FooterTwo as Footer } from '../../global';


/*
    Component: StaticElements
    Props: Child Elements (children)
    Uses: Renders the Bg-Img and Greeting text and puts child elements in it
    Todo: none
*/

const StaticElements = ({ children }) => {

    return (
        <div className='flex flex-column'>
            <div className="login_container">
                <div className="split_left">
                <div><span id='Header'>Hello,</span></div>
                <div><span id='Header'>Welcome to Avo  Assure!</span></div>
                <div><span id='Test_automation'>
                        Experience the <span style={{ color: "white" }}>next-gen</span> test automation platform
                    </span></div>
                    <img src="static/imgs/animated_login.gif" alt="Login" style={{width:"100%"}}/>
                </div>
                <div className="split_right">
                    <div className="right_side_login">
                        <img className="icon_img" src="static/imgs/AssureLogo_horizonal.svg"></img>
                        {children}
                    </div>
                </div>
                <div><Footer /></div>
            </div>
        </div>
    );

}

export default StaticElements;