import React from 'react';
import { FooterOne } from '../../global';
import "../styles/StaticElements.scss";


/*
    Component: StaticElements
    Props: Child Elements (children)
    Uses: Renders the Bg-Img and Greeting text and puts child elements in it
    Todo: none
*/

const StaticElements = ({children}) => {

    return (
        <div className="bg-container">
            <img className="bg-img" alt="bg-img" src="static/imgs/login-bg.png"/>
            <div className="element-holder">
                <div className="greet-text">
                    <h1>Hello</h1>
                    <h2>Welcome to Avo Assure!</h2>
                    <h3>Login to Experience Intelligence.</h3>
                </div>
                <div className="login-block">
                    <span className="logo-wrap"><img className="logo-img" alt="logo" src="static/imgs/logo.svg"/></span>
                    {children}
                </div>
            </div>
            <FooterOne/>
        </div>
    );

}

export default StaticElements;