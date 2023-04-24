import React, { useRef, useState, useEffect, Fragment } from 'react';
import { RedirectPage, Messages as MSG, setMsg } from '../../global';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import JiraContent from '../components/JiraContent';
import MappedPage from '../containers/MappedPage';
import LoginModal from '../components/LoginModal';
// import ZephyrUpdateContent from '../components/ZephyrUpdateContent';
import * as api from '../api.js';
import * as actionTypes from '../state/action.js';
import {connectJira_ICE} from  '../api.js'
import { SET_USERINFO } from '../../login/state/action';
import { setDefaultUserICE } from '../../global/api';
// 0 vvimport "../styles/TestList.scss"
const Azure = () => {
    const history = useHistory();
    const dispatch= useDispatch();
    const user_id = useSelector(state=> state.login.userinfo.user_id);
    const screenType = useSelector(state=>state.integration.screenType); 
    const viewMappedFlies = useSelector(state=>state.integration.mappedScreenType);
    const JiraUrlRef = useRef();
    const azureUrlRef=useRef();
    const input_payloadUrlRef = useRef();
    const UsernameRef = useRef();
    // const AzurePATRef = useRef();
    const azureUsernameRef=useRef();
    const  azurePATRef=useRef();

    const JiraAuthTokenRef = useRef();
    const [domainDetails , setDomainDetails] = useState(null);
    const [loginSuccess , setLoginSuccess]=useState(false);
    const [loginError , setLoginError]= useState(null);
    const [mappedfilesRes,setMappedFilesRes]=useState([]);
    const [authType, setAuthType]=useState("basic");
    const [user, setUser] = useState([]);
    

    useEffect(() => {
        return ()=>{
            dispatch({type: actionTypes.MAPPED_PAIR, payload: []});
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
    }, [])

    // const callLogin_Jira = async()=>{
    //     dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Logging...'});
    //     const jiraurl = JiraUrlRef.current.value;
    //     const jirausername =JiraUsernameRef.current.value;
    //     const jirapwd =JiraPasswordRef.current.value;
    //     setUser({url: jiraurl,
    //     username: jirausername,
    //     password: jirapwd})

    //    const domainDetails =await api.connectJira_ICE(jiraurl,jirausername,jirapwd);

    //     if (domainDetails.error) setMsg( domainDetails.error);
    //     else if (domainDetails === "unavailableLocalServer") setLoginError("ICE Engine is not available, Please run the batch file and connect to the Server.");
    //     else if (domainDetails === "scheduleModeOn") setLoginError("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
    //     else if (domainDetails === "Invalid Session"){
    //         dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    //         return RedirectPage(history);
    //     }
    //     else if (domainDetails === "invalidcredentials") setLoginError("Invalid Credentials");
    //     else if (domainDetails === "fail") setLoginError("Fail to Login");
    //     else if (domainDetails === "notreachable") setLoginError("Host not reachable.");
    //     else if (domainDetails) {
    //         setDomainDetails(domainDetails);
    //         setLoginSuccess(true);
    //     } 
    //     dispatch({type: actionTypes.SHOW_OVERLAY, payload: ""});
    // }

    // const callViewMappedFiles=async(saveFlag)=>{
    //     try{
    //         dispatch({type: actionTypes.SHOW_OVERLAY, payload: saveFlag?'Updating...':'Fetching...'});
        
    //         const response = await api.viewJiraMappedList_ICE(user_id);
            
    //         if (response.error){
    //             setMsg(response.error);
    //             dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    //         } 
    //         else if (response.length){
    //             dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: "Jira" });
    //             if (saveFlag) 
    //                 setMsg(MSG.INTEGRATION.SUCC_SAVE);
    //             setMappedFilesRes(response);
    //         }
    //         else {
    //             if (saveFlag) {
    //                 dispatch({type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: null});
    //                 setMsg(MSG.INTEGRATION.SUCC_SAVE);
    //             } else {
    //                 setMsg(MSG.INTEGRATION.WARN_NO_MAPPED_DETAILS);
    //             }
    //         }
    //         dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});

    //         return response;
    //     }
    //     catch(err) {
    //         dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    //         setMsg(MSG.INTEGRATION.ERR_FETCH_DATA);
    //     }
    // }
    return(
        <>
        {/* {viewMappedFlies === "Jira" && 
            <MappedPage
                screenType="Jira"
                leftBoxTitle="Jira Tests"
                rightBoxTitle="Avo Assure Scenarios"
                mappedfilesRes={mappedfilesRes}
                fetchMappedFiles={callViewMappedFiles}
            /> 
        } */}
        {/* { viewMappedFlies ===null && !loginSuccess &&  */}
            <LoginModal 
                // urlRef={JiraUrlRef}
                // usernameRef={JiraUsernameRef}
                // passwordRef={JiraPasswordRef}
                azureUrlRef={azureUrlRef}
                azureUsernameRef={azureUsernameRef}
                azurePATRef={azurePATRef}
                screenType={screenType}
                error={loginError}
                setLoginError={setLoginError}
                // azurePAT={"NIVI"}
                // login={callLogin_Jira}
            />
             {/* } */}
        {/* { viewMappedFlies ===null && screenType=== "Jira" &&
            <JiraContent
                domainDetails={domainDetails}
                user={user}
                callViewMappedFiles={callViewMappedFiles}

            /> } */}
        </> 
    )
}
export default Azure;