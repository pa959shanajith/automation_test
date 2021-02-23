import React,{Fragment, useState,useRef} from 'react';
import {ScrollBar} from '../../global';
import {zephyrProjectDetails_ICE,saveZephyrDetails_ICE} from '../api.js';
import { useSelector } from 'react-redux';


const Zephyr=(props)=>{
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const selProjectRef = useRef();
    const [projectDetails , setProjectDetails]=useState(null);
    const [avoProjects , setAvoprojects]= useState(null);
    const [selectedIssueId , setSelectedIssueID] = useState(null);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [selectedScenario_ID , setSelectedScenario_ID]= useState(null);
    const [selectedScenarioName , setSelectedScenarioName]=useState(null);
    const [selectedtestName , setSelectectedTestName]= useState(null);
    const [selectedTestSuiteID , setSelectedTestSuiteID] = useState(null);
    const [selectedProjectID , setSelectedProjectId]=useState(null);
    const [scenarioArr , setScenarioArr] = useState(false);
    const [scenario_ID , setScenario_ID] = useState(null) ;
    const [projectDropdn1 , setProjectDropdn1]= useState(null);
    const [projectDropdn2 , setProjectDropdn2]= useState(null);
    const [releaseDropdn, setReleaseDropdn]=useState(null);
    const [mappedDetails ,setMappedDetails]= useState([]);
    const [SearchIconClicked , setSearchIconClicked] =useState(false);
    const [errorPopUp , setErrorPopUp]= useState(false);
    const [syncSuccess , setSyncSuccess]= useState(false);
    const [filteredNames , setFilteredName]= useState(null);
    const [testSets , setTestSets]= useState([]);
    const [saveSucess , setSaveSucess]=useState(false);
    const [screenexit , setScreenExit]= useState(false);
    const[selectedCycleId , setSelectedCycleId]=useState(null);
    const[selectedVersionId , setSelectedVersionId] =useState(null)
    

    const callProjectDetails_ICE=async(e)=>{
        props.setBlockui({show:true,content:'Loading...'})
        const domain = e.target.value;
        const userid = user_id;
        setSelectedDomain(domain)
        const projectDetails = await zephyrProjectDetails_ICE(domain , userid )
        if(projectDetails.error){props.displayError(projectDetails.error);return;}
        setProjectDetails(projectDetails.project_dets);
        setAvoprojects(projectDetails.avoassure_projects);
        props.setBlockui({show:false});
        setReleaseDropdn("Select Release")
        setProjectDropdn1(domain);
    }

    const callScenarios =(e)=>{
        const scenarioID = (e.target.childNodes[e.target.selectedIndex]).getAttribute("id");
        const project_Name= e.target.value
        setScenarioArr(true);
        setScenario_ID(scenarioID);
        setFilteredName(null);
        setProjectDropdn2(project_Name)
        setSearchIconClicked(false);
        setSelectedScenario_ID(null);
        setSelectedScenarioName(null);
    }
    const calltestSuites=(e)=>{
        const arr =[...projectDetails];
        arr.map((element,i)=>(
            element.cycleId == e ? (element['cycleOpen'] == true)? element['cycleOpen'] = false : element['cycleOpen'] = true : null
        ))
        setProjectDetails(arr);
    }
    const callSaveButton =async()=>{ 
        props.setBlockui({show:true,content:'Saving...'})
        const response = await saveZephyrDetails_ICE(mappedDetails);
        if(response.error){props.displayError("Error",response.error);props.setBlockui({show:false});return;}
        if ( response == "success"){
            props.setBlockui({show:false})
            setErrorPopUp(true);
            props.displayError("Error","Saved Succesfully");
            setSaveSucess(true);
            setSyncSuccess(false);
        }
        props.setBlockui({show:false})
    }
    const callExit=()=>{
        setScreenExit(true);
        setScenarioArr(null);
        setReleaseDropdn("Select Release");
        setProjectDropdn1("Select Project");
        setProjectDropdn2("Select Project");
        setMappedDetails([]);
        setSelectedScenario_ID(null);
        setSelectedTestSuiteID(null);
    }
    const callTestSuiteSelection=(id , issueid , name, versionId,cycleId,projectId )=>{
        setSelectedTestSuiteID(id)
        setSelectectedTestName(name)
        setSelectedCycleId(cycleId)
        setSelectedIssueID(issueid)
        setSelectedVersionId(versionId)
        setSelectedProjectId(projectId)
    }
    const callSyncronise =(folderpath)=>{
        if(!selectedScenario_ID){
            props.setPopup({
                title:'Save Mapped Testcase ',
                content:"Please Select a Scenario",
                submitText:'Ok',
                show:true
              });
        }
            else{
        const mapped_Details=[
            {
                cycleid: selectedCycleId,
                issueid: selectedIssueId,
                projectid: selectedProjectID,
                scenarioId: selectedScenario_ID,
                testid: selectedTestSuiteID,
                testname:  selectedtestName,
                versionid : selectedVersionId
            }
         ]
        setMappedDetails(mapped_Details);
        setSyncSuccess(true);
    }
    }
    
    const onSearch=(e)=>{
        var val = e.target.value;
        var filter = []
        var ScenarioName=[] 
        if(scenarioArr){
            avoProjects.map((e,i)=>(
                (i == scenario_ID) ? 
                    e.scenario_details ? 
                    e.scenario_details.map((e,i)=>(
                        ScenarioName.push(e.name)
                    )):null : null 
            ))
            }
        filter = [...ScenarioName].filter((e)=>e.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setFilteredName(filter)
    }
    const callUnSync=()=>{
        setSyncSuccess(false);
        setMappedDetails([]);
    
    }
    console.log(projectDetails);
    return(
         !screenexit?
        <Fragment>
        <div className="page-taskName" >
            <span className="taskname">
                Zephyr Integration
            </span>
        </div>
        <div className="sepr_Div">
            <button className="saveQcbtn" style={{marginLeft:"470px"}} onClick={()=>callSaveButton()}>Save</button> 
            <button className="viewMapbtn" onClick={()=>props.callViewMappedFiles()}>View Mapped Files</button> 
            <button className="saveQcbtn" onClick={()=>callExit()}>Exit</button>
        </div>
        <div className="trees_wrappers">
            <div className="leftQcStructure">
             <span className="title_rows">
             <label>Zephyr Tests</label>
            </span>
            <div className="left_tree_container">
            <div className="qcDomProContainer">
                <select value={projectDropdn1} ref={selProjectRef} onChange={(e)=>callProjectDetails_ICE(e)} className="qcSelectDomain" style={{marginRight : "5px"}}>
                    <option value="Select Project"selected disabled >Select Project</option>

                    {   props.domainDetails ? 
                        props.domainDetails.map((e,i)=>(
                            <option id={e.id} value={e.name}>{e.name}</option>
                        )) : null
                    }
                </select>

            </div>
            <div className="qcTreeContainer" id="left_tree">
                <ScrollBar scrollId="left_tree" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                    {projectDetails? 
                        <Fragment>    
                            <ul className="rootUl">
                                <li>
                                    <img style={{height:"16px"}} src="static/imgs/ic-qcCollapse.png"/>
                                    <label>Root</label>
                                </li>
                                <ul>
                                {projectDetails.map((e,i)=>(
                                    <li >
                                        <img  className="blueminusImage" id={e.cycleId} onClick={()=>calltestSuites(e.cycleId)} style={{height:"16px" , cursor: "pointer"}} src={e.cycleOpen? "static/imgs/ic-qcCollapse.png" : "static/imgs/ic-qcExpand.png"}/>
                                        <label>{e.cycle}</label>
                                        {e.cycleOpen? 
                                            e.tests.map((ele ,i)=>(
                                                <ul style={{cursor:"pointer"}} onClick={()=>callTestSuiteSelection(ele.id,ele.issueId,ele.name,e.versionId,e.cycleId,e.projectId)}>
                                                    <li style={selectedTestSuiteID == ele.id? {backgroundColor:"rgb(225,202,255"} : null}>
                                                        <label>{ele.name}</label>
                                                        { selectedTestSuiteID == ele.id ? <>
                                                            {syncSuccess ?<img onClick={()=>callUnSync()} style={{cursor: "pointer",float:"right",paddingRight:"10px"}} src="static/imgs/ic-qcUndoSyncronise.png"/>:null}
                                                            {!syncSuccess ?<img onClick={()=>callSyncronise()} style={{cursor: "pointer",float:"right",paddingRight:"10px"}} src="static/imgs/ic-qcSyncronise.png"/>:null}
                                                            </>
                                                            : null}
                                                    </li>
                                                </ul>
                                                
                                            )): null}

                                    </li>
                                ))}                                  
                            </ul>
                            </ul>   
                        </Fragment>
                            : null}
                    </ScrollBar>
            </div>
        </div> 
        </div>
        <div className="rightQcStructure">
            <span className="title_rows"><label>Avo Assure Scenarios</label></span>
            <div className="right_tree_container">
            <div className="qcProContainer">
                <select value={projectDropdn2} onChange={(e)=>callScenarios(e)} className="qtestAvoAssureSelectProject">
                    <option value="Select Project"selected disabled >Select Project</option>
                {
                    avoProjects? 
                    avoProjects.map((e,i)=>(
                        <option id={i} value={e.project_name} >{e.project_name}</option>))
                        : null 
                }
                </select>
                {scenarioArr ?
                <>
                    {SearchIconClicked ?
                        <input onChange={(e)=>onSearch(e)} type="text" placeholder="Scenario Name"/> : null}
                    <span className="searchScenarioAvoAssure" style={{display:"inline" , float:"right"}}> 
                        <img onClick={()=>{setSearchIconClicked(!SearchIconClicked);setFilteredName(null)}} style={{cursor: "pointer" , display:"inline",float:"right"}} src="static/imgs/ic-searchIcon-black.png"></img>
                    </span>
                </> : null    
                }
            </div>
            
            <div  className="qcAvoAssureTreeContainer" id="right_tree">
            <ScrollBar scrollId="right_tree" hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                {
                    scenarioArr ? 
                    avoProjects.map((e,i)=>(
                        (i == scenario_ID)? 
                        (e.scenario_details)? 
                        e.scenario_details.map((e,i)=>(
                            
                            <div style={{cursor: "pointer"}}>
                                <li 
                                    className={selectedScenario_ID == e._id ? "slectedTestDiv" : null} 
                                    onClick={()=>{setSelectedScenario_ID(e._id);setSelectedScenarioName(e.name)}}
                                >
                                { filteredNames? filteredNames.map((element)=>(element == e.name ?element  : null)):  e.name}
                                </li>
                            </div>
                        )):null : null
                        ))
                        : null 
                }
            </ScrollBar>
            </div>
            </div>
        </div>
        </div>
    </Fragment>
    :null)
}
    
export default Zephyr;