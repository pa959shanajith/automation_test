import React, { useState } from 'react';
import { ModalContainer } from "../../global";

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

    const [res, setRes] = useState(TCDetails.testcaseDetails || "" );
    const [pass, setPass] = useState(TCDetails.actualResult_pass || "");
    const [fail, setFail] = useState(TCDetails.actualResult_fail || "");

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
        <div className="d__details_container">
            <ModalContainer 
                title="Add Test Step Details"
                content={
                    <div className="d__detail_input_group">
                    <input className="d__detail_input" placeholder="Enter Expected Result" value={res} onChange={onResChange}/>
                    <input className="d__detail_input" placeholder="Enter Actual Result for Pass Status" value={pass} onChange={onPassChange}/>
                    <input className="d__detail_input" placeholder="Enter Actual Result for Fail Status" value={fail} onChange={onFailChange}/>
                    </div>
                }
                footer={
                    <>
                    <button onClick={onReset}>Reset</button>
                    <button onClick={onSave}>Save</button>
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
