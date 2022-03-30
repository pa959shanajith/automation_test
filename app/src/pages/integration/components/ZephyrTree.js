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
    const viewMappedFlies = useSelector(state=>state.integration.mappedScreenType);
    const updateMapPayload = useSelector(state=>state.integration.updateMapPayload);

    useEffect(()=>{
        if(props.section != undefined && props.section != "right") {
            var phaseDetsVal = {};
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
                        phaseDetsVal[phaseId]={};
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
        var tempPhaseVal = {};
        if(event.target.checked) {
            var parentVal = event.target.closest('.int__cycleNode').parentElement;
            var allcheckbox = event.target.parentElement.parentElement.parentElement.querySelectorAll('input[type=checkbox]');
            props.checkParent(parentVal, true, '.mp-cycles');
            props.checkChildren(allcheckbox, true);
            tempPhaseVal = {"all":["all"]};
        } else {
            var parentVal = event.target.closest('.int__cycleNode').parentElement;
            var allcheckbox = event.target.parentElement.parentElement.parentElement.querySelectorAll('input[type=checkbox]');
            props.checkParent(parentVal, false, '.mp-cycles');
            props.checkChildren(allcheckbox, false);
        }
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
                selectedPhase: props.selectedPhase
            }
        });
    }

    const checkCycle=()=>{
        var doc = document.getElementById('cycl-'+props.id);
        return props.rootCheck || (doc!=null && doc.checked);
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
                                                type=""
                                                checkParent={props.checkParent}
                                                checkChildren={props.checkChildren}
                                                projectId={props.projectId}
                                                releaseId={props.releaseId}
                                                section={props.section}
                                                viewMappedFlies={viewMappedFlies}
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
    const [modules, setModules] = useState([]);

    let phaseid = Object.keys(props.phase)[0];
    let phasename = props.phase[phaseid];
    let cyclephaseid = '';
    let parent = '';
    if (props.type==="module") {
        parent = props.parent;
        cyclephaseid = props.parent["phaseid"];
    } else {
        parent = props.phase;
        cyclephaseid = props.phase["phaseid"];
    }
    let updateMapPayload = useSelector(state=>state.integration.updateMapPayload);

    useEffect(()=>{
    },[])

    const handleClick = useCallback(async()=>{
        if (collapse) {
            if(props.viewMappedFlies === "ZephyrUpdate" && props.section !== "right") {
                dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading Testcases...'});
            } else if (props.viewMappedFlies === "ZephyrUpdate" && props.section === "right"){
                dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading Folders...'});
            }

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
                if(props.section !== "right") {
                    setTestCases(data.testcases);
                }
                setModules(data.modules);
                setCollapse(false);
            }
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
        }
        else setCollapse(true);
        updateScrollBar();
        // eslint-disable-next-line react-hooks/exhaustive-deps        
    }, [collapse, setCollapse])
    
    const onCheckAll = (event) => {
        var phaseDetsVal = props.phaseDets;
        var par = '-1';
        if(props.type=="module") par = phaseid;
        if(!event.target.checked) {
            var checkList = [];
            var parentVal = event.target.closest('.int__phaseNode').parentElement.parentElement;
            var allcheckbox = event.target.parentElement.parentElement.parentElement.querySelectorAll('input[type=checkbox]');
            props.checkParent(parentVal, false, '.mp-phases');
            props.checkChildren(allcheckbox, false);
            if(par == '-1') phaseDetsVal[cyclephaseid] = {}
            else phaseDetsVal[cyclephaseid][par] = [];
        } else {
            var checkList = [];
            var parentVal = event.target.closest('.int__phaseNode').parentElement.parentElement;
            var allcheckbox = event.target.parentElement.parentElement.parentElement.querySelectorAll('input[type=checkbox]');
            props.checkParent(parentVal, true, '.mp-phases');
            props.checkChildren(allcheckbox, true);
            if(par == '-1') phaseDetsVal[cyclephaseid] = {"all":["all"]}
            else phaseDetsVal[cyclephaseid][par] = ["all"];
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

    const selectPhase = (event) => {
        var selectedP = [phaseid,props.projectId,props.releaseId];
        props.setSelectedPhase(selectedP);
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

    const checkM = () => {
        var pr = null;
        var ph = document.getElementById('ph-'+phaseid);
        if(ph!=null) pr = ph.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[0];
        var cy = document.getElementById('cycl-'+props.cycleid);
        return cy.checked || (pr!=null&&pr.checked) || (ph!=null&&ph.checked);
    }

    return <div className="int__phaseNode" style={{paddingLeft: 17}}>
                { <div className={"test_tree_branches"+(props.section === "right" && props.selectedPhase.includes(phaseid) ? " test__selectedPh": "")}>
                    {props.section !== "right" && props.section != undefined && 
                    <span className="sel_up sel_head"><input id={`ph-${phaseid}`} checked={props.type==="module"?checkM():checkPhase()} className="sel_up mp-phases" type="checkbox" onChange={(e)=>onCheckAll(e)}/></span>}
                    {props.section === "right" &&
                    <><span>
                    <img alt="ce-ic"
                        className="test_tree_toggle" 
                        src={ `static/imgs/ic-taskType-blue-${collapse ? "plus" : "minus"}.png` }
                        onClick={handleClick}
                        title={`${collapse ? "Expand" : "Collapse"}`}
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
                { !collapse && modules.length > 0 
                    ? <div> {
                        modules
                            .map((phase, idx) => <PhaseNode 
                                                    key={`module-${idx}`}
                                                    cycleid={props.cycleid}
                                                    phase={phase}
                                                    type="module"
                                                    // onCheckNode={props.onCheckNode}
                                                    checkParent={props.checkParent}
                                                    checkChildren={props.checkChildren}
                                                    parent={parent}
                                                    projectId={props.projectId}
                                                    releaseId={props.releaseId}
                                                    section={props.section}
                                                    viewMappedFlies={props.viewMappedFlies}
                                                    setRootCheck={props.setRootCheck}
                                                    selectedPhase={props.selectedPhase}
                                                    setSelectedPhase={props.setSelectedPhase}
                                                    phaseDets={props.phaseDets}
                                                    setPhaseDets={props.setPhaseDets}
                                                />)
                    } </div>
                    : null
                }
                { !collapse && testCases.length > 0 
                    ? <div> {
                        testCases
                            .map(testCase => <TestCaseNode 
                                                key={`testCase-${testCase.id}`}       
                                                testCase={testCase}
                                                phaseId={phaseid}
                                                type={props.type}
                                                parent={props.phase}
                                                checkParent={props.checkParent}
                                                cyclephaseid={cyclephaseid}
                                                projectId={props.projectId}
                                                releaseId={props.releaseId}
                                                cycleid={props.cycleid}
                                                section={props.section}
                                                setRootCheck={props.setRootCheck}
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
    const selectedZTCDetails = useSelector(state=>state.integration.selectedZTCDetails);
    const selectedTC = useSelector(state=>state.integration.selectedTestCase);
    const syncedTestCases = useSelector(state=>state.integration.syncedTestCases);
    const selectedScIds = useSelector(state=>state.integration.selectedScenarioIds);

    let uniqueTCpath = `|${props.phaseId}\\${props.testCase.id}\\${props.testCase.name}\\${props.testCase.parentId}|`;

    const handleClick = e => {
        let newSelectedTCDetails = { ...selectedZTCDetails };
        let newSelectedTC = [...selectedTC];

        if (!e.ctrlKey) {
            newSelectedTCDetails.selectedTCPhaseId = [props.phaseId];
            newSelectedTCDetails.selectedTcId = [String(props.testCase.id)];
            newSelectedTCDetails.selectedTCNames = [props.testCase.name];
            newSelectedTCDetails.selectedTCReqDetails = [props.testCase.reqdetails];
            newSelectedTCDetails.selectedTreeId = [String(props.testCase.cyclePhaseId)];
            newSelectedTCDetails.selectedParentID = [props.testCase.parentId];
            newSelectedTCDetails.selectedProjectID = [parseInt(props.projectId)];
            newSelectedTCDetails.selectedReleaseID = [parseInt(props.releaseId)];
            newSelectedTC = [uniqueTCpath];
		} else if (e.ctrlKey) { 
            const index = newSelectedTC.indexOf(uniqueTCpath);
            if (index !== -1) {
                newSelectedTCDetails.selectedTCPhaseId.splice(index, 1);
                newSelectedTCDetails.selectedTcId.splice(index, 1);
                newSelectedTCDetails.selectedTCNames.splice(index, 1);
                newSelectedTCDetails.selectedTCReqDetails.splice(index, 1);
                newSelectedTCDetails.selectedTreeId.splice(index, 1);
                newSelectedTCDetails.selectedParentID.splice(index, 1);
                newSelectedTCDetails.selectedProjectID.splice(index, 1);
                newSelectedTCDetails.selectedReleaseID.splice(index, 1);
                newSelectedTC.splice(index, 1);
            } else {
                newSelectedTCDetails.selectedTCPhaseId.push(props.phaseId);
                newSelectedTCDetails.selectedTcId.push(String(props.testCase.id));
                newSelectedTCDetails.selectedTCNames.push(props.testCase.name);
                newSelectedTCDetails.selectedTCReqDetails.push(props.testCase.reqdetails);
                newSelectedTCDetails.selectedTreeId.push(String(props.testCase.cyclePhaseId));
                newSelectedTCDetails.selectedParentID.push(props.testCase.parentId);
                newSelectedTCDetails.selectedProjectID.push(parseInt(props.projectId));
                newSelectedTCDetails.selectedReleaseID.push(parseInt(props.releaseId));
                newSelectedTC.push(uniqueTCpath)
            } 
        }
        dispatch({type: actionTypes.SEL_TC_DETAILS, payload: newSelectedTCDetails});
        dispatch({type: actionTypes.SYNCED_TC, payload: []});
        dispatch({type: actionTypes.SEL_TC, payload: newSelectedTC});
    }

    const handleSync = () => {
        let popupMsg = false;
        if(selectedScIds.length===0){
            popupMsg = MSG.INTEGRATION.WARN_SELECT_SCENARIO;
        }
        else if(selectedZTCDetails.selectedTcId.length===0){
            popupMsg = MSG.INTEGRATION.WARN_SELECT_TESTCASE;
        }
        else if(selectedZTCDetails.selectedTcId.length>1 && selectedScIds.length>1) {
			popupMsg = MSG.INTEGRATION.WARN_MULTI_TC_SCENARIO;
        }

        if (popupMsg) setMsg(popupMsg);
        else{
            const mappedPair=[
                {
                    projectid: selectedZTCDetails.selectedProjectID,			
                    releaseid: selectedZTCDetails.selectedReleaseID,
                    treeid: selectedZTCDetails.selectedTreeId,
                    parentid: selectedZTCDetails.selectedParentID,
                    testid: selectedZTCDetails.selectedTcId,
                    testname: selectedZTCDetails.selectedTCNames,
                    reqdetails: selectedZTCDetails.selectedTCReqDetails, 
                    scenarioId: selectedScIds
                }
            ]
            dispatch({type: actionTypes.MAPPED_PAIR, payload: mappedPair});
            dispatch({type: actionTypes.SYNCED_TC, payload: selectedZTCDetails.selectedTCNames});
        }
    }

    const handleUnSync = () => {
        dispatch({type: actionTypes.MAPPED_PAIR, payload: []});
        dispatch({type: actionTypes.SYNCED_TC, payload: []});
        dispatch({type: actionTypes.SEL_TC, payload: []});
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: []});
    }

    const onCheckAll = (event) => {
        var checkList = new Set();
        var testid  = event.target.parentNode.parentNode.children[1].children[0].innerText;
        var phaseDetsVal = props.phaseDets;
        var parentid = '-1';
        if(props.type==="module") {
            parentid = props.testCase.parentId;
        }
        if(Array.from(Object.keys(phaseDetsVal[props.cyclephaseid])).includes(parentid)) {
            checkList = new Set(phaseDetsVal[props.cyclephaseid][parentid])
        }
        if(event.target.checked) {
            if(!checkList.has(testid)) {
                checkList.add(testid);
            }
            var parentVal = event.target.closest('.int__phaseNode');
            props.checkParent(parentVal, true, '.mp-phases');
            phaseDetsVal[props.cyclephaseid][parentid] = Array.from(checkList);
        } else {
            var parentVal = event.target.closest('.int__phaseNode');
            props.checkParent(parentVal, false, '.mp-phases');
            checkList.delete(testid);
            phaseDetsVal[props.cyclephaseid][parentid] = Array.from(checkList);
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
            <div className={"test_tree_leaves"+ ( selectedTC.includes(uniqueTCpath) ? " test__selectedTC" : "") + (selectedTC.includes(uniqueTCpath) && syncedTestCases.includes(props.testCase.name) ? " test__syncedTC" : "")}>
                <label className="test__leaf" title={props.testCase.name} onClick={handleClick}>
                    <span className="leafId">{props.testCase.id}</span>
                    <span className="test__tcName">{props.testCase.name}</span>
                </label>
                { selectedTC.includes(uniqueTCpath)
                        && <><div className="test__syncBtns"> 
                        { !syncedTestCases.includes(props.testCase.name) && <img className="test__syncBtn" alt="s-ic" title="Synchronize" onClick={handleSync} src="static/imgs/ic-qcSyncronise.png" />}
                        <img className="test__syncBtn" alt="s-ic" title="Undo" onClick={handleUnSync} src="static/imgs/ic-qcUndoSyncronise.png" />
                        </div></> 
                }
            </div>
}

export default CycleNode;