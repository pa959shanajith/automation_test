import React, { useState, useEffect } from 'react';
import { ModalContainer } from "../../global";
import "../styles/DetailsDialog.scss";

/*
    Component: Details Dialog
    Uses: Renders details dialog for each row's actual/pass/fail inputs
    Props: 
        setShow -> show/hide dialog setState
        onSetRowData -> Method for on saving the changes
        TCDetails -> testcase's testcasedetails field
        idx -> index of row
*/

const DetailsDialog = ({setShow, onSetRowData, TCDetails, idx}) => {

    const [res, setRes] = useState("");
    const [pass, setPass] = useState("");
    const [fail, setFail] = useState("");

    useEffect(()=>{
        let newTCDetails = TCDetails;
        if (typeof TCDetails !== "object" && TCDetails !== "") newTCDetails = JSON.parse(TCDetails);
        else if (TCDetails === "") newTCDetails = { testcaseDetails: "", actualResult_pass: "", actualResult_fail: "" };

        setRes(newTCDetails.testcaseDetails || "");
        setPass(newTCDetails.actualResult_pass || "");
        setFail(newTCDetails.actualResult_fail || "");
    }, [])

    const onResChange = event => setRes(event.target.value);
    const onPassChange = event => setPass(event.target.value);
    const onFailChange = event => setFail(event.target.value);

    const onReset = () => {
        setRes("");
        setPass("");
        setFail("");
    }

    const onSave = () => {
        let TCDetail = "";
        if (res.trim() || pass.trim() || fail.trim()) {
            TCDetail = { testcaseDetails: "" || res.trim(),
                         actualResult_pass: "" || pass.trim(), 
                         actualResult_fail: "" || fail.trim()
                        }    
        }
        // onSaveDetails(idx, TCDetail === "" ? "" : JSON.stringify(TCDetail));
        onSetRowData({rowIdx: idx, operation: "details", details: TCDetail === "" ? "" : JSON.stringify(TCDetail)});
        setShow(false);
    }

    return (
        <div className="d__details_container" data-test="d__ddc">
            <ModalContainer 
                title="Add Test Step Details"
                content={
                    <div className="d__detail_input_group">
                    <input data-test="d__ddinp" className="d__detail_input" placeholder="Enter Expected Result" value={res} onChange={onResChange}/>
                    <input data-test="d__ddinp" className="d__detail_input" placeholder="Enter Actual Result for Pass Status" value={pass} onChange={onPassChange}/>
                    <input data-test="d__ddinp" className="d__detail_input" placeholder="Enter Actual Result for Fail Status" value={fail} onChange={onFailChange}/>
                    </div>
                }
                footer={
                    <>
                    <button data-test="d__ddbtn" onClick={onReset}>Reset</button>
                    <button data-test="d__ddbtn" onClick={onSave}>Save</button>
                    </>
                }
                close={
                    ()=>setShow(false)
                }

            />
        </div>
    );
}

export default DetailsDialog;
