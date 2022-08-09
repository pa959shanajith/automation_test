import React, { useState } from 'react';
import { ModalContainer } from '../../global';
import { resetPassword } from '../api';
import '../styles/ChangePassword.scss';

/*
    Component: Change Password Modal Popup
    Uses: Renders the modal Popup for changing password
    Props: setShow -> setState for displaying and hiding modal
            setSuccessPass -> successPass setState to flip the flag once change pass is success
            loginPopup -> when user opening changepassword from login not from header
            loginCurrPassword -> email temporary password (forgot password)
*/

const ChangePassword = ({setShow, setSuccessPass,loginCurrPassword, changeType, updatePass=null}) => {

    const [currpassword, setCurrPassword] = useState("");
    const [newpassword, setNewPassword] = useState("");
    const [confpassword, setConfPassword] = useState("");
    const [currPassError, setCurrPassError] = useState(false);
    const [newPassError, setNewPassError] = useState(false);
    const [confPassError, setConfPassError] = useState(false);
    const [passwordValidation, setPasswordValid] = useState("");
    const [showPassNew, setShowPassNew] = useState(false);
    const [showPassConfirm, setShowPassConfirm] = useState(false);

    const handleClose = () => setShow(false);
    const showSuccessPopup = () => setSuccessPass(true);

    const currPassHandler = event => {
        let val = event.target.value.replace(/\s/g, "");
        resetErrorFlags();
        setCurrPassword(val);
    }

    const newPassHandler = event => {
        let val = event.target.value.replace(/\s/g, "");
        resetErrorFlags();
        setNewPassword(val);
    }

    const confPasshandler = event => {
        let val = event.target.value.replace(/\s/g, "");
        resetErrorFlags();
        setConfPassword(val);
    }


     const resetFields = event => {
        event.preventDefault();
		setCurrPassword("");
		setNewPassword("");
		setConfPassword("");
		resetErrorFlags();
    };
    
    const resetErrorFlags = () => {
        setCurrPassError(false);
        setNewPassError(false);
        setConfPassError(false);
        setPasswordValid("");
    }
    
    const resetPass = (event, validityCheck, toValidateOnly=true) => {
        event.preventDefault();
        resetErrorFlags();
        
        let regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		if (loginCurrPassword===undefined && !currpassword) {
			setCurrPassError(true);
			setPasswordValid("Current Password field is empty.");
		} else if (!newpassword && (validityCheck==="newpassword"|| validityCheck==="all")) {
			setNewPassError(true);
			setPasswordValid("New Password field is empty.");
		} else if (!regexPassword.test(newpassword) && (validityCheck==="newpassword"|| validityCheck==="all")) {
			setNewPassError(true);
            let errString = `Password ${!/(?=.*[a-z])(?=.*[A-Z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])/.test(newpassword) ? (`must contain atleast${!/(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])/.test(newpassword) ? " 1 special character,":""}${!/(?=.*?[0-9])/.test(newpassword)?" 1 numeric character,":""}${!/(?=.*[a-z])(?=.*[A-Z])/.test(newpassword)?" 1 uppercase and lowercase character,":""}`):""} `
            let lenErrString = `${!/^.{8,16}$/.test(newpassword)?"length should be minimum 8 characters and maximum 16 characters.":""}`
            if (!lenErrString){
                errString = errString.slice(0,-2)
            }
            errString+=lenErrString
            setPasswordValid(errString);
		} else if (!confpassword  && validityCheck==="all") {
			setConfPassError(true);
			setPasswordValid("Confirm Password field is empty.");
		} else if (newpassword && confpassword && newpassword !== confpassword ) {
			setConfPassError(true);
			setPasswordValid("New Password and Confirm Password do not match");
		} else if (toValidateOnly) {
            return
        } else {        
            const currentPass = loginCurrPassword!==undefined?loginCurrPassword:currpassword;
            if(changeType === "forgotPass") {
                resetPassword(newpassword, currentPass)
                .then(data => {
                    if(data === "Invalid Session") setPasswordValid("Invalid Session")
                    else if(data === "success") {
                        handleClose();
                        showSuccessPopup();
                    } else if(data === "same"){
                        setNewPassError(true);
                        setConfPassError(true);
                        setPasswordValid("Sorry! You can't use the existing password again");
                    } else if(data === "incorrect") {
                        setCurrPassError(true);
                        setPasswordValid("Current Password is incorrect");
                    } else if(data === "reusedPass" || data === "insuff" || data === "same") {
                        setNewPassError(true);
                        setConfPassError(true);
                        if (data === "same") setPasswordValid("New Password provided is same as old password");
                        else if (data === "insuff") setPasswordValid("Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase alphabet, length should be minimum 8 characters and maximum 16 characters.");
                        else setPasswordValid("Password provided does not meet length, complexity or history requirements of application.");
                    } else if(data === "fail") setPasswordValid("Failed to Change Password")
                    else if(/^2[0-4]{10}$/.test(data)) setPasswordValid("Invalid Request")
                })
                .catch(error => {
                    setCurrPassError(true);
                    setPasswordValid("Failed to Authenticate Current Password.");
                });
            } else {
                updatePass(newpassword)
            }
		}
    };

    const Content = () => (
        <>
            <div className="pass_conditions_container">
                <div className="pass_conditions_title">
                    Password must contain:
                    <ul>
                        <li className={`${newpassword.length>7 && newpassword.length<17 ?"mark-green":""}`}>Min. of 8 and Max. of 16 characters</li>
                        <li className={`${/(?=.*[a-z])(?=.*[A-Z])/.test(newpassword) ?"mark-green":""}`}>Atleast one upper and lower case character</li>
                        <li className={`${/(?=.*?[0-9])/.test(newpassword) ?"mark-green":""}`}>Atleast one numeric character</li>
                        <li className={`${/(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])/.test(newpassword) ?"mark-green":""}`}>Atleast one special character</li>
                    </ul>
                </div>
            </div>
            <div className="pass_inputs_container">
                <div className="pass_inputs_group">
                    <input className={"reset_pass_inputs " + (newPassError ? "error_reset_field" : "")} type={showPassNew?"text":"password"} onChange={newPassHandler} value={newpassword} onBlur={(e)=>{resetPass(e,"newpassword")}}/>
                    <label className={`reset_pass_label ${newpassword.length?"shrinked_label":""}`}>New Password</label>
                    <div className={ "no-decor " + (showPassNew ? res.eyeIcon: res.eyeSlashIcon) } onClick={()=>{setShowPassNew(!showPassNew)}}></div>
                </div>
                <div className="pass_inputs_group">
                    <input className={"reset_pass_inputs " + (confPassError ? "error_reset_field" : "")} type={showPassConfirm?"text":"password"} onChange={confPasshandler} value={confpassword} onBlur={(e)=>{resetPass(e,"all")}}/>
                    <label className={`reset_pass_label ${confpassword.length?"shrinked_label":""}`}>Confirm Password</label>
                    <div className={ "no-decor " + (showPassConfirm ? res.eyeIcon: res.eyeSlashIcon )} onClick={()=>{setShowPassConfirm(!showPassConfirm)}} ></div>
                </div>
                <span className={"pass_valid_err " + (passwordValidation ? "" : "hide_pass_valid")}>{passwordValidation ? passwordValidation : null}</span>
            </div>
        </>
    );

    const Footer = () => (
        <div className="reset_dialog_btns">
            {changeType==="forgotPass" ?<button className="clear_reset_fields" onClick={resetFields}>Clear</button>:null}
            <button className="submit_reset" onClick={(e)=>resetPass(e,"all",false)}>{changeType==="forgotPass"?"Submit":"Change Password"}</button>
        </div>
    );

    return (
        <ModalContainer
        close={changeType==="forgotPass"?handleClose:null}
        title={"Change Password"}
        content={Content()}
        footer={Footer()}
        />
    );
}

const res = {
    eyeSlashIcon : "password-eye-change-password fa fa-eye-slash eye-ic",
    eyeIcon : "password-eye-change-password fa fa-eye eye-ic",
}

export default ChangePassword;