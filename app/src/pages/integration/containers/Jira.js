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
const Jira = () => {
    const history = useHistory();
    const dispatch= useDispatch();
    const user_id = useSelector(state=> state.login.userinfo.user_id);
    const screenType = useSelector(state=>state.integration.screenType); 
    const viewMappedFlies = useSelector(state=>state.integration.mappedScreenType);
    const JiraUrlRef = useRef();
    const input_payloadUrlRef = useRef();
    const JiraUsernameRef = useRef();
    const JiraPasswordRef = useRef();
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

    const callLogin_Jira = async()=>{
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Logging...'});
        const jiraurl = JiraUrlRef.current.value;
        const jirausername =JiraUsernameRef.current.value;
        const jirapwd =JiraPasswordRef.current.value;
        setUser({url: jiraurl,
        username: jirausername,
        password: jirapwd})
        
        // var zephyrPayload = {};
        // zephyrPayload.authtype = currentAuthType;
        // if (zephyrUrlRef.current) zephyrPayload.zephyrURL = zephyrUrlRef.current.value;
        // if(currentAuthType==="basic") {
        //     if(zephyrUsernameRef.current) zephyrPayload.zephyrUserName = zephyrUsernameRef.current.value;
        //     if(zephyrPasswordRef.current) zephyrPayload.zephyrPassword = zephyrPasswordRef.current.value;
        // } else {
        //     if(zephyrAuthTokenRef.current) zephyrPayload.zephyrApiToken = zephyrAuthTokenRef.current.value;
        // }

    // const callLogin_jira = async(currentAuthType)=>{
    //     dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Logging...'});

    //     var zephyrPayload = {};
    //     zephyrPayload.authtype = currentAuthType;
    //     if (zephyrUrlRef.current) zephyrPayload.zephyrURL = zephyrUrlRef.current.value;
    //     if(currentAuthType==="basic") {
    //         if(zephyrUsernameRef.current) zephyrPayload.zephyrUserName = zephyrUsernameRef.current.value;
    //         if(zephyrPasswordRef.current) zephyrPayload.zephyrPassword = zephyrPasswordRef.current.value;
    //     } else {
    //         if(zephyrAuthTokenRef.current) zephyrPayload.zephyrApiToken = zephyrAuthTokenRef.current.value;
    //     }

       const domainDetails =await api.connectJira_ICE(jiraurl,jirausername,jirapwd);

        if (domainDetails.error) setMsg( domainDetails.error);
        else if (domainDetails === "unavailableLocalServer") setLoginError("ICE Engine is not available, Please run the batch file and connect to the Server.");
        else if (domainDetails === "scheduleModeOn") setLoginError("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
        else if (domainDetails === "Invalid Session"){
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            return RedirectPage(history);
        }
        else if (domainDetails === "invalidcredentials") setLoginError("Invalid Credentials");
        // else if (domainDetails === "noprojectfound") setLoginError("Invalid credentials or no project found");
        // else if (domainDetails === "invalidurl") setLoginError("Invalid URL");
        else if (domainDetails === "fail") setLoginError("Fail to Login");
        else if (domainDetails === "notreachable") setLoginError("Host not reachable.");
        //else if (domainDetails === "Error:Failed in running Zephyr") setLoginError("Host not reachable");
        // else if (domainDetails === "Error:Zephyr Operations") setLoginError("Failed during execution");
        else if (domainDetails) {
            setDomainDetails(domainDetails);
            setLoginSuccess(true);
            // dispatch({type: actionTypes.PROJECT_LIST, payload: domainDetails})
        } 
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ""});
    }

    // const calltestcase_Jira = async()=>{
    //     dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Logging...'});
    //     const input_payload = input_payloadUrlRef.current.value;


    //     const testcaseDetails =await api.getJiraTestcases_ICE(input_payload);
    //     console.log(domainDetails)
    //         if (testcaseDetails.error) setMsg( testcaseDetails.error);
    //         else if (testcaseDetails === "unavailableLocalServer") setLoginError("ICE Engine is not available, Please run the batch file and connect to the Server.");
    //         else if (testcaseDetails === "scheduleModeOn") setLoginError("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
    //         else if (testcaseDetails === "Invalid Session"){
    //             dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    //             return RedirectPage(history);
    //         }
    //         else if (testcaseDetails === "invalidcredentials") setLoginError("Invalid Credentials");
    //         // else if (domainDetails === "noprojectfound") setLoginError("Invalid credentials or no project found");
    //         // else if (domainDetails === "invalidurl") setLoginError("Invalid URL");
    //         else if (testcaseDetails === "fail") setLoginError("Fail to Login");
    //         else if (testcaseDetails === "notreachable") setLoginError("Host not reachable.");
    //         //else if (domainDetails === "Error:Failed in running Zephyr") setLoginError("Host not reachable");
    //         // else if (domainDetails === "Error:Zephyr Operations") setLoginError("Failed during execution");
    //         else if (testcaseDetails) {
    //             setDomainDetails(testcaseDetails);
    //             setLoginSuccess(true);
    //             // dispatch({type: actionTypes.PROJECT_LIST, payload: domainDetails})
    //         } 
    //         dispatch({type: actionTypes.SHOW_OVERLAY, payload: ""});
    //     }

    const callViewMappedFiles=async(saveFlag)=>{
        try{
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: saveFlag?'Updating...':'Fetching...'});
        
            const response = await api.viewJiraMappedList_ICE(user_id);
            
            if (response.error){
                setMsg(response.error);
                dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            } 
            else if (response.length){
                dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: "Jira" });
                if (saveFlag) 
                    setMsg(MSG.INTEGRATION.SUCC_SAVE);
                setMappedFilesRes(response);
            }
            else {
                if (saveFlag) {
                    dispatch({type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: null});
                    setMsg(MSG.INTEGRATION.SUCC_SAVE);
                } else {
                    setMsg(MSG.INTEGRATION.WARN_NO_MAPPED_DETAILS);
                }
            }
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});

            return response;
        }
        catch(err) {
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            setMsg(MSG.INTEGRATION.ERR_FETCH_DATA);
        }
    }
console.log(user)
    // const callUpdateMappedFiles=async()=>{
    //     dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: "ZephyrUpdate" });
    // }
    return(
        <>
        {/* {viewMappedFlies === "ZephyrUpdate" &&
            <ZephyrUpdateContent 
                domainDetails={domainDetails}
                setDomainDetails={setDomainDetails}
            />
        } */}
        {viewMappedFlies === "Jira" && 
            <MappedPage
                screenType="Jira"
                leftBoxTitle="Jira Tests"
                rightBoxTitle="Avo Assure Scenarios"
                mappedfilesRes={mappedfilesRes}
                fetchMappedFiles={callViewMappedFiles}
            /> 
        }
        { viewMappedFlies ===null && !loginSuccess && 
            <LoginModal 
                urlRef={JiraUrlRef}
                usernameRef={JiraUsernameRef}
                passwordRef={JiraPasswordRef}
                authtokenRef={JiraAuthTokenRef}
                authType={authType}
                setAuthType={setAuthType}
                screenType={screenType}
                error={loginError}
                setLoginError={setLoginError}
                login={callLogin_Jira}
            /> }
        { viewMappedFlies ===null && screenType=== "Jira" &&
            <JiraContent
                domainDetails={domainDetails}
                user={user}
                callViewMappedFiles={callViewMappedFiles}
                // callUpdateMappedFiles={()=>{}}

            /> }
        </> 
    )
}
export default Jira