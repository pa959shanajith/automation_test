import React,{Fragment, useState,useRef} from 'react';
import {ScrollBar} from '../../global';
import {loginQCServer_ICE,qcProjectDetails_ICE,qcFolderDetails_ICE,saveQcDetails_ICE,viewQcMappedList_ICE} from '../api.js';
import { useSelector } from 'react-redux';
import '../styles/ALM.scss';

const ALM=(props)=>{
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const selProjectRef = useRef();
    const [projectDetails , setProjectDetails]=useState(null);
    const [testSuiteSelected_name , setTestSuiteSelected_name] = useState([]);
    const [folderDetails , setFolderDetails ] = useState([]);
    const [testSuiteDetails , setTestSuiteDetails]= useState([]);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [selectedScenario_ID , setSelectedScenario_ID]= useState([]); //make it array and ctrl+click per add ya remove kerte jao
    const [selectedtestSetName , setSelectedTestSetName]= useState([]);
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
        setSelectedScenario_ID([]);
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
        if(response.error){props.displayError("Error",response.error);props.setBlockui({show:false});return;}
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
        setSelectedScenario_ID([]);
        setSelectedTestSetName([]);
    }
    const callTestSuiteSelection=(e ,idx , name , testSet)=>{
        if(!e.ctrlKey) { //no ctrl 
            setSelectedTestSetName([testSet]);
            setTestSuiteSelected_name([name]);
		} else if (e.ctrlKey) { // ctrl key
            var testSuiteSelected_nameData = [...testSuiteSelected_name];
            var selectedtestSetNameData = [...selectedtestSetName];
            const index = testSuiteSelected_nameData.indexOf(name);
            if (index !== -1) {
                testSuiteSelected_nameData.splice(index, 1);
                selectedtestSetNameData.splice(index, 1);
            }
            else{
                testSuiteSelected_nameData.push(name);
                selectedtestSetNameData.push(testSet)
            } 
            setSelectedTestSetName(selectedtestSetNameData);
            setTestSuiteSelected_name(testSuiteSelected_nameData);
		}
		e.stopPropagation();	
	    
     

        // sync async img logic
        if(e.target.childNodes.length){
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
        if(selectedScenario_ID.length===0){
            props.setPopup({
                title:'Save Mapped Testcase ',
                content:"Please Select a Scenario",
                submitText:'Ok',
                show:true
              });
        }
        else if(testSuiteSelected_name.length===0){
            props.setPopup({
                title:'Save Mapped Testcase ',
                content:"Please select Testcase",
                submitText:'Ok',
                show:true
              });
        }
        else if(testSuiteSelected_name.length>1 && selectedScenario_ID.length>1) {
			props.setPopup({
                title:'Save Mapped Testcase ',
                content:"Cannot map multiple test cases with multiple scenarios",
                submitText:'Ok',
                show:true
            });
        }
        else{
            const mapped_Details=[
                {
                    domain: selectedDomain,
                    folderpath: [folderpath],
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

    const selectScenarioMultiple = (e,id) => {
        if(!e.ctrlKey) { //no ctrl 
			setSelectedScenario_ID([id])
		} else if (e.ctrlKey) { // ctrl key
            var selectedScenario_IDData = [...selectedScenario_ID];
            const index = selectedScenario_IDData.indexOf(id);
            if (index !== -1) {
                selectedScenario_IDData.splice(index, 1);
            }
            else selectedScenario_IDData.push(id);
            setSelectedScenario_ID(selectedScenario_IDData); 
		}
		e.stopPropagation();	
    }
    console.log(testSuiteDetails);
    return(
         !screenexit?
        <>
        <div className="page-taskName" >
            <span className="taskname">
                ALM Integration
            </span>
        </div>
        <div className="alm__action_row">
            <button onClick={()=>callSaveButton()}>Save</button> 
            <button onClick={()=>props.callViewMappedFiles()}>View Mapped Files</button> 
            <button onClick={()=>{callExit();props.callExitcenter()}}>Exit</button>
        </div>
        <div className="alm__tree_containers">
            <div className="alm__tree_container">
                <span className="alm__title_row"><label>ALM Tests</label></span>
                <div className="alm__left_tree_container">
                    <div className="alm_tree_selection_box">
                        <select value={projectDropdn1} ref={selProjectRef} onChange={(e)=>callProjectDetails_ICE(e)} className="qcSelectDomain" style={{marginRight : "5px"}}>
                            <option value="Select Project"selected disabled >Select Domain</option>

                            { props.domainDetails && 
                                props.domainDetails.domain.map(e => (
                                    <option id={e.id} value={e.name}>{e}</option>
                                )) }
                        </select>
                        <select value={releaseDropdn} className="qcSelectProject" onChange={(e)=>callFolderDetails_ICE(e)}>
                            <option value="Select Release" selected disabled >Select Release</option>
                            { projectDetails &&
                                projectDetails.qc_projects.map( e => (
                                    <option value={e}>{e}</option>)) }
                        </select>

                    </div>
                    <div className="alm__left_tree" id="alm_left_tree">
                        <ScrollBar scrollId="alm_left_tree" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                            {folderDetails.length ?
                                <>    
                                <div className="alm__rootDiv">
                                    <img className="alm_tree_toggle" src="static/imgs/ic-qcCollapse.png"/>
                                    <label>Root</label>
                                <div className="alm_tree_branches">
                                    { folderDetails[0].testfolder.map((e,i)=>(
                                        <div>
                                            <img className="alm_tree_toggle" id={i} onClick={()=>calltestSuites(e.folderpath,i)} src= "static/imgs/ic-qcExpand.png"/>
                                            <label>{e.foldername}</label>
                                            { testSuiteDetails.length ?
                                            testSuiteDetails.map(ele=>(
                                                ele.map(element => (
                                                element.testfolder.length ?
                                                    element.testfolder.map( test => ( 
                                                            (test.folderpath === e.folderpath.concat('\\', test.foldername)) &&
                                                        <div className="alm_tree_branches">
                                                            <img className="alm_tree_toggle" onClick={()=>calltestSuites(test.folderpath)}src="static/imgs/ic-qcExpand.png"/>
                                                            <label>{test.foldername}</label>
                                                            {testSuiteDetails.map(elem=>(
                                                                elem.map(elements=>(
                                                                    elements.testfolder.length?
                                                                    elements.testfolder.map(nTest=>(
                                                                       (nTest.folderpath == test.folderpath.concat('\\',nTest.foldername))&&
                                                                       <div className="alm_tree_branches">
                                                                            <img className="alm_tree_toggle" onClick={()=>calltestSuites(nTest.folderpath)}src="static/imgs/ic-qcExpand.png"/>
                                                                            <label>{nTest.foldername}</label>
                                                                            {
                                                                                testSuiteDetails.map(ele1=>(
                                                                                    ele1.map(ele2=>(
                                                                                      ele2.TestSet.length && 
                                                                                      ele2.TestSet.map(ele3=>(
                                                                                          (ele3.testsetpath == nTest.folderpath) ?
                                                                                          <div className="alm_tree_branches">
                                                                                            <img className="alm_tree_toggle" onClick={()=>callTestSets(ele3.testsetid,ele3.testset,ele3.testsetpath)} src="static/imgs/ic-taskType-blue-plus.png"/>
                                                                                            <label>{ele3.testset}</label>
                                                                                            { testSets.length ?
                                                                                            testSets.map(suite => ((suite.testsetid === ele3.testsetid) ?
                                                                                                suite.content[0].testcase.map(cases => (
                                                                                                    <div className={"alm_tree_leaves"+(testSuiteSelected_name.indexOf(cases.slice(0,cases.indexOf("/")))!==-1?" selectedCase-backColor":"")} id={cases.substring(cases.indexOf("/")+1)} onClick={(event)=>callTestSuiteSelection(event,cases.substring(cases.indexOf("/")+1),cases.slice(0,cases.indexOf("/")),ele3.testset)}>
                                                                                                        <label title={cases}>
                                                                                                            <span className="leafId">{cases.substring(cases.indexOf("/")+1)}</span>
                                                                                                            <span>{cases.slice(0,cases.indexOf("/"))}</span>
                                                                                                        </label>
                                                                                                        { (testSuiteSelected_name.indexOf(cases.slice(0,cases.indexOf("/")))!==-1) &&
                                                                                                            <> { syncSuccess 
                                                                                                                ? <img onClick={()=>callUnSync()} style={{cursor: "pointer", paddingRight:"10px"}} src="static/imgs/ic-qcUndoSyncronise.png"/>
                                                                                                                : <img onClick={()=>callSyncronise(ele3.testsetpath)} style={{cursor: "pointer", paddingRight:"10px"}} src="static/imgs/ic-qcSyncronise.png"/> }
                                                                                                            </> }
                                                                                                    </div>
                                                                                                )) : null )) : null }
                                                                                        </div> : null
                                                                                      ))  
                                                                                    ))
                                                                                ))
                                                                            }
                                                                        </div>    

                                                                    )) : null
                                                                ))
                                                            ))}
                                                        </div> )) 
                                                    :
                                                    element.TestSet.length &&
                                                    element.TestSet.map(testCase => ( 
                                                        (testCase.testsetpath === e.folderpath) ?
                                                        <div className="alm_tree_branches">
                                                            <img className="alm_tree_toggle" onClick={()=>callTestSets(testCase.testsetid,testCase.testset,testCase.testsetpath)} src="static/imgs/ic-taskType-blue-plus.png"/>
                                                            <label>{testCase.testset}</label>
                                                            { testSets.length ?
                                                            testSets.map(suite => ((suite.testsetid === testCase.testsetid) ?
                                                                suite.content[0].testcase.map(cases => (
                                                                    <div className={"alm_tree_leaves"+(testSuiteSelected_name.indexOf(cases.slice(0,cases.indexOf("/")))!==-1?" selectedCase-backColor":"")} id={cases.substring(cases.indexOf("/")+1)} onClick={(event)=>callTestSuiteSelection(event,cases.substring(cases.indexOf("/")+1),cases.slice(0,cases.indexOf("/")),testCase.testset)}>
                                                                        <label title={cases}>
                                                                            <span className="leafId">{cases.substring(cases.indexOf("/")+1)}</span>
                                                                            <span>{cases.slice(0,cases.indexOf("/"))}</span>
                                                                        </label>
                                                                        { (testSuiteSelected_name.indexOf(cases.slice(0,cases.indexOf("/")))!==-1) &&
                                                                            <> { syncSuccess 
                                                                                ? <img onClick={()=>callUnSync()} style={{cursor: "pointer", paddingRight:"10px"}} src="static/imgs/ic-qcUndoSyncronise.png"/>
                                                                                : <img onClick={()=>callSyncronise(testCase.testsetpath)} style={{cursor: "pointer", paddingRight:"10px"}} src="static/imgs/ic-qcSyncronise.png"/> }
                                                                            </> }
                                                                    </div>
                                                                )) : null )) : null }
                                                        </div> : null 
                                                    )) 
                                                )) 
                                            )) : null }
                                        </div>
                                    )) }                                  
                                </div>
                                </div>
                                </> : null}
                        </ScrollBar>
                    </div>
                </div>
            </div> 
            <div className="alm__tree_container">
                <span className="alm__title_row"><label>Avo Assure Scenarios</label></span>
                <div className="alm__right_tree_container">
                    <div className="alm_tree_selection_box">
                        <select value={projectDropdn2} onChange={(e)=>callScenarios(e)} className="qtestAvoAssureSelectProject">
                            <option value="Select Project"selected disabled >Select Project</option>
                        { projectDetails && 
                            projectDetails.avoassure_projects.map((e,i)=>(
                                <option id={i} value={e.project_name} >{e.project_name}</option>
                            )) }
                        </select>
                        { scenarioArr &&
                        <> { SearchIconClicked && <input onChange={(e)=>onSearch(e)} type="text" placeholder="Scenario Name"/> }
                            <span className="alm__searchIcon" style={{display:"inline" , float:"right"}}> 
                                <img onClick={()=>{setSearchIconClicked(!SearchIconClicked);setFilteredName(null)}} style={{cursor: "pointer" , display:"inline",float:"right"}} src="static/imgs/ic-searchIcon-black.png" />
                            </span>
                        </> }
                    </div>
                
                    <div  className="alm__right_tree" id="alm_right_tree">
                    <ScrollBar scrollId="alm_right_tree" hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                        { scenarioArr && 
                            projectDetails.avoassure_projects.map((e,i)=>(
                                (i == scenario_ID) && (e.scenario_details) &&
                                e.scenario_details.map(e => (
                                    <div 
                                        className={"alm_tree_leaves "+(selectedScenario_ID.indexOf(e._id)!==-1 ? "slectedTestDiv" : null)} 
                                        onClick={(event)=>{selectScenarioMultiple(event, e._id);}}
                                        style={{cursor: "pointer"}}
                                    >
                                    { filteredNames ? filteredNames.map((element)=>(element == e.name && element)):  e.name }
                                    </div>
                                )))) }
                    </ScrollBar>
                    </div>
                </div>
            </div>
        </div>
    </>
    :null)
}
    
export default ALM;