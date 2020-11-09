import React, { useState, useEffect } from 'react';
import Handlebars from 'handlebars';
import { Link, useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import { ModalContainer, ScrollBar, Report, RedirectPage } from '../../global';
import { readTestCase_ICE } from '../api';
import "../styles/DependentTestCaseDialog.scss";

const DependentTestCaseDialog = props => {

    const [check, setCheck] = useState(false);
    const [tcList, setTcList] = useState([]);
    const [checkList , setCheckList] = useState([]);
    const [error, setError] = useState("");

    useEffect(()=>{
        let testCases = [];
        let disableAndBlock = false;
        if (props.checkedTc <= 0) setCheck(true);
        else setCheck(false);

        for (let testCase of props.testCaseList) {
            let tc = testCase;
            if (tc.testCaseName === props.taskName) disableAndBlock = true;
            tc.disableAndBlock = disableAndBlock;

            if (props.checkedTc.includes(tc.testCaseID) && props.taskName !== tc.testCaseName) tc.checked = true;

            testCases.push(tc);
            setTcList(testCases);
        }
    }, []);

    const onSave = () => {
        
        var checkedLength = checkList.length;
        let checkedTestcases = [];
        if (checkedLength === 0) {
            setError("Please Select Dependent Test Case");
        } else {
            setError("");
            checkedTestcases = [...checkList];
            
            if (checkedTestcases.length > 0) {
                checkedTestcases.push(props.taskId);
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
                    { error && <div className="dtc_error" >{error}</div>}
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
            close={()=>{
                setError("");
                props.setShowDlg(false)
            }}
        />
        </div>
    );
}

const TestCaseItem = ({testCase, setCheckList, checkList}) => {

    const history =  useHistory();
    const userInfo = useSelector(state=>state.login.userinfo);
    const [check, setCheck] = useState(testCase.disableAndBlock ? false : testCase.checked);

    const handleCheck = event => {
        let cl = [...checkList];
        if (event.target.checked) {
            setCheck(true);
            cl.push(testCase.testCaseID);
            setCheckList(cl);
        }
        else{
            setCheck(false);
            cl.splice(cl.indexOf(testCase.testCaseID), 1);
            setCheckList(cl);
        }
    }

    const onView = () => {
        readTestCase_ICE(userInfo, testCase.testCaseID, testCase.testCaseName, 0)
            .then(response => {
                if (response === "Invalid Session") RedirectPage(history);

                let template = Handlebars.compile(Report);
                let data = template({ name: [{ testcasename: response.testcasename }], rows: response.testcase });
                let newWindow = window.open();
                newWindow.document.write(data);
            })
            .catch(error => console.error("ERROR::::", error));
    }
    
    return (
        <div className="testCaseItem">
            <input className="tcCheck" type="checkbox" onChange={handleCheck} disabled={testCase.disableAndBlock} checked={check}/>
            <label className="tcName" >{testCase.testCaseName}</label>
            <Link className="tcView" to="#" onClick={onView}>View</Link>
        </div>
    );
}

export default DependentTestCaseDialog;