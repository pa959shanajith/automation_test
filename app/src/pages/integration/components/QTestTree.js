import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateScrollBar, Messages as MSG } from '../../global';
import * as actionTypes from '../state/action';

const CycleNode = props => {

    const [collapse, setCollapse] = useState(true);

    const handleClick = useCallback(()=>{
        setCollapse(!collapse);
        updateScrollBar();
    }, [collapse, setCollapse])

    return (
        Object.keys(props.cycleNode).length ?
        <div className="int__cycleNode" style={{paddingLeft: 17}}>
             <div className="test_tree_branches">
                <img alt="ce-ic"
                    className="test_tree_toggle" 
                    src={ `static/imgs/ic-qc${collapse ? "Expand" : "Collapse"}.png` }
                    onClick={handleClick}
                    title={`${collapse ? "Expand" : "Collapse"}`}
                />
                <label>{ props.cycleNode.cycle }</label>
            </div> 
            { !collapse && props.cycleNode.testsuites.length > 0 
                ? <div> {
                    props.cycleNode.testsuites
                        .map((testSuite, idx) => <TestSuiteNode 
                                                key={`TestSuite-${idx}`}
                                                testSuite={testSuite}
                                                projectId={props.projectId}
                                                projectName={props.projectName}
                                            />)
                } </div>
                : null
            }
        </div> : null);
}

const TestSuiteNode = props => {

    const [collapse, setCollapse] = useState(true);

    const handleClick = useCallback(()=>{
        setCollapse(!collapse);
        updateScrollBar();
    }, [collapse, setCollapse])
    

    return <div className="int__phaseNode" style={{paddingLeft: 17}}>
                { <div className="test_tree_branches">
                    <img alt="ce-ic"
                        className="test_tree_toggle" 
                        src={ `static/imgs/ic-taskType-blue-${collapse ? "plus" : "minus"}.png` }
                        onClick={handleClick}
                        title={`${collapse ? "Expand" : "Collapse"}`}
                    />
                    <label>{ props.testSuite.name }</label>
                </div> }
                { !collapse && props.testSuite.testruns.length > 0 
                    ? <div> {
                        props.testSuite.testruns
                            .map(testRun => <TestRunNode 
                                                key={`testRun-${testRun.id}`}       
                                                testSuiteId={props.testSuite.id}
                                                testRun={testRun}
                                                projectId={props.projectId}
                                                projectName={props.projectName}
                                            />)
                    } </div>
                    : null
                }
            </div>;
}


const TestRunNode = props => {

    const dispatch = useDispatch();
    const selectedTC = useSelector(state=>state.integration.selectedTestCase);
    const syncedTestCases = useSelector(state=>state.integration.syncedTestCases);
    const selectedScIds = useSelector(state=>state.integration.selectedScenarioIds);

    let uniqueTCpath = `|${props.testSuiteId}\\${props.testRun.id}|`;

    const handleClick = () => {
        dispatch({type: actionTypes.SEL_TC, payload: uniqueTCpath});
        dispatch({type: actionTypes.SYNCED_TC, payload: []});
    }

    const handleSync = () => {
        let popupMsg = false;
        if(selectedScIds.length===0){
            popupMsg = MSG.INTEGRATION.WARN_SELECT_SCENARIO;
        }
        if (popupMsg) dispatch({type: actionTypes.SHOW_POPUP, payload: popupMsg});
        else{
            const mappedPair=[
                {
                    project: props.projectName,
                    projectid: props.projectId,			
                    testsuite: props.testRun.name,
                    testsuiteid: props.testRun.id,
                    scenarioId: selectedScIds
                }
            ]
            dispatch({type: actionTypes.MAPPED_PAIR, payload: mappedPair});
            dispatch({type: actionTypes.SYNCED_TC, payload: uniqueTCpath});
        }
    }

    const handleUnSync = () => {
        dispatch({type: actionTypes.MAPPED_PAIR, payload: []});
        dispatch({type: actionTypes.SYNCED_TC, payload: []});
    }

    return <div className={"test_tree_leaves"+ ( selectedTC.includes(uniqueTCpath) ? " test__selectedTC" : "") + (selectedTC.includes(uniqueTCpath) && syncedTestCases.includes(uniqueTCpath) ? " test__syncedTC" : "")}>
                <label className="test__leaf" title={props.testRun.name} onClick={handleClick}>
                    <span className="test__tcName" title={props.testRun.name}>{props.testRun.name}</span>
                </label>
                { selectedTC.includes(uniqueTCpath)
                        && <><div className="test__syncBtns"> 
                        { !syncedTestCases.includes(uniqueTCpath) && <img className="test__syncBtn" alt="s-ic" title="Synchronize" onClick={handleSync} src="static/imgs/ic-qcSyncronise.png" />}
                        <img className="test__syncBtn" alt="s-ic" title="Undo" onClick={handleUnSync} src="static/imgs/ic-qcUndoSyncronise.png" />
                        </div></> 
                    }
            </div>
}

export default CycleNode;