import React, { useState, useEffect } from 'react';
import Handlebars from 'handlebars';
import { Link, useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import { ModalContainer, ScrollBar, Report, RedirectPage } from '../../global';
import { readTestCase_ICE, getTestcasesByScenarioId_ICE } from '../api';
import "../styles/DependentTestCaseDialog.scss";

/*
    Component: Dependent Test Case Dialog Box
    Uses: Renders dialog for selecting Dependent Testcases
    Props: 
        scenarioId -> current selected task's scenarioID
        setShowDlg -> switch flag to display dependent Testcases dialog
        checkedTc -> array of dependent testcase IDs' 
        setCheckedTc -> setState for dependent TC array
        setDTcFlag -> flag status for dependent test cases / enabled means dependent TC is present
        taskName -> current task's name
        taskId= -> current task's ID
        setShowPop -> state to display popup msgs
*/

const DependentTestCaseDialog = props => {

    const history = useHistory();
    const [tcList, setTcList] = useState([]);
    const [checkList , setCheckList] = useState([]);
    const [error, setError] = useState("");

    useEffect(()=>{

        let dependentTestCases = []
        getTestcasesByScenarioId_ICE(props.scenarioId)
        .then(data => {
            if (data === "Invalid Session") return RedirectPage(history);
            else{
                for (let i = 0; i < data.length; i++) {
                    dependentTestCases.push({'testCaseID': data[i].testcaseId, 'testCaseName': data[i].testcaseName})
                }
                
                let testCases = [];
                let newCheckedTc = [];
                let disableAndBlock = true;

                let reversedDtc = [...dependentTestCases].reverse();
                
                for (let testCase of reversedDtc) {
                    let tc = testCase;
                    tc.disableAndBlock = disableAndBlock;
                    if (tc.testCaseName === props.taskName) disableAndBlock = false;
                    if (props.checkedTc <= 0 && !disableAndBlock) {
                        newCheckedTc.push(tc.testCaseID)
                    }
        
                    if (props.checkedTc.includes(tc.testCaseID) && props.taskName !== tc.testCaseName) newCheckedTc.push(tc.testCaseID);
        
                    testCases.push(tc);
                }
                
                testCases.reverse();
                setTcList(testCases);
                setCheckList(newCheckedTc);
            }
        })
        .catch(error => console.error("ERROR::::", error));
    }, []);

    const onSave = () => {
        
        var checkedLength = checkList.length;
        let checkedTestcases = [];
        if (checkedLength === 0) {
            setError("Please Select Dependent Test Case");
        } else {
            setError("");
            checkedTestcases = [...checkList];

            checkedTestcases.push(props.taskId);
            props.setShowDlg(false);
            props.setShowPop({'title': 'Dependent Test Cases', 'content': 'Dependent Test Cases saved successfully'});
            props.setDTcFlag(true);
            props.setCheckedTc(checkedTestcases);
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
    const [check, setCheck] = useState(false);

    useEffect(()=>{
        setCheck(testCase.disableAndBlock ? false : checkList.includes(testCase.testCaseID));
    }, [checkList]);

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