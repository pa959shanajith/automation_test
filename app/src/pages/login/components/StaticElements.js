import React from 'react';
import "../styles/StaticElements.scss";
import { Toast } from 'primereact/toast';


/*
    Component: StaticElements
    Props: Child Elements (children)
    Uses: Renders the Bg-Img and Greeting text and puts child elements in it
    Todo: none
*/

const StaticElements = ({children}) => {

    return (
        <div className="login_container">
            <div className="split_left">
                <h1>Hello</h1>
                <h2>Welcome to Avo  Assure</h2>
                <h3>Login to experience Intelligence</h3>
                <img className="" src="static/imgs/animated_login.gif" alt="Login" />
            </div>
            <div className="split_right">
                <div className="right_side_login">
                    <img className="icon_img" src="static/imgs/AssureLogo_horizonal.svg"></img>
                    {children}
                </div>
            </div>
        </div>
    );

}

export default StaticElements;