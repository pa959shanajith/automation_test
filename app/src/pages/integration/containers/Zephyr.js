import React, { useRef, useState, useEffect } from 'react';
import { RedirectPage } from '../../global';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ZephyrContent from '../components/ZephyrContent';
import MappedPage from '../containers/MappedPage';
import LoginModal from '../components/LoginModal';
import {loginToZephyr_ICE,viewZephyrMappedList_ICE} from '../api.js';
import * as actionTypes from '../state/action.js';

const Zephyr = () => {
    const history = useHistory();
    const dispatch= useDispatch();
    const user_id = useSelector(state=> state.login.userinfo.user_id);
    const screenType = useSelector(state=>state.integration.screenType); 
    const viewMappedFlies = useSelector(state=>state.integration.mappedScreenType);
    const zephyrUrlRef = useRef();
    const zephyrUsernameRef = useRef();
    const zephyrPasswordRef = useRef();
    const [domainDetails , setDomainDetails] = useState(null);
    const [loginSuccess , setLoginSuccess]=useState(false);
    const [loginError , setLoginError]= useState(null);
    const [mappedfilesRes,setMappedFilesRes]=useState([]);

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

    const callLogin_zephyr = async()=>{
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Logging...'});

        const zephyrURL = zephyrUrlRef.current.value;
        const zephyrUsername = zephyrUsernameRef.current.value;
        const zephyrPassword = zephyrPasswordRef.current.value;

        const domainDetails = await loginToZephyr_ICE(zephyrURL, zephyrUsername, zephyrPassword);

        if (domainDetails.error) dispatch({ type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: domainDetails.error}});
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
        } 
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ""});
    }

    const callViewMappedFiles=async()=>{
        try{
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        
            const response = await viewZephyrMappedList_ICE(user_id);
            
            if (response.error){
                dispatch({type: actionTypes.SHOW_POPUP, payload: { title: "Error", content: response.error }});
                dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            } 
            else if (response.length){
                dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: "Zephyr" });
                setMappedFilesRes(response);
            }
            else dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Mapped Testcase", content: "No mapped details"}});
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
        }
        catch(err) {
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: "Failed to Fetch Data."}});
        }
    }

    return(
        <>
        {viewMappedFlies === "Zephyr" ? 
            <MappedPage
                screenType="Zephyr"
                leftBoxTitle="Zephyr Tests"
                rightBoxTitle="Avo Assure Scenarios"
                mappedfilesRes={mappedfilesRes}
            /> :
        <>
        { !loginSuccess && 
            <LoginModal 
                urlRef={zephyrUrlRef}
                usernameRef={zephyrUsernameRef}
                passwordRef={zephyrPasswordRef}
                screenType={screenType}
                error={loginError}
                login={callLogin_zephyr}
            /> }
        { screenType=== "Zephyr" &&
            <ZephyrContent
                domainDetails={domainDetails}
                callViewMappedFiles={callViewMappedFiles}
            /> }
        </>
        }
        </> 
    )
}

export default Zephyr;