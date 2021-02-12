import React , {useRef , Fragment ,useState} from 'react';
import {ModalContainer , ScrollBar , PopupMsg ,ScreenOverlay} from '../../global';
import { useSelector } from 'react-redux';
import Zephyr from '../components/Zephyr.js';
import ViewMappedZephyr from '../components/ViewMappedZephyr.js';
import ContentZephyr from '../components/ContentZephyr.js';
import {loginToZephyr_ICE,viewZephyrMappedList_ICE} from '../api.js';
const ZephyrCenter =(props)=>{
const user_id = useSelector(state=> state.login.userinfo.user_id); 
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
        setLoginError("URL")
    }
    else if(!(accessKeyRef.current.value)){
        setFailMsg("Please Enter Zephyr Access Key ");
        setLoginError("UNAME");

    }
    else if(!(secretKeyRef.current.value)){
        setFailMsg("Please Enter Zephyr Secret Key ");
        setLoginError("PASS");

    }
    else if(!(jiraUrlRef.current.value)){
        setFailMsg("Please Enter Jira URL");
    }
    else if(!(jiraUserNameRef.current.value)){
        setFailMsg("Please Enter Jira Username");
    }
    else if(!(jiraAcessToken.current.value)){
        setFailMsg("Please Enter Jira Access Token");
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
    props.setViewMappedFiles(true)
    const userid = user_id;
    const response = await viewZephyrMappedList_ICE(userid);
    if(response.error){props.displayError(response.error);props.setBlockui({show:false});return;}
    setMappedFilesRes(response);
    setBlockui({show:false})
}
  const content =()=>{
    return(
        <ContentZephyr
            accountidRef={accountidRef}
            accessKeyRef={accessKeyRef}
            secretKeyRef={secretKeyRef}
            jiraUrlRef={jiraUrlRef}
            jiraUserNameRef={jiraUserNameRef}
            jiraAcessToken={jiraAcessToken}
            failMSg={failMSg}
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
        {props.viewmappedFiles ? <ViewMappedZephyr mappedfilesRes={mappedfilesRes}/> :
        <div className="integration_middleContent">
            <div className="middle_holder">
            {props.zephyrClicked?
                <Zephyr 
                    domainDetails={domainDetails}
                    setBlockui={setBlockui}
                    displayError={displayError}
                    setPopup={setPopup}
                    callViewMappedFiles={callViewMappedFiles}
                    

                /> :null}
                {
                    props.loginZephyr && !loginSucess? 
                    <Fragment>
                        <ModalContainer 
                            title="Zephyr Login"
                            close={()=>{props.setZephyrClicked(false);props.setloginZephyr(false);props.setFocus(null)}}
                            content={content()}
                            footer ={footer()} 
                        />
                    </Fragment>
                    : null
                }
            </div>
        </div>}
        </Fragment> 
    )
}

export default ZephyrCenter;