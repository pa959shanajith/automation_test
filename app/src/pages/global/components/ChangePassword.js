import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { resetPassword } from '../api';
import ToastWrapper from './ToastWrapper';
import { loadUserInfoActions } from '../../landing/LandingSlice';
import { useDispatch } from 'react-redux';
import '../styles//ChangePassword.scss';


const ChangePassword = (props) => {
    const dispatch = useDispatch();
    const { showDialogBox, setShowDialogBox } = props;
    const toastWrapperRef = useRef(null);
    const [showDialog, setShowDialog] = useState(showDialogBox);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newpassword, setNewpassword] = useState('');
    const [confirmNewpassword, setConfirmNewpassword] = useState('');
    const [passwordLength, setPasswordLength] = useState(false);
    const [lowerCasePresent, setLowerCasePresent] = useState(false);
    const [upperCasePresent, setUpperCasePresent] = useState(false);
    const [specialCharPresent, setSpecialCharPresent] = useState(false);
    const [digitPresent, setDigitPresent] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (errorMsg) {
            toastWrapperRef.current.show({ severity: 'error', summary: 'Error', detail: errorMsg, life: 3000 });
        }
    }, [errorMsg]);

    useEffect(() => {
        if (successMsg) {
            toastWrapperRef.current.show({ severity: 'success', summary: 'Success', detail: successMsg, life: 3000 });
        }
    }, [successMsg]);

    // validating the Input password
    const newPasswordOnChangeHandler = (event) => {
        let password = event.target.value.replace(/\s/g, "");
        setNewpassword(password);
        (password.length > 7 && password.length < 33) ? setPasswordLength(true) : setPasswordLength(false);
        /(?=.*?[0-9])/.test(password) ? setDigitPresent(true) : setDigitPresent(false);
        /(?=.*[a-z])/.test(password) ? setLowerCasePresent(true) : setLowerCasePresent(false);
        /(?=.*[A-Z])/.test(password) ? setUpperCasePresent(true) : setUpperCasePresent(false);
        /(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])/.test(password) ? setSpecialCharPresent(true) : setSpecialCharPresent(false);
    }

    // validating the Confirm password
    const confirmNewPasswordOnChangeHandler = (event) => {
        let password = event.target.value.replace(/\s/g, "");
        setConfirmNewpassword(password);
    }

    // resets the input fields when clicks on Cancel and Save Button
    const resetFields = () => {
        setNewpassword("");
        setConfirmNewpassword("");
        setPasswordLength(false);
        setDigitPresent(false);
        setLowerCasePresent(false);
        setUpperCasePresent(false);
        setSpecialCharPresent(false);
        setShowDialog(false);
        setShowDialogBox(false);
    };

    const saveButtonHandler = () => {
        try {
            setErrorMsg('');
            setSuccessMsg('');
            let errorMsg = "";
            let successMsg = "";
            resetPassword(newpassword, null, null)
                .then(data => {
                    if (data === "Invalid Session") { errorMsg = 'Invalid Session'; }
                    else if (data === "success") {
                        successMsg = 'Password changed successfully';
                    } else if (data === "same") {
                        errorMsg = "Sorry! You can't use the existing password again";
                    } else if (data === "incorrect") {
                        errorMsg = 'Current Password is incorrect';
                    } else if (data === "reusedPass" || data === "insuff" || data === "same") {
                        if (data === "same") errorMsg = 'New Password provided is same as old password';
                        else if (data === "insuff") errorMsg = "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase alphabet, length should be minimum 8 characters and maximum 16 characters.";
                        else errorMsg = "Password provided does not meet length, complexity or history requirements of application.";
                    } else if (data === "fail")
                        errorMsg = 'Failed to Change Password';
                    else if (/^2[0-4]{10}$/.test(data))
                        errorMsg = 'Invalid Request';

                    if (errorMsg) setErrorMsg(errorMsg);
                    if (successMsg) {
                        setSuccessMsg(successMsg);
                        resetFields();
                    }

                })
                .catch(error => {
                    errorMsg = 'Failed to Authenticate Current Password.';
                });

        }
        catch (error) {
            setErrorMsg("Error while updating the password: ERROR: ", error);
        }
    }

    // Footer elements to the Dialog Box
    const changePasswordFooter = () =>
        <ToastWrapper>
            <Button
                label="Cancel"
                size='small'
                onClick={resetFields}
                className="p-button-text" />
            <Button
                label="Save"
                size='small'
                onClick={saveButtonHandler}
                disabled={(newpassword != '' && confirmNewpassword != '') && (newpassword === confirmNewpassword) ? false : true} />
        </ToastWrapper>

    return (
        <>
            <div className='surface-card m-6'>
                <Toast ref={toastWrapperRef} position="bottom-center" />
                <Dialog header="Change Password" className="changePassword_dialog" visible={showDialog} style={{ width: '30vw' }} onHide={resetFields} footer={changePasswordFooter}>
                    <div className='pt-3'>

                        {/* New Password Input Field */}
                        <label className='input_label' htmlFor="newPassword">New Password <span className='text-red-500'>*</span></label>
                        <div className="p-input-icon-right mb-1 mt-2">
                            <Tooltip target='.eyeIcon1' content={showNewPassword ? 'Hide Password' : 'Show Password'} position='bottom' />
                            <i
                                className={`eyeIcon1 cursor-pointer ${showNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'}`}
                                onClick={() => { setShowNewPassword(!showNewPassword) }}
                            />
                            <InputText
                                style={{ width: '25vw' }}
                                id="newPassword"
                                value={newpassword}
                                onChange={newPasswordOnChangeHandler}
                                placeholder='Enter new password'
                                type={showNewPassword ? "text" : "password"}
                            />
                        </div>

                        {/* checking password validation messages*/}
                        <div className="password_check_messages">
                            <div style={{ display: "flex" }}>
                                <i className={`mr-2 ${passwordLength ? "pi pi-check text-green-500" : "pi pi-times text-red-500"}`}></i>
                                <span>Must be 8-32 characters long</span>
                            </div>
                            <div style={{ display: "flex" }}>
                                <i className={`mr-2 ${digitPresent ? "pi pi-check text-green-500" : "pi pi-times text-red-500"}`}></i>
                                <span>Must contain at least 1 Number</span>
                            </div>
                            <div style={{ display: "flex" }}>
                                <i className={`mr-2 ${lowerCasePresent ? "pi pi-check text-green-500" : "pi pi-times text-red-500"}`}></i>
                                <span>Must contain at least 1 Lower case letter</span>
                            </div>
                            <div style={{ display: "flex" }}>
                                <i className={`mr-2 ${upperCasePresent ? "pi pi-check text-green-500" : "pi pi-times text-red-500"}`}></i>
                                <span>Must contain at least 1 Upper case letter</span>
                            </div>
                            <div style={{ display: "flex" }}>
                                <i className={`mr-2 ${specialCharPresent ? "pi pi-check text-green-500" : "pi pi-times text-red-500"}`}></i>
                                <span>Must contain at least 1 Special character (&,%.etc)</span>
                            </div>
                        </div>

                        {/* Confirm New Password Input Field */}
                        <label className='input_label' htmlFor="newPassword">Confirm Password <span className='text-red-500'>*</span></label>
                        <div className="p-input-icon-right mt-2">
                            <Tooltip target='.eyeIcon2' content={showConfirmPassword ? 'Hide Password' : 'Show Password'} position='bottom' />
                            <i
                                className={`eyeIcon2 cursor-pointer ${showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'}`}
                                onClick={() => { setShowConfirmPassword(!showConfirmPassword) }}
                            />
                            <InputText
                                style={{ width: '25vw' }}
                                id="confirmPassword"
                                value={confirmNewpassword}
                                onChange={confirmNewPasswordOnChangeHandler}
                                placeholder='Confirm new password'
                                type={showConfirmPassword ? "text" : "password"}
                                disabled={!(passwordLength && lowerCasePresent && upperCasePresent && specialCharPresent && digitPresent)}
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        </>
    )
}
export default ChangePassword;