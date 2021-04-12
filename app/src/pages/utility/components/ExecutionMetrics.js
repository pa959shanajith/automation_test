import React, { useState } from  'react';
import { useHistory } from 'react-router-dom';
import { RedirectPage, CalendarComp } from '../../global';
import { fetchMetrics } from '../api';
import "../styles/ExecutionMetrics.scss";

const ExecutionMetrics = props => {

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
                status: status,
                executionId: executionId
            }
        }

        if (err) setErrors(err);
        else {
            let sd = fromDate.split('-');
            let ed = toDate.split('-');
            let start_date = new Date(sd[2] + '-' + sd[1] + '-' + sd[0]);
            let end_date = new Date(ed[2] + '-' + ed[1] + '-' + ed[0]);

            if (end_date < start_date) setErrors({ fromDate: true, toDate: true });
            else {
                props.setBlockui({show: true, content: 'Fetching Metrics...'})
                fetchMetrics(arg)
                .then(result => {
                    props.setBlockui({ show: false })
                    if (result === "Invalid Session") return RedirectPage(history);
                    else if (result === "fail") props.setPopup({title: "Fail", content: "Error while exporting Execution Metrics", submitText: "OK", show: true });
                    else if (result === "NoRecords") props.setPopup({title: "Fail", content: "No records found", show: true, submitText: "OK"});
                    else if (result.error) props.setPopup({title: "Fail", content: result.error, show: true, submitText: "OK"});
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
                        props.setPopup({
                            title: "Success", 
                            content: "Successfully exported Execution Metrics to CSV",
                            submitText: "OK",
                            show: true
                        });
                    }
                })
                .catch(error => {
                    props.setPopup({
                        title: "ERROR", 
                        content: "Failed!",
                        submitText: "OK",
                        show: true
                    });
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
            <button onClick={handleSubmit} data-test="util__fetch">Fetch</button>
            <button onClick={handleReset} data-test="util__reset">Reset</button>
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