import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as actionTypes from '../state/action';
import { ModalContainer, ScreenOverlay, Messages as MSG, setMsg } from "../../global";
import "../styles/LoginModal.scss";
import { getDetails_ZEPHYR } from '../api';

/* 
    props:
    urlRef: handles URL
    usernameRef: handles Username
    passwordRef: handles Password
    authtokenRef: handles API Token
    screenType: Checks ScreenType ALM/qTest/Zephyr
    login: Function to call LoginAPI
    error: Error Message to display
*/
const LoginModal = props => {

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({});

    const onSubmit = () => {
        let error = {};
        if((props.screenType==="Zephyr"&&props.authType==="basic") || props.screenType!=="Zephyr") {
            if (!props.urlRef.current.value) error={ url: true, msg: "Please Enter URL."};
            else if (!props.usernameRef.current.value) error={username: true, msg: "Please Enter User Name."};
            else if (!props.passwordRef.current.value) error={password: true, msg: "Please Enter Password."};
            setError(error);
        } else if (props.screenType==="Zephyr"&&props.authType==="token") {
            if (!props.urlRef.current.value) error={ url: true, msg: "Please Enter URL."};
            else if(!props.authtokenRef.current.value) error={authtoken: true, msg: "Please Enter API Token."};
            setError(error);
        }
        if(Object.keys(error).length==0) props.login();
    }

    const populateFields=async(authtype)=>{
        if(authtype==="token") {
            props.urlRef.current.value="";
            props.usernameRef.current.value="";
            props.passwordRef.current.value="";
        } else {
            props.urlRef.current.value="";
            if(props.authtokenRef.current!=undefined) props.authtokenRef.current.value="";
        }
        props.setLoginError(null);
        setError({});
    }
    const getZephyrDetails = async () =>{
        try {
            setLoading("Loading...")
            const data = await getDetails_ZEPHYR()
            if (data.error) { setMsg(data.error); return; }
            if(data !=="empty"){
                if(data.zephyrURL) props.urlRef.current.value = data.zephyrURL;
                if(data.zephyrToken) {
                    props.setAuthType("token");
                    if(data.zephyrToken) props.authtokenRef.current.value = data.zephyrToken;
                }
                else {
                    if(data.zephyrUsername) props.usernameRef.current.value = data.zephyrUsername;
                    if(data.zephyrPassword) props.passwordRef.current.value = data.zephyrPassword;
                }
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }
    useEffect(() => {
        props.screenType=="Zephyr" && getZephyrDetails();
    }, [])

    return (
        <div className="ilm__container">
            {loading ? <ScreenOverlay content={loading} /> : null}
            <ModalContainer 
                title={`${props.screenType} Login`}
                content={
                    <div className="ilm__inputs">
                        {props.screenType=="Zephyr" ? 
                        <div className='ilm__authtype_cont'>
                            <span className="ilm__auth" title="Authentication Type">Authentication Type</span>
                            <label className="authTypeRadio ilm__leftauth">
                                <input type="radio" value="basic" checked={props.authType==="basic"} onChange={()=>{props.setAuthType("basic");populateFields("basic")}}/>
                                <span>Basic</span>
                            </label>
                            <label className="authTypeRadio">
                                <input type="radio" value="token" checked={props.authType==="token"} onChange={()=>{props.setAuthType("token");populateFields("token")}}/>
                                <span>Token</span>
                            </label>
                        </div>:null}
                        <input
                            className={"ilm__input"+(error.url ? " ilm_input_error" : "")}
                            ref={props.urlRef}
                            placeholder={inpPlaceHolder[props.screenType].url}
                            data-test="intg_url_inp"
                        />
                        {(props.screenType=="Zephyr" && props.authType=="basic") || props.screenType !="Zephyr" ? 
                        <>
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
                        /></>:null}
                        {props.screenType=="Zephyr" && props.authType=="token" ? <input
                            className={"ilm__input"+(error.authtoken ? " ilm_input_error" : "")}
                            ref={props.authtokenRef}
                            placeholder={inpPlaceHolder[props.screenType].authtoken}
                            data-test="intg_authtoken_inp"
                        />:null}
                    </div>
                }
                footer={<>
                    <span data-test="intg_log_error_span" className="ilm__error_msg">{error.msg || props.error}</span>
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
        password : "Enter Zephyr Password",
        authtoken: "Enter API Token"
    },
    qTest : {
        url : "Enter qTest URL",
        username : "Enter qTest Username",
        password : "Enter qTest Password"
    }
}

export default LoginModal;