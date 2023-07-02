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
                <h1>Hello,</h1>
                <h2>Welcome to Avo  Assure!</h2>
                <h3>
  Experience the <span style={{color:"white"}}>next-gen</span> test automation platform
</h3>

                <img className="" src="static/imgs/animated_login.gif" alt="Login" />
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