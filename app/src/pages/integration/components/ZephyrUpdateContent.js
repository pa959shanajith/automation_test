import React,{Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as api from '../api.js';
import MappingPage from '../containers/MappingPage';
import { Messages as MSG, setMsg } from '../../global';
import { RedirectPage } from '../../global/index.js';
import CycleNode from './ZephyrTree';
import UpdateMapPopup from './UpdateMapPopup';
import * as actionTypes from '../state/action';
import "../styles/TestList.scss"


const ZephyrUpdateContent = props => {
    const dispatch = useDispatch();
    const history = useHistory();
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const updateMapPayload = useSelector(state=>state.integration.updateMapPayload);
    const viewMappedFlies = useSelector(state=>state.integration.mappedScreenType);

    const [showErrorModal,setShowErrorModal]=useState(false);
    const [updateList, setUpdateList]=useState([]);
    const [errorList,setErrorList]=useState([]);
    const [warningList,setWarningList]=useState([]);
    const [projectDropdn1 , setProjectDropdn1]= useState("Select Project");
    const [projectDropdn2 , setProjectDropdn2]= useState("Select Project");
    const [releaseArr, setReleaseArr] = useState([]);
    const [releaseArr1, setReleaseArr1] = useState([]);
    const [selectedRel, setSelectedRel] = useState("Select Release");
    const [selectedRel1, setSelectedRel1] = useState("Select Release");
    const [projectDetails , setProjectDetails]=useState({});
    const [projectDetails1 , setProjectDetails1]=useState({});
    const [cycleCount, setCycleCount] =useState({check:0,cycles:[]});
    const [rootCheck, setRootCheck] = useState(false);
    const [selectedPhase, setSelectedPhase] = useState([]);
    const [phaseDets, setPhaseDets] = useState({});
    
    const clearSelections = () => {
        setShowErrorModal(false);
        setProjectDropdn1("Select Project");
        setProjectDropdn2("Select Project");
        setReleaseArr([]);
        setReleaseArr1([]);
        setSelectedRel1("Select Release");
        setSelectedRel("Select Release");
        setProjectDetails({});
        setProjectDetails1({});
        setRootCheck(false);
        dispatch({
            type: actionTypes.UPDATE_MAP_PAYLOAD, 
            payload: {
                projectId: "",
                releaseId: "",
                phaseDets: {},
                selectedPhase: []
            }
        });
    }

    const callUpdate=async()=>{
        var tcFlag = false;
        try{
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});

            for (let value of Object.values(updateMapPayload['phaseDets'])) {
                if (value.length>0) {
                    tcFlag = true;
                    break;
                }
            }
            if(!rootCheck && (Object.keys(updateMapPayload['phaseDets']).length === 0 || !tcFlag)) { 
                setMsg(MSG.INTEGRATION.ERR_EMPTY_TCS);
            } else if (updateMapPayload['selectedPhase'] === undefined) {
                setMsg(MSG.INTEGRATION.ERR_EMPTY_PH);
            } else {
                const response = await api.zephyrUpdateMapping(updateMapPayload, rootCheck);
                if (response === "unavailableLocalServer")
                    setMsg(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
                else if(response.error.length>0 || response.warning.length>0 || response.update.length>0) {
                    setUpdateList(response.update);
                    setErrorList(response.error);
                    setWarningList(response.warning);
                    if(response.update.length>0) {
                        if(response.error.length>0 || response.warning.length>0) setMsg(MSG.INTEGRATION.WARN_UPDATE_MULTI_MATCH);
                        else setMsg(MSG.INTEGRATION.UPDATE_SAVE);
                    } else if(response.error.length>0 || response.warning.length>0) {
                        setMsg(MSG.INTEGRATION.ERR_UPDATE_NOT_FOUND);
                    }
                    setShowErrorModal(true); 
                }
                else setMsg(MSG.INTEGRATION.ERR_UPDATE_MAP);
            }
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
        }
        catch(err) {
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            setMsg(MSG.INTEGRATION.ERR_FETCH_DATA);
        }
    }

    const callProjectDetails_ICE=async(e,dropdn)=>{
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        const projectId = e.target.value;
        const releaseData = await api.zephyrProjectDetails_ICE(projectId, user_id);
        if (releaseData.error)
            setMsg(releaseData.error);
        else if (releaseData === "unavailableLocalServer")
            setMsg(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
        else if (releaseData === "scheduleModeOn")
            setMsg(MSG.INTEGRATION.WARN_UNCHECK_SCHEDULE);
        else if (releaseData === "Invalid Session"){
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            return RedirectPage(history);
        }
        else if (releaseData === "invalidcredentials")
            setMsg(MSG.INTEGRATION.ERR_INVALID_CRED);
        else if (releaseData) {
            if(dropdn === "1") { 
                setProjectDropdn1(projectId); 
                setSelectedRel("Select Release");
                setReleaseArr(releaseData);
            }
            if(dropdn === "2") { 
                setProjectDropdn2(projectId); 
                setSelectedRel1("Select Release");
                setReleaseArr1(releaseData);
            }
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }

    const onReleaseSelect = async(event,dropdn) => {
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        const releaseId = event.target.value;
        var testAndScenarioData = "";
        if(dropdn === "1") {
            testAndScenarioData = await api.zephyrMappedCyclePhase(releaseId, user_id);
        }
        if(dropdn === "2") {
            testAndScenarioData = await api.zephyrCyclePhase_ICE(releaseId, user_id);
        }
        if (testAndScenarioData.error)
            setMsg(testAndScenarioData.error);
        else if (testAndScenarioData === "unavailableLocalServer")
            setMsg(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
        else if (testAndScenarioData === "scheduleModeOn")
            setMsg(MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
        else if (testAndScenarioData === "Invalid Session"){
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            return RedirectPage(history);
        }
        else if (testAndScenarioData) {
            if(dropdn === "1") { 
                setCycleCount({check:0,cycles:testAndScenarioData.project_dets});
                setSelectedRel(releaseId); 
                setProjectDetails(testAndScenarioData.project_dets);
            }
            if(dropdn === "2") { 
                setSelectedRel1(releaseId); 
                setProjectDetails1(testAndScenarioData.project_dets);
            }
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }

    const onCheckAll = (event) => {
        var checkVal = cycleCount.check;
        var cycleVal = cycleCount.cycles;
        var cycles = event.target.parentNode.parentNode.parentNode.children
        cycles = document.querySelectorAll('.mp-cycles');
        if(!rootCheck) {
            setRootCheck(true);
            //cycles- 1 to end
            for (var i=0; i<cycles.length; ++i) {
                //cycle
                cycles[i].checked = true;
                checkVal += 1;
                //phases
                var phases = cycles[i].closest('.int__cycleNode').querySelectorAll('.mp-phases');
                for(var j=0;j<phases.length;++j) {
                    phases[j].checked = true;
                    //tcs
                    var testcases = phases[j].closest('.int__phaseNode').querySelectorAll('.mp-tcs');
                    for(var k=0;k<testcases.length;++k) {
                        testcases[k].checked = true;
                    }
                }
            }
        } else {
            setRootCheck(false);
            //cycles- 1 to end
            for (var i=0; i<cycles.length; ++i) {
                //cycle
                cycles[i].checked = false;
                checkVal -= 1;
                //phases
                var phases = cycles[i].closest('.int__cycleNode').querySelectorAll('.mp-phases');
                for(var j=0;j<phases.length;++j) {
                    phases[j].checked = false;
                    //tcs
                    var testcases = phases[j].closest('.int__phaseNode').querySelectorAll('.mp-tcs');
                    for(var k=0;k<testcases.length;++k) {
                        testcases[k].checked = false;
                    }
                }
            }
        }
        setCycleCount({check:checkVal,cycles:cycleVal});
    }

    return(
        <>
        {viewMappedFlies === "ZephyrUpdate" &&
            <MappingPage 
                pageTitle="Update Mapping"
                onUpdate={()=>callUpdate()}
                leftBoxTitle="Mapped Zephyr Test Cases"
                rightBoxTitle="Zephyr Folder Structure"
                selectTestProject={
                    <select data-test="intg_Zephyr_project_drpdwn" value={projectDropdn1} onChange={(e)=>callProjectDetails_ICE(e,"1")}  className="qcSelectDomain" style={{marginRight : "5px"}}>
                        <option value="Select Project" disabled >Select Project</option>

                        {   props.domainDetails ? 
                            props.domainDetails.map(e => (
                                <option key={e.id} value={e.id} title={e.name}>{e.name}</option>
                            )) : null
                        }
                    </select>
                }
                selectTestRelease={
                    <select data-test="intg_zephyr_release_drpdwn" value={selectedRel} onChange={(e)=>onReleaseSelect(e,"1")}  className="qcSelectDomain" style={{marginRight : "5px"}}>
                        <option value="Select Release" disabled >Select Release</option>
                        {   releaseArr.length &&
                            releaseArr.map(e => (
                                <option key={e.id} value={e.id} title={e.name}>{e.name}</option>
                            ))
                        }
                    </select>
                }
                selectRightProejct={
                    <select data-test="intg_Zephyr_project_drpdwn" value={projectDropdn2} onChange={(e)=>callProjectDetails_ICE(e,"2")}  className="qcSelectDomain" style={{marginRight : "5px"}}>
                        <option value="Select Project" disabled >Select Project</option>

                        {   props.domainDetails ? 
                            props.domainDetails.map(e => (
                                <option key={e.id} value={e.id} title={e.name}>{e.name}</option>
                            )) : null
                        }
                    </select>
                }
                selectRightRelease={
                    <select data-test="intg_zephyr_release_drpdwn" value={selectedRel1} onChange={(e)=>onReleaseSelect(e,"2")}  className="qcSelectDomain" style={{marginRight : "5px"}}>
                        <option value="Select Release" disabled >Select Release</option>
                        {   releaseArr1.length &&
                            releaseArr1.map(e => (
                                <option key={e.id} value={e.id} title={e.name}>{e.name}</option>
                            ))
                        }
                    </select>
                }
                testList={ Object.keys(projectDetails).length ? 
                    <Fragment>    
                        <div data-test="intg_zephyr_test_list" className="test__rootDiv">
                            <div className="test_tree_branches">
                                <span className="sel_up sel_head"><input checked={rootCheck} onChange={(e)=>onCheckAll(e)} className="sel_up" type="checkbox"/></span>
                                <span>
                                <img alt="collapse"
                                    className="test_tree_toggle" 
                                    src="static/imgs/ic-qcCollapse.png"
                                />
                                </span>
                                <span className="sp_label"><label className="test_label">Root</label></span>
                            </div>
                            { Object.keys(projectDetails)
                                .map( (cycleName, idx) => <CycleNode 
                                        key={`${cycleName}-${idx}`}
                                        id={idx}
                                        phaseList={projectDetails[cycleName]} 
                                        cycleName={cycleName}
                                        projectId={projectDropdn1}
                                        releaseId={selectedRel}
                                        rootCheck={rootCheck}
                                        section="left"
                                        setRootCheck={setRootCheck}
                                        cycleCount={cycleCount}
                                        setCycleCount={setCycleCount}
                                        phaseDets={phaseDets}
                                        setPhaseDets={setPhaseDets}
                                        selectedPhase={selectedPhase}
                                />) }
                        </div>   
                    </Fragment>
                        : <div></div>
                }
                mappedTestList={ Object.keys(projectDetails1).length ? 
                    <Fragment>    
                        <div data-test="intg_zephyr_test_list" className="test__rootDiv">
                            <div className="test_tree_branches">
                                <img alt="collapse"
                                    className="test_tree_toggle" 
                                    src="static/imgs/ic-qcCollapse.png"
                                />
                                <label>Root</label>
                            </div>
                            { Object.keys(projectDetails1)
                                .map( cycleName => <CycleNode 
                                        key={cycleName}
                                        phaseList={projectDetails1[cycleName]} 
                                        cycleName={cycleName}
                                        projectId={projectDropdn2}
                                        releaseId={selectedRel1}
                                        section="right"
                                        selectedPhase={selectedPhase}
                                        setSelectedPhase={setSelectedPhase}
                                        phaseDets={phaseDets}
                                        setPhaseDets={setPhaseDets}
                                />) }
                        </div>   
                    </Fragment>
                        : <div></div>
                }
            />
        }
        {showErrorModal?
            <UpdateMapPopup
                updateList={updateList}
                errorList={errorList}
                warningList={warningList}
                clearSelections={clearSelections}
            />
            :null} 
        </>
    )
}
    
export default ZephyrUpdateContent;