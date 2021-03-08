import React, {useRef, useEffect, useState } from 'react';
import { PopupMsg, ScreenOverlay, RedirectPage} from '../../global';
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
    const [blockui,setBlockui] = useState({show:false});
    const [popup ,setPopup]= useState({show:false});
    const [failMSg , setFailMsg] = useState(null);
    const [domainDetails , setDomainDetails] = useState(null);
    const [loginSuccess , setLoginSuccess]=useState(false);
    const [loginError , setLoginError]= useState(null);
    const [mappedfilesRes,setMappedFilesRes]=useState([]);

    useEffect(()=>{
        dispatch({type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: null});
        setMappedFilesRes([]);
       // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const displayError = (title,error) =>{
        setPopup({
        title:title?title:'ERROR',
        content:error,
        submitText:'Ok',
        show:true
        })
    }
    const callLogin_ALM = async()=>{
        setBlockui({show:true,content:'Logging...'})
        const qcPassword = passwordRef.current.value;
        const qcURL = urlRef.current.value;
        const qcUsername = usernameRef.current.value;
        const domainDetails = await loginQCServer_ICE(qcPassword ,qcURL ,qcUsername);

        if (domainDetails.error) displayError(domainDetails.error)
        if (domainDetails === "unavailableLocalServer") setLoginError("ICE Engine is not available,Please run the batch file and connect to the Server.");
        else if (domainDetails === "scheduleModeOn") setLoginError("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
        else if (domainDetails === "Invalid Session") return RedirectPage(history);
        else if (domainDetails === "invalidcredentials") setLoginError("Invalid Credentials");
        else if (domainDetails === "invalidurl") setLoginError("Invalid URL");
        else if (domainDetails === "fail") setLoginError("Fail to Login");
        else if (domainDetails === "Error:Failed in running Qc") setLoginError("Unable to run Qc");
        else if (domainDetails === "Error:Qc Operations") setLoginError("Failed during execution");
        else{
            setDomainDetails(domainDetails);
            setLoginSuccess(true);
        }
        setBlockui({show:false})
    }
    const callViewMappedFiles = async()=>{
        setBlockui({show:true,content:'Fetching...'})
        //props.setViewMappedFiles(true)
        dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: "ALM" });
        const userid = user_id;
        const response = await viewQcMappedList_ICE(userid);
        if(response.error){props.displayError(response.error);props.setBlockui({show:false});return;}
        setMappedFilesRes(response);
        setBlockui({show:false})
    }
    const callExitcenter=()=>{
        dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });;
        //props.setAlmClicked(false)
    }

    return(
        
        <>
        {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
        {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
        { viewMappedFiles === "ALM" ?
            <MappedPage 
                screenType="ALM"
                leftBoxTitle="Avo Assure Scenarios"
                rightBoxTitle="ALM Testcases"
                mappedfilesRes={mappedfilesRes}
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
                setBlockui={setBlockui}
                displayError={displayError}
                setPopup={setPopup}
                callViewMappedFiles={callViewMappedFiles}
                callExitcenter={callExitcenter}
            /> }
        </>}
        </> 
    )
}

export default ALM;