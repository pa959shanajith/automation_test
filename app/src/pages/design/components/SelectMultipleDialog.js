import React, { useState } from 'react';
import { PopupMsg } from '../../global';
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
                        'invalidChar': '*Textbox cannot contain characters other than numbers seperated by single semi colon or hyphen',
                        'invalidStep': '*Please enter a valid step no'
                    }

    const SMHandler = event =>{
        let value = event.target.value
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
                            if (isNaN(stepInt)) showSelectError('invalidChar');
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
                            if (isNaN(lowStep) || isNaN(highStep)) showSelectError('invalidChar');
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
            else showSelectError('invalidChar')
        }
        else showSelectError('empty');
    }

    return (<PopupMsg 
        title="Select Test Step(s)"
        content={
        <div className="sm_dialog"> 
            <div className="sm_lbl">Select step(s) no:</div>
            <div className="sm_hint">For multiple select. Eg: 5;10-15;20;22</div>
            <input className="sm_input" placeholder="Enter a value" onChange={SMHandler} value={stepNum}/>
            { selectError && 
                <div className="sm_error">{selectErrors[selectError]}</div>            }
        </div>}
        close={()=>{
            setStepNum("");
            showSelectError("");
            props.setShow(false)
        }}
        submitText="Submit"
        submit={()=>selectSteps()}
    />
)
}

export default SelectMultipleDialog;
