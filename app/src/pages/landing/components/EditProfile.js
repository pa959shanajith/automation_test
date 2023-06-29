import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { useSelector, useDispatch } from 'react-redux';
import { loadUserInfoActions } from '../LandingSlice';
import { manageUserDetails } from '../api'
import '../styles/EditProfile.scss';



const EditProfile = (props) => {
    const [initials, setInitials] = useState('');
    const { showDialogBox, setShowDialogBox } = props;
    const [showDialog, setShowDialog] = useState(showDialogBox);
    const toastWrapperRef = useRef(null);
    const userInfo = useSelector((state) => state.landing.userinfo);
    const dispatch = useDispatch();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [isEmail, setIsEmail] = useState(true);
    const [isFirstName, setIsFirstName] = useState(true);
    const [isLastName, setIsLastName] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [base64String, setBase64String] = useState('');


    const chooseOptions = { icon: 'pi pi-camera', label: ' ' };
    const onFileUpload = (event) => {
        const file = event.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            setSelectedFile(file);
            setBase64String(base64String);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (errorMsg) {
            toastWrapperRef.current.show({ severity: 'error', summary: 'Error', detail: errorMsg, life: 10000 });
        }
    }, [errorMsg]);

    useEffect(() => {
        if (successMsg) {
            toastWrapperRef.current.show({ severity: 'success', summary: 'Success', detail: successMsg, life: 5000 });
        }
    }, [successMsg]);


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
        setBase64String(userInfo.userimage);
    }

    useEffect(() => {
        click();
    }, [userInfo])
    const updateSubmitHandler = (event) => {
        event.preventDefault();
        var check = true;
        setLoading("Updating User...");
        setErrorMsg('');
        setSuccessMsg('');
        let errorMsg = "";
        let successMsg = "";
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
            { errorMsg = 'Enter Correct Details'; }
            // setMsg(MSG.SETTINGS.ERR_INVALID_INFO);
            return;
        }
        if (errorMsg) setErrorMsg(errorMsg);
        if (successMsg) {
            setSuccessMsg(successMsg);
            resetFields();
        }

        let userObj = {
            userid: userInfo['user_id'],
            username: userInfo.username,
            firstname: firstName,
            lastname: lastName,
            email: email,
            userimage: base64String,
            role: userInfo.role,
            createdon:userInfo.createdon,
            userConfig: true,//hardcoded only for inhouse
            type: 'inhouse' //hardcoded only for inhouse
        };
        const userdetail = { ...userInfo, ['email_id']: userObj.email, firstname: userObj.firstname, lastname: userObj.lastname, userimage: userObj.userimage };
        (async () => {
            try {
                var data = await manageUserDetails("update", userObj);
                setLoading(false);
                if (data === 'success') {
                    successMsg = 'Profile changed successfully';
                    dispatch(loadUserInfoActions.setUserInfo(userdetail))
                } else if (data === "exists") {
                    successMsg = 'User already Exists.';
                    // setMsg(MSG.ADMIN.WARN_USER_EXIST);
                } else if (data === "fail") {
                    successMsg = 'Failed to update user.",';
                    // setMsg(MSG.CUSTOM("Failed to update user.",VARIANT.ERROR));
                    console.log("failed to update user");
                }
                else if (/^2[0-4]{8}$/.test(data)) {
                    if (JSON.parse(JSON.stringify(data)[1])) {
                        successMsg = 'Failed to update user. Invalid Request!",';
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
                    errorMsg = 'Following values are invalid: "+errfields.join(", ")+" "+hints'; 
                } else {
                    errorMsg = 'Something went wrong!';
                    // setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
                    click();
                }
            }
            catch (error) {
                errorMsg = 'Something went wrong!';
                // setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
                console.log("Error:", error);
                click();
            }
        })()
        resetFields();
    }



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
            />
        </>


    return (
        <>
            <div className='surface-card'>
                <Toast ref={toastWrapperRef} position="bottom-center" />
                <Dialog header="Profile Information" className="editProfile_dialog" visible={showDialog} style={{ width: '33vw' }} onHide={resetFields} footer={editProfileFooter}>
                    <div className='pt-3'>
                        <div className='profileImage'>
                            <Avatar image={base64String}
                                label={!userInfo.userimage ? initials : base64String}
                                size='xlarge' title="User Profile" shape='circle'
                            />
                            <FileUpload className="userImage"
                                mode="basic"
                                name="profileImage"
                                accept="image/*"
                                maxFileSize={1000000}
                                chooseOptions={chooseOptions}
                                chooseLabel="Select Image"
                                customUpload={true}
                                uploadHandler={onFileUpload}
                            />
                        </div>

                        <div className='input_field'>
                            {/* Name Input Field */}
                            <div className='pt-2'>
                                <label htmlFor="name">First Name</label>
                                <InputText
                                    style={{ width: '30vw',height:'5vh' }}
                                    id="edit_input"
                                    value={firstName}
                                    type="text"
                                    onChange={(event) => { setFirstName(event.target.value) }}
                                />
                            </div>
                            <div className='pt-2'>
                                <label htmlFor="name">Last Name</label>
                                <InputText
                                    style={{ width: '30vw',height:'5vh' }}
                                    id="edit_input"
                                    value={lastName}
                                    type="text"
                                    onChange={(event) => { setLastName(event.target.value) }}
                                />
                            </div>

                            {/* Email Input Field */}
                            <div className='pt-2'>
                                <label htmlFor="Email">Email </label>
                                <InputText
                                    style={{ width: '30vw',height:'5vh' }}
                                    id="edit_input"
                                    value={email}
                                    type="email"
                                    onChange={(event) => { setEmail(event.target.value) }} />
                            </div>

                            {/* PrimaryRole Input Field */}
                            <div className='pt-2'>
                                <label htmlFor="Primary Role">Primary Role </label>
                                <InputText
                                    style={{ width: '30vw',height:'5vh' }}
                                    id="edit_input"
                                    value={userInfo.rolename}
                                    type="text"
                                    disabled={true}
                                />
                            </div>

                            {/* RegisteredDate Input Field */}
                            <div className='pt-2'>
                                <label htmlFor="Registered Date">Registered Date </label>
                                <InputText
                                    style={{ width: '30vw',height:'5vh' }}
                                    id="edit_input"
                                    value={userInfo.createdon.slice(5,16)}
                                    type="text"
                                    disabled={true}
                                />
                            </div>
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