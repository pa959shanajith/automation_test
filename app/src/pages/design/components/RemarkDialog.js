import React, { useState } from 'react';
import { ModalContainer } from "../../global";
import "../styles/RemarkDialog.scss";

/*
    Component: Remark Dialog
    Uses: Renders Remark dialog box to input remark for specific row
    Props: 
        setShow -> show/hide dialog setState
        onSetRowData -> Method for on saving the changes
        remarks -> testcase's remark field
        idx -> index of row
        firstname -> userinfo's field / user's first name
        lastname -> userinfo's field / user's last name
*/

const RemarkDialog = ({setShow, onSetRowData, remarks, idx, firstname, lastname}) => {
    
    const [remarkError, setRemarkError] = useState(false);
    const [remark, setRemark] = useState("");

    const onRemarkChange = event => {
        if (remarkError) setRemarkError(false);
        let value = event.target.value;
        value = value.replace(";", "")
        setRemark(value);
    }

    const submitRemark = () => {
        let remarkVal = remark.trim()
        if (!remarkVal) {
            setRemark("");
            setRemarkError(true)
        }
        else{
            let date = new Date();
			let DATE = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
			let TIME = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            remarkVal = `${remarkVal} (From: ${firstname} ${lastname} On: ${DATE} ${TIME})`;
            let Arr = []
            if (remarks !== "") Arr = remarks.split(";")
            let remarkArr = [...Arr];
            remarkArr.push(remarkVal);
            let remarkString = remarkArr.join(";")
            setRemark("");
            // saveRemarks(parseInt(showRemarkDlg), remarkString)
            onSetRowData({rowIdx: parseInt(idx), operation: "remarks", remarks: remarkString})
            setShow(false);
        }
    }

    return ( <div className="remark_container">
        <ModalContainer
            title="Remarks"
            content={
                <div className="d__add_remark_content">
                    { 
                        remarks.split(';').filter(remark => remark.trim()!=="").length > 0 &&
                        <>
                        <div className="remark_history_lbl">History</div>
                        <div className="remark_history_content">
                            { remarks.split(';').filter(remark => remark.trim()!=="").map((remark, idx)=><li key={idx}>{remark}</li>) }
                        </div>
                        </>
                    }
                    <div className="d__add_remark_lbl">Add Remarks</div>
                    <textarea className={"remark_input" + (remarkError ? " remark_error" : "")} value={remark} onChange={onRemarkChange} />
                </div>
            }
            footer={
                <button onClick={submitRemark}>Submit</button>
            }
            close={()=>{
                setRemark("");
                setRemarkError(false);
                setShow(false)
            }}
        />
        </div>
    );
};


export default RemarkDialog;


