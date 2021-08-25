import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as actionTypes from '../../login/state/action';
import { ScrollBar, ScreenOverlay, Messages as MSG } from '../../global'
import { manageUserDetails } from '../../admin/api'
import { Header, FormInput } from '../components/AllFormComp'

import classes from '../styles/EditUser.module.scss'

/*Component EditUser
  use: Settings middle screen for Edit User. 
  props: resetMiddleScreen, setMiddleScreen
  TODO -  update userInfo dispatch();
*/
const EditUser = (props) => {
    const dispatch = useDispatch();
    const userInfo = useSelector(state => state.login.userinfo);
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
    const setPopupState=props.setPopupState;

    const click = () => {
        setPrevPassword("");
        setNewConfirmPassword("");
        setNewPassword("");
        setIsEmail(true);
        setIsFirstName(true);
        setIsLastName(true);
        setIsPrevPassword(true);
        setIsNewPassword(true);
        setIsNewConfirmPassword(true);
        setFirstName(userInfo.firstname);
        setLastName(userInfo.lastname);
        setEmail(userInfo.email_id);
    }

    useEffect(() => {
        click();
    }, [props.resetMiddleScreen["editUser"], userInfo])
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
        if (!validate(newPassword, "password", setIsNewPassword)) {
            check = false;
        }
        if (!validate(prevPassword, "password", setIsPrevPassword)) {
            check = false;
        }
        if (!validate(newConfirmPassword, "password", setIsNewConfirmPassword)) {
            check = false;
        }
        if (!validate(email, "email", setIsEmail)) {
            check = false;
        }
        if (check && newPassword !== newConfirmPassword) {
            check = false;
            setIsNewPassword(false);
            setIsNewConfirmPassword(false);
        }
        if (!check) {
            setLoading(false);
            setPopupState(MSG.SETTINGS.ERR_INVALID_INFO);
            return;
        }

        let userObj = {
            userid: userInfo['user_id'],
            username: userInfo.username,
            password: newPassword,
            currpassword: prevPassword,
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
                    dispatch({type:actionTypes.SET_USERINFO, payload: { ...userInfo, ['email_id']: userObj.email, firstname: userObj.firstname, lastname: userObj.lastname}})
                    setPopupState(MSG.SETTINGS.SUCC_INFO_UPDATED);
                    click();
                } else {
                    setPopupState(MSG.GLOBAL.ERR_SOMETHING_WRONG);
                    click();
                }
            }
            catch (error) {
                setPopupState(MSG.GLOBAL.ERR_SOMETHING_WRONG);
                click();
            }
        })()
    }

    return <>
        {loading ? <ScreenOverlay content={loading} /> : null}
        <Header heading="Edit User" />
        <div className={classes["stng_edit_user"]}>
        <div className={classes["stng__ab"]}>
        <div className={classes["stng__min"]}>
        <div className={classes["stng__con"]} id="stngCon">
        <ScrollBar thumbColor="#929397" scrollId="stngCon">
        <form data-test="form-test" onSubmit={updateSubmitHandler} className={classes["edit-user-form"]}>
            <div className={classes["action-div"]}>
                <button data-test="update-test" type="submit" className={classes["action-button"]}>Update</button>
            </div>
            <div className={classes["edit-user"]}>
                <div className={`col-xs-9 ${classes["form-group"]}`} >
                    <label htmlFor="first_name">First Name</label>
                    <FormInput data-test="first-name-test" type="text" className={`${classes["all-inputs"]}  ${!isFirstName ? classes["invalid"] : ""}`} placeholder="First Name" value={firstName}
                        onChange={(event) => { setFirstName(event.target.value) }} />
                </div>
                <div className={`col-xs-9 ${classes["form-group"]}`} >
                    <label htmlFor="last_name">Last Name</label>
                    <FormInput data-test="last-name-test" type="text" className={`${classes["all-inputs"]} ${!isLastName ? classes["invalid"] : ""}`} placeholder="Last Name" value={lastName}
                        onChange={(event) => { setLastName(event.target.value) }} />
                </div>
                <div className={`col-xs-9 ${classes["form-group"]}`} >
                    <label htmlFor="present_password">Old Password</label>
                    <FormInput data-test="password-1-test" type="password" className={`${classes["all-inputs"]}   ${!isPrevPassword ? classes["invalid"] : ""}`} placeholder="Old Password" value={prevPassword}
                        onChange={(event) => { setPrevPassword(event.target.value) }} />
                </div>
                <div className={`col-xs-9 ${classes["form-group"]}`} >
                    <label htmlFor="new_password">New Password</label>
                    <FormInput data-test="password-2-test" type="password" className={`${classes["all-inputs"]} ${!isNewPassword ? classes["invalid"] : ""}`} placeholder="New Password" value={newPassword}
                        onChange={(event) => { setNewPassword(event.target.value) }} />
                </div>
                <div className={`col-xs-9 ${classes["form-group"]}`} >
                    <label htmlFor="confirm_new_password">Confirm New Password</label>
                    <FormInput data-test="password-3-test" type="password" className={`${classes['all-inputs']} ${!isNewConfirmPassword ? classes["invalid"] : ""}`} placeholder="Confirm New Password" value={newConfirmPassword}
                        onChange={(event) => { setNewConfirmPassword(event.target.value) }} />
                </div>
                <div className={`col-xs-9 ${classes["form-group"]}`}>
                    <label htmlFor="email">Email</label>
                    <FormInput data-test="email-test" type="email" className={`${classes["all-inputs"]} ${!isEmail ? classes["invalid"] : ""}`} placeholder="Email Id" value={email}
                        onChange={(event) => { setEmail(event.target.value) }} />
                </div>
            </div>
        </form>
        </ScrollBar>
        </div></div></div></div>
    </>
}

const validate = (value, id, update) => {
    var regex;
    if (id === "password")
        regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
    else if (id === "email")
        regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
    if (regex.test(value)) {
        update(true);
        return true;
    }
    update(false);
    return false;
}

export default EditUser;