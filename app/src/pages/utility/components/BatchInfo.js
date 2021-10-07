import React, { useState, useEffect } from 'react';

import classes from "../styles/BatchInfo.module.scss";



const BatchInfo = props => {
    const [batchInfo, setBatchInfo] = useState("");
    const setBatch = props.setBatch;
    const resetReqData = props.resetReqData;
    const reset = props.reset;
    const [error, setError] = useState(false);
    useEffect(() => {
        setError(false);
        if(batchInfo.length === 0){
            setBatch(undefined);
            return;
        }
        try {
            setBatch({
                ...JSON.parse(batchInfo)
            })
        }
        catch (err) {
            setBatch(undefined);
            setError(true);
        }
    }, [batchInfo])

    useEffect(() => {
        setBatchInfo("")
    }, [reset])

    const onChangeBatchInfo = (e) => {
        setBatchInfo(e.target.value);
        resetReqData();
    }

    return (<>
        <span className={classes["b-info__inputLabel"]} >Batch Info<span className={classes["b-info__mandate"]}>*</span></span>
        <textarea type="text" className={classes["b-info-text-box"] + " " + (error === true || props.error === true ? classes["b-info__inputError"] : "")} value={batchInfo} placeholder="Enter Batch Info in JSON format" onChange={onChangeBatchInfo} />
    </>);
}

export default BatchInfo;