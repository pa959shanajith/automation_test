import React, { useState, useEffect } from 'react';

import classes from "../styles/ReportApi.module.scss";


const ReportApi = props => {
    const [executionID, setExecutionID] = useState("");
    const [scenario, setScenario] = useState("");
    const [scenarioID, setScenarioID] = useState([]);
    const error = props.error;
    const resetReqData = props.resetReqData;
    const reset = props.reset;

    useEffect(() => {
        setExecutionID("");
        setScenario("");
        setScenarioID([]);
    }, [reset])
    useEffect(() => {
        props.setResult(() => {
            return {
                execution_data: {
                    executionId: executionID.trim(),
                    scenarioIds: scenarioID
                }
            }
        })
    }, [scenarioID, executionID])
    useEffect(()=>{
        let scenID = scenario.split(',').map(element => {
            return element.trim();
        });
        scenID = scenID.filter((item)=>item.length>0);
        setScenarioID(scenID);
    },[scenario])

    const scenarioChangeHandler = event => {
        let scen = event.target.value;
        setScenario(scen);
        resetReqData();
    }


    return (<>
        <span className={classes["r-api__inputLabel"]} >Execution ID<span className={classes["r-api__mandate"]}>*</span></span>
        <input data-test="exec-id-test" className={classes["r-api__input"] + " " + (error.executionId === true ? classes["r-api__inputError"] : "")} placeholder="Enter Execution ID" value={executionID} onChange={(e)=>{setExecutionID(e.target.value);resetReqData()}} />
        <span className={classes["r-api__inputLabel"]} >Scenario IDs<span className={classes["r-api__mandate"]}>*</span></span>
        <textarea data-test="scen-id-test" type="text" className={classes["r-api-text-box"] + " " + (error.scenarioIds === true ? classes["r-api__inputError"] : "")} value={scenario} placeholder="Enter Scenario IDs seperated by commas" onChange={scenarioChangeHandler} />
    </>);
}

export default ReportApi;