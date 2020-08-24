import React, { useState, useEffect } from 'react';
import * as api from '../api';
import { useHistory } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import "../styles/LoginFields.scss"
import { res, styles } from './Properties'

/*
    Component: LoginFields
    Uses; Renders input fields for user to login
    Todo: loading bar and checkUser function
*/

const LoginFields = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassField, setPassField] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [userError, setUserError] = useState(false);
    const [passError, setPassError] = useState(false);
    const [loginValidation, setLoginValidation] = useState("");
    const history = useHistory();
    // const [requested, setRequested] = useState(false);

    const handleShowPass = () => setShowPass(!showPass);

    const handleUsername = event => {
        setUserError(false);
        setUsername(event.target.value);
    }
    const handlePassword = event => {
        setPassError(false);
        setPassword(event.target.value);
    }
    const togglePassField = () => {
        setPassField(!showPassField);
        setPassword("");
        setPassError(false);
    }
    const handleToggle = () => {
        if (username) togglePassField();
        else setUserError(true);
    }

    const login = event => {
        event.preventDefault();
        setLoginValidation("");
        if (!username) setUserError(true);
        else if (!showPassField) setPassField(true);
        else if (!password) setPassError(true);
        check_credentials(username, password, setUserError, setPassError, setLoginValidation, history);
    }


    return (
        <form className="login-form" onSubmit={login}>
        <div className="username-wrap" style={userError ? styles.errorBorder : null }>
            <span><img className="ic-username" src={userError ? res.errorUserIcon : res.defaultUserIcon}/></span>
            <input className="field" placeholder="username" value={username} onChange={handleUsername}></input>
            {showPassField && username ? true : <span className="ic-rightarrow fa fa-arrow-circle-right" onClick={handleToggle}></span>}
        </div>
        {userError && !loginValidation ? <div className="error-msg">Please Enter Username</div> : null}
        {
        showPassField ? 
        username ? <>
        <div className="password-wrap" style={passError ? styles.errorBorder : null }>
            <span><img className="ic-password" src={passError ? res.errorPassIcon : res.defaultUserIcon}/></span>
            <input className="field" type={showPass ? "text" : "password"} placeholder="Password" value={password} onChange={handlePassword}></input>
            <span className={showPass ? res.eyeSlashIcon : res.eyeIcon } onClick={handleShowPass}></span>
        </div>
        {passError && !loginValidation? <div className="error-msg">Please Enter Password</div> : null}
        <div className="error-msg">{loginValidation}</div>
        <button className="login-btn" type="submit" onClick={login}>Login</button>
        </>
        : togglePassField()
        : false
        }
        </form>
    );
}

const check_credentials = (username, password, setUserError, setPassError, setLoginValidation, history) => {
    if (username && password){
        console.log(username, password);
        try{
            api.authenticateUser(username, password)
            .then(data=>{
                // cfpLoadingBar.complete();
                // $scope.requested = false;
                let error_msg = "";
				if (data == "restart") {
					// blockUI("Fetching active services...");
					// adminServices.restartService("query")
					// .then(function (data) {
					// 	if (data == "fail") {
					// 		$scope.loginValidation = "Failed to fetch services.";
					// 	} else {
					// 		$scope.restartForm = true;
					// 		data.forEach(function(e, i){
					// 			$scope.serverList[i].active = e;
					// 		});
					// 	}
					// 	unblockUI();
					// }, function (error) {
					// 	unblockUI();
					// 	$scope.loginValidation = "Failed to fetch services.";
					// });
                }
                else
                if (data == 'validCredential') {
                    console.log("ok")
                    history.push('/')
					// window.location = '/'; this works
                }
                else
                if (data == 'inValidCredential' || data == "invalid_username_password") {
                    setUserError(true);
                    setPassError(true);
					error_msg = "The username or password you entered isn't correct. Please try again.";
                }
                else
                if (data == "userLogged"){
                    error_msg = "User is already logged in! Please logout from the previous session.";
                }
                else 
                if (data == "inValidLDAPServer") {
                    error_msg = "LDAP Server Configuration is invalid!";
                }
                else
                if (data == "invalidUserConf") {
                    error_msg = "User-LDAP mapping is incorrect!";
                }
                else error_msg = "Failed to Login.";
                
                setLoginValidation(error_msg);
            })
            .catch(data => console.log(data))
        }
        catch(err){
            console.log(err)
        }
    }
}

// const checkUser = () => {
//     const err = ""
// }

// $scope.checkUser = function() {
//     if ($scope.requested) return false;
//     const err = "Failed to Login.";
//     $scope.loginValidation = "";
//     $(".ic-username").parent().removeClass("input-border-error");
//     $(".ic-username").children().attr("src", "imgs/ic-username.png");
//     if (!$scope.ud.userName) {
//         $(".ic-username").children().attr("src", "imgs/ic-username-error.png");
//         $(".ic-username").parent().addClass("input-border-error");
//         $scope.loginValidation = "Please Enter Username";
//         cfpLoadingBar.complete();
//         return false;
//     }
//     $scope.requested = true;
//     LoginService.checkUser($scope.ud.userName).then(function (data) {
//         cfpLoadingBar.complete();
//         $scope.requested = false;
//         if (data.redirect) {
//             window.location.href = data.redirect;
//         } else if (data.proceed) {
//             $scope.showLogin = true;
//             //$("#userName").attr("disabled",true);
//         } else if (data == "invalidServerConf") $scope.loginValidation = "Authentication Server Configuration is invalid!";
//         else $scope.loginValidation = err;
//     }, function (error) {
//         console.log(err);
//         $scope.loginValidation = err;
//         cfpLoadingBar.complete();
//         $scope.requested = false;
//     });
// }


export default LoginFields;

