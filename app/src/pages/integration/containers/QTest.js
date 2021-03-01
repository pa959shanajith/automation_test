import React ,{useState , Fragment , useRef} from 'react';
import {ModalContainer,  PopupMsg, ScreenOverlay} from '../../global';
import { useSelector, useDispatch } from 'react-redux';
import { loginToQTest_ICE, qtestProjectDetails_ICE, qtestFolderDetails_ICE, saveQtestDetails_ICE, viewQtestMappedList_ICE } from '../api.js';
import LoginQTest from "../components/LoginQTest";
import MappedPage from '../containers/MappedPage';
import QTestContent from '../components/QTestContent.js';
import * as actionTypes from '../state/action.js';

const  QTest = props => {
    const dispatch =useDispatch()
    const [loginSucess , setLoginSucess] = useState(false);
    const screenType = useSelector(state=>state.integration.screenType);
    const viewMappedFiles = useSelector(state=>state.integration.mappedScreenType);
    const urlRef = useRef();
    const userNameRef = useRef();
    const passwordRef = useRef();
    const selProjectRef = useRef();
    const [domainDetails , setDomainDetails] = useState([]);
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
    const [logerror, setLogError]= useState(null);
    const [mappedFilesICERes , setMappedFIlesICERes]= useState([]);
    
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
            setFailMsg("Please Enter URL");
            setLogError("URL")
        }
        else if(!(userNameRef.current.value)){
            setFailMsg("Please Enter Username ")
            setLogError("UNAME")

        }
        else if(!(passwordRef.current.value)){
            setFailMsg("Please Enter Password ")
            setLogError("PASS")

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
            else if (domainDetails === "invalidcredentials"){
                setFailMsg("Invalid Credentials , Retry Login")
            }
            else{
            setDomainDetails(domainDetails);
            setLoginSucess(true);
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
        const projectDetails = await qtestProjectDetails_ICE(domainid , userid )
        if(projectDetails.error){displayError(projectDetails.error);return;}
        setProjectDetails(projectDetails)
        setFolderDetails(null);
        setBlockui({show:false});
        setReleaseDropdn("Select Release")
        setProjectDropdn1(domainid);
    }
    const callFolderDetails_ICE = async(e)=>{
        setBlockui({show:true,content:'Loading TestCases...'})
        const projectName = e.target.value;
        const project_ID = (e.target.childNodes[e.target.selectedIndex]).getAttribute("id")
        const domain_ID = domainID
        const folderDetails = await qtestFolderDetails_ICE(project_ID,"root",domain_ID,"folder",)
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
        //props.setViewMappedFiles(false);
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
    const callViewMappedFiles=async()=>{
        setBlockui({show:true,content:'Loading...'})
        const mappedResponse = await viewQtestMappedList_ICE(user_id)
        if(mappedResponse.length == 0){
            setPopup({
                title:'Mapped Testcase',
                content:"No mapped details",
                submitText:'Ok',
                show:true
            })
            setBlockui({show:false})
        }
        else{
            //props.setViewMappedFiles(true);
            dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: "qTest" });
            dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });
            setMappedFIlesICERes(mappedResponse);
            setBlockui({show:false})

    }
    }
    const callExit=()=>{
        setFolderDetails(null);
        setScenarioArr(null);
        setLoginSucess(false);
        //props.setPopUpEnable(false);
        dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });
        setFailMsg(null);
        setReleaseDropdn("Select Release");
        setDisableSave(true);
        setProjectDropdn1("Select Project");
        setProjectDropdn2("Select Project");
        setMappedDetails([]);
        setSelectedScenario_ID(null);
        setSelectedTestSuiteID(null);
    }
    const callUnSync=()=>{
        setSyncSuccess(false);
        setMappedDetails([]);
        setDisableSave(true)

    }
    const content =()=>{
        return(
            <LoginQTest
                urlRef={urlRef}
                userNameRef={userNameRef}
                passwordRef={passwordRef}
                failMSg={failMSg}
                callLogin_ICE={callLogin_ICE}
                logerror={logerror}
            />
        )
    }
    const footer=()=>{
        return(
            <div className="submit_row">
            <span>
                    {failMSg}
            </span>
            <span>
                <button onClick={()=>callLogin_ICE() }>Submit</button>
            </span>
            </div>
        )
    }
    return (<Fragment>
        {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
        {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
        {viewMappedFiles =="qTest" ? 
            <MappedPage
                leftBoxTitle="qTest Tests"
                rightBoxTitle="Avo Assure Scenarios"
                mappedfilesRes={mappedFilesICERes}
            /> : 
        <>
        {/* <div className="middle_holder"> */}
                {
                    screenType =="qTest" ?
                    <QTestContent
                        disableSave={disableSave}
                        callSaveButton={callSaveButton}
                        callViewMappedFiles={callViewMappedFiles}
                        callExit={callExit}
                        projectDropdn1={projectDropdn1}
                        selProjectRef={selProjectRef}
                        callProjectDetails_ICE={callProjectDetails_ICE}
                        domainDetails={domainDetails}
                        releaseDropdn={releaseDropdn}
                        callFolderDetails_ICE={callFolderDetails_ICE}
                        projectDetails={projectDetails}
                        folderDetails={folderDetails}
                        callCycleExpand={callCycleExpand}
                        callTestSuiteExpand={callTestSuiteExpand}
                        callTestSuiteSelection={callTestSuiteSelection}
                        selectedTestSuiteID={selectedTestSuiteID}
                        syncSuccess={syncSuccess}
                        callUnSync={callUnSync}
                        callSyncronise={callSyncronise}
                        projectDropdn2={projectDropdn2}
                        callScenarios={callScenarios}
                        scenarioArr={scenarioArr}
                        selectedScenario_ID={selectedScenario_ID}
                        setSelectedScenario_ID={setSelectedScenario_ID}
                        SearchIconClicked={SearchIconClicked}
                        onSearch={onSearch}
                        setSearchIconClicked={setSearchIconClicked}
                        setFilteredName={setFilteredName}
                        setSelectedScenarioName={setSelectedScenarioName}
                        filteredNames={filteredNames}
                        scenario_ID={scenario_ID}
                        
                    />  
                    : null   
                    }
                    {
                    (!loginSucess)? 
                    <Fragment>
                        <ModalContainer 
                            title="qTest Login"
                            close={()=>{dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });setFailMsg(null);setLogError(null)}}
                            content={content()}
                            footer={footer()}/>
                        
                    </Fragment>
                    : null
                }
                {}
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
                {/* {props.almClicked?
                    <ALM/>
                : null
                } */}
            </>
        // </div>
        }
        </Fragment>
    
    )
}

export default QTest;


