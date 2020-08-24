import React from 'react';
import LoginFields from "../components/LoginFields.js";
import BasePage from './BasePage';
import "../styles/BasePage.scss";

/*
    Component: LoginPage
    Use: returns the base page component with login field component in it to render
    Todo : Loading bar and disabling login button after pressing it once  
*/

const LoginPage = () => {

    return (
        <BasePage LoginFields={LoginFields} showLoginField={true} />
    );

    // return (
    //     <div className="bg-container">
    //         <img className="bg-img" src="static/imgs/login-bg.png"/>
    //         <div className="element-holder">
    //             <div className="greet-text">
    //                 <h1>Hello.</h1>
    //                 <h2>Welcome to Avo Assure!</h2>
    //                 <h3>Login to Experience Intelligence</h3>
    //             </div>
    //             <div className="login-block">
    //                 <span className="logo-wrap"><img className="logo-img" src="static/imgs/logo.png"/></span>
    //                 <LoginFields />
    //             </div>
    //         </div>
    //         <Footer/>
    //     </div>
    // );
}

export default LoginPage;