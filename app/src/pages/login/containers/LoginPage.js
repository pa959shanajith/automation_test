import React from 'react';
import { useNavigate } from "react-router-dom";
const Login = () => {
    let history = useNavigate();
    return (
    <div className="bg-container">
        <img className="bg-img" alt="bg-img" src="static/imgs/login-bg.png" />
        <button style={{ position: 'absolute', top: '50%', right: '10%' }} onClick={() => history("/landing")}>Click Here to Login</button>
        {/* <div className="element-holder">
            <div className="greet-text">
                <h1>Hello</h1>
                <h2>Welcome to Avo Assure</h2><h3>Login to Experience Intelligence.</h3>
            </div>
            <div className="login-block">
                <span className="logo-wrap">
                    <img className="logo-img" alt="logo" src="static/imgs/AssureLogo_horizonal.svg" />
                </span>
                <div style={"display: flex; flex-direction: row; width: 100%; flex: 1 1 0%;"}><div className="login-container" style={"opacity: 1; transform: none;"}><div className="form-title">Avo Assure - Log In</div><form data-test="login-form" className="login-form"><div style={"margin-bottom: 1rem;"}><div className="ms-TextField textfield_avo-text-field__1RWxU textfield_avo-text-field--with-icon__1rAqh root-148"><div className="ms-TextField-wrapper"><label htmlFor="TextField0" id="TextFieldLabel2" className="ms-Label root-142">Username/Email</label><div className="ms-TextField-fieldGroup fieldGroup-151"><input type="text" id="TextField0" className="ms-TextField-field field-133" aria-labelledby="TextFieldLabel2" aria-invalid="false" value="arpit.tiwari" /><i data-icon-name="user" aria-hidden="true" className="icon-143">
                    <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 52 58" fill="none"><path d="M49 54.75V49C49 45.95 47.7884 43.0249 45.6317 40.8683C43.4751 38.7116 40.55 37.5 37.5 37.5H14.5C11.45 37.5 8.52494 38.7116 6.36827 40.8683C4.2116 43.0249 3 45.95 3 49V54.75" stroke="#323130" strokeWidth="5.75" strokeLinecap="round" strokeLinejoin="round"></path><path d="M26 26C32.3513 26 37.5 20.8513 37.5 14.5C37.5 8.14873 32.3513 3 26 3C19.6487 3 14.5 8.14873 14.5 14.5C14.5 20.8513 19.6487 26 26 26Z" stroke="var(--baseColor)" strokeWidth="5.75" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </i></div></div></div></div><div className="ms-TextField textfield_avo-text-field__1RWxU textfield_avo-text-field--with-icon__1rAqh root-148"><div className="ms-TextField-wrapper"><label htmlFor="TextField5" id="TextFieldLabel7" className="ms-Label root-142">Password</label><div className="ms-TextField-fieldGroup fieldGroup-151"><input type="password" id="TextField5" className="ms-TextField-field field-144" aria-labelledby="TextFieldLabel7" aria-invalid="false" value="Arpit@123" /><i data-icon-name="password" aria-hidden="true" className="icon-143">
                    <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 53 59" fill="none"><path d="M13.5 26.625V16.125C13.5 12.644 14.8828 9.30564 17.3442 6.84422C19.8056 4.38281 23.144 3 26.625 3C30.106 3 33.4444 4.38281 35.9058 6.84422C38.3672 9.30564 39.75 12.644 39.75 16.125V26.625" stroke="var(--baseColor)" strokeWidth="5.25" strokeLinecap="round" strokeLinejoin="round"></path><path d="M45 26.625H8.25C5.3505 26.625 3 28.9755 3 31.875V50.25C3 53.1495 5.3505 55.5 8.25 55.5H45C47.8995 55.5 50.25 53.1495 50.25 50.25V31.875C50.25 28.9755 47.8995 26.625 45 26.625Z" stroke="#323130" strokeWidth="5.25" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </i><button className="ms-TextField-reveal ms-Button ms-Button--icon revealButton-139" aria-pressed="false" type="button"><span className="revealSpan-140"><i data-icon-name="RedEye" aria-hidden="true" className="revealIcon-145"></i></span></button></div></div></div><div><a id="forgotPassword" className="forget-password">Forgot Username or Password?</a></div><div data-test="login-validation" className="error-msg-login" style={"display: none;"}><img height="16" width="16" src="/static/media/error_exclamation.420303a1.svg" alt="error_ex_image" style={"margin-right: 5px;"} />  </div><button data-test="login-button" className="login-btn" type="submit">Log in</button></form><div className="login-hint">Don't have an account? Contact your admin for creating an account.</div></div>
                </div>
            </div>
        </div><div className="login-footer"><div className="footer-content"><span className="lower-text">Avo Assure v23.1.0   <br />© 2023 Avo Automation. All Rights Reserved.</span></div></div> */}
    </div>);
}
export default Login;
