import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ModalContainer, ScrollBar } from '../../global';
import "../styles/DependentTestCaseDialog.scss";

const DependentTestCaseDialog = props => {

    const [check, setCheck] = useState(false);
    const [tcList, setTcList] = useState([]);
    const [checkList , setCheckList] = useState([]);

    useEffect(()=>{
        let testCases = [];
        let disableAndBlock = false;
        if (props.checkedTc <= 0) setCheck(true);
        else setCheck(false);

        for (let testCase of props.testCaseList) {
            let tc = testCase;
            if (tc.testCaseName === props.taskName) disableAndBlock = true;
            tc.disableAndBlock = disableAndBlock;

            if (props.checkedTc.includes(tc.testcaseId) && props.taskName !== tc.testCaseName) tc.checked = true;

            testCases.push(tc);
            setTcList(testCases);
        }
    }, []);

    const onSave = () => {
        
        var checkedLength = checkList.length;
        let checkedTestcases = [];
        if (checkedLength === 0) {
            // ERROR MSG
        } else {
            // HIDE ERROR MSG
            checkedTestcases = [...checkList];
            
            if (checkedTestcases.length > 0) {
                checkedTestcases.push(props.taskId.testCaseId);
                props.setShowDlg(false);
                props.setShowPop({'title': 'Dependent Test Cases', 'content': 'Dependent Test Cases saved successfully'});
                props.setDTcFlag(true);
                props.setCheckedTc(checkedTestcases);
            } else {
                props.setShowDlg(false);
                props.setShowPop({'title': 'Dependent Test Cases', 'content': 'Failed to save dependent testcases'});
            }
        }
    }

    return (
        <div className="dependentTestCaseContainer">
        <ModalContainer 
            title="Select Dependent Test Cases"
            content={
                <div className="testCasesList">
                    <div className="testCasesScrollContainer">    
                        <ScrollBar>
                            <div className="testCaseOverflow_div">
                                {
                                tcList.map(testCase=> <TestCaseItem testCase={testCase} setCheckList={setCheckList} checkList={checkList}/> )
                                }
                            </div>
                        </ScrollBar>
                    </div>
                </div>
            }
            footer={ <button onClick={onSave}>Save Dependent Test Cases</button> }
            close={()=>props.setShowDlg(false)}
        />
        </div>
    );
}

const TestCaseItem = ({testCase, setCheckList, checkList}) => {

    const [check, setCheck] = useState(testCase.disableAndBlock ? false : testCase.checked);

    const handleCheck = event => {
        let cl = [...checkList];
        if (event.target.checked) {
            setCheck(true);
            cl.push(testCase.testcaseId);
            setCheckList(cl);
        }
        else{
            setCheck(false);
            cl.splice(cl.indexOf(testCase.testcaseId), 1);
            setCheckList(cl);
        }
    }

    const onView = () => {

    }
    
    return (
        <div className="testCaseItem">
            <input className="tcCheck" type="checkbox" onChange={handleCheck} disabled={testCase.disableAndBlock} checked={check}/>
            <label className="tcName" >{testCase.testCaseName}</label>
            <Link className="tcView" >View</Link>
        </div>
    );
}

export default DependentTestCaseDialog;