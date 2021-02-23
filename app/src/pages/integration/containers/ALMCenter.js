import React , {useRef , Fragment ,useState ,getState} from 'react';
import {ModalContainer , ScrollBar , PopupMsg ,ScreenOverlay} from '../../global';
import * as actionTypes from '../state/action.js';
import ALM from '../components/ALM.js';
import ContentAlm from'../components/ContentAlm.js';
import {viewQcMappedList_ICE,loginQCServer_ICE} from '../api.js';
import ViewMappedALM from '../components/ViewMappedALM.js';
import { useSelector ,useDispatch} from 'react-redux';


const ALMCenter =(props)=>{
const user_id = useSelector(state=> state.login.userinfo.user_id); 
const screenType = useSelector(state=>state.integration.loginPopupType);
const viewMappedFlies = useSelector(state=>state.integration.mapped_scren_type);
//const loginALM = reducer.getState().ALM_LOGIN;
const dispatch = useDispatch();
const urlRef = useRef();
const userNameRef = useRef();
const passwordRef = useRef();
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
const callLogin_ALM = async()=>{
    if(!(urlRef.current.value) ){
        setFailMsg("Please Enter URL");
        setLoginError("URL")
    }
    else if(!(userNameRef.current.value)){
        setFailMsg("Please Enter Username ");
        setLoginError("UNAME");

    }
    else if(!(passwordRef.current.value)){
        setFailMsg("Please Enter Password ");
        setLoginError("PASS");

    }
    else {
        setBlockui({show:true,content:'Logging...'})
        const qcPassword = passwordRef.current.value;
        const qcURL = urlRef.current.value;
        const qcUsername = userNameRef.current.value;
        const domainDetails = await loginQCServer_ICE(qcPassword ,qcURL ,qcUsername);
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
    //dispatch({ type: actionTypes.ALM_LOGIN, payload: false });;
    props.setAlmClicked(false)
}
const content = () =>{
        return(
            <ContentAlm
                urlRef={urlRef}
                userNameRef={userNameRef}
                passwordRef={passwordRef}
                failMSg={failMSg}
                callLogin_ALM={callLogin_ALM}
                loginError={loginError}
                
             />
        )
    }
    return(
        
        <>
        {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
        {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
        {viewMappedFlies =="ALM" ? <ViewMappedALM mappedfilesRes={mappedfilesRes}/> :
        <div className="integration_middleContent">
            {!loginSucess &&
                    <> <ModalContainer 
                            title="ALM Login"
                            close={()=>{dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });}}
                            content={content()}
                            footer ={<button onClick={()=>callLogin_ALM() }>Submit</button>} /> 
                    </> }
            { screenType=="ALM" &&
                <ALM 
                    domainDetails={domainDetails}
                    setBlockui={setBlockui}
                    displayError={displayError}
                    setPopup={setPopup}
                    callViewMappedFiles={callViewMappedFiles}
                    callExitcenter={callExitcenter}

                /> }
        </div>}
        </> 
    )
}

export default ALMCenter;