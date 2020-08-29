import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import LoginFields from "../components/LoginFields.js";
import {FooterOne, SetProgressBar} from '../../global';
import "../styles/BasePage.scss";

/*
    Component: LoginPage
    Use: returns the base page component with login field component in it to render
    Todo : Loading bar and disabling login button after pressing it once  
*/


const LoginPage = () => {

    let dispatch = useDispatch();
     
    useEffect(()=>{
        SetProgressBar('complete', dispatch);
    }, []);

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
                    <LoginFields dispatch={dispatch} SetProgressBar={SetProgressBar}/>
                </div>
            </div>
            <FooterOne/>
        </div>
    );
}

export default LoginPage;