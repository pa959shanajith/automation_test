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
import {connectJira_ICE,connectAzure_ICE} from  '../api.js'
import { SET_USERINFO } from '../../login/state/action';
import { setDefaultUserICE } from '../../global/api';
import AzureContent from '../components/AzureContent';
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
    // const azureAuthTokenRef = useRef();
    const [domainDetails , setDomainDetails] = useState(null);
    const [loginSuccess , setLoginSuccess]=useState(false);
    const [loginError , setLoginError]= useState(null);
    const [mappedfilesRes,setMappedFilesRes]=useState([]);
    const [authType, setAuthType]=useState("basic");
    const [user, setUser] = useState([]);
    const azureapiKeys = useSelector(state=>state.integration.azureApikeys);
    

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

    const callLogin_Azure = async()=>{
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Logging...'});
        const azureurl = azureUrlRef.current.value;
        const azureusername =azureUsernameRef.current.value;
        const azurepwd =azurePATRef.current.value;
        setUser({url: azureurl,
        username: azureusername,
        password: azurepwd})
        var apiObj = {   
            "action" : azureapiKeys.login,
             "url": azureurl,
             "username": azureusername,
             "pat": azurepwd,
 
             }    
       const domainDetails =await api.connectAzure_ICE(apiObj);

        if (domainDetails.error) setMsg( domainDetails.error);
        else if (domainDetails === "unavailableLocalServer") setLoginError("ICE Engine is not available, Please run the batch file and connect to the Server.");
        else if (domainDetails === "scheduleModeOn") setLoginError("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
        else if (domainDetails === "Invalid Session"){
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            return RedirectPage(history);
        }
        else if (domainDetails === "invalidcredentials") setLoginError("Invalid Credentials");
        else if (domainDetails === "fail") setLoginError("Fail to Login");
        else if (domainDetails === "notreachable") setLoginError("Host not reachable.");
        else if (domainDetails) {
            setDomainDetails(domainDetails);
            setLoginSuccess(true);
            dispatch({type: actionTypes.PROJECT_LOGIN, payload: { "baseurl": azureurl,"username": azureusername,"pat": azurepwd}});
        } 
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ""});
    }

    const callViewMappedFiles=async(saveFlag)=>{
        try{
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: saveFlag?'Updating...':'Fetching...'});
        
            const response = await api.viewAzureMappedList_ICE(user_id);
            
            if (response.error){
                setMsg(response.error);
                dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            } 
            else if (response.length){
                dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: "Azure" });
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

    // const callLogin_Azure = async()=>{
    //     const api = await api.connectAzure_ICE('https://dev.azure.com/AvoAutomation','sushanth.gupta1','xbgz54ugaxrqs7ljm5mn46aprbg37coxgijg4mx7atze47u2fbeq')
    // }
    
    return(
        <>
        {viewMappedFlies === "Azure" && 
            <MappedPage
                screenType="Azure"
                leftBoxTitle="Azure Tests"
                rightBoxTitle="Avo Assure Scenarios"
                mappedfilesRes={mappedfilesRes}
                fetchMappedFiles={callViewMappedFiles}
            /> 
        }
        { viewMappedFlies ===null && !loginSuccess && 
            <LoginModal 
               urlRef={azureUrlRef}
               usernameRef={azureUsernameRef}
               passwordRef={azurePATRef}
            //    authtokenRef={azureAuthTokenRef}
               authType={authType}
               setAuthType={setAuthType}
               screenType={screenType}
               error={loginError}
               setLoginError={setLoginError}
               login={callLogin_Azure}
            />
              }
              { viewMappedFlies ===null && screenType=== "Azure" &&
              <AzureContent  
                domainDetails={domainDetails}
                user={user}
                callViewMappedFiles={callViewMappedFiles} 
                />  
            } 
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