import React , {useRef , Fragment ,useState} from 'react';
import {ModalContainer , ScrollBar , PopupMsg ,ScreenOverlay} from '../../global';
import ALM from '../components/ALM.js';
import ContentAlm from'../components/ContentAlm.js';
import {viewQtestMappedList_ICE,loginQCServer_ICE} from '../api.js';


const ALMCenter =(props)=>{
const urlRef = useRef();
const userNameRef = useRef();
const passwordRef = useRef();
const [blockui,setBlockui] = useState({show:false});
const [popup ,setPopup]= useState({show:false});
const [failMSg , setFailMsg] = useState(null);
const [domainDetails , setDomainDetails] = useState(null);
const [loginSucess , setLoginSucess]=useState(false)

const displayError = (error) =>{
    setPopup({
      title:'ERROR',
      content:error,
      submitText:'Ok',
      show:true
    })
  }
const callLogin_ALM = async()=>{
    if(!(urlRef.current.value) ){
        setFailMsg("Please Enter URL")
    }
    else if(!(userNameRef.current.value)){
        setFailMsg("Please Enter Username ")
    }
    else if(!(passwordRef.current.value)){
        setFailMsg("Please Enter Password ")
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
            setFailMsg("invalidcredentials")
        }
        else{
        setDomainDetails(domainDetails);
        setLoginSucess(true);
    }
    setBlockui({show:false})
    }
}

const content =(props)=>{
        return(
            <ContentAlm
                urlRef={urlRef}
                userNameRef={userNameRef}
                passwordRef={passwordRef}
                failMSg={failMSg}
                callLogin_ALM={callLogin_ALM}
             />
        )
    }
    return(
        <Fragment>
        {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
        {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
        <div className="integration_middleContent">
            <div className="middle_holder">
                <ALM 
                    domainDetails={domainDetails}
                    setBlockui={setBlockui}
                    displayError={displayError}
                    setPopup={setPopup}

                />
                {
                    props.loginAlm && !loginSucess? 
                    <Fragment>
                        <ModalContainer 
                            title="ALM Login"
                            close={()=>props.setloginAlm(false)}
                            content={content()}/>
                    </Fragment>
                    : null
                }
            </div>
        </div>
        </Fragment>
    )
}

export default ALMCenter;