import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { updateScrollBar, Messages as MSG, setMsg } from '../../global';
import { useDispatch, useSelector } from 'react-redux';
import { RedirectPage } from '../../global';
import * as actionTypes from '../state/action';
import * as api from '../api.js';
import "../styles/TestList.scss"

const CycleNode = props => {

    const dispatch = useDispatch();
    const [collapse, setCollapse] = useState(true);
    const [phaseCount, setPhaseCount] = useState({check:0,phases:props.phaseList});
    const viewMappedFlies = useSelector(state=>state.integration.mappedScreenType);
    const updateMapPayload = useSelector(state=>state.integration.updateMapPayload);

    useEffect(()=>{
        if(props.section != undefined && props.section != "right") {
            var phaseDetsVal = [];
            if (props.rootCheck) {
                dispatch({
                    type: actionTypes.UPDATE_MAP_PAYLOAD, 
                    payload: {
                        projectId: props.projectId,
                        releaseId: props.releaseId,
                        phaseDets: {},
                        selectedPhase: props.selectedPhase
                    }
                });
            } else {
                phaseDetsVal = updateMapPayload["phaseDets"]
                for(var i=0;i<props.phaseList.length;++i) {
                    var phaseId = props.phaseList[i]["phaseid"];//Object.keys(props.phaseList[i])[0]
                    if(!Object.keys(phaseDetsVal).includes(phaseId)) {
                        phaseDetsVal[phaseId]=[];
                    }
                }
                dispatch({
                    type: actionTypes.UPDATE_MAP_PAYLOAD, 
                    payload: {
                        projectId: props.projectId,
                        releaseId: props.releaseId,
                        phaseDets: phaseDetsVal,
                        selectedPhase: props.selectedPhase
                    }
                });
            }
            props.setPhaseDets(phaseDetsVal);
        } else if(props.section == 'right') props.setSelectedPhase([]);
    },[])

    const handleClick = useCallback(()=>{
        setCollapse(!collapse);
        updateScrollBar();
    }, [collapse, setCollapse])

    const onCheckAll = (event) => {
        var checkVal = props.cycleCount.check;
        var cycleVal = props.cycleCount.cycles;
        var phaseDetsVal = props.phaseDets;
        var phases = event.target.closest('.int__cycleNode').querySelectorAll('.mp-phases');
        var tempPhaseVal = [];
        if(event.target.checked) {
            //phases - 4 divs
            checkVal += 1;
            for(var i=0; i<phases.length; ++i) {
                phases[i].checked = true;
                phaseCount.check += 1;
                var testcases = phases[i].closest('.int__phaseNode').querySelectorAll('.mp-tcs');
                for(var j=0;j<testcases.length;++j) {
                    testcases[j].checked = true;
                }
            }
            tempPhaseVal = ["all"];
        } else {
            //phases - 4 divs
            checkVal -= 1;
            for(var i=0; i<phases.length; ++i) {
                phases[i].checked = false;
                phaseCount.check -= 1;
                var testcases = phases[i].closest('.int__phaseNode').querySelectorAll('.mp-tcs');
                for(var j=0;j<testcases.length;++j) {
                    testcases[j].checked = false;
                }
            }
        }
        props.setCycleCount({check:checkVal,cycles:cycleVal});  
        for(var i=0;i<props.phaseList.length;++i) {
            var phaseId = String(props.phaseList[i]["phaseid"]);//Object.keys(props.phaseList[i])[0]
            if(Object.keys(phaseDetsVal).includes(phaseId)) {
                phaseDetsVal[phaseId] = tempPhaseVal;
            }
        }
        dispatch({
            type: actionTypes.UPDATE_MAP_PAYLOAD, 
            payload: {
                projectId: props.projectId,
                releaseId: props.releaseId,
                phaseDets: phaseDetsVal,
                selectPhase: props.selectedPhase
            }
        });
        if(checkVal == Object.keys(cycleVal).length) props.setRootCheck(true);
        else props.setRootCheck(false);
    }

    const checkCycle=()=>{
        var doc = document.getElementById('cycl-'+props.id);
        return props.rootCheck || (props.cycleCount.check!=0 && doc.checked);
    }

    return <div className="int__cycleNode" style={{paddingLeft: 17}}>
            { <div className="test_tree_branches">
                {props.section !== "right" && props.section != undefined && 
                    <span className="sel_up sel_head"><input id={`cycl-${props.id}`} checked={checkCycle()} onChange={(e)=>onCheckAll(e)} className="sel_up mp-cycles" type="checkbox"/></span>}
                <span>
                <img alt="ce-ic"
                    className="test_tree_toggle" 
                    src={ `static/imgs/ic-qc${collapse ? "Expand" : "Collapse"}.png` }
                    onClick={handleClick}
                    title={`${collapse ? "Expand" : "Collapse"}`}
                />
                </span>
                <span className="sp_label">
                <label className="test_label">{ props.cycleName }</label>
                </span>
            </div> }
            { !collapse && props.phaseList.length > 0 
                ? <div> {
                    props.phaseList
                        .map((phase, idx) => <PhaseNode 
                                                key={`phase-${idx}`}
                                                cycleid={props.id}
                                                phase={phase}
                                                projectId={props.projectId}
                                                releaseId={props.releaseId}
                                                section={props.section}
                                                viewMappedFlies={viewMappedFlies}
                                                phaseCount={phaseCount}
                                                setPhaseCount={setPhaseCount}
                                                setRootCheck={props.setRootCheck}
                                                cycleCount={props.cycleCount}
                                                setCycleCount={props.setCycleCount}
                                                selectedPhase={props.selectedPhase}
                                                setSelectedPhase={props.setSelectedPhase}
                                                phaseDets={props.phaseDets}
                                                setPhaseDets={props.setPhaseDets}
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
    const [tests, setTests] = useState({check:[],tests:[]});

    let phaseid = Object.keys(props.phase)[0];
    let phasename = props.phase[phaseid];
    let cyclephaseid = props.phase["phaseid"];
    let updateMapPayload = useSelector(state=>state.integration.updateMapPayload);

    useEffect(()=>{
    },[])

    const handleClick = useCallback(async()=>{
        if (collapse) {
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading Testcases...'});

            var data = ""

            if(props.viewMappedFlies === "ZephyrUpdate" && props.section !== "right") {
                data = await api.zephyrMappedTestcaseDetails_ICE("maptestcase", phaseid, cyclephaseid);
            }
            else {
                data = await api.zephyrTestcaseDetails_ICE("testcase", phaseid);
            }
            
            if (data.error)
                setMsg(data.error);
            else if (data === "unavailableLocalServer")
                setMsg(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
            else if (data === "scheduleModeOn")
                setMsg(MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
            else if (data === "Invalid Session"){
                dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
                return RedirectPage(history);
            }
            else {
                setTestCases(data);
                setCollapse(false);
                setTests({check:[],tests:data});
            }
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
        }
        else setCollapse(true);
        updateScrollBar();
        // eslint-disable-next-line react-hooks/exhaustive-deps        
    }, [collapse, setCollapse])
    
    const onCheckAll = (event) => {
        var checkList = [];
        var checkVal = props.phaseCount.check;
        var phaseVal = props.phaseCount.phases;
        var cycleCheckVal = props.cycleCount.check;
        var cycleCycleVal = props.cycleCount.cycles;
        var phaseDetsVal = props.phaseDets;
        var cy = document.getElementById('cycl-'+props.cycleid);
        var testcases = event.target.closest('.int__phaseNode').querySelectorAll('.mp-tcs');
        if(!event.target.checked) {
            //testcases - 4 divs
            for(var i=0; i<testcases.length; ++i) {
                testcases[i].checked = false;
            }
            checkVal = checkVal - 1;
            props.setPhaseCount({check:checkVal,phases:phaseVal});
            setTests({check:[], tests:testCases});
            if (cy.checked) {
                cy.checked=false
                props.setRootCheck(false);
                cycleCheckVal -= 1
                props.setCycleCount({check:cycleCheckVal,cycles:cycleCycleVal});
            }
            phaseDetsVal[cyclephaseid] = []
        } else {
            //testcases - 4 divs
            for(var i=0; i<testcases.length; ++i) {
                testcases[i].checked = true;
                checkList.push(testcases[i].closest('.test_tree_leaves').querySelector('.leafId').innerText);
            }
            setTests({check:checkList, tests:testCases});
            checkVal = checkVal + 1;
            props.setPhaseCount({check:checkVal,phases:phaseVal});
            phaseDetsVal[cyclephaseid] = ["all"]
        }
        if (checkVal == Object.keys(phaseVal).length) {
            cy.checked=true
            cycleCheckVal += 1;
            props.setCycleCount({check:cycleCheckVal,cycles:cycleCycleVal});
        }
        if (cycleCheckVal == Object.keys(cycleCycleVal).length) props.setRootCheck(true);
        dispatch({
            type: actionTypes.UPDATE_MAP_PAYLOAD, 
            payload: {
                projectId: props.projectId,
                releaseId: props.releaseId,
                phaseDets: phaseDetsVal,
                selectedPhase: props.selectedPhase
            }
        });
    }

    const selectPhase = (event) => {
        var selectedP = [phaseid,props.projectId,props.releaseId];
        props.setSelectedPhase([phaseid]);
        dispatch({
            type: actionTypes.UPDATE_MAP_PAYLOAD, 
            payload: {
                projectId: updateMapPayload['projectId'],
                releaseId: updateMapPayload['releaseId'],
                phaseDets: updateMapPayload['phaseDets'],
                selectedPhase: selectedP
            }
        });
    }

    const checkPhase = () => {
        var ph = document.getElementById('ph-'+phaseid);
        var cy = document.getElementById('cycl-'+props.cycleid);
        return cy.checked || (ph!=null&&ph.checked);
    }

    return <div className="int__phaseNode" style={{paddingLeft: 17}}>
                { <div className={"test_tree_branches"+(props.section === "right" && props.selectedPhase.includes(phaseid) ? " test__selectedPh": "")}>
                    {props.section !== "right" && props.section != undefined && 
                    <span className="sel_up sel_head"><input id={`ph-${phaseid}`} checked={checkPhase()} className="sel_up mp-phases" type="checkbox" onChange={(e)=>onCheckAll(e)}/></span>}
                    {props.section === "right" &&
                    <><span>
                    <img alt="ce-ic"
                        className="test_tree_toggle" 
                        src={ `static/imgs/ic-taskType-blue.png` }
                    />
                    </span>
                    <span className="sp_label"><label className="test_label" onClick={selectPhase}>{ phasename }</label></span>
                    </>}
                    {props.section !== "right" &&
                    <><span>
                    <img alt="ce-ic"
                        className="test_tree_toggle" 
                        src={ `static/imgs/ic-taskType-blue-${collapse ? "plus" : "minus"}.png` }
                        onClick={handleClick}
                        title={`${collapse ? "Expand" : "Collapse"}`}
                    />
                    </span>
                    <span className="sp_label"><label className="test_label">{ phasename }</label></span>
                    </>}
                </div> }
                { !collapse && testCases.length > 0 
                    ? <div> {
                        testCases
                            .map(testCase => <TestCaseNode 
                                                key={`testCase-${testCase.id}`}       
                                                testCase={testCase}
                                                phaseId={phaseid}
                                                cyclephaseid={cyclephaseid}
                                                projectId={props.projectId}
                                                releaseId={props.releaseId}
                                                cycleid={props.cycleid}
                                                tests={tests}
                                                setTests={setTests}
                                                phaseCount={props.phaseCount}
                                                setPhaseCount={props.setPhaseCount}
                                                section={props.section}
                                                setRootCheck={props.setRootCheck}
                                                cycleCount={props.cycleCount}
                                                setCycleCount={props.setCycleCount}
                                                phaseDets={props.phaseDets}
                                                setPhaseDets={props.setPhaseDets}
                                                selectedPhase={props.selectedPhase}
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
        if (popupMsg) setMsg(popupMsg);
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

    const onCheckAll = (event) => {
        var checkList = new Set(props.tests.check);
        var testcases = props.tests.tests;
        var checkVal = props.phaseCount.check;
        var phaseVal = props.phaseCount.phases;
        var cycleCheckVal = props.cycleCount.check;
        var cycleCycleVal = props.cycleCount.cycles;
        var testid  = event.target.parentNode.parentNode.children[1].children[0].innerText;
        var phaseDetsVal = props.phaseDets;
        var cy = document.getElementById('cycl-'+props.cycleid);
        var ph = document.getElementById('ph-'+props.phaseId);
        if(event.target.checked) {
            checkList.add(testid);
            if(checkList.size == testcases.length) {
                ph.checked=true;
                checkVal = checkVal + 1;
                props.setPhaseCount({check:checkVal,phases:phaseVal});
            }
            phaseDetsVal[props.cyclephaseid].push(testid);
            if(checkVal == Object.keys(phaseVal).length) {
                cy.checked=true;
                cycleCheckVal += 1
                props.setCycleCount({check:cycleCheckVal,cycles:cycleCycleVal});
            }
        } else {
            checkList.delete(testid);
            if(ph.checked) { 
                ph.checked=false;
                checkVal = checkVal - 1;
                props.setPhaseCount({check:checkVal,phases:phaseVal});
                if(cy.checked) {
                    cy.checked=false;
                    props.setRootCheck(false);
                    cycleCheckVal -= 1;
                    props.setCycleCount({check:cycleCheckVal,cycles:cycleCycleVal});
                }
            }
            phaseDetsVal[props.cyclephaseid] = Array.from(checkList);
        }
        props.setTests({check:Array.from(checkList),tests:testcases});
        if(cycleCheckVal == Object.keys(cycleCycleVal).length) props.setRootCheck(true);
        dispatch({
            type: actionTypes.UPDATE_MAP_PAYLOAD, 
            payload: {
                projectId: props.projectId,
                releaseId: props.releaseId,
                phaseDets: phaseDetsVal,
                selectedPhase: props.selectedPhase
            }
        });
    }

    const checkTC = () => {
        var ph = document.getElementById('ph-'+props.phaseId);
        var tc = document.getElementById('test-'+props.testCase.id);
        return ph.checked || (tc!=null&&tc.checked);
    }

    return (props.section !== "right" && props.section != undefined)? 
            <div className={"test_tree_leaves"}>
                <span className="sel_up">
                    <input id={`test-${props.testCase.id}`} checked={checkTC()} className="sel_up mp-tcs" type="checkbox" onChange={(e)=>onCheckAll(e)}></input></span>
                <label className="test__leaf" title={props.testCase.name} onClick={handleClick}>
                    <span className="leafId">{props.testCase.id}</span>
                    <span className="test__tcName">{props.testCase.name}</span>
                </label>
            </div> :
            <div className={"test_tree_leaves"+ ( selectedTC.includes(uniqueTCpath) ? " test__selectedTC" : "") + (selectedTC.includes(uniqueTCpath) && syncedTestCases.includes(uniqueTCpath) ? " test__syncedTC" : "")}>
                <label className="test__leaf" title={props.testCase.name} onClick={handleClick}>
                    <span className="leafId">{props.testCase.id}</span>
                    <span className="test__tcName">{props.testCase.name}</span>
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