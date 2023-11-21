import React, { useState, useEffect } from 'react';
import Handlebars from 'handlebars';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { ModalContainer, ScrollBar, Report, RedirectPage, Messages as MSG, setMsg } from '../../global';
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
*/

const DependentTestCaseDialog = props => {

    const history = useNavigate();
    const [tcList, setTcList] = useState([]);
    const [error, setError] = useState("");

    useEffect(()=>{

        let dependentTestCases = [];
        getTestcasesByScenarioId_ICE(props.scenarioId)
        .then(data => {
            if (data === "Invalid Session") return RedirectPage(history);
            else{
                for (let i = 0; i < data.length; i++) {
                    dependentTestCases.push({'testCaseID': data[i].testcaseId, 'testCaseName': data[i].testcaseName, 'checked': false, 'tempId': i})
                }
                
                let testCases = [];
                let disableAndBlock = true;

                let dtcLength = dependentTestCases.length;
                for (let i=dtcLength-1; i>=0; i--) {
                    let tc = dependentTestCases[i];
                    tc.disableAndBlock = disableAndBlock;
                    if (Object.keys(props.checkedTc).length <= 0 && !disableAndBlock) {
                        tc.checked = true;
                    }
                    if ((i in props.checkedTc) && !disableAndBlock) tc.checked = true;
                    
                    if (tc.testCaseName === props.taskName) disableAndBlock = false;
        
                    testCases.push(tc);
                }
                
                testCases.reverse();
                setTcList(testCases);
            }
        })
        .catch(error => console.error("ERROR::::", error));
        //eslint-disable-next-line
    }, []);

    const onSave = () => {
        
        let checkedTestcases = {};
        tcList.forEach(testCase => {
            if(testCase.checked) checkedTestcases[testCase.tempId] = testCase.testCaseID;
        })
        if (checkedTestcases.length === 0) {
            setError("Please Select Dependent Test Case");
        } else {
            setError("");
            checkedTestcases['current'] = props.taskId;
            props.setShowDlg(false);
            setMsg(MSG.DESIGN.SUCC_DEPENDENT_TC_SAVE);
            props.setDTcFlag(true);
            props.setCheckedTc(checkedTestcases);
        }
    }

    const updateChecklist = (index, state) => {
        let updatedTCList = [...tcList];
        updatedTCList[index].checked = state;
        setTcList(updatedTCList);
    }

    return (
        <div className="dependentTestCaseContainer" data-test="d__dtc">
        <ModalContainer 
            title="Select Dependent Test Cases"
            content={
                <div className="testCasesList">
                    { error && <div className="dtc_error" >{error}</div>}
                    <div className="testCasesScrollContainer">    
                        <ScrollBar>
                            <div className="testCaseOverflow_div">
                                {
                                tcList.map((testCase, idx)=> <TestCaseItem key={idx} index={idx} testCase={testCase} updateChecklist={updateChecklist}/> )
                                }
                            </div>
                        </ScrollBar>
                    </div>
                </div>
            }
            footer={ <button onClick={onSave} data-test="d__dtc_save">Save Dependent Test Cases</button> }
            close={()=>{
                setError("");
                props.setShowDlg(false)
            }}
        />
        </div>
    );
}

const TestCaseItem = ({index, testCase, updateChecklist}) => {

    const history =  useNavigate();
    const userInfo = useSelector(state=>state.landing.userinfo);
    const [check, setCheck] = useState(false);

    useEffect(()=>{
        setCheck(testCase.disableAndBlock ? false : testCase.checked);
    }, [testCase]);

    const handleCheck = event => {
        setCheck(event.target.checked);
        updateChecklist(index, event.target.checked);
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
        <div className="testCaseItem" data-test="d__dtc_item">
            <input className="tcCheck" type="checkbox" onChange={handleCheck} disabled={testCase.disableAndBlock} checked={check}/>
            <label className="tcName" title={testCase.testCaseName}>{testCase.testCaseName}</label>
            <div className="tcView" to="#" onClick={onView}>View</div>
        </div>
    );
}

export default DependentTestCaseDialog;