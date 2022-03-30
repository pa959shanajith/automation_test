import React, { useEffect, useState,useRef, Fragment } from 'react';
import { ModalContainer, ScrollBar, Messages as MSG, setMsg, AnimatePageWrapper,AnimateDiv} from '../../global';
import { excelToZephyrMappings , zephyrTestcaseDetails_ICE} from '../api';
import { useHistory } from 'react-router-dom';
import { useDispatch,useSelector } from 'react-redux';
import * as api from '../api.js';
import { RedirectPage } from '../../global/index.js';
import CycleNodePopUp from './ImportMappingsTree';
import * as actionTypes from '../state/action.js';
import "../styles/ImportMappings.scss";
import ImportMapStatusPopup from './ImportMapStatusPopup';

const ImportMappings = ({setImportPop,displayError}) => {
    const dispatch = useDispatch();
    const projList = useSelector(state=> state.integration.projectList); 
    const [error,setError] = useState('')
    const [activeTab,setActiveTab] = useState("Import")
    const [submit,setSubmit] = useState(false)
    const [impStatusSubmit,setImpStatusSubmit] = useState(false)
    
    useEffect(()=>{
        (async()=>{
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
        })()
    },[]) 
    return(
        <ModalContainer 
        modalClass = 'modal-md'
        title={`Import Mappings${activeTab==="Import"?'':' Status'}`}
        close={()=>setImportPop(false)}
        footer=
        {activeTab==="Import" ?
            <Footer error={error} setSubmit={setSubmit}/>
            :
            <FooterImportStatus setImpStatusSubmit={setImpStatusSubmit}/>
        }
        content={<Container submit={submit} setSubmit={setSubmit} impStatusSubmit={impStatusSubmit} setImpStatusSubmit={setImpStatusSubmit} 
                activeTab={activeTab} setActiveTab={setActiveTab} projList={projList} setImportPop={setImportPop} setError={setError} displayError={displayError}/>} 
      />
    )
}

const Container = ({projList,displayError,activeTab, impStatusSubmit,setImpStatusSubmit, setActiveTab,setError,setSubmit,submit,setImportPop}) =>{
    const dispatch = useDispatch()
    const history = useHistory();
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const ftypeRef = useRef()
    const uploadFileRef = useRef()
    const projRef = useRef()
    const sheetRef = useRef()    
    const avoProjectRef = useRef()
    const [importType, setImportType] = useState('excel')
    const [fileUpload,setFiledUpload] = useState(undefined)
    const [sheetList,setSheetList] = useState([])
    const [importStatus,setImportStatus]=useState("Partial");
    const [tcErrorList, setTcErrorList]=useState([]);
    const [errorRows,setErrorRows]=useState([]);
    const [snrErrorList,setSnrErrorList]=useState([]);
    const [selectedProject , setSelectedProject]= useState("Select Project");
    const [avoProjectList , setAvoProjectList]= useState(null);
    const [releaseList, setReleaseList] = useState([]);
    const [selectedRel, setSelectedRel] = useState("Select Release");
    const [projectDetails , setProjectDetails]=useState({});
    const [selectedPhase, setSelectedPhase] = useState([]);
    const [selectedPhaseName, setSelectedPhaseName] = useState("");
    const [phaseDets, setPhaseDets] = useState({});
    const [firstRender, setFirstRender] = useState(true);


    const callProjectDetails_ICE=async(e)=>{
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
            setSelectedProject(projectId); 
            setSelectedRel("Select Release");
            setReleaseList(releaseData);
            setSelectedPhase([])
            setProjectDetails({});
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }

    const onReleaseSelect = async(event) => {
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        const releaseId = event.target.value;
        var testAndScenarioData = "";
        testAndScenarioData = await api.zephyrCyclePhase_ICE(releaseId, user_id);
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
            setSelectedRel(releaseId); 
            setProjectDetails(testAndScenarioData.project_dets);
            setAvoProjectList(testAndScenarioData.avoassure_projects);
            setSelectedPhaseName("")
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }

    const clearSelections = () => {
        setSelectedProject("Select Project");
        setReleaseList([]);
        setSelectedRel("Select Release");
        setProjectDetails({});
    }

    const upload = () => {
        setError('')
        setFiledUpload(undefined)
        uploadFile({uploadFileRef,setSheetList,setError,setFiledUpload,dispatch})
        clearSelections()
    }

    const acceptType = {
        excel:".xls,.xlsx"
    }

    useEffect(()=>{
        if(impStatusSubmit){
            setImpStatusSubmit(false);
            clearSelections();
            setImportPop(false)
        }
    },[impStatusSubmit])
    
    useEffect(()=>{
        
        if(submit){
            setFirstRender(false);
            setSubmit(false)
            setError('')
            var err = validate({ftypeRef,uploadFileRef,projRef,sheetRef,selectedRel,avoProjectRef,selectedPhaseName})
            if(err){
                return;
            }
            var importData = fileUpload;
            
            (async()=>{
                loadImportData({
                    importType,
                    importData, 
                    importProj:projRef.current ? projRef.current.value: undefined,
                    sheet:sheetRef.current? sheetRef.current.value: undefined,
                    dispatch:dispatch,
                    displayError:displayError,
                    avoProject : avoProjectRef.current?avoProjectRef.current.value:undefined,
                    avoProjectList:avoProjectList,
                    setImportPop:setImportPop,
                    selectedPhase:selectedPhase,
                    setActiveTab:setActiveTab,
                    setTcErrorList:setTcErrorList,
                    setSnrErrorList:setSnrErrorList,
                    setErrorRows:setErrorRows,
                    setImportStatus:setImportStatus,
                })
            })()
            
        }
    },[submit])

    return ( 
        
            <AnimatePageWrapper>
                { activeTab === "Import"?
                    <AnimateDiv key="dd" firstPage={true} firstRender={firstRender}>
                        <div className = 'mp__import-popup'>
                            <Fragment>
                                <div>
                                    <label>Upload Excel File: </label>
                                    <input accept={acceptType[importType]} type='file' onChange={upload} ref={uploadFileRef}/>
                                </div>
                            </Fragment>
                            {fileUpload &&
                                <Fragment>
                                    <Fragment>
                                    <div>
                                        <label>Select Sheet: </label>
                                        <select defaultValue={"def-val"} ref={sheetRef}>
                                            <option value="def-val" disabled>Please Select Sheet</option>
                                            {sheetList.map((e,i)=><option value={e} key={i}>{e}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label>Project: </label>
                                        <select className='imp-inp' defaultValue={'def-val'} ref ={projRef} onChange={(e)=>callProjectDetails_ICE(e)}>
                                            <option value="def-val" disabled>Select Project</option>
                                            {Object.entries(projList).map((e,i)=>
                                            <option value={e[1].id} key={i}>{e[1].name}</option>
                                        )}
                                        </select>
                                    </div>
                                    <div>
                                        <label>Release: </label>
                                        <select className='imp-inp' defaultValue={'def-val'} value={selectedRel} id = "release_dropdown"onChange={(e)=>onReleaseSelect(e)}>
                                            <option value="Select Release" disabled >Select Release</option>
                                            {Object.entries(releaseList).map((e,i)=>
                                            <option value={e[1].id} key={i}>{e[1].name}</option>
                                            )}
                                        </select>
                                    </div>
                                    </Fragment>
                                </Fragment>
                            }                
                            <Fragment>
                                {fileUpload && Object.keys(projectDetails).length?
                                <div>
                                <div className="import_mappings_tree" id="tree_box_outer" >
                                    <div className="tree_import_title">
                                        <label>Select Phase/Module</label>
                                    </div>
                                        <div className="import_mappings_tree_inner">
                                            <div className="import_mappings_tree_contents" id="import_mappings_tree_contents">
                                            <ScrollBar scrollId="import_mappings_tree_contents" hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                                    <Fragment>    
                                                        <div className="tree_box">
                                                            <div className="test_tree_branches">
                                                                <img alt="collapse"
                                                                    className="test_tree_toggle" 
                                                                    src="static/imgs/ic-qcCollapse.png"
                                                                />
                                                                <label>Root</label>
                                                            </div>
                                                            { Object.keys(projectDetails)
                                                                .map( cycleName => <CycleNodePopUp 
                                                                        key={cycleName}
                                                                        phaseList={projectDetails[cycleName]} 
                                                                        cycleName={cycleName}
                                                                        projectId={selectedProject}
                                                                        releaseId={selectedRel}
                                                                        section="right"
                                                                        selectedPhase={selectedPhase}
                                                                        setSelectedPhase={setSelectedPhase}
                                                                        setSelectedPhaseName = {setSelectedPhaseName}
                                                                        phaseDets={phaseDets}
                                                                        setPhaseDets={setPhaseDets}
                                                                />) 
                                                                }
                                                        </div>   
                                                    </Fragment>
                                            </ScrollBar>
                                            </div>
                                        </div>
                                        </div>

                                        <div className='selected_phase'>
                                            <label  >{selectedPhaseName?"Selected Phase/Module: "+ selectedPhaseName:"No Phase/Module selected"} </label>
                                        </div>

                                        <div>
                                            <label>Avo Project: </label>
                                            <select ref={avoProjectRef}  defaultValue={'def-val'} className="qtestAvoAssureSelectProject">
                                                <option value="def-val" disabled >Select Project</option>
                                                {
                                                    avoProjectList? 
                                                    avoProjectList.map((e,i)=>(
                                                        <option value={i} key={i+'_proj'} title={e.project_name}>{e.project_name}</option>))
                                                        : null 
                                                }
                                            </select>
                                        </div>
                                        
                                    </div>
                                    :<div></div>
                                }
                            </Fragment>
                        </div>
                    </AnimateDiv>
                    :
                    <AnimateDiv key={"dfd"}>
                        <ImportMapStatusPopup
                            testCasesErrorList={tcErrorList}
                            scenariosErrorList={snrErrorList}
                            errorRows={errorRows}
                            importStatus={importStatus}
                        />
                    </AnimateDiv>

                 }
                
            </AnimatePageWrapper>
    );
}


// Footer for sheet choose popup
const Footer = ({error,setSubmit}) =>{
    return(
      <Fragment>
            <div className='mnode__buttons'>
                <label className='err-message'>{error}</label>
                <button onClick={()=>setSubmit(true)}>Import</button>
            </div>
      </Fragment>
    )
}

//Footer for Import Mappings Status
const FooterImportStatus = ({setImpStatusSubmit})=>{
    return(
      <Fragment>
            <div className='mnode__buttons'>
                {/* <label className='err-message'>{error}</label> */}
                <button onClick={()=>setImpStatusSubmit(true)}>OK</button>
            </div>
      </Fragment>
    )
}




const validate = ({ftypeRef,uploadFileRef,projRef,sheetRef,avoProjectRef,selectedRel, selectedPhaseName}) =>{
    var err = false;
    [ftypeRef,uploadFileRef,projRef,sheetRef,avoProjectRef].forEach((e)=>{
        if(e.current){
            e.current.style.border = '1px solid black';
            if(e.current.value === 'def-val' || e.current.value === ''){
                e.current.style.border = '1px solid red';
                err = true
            }
            if(e.current.type === 'file' && !uploadFileRef.current.files[0]){
                e.current.style.border = '1px solid red';
                err = true
            }
        }
    })
    
    var releasedropdown = document.getElementById("release_dropdown")
    if(releasedropdown){
        releasedropdown.style.border = '1px solid black';
        if(selectedRel==="Select Release"){
            releasedropdown.style.border = '1px solid red';
            err = true
        }
    }
    var treebox =  document.getElementById("tree_box_outer")
    if(treebox){
        treebox.style.border = '1px solid black';
        if(!selectedPhaseName){
            treebox.style.border = '1px solid red';
            err = true
        }
    }
    return err
}

const loadImportData = async({importData,sheet,importType,avoProjectList,setActiveTab, setTcErrorList,setSnrErrorList,
                        selectedPhase,dispatch,avoProject,displayError, setErrorRows,setImportPop,setImportStatus}) =>{
    dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
    if(importType === 'excel'){
        var data = await zephyrTestcaseDetails_ICE("testcase", selectedPhase[0]);
        if (data.error){
            displayError(data.error); return;
        }
        else if (data === "unavailableLocalServer"){
            displayError(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE); return;
        }
        else if (data === "scheduleModeOn"){
            displayError(MSG.GENERIC.WARN_UNCHECK_SCHEDULE); return;
        }
        else if (data === "Invalid Session"){
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''}); return;
        }
        
        var res = await excelToZephyrMappings({'content':importData,'flag':'data',sheetname: sheet})
        if(res.error){displayError(res.error);return;}
        
        var mappings = res.mappings;
        const testIdToTestCase = new Map();    // will contain a map where key is testcaseid and value is the testCase object
        const scenarioNameToScenario =new Map();// will contain a map where key is scnenarioName and value is the scenario object

        var scenarioList = (avoProject?avoProjectList[avoProject].scenario_details:[]);
        {scenarioList && scenarioList.map((e,i)=>scenarioNameToScenario.set(e.name,e))}

        var testCasesList = data.testcases;
        {testCasesList && testCasesList.map((e,i)=> testIdToTestCase.set(e.id,e))}
       
        var finalMappings = [], errorTestCasesId=[], errorScenarioNames = [];

        {mappings && mappings.map((e,idx)=>{
            var testCaseIds = e.testCaseIds;
            var scenarios = e.scenarios;
            var mappedpair = {
                projectid: [],			
                releaseid: [],
                treeid: [],
                parentid: [],
                testid:[],
                testname: [],
                reqdetails: [], 
                scenarioId: []
            }

            errorTestCasesId.push({row: e.row, tcId:[]});
            // traversing all the test case id's received from a row of excel sheet
            testCaseIds.map((tcId,i)=>{
                // checking if the testCaseId exists in the selected phase/module
                if(testIdToTestCase.has(parseInt(tcId))){
                    var tcObject = testIdToTestCase.get(parseInt(tcId));
                    mappedpair.treeid.push(tcObject.cyclePhaseId)
                    mappedpair.parentid.push(tcObject.parentId)
                    mappedpair.testname.push(tcObject.name)
                    mappedpair.testid.push(tcObject.id)
                    mappedpair.reqdetails.push(tcObject.reqdetails) 
                    mappedpair.projectid.push(selectedPhase[1])   
                    mappedpair.releaseid.push(selectedPhase[2])              
                }
                else{
                    errorTestCasesId[errorTestCasesId.length -1 ].tcId.push(tcId);
                }
            })
            if(errorTestCasesId[errorTestCasesId.length -1 ].tcId.length === 0)
                errorTestCasesId.pop()
            
            errorScenarioNames.push({row:e.row, snrNames : []});

            // traversing all the scenario names received from a row of excel sheet
            scenarios.map((scenarioName, i)=>{
                // checking if the scenario name exists in the selected phase/module
                if(scenarioNameToScenario.has(scenarioName)){
                    mappedpair.scenarioId.push(scenarioNameToScenario.get(scenarioName)._id); 
                }
                else{
                    errorScenarioNames[errorScenarioNames.length - 1].snrNames.push(scenarioName)
                }
            })
            if(errorScenarioNames[errorScenarioNames.length - 1].snrNames.length === 0){
                errorScenarioNames.pop()
            }
            if(mappedpair.treeid.length>0 && mappedpair.scenarioId.length>0){
                finalMappings.push(mappedpair)          //appending the mappedpair to the list of all mapped pairs                
            }
        })}

        if(finalMappings.length === 0){
            setImportStatus("Not_Mapped")
        }
        else{
            // saving the finalMappings 
            const response = await api.saveZephyrDetails_ICE(finalMappings);
            if (response.error){displayError(response.error); return;}
            else if(response === "unavailableLocalServer"){displayError(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE); return;}
            else if(response === "scheduleModeOn"){displayError(MSG.GENERIC.WARN_UNCHECK_SCHEDULE); return;}
        }
        
        //Checking in case import is partially sucessfull
        if(!res.errorRows.length && !errorScenarioNames.length && !errorTestCasesId.length){
            setMsg(MSG.INTEGRATION.SUCC_IMPORT);
            setImportPop(false);
            
        }
        else{
            setErrorRows(res.errorRows);
            setTcErrorList(errorTestCasesId)
            setSnrErrorList(errorScenarioNames)
            setActiveTab("")
        }
        
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});   
    }
}

const uploadFile = async({uploadFileRef,setSheetList,setError,setFiledUpload,dispatch}) =>{
    var file = uploadFileRef.current.files[0]
    if(!file){
        return;
    }
    var extension = file.name.substr(file.name.lastIndexOf('.')+1)
    dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Uploading...'});
    try{
        const result =  await read(file)
		if(extension === 'xls' || extension === 'xlsx'){
            var res = await excelToZephyrMappings({'content':result,'flag':"sheetname"})
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            if(res.error){setError(res.error);return;}
            if(res.length>0){
                setFiledUpload(result)
                setSheetList(res)
            }else
            {
                setError("File is empty")
            }
        }
        else{
            setError("File is not supported")
        }    
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }catch(err){
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
        setError("invalid File!")
    }
}

function read(file) {
    return new Promise ((res,rej)=>{
        var reader = new FileReader();
        reader.onload = function() {
        res(reader.result);
        }
        reader.onerror = () => {
        rej("fail")
        }
        reader.onabort = () =>{
        rej("fail")
        }
        reader.readAsBinaryString(file);
    })
}

export default ImportMappings