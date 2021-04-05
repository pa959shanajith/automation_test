import React,{ useState } from 'react';
import {qcProjectDetails_ICE,qcFolderDetails_ICE,saveQcDetails_ICE} from '../api.js';
import { useSelector, useDispatch } from 'react-redux';
import MappingPage from '../containers/MappingPage';
import FolderNode from './ALMTree';
import * as actionTypes from '../state/action';
import '../styles/ALM.scss';
import "../styles/TestList.scss"

const ALMContent = props => {
    const dispatch = useDispatch();
    const user_id = useSelector(state=> state.login.userinfo.user_id);
    const selectedScenarioIds = useSelector(state=>state.integration.selectedScenarioIds);
    const mappedPair = useSelector(state=>state.integration.mappedPair);

    const [projectDetails , setProjectDetails]=useState(null);
    const [folderDetails , setFolderDetails ] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [scenarioArr , setScenarioArr] = useState(false);
    const [scenario_ID , setScenario_ID] = useState(null) ;
    const [projectDropdn1 , setProjectDropdn1]= useState(null);
    const [projectDropdn2 , setProjectDropdn2]= useState(null);
    const [releaseDropdn, setReleaseDropdn]=useState(null);
    const [SearchIconClicked , setSearchIconClicked] =useState(false);
    const [filteredNames , setFilteredName]= useState(null);
    const [screenexit , setScreenExit]= useState(false);
    

    const callProjectDetails_ICE=async(e)=>{
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        const domain = e.target.value;
        const userid = user_id;
        setSelectedDomain(domain)
        const projectDetails = await qcProjectDetails_ICE(domain , userid )
        if (projectDetails.error){
            dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: projectDetails.error}});
        }
        setProjectDetails(projectDetails)
        setFolderDetails([]);
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
        setReleaseDropdn("Select Release")
        setProjectDropdn1(domain);
        clearSelections();
    }
    const callFolderDetails_ICE = async(e)=>{
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading Testcases...'});
        const domain = selectedDomain;
        const project_Name = e.target.value;
        const folderDetails = await qcFolderDetails_ICE(domain,"root",project_Name,"folder",null)
        if (folderDetails.error){
            dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: folderDetails.error}});
        }
        setReleaseDropdn(project_Name);
        setFolderDetails(folderDetails);
        clearSelections();
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }
    
    const callScenarios =(e)=>{
        const scenarioID = (e.target.childNodes[e.target.selectedIndex]).getAttribute("id");
        const project_Name= e.target.value
        setScenarioArr(true);
        setScenario_ID(scenarioID);
        setFilteredName(null);
        setProjectDropdn2(project_Name)
        setSearchIconClicked(false);
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: []});
    }
    
    const callSaveButton =async()=>{ 
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Saving...'});
        const response = await saveQcDetails_ICE(mappedPair);
        if(response.error){
            dispatch({type: actionTypes.SHOW_POPUP, payload:{title: "Error", content: response.error}});
        }
        if ( response === "success"){
            dispatch({type: actionTypes.SHOW_POPUP, payload:{title: "Save Mapped Testcase", content: "Saved Succesfully"}});
            dispatch({type: actionTypes.MAPPED_PAIR, payload: []});
            clearSelections();
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }
    const callExit=()=>{
        setScreenExit(true);
        setFolderDetails(null);
        setScenarioArr(null);
        setReleaseDropdn("Select Release");
        setProjectDropdn1("Select Project");
        setProjectDropdn2("Select Project");
        dispatch({type: actionTypes.MAPPED_PAIR, payload: []});
        clearSelections();
    }

    const clearSelections = () => {
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: []});
        dispatch({
            type: actionTypes.SEL_TC_DETAILS, 
            payload: {
                selectedTCNames: [],
                selectedTSNames: [],
                selectedFolderPaths: []
            }
        });
        dispatch({type: actionTypes.SYNCED_TC, payload: []});
        dispatch({type: actionTypes.SEL_TC, payload: []});
    }
    
    const onSearch=(e)=>{
        var val = e.target.value;
        var filter = []
        if(scenarioArr){
            projectDetails.avoassure_projects[parseInt(scenario_ID)].scenario_details
                .forEach(e=>{
                    if (e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
                        filter.push(e);
                })
        }
        setFilteredName(filter)
    }

    const selectScenarioMultiple = (e,id) => {
        let newScenarioIds = [...selectedScenarioIds];
        if(!e.ctrlKey) {
			newScenarioIds = [id];
		} else if (e.ctrlKey) { 
            const index = newScenarioIds.indexOf(id);
            if (index !== -1) {
                newScenarioIds.splice(index, 1);
            }
            else newScenarioIds.push(id);
        }
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: newScenarioIds});	
    }

    return ( 
        !screenexit &&
        <MappingPage 
            pageTitle="ALM Integration"
            onSave={()=>callSaveButton()}
            onViewMap={()=>props.callViewMappedFiles()}
            onExit={()=>{ callExit(); props.callExitcenter() }}
            leftBoxTitle="ALM Tests"            
            rightBoxTitle="Avo Assure Scenarios"
            selectTestDomain = {
                <select data-test='intg_alm_domain_drpdwn'value={projectDropdn1} onChange={(e)=>callProjectDetails_ICE(e)} style={{marginRight : "5px"}}>
                    <option value="Select Project" selected disabled >Select Domain</option>
                    { props.domainDetails && 
                        props.domainDetails.domain.map((e, i) => (
                            <option id={e.id} key={i} value={e.name}>{e}</option>
                        )) }
                </select>
            }
            selectTestRelease = {
                <select data-test='intg_alm_release_drpdwn' value={releaseDropdn} onChange={(e)=>callFolderDetails_ICE(e)}>
                    <option value="Select Release" selected disabled >Select Release</option>
                    { projectDetails &&
                        projectDetails.qc_projects.map((e, i) => (
                            <option key={i} value={e}>{e}</option>
                        )) }
                </select>
            }
            selectScenarioProject = {
                <select data-test='intg_alm_project_dropdwn'value={projectDropdn2} onChange={(e)=>callScenarios(e)}>
                    <option value="Select Project" selected disabled >Select Project</option>
                    { projectDetails && 
                        projectDetails.avoassure_projects.map((e,i)=>(
                            <option id={i} value={e.project_name} >{e.project_name}</option>
                        )) }
                </select>
            }
            searchScenario = { scenarioArr &&
                <> { SearchIconClicked && 
                    <input onChange={(e)=>onSearch(e)} type="text" placeholder="Scenario Name"/> }
                    <span className="mapping__searchIcon" style={{display:"inline" , float:"right"}}> 
                        <img alt="searchIcon" 
                            onClick={()=>{setSearchIconClicked(!SearchIconClicked);setFilteredName(null)}} 
                            style={{cursor: "pointer" , display:"inline",float:"right"}} 
                            src="static/imgs/ic-searchIcon-black.png" 
                        />
                    </span> </> 
            }
            testList = {folderDetails.length && ("testfolder" in folderDetails[0]) ?
                <>    
                <div data-test='intg_alm_test_list' className="test__rootDiv">
                    <img alt="collapse"
                        className="test_tree_toggle" 
                        src="static/imgs/ic-qcCollapse.png"
                    />
                    <label>Root</label>
                    {folderDetails[0].testfolder.map(folder =>
                        <FolderNode 
                            folderObject={folder}
                            type="folder"
                            projectName={projectDropdn1}
                            releaseName={releaseDropdn}
                        />
                    )} 
                </div>
                </> : <div></div>
            }
            scenarioList = { scenarioArr && 
                (filteredNames ? filteredNames : projectDetails.avoassure_projects[parseInt(scenario_ID)].scenario_details)
                    .map(e => (
                        <div 
                            className={"scenario__listItem "+(selectedScenarioIds.indexOf(e._id)!==-1 ? " scenario__selectedTC" : "")} 
                            onClick={(event)=>{selectScenarioMultiple(event, e._id);}}
                        >
                            {e.name}
                        </div> ))
            }
        />
    ); 
}
    
export default ALMContent;