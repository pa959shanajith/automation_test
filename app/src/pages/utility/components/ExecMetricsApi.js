import React, { useState, useEffect } from  'react';
import {  CalendarComp } from '../../global';
import classes from "../styles/ExecMetricsApi.module.scss";

const ExecMetricsApi = props => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [lob, setLob] = useState("");
    const [status, setStatus] = useState("");
    const [executionId, setExecutionId] = useState("");
    const error = props.error;
    const resetReqData = props.resetReqData;
    const reset = props.reset
    useEffect(()=>{
        setFromDate("");
        setToDate("");
        setLob("");
        setStatus("");
        setExecutionId("");
    }, [reset])
    useEffect(()=>{
        props.setResult({
            metrics_data:{
                fromDate,
                toDate,
                LOB: lob,
                status,
                executionId
            }
        })
    }, [fromDate, toDate, lob, status, executionId])

    const setFromDateHandler = (date)=>{
        const arr = date.split("-");
        let newDate = `${arr[2]}-${arr[1]}-${arr[0]}`;
        setFromDate(newDate);
        resetReqData();
    }

    const setToDateHandler = (date)=>{
        const arr = date.split("-");
        let newDate = `${arr[2]}-${arr[1]}-${arr[0]}`;
        setToDate(newDate);
        resetReqData();
    }

    return ( <>
            <span className={classes["execM__inputLabel"]} >From Date<span className={classes["execM__mandate"]}>*</span></span>
            <CalendarComp data-test="from-date-test" execMetrics={true} date={fromDate} setDate={setFromDateHandler} error={error.fromDate} />

            <span className={classes["execM__inputLabel"]} >To Date<span className={classes["execM__mandate"]}>*</span></span>
            <CalendarComp data-test="to-date-test" execMetrics={true} date={toDate} setDate={setToDateHandler} error={error.toDate} />

            <span className={classes["execM__inputLabel"]} >LOB<span className={classes["execM__mandate"]}>*</span></span>
            <input data-test="lob-test" className={classes["execM__input"] + " " + (error.LOB ? classes["execM__inputError"]:"")} placeholder="Enter LOB" value={lob} onChange={(e)=>{setLob(e.target.value.trim());resetReqData()}} />

            <span className={classes["execM__inputLabel"]} >Status</span>
            <input data-test="status-test" className={classes["execM__input"]} placeholder="Enter Status" value={status} onChange={(e)=>{setStatus(e.target.value.trim());resetReqData()}} />

            <span className={classes["execM__inputLabel"]} >Execution ID</span>
            <input data-test="exec-test" className={classes["execM__input"]} placeholder="Enter Execution ID" value={executionId} onChange={(e)=>{setExecutionId(e.target.value.trim());resetReqData()}} />
    </> );
}

export default ExecMetricsApi;