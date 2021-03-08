import React , {useRef, useState} from 'react';
import { PopupMsg, ScreenOverlay, RedirectPage } from '../../global';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ZephyrContent from '../components/ZephyrContent';
import MappedPage from '../containers/MappedPage';
import LoginModal from '../components/LoginModal';
import {loginToZephyr_ICE,viewZephyrMappedList_ICE} from '../api.js';
import * as actionTypes from '../state/action.js';

const Zephyr = props => {
    const history = useHistory();
    const dispatch= useDispatch();
    const user_id = useSelector(state=> state.login.userinfo.user_id);
    const screenType = useSelector(state=>state.integration.screenType); 
    const viewMappedFlies = useSelector(state=>state.integration.mappedScreenType);
    const zephyrUrlRef = useRef();
    const zephyrUsernameRef = useRef();
    const zephyrPasswordRef = useRef();
    const [blockui,setBlockui] = useState({show:false});
    const [popup ,setPopup]= useState({show:false});
    const [domainDetails , setDomainDetails] = useState(null);
    const [loginSuccess , setLoginSuccess]=useState(false);
    const [loginError , setLoginError]= useState(null);
    const [mappedfilesRes,setMappedFilesRes]=useState([]);

    const displayError = (title,error) =>{
        setPopup({
        title:title?title:'ERROR',
        content:error,
        submitText:'Ok',
        show:true
        })
    }
    const callLogin_zephyr = async()=>{
        setBlockui({show:true,content:'Logging...'})

        const zephyrURL = zephyrUrlRef.current.value;
        const zephyrUsername = zephyrUsernameRef.current.value;
        const zephyrPassword = zephyrPasswordRef.current.value;

        const domainDetails = await loginToZephyr_ICE(zephyrURL, zephyrUsername, zephyrPassword);
        if (domainDetails.error) displayError(domainDetails.error);
        if (domainDetails === "unavailableLocalServer") setLoginError("ICE Engine is not available, Please run the batch file and connect to the Server.");
        else if (domainDetails === "scheduleModeOn") setLoginError("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
        else if (domainDetails === "Invalid Session") return RedirectPage(history);
        else if (domainDetails === "invalidcredentials") setLoginError("Invalid Credentials");
        else if (domainDetails === "noprojectfound") setLoginError("Invalid credentials or no project found");
        else if (domainDetails === "invalidurl") setLoginError("Invalid URL");
        else if (domainDetails === "fail") setLoginError("Fail to Login");
        else if (domainDetails === "Error:Failed in running Zephyr") setLoginError("Unable to run Zephyr");
        else if (domainDetails === "Error:Zephyr Operations") setLoginError("Failed during execution");
        else {
            setDomainDetails(domainDetails);
            setLoginSuccess(true);
        }
        setBlockui({show:false})
    }
    const callViewMappedFiles=async()=>{
        setBlockui({show:true,content:'Loading...'})
        dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: "Zephyr" });
        const userid = user_id;
        const response = await viewZephyrMappedList_ICE(userid);
        if(response.error){props.displayError(response.error);props.setBlockui({show:false});return;}
        setMappedFilesRes(response);
        setBlockui({show:false})
    }

    return(
        <>
        {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
        {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
        {viewMappedFlies === "Zephyr" ? 
            <MappedPage
                screenType="Zephyr"
                leftBoxTitle="Zephyr Tests"
                rightBoxTitle="Avo Assure Scenarios"
                mappedfilesRes={mappedfilesRes}/> :
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
                setBlockui={setBlockui}
                displayError={displayError}
                setPopup={setPopup}
                callViewMappedFiles={callViewMappedFiles}
            /> }
        </>
        }
        </> 
    )
}

export default Zephyr;