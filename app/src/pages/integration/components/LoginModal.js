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
                            placeholder={
                                props.screenType === "Zephyr"
                                ? "Enter Zephyr URL (Ex. http(s)://SERVER[:PORT])"
                                : `Enter ${props.screenType} URL`
                            }
                            data-test="intg_url_inp"
                        />
                        <input
                            className={"ilm__input"+(error.username ? " ilm_input_error" : "")}
                            ref={props.usernameRef}
                            placeholder={`Enter ${props.screenType} Username`}
                            data-test="intg_username_inp"
                        />
                        <input
                            className={"ilm__input"+(error.password ? " ilm_input_error" : "")}
                            ref={props.passwordRef}
                            type="password"
                            placeholder={`Enter ${props.screenType} Password`}
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

export default LoginModal;