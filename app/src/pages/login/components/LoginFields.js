import React, { useState } from 'react';
import 'font-awesome/css/font-awesome.min.css';
import "../styles/LoginFields.scss"

const LoginFields = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassField, setPassField] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleUsername = event => setUsername(event.target.value);
    const handlePassword = event => setPassword(event.target.value);
    const handleToggle = () => setPassField(!showPassField);
    const handleShowPass = () => setShowPass(!showPass);

    const onSubmit = event => {
        event.preventDefault();
        console.log(username);
    }

    return (
        <>
        <div className="username-wrap">
            <span><img className="ic-username" src="static/imgs/ic-username.png"/></span>
            <input className="field" placeholder="username" value={username} onChange={handleUsername}></input>
            {showPassField && username ? true : <span className="ic-rightarrow fa fa-arrow-circle-right" onClick={handleToggle}></span>}
        </div>

        {
        showPassField ? 
        username ? <>
        <div className="password-wrap">
            <span><img className="ic-password" src="static/imgs/ic-password.png"/></span>
            <input className="field" type={showPass ? "text" : "password"} value={password} onChange={handlePassword}></input>
            <span className={showPass ? "password-eye fa fa-eye-slash" : "password-eye fa fa-eye"} onClick={handleShowPass}></span>
        </div>
        <button className="login-btn" type="submit" onClick={onSubmit}>Login</button>
        </>
        : handleToggle()
        : false
        }

        </>
    );
}

export default LoginFields;