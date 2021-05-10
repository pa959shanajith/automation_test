import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as actionTypes from '../state/action';
import { ModalContainer } from "../../global";
import "../styles/LoginModal.scss";

/* 
    props:
    urlRef: handles URL
    usernameRef: handles Username
    passwordRef: handles Password
    screenType: Checks ScreenType ALM/qTest/Zephyr
    login: Function to call LoginAPI
    error: Error Message to display
*/
const LoginModal = props => {

    const dispatch = useDispatch();
    const [error, setError] = useState({});

    const onSubmit = () => {
        let error = {};
        if (!props.urlRef.current.value) error={ url: true, msg: "Please Enter URL"};
        else if (!props.usernameRef.current.value) error={username: true, msg: "Please Enter User Name."};
        else if (!props.passwordRef.current.value) error={password: true, msg: "Please Enter Password."};
        else props.login();
        setError(error);
    }

    return (
        <div className="ilm__container">
            <ModalContainer 
                title={`${props.screenType} Login`}
                content={
                    <div className="ilm__inputs">
                        <input
                            className={"ilm__input"+(error.url ? " ilm_input_error" : "")}
                            ref={props.urlRef}
                            placeholder={inpPlaceHolder[props.screenType].url}
                            data-test="intg_url_inp"
                        />
                        <input
                            className={"ilm__input"+(error.username ? " ilm_input_error" : "")}
                            ref={props.usernameRef}
                            placeholder={inpPlaceHolder[props.screenType].username}
                            data-test="intg_username_inp"
                        />
                        <input
                            className={"ilm__input"+(error.password ? " ilm_input_error" : "")}
                            ref={props.passwordRef}
                            type="password"
                            placeholder={inpPlaceHolder[props.screenType].password}
                            data-test="intg_password_inp"
                        />
                    </div>
                }
                footer={<>
                    <span data-test="intg_log_error_span" className="ilm__error_msg">{props.error || error.msg}</span>
                    <button data-test="intg_log_submit_btn" onClick={onSubmit}>Submit</button>
                </>}
                close={()=>dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null })}
            />
        </div>
    );
}

const inpPlaceHolder = {
    ALM : {
        url : "Enter ALM URL",
        username : "Enter ALM Username / Client ID",
        password : "Enter ALM Password / Client Secret Key"
    },
    Zephyr : {
        url : "Enter Zephyr URL (Ex. http(s)://SERVER[:PORT])",
        username : "Enter Zephyr Username",
        password : "Enter Zephyr Password"
    },
    qTest : {
        url : "Enter qTest URL",
        username : "Enter qTest Username",
        password : "Enter qTest Password"
    }
}

export default LoginModal;