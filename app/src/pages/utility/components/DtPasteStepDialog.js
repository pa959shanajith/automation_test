import React, { useState } from 'react';
import { ModalContainer } from '../../global';
import "../styles/DtPasteStepDialog.scss";

/*
    Component: Paste Steps Dialog
    Uses: Renders small dialog box to input test step number to paste after
    Props: 
        setShow -> show/hide dialog setState
        upperLimit -> maximum size of testcases / testcase array length
        pasteSteps -> method to call when pressing paste
*/

const DtPasteStepDialog = (props) => {

    const [stepNum, setStepNum] = useState("");
    const [pasteError, showPasteError] = useState("");
    const pasteErrors = { 'empty': '*Textbox cannot be empty',
                        'invalidChar': '*Textbox can only contain numbers',
                        'invalidStep': '*Please enter a valid step no'
                    }

    const pasteCopiedSteps = () => {
        showPasteError("");
        if (stepNum){
            if (/[0-9]+$/.test(stepNum)){
                let pass = true;
                let stepInt = parseInt(stepNum)
                if (isNaN(stepInt)) {
                    showPasteError('invalidChar');
                    pass = false;
                }
                if(stepInt > props.upperLimit || stepInt < 0) {
                    showPasteError('invalidStep');
                    pass = false;
                }
                if (pass) {
                    props.pasteData(stepNum);
                    setStepNum("");
                }
            }
            else showPasteError('invalidChar')
        }
        else showPasteError('empty');
    }

    const PSHandler = event => {
        let value = event.target.value
        value = value.replace(/[^0-9]/g, "")
        setStepNum(value)
    };
    
    return (<ModalContainer 
        data-test="d__psd"
        modalClass="modal-sm"
        title="Paste Test Step"
        content={
        <div className="ps_dialog"> 
            <div className="ps_lbl" data-test="d__pslbl">Paste after {props.pasteType==="rows" ? "Row No." : "Column No."}:</div>
            <input data-test="d__psinp" className="ps_input" placeholder="Enter a value" onChange={PSHandler} value={stepNum}/>
            { pasteError && 
                <div data-test="d__pserrmsg" className="ps_error">{pasteErrors[pasteError]}</div>
            }
        </div>}
        close={()=>{
            setStepNum("");
            showPasteError("");
            props.setShow(false)
        }}
        footer={ <button onClick={pasteCopiedSteps} data-test="d__psbtn">Submit</button> }
    />
)
}

export default DtPasteStepDialog;