import React, { useState } from  'react';
import { useHistory } from 'react-router-dom';
import { RedirectPage, CalendarComp, Messages as MSG, setMsg } from '../../global';
import { fetchMetrics } from '../api';
import "../styles/ExecutionMetrics.scss";

const ExecutionMetrics = ({setBlockui}) => {

    const history = useHistory();

    const [error, setErrors] = useState({});
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [lob, setLob] = useState("");
    const [status, setStatus] = useState("");
    const [executionId, setExecutionId] = useState("");

    const handleReset = () => {
        setFromDate("");
        setToDate("");
        setLob("");
        setStatus("");
        setExecutionId("");
        setErrors({});
    }

    const handleSubmit = () => {
        let arg;
        let err;

        if (!fromDate || !toDate || !lob){
            err = {fromDate: !fromDate, toDate: !toDate, lob: !lob};
        } else {
            arg = {
                ui: true,
                fromDate: fromDate,
                toDate: toDate,
                LOB: lob,
            }
            if (executionId.trim()) arg['executionId'] = executionId.trim();
            if (status.trim()) arg['status'] = status.trim();
        }

        if (err) setErrors(err);
        else {
            let sd = fromDate.split('-');
            let ed = toDate.split('-');
            let start_date = new Date(sd[2] + '-' + sd[1] + '-' + sd[0]);
            let end_date = new Date(ed[2] + '-' + ed[1] + '-' + ed[0]);

            if (end_date < start_date) setErrors({ fromDate: true, toDate: true });
            else {
                setBlockui({show: true, content: 'Fetching Metrics...'})
                fetchMetrics(arg)
                .then(result => {
                    setBlockui({ show: false })
                    if (result === "Invalid Session") return RedirectPage(history);
                    else if (result === "fail") setMsg(MSG.UTILITY.ERR_EXPORT_EXE_METRICS);
                    else if (result === "NoRecords") setMsg(MSG.UTILITY.ERR_NO_RECORDS);
                    else if (result === "InvalidExecId") setMsg(MSG.UTILITY.ERR_INVALID_EXEC_ID);
                    else if (result === "InvalidStatus") setMsg(MSG.UTILITY.ERR_INVALID_STATUS);
                    else if (result.error) setMsg(result.error);
                    else {
                        let isIE = false || !!document.documentMode;
                        let file = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                        if (isIE) {
                            navigator.msSaveOrOpenBlob(file);
                        } else {
                            let fileURL = URL.createObjectURL(file);
                            let a = document.createElement('a');
                            a.href = fileURL;
                            a.download = 'metrics.csv';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(fileURL);
                        }
                        setMsg(MSG.UTILITY.SUCC_EXPORTED);
                    }
                    setErrors({});
                })
                .catch(error => {
                    setMsg(MSG.UTILITY.ERR_FAILED);
                    setErrors({});
                    console.error(error);
                });
            }
        }
    }
 
    return ( <>
        <div className="page-taskName" >
            <span className="taskname" data-test="util__pageTitle">
                Execution Metrics
            </span>
        </div>
        <div className="execM__btnGroup">
            <button onClick={handleSubmit} data-test="util__fetch" title="Fetch">Fetch</button>
            <button onClick={handleReset} data-test="util__reset" title="Reset">Reset</button>
        </div>
        <div className="execM__inputGroup">
            <span className="execM__inputLabel" data-test="util__inputLabel">From Date<span className="execM__mandate">*</span></span>
            <CalendarComp execMetrics={true} date={fromDate} setDate={(val)=>setFromDate(val)} error={error.fromDate} />

            <span className="execM__inputLabel" data-test="util__inputLabel">To Date<span className="execM__mandate">*</span></span>
            <CalendarComp execMetrics={true} date={toDate} setDate={(val)=>setToDate(val)} error={error.toDate} />

            <span className="execM__inputLabel" data-test="util__inputLabel">LOB<span className="execM__mandate">*</span></span>
            <input data-test="util__input" className={"execM__input" + (error.lob ? " execM__inputError":"")} placeholder="Enter LOB" value={lob} onChange={(e)=>setLob(e.target.value)} />

            <span className="execM__inputLabel" data-test="util__inputLabel">Status</span>
            <input data-test="util__input" className={"execM__input" + (error.status ? " execM__inputError":"")} placeholder="Enter Status" value={status} onChange={(e)=>setStatus(e.target.value)} />

            <span className="execM__inputLabel" data-test="util__inputLabel">ExecutionID</span>
            <input data-test="util__input" className={"execM__input" + (error.status ? " execM__inputError":"")} placeholder="Enter Execution ID" value={executionId} onChange={(e)=>setExecutionId(e.target.value)} />
        </div>
    </> );
}

export default ExecutionMetrics;