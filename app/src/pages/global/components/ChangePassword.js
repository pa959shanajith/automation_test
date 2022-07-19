import React, { useState } from 'react';
import { ModalContainer } from '../../global';
import { resetPassword } from '../api';
import errorImage from "../../../assets/imgs/error_exclamation.svg";
import '../styles/ChangePassword.scss';

/*
    Component: Change Password Modal Popup
    Uses: Renders the modal Popup for changing password
    Props: setShow -> setState for displaying and hiding modal
            setSuccessPass -> successPass setState to flip the flag once change pass is success
            loginPopup -> when user opening changepassword from login not from header
            loginCurrPassword -> email temporary password (forgot password)
            changeType -> "forgorPassword" or "CreateNewPass"
            updatePass -> we are passing custom update function for createNewPass
*/

const ChangePassword = ({setRedirectTo,setShow, setSuccessPass,loginCurrPassword, changeType, updatePass=null,userResetData=null}) => {

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

    const redirectToHomePage = ()=>{
      setTimeout(()=>{
          setRedirectTo("/");
      },2000)
    }

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
			// setPasswordValid("Current Password field is empty.");
		} else if (!newpassword && (validityCheck==="newpassword"|| validityCheck==="all")) {
        setNewPassError(true);
        // setPasswordValid("New Password field is empty.");
		} else if (!regexPassword.test(newpassword) && (validityCheck==="newpassword"|| validityCheck==="all")) {
        setNewPassError(true);
        let errString = `Password ${!/(?=.*[a-z])(?=.*[A-Z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])/.test(newpassword) ? (`must contain atleast${!/(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])/.test(newpassword) ? " 1 special character,":""}${!/(?=.*?[0-9])/.test(newpassword)?" 1 numeric character,":""}${!/(?=.*[a-z])(?=.*[A-Z])/.test(newpassword)?" 1 uppercase and lowercase character,":""}`):""} `
        let lenErrString = `${!/^.{8,16}$/.test(newpassword)?"length should be minimum 8 characters and maximum 16 characters.":""}`
        if (!lenErrString){
            errString = errString.slice(0,-2)
        }
        errString+=lenErrString
        // setPasswordValid(errString);
		} else if (!confpassword  && validityCheck==="all") {
        setConfPassError(true);
        setPasswordValid("Password doesn't match");
		} else if (newpassword && confpassword && newpassword !== confpassword ) {
        if (confPassError && passwordValidation && !toValidateOnly){
            retriggerAnimation("pass_validation","shakeX")
        }
        setConfPassError(true);
        setPasswordValid("Password doesn't match");
		} else if (toValidateOnly) {
        return
    } else {        
            const currentPass = loginCurrPassword!==undefined?loginCurrPassword:currpassword;
            if(changeType === "forgotPass") {
                resetPassword(newpassword,null,userResetData)
                .then(data => {
                    if(data === "Invalid Session") setPasswordValid("Invalid Session")
                    else if(data === "success") {
                        redirectToHomePage();
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

    const retriggerAnimation = (id, clsName) => {
        document.getElementById(id).classList.remove(clsName);
        setTimeout(()=>{
            document.getElementById(id).classList.add(clsName)
        },100)
    }

    const Content = () => (
        <>
            <div className="pass_inputs_container">
                <div className="pass_inputs_group">
                    <input className={"reset_pass_inputs " + (newPassError ? "error_reset_field" : "")} type={showPassNew?"text":"password"} onChange={newPassHandler} value={newpassword} onBlur={(e)=>{resetPass(e,"newpassword")}}/>
                    <label className={`reset_pass_label ${newpassword.length?"shrinked_label":""}`}>New Password</label>
                    <div className={ "no-decor " + (showPassNew ? res.eyeIcon: res.eyeSlashIcon) } onClick={()=>{setShowPassNew(!showPassNew)}}></div>
                </div>
                <div style={{marginTop:"10px",marginBottom:"15px"}}>
                    <div style={{display:"flex"}}>
                        <i style={{marginTop:"2px"}} className={`${newpassword.length>7 && newpassword.length<17 ?"fa fa-thin fa-check clr-gr":"fa fa-times clr-rd"}`+" mar-5 fa-fw"}></i>
                        <span style={{fontSize:13, fontFamily:"Mulish"}}>Must be 8-16 characters long</span>
                    </div>
                    <div style={{display:"flex"}}>
                        <i style={{marginTop:"2px"}} className={`${/(?=.*[a-z])(?=.*[A-Z])/.test(newpassword) ?"fa fa-thin fa-check clr-gr":"fa fa-times clr-rd"}`+" mar-5 fa-fw"}></i>
                        <span style={{fontSize:13, fontFamily:"Mulish"}}>Must contain at least 1 upper and 1 lower case letter</span>
                    </div>   
                    <div style={{display:"flex"}}>
                        <i style={{marginTop:"2px"}} className={`${/(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])/.test(newpassword) ?"fa fa-thin fa-check clr-gr":"fa fa-times clr-rd"}`+" mar-5 fa-fw"}></i>
                        <span style={{fontSize:13, fontFamily:"Mulish"}}>Must contain at least 1 number and 1 special character</span>
                    </div>   
                </div>
                <div className="pass_inputs_group">
                    <input className={"reset_pass_inputs " + (confPassError ? "error_reset_field" : "")} type={showPassConfirm?"text":"password"} onChange={confPasshandler} value={confpassword} onBlur={(e)=>{resetPass(e,"all")}}/>
                    <label className={`reset_pass_label ${confpassword.length?"shrinked_label":""}`}>Confirm Password</label>
                    <div className={ "no-decor " + (showPassConfirm ? res.eyeIcon: res.eyeSlashIcon )} onClick={()=>{setShowPassConfirm(!showPassConfirm)}} ></div>
                </div>
                <span id="pass_validation" className={"pass_valid_err " + (passwordValidation ? "shakeX" : "hide_pass_valid")}>
                    {passwordValidation ? (
                    <div style={{display:"flex"}}>
                        <img height={16} width={16} style={{marginRight:5}} src={errorImage} alt="error_ex_image"/>
                        <span style={{fontSize:12, fontFamily:"Mulish"}}>{passwordValidation}</span>
                    </div>
                     )
                    : "null"}
                </span>
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