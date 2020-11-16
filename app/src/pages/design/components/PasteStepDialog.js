import React, { useState } from 'react';
import { PopupMsg } from '../../global';

/*
    Component: Paste Steps Dialog
    Uses: Renders small dialog box to input test step number to paste after
    Props: 
        setShow -> show/hide dialog setState
        upperLimit -> maximum size of testcases / testcase array length
        pasteSteps -> method to call when pressing paste
*/

const PasteStepDialog = (props) => {

    const [stepNum, setStepNum] = useState("");
    const [pasteError, showPasteError] = useState("");
    const pasteErrors = { 'empty': '*Textbox cannot be empty',
                        'invalidChar': '*Textbox cannot contain characters other than numbers seperated by single semi colon',
                        'invalidStep': '*Please enter a valid step no'
                    }

    const pasteCopiedSteps = () => {
        showPasteError("");
        if (stepNum){
            if (/^[0-9;]+$/.test(stepNum)){
                let pass = true
                let stepList = stepNum.split(";");
                for(let step of stepList){
                    let stepInt = parseInt(step)
                    if (isNaN(stepInt)) {
                        showPasteError('invalidChar');
                        pass = false
                        break;
                    }
                    if(stepInt > props.upperLimit || stepInt < 0) {
                        showPasteError('invalidStep');
                        pass = false
                        break;
                    }
                }
                if (pass) {
                    props.pasteSteps(stepList);
                    setStepNum("");
                }
            }
            else showPasteError('invalidChar')
        }
        else showPasteError('empty');
    }

    const PSHandler = event => {
        let value = event.target.value
        value = value.replace(/[^0-9;]/g, "")
        setStepNum(value)
    };
    
    return (<PopupMsg 
        title="Paste Test Step"
        content={
        <div className="ps_dialog"> 
            <div className="ps_lbl">Paste after step no:</div>
            <div className="ps_hint">For multiple paste. Eg: 5;10;20</div>
            <input className="ps_input" placeholder="Enter a value" onChange={PSHandler} value={stepNum}/>
            { pasteError && 
                <div className="ps_error">{pasteErrors[pasteError]}</div>
            }
        </div>}
        close={()=>{
            setStepNum("");
            showPasteError("");
            props.setShow(false)
        }}
        submitText="Submit"
        submit={()=>pasteCopiedSteps()}
    />
)
}

export default PasteStepDialog;