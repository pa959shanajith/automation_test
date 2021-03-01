import React , {useRef , Fragment ,useState} from 'react';
import {ModalContainer , PopupMsg ,ScreenOverlay} from '../../global';
import { useDispatch, useSelector } from 'react-redux';
import ZephyrContent from '../components/ZephyrContent';
import MappedPage from '../containers/MappedPage';
import LoginZypher from '../components/LoginZephyr';
import {loginToZephyr_ICE,viewZephyrMappedList_ICE} from '../api.js';
import * as actionTypes from '../state/action.js';

const Zephyr = props => {
    const dispatch= useDispatch();
    const user_id = useSelector(state=> state.login.userinfo.user_id);
    const screenType = useSelector(state=>state.integration.screenType); 
    const viewMappedFlies = useSelector(state=>state.integration.mappedScreenType);
    const accountidRef = useRef();
    const accessKeyRef = useRef();
    const secretKeyRef = useRef();
    const jiraUrlRef= useRef();
    const jiraUserNameRef = useRef();
    const jiraAcessToken = useRef();
    const [blockui,setBlockui] = useState({show:false});
    const [popup ,setPopup]= useState({show:false});
    const [failMSg , setFailMsg] = useState(null);
    const [domainDetails , setDomainDetails] = useState(null);
    const [loginSucess , setLoginSucess]=useState(false);
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
        if(!(accountidRef.current.value) ){
            setFailMsg("Please Enter Zephyr Account ID");
            setLoginError("ACCID")
        }
        else if(!(accessKeyRef.current.value)){
            setFailMsg("Please Enter Zephyr Access Key ");
            setLoginError("ZAKEY");

        }
        else if(!(secretKeyRef.current.value)){
            setFailMsg("Please Enter Zephyr Secret Key ");
            setLoginError("ZSKEY");

        }
        else if(!(jiraUrlRef.current.value)){
            setFailMsg("Please Enter Jira URL");
            setLoginError("JURL");
        }
        else if(!(jiraUserNameRef.current.value)){
            setFailMsg("Please Enter Jira Username");
            setLoginError("JUNAME");
        }
        else if(!(jiraAcessToken.current.value)){
            setFailMsg("Please Enter Jira Access Token");
            setLoginError("JATOKN");
        }
        else {
            setBlockui({show:true,content:'Logging...'})
            const zephyrAcKey = accessKeyRef.current.value;
            const zephyrAccNo = accountidRef.current.value;
            const zephyrJiraAccToken = jiraAcessToken.current.value;
            const zephyrJiraUserName= jiraUserNameRef.current.value;
            const zephyrJiraUrl= jiraUrlRef.current.value;
            const zephyrSecKey = secretKeyRef.current.value;
            const domainDetails = await loginToZephyr_ICE(zephyrAcKey , zephyrAccNo , zephyrJiraAccToken,zephyrJiraUrl,zephyrSecKey,zephyrJiraUserName );
            if(domainDetails.error){displayError(domainDetails.error);setBlockui({show:false});return;}
            if(domainDetails === "unavailableLocalServer"){
                setFailMsg("ICE Engine is not available, Please run the batch file and connect to the Server.")
            }
            else if(domainDetails ==="invalidcredentials"){
                setFailMsg("Invalid Credentials")
            }
            else{
            setDomainDetails(domainDetails);
            setLoginSucess(true);
        }
        setBlockui({show:false})
        }
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

    const content =()=>{
        return(
            <LoginZypher
                accountidRef={accountidRef}
                accessKeyRef={accessKeyRef}
                secretKeyRef={secretKeyRef}
                jiraUrlRef={jiraUrlRef}
                jiraUserNameRef={jiraUserNameRef}
                jiraAcessToken={jiraAcessToken}
                failMSg={failMSg}
                loginError={loginError}
            />
        )
    }
    const footer=()=>{
        return(
            <span>
                <button onClick={()=>callLogin_zephyr()}>Submit</button>
            </span>
        )
    }
        return(
            
            <Fragment>
            {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
            {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
            {viewMappedFlies === "Zephyr" ? 
                <MappedPage
                    screenType="Zephyr"
                    leftBoxTitle="Zephyr Tests"
                    rightBoxTitle="Avo Assure Scenarios"
                    mappedfilesRes={mappedfilesRes}/> :
            <>
                {/* <div className="middle_holder"> */}
                {screenType=== "Zephyr"?
                    <ZephyrContent
                        domainDetails={domainDetails}
                        setBlockui={setBlockui}
                        displayError={displayError}
                        setPopup={setPopup}
                        callViewMappedFiles={callViewMappedFiles}
                    /> :null}
                    {
                    !loginSucess? 
                        <Fragment>
                            <ModalContainer 
                                title="Zephyr Login"
                                close={()=>{dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });}}
                                content={content()}
                                footer ={footer()} 
                            />
                        </Fragment>
                        : null
                    }
                </>
            // </div>
            }
            </Fragment> 
        )
    }

export default Zephyr;