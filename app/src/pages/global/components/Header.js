import React from 'react';
import "../styles/Header.scss";
import 'font-awesome/css/font-awesome.min.css';

const Header = () => {
    return(
        <>
            <div className = "main-header">
                <span className="header-logo-span"><img className="header-logo" src="static/imgs/logo.png"/></span>
                <div className="btn-container"><button className="fa fa-bell no-border"></button></div>
                <div className="btn-container">
                    <button className="switch-role-btn no-border">
                        <span><img className="switch-role-icon" src="static/imgs/ic-switch-user.png"/></span>
                        <span>Switch Roles</span>
                    </button>
                </div>
                <div className="btn-container">
                    <button className="user-name-btn no-border">
                        <span className="user-name">Vivek Sharma</span>
                        <span><img className = "user-name-icon" src="static/imgs/ic-user-nav.png"/></span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default Header;