import React from 'react';
import { FooterOne } from '../../global';

const StaticElements = ({children}) => {

    return (
        <div className="bg-container">
            <img className="bg-img" src="static/imgs/login-bg.png"/>
            <div className="element-holder">
                <div className="greet-text">
                    <h1>Hello.</h1>
                    <h2>Welcome to Avo Assure!</h2>
                    <h3>Login to Experience Intelligence</h3>
                </div>
                <div className="login-block">
                    <span className="logo-wrap"><img className="logo-img" src="static/imgs/logo.png"/></span>
                    {children}
                </div>
            </div>
            <FooterOne/>
        </div>
    );

}

export default StaticElements;