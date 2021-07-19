import React, { useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { updateScrollBar, Messages as MSG } from '../../global';
import { useDispatch, useSelector } from 'react-redux';
import { RedirectPage } from '../../global';
import * as actionTypes from '../state/action';
import * as api from '../api.js';

const CycleNode = props => {

    const [collapse, setCollapse] = useState(true);

    const handleClick = useCallback(()=>{
        setCollapse(!collapse);
        updateScrollBar();
    }, [collapse, setCollapse])

    return <div className="int__cycleNode" style={{paddingLeft: 17}}>
            { <div className="test_tree_branches">
                <img alt="ce-ic"
                    className="test_tree_toggle" 
                    src={ `static/imgs/ic-qc${collapse ? "Expand" : "Collapse"}.png` }
                    onClick={handleClick}
                />
                <label>{ props.cycleName }</label>
            </div> }
            { !collapse && props.phaseList.length > 0 
                ? <div> {
                    props.phaseList
                        .map((phase, idx) => <PhaseNode 
                                                key={`phase-${idx}`}
                                                phase={phase}
                                                projectId={props.projectId}
                                                releaseId={props.releaseId}
                                            />)
                } </div>
                : null
            }
        </div>;
}

const PhaseNode = props => {

    const dispatch = useDispatch();
    const history = useHistory();
    const [collapse, setCollapse] = useState(true);
    const [testCases, setTestCases] = useState([]);

    let phaseid = Object.keys(props.phase)[0];
    let phasename = props.phase[phaseid];

    const handleClick = useCallback(async()=>{
        if (collapse) {
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading Testcases...'});

            const data = await api.zephyrTestcaseDetails_ICE("testcase", phaseid);
            
            if (data.error)
                dispatch({type: actionTypes.SHOW_POPUP, payload: data.error});
            else if (data === "unavailableLocalServer")
                dispatch({type: actionTypes.SHOW_POPUP, payload: MSG.INTEGRATION.ERR_UNAVAILABLE_ICE});
            else if (data === "scheduleModeOn")
                dispatch({type: actionTypes.SHOW_POPUP, payload: MSG.GENERIC.WARN_UNCHECK_SCHEDULE});
            else if (data === "Invalid Session"){
                dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
                return RedirectPage(history);
            }
            else {
                setTestCases(data);
                setCollapse(false);
            }
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
        }
        else setCollapse(true);
        updateScrollBar();
        // eslint-disable-next-line react-hooks/exhaustive-deps        
    }, [collapse, setCollapse])
    

    return <div className="int__phaseNode" style={{paddingLeft: 17}}>
                { <div className="test_tree_branches">
                    <img alt="ce-ic"
                        className="test_tree_toggle" 
                        src={ `static/imgs/ic-taskType-blue-${collapse ? "plus" : "minus"}.png` }
                        onClick={handleClick}
                    />
                    <label>{ phasename }</label>
                </div> }
                { !collapse && testCases.length > 0 
                    ? <div> {
                        testCases
                            .map(testCase => <TestCaseNode 
                                                key={`testCase-${testCase.id}`}       
                                                testCase={testCase}
                                                phaseId={phaseid}
                                                projectId={props.projectId}
                                                releaseId={props.releaseId}
                                            />)
                    } </div>
                    : null
                }
            </div>;
}


const TestCaseNode = props => {

    const dispatch = useDispatch();
    const selectedTC = useSelector(state=>state.integration.selectedTestCase);
    const syncedTestCases = useSelector(state=>state.integration.syncedTestCases);
    const selectedScIds = useSelector(state=>state.integration.selectedScenarioIds);

    let uniqueTCpath = `|${props.phaseId}\\${props.testCase.id}|`;

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
                    projectid: parseInt(props.projectId),			
                    releaseid: parseInt(props.releaseId),
                    treeid: String(props.testCase.cyclePhaseId),
                    testid: String(props.testCase.id),
                    testname: props.testCase.name,
                    reqdetails: props.testCase.reqdetails, 
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
        dispatch({type: actionTypes.SEL_TC, payload: []});
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: []});
    }

    return <div className={"test_tree_leaves"+ ( selectedTC.includes(uniqueTCpath) ? " test__selectedTC" : "") + (selectedTC.includes(uniqueTCpath) && syncedTestCases.includes(uniqueTCpath) ? " test__syncedTC" : "")}>
                <label className="test__leaf" title={props.testCase.name} onClick={handleClick}>
                    <span className="leafId">{props.testCase.id}</span>
                    <span className="test__tcName">{props.testCase.name}</span>
                </label>
                { selectedTC.includes(uniqueTCpath)
                        && <><div className="test__syncBtns"> 
                        { !syncedTestCases.includes(uniqueTCpath) && <img className="test__syncBtn" alt="s-ic" onClick={handleSync} src="static/imgs/ic-qcSyncronise.png" />}
                        <img className="test__syncBtn" alt="s-ic" onClick={handleUnSync} src="static/imgs/ic-qcUndoSyncronise.png" />
                        </div></> 
                    }
            </div>
}

export default CycleNode;