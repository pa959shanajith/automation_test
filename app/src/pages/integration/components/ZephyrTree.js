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
    const [headerCheck, setHeaderCheck] = useState(false);
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
        if(headerCheck == false) {
            //phases - 4 divs
            event.target.checked = true
            checkVal += 1
            if(event.target.parentNode.parentNode.nextSibling != null) {
                var phases = event.target.parentNode.parentNode.nextSibling.children
                //loop through phases
                for(var i=0; i<phases.length; ++i) {
                    phases[i].children[0].children[0].children[0].checked = true
                    phaseCount.check += 1;
                    if(phases[i].children.length>1) {
                        var testcases = phases[i].children[1].children
                        for(var j=0;j<testcases.length;++j) {
                            testcases[j].children[0].children[0].checked = true
                        }
                    }
                }
            }
            props.setCycleCount({check:checkVal,cycles:cycleVal});
            setHeaderCheck(true);
            for(var i=0;i<props.phaseList.length;++i) {
                var phaseId = String(props.phaseList[i]["phaseid"]);//Object.keys(props.phaseList[i])[0]
                if(Object.keys(phaseDetsVal).includes(phaseId)) {
                    phaseDetsVal[phaseId] = ["all"];
                }
            }
        } else {
            //phases - 4 divs
            event.target.checked = false
            checkVal -= 1
            if(event.target.parentNode.parentNode.nextSibling != null) {
                var phases = event.target.parentNode.parentNode.nextSibling.children
                //loop through phases
                for(var i=0; i<phases.length; ++i) {
                    phases[i].children[0].children[0].children[0].checked = false 
                    phaseCount.check -= 1;
                    if(phases[i].children.length>1) {
                        var testcases = phases[i].children[1].children
                        for(var j=0;j<testcases.length;++j) {
                            testcases[j].children[0].children[0].checked = false
                        }
                    }
                }
            }
            props.setCycleCount({check:checkVal,cycles:cycleVal});
            setHeaderCheck(false);
            
            for(var i=0;i<props.phaseList.length;++i) {
                var phaseId = String(props.phaseList[i]["phaseid"]);//Object.keys(props.phaseList[i])[0]
                if(Object.keys(phaseDetsVal).includes(phaseId)) {
                    phaseDetsVal[phaseId] = [];
                }
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
        if(checkVal == cycleVal.length) props.setRootCheck(true);
        else props.setRootCheck(false);
    }

    return <div className="int__cycleNode" style={{paddingLeft: 17}}>
            { <div className="test_tree_branches">
                {props.section !== "right" && props.section != undefined && <span className="sel_up sel_head"><input onChange={(e)=>onCheckAll(e)} className="sel_up" type="checkbox"/></span>}
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
                                                phase={phase}
                                                projectId={props.projectId}
                                                releaseId={props.releaseId}
                                                section={props.section}
                                                viewMappedFlies={viewMappedFlies}
                                                headerCheck={headerCheck}
                                                setHeaderCheck={setHeaderCheck}
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
    const [phaseCheck, setPhaseCheck] = useState(false);
    const [tests, setTests] = useState({check:[],tests:[]});

    let phaseid = Object.keys(props.phase)[0];
    let phasename = props.phase[phaseid];
    let cyclephaseid = props.phase["phaseid"];
    let updateMapPayload = useSelector(state=>state.integration.updateMapPayload);

    useEffect(()=>{
        if (props.headerCheck) {
            setPhaseCheck(true);
        }
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
        if(phaseCheck == true) {
            //testcases - 4 divs
            event.target.checked = false
            if(event.target.parentNode.parentNode.nextSibling != null) {
                var testcases = event.target.parentNode.parentNode.nextSibling.children
                //loop through testcases
                for(var i=0; i<testcases.length; ++i) {
                    testcases[i].children[0].children[0].checked = false;
                }
            }
            setPhaseCheck(false);
            checkVal = checkVal - 1;
            props.setPhaseCount({check:checkVal,phases:phaseVal});
            setTests({check:[], tests:testCases});
            if (props.headerCheck == true) {
                props.setHeaderCheck(false);
                props.setRootCheck(false);
                cycleCheckVal -= 1
            }
            phaseDetsVal[cyclephaseid] = []
        } else {
            //testcases - 4 divs
            event.target.checked = true
            if(event.target.parentNode.parentNode.nextSibling != null) {
                var testcases = event.target.parentNode.parentNode.nextSibling.children
                //loop through testcases
                for(var i=0; i<testcases.length; ++i) {
                    testcases[i].children[0].children[0].checked = true;
                    checkList.push(testcases[i].children[1].children[0].innerText);
                }
            }
            setTests({check:checkList, tests:testCases});
            setPhaseCheck(true);
            checkVal = checkVal + 1;
            props.setPhaseCount({check:checkVal,phases:phaseVal});
            phaseDetsVal[cyclephaseid] = ["all"]
        }
        if (checkVal == phaseVal.length) {
            props.setHeaderCheck(true);
            cycleCheckVal += 1
            props.setCycleCount({check:cycleCheckVal,cycles:cycleCycleVal});
        }
        if (cycleCheckVal ==cycleCycleVal.length) props.setRootCheck(true);
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

    return <div className="int__phaseNode" style={{paddingLeft: 17}}>
                { <div className="test_tree_branches">
                    {props.section !== "right" && props.section != undefined && 
                    <span className="sel_up sel_head"><input className="sel_up" type="checkbox" onChange={(e)=>onCheckAll(e)}/></span>}
                    {props.section === "right" &&
                    <><span>
                    <img alt="ce-ic"
                        className="test_tree_toggle" 
                        src={ `static/imgs/ic-taskType-blue.png` }
                    />
                    </span>
                    <span className={"sp_label" + (props.selectedPhase.includes(phaseid) ? " test__selectedTC": "")}><label className="test_label" onClick={selectPhase}>{ phasename }</label></span>
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
                                                tests={tests}
                                                setTests={setTests}
                                                phaseCheck={phaseCheck}
                                                setHeaderCheck={props.setHeaderCheck}
                                                setPhaseCheck={setPhaseCheck}
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
        var checkList = props.tests.check;
        var testcases = props.tests.tests;
        var checkVal = props.phaseCount.check;
        var phaseVal = props.phaseCount.phases;
        var cycleCheckVal = props.cycleCount.check;
        var cycleCycleVal = props.cycleCount.cycles;
        var testid  = event.target.parentNode.parentNode.children[1].children[0].innerText;
        var phaseDetsVal = props.phaseDets;

        if(event.target.checked) {
            checkList.push(testid);
            if(checkList.length == testcases.length) {
                event.target.parentNode.parentNode.parentNode.parentNode.children[0].children[0].children[0].checked = true;
                props.setPhaseCheck(true);
                checkVal = checkVal + 1;
                props.setPhaseCount({check:checkVal,phases:phaseVal});
                
            }
            phaseDetsVal[props.cyclephaseid].push(testid);
        } else {
            var index = checkList.indexOf(testid);
            if (index > -1) checkList.splice(index, 1);
            event.target.parentNode.parentNode.parentNode.parentNode.children[0].children[0].children[0].checked = false;
            props.setPhaseCheck(false);
            checkVal = checkVal - 1;
            props.setPhaseCount({check:checkVal,phases:phaseVal});
            phaseDetsVal[props.cyclephaseid] = checkList;
        }
        if(checkVal == phaseVal.length) {
            props.setHeaderCheck(true);
            cycleCheckVal += 1
        }
        else {
            props.setHeaderCheck(false);
            cycleCheckVal -= 1
        }
        props.setCycleCount({check:cycleCheckVal,cycles:cycleCycleVal});
        props.setTests({check:checkList,tests:testcases});
        if(cycleCheckVal == cycleCycleVal.length) props.setRootCheck(true);
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

    return (props.section !== "right" && props.section != undefined)? 
            <div className={"test_tree_leaves"}>
                <span className="sel_up"><input className="sel_up" type="checkbox" onChange={(e)=>onCheckAll(e)}></input></span>
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