import React ,{useState, useRef} from 'react';
import { RedirectPage } from '../../global';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { loginToQTest_ICE, qtestProjectDetails_ICE, qtestFolderDetails_ICE, saveQtestDetails_ICE, viewQtestMappedList_ICE } from '../api.js';
import LoginModal from '../components/LoginModal';
import MappedPage from '../containers/MappedPage';
import QTestContent from '../components/QTestContent.js';
import * as actionTypes from '../state/action.js';

const  QTest = props => {

    const history = useHistory();
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const dispatch =useDispatch()
    const [loginSuccess , setLoginSuccess] = useState(false);
    const screenType = useSelector(state=>state.integration.screenType);
    const viewMappedFiles = useSelector(state=>state.integration.mappedScreenType);
    const urlRef = useRef();
    const usernameRef = useRef();
    const passwordRef = useRef();
    const selProjectRef = useRef();
    const [domainDetails , setDomainDetails] = useState([]);
    const [selectedProjectName,setSelectedProjectName]=useState('')
    const [projectDetails , setProjectDetails] = useState(null);
    const [folderDetails , setFolderDetails ] = useState(null);
    const [domainID , setDomainID]= useState(null);
    const [testSuiteSelected_name , setTestSuiteSelected_name] = useState(null);
    const [selectedScenario_ID , setSelectedScenario_ID]= useState(null);
    const [selectedTestSuiteID , setSelectedTestSuiteID] = useState(null);
    const [scenarioArr , setScenarioArr] = useState(false);
    const [scenario_ID , setScenario_ID] = useState(null) ;
    const [projectDropdn1 , setProjectDropdn1]= useState(null);
    const [projectDropdn2 , setProjectDropdn2]= useState(null);
    const [releaseDropdn, setReleaseDropdn]=useState(null);
    const [mappedDetails ,setMappedDetails]= useState([]);
    const [SearchIconClicked , setSearchIconClicked] =useState(false);
    const [syncSuccess , setSyncSuccess]= useState(false);
    const [filteredNames , setFilteredName]= useState(null);
    const [disableSave , setDisableSave]=useState(true);
    const [loginError, setLoginError]= useState(null);
    const [mappedFilesICERes , setMappedFIlesICERes]= useState([]);

    const callLogin_ICE = async()=>{ // Checks all the fileds pf Login PopUp as well set states for errors and API call for login
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Logging...'});
        const qcPassword = passwordRef.current.value;
        const qcURL = urlRef.current.value;
        const qcUsername = usernameRef.current.value;
        const domainDetails = await loginToQTest_ICE(qcPassword, qcURL, qcUsername);
        
        if(domainDetails.error) dispatch({type: actionTypes.SHOW_POPUP, payload:{title: "Error", content: domainDetails.error}});
        else if(domainDetails === "unavailableLocalServer") setLoginError("ICE Engine is not available, Please run the batch file and connect to the Server.");
        else if (domainDetails === "invalidcredentials") setLoginError("Invalid Credentials , Retry Login")
        else if (domainDetails === "scheduleModeOn") setLoginError("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
        else if (domainDetails === "Invalid Session") return RedirectPage(history);
        else if(domainDetails === "invalidcredentials") setLoginError("Invalid Credentials");
        else if (domainDetails === "invalidurl") setLoginError("Invalid URL");
        else if (domainDetails === "fail") setLoginError("Fail to Login");
        else if (domainDetails === "Error:Failed in running Qc") setLoginError("Unable to run Qc");
        else if(domainDetails === "Error:Qc Operations") setLoginError("Failed during execution");
        else{
            setDomainDetails(domainDetails);
            setLoginSuccess(true);
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }
    const callProjectDetails_ICE=async(e)=>{ // API call for the list of Projects of qTest and stores respone in array(state)
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        const domainid = (e.target.childNodes[e.target.selectedIndex]).getAttribute("value")
        const domainName = (e.target.childNodes[e.target.selectedIndex]).getAttribute("id")
        setDomainID(domainid);
        const projectDetails = await qtestProjectDetails_ICE(domainid , user_id )
        if (projectDetails.error){
            dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: projectDetails.error}});
        } else {
            setProjectDetails(projectDetails)
            setFolderDetails(null);
            setReleaseDropdn("Select Release")
            setProjectDropdn1(domainid);
            setSelectedProjectName(domainName)
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }
    const callFolderDetails_ICE = async(e)=>{ // API call for list of Testcases for each Project and Release Type 
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading TestCases...'});
        const projectName = e.target.value;
        const project_ID = (e.target.childNodes[e.target.selectedIndex]).getAttribute("id")
        const domain_ID = domainID
        const folderDetails = await qtestFolderDetails_ICE(project_ID,"root",domain_ID,"folder",)
        if (folderDetails.error){
            dispatch({type: actionTypes.SHOW_POPUP, payload: {title:"Error", content: folderDetails.error}});
        } else {            
            setFolderDetails(folderDetails);
            setReleaseDropdn(projectName);
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }
    const callCycleExpand =(idx)=>{//sets the state for logo of expand collapse for cycles 
        var expandarr =[...folderDetails];
        expandarr.map((e,i)=>(
            i=== idx.i ? (e['cycleOpen'] === true)? e['cycleOpen'] = false : e['cycleOpen'] = true : null
        ))
        setFolderDetails(expandarr);
        
    }
    const callTestSuiteExpand =(idx)=>{//sets the state for logo of expand collapse testSuites
        var expandarr=[...folderDetails];
        expandarr.map((e,i)=>(
            i=== idx.i ? 
            e['TestsuiteOpen'] === true ? e['TestsuiteOpen'] = false : e['TestsuiteOpen'] = true : null
        ))
        setFolderDetails(expandarr);
    }
    const callTestSuiteSelection=(event ,idx , name)=>{//sets the selectedtestSuite (id and Name) 
        setSelectedTestSuiteID(idx)
        setTestSuiteSelected_name(name);
        
        if(event.target.childNodes.length){
            if(mappedDetails.length){
                if(mappedDetails[0].testsuiteid === idx){
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
    const callScenarios =(e)=>{//sets the selected Scenario
        const scenarioID = (e.target.childNodes[e.target.selectedIndex]).getAttribute("id");
        const project_Name= e.target.value
        setScenarioArr(true);
        setScenario_ID(scenarioID);
        setFilteredName(null);
        setProjectDropdn2(project_Name)
        setSearchIconClicked(false);
        setSelectedScenario_ID(null);
    }
    const callSyncronise =()=>{//sync function when clicked on sync icon-- checks if scenario is selected and sets record for mapped details later sent to saving API call 
        const project_id = parseInt(projectDropdn1);
        const Project_Name = selectedProjectName;
        
        if(!selectedScenario_ID){
            let popupMsg = {
                title:'Save Mapped Testcase ',
                content:"Please Select a Scenario"
            };
            dispatch({type: actionTypes.SHOW_POPUP, payload: popupMsg});
        }
        else {
            const mapped_Details=[
                {
                    project: Project_Name,
                    projectid: project_id,
                    scenarioId: selectedScenario_ID,
                    testsuite: testSuiteSelected_name,
                    testsuiteid: selectedTestSuiteID  
                }
            ]
            setMappedDetails(mapped_Details);
            setDisableSave(false)
            setSyncSuccess(true);
        }
    }
    const callSaveButton =async()=>{ //API call for 
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Saving...'});
        const response = await saveQtestDetails_ICE(mappedDetails);
        if (response.error){
            dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: response.error}});
        }
        else if ( response === "success"){
            dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Saved Mapped Testcases", content: "Saved Successfully."}});
            setSyncSuccess(false);
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }
    const onSearch=(e)=>{
        var val = e.target.value;
        var filter = []; 
        if(scenarioArr){
            projectDetails.avoassure_projects[parseInt(scenario_ID)].scenario_details
                .forEach((e,i)=>{
                    if (e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
                        filter.push(e);
                })
            }
        setFilteredName(filter)
    }
    const callViewMappedFiles=async()=>{
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        const mappedResponse = await viewQtestMappedList_ICE(user_id)
        if(mappedResponse.length === 0){
            let popupMsg = {
                title:'Mapped Testcase',
                content:"No mapped details"
            };
            dispatch({type: actionTypes.SHOW_POPUP, payload: popupMsg});
        }
        else{
            dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: "qTest" });
            setMappedFIlesICERes(mappedResponse);
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }
    const callExit=()=>{
        setFolderDetails(null);
        setScenarioArr(null);
        setLoginSuccess(false);
        dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });
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

    return (<>
        {viewMappedFiles === "qTest" ? 
            <MappedPage
                screenType="qTest"
                leftBoxTitle="qTest Tests"
                rightBoxTitle="Avo Assure Scenarios"
                mappedfilesRes={mappedFilesICERes}
            /> : 
        <>
        { !loginSuccess &&
            <LoginModal 
                urlRef={urlRef}
                usernameRef={usernameRef}
                passwordRef={passwordRef}
                error={loginError}
                screenType={screenType}
                login={callLogin_ICE}
            />
        }
        { screenType === "qTest" &&
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
                filteredNames={filteredNames}
                scenario_ID={scenario_ID}
                
            />   
        }
        </>
        }
        </>
    
    )
}

export default QTest;


