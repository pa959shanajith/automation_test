import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
// import { Form } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUserInfoActions } from '../LandingSlice';
import { manageUserDetails } from '../api'
import '../styles/EditProfile.scss';



const EditProfile = (props) => {
    const [profileImage, setProfileImage] = useState(null);
    const [initials, setInitials] = useState('');
    const { showDialogBox, setShowDialogBox } = props;
    const [showDialog, setShowDialog] = useState(showDialogBox);
    const toastWrapperRef = useRef(null);
    const userInfo = useSelector((state) => state.landing.userinfo);
    // const [updatedUserInfo, setUpdatedUserInfo] = useState(userInfo);
    const dispatch = useDispatch();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [prevPassword, setPrevPassword] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newConfirmPassword, setNewConfirmPassword] = useState("");
    const [isEmail, setIsEmail] = useState(true);
    const [isFirstName, setIsFirstName] = useState(true);
    const [isLastName, setIsLastName] = useState(true);
    const [isPrevPassword, setIsPrevPassword] = useState(true);
    const [isNewPassword, setIsNewPassword] = useState(true);
    const [isNewConfirmPassword, setIsNewConfirmPassword] = useState(true);
    const [loading, setLoading] = useState(false);
    const [changePass, setChangePass] = useState(false);


    const chooseOptions = { icon: 'pi pi-camera', label: ' ' };

    const onUpload = (event) => {
        // Get the uploaded file
        const uploadedFile = event.files[0];

        // Set the profile image state
        setProfileImage(uploadedFile);
    };

    useEffect(() => {
        const firstNameInitial = userInfo.firstname ? userInfo.firstname.slice(0, 1) : '';
        const lastNameInitial = userInfo.lastname ? userInfo.lastname.slice(0, 1) : '';
        const initials = (firstNameInitial + lastNameInitial).toUpperCase();
        setInitials(initials);
    }, [userInfo])



    const click = () => {
        setIsEmail(true);
        setIsFirstName(true);
        setIsLastName(true);
        setFirstName(userInfo.firstname);
        setLastName(userInfo.lastname);
        setEmail(userInfo.email_id);
    }

    useEffect(() => {
        click();
    }, [userInfo])
    const updateSubmitHandler = (event) => {
        event.preventDefault();
        var check = true;
        setLoading("Updating User...");
        if (!validate(firstName, "name", setIsFirstName)) {
            check = false;
        }
        if (!validate(lastName, "name", setIsLastName)) {
            check = false;
        }
        if (!validate(email, "email", setIsEmail)) {
            check = false;
        }
        if (!check) {
            setLoading(false);
            // setMsg(MSG.SETTINGS.ERR_INVALID_INFO);
            return;
        }

        let userObj = {
            userid: userInfo['user_id'],
            username: userInfo.username,
            firstname: firstName,
            lastname: lastName,
            email: email,
            role: userInfo.role,
            userConfig: true,//hardcoded only for inhouse
            type: 'inhouse' //hardcoded only for inhouse
        };
        (async () => {
            try {
                var data = await manageUserDetails("update", userObj);
                setLoading(false);
                if (data === 'success') {
                    dispatch(loadUserInfoActions.setUserInfo)
                    // dispatch({type:setUserInfo, payload: { ...userInfo, ['email_id']: userObj.email, firstname: userObj.firstname, lastname: userObj.lastname}})
                    // setMsg(MSG.SETTINGS.SUCC_INFO_UPDATED);
                    // click();
                } else if (data === "exists") {
                    // setMsg(MSG.ADMIN.WARN_USER_EXIST);
                } else if (data === "fail") {
                    // setMsg(MSG.CUSTOM("Failed to update user.",VARIANT.ERROR));
                }
                else if (/^2[0-4]{8}$/.test(data)) {
                    if (JSON.parse(JSON.stringify(data)[1])) {
                        // setMsg(MSG.CUSTOM("Failed to update user. Invalid Request!",VARIANT.ERROR));
                        return;
                    }
                    var errfields = [];
                    let hints = 'Hint:';
                    if (JSON.parse(JSON.stringify(data)[2])) errfields.push("User Name");
                    if (JSON.parse(JSON.stringify(data)[3])) errfields.push("First Name");
                    if (JSON.parse(JSON.stringify(data)[4])) errfields.push("Last Name");
                    if (JSON.parse(JSON.stringify(data)[5])) errfields.push("Password");
                    if (JSON.parse(JSON.stringify(data)[6])) errfields.push("Email");
                    if (JSON.parse(JSON.stringify(data)[7])) errfields.push("Authentication Server");
                    if (JSON.parse(JSON.stringify(data)[8])) errfields.push("User Domain Name");
                    if (JSON.stringify(data)[5] === '1') hints += " Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase alphabet, length should be minimum 8 characters and maximum 16 characters.";
                    if (JSON.stringify(data)[5] === '2') hints += " Password provided does not meet length, complexity or history requirements of application.";
                    // setMsg(MSG.CUSTOM("Following values are invalid: "+errfields.join(", ")+" "+hints,VARIANT.WARNING));
                } else {
                    // setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
                    click();
                }
            }
            catch (error) {
                // setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
                click();
            }
        })()
        resetFields();
    }





    // useEffect(() => {
    //     if (errorMsg) {
    //         toastWrapperRef.current.show({ severity: 'error', summary: 'Error', detail: errorMsg, life: 3000 });
    //     }
    // }, [errorMsg]);

    // useEffect(() => {
    //     if (successMsg) {
    //         toastWrapperRef.current.show({ severity: 'success', summary: 'Success', detail: successMsg, life: 3000 });
    //     }
    // }, [successMsg]);


    // resets the input fields when clicks on Cancel and Save Button
    const resetFields = () => {
        setShowDialog(false);
        setShowDialogBox(false);
    };

    // Footer elements to the Dialog Box
    const editProfileFooter = () =>
        <>
            <Button
                label="Cancel"
                size='small'
                onClick={resetFields}
                className="p-button-text" />
            <Button
                label="Save"
                size='small'
                onClick={updateSubmitHandler}
            // disabled={(newpassword != '' && confirmNewpassword != '') && (newpassword === confirmNewpassword) ? false : true} 
            />
        </>


    return (
        <>
            <div className='surface-card m-6'>
                {/* <Toast ref={toastWrapperRef} position="bottom-center" /> */}
                <Dialog header="Basic Information" className="editProfile_dialog" visible={showDialog} style={{ width: '47vw' }} onHide={resetFields} footer={editProfileFooter}>
                    <div className='pt-3'>
                        <div className='profileImage'>
                            <Avatar image={userInfo ? userInfo : ''}
                                label={userInfo ? initials : ''}
                                size='xlarge' title="User Profile" shape='circle'
                            />
                            <FileUpload className="userImage"
                                mode="basic"
                                name="profileImage"
                                accept="image/*"
                                maxFileSize={1000000}
                                chooseOptions={chooseOptions}
                                onUpload={onUpload}
                            />
                        </div>

                        <div className='input_field'>
                            {/* <form onSubmit={handleSubmit}> */}
                            {/* Name Input Field */}
                            <div className='pt-2'>
                                <label htmlFor="name">Name</label>
                                <InputText
                                    style={{ width: '30vw' }}
                                    // id="name"
                                    value={firstName}
                                    type="text"
                                    onChange={(event) => { setFirstName(event.target.value) }}
                                />
                            </div>

                            {/* Email Input Field */}
                            <div className='pt-2'>
                                <label htmlFor="Email">Email </label>
                                <InputText
                                    style={{ width: '30vw' }}
                                    // id="email"
                                    value={email}
                                    type="email"
                                    onChange={(event) => { setEmail(event.target.value) }} />
                                {/* // onChange={handleNameChange} */}
                                {/* /> */}
                            </div>

                            {/* PrimaryRole Input Field */}
                            <div className='pt-2'>
                                <label htmlFor="Primary Role">Primary Role </label>
                                <InputText
                                    style={{ width: '30vw' }}
                                    id="primary Role"
                                    value={userInfo.rolename}
                                    type="text"
                                    readOnly
                                />
                            </div>

                            {/* PrimaryRole Input Field */}
                            <div className='pt-2'>
                                <label htmlFor="Registered Date">Registered Date </label>
                                <InputText
                                    style={{ width: '30vw' }}
                                    id="Registered Date"
                                    value={userInfo.rolename}
                                    type="text"
                                    readOnly
                                />
                            </div>
                            {/* <button type='submit'>save</button> */}

                            {/* </form> */}
                        </div>
                    </div>
                </Dialog>
            </div>
        </>
    )
}
const validate = (value, id, update) => {
    var regex;
    if (id === "URL") {
        regex = /^https:\/\//g;
        if (regex.test(value)) {
            update(true);
            return true;
        }
        update(false);
        return false;
    }
    else {
        if (value.trim().length > 0) {
            update(true);
            return true;
        }
        else {
            update(false);
            return false;
        }
    }
}

export default EditProfile