import React ,{useState , Fragment , useRef} from 'react';
import {ModalContainer , ScrollBar , PopupMsg ,ScreenOverlay} from '../../global';
import '../styles/IntegrationCenter.scss';
import { useSelector } from 'react-redux';
import { loginToQTest_ICE ,qtestProjectDetails_ICE , qtestFolderDetails_ICE , saveQtestDetails_ICE,viewQtestMappedList_ICE} from '../api.js';
import Content from "./Content.js"
const  IntegrationCenter = (props)=> {
const [loginSucess , setLoginSucess] = useState(false);
const urlRef = useRef();
const userNameRef = useRef();
const passwordRef = useRef();
const selProjectRef = useRef();
const [domainDetails , setDomainDetails] = useState(null);
const [projectDetails , setProjectDetails] = useState(null);
const [folderDetails , setFolderDetails ] = useState(null);
const [domainID , setDomainID]= useState(null);
const [failMSg , setFailMsg] = useState(null);
const [testSuiteSelected_name , setTestSuiteSelected_name] = useState(null);
const [selectedScenario_ID , setSelectedScenario_ID]= useState(null);
const [selectedScenarioName , setSelectedScenarioName]=useState(null)
const [selectedTestSuiteID , setSelectedTestSuiteID] = useState(null);
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
const [blockui,setBlockui] = useState({show:false});
const [popup ,setPopup]= useState({show:false});
const [disableSave , setDisableSave]=useState(true);
const [saveSucess , setSaveSucess]=useState(false);
    
    
const user_id = useSelector(state=> state.login.userinfo.user_id); 
const displayError = (error) =>{
    setPopup({
      title:'ERROR',
      content:error,
      submitText:'Ok',
      show:true
    })
  }

const callLogin_ICE = async()=>{
    if(!(urlRef.current.value) ){
        setFailMsg("Please Enter URL")
    }
    else if(!(userNameRef.current.value)){
        setFailMsg("Please Enter Username ")
    }
    else if(!(passwordRef.current.value)){
        setFailMsg("Please Enter Password ")
    }
    else {
        setBlockui({show:true,content:'Logging...'})
        const qcPassword = passwordRef.current.value;
        const qcURL = urlRef.current.value;
        const qcUsername = userNameRef.current.value;
        const domainDetails = await loginToQTest_ICE(qcPassword ,qcURL ,qcUsername);
        if(domainDetails.error){displayError(domainDetails.error);return;}
        if(domainDetails === "unavailableLocalServer"){
            setFailMsg("ICE Engine is not available, Please run the batch file and connect to the Server.")
        }
        else{
        setDomainDetails(domainDetails);
        setLoginSucess(true);
        props.setPopUpEnable(false);
    }
    setBlockui({show:false})
    }
}
const callProjectDetails_ICE=async(e)=>{
    setBlockui({show:true,content:'Loading...'})
    const domain = e.target.value;
    const domainid = (e.target.childNodes[e.target.selectedIndex]).getAttribute("id")
    setDomainID(domainid);
    const userid = user_id;
    const projectDetails = await qtestProjectDetails_ICE(domain , userid )
    if(projectDetails.error){displayError(projectDetails.error);return;}
    setProjectDetails(projectDetails)
    setFolderDetails(null);
    setBlockui({show:false});
    setReleaseDropdn("Select Release")
    setProjectDropdn1(domain);
}
const callFolderDetails_ICE = async(e)=>{
    setBlockui({show:true,content:'Loading TestCases...'})
    const projectName = e.target.value;
    const domain_ID = domainID
    const folderDetails = await qtestFolderDetails_ICE(projectName,"root",domain_ID,"folder",)
    if(folderDetails.error){displayError(folderDetails.error);return;}
    setFolderDetails(folderDetails);
    setBlockui({show:false})
    setReleaseDropdn(projectName);
}
const callCycleExpand =(idx)=>{
    var expandarr =[...folderDetails];
    expandarr.map((e,i)=>(
        i== idx.i ? (e['cycleOpen'] == true)? e['cycleOpen'] = false : e['cycleOpen'] = true : null
    ))
    setFolderDetails(expandarr);
    
}
const callTestSuiteExpand =(idx)=>{
    var expandarr=[...folderDetails];
    expandarr.map((e,i)=>(
        i== idx.i ? 
        e['TestsuiteOpen'] == true ? e['TestsuiteOpen'] = false : e['TestsuiteOpen'] = true : null
    ))
    setFolderDetails(expandarr);
}
const callTestSuiteSelection=(event ,idx , name)=>{
    setSelectedTestSuiteID(idx)
    setTestSuiteSelected_name(name);
    
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
const callSyncronise =()=>{
    const Project_Name = selProjectRef.current.value;
    var project_id ;
    domainDetails.map((e,i)=>(
        e.name == Project_Name ? 
                project_id = e.id : null
    ))
    if(!Project_Name){
        return null;
    }
    else if(!selectedScenario_ID){
        setPopup({
            title:'Save Mapped Testcase ',
            content:"Please Select a Scenario",
            submitText:'Ok',
            show:true
          });
    }
        else{
    const mapped_Details=[
        {
            project: Project_Name,
            projectid: project_id,
            scenarioId: selectedScenario_ID,
            testsuite: testSuiteSelected_name,
            testsuiteid: selectedTestSuiteID  
        }
    ]
    props.setViewMappedFiles(false);
    setMappedDetails(mapped_Details);
    setDisableSave(false)
    setSyncSuccess(true);
}
}
const callSaveButton =async()=>{ 
    setBlockui({show:true,content:'Saving...'})
    const response = await saveQtestDetails_ICE(mappedDetails);
    if(response.error){displayError(response.error);setBlockui({show:false});return;}
    if ( response == "success"){
        setBlockui({show:false})
        setErrorPopUp(true);
        setFailMsg("Saved Successfully");
        setSaveSucess(true);
        setSyncSuccess(false);
    }
    setBlockui({show:false})
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
const callViewMappedFiles=()=>{
    if(mappedDetails.length == 0){
        setPopup({
            title:'Mapped Testcase',
            content:"No mapped details",
            submitText:'Ok',
            show:true
          })
    }
    else if (saveSucess){
        props.setViewMappedFiles(true);
        props.setqTestClicked(false)
    }
    else(
        setPopup({
            title:'Mapped Testcase',
            content:"No mapped details",
            submitText:'Ok',
            show:true
          }) 
    )
}
const callExit=()=>{
    props.setqTestClicked(false);
    props.setFocus(null);
    setFolderDetails(null);
    setScenarioArr(null);
    setLoginSucess(false);
    props.setPopUpEnable(false);
    setFailMsg(null);
    setReleaseDropdn("Select Release");
    setDisableSave(true);
    setProjectDropdn1("Select Project");
    setProjectDropdn2("Select Project");
}
const callUnSync=()=>{
    setSyncSuccess(false);
    setMappedDetails([]);
    setDisableSave(true)

}
const content =()=>{
    return(
        <Content
            urlRef={urlRef}
            userNameRef={userNameRef}
            passwordRef={passwordRef}
            failMSg={failMSg}
            callLogin_ICE={callLogin_ICE}
         />
    )
}
return (<Fragment>
        {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
        {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
        {props.viewmappedFiles ? 
            <div  className="middleContent">
                <div className="middle_holder">
                    <div className="page-taskName" >
                        <span className="taskname">
                            Mapped files
                        </span>
                    </div>
                    <div className="qcActionBtn">
                        <label>qTest Tests</label>
                        <label id="scenarioLabel">Avo Assure Scenarios</label>
                    </div>
                    <div className="leftQcStructure" style={{border:"none"}}><li className="mappedLis">{ mappedDetails.length? mappedDetails[0].testsuite: null}</li></div>
                    {/* <div className="hrBetween"></div> */}
                    <div className="rightQcStructure" style={{border:"none"}}><li className="mappedLis">{selectedScenarioName}</li></div>

                </div>   
            </div> : 
        <div className="middleContent">
        <div className="middle_holder">
                {
                    props.qTestClicked ?  
                    <Fragment>
                        <div className="page-taskName" >
                            <span className="taskname">
                                qTest Integration
                            </span>
                        </div>
                        <div className="sepr_Div">
                            <button disabled={disableSave} onClick={()=>callSaveButton()} className="saveQcbtn" style={{marginLeft:"470px"}}>Save</button> 
                            <button onClick={()=>callViewMappedFiles()} className="viewMapbtn">View Mapped Files</button> 
                            <button onClick={()=>callExit()} className="saveQcbtn">Exit</button>
                        </div><br/>
                        <div className="qcActionBtn">
                        <label>qTest Tests</label>
                        <label id="scenarioLabel">Avo Assure Scenarios</label>
                        </div>
                        <div className="leftQcStructure">
                            <div className="qcDomProContainer">
                                <select value={projectDropdn1} ref={selProjectRef} onChange={(e)=>callProjectDetails_ICE(e)} className="qcSelectDomain" style={{marginRight : "5px"}}>
                                    <option value="Select Project"selected disabled >Select Project</option>

                                    {   domainDetails ? 
                                        domainDetails.map((e,i)=>(
                                            <option id={e.id} value={e.name}>{e.name}</option>
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
                                    { folderDetails ? 
                                        <Fragment>    
                                            <ul className="rootUl">
                                                <li>
                                                    <img style={{height:"16px"}} src="static/imgs/ic-qcCollapse.png"/>
                                                    <label>Root</label>
                                                </li>
                                                <ul>
                                                {folderDetails.map((e,i)=>(
                                                    <li >
                                                        <img  className="blueminusImage" id={i} onClick={()=>callCycleExpand({i})} style={{height:"16px" , cursor: "pointer"}} src={e.cycleOpen? "static/imgs/ic-qcCollapse.png" : "static/imgs/ic-qcExpand.png"}/>
                                                        <label>{e.cycle}</label>
                                                        {
                                                            e.cycleOpen ?
                                                            <Fragment> 
                                                            <li  style={{paddingLeft:"40px"}}>
                                                                <img  onClick={()=>callTestSuiteExpand({i})} style={{height:"16px",cursor: "pointer"}} src={e.TestsuiteOpen?"static/imgs/ic-taskType-blue-minus.png" :"static/imgs/ic-taskType-blue-plus.png"}/>
                                                                {e.testsuites.map((e,i)=>(
                                                                    <label>{e.name}</label>
                                                                
                                                                ))
                                                                }
                                                            {
                                                                e.TestsuiteOpen ?
                                                                <li id="testSuitediv">
                                                                {e.testsuites.map((e,i)=>(
                                                                    e.testruns.map((e,i)=>(
                                                                        <Fragment>
                                                                        <div style={{cursor: "pointer"}} onClick={(event)=>callTestSuiteSelection(event,e.id ,e.name)} id={e.id} className={selectedTestSuiteID == e.id? "slectedTestDiv": null} >
                                                                            <label>{e.name}</label>
                                                                            { selectedTestSuiteID == e.id ? <>
                                                                            {syncSuccess ?<img onClick={()=>callUnSync()} style={{cursor: "pointer",paddingRight:"10px"}} src="static/imgs/ic-qcUndoSyncronise.png"/>:null}
                                                                            {!syncSuccess ?<img onClick={()=>callSyncronise()} style={{cursor: "pointer",paddingRight:"10px"}} src="static/imgs/ic-qcSyncronise.png"/>:null}
                                                                            </>
                                                                            : null}
                                                                        </div>
                                                                        </Fragment>
                                                                    ))
                                                                
                                                                ))}
                                                                </li> 
                                                                    : null

                                                            }
                                                            </li> </Fragment>: null
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
                : null   
                    }
                    {
                    props.popUpEnable  & (!loginSucess)? 
                    <Fragment>
                        <ModalContainer 
                            title="qTest Login"
                            close={()=>{props.setPopUpEnable(false);props.setFocus(null);props.setqTestClicked(false);setFailMsg(null)}}
                            content={content()}/>
                        
                    </Fragment>
                    : null
                }
                {
                    errorPopUp ? 
                        <PopupMsg
                        content ={failMSg}
                        submitText ="OK" 
                        title ="Save Mapped Testcase"
                        submit = {()=>setErrorPopUp(false)}
                        close ={()=>setErrorPopUp(false)}/> 
                    : null
                }
            </div>
        </div>}
        </Fragment>
    
    )
}

export default IntegrationCenter

