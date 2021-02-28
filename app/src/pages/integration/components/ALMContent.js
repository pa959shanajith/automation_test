import React,{Fragment, useState } from 'react';
import {ScrollBar} from '../../global';
import {loginQCServer_ICE,qcProjectDetails_ICE,qcFolderDetails_ICE,saveQcDetails_ICE,viewQcMappedList_ICE} from '../api.js';
import { useSelector } from 'react-redux';
import MappingPage from '../containers/MappingPage';
import '../styles/ALM.scss';
import "../styles/TestList.scss"

const ALMContent = props => {
    const user_id = useSelector(state=> state.login.userinfo.user_id);
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
                <select value={projectDropdn1} onChange={(e)=>callProjectDetails_ICE(e)} style={{marginRight : "5px"}}>
                    <option value="Select Project" selected disabled >Select Domain</option>
                    { props.domainDetails && 
                        props.domainDetails.domain.map((e, i) => (
                            <option id={e.id} key={i} value={e.name}>{e}</option>
                        )) }
                </select>
            }
            selectTestRelease = {
                <select value={releaseDropdn} onChange={(e)=>callFolderDetails_ICE(e)}>
                    <option value="Select Release" selected disabled >Select Release</option>
                    { projectDetails &&
                        projectDetails.qc_projects.map((e, i) => (
                            <option key={i} value={e}>{e}</option>
                        )) }
                </select>
            }
            selectScenarioProject = {
                <select value={projectDropdn2} onChange={(e)=>callScenarios(e)}>
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
                        <img onClick={()=>{setSearchIconClicked(!SearchIconClicked);setFilteredName(null)}} style={{cursor: "pointer" , display:"inline",float:"right"}} src="static/imgs/ic-searchIcon-black.png" />
                    </span> </> 
            }
            testList = {folderDetails.length ?
                <>    
                <div className="test__rootDiv">
                    <img className="test_tree_toggle" src="static/imgs/ic-qcCollapse.png"/>
                    <label>Root</label>
                <div className="test_tree_branches">
                    { folderDetails[0].testfolder.map((e,i)=>(
                        <div>
                            <img className="test_tree_toggle" id={i} onClick={()=>calltestSuites(e.folderpath,i)} src= "static/imgs/ic-qcExpand.png"/>
                            <label>{e.foldername}</label>
                            { testSuiteDetails.length ?
                            testSuiteDetails.map(ele=>(
                                ele.map(element => (
                                element.testfolder.length ?
                                    element.testfolder.map( test => ( 
                                            (test.folderpath === e.folderpath.concat('\\', test.foldername)) &&
                                        <div className="test_tree_branches">
                                            <img className="test_tree_toggle" src="static/imgs/ic-qcExpand.png"/>
                                            <label>{test.foldername}</label>
                                        </div> )) 
                                    :
                                    element.TestSet.length &&
                                    element.TestSet.map(testCase => ( 
                                        (testCase.testsetpath === e.folderpath) ?
                                        <div className="test_tree_branches">
                                            <img className="test_tree_toggle" onClick={()=>callTestSets(testCase.testsetid,testCase.testset,testCase.testsetpath)} src="static/imgs/ic-taskType-blue-plus.png"/>
                                            <label>{testCase.testset}</label>
                                            { testSets.length ?
                                            testSets.map(suite => ((suite.testsetid === testCase.testsetid) ?
                                                suite.content[0].testcase.map(cases => (
                                                    <div className={"test_tree_leaves"+(testSuiteSelected_name.indexOf(cases.slice(0,cases.indexOf("/")))!==-1?" selectedCase-backColor":"")} id={cases.substring(cases.indexOf("/")+1)} onClick={(event)=>callTestSuiteSelection(event,cases.substring(cases.indexOf("/")+1),cases.slice(0,cases.indexOf("/")),testCase.testset)}>
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
                </> : null
            }
            scenarioList = { scenarioArr && 
                projectDetails.avoassure_projects.map((e,i)=>(
                    (i == scenario_ID) && (e.scenario_details) &&
                    e.scenario_details.map(e => (
                        <div 
                            className={"test_tree_leaves "+(selectedScenario_ID.indexOf(e._id)!==-1 ? "slectedTestDiv" : null)} 
                            onClick={(event)=>{selectScenarioMultiple(event, e._id);}}
                            style={{cursor: "pointer"}}
                        >
                            { filteredNames ? filteredNames.map((element)=>(element == e.name && element)) :  e.name }
                        </div> )))) 
            }
        />
    ); 
}
    
export default ALMContent;