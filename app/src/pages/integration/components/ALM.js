import React,{Fragment, useState,useRef} from 'react';
import {ScrollBar} from '../../global';
import {loginQCServer_ICE,qcProjectDetails_ICE,qcFolderDetails_ICE,saveQcDetails_ICE,viewQcMappedList_ICE} from '../api.js';
import { useSelector } from 'react-redux';


const ALM=(props)=>{
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const selProjectRef = useRef();
    const [projectDetails , setProjectDetails]=useState(null);
    const [testSuiteSelected_name , setTestSuiteSelected_name] = useState(null);
    const [folderDetails , setFolderDetails ] = useState([]);
    const [testSuiteDetails , setTestSuiteDetails]= useState([]);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [selectedScenario_ID , setSelectedScenario_ID]= useState(null);
    const [selectedScenarioName , setSelectedScenarioName]=useState(null);
    const [selectedtestSetName , setSelectectedTestSetName]= useState(null);
    const [selectedTestSuiteID , setSelectedTestSuiteID] = useState(null);
    const [selectedProject , setSelectedProject]=useState(null);
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
    

    const callProjectDetails_ICE=async(e)=>{
        props.setBlockui({show:true,content:'Loading...'})
        const domain = e.target.value;
        const userid = user_id;
        setSelectedDomain(domain)
        const projectDetails = await qcProjectDetails_ICE(domain , userid )
        if(projectDetails.error){props.displayError(projectDetails.error);return;}
        setProjectDetails(projectDetails)
        setFolderDetails([]);
        props.setBlockui({show:false});
        setReleaseDropdn("Select Release")
        setProjectDropdn1(domain);
    }
    const callFolderDetails_ICE = async(e)=>{
        props.setBlockui({show:true,content:'Loading TestCases...'})
        const domain = selectedDomain;
        const project_Name = e.target.value;
        setSelectedProject(project_Name);
        const folderDetails = await qcFolderDetails_ICE(domain,"root",project_Name,"folder",null)
        if(folderDetails.error){props.displayError(folderDetails.error);return;}
        setFolderDetails(folderDetails);
        props.setBlockui({show:false})
        setReleaseDropdn(project_Name);
    }
    const callTestSets = async(e,name,folderpath)=>{
        props.setBlockui({show:true,content:'Loading TestCases...'})
        const domain= selectedDomain;
        const testsetID= e;
        const project = selectedProject;
        const TestName = name;
        const foldername= folderpath;
        const testDetails = [...testSets]
        const folderDetails = await qcFolderDetails_ICE(domain,foldername,project,"testcase",TestName);
        if(folderDetails.error){props.displayError(folderDetails.error);return;}
        testDetails.push({content: folderDetails , testsetid : testsetID})
        setTestSets(testDetails);
        props.setBlockui({show:false})
        
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
    const calltestSuites=async(e,i)=>{
        props.setBlockui({show:true,content:'Loading TestCases...'})
        const domain= selectedDomain;
        const foldername= e;
        const project = selectedProject;
        const testDetails = [...testSuiteDetails]
        const folderDetails = await qcFolderDetails_ICE(domain,foldername,project,"folder",null);
        if(folderDetails.error){props.displayError(folderDetails.error);return;}
        testDetails.splice(0,0,folderDetails)
        setTestSuiteDetails(testDetails);
        props.setBlockui({show:false})

    }
    const callSaveButton =async()=>{ 
        props.setBlockui({show:true,content:'Saving...'})
        const response = await saveQcDetails_ICE(mappedDetails);
        if(response.error){props.displayError("Save Mapped Testcase",response.error);props.setBlockui({show:false});return;}
        if ( response == "success"){
            props.setBlockui({show:false})
            setErrorPopUp(true);
            props.displayError("Save Mapped Testcase","Saved Succesfully");
            setSaveSucess(true);
            setSyncSuccess(false);
        }
        props.setBlockui({show:false})
    }
    const callExit=()=>{
        setScreenExit(true);
        setFolderDetails(null);
        setScenarioArr(null);
        //setLoginSucess(false);
        //setFailMsg(null);
        setReleaseDropdn("Select Release");
        //setDisableSave(true);
        setProjectDropdn1("Select Project");
        setProjectDropdn2("Select Project");
        setMappedDetails([]);
        setSelectedScenario_ID(null);
        setSelectedTestSuiteID(null);
    }
    const callTestSuiteSelection=(event ,idx , name , testSet)=>{
        setSelectedTestSuiteID(idx)
        setTestSuiteSelected_name(name);
        setSelectectedTestSetName(testSet);
        
        if(event.target.childNodes.length){
            if(mappedDetails.length){
                if(mappedDetails[0].testsuiteid == idx){
                   setSyncSuccess(true);
                }
                else{
                    setSyncSuccess(false);
                }
               }
               else{
                setSyncSuccess(false)
               }
        }
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
                domain: selectedDomain,
                folderpath: folderpath,
                project: selectedProject,
                scenarioId: selectedScenario_ID,
                testcase: testSuiteSelected_name,
                testset:  selectedtestSetName
            }
         ]
        // setViewMappedFiles(false);
        setMappedDetails(mapped_Details);
        //setDisableSave(false)
        setSyncSuccess(true);
    }
    }
    
    const onSearch=(e)=>{
        var val = e.target.value;
        var filter = []
        var ScenarioName=[] 
        if(scenarioArr){
            projectDetails.avoassure_projects.map((e,i)=>(
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
        //setDisableSave(true);
    
    }
    return(
         !screenexit?
        <Fragment>
        <div className="page-taskName" >
            <span className="taskname">
                ALM Integration
            </span>
        </div>
        <div className="sepr_Div">
            <button className="saveQcbtn" style={{marginLeft:"470px"}} onClick={()=>callSaveButton()}>Save</button> 
            <button className="viewMapbtn" onClick={()=>props.callViewMappedFiles()}>View Mapped Files</button> 
            <button className="saveQcbtn" onClick={()=>{callExit();props.callExitcenter()}}>Exit</button>
        </div><br/>
        <div className="qcActionBtn">
        <label>ALM Tests</label>
        <label id="scenarioLabel">Avo Assure Scenarios</label>
        </div>
        <div className="leftQcStructure">
            <div className="qcDomProContainer">
                <select value={projectDropdn1} ref={selProjectRef} onChange={(e)=>callProjectDetails_ICE(e)} className="qcSelectDomain" style={{marginRight : "5px"}}>
                    <option value="Select Project"selected disabled >Select Domain</option>

                    {   props.domainDetails ? 
                        props.domainDetails.domain.map((e,i)=>(
                            <option id={e.id} value={e.name}>{e}</option>
                        )) : null
                    }
                </select>
                <select value={releaseDropdn} className="qcSelectProject" onChange={(e)=>callFolderDetails_ICE(e)}>
                    <option value="Select Release" selected disabled >Select Release</option>
                    {projectDetails ? 
                        projectDetails.qc_projects.map((e,i)=>(
                            <option value={e}>{e}</option>))
                            : null
                    }
                </select>

            </div>
            <div className="qcTreeContainer">
                <ScrollBar>
                    {folderDetails.length ? 
                        <Fragment>    
                            <ul className="rootUl">
                                <li>
                                    <img style={{height:"16px"}} src="static/imgs/ic-qcCollapse.png"/>
                                    <label>Root</label>
                                </li>
                                <ul>
                                {folderDetails[0].testfolder.map((e,i)=>(
                                    <li >
                                        <img  className="blueminusImage" id={i} onClick={()=>calltestSuites(e.folderpath,i)} style={{height:"16px" , cursor: "pointer"}} src= "static/imgs/ic-qcExpand.png"/>
                                        <label>{e.foldername}</label>
                                        {testSuiteDetails.length?
                                        testSuiteDetails.map((ele,i)=>(
                                            ele.map((element,i)=>(
                                            element.testfolder.length ?
                                            element.testfolder.map((test,i)=>( 
                                                    test.folderpath == e.folderpath.concat('\\',test.foldername) ?
                                                <li style={{paddingLeft:"40px"}}>
                                                    <img style={{height:"16px",cursor: "pointer"}} src="static/imgs/ic-qcExpand.png"/>
                                                    <label>{test.foldername}</label>
                                                </li>
                                                :null
                                                )) :
                                                element.TestSet.length ?
                                                element.TestSet.map((testCase,i)=>( 
                                                    testCase.testsetpath == e.folderpath?
                                                    <li style={{paddingLeft:"40px"}}>
                                                        <img style={{height:"16px",cursor: "pointer"}} onClick={()=>callTestSets(testCase.testsetid,testCase.testset,testCase.testsetpath)} src="static/imgs/ic-taskType-blue-plus.png"/>
                                                        <label>{testCase.testset}</label>
                                                        {testSets.length ? 
                                                        testSets.map((suite,idx)=>(suite.testsetid == testCase.testsetid?
                                                            suite.content[0].testcase.map((cases , index)=>(
                                                                <li id={cases.substring(cases.indexOf("/")+1)} onClick={(event)=>callTestSuiteSelection(event,cases.substring(cases.indexOf("/")+1),cases.slice(0,cases.indexOf("/")),testCase.testset)}>
                                                                <label style={{marginLeft:"34px"}} title={cases}>
                                                                    <span id="qcTestcaseId">{cases.substring(cases.indexOf("/")+1)}</span>
                                                                    <span>{cases.slice(0,cases.indexOf("/"))}</span>
                                                                </label>
                                                                { selectedTestSuiteID == cases.substring(cases.indexOf("/")+1)  ? <>
                                                            {syncSuccess ?<img onClick={()=>callUnSync()} style={{cursor: "pointer",paddingRight:"10px"}} src="static/imgs/ic-qcUndoSyncronise.png"/>:null}
                                                            {!syncSuccess ?<img onClick={()=>callSyncronise(testCase.testsetpath)} style={{cursor: "pointer",paddingRight:"10px"}} src="static/imgs/ic-qcSyncronise.png"/>:null}
                                                            </>
                                                            : null}
                                                                </li>
                                                                
                                                            ))
                                                            :null
                                                            ))
                                                        : null
                                                        }
                                                    </li>
                                                    :null
                                                    ))
                                                :null       
                                            )) ))
                                         : null  
                                        }
                                    </li>
                                ))}                                  
                            </ul>
                            </ul>
                            
                        </Fragment>
                            : null}
                    </ScrollBar>
            </div>
        </div> 
        <div className="rightQcStructure">
            <div className="qcProContainer">
                <select value={projectDropdn2} onChange={(e)=>callScenarios(e)} className="qtestAvoAssureSelectProject">
                    <option value="Select Project"selected disabled >Select Project</option>
                {
                    projectDetails ? 
                    projectDetails.avoassure_projects.map((e,i)=>(
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
            
            <div  className="qcAvoAssureTreeContainer">
            <ScrollBar>
                {
                    scenarioArr ? 
                    projectDetails.avoassure_projects.map((e,i)=>(
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
    </Fragment>
    :null)
}
    
export default ALM;