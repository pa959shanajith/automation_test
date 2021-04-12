import React, { useState } from 'react';
import { ModalContainer } from '../../global';
import "../styles/SelectMultipleDialog.scss";

/*
    Component: Select Steps Dialog
    Uses: Renders small dialog box to select testcases
    Props: 
        setShow -> show/hide dialog setState
        upperLimit -> maximum size of testcases / testcase array length
        selectSteps -> method to call when pressing select
*/

const SelectMultipleDialog = props => {

    const [stepNum, setStepNum] = useState("");
    const [selectError, showSelectError] = useState("");
    const selectErrors = { 'empty': '*Textbox cannot be empty',
                        'invalidFormat': 'Invalid format is given',
                        'invalidStep': '*Please enter a valid step no'
                    }

    const SMHandler = event =>{
        let value = event.target.value
        //eslint-disable-next-line
        value = value.replace(/[^0-9;\-]/g, "")
        setStepNum(value)
    }

    const selectSteps = () =>{
        showSelectError("");
        if (stepNum){
            if (/^(?:\d+(?:-\d+)?(;(?!$)|$))+$/.test(stepNum)){
                let pass = true
                let steps = new Set();
                let stepBlockList = stepNum.split(";");

                for(let stepBlock of stepBlockList) {
                    let stepsArray = stepBlock.split("-");
                    if (stepsArray.length === 1){
                        let stepInt = parseInt(stepsArray[0])
                        if (isNaN(stepInt) || stepInt > props.upperLimit || stepInt < 1) {
                            if (isNaN(stepInt)) showSelectError('invalidFormat');
                            else showSelectError('invalidStep');
                            pass = false
                            break;
                        }
                        else steps.add(stepInt-1);
                    }
                    else if(stepsArray.length === 2){
                        let lowStep = parseInt(stepsArray[0])
                        let highStep = parseInt(stepsArray[1])
                        if (isNaN(lowStep) || isNaN(highStep) || lowStep > props.upperLimit || lowStep < 1 || highStep > props.upperLimit || highStep < 1 || lowStep === highStep || lowStep>highStep){
                            if (isNaN(lowStep) || isNaN(highStep)) showSelectError('invalidFormat');
                            if (lowStep === highStep) showSelectError('invalidFormat');
                            else showSelectError('invalidStep');
                            pass = false
                            break;
                        }
                        else for (let i=lowStep; i<=highStep; i++) steps.add(i-1);
                    }
                    else{
                        showSelectError('invalidStep');
                    }
                }
                if (pass) {
                    props.selectSteps(Array.from(steps));
                    setStepNum("");
                }
            }
            else showSelectError('invalidFormat')
        }
        else showSelectError('empty');
    }

    return (<ModalContainer 
        title="Select Test Step(s)"
        modalClass="modal-sm"
        content={
        <div className="sm_dialog"> 
            <div className="sm_lbl" data-test="d__smlbl">Select step(s) no:</div>
            <div className="sm_hint" data-test="d__smlbl">For multiple select. Eg: 5;10-15;20;22</div>
            <input className="sm_input" data-test="d__sminp" placeholder="Enter a value" onChange={SMHandler} value={stepNum}/>
            { selectError && 
                <div className="sm_error" data-test="d__smerror">{selectErrors[selectError]}</div>            }
        </div>}
        close={()=>{
            setStepNum("");
            showSelectError("");
            props.setShow(false)
        }}
        footer={
            <button onClick={selectSteps} data-test="d__smactionbtn">Submit</button>
        }
    />
)
}

export default SelectMultipleDialog;
