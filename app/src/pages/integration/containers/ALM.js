import React, {useRef, useEffect, useState } from 'react';
import { RedirectPage} from '../../global';
import { useHistory } from 'react-router-dom';
import * as actionTypes from '../state/action.js';
import ALMContent from '../components/ALMContent.js';
import LoginModal from '../components/LoginModal';
import {viewQcMappedList_ICE,loginQCServer_ICE} from '../api.js';
import MappedPage from '../containers/MappedPage';
import { useSelector ,useDispatch} from 'react-redux';


const ALM = props => {
    const history = useHistory();
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const screenType = useSelector(state=>state.integration.screenType);
    const viewMappedFiles = useSelector(state=>state.integration.mappedScreenType);
    const dispatch = useDispatch();
    const urlRef = useRef();
    const usernameRef = useRef();
    const passwordRef = useRef();
    const [domainDetails , setDomainDetails] = useState(null);
    const [loginSuccess , setLoginSuccess]=useState(false);
    const [loginError , setLoginError]= useState(null);
    const [mappedfilesRes,setMappedFilesRes]=useState([]);

    useEffect(()=>{
        dispatch({type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: null});
        setMappedFilesRes([]);

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
       // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    

    const callLogin_ALM = async()=>{
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Logging...'});
        const qcPassword = passwordRef.current.value;
        const qcURL = urlRef.current.value;
        const qcUsername = usernameRef.current.value;
        const domainDetails = await loginQCServer_ICE(qcPassword ,qcURL ,qcUsername);

        if (domainDetails.error) dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: domainDetails.error} });
        else if (domainDetails === "unavailableLocalServer") setLoginError("ICE Engine is not available,Please run the batch file and connect to the Server.");
        else if (domainDetails === "scheduleModeOn") setLoginError("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
        else if (domainDetails === "Invalid Session"){
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            return RedirectPage(history);
        }
        else if (domainDetails === "invalidcredentials") setLoginError("Invalid Credentials");
        else if (domainDetails === "invalidurl") setLoginError("Invalid URL");
        else if (domainDetails === "fail") setLoginError("Fail to Login");
        else if (domainDetails === "Error:Failed in running Qc") setLoginError("Unable to run Qc");
        else if (domainDetails === "Error:Qc Operations") setLoginError("Failed during execution");
        else{
            setDomainDetails(domainDetails);
            setLoginSuccess(true);
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }
    const callViewMappedFiles = async()=>{
        try{
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Fetching...'});
            //props.setViewMappedFiles(true)
            const userid = user_id;
            const response = await viewQcMappedList_ICE(userid);
            if (response.error){
                dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: response.error}});
            } 
            else if (response.length){
                dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: "ALM" });
                setMappedFilesRes(response);
            }
            else dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Mapped Testcase", content: "No mapped details"}});
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});

            return response;
        }
        catch(err) {
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: "Failed to Fetch Data."}});
        }
    }
    const callExitcenter=()=>{
        dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });;
    }
    return(
        <>
        { viewMappedFiles === "ALM" ?
            <MappedPage 
                screenType="ALM"
                leftBoxTitle="ALM Testcases"
                rightBoxTitle="Avo Assure Scenarios"
                mappedfilesRes={mappedfilesRes}
                fetchMappedFiles={callViewMappedFiles}
            /> :
        <>
        { !loginSuccess &&
            <LoginModal 
                urlRef={urlRef}
                usernameRef={usernameRef}
                passwordRef={passwordRef}
                login={callLogin_ALM}
                error={loginError}
                screenType={screenType}
            />
        }
        { screenType === "ALM" &&
            <ALMContent
                domainDetails={domainDetails}
                callViewMappedFiles={callViewMappedFiles}
                callExitcenter={callExitcenter}
            /> }
        </>}
        </> 
    )
}

export default ALM;