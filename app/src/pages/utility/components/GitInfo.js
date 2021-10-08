import React, { useState, useEffect } from 'react';

import classes from "../styles/GitInfo.module.scss";


const GitInfo = props => {
    const [config, setConfig] = useState("");
    const [branch, setBranch] = useState("");
    const [path, setPath] = useState("");
    const [version, setVersion] = useState("");
    const setGit = props.setGit
    const error = props.error;
    const resetReqData = props.resetReqData;
    const reset = props.reset;
    useEffect(()=>{
        setGit({})
    }, [reset])

    useEffect(()=>{
        setGit({
            gitConfiguration: config.trim(),
            gitbranch: branch.trim(),
            folderPath: path.trim(),
            gitVersion: version.trim()
        })
    }, [reset])


    return (<>
        <span className={classes["g-info__inputLabel"]} >Git Configuration<span className={classes["g-info__mandate"]}>*</span></span>
        <input data-test="g-config-test" className={classes["g-info__input"] + " " + (error.gitConfiguration === true ? classes["g-info__inputError"] : "")} placeholder="Enter Git Configuration" value={config} onChange={(e)=>{setConfig(e.target.value);resetReqData();}} />
        <span className={classes["g-info__inputLabel"]} >Git Branch<span className={classes["g-info__mandate"]}>*</span></span>
        <input data-test="g-branch-test" className={classes["g-info__input"] + " " + (error.gitbranch === true ? classes["g-info__inputError"] : "")} placeholder="Enter Git Branch" value={branch} onChange={(e)=>{setBranch(e.target.value);resetReqData();}} />
        <span className={classes["g-info__inputLabel"]} >Folder Path<span className={classes["g-info__mandate"]}>*</span></span>
        <input data-test="g-path-test" className={classes["g-info__input"] + " " + (error.folderPath === true ? classes["g-info__inputError"] : "")} placeholder="Enter Folder Path" value={path} onChange={(e)=>{setPath(e.target.value);resetReqData();}} />
        <span className={classes["g-info__inputLabel"]} >Git Version<span className={classes["g-info__mandate"]}>*</span></span>
        <input data-test="g-version-test" className={classes["g-info__input"] + " " + (error.gitVersion === true ? classes["g-info__inputError"] : "")} placeholder="Enter Git Version" value={version} onChange={(e)=>{setVersion(e.target.value);resetReqData();}} />
    </>);
}

export default GitInfo;