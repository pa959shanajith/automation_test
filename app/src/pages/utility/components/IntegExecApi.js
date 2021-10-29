import React, { useState, useEffect } from 'react';

import classes from "../styles/ReportApi.module.scss";

const IntegExecApi = props => {
    const [url, setUrl] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [testSteps, setTestSteps] = useState("");
    const type = props.type;
    const error = props.error;
    const setInteg = props.setInteg;
    const resetReqData = props.resetReqData
    useEffect(()=>{
        console.log(props.error);
    }, [props])
    useEffect(() => {
        if (type === "qtest") {
            setInteg({
                integration: {
                    [type]: {
                        url: url.trim(),
                        username: username.trim(),
                        password: password.trim(),
                        qteststeps: testSteps.trim()
                    }
                }
            })
        } else if (type === "zephyr") {
            setInteg({
                integration: {
                    [type]: {
                        url: url.trim(),
                        username: username.trim(),
                        password: password.trim(),
                        apitoken:"",
                        authtype:""
                    }
                }
            })
        } else {
            setInteg({
                integration: {
                    [type]: {
                        url: url.trim(),
                        username: username.trim(),
                        password: password.trim()
                    }
                }
            })
        }
    }, [url, username, password, testSteps, type, setInteg])
    return (<>
        <span className={classes["r-api__inputLabel"]} >URL<span className={classes["r-api__mandate"]}>*</span></span>
        <input className={classes["r-api__input"] + " " + (error.url === true ? classes["r-api__inputError"] : "")} placeholder="Enter URL" value={url} onChange={(e) => { setUrl(e.target.value);resetReqData(); }} />
        <span className={classes["r-api__inputLabel"]} >Username<span className={classes["r-api__mandate"]}>*</span></span>
        <input className={classes["r-api__input"] + " " + (error.username === true ? classes["r-api__inputError"] : "")} placeholder="Enter Username" value={username} onChange={(e) => { setUsername(e.target.value);resetReqData(); }} />
        <span className={classes["r-api__inputLabel"]} >Password<span className={classes["r-api__mandate"]}>*</span></span>
        <input type="password" className={classes["r-api__input"] + " " + (error.password === true ? classes["r-api__inputError"] : "")} placeholder="Enter Password" value={password} onChange={(e) => { setPassword(e.target.value);resetReqData(); }} />
        { props.type === "qtest" ?
            <>
                <span className={classes["r-api__inputLabel"]} >Q Test Steps</span>
                <input className={classes["r-api__input"] + " " + (error.qteststeps === true ? classes["r-api__inputError"] : "")} placeholder="Enter Q Test Steps" value={testSteps} onChange={(e) => { setTestSteps(e.target.value);resetReqData(); }} />
            </>
            : null}
    </>);
}

export default IntegExecApi;