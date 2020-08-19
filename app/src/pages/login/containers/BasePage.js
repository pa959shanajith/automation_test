import React, { useState } from 'react';
import LoginFields from "../components/LoginFields.js";
import Footer from "../components/Footer.js"
import "../styles/BasePage.scss";

const BasePage = () => {

    return (
        <div className="bg-container">
            <img className="bg-img" src="static/imgs/login-bg.png"/>
            <div className="element-holder">
                <div className="greet-text">
                    <h1>Hello.</h1>
                    <h2>Welcome to Avo Assure!</h2>
                    <h3>Login to Experience Intelligence</h3>
                </div>
                <form className="login-block">
                    <span className="logo-wrap"><img className="logo-img" src="static/imgs/logo.png"/></span>
                    <LoginFields />
                </form>
            </div>
            {/* <Footer/> */}
        </div>
    );
}

export default BasePage;