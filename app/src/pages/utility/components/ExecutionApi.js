import React, { useState, useEffect } from 'react';
import IntegExecApi from './IntegExecApi';
import GitInfo from './GitInfo';
import BatchInfo from './BatchInfo'

import classes from '../styles/ExecutionApi.module.scss';
import MultiSelectDropdown from '../../global/components/MultiSelectDropdown';

const source = "api";
const ExecutionApi = props => {
    const [execMod, setExecMod] = useState("serial");
    const [execEnv, setExecEnv] = useState("default");
    const [info, setInfo] = useState("batchInfo");
    const [browser, setBrowser] = useState([]);
    const [gitInfo, setGitInfo] = useState({});
    const [batchInfo, setBatchInfo] = useState(undefined);
    const [integInfo, setIntegInfo] = useState({});
    const setResult = props.setResult;
    const resetReqData = props.resetReqData;
    const setIntegration = props.setIntegration;
    const integration = props.integration;
    const error = props.error;
    const reset = props.reset;

    useEffect(()=>{
        setExecMod("serial");
        setExecEnv("default");
        setInfo("batchInfo");
        setBrowser([]);
        setIntegration(-1);
        setGitInfo({});
        setBatchInfo(undefined);
        setIntegInfo({});
        resetReqData();
    }, [reset])

    useEffect(()=>{
        let integrationInfo = {
            "alm": {
                url: "",
                username: "",
                password: ""
            },
            "zephyr": {
                url: "",
                username: "",
                password: ""
            },
            "qtest": {
                url: "",
                username: "",
                password: "",
                qteststeps: ""
            },
        }
        if(integration === -1){
            setResult({
                executionData:{
                    source,
                    ExecutionMode: execMod,
                    executionEnv: execEnv,
                    browserType: browser,
                    [info]: info === 'gitInfo' ? gitInfo : batchInfo,
                    "integration": integrationInfo
                }
            })
        }else{
            if(integInfo["integration"]) integrationInfo[integration] = integInfo["integration"][integration];
            setResult({
                executionData:{
                    source,
                    ExecutionMode: execMod,
                    executionEnv: execEnv,
                    browserType: browser,
                    [info]: info === 'gitInfo' ? gitInfo : batchInfo,
                    "integration": integrationInfo
                }
            })
        }
    }, [execMod, execEnv, browser, gitInfo, integInfo, integration, batchInfo, info, setResult])
    return (<>
        <span className={classes["exec-api__inputLabel"]} >Execution Mode</span>
        <div className={classes["exec-api__FormGroup"]}>
            <label className="exec-api__FormRadio">
                <input data-test="exec-mode-test" type="radio" value="serial" checked={execMod === "serial"} name="ExecutionMode" onChange={(event)=>{setExecMod(event.target.value);resetReqData();}} />
                <span>Serial</span>
            </label>
            <label className="exec-api__FormRadio">
                <input data-test="exec-mode-test" type="radio" value="parallel" checked={execMod === "parallel"} name="ExecutionMode" onChange={(event)=>{setExecMod(event.target.value);resetReqData();}} />
                <span>Parallel</span>
            </label>
        </div>
        <span className={classes["exec-api__inputLabel"]} >Execution Environment</span>
        <div className={classes["exec-api__FormGroup"]}>
            <label>
                <input type="radio" value="default" data-test="exec-env-test" name="ExecutionEnv" checked={execEnv === "default"} onChange={(event)=>{setExecEnv(event.target.value);resetReqData();}}/>
                <span>Default</span>
            </label>
            <label>
                <input type="radio" data-test="exec-env-test" value="saucelab" name="ExecutionEnv" checked={execEnv === "saucelab"} onChange={(event)=>{setExecEnv(event.target.value);resetReqData();}} />
                <span>Sauce Lab</span>
            </label>
        </div>
        <span  className={classes["exec-api__inputLabel"]}>Select Browser</span>
        <MultiSelectDropdown data={browser} setData={setBrowser} inputPlaceholder={"Browser Selected"} dropdownOptions={dropdownOptions} resetReqData={resetReqData} />
        <span className={classes["exec-api__inputLabel"]}>Integration</span>
        <select data-test="integ-test" className={classes["exec-api__select"]} value={integration} onChange={(event) => { setIntegration(event.target.value);resetReqData(); }}>
            <option key={-1} value="-1">None</option>
            <option key={0} value="alm">ALM</option>
            <option key={1} value="qtest">Qtest</option>
            <option key={2} value="zephyr">Zephyr</option>
        </select>
        {integration === "alm" ? <IntegExecApi error={error.integration} setInteg = {setIntegInfo} type = {integration} resetReqData={resetReqData} /> : null}
        {integration === "qtest" ? <IntegExecApi error={error.integration} setInteg = {setIntegInfo} type = {integration} resetReqData={resetReqData} /> : null}
        {integration === "zephyr" ? <IntegExecApi error={error.integration} setInteg = {setIntegInfo} type = {integration} resetReqData={resetReqData} /> : null}
        <span className={classes["exec-api__inputLabel"]} >Data Source</span>
        <div className={classes["exec-api__FormGroup"]}>
            <label>
                <input type="radio" data-test="info-test" value="batchInfo" name="batchInfo" checked={info === "batchInfo"} onChange={(event)=>{setGitInfo({});setInfo(event.target.value);resetReqData();}} />
                <span>Batch Info</span>
            </label>
            <label>
                <input data-test="info-test" type="radio" value="gitInfo" name="gitInfo" checked={info === "gitInfo"} onChange={(event)=>{setBatchInfo(undefined);setInfo(event.target.value);resetReqData();}}/>
                <span>Git Info</span>
            </label>
        </div>
        {info === "gitInfo" ? <GitInfo reset={reset} setGit = {setGitInfo} error = {error.gitInfo} resetReqData={resetReqData} /> : null}
        {info === "batchInfo" ? <BatchInfo reset={reset} setBatch = {setBatchInfo} resetReqData={resetReqData}  error = {error.batchInfo}/> : null}
    </>);
}

const dropdownOptions = [{title:"Google Chrome", value:"1", text:"Google Chrome"},
                          {title:"Mozilla Firefox", value:"2", text:"Mozilla Firefox"},
                          {title:"Internet Explorer", value:"3", text:"Internet Explorer"},
                          {title:"Microsoft Edge", value:"7", text:"Microsoft Edge"},
                          {title:"Edge Chromium", value:"8", text:"Edge Chromium"}
                        ]


export default ExecutionApi;