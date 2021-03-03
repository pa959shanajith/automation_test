import React , {useRef , useEffect ,useState } from 'react';
import {ModalContainer ,  PopupMsg ,ScreenOverlay} from '../../global';
import * as actionTypes from '../state/action.js';
import ALMContent from '../components/ALMContent.js';
import LoginALM from'../components/LoginALM.js';
import {viewQcMappedList_ICE,loginQCServer_ICE} from '../api.js';
import MappedPage from '../containers/MappedPage';
import { useSelector ,useDispatch} from 'react-redux';


const ALM = props => {
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const screenType = useSelector(state=>state.integration.screenType);
    const viewMappedFiles = useSelector(state=>state.integration.mappedScreenType);
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
        dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });;
        //props.setAlmClicked(false)
    }
    const content = () =>{
            return(
                <LoginALM
                    urlRef={urlRef}
                    userNameRef={userNameRef}
                    passwordRef={passwordRef}
                    failMSg={failMSg}
                    callLogin_ALM={callLogin_ALM}
                    loginError={loginError}
                    
                />
            )
        }
    const footer =()=>{
        return(
            <div className="submit_row">
            <span>
                    {failMSg}
            </span>
            <span>
                <button onClick={()=>callLogin_ALM()}>Submit</button>
            </span>
            </div>
        )
    } 
    return(
        
        <>
        {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
        {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
        {viewMappedFiles === "ALM" ?
            <MappedPage 
                screenType="ALM"
                leftBoxTitle="Avo Assure Scenarios"
                rightBoxTitle="ALM Testcases"
                mappedfilesRes={mappedfilesRes}
            /> :
        <>
            {!loginSucess &&
                    <> <ModalContainer 
                            title="ALM Login"
                            close={()=>{dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });}}
                            content={content()}
                            footer ={footer()} 
                        /> 
                    </> }
            { screenType==="ALM" &&
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