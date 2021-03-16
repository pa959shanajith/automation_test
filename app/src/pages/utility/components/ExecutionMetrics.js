import React, { useRef, useState } from  'react';
import { useHistory } from 'react-router-dom';
import { RedirectPage } from '../../global';
import CalendarComp from './CalendarComp';
import { fetchMetrics } from '../api';
import "../styles/ExecutionMetrics.scss";

const ExecutionMetrics = props => {

    const history = useHistory();

    const lob = useRef();
    const status = useRef();
    const executionId = useRef();

    const [error, setErrors] = useState({});
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const handleReset = () => {
        setFromDate("");
        setToDate("");
        lob.current.value = "";
        status.current.value = "";
        executionId.current.value = "";
    }

    const handleSubmit = () => {
        let arg;
        let err;

        if (!fromDate || !toDate || !lob.current.value){
            err = {fromDate: !fromDate, toDate: !toDate, lob: !lob.current.value};
        } else {
            arg = {
                ui: true,
                fromDate: fromDate,
                toDate: toDate,
                LOB: lob.current.value,
                status: status.current.value,
                executionID: executionId.current.value
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
            <span className="taskname">
                Execution Metrics
            </span>
        </div>
        <div className="execM__btnGroup">
            <button onClick={handleSubmit}>Fetch</button>
            <button onClick={handleReset}>Reset</button>
        </div>
        <div className="execM__inputGroup">
            <Label name="From Date" star={true} />
            <CalendarComp date={fromDate} setDate={(val)=>setFromDate(val)} error={error.fromDate} />

            <Label name="To Date" star={true} />
            <CalendarComp date={toDate} setDate={(val)=>setToDate(val)} error={error.toDate} />

            <Label name="LOB" star={true} />
            <Input inputRef={lob} placeholder="Enter LOB" error={error.lob} />

            <Label name="Status" />
            <Input inputRef={status} placeholder="Enter Status" />

            <Label name="ExecutionID" />
            <Input inputRef={executionId} placeholder="Enter Execution ID"/>
        </div>
    </> );
}

const Star = () => <span className="execM__mandate">*</span>;

const Input = props => <input className={"execM__input" + (props.error ? " execM__inputError":"")} ref={props.inputRef} placeholder={props.placeholder}/>;

const Label = props => <span className="execM__inputLabel">{props.name}{props.star && <Star />}</span>;



export default ExecutionMetrics;